import React, { useState, useContext, useEffect } from "react";
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
  MenuItem,
  Select,
} from "@mui/material";
import { CartContext } from "../context/CartContext";
import VoucherBlock from "../components/VoucherBlock";
import voucherApi, { VoucherResponse } from "../services/API/VoucherApi";
import { toast } from "react-toastify";
import orderApi from "../services/API/OrderApi";
import { useNavigate } from "react-router-dom";

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
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponse | null>(null);
  const [discount, setDiscount] = useState(0);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  // Fetch vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await voucherApi.findAll({
          status: 1,
          page: 1,
          limit: 10
        });
        setVouchers(response.data.list);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        toast.error("Không thể tải danh sách voucher");
      }
    };
    fetchVouchers();
  }, []);

  const calculateSubTotal = () => {
    return cart.reduce((sum, item) => {
      if (!item || !item.product_detail) return sum;
      return sum + (item.product_detail.price * item.quantity);
    }, 0);
  };

  const handleVoucherSelect = async (voucher: VoucherResponse | null) => {
    setSelectedVoucher(voucher);
    if (!voucher) {
      setDiscount(0);
      return;
    }

    try {
      const subtotal = calculateSubTotal();
      const response = await voucherApi.apply(voucher.id, {
        total_amount: subtotal
      });
      
      setDiscount(response.data.amount_voucher);
      toast.success("Áp dụng voucher thành công!");
    } catch (error) {
      console.error("Error applying voucher:", error);
      toast.error("Không thể áp dụng voucher");
      setSelectedVoucher(null);
      setDiscount(0);
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubTotal();
    return subtotal - discount;
  };

  const handleSubmit = async () => {
    try {
      // Create order request
      const orderRequest = {
        price: calculateSubTotal(),
        discount_amount: discount,
        total_price: calculateTotal(),
        payment_method: paymentMethod === "cod" ? 1 : 2 // 1 for COD, 2 for online payment
      };

      // Create order
      const response = await orderApi.create(orderRequest);

      if (paymentMethod === "cod") {
        // For COD, redirect to success page directly
        navigate("/payment-success");
        toast.success("Đặt hàng thành công!");
      } else {
        // For online payment, redirect to payment URL
        if (response.data) {
          window.location.href = response.data;
        } else {
          toast.error("Không thể tạo link thanh toán!");
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Đã có lỗi xảy ra khi đặt hàng!");
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <Container sx={{ mb: 4, mt: 4 }}>
        <Typography variant="h5" align="center">
          Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mb: 4, mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Thanh toán
      </Typography>

      <Grid container spacing={3}>
        {/* Danh sách sản phẩm */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm trong đơn hàng
            </Typography>
            <List>
              {cart.map((item) => (
                item && item.product_detail && (
                  <ListItem key={item.id}>
                    <Avatar 
                      src={item.product_detail.image_url} 
                      alt={item.product_detail.name}
                      sx={{ width: 50, height: 50, mr: 2 }} 
                    />
                    <ListItemText 
                      primary={item.product_detail.name}
                      secondary={`Số lượng: ${item.quantity}`} 
                    />
                    <Typography>
                      {(item.product_detail.price * item.quantity).toLocaleString()} đ
                    </Typography>
                  </ListItem>
                )
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            
            {/* Voucher selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chọn Voucher
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedVoucher?.id || ""}
                  onChange={(e) => {
                    const selected = vouchers.find(v => v.id === e.target.value);
                    handleVoucherSelect(selected || null);
                  }}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Không sử dụng voucher</em>
                  </MenuItem>
                  {vouchers.map((voucher) => (
                    <MenuItem key={voucher.id} value={voucher.id}>
                      {voucher.code} - Giảm {voucher.discount_type === 1 ? 
                        `${voucher.discount_value}%` : 
                        `${voucher.discount_value.toLocaleString()}đ`
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Tổng tiền */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" align="right">
                Tạm tính: {calculateSubTotal().toLocaleString()} đ
              </Typography>
              {discount > 0 && (
                <Typography color="error" variant="subtitle1" align="right">
                  Giảm giá: -{discount.toLocaleString()} đ
                </Typography>
              )}
              <Typography variant="h6" align="right">
                Tổng tiền: {calculateTotal().toLocaleString()} đ
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Thông tin giao hàng */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin giao hàng
            </Typography>

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

      {/* Phương thức thanh toán */}
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

      {/* Nút Xác nhận thanh toán */}
      <Box textAlign="center" mt={3}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Xác nhận thanh toán
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout;
