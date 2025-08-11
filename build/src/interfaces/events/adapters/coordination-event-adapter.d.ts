/**
 * UEL Coordination Event Adapter.
 *
 * Unified Event Layer adapter for coordination-related events, providing
 * a consistent interface to scattered EventEmitter patterns across the coordination system.
 * While maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified coordination functionality.
 *
 * This adapter follows the exact same patterns as the system event adapter,
 * implementing the IEventManager interface and providing unified configuration.
 * Management for coordination events across Claude-Zen.
 */
/**
 * @file Coordination-event adapter implementation.
 */
import type { EventBatch, EventEmissionOptions, EventFilter, EventListener, EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventManagerType, EventQueryOptions, EventSubscription, EventTransform, IEventManager } from '../core/interfaces.ts';
import type { CoordinationEvent } from '../types.ts';
/**
 * Coordination event adapter configuration extending UEL EventManagerConfig.
 *
 * @example
 */
export interface CoordinationEventAdapterConfig extends EventManagerConfig {
    /** Swarm coordination integration settings */
    swarmCoordination?: {
        enabled: boolean;
        wrapLifecycleEvents?: boolean;
        wrapPerformanceEvents?: boolean;
        wrapTopologyEvents?: boolean;
        wrapHealthEvents?: boolean;
        coordinators?: string[];
    };
    /** Agent management integration settings */
    agentManagement?: {
        enabled: boolean;
        wrapAgentEvents?: boolean;
        wrapHealthEvents?: boolean;
        wrapRegistryEvents?: boolean;
        wrapLifecycleEvents?: boolean;
    };
    /** Task orchestration integration settings */
    taskOrchestration?: {
        enabled: boolean;
        wrapTaskEvents?: boolean;
        wrapDistributionEvents?: boolean;
        wrapExecutionEvents?: boolean;
        wrapCompletionEvents?: boolean;
    };
    /** Protocol management integration settings */
    protocolManagement?: {
        enabled: boolean;
        wrapCommunicationEvents?: boolean;
        wrapTopologyEvents?: boolean;
        wrapLifecycleEvents?: boolean;
        wrapCoordinationEvents?: boolean;
    };
    /** Performance optimization settings */
    performance?: {
        enableSwarmCorrelation?: boolean;
        enableAgentTracking?: boolean;
        enableTaskMetrics?: boolean;
        maxConcurrentCoordinations?: number;
        coordinationTimeout?: number;
        enablePerformanceTracking?: boolean;
    };
    /** Coordination correlation configuration */
    coordination?: {
        enabled: boolean;
        strategy: 'swarm' | 'agent' | 'task' | 'topology' | 'custom';
        correlationTTL: number;
        maxCorrelationDepth: number;
        correlationPatterns: string[];
        trackAgentCommunication: boolean;
        trackSwarmHealth: boolean;
    };
    /** Agent health monitoring configuration */
    agentHealthMonitoring?: {
        enabled: boolean;
        healthCheckInterval: number;
        agentHealthThresholds: Record<string, number>;
        swarmHealthThresholds: Record<string, number>;
        autoRecoveryEnabled: boolean;
    };
    /** Swarm optimization configuration */
    swarmOptimization?: {
        enabled: boolean;
        optimizationInterval: number;
        performanceThresholds: {
            latency: number;
            throughput: number;
            reliability: number;
        };
        autoScaling: boolean;
        loadBalancing: boolean;
    };
}
/**
 * Coordination correlation entry for tracking related events.
 *
 * @example
 */
interface CoordinationCorrelation {
    correlationId: string;
    events: CoordinationEvent[];
    startTime: Date;
    lastUpdate: Date;
    swarmId?: string;
    agentIds: string[];
    taskIds: string[];
    operation: string;
    status: 'active' | 'completed' | 'failed' | 'timeout';
    performance: {
        totalLatency: number;
        coordinationEfficiency: number;
        resourceUtilization: number;
    };
    metadata: Record<string, any>;
}
/**
 * Coordination health tracking entry.
 *
 * @example
 */
interface CoordinationHealthEntry {
    component: string;
    componentType: 'swarm' | 'agent' | 'orchestrator' | 'protocol';
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    consecutiveFailures: number;
    coordinationLatency: number;
    throughput: number;
    reliability: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        network: number;
    };
    agentCount?: number;
    activeTaskCount?: number;
    metadata: Record<string, any>;
}
/**
 * Unified Coordination Event Adapter.
 *
 * Provides a unified interface to coordination-level EventEmitter patterns.
 * While implementing the IEventManager interface for UEL compatibility.
 *
 * Features:
 * - Swarm lifecycle and coordination event management
 * - Agent management and health monitoring
 * - Task distribution and execution tracking
 * - Inter-swarm communication and protocol management
 * - Performance monitoring for coordination operations
 * - Event correlation and pattern detection for coordination workflows
 * - Unified configuration management for coordination components
 * - Health monitoring and auto-recovery for coordination failures
 * - Event forwarding and transformation for coordination events
 * - Error handling with retry logic for coordination operations.
 *
 * @example
 */
