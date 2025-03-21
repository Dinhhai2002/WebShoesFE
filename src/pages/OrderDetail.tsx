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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">
          Chi tiết đơn hàng #{order.id}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/order-history')}>
          Quay lại
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Thông tin đơn hàng */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin đơn hàng
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày đặt hàng
                  </Typography>
                  <Typography>{order.created_at}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái đơn hàng
                  </Typography>
                  <Chip
                    label={orderStatusConfig[order.status]?.label || 'Không xác định'}
                    color={orderStatusConfig[order.status]?.color as any || 'default'}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái thanh toán
                  </Typography>
                  <Chip
                    label={paymentStatusConfig[order.payment_status]?.label || 'Không xác định'}
                    color={paymentStatusConfig[order.payment_status]?.color as any || 'default'}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Thông tin địa chỉ giao hàng */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Địa chỉ giao hàng
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người nhận
                  </Typography>
                  <Typography>{order.shipping_name}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography>{order.shipping_phone}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography>
                    {order.shipping_address}
                    {order.shipping_ward_name && `, ${order.shipping_ward_name}`}
                    {order.shipping_district_name && `, ${order.shipping_district_name}`}
                    {order.shipping_city_name && `, ${order.shipping_city_name}`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Chi tiết sản phẩm */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell>Thông tin</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
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
                          <Box display="flex" alignItems="center">
                            <img
                              src={detail.product_detail.image_url}
                              alt={detail.product_detail.name}
                              style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }}
                            />
                          </Box>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={1}>
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
                              variant="body2"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordWrap: 'break-word',
                                lineHeight: 1.2,
                                height: '2.4em',
                                width: '40%',
                                '&:hover': {
                                  color: 'primary.main'
                                }
                              }}
                            >
                              {detail.product_detail.name}
                            </Typography>
                          </Link>
                          <Typography variant="caption" color="text.secondary">
                            {detail.product_detail.color} - {detail.product_detail.size}
                          </Typography>
                          {order.status === StatusOrderEnum.DELIVERED && (
                            <Box display="flex" justifyContent="flex-start" mt={1}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Rating size="small" value={1} readOnly />}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  '&:hover': {
                                    backgroundColor: 'primary.light',
                                    color: 'white',
                                  }
                                }}
                                onClick={() => handleReviewOpen(detail.product_detail.product_id, detail.product_detail.name)}
                              >
                                Đánh giá sản phẩm
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatPrice(detail.price)}</TableCell>
                      <TableCell align="right">{detail.quantity}</TableCell>
                      <TableCell align="right">{formatPrice(detail.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Tạm tính:</Typography>
                    <Typography>{formatPrice(order.price)}</Typography>
                  </Box>
                </Grid>
                {order.discount_amount > 0 && (
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Giảm giá:</Typography>
                      <Typography color="error">
                        -{formatPrice(order.discount_amount)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="h6">Tổng cộng:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatPrice(order.total_price)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {order.payment_status === 1 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      const response = await orderApi.getPaymentUrl(order.id);
                      if (response.data) {
                        window.location.href = response.data;
                      }
                    } catch (error) {
                      toast.error('Không thể tạo link thanh toán');
                    }
                  }}
                >
                  Thanh toán
                </Button>
              </Box>
            )}
            {order.status !== StatusOrderEnum.DELIVERED && 
             order.status !== StatusOrderEnum.CANCELLED && 
             order.status !== StatusOrderEnum.SHIPPED && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCancelClick}
                >
                  Hủy đơn hàng
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal Thêm Review */}
      <Dialog open={reviewOpen} onClose={handleReviewClose}>
        <DialogTitle>Đánh giá sản phẩm {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography component="legend">Đánh giá của bạn</Typography>
            <Rating 
              value={newRating} 
              onChange={(_, value) => setNewRating(value)}
              size="large"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Nhập đánh giá của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewClose} color="secondary" disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleAddReview} 
            variant="contained" 
            color="primary"
            disabled={submitting || !newRating || !newComment.trim()}
          >
            {submitting ? "Đang gửi..." : "Gửi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogTitle id="cancel-dialog-title">
          Xác nhận hủy đơn hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Bạn có chắc chắn muốn hủy đơn hàng #{order.id} không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            Hủy
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained" autoFocus>
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;