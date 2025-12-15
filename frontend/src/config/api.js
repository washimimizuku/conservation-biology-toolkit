// API configuration for different environments
const API_CONFIG = {
  development: {
    populationAnalysis: 'http://localhost:8002',
    samplingSurvey: 'http://localhost:8003',
    breedRegistry: 'http://localhost:8001',
  },
  production: {
    populationAnalysis: '/api/population-analysis',
    samplingSurvey: '/api/sampling-survey',
    breedRegistry: '/api/breed-registry',
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_URLS = API_CONFIG[environment];

export default API_URLS;