import * as React from "react";
import { useState, useEffect, useContext } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Button,
  MenuItem,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  Badge,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  AssignmentReturn as AssignmentReturnIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { debounce } from "lodash";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { routes } from "../routes/routes";
import authenticationApiService from '../services/API/AuthenticationApiService';

interface ProductDetailResponse {
  id: number;
  name: string;
  product_id: number;
  color_id: number;
  color: string;
  size_id: number;
  size: string;
  material_id: number;
  material: string;
  brand_id: number;
  brand: string;
  category_id: number;
  category: string;
  stock: number;
  price: number;
  image_url: string;
  status: number;
}

const Header: React.FC = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cartAnchorEl, setCartAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductDetailResponse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const [userAvatar, setUserAvatar] = useState<string>('');

  useEffect(() => {
    // Lấy thông tin user từ localStorage khi component mount
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUserAvatar(userData.avatar_url || '');
    }
  }, []);

  // Fetch suggestions using getProductDetails API
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await authenticationApiService.getProductDetails({
        key_search: query,
        status: 1,
        limit: 5 // Limit to 5 suggestions
      });
      
      if (response.data?.list) {
        // Transform API response to ProductDetailResponse
        const transformedSuggestions = response.data.list.map(detail => {
          const productDetail = detail as any;
          return {
            id: productDetail.id,
            name: productDetail.name,
            product_id: productDetail.product_id,
            color_id: productDetail.color_id,
            color: productDetail.color,
            size_id: productDetail.size_id,
            size: productDetail.size,
            material_id: productDetail.material_id,
            material: productDetail.material,
            brand_id: productDetail.brand_id,
            brand: productDetail.brand,
            category_id: productDetail.category_id,
            category: productDetail.category,
            stock: productDetail.stock,
            price: productDetail.price,
            image_url: productDetail.image_url,
            status: productDetail.status
          };
        });
        setSuggestions(transformedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce API call
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchTerm]);

  // Handle clicking outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchClick = (suggestion: ProductDetailResponse) => {
    navigate(`/product/${suggestion.product_id}`, {
      state: {
        colorId: suggestion.color_id,
        sizeId: suggestion.size_id,
        materialId: suggestion.material_id
      }
    });
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClearSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleHideSuggestions = () => {
    setShowSuggestions(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCartMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCartAnchorEl(event.currentTarget);
  };

  const handleCartMenuClose = () => {
    setCartAnchorEl(null);
  };

  const handleLogout = () => {
    // Xóa dữ liệu giỏ hàng từ localStorage
    localStorage.removeItem('localCart');
    localStorage.removeItem('cartId');
    
    // Reset cart state
    if (cartContext) {
      cartContext.setCart([]);
    }
    
    // Gọi hàm logout từ AuthContext
    logout();
    handleMenuClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (!cartContext) {
    // Xử lý trường hợp context không được cung cấp
    return null;
  }

  const { cart } = cartContext;

  const cartItemCount =
    cart.length > 0
      ? cart.reduce((count, item) => {
          if (!item) return count;
          return count + (item.quantity || 0);
        }, 0)
      : 0;
  const totalPrice = cart.reduce((total, item) => {
    if (!item || !item.product_detail) return total;
    return total + (item.product_detail.price * item.quantity);
  }, 0);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        {/* Logo */}
        <Box 
          display="flex" 
          alignItems="center" 
          component={RouterLink} 
          to={routes.Home} 
          sx={{ 
            textDecoration: 'none',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/uploadimage-aa334.appspot.com/o/logo1.jpg?alt=media" 
            alt="Logo" 
            style={{ 
              height: 45,
              borderRadius: '50%',
              border: `2px solid ${theme.palette.primary.main}`,
            }} 
          />
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            ml={1.5}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            WEB SUNNY
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box 
          className="search-container" 
          sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' }, 
            justifyContent: 'center', 
            position: 'relative',
            mx: 4,
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            sx={{
              width: '60%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderWidth: 1,
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused': {
                  bgcolor: 'background.paper',
                  boxShadow: theme.shadows[2],
                  '& fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 1,
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isLoading && <CircularProgress size={20} />}
                  {searchTerm && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchTerm('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && searchTerm && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '100%',
                left: '20%',
                right: '20%',
                zIndex: 1000,
                mt: 1,
                maxHeight: '400px',
                overflow: 'auto',
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gợi ý tìm kiếm
                </Typography>
                <IconButton size="small" onClick={handleHideSuggestions}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <List sx={{ py: 0 }}>
                {suggestions.map((suggestion) => (
                  <ListItem
                    key={suggestion.id}
                    onClick={() => handleSearchClick(suggestion)}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      },
                      py: 2
                    }}
                  >
                    <Box
                      component="img"
                      src={suggestion.image_url || '/placeholder-image.jpg'}
                      alt={suggestion.name}
                      sx={{
                        width: 70,
                        height: 70,
                        objectFit: 'cover',
                        borderRadius: 1.5,
                        mr: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 500,
                          mb: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {suggestion.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {suggestion.price.toLocaleString('vi-VN')}đ
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {suggestion.color} - {suggestion.size} - {suggestion.material}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Cart & User */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Cart */}
          <Box
            sx={{ position: 'relative' }}
            onMouseEnter={handleCartMenuOpen}
            onMouseLeave={handleCartMenuClose}
          >
            <Tooltip title="Giỏ hàng" arrow>
              <IconButton 
                sx={{ 
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <Badge 
                  badgeContent={cartItemCount} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20,
                    }
                  }}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Cart Menu */}
            <Menu
              anchorEl={cartAnchorEl}
              open={Boolean(cartAnchorEl)}
              onClose={handleCartMenuClose}
              TransitionComponent={Fade}
              PaperProps={{
                onMouseEnter: () => {},
                onMouseLeave: handleCartMenuClose,
                elevation: 3,
                sx: {
                  mt: 1.5,
                  width: 360,
                  maxHeight: 480,
                  overflow: 'auto',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(8px)',
                },
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {cart.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Giỏ hàng trống
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Giỏ hàng ({cartItemCount} sản phẩm)
                    </Typography>
                  </Box>

                  <List sx={{ py: 0 }}>
                    {cart.map((item, index) => (
                      item && item.product_detail ? (
                        <ListItem 
                          key={index} 
                          sx={{ 
                            py: 2,
                            borderBottom: index < cart.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider'
                          }}
                        >
                          <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                            <img 
                              src={item.product_detail.image_url} 
                              alt={item.product_detail.name}
                              style={{ 
                                width: 60, 
                                height: 60, 
                                objectFit: 'cover',
                                borderRadius: 8,
                                border: '1px solid',
                                borderColor: theme.palette.divider
                              }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 500,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mb: 0.5
                                }}
                              >
                                {item.product_detail.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                {item.product_detail.price.toLocaleString('vi-VN')}đ
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  SL: {item.quantity}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  • {item.product_detail.color} - {item.product_detail.size}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </ListItem>
                      ) : null
                    ))}
                  </List>

                  <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="subtitle1">Tổng tiền:</Typography>
                      <Typography 
                        variant="subtitle1" 
                        color="primary"
                        fontWeight={600}
                      >
                        {formatCurrency(totalPrice)}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      component={RouterLink}
                      to={routes.Cart}
                      onClick={handleCartMenuClose}
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.9rem'
                      }}
                    >
                      Xem giỏ hàng
                    </Button>
                  </Box>
                </Box>
              )}
            </Menu>
          </Box>

          {/* User Menu */}
          {!isAuthenticated ? (
            <Stack direction="row" spacing={1}>
              <Button
                component={RouterLink}
                to={routes.Login}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                Đăng nhập
              </Button>
              <Button
                component={RouterLink}
                to={routes.Register}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Đăng ký
              </Button>
            </Stack>
          ) : (
            <Box>
              <Tooltip title="Tài khoản" arrow>
                <IconButton 
                  onClick={handleMenuOpen}
                  sx={{
                    p: 0.5,
                    border: '2px solid',
                    borderColor: alpha(theme.palette.primary.main, userAvatar ? 0.2 : 0.8),
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Avatar
                    src={userAvatar}
                    sx={{
                      width: 35,
                      height: 35,
                      bgcolor: userAvatar ? 'transparent' : 'primary.main'
                    }}
                  >
                    {userAvatar ? '' : <PersonIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(8px)',
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem 
                  component={RouterLink} 
                  to="/profile" 
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>Tài khoản của tôi</Typography>
                </MenuItem>

                <MenuItem 
                  component={RouterLink} 
                  to={routes.OrderHistory} 
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <HistoryIcon sx={{ mr: 2, color: 'info.main' }} />
                  <Typography>Lịch sử đơn hàng</Typography>
                </MenuItem>

                <MenuItem 
                  component={RouterLink} 
                  to={routes.SaveForLater} 
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <SaveIcon sx={{ mr: 2, color: 'success.main' }} />
                  <Typography>Sản phẩm đã lưu</Typography>
                </MenuItem>

                <MenuItem 
                  component={RouterLink} 
                  to={routes.ReturnRequest} 
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <AssignmentReturnIcon sx={{ mr: 2, color: 'warning.main' }} />
                  <Typography>Yêu cầu trả hàng</Typography>
                </MenuItem>

                <MenuItem 
                  component={RouterLink} 
                  to={routes.CancelRequest} 
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <CancelIcon sx={{ mr: 2, color: 'error.main' }} />
                  <Typography>Yêu cầu hủy đơn</Typography>
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem 
                  onClick={handleLogout}
                  sx={{ py: 1.5 }}
                >
                  <LogoutIcon sx={{ mr: 2, color: 'error.main' }} />
                  <Typography>Đăng xuất</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
