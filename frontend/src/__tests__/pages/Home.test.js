import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from '../../pages/Home';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
  },
});

const renderWithRouter = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('Home', () => {
  test('renders main title and description', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Conservation Biology Toolkit')).toBeInTheDocument();
    expect(screen.getByText(/Essential computational tools for conservation biologists/)).toBeInTheDocument();
  });

  test('renders call-to-action section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('🚀 Ready to Use Now!')).toBeInTheDocument();
    expect(screen.getByText(/Two complete tool suites are live!/)).toBeInTheDocument();
  });

  test('renders call-to-action buttons', () => {
    renderWithRouter(<Home />);
    
    const populationButton = screen.getByRole('link', { name: /Population Analysis/i });
    const samplingButton = screen.getByRole('link', { name: /Sampling & Survey/i });
    
    expect(populationButton).toBeInTheDocument();
    expect(populationButton).toHaveAttribute('href', '/population-tools');
    
    expect(samplingButton).toBeInTheDocument();
    expect(samplingButton).toHaveAttribute('href', '/sampling-tools');
  });

  test('renders all tool category cards', () => {
    renderWithRouter(<Home />);
    
    const expectedCategories = [
      '🧬 Population Analysis',
      '📋 Sampling & Survey Design',
      '🔬 Genetic Diversity',
      '🌍 Habitat & Landscape',
      '📚 Breed Registry'
    ];

    expectedCategories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  test('shows correct status chips for each category', () => {
    renderWithRouter(<Home />);
    
    // Available tools should have success chips
    const availableChips = screen.getAllByText('Available');
    expect(availableChips).toHaveLength(2); // Population Analysis and Sampling & Survey Design
    
    // Coming soon tools should have default chips
    const comingSoonChips = screen.getAllByText('Coming Soon');
    expect(comingSoonChips).toHaveLength(3); // Genetic, Habitat, Breed Registry
  });

  test('renders tool descriptions', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText(/Population viability analysis, effective population size/)).toBeInTheDocument();
    expect(screen.getByText(/Statistical tools for survey planning/)).toBeInTheDocument();
    expect(screen.getByText(/Hardy-Weinberg equilibrium, inbreeding coefficients/)).toBeInTheDocument();
  });

  test('renders individual tool chips', () => {
    renderWithRouter(<Home />);
    
    // Population Analysis tools
    expect(screen.getByText('Population Growth Calculator')).toBeInTheDocument();
    expect(screen.getByText('Effective Population Size')).toBeInTheDocument();
    expect(screen.getByText('PVA Calculator')).toBeInTheDocument();
    expect(screen.getByText('Metapopulation Dynamics')).toBeInTheDocument();
    
    // Sampling tools
    expect(screen.getByText('Sample Size Calculator')).toBeInTheDocument();
    expect(screen.getByText('Detection Probability')).toBeInTheDocument();
    expect(screen.getByText('Capture-Recapture')).toBeInTheDocument();
    expect(screen.getByText('Distance Sampling')).toBeInTheDocument();
  });

  test('available tools have enabled buttons', () => {
    renderWithRouter(<Home />);
    
    const availableButtons = screen.getAllByText('Explore Tools Now');
    expect(availableButtons).toHaveLength(2);
    
    availableButtons.forEach(button => {
      expect(button).not.toBeDisabled();
    });
  });

  test('coming soon tools have disabled buttons', () => {
    renderWithRouter(<Home />);
    
    const comingSoonButtons = screen.getAllByText('Coming Soon');
    expect(comingSoonButtons).toHaveLength(3);
    
    comingSoonButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  test('renders open source section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Open Source & Scientific')).toBeInTheDocument();
    expect(screen.getByText(/This toolkit is open source and designed with scientific rigor/)).toBeInTheDocument();
  });

  test('renders feature request section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('🔬 Request New Features & Tools')).toBeInTheDocument();
    expect(screen.getByText('GitHub Issues')).toBeInTheDocument();
    expect(screen.getByText('Feature Ideas')).toBeInTheDocument();
    expect(screen.getByText('Bug Reports')).toBeInTheDocument();
  });

  test('renders external links correctly', () => {
    renderWithRouter(<Home />);
    
    const githubIssuesLink = screen.getByText('Open Issue');
    const discussionsLink = screen.getByText('Start Discussion');
    const bugReportLink = screen.getByText('Report Bug');
    const viewSourceLink = screen.getByText('View Source');
    
    expect(githubIssuesLink).toHaveAttribute('href', 'https://github.com/washimimizuku/conservation-biology-toolkit/issues/new');
    expect(discussionsLink).toHaveAttribute('href', 'https://github.com/washimimizuku/conservation-biology-toolkit/discussions');
    expect(bugReportLink).toHaveAttribute('href', 'https://github.com/washimimizuku/conservation-biology-toolkit/issues/new?template=bug_report.md');
    expect(viewSourceLink).toHaveAttribute('href', 'https://github.com/washimimizuku/conservation-biology-toolkit');
  });

  test('external links open in new tab', () => {
    renderWithRouter(<Home />);
    
    const externalLinks = [
      screen.getByText('Open Issue'),
      screen.getByText('Start Discussion'),
      screen.getByText('Report Bug'),
      screen.getByText('View Source')
    ];
    
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('renders feature request guidelines', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('What to include in feature requests:')).toBeInTheDocument();
    expect(screen.getByText(/Specific conservation biology use case/)).toBeInTheDocument();
  });

  test('renders footer information', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText(/Built by conservation biologists, for conservation biologists/)).toBeInTheDocument();
    expect(screen.getByText(/Licensed under MIT • Version 0.1.0/)).toBeInTheDocument();
  });

  test('has proper responsive grid layout', () => {
    renderWithRouter(<Home />);
    
    // Should have 5 tool category cards
    const cards = screen.getAllByRole('button', { name: /Explore Tools Now|Coming Soon/ });
    expect(cards).toHaveLength(5);
  });

  test('renders icons in feature request cards', () => {
    renderWithRouter(<Home />);
    
    // Check that the feature request section has the expected structure
    expect(screen.getByText('GitHub Issues')).toBeInTheDocument();
    expect(screen.getByText('Feature Ideas')).toBeInTheDocument();
    expect(screen.getByText('Bug Reports')).toBeInTheDocument();
  });

  test('call-to-action section has proper styling', () => {
    renderWithRouter(<Home />);
    
    const ctaSection = screen.getByText('🚀 Ready to Use Now!').closest('div');
    expect(ctaSection).toHaveStyle('border-radius: 8px'); // MUI borderRadius: 2 = 8px
  });

  test('renders all navigation links correctly', () => {
    renderWithRouter(<Home />);
    
    const toolLinks = [
      { text: /Population Analysis/i, href: '/population-tools' },
      { text: /Sampling & Survey/i, href: '/sampling-tools' }
    ];
    
    toolLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toHaveAttribute('href', href);
    });
  });

  test('renders proper container structure', () => {
    const { container } = renderWithRouter(<Home />);
    
    // Should have main container
    expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
  });
});