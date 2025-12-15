import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PopulationTools from '../../pages/PopulationTools';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PopulationTools', () => {
  test('renders page title and description', () => {
    renderWithRouter(<PopulationTools />);
    
    expect(screen.getByText('🧬 Population Analysis Tools')).toBeInTheDocument();
    expect(screen.getByText(/Calculate population dynamics, effective population size/)).toBeInTheDocument();
  });

  test('renders all four calculator cards', () => {
    renderWithRouter(<PopulationTools />);
    
    expect(screen.getByText('Population Growth Calculator')).toBeInTheDocument();
    expect(screen.getByText('Effective Population Size')).toBeInTheDocument();
    expect(screen.getByText('Population Viability Analysis (PVA)')).toBeInTheDocument();
    expect(screen.getByText('Metapopulation Dynamics')).toBeInTheDocument();
  });

  test('displays scientific references for all tools', () => {
    renderWithRouter(<PopulationTools />);
    
    // Check for Wikipedia links
    expect(screen.getByText('Population Growth (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Effective Population Size (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Population Viability Analysis (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Metapopulation (Wikipedia)')).toBeInTheDocument();
  });

  test('has all submit buttons', () => {
    renderWithRouter(<PopulationTools />);
    
    expect(screen.getByRole('button', { name: /calculate growth/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate ne/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run pva/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simulate metapopulation/i })).toBeInTheDocument();
  });

  test('can click submit buttons', () => {
    renderWithRouter(<PopulationTools />);
    
    const growthButton = screen.getByRole('button', { name: /calculate growth/i });
    const neButton = screen.getByRole('button', { name: /calculate ne/i });
    
    expect(growthButton).not.toBeDisabled();
    expect(neButton).not.toBeDisabled();
    
    fireEvent.click(growthButton);
    fireEvent.click(neButton);
  });

  test('has proper helper text for forms', () => {
    renderWithRouter(<PopulationTools />);
    
    expect(screen.getByText(/Annual growth rate/)).toBeInTheDocument();
    expect(screen.getByText(/Leave empty for exponential growth/)).toBeInTheDocument();
    expect(screen.getByText(/More simulations = more accurate results/)).toBeInTheDocument();
  });

  test('has default values in forms', () => {
    renderWithRouter(<PopulationTools />);
    
    // Check that some default values exist
    expect(screen.getByDisplayValue('0.05')).toBeInTheDocument(); // Growth rate
    expect(screen.getByDisplayValue('25')).toBeInTheDocument(); // Breeding males
    expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // Breeding females
  });
});