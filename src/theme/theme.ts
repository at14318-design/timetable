import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

export default theme;
