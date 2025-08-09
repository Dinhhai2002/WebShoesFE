import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Box, Typography, Grid, Button, ToggleButtonGroup, ToggleButton, Divider, CircularProgress, Alert, IconButton, useTheme, Container, Paper, Chip } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ProductImageGallery from "../components/ProductImageGallery";
import ProductReview from "../components/ProductReview";
import authenticationApiService from "../services/API/AuthenticationApiService";
import { Product } from "../services/API/ProductApi";
import { ProductDetail } from "../services/API/ProductDetailApi";
import { Color } from "../services/API/ColorApi";
import { Size } from "../services/API/SizeApi";
import { Material } from "../services/API/MaterialApi";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Review } from "../services/API/ReviewApi";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { Breadcrumbs, Link, Skeleton, Fade, Zoom, Rating } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const initialOptions = location.state as {
        colorId?: number;
        sizeId?: number;
        materialId?: number;
    } || {};
    const [product, setProduct] = useState<Product | null>(null);
    const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [availableColors, setAvailableColors] = useState<Color[]>([]);
    const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
    const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [productImages, setProductImages] = useState<string[]>([]);
    const cartContext = useContext(CartContext);
    const { isAuthenticated } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const theme = useTheme();

    // Fetch product and options data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch product
                const productResponse = await authenticationApiService.getProductById(Number(id));
                setProduct(productResponse.data);
                setProductImages(productResponse.data.images);

                // Fetch all product details to get available options
                const productDetailsResponse = await authenticationApiService.getProductDetails({
                    product_id: Number(id),
                    status: 1,
                    page: 1,
                    limit: 500
                });

                const productDetails = productDetailsResponse.data.list;

                // Get unique available options from product details
                const uniqueColors = new Set(productDetails.map(detail => detail.color_id));
                const uniqueSizes = new Set(productDetails.map(detail => detail.size_id));
                const uniqueMaterials = new Set(productDetails.map(detail => detail.material_id));

                // Fetch all options
                const [colorsResponse, sizesResponse, materialsResponse] = await Promise.all([
                    authenticationApiService.getColors({ status: 1, limit: 500 }),
                    authenticationApiService.getSizes({ status: 1, limit: 500 }),
                    authenticationApiService.getMaterials({ status: 1, limit: 500 })
                ]);

                // Filter available options
                const availableColorsData = colorsResponse.data.list.filter(color => uniqueColors.has(color.id));
                const availableSizesData = sizesResponse.data.list.filter(size => uniqueSizes.has(size.id));
                const availableMaterialsData = materialsResponse.data.list.filter(material => uniqueMaterials.has(material.id));

                setColors(colorsResponse.data.list);
                setSizes(sizesResponse.data.list);
                setMaterials(materialsResponse.data.list);

                setAvailableColors(availableColorsData);
                setAvailableSizes(availableSizesData);
                setAvailableMaterials(availableMaterialsData);

                // Set initial selections based on available options
                if (initialOptions.colorId && availableColorsData.some(c => c.id === initialOptions.colorId)) {
                    const color = availableColorsData.find(c => c.id === initialOptions.colorId);
                    if (color) setSelectedColor(color);
                } else if (availableColorsData.length > 0) {
                    setSelectedColor(availableColorsData[0]);
                }

                if (initialOptions.sizeId && availableSizesData.some(s => s.id === initialOptions.sizeId)) {
                    const size = availableSizesData.find(s => s.id === initialOptions.sizeId);
                    if (size) setSelectedSize(size);
                } else if (availableSizesData.length > 0) {
                    setSelectedSize(availableSizesData[0]);
                }

                if (initialOptions.materialId && availableMaterialsData.some(m => m.id === initialOptions.materialId)) {
                    const material = availableMaterialsData.find(m => m.id === initialOptions.materialId);
                    if (material) setSelectedMaterial(material);
                } else if (availableMaterialsData.length > 0) {
                    setSelectedMaterial(availableMaterialsData[0]);
                }
            } catch (err) {
                setError("Không thể tải thông tin sản phẩm");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, initialOptions.colorId, initialOptions.sizeId, initialOptions.materialId]);

    // Fetch reviews for the product
    useEffect(() => {
        const fetchReviews = async () => {
            if (!product) return;

            try {
                setReviewLoading(true);
                const response = await authenticationApiService.getReviews({
                    product_id: product.id,
                    status: 1,
                    page: 1,
                    limit: 10
                });

                if (response.data) {
                    setReviews(response.data.list);
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
                toast.error("Không thể tải danh sách đánh giá");
            } finally {
                setReviewLoading(false);
            }
        };

        fetchReviews();
    }, [product]);

    // Fetch product detail when selections change
    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!product || !selectedColor || !selectedSize || !selectedMaterial) return;

            try {
                const response = await authenticationApiService.getProductDetails({
                    product_id: product.id,
                    color_id: selectedColor.id,
                    size_id: selectedSize.id,
                    material_id: selectedMaterial.id,
                    status: 1
                });

                if (response.data.list.length > 0) {
                    setProductDetail(response.data.list[0]);
                    // Update product images from the selected product detail
                    setProductImages(response.data.list[0].image_url ? [response.data.list[0].image_url] : []);
                } else {
                    setProductDetail(null);
                    // setProductImages([]);
                }
            } catch (err) {
                console.error("Error fetching product detail:", err);
            }
        };

        fetchProductDetail();
    }, [product, selectedColor, selectedSize, selectedMaterial]);

    // Fetch all product details for the product to get all available images
    useEffect(() => {
        const fetchAllProductDetails = async () => {
            if (!product) return;

            try {
                const response = await authenticationApiService.getProductDetails({
                    product_id: product.id,
                    status: 1
                });

                // Collect all unique image URLs from product details
                // const allImages = response.data.list
                //     .map(detail => detail.image_url)
                //     .filter((url): url is string => !!url)
                //     .filter((url, index, self) => self.indexOf(url) === index);

                // setProductImages(allImages);
            } catch (err) {
                console.error("Error fetching all product details:", err);
            }
        };

        fetchAllProductDetails();
    }, [product]);

    const handleQuantityChange = (type: 'increase' | 'decrease') => {
        if (!productDetail) return;

        if (type === 'increase') {
            if (quantity < productDetail.stock) {
                setQuantity(prev => prev + 1);
            } else {
                toast.warning(`Số lượng tối đa là ${productDetail.stock} sản phẩm`);
            }
        } else {
            if (quantity > 1) {
                setQuantity(prev => prev - 1);
            }
        }
    };

    const handleAddToCart = () => {
        if (!productDetail) {
            toast.error("Sản phẩm không khả dụng!");
            return;
        }

        if (!cartContext) {
            toast.error("Không thể thêm sản phẩm vào giỏ hàng!");
            return;
        }

        try {
            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            const existingItem = cartContext.cart.find(item => item.product_detail.id === productDetail.id);
            
            if (existingItem) {
                // Nếu đã có, tăng số lượng lên theo số lượng đã chọn
                cartContext.updateQuantity(existingItem.id, existingItem.quantity + quantity);
            } else {
                // Nếu chưa có, thêm mới với số lượng đã chọn và đầy đủ thông tin sản phẩm
                const cartItem = {
                    id: Date.now(), // Tạo ID tạm thởi cho localStorage
                    cart_id: 0,
                    product_detail_id: productDetail.id,
                    quantity: quantity,
                    product_detail: {
                        id: productDetail.id,
                        name: product?.name,
                        product_id: product?.id,
                        color_id: selectedColor?.id || 0,
                        color: selectedColor?.name || '',
                        size_id: selectedSize?.id || 0,
                        size: selectedSize?.name || '',
                        material_id: selectedMaterial?.id || 0,
                        material: selectedMaterial?.name || '',
                        stock: productDetail.stock,
                        price: productDetail.price,
                        image_url: productDetail.image_url || product?.image_url || '',
                        status: productDetail.status
                    }
                };
                cartContext.addToCart(productDetail.id, quantity, cartItem);
            }
            // Reset số lượng về 1 sau khi thêm vào giỏ hàng thành công
            setQuantity(1);
        } catch (error) {
            // Error is already handled in API
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Alert severity="error">{error || "Không tìm thấy sản phẩm"}</Alert>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Breadcrumbs Navigation */}
            <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                sx={{ mb: 4 }}
            >
                <Link
                    color="inherit"
                    href="/"
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        '&:hover': { color: 'primary.main' }
                    }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Trang chủ
                </Link>
                <Link
                    color="inherit"
                    href="/products"
                    sx={{ '&:hover': { color: 'primary.main' } }}
                >
                    Sản phẩm
                </Link>
                <Typography color="text.primary">{product?.name}</Typography>
            </Breadcrumbs>

            <Grid container spacing={4}>
                {/* Left side: Product Images */}
                <Grid item xs={12} md={5}>
                    <Zoom in={!loading} style={{ transitionDelay: loading ? '0ms' : '200ms' }}>
                        <Box>
                            <ProductImageGallery 
                                images={productImages.length > 0 ? productImages : [product?.image_url || 'https://via.placeholder.com/400x400?text=No+Image']} 
                            />
                        </Box>
                    </Zoom>
                </Grid>

                {/* Right side: Product Info */}
                <Grid item xs={12} md={7}>
                    <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : '300ms' }}>
                        <Box>
                            {/* Product Title and Price */}
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 700,
                                    mb: 2,
                                    background: theme.palette.primary.main,
                                    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                }}
                            >
                                {product?.name}
                            </Typography>

                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 3 
                            }}>
                                <Typography 
                                    variant="h5" 
                                    color="error" 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '2rem'
                                    }}
                                >
                                    {productDetail ? productDetail.price.toLocaleString() : product?.price.toLocaleString()} VNĐ
                                </Typography>
                                {productDetail?.stock > 0 && (
                                    <Chip
                                        label="Còn hàng"
                                        color="success"
                                        size="small"
                                        icon={<VerifiedIcon />}
                                        sx={{ fontWeight: 500 }}
                                    />
                                )}
                            </Box>

                            {/* Product Benefits */}
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                mb: 4,
                                flexWrap: 'wrap'
                            }}>
                                <Paper sx={{ 
                                    p: 1.5, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    flex: 1,
                                    minWidth: 200,
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText'
                                }}>
                                    <LocalShippingIcon />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Hỗ trợ vận chuyển toàn quốc
                                        </Typography>
                                        <Typography variant="caption">
                                            
                                        </Typography>
                                    </Box>
                                </Paper>

                                <Paper sx={{ 
                                    p: 1.5, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    flex: 1,
                                    minWidth: 200,
                                    bgcolor: 'secondary.light',
                                    color: 'secondary.contrastText'
                                }}>
                                    <SecurityIcon />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Bảo hành 12 tháng
                                        </Typography>
                                        <Typography variant="caption">
                                            1 đổi 1 trong 30 ngày
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>

                            {/* Barcode Section */}
                            {productDetail?.barcode && (
                                <Paper sx={{ 
                                    p: 2,
                                    mb: 3,
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`
                                }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2
                                    }}>
                                        <QrCode2Icon color="primary" sx={{ fontSize: 40 }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Mã sản phẩm
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                {productDetail.barcode}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}

                            <Divider sx={{ my: 3 }} />

                            {/* Options Selection */}
                            <Box sx={{ mb: 4 }}>
                                {/* Colors */}
                                {availableColors.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Màu sắc:
                                        </Typography>
                                        <ToggleButtonGroup 
                                            value={selectedColor?.id || ''} 
                                            exclusive 
                                            onChange={(_, value) => {
                                                const color = availableColors.find(c => c.id === value);
                                                if (color) setSelectedColor(color);
                                            }}
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                '& .MuiToggleButton-root': {
                                                    borderRadius: 1,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'primary.main',
                                                        color: 'primary.contrastText',
                                                        '&:hover': {
                                                            backgroundColor: 'primary.dark',
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            {availableColors.map((color) => (
                                                <ToggleButton 
                                                    key={color.id} 
                                                    value={color.id}
                                                    sx={{
                                                        minWidth: 80,
                                                        py: 1
                                                    }}
                                                >
                                                    {color.name}
                                                </ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>
                                    </Box>
                                )}

                                {/* Sizes */}
                                {availableSizes.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Kích thước:
                                        </Typography>
                                        <ToggleButtonGroup 
                                            value={selectedSize?.id || ''} 
                                            exclusive 
                                            onChange={(_, value) => {
                                                const size = availableSizes.find(s => s.id === value);
                                                if (size) setSelectedSize(size);
                                            }}
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                '& .MuiToggleButton-root': {
                                                    borderRadius: 1,
                                                    minWidth: 60,
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'primary.main',
                                                        color: 'primary.contrastText',
                                                    }
                                                }
                                            }}
                                        >
                                            {availableSizes.map((size) => (
                                                <ToggleButton key={size.id} value={size.id}>
                                                    {size.name}
                                                </ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>
                                    </Box>
                                )}

                                {/* Materials */}
                                {availableMaterials.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Chất liệu:
                                        </Typography>
                                        <ToggleButtonGroup 
                                            value={selectedMaterial?.id || ''} 
                                            exclusive 
                                            onChange={(_, value) => {
                                                const material = availableMaterials.find(m => m.id === value);
                                                if (material) setSelectedMaterial(material);
                                            }}
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                '& .MuiToggleButton-root': {
                                                    borderRadius: 1,
                                                    minWidth: 100,
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'primary.main',
                                                        color: 'primary.contrastText',
                                                    }
                                                }
                                            }}
                                        >
                                            {availableMaterials.map((material) => (
                                                <ToggleButton key={material.id} value={material.id}>
                                                    {material.name}
                                                </ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>
                                    </Box>
                                )}
                            </Box>

                            {/* Quantity and Stock */}
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 2,
                                mb: 4 
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Số lượng:
                                    </Typography>
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <IconButton 
                                            onClick={() => handleQuantityChange('decrease')}
                                            disabled={quantity <= 1}
                                            size="small"
                                            sx={{ borderRadius: 0 }}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography 
                                            sx={{ 
                                                px: 3,
                                                minWidth: 50,
                                                textAlign: 'center',
                                                fontWeight: 600
                                            }}
                                        >
                                            {quantity}
                                        </Typography>
                                        <IconButton 
                                            onClick={() => handleQuantityChange('increase')}
                                            disabled={quantity >= (productDetail?.stock || 0)}
                                            size="small"
                                            sx={{ borderRadius: 0 }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Paper>
                                </Box>

                                {productDetail && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Tồn kho:
                                        </Typography>
                                        <Chip
                                            label={`${productDetail.stock} sản phẩm`}
                                            color={productDetail.stock > 10 ? 'success' : productDetail.stock > 0 ? 'warning' : 'error'}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Add to Cart Button */}
                            <Button 
                                variant="contained"
                                size="large" 
                                disabled={!productDetail || productDetail.stock <= 0}
                                startIcon={<ShoppingCartIcon />}
                                onClick={handleAddToCart}
                                sx={{
                                    width: '100%',
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    borderRadius: 2,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    boxShadow: theme.shadows[4],
                                    '&:hover': {
                                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out'
                                    }
                                }}
                            >
                                {productDetail && productDetail.stock > 0 ? "Thêm vào giỏ hàng" : "Sản phẩm không khả dụng"}
                            </Button>
                        </Box>
                    </Fade>
                </Grid>
            </Grid>

            {/* Product Reviews Section */}
            <Box sx={{ mt: 6 }}>
                <ProductReview 
                    reviews={reviews} 
                    loading={reviewLoading} 
                    productId={product?.id} 
                />
            </Box>
        </Container>
    );
};

export default ProductDetailPage;
