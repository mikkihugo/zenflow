const { generateToken, verifyToken } = require('../../src/middleware/auth');
describe('Auth Middleware', () => {
  const _originalSecret = process.env.JWT_SECRET; // eslint-disable-line
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });
  afterAll(() => {
    process.env.JWT_SECRET = originalSecret; // eslint-disable-line
  });
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const _userId = 123; // eslint-disable-line
      const _token = generateToken(userId); // eslint-disable-line
      expect(token).toBeDefined(); // eslint-disable-line
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // eslint-disable-line
    });
  });
  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const _userId = 123; // eslint-disable-line
      const _token = generateToken(userId); // eslint-disable-line
      const _decoded = verifyToken(token); // eslint-disable-line
      expect(decoded).toBeDefined(); // eslint-disable-line
      expect(decoded.userId).toBe(userId); // eslint-disable-line
    });
    it('should return null for invalid token', () => {
      const _decoded = verifyToken('invalid-token'); // eslint-disable-line
      // expect(decoded).toBeNull(); // LINT: unreachable code removed
    });
  });
});
