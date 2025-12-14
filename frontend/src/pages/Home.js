import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  const toolCategories = [
    {
      title: '🧬 Population Analysis',
      description: 'Population viability analysis, effective population size, and demographic modeling',
      tools: ['Population Growth Calculator', 'Effective Population Size', 'PVA Calculator', 'Metapopulation Dynamics'],
      link: '/population-tools',
      status: 'Available'
    },
    {
      title: '🔬 Genetic Diversity',
      description: 'Hardy-Weinberg equilibrium, inbreeding coefficients, and genetic bottleneck detection',
      tools: ['Hardy-Weinberg Test', 'Inbreeding Calculator', 'Bottleneck Detection'],
      link: '/genetic-tools',
      status: 'Coming Soon'
    },
    {
      title: '🌍 Habitat & Landscape',
      description: 'Habitat suitability, fragmentation metrics, and corridor design',
      tools: ['Habitat Suitability', 'Fragmentation Analysis', 'Corridor Calculator'],
      link: '/habitat-tools',
      status: 'Coming Soon'
    },
    {
      title: '📚 Breed Registry',
      description: 'Comprehensive animal records, pedigree tracking, and breeding management',
      tools: ['Animal Records', 'Pedigree Tracking', 'Breeding Plans'],
      link: '/breed-registry',
      status: 'Coming Soon'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Conservation Biology Toolkit
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Essential computational tools for conservation biologists, wildlife managers, and researchers
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          From population viability analysis to climate impact assessments, these tools help researchers 
          make data-driven conservation decisions through an intuitive web interface.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {toolCategories.map((category, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" component="h2">
                    {category.title}
                  </Typography>
                  <Chip 
                    label={category.status} 
                    color={category.status === 'Available' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {category.description}
                </Typography>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Tools:
                  </Typography>
                  {category.tools.map((tool, toolIndex) => (
                    <Chip 
                      key={toolIndex}
                      label={tool} 
                      variant="outlined" 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={category.link}
                  disabled={category.status !== 'Available'}
                >
                  {category.status === 'Available' ? 'Explore Tools' : 'Coming Soon'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={6} textAlign="center">
        <Typography variant="h6" gutterBottom>
          Open Source & Scientific
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This toolkit is open source and designed with scientific rigor. 
          All calculations are based on peer-reviewed methods and best practices in conservation biology.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;