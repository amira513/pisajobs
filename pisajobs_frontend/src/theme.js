import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5C5B57' }, // grigio neutro caldo
    secondary: { main: '#C4A484' }, // sabbia
    background: { default: '#FAF8F6', paper: '#FFFFFF' },
    text: { primary: '#2E2C2B', secondary: '#5C5B57' },
  },
  typography: { fontFamily: 'Inter, Roboto, sans-serif' },
  shape: { borderRadius: 12 },
});

export default theme;
