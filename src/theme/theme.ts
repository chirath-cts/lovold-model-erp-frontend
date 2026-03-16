import { createTheme } from "@mui/material/styles";

import { COLORS } from "./colors";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: COLORS.primary,
      dark: "#002a38",
      light: COLORS.primaryContainer,
      contrastText: "#ffffff",
    },
    secondary: {
      main: COLORS.secondary,
      contrastText: "#ffffff",
    },
    background: {
      default: COLORS.background,
      paper: COLORS.paper,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    divider: COLORS.border,
    error: {
      main: COLORS.danger,
    },
    warning: {
      main: COLORS.warning,
    },
    success: {
      main: COLORS.success,
    },
    info: {
      main: COLORS.info,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "var(--font-family)",
    h1: {
      fontWeight: 800,
      fontSize: "2rem",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "1.5rem",
    },
    h3: {
      fontWeight: 700,
      fontSize: "1.125rem",
    },
    subtitle2: {
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontWeight: 700,
      fontSize: "0.72rem",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 10px rgba(0, 28, 38, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: COLORS.textSecondary,
          textTransform: "uppercase",
          fontSize: "0.72rem",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 700,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "capitalize",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
        },
      },
    },
  },
});

export default theme;
