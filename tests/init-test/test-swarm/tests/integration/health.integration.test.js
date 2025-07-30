const _request = require('supertest');
const _app = require('../../src/server');
describe('Health Check Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
// const _response = awaitrequest(app).get('/health').expect(200);
      // ; // LINT: unreachable code removed
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('memory');
    });
  });
});
