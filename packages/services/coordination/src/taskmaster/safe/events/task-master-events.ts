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
import { getLogger} from '@claude-zen/foundation')@claude-zen/foundation')@claude-zen/operations');
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
} from '../types/core/index.js');
// EVENT TYPE DEFINITIONS
// =============================================================================
/**
 * Comprehensive TaskMaster event map for type-safe event handling
 */
export interface TaskMasterEventMap {
  // Task lifecycle events'; 
 'task: created: (event: TaskCreatedEvent) => void')task: updated: (event: TaskUpdatedEvent) => void')task: deleted: (event: TaskDeletedEvent) => void')task: state_changed: (event: TaskStateChangedEvent) => void')task: assigned: (event: TaskAssignedEvent) => void')task: completed: (event: TaskCompletedEvent) => void')task: blocked: (event: TaskBlockedEvent) => void')task: unblocked: (event: TaskUnblockedEvent) => void');
 'workflow: started: (event: WorkflowStartedEvent) => void')workflow: completed: (event: WorkflowCompletedEvent) => void')workflow: failed: (event: WorkflowFailedEvent) => void')workflow: paused: (event: WorkflowPausedEvent) => void')workflow: resumed: (event: WorkflowResumedEvent) => void');
 'approval: requested: (event: ApprovalRequestedEvent) => void')approval: granted: (event: ApprovalGrantedEvent) => void')approval: rejected: (event: ApprovalRejectedEvent) => void')approval: timeout: (event: ApprovalTimeoutEvent) => void')approval: escalated: (event: ApprovalEscalatedEvent) => void');
 'performance: threshold_exceeded: (';
    event: PerformanceThresholdExceededEvent
  ) => void;
 'performance: bottleneck_detected: (event: BottleneckDetectedEvent) => void')performance: wip_violation: (event: WIPViolationEvent) => void')performance: metrics_updated: (event: MetricsUpdatedEvent) => void')performance: prediction_completed: (event: PredictionCompletedEvent) => void');
 'system: started: (event: SystemStartedEvent) => void')system: shutdown: (event: SystemShutdownEvent) => void')system: error: (event: SystemErrorEvent) => void')system: health_check: (event: SystemHealthCheckEvent) => void')system: configuration_changed: (event: ConfigurationChangedEvent) => void');
 'security: authentication_failed: (event: AuthenticationFailedEvent) => void')security: authorization_denied: (event: AuthorizationDeniedEvent) => void')security: rate_limit_exceeded: (event: RateLimitExceededEvent) => void')security: suspicious_activity: (event: SuspiciousActivityEvent) => void');
 'integration: external_update: (event: ExternalUpdateEvent) => void')integration: sync_completed: (event: SyncCompletedEvent) => void')integration: sync_failed: (event: SyncFailedEvent) => void');
 'audit: action_logged: (event: AuditActionLoggedEvent) => void')audit: compliance_check: (event: ComplianceCheckEvent) => void')audit: data_export: (event: DataExportEvent) => void')task: 'task: 'task: 'task: 'task: 'task: 'task: 'task: unblocked',)  unblockedBy: UserId;
  resolutionNotes: string;
  blockedDurationHours: number;
}
// =============================================================================
// WORKFLOW EVENTS
// =============================================================================
export interface WorkflowStartedEvent extends BaseEvent {
  type = 'workflow: 'workflow: 'workflow: 'workflow: 'workflow: resumed',)  workflowId: WorkflowId;
  resumedBy: UserId;
  pausedDurationHours: number;
}
// =============================================================================
// APPROVAL GATE EVENTS
// =============================================================================
export interface ApprovalRequestedEvent extends ApprovalBaseEvent {
  type = 'approval: 'approval: 'approval: 'approval: 'approval: escalated',)  escalationLevel: number;
  escalatedTo: UserId[];
  escalationReason: string;
}
// =============================================================================
// PERFORMANCE EVENTS
// =============================================================================
export interface PerformanceThresholdExceededEvent extends BaseEvent {
  type = 'performance: 'performance: 'performance: 'performance: 'performance: prediction_completed',)  predictionType: |'throughput| cycle_time| bottleneck' | ' wip_optimization')system: 'system: 'system: 'system: 'system: configuration_changed',)  changedBy: UserId;
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
  type = 'security: 'security: 'security: 'security: suspicious_activity',)  activityType: string;
  userId?:UserId;
  clientIp: string;
  details: Record<string, unknown>;
  riskScore: number;
}
// =============================================================================
// INTEGRATION EVENTS
// =============================================================================
export interface ExternalUpdateEvent extends BaseEvent {
  type = 'integration: 'integration: 'integration: sync_failed',)  system: string;
  error: APIError;
  retryAttempt: number;
  nextRetryAt?:Date;
}
// =============================================================================
// AUDIT EVENTS
// =============================================================================
export interface AuditActionLoggedEvent extends BaseEvent {
  type = 'audit: 'audit: 'audit: data_export',)  exportedBy: UserId;
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
 * Provides comprehensive event management with: getLogger(): void {
        await this.eventBus.close(): void {
        await this.eventStore.close(): void {';
          eventType,
          timestamp: events.map(): void { count: events.length};);
} catch (error) {
    ')Failed to emit batch events, error'))        this.logger.error(): void { eventType};);
}
  /**
   * Remove an event handler
   */
  off<K extends keyof TaskMasterEventMap>(
    eventType: eventType as string;
    const handlers = this.handlers.get(): void {
      const index = handlers.indexOf(): void {
        handlers.splice(): void { eventType};);
}
}
}
  /**
   * Register middleware for event processing
   */
  use(): void {
    this.middleware.push(): void { eventType: 'event_manager',)      version : '2.0.0,'
'      metadata:,',      error,        code : 'EVENT_BUS_ERROR,'
'        message: error.message,';
        details: error.stack,
        metadata: event,',        correlationId: this.generateEventId(): void {
    return "evt_"${Date.now(): void {Math.random(): void {
  const manager = new TaskMasterEventManager(): void {';
  // This would return a simplified event emitter interface
  // connected to the main event manager
  throw new Error(): void {
  // Implementation would validate against Zod schemas
  // For now, basic validation
  return (
    eventData &&
    typeof eventData ==='object '&&';
    eventData.id &&
    eventData.timestamp &&'))  );')} {
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
  add(): void {
    this.events.push(): void {
    this.cleanup(): void {
      return this.events.filter(): void {
    const cutoff = Date.now() - this.timeWindow;
    this.events = this.events.filter((e) => e.timestamp.getTime() > cutoff);
}
}
;)";"