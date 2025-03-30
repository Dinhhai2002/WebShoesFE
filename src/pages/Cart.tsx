import React, { useContext, useState, useEffect } from "react";
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
  CircularProgress
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartDetail } from "../services/API/CartApi";
import productDetailApi from "../services/API/ProductDetailApi";
import { ProductDetail } from "../services/API/ProductDetailApi";
import { toast } from 'react-toastify';
import authenticationApiService from "../services/API/AuthenticationApiService";
import { routes } from "../routes/routes";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartDetail[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

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

  // Fetch related products when cart items change
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (cartItems.length > 0) {
        try {
          setLoadingRelated(true);
          const firstItem = cartItems[0];
          const response = await authenticationApiService.getProductDetails({
            category_id: firstItem.product_detail.category_id,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.product_detail.price * item.quantity, 0);
  const shippingFee = totalPrice >= 1000000 ? 50000 : 30000; // 50,000 for orders >= 1 million, 30,000 for others
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
    <Container sx={{ mt: 4, mb:4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🛒 Your Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Typography variant="h6">Your cart is empty.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {/* Product Column */}
            <Grid item xs={12}>
              {cartItems.map((item) => (
                <Card key={item.id} sx={{ display: "flex", mb: 2, p: 2 }}>
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
                    <CardMedia
                      component="img"
                      sx={{ width: 100, height: 100, objectFit: "cover" }}
                      image={item.product_detail.image_url}
                      alt={item.product_detail.name}
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
                        width: '40%'
                      }}
                    >
                      {item.product_detail.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {formatCurrency(item.product_detail.price)} x {item.quantity}
                    </Typography>
                    <CardActions>
                      <IconButton onClick={() => decreaseQuantity(item.id)}>
                        <Remove />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton onClick={() => increaseQuantity(item.id)}>
                        <Add />
                      </IconButton>
                      <IconButton onClick={() => handleDialogOpen(item.id)} color="error">
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>

          {/* Summary Column */}
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Order Summary</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>Product Total: {formatCurrency(totalPrice)}</Typography>
              <Typography>Shipping Fee: {formatCurrency(shippingFee)}</Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                Total: {formatCurrency(finalTotal)}
              </Typography>

              {/* Checkout Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </Paper>
          </Box>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Xác nhận xóa sản phẩm khỏi giỏ hàng"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có muốn xóa sản phẩm này khỏi giỏ hàng hay không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Hủy
          </Button>
          <Button onClick={handleRemoveConfirmed} color="primary" autoFocus>
            Có
          </Button>
        </DialogActions>
      </Dialog>

      {/* Related Products */}
      {cartItems.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 5 }}>
            🔥 You Might Also Like
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {loadingRelated ? (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Grid>
            ) : relatedProducts.length > 0 ? (
              relatedProducts.map((product) => (
                <Grid item xs={6} md={3} key={product.id}>
                  <Card>
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
                        height="140" 
                        image={product.image_url || '/placeholder.png'} 
                        alt={product.name} 
                      />
                    </Link>
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordWrap: 'break-word',
                          lineHeight: 1.2,
                          height: '2.4em'
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(product.price)}
                      </Typography>
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
                      <Button 
                        variant="contained" 
                        fullWidth 
                        // onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        sx={{ mt: 1 }}
                      >
                        {/* {product.stock > 0 ? "Add to Cart" : "Out of Stock"} */}
                        Chi tiết sản phẩm
                      </Button> 
                    </Link>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Không tìm thấy sản phẩm liên quan
                </Typography>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Cart;
