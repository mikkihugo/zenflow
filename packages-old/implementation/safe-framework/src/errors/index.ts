/**
 * @fileoverview SAFe Framework Errors - Minimal Extensions of @claude-zen Packages
 *
 * Uses existing error handling, telemetry, and monitoring from claude-zen packages.
 * Only adds SAFe-specific context where needed.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */


// Re-export safety monitoring from @claude-zen/ai-safety
export { AIDeceptionDetector } from '@claude-zen/ai-safety';
// Re-export all error handling from @claude-zen/foundation
export * from '@claude-zen/foundation';
// Re-export infrastructure monitoring from @claude-zen/foundation (basic telemetry/performance)
export { PerformanceTracker, TelemetryManager } from '@claude-zen/foundation';


// Define error types locally since not exported from foundation
type ErrorSeverity = 'low|medium|high|critical';

/**
 * Epic lifecycle error (using foundation error patterns)
 */
export class EpicLifecycleError extends Error {
  public readonly epicId: string;
  public readonly currentState: string;

  constructor(
    message: string,
    epicId: string,
    currentState: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'EpicLifecycleError';
    this.epicId = epicId;
    this.currentState = currentState;
    this.cause = cause;
  }
}

/**
 * Business case validation error
 */
export class BusinessCaseError extends Error {
  public readonly businessCaseId: string;

  constructor(message: string, businessCaseId: string, cause?: Error) {
    super(message);
    this.name = 'BusinessCaseError';
    this.businessCaseId = businessCaseId;
    this.cause = cause;
  }
}

/**
 * Portfolio Kanban state transition error
 */
export class KanbanTransitionError extends Error {
  public readonly fromState: string;
  public readonly toState: string;

  constructor(
    message: string,
    fromState: string,
    toState: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'KanbanTransitionError';
    this.fromState = fromState;
    this.toState = toState;
    this.cause = cause;
  }
}

/**
 * Simple error creation utilities using foundation patterns
 */
export const createSAFeError = {
  epicLifecycle: (
    _epicId: string,
    _currentState: string,
    operation: string,
    cause?: Error
  ) =>
    new EpicLifecycleError(
      `Epic ${operation} failed`,`
      epicId,
      currentState,
      cause
    ),

  businessCase: (businessCaseId: string, reason: string, cause?: Error) =>
    new BusinessCaseError(
      `Business case validation failed: ${reason}`,`
      businessCaseId,
      cause
    ),

  kanbanTransition: (
    epicId: string,
    _fromState: string,
    _toState: string,
    reason: string,
    _cause?: Error
  ) =>
    new KanbanTransitionError(
      `Invalid transition for epic ${epicId}: ${reason}`,`
      fromState,
      toState,
      cause
    ),
};
