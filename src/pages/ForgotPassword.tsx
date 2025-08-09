import React, { useState } from 'react';
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
  Person as PersonIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardReturn as KeyboardReturnIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { routes } from '../routes/routes';
const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    
    if (!formData.user_name) newErrors.user_name = 'Vui lòng nhập tên đăng nhập';
    
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Gọi API OTP Forgot
      await authenticationApiService.OtpForgot(formData.user_name, formData.email);

      // Lưu thông tin vào localStorage để sử dụng ở trang ResetPassword
      localStorage.setItem('resetPasswordData', JSON.stringify(formData));

      // Chuyển đến trang xác nhận OTP
      navigate('/authentication/verify-otp');
    } catch (error: any) {
      toast.error(error.message || 'Gửi mã OTP thất bại');
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
          <Link to={routes.Login} style={{ textDecoration: 'none' }}>
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
              Quên Mật Khẩu
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Nhập thông tin tài khoản để lấy lại mật khẩu
            </Typography>
          </Box>
        </Box>

        {/* Info Box */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: '1px solid',
            borderColor: alpha(theme.palette.info.main, 0.1),
            display: 'flex',
            gap: 2,
          }}
        >
          <InfoIcon color="info" sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" color="info.main" fontWeight={500} gutterBottom>
              Hướng dẫn lấy lại mật khẩu:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nhập tên đăng nhập và email đã đăng ký. Chúng tôi sẽ gửi mã OTP đến email của bạn để xác thực.
              Sau khi xác thực thành công, bạn có thể đặt lại mật khẩu mới.
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tên đăng nhập"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              error={!!errors.user_name}
              helperText={errors.user_name}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary' }} />
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
            Gửi mã OTP
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

export default ForgotPassword; 