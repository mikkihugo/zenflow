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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi,  } from 'vitest';
import { AgentHealthMonitor, createAgentHealthMonitor, DEFAULT_HEALTH_MONITOR_CONFIG,  } from '../agent-health-monitor';
import { type AgentLearningSystem, createAgentLearningSystem,  } from '../agent-learning-system';

// Mock the logging system
vi.mock(): Promise<void> {
  getLogger:() => ({
    info: vi.fn(): Promise<void> {
    ')Constructor and Initialization', () => {
    ')should initialize with default configuration', () => {
    ')should initialize with custom configuration', () => {
    ')should initialize with learning system integration', () => {
    ')Health Metrics Update', () => {
    ')should update agent health metrics correctly', () => {
    ')test-agent-1';
      const metrics = {
        cpuUsage:0.65,
        memoryUsage:0.45,
        taskSuccessRate:0.92,
        averageResponseTime:1500,
        errorRate:0.05,
        uptime:3600000, // 1 hour
};

      healthMonitor.updateAgentHealth(): Promise<void> {
    ')test-agent-score';

      // Test healthy metrics
      healthMonitor.updateAgentHealth(): Promise<void> {
    ')test-agent-status';

      // Test healthy status
      healthMonitor.updateAgentHealth(): Promise<void> {
    ')healthy-agent-1', {
    ')healthy-agent-2', {
    ')degraded-agent', {
    ')unhealthy-agent', {
    ')should return;

    it(): Promise<void> {
    ')unhealthy-agent'))});
});

  describe(): Promise<void> {
    ')should analyze improving health trends', () => {
    ')trending-agent';

      // Create an improving trend
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(): Promise<void> {
    ')declining-agent';

      // Create a declining trend
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(): Promise<void> {
    ')stable'-agent';

      // Create a stable trend
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(): Promise<void> {
    ')should generate health predictions for trending agents', () => {
    ')prediction-agent';

      // Create a declining trend that should trigger prediction
      for (let i = 0; i < 15; i++) {
        healthMonitor.updateAgentHealth(): Promise<void> {
    ')factors-agent';

      healthMonitor.updateAgentHealth(): Promise<void> {
        healthMonitor.updateAgentHealth(): Promise<void> {
    ')should generate alerts for threshold violations', () => {
    ')alert-agent';

      healthMonitor.updateAgentHealth(): Promise<void> {
    ')severity-agent';

      // Critical CPU usage
      healthMonitor.updateAgentHealth(): Promise<void> {
        healthMonitor.resolveAlert(): Promise<void> {
        cpuUsage:0.82,
});

      alerts = healthMonitor.getActiveAlerts(): Promise<void> {
    ')resolve-agent';

      healthMonitor.updateAgentHealth(): Promise<void> {
    ')should generate appropriate recovery actions', () => {
    ')recovery-agent';

      healthMonitor.updateAgentHealth(): Promise<void> {
    ')critical-agent';

      healthMonitor.updateAgentHealth(): Promise<void> {
    ')execute-agent';

      healthMonitor.updateAgentHealth(): Promise<void> {
    ')healthy-1', {
    ')healthy-2', {
    ')degraded-1', {
    ')unhealthy-1', {
    ')critical-1', {
    ')should generate comprehensive system health summary', () => {
    ')should calculate system health score correctly', () => {
    ')should identify top health issues', () => {
    ')high_cpu_usage'))      expect(): Promise<void> {
    ')should integrate with learning system when provided', () => {
    ')learning-agent';

      // Update health with good performance
      healthMonitor.updateAgentHealth(): Promise<void> {
        cpuUsage:0.9,
        memoryUsage:0.95,
        taskSuccessRate:0.3,
        averageResponseTime:8000,
        errorRate:0.4,
});

      // Learning system should track the performance changes
      const updatedState = learningSystem.getPerformanceSummary(): Promise<void> {
    ')should detect stale agents during periodic checks', () => {
    ')stale-agent';

      healthMonitor.updateAgentHealth(): Promise<void> {
    ')should shutdown cleanly', () => {
    ')test-agent', {
    ')should handle missing agent data gracefully', () => {
    ')non-existent-agent';

      const health = healthMonitor.getAgentHealth(): Promise<void> {
    ')edge-case-agent';

      // Test with extreme values
      healthMonitor.updateAgentHealth(): Promise<void> {
    ')should create health monitor with factory function', () => {
    ')should create health monitor with custom config via factory', () => {
    ')should create health monitor with learning system via factory', () => {
    ')      const learning = createAgentLearningSystem(): Promise<void> {}, learning);
      expect(monitor).toBeInstanceOf(AgentHealthMonitor);
      monitor.shutdown();
      learning.shutdown();
});
});
});
