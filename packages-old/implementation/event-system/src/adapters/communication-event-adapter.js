/**
 * @file UEL Communication Event Adapter providing unified event management for communication-related events.
 *
 * Unified Event Layer adapter for communication-related events, providing
 * a consistent interface to scattered EventEmitter patterns across the communication system.
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified communication functionality.
 */
import { getLogger, EventEmitter } from '@claude-zen/foundation';
const logger = getLogger('communication-event-adapter');
/**
 * Communication Event Adapter
 *
 * Provides unified event management for communication-related events
 * with correlation tracking, health monitoring, and performance analytics.
 */
export class CommunicationEventAdapter extends EventEmitter {
    logger;
    adapterConfig;
    correlations = new Map();
    healthEntries = new Map();
    wrappedComponents = new Map();
    constructor(config = {}) {
        super();
        this.logger = logger;
        this.adapterConfig = config;
    }
    /**
     * Initialize the communication event adapter
     */
    async initialize() {
        this.logger.info('Initializing Communication Event Adapter');
        if (this.adapterConfig.enableHealthMonitoring) {
            this.startHealthMonitoring();
        }
        if (this.adapterConfig.enablePerformanceTracking) {
            this.startPerformanceTracking();
        }
    }
    /**
     * Shutdown the communication event adapter
     */
    async shutdown() {
        this.logger.info('Shutting down Communication Event Adapter');
        this.correlations.clear();
        this.healthEntries.clear();
        this.wrappedComponents.clear();
    }
    /**
     * Wrap a communication component for event management
     */
    wrapComponent(componentId, component, componentType) {
        const wrapper = new EventEmitter();
        const wrappedComponent = {
            component,
            componentType: componentType,
            wrapper,
            originalMethods: new Map(),
            eventMappings: new Map(),
            isActive: true,
            healthMetrics: {
                lastSeen: new Date(),
                communicationCount: 0,
                errorCount: 0,
                latencySum: 0,
                throughput: 0,
            },
        };
        this.wrappedComponents.set(componentId, wrappedComponent);
        this.logger.debug(`Wrapped communication component: ${componentId}`);
        return wrappedComponent;
    }
    /**
     * Start correlation tracking for communication events
     */
    startCorrelation(correlationId, operation, protocolType) {
        const correlation = {
            correlationId,
            events: [],
            startTime: new Date(),
            lastUpdate: new Date(),
            protocolType,
            messageIds: [],
            operation,
            status: 'active',
            performance: {
                totalLatency: 0,
                communicationEfficiency: 0,
                resourceUtilization: 0,
            },
            metadata: {},
        };
        this.correlations.set(correlationId, correlation);
        this.emit('correlation:started', correlation);
    }
    /**
     * Update health status for a communication component
     */
    updateHealthStatus(componentId, status) {
        const healthEntry = this.healthEntries.get(componentId);
        if (healthEntry) {
            healthEntry.status = status;
            healthEntry.lastCheck = new Date();
            this.emit('health:updated', { componentId, status });
        }
    }
    /**
     * Record communication performance metrics
     */
    recordPerformanceMetrics(componentId, latency, throughput) {
        const healthEntry = this.healthEntries.get(componentId);
        if (healthEntry) {
            healthEntry.communicationLatency = latency;
            healthEntry.throughput = throughput;
            this.emit('performance:recorded', { componentId, latency, throughput });
        }
    }
    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        const interval = this.adapterConfig.healthMonitoring?.interval || 30000;
        setInterval(() => {
            this.performHealthCheck();
        }, interval);
    }
    /**
     * Start performance tracking
     */
    startPerformanceTracking() {
        this.logger.debug('Performance tracking enabled');
    }
    /**
     * Perform health check on all wrapped components
     */
    performHealthCheck() {
        for (const [componentId, component] of this.wrappedComponents) {
            try {
                // Basic health check logic
                const timeSinceLastSeen = Date.now() - component.healthMetrics.lastSeen.getTime();
                const isHealthy = timeSinceLastSeen < 60000; // 1 minute threshold
                this.updateHealthStatus(componentId, isHealthy ? 'healthy' : 'degraded');
            }
            catch (error) {
                this.logger.error(`Health check failed for component ${componentId}:`, error);
                this.updateHealthStatus(componentId, 'unhealthy');
            }
        }
    }
    /**
     * Get correlation by ID
     */
    getCorrelation(correlationId) {
        return this.correlations.get(correlationId);
    }
    /**
     * Get health entry by component ID
     */
    getHealthEntry(componentId) {
        return this.healthEntries.get(componentId);
    }
    /**
     * Get wrapped component by ID
     */
    getWrappedComponent(componentId) {
        return this.wrappedComponents.get(componentId);
    }
    /**
     * Get current statistics
     */
    getStatistics() {
        return {
            activeCorrelations: this.correlations.size,
            healthEntries: this.healthEntries.size,
            wrappedComponents: this.wrappedComponents.size,
            uptime: Date.now(),
        };
    }
}
// Factory function for creating communication event adapters
export function createCommunicationEventAdapter(config) {
    return new CommunicationEventAdapter(config);
}
// Default export
export default CommunicationEventAdapter;
