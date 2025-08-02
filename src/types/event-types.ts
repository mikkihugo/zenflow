/**
 * Event System Type Definitions
 *
 * Comprehensive TypeScript types for the event bus system.
 * Replaces loose 'any' types with strict, type-safe interfaces.
 * Following Google TypeScript Style Guide.
 *
 * @fileoverview Strict event system type definitions
 */

/**
 * Base event payload structure
 */
export interface BaseEventPayload {
  readonly timestamp: Date;
  readonly source: string;
  readonly id: string;
  readonly version: string;
}

/**
 * System events
 */
export interface SystemEvents {
  'system:started': SystemStartedPayload;
  'system:stopped': SystemStoppedPayload;
  'system:error': SystemErrorPayload;
  'system:health:changed': SystemHealthChangedPayload;
}

export interface SystemStartedPayload extends BaseEventPayload {
  readonly config: SystemConfig;
  readonly modules: readonly string[];
}

export interface SystemStoppedPayload extends BaseEventPayload {
  readonly reason: 'shutdown' | 'error' | 'restart';
  readonly uptime: number;
}

export interface SystemErrorPayload extends BaseEventPayload {
  readonly error: SystemError;
  readonly context?: SystemErrorContext;
}

export interface SystemHealthChangedPayload extends BaseEventPayload {
  readonly previousState: HealthState;
  readonly currentState: HealthState;
  readonly services: ServiceHealthMap;
}

/**
 * Workflow events
 */
export interface WorkflowEvents {
  'workflow:started': WorkflowStartedPayload;
  'workflow:completed': WorkflowCompletedPayload;
  'workflow:failed': WorkflowFailedPayload;
  'workflow:paused': WorkflowPausedPayload;
  'workflow:resumed': WorkflowResumedPayload;
  'workflow:cancelled': WorkflowCancelledPayload;
  'workflow:step:started': WorkflowStepStartedPayload;
  'workflow:step:completed': WorkflowStepCompletedPayload;
  'workflow:step:failed': WorkflowStepFailedPayload;
}

export interface WorkflowStartedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly workflowName: string;
  readonly context: WorkflowEventContext;
}

export interface WorkflowCompletedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly duration: number;
  readonly results: WorkflowResults;
}

export interface WorkflowFailedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly error: WorkflowEventError;
  readonly stepIndex?: number;
}

export interface WorkflowPausedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly reason: string;
}

export interface WorkflowResumedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
}

export interface WorkflowCancelledPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly reason: string;
  readonly stepIndex: number;
}

export interface WorkflowStepStartedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly stepType: string;
}

export interface WorkflowStepCompletedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly duration: number;
  readonly result: StepEventResult;
}

export interface WorkflowStepFailedPayload extends BaseEventPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly error: WorkflowEventError;
  readonly retryCount: number;
}

/**
 * Coordination events
 */
export interface CoordinationEvents {
  'agent:created': AgentCreatedPayload;
  'agent:destroyed': AgentDestroyedPayload;
  'agent:status:changed': AgentStatusChangedPayload;
  'task:assigned': TaskAssignedPayload;
  'task:completed': TaskCompletedPayload;
  'task:failed': TaskFailedPayload;
  'swarm:initialized': SwarmInitializedPayload;
  'swarm:topology:changed': SwarmTopologyChangedPayload;
}

export interface AgentCreatedPayload extends BaseEventPayload {
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly capabilities: readonly string[];
}

export interface AgentDestroyedPayload extends BaseEventPayload {
  readonly agentId: string;
  readonly reason: 'shutdown' | 'error' | 'timeout';
  readonly uptime: number;
}

export interface AgentStatusChangedPayload extends BaseEventPayload {
  readonly agentId: string;
  readonly previousStatus: AgentStatus;
  readonly currentStatus: AgentStatus;
  readonly reason?: string;
}

export interface TaskAssignedPayload extends BaseEventPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly taskType: string;
  readonly priority: number;
}

export interface TaskCompletedPayload extends BaseEventPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly duration: number;
  readonly result: TaskEventResult;
}

export interface TaskFailedPayload extends BaseEventPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly error: TaskEventError;
  readonly retryCount: number;
}

export interface SwarmInitializedPayload extends BaseEventPayload {
  readonly swarmId: string;
  readonly topology: SwarmTopology;
  readonly agentCount: number;
}

export interface SwarmTopologyChangedPayload extends BaseEventPayload {
  readonly swarmId: string;
  readonly previousTopology: SwarmTopology;
  readonly currentTopology: SwarmTopology;
  readonly affectedAgents: readonly string[];
}

/**
 * Neural events
 */
export interface NeuralEvents {
  'neural:network:created': NeuralNetworkCreatedPayload;
  'neural:network:training:started': NeuralTrainingStartedPayload;
  'neural:network:training:completed': NeuralTrainingCompletedPayload;
  'neural:network:training:failed': NeuralTrainingFailedPayload;
  'neural:prediction:made': NeuralPredictionMadePayload;
}

