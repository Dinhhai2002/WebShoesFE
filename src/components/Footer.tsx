import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#eee' }}>
            <Typography variant="body2">© 2025 E-Shop. All rights reserved.</Typography>
        </Box>
    );
};

export default Footer;
