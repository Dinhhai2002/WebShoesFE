import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const Home: React.FC = () => {
    return (
        <Box textAlign="center" mt={5}>
            <Typography variant="h4">Welcome to E-Shop</Typography>
            <Typography variant="subtitle1">Your one-stop online shopping destination</Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
                Shop Now
            </Button>
        </Box>
    );
};

export default Home;
