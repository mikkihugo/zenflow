/**
 * @file UEL System Event Adapter.
 *
 * Unified Event Layer adapter for system-level events, providing
 * a consistent interface to scattered EventEmitter patterns across the core system
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified system-level functionality.
 *
 * This adapter follows the exact same patterns as the USL service adapters,
 * implementing the IEventManager interface and providing unified configuration
 * management for system events across Claude-Zen.
 */
import type { EventBatch, EventEmissionOptions, EventFilter, EventListener, EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventManagerType, EventQueryOptions, EventSubscription, EventTransform, IEventManager, SystemEvent } from '../core/interfaces.ts';
import type { SystemLifecycleEvent } from '../types.ts';
/**
 * System event adapter configuration extending UEL EventManagerConfig.
 *
 * @example
 */
export interface SystemEventAdapterConfig extends EventManagerConfig {
    /** Core system integration settings */
    coreSystem?: {
        enabled: boolean;
        wrapLifecycleEvents?: boolean;
        wrapHealthEvents?: boolean;
        wrapConfigEvents?: boolean;
    };
    /** Application coordinator integration settings */
    applicationCoordinator?: {
        enabled: boolean;
        wrapComponentEvents?: boolean;
        wrapStatusEvents?: boolean;
        wrapWorkspaceEvents?: boolean;
    };
    /** Process management integration settings */
    processManagement?: {
        enabled: boolean;
        wrapServiceEvents?: boolean;
        wrapDaemonEvents?: boolean;
        wrapResourceEvents?: boolean;
    };
    /** Error recovery integration settings */
    errorRecovery?: {
        enabled: boolean;
        wrapRecoveryEvents?: boolean;
        wrapStrategyEvents?: boolean;
        correlateErrors?: boolean;
    };
    /** Performance optimization settings */
    performance?: {
        enableEventCorrelation?: boolean;
        maxConcurrentEvents?: number;
        eventTimeout?: number;
        enablePerformanceTracking?: boolean;
    };
    /** Event correlation configuration */
    correlation?: {
        enabled: boolean;
        strategy: 'session' | 'component' | 'operation' | 'custom';
        correlationTTL: number;
        maxCorrelationDepth: number;
        correlationPatterns: string[];
    };
    /** Health monitoring configuration */
    healthMonitoring?: {
        enabled: boolean;
        healthCheckInterval: number;
        componentHealthThresholds: Record<string, number>;
        autoRecoveryEnabled: boolean;
    };
}
/**
 * Event correlation entry for tracking related events.
 *
 * @example
 */
interface EventCorrelation {
    correlationId: string;
    events: SystemEvent[];
    startTime: Date;
    lastUpdate: Date;
    component: string;
    operation: string;
    status: 'active' | 'completed' | 'failed' | 'timeout';
    metadata: Record<string, unknown>;
}
/**
 * System health tracking entry.
 *
 * @example
 */
interface SystemHealthEntry {
    component: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    consecutiveFailures: number;
    errorRate: number;
    responseTime: number;
    metadata: Record<string, unknown>;
}
/**
 * Unified System Event Adapter.
 *
 * Provides a unified interface to system-level EventEmitter patterns.
 * While implementing the IEventManager interface for UEL compatibility.
 *
 * Features:
 * - Application lifecycle event management
 * - System health monitoring and status reporting
 * - Configuration change detection and notification
 * - Error correlation and recovery tracking
 * - Performance monitoring for system operations
 * - Event correlation and pattern detection
 * - Unified configuration management
 * - Health monitoring and auto-recovery
 * - Event forwarding and transformation
 * - Error handling with retry logic.
 *
 * @example
 */
