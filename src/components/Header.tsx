import React, { useState, useEffect, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import { debounce } from "lodash";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, NavLink as RouterLink, useNavigate } from "react-router-dom";
import { routes } from "../routes/routes";

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cartAnchorEl, setCartAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { isAuthenticated, logout } = useAuth();
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();

  // Fake API call
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    // Giả lập dữ liệu từ API
    const mockData = [
      "Giày Nike",
      "Giày Adidas",
      "Giày Puma",
      "Giày Vans",
      "Giày Converse",
    ];
    setSuggestions(
      mockData.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  // Debounce API call
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchTerm]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    handleSearch(suggestion);
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

  const handleSearch = (term: string) => {
    if (term.trim()) {
      navigate(`/products?search=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch(searchTerm);
    }
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
      sx={{ backgroundColor: "white", color: "black", boxShadow: 1 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" component={RouterLink} to={routes.Home} sx={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
          <Typography variant="h6" fontWeight="bold" ml={1}>
            MyStore
          </Typography>
        </Box>

        {/* Thanh tìm kiếm */}
        <Box sx={{ flexGrow: 1, mx: 3, position: "relative" }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm sản phẩm..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    color="primary"
                    onClick={() => handleSearch(searchTerm)}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Gợi ý tìm kiếm */}
          {suggestions.length > 0 && (
            <Paper
              sx={{ position: "absolute", width: "100%", zIndex: 10, mt: 1 }}
            >
              <List>
                {suggestions.map((suggestion, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <ListItemText primary={suggestion} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Giỏ hàng + User */}
        <Box display="flex" alignItems="center">
          {/* Giỏ hàng */}
          <Box
            sx={{ position: 'relative' }}
            onMouseEnter={handleCartMenuOpen}
            onMouseLeave={handleCartMenuClose}
          >
            <IconButton sx={{ mr: 2 }}>
              <Badge badgeContent={cartItemCount} color="error" showZero>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Cart Menu */}
            <Menu
              anchorEl={cartAnchorEl}
              open={Boolean(cartAnchorEl)}
              onClose={handleCartMenuClose}
              PaperProps={{
                onMouseEnter: () => {},
                onMouseLeave: handleCartMenuClose,
                sx: {
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: 300,
                  maxHeight: 400,
                  overflow: 'auto',
                  mt: 1,
                  boxShadow: 3,
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
                <MenuItem disabled>
                  <Typography>Giỏ hàng trống</Typography>
                </MenuItem>
              ) : (
                <Box>
                  {cart.map((item) => (
                    item && item.product_detail ? (
                      <MenuItem key={item.id} sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <img 
                            src={item.product_detail.image_url} 
                            alt={item.product_detail.name}
                            style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" noWrap>
                              {item.product_detail.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(item.product_detail.price)} x {item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ) : null
                  ))}
                  <Divider />
                  <MenuItem sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">Tổng tiền:</Typography>
                    <Typography variant="subtitle1" color="primary">
                      {formatCurrency(totalPrice)}
                    </Typography>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      variant="contained"
                      fullWidth
                      component={RouterLink}
                      to={routes.Cart}
                      onClick={handleCartMenuClose}
                    >
                      Xem giỏ hàng
                    </Button>
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>

          {/* Nếu chưa login */}
          {!isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to={routes.Login}
                variant="outlined"
                color="primary"
                sx={{ mr: 1 }}
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                to={routes.Register}
                variant="contained"
                color="primary"
              >
                Sign Up
              </Button>
            </>
          ) : (
            /* Nếu đã login */
            <>
              <IconButton onClick={handleMenuOpen}>
                <Avatar sx={{ bgcolor: "primary.main" }}>U</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem>
                  <AccountCircleIcon sx={{ mr: 1 }} /> Tài khoản
                </MenuItem>
                <MenuItem component={RouterLink} to={routes.OrderHistory} onClick={handleMenuClose}>
                  <HistoryIcon sx={{ mr: 1 }} /> Lịch sử đơn hàng
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
