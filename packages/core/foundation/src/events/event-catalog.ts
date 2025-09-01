/**
 * @fileoverview Event Catalog - System-Wide Event Registry
 *
 * Centralized catalog of all event types used across claude-code-zen.
 * Provides TypeScript definitions and development-time validation.
 */

import { getLogger } from '../core/logging/logging.service.js';

const logger = getLogger('EventCatalog');

// ============================================================================
// CORE EVENT INTERFACES
// ============================================================================

export interface BaseEvent {
  timestamp?: Date;
  requestId?: string;
  correlationId?: string;
}

export interface EventPayload<T = unknown> extends BaseEvent {
  data: T;
}

// ============================================================================
// SPARC METHODOLOGY EVENTS
// ============================================================================

/**
 * SPARC requests specific phase review from Teamwork
 * @emitter SPARCManager
 * @listener TeamworkManager
 */
export interface SPARCPhaseReviewEvent extends BaseEvent {
  requestId: string;
  projectId: string;
  phase:
    | 'specification'
    | ' pseudocode'
    | ' architecture'
    | ' refinement'
    | ' completion';
  reviewType:
    | 'architecture'
    | ' specification'
    | ' implementation'
    | ' quality';
  artifacts: unknown[];
  requirements: string[];
  suggestedReviewers: string[];
  timeout?: number;
}

/**
 * SPARC project reaches completion
 * @emitter SPARCManager
 * @listener System
 */
export interface SPARCProjectCompleteEvent extends BaseEvent {
  projectId: string;
  project: {
    id: string;
    name: string;
    artifacts: Record<string, unknown[]>;
  };
}

/**
 * SPARC phase execution completes successfully
 * @emitter SPARCManager
 * @listener System
 */
export interface SPARCPhaseCompleteEvent extends BaseEvent {
  projectId: string;
  phase: string;
  artifacts: unknown[];
  completedBy: 'llm-inference' | ' claude-code' | ' teamwork';
  sparcValidated: boolean;
  filesModified?: string[];
}

// ============================================================================
// LLM SYSTEM EVENTS
// ============================================================================

/**
 * Request LLM inference with methodology context
 * @emitter SPARCManager
 * @listener LLMPackage
 */
export interface LLMInferenceRequestEvent extends BaseEvent {
  requestId: string;
  type:
    | 'simple-inference'
    | ' structured-generation'
    | ' analysis'
    | ' code-generation';
  projectId: string;
  phase?: string;
  prompt: string;
  sparcMethodology?: {
    phaseName: string;
    requirements: string[];
    validationCriteria: string[];
  };
  llmConfig: {
    strategy: 'auto' | ' gemini' | ' claude' | ' github-copilot';
    contextSize: 'small' | ' medium' | ' large';
    maxTokens: number;
    temperature: number;
  };
  context: {
    requirements: string[];
    previousArtifacts: Record<string, unknown[]>;
  };
}

/**
 * LLM inference completes successfully
 * @emitter LLMPackage
 * @listener SPARCManager
 */
export interface LLMInferenceCompleteEvent extends BaseEvent {
  requestId: string;
  projectId: string;
  phase?: string;
  success: boolean;
  artifacts: unknown[];
  metadata?: {
    provider: string;
    tokensUsed: number;
    processingTime: number;
  };
}

/**
 * LLM inference fails
 * @emitter LLMPackage
 * @listener SPARCManager
 */
export interface LLMInferenceFailedEvent extends BaseEvent {
  requestId: string;
  projectId: string;
  phase?: string;
  error: string;
  retryable?: boolean;
}

// ============================================================================
// CLAUDE CODE EVENTS
// ============================================================================

/**
 * Request Claude Code to execute task with file access
 * @emitter SPARCManager
 * @listener ClaudeCode
 */
export interface ClaudeCodeExecuteTaskEvent extends BaseEvent {
  projectId: string;
  phase?: string;
  sparcMethodology?: {
    phaseName: string;
    requirements: string[];
    validationCriteria: string[];
    methodologyNotes: string[];
  };
  context: {
    requirements: string[];
    previousArtifacts: Record<string, unknown[]>;
    needsFileAccess: boolean;
  };
}

/**
 * Claude Code task completes successfully
 * @emitter ClaudeCode
 * @listener SPARCManager
 */
