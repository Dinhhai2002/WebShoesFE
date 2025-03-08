import React, { useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, Pagination } from "@mui/material";

interface Review {
    user: string;
    rating: number;
    comment: string;
    date: string;
}

const ProductReview: React.FC = () => {
    // Fake danh sách review
    const [reviews, setReviews] = useState<Review[]>([
        { user: "Nguyễn Văn A", rating: 5, comment: "Giày rất đẹp, chất lượng tốt!", date: "2024-02-10" },
        { user: "Trần Thị B", rating: 4, comment: "Giá hợp lý, phù hợp với sinh viên!", date: "2024-02-09" },
        { user: "Lê Hoàng C", rating: 3, comment: "Sản phẩm khá ổn nhưng giao hàng hơi chậm.", date: "2024-02-08" }
    ]);

    // Pagination
    const [page, setPage] = useState(1);
    const reviewsPerPage = 2;
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    // Modal state
    const [open, setOpen] = useState(false);
    const [newRating, setNewRating] = useState<number | null>(5);
    const [newComment, setNewComment] = useState("");

    // Xử lý mở/đóng modal
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Thêm review mới
    const handleAddReview = () => {
        if (newRating && newComment.trim() !== "") {
            setReviews([
                ...reviews,
                { user: "Bạn", rating: newRating, comment: newComment, date: new Date().toISOString().split("T")[0] }
            ]);
            setNewComment("");
            setNewRating(5);
            setOpen(false);
        }
    };

    return (
        <Box mt={4}>
            <Typography variant="h5" fontWeight="bold">Đánh Giá Sản Phẩm</Typography>

            {/* Hiển thị danh sách review */}
            {reviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage).map((review, index) => (
                <Box key={index} sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{review.user}</Typography>
                    <Rating value={review.rating} readOnly />
                    <Typography variant="body2" mt={1}>{review.comment}</Typography>
                    <Typography variant="caption" color="textSecondary">{review.date}</Typography>
                </Box>
            ))}

            {/* Phân trang */}
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} sx={{ mt: 2 }} />

            {/* Nút thêm đánh giá */}
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleOpen}>
                Thêm Đánh Giá
            </Button>

            {/* Modal Thêm Review */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Thêm Đánh Giá</DialogTitle>
                <DialogContent>
                    <Rating value={newRating} onChange={(_, value) => setNewRating(value)} />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Nhập đánh giá của bạn..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Hủy</Button>
                    <Button onClick={handleAddReview} variant="contained" color="primary">Gửi</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductReview;
