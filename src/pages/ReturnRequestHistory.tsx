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
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import returnRequestApi, { ReturnRequestResponse } from '../services/API/ReturnRequestApi';
import { 
  ReturnStatus, 
  getReturnStatusLabel, 
  getReturnStatusColor,
  ReturnType,
  getReturnTypeLabel,
  canUserCancel,
  isExchangeType
} from '../constants/ReturnRequestConstants';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import exchangeRequestApi, { ExchangeRequestResponse, ExchangeRequestDetailResponse } from '../services/API/ExchangeRequestApi';
import productDetailApi, { ProductDetail } from '../services/API/ProductDetailApi';

interface ReturnRequestHistoryProps {}

const ReturnRequestHistory: React.FC<ReturnRequestHistoryProps> = () => {
  const navigate = useNavigate();
  const [returnRequests, setReturnRequests] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequestResponse | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [exchangeDetails, setExchangeDetails] = useState<{ [returnRequestId: number]: ExchangeRequestResponse | null }>({});
  const [productDetails, setProductDetails] = useState<{ [productId: number]: ProductDetail | null }>({});

  useEffect(() => {
    fetchReturnRequests();
  }, [statusFilter, page, itemsPerPage]);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('Vui lòng đăng nhập để xem yêu cầu trả hàng');
        return;
      }

      const userData = JSON.parse(user);
      const response = await returnRequestApi.getAll({
        user_id: userData.id,
        status: statusFilter || undefined,
        page: page,
        limit: itemsPerPage
      });
      
      setReturnRequests(response.data.list);
      setTotalRecords(response.data.total_record);
      setTotalPages(Math.ceil(response.data.total_record / itemsPerPage));
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toast.error('Không thể tải danh sách yêu cầu trả hàng');
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

  const handleCancelClick = (request: ReturnRequestResponse) => {
    setSelectedRequest(request);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedRequest) return;
    
    try {
      await returnRequestApi.cancelReturnRequest(selectedRequest.id);
      toast.success('Hủy yêu cầu trả hàng thành công');
      setCancelDialogOpen(false);
      fetchReturnRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.messageError || 'Không thể hủy yêu cầu trả hàng');
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleExpandClick = async (requestId: number) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
    const request = returnRequests.find(r => r.id === requestId);
    if (request && isExchangeType(request.return_type) && !exchangeDetails[requestId]) {
      try {
        const res = await exchangeRequestApi.getExchangeRequestByReturnRequestId(requestId);
        setExchangeDetails(prev => ({ ...prev, [requestId]: res.data }));
        // Fetch new product details for all exchange details
        res.data.details.forEach(async (detail: ExchangeRequestDetailResponse) => {
          if (detail.new_product_detail_id && !productDetails[detail.new_product_detail_id]) {
            try {
              const prodRes = await productDetailApi.findOne(detail.new_product_detail_id);
              setProductDetails(prev => ({ ...prev, [detail.new_product_detail_id!]: prodRes.data }));
            } catch {}
          }
        });
      } catch {}
    }
  };

  const getStatusColor = (status: string) => {
    const color = getReturnStatusColor(status);
    return color === '#000000' ? 'default' : 'primary';
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
        Lịch sử yêu cầu trả hàng
      </Typography>

      {/* Filters Row */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái yêu cầu</InputLabel>
          <Select
            value={statusFilter}
            label="Trạng thái yêu cầu"
            onChange={(e) => {
              setStatusFilter(e.target.value as string);
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {Object.values(ReturnStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {getReturnStatusLabel(status)}
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

      {returnRequests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Không có yêu cầu trả hàng nào</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã yêu cầu</TableCell>
                  <TableCell>Đơn hàng</TableCell>
                  <TableCell>Loại trả hàng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returnRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <TableRow>
                      <TableCell>#{request.id}</TableCell>
                      <TableCell>#{request.order_id}</TableCell>
                      <TableCell>
                        <Chip
                          label={getReturnTypeLabel(request.return_type)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getReturnStatusLabel(request.status)}
                          sx={{
                            backgroundColor: getReturnStatusColor(request.status),
                            color: 'white'
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleExpandClick(request.id)}
                          endIcon={expandedRequest === request.id ? <ExpandLess /> : <ExpandMore />}
                          sx={{ mr: 1 }}
                        >
                          {expandedRequest === request.id ? 'Thu gọn' : 'Chi tiết'}
                        </Button>
                        {canUserCancel(request.status) && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleCancelClick(request)}
                          >
                            Hủy yêu cầu
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Card variant="outlined">
                              <CardContent>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      {isExchangeType(request.return_type) ? 'Lý do đổi hàng' : 'Lý do trả hàng'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                      {request.return_reason}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Ghi chú từ admin
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                      {request.admin_notes || 'Chưa có ghi chú'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                      Chi tiết sản phẩm {isExchangeType(request.return_type) ? 'đổi hàng' : 'trả hàng'}
                                    </Typography>
                                    {isExchangeType(request.return_type) && exchangeDetails[request.id] ? (
                                      <Grid container spacing={2}>
                                        {exchangeDetails[request.id]?.details.map((detail, index) => (
                                          <Grid item xs={12} key={index}>
                                            <Card variant="outlined" sx={{ p: 2 }}>
                                              <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Sản phẩm cũ
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.old_product_detail?.name || detail.old_product_detail_id || 'Không xác định'}
                                                  </Typography>
                                                  {detail.old_product_detail?.image_url && (
                                                    <img src={detail.old_product_detail.image_url} alt="old" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, marginTop: 4 }} />
                                                  )}
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Sản phẩm mới
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.new_product_detail_id && productDetails[detail.new_product_detail_id]?.name}
                                                  </Typography>
                                                  {detail.new_product_detail_id && productDetails[detail.new_product_detail_id]?.image_url && (
                                                    <img src={productDetails[detail.new_product_detail_id]?.image_url!} alt="new" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, marginTop: 4 }} />
                                                  )}
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Số lượng
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.quantity}
                                                  </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Lý do đổi hàng
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.exchange_reason}
                                                  </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Tình trạng sản phẩm
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.condition_description}
                                                  </Typography>
                                                  {detail.images && detail.images.length > 0 && (
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                      {detail.images.map((img, imgIdx) => (
                                                        <Box key={imgIdx} sx={{ width: 64, height: 64, borderRadius: 1, overflow: 'hidden', border: '1px solid #eee' }}>
                                                          <img
                                                            src={img}
                                                            alt={`Ảnh ${imgIdx + 1}`}
                                                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }}
                                                          />
                                                        </Box>
                                                      ))}
                                                    </Box>
                                                  )}
                                                </Grid>
                                              </Grid>
                                            </Card>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    ) : (
                                      <Grid container spacing={2}>
                                        {request.details.map((detail, index) => (
                                          <Grid item xs={12} key={index}>
                                            <Card variant="outlined" sx={{ p: 2 }}>
                                              <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Sản phẩm
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.product_detail_id || 'Không xác định'}
                                                  </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Số lượng
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.quantity}
                                                  </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    {isExchangeType(request.return_type) ? 'Lý do đổi hàng' : 'Lý do trả hàng'}
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.return_reason}
                                                  </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                  <Typography variant="subtitle2" color="text.secondary">
                                                    Tình trạng sản phẩm
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {detail.condition_description}
                                                  </Typography>
                                                  {detail.images && detail.images.length > 0 && (
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                      {detail.images.map((img, imgIdx) => (
                                                        <Box key={imgIdx} sx={{ width: 64, height: 64, borderRadius: 1, overflow: 'hidden', border: '1px solid #eee' }}>
                                                          <img
                                                            src={img}
                                                            alt={`Ảnh ${imgIdx + 1}`}
                                                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }}
                                                          />
                                                        </Box>
                                                      ))}
                                                    </Box>
                                                  )}
                                                </Grid>
                                              </Grid>
                                            </Card>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    )}
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
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

      {/* Cancel Request Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogTitle id="cancel-dialog-title">
          Xác nhận hủy yêu cầu trả hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Bạn có chắc chắn muốn hủy yêu cầu trả hàng #{selectedRequest?.id} không? Hành động này không thể hoàn tác.
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

export default ReturnRequestHistory; 