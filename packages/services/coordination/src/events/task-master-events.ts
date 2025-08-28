/**
 * @fileoverview TaskMaster Event Integration - Enterprise Event System
 *
 * Complete integration with @claude-zen/event-system featuring: * - Type-safe event definitions and handlers
 * - Real-time task flow coordination
 * - Performance monitoring events
 * - Security and audit events
 * - Cross-service communication
 * - Event persistence and replay
 * - Error handling and recovery
 */
import { getLogger, EventEmitter } from '@claude-zen/foundation';
import { getTelemetryManager } from '@claude-zen/operations';
import type {
  APIError,
  ApprovalGateId,
  AuditLogEntry,
  BottleneckInfo,
  FlowMetrics,
  SystemHealthStatus,
  TaskId,
  TaskMetadata,
  TaskStateTransition,
  UserId,
  WIPViolationSeverity,
  WorkflowId,
} from '../types/core/index.js')// ============================================================================ = ';
// EVENT TYPE DEFINITIONS
// =============================================================================
/**
 * Comprehensive TaskMaster event map for type-safe event handling
 */
export interface TaskMasterEventMap {
  // Task lifecycle events'; 
 'task: created: (event: TaskCreatedEvent) => void') 'task: updated: (event: TaskUpdatedEvent) => void') 'task: deleted: (event: TaskDeletedEvent) => void') 'task: state_changed: (event: TaskStateChangedEvent) => void') 'task: assigned: (event: TaskAssignedEvent) => void') 'task: completed: (event: TaskCompletedEvent) => void') 'task: blocked: (event: TaskBlockedEvent) => void') 'task: unblocked: (event: TaskUnblockedEvent) => void')  // Workflow events';
 'workflow: started: (event: WorkflowStartedEvent) => void') 'workflow: completed: (event: WorkflowCompletedEvent) => void') 'workflow: failed: (event: WorkflowFailedEvent) => void') 'workflow: paused: (event: WorkflowPausedEvent) => void') 'workflow: resumed: (event: WorkflowResumedEvent) => void')  // Approval gate events';
 'approval: requested: (event: ApprovalRequestedEvent) => void') 'approval: granted: (event: ApprovalGrantedEvent) => void') 'approval: rejected: (event: ApprovalRejectedEvent) => void') 'approval: timeout: (event: ApprovalTimeoutEvent) => void') 'approval: escalated: (event: ApprovalEscalatedEvent) => void')  // Performance and monitoring events';
 'performance: threshold_exceeded: (';
    event: PerformanceThresholdExceededEvent
  ) => void;
 'performance: bottleneck_detected: (event: BottleneckDetectedEvent) => void') 'performance: wip_violation: (event: WIPViolationEvent) => void') 'performance: metrics_updated: (event: MetricsUpdatedEvent) => void') 'performance: prediction_completed: (event: PredictionCompletedEvent) => void')  // System events';
 'system: started: (event: SystemStartedEvent) => void') 'system: shutdown: (event: SystemShutdownEvent) => void') 'system: error: (event: SystemErrorEvent) => void') 'system: health_check: (event: SystemHealthCheckEvent) => void') 'system: configuration_changed: (event: ConfigurationChangedEvent) => void')  // Security events';
 'security: authentication_failed: (event: AuthenticationFailedEvent) => void') 'security: authorization_denied: (event: AuthorizationDeniedEvent) => void') 'security: rate_limit_exceeded: (event: RateLimitExceededEvent) => void') 'security: suspicious_activity: (event: SuspiciousActivityEvent) => void')  // Integration events';
 'integration: external_update: (event: ExternalUpdateEvent) => void') 'integration: sync_completed: (event: SyncCompletedEvent) => void') 'integration: sync_failed: (event: SyncFailedEvent) => void')  // Audit events';
 'audit: action_logged: (event: AuditActionLoggedEvent) => void') 'audit: compliance_check: (event: ComplianceCheckEvent) => void') 'audit: data_export: (event: DataExportEvent) => void')};;
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
  readonly correlationId?:string;
  readonly userId?:UserId;
  readonly metadata: Record<string, unknown>;
}
/**
 * Task-related base event
 */
