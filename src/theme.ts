import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5", // Modern indigo
      light: "#6366F1",
      dark: "#4338CA",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#EC4899", // Modern pink
      light: "#F472B6",
      dark: "#DB2777",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#E11D48", // Rose red
      light: "#FB7185",
      dark: "#BE123C",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B", // Amber
      light: "#FCD34D",
      dark: "#B45309",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#059669", // Emerald
      light: "#34D399",
      dark: "#047857",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#0EA5E9", // Sky blue
      light: "#38BDF8",
      dark: "#0284C7",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A", // Slate 900
      secondary: "#475569", // Slate 600
    },
    divider: "#E2E8F0",
    grey: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', 'Roboto', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: "3rem",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.25rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 700,
      fontSize: "1.875rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 700,
      fontSize: "1.5rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.01em",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    button: {
      fontWeight: 600,
      fontSize: "0.875rem",
      letterSpacing: "0.02em",
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 500,
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(15, 23, 42, 0.08)",
    "0px 1px 4px rgba(15, 23, 42, 0.12)",
    "0px 2px 8px rgba(15, 23, 42, 0.16)",
    "0px 4px 16px rgba(15, 23, 42, 0.16)",
    "0px 8px 24px rgba(15, 23, 42, 0.16)",
    "0px 12px 32px rgba(15, 23, 42, 0.16)",
    "0px 16px 40px rgba(15, 23, 42, 0.16)",
    "0px 20px 48px rgba(15, 23, 42, 0.16)",
    "0px 24px 56px rgba(15, 23, 42, 0.16)",
    "0px 28px 64px rgba(15, 23, 42, 0.16)",
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "8px 20px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0px 4px 12px rgba(79, 70, 229, 0.2)",
          },
        },
        contained: {
          boxShadow: "0px 2px 8px rgba(79, 70, 229, 0.15)",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(79, 70, 229, 0.25)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "rgba(79, 70, 229, 0.04)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(79, 70, 229, 0.04)",
          },
        },
        sizeLarge: {
          padding: "12px 24px",
          fontSize: "1rem",
        },
        sizeSmall: {
          padding: "6px 16px",
          fontSize: "0.75rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 16,
          boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.08)",
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.08)",
        },
        elevation2: {
          boxShadow: "0px 4px 16px rgba(15, 23, 42, 0.08)",
        },
        elevation3: {
          boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.12)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.08)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.12)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6366F1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4F46E5",
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
            borderColor: "#CBD5E1",
            transition: "all 0.2s ease-in-out",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6366F1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4F46E5",
            borderWidth: "2px",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          "&.MuiChip-colorPrimary": {
            backgroundColor: "rgba(79, 70, 229, 0.08)",
            color: "#4F46E5",
          },
          "&.MuiChip-colorSecondary": {
            backgroundColor: "rgba(236, 72, 153, 0.08)",
            color: "#EC4899",
          },
        },
        deleteIcon: {
          color: "currentColor",
          "&:hover": {
            color: "currentColor",
            opacity: 0.8,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.08)",
        },
        standardSuccess: {
          backgroundColor: "rgba(5, 150, 105, 0.08)",
          color: "#059669",
        },
        standardError: {
          backgroundColor: "rgba(225, 29, 72, 0.08)",
          color: "#E11D48",
        },
        standardWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.08)",
          color: "#F59E0B",
        },
        standardInfo: {
          backgroundColor: "rgba(14, 165, 233, 0.08)",
          color: "#0EA5E9",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: "0px 24px 48px rgba(15, 23, 42, 0.16)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
          transition: "color 0.2s ease-in-out",
          "&:hover": {
            color: "#4F46E5",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&:hover": {
            backgroundColor: "rgba(79, 70, 229, 0.04)",
          },
        },
      },
    },
  },
});

export default theme;
