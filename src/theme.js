import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#c03",
      contrastText: "#fff",
    },
    secondary: {
      main: "#c03",
      contrastText: "#fff",
    },
    inactive: {
      main: "#ccc",
      contrastText: "#000",
    },
    error: {
      main: red.A400,
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiGrid: {
      styleOverrides: {
        root: {
          boxSizing: "border-box",
        },
        container: {
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
        },
        item: {
          paddingLeft: "12px",
          paddingRight: "12px",
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          // target links inside List
          "& a": {
            textDecoration: "none",
            color: "rgba(0, 0, 0, 0.87)",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          height: 50,
        },
      },
    },
  },
});

export const font = roboto;

export default theme;
