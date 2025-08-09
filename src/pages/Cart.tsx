import * as React from "react";
import { useContext, useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Grid,
  Divider,
  Box,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Chip,
  Stack
} from "@mui/material";
import { Add, Remove, Delete, LocalShipping } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartDetail } from "../services/API/CartApi";
import productDetailApi from "../services/API/ProductDetailApi";
import { ProductDetail } from "../services/API/ProductDetailApi";
import { toast } from 'react-toastify';
import authenticationApiService from "../services/API/AuthenticationApiService";
import { routes } from "../routes/routes";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import saveForLaterApi from "../services/API/SaveForLaterApi";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip, Fade, Zoom, Badge } from '@mui/material';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartDetail[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // GHN Shipping states
  const [ghnProvinces, setGhnProvinces] = useState<any[]>([]);
  const [ghnDistricts, setGhnDistricts] = useState<any[]>([]);
  const [ghnWards, setGhnWards] = useState<any[]>([]);
  const [ghnServices, setGhnServices] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | ''>('');
  const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
  const [selectedWard, setSelectedWard] = useState<string | ''>('');
  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Nếu đã đăng nhập, sử dụng dữ liệu từ CartContext
      if (cartContext) {
        setCartItems(cartContext.cart);
      }
    } else {
      // Nếu chưa đăng nhập, lấy dữ liệu từ localStorage
      const localCartItems = localStorage.getItem("localCart");
      if (localCartItems) {
        setCartItems(JSON.parse(localCartItems));
      } else {
        setCartItems([]);
      }
    }
  }, [isAuthenticated, cartContext]);

  // Fetch GHN provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const response = await authenticationApiService.getGHNProvinces();
        setGhnProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Không thể tải danh sách tỉnh/thành phố");
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          setLoadingDistricts(true);
          setSelectedDistrict('');
          setSelectedWard('');
          setSelectedService('');
          setShippingFee(0);
          setGhnWards([]);
          setGhnServices([]);
          
          const response = await authenticationApiService.getGHNDistricts(selectedProvince);
          
          if (!response.data || !Array.isArray(response.data)) {
            toast.error("Không có dữ liệu quận/huyện cho tỉnh/thành phố này");
            setGhnDistricts([]);
            return;
          }

          if (response.data.length === 0) {
            toast.warning("Không có quận/huyện nào cho tỉnh/thành phố này");
            setGhnDistricts([]);
            return;
          }

          setGhnDistricts(response.data);
        } catch (error) {
          console.error("Error fetching districts:", error);
          toast.error("Không thể tải danh sách quận/huyện");
          setGhnDistricts([]);
        } finally {
          setLoadingDistricts(false);
        }
      } else {
        setGhnDistricts([]);
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          setLoadingWards(true);
          setSelectedWard('');
          setSelectedService('');
          setShippingFee(0);
          setGhnServices([]);
          
          const response = await authenticationApiService.getGHNWards(selectedDistrict);
          
          if (!response.data || !Array.isArray(response.data)) {
            toast.error("Không có dữ liệu phường/xã cho quận/huyện này");
            setGhnWards([]);
            return;
          }

          if (response.data.length === 0) {
            toast.warning("Không có phường/xã nào cho quận/huyện này");
            setGhnWards([]);
            return;
          }

          setGhnWards(response.data);
        } catch (error) {
          console.error("Error fetching wards:", error);
          toast.error("Không thể tải danh sách phường/xã");
          setGhnWards([]);
        } finally {
          setLoadingWards(false);
        }
      } else {
        setGhnWards([]);
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  // Fetch services when ward changes
  useEffect(() => {
    const fetchServices = async () => {
      if (selectedWard && selectedDistrict) {
        try {
          setLoadingServices(true);
          setSelectedService('');
          setShippingFee(0);
          
          const request = {
            shop_id: 197014,
            from_district: 1454,
            to_district: selectedDistrict
          };
          
          const response = await authenticationApiService.getAvailableServices(request);
          
          if (!response.data || !Array.isArray(response.data)) {
            toast.error("Không có dữ liệu dịch vụ vận chuyển cho khu vực này");
            setGhnServices([]);
            return;
          }

          if (response.data.length === 0) {
            toast.warning("Không có dịch vụ vận chuyển nào cho khu vực này");
            setGhnServices([]);
            return;
          }

          setGhnServices(response.data);
        } catch (error) {
          console.error("Error fetching services:", error);
          toast.error("Không thể tải danh sách dịch vụ vận chuyển");
          setGhnServices([]);
        } finally {
          setLoadingServices(false);
        }
      } else {
        setGhnServices([]);
      }
    };

    fetchServices();
  }, [selectedWard, selectedDistrict]);

  // Calculate shipping fee when service changes
  useEffect(() => {
    const calculateFee = async () => {
      if (selectedService && selectedWard && selectedDistrict && cartItems.length > 0) {
        try {
          setLoadingShipping(true);
          
          const totalValue = cartItems.reduce((total, item) => total + item.product_detail.price * item.quantity, 0);
          
          const request = {
            service_id: selectedService,
            insurance_value: totalValue,
            from_district_id: 1454, // Default from district
            to_district_id: selectedDistrict,
            from_ward_code: "20109", // Default from ward code
            to_ward_code: selectedWard,
            weight: 500, // Default weight in grams
            length: 20, // Default dimensions in cm
            width: 20,
            height: 10
          };
          
          const response = await authenticationApiService.calculateShippingFee(request);
          setShippingFee(response.data.total);
        } catch (error) {
          console.error("Error calculating shipping fee:", error);
          toast.error("Không thể tính phí vận chuyển");
          setShippingFee(0);
        } finally {
          setLoadingShipping(false);
        }
      }
    };

    calculateFee();
  }, [selectedService, selectedWard, selectedDistrict, cartItems]);

  // Fetch related products when cart items change
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (cartItems.length > 0) {
        try {
          setLoadingRelated(true);
          const firstItem = cartItems[0];
          // Use product_id instead of category_id since it's not available in CartDetail
          const response = await authenticationApiService.getProductDetails({
            product_id: firstItem.product_detail.product_id,
            status: 1,
            limit: 4,
            page: 1
          });
          
          // Filter out products that are already in the cart
          const filteredProducts = response.data.list.filter(product => 
            !cartItems.some(cartItem => cartItem.product_detail.id === product.id)
          );
          
          setRelatedProducts(filteredProducts.slice(0, 4));
        } catch (error) {
          console.error("Error fetching related products:", error);
          toast.error("Không thể tải danh sách sản phẩm liên quan");
        } finally {
          setLoadingRelated(false);
        }
      }
    };

    fetchRelatedProducts();
  }, [cartItems]);

  if (!cartContext) {
    // Xử lý trường hợp context không được cung cấp
    return null;
  }

  const { removeFromCart, updateQuantity } = cartContext;

  // Handle quantity increase
  const increaseQuantity = async (id: number) => {
    try {
      const item = cartItems.find((item) => item.id === id);
      if (item) {
        await updateQuantity(id, item.quantity + 1);
      }
    } catch (error) {
      // Error is already handled in API
    }
  };

  const handleDialogOpen = (id: number) => {
    setSelectedItemId(id);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedItemId(null);
  };

  const handleRemoveConfirmed = async () => {
    if (selectedItemId !== null) {
      try {
        await removeFromCart(selectedItemId);
        handleDialogClose();
      } catch (error) {
        // Error is already handled in API
      }
    }
  };

  // Handle quantity decrease
  const decreaseQuantity = async (id: number) => {
    try {
      const item = cartItems.find((item) => item.id === id);
      if (item) {
        if (item.quantity > 1) {
          await updateQuantity(id, item.quantity - 1);
        } else {
          handleDialogOpen(id);
        }
      }
    } catch (error) {
      // Error is already handled in API
    }
  };

  // Handle remove item
  const removeItem = async (id: number) => {
    try {
      await removeFromCart(id);
      handleDialogClose();
    } catch (error) {
      // Error is already handled in API
    }
  };

  const handleSaveForLater = async (item: CartDetail) => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
        return;
      }

      const userData = JSON.parse(user);
      await saveForLaterApi.addToSaveForLater({
        user_id: userData.id,
        product_detail_id: item.product_detail.id,
        cart_detail_id: item.id
      });

      // Remove from cart after saving
      await removeFromCart(item.id);
    } catch (error) {
      console.error('Error saving for later:', error);
      toast.error('Không thể lưu sản phẩm để mua sau');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.product_detail.price * item.quantity, 0);
  const finalTotal = totalPrice + shippingFee;

  const handleCheckout = () => {
    if(isAuthenticated) {
      navigate(routes.Checkout);
    } else {
      toast.error("Vui lòng đăng nhập để thanh toán");
      navigate(routes.Login);
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 4,
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        pb: 2
      }}>
        <ShoppingBagIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Giỏ hàng của bạn
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {cartItems.length} sản phẩm
          </Typography>
        </Box>
      </Box>

      {cartItems.length === 0 ? (
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'background.default'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Giỏ hàng trống</Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            startIcon={<ShoppingBagIcon />}
            sx={{
              borderRadius: 2,
              py: 1,
              px: 3,
              background: 'primary.main',
              '&:hover': {
                background: 'primary.dark',
              }
            }}
          >
            Tiếp tục mua sắm
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Cart Items Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
              {cartItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <Box sx={{ 
                    display: "flex", 
                    p: 2,
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}>
                    <Link 
                      to={`/product/${item.product_detail.product_id}`} 
                      state={{
                        colorId: item.product_detail.color_id,
                        sizeId: item.product_detail.size_id,
                        materialId: item.product_detail.material_id,
                        selectedProduct: item.product_detail
                      }}
                      style={{ textDecoration: 'none' }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 1
                          }}
                          image={item.product_detail.image_url}
                          alt={item.product_detail.name}
                        />
                        {item.product_detail.stock <= 5 && (
                          <Chip
                            label={`Còn ${item.product_detail.stock} sản phẩm`}
                            color="warning"
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 5,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    </Link>

                    <Box sx={{ 
                      flexGrow: 1, 
                      ml: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Box>
                        <Link 
                          to={`/product/${item.product_detail.product_id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Typography 
                            variant="h6" 
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              wordWrap: 'break-word',
                              lineHeight: 1.2,
                              height: '2.4em',
                              fontWeight: 500,
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                          >
                            {item.product_detail.name}
                          </Typography>
                        </Link>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip 
                            label={item.product_detail.color} 
                            size="small"
                            sx={{ bgcolor: 'grey.100' }}
                          />
                          <Chip 
                            label={item.product_detail.size} 
                            size="small"
                            sx={{ bgcolor: 'grey.100' }}
                          />
                          <Chip 
                            label={item.product_detail.material} 
                            size="small"
                            sx={{ bgcolor: 'grey.100' }}
                          />
                        </Stack>
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2
                      }}>
                        <Typography 
                          variant="h6" 
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        >
                          {formatCurrency(item.product_detail.price * item.quantity)}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <IconButton 
                              onClick={() => decreaseQuantity(item.id)}
                              size="small"
                              sx={{ borderRadius: 0 }}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Typography 
                              sx={{ 
                                px: 2,
                                fontWeight: 600,
                                userSelect: 'none'
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              onClick={() => increaseQuantity(item.id)}
                              size="small"
                              sx={{ borderRadius: 0 }}
                              disabled={item.quantity >= item.product_detail.stock}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Paper>

                          {isAuthenticated && (
                            <Tooltip title="Lưu để mua sau">
                              <IconButton 
                                onClick={() => handleSaveForLater(item)}
                                size="small"
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': {
                                    bgcolor: 'primary.lighter'
                                  }
                                }}
                              >
                                <BookmarkAddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Xóa sản phẩm">
                            <IconButton 
                              onClick={() => handleDialogOpen(item.id)}
                              size="small"
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  bgcolor: 'error.lighter'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {index < cartItems.length - 1 && (
                    <Divider />
                  )}
                </React.Fragment>
              ))}
            </Paper>
          </Grid>

          {/* Summary and Shipping Section */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Order Summary */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Tổng quan đơn hàng
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    color: 'text.secondary'
                  }}>
                    <Typography>Tổng tiền sản phẩm</Typography>
                    <Typography>{formatCurrency(totalPrice)}</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    color: 'text.secondary'
                  }}>
                    <Typography>Phí vận chuyển</Typography>
                    <Typography>
                      {shippingFee > 0 ? formatCurrency(shippingFee) : '---'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Tổng thanh toán
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {formatCurrency(finalTotal)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCheckout}
                    disabled={!selectedService}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'primary.main',
                      '&:hover': {
                        background: 'primary.dark',
                      }
                    }}
                  >
                    {selectedService ? 'Tiến hành thanh toán' : 'Vui lòng chọn phương thức vận chuyển'}
                  </Button>
                </Stack>
              </Paper>

              {/* Shipping Calculator */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2 
                }}>
                  <LocalShipping color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tính phí vận chuyển
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <FormControl>
                    <InputLabel>Tỉnh/Thành phố</InputLabel>
                    <Select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value as number)}
                      label="Tỉnh/Thành phố"
                      disabled={loadingProvinces}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Chọn tỉnh/thành phố</em>
                      </MenuItem>
                      {ghnProvinces.map((province) => (
                        <MenuItem key={province.ProvinceID} value={province.ProvinceID}>
                          {province.ProvinceName}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingProvinces && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CircularProgress size={16} />
                        <FormHelperText>Đang tải...</FormHelperText>
                      </Box>
                    )}
                  </FormControl>

                  <FormControl>
                    <InputLabel>Quận/Huyện</InputLabel>
                    <Select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value as number)}
                      label="Quận/Huyện"
                      disabled={!selectedProvince || loadingDistricts}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Chọn quận/huyện</em>
                      </MenuItem>
                      {ghnDistricts.map((district) => (
                        <MenuItem key={district.DistrictID} value={district.DistrictID}>
                          {district.DistrictName}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingDistricts && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CircularProgress size={16} />
                        <FormHelperText>Đang tải...</FormHelperText>
                      </Box>
                    )}
                  </FormControl>

                  <FormControl>
                    <InputLabel>Phường/Xã</InputLabel>
                    <Select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value as string)}
                      label="Phường/Xã"
                      disabled={!selectedDistrict || loadingWards}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Chọn phường/xã</em>
                      </MenuItem>
                      {ghnWards.map((ward) => (
                        <MenuItem key={ward.WardCode} value={ward.WardCode}>
                          {ward.WardName}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingWards && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CircularProgress size={16} />
                        <FormHelperText>Đang tải...</FormHelperText>
                      </Box>
                    )}
                  </FormControl>

                  <FormControl>
                    <InputLabel>Dịch vụ vận chuyển</InputLabel>
                    <Select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value as number)}
                      label="Dịch vụ vận chuyển"
                      disabled={!selectedWard || loadingServices}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Chọn dịch vụ vận chuyển</em>
                      </MenuItem>
                      {Array.isArray(ghnServices) && ghnServices.length > 0 ? (
                        ghnServices.map((service) => (
                          <MenuItem key={service.service_id} value={service.service_id}>
                            {service.short_name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          <em>Không có dịch vụ vận chuyển</em>
                        </MenuItem>
                      )}
                    </Select>
                    {loadingServices && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CircularProgress size={16} />
                        <FormHelperText>Đang tải...</FormHelperText>
                      </Box>
                    )}
                  </FormControl>

                  {loadingShipping && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">
                        Đang tính phí vận chuyển...
                      </Typography>
                    </Box>
                  )}

                  {shippingFee > 0 && !loadingShipping && (
                    <Alert 
                      severity="info"
                      icon={<InfoIcon />}
                      sx={{ 
                        borderRadius: 1,
                        '& .MuiAlert-message': {
                          width: '100%'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <Typography variant="body2">Phí vận chuyển:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(shippingFee)}
                        </Typography>
                      </Box>
                    </Alert>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Related Products Section - Keep existing code but enhance styling */}
      {cartItems.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::after': {
                content: '""',
                flex: 1,
                height: 2,
                backgroundColor: 'primary.main',
                opacity: 0.2,
                borderRadius: 1
              }
            }}
          >
            🔥 Có thể bạn cũng thích
          </Typography>
          
          <Grid container spacing={2}>
            {loadingRelated ? (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Grid>
            ) : relatedProducts.length > 0 ? (
              relatedProducts.map((product) => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Link 
                      to={`/product/${product.product_id}`}
                      state={{
                        colorId: product.color_id,
                        sizeId: product.size_id,
                        materialId: product.material_id,
                        selectedProduct: product
                      }}
                      style={{ textDecoration: 'none' }}
                    >
                      <CardMedia 
                        component="img" 
                        height="200"
                        image={product.image_url || '/placeholder.png'} 
                        alt={product.name}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </Link>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordWrap: 'break-word',
                          lineHeight: 1.2,
                          height: '2.4em',
                          mb: 1,
                          fontWeight: 500
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography 
                        color="primary" 
                        variant="h6"
                        sx={{ fontWeight: 600 }}
                      >
                        {formatCurrency(product.price)}
                      </Typography>
                      <Button 
                        variant="contained"
                        fullWidth
                        component={Link}
                        to={`/product/${product.product_id}`}
                        state={{
                          colorId: product.color_id,
                          sizeId: product.size_id,
                          materialId: product.material_id,
                          selectedProduct: product
                        }}
                        disabled={product.stock <= 0}
                        sx={{ 
                          mt: 2,
                          borderRadius: 1,
                          textTransform: 'none'
                        }}
                      >
                        {product.stock > 0 ? "Xem chi tiết" : "Hết hàng"}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  textAlign="center"
                >
                  Không tìm thấy sản phẩm liên quan
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Enhanced Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Delete color="error" />
          Xác nhận xóa sản phẩm
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleRemoveConfirmed} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 1 }}
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
