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
});