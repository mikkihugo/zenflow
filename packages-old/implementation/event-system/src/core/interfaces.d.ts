/**
 * @file UEL (Unified Event Layer) Core Interfaces - Clean Version
 *
 * Provides unified abstractions for all event management implementations
 */
export type EventPriority = 'critical' | 'high' | 'medium' | 'low';
export type EventProcessingStrategy = 'immediate' | 'queued' | 'batched' | 'throttled';
export interface SystemEvent {
    id: string;
    timestamp: Date;
    source: string;
    type: string;
    payload: Record<string, unknown>;
    priority?: EventPriority;
    metadata?: Record<string, unknown>;
    correlationId?: string;
    parentEventId?: string;
    sequence?: number;
}
export type EventListener<T extends SystemEvent = SystemEvent> = (event: T) => void | Promise<void>;
export interface EventFilter {
    types?: string[];
    sources?: string[];
    priorities?: EventPriority[];
    metadata?: Record<string, unknown>;
    customFilter?: (event: SystemEvent) => boolean;
}
export interface EventTransform {
    mapper?: (event: SystemEvent) => SystemEvent;
    enricher?: (event: SystemEvent) => Promise<SystemEvent>;
    validator?: (event: SystemEvent) => boolean;
}
export interface EventRetryConfig {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential' | 'fixed';
    maxDelay?: number;
    retryCondition?: (error: unknown, event: SystemEvent) => boolean;
}
export interface EventManagerConfig {
    name: string;
    type: EventManagerType;
    enabled?: boolean;
    maxListeners?: number;
    processing: {
        strategy: EventProcessingStrategy;
        batchSize?: number;
        throttleMs?: number;
        queueSize?: number;
    };
    retry?: EventRetryConfig;
    metadata?: Record<string, unknown>;
}
export interface EventSubscription<T extends SystemEvent = SystemEvent> {
    id: string;
    eventTypes: string[];
    listener: EventListener<T>;
    filter?: EventFilter;
    transform?: EventTransform;
    priority: EventPriority;
    created: Date;
    active: boolean;
    metadata?: Record<string, unknown>;
}
export interface EventManager {
    readonly config: EventManagerConfig;
    readonly name: string;
    readonly type: EventManagerType;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    isRunning(): boolean;
    emit<T extends SystemEvent>(event: T): Promise<void>;
    emitBatch<T extends SystemEvent>(events: T[]): Promise<void>;
    subscribe<T extends SystemEvent>(eventTypes: string | string[], listener: EventListener<T>): string;
    unsubscribe(subscriptionId: string): boolean;
    unsubscribeAll(eventType?: string): number;
    healthCheck(): Promise<EventManagerStatus>;
    getMetrics(): Promise<EventManagerMetrics>;
    destroy(): Promise<void>;
}
export interface EventManagerFactory<TConfig extends EventManagerConfig = EventManagerConfig> {
    create(config: TConfig): Promise<EventManager>;
    createMultiple(configs: TConfig[]): Promise<EventManager[]>;
    get(name: string): EventManager | undefined;
    list(): EventManager[];
    has(name: string): boolean;
    remove(name: string): Promise<boolean>;
}
export interface EventManagerStatus {
    name?: string;
    type?: EventManagerType;
    status?: string;
    lastCheck?: Date;
    isRunning: boolean;
    isHealthy: boolean;
    subscriptionCount: number;
    eventCount: number;
    errorCount: number;
    lastEventTime?: Date;
    uptime: number;
}
export interface EventManagerMetrics {
    name?: string;
    type?: EventManagerType;
    eventsEmitted: number;
    eventsReceived: number;
    eventsProcessed: number;
    eventsFailed?: number;
    subscriptionsCreated: number;
    subscriptionsRemoved: number;
    errorCount: number;
    averageProcessingTime: number;
    maxProcessingTime: number;
    minProcessingTime: number;
}
export type EventManagerType = 'system' | 'coordination' | 'communication' | 'monitoring' | 'interface' | 'neural' | 'database' | 'memory' | 'workflow' | 'custom';
export declare const EventManagerTypes: {
    readonly SYSTEM: "system";
    readonly COORDINATION: "coordination";
    readonly COMMUNICATION: "communication";
    readonly MONITORING: "monitoring";
    readonly INTERFACE: "interface";
    readonly NEURAL: "neural";
    readonly DATABASE: "database";
    readonly MEMORY: "memory";
    readonly WORKFLOW: "workflow";
    readonly CUSTOM: "custom";
};
export declare class EventError extends Error {
    readonly code: string;
    readonly manager: string;
    readonly eventId?: string;
    readonly cause?: Error;
    constructor(message: string, code: string, manager: string, eventId?: string, cause?: Error);
}
export declare class EventSubscriptionError extends EventError {
    constructor(manager: string, subscriptionId: string, cause?: Error);
}
export declare class EventEmissionError extends EventError {
    constructor(manager: string, eventId: string, cause?: Error);
}
export declare const EventTypeGuards: {
    readonly isEventManagerType: (value: unknown) => value is EventManagerType;
    readonly isEventPriority: (value: unknown) => value is EventPriority;
    readonly isSystemEvent: (value: unknown) => value is SystemEvent;
};
export declare const EventManagerPresets: {
    readonly REAL_TIME: {
        readonly processing: {
            readonly strategy: EventProcessingStrategy;
            readonly queueSize: 1000;
        };
    };
    readonly BATCH_PROCESSING: {
        readonly processing: {
            readonly strategy: EventProcessingStrategy;
            readonly batchSize: 100;
            readonly queueSize: 10000;
        };
    };
    readonly HIGH_THROUGHPUT: {
        readonly processing: {
            readonly strategy: EventProcessingStrategy;
            readonly queueSize: 50000;
        };
    };
};
export type { SystemLifecycleEvent } from '../types';
//# sourceMappingURL=interfaces.d.ts.map