interface TaskBaseEvent extends BaseEvent {
  taskId: TaskId;
  workflowId?:WorkflowId;
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
  type = 'task: 'task: 'task: 'task: 'task: 'task: 'task: 'task: unblocked',)  unblockedBy: UserId;;
  resolutionNotes: string;
  blockedDurationHours: number;
}
// =============================================================================
// WORKFLOW EVENTS
// =============================================================================
export interface WorkflowStartedEvent extends BaseEvent {
  type = 'workflow: 'workflow: 'workflow: 'workflow: 'workflow: resumed',)  workflowId: WorkflowId;;
  resumedBy: UserId;
  pausedDurationHours: number;
}
// =============================================================================
// APPROVAL GATE EVENTS
// =============================================================================
export interface ApprovalRequestedEvent extends ApprovalBaseEvent {
  type = 'approval: 'approval: 'approval: 'approval: 'approval: escalated',)  escalationLevel: number;;
  escalatedTo: UserId[];
  escalationReason: string;
}
// =============================================================================
// PERFORMANCE EVENTS
// =============================================================================
export interface PerformanceThresholdExceededEvent extends BaseEvent {
  type = 'performance: 'performance: 'performance: 'performance: 'performance: prediction_completed',)  predictionType: |'throughput| cycle_time| bottleneck' | ' wip_optimization')  results: unknown;;
  confidence: number;
  modelVersion: string;
}
// =============================================================================
// SYSTEM EVENTS
// =============================================================================
export interface SystemStartedEvent extends BaseEvent {
  type = 'system: 'system: 'system: 'system: 'system: configuration_changed',)  changedBy: UserId;;
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
  type = 'security: 'security: 'security: 'security: suspicious_activity',)  activityType: string;;
  userId?:UserId;
  clientIp: string;
  details: Record<string, unknown>;
  riskScore: number;
}
// =============================================================================
// INTEGRATION EVENTS
// =============================================================================
export interface ExternalUpdateEvent extends BaseEvent {
  type = 'integration: 'integration: 'integration: sync_failed',)  system: string;;
  error: APIError;
  retryAttempt: number;
  nextRetryAt?:Date;
}
// =============================================================================
// AUDIT EVENTS
// =============================================================================
export interface AuditActionLoggedEvent extends BaseEvent {
  type = 'audit: 'audit: 'audit: data_export',)  exportedBy: UserId;;
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
 * Provides comprehensive event management with: getLogger('TaskMasterEventManager');
  private eventBus: new Map<string, Array<(event: any) => Promise<void>>>();
  private middleware: Array<(event: any) => Promise<any>> = [];
  // Configuration
  private config: {
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
  async initialize():Promise<void> {
    try {
      // Initialize event system
      const eventBus = new EventEmitter();
      this.eventBus = eventSystem.createEventBus({
        maxListeners: await getTelemetryManager();
}
      // Initialize event store for persistence
      if (this.config.enablePersistence) {
        this.eventStore = eventSystem.createEventStore();
}
      // Set up error handling')      this.eventBus.on('error, this.handleEventError.bind(this)');
      this.logger.info('TaskMaster Event Manager initialized,';
        persistence: [];
      // Close event bus
      if (this.eventBus) {
        await this.eventBus.close();
}
      // Close event store
      if (this.eventStore) {
        await this.eventStore.close();
};)      this.logger.info('TaskMaster Event Manager shutdown completed');
} catch (error) {
    ')      this.logger.error('Error during event manager shutdown, error');
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
    eventType: this.enrichEvent(eventType as string, eventData);
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
    ')        this.telemetryManager.trackEvent('event_emitted,{';
          eventType,
          timestamp: events.map(({ type, data}) => this.emit(type, data);
      await Promise.all(promises);')      this.logger.debug('Batch events emitted,{ count: events.length};);
} catch (error) {
    ')      this.logger.error('Failed to emit batch events, error');
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
    eventType: eventType as string;
    if (!this.handlers.has(eventTypeStr)) {
      this.handlers.set(eventTypeStr, []);
}
    const asyncHandler = async (event: any) => {
      try {
        await handler(event);
} catch (error) {
    ')        this.logger.error('Event handler error, error, { eventType};);
        throw error;
}
};
    this.handlers.get(eventTypeStr)?.push(asyncHandler);
    this.eventBus.on(eventType, asyncHandler);')    this.logger.debug('Event handler registered,{ eventType};);
}
  /**
   * Remove an event handler
   */
  off<K extends keyof TaskMasterEventMap>(
    eventType: eventType as string;
    const handlers = this.handlers.get(eventTypeStr);
    if (handlers) {
      const index = handlers.indexOf(handler as any);
      if (index > -1) {
        handlers.splice(index, 1);
        this.eventBus.off(eventType, handler);')        this.logger.debug('Event handler removed,{ eventType};);
}
}
}
  /**
   * Register middleware for event processing
   */
  use(middleware: (event: any) => Promise<any>): void {
    this.middleware.push(middleware);)    this.logger.debug('Event middleware registered');
}
  // =============================================================================
  // EVENT REPLAY AND RECOVERY
  // =============================================================================
  /**
   * Replay events from a specific timestamp
   */
  async replayEvents(fromTimestamp: await this.eventStore.getEvents({
        from: { ...event, isReplay: await this.eventStore.query(filter);
      return events;')} catch (error) {';
    ')      this.logger.error('Failed to get event history, error');
      throw error;
}
}
  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================
  private enrichEvent(eventType: {
      ...eventData,
      id: event;
    for (const middleware of this.middleware) {
      try {
        processedEvent = (await middleware(processedEvent))|| processedEvent;
} catch (error) {
        this.logger.error('Middleware error, error, { eventType: 'event_manager',)      version : '2.0.0,'
'      metadata:,',      error,        code : 'EVENT_BUS_ERROR,'
'        message: error.message,';
        details: error.stack,
        metadata: event,',        correlationId: this.generateEventId(),,`)      component,};;
  private generateEventId():string {
    return `evt_`${Date.now()}_${Math.random().toString(36).substr(2, 9)})};)};;
// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================
/**
 * Create a new TaskMaster event manager instance
 */
export async function createTaskMasterEventManager(
  config?:Partial<TaskMasterEventManager[``config']>';
):Promise<TaskMasterEventManager> {
  const manager = new TaskMasterEventManager(config);
  await manager.initialize();
  return manager;')};;
/**
 * Create event emitter factory for TaskMaster events
 */
export function createEventEmitter():{
  emit: <K extends keyof TaskMasterEventMap>(
    eventType: K,
    eventData: Parameters<TaskMasterEventMap[K]>[0];
  ) => Promise<void>;
  on: <K extends keyof TaskMasterEventMap>(
    eventType: K,
    handler: TaskMasterEventMap[K]
  ) => void;
  off: <K extends keyof TaskMasterEventMap>(
    eventType: K,
    handler: TaskMasterEventMap[K]
  ) => void;
'} {';
  // This would return a simplified event emitter interface
  // connected to the main event manager
  throw new Error('Not implemented - use TaskMasterEventManager directly');')};;
// =============================================================================
// EVENT UTILITIES
// =============================================================================
/**
 * Validate event data against schema
 */
export function validateEvent<K extends keyof TaskMasterEventMap>(
  eventType: K,
  eventData: any
):boolean {
  // Implementation would validate against Zod schemas
  // For now, basic validation
  return (
    eventData &&
    typeof eventData ==='object '&&';
    eventData.id &&
    eventData.timestamp &&')    eventData.source')  );')};;
/**
 * Create event correlation helper
 */
export function createEventCorrelation(baseEvent: BaseEvent): {
  correlationId: string;
  getCorrelatedEvent: <T extends BaseEvent>(event: T) => T;
'} {
  const correlationId = baseEvent.correlationId|| baseEvent.id;
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
  private events: [];
  private timeWindow: 5000) {
    this.timeWindow = timeWindowMs;
}
  add(event: BaseEvent): void {
    this.events.push(event);
    this.cleanup();
}
  getAggregatedEvents(eventType?:string): BaseEvent[] {
    this.cleanup();
    if (eventType) {
      return this.events.filter((e) => (e as any).type === eventType);
}
    return [...this.events];
}
  private cleanup():void {
    const cutoff = Date.now() - this.timeWindow;
    this.events = this.events.filter((e) => e.timestamp.getTime() > cutoff);
}
}
;)`;