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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import { debounce } from "lodash";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, NavLink as RouterLink } from "react-router-dom";
import { routes } from "../routes/routes";

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { isAuthenticated, logout } = useAuth();

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
  };

  const cartContext = useContext(CartContext);

  if (!cartContext) {
    // Xử lý trường hợp context không được cung cấp
    return null;
  }

  const { cart } = cartContext;

  const cartItemCount =
    cart.length > 0
      ? cart.reduce((count, item) => count + item.quantity, 0)
      : 0;
  console.log("đây là cart item", cartItemCount);

  return (
    <AppBar
      position="sticky"
      sx={{ backgroundColor: "white", color: "black", boxShadow: 1 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Box display="flex" alignItems="center">
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary">
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
          <IconButton sx={{ mr: 2 }}>
            <Badge badgeContent={cartItemCount} color="error" showZero>
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

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
                <MenuItem>
                  <HistoryIcon sx={{ mr: 1 }} /> Lịch sử đơn hàng
                </MenuItem>
                <MenuItem onClick={logout}>
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
