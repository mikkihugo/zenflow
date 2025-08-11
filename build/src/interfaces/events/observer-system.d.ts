/**
 * @file Observer Pattern Implementation for Real-Time Event System
 * Provides type-safe event handling with priority management and error recovery.
 */
import { EventEmitter } from 'node:events';
export interface SystemEvent {
    id: string;
    timestamp: Date;
    source: string;
    type: string;
    metadata?: Record<string, any>;
}
export interface SwarmEvent extends SystemEvent {
    type: 'swarm';
    swarmId: string;
    agentCount: number;
    status: SwarmStatus;
    topology: SwarmTopology;
    metrics: SwarmMetrics;
    operation: 'init' | 'update' | 'destroy' | 'coordinate';
}
export interface MCPEvent extends SystemEvent {
    type: 'mcp';
    toolName: string;
    executionTime: number;
    result: ToolResult;
    protocol: 'http' | 'stdio';
    operation: 'execute' | 'validate' | 'error';
    requestId: string;
}
export interface NeuralEvent extends SystemEvent {
    type: 'neural';
    modelId: string;
    operation: 'train' | 'predict' | 'evaluate' | 'optimize';
    accuracy?: number;
    loss?: number;
    dataSize?: number;
    processingTime: number;
}
export interface DatabaseEvent extends SystemEvent {
    type: 'database';
    operation: 'query' | 'insert' | 'update' | 'delete' | 'index';
    tableName: string;
    recordCount: number;
    queryTime: number;
    success: boolean;
}
export interface MemoryEvent extends SystemEvent {
    type: 'memory';
    operation: 'store' | 'retrieve' | 'delete' | 'cleanup';
    key: string;
    size?: number;
    hit?: boolean;
    ttl?: number;
}
export interface InterfaceEvent extends SystemEvent {
    type: 'interface';
    interface: 'web' | 'cli' | 'tui' | 'api';
    operation: 'start' | 'stop' | 'request' | 'response' | 'error';
    endpoint?: string;
    statusCode?: number;
    responseTime?: number;
}
export type AllSystemEvents = SwarmEvent | MCPEvent | NeuralEvent | DatabaseEvent | MemoryEvent | InterfaceEvent;
export type EventPriority = 'critical' | 'high' | 'medium' | 'low';
export type ObserverType = 'websocket' | 'database' | 'logger' | 'metrics' | 'notification' | 'custom';
export interface SwarmStatus {
    healthy: boolean;
    activeAgents: number;
    completedTasks: number;
    errors: string[];
}
export interface SwarmMetrics {
    latency: number;
    throughput: number;
    reliability: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        network: number;
    };
}
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    warnings?: string[];
}
export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';
export interface SystemObserver<T extends SystemEvent = SystemEvent> {
    update(event: T): void | Promise<void>;
    getObserverType(): ObserverType;
    getPriority(): EventPriority;
    getEventTypes(): string[];
    isHealthy(): boolean;
    handleError?(error: Error, event: T): void;
}
export declare class WebSocketObserver implements SystemObserver<SwarmEvent | MCPEvent | InterfaceEvent> {
    private logger?;
    private connections;
    private healthy;
    constructor(logger?: any | undefined);
    addConnection(socket: any): void;
    removeConnection(socket: any): void;
    update(event: SwarmEvent | MCPEvent | InterfaceEvent): void;
    getObserverType(): ObserverType;
    getPriority(): EventPriority;
    getEventTypes(): string[];
    isHealthy(): boolean;
    handleError(error: Error, event: SwarmEvent | MCPEvent | InterfaceEvent): void;
    private formatEventForWebSocket;
}
export declare class DatabaseObserver implements SystemObserver<SystemEvent> {
    private dbService;
    private logger?;
    private healthy;
    private batchSize;
    private eventBatch;
    private flushInterval;
    constructor(dbService: any, logger?: any | undefined, batchSize?: number);
    update(event: SystemEvent): void;
    getObserverType(): ObserverType;
    getPriority(): EventPriority;
    getEventTypes(): string[];
    isHealthy(): boolean;
    destroy(): Promise<void>;
    private flushBatch;
    private updateMetrics;
}
export declare class LoggerObserver implements SystemObserver<SystemEvent> {
    private logger;
    private healthy;
    constructor(logger: any);
    update(event: SystemEvent): void;
    getObserverType(): ObserverType;
    getPriority(): EventPriority;
    getEventTypes(): string[];
    isHealthy(): boolean;
    private getLogLevel;
    private formatLogMessage;
}
export declare class MetricsObserver implements SystemObserver<SystemEvent> {
    private metricsService?;
    private healthy;
    private metrics;
    constructor(metricsService?: any | undefined);
    update(event: SystemEvent): void;
    getObserverType(): ObserverType;
    getPriority(): EventPriority;
    getEventTypes(): string[];
    isHealthy(): boolean;
    getMetrics(): Map<string, any>;
    private collectMetrics;
    private recordExecutionTime;
}
export declare class SystemEventManager extends EventEmitter {
    private logger?;
    private observers;
    private eventQueue;
    private processing;
    private errorRecovery;
    private maxRetries;
    private retryDelay;
    constructor(logger?: any | undefined);
    subscribe<T extends SystemEvent>(eventType: T['type'], observer: SystemObserver<T>): void;
    unsubscribe<T extends SystemEvent>(eventType: T['type'], observer: SystemObserver<T>): void;
    notify<T extends SystemEvent>(event: T): Promise<void>;
    notifyImmediate<T extends SystemEvent>(event: T): Promise<void>;
    getObserverStats(): {
        type: string;
        count: number;
        healthy: number;
    }[];
    getQueueStats(): {
        size: number;
        processing: boolean;
    };
    clearQueue(): void;
    shutdown(): Promise<void>;
    private startEventProcessing;
    private processEventWithObservers;
    private safeUpdate;
    private getPriorityValue;
    private calculateEventPriority;
}
export declare class EventBuilder {
    static createSwarmEvent(swarmId: string, operation: SwarmEvent['operation'], status: SwarmStatus, topology: SwarmTopology, metrics: SwarmMetrics, source?: string): SwarmEvent;
    static createMCPEvent(toolName: string, operation: MCPEvent['operation'], executionTime: number, result: ToolResult, protocol: 'http' | 'stdio', requestId: string, source?: string): MCPEvent;
    static createNeuralEvent(modelId: string, operation: NeuralEvent['operation'], processingTime: number, options?: {
        accuracy?: number;
        loss?: number;
        dataSize?: number;
        source?: string;
    }): NeuralEvent;
}
//# sourceMappingURL=observer-system.d.ts.map