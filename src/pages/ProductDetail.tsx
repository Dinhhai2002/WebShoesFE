import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Box, Typography, Grid, Button, ToggleButtonGroup, ToggleButton, Divider, CircularProgress, Alert, IconButton } from "@mui/material";
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

    // Fetch product and options data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch product
                const productResponse = await authenticationApiService.getProductById(Number(id));
                setProduct(productResponse.data);
                setProductImages(productResponse.data.images);

                // Fetch options
                const [colorsResponse, sizesResponse, materialsResponse] = await Promise.all([
                    authenticationApiService.getColors({ status: 1 }),
                    authenticationApiService.getSizes({ status: 1 }),
                    authenticationApiService.getMaterials({ status: 1 })
                ]);

                setColors(colorsResponse.data.list);
                setSizes(sizesResponse.data.list);
                setMaterials(materialsResponse.data.list);

                // Set selections based on passed options or defaults
                if (initialOptions.colorId) {
                    const color = colorsResponse.data.list.find(c => c.id === initialOptions.colorId);
                    if (color) setSelectedColor(color);
                } else if (colorsResponse.data.list.length > 0) {
                    setSelectedColor(colorsResponse.data.list[0]);
                }

                if (initialOptions.sizeId) {
                    const size = sizesResponse.data.list.find(s => s.id === initialOptions.sizeId);
                    if (size) setSelectedSize(size);
                } else if (sizesResponse.data.list.length > 0) {
                    setSelectedSize(sizesResponse.data.list[0]);
                }

                if (initialOptions.materialId) {
                    const material = materialsResponse.data.list.find(m => m.id === initialOptions.materialId);
                    if (material) setSelectedMaterial(material);
                } else if (materialsResponse.data.list.length > 0) {
                    setSelectedMaterial(materialsResponse.data.list[0]);
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
                    // setProductImages(response.data.list[0].image_url ? [response.data.list[0].image_url] : []);
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
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
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
                    id: Date.now(), // Tạo ID tạm thời cho localStorage
                    cart_id: 0,
                    product_detail_id: productDetail.id,
                    quantity: quantity,
                    product_detail: {
                        id: productDetail.id,
                        name: product.name,
                        product_id: product.id,
                        color_id: selectedColor?.id || 0,
                        color: selectedColor?.name || '',
                        size_id: selectedSize?.id || 0,
                        size: selectedSize?.name || '',
                        material_id: selectedMaterial?.id || 0,
                        material: selectedMaterial?.name || '',
                        stock: productDetail.stock,
                        price: productDetail.price,
                        image_url: productDetail.image_url || product.image_url || '',
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
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={4}>
                {/* Bên trái: Hình ảnh */}
                <Grid item xs={12} md={5}>
                    <ProductImageGallery 
                        images={productImages.length > 0 ? productImages : [product.image_url || 'https://via.placeholder.com/400x400?text=No+Image']} 
                    />
                </Grid>

                {/* Bên phải: Thông tin sản phẩm */}
                <Grid item xs={12} md={7}>
                    <Typography variant="h4" fontWeight="bold">{product.name}</Typography>
                    <Typography variant="h5" color="error" mt={1}>
                        {productDetail ? productDetail.price.toLocaleString() : product.price.toLocaleString()} VNĐ
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" fontWeight="bold">Màu sắc:</Typography>
                    <ToggleButtonGroup 
                        value={selectedColor?.id || ''} 
                        exclusive 
                        onChange={(_, value) => {
                            const color = colors.find(c => c.id === value);
                            if (color) setSelectedColor(color);
                        }}
                    >
                        {colors.map((color) => (
                            <ToggleButton key={color.id} value={color.id}>{color.name}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Typography variant="subtitle1" fontWeight="bold" mt={2}>Kích thước:</Typography>
                    <ToggleButtonGroup 
                        value={selectedSize?.id || ''} 
                        exclusive 
                        onChange={(_, value) => {
                            const size = sizes.find(s => s.id === value);
                            if (size) setSelectedSize(size);
                        }}
                    >
                        {sizes.map((size) => (
                            <ToggleButton key={size.id} value={size.id}>{size.name}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Typography variant="subtitle1" fontWeight="bold" mt={2}>Chất liệu:</Typography>
                    <ToggleButtonGroup 
                        value={selectedMaterial?.id || ''} 
                        exclusive 
                        onChange={(_, value) => {
                            const material = materials.find(m => m.id === value);
                            if (material) setSelectedMaterial(material);
                        }}
                    >
                        {materials.map((material) => (
                            <ToggleButton key={material.id} value={material.id}>{material.name}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Divider sx={{ my: 2 }} />

                    {/* Quantity Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                            Số lượng:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <IconButton 
                                onClick={() => handleQuantityChange('decrease')}
                                disabled={quantity <= 1}
                                size="small"
                            >
                                <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                                {quantity}
                            </Typography>
                            <IconButton 
                                onClick={() => handleQuantityChange('increase')}
                                size="small"
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Button 
                        variant="contained"
                        color="primary"
                        size="large" 
                        disabled={!productDetail}
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleAddToCart}
                        sx={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            padding: '12px 24px',
                            textTransform: 'uppercase',
                            '&:hover': {
                                transform: 'scale(1.02)',
                                transition: 'all 0.2s ease-in-out'
                            }
                        }}
                    >
                        {productDetail ? "Thêm vào giỏ hàng" : "Sản phẩm không khả dụng"}
                    </Button>
                </Grid>
            </Grid>

            {/* Block đánh giá sản phẩm */}
            <ProductReview 
                reviews={reviews} 
                loading={reviewLoading} 
                productId={product?.id} 
            />
        </Box>
    );
};

export default ProductDetailPage;
