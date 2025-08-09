import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  DialogContentText,
  Fade
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import orderApi, { Order } from '../services/API/OrderApi';
import { orderStatusConfig, paymentStatusConfig } from '../config/statusConfig';
import { toast } from 'react-toastify';
import reviewApi from '../services/API/ReviewApi';
import { useAuth } from '../context/AuthContext';
import { StatusOrderEnum } from '../utils/enum/StatusOrderEnum';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import DiscountIcon from '@mui/icons-material/Discount';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { alpha } from '@mui/material/styles';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);
  const [newRating, setNewRating] = useState<number | null>(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderApi.findOne(Number(id));
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const handleReviewOpen = (productId: number, productName: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }
    setSelectedProduct({ id: productId, name: productName });
    setReviewOpen(true);
  };

  const handleReviewClose = () => {
    setReviewOpen(false);
    setSelectedProduct(null);
    setNewComment("");
    setNewRating(5);
  };

  const handleAddReview = async () => {
    if (!newRating || !newComment.trim() || !selectedProduct) return;

    try {
      setSubmitting(true);
      const response = await reviewApi.create({
        product_id: selectedProduct.id,
        rating: newRating,
        comment: newComment.trim()
      });

      if (response.status === 200) {
        handleReviewClose();
      }
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!order) return;

    try {
      await orderApi.cancelOrder(order.id);
      toast.success('Hủy đơn hàng thành công');
      setCancelDialogOpen(false);
      navigate('/order-history');
    } catch (error: any) {
      toast.error(error.response?.data?.messageError || 'Không thể hủy đơn hàng');
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          Không tìm thấy đơn hàng
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 4,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReceiptLongIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Chi tiết đơn hàng #{order.id}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Ngày đặt: {order.created_at}
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/order-history')}
          startIcon={<ArrowBackIcon />}
          sx={{
            borderRadius: 2,
            '&:hover': {
              transform: 'translateX(-4px)'
            }
          }}
        >
          Quay lại
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status Overview */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              background: theme => `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.05)})`,
              border: '1px solid',
              borderColor: 'primary.light',
              borderRadius: 3
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 1
                    }}
                  >
                    <ShoppingBagIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái đơn hàng
                    </Typography>
                    <Chip
                      label={orderStatusConfig[order.status]?.label || 'Không xác định'}
                      color={orderStatusConfig[order.status]?.color as any || 'default'}
                      sx={{ 
                        mt: 0.5,
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 1
                    }}
                  >
                    <LocalShippingIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái thanh toán
                    </Typography>
                    <Chip
                      label={paymentStatusConfig[order.payment_status]?.label || 'Không xác định'}
                      color={paymentStatusConfig[order.payment_status]?.color as any || 'default'}
                      sx={{ 
                        mt: 0.5,
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Shipping Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Thông tin giao hàng
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Người nhận
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {order.shipping_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Số điện thoại
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {order.shipping_phone}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Địa chỉ
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {order.shipping_address}, {order.shipping_ward_name}, {order.shipping_district_name}, {order.shipping_city_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Phương thức thanh toán
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {order.payment_method === 1 ? 'Thanh toán khi nhận hàng (COD)' : 
                   order.payment_method === 2 ? 'Thanh toán qua VNPAY' : 
                   'Thanh toán tại quầy'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Voucher Information */}
        {order.voucher && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <DiscountIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Thông tin Voucher
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Mã Voucher
                  </Typography>
                  <Chip 
                    label={order.voucher.code}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Loại giảm giá
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.voucher.discount_type === 1 ? 'Giảm theo phần trăm' : 'Giảm theo số tiền'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Giá trị giảm
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color="error.main">
                    {order.voucher.discount_type === 1
                      ? `${order.voucher.discount_value}%`
                      : formatPrice(order.voucher.discount_value)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Giảm tối đa
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatPrice(order.voucher.max_discount)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Products List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Sản phẩm đã mua
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thông tin</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Đơn giá</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Số lượng</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Thành tiền</TableCell>
                    {order.status === StatusOrderEnum.DELIVERED && (
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Đánh giá</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.order_detail.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <Link
                          to={`/product/${detail.product_detail.product_id}`}
                          state={{
                            colorId: detail.product_detail.color_id,
                            sizeId: detail.product_detail.size_id,
                            materialId: detail.product_detail.material_id,
                            selectedProduct: detail.product_detail
                          }}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              '&:hover img': {
                                transform: 'scale(1.05)',
                                transition: 'transform 0.3s ease'
                              }
                            }}
                          >
                            <img
                              src={detail.product_detail.image_url}
                              alt={detail.product_detail.name}
                              style={{ 
                                width: 80, 
                                height: 80, 
                                objectFit: 'cover', 
                                borderRadius: 8,
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          </Box>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Link
                            to={`/product/${detail.product_detail.product_id}`}
                            state={{
                              colorId: detail.product_detail.color_id,
                              sizeId: detail.product_detail.size_id,
                              materialId: detail.product_detail.material_id,
                              selectedProduct: detail.product_detail
                            }}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 500,
                                color: 'text.primary',
                                '&:hover': {
                                  color: 'primary.main'
                                }
                              }}
                            >
                              {detail.product_detail.name}
                            </Typography>
                          </Link>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={detail.product_detail.color}
                              size="small"
                              sx={{ bgcolor: 'grey.100' }}
                            />
                            <Chip 
                              label={detail.product_detail.size}
                              size="small"
                              sx={{ bgcolor: 'grey.100' }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={500}>
                          {formatPrice(detail.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={500}>
                          {detail.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="primary.main">
                          {formatPrice(detail.total_price)}
                        </Typography>
                      </TableCell>
                      {order.status === StatusOrderEnum.DELIVERED && (
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleReviewOpen(detail.product_detail.product_id, detail.product_detail.name)}
                            sx={{
                              borderRadius: 2,
                              minWidth: 100
                            }}
                          >
                            Đánh giá
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Order Summary */}
            <Box 
              sx={{ 
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={8} />
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Tạm tính:</Typography>
                      <Typography>
                        {formatPrice(order.order_detail.reduce((sum, detail) => sum + detail.total_price, 0))}
                      </Typography>
                    </Box>
                    {order.discount_amount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="error.main">Giảm giá:</Typography>
                        <Typography color="error.main">
                          -{formatPrice(order.discount_amount)}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Phí vận chuyển:</Typography>
                      <Typography>{formatPrice(order.amount_shipping)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight={600}>Tổng cộng:</Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {formatPrice(order.total_price)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Review Dialog */}
      <Dialog 
        open={reviewOpen} 
        onClose={handleReviewClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Đánh giá sản phẩm
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {selectedProduct?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Đánh giá của bạn
              </Typography>
              <Rating
                value={newRating}
                onChange={(_, value) => setNewRating(value)}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: 'primary.main'
                  }
                }}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Nhập đánh giá của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button 
            onClick={handleReviewClose}
            disabled={submitting}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddReview}
            variant="contained"
            disabled={submitting || !newRating || !newComment.trim()}
            sx={{ borderRadius: 2, minWidth: 100 }}
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        TransitionComponent={Fade}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600} color="error">
            Xác nhận hủy đơn hàng
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>
            Bạn có chắc chắn muốn hủy đơn hàng #{order.id}? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button 
            onClick={handleCancelClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Không, giữ lại
          </Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Có, hủy đơn hàng
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;
