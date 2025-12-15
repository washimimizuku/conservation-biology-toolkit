import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PopulationTools from './pages/PopulationTools';
import SamplingTools from './pages/SamplingTools';
import GeneticTools from './pages/GeneticTools';
import SpeciesAssessment from './pages/SpeciesAssessment';
import HabitatLandscape from './pages/HabitatLandscape';
import './App.css';

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
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/population-tools" element={<PopulationTools />} />
            <Route path="/sampling-tools" element={<SamplingTools />} />
            <Route path="/genetic-tools" element={<GeneticTools />} />
            <Route path="/species-assessment" element={<SpeciesAssessment />} />
            <Route path="/habitat-landscape" element={<HabitatLandscape />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;