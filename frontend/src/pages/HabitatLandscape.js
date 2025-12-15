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
  Landscape, 
  Assessment, 
  ScatterPlot, 
  Add as AddIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { API_URLS } from '../config/api';

const HabitatLandscape = () => {
  // Habitat Suitability State
  const [hsiParameters, setHsiParameters] = useState([
    { name: 'Food Availability', score: '0.8', weight: '0.3' },
    { name: 'Water Access', score: '0.9', weight: '0.2' },
    { name: 'Cover Quality', score: '0.7', weight: '0.3' },
    { name: 'Nesting Sites', score: '0.6', weight: '0.2' }
  ]);
  const [hsiResults, setHsiResults] = useState(null);
  const [hsiLoading, setHsiLoading] = useState(false);
  const [hsiError, setHsiError] = useState('');

  // Species-Area Relationship State
  const [areaData, setAreaData] = useState([
    { area: '1', species: '5' },
    { area: '10', species: '15' },
    { area: '100', species: '35' },
    { area: '1000', species: '80' }
  ]);
  const [predictionArea, setPredictionArea] = useState('500');
  const [sarResults, setSarResults] = useState(null);
  const [sarLoading, setSarLoading] = useState(false);
  const [sarError, setSarError] = useState('');

  // Fragmentation State
  const [patches, setPatches] = useState([
    { area: '10.0', perimeter: '1200' },
    { area: '5.0', perimeter: '900' },
    { area: '15.0', perimeter: '1500' }
  ]);
  const [landscapeArea, setLandscapeArea] = useState('100.0');
  const [fragResults, setFragResults] = useState(null);
  const [fragLoading, setFragLoading] = useState(false);
  const [fragError, setFragError] = useState('');

  // HSI Functions
  const addHsiParameter = () => {
    setHsiParameters([...hsiParameters, { name: '', score: '0.5', weight: '0.1' }]);
  };

  const removeHsiParameter = (index) => {
    if (hsiParameters.length > 1) {
      setHsiParameters(hsiParameters.filter((_, i) => i !== index));
    }
  };

  const updateHsiParameter = (index, field, value) => {
    const updated = [...hsiParameters];
    updated[index][field] = value;
    setHsiParameters(updated);
  };

  const calculateHSI = async () => {
    setHsiLoading(true);
    setHsiError('');
    
    try {
      const parameters = hsiParameters.map(param => ({
        name: param.name || 'Unnamed Parameter',
        score: parseFloat(param.score) || 0,
        weight: parseFloat(param.weight) || 0
      }));

      const response = await axios.post(`${API_URLS.habitatLandscape}/habitat-suitability`, {
        parameters
      });
      
      setHsiResults(response.data);
    } catch (error) {
      setHsiError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setHsiLoading(false);
    }
  };

  // Species-Area Functions
  const addAreaDataPoint = () => {
    setAreaData([...areaData, { area: '', species: '' }]);
  };

  const removeAreaDataPoint = (index) => {
    if (areaData.length > 2) {
      setAreaData(areaData.filter((_, i) => i !== index));
    }
  };

  const updateAreaDataPoint = (index, field, value) => {
    const updated = [...areaData];
    updated[index][field] = value;
    setAreaData(updated);
  };

  const calculateSpeciesArea = async () => {
    setSarLoading(true);
    setSarError('');
    
    try {
      const areas = areaData.map(d => parseFloat(d.area)).filter(a => !isNaN(a) && a > 0);
      const species_counts = areaData.map(d => parseInt(d.species)).filter(s => !isNaN(s) && s > 0);
      
      if (areas.length !== species_counts.length || areas.length < 2) {
        throw new Error('Need at least 2 valid data points with positive values');
      }

      const payload = {
        areas,
        species_counts,
        prediction_area: predictionArea ? parseFloat(predictionArea) : null
      };

      const response = await axios.post(`${API_URLS.habitatLandscape}/species-area-relationship`, payload);
      setSarResults(response.data);
    } catch (error) {
      setSarError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setSarLoading(false);
    }
  };

  // Fragmentation Functions
  const addPatch = () => {
    setPatches([...patches, { area: '', perimeter: '' }]);
  };

  const removePatch = (index) => {
    if (patches.length > 1) {
      setPatches(patches.filter((_, i) => i !== index));
    }
  };

  const updatePatch = (index, field, value) => {
    const updated = [...patches];
    updated[index][field] = value;
    setPatches(updated);
  };

  const calculateFragmentation = async () => {
    setFragLoading(true);
    setFragError('');
    
    try {
      const validPatches = patches
        .filter(p => p.area && p.perimeter)
        .map(p => ({
          area: parseFloat(p.area),
          perimeter: parseFloat(p.perimeter)
        }))
        .filter(p => p.area > 0 && p.perimeter > 0);

      if (validPatches.length === 0) {
        throw new Error('Need at least one valid patch with positive area and perimeter');
      }

      const payload = {
        patches: validPatches,
        total_landscape_area: parseFloat(landscapeArea) || 100
      };

      const response = await axios.post(`${API_URLS.habitatLandscape}/fragmentation-metrics`, payload);
      setFragResults(response.data);
    } catch (error) {
      setFragError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setFragLoading(false);
    }
  };

  const getSuitabilityColor = (suitabilityClass) => {
    const colors = {
      'Excellent': 'success',
      'Good': 'info',
      'Fair': 'warning',
      'Poor': 'error',
      'Unsuitable': 'error'
    };
    return colors[suitabilityClass] || 'default';
  };

  const getRelationshipColor = (strength) => {
    const colors = {
      'Very Strong': 'success',
      'Strong': 'info',
      'Moderate': 'warning',
      'Weak': 'error',
      'Very Weak': 'error'
    };
    return colors[strength] || 'default';
  };

  const getFragmentationColor = (fragClass) => {
    const colors = {
      'Low Fragmentation': 'success',
      'Moderate Fragmentation': 'info',
      'High Fragmentation': 'warning',
      'Very High Fragmentation': 'error',
      'Extreme Fragmentation': 'error'
    };
    return colors[fragClass] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        🌍 Habitat & Landscape Tools
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Analyze habitat quality, species-area relationships, and landscape fragmentation patterns
      </Typography>

      <Grid container spacing={4}>
        {/* Habitat Suitability Index */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Landscape color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Habitat Suitability Index
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Evaluate overall habitat quality using weighted environmental parameters.
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://www.fws.gov/policy/ESMindex.html" target="_blank" rel="noopener noreferrer">
                  U.S. Fish and Wildlife Service HSI Models
                </a>{' '}•{' '}
                Schamberger, M. & Krohn, W.B. (1982). Status of the habitat evaluation procedures. <em>Transactions of the North American Wildlife and Natural Resources Conference</em> 47: 154-164.
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Habitat Parameters
              </Typography>
              
              {hsiParameters.map((param, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Parameter Name"
                        value={param.name}
                        onChange={(e) => updateHsiParameter(index, 'name', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Score (0-1)"
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 1 }}
                        value={param.score}
                        onChange={(e) => updateHsiParameter(index, 'score', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Weight (0-1)"
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 1 }}
                        value={param.weight}
                        onChange={(e) => updateHsiParameter(index, 'weight', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton 
                        onClick={() => removeHsiParameter(index)}
                        disabled={hsiParameters.length <= 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addHsiParameter}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              >
                Add Parameter
              </Button>

              {hsiError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {hsiError}
                </Alert>
              )}

              {hsiResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>HSI Results:</Typography>
                  <Chip 
                    label={`HSI: ${hsiResults.habitat_suitability_index} (${hsiResults.suitability_class})`}
                    color={getSuitabilityColor(hsiResults.suitability_class)}
                    sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}
                  />
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Parameter Contributions:</strong>
                  </Typography>
                  {Object.entries(hsiResults.parameter_contributions).map(([param, contribution]) => (
                    <Chip 
                      key={param} 
                      label={`${param}: ${(contribution * 100).toFixed(1)}%`} 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  ))}
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Recommendations:</strong>
                  </Typography>
                  {hsiResults.recommendations.map((rec, index) => (
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
                onClick={calculateHSI}
                disabled={hsiLoading}
                startIcon={hsiLoading ? <CircularProgress size={20} /> : <Assessment />}
              >
                {hsiLoading ? 'Calculating...' : 'Calculate HSI'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Species-Area Relationship */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScatterPlot color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Species-Area Relationship
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Model the relationship between habitat area and species richness using the power law S = c × A^z.
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Species%E2%80%93area_relationship" target="_blank" rel="noopener noreferrer">
                  Species-Area Relationship
                </a>{' '}•{' '}
                MacArthur, R.H. & Wilson, E.O. (1967). <em>The Theory of Island Biogeography</em>. Princeton University Press.
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Area-Species Data Points
              </Typography>
              
              {areaData.map((data, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Area (hectares)"
                        type="number"
                        value={data.area}
                        onChange={(e) => updateAreaDataPoint(index, 'area', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Species Count"
                        type="number"
                        value={data.species}
                        onChange={(e) => updateAreaDataPoint(index, 'species', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton 
                        onClick={() => removeAreaDataPoint(index)}
                        disabled={areaData.length <= 2}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addAreaDataPoint}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              >
                Add Data Point
              </Button>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Prediction Area (hectares)"
                type="number"
                value={predictionArea}
                onChange={(e) => setPredictionArea(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                helperText="Optional: Predict species count for this area"
              />

              {sarError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {sarError}
                </Alert>
              )}

              {sarResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Species-Area Results:</Typography>
                  
                  <Typography variant="body2">
                    <strong>Equation:</strong> {sarResults.equation}
                  </Typography>
                  <Typography variant="body2">
                    <strong>R²:</strong> {sarResults.r_squared}
                  </Typography>
                  
                  <Chip 
                    label={sarResults.relationship_strength}
                    color={getRelationshipColor(sarResults.relationship_strength)}
                    sx={{ mt: 1, mb: 2 }}
                  />
                  
                  {sarResults.predicted_species && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Predicted Species:</strong> {sarResults.predicted_species} species for {predictionArea} hectares
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateSpeciesArea}
                disabled={sarLoading}
                startIcon={sarLoading ? <CircularProgress size={20} /> : <ScatterPlot />}
              >
                {sarLoading ? 'Calculating...' : 'Calculate Relationship'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Fragmentation Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Fragmentation Metrics
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Quantify landscape fragmentation using patch-based metrics including density, edge effects, and shape complexity.
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://www.umass.edu/landeco/research/fragstats/fragstats.html" target="_blank" rel="noopener noreferrer">
                  FRAGSTATS Landscape Metrics
                </a>{' '}•{' '}
                McGarigal, K. & Marks, B.J. (1995). FRAGSTATS: spatial pattern analysis program for quantifying landscape structure. <em>USDA Forest Service General Technical Report</em> PNW-351.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" gutterBottom>
                    Habitat Patches
                  </Typography>
                  
                  {patches.map((patch, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Area (hectares)"
                            type="number"
                            value={patch.area}
                            onChange={(e) => updatePatch(index, 'area', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Perimeter (meters)"
                            type="number"
                            value={patch.perimeter}
                            onChange={(e) => updatePatch(index, 'perimeter', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton 
                            onClick={() => removePatch(index)}
                            disabled={patches.length <= 1}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addPatch}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    Add Patch
                  </Button>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Total Landscape Area (hectares)"
                    type="number"
                    value={landscapeArea}
                    onChange={(e) => setLandscapeArea(e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>

              {fragError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {fragError}
                </Alert>
              )}

              {fragResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Fragmentation Results:</Typography>
                  
                  <Chip 
                    label={fragResults.fragmentation_class}
                    color={getFragmentationColor(fragResults.fragmentation_class)}
                    sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}
                  />
                  
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Metric</strong></TableCell>
                          <TableCell align="right"><strong>Value</strong></TableCell>
                          <TableCell><strong>Unit</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Number of Patches</TableCell>
                          <TableCell align="right">{fragResults.number_of_patches}</TableCell>
                          <TableCell>patches</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Habitat Area</TableCell>
                          <TableCell align="right">{fragResults.total_habitat_area}</TableCell>
                          <TableCell>hectares</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Habitat Proportion</TableCell>
                          <TableCell align="right">{(fragResults.habitat_proportion * 100).toFixed(1)}%</TableCell>
                          <TableCell>percentage</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Mean Patch Size</TableCell>
                          <TableCell align="right">{fragResults.mean_patch_size}</TableCell>
                          <TableCell>hectares</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Patch Density</TableCell>
                          <TableCell align="right">{fragResults.patch_density}</TableCell>
                          <TableCell>patches/100ha</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Edge Density</TableCell>
                          <TableCell align="right">{fragResults.edge_density}</TableCell>
                          <TableCell>m/ha</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Mean Shape Index</TableCell>
                          <TableCell align="right">{fragResults.mean_shape_index}</TableCell>
                          <TableCell>ratio</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Fragmentation Index</strong></TableCell>
                          <TableCell align="right"><strong>{fragResults.fragmentation_index}</strong></TableCell>
                          <TableCell><strong>0-1 scale</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateFragmentation}
                disabled={fragLoading}
                startIcon={fragLoading ? <CircularProgress size={20} /> : <Assessment />}
              >
                {fragLoading ? 'Calculating...' : 'Calculate Metrics'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HabitatLandscape;