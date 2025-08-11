/**
 * @file UEL Communication Event Adapter providing unified event management for communication-related events.
 *
 * Unified Event Layer adapter for communication-related events, providing
 * a consistent interface to scattered EventEmitter patterns across the communication system.
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified communication functionality.
 *
 * This adapter follows the exact same patterns as the system and coordination event adapters,
 * implementing the IEventManager interface and providing unified configuration.
 * management for communication events across Claude-Zen.
 */
import type { EventBatch, EventEmissionOptions, EventFilter, EventListener, EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventManagerType, EventQueryOptions, EventSubscription, EventTransform, IEventManager, SystemEvent } from '../core/interfaces.ts';
import type { CommunicationEvent } from '../types.ts';
/**
 * Communication event adapter configuration extending UEL EventManagerConfig.
 *
 * @example
 */
export interface CommunicationEventAdapterConfig extends EventManagerConfig {
    /** WebSocket communication integration settings */
    websocketCommunication?: {
        enabled: boolean;
        wrapConnectionEvents?: boolean;
        wrapMessageEvents?: boolean;
        wrapHealthEvents?: boolean;
        wrapReconnectionEvents?: boolean;
        clients?: string[];
    };
    /** MCP protocol integration settings */
    mcpProtocol?: {
        enabled: boolean;
        wrapServerEvents?: boolean;
        wrapClientEvents?: boolean;
        wrapToolEvents?: boolean;
        wrapProtocolEvents?: boolean;
        servers?: string[];
        clients?: string[];
    };
    /** Protocol communication integration settings */
    protocolCommunication?: {
        enabled: boolean;
        wrapRoutingEvents?: boolean;
        wrapOptimizationEvents?: boolean;
        wrapFailoverEvents?: boolean;
        wrapSwitchingEvents?: boolean;
        protocols?: string[];
    };
    /** HTTP communication integration settings */
    httpCommunication?: {
        enabled: boolean;
        wrapRequestEvents?: boolean;
        wrapResponseEvents?: boolean;
        wrapTimeoutEvents?: boolean;
        wrapRetryEvents?: boolean;
    };
    /** Performance optimization settings */
    performance?: {
        enableConnectionCorrelation?: boolean;
        enableMessageTracking?: boolean;
        enableProtocolMetrics?: boolean;
        maxConcurrentConnections?: number;
        connectionTimeout?: number;
        enablePerformanceTracking?: boolean;
    };
    /** Communication correlation configuration */
    communication?: {
        enabled: boolean;
        strategy: 'websocket' | 'mcp' | 'http' | 'protocol' | 'custom';
        correlationTTL: number;
        maxCorrelationDepth: number;
        correlationPatterns: string[];
        trackMessageFlow: boolean;
        trackConnectionHealth: boolean;
    };
    /** Connection health monitoring configuration */
    connectionHealthMonitoring?: {
        enabled: boolean;
        healthCheckInterval: number;
        connectionHealthThresholds: Record<string, number>;
        protocolHealthThresholds: Record<string, number>;
        autoRecoveryEnabled: boolean;
    };
    /** Communication optimization configuration */
    communicationOptimization?: {
        enabled: boolean;
        optimizationInterval: number;
        performanceThresholds: {
            latency: number;
            throughput: number;
            reliability: number;
        };
        connectionPooling: boolean;
        messageCompression: boolean;
    };
}
/**
 * Communication correlation entry for tracking related events.
 *
 * @example
 */
interface CommunicationCorrelation {
    correlationId: string;
    events: CommunicationEvent[];
    startTime: Date;
    lastUpdate: Date;
    connectionId?: string | undefined;
    protocolType: string;
    messageIds: string[];
    operation: string;
    status: 'active' | 'completed' | 'failed' | 'timeout';
    performance: {
        totalLatency: number;
        communicationEfficiency: number;
        resourceUtilization: number;
    };
    metadata: Record<string, any>;
}
/**
 * Communication health tracking entry.
 *
 * @example
 */
interface CommunicationHealthEntry {
    component: string;
    componentType: 'websocket' | 'mcp-server' | 'mcp-client' | 'http' | 'protocol';
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    consecutiveFailures: number;
    communicationLatency: number;
    throughput: number;
    reliability: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        network: number;
    };
    connectionCount?: number;
    activeMessageCount?: number;
    metadata: Record<string, any>;
}
/**
 * Unified Communication Event Adapter.
 *
 * Provides a unified interface to communication-level EventEmitter patterns.
 * While implementing the IEventManager interface for UEL compatibility.
 *
 * Features:
 * - WebSocket connection lifecycle and message routing
 * - MCP protocol event management and tool execution tracking
 * - HTTP communication monitoring and optimization
 * - Inter-protocol communication and message routing
 * - Performance monitoring for communication operations
 * - Event correlation and pattern detection for communication workflows
 * - Unified configuration management for communication components
 * - Health monitoring and auto-recovery for communication failures
 * - Event forwarding and transformation for communication events
 * - Error handling with retry logic for communication operations.
 *
 * @example
 */
