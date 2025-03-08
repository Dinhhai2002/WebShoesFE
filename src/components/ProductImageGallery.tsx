import React, { useState } from "react";
import { Box, Grid, Card, CardMedia } from "@mui/material";

interface ProductImageGalleryProps {
    images: string[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <Box>
            <Card sx={{ mb: 2 }}>
                <CardMedia component="img" height="300" image={selectedImage} alt="Product" />
            </Card>
            <Grid container spacing={1}>
                {images.map((img, index) => (
                    <Grid item xs={3} key={index}>
                        <Card sx={{ cursor: "pointer", border: selectedImage === img ? "2px solid #1976d2" : "none" }}
                              onClick={() => setSelectedImage(img)}>
                            <CardMedia component="img" height="80" image={img} alt="Thumbnail" />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ProductImageGallery;
