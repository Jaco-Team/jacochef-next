import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { common, green, grey, lightBlue, orange, red } from "@mui/material/colors";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const {
  50: grey50,
  100: grey100,
  200: grey200,
  300: grey300,
  400: grey400,
  500: grey500,
  700: grey700,
  900: grey900,
} = grey;
const { 50: green50, 300: green300, 500: green500, 700: green700 } = green;
const { 50: orange50, 300: orange300, 500: orange500, 700: orange700 } = orange;
const { 50: lightBlue50, 500: lightBlue500, 700: lightBlue700, 900: lightBlue900 } = lightBlue;
const { 50: red50 } = red;

const brandMain = "#c03";
const brandLight = "#d6335c";
const brandDark = "#990026";
const brandLighter = "#fff0f3";

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brandMain,
      light: brandLight,
      dark: brandDark,
      lighter: brandLighter,
      50: brandLighter,
      contrastText: common.white,
    },
    secondary: {
      main: brandMain,
      light: brandLight,
      dark: brandDark,
      contrastText: common.white,
    },
    inactive: {
      main: grey400,
      contrastText: common.black,
    },
    neutral: {
      main: grey700,
      light: grey300,
      dark: grey900,
      contrastText: common.white,
    },
    border: {
      main: grey300,
      hover: grey500,
      strong: grey700,
    },
    surface: {
      main: common.white,
      muted: grey50,
      subtle: grey100,
      positive: green50,
      negative: red50,
    },
    success: {
      main: green500,
      light: green300,
      dark: green700,
      50: green50,
      contrastText: common.white,
    },
    error: {
      main: red.A400,
      light: red.A200,
      dark: red.A700,
      50: red50,
      contrastText: common.white,
    },
    warning: {
      main: orange500,
      light: orange300,
      dark: orange700,
      50: orange50,
    },
    info: {
      main: lightBlue700,
      light: lightBlue500,
      dark: lightBlue900,
      50: lightBlue50,
    },
    text: {
      primary: grey900,
      secondary: grey700,
    },
    divider: grey300,
    background: {
      default: grey50,
      paper: common.white,
      positive: green50,
      neutral: grey200,
      negative: red50,
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
