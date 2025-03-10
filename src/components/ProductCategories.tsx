import React from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';

interface Category {
    id: number;
    name: string;
    imageUrl: string;
    description: string;
}

interface ProductCategoriesProps {
    categories: Category[];
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({ categories }) => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Danh Mục Sản Phẩm
            </Typography>
            <Grid container spacing={3}>
                {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={3} key={category.id}>
                        <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'scale(1.02)' } }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={category.imageUrl}
                                alt={category.name}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {category.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {category.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ProductCategories; 