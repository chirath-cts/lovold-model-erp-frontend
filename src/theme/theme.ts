import { createTheme } from "@mui/material/styles";
import { COLORS } from "./colors";

const theme = createTheme({
  palette: {
    primary: { main: COLORS.primary },
    secondary: { main: COLORS.secondary },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  components: {
    MuiFormLabel: {
      styleOverrides: {
        root: {
          marginTop: "-4px",
          fontSize: "var(--default-font-size)",
          "&.Mui-focused": {
            color: "var(--primary-color)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            height: "var(--input-height)",
            fontSize: "var(--default-font-size)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: "var(--input-height)",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--primary-color)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--primary-color)",
          },
        },
        input: {
          padding: "8px 14px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: "var(--button-height)",
          height: "var(--button-height)",
          fontSize: "var(--default-font-size)",
          backgroundColor: "var(--primary-color)",
          color: "var(--font-color1)",
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            backgroundColor: "var(--second-color)",
          },
        },
        outlinedSecondary: {
          color: "var(--cancel-button-font-color)",
          backgroundColor: "var(--cancel-button-background-color)",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "var(--cancel-button-hover-color)",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginRight: 32,
        },
        label: {
          fontSize: "var(--default-font-size)",
          marginLeft: "2px",
        },
      },
    },
  },
});

export default theme;
