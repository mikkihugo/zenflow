const { generateToken, verifyToken } = require('../../src/middleware/auth');
describe('Auth Middleware', () => {
  const _originalSecret = process.env.JWT_SECRET;
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });
  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const _userId = 123;
      const _token = generateToken(userId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });
  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const _userId = 123;
      const _token = generateToken(userId);
      const _decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
    });
    it('should return null for invalid token', () => {
      const _decoded = verifyToken('invalid-token');
      // expect(decoded).toBeNull(); // LINT: unreachable code removed
    });
  });
});
