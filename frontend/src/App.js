import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PopulationTools from './pages/PopulationTools';
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
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;