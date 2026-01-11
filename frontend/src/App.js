import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import { ErrorBoundary } from './components';
import Home from './pages/Home';
import PopulationTools from './pages/PopulationTools';
import SamplingTools from './pages/SamplingTools';
import GeneticTools from './pages/GeneticTools';
import SpeciesAssessment from './pages/SpeciesAssessment';
import HabitatLandscape from './pages/HabitatLandscape';
import ClimateImpact from './pages/ClimateImpact';
import ConservationPlanning from './pages/ConservationPlanning';

import './App.css';
import { startPageTracking } from './analytics';

// Google Analytics page tracking component
function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
        page_path: location.pathname,
      });
    }
    
    // Track page engagement time
    const pageName = location.pathname === '/' ? 'Home' : location.pathname.replace('/', '').replace('-', ' ');
    startPageTracking(pageName);
  }, [location]);

  return null;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green for conservation theme
    },
    secondary: {
      main: '#1976d2', // Blue
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary toolName="Conservation Biology Toolkit" reloadOnError={true}>
        <Router>
          <GoogleAnalytics />
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/population-tools" element={
                <ErrorBoundary toolName="Population Tools">
                  <PopulationTools />
                </ErrorBoundary>
              } />
              <Route path="/sampling-tools" element={
                <ErrorBoundary toolName="Sampling Tools">
                  <SamplingTools />
                </ErrorBoundary>
              } />
              <Route path="/genetic-tools" element={
                <ErrorBoundary toolName="Genetic Tools">
                  <GeneticTools />
                </ErrorBoundary>
              } />
              <Route path="/species-assessment" element={
                <ErrorBoundary toolName="Species Assessment">
                  <SpeciesAssessment />
                </ErrorBoundary>
              } />
              <Route path="/habitat-landscape" element={
                <ErrorBoundary toolName="Habitat Landscape">
                  <HabitatLandscape />
                </ErrorBoundary>
              } />
              <Route path="/climate-impact" element={
                <ErrorBoundary toolName="Climate Impact">
                  <ClimateImpact />
                </ErrorBoundary>
              } />
              <Route path="/conservation-planning" element={
                <ErrorBoundary toolName="Conservation Planning">
                  <ConservationPlanning />
                </ErrorBoundary>
              } />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;