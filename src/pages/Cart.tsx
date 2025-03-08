import React, { useContext, useState } from "react";
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
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

// Interface for cart items
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    // Xử lý trường hợp context không được cung cấp
    return null;
  }

  const { cart, removeFromCart, updateQuantity } = cartContext;

  // Handle quantity increase
  const increaseQuantity = (id: number) => {
    const item = cart.find((item) => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const decreaseQuantity = (id: number) => {
    const item = cart.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const removeItem = (id: number) => {
    removeFromCart(id);
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = totalPrice >= 300 ? 0 : 15;
  const finalTotal = totalPrice + shippingFee;

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🛒 Your Shopping Cart
      </Typography>

      {cart.length === 0 ? (
        <Typography variant="h6">Your cart is empty.</Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Product Column */}
          <Grid item xs={12} md={8}>
            {cart.map((item) => (
              <Card key={item.id} sx={{ display: "flex", mb: 2, p: 2 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 100, height: 100, objectFit: "cover" }}
                  image={item.image}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography color="text.secondary">
                    ${item.price} x {item.quantity}
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

          {/* Summary Column */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Order Summary</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>Product Total: ${totalPrice}</Typography>
              <Typography>Shipping Fee: ${shippingFee}</Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                Total: ${finalTotal}
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
          </Grid>
        </Grid>
      )}

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
