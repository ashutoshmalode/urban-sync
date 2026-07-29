import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0891b2",
      dark: "#0e7490",
      light: "#e0f2fe",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f0f9ff",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontFamily: '"Inter", sans-serif' },
    body2: { fontFamily: '"Inter", sans-serif' },
    caption: { fontFamily: '"Inter", sans-serif' },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontFamily: '"Inter", sans-serif',
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: { fontFamily: '"Inter", sans-serif' },
      },
    },
  },
});

export default theme;
