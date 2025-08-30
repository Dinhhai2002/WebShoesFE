import { useRef } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, CircularProgress, Alert, Tooltip, Button, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import { Product } from '../services/API/ProductApi';

interface LatestProductsProps {
    products: Product[];
    loading: boolean;
    error: string | null;
}

const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const LatestProducts: React.FC<LatestProductsProps> = ({ products, loading, error }) => {
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const handlePrev = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        container.scrollBy({ left: -Math.max(container.clientWidth * 0.9, 280), behavior: 'smooth' });
    };

    const handleNext = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        container.scrollBy({ left: Math.max(container.clientWidth * 0.9, 280), behavior: 'smooth' });
    };

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
        <Box sx={{ my: 2 }}>
            <Box sx={{ position: 'relative' }}>
                <Box ref={scrollRef} sx={{ display: 'flex', gap: 3, overflowX: 'auto', scrollSnapType: 'x mandatory', px: 0.5, pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                    {products.map((product) => (
                        <Card key={product.id} sx={{ minWidth: 260, maxWidth: 280, flex: '0 0 auto', scrollSnapAlign: 'start', cursor: 'pointer', borderRadius: 3, overflow: 'hidden', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }} onClick={() => navigate(`/product/${product.id}`)}>
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia component="img" image={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} alt={product.name} sx={{ height: 180, objectFit: 'cover' }} />
                            </Box>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Tooltip title={product.name} placement="top" arrow>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.6em' }}>
                                        {product.name}
                                    </Typography>
                                </Tooltip>
                                <Tooltip title={product.description ? stripHtml(product.description) : 'Không có mô tả'} placement="top" arrow>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5em' }}>
                                        {product.description ? stripHtml(product.description) : 'Không có mô tả'}
                                    </Typography>
                                </Tooltip>
                                <Typography variant="h6" color="error" sx={{ mt: 'auto', fontWeight: 700 }}>
                                    {product.price.toLocaleString()} VNĐ
                                </Typography>
                                <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start', borderRadius: 999 }}>Xem chi tiết</Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
                <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <IconButton onClick={handlePrev} sx={{ pointerEvents: 'auto', position: 'absolute', top: '50%', left: -6, transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 2, '&:hover': { bgcolor: 'background.paper', transform: 'translateY(-50%) scale(1.05)' } }}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={handleNext} sx={{ pointerEvents: 'auto', position: 'absolute', top: '50%', right: -6, transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 2, '&:hover': { bgcolor: 'background.paper', transform: 'translateY(-50%) scale(1.05)' } }}>
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default LatestProducts; 