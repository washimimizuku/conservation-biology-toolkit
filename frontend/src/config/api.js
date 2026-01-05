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

const environment = process.env.NODE_ENV || 'development';

export const API_URLS = API_CONFIG[environment];

export default API_URLS;