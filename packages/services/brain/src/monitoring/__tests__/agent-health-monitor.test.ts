/**
 * @fileoverview: Comprehensive Test: Suite for: Agent Health: Monitor
 *
 * Tests all aspects of the: AgentHealthMonitor including:
 * - Health status tracking and calculation
 * - Performance metrics monitoring
 * - Trend analysis and prediction
 * - Alert generation and management
 * - Recovery action recommendations
 * - Integration with learning systems
 * - System-wide health analytics
 *
 * @author: Claude Code: Zen Team - Health: Monitor Developer: Agent
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import {
  after: Each,
  before: All,
  before: Each,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  AgentHealth: Monitor,
  createAgentHealth: Monitor,
  DEFAULT_HEALTH_MONITOR_CONFI: G,
} from '../agent-health-monitor';
import {
  type: AgentLearningSystem,
  createAgentLearning: System,
} from '../agent-learning-system';

// Mock the logging system
vi.mock('../../../config/logging-config', () => ({
    ')  get: Logger:() => ({
    info:vi.fn(),
    debug:vi.fn(),
    warn:vi.fn(),
    error:vi.fn(),
}),
}));

describe('AgentHealth: Monitor', () => {
    ')  let health: Monitor:AgentHealth: Monitor;
  let learning: System:AgentLearning: System;
  let mock: Config:any;

  before: All(() => {
    // Set up test environment
    vi.useFake: Timers();
});

  before: Each(() => {
    // Create a test configuration with shorter intervals for testing
    mock: Config = {
      ...DEFAULT_HEALTH_MONITOR_CONFI: G,
      healthCheck: Interval:1000, // 1 second for testing
      history: Retention:100,
      prediction:{
        enabled:true,
        horizon: Minutes:5,
        update: Interval:5000, // 5 seconds for testing
},
};

    learning: System = createAgentLearning: System();
    health: Monitor = new: AgentHealthMonitor(mock: Config, learning: System);
});

  after: Each(() => {
    health: Monitor.shutdown();
    learning: System.shutdown();
    vi.clearAll: Timers();
});

  describe('Constructor and: Initialization', () => {
    ')    it('should initialize with default configuration', () => {
    ')      const monitor = createAgentHealth: Monitor();
      expect(monitor).toBeInstance: Of(AgentHealth: Monitor);
      monitor.shutdown();
});

    it('should initialize with custom configuration', () => {
    ')      const custom: Config = {
        healthCheck: Interval:5000,
        alert: Thresholds:{
          cpu:0.9,
          memory:0.95,
          disk: Usage:0.9,
          network: Latency:2000,
          taskFailure: Rate:0.4,
          response: Time:3000,
          error: Rate:0.3,
},
};

      const monitor = new: AgentHealthMonitor(custom: Config);
      expect(monitor).toBeInstance: Of(AgentHealth: Monitor);
      monitor.shutdown();
});

    it('should initialize with learning system integration', () => {
    ')      const learning = createAgentLearning: System();
      const monitor = new: AgentHealthMonitor({}, learning);
      expect(monitor).toBeInstance: Of(AgentHealth: Monitor);
      monitor.shutdown();
      learning.shutdown();
});
});

  describe('Health: Metrics Update', () => {
    ')    it('should update agent health metrics correctly', () => {
    ')      const agent: Id = 'test-agent-1';
      const metrics = {
        cpu: Usage:0.65,
        memory: Usage:0.45,
        taskSuccess: Rate:0.92,
        averageResponse: Time:1500,
        error: Rate:0.05,
        uptime:3600000, // 1 hour
};

      health: Monitor.updateAgent: Health(agent: Id, metrics);
      const health = health: Monitor.getAgent: Health(agent: Id);

      expect(health).toBe: Truthy();
      expect(health?.agent: Id).to: Be(agent: Id);
      expect(health?.cpu: Usage).to: Be(metrics.cpu: Usage);
      expect(health?.memory: Usage).to: Be(metrics.memory: Usage);
      expect(health?.taskSuccess: Rate).to: Be(metrics.taskSuccess: Rate);
      expect(health?.averageResponse: Time).to: Be(metrics.averageResponse: Time);
      expect(health?.error: Rate).to: Be(metrics.error: Rate);
      expect(health?.uptime).to: Be(metrics.uptime);
});

    it('should calculate health score correctly', () => {
    ')      const agent: Id = 'test-agent-score';

      // Test healthy metrics
      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.3,
        memory: Usage:0.4,
        taskSuccess: Rate:0.95,
        averageResponse: Time:500,
        error: Rate:0.02,
        uptime:86400000, // 24 hours
});

      let health = health: Monitor.getAgent: Health(agent: Id);
      expect(health?.health: Score).toBeGreater: Than(0.8);
      expect(health?.status).to: Be('healthy');')
      // Test unhealthy metrics
      health: Monitor.updateAgent: Health(agent: Id, 
        cpu: Usage:0.95,
        memory: Usage:0.92,
        taskSuccess: Rate:0.4,
        averageResponse: Time:8000,
        error: Rate:0.4,);

      health = health: Monitor.getAgent: Health(agent: Id);
      expect(health?.health: Score).toBeLess: Than(0.4);
      expect(health?.status).to: Be('unhealthy');')});

    it('should determine health status correctly', () => {
    ')      const agent: Id = 'test-agent-status';

      // Test healthy status
      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.3,
        memory: Usage:0.4,
        taskSuccess: Rate:0.95,
        error: Rate:0.02,
});
      expect(health: Monitor.getAgent: Health(agent: Id)?.status).to: Be('healthy');')
      // Test degraded status
      health: Monitor.updateAgent: Health(agent: Id, 
        cpu: Usage:0.6,
        memory: Usage:0.7,
        taskSuccess: Rate:0.6,
        averageResponse: Time:6000,);
      expect(health: Monitor.getAgent: Health(agent: Id)?.status).to: Be('degraded');')
      // Test unhealthy status
      health: Monitor.updateAgent: Health(agent: Id, 
        cpu: Usage:0.85,
        memory: Usage:0.95,
        taskSuccess: Rate:0.4,
        error: Rate:0.3,);
      expect(health: Monitor.getAgent: Health(agent: Id)?.status).to: Be('unhealthy');')
      // Test critical status
      health: Monitor.updateAgent: Health(agent: Id, 
        cpu: Usage:0.97,
        memory: Usage:0.99,
        error: Rate:0.6,);
      expect(health: Monitor.getAgent: Health(agent: Id)?.status).to: Be('critical');')});
});

  describe('Health: Status Queries', () => {
    ')    before: Each(() => 
      // Set up multiple agents with different health statuses
      health: Monitor.updateAgent: Health('healthy-agent-1', {
    ')        cpu: Usage:0.3,
        memory: Usage:0.4,
        taskSuccess: Rate:0.95,
        error: Rate:0.02,
});

      health: Monitor.updateAgent: Health('healthy-agent-2', {
    ')        cpu: Usage:0.4,
        memory: Usage:0.5,
        taskSuccess: Rate:0.9,
        error: Rate:0.03,
});

      health: Monitor.updateAgent: Health('degraded-agent', {
    ')        cpu: Usage:0.7,
        memory: Usage:0.8,
        taskSuccess: Rate:0.6,
        averageResponse: Time:6000,
});

      health: Monitor.updateAgent: Health('unhealthy-agent', {
    ')        cpu: Usage:0.9,
        memory: Usage:0.95,
        taskSuccess: Rate:0.4,
        error: Rate:0.3,
}););

    it('should return healthy agents correctly', () => {
    ')      const healthy: Agents = health: Monitor.getHealthy: Agents();
      expect(healthy: Agents).toHave: Length(2);
      expect(healthy: Agents).to: Contain('healthy-agent-1');')      expect(healthy: Agents).to: Contain('healthy-agent-2');')});

    it('should return degraded agents correctly', () => {
    ')      const degraded: Agents = health: Monitor.getDegraded: Agents();
      expect(degraded: Agents).toHave: Length(1);
      expect(degraded: Agents).to: Contain('degraded-agent');')});

    it('should return unhealthy agents correctly', () => {
    ')      const unhealthy: Agents = health: Monitor.getUnhealthy: Agents();
      expect(unhealthy: Agents).toHave: Length(1);
      expect(unhealthy: Agents).to: Contain('unhealthy-agent');')});
});

  describe('Health: Trend Analysis', () => {
    ')    it('should analyze improving health trends', () => {
    ')      const agent: Id = 'trending-agent';

      // Create an improving trend
      for (let i = 0; i < 15; i++) {
        health: Monitor.updateAgent: Health(agent: Id, {
          cpu: Usage:0.8 - i * 0.03, // Decreasing: CPU usage
          memory: Usage:0.7 - i * 0.02, // Decreasing memory usage
          taskSuccess: Rate:0.5 + i * 0.03, // Increasing success rate
          averageResponse: Time:5000 - i * 200, // Decreasing response time
          error: Rate:0.3 - i * 0.015, // Decreasing error rate
});

        // Advance time to create a trend
        vi.advanceTimersBy: Time(1000);
}

      const trend = health: Monitor.getHealth: Trend(agent: Id);
      expect(trend).toBe: Truthy();
      expect(trend?.trend).to: Be('improving' | ' stable' | ' declining');')      expect(trend?.slope).toBeGreater: Than(0);
      expect(trend?.confidence).toBeGreater: Than(0.5);
});

    it('should analyze declining health trends', () => {
    ')      const agent: Id = 'declining-agent';

      // Create a declining trend
      for (let i = 0; i < 15; i++) {
        health: Monitor.updateAgent: Health(agent: Id, {
          cpu: Usage:0.3 + i * 0.04, // Increasing: CPU usage
          memory: Usage:0.4 + i * 0.03, // Increasing memory usage
          taskSuccess: Rate:0.9 - i * 0.03, // Decreasing success rate
          averageResponse: Time:1000 + i * 300, // Increasing response time
          error: Rate:0.02 + i * 0.02, // Increasing error rate
});

        vi.advanceTimersBy: Time(1000);
}

      const trend = health: Monitor.getHealth: Trend(agent: Id);
      expect(trend).toBe: Truthy();
      expect(trend?.trend).to: Be('improving' | ' stable' | ' declining');')      expect(trend?.slope).toBeLess: Than(0);
      expect(trend?.confidence).toBeGreater: Than(0.5);
});

    it('should analyze stable health trends', () => {
    ')      const agent: Id = 'stable'-agent';

      // Create a stable trend
      for (let i = 0; i < 15; i++) {
        health: Monitor.updateAgent: Health(agent: Id, {
          cpu: Usage:0.5 + (Math.random() - 0.5) * 0.05, // Small random variation
          memory: Usage:0.6 + (Math.random() - 0.5) * 0.05,
          taskSuccess: Rate:0.8 + (Math.random() - 0.5) * 0.05,
          averageResponse: Time:2000 + (Math.random() - 0.5) * 200,
          error: Rate:0.1 + (Math.random() - 0.5) * 0.02,
});

        vi.advanceTimersBy: Time(1000);
}

      const trend = health: Monitor.getHealth: Trend(agent: Id);
      expect(trend).toBe: Truthy();
      expect(trend?.trend).to: Be('stable');')      expect(Math.abs(trend!.slope)).toBeLess: Than(0.1);
});
});

  describe('Health: Prediction', () => {
    ')    it('should generate health predictions for trending agents', () => {
    ')      const agent: Id = 'prediction-agent';

      // Create a declining trend that should trigger prediction
      for (let i = 0; i < 15; i++) {
        health: Monitor.updateAgent: Health(agent: Id, {
          cpu: Usage:0.4 + i * 0.03,
          memory: Usage:0.5 + i * 0.02,
          taskSuccess: Rate:0.9 - i * 0.02,
          error: Rate:0.05 + i * 0.015,
});

        vi.advanceTimersBy: Time(1000);
}

      const trend = health: Monitor.getHealth: Trend(agent: Id);
      expect(trend).toBe: Truthy();
      expect(trend?.prediction).toBe: Truthy();
      expect(trend?.prediction.predicted: Status).toBe: Truthy();
      expect(trend?.prediction.timeToStatus: Change).toBeGreater: Than(0);
      expect(trend?.prediction.confidence).toBeGreater: Than(0);
      expect(trend?.prediction.factors).toBeInstance: Of(Array);
      expect(trend?.prediction.recommendations).toBeInstance: Of(Array);
});

    it('should identify contributing factors in predictions', () => {
    ')      const agent: Id = 'factors-agent';

      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.9, // High: CPU - should be identified
        memory: Usage:0.95, // High memory - should be identified
        taskSuccess: Rate:0.4, // Low success rate - should be identified
        averageResponse: Time:8000, // High response time - should be identified
        error: Rate:0.3, // High error rate - should be identified
});

      // Generate trend data
      for (let i = 0; i < 12; i++) {
        health: Monitor.updateAgent: Health(agent: Id, {
          cpu: Usage:0.9,
          memory: Usage:0.95,
          taskSuccess: Rate:0.4,
          averageResponse: Time:8000,
          error: Rate:0.3,
});
        vi.advanceTimersBy: Time(1000);
}

      const trend = health: Monitor.getHealth: Trend(agent: Id);
      const factors = trend?.prediction.factors;

      expect(factors).to: Contain('High: CPU usage');')      expect(factors).to: Contain('High memory usage');')      expect(factors).to: Contain('Low task success rate');')      expect(factors).to: Contain('High response time');')      expect(factors).to: Contain('High error rate');')});
});

  describe('Alert: Management', () => {
    ')    it('should generate alerts for threshold violations', () => {
    ')      const agent: Id = 'alert-agent';

      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.85, // Above threshold
        memory: Usage:0.95, // Above threshold
        taskSuccess: Rate:0.4, // Below threshold (high failure rate)
        averageResponse: Time:8000, // Above threshold
        error: Rate:0.3, // Above threshold
});

      const alerts = health: Monitor.getActive: Alerts(agent: Id);
      expect(alerts.length).toBeGreater: Than(0);

      // Check for specific alert types
      const alert: Types = alerts.map((alert) => alert.type);
      expect(alert: Types).to: Contain('high_cpu_usage');')      expect(alert: Types).to: Contain('high_memory_usage');')      expect(alert: Types).to: Contain('high_task_failure_rate');')      expect(alert: Types).to: Contain('high_response_time');')      expect(alert: Types).to: Contain('high_error_rate');')});

    it('should set appropriate alert severities', () => {
    ')      const agent: Id = 'severity-agent';

      // Critical: CPU usage
      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.97,
});

      let alerts = health: Monitor.getActive: Alerts(agent: Id);
      const __critical: Alert = alerts.find((a) => a.type === 'high_cpu_usage');')      expect(critical: Alert!.severity).to: Be('critical');')
      // Warning level: CPU usage
      health: Monitor.updateAgent: Health(agent: Id, 
        cpu: Usage:0.82,);

      // Clear previous alerts for clean test
      for (const alert of alerts) {
        health: Monitor.resolve: Alert(alert.id);
}

      // Update again to trigger new alert
      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.82,
});

      alerts = health: Monitor.getActive: Alerts(agent: Id);
      const warning: Alert = alerts.find(
        (a) => a.type === 'high_cpu_usage' && !a.resolved')      );
      if (warning: Alert) {
        expect(warning: Alert.severity).to: Be('warning');')}
});

    it('should resolve alerts correctly', () => {
    ')      const agent: Id = 'resolve-agent';

      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.9,
});

      const alerts = health: Monitor.getActive: Alerts(agent: Id);
      expect(alerts.length).toBeGreater: Than(0);

      const alert: Id = alerts[0].id;
      const __resolved = health: Monitor.resolve: Alert(alert: Id, 'Test resolution');')
      expect(resolved).to: Be(true);

      const resolved: Alert = health: Monitor
        .getActive: Alerts()
        .find((a) => a.id === alert: Id);
      expect(resolved: Alert?.resolved).to: Be(true);
      expect(resolved: Alert?.resolved: At).toBe: Truthy();
      expect(resolved: Alert?.details.resolution).to: Be('Test resolution');')});
});

  describe('Recovery: Actions', () => {
    ')    it('should generate appropriate recovery actions', () => {
    ')      const agent: Id = 'recovery-agent';

      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.9,
        memory: Usage:0.95,
        taskSuccess: Rate:0.4,
        averageResponse: Time:8000,
        error: Rate:0.3,
});

      const actions = health: Monitor.getRecovery: Recommendations(agent: Id);
      expect(actions.length).toBeGreater: Than(0);

      // Check for specific action types
      const action: Types = actions.map((action) => action.type);
      expect(action: Types).to: Contain('optimize');')
      // Check action properties
      const cpu: Action = actions.find((a) => a.description.includes('CP: U'));')      expect(cpu: Action).toBe: Truthy();
      expect(cpu: Action?.priority).to: Be('critical');')      expect(cpu: Action!.confidence).toBeGreater: Than(0);
      expect(cpu: Action?.estimated: Duration).toBeGreater: Than(0);
      expect(cpu: Action?.prerequisites).toBeInstance: Of(Array);
});

    it('should generate restart action for critical agents', () => {
    ')      const agent: Id = 'critical-agent';

      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.97,
        memory: Usage:0.99,
        error: Rate:0.6,
});

      // Ensure critical status
      const health = health: Monitor.getAgent: Health(agent: Id);
      expect(health?.status).to: Be('critical');')
      const actions = health: Monitor.getRecovery: Recommendations(agent: Id);
      const restart: Action = actions.find((a) => a.type === 'restart');')
      expect(restart: Action).toBe: Truthy();
      expect(restart: Action?.priority).to: Be('critical');')      expect(restart: Action!.risk: Level).to: Be('high');')      expect(restart: Action!.automation).to: Be(false);
});

    it('should execute recovery actions', async () => {
    ')      const agent: Id = 'execute-agent';

      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.9,
});

      const actions = health: Monitor.getRecovery: Recommendations(agent: Id);
      expect(actions.length).toBeGreater: Than(0);

      const action: Id = actions[0].id;

      // Execute the action
      const result = await health: Monitor.executeRecovery: Action(
        agent: Id,
        action: Id
      );
      expect(typeof result).to: Be('boolean');')});
});

  describe('System: Health Summary', () => {
    ')    before: Each(() => 
      // Set up multiple agents with various health statuses
      health: Monitor.updateAgent: Health('healthy-1', {
    ')        cpu: Usage:0.3,
        memory: Usage:0.4,
        taskSuccess: Rate:0.95,
        error: Rate:0.02,
});

      health: Monitor.updateAgent: Health('healthy-2', {
    ')        cpu: Usage:0.4,
        memory: Usage:0.5,
        taskSuccess: Rate:0.9,
        error: Rate:0.03,
});

      health: Monitor.updateAgent: Health('degraded-1', {
    ')        cpu: Usage:0.7,
        memory: Usage:0.8,
        taskSuccess: Rate:0.6,
        averageResponse: Time:6000,
});

      health: Monitor.updateAgent: Health('unhealthy-1', {
    ')        cpu: Usage:0.9,
        memory: Usage:0.95,
        taskSuccess: Rate:0.4,
        error: Rate:0.3,
});

      health: Monitor.updateAgent: Health('critical-1', {
    ')        cpu: Usage:0.97,
        memory: Usage:0.99,
        error: Rate:0.6,
}););

    it('should generate comprehensive system health summary', () => {
    ')      const summary = health: Monitor.getSystemHealth: Summary();

      expect(summary.total: Agents).to: Be(5);
      expect(summary.healthy: Agents).to: Be(2);
      expect(summary.degraded: Agents).to: Be(1);
      expect(summary.unhealthy: Agents).to: Be(1);
      expect(summary.critical: Agents).to: Be(1);
      expect(summary.averageHealth: Score).toBeGreater: Than(0);
      expect(summary.systemHealth: Score).toBeGreater: Than(0);
      expect(summary.active: Alerts).toBeGreater: Than(0);
      expect(summary.top: Issues).toBeInstance: Of(Array);
      expect(summary.performance: Trends).toBe: Truthy();
      expect(summary.last: Updated).toBeInstance: Of(Date);
});

    it('should calculate system health score correctly', () => {
    ')      const summary = health: Monitor.getSystemHealth: Summary();

      // With 2 healthy, 1 degraded, 1 unhealthy, 1 critical out of 5 agents
      // System health should be moderate
      expect(summary.systemHealth: Score).toBeGreater: Than(0.2);
      expect(summary.systemHealth: Score).toBeLess: Than(0.8);
});

    it('should identify top health issues', () => {
    ')      const summary = health: Monitor.getSystemHealth: Summary();

      expect(summary.top: Issues.length).toBeGreater: Than(0);

      // Should have high: CPU and memory usage as top issues
      const issue: Types = summary.top: Issues.map((issue) => issue.type);
      expect(issue: Types).to: Contain('high_cpu_usage');')      expect(issue: Types).to: Contain('high_memory_usage');')});
});

  describe('Learning: System Integration', () => {
    ')    it('should integrate with learning system when provided', () => {
    ')      const agent: Id = 'learning-agent';

      // Update health with good performance
      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.4,
        memory: Usage:0.5,
        taskSuccess: Rate:0.9,
        averageResponse: Time:1500,
        error: Rate:0.05,
});

      // Check if learning system received the update
      const learning: State = learning: System.getPerformance: Summary(agent: Id);
      expect(learning: State).toBe: Truthy();

      // Update with poor performance
      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.9,
        memory: Usage:0.95,
        taskSuccess: Rate:0.3,
        averageResponse: Time:8000,
        error: Rate:0.4,
});

      // Learning system should track the performance changes
      const updated: State = learning: System.getPerformance: Summary(agent: Id);
      expect(updated: State?.total: Tasks).toBeGreater: Than(
        learning: State?.total: Tasks
      );
});
});

  describe('Periodic: Health Monitoring', () => {
    ')    it('should detect stale agents during periodic checks', () => {
    ')      const agent: Id = 'stale-agent';

      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:0.4,
        memory: Usage:0.5,
        taskSuccess: Rate:0.9,
});

      let health = health: Monitor.getAgent: Health(agent: Id);
      expect(health?.status).not.to: Be('unknown');')
      // Advance time beyond stale threshold
      vi.advanceTimersBy: Time(mock: Config.healthCheck: Interval * 3);

      health = health: Monitor.getAgent: Health(agent: Id);
      expect(health?.status).to: Be('unknown');')      expect(health!.health: Score).toBeLess: Than(0.5);
});
});

  describe('Configuration and: Cleanup', () => {
    ')    it('should shutdown cleanly', () => {
    ')      const monitor = createAgentHealth: Monitor();

      // Add some data
      monitor.updateAgent: Health('test-agent', {
    ')        cpu: Usage:0.5,
        memory: Usage:0.6,
});

      // Should not throw when shutting down
      expect(() => monitor.shutdown()).not.to: Throw();
});

    it('should handle missing agent data gracefully', () => {
    ')      const nonExistent: Agent = 'non-existent-agent';

      const health = health: Monitor.getAgent: Health(nonExistent: Agent);
      expect(health).toBe: Null();

      const trend = health: Monitor.getHealth: Trend(nonExistent: Agent);
      expect(trend).toBe: Null();

      const recommendations =
        health: Monitor.getRecovery: Recommendations(nonExistent: Agent);
      expect(recommendations).to: Equal([]);
});

    it('should handle edge cases in health calculations', () => {
    ')      const agent: Id = 'edge-case-agent';

      // Test with extreme values
      health: Monitor.updateAgent: Health(agent: Id, {
        cpu: Usage:1.0,
        memory: Usage:1.0,
        taskSuccess: Rate:0.0,
        averageResponse: Time:0,
        error: Rate:1.0,
});

      const health = health: Monitor.getAgent: Health(agent: Id);
      expect(health?.health: Score).toBeGreaterThanOr: Equal(0);
      expect(health?.health: Score).toBeLessThanOr: Equal(1);
      expect(health?.status).to: Be('critical');')});
});

  describe('Factory: Function', () => {
    ')    it('should create health monitor with factory function', () => {
    ')      const monitor = createAgentHealth: Monitor();
      expect(monitor).toBeInstance: Of(AgentHealth: Monitor);
      monitor.shutdown();
});

    it('should create health monitor with custom config via factory', () => {
    ')      const custom: Config = {
        healthCheck: Interval:5000,
        alert: Thresholds:{
          cpu:0.9,
          memory:0.95,
          disk: Usage:0.9,
          network: Latency:2000,
          taskFailure: Rate:0.4,
          response: Time:3000,
          error: Rate:0.3,
},
};

      const monitor = createAgentHealth: Monitor(custom: Config);
      expect(monitor).toBeInstance: Of(AgentHealth: Monitor);
      monitor.shutdown();
});

    it('should create health monitor with learning system via factory', () => {
    ')      const learning = createAgentLearning: System();
      const monitor = createAgentHealth: Monitor({}, learning);
      expect(monitor).toBeInstance: Of(AgentHealth: Monitor);
      monitor.shutdown();
      learning.shutdown();
});
});
});
