import * as React from "react";
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { toast } from 'react-toastify';
import returnRequestApi, { 
  ReturnRequestRequest, 
  ReturnRequestDetailRequest,
  ReturnRequestResponse 
} from '../services/API/ReturnRequestApi';
import exchangeRequestApi, {
  ExchangeRequestRequest,
  ExchangeRequestDetailRequest
} from '../services/API/ExchangeRequestApi';
import orderApi from '../services/API/OrderApi';
import { 
  ReturnType, 
  getReturnTypeLabel, 
  isReturnType,
  isExchangeType,
  isFullType,
  isPartialType
} from '../constants/ReturnRequestConstants';
import { StatusOrderEnum } from '../utils/enum/StatusOrderEnum';
import { PaymentStatusEnum } from '../utils/enum/PaymentStatusEnum';
import { PaymentMethodEnum } from '../utils/enum/PaymentMethodEnum';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProductDetail {
  id: number;
  name: string;
  product_id: number;
  color_id: number;
  color: string;
  size_id: number;
  size: string;
  material_id: number;
  material: string;
  stock: number;
  price: number;
  image_url: string;
  status: number;
}

interface OrderDetail {
  id: number;
  order_id: number;
  product_detail_id: number;
  quantity: number;
  price: number;
  total_price: number;
  status: number;
  product_detail: ProductDetail;
}

interface Order {
  id: number;
  user_id: number;
  voucher_id: number | null;
  price: number;
  discount_amount: number;
  amount_shipping: number;
  total_price: number;
  payment_method: PaymentMethodEnum;
  payment_status: PaymentStatusEnum;
  status: StatusOrderEnum;
  created_at: string;
  order_detail: OrderDetail[];
  address_id: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_ward_id: number;
  shipping_ward_name: string;
  shipping_district_id: number;
  shipping_district_name: string;
  shipping_city_id: number;
  shipping_city_name: string;
  shipping_address: string;
}

