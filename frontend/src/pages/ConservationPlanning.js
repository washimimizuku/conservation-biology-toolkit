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
  Divider,
  Slider
} from '@mui/material';
import { 
  Assessment, 
  Security, 
  AttachMoney, 
  LocationOn,
  Add as AddIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { API_URLS } from '../config/api';

const ConservationPlanning = () => {
  // Conservation Priority State
  const [prioritySites, setPrioritySites] = useState([
    { name: 'Site A', biodiversity: '0.8', threat: '0.3', feasibility: '0.9', cost: '100' },
    { name: 'Site B', biodiversity: '0.6', threat: '0.7', feasibility: '0.5', cost: '150' },
    { name: 'Site C', biodiversity: '0.9', threat: '0.2', feasibility: '0.8', cost: '120' }
  ]);
  const [priorityWeights, setPriorityWeights] = useState({
    biodiversity: 0.4,
    threat: 0.3,
    feasibility: 0.2,
    cost: 0.1
  });
  const [priorityResults, setPriorityResults] = useState(null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityError, setPriorityError] = useState('');

  // Threat Assessment State
  const [threats, setThreats] = useState([
    { name: 'Habitat Loss', severity: '0.8', scope: '0.6', urgency: '0.7' },
    { name: 'Climate Change', severity: '0.7', scope: '0.9', urgency: '0.5' },
    { name: 'Invasive Species', severity: '0.5', scope: '0.4', urgency: '0.8' }
  ]);
  const [speciesVulnerability, setSpeciesVulnerability] = useState([
    { species: 'Species A', vulnerability: '0.8' },
    { species: 'Species B', vulnerability: '0.6' },
    { species: 'Species C', vulnerability: '0.9' }
  ]);
  const [threatResults, setThreatResults] = useState(null);
  const [threatLoading, setThreatLoading] = useState(false);
  const [threatError, setThreatError] = useState('');

  // Cost-Effectiveness State
  const [actions, setActions] = useState([
    { name: 'Habitat Restoration', cost: '50000', benefit: '150000' },
    { name: 'Species Monitoring', cost: '25000', benefit: '75000' },
    { name: 'Community Outreach', cost: '15000', benefit: '45000' }
  ]);
  const [budget, setBudget] = useState('100000');
  const [costResults, setCostResults] = useState(null);
  const [costLoading, setCostLoading] = useState(false);
  const [costError, setCostError] = useState('');

  // Reserve Selection State
  const [reserveSites, setReserveSites] = useState([
    { name: 'Reserve A', cost: '10000', species: 'Species 1,Species 2' },
    { name: 'Reserve B', cost: '15000', species: 'Species 2,Species 3' },
    { name: 'Reserve C', cost: '8000', species: 'Species 1,Species 3' },
    { name: 'Reserve D', cost: '20000', species: 'Species 1,Species 2,Species 3' }
  ]);
  const [speciesTargets, setSpeciesTargets] = useState([
    { species: 'Species 1', target: '2' },
    { species: 'Species 2', target: '1' },
    { species: 'Species 3', target: '1' }
  ]);
  const [reserveBudget, setReserveBudget] = useState('30000');
  const [reserveResults, setReserveResults] = useState(null);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState('');

  // Priority Analysis Functions
  const addPrioritySite = () => {
    setPrioritySites([...prioritySites, { name: '', biodiversity: '0.5', threat: '0.5', feasibility: '0.5', cost: '100' }]);
  };

  const removePrioritySite = (index) => {
    if (prioritySites.length > 2) {
      setPrioritySites(prioritySites.filter((_, i) => i !== index));
    }
  };

  const updatePrioritySite = (index, field, value) => {
    const updated = [...prioritySites];
    updated[index][field] = value;
    setPrioritySites(updated);
  };

  const updatePriorityWeight = (criterion, value) => {
    setPriorityWeights(prev => ({ ...prev, [criterion]: value }));
  };

  const analyzePriority = async () => {
    setPriorityLoading(true);
    setPriorityError('');
    
    try {
      // Normalize weights to sum to 1
      const totalWeight = Object.values(priorityWeights).reduce((sum, w) => sum + w, 0);
      const normalizedWeights = {};
      Object.keys(priorityWeights).forEach(key => {
        normalizedWeights[key] = priorityWeights[key] / totalWeight;
      });

      const sites = prioritySites.map(site => ({
        name: site.name || 'Unnamed Site',
        biodiversity: parseFloat(site.biodiversity) || 0,
        threat: parseFloat(site.threat) || 0,
        feasibility: parseFloat(site.feasibility) || 0,
        cost: parseFloat(site.cost) || 0
      }));

      const response = await axios.post(`${API_URLS.conservationPlanning}/conservation-priority`, {
        sites,
        weights: normalizedWeights
      });
      
      setPriorityResults(response.data);
    } catch (error) {
      setPriorityError(error.response?.data?.detail || error.message || 'Analysis failed');
    } finally {
      setPriorityLoading(false);
    }
  };

  // Threat Assessment Functions
  const addThreat = () => {
    setThreats([...threats, { name: '', severity: '0.5', scope: '0.5', urgency: '0.5' }]);
  };

  const removeThreat = (index) => {
    if (threats.length > 1) {
      setThreats(threats.filter((_, i) => i !== index));
    }
  };

  const updateThreat = (index, field, value) => {
    const updated = [...threats];
    updated[index][field] = value;
    setThreats(updated);
  };

  const addSpeciesVulnerability = () => {
    setSpeciesVulnerability([...speciesVulnerability, { species: '', vulnerability: '0.5' }]);
  };

  const removeSpeciesVulnerability = (index) => {
    if (speciesVulnerability.length > 1) {
      setSpeciesVulnerability(speciesVulnerability.filter((_, i) => i !== index));
    }
  };

  const updateSpeciesVulnerability = (index, field, value) => {
    const updated = [...speciesVulnerability];
    updated[index][field] = value;
    setSpeciesVulnerability(updated);
  };

  const analyzeThreat = async () => {
    setThreatLoading(true);
    setThreatError('');
    
    try {
      const threatData = threats.map(threat => ({
        name: threat.name || 'Unnamed Threat',
        severity: parseFloat(threat.severity) || 0,
        scope: parseFloat(threat.scope) || 0,
        urgency: parseFloat(threat.urgency) || 0
      }));

      const vulnerabilityData = {};
      speciesVulnerability.forEach(sv => {
        if (sv.species) {
          vulnerabilityData[sv.species] = parseFloat(sv.vulnerability) || 0;
        }
      });

      const response = await axios.post(`${API_URLS.conservationPlanning}/threat-assessment`, {
        threats: threatData,
        species_vulnerability: vulnerabilityData
      });
      
      setThreatResults(response.data);
    } catch (error) {
      setThreatError(error.response?.data?.detail || error.message || 'Analysis failed');
    } finally {
      setThreatLoading(false);
    }
  };

  // Cost-Effectiveness Functions
  const addAction = () => {
    setActions([...actions, { name: '', cost: '10000', benefit: '30000' }]);
  };

  const removeAction = (index) => {
    if (actions.length > 2) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index, field, value) => {
    const updated = [...actions];
    updated[index][field] = value;
    setActions(updated);
  };

  const analyzeCostEffectiveness = async () => {
    setCostLoading(true);
    setCostError('');
    
    try {
      const actionData = actions.map(action => ({
        name: action.name || 'Unnamed Action',
        cost: parseFloat(action.cost) || 0,
        benefit: parseFloat(action.benefit) || 0
      }));

      const response = await axios.post(`${API_URLS.conservationPlanning}/cost-effectiveness`, {
        actions: actionData,
        budget_constraint: parseFloat(budget) || 0
      });
      
      setCostResults(response.data);
    } catch (error) {
      setCostError(error.response?.data?.detail || error.message || 'Analysis failed');
    } finally {
      setCostLoading(false);
    }
  };

  // Reserve Selection Functions
  const addReserveSite = () => {
    setReserveSites([...reserveSites, { name: '', cost: '10000', species: '' }]);
  };

  const removeReserveSite = (index) => {
    if (reserveSites.length > 2) {
      setReserveSites(reserveSites.filter((_, i) => i !== index));
    }
  };

  const updateReserveSite = (index, field, value) => {
    const updated = [...reserveSites];
    updated[index][field] = value;
    setReserveSites(updated);
  };

  const addSpeciesTarget = () => {
    setSpeciesTargets([...speciesTargets, { species: '', target: '1' }]);
  };

  const removeSpeciesTarget = (index) => {
    if (speciesTargets.length > 1) {
      setSpeciesTargets(speciesTargets.filter((_, i) => i !== index));
    }
  };

  const updateSpeciesTarget = (index, field, value) => {
    const updated = [...speciesTargets];
    updated[index][field] = value;
    setSpeciesTargets(updated);
  };

  const analyzeReserveSelection = async () => {
    setReserveLoading(true);
    setReserveError('');
    
    try {
      const siteData = reserveSites.map(site => ({
        name: site.name || 'Unnamed Site',
        cost: parseFloat(site.cost) || 0,
        species: site.species ? site.species.split(',').map(s => s.trim()).filter(s => s) : []
      }));

      const targetData = {};
      speciesTargets.forEach(st => {
        if (st.species) {
          targetData[st.species] = parseInt(st.target) || 1;
        }
      });

      const payload = {
        sites: siteData,
        species_targets: targetData
      };

      if (reserveBudget && parseFloat(reserveBudget) > 0) {
        payload.budget_limit = parseFloat(reserveBudget);
      }

      const response = await axios.post(`${API_URLS.conservationPlanning}/reserve-selection`, payload);
      
      setReserveResults(response.data);
    } catch (error) {
      setReserveError(error.response?.data?.detail || error.message || 'Analysis failed');
    } finally {
      setReserveLoading(false);
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'info';
    if (score >= 0.4) return 'warning';
    return 'error';
  };

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
          Conservation Planning
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Systematic conservation planning tools for prioritization, threat assessment, and resource optimization
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Conservation Priority Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Conservation Priority Analysis
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Multi-criteria decision analysis for site prioritization using weighted scoring.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1038/35012251" target="_blank" rel="noopener noreferrer">
                  Margules & Pressey (2000) Nature
                </a>
                {', '}
                <a href="https://doi.org/10.1111/brv.12008" target="_blank" rel="noopener noreferrer">
                  Kukkala & Moilanen (2013) Biol. Rev.
                </a>
                {', '}
                <a href="https://global.oup.com/academic/product/spatial-conservation-prioritization-9780199547760" target="_blank" rel="noopener noreferrer">
                  Moilanen et al. (2009) Oxford Press
                </a>
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Sites to Evaluate:
              </Typography>
              {prioritySites.map((site, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Site Name"
                        value={site.name}
                        onChange={(e) => updatePrioritySite(index, 'name', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        label="Biodiversity"
                        type="number"
                        value={site.biodiversity}
                        onChange={(e) => updatePrioritySite(index, 'biodiversity', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        label="Threat Level"
                        type="number"
                        value={site.threat}
                        onChange={(e) => updatePrioritySite(index, 'threat', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        label="Feasibility"
                        type="number"
                        value={site.feasibility}
                        onChange={(e) => updatePrioritySite(index, 'feasibility', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        label="Cost"
                        type="number"
                        value={site.cost}
                        onChange={(e) => updatePrioritySite(index, 'cost', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        onClick={() => removePrioritySite(index)}
                        size="small"
                        color="error"
                        disabled={prioritySites.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addPrioritySite}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Add Site
              </Button>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Criteria Weights:
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(priorityWeights).map(([criterion, weight]) => (
                  <Grid item xs={6} key={criterion}>
                    <Typography variant="body2" gutterBottom>
                      {criterion.charAt(0).toUpperCase() + criterion.slice(1)}: {weight.toFixed(2)}
                    </Typography>
                    <Slider
                      value={weight}
                      onChange={(e, value) => updatePriorityWeight(criterion, value)}
                      min={0}
                      max={1}
                      step={0.05}
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>

              {priorityError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {priorityError}
                </Alert>
              )}

              {priorityResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Site</TableCell>
                          <TableCell align="right">Priority Score</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {priorityResults.site_rankings.map((site, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{site.name}</TableCell>
                            <TableCell align="right">{site.total_score}</TableCell>
                            <TableCell>
                              <Chip 
                                label={site.total_score >= 0.7 ? 'High Priority' : 
                                       site.total_score >= 0.4 ? 'Medium Priority' : 'Low Priority'}
                                color={getPriorityColor(site.total_score)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {priorityResults.recommendations && priorityResults.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                      {priorityResults.recommendations.map((rec, index) => (
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
                onClick={analyzePriority}
                disabled={priorityLoading}
                startIcon={priorityLoading ? <CircularProgress size={20} /> : <Assessment />}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63 30%, #F06292 90%)',
                  boxShadow: '0 3px 5px 2px rgba(233, 30, 99, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #C2185B 30%, #E91E63 90%)',
                    boxShadow: '0 4px 8px 3px rgba(233, 30, 99, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {priorityLoading ? 'Analyzing...' : 'Analyze Priority'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Threat Assessment Matrix */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Threat Assessment Matrix
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Systematic threat evaluation using severity, scope, and urgency criteria.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1111/j.1523-1739.2008.00937.x" target="_blank" rel="noopener noreferrer">
                  Salafsky et al. (2008) Conserv. Biol.
                </a>
                {', '}
                <a href="https://www.iucnredlist.org/resources/threat-classification-scheme" target="_blank" rel="noopener noreferrer">
                  IUCN Threat Classification
                </a>
                {', '}
                <a href="https://doi.org/10.1038/s41586-020-2773-z" target="_blank" rel="noopener noreferrer">
                  Maxwell et al. (2020) Nature
                </a>
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Threats:
              </Typography>
              {threats.map((threat, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Threat Name"
                        value={threat.name}
                        onChange={(e) => updateThreat(index, 'name', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        label="Severity"
                        type="number"
                        value={threat.severity}
                        onChange={(e) => updateThreat(index, 'severity', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        label="Scope"
                        type="number"
                        value={threat.scope}
                        onChange={(e) => updateThreat(index, 'scope', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        label="Urgency"
                        type="number"
                        value={threat.urgency}
                        onChange={(e) => updateThreat(index, 'urgency', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        onClick={() => removeThreat(index)}
                        size="small"
                        color="error"
                        disabled={threats.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addThreat}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Add Threat
              </Button>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Species Vulnerability:
              </Typography>
              {speciesVulnerability.map((sv, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    size="small"
                    label="Species Name"
                    value={sv.species}
                    onChange={(e) => updateSpeciesVulnerability(index, 'species', e.target.value)}
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Vulnerability"
                    type="number"
                    value={sv.vulnerability}
                    onChange={(e) => updateSpeciesVulnerability(index, 'vulnerability', e.target.value)}
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                    sx={{ width: 120, mr: 1 }}
                  />
                  <IconButton
                    onClick={() => removeSpeciesVulnerability(index)}
                    size="small"
                    color="error"
                    disabled={speciesVulnerability.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addSpeciesVulnerability}
                size="small"
                variant="outlined"
              >
                Add Species
              </Button>

              {threatError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {threatError}
                </Alert>
              )}

              {threatResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <Paper sx={{ p: 2, mb: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Overall Threat Score</Typography>
                    <Typography variant="h5">{(threatResults.overall_threat_score * 100).toFixed(1)}%</Typography>
                    <Chip 
                      label={threatResults.overall_threat_score > 0.7 ? 'High Threat' : 
                             threatResults.overall_threat_score > 0.4 ? 'Moderate Threat' : 'Low Threat'}
                      color={getRiskColor(threatResults.overall_threat_score > 0.7 ? 'High' : 
                                         threatResults.overall_threat_score > 0.4 ? 'Moderate' : 'Low')}
                    />
                  </Paper>

                  <Typography variant="subtitle2" gutterBottom>Priority Threats:</Typography>
                  {threatResults.priority_threats.map((threat, index) => (
                    <Chip key={index} label={threat} sx={{ mr: 1, mb: 1 }} />
                  ))}
                  
                  {threatResults.mitigation_strategies && threatResults.mitigation_strategies.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Mitigation Strategies:</Typography>
                      {threatResults.mitigation_strategies.map((strategy, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {strategy}
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
                onClick={analyzeThreat}
                disabled={threatLoading}
                startIcon={threatLoading ? <CircularProgress size={20} /> : <Security />}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63 30%, #F06292 90%)',
                  boxShadow: '0 3px 5px 2px rgba(233, 30, 99, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #C2185B 30%, #E91E63 90%)',
                    boxShadow: '0 4px 8px 3px rgba(233, 30, 99, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {threatLoading ? 'Analyzing...' : 'Analyze Threats'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Cost-Effectiveness Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Cost-Effectiveness Analysis
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Optimize conservation investment by ranking actions and selecting efficient portfolios.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1126/science.279.5359.2126" target="_blank" rel="noopener noreferrer">
                  Ando et al. (1998) Science
                </a>
                {', '}
                <a href="https://doi.org/10.1016/j.tree.2006.10.003" target="_blank" rel="noopener noreferrer">
                  Naidoo et al. (2006) TREE
                </a>
                {', '}
                <a href="https://doi.org/10.1016/j.biocon.2006.12.017" target="_blank" rel="noopener noreferrer">
                  Murdoch et al. (2007) Biol. Conserv.
                </a>
              </Typography>

              <TextField
                fullWidth
                label="Available Budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Conservation Actions:
              </Typography>
              {actions.map((action, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Action Name"
                        value={action.name}
                        onChange={(e) => updateAction(index, 'name', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Cost"
                        type="number"
                        value={action.cost}
                        onChange={(e) => updateAction(index, 'cost', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Benefit"
                        type="number"
                        value={action.benefit}
                        onChange={(e) => updateAction(index, 'benefit', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton
                        onClick={() => removeAction(index)}
                        size="small"
                        color="error"
                        disabled={actions.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addAction}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Add Action
              </Button>

              {costError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {costError}
                </Alert>
              )}

              {costResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                        <Typography variant="h6">${costResults.total_cost.toLocaleString()}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Benefit</Typography>
                        <Typography variant="h6">${costResults.total_benefit.toLocaleString()}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Efficiency Ratio</Typography>
                        <Typography variant="h6">{costResults.efficiency_ratio.toFixed(2)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Budget Used</Typography>
                        <Typography variant="h6">{costResults.budget_utilization}%</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" gutterBottom>Optimal Portfolio:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Action</TableCell>
                          <TableCell align="right">Cost</TableCell>
                          <TableCell align="right">Benefit</TableCell>
                          <TableCell align="right">CE Ratio</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {costResults.optimal_portfolio.map((action, index) => (
                          <TableRow key={index}>
                            <TableCell>{action.name}</TableCell>
                            <TableCell align="right">${action.cost.toLocaleString()}</TableCell>
                            <TableCell align="right">${action.benefit.toLocaleString()}</TableCell>
                            <TableCell align="right">{action.ce_ratio.toFixed(3)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {costResults.recommendations && costResults.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                      {costResults.recommendations.map((rec, index) => (
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
                onClick={analyzeCostEffectiveness}
                disabled={costLoading}
                startIcon={costLoading ? <CircularProgress size={20} /> : <AttachMoney />}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63 30%, #F06292 90%)',
                  boxShadow: '0 3px 5px 2px rgba(233, 30, 99, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #C2185B 30%, #E91E63 90%)',
                    boxShadow: '0 4px 8px 3px rgba(233, 30, 99, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {costLoading ? 'Analyzing...' : 'Analyze Cost-Effectiveness'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Reserve Selection Optimization */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Reserve Selection Optimization
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Optimize reserve selection using set cover algorithms to achieve species representation targets.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                <strong>References:</strong>{' '}
                <a href="https://doi.org/10.1016/0006-3207(83)90056-4" target="_blank" rel="noopener noreferrer">
                  Kirkpatrick (1983) Biol. Conserv.
                </a>
                {', '}
                <a href="https://doi.org/10.1016/0169-5347(93)90023-I" target="_blank" rel="noopener noreferrer">
                  Pressey et al. (1993) TREE
                </a>
                {', '}
                <a href="https://doi.org/10.1038/nature02422" target="_blank" rel="noopener noreferrer">
                  Rodrigues et al. (2004) Nature
                </a>
              </Typography>

              <TextField
                fullWidth
                label="Budget Limit (optional)"
                type="number"
                value={reserveBudget}
                onChange={(e) => setReserveBudget(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Candidate Sites:
              </Typography>
              {reserveSites.map((site, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Site Name"
                        value={site.name}
                        onChange={(e) => updateReserveSite(index, 'name', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Cost"
                        type="number"
                        value={site.cost}
                        onChange={(e) => updateReserveSite(index, 'cost', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <TextField
                        fullWidth
                        label="Species (comma-separated)"
                        value={site.species}
                        onChange={(e) => updateReserveSite(index, 'species', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        onClick={() => removeReserveSite(index)}
                        size="small"
                        color="error"
                        disabled={reserveSites.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addReserveSite}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Add Site
              </Button>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Species Targets:
              </Typography>
              {speciesTargets.map((target, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    size="small"
                    label="Species Name"
                    value={target.species}
                    onChange={(e) => updateSpeciesTarget(index, 'species', e.target.value)}
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Target"
                    type="number"
                    value={target.target}
                    onChange={(e) => updateSpeciesTarget(index, 'target', e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={{ width: 100, mr: 1 }}
                  />
                  <IconButton
                    onClick={() => removeSpeciesTarget(index)}
                    size="small"
                    color="error"
                    disabled={speciesTargets.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addSpeciesTarget}
                size="small"
                variant="outlined"
              >
                Add Target
              </Button>

              {reserveError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {reserveError}
                </Alert>
              )}

              {reserveResults && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Results</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Sites Selected</Typography>
                        <Typography variant="h6">{reserveResults.selected_sites.length}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                        <Typography variant="h6">${reserveResults.total_cost.toLocaleString()}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Average Coverage</Typography>
                        <Typography variant="h6">{reserveResults.coverage_summary.average_coverage}%</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Fully Covered Species</Typography>
                        <Typography variant="h6">{reserveResults.coverage_summary.fully_covered_species}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" gutterBottom>Selected Sites:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Site</TableCell>
                          <TableCell align="right">Cost</TableCell>
                          <TableCell>Species</TableCell>
                          <TableCell align="right">Efficiency</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reserveResults.selected_sites.map((site, index) => (
                          <TableRow key={index}>
                            <TableCell>{site.name}</TableCell>
                            <TableCell align="right">${site.cost.toLocaleString()}</TableCell>
                            <TableCell>{site.species.join(', ')}</TableCell>
                            <TableCell align="right">{site.efficiency}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {reserveResults.recommendations && reserveResults.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                      {reserveResults.recommendations.map((rec, index) => (
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
                onClick={analyzeReserveSelection}
                disabled={reserveLoading}
                startIcon={reserveLoading ? <CircularProgress size={20} /> : <LocationOn />}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63 30%, #F06292 90%)',
                  boxShadow: '0 3px 5px 2px rgba(233, 30, 99, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #C2185B 30%, #E91E63 90%)',
                    boxShadow: '0 4px 8px 3px rgba(233, 30, 99, .4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {reserveLoading ? 'Optimizing...' : 'Optimize Selection'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>


    </Container>
  );
};

export default ConservationPlanning;