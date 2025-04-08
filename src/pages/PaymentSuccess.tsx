import React, { useEffect, useState, useRef } from 'react';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orderApi from '../services/API/OrderApi';
import { PaymentStatusEnum } from '../utils/enum/PaymentStatusEnum';
import { toast } from 'react-toastify';
import { routes } from '../routes/routes';
import { CartContext } from '../context/CartContext';

const PaymentSuccess: React.FC = () => {
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
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang xử lý thanh toán...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4
        }}
      >
        {isSuccess ? (
          <>
            <CheckCircleOutline
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              {searchParams.get('cod') === 'true' ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {searchParams.get('cod') === 'true' 
                ? 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.'
                : 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.'}
            </Typography>
          </>
        ) : (
          <>
            <ErrorOutline
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              Thanh toán thất bại!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
            </Typography>
          </>
        )}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')} 
            sx={{ mr: 2 }}
          >
            Về trang chủ
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(routes.ProductList)}
            sx={{ mr: 2 }}
          >
            Tiếp tục mua sắm
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate(routes.OrderHistory)}
          >
            Xem lịch sử đơn hàng
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PaymentSuccess; 