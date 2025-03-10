import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Grid, Button, ToggleButtonGroup, ToggleButton, Divider, CircularProgress, Alert } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ProductImageGallery from "../components/ProductImageGallery";
import ProductReview from "../components/ProductReview";
import productApi from "../services/API/ProductApi";
import productDetailApi from "../services/API/ProductDetailApi";
import colorApi from "../services/API/ColorApi";
import sizeApi from "../services/API/SizeApi";
import materialApi from "../services/API/MaterialApi";
import { Product } from "../services/API/ProductApi";
import { ProductDetail } from "../services/API/ProductDetailApi";
import { Color } from "../services/API/ColorApi";
import { Size } from "../services/API/SizeApi";
import { Material } from "../services/API/MaterialApi";

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
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

    // Fetch product and options data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch product
                const productResponse = await productApi.findOne(Number(id));
                setProduct(productResponse.data);

                // Fetch options
                const [colorsResponse, sizesResponse, materialsResponse] = await Promise.all([
                    colorApi.findAll({ status: 1 }),
                    sizeApi.findAll({ status: 1 }),
                    materialApi.findAll({ status: 1 })
                ]);

                setColors(colorsResponse.data.list);
                setSizes(sizesResponse.data.list);
                setMaterials(materialsResponse.data.list);

                // Set default selections
                if (colorsResponse.data.list.length > 0) {
                    setSelectedColor(colorsResponse.data.list[0]);
                }
                if (sizesResponse.data.list.length > 0) {
                    setSelectedSize(sizesResponse.data.list[0]);
                }
                if (materialsResponse.data.list.length > 0) {
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
    }, [id]);

    // Fetch product detail when selections change
    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!product || !selectedColor || !selectedSize || !selectedMaterial) return;

            try {
                const response = await productDetailApi.findAll({
                    product_id: product.id,
                    color_id: selectedColor.id,
                    size_id: selectedSize.id,
                    material_id: selectedMaterial.id,
                    status: 1
                });

                if (response.data.list.length > 0) {
                    setProductDetail(response.data.list[0]);
                    // Update product images from the selected product detail
                    setProductImages(response.data.list[0].image_urls || []);
                } else {
                    setProductDetail(null);
                    setProductImages([]);
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
                const response = await productDetailApi.findAll({
                    product_id: product.id,
                    status: 1
                });

                // Collect all unique image URLs from product details
                const allImages = response.data.list
                    .flatMap(detail => detail.image_url || [])
                    .filter((url, index, self) => self.indexOf(url) === index);

                setProductImages(allImages);
            } catch (err) {
                console.error("Error fetching all product details:", err);
            }
        };

        fetchAllProductDetails();
    }, [product]);

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

                    <Button 
                        variant="contained"
                        color="primary"
                        size="large" 
                        disabled={!productDetail}
                        startIcon={<ShoppingCartIcon />}
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
            <ProductReview />
        </Box>
    );
};

export default ProductDetailPage;