export declare class SystemEventAdapter implements IEventManager {
    readonly config: SystemEventAdapterConfig;
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
    private coreSystem?;
    private applicationCoordinator?;
    private eventCorrelations;
    private systemHealth;
    private metrics;
    private subscriptions;
    private filters;
    private transforms;
    private eventQueue;
    private processingEvents;
    private eventHistory;
    constructor(config: SystemEventAdapterConfig);
    /**
     * Start the system event adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the system event adapter.
     */
    stop(): Promise<void>;
    /**
     * Restart the system event adapter.
     */
    restart(): Promise<void>;
    /**
     * Check if the adapter is running.
     */
    isRunning(): boolean;
    /**
     * Emit a system event with correlation and performance tracking.
     *
     * @param event
     * @param options
     */
    emit<T extends SystemEvent>(event: T, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit batch of events with optimized processing.
     *
     * @param batch
     * @param options
     */
    emitBatch<T extends SystemEvent>(batch: EventBatch<T>, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit event immediately without queuing.
     *
     * @param event
     */
    emitImmediate<T extends SystemEvent>(event: T): Promise<void>;
    /**
     * Subscribe to system events with filtering and transformation.
     *
     * @param eventTypes
     * @param listener
     * @param options
     */
    subscribe<T extends SystemEvent>(eventTypes: string | string[], listener: EventListener<T>, options?: Partial<EventSubscription<T>>): string;
    /**
     * Unsubscribe from events.
     *
     * @param subscriptionId
     */
    unsubscribe(subscriptionId: string): boolean;
    /**
     * Unsubscribe all listeners for event type.
     *
     * @param eventType
     */
    unsubscribeAll(eventType?: string): number;
    /**
     * Add event filter.
     *
     * @param filter
     */
    addFilter(filter: EventFilter): string;
    /**
     * Remove event filter.
     *
     * @param filterId
     */
    removeFilter(filterId: string): boolean;
    /**
     * Add event transform.
     *
     * @param transform
     */
    addTransform(transform: EventTransform): string;
    /**
     * Remove event transform.
     *
     * @param transformId
     */
    removeTransform(transformId: string): boolean;
    /**
     * Query event history with filtering and pagination.
     *
     * @param options
     */
    query<T extends SystemEvent>(options: EventQueryOptions): Promise<T[]>;
    /**
     * Get event history for specific event type.
     *
     * @param eventType
     * @param limit
     */
    getEventHistory(eventType: string, limit?: number): Promise<SystemEvent[]>;
    /**
     * Perform health check on the system event adapter.
     */
    healthCheck(): Promise<EventManagerStatus>;
    /**
     * Get performance metrics for the adapter.
     */
    getMetrics(): Promise<EventManagerMetrics>;
    /**
     * Get active subscriptions.
     */
    getSubscriptions(): EventSubscription[];
    /**
     * Update adapter configuration.
     *
     * @param config
     */
    updateConfig(config: Partial<SystemEventAdapterConfig>): void;
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
     * Emit system lifecycle event with enhanced tracking.
     *
     * @param event
     */
    emitSystemLifecycleEvent(event: Omit<SystemLifecycleEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Subscribe to system lifecycle events with convenience.
     *
     * @param listener
     */
    subscribeSystemLifecycleEvents(listener: EventListener<SystemLifecycleEvent>): string;
    /**
     * Subscribe to application lifecycle events.
     *
     * @param listener
     */
    subscribeApplicationEvents(listener: EventListener<SystemLifecycleEvent>): string;
    /**
     * Subscribe to error and recovery events.
     *
     * @param listener
     */
    subscribeErrorRecoveryEvents(listener: EventListener<SystemLifecycleEvent>): string;
    /**
     * Get system health status for all components.
     */
    getSystemHealthStatus(): Promise<Record<string, SystemHealthEntry>>;
    /**
     * Get correlated events for a specific correlation ID.
     *
     * @param correlationId
     */
    getCorrelatedEvents(correlationId: string): EventCorrelation | null;
    /**
     * Get active event correlations.
     */
    getActiveCorrelations(): EventCorrelation[];
    /**
     * Force health check on all wrapped components.
     */
    performSystemHealthCheck(): Promise<Record<string, SystemHealthEntry>>;
    /**
     * Initialize system component integrations.
     */
    private initializeSystemIntegrations;
    /**
     * Wrap CoreSystem events with UEL integration.
     */
    private wrapCoreSystem;
    /**
     * Wrap ApplicationCoordinator events with UEL integration.
     */
    private wrapApplicationCoordinator;
    /**
     * Wrap ErrorRecoverySystem events with UEL integration.
     */
    private wrapErrorRecoverySystem;
    /**
     * Unwrap all system components.
     */
    private unwrapSystemComponents;
    /**
     * Process event emission with correlation and filtering.
     *
     * @param event
     * @param options
     * @param _options
     */
    private processEventEmission;
    /**
     * Start event processing loop.
     */
    private startEventProcessing;
    /**
     * Start health monitoring for system components.
     */
    private startHealthMonitoring;
    /**
     * Start correlation cleanup to prevent memory leaks.
     */
    private startCorrelationCleanup;
    /**
     * Start event correlation for tracking related events.
     *
     * @param event
     */
    private startEventCorrelation;
    /**
     * Update existing event correlation.
     *
     * @param event
     */
    private updateEventCorrelation;
    /**
     * Correlate error recovery events for enhanced tracking.
     *
     * @param event
     * @param data
     */
    private correlateErrorRecoveryEvent;
    /**
     * Check if event correlation is complete based on patterns.
     *
     * @param correlation
     */
    private isCorrelationComplete;
    /**
     * Check health of all system components.
     */
    private checkSystemComponentHealth;
    /**
     * Batch processing methods for different strategies.
     *
     * @param batch
     * @param options
     */
    private processBatchImmediate;
    private processBatchQueued;
    private processBatchBatched;
    private processBatchThrottled;
    /**
     * Utility methods for event processing.
     *
     * @param event
     */
    private validateEvent;
    private applyFilter;
    private applyTransform;
    private getEventSortValue;
    private extractOperationFromEvent;
    private extractStatusFromData;
    private recordEventMetrics;
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
 * Factory function for creating SystemEventAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createSystemEventAdapter(config: SystemEventAdapterConfig): SystemEventAdapter;
/**
 * Helper function for creating default system event adapter configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultSystemEventAdapterConfig(name: string, overrides?: Partial<SystemEventAdapterConfig>): SystemEventAdapterConfig;
/**
 * Helper functions for system event operations.
 */
export declare const SystemEventHelpers: {
    /**
     * Create system startup event.
     *
     * @param component
     * @param details
     */
    createStartupEvent(component: string, details?: any): Omit<SystemLifecycleEvent, "id" | "timestamp">;
    /**
     * Create system shutdown event.
     *
     * @param component
     * @param details
     */
    createShutdownEvent(component: string, details?: any): Omit<SystemLifecycleEvent, "id" | "timestamp">;
    /**
     * Create system health event.
     *
     * @param component
     * @param healthScore
     * @param details
     */
    createHealthEvent(component: string, healthScore: number, details?: any): Omit<SystemLifecycleEvent, "id" | "timestamp">;
    /**
     * Create system error event.
     *
     * @param component
     * @param error
     * @param details
     */
    createErrorEvent(component: string, error: Error, details?: any): Omit<SystemLifecycleEvent, "id" | "timestamp">;
};
export default SystemEventAdapter;
//# sourceMappingURL=system-event-adapter.d.ts.map