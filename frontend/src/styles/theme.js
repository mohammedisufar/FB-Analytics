import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1877F2', // Facebook blue
      dark: '#166FE5',
      light: '#E7F3FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#42B72A', // Success green
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FA383E', // Error red
    },
    warning: {
      main: '#F5B800', // Warning orange
    },
    info: {
      main: '#1877F2', // Primary blue
    },
    success: {
      main: '#42B72A', // Success green
    },
    text: {
      primary: '#1C1E21', // Dark gray
      secondary: '#606770', // Medium gray
    },
    background: {
      default: '#F2F3F5', // Light gray
      paper: '#FFFFFF', // White
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#166FE5',
          },
        },
        outlinedPrimary: {
          borderColor: '#1877F2',
          '&:hover': {
            backgroundColor: '#E7F3FF',
            borderColor: '#1877F2',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#1877F2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1877F2',
            },
          },
        },
      },
    },
  },
});

export default theme;
