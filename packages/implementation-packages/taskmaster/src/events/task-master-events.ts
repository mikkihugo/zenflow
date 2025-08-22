/**
 * @fileoverview TaskMaster Event Integration - Enterprise Event System
 *
 * Complete integration with @claude-zen/event-system featuring:
 * - Type-safe event definitions and handlers
 * - Real-time task flow coordination
 * - Performance monitoring events
 * - Security and audit events
 * - Cross-service communication
 * - Event persistence and replay
 * - Error handling and recovery
 */

import { getEventSystem } from '@claude-zen/infrastructure';
import { getLogger } from '@claude-zen/foundation';
import { getTelemetryManager } from '@claude-zen/operations';
import type { EventEmitter } from 'eventemitter3';

import type {
  TaskId,
  TaskMetadata,
  TaskStateTransition,
  ApprovalGateId,
  UserId,
  WorkflowId,
  FlowMetrics,
  BottleneckInfo,
  SystemHealthStatus,
  APIError,
  AuditLogEntry,
  WIPViolationSeverity,
} from '../types/core/index.js';

// =============================================================================
// EVENT TYPE DEFINITIONS
// =============================================================================

/**
 * Comprehensive TaskMaster event map for type-safe event handling
 */
export interface TaskMasterEventMap {
  // Task lifecycle events
  'task:created': (event: TaskCreatedEvent) => void;
  'task:updated': (event: TaskUpdatedEvent) => void;
  'task:deleted': (event: TaskDeletedEvent) => void;
  'task:state_changed': (event: TaskStateChangedEvent) => void;
  'task:assigned': (event: TaskAssignedEvent) => void;
  'task:completed': (event: TaskCompletedEvent) => void;
  'task:blocked': (event: TaskBlockedEvent) => void;
  'task:unblocked': (event: TaskUnblockedEvent) => void;

  // Workflow events
  'workflow:started': (event: WorkflowStartedEvent) => void;
  'workflow:completed': (event: WorkflowCompletedEvent) => void;
  'workflow:failed': (event: WorkflowFailedEvent) => void;
  'workflow:paused': (event: WorkflowPausedEvent) => void;
  'workflow:resumed': (event: WorkflowResumedEvent) => void;

  // Approval gate events
  'approval:requested': (event: ApprovalRequestedEvent) => void;
  'approval:granted': (event: ApprovalGrantedEvent) => void;
  'approval:rejected': (event: ApprovalRejectedEvent) => void;
  'approval:timeout': (event: ApprovalTimeoutEvent) => void;
  'approval:escalated': (event: ApprovalEscalatedEvent) => void;

  // Performance and monitoring events
  'performance:threshold_exceeded': (
    event: PerformanceThresholdExceededEvent
  ) => void;
  'performance:bottleneck_detected': (event: BottleneckDetectedEvent) => void;
  'performance:wip_violation': (event: WIPViolationEvent) => void;
  'performance:metrics_updated': (event: MetricsUpdatedEvent) => void;
  'performance:prediction_completed': (event: PredictionCompletedEvent) => void;

  // System events
  'system:started': (event: SystemStartedEvent) => void;
  'system:shutdown': (event: SystemShutdownEvent) => void;
  'system:error': (event: SystemErrorEvent) => void;
  'system:health_check': (event: SystemHealthCheckEvent) => void;
  'system:configuration_changed': (event: ConfigurationChangedEvent) => void;

  // Security events
  'security:authentication_failed': (event: AuthenticationFailedEvent) => void;
  'security:authorization_denied': (event: AuthorizationDeniedEvent) => void;
  'security:rate_limit_exceeded': (event: RateLimitExceededEvent) => void;
  'security:suspicious_activity': (event: SuspiciousActivityEvent) => void;

  // Integration events
  'integration:external_update': (event: ExternalUpdateEvent) => void;
  'integration:sync_completed': (event: SyncCompletedEvent) => void;
  'integration:sync_failed': (event: SyncFailedEvent) => void;

