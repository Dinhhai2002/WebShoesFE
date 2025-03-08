import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';

interface SidebarProps {
    open: boolean;
    toggleDrawer: (status: boolean) => () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, toggleDrawer }) => {
    return (
        <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
            <List sx={{ width: 250 }}>
                {['Home', 'Products', 'Cart'].map((text) => (
                    <ListItem key={text}>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