export interface ClaudeCodeTaskCompleteEvent extends BaseEvent {
  requestId: string;
  projectId: string;
  phase?: string;
  success: boolean;
  artifacts: unknown[];
  filesModified?: string[];
  summary?: string;
}

/**
 * Claude Code task fails
 * @emitter ClaudeCode
 * @listener SPARCManager
 */
export interface ClaudeCodeTaskFailedEvent extends BaseEvent {
  requestId: string;
  projectId: string;
  phase?: string;
  error: string;
  filesAffected?: string[];
}

// ============================================================================
// TEAMWORK COLLABORATION EVENTS
// ============================================================================

/**
 * Teamwork acknowledges collaboration request
 * @emitter TeamworkManager
 * @listener SPARCManager
 */
export interface TeamworkReviewAcknowledgedEvent extends BaseEvent {
  requestId: string;
  estimatedDuration: number;
  assignedAgents: string[];
}

/**
 * Teamwork completes review process
 * @emitter TeamworkManager
 * @listener SPARCManager
 */
export interface TeamworkReviewCompleteEvent extends BaseEvent {
  projectId: string;
  phase: string;
  reviewType:
    | 'architecture'
    | ' specification'
    | ' implementation'
    | ' quality';
  approved: boolean;
  feedback: string[];
  actionItems: string[];
  conversationId: string;
}

/**
 * Teamwork collaboration fails
 * @emitter TeamworkManager
 * @listener SPARCManager
 */
export interface TeamworkCollaborationFailedEvent extends BaseEvent {
  projectId: string;
  phase: string;
  error: string;
  reason: 'timeout' | ' resource_unavailable' | ' system_error';
}

// ============================================================================
// SAFE FRAMEWORK EVENTS (Minimal for Prototype)
// ============================================================================

/**
 * SAFe Program Increment planning initiated
 * @emitter SafeFramework
 * @listener System
 */
export interface SafePIPlanningEvent extends BaseEvent {
  programIncrementId: string;
  startDate: Date;
  endDate: Date;
  objectives: string[];
  teams: string[];
}

/**
 * SAFe Epic created or updated
 * @emitter SafeFramework
 * @listener System
 */
export interface SafeEpicEvent extends BaseEvent {
  epicId: string;
  title: string;
  businessValue: number;
  state: string;
  owner: string;
}

// ============================================================================
// GIT OPERATIONS EVENTS
// ============================================================================

/**
 * Git operation starts execution
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitOperationStartedEvent extends BaseEvent {
  operationId: string;
  type:
    | 'clone'
    | ' commit'
    | ' push'
    | ' pull'
    | ' merge'
    | ' rebase'
    | ' worktree'
    | ' maintenance';
  repositoryPath: string;
  branchName?: string;
  worktreePath?: string;
}

/**
 * Git operation completes successfully
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitOperationCompletedEvent extends BaseEvent {
  operationId: string;
  type:
    | 'clone'
    | ' commit'
    | ' push'
    | ' pull'
    | ' merge'
    | ' rebase'
    | ' worktree'
    | ' maintenance';
  repositoryPath: string;
  result: unknown;
  branchName?: string;
  worktreePath?: string;
  filesAffected?: string[];
}

/**
 * Git operation fails
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitOperationFailedEvent extends BaseEvent {
  operationId: string;
  type:
    | 'clone'
    | ' commit'
    | ' push'
    | ' pull'
    | ' merge'
    | ' rebase'
    | ' worktree'
    | ' maintenance';
  repositoryPath: string;
  error: string;
  branchName?: string;
  worktreePath?: string;
}

/**
 * Git conflict resolved with AI assistance
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitConflictResolvedEvent extends BaseEvent {
  repositoryPath: string;
  conflictFiles: string[];
  resolutionStrategy: 'ai-suggested' | ' manual' | ' automatic';
  success: boolean;
  branchName?: string;
}

/**
 * Git worktree lifecycle events
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitWorktreeEvent extends BaseEvent {
  repositoryPath: string;
  worktreePath: string;
  branchName: string;
  action: 'created' | ' removed' | ' pruned';
}

/**
 * Git maintenance task events
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitMaintenanceEvent extends BaseEvent {
  repositoryPath: string;
  taskType: 'gc' | ' prune' | ' repack' | ' fsck' | ' cleanup';
  status: 'started' | ' completed' | ' failed';
  result?: unknown;
  error?: string;
}

// ============================================================================
// DATABASE EVENTS
// ============================================================================

/**
 * Database connection event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseConnectionEvent extends BaseEvent {
  type: 'sqlite' | ' memory';
  database: string;
  status?: 'connected' | ' failed';
  error?: string;
}

/**
 * Database storage creation event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseStorageEvent extends BaseEvent {
  database: string;
  status?: 'ready' | ' failed';
  error?: string;
}

/**
 * Database operation event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseOperationEvent extends BaseEvent {
  operation: string;
  details: Record<string, unknown>;
}

/**
 * Database health status change event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseHealthEvent extends BaseEvent {
  status: 'healthy' | ' degraded' | ' unhealthy';
  details?: Record<string, unknown>;
}

// ============================================================================
// SYSTEM LIFECYCLE EVENTS
// ============================================================================

/**
 * System component starts
 * @emitter AnySystem
 * @listener SystemMonitor
 */
