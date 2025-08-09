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
  Divider,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import cancelOrderApi, { CancelOrderResponse } from '../services/API/CancelOrderApi';
import orderApi, { Order } from '../services/API/OrderApi';
import { toast } from 'react-toastify';
import { 
  ExpandMore, 
  ExpandLess, 
  Search as SearchIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  FilterList as FilterListIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { formatPrice, formatDate } from '../utils/formatters';
import { debounce } from 'lodash';

const CancelRequestHistory: React.FC = () => {
  const theme = useTheme();
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    fetchCancelRequests();
  }, [statusFilter, page, itemsPerPage, searchTerm]);

  useEffect(() => {
    // Cleanup debounced search on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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
        limit: itemsPerPage,
        key_search: searchTerm.trim()
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

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
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
          Đang tải danh sách yêu cầu hủy đơn...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Lịch sử yêu cầu hủy đơn hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi các yêu cầu hủy đơn hàng của bạn
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
              placeholder="Tìm kiếm theo mã yêu cầu..."
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
              <InputLabel>Trạng thái yêu cầu</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái yêu cầu"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                sx={{ borderRadius: 2 }}
                startAdornment={<FilterListIcon sx={{ ml: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                <MenuItem value="REJECTED">Đã từ chối</MenuItem>
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

      {requests.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm 
              ? 'Không tìm thấy yêu cầu nào'
              : 'Không có yêu cầu hủy đơn hàng nào'
            }
          </Typography>
          <Typography color="text.secondary">
            {searchTerm 
              ? `Không tìm thấy yêu cầu nào cho từ khóa "${searchTerm}"`
              : 'Bạn chưa có yêu cầu hủy đơn hàng nào trong lịch sử'
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
              {requests.map((request) => (
                <Grid item xs={12} sm={6} md={4} key={request.id}>
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
                        <AssignmentIcon sx={{ color: getStatusColor(request.status) }} />
                        <Typography variant="h6" fontWeight={500}>
                          #{request.id}
                        </Typography>
                      </Box>

                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Mã đơn hàng
                          </Typography>
                          <Typography variant="body1">
                            #{request.order_id}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Ngày yêu cầu
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(request.created_at)}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Lý do hủy
                          </Typography>
                          <Typography 
                            variant="body1"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {request.cancel_reason}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Trạng thái
                          </Typography>
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </Box>

                        {request.admin_notes && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Ghi chú từ admin
                            </Typography>
                            <Typography 
                              variant="body1"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {request.admin_notes}
                            </Typography>
                          </Box>
                        )}

                        <Divider />

                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => handleExpandClick(request.id, request.order_id)}
                          endIcon={expandedRequest === request.id ? <ExpandLess /> : <ExpandMore />}
                          sx={{ borderRadius: 2 }}
                        >
                          {expandedRequest === request.id ? 'Thu gọn' : 'Chi tiết đơn hàng'}
                        </Button>

                        <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2 }}>
                            {loadingOrder[request.order_id] ? (
                              <Box display="flex" justifyContent="center" p={2}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : orderDetails[request.order_id] ? (
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Địa chỉ giao hàng
                                  </Typography>
                                  <Typography variant="body2">
                                    {orderDetails[request.order_id].shipping_name} - {orderDetails[request.order_id].shipping_phone}
                                  </Typography>
                                  <Typography variant="body2">
                                    {orderDetails[request.order_id].shipping_address}, {orderDetails[request.order_id].shipping_ward_name}, {orderDetails[request.order_id].shipping_district_name}, {orderDetails[request.order_id].shipping_city_name}
                                  </Typography>
                                </Box>

                                <Box>
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
                                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                                    Tổng cộng: {formatPrice(orderDetails[request.order_id].total_price)}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Sản phẩm trong đơn
                                  </Typography>
                                  {orderDetails[request.order_id].order_detail.map((detail) => (
                                    <Box 
                                      key={detail.id}
                                      sx={{
                                        display: 'flex',
                                        gap: 2,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'background.default'
                                      }}
                                    >
                                      <img 
                                        src={detail.product_detail.image_url} 
                                        alt={detail.product_detail.name}
                                        style={{ 
                                          width: 60, 
                                          height: 60, 
                                          objectFit: 'cover',
                                          borderRadius: theme.shape.borderRadius
                                        }}
                                      />
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                          {detail.product_detail.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {detail.product_detail.color} - {detail.product_detail.size} - {detail.product_detail.material}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                          <Typography variant="body2">
                                            SL: {detail.quantity}
                                          </Typography>
                                          <Typography variant="body2" color="primary.main">
                                            {formatPrice(detail.total_price)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Stack>
                            ) : (
                              <Typography color="error">
                                Không thể tải thông tin đơn hàng
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
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
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon sx={{ color: getStatusColor(request.status) }} />
                            #{request.id}
                          </Box>
                        </TableCell>
                        <TableCell>#{request.order_id}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography noWrap>
                            {request.cancel_reason}
                          </Typography>
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
                            sx={{ borderRadius: 2 }}
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
                                    <Typography variant="body1" fontWeight="bold" color="primary.main">
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
                                                  <img 
                                                    src={detail.product_detail.image_url} 
                                                    alt={detail.product_detail.name}
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
                                                  />
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
              Hiển thị {Math.min(itemsPerPage * page, totalRecords)} / {totalRecords} yêu cầu
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
    </Container>
  );
};

export default CancelRequestHistory; 