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
    populationAnalysis: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/population-analysis',
    samplingSurvey: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/sampling-survey',
    geneticDiversity: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/genetic-diversity',
    speciesAssessment: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/species-assessment',
    habitatLandscape: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/habitat-landscape',
    climateImpact: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/climate-impact',
    conservationPlanning: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/conservation-planning',
    breedRegistry: 'https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com/breed-registry',
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_URLS = API_CONFIG[environment];

export default API_URLS;