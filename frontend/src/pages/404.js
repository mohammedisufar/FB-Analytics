import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button } from '@mui/material';

export default function Custom404() {
  const router = useRouter();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: 3
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        size="large"
        onClick={() => router.push('/')}
      >
        Go to Homepage
      </Button>
    </Box>
  );
} 