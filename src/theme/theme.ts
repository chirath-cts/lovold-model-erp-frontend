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
    fontFamily: "var(--font-family)",
  },
  components: {},
});

export default theme;
