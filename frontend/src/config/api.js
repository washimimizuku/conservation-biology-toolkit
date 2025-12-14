// API configuration for different environments
const API_CONFIG = {
  development: {
    populationAnalysis: 'http://localhost:8002',
    breedRegistry: 'http://localhost:8001',
  },
  production: {
    populationAnalysis: '/api/population-analysis',
    breedRegistry: '/api/breed-registry',
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_URLS = API_CONFIG[environment];

export default API_URLS;