import React, { useEffect, useState, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { 
  CheckCircleOutline, 
  ErrorOutline,
  Home as HomeIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import orderApi from '../services/API/OrderApi';
import { PaymentStatusEnum } from '../utils/enum/PaymentStatusEnum';
import { toast } from 'react-toastify';
import { routes } from '../routes/routes';
import { CartContext } from '../context/CartContext';

const PaymentSuccess: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const hasUpdatedRef = useRef(false);
  const { resetCart } = React.useContext(CartContext);

  useEffect(() => {
    const updateOrderStatus = async () => {
      // Kiểm tra nếu đã cập nhật rồi thì không cập nhật nữa
      if (hasUpdatedRef.current) {
        return;
      }

      try {
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        const orderId = searchParams.get('vnp_OrderInfo')?.split(':')[1];
        const isCod = searchParams.get('cod') === 'true';

        // Đánh dấu là đã cập nhật để tránh gọi API nhiều lần
        hasUpdatedRef.current = true;

        if (isCod) {
          // Trường hợp thanh toán COD
          setIsSuccess(true);
          toast.success('Đặt hàng thành công!');
          resetCart();
        } else if (vnp_ResponseCode === '00') {
          // Trường hợp thanh toán online thành công
          if (!orderId) {
            setIsSuccess(false);
            toast.error('Không tìm thấy thông tin đơn hàng!');
            return;
          }
          // Update payment status to PAID
          await orderApi.changePaymentStatus(parseInt(orderId), PaymentStatusEnum.PAID);
          setIsSuccess(true);
          toast.success('Thanh toán thành công!');
          resetCart();
        } else {
          // Trường hợp thanh toán online thất bại
          if (!orderId) {
            setIsSuccess(false);
            toast.error('Không tìm thấy thông tin đơn hàng!');
            return;
          }
          // Update payment status to FAILED
          await orderApi.changePaymentStatus(parseInt(orderId), PaymentStatusEnum.FAILED);
          setIsSuccess(false);
          toast.error('Thanh toán thất bại!');
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        setIsSuccess(false);
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng!');
      } finally {
        setIsLoading(false);
      }
    };

    updateOrderStatus();

    // Cleanup function
    return () => {
      hasUpdatedRef.current = false;
    };
  }, [searchParams]);

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h5" fontWeight={500}>
              Đang xử lý thanh toán...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vui lòng không đóng trang này
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: 'blur(10px)',
        }}
      >
        {isSuccess ? (
          <>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <CheckCircleOutline
                sx={{
                  fontSize: 64,
                  color: 'success.main',
                }}
              />
            </Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {searchParams.get('cod') === 'true' ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {searchParams.get('cod') === 'true' 
                ? 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.'
                : 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.'}
            </Typography>

            <Box sx={{ 
              p: 3, 
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              mb: 4
            }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocalShippingIcon color="success" />
                  <Typography>
                    Đơn hàng của bạn sẽ được giao trong vòng 3-5 ngày làm việc
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ReceiptIcon color="success" />
                  <Typography>
                    Bạn có thể theo dõi đơn hàng trong mục "Lịch sử đơn hàng"
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.error.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                }}
              />
            </Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Thanh toán thất bại!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
            </Typography>
          </>
        )}

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              flex: { xs: '1', sm: '0 0 auto' },
            }}
          >
            Về trang chủ
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShoppingBagIcon />}
            onClick={() => navigate(routes.ProductList)}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              flex: { xs: '1', sm: '0 0 auto' },
            }}
          >
            Tiếp tục mua sắm
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate(routes.OrderHistory)}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              flex: { xs: '1', sm: '0 0 auto' },
            }}
          >
            Xem đơn hàng
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess; 