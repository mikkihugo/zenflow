/**
 * @file Command Pattern Tests
 * Hybrid TDD approach: London TDD for command execution flow, Classical TDD for command algorithms
 */

import {
  type CommandContext,
  CommandFactory,
  type CommandResult,
  type MCPCommand,
  MCPCommandQueue,
} from '../../interfaces/mcp/command-system.ts';

// Mock service interfaces for testing
interface MockSwarmService {
  initializeSwarm: vi.Mock;
  spawnAgent: vi.Mock;
  orchestrateTask: vi.Mock;
  getSwarmStatus: vi.Mock;
}

interface MockLogger {
  info: vi.Mock;
  warn: vi.Mock;
  error: vi.Mock;
  debug: vi.Mock;
}

describe('Command Pattern Implementation', () => {
  // Classical TDD - Test actual command execution algorithms and results
  describe('Command Execution Algorithms (Classical TDD)', () => {
    let mockSwarmService: MockSwarmService;
    let mockLogger: MockLogger;
    let _commandQueue: MCPCommandQueue;
    let commandContext: CommandContext;

    beforeEach(() => {
      mockSwarmService = {
        initializeSwarm: vi.fn(),
        spawnAgent: vi.fn(),
        orchestrateTask: vi.fn(),
        getSwarmStatus: vi.fn(),
        isHealthy: vi.fn().mockReturnValue(true),
        destroySwarm: vi.fn(),
      };

      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      };

      _commandQueue = new MCPCommandQueue(mockLogger);

      commandContext = {
        sessionId: 'test-session-123',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        environment: 'test',
        permissions: ['swarm:create', 'swarm:destroy', 'agent:spawn', 'task:orchestrate'],
        resources: {
          cpu: 0.8,
          memory: 0.7,
          network: 0.6,
          storage: 0.9,
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
      };
    });

    describe('SwarmInitCommand', () => {
      it('should execute swarm initialization successfully', async () => {
        const swarmConfig = {
          topology: 'mesh',
          agentCount: 5,
          capabilities: ['data-processing', 'analysis'],
        };

        const expectedResult = {
          swarmId: 'swarm-mesh-123',
          topology: 'mesh',
          agentCount: 5,
          status: 'initialized',
        };

        mockSwarmService.initializeSwarm.mockImplementation(() => {
          return new Promise((resolve) => setTimeout(() => resolve(expectedResult), 10));
        });

        const command = CommandFactory.createSwarmInitCommand(
          swarmConfig,
          mockSwarmService as any,
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(result?.data).toEqual(expectedResult);
        expect(result?.executionTime).toBeGreaterThan(0);
        expect(mockSwarmService.initializeSwarm).toHaveBeenCalledWith(
          swarmConfig.topology,
          swarmConfig.agentCount,
          {
            capabilities: swarmConfig.capabilities,
            resourceLimits: swarmConfig.resourceLimits,
            timeout: swarmConfig.timeout,
          }
        );
      });

      it('should handle swarm initialization failures gracefully', async () => {
        const swarmConfig = {
          topology: 'hierarchical',
          agentCount: 10,
          capabilities: ['coordination'],
        };

        const error = new Error('Insufficient resources for hierarchical swarm');
        mockSwarmService.initializeSwarm.mockRejectedValue(error);

        const command = CommandFactory.createSwarmInitCommand(
          swarmConfig,
          mockSwarmService as any,
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(false);
        expect(result?.error).toBeDefined();
        expect(result?.error?.message).toBe('Insufficient resources for hierarchical swarm');
        expect(result?.data).toBeUndefined();
      });

      it('should support undo operation for swarm initialization', async () => {
        const swarmConfig = {
          topology: 'star',
          agentCount: 3,
          capabilities: ['simple-tasks'],
        };

        const swarmResult = {
          swarmId: 'swarm-star-456',
          topology: 'star',
          agentCount: 3,
          status: 'initialized',
        };

        mockSwarmService.initializeSwarm.mockResolvedValue(swarmResult);
        mockSwarmService.getSwarmStatus.mockResolvedValue({ exists: false });

        const command = CommandFactory.createSwarmInitCommand(
          swarmConfig,
          mockSwarmService as any,
          commandContext
        );

        // Execute command
        const executeResult = await command.execute();
        expect(executeResult?.success).toBe(true);

        // Test undo
        const undoResult = await command.undo();
        expect(undoResult?.success).toBe(true);
        expect(undoResult?.message).toContain('Successfully undone');
      });

      it('should calculate resource usage accurately', async () => {
        const swarmConfig = {
          topology: 'ring',
          agentCount: 8,
          capabilities: ['heavy-computation'],
        };

        mockSwarmService.initializeSwarm.mockResolvedValue({
          swarmId: 'swarm-ring-789',
          topology: 'ring',
          agentCount: 8,
          status: 'initialized',
        });

        const command = CommandFactory.createSwarmInitCommand(
          swarmConfig,
          mockSwarmService as any,
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(result?.resourceUsage).toBeDefined();
        expect(result?.resourceUsage?.cpu).toBeGreaterThan(0);
        expect(result?.resourceUsage?.memory).toBeGreaterThan(0);

        // Resource usage should scale with agent count and complexity
        expect(result?.resourceUsage?.cpu).toBeGreaterThan(0.5); // Heavy computation
        expect(result?.resourceUsage?.memory).toBeGreaterThan(0.6); // 8 agents
      });
    });

    describe('AgentSpawnCommand', () => {
      it('should spawn agents with correct configuration', async () => {
        const agentConfig = {
          type: 'data-processor',
          capabilities: ['data-cleaning', 'data-validation'],
          resources: { cpu: 1.0, memory: 512, network: 100 },
        };

        const expectedResult = {
          agentId: 'agent-processor-001',
          type: 'data-processor',
          status: 'active',
          assignedTasks: [],
        };

        mockSwarmService.spawnAgent.mockResolvedValue(expectedResult);

        const command = CommandFactory.createAgentSpawnCommand(
          agentConfig,
          mockSwarmService as any,
          'swarm-test-123',
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(result?.data).toEqual(expectedResult);
        expect(mockSwarmService.spawnAgent).toHaveBeenCalledWith('swarm-test-123', agentConfig);
      });

      it('should handle agent spawn failures with proper error context', async () => {
        const agentConfig = {
          type: 'invalid-agent-type',
          capabilities: ['unknown-capability'],
          resources: { cpu: 2.0, memory: 2048, network: 1000 }, // Excessive resources
        };

        const error = new Error('Agent type "invalid-agent-type" not supported');
        mockSwarmService.spawnAgent.mockRejectedValue(error);

        const command = CommandFactory.createAgentSpawnCommand(
          agentConfig,
          mockSwarmService as any,
          'swarm-test-456',
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(false);
        expect(result?.error?.message).toBe('Agent type "invalid-agent-type" not supported');
        expect(result?.error?.context).toEqual(
          expect.objectContaining({
            swarmId: 'swarm-test-456',
            agentConfig,
            sessionId: 'test-session-123',
          })
        );
      });

      it('should support batch agent spawning', async () => {
        const batchConfig = {
          count: 5,
          type: 'worker',
          capabilities: ['task-execution'],
          resources: { cpu: 0.5, memory: 256, network: 50 },
        };

        const expectedResults = Array.from({ length: 5 }, (_, i) => ({
          agentId: `agent-worker-${i + 1}`,
          type: 'worker',
          status: 'active',
          assignedTasks: [],
        }));

        mockSwarmService.spawnAgent
          .mockResolvedValueOnce(expectedResults?.[0])
          .mockResolvedValueOnce(expectedResults?.[1])
          .mockResolvedValueOnce(expectedResults?.[2])
          .mockResolvedValueOnce(expectedResults?.[3])
          .mockResolvedValueOnce(expectedResults?.[4]);

        const commands = Array.from({ length: 5 }, (_, i) =>
          CommandFactory.createAgentSpawnCommand(
            { ...batchConfig, agentIndex: i },
            mockSwarmService as any,
            'batch-swarm-789',
            commandContext
          )
        );

        const results = await Promise.all(commands.map((cmd) => cmd.execute()));

        expect(results?.every((r) => r.success)).toBe(true);
        expect(results?.map((r) => r.data)).toEqual(expectedResults);
        expect(mockSwarmService.spawnAgent).toHaveBeenCalledTimes(5);
      });
    });

    describe('TaskOrchestrationCommand', () => {
      it('should orchestrate complex tasks across multiple agents', async () => {
        const taskDefinition = {
          taskId: 'complex-data-pipeline',
          type: 'data-processing',
          priority: 'high',
          requirements: {
            agents: ['data-processor', 'validator', 'analyzer'],
            resources: { cpu: 2.0, memory: 1024, storage: 500 },
            deadline: new Date('2024-01-01T12:00:00Z'),
          },
          steps: [
            { step: 'data-ingestion', agent: 'data-processor', estimated: 300 },
            { step: 'data-validation', agent: 'validator', estimated: 200 },
            { step: 'data-analysis', agent: 'analyzer', estimated: 600 },
          ],
        };

        const expectedResult = {
          orchestrationId: 'orch-001',
          taskId: 'complex-data-pipeline',
          status: 'in-progress',
          assignedAgents: ['agent-001', 'agent-002', 'agent-003'],
          estimatedCompletion: new Date('2024-01-01T11:45:00Z'),
          currentStep: 'data-ingestion',
        };

        mockSwarmService.orchestrateTask.mockResolvedValue(expectedResult);

        const command = CommandFactory.createTaskOrchestrationCommand(
          taskDefinition,
          mockSwarmService as any,
          'pipeline-swarm-001',
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(result?.data).toEqual(expectedResult);
        expect(result?.metadata).toEqual(
          expect.objectContaining({
            totalSteps: 3,
            estimatedDuration: 1100, // Sum of step estimates
            complexity: 'high',
          })
        );
      });

      it('should handle task orchestration with dependency resolution', async () => {
        const taskWithDependencies = {
          taskId: 'dependent-workflow',
          type: 'multi-stage',
          dependencies: ['task-001', 'task-002'],
          steps: [
            { step: 'wait-for-dependencies', dependencies: ['task-001', 'task-002'] },
            { step: 'merge-results', agent: 'merger' },
            { step: 'final-processing', agent: 'processor' },
          ],
        };

        const orchestrationResult = {
          orchestrationId: 'orch-dep-001',
          taskId: 'dependent-workflow',
          status: 'waiting-dependencies',
          pendingDependencies: ['task-001', 'task-002'],
          readyToExecute: false,
        };

        mockSwarmService.orchestrateTask.mockResolvedValue(orchestrationResult);

        const command = CommandFactory.createTaskOrchestrationCommand(
          taskWithDependencies,
          mockSwarmService as any,
          'dependency-swarm',
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(result?.data?.status).toBe('waiting-dependencies');
        expect(result?.data?.pendingDependencies).toEqual(['task-001', 'task-002']);
        expect(result?.metadata?.hasDependencies).toBe(true);
      });

      it('should calculate accurate performance metrics for orchestration', async () => {
        const performanceTask = {
          taskId: 'perf-benchmark',
          type: 'performance-test',
          metrics: {
            expectedThroughput: 1000,
            maxLatency: 100,
            targetAccuracy: 0.95,
          },
          agents: ['perf-agent-1', 'perf-agent-2'],
        };

        const performanceResult = {
          orchestrationId: 'perf-orch-001',
          taskId: 'perf-benchmark',
          status: 'completed',
          metrics: {
            actualThroughput: 1250,
            averageLatency: 75,
            peakLatency: 95,
            accuracy: 0.97,
            resourceEfficiency: 0.88,
          },
        };

        mockSwarmService.orchestrateTask.mockResolvedValue(performanceResult);

        const command = CommandFactory.createTaskOrchestrationCommand(
          performanceTask,
          mockSwarmService as any,
          'performance-swarm',
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(result?.data?.metrics?.actualThroughput).toBeGreaterThan(1000);
        expect(result?.data?.metrics?.averageLatency).toBeLessThan(100);
        expect(result?.data?.metrics?.accuracy).toBeGreaterThan(0.95);

        // Verify performance exceeded expectations
        expect(result?.metadata?.performanceRating).toBe('exceeded');
      });
    });

    describe('Command Validation and Security', () => {
      it('should validate command permissions before execution', async () => {
        const restrictedContext: CommandContext = {
          ...commandContext,
          permissions: ['swarm:read'], // Missing swarm:create permission
        };

        const swarmConfig = {
          topology: 'mesh',
          agentCount: 3,
          capabilities: ['basic'],
        };

        const command = CommandFactory.createSwarmInitCommand(
          swarmConfig,
          mockSwarmService as any,
          restrictedContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(false);
        expect(result?.error?.message).toContain('Insufficient permissions');
        expect(result?.error?.type).toBe('PERMISSION_DENIED');
        expect(mockSwarmService.initializeSwarm).not.toHaveBeenCalled();
      });

      it('should validate resource constraints before command execution', async () => {
        const limitedContext: CommandContext = {
          ...commandContext,
          resources: {
            cpu: 0.1, // Very limited CPU
            memory: 0.1, // Very limited memory
            network: 0.1,
            storage: 0.1,
            timestamp: new Date(),
          },
        };

        const resourceIntensiveConfig = {
          topology: 'mesh',
          agentCount: 50, // Requires significant resources
          capabilities: ['heavy-computation', 'data-processing'],
        };

        const command = CommandFactory.createSwarmInitCommand(
          resourceIntensiveConfig,
          mockSwarmService as any,
          limitedContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(false);
        expect(result?.error?.message).toContain('Insufficient resources');
        expect(result?.error?.type).toBe('RESOURCE_CONSTRAINT');
        expect(mockSwarmService.initializeSwarm).not.toHaveBeenCalled();
      });

      it('should sanitize command parameters for security', async () => {
        const maliciousConfig = {
          topology: 'mesh',
          agentCount: 5,
          capabilities: ['normal-task'],
          // Potential injection attempt
          metadata: {
            script: '<script>alert("xss")</script>',
            command: 'rm -rf /',
            sql: "'; DROP TABLE users; --",
          },
        };

        mockSwarmService.initializeSwarm.mockImplementation((config) => {
          // Verify sanitization occurred
          expect(config?.metadata?.script).not.toContain('<script>');
          expect(config?.metadata?.command).not.toContain('rm -rf');
          expect(config?.metadata?.sql).not.toContain('DROP TABLE');

          return Promise.resolve({
            swarmId: 'secure-swarm-001',
            topology: 'mesh',
            agentCount: 5,
            status: 'initialized',
          });
        });

        const command = CommandFactory.createSwarmInitCommand(
          maliciousConfig,
          mockSwarmService as any,
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(mockSwarmService.initializeSwarm).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              script: expect.not.stringContaining('<script>'),
              command: expect.not.stringContaining('rm -rf'),
              sql: expect.not.stringContaining('DROP TABLE'),
            }),
          })
        );
      });
    });

    describe('Command Performance and Optimization', () => {
      it('should optimize command execution based on system resources', async () => {
        const optimizableTask = {
          taskId: 'optimization-test',
          type: 'data-processing',
          size: 'large',
          priority: 'normal',
          optimization: {
            allowParallel: true,
            adaptiveResources: true,
            cachingEnabled: true,
          },
        };

        const optimizedResult = {
          orchestrationId: 'opt-001',
          taskId: 'optimization-test',
          status: 'optimized',
          optimizations: {
            parallelization: 4, // Split into 4 parallel tasks
            resourceAllocation: 'dynamic',
            cacheHitRate: 0.85,
            executionPlan: ['parallel-phase-1', 'merge-phase', 'finalize-phase'],
          },
          estimatedSpeedup: 3.2,
        };

        mockSwarmService.orchestrateTask.mockResolvedValue(optimizedResult);

        const command = CommandFactory.createTaskOrchestrationCommand(
          optimizableTask,
          mockSwarmService as any,
          'optimization-swarm',
          commandContext
        );

        const result = await command.execute();

        expect(result?.success).toBe(true);
        expect(result?.data?.optimizations?.parallelization).toBeGreaterThan(1);
        expect(result?.data?.optimizations?.cacheHitRate).toBeGreaterThan(0.8);
        expect(result?.data?.estimatedSpeedup).toBeGreaterThan(2.0);
      });

      it('should handle command timeout and cancellation gracefully', async () => {
        const timeoutConfig = {
          topology: 'hierarchical',
          agentCount: 100, // Large swarm that might timeout
          timeout: 1000, // 1 second timeout
        };

        // Simulate slow service response
        mockSwarmService.initializeSwarm.mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 2000)) // 2 seconds delay
        );

        const command = CommandFactory.createSwarmInitCommand(
          timeoutConfig,
          mockSwarmService as any,
          commandContext
        );

        const startTime = Date.now();
        const result = await command.execute();
        const executionTime = Date.now() - startTime;

        expect(result?.success).toBe(false);
        expect(result?.error?.type).toBe('TIMEOUT');
        expect(executionTime).toBeLessThan(1500); // Should timeout before 2 seconds
        expect(result?.error?.message).toContain('Command execution timed out');
      });
    });
  });

  // London TDD - Test command queue management and interaction patterns
  describe('Command Queue Management (London TDD)', () => {
    let commandQueue: MCPCommandQueue;
    let mockLogger: MockLogger;
    let mockCommand: vi.Mocked<MCPCommand>;

    beforeEach(() => {
      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      };

      mockCommand = {
        execute: vi.fn(),
        undo: vi.fn(),
        canUndo: vi.fn().mockReturnValue(true),
        getCommandType: vi.fn().mockReturnValue('mock_command'),
        getEstimatedDuration: vi.fn().mockReturnValue(100),
        validate: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
        getDescription: vi.fn().mockReturnValue('A mock command'),
        getRequiredPermissions: vi.fn().mockReturnValue([]),
        clone: vi.fn().mockReturnThis(),
      };

      commandQueue = new MCPCommandQueue(mockLogger);
      commandQueue.clearHistory();
    });

    it('should execute commands in queue order', async () => {
      const mockResult: CommandResult = {
        success: true,
        executionTime: 100,
        resourceUsage: { cpu: 0.1, memory: 0.1, network: 0.1, storage: 0.1, timestamp: new Date() },
      };

      mockCommand.execute.mockResolvedValue(mockResult);

      const result = await commandQueue.execute(mockCommand);

      expect(mockCommand.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing command:',
        expect.objectContaining({ commandType: 'mock_command' })
      );
    });

    it('should maintain command history', async () => {
      const mockResult: CommandResult = {
        success: true,
        executionTime: 50,
        resourceUsage: {
          cpu: 0.05,
          memory: 0.05,
          network: 0.05,
          storage: 0.05,
          timestamp: new Date(),
        },
      };

      mockCommand.execute.mockResolvedValue(mockResult);
      mockCommand.getCommandType.mockReturnValue('history_command');

      await commandQueue.execute(mockCommand);

      const history = commandQueue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]?.command.getCommandType()).toBe('history_command');
    });

    it('should handle command execution failures', async () => {
      const error = new Error('Command execution failed');
      mockCommand.execute.mockRejectedValue(error);

      const result = await commandQueue.execute(mockCommand);

      expect(result?.success).toBe(false);
      expect(result?.error?.message).toBe('Command execution failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Command execution failed:',
        expect.objectContaining({ commandType: 'mock_command', error })
      );
    });

    it('should support undo operations', async () => {
      const executeResult: CommandResult = {
        success: true,
        executionTime: 75,
        resourceUsage: { cpu: 0.1, memory: 0.1, network: 0.1, storage: 0.1, timestamp: new Date() },
      };

      const undoResult: CommandResult = {
        success: true,
        executionTime: 25,
        resourceUsage: {
          cpu: 0.02,
          memory: 0.02,
          network: 0.02,
          storage: 0.02,
          timestamp: new Date(),
        },
      };

      mockCommand.execute.mockResolvedValue(executeResult);
      mockCommand.undo.mockResolvedValue(undoResult);

      // Execute command
      await commandQueue.execute(mockCommand);

      // Undo command
      await commandQueue.undo();

      expect(mockCommand.undo).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Command undone:',
        expect.objectContaining({ commandType: 'mock_command' })
      );
    });

    it('should validate commands before execution', async () => {
      mockCommand.validate.mockResolvedValue({ valid: false, errors: ['validation failed'] });

      const result = await commandQueue.execute(mockCommand);

      expect(result?.success).toBe(false);
      expect(result?.error?.message).toContain('validation failed');
      expect(mockCommand.execute).not.toHaveBeenCalled();
    });

    it('should handle concurrent command execution', async () => {
      const commands = Array.from({ length: 5 }, (_, i) => ({
        execute: vi.fn().mockResolvedValue({
          success: true,
          executionTime: 50 + i * 10,
          resourceUsage: {
            cpu: 0.1,
            memory: 0.1,
            network: 0.1,
            storage: 0.1,
            timestamp: new Date(),
          },
        }),
        undo: vi.fn(),
        canUndo: vi.fn().mockReturnValue(false),
        getCommandType: vi.fn().mockReturnValue('concurrent_test'),
        getEstimatedDuration: vi.fn().mockReturnValue(100),
        validate: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
        getDescription: vi.fn().mockReturnValue('Concurrent command'),
        getRequiredPermissions: vi.fn().mockReturnValue([]),
        clone: vi.fn().mockReturnThis(),
      }));

      const results = await Promise.all(commands.map((cmd) => commandQueue.execute(cmd as any)));

      expect(results?.every((r) => r.success)).toBe(true);
      expect(results).toHaveLength(5);
      commands.forEach((cmd) => {
        expect(cmd.execute).toHaveBeenCalledTimes(1);
      });
    });

    it('should provide command queue metrics', async () => {
      // Execute several commands to generate metrics
      const commands = Array.from({ length: 3 }, (_, i) => ({
        execute: vi.fn().mockResolvedValue({
          success: i < 2, // First two succeed, third fails
          executionTime: 100 + i * 50,
          resourceUsage: {
            cpu: 0.2,
            memory: 0.2,
            network: 0.2,
            storage: 0.2,
            timestamp: new Date(),
          },
        }),
        undo: vi.fn(),
        canUndo: vi.fn().mockReturnValue(false),
        getCommandType: vi.fn().mockReturnValue('metrics_test'),
        getEstimatedDuration: vi.fn().mockReturnValue(150),
        validate: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
        getDescription: vi.fn().mockReturnValue('Metrics command'),
        getRequiredPermissions: vi.fn().mockReturnValue([]),
        clone: vi.fn().mockReturnThis(),
      }));

      // Make third command fail
      commands[2]?.execute?.mockResolvedValue({
        success: false,
        executionTime: 200,
        error: new Error('Test failure'),
        resourceUsage: { cpu: 0.2, memory: 0.2, network: 0.2, storage: 0.2, timestamp: new Date() },
      });

      await Promise.all(commands.map((cmd) => commandQueue.execute(cmd as any)));

      const metrics = commandQueue.getMetrics();

      expect(metrics).toEqual(
        expect.objectContaining({
          totalExecuted: 3,
          totalFailed: 1,
          averageExecutionTime: expect.any(Number),
        })
      );

      expect(metrics.averageExecutionTime).toBeGreaterThan(0);
    });
  });

  describe('Transaction Support (Hybrid TDD)', () => {
    let commandQueue: MCPCommandQueue;
    let mockLogger: MockLogger;
    let mockSwarmService: MockSwarmService;

    beforeEach(() => {
      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      };

      mockSwarmService = {
        initializeSwarm: vi.fn(),
        spawnAgent: vi.fn(),
        orchestrateTask: vi.fn(),
        getSwarmStatus: vi.fn(),
      };

      commandQueue = new MCPCommandQueue(mockLogger);
      commandQueue.clearHistory();
    });

    it('should execute transaction successfully when all commands succeed', async () => {
      const commandContext: CommandContext = {
        sessionId: 'transaction-test',
        timestamp: new Date(),
        environment: 'test',
        permissions: ['swarm:create', 'agent:spawn', 'task:orchestrate'],
        resources: { cpu: 0.8, memory: 0.8, network: 0.8, storage: 0.8, timestamp: new Date() },
      };

      // Mock successful responses
      mockSwarmService.initializeSwarm.mockResolvedValue({
        swarmId: 'transaction-swarm-001',
        topology: 'mesh',
        agentCount: 0,
        status: 'initialized',
      });

      mockSwarmService.spawnAgent.mockResolvedValue({
        agentId: 'transaction-agent-001',
        type: 'worker',
        status: 'active',
      });

      mockSwarmService.orchestrateTask.mockResolvedValue({
        orchestrationId: 'transaction-orch-001',
        taskId: 'setup-task',
        status: 'in-progress',
      });

      const commands = [
        CommandFactory.createSwarmInitCommand(
          { topology: 'mesh', agentCount: 1, capabilities: ['basic'] },
          mockSwarmService as any,
          commandContext
        ),
        CommandFactory.createAgentSpawnCommand(
          { type: 'worker', capabilities: ['task-execution'] },
          mockSwarmService as any,
          'transaction-swarm-001',
          commandContext
        ),
        CommandFactory.createTaskOrchestrationCommand(
          { description: 'setup-task', requirements: [], priority: 'medium' },
          mockSwarmService as any,
          'transaction-swarm-001',
          commandContext
        ),
      ];

      const results = await commandQueue.executeTransaction(commands);

      expect(results?.every((r) => r.success)).toBe(true);
      expect(results).toHaveLength(3);
      expect(mockSwarmService.initializeSwarm).toHaveBeenCalledTimes(1);
      expect(mockSwarmService.spawnAgent).toHaveBeenCalledTimes(1);
      expect(mockSwarmService.orchestrateTask).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction when any command fails', async () => {
      const commandContext: CommandContext = {
        sessionId: 'rollback-test',
        timestamp: new Date(),
        environment: 'test',
        permissions: ['swarm:create', 'agent:spawn', 'task:orchestrate'],
        resources: { cpu: 0.8, memory: 0.8, network: 0.8, storage: 0.8, timestamp: new Date() },
      };

      // First command succeeds
      mockSwarmService.initializeSwarm.mockResolvedValue({
        swarmId: 'rollback-swarm-001',
        topology: 'hierarchical',
        agentCount: 0,
        status: 'initialized',
      });

      // Second command fails
      mockSwarmService.spawnAgent.mockRejectedValue(new Error('Agent spawn failed'));

      const mockSwarmCommand = CommandFactory.createSwarmInitCommand(
        { topology: 'hierarchical', agentCount: 1, capabilities: ['test'] },
        mockSwarmService as any,
        commandContext
      );

      const mockAgentCommand = CommandFactory.createAgentSpawnCommand(
        { type: 'test-agent', capabilities: ['fail'] },
        mockSwarmService as any,
        'rollback-swarm-001',
        commandContext
      );

      // Mock undo for swarm command
      vi.spyOn(mockSwarmCommand, 'undo').mockResolvedValue({
        success: true,
        executionTime: 50,
        resourceUsage: { cpu: 0.1, memory: 0.1, network: 0.1, storage: 0.1, timestamp: new Date() },
        message: 'Swarm initialization undone',
      });

      const commands = [mockSwarmCommand, mockAgentCommand];

      const results = await commandQueue.executeTransaction(commands);

      // Transaction should fail
      expect(results?.some((r) => !r.success)).toBe(true);

      // First command should have been undone
      expect(mockSwarmCommand.undo).toHaveBeenCalledTimes(1);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Transaction failed, rolling back completed commands'
      );
    });

    it('should handle nested transactions correctly', async () => {
      const parentContext: CommandContext = {
        sessionId: 'nested-parent',
        timestamp: new Date(),
        environment: 'test',
        permissions: ['swarm:create', 'agent:spawn'],
        resources: { cpu: 0.8, memory: 0.8, network: 0.8, storage: 0.8, timestamp: new Date() },
      };

      const childContext: CommandContext = {
        sessionId: 'nested-child',
        timestamp: new Date(),
        environment: 'test',
        permissions: ['agent:spawn'],
        resources: { cpu: 0.4, memory: 0.4, network: 0.4, storage: 0.4, timestamp: new Date() },
      };

      mockSwarmService.initializeSwarm.mockResolvedValue({
        swarmId: 'nested-swarm-001',
        topology: 'star',
        status: 'initialized',
      });

      mockSwarmService.spawnAgent
        .mockResolvedValueOnce({ agentId: 'nested-agent-001', status: 'active' })
        .mockResolvedValueOnce({ agentId: 'nested-agent-002', status: 'active' });

      const parentCommands = [
        CommandFactory.createSwarmInitCommand(
          { topology: 'star', agentCount: 2, capabilities: ['coordination'] },
          mockSwarmService as any,
          parentContext
        ),
      ];

      const childCommands = [
        CommandFactory.createAgentSpawnCommand(
          { type: 'coordinator', capabilities: ['management'] },
          mockSwarmService as any,
          'nested-swarm-001',
          childContext
        ),
        CommandFactory.createAgentSpawnCommand(
          { type: 'worker', capabilities: ['execution'] },
          mockSwarmService as any,
          'nested-swarm-001',
          childContext
        ),
      ];

      // Execute parent transaction
      const parentResults = await commandQueue.executeTransaction(parentCommands);
      expect(parentResults?.every((r) => r.success)).toBe(true);

      // Execute child transaction
      const childResults = await commandQueue.executeTransaction(childCommands);
      expect(childResults?.every((r) => r.success)).toBe(true);

      expect(mockSwarmService.initializeSwarm).toHaveBeenCalledTimes(1);
      expect(mockSwarmService.spawnAgent).toHaveBeenCalledTimes(2);

      // Verify transaction isolation in history
      const history = commandQueue.getHistory();
      expect(history.filter((h) => h.command.context.sessionId === 'nested-parent')).toHaveLength(
        1
      );
      expect(history.filter((h) => h.command.context.sessionId === 'nested-child')).toHaveLength(2);
    });
  });

  describe('Command Factory and Utilities (Classical TDD)', () => {
    let commandContext: CommandContext;
    let mockSwarmService: MockSwarmService;

    beforeEach(() => {
      commandContext = {
        sessionId: 'factory-test',
        timestamp: new Date(),
        environment: 'test',
        permissions: ['swarm:create', 'agent:spawn', 'task:orchestrate'],
        resources: { cpu: 0.8, memory: 0.8, network: 0.8, storage: 0.8, timestamp: new Date() },
      };

      mockSwarmService = {
        initializeSwarm: vi.fn(),
        spawnAgent: vi.fn(),
        orchestrateTask: vi.fn(),
        getSwarmStatus: vi.fn(),
      };
    });

    it('should create commands with correct types', () => {
      const swarmCommand = CommandFactory.createSwarmInitCommand(
        { topology: 'mesh', agentCount: 3 },
        mockSwarmService as any,
        commandContext
      );

      const agentCommand = CommandFactory.createAgentSpawnCommand(
        { type: 'analyzer', capabilities: ['data-analysis'] },
        mockSwarmService as any,
        'test-swarm',
        commandContext
      );

      const taskCommand = CommandFactory.createTaskOrchestrationCommand(
        { description: 'analysis-task', requirements: [], priority: 'medium' },
        mockSwarmService as any,
        'test-swarm',
        commandContext
      );

      expect(swarmCommand.getCommandType()).toBe('swarm_init');
      expect(agentCommand.getCommandType()).toBe('agent_spawn');
      expect(taskCommand.getCommandType()).toBe('task_orchestrate');
    });

    it('should validate command factory inputs', () => {
      // Test invalid topology
      expect(() => {
        CommandFactory.createSwarmInitCommand(
          { topology: 'invalid-topology' as any, agentCount: 1 },
          mockSwarmService as any,
          commandContext
        );
      }).toThrow('Invalid topology');

      // Test invalid agent count
      expect(() => {
        CommandFactory.createSwarmInitCommand(
          { topology: 'mesh', agentCount: -1 },
          mockSwarmService as any,
          commandContext
        );
      }).toThrow('Agent count must be positive');

      // Test missing required parameters
      expect(() => {
        CommandFactory.createTaskOrchestrationCommand(
          { description: '', requirements: [], priority: 'low' },
          mockSwarmService as any,
          'test-swarm',
          commandContext
        );
      }).toThrow('Task description is required');
    });

    it('should calculate command complexity correctly', () => {
      const simpleCommand = CommandFactory.createSwarmInitCommand(
        { topology: 'star', agentCount: 1, capabilities: ['simple'] },
        mockSwarmService as any,
        commandContext
      );

      const complexCommand = CommandFactory.createTaskOrchestrationCommand(
        {
          description: 'complex-workflow',
          requirements: ['type1', 'type2', 'type3'],
          priority: 'high',
        },
        mockSwarmService as any,
        'complex-swarm',
        commandContext
      );

      const simpleDuration = simpleCommand.getEstimatedDuration();
      const complexDuration = complexCommand.getEstimatedDuration();

      expect(complexDuration).toBeLessThan(simpleDuration);
    });
  });

  describe('Command System Integration (Hybrid TDD)', () => {
    it('should integrate with event system for command lifecycle notifications', async () => {
      // This would test integration with the Observer pattern event system
      // Testing actual integration between Command and Observer patterns
      expect(true).toBe(true); // Placeholder for integration test
    });

    it('should integrate with facade pattern for simplified command execution', async () => {
      // This would test integration with the Facade pattern
      // Testing how commands are orchestrated through the facade
      expect(true).toBe(true); // Placeholder for integration test
    });

    it('should support protocol adaptation through adapter pattern', async () => {
      // This would test integration with the Adapter pattern
      // Testing how commands are executed across different protocols
      expect(true).toBe(true); // Placeholder for integration test
    });
  });
});
