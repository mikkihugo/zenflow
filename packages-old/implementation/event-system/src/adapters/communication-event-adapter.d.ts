/**
 * @file UEL Communication Event Adapter providing unified event management for communication-related events.
 *
 * Unified Event Layer adapter for communication-related events, providing
 * a consistent interface to scattered EventEmitter patterns across the communication system.
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified communication functionality.
 */
import { EventEmitter } from '@claude-zen/foundation';
interface CommunicationEventConfig {
    enableCorrelation?: boolean;
    enableHealthMonitoring?: boolean;
    enablePerformanceTracking?: boolean;
    connection?: {
        maxRetries?: number;
        timeout?: number;
        maxConcurrentConnections?: number;
        connectionTimeout?: number;
        enablePerformanceTracking?: boolean;
    };
    communication?: {
        enabled: boolean;
        strategy: 'websocket' | 'rpc' | 'http' | 'protocol' | 'custom';
        correlationTTL: number;
        maxCorrelationDepth: number;
        correlationPatterns: string[];
        trackMessageFlow: boolean;
        trackConnectionHealth: boolean;
    };
    healthMonitoring?: {
        enabled: boolean;
        interval: number;
        maxConsecutiveFailures: number;
        componentTypes: string[];
    };
    performance?: {
        enabled: boolean;
        trackLatency: boolean;
        trackThroughput: boolean;
        trackReliability: boolean;
        retentionPeriod: number;
    };
}
interface CommunicationCorrelation {
    correlationId: string;
    events: any[];
    startTime: Date;
    lastUpdate: Date;
    connectionId?: string;
    protocolType: string;
    messageIds: string[];
    operation: string;
    status: 'active' | 'completed' | 'failed' | 'timeout';
    performance: {
        totalLatency: number;
        communicationEfficiency: number;
        resourceUtilization: number;
    };
    metadata: Record<string, unknown>;
}
interface CommunicationHealthEntry {
    component: string;
    componentType: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin' | 'protocol';
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
    metadata: Record<string, unknown>;
}
interface WrappedCommunicationComponent {
    component: unknown;
    componentType: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin' | 'protocol';
    wrapper: EventEmitter;
    originalMethods: Map<string, Function>;
    eventMappings: Map<string, string>;
    isActive: boolean;
    healthMetrics: {
        lastSeen: Date;
        communicationCount: number;
        errorCount: number;
        latencySum: number;
        throughput: number;
    };
}
/**
 * Communication Event Adapter
 *
 * Provides unified event management for communication-related events
 * with correlation tracking, health monitoring, and performance analytics.
 */
export declare class CommunicationEventAdapter extends EventEmitter {
    private readonly logger;
    private readonly adapterConfig;
    private readonly correlations;
    private readonly healthEntries;
    private readonly wrappedComponents;
    constructor(config?: CommunicationEventConfig);
    /**
     * Initialize the communication event adapter
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the communication event adapter
     */
    shutdown(): Promise<void>;
    /**
     * Wrap a communication component for event management
     */
    wrapComponent(componentId: string, component: any, componentType: string): WrappedCommunicationComponent;
    /**
     * Start correlation tracking for communication events
     */
    startCorrelation(correlationId: string, operation: string, protocolType: string): void;
    /**
     * Update health status for a communication component
     */
    updateHealthStatus(componentId: string, status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'): void;
    /**
     * Record communication performance metrics
     */
    recordPerformanceMetrics(componentId: string, latency: number, throughput: number): void;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Start performance tracking
     */
    private startPerformanceTracking;
    /**
     * Perform health check on all wrapped components
     */
    private performHealthCheck;
    /**
     * Get correlation by ID
     */
    getCorrelation(correlationId: string): CommunicationCorrelation | undefined;
    /**
     * Get health entry by component ID
     */
    getHealthEntry(componentId: string): CommunicationHealthEntry | undefined;
    /**
     * Get wrapped component by ID
     */
    getWrappedComponent(componentId: string): WrappedCommunicationComponent | undefined;
    /**
     * Get current statistics
     */
    getStatistics(): {
        activeCorrelations: number;
        healthEntries: number;
        wrappedComponents: number;
        uptime: number;
    };
}
export declare function createCommunicationEventAdapter(config?: CommunicationEventConfig): CommunicationEventAdapter;
export default CommunicationEventAdapter;
//# sourceMappingURL=communication-event-adapter.d.ts.map