const request = require('supertest');
const { mockApiResponses, mockUsers } = require('../fixtures/mock-data');
const TestHelpers = require('../utils/test-helpers');

// Mock the API Gateway
const app = require('@/services/api-gateway/app');

describe('API Gateway Integration Tests', () => {
  let server;
  let authToken;
  let metricsCollector;

  beforeAll(async () => {
    // Start test server
    server = app.listen(0); // Random port
    
    // Get auth token for authenticated tests
    authToken = `Bearer ${mockUsers.authenticated.apiKey}`;
    
    // Initialize metrics collector
    metricsCollector = TestHelpers.createMetricsCollector();
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        version: expect.any(String),
        uptime: expect.any(Number),
        services: {
          vision: 'healthy',
          codeGen: 'healthy',
          database: 'healthy',
          cache: 'healthy'
        }
      });
    });

    it('should include detailed metrics when requested', async () => {
      const response = await request(server)
        .get('/health?detailed=true')
        .expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('cpu');
      expect(response.body.metrics).toHaveProperty('memory');
      expect(response.body.metrics).toHaveProperty('requestCount');
    });
  });

  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(server)
        .post('/api/v1/vision/analyze')
        .expect(401);

      expect(response.body).toEqual({
        status: 'error',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing API key'
        }
      });
    });

    it('should accept valid authentication tokens', async () => {
      const response = await request(server)
        .get('/api/v1/user/profile')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should enforce rate limits per user', async () => {
      const requests = Array(15).fill().map(() => 
        request(server)
          .get('/api/v1/user/profile')
          .set('Authorization', authToken)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Image Upload Endpoint', () => {
    it('should accept valid image uploads', async () => {
      const mockImage = await TestHelpers.createMockImage({ format: 'png' });
      
      const response = await request(server)
        .post('/api/v1/images/upload')
        .set('Authorization', authToken)
        .attach('image', mockImage.buffer, 'test.png')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          imageId: expect.any(String),
          uploadUrl: expect.stringContaining('https://'),
          processingStatus: 'queued'
        }
      });

      metricsCollector.recordRequest('/api/v1/images/upload', response.body.processingTime || 100, 200);
    });

    it('should validate image format', async () => {
      const response = await request(server)
        .post('/api/v1/images/upload')
        .set('Authorization', authToken)
        .attach('image', Buffer.from('not an image'), 'test.txt')
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_IMAGE_FORMAT');
    });

    it('should enforce size limits', async () => {
      const oversizedImage = Buffer.alloc(10 * 1024 * 1024); // 10MB
      
      const response = await request(server)
        .post('/api/v1/images/upload')
        .set('Authorization', authToken)
        .attach('image', oversizedImage, 'large.png')
        .expect(413);

      expect(response.body.error.code).toBe('FILE_TOO_LARGE');
    });
  });

  describe('Vision Analysis Endpoint', () => {
    it('should analyze uploaded images', async () => {
      const imageId = 'img_123';
      
      const response = await request(server)
        .post(`/api/v1/vision/analyze/${imageId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          analysisId: expect.any(String),
          imageId: imageId,
          result: expect.objectContaining({
            components: expect.any(Array),
            layout: expect.any(Object),
            design: expect.any(Object)
          }),
          processingTime: expect.any(Number)
        }
      });

      expect(response.body.data.processingTime).toBeLessThan(300);
    });

    it('should handle analysis errors gracefully', async () => {
      const response = await request(server)
        .post('/api/v1/vision/analyze/invalid_id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.error.code).toBe('IMAGE_NOT_FOUND');
    });

    it('should support async analysis with webhooks', async () => {
      const webhookUrl = 'https://example.com/webhook';
      
      const response = await request(server)
        .post('/api/v1/vision/analyze/img_456')
        .set('Authorization', authToken)
        .send({ async: true, webhookUrl })
        .expect(202);

      expect(response.body).toEqual({
        status: 'accepted',
        data: {
          jobId: expect.any(String),
          status: 'processing',
          webhookUrl: webhookUrl
        }
      });
    });
  });

  describe('Code Generation Endpoint', () => {
    it('should generate code from analysis results', async () => {
      const analysisId = 'analysis_123';
      
      const response = await request(server)
        .post('/api/v1/code/generate')
        .set('Authorization', authToken)
        .send({
          analysisId,
          framework: 'react',
          language: 'typescript',
          options: {
            includeTests: true,
            includeStyles: true
          }
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('generationId');
      expect(response.body.data).toHaveProperty('files');
      expect(response.body.data.files).toBeInstanceOf(Array);
      expect(response.body.data.files.length).toBeGreaterThan(0);
    });

    it('should support multiple frameworks', async () => {
      const frameworks = ['react', 'vue', 'angular', 'svelte'];
      
      for (const framework of frameworks) {
        const response = await request(server)
          .post('/api/v1/code/generate')
          .set('Authorization', authToken)
          .send({
            analysisId: 'analysis_123',
            framework
          })
          .expect(200);

        expect(response.body.data.framework).toBe(framework);
      }
    });

    it('should validate framework compatibility', async () => {
      const response = await request(server)
        .post('/api/v1/code/generate')
        .set('Authorization', authToken)
        .send({
          analysisId: 'analysis_123',
          framework: 'invalid-framework'
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_FRAMEWORK');
    });
  });

  describe('Project Management', () => {
    it('should create new projects', async () => {
      const response = await request(server)
        .post('/api/v1/projects')
        .set('Authorization', authToken)
        .send({
          name: 'Test Project',
          description: 'Integration test project'
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('projectId');
      expect(response.body.data.name).toBe('Test Project');
    });

    it('should list user projects', async () => {
      const response = await request(server)
        .get('/api/v1/projects')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('projectId');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('createdAt');
    });

    it('should export project as ZIP', async () => {
      const projectId = 'proj_123';
      
      const response = await request(server)
        .get(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/zip');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename=.+\.zip/);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors properly', async () => {
      const response = await request(server)
        .get('/api/v1/nonexistent')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });

    it('should handle malformed requests', async () => {
      const response = await request(server)
        .post('/api/v1/code/generate')
        .set('Authorization', authToken)
        .send('invalid json')
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_REQUEST');
    });

    it('should handle server errors gracefully', async () => {
      // Force a server error by sending invalid data
      const response = await request(server)
        .post('/api/v1/vision/analyze/crash_test')
        .set('Authorization', authToken)
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: expect.any(String)
        }
      });
    });
  });

  describe('Performance', () => {
    it('should respond within SLA for all endpoints', async () => {
      const endpoints = [
        { method: 'GET', path: '/health', expectedTime: 50 },
        { method: 'GET', path: '/api/v1/user/profile', expectedTime: 100 },
        { method: 'GET', path: '/api/v1/projects', expectedTime: 150 }
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        await request(server)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', authToken)
          .expect(200);
          
        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(endpoint.expectedTime);
        metricsCollector.recordRequest(endpoint.path, duration, 200);
      }
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 100;
      const requests = Array(concurrentRequests).fill().map(() =>
        request(server)
          .get('/api/v1/user/profile')
          .set('Authorization', authToken)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(concurrentRequests * 0.95); // 95% success rate
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  afterAll(() => {
    const stats = metricsCollector.getStats();
    console.log('API Gateway Integration Test Statistics:', {
      ...stats,
      requestsPerSecond: (stats.totalRequests / (Date.now() / 1000)).toFixed(2)
    });
  });
});