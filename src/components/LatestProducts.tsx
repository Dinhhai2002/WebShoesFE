import React from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { Product } from '../services/API/ProductApi';

interface LatestProductsProps {
    products: Product[];
    loading: boolean;
    error: string | null;
}

const LatestProducts: React.FC<LatestProductsProps> = ({ products, loading, error }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Sản Phẩm Mới Nhất
                </Typography>
                <Button variant="contained" color="primary">
                    Xem Tất Cả
                </Button>
            </Stack>
            <Grid container spacing={3}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={2.4} key={product.id}>
                        <Card sx={{ 
                            height: '100%', 
                            cursor: 'pointer', 
                            '&:hover': { transform: 'scale(1.02)' },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.image_url || 'https://via.placeholder.com/300x300'}
                                alt={product.name}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {product.description || 'Không có mô tả'}
                                    </Typography>
                                </Box>
                                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                    {product.price.toLocaleString('vi-VN')}đ
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