import * as React from "react"; // Fix TS error: allowSyntheticDefaultImports
import { useState, useContext, useEffect } from "react";
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
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions, // Import SelectChangeEvent
  CircularProgress,
} from "@mui/material";
// Import Voucher and ApplyVoucherResponse, assume CartItem is exported from CartContext
import { CartContext, CartItem } from "../context/CartContext";
import VoucherBlock from "../components/VoucherBlock";
import voucherApi, {
  Voucher,
  ApplyVoucherResponse,
} from "../services/API/VoucherApi"; // Use Voucher type
import { toast } from "react-toastify";
import orderApi from "../services/API/OrderApi";
import addressBookApi, {
  AddressBook,
  AddressBookRequest,
} from "../services/API/AddressBookApi";
import authenticationApiService from "../services/API/AuthenticationApiService";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressBook[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressBook | null>(
    null
  );
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
    is_default: 0,
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [vouchers, setVouchers] = useState<Voucher[]>([]); // Use Voucher type
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null); // Use Voucher type
  const [bestVoucher, setBestVoucher] = useState<ApplyVoucherResponse | null>(
    null
  ); // State for best voucher info
  const [discount, setDiscount] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false); // State for voucher loading
  const [applyingVoucher, setApplyingVoucher] = useState(false); // State for applying voucher
  const cartContext = useContext(CartContext); // Get the context object
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Destructure after checking context exists to satisfy TypeScript
  const cart = cartContext?.cart || [];
  const resetCart =
    cartContext?.resetCart ||
    (() => {
      console.error("resetCart function not available in CartContext");
    });

  // States for location selection
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Define calculateSubTotal function correctly here
  const calculateSubTotal = (): number => {
    return cart.reduce((sum: number, item: CartItem) => {
      if (!item || !item.product_detail) return sum;
      return sum + item.product_detail.price * item.quantity;
    }, 0);
  };

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await authenticationApiService.getAllCity();
      setCities(response.data);
    } catch (error: any) {
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    }
  };

  const fetchDistricts = async (cityId: number) => {
    try {
      const response = await authenticationApiService.findDistrictByCityId(
        cityId
      );
      setDistricts(response.data);
      setWards([]); // Reset wards when city changes
    } catch (error: any) {
      toast.error("Không thể tải danh sách quận/huyện");
    }
  };

  const fetchWards = async (districtId: number) => {
    try {
      const response = await authenticationApiService.findWardByDistrictId(
        districtId
      );
      setWards(response.data);
    } catch (error: any) {
      toast.error("Không thể tải danh sách phường/xã");
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
          limit: 10,
        });
        setAddresses(response.data.list);
        // Set default address if exists
        const defaultAddress = response.data.list.find(
          (addr) => addr.is_default === 1
        );
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

  // Fetch vouchers list for dropdown
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await voucherApi.findAll({
          status: 1,
          page: 1,
          limit: 10, // Fetch more if needed, or implement pagination/search
        });
        setVouchers(response.data.list);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        toast.error("Không thể tải danh sách voucher");
      }
    };
    fetchVouchers();
  }, []);

  // Fetch and apply best voucher when cart total and voucher list are ready
  useEffect(() => {
    const fetchBestVoucher = async () => {
      // Only run if we have vouchers loaded and the cart has items
      if (vouchers.length > 0 && cart.length > 0) {
        const subtotal = calculateSubTotal(); // Use the correctly defined function
        if (subtotal > 0) {
          try {
            setVoucherLoading(true); // Set loading state to true
            // Call the API to get the best voucher suggestion
            const response = await voucherApi.getBestVoucher();
            if (response.data && response.data.voucher) {
              // Check if the suggested best voucher exists in our fetched list (optional check)
              const bestVoucherExists = vouchers.some(
                (v) => v.id === response.data.voucher.id
              );
              if (!bestVoucherExists) {
                console.warn(
                  "Best voucher suggested by API not found in the fetched list."
                );
              }

              // Check applicability via apply API
              const applyCheckResponse = await voucherApi.apply(
                response.data.voucher.id,
                {
                  total_amount: subtotal,
                }
              );

              // If applicable, store the details and auto-apply state
              setBestVoucher(applyCheckResponse.data);
              setSelectedVoucher(applyCheckResponse.data.voucher); // This should update the Select value
              setDiscount(applyCheckResponse.data.amount_voucher);
              // Removed automatic toast for applying best voucher
            } else {
              // No best voucher suggested by the API
              setBestVoucher(null);
              setSelectedVoucher(null); // Ensure nothing is selected initially
              setDiscount(0);
            }
          } catch (error: any) {
            // Handle errors from getBestVoucher or the subsequent apply check
            console.error("Error fetching or applying best voucher:", error);
            // Don't show error toast for best voucher failure, it's optional/automatic
            setBestVoucher(null);
            // Reset selection on fetch/apply error
            setSelectedVoucher(null);
            setDiscount(0);
          } finally {
            setVoucherLoading(false); // Set loading state to false
          }
        } else {
          // Cart is empty or subtotal is zero, reset voucher state
          setBestVoucher(null);
          setSelectedVoucher(null);
          setDiscount(0);
        }
      } else {
        // Vouchers not loaded or cart empty, reset voucher state
        setBestVoucher(null);
        setSelectedVoucher(null);
        setDiscount(0);
      }
    };

    fetchBestVoucher();
    // Add vouchers to dependency array
  }, [cart, vouchers]); // Re-run when cart or voucher list changes

  const handleVoucherSelect = async (voucher: Voucher | null) => {
    // If user selects "Không sử dụng voucher" (null)
    if (!voucher) {
      setSelectedVoucher(null);
      setDiscount(0);
      toast.info("Đã bỏ chọn voucher.");
      return;
    }

    // If user selects a specific voucher from the dropdown
    try {
      setApplyingVoucher(true); // Set applying state to true
      const subtotal = calculateSubTotal();
      const response = await voucherApi.apply(voucher.id, {
        total_amount: subtotal,
      });

      // Update state with the manually selected voucher and its discount
      setSelectedVoucher(voucher);
      setDiscount(response.data.amount_voucher);
      toast.success(`Áp dụng voucher ${voucher.code} thành công!`);
    } catch (error: any) {
      toast.error(
        `Không thể áp dụng voucher ${voucher.code}: ${error.message}`
      );
      // If applying the manually selected voucher fails, revert to the best voucher if one was found and applied previously
      if (bestVoucher && bestVoucher.voucher) {
        setSelectedVoucher(bestVoucher.voucher);
        setDiscount(bestVoucher.amount_voucher);
        toast.info(`Đã quay lại voucher tốt nhất: ${bestVoucher.voucher.code}`);
      } else {
        // If no best voucher was applicable either, reset selection
        setSelectedVoucher(null);
        setDiscount(0);
      }
    } finally {
      setApplyingVoucher(false); // Set applying state to false
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubTotal();
    // Ensure shipping is calculated based on subtotal *before* discount
    const shippingCost = calculateShipping(subtotal);
    return subtotal - discount + shippingCost;
  };

  const calculateShipping = (subtotal: number) => {
    // Calculate shipping cost based on the subtotal
    // Example logic: Free ship over 1,000,000, else 30,000
    // return subtotal >= 1000000 ? 0 : 30000;
    // Current logic from original code:
    if (subtotal >= 1000000) {
      return 50000; // 50,000 VND for orders above 1 million
    } else {
      return 30000; // 30,000 VND for orders below 1 million
    }
  };

  // Combined handler for both TextField and Select changes
  const handleAddressChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | number>
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | { name: string; value: unknown }; // Type assertion
    const name = target.name as keyof AddressBookRequest;
    // Ensure value is treated correctly, especially for Select which might pass numbers
    const value =
      typeof target.value === "number" ? target.value : String(target.value);

    if (name === "city_id" && value) {
      const cityId = Number(value);
      const selectedCity = cities.find((city) => city.id === cityId);
      setNewAddress((prev) => ({
        ...prev,
        city_id: cityId,
        city_name: selectedCity?.name || "",
        district_id: 0, // Reset district and ward
        district_name: "",
        ward_id: 0,
        ward_name: "",
      }));
      fetchDistricts(cityId);
    } else if (name === "district_id" && value) {
      const districtId = Number(value);
      const selectedDistrict = districts.find(
        (district) => district.id === districtId
      );
      setNewAddress((prev) => ({
        ...prev,
        district_id: districtId,
        district_name: selectedDistrict?.name || "",
        ward_id: 0, // Reset ward
        ward_name: "",
      }));
      fetchWards(districtId);
    } else if (name === "ward_id" && value) {
      const wardId = Number(value);
      const selectedWard = wards.find((ward) => ward.id === wardId);
      setNewAddress((prev) => ({
        ...prev,
        ward_id: wardId,
        ward_name: selectedWard?.name || "",
      }));
    } else {
      // Handle other fields like full_name, phone, full_address
      setNewAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateAddress = () => {
    const errors: { [key: string]: string } = {};

    if (!newAddress.full_name.trim()) errors.full_name = "Vui lòng nhập họ tên";
    if (!newAddress.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
    // Basic phone validation (example: 10 digits) - adjust regex as needed
    else if (!/^\d{10}$/.test(newAddress.phone))
      errors.phone = "Số điện thoại không hợp lệ";
    if (!newAddress.city_id) errors.city_id = "Vui lòng chọn tỉnh/thành phố";
    if (!newAddress.district_id)
      errors.district_id = "Vui lòng chọn quận/huyện";
    if (!newAddress.ward_id) errors.ward_id = "Vui lòng chọn phường/xã";
    if (!newAddress.full_address.trim())
      errors.full_address = "Vui lòng nhập địa chỉ chi tiết";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let addressId: number | null = null; // Initialize as null

      if (useNewAddress) {
        if (!validateAddress()) {
          toast.warn("Vui lòng kiểm tra lại thông tin địa chỉ mới.");
          return;
        }
        // Create new address
        const addressResponse = await addressBookApi.create(newAddress);
        const createdAddress = addressResponse.data; // This should be the full AddressBook object
        addressId = createdAddress.id;
        // Add the full address object returned by the API to the list
        setAddresses((prev) => [...prev, createdAddress]);
        // Select the newly created address (full object)
        setSelectedAddress(createdAddress);
        setUseNewAddress(false); // Switch back to existing address view
        toast.success("Đã thêm địa chỉ mới thành công.");
      } else {
        if (!selectedAddress) {
          toast.error("Vui lòng chọn địa chỉ giao hàng");
          return;
        }
        addressId = selectedAddress.id;
      }

      // Ensure addressId is set before proceeding
      if (addressId === null) {
        setConfirmOpen(false);
        toast.error("Đã có lỗi xảy ra với địa chỉ giao hàng.");
        return;
      }

      // Create order request
      const orderRequest = {
        price: calculateSubTotal(),
        discount_amount: discount,
        amount_shipping: calculateShipping(calculateSubTotal()),
        total_price: calculateTotal(),
        payment_method: paymentMethod === "cod" ? 1 : 2, // 1 for COD, 2 for online payment
        address_id: addressId, // Use the determined addressId
        voucher_id: selectedVoucher ? selectedVoucher.id : 0, // Include voucher ID if one is selected
      };

      // Create order
      const response = await orderApi.create(orderRequest);
      setConfirmOpen(false);
      if (paymentMethod === "cod") {
        
        // For COD, redirect to success page with cod=true parameter
        navigate("/payment-success?cod=true");
      } else {
        // For online payment, redirect to payment URL
        if (
          typeof response.data === "string" &&
          response.data.startsWith("http")
        ) {
          // Reset cart before redirecting
          window.location.href = response.data;
        } else {
          console.error("Invalid payment URL received:", response.data);
          toast.error(
            "Không thể tạo link thanh toán! Vui lòng thử lại hoặc chọn COD."
          );
        }
      }
    } catch (error: any) {
      setConfirmOpen(false);
      console.error("Error creating order:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Đã có lỗi xảy ra khi đặt hàng!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if cart is empty after context is potentially updated
  if (cart.length === 0) {
    return (
      <Container sx={{ mb: 4, mt: 4 }}>
        <Typography variant="h5" align="center">
          Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh
          toán.
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
              {cart.map(
                (
                  item: CartItem // Add CartItem type
                ) =>
                  item &&
                  item.product_detail && (
                    <ListItem key={item.id} sx={{ alignItems: "flex-start" }}>
                      <Avatar
                        src={item.product_detail.image_url}
                        alt={item.product_detail.name}
                        variant="square"
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <ListItemText
                        primary={item.product_detail.name}
                        secondary={`Số lượng: ${item.quantity}`}
                        primaryTypographyProps={{
                          fontWeight: "medium",
                          mb: 0.5,
                        }}
                      />
                      <Typography sx={{ fontWeight: "medium" }}>
                        {(
                          item.product_detail.price * item.quantity
                        ).toLocaleString()}{" "}
                        đ
                      </Typography>
                    </ListItem>
                  )
              )}
            </List>
            <Divider sx={{ my: 2 }} />

            {/* Voucher selection */}
            <Box sx={{ mb: 2 }}>
              {/* Voucher selection - Added InputLabel */}
              <FormControl fullWidth variant="outlined">
                <InputLabel id="voucher-select-label">
                  {voucherLoading ? "Đang tìm voucher tốt nhất..." : 
                   applyingVoucher ? "Đang áp dụng voucher..." : 
                   "Chọn Voucher"}
                </InputLabel>
                <Select
                  labelId="voucher-select-label"
                  label={voucherLoading ? "Đang tìm voucher tốt nhất..." : 
                         applyingVoucher ? "Đang áp dụng voucher..." : 
                         "Chọn Voucher"}
                  // Ensure value is number or empty string, matching MenuItem values
                  value={selectedVoucher ? selectedVoucher.id : ""}
                  onChange={(e: SelectChangeEvent<number | string>) => {
                    // Explicitly type the event
                    const selectedId = e.target.value;
                    // Handle empty string case for "Không sử dụng"
                    if (selectedId === "") {
                      handleVoucherSelect(null);
                      return;
                    }
                    const selected =
                      vouchers.find((v) => v.id === Number(selectedId)) || null; // Find voucher or set null
                    handleVoucherSelect(selected);
                  }}
                  displayEmpty
                  // Removed renderValue prop to rely on default MenuItem display
                  disabled={voucherLoading || applyingVoucher} // Disable dropdown when loading or applying
                  startAdornment={(voucherLoading || applyingVoucher) ? 
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mr: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                    </Box> : undefined
                  }
                >
                  {!voucherLoading && !applyingVoucher && (
                    <MenuItem value="">
                      <em>không sử dụng voucher</em>
                    </MenuItem>
                  )}
                  {vouchers.map((voucher) => (
                    <MenuItem key={voucher.id} value={voucher.id}>
                      {voucher.code} - Giảm{" "}
                      {voucher.discount_type === 1
                        ? `${voucher.discount_value}%`
                        : `${voucher.discount_value.toLocaleString()}đ`}{" "}
                      (Đơn tối thiểu: {voucher.min_order_value.toLocaleString()}
                      đ)
                    </MenuItem>
                  ))}
                </Select>
                {voucherLoading && (
                  <FormHelperText>Đang tìm voucher tốt nhất cho đơn hàng của bạn</FormHelperText>
                )}
                {applyingVoucher && (
                  <FormHelperText>Đang áp dụng voucher...</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Tổng tiền */}
            <Box sx={{ mt: 2 }}>
              <Grid container justifyContent="flex-end" spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    Tạm tính:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {calculateSubTotal().toLocaleString()} đ
                  </Typography>
                </Grid>
                {discount > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography color="error" variant="body1" align="right">
                        Giảm giá:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography color="error" variant="body1" align="right">
                        -{discount.toLocaleString()} đ
                      </Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    Phí ship:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {calculateShipping(calculateSubTotal()).toLocaleString()} đ
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right">
                    Tổng tiền:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right">
                    {calculateTotal().toLocaleString()} đ
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Thông tin giao hàng */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin giao hàng
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Chọn địa chỉ</FormLabel>
              <RadioGroup
                row
                value={useNewAddress ? "new" : "existing"}
                onChange={(e) => setUseNewAddress(e.target.value === "new")}
              >
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label="Chọn địa chỉ có sẵn"
                  disabled={addresses.length === 0}
                />
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label="Thêm địa chỉ mới"
                />
              </RadioGroup>
            </FormControl>

            {!useNewAddress ? (
              <FormControl
                fullWidth
                variant="outlined"
                error={!selectedAddress && addresses.length > 0}
              >
                <InputLabel id="select-address-label">
                  Địa chỉ đã lưu
                </InputLabel>
                <Select
                  labelId="select-address-label"
                  label="Địa chỉ đã lưu"
                  value={selectedAddress?.id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selected =
                      addresses.find(
                        (addr) => addr.id === Number(selectedId)
                      ) || null;
                    setSelectedAddress(selected);
                  }}
                  displayEmpty={addresses.length === 0}
                  disabled={addresses.length === 0}
                >
                  {addresses.length === 0 ? (
                    <MenuItem value="" disabled>
                      <em>Chưa có địa chỉ nào</em>
                    </MenuItem>
                  ) : (
                    <MenuItem value="">
                      <em>Chọn địa chỉ giao hàng</em>
                    </MenuItem>
                  )}
                  {addresses.map((address) => (
                    <MenuItem key={address.id} value={address.id}>
                      {address.full_name} - {address.phone} <br />
                      {address.full_address}, {address.ward_name},{" "}
                      {address.district_name}, {address.city_name}
                      {address.is_default === 1 && " (Mặc định)"}
                    </MenuItem>
                  ))}
                </Select>
                {!selectedAddress && addresses.length > 0 && (
                  <FormHelperText error>Vui lòng chọn địa chỉ</FormHelperText>
                )}
              </FormControl>
            ) : (
              <Box sx={{ mt: 1 }}>
                {" "}
                {/* Reduced margin top */}
                <TextField
                  fullWidth
                  required
                  label="Họ và tên"
                  name="full_name"
                  value={newAddress.full_name}
                  onChange={handleAddressChange}
                  error={!!addressErrors.full_name}
                  helperText={addressErrors.full_name}
                  margin="dense" // Use dense margin
                />
                <TextField
                  fullWidth
                  required
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  value={newAddress.phone}
                  onChange={handleAddressChange}
                  error={!!addressErrors.phone}
                  helperText={addressErrors.phone}
                  margin="dense" // Use dense margin
                />
                <FormControl
                  fullWidth
                  required
                  error={!!addressErrors.city_id}
                  margin="dense"
                >
                  <InputLabel>Tỉnh/Thành phố</InputLabel>
                  <Select
                    name="city_id"
                    value={newAddress.city_id || ""} // Handle 0 case
                    onChange={handleAddressChange}
                    label="Tỉnh/Thành phố"
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn Tỉnh/Thành phố</em>
                    </MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{addressErrors.city_id}</FormHelperText>
                </FormControl>
                <FormControl
                  fullWidth
                  required
                  error={!!addressErrors.district_id}
                  margin="dense"
                >
                  <InputLabel>Quận/Huyện</InputLabel>
                  <Select
                    name="district_id"
                    value={newAddress.district_id || ""} // Handle 0 case
                    onChange={handleAddressChange}
                    label="Quận/Huyện"
                    disabled={!newAddress.city_id} // Disable if no city selected
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn Quận/Huyện</em>
                    </MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{addressErrors.district_id}</FormHelperText>
                </FormControl>
                <FormControl
                  fullWidth
                  required
                  error={!!addressErrors.ward_id}
                  margin="dense"
                >
                  <InputLabel>Phường/Xã</InputLabel>
                  <Select
                    name="ward_id"
                    value={newAddress.ward_id || ""} // Handle 0 case
                    onChange={handleAddressChange}
                    label="Phường/Xã"
                    disabled={!newAddress.district_id} // Disable if no district selected
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn Phường/Xã</em>
                    </MenuItem>
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
                  required
                  label="Địa chỉ chi tiết (Số nhà, tên đường)"
                  name="full_address"
                  value={newAddress.full_address}
                  onChange={handleAddressChange}
                  error={!!addressErrors.full_address}
                  helperText={addressErrors.full_address}
                  margin="dense" // Use dense margin
                />
                {/* Button to save new address - removed as it's saved on submit */}
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
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel
              value="cod"
              control={<Radio />}
              label="Thanh toán khi nhận hàng (COD)"
            />
            <FormControlLabel
              value="online"
              control={<Radio />}
              label="Thanh toán online (VNPay)"
            />
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Nút Xác nhận thanh toán */}
      <Box textAlign="center" mt={3}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => setConfirmOpen(true)}
          // Disable if using existing address and none is selected, OR if using new address and form is invalid (validation happens on submit)
          disabled={(!useNewAddress && !selectedAddress) || cart.length === 0 || loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            paymentMethod === "cod" ? "Đặt hàng" : "Tiến hành thanh toán VNPay"
          )}
        </Button>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Xác nhận"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn mua đơn hàng này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Hủy bỏ
          </Button>
          <Button onClick={handleSubmit} color="primary" autoFocus disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout;
