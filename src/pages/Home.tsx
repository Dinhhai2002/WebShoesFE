import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Grid, 
    Card, 
    CardMedia, 
    CardContent, 
    Button,
    useTheme,
    useMediaQuery,
    Paper,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BannerSlider from '../components/BannerSlider';
import ProductCategories from '../components/ProductCategories';
import LatestProducts from '../components/LatestProducts';
import authenticationApiService from '../services/API/AuthenticationApiService';
import { Product } from '../services/API/ProductApi';
import { Category } from '../services/API/CategoryApi';
import { Brand } from '../services/API/BrandApi';
import { Banner } from '../services/API/BannerApi';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const Home: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch products
                const productsResponse = await authenticationApiService.getProducts({
                    status: 1,
                    page: 1,
                    limit: 20
                });
                setProducts(productsResponse.data.list);

                // Fetch categories
                const categoriesResponse = await authenticationApiService.getCategories({
                    status: 1,
                    page: 1,
                    limit: 8
                });
                setCategories(categoriesResponse.data.list);

                // Fetch brands
                const brandsResponse = await authenticationApiService.getBrands({
                    status: 1,
                    page: 1,
                    limit: 8
                });
                setBrands(brandsResponse.data.list);

                // Fetch banners
                const bannersResponse = await authenticationApiService.getBanners({
                    status: 1,
                    page: 1,
                    limit: 5
                });
                setBanners(bannersResponse.data.list);
            } catch (err) {
                setError('Không thể tải dữ liệu');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCategoryClick = (categoryId: number) => {
        navigate(`/products?category_id=${categoryId}`);
    };

    const handleSeeAllCategories = () => {
        navigate('/products');
    };

    const handleBrandClick = (brandId: number) => {
        navigate(`/products?brand_id=${brandId}`);
    };

    const handleSeeAllBrands = () => {
        navigate('/products');
    };

    // Transform categories data to match ProductCategories component props
    const transformedCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        imageUrl: category.image_url,
        description: `Danh mục ${category.name}`,
        onClick: () => handleCategoryClick(category.id)
    }));

    // Transform banners data to match BannerSlider component props
    const transformedBanners = banners.map(banner => ({
        id: banner.id,
        imageUrl: banner.url,
        title: '',
        description: ''
    }));

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pt: 2 }}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                {/* Hero Section with Enhanced Banner */}
                <Paper elevation={0} sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    mb: 6,
                    backgroundColor: 'transparent' 
                }}>
                    <BannerSlider banners={transformedBanners} />
                </Paper>

                {/* Trending Categories Section */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 4
                    }}>
                        <LocalFireDepartmentIcon sx={{ color: 'error.main', fontSize: 40 }} />
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Xu Hướng Thời Trang
                        </Typography>
                    </Box>
                    <ProductCategories categories={transformedCategories} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button 
                            variant="contained"
                            size="large"
                            onClick={handleSeeAllCategories}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                backgroundColor: 'primary.dark',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                }
                            }}
                        >
                            Khám phá thêm
                        </Button>
                    </Box>
                </Box>

                {/* Featured Brands Section - Redesigned as a Carousel */}
                <Paper elevation={0} sx={{ 
                    p: 4, 
                    borderRadius: 4,
                    mb: 6,
                    backgroundColor: 'white'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Thương Hiệu Nổi Bật
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={handleSeeAllBrands}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                borderColor: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white'
                                }
                            }}
                        >
                            Xem tất cả
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {brands.map((brand) => (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={brand.id}>
                                <Card 
                                    onClick={() => handleBrandClick(brand.id)}
                                    sx={{ 
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 2,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: '1px solid #eee',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: theme.shadows[8],
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={brand.image_url}
                                        alt={brand.name}
                                        sx={{ 
                                            width: '100%',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            filter: 'brightness(1)',
                                            transition: 'filter 0.3s ease',
                                            '&:hover': {
                                                filter: 'brightness(1.1)'
                                            }
                                        }}
                                    />
                                    <CardContent sx={{ 
                                        p: 1, 
                                        '&:last-child': { pb: 1 },
                                        width: '100%'
                                    }}>
                                        <Typography 
                                            variant="subtitle1" 
                                            align="center"
                                            sx={{
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                color: 'text.primary'
                                            }}
                                        >
                                            {brand.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Latest Products Section with Enhanced Styling */}
                <Box sx={{ mb: 6 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 600,
                            mb: 4,
                            textAlign: 'center',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 60,
                                height: 4,
                                backgroundColor: 'primary.main',
                                borderRadius: 2
                            }
                        }}
                    >
                        Sản Phẩm Mới Nhất
                    </Typography>
                    <LatestProducts products={products} loading={loading} error={error} />
                </Box>
            </Container>
        </Box>
    );
};

export default Home;