export interface SystemStartEvent extends BaseEvent {
  component: string;
  version: string;
  config?: Record<string, unknown>;
}

/**
 * System error occurs
 * @emitter AnySystem
 * @listener SystemMonitor
 */
export interface SystemErrorEvent extends BaseEvent {
  component: string;
  error: string;
  severity: 'low' | ' medium' | ' high' | ' critical';
  context?: Record<string, unknown>;
}

// ============================================================================
// EVENT CATALOG REGISTRY
// ============================================================================

export const EVENT_CATALOG = {
  // SPARC Events
  'sparc:architecture-review-needed': ' SPARCPhaseReviewEvent',
  'sparc:code-review-needed': ' SPARCPhaseReviewEvent',
  'sparc:phase-review-needed': ' SPARCPhaseReviewEvent',
  'sparc:project-complete': ' SPARCProjectCompleteEvent',
  'sparc:phase-complete': ' SPARCPhaseCompleteEvent',
  'sparc:phase-fallback': ' BaseEvent',
  // LLM Events
  'llm:inference-request': ' LLMInferenceRequestEvent',
  'llm:inference-complete': ' LLMInferenceCompleteEvent',
  'llm:inference-failed': ' LLMInferenceFailedEvent',
  // Claude Code Events
  'claude-code:execute-task': ' ClaudeCodeExecuteTaskEvent',
  'claude-code:task-complete': ' ClaudeCodeTaskCompleteEvent',
  'claude-code:task-failed': ' ClaudeCodeTaskFailedEvent',
  // Teamwork Events
  'teamwork:review-acknowledged': ' TeamworkReviewAcknowledgedEvent',
  'teamwork:review-complete': ' TeamworkReviewCompleteEvent',
  'teamwork:collaboration-failed': ' TeamworkCollaborationFailedEvent',
  // SAFe Events (Minimal)
  'safe:pi-planning-initiated': ' SafePIPlanningEvent',
  'safe:epic-updated': ' SafeEpicEvent',
  // Git Operations Events
  'git:operation:started': ' GitOperationStartedEvent',
  'git:operation:completed': ' GitOperationCompletedEvent',
  'git:operation:failed': ' GitOperationFailedEvent',
  'git:conflict:resolved': ' GitConflictResolvedEvent',
  'git:worktree:created': ' GitWorktreeEvent',
  'git:worktree:removed': ' GitWorktreeEvent',
  'git:maintenance:started': ' GitMaintenanceEvent',
  'git:maintenance:completed': ' GitMaintenanceEvent',
  // Database Events
  'database:connection:initiated': ' DatabaseConnectionEvent',
  'database:connection:established': ' DatabaseConnectionEvent',
  'database:connection:failed': ' DatabaseConnectionEvent',
  'database:storage:creation_started': ' DatabaseStorageEvent',
  'database:storage:creation_completed': ' DatabaseStorageEvent',
  'database:storage:creation_failed': ' DatabaseStorageEvent',
  'database:operation': ' DatabaseOperationEvent',
  'database:health:status_change': ' DatabaseHealthEvent',
  // DSPy Events
  'dspy:optimize-request': ' DspyOptimizationRequest',
  'dspy:optimization-complete': ' DspyOptimizationResult',
  'dspy:llm-request': ' DspyLlmRequest',
  'dspy:llm-response': ' DspyLlmResponse',
  'dspy:request-timeout': ' BaseEvent',
  // Brain Events
  'brain:predict-request': ' BrainPredictionRequest',
  'brain:prediction-complete': ' BrainPredictionResult',
  'brain:learning-update': ' BaseEvent',
  'brain:performance-tracked': ' BaseEvent',
  // Dynamic Registry Events
  'registry:module-register': ' ModuleRegistration',
  'registry:module-unregister': ' BaseEvent',
  'registry:module-registered': ' ActiveModule',
  'registry:module-unregistered': ' ActiveModule',
  'registry:heartbeat': ' BaseEvent',
  'registry:module-idle': ' BaseEvent',
  'registry:module-disconnected': ' BaseEvent',
  // System Events
  'system:component-started': ' SystemStartEvent',
  'system:error': ' SystemErrorEvent',
} as const;

