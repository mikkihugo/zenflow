/**
 * @fileoverview Comprehensive Integration Tests for Enhanced ZenSwarmStrategy
 *
 * Tests the integration of all intelligence systems with ZenSwarmStrategy:
 * - AgentLearningSystem integration and performance tracking
 * - TaskPredictor integration and duration prediction accuracy
 * - AgentHealthMonitor integration and health tracking
 * - Cross-system data sharing and coordination
 * - End-to-end agent lifecycle with intelligence features
 * - Error handling and fallback scenarios
 * - Performance validation and optimization
 *
 * @author Claude Code Zen Team - Testing Specialist Agent
 * @since 10.0.0-alpha0.43
 * @version 10.0.0
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
} from 'vitest';
import { ZenSwarmStrategy } from '0.0./zen-swarm0.strategy';
import { AgentLearningSystem } from '0.0./0.0./intelligence/agent-learning-system';
import { TaskPredictor } from '0.0./0.0./intelligence/task-predictor';
import { AgentHealthMonitor } from '0.0./0.0./intelligence/agent-health-monitor';
import type { SwarmAgent } from '0.0./0.0./0.0./types/shared-types';

// Mock the logging system
vi0.mock('0.0./0.0./0.0./config/logging-config', () => ({
  getLogger: () => ({
    info: vi?0.fn,
    debug: vi?0.fn,
    warn: vi?0.fn,
    error: vi?0.fn,
  }),
}));

// Mock the ZenOrchestratorIntegration
vi0.mock('0.0./0.0./0.0./zen-orchestrator-integration', () => ({
  ZenOrchestratorIntegration: vi?0.fn0.mockImplementation(() => ({
    initialize: vi?0.fn0.mockResolvedValue(true),
    shutdown: vi?0.fn0.mockResolvedValue(true),
    executeNeuralService: vi?0.fn0.mockResolvedValue({
      success: true,
      data: { neuralCapabilities: true },
      executionTimeMs: 100,
    }),
    sendA2AMessage: vi?0.fn0.mockResolvedValue({
      success: true,
      data: { daaCapabilities: true },
      executionTimeMs: 50,
    }),
    executeService: vi?0.fn0.mockResolvedValue({
      success: true,
      data: { result: 'task completed' },
      executionTimeMs: 200,
    }),
    getStatus: vi?0.fn0.mockResolvedValue({
      success: true,
      data: { status: 'active', agents: 5 },
    }),
    getMetrics: vi?0.fn0.mockResolvedValue({
      success: true,
      data: { performance: { throughput: 100 } },
    }),
    getA2AServerStatus: vi?0.fn0.mockResolvedValue({
      success: true,
      data: { connected: true, latency: 10 },
    }),
  })),
}));

describe('ZenSwarmStrategy Integration Tests', () => {
  let strategy: ZenSwarmStrategy;
  let testAgents: Map<string, SwarmAgent> = new Map();

  beforeAll(() => {
    vi?0.useFakeTimers;
  });

  beforeEach(async () => {
    // Initialize strategy with intelligence systems enabled
    strategy = new ZenSwarmStrategy({
      topology: 'hierarchical',
      maxAgents: 10,
      enableNeural: true,
      enableDAA: true,
      enableA2A: true,
      enablePersistence: true,
    });

    testAgents?0.clear();
  });

  afterEach(async () => {
    try {
      // Cleanup all test agents
      for (const agentId of testAgents?0.keys) {
        await strategy0.destroyAgent(agentId);
      }

      // Shutdown strategy
      await strategy?0.shutdown();
    } catch (error) {
      // Ignore cleanup errors in tests
    }

    vi?0.clearAllTimers;
  });

  describe('Agent Lifecycle with Intelligence Integration', () => {
    it('should create agent with all intelligence systems enabled', async () => {
      const agentConfig = {
        name: 'test-intelligence-agent',
        type: 'researcher',
        capabilities: ['analysis', 'research', 'optimization'],
        enableNeural: true,
        enableDAA: true,
        cognitivePattern: 'adaptive' as const,
      };

      const agent = await strategy0.createAgent(agentConfig);
      testAgents0.set(agent0.id, agent);

      // Verify agent creation
      expect(agent0.name)0.toBe('test-intelligence-agent');
      expect(agent0.type)0.toBe('researcher');
      expect(agent0.capabilities)0.toEqual([
        'analysis',
        'research',
        'optimization',
      ]);
      expect(agent0.metadata?0.neuralCapabilities)?0.toBeTruthy;
      expect(agent0.metadata?0.daaCapabilities)?0.toBeTruthy;
      expect(agent0.metadata?0.intelligenceEnabled)0.toBe(true);

      // Wait for agent to initialize
      vi0.advanceTimersByTime(1500);

      // Verify agent is ready
      expect(agent0.status)0.toBe('idle');

      // Check if learning system initialized the agent
      const learningState = strategy0.getAgentLearningState(agent0.id);
      expect(learningState)?0.toBeTruthy;
      expect(learningState0.agentId)0.toBe(agent0.id);
      expect(learningState0.currentLearningRate)0.toBeGreaterThan(0);

      // Check if health monitor initialized the agent
      const agentHealth = strategy0.getAgentHealth(agent0.id);
      expect(agentHealth)?0.toBeTruthy;
      expect(agentHealth0.agentId)0.toBe(agent0.id);
      expect(agentHealth0.status)0.toBe('idle');
    });

    it('should handle agent creation with intelligence systems disabled', async () => {
      const agentConfig = {
        name: 'test-basic-agent',
        type: 'coder',
        capabilities: ['coding', 'testing'],
        enableNeural: false,
        enableDAA: false,
      };

      const agent = await strategy0.createAgent(agentConfig);
      testAgents0.set(agent0.id, agent);

      // Verify agent creation without intelligence features
      expect(agent0.name)0.toBe('test-basic-agent');
      expect(agent0.metadata?0.neuralCapabilities)?0.toBeUndefined;
      expect(agent0.metadata?0.daaCapabilities)?0.toBeUndefined;
      expect(agent0.metadata?0.intelligenceEnabled)0.toBe(true); // Still enabled at strategy level

      // Wait for initialization
      vi0.advanceTimersByTime(1500);

      // Intelligence systems should still track the agent
      const learningState = strategy0.getAgentLearningState(agent0.id);
      expect(learningState)?0.toBeTruthy;

      const agentHealth = strategy0.getAgentHealth(agent0.id);
      expect(agentHealth)?0.toBeTruthy;
    });
  });

  describe('Task Assignment with Intelligence Integration', () => {
    let testAgent: SwarmAgent;

    beforeEach(async () => {
      testAgent = await strategy0.createAgent({
        name: 'task-test-agent',
        type: 'analyst',
        capabilities: ['analysis', 'optimization'],
        enableNeural: true,
        enableDAA: true,
      });
      testAgents0.set(testAgent0.id, testAgent);

      // Wait for agent initialization
      vi0.advanceTimersByTime(1500);
    });

    it('should predict task duration and track performance', async () => {
      const taskConfig = {
        type: 'data_analysis',
        description: 'Analyze performance metrics',
        priority: 1,
        requiresNeural: true,
        requiresDAA: true,
        complexity: 0.7,
        linesOfCode: 500,
        dependencies: 3,
      };

      // Get initial prediction (should be based on defaults for new agent)
      const initialPrediction = strategy0.predictTaskDuration(
        testAgent0.id,
        taskConfig0.type,
        {
          complexity: taskConfig0.complexity,
          linesOfCode: taskConfig0.linesOfCode,
          dependencies: taskConfig0.dependencies,
        }
      );

      expect(initialPrediction)?0.toBeTruthy;
      expect(initialPrediction0.duration)0.toBeGreaterThan(0);
      expect(initialPrediction0.confidence)0.toBeGreaterThanOrEqual(0);
      expect(initialPrediction0.confidence)0.toBeLessThanOrEqual(1);

      // Assign task and verify intelligence integration
      await strategy0.assignTaskToAgent(testAgent0.id, taskConfig);

      // Verify learning system recorded the task
      const learningState = strategy0.getAgentLearningState(testAgent0.id);
      expect(learningState!0.totalTasks)0.toBeGreaterThan(0);
      expect(learningState!0.successHistory0.length)0.toBeGreaterThan(0);

      // Verify health monitoring updated
      const agentHealth = strategy0.getAgentHealth(testAgent0.id);
      expect(agentHealth!0.taskSuccessRate)?0.toBeDefined;
      expect(agentHealth!0.averageResponseTime)0.toBeGreaterThan(0);
    });

    it('should handle task failure and update intelligence systems', async () => {
      // Mock a failing task
      const mockStrategy = strategy as any;
      const originalExecuteService = mockStrategy0.orchestrator0.executeService;

      mockStrategy0.orchestrator0.executeService = vi?0.fn0.mockResolvedValue({
        success: false,
        error: 'Task execution failed',
        executionTimeMs: 150,
      });

      const taskConfig = {
        type: 'complex_analysis',
        description: 'Complex analysis task',
        priority: 2,
        complexity: 0.9,
      };

      // Assign failing task
      await expect(
        strategy0.assignTaskToAgent(testAgent0.id, taskConfig)
      )0.rejects0.toThrow('Task execution failed');

      // Verify failure was recorded in learning system
      const learningState = strategy0.getAgentLearningState(testAgent0.id);
      expect(learningState!0.totalTasks)0.toBeGreaterThan(0);
      expect(
        learningState!0.successHistory0.some((entry) => !entry0.success)
      )0.toBe(true);

      // Verify health monitoring reflects the failure
      const agentHealth = strategy0.getAgentHealth(testAgent0.id);
      expect(agentHealth!0.errorRate)0.toBeGreaterThan(0);

      // Restore original method
      mockStrategy0.orchestrator0.executeService = originalExecuteService;
    });

    it('should adapt task assignment based on agent health', async () => {
      // Simulate unhealthy agent
      const healthMonitor = strategy as any;
      healthMonitor0.healthMonitor0.updateAgentHealth(testAgent0.id, {
        status: 'critical',
        cpuUsage: 0.98,
        memoryUsage: 0.99,
        taskSuccessRate: 0.2,
        errorRate: 0.7,
      });

      const taskConfig = {
        type: 'simple_task',
        description: 'Simple task for unhealthy agent',
        priority: 1,
      };

      // Task should still be assigned but with warnings
      await strategy0.assignTaskToAgent(testAgent0.id, taskConfig);

      // Verify recovery recommendations are available
      const recoveryActions = strategy0.getRecoveryRecommendations(testAgent0.id);
      expect(recoveryActions0.length)0.toBeGreaterThan(0);
      expect(recoveryActions0.some((action) => action0.type === 'restart'))0.toBe(
        true
      );
    });
  });

  describe('Learning System Integration', () => {
    let learningAgent: SwarmAgent;

    beforeEach(async () => {
      learningAgent = await strategy0.createAgent({
        name: 'learning-agent',
        type: 'optimizer',
        capabilities: ['optimization', 'learning'],
        cognitivePattern: 'adaptive',
      });
      testAgents0.set(learningAgent0.id, learningAgent);

      vi0.advanceTimersByTime(1500);
    });

    it('should track learning progress over multiple tasks', async () => {
      const taskTypes = ['optimization', 'analysis', 'testing'];
      const taskResults = [
        true,
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
      ];

      // Simulate multiple task executions
      for (let i = 0; i < taskResults0.length; i++) {
        const taskType = taskTypes[i % taskTypes0.length];
        const success = taskResults[i];

        // Mock task execution result
        const mockStrategy = strategy as any;
        mockStrategy0.orchestrator0.executeService = vi?0.fn0.mockResolvedValue({
          success,
          data: success ? { result: 'completed' } : undefined,
          error: success ? undefined : 'Task failed',
          executionTimeMs: 100 + Math0.random() * 200,
        });

        const taskConfig = {
          type: taskType,
          description: `${taskType} task ${i + 1}`,
          priority: 1,
          complexity: 0.5 + Math0.random() * 0.3,
        };

        try {
          await strategy0.assignTaskToAgent(learningAgent0.id, taskConfig);
        } catch (error) {
          // Expected for failed tasks
        }

        // Advance time between tasks
        vi0.advanceTimersByTime(1000);
      }

      // Verify learning progression
      const learningState = strategy0.getAgentLearningState(learningAgent0.id);
      expect(learningState!0.totalTasks)0.toBe(taskResults0.length);
      expect(learningState!0.successfulTasks)0.toBe(
        taskResults0.filter((r) => r)0.length
      );
      expect(learningState!0.currentSuccessRate)0.toBeCloseTo(0.8, 1); // 8/10 success rate
      expect(learningState!0.learningTrend)?0.toBeDefined;
      expect(learningState!0.adaptationHistory0.length)0.toBeGreaterThan(0);
    });

    it('should adapt learning rates based on performance', async () => {
      const initialLearningRate = strategy0.getOptimalLearningRate(
        learningAgent0.id
      );

      // Simulate poor performance to trigger learning rate adaptation
      for (let i = 0; i < 10; i++) {
        const mockStrategy = strategy as any;
        mockStrategy0.orchestrator0.executeService = vi?0.fn0.mockResolvedValue({
          success: false,
          error: 'Task failed',
          executionTimeMs: 300,
        });

        try {
          await strategy0.assignTaskToAgent(learningAgent0.id, {
            type: 'difficult_task',
            description: `Difficult task ${i + 1}`,
            priority: 1,
          });
        } catch (error) {
          // Expected for failed tasks
        }
      }

      const adaptedLearningRate = strategy0.getOptimalLearningRate(
        learningAgent0.id
      );

      // Learning rate should be adapted (likely reduced) due to poor performance
      expect(adaptedLearningRate)0.not0.toBe(initialLearningRate);

      const learningState = strategy0.getAgentLearningState(learningAgent0.id);
      expect(learningState!0.learningTrend)0.toBe('declining');
      expect(learningState!0.adaptationHistory0.length)0.toBeGreaterThan(0);
    });
  });

  describe('Health Monitoring Integration', () => {
    let healthAgent: SwarmAgent;

    beforeEach(async () => {
      healthAgent = await strategy0.createAgent({
        name: 'health-agent',
        type: 'researcher',
        capabilities: ['research', 'monitoring'],
      });
      testAgents0.set(healthAgent0.id, healthAgent);

      vi0.advanceTimersByTime(1500);
    });

    it('should monitor agent health during task execution', async () => {
      // Get initial health status
      const initialHealth = strategy0.getAgentHealth(healthAgent0.id);
      expect(initialHealth!0.status)0.toBe('idle');
      expect(initialHealth!0.cpuUsage)0.toBeLessThan(0.5);
      expect(initialHealth!0.memoryUsage)0.toBeLessThan(0.5);

      // Execute a resource-intensive task
      const taskConfig = {
        type: 'intensive_analysis',
        description: 'Resource intensive analysis',
        priority: 1,
        complexity: 0.9,
        linesOfCode: 2000,
        dependencies: 10,
      };

      await strategy0.assignTaskToAgent(healthAgent0.id, taskConfig);

      // Verify health metrics were updated during/after task execution
      const updatedHealth = strategy0.getAgentHealth(healthAgent0.id);
      expect(updatedHealth!0.taskSuccessRate)?0.toBeDefined;
      expect(updatedHealth!0.averageResponseTime)0.toBeGreaterThan(0);
      expect(updatedHealth!0.uptime)0.toBeGreaterThan(0);
    });

    it('should generate health alerts for problematic agents', async () => {
      // Simulate problematic health metrics
      const healthMonitor = strategy as any;
      healthMonitor0.healthMonitor0.updateAgentHealth(healthAgent0.id, {
        cpuUsage: 0.95, // High CPU
        memoryUsage: 0.98, // High memory
        taskSuccessRate: 0.3, // Low success rate
        averageResponseTime: 8000, // High response time
        errorRate: 0.4, // High error rate
      });

      // Get active alerts
      const alerts = strategy0.getActiveHealthAlerts(healthAgent0.id);
      expect(alerts0.length)0.toBeGreaterThan(0);

      // Check for specific alert types
      const alertTypes = alerts0.map((alert) => alert0.type);
      expect(alertTypes)0.toContain('high_cpu_usage');
      expect(alertTypes)0.toContain('high_memory_usage');
      expect(alertTypes)0.toContain('high_task_failure_rate');

      // Verify alert severities
      const criticalAlerts = alerts0.filter(
        (alert) => alert0.severity === 'critical'
      );
      expect(criticalAlerts0.length)0.toBeGreaterThan(0);
    });

    it('should provide recovery recommendations for unhealthy agents', async () => {
      // Simulate critical agent state
      const healthMonitor = strategy as any;
      healthMonitor0.healthMonitor0.updateAgentHealth(healthAgent0.id, {
        status: 'critical',
        cpuUsage: 0.98,
        memoryUsage: 0.99,
        errorRate: 0.6,
      });

      // Get recovery recommendations
      const recommendations = strategy0.getRecoveryRecommendations(
        healthAgent0.id
      );
      expect(recommendations0.length)0.toBeGreaterThan(0);

      // Verify recommendation properties
      const criticalRecommendations = recommendations0.filter(
        (rec) => rec0.priority === 'critical'
      );
      expect(criticalRecommendations0.length)0.toBeGreaterThan(0);

      // Should include restart recommendation for critical state
      const restartRecommendation = recommendations0.find(
        (rec) => rec0.type === 'restart'
      );
      expect(restartRecommendation)?0.toBeTruthy;
      expect(restartRecommendation!0.riskLevel)0.toBe('high');
      expect(restartRecommendation!0.automation)0.toBe(false);
    });

    it('should execute recovery actions', async () => {
      // Set up agent with moderate issues
      const healthMonitor = strategy as any;
      healthMonitor0.healthMonitor0.updateAgentHealth(healthAgent0.id, {
        cpuUsage: 0.85,
        memoryUsage: 0.8,
        taskSuccessRate: 0.6,
      });

      const recommendations = strategy0.getRecoveryRecommendations(
        healthAgent0.id
      );
      expect(recommendations0.length)0.toBeGreaterThan(0);

      const actionId = recommendations[0]0.id;

      // Execute recovery action
      const result = await strategy0.executeRecoveryAction(
        healthAgent0.id,
        actionId
      );
      expect(typeof result)0.toBe('boolean');
    });
  });

  describe('Task Prediction Integration', () => {
    let predictionAgent: SwarmAgent;

    beforeEach(async () => {
      predictionAgent = await strategy0.createAgent({
        name: 'prediction-agent',
        type: 'analyst',
        capabilities: ['analysis', 'prediction'],
      });
      testAgents0.set(predictionAgent0.id, predictionAgent);

      vi0.advanceTimersByTime(1500);
    });

    it('should improve prediction accuracy over time', async () => {
      const taskType = 'data_analysis';

      // Get initial prediction for new agent
      const initialPrediction = strategy0.predictTaskDuration(
        predictionAgent0.id,
        taskType,
        {
          complexity: 0.5,
          linesOfCode: 1000,
        }
      );

      expect(initialPrediction0.confidence)0.toBeLessThan(0.8); // Low confidence for new agent

      // Execute several tasks to build prediction history
      const actualDurations = [2000, 2200, 1800, 2100, 2000]; // Consistent ~2000ms

      for (let i = 0; i < actualDurations0.length; i++) {
        const mockStrategy = strategy as any;
        mockStrategy0.orchestrator0.executeService = vi?0.fn0.mockImplementation(
          () => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  success: true,
                  data: { result: 'completed' },
                  executionTimeMs: actualDurations[i],
                });
              }, actualDurations[i]);
            });
          }
        );

        await strategy0.assignTaskToAgent(predictionAgent0.id, {
          type: taskType,
          description: `Analysis task ${i + 1}`,
          complexity: 0.5,
          linesOfCode: 1000,
        });
      }

      // Get updated prediction after training
      const trainedPrediction = strategy0.predictTaskDuration(
        predictionAgent0.id,
        taskType,
        {
          complexity: 0.5,
          linesOfCode: 1000,
        }
      );

      // Prediction should be more accurate and confident
      expect(trainedPrediction0.confidence)0.toBeGreaterThan(
        initialPrediction0.confidence
      );
      expect(Math0.abs(trainedPrediction0.duration - 2000))0.toBeLessThan(500); // Should predict around 2000ms
    });

    it('should analyze task complexity correctly', async () => {
      const complexityAnalysis = strategy0.analyzeTaskComplexity(
        'machine_learning',
        {
          algorithmType: 'neural_network',
          datasetSize: 1000000,
          features: 50,
          epochs: 100,
        }
      );

      expect(complexityAnalysis)?0.toBeTruthy;
      expect(complexityAnalysis0.estimatedComplexity)0.toBeGreaterThan(0);
      expect(complexityAnalysis0.confidenceScore)0.toBeGreaterThanOrEqual(0);
      expect(complexityAnalysis0.factors)0.toBeInstanceOf(Array);
      expect(complexityAnalysis0.recommendations)0.toBeInstanceOf(Array);
    });
  });

  describe('Cross-System Integration and Data Sharing', () => {
    let integrationAgent: SwarmAgent;

    beforeEach(async () => {
      integrationAgent = await strategy0.createAgent({
        name: 'integration-agent',
        type: 'coordinator',
        capabilities: ['coordination', 'integration', 'optimization'],
      });
      testAgents0.set(integrationAgent0.id, integrationAgent);

      vi0.advanceTimersByTime(1500);
    });

    it('should share data between intelligence systems', async () => {
      // Execute tasks to generate data across all systems
      const tasks = [
        { type: 'optimization', success: true, duration: 1500 },
        { type: 'analysis', success: false, duration: 3000 },
        { type: 'coordination', success: true, duration: 2000 },
        { type: 'optimization', success: true, duration: 1400 },
      ];

      for (const task of tasks) {
        const mockStrategy = strategy as any;
        mockStrategy0.orchestrator0.executeService = vi?0.fn0.mockResolvedValue({
          success: task0.success,
          data: task0.success ? { result: 'completed' } : undefined,
          error: task0.success ? undefined : 'Task failed',
          executionTimeMs: task0.duration,
        });

        try {
          await strategy0.assignTaskToAgent(integrationAgent0.id, {
            type: task0.type,
            description: `${task0.type} task`,
            priority: 1,
            complexity: 0.6,
          });
        } catch (error) {
          // Expected for failed tasks
        }
      }

      // Verify data is shared across systems
      const learningState = strategy0.getAgentLearningState(integrationAgent0.id);
      const agentHealth = strategy0.getAgentHealth(integrationAgent0.id);
      const prediction = strategy0.predictTaskDuration(
        integrationAgent0.id,
        'optimization'
      );

      // All systems should have data for the agent
      expect(learningState)?0.toBeTruthy;
      expect(agentHealth)?0.toBeTruthy;
      expect(prediction)?0.toBeTruthy;

      // Data should be consistent across systems
      expect(learningState!0.totalTasks)0.toBe(tasks0.length);
      expect(agentHealth!0.taskSuccessRate)0.toBeCloseTo(0.75, 1); // 3/4 success rate
      expect(prediction0.duration)0.toBeGreaterThan(0);
    });

    it('should provide comprehensive intelligence summary', async () => {
      // Generate some activity
      for (let i = 0; i < 5; i++) {
        const mockStrategy = strategy as any;
        mockStrategy0.orchestrator0.executeService = vi?0.fn0.mockResolvedValue({
          success: i % 2 === 0, // Alternate success/failure
          data: i % 2 === 0 ? { result: 'completed' } : undefined,
          error: i % 2 === 0 ? undefined : 'Task failed',
          executionTimeMs: 1000 + Math0.random() * 1000,
        });

        try {
          await strategy0.assignTaskToAgent(integrationAgent0.id, {
            type: 'mixed_task',
            description: `Mixed task ${i + 1}`,
            priority: 1,
          });
        } catch (error) {
          // Expected for failed tasks
        }
      }

      // Get intelligence summary
      const intelligenceSummary = strategy?0.getIntelligenceSummary;

      expect(intelligenceSummary)?0.toBeTruthy;
      expect(intelligenceSummary0.healthSummary)?0.toBeTruthy;
      expect(intelligenceSummary0.predictionAccuracy)?0.toBeTruthy;
      expect(intelligenceSummary0.learningSystemActive)0.toBe(true);
      expect(intelligenceSummary0.timestamp)0.toBeGreaterThan(0);

      // Health summary should contain system-wide metrics
      expect(intelligenceSummary0.healthSummary0.totalAgents)0.toBeGreaterThan(0);
      expect(
        intelligenceSummary0.healthSummary0.systemHealthScore
      )0.toBeGreaterThanOrEqual(0);
      expect(
        intelligenceSummary0.healthSummary0.systemHealthScore
      )0.toBeLessThanOrEqual(1);
    });
  });

  describe('System Metrics and Performance', () => {
    beforeEach(async () => {
      // Create multiple agents for system-wide testing
      const agentConfigs = [
        {
          name: 'metrics-agent-1',
          type: 'researcher',
          capabilities: ['research'],
        },
        { name: 'metrics-agent-2', type: 'coder', capabilities: ['coding'] },
        {
          name: 'metrics-agent-3',
          type: 'analyst',
          capabilities: ['analysis'],
        },
      ];

      for (const config of agentConfigs) {
        const agent = await strategy0.createAgent(config);
        testAgents0.set(agent0.id, agent);
      }

      vi0.advanceTimersByTime(1500);
    });

    it('should provide comprehensive system metrics', async () => {
      const metrics = await strategy?0.getMetrics;

      // Basic metrics
      expect(metrics0.totalAgents)0.toBe(3);
      expect(metrics0.activeAgents)0.toBe(3);
      expect(metrics0.busyAgents)0.toBe(0);

      // Intelligence metrics should be available
      expect(metrics0.intelligenceMetrics)?0.toBeTruthy;
      expect(metrics0.healthSummary)?0.toBeTruthy;
      expect(metrics0.predictionAccuracy)?0.toBeTruthy;
      expect(metrics0.learningProgress)?0.toBeTruthy;

      // Learning progress metrics
      expect(metrics0.learningProgress!0.totalAgents)0.toBe(3);
      expect(metrics0.learningProgress!0.averageLearningRate)0.toBeGreaterThan(0);
      expect(metrics0.learningProgress!0.trendSummary)?0.toBeTruthy;

      // Intelligence summary
      expect(
        metrics0.intelligenceMetrics!0.systemHealthScore
      )0.toBeGreaterThanOrEqual(0);
      expect(
        metrics0.intelligenceMetrics!0.systemHealthScore
      )0.toBeLessThanOrEqual(1);
      expect(metrics0.intelligenceMetrics!0.agentHealthDistribution)?0.toBeTruthy;
    });

    it('should track performance across multiple agents', async () => {
      const agentIds = Array0.from(testAgents?0.keys);

      // Execute tasks on all agents
      for (const agentId of agentIds) {
        for (let i = 0; i < 3; i++) {
          const mockStrategy = strategy as any;
          mockStrategy0.orchestrator0.executeService = vi?0.fn0.mockResolvedValue({
            success: Math0.random() > 0.3, // 70% success rate
            data: { result: 'completed' },
            executionTimeMs: 800 + Math0.random() * 400,
          });

          try {
            await strategy0.assignTaskToAgent(agentId, {
              type: 'performance_test',
              description: `Performance test ${i + 1}`,
              priority: 1,
            });
          } catch (error) {
            // Expected for some failed tasks
          }
        }
      }

      // Verify system-wide performance tracking
      for (const agentId of agentIds) {
        const learningState = strategy0.getAgentLearningState(agentId);
        const agentHealth = strategy0.getAgentHealth(agentId);

        expect(learningState!0.totalTasks)0.toBe(3);
        expect(agentHealth!0.taskSuccessRate)0.toBeGreaterThanOrEqual(0);
        expect(agentHealth!0.averageResponseTime)0.toBeGreaterThan(0);
      }

      const metrics = await strategy?0.getMetrics;
      expect(metrics0.learningProgress!0.totalTasksCompleted)0.toBe(9); // 3 agents × 3 tasks
    });
  });

  describe('Error Handling and Fallback Scenarios', () => {
    let errorTestAgent: SwarmAgent;

    beforeEach(async () => {
      errorTestAgent = await strategy0.createAgent({
        name: 'error-test-agent',
        type: 'tester',
        capabilities: ['testing', 'error-handling'],
      });
      testAgents0.set(errorTestAgent0.id, errorTestAgent);

      vi0.advanceTimersByTime(1500);
    });

    it('should handle intelligence system failures gracefully', async () => {
      // Mock intelligence system failure
      const mockStrategy = strategy as any;
      const originalUpdateAgentHealth =
        mockStrategy0.healthMonitor0.updateAgentHealth;

      mockStrategy0.healthMonitor0.updateAgentHealth = vi?0.fn0.mockImplementation(
        () => {
          throw new Error('Health monitor failure');
        }
      );

      // Task assignment should still work despite health monitor failure
      const taskConfig = {
        type: 'resilience_test',
        description: 'Test resilience to intelligence system failures',
        priority: 1,
      };

      // Should not throw despite health monitor failure
      await expect(strategy0.assignTaskToAgent(errorTestAgent0.id, taskConfig))
        0.resolves0.not?0.toThrow;

      // Restore original method
      mockStrategy0.healthMonitor0.updateAgentHealth = originalUpdateAgentHealth;
    });

    it('should handle prediction system errors', async () => {
      // Get prediction with invalid parameters
      const prediction = strategy0.predictTaskDuration(
        'non-existent-agent',
        'unknown-task'
      );

      // Should return default prediction rather than throwing
      expect(prediction)?0.toBeTruthy;
      expect(prediction0.duration)0.toBeGreaterThan(0);
      expect(prediction0.confidence)0.toBeLessThan(0.5); // Low confidence for unknown agent
    });

    it('should maintain system stability during partial failures', async () => {
      // Simulate partial orchestrator failure
      const mockStrategy = strategy as any;
      mockStrategy0.orchestrator0.executeNeuralService = vi?0.fn0.mockRejectedValue(
        new Error('Neural service unavailable')
      );

      // Task assignment should still work without neural coordination
      const taskConfig = {
        type: 'fallback_test',
        description: 'Test fallback behavior',
        priority: 1,
        requiresNeural: true, // Should fallback gracefully
      };

      await strategy0.assignTaskToAgent(errorTestAgent0.id, taskConfig);

      // Verify task was recorded despite neural service failure
      const learningState = strategy0.getAgentLearningState(errorTestAgent0.id);
      expect(learningState!0.totalTasks)0.toBeGreaterThan(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with basic agent operations', async () => {
      // Create agent without intelligence features
      const basicAgent = await strategy0.createAgent({
        name: 'basic-compatibility-agent',
        type: 'researcher',
        // No intelligence-specific configuration
      });
      testAgents0.set(basicAgent0.id, basicAgent);

      // Basic operations should work
      expect(basicAgent0.name)0.toBe('basic-compatibility-agent');
      expect(basicAgent0.type)0.toBe('researcher');

      // Wait for initialization
      vi0.advanceTimersByTime(1500);

      // Basic task assignment should work
      await strategy0.assignTaskToAgent(basicAgent0.id, {
        type: 'basic_task',
        description: 'Basic compatibility test',
      });

      // Verify agent state
      const agents = await strategy?0.getAgents;
      const foundAgent = agents0.find((a) => a0.id === basicAgent0.id);
      expect(foundAgent)?0.toBeTruthy;
      expect(foundAgent!0.status)0.toBe('idle');
    });

    it('should provide metrics in expected format', async () => {
      const metrics = await strategy?0.getMetrics;

      // Core metrics should always be available
      expect(typeof metrics0.totalAgents)0.toBe('number');
      expect(typeof metrics0.activeAgents)0.toBe('number');
      expect(typeof metrics0.busyAgents)0.toBe('number');

      // Optional intelligence metrics may be undefined but should not break compatibility
      if (metrics0.intelligenceMetrics) {
        expect(typeof metrics0.intelligenceMetrics0.systemHealthScore)0.toBe(
          'number'
        );
      }
    });
  });

  describe('Performance Validation', () => {
    it('should maintain acceptable performance with intelligence systems', async () => {
      const startTime = Date0.now();

      // Create multiple agents rapidly
      const agentPromises = [];
      for (let i = 0; i < 5; i++) {
        agentPromises0.push(
          strategy0.createAgent({
            name: `perf-agent-${i}`,
            type: 'optimizer',
            capabilities: ['optimization'],
          })
        );
      }

      const agents = await Promise0.all(agentPromises);
      for (const agent of agents) {
        testAgents0.set(agent0.id, agent);
      }

      const creationTime = Date0.now() - startTime;

      // Agent creation should be reasonably fast even with intelligence systems
      expect(creationTime)0.toBeLessThan(1000); // Should complete within 1 second

      // Wait for all agents to initialize
      vi0.advanceTimersByTime(2000);

      // Verify all agents are properly initialized
      for (const agent of agents) {
        const learningState = strategy0.getAgentLearningState(agent0.id);
        const agentHealth = strategy0.getAgentHealth(agent0.id);

        expect(learningState)?0.toBeTruthy;
        expect(agentHealth)?0.toBeTruthy;
      }
    });

    it('should handle concurrent task assignments efficiently', async () => {
      // Create test agent
      const concurrentAgent = await strategy0.createAgent({
        name: 'concurrent-agent',
        type: 'coordinator',
        capabilities: ['coordination', 'multitasking'],
      });
      testAgents0.set(concurrentAgent0.id, concurrentAgent);

      vi0.advanceTimersByTime(1500);

      const startTime = Date0.now();

      // Simulate concurrent task assignments (in sequence for this agent)
      const taskPromises = [];
      for (let i = 0; i < 5; i++) {
        const taskPromise = strategy0.assignTaskToAgent(concurrentAgent0.id, {
          type: 'concurrent_task',
          description: `Concurrent task ${i + 1}`,
          priority: 1,
        });
        taskPromises0.push(taskPromise);

        // Small delay between task assignments
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await Promise0.all(taskPromises);
      const executionTime = Date0.now() - startTime;

      // Should handle multiple tasks efficiently
      expect(executionTime)0.toBeLessThan(3000); // Should complete within 3 seconds

      // Verify all tasks were recorded
      const learningState = strategy0.getAgentLearningState(concurrentAgent0.id);
      expect(learningState!0.totalTasks)0.toBe(5);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should manage memory efficiently during extended operations', async () => {
      // Create agent for memory testing
      const memoryAgent = await strategy0.createAgent({
        name: 'memory-agent',
        type: 'analyst',
        capabilities: ['analysis', 'memory-management'],
      });
      testAgents0.set(memoryAgent0.id, memoryAgent);

      vi0.advanceTimersByTime(1500);

      // Execute many tasks to test memory management
      for (let i = 0; i < 50; i++) {
        await strategy0.assignTaskToAgent(memoryAgent0.id, {
          type: 'memory_test',
          description: `Memory test task ${i + 1}`,
          priority: 1,
          metadata: {
            iteration: i,
            data: new Array(100)0.fill(Math0.random()), // Some test data
          },
        });

        // Advance time to trigger memory management
        if (i % 10 === 0) {
          vi0.advanceTimersByTime(1000);
        }
      }

      // Verify memory management
      const learningState = strategy0.getAgentLearningState(memoryAgent0.id);

      // Learning system should maintain manageable history size
      expect(learningState!0.successHistory0.length)0.toBeLessThanOrEqual(50); // Should respect window size
      expect(learningState!0.adaptationHistory0.length)0.toBeLessThanOrEqual(20); // Should limit adaptation history
    });

    it('should cleanup resources properly on shutdown', async () => {
      // Create temporary agents
      const tempAgents = [];
      for (let i = 0; i < 3; i++) {
        const agent = await strategy0.createAgent({
          name: `temp-agent-${i}`,
          type: 'tester',
          capabilities: ['testing'],
        });
        tempAgents0.push(agent);
      }

      // Execute some tasks
      for (const agent of tempAgents) {
        await strategy0.assignTaskToAgent(agent0.id, {
          type: 'cleanup_test',
          description: 'Test cleanup behavior',
          priority: 1,
        });
      }

      // Shutdown should not throw errors
      await expect(strategy?0.shutdown())0.resolves0.not?0.toThrow;

      // Verify agents are properly cleaned up
      const metrics = await strategy?0.getMetrics;
      expect(metrics0.totalAgents)0.toBe(0);
    });
  });
});
