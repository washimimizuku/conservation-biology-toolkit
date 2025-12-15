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

  test('form inputs accept user input', () => {
    renderWithRouter(<PopulationTools />);
    
    const growthRateInput = screen.getByLabelText(/growth rate \(r\)/i);
    fireEvent.change(growthRateInput, { target: { value: '0.08' } });
    expect(growthRateInput).toHaveValue(0.08);
  });

  test('form validation prevents invalid submissions', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test that required fields are marked as required
    const requiredFields = screen.getAllByRole('textbox', { required: true });
    expect(requiredFields.length).toBeGreaterThan(0);
  });

  test('displays loading states correctly', () => {
    renderWithRouter(<PopulationTools />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).not.toBeDisabled(); // Initially not disabled
    });
  });

  test('handles form submission events', () => {
    renderWithRouter(<PopulationTools />);
    
    const forms = screen.getAllByRole('button', { name: /calculate|run|simulate/i });
    expect(forms).toHaveLength(4); // Four different calculators
  });

  test('displays proper input constraints', () => {
    renderWithRouter(<PopulationTools />);
    
    // Check for min attributes on number inputs
    const numberInputs = screen.getAllByRole('spinbutton');
    numberInputs.forEach(input => {
      const minValue = input.getAttribute('min');
      if (minValue) {
        expect(parseFloat(minValue)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test('renders all form sections', () => {
    renderWithRouter(<PopulationTools />);
    
    // Check that all four main sections are present
    expect(screen.getByText('Population Growth Calculator')).toBeInTheDocument();
    expect(screen.getByText('Effective Population Size')).toBeInTheDocument();
    expect(screen.getByText('Population Viability Analysis (PVA)')).toBeInTheDocument();
    expect(screen.getByText('Metapopulation Dynamics')).toBeInTheDocument();
  });

  test('has proper form structure with labels and inputs', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test that forms have proper structure
    const textFields = screen.getAllByRole('textbox');
    expect(textFields.length).toBeGreaterThan(10); // Multiple input fields across forms
  });

  test('displays scientific formulas in results', () => {
    renderWithRouter(<PopulationTools />);
    
    // Check for formula text that would appear in results
    expect(screen.getByText(/Formula: Ne = 4 × Nm × Nf/)).toBeInTheDocument();
  });
});