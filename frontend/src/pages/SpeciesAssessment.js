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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Assessment, Warning, LocationOn } from '@mui/icons-material';
import axios from 'axios';
import { API_URLS } from '../config/api';

const SpeciesAssessment = () => {
  // IUCN Assessment State
  const [iucnData, setIucnData] = useState({
    currentPopulation: '1500',
    historicalPopulation: '5000',
    yearsBetween: '10',
    declineRate: '0.7',
    extentOfOccurrence: '2500',
    areaOfOccupancy: '400',
    numberOfLocations: '6',
    severelyFragmented: true
  });
  const [iucnResults, setIucnResults] = useState(null);
  const [iucnLoading, setIucnLoading] = useState(false);

  // Extinction Risk State
  const [riskData, setRiskData] = useState({
    populationSize: '800',
    populationTrend: 'declining',
    habitatQuality: '0.4',
    threatIntensity: '0.8',
    geneticDiversity: '0.3'
  });
  const [riskResults, setRiskResults] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // Range Analysis State
  const [rangeData, setRangeData] = useState({
    extentOfOccurrence: '8500',
    areaOfOccupancy: '1200',
    numberOfLocations: '12',
    severelyFragmented: false
  });
  const [rangeResults, setRangeResults] = useState(null);
  const [rangeLoading, setRangeLoading] = useState(false);

  // Error states
  const [iucnError, setIucnError] = useState('');
  const [riskError, setRiskError] = useState('');
  const [rangeError, setRangeError] = useState('');

  // IUCN Assessment
  const calculateIUCNAssessment = async () => {
    setIucnLoading(true);
    setIucnError('');
    
    try {
      const payload = {
        population_data: {
          current_population: iucnData.currentPopulation ? parseInt(iucnData.currentPopulation) : null,
          historical_population: iucnData.historicalPopulation ? parseInt(iucnData.historicalPopulation) : null,
          years_between: iucnData.yearsBetween ? parseInt(iucnData.yearsBetween) : null,
          decline_rate: iucnData.declineRate ? parseFloat(iucnData.declineRate) : null
        },
        range_data: {
          extent_of_occurrence: iucnData.extentOfOccurrence ? parseFloat(iucnData.extentOfOccurrence) : null,
          area_of_occupancy: iucnData.areaOfOccupancy ? parseFloat(iucnData.areaOfOccupancy) : null,
          number_of_locations: iucnData.numberOfLocations ? parseInt(iucnData.numberOfLocations) : null,
          severely_fragmented: iucnData.severelyFragmented
        }
      };

      const response = await axios.post(`${API_URLS.speciesAssessment}/iucn-assessment`, payload);
      setIucnResults(response.data);
    } catch (error) {
      setIucnError(error.response?.data?.detail || error.message || 'Assessment failed');
    } finally {
      setIucnLoading(false);
    }
  };
  // Extinction Risk Assessment
  const calculateExtinctionRisk = async () => {
    setRiskLoading(true);
    setRiskError('');
    
    try {
      const payload = {
        population_size: riskData.populationSize ? parseInt(riskData.populationSize) : null,
        population_trend: riskData.populationTrend || null,
        habitat_quality: riskData.habitatQuality ? parseFloat(riskData.habitatQuality) : null,
        threat_intensity: riskData.threatIntensity ? parseFloat(riskData.threatIntensity) : null,
        genetic_diversity: riskData.geneticDiversity ? parseFloat(riskData.geneticDiversity) : null
      };

      const response = await axios.post(`${API_URLS.speciesAssessment}/extinction-risk`, payload);
      setRiskResults(response.data);
    } catch (error) {
      setRiskError(error.response?.data?.detail || error.message || 'Assessment failed');
    } finally {
      setRiskLoading(false);
    }
  };

  // Range Analysis
  const calculateRangeAnalysis = async () => {
    setRangeLoading(true);
    setRangeError('');
    
    try {
      const payload = {
        extent_of_occurrence: rangeData.extentOfOccurrence ? parseFloat(rangeData.extentOfOccurrence) : null,
        area_of_occupancy: rangeData.areaOfOccupancy ? parseFloat(rangeData.areaOfOccupancy) : null,
        number_of_locations: rangeData.numberOfLocations ? parseInt(rangeData.numberOfLocations) : null,
        severely_fragmented: rangeData.severelyFragmented
      };

      const response = await axios.post(`${API_URLS.speciesAssessment}/range-analysis`, payload);
      setRangeResults(response.data);
    } catch (error) {
      setRangeError(error.response?.data?.detail || error.message || 'Assessment failed');
    } finally {
      setRangeLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Critically Endangered': 'error',
      'Endangered': 'warning',
      'Vulnerable': 'info',
      'Near Threatened': 'secondary',
      'Least Concern': 'success'
    };
    return colors[category] || 'default';
  };

  const getRiskColor = (level) => {
    const colors = {
      'Critical': 'error',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success'
    };
    return colors[level] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        📊 Species Assessment Tools
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Evaluate species conservation status using IUCN criteria, extinction risk factors, and range analysis
      </Typography>

      <Grid container spacing={4}>
        {/* IUCN Red List Assessment */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  IUCN Red List Assessment
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Assess species according to IUCN Red List criteria based on population decline, range size, and population size.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://www.iucnredlist.org/resources/categories-and-criteria" target="_blank" rel="noopener noreferrer">
                  IUCN Red List Categories and Criteria
                </a>{' '}•{' '}
                IUCN Standards and Petitions Subcommittee (2019). Guidelines for Using the IUCN Red List Categories and Criteria.
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Population Data
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Current Population"
                    type="number"
                    value={iucnData.currentPopulation}
                    onChange={(e) => setIucnData({...iucnData, currentPopulation: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Decline Rate (0-1)"
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={iucnData.declineRate}
                    onChange={(e) => setIucnData({...iucnData, declineRate: e.target.value})}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Range Data
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Extent of Occurrence (km²)"
                    type="number"
                    value={iucnData.extentOfOccurrence}
                    onChange={(e) => setIucnData({...iucnData, extentOfOccurrence: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Area of Occupancy (km²)"
                    type="number"
                    value={iucnData.areaOfOccupancy}
                    onChange={(e) => setIucnData({...iucnData, areaOfOccupancy: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Number of Locations"
                    type="number"
                    value={iucnData.numberOfLocations}
                    onChange={(e) => setIucnData({...iucnData, numberOfLocations: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={iucnData.severelyFragmented}
                        onChange={(e) => setIucnData({...iucnData, severelyFragmented: e.target.checked})}
                      />
                    }
                    label="Severely Fragmented"
                  />
                </Grid>
              </Grid>

              {iucnError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {iucnError}
                </Alert>
              )}

              {iucnResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Assessment Results:</Typography>
                  <Chip 
                    label={iucnResults.category}
                    color={getCategoryColor(iucnResults.category)}
                    sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}
                  />
                  
                  <Typography variant="body2" paragraph>
                    <strong>Criteria Met:</strong>
                  </Typography>
                  {iucnResults.criteria_met && iucnResults.criteria_met.map((criterion, index) => (
                    <Chip key={index} label={criterion} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Justification:</strong> {iucnResults.justification}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Confidence Level:</strong> {iucnResults.confidence_level}
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateIUCNAssessment}
                disabled={iucnLoading}
                startIcon={iucnLoading ? <CircularProgress size={20} /> : <Assessment />}
              >
                {iucnLoading ? 'Assessing...' : 'Assess IUCN Status'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        {/* Extinction Risk Assessment */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Warning color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Extinction Risk Assessment
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Evaluate extinction risk using multiple biological and environmental factors with weighted scoring.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Extinction_risk" target="_blank" rel="noopener noreferrer">
                  Extinction Risk Assessment
                </a>{' '}•{' '}
                Mace, G.M. et al. (2008). Quantification of extinction risk. <em>Conservation Biology</em> 22: 1424-1442
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Population Size"
                    type="number"
                    value={riskData.populationSize}
                    onChange={(e) => setRiskData({...riskData, populationSize: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Population Trend</InputLabel>
                    <Select
                      value={riskData.populationTrend}
                      label="Population Trend"
                      onChange={(e) => setRiskData({...riskData, populationTrend: e.target.value})}
                    >
                      <MenuItem value="declining">Declining</MenuItem>
                      <MenuItem value="stable">Stable</MenuItem>
                      <MenuItem value="increasing">Increasing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Habitat Quality (0-1)"
                    type="number"
                    inputProps={{ step: 0.1, min: 0, max: 1 }}
                    value={riskData.habitatQuality}
                    onChange={(e) => setRiskData({...riskData, habitatQuality: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Threat Intensity (0-1)"
                    type="number"
                    inputProps={{ step: 0.1, min: 0, max: 1 }}
                    value={riskData.threatIntensity}
                    onChange={(e) => setRiskData({...riskData, threatIntensity: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Genetic Diversity (0-1)"
                    type="number"
                    inputProps={{ step: 0.1, min: 0, max: 1 }}
                    value={riskData.geneticDiversity}
                    onChange={(e) => setRiskData({...riskData, geneticDiversity: e.target.value})}
                    size="small"
                  />
                </Grid>
              </Grid>

              {riskError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {riskError}
                </Alert>
              )}

              {riskResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Risk Assessment:</Typography>
                  <Chip 
                    label={`${riskResults.risk_level} Risk`}
                    color={getRiskColor(riskResults.risk_level)}
                    sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}
                  />
                  
                  <Typography variant="body2">
                    <strong>Risk Score:</strong> {(riskResults.risk_score * 100).toFixed(1)}%
                  </Typography>
                  
                  {riskResults.time_to_extinction_years && (
                    <Typography variant="body2">
                      <strong>Estimated Time to Extinction:</strong> {riskResults.time_to_extinction_years} years
                    </Typography>
                  )}
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Contributing Factors:</strong>
                  </Typography>
                  {riskResults.contributing_factors && Object.entries(riskResults.contributing_factors).map(([factor, score]) => (
                    <Chip 
                      key={factor} 
                      label={`${factor}: ${(score * 100).toFixed(0)}%`} 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  ))}
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Recommendations:</strong>
                  </Typography>
                  {riskResults.recommendations && riskResults.recommendations.map((rec, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                      • {rec}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateExtinctionRisk}
                disabled={riskLoading}
                startIcon={riskLoading ? <CircularProgress size={20} /> : <Warning />}
              >
                {riskLoading ? 'Assessing...' : 'Assess Extinction Risk'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Range Size Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Range Size Analysis
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Analyze species range characteristics, fragmentation, and conservation priority.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Species_distribution" target="_blank" rel="noopener noreferrer">
                  Species Distribution Analysis
                </a>{' '}•{' '}
                Gaston, K.J. (2003). <em>The Structure and Dynamics of Geographic Ranges</em>. Oxford University Press
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Extent of Occurrence (km²)"
                    type="number"
                    value={rangeData.extentOfOccurrence}
                    onChange={(e) => setRangeData({...rangeData, extentOfOccurrence: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Area of Occupancy (km²)"
                    type="number"
                    value={rangeData.areaOfOccupancy}
                    onChange={(e) => setRangeData({...rangeData, areaOfOccupancy: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Number of Locations"
                    type="number"
                    value={rangeData.numberOfLocations}
                    onChange={(e) => setRangeData({...rangeData, numberOfLocations: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rangeData.severelyFragmented}
                        onChange={(e) => setRangeData({...rangeData, severelyFragmented: e.target.checked})}
                      />
                    }
                    label="Severely Fragmented"
                  />
                </Grid>
              </Grid>

              {rangeError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {rangeError}
                </Alert>
              )}

              {rangeResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Range Analysis:</Typography>
                  <Chip 
                    label={`${rangeResults.conservation_priority} Priority`}
                    color={getRiskColor(rangeResults.conservation_priority)}
                    sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}
                  />
                  
                  <Typography variant="body2">
                    <strong>Extent of Occurrence:</strong> {rangeResults.extent_of_occurrence_km2?.toLocaleString()} km²
                  </Typography>
                  <Typography variant="body2">
                    <strong>Area of Occupancy:</strong> {rangeResults.area_of_occupancy_km2?.toLocaleString()} km²
                  </Typography>
                  
                  {rangeResults.range_fragmentation_index !== null && (
                    <Typography variant="body2">
                      <strong>Fragmentation Index:</strong> {(rangeResults.range_fragmentation_index * 100).toFixed(1)}%
                    </Typography>
                  )}
                  
                  {rangeResults.habitat_connectivity !== null && (
                    <Typography variant="body2">
                      <strong>Habitat Connectivity:</strong> {(rangeResults.habitat_connectivity * 100).toFixed(1)}%
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateRangeAnalysis}
                disabled={rangeLoading}
                startIcon={rangeLoading ? <CircularProgress size={20} /> : <LocationOn />}
              >
                {rangeLoading ? 'Analyzing...' : 'Analyze Range'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SpeciesAssessment;