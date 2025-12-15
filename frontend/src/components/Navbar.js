import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Population Tools', path: '/population-tools' },
    { label: 'Sampling Tools', path: '/sampling-tools' },
    { label: 'Genetic Tools', path: '/genetic-tools' },
    { label: 'Species Assessment', path: '/species-assessment' },
    { label: 'Habitat & Landscape', path: '/habitat-landscape' },
    { label: 'Climate Impact', path: '/climate-impact' },
    { label: 'Conservation Planning', path: '/conservation-planning' },
    { label: 'Breed Registry', path: '/breed-registry' },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🌱 Conservation Biology Toolkit
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;