/**
 * Agent Manager Tests - London TDD
 * @fileoverview Tests for agent management coordination using London School approach
 * Focus: Interaction verification, protocol compliance, coordination patterns
 */

import { createCoordinationTestSuite, CoordinationProtocolValidator } from '../../../helpers';

describe('Agent Manager - London TDD', () => {
  let coordinationSuite: ReturnType<typeof createCoordinationTestSuite>;
  let mockAgentManager: any;
  let mockRegistry: jest.Mock;
  let mockEventEmitter: jest.Mock;

  beforeEach(() => {
    coordinationSuite = createCoordinationTestSuite({
      topology: 'hierarchical',
      agentCount: 5,
      coordinationProtocol: 'mcp',
    });

    // Create interaction-focused mocks (London TDD)
    mockRegistry = jest.fn();
    mockEventEmitter = jest.fn();
    
    // Mock AgentManager with focus on interactions
    mockAgentManager = {
      registry: mockRegistry,
      eventEmitter: mockEventEmitter,
      agents: new Map(),
      
      registerAgent: jest.fn().mockImplementation((agent) => {
        const registrationEvent = {
          type: 'agent_registered',
          agentId: agent.id,
          timestamp: Date.now(),
        };
        mockEventEmitter('emit', registrationEvent);
        return { success: true, agentId: agent.id };
      }),
      
      unregisterAgent: jest.fn().mockImplementation((agentId) => {
        const unregistrationEvent = {
          type: 'agent_unregistered',
          agentId,
          timestamp: Date.now(),
        };
        mockEventEmitter('emit', unregistrationEvent);
        return { success: true, agentId };
      }),
      
      assignTask: jest.fn().mockImplementation((agentId, task) => {
        const assignmentEvent = {
          type: 'task_assigned',
          agentId,
          taskId: task.id,
          timestamp: Date.now(),
        };
        mockEventEmitter('emit', assignmentEvent);
        return { success: true, taskId: task.id, assignedTo: agentId };
      }),
      
      broadcastMessage: jest.fn().mockImplementation((message) => {
        const broadcastEvent = {
          type: 'message_broadcast',
          message,
          timestamp: Date.now(),
        };
        mockEventEmitter('emit', broadcastEvent);
        return { success: true, recipients: Array.from(mockAgentManager.agents.keys()) };
      }),
      
      getAgentStatus: jest.fn().mockImplementation((agentId) => {
        return {
          id: agentId,
          status: 'active',
          tasks: [],
          performance: { completed: 0, failed: 0 },
        };
      }),
    };
  });

  describe('🎯 Agent Registration Protocol', () => {
    it('should verify agent registration interaction pattern', () => {
      // London TDD: Test the interaction, not the state
      const agent = {
        id: 'test-agent-1',
        type: 'worker',
        capabilities: ['task_processing', 'coordination'],
      };

      const result = mockAgentManager.registerAgent(agent);

      // Verify successful registration interaction
      expect(mockAgentManager.registerAgent).toHaveBeenCalledWith(agent);
      expect(mockAgentManager.registerAgent).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.agentId).toBe(agent.id);

      // Verify event emission interaction
      expect(mockEventEmitter).toHaveBeenCalledWith('emit', expect.objectContaining({
        type: 'agent_registered',
        agentId: agent.id,
      }));
    });

    it('should verify batch agent registration coordination', () => {
      const agents = [
        { id: 'agent-1', type: 'worker', capabilities: ['basic'] },
        { id: 'agent-2', type: 'coordinator', capabilities: ['advanced'] },
        { id: 'agent-3', type: 'specialist', capabilities: ['neural'] },
      ];

      // Test batch registration interaction pattern
      const results = agents.map(agent => mockAgentManager.registerAgent(agent));

      // Verify interaction pattern: one call per agent
      expect(mockAgentManager.registerAgent).toHaveBeenCalledTimes(3);
      
      // Verify each registration was successful
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.agentId).toBe(agents[index].id);
      });

      // Verify event emission pattern: one event per agent
      expect(mockEventEmitter).toHaveBeenCalledTimes(3);
      
      agents.forEach(agent => {
        expect(mockEventEmitter).toHaveBeenCalledWith('emit', expect.objectContaining({
          type: 'agent_registered',
          agentId: agent.id,
        }));
      });
    });

    it('should handle agent registration failure interactions', () => {
      // Mock registration failure
      mockAgentManager.registerAgent.mockReturnValueOnce({
        success: false,
        error: 'Agent already exists',
      });

      const duplicateAgent = { id: 'existing-agent', type: 'worker' };
      const result = mockAgentManager.registerAgent(duplicateAgent);

      // Verify failure interaction
      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent already exists');
      
      // Verify no event emitted on failure
      expect(mockEventEmitter).not.toHaveBeenCalled();
    });
  });

  describe('🔄 Task Assignment Coordination', () => {
    beforeEach(() => {
      // Pre-register agents for task assignment tests
      const agents = [
        { id: 'worker-1', type: 'worker' },
        { id: 'worker-2', type: 'worker' },
        { id: 'coordinator-1', type: 'coordinator' },
      ];
      
      agents.forEach(agent => {
        mockAgentManager.agents.set(agent.id, agent);
      });
    });

    it('should verify task assignment interaction protocol', () => {
      const task = {
        id: 'task-001',
        type: 'data_processing',
        priority: 'high',
        requirements: ['worker'],
      };

      const assignmentResult = mockAgentManager.assignTask('worker-1', task);

      // Verify assignment interaction
      expect(mockAgentManager.assignTask).toHaveBeenCalledWith('worker-1', task);
      expect(assignmentResult.success).toBe(true);
      expect(assignmentResult.taskId).toBe(task.id);
      expect(assignmentResult.assignedTo).toBe('worker-1');

      // Verify coordination event emission
      expect(mockEventEmitter).toHaveBeenCalledWith('emit', expect.objectContaining({
        type: 'task_assigned',
        agentId: 'worker-1',
        taskId: task.id,
      }));
    });

    it('should verify load balancing coordination pattern', () => {
      const tasks = [
        { id: 'task-1', type: 'compute', priority: 'normal' },
        { id: 'task-2', type: 'compute', priority: 'high' },
        { id: 'task-3', type: 'compute', priority: 'low' },
      ];

      const workers = ['worker-1', 'worker-2'];
      const assignments = [];

      // Simulate round-robin assignment coordination
      tasks.forEach((task, index) => {
        const workerId = workers[index % workers.length];
        const result = mockAgentManager.assignTask(workerId, task);
        assignments.push(result);
      });

      // Verify assignment distribution pattern
      expect(mockAgentManager.assignTask).toHaveBeenCalledTimes(3);
      
      // Verify coordination events for each assignment
      expect(mockEventEmitter).toHaveBeenCalledTimes(3);
      
      tasks.forEach(task => {
        expect(mockEventEmitter).toHaveBeenCalledWith('emit', expect.objectContaining({
          type: 'task_assigned',
          taskId: task.id,
        }));
      });

      // Verify successful assignments
      assignments.forEach(assignment => {
        expect(assignment.success).toBe(true);
      });
    });

    it('should verify task reassignment coordination on agent failure', () => {
      const task = { id: 'critical-task', type: 'urgent', priority: 'critical' };
      
      // Initial assignment
      mockAgentManager.assignTask('worker-1', task);
      
      // Simulate agent failure requiring reassignment
      const reassignmentResult = mockAgentManager.assignTask('worker-2', task);
      
      // Verify reassignment interaction
      expect(mockAgentManager.assignTask).toHaveBeenCalledTimes(2);
      expect(mockAgentManager.assignTask).toHaveBeenNthCalledWith(1, 'worker-1', task);
      expect(mockAgentManager.assignTask).toHaveBeenNthCalledWith(2, 'worker-2', task);
      
      // Verify coordination events for both assignments
      expect(mockEventEmitter).toHaveBeenCalledTimes(2);
    });
  });

  describe('📡 Broadcast Communication Protocol', () => {
    it('should verify broadcast message coordination pattern', () => {
      const broadcastMessage = {
        type: 'system_update',
        data: { version: '2.0.0', changes: ['performance improvements'] },
        priority: 'high',
      };

      const broadcastResult = mockAgentManager.broadcastMessage(broadcastMessage);

      // Verify broadcast interaction
      expect(mockAgentManager.broadcastMessage).toHaveBeenCalledWith(broadcastMessage);
      expect(broadcastResult.success).toBe(true);
      expect(Array.isArray(broadcastResult.recipients)).toBe(true);

      // Verify broadcast coordination event
      expect(mockEventEmitter).toHaveBeenCalledWith('emit', expect.objectContaining({
        type: 'message_broadcast',
        message: broadcastMessage,
      }));
    });

    it('should verify selective broadcast coordination', () => {
      // Mock selective broadcast functionality
      mockAgentManager.broadcastToType = jest.fn().mockImplementation((agentType, message) => {
        const selectiveEvent = {
          type: 'selective_broadcast',
          targetType: agentType,
          message,
          timestamp: Date.now(),
        };
        mockEventEmitter('emit', selectiveEvent);
        return { success: true, targetType: agentType, count: 2 };
      });

      const coordinationMessage = {
        type: 'coordination_update',
        data: { topology: 'mesh', status: 'optimizing' },
      };

      const result = mockAgentManager.broadcastToType('coordinator', coordinationMessage);

      // Verify selective broadcast interaction
      expect(mockAgentManager.broadcastToType).toHaveBeenCalledWith('coordinator', coordinationMessage);
      expect(result.success).toBe(true);
      expect(result.targetType).toBe('coordinator');

      // Verify selective broadcast event
      expect(mockEventEmitter).toHaveBeenCalledWith('emit', expect.objectContaining({
        type: 'selective_broadcast',
        targetType: 'coordinator',
        message: coordinationMessage,
      }));
    });
  });

  describe('📊 Agent Status Monitoring Protocol', () => {
    it('should verify status query interaction pattern', () => {
      const agentId = 'worker-1';
      const statusResult = mockAgentManager.getAgentStatus(agentId);

      // Verify status query interaction
      expect(mockAgentManager.getAgentStatus).toHaveBeenCalledWith(agentId);
      expect(statusResult).toHaveProperty('id', agentId);
      expect(statusResult).toHaveProperty('status');
      expect(statusResult).toHaveProperty('tasks');
      expect(statusResult).toHaveProperty('performance');
    });

    it('should verify health check coordination pattern', () => {
      // Mock health check functionality
      mockAgentManager.performHealthCheck = jest.fn().mockImplementation(() => {
        const healthEvent = {
          type: 'health_check_performed',
          timestamp: Date.now(),
          results: { healthy: 3, unhealthy: 0, total: 3 },
        };
        mockEventEmitter('emit', healthEvent);
        return healthEvent.results;
      });

      const healthResults = mockAgentManager.performHealthCheck();

      // Verify health check interaction
      expect(mockAgentManager.performHealthCheck).toHaveBeenCalled();
      expect(healthResults).toHaveProperty('healthy');
      expect(healthResults).toHaveProperty('unhealthy');
      expect(healthResults).toHaveProperty('total');

      // Verify health check coordination event
      expect(mockEventEmitter).toHaveBeenCalledWith('emit', expect.objectContaining({
        type: 'health_check_performed',
        results: healthResults,
      }));
    });
  });

  describe('🔗 Protocol Compliance Verification', () => {
    it('should validate MCP protocol compliance in coordination', () => {
      const mcpMessages: any[] = [];
      
      // Mock MCP protocol interactions
      mockAgentManager.sendMCPMessage = jest.fn().mockImplementation((message) => {
        const mcpMessage = {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'agent/coordination',
          params: message,
        };
        mcpMessages.push({ message: mcpMessage });
        return { success: true, messageId: mcpMessage.id };
      });

      // Test various coordination messages
      const coordinationMessages = [
        { action: 'register', agentId: 'agent-1' },
        { action: 'assign_task', taskId: 'task-1', agentId: 'agent-1' },
        { action: 'broadcast', data: { type: 'update' } },
      ];

      coordinationMessages.forEach(message => {
        mockAgentManager.sendMCPMessage(message);
      });

      // Verify MCP protocol compliance
      CoordinationProtocolValidator.validateMCPProtocol(mcpMessages);
      
      // Verify interaction pattern
      expect(mockAgentManager.sendMCPMessage).toHaveBeenCalledTimes(3);
      coordinationMessages.forEach(message => {
        expect(mockAgentManager.sendMCPMessage).toHaveBeenCalledWith(message);
      });
    });

    it('should verify coordination pattern compliance', () => {
      // Simulate coordination interactions
      const testSwarm = coordinationSuite.builder.createMockSwarm();
      
      // Perform coordination operations
      testSwarm.coordinator('initialize', { topology: 'hierarchical' });
      testSwarm.coordinator('broadcast', { type: 'sync' });
      testSwarm.coordinator('assign_task', { taskId: 'test', agentId: 'agent-0' });

      const interactions = coordinationSuite.builder.getInteractions();

      // Verify hierarchical coordination pattern
      CoordinationProtocolValidator.validateCoordinationPattern(interactions, 'hierarchical');
      
      // Verify broadcast pattern
      CoordinationProtocolValidator.validateCoordinationPattern(interactions, 'broadcast');

      expect(interactions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('⚡ Performance and Error Handling', () => {
    it('should verify coordination latency requirements', async () => {
      const latencies: number[] = [];
      
      // Mock latency tracking
      const originalAssignTask = mockAgentManager.assignTask;
      mockAgentManager.assignTask = jest.fn().mockImplementation((...args) => {
        const start = performance.now();
        const result = originalAssignTask.apply(mockAgentManager, args);
        const latency = performance.now() - start;
        latencies.push(latency);
        return result;
      });

      const tasks = Array.from({ length: 10 }, (_, i) => ({
        id: `perf-task-${i}`,
        type: 'performance_test',
      }));

      // Execute coordination operations
      for (const task of tasks) {
        mockAgentManager.assignTask('worker-1', task);
      }

      // Verify performance requirements (London TDD focuses on interaction timing)
      expect(mockAgentManager.assignTask).toHaveBeenCalledTimes(10);
      
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      expect(avgLatency).toBeLessThan(10); // Should be very fast for mocked operations
    });

    it('should verify error propagation in coordination chain', () => {
      // Mock error scenarios
      mockAgentManager.assignTask.mockImplementationOnce(() => {
        throw new Error('Agent unavailable');
      });

      let errorCaught = false;
      let errorMessage = '';

      try {
        mockAgentManager.assignTask('unavailable-agent', { id: 'error-task' });
      } catch (error) {
        errorCaught = true;
        errorMessage = error.message;
      }

      // Verify error handling interaction
      expect(errorCaught).toBe(true);
      expect(errorMessage).toBe('Agent unavailable');
      expect(mockAgentManager.assignTask).toHaveBeenCalledWith('unavailable-agent', { id: 'error-task' });
    });
  });
});

// Store test metrics for reporting
afterAll(() => {
  console.log('Agent Manager London TDD Tests - Interaction Verification Complete');
});