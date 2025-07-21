/**
 * Business Service Integration Tests
 * Tests for vision management, stakeholder workflows, and ROI analysis
 */

const { describe, it, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@jest/globals');
const axios = require('axios');
const { 
  SERVICE_URLS, 
  mockVisions, 
  mockStakeholders, 
  apiResponseTemplates,
  testHelpers
} = require('../fixtures/vision-workflow-fixtures');

describe('Business Service Integration Tests', () => {
  let businessServiceClient;
  let testVision;
  let authToken;

  beforeAll(async () => {
    // Initialize HTTP client for Business Service
    businessServiceClient = axios.create({
      baseURL: SERVICE_URLS.BUSINESS,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Authenticate with test credentials
    try {
      const authResponse = await businessServiceClient.post('/auth/login', {
        email: 'test@company.com',
        password: 'test_password'
      });
      authToken = authResponse.data.token;
      businessServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      console.warn('Authentication failed, proceeding with mock auth:', error.message);
      authToken = 'mock_jwt_token';
      businessServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    }
  });

  beforeEach(() => {
    testVision = testHelpers.createVisionWorkflow('simple');
  });

  afterEach(async () => {
    // Cleanup test data
    if (testVision && testVision.id) {
      try {
        await businessServiceClient.delete(`/api/visions/${testVision.id}`);
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    }
  });

  describe('Vision Management API', () => {
    it('should create a new vision successfully', async () => {
      const response = await businessServiceClient.post('/api/visions', testVision);
      
      expect(response.status).toBe(201);
      expect(response.data.status).toBe('success');
      expect(response.data.data).toMatchObject({
        id: expect.any(String),
        title: testVision.title,
        description: testVision.description,
        stakeholder: testVision.stakeholder,
        status: 'pending_approval'
      });
      
      // Store ID for cleanup
      testVision.id = response.data.data.id;
    });

    it('should validate vision requirements', async () => {
      const invalidVision = { ...testVision };
      delete invalidVision.title;
      delete invalidVision.requirements;

      try {
        await businessServiceClient.post('/api/visions', invalidVision);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.code).toBe('VALIDATION_ERROR');
        expect(error.response.data.error.message).toContain('title');
        expect(error.response.data.error.message).toContain('requirements');
      }
    });

    it('should retrieve vision by ID', async () => {
      // Create vision first
      const createResponse = await businessServiceClient.post('/api/visions', testVision);
      const visionId = createResponse.data.data.id;
      testVision.id = visionId;

      // Retrieve vision
      const response = await businessServiceClient.get(`/api/visions/${visionId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        id: visionId,
        title: testVision.title,
        description: testVision.description
      });
    });

    it('should list visions with pagination', async () => {
      // Create multiple test visions
      const visions = await Promise.all([
        businessServiceClient.post('/api/visions', testHelpers.createVisionWorkflow('simple')),
        businessServiceClient.post('/api/visions', testHelpers.createVisionWorkflow('medium')),
        businessServiceClient.post('/api/visions', testHelpers.createVisionWorkflow('complex'))
      ]);

      // Store IDs for cleanup
      const visionIds = visions.map(v => v.data.data.id);

      const response = await businessServiceClient.get('/api/visions?page=1&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.data.data.visions).toHaveLength(2);
      expect(response.data.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: expect.any(Number),
        totalPages: expect.any(Number)
      });

      // Cleanup
      await Promise.all(visionIds.map(id => 
        businessServiceClient.delete(`/api/visions/${id}`).catch(() => {})
      ));
    });

    it('should update vision status and details', async () => {
      // Create vision first
      const createResponse = await businessServiceClient.post('/api/visions', testVision);
      const visionId = createResponse.data.data.id;
      testVision.id = visionId;

      // Update vision
      const updateData = {
        status: 'approved',
        priority: 'high',
        constraints: {
          ...testVision.constraints,
          budget: 10000
        }
      };

      const response = await businessServiceClient.patch(`/api/visions/${visionId}`, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        id: visionId,
        status: 'approved',
        priority: 'high',
        constraints: {
          budget: 10000
        }
      });
    });
  });

  describe('Stakeholder Approval Workflow', () => {
    it('should trigger stakeholder approval process', async () => {
      // Create vision
      const createResponse = await businessServiceClient.post('/api/visions', testVision);
      const visionId = createResponse.data.data.id;
      testVision.id = visionId;

      // Submit for approval
      const response = await businessServiceClient.post(`/api/visions/${visionId}/submit-approval`, {
        stakeholder_ids: ['stakeholder_product', 'stakeholder_business'],
        approval_notes: 'Ready for review'
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        approval_status: 'pending',
        pending_stakeholders: expect.arrayContaining(['stakeholder_product', 'stakeholder_business']),
        approval_deadline: expect.any(String)
      });
    });

    it('should handle stakeholder approval responses', async () => {
      // Create and submit vision for approval
      const createResponse = await businessServiceClient.post('/api/visions', testVision);
      const visionId = createResponse.data.data.id;
      testVision.id = visionId;

      await businessServiceClient.post(`/api/visions/${visionId}/submit-approval`, {
        stakeholder_ids: ['stakeholder_product']
      });

      // Approve as stakeholder
      const approvalResponse = await businessServiceClient.post(`/api/visions/${visionId}/approve`, {
        stakeholder_id: 'stakeholder_product',
        decision: 'approved',
        comments: 'Looks good, proceed with implementation'
      });

      expect(approvalResponse.status).toBe(200);
      expect(approvalResponse.data.data).toMatchObject({
        approval_status: 'approved',
        approved_by: expect.arrayContaining(['stakeholder_product']),
        approval_timestamp: expect.any(String)
      });
    });

    it('should handle stakeholder rejection with feedback', async () => {
      const createResponse = await businessServiceClient.post('/api/visions', testVision);
      const visionId = createResponse.data.data.id;
      testVision.id = visionId;

      await businessServiceClient.post(`/api/visions/${visionId}/submit-approval`, {
        stakeholder_ids: ['stakeholder_business']
      });

      // Reject as stakeholder
      const rejectionResponse = await businessServiceClient.post(`/api/visions/${visionId}/approve`, {
        stakeholder_id: 'stakeholder_business',
        decision: 'rejected',
        comments: 'Budget constraints, please revise requirements',
        required_changes: ['reduce_scope', 'adjust_timeline']
      });

      expect(rejectionResponse.status).toBe(200);
      expect(rejectionResponse.data.data).toMatchObject({
        approval_status: 'rejected',
        rejection_reason: expect.any(String),
        required_changes: expect.arrayContaining(['reduce_scope', 'adjust_timeline'])
      });
    });
  });

  describe('ROI Analysis and Metrics', () => {
    it('should calculate vision ROI analysis', async () => {
      const complexVision = testHelpers.createVisionWorkflow('complex');
      const createResponse = await businessServiceClient.post('/api/visions', complexVision);
      const visionId = createResponse.data.data.id;

      const response = await businessServiceClient.post(`/api/visions/${visionId}/analyze-roi`);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        roi_analysis: {
          estimated_revenue: expect.any(Number),
          implementation_cost: expect.any(Number),
          roi_percentage: expect.any(Number),
          payback_period_months: expect.any(Number),
          risk_factors: expect.any(Array)
        },
        confidence_score: expect.any(Number)
      });

      // Cleanup
      await businessServiceClient.delete(`/api/visions/${visionId}`).catch(() => {});
    });

    it('should track vision portfolio metrics', async () => {
      const response = await businessServiceClient.get('/api/analytics/portfolio-metrics');

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        total_visions: expect.any(Number),
        active_workflows: expect.any(Number),
        completed_projects: expect.any(Number),
        average_completion_time: expect.any(Number),
        success_rate: expect.any(Number),
        total_roi_generated: expect.any(Number)
      });
    });

    it('should provide vision progress analytics', async () => {
      const createResponse = await businessServiceClient.post('/api/visions', testVision);
      const visionId = createResponse.data.data.id;
      testVision.id = visionId;

      const response = await businessServiceClient.get(`/api/visions/${visionId}/analytics`);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        progress_percentage: expect.any(Number),
        time_elapsed: expect.any(Number),
        estimated_completion: expect.any(String),
        milestone_progress: expect.any(Array),
        resource_utilization: expect.any(Object)
      });
    });
  });

  describe('Gemini AI Integration', () => {
    it('should enhance vision analysis with Gemini insights', async () => {
      const response = await businessServiceClient.post('/api/ai/analyze-vision', {
        vision: testVision,
        analysis_type: 'strategic',
        include_market_research: true
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        strategic_insights: expect.any(Array),
        market_analysis: expect.any(Object),
        risk_assessment: expect.any(Array),
        recommendations: expect.any(Array),
        confidence_score: expect.any(Number)
      });
    });

    it('should generate roadmap suggestions', async () => {
      const response = await businessServiceClient.post('/api/ai/generate-roadmap', {
        vision: testVision,
        timeline_preferences: {
          aggressive: false,
          include_buffer: true,
          milestone_frequency: 'weekly'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        roadmap: {
          phases: expect.any(Array),
          milestones: expect.any(Array),
          critical_path: expect.any(Array),
          estimated_duration: expect.any(String)
        },
        alternative_approaches: expect.any(Array)
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle invalid vision data gracefully', async () => {
      const invalidVision = {
        title: '', // Empty title
        description: 'x'.repeat(10000), // Too long description
        stakeholder: 'invalid_stakeholder',
        priority: 'invalid_priority'
      };

      try {
        await businessServiceClient.post('/api/visions', invalidVision);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.code).toBe('VALIDATION_ERROR');
        expect(error.response.data.error.details).toBeDefined();
      }
    });

    it('should handle service dependencies gracefully', async () => {
      // Simulate Core Service being unavailable
      const originalBaseURL = businessServiceClient.defaults.baseURL;
      
      // This would trigger circuit breaker in real implementation
      const response = await businessServiceClient.get('/api/health/dependencies');
      
      expect(response.status).toBe(200);
      expect(response.data.data.services).toMatchObject({
        core_service: expect.objectContaining({
          status: expect.stringMatching(/healthy|degraded/)
        })
      });
    });

    it('should rate limit requests appropriately', async () => {
      // Make rapid requests to test rate limiting
      const requests = Array.from({ length: 10 }, () => 
        businessServiceClient.get('/api/visions')
      );

      const responses = await Promise.allSettled(requests);
      const rateLimitedResponses = responses.filter(r => 
        r.status === 'rejected' && 
        r.reason?.response?.status === 429
      );

      // Should have some rate limited responses
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Event Publishing', () => {
    it('should publish vision events to event bus', async () => {
      // This would be tested with actual event bus in real implementation
      const createResponse = await businessServiceClient.post('/api/visions', testVision);
      const visionId = createResponse.data.data.id;
      testVision.id = visionId;

      // Check that events were published
      const eventsResponse = await businessServiceClient.get(`/api/events?entity_id=${visionId}`);
      
      expect(eventsResponse.status).toBe(200);
      expect(eventsResponse.data.data.events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            event_type: 'vision.created',
            entity_id: visionId
          })
        ])
      );
    });
  });
});