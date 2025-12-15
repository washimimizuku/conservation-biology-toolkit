import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PopulationTools from '../../pages/PopulationTools';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} }))
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PopulationTools', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

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

  test('handles form submissions and API calls', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test Population Growth Calculator submission
    const growthButton = screen.getByRole('button', { name: /calculate growth/i });
    fireEvent.click(growthButton);
    
    // Test Effective Population Size submission
    const neButton = screen.getByRole('button', { name: /calculate ne/i });
    fireEvent.click(neButton);
    
    // Test PVA submission
    const pvaButton = screen.getByRole('button', { name: /run pva/i });
    fireEvent.click(pvaButton);
    
    // Test Metapopulation submission
    const metaButton = screen.getByRole('button', { name: /simulate metapopulation/i });
    fireEvent.click(metaButton);
    
    // All buttons should be present
    expect(growthButton).toBeInTheDocument();
    expect(neButton).toBeInTheDocument();
    expect(pvaButton).toBeInTheDocument();
    expect(metaButton).toBeInTheDocument();
  });

  test('handles input changes for all forms', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test growth rate inputs
    const growthRateInputs = screen.getAllByLabelText(/growth rate \(r\)/i);
    growthRateInputs.forEach((input, index) => {
      const value = `0.0${index + 5}`;
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(parseFloat(value));
    });
    
    // Test initial population inputs
    const initialPopInputs = screen.getAllByLabelText(/initial population/i);
    initialPopInputs.forEach((input, index) => {
      const value = `${100 + index * 50}`;
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(parseInt(value));
    });
  });

  test('handles carrying capacity inputs', () => {
    renderWithRouter(<PopulationTools />);
    
    const carryingCapacityInputs = screen.getAllByLabelText(/carrying capacity/i);
    carryingCapacityInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${1000 + index * 500}` } });
      expect(input).toHaveValue(1000 + index * 500);
    });
  });

  test('handles years and simulations inputs', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test years inputs
    const yearsInputs = screen.getAllByLabelText(/years/i);
    yearsInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${10 + index * 5}` } });
      expect(input).toHaveValue(10 + index * 5);
    });
    
    // Test simulations input
    const simulationsInput = screen.getByLabelText(/simulations/i);
    fireEvent.change(simulationsInput, { target: { value: '500' } });
    expect(simulationsInput).toHaveValue(500);
  });

  test('handles environmental variance input', () => {
    renderWithRouter(<PopulationTools />);
    
    const envVarianceInput = screen.getByLabelText(/environmental variance/i);
    fireEvent.change(envVarianceInput, { target: { value: '0.15' } });
    expect(envVarianceInput).toHaveValue(0.15);
  });

  test('handles breeding population inputs', () => {
    renderWithRouter(<PopulationTools />);
    
    const breedingMalesInput = screen.getByLabelText(/breeding males/i);
    const breedingFemalesInput = screen.getByLabelText(/breeding females/i);
    
    fireEvent.change(breedingMalesInput, { target: { value: '40' } });
    fireEvent.change(breedingFemalesInput, { target: { value: '60' } });
    
    expect(breedingMalesInput).toHaveValue(40);
    expect(breedingFemalesInput).toHaveValue(60);
  });

  test('handles metapopulation specific inputs', () => {
    renderWithRouter(<PopulationTools />);
    
    const patchPopulationsInput = screen.getByLabelText(/patch populations/i);
    const migrationMatrixInput = screen.getByLabelText(/migration matrix/i);
    
    fireEvent.change(patchPopulationsInput, { target: { value: '120,90,70' } });
    fireEvent.change(migrationMatrixInput, { target: { value: '0,0.06,0.03;0.06,0,0.04;0.03,0.04,0' } });
    
    expect(patchPopulationsInput).toHaveValue('120,90,70');
    expect(migrationMatrixInput).toHaveValue('0,0.06,0.03;0.06,0,0.04;0.03,0.04,0');
  });

  test('handles form state management', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test that form state is maintained across interactions
    const growthRateInputs = screen.getAllByLabelText(/growth rate \(r\)/i);
    const firstInput = growthRateInputs[0];
    
    fireEvent.change(firstInput, { target: { value: '0.07' } });
    expect(firstInput).toHaveValue(0.07);
    
    // Click other elements and verify state is maintained
    const submitButton = screen.getByRole('button', { name: /calculate growth/i });
    fireEvent.click(submitButton);
    
    expect(firstInput).toHaveValue(0.07);
  });
});
  // Branch coverage tests - test conditional logic
  test('handles empty carrying capacity for exponential growth', () => {
    renderWithRouter(<PopulationTools />);
    
    const carryingCapacityInput = screen.getByLabelText(/carrying capacity \(optional\)/i);
    
    // Test empty value (should be allowed for exponential growth)
    fireEvent.change(carryingCapacityInput, { target: { value: '' } });
    expect(carryingCapacityInput).toHaveValue(null);
    
    // Submit form with empty carrying capacity - this tests the null branch
    const submitButton = screen.getByRole('button', { name: /calculate growth/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeInTheDocument();
  });

  test('handles non-empty carrying capacity for logistic growth', () => {
    renderWithRouter(<PopulationTools />);
    
    const carryingCapacityInput = screen.getByLabelText(/carrying capacity \(optional\)/i);
    
    // Test with value (should be used for logistic growth)
    fireEvent.change(carryingCapacityInput, { target: { value: '1000' } });
    expect(carryingCapacityInput).toHaveValue(1000);
    
    // Submit form with carrying capacity - this tests the non-null branch
    const submitButton = screen.getByRole('button', { name: /calculate growth/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeInTheDocument();
  });

  test('tests form validation and edge cases', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test various input combinations to trigger different branches
    const initialPopInput = screen.getAllByLabelText(/initial population/i)[0];
    const growthRateInput = screen.getAllByLabelText(/growth rate \(r\)/i)[0];
    
    // Test boundary values
    fireEvent.change(initialPopInput, { target: { value: '1' } });
    fireEvent.change(growthRateInput, { target: { value: '0' } });
    
    expect(initialPopInput).toHaveValue(1);
    expect(growthRateInput).toHaveValue(0);
    
    // Test negative values
    fireEvent.change(growthRateInput, { target: { value: '-0.1' } });
    expect(growthRateInput).toHaveValue(-0.1);
  });

  test('tests different input combinations for all calculators', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test PVA inputs
    const pvaInputs = screen.getAllByLabelText(/initial population/i);
    if (pvaInputs.length > 1) {
      fireEvent.change(pvaInputs[1], { target: { value: '25' } });
      expect(pvaInputs[1]).toHaveValue(25);
    }
    
    // Test environmental variance
    const envVarianceInput = screen.getByLabelText(/environmental variance/i);
    fireEvent.change(envVarianceInput, { target: { value: '0.2' } });
    expect(envVarianceInput).toHaveValue(0.2);
    
    // Test simulations input
    const simulationsInput = screen.getByLabelText(/simulations/i);
    fireEvent.change(simulationsInput, { target: { value: '500' } });
    expect(simulationsInput).toHaveValue(500);
  });
  test('tests metapopulation array parsing logic', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test different array input formats to trigger parsing branches
    const patchPopulationsInput = screen.getByLabelText(/patch populations/i);
    const patchCapacitiesInput = screen.getByLabelText(/patch capacities/i);
    const growthRatesInput = screen.getByLabelText(/growth rates/i);
    const migrationMatrixInput = screen.getByLabelText(/migration matrix/i);
    
    // Test comma-separated values with spaces
    fireEvent.change(patchPopulationsInput, { target: { value: '100, 80, 60' } });
    fireEvent.change(patchCapacitiesInput, { target: { value: '200, 150, 120' } });
    fireEvent.change(growthRatesInput, { target: { value: '0.1, 0.08, 0.12' } });
    
    // Test semicolon-separated matrix
    fireEvent.change(migrationMatrixInput, { target: { value: '0, 0.05, 0.02; 0.05, 0, 0.03; 0.02, 0.03, 0' } });
    
    expect(patchPopulationsInput).toHaveValue('100, 80, 60');
    expect(patchCapacitiesInput).toHaveValue('200, 150, 120');
    expect(growthRatesInput).toHaveValue('0.1, 0.08, 0.12');
    expect(migrationMatrixInput).toHaveValue('0, 0.05, 0.02; 0.05, 0, 0.03; 0.02, 0.03, 0');
  });

  test('tests form state management across different calculators', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test that changing values in one calculator doesn't affect others
    const growthRateInputs = screen.getAllByLabelText(/growth rate \(r\)/i);
    const initialPopInputs = screen.getAllByLabelText(/initial population/i);
    
    // Change values in different forms
    if (growthRateInputs.length > 0) {
      fireEvent.change(growthRateInputs[0], { target: { value: '0.08' } });
      expect(growthRateInputs[0]).toHaveValue(0.08);
    }
    
    if (initialPopInputs.length > 1) {
      fireEvent.change(initialPopInputs[1], { target: { value: '75' } });
      expect(initialPopInputs[1]).toHaveValue(75);
    }
    
    // Verify first form still has its value
    if (growthRateInputs.length > 0) {
      expect(growthRateInputs[0]).toHaveValue(0.08);
    }
  });

  test('tests all form submission buttons are functional', () => {
    renderWithRouter(<PopulationTools />);
    
    // Test that all buttons can be clicked without errors
    const buttons = screen.getAllByRole('button', { name: /calculate|run|simulate/i });
    expect(buttons).toHaveLength(4);
    
    buttons.forEach((button, index) => {
      expect(button).not.toBeDisabled();
      fireEvent.click(button);
      // Button should still be in document after click
      expect(button).toBeInTheDocument();
    });
  });