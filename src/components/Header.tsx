import * as React from "react";
import { useState, useEffect, useContext } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Button,
  MenuItem,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  Badge
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import { debounce } from "lodash";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { routes } from "../routes/routes";
import authenticationApiService from '../services/API/AuthenticationApiService';

interface ProductDetailResponse {
  id: number;
  name: string;
  product_id: number;
  color_id: number;
  color: string;
  size_id: number;
  size: string;
  material_id: number;
  material: string;
  brand_id: number;
  brand: string;
  category_id: number;
  category: string;
  stock: number;
  price: number;
  image_url: string;
  status: number;
}

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cartAnchorEl, setCartAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const [userAvatar, setUserAvatar] = useState<string>('');

  useEffect(() => {
    // Lấy thông tin user từ localStorage khi component mount
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUserAvatar(userData.avatar_url || '');
    }
  }, []);

  // Fetch suggestions using getProductDetails API
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await authenticationApiService.getProductDetails({
        key_search: query,
        status: 1,
        limit: 5 // Limit to 5 suggestions
      });
      
      if (response.data?.list) {
        // Transform API response to ProductDetailResponse
        const transformedSuggestions = response.data.list.map(detail => {
          const productDetail = detail as any;
          return {
            id: productDetail.id,
            name: productDetail.name,
            product_id: productDetail.product_id,
            color_id: productDetail.color_id,
            color: productDetail.color,
            size_id: productDetail.size_id,
            size: productDetail.size,
            material_id: productDetail.material_id,
            material: productDetail.material,
            brand_id: productDetail.brand_id,
            brand: productDetail.brand,
            category_id: productDetail.category_id,
            category: productDetail.category,
            stock: productDetail.stock,
            price: productDetail.price,
            image_url: productDetail.image_url,
            status: productDetail.status
          };
        });
        setSuggestions(transformedSuggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce API call
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchTerm]);

  const handleSearchClick = (suggestion: ProductDetailResponse) => {
    navigate(`/product/${suggestion.product_id}`, {
      state: {
        colorId: suggestion.color_id,
        sizeId: suggestion.size_id,
        materialId: suggestion.material_id
      }
    });
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCartMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCartAnchorEl(event.currentTarget);
  };

  const handleCartMenuClose = () => {
    setCartAnchorEl(null);
  };

  const handleLogout = () => {
    // Xóa dữ liệu giỏ hàng từ localStorage
    localStorage.removeItem('localCart');
    localStorage.removeItem('cartId');
    
    // Reset cart state
    if (cartContext) {
      cartContext.setCart([]);
    }
    
    // Gọi hàm logout từ AuthContext
    logout();
    handleMenuClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (!cartContext) {
    // Xử lý trường hợp context không được cung cấp
    return null;
  }

  const { cart } = cartContext;

  const cartItemCount =
    cart.length > 0
      ? cart.reduce((count, item) => {
          if (!item) return count;
          return count + (item.quantity || 0);
        }, 0)
      : 0;
  const totalPrice = cart.reduce((total, item) => {
    if (!item || !item.product_detail) return total;
    return total + (item.product_detail.price * item.quantity);
  }, 0);

  return (
    <AppBar
      position="sticky"
      sx={{ backgroundColor: "white", color: "black", boxShadow: 1 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" component={RouterLink} to={routes.Home} sx={{ textDecoration: 'none' }}>
          <img src="https://firebasestorage.googleapis.com/v0/b/uploadimage-aa334.appspot.com/o/logo1.jpg?alt=media" alt="Logo" style={{ height: 40,borderRadius: '50%' }} />
          <Typography variant="h6" fontWeight="bold" ml={1}>
            WEB SUNNY
          </Typography>
        </Box>

        {/* Thanh tìm kiếm */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', position: 'relative' }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: '50%',
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                padding: '10px 14px',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: isLoading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              )
            }}
          />
          {/* Gợi ý tìm kiếm */}
          {suggestions.length > 0 && searchTerm && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: '25%',
                right: '25%',
                zIndex: 1000,
                mt: 1,
                maxHeight: '400px',
                overflow: 'auto'
              }}
            >
              <List>
                {suggestions.map((suggestion) => (
                  <ListItem
                    key={suggestion.id}
                    onClick={() => handleSearchClick(suggestion)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      },
                      display: 'flex',
                      gap: 2,
                      py: 1
                    }}
                  >
                    <Box
                      component="img"
                      src={suggestion.image_url || '/placeholder-image.jpg'}
                      alt={suggestion.name}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {suggestion.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                              {suggestion.price.toLocaleString('vi-VN')}đ
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {suggestion.color} - {suggestion.size} - {suggestion.material}
                            </Typography>
                          </>
                        }
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Giỏ hàng + User */}
        <Box display="flex" alignItems="center">
          {/* Giỏ hàng */}
          <Box
            sx={{ position: 'relative' }}
            onMouseEnter={handleCartMenuOpen}
            onMouseLeave={handleCartMenuClose}
          >
            <IconButton sx={{ mr: 2 }}>
              <Badge badgeContent={cartItemCount} color="error" showZero>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Cart Menu */}
            <Menu
              anchorEl={cartAnchorEl}
              open={Boolean(cartAnchorEl)}
              onClose={handleCartMenuClose}
              PaperProps={{
                onMouseEnter: () => {},
                onMouseLeave: handleCartMenuClose,
                sx: {
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: 300,
                  maxHeight: 400,
                  overflow: 'auto',
                  mt: 1,
                  boxShadow: 3,
                },
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {cart.length === 0 ? (
                <MenuItem disabled>
                  <Typography>Giỏ hàng trống</Typography>
                </MenuItem>
              ) : (
                <Box>
                  {cart.map((item, index) => (
                    item && item.product_detail ? (
                      <MenuItem key={index} sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <img 
                            src={item.product_detail.image_url} 
                            alt={item.product_detail.name}
                            style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 'medium',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {item.product_detail.name}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                    variant="body2"
                                    color="primary"
                                    sx={{
                                      fontWeight: 'bold',
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.product_detail.price.toLocaleString('vi-VN')}đ
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.product_detail.color} - {item.product_detail.size} - {item.product_detail.material}
                                  </Typography>
                                </>
                              }
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              x{item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ) : null
                  ))}
                  <Divider />
                  <MenuItem sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">Tổng tiền:</Typography>
                    <Typography variant="subtitle1" color="primary">
                      {formatCurrency(totalPrice)}
                    </Typography>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      variant="contained"
                      fullWidth
                      component={RouterLink}
                      to={routes.Cart}
                      onClick={handleCartMenuClose}
                    >
                      Xem giỏ hàng
                    </Button>
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>

          {/* Nếu chưa login */}
          {!isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to={routes.Login}
                variant="outlined"
                color="primary"
                sx={{ mr: 1 }}
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                to={routes.Register}
                variant="contained"
                color="primary"
              >
                Sign Up
              </Button>
            </>
          ) : (
            /* Nếu đã login */
            <>
              <IconButton onClick={handleMenuOpen}>
                <Avatar 
                  src={userAvatar}
                  sx={{ bgcolor: "primary.main" }}
                >
                  {userAvatar ? '' : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                  <AccountCircleIcon sx={{ mr: 1 }} /> Tài khoản
                </MenuItem>
                <MenuItem component={RouterLink} to={routes.OrderHistory} onClick={handleMenuClose}>
                  <HistoryIcon sx={{ mr: 1 }} /> Lịch sử đơn hàng
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
