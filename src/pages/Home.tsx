import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
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

const Home: React.FC = () => {
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
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Box>
                <BannerSlider banners={transformedBanners} />
                
                {/* Categories Section with See All button */}
                <Box sx={{ position: 'relative', mb: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 3,
                        mt: 3
                    }}>
                        <Typography variant="h4">
                            Danh Mục Sản Phẩm
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={handleSeeAllCategories}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white'
                                }
                            }}
                        >
                            Xem tất cả
                        </Button>
                    </Box>
                    <ProductCategories categories={transformedCategories} />
                </Box>
                
                {/* Top Brands Section */}
                <Box sx={{ my: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <Typography variant="h4">
                            Thương Hiệu Nổi Bật
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={handleSeeAllBrands}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
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
                            <Grid item xs={6} sm={4} md={3} lg={1.5} key={brand.id}>
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
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
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
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                        <Typography 
                                            variant="subtitle1" 
                                            align="center"
                                            sx={{
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {brand.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <LatestProducts products={products} loading={loading} error={error} />
            </Box>
        </Container>
    );
};

export default Home;