export declare class CommunicationEventAdapter implements IEventManager {
    readonly config: CommunicationEventAdapterConfig;
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
    private websocketClients;
    private mcpServers;
    private mcpClients;
    private communicationCorrelations;
    private communicationHealth;
    private metrics;
    private subscriptions;
    private filters;
    private transforms;
    private eventQueue;
    private processingEvents;
    private eventHistory;
    private connectionMetrics;
    private messageMetrics;
    private protocolMetrics;
    private communicationPatterns;
    constructor(config: CommunicationEventAdapterConfig);
    /**
     * Start the communication event adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the communication event adapter.
     */
    stop(): Promise<void>;
    /**
     * Restart the communication event adapter.
     */
    restart(): Promise<void>;
    /**
     * Check if the adapter is running.
     */
    isRunning(): boolean;
    /**
     * Emit a communication event with correlation and performance tracking.
     *
     * @param event
     * @param options
     */
    emit<T extends SystemEvent>(event: T, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit batch of communication events with optimized processing.
     *
     * @param batch
     * @param options
     */
    emitBatch<T extends SystemEvent>(batch: EventBatch<T>, options?: EventEmissionOptions): Promise<void>;
    /**
     * Emit communication event immediately without queuing.
     *
     * @param event
     */
    emitImmediate<T extends SystemEvent>(event: T): Promise<void>;
    /**
     * Subscribe to communication events with filtering and transformation.
     *
     * @param eventTypes
     * @param listener
     * @param options
     */
    subscribe<T extends SystemEvent>(eventTypes: string | string[], listener: EventListener<T>, options?: Partial<EventSubscription<T>>): string;
    /**
     * Unsubscribe from communication events.
     *
     * @param subscriptionId
     */
    unsubscribe(subscriptionId: string): boolean;
    /**
     * Unsubscribe all communication listeners for event type.
     *
     * @param eventType
     */
    unsubscribeAll(eventType?: string): number;
    /**
     * Add communication event filter.
     *
     * @param filter
     */
    addFilter(filter: EventFilter): string;
    /**
     * Remove communication event filter.
     *
     * @param filterId
     */
    removeFilter(filterId: string): boolean;
    /**
     * Add communication event transform.
     *
     * @param transform
     */
    addTransform(transform: EventTransform): string;
    /**
     * Remove communication event transform.
     *
     * @param transformId
     */
    removeTransform(transformId: string): boolean;
    /**
     * Query communication event history with filtering and pagination.
     *
     * @param options
     */
    query<T extends SystemEvent>(options: EventQueryOptions): Promise<T[]>;
    /**
     * Get communication event history for specific event type.
     *
     * @param eventType
     * @param limit
     */
    getEventHistory(eventType: string, limit?: number): Promise<CommunicationEvent[]>;
    /**
     * Perform health check on the communication event adapter.
     */
    healthCheck(): Promise<EventManagerStatus>;
    /**
     * Get performance metrics for the communication adapter.
     */
    getMetrics(): Promise<EventManagerMetrics>;
    /**
     * Get active communication subscriptions.
     */
    getSubscriptions(): EventSubscription[];
    /**
     * Update adapter configuration.
     *
     * @param config
     */
    updateConfig(config: Partial<CommunicationEventAdapterConfig>): void;
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
     * Emit WebSocket communication event with enhanced tracking.
     *
     * @param event
     */
    emitWebSocketCommunicationEvent(event: Omit<CommunicationEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Emit MCP protocol event with enhanced tracking.
     *
     * @param event
     */
    emitMCPProtocolEvent(event: Omit<CommunicationEvent, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Subscribe to WebSocket communication events with convenience.
     *
     * @param listener
     */
    subscribeWebSocketCommunicationEvents(listener: EventListener<CommunicationEvent>): string;
    /**
     * Subscribe to MCP protocol events.
     *
     * @param listener
     */
    subscribeMCPProtocolEvents(listener: EventListener<CommunicationEvent>): string;
    /**
     * Subscribe to HTTP communication events.
     *
     * @param listener
     */
    subscribeHTTPCommunicationEvents(listener: EventListener<CommunicationEvent>): string;
    /**
     * Subscribe to protocol communication events.
     *
     * @param listener
     */
    subscribeProtocolCommunicationEvents(listener: EventListener<CommunicationEvent>): string;
    /**
     * Get communication health status for all components.
     */
    getCommunicationHealthStatus(): Promise<Record<string, CommunicationHealthEntry>>;
    /**
     * Get correlated communication events for a specific correlation ID.
     *
     * @param correlationId
     */
    getCommunicationCorrelatedEvents(correlationId: string): CommunicationCorrelation | null;
    /**
     * Get active communication correlations.
     */
    getActiveCommunicationCorrelations(): CommunicationCorrelation[];
    /**
     * Get connection performance metrics.
     *
     * @param connectionId
     */
    getConnectionMetrics(connectionId?: string): Record<string, any>;
    /**
     * Get message performance metrics.
     *
     * @param messageId
     */
    getMessageMetrics(messageId?: string): Record<string, any>;
    /**
     * Get protocol execution metrics.
     *
     * @param protocolType
     */
    getProtocolMetrics(protocolType?: string): Record<string, any>;
    /**
     * Force health check on all wrapped communication components.
     */
    performCommunicationHealthCheck(): Promise<Record<string, CommunicationHealthEntry>>;
    /**
     * Initialize communication component integrations.
     */
    private initializeCommunicationIntegrations;
    /**
     * Wrap WebSocket client events with UEL integration.
     */
    private wrapWebSocketClients;
    /**
     * Wrap MCP server events with UEL integration.
     */
    private wrapMCPServers;
    /**
     * Wrap MCP client events with UEL integration.
     */
    private wrapMCPClients;
    /**
     * Wrap HTTP communication events with UEL integration.
     */
    private wrapHTTPCommunication;
    /**
     * Wrap protocol communication events with UEL integration.
     */
    private wrapProtocolCommunication;
    /**
     * Unwrap all communication components.
     */
    private unwrapCommunicationComponents;
    /**
     * Process communication event emission with correlation and filtering.
     *
     * @param event
     * @param options
     * @param _options
     */
    private processCommunicationEventEmission;
    /**
     * Start event processing loop for communication events.
     */
    private startEventProcessing;
    /**
     * Start health monitoring for communication components.
     */
    private startCommunicationHealthMonitoring;
    /**
     * Start communication correlation cleanup to prevent memory leaks.
     */
    private startCommunicationCorrelationCleanup;
    /**
     * Start communication optimization if enabled.
     */
    private startCommunicationOptimization;
    /**
     * Start communication event correlation for tracking related events.
     *
     * @param event
     */
    private startCommunicationEventCorrelation;
    /**
     * Update existing communication event correlation.
     *
     * @param event
     */
    private updateCommunicationEventCorrelation;
    /**
     * Check if communication correlation is complete based on patterns.
     *
     * @param correlation
     */
    private isCommunicationCorrelationComplete;
    /**
     * Calculate communication efficiency for correlation.
     *
     * @param correlation
     */
    private calculateCommunicationEfficiency;
    /**
     * Check health of all communication components.
     */
    private checkCommunicationComponentHealth;
    /**
     * Batch processing methods for different strategies.
     *
     * @param batch
     * @param options
     */
    private processCommunicationBatchImmediate;
    private processCommunicationBatchQueued;
    private processCommunicationBatchBatched;
    private processCommunicationBatchThrottled;
    private applyFilter;
    private applyTransform;
    private getEventSortValue;
    private extractCommunicationOperation;
    private extractProtocol;
    private extractConnectionId;
    private extractMessageId;
    private extractProtocolType;
    private extractMessageIds;
    private determineCommunicationEventPriority;
    private updateComponentHealthMetrics;
    private updateCommunicationMetrics;
    private getActiveConnectionCount;
    private getActiveMessageCount;
    private recordCommunicationEventMetrics;
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
 * Factory function for creating CommunicationEventAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createCommunicationEventAdapter(config: CommunicationEventAdapterConfig): CommunicationEventAdapter;
/**
 * Helper function for creating default communication event adapter configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultCommunicationEventAdapterConfig(name: string, overrides?: Partial<CommunicationEventAdapterConfig>): CommunicationEventAdapterConfig;
/**
 * Helper functions for communication event operations.
 */
export declare const CommunicationEventHelpers: {
    /**
     * Create WebSocket connection event.
     *
     * @param connectionId
     * @param url
     * @param details
     */
    createWebSocketConnectionEvent(connectionId: string, url: string, details?: any): Omit<CommunicationEvent, "id" | "timestamp">;
    /**
     * Create MCP tool execution event.
     *
     * @param toolName
     * @param requestId
     * @param details
     */
    createMCPToolExecutionEvent(toolName: string, requestId: string, details?: any): Omit<CommunicationEvent, "id" | "timestamp">;
    /**
     * Create HTTP request event.
     *
     * @param method
     * @param url
     * @param details
     */
    createHTTPRequestEvent(method: string, url: string, details?: any): Omit<CommunicationEvent, "id" | "timestamp">;
    /**
     * Create protocol switching event.
     *
     * @param fromProtocol
     * @param toProtocol
     * @param details
     */
    createProtocolSwitchingEvent(fromProtocol: string, toProtocol: string, details?: any): Omit<CommunicationEvent, "id" | "timestamp">;
    /**
     * Create communication error event.
     *
     * @param component
     * @param protocol
     * @param error
     * @param details
     */
    createCommunicationErrorEvent(component: string, protocol: string, error: Error, details?: any): Omit<CommunicationEvent, "id" | "timestamp">;
};
export default CommunicationEventAdapter;
//# sourceMappingURL=communication-event-adapter.d.ts.map