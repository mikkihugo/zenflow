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
 * @since 1.0.0-alpha.43
 * @version 1.0.0
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
import { ZenSwarmStrategy } from '../zen-swarm.strategy.ts';
import { AgentLearningSystem } from '../../intelligence/agent-learning-system.ts';
import { TaskPredictor } from '../../intelligence/task-predictor.ts';
import { AgentHealthMonitor } from '../../intelligence/agent-health-monitor.ts';
import type { SwarmAgent } from '../../../types/shared-types.ts';

// Mock the logging system
vi.mock('../../../config/logging-config.ts', () => ({
  getLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock the ZenOrchestratorIntegration
vi.mock('../../../zen-orchestrator-integration.js', () => ({
  ZenOrchestratorIntegration: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(true),
    shutdown: vi.fn().mockResolvedValue(true),
    executeNeuralService: vi.fn().mockResolvedValue({
      success: true,
      data: { neuralCapabilities: true },
      executionTimeMs: 100,
    }),
    sendA2AMessage: vi.fn().mockResolvedValue({
      success: true,
      data: { daaCapabilities: true },
      executionTimeMs: 50,
    }),
    executeService: vi.fn().mockResolvedValue({
      success: true,
      data: { result: 'task completed' },
      executionTimeMs: 200,
    }),
    getStatus: vi.fn().mockResolvedValue({
      success: true,
      data: { status: 'active', agents: 5 },
    }),
    getMetrics: vi.fn().mockResolvedValue({
      success: true,
      data: { performance: { throughput: 100 } },
    }),
    getA2AServerStatus: vi.fn().mockResolvedValue({
      success: true,
      data: { connected: true, latency: 10 },
    }),
  })),
}));

