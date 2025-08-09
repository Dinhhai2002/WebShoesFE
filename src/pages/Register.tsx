import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  CircularProgress,
  SelectChangeEvent,
  useTheme,
  alpha,
  Divider,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authenticationApiService from '../services/API/AuthenticationApiService';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Cake as CakeIcon,
  LocationOn as LocationOnIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { routes } from '../routes/routes';

// GHN Interfaces
interface GHNProvinceResponse {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

interface GHNDistrictResponse {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
}

interface GHNWardResponse {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

const Register: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [cities, setCities] = useState<GHNProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<GHNDistrictResponse[]>([]);
  const [wards, setWards] = useState<GHNWardResponse[]>([]);
  const [formData, setFormData] = useState({
    user_name: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    gender: 1,
    birthday: '',
    ward_id: '',
    district_id: '',
    city_id: '',
    full_address: '',
    ward_name: '',
    district_name: '',
    city_name: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Hàm chuyển đổi định dạng ngày từ yyyy-mm-dd sang dd/mm/yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hàm chuyển đổi định dạng ngày từ dd/mm/yyyy sang yyyy-mm-dd
  const parseDate = (dateString: string) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await authenticationApiService.getGHNProvinces();
      setCities(response.data);
    } catch (error: any) {
      toast.error('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      setLoadingDistricts(true);
      const response = await authenticationApiService.getGHNDistricts(provinceId);
      setDistricts(response.data);
      setWards([]); // Reset wards when province changes
      // Reset form data
      setFormData(prev => ({
        ...prev,
        district_id: '',
        ward_id: '',
        district_name: ''
      }));
    } catch (error: any) {
      toast.error('Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtId: number) => {
    try {
      setLoadingWards(true);
      const response = await authenticationApiService.getGHNWards(districtId);
      setWards(response.data);
      // Reset ward in form data
      setFormData(prev => ({
        ...prev,
        ward_id: '',
        ward_name: ''
      }));
    } catch (error: any) {
      toast.error('Không thể tải danh sách phường/xã');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho trường ngày sinh
    if (name === 'birthday') {
      if (value) {
        const formattedDate = formatDate(value);
        setFormData(prev => ({
          ...prev,
          [name]: formattedDate
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    // Update form data with both ID and name for locations
    if (name === 'city_id' && value) {
      const selectedCity = cities.find(city => city.ProvinceID === Number(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city_name: selectedCity ? selectedCity.ProvinceName : ''
      }));
      fetchDistricts(Number(value));
    } else if (name === 'district_id' && value) {
      const selectedDistrict = districts.find(district => district.DistrictID === Number(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        district_name: selectedDistrict ? selectedDistrict.DistrictName : ''
      }));
      fetchWards(Number(value));
    } else if (name === 'ward_id' && value) {
      const selectedWard = wards.find(ward => ward.WardCode === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ward_name: selectedWard ? selectedWard.WardName : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.user_name) newErrors.user_name = 'Vui lòng nhập tên đăng nhập';
    else if (!/^[a-zA-Z 0-9 ]*$/.test(formData.user_name)) newErrors.user_name = 'Tên đăng nhập không được chứa ký tự đặc biệt';
    
    if (!formData.full_name) newErrors.full_name = 'Vui lòng nhập họ tên';
    
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    
    if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại phải là 10 chữ số';
    
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 8 || formData.password.length > 20) newErrors.password = 'Mật khẩu phải từ 8-20 ký tự';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt';
    }
    
    if (!formData.birthday) newErrors.birthday = 'Vui lòng chọn ngày sinh';
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.birthday)) {
      newErrors.birthday = 'Ngày sinh phải theo định dạng dd/mm/yyyy';
    }
    
    if (!formData.city_id) newErrors.city_id = 'Vui lòng chọn tỉnh/thành phố';
    if (!formData.district_id) newErrors.district_id = 'Vui lòng chọn quận/huyện';
    if (!formData.ward_id) newErrors.ward_id = 'Vui lòng chọn phường/xã';
    if (!formData.full_address) newErrors.full_address = 'Vui lòng nhập địa chỉ chi tiết';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Chuyển đổi ngày sinh sang định dạng yyyy-mm-dd trước khi gửi
      const formattedData = {
        ...formData,
        birthday: parseDate(formData.birthday),
        ward_id: Number(formData.ward_id),
        district_id: Number(formData.district_id),
        city_id: Number(formData.city_id),
        // Location names are already in the correct format
      };

      // Gọi API OTP Register
      await authenticationApiService.OtpRegister(formattedData);

      // Lưu thông tin đăng ký vào localStorage
      localStorage.setItem('registerData', JSON.stringify(formattedData));

      // Chuyển đến trang xác nhận OTP
      navigate('/authentication/verify-otp');
    } catch (error: any) {
      // toast.error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* Left side - Form */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <IconButton
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <ArrowBackIcon color="primary" />
                </IconButton>
              </Link>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  Đăng Ký Tài Khoản
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Điền thông tin của bạn để tạo tài khoản mới
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Thông tin cơ bản
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên đăng nhập"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleTextChange}
                    error={!!errors.user_name}
                    helperText={errors.user_name}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ tên"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleTextChange}
                    error={!!errors.full_name}
                    helperText={errors.full_name}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleTextChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleTextChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    name="birthday"
                    type="date"
                    value={formData.birthday ? parseDate(formData.birthday) : ''}
                    onChange={handleTextChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.birthday}
                    helperText={errors.birthday}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0]
                    }}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                {/* Address Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="primary" />
                    Thông tin địa chỉ
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.city_id}>
                    <InputLabel>Tỉnh/Thành phố</InputLabel>
                    <Select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleSelectChange}
                      label="Tỉnh/Thành phố"
                      disabled={loadingProvinces}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">
                        <em>Chọn tỉnh/thành phố</em>
                      </MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city.ProvinceID} value={city.ProvinceID}>
                          {city.ProvinceName}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingProvinces && (
                      <FormHelperText>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          Đang tải...
                        </Box>
                      </FormHelperText>
                    )}
                    {errors.city_id && <FormHelperText>{errors.city_id}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.district_id}>
                    <InputLabel>Quận/Huyện</InputLabel>
                    <Select
                      name="district_id"
                      value={formData.district_id}
                      onChange={handleSelectChange}
                      label="Quận/Huyện"
                      disabled={!formData.city_id || loadingDistricts}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">
                        <em>Chọn quận/huyện</em>
                      </MenuItem>
                      {districts.map((district) => (
                        <MenuItem key={district.DistrictID} value={district.DistrictID}>
                          {district.DistrictName}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingDistricts && (
                      <FormHelperText>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          Đang tải...
                        </Box>
                      </FormHelperText>
                    )}
                    {errors.district_id && <FormHelperText>{errors.district_id}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.ward_id}>
                    <InputLabel>Phường/Xã</InputLabel>
                    <Select
                      name="ward_id"
                      value={formData.ward_id}
                      onChange={handleSelectChange}
                      label="Phường/Xã"
                      disabled={!formData.district_id || loadingWards}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">
                        <em>Chọn phường/xã</em>
                      </MenuItem>
                      {wards.map((ward) => (
                        <MenuItem key={ward.WardCode} value={ward.WardCode}>
                          {ward.WardName}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingWards && (
                      <FormHelperText>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          Đang tải...
                        </Box>
                      </FormHelperText>
                    )}
                    {errors.ward_id && <FormHelperText>{errors.ward_id}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ chi tiết"
                    name="full_address"
                    value={formData.full_address}
                    onChange={handleTextChange}
                    error={!!errors.full_address}
                    helperText={errors.full_address}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    fullWidth
                    loading={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    Đăng Ký
                  </LoadingButton>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Right side - Information */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: 'sticky',
              top: 24,
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Quy định đăng ký
            </Typography>
            <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
              <Typography component="li" color="text.secondary">
                Tên đăng nhập không được chứa ký tự đặc biệt
              </Typography>
              <Typography component="li" color="text.secondary">
                Mật khẩu phải từ 8-20 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
              </Typography>
              <Typography component="li" color="text.secondary">
                Email phải là địa chỉ email hợp lệ
              </Typography>
              <Typography component="li" color="text.secondary">
                Số điện thoại phải là 10 chữ số
              </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body1" align="center">
                Đã có tài khoản?
              </Typography>
              <Button
                component={Link}
                to={routes.Login}
                variant="outlined"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Đăng nhập ngay
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register; 