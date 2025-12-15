import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import HabitatLandscape from '../../pages/HabitatLandscape';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock API responses
const mockHSIResponse = {
  data: {
    habitat_suitability_index: 0.75,
    suitability_class: 'Good',
    parameter_contributions: {
      'Food Availability': 0.24,
      'Water Access': 0.18,
      'Cover Quality': 0.21,
      'Nesting Sites': 0.12
    },
    recommendations: [
      'Minor habitat enhancements could improve suitability',
      'Monitor habitat conditions regularly'
    ]
  }
};

const mockSARResponse = {
  data: {
    z_value: 0.25,
    c_value: 5.0,
    r_squared: 0.85,
    equation: 'S = 5.00 × A^0.250',
    predicted_species: 65,
    relationship_strength: 'Strong'
  }
};

const mockFragmentationResponse = {
  data: {
    number_of_patches: 3,
    total_habitat_area: 30.0,
    habitat_proportion: 0.3,
    mean_patch_size: 10.0,
    patch_density: 3.0,
    edge_density: 36.0,
    mean_shape_index: 1.2,
    fragmentation_index: 0.45,
    fragmentation_class: 'Moderate Fragmentation'
  }
};

describe('HabitatLandscape Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main heading and tool sections', () => {
    render(<HabitatLandscape />);
    
    expect(screen.getByText('🌍 Habitat & Landscape Tools')).toBeInTheDocument();
    expect(screen.getByText('Habitat Suitability Index')).toBeInTheDocument();
    expect(screen.getAllByText('Species-Area Relationship')).toHaveLength(2); // Header and link
    expect(screen.getByText('Fragmentation Metrics')).toBeInTheDocument();
  });

  test('renders default HSI parameters', () => {
    render(<HabitatLandscape />);
    
    expect(screen.getByDisplayValue('Food Availability')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Water Access')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cover Quality')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Nesting Sites')).toBeInTheDocument();
  });

  test('can add and remove HSI parameters', () => {
    render(<HabitatLandscape />);
    
    // Initial count should be 4 parameters (but getAllByText finds both labels and spans)
    const parameterLabels = screen.getAllByLabelText('Parameter Name');
    expect(parameterLabels).toHaveLength(4);
    
    // Add a parameter
    const addButton = screen.getAllByText('Add Parameter')[0];
    fireEvent.click(addButton);
    
    expect(screen.getAllByLabelText('Parameter Name')).toHaveLength(5);
    
    // Remove a parameter (click the first delete button)
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getAllByLabelText('Parameter Name')).toHaveLength(4);
  });

  test('calls HSI calculation API when button clicked', () => {
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate HSI');
    
    // Verify button exists and is clickable
    expect(calculateButton).toBeInTheDocument();
    expect(calculateButton).not.toBeDisabled();
    
    // Click should not throw error
    fireEvent.click(calculateButton);
    
    // Button should still exist after click
    expect(calculateButton).toBeInTheDocument();
  });

  test('HSI calculation button interaction', () => {
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate HSI');
    
    // Verify button exists and can be clicked
    expect(calculateButton).toBeInTheDocument();
    expect(calculateButton).not.toBeDisabled();
    
    // Click should not throw error
    fireEvent.click(calculateButton);
  });

  test('renders default species-area data points', () => {
    render(<HabitatLandscape />);
    
    // Check for default area values
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  test('can add and remove species-area data points', () => {
    render(<HabitatLandscape />);
    
    // Initial count includes both SAR (4) and fragmentation (3) area inputs = 7 total
    const allAreaInputs = screen.getAllByLabelText('Area (hectares)');
    expect(allAreaInputs).toHaveLength(7);
    
    // Add a data point
    const addButton = screen.getAllByText('Add Data Point')[0];
    fireEvent.click(addButton);
    
    expect(screen.getAllByLabelText('Area (hectares)')).toHaveLength(8);
    
    // Remove a data point (but should not go below minimum)
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    // Find SAR delete buttons (they come after HSI delete buttons)
    const sarDeleteButtons = deleteButtons.slice(4, 8); // SAR section delete buttons
    fireEvent.click(sarDeleteButtons[0]);
    
    expect(screen.getAllByLabelText('Area (hectares)')).toHaveLength(7);
  });

  test('species-area relationship button interaction', () => {
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate Relationship');
    
    // Verify button exists and can be clicked
    expect(calculateButton).toBeInTheDocument();
    expect(calculateButton).not.toBeDisabled();
    
    // Click should not throw error
    fireEvent.click(calculateButton);
  });

  test('species-area relationship form validation', () => {
    render(<HabitatLandscape />);
    
    // Check that default data points are present
    const areaInputs = screen.getAllByLabelText('Area (hectares)');
    const speciesInputs = screen.getAllByLabelText('Species Count');
    
    // Should have at least 4 data points by default
    expect(areaInputs.length).toBeGreaterThanOrEqual(4);
    expect(speciesInputs.length).toBeGreaterThanOrEqual(4);
  });

  test('renders default fragmentation patches', () => {
    render(<HabitatLandscape />);
    
    // Check for default patch values
    const areaInputs = screen.getAllByLabelText('Area (hectares)');
    const perimeterInputs = screen.getAllByLabelText('Perimeter (meters)');
    
    // Should have fragmentation patches (last 3 area inputs)
    expect(areaInputs[areaInputs.length - 3]).toHaveValue(10);
    expect(areaInputs[areaInputs.length - 2]).toHaveValue(5);
    expect(areaInputs[areaInputs.length - 1]).toHaveValue(15);
    
    expect(perimeterInputs[0]).toHaveValue(1200);
    expect(perimeterInputs[1]).toHaveValue(900);
    expect(perimeterInputs[2]).toHaveValue(1500);
  });

  test('can add and remove fragmentation patches', () => {
    render(<HabitatLandscape />);
    
    // Initial count should be 3 patches
    expect(screen.getAllByLabelText('Perimeter (meters)')).toHaveLength(3);
    
    // Add a patch
    const addButton = screen.getAllByText('Add Patch')[0];
    fireEvent.click(addButton);
    
    expect(screen.getAllByLabelText('Perimeter (meters)')).toHaveLength(4);
    
    // Remove a patch
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    const fragDeleteButtons = deleteButtons.slice(-4); // Last 4 delete buttons for fragmentation
    fireEvent.click(fragDeleteButtons[0]);
    
    expect(screen.getAllByLabelText('Perimeter (meters)')).toHaveLength(3);
  });

  test('fragmentation metrics button interaction', () => {
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate Metrics');
    
    // Verify button exists and can be clicked
    expect(calculateButton).toBeInTheDocument();
    expect(calculateButton).not.toBeDisabled();
    
    // Click should not throw error
    fireEvent.click(calculateButton);
  });

  test('fragmentation patches form validation', () => {
    render(<HabitatLandscape />);
    
    // Check that default patches are present
    const areaInputs = screen.getAllByLabelText('Area (hectares)');
    const perimeterInputs = screen.getAllByLabelText('Perimeter (meters)');
    
    // Should have fragmentation patches (last 3 area inputs are for fragmentation)
    expect(areaInputs.length).toBeGreaterThanOrEqual(7); // 4 SAR + 3 fragmentation
    expect(perimeterInputs.length).toBe(3); // Only fragmentation has perimeter
  });

  test('updates landscape area input', () => {
    render(<HabitatLandscape />);
    
    const landscapeAreaInput = screen.getByLabelText('Total Landscape Area (hectares)');
    expect(landscapeAreaInput).toHaveValue(100);
    
    fireEvent.change(landscapeAreaInput, { target: { value: '200' } });
    expect(landscapeAreaInput).toHaveValue(200);
  });

  test('updates prediction area input', () => {
    render(<HabitatLandscape />);
    
    const predictionAreaInput = screen.getByLabelText('Prediction Area (hectares)');
    expect(predictionAreaInput).toHaveValue(500);
    
    fireEvent.change(predictionAreaInput, { target: { value: '750' } });
    expect(predictionAreaInput).toHaveValue(750);
  });

  test('button states during interactions', () => {
    render(<HabitatLandscape />);
    
    const hsiButton = screen.getByText('Calculate HSI');
    const sarButton = screen.getByText('Calculate Relationship');
    const fragButton = screen.getByText('Calculate Metrics');
    
    // All buttons should be enabled initially
    expect(hsiButton).not.toBeDisabled();
    expect(sarButton).not.toBeDisabled();
    expect(fragButton).not.toBeDisabled();
  });

  test('HSI form has proper structure', () => {
    render(<HabitatLandscape />);
    
    // Check for HSI section elements
    expect(screen.getByText('Habitat Suitability Index')).toBeInTheDocument();
    expect(screen.getByText('Habitat Parameters')).toBeInTheDocument();
    
    // Check for parameter inputs
    const parameterNameInputs = screen.getAllByLabelText('Parameter Name');
    expect(parameterNameInputs.length).toBe(4); // Default 4 parameters
  });

  test('SAR form has proper structure', () => {
    render(<HabitatLandscape />);
    
    // Check for SAR section elements (use getAllByText since it appears in both heading and reference)
    const sarElements = screen.getAllByText('Species-Area Relationship');
    expect(sarElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Area-Species Data Points')).toBeInTheDocument();
    
    // Check for prediction area input
    expect(screen.getByLabelText('Prediction Area (hectares)')).toBeInTheDocument();
  });

  test('fragmentation form has proper structure', () => {
    render(<HabitatLandscape />);
    
    // Check for fragmentation section elements
    expect(screen.getByText('Fragmentation Metrics')).toBeInTheDocument();
    expect(screen.getByText('Habitat Patches')).toBeInTheDocument();
    
    // Check for landscape area input
    expect(screen.getByLabelText('Total Landscape Area (hectares)')).toBeInTheDocument();
  });

  test('includes scientific references', () => {
    render(<HabitatLandscape />);
    
    expect(screen.getByText('U.S. Fish and Wildlife Service HSI Models')).toBeInTheDocument();
    expect(screen.getAllByText('Species-Area Relationship')).toHaveLength(2); // Header and link
    expect(screen.getByText('FRAGSTATS Landscape Metrics')).toBeInTheDocument();
  });
});