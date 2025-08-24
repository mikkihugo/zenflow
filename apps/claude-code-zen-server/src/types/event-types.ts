/**
 * Event System Type Definitions.
 *
 * Comprehensive TypeScript types for the event bus system.
 * Replaces loose 'any' types with strict, type-safe interfaces.
 * Following Google TypeScript Style Guide.
 *
 * @file Strict event system type definitions.
 */

/**
 * Base event payload structure.
 */
export interface BasePayload {
  readonly timestamp: Date;
  readonly source: string;
  readonly id: string;
  readonly version: string;
}

/**
 * THE COLLECTIVE Events - Borg-style system coordination.
 */
export interface CollectiveEvents {
  // Core Collective events
  'collective:initialized': CollectiveInitializePayload;
  'collective:status:report': CollectiveStatusPayload;
  'collective:shutdown': CollectiveShutdownPayload;
  'collective:health:updated': CollectiveHealthPayload;
  // Task coordination
  'collective:task:request': TaskRequestPayload;
  'collective:task:assigned': TaskAssignmentPayload;
  'collective:task:completed': TaskCompletionPayload;
  // Cube coordination
  'ops-cube:status': CubeStatusPayload;
  'dev-cube:status': CubeStatusPayload;
  'research-cube:status': CubeStatusPayload;
  // Matron coordination
  'collective:matron:registered': MatronRegistrationPayload;
  'ops-cube:matron:shutdown': MatronShutdownPayload;
  'dev-cube:matron:shutdown': MatronShutdownPayload;
  // Queen coordination
  'ops-cube:queen:assigned': QueenAssignmentPayload;
  'dev-cube:queen:assigned': QueenAssignmentPayload;
  'ops-cube:queen:removed': QueenRemovalPayload;
  'dev-cube:queen:removed': QueenRemovalPayload;
  // Drone coordination
  'drone:spawned': DroneSpawnedPayload;
  'drone:terminated': DroneTerminatedPayload;
  'drone:status:changed': DroneStatusPayload;
  // Legacy system events (backward compatibility)
  'system:started': SystemStartedPayload;
  'system:stopped': SystemStoppedPayload;
  'system:shutdown': SystemShutdownPayload;
  'system:error': SystemErrorPayload;
  'system:health:changed': SystemHealthChangedPayload;
  'system:resource-pressure': SystemResourcePressurePayload;
  'resource:pressure': ResourcePressurePayload;
}

// THE COLLECTIVE Event Payloads
export interface CollectiveInitializePayload extends BasePayload {
  readonly status: string;
  readonly cubes: number;
  readonly matrons: number;
  readonly borgEfficiency: number;
}

export interface CollectiveStatusPayload extends BasePayload {
  readonly status: string;
  readonly activeCubes: number;
  readonly totalDrones: number;
  readonly borgEfficiency: number;
}

export interface CollectiveShutdownPayload extends BasePayload {
  readonly reason?: string;
}

export interface CollectiveHealthPayload extends BasePayload {
  readonly overallStatus: string;
  readonly borgEfficiency: number;
  readonly systemLoad: number;
}

export interface TaskRequestPayload extends BasePayload {
  readonly taskId: string;
  readonly type: string;
  readonly priority: string;
  readonly requiredCapabilities: string[];
}

export interface TaskAssignmentPayload extends BasePayload {
  readonly taskId: string;
  readonly cubeId: string;
  readonly matron: string;
  readonly priority: string;
}

export interface TaskCompletionPayload extends BasePayload {
  readonly taskId: string;
  readonly success: boolean;
  readonly borgEfficiency: number;
}

export interface CubeStatusPayload extends BasePayload {
  readonly cubeId: string;
  readonly type: string;
  readonly status: string;
  readonly borgRating: string;
}

export interface MatronRegistrationPayload extends BasePayload {
  readonly matron: string;
  readonly cube: string;
  readonly capabilities: string[];
}

export interface MatronShutdownPayload extends BasePayload {
  readonly matron: string;
}

export interface QueenAssignmentPayload extends BasePayload {
  readonly queenId: string;
  readonly matron: string;
}

export interface QueenRemovalPayload extends BasePayload {
  readonly queenId: string;
  readonly matron: string;
}

export interface DroneSpawnedPayload extends BasePayload {
  readonly droneId: string;
  readonly type: string;
  readonly cubeId: string;
}

export interface DroneTerminatedPayload extends BasePayload {
  readonly droneId: string;
  readonly reason: string;
}

export interface DroneStatusPayload extends BasePayload {
  readonly droneId: string;
  readonly status: string;
  readonly borgEfficiency: number;
}

export interface SystemStartedPayload extends BasePayload {
  readonly config: any;
  readonly modules: readonly string[];
}

export interface SystemStoppedPayload extends BasePayload {
  readonly reason: 'shutdown' | 'error' | 'restart';
  readonly uptime: number;
}

export interface SystemShutdownPayload extends BasePayload {
  readonly reason?: string;
  readonly graceful: boolean;
}

export interface SystemErrorPayload extends BasePayload {
  readonly error: any;
  readonly context?: any;
}

