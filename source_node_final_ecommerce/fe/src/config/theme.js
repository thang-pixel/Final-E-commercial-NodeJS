// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#06b6d4",   // cyan
      contrastText: "#fff",
    },
    secondary: {
      main: "#0284c7",   // darker cyan
    },
  },
});

export default theme;
