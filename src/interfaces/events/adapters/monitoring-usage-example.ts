/**
 * UEL Monitoring Event Adapter Usage Example
 *
 * This example demonstrates how to use the MonitoringEventAdapter to create
 * a unified interface for monitoring-related events across Claude-Zen,
 * following the same patterns established by the system, coordination, and communication examples.
 */

import type { MonitoringEvent } from '../types';
import {
  createDefaultMonitoringEventAdapterConfig,
  createMonitoringEventAdapter,
  MonitoringEventAdapter,
  MonitoringEventAdapterConfig,
  MonitoringEventAdapterFactory,
  MonitoringEventConfigs,
  MonitoringEventFactory,
  MonitoringEventHelpers,
} from './monitoring-event-adapter';
import { MonitoringEventManager, MonitoringEventRegistry } from './monitoring-event-factory';

/**
 * Example 1: Basic Monitoring Event Adapter Setup
 */
async function basicMonitoringExample(): Promise<void> {
  console.log('🔍 Basic Monitoring Event Adapter Example');

  // Create monitoring event adapter with default configuration
  const config = createDefaultMonitoringEventAdapterConfig('basic-monitoring-adapter');
  const adapter = createMonitoringEventAdapter(config);

  try {
    // Start the adapter
    await adapter.start();
    console.log('✅ Monitoring event adapter started');

    // Subscribe to different types of monitoring events
    const metricsSubscription = adapter.subscribeMetricsEvents((event) => {
      console.log(
        `📊 Metrics Event: ${event.component} - ${event.details?.metricName}=${event.details?.metricValue}`
      );
    });

    const healthSubscription = adapter.subscribeHealthMonitoringEvents((event) => {
      console.log(
        `❤️ Health Event: ${event.component} - Health Score: ${event.details?.healthScore}`
      );
    });

    const alertSubscription = adapter.subscribeAlertEvents((event) => {
      console.log(
        `🚨 Alert Event: ${event.component} - ${event.details?.severity}: ${event.details?.alertId}`
      );
    });

    // Emit various monitoring events
    await adapter.emitPerformanceMonitoringEvent({
      source: 'cpu-monitor',
      type: 'monitoring:metrics',
      operation: 'collect',
      component: 'web-server',
      details: {
        metricName: 'cpu_usage',
        metricValue: 78.5,
        severity: 'warning',
      },
    });

    await adapter.emitHealthMonitoringEvent({
      source: 'health-checker',
      type: 'monitoring:health',
      operation: 'alert',
      component: 'database',
      details: {
        healthScore: 0.65,
        severity: 'warning',
      },
    });

    await adapter.emitAlertMonitoringEvent({
      source: 'alert-manager',
      type: 'monitoring:alert',
      operation: 'alert',
      component: 'payment-service',
      details: {
        alertId: 'payment-latency-alert',
        severity: 'error',
      },
    });

    // Allow time for processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check adapter health and metrics
    const healthStatus = await adapter.healthCheck();
    const metrics = await adapter.getMetrics();

    console.log(`📋 Adapter Health: ${healthStatus.status}`);
    console.log(`📈 Events Processed: ${metrics.eventsProcessed}`);
    console.log(`⚡ Average Latency: ${metrics.averageLatency.toFixed(2)}ms`);

    // Clean up subscriptions
    adapter.unsubscribe(metricsSubscription);
    adapter.unsubscribe(healthSubscription);
    adapter.unsubscribe(alertSubscription);
  } finally {
    await adapter.destroy();
    console.log('🛑 Monitoring event adapter destroyed\n');
  }
}

/**
 * Example 2: Performance-Focused Monitoring Adapter
 */
