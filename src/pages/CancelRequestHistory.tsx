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
  Collapse,
  Grid,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import cancelOrderApi, { CancelOrderResponse } from '../services/API/CancelOrderApi';
import orderApi, { Order } from '../services/API/OrderApi';
import { toast } from 'react-toastify';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { formatPrice, formatDate } from '../utils/formatters';

const CancelRequestHistory: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CancelOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ [key: number]: Order }>({});
  const [loadingOrder, setLoadingOrder] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchCancelRequests();
  }, [statusFilter, page, itemsPerPage]);

  const fetchCancelRequests = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('Vui lòng đăng nhập để xem lịch sử yêu cầu hủy đơn');
        return;
      }

      const userData = JSON.parse(user);
      const response = await cancelOrderApi.getAll({
        user_id: userData.id,
        status: statusFilter || undefined,
        page: page,
        limit: itemsPerPage
      });
      
      setRequests(response.data.list);
      setTotalRecords(response.data.totalRecord);
      setTotalPages(Math.ceil(response.data.totalRecord / itemsPerPage));
    } catch (error) {
      console.error('Error fetching cancel requests:', error);
      toast.error('Không thể tải danh sách yêu cầu hủy đơn');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event: any) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleExpandClick = async (requestId: number, orderId: number) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
      return;
    }

    setExpandedRequest(requestId);
    
    if (!orderDetails[orderId]) {
      try {
        setLoadingOrder(prev => ({ ...prev, [orderId]: true }));
        const response = await orderApi.findOne(orderId);
        setOrderDetails(prev => ({ ...prev, [orderId]: response.data }));
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setLoadingOrder(prev => ({ ...prev, [orderId]: false }));
      }
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
    }
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
        Lịch sử yêu cầu hủy đơn hàng
      </Typography>

      {/* Filters Row */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái yêu cầu</InputLabel>
          <Select
            value={statusFilter}
            label="Trạng thái yêu cầu"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="PENDING">Chờ xử lý</MenuItem>
            <MenuItem value="APPROVED">Đã duyệt</MenuItem>
            <MenuItem value="REJECTED">Đã từ chối</MenuItem>
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

      {requests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Không có yêu cầu hủy đơn hàng nào</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã yêu cầu</TableCell>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Lý do hủy</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <React.Fragment key={request.id}>
                    <TableRow>
                      <TableCell>#{request.id}</TableCell>
                      <TableCell>#{request.order_id}</TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {request.cancel_reason}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(request.status)}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleExpandClick(request.id, request.order_id)}
                          endIcon={expandedRequest === request.id ? <ExpandLess /> : <ExpandMore />}
                        >
                          {expandedRequest === request.id ? 'Thu gọn' : 'Chi tiết'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            {loadingOrder[request.order_id] ? (
                              <Box display="flex" justifyContent="center" p={2}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : orderDetails[request.order_id] ? (
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography variant="h6" gutterBottom>
                                    Thông tin đơn hàng
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Địa chỉ giao hàng
                                  </Typography>
                                  <Typography variant="body2">
                                    {orderDetails[request.order_id].shipping_name} - {orderDetails[request.order_id].shipping_phone}
                                  </Typography>
                                  <Typography variant="body2">
                                    {orderDetails[request.order_id].shipping_address}, {orderDetails[request.order_id].shipping_ward_name}, {orderDetails[request.order_id].shipping_district_name}, {orderDetails[request.order_id].shipping_city_name}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Tổng tiền đơn hàng
                                  </Typography>
                                  <Typography variant="body2">
                                    Tổng tiền hàng: {formatPrice(orderDetails[request.order_id].price)}
                                  </Typography>
                                  <Typography variant="body2">
                                    Phí vận chuyển: {formatPrice(orderDetails[request.order_id].amount_shipping)}
                                  </Typography>
                                  <Typography variant="body2">
                                    Giảm giá: {formatPrice(orderDetails[request.order_id].discount_amount)}
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    Tổng cộng: {formatPrice(orderDetails[request.order_id].total_price)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 2 }} />
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Sản phẩm trong đơn
                                  </Typography>
                                  <TableContainer>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Sản phẩm</TableCell>
                                          <TableCell>Số lượng</TableCell>
                                          <TableCell>Đơn giá</TableCell>
                                          <TableCell>Thành tiền</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {orderDetails[request.order_id].order_detail.map((detail) => (
                                          <TableRow key={detail.id}>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                {detail.product_detail.image_url && (
                                                  <img 
                                                    src={detail.product_detail.image_url} 
                                                    alt={detail.product_detail.name}
                                                    style={{ width: 40, height: 40, objectFit: 'cover' }}
                                                  />
                                                )}
                                                <Box>
                                                  <Typography variant="body2">
                                                    {detail.product_detail.name}
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary">
                                                    {detail.product_detail.color} - {detail.product_detail.size} - {detail.product_detail.material}
                                                  </Typography>
                                                </Box>
                                              </Box>
                                            </TableCell>
                                            <TableCell>{detail.quantity}</TableCell>
                                            <TableCell>{formatPrice(detail.price)}</TableCell>
                                            <TableCell>{formatPrice(detail.total_price)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Grid>
                                {request.admin_notes && (
                                  <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                      Ghi chú từ admin
                                    </Typography>
                                    <Typography variant="body2">
                                      {request.admin_notes}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            ) : (
                              <Typography color="error">
                                Không thể tải thông tin đơn hàng
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Hiển thị {Math.min(itemsPerPage * page, totalRecords)} / {totalRecords} yêu cầu
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
    </Container>
  );
};

export default CancelRequestHistory; 