export type EventName = keyof typeof EVENT_CATALOG;

// ============================================================================
// EVENT VALIDATION AND UTILITIES
// ============================================================================

/**
 * Validate that event name exists in catalog
 */
export function isValidEventName(eventName: string): eventName is EventName {
  return eventName in EVENT_CATALOG;
}

/**
 * Get event type for an event name
 */
export function getEventType(eventName: EventName): string {
  return EVENT_CATALOG[eventName];
}

/**
 * Get all event names in the catalog
 */
export function getAllEventNames(): EventName[] {
  return Object.keys(EVENT_CATALOG) as EventName[];
}

/**
 * Get events by category
 */
export function getEventsByCategory(
  category:
    | 'sparc'
    | ' llm'
    | ' claude-code'
    | ' teamwork'
    | ' safe'
    | ' git'
    | ' database'
    | ' dspy'
    | ' brain'
    | ' registry'
    | ' system'
): EventName[] {
  return getAllEventNames().filter((name) => name.startsWith(`${category  }:`));
}

/**
 * Enhanced EventLogger with catalog validation
 */
export class CatalogEventLogger {
  /**
   * Log event with catalog validation
   */
  static logValidatedEvent(eventName: string, payload?: unknown): void {
    if (!isValidEventName(eventName)) {
      logger.warn(`  Unknown event:${  eventName}`);
      logger.warn(` Valid events:${  getAllEventNames().join(',    ')}`);
      return;
    }

    const eventType = getEventType(eventName);
    logger.info(`Event: ${eventName} (${eventType})`);

    if (payload) {
      logger.info('Payload:', payload);
    }
  }

  /**
   * Log flow with validation
   */
  static logValidatedFlow(from: string, to: string, eventName: string): void {
    if (!isValidEventName(eventName)) {
      logger.warn(`  Unknown event in flow:${  eventName}`);
      return;
    }

    logger.info(` Flow:${  from  }  ${  eventName  }  ${  to}`);
  }
}

// ============================================================================
// EVENT PATTERNS DOCUMENTATION
// ============================================================================

/**
 * Common Event Flow Patterns in claude-code-zen:
 *
 * 1. SPARC Phase Execution:
 *    SPARCManager  llm:inference-request  LLMPackage
 *    LLMPackage  llm:inference-complete  SPARCManager
 *    SPARCManager  sparc:phase-complete  System
 *
 * 2. SPARC with Teamwork Collaboration:
 *    SPARCManager  sparc:phase-review-needed  TeamworkManager
 *    TeamworkManager  teamwork:review-acknowledged  SPARCManager
 *    TeamworkManager  teamwork:review-complete  SPARCManager
 *
 * 3. Claude Code Fallback:
 *    SPARCManager  claude-code:execute-task  ClaudeCode
 *    ClaudeCode  claude-code:task-complete  SPARCManager
 *    OR:ClaudeCode  claude-code:task-failed  SPARCManager
 *    SPARCManager  llm:inference-request  LLMPackage (fallback)
 *
 * 4. System Error Handling:
 *    AnyComponent  system:error  SystemMonitor
 *    SystemMonitor  system:recovery-initiated  AnyComponent
 */
