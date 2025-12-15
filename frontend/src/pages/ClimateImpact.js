import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Thermostat, 
  Schedule, 
  Waves, 
  Speed,
  Add as AddIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { API_URLS } from '../config/api';

const ClimateImpact = () => {
  // Temperature Tolerance State
  const [tempTolerance, setTempTolerance] = useState({
    current_temp_min: '10.0',
    current_temp_max: '25.0',
    optimal_temp_min: '15.0',
    optimal_temp_max: '20.0',
    critical_temp_min: '5.0',
    critical_temp_max: '30.0',
    projected_temp_change: '2.0'
  });
  const [tempResults, setTempResults] = useState(null);
  const [tempLoading, setTempLoading] = useState(false);
  const [tempError, setTempError] = useState('');

  // Phenology Shift State
  const [phenologyData, setPhenologyData] = useState({
    historical_event_day: '120',
    temperature_sensitivity: '3.0',
    projected_temp_change: '2.0',
    species_flexibility: '0.6'
  });
  const [dependentEvents, setDependentEvents] = useState([
    { day: '115' },
    { day: '125' }
  ]);
  const [phenologyResults, setPhenologyResults] = useState(null);
  const [phenologyLoading, setPhenologyLoading] = useState(false);
  const [phenologyError, setPhenologyError] = useState('');

  // Sea Level Rise State
  const [seaLevelData, setSeaLevelData] = useState({
    habitat_elevation: '2.0',
    habitat_area: '100.0',
    slope_gradient: '5.0',
    sea_level_rise_rate: '3.0',
    time_horizon: '50',
    migration_potential: '0.6'
  });
  const [seaLevelResults, setSeaLevelResults] = useState(null);
  const [seaLevelLoading, setSeaLevelLoading] = useState(false);
  const [seaLevelError, setSeaLevelError] = useState('');

  // Climate Velocity State
  const [velocityData, setVelocityData] = useState({
    temperature_gradient: '0.5',
    climate_change_rate: '2.0',
    species_dispersal_rate: '1.0',
    habitat_fragmentation: '0.3',
    topographic_complexity: '0.6'
  });
  const [velocityResults, setVelocityResults] = useState(null);
  const [velocityLoading, setVelocityLoading] = useState(false);
  const [velocityError, setVelocityError] = useState('');

  // Temperature Tolerance Functions
  const updateTempTolerance = (field, value) => {
    setTempTolerance(prev => ({ ...prev, [field]: value }));
  };

  const calculateTemperatureTolerance = async () => {
    setTempLoading(true);
    setTempError('');
    
    try {
      const payload = {
        current_temp_min: parseFloat(tempTolerance.current_temp_min),
        current_temp_max: parseFloat(tempTolerance.current_temp_max),
        optimal_temp_min: parseFloat(tempTolerance.optimal_temp_min),
        optimal_temp_max: parseFloat(tempTolerance.optimal_temp_max),
        critical_temp_min: parseFloat(tempTolerance.critical_temp_min),
        critical_temp_max: parseFloat(tempTolerance.critical_temp_max),
        projected_temp_change: parseFloat(tempTolerance.projected_temp_change)
      };

      const response = await axios.post(`${API_URLS.climateImpact}/temperature-tolerance`, payload);
      setTempResults(response.data);
    } catch (error) {
      setTempError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setTempLoading(false);
    }
  };

  // Phenology Functions
  const updatePhenologyData = (field, value) => {
    setPhenologyData(prev => ({ ...prev, [field]: value }));
  };

  const addDependentEvent = () => {
    setDependentEvents([...dependentEvents, { day: '' }]);
  };

  const removeDependentEvent = (index) => {
    if (dependentEvents.length > 0) {
      setDependentEvents(dependentEvents.filter((_, i) => i !== index));
    }
  };

  const updateDependentEvent = (index, value) => {
    const updated = [...dependentEvents];
    updated[index].day = value;
    setDependentEvents(updated);
  };

  const calculatePhenologyShift = async () => {
    setPhenologyLoading(true);
    setPhenologyError('');
    
    try {
      const payload = {
        historical_event_day: parseInt(phenologyData.historical_event_day),
        temperature_sensitivity: parseFloat(phenologyData.temperature_sensitivity),
        projected_temp_change: parseFloat(phenologyData.projected_temp_change),
        species_flexibility: parseFloat(phenologyData.species_flexibility),
        dependent_species_events: dependentEvents
          .map(e => parseInt(e.day))
          .filter(d => !isNaN(d) && d >= 1 && d <= 365)
      };

      const response = await axios.post(`${API_URLS.climateImpact}/phenology-shift`, payload);
      setPhenologyResults(response.data);
    } catch (error) {
      setPhenologyError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setPhenologyLoading(false);
    }
  };

  // Sea Level Rise Functions
  const updateSeaLevelData = (field, value) => {
    setSeaLevelData(prev => ({ ...prev, [field]: value }));
  };

  const calculateSeaLevelRise = async () => {
    setSeaLevelLoading(true);
    setSeaLevelError('');
    
    try {
      const payload = {
        habitat_elevation: parseFloat(seaLevelData.habitat_elevation),
        habitat_area: parseFloat(seaLevelData.habitat_area),
        slope_gradient: parseFloat(seaLevelData.slope_gradient),
        sea_level_rise_rate: parseFloat(seaLevelData.sea_level_rise_rate),
        time_horizon: parseInt(seaLevelData.time_horizon),
        migration_potential: parseFloat(seaLevelData.migration_potential)
      };

      const response = await axios.post(`${API_URLS.climateImpact}/sea-level-rise`, payload);
      setSeaLevelResults(response.data);
    } catch (error) {
      setSeaLevelError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setSeaLevelLoading(false);
    }
  };

  // Climate Velocity Functions
  const updateVelocityData = (field, value) => {
    setVelocityData(prev => ({ ...prev, [field]: value }));
  };

  const calculateClimateVelocity = async () => {
    setVelocityLoading(true);
    setVelocityError('');
    
    try {
      const payload = {
        temperature_gradient: parseFloat(velocityData.temperature_gradient),
        climate_change_rate: parseFloat(velocityData.climate_change_rate),
        species_dispersal_rate: parseFloat(velocityData.species_dispersal_rate),
        habitat_fragmentation: parseFloat(velocityData.habitat_fragmentation),
        topographic_complexity: parseFloat(velocityData.topographic_complexity)
      };

      const response = await axios.post(`${API_URLS.climateImpact}/climate-velocity`, payload);
      setVelocityResults(response.data);
    } catch (error) {
      setVelocityError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setVelocityLoading(false);
    }
  };

  // Helper function to get risk level color
  const getRiskColor = (riskLevel) => {
    if (riskLevel?.includes('Very High')) return 'error';
    if (riskLevel?.includes('High')) return 'warning';
    if (riskLevel?.includes('Moderate')) return 'info';
    if (riskLevel?.includes('Low')) return 'success';
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Climate Impact Assessment
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Analyze climate change impacts on species and ecosystems using mathematical models
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Temperature Tolerance Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Thermostat sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Temperature Tolerance Analysis
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Assess species vulnerability to temperature changes based on thermal tolerance ranges.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1073/pnas.0709472105" target="_blank" rel="noopener noreferrer">
                  Deutsch et al. (2008) PNAS
                </a>
                {', '}
                <a href="https://doi.org/10.1093/icb/19.1.25" target="_blank" rel="noopener noreferrer">
                  Huey & Stevenson (1979) Am. Zool.
                </a>
                {', '}
                <a href="https://doi.org/10.1111/j.1461-0248.2008.01277.x" target="_blank" rel="noopener noreferrer">
                  Kearney & Porter (2009) Ecol. Lett.
                </a>
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Current Min Temp (°C)"
                    type="number"
                    value={tempTolerance.current_temp_min}
                    onChange={(e) => updateTempTolerance('current_temp_min', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Current Max Temp (°C)"
                    type="number"
                    value={tempTolerance.current_temp_max}
                    onChange={(e) => updateTempTolerance('current_temp_max', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Optimal Min Temp (°C)"
                    type="number"
                    value={tempTolerance.optimal_temp_min}
                    onChange={(e) => updateTempTolerance('optimal_temp_min', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Optimal Max Temp (°C)"
                    type="number"
                    value={tempTolerance.optimal_temp_max}
                    onChange={(e) => updateTempTolerance('optimal_temp_max', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Critical Min Temp (°C)"
                    type="number"
                    value={tempTolerance.critical_temp_min}
                    onChange={(e) => updateTempTolerance('critical_temp_min', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Critical Max Temp (°C)"
                    type="number"
                    value={tempTolerance.critical_temp_max}
                    onChange={(e) => updateTempTolerance('critical_temp_max', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Projected Temperature Change (°C)"
                    type="number"
                    value={tempTolerance.projected_temp_change}
                    onChange={(e) => updateTempTolerance('projected_temp_change', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>

              {tempError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {tempError}
                </Alert>
              )}

              {tempResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Current Suitability</Typography>
                        <Typography variant="h6">{(tempResults.current_suitability * 100).toFixed(1)}%</Typography>
                        <Chip label={tempResults.current_status} size="small" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Projected Suitability</Typography>
                        <Typography variant="h6">{(tempResults.projected_suitability * 100).toFixed(1)}%</Typography>
                        <Chip label={tempResults.projected_status} size="small" />
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Risk Level</Typography>
                        <Chip 
                          label={tempResults.risk_level} 
                          color={getRiskColor(tempResults.risk_level)}
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {tempResults.recommendations && tempResults.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                      {tempResults.recommendations.map((rec, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={calculateTemperatureTolerance}
                disabled={tempLoading}
                startIcon={tempLoading ? <CircularProgress size={20} /> : <Thermostat />}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    boxShadow: '0 4px 8px 3px rgba(33, 150, 243, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {tempLoading ? 'Calculating...' : 'Analyze Temperature Tolerance'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Phenology Shift Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Phenology Shift Analysis
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Calculate timing shifts in species life cycle events due to climate change.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1038/nature01286" target="_blank" rel="noopener noreferrer">
                  Parmesan & Yohe (2003) Nature
                </a>
                {', '}
                <a href="https://doi.org/10.1038/nature04539" target="_blank" rel="noopener noreferrer">
                  Both et al. (2006) Nature
                </a>
                {', '}
                <a href="https://doi.org/10.1038/ncomms10717" target="_blank" rel="noopener noreferrer">
                  Thackeray et al. (2016) Nature Comm.
                </a>
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Historical Event Day (1-365)"
                    type="number"
                    value={phenologyData.historical_event_day}
                    onChange={(e) => updatePhenologyData('historical_event_day', e.target.value)}
                    size="small"
                    inputProps={{ min: 1, max: 365 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Temperature Sensitivity (days/°C)"
                    type="number"
                    value={phenologyData.temperature_sensitivity}
                    onChange={(e) => updatePhenologyData('temperature_sensitivity', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Projected Temp Change (°C)"
                    type="number"
                    value={phenologyData.projected_temp_change}
                    onChange={(e) => updatePhenologyData('projected_temp_change', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Species Flexibility (0-1)"
                    type="number"
                    value={phenologyData.species_flexibility}
                    onChange={(e) => updatePhenologyData('species_flexibility', e.target.value)}
                    size="small"
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Dependent Species Events (Optional)
                </Typography>
                {dependentEvents.map((event, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      size="small"
                      label={`Species ${index + 1} Event Day`}
                      type="number"
                      value={event.day}
                      onChange={(e) => updateDependentEvent(index, e.target.value)}
                      inputProps={{ min: 1, max: 365 }}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <IconButton
                      onClick={() => removeDependentEvent(index)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addDependentEvent}
                  size="small"
                  variant="outlined"
                >
                  Add Dependent Species
                </Button>
              </Box>

              {phenologyError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {phenologyError}
                </Alert>
              )}

              {phenologyResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Projected Event Day</Typography>
                        <Typography variant="h6">{phenologyResults.projected_event_day}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Shift Magnitude</Typography>
                        <Typography variant="h6">{phenologyResults.shift_magnitude} days</Typography>
                        <Chip label={phenologyResults.shift_direction} size="small" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Mismatch Risk</Typography>
                        <Chip 
                          label={phenologyResults.mismatch_risk} 
                          color={getRiskColor(phenologyResults.mismatch_risk)}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Adaptation Potential</Typography>
                        <Chip label={phenologyResults.adaptation_potential} />
                      </Paper>
                    </Grid>
                  </Grid>

                  {phenologyResults.synchrony_analysis && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Synchrony Changes:</Typography>
                      {Object.entries(phenologyResults.synchrony_analysis).map(([species, change]) => (
                        <Typography key={species} variant="body2">
                          {species}: {change > 0 ? '+' : ''}{change} days
                        </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {phenologyResults.recommendations && phenologyResults.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                      {phenologyResults.recommendations.map((rec, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={calculatePhenologyShift}
                disabled={phenologyLoading}
                startIcon={phenologyLoading ? <CircularProgress size={20} /> : <Schedule />}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    boxShadow: '0 4px 8px 3px rgba(33, 150, 243, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {phenologyLoading ? 'Calculating...' : 'Analyze Phenology Shift'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Sea Level Rise Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Waves sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Sea Level Rise Impact
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Assess coastal habitat vulnerability to sea level rise.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1672/0277-5212(2002)022[0691:GCCASL]2.0.CO;2" target="_blank" rel="noopener noreferrer">
                  Galbraith et al. (2002) Wetlands
                </a>
                {', '}
                <a href="https://doi.org/10.1890/070219" target="_blank" rel="noopener noreferrer">
                  Craft et al. (2009) Front. Ecol. Environ.
                </a>
                {', '}
                <a href="https://doi.org/10.1016/j.biocon.2010.09.001" target="_blank" rel="noopener noreferrer">
                  Traill et al. (2011) Biol. Conserv.
                </a>
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Habitat Elevation (m)"
                    type="number"
                    value={seaLevelData.habitat_elevation}
                    onChange={(e) => updateSeaLevelData('habitat_elevation', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Habitat Area (hectares)"
                    type="number"
                    value={seaLevelData.habitat_area}
                    onChange={(e) => updateSeaLevelData('habitat_area', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Slope Gradient (degrees)"
                    type="number"
                    value={seaLevelData.slope_gradient}
                    onChange={(e) => updateSeaLevelData('slope_gradient', e.target.value)}
                    size="small"
                    inputProps={{ min: 0, max: 90 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Sea Level Rise Rate (mm/year)"
                    type="number"
                    value={seaLevelData.sea_level_rise_rate}
                    onChange={(e) => updateSeaLevelData('sea_level_rise_rate', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Time Horizon (years)"
                    type="number"
                    value={seaLevelData.time_horizon}
                    onChange={(e) => updateSeaLevelData('time_horizon', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Migration Potential (0-1)"
                    type="number"
                    value={seaLevelData.migration_potential}
                    onChange={(e) => updateSeaLevelData('migration_potential', e.target.value)}
                    size="small"
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                  />
                </Grid>
              </Grid>

              {seaLevelError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {seaLevelError}
                </Alert>
              )}

              {seaLevelResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Sea Level Rise</Typography>
                        <Typography variant="h6">{seaLevelResults.total_sea_level_rise} m</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Habitat Loss</Typography>
                        <Typography variant="h6">{seaLevelResults.habitat_loss_percentage}%</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Urgency Level</Typography>
                        <Chip 
                          label={seaLevelResults.urgency_level} 
                          color={getRiskColor(seaLevelResults.urgency_level)}
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  {seaLevelResults.inundation_timeline && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Inundation Timeline:</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Time Period</TableCell>
                              <TableCell align="right">Habitat Loss (%)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(seaLevelResults.inundation_timeline).map(([year, loss]) => (
                              <TableRow key={year}>
                                <TableCell>{year.replace('year_', '')} years</TableCell>
                                <TableCell align="right">{loss}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  
                  {seaLevelResults.recommendations && seaLevelResults.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                      {seaLevelResults.recommendations.map((rec, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={calculateSeaLevelRise}
                disabled={seaLevelLoading}
                startIcon={seaLevelLoading ? <CircularProgress size={20} /> : <Waves />}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    boxShadow: '0 4px 8px 3px rgba(33, 150, 243, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {seaLevelLoading ? 'Calculating...' : 'Analyze Sea Level Rise'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Climate Velocity Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Climate Velocity Analysis
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Analyze species ability to track shifting climate conditions.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1038/nature08649" target="_blank" rel="noopener noreferrer">
                  Loarie et al. (2009) Nature
                </a>
                {', '}
                <a href="https://doi.org/10.1126/science.1210288" target="_blank" rel="noopener noreferrer">
                  Burrows et al. (2011) Science
                </a>
                {', '}
                <a href="https://doi.org/10.1111/ddi.12346" target="_blank" rel="noopener noreferrer">
                  Carroll et al. (2015) Divers. Distrib.
                </a>
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Temperature Gradient (°C/km)"
                    type="number"
                    value={velocityData.temperature_gradient}
                    onChange={(e) => updateVelocityData('temperature_gradient', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Climate Change Rate (°C/decade)"
                    type="number"
                    value={velocityData.climate_change_rate}
                    onChange={(e) => updateVelocityData('climate_change_rate', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Species Dispersal Rate (km/year)"
                    type="number"
                    value={velocityData.species_dispersal_rate}
                    onChange={(e) => updateVelocityData('species_dispersal_rate', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Habitat Fragmentation (0-1)"
                    type="number"
                    value={velocityData.habitat_fragmentation}
                    onChange={(e) => updateVelocityData('habitat_fragmentation', e.target.value)}
                    size="small"
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Topographic Complexity (0-1)"
                    type="number"
                    value={velocityData.topographic_complexity}
                    onChange={(e) => updateVelocityData('topographic_complexity', e.target.value)}
                    size="small"
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                  />
                </Grid>
              </Grid>

              {velocityError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {velocityError}
                </Alert>
              )}

              {velocityResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Climate Velocity</Typography>
                        <Typography variant="h6">{velocityResults.climate_velocity} km/year</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Dispersal Deficit</Typography>
                        <Typography variant="h6">{velocityResults.dispersal_deficit} km/year</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Migration Feasibility</Typography>
                        <Chip 
                          label={velocityResults.migration_feasibility} 
                          color={velocityResults.migration_feasibility === 'High' ? 'success' : 
                                 velocityResults.migration_feasibility === 'Moderate' ? 'info' : 'warning'}
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Assessment Details:</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Tracking Ability:</strong> {velocityResults.tracking_ability}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Fragmentation Impact:</strong> {velocityResults.fragmentation_impact}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Topographic Refugia:</strong> {velocityResults.topographic_refugia}
                    </Typography>
                  </Box>
                  
                  {velocityResults.recommendations && velocityResults.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                      {velocityResults.recommendations.map((rec, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={calculateClimateVelocity}
                disabled={velocityLoading}
                startIcon={velocityLoading ? <CircularProgress size={20} /> : <Speed />}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    boxShadow: '0 4px 8px 3px rgba(33, 150, 243, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {velocityLoading ? 'Calculating...' : 'Analyze Climate Velocity'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>


    </Container>
  );
};

export default ClimateImpact;