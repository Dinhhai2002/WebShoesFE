import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Product } from '../services/API/ProductApi';

interface LatestProductsProps {
    products: Product[];
    loading: boolean;
    error: string | null;
}

const LatestProducts: React.FC<LatestProductsProps> = ({ products, loading, error }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Sản Phẩm Mới Nhất
            </Typography>
            <Grid container spacing={3}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3,
                                    transition: 'all 0.3s ease-in-out'
                                }
                            }}
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                                alt={product.name}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h6" component="h3">
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.description || 'Không có mô tả'}
                                </Typography>
                                <Typography variant="h6" color="error" sx={{ mt: 1 }}>
                                    {product.price.toLocaleString()} VNĐ
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default LatestProducts; 