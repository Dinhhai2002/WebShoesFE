import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import BannerSlider from '../components/BannerSlider';
import ProductCategories from '../components/ProductCategories';
import LatestProducts from '../components/LatestProducts';
import productApi from '../services/API/ProductApi';
import categoryApi from '../services/API/CategoryApi';
import { Product } from '../services/API/ProductApi';
import { Category } from '../services/API/CategoryApi';

// Mock data for demonstration
const mockBanners = [
    {
        id: 1,
        imageUrl: 'https://via.placeholder.com/1200x400',
        title: 'Giày Thể Thao Chính Hãng',
        description: 'Khám phá bộ sưu tập mới nhất với giá tốt nhất'
    },
    {
        id: 2,
        imageUrl: 'https://via.placeholder.com/1200x400',
        title: 'Giảm Giá Lên Đến 50%',
        description: 'Mua sắm thông minh với những ưu đãi hấp dẫn'
    },
    {
        id: 3,
        imageUrl: 'https://via.placeholder.com/1200x400',
        title: 'Phong Cách Thời Trang',
        description: 'Cập nhật xu hướng mới nhất'
    }
];

const Home: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch products
                const productsResponse = await productApi.findAll({
                    keySearch: '',
                    status: 1,
                    page: 1,
                    limit: 20
                });
                setProducts(productsResponse.data.list);

                // Fetch categories
                const categoriesResponse = await categoryApi.findAll({
                    keySearch: '',
                    status: 1,
                    page: 1,
                    limit: 8
                });
                setCategories(categoriesResponse.data.list);
            } catch (err) {
                setError('Không thể tải dữ liệu');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Transform categories data to match ProductCategories component props
    const transformedCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(category.name)}`,
        description: `Danh mục ${category.name}`
    }));

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Box>
                <BannerSlider banners={mockBanners} />
                <ProductCategories categories={transformedCategories} />
                <LatestProducts products={products} loading={loading} error={error} />
            </Box>
        </Container>
    );
};

export default Home;
