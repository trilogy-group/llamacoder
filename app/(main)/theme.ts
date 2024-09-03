import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4285F4', // Blue color for primary elements
    },
    secondary: {
      main: '#FF69B4', // Pink color for secondary elements
    },
    background: {
      default: '#FFFFFF', // White background color
      paper: '#F8F9FA', // Light gray for paper elements
    },
    text: {
      primary: '#202124',
      secondary: '#5F6368',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
        },
        containedPrimary: {
          backgroundColor: '#4285F4',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#3367D6',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#202124',
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            backgroundColor: '#F8F9FA',
          },
        },
      },
    },
  },
});

export default theme;