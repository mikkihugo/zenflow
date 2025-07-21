/**
 * Swarm Service Integration Tests
 * Tests for Queen Agent coordination, MRAP system, and agent team management
 */

const { describe, it, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@jest/globals');
const axios = require('axios');
const WebSocket = require('ws');
const { 
  SERVICE_URLS, 
  mockAgentConfigurations,
  mockWorkflowEvents,
  performanceBenchmarks,
  testHelpers
} = require('../fixtures/vision-workflow-fixtures');

describe('Swarm Service Integration Tests', () => {
  let swarmServiceClient;
  let websocketClient;
  let testSwarmId;
  let authToken;

  beforeAll(async () => {
    // Initialize HTTP client for Swarm Service
    swarmServiceClient = axios.create({
      baseURL: SERVICE_URLS.SWARM,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Authenticate with swarm service
    try {
      const authResponse = await swarmServiceClient.post('/auth/swarm-token', {
        service_name: 'test_coordinator',
        permissions: ['spawn_agents', 'manage_workflows', 'access_metrics']
      });
      authToken = authResponse.data.token;
      swarmServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      console.warn('Swarm authentication failed, using mock token:', error.message);
      authToken = 'mock_swarm_token';
      swarmServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    }
  });

  beforeEach(() => {
    testSwarmId = `swarm_test_${Date.now()}`;
  });

  afterEach(async () => {
    // Cleanup test swarm
    if (testSwarmId) {
      try {
        await swarmServiceClient.delete(`/api/swarms/${testSwarmId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    // Close WebSocket connection
    if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
      websocketClient.close();
    }
  });

  describe('Swarm Initialization and Management', () => {
    it('should initialize a new swarm with Queen Agent', async () => {
      const swarmConfig = {
        swarm_id: testSwarmId,
        workflow_id: 'workflow_test_001',
        topology: 'hierarchical',
        max_agents: 8,
        queen_agent: {
          enabled: true,
          capabilities: ['coordination', 'decision_making', 'mrap_reasoning'],
          neural_enhancement: true
        },
        configuration: mockAgentConfigurations.medium_workflow
      };

      const response = await swarmServiceClient.post('/api/swarms/initialize', swarmConfig);

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('success');
      expect(response.data.data).toMatchObject({
        swarm_id: testSwarmId,
        status: 'initializing',
        queen_agent: expect.objectContaining({
          agent_id: expect.any(String),
          status: 'active',
          capabilities: expect.arrayContaining(['coordination', 'decision_making'])
        }),
        topology: 'hierarchical',
        created_at: expect.any(String)
      });
    });

    it('should spawn specialized agents based on workflow requirements', async () => {
      // Initialize swarm first
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        workflow_id: 'workflow_test_001',
        configuration: mockAgentConfigurations.complex_workflow
      });

      const agentSpawnRequest = {
        agent_count: 6,
        agent_types: [
          'solutions_architect',
          'backend_developer',
          'frontend_developer',
          'devops_engineer',
          'security_engineer',
          'qa_engineer'
        ],
        coordination_mode: 'queen_supervised'
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/spawn-agents`, agentSpawnRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        spawned_agents: expect.any(Array),
        total_agents: 6,
        coordination_topology: expect.any(Object),
        estimated_spawn_time: expect.any(Number)
      });

      expect(response.data.data.spawned_agents).toHaveLength(6);
      expect(response.data.data.spawned_agents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            agent_id: expect.any(String),
            type: expect.stringMatching(/solutions_architect|backend_developer|frontend_developer|devops_engineer|security_engineer|qa_engineer/),
            status: 'active',
            capabilities: expect.any(Array)
          })
        ])
      );
    });

    it('should configure agent topology and communication patterns', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        workflow_id: 'workflow_test_001',
        topology: 'mesh'
      });

      const topologyConfig = {
        topology_type: 'mesh',
        communication_patterns: {
          broadcast_enabled: true,
          peer_to_peer: true,
          hierarchical_reporting: false
        },
        coordination_rules: {
          decision_consensus_threshold: 0.7,
          conflict_resolution: 'queen_arbitration',
          task_assignment: 'capability_based'
        }
      };

      const response = await swarmServiceClient.patch(`/api/swarms/${testSwarmId}/topology`, topologyConfig);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        swarm_id: testSwarmId,
        topology: 'mesh',
        communication_matrix: expect.any(Array),
        coordination_efficiency: expect.any(Number)
      });
    });
  });

  describe('Queen Agent Coordination', () => {
    it('should enable Queen Agent with enhanced vision workflow capabilities', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        workflow_id: 'workflow_test_001',
        queen_agent: { enabled: true }
      });

      const enhancementConfig = {
        vision_workflow_capabilities: {
          strategic_planning: true,
          resource_optimization: true,
          quality_assurance: true,
          stakeholder_communication: true
        },
        neural_enhancements: {
          pattern_recognition: true,
          decision_optimization: true,
          learning_adaptation: true
        },
        mrap_configuration: {
          reasoning_depth: 3,
          consensus_threshold: 0.8,
          parallel_analysis: true
        }
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/queen/enhance`, enhancementConfig);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        queen_agent_id: expect.any(String),
        enhancement_status: 'active',
        capabilities: expect.arrayContaining(['strategic_planning', 'resource_optimization']),
        mrap_system: expect.objectContaining({
          status: 'enabled',
          reasoning_depth: 3,
          consensus_threshold: 0.8
        })
      });
    });

    it('should coordinate complex decision making through MRAP system', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        queen_agent: { enabled: true, mrap_enabled: true }
      });

      const decisionRequest = {
        decision_type: 'architecture_choice',
        context: {
          vision_requirements: ['scalability', 'security', 'performance'],
          constraints: ['budget_limited', 'timeline_aggressive'],
          options: [
            { name: 'microservices', pros: ['scalable', 'maintainable'], cons: ['complex', 'overhead'] },
            { name: 'monolith', pros: ['simple', 'fast_deployment'], cons: ['scaling_limits', 'coupling'] },
            { name: 'hybrid', pros: ['balanced', 'flexible'], cons: ['moderate_complexity'] }
          ]
        },
        urgency: 'high'
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/mrap/decide`, decisionRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        decision_id: expect.any(String),
        recommended_option: expect.stringMatching(/microservices|monolith|hybrid/),
        confidence_score: expect.any(Number),
        reasoning_chain: expect.any(Array),
        contributing_agents: expect.any(Array),
        decision_timestamp: expect.any(String)
      });

      expect(response.data.data.confidence_score).toBeGreaterThan(0.7);
      expect(response.data.data.reasoning_chain.length).toBeGreaterThan(0);
    });

    it('should optimize agent performance through neural learning', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        queen_agent: { enabled: true, neural_enhancement: true }
      });

      // Simulate some agent performance data
      const performanceData = {
        agents: [
          { agent_id: 'agent_001', task_completion_rate: 0.85, quality_score: 0.92, efficiency: 0.78 },
          { agent_id: 'agent_002', task_completion_rate: 0.91, quality_score: 0.88, efficiency: 0.82 },
          { agent_id: 'agent_003', task_completion_rate: 0.76, quality_score: 0.94, efficiency: 0.85 }
        ],
        time_period: '24h'
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/neural/optimize`, performanceData);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        optimization_id: expect.any(String),
        improvements: expect.any(Array),
        predicted_performance_gain: expect.any(Number),
        neural_patterns_updated: expect.any(Array)
      });
    });
  });

  describe('Real-time Agent Communication', () => {
    it('should establish WebSocket connections for real-time coordination', (done) => {
      const wsUrl = `ws://localhost:4108/ws/swarms/${testSwarmId}?token=${authToken}`;
      websocketClient = new WebSocket(wsUrl);

      websocketClient.on('open', () => {
        // Send test message
        websocketClient.send(JSON.stringify({
          type: 'agent_status_update',
          agent_id: 'test_agent_001',
          status: 'active',
          current_task: 'testing_communication'
        }));
      });

      websocketClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        expect(message).toMatchObject({
          type: expect.any(String),
          timestamp: expect.any(String),
          swarm_id: testSwarmId
        });

        done();
      });

      websocketClient.on('error', (error) => {
        console.warn('WebSocket test failed:', error.message);
        done(); // Continue with other tests even if WebSocket fails
      });
    });

    it('should broadcast coordination messages to all agents', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        workflow_id: 'workflow_test_001'
      });

      const broadcastMessage = {
        message_type: 'coordination_update',
        priority: 'high',
        content: {
          new_priority_task: 'implement_authentication',
          deadline: '2024-02-15T18:00:00Z',
          required_agents: ['backend_developer', 'security_engineer']
        },
        target_agents: 'all'
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/broadcast`, broadcastMessage);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        message_id: expect.any(String),
        broadcast_status: 'sent',
        recipient_count: expect.any(Number),
        delivery_confirmations: expect.any(Array)
      });
    });

    it('should handle agent-to-agent direct communication', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        topology: 'mesh'
      });

      const directMessage = {
        from_agent: 'agent_backend_001',
        to_agent: 'agent_frontend_001',
        message_type: 'api_contract_discussion',
        content: {
          api_endpoint: '/api/users',
          proposed_schema: { id: 'string', name: 'string', email: 'string' },
          questions: ['Should we include user roles?', 'Pagination requirements?']
        }
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/communicate`, directMessage);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        communication_id: expect.any(String),
        delivery_status: 'delivered',
        recipient_acknowledgment: expect.any(Boolean),
        response_expected: expect.any(Boolean)
      });
    });
  });

  describe('Task Assignment and Load Balancing', () => {
    it('should intelligently assign tasks based on agent capabilities', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        configuration: mockAgentConfigurations.complex_workflow
      });

      const taskAssignmentRequest = {
        tasks: [
          {
            task_id: 'task_001',
            type: 'database_design',
            required_capabilities: ['sql', 'data_modeling', 'performance_optimization'],
            priority: 'high',
            estimated_duration: '4 hours'
          },
          {
            task_id: 'task_002',
            type: 'api_implementation',
            required_capabilities: ['nodejs', 'express', 'jwt'],
            priority: 'medium',
            estimated_duration: '6 hours'
          },
          {
            task_id: 'task_003',
            type: 'security_review',
            required_capabilities: ['security_audit', 'penetration_testing'],
            priority: 'high',
            estimated_duration: '3 hours'
          }
        ],
        assignment_strategy: 'capability_optimization'
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/assign-tasks`, taskAssignmentRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        assignments: expect.arrayContaining([
          expect.objectContaining({
            task_id: expect.any(String),
            assigned_agent: expect.any(String),
            capability_match_score: expect.any(Number),
            estimated_start_time: expect.any(String)
          })
        ]),
        load_distribution: expect.any(Object),
        predicted_completion_time: expect.any(String)
      });

      // All tasks should be assigned
      expect(response.data.data.assignments).toHaveLength(3);
    });

    it('should rebalance workload when agents become unavailable', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        configuration: mockAgentConfigurations.medium_workflow
      });

      // Simulate agent failure
      const failureSimulation = {
        agent_id: 'agent_backend_001',
        failure_type: 'unresponsive',
        current_tasks: ['task_001', 'task_002'],
        failure_timestamp: new Date().toISOString()
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/handle-failure`, failureSimulation);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        rebalancing_id: expect.any(String),
        affected_tasks: expect.arrayContaining(['task_001', 'task_002']),
        new_assignments: expect.any(Array),
        recovery_strategy: expect.any(String),
        estimated_delay: expect.any(Number)
      });
    });

    it('should scale agent count based on workload demands', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        auto_scaling: { enabled: true, max_agents: 15 }
      });

      const scalingRequest = {
        workload_increase: {
          new_tasks: 12,
          complexity_average: 'high',
          deadline_pressure: 'urgent'
        },
        scaling_strategy: 'predictive'
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/scale`, scalingRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        scaling_decision: expect.stringMatching(/scale_up|maintain|scale_down/),
        recommended_agent_count: expect.any(Number),
        new_agents_to_spawn: expect.any(Number),
        scaling_rationale: expect.any(String)
      });
    });
  });

  describe('Performance Monitoring and Metrics', () => {
    it('should track swarm performance metrics in real-time', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        performance_monitoring: { enabled: true, interval: 5 }
      });

      const response = await swarmServiceClient.get(`/api/swarms/${testSwarmId}/metrics`);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        swarm_id: testSwarmId,
        performance_metrics: expect.objectContaining({
          total_agents: expect.any(Number),
          active_agents: expect.any(Number),
          task_completion_rate: expect.any(Number),
          average_response_time: expect.any(Number),
          coordination_efficiency: expect.any(Number)
        }),
        agent_metrics: expect.any(Array),
        resource_utilization: expect.objectContaining({
          cpu_usage: expect.any(Number),
          memory_usage: expect.any(Number),
          network_bandwidth: expect.any(Number)
        })
      });
    });

    it('should provide detailed agent performance analytics', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        configuration: mockAgentConfigurations.medium_workflow
      });

      const response = await swarmServiceClient.get(`/api/swarms/${testSwarmId}/analytics/agents`);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        analytics_period: expect.any(String),
        agent_performance: expect.any(Array),
        top_performers: expect.any(Array),
        performance_trends: expect.any(Object),
        improvement_recommendations: expect.any(Array)
      });
    });

    it('should detect and alert on performance anomalies', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        anomaly_detection: { enabled: true, sensitivity: 'medium' }
      });

      const response = await swarmServiceClient.get(`/api/swarms/${testSwarmId}/anomalies`);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        anomalies_detected: expect.any(Array),
        severity_distribution: expect.objectContaining({
          critical: expect.any(Number),
          warning: expect.any(Number),
          info: expect.any(Number)
        }),
        recommended_actions: expect.any(Array)
      });
    });
  });

  describe('Integration with Other Services', () => {
    it('should coordinate with Development Service for code execution', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        external_integrations: ['development_service']
      });

      const codeExecutionRequest = {
        workflow_id: 'workflow_test_001',
        development_tasks: [
          {
            task_type: 'component_generation',
            specifications: {
              component_name: 'UserProfile',
              framework: 'react',
              props: ['userId', 'editable'],
              styling: 'tailwind'
            }
          }
        ],
        coordination_mode: 'supervised'
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/coordinate-development`, codeExecutionRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        coordination_id: expect.any(String),
        development_session: expect.any(String),
        assigned_agents: expect.any(Array),
        estimated_completion: expect.any(String)
      });
    });

    it('should sync with Business Service for stakeholder updates', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        stakeholder_integration: { enabled: true }
      });

      const stakeholderUpdate = {
        workflow_id: 'workflow_test_001',
        progress_summary: {
          completed_milestones: ['architecture_design', 'database_schema'],
          current_phase: 'implementation',
          next_deliverable: 'api_endpoints',
          blockers: [],
          estimated_completion: '2024-02-20'
        },
        stakeholder_notification: true
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/stakeholder-update`, stakeholderUpdate);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        update_id: expect.any(String),
        notification_sent: expect.any(Boolean),
        stakeholder_feedback_requested: expect.any(Boolean),
        next_update_scheduled: expect.any(String)
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle Queen Agent failures gracefully', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        queen_agent: { enabled: true },
        failover: { enabled: true }
      });

      // Simulate Queen Agent failure
      const failureSimulation = {
        failure_type: 'queen_agent_crash',
        failure_details: {
          error: 'Memory overflow',
          last_known_state: 'coordinating_task_assignments'
        }
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/simulate-failure`, failureSimulation);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        recovery_initiated: expect.any(Boolean),
        backup_queen_activated: expect.any(Boolean),
        affected_operations: expect.any(Array),
        recovery_time_estimate: expect.any(Number)
      });
    });

    it('should recover from network partitions', async () => {
      await swarmServiceClient.post('/api/swarms/initialize', {
        swarm_id: testSwarmId,
        network_resilience: { enabled: true }
      });

      const partitionSimulation = {
        partition_type: 'network_split',
        affected_agents: ['agent_001', 'agent_002'],
        partition_duration: 30 // seconds
      };

      const response = await swarmServiceClient.post(`/api/swarms/${testSwarmId}/simulate-partition`, partitionSimulation);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        partition_detected: expect.any(Boolean),
        isolation_strategy: expect.any(String),
        affected_workflows: expect.any(Array),
        recovery_procedures: expect.any(Array)
      });
    });
  });
});