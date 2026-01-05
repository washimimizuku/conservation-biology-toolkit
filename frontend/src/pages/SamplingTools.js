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
  CircularProgress,
  Chip
} from '@mui/material';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { Footer } from '../components';

const SamplingTools = () => {
  // Sample Size Calculator state
  const [sampleSizeData, setSampleSizeData] = useState({
    population_size: '', // Optional - leave empty for infinite population
    expected_proportion: '0.5',
    margin_of_error: '0.05',
    confidence_level: '0.95'
  });
  const [sampleSizeResult, setSampleSizeResult] = useState(null);
  const [sampleSizeLoading, setSampleSizeLoading] = useState(false);
  const [sampleSizeError, setSampleSizeError] = useState(null);

  // Detection Probability state
  const [detectionData, setDetectionData] = useState({
    detections: '15',
    surveys: '20',
    confidence_level: '0.95'
  });
  const [detectionResult, setDetectionResult] = useState(null);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [detectionError, setDetectionError] = useState(null);

  // Capture-Recapture state
  const [captureData, setCaptureData] = useState({
    marked_first_sample: '50',
    total_second_sample: '40',
    marked_in_second: '8'
  });
  const [captureResult, setCaptureResult] = useState(null);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [captureError, setCaptureError] = useState(null);

  // Distance Sampling state
  const [distanceData, setDistanceData] = useState({
    distances: '5.2,12.1,8.7,15.3,3.4,9.8,18.2,6.5',
    transect_length: '1000',
    transect_width: '25'
  });
  const [distanceResult, setDistanceResult] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState(null);

  const handleSampleSizeSubmit = async (e) => {
    e.preventDefault();
    setSampleSizeLoading(true);
    setSampleSizeError(null);

    try {
      const payload = {
        population_size: sampleSizeData.population_size ? parseInt(sampleSizeData.population_size) : null,
        expected_proportion: parseFloat(sampleSizeData.expected_proportion),
        margin_of_error: parseFloat(sampleSizeData.margin_of_error),
        confidence_level: parseFloat(sampleSizeData.confidence_level)
      };

      const response = await axios.post(`${API_URLS.samplingSurvey}/sample-size`, payload);
      setSampleSizeResult(response.data);
    } catch (error) {
      setSampleSizeError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setSampleSizeLoading(false);
    }
  };

  const handleDetectionSubmit = async (e) => {
    e.preventDefault();
    setDetectionLoading(true);
    setDetectionError(null);

    try {
      const payload = {
        detections: parseInt(detectionData.detections),
        surveys: parseInt(detectionData.surveys),
        confidence_level: parseFloat(detectionData.confidence_level)
      };

      const response = await axios.post(`${API_URLS.samplingSurvey}/detection-probability`, payload);
      setDetectionResult(response.data);
    } catch (error) {
      setDetectionError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setDetectionLoading(false);
    }
  };

  const handleCaptureSubmit = async (e) => {
    e.preventDefault();
    setCaptureLoading(true);
    setCaptureError(null);

    try {
      const payload = {
        marked_first_sample: parseInt(captureData.marked_first_sample),
        total_second_sample: parseInt(captureData.total_second_sample),
        marked_in_second: parseInt(captureData.marked_in_second)
      };

      const response = await axios.post(`${API_URLS.samplingSurvey}/capture-recapture`, payload);
      setCaptureResult(response.data);
    } catch (error) {
      setCaptureError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setCaptureLoading(false);
    }
  };

  const handleDistanceSubmit = async (e) => {
    e.preventDefault();
    setDistanceLoading(true);
    setDistanceError(null);

    try {
      const payload = {
        distances: distanceData.distances.split(',').map(x => parseFloat(x.trim())),
        transect_length: parseFloat(distanceData.transect_length),
        transect_width: parseFloat(distanceData.transect_width)
      };

      const response = await axios.post(`${API_URLS.samplingSurvey}/distance-sampling`, payload);
      setDistanceResult(response.data);
    } catch (error) {
      setDistanceError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setDistanceLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        📋 Sampling & Survey Design Tools
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Statistical tools for designing effective wildlife surveys and analyzing sampling data 
        to ensure robust population estimates.
      </Typography>

      <Grid container spacing={4}>
        {/* Sample Size Calculator */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Sample Size Calculator
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Determine the optimal sample size needed for population surveys with specified precision.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Sample_size_determination" target="_blank" rel="noopener noreferrer">
                  Sample Size Determination (Wikipedia)
                </a>{' '}•{' '}
                Cochran, W.G. (1977). <em>Sampling Techniques</em>. 3rd ed. John Wiley & Sons
              </Typography>

              <Box component="form" onSubmit={handleSampleSizeSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Population Size (optional)"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={sampleSizeData.population_size}
                  onChange={(e) => setSampleSizeData({...sampleSizeData, population_size: e.target.value})}
                  margin="normal"
                  helperText="Leave empty for infinite population"
                />
                <TextField
                  fullWidth
                  label="Expected Proportion"
                  type="number"
                  step="0.01"
                  inputProps={{ min: 0.01, max: 0.99, step: 0.01 }}
                  value={sampleSizeData.expected_proportion}
                  onChange={(e) => setSampleSizeData({...sampleSizeData, expected_proportion: e.target.value})}
                  margin="normal"
                  helperText="Expected proportion of target characteristic (0.5 for maximum variance)"
                  required
                />
                <TextField
                  fullWidth
                  label="Margin of Error"
                  type="number"
                  step="0.001"
                  inputProps={{ min: 0.001, max: 0.5, step: 0.001 }}
                  value={sampleSizeData.margin_of_error}
                  onChange={(e) => setSampleSizeData({...sampleSizeData, margin_of_error: e.target.value})}
                  margin="normal"
                  helperText="Desired precision (e.g., 0.05 for ±5%)"
                  required
                />
                <TextField
                  fullWidth
                  label="Confidence Level"
                  type="number"
                  step="0.01"
                  inputProps={{ min: 0.50, max: 0.999, step: 0.01 }}
                  value={sampleSizeData.confidence_level}
                  onChange={(e) => setSampleSizeData({...sampleSizeData, confidence_level: e.target.value})}
                  margin="normal"
                  helperText="Confidence level (e.g., 0.95 for 95%)"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(45deg, #00BCD4 30%, #4DD0E1 90%)',
                    boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0097A7 30%, #00BCD4 90%)',
                      boxShadow: '0 4px 8px 3px rgba(0, 188, 212, .4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  disabled={sampleSizeLoading}
                >
                  {sampleSizeLoading ? <CircularProgress size={24} /> : 'Calculate Sample Size'}
                </Button>
              </Box>

              {sampleSizeError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {sampleSizeError}
                </Alert>
              )}

              {sampleSizeResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Required Sample Size: <strong>{sampleSizeResult.sample_size}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Margin of Error: <strong>±{(sampleSizeResult.margin_of_error * 100).toFixed(1)}%</strong>
                  </Typography>
                  <Typography variant="body2">
                    Confidence Level: <strong>{(sampleSizeResult.confidence_level * 100).toFixed(0)}%</strong>
                  </Typography>
                  {sampleSizeResult.finite_population_correction && (
                    <Chip 
                      label="Finite Population Correction Applied" 
                      color="info" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Detection Probability Calculator */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Detection Probability
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Estimate species detection probability from survey data to account for imperfect detection.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Occupancy%E2%80%93detection_model" target="_blank" rel="noopener noreferrer">
                  Occupancy-Detection Models (Wikipedia)
                </a>{' '}•{' '}
                MacKenzie, D.I. et al. (2002). Estimating site occupancy rates when detection probabilities are less than one. <em>Ecology</em> 83: 2248-2255
              </Typography>

              <Box component="form" onSubmit={handleDetectionSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Number of Detections"
                  type="number"
                  step="1"
                  inputProps={{ min: 0 }}
                  value={detectionData.detections}
                  onChange={(e) => setDetectionData({...detectionData, detections: e.target.value})}
                  margin="normal"
                  helperText="Times species was detected"
                  required
                />
                <TextField
                  fullWidth
                  label="Total Surveys"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={detectionData.surveys}
                  onChange={(e) => setDetectionData({...detectionData, surveys: e.target.value})}
                  margin="normal"
                  helperText="Total number of survey occasions"
                  required
                />
                <TextField
                  fullWidth
                  label="Confidence Level"
                  type="number"
                  step="0.01"
                  inputProps={{ min: 0.50, max: 0.999, step: 0.01 }}
                  value={detectionData.confidence_level}
                  onChange={(e) => setDetectionData({...detectionData, confidence_level: e.target.value})}
                  margin="normal"
                  helperText="Confidence level for intervals"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(45deg, #00BCD4 30%, #4DD0E1 90%)',
                    boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0097A7 30%, #00BCD4 90%)',
                      boxShadow: '0 4px 8px 3px rgba(0, 188, 212, .4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  disabled={detectionLoading}
                >
                  {detectionLoading ? <CircularProgress size={24} /> : 'Calculate Detection Probability'}
                </Button>
              </Box>

              {detectionError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {detectionError}
                </Alert>
              )}

              {detectionResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Detection Probability: <strong>{(detectionResult.detection_probability * 100).toFixed(1)}%</strong>
                  </Typography>
                  <Typography variant="body2">
                    95% Confidence Interval: {' '}
                    <strong>
                      {(detectionResult.confidence_interval_lower * 100).toFixed(1)}% - {' '}
                      {(detectionResult.confidence_interval_upper * 100).toFixed(1)}%
                    </strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Based on {detectionResult.detections} detections in {detectionResult.surveys} surveys
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Capture-Recapture Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Capture-Recapture Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Estimate population size using Lincoln-Petersen method from mark-recapture data.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Mark_and_recapture" target="_blank" rel="noopener noreferrer">
                  Mark and Recapture (Wikipedia)
                </a>{' '}•{' '}
                Lincoln, F.C. (1930). Calculating waterfowl abundance on the basis of banding returns. <em>USDA Circular</em> 118: 1-4
              </Typography>

              <Box component="form" onSubmit={handleCaptureSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Marked in First Sample (M)"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={captureData.marked_first_sample}
                  onChange={(e) => setCaptureData({...captureData, marked_first_sample: e.target.value})}
                  margin="normal"
                  helperText="Number of individuals marked and released"
                  required
                />
                <TextField
                  fullWidth
                  label="Total in Second Sample (C)"
                  type="number"
                  step="1"
                  inputProps={{ min: 1 }}
                  value={captureData.total_second_sample}
                  onChange={(e) => setCaptureData({...captureData, total_second_sample: e.target.value})}
                  margin="normal"
                  helperText="Total individuals caught in second sample"
                  required
                />
                <TextField
                  fullWidth
                  label="Marked in Second Sample (R)"
                  type="number"
                  step="1"
                  inputProps={{ min: 0 }}
                  value={captureData.marked_in_second}
                  onChange={(e) => setCaptureData({...captureData, marked_in_second: e.target.value})}
                  margin="normal"
                  helperText="Number of marked individuals recaptured"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(45deg, #00BCD4 30%, #4DD0E1 90%)',
                    boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0097A7 30%, #00BCD4 90%)',
                      boxShadow: '0 4px 8px 3px rgba(0, 188, 212, .4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  disabled={captureLoading}
                >
                  {captureLoading ? <CircularProgress size={24} /> : 'Estimate Population'}
                </Button>
              </Box>

              {captureError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {captureError}
                </Alert>
              )}

              {captureResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Population Estimate: <strong>{Math.round(captureResult.population_estimate)}</strong>
                  </Typography>
                  <Typography variant="body2">
                    95% Confidence Interval: {' '}
                    <strong>
                      {Math.round(captureResult.confidence_interval_lower)} - {' '}
                      {Math.round(captureResult.confidence_interval_upper)}
                    </strong>
                  </Typography>
                  <Typography variant="body2">
                    Standard Error: <strong>{captureResult.standard_error.toFixed(1)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Lincoln-Petersen formula: N = (M × C) / R
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Distance Sampling */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Distance Sampling
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Estimate animal density from line transect surveys using distance sampling methods.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Distance_sampling" target="_blank" rel="noopener noreferrer">
                  Distance Sampling (Wikipedia)
                </a>{' '}•{' '}
                Buckland, S.T. et al. (2001). <em>Introduction to Distance Sampling</em>. Oxford University Press
              </Typography>

              <Box component="form" onSubmit={handleDistanceSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Perpendicular Distances"
                  value={distanceData.distances}
                  onChange={(e) => setDistanceData({...distanceData, distances: e.target.value})}
                  margin="normal"
                  helperText="Comma-separated distances to detected animals (meters)"
                  required
                />
                <TextField
                  fullWidth
                  label="Transect Length"
                  type="number"
                  step="0.1"
                  value={distanceData.transect_length}
                  onChange={(e) => setDistanceData({...distanceData, transect_length: e.target.value})}
                  margin="normal"
                  helperText="Total length of transect(s) in meters"
                  required
                />
                <TextField
                  fullWidth
                  label="Transect Half-Width"
                  type="number"
                  step="0.1"
                  value={distanceData.transect_width}
                  onChange={(e) => setDistanceData({...distanceData, transect_width: e.target.value})}
                  margin="normal"
                  helperText="Maximum detection distance from transect line"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(45deg, #00BCD4 30%, #4DD0E1 90%)',
                    boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0097A7 30%, #00BCD4 90%)',
                      boxShadow: '0 4px 8px 3px rgba(0, 188, 212, .4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  disabled={distanceLoading}
                >
                  {distanceLoading ? <CircularProgress size={24} /> : 'Estimate Density'}
                </Button>
              </Box>

              {distanceError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {distanceError}
                </Alert>
              )}

              {distanceResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography variant="body2">
                    Density Estimate: <strong>{distanceResult.density_estimate.toFixed(6)} animals/m²</strong>
                  </Typography>
                  <Typography variant="body2">
                    Effective Strip Width: <strong>{distanceResult.effective_strip_width.toFixed(1)} m</strong>
                  </Typography>
                  <Typography variant="body2">
                    Encounter Rate: <strong>{distanceResult.encounter_rate.toFixed(4)} detections/m</strong>
                  </Typography>
                  <Typography variant="body2">
                    Total Detections: <strong>{distanceResult.total_detections}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Half-normal detection function used
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Footer />
    </Container>
  );
};

export default SamplingTools;