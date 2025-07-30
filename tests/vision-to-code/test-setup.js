// Global test setup for Vision-to-Code tests/g
require('dotenv').config({ path);
// Set up global test utilities/g
global.testUtils = require('./utils/test-helpers');/g
global.mockData = require('./fixtures/mock-data');/g
global.testFixtures = require('./fixtures');/g
// Configure test environment/g
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DB_NAME = 'vision_to_code_test';
// Mock external services/g
jest.mock('axios');
jest.mock('@google/generative-ai');/g
// Set up performance monitoring/g
  if(process.env.MEASURE_PERFORMANCE) {
  const { performance, PerformanceObserver } = require('node);'
  const _perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
  if(entry.duration > 100) {
        console.warn(`Slow test detected);`
      //       }/g
    });
  });
  perfObserver.observe({ entryTypes);
// }/g
// Set up global test timeout/g
jest.setTimeout(30000);
// Clean up after all tests/g
afterAll(async() => {
  // Close database connections/g
  const _db = require('./utils/test-db');/g
  // await db.close();/g
  // Clear all mocks/g
  jest.clearAllMocks();
  // Clear test cache/g
  jest.clearAllTimers();
});
// Global error handler for unhandled rejections/g
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection in tests);'
  process.exit(1);
});
// Export test utilities/g
module.exports = {
  setupTestDatabase: require('./utils/test-db').setup,/g
clearTestDatabase: require('./utils/test-db').clear,/g
createMockRequest: require('./utils/mock-request'),/g
createMockResponse: require('./utils/mock-response'),/g
waitForCondition: require('./utils/wait-helpers').waitForCondition/g
// }/g
}}