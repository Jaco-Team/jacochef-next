import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  //variable: '--inter-font',
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#c03',
    },
    secondary: {
      main: '#c03',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    // fontFamily: 'var(--inter-font), ' + roboto.style.fontFamily,
  },
});

export const font = roboto;

export default theme;