import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563EB", // Modern blue
      light: "#3B82F6",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#10B981", // Modern green
      light: "#34D399",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    info: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      color: "#1E293B",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.3,
      color: "#1E293B",
    },
    h3: {
      fontWeight: 700,
      fontSize: "1.75rem",
      lineHeight: 1.3,
      color: "#1E293B",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
      color: "#1E293B",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
      color: "#1E293B",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: 1.4,
      color: "#1E293B",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#374151",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#6B7280",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      fontSize: "0.875rem",
    },
    caption: {
      fontSize: "0.75rem",
      color: "#9CA3AF",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 2px rgba(0, 0, 0, 0.05)",
    "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
    "0px 4px 6px rgba(0, 0, 0, 0.07), 0px 1px 3px rgba(0, 0, 0, 0.06)",
    "0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)",
    "0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
        sizeLarge: {
          padding: "12px 32px",
          fontSize: "1rem",
        },
        sizeSmall: {
          padding: "8px 16px",
          fontSize: "0.75rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        },
        elevation1: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.07), 0px 1px 3px rgba(0, 0, 0, 0.06)",
        },
        elevation3: {
          boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
          "&:hover": {
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.07), 0px 1px 3px rgba(0, 0, 0, 0.06)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3B82F6",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2563EB",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D1D5DB",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3B82F6",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563EB",
            borderWidth: "2px",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          borderRadius: 10,
          fontSize: "0.75rem",
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: "0px 25px 50px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "& .MuiAlert-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
