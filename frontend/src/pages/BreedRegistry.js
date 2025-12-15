import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import {
  Pets,
  FamilyRestroom,
  Timeline,
  Assessment,
  Storage,
  Security,
  CloudSync,
  Analytics,
  VerifiedUser,
  Schedule,
  LocationOn,
  Science
} from '@mui/icons-material';

const BreedRegistry = () => {
  const features = [
    {
      icon: <Storage />,
      title: 'Animal Records Management',
      description: 'Comprehensive database for individual animal records, health history, and identification',
      tools: ['Individual ID tracking', 'Health records', 'Vaccination history', 'Physical characteristics']
    },
    {
      icon: <FamilyRestroom />,
      title: 'Pedigree Tracking',
      description: 'Multi-generational family tree tracking with genetic lineage analysis',
      tools: ['Family tree visualization', 'Genetic lineage mapping', 'Breeding coefficient calculation', 'Inbreeding analysis']
    },
    {
      icon: <Timeline />,
      title: 'Breeding Management',
      description: 'Strategic breeding program planning and genetic diversity optimization',
      tools: ['Breeding pair selection', 'Genetic diversity analysis', 'Breeding schedule planning', 'Offspring prediction']
    },
    {
      icon: <Assessment />,
      title: 'Population Genetics',
      description: 'Advanced genetic analysis tools for population health and diversity assessment',
      tools: ['Allele frequency analysis', 'Hardy-Weinberg equilibrium', 'Genetic bottleneck detection', 'Effective population size']
    },
    {
      icon: <Analytics />,
      title: 'Breeding Analytics',
      description: 'Data-driven insights for breeding program optimization and success tracking',
      tools: ['Breeding success rates', 'Genetic gain analysis', 'Performance metrics', 'Trend analysis']
    },
    {
      icon: <Security />,
      title: 'Data Security & Compliance',
      description: 'Secure data management with compliance to breeding registry standards',
      tools: ['Data encryption', 'Access control', 'Audit trails', 'Regulatory compliance']
    }
  ];

  const benefits = [
    {
      icon: <VerifiedUser />,
      title: 'Genetic Integrity',
      description: 'Maintain accurate genetic records and prevent inbreeding'
    },
    {
      icon: <Science />,
      title: 'Scientific Breeding',
      description: 'Evidence-based breeding decisions using genetic data'
    },
    {
      icon: <CloudSync />,
      title: 'Data Integration',
      description: 'Seamless integration with other conservation tools'
    },
    {
      icon: <Schedule />,
      title: 'Efficient Management',
      description: 'Streamlined workflows for breeding program coordination'
    }
  ];

  const useCases = [
    'Captive breeding programs for endangered species',
    'Zoo and aquarium breeding management',
    'Wildlife rehabilitation centers',
    'Conservation breeding facilities',
    'Research institutions studying animal genetics',
    'Government wildlife agencies',
    'International breeding consortiums',
    'Species survival plan (SSP) coordinators'
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          📚 Breed Registry
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Comprehensive animal breeding management system for conservation programs
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="body2">
            <strong>Coming Soon!</strong> This advanced breeding management system is currently under development. 
            It will provide comprehensive tools for animal record keeping, pedigree tracking, and genetic analysis.
          </Typography>
        </Alert>
      </Box>

      {/* Overview Section */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(45deg, #607D8B 30%, #90A4AE 90%)' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
          What is the Breed Registry?
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', fontSize: '1.1rem', lineHeight: 1.6 }}>
          The Breed Registry is a comprehensive digital platform designed to support conservation breeding programs 
          through advanced record keeping, genetic analysis, and breeding management tools. It serves as the central 
          hub for managing animal populations in captivity, tracking genetic diversity, and optimizing breeding 
          decisions to maintain healthy, genetically diverse populations for conservation purposes.
        </Typography>
      </Paper>

      {/* Key Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: 'primary.main', mr: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3">
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {feature.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {feature.tools.map((tool, toolIndex) => (
                      <Chip
                        key={toolIndex}
                        label={tool}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Benefits for Conservation
        </Typography>
        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {benefit.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Use Cases */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                Target Users & Applications
              </Typography>
              <List>
                {useCases.map((useCase, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <Pets color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={useCase} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Science sx={{ mr: 1, color: 'primary.main' }} />
                Technical Capabilities
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Analytics color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Advanced Genetic Analysis" 
                    secondary="Population genetics calculations and breeding recommendations"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Timeline color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Multi-generational Tracking" 
                    secondary="Complete family tree visualization and lineage analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CloudSync color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Data Integration" 
                    secondary="Seamless connection with other conservation biology tools"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Security color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Secure & Compliant" 
                    secondary="Enterprise-grade security with regulatory compliance"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Development Status */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Development Timeline
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The Breed Registry system is currently in the planning and design phase. Development will begin after 
          the completion of the core conservation analysis tools. Expected features will include:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip label="Phase 1: Core Database Design" color="primary" variant="outlined" sx={{ m: 0.5 }} />
          <Chip label="Phase 2: Pedigree Management" color="primary" variant="outlined" sx={{ m: 0.5 }} />
          <Chip label="Phase 3: Genetic Analysis Tools" color="primary" variant="outlined" sx={{ m: 0.5 }} />
          <Chip label="Phase 4: Breeding Recommendations" color="primary" variant="outlined" sx={{ m: 0.5 }} />
          <Chip label="Phase 5: Integration & Testing" color="primary" variant="outlined" sx={{ m: 0.5 }} />
        </Box>
      </Box>
    </Container>
  );
};

export default BreedRegistry;