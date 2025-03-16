import React, { useState, useEffect } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface BannerSliderProps {
    banners: {
        id: number;
        imageUrl: string;
        title: string;
        description: string;
    }[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === banners.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [banners.length]);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? banners.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden', mt: 4 }}>
            {banners.map((banner, index) => (
                <Paper
                    key={banner.id}
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: index === currentIndex ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        backgroundImage: `url(${banner.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        textAlign: 'center',
                    }}
                >
                    {/* <Box sx={{ backgroundColor: 'rgba(0,0,0,0.5)', p: 4, borderRadius: 2 }}>
                        <h2>{banner.title}</h2>
                        <p>{banner.description}</p>
                    </Box> */}
                </Paper>
            ))}
            <IconButton
                onClick={handlePrevious}
                sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                }}
            >
                <ArrowBackIosIcon />
            </IconButton>
            <IconButton
                onClick={handleNext}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                }}
            >
                <ArrowForwardIosIcon />
            </IconButton>
        </Box>
    );
};

export default BannerSlider; 