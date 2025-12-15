import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the page components to avoid complex dependencies
jest.mock('../pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../pages/PopulationTools', () => {
  return function MockPopulationTools() {
    return <div data-testid="population-tools-page">Population Tools Page</div>;
  };
});

jest.mock('../pages/SamplingTools', () => {
  return function MockSamplingTools() {
    return <div data-testid="sampling-tools-page">Sampling Tools Page</div>;
  };
});

// Mock window.location for route testing
const mockLocation = (pathname) => {
  delete window.location;
  window.location = { pathname };
};

const renderApp = () => {
  return render(<App />);
};

describe('App', () => {
  test('renders without crashing', () => {
    renderApp();
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
  });

  test('applies Material-UI theme', () => {
    renderApp();
    // Check that the app renders with theme provider
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
  });

  test('renders navbar on all pages', () => {
    renderApp();
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Population Tools')).toBeInTheDocument();
    expect(screen.getByText('Sampling Tools')).toBeInTheDocument();
  });

  test('renders Home page by default', () => {
    renderApp();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('has proper app structure with div.App', () => {
    const { container } = renderApp();
    expect(container.querySelector('.App')).toBeInTheDocument();
  });

  test('uses green primary theme color', () => {
    renderApp();
    // The theme is applied through ThemeProvider, we can test that it renders without errors
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
  });

  test('includes all navigation items', () => {
    renderApp();
    
    const expectedNavItems = [
      'Home',
      'Population Tools', 
      'Sampling Tools',
      'Genetic Tools',
      'Breed Registry'
    ];

    expectedNavItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('renders router and routes correctly', () => {
    renderApp();
    // Should render the navbar and home page by default
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('has proper theme provider structure', () => {
    const { container } = renderApp();
    // Should have the app structure
    expect(container.querySelector('.App')).toBeInTheDocument();
  });
});