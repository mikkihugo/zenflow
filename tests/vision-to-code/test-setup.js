// Global test setup for Vision-to-Code tests
require('dotenv').config({ path: '.env.test' });

// Set up global test utilities
global.testUtils = require('./utils/test-helpers');
global.mockData = require('./fixtures/mock-data');
global.testFixtures = require('./fixtures');

// Configure test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DB_NAME = 'vision_to_code_test';

// Mock external services
jest.mock('axios');
jest.mock('@google/generative-ai');

// Set up performance monitoring
if (process.env.MEASURE_PERFORMANCE) {
  const { performance, PerformanceObserver } = require('node:perf_hooks');

  const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
      if (entry.duration > 100) {
        console.warn(`Slow test detected: ${entry.name} took ${entry.duration}ms`);
      }
    });
  });

  perfObserver.observe({ entryTypes: ['measure'] });
}

// Set up global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Close database connections
  const db = require('./utils/test-db');
  await db.close();

  // Clear all mocks
  jest.clearAllMocks();

  // Clear test cache
  jest.clearAllTimers();
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection in tests:', error);
  process.exit(1);
});

// Export test utilities
module.exports = {
  setupTestDatabase: require('./utils/test-db').setup,
  clearTestDatabase: require('./utils/test-db').clear,
  createMockRequest: require('./utils/mock-request'),
  createMockResponse: require('./utils/mock-response'),
  waitForCondition: require('./utils/wait-helpers').waitForCondition,
};
