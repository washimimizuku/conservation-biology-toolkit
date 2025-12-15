import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
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
  CircularProgress
} from '@mui/material';
import { Biotech, Science, Analytics, TrendingUp } from '@mui/icons-material';
import axios from 'axios';
import { API_URLS } from '../config/api';

const GeneticTools = () => {
  // Hardy-Weinberg State
  const [hwGenotypes, setHwGenotypes] = useState('AA:25,AB:50,BB:25');
  const [hwResults, setHwResults] = useState(null);
  const [hwLoading, setHwLoading] = useState(false);

  // Inbreeding Coefficient State
  const [inbreedingData, setInbreedingData] = useState({
    subpopHeterozygosity: '0.4,0.35,0.42',
    totalHeterozygosity: '0.35',
    expectedHeterozygosity: '0.5'
  });
  const [inbreedingResults, setInbreedingResults] = useState(null);
  const [inbreedingLoading, setInbreedingLoading] = useState(false);

  // Bottleneck Detection State
  const [populationSizes, setPopulationSizes] = useState('1000,900,50,100,200,400');
  const [bottleneckResults, setBottleneckResults] = useState(null);
  const [bottleneckLoading, setBottleneckLoading] = useState(false);

  // Allelic Richness State
  const [alleleCounts, setAlleleCounts] = useState('5,8,6,7');
  const [sampleSizes, setSampleSizes] = useState('50,50,50,50');
  const [richnessResults, setRichnessResults] = useState(null);
  const [richnessLoading, setRichnessLoading] = useState(false);

  // Error states
  const [hwError, setHwError] = useState('');
  const [inbreedingError, setInbreedingError] = useState('');
  const [bottleneckError, setBottleneckError] = useState('');
  const [richnessError, setRichnessError] = useState('');

  // Hardy-Weinberg Equilibrium Test
  const calculateHardyWeinberg = async () => {
    setHwLoading(true);
    setHwError('');
    
    try {
      // Parse genotype input (format: "AA:25,AB:50,BB:25")
      const genotypes = {};
      const pairs = hwGenotypes.split(',').map(pair => pair.trim());
      
      for (const pair of pairs) {
        const [genotype, count] = pair.split(':').map(s => s.trim());
        if (!genotype || !count) {
          throw new Error('Invalid format. Use: AA:25,AB:50,BB:25');
        }
        genotypes[genotype] = parseInt(count);
        if (isNaN(genotypes[genotype]) || genotypes[genotype] < 0) {
          throw new Error('Counts must be non-negative integers');
        }
      }

      const response = await axios.post(`${API_URLS.geneticDiversity}/hardy-weinberg`, {
        genotypes
      });
      
      setHwResults(response.data);
    } catch (error) {
      setHwError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setHwLoading(false);
    }
  };

  // Inbreeding Coefficient Calculation
  const calculateInbreeding = async () => {
    setInbreedingLoading(true);
    setInbreedingError('');
    
    try {
      // Parse heterozygosity arrays
      const subpopHet = inbreedingData.subpopHeterozygosity
        .split(',')
        .map(val => parseFloat(val.trim()))
        .filter(val => !isNaN(val));
      
      const totalHet = parseFloat(inbreedingData.totalHeterozygosity);
      const expectedHet = parseFloat(inbreedingData.expectedHeterozygosity);
      
      if (subpopHet.length === 0 || isNaN(totalHet) || isNaN(expectedHet)) {
        throw new Error('All heterozygosity values must be valid numbers between 0 and 1');
      }

      const response = await axios.post(`${API_URLS.geneticDiversity}/inbreeding-coefficient`, {
        subpop_heterozygosity: subpopHet,
        total_heterozygosity: totalHet,
        expected_heterozygosity: expectedHet
      });
      
      setInbreedingResults(response.data);
    } catch (error) {
      setInbreedingError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setInbreedingLoading(false);
    }
  };

  // Bottleneck Detection
  const detectBottleneck = async () => {
    setBottleneckLoading(true);
    setBottleneckError('');
    
    try {
      const sizes = populationSizes
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val) && val > 0);
      
      if (sizes.length < 2) {
        throw new Error('At least 2 population size measurements required');
      }

      const response = await axios.post(`${API_URLS.geneticDiversity}/bottleneck-detection`, {
        sizes
      });
      
      setBottleneckResults(response.data);
    } catch (error) {
      setBottleneckError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setBottleneckLoading(false);
    }
  };

  // Allelic Richness Calculation
  const calculateRichness = async () => {
    setRichnessLoading(true);
    setRichnessError('');
    
    try {
      const counts = alleleCounts
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val) && val > 0);
      
      const samples = sampleSizes
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val) && val > 0);
      
      if (counts.length === 0 || samples.length === 0) {
        throw new Error('Allele counts and sample sizes must be positive integers');
      }
      
      if (counts.length !== samples.length) {
        throw new Error('Number of allele counts must match number of sample sizes');
      }

      const response = await axios.post(`${API_URLS.geneticDiversity}/allelic-richness`, {
        allele_counts: counts,
        sample_sizes: samples
      });
      
      setRichnessResults(response.data);
    } catch (error) {
      setRichnessError(error.response?.data?.detail || error.message || 'Calculation failed');
    } finally {
      setRichnessLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        🧬 Genetic Diversity Tools
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Analyze genetic diversity, population structure, and evolutionary processes
      </Typography>

      <Grid container spacing={4}>
        {/* Hardy-Weinberg Equilibrium */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Science color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Hardy-Weinberg Equilibrium
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Test if a population is in genetic equilibrium by comparing observed vs expected genotype frequencies.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Hardy%E2%80%93Weinberg_principle" target="_blank" rel="noopener noreferrer">
                  Hardy-Weinberg Principle (Wikipedia)
                </a>{' '}•{' '}
                Hardy, G.H. (1908). Mendelian proportions in a mixed population. <em>Science</em> 28: 49-50
              </Typography>

              <TextField
                fullWidth
                label="Genotype Counts"
                placeholder="AA:25,AB:50,BB:25"
                value={hwGenotypes}
                onChange={(e) => setHwGenotypes(e.target.value)}
                margin="normal"
                helperText="Format: genotype:count,genotype:count (e.g., AA:25,AB:50,BB:25)"
              />

              {hwError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {hwError}
                </Alert>
              )}

              {hwResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Results:</Typography>
                  <Chip 
                    label={hwResults.is_in_equilibrium ? "In Equilibrium" : "Not in Equilibrium"}
                    color={hwResults.is_in_equilibrium ? "success" : "error"}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    <strong>Chi-square:</strong> {hwResults.chi_square_statistic.toFixed(4)}<br/>
                    <strong>P-value:</strong> {hwResults.p_value.toFixed(4)}<br/>
                    <strong>Degrees of freedom:</strong> {hwResults.degrees_of_freedom}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Allele Frequencies:</Typography>
                  {Object.entries(hwResults.allele_frequencies).map(([allele, freq]) => (
                    <Chip key={allele} label={`${allele}: ${freq.toFixed(3)}`} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateHardyWeinberg}
                disabled={hwLoading || !hwGenotypes.trim()}
                startIcon={hwLoading ? <CircularProgress size={20} /> : <Analytics />}
              >
                {hwLoading ? 'Calculating...' : 'Test Equilibrium'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Inbreeding Coefficient */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Biotech color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Inbreeding Coefficients
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Calculate F-statistics (FIS, FST, FIT) to assess inbreeding levels and population structure.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/F-statistics" target="_blank" rel="noopener noreferrer">
                  F-statistics (Wikipedia)
                </a>{' '}•{' '}
                Wright, S. (1951). The genetical structure of populations. <em>Annals of Eugenics</em> 15: 323-354
              </Typography>

              <TextField
                fullWidth
                label="Subpopulation Heterozygosity"
                placeholder="0.4,0.4,0.4"
                value={inbreedingData.subpopHeterozygosity}
                onChange={(e) => setInbreedingData({...inbreedingData, subpopHeterozygosity: e.target.value})}
                margin="normal"
                helperText="Comma-separated values (0-1)"
              />

              <TextField
                fullWidth
                label="Total Heterozygosity"
                placeholder="0.35"
                value={inbreedingData.totalHeterozygosity}
                onChange={(e) => setInbreedingData({...inbreedingData, totalHeterozygosity: e.target.value})}
                margin="normal"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
              />

              <TextField
                fullWidth
                label="Expected Heterozygosity"
                placeholder="0.5"
                value={inbreedingData.expectedHeterozygosity}
                onChange={(e) => setInbreedingData({...inbreedingData, expectedHeterozygosity: e.target.value})}
                margin="normal"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
              />

              {inbreedingError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {inbreedingError}
                </Alert>
              )}

              {inbreedingResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>F-Statistics:</Typography>
                  <Typography variant="body2">
                    <strong>FIS:</strong> {inbreedingResults.fis.toFixed(4)} (Inbreeding within subpopulations)<br/>
                    <strong>FST:</strong> {inbreedingResults.fst.toFixed(4)} (Population differentiation)<br/>
                    <strong>FIT:</strong> {inbreedingResults.fit.toFixed(4)} (Total inbreeding)
                  </Typography>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    {inbreedingResults.interpretation}
                  </Alert>
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateInbreeding}
                disabled={inbreedingLoading || !inbreedingData.subpopHeterozygosity.trim()}
                startIcon={inbreedingLoading ? <CircularProgress size={20} /> : <Biotech />}
              >
                {inbreedingLoading ? 'Calculating...' : 'Calculate F-Statistics'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Bottleneck Detection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Bottleneck Detection
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Detect genetic bottlenecks from historical population size data and assess their severity.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Population_bottleneck" target="_blank" rel="noopener noreferrer">
                  Population Bottleneck (Wikipedia)
                </a>{' '}•{' '}
                Nei, M., Maruyama, T. & Chakraborty, R. (1975). The bottleneck effect and genetic variability. <em>Evolution</em> 29: 1-10
              </Typography>

              <TextField
                fullWidth
                label="Population Sizes"
                placeholder="1000,900,50,100,200,400"
                value={populationSizes}
                onChange={(e) => setPopulationSizes(e.target.value)}
                margin="normal"
                helperText="Comma-separated population sizes over time"
              />

              {bottleneckError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {bottleneckError}
                </Alert>
              )}

              {bottleneckResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Bottleneck Analysis:</Typography>
                  <Chip 
                    label={bottleneckResults.bottleneck_detected ? `${bottleneckResults.severity} Bottleneck` : "No Bottleneck"}
                    color={bottleneckResults.bottleneck_detected ? "error" : "success"}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    <strong>Minimum Size:</strong> {bottleneckResults.minimum_size}<br/>
                    <strong>Reduction:</strong> {bottleneckResults.reduction_percentage.toFixed(1)}%<br/>
                    <strong>Effective Population Size:</strong> {bottleneckResults.effective_population_size.toFixed(1)}
                    {bottleneckResults.recovery_generations && (
                      <><br/><strong>Recovery Time:</strong> {bottleneckResults.recovery_generations} generations</>
                    )}
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={detectBottleneck}
                disabled={bottleneckLoading || !populationSizes.trim()}
                startIcon={bottleneckLoading ? <CircularProgress size={20} /> : <TrendingUp />}
              >
                {bottleneckLoading ? 'Analyzing...' : 'Detect Bottleneck'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Allelic Richness */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Analytics color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Allelic Richness
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Calculate standardized allelic diversity measures using rarefaction method.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>References:</strong>{' '}
                <a href="https://en.wikipedia.org/wiki/Allelic_richness" target="_blank" rel="noopener noreferrer">
                  Allelic Richness (Wikipedia)
                </a>{' '}•{' '}
                El Mousadik, A. & Petit, R.J. (1996). High level of genetic differentiation for allelic richness. <em>Genetics</em> 144: 1297-1303
              </Typography>

              <TextField
                fullWidth
                label="Allele Counts"
                placeholder="5,8,6,7"
                value={alleleCounts}
                onChange={(e) => setAlleleCounts(e.target.value)}
                margin="normal"
                helperText="Number of alleles per locus"
              />

              <TextField
                fullWidth
                label="Sample Sizes"
                placeholder="50,50,50,50"
                value={sampleSizes}
                onChange={(e) => setSampleSizes(e.target.value)}
                margin="normal"
                helperText="Sample sizes per locus"
              />

              {richnessError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {richnessError}
                </Alert>
              )}

              {richnessResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Diversity Metrics:</Typography>
                  <Typography variant="body2">
                    <strong>Mean Allelic Richness:</strong> {richnessResults.mean_richness.toFixed(2)}<br/>
                    <strong>Mean Expected Heterozygosity:</strong> {richnessResults.mean_heterozygosity.toFixed(3)}
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Locus</TableCell>
                          <TableCell align="right">Observed Alleles</TableCell>
                          <TableCell align="right">Rarefied Richness</TableCell>
                          <TableCell align="right">Expected He</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {richnessResults.observed_alleles.map((alleles, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell align="right">{alleles}</TableCell>
                            <TableCell align="right">{richnessResults.rarefied_richness[index].toFixed(2)}</TableCell>
                            <TableCell align="right">{richnessResults.expected_heterozygosity[index].toFixed(3)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={calculateRichness}
                disabled={richnessLoading || !alleleCounts.trim() || !sampleSizes.trim()}
                startIcon={richnessLoading ? <CircularProgress size={20} /> : <Analytics />}
              >
                {richnessLoading ? 'Calculating...' : 'Calculate Richness'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>


    </Container>
  );
};

export default GeneticTools;