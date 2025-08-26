/**
 * @fileoverview Comprehensive Test Suite for Agent Health Monitor
 *
 * Tests all aspects of the AgentHealthMonitor including:
 * - Health status tracking and calculation
 * - Performance metrics monitoring
 * - Trend analysis and prediction
 * - Alert generation and management
 * - Recovery action recommendations
 * - Integration with learning systems
 * - System-wide health analytics
 *
 * @author Claude Code Zen Team - Health Monitor Developer Agent
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  AgentHealthMonitor,
  createAgentHealthMonitor,
  DEFAULT_HEALTH_MONITOR_CONFIG,
} from '../agent-health-monitor';
import {
  type AgentLearningSystem,
  createAgentLearningSystem,
} from '../agent-learning-system';

// Mock the logging system
vi.mock('../../../config/logging-config', () => ({
  getLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('AgentHealthMonitor', () => {'
  let healthMonitor: AgentHealthMonitor;
  let learningSystem: AgentLearningSystem;
  let mockConfig: any;

  beforeAll(() => {
    // Set up test environment
    vi.useFakeTimers();
  });

  beforeEach(() => {
    // Create a test configuration with shorter intervals for testing
    mockConfig = {
      ...DEFAULT_HEALTH_MONITOR_CONFIG,
      healthCheckInterval: 1000, // 1 second for testing
      historyRetention: 100,
      prediction: {
        enabled: true,
        horizonMinutes: 5,
        updateInterval: 5000, // 5 seconds for testing
      },
    };

    learningSystem = createAgentLearningSystem();
    healthMonitor = new AgentHealthMonitor(mockConfig, learningSystem);
  });

  afterEach(() => {
    healthMonitor.shutdown();
    learningSystem.shutdown();
    vi.clearAllTimers();
  });

  describe('Constructor and Initialization', () => {'
    it('should initialize with default configuration', () => {'
      const monitor = createAgentHealthMonitor();
      expect(monitor).toBeInstanceOf(AgentHealthMonitor);
      monitor.shutdown();
    });

    it('should initialize with custom configuration', () => {'
      const customConfig = {
        healthCheckInterval: 5000,
        alertThresholds: {
          cpu: 0.9,
          memory: 0.95,
          diskUsage: 0.9,
          networkLatency: 2000,
          taskFailureRate: 0.4,
          responseTime: 3000,
          errorRate: 0.3,
        },
      };

      const monitor = new AgentHealthMonitor(customConfig);
      expect(monitor).toBeInstanceOf(AgentHealthMonitor);
      monitor.shutdown();
    });

    it('should initialize with learning system integration', () => {'
      const learning = createAgentLearningSystem();
      const monitor = new AgentHealthMonitor({}, learning);
      expect(monitor).toBeInstanceOf(AgentHealthMonitor);
      monitor.shutdown();
      learning.shutdown();
    });
  });

  describe('Health Metrics Update', () => {'
    it('should update agent health metrics correctly', () => {'
      const agentId = 'test-agent-1';
      const metrics = {
        cpuUsage: 0.65,
        memoryUsage: 0.45,
        taskSuccessRate: 0.92,
        averageResponseTime: 1500,
        errorRate: 0.05,
        uptime: 3600000, // 1 hour
      };

      healthMonitor.updateAgentHealth(agentId, metrics);
      const health = healthMonitor.getAgentHealth(agentId);

      expect(health).toBeTruthy();
      expect(health?.agentId).toBe(agentId);
      expect(health?.cpuUsage).toBe(metrics.cpuUsage);
      expect(health?.memoryUsage).toBe(metrics.memoryUsage);
      expect(health?.taskSuccessRate).toBe(metrics.taskSuccessRate);
      expect(health?.averageResponseTime).toBe(metrics.averageResponseTime);
      expect(health?.errorRate).toBe(metrics.errorRate);
      expect(health?.uptime).toBe(metrics.uptime);
    });

    it('should calculate health score correctly', () => {'
      const agentId = 'test-agent-score';

      // Test healthy metrics
      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.3,
        memoryUsage: 0.4,
        taskSuccessRate: 0.95,
        averageResponseTime: 500,
        errorRate: 0.02,
        uptime: 86400000, // 24 hours
      });

      let health = healthMonitor.getAgentHealth(agentId);
      expect(health?.healthScore).toBeGreaterThan(0.8);
      expect(health?.status).toBe('healthy');'

      // Test unhealthy metrics
      healthMonitor.updateAgentHealth(agentId, 
        cpuUsage: 0.95,
        memoryUsage: 0.92,
        taskSuccessRate: 0.4,
        averageResponseTime: 8000,
        errorRate: 0.4,);

      health = healthMonitor.getAgentHealth(agentId);
      expect(health?.healthScore).toBeLessThan(0.4);
      expect(health?.status).toBe('unhealthy');'
    });

    it('should determine health status correctly', () => {'
      const agentId = 'test-agent-status';

      // Test healthy status
      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.3,
        memoryUsage: 0.4,
        taskSuccessRate: 0.95,
        errorRate: 0.02,
      });
      expect(healthMonitor.getAgentHealth(agentId)?.status).toBe('healthy');'

      // Test degraded status
      healthMonitor.updateAgentHealth(agentId, 
        cpuUsage: 0.6,
        memoryUsage: 0.7,
        taskSuccessRate: 0.6,
        averageResponseTime: 6000,);
      expect(healthMonitor.getAgentHealth(agentId)?.status).toBe('degraded');'

      // Test unhealthy status
      healthMonitor.updateAgentHealth(agentId, 
        cpuUsage: 0.85,
        memoryUsage: 0.95,
        taskSuccessRate: 0.4,
        errorRate: 0.3,);
      expect(healthMonitor.getAgentHealth(agentId)?.status).toBe('unhealthy');'

      // Test critical status
      healthMonitor.updateAgentHealth(agentId, 
        cpuUsage: 0.97,
        memoryUsage: 0.99,
        errorRate: 0.6,);
      expect(healthMonitor.getAgentHealth(agentId)?.status).toBe('critical');'
    });
  });

  describe('Health Status Queries', () => {'
    beforeEach(() => 
      // Set up multiple agents with different health statuses
      healthMonitor.updateAgentHealth('healthy-agent-1', {'
        cpuUsage: 0.3,
        memoryUsage: 0.4,
        taskSuccessRate: 0.95,
        errorRate: 0.02,
      });

      healthMonitor.updateAgentHealth('healthy-agent-2', {'
        cpuUsage: 0.4,
        memoryUsage: 0.5,
        taskSuccessRate: 0.9,
        errorRate: 0.03,
      });

      healthMonitor.updateAgentHealth('degraded-agent', {'
        cpuUsage: 0.7,
        memoryUsage: 0.8,
        taskSuccessRate: 0.6,
        averageResponseTime: 6000,
      });

      healthMonitor.updateAgentHealth('unhealthy-agent', {'
        cpuUsage: 0.9,
        memoryUsage: 0.95,
        taskSuccessRate: 0.4,
        errorRate: 0.3,
      }););

    it('should return healthy agents correctly', () => {'
      const healthyAgents = healthMonitor.getHealthyAgents();
      expect(healthyAgents).toHaveLength(2);
      expect(healthyAgents).toContain('healthy-agent-1');'
      expect(healthyAgents).toContain('healthy-agent-2');'
    });

    it('should return degraded agents correctly', () => {'
      const degradedAgents = healthMonitor.getDegradedAgents();
      expect(degradedAgents).toHaveLength(1);
      expect(degradedAgents).toContain('degraded-agent');'
    });

    it('should return unhealthy agents correctly', () => {'
      const unhealthyAgents = healthMonitor.getUnhealthyAgents();
      expect(unhealthyAgents).toHaveLength(1);
      expect(unhealthyAgents).toContain('unhealthy-agent');'
    });
  });

  describe('Health Trend Analysis', () => {'
    it('should analyze improving health trends', () => {'
      const agentId = 'trending-agent';

      // Create an improving trend
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(agentId, {
          cpuUsage: 0.8 - i * 0.03, // Decreasing CPU usage
          memoryUsage: 0.7 - i * 0.02, // Decreasing memory usage
          taskSuccessRate: 0.5 + i * 0.03, // Increasing success rate
          averageResponseTime: 5000 - i * 200, // Decreasing response time
          errorRate: 0.3 - i * 0.015, // Decreasing error rate
        });

        // Advance time to create a trend
        vi.advanceTimersByTime(1000);
      }

      const trend = healthMonitor.getHealthTrend(agentId);
      expect(trend).toBeTruthy();
      expect(trend?.trend).toBe('improving' | 'stable' | 'declining'');'
      expect(trend?.slope).toBeGreaterThan(0);
      expect(trend?.confidence).toBeGreaterThan(0.5);
    });

    it('should analyze declining health trends', () => {'
      const agentId = 'declining-agent';

      // Create a declining trend
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(agentId, {
          cpuUsage: 0.3 + i * 0.04, // Increasing CPU usage
          memoryUsage: 0.4 + i * 0.03, // Increasing memory usage
          taskSuccessRate: 0.9 - i * 0.03, // Decreasing success rate
          averageResponseTime: 1000 + i * 300, // Increasing response time
          errorRate: 0.02 + i * 0.02, // Increasing error rate
        });

        vi.advanceTimersByTime(1000);
      }

      const trend = healthMonitor.getHealthTrend(agentId);
      expect(trend).toBeTruthy();
      expect(trend?.trend).toBe(''improving' | 'stable' | 'declining');'
      expect(trend?.slope).toBeLessThan(0);
      expect(trend?.confidence).toBeGreaterThan(0.5);
    });

    it('should analyze stable health trends', () => {'
      const agentId = 'stable'-agent';

      // Create a stable trend
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(agentId, {
          cpuUsage: 0.5 + (Math.random() - 0.5) * 0.05, // Small random variation
          memoryUsage: 0.6 + (Math.random() - 0.5) * 0.05,
          taskSuccessRate: 0.8 + (Math.random() - 0.5) * 0.05,
          averageResponseTime: 2000 + (Math.random() - 0.5) * 200,
          errorRate: 0.1 + (Math.random() - 0.5) * 0.02,
        });

        vi.advanceTimersByTime(1000);
      }

      const trend = healthMonitor.getHealthTrend(agentId);
      expect(trend).toBeTruthy();
      expect(trend?.trend).toBe('stable');'
      expect(Math.abs(trend!.slope)).toBeLessThan(0.1);
    });
  });

  describe('Health Prediction', () => {'
    it('should generate health predictions for trending agents', () => {'
      const agentId = 'prediction-agent';

      // Create a declining trend that should trigger prediction
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(agentId, {
          cpuUsage: 0.4 + i * 0.03,
          memoryUsage: 0.5 + i * 0.02,
          taskSuccessRate: 0.9 - i * 0.02,
          errorRate: 0.05 + i * 0.015,
        });

        vi.advanceTimersByTime(1000);
      }

      const trend = healthMonitor.getHealthTrend(agentId);
      expect(trend).toBeTruthy();
      expect(trend?.prediction).toBeTruthy();
      expect(trend?.prediction.predictedStatus).toBeTruthy();
      expect(trend?.prediction.timeToStatusChange).toBeGreaterThan(0);
      expect(trend?.prediction.confidence).toBeGreaterThan(0);
      expect(trend?.prediction.factors).toBeInstanceOf(Array);
      expect(trend?.prediction.recommendations).toBeInstanceOf(Array);
    });

    it('should identify contributing factors in predictions', () => {'
      const agentId = 'factors-agent';

      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.9, // High CPU - should be identified
        memoryUsage: 0.95, // High memory - should be identified
        taskSuccessRate: 0.4, // Low success rate - should be identified
        averageResponseTime: 8000, // High response time - should be identified
        errorRate: 0.3, // High error rate - should be identified
      });

      // Generate trend data
      for (let i = 0; i < 12; i++) {
        healthMonitor.updateAgentHealth(agentId, {
          cpuUsage: 0.9,
          memoryUsage: 0.95,
          taskSuccessRate: 0.4,
          averageResponseTime: 8000,
          errorRate: 0.3,
        });
        vi.advanceTimersByTime(1000);
      }

      const trend = healthMonitor.getHealthTrend(agentId);
      const factors = trend?.prediction.factors;

      expect(factors).toContain('High CPU usage');'
      expect(factors).toContain('High memory usage');'
      expect(factors).toContain('Low task success rate');'
      expect(factors).toContain('High response time');'
      expect(factors).toContain('High error rate');'
    });
  });

  describe('Alert Management', () => {'
    it('should generate alerts for threshold violations', () => {'
      const agentId = 'alert-agent';

      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.85, // Above threshold
        memoryUsage: 0.95, // Above threshold
        taskSuccessRate: 0.4, // Below threshold (high failure rate)
        averageResponseTime: 8000, // Above threshold
        errorRate: 0.3, // Above threshold
      });

      const alerts = healthMonitor.getActiveAlerts(agentId);
      expect(alerts.length).toBeGreaterThan(0);

      // Check for specific alert types
      const alertTypes = alerts.map((alert) => alert.type);
      expect(alertTypes).toContain('high_cpu_usage');'
      expect(alertTypes).toContain('high_memory_usage');'
      expect(alertTypes).toContain('high_task_failure_rate');'
      expect(alertTypes).toContain('high_response_time');'
      expect(alertTypes).toContain('high_error_rate');'
    });

    it('should set appropriate alert severities', () => {'
      const agentId = 'severity-agent';

      // Critical CPU usage
      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.97,
      });

      let alerts = healthMonitor.getActiveAlerts(agentId);
      const _criticalAlert = alerts.find((a) => a.type === 'high_cpu_usage');'
      expect(criticalAlert!.severity).toBe('critical');'

      // Warning level CPU usage
      healthMonitor.updateAgentHealth(agentId, 
        cpuUsage: 0.82,);

      // Clear previous alerts for clean test
      for (const alert of alerts) {
        healthMonitor.resolveAlert(alert.id);
      }

      // Update again to trigger new alert
      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.82,
      });

      alerts = healthMonitor.getActiveAlerts(agentId);
      const warningAlert = alerts.find(
        (a) => a.type === 'high_cpu_usage' && !a.resolved'
      );
      if (warningAlert) {
        expect(warningAlert.severity).toBe('warning');'
      }
    });

    it('should resolve alerts correctly', () => {'
      const agentId = 'resolve-agent';

      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.9,
      });

      const alerts = healthMonitor.getActiveAlerts(agentId);
      expect(alerts.length).toBeGreaterThan(0);

      const alertId = alerts[0].id;
      const _resolved = healthMonitor.resolveAlert(alertId, 'Test resolution');'

      expect(resolved).toBe(true);

      const resolvedAlert = healthMonitor
        .getActiveAlerts()
        .find((a) => a.id === alertId);
      expect(resolvedAlert?.resolved).toBe(true);
      expect(resolvedAlert?.resolvedAt).toBeTruthy();
      expect(resolvedAlert?.details.resolution).toBe('Test resolution');'
    });
  });

  describe('Recovery Actions', () => {'
    it('should generate appropriate recovery actions', () => {'
      const agentId = 'recovery-agent';

      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.9,
        memoryUsage: 0.95,
        taskSuccessRate: 0.4,
        averageResponseTime: 8000,
        errorRate: 0.3,
      });

      const actions = healthMonitor.getRecoveryRecommendations(agentId);
      expect(actions.length).toBeGreaterThan(0);

      // Check for specific action types
      const actionTypes = actions.map((action) => action.type);
      expect(actionTypes).toContain('optimize');'

      // Check action properties
      const cpuAction = actions.find((a) => a.description.includes('CPU'));'
      expect(cpuAction).toBeTruthy();
      expect(cpuAction?.priority).toBe('critical');'
      expect(cpuAction!.confidence).toBeGreaterThan(0);
      expect(cpuAction?.estimatedDuration).toBeGreaterThan(0);
      expect(cpuAction?.prerequisites).toBeInstanceOf(Array);
    });

    it('should generate restart action for critical agents', () => {'
      const agentId = 'critical-agent';

      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.97,
        memoryUsage: 0.99,
        errorRate: 0.6,
      });

      // Ensure critical status
      const health = healthMonitor.getAgentHealth(agentId);
      expect(health?.status).toBe('critical');'

      const actions = healthMonitor.getRecoveryRecommendations(agentId);
      const restartAction = actions.find((a) => a.type === 'restart');'

      expect(restartAction).toBeTruthy();
      expect(restartAction?.priority).toBe('critical');'
      expect(restartAction!.riskLevel).toBe('high');'
      expect(restartAction!.automation).toBe(false);
    });

    it('should execute recovery actions', async () => {'
      const agentId = 'execute-agent';

      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.9,
      });

      const actions = healthMonitor.getRecoveryRecommendations(agentId);
      expect(actions.length).toBeGreaterThan(0);

      const actionId = actions[0].id;

      // Execute the action
      const result = await healthMonitor.executeRecoveryAction(
        agentId,
        actionId
      );
      expect(typeof result).toBe('boolean');'
    });
  });

  describe('System Health Summary', () => {'
    beforeEach(() => 
      // Set up multiple agents with various health statuses
      healthMonitor.updateAgentHealth('healthy-1', {'
        cpuUsage: 0.3,
        memoryUsage: 0.4,
        taskSuccessRate: 0.95,
        errorRate: 0.02,
      });

      healthMonitor.updateAgentHealth('healthy-2', {'
        cpuUsage: 0.4,
        memoryUsage: 0.5,
        taskSuccessRate: 0.9,
        errorRate: 0.03,
      });

      healthMonitor.updateAgentHealth('degraded-1', {'
        cpuUsage: 0.7,
        memoryUsage: 0.8,
        taskSuccessRate: 0.6,
        averageResponseTime: 6000,
      });

      healthMonitor.updateAgentHealth('unhealthy-1', {'
        cpuUsage: 0.9,
        memoryUsage: 0.95,
        taskSuccessRate: 0.4,
        errorRate: 0.3,
      });

      healthMonitor.updateAgentHealth('critical-1', {'
        cpuUsage: 0.97,
        memoryUsage: 0.99,
        errorRate: 0.6,
      }););

    it('should generate comprehensive system health summary', () => {'
      const summary = healthMonitor.getSystemHealthSummary();

      expect(summary.totalAgents).toBe(5);
      expect(summary.healthyAgents).toBe(2);
      expect(summary.degradedAgents).toBe(1);
      expect(summary.unhealthyAgents).toBe(1);
      expect(summary.criticalAgents).toBe(1);
      expect(summary.averageHealthScore).toBeGreaterThan(0);
      expect(summary.systemHealthScore).toBeGreaterThan(0);
      expect(summary.activeAlerts).toBeGreaterThan(0);
      expect(summary.topIssues).toBeInstanceOf(Array);
      expect(summary.performanceTrends).toBeTruthy();
      expect(summary.lastUpdated).toBeInstanceOf(Date);
    });

    it('should calculate system health score correctly', () => {'
      const summary = healthMonitor.getSystemHealthSummary();

      // With 2 healthy, 1 degraded, 1 unhealthy, 1 critical out of 5 agents
      // System health should be moderate
      expect(summary.systemHealthScore).toBeGreaterThan(0.2);
      expect(summary.systemHealthScore).toBeLessThan(0.8);
    });

    it('should identify top health issues', () => {'
      const summary = healthMonitor.getSystemHealthSummary();

      expect(summary.topIssues.length).toBeGreaterThan(0);

      // Should have high CPU and memory usage as top issues
      const issueTypes = summary.topIssues.map((issue) => issue.type);
      expect(issueTypes).toContain('high_cpu_usage');'
      expect(issueTypes).toContain('high_memory_usage');'
    });
  });

  describe('Learning System Integration', () => {'
    it('should integrate with learning system when provided', () => {'
      const agentId = 'learning-agent';

      // Update health with good performance
      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.4,
        memoryUsage: 0.5,
        taskSuccessRate: 0.9,
        averageResponseTime: 1500,
        errorRate: 0.05,
      });

      // Check if learning system received the update
      const learningState = learningSystem.getPerformanceSummary(agentId);
      expect(learningState).toBeTruthy();

      // Update with poor performance
      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.9,
        memoryUsage: 0.95,
        taskSuccessRate: 0.3,
        averageResponseTime: 8000,
        errorRate: 0.4,
      });

      // Learning system should track the performance changes
      const updatedState = learningSystem.getPerformanceSummary(agentId);
      expect(updatedState?.totalTasks).toBeGreaterThan(
        learningState?.totalTasks
      );
    });
  });

  describe('Periodic Health Monitoring', () => {'
    it('should detect stale agents during periodic checks', () => {'
      const agentId = 'stale-agent';

      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 0.4,
        memoryUsage: 0.5,
        taskSuccessRate: 0.9,
      });

      let health = healthMonitor.getAgentHealth(agentId);
      expect(health?.status).not.toBe('unknown');'

      // Advance time beyond stale threshold
      vi.advanceTimersByTime(mockConfig.healthCheckInterval * 3);

      health = healthMonitor.getAgentHealth(agentId);
      expect(health?.status).toBe('unknown');'
      expect(health!.healthScore).toBeLessThan(0.5);
    });
  });

  describe('Configuration and Cleanup', () => {'
    it('should shutdown cleanly', () => {'
      const monitor = createAgentHealthMonitor();

      // Add some data
      monitor.updateAgentHealth('test-agent', {'
        cpuUsage: 0.5,
        memoryUsage: 0.6,
      });

      // Should not throw when shutting down
      expect(() => monitor.shutdown()).not.toThrow();
    });

    it('should handle missing agent data gracefully', () => {'
      const nonExistentAgent = 'non-existent-agent';

      const health = healthMonitor.getAgentHealth(nonExistentAgent);
      expect(health).toBeNull();

      const trend = healthMonitor.getHealthTrend(nonExistentAgent);
      expect(trend).toBeNull();

      const recommendations =
        healthMonitor.getRecoveryRecommendations(nonExistentAgent);
      expect(recommendations).toEqual([]);
    });

    it('should handle edge cases in health calculations', () => {'
      const agentId = 'edge-case-agent';

      // Test with extreme values
      healthMonitor.updateAgentHealth(agentId, {
        cpuUsage: 1.0,
        memoryUsage: 1.0,
        taskSuccessRate: 0.0,
        averageResponseTime: 0,
        errorRate: 1.0,
      });

      const health = healthMonitor.getAgentHealth(agentId);
      expect(health?.healthScore).toBeGreaterThanOrEqual(0);
      expect(health?.healthScore).toBeLessThanOrEqual(1);
      expect(health?.status).toBe('critical');'
    });
  });

  describe('Factory Function', () => {'
    it('should create health monitor with factory function', () => {'
      const monitor = createAgentHealthMonitor();
      expect(monitor).toBeInstanceOf(AgentHealthMonitor);
      monitor.shutdown();
    });

    it('should create health monitor with custom config via factory', () => {'
      const customConfig = {
        healthCheckInterval: 5000,
        alertThresholds: {
          cpu: 0.9,
          memory: 0.95,
          diskUsage: 0.9,
          networkLatency: 2000,
          taskFailureRate: 0.4,
          responseTime: 3000,
          errorRate: 0.3,
        },
      };

      const monitor = createAgentHealthMonitor(customConfig);
      expect(monitor).toBeInstanceOf(AgentHealthMonitor);
      monitor.shutdown();
    });

    it('should create health monitor with learning system via factory', () => {'
      const learning = createAgentLearningSystem();
      const monitor = createAgentHealthMonitor({}, learning);
      expect(monitor).toBeInstanceOf(AgentHealthMonitor);
      monitor.shutdown();
      learning.shutdown();
    });
  });
});
