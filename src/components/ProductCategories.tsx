import React from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';

interface Category {
    id: number;
    name: string;
    imageUrl: string;
    description: string;
    onClick?: () => void;
}

interface ProductCategoriesProps {
    categories: Category[];
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({ categories }) => {
    return (
        <Grid container spacing={3}>
            {categories.map((category) => (
                <Grid item xs={12} sm={6} md={3} key={category.id}>
                    <Card 
                        onClick={category.onClick}
                        sx={{ 
                            height: '100%', 
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
                            height="200"
                            image={category.imageUrl}
                            alt={category.name}
                            sx={{
                                objectFit: 'cover'
                            }}
                        />
                        <CardContent>
                            <Typography 
                                gutterBottom 
                                variant="h6" 
                                component="div"
                                sx={{ fontWeight: 600 }}
                            >
                                {category.name}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}
                            >
                                {category.description}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductCategories; 