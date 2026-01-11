import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { trackNavigation } from '../analytics';

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
  ];

  // Track navigation clicks from navbar
  const handleNavClick = (fromPath, toPath, label) => {
    const fromPage = fromPath === '/' ? 'Home' : fromPath.replace('/', '').replace('-', ' ');
    const toPage = toPath === '/' ? 'Home' : label;
    trackNavigation(fromPage, toPage, 'navbar_link');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link}
          to="/"
          onClick={() => handleNavClick(location.pathname, '/', 'Home')}
          sx={{ 
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          🌱 Conservation Biology Toolkit
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              onClick={() => handleNavClick(location.pathname, item.path, item.label)}
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