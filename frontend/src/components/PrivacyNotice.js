import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const PrivacyNotice = () => {
  return (
    <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="body2" color="text.secondary">
        This site uses Google Analytics to help us understand how our conservation tools are being used. 
        No personal information is collected. By using this site, you consent to analytics tracking. 
        <Link href="/privacy" sx={{ ml: 1 }}>
          Learn more about our privacy policy
        </Link>
      </Typography>
    </Box>
  );
};

export default PrivacyNotice;