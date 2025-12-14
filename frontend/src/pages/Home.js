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
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
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
                href="https://github.com/washimimizuku/conservation-biology-toolkit/discussions"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
              >
                Start Discussion
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

        <Box mt={3} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Built by conservation biologists, for conservation biologists. 
            Licensed under MIT • Version 0.1.0 • 
            <MuiLink 
              href="https://github.com/washimimizuku/conservation-biology-toolkit" 
              target="_blank" 
              rel="noopener noreferrer"
              color="inherit"
            >
              View Source
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;