async function performanceFocusedExample(): Promise<void> {
  console.log('🚀 Performance-Focused Monitoring Example');

  // Create performance-focused monitoring adapter
  const adapter = MonitoringEventAdapterFactory.createPerformanceMonitor('performance-monitor', {
    metricsOptimization: {
      optimizationInterval: 30000, // 30 seconds
      performanceThresholds: {
        latency: 50,
        throughput: 2000,
        accuracy: 0.99,
        resourceUsage: 0.7,
      },
    },
  });

  try {
    await adapter.start();

    // Subscribe to performance events
    adapter.subscribePerformanceMonitoringEvents((event) => {
      if (event.details?.performanceData) {
        const perf = event.details.performanceData;
        console.log(
          `⚡ Performance: CPU=${perf.cpu}%, Memory=${perf.memory}%, Latency=${perf.latency}ms`
        );
      }
    });

    // Simulate performance monitoring data
    const performanceData = {
      cpu: 65,
      memory: 72,
      disk: 45,
      network: 28,
      latency: 85,
      throughput: 1250,
      errorRate: 0.02,
    };

    await adapter.emitPerformanceMonitoringEvent({
      source: 'performance-collector',
      type: 'monitoring:performance',
      operation: 'collect',
      component: 'api-gateway',
      details: {
        performanceData,
        metricName: 'system_performance',
        severity: 'info',
      },
    });

    // Get performance insights
    await new Promise((resolve) => setTimeout(resolve, 500));
    const insights = adapter.getPerformanceInsights('api-gateway');
    console.log('📊 Performance Insights:', insights);
  } finally {
    await adapter.destroy();
    console.log('🛑 Performance monitoring adapter destroyed\n');
  }
}

/**
 * Example 3: Health-Focused Monitoring with Correlation
 */
async function healthFocusedWithCorrelationExample(): Promise<void> {
  console.log('❤️ Health-Focused Monitoring with Correlation Example');

  // Create health-focused monitoring adapter
  const adapter = MonitoringEventAdapterFactory.createHealthMonitor('health-monitor', {
    monitoring: {
      correlationTTL: 300000, // 5 minutes
      correlationPatterns: [
        'monitoring:health->monitoring:alert',
        'monitoring:metrics->monitoring:health',
      ],
    },
  });

  try {
    await adapter.start();

    // Subscribe to correlated health events
    adapter.subscribe(['monitoring:health', 'monitoring:alert'], (event) => {
      console.log(
        `🔗 Correlated Event [${event.correlationId}]: ${event.type} - ${event.component}`
      );
    });

    const correlationId = 'health-correlation-example';

    // Emit correlated health monitoring sequence
    await adapter.emitPerformanceMonitoringEvent({
      source: 'metrics-collector',
      type: 'monitoring:metrics',
      operation: 'collect',
      component: 'user-service',
      correlationId,
      details: {
        metricName: 'response_time',
        metricValue: 1500, // High response time
        severity: 'warning',
      },
    });

    await adapter.emitHealthMonitoringEvent({
      source: 'health-checker',
      type: 'monitoring:health',
      operation: 'alert',
      component: 'user-service',
      correlationId,
      details: {
        healthScore: 0.6, // Poor health
        severity: 'warning',
      },
    });

    await adapter.emitAlertMonitoringEvent({
      source: 'alert-manager',
      type: 'monitoring:alert',
      operation: 'alert',
      component: 'user-service',
      correlationId,
      details: {
        alertId: 'user-service-degraded',
        severity: 'error',
      },
    });

    // Allow correlation processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check correlation results
    const correlation = adapter.getMonitoringCorrelatedEvents(correlationId);
    if (correlation) {
      console.log(
        `🎯 Correlation Complete: ${correlation.events.length} events, Status: ${correlation.status}`
      );
      console.log(
        `📈 Monitoring Efficiency: ${(correlation.performance.monitoringEfficiency * 100).toFixed(1)}%`
      );
    }

    // Get overall health status
    const healthStatus = await adapter.getMonitoringHealthStatus();
    console.log(
      '🏥 Component Health Status:',
      Object.keys(healthStatus).length,
      'components monitored'
    );
  } finally {
    await adapter.destroy();
    console.log('🛑 Health monitoring adapter destroyed\n');
  }
}

/**
 * Example 4: Analytics-Focused Monitoring with Insights
 */
