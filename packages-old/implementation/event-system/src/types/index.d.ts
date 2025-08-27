/**
 * @fileoverview Event System Type Definitions
 *
 * Comprehensive type definitions for the event system including
 * event patterns, manager types, and processing strategies.
 */
export * from '../core/interfaces-clean';
export type { SystemLifecycleEvent } from '../types';
export declare const EventTypePatterns: {
    readonly SYSTEM_LIFECYCLE: readonly ["system:startup", "system:shutdown", "system:error", "system:ready"];
    readonly USER_ACTIONS: readonly ["user:login", "user:logout", "user:action", "user:preference"];
    readonly WORKFLOW_EVENTS: readonly ["workflow:start", "workflow:complete", "workflow:error", "workflow:pause"];
    readonly DATABASE_EVENTS: readonly ["db:connect", "db:disconnect", "db:query", "db:error"];
    readonly API_EVENTS: readonly ["api:request", "api:response", "api:error", "api:timeout"];
    readonly NEURAL_EVENTS: readonly ["neural:process", "neural:complete", "neural:optimize", "neural:error"];
    readonly COORDINATION_EVENTS: readonly ["coord:start", "coord:sync", "coord:conflict", "coord:resolve"];
    readonly MONITORING_EVENTS: readonly ["monitor:metric", "monitor:alert", "monitor:health", "monitor:performance"];
};
export type EventPriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ProcessingStrategyType = 'immediate' | 'queued' | 'batched' | 'throttled';
export type ProcessingStrategy = ProcessingStrategyType;
export type BackoffStrategy = 'linear' | 'exponential' | 'fixed';
export type ReliabilityLevel = 'high' | 'medium' | 'low';
export interface ProcessingConfig {
    strategy: ProcessingStrategyType;
    batchSize?: number;
    throttleMs?: number;
    queueSize?: number;
}
export interface RetryConfig {
    attempts: number;
    delay: number;
    backoff: BackoffStrategy;
    maxDelay?: number;
}
export interface HealthConfig {
    enabled?: boolean;
    interval?: number;
    timeout?: number;
}
export type ManagerTypeDefinition = 'system' | 'coordination' | 'communication' | 'monitoring' | 'interface' | 'neural' | 'database' | 'memory' | 'workflow' | 'custom';
export interface EventMetadata {
    source?: string;
    timestamp?: Date;
    priority?: EventPriorityLevel;
    correlationId?: string;
    tags?: string[];
    context?: Record<string, unknown>;
}
export interface EventFilterCriteria {
    types?: string[];
    sources?: string[];
    priorities?: EventPriorityLevel[];
    tags?: string[];
    timeRange?: {
        start: Date;
        end: Date;
    };
    customFilter?: (event: any) => boolean;
}
export interface EventTransformation {
    mapper?: (event: any) => any;
    enricher?: (event: any) => Promise<any>;
    validator?: (event: any) => boolean;
    serializer?: (event: any) => string;
    deserializer?: (data: string) => any;
}
export interface SubscriptionConfig {
    eventTypes: string[];
    filter?: EventFilterCriteria;
    transform?: EventTransformation;
    priority?: EventPriorityLevel;
    active?: boolean;
    metadata?: Record<string, unknown>;
}
export interface ManagerConfiguration {
    name: string;
    type: ManagerTypeDefinition;
    maxListeners?: number;
    processing: {
        strategy: ProcessingStrategyType;
        batchSize?: number;
        throttleMs?: number;
        queueSize?: number;
    };
    retry?: {
        attempts: number;
        delay: number;
        backoff: 'linear' | 'exponential' | 'fixed';
        maxDelay?: number;
    };
    metadata?: Record<string, unknown>;
}
export interface EmissionOptions {
    priority?: EventPriorityLevel;
    correlationId?: string;
    timeout?: number;
    retry?: boolean;
    metadata?: Record<string, unknown>;
}
export interface BatchProcessingOptions {
    maxBatchSize?: number;
    maxWaitTime?: number;
    priority?: EventPriorityLevel;
    processingMode?: 'parallel' | 'sequential';
}
export interface HealthCheckResult {
    healthy: boolean;
    status: 'ok' | 'degraded' | 'critical';
    details?: {
        uptime?: number;
        eventsProcessed?: number;
        errorRate?: number;
        queueSize?: number;
        subscriptionCount?: number;
    };
    timestamp: Date;
}
export interface PerformanceMetrics {
    eventsPerSecond: number;
    averageProcessingTime: number;
    errorRate: number;
    queueUtilization: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
}
export interface EventSystemError {
    code: string;
    message: string;
    manager?: string;
    eventId?: string;
    timestamp: Date;
    cause?: Error;
    context?: Record<string, unknown>;
}
export interface FactoryConfiguration {
    defaultType: ManagerTypeDefinition;
    defaultProcessing: ProcessingStrategyType;
    maxManagers?: number;
    cleanupInterval?: number;
    healthCheckInterval?: number;
}
export interface MigrationOptions {
    preserveExistingListeners?: boolean;
    migrationMode?: 'passive' | 'active';
    backupEvents?: boolean;
    validateAfterMigration?: boolean;
}
export declare const TypeGuards: {
    readonly isEventPriority: (value: unknown) => value is EventPriorityLevel;
    readonly isProcessingStrategy: (value: unknown) => value is ProcessingStrategyType;
    readonly isManagerType: (value: unknown) => value is ManagerTypeDefinition;
    readonly hasEventMetadata: (event: any) => event is {
        metadata: EventMetadata;
    };
};
export interface MonitoringConfig {
    enabled?: boolean;
    interval?: number;
    metrics?: string[];
}
export interface BaseEvent {
    type: string;
    timestamp: Date;
}
export interface CoordinationEvent extends BaseEvent {
    type: 'coordination';
    operationId: string;
}
export interface CommunicationEvent extends BaseEvent {
    type: 'communication';
    protocol: string;
}
export interface MonitoringEvent extends BaseEvent {
    type: 'monitoring';
    metric: string;
}
export interface NeuralEvent extends BaseEvent {
    type: 'neural';
    operation: string;
}
export interface DatabaseEvent extends BaseEvent {
    type: 'database';
    operation: string;
}
export interface MemoryEvent extends BaseEvent {
    type: 'memory';
    operation: string;
}
export interface WorkflowEvent extends BaseEvent {
    type: 'workflow';
    workflowId: string;
}
export interface SafeEvent extends BaseEvent {
    type: 'safe';
    component: string;
}
export interface InterfaceEvent extends BaseEvent {
    type: 'interface';
    component: string;
}
export interface OrchestrationEvent extends BaseEvent {
    type: 'orchestration';
    phase: string;
}
export interface MemoryOrchestrationEvent extends BaseEvent {
    type: 'memory-orchestration';
    operation: string;
}
export interface UELEvent extends BaseEvent {
    type: 'uel';
    component: string;
}
export interface CoordinationTopology {
    nodes: string[];
    connections: Record<string, string[]>;
}
export interface CommunicationProtocol {
    name: string;
    version: string;
}
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export interface SubscriptionInfo {
    id: string;
    eventTypes: string[];
    active: boolean;
}
export interface ProcessingError extends Error {
    code: string;
    eventId?: string;
}
export interface EventSubscriptionError extends Error {
    subscriptionId: string;
    eventType: string;
}
export interface EventResult {
    success: boolean;
    eventId: string;
    timestamp: Date;
}
export interface EventProcessingResult extends EventResult {
    processingTime: number;
    status: ProcessingStatus;
}
export interface EventSubscriptionResult {
    subscriptionId: string;
    success: boolean;
    error?: string;
}
export interface EventSubscription {
    id: string;
    eventTypes: string[];
    active: boolean;
}
export interface EventError extends Error {
    code: string;
    eventId?: string;
}
export declare const EventCategories: {
    readonly SYSTEM: "system";
    readonly COORDINATION: "coordination";
    readonly COMMUNICATION: "communication";
    readonly MONITORING: "monitoring";
    readonly WORKFLOW: "workflow";
    readonly NEURAL: "neural";
    readonly DATABASE: "database";
    readonly MEMORY: "memory";
};
export declare const EventPriorityMap: {
    readonly CRITICAL: 0;
    readonly HIGH: 1;
    readonly MEDIUM: 2;
    readonly LOW: 3;
};
export declare const EventConstants: {
    readonly MAX_LISTENERS: 100;
    readonly DEFAULT_TIMEOUT: 5000;
    readonly RETRY_ATTEMPTS: 3;
};
export declare const DefaultEventManagerConfigs: {
    readonly system: {
        readonly name: "default-system";
        readonly type: "system";
        readonly maxListeners: 100;
        readonly processing: {
            readonly strategy: "immediate";
        };
    };
    readonly coordination: {
        readonly name: "default-coordination";
        readonly type: "coordination";
        readonly maxListeners: 50;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 1000;
        };
    };
    readonly communication: {
        readonly name: "default-communication";
        readonly type: "communication";
        readonly maxListeners: 75;
        readonly processing: {
            readonly strategy: "throttled";
            readonly throttleMs: 100;
        };
    };
    readonly monitoring: {
        readonly name: "default-monitoring";
        readonly type: "monitoring";
        readonly maxListeners: 200;
        readonly processing: {
            readonly strategy: "batched";
            readonly batchSize: 10;
        };
    };
    readonly interface: {
        readonly name: "default-interface";
        readonly type: "interface";
        readonly maxListeners: 50;
        readonly processing: {
            readonly strategy: "immediate";
        };
    };
    readonly neural: {
        readonly name: "default-neural";
        readonly type: "neural";
        readonly maxListeners: 25;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 500;
        };
    };
    readonly database: {
        readonly name: "default-database";
        readonly type: "database";
        readonly maxListeners: 100;
        readonly processing: {
            readonly strategy: "batched";
            readonly batchSize: 20;
        };
    };
    readonly memory: {
        readonly name: "default-memory";
        readonly type: "memory";
        readonly maxListeners: 150;
        readonly processing: {
            readonly strategy: "immediate";
        };
    };
    readonly workflow: {
        readonly name: "default-workflow";
        readonly type: "workflow";
        readonly maxListeners: 75;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 200;
        };
    };
};
export declare const UELTypeGuards: {
    readonly isEventPriority: (value: unknown) => value is EventPriorityLevel;
    readonly isProcessingStrategy: (value: unknown) => value is ProcessingStrategyType;
    readonly isManagerType: (value: unknown) => value is ManagerTypeDefinition;
    readonly hasEventMetadata: (event: any) => event is {
        metadata: EventMetadata;
    };
};
export declare const EventUtils: {
    readonly generateEventId: () => string;
    readonly generateCorrelationId: () => string;
    readonly createTimestamp: () => Date;
    readonly validateEventType: (type: string) => boolean;
    readonly extractEventCategory: (type: string) => string;
};
//# sourceMappingURL=index.d.ts.map