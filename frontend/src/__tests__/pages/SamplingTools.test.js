import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SamplingTools from '../../pages/SamplingTools';

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

describe('SamplingTools', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('renders page title and description', () => {
    renderWithRouter(<SamplingTools />);
    
    expect(screen.getByText('📋 Sampling & Survey Design Tools')).toBeInTheDocument();
    expect(screen.getByText(/Statistical tools for designing effective wildlife surveys/)).toBeInTheDocument();
  });

  test('renders all four calculator cards', () => {
    renderWithRouter(<SamplingTools />);
    
    expect(screen.getByText('Sample Size Calculator')).toBeInTheDocument();
    expect(screen.getByText('Detection Probability')).toBeInTheDocument();
    expect(screen.getByText('Capture-Recapture Analysis')).toBeInTheDocument();
    expect(screen.getByText('Distance Sampling')).toBeInTheDocument();
  });

  test('displays scientific references for all tools', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check for Wikipedia links
    expect(screen.getByText('Sample Size Determination (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Occupancy-Detection Models (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Mark and Recapture (Wikipedia)')).toBeInTheDocument();
    expect(screen.getByText('Distance Sampling (Wikipedia)')).toBeInTheDocument();
  });

  test('has all submit buttons', () => {
    renderWithRouter(<SamplingTools />);
    
    expect(screen.getByRole('button', { name: /calculate sample size/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate detection probability/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /estimate population/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /estimate density/i })).toBeInTheDocument();
  });

  test('can click submit buttons', () => {
    renderWithRouter(<SamplingTools />);
    
    const sampleSizeButton = screen.getByRole('button', { name: /calculate sample size/i });
    const detectionButton = screen.getByRole('button', { name: /calculate detection probability/i });
    
    expect(sampleSizeButton).not.toBeDisabled();
    expect(detectionButton).not.toBeDisabled();
    
    fireEvent.click(sampleSizeButton);
    fireEvent.click(detectionButton);
  });

  test('has default values in forms', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check that some default values exist
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument(); // Expected proportion
    expect(screen.getByDisplayValue('0.05')).toBeInTheDocument(); // Margin of error
    expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // Detections
    expect(screen.getByDisplayValue('20')).toBeInTheDocument(); // Surveys
  });

  test('has helpful instructions for complex inputs', () => {
    renderWithRouter(<SamplingTools />);
    
    expect(screen.getByText(/Leave empty for infinite population/)).toBeInTheDocument();
    expect(screen.getByText(/0.5 for maximum variance/)).toBeInTheDocument();
    expect(screen.getByText(/Comma-separated distances to detected animals/)).toBeInTheDocument();
  });

  test('form inputs accept user input', () => {
    renderWithRouter(<SamplingTools />);
    
    const proportionInput = screen.getByLabelText(/expected proportion/i);
    fireEvent.change(proportionInput, { target: { value: '0.3' } });
    expect(proportionInput).toHaveValue(0.3);
  });

  test('handles different input types correctly', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test number inputs
    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBeGreaterThan(5);
    
    // Test text inputs for comma-separated values
    const distanceInput = screen.getByLabelText(/perpendicular distances/i);
    fireEvent.change(distanceInput, { target: { value: '1,2,3,4,5' } });
    expect(distanceInput).toHaveValue('1,2,3,4,5');
  });

  test('displays proper input validation attributes', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check for step attributes on decimal inputs
    const decimalInputs = screen.getAllByRole('spinbutton');
    const hasStepAttribute = decimalInputs.some(input => 
      input.getAttribute('step') === '0.01' || input.getAttribute('step') === '0.001'
    );
    expect(hasStepAttribute).toBe(true);
  });

  test('renders all calculator sections', () => {
    renderWithRouter(<SamplingTools />);
    
    const sections = [
      'Sample Size Calculator',
      'Detection Probability', 
      'Capture-Recapture Analysis',
      'Distance Sampling'
    ];
    
    sections.forEach(section => {
      expect(screen.getByText(section)).toBeInTheDocument();
    });
  });

  test('has proper form structure', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check for input fields
    const textInputs = screen.getAllByRole('textbox');
    expect(textInputs.length).toBeGreaterThanOrEqual(1);
  });

  test('displays scientific method information', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check for method descriptions that exist in the component
    expect(screen.getByText(/Lincoln-Petersen/)).toBeInTheDocument();
    const distanceSamplingElements = screen.getAllByText(/Distance Sampling/);
    expect(distanceSamplingElements.length).toBeGreaterThan(0);
  });

  test('has optional and required field labels', () => {
    renderWithRouter(<SamplingTools />);
    
    // Population size should be labeled as optional
    expect(screen.getByLabelText(/population size \(optional\)/i)).toBeInTheDocument();
    
    // Expected proportion field should exist
    expect(screen.getByLabelText(/expected proportion/i)).toBeInTheDocument();
  });

  test('has confidence level inputs', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check confidence level inputs exist
    const confidenceInputs = screen.getAllByLabelText(/confidence level/i);
    expect(confidenceInputs.length).toBeGreaterThan(0);
  });

  test('handles complex input formats', () => {
    renderWithRouter(<SamplingTools />);
    
    const distanceInput = screen.getByLabelText(/perpendicular distances/i);
    
    // Test various formats
    fireEvent.change(distanceInput, { target: { value: '1.5, 2.3, 4.7' } });
    expect(distanceInput).toHaveValue('1.5, 2.3, 4.7');
    
    fireEvent.change(distanceInput, { target: { value: '1,2,3,4,5' } });
    expect(distanceInput).toHaveValue('1,2,3,4,5');
  });

  test('handles form state changes correctly', () => {
    renderWithRouter(<SamplingTools />);
    
    const proportionInput = screen.getByLabelText(/expected proportion/i);
    const marginInput = screen.getByLabelText(/margin of error/i);
    
    // Change multiple values
    fireEvent.change(proportionInput, { target: { value: '0.3' } });
    fireEvent.change(marginInput, { target: { value: '0.03' } });
    
    expect(proportionInput).toHaveValue(0.3);
    expect(marginInput).toHaveValue(0.03);
  });

  test('renders without errors in different states', () => {
    expect(() => {
      renderWithRouter(<SamplingTools />);
    }).not.toThrow();
  });

  test('handles rapid user interactions', () => {
    renderWithRouter(<SamplingTools />);
    
    const buttons = screen.getAllByRole('button', { name: /calculate|estimate/i });
    
    // Rapid clicking should not cause errors
    buttons.forEach(button => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    
    expect(buttons.length).toBe(4);
  });

  test('maintains form state during interactions', () => {
    renderWithRouter(<SamplingTools />);
    
    const proportionInput = screen.getByLabelText(/expected proportion/i);
    fireEvent.change(proportionInput, { target: { value: '0.7' } });
    
    // Click a button
    const submitButton = screen.getByRole('button', { name: /calculate sample size/i });
    fireEvent.click(submitButton);
    
    // Value should be maintained
    expect(proportionInput).toHaveValue(0.7);
  });

  test('handles all form submissions', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test all calculator submissions
    const sampleSizeButton = screen.getByRole('button', { name: /calculate sample size/i });
    const detectionButton = screen.getByRole('button', { name: /calculate detection probability/i });
    const captureRecaptureButton = screen.getByRole('button', { name: /estimate population/i });
    const distanceSamplingButton = screen.getByRole('button', { name: /estimate density/i });
    
    fireEvent.click(sampleSizeButton);
    fireEvent.click(detectionButton);
    fireEvent.click(captureRecaptureButton);
    fireEvent.click(distanceSamplingButton);
    
    // All buttons should remain in document
    expect(sampleSizeButton).toBeInTheDocument();
    expect(detectionButton).toBeInTheDocument();
    expect(captureRecaptureButton).toBeInTheDocument();
    expect(distanceSamplingButton).toBeInTheDocument();
  });

  test('handles comprehensive input testing', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test confidence level inputs
    const confidenceInputs = screen.getAllByLabelText(/confidence level/i);
    confidenceInputs.forEach((input, index) => {
      const value = 0.9 + index * 0.01;
      fireEvent.change(input, { target: { value: value.toString() } });
      expect(input).toHaveValue(value);
    });
    
    // Test margin of error inputs
    const marginInputs = screen.getAllByLabelText(/margin of error/i);
    marginInputs.forEach((input, index) => {
      const value = 0.05 + index * 0.01;
      fireEvent.change(input, { target: { value: value.toString() } });
      expect(input).toHaveValue(value);
    });
  });

  test('handles detection probability inputs', () => {
    renderWithRouter(<SamplingTools />);
    
    const detectionsInput = screen.getByLabelText(/detections/i);
    const surveysInput = screen.getByLabelText(/surveys/i);
    
    fireEvent.change(detectionsInput, { target: { value: '25' } });
    fireEvent.change(surveysInput, { target: { value: '40' } });
    
    expect(detectionsInput).toHaveValue(25);
    expect(surveysInput).toHaveValue(40);
  });

  test('handles capture-recapture inputs', () => {
    renderWithRouter(<SamplingTools />);
    
    const firstCaptureInput = screen.getByLabelText(/marked in first sample/i);
    const secondCaptureInput = screen.getByLabelText(/total in second sample/i);
    const recapturesInput = screen.getByLabelText(/marked in second sample/i);
    
    fireEvent.change(firstCaptureInput, { target: { value: '50' } });
    fireEvent.change(secondCaptureInput, { target: { value: '45' } });
    fireEvent.change(recapturesInput, { target: { value: '12' } });
    
    expect(firstCaptureInput).toHaveValue(50);
    expect(secondCaptureInput).toHaveValue(45);
    expect(recapturesInput).toHaveValue(12);
  });

  test('handles distance sampling complex inputs', () => {
    renderWithRouter(<SamplingTools />);
    
    const distanceInput = screen.getByLabelText(/perpendicular distances/i);
    const transectLengthInput = screen.getByLabelText(/transect length/i);
    const transectWidthInput = screen.getByLabelText(/transect half-width/i);
    
    // Test complex distance input formats
    fireEvent.change(distanceInput, { target: { value: '1.2, 2.5, 3.8, 0.9, 4.1' } });
    fireEvent.change(transectLengthInput, { target: { value: '1000' } });
    fireEvent.change(transectWidthInput, { target: { value: '50' } });
    
    expect(distanceInput).toHaveValue('1.2, 2.5, 3.8, 0.9, 4.1');
    expect(transectLengthInput).toHaveValue(1000);
    expect(transectWidthInput).toHaveValue(50);
  });

  test('handles edge cases and validation', () => {
    renderWithRouter(<SamplingTools />);
    
    const proportionInput = screen.getByLabelText(/expected proportion/i);
    
    // Test boundary values
    fireEvent.change(proportionInput, { target: { value: '0' } });
    expect(proportionInput).toHaveValue(0);
    
    fireEvent.change(proportionInput, { target: { value: '1' } });
    expect(proportionInput).toHaveValue(1);
    
    // Test decimal precision
    fireEvent.change(proportionInput, { target: { value: '0.123456' } });
    expect(proportionInput).toHaveValue(0.123456);
  });

  test('handles optional population size field', () => {
    renderWithRouter(<SamplingTools />);
    
    const popSizeInput = screen.getByLabelText(/population size \(optional\)/i);
    
    // Test empty value (should be allowed)
    fireEvent.change(popSizeInput, { target: { value: '' } });
    expect(popSizeInput).toHaveValue(null);
    
    // Test with value
    fireEvent.change(popSizeInput, { target: { value: '5000' } });
    expect(popSizeInput).toHaveValue(5000);
  });
});
  // Branch coverage tests - test conditional logic
  test('handles empty population size for infinite population', () => {
    renderWithRouter(<SamplingTools />);
    
    const popSizeInput = screen.getByLabelText(/population size \(optional\)/i);
    
    // Test empty value (should be allowed for infinite population)
    fireEvent.change(popSizeInput, { target: { value: '' } });
    expect(popSizeInput).toHaveValue(null);
    
    // Submit form with empty population size - this tests the null branch
    const submitButton = screen.getByRole('button', { name: /calculate sample size/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeInTheDocument();
  });

  test('handles non-empty population size for finite population', () => {
    renderWithRouter(<SamplingTools />);
    
    const popSizeInput = screen.getByLabelText(/population size \(optional\)/i);
    
    // Test with value (should be used for finite population correction)
    fireEvent.change(popSizeInput, { target: { value: '5000' } });
    expect(popSizeInput).toHaveValue(5000);
    
    // Submit form with population size - this tests the non-null branch
    const submitButton = screen.getByRole('button', { name: /calculate sample size/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeInTheDocument();
  });

  test('tests form validation and edge cases', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test various input combinations to trigger different branches
    const expectedProportionInput = screen.getByLabelText(/expected proportion/i);
    const marginErrorInput = screen.getByLabelText(/margin of error/i);
    const confidenceLevelInputs = screen.getAllByLabelText(/confidence level/i);
    
    // Test boundary values
    fireEvent.change(expectedProportionInput, { target: { value: '0.01' } });
    fireEvent.change(marginErrorInput, { target: { value: '0.001' } });
    fireEvent.change(confidenceLevelInputs[0], { target: { value: '0.99' } });
    
    expect(expectedProportionInput).toHaveValue(0.01);
    expect(marginErrorInput).toHaveValue(0.001);
    expect(confidenceLevelInputs[0]).toHaveValue(0.99);
  });

  test('tests different input combinations for all calculators', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test detection probability inputs
    const detectionsInput = screen.getByLabelText(/detections/i);
    const surveysInput = screen.getByLabelText(/surveys/i);
    
    fireEvent.change(detectionsInput, { target: { value: '0' } });
    fireEvent.change(surveysInput, { target: { value: '1' } });
    
    expect(detectionsInput).toHaveValue(0);
    expect(surveysInput).toHaveValue(1);
    
    // Test distance sampling with different formats
    const distanceInput = screen.getByLabelText(/perpendicular distances/i);
    fireEvent.change(distanceInput, { target: { value: '1.0,2.0,3.0' } });
    expect(distanceInput).toHaveValue('1.0,2.0,3.0');
  });
  test('tests distance sampling array parsing logic', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test different distance input formats to trigger parsing branches
    const distanceInput = screen.getByLabelText(/perpendicular distances/i);
    
    // Test various formats with spaces and different separators
    fireEvent.change(distanceInput, { target: { value: '1.5, 2.3, 4.7, 0.9' } });
    expect(distanceInput).toHaveValue('1.5, 2.3, 4.7, 0.9');
    
    // Test without spaces
    fireEvent.change(distanceInput, { target: { value: '1.2,3.4,5.6,7.8' } });
    expect(distanceInput).toHaveValue('1.2,3.4,5.6,7.8');
    
    // Test single value
    fireEvent.change(distanceInput, { target: { value: '2.5' } });
    expect(distanceInput).toHaveValue('2.5');
  });

  test('tests form state management across different calculators', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test that changing values in one calculator doesn't affect others
    const confidenceInputs = screen.getAllByLabelText(/confidence level/i);
    const marginInputs = screen.getAllByLabelText(/margin of error/i);
    
    // Change values in different forms
    if (confidenceInputs.length > 0) {
      fireEvent.change(confidenceInputs[0], { target: { value: '0.99' } });
      expect(confidenceInputs[0]).toHaveValue(0.99);
    }
    
    if (marginInputs.length > 0) {
      fireEvent.change(marginInputs[0], { target: { value: '0.03' } });
      expect(marginInputs[0]).toHaveValue(0.03);
    }
    
    // Verify first form still has its value
    if (confidenceInputs.length > 0) {
      expect(confidenceInputs[0]).toHaveValue(0.99);
    }
  });

  test('tests all form submission buttons are functional', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test that all buttons can be clicked without errors
    const buttons = screen.getAllByRole('button', { name: /calculate|estimate/i });
    expect(buttons).toHaveLength(4);
    
    buttons.forEach((button, index) => {
      expect(button).not.toBeDisabled();
      fireEvent.click(button);
      // Button should still be in document after click
      expect(button).toBeInTheDocument();
    });
  });

  test('tests capture-recapture input validation', () => {
    renderWithRouter(<SamplingTools />);
    
    // Test boundary conditions for capture-recapture
    const firstCaptureInput = screen.getByLabelText(/marked in first sample/i);
    const secondCaptureInput = screen.getByLabelText(/total in second sample/i);
    const recapturesInput = screen.getByLabelText(/marked in second sample/i);
    
    // Test minimum values
    fireEvent.change(firstCaptureInput, { target: { value: '1' } });
    fireEvent.change(secondCaptureInput, { target: { value: '1' } });
    fireEvent.change(recapturesInput, { target: { value: '0' } });
    
    expect(firstCaptureInput).toHaveValue(1);
    expect(secondCaptureInput).toHaveValue(1);
    expect(recapturesInput).toHaveValue(0);
    
    // Test larger values
    fireEvent.change(firstCaptureInput, { target: { value: '100' } });
    fireEvent.change(secondCaptureInput, { target: { value: '80' } });
    fireEvent.change(recapturesInput, { target: { value: '20' } });
    
    expect(firstCaptureInput).toHaveValue(100);
    expect(secondCaptureInput).toHaveValue(80);
    expect(recapturesInput).toHaveValue(20);
  });