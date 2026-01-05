import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Box, 
  Chip,
  Divider,
  Link as MuiLink
} from '@mui/material';
import { 
  GitHub as GitHubIcon,
  BugReport as BugReportIcon,
  Lightbulb as LightbulbIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Footer } from '../components';

const Home = () => {
  // Helper function to get service-specific colors
  const getServiceColors = (title) => {
    const colorMap = {
      '🧬 Population Analysis': {
        background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
        boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
        hoverBackground: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(76, 175, 80, .4)'
      },
      '📋 Sampling & Survey Design': {
        background: 'linear-gradient(45deg, #00BCD4 30%, #4DD0E1 90%)',
        boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
        hoverBackground: 'linear-gradient(45deg, #0097A7 30%, #00BCD4 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(0, 188, 212, .4)'
      },
      '🔬 Genetic Diversity': {
        background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
        boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
        hoverBackground: 'linear-gradient(45deg, #7B1FA2 30%, #9C27B0 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(156, 39, 176, .4)'
      },
      '📊 Species Assessment': {
        background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
        boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
        hoverBackground: 'linear-gradient(45deg, #F57C00 30%, #FF9800 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(255, 152, 0, .4)'
      },
      '🌍 Habitat & Landscape': {
        background: 'linear-gradient(45deg, #795548 30%, #A1887F 90%)',
        boxShadow: '0 3px 5px 2px rgba(121, 85, 72, .3)',
        hoverBackground: 'linear-gradient(45deg, #5D4037 30%, #795548 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(121, 85, 72, .4)'
      },
      '🌡️ Climate Impact Assessment': {
        background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
        hoverBackground: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(33, 150, 243, .4)'
      },
      '🎯 Conservation Planning': {
        background: 'linear-gradient(45deg, #E91E63 30%, #F06292 90%)',
        boxShadow: '0 3px 5px 2px rgba(233, 30, 99, .3)',
        hoverBackground: 'linear-gradient(45deg, #C2185B 30%, #E91E63 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(233, 30, 99, .4)'
      },
      '📚 Breed Registry': {
        background: 'linear-gradient(45deg, #607D8B 30%, #90A4AE 90%)',
        boxShadow: '0 3px 5px 2px rgba(96, 125, 139, .3)',
        hoverBackground: 'linear-gradient(45deg, #455A64 30%, #607D8B 90%)',
        hoverBoxShadow: '0 4px 8px 3px rgba(96, 125, 139, .4)'
      }
    };
    
    return colorMap[title] || {
      background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
      boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
      hoverBackground: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
      hoverBoxShadow: '0 4px 8px 3px rgba(76, 175, 80, .4)'
    };
  };

  const toolCategories = [
    {
      title: '🧬 Population Analysis',
      description: 'Population viability analysis, effective population size, and demographic modeling',
      tools: ['Population Growth Calculator', 'Effective Population Size', 'PVA Calculator', 'Metapopulation Dynamics'],
      link: '/population-tools',
      status: 'Available'
    },
    {
      title: '📋 Sampling & Survey Design',
      description: 'Statistical tools for survey planning and sampling data analysis',
      tools: ['Sample Size Calculator', 'Detection Probability', 'Capture-Recapture', 'Distance Sampling'],
      link: '/sampling-tools',
      status: 'Available'
    },
    {
      title: '🔬 Genetic Diversity',
      description: 'Hardy-Weinberg equilibrium, inbreeding coefficients, and genetic bottleneck detection',
      tools: ['Hardy-Weinberg Test', 'Inbreeding Calculator', 'Bottleneck Detection', 'Allelic Richness'],
      link: '/genetic-tools',
      status: 'Available'
    },
    {
      title: '📊 Species Assessment',
      description: 'IUCN Red List criteria, extinction risk assessment, and range size analysis',
      tools: ['IUCN Red List Assessment', 'Extinction Risk Assessment', 'Range Size Analysis'],
      link: '/species-assessment',
      status: 'Available'
    },
    {
      title: '🌍 Habitat & Landscape',
      description: 'Habitat suitability, fragmentation metrics, and species-area relationships',
      tools: ['Habitat Suitability Index', 'Species-Area Relationship', 'Fragmentation Metrics'],
      link: '/habitat-landscape',
      status: 'Available'
    },
    {
      title: '🌡️ Climate Impact Assessment',
      description: 'Climate change vulnerability analysis and adaptation planning tools',
      tools: ['Temperature Tolerance', 'Phenology Shift', 'Sea Level Rise', 'Climate Velocity'],
      link: '/climate-impact',
      status: 'Available'
    },
    {
      title: '🎯 Conservation Planning',
      description: 'Systematic conservation planning and prioritization tools',
      tools: ['Priority Analysis', 'Threat Assessment', 'Cost-Effectiveness', 'Reserve Selection'],
      link: '/conservation-planning',
      status: 'Available'
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
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }} paragraph>
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
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant={category.status === 'Available' ? 'contained' : 'outlined'}
                  size="large"
                  fullWidth
                  component={Link} 
                  to={category.link}
                  disabled={category.status !== 'Available'}
                  startIcon={category.status === 'Available' ? <PlayArrowIcon /> : <ScheduleIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    ...(category.status === 'Available' && (() => {
                      const colors = getServiceColors(category.title);
                      return {
                        background: colors.background,
                        boxShadow: colors.boxShadow,
                        '&:hover': {
                          background: colors.hoverBackground,
                          boxShadow: colors.hoverBoxShadow,
                          transform: 'translateY(-1px)'
                        }
                      };
                    })())
                  }}
                >
                  {category.status === 'Available' ? 'Explore Tools Now' : 'Coming Soon'}
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
        <Typography variant="body2" color="text.secondary" paragraph>
          This toolkit is open source and designed with scientific rigor. 
          All calculations are based on peer-reviewed methods and best practices in conservation biology.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Contact & Feature Request Footer */}
      <Box mt={4} mb={2}>
        <Typography variant="h6" gutterBottom textAlign="center" color="primary">
          🔬 Request New Features & Tools
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
          As a scientist-driven project, we welcome feature requests from the conservation biology community.
        </Typography>
        
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <GitHubIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                GitHub Issues
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Submit feature requests, bug reports, and suggestions
              </Typography>
              <MuiLink 
                href="https://github.com/washimimizuku/conservation-biology-toolkit/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
              >
                Open Issue
              </MuiLink>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <LightbulbIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Feature Ideas
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Share your conservation analysis needs and tool ideas
              </Typography>
              <MuiLink 
                href="https://github.com/washimimizuku/conservation-biology-toolkit/issues/new?template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
              >
                Request Feature
              </MuiLink>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <BugReportIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Bug Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Report calculation errors or technical issues
              </Typography>
              <MuiLink 
                href="https://github.com/washimimizuku/conservation-biology-toolkit/issues/new?template=bug_report.md"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
              >
                Report Bug
              </MuiLink>
            </Card>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            <strong>What to include in feature requests:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 600, mx: 'auto' }}>
            • Specific conservation biology use case • Required inputs and expected outputs • 
            Scientific references or methodologies • Target species or ecosystem context
          </Typography>
        </Box>

        <Footer />
      </Box>
    </Container>
  );
};

export default Home;