import React, { useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, Pagination, CircularProgress } from "@mui/material";
import { Review } from "../services/API/ReviewApi";
import reviewApi from "../services/API/ReviewApi";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface ProductReviewProps {
    reviews: Review[];
    loading: boolean;
    productId?: number;
}

const ProductReview: React.FC<ProductReviewProps> = ({ reviews, loading, productId }) => {
    const { isAuthenticated } = useAuth();
    const [page, setPage] = useState(1);
    const reviewsPerPage = 5;
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    // Modal state
    const [open, setOpen] = useState(false);
    const [newRating, setNewRating] = useState<number | null>(5);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Xử lý mở/đóng modal
    const handleOpen = () => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
            return;
        }
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // Thêm review mới
    const handleAddReview = async () => {
        if (!newRating || !newComment.trim() || !productId) return;

        try {
            setSubmitting(true);
            const response = await reviewApi.create({
                product_id: productId,
                rating: newRating,
                comment: newComment.trim()
            });

            if (response.status === 200) {
                toast.success("Đánh giá của bạn đã được gửi thành công!");
                setNewComment("");
                setNewRating(5);
                setOpen(false);
                // Reload trang để cập nhật danh sách review
                window.location.reload();
            }
        } catch (error) {
            console.error("Error adding review:", error);
            toast.error("Không thể gửi đánh giá. Vui lòng thử lại sau!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box mt={4} display="flex" justifyContent="center">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box mt={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">Đánh Giá Sản Phẩm</Typography>
            </Box>

            {reviews.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                    Chưa có đánh giá nào cho sản phẩm này
                </Typography>
            ) : (
                <>
                    {/* Hiển thị danh sách review */}
                    {reviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage).map((review) => (
                        <Box key={review.id} sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {review.username}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {review.created_at}
                                </Typography>
                            </Box>
                            <Rating value={review.rating} readOnly />
                            <Typography variant="body2" mt={1}>{review.comment}</Typography>
                        </Box>
                    ))}

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={(_, value) => setPage(value)} 
                            sx={{ mt: 2 }} 
                        />
                    )}
                </>
            )}

            {/* Modal Thêm Review */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Thêm Đánh Giá</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Typography component="legend">Đánh giá của bạn</Typography>
                        <Rating 
                            value={newRating} 
                            onChange={(_, value) => setNewRating(value)}
                            size="large"
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Nhập đánh giá của bạn..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={submitting}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary" disabled={submitting}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleAddReview} 
                        variant="contained" 
                        color="primary"
                        disabled={submitting || !newRating || !newComment.trim()}
                    >
                        {submitting ? "Đang gửi..." : "Gửi"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductReview;
