import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6C5DD3", // Màu tím
    },
    secondary: {
      main: "#35C0C5", // Màu xanh dương nhạt
    },
    background: {
      default: "#F4F7FE", // Màu nền sáng
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: {
      fontWeight: 700,
      color: "#2B3674",
    },
    h6: {
      fontWeight: 600,
      color: "#6C5DD3",
    },
    body1: {
      color: "#4A5568",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          boxShadow: "none",
          padding: "10px 20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default theme;
