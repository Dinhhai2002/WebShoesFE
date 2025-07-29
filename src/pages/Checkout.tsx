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
  Alert,
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

  // GHN Location states
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


  // Define calculateSubTotal function correctly here
  const calculateSubTotal = (): number => {
    return cart.reduce((sum: number, item: CartItem) => {
      if (!item || !item.product_detail) return sum;
      return sum + item.product_detail.price * item.quantity;
    }, 0);
  };

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
      if (selectedService && cart.length > 0) {
        try {
          setLoadingShipping(true);
          
          const totalValue = cart.reduce((total, item) => total + item.product_detail.price * item.quantity, 0);
          
          const request = {
            service_id: selectedService,
            insurance_value: totalValue,
            from_district_id: 1454, // Default from district
            to_district_id: selectedDistrict as number, // Ensure it's a number
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
  }, [selectedService, cart]);

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
          // Set selectedDistrict và selectedWard từ địa chỉ mặc định
          setSelectedDistrict(defaultAddress.district_id);
          setSelectedWard(defaultAddress.ward_id?.toString() || "");
          // (Có thể set luôn selectedProvince nếu cần)
          setSelectedProvince(defaultAddress.city_id);
          // Auto-fetch available services cho địa chỉ mặc định
          // if (defaultAddress.district_id) {
          //   try {
          //     setLoadingServices(true);
          //     const request = {
          //       shop_id: 197014,
          //       from_district: 1454,
          //       to_district: defaultAddress.district_id
          //     };
          //     const servicesResponse = await authenticationApiService.getAvailableServices(request);
          //     setGhnServices(servicesResponse.data);
          //   } catch (error) {
          //     console.error("Error fetching services for default address:", error);
          //   } finally {
          //     setLoadingServices(false);
          //   }
          // }
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
    // Only use GHN shipping fee, no fallback to hardcoded values
    return subtotal - discount + shippingFee;
  };

  // Remove the calculateShipping function as we no longer use hardcoded values
  // const calculateShipping = (subtotal: number) => {
  //   // Calculate shipping cost based on the subtotal
  //   // Example logic: Free ship over 1,000,000, else 30,000
  //   // return subtotal >= 1000000 ? 0 : 30000;
  //   // Current logic from original code:
  //   if (subtotal >= 1000000) {
  //     return 50000; // 50,000 VND for orders above 1 million
  //   } else {
  //     return 30000; // 30,000 VND for orders below 1 million
  //   }
  // };

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
      const selectedCity = ghnProvinces.find((city) => city.ProvinceID === cityId);
      setNewAddress((prev) => ({
        ...prev,
        city_id: cityId,
        city_name: selectedCity?.ProvinceName || "",
        district_id: 0, // Reset district and ward
        district_name: "",
        ward_id: 0,
        ward_name: "",
      }));
      // Update GHN province selection
      setSelectedProvince(cityId);
    } else if (name === "district_id" && value) {
      const districtId = Number(value);
      const selectedDistrict = ghnDistricts.find(
        (district) => district.DistrictID === districtId
      );
      setNewAddress((prev) => ({
        ...prev,
        district_id: districtId,
        district_name: selectedDistrict?.DistrictName || "",
        ward_id: 0, // Reset ward
        ward_name: "",
      }));
      // Update GHN district selection
      setSelectedDistrict(districtId);
    } else if (name === "ward_id" && value) {
      const wardId = Number(value);
      const selectedWard = ghnWards.find((ward) => ward.WardCode === value);
      setNewAddress((prev) => ({
        ...prev,
        ward_id: wardId,
        ward_name: selectedWard?.WardName || "",
      }));
      // Update GHN ward selection
      setSelectedWard(value as string);
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

  // Handle save new address
  const handleSaveNewAddress = async () => {
    if (!validateAddress()) {
      toast.warn("Vui lòng kiểm tra lại thông tin địa chỉ mới.");
      return;
    }

    try {
      setLoading(true);
      // Create new address
      const addressResponse = await addressBookApi.create(newAddress);
      const createdAddress = addressResponse.data;
      
      // Add the full address object returned by the API to the list
      setAddresses((prev) => [...prev, createdAddress]);
      // Select the newly created address
      setSelectedAddress(createdAddress);
      setUseNewAddress(false); // Switch back to existing address view
      toast.success("Đã thêm địa chỉ mới thành công.");
      
      // Reset form
      setNewAddress({
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
      setSelectedProvince(createdAddress.city_id);
      setSelectedDistrict(createdAddress.district_id);
      setSelectedWard(`${createdAddress.ward_id}`);
      setSelectedService('');
      setShippingFee(0);
      
    } catch (error: any) {
      console.error("Error creating address:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Đã có lỗi xảy ra khi tạo địa chỉ!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate shipping fee is calculated
      if (shippingFee === 0) {
        toast.error("Vui lòng chọn dịch vụ vận chuyển và tính phí ship trước khi đặt hàng.");
        setLoading(false);
        return;
      }

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
        amount_shipping: shippingFee, // Use the calculated shipping fee
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
                    {shippingFee > 0 ? shippingFee.toLocaleString() : "Chưa tính"} đ
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
                  onChange={async (e) => {
                    const selectedId = e.target.value;
                    const selected =
                      addresses.find(
                        (addr) => addr.id === Number(selectedId)
                      ) || null;
                    setSelectedAddress(selected);
                    
                    // Auto-fetch available services for selected address
                    if (selected && selected.district_id) {
                      try {
                        setLoadingServices(true);
                        setSelectedWard(`${selected.ward_id}`);
                        setSelectedDistrict(selected.district_id);
                        setSelectedService('');
                        setShippingFee(0);
                        
                        const request = {
                          shop_id: 197014,
                          from_district: 1454,
                          to_district: selected.district_id
                        };
                        const servicesResponse = await authenticationApiService.getAvailableServices(request);
                        setGhnServices(servicesResponse.data);
                      } catch (error) {
                        console.error("Error fetching services for selected address:", error);
                        toast.error("Không thể tải danh sách dịch vụ vận chuyển");
                      } finally {
                        setLoadingServices(false);
                      }
                    } else {
                      setGhnServices([]);
                      setSelectedService('');
                      setShippingFee(0);
                    }
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
                    disabled={loadingProvinces}
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn Tỉnh/Thành phố</em>
                    </MenuItem>
                    {ghnProvinces.map((province) => (
                      <MenuItem key={province.ProvinceID} value={province.ProvinceID}>
                        {province.ProvinceName}
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
                    disabled={!newAddress.city_id || loadingDistricts} // Disable if no city selected
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn Quận/Huyện</em>
                    </MenuItem>
                    {ghnDistricts.map((district) => (
                      <MenuItem key={district.DistrictID} value={district.DistrictID}>
                        {district.DistrictName}
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
                    disabled={!newAddress.district_id || loadingWards} // Disable if no district selected
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn Phường/Xã</em>
                    </MenuItem>
                    {ghnWards.map((ward) => (
                      <MenuItem key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
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
                
                {/* Button to save new address */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSaveNewAddress}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu địa chỉ mới"}
                </Button>
              </Box>
            )}
          </Paper>

          {/* Shipping Services Section */}
          {(selectedAddress || (useNewAddress && selectedWard && selectedDistrict)) && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                🚚 Dịch vụ vận chuyển
              </Typography>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="service-select-label">
                  {loadingServices ? "Đang tải dịch vụ..." : "Chọn dịch vụ vận chuyển"}
                </InputLabel>
                <Select
                  labelId="service-select-label"
                  label={loadingServices ? "Đang tải dịch vụ..." : "Chọn dịch vụ vận chuyển"}
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value as number)}
                  disabled={loadingServices}
                  startAdornment={loadingServices ? 
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mr: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                    </Box> : undefined
                  }
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
                  <FormHelperText>Đang tải danh sách dịch vụ vận chuyển</FormHelperText>
                )}
              </FormControl>

              {/* Shipping Fee Display */}
              {loadingShipping && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Đang tính phí vận chuyển...</Typography>
                </Box>
              )}
              
              {shippingFee > 0 && !loadingShipping && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Phí vận chuyển: {shippingFee.toLocaleString()} VNĐ
                </Alert>
              )}

              {shippingFee === 0 && !loadingShipping && selectedService && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Vui lòng chọn dịch vụ vận chuyển để tính phí ship
                </Alert>
              )}
            </Paper>
          )}
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
          // Disable if using existing address and none is selected, OR if using new address and form is invalid, OR if shipping fee is not calculated
          disabled={(!useNewAddress && !selectedAddress) || cart.length === 0 || loading || shippingFee === 0}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            paymentMethod === "cod" ? "Đặt hàng" : "Tiến hành thanh toán VNPay"
          )}
        </Button>
        {shippingFee === 0 && cart.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Vui lòng chọn địa chỉ và dịch vụ vận chuyển để tính phí ship trước khi đặt hàng
          </Typography>
        )}
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