describe('ZenSwarmStrategy Integration Tests', () => {
  let strategy: ZenSwarmStrategy;
  let testAgents: Map<string, SwarmAgent> = new Map();

  beforeAll(() => {
    vi.useFakeTimers();
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

    testAgents.clear();
  });

  afterEach(async () => {
    try {
      // Cleanup all test agents
      for (const agentId of testAgents.keys()) {
        await strategy.destroyAgent(agentId);
      }

      // Shutdown strategy
      await strategy.shutdown();
    } catch (error) {
      // Ignore cleanup errors in tests
    }

    vi.clearAllTimers();
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

      const agent = await strategy.createAgent(agentConfig);
      testAgents.set(agent.id, agent);

      // Verify agent creation
      expect(agent.name).toBe('test-intelligence-agent');
      expect(agent.type).toBe('researcher');
      expect(agent.capabilities).toEqual([
        'analysis',
        'research',
        'optimization',
      ]);
      expect(agent.metadata?.neuralCapabilities).toBeTruthy();
      expect(agent.metadata?.daaCapabilities).toBeTruthy();
      expect(agent.metadata?.intelligenceEnabled).toBe(true);

      // Wait for agent to initialize
      vi.advanceTimersByTime(1500);

      // Verify agent is ready
      expect(agent.status).toBe('idle');

      // Check if learning system initialized the agent
      const learningState = strategy.getAgentLearningState(agent.id);
      expect(learningState).toBeTruthy();
      expect(learningState.agentId).toBe(agent.id);
      expect(learningState.currentLearningRate).toBeGreaterThan(0);

      // Check if health monitor initialized the agent
      const agentHealth = strategy.getAgentHealth(agent.id);
      expect(agentHealth).toBeTruthy();
      expect(agentHealth.agentId).toBe(agent.id);
      expect(agentHealth.status).toBe('idle');
    });

    it('should handle agent creation with intelligence systems disabled', async () => {
      const agentConfig = {
        name: 'test-basic-agent',
        type: 'coder',
        capabilities: ['coding', 'testing'],
        enableNeural: false,
        enableDAA: false,
      };

      const agent = await strategy.createAgent(agentConfig);
      testAgents.set(agent.id, agent);

      // Verify agent creation without intelligence features
      expect(agent.name).toBe('test-basic-agent');
      expect(agent.metadata?.neuralCapabilities).toBeUndefined();
      expect(agent.metadata?.daaCapabilities).toBeUndefined();
      expect(agent.metadata?.intelligenceEnabled).toBe(true); // Still enabled at strategy level

      // Wait for initialization
      vi.advanceTimersByTime(1500);

      // Intelligence systems should still track the agent
      const learningState = strategy.getAgentLearningState(agent.id);
      expect(learningState).toBeTruthy();

      const agentHealth = strategy.getAgentHealth(agent.id);
      expect(agentHealth).toBeTruthy();
    });
  });

  describe('Task Assignment with Intelligence Integration', () => {
    let testAgent: SwarmAgent;

    beforeEach(async () => {
      testAgent = await strategy.createAgent({
        name: 'task-test-agent',
        type: 'analyst',
        capabilities: ['analysis', 'optimization'],
        enableNeural: true,
        enableDAA: true,
      });
      testAgents.set(testAgent.id, testAgent);

      // Wait for agent initialization
      vi.advanceTimersByTime(1500);
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
      const initialPrediction = strategy.predictTaskDuration(
        testAgent.id,
        taskConfig.type,
        {
          complexity: taskConfig.complexity,
          linesOfCode: taskConfig.linesOfCode,
          dependencies: taskConfig.dependencies,
        }
      );

      expect(initialPrediction).toBeTruthy();
      expect(initialPrediction.duration).toBeGreaterThan(0);
      expect(initialPrediction.confidence).toBeGreaterThanOrEqual(0);
      expect(initialPrediction.confidence).toBeLessThanOrEqual(1);

      // Assign task and verify intelligence integration
      await strategy.assignTaskToAgent(testAgent.id, taskConfig);

      // Verify learning system recorded the task
      const learningState = strategy.getAgentLearningState(testAgent.id);
      expect(learningState!.totalTasks).toBeGreaterThan(0);
      expect(learningState!.successHistory.length).toBeGreaterThan(0);

      // Verify health monitoring updated
      const agentHealth = strategy.getAgentHealth(testAgent.id);
      expect(agentHealth!.taskSuccessRate).toBeDefined();
      expect(agentHealth!.averageResponseTime).toBeGreaterThan(0);
    });

    it('should handle task failure and update intelligence systems', async () => {
      // Mock a failing task
      const mockStrategy = strategy as any;
      const originalExecuteService = mockStrategy.orchestrator.executeService;

      mockStrategy.orchestrator.executeService = vi.fn().mockResolvedValue({
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
        strategy.assignTaskToAgent(testAgent.id, taskConfig)
      ).rejects.toThrow('Task execution failed');

      // Verify failure was recorded in learning system
      const learningState = strategy.getAgentLearningState(testAgent.id);
      expect(learningState!.totalTasks).toBeGreaterThan(0);
      expect(
        learningState!.successHistory.some((entry) => !entry.success)
      ).toBe(true);

      // Verify health monitoring reflects the failure
      const agentHealth = strategy.getAgentHealth(testAgent.id);
      expect(agentHealth!.errorRate).toBeGreaterThan(0);

      // Restore original method
      mockStrategy.orchestrator.executeService = originalExecuteService;
    });

    it('should adapt task assignment based on agent health', async () => {
      // Simulate unhealthy agent
      const healthMonitor = strategy as any;
      healthMonitor.healthMonitor.updateAgentHealth(testAgent.id, {
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
      await strategy.assignTaskToAgent(testAgent.id, taskConfig);

      // Verify recovery recommendations are available
      const recoveryActions = strategy.getRecoveryRecommendations(testAgent.id);
      expect(recoveryActions.length).toBeGreaterThan(0);
      expect(recoveryActions.some((action) => action.type === 'restart')).toBe(
        true
      );
    });
  });

  describe('Learning System Integration', () => {
    let learningAgent: SwarmAgent;

    beforeEach(async () => {
      learningAgent = await strategy.createAgent({
        name: 'learning-agent',
        type: 'optimizer',
        capabilities: ['optimization', 'learning'],
        cognitivePattern: 'adaptive',
      });
      testAgents.set(learningAgent.id, learningAgent);

      vi.advanceTimersByTime(1500);
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
      for (let i = 0; i < taskResults.length; i++) {
        const taskType = taskTypes[i % taskTypes.length];
        const success = taskResults[i];

        // Mock task execution result
        const mockStrategy = strategy as any;
        mockStrategy.orchestrator.executeService = vi.fn().mockResolvedValue({
          success,
          data: success ? { result: 'completed' } : undefined,
          error: success ? undefined : 'Task failed',
          executionTimeMs: 100 + Math.random() * 200,
        });

        const taskConfig = {
          type: taskType,
          description: `${taskType} task ${i + 1}`,
          priority: 1,
          complexity: 0.5 + Math.random() * 0.3,
        };

        try {
          await strategy.assignTaskToAgent(learningAgent.id, taskConfig);
        } catch (error) {
          // Expected for failed tasks
        }

        // Advance time between tasks
        vi.advanceTimersByTime(1000);
      }

      // Verify learning progression
      const learningState = strategy.getAgentLearningState(learningAgent.id);
      expect(learningState!.totalTasks).toBe(taskResults.length);
      expect(learningState!.successfulTasks).toBe(
        taskResults.filter((r) => r).length
      );
      expect(learningState!.currentSuccessRate).toBeCloseTo(0.8, 1); // 8/10 success rate
      expect(learningState!.learningTrend).toBeDefined();
      expect(learningState!.adaptationHistory.length).toBeGreaterThan(0);
    });

    it('should adapt learning rates based on performance', async () => {
      const initialLearningRate = strategy.getOptimalLearningRate(
        learningAgent.id
      );

      // Simulate poor performance to trigger learning rate adaptation
      for (let i = 0; i < 10; i++) {
        const mockStrategy = strategy as any;
        mockStrategy.orchestrator.executeService = vi.fn().mockResolvedValue({
          success: false,
          error: 'Task failed',
          executionTimeMs: 300,
        });

        try {
          await strategy.assignTaskToAgent(learningAgent.id, {
            type: 'difficult_task',
            description: `Difficult task ${i + 1}`,
            priority: 1,
          });
        } catch (error) {
          // Expected for failed tasks
        }
      }

      const adaptedLearningRate = strategy.getOptimalLearningRate(
        learningAgent.id
      );

      // Learning rate should be adapted (likely reduced) due to poor performance
      expect(adaptedLearningRate).not.toBe(initialLearningRate);

      const learningState = strategy.getAgentLearningState(learningAgent.id);
      expect(learningState!.learningTrend).toBe('declining');
      expect(learningState!.adaptationHistory.length).toBeGreaterThan(0);
    });
  });

  describe('Health Monitoring Integration', () => {
    let healthAgent: SwarmAgent;

    beforeEach(async () => {
      healthAgent = await strategy.createAgent({
        name: 'health-agent',
        type: 'researcher',
        capabilities: ['research', 'monitoring'],
      });
      testAgents.set(healthAgent.id, healthAgent);

      vi.advanceTimersByTime(1500);
    });

    it('should monitor agent health during task execution', async () => {
      // Get initial health status
      const initialHealth = strategy.getAgentHealth(healthAgent.id);
      expect(initialHealth!.status).toBe('idle');
      expect(initialHealth!.cpuUsage).toBeLessThan(0.5);
      expect(initialHealth!.memoryUsage).toBeLessThan(0.5);

      // Execute a resource-intensive task
      const taskConfig = {
        type: 'intensive_analysis',
        description: 'Resource intensive analysis',
        priority: 1,
        complexity: 0.9,
        linesOfCode: 2000,
        dependencies: 10,
      };

      await strategy.assignTaskToAgent(healthAgent.id, taskConfig);

      // Verify health metrics were updated during/after task execution
      const updatedHealth = strategy.getAgentHealth(healthAgent.id);
      expect(updatedHealth!.taskSuccessRate).toBeDefined();
      expect(updatedHealth!.averageResponseTime).toBeGreaterThan(0);
      expect(updatedHealth!.uptime).toBeGreaterThan(0);
    });

    it('should generate health alerts for problematic agents', async () => {
      // Simulate problematic health metrics
      const healthMonitor = strategy as any;
      healthMonitor.healthMonitor.updateAgentHealth(healthAgent.id, {
        cpuUsage: 0.95, // High CPU
        memoryUsage: 0.98, // High memory
        taskSuccessRate: 0.3, // Low success rate
        averageResponseTime: 8000, // High response time
        errorRate: 0.4, // High error rate
      });

      // Get active alerts
      const alerts = strategy.getActiveHealthAlerts(healthAgent.id);
      expect(alerts.length).toBeGreaterThan(0);

      // Check for specific alert types
      const alertTypes = alerts.map((alert) => alert.type);
      expect(alertTypes).toContain('high_cpu_usage');
      expect(alertTypes).toContain('high_memory_usage');
      expect(alertTypes).toContain('high_task_failure_rate');

      // Verify alert severities
      const criticalAlerts = alerts.filter(
        (alert) => alert.severity === 'critical'
      );
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });

    it('should provide recovery recommendations for unhealthy agents', async () => {
      // Simulate critical agent state
      const healthMonitor = strategy as any;
      healthMonitor.healthMonitor.updateAgentHealth(healthAgent.id, {
        status: 'critical',
        cpuUsage: 0.98,
        memoryUsage: 0.99,
        errorRate: 0.6,
      });

      // Get recovery recommendations
      const recommendations = strategy.getRecoveryRecommendations(
        healthAgent.id
      );
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify recommendation properties
      const criticalRecommendations = recommendations.filter(
        (rec) => rec.priority === 'critical'
      );
      expect(criticalRecommendations.length).toBeGreaterThan(0);

      // Should include restart recommendation for critical state
      const restartRecommendation = recommendations.find(
        (rec) => rec.type === 'restart'
      );
      expect(restartRecommendation).toBeTruthy();
      expect(restartRecommendation!.riskLevel).toBe('high');
      expect(restartRecommendation!.automation).toBe(false);
    });

    it('should execute recovery actions', async () => {
      // Set up agent with moderate issues
      const healthMonitor = strategy as any;
      healthMonitor.healthMonitor.updateAgentHealth(healthAgent.id, {
        cpuUsage: 0.85,
        memoryUsage: 0.8,
        taskSuccessRate: 0.6,
      });

      const recommendations = strategy.getRecoveryRecommendations(
        healthAgent.id
      );
      expect(recommendations.length).toBeGreaterThan(0);

      const actionId = recommendations[0].id;

      // Execute recovery action
      const result = await strategy.executeRecoveryAction(
        healthAgent.id,
        actionId
      );
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Task Prediction Integration', () => {
    let predictionAgent: SwarmAgent;

    beforeEach(async () => {
      predictionAgent = await strategy.createAgent({
        name: 'prediction-agent',
        type: 'analyst',
        capabilities: ['analysis', 'prediction'],
      });
      testAgents.set(predictionAgent.id, predictionAgent);

      vi.advanceTimersByTime(1500);
    });

    it('should improve prediction accuracy over time', async () => {
      const taskType = 'data_analysis';

      // Get initial prediction for new agent
      const initialPrediction = strategy.predictTaskDuration(
        predictionAgent.id,
        taskType,
        {
          complexity: 0.5,
          linesOfCode: 1000,
        }
      );

      expect(initialPrediction.confidence).toBeLessThan(0.8); // Low confidence for new agent

      // Execute several tasks to build prediction history
      const actualDurations = [2000, 2200, 1800, 2100, 2000]; // Consistent ~2000ms

      for (let i = 0; i < actualDurations.length; i++) {
        const mockStrategy = strategy as any;
        mockStrategy.orchestrator.executeService = vi
          .fn()
          .mockImplementation(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  success: true,
                  data: { result: 'completed' },
                  executionTimeMs: actualDurations[i],
                });
              }, actualDurations[i]);
            });
          });

        await strategy.assignTaskToAgent(predictionAgent.id, {
          type: taskType,
          description: `Analysis task ${i + 1}`,
          complexity: 0.5,
          linesOfCode: 1000,
        });
      }

      // Get updated prediction after training
      const trainedPrediction = strategy.predictTaskDuration(
        predictionAgent.id,
        taskType,
        {
          complexity: 0.5,
          linesOfCode: 1000,
        }
      );

      // Prediction should be more accurate and confident
      expect(trainedPrediction.confidence).toBeGreaterThan(
        initialPrediction.confidence
      );
      expect(Math.abs(trainedPrediction.duration - 2000)).toBeLessThan(500); // Should predict around 2000ms
    });

    it('should analyze task complexity correctly', async () => {
      const complexityAnalysis = strategy.analyzeTaskComplexity(
        'machine_learning',
        {
          algorithmType: 'neural_network',
          datasetSize: 1000000,
          features: 50,
          epochs: 100,
        }
      );

      expect(complexityAnalysis).toBeTruthy();
      expect(complexityAnalysis.estimatedComplexity).toBeGreaterThan(0);
      expect(complexityAnalysis.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(complexityAnalysis.factors).toBeInstanceOf(Array);
      expect(complexityAnalysis.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Cross-System Integration and Data Sharing', () => {
    let integrationAgent: SwarmAgent;

    beforeEach(async () => {
      integrationAgent = await strategy.createAgent({
        name: 'integration-agent',
        type: 'coordinator',
        capabilities: ['coordination', 'integration', 'optimization'],
      });
      testAgents.set(integrationAgent.id, integrationAgent);

      vi.advanceTimersByTime(1500);
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
        mockStrategy.orchestrator.executeService = vi.fn().mockResolvedValue({
          success: task.success,
          data: task.success ? { result: 'completed' } : undefined,
          error: task.success ? undefined : 'Task failed',
          executionTimeMs: task.duration,
        });

        try {
          await strategy.assignTaskToAgent(integrationAgent.id, {
            type: task.type,
            description: `${task.type} task`,
            priority: 1,
            complexity: 0.6,
          });
        } catch (error) {
          // Expected for failed tasks
        }
      }

      // Verify data is shared across systems
      const learningState = strategy.getAgentLearningState(integrationAgent.id);
      const agentHealth = strategy.getAgentHealth(integrationAgent.id);
      const prediction = strategy.predictTaskDuration(
        integrationAgent.id,
        'optimization'
      );

      // All systems should have data for the agent
      expect(learningState).toBeTruthy();
      expect(agentHealth).toBeTruthy();
      expect(prediction).toBeTruthy();

      // Data should be consistent across systems
      expect(learningState!.totalTasks).toBe(tasks.length);
      expect(agentHealth!.taskSuccessRate).toBeCloseTo(0.75, 1); // 3/4 success rate
      expect(prediction.duration).toBeGreaterThan(0);
    });

    it('should provide comprehensive intelligence summary', async () => {
      // Generate some activity
      for (let i = 0; i < 5; i++) {
        const mockStrategy = strategy as any;
        mockStrategy.orchestrator.executeService = vi.fn().mockResolvedValue({
          success: i % 2 === 0, // Alternate success/failure
          data: i % 2 === 0 ? { result: 'completed' } : undefined,
          error: i % 2 === 0 ? undefined : 'Task failed',
          executionTimeMs: 1000 + Math.random() * 1000,
        });

        try {
          await strategy.assignTaskToAgent(integrationAgent.id, {
            type: 'mixed_task',
            description: `Mixed task ${i + 1}`,
            priority: 1,
          });
        } catch (error) {
          // Expected for failed tasks
        }
      }

      // Get intelligence summary
      const intelligenceSummary = strategy.getIntelligenceSummary();

      expect(intelligenceSummary).toBeTruthy();
      expect(intelligenceSummary.healthSummary).toBeTruthy();
      expect(intelligenceSummary.predictionAccuracy).toBeTruthy();
      expect(intelligenceSummary.learningSystemActive).toBe(true);
      expect(intelligenceSummary.timestamp).toBeGreaterThan(0);

      // Health summary should contain system-wide metrics
      expect(intelligenceSummary.healthSummary.totalAgents).toBeGreaterThan(0);
      expect(
        intelligenceSummary.healthSummary.systemHealthScore
      ).toBeGreaterThanOrEqual(0);
      expect(
        intelligenceSummary.healthSummary.systemHealthScore
      ).toBeLessThanOrEqual(1);
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
        const agent = await strategy.createAgent(config);
        testAgents.set(agent.id, agent);
      }

      vi.advanceTimersByTime(1500);
    });

    it('should provide comprehensive system metrics', async () => {
      const metrics = await strategy.getMetrics();

      // Basic metrics
      expect(metrics.totalAgents).toBe(3);
      expect(metrics.activeAgents).toBe(3);
      expect(metrics.busyAgents).toBe(0);

      // Intelligence metrics should be available
      expect(metrics.intelligenceMetrics).toBeTruthy();
      expect(metrics.healthSummary).toBeTruthy();
      expect(metrics.predictionAccuracy).toBeTruthy();
      expect(metrics.learningProgress).toBeTruthy();

      // Learning progress metrics
      expect(metrics.learningProgress!.totalAgents).toBe(3);
      expect(metrics.learningProgress!.averageLearningRate).toBeGreaterThan(0);
      expect(metrics.learningProgress!.trendSummary).toBeTruthy();

      // Intelligence summary
      expect(
        metrics.intelligenceMetrics!.systemHealthScore
      ).toBeGreaterThanOrEqual(0);
      expect(
        metrics.intelligenceMetrics!.systemHealthScore
      ).toBeLessThanOrEqual(1);
      expect(metrics.intelligenceMetrics!.agentHealthDistribution).toBeTruthy();
    });

    it('should track performance across multiple agents', async () => {
      const agentIds = Array.from(testAgents.keys());

      // Execute tasks on all agents
      for (const agentId of agentIds) {
        for (let i = 0; i < 3; i++) {
          const mockStrategy = strategy as any;
          mockStrategy.orchestrator.executeService = vi.fn().mockResolvedValue({
            success: Math.random() > 0.3, // 70% success rate
            data: { result: 'completed' },
            executionTimeMs: 800 + Math.random() * 400,
          });

          try {
            await strategy.assignTaskToAgent(agentId, {
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
        const learningState = strategy.getAgentLearningState(agentId);
        const agentHealth = strategy.getAgentHealth(agentId);

        expect(learningState!.totalTasks).toBe(3);
        expect(agentHealth!.taskSuccessRate).toBeGreaterThanOrEqual(0);
        expect(agentHealth!.averageResponseTime).toBeGreaterThan(0);
      }

      const metrics = await strategy.getMetrics();
      expect(metrics.learningProgress!.totalTasksCompleted).toBe(9); // 3 agents × 3 tasks
    });
  });

  describe('Error Handling and Fallback Scenarios', () => {
    let errorTestAgent: SwarmAgent;

    beforeEach(async () => {
      errorTestAgent = await strategy.createAgent({
        name: 'error-test-agent',
        type: 'tester',
        capabilities: ['testing', 'error-handling'],
      });
      testAgents.set(errorTestAgent.id, errorTestAgent);

      vi.advanceTimersByTime(1500);
    });

    it('should handle intelligence system failures gracefully', async () => {
      // Mock intelligence system failure
      const mockStrategy = strategy as any;
      const originalUpdateAgentHealth =
        mockStrategy.healthMonitor.updateAgentHealth;

      mockStrategy.healthMonitor.updateAgentHealth = vi
        .fn()
        .mockImplementation(() => {
          throw new Error('Health monitor failure');
        });

      // Task assignment should still work despite health monitor failure
      const taskConfig = {
        type: 'resilience_test',
        description: 'Test resilience to intelligence system failures',
        priority: 1,
      };

      // Should not throw despite health monitor failure
      await expect(
        strategy.assignTaskToAgent(errorTestAgent.id, taskConfig)
      ).resolves.not.toThrow();

      // Restore original method
      mockStrategy.healthMonitor.updateAgentHealth = originalUpdateAgentHealth;
    });

    it('should handle prediction system errors', async () => {
      // Get prediction with invalid parameters
      const prediction = strategy.predictTaskDuration(
        'non-existent-agent',
        'unknown-task'
      );

      // Should return default prediction rather than throwing
      expect(prediction).toBeTruthy();
      expect(prediction.duration).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThan(0.5); // Low confidence for unknown agent
    });

    it('should maintain system stability during partial failures', async () => {
      // Simulate partial orchestrator failure
      const mockStrategy = strategy as any;
      mockStrategy.orchestrator.executeNeuralService = vi
        .fn()
        .mockRejectedValue(new Error('Neural service unavailable'));

      // Task assignment should still work without neural coordination
      const taskConfig = {
        type: 'fallback_test',
        description: 'Test fallback behavior',
        priority: 1,
        requiresNeural: true, // Should fallback gracefully
      };

      await strategy.assignTaskToAgent(errorTestAgent.id, taskConfig);

      // Verify task was recorded despite neural service failure
      const learningState = strategy.getAgentLearningState(errorTestAgent.id);
      expect(learningState!.totalTasks).toBeGreaterThan(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with basic agent operations', async () => {
      // Create agent without intelligence features
      const basicAgent = await strategy.createAgent({
        name: 'basic-compatibility-agent',
        type: 'researcher',
        // No intelligence-specific configuration
      });
      testAgents.set(basicAgent.id, basicAgent);

      // Basic operations should work
      expect(basicAgent.name).toBe('basic-compatibility-agent');
      expect(basicAgent.type).toBe('researcher');

      // Wait for initialization
      vi.advanceTimersByTime(1500);

      // Basic task assignment should work
      await strategy.assignTaskToAgent(basicAgent.id, {
        type: 'basic_task',
        description: 'Basic compatibility test',
      });

      // Verify agent state
      const agents = await strategy.getAgents();
      const foundAgent = agents.find((a) => a.id === basicAgent.id);
      expect(foundAgent).toBeTruthy();
      expect(foundAgent!.status).toBe('idle');
    });

    it('should provide metrics in expected format', async () => {
      const metrics = await strategy.getMetrics();

      // Core metrics should always be available
      expect(typeof metrics.totalAgents).toBe('number');
      expect(typeof metrics.activeAgents).toBe('number');
      expect(typeof metrics.busyAgents).toBe('number');

      // Optional intelligence metrics may be undefined but should not break compatibility
      if (metrics.intelligenceMetrics) {
        expect(typeof metrics.intelligenceMetrics.systemHealthScore).toBe(
          'number'
        );
      }
    });
  });

  describe('Performance Validation', () => {
    it('should maintain acceptable performance with intelligence systems', async () => {
      const startTime = Date.now();

      // Create multiple agents rapidly
      const agentPromises = [];
      for (let i = 0; i < 5; i++) {
        agentPromises.push(
          strategy.createAgent({
            name: `perf-agent-${i}`,
            type: 'optimizer',
            capabilities: ['optimization'],
          })
        );
      }

      const agents = await Promise.all(agentPromises);
      for (const agent of agents) {
        testAgents.set(agent.id, agent);
      }

      const creationTime = Date.now() - startTime;

      // Agent creation should be reasonably fast even with intelligence systems
      expect(creationTime).toBeLessThan(1000); // Should complete within 1 second

      // Wait for all agents to initialize
      vi.advanceTimersByTime(2000);

      // Verify all agents are properly initialized
      for (const agent of agents) {
        const learningState = strategy.getAgentLearningState(agent.id);
        const agentHealth = strategy.getAgentHealth(agent.id);

        expect(learningState).toBeTruthy();
        expect(agentHealth).toBeTruthy();
      }
    });

    it('should handle concurrent task assignments efficiently', async () => {
      // Create test agent
      const concurrentAgent = await strategy.createAgent({
        name: 'concurrent-agent',
        type: 'coordinator',
        capabilities: ['coordination', 'multitasking'],
      });
      testAgents.set(concurrentAgent.id, concurrentAgent);

      vi.advanceTimersByTime(1500);

      const startTime = Date.now();

      // Simulate concurrent task assignments (in sequence for this agent)
      const taskPromises = [];
      for (let i = 0; i < 5; i++) {
        const taskPromise = strategy.assignTaskToAgent(concurrentAgent.id, {
          type: 'concurrent_task',
          description: `Concurrent task ${i + 1}`,
          priority: 1,
        });
        taskPromises.push(taskPromise);

        // Small delay between task assignments
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await Promise.all(taskPromises);
      const executionTime = Date.now() - startTime;

      // Should handle multiple tasks efficiently
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds

      // Verify all tasks were recorded
      const learningState = strategy.getAgentLearningState(concurrentAgent.id);
      expect(learningState!.totalTasks).toBe(5);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should manage memory efficiently during extended operations', async () => {
      // Create agent for memory testing
      const memoryAgent = await strategy.createAgent({
        name: 'memory-agent',
        type: 'analyst',
        capabilities: ['analysis', 'memory-management'],
      });
      testAgents.set(memoryAgent.id, memoryAgent);

      vi.advanceTimersByTime(1500);

      // Execute many tasks to test memory management
      for (let i = 0; i < 50; i++) {
        await strategy.assignTaskToAgent(memoryAgent.id, {
          type: 'memory_test',
          description: `Memory test task ${i + 1}`,
          priority: 1,
          metadata: {
            iteration: i,
            data: new Array(100).fill(Math.random()), // Some test data
          },
        });

        // Advance time to trigger memory management
        if (i % 10 === 0) {
          vi.advanceTimersByTime(1000);
        }
      }

      // Verify memory management
      const learningState = strategy.getAgentLearningState(memoryAgent.id);

      // Learning system should maintain manageable history size
      expect(learningState!.successHistory.length).toBeLessThanOrEqual(50); // Should respect window size
      expect(learningState!.adaptationHistory.length).toBeLessThanOrEqual(20); // Should limit adaptation history
    });

    it('should cleanup resources properly on shutdown', async () => {
      // Create temporary agents
      const tempAgents = [];
      for (let i = 0; i < 3; i++) {
        const agent = await strategy.createAgent({
          name: `temp-agent-${i}`,
          type: 'tester',
          capabilities: ['testing'],
        });
        tempAgents.push(agent);
      }

      // Execute some tasks
      for (const agent of tempAgents) {
        await strategy.assignTaskToAgent(agent.id, {
          type: 'cleanup_test',
          description: 'Test cleanup behavior',
          priority: 1,
        });
      }

      // Shutdown should not throw errors
      await expect(strategy.shutdown()).resolves.not.toThrow();

      // Verify agents are properly cleaned up
      const metrics = await strategy.getMetrics();
      expect(metrics.totalAgents).toBe(0);
    });
  });
});
