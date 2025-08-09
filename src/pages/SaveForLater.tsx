import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  CircularProgress,
  IconButton,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import saveForLaterApi, { SaveForLaterResponse } from '../services/API/SaveForLaterApi';
import cartApi from '../services/API/CartApi';
import { routes } from '../routes/routes';
const SaveForLater: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cartContext = useContext(CartContext);
  const [savedItems, setSavedItems] = useState<SaveForLaterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SaveForLaterResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(routes.Login);
      return;
    }
    fetchSavedItems();
  }, [isAuthenticated, navigate]);

  const fetchSavedItems = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      const response = await saveForLaterApi.getSaveForLaterByUserId(userData.id);
      setSavedItems(response.data);
    } catch (error) {
      console.error('Error fetching saved items:', error);
      toast.error('Không thể tải danh sách sản phẩm mua sau');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToCart = async (item: SaveForLaterResponse) => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      await saveForLaterApi.moveToCart(userData.id, item.product_detail_id);
      
      // Refresh cart using cart API
      if (cartContext) {
        const cartId = localStorage.getItem("cartId");
        if (cartId) {
          const cartResponse = await cartApi.findAll({ cart_id: parseInt(cartId) });
          cartContext.setCart(cartResponse.data.list);
        }
      }
      
      // Refresh saved items list
      await fetchSavedItems();
      
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Không thể chuyển sản phẩm vào giỏ hàng');
    }
  };

  const handleRemove = async () => {
    if (!selectedItem) return;

    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      await saveForLaterApi.removeFromSaveForLater(userData.id, selectedItem.product_detail_id);
      setOpenDialog(false);
      await fetchSavedItems(); // Refresh the list
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Không thể xóa sản phẩm khỏi danh sách mua sau');
    }
  };

  const handleOpenDialog = (item: SaveForLaterResponse) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        📑 Danh sách mua sau
      </Typography>

      {savedItems.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Chưa có sản phẩm nào trong danh sách mua sau
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Tiếp tục mua sắm
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {savedItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.product_detail.image_url || '/placeholder.png'}
                  alt={item.product_detail.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.product_detail.name}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {item.product_detail.price.toLocaleString('vi-VN')}đ
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label={item.product_detail.color} size="small" />
                    <Chip label={item.product_detail.size} size="small" />
                    <Chip label={item.product_detail.material} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Đã lưu: {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => handleMoveToCart(item)}
                    disabled={item.product_detail.stock <= 0}
                    fullWidth
                    sx={{ mr: 1 }}
                  >
                    {item.product_detail.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                  </Button>
                  <IconButton 
                    color="error"
                    onClick={() => handleOpenDialog(item)}
                    title="Xóa khỏi danh sách"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách mua sau?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleRemove} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SaveForLater; 