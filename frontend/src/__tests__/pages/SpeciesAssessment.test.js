import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import SpeciesAssessment from '../../pages/SpeciesAssessment';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock API URLs
jest.mock('../../config/api', () => ({
  API_URLS: {
    speciesAssessment: 'http://localhost:8005'
  }
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SpeciesAssessment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders species assessment page with all tools', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    expect(screen.getByText('📊 Species Assessment Tools')).toBeInTheDocument();
    expect(screen.getByText('IUCN Red List Assessment')).toBeInTheDocument();
    expect(screen.getAllByText('Extinction Risk Assessment')[0]).toBeInTheDocument();
    expect(screen.getByText('Range Size Analysis')).toBeInTheDocument();
  });

  test('renders input fields for IUCN assessment', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    expect(screen.getByLabelText('Current Population')).toBeInTheDocument();
    expect(screen.getByLabelText('Decline Rate (0-1)')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Extent of Occurrence (km²)')[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText('Area of Occupancy (km²)')[0]).toBeInTheDocument();
  });

  test('renders input fields for extinction risk assessment', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    expect(screen.getByLabelText('Population Size')).toBeInTheDocument();
    expect(screen.getAllByText('Population Trend')[0]).toBeInTheDocument();
    expect(screen.getByLabelText('Habitat Quality (0-1)')).toBeInTheDocument();
    expect(screen.getByLabelText('Threat Intensity (0-1)')).toBeInTheDocument();
  });

  test('renders input fields for range analysis', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    const rangeFields = screen.getAllByLabelText('Extent of Occurrence (km²)');
    const areaFields = screen.getAllByLabelText('Area of Occupancy (km²)');
    const locationFields = screen.getAllByLabelText('Number of Locations');
    
    expect(rangeFields.length).toBeGreaterThan(0);
    expect(areaFields.length).toBeGreaterThan(0);
    expect(locationFields.length).toBeGreaterThan(0);
  });

  test('handles IUCN assessment calculation', async () => {
    const mockResponse = {
      data: {
        category: 'Endangered',
        criteria_met: ['A1: ≥50% population decline'],
        justification: 'Population declined by 70.0%',
        confidence_level: 'High'
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess IUCN Status');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8005/iucn-assessment',
        expect.objectContaining({
          population_data: expect.any(Object),
          range_data: expect.any(Object)
        })
      );
    });
  });

  test('handles extinction risk assessment calculation', async () => {
    const mockResponse = {
      data: {
        risk_level: 'High',
        risk_score: 0.72,
        contributing_factors: {
          'Population Size': 0.6,
          'Population Trend': 0.8
        },
        recommendations: ['Immediate conservation action required']
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess Extinction Risk');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8005/extinction-risk',
        expect.objectContaining({
          population_size: expect.any(Number),
          population_trend: expect.any(String)
        })
      );
    });
  });

  test('handles range analysis calculation', async () => {
    const mockResponse = {
      data: {
        conservation_priority: 'Medium',
        extent_of_occurrence_km2: 8500,
        area_of_occupancy_km2: 1200,
        range_fragmentation_index: 0.859,
        habitat_connectivity: 1.0
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const analyzeButton = screen.getByText('Analyze Range');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8005/range-analysis',
        expect.objectContaining({
          extent_of_occurrence: expect.any(Number),
          area_of_occupancy: expect.any(Number)
        })
      );
    });
  });

  test('displays IUCN assessment results', async () => {
    const mockResponse = {
      data: {
        category: 'Critically Endangered',
        criteria_met: ['A1: ≥80% population decline', 'B1: EOO < 100 km²'],
        justification: 'Population declined by 85.0%; Extent of occurrence: 50 km²',
        confidence_level: 'High'
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess IUCN Status');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(screen.getByText('Critically Endangered')).toBeInTheDocument();
      expect(screen.getByText('A1: ≥80% population decline')).toBeInTheDocument();
      expect(screen.getByText(/Population declined by 85.0%/)).toBeInTheDocument();
    });
  });

  test('displays extinction risk results', async () => {
    const mockResponse = {
      data: {
        risk_level: 'Critical',
        risk_score: 0.92,
        contributing_factors: {
          'Population Size': 1.0,
          'Habitat Quality': 0.8
        },
        recommendations: [
          'Immediate conservation action required',
          'Establish protected areas or reserves'
        ],
        time_to_extinction_years: 5
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess Extinction Risk');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(screen.getByText('Critical Risk')).toBeInTheDocument();
      expect(screen.getByText('Risk Score:')).toBeInTheDocument();
      expect(screen.getByText('92.0%')).toBeInTheDocument();
      expect(screen.getByText('Estimated Time to Extinction:')).toBeInTheDocument();
      expect(screen.getByText('5 years')).toBeInTheDocument();
    });
  });

  test('displays range analysis results', async () => {
    const mockResponse = {
      data: {
        conservation_priority: 'High',
        extent_of_occurrence_km2: 2500,
        area_of_occupancy_km2: 300,
        range_fragmentation_index: 0.88,
        habitat_connectivity: 0.75
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const analyzeButton = screen.getByText('Analyze Range');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('High Priority')).toBeInTheDocument();
      expect(screen.getByText('Extent of Occurrence:')).toBeInTheDocument();
      expect(screen.getByText('2,500 km²')).toBeInTheDocument();
      expect(screen.getByText('Fragmentation Index:')).toBeInTheDocument();
      expect(screen.getByText('88.0%')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess IUCN Status');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  test('updates input values correctly', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    const populationInput = screen.getByLabelText('Current Population');
    fireEvent.change(populationInput, { target: { value: '2000' } });
    
    expect(populationInput.value).toBe('2000');
  });

  test('toggles switches correctly', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    const fragmentedSwitches = screen.getAllByRole('checkbox', { name: 'Severely Fragmented' });
    const firstSwitch = fragmentedSwitches[0];
    
    expect(firstSwitch.checked).toBe(true); // Default value
    
    fireEvent.click(firstSwitch);
    expect(firstSwitch.checked).toBe(false);
  });

  test('handles input validation and edge cases', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    // Test empty inputs
    const populationInput = screen.getByLabelText('Current Population');
    fireEvent.change(populationInput, { target: { value: '' } });
    expect(populationInput.value).toBe('');
    
    // Test negative values
    fireEvent.change(populationInput, { target: { value: '-100' } });
    expect(populationInput.value).toBe('-100');
    
    // Test decimal values for decline rate
    const declineInput = screen.getByLabelText('Decline Rate (0-1)');
    fireEvent.change(declineInput, { target: { value: '0.5' } });
    expect(declineInput.value).toBe('0.5');
  });

  test('handles population trend selection', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    // Find the select by its role (it has no accessible name in the current implementation)
    const trendSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(trendSelect);
    
    const stableOption = screen.getByRole('option', { name: 'Stable' });
    fireEvent.click(stableOption);
    
    expect(trendSelect).toHaveTextContent('Stable');
  });

  test('handles API errors with different error types', async () => {
    // Test network error
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess IUCN Status');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    // Test API error with detail
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid input data' } }
    });
    
    const riskButton = screen.getByText('Assess Extinction Risk');
    fireEvent.click(riskButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid input data/)).toBeInTheDocument();
    });

    // Test API error without detail
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: {} }
    });
    
    const rangeButton = screen.getByText('Analyze Range');
    fireEvent.click(rangeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Assessment failed/)).toBeInTheDocument();
    });
  });

  test('displays loading states correctly', async () => {
    // Mock a delayed response with proper structure
    mockedAxios.post.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: { 
          category: 'Test', 
          criteria_met: [], 
          justification: 'Test', 
          confidence_level: 'High' 
        } 
      }), 100))
    );
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess IUCN Status');
    fireEvent.click(assessButton);
    
    // Check loading state
    expect(screen.getByText('Assessing...')).toBeInTheDocument();
    expect(assessButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.queryByText('Assessing...')).not.toBeInTheDocument();
    });
  });

  test('handles missing optional result fields', async () => {
    const mockResponse = {
      data: {
        risk_level: 'High',
        risk_score: 0.8,
        contributing_factors: {},
        recommendations: []
        // Missing time_to_extinction_years
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess Extinction Risk');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(screen.getByText('High Risk')).toBeInTheDocument();
      expect(screen.getByText('Risk Score:')).toBeInTheDocument();
      // Should not show time to extinction section
      expect(screen.queryByText('Estimated Time to Extinction:')).not.toBeInTheDocument();
    });
  });

  test('handles range analysis with null values', async () => {
    const mockResponse = {
      data: {
        conservation_priority: 'Low',
        extent_of_occurrence_km2: null,
        area_of_occupancy_km2: null,
        range_fragmentation_index: null,
        habitat_connectivity: null
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const analyzeButton = screen.getByText('Analyze Range');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Low Priority')).toBeInTheDocument();
      // Should not show null values
      expect(screen.queryByText('Fragmentation Index:')).not.toBeInTheDocument();
      expect(screen.queryByText('Habitat Connectivity:')).not.toBeInTheDocument();
    });
  });

  test('tests color helper functions with different categories', async () => {
    const mockResponses = [
      { data: { category: 'Least Concern', criteria_met: [], justification: 'Test', confidence_level: 'High' } },
      { data: { category: 'Near Threatened', criteria_met: [], justification: 'Test', confidence_level: 'High' } },
      { data: { category: 'Vulnerable', criteria_met: [], justification: 'Test', confidence_level: 'High' } }
    ];
    
    for (let i = 0; i < mockResponses.length; i++) {
      const mockResponse = mockResponses[i];
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const { unmount } = renderWithRouter(<SpeciesAssessment />);
      
      const assessButtons = screen.getAllByText('Assess IUCN Status');
      fireEvent.click(assessButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(mockResponse.data.category)).toBeInTheDocument();
      });
      
      unmount(); // Clean up between iterations
    }
  });

  test('tests risk level color helper functions', async () => {
    const mockResponses = [
      { data: { risk_level: 'Low', risk_score: 0.2, contributing_factors: {}, recommendations: [] } },
      { data: { risk_level: 'Medium', risk_score: 0.5, contributing_factors: {}, recommendations: [] } }
    ];
    
    for (let i = 0; i < mockResponses.length; i++) {
      const mockResponse = mockResponses[i];
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const { unmount } = renderWithRouter(<SpeciesAssessment />);
      
      const assessButtons = screen.getAllByText('Assess Extinction Risk');
      fireEvent.click(assessButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(`${mockResponse.data.risk_level} Risk`)).toBeInTheDocument();
      });
      
      unmount(); // Clean up between iterations
    }
  });

  test('handles all input field changes', () => {
    renderWithRouter(<SpeciesAssessment />);
    
    // Test all IUCN input fields
    const currentPopInput = screen.getByLabelText('Current Population');
    fireEvent.change(currentPopInput, { target: { value: '10000' } });
    expect(currentPopInput.value).toBe('10000');
    
    const declineRateInput = screen.getByLabelText('Decline Rate (0-1)');
    fireEvent.change(declineRateInput, { target: { value: '0.8' } });
    expect(declineRateInput.value).toBe('0.8');
    
    const eooInputs = screen.getAllByLabelText('Extent of Occurrence (km²)');
    fireEvent.change(eooInputs[0], { target: { value: '5000' } });
    expect(eooInputs[0].value).toBe('5000');
    
    const aooInputs = screen.getAllByLabelText('Area of Occupancy (km²)');
    fireEvent.change(aooInputs[0], { target: { value: '800' } });
    expect(aooInputs[0].value).toBe('800');
    
    const locationInputs = screen.getAllByLabelText('Number of Locations');
    fireEvent.change(locationInputs[0], { target: { value: '8' } });
    expect(locationInputs[0].value).toBe('8');
    
    // Test extinction risk input fields
    const habitatQualityInput = screen.getByLabelText('Habitat Quality (0-1)');
    fireEvent.change(habitatQualityInput, { target: { value: '0.7' } });
    expect(habitatQualityInput.value).toBe('0.7');
    
    const threatIntensityInput = screen.getByLabelText('Threat Intensity (0-1)');
    fireEvent.change(threatIntensityInput, { target: { value: '0.6' } });
    expect(threatIntensityInput.value).toBe('0.6');
    
    const geneticDiversityInput = screen.getByLabelText('Genetic Diversity (0-1)');
    fireEvent.change(geneticDiversityInput, { target: { value: '0.5' } });
    expect(geneticDiversityInput.value).toBe('0.5');
    
    // Test range analysis switches
    const rangeSwitches = screen.getAllByRole('checkbox', { name: 'Severely Fragmented' });
    const rangeSwitch = rangeSwitches[1]; // Second switch for range analysis
    fireEvent.click(rangeSwitch);
    expect(rangeSwitch.checked).toBe(true);
  });

  test('handles complex result displays with all fields', async () => {
    const complexIucnResponse = {
      data: {
        category: 'Critically Endangered',
        criteria_met: ['A1: ≥80% population decline', 'B1: EOO < 100 km²', 'C1: Population < 250'],
        justification: 'Multiple criteria met indicating critical status',
        confidence_level: 'Very High'
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(complexIucnResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess IUCN Status');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(screen.getByText('Critically Endangered')).toBeInTheDocument();
      expect(screen.getByText('A1: ≥80% population decline')).toBeInTheDocument();
      expect(screen.getByText('B1: EOO < 100 km²')).toBeInTheDocument();
      expect(screen.getByText('C1: Population < 250')).toBeInTheDocument();
      expect(screen.getByText(/Multiple criteria met/)).toBeInTheDocument();
      expect(screen.getByText(/Very High/)).toBeInTheDocument();
    });
  });

  test('handles complex extinction risk results', async () => {
    const complexRiskResponse = {
      data: {
        risk_level: 'Critical',
        risk_score: 0.95,
        contributing_factors: {
          'Population Size': 0.9,
          'Population Trend': 1.0,
          'Habitat Quality': 0.8,
          'Threat Intensity': 0.95,
          'Genetic Diversity': 0.7
        },
        recommendations: [
          'Immediate conservation action required',
          'Establish protected areas',
          'Implement breeding programs',
          'Monitor population closely'
        ],
        time_to_extinction_years: 3
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(complexRiskResponse);
    
    renderWithRouter(<SpeciesAssessment />);
    
    const assessButton = screen.getByText('Assess Extinction Risk');
    fireEvent.click(assessButton);
    
    await waitFor(() => {
      expect(screen.getByText('Critical Risk')).toBeInTheDocument();
      expect(screen.getByText('95.0%')).toBeInTheDocument();
      expect(screen.getByText('3 years')).toBeInTheDocument();
      expect(screen.getByText('Population Size: 90%')).toBeInTheDocument();
      expect(screen.getByText('Population Trend: 100%')).toBeInTheDocument();
      expect(screen.getByText('Habitat Quality: 80%')).toBeInTheDocument();
      expect(screen.getByText('Threat Intensity: 95%')).toBeInTheDocument();
      expect(screen.getByText('Genetic Diversity: 70%')).toBeInTheDocument();
      expect(screen.getByText('• Immediate conservation action required')).toBeInTheDocument();
      expect(screen.getByText('• Establish protected areas')).toBeInTheDocument();
      expect(screen.getByText('• Implement breeding programs')).toBeInTheDocument();
      expect(screen.getByText('• Monitor population closely')).toBeInTheDocument();
    });
  });
});