async function analyticsFocusedExample(): Promise<void> {
  console.log('🧠 Analytics-Focused Monitoring Example');

  // Create analytics-focused monitoring adapter
  const adapter = MonitoringEventAdapterFactory.createAnalyticsMonitor('analytics-monitor', {
    metricsOptimization: {
      dataAggregation: true,
      intelligentSampling: true,
      anomalyDetection: true,
    },
  });

  try {
    await adapter.start();

    // Subscribe to analytics insights
    adapter.subscribe(['monitoring:metrics'], (event) => {
      if (event.details?.insights) {
        console.log(`🔍 Analytics Insight: ${event.component}`, event.details.insights);
      }
    });

    // Emit analytics insights
    await adapter.emitAnalyticsMonitoringEvent({
      source: 'trend-analyzer',
      type: 'monitoring:metrics',
      operation: 'report',
      component: 'payment-system',
      details: {
        insights: {
          trends: ['increasing-transaction-volume', 'decreasing-latency'],
          anomalies: ['unusual-error-spike-at-3am'],
          predictions: {
            nextHourVolume: 2500,
            expectedLatency: 125,
            confidenceLevel: 0.87,
          },
        },
        severity: 'info',
      },
    });

    // Emit anomaly detection result
    await adapter.emitAnalyticsMonitoringEvent({
      source: 'anomaly-detector',
      type: 'monitoring:alert',
      operation: 'anomaly',
      component: 'fraud-detection',
      details: {
        insights: {
          anomalyType: 'statistical-outlier',
          confidence: 0.94,
          severity: 'high',
          affectedMetrics: ['transaction-velocity', 'geographic-dispersion'],
        },
        severity: 'warning',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get analytics insights
    const insights = adapter.getPerformanceInsights();
    console.log(`📊 Analytics Components: ${Object.keys(insights).length} components analyzed`);
  } finally {
    await adapter.destroy();
    console.log('🛑 Analytics monitoring adapter destroyed\n');
  }
}

/**
 * Example 5: Alert Management with Escalation
 */
async function alertManagementExample(): Promise<void> {
  console.log('🚨 Alert Management with Escalation Example');

  // Create alert-focused monitoring adapter
  const adapter = MonitoringEventAdapterFactory.createAlertMonitor('alert-monitor', {
    alertManagement: {
      alertLevels: ['info', 'warning', 'error', 'critical'],
    },
  });

  try {
    await adapter.start();

    // Subscribe to alert escalation events
    adapter.subscribeAlertEvents((event) => {
      const alertId = event.details?.alertId;
      const severity = event.details?.severity;
      console.log(`⚠️ Alert ${event.operation}: ${alertId} [${severity?.toUpperCase()}]`);
    });

    const alertId = 'disk-space-alert';

    // Simulate alert escalation sequence
    await adapter.emitAlertMonitoringEvent({
      source: 'disk-monitor',
      type: 'monitoring:alert',
      operation: 'alert',
      component: 'storage-server',
      details: {
        alertId,
        severity: 'warning',
        threshold: 85,
        currentValue: 87,
      },
    });

    // Escalate to error
    await adapter.emitAlertMonitoringEvent({
      source: 'alert-manager',
      type: 'monitoring:alert',
      operation: 'alert',
      component: 'storage-server',
      details: {
        alertId,
        severity: 'error',
        threshold: 85,
        currentValue: 92,
      },
    });

    // Escalate to critical
    await adapter.emitAlertMonitoringEvent({
      source: 'alert-manager',
      type: 'monitoring:alert',
      operation: 'alert',
      component: 'storage-server',
      details: {
        alertId,
        severity: 'critical',
        threshold: 85,
        currentValue: 97,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check alert data
    const alertData = adapter.getAlertData(alertId);
    console.log(`📋 Alert Data: ${alertData.eventCount} events, Latest: ${alertData.severity}`);
  } finally {
    await adapter.destroy();
    console.log('🛑 Alert monitoring adapter destroyed\n');
  }
}

/**
 * Example 6: Comprehensive Monitoring with Registry Management
 */
async function comprehensiveMonitoringExample(): Promise<void> {
  console.log('🎯 Comprehensive Monitoring with Registry Example');

  // Create comprehensive monitoring adapter
  const adapter = MonitoringEventAdapterFactory.createComprehensiveMonitor('comprehensive-monitor');

  try {
    // Register with monitoring registry for lifecycle management
    await MonitoringEventRegistry.register('main-monitor', adapter, {
      onStart: async (adapter) => {
        console.log('🟢 Registry: Monitoring adapter started');
      },
      onStop: async (adapter) => {
        console.log('🔴 Registry: Monitoring adapter stopped');
      },
      onError: async (adapter, error) => {
        console.log('❌ Registry: Monitoring adapter error:', error.message);
      },
    });

    await adapter.start();

    // Subscribe to all monitoring event types
    const allEventsSubscription = adapter.subscribe(
      ['monitoring:metrics', 'monitoring:health', 'monitoring:alert', 'monitoring:performance'],
      (event) => {
        console.log(`🔄 ${event.type}: ${event.component} [${event.operation}]`);
      }
    );

    // Emit comprehensive monitoring scenario
    const scenarioId = 'comprehensive-scenario';

    // Performance metrics
    await adapter.emitPerformanceMonitoringEvent({
      source: 'system-monitor',
      type: 'monitoring:performance',
      operation: 'collect',
      component: 'web-cluster',
      correlationId: scenarioId,
      details: {
        performanceData: { cpu: 85, memory: 78, latency: 150, throughput: 1200, errorRate: 0.05 },
      },
    });

    // Health degradation
    await adapter.emitHealthMonitoringEvent({
      source: 'health-monitor',
      type: 'monitoring:health',
      operation: 'alert',
      component: 'web-cluster',
      correlationId: scenarioId,
      details: { healthScore: 0.7, severity: 'warning' },
    });

    // Metrics collection
    await adapter.emitPerformanceMonitoringEvent({
      source: 'metrics-collector',
      type: 'monitoring:metrics',
      operation: 'collect',
      component: 'web-cluster',
      correlationId: scenarioId,
      details: { metricName: 'request_rate', metricValue: 3500 },
    });

    // Alert generation
    await adapter.emitAlertMonitoringEvent({
      source: 'alert-manager',
      type: 'monitoring:alert',
      operation: 'alert',
      component: 'web-cluster',
      correlationId: scenarioId,
      details: { alertId: 'cluster-performance-alert', severity: 'error' },
    });

    // Analytics insights
    await adapter.emitAnalyticsMonitoringEvent({
      source: 'analytics-engine',
      type: 'monitoring:metrics',
      operation: 'report',
      component: 'web-cluster',
      correlationId: scenarioId,
      details: {
        insights: {
          diagnosis: 'High CPU usage causing increased response times',
          recommendations: ['Scale horizontally', 'Optimize queries', 'Enable caching'],
        },
      },
    });

    // Allow comprehensive processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get comprehensive status
    const healthStatus = await MonitoringEventRegistry.getHealthStatus();
    const metrics = await MonitoringEventRegistry.getMetrics();

    console.log('📊 Registry Health Status:', Object.keys(healthStatus).length, 'adapters');
    console.log('📈 Registry Metrics:', Object.keys(metrics).length, 'adapters reporting');

    // Check correlation completion
    const correlation = adapter.getMonitoringCorrelatedEvents(scenarioId);
    if (correlation) {
      console.log(
        `🎯 Scenario Correlation: ${correlation.events.length} events, ${correlation.status}`
      );
    }

    adapter.unsubscribe(allEventsSubscription);
  } finally {
    await MonitoringEventRegistry.unregister('main-monitor');
    console.log('🛑 Comprehensive monitoring adapter unregistered\n');
  }
}

/**
 * Example 7: Helper Functions Demonstration
 */
async function helperFunctionsExample(): Promise<void> {
  console.log('🛠️ Helper Functions Example');

  const adapter = createMonitoringEventAdapter(
    createDefaultMonitoringEventAdapterConfig('helper-example')
  );

  try {
    await adapter.start();

    // Subscribe to see helper-generated events
    adapter.subscribe(['monitoring:metrics', 'monitoring:health', 'monitoring:alert'], (event) => {
      console.log(`🔧 Helper Event: ${event.type} - ${event.component}`);
    });

    // Use helper functions to create events
    const performanceEvent = MonitoringEventHelpers.createPerformanceMetricsEvent(
      'memory_usage',
      89.5,
      'cache-server',
      { threshold: 85, unit: 'percentage' }
    );

    const healthEvent = MonitoringEventHelpers.createHealthStatusEvent(
      'load-balancer',
      0.92,
      'healthy',
      { uptime: 99.98, lastCheck: new Date() }
    );

    const alertEvent = MonitoringEventHelpers.createAlertEvent(
      'lb-health-check',
      'info',
      'load-balancer',
      { message: 'Health check passed', responseTime: 45 }
    );

    const insightEvent = MonitoringEventHelpers.createAnalyticsInsightEvent('predictive-analyzer', {
      forecast: { nextHour: { requests: 5200, avgLatency: 95 } },
      confidence: 0.91,
    });

    const errorEvent = MonitoringEventHelpers.createMonitoringErrorEvent(
      'data-collector',
      new Error('Connection timeout to metrics database'),
      'collect'
    );

    // Emit all helper-created events
    await adapter.emit({ ...performanceEvent, id: 'perf-1', timestamp: new Date() });
    await adapter.emit({ ...healthEvent, id: 'health-1', timestamp: new Date() });
    await adapter.emit({ ...alertEvent, id: 'alert-1', timestamp: new Date() });
    await adapter.emit({ ...insightEvent, id: 'insight-1', timestamp: new Date() });
    await adapter.emit({ ...errorEvent, id: 'error-1', timestamp: new Date() });

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('✅ All helper-generated events processed successfully');
  } finally {
    await adapter.destroy();
    console.log('🛑 Helper functions example completed\n');
  }
}

/**
 * Example 8: High-Throughput and Low-Latency Monitoring
 */
async function highPerformanceExample(): Promise<void> {
  console.log('⚡ High-Performance Monitoring Example');

  // Create high-throughput adapter
  const throughputAdapter =
    MonitoringEventAdapterFactory.createHighThroughputMonitor('throughput-test');

  // Create low-latency adapter
  const latencyAdapter = MonitoringEventAdapterFactory.createLowLatencyMonitor('latency-test');

  try {
    await Promise.all([throughputAdapter.start(), latencyAdapter.start()]);

    let throughputEvents = 0;
    let latencyEvents = 0;

    throughputAdapter.subscribe(['monitoring:metrics'], () => throughputEvents++);
    latencyAdapter.subscribe(['monitoring:performance'], () => latencyEvents++);

    const startTime = Date.now();

    // Test high throughput
    const throughputPromises = [];
    for (let i = 0; i < 500; i++) {
      throughputPromises.push(
        throughputAdapter.emitPerformanceMonitoringEvent({
          source: `source-${i % 10}`,
          type: 'monitoring:metrics',
          operation: 'collect',
          component: `component-${i % 5}`,
          details: { metricName: `metric_${i}`, metricValue: Math.random() * 100 },
        })
      );
    }

    // Test low latency
    const latencyPromises = [];
    for (let i = 0; i < 100; i++) {
      latencyPromises.push(
        latencyAdapter.emitPerformanceMonitoringEvent({
          source: `latency-source-${i}`,
          type: 'monitoring:performance',
          operation: 'collect',
          component: 'latency-critical',
          details: {
            performanceData: {
              latency: Math.random() * 50,
              throughput: 1000 + Math.random() * 2000,
            },
          },
        })
      );
    }

    await Promise.all([...throughputPromises, ...latencyPromises]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Allow processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`📊 High-Throughput: ${throughputEvents} events processed in ${duration}ms`);
    console.log(`⚡ Low-Latency: ${latencyEvents} events processed in ${duration}ms`);

    // Get performance metrics
    const throughputMetrics = await throughputAdapter.getMetrics();
    const latencyMetrics = await latencyAdapter.getMetrics();

    console.log(`🎯 Throughput: ${throughputMetrics.throughput.toFixed(2)} events/sec`);
    console.log(`⏱️ Latency: ${latencyMetrics.averageLatency.toFixed(2)}ms average`);
  } finally {
    await Promise.all([throughputAdapter.destroy(), latencyAdapter.destroy()]);
    console.log('🛑 High-performance monitoring examples completed\n');
  }
}

/**
 * Run all monitoring event adapter examples
 */
async function runAllExamples(): Promise<void> {
  console.log('🎬 Starting UEL Monitoring Event Adapter Examples\n');

  try {
    await basicMonitoringExample();
    await performanceFocusedExample();
    await healthFocusedWithCorrelationExample();
    await analyticsFocusedExample();
    await alertManagementExample();
    await comprehensiveMonitoringExample();
    await helperFunctionsExample();
    await highPerformanceExample();

    console.log('🎉 All monitoring event adapter examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
    throw error;
  }
}

// Export examples for individual testing
export {
  basicMonitoringExample,
  performanceFocusedExample,
  healthFocusedWithCorrelationExample,
  analyticsFocusedExample,
  alertManagementExample,
  comprehensiveMonitoringExample,
  helperFunctionsExample,
  highPerformanceExample,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