  // Audit events
  'audit:action_logged': (event: AuditActionLoggedEvent) => void;
  'audit:compliance_check': (event: ComplianceCheckEvent) => void;
  'audit:data_export': (event: DataExportEvent) => void;
}

// =============================================================================
// BASE EVENT INTERFACES
// =============================================================================

/**
 * Base event interface with common properties
 */
interface BaseEvent {
  readonly id: string;
  readonly timestamp: Date;
  readonly source: string;
  readonly version: string;
  readonly correlationId?: string;
  readonly userId?: UserId;
  readonly metadata: Record<string, unknown>;
}

/**
 * Task-related base event
 */
interface TaskBaseEvent extends BaseEvent {
  taskId: TaskId;
  workflowId?: WorkflowId;
}

/**
 * Approval-related base event
 */
interface ApprovalBaseEvent extends BaseEvent {
  gateId: ApprovalGateId;
  taskId: TaskId;
}

// =============================================================================
// TASK LIFECYCLE EVENTS
// =============================================================================

export interface TaskCreatedEvent extends TaskBaseEvent {
  type: 'task:created';
  task: TaskMetadata;
  createdBy: UserId;
}

export interface TaskUpdatedEvent extends TaskBaseEvent {
  type: 'task:updated';
  task: TaskMetadata;
  previousTask: TaskMetadata;
  updatedBy: UserId;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}

export interface TaskDeletedEvent extends TaskBaseEvent {
  type: 'task:deleted';
  deletedBy: UserId;
  reason: string;
}

export interface TaskStateChangedEvent extends TaskBaseEvent {
  type: 'task:state_changed';
  transition: TaskStateTransition;
  triggeredBy: 'user | system' | 'automation';
}

export interface TaskAssignedEvent extends TaskBaseEvent {
  type: 'task:assigned';
  assigneeId: UserId;
  assignedBy: UserId;
  previousAssigneeId?: UserId;
}

export interface TaskCompletedEvent extends TaskBaseEvent {
  type: 'task:completed';
  completedBy: UserId;
  actualHours?: number;
  qualityScore?: number;
}

export interface TaskBlockedEvent extends TaskBaseEvent {
  type: 'task:blocked';
  blockedBy: UserId;
  reason: string;
  blockingFactors: string[];
  estimatedResolutionHours?: number;
}

export interface TaskUnblockedEvent extends TaskBaseEvent {
  type: 'task:unblocked';
  unblockedBy: UserId;
  resolutionNotes: string;
  blockedDurationHours: number;
}

// =============================================================================
// WORKFLOW EVENTS
// =============================================================================

export interface WorkflowStartedEvent extends BaseEvent {
  type: 'workflow:started';
  workflowId: WorkflowId;
  taskIds: TaskId[];
  startedBy: UserId;
  estimatedCompletionDate?: Date;
}

export interface WorkflowCompletedEvent extends BaseEvent {
  type: 'workflow:completed';
  workflowId: WorkflowId;
  taskIds: TaskId[];
  completedBy: UserId;
  metrics: FlowMetrics;
  actualDurationHours: number;
}

export interface WorkflowFailedEvent extends BaseEvent {
  type: 'workflow:failed';
  workflowId: WorkflowId;
  taskIds: TaskId[];
  error: APIError;
  failurePoint: string;
  partialResults?: FlowMetrics;
}

export interface WorkflowPausedEvent extends BaseEvent {
  type: 'workflow:paused';
  workflowId: WorkflowId;
  pausedBy: UserId;
  reason: string;
}

export interface WorkflowResumedEvent extends BaseEvent {
  type: 'workflow:resumed';
  workflowId: WorkflowId;
  resumedBy: UserId;
  pausedDurationHours: number;
}

// =============================================================================
// APPROVAL GATE EVENTS
// =============================================================================

export interface ApprovalRequestedEvent extends ApprovalBaseEvent {
  type: 'approval:requested';
  requiredApprovers: UserId[];
  minimumApprovals: number;
  timeoutHours?: number;
  requestedBy: UserId;
}

export interface ApprovalGrantedEvent extends ApprovalBaseEvent {
  type: 'approval:granted';
  approver: UserId;
  approvalNotes?: string;
  allApprovalsComplete: boolean;
}

