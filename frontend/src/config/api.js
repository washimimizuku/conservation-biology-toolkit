// API configuration for different environments
const API_CONFIG = {
  development: {
    populationAnalysis: 'http://localhost:8002',
    samplingSurvey: 'http://localhost:8003',
    geneticDiversity: 'http://localhost:8004',
    speciesAssessment: 'http://localhost:8005',
    habitatLandscape: 'http://localhost:8006',
    climateImpact: 'http://localhost:8007',
    conservationPlanning: 'http://localhost:8008',
    breedRegistry: 'http://localhost:8001',
  },
  docker: {
    populationAnalysis: '/api/population',
    samplingSurvey: '/api/sampling',
    geneticDiversity: '/api/genetic',
    speciesAssessment: '/api/species',
    habitatLandscape: '/api/habitat',
    climateImpact: '/api/climate',
    conservationPlanning: '/api/conservation',
    breedRegistry: '/api/breed',
  },
  production: {
    populationAnalysis: 'https://api.conservationbiologytools.org/population-analysis',
    samplingSurvey: 'https://api.conservationbiologytools.org/sampling-survey',
    geneticDiversity: 'https://api.conservationbiologytools.org/genetic-diversity',
    speciesAssessment: 'https://api.conservationbiologytools.org/species-assessment',
    habitatLandscape: 'https://api.conservationbiologytools.org/habitat-landscape',
    climateImpact: 'https://api.conservationbiologytools.org/climate-impact',
    conservationPlanning: 'https://api.conservationbiologytools.org/conservation-planning',
    breedRegistry: 'https://api.conservationbiologytools.org/breed-registry',
  }
};

// Check for Docker environment first, then fall back to NODE_ENV
const environment = process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';

export const API_URLS = API_CONFIG[environment];

export default API_URLS;