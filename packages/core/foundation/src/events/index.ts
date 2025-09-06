/**
 * @fileoverview Events - Foundation Event System
 *
 * Comprehensive event system with EventEmitter and EventBus
 */

export { EventEmitter } from './event-emitter.js';
export type { EventMap, EventArgs } from './event-emitter.js';

export { EventBus } from './event-bus.js';
export type {
  EventBusConfig,
  EventListener,
  EventMetrics,
  EventContext,
  EventMiddleware,
  Event as EventBusEvent,
} from './event-bus.js';

export { EventLogger, logEvent, logFlow, logError } from './event-logger.js';

// Dynamic event registry
export {
  DynamicEventRegistry,
  dynamicEventRegistry,
  registerEventModule,
  sendModuleHeartbeat,
  getActiveModules,
  getEventMetrics,
  getEventFlows,
  getDynamicEventCatalog,
} from './dynamic-event-registry.js';
export type {
  ActiveModule,
  EventFlow,
  EventMetrics as DynamicEventMetrics,
  ModuleRegistration,
} from './dynamic-event-registry.js';

// Event catalog and validation
export {
  EVENT_CATALOG,
  isValidEventName,
  getEventType,
  getAllEventNames,
  getEventsByCategory,
  CatalogEventLogger,
} from './event-catalog.js';
export type {
  BaseEvent,
  EventPayload,
  EventName,
  // SPARC Events
  SPARCPhaseReviewEvent,
  SPARCProjectCompleteEvent,
  SPARCPhaseCompleteEvent,
  // LLM Events
  LLMInferenceRequestEvent,
  LLMInferenceCompleteEvent,
  LLMInferenceFailedEvent,
  // Claude Code Events
  ClaudeCodeExecuteTaskEvent,
  ClaudeCodeTaskCompleteEvent,
  ClaudeCodeTaskFailedEvent,
  // Teamwork Events
  TeamworkReviewAcknowledgedEvent,
  TeamworkReviewCompleteEvent,
  TeamworkCollaborationFailedEvent,
  // SAFe Events
  SafePIPlanningEvent,
  SafeEpicEvent,
  // Git Operations Events
  GitOperationStartedEvent,
  GitOperationCompletedEvent,
  GitOperationFailedEvent,
  GitConflictResolvedEvent,
  GitWorktreeEvent,
  GitMaintenanceEvent,
  // System Events
  SystemStartEvent,
  SystemErrorEvent,
} from './event-catalog.js';

// Domain contracts (migrated into foundation)
export * from './contracts/index.js';

// Extended catalog (core + domain contracts) for tooling/IDE assistance
// (Extended catalog intentionally NOT re-exported here to keep root export surface minimal for tree-shaking.)

// Note: Saga utilities and Event Module framework are available via subpath exports:
// - '@claude-zen/foundation/events/saga'
// - '@claude-zen/foundation/events/modules'
