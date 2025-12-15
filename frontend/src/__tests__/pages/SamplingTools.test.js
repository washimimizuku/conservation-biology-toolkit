import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SamplingTools from '../../pages/SamplingTools';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SamplingTools', () => {
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

  test('has proper form validation', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check for required fields
    const requiredInputs = screen.getAllByRole('textbox', { required: true });
    expect(requiredInputs.length).toBeGreaterThan(0);
  });

  test('displays scientific method information', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check for method descriptions
    expect(screen.getByText(/Lincoln-Petersen formula/)).toBeInTheDocument();
    expect(screen.getByText(/Half-normal detection function used/)).toBeInTheDocument();
  });

  test('handles optional vs required fields correctly', () => {
    renderWithRouter(<SamplingTools />);
    
    // Population size should be optional
    const popSizeInput = screen.getByLabelText(/population size \(optional\)/i);
    expect(popSizeInput).not.toBeRequired();
    
    // Expected proportion should be required
    const proportionInput = screen.getByLabelText(/expected proportion/i);
    expect(proportionInput).toBeRequired();
  });

  test('renders proper input constraints and ranges', () => {
    renderWithRouter(<SamplingTools />);
    
    // Check confidence level constraints
    const confidenceInputs = screen.getAllByLabelText(/confidence level/i);
    confidenceInputs.forEach(input => {
      expect(input.getAttribute('min')).toBe('0.5');
      expect(input.getAttribute('max')).toBe('0.999');
    });
  });
});