import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Slider,
  Pagination,
} from "@mui/material";
import productsData from "../productsData";

const ITEMS_PER_PAGE = 6; // Số sản phẩm hiển thị trên 1 trang

const ProductList = () => {
  const [filters, setFilters] = useState({
    size: "",
    color: "",
    material: "",
    price: [0, 5000000],
    sort: "",
  });
  const [page, setPage] = useState(1);

  // Xử lý bộ lọc
  const handleFilterChange = (field: string, value: any) => {
    setFilters({ ...filters, [field]: value });
    setPage(1); // Reset về trang đầu khi thay đổi bộ lọc
  };

  // Lọc sản phẩm
  const filteredProducts = productsData
    .filter((p) => (filters.size ? p.size.includes(filters.size) : true))
    .filter((p) => (filters.color ? p.color === filters.color : true))
    .filter((p) => (filters.material ? p.material === filters.material : true))
    .filter((p) => p.price >= filters.price[0] && p.price <= filters.price[1])
    .sort((a, b) => {
      if (filters.sort === "price_asc") return a.price - b.price;
      if (filters.sort === "price_desc") return b.price - a.price;
      if (filters.sort === "name_asc") return a.name.localeCompare(b.name);
      if (filters.sort === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Lấy danh sách sản phẩm theo trang hiện tại
  const displayedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>🛍️ Danh sách sản phẩm</Typography>

      {/* Bộ lọc sản phẩm */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Size</InputLabel>
          <Select value={filters.size} onChange={(e) => handleFilterChange("size", e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="S">S</MenuItem>
            <MenuItem value="M">M</MenuItem>
            <MenuItem value="L">L</MenuItem>
            <MenuItem value="XL">XL</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Màu sắc</InputLabel>
          <Select value={filters.color} onChange={(e) => handleFilterChange("color", e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Đỏ">Đỏ</MenuItem>
            <MenuItem value="Xanh">Xanh</MenuItem>
            <MenuItem value="Đen">Đen</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Chất liệu</InputLabel>
          <Select value={filters.material} onChange={(e) => handleFilterChange("material", e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Da">Da</MenuItem>
            <MenuItem value="Vải">Vải</MenuItem>
            <MenuItem value="Nhựa">Nhựa</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ minWidth: 250 }}>
          <Typography variant="body1">Khoảng giá</Typography>
          <Slider
            value={filters.price}
            onChange={(e, newValue) => handleFilterChange("price", newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={5000000}
            step={500000}
          />
        </Box>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sắp xếp</InputLabel>
          <Select value={filters.sort} onChange={(e) => handleFilterChange("sort", e.target.value)}>
            <MenuItem value="">Mặc định</MenuItem>
            <MenuItem value="price_asc">Giá: Thấp đến Cao</MenuItem>
            <MenuItem value="price_desc">Giá: Cao đến Thấp</MenuItem>
            <MenuItem value="name_asc">Tên: A - Z</MenuItem>
            <MenuItem value="name_desc">Tên: Z - A</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Danh sách sản phẩm */}
      <Grid container spacing={2}>
        {displayedProducts.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: 6,
                  transform: "scale(1.05)",
                },
                overflow: "hidden",
                position: "relative",
              }}
            >
              {product.discount > 0 && (
                <Chip
                  label={`-${product.discount}%`}
                  color="error"
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontWeight: 700,
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                  }}
                />
              )}

              <CardMedia
                component="img"
                height="250"
                image={product.image}
                alt={product.name}
                sx={{
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              />

              <CardContent sx={{ textAlign: "center", padding: "16px" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {product.name}
                </Typography>

                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "10px" }}>
                  {product.price.toLocaleString()} đ
                </Typography>

                <Button variant="contained" color="primary" sx={{ width: "100%", fontWeight: 600 }}>
                  🛒 Thêm vào giỏ
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Phân trang */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductList;
