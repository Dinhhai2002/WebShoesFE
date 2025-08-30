import { useEffect, useRef, useState } from 'react';
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
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BannerSlider from '../components/BannerSlider';
// import ProductCategories from '../components/ProductCategories';
import LatestProducts from '../components/LatestProducts';
import authenticationApiService from '../services/API/AuthenticationApiService';
import { Product } from '../services/API/ProductApi';
import { Category } from '../services/API/CategoryApi';
import { Brand } from '../services/API/BrandApi';
import { Banner } from '../services/API/BannerApi';
import productDetailApi, { ProductDetail } from '../services/API/ProductDetailApi';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BoltIcon from '@mui/icons-material/Bolt';
import { keyframes } from '@mui/system';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const Home = () => {
    const theme = useTheme();
    // const isMobile = useTheme().breakpoints.down('sm');
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryProducts, setCategoryProducts] = useState<ProductDetail[]>([]);
    const [categoryProductsLoading, setCategoryProductsLoading] = useState<boolean>(false);
    const [categoryProductsError, setCategoryProductsError] = useState<string | null>(null);

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

    // Fetch products by category (Áo khoác dù - categoryId 24)
    useEffect(() => {
        const loadCategoryProducts = async () => {
            try {
                setCategoryProductsLoading(true);
                const res = await productDetailApi.findAll({ category_id: 24, status: 1, page: 1, limit: 20 });
                setCategoryProducts(res.data.list || []);
            } catch (e) {
                setCategoryProductsError('Không thể tải sản phẩm theo danh mục');
            } finally {
                setCategoryProductsLoading(false);
            }
        };
        loadCategoryProducts();
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

    // Split banners for layout: 1 large slider + 2 small sliders
    const mainBanners = transformedBanners.slice(0, Math.max(1, Math.min(3, transformedBanners.length)));
    const sideBannersTop = transformedBanners.slice(3, 4).length ? transformedBanners.slice(3, 4) : transformedBanners.slice(0, 1);
    const sideBannersBottom = transformedBanners.slice(4, 5).length ? transformedBanners.slice(4, 5) : transformedBanners.slice(1, 2).length ? transformedBanners.slice(1, 2) : transformedBanners.slice(0, 1);

    // Simple autoplay small banner slider
    const SmallBannerSlider: React.FC<{ data: { id: number; imageUrl: string }[]; height?: number }> = ({ data, height = 190 }) => {
        const [index, setIndex] = useState(0);
        useEffect(() => {
            if (!data.length) return;
            const t = setInterval(() => setIndex(prev => (prev + 1) % data.length), 4000);
            return () => clearInterval(t);
        }, [data.length]);
        if (!data.length) return null;
        return (
            <Box sx={{ position: 'relative', height, overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                {data.map((b, i) => (
                    <Box key={b.id} sx={{ position: 'absolute', inset: 0, opacity: i === index ? 1 : 0, transition: 'opacity .6s ease', backgroundImage: `url(${b.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ))}
            </Box>
        );
    };

    // Generic horizontal carousel for categories/brands
    const createCarouselHandlers = () => {
        const ref = useRef<HTMLDivElement | null>(null);
        const next = () => {
            if (!ref.current) return;
            ref.current.scrollBy({ left: ref.current.clientWidth * 0.9, behavior: 'smooth' });
        };
        const prev = () => {
            if (!ref.current) return;
            ref.current.scrollBy({ left: -ref.current.clientWidth * 0.9, behavior: 'smooth' });
        };
        return { ref, next, prev } as const;
    };

    const categoriesCarousel = createCarouselHandlers();
    const brandsCarousel = createCarouselHandlers();

    // Marquee animation for promo strip
    const marquee = keyframes`
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    `;

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pt: 2 }}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                {/* Promo Marquee Strip */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(90deg, #0b1020, #0b1020)', color: 'white' }}>
                        <Box sx={{ display: 'flex', gap: 6, whiteSpace: 'nowrap', px: 2, py: 1, animation: `${marquee} 18s linear infinite` }}>
                            {[...Array(8)].map((_, i) => (
                                <Box key={i} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mx: 2 }}>
                                    <BoltIcon sx={{ color: 'warning.main' }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                        Giảm giá mùa thu: Giảm đến 70% trên các sản phẩm đã chọn
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Hero Section: 1 large banner slider + 2 small stacked sliders */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', backgroundColor: 'transparent', border: '1px solid', borderColor: 'divider' }}>
                            <BannerSlider banners={mainBanners} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', backgroundColor: 'transparent', border: '1px solid', borderColor: 'divider' }}>
                                    <SmallBannerSlider data={sideBannersTop} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', backgroundColor: 'transparent', border: '1px solid', borderColor: 'divider' }}>
                                    <SmallBannerSlider data={sideBannersBottom} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Trending Categories Section - Carousel */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LocalFireDepartmentIcon sx={{ color: 'error.main', fontSize: 40 }} />
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>Xu Hướng Thời Trang</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" onClick={categoriesCarousel.prev} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', p: 0 }}>‹</Button>
                            <Button variant="outlined" onClick={categoriesCarousel.next} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', p: 0 }}>›</Button>
                        </Box>
                    </Box>
                    <Box ref={categoriesCarousel.ref} sx={{ display: 'flex', gap: 2, overflowX: 'auto', scrollSnapType: 'x mandatory', px: 0.5, pb: 1,
                        '&::-webkit-scrollbar': { display: 'none' } }}>
                        {transformedCategories.map(cat => (
                            <Card key={cat.id} onClick={cat.onClick} sx={{ minWidth: 180, scrollSnapAlign: 'start', cursor: 'pointer', borderRadius: 3, overflow: 'hidden', flex: '0 0 auto', transition: 'transform .2s', border: '1px solid', borderColor: 'divider', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] } }}>
                                <CardMedia component="img" image={cat.imageUrl} alt={cat.name} sx={{ height: 120, objectFit: 'cover' }} />
                                <CardContent sx={{ py: 1.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center' }}>{cat.name}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button variant="contained" size="large" onClick={handleSeeAllCategories} endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, px: 4, py: 1.5, backgroundColor: 'primary.dark', '&:hover': { backgroundColor: 'primary.main' } }}>Khám phá thêm</Button>
                    </Box>
                </Box>

                {/* Featured Brands Section - Carousel */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 6, backgroundColor: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>Thương Hiệu Nổi Bật</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" onClick={brandsCarousel.prev} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', p: 0 }}>‹</Button>
                            <Button variant="outlined" onClick={brandsCarousel.next} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', p: 0 }}>›</Button>
                        </Box>
                    </Box>
                    <Box ref={brandsCarousel.ref} sx={{ display: 'flex', gap: 2, overflowX: 'auto', scrollSnapType: 'x mandatory', px: 0.5, pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                        {brands.map(brand => (
                            <Card key={brand.id} onClick={() => handleBrandClick(brand.id)} sx={{ minWidth: 180, scrollSnapAlign: 'start', cursor: 'pointer', borderRadius: 3, overflow: 'hidden', flex: '0 0 auto', border: '1px solid', borderColor: 'divider', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6], borderColor: 'primary.main' } }}>
                                <CardMedia component="img" image={brand.image_url} alt={brand.name} sx={{ height: 90, objectFit: 'contain', p: 2 }} />
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="subtitle1" align="center" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="outlined" onClick={handleSeeAllBrands} endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, px: 3, borderColor: 'primary.main', '&:hover': { backgroundColor: 'primary.main', color: 'white' } }}>Xem tất cả</Button>
                    </Box>
                </Paper>

                {/* Products by Category Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ fontWeight: 600, mb: 2 }}
                    >
                        Sản phẩm theo danh mục Áo khoác dù
                    </Typography>
                    {categoryProductsError && (
                        <Typography color="error" sx={{ mb: 2 }}>{categoryProductsError}</Typography>
                    )}
                    <Box sx={{ position: 'relative' }}>
                        <Box ref={brandsCarousel.ref /* reuse structure-only; not handlers */} sx={{ display: 'flex', gap: 3, overflowX: 'auto', scrollSnapType: 'x mandatory', px: 0.5, pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                            {categoryProductsLoading ? (
                                <Typography sx={{ p: 2 }}>Đang tải...</Typography>
                            ) : (
                                categoryProducts.map(pd => (
                                    <Card key={pd.id} sx={{ minWidth: 260, maxWidth: 280, flex: '0 0 auto', scrollSnapAlign: 'start', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] } }} onClick={() => navigate(`/product/${pd.product_id}`, { state: { colorId: pd.color_id, sizeId: pd.size_id, materialId: pd.material_id, selectedProduct: pd } })}>
                                        <CardMedia component="img" image={pd.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} alt={pd.name} sx={{ height: 180, objectFit: 'cover' }} />
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.6em' }}>{pd.name}</Typography>
                                            <Typography variant="h6" color="error" sx={{ mt: 'auto', fontWeight: 700 }}>{pd.price.toLocaleString()} VNĐ</Typography>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </Box>
                        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                            <Button onClick={() => brandsCarousel.prev()} variant="text" sx={{ pointerEvents: 'auto', position: 'absolute', top: '50%', left: -6, transform: 'translateY(-50%)', p: 0, minWidth: 0 }}>
                                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.05)' } }}>
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </Box>
                            </Button>
                            <Button onClick={() => brandsCarousel.next()} variant="text" sx={{ pointerEvents: 'auto', position: 'absolute', top: '50%', right: -6, transform: 'translateY(-50%)', p: 0, minWidth: 0 }}>
                                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.05)' } }}>
                                    <ArrowForwardIosIcon fontSize="small" />
                                </Box>
                            </Button>
                        </Box>
                    </Box>
                </Box>

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
