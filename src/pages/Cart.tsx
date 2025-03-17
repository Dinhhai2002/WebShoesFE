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
  DialogTitle
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartDetail } from "../services/API/CartApi";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartDetail[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Nếu đã đăng nhập, sử dụng dữ liệu từ CartContext
      if (cartContext) {
        setCartItems(cartContext.cart);
      }
    } else {
      // Nếu chưa đăng nhập, lấy dữ liệu từ localStorage
      const localCartItems = localStorage.getItem("cart_items");
      if (localCartItems) {
        setCartItems(JSON.parse(localCartItems));
      } else {
        setCartItems([]);
      }
    }
  }, [isAuthenticated, cartContext]);

  if (!cartContext) {
    // Xử lý trường hợp context không được cung cấp
    return null;
  }

  const { removeFromCart, updateQuantity } = cartContext;

  // Handle quantity increase
  const increaseQuantity = (id: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
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

  const handleRemoveConfirmed = () => {
    if (selectedItemId !== null) {
      removeFromCart(selectedItemId);
    }
    handleDialogClose();
  };

  const decreaseQuantity = (id: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(id, item.quantity - 1);
      } else {
        handleDialogOpen(id);
      }
    }
  };

  const removeItem = (id: number) => {
    handleDialogOpen(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.product_detail.price * item.quantity, 0);
  const shippingFee = totalPrice >= 300 ? 0 : 15;
  const finalTotal = totalPrice + shippingFee;

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
                      <IconButton onClick={() => removeItem(item.id)} color="error">
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
                onClick={() => navigate("/checkout")}
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
      <Typography variant="h5" sx={{ mt: 5 }}>
        🔥 You Might Also Like
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {[
          { id: 3, name: "Puma RS-X", price: 140, image: "https://imgwebikenet-8743.kxcdn.com/catalogue/10063/bl420mru-3_s.jpg" },
          { id: 4, name: "Jordan 1 High", price: 180, image: "https://imgwebikenet-8743.kxcdn.com/catalogue/10063/bl420mru-3_s.jpg" },
        ].map((product) => (
          <Grid item xs={6} md={3} key={product.id}>
            <Card>
              <CardMedia component="img" height="140" image={product.image} alt={product.name} />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>${product.price}</Typography>
                <Button variant="contained" fullWidth>
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Cart;
