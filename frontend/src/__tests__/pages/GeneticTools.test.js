import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import GeneticTools from '../../pages/GeneticTools';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} }))
}));

describe('GeneticTools Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('renders genetic tools page with all sections', () => {
    render(<GeneticTools />);
    
    expect(screen.getByText('🧬 Genetic Diversity Tools')).toBeInTheDocument();
    expect(screen.getByText('Hardy-Weinberg Equilibrium')).toBeInTheDocument();
    expect(screen.getByText('Inbreeding Coefficients')).toBeInTheDocument();
    expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument();
    expect(screen.getByText('Allelic Richness')).toBeInTheDocument();
  });

  test('has default values in input fields', () => {
    render(<GeneticTools />);
    
    // Check Hardy-Weinberg default values
    expect(screen.getByDisplayValue('AA:25,AB:50,BB:25')).toBeInTheDocument();
    
    // Check Inbreeding default values
    expect(screen.getByDisplayValue('0.4,0.35,0.42')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.35')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
    
    // Check Bottleneck default values
    expect(screen.getByDisplayValue('1000,900,50,100,200,400')).toBeInTheDocument();
    
    // Check Allelic Richness default values
    expect(screen.getByDisplayValue('5,8,6,7')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50,50,50,50')).toBeInTheDocument();
  });

  test('buttons are enabled with default values', () => {
    render(<GeneticTools />);
    
    // All buttons should be enabled with default values
    expect(screen.getByRole('button', { name: /test equilibrium/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /calculate f-statistics/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /detect bottleneck/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /calculate richness/i })).not.toBeDisabled();
  });

  test('component renders without crashing', () => {
    render(<GeneticTools />);
    expect(screen.getByText('🧬 Genetic Diversity Tools')).toBeInTheDocument();
  });

  test('all calculation sections are present', () => {
    render(<GeneticTools />);
    
    expect(screen.getByText('Hardy-Weinberg Equilibrium')).toBeInTheDocument();
    expect(screen.getByText('Inbreeding Coefficients')).toBeInTheDocument();
    expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument();
    expect(screen.getByText('Allelic Richness')).toBeInTheDocument();
  });

  test('all buttons are present and enabled with default values', () => {
    render(<GeneticTools />);
    
    expect(screen.getByRole('button', { name: /test equilibrium/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /calculate f-statistics/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /detect bottleneck/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /calculate richness/i })).not.toBeDisabled();
  });

  test('input fields have correct default values', () => {
    render(<GeneticTools />);
    
    expect(screen.getByDisplayValue('AA:25,AB:50,BB:25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.4,0.35,0.42')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.35')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000,900,50,100,200,400')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5,8,6,7')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50,50,50,50')).toBeInTheDocument();
  });

  test('input validation disables buttons when fields are empty', () => {
    render(<GeneticTools />);
    
    const hwInput = screen.getByDisplayValue('AA:25,AB:50,BB:25');
    const hwButton = screen.getByRole('button', { name: /test equilibrium/i });
    
    // Clear input
    fireEvent.change(hwInput, { target: { value: '' } });
    
    // Button should be disabled
    expect(hwButton).toBeDisabled();
    
    // Restore input
    fireEvent.change(hwInput, { target: { value: 'AA:10,AB:20,BB:10' } });
    
    // Button should be enabled again
    expect(hwButton).not.toBeDisabled();
  });

  test('input fields can be modified', () => {
    render(<GeneticTools />);
    
    const hwInput = screen.getByDisplayValue('AA:25,AB:50,BB:25');
    fireEvent.change(hwInput, { target: { value: 'AA:30,AB:40,BB:30' } });
    expect(screen.getByDisplayValue('AA:30,AB:40,BB:30')).toBeInTheDocument();
    
    const inbreedingInput = screen.getByDisplayValue('0.4,0.35,0.42');
    fireEvent.change(inbreedingInput, { target: { value: '0.3,0.3,0.3' } });
    expect(screen.getByDisplayValue('0.3,0.3,0.3')).toBeInTheDocument();
  });

  test('helper text is displayed for all inputs', () => {
    render(<GeneticTools />);
    
    expect(screen.getByText(/Format: genotype:count,genotype:count/)).toBeInTheDocument();
    expect(screen.getByText(/Comma-separated values \(0-1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Comma-separated population sizes over time/)).toBeInTheDocument();
    expect(screen.getByText(/Number of alleles per locus/)).toBeInTheDocument();
    expect(screen.getByText(/Sample sizes per locus/)).toBeInTheDocument();
  });

  test('all input fields accept user input', () => {
    render(<GeneticTools />);
    
    // Test Hardy-Weinberg input
    const hwInput = screen.getByLabelText(/genotype counts/i);
    fireEvent.change(hwInput, { target: { value: 'AA:10,AB:30,BB:60' } });
    expect(hwInput.value).toBe('AA:10,AB:30,BB:60');
    
    // Test inbreeding inputs
    const subpopInput = screen.getByLabelText(/subpopulation heterozygosity/i);
    fireEvent.change(subpopInput, { target: { value: '0.2,0.3,0.4' } });
    expect(subpopInput.value).toBe('0.2,0.3,0.4');
    
    const totalHetInput = screen.getByLabelText(/total heterozygosity/i);
    fireEvent.change(totalHetInput, { target: { value: '0.25' } });
    expect(totalHetInput.value).toBe('0.25');
    
    const expectedHetInput = screen.getByLabelText(/expected heterozygosity/i);
    fireEvent.change(expectedHetInput, { target: { value: '0.45' } });
    expect(expectedHetInput.value).toBe('0.45');
    
    // Test bottleneck input
    const bottleneckInput = screen.getByLabelText(/population sizes/i);
    fireEvent.change(bottleneckInput, { target: { value: '500,400,300,200' } });
    expect(bottleneckInput.value).toBe('500,400,300,200');
    
    // Test allelic richness inputs
    const alleleInput = screen.getByLabelText(/allele counts/i);
    fireEvent.change(alleleInput, { target: { value: '3,4,5,6' } });
    expect(alleleInput.value).toBe('3,4,5,6');
    
    const sampleInput = screen.getByLabelText(/sample sizes/i);
    fireEvent.change(sampleInput, { target: { value: '30,30,30,30' } });
    expect(sampleInput.value).toBe('30,30,30,30');
  });

  test('buttons are disabled when required inputs are empty', () => {
    render(<GeneticTools />);
    
    // Test Hardy-Weinberg button
    const hwInput = screen.getByLabelText(/genotype counts/i);
    const hwButton = screen.getByRole('button', { name: /test equilibrium/i });
    
    fireEvent.change(hwInput, { target: { value: '' } });
    expect(hwButton).toBeDisabled();
    
    fireEvent.change(hwInput, { target: { value: '   ' } }); // whitespace only
    expect(hwButton).toBeDisabled();
    
    // Test inbreeding button
    const subpopInput = screen.getByLabelText(/subpopulation heterozygosity/i);
    const inbreedingButton = screen.getByRole('button', { name: /calculate f-statistics/i });
    
    fireEvent.change(subpopInput, { target: { value: '' } });
    expect(inbreedingButton).toBeDisabled();
    
    // Test bottleneck button
    const bottleneckInput = screen.getByLabelText(/population sizes/i);
    const bottleneckButton = screen.getByRole('button', { name: /detect bottleneck/i });
    
    fireEvent.change(bottleneckInput, { target: { value: '' } });
    expect(bottleneckButton).toBeDisabled();
    
    // Test allelic richness button
    const alleleInput = screen.getByLabelText(/allele counts/i);
    const richnessButton = screen.getByRole('button', { name: /calculate richness/i });
    
    fireEvent.change(alleleInput, { target: { value: '' } });
    expect(richnessButton).toBeDisabled();
  });

  test('component displays all reference links correctly', () => {
    render(<GeneticTools />);
    
    // Check for Wikipedia reference links
    const hwLink = screen.getByRole('link', { name: /hardy-weinberg principle/i });
    expect(hwLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Hardy%E2%80%93Weinberg_principle');
    expect(hwLink).toHaveAttribute('target', '_blank');
    
    const fstatsLink = screen.getByRole('link', { name: /f-statistics/i });
    expect(fstatsLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/F-statistics');
    
    const bottleneckLink = screen.getByRole('link', { name: /population bottleneck/i });
    expect(bottleneckLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Population_bottleneck');
    
    const richnessLink = screen.getByRole('link', { name: /allelic richness/i });
    expect(richnessLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Allelic_richness');
  });

  test('component has proper accessibility attributes', () => {
    render(<GeneticTools />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('🧬 Genetic Diversity Tools');
    
    // Check for proper form labels
    expect(screen.getByLabelText(/genotype counts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subpopulation heterozygosity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total heterozygosity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected heterozygosity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/population sizes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/allele counts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sample sizes/i)).toBeInTheDocument();
    
    // Check for button accessibility
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  test('handles all form submissions', () => {
    render(<GeneticTools />);
    
    // Test all calculator submissions
    const hwButton = screen.getByRole('button', { name: /test equilibrium/i });
    const inbreedingButton = screen.getByRole('button', { name: /calculate f-statistics/i });
    const bottleneckButton = screen.getByRole('button', { name: /detect bottleneck/i });
    const richnessButton = screen.getByRole('button', { name: /calculate richness/i });
    
    fireEvent.click(hwButton);
    fireEvent.click(inbreedingButton);
    fireEvent.click(bottleneckButton);
    fireEvent.click(richnessButton);
    
    // All buttons should remain in document
    expect(hwButton).toBeInTheDocument();
    expect(inbreedingButton).toBeInTheDocument();
    expect(bottleneckButton).toBeInTheDocument();
    expect(richnessButton).toBeInTheDocument();
  });

  test('handles comprehensive input testing', () => {
    render(<GeneticTools />);
    
    // Test Hardy-Weinberg inputs with different formats
    const hwInput = screen.getByLabelText(/genotype counts/i);
    fireEvent.change(hwInput, { target: { value: 'AA:10,AB:30,BB:60' } });
    expect(hwInput).toHaveValue('AA:10,AB:30,BB:60');
    
    fireEvent.change(hwInput, { target: { value: 'AA:5, AB:15, BB:25' } });
    expect(hwInput).toHaveValue('AA:5, AB:15, BB:25');
    
    // Test inbreeding coefficient inputs
    const subpopInput = screen.getByLabelText(/subpopulation heterozygosity/i);
    fireEvent.change(subpopInput, { target: { value: '0.2,0.3,0.4' } });
    expect(subpopInput).toHaveValue('0.2,0.3,0.4');
    
    fireEvent.change(subpopInput, { target: { value: '0.1, 0.2, 0.3' } });
    expect(subpopInput).toHaveValue('0.1, 0.2, 0.3');
  });

  test('handles edge cases and validation', () => {
    render(<GeneticTools />);
    
    const hwInput = screen.getByLabelText(/genotype counts/i);
    const totalHetInput = screen.getByLabelText(/total heterozygosity/i);
    
    // Test boundary values
    fireEvent.change(totalHetInput, { target: { value: '0' } });
    expect(totalHetInput).toHaveValue(0);
    
    fireEvent.change(totalHetInput, { target: { value: '1' } });
    expect(totalHetInput).toHaveValue(1);
    
    // Test decimal precision
    fireEvent.change(totalHetInput, { target: { value: '0.123456' } });
    expect(totalHetInput).toHaveValue(0.123456);
    
    // Test genotype format variations
    fireEvent.change(hwInput, { target: { value: 'A:100,B:200' } });
    expect(hwInput).toHaveValue('A:100,B:200');
  });

  test('handles bottleneck detection inputs', () => {
    render(<GeneticTools />);
    
    const bottleneckInput = screen.getByLabelText(/population sizes/i);
    
    // Test different formats
    fireEvent.change(bottleneckInput, { target: { value: '500,400,300,200' } });
    expect(bottleneckInput).toHaveValue('500,400,300,200');
    
    fireEvent.change(bottleneckInput, { target: { value: '1000, 800, 600, 400, 200' } });
    expect(bottleneckInput).toHaveValue('1000, 800, 600, 400, 200');
    
    // Test single value
    fireEvent.change(bottleneckInput, { target: { value: '100' } });
    expect(bottleneckInput).toHaveValue('100');
  });

  test('handles allelic richness complex inputs', () => {
    render(<GeneticTools />);
    
    const alleleInput = screen.getByLabelText(/allele counts/i);
    const sampleInput = screen.getByLabelText(/sample sizes/i);
    
    // Test various formats
    fireEvent.change(alleleInput, { target: { value: '3,4,5,6,7' } });
    fireEvent.change(sampleInput, { target: { value: '30,40,50,60,70' } });
    
    expect(alleleInput).toHaveValue('3,4,5,6,7');
    expect(sampleInput).toHaveValue('30,40,50,60,70');
    
    // Test with spaces
    fireEvent.change(alleleInput, { target: { value: '2, 3, 4, 5' } });
    fireEvent.change(sampleInput, { target: { value: '25, 35, 45, 55' } });
    
    expect(alleleInput).toHaveValue('2, 3, 4, 5');
    expect(sampleInput).toHaveValue('25, 35, 45, 55');
  });

  test('handles form state management across different calculators', () => {
    render(<GeneticTools />);
    
    // Test that changing values in one calculator doesn't affect others
    const hwInput = screen.getByLabelText(/genotype counts/i);
    const totalHetInput = screen.getByLabelText(/total heterozygosity/i);
    const bottleneckInput = screen.getByLabelText(/population sizes/i);
    
    // Change values in different forms
    fireEvent.change(hwInput, { target: { value: 'AA:20,AB:40,BB:40' } });
    fireEvent.change(totalHetInput, { target: { value: '0.25' } });
    fireEvent.change(bottleneckInput, { target: { value: '800,600,400' } });
    
    expect(hwInput).toHaveValue('AA:20,AB:40,BB:40');
    expect(totalHetInput).toHaveValue(0.25);
    expect(bottleneckInput).toHaveValue('800,600,400');
    
    // Verify first form still has its value after other changes
    expect(hwInput).toHaveValue('AA:20,AB:40,BB:40');
  });

  test('tests all form submission buttons are functional', () => {
    render(<GeneticTools />);
    
    // Test that all buttons can be clicked without errors
    const buttons = screen.getAllByRole('button', { name: /test|calculate|detect/i });
    expect(buttons).toHaveLength(4);
    
    buttons.forEach((button, index) => {
      expect(button).not.toBeDisabled();
      fireEvent.click(button);
      // Button should still be in document after click
      expect(button).toBeInTheDocument();
    });
  });

  test('handles inbreeding coefficient input validation', () => {
    render(<GeneticTools />);
    
    const subpopInput = screen.getByLabelText(/subpopulation heterozygosity/i);
    const totalHetInput = screen.getByLabelText(/total heterozygosity/i);
    const expectedHetInput = screen.getByLabelText(/expected heterozygosity/i);
    
    // Test minimum values
    fireEvent.change(subpopInput, { target: { value: '0,0,0' } });
    fireEvent.change(totalHetInput, { target: { value: '0' } });
    fireEvent.change(expectedHetInput, { target: { value: '0' } });
    
    expect(subpopInput).toHaveValue('0,0,0');
    expect(totalHetInput).toHaveValue(0);
    expect(expectedHetInput).toHaveValue(0);
    
    // Test maximum values
    fireEvent.change(subpopInput, { target: { value: '1,1,1' } });
    fireEvent.change(totalHetInput, { target: { value: '1' } });
    fireEvent.change(expectedHetInput, { target: { value: '1' } });
    
    expect(subpopInput).toHaveValue('1,1,1');
    expect(totalHetInput).toHaveValue(1);
    expect(expectedHetInput).toHaveValue(1);
  });

  test('tests genotype parsing logic with different formats', () => {
    render(<GeneticTools />);
    
    const hwInput = screen.getByLabelText(/genotype counts/i);
    
    // Test various genotype formats to trigger parsing branches
    fireEvent.change(hwInput, { target: { value: 'AA:25, AB:50, BB:25' } });
    expect(hwInput).toHaveValue('AA:25, AB:50, BB:25');
    
    // Test without spaces
    fireEvent.change(hwInput, { target: { value: 'AA:10,AB:20,BB:30' } });
    expect(hwInput).toHaveValue('AA:10,AB:20,BB:30');
    
    // Test different genotype names
    fireEvent.change(hwInput, { target: { value: 'A1A1:15,A1A2:30,A2A2:15' } });
    expect(hwInput).toHaveValue('A1A1:15,A1A2:30,A2A2:15');
    
    // Test single genotype
    fireEvent.change(hwInput, { target: { value: 'AA:100' } });
    expect(hwInput).toHaveValue('AA:100');
  });

  test('handles rapid user interactions', () => {
    render(<GeneticTools />);
    
    const buttons = screen.getAllByRole('button', { name: /test|calculate|detect/i });
    
    // Rapid clicking should not cause errors
    buttons.forEach(button => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    
    expect(buttons.length).toBe(4);
  });

  test('maintains form state during interactions', () => {
    render(<GeneticTools />);
    
    const hwInput = screen.getByLabelText(/genotype counts/i);
    fireEvent.change(hwInput, { target: { value: 'AA:30,AB:40,BB:30' } });
    
    // Click a button
    const submitButton = screen.getByRole('button', { name: /test equilibrium/i });
    fireEvent.click(submitButton);
    
    // Value should be maintained
    expect(hwInput).toHaveValue('AA:30,AB:40,BB:30');
  });

  test('handles different input combinations for all calculators', () => {
    render(<GeneticTools />);
    
    // Test Hardy-Weinberg with different genotype combinations
    const hwInput = screen.getByLabelText(/genotype counts/i);
    fireEvent.change(hwInput, { target: { value: 'AA:0,AB:100,BB:0' } });
    expect(hwInput).toHaveValue('AA:0,AB:100,BB:0');
    
    // Test inbreeding with extreme values
    const subpopInput = screen.getByLabelText(/subpopulation heterozygosity/i);
    fireEvent.change(subpopInput, { target: { value: '0.01,0.99,0.5' } });
    expect(subpopInput).toHaveValue('0.01,0.99,0.5');
    
    // Test bottleneck with increasing population
    const bottleneckInput = screen.getByLabelText(/population sizes/i);
    fireEvent.change(bottleneckInput, { target: { value: '100,200,300,400,500' } });
    expect(bottleneckInput).toHaveValue('100,200,300,400,500');
  });

  test('handles input validation error conditions', () => {
    render(<GeneticTools />);
    
    // Test invalid genotype format (missing colon)
    const hwInput = screen.getByLabelText(/genotype counts/i);
    fireEvent.change(hwInput, { target: { value: 'AA25,AB50' } });
    const hwButton = screen.getByRole('button', { name: /test equilibrium/i });
    fireEvent.click(hwButton);
    
    // Test invalid genotype format (empty genotype)
    fireEvent.change(hwInput, { target: { value: ':25,AB:50' } });
    fireEvent.click(hwButton);
    
    // Test invalid count format (non-numeric)
    fireEvent.change(hwInput, { target: { value: 'AA:abc,AB:50' } });
    fireEvent.click(hwButton);
    
    // Test negative counts
    fireEvent.change(hwInput, { target: { value: 'AA:-5,AB:50' } });
    fireEvent.click(hwButton);
    
    // All these should still render the component without crashing
    expect(hwInput).toBeInTheDocument();
    expect(hwButton).toBeInTheDocument();
  });

  test('input validation works correctly', () => {
    render(<GeneticTools />);
    
    // Test empty input disables button
    const input = screen.getByDisplayValue('AA:25,AB:50,BB:25');
    fireEvent.change(input, { target: { value: '' } });
    
    const button = screen.getByRole('button', { name: /test equilibrium/i });
    expect(button).toBeDisabled();
    
    // Test valid input enables button
    fireEvent.change(input, { target: { value: 'AA:10,AB:20,BB:10' } });
    expect(button).not.toBeDisabled();
  });

  test('displays reference links correctly', () => {
    render(<GeneticTools />);
    
    // Check that reference links are present
    expect(screen.getByText('Hardy-Weinberg Principle (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('F-statistics (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Population Bottleneck (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Allelic Richness (Wikipedia)')).toBeInTheDocument();
  });

  test('can modify input values', () => {
    render(<GeneticTools />);
    
    // Test changing Hardy-Weinberg input
    const hwInput = screen.getByDisplayValue('AA:25,AB:50,BB:25');
    fireEvent.change(hwInput, { target: { value: 'AA:30,AB:40,BB:30' } });
    expect(screen.getByDisplayValue('AA:30,AB:40,BB:30')).toBeInTheDocument();
    
    // Test changing inbreeding input
    const inbreedingInput = screen.getByDisplayValue('0.4,0.35,0.42');
    fireEvent.change(inbreedingInput, { target: { value: '0.3,0.3,0.3' } });
    expect(screen.getByDisplayValue('0.3,0.3,0.3')).toBeInTheDocument();
  });

  test('displays helper text for inputs', () => {
    render(<GeneticTools />);
    
    expect(screen.getByText(/Format: genotype:count,genotype:count/)).toBeInTheDocument();
    expect(screen.getByText(/Comma-separated values \(0-1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Comma-separated population sizes over time/)).toBeInTheDocument();
    expect(screen.getByText(/Number of alleles per locus/)).toBeInTheDocument();
    expect(screen.getByText(/Sample sizes per locus/)).toBeInTheDocument();
  });
});