import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authenticationApiService from '../services/API/AuthenticationApiService';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Kiểm tra xem có dữ liệu từ trang ForgotPassword không
    const resetData = localStorage.getItem('resetPasswordData');
    if (resetData) {
      const { user_name } = JSON.parse(resetData);
      setFormData(prev => ({
        ...prev,
        user_name
      }));
    } else {
      // Nếu không có dữ liệu, chuyển về trang quên mật khẩu
      navigate('/authentication/forgot-password');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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
    
    if (!formData.new_password) newErrors.new_password = 'Vui lòng nhập mật khẩu mới';
    else if (formData.new_password.length < 8 || formData.new_password.length > 20) {
      newErrors.new_password = 'Mật khẩu phải từ 8-20 ký tự';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.new_password)) {
      newErrors.new_password = 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt';
    }
    
    if (!formData.confirm_password) newErrors.confirm_password = 'Vui lòng xác nhận mật khẩu';
    else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Gọi API Reset Password
      await authenticationApiService.resetPassword(
        formData.user_name,
        formData.new_password,
        formData.confirm_password
      );

      // Xóa dữ liệu từ localStorage
      localStorage.removeItem('resetPasswordData');

      // Chuyển đến trang đăng nhập
      navigate('/authentication/login');
    } catch (error: any) {
      // toast.error(error.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Đặt Lại Mật Khẩu
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Mật khẩu mới"
              name="new_password"
              type="password"
              value={formData.new_password}
              onChange={handleChange}
              error={!!errors.new_password}
              helperText={errors.new_password}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password}
              sx={{ mb: 3 }}
            />
            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Đặt Lại Mật Khẩu'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ResetPassword; 