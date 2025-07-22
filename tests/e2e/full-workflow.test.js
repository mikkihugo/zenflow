/**
 * End-to-End Vision-to-Code Workflow Tests
 * Complete workflow validation from vision creation to deployment
 */

import { describe, it, beforeEach, afterEach, beforeAll, afterAll, expect } from '@jest/globals';
import axios from 'axios';
import WebSocket from 'ws';
import fs from 'fs/promises';
import path from 'path';
import { 
  SERVICE_URLS, 
  WORKFLOW_STAGES,
  mockVisions,
  mockStakeholders,
  mockAgentConfigurations,
  performanceBenchmarks,
  testHelpers
} from '../vision-to-code/fixtures/vision-workflow-fixtures.js';

describe('End-to-End Vision-to-Code Workflow Tests', () => {
  let serviceClients;
  let testWorkflowId;
  let testVisionId;
  let testSwarmId;
  let testSessionId;
  let testWorkspaceDir;
  let authTokens;
  let eventSubscriptions;

  beforeAll(async () => {
    // Initialize clients for all services
    serviceClients = {
      business: axios.create({ 
        baseURL: SERVICE_URLS.BUSINESS,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      }),
      core: axios.create({ 
        baseURL: SERVICE_URLS.CORE,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      }),
      swarm: axios.create({ 
        baseURL: SERVICE_URLS.SWARM,
        timeout: 20000,
        headers: { 'Content-Type': 'application/json' }
      }),
      development: axios.create({ 
        baseURL: SERVICE_URLS.DEVELOPMENT,
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      })
    };

    // Authenticate with all services
    authTokens = {};
    try {
      for (const [serviceName, client] of Object.entries(serviceClients)) {
        try {
          const authResponse = await client.post('/auth/service-token', {
            service_name: `e2e_test_${serviceName}`,
            permissions: ['full_access']
          });
          authTokens[serviceName] = authResponse.data.token;
          client.defaults.headers['Authorization'] = `Bearer ${authTokens[serviceName]}`;
        } catch (error) {
          console.warn(`${serviceName} authentication failed, using mock token:`, error.message);
          authTokens[serviceName] = `mock_${serviceName}_token`;
          client.defaults.headers['Authorization'] = `Bearer ${authTokens[serviceName]}`;
        }
      }
    } catch (error) {
      console.warn('Service authentication setup failed:', error.message);
    }

    // Create test workspace
    testWorkspaceDir = path.join(process.cwd(), 'e2e-test-workspace', `workflow_${Date.now()}`);
    await fs.mkdir(testWorkspaceDir, { recursive: true });

    // Initialize event subscriptions for real-time monitoring
    eventSubscriptions = [];
  });

  beforeEach(() => {
    testWorkflowId = `e2e_workflow_${Date.now()}`;
    testVisionId = `e2e_vision_${Date.now()}`;
    testSwarmId = `e2e_swarm_${Date.now()}`;
    testSessionId = `e2e_session_${Date.now()}`;
  });

  afterEach(async () => {
    // Cleanup all test resources
    const cleanupPromises = [];

    if (testSessionId) {
      cleanupPromises.push(
        serviceClients.development.delete(`/api/sessions/${testSessionId}`).catch(() => {})
      );
    }

    if (testSwarmId) {
      cleanupPromises.push(
        serviceClients.swarm.delete(`/api/swarms/${testSwarmId}`).catch(() => {})
      );
    }

    if (testWorkflowId) {
      cleanupPromises.push(
        serviceClients.core.delete(`/api/workflows/${testWorkflowId}`).catch(() => {})
      );
    }

    if (testVisionId) {
      cleanupPromises.push(
        serviceClients.business.delete(`/api/visions/${testVisionId}`).catch(() => {})
      );
    }

    await Promise.all(cleanupPromises);
  });

  afterAll(async () => {
    // Close event subscriptions
    eventSubscriptions.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    // Cleanup test workspace
    try {
      await fs.rmdir(testWorkspaceDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to cleanup test workspace:', error.message);
    }
  });

  describe('Complete Simple Workflow (Landing Page)', () => {
    it('should execute complete workflow for simple landing page vision', async () => {
      const workflowEvents = [];
      const startTime = Date.now();

      // Stage 1: Create vision in Business Service
      console.log('🎯 Stage 1: Creating vision in Business Service...');
      const visionData = {
        ...mockVisions.simple,
        id: testVisionId,
        title: 'E2E Test Landing Page',
        stakeholder: 'product_team'
      };

      const visionResponse = await serviceClients.business.post('/api/visions', visionData);
      expect(visionResponse.status).toBe(201);
      expect(visionResponse.data.data.id).toBe(testVisionId);
      workflowEvents.push({ stage: 'vision_created', timestamp: Date.now(), data: visionResponse.data.data });

      // Stage 2: Register workflow in Core Service  
      console.log('🏗️ Stage 2: Registering workflow in Core Service...');
      const workflowData = {
        workflow_id: testWorkflowId,
        vision_id: testVisionId,
        type: 'vision_to_code',
        priority: 'medium',
        configuration: mockAgentConfigurations.simple_workflow
      };

      const workflowResponse = await serviceClients.core.post('/api/workflows/register', workflowData);
      expect(workflowResponse.status).toBe(201);
      expect(workflowResponse.data.data.workflow_id).toBe(testWorkflowId);
      workflowEvents.push({ stage: 'workflow_registered', timestamp: Date.now(), data: workflowResponse.data.data });

      // Stage 3: Initialize swarm and spawn agents
      console.log('🐝 Stage 3: Initializing swarm and spawning agents...');
      const swarmConfig = {
        swarm_id: testSwarmId,
        workflow_id: testWorkflowId,
        topology: 'hierarchical',
        queen_agent: { enabled: true },
        configuration: mockAgentConfigurations.simple_workflow
      };

      const swarmResponse = await serviceClients.swarm.post('/api/swarms/initialize', swarmConfig);
      expect(swarmResponse.status).toBe(201);
      expect(swarmResponse.data.data.swarm_id).toBe(testSwarmId);

      // Spawn specialized agents
      const agentSpawnResponse = await serviceClients.swarm.post(`/api/swarms/${testSwarmId}/spawn-agents`, {
        agent_types: ['frontend_developer', 'ui_designer'],
        coordination_mode: 'queen_supervised'
      });
      expect(agentSpawnResponse.status).toBe(200);
      expect(agentSpawnResponse.data.data.spawned_agents.length).toBe(2);
      workflowEvents.push({ stage: 'agents_spawned', timestamp: Date.now(), data: agentSpawnResponse.data.data });

      // Stage 4: Initialize development session
      console.log('💻 Stage 4: Starting development session...');
      const devSessionConfig = {
        session_id: testSessionId,
        workflow_id: testWorkflowId,
        vision: visionData,
        workspace: {
          directory: testWorkspaceDir,
          git_enabled: true,
          auto_commit: true
        },
        swarm_integration: {
          swarm_id: testSwarmId,
          coordination_enabled: true
        }
      };

      const devSessionResponse = await serviceClients.development.post('/api/vision-to-code/initialize', devSessionConfig);
      expect(devSessionResponse.status).toBe(201);
      expect(devSessionResponse.data.data.session_id).toBe(testSessionId);
      workflowEvents.push({ stage: 'development_started', timestamp: Date.now(), data: devSessionResponse.data.data });

      // Stage 5: Execute vision analysis
      console.log('🔍 Stage 5: Analyzing vision requirements...');
      const analysisResponse = await serviceClients.development.post(`/api/vision-to-code/${testSessionId}/analyze`, {
        analysis_depth: 'comprehensive',
        include_architecture: true
      });
      expect(analysisResponse.status).toBe(200);
      expect(analysisResponse.data.data.requirements_analysis).toBeDefined();

      // Stage 6: Generate project structure
      console.log('🏗️ Stage 6: Generating project structure...');
      const structureResponse = await serviceClients.development.post(`/api/vision-to-code/${testSessionId}/generate-structure`, {
        project_type: 'react_typescript',
        features: ['routing', 'styling', 'testing']
      });
      expect(structureResponse.status).toBe(200);
      expect(structureResponse.data.data.files_created.length).toBeGreaterThan(5);

      // Stage 7: Implement landing page features
      console.log('⚡ Stage 7: Implementing landing page features...');
      const featureResponse = await serviceClients.development.post(`/api/vision-to-code/${testSessionId}/implement-feature`, {
        feature_name: 'landing_page',
        specifications: {
          sections: ['header', 'hero', 'features', 'contact'],
          styling: 'modern',
          responsive: true
        },
        include_tests: true
      });
      expect(featureResponse.status).toBe(200);
      expect(featureResponse.data.data.implementation_status).toBe('completed');

      // Stage 8: Quality assurance
      console.log('✅ Stage 8: Running quality assurance...');
      const qaResponse = await serviceClients.development.post(`/api/quality-assurance/${testSessionId}/run-checks`, {
        check_types: ['unit_tests', 'linting', 'type_checking'],
        quality_gates: { test_pass_rate: 100, coverage_minimum: 80 }
      });
      expect(qaResponse.status).toBe(200);
      expect(qaResponse.data.data.overall_quality_score).toBeGreaterThan(80);

      // Stage 9: Update workflow progress
      console.log('📊 Stage 9: Updating workflow progress...');
      const progressResponse = await serviceClients.core.patch(`/api/workflows/${testWorkflowId}`, {
        status: 'completed',
        current_stage: WORKFLOW_STAGES.COMPLETED,
        progress_percentage: 100
      });
      expect(progressResponse.status).toBe(200);
      workflowEvents.push({ stage: 'workflow_completed', timestamp: Date.now(), data: progressResponse.data.data });

      // Validate overall workflow
      const totalDuration = Date.now() - startTime;
      const expectedMaxDuration = performanceBenchmarks.simple_workflow.max_duration_minutes * 60 * 1000;

      expect(totalDuration).toBeLessThan(expectedMaxDuration);
      expect(workflowEvents).toHaveLength(5);

      console.log(`✅ Simple workflow completed in ${totalDuration}ms`);
      console.log('📋 Workflow stages:', workflowEvents.map(e => e.stage));
    }, 600000); // 10 minute timeout for complete workflow
  });

  describe('Complete Medium Workflow (E-commerce Dashboard)', () => {
    it('should execute complete workflow for e-commerce dashboard vision', async () => {
      const workflowEvents = [];
      const startTime = Date.now();

      // Stage 1: Create complex vision
      console.log('🎯 Stage 1: Creating e-commerce dashboard vision...');
      const visionData = {
        ...mockVisions.medium,
        id: testVisionId,
        title: 'E2E Test E-commerce Dashboard',
        stakeholder: 'business_team'
      };

      const visionResponse = await serviceClients.business.post('/api/visions', visionData);
      expect(visionResponse.status).toBe(201);

      // Submit for stakeholder approval
      await serviceClients.business.post(`/api/visions/${testVisionId}/submit-approval`, {
        stakeholder_ids: ['stakeholder_business']
      });

      // Auto-approve for test
      await serviceClients.business.post(`/api/visions/${testVisionId}/approve`, {
        stakeholder_id: 'stakeholder_business',
        decision: 'approved'
      });

      workflowEvents.push({ stage: 'vision_approved', timestamp: Date.now() });

      // Stage 2: Register workflow with medium complexity
      console.log('🏗️ Stage 2: Registering medium complexity workflow...');
      const workflowResponse = await serviceClients.core.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: testVisionId,
        type: 'vision_to_code',
        priority: 'high',
        configuration: mockAgentConfigurations.medium_workflow
      });
      expect(workflowResponse.status).toBe(201);

      // Stage 3: Initialize mesh topology swarm
      console.log('🐝 Stage 3: Initializing mesh topology swarm...');
      const swarmResponse = await serviceClients.swarm.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        workflow_id: testWorkflowId,
        topology: 'mesh',
        queen_agent: { enabled: true, mrap_enabled: true },
        configuration: mockAgentConfigurations.medium_workflow
      });
      expect(swarmResponse.status).toBe(201);

      // Spawn full development team
      const agentSpawnResponse = await serviceClients.swarm.post(`/api/swarms/${testSwarmId}/spawn-agents`, {
        agent_types: ['full_stack_developer', 'data_engineer', 'devops_engineer', 'qa_engineer'],
        coordination_mode: 'collaborative'
      });
      expect(agentSpawnResponse.status).toBe(200);
      expect(agentSpawnResponse.data.data.spawned_agents.length).toBe(4);

      // Stage 4: Initialize development with squad coordination
      console.log('💻 Stage 4: Starting development with squad coordination...');
      const devSessionResponse = await serviceClients.development.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workflow_id: testWorkflowId,
        vision: visionData,
        workspace: { directory: testWorkspaceDir, git_enabled: true },
        squad_integration: { enabled: true, swarm_id: testSwarmId }
      });
      expect(devSessionResponse.status).toBe(201);

      // Stage 5: Execute multi-step development workflow
      console.log('⚡ Stage 5: Executing multi-step development workflow...');
      const workflowResponse2 = await serviceClients.development.post(`/api/claude-integration/${testSessionId}/workflow`, {
        workflow_name: 'ecommerce_dashboard',
        steps: [
          { step: 1, name: 'database_design', instruction: 'Design database schema for e-commerce analytics' },
          { step: 2, name: 'api_development', instruction: 'Implement REST API with analytics endpoints' },
          { step: 3, name: 'dashboard_ui', instruction: 'Create responsive dashboard with charts and tables' },
          { step: 4, name: 'integration_tests', instruction: 'Implement comprehensive integration tests' }
        ]
      });
      expect(workflowResponse2.status).toBe(200);
      expect(workflowResponse2.data.data.steps_completed).toBe(4);

      // Stage 6: Advanced quality assurance
      console.log('✅ Stage 6: Running advanced quality assurance...');
      const qaResponse = await serviceClients.development.post(`/api/quality-assurance/${testSessionId}/run-checks`, {
        check_types: ['unit_tests', 'integration_tests', 'security_scan', 'performance_test'],
        quality_gates: { 
          test_pass_rate: 100, 
          coverage_minimum: 85,
          security_high_severity_max: 0
        }
      });
      expect(qaResponse.status).toBe(200);
      expect(qaResponse.data.data.overall_quality_score).toBeGreaterThan(85);

      // Stage 7: Performance benchmarking
      console.log('🚀 Stage 7: Running performance benchmarks...');
      const perfResponse = await serviceClients.development.post(`/api/performance-testing/${testSessionId}/run`, {
        scenarios: [
          { name: 'dashboard_load', concurrent_users: 50, duration: '1m' },
          { name: 'api_stress', requests_per_second: 500, duration: '30s' }
        ]
      });
      expect(perfResponse.status).toBe(200);
      expect(perfResponse.data.data.benchmark_comparison.meets_targets).toBe(true);

      // Stage 8: Final validation and completion
      console.log('🎉 Stage 8: Final validation and completion...');
      const completionResponse = await serviceClients.core.patch(`/api/workflows/${testWorkflowId}`, {
        status: 'completed',
        current_stage: WORKFLOW_STAGES.COMPLETED,
        progress_percentage: 100,
        completion_metrics: {
          total_files_created: workflowResponse2.data.data.total_files_created,
          quality_score: qaResponse.data.data.overall_quality_score,
          performance_score: perfResponse.data.data.benchmark_comparison.performance_score
        }
      });
      expect(completionResponse.status).toBe(200);

      const totalDuration = Date.now() - startTime;
      const expectedMaxDuration = performanceBenchmarks.medium_workflow.max_duration_minutes * 60 * 1000;

      expect(totalDuration).toBeLessThan(expectedMaxDuration);
      console.log(`✅ Medium complexity workflow completed in ${totalDuration}ms`);
    }, 1200000); // 20 minute timeout for complex workflow
  });

  describe('Service Communication and Event Flow', () => {
    it('should maintain proper event flow across all services', async () => {
      const eventLog = [];
      
      // Set up event monitoring (in real implementation, this would use actual event bus)
      const monitorEvents = async (serviceName, endpoint) => {
        try {
          const response = await serviceClients[serviceName].get(endpoint);
          if (response.data.data.events) {
            eventLog.push(...response.data.data.events.map(e => ({ service: serviceName, ...e })));
          }
        } catch (error) {
          // Continue monitoring despite errors
        }
      };

      // Create simple workflow for event testing
      const visionResponse = await serviceClients.business.post('/api/visions', {
        ...mockVisions.simple,
        id: testVisionId
      });

      const workflowResponse = await serviceClients.core.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: testVisionId,
        type: 'vision_to_code'
      });

      const swarmResponse = await serviceClients.swarm.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        workflow_id: testWorkflowId
      });

      // Monitor events from all services
      await Promise.all([
        monitorEvents('business', `/api/events?entity_id=${testVisionId}`),
        monitorEvents('core', `/api/events/workflow/${testWorkflowId}`),
        monitorEvents('swarm', `/api/events/swarm/${testSwarmId}`)
      ]);

      // Validate event propagation
      expect(eventLog.some(e => e.event_type === 'vision.created')).toBe(true);
      expect(eventLog.some(e => e.event_type === 'workflow.registered')).toBe(true);
      expect(eventLog.some(e => e.event_type === 'swarm.initialized')).toBe(true);

      console.log('📡 Events captured:', eventLog.map(e => `${e.service}:${e.event_type}`));
    });

    it('should handle cross-service coordination requests', async () => {
      // Initialize basic workflow
      await serviceClients.business.post('/api/visions', {
        ...mockVisions.simple,
        id: testVisionId
      });

      await serviceClients.core.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: testVisionId,
        type: 'vision_to_code'
      });

      // Test coordination between services
      const coordinationResponse = await serviceClients.core.post('/api/coordination/request', {
        workflow_id: testWorkflowId,
        coordination_type: 'cross_service_task',
        source_service: 'swarm',
        target_service: 'development',
        payload: {
          task_type: 'code_generation',
          specifications: mockVisions.simple.requirements
        }
      });

      expect(coordinationResponse.status).toBe(200);
      expect(coordinationResponse.data.data).toMatchObject({
        coordination_id: expect.any(String),
        status: 'pending',
        participating_services: expect.arrayContaining(['swarm', 'development'])
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from service failures during workflow execution', async () => {
      // Start workflow
      await serviceClients.business.post('/api/visions', {
        ...mockVisions.simple,
        id: testVisionId
      });

      await serviceClients.core.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: testVisionId,
        type: 'vision_to_code'
      });

      // Simulate service failure and recovery
      const failureResponse = await serviceClients.core.post('/api/circuit-breakers/report-failure', {
        service: 'swarm_service',
        error_type: 'timeout',
        error_message: 'Service timeout during agent spawn'
      });

      expect(failureResponse.status).toBe(200);

      // Check circuit breaker status
      const cbStatus = await serviceClients.core.get('/api/circuit-breakers/status');
      expect(cbStatus.data.data.circuit_breakers.swarm_service.failure_count).toBeGreaterThan(0);

      // Simulate recovery
      const recoveryResponse = await serviceClients.core.post('/api/circuit-breakers/report-success', {
        service: 'swarm_service',
        health_status: 'healthy'
      });

      expect(recoveryResponse.status).toBe(200);
      expect(recoveryResponse.data.data.new_state).toMatch(/closed|half_open/);
    });

    it('should handle workflow timeout and cleanup', async () => {
      // Create workflow with short timeout
      await serviceClients.core.post('/api/workflows/register', {
        workflow_id: testWorkflowId,
        vision_id: 'test_vision',
        type: 'vision_to_code',
        timeout_minutes: 1 // Very short timeout for testing
      });

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 65000)); // 65 seconds

      // Check workflow status
      const statusResponse = await serviceClients.core.get(`/api/workflows/${testWorkflowId}`);
      
      expect(statusResponse.status).toBe(200);
      expect(statusResponse.data.data.status).toMatch(/timeout|failed|cancelled/);
    }, 70000); // 70 second timeout for this test
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent workflows', async () => {
      const concurrentWorkflows = 5;
      const workflowPromises = [];

      for (let i = 0; i < concurrentWorkflows; i++) {
        const visionId = `concurrent_vision_${i}_${Date.now()}`;
        const workflowId = `concurrent_workflow_${i}_${Date.now()}`;

        const workflowPromise = async () => {
          // Create vision
          await serviceClients.business.post('/api/visions', {
            ...mockVisions.simple,
            id: visionId,
            title: `Concurrent Test ${i}`
          });

          // Register workflow
          await serviceClients.core.post('/api/workflows/register', {
            workflow_id: workflowId,
            vision_id: visionId,
            type: 'vision_to_code',
            priority: 'medium'
          });

          return { visionId, workflowId };
        };

        workflowPromises.push(workflowPromise());
      }

      const startTime = Date.now();
      const results = await Promise.allSettled(workflowPromises);
      const endTime = Date.now();

      const successfulWorkflows = results.filter(r => r.status === 'fulfilled').length;
      const totalTime = endTime - startTime;

      expect(successfulWorkflows).toBeGreaterThanOrEqual(4); // At least 80% success rate
      expect(totalTime).toBeLessThan(10000); // Under 10 seconds for initialization

      console.log(`✅ ${successfulWorkflows}/${concurrentWorkflows} concurrent workflows succeeded in ${totalTime}ms`);

      // Cleanup concurrent workflows
      const cleanupPromises = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .map(async ({ visionId, workflowId }) => {
          await serviceClients.core.delete(`/api/workflows/${workflowId}`).catch(() => {});
          await serviceClients.business.delete(`/api/visions/${visionId}`).catch(() => {});
        });

      await Promise.all(cleanupPromises);
    });

    it('should maintain performance under sustained load', async () => {
      const loadTestDuration = 30000; // 30 seconds
      const requestInterval = 500; // 500ms between requests
      const startTime = Date.now();
      const responseTimes = [];

      while (Date.now() - startTime < loadTestDuration) {
        const requestStart = Date.now();
        
        try {
          // Make requests to all services
          await Promise.all([
            serviceClients.business.get('/api/health'),
            serviceClients.core.get('/api/health'),
            serviceClients.swarm.get('/api/health'),
            serviceClients.development.get('/api/health')
          ]);
          
          const responseTime = Date.now() - requestStart;
          responseTimes.push(responseTime);
        } catch (error) {
          // Continue load test despite individual failures
        }

        await new Promise(resolve => setTimeout(resolve, requestInterval));
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

      expect(averageResponseTime).toBeLessThan(500); // Average under 500ms
      expect(p95ResponseTime).toBeLessThan(1000); // P95 under 1 second
      expect(responseTimes.length).toBeGreaterThan(50); // Completed at least 50 requests

      console.log(`📊 Load test: ${responseTimes.length} requests, avg: ${averageResponseTime}ms, p95: ${p95ResponseTime}ms`);
    }, 35000); // 35 second timeout for load test
  });
});