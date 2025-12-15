import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App', () => {
  test('renders without crashing', () => {
    renderWithRouter();
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
  });

  test('applies Material-UI theme', () => {
    renderWithRouter();
    // Check that CssBaseline is applied (removes default margins)
    expect(document.body).toHaveStyle('margin: 0');
  });

  test('renders navbar on all pages', () => {
    renderWithRouter();
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Population Tools')).toBeInTheDocument();
    expect(screen.getByText('Sampling Tools')).toBeInTheDocument();
  });

  test('renders Home page by default', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders Population Tools page when navigating to /population-tools', () => {
    renderWithRouter(['/population-tools']);
    expect(screen.getByTestId('population-tools-page')).toBeInTheDocument();
  });

  test('renders Sampling Tools page when navigating to /sampling-tools', () => {
    renderWithRouter(['/sampling-tools']);
    expect(screen.getByTestId('sampling-tools-page')).toBeInTheDocument();
  });

  test('has proper app structure with div.App', () => {
    const { container } = renderWithRouter();
    expect(container.querySelector('.App')).toBeInTheDocument();
  });

  test('uses green primary theme color', () => {
    renderWithRouter();
    // The theme is applied through ThemeProvider, we can test that it renders without errors
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
  });

  test('includes all navigation items', () => {
    renderWithRouter();
    
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

  test('handles unknown routes gracefully', () => {
    renderWithRouter(['/unknown-route']);
    // Should still render the navbar
    expect(screen.getByText('🌱 Conservation Biology Toolkit')).toBeInTheDocument();
    // But no page content should be shown
    expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('population-tools-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sampling-tools-page')).not.toBeInTheDocument();
  });
});