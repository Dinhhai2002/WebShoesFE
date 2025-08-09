import * as React from "react";
import { useEffect, useState } from 'react';
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
  Fade,
  TextField,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import orderApi from '../services/API/OrderApi';
import cancelOrderApi from '../services/API/CancelOrderApi';
import { StatusOrderEnum } from '../utils/enum/StatusOrderEnum';
import { PaymentStatusEnum } from '../utils/enum/PaymentStatusEnum';
import { PaymentMethodEnum } from '../utils/enum/PaymentMethodEnum';
import { orderStatusConfig, paymentStatusConfig } from '../config/statusConfig';
import { toast } from 'react-toastify';
import ReturnRequestModal from '../components/ReturnRequestModal';
import {
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';

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
  product_detail?: {
    id: number;
    name: string;
    image_url: string;
    color: string;
    size: string;
    material: string;
  };
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
  const theme = useTheme();
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
  const [returnRequestModalOpen, setReturnRequestModalOpen] = useState(false);
  const [selectedReturnOrderId, setSelectedReturnOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setPage(1);
    }, 3000),
    []
  );

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page, itemsPerPage, searchTerm]);

  useEffect(() => {
    // Cleanup debounced search on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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
        user_id: userData.id,
        key_search: searchTerm.trim() // Use key_search instead of search
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

  const handleItemsPerPageChange = (event: any) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1); // Reset về trang 1 khi thay đổi số lượng items/page
  };

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
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
      setCancelLoading(true);
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
        return;
      }

      // Nếu đơn hàng đang ở trạng thái PENDING, hủy trực tiếp
      if (selectedOrder.status === StatusOrderEnum.PENDING) {
        await orderApi.cancelOrder(selectedOrder.id);
        toast.success('Hủy đơn hàng thành công');
        setCancelDialogOpen(false);
        setSelectedOrder(null);
        fetchOrders();
        return;
      }

      // Nếu không có lý do hủy cho đơn đã xác nhận/đang xử lý
      if (!cancelReason.trim()) {
        toast.error('Vui lòng nhập lý do hủy đơn hàng');
        return;
      }

      // Tạo yêu cầu hủy đơn cho đơn hàng đã xác nhận hoặc đang xử lý
      const userData = JSON.parse(user);
      await cancelOrderApi.createCancelRequest({
        order_id: selectedOrder.id,
        user_id: userData.id,
        cancel_reason: cancelReason
      });

      toast.success('Gửi yêu cầu hủy đơn hàng thành công');
      setCancelDialogOpen(false);
      setSelectedOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (error: any) {
      const errorMessage = selectedOrder.status === StatusOrderEnum.PENDING
        ? 'Không thể hủy đơn hàng'
        : 'Không thể gửi yêu cầu hủy đơn hàng';
      toast.error(error.response?.data?.messageError || errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setSelectedOrder(null);
    setCancelReason('');
  };

  const handleReturnRequestClick = (order: Order) => {
    setSelectedReturnOrderId(order.id);
    setReturnRequestModalOpen(true);
  };

  const handleReturnRequestClose = () => {
    setReturnRequestModalOpen(false);
    setSelectedReturnOrderId(null);
  };

  const handleReturnRequestSuccess = () => {
    setReturnRequestModalOpen(false);
    setSelectedReturnOrderId(null);
    fetchOrders(); // Refresh the orders list
  };

  const getStatusIcon = (status: StatusOrderEnum) => {
    switch (status) {
      case StatusOrderEnum.PENDING:
        return <ReceiptIcon sx={{ color: 'warning.main' }} />;
      case StatusOrderEnum.PROCESSING:
        return <LocalShippingIcon sx={{ color: 'info.main' }} />;
      case StatusOrderEnum.SHIPPED:
        return <LocalShippingIcon sx={{ color: 'primary.main' }} />;
      case StatusOrderEnum.DELIVERED:
        return <LocalShippingIcon sx={{ color: 'success.main' }} />;
      default:
        return <ReceiptIcon sx={{ color: 'error.main' }} />;
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography color="text.secondary">
          Đang tải danh sách đơn hàng...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Lịch sử đơn hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </Typography>
      </Box>

      {/* Filters and View Toggle */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      sx={{ color: 'text.secondary' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái đơn hàng</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái đơn hàng"
                onChange={(e) => {
                  setStatusFilter(e.target.value as number);
                  setPage(1);
                }}
                sx={{ borderRadius: 2 }}
                startAdornment={<FilterListIcon sx={{ ml: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value={-1}>Tất cả</MenuItem>
                {Object.entries(orderStatusConfig).map(([status, config]) => (
                  <MenuItem key={status} value={parseInt(status)}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Hiển thị</InputLabel>
              <Select
                value={itemsPerPage}
                label="Hiển thị"
                onChange={handleItemsPerPageChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={5}>5 / trang</MenuItem>
                <MenuItem value={10}>10 / trang</MenuItem>
                <MenuItem value={20}>20 / trang</MenuItem>
                <MenuItem value={50}>50 / trang</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Chế độ danh sách">
                <IconButton 
                  onClick={() => setViewMode('list')}
                  sx={{ 
                    bgcolor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: viewMode === 'list' ? 'primary.main' : 'text.secondary'
                  }}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Chế độ lưới">
                <IconButton 
                  onClick={() => setViewMode('grid')}
                  sx={{ 
                    bgcolor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: viewMode === 'grid' ? 'primary.main' : 'text.secondary'
                  }}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {orders.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm 
              ? 'Không tìm thấy đơn hàng nào'
              : 'Không có đơn hàng nào'
            }
          </Typography>
          <Typography color="text.secondary">
            {searchTerm 
              ? `Không tìm thấy đơn hàng nào cho từ khóa "${searchTerm}"`
              : 'Bạn chưa có đơn hàng nào trong lịch sử'
            }
          </Typography>
          {searchTerm && (
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={clearSearch}
              sx={{ mt: 2 }}
            >
              Xóa tìm kiếm
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {orders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {getStatusIcon(order.status)}
                        <Typography variant="h6" fontWeight={500}>
                          #{order.id}
                        </Typography>
                      </Box>

                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Ngày đặt
                          </Typography>
                          <Typography variant="body1">
                            {order.created_at}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Tổng tiền
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color="primary.main">
                            {formatPrice(order.total_price)}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Trạng thái
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={orderStatusConfig[order.status]?.label || 'Không xác định'}
                              color={orderStatusConfig[order.status]?.color}
                              size="small"
                            />
                            <Chip
                              label={paymentStatusConfig[order.payment_status]?.label || 'Không xác định'}
                              color={paymentStatusConfig[order.payment_status]?.color}
                              size="small"
                            />
                          </Box>
                        </Box>

                        <Divider />

                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/order/${order.id}`)}
                            sx={{ borderRadius: 2 }}
                          >
                            Chi tiết
                          </Button>
                          {order.payment_status === PaymentStatusEnum.PENDING && 
                           order.payment_method === PaymentMethodEnum.VNPAY && (
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
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
                              sx={{ borderRadius: 2 }}
                            >
                              Thanh toán
                            </Button>
                          )}
                          {order.status !== StatusOrderEnum.DELIVERED && 
                           order.status !== StatusOrderEnum.CANCELLED && 
                           order.status !== StatusOrderEnum.SHIPPED && (
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleCancelClick(order)}
                              sx={{ borderRadius: 2 }}
                            >
                              Hủy đơn
                            </Button>
                          )}
                          {order.status === StatusOrderEnum.DELIVERED && (
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              color="warning"
                              onClick={() => handleReturnRequestClick(order)}
                              sx={{ borderRadius: 2 }}
                            >
                              Trả hàng
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
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
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(order.status)}
                          #{order.id}
                        </Box>
                      </TableCell>
                      <TableCell>{order.created_at}</TableCell>
                      <TableCell>
                        <Typography color="primary.main" fontWeight={500}>
                          {formatPrice(order.total_price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={orderStatusConfig[order.status]?.label || 'Không xác định'}
                          color={orderStatusConfig[order.status]?.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={paymentStatusConfig[order.payment_status]?.label || 'Không xác định'}
                          color={paymentStatusConfig[order.payment_status]?.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/order/${order.id}`)}
                            sx={{ borderRadius: 2 }}
                          >
                            Chi tiết
                          </Button>
                          {order.payment_status === PaymentStatusEnum.PENDING && 
                           order.payment_method === PaymentMethodEnum.VNPAY && (
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
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
                              sx={{ borderRadius: 2 }}
                            >
                              Thanh toán
                            </Button>
                          )}
                          {order.status !== StatusOrderEnum.DELIVERED && 
                           order.status !== StatusOrderEnum.CANCELLED && 
                           order.status !== StatusOrderEnum.SHIPPED && (
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleCancelClick(order)}
                              sx={{ borderRadius: 2 }}
                            >
                              Hủy đơn
                            </Button>
                          )}
                          {order.status === StatusOrderEnum.DELIVERED && (
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              color="warning"
                              onClick={() => handleReturnRequestClick(order)}
                              sx={{ borderRadius: 2 }}
                            >
                              Trả hàng
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          <Box 
            sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Hiển thị {Math.min(itemsPerPage * page, totalRecords)} / {totalRecords} đơn hàng
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Box>
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
          {selectedOrder?.status === StatusOrderEnum.PENDING 
            ? 'Xác nhận hủy đơn hàng'
            : 'Yêu cầu hủy đơn hàng'
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description" sx={{ mb: 2 }}>
            {selectedOrder?.status === StatusOrderEnum.PENDING 
              ? `Bạn có chắc chắn muốn hủy đơn hàng #${selectedOrder?.id}? Hành động này không thể hoàn tác.`
              : `Bạn đang yêu cầu hủy đơn hàng #${selectedOrder?.id}. Vui lòng cho biết lý do hủy đơn:`
            }
          </DialogContentText>
          {selectedOrder?.status !== StatusOrderEnum.PENDING && (
            <TextField
              autoFocus
              margin="dense"
              label="Lý do hủy đơn"
              fullWidth
              multiline
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              error={cancelDialogOpen && !cancelReason.trim()}
              helperText={cancelDialogOpen && !cancelReason.trim() ? "Vui lòng nhập lý do hủy đơn" : ""}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelClose} 
            color="primary"
            disabled={cancelLoading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            variant="contained" 
            disabled={cancelLoading || (selectedOrder?.status !== StatusOrderEnum.PENDING && !cancelReason.trim())}
            startIcon={cancelLoading ? <CircularProgress size={20} /> : null}
          >
            {cancelLoading 
              ? 'Đang xử lý...' 
              : selectedOrder?.status === StatusOrderEnum.PENDING
                ? 'Xác nhận hủy'
                : 'Gửi yêu cầu'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Request Modal */}
      <ReturnRequestModal
        open={returnRequestModalOpen}
        onClose={handleReturnRequestClose}
        orderId={selectedReturnOrderId}
        onSuccess={handleReturnRequestSuccess}
      />
    </Container>
  );
};

export default OrderHistory; 