export declare class CoordinationEventAdapter implements IEventManager {
    readonly config: CoordinationEventAdapterConfig;
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
    private swarmCoordinators;
    private agentManagers;
    private orchestrators;
    private coordinationCorrelations;
    private coordinationHealth;
    private metrics;
    private subscriptions;
    private filters;
    private transforms;
    private eventQueue;
    private processingEvents;
    private eventHistory;
    private swarmMetrics;
    private agentMetrics;
    private taskMetrics;
    private coordinationPatterns;
    constructor(config: CoordinationEventAdapterConfig);
    /**
     * Start the coordination event adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the coordination event adapter.
     */
    stop(): Promise<void>;
    /**
     * Restart the coordination event adapter.
     */
    restart(): Promise<void>;
    /**
     * Check if the adapter is running.
     */
    isRunning(): boolean;
    /**
     * Emit a coordination event with correlation and performance tracking.
     *
     * @param event
     * @param options
     */
    emit<T extends CoordinationEvent>(event: T, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit batch of coordination events with optimized processing.
     *
     * @param batch
     * @param options
     */
    emitBatch<T extends CoordinationEvent>(batch: EventBatch<T>, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit coordination event immediately without queuing.
     *
     * @param event
     */
    emitImmediate<T extends CoordinationEvent>(event: T): Promise<T>;
    /**
     * Subscribe to coordination events with filtering and transformation.
     *
     * @param eventTypes
     * @param listener
     * @param options
     */
    subscribe<T extends CoordinationEvent>(eventTypes: string | string[], listener: EventListener<T>, options?: Partial<EventSubscription<T>>): string;
    /**
     * Unsubscribe from coordination events.
     *
     * @param subscriptionId
     */
    unsubscribe(subscriptionId: string): boolean;
    /**
     * Unsubscribe all coordination listeners for event type.
     *
     * @param eventType
     */
    unsubscribeAll(eventType?: string): number;
    /**
     * Add coordination event filter.
     *
     * @param filter
     */
    addFilter(filter: EventFilter): string;
    /**
     * Remove coordination event filter.
     *
     * @param filterId
     */
    removeFilter(filterId: string): boolean;
    /**
     * Add coordination event transform.
     *
     * @param transform
     */
    addTransform(transform: EventTransform): string;
    /**
     * Remove coordination event transform.
     *
     * @param transformId
     */
    removeTransform(transformId: string): boolean;
    /**
     * Query coordination event history with filtering and pagination.
     *
     * @param options
     */
    query<T extends CoordinationEvent>(options: EventQueryOptions): Promise<T[]>;
    /**
     * Get coordination event history for specific event type.
     *
     * @param eventType
     * @param limit
     */
    getEventHistory(eventType: string, limit?: number): Promise<CoordinationEvent[]>;
    /**
     * Perform health check on the coordination event adapter.
     */
    healthCheck(): Promise<EventManagerStatus>;
    /**
     * Get performance metrics for the coordination adapter.
     */
    getMetrics(): Promise<EventManagerMetrics>;
    /**
     * Get active coordination subscriptions.
     */
    getSubscriptions(): EventSubscription[];
    /**
     * Update adapter configuration.
     *
     * @param config
     */
    updateConfig(config: Partial<CoordinationEventAdapterConfig>): void;
    /**
     * Event handler management (EventEmitter compatibility).
     *
     * @param event
     * @param handler.
     * @param handler
     */
    on(event: 'start' | 'stop' | 'error' | 'subscription' | 'emission', handler: (...args: any[]) => void): void;
    off(event: string, handler?: (...args: any[]) => void): void;
    once(event: string, handler: (...args: any[]) => void): void;
    /**
     * Cleanup and destroy the adapter.
     */
    destroy(): Promise<void>;
    /**
     * Emit swarm coordination event with enhanced tracking.
     *
     * @param event
     */
    emitSwarmCoordinationEvent(event: Omit<CoordinationEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Subscribe to swarm lifecycle events with convenience.
     *
     * @param listener
     */
    subscribeSwarmLifecycleEvents(listener: EventListener<CoordinationEvent>): string;
    /**
     * Subscribe to agent management events.
     *
     * @param listener
     */
    subscribeAgentManagementEvents(listener: EventListener<CoordinationEvent>): string;
    /**
     * Subscribe to task orchestration events.
     *
     * @param listener
     */
    subscribeTaskOrchestrationEvents(listener: EventListener<CoordinationEvent>): string;
    /**
     * Subscribe to topology management events.
     *
     * @param listener
     */
    subscribeTopologyEvents(listener: EventListener<CoordinationEvent>): string;
    /**
     * Get coordination health status for all components.
     */
    getCoordinationHealthStatus(): Promise<Record<string, CoordinationHealthEntry>>;
    /**
     * Get correlated coordination events for a specific correlation ID.
     *
     * @param correlationId
     */
    getCoordinationCorrelatedEvents(correlationId: string): CoordinationCorrelation | null;
    /**
     * Get active coordination correlations.
     */
    getActiveCoordinationCorrelations(): CoordinationCorrelation[];
    /**
     * Get swarm performance metrics.
     *
     * @param swarmId
     */
    getSwarmMetrics(swarmId?: string): Record<string, any>;
    /**
     * Get agent performance metrics.
     *
     * @param agentId
     */
    getAgentMetrics(agentId?: string): Record<string, any>;
    /**
     * Get task execution metrics.
     *
     * @param taskId
     */
    getTaskMetrics(taskId?: string): Record<string, any>;
    /**
     * Force health check on all wrapped coordination components.
     */
    performCoordinationHealthCheck(): Promise<Record<string, CoordinationHealthEntry>>;
    /**
     * Initialize coordination component integrations.
     */
    private initializeCoordinationIntegrations;
    /**
     * Wrap SwarmCoordinator events with UEL integration.
     */
    private wrapSwarmCoordinators;
    /**
     * Wrap AgentManager events with UEL integration.
     */
    private wrapAgentManagers;
    /**
     * Wrap Orchestrator events with UEL integration.
     */
    private wrapOrchestrators;
    /**
     * Wrap Protocol Manager events with UEL integration.
     */
    private wrapProtocolManagers;
    /**
     * Unwrap all coordination components.
     */
    private unwrapCoordinationComponents;
    /**
     * Process coordination event emission with correlation and filtering.
     *
     * @param event
     * @param options
     * @param _options
     */
    private processCoordinationEventEmission;
    /**
     * Start event processing loop for coordination events.
     */
    private startEventProcessing;
    /**
     * Start health monitoring for coordination components.
     */
    private startCoordinationHealthMonitoring;
    /**
     * Start coordination correlation cleanup to prevent memory leaks.
     */
    private startCoordinationCorrelationCleanup;
    /**
     * Start swarm optimization if enabled.
     */
    private startSwarmOptimization;
    /**
     * Start coordination event correlation for tracking related events.
     *
     * @param event
     */
    private startCoordinationEventCorrelation;
    /**
     * Update existing coordination event correlation.
     *
     * @param event
     */
    private updateCoordinationEventCorrelation;
    /**
     * Check if coordination correlation is complete based on patterns.
     *
     * @param correlation
     */
    private isCoordinationCorrelationComplete;
    /**
     * Calculate coordination efficiency for correlation.
     *
     * @param correlation
     */
    private calculateCoordinationEfficiency;
    /**
     * Check health of all coordination components.
     */
    private checkCoordinationComponentHealth;
    /**
     * Batch processing methods for different strategies.
     *
     * @param batch
     * @param options
     */
    private processCoordinationBatchImmediate;
    private processCoordinationBatchQueued;
    private processCoordinationBatchBatched;
    private processCoordinationBatchThrottled;
    /**
     * Utility methods for coordination event processing.
     *
     * @param event
     */
    private validateCoordinationEvent;
    private applyFilter;
    private applyTransform;
    private getEventSortValue;
    private extractCoordinationOperation;
    private extractTargetId;
    private extractSwarmId;
    private extractAgentId;
    private extractTaskId;
    private extractAgentIds;
    private extractTaskIds;
    private determineEventPriority;
    private updateComponentHealthMetrics;
    private updateCoordinationMetrics;
    private getActiveAgentCount;
    private getActiveTaskCount;
    private recordCoordinationEventMetrics;
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
 * Factory function for creating CoordinationEventAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createCoordinationEventAdapter(config: CoordinationEventAdapterConfig): CoordinationEventAdapter;
/**
 * Helper function for creating default coordination event adapter configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultCoordinationEventAdapterConfig(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): CoordinationEventAdapterConfig;
/**
 * Helper functions for coordination event operations.
 */
export declare const CoordinationEventHelpers: {
    /**
     * Create swarm initialization event.
     *
     * @param swarmId
     * @param topology
     * @param details
     */
    createSwarmInitEvent(swarmId: string, topology: string, details?: any): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create agent spawn event.
     *
     * @param agentId
     * @param swarmId
     * @param details
     */
    createAgentSpawnEvent(agentId: string, swarmId: string, details?: any): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create task distribution event.
     *
     * @param taskId
     * @param assignedTo
     * @param details
     */
    createTaskDistributionEvent(taskId: string, assignedTo: string[], details?: any): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create topology change event.
     *
     * @param swarmId
     * @param topology
     * @param details
     */
    createTopologyChangeEvent(swarmId: string, topology: string, details?: any): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create coordination error event.
     *
     * @param component
     * @param targetId
     * @param error
     * @param details
     */
    createCoordinationErrorEvent(component: string, targetId: string, error: Error, details?: any): Omit<CoordinationEvent, "id" | "timestamp">;
};
export default CoordinationEventAdapter;
//# sourceMappingURL=coordination-event-adapter.d.ts.map