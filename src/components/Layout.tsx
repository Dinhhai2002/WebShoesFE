import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false);

    const toggleDrawer = (status: boolean) => () => {
        setOpen(status);
    };

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <Sidebar open={open} toggleDrawer={toggleDrawer} />
            <Container sx={{ flexGrow: 1, mt: 2 }}>{children}</Container>
            <Footer />
        </Box>
    );
};

export default Layout;