interface ReturnRequestModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
  onSuccess?: () => void;
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  open,
  onClose,
  orderId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [returnType, setReturnType] = useState<ReturnType>(ReturnType.RETURN_FULL);
  const [returnReason, setReturnReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<number, ReturnRequestDetailRequest>>(new Map());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
      // Reset form when modal opens
      setReturnType(ReturnType.RETURN_FULL);
      setReturnReason('');
      setSelectedItems(new Map());
      setErrors({});
    }
  }, [open, orderId]);

  // Auto-select all items when return type changes to full
  useEffect(() => {
    if (order && isFullType(returnType)) {
      const allItems = new Map();
      order.order_detail.forEach((detail) => {
        allItems.set(detail.id, {
          product_id: detail.product_detail.product_id,
          product_detail_id: detail.product_detail_id,
          quantity: detail.quantity,
          return_reason: '',
          condition_description: '',
          images: [],
          price: detail.price
        });
      });
      setSelectedItems(allItems);
    } else if (order && !isFullType(returnType)) {
      // Clear selection for partial types
      setSelectedItems(new Map());
    }
  }, [returnType, order]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setOrderLoading(true);
      const response = await orderApi.findOne(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải thông tin đơn hàng');
      onClose();
    } finally {
      setOrderLoading(false);
    }
  };

  const handleItemToggle = (detail: OrderDetail) => {
    const newSelectedItems = new Map(selectedItems);
    
    // If it's a full return/exchange type, handle all items together
    if (isFullType(returnType)) {
      if (newSelectedItems.size === order?.order_detail.length) {
        // If all items are selected, deselect all
        newSelectedItems.clear();
      } else {
        // Select all items
        order?.order_detail.forEach((item) => {
          newSelectedItems.set(item.id, {
            product_id: item.product_detail.product_id,
            product_detail_id: item.product_detail_id,
            quantity: item.quantity,
            return_reason: '',
            condition_description: '',
            images: [],
            price: item.price
          });
        });
      }
    } else {
      // For partial types, handle individual items
      if (newSelectedItems.has(detail.id)) {
        newSelectedItems.delete(detail.id);
      } else {
        newSelectedItems.set(detail.id, {
          product_id: detail.product_detail.product_id,
          product_detail_id: detail.product_detail_id,
          quantity: detail.quantity,
          return_reason: '',
          condition_description: '',
          images: [],
          price: detail.price
        });
      }
    }
    
    setSelectedItems(newSelectedItems);
  };

  const handleItemDetailChange = (detailId: number, field: keyof ReturnRequestDetailRequest, value: string | number) => {
    const newSelectedItems = new Map(selectedItems);
    const item = newSelectedItems.get(detailId);
    
    if (item) {
      newSelectedItems.set(detailId, {
        ...item,
        [field]: value
      });
      setSelectedItems(newSelectedItems);
    }
  };

  const handleFormFieldClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!returnReason.trim()) {
      newErrors.returnReason = 'Vui lòng nhập lý do trả hàng';
    }

    if (selectedItems.size === 0) {
      newErrors.items = 'Vui lòng chọn ít nhất một sản phẩm để trả';
    }

    // Validate each selected item
    selectedItems.forEach((item, detailId) => {
      if (!item.return_reason.trim()) {
        newErrors[`item_${detailId}_reason`] = 'Vui lòng nhập lý do trả hàng cho sản phẩm này';
      }
      if (!item.condition_description.trim()) {
        newErrors[`item_${detailId}_condition`] = 'Vui lòng mô tả tình trạng sản phẩm';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !order) return;

    try {
      setLoading(true);
      
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('Vui lòng đăng nhập để tạo yêu cầu trả hàng');
        return;
      }

      const userData = JSON.parse(user);
      
      // Create return request first
      const returnRequest: ReturnRequestRequest = {
        order_id: order.id,
        user_id: userData.id,
        return_reason: returnReason,
        return_type: returnType,
        details: Array.from(selectedItems.values())
      };

      const returnResponse = await returnRequestApi.createReturnRequest(returnRequest);
      
      // If it's an exchange type, create exchange request
      if (isExchangeType(returnType)) {
        // const exchangeRequest: ExchangeRequestRequest = {
        //   return_request_id: returnResponse.data.id,
        //   exchange_reason: returnReason,
        //   details: Array.from(selectedItems.values()).map(item => ({
        //     old_product_detail_id: item.product_detail_id,
        //     quantity: item.quantity,
        //     exchange_reason: item.return_reason,
        //     condition_description: item.condition_description,
        //     images: item.images
        //   }))
        // };

        // await exchangeRequestApi.createExchangeRequest(exchangeRequest);
        toast.success('Tạo yêu cầu đổi hàng thành công');
      } else {
        toast.success('Tạo yêu cầu trả hàng thành công');
      }
      
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error?.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Upload image for a product detail
  const handleImageUpload = async (detailId: number, file: File) => {
    if (!orderId) return;
    try {
      setLoading(true);
      const url = await returnRequestApi.uploadReturnRequestImage(file, orderId);
      const newSelectedItems = new Map(selectedItems);
      const item = newSelectedItems.get(detailId);
      if (item) {
        newSelectedItems.set(detailId, {
          ...item,
          images: [...item.images, url]
        });
        setSelectedItems(newSelectedItems);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Không thể upload ảnh');
    } finally {
      setLoading(false);
    }
  };

  // Remove image from a product detail
  const handleRemoveImage = (detailId: number, imageUrl: string) => {
    const newSelectedItems = new Map(selectedItems);
    const item = newSelectedItems.get(detailId);
    if (item) {
      newSelectedItems.set(detailId, {
        ...item,
        images: item.images.filter((img) => img !== imageUrl)
      });
      setSelectedItems(newSelectedItems);
    }
  };

  if (!orderId) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">
          {isExchangeType(returnType) ? 'Tạo yêu cầu đổi hàng' : 'Tạo yêu cầu trả hàng'} - Đơn hàng #{orderId}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {orderLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : !order ? (
          <Alert severity="error">
            Không thể tải thông tin đơn hàng
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Tổng tiền: ${formatPrice(order.total_price)}`} color="primary" />
                <Chip label={`Ngày đặt: ${order.created_at}`} />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.returnType}>
                  <InputLabel>Loại yêu cầu</InputLabel>
                  <Select
                    value={returnType}
                    label="Loại yêu cầu"
                    onChange={(e) => setReturnType(e.target.value as ReturnType)}
                  >
                    <MenuItem value={ReturnType.RETURN_FULL}>
                      {getReturnTypeLabel(ReturnType.RETURN_FULL)}
                    </MenuItem>
                    <MenuItem value={ReturnType.RETURN_PARTIAL}>
                      {getReturnTypeLabel(ReturnType.RETURN_PARTIAL)}
                    </MenuItem>
                    <MenuItem value={ReturnType.EXCHANGE_FULL}>
                      {getReturnTypeLabel(ReturnType.EXCHANGE_FULL)}
                    </MenuItem>
                    <MenuItem value={ReturnType.EXCHANGE_PARTIAL}>
                      {getReturnTypeLabel(ReturnType.EXCHANGE_PARTIAL)}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isExchangeType(returnType) ? "Lý do đổi hàng chung" : "Lý do trả hàng chung"}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  multiline
                  rows={3}
                  error={!!errors.returnReason}
                  helperText={errors.returnReason}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {isFullType(returnType) 
                  ? `Tất cả sản phẩm sẽ được ${isExchangeType(returnType) ? 'đổi' : 'trả'}`
                  : `Chọn sản phẩm cần ${isExchangeType(returnType) ? 'đổi' : 'trả'}`
                }
              </Typography>
              
              {errors.items && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.items}
                </Alert>
              )}

              <Grid container spacing={2}>
                {order.order_detail?.map((detail: OrderDetail) => (
                  <Grid item xs={12} key={detail.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        position: 'relative',
                        border: selectedItems.has(detail.id) ? '2px solid primary.main' : '1px solid',
                        backgroundColor: selectedItems.has(detail.id) ? 'action.selected' : 'background.paper'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {detail.product_detail?.image_url && (
                            <CardMedia
                              component="img"
                              sx={{ width: 80, height: 80, objectFit: 'cover' }}
                              image={detail.product_detail.image_url}
                              alt={detail.product_detail.name}
                            />
                          )}
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {detail.product_detail?.name || 'Sản phẩm không xác định'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {detail.product_detail?.color} - {detail.product_detail?.size} - {detail.product_detail?.material}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="medium">
                              Số lượng: {detail.quantity} x {formatPrice(detail.price)}
                            </Typography>
                          </Box>

                          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                            {!isFullType(returnType) && (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedItems.has(detail.id)}
                                    onChange={() => handleItemToggle(detail)}
                                    color="primary"
                                  />
                                }
                                label=""
                                sx={{ margin: 0 }}
                              />
                            )}
                            {isFullType(returnType) && (
                              <Chip 
                                label={isExchangeType(returnType) ? "Sẽ đổi" : "Sẽ trả"} 
                                color="primary" 
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        </Box>

                        {selectedItems.has(detail.id) && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label={isExchangeType(returnType) ? "Lý do đổi hàng cho sản phẩm này" : "Lý do trả hàng cho sản phẩm này"}
                                  value={selectedItems.get(detail.id)?.return_reason || ''}
                                  onChange={(e) => handleItemDetailChange(detail.id, 'return_reason', e.target.value)}
                                  onClick={handleFormFieldClick}
                                  multiline
                                  rows={2}
                                  error={!!errors[`item_${detail.id}_reason`]}
                                  helperText={errors[`item_${detail.id}_reason`]}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Mô tả tình trạng sản phẩm"
                                  value={selectedItems.get(detail.id)?.condition_description || ''}
                                  onChange={(e) => handleItemDetailChange(detail.id, 'condition_description', e.target.value)}
                                  onClick={handleFormFieldClick}
                                  multiline
                                  rows={2}
                                  error={!!errors[`item_${detail.id}_condition`]}
                                  helperText={errors[`item_${detail.id}_condition`]}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<ImageIcon />}
                                    disabled={loading}
                                  >
                                    Thêm ảnh
                                    <input
                                      type="file"
                                      accept="image/*"
                                      hidden
                                      onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          await handleImageUpload(detail.id, e.target.files[0]);
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                  </Button>
                                  <Typography variant="body2" color="text.secondary">
                                    (Tối đa 5 ảnh)
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                  {selectedItems.get(detail.id)?.images.map((img, idx) => (
                                    <Box key={idx} sx={{ position: 'relative', width: 64, height: 64 }}>
                                      <img
                                        src={img}
                                        alt={`Ảnh ${idx + 1}`}
                                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }}
                                      />
                                      <IconButton
                                        size="small"
                                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}
                                        onClick={() => handleRemoveImage(detail.id, img)}
                                        disabled={loading}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ))}
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading || orderLoading}>
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || orderLoading || !order || selectedItems.size === 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Đang tạo...' : `Tạo yêu cầu ${isExchangeType(returnType) ? 'đổi hàng' : 'trả hàng'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnRequestModal; 