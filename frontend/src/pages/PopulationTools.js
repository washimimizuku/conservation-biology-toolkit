import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const PopulationTools = () => {
  const [growthData, setGrowthData] = useState({
    initial_population: '',
    growth_rate: '',
    years: '',
    carrying_capacity: ''
  });
  const [growthResult, setGrowthResult] = useState(null);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [growthError, setGrowthError] = useState(null);

  const [effectivePopData, setEffectivePopData] = useState({
    breeding_males: '',
    breeding_females: ''
  });
  const [effectivePopResult, setEffectivePopResult] = useState(null);
  const [effectivePopLoading, setEffectivePopLoading] = useState(false);
  const [effectivePopError, setEffectivePopError] = useState(null);

  const handleGrowthSubmit = async (e) => {
    e.preventDefault();
    setGrowthLoading(true);
    setGrowthError(null);

    try {
      const payload = {
        initial_population: parseInt(growthData.initial_population),
        growth_rate: parseFloat(growthData.growth_rate),
        years: parseInt(growthData.years),
        carrying_capacity: growthData.carrying_capacity ? parseInt(growthData.carrying_capacity) : null
      };

      const response = await axios.post('/api/population-analysis/population-growth', payload);
      setGrowthResult(response.data);
    } catch (error) {
      setGrowthError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setGrowthLoading(false);
    }
  };

  const handleEffectivePopSubmit = async (e) => {
    e.preventDefault();
    setEffectivePopLoading(true);
    setEffectivePopError(null);

    try {
      const payload = {
        breeding_males: parseInt(effectivePopData.breeding_males),
        breeding_females: parseInt(effectivePopData.breeding_females)
      };

      const response = await axios.post('/api/population-analysis/effective-population-size', payload);
      setEffectivePopResult(response.data);
    } catch (error) {
      setEffectivePopError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setEffectivePopLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        🧬 Population Analysis Tools
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate population dynamics, effective population size, and demographic parameters 
        essential for conservation planning.
      </Typography>

      <Grid container spacing={4}>
        {/* Population Growth Calculator */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Population Growth Calculator
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Model population growth using exponential or logistic models to predict future population sizes.
              </Typography>

              <Box component="form" onSubmit={handleGrowthSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Initial Population"
                  type="number"
                  value={growthData.initial_population}
                  onChange={(e) => setGrowthData({...growthData, initial_population: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Growth Rate (r)"
                  type="number"
                  step="0.01"
                  value={growthData.growth_rate}
                  onChange={(e) => setGrowthData({...growthData, growth_rate: e.target.value})}
                  margin="normal"
                  helperText="Annual growth rate (e.g., 0.05 for 5% growth)"
                  required
                />
                <TextField
                  fullWidth
                  label="Number of Years"
                  type="number"
                  value={growthData.years}
                  onChange={(e) => setGrowthData({...growthData, years: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Carrying Capacity (optional)"
                  type="number"
                  value={growthData.carrying_capacity}
                  onChange={(e) => setGrowthData({...growthData, carrying_capacity: e.target.value})}
                  margin="normal"
                  helperText="Leave empty for exponential growth"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={growthLoading}
                >
                  {growthLoading ? <CircularProgress size={24} /> : 'Calculate Growth'}
                </Button>
              </Box>

              {growthError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {growthError}
                </Alert>
              )}

              {growthResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Final Population (Year {growthResult.years[growthResult.years.length - 1]}): {' '}
                    <strong>{Math.round(growthResult.population[growthResult.population.length - 1])}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Growth Rate: <strong>{growthResult.growth_rate}</strong>
                  </Typography>
                  {growthResult.carrying_capacity && (
                    <Typography variant="body2">
                      Carrying Capacity: <strong>{growthResult.carrying_capacity}</strong>
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Effective Population Size Calculator */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Effective Population Size
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Calculate the effective population size (Ne) based on the number of breeding individuals.
              </Typography>

              <Box component="form" onSubmit={handleEffectivePopSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Number of Breeding Males"
                  type="number"
                  value={effectivePopData.breeding_males}
                  onChange={(e) => setEffectivePopData({...effectivePopData, breeding_males: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Number of Breeding Females"
                  type="number"
                  value={effectivePopData.breeding_females}
                  onChange={(e) => setEffectivePopData({...effectivePopData, breeding_females: e.target.value})}
                  margin="normal"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={effectivePopLoading}
                >
                  {effectivePopLoading ? <CircularProgress size={24} /> : 'Calculate Ne'}
                </Button>
              </Box>

              {effectivePopError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {effectivePopError}
                </Alert>
              )}

              {effectivePopResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Effective Population Size (Ne): {' '}
                    <strong>{Math.round(effectivePopResult.effective_population_size * 100) / 100}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Formula: Ne = 4 × Nm × Nf / (Nm + Nf)
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PopulationTools;