// Mock the API configuration module
jest.mock('../../config/api', () => ({
  API_URLS: {
    populationAnalysis: 'http://localhost:8002',
    samplingSurvey: 'http://localhost:8003',
    breedRegistry: 'http://localhost:8001'
  }
}));

import { API_URLS } from '../../config/api';

describe('API Configuration', () => {
  test('API_URLS contains all required endpoints', () => {
    expect(API_URLS).toBeDefined();
    expect(API_URLS.populationAnalysis).toBeDefined();
    expect(API_URLS.samplingSurvey).toBeDefined();
    expect(API_URLS.breedRegistry).toBeDefined();
  });

  test('API URLs are properly formatted for development', () => {
    expect(API_URLS.populationAnalysis).toMatch(/^https?:\/\/localhost:\d+$/);
    expect(API_URLS.samplingSurvey).toMatch(/^https?:\/\/localhost:\d+$/);
    expect(API_URLS.breedRegistry).toMatch(/^https?:\/\/localhost:\d+$/);
  });

  test('API URLs do not have trailing slashes', () => {
    Object.values(API_URLS).forEach(url => {
      expect(url).not.toMatch(/\/$/);
    });
  });

  test('API URLs use localhost for development', () => {
    Object.values(API_URLS).forEach(url => {
      expect(url).toMatch(/^https?:\/\/localhost:\d+$/);
    });
  });

  test('API URLs have different ports for each service', () => {
    const ports = Object.values(API_URLS).map(url => {
      const match = url.match(/:(\d+)$/);
      return match ? match[1] : null;
    });
    
    // All ports should be unique
    const uniquePorts = [...new Set(ports)];
    expect(uniquePorts).toHaveLength(ports.length);
  });
});