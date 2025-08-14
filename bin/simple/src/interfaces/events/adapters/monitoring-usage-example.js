import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-events-adapters-monitoring-usage-example');
import { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, MonitoringEventHelpers, } from './monitoring-event-adapter.ts';
import { MonitoringEventRegistry } from './monitoring-event-factory.ts';
async function basicMonitoringExample() {
    const config = createDefaultMonitoringEventAdapterConfig('basic-monitoring-adapter');
    const adapter = createMonitoringEventAdapter(config);
    try {
        await adapter.start();
        const metricsSubscription = adapter.subscribeMetricsEvents((event) => { });
        const healthSubscription = adapter.subscribeHealthMonitoringEvents((event) => { });
        const alertSubscription = adapter.subscribeAlertEvents((event) => { });
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const healthStatus = await adapter.healthCheck();
        const metrics = await adapter.getMetrics();
        adapter.unsubscribe(metricsSubscription);
        adapter.unsubscribe(healthSubscription);
        adapter.unsubscribe(alertSubscription);
    }
    finally {
        await adapter.destroy();
    }
}
async function performanceFocusedExample() {
    const config = createDefaultMonitoringEventAdapterConfig('performance-monitor', {
        metricsOptimization: {
            enabled: true,
            optimizationInterval: 30000,
            performanceThresholds: {
                latency: 50,
                throughput: 2000,
                accuracy: 0.99,
                resourceUsage: 0.7,
            },
            dataAggregation: true,
            intelligentSampling: true,
            anomalyDetection: true,
        },
    });
    const adapter = createMonitoringEventAdapter(config);
    try {
        await adapter.start();
        adapter.subscribePerformanceMonitoringEvents((event) => {
            if (event['details']?.['performanceData']) {
                const perf = event['details']?.['performanceData'];
            }
        });
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        const insights = adapter.getPerformanceInsights('api-gateway');
    }
    finally {
        await adapter.destroy();
    }
}
async function healthFocusedWithCorrelationExample() {
    const config = createDefaultMonitoringEventAdapterConfig('health-monitor');
    const adapter = createMonitoringEventAdapter(config);
    try {
        await adapter.start();
        adapter.subscribe(['monitoring:health', 'monitoring:alert'], (event) => { });
        const correlationId = 'health-correlation-example';
        await adapter.emitPerformanceMonitoringEvent({
            source: 'metrics-collector',
            type: 'monitoring:metrics',
            operation: 'collect',
            component: 'user-service',
            correlationId,
            details: {
                metricName: 'response_time',
                metricValue: 1500,
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
                healthScore: 0.6,
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const correlation = adapter.getMonitoringCorrelatedEvents(correlationId);
        if (correlation) {
        }
        const healthStatus = await adapter.getMonitoringHealthStatus();
    }
    finally {
        await adapter.destroy();
    }
}
async function analyticsFocusedExample() {
    const config = createDefaultMonitoringEventAdapterConfig('analytics-monitor', {
        metricsOptimization: {
            enabled: true,
            optimizationInterval: 120000,
            performanceThresholds: {
                latency: 100,
                throughput: 1000,
                accuracy: 0.98,
                resourceUsage: 0.7,
            },
            dataAggregation: true,
            intelligentSampling: true,
            anomalyDetection: true,
        },
    });
    const adapter = createMonitoringEventAdapter(config);
    try {
        await adapter.start();
        adapter.subscribe(['monitoring:metrics'], (event) => {
            if (event['details']?.['insights']) {
            }
        });
        await adapter.emitAnalyticsMonitoringEvent({
            source: 'trend-analyzer',
            type: 'monitoring:metrics',
            operation: 'report',
            component: 'payment-system',
            details: {
                metricName: 'analytics_insights',
                metricValue: 2500,
                severity: 'info',
            },
        });
        await adapter.emitAnalyticsMonitoringEvent({
            source: 'anomaly-detector',
            type: 'monitoring:alert',
            operation: 'anomaly',
            component: 'fraud-detection',
            details: {
                metricName: 'anomaly_detection',
                metricValue: 0.94,
                severity: 'warning',
            },
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        const insights = adapter.getPerformanceInsights();
    }
    finally {
        await adapter.destroy();
    }
}
async function alertManagementExample() {
    const config = createDefaultMonitoringEventAdapterConfig('alert-monitor', {
        alertManagement: {
            enabled: true,
            wrapAlertEvents: true,
            wrapEscalationEvents: true,
            wrapResolutionEvents: true,
            wrapNotificationEvents: true,
            alertLevels: ['info', 'warning', 'error', 'critical'],
        },
    });
    const adapter = createMonitoringEventAdapter(config);
    try {
        await adapter.start();
        adapter.subscribeAlertEvents((event) => {
            const alertId = event['details']?.['alertId'];
            const severity = event['details']?.['severity'];
        });
        const alertId = 'disk-space-alert';
        await adapter.emitAlertMonitoringEvent({
            source: 'disk-monitor',
            type: 'monitoring:alert',
            operation: 'alert',
            component: 'storage-server',
            details: {
                alertId,
                severity: 'warning',
                threshold: 85,
                metricValue: 87,
            },
        });
        await adapter.emitAlertMonitoringEvent({
            source: 'alert-manager',
            type: 'monitoring:alert',
            operation: 'alert',
            component: 'storage-server',
            details: {
                alertId,
                severity: 'error',
                threshold: 85,
                metricValue: 92,
            },
        });
        await adapter.emitAlertMonitoringEvent({
            source: 'alert-manager',
            type: 'monitoring:alert',
            operation: 'alert',
            component: 'storage-server',
            details: {
                alertId,
                severity: 'critical',
                threshold: 85,
                metricValue: 97,
            },
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        const alertData = adapter.getAlertData(alertId);
    }
    finally {
        await adapter.destroy();
    }
}
async function comprehensiveMonitoringExample() {
    const config = createDefaultMonitoringEventAdapterConfig('comprehensive-monitor');
    const adapter = createMonitoringEventAdapter(config);
    try {
        await MonitoringEventRegistry.register('main-monitor', adapter, {
            onStart: async (adapter) => { },
            onStop: async (adapter) => { },
            onError: async (adapter, error) => { },
        });
        await adapter.start();
        const allEventsSubscription = adapter.subscribe([
            'monitoring:metrics',
            'monitoring:health',
            'monitoring:alert',
            'monitoring:performance',
        ], (event) => { });
        const scenarioId = 'comprehensive-scenario';
        await adapter.emitPerformanceMonitoringEvent({
            source: 'system-monitor',
            type: 'monitoring:performance',
            operation: 'collect',
            component: 'web-cluster',
            correlationId: scenarioId,
            details: {
                performanceData: {
                    cpu: 85,
                    memory: 78,
                    disk: 45,
                    network: 28,
                    latency: 150,
                    throughput: 1200,
                    errorRate: 0.05,
                },
            },
        });
        await adapter.emitHealthMonitoringEvent({
            source: 'health-monitor',
            type: 'monitoring:health',
            operation: 'alert',
            component: 'web-cluster',
            correlationId: scenarioId,
            details: { healthScore: 0.7, severity: 'warning' },
        });
        await adapter.emitPerformanceMonitoringEvent({
            source: 'metrics-collector',
            type: 'monitoring:metrics',
            operation: 'collect',
            component: 'web-cluster',
            correlationId: scenarioId,
            details: { metricName: 'request_rate', metricValue: 3500 },
        });
        await adapter.emitAlertMonitoringEvent({
            source: 'alert-manager',
            type: 'monitoring:alert',
            operation: 'alert',
            component: 'web-cluster',
            correlationId: scenarioId,
            details: { alertId: 'cluster-performance-alert', severity: 'error' },
        });
        await adapter.emitAnalyticsMonitoringEvent({
            source: 'analytics-engine',
            type: 'monitoring:metrics',
            operation: 'report',
            component: 'web-cluster',
            correlationId: scenarioId,
            details: {
                metricName: 'system_insights',
                metricValue: 85,
            },
        });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const healthStatus = await MonitoringEventRegistry.getHealthStatus();
        const metrics = await MonitoringEventRegistry.getMetrics();
        const correlation = adapter.getMonitoringCorrelatedEvents(scenarioId);
        if (correlation) {
        }
        adapter.unsubscribe(allEventsSubscription);
    }
    finally {
        await MonitoringEventRegistry.unregister('main-monitor');
    }
}
async function helperFunctionsExample() {
    const adapter = createMonitoringEventAdapter(createDefaultMonitoringEventAdapterConfig('helper-example'));
    try {
        await adapter.start();
        adapter.subscribe(['monitoring:metrics', 'monitoring:health', 'monitoring:alert'], (event) => { });
        const performanceEvent = MonitoringEventHelpers.createPerformanceMetricsEvent('memory_usage', 89.5, 'cache-server', { threshold: 85, unit: 'percentage' });
        const healthEvent = MonitoringEventHelpers.createHealthStatusEvent('load-balancer', 0.92, 'healthy', { uptime: 99.98, lastCheck: new Date() });
        const alertEvent = MonitoringEventHelpers.createAlertEvent('lb-health-check', 'info', 'load-balancer', { message: 'Health check passed', responseTime: 45 });
        const insightEvent = MonitoringEventHelpers.createAnalyticsInsightEvent('predictive-analyzer', {
            forecast: { nextHour: { requests: 5200, avgLatency: 95 } },
            confidence: 0.91,
        });
        const errorEvent = MonitoringEventHelpers.createMonitoringErrorEvent('data-collector', new Error('Connection timeout to metrics database'), 'collect');
        await adapter.emit({
            ...performanceEvent,
            id: 'perf-1',
            timestamp: new Date(),
        });
        await adapter.emit({
            ...healthEvent,
            id: 'health-1',
            timestamp: new Date(),
        });
        await adapter.emit({ ...alertEvent, id: 'alert-1', timestamp: new Date() });
        await adapter.emit({
            ...insightEvent,
            id: 'insight-1',
            timestamp: new Date(),
        });
        await adapter.emit({ ...errorEvent, id: 'error-1', timestamp: new Date() });
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    finally {
        await adapter.destroy();
    }
}
async function highPerformanceExample() {
    const throughputConfig = createDefaultMonitoringEventAdapterConfig('throughput-test', {
        processing: {
            strategy: 'queued',
            queueSize: 10000,
        },
    });
    const throughputAdapter = createMonitoringEventAdapter(throughputConfig);
    const latencyConfig = createDefaultMonitoringEventAdapterConfig('latency-test', {
        processing: {
            strategy: 'immediate',
            queueSize: 1000,
        },
    });
    const latencyAdapter = createMonitoringEventAdapter(latencyConfig);
    try {
        await Promise.all([throughputAdapter.start(), latencyAdapter.start()]);
        let throughputEvents = 0;
        let latencyEvents = 0;
        throughputAdapter.subscribe(['monitoring:metrics'], () => {
            throughputEvents++;
        });
        latencyAdapter.subscribe(['monitoring:performance'], () => {
            latencyEvents++;
        });
        const startTime = Date.now();
        const throughputPromises = [];
        for (let i = 0; i < 500; i++) {
            throughputPromises.push(throughputAdapter.emitPerformanceMonitoringEvent({
                source: `source-${i % 10}`,
                type: 'monitoring:metrics',
                operation: 'collect',
                component: `component-${i % 5}`,
                details: {
                    metricName: `metric_${i}`,
                    metricValue: Math.random() * 100,
                },
            }));
        }
        const latencyPromises = [];
        for (let i = 0; i < 100; i++) {
            latencyPromises.push(latencyAdapter.emitPerformanceMonitoringEvent({
                source: `latency-source-${i}`,
                type: 'monitoring:performance',
                operation: 'collect',
                component: 'latency-critical',
                details: {
                    performanceData: {
                        cpu: 50,
                        memory: 60,
                        disk: 30,
                        network: 20,
                        latency: Math.random() * 50,
                        throughput: 1000 + Math.random() * 2000,
                        errorRate: 0.01,
                    },
                },
            }));
        }
        await Promise.all([...throughputPromises, ...latencyPromises]);
        const endTime = Date.now();
        const duration = endTime - startTime;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const throughputMetrics = await throughputAdapter.getMetrics();
        const latencyMetrics = await latencyAdapter.getMetrics();
    }
    finally {
        await Promise.all([throughputAdapter.destroy(), latencyAdapter.destroy()]);
    }
}
async function runAllExamples() {
    try {
        await basicMonitoringExample();
        await performanceFocusedExample();
        await healthFocusedWithCorrelationExample();
        await analyticsFocusedExample();
        await alertManagementExample();
        await comprehensiveMonitoringExample();
        await helperFunctionsExample();
        await highPerformanceExample();
    }
    catch (error) {
        logger.error('❌ Error running examples:', error);
        throw error;
    }
}
export { basicMonitoringExample, performanceFocusedExample, healthFocusedWithCorrelationExample, analyticsFocusedExample, alertManagementExample, comprehensiveMonitoringExample, helperFunctionsExample, highPerformanceExample, runAllExamples, };
if (require.main === module) {
    runAllExamples().catch(console.error);
}
//# sourceMappingURL=monitoring-usage-example.js.map