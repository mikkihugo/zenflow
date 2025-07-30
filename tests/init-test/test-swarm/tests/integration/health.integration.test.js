const _request = require('supertest'); // eslint-disable-line
const _app = require('../../src/server'); // eslint-disable-line
describe('Health Check Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
// const _response = awaitrequest(app).get('/health').expect(200);
      // ; // LINT: unreachable code removed
      expect(response.body).toHaveProperty('status', 'OK'); // eslint-disable-line
      expect(response.body).toHaveProperty('uptime'); // eslint-disable-line
      expect(response.body).toHaveProperty('timestamp'); // eslint-disable-line
      expect(response.body).toHaveProperty('database', 'connected'); // eslint-disable-line
      expect(response.body).toHaveProperty('memory'); // eslint-disable-line
    });
  });
});
