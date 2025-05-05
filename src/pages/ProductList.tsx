import React, { useState, useEffect } from "react";
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
  Container,
  Paper,
  CircularProgress,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Pagination,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import authenticationApiService from "../services/API/AuthenticationApiService";
import { ProductDetail } from "../services/API/ProductDetailApi";
import { Category } from "../services/API/CategoryApi";
import { Brand } from "../services/API/BrandApi";
import { Size } from "../services/API/SizeApi";
import { Material } from "../services/API/MaterialApi";
import { Color } from "../services/API/ColorApi";
import { toast } from "react-toastify";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { CartContext } from "../context/CartContext";
import { useContext } from "react";

const ProductList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart } = useContext(CartContext);
  
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showAll, setShowAll] = useState(false);
  
  const [filters, setFilters] = useState({
    color_id: -1,
    size_id: -1,
    material_id: -1,
    category_id: -1,
    brand_id: -1,
    status: 1,
    key_search: "",
  });

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category_id');
    const brandFromUrl = searchParams.get('brand_id');
    const searchFromUrl = searchParams.get('search');
    
    if (brandFromUrl) {
      setFilters(prev => ({
        ...prev,
        brand_id: parseInt(brandFromUrl)
      }));
    }

    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        category_id: parseInt(categoryFromUrl)
      }));
    }
    
    if (searchFromUrl) {
      setFilters(prev => ({
        ...prev,
        key_search : searchFromUrl
      }));
    }
  }, [location.search]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchSizes();
    fetchMaterials();
    fetchColors();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, itemsPerPage, filters]);

  const fetchCategories = async () => {
    try {
      const response = await authenticationApiService.getCategories({
        status: 1,
        page: 1,
        limit: 100
      });
      setCategories(response.data.list);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await authenticationApiService.getBrands({
        status: 1,
        page: 1,
        limit: 100
      });
      setBrands(response.data.list);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await authenticationApiService.getSizes({
        status: 1,
        page: 1,
        limit: 100
      });
      setSizes(response.data.list);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await authenticationApiService.getMaterials({
        status: 1,
        page: 1,
        limit: 100
      });
      setMaterials(response.data.list);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await authenticationApiService.getColors({
        status: 1,
        page: 1,
        limit: 100
      });
      setColors(response.data.list);
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await authenticationApiService.getProductDetails({
        ...filters,
        page: page,
        limit: itemsPerPage
      });
      setProducts(response.data.list);
      setTotalRecords(response.data.total_record);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
    
    // Cập nhật URL khi thay đổi filter
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === -1 || value === "") {
      newSearchParams.delete(field);
    } else {
      newSearchParams.set(field, value.toString());
    }
    navigate({
      pathname: location.pathname,
      search: newSearchParams.toString()
    });
  };

  const handleAddToCart = async (product: ProductDetail) => {
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAll(event.target.checked);
    if (event.target.checked) {
      setItemsPerPage(500); // Hiển thị nhiều sản phẩm hơn
    } else {
      setItemsPerPage(20); // Trở lại số lượng mặc định
    }
    setPage(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 600,
          color: theme.palette.primary.main,
          textAlign: 'center'
        }}>
          Bộ Sưu Tập Giày
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          textAlign: 'center',
          color: theme.palette.text.secondary,
          mb: 3
        }}>
          Khám phá các mẫu giày mới nhất của chúng tôi
        </Typography>
      </Box>

      {/* Filters Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon color="primary" />
            <Typography variant="h6">Bộ lọc</Typography>
          </Box>
          
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel>Thương hiệu</InputLabel>
              <Select
                value={filters.brand_id}
                onChange={(e) => handleFilterChange("brand_id", e.target.value)}
                label="Thương hiệu"
              >
                <MenuItem value={-1}>Tất cả</MenuItem>
                {brands.map(brand => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={filters.category_id}
                onChange={(e) => handleFilterChange("category_id", e.target.value)}
                label="Danh mục"
              >
                <MenuItem value={-1}>Tất cả</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel>Màu sắc</InputLabel>
              <Select
                value={filters.color_id}
                onChange={(e) => handleFilterChange("color_id", e.target.value)}
                label="Màu sắc"
              >
                <MenuItem value={-1}>Tất cả</MenuItem>
                {colors.map(color => (
                  <MenuItem key={color.id} value={color.id}>
                    {color.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel>Size</InputLabel>
              <Select
                value={filters.size_id}
                onChange={(e) => handleFilterChange("size_id", e.target.value)}
                label="Size"
              >
                <MenuItem value={-1}>Tất cả</MenuItem>
                {sizes.map(size => (
                  <MenuItem key={size.id} value={size.id}>
                    {size.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel>Chất liệu</InputLabel>
              <Select
                value={filters.material_id}
                onChange={(e) => handleFilterChange("material_id", e.target.value)}
                label="Chất liệu"
              >
                <MenuItem value={-1}>Tất cả</MenuItem>
                {materials.map(material => (
                  <MenuItem key={material.id} value={material.id}>
                    {material.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy sản phẩm nào
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10],
                  },
                }}
              >
                <Box sx={{ position: 'relative', pt: '100%' }}>
                  <CardMedia
                    component="img"
                    image={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {product.stock <= 0 && (
                    <Chip
                      label="Hết hàng"
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                <CardContent 
                  sx={{ 
                    flexGrow: 1, 
                    p: 2, 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Tooltip 
                    title={product.name}
                    placement="top"
                    arrow
                  >
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.2,
                          height: '2.4em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordWrap: 'break-word'
                        }}
                      >
                        {product.name}
                      </Typography>
                    </Box>
                  </Tooltip>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ 
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}
                  >
                    <Chip
                      label={product.color}
                      size="small"
                      sx={{ 
                        height: '24px',
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[100],
                        '& .MuiChip-label': {
                          px: 1,
                          fontSize: '0.75rem',
                          maxWidth: '80px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                      title={product.color}
                    />
                    <Chip
                      label={product.size}
                      size="small"
                      sx={{ 
                        height: '24px',
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[100],
                        '& .MuiChip-label': {
                          px: 1,
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                    <Chip
                      label={product.material}
                      size="small"
                      sx={{ 
                        height: '24px',
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[100],
                        '& .MuiChip-label': {
                          px: 1,
                          fontSize: '0.75rem',
                          maxWidth: '80px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                      title={product.material}
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      color="primary"
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}
                    >
                      {formatPrice(product.price)}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 0.5,
                      backgroundColor: theme.palette.grey[100],
                      padding: '2px 8px',
                      borderRadius: 1
                    }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Còn:
                      </Typography>
                      <Typography
                        variant="caption"
                        color={product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'}
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      >
                        {product.stock}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={() => navigate(`/product/${product.product_id}`, {
                        state: {
                          colorId: product.color_id,
                          sizeId: product.size_id,
                          materialId: product.material_id,
                          selectedProduct: product
                        }
                      })}
                    >
                      Chi tiết
                    </Button>
                    {/* <IconButton
                      color="primary"
                      disabled={product.stock <= 0}
                      onClick={() => handleAddToCart(product)}
                      size="small"
                      sx={{
                        border: `1px solid ${theme.palette.primary.main}`,
                        borderRadius: 1,
                      }}
                    >
                      <ShoppingCartIcon fontSize="small" />
                    </IconButton> */}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination Info and Controls */}
      <Paper elevation={3} sx={{ mt: 4, p: 2, borderRadius: 2 }}>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            Hiển thị {products.length} trên {totalRecords} sản phẩm
          </Typography>
          
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            alignItems="center"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showAll}
                  onChange={handleShowAllChange}
                  color="primary"
                />
              }
              label="Hiển thị tất cả"
            />
            
            <Pagination
              count={Math.ceil(totalRecords / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
              showFirstButton
              showLastButton
            />
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ProductList;
