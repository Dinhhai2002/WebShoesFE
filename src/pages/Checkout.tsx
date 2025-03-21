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
  FormHelperText,
  InputLabel,
} from "@mui/material";
import { CartContext } from "../context/CartContext";
import VoucherBlock from "../components/VoucherBlock";
import voucherApi, { VoucherResponse } from "../services/API/VoucherApi";
import { toast } from "react-toastify";
import orderApi from "../services/API/OrderApi";
import addressBookApi, { AddressBook, AddressBookRequest } from "../services/API/AddressBookApi";
import authenticationApiService from "../services/API/AuthenticationApiService";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const [addresses, setAddresses] = useState<AddressBook[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressBook | null>(null);
  const [newAddress, setNewAddress] = useState<AddressBookRequest>({
    full_name: "",
    phone: "",
    ward_id: 0,
    ward_name: "",
    district_id: 0,
    district_name: "",
    city_id: 0,
    city_name: "",
    full_address: "",
    is_default: 0
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponse | null>(null);
  const [discount, setDiscount] = useState(0);
  const { cart, resetCart } = useContext(CartContext);
  const navigate = useNavigate();

  // States for location selection
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await authenticationApiService.getAllCity();
      setCities(response.data);
    } catch (error: any) {
      toast.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const fetchDistricts = async (cityId: number) => {
    try {
      const response = await authenticationApiService.findDistrictByCityId(cityId);
      setDistricts(response.data);
      setWards([]); // Reset wards when city changes
    } catch (error: any) {
      toast.error('Không thể tải danh sách quận/huyện');
    }
  };

  const fetchWards = async (districtId: number) => {
    try {
      const response = await authenticationApiService.findWardByDistrictId(districtId);
      setWards(response.data);
    } catch (error: any) {
      toast.error('Không thể tải danh sách phường/xã');
    }
  };

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await addressBookApi.findAll({
          keySearch: "",
          status: 1,
          page: 1,
          limit: 10
        });
        setAddresses(response.data.list);
        // Set default address if exists
        const defaultAddress = response.data.list.find(addr => addr.is_default === 1);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Không thể tải danh sách địa chỉ");
      }
    };
    fetchAddresses();
  }, []);

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name === 'city_id' && value) {
      const selectedCity = cities.find(city => city.id === value);
      setNewAddress(prev => ({
        ...prev,
        city_id: Number(value),
        city_name: selectedCity?.name || "",
        district_id: 0,
        district_name: "",
        ward_id: 0,
        ward_name: ""
      }));
      fetchDistricts(Number(value));
    } else if (name === 'district_id' && value) {
      const selectedDistrict = districts.find(district => district.id === value);
      setNewAddress(prev => ({
        ...prev,
        district_id: Number(value),
        district_name: selectedDistrict?.name || "",
        ward_id: 0,
        ward_name: ""
      }));
      fetchWards(Number(value));
    } else if (name === 'ward_id' && value) {
      const selectedWard = wards.find(ward => ward.id === value);
      setNewAddress(prev => ({
        ...prev,
        ward_id: Number(value),
        ward_name: selectedWard?.name || ""
      }));
    } else {
      setNewAddress(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (addressErrors[name as string]) {
      setAddressErrors(prev => ({
        ...prev,
        [name as string]: ""
      }));
    }
  };

  const validateAddress = () => {
    const errors: { [key: string]: string } = {};
    
    if (!newAddress.full_name) errors.full_name = "Vui lòng nhập họ tên";
    if (!newAddress.phone) errors.phone = "Vui lòng nhập số điện thoại";
    if (!newAddress.ward_id) errors.ward_id = "Vui lòng chọn phường/xã";
    if (!newAddress.district_id) errors.district_id = "Vui lòng chọn quận/huyện";
    if (!newAddress.city_id) errors.city_id = "Vui lòng chọn tỉnh/thành phố";
    if (!newAddress.full_address) errors.full_address = "Vui lòng nhập địa chỉ chi tiết";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      let addressId: number;

      if (useNewAddress) {
        if (!validateAddress()) {
          return;
        }

        // Create new address
        const addressResponse = await addressBookApi.create(newAddress);
        addressId = addressResponse.data.id;
      } else {
        if (!selectedAddress) {
          toast.error("Vui lòng chọn địa chỉ giao hàng");
          return;
        }
        addressId = selectedAddress.id;
      }

      // Create order request
      const orderRequest = {
        price: calculateSubTotal(),
        discount_amount: discount,
        total_price: calculateTotal(),
        payment_method: paymentMethod === "cod" ? 1 : 2, // 1 for COD, 2 for online payment
        address_id: addressId
      };

      // Create order
      const response = await orderApi.create(orderRequest);

      if (paymentMethod === "cod") {
        // Reset cart after successful order creation
        resetCart();
        // For COD, redirect to success page with cod=true parameter
        navigate("/payment-success?cod=true");
      } else {
        // For online payment, redirect to payment URL
        if (typeof response.data === 'string') {
          window.location.href = response.data;
        } else {
          toast.error("Không thể tạo link thanh toán!");
        }
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi đặt hàng!");
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
                value={useNewAddress ? "new" : "existing"}
                onChange={(e) => setUseNewAddress(e.target.value === "new")}
              >
                <FormControlLabel value="existing" control={<Radio />} label="Chọn địa chỉ có sẵn" />
                <FormControlLabel value="new" control={<Radio />} label="Thêm địa chỉ mới" />
              </RadioGroup>
            </FormControl>

            {!useNewAddress ? (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  value={selectedAddress?.id || ""}
                  onChange={(e) => {
                    const selected = addresses.find(addr => addr.id === e.target.value);
                    setSelectedAddress(selected || null);
                  }}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Chọn địa chỉ giao hàng</em>
                  </MenuItem>
                  {addresses.map((address) => (
                    <MenuItem key={address.id} value={address.id}>
                      {address.full_name} - {address.full_address}
                      {address.is_default === 1 && " (Mặc định)"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="full_name"
                  value={newAddress.full_name}
                  onChange={handleAddressChange}
                  error={!!addressErrors.full_name}
                  helperText={addressErrors.full_name}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleAddressChange}
                  error={!!addressErrors.phone}
                  helperText={addressErrors.phone}
                  margin="normal"
                />
                <FormControl fullWidth error={!!addressErrors.city_id} margin="normal">
                  <InputLabel>Tỉnh/Thành phố</InputLabel>
                  <Select
                    name="city_id"
                    value={newAddress.city_id}
                    onChange={handleAddressChange}
                    label="Tỉnh/Thành phố"
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{addressErrors.city_id}</FormHelperText>
                </FormControl>

                <FormControl fullWidth error={!!addressErrors.district_id} margin="normal">
                  <InputLabel>Quận/Huyện</InputLabel>
                  <Select
                    name="district_id"
                    value={newAddress.district_id}
                    onChange={handleAddressChange}
                    label="Quận/Huyện"
                  >
                    {districts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{addressErrors.district_id}</FormHelperText>
                </FormControl>

                <FormControl fullWidth error={!!addressErrors.ward_id} margin="normal">
                  <InputLabel>Phường/Xã</InputLabel>
                  <Select
                    name="ward_id"
                    value={newAddress.ward_id}
                    onChange={handleAddressChange}
                    label="Phường/Xã"
                  >
                    {wards.map((ward) => (
                      <MenuItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{addressErrors.ward_id}</FormHelperText>
                </FormControl>

                <TextField
                  fullWidth
                  label="Địa chỉ chi tiết"
                  name="full_address"
                  value={newAddress.full_address}
                  onChange={handleAddressChange}
                  error={!!addressErrors.full_address}
                  helperText={addressErrors.full_address}
                  margin="normal"
                />
              </Box>
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
            <FormControlLabel value="online" control={<Radio />} label="Thanh toán online (VNPay)" />
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Nút Xác nhận thanh toán */}
      <Box textAlign="center" mt={3}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={!useNewAddress && !selectedAddress}
        >
          Xác nhận thanh toán
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout;
