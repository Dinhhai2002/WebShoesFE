import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authenticationApiService from '../services/API/AuthenticationApiService';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardReturn as KeyboardReturnIcon,
} from '@mui/icons-material';
import { routes } from '../routes/routes';

const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState({
    new_password: false,
    confirm_password: false,
  });

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

  const togglePasswordVisibility = (field: 'new_password' | 'confirm_password') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
    <Container component="main" maxWidth="sm" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      py: 4
    }}>
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
          <Link to="/authentication/forgot-password" style={{ textDecoration: 'none' }}>
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
              Đặt Lại Mật Khẩu
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Tạo mật khẩu mới cho tài khoản của bạn
            </Typography>
          </Box>
        </Box>

        {/* Password Requirements */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: '1px solid',
            borderColor: alpha(theme.palette.info.main, 0.1),
          }}
        >
          <Typography variant="subtitle2" color="info.main" fontWeight={500}>
            Mật khẩu mới cần đáp ứng các yêu cầu sau:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Độ dài từ 8-20 ký tự
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Bao gồm chữ hoa, chữ thường
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Ít nhất một số và một ký tự đặc biệt
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Mật khẩu mới"
              name="new_password"
              type={showPassword.new_password ? 'text' : 'password'}
              value={formData.new_password}
              onChange={handleChange}
              error={!!errors.new_password}
              helperText={errors.new_password}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new_password')}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword.new_password ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              name="confirm_password"
              type={showPassword.confirm_password ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm_password')}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword.confirm_password ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={loading}
            sx={{
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
            Đặt lại mật khẩu
          </LoadingButton>

          <Button
            component={Link}
            to={routes.Login}
            fullWidth
            variant="outlined"
            startIcon={<KeyboardReturnIcon />}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Quay lại đăng nhập
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ResetPassword; 