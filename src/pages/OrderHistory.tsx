import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import orderApi from '../services/API/OrderApi';
import { StatusOrderEnum } from '../utils/enum/StatusOrderEnum';
import { PaymentStatusEnum } from '../utils/enum/PaymentStatusEnum';
import { PaymentMethodEnum } from '../utils/enum/PaymentMethodEnum';
import { orderStatusConfig, paymentStatusConfig } from '../config/statusConfig';
import { toast } from 'react-toastify';

type ChipColor = 'warning' | 'info' | 'primary' | 'secondary' | 'success' | 'error' | 'default';

interface StatusConfig {
  color: ChipColor;
  label: string;
}

interface OrderDetail {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  created_at: string;
  total_price: number;
  status: StatusOrderEnum;
  payment_status: PaymentStatusEnum;
  payment_method: PaymentMethodEnum;
  order_detail?: OrderDetail[];
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<number>(-1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('Vui lòng đăng nhập để xem lịch sử đơn hàng');
        return;
      }

      const userData = JSON.parse(user);
      const response = await orderApi.findAll({
        status: statusFilter,
        page: page,
        limit: itemsPerPage,
        user_id: userData.id
      });
      
      const formattedOrders: Order[] = response.data.list.map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        total_price: order.total_price,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        order_detail: order.order_detail
      }));
      
      setOrders(formattedOrders);
      setTotalRecords(response.data.total_record);
      setTotalPages(Math.ceil(response.data.total_record / itemsPerPage));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1); // Reset về trang 1 khi thay đổi số lượng items/page
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderApi.cancelOrder(selectedOrder.id);
      toast.success('Hủy đơn hàng thành công');
      setCancelDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.messageError || 'Không thể hủy đơn hàng');
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lịch sử đơn hàng
      </Typography>

      {/* Filters Row */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái đơn hàng</InputLabel>
          <Select
            value={statusFilter}
            label="Trạng thái đơn hàng"
            onChange={(e) => {
              setStatusFilter(e.target.value as number);
              setPage(1);
            }}
          >
            <MenuItem value={-1}>Tất cả</MenuItem>
            {Object.entries(orderStatusConfig).map(([status, config]) => (
              <MenuItem key={status} value={parseInt(status)}>
                {config.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Hiển thị</InputLabel>
          <Select
            value={itemsPerPage}
            label="Hiển thị"
            onChange={handleItemsPerPageChange}
          >
            <MenuItem value={5}>5 / trang</MenuItem>
            <MenuItem value={10}>10 / trang</MenuItem>
            <MenuItem value={20}>20 / trang</MenuItem>
            <MenuItem value={50}>50 / trang</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Không có đơn hàng nào</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Ngày đặt</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái đơn hàng</TableCell>
                  <TableCell>Trạng thái thanh toán</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.created_at}</TableCell>
                    <TableCell>{formatPrice(order.total_price)}</TableCell>
                    <TableCell>
                      {order.status && orderStatusConfig[order.status] ? (
                        <Chip
                          label={orderStatusConfig[order.status].label}
                          color={orderStatusConfig[order.status].color}
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="Không xác định"
                          color="default"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {order.payment_status && paymentStatusConfig[order.payment_status] ? (
                        <Chip
                          label={paymentStatusConfig[order.payment_status].label}
                          color={paymentStatusConfig[order.payment_status].color}
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="Không xác định"
                          color="default"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/order/${order.id}`)}
                        sx={{ mr: 1 }}
                      >
                        Chi tiết
                      </Button>
                      {order.payment_status === PaymentStatusEnum.PENDING && order.payment_method === PaymentMethodEnum.VNPAY && (
                        <Button
                          variant="contained"
                          size="small"
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
                          sx={{ mr: 1 }}
                        >
                          Thanh toán
                        </Button>
                      )}
                      {order.status !== StatusOrderEnum.DELIVERED && 
                       order.status !== StatusOrderEnum.CANCELLED && 
                       order.status !== StatusOrderEnum.SHIPPED && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleCancelClick(order)}
                        >
                          Hủy đơn
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination with items per page info */}
          <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Hiển thị {Math.min(itemsPerPage * page, totalRecords)} / {totalRecords} đơn hàng
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </Stack>
        </>
      )}

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
            Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrder?.id} không? Hành động này không thể hoàn tác.
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

export default OrderHistory; 