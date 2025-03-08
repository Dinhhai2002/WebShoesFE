import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Divider,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Avatar,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VoucherBlock from "../components/VoucherBlock";

// Danh sách sản phẩm (thêm hình ảnh)
const mockCartItems = [
  { id: 1, name: "Găng tay bảo hộ", price: 250000, quantity: 2, img: "https://via.placeholder.com/50" },
  { id: 2, name: "Áo khoác moto", price: 750000, quantity: 1, img: "https://via.placeholder.com/50" },
  { id: 3, name: "Mũ bảo hiểm", price: 500000, quantity: 1, img: "https://via.placeholder.com/50" },
];

// Địa chỉ mặc định
const defaultAddress = {
  fullName: "Nguyễn Văn A",
  address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
  phone: "0901234567",
  email: "nguyenvana@example.com",
};

const Checkout: React.FC = () => {
  const [formData, setFormData] = useState(defaultAddress);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);

  const calculateTotal = () => {
    const total = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return total - discount;
  };

  const handleApplyVoucher = () => {
    if (voucher === "DISCOUNT10") {
      setDiscount(100000);
      alert("Áp dụng voucher thành công! Giảm 100.000đ");
    } else {
      setDiscount(0);
      alert("Mã giảm giá không hợp lệ!");
    }
  };

  const handleSubmit = () => {
    alert(`Đơn hàng đã được đặt thành công! Phương thức thanh toán: ${paymentMethod.toUpperCase()}`);
  };

  return (
    <Container sx={{ mb : 4, mt : 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Thanh toán
      </Typography>

      <Grid container spacing={3}>
        {/* 🛍 Danh sách sản phẩm */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm trong đơn hàng
            </Typography>
            <List>
              {mockCartItems.map((item) => (
                <ListItem key={item.id}>
                  <Avatar src={item.img} alt={item.name} sx={{ width: 50, height: 50, mr: 2 }} />
                  <ListItemText primary={item.name} secondary={`Số lượng: ${item.quantity}`} />
                  <Typography>{(item.price * item.quantity).toLocaleString()} đ</Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            
            {/* Nhập & áp dụng mã giảm giá */}
            {/* <Box display="flex" alignItems="center" gap={1}>
              <LocalOfferIcon color="primary" />
              <TextField
                label="Nhập mã giảm giá"
                variant="outlined"
                size="small"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
              />
              <Button variant="contained" color="secondary" onClick={handleApplyVoucher}>
                Áp dụng
              </Button>
            </Box> */}
			<VoucherBlock onApply={(code, discount) => {
				setVoucher(code);
				setDiscount(discount);
				}} />

            {/* Tổng tiền */}
            <Typography variant="h6" align="right" sx={{ mt: 2 }}>
              {discount > 0 && (
                <Typography color="error" variant="body1">
                  Giảm giá: -{discount.toLocaleString()} đ
                </Typography>
              )}
              Tổng tiền: {calculateTotal().toLocaleString()} đ
            </Typography>
          </Paper>
        </Grid>

        {/* 📦 Thông tin giao hàng */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin giao hàng
            </Typography>

            {/* Chọn địa chỉ mặc định hoặc nhập địa chỉ mới */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Chọn địa chỉ</FormLabel>
              <RadioGroup
                row
                value={useDefaultAddress ? "default" : "custom"}
                onChange={(e) => setUseDefaultAddress(e.target.value === "default")}
              >
                <FormControlLabel value="default" control={<Radio />} label="Dùng địa chỉ mặc định" />
                <FormControlLabel value="custom" control={<Radio />} label="Nhập địa chỉ mới" />
              </RadioGroup>
            </FormControl>

            {!useDefaultAddress && (
              <>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  margin="normal"
                />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 🏦 Phương thức thanh toán */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Phương thức thanh toán
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <FormControlLabel value="cod" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
            <FormControlLabel value="online" control={<Radio />} label="Thanh toán online (VNPay, Momo, ZaloPay)" />
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* ✅ Nút Xác nhận thanh toán */}
      <Box textAlign="center" mt={3}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Xác nhận thanh toán
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout;
