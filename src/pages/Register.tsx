import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authenticationApiService from '../services/API/AuthenticationApiService';
import { CityResponse, DistrictResponse, WardResponse } from '../services/API/AuthenticationApiService';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho trường ngày sinh
    if (name === 'birthday') {
      const dateValue = value as string;
      if (dateValue) {
        const formattedDate = formatDate(dateValue);
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
    if (errors[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name as string]: ''
      }));
    }

    // Fetch districts when city changes
    if (name === 'city_id' && value) {
      fetchDistricts(Number(value));
    }

    // Fetch wards when district changes
    if (name === 'district_id' && value) {
      fetchWards(Number(value));
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Đăng Ký
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                error={!!errors.user_name}
                helperText={errors.user_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ tên"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                error={!!errors.full_name}
                helperText={errors.full_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày sinh"
                name="birthday"
                type="date"
                value={formData.birthday ? parseDate(formData.birthday) : ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.birthday}
                helperText={errors.birthday}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.city_id}>
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  label="Tỉnh/Thành phố"
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.city_id}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.district_id}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  label="Quận/Huyện"
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.district_id}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.ward_id}>
                <InputLabel>Phường/Xã</InputLabel>
                <Select
                  name="ward_id"
                  value={formData.ward_id}
                  onChange={handleChange}
                  label="Phường/Xã"
                >
                  {wards.map((ward) => (
                    <MenuItem key={ward.id} value={ward.id}>
                      {ward.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.ward_id}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ chi tiết"
                name="full_address"
                value={formData.full_address}
                onChange={handleChange}
                error={!!errors.full_address}
                helperText={errors.full_address}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Đăng Ký'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Register; 