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
import { OtpEnum } from '../utils/enum/OtpEnum';

const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationType, setVerificationType] = useState<'register' | 'forgot'>('register');

  useEffect(() => {
    // Kiểm tra dữ liệu từ cả hai nguồn
    const registerData = localStorage.getItem('registerData');
    const resetData = localStorage.getItem('resetPasswordData');

    if (registerData) {
      setVerificationData(JSON.parse(registerData));
      setVerificationType('register');
    } else if (resetData) {
      setVerificationData(JSON.parse(resetData));
      setVerificationType('forgot');
    } else {
      // Nếu không có dữ liệu từ cả hai nguồn, chuyển về trang đăng nhập
      navigate('/authentication/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);
    try {
      // Xác nhận OTP
      await authenticationApiService.confirmOtp(
        verificationData.user_name,
        verificationData.email,
        parseInt(otp),
        verificationType === 'register' ? OtpEnum.REGISTER : OtpEnum.FORGOTPASSWORD
      );

      if (verificationType === 'register') {
        // Nếu là đăng ký, gọi API đăng ký sau khi xác nhận OTP
        await authenticationApiService.Register(verificationData);
        localStorage.removeItem('registerData');
        navigate('/authentication/login');
      } else if(verificationType === 'forgot') {
        // Nếu là quên mật khẩu, chuyển đến trang đặt lại mật khẩu
        navigate('/authentication/reset-password');
      } else {
        navigate('/authentication/login');
      }
      
     
    } catch (error: any) {
      // toast.error(error.message || 'Xác nhận OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!verificationData) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Xác Nhận OTP
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Vui lòng nhập mã OTP đã được gửi đến email {verificationData.email}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            type="number"
            margin="normal"
            required
          />
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Xác Nhận'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default OTPVerification; 