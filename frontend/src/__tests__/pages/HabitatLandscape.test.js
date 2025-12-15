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
    
    // Initial count should be 4 parameters
    expect(screen.getAllByText('Parameter Name')).toHaveLength(4);
    
    // Add a parameter
    const addButton = screen.getAllByText('Add Parameter')[0];
    fireEvent.click(addButton);
    
    expect(screen.getAllByText('Parameter Name')).toHaveLength(5);
    
    // Remove a parameter (click the first delete button)
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getAllByText('Parameter Name')).toHaveLength(4);
  });

  test('calculates HSI successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce(mockHSIResponse);
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate HSI');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('HSI: 0.75 (Good)')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Minor habitat enhancements could improve suitability')).toBeInTheDocument();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/habitat-suitability'),
      expect.objectContaining({
        parameters: expect.arrayContaining([
          expect.objectContaining({
            name: 'Food Availability',
            score: 0.8,
            weight: 0.3
          })
        ])
      })
    );
  });

  test('handles HSI calculation error', async () => {
    const errorMessage = 'Parameter weights should sum to approximately 1.0';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    });
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate HSI');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
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
    
    // Initial count should be 4 data points
    expect(screen.getAllByLabelText('Area (hectares)')).toHaveLength(4);
    
    // Add a data point
    const addButton = screen.getAllByText('Add Data Point')[0];
    fireEvent.click(addButton);
    
    expect(screen.getAllByLabelText('Area (hectares)')).toHaveLength(5);
    
    // Remove a data point (but should not go below 2)
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    const sarDeleteButtons = deleteButtons.slice(4, 8); // SAR section delete buttons
    fireEvent.click(sarDeleteButtons[0]);
    
    expect(screen.getAllByLabelText('Area (hectares)')).toHaveLength(4);
  });

  test('calculates species-area relationship successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce(mockSARResponse);
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate Relationship');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('S = 5.00 × A^0.250')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('Predicted Species: 65 species for 500 hectares')).toBeInTheDocument();
  });

  test('handles species-area calculation error', async () => {
    const errorMessage = 'Need at least 2 valid data points with positive values';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    });
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate Relationship');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
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

  test('calculates fragmentation metrics successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce(mockFragmentationResponse);
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate Metrics');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Moderate Fragmentation')).toBeInTheDocument();
    });
    
    expect(screen.getByText('3')).toBeInTheDocument(); // Number of patches
    expect(screen.getByText('30')).toBeInTheDocument(); // Total habitat area
    expect(screen.getByText('30.0%')).toBeInTheDocument(); // Habitat proportion
  });

  test('handles fragmentation calculation error', async () => {
    const errorMessage = 'Need at least one valid patch with positive area and perimeter';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    });
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate Metrics');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
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

  test('shows loading states during calculations', async () => {
    // Mock a delayed response
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockedAxios.post.mockReturnValueOnce(promise);
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate HSI');
    fireEvent.click(calculateButton);
    
    // Check for loading state
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
    
    // Resolve the promise
    resolvePromise(mockHSIResponse);
    
    await waitFor(() => {
      expect(screen.getByText('Calculate HSI')).toBeInTheDocument();
    });
  });

  test('displays color-coded suitability classifications', async () => {
    mockedAxios.post.mockResolvedValueOnce(mockHSIResponse);
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate HSI');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/HSI: 0.75/)).toBeInTheDocument();
      expect(screen.getByText(/Good/)).toBeInTheDocument();
    });
  });

  test('displays parameter contributions as chips', async () => {
    mockedAxios.post.mockResolvedValueOnce(mockHSIResponse);
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate HSI');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Food Availability:/)).toBeInTheDocument();
      expect(screen.getByText(/Water Access:/)).toBeInTheDocument();
      expect(screen.getByText(/Cover Quality:/)).toBeInTheDocument();
      expect(screen.getByText(/Nesting Sites:/)).toBeInTheDocument();
    });
  });

  test('displays fragmentation results in table format', async () => {
    mockedAxios.post.mockResolvedValueOnce(mockFragmentationResponse);
    
    render(<HabitatLandscape />);
    
    const calculateButton = screen.getByText('Calculate Metrics');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Moderate Fragmentation')).toBeInTheDocument();
    });
    
    // Check for some key metrics in the results
    expect(screen.getByText(/Number of Patches/)).toBeInTheDocument();
    expect(screen.getByText(/Total Habitat Area/)).toBeInTheDocument();
    expect(screen.getByText(/Fragmentation Index/)).toBeInTheDocument();
  });

  test('includes scientific references', () => {
    render(<HabitatLandscape />);
    
    expect(screen.getByText('U.S. Fish and Wildlife Service HSI Models')).toBeInTheDocument();
    expect(screen.getAllByText('Species-Area Relationship')).toHaveLength(2); // Header and link
    expect(screen.getByText('FRAGSTATS Landscape Metrics')).toBeInTheDocument();
  });
});