export interface SystemHealthChangedPayload extends BasePayload {
  readonly previousState: any;
  readonly currentState: any;
  readonly services: any;
}

export interface SystemResourcePressurePayload extends BasePayload {
  readonly cpu: number;
  readonly memory: number;
  readonly disk: number;
  readonly threshold: number;
}

export interface ResourcePressurePayload extends BasePayload {
  readonly resource: string;
  readonly currentUsage: number;
  readonly threshold: number;
  readonly severity: 'warning' | 'critical';
}

/**
 * Workflow events.
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

export interface WorkflowStartedPayload extends BasePayload {
  readonly workflowId: string;
  readonly workflowName: string;
  readonly context: any;
}

export interface WorkflowCompletedPayload extends BasePayload {
  readonly workflowId: string;
  readonly duration: number;
  readonly results: any;
}

export interface WorkflowFailedPayload extends BasePayload {
  readonly workflowId: string;
  readonly error: any;
  readonly stepIndex?: number;
}

export interface WorkflowPausedPayload extends BasePayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly reason: string;
}

export interface WorkflowResumedPayload extends BasePayload {
  readonly workflowId: string;
  readonly stepIndex: number;
}

export interface WorkflowCancelledPayload extends BasePayload {
  readonly workflowId: string;
  readonly reason: string;
  readonly stepIndex: number;
}

export interface WorkflowStepStartedPayload extends BasePayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly stepType: string;
}

export interface WorkflowStepCompletedPayload extends BasePayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly duration: number;
  readonly result: any;
}

export interface WorkflowStepFailedPayload extends BasePayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly error: any;
  readonly retryCount: number;
}

/**
 * Coordination events.
 */
export interface CoordinationEvents {
  'agent:created': AgentCreatedPayload;
  'agent:destroyed': AgentDestroyedPayload;
  'agent:status:changed': AgentStatusChangedPayload;
  'agent:heartbeat': AgentHeartbeatPayload;
  'agent:registered': AgentRegisteredPayload;
  'agent:capabilities-updated': AgentCapabilitiesUpdatedPayload;
  'agent:performance-update': AgentPerformanceUpdatePayload;
  'agent:unavailable': AgentUnavailablePayload;
  'agent:task-completed': AgentTaskCompletedPayload;
  'agent:task-failed': AgentTaskFailedPayload;
  'agent:error': AgentErrorPayload;
  'task:assigned': TaskAssignedPayload;
  'task:completed': TaskCompletedPayload;
  'task:failed': TaskFailedPayload;
  'task:progress-update': TaskProgressUpdatePayload;
  'task:cancel': TaskCancelPayload;
  'task:assign': TaskAssignPayload;
}

// Agent payloads
export interface AgentCreatedPayload extends BasePayload {
  readonly agentId: string;
  readonly type: string;
  readonly capabilities: string[];
}

export interface AgentDestroyedPayload extends BasePayload {
  readonly agentId: string;
  readonly reason: string;
}

export interface AgentStatusChangedPayload extends BasePayload {
  readonly agentId: string;
  readonly previousStatus: string;
  readonly currentStatus: string;
}

export interface AgentHeartbeatPayload extends BasePayload {
  readonly agentId: string;
  readonly status: string;
  readonly metrics: any;
}

export interface AgentRegisteredPayload extends BasePayload {
  readonly agentId: string;
  readonly capabilities: string[];
  readonly metadata: any;
}

export interface AgentCapabilitiesUpdatedPayload extends BasePayload {
  readonly agentId: string;
  readonly previousCapabilities: string[];
  readonly currentCapabilities: string[];
}

export interface AgentPerformanceUpdatePayload extends BasePayload {
  readonly agentId: string;
  readonly metrics: any;
  readonly trend: string;
}

export interface AgentUnavailablePayload extends BasePayload {
  readonly agentId: string;
  readonly reason: string;
  readonly duration?: number;
}

export interface AgentTaskCompletedPayload extends BasePayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly result: any;
  readonly duration: number;
}

export interface AgentTaskFailedPayload extends BasePayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly error: any;
  readonly retryCount: number;
}

export interface AgentErrorPayload extends BasePayload {
  readonly agentId: string;
  readonly error: any;
  readonly context: any;
}

// Task payloads
export interface TaskAssignedPayload extends BasePayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly priority: string;
}

export interface TaskCompletedPayload extends BasePayload {
  readonly taskId: string;
  readonly result: any;
  readonly duration: number;
}

export interface TaskFailedPayload extends BasePayload {
  readonly taskId: string;
  readonly error: any;
  readonly retryCount: number;
}

export interface TaskProgressUpdatePayload extends BasePayload {
  readonly taskId: string;
  readonly progress: number;
  readonly status: string;
}

export interface TaskCancelPayload extends BasePayload {
  readonly taskId: string;
  readonly reason: string;
}

export interface TaskAssignPayload extends BasePayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly requirements: any;
}

/**
 * Combined event interfaces
 */
export type AllEvents = CollectiveEvents & WorkflowEvents & CoordinationEvents;

export type EventPayload<T extends keyof AllEvents> = AllEvents[T];