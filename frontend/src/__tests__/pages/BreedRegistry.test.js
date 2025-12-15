import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BreedRegistry from '../../pages/BreedRegistry';

describe('BreedRegistry Component', () => {
  test('renders main heading and description', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('📚 Breed Registry')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive animal breeding management system for conservation programs')).toBeInTheDocument();
  });

  test('renders coming soon alert', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('Coming Soon!')).toBeInTheDocument();
    expect(screen.getByText(/This advanced breeding management system is currently under development/)).toBeInTheDocument();
  });

  test('renders key features section', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByText('Animal Records Management')).toBeInTheDocument();
    expect(screen.getByText('Pedigree Tracking')).toBeInTheDocument();
    expect(screen.getByText('Breeding Management')).toBeInTheDocument();
    expect(screen.getByText('Population Genetics')).toBeInTheDocument();
    expect(screen.getByText('Breeding Analytics')).toBeInTheDocument();
    expect(screen.getByText('Data Security & Compliance')).toBeInTheDocument();
  });

  test('renders benefits section', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('Benefits for Conservation')).toBeInTheDocument();
    expect(screen.getByText('Genetic Integrity')).toBeInTheDocument();
    expect(screen.getByText('Scientific Breeding')).toBeInTheDocument();
    // "Data Integration" appears in multiple places, so check for all instances
    const dataIntegrationElements = screen.getAllByText('Data Integration');
    expect(dataIntegrationElements).toHaveLength(2); // Should appear in benefits and technical capabilities
    expect(screen.getByText('Efficient Management')).toBeInTheDocument();
  });

  test('renders target users section', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('Target Users & Applications')).toBeInTheDocument();
    expect(screen.getByText('Captive breeding programs for endangered species')).toBeInTheDocument();
    expect(screen.getByText('Zoo and aquarium breeding management')).toBeInTheDocument();
    expect(screen.getByText('Wildlife rehabilitation centers')).toBeInTheDocument();
  });

  test('renders technical capabilities section', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('Technical Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Advanced Genetic Analysis')).toBeInTheDocument();
    expect(screen.getByText('Multi-generational Tracking')).toBeInTheDocument();
    // "Data Integration" appears in multiple places, so check for all instances
    const dataIntegrationElements = screen.getAllByText('Data Integration');
    expect(dataIntegrationElements).toHaveLength(2); // Should appear in benefits and technical capabilities
    expect(screen.getByText('Secure & Compliant')).toBeInTheDocument();
  });

  test('renders development timeline section', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('Development Timeline')).toBeInTheDocument();
    expect(screen.getByText('Phase 1: Core Database Design')).toBeInTheDocument();
    expect(screen.getByText('Phase 2: Pedigree Management')).toBeInTheDocument();
    expect(screen.getByText('Phase 3: Genetic Analysis Tools')).toBeInTheDocument();
    expect(screen.getByText('Phase 4: Breeding Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Phase 5: Integration & Testing')).toBeInTheDocument();
  });

  test('renders overview section with description', () => {
    render(<BreedRegistry />);
    
    expect(screen.getByText('What is the Breed Registry?')).toBeInTheDocument();
    expect(screen.getByText(/The Breed Registry is a comprehensive digital platform/)).toBeInTheDocument();
  });

  test('renders feature chips for tools', () => {
    render(<BreedRegistry />);
    
    // Check for some specific tool chips
    expect(screen.getByText('Individual ID tracking')).toBeInTheDocument();
    expect(screen.getByText('Family tree visualization')).toBeInTheDocument();
    expect(screen.getByText('Breeding pair selection')).toBeInTheDocument();
    expect(screen.getByText('Allele frequency analysis')).toBeInTheDocument();
  });

  test('renders without errors', () => {
    expect(() => {
      render(<BreedRegistry />);
    }).not.toThrow();
  });
});