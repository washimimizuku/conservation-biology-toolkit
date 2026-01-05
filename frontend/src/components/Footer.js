import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';

const Footer = () => {
  return (
    <Box mt={4} mb={2} textAlign="center">
      <Typography variant="caption" color="text.secondary">
        Built by conservation biologists, for conservation biologists. 
        Licensed under MIT • Version 2.0.0 • 
        <MuiLink 
          href="https://github.com/washimimizuku/conservation-biology-toolkit" 
          target="_blank" 
          rel="noopener noreferrer"
          color="inherit"
        >
          View Source
        </MuiLink>
      </Typography>
      <Box mt={1}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Created by{' '}
          <MuiLink 
            href="https://github.com/washimimizuku" 
            target="_blank" 
            rel="noopener noreferrer"
            color="inherit"
            sx={{ fontStyle: 'italic' }}
          >
            Nuno Barreto
          </MuiLink>
          {' '}• Conservation Biology Toolkit
        </Typography>
      </Box>
      <Box mt={1}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Nuno Barreto. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;