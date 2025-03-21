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
  const [registerData, setRegisterData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('registerData');
    if (data) {
      setRegisterData(JSON.parse(data));
    } else {
      navigate('/authentication/register');
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
        registerData.user_name,
        registerData.email,
        parseInt(otp),
        OtpEnum.REGISTER
      );

      // Nếu xác nhận OTP thành công, gọi API đăng ký
      await authenticationApiService.Register(registerData);
      
      // Xóa dữ liệu đăng ký khỏi localStorage
      localStorage.removeItem('registerData');
      
      navigate('/authentication/login');
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  if (!registerData) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Xác Nhận OTP
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Vui lòng nhập mã OTP đã được gửi đến email {registerData.email}
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