import type { EventBatch, EventEmissionOptions, EventFilter, EventListener, EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventMonitoringConfig, EventQueryOptions, EventSubscription, EventTransform, IEventManager, SystemEvent } from '../core/interfaces.ts';
import { type EventManagerType } from '../core/interfaces.ts';
import type { MonitoringEvent } from '../types.ts';
/**
 * Monitoring event adapter configuration extending UEL EventManagerConfig.
 *
 * @example
 */
export interface MonitoringEventAdapterConfig extends EventManagerConfig {
    /** Performance monitoring integration settings */
    performanceMonitoring?: {
        enabled: boolean;
        wrapMetricsEvents?: boolean;
        wrapThresholdEvents?: boolean;
        wrapAlertEvents?: boolean;
        wrapOptimizationEvents?: boolean;
        monitors?: string[];
    };
    /** Health monitoring integration settings */
    healthMonitoring?: {
        enabled: boolean;
        wrapHealthCheckEvents?: boolean;
        wrapStatusEvents?: boolean;
        wrapRecoveryEvents?: boolean;
        wrapCorrelationEvents?: boolean;
        components?: string[];
    };
    /** Analytics monitoring integration settings */
    analyticsMonitoring?: {
        enabled: boolean;
        wrapCollectionEvents?: boolean;
        wrapAggregationEvents?: boolean;
        wrapReportingEvents?: boolean;
        wrapInsightEvents?: boolean;
        analyzers?: string[];
    };
    /** Alert management integration settings */
    alertManagement?: {
        enabled: boolean;
        wrapAlertEvents?: boolean;
        wrapEscalationEvents?: boolean;
        wrapResolutionEvents?: boolean;
        wrapNotificationEvents?: boolean;
        alertLevels?: ('info' | 'warning' | 'error' | 'critical')[];
    };
    /** Dashboard integration settings */
    dashboardIntegration?: {
        enabled: boolean;
        wrapUpdateEvents?: boolean;
        wrapVisualizationEvents?: boolean;
        wrapStreamingEvents?: boolean;
        wrapInteractionEvents?: boolean;
        dashboards?: string[];
    };
    /** Performance optimization settings */
    performance?: {
        enableMetricsCorrelation?: boolean;
        enableRealTimeTracking?: boolean;
        enablePerformanceAggregation?: boolean;
        maxConcurrentMonitors?: number;
        monitoringInterval?: number;
        enablePerformanceTracking?: boolean;
    };
    /** Monitoring correlation configuration */
    monitoring?: EventMonitoringConfig & {
        enabled: boolean;
        strategy: 'metrics' | 'health' | 'analytics' | 'alerts' | 'custom';
        correlationTTL: number;
        maxCorrelationDepth: number;
        correlationPatterns: string[];
        trackMetricsFlow: boolean;
        trackHealthStatus: boolean;
        trackPerformanceInsights: boolean;
    };
    /** Health monitoring configuration */
    healthMonitoringConfig?: {
        enabled: boolean;
        healthCheckInterval: number;
        healthThresholds: Record<string, number>;
        alertThresholds: Record<string, number>;
        autoRecoveryEnabled: boolean;
        correlateHealthData: boolean;
    };
    /** Metrics optimization configuration */
    metricsOptimization?: {
        enabled: boolean;
        optimizationInterval: number;
        performanceThresholds: {
            latency: number;
            throughput: number;
            accuracy: number;
            resourceUsage: number;
        };
        dataAggregation: boolean;
        intelligentSampling: boolean;
        anomalyDetection: boolean;
    };
}
/**
 * Monitoring correlation entry for tracking related events.
 *
 * @example
 */
interface MonitoringCorrelation {
    correlationId: string;
    events: MonitoringEvent[];
    startTime: Date;
    lastUpdate: Date;
    component?: string;
    monitoringType: string;
    metricNames: string[];
    operation: string;
    status: 'active' | 'completed' | 'failed' | 'timeout';
    performance: {
        totalLatency: number;
        monitoringEfficiency: number;
        dataAccuracy: number;
        resourceUtilization: number;
    };
    metadata: Record<string, any>;
}
/**
 * Monitoring health tracking entry.
 *
 * @example
 */