export interface NeuralNetworkCreatedPayload extends BaseEventPayload {
  readonly networkId: string;
  readonly networkType: NeuralNetworkType;
  readonly layerCount: number;
  readonly parameterCount: number;
}

export interface NeuralTrainingStartedPayload extends BaseEventPayload {
  readonly networkId: string;
  readonly trainingId: string;
  readonly epochs: number;
  readonly dataSize: number;
}

export interface NeuralTrainingCompletedPayload extends BaseEventPayload {
  readonly networkId: string;
  readonly trainingId: string;
  readonly duration: number;
  readonly finalAccuracy: number;
  readonly finalLoss: number;
}

export interface NeuralTrainingFailedPayload extends BaseEventPayload {
  readonly networkId: string;
  readonly trainingId: string;
  readonly error: NeuralEventError;
  readonly epoch: number;
}

export interface NeuralPredictionMadePayload extends BaseEventPayload {
  readonly networkId: string;
  readonly inputSize: number;
  readonly outputSize: number;
  readonly confidence: number;
  readonly processingTime: number;
}

/**
 * Memory events
 */
export interface MemoryEvents {
  'memory:store:created': MemoryStoreCreatedPayload;
  'memory:key:set': MemoryKeySetPayload;
  'memory:key:get': MemoryKeyGetPayload;
  'memory:key:deleted': MemoryKeyDeletedPayload;
  'memory:sync:started': MemorySyncStartedPayload;
  'memory:sync:completed': MemorySyncCompletedPayload;
}

export interface MemoryStoreCreatedPayload extends BaseEventPayload {
  readonly storeId: string;
  readonly storeType: MemoryStoreType;
  readonly config: MemoryStoreConfig;
}

export interface MemoryKeySetPayload extends BaseEventPayload {
  readonly storeId: string;
  readonly key: string;
  readonly valueSize: number;
  readonly ttl?: number;
}

export interface MemoryKeyGetPayload extends BaseEventPayload {
  readonly storeId: string;
  readonly key: string;
  readonly hit: boolean;
  readonly responseTime: number;
}

export interface MemoryKeyDeletedPayload extends BaseEventPayload {
  readonly storeId: string;
  readonly key: string;
  readonly existed: boolean;
}

export interface MemorySyncStartedPayload extends BaseEventPayload {
  readonly storeId: string;
  readonly syncType: 'full' | 'incremental';
  readonly targetNodes: readonly string[];
}

export interface MemorySyncCompletedPayload extends BaseEventPayload {
  readonly storeId: string;
  readonly syncId: string;
  readonly duration: number;
  readonly changesApplied: number;
  readonly conflicts: number;
}

/**
 * Combined event map for type safety
 */
export type EventMap = SystemEvents &
  WorkflowEvents &
  CoordinationEvents &
  NeuralEvents &
  MemoryEvents;

/**
 * Event listener types
 */
export type EventListener<T extends keyof EventMap> = (
  payload: EventMap[T]
) => void | Promise<void>;

export type EventListenerAny = (payload: BaseEventPayload) => void | Promise<void>;

/**
 * Event middleware function
 */
export type EventMiddleware<T extends keyof EventMap = keyof EventMap> = (
  event: T,
  payload: EventMap[T],
  next: () => void | Promise<void>
) => void | Promise<void>;

/**
 * Supporting types
 */
export interface SystemConfig {
  readonly [key: string]: unknown;
}

export interface SystemError {
  readonly code: string;
  readonly message: string;
  readonly stack?: string;
  readonly cause?: unknown;
}

export interface SystemErrorContext {
  readonly module: string;
  readonly operation: string;
  readonly [key: string]: unknown;
}

export type HealthState = 'healthy' | 'degraded' | 'unhealthy';

export interface ServiceHealthMap {
  readonly [serviceName: string]: HealthState;
}

export interface WorkflowEventContext {
  readonly [key: string]: unknown;
}

export interface WorkflowResults {
  readonly [key: string]: unknown;
}

export interface WorkflowEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export interface StepEventResult {
  readonly [key: string]: unknown;
}

export type AgentType = 'researcher' | 'coder' | 'analyst' | 'tester' | 'coordinator';
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';
export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';

export interface TaskEventResult {
  readonly [key: string]: unknown;
}

export interface TaskEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export type NeuralNetworkType = 'feedforward' | 'convolutional' | 'recurrent' | 'transformer';

export interface NeuralEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export type MemoryStoreType = 'local' | 'distributed' | 'cache';

export interface MemoryStoreConfig {
  readonly [key: string]: unknown;
}

/**
 * Event bus configuration
 */
export interface EventBusConfig {
  readonly maxListeners: number;
  readonly enableMiddleware: boolean;
  readonly enableMetrics: boolean;
  readonly enableLogging: boolean;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Event metrics
 */
export interface EventMetrics {
  readonly eventCount: number;
  readonly eventTypes: Record<string, number>;
  readonly avgProcessingTime: number;
  readonly errorCount: number;
  readonly listenerCount: number;
}
