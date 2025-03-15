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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi, { Order } from '../services/API/OrderApi';
import { orderStatusConfig, paymentStatusConfig } from '../config/statusConfig';
import { toast } from 'react-toastify';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
                        <Box display="flex" alignItems="center">
                          <img
                            src={detail.product_detail.image_url}
                            alt={detail.product_detail.name}
                            style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{detail.product_detail.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {detail.product_detail.color} - {detail.product_detail.size}
                        </Typography>
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
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetail;