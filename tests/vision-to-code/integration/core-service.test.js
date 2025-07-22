/**
 * Core Service Integration Tests
 * Tests for workflow registry, circuit breakers, and distributed infrastructure
 */

import { describe, it, beforeEach, afterEach, beforeAll, afterAll, expect } from '@jest/globals';
import axios from 'axios';
import { 
  SERVICE_URLS, 
  WORKFLOW_STAGES,
  mockWorkflowEvents,
  errorScenarios,
  performanceBenchmarks,
  testHelpers
} from '../fixtures/vision-workflow-fixtures.js';

describe('Core Service Integration Tests', () => {
  let coreServiceClient;
  let testWorkflowId;
  let authToken;

  beforeAll(async () => {
    // Initialize HTTP client for Core Service
    coreServiceClient = axios.create({
      baseURL: SERVICE_URLS.CORE,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Authenticate with service-to-service token
    try {
      const authResponse = await coreServiceClient.post('/auth/service-token', {
        service_name: 'test_client',
        api_key: testHelpers.generateApiKey()
      });
      authToken = authResponse.data.token;
      coreServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      console.warn('Service authentication failed, using mock token:', error.message);
      authToken = 'mock_service_token';
      coreServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    }
  });

  beforeEach(() => {
    testWorkflowId = `workflow_test_${Date.now()}`;
  });

  afterEach(async () => {
    // Cleanup test workflow
    if (testWorkflowId) {
      try {
        await coreServiceClient.delete(`/api/workflows/${testWorkflowId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Workflow Registry API', () => {
    it('should register a new vision workflow', async () => {
      const workflowData = {
        workflow_id: testWorkflowId,
        vision_id: 'vision_simple_001',
        type: 'vision_to_code',
        priority: 'medium',
        estimated_duration: '2 weeks',
        required_services: ['business', 'swarm', 'development'],
        configuration: {
          agent_topology: 'hierarchical',
          max_parallel_tasks: 5,
          timeout_minutes: 60
        }
      };

      const response = await coreServiceClient.post('/api/workflows/register', workflowData);

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('success');
      expect(response.data.data).toMatchObject({
        workflow_id: testWorkflowId,
        status: 'registered',
        registered_at: expect.any(String),
        service_endpoints: expect.objectContaining({
          business: expect.any(String),
          swarm: expect.any(String),
          development: expect.any(String)
        })
      });
    });

    it('should retrieve workflow status and details', async () => {
      // Register workflow first
      await coreServiceClient.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: 'vision_simple_001',
        type: 'vision_to_code'
      });

      const response = await coreServiceClient.get(`/api/workflows/${testWorkflowId}`);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        workflow_id: testWorkflowId,
        status: expect.any(String),
        registered_at: expect.any(String),
        last_updated: expect.any(String),
        metrics: expect.objectContaining({
          total_tasks: expect.any(Number),
          completed_tasks: expect.any(Number),
          error_count: expect.any(Number)
        })
      });
    });

    it('should list active workflows with filtering', async () => {
      // Register multiple test workflows
      const workflows = [
        { workflow_id: `${testWorkflowId}_1`, type: 'vision_to_code', priority: 'high' },
        { workflow_id: `${testWorkflowId}_2`, type: 'vision_to_code', priority: 'medium' },
        { workflow_id: `${testWorkflowId}_3`, type: 'maintenance', priority: 'low' }
      ];

      await Promise.all(workflows.map(w => 
        coreServiceClient.post('/api/workflows/register', w)
      ));

      // Query with filters
      const response = await coreServiceClient.get('/api/workflows', {
        params: {
          type: 'vision_to_code',
          priority: 'high',
          status: 'registered'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.data.workflows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'vision_to_code',
            priority: 'high'
          })
        ])
      );

      // Cleanup
      await Promise.all(workflows.map(w => 
        coreServiceClient.delete(`/api/workflows/${w.workflow_id}`).catch(() => {})
      ));
    });

    it('should update workflow status and progress', async () => {
      // Register workflow first
      await coreServiceClient.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: 'vision_simple_001',
        type: 'vision_to_code'
      });

      const updateData = {
        status: 'in_progress',
        current_stage: WORKFLOW_STAGES.AGENTS_ASSIGNED,
        progress_percentage: 25,
        metrics: {
          total_tasks: 8,
          completed_tasks: 2,
          active_agents: 3
        }
      };

      const response = await coreServiceClient.patch(`/api/workflows/${testWorkflowId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        workflow_id: testWorkflowId,
        status: 'in_progress',
        current_stage: WORKFLOW_STAGES.AGENTS_ASSIGNED,
        progress_percentage: 25
      });
    });
  });

  describe('Circuit Breaker System', () => {
    it('should detect and handle service failures', async () => {
      const response = await coreServiceClient.get('/api/circuit-breakers/status');

      expect(response.status).toBe(200);
      expect(response.data.data.circuit_breakers).toEqual(
        expect.objectContaining({
          business_service: expect.objectContaining({
            state: expect.stringMatching(/closed|open|half_open/),
            failure_count: expect.any(Number),
            last_failure_time: expect.any(String)
          }),
          swarm_service: expect.objectContaining({
            state: expect.stringMatching(/closed|open|half_open/),
            failure_count: expect.any(Number)
          }),
          development_service: expect.objectContaining({
            state: expect.stringMatching(/closed|open|half_open/),
            failure_count: expect.any(Number)
          })
        })
      );
    });

    it('should trigger circuit breaker on repeated failures', async () => {
      // This would simulate actual service failures in a real environment
      const failureData = {
        service: 'development_service',
        error_type: 'timeout',
        error_message: 'Service timeout after 30 seconds'
      };

      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        await coreServiceClient.post('/api/circuit-breakers/report-failure', failureData);
      }

      const response = await coreServiceClient.get('/api/circuit-breakers/status');
      const developmentCB = response.data.data.circuit_breakers.development_service;

      expect(developmentCB.state).toBe('open');
      expect(developmentCB.failure_count).toBeGreaterThanOrEqual(5);
    });

    it('should recover circuit breaker after service health returns', async () => {
      // Report service recovery
      const recoveryData = {
        service: 'development_service',
        health_status: 'healthy',
        response_time: 150
      };

      const response = await coreServiceClient.post('/api/circuit-breakers/report-success', recoveryData);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        service: 'development_service',
        new_state: expect.stringMatching(/closed|half_open/),
        failure_count_reset: expect.any(Boolean)
      });
    });
  });

  describe('Distributed Metrics and Monitoring', () => {
    it('should collect and aggregate system metrics', async () => {
      const response = await coreServiceClient.get('/api/metrics/system');

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        timestamp: expect.any(String),
        system_health: expect.objectContaining({
          overall_status: expect.stringMatching(/healthy|degraded|critical/),
          active_workflows: expect.any(Number),
          total_agents: expect.any(Number),
          average_response_time: expect.any(Number)
        }),
        service_metrics: expect.objectContaining({
          business_service: expect.any(Object),
          swarm_service: expect.any(Object),
          development_service: expect.any(Object)
        }),
        resource_utilization: expect.objectContaining({
          cpu_usage: expect.any(Number),
          memory_usage: expect.any(Number),
          disk_usage: expect.any(Number)
        })
      });
    });

    it('should track workflow performance metrics', async () => {
      // Register and start a workflow
      await coreServiceClient.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: 'vision_simple_001',
        type: 'vision_to_code'
      });

      const response = await coreServiceClient.get(`/api/metrics/workflow/${testWorkflowId}`);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        workflow_id: testWorkflowId,
        performance_metrics: expect.objectContaining({
          execution_time: expect.any(Number),
          task_completion_rate: expect.any(Number),
          error_rate: expect.any(Number),
          resource_efficiency: expect.any(Number)
        }),
        stage_metrics: expect.any(Array),
        bottlenecks: expect.any(Array)
      });
    });

    it('should provide real-time alerting for anomalies', async () => {
      const response = await coreServiceClient.get('/api/alerts/active');

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        active_alerts: expect.any(Array),
        alert_summary: expect.objectContaining({
          critical: expect.any(Number),
          warning: expect.any(Number),
          info: expect.any(Number)
        }),
        recent_alerts: expect.any(Array)
      });
    });
  });

  describe('Event Processing and Coordination', () => {
    it('should process workflow lifecycle events', async () => {
      // Register workflow
      await coreServiceClient.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: 'vision_simple_001',
        type: 'vision_to_code'
      });

      // Send workflow events
      const events = testHelpers.createWorkflowEvents(testWorkflowId);
      
      for (const event of events) {
        const response = await coreServiceClient.post('/api/events/publish', event);
        expect(response.status).toBe(200);
      }

      // Verify events were processed
      const eventsResponse = await coreServiceClient.get(`/api/events/workflow/${testWorkflowId}`);
      
      expect(eventsResponse.status).toBe(200);
      expect(eventsResponse.data.data.events).toHaveLength(events.length);
    });

    it('should coordinate cross-service communication', async () => {
      const coordinationRequest = {
        workflow_id: testWorkflowId,
        coordination_type: 'agent_assignment',
        source_service: 'business',
        target_service: 'swarm',
        payload: {
          vision_requirements: ['frontend', 'backend', 'database'],
          complexity: 'medium',
          timeline: '4 weeks'
        }
      };

      const response = await coreServiceClient.post('/api/coordination/request', coordinationRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        coordination_id: expect.any(String),
        status: 'pending',
        estimated_completion: expect.any(String),
        participating_services: expect.arrayContaining(['business', 'swarm'])
      });
    });

    it('should handle event replay for failed workflows', async () => {
      const replayRequest = {
        workflow_id: testWorkflowId,
        from_timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        event_types: ['vision.created', 'workflow.registered', 'agents.spawned']
      };

      const response = await coreServiceClient.post('/api/events/replay', replayRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        replay_id: expect.any(String),
        events_to_replay: expect.any(Number),
        status: 'initiated'
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent workflow registrations', async () => {
      const concurrentWorkflows = Array.from({ length: 20 }, (_, i) => ({
        workflow_id: `${testWorkflowId}_concurrent_${i}`,
        vision_id: `vision_${i}`,
        type: 'vision_to_code',
        priority: i % 3 === 0 ? 'high' : 'medium'
      }));

      const startTime = Date.now();
      const responses = await Promise.allSettled(
        concurrentWorkflows.map(w => 
          coreServiceClient.post('/api/workflows/register', w)
        )
      );
      const endTime = Date.now();

      const successfulRegistrations = responses.filter(r => r.status === 'fulfilled').length;
      const registrationTime = endTime - startTime;

      expect(successfulRegistrations).toBeGreaterThan(15); // At least 75% success rate
      expect(registrationTime).toBeLessThan(5000); // Under 5 seconds
      
      // Cleanup
      await Promise.all(concurrentWorkflows.map(w => 
        coreServiceClient.delete(`/api/workflows/${w.workflow_id}`).catch(() => {})
      ));
    });

    it('should maintain performance under load', async () => {
      const loadTestDuration = 30000; // 30 seconds
      const requestInterval = 100; // 100ms between requests
      const startTime = Date.now();
      const responseTimes = [];

      while (Date.now() - startTime < loadTestDuration) {
        const requestStart = Date.now();
        try {
          await coreServiceClient.get('/api/health');
          const responseTime = Date.now() - requestStart;
          responseTimes.push(responseTime);
        } catch (error) {
          // Track errors but continue test
        }
        
        await new Promise(resolve => setTimeout(resolve, requestInterval));
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

      expect(averageResponseTime).toBeLessThan(200); // Average under 200ms
      expect(p95ResponseTime).toBeLessThan(500); // P95 under 500ms
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle service unavailability gracefully', async () => {
      // Simulate service downtime
      const downtimeSimulation = {
        service: 'development_service',
        downtime_duration: 30000, // 30 seconds
        error_type: 'SERVICE_UNAVAILABLE'
      };

      const response = await coreServiceClient.post('/api/simulation/downtime', downtimeSimulation);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        simulation_id: expect.any(String),
        affected_workflows: expect.any(Array),
        fallback_strategies: expect.any(Array)
      });
    });

    it('should recover from database connection failures', async () => {
      const response = await coreServiceClient.get('/api/health/database');

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        database_status: expect.stringMatching(/connected|reconnecting|degraded/),
        connection_pool: expect.objectContaining({
          active_connections: expect.any(Number),
          idle_connections: expect.any(Number),
          total_connections: expect.any(Number)
        }),
        last_check: expect.any(String)
      });
    });

    it('should handle memory pressure and resource constraints', async () => {
      const response = await coreServiceClient.get('/api/resources/status');

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        memory_usage: expect.objectContaining({
          used_percent: expect.any(Number),
          available_mb: expect.any(Number),
          pressure_level: expect.stringMatching(/low|medium|high|critical/)
        }),
        cpu_usage: expect.objectContaining({
          current_percent: expect.any(Number),
          average_percent: expect.any(Number)
        }),
        disk_usage: expect.objectContaining({
          used_percent: expect.any(Number),
          available_gb: expect.any(Number)
        })
      });
    });
  });
});