import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#eee', mt: 'auto' }}>
            <Typography variant="body2">© 2024 E-Shop. All rights reserved.</Typography>
        </Box>
    );
};

export default Footer;
