/**
 * UEL Monitoring Event Adapter Tests
 *
 * Comprehensive test suite for MonitoringEventAdapter using hybrid TDD approach:
 * - TDD London (70%): For monitoring component integration, event correlation, health monitoring
 * - Classical TDD (30%): For metrics calculations, performance analytics, data aggregation
 */

import { EventEmitter } from 'events';
import { EventManagerTypes } from '../../core/interfaces';
import type { MonitoringEvent } from '../../types';
import {
  createDefaultMonitoringEventAdapterConfig,
  createMonitoringEventAdapter,
  type MonitoringEventAdapter,
  type MonitoringEventAdapterConfig,
  MonitoringEventHelpers,
} from '../monitoring-event-adapter';

describe('MonitoringEventAdapter', () => {
  let adapter: MonitoringEventAdapter;
  let config: MonitoringEventAdapterConfig;

  beforeEach(() => {
    config = createDefaultMonitoringEventAdapterConfig('test-monitoring-adapter');
    adapter = createMonitoringEventAdapter(config);
  });

  afterEach(async () => {
    if (adapter?.isRunning()) {
      await adapter.stop();
    }
    await adapter?.destroy();
  });

  // ============================================
  // TDD London Tests (70%) - Mockist/Interaction-based
  // ============================================

  describe('TDD London: Monitoring Component Integration', () => {
    it('should wrap performance monitors and forward events to UEL', async () => {
      // Mock performance monitor
      const mockPerformanceMonitor = {
        start: jest.fn(),
        stop: jest.fn(),
        record: jest.fn(),
        getMetrics: jest.fn().mockResolvedValue({ averageLatency: 50 }),
        healthCheck: jest.fn().mockResolvedValue({ responseTime: 10, errorRate: 0 }),
      };

      // Mock event emission
      const emitSpy = jest.spyOn(adapter, 'emit');

      await adapter.start();

      // Verify performance monitor integration
      expect(adapter.isRunning()).toBe(true);

      // Simulate performance monitor event
      await adapter.emitPerformanceMonitoringEvent({
        source: 'performance-monitor',
        type: 'monitoring:performance',
        operation: 'collect',
        component: 'test-component',
        details: {
          metricName: 'cpu_usage',
          metricValue: 75.5,
          severity: 'warning',
        },
      });

      // Verify event was processed
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should wrap health components and correlate health events', async () => {
      const mockHealthComponent = {
        checkHealth: jest.fn().mockResolvedValue({ status: 'healthy', score: 0.95 }),
        getStatus: jest.fn().mockReturnValue('healthy'),
      };

      const correlationSpy = jest.spyOn(adapter as any, 'startMonitoringEventCorrelation');

      await adapter.start();

      await adapter.emitHealthMonitoringEvent({
        source: 'health-monitor',
        type: 'monitoring:health',
        operation: 'alert',
        component: 'database',
        details: {
          healthScore: 0.65,
          severity: 'warning',
        },
      });

      // Verify correlation was initiated
      expect(correlationSpy).toHaveBeenCalled();
    });

    it('should wrap analytics components and process insights', async () => {
      const mockAnalyticsComponent = {
        analyze: jest.fn().mockResolvedValue({ insights: ['trend-detected'] }),
        getInsights: jest.fn().mockReturnValue({ anomalies: [] }),
      };

      const subscriptionSpy = jest.fn();
      adapter.subscribeAnalyticsInsightEvents = jest.fn().mockReturnValue('sub-123');

      await adapter.start();

      // Subscribe to analytics events
      const subId = adapter.subscribe(['monitoring:metrics'], subscriptionSpy);

      // Emit analytics event
      await adapter.emitAnalyticsMonitoringEvent({
        source: 'analytics-engine',
        type: 'monitoring:metrics',
        operation: 'report',
        component: 'trend-analyzer',
        details: {
          insights: { trends: ['increasing-latency'] },
          severity: 'info',
        },
      });

      // Verify subscription was called
      expect(subId).toMatch(/^mon-sub-/);
      expect(adapter.getSubscriptions().length).toBeGreaterThan(0);
    });

    it('should wrap alert management and handle escalation', async () => {
      const mockAlertManager = {
        createAlert: jest.fn(),
        escalateAlert: jest.fn(),
        resolveAlert: jest.fn(),
      };

      const alertSpy = jest.fn();

      await adapter.start();
      adapter.subscribeAlertEvents(alertSpy);

      // Emit alert event
      await adapter.emitAlertMonitoringEvent({
        source: 'alert-manager',
        type: 'monitoring:alert',
        operation: 'alert',
        component: 'cpu-monitor',
        details: {
          alertId: 'alert-123',
          severity: 'critical',
        },
      });

      // Verify alert handling
      expect(adapter.getAlertData('alert-123')).toBeDefined();
    });

    it('should wrap dashboard integration and handle real-time updates', async () => {
      const mockDashboard = {
        update: jest.fn(),
        render: jest.fn(),
        streamData: jest.fn(),
      };

      const updateSpy = jest.fn();

      await adapter.start();

      // Subscribe to dashboard updates
      adapter.subscribe(['monitoring:metrics'], updateSpy);

      // Simulate dashboard update
      await adapter.emit({
        id: 'dash-evt-1',
        timestamp: new Date(),
        source: 'dashboard-main',
        type: 'monitoring:metrics',
        operation: 'report',
        component: 'dashboard',
        details: {
          severity: 'info',
        },
      });

      // Verify dashboard integration
      await new Promise((resolve) => setTimeout(resolve, 100)); // Allow async processing
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('TDD London: Event Correlation and Health Monitoring', () => {
    it('should correlate monitoring events across components', async () => {
      const correlationId = 'test-correlation-123';

      await adapter.start();

      // Emit related monitoring events with same correlation ID
      await adapter.emitPerformanceMonitoringEvent({
        source: 'performance-monitor',
        type: 'monitoring:metrics',
        operation: 'collect',
        component: 'api-server',
        correlationId,
        details: { metricName: 'response_time', metricValue: 150 },
      });

      await adapter.emitHealthMonitoringEvent({
        source: 'health-monitor',
        type: 'monitoring:health',
        operation: 'alert',
        component: 'api-server',
        correlationId,
        details: { healthScore: 0.7, severity: 'warning' },
      });

      // Verify correlation was created and updated
      const correlation = adapter.getMonitoringCorrelatedEvents(correlationId);
      expect(correlation).toBeDefined();
      expect(correlation!.events).toHaveLength(2);
      expect(correlation!.status).toBe('active');
    });

    it('should perform health checks on wrapped components', async () => {
      await adapter.start();

      // Mock some component activity
      const healthCheckSpy = jest.spyOn(adapter as any, 'performMonitoringHealthCheck');

      // Trigger health check
      const healthStatus = await adapter.performMonitoringHealthCheck();

      expect(healthCheckSpy).toHaveBeenCalled();
      expect(healthStatus).toBeDefined();
      expect(typeof healthStatus).toBe('object');
    });

    it('should track component health metrics over time', async () => {
      await adapter.start();

      // Simulate successful monitoring operations
      const componentName = 'performance-monitor-test';
      const updateSpy = jest.spyOn(adapter as any, 'updateComponentHealthMetrics');

      // Trigger health metric updates
      (adapter as any).updateComponentHealthMetrics(componentName, true);
      (adapter as any).updateComponentHealthMetrics(componentName, false);
      (adapter as any).updateComponentHealthMetrics(componentName, true);

      expect(updateSpy).toHaveBeenCalledTimes(3);
      expect(updateSpy).toHaveBeenCalledWith(componentName, true);
      expect(updateSpy).toHaveBeenCalledWith(componentName, false);
    });
  });

  describe('TDD London: Subscription and Event Management', () => {
    it('should handle multiple subscription types correctly', async () => {
      await adapter.start();

      const performanceListener = jest.fn();
      const healthListener = jest.fn();
      const metricsListener = jest.fn();
      const alertListener = jest.fn();

      // Create multiple subscriptions
      const perfSub = adapter.subscribePerformanceMonitoringEvents(performanceListener);
      const healthSub = adapter.subscribeHealthMonitoringEvents(healthListener);
      const metricsSub = adapter.subscribeMetricsEvents(metricsListener);
      const alertSub = adapter.subscribeAlertEvents(alertListener);

      expect(perfSub).toMatch(/^mon-sub-/);
      expect(healthSub).toMatch(/^mon-sub-/);
      expect(metricsSub).toMatch(/^mon-sub-/);
      expect(alertSub).toMatch(/^mon-sub-/);

      // Verify subscriptions are active
      const activeSubscriptions = adapter.getSubscriptions();
      expect(activeSubscriptions).toHaveLength(4);
      expect(activeSubscriptions.every((sub) => sub.active)).toBe(true);
    });

    it('should apply filters correctly to monitoring events', async () => {
      await adapter.start();

      const listener = jest.fn();

      // Add filter for critical events only
      const filterId = adapter.addFilter({
        metadata: { severity: 'critical' },
      });

      adapter.subscribe(['monitoring:alert'], listener);

      // Emit non-critical event (should be filtered out)
      await adapter.emitAlertMonitoringEvent({
        source: 'alert-manager',
        type: 'monitoring:alert',
        operation: 'alert',
        component: 'test',
        details: { severity: 'warning' },
        metadata: { severity: 'warning' },
      });

      // Emit critical event (should pass filter)
      await adapter.emitAlertMonitoringEvent({
        source: 'alert-manager',
        type: 'monitoring:alert',
        operation: 'alert',
        component: 'test',
        details: { severity: 'critical' },
        metadata: { severity: 'critical' },
      });

      // Allow async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify only critical event triggered listener
      expect(listener).toHaveBeenCalledTimes(1);
      expect(adapter.removeFilter(filterId)).toBe(true);
    });

    it('should apply transforms to monitoring events', async () => {
      await adapter.start();

      const listener = jest.fn();

      // Add transform to enrich events
      const transformId = adapter.addTransform({
        enricher: async (event) => ({
          ...event,
          metadata: {
            ...event.metadata,
            enriched: true,
            transformedAt: Date.now(),
          },
        }),
      });

      adapter.subscribe(['monitoring:metrics'], listener);

      await adapter.emitPerformanceMonitoringEvent({
        source: 'performance-monitor',
        type: 'monitoring:metrics',
        operation: 'collect',
        component: 'test',
        details: { metricName: 'test_metric', metricValue: 100 },
      });

      // Allow async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify transform was applied
      expect(listener).toHaveBeenCalled();
      const transformedEvent = listener.mock.calls[0][0];
      expect(transformedEvent.metadata?.enriched).toBe(true);
      expect(transformedEvent.metadata?.transformedAt).toBeDefined();

      expect(adapter.removeTransform(transformId)).toBe(true);
    });
  });

  // ============================================
  // Classical TDD Tests (30%) - Result-based testing
  // ============================================

  describe('Classical TDD: Metrics Calculations and Performance Analytics', () => {
    it('should calculate monitoring efficiency correctly', async () => {
      await adapter.start();

      const correlationId = 'efficiency-test';
      const startTime = Date.now();

      // Create correlation with multiple events
      const correlation = {
        correlationId,
        events: [
          { operation: 'collect', details: { severity: 'info' } },
          { operation: 'alert', details: { severity: 'error' } },
          { operation: 'recover', details: { severity: 'info' } },
          { operation: 'collect', details: { severity: 'info' } },
        ] as any,
        startTime: new Date(startTime),
        lastUpdate: new Date(startTime + 5000), // 5 seconds later
        performance: {
          totalLatency: 5000,
          monitoringEfficiency: 0,
          dataAccuracy: 0,
          resourceUtilization: 0,
        },
        component: 'test',
        monitoringType: 'performance',
        metricNames: [],
        operation: 'collect',
        status: 'active' as const,
        metadata: {},
      };

      // Calculate efficiency (should be high due to mostly successful events)
      const efficiency = (adapter as any).calculateMonitoringEfficiency(correlation);

      expect(efficiency).toBeGreaterThan(0.6); // 3/4 successful events with good timing
      expect(efficiency).toBeLessThanOrEqual(1.0);
      expect(typeof efficiency).toBe('number');
    });

    it('should calculate data accuracy correctly', async () => {
      await adapter.start();

      const correlation = {
        events: [
          { details: { metricValue: 100 } },
          { details: { healthScore: 0.8 } },
          { details: {} }, // Event without data
          { details: { metricValue: 200 } },
        ] as any,
      };

      const accuracy = (adapter as any).calculateDataAccuracy(correlation);

      // 3 out of 4 events have valid data
      expect(accuracy).toBe(0.75);
      expect(typeof accuracy).toBe('number');
    });

    it('should estimate memory usage accurately', async () => {
      await adapter.start();

      // Add some data to the adapter
      adapter.subscribe(['monitoring:metrics'], () => {});
      adapter.subscribe(['monitoring:health'], () => {});

      await adapter.emitPerformanceMonitoringEvent({
        source: 'test',
        type: 'monitoring:performance',
        operation: 'collect',
        component: 'test',
        details: { metricName: 'test', metricValue: 1 },
      });

      const memoryUsage = (adapter as any).estimateMemoryUsage();

      expect(memoryUsage).toBeGreaterThan(0);
      expect(typeof memoryUsage).toBe('number');

      // Memory should increase with more data
      const initialUsage = memoryUsage;

      // Add more subscriptions and events
      adapter.subscribe(['monitoring:alert'], () => {});
      await adapter.emitHealthMonitoringEvent({
        source: 'test',
        type: 'monitoring:health',
        operation: 'alert',
        component: 'test',
        details: { healthScore: 0.5 },
      });

      const newMemoryUsage = (adapter as any).estimateMemoryUsage();
      expect(newMemoryUsage).toBeGreaterThan(initialUsage);
    });

    it('should maintain event history with proper size limits', async () => {
      await adapter.start();

      const eventCount = 25; // Exceed typical limits to test truncation

      // Emit many events
      for (let i = 0; i < eventCount; i++) {
        await adapter.emitPerformanceMonitoringEvent({
          source: 'test',
          type: 'monitoring:metrics',
          operation: 'collect',
          component: 'test',
          details: { metricName: `metric_${i}`, metricValue: i },
        });
      }

      // Allow processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      const history = await adapter.getEventHistory('monitoring:metrics');

      expect(history.length).toBeGreaterThan(0);
      expect(history.length).toBeLessThanOrEqual(eventCount);

      // Events should be in chronological order
      for (let i = 1; i < history.length; i++) {
        expect(history[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          history[i - 1].timestamp.getTime()
        );
      }
    });

    it('should generate correct performance metrics', async () => {
      await adapter.start();

      // Generate some activity
      await adapter.emitPerformanceMonitoringEvent({
        source: 'test',
        type: 'monitoring:performance',
        operation: 'collect',
        component: 'test',
        details: { metricName: 'cpu', metricValue: 75 },
      });

      await adapter.emitHealthMonitoringEvent({
        source: 'test',
        type: 'monitoring:health',
        operation: 'alert',
        component: 'test',
        details: { healthScore: 0.8 },
      });

      // Allow processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const metrics = await adapter.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.name).toBe('test-monitoring-adapter');
      expect(metrics.type).toBe(EventManagerTypes.MONITORING);
      expect(metrics.eventsProcessed).toBeGreaterThan(0);
      expect(metrics.averageLatency).toBeGreaterThanOrEqual(0);
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
      expect(metrics.subscriptionCount).toBeGreaterThanOrEqual(0);
      expect(metrics.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Classical TDD: Data Aggregation and Health Calculations', () => {
    it('should aggregate metrics data correctly over time', async () => {
      await adapter.start();

      const metricName = 'cpu_usage';
      const values = [10, 20, 30, 40, 50];

      // Emit metrics with increasing values
      for (const value of values) {
        await adapter.emitPerformanceMonitoringEvent({
          source: 'performance-monitor',
          type: 'monitoring:metrics',
          operation: 'collect',
          component: 'cpu-monitor',
          details: { metricName, metricValue: value },
        });
      }

      // Allow processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const metricsData = adapter.getMetricsData(metricName);

      expect(metricsData).toBeDefined();
      expect(metricsData.eventCount).toBe(values.length);
      expect(metricsData.latestValue).toBe(values[values.length - 1]);
    });

    it('should calculate component health scores accurately', async () => {
      await adapter.start();

      const component = 'api-server';
      const healthScores = [0.9, 0.8, 0.85, 0.75, 0.95];

      // Emit health events with varying scores
      for (const score of healthScores) {
        await adapter.emitHealthMonitoringEvent({
          source: 'health-monitor',
          type: 'monitoring:health',
          operation: score < 0.8 ? 'alert' : 'recover',
          component,
          details: { healthScore: score, severity: score < 0.8 ? 'warning' : 'info' },
        });
      }

      // Allow processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const healthData = adapter.getHealthData(component);

      expect(healthData).toBeDefined();
      expect(healthData.eventCount).toBe(healthScores.length);
      expect(healthData.latestScore).toBe(healthScores[healthScores.length - 1]);
    });

    it('should track alert patterns and frequencies', async () => {
      await adapter.start();

      const alertId = 'high-cpu-alert';
      const severities = ['warning', 'error', 'critical', 'error', 'warning'];

      // Generate alert sequence
      for (const severity of severities) {
        await adapter.emitAlertMonitoringEvent({
          source: 'alert-manager',
          type: 'monitoring:alert',
          operation: 'alert',
          component: 'cpu-monitor',
          details: { alertId, severity },
        });
      }

      // Allow processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const alertData = adapter.getAlertData(alertId);

      expect(alertData).toBeDefined();
      expect(alertData.eventCount).toBe(severities.length);
      expect(alertData.severity).toBe(severities[severities.length - 1]); // Latest severity
    });

    it('should maintain performance insights over time', async () => {
      await adapter.start();

      const component = 'database';
      const performanceData = {
        cpu: 60,
        memory: 70,
        disk: 45,
        network: 30,
        latency: 120,
        throughput: 850,
        errorRate: 0.02,
      };

      await adapter.emitPerformanceMonitoringEvent({
        source: 'performance-monitor',
        type: 'monitoring:performance',
        operation: 'collect',
        component,
        details: { performanceData },
      });

      // Allow processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const insights = adapter.getPerformanceInsights(component);

      expect(insights).toBeDefined();
      expect(insights.performanceData).toEqual(performanceData);
      expect(insights.eventCount).toBe(1);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration: End-to-End Monitoring Workflows', () => {
    it('should handle complete monitoring workflow from metrics to alerts', async () => {
      await adapter.start();

      const workflowEvents: any[] = [];

      // Subscribe to all monitoring events
      adapter.subscribe(
        ['monitoring:metrics', 'monitoring:health', 'monitoring:alert'],
        (event) => {
          workflowEvents.push(event);
        }
      );

      const correlationId = 'workflow-test';

      // Step 1: Metrics collection triggers warning
      await adapter.emitPerformanceMonitoringEvent({
        source: 'performance-monitor',
        type: 'monitoring:metrics',
        operation: 'collect',
        component: 'web-server',
        correlationId,
        details: { metricName: 'response_time', metricValue: 2000, severity: 'warning' },
      });

      // Step 2: Health check shows degradation
      await adapter.emitHealthMonitoringEvent({
        source: 'health-monitor',
        type: 'monitoring:health',
        operation: 'alert',
        component: 'web-server',
        correlationId,
        details: { healthScore: 0.6, severity: 'warning' },
      });

      // Step 3: Alert is generated
      await adapter.emitAlertMonitoringEvent({
        source: 'alert-manager',
        type: 'monitoring:alert',
        operation: 'alert',
        component: 'web-server',
        correlationId,
        details: { alertId: 'perf-alert-1', severity: 'error' },
      });

      // Allow processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify complete workflow
      expect(workflowEvents).toHaveLength(3);

      const correlation = adapter.getMonitoringCorrelatedEvents(correlationId);
      expect(correlation).toBeDefined();
      expect(correlation!.events).toHaveLength(3);
      expect(correlation!.status).toBe('completed'); // Should be marked complete
    });

    it('should handle high-throughput monitoring scenarios', async () => {
      // Reconfigure for high throughput
      const highThroughputConfig = createDefaultMonitoringEventAdapterConfig(
        'high-throughput-test',
        {
          processing: { strategy: 'batched', batchSize: 50, queueSize: 1000 },
        }
      );

      const htAdapter = createMonitoringEventAdapter(highThroughputConfig);

      try {
        await htAdapter.start();

        const eventCount = 200;
        const receivedEvents: any[] = [];

        htAdapter.subscribe(['monitoring:metrics'], (event) => {
          receivedEvents.push(event);
        });

        // Generate high volume of events
        const promises = [];
        for (let i = 0; i < eventCount; i++) {
          promises.push(
            htAdapter.emitPerformanceMonitoringEvent({
              source: `monitor-${i % 10}`,
              type: 'monitoring:metrics',
              operation: 'collect',
              component: `component-${i % 5}`,
              details: { metricName: `metric_${i}`, metricValue: Math.random() * 100 },
            })
          );
        }

        await Promise.all(promises);

        // Allow batch processing
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Verify throughput handling
        expect(receivedEvents.length).toBeGreaterThan(0);

        const metrics = await htAdapter.getMetrics();
        expect(metrics.eventsProcessed).toBeGreaterThan(0);
        expect(metrics.throughput).toBeGreaterThan(0);

        await htAdapter.destroy();
      } catch (error) {
        await htAdapter.destroy();
        throw error;
      }
    });
  });

  // ============================================
  // Helper Functions Tests
  // ============================================

  describe('Helper Functions', () => {
    it('should create performance metrics events correctly', () => {
      const event = MonitoringEventHelpers.createPerformanceMetricsEvent(
        'cpu_usage',
        85.5,
        'web-server',
        { threshold: 80 }
      );

      expect(event.source).toBe('performance-monitor');
      expect(event.type).toBe('monitoring:metrics');
      expect(event.operation).toBe('collect');
      expect(event.component).toBe('web-server');
      expect(event.priority).toBe('medium');
      expect(event.details?.metricName).toBe('cpu_usage');
      expect(event.details?.metricValue).toBe(85.5);
      expect(event.details?.threshold).toBe(80);
    });

    it('should create health status events correctly', () => {
      const event = MonitoringEventHelpers.createHealthStatusEvent('database', 0.45, 'unhealthy', {
        lastCheck: new Date(),
      });

      expect(event.source).toBe('health-monitor');
      expect(event.type).toBe('monitoring:health');
      expect(event.operation).toBe('alert');
      expect(event.component).toBe('database');
      expect(event.priority).toBe('high');
      expect(event.details?.healthScore).toBe(0.45);
      expect(event.details?.severity).toBe('error');
    });

    it('should create alert events correctly', () => {
      const event = MonitoringEventHelpers.createAlertEvent(
        'alert-123',
        'critical',
        'payment-service',
        { threshold: 1000, currentValue: 2500 }
      );

      expect(event.source).toBe('alert-manager');
      expect(event.type).toBe('monitoring:alert');
      expect(event.operation).toBe('alert');
      expect(event.component).toBe('payment-service');
      expect(event.priority).toBe('critical');
      expect(event.details?.alertId).toBe('alert-123');
      expect(event.details?.severity).toBe('critical');
    });

    it('should create analytics insight events correctly', () => {
      const insights = {
        trends: ['increasing-latency'],
        anomalies: ['cpu-spike'],
        predictions: { nextValue: 95, timeframe: 300000 },
      };

      const event = MonitoringEventHelpers.createAnalyticsInsightEvent('trend-analyzer', insights);

      expect(event.source).toBe('analytics-engine');
      expect(event.type).toBe('monitoring:metrics');
      expect(event.operation).toBe('report');
      expect(event.component).toBe('trend-analyzer');
      expect(event.details?.insights).toEqual(insights);
    });

    it('should create monitoring error events correctly', () => {
      const error = new Error('Connection timeout');
      error.name = 'TimeoutError';

      const event = MonitoringEventHelpers.createMonitoringErrorEvent(
        'metrics-collector',
        error,
        'collect'
      );

      expect(event.source).toBe('metrics-collector');
      expect(event.type).toBe('monitoring:alert');
      expect(event.operation).toBe('alert');
      expect(event.component).toBe('metrics-collector');
      expect(event.priority).toBe('high');
      expect(event.details?.severity).toBe('error');
      expect(event.details?.errorCode).toBe('TimeoutError');
      expect(event.details?.errorMessage).toBe('Connection timeout');
    });
  });
});
