import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from '../../components/Navbar';

const theme = createTheme();

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <Navbar />
      </MemoryRouter>
    </ThemeProvider>
  );
};

const renderWithBrowserRouter = () => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('Navbar', () => {
  test('renders the app title', () => {
    renderWithRouter();
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
  });

  test('renders all navigation items', () => {
    renderWithRouter();
    
    const expectedNavItems = [
      'Home',
      'Population Tools',
      'Sampling Tools', 
      'Genetic Tools',
      'Species Assessment',
      'Breed Registry'
    ];

    expectedNavItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('renders navigation items as links', () => {
    renderWithRouter();
    
    const navLinks = [
      { text: 'Home', href: '/' },
      { text: 'Population Tools', href: '/population-tools' },
      { text: 'Sampling Tools', href: '/sampling-tools' },
      { text: 'Genetic Tools', href: '/genetic-tools' },
      { text: 'Species Assessment', href: '/species-assessment' },
      { text: 'Breed Registry', href: '/breed-registry' }
    ];

    navLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  test('highlights active navigation item on home page', () => {
    renderWithRouter(['/']);
    
    const homeButton = screen.getByRole('link', { name: 'Home' });
    expect(homeButton).toHaveStyle('background-color: rgba(255,255,255,0.1)');
  });

  test('highlights active navigation item on population tools page', () => {
    renderWithRouter(['/population-tools']);
    
    const populationButton = screen.getByRole('link', { name: 'Population Tools' });
    expect(populationButton).toHaveStyle('background-color: rgba(255,255,255,0.1)');
  });

  test('highlights active navigation item on sampling tools page', () => {
    renderWithRouter(['/sampling-tools']);
    
    const samplingButton = screen.getByRole('link', { name: 'Sampling Tools' });
    expect(samplingButton).toHaveStyle('background-color: rgba(255,255,255,0.1)');
  });

  test('does not highlight inactive navigation items', () => {
    renderWithRouter(['/']);
    
    const populationButton = screen.getByRole('link', { name: 'Population Tools' });
    const samplingButton = screen.getByRole('link', { name: 'Sampling Tools' });
    
    expect(populationButton).toHaveStyle('background-color: transparent');
    expect(samplingButton).toHaveStyle('background-color: transparent');
  });

  test('renders as an AppBar', () => {
    renderWithRouter();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('has proper toolbar structure', () => {
    renderWithRouter();
    
    // Check that title and navigation are in the same toolbar
    const toolbar = screen.getByRole('banner').querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();
    
    // Title should be present
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
  });

  test('uses flexbox layout for navigation items', () => {
    renderWithRouter();
    
    // The Box component should contain all navigation buttons
    const navButtons = screen.getAllByRole('link');
    expect(navButtons).toHaveLength(6);
  });

  test('handles unknown routes without highlighting', () => {
    renderWithRouter(['/unknown-route']);
    
    // No button should be highlighted
    const allButtons = screen.getAllByRole('link');
    allButtons.forEach(button => {
      expect(button).toHaveStyle('background-color: transparent');
    });
  });

  test('renders with BrowserRouter', () => {
    renderWithBrowserRouter();
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(6);
  });

  test('navigation items have correct order', () => {
    renderWithRouter();
    
    const navLinks = screen.getAllByRole('link');
    const expectedOrder = ['Home', 'Population Tools', 'Sampling Tools', 'Genetic Tools', 'Species Assessment', 'Breed Registry'];
    
    navLinks.forEach((link, index) => {
      expect(link).toHaveTextContent(expectedOrder[index]);
    });
  });
});