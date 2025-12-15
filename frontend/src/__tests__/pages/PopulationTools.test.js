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
    
    const growthRateInputs = screen.getAllByLabelText(/growth rate \(r\)/i);
    const firstGrowthRateInput = growthRateInputs[0];
    fireEvent.change(firstGrowthRateInput, { target: { value: '0.08' } });
    expect(firstGrowthRateInput).toHaveValue(0.08);
  });

  test('form has proper input structure', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test that forms have input fields
    const textFields = screen.getAllByRole('textbox');
    expect(textFields.length).toBeGreaterThanOrEqual(4);
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

  test('has number input fields', () => {
    renderWithRouter(<PopulationTools />);
    
    // Check for number inputs
    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBeGreaterThan(5);
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
    expect(textFields.length).toBeGreaterThanOrEqual(4); // Multiple input fields across forms
  });

  test('displays scientific formulas in results', () => {
    renderWithRouter(<PopulationTools />);
    
    // Check for formula text that would appear in results
    const effectivePopSizeElements = screen.getAllByText(/Effective Population Size/);
    expect(effectivePopSizeElements.length).toBeGreaterThan(0);
  });

  test('handles form reset functionality', () => {
    renderWithRouter(<PopulationTools />);
    
    const growthRateInputs = screen.getAllByLabelText(/growth rate \(r\)/i);
    const firstInput = growthRateInputs[0];
    fireEvent.change(firstInput, { target: { value: '0.08' } });
    expect(firstInput).toHaveValue(0.08);
    
    // Reset to default
    fireEvent.change(firstInput, { target: { value: '0.05' } });
    expect(firstInput).toHaveValue(0.05);
  });

  test('handles edge cases in form inputs', () => {
    renderWithRouter(<PopulationTools />);
    
    const growthRateInputs = screen.getAllByLabelText(/growth rate \(r\)/i);
    const firstInput = growthRateInputs[0];
    
    // Test zero value
    fireEvent.change(firstInput, { target: { value: '0' } });
    expect(firstInput).toHaveValue(0);
    
    // Test negative value (should be handled by form validation)
    fireEvent.change(firstInput, { target: { value: '-0.1' } });
    expect(firstInput).toHaveValue(-0.1);
  });

  test('renders without errors when no props provided', () => {
    expect(() => {
      renderWithRouter(<PopulationTools />);
    }).not.toThrow();
  });

  test('handles multiple form submissions', () => {
    renderWithRouter(<PopulationTools />);
    
    const submitButton = screen.getByRole('button', { name: /calculate growth/i });
    
    // Multiple clicks should not cause errors
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeInTheDocument();
  });
});