export interface ApprovalRejectedEvent extends ApprovalBaseEvent {
  type: 'approval:rejected';
  approver: UserId;
  rejectionReason: string;
  canResubmit: boolean;
}

export interface ApprovalTimeoutEvent extends ApprovalBaseEvent {
  type: 'approval:timeout';
  timeoutHours: number;
  pendingApprovers: UserId[];
  escalationTriggered: boolean;
}

export interface ApprovalEscalatedEvent extends ApprovalBaseEvent {
  type: 'approval:escalated';
  escalationLevel: number;
  escalatedTo: UserId[];
  escalationReason: string;
}

// =============================================================================
// PERFORMANCE EVENTS
// =============================================================================

export interface PerformanceThresholdExceededEvent extends BaseEvent {
  type: 'performance:threshold_exceeded';
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning''' | '''critical';
  affectedTasks: TaskId[];
}

export interface BottleneckDetectedEvent extends BaseEvent {
  type: 'performance:bottleneck_detected';
  bottleneck: BottleneckInfo;
  detectionMethod: 'algorithm | manual' | 'wasm_ml';
  confidence: number;
  recommendedActions: string[];
}

export interface WIPViolationEvent extends BaseEvent {
  type: 'performance:wip_violation';
  state: string;
  currentCount: number;
  limit: number;
  severity: WIPViolationSeverity;
  violatingTasks: TaskId[];
}

export interface MetricsUpdatedEvent extends BaseEvent {
  type: 'performance:metrics_updated';
  metrics: FlowMetrics;
  calculationMethod: 'real_time | batch' | 'wasm_accelerated';
  processingTimeMs: number;
}