interface MonitoringHealthEntry {
    component: string;
    componentType: 'performance' | 'analytics' | 'health' | 'dashboard' | 'alert';
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    consecutiveFailures: number;
    monitoringLatency: number;
    dataAccuracy: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    metricsCount?: number;
    alertsCount?: number;
    healthScore?: number;
    metadata: Record<string, any>;
}
/**
 * Unified Monitoring Event Adapter.
 *
 * Provides a unified interface to monitoring-level EventEmitter patterns.
 * While implementing the IEventManager interface for UEL compatibility.
 *
 * Features:
 * - Performance monitoring with real-time metrics collection and alerting
 * - Health monitoring with component status tracking and correlation
 * - Analytics monitoring with insights generation and trend analysis
 * - Alert management with escalation and notification systems
 * - Dashboard integration with real-time updates and visualization
 * - Event correlation and pattern detection for monitoring workflows
 * - Unified configuration management for monitoring components
 * - Health monitoring and auto-recovery for monitoring failures
 * - Event forwarding and transformation for monitoring events
 * - Error handling with retry logic for monitoring operations.
 *
 * @example
 */
export declare class MonitoringEventAdapter implements IEventManager {
    readonly config: MonitoringEventAdapterConfig;
    readonly name: string;
    readonly type: EventManagerType;
    private running;
    private eventEmitter;
    private logger;
    private startTime?;
    private eventCount;
    private successCount;
    private errorCount;
    private totalLatency;
    private wrappedComponents;
    private performanceMonitors;
    private metricsCollectors;
    private analyticsComponents;
    private dashboardComponents;
    private monitoringCorrelations;
    private monitoringHealth;
    private metrics;
    private subscriptions;
    private filters;
    private transforms;
    private eventQueue;
    private processingEvents;
    private eventHistory;
    private metricsData;
    private healthData;
    private alertData;
    private performanceInsights;
    constructor(config: MonitoringEventAdapterConfig);
    /**
     * Start the monitoring event adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the monitoring event adapter.
     */
    stop(): Promise<void>;
    /**
     * Restart the monitoring event adapter.
     */
    restart(): Promise<void>;
    /**
     * Check if the adapter is running.
     */
    isRunning(): boolean;
    /**
     * Emit a monitoring event with correlation and performance tracking.
     *
     * @param event
     * @param options
     */
    emit<T extends SystemEvent>(event: T, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit batch of monitoring events with optimized processing.
     *
     * @param batch
     * @param options
     */
    emitBatch<T extends SystemEvent>(batch: EventBatch<T>, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit monitoring event immediately without queuing.
     *
     * @param event
     */
    emitImmediate<T extends SystemEvent>(event: T): Promise<void>;
    /**
     * Subscribe to monitoring events with filtering and transformation.
     *
     * @param eventTypes
     * @param listener
     * @param options
     */
    subscribe<T extends SystemEvent>(eventTypes: string | string[], listener: EventListener<T>, options?: Partial<EventSubscription<T>>): string;
    /**
     * Unsubscribe from monitoring events.
     *
     * @param subscriptionId
     */
    unsubscribe(subscriptionId: string): boolean;
    /**
     * Unsubscribe all monitoring listeners for event type.
     *
     * @param eventType
     */
    unsubscribeAll(eventType?: string): number;
    /**
     * Add monitoring event filter.
     *
     * @param filter
     */
    addFilter(filter: EventFilter): string;
    /**
     * Remove monitoring event filter.
     *
     * @param filterId
     */
    removeFilter(filterId: string): boolean;
    /**
     * Add monitoring event transform.
     *
     * @param transform
     */
    addTransform(transform: EventTransform): string;
    /**
     * Remove monitoring event transform.
     *
     * @param transformId
     */
    removeTransform(transformId: string): boolean;
    /**
     * Query monitoring event history with filtering and pagination.
     *
     * @param options
     */
    query<T extends SystemEvent>(options: EventQueryOptions): Promise<T[]>;
    /**
     * Get monitoring event history for specific event type.
     *
     * @param eventType
     * @param limit
     */
    getEventHistory(eventType: string, limit?: number): Promise<SystemEvent[]>;
    /**
     * Perform health check on the monitoring event adapter.
     */
    healthCheck(): Promise<EventManagerStatus>;
    /**
     * Get performance metrics for the monitoring adapter.
     */
    getMetrics(): Promise<EventManagerMetrics>;
    /**
     * Get active monitoring subscriptions.
     */
    getSubscriptions(): EventSubscription[];
    /**
     * Update adapter configuration.
     *
     * @param config
     */
    updateConfig(config: Partial<MonitoringEventAdapterConfig>): void;
    /**
     * Event handler management (EventEmitter compatibility).
     *
     * @param event
     * @param handler.
     * @param handler
     */
    on(event: 'start' | 'stop' | 'error' | 'subscription' | 'emission', handler: (...args: unknown[]) => void): void;
    off(event: string, handler?: (...args: unknown[]) => void): void;
    once(event: string, handler: (...args: unknown[]) => void): void;
    /**
     * Cleanup and destroy the adapter.
     */
    destroy(): Promise<void>;
    /**
     * Emit performance monitoring event with enhanced tracking.
     *
     * @param event
     */
    emitPerformanceMonitoringEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Emit health monitoring event with enhanced tracking.
     *
     * @param event
     */
    emitHealthMonitoringEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Emit analytics monitoring event with enhanced tracking.
     *
     * @param event
     */
    emitAnalyticsMonitoringEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Emit alert monitoring event with enhanced tracking.
     *
     * @param event
     */
    emitAlertMonitoringEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Subscribe to performance monitoring events with convenience.
     *
     * @param listener
     */
    subscribePerformanceMonitoringEvents(listener: EventListener<MonitoringEvent>): string;
    /**
     * Subscribe to health monitoring events.
     *
     * @param listener
     */
    subscribeHealthMonitoringEvents(listener: EventListener<MonitoringEvent>): string;
    /**
     * Subscribe to metrics collection events.
     *
     * @param listener
     */
    subscribeMetricsEvents(listener: EventListener<MonitoringEvent>): string;
    /**
     * Subscribe to alert events.
     *
     * @param listener
     */
    subscribeAlertEvents(listener: EventListener<MonitoringEvent>): string;
    /**
     * Get monitoring health status for all components.
     */
    getMonitoringHealthStatus(): Promise<Record<string, MonitoringHealthEntry>>;
    /**
     * Get correlated monitoring events for a specific correlation ID.
     *
     * @param correlationId
     */
    getMonitoringCorrelatedEvents(correlationId: string): MonitoringCorrelation | null;
    /**
     * Get active monitoring correlations.
     */
    getActiveMonitoringCorrelations(): MonitoringCorrelation[];
    /**
     * Get metrics data for monitoring.
     *
     * @param metricName
     */
    getMetricsData(metricName?: string): Record<string, any>;
    /**
     * Get health data for monitoring.
     *
     * @param component
     */
    getHealthData(component?: string): Record<string, any>;
    /**
     * Get alert data for monitoring.
     *
     * @param alertId
     */
    getAlertData(alertId?: string): Record<string, any>;
    /**
     * Get performance insights.
     *
     * @param component
     */
    getPerformanceInsights(component?: string): Record<string, any>;
    /**
     * Force health check on all wrapped monitoring components.
     */
    performMonitoringHealthCheck(): Promise<Record<string, MonitoringHealthEntry>>;
    /**
     * Initialize monitoring component integrations.
     */
    private initializeMonitoringIntegrations;
    /**
     * Wrap performance monitor events with UEL integration.
     */
    private wrapPerformanceMonitors;
    /**
     * Wrap health component events with UEL integration.
     */
    private wrapHealthComponents;
    /**
     * Wrap analytics component events with UEL integration.
     */
    private wrapAnalyticsComponents;
    /**
     * Wrap alert management events with UEL integration.
     */
    private wrapAlertManagement;
    /**
     * Wrap dashboard integration events with UEL integration.
     */
    private wrapDashboardIntegration;
    /**
     * Unwrap all monitoring components.
     */
    private unwrapMonitoringComponents;
    /**
     * Process monitoring event emission with correlation and filtering.
     *
     * @param event
     * @param options
     * @param _options
     */
    private processMonitoringEventEmission;
    /**
     * Start event processing loop for monitoring events.
     */
    private startEventProcessing;
    /**
     * Start health monitoring for monitoring components.
     */
    private startMonitoringHealthMonitoring;
    /**
     * Start monitoring correlation cleanup to prevent memory leaks.
     */
    private startMonitoringCorrelationCleanup;
    /**
     * Start metrics optimization if enabled.
     */
    private startMetricsOptimization;
    /**
     * Start monitoring event correlation for tracking related events.
     *
     * @param event
     */
    private startMonitoringEventCorrelation;
    /**
     * Update existing monitoring event correlation.
     *
     * @param event
     */
    private updateMonitoringEventCorrelation;
    /**
     * Check if monitoring correlation is complete based on patterns.
     *
     * @param correlation
     */
    private isMonitoringCorrelationComplete;
    /**
     * Calculate monitoring efficiency for correlation.
     *
     * @param correlation
     */
    private calculateMonitoringEfficiency;
    /**
     * Calculate data accuracy for correlation.
     *
     * @param correlation
     */
    private calculateDataAccuracy;
    /**
     * Check health of all monitoring components.
     */
    private checkMonitoringComponentHealth;
    /**
     * Batch processing methods for different strategies.
     *
     * @param batch
     * @param options
     */
    private processMonitoringBatchImmediate;
    private processMonitoringBatchQueued;
    private processMonitoringBatchBatched;
    private processMonitoringBatchThrottled;
    private applyFilter;
    private applyTransform;
    private getEventSortValue;
    private extractMonitoringOperation;
    private extractMetricName;
    private extractMetricValue;
    private extractAlertLevel;
    private extractHealthScore;
    private extractPerformanceData;
    private extractMonitoringType;
    private extractMetricNames;
    private determineMonitoringEventPriority;
    private updateComponentHealthMetrics;
    private updateMonitoringMetrics;
    private getActiveMetricsCount;
    private getActiveAlertsCount;
    private recordMonitoringEventMetrics;
    private estimateMemoryUsage;
    /**
     * ID generation methods.
     */
    private generateEventId;
    private generateSubscriptionId;
    private generateFilterId;
    private generateTransformId;
    private generateCorrelationId;
    /**
     * Emit wrapper for internal use.
     *
     * @param event
     * @param data
     */
    private emitInternal;
}
/**
 * Factory function for creating MonitoringEventAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createMonitoringEventAdapter(config: MonitoringEventAdapterConfig): MonitoringEventAdapter;
/**
 * Helper function for creating default monitoring event adapter configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultMonitoringEventAdapterConfig(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapterConfig;
/**
 * Helper functions for monitoring event operations.
 */
export declare const MonitoringEventHelpers: {
    /**
     * Create performance metrics event.
     *
     * @param metricName
     * @param metricValue
     * @param component
     * @param details
     */
    createPerformanceMetricsEvent(metricName: string, metricValue: number, component: string, details?: any): Omit<MonitoringEvent, "id" | "timestamp">;
    /**
     * Create health status event.
     *
     * @param component
     * @param healthScore
     * @param status
     * @param details
     */
    createHealthStatusEvent(component: string, healthScore: number, status: string, details?: any): Omit<MonitoringEvent, "id" | "timestamp">;
    /**
     * Create alert event.
     *
     * @param alertId
     * @param severity
     * @param component
     * @param details
     */
    createAlertEvent(alertId: string, severity: "info" | "warning" | "error" | "critical", component: string, details?: any): Omit<MonitoringEvent, "id" | "timestamp">;
    /**
     * Create analytics insight event.
     *
     * @param component
     * @param insights
     * @param details
     */
    createAnalyticsInsightEvent(component: string, insights: any, details?: any): Omit<MonitoringEvent, "id" | "timestamp">;
    /**
     * Create monitoring error event.
     *
     * @param component
     * @param error
     * @param operation
     * @param _operation
     * @param details
     */
    createMonitoringErrorEvent(component: string, error: Error, _operation: string, details?: any): Omit<MonitoringEvent, "id" | "timestamp">;
};
export default MonitoringEventAdapter;
//# sourceMappingURL=monitoring-event-adapter.d.ts.map