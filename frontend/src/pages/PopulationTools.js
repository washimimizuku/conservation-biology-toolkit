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
import { API_URLS } from '../config/api';

const PopulationTools = () => {
  const [growthData, setGrowthData] = useState({
    initial_population: '100',
    growth_rate: '0.05',
    years: '20',
    carrying_capacity: '' // Optional - leave empty for exponential growth
  });
  const [growthResult, setGrowthResult] = useState(null);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [growthError, setGrowthError] = useState(null);

  const [effectivePopData, setEffectivePopData] = useState({
    breeding_males: '25',
    breeding_females: '30'
  });
  const [effectivePopResult, setEffectivePopResult] = useState(null);
  const [effectivePopLoading, setEffectivePopLoading] = useState(false);
  const [effectivePopError, setEffectivePopError] = useState(null);

  // PVA state
  const [pvaData, setPvaData] = useState({
    initial_population: '50',
    growth_rate: '0.03',
    environmental_variance: '0.15',
    carrying_capacity: '200',
    years: '50',
    simulations: '1000'
  });
  const [pvaResult, setPvaResult] = useState(null);
  const [pvaLoading, setPvaLoading] = useState(false);
  const [pvaError, setPvaError] = useState(null);

  // Metapopulation state
  const [metaData, setMetaData] = useState({
    patch_populations: '100,80,60',
    patch_capacities: '200,150,120',
    growth_rates: '0.1,0.08,0.12',
    migration_matrix: '0,0.05,0.02;0.05,0,0.03;0.02,0.03,0',
    years: '20'
  });
  const [metaResult, setMetaResult] = useState(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(null);

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

      const response = await axios.post(`${API_URLS.populationAnalysis}/population-growth`, payload);
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

      const response = await axios.post(`${API_URLS.populationAnalysis}/effective-population-size`, payload);
      setEffectivePopResult(response.data);
    } catch (error) {
      setEffectivePopError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setEffectivePopLoading(false);
    }
  };

  const handlePvaSubmit = async (e) => {
    e.preventDefault();
    setPvaLoading(true);
    setPvaError(null);

    try {
      const payload = {
        initial_population: parseInt(pvaData.initial_population),
        growth_rate: parseFloat(pvaData.growth_rate),
        environmental_variance: parseFloat(pvaData.environmental_variance),
        carrying_capacity: parseInt(pvaData.carrying_capacity),
        years: parseInt(pvaData.years),
        simulations: parseInt(pvaData.simulations)
      };

      const response = await axios.post(`${API_URLS.populationAnalysis}/population-viability-analysis`, payload);
      setPvaResult(response.data);
    } catch (error) {
      setPvaError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setPvaLoading(false);
    }
  };

  const handleMetaSubmit = async (e) => {
    e.preventDefault();
    setMetaLoading(true);
    setMetaError(null);

    try {
      const payload = {
        patch_populations: metaData.patch_populations.split(',').map(x => parseInt(x.trim())),
        patch_capacities: metaData.patch_capacities.split(',').map(x => parseInt(x.trim())),
        growth_rates: metaData.growth_rates.split(',').map(x => parseFloat(x.trim())),
        migration_matrix: metaData.migration_matrix.split(';').map(row => 
          row.split(',').map(x => parseFloat(x.trim()))
        ),
        years: parseInt(metaData.years)
      };

      const response = await axios.post(`${API_URLS.populationAnalysis}/metapopulation-dynamics`, payload);
      setMetaResult(response.data);
    } catch (error) {
      setMetaError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setMetaLoading(false);
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
                  step="1"
                  inputProps={{ min: 1 }}
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
                  step="1"
                  inputProps={{ min: 1 }}
                  value={growthData.years}
                  onChange={(e) => setGrowthData({...growthData, years: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Carrying Capacity (optional)"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
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
                  step="1"
                  inputProps={{ min: 1 }}
                  value={effectivePopData.breeding_males}
                  onChange={(e) => setEffectivePopData({...effectivePopData, breeding_males: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Number of Breeding Females"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
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

        {/* Population Viability Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Population Viability Analysis (PVA)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Assess extinction risk and population persistence using stochastic population models.
              </Typography>

              <Box component="form" onSubmit={handlePvaSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Initial Population"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={pvaData.initial_population}
                  onChange={(e) => setPvaData({...pvaData, initial_population: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Growth Rate (r)"
                  type="number"
                  step="0.01"
                  value={pvaData.growth_rate}
                  onChange={(e) => setPvaData({...pvaData, growth_rate: e.target.value})}
                  margin="normal"
                  helperText="Mean annual growth rate"
                  required
                />
                <TextField
                  fullWidth
                  label="Environmental Variance"
                  type="number"
                  step="0.01"
                  value={pvaData.environmental_variance}
                  onChange={(e) => setPvaData({...pvaData, environmental_variance: e.target.value})}
                  margin="normal"
                  helperText="Standard deviation of growth rate"
                  required
                />
                <TextField
                  fullWidth
                  label="Carrying Capacity"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={pvaData.carrying_capacity}
                  onChange={(e) => setPvaData({...pvaData, carrying_capacity: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Years to Simulate"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={pvaData.years}
                  onChange={(e) => setPvaData({...pvaData, years: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Number of Simulations"
                  type="number"
                  step="1"
                  inputProps={{ min: 100 }}
                  value={pvaData.simulations}
                  onChange={(e) => setPvaData({...pvaData, simulations: e.target.value})}
                  margin="normal"
                  helperText="More simulations = more accurate results"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={pvaLoading}
                >
                  {pvaLoading ? <CircularProgress size={24} /> : 'Run PVA'}
                </Button>
              </Box>

              {pvaError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {pvaError}
                </Alert>
              )}

              {pvaResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Extinction Probability: {' '}
                    <strong>{(pvaResult.extinction_probability * 100).toFixed(1)}%</strong>
                  </Typography>
                  <Typography variant="body2">
                    Quasi-extinction Probability (&lt;50): {' '}
                    <strong>{(pvaResult.quasi_extinction_probability * 100).toFixed(1)}%</strong>
                  </Typography>
                  <Typography variant="body2">
                    Mean Final Population: {' '}
                    <strong>{Math.round(pvaResult.mean_final_population)}</strong>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Metapopulation Dynamics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Metapopulation Dynamics
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Simulate population dynamics across connected habitat patches with migration.
              </Typography>

              <Box component="form" onSubmit={handleMetaSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Patch Populations"
                  value={metaData.patch_populations}
                  onChange={(e) => setMetaData({...metaData, patch_populations: e.target.value})}
                  margin="normal"
                  helperText="Comma-separated (e.g., 100,80,60)"
                  required
                />
                <TextField
                  fullWidth
                  label="Patch Capacities"
                  value={metaData.patch_capacities}
                  onChange={(e) => setMetaData({...metaData, patch_capacities: e.target.value})}
                  margin="normal"
                  helperText="Comma-separated (e.g., 200,150,120)"
                  required
                />
                <TextField
                  fullWidth
                  label="Growth Rates"
                  value={metaData.growth_rates}
                  onChange={(e) => setMetaData({...metaData, growth_rates: e.target.value})}
                  margin="normal"
                  helperText="Comma-separated (e.g., 0.1,0.08,0.12)"
                  required
                />
                <TextField
                  fullWidth
                  label="Migration Matrix"
                  value={metaData.migration_matrix}
                  onChange={(e) => setMetaData({...metaData, migration_matrix: e.target.value})}
                  margin="normal"
                  helperText="Semicolon-separated rows (e.g., 0,0.05,0.02;0.05,0,0.03;0.02,0.03,0)"
                  required
                />
                <TextField
                  fullWidth
                  label="Years to Simulate"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={metaData.years}
                  onChange={(e) => setMetaData({...metaData, years: e.target.value})}
                  margin="normal"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={metaLoading}
                >
                  {metaLoading ? <CircularProgress size={24} /> : 'Simulate Metapopulation'}
                </Button>
              </Box>

              {metaError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {metaError}
                </Alert>
              )}

              {metaResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Final Total Population: {' '}
                    <strong>{Math.round(metaResult.total_population[metaResult.total_population.length - 1])}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Final Extinction Risk: {' '}
                    <strong>{(metaResult.extinction_risk[metaResult.extinction_risk.length - 1] * 100).toFixed(1)}%</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Patches: {metaResult.patch_populations[0].length}
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