export interface PredictionCompletedEvent extends BaseEvent {
  type: 'performance:prediction_completed';
  predictionType:'' | '''throughput | cycle_time' | 'bottleneck''' | '''wip_optimization';
  results: unknown;
  confidence: number;
  modelVersion: string;
}

// =============================================================================
// SYSTEM EVENTS
// =============================================================================

export interface SystemStartedEvent extends BaseEvent {
  type: 'system:started';
  version: string;
  configuration: Record<string, unknown>;
  enabledFeatures: string[];
}

export interface SystemShutdownEvent extends BaseEvent {
  type: 'system:shutdown';
  reason: 'graceful | forced' | 'error';
  uptimeMs: number;
}

export interface SystemErrorEvent extends BaseEvent {
  type: 'system:error';
  error: APIError;
  component: string;
  recoveryAction?: string;
}

export interface SystemHealthCheckEvent extends BaseEvent {
  type: 'system:health_check';
  health: SystemHealthStatus;
  previousHealth?: SystemHealthStatus;
  healthTrend: 'improving | stable' | 'degrading';
}

export interface ConfigurationChangedEvent extends BaseEvent {
  type: 'system:configuration_changed';
  changedBy: UserId;
  changes: Array<{
    key: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  requiresRestart: boolean;
}

// =============================================================================
// SECURITY EVENTS
// =============================================================================

export interface AuthenticationFailedEvent extends BaseEvent {
  type: 'security:authentication_failed';
  username: string;
  clientIp: string;
  userAgent: string;
  failureReason: string;
  attemptCount: number;
}

export interface AuthorizationDeniedEvent extends BaseEvent {
  type: 'security:authorization_denied';
  userId: UserId;
  resource: string;
  action: string;
  clientIp: string;
  denialReason: string;
}

export interface RateLimitExceededEvent extends BaseEvent {
  type: 'security:rate_limit_exceeded';
  clientIp: string;
  endpoint: string;
  requestCount: number;
  limitWindow: string;
  userId?: UserId;
}

export interface SuspiciousActivityEvent extends BaseEvent {
  type: 'security:suspicious_activity';
  activityType: string;
  userId?: UserId;
  clientIp: string;
  details: Record<string, unknown>;
  riskScore: number;
}

// =============================================================================
// INTEGRATION EVENTS
// =============================================================================

export interface ExternalUpdateEvent extends BaseEvent {
  type: 'integration:external_update';
  system: string;
  updateType: string;
  affectedEntities: string[];
  syncRequired: boolean;
}

export interface SyncCompletedEvent extends BaseEvent {
  type: 'integration:sync_completed';
  system: string;
  entitiesSynced: number;
  syncDurationMs: number;
  changesApplied: number;
}

export interface SyncFailedEvent extends BaseEvent {
  type: 'integration:sync_failed';
  system: string;
  error: APIError;
  retryAttempt: number;
  nextRetryAt?: Date;
}

// =============================================================================
// AUDIT EVENTS
// =============================================================================

export interface AuditActionLoggedEvent extends BaseEvent {
  type: 'audit:action_logged';
  auditLog: AuditLogEntry;
  complianceFrameworks: string[];
}

export interface ComplianceCheckEvent extends BaseEvent {
  type: 'audit:compliance_check';
  framework: string;
  checkType: string;
  result: 'passed | failed' | 'warning';
  findings: string[];
}

export interface DataExportEvent extends BaseEvent {
  type: 'audit:data_export';
  exportedBy: UserId;
  dataType: string;
  recordCount: number;
  exportFormat: string;
  purpose: string;
}

// =============================================================================
// EVENT MANAGER CLASS
// =============================================================================

/**
 * Enterprise TaskMaster Event Manager
 *
 * Provides comprehensive event management with:
 * - Type-safe event emission and handling
 * - Event persistence and replay
 * - Cross-service communication
 * - Performance monitoring
 * - Error handling and recovery
 */
export class TaskMasterEventManager {
  private readonly logger = getLogger('TaskMasterEventManager');
  private eventBus: any; // Will be injected from infrastructure
  private telemetryManager: any;
  private eventStore: any;

  // Event handlers registry
  private handlers = new Map<string, Array<(event: any) => Promise<void>>>();
  private middleware: Array<(event: any) => Promise<any>> = [];

  // Configuration
  private config: {
    enablePersistence: boolean;
    enableTelemetry: boolean;
    enableReplay: boolean;
    maxRetries: number;
    retryDelay: number;
  };

  constructor(config?: Partial<typeof this.config>) {
    this.config = {
      enablePersistence: true,
      enableTelemetry: true,
      enableReplay: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize the event manager
   */
  async initialize(): Promise<void> {
    try {
      // Initialize event system
      const eventSystem = await getEventSystem();
      this.eventBus = eventSystem.createEventBus({
        maxListeners: 1000,
        enablePersistence: this.config.enablePersistence,
      });

      // Initialize telemetry if enabled
      if (this.config.enableTelemetry) {
        this.telemetryManager = await getTelemetryManager();
      }

      // Initialize event store for persistence
      if (this.config.enablePersistence) {
        this.eventStore = eventSystem.createEventStore();
      }

      // Set up error handling
      this.eventBus.on('error', this.handleEventError.bind(this));

      this.logger.info('TaskMaster Event Manager initialized', {
        persistence: this.config.enablePersistence,
        telemetry: this.config.enableTelemetry,
        replay: this.config.enableReplay,
      });
    } catch (error) {
      this.logger.error('Failed to initialize event manager', error);
      throw error;
    }
  }

  /**
   * Shutdown the event manager
   */
  async shutdown(): Promise<void> {
    try {
      // Remove all handlers
      this.handlers.clear();
      this.middleware = [];

      // Close event bus
      if (this.eventBus) {
        await this.eventBus.close();
      }

      // Close event store
      if (this.eventStore) {
        await this.eventStore.close();
      }

      this.logger.info('TaskMaster Event Manager shutdown completed');
    } catch (error) {
      this.logger.error('Error during event manager shutdown', error);
      throw error;
    }
  }

  // =============================================================================
  // EVENT EMISSION
  // =============================================================================

  /**
   * Emit a typed event
   */
  async emit<K extends keyof TaskMasterEventMap>(
    eventType: K,
    eventData: Parameters<TaskMasterEventMap[K]>[0]
  ): Promise<void> {
    try {
      // Add metadata to event
      const event = this.enrichEvent(eventType as string, eventData);

      // Apply middleware
      const processedEvent = await this.applyMiddleware(event);

      // Persist event if enabled
      if (this.config.enablePersistence && this.eventStore) {
        await this.eventStore.store(processedEvent);
      }

      // Emit to event bus
      this.eventBus.emit(eventType, processedEvent);

      // Track telemetry
      if (this.config.enableTelemetry && this.telemetryManager) {
        this.telemetryManager.trackEvent('event_emitted', {
          eventType,
          timestamp: event.timestamp,
          source: event.source,
        });
      }

      this.logger.debug('Event emitted', { eventType, eventId: event.id });
    } catch (error) {
      this.logger.error('Failed to emit event', error, { eventType });
      throw error;
    }
  }

  /**
   * Emit multiple events in a batch
   */
  async emitBatch(
    events: Array<{
      type: keyof TaskMasterEventMap;
      data: any;
    }>
  ): Promise<void> {
    try {
      const promises = events.map(({ type, data }) => this.emit(type, data));
      await Promise.all(promises);

      this.logger.debug('Batch events emitted', { count: events.length });
    } catch (error) {
      this.logger.error('Failed to emit batch events', error);
      throw error;
    }
  }

  // =============================================================================
  // EVENT HANDLING
  // =============================================================================

  /**
   * Register an event handler
   */
  on<K extends keyof TaskMasterEventMap>(
    eventType: K,
    handler: TaskMasterEventMap[K]
  ): void {
    const eventTypeStr = eventType as string;

    if (!this.handlers.has(eventTypeStr)) {
      this.handlers.set(eventTypeStr, []);
    }

    const asyncHandler = async (event: any) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error('Event handler error', error, { eventType });
        throw error;
      }
    };

    this.handlers.get(eventTypeStr)!.push(asyncHandler);
    this.eventBus.on(eventType, asyncHandler);

    this.logger.debug('Event handler registered', { eventType });
  }

  /**
   * Remove an event handler
   */
  off<K extends keyof TaskMasterEventMap>(
    eventType: K,
    handler: TaskMasterEventMap[K]
  ): void {
    const eventTypeStr = eventType as string;
    const handlers = this.handlers.get(eventTypeStr);

    if (handlers) {
      const index = handlers.indexOf(handler as any);
      if (index > -1) {
        handlers.splice(index, 1);
        this.eventBus.off(eventType, handler);

        this.logger.debug('Event handler removed', { eventType });
      }
    }
  }

  /**
   * Register middleware for event processing
   */
  use(middleware: (event: any) => Promise<any>): void {
    this.middleware.push(middleware);
    this.logger.debug('Event middleware registered');
  }

  // =============================================================================
  // EVENT REPLAY AND RECOVERY
  // =============================================================================

  /**
   * Replay events from a specific timestamp
   */
  async replayEvents(fromTimestamp: Date, toTimestamp?: Date): Promise<void> {
    if (!this.config.enableReplay'' | '''' | ''!this.eventStore) {
      throw new Error('Event replay is not enabled');
    }

    try {
      const events = await this.eventStore.getEvents({
        from: fromTimestamp,
        to: toTimestamp'' | '''' | ''new Date(),
      });

      this.logger.info('Replaying events', {
        count: events.length,
        from: fromTimestamp,
        to: toTimestamp,
      });

      for (const event of events) {
        // Re-emit event with replay flag
        const replayEvent = { ...event, isReplay: true };
        this.eventBus.emit(event.type, replayEvent);
      }
    } catch (error) {
      this.logger.error('Failed to replay events', error);
      throw error;
    }
  }

  /**
   * Get event history for analysis
   */
  async getEventHistory(filter: {
    eventTypes?: string[];
    userId?: UserId;
    fromTimestamp?: Date;
    toTimestamp?: Date;
    limit?: number;
  }): Promise<any[]> {
    if (!this.eventStore) {
      throw new Error('Event persistence is not enabled');
    }

    try {
      const events = await this.eventStore.query(filter);
      return events;
    } catch (error) {
      this.logger.error('Failed to get event history', error);
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private enrichEvent(eventType: string, eventData: any): any {
    const enriched = {
      ...eventData,
      id: eventData.id'' | '''' | ''this.generateEventId(),
      timestamp: eventData.timestamp'' | '''' | ''new Date(),
      source: eventData.source'' | '''' | '''taskmaster',
      version: eventData.version'' | '''' | '''2.0.0',
      type: eventType,
      metadata: {
        ...eventData.metadata,
        emittedAt: new Date(),
        nodeId: process.env.NODE_ID'' | '''' | '''unknown',
      },
    };

    return enriched;
  }

  private async applyMiddleware(event: any): Promise<any> {
    let processedEvent = event;

    for (const middleware of this.middleware) {
      try {
        processedEvent = (await middleware(processedEvent))'' | '''' | ''processedEvent;
      } catch (error) {
        this.logger.error('Middleware error', error, { eventType: event.type });
        throw error;
      }
    }

    return processedEvent;
  }

  private async handleEventError(error: Error, event?: any): Promise<void> {
    this.logger.error('Event bus error', error, { event });

    // Emit system error event
    await this.emit('system:error', {
      id: this.generateEventId(),
      timestamp: new Date(),
      source: 'event_manager',
      version: '2.0.0',
      metadata: {},
      error: {
        code: 'EVENT_BUS_ERROR',
        message: error.message,
        details: error.stack,
        metadata: { event },
        correlationId: this.generateEventId(),
      },
      component: 'event_bus',
    });
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a new TaskMaster event manager instance
 */
export async function createTaskMasterEventManager(
  config?: Partial<TaskMasterEventManager['config']>
): Promise<TaskMasterEventManager> {
  const manager = new TaskMasterEventManager(config);
  await manager.initialize();
  return manager;
}

/**
 * Create event emitter factory for TaskMaster events
 */
export function createEventEmitter(): {
  emit: <K extends keyof TaskMasterEventMap>(
    eventType: K,
    eventData: Parameters<TaskMasterEventMap[K]>[0]
  ) => Promise<void>;
  on: <K extends keyof TaskMasterEventMap>(
    eventType: K,
    handler: TaskMasterEventMap[K]
  ) => void;
  off: <K extends keyof TaskMasterEventMap>(
    eventType: K,
    handler: TaskMasterEventMap[K]
  ) => void;
} {
  // This would return a simplified event emitter interface
  // connected to the main event manager
  throw new Error('Not implemented - use TaskMasterEventManager directly');
}

// =============================================================================
// EVENT UTILITIES
// =============================================================================

/**
 * Validate event data against schema
 */
export function validateEvent<K extends keyof TaskMasterEventMap>(
  eventType: K,
  eventData: any
): boolean {
  // Implementation would validate against Zod schemas
  // For now, basic validation
  return (
    eventData &&
    typeof eventData === 'object' &&
    eventData.id &&
    eventData.timestamp &&
    eventData.source
  );
}

/**
 * Create event correlation helper
 */
export function createEventCorrelation(baseEvent: BaseEvent): {
  correlationId: string;
  getCorrelatedEvent: <T extends BaseEvent>(event: T) => T;
} {
  const correlationId = baseEvent.correlationId || baseEvent.id;

  return {
    correlationId,
    getCorrelatedEvent: <T extends BaseEvent>(event: T): T => ({
      ...event,
      correlationId,
    }),
  };
}

/**
 * Event aggregation utility
 */
export class EventAggregator {
  private events: BaseEvent[] = [];
  private timeWindow: number;

  constructor(timeWindowMs: number = 5000) {
    this.timeWindow = timeWindowMs;
  }

  add(event: BaseEvent): void {
    this.events.push(event);
    this.cleanup();
  }

  getAggregatedEvents(eventType?: string): BaseEvent[] {
    this.cleanup();

    if (eventType) {
      return this.events.filter((e) => (e as any).type === eventType);
    }

    return [...this.events];
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.timeWindow;
    this.events = this.events.filter((e) => e.timestamp.getTime() > cutoff);
  }
}
