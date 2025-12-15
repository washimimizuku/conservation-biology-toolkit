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
});