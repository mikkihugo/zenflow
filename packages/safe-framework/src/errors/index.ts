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

// Re-export all error handling from @claude-zen/foundation
export * from '@claude-zen/foundation/errors';

// Re-export infrastructure monitoring from @claude-zen/foundation (basic telemetry/performance)
export { PerformanceTracker, TelemetryManager } from '@claude-zen/foundation/telemetry';

// Re-export safety monitoring from @claude-zen/ai-safety
export { SafetyMonitor, DeceptionDetector } from '@claude-zen/ai-safety';

// SAFe-specific error types (minimal extensions)
import { BaseError, ErrorSeverity } from '@claude-zen/foundation/errors';

/**
 * Epic lifecycle error (extends foundation BaseError)
 */
export class EpicLifecycleError extends BaseError {
  public readonly epicId: string;
  public readonly currentState: string;

  constructor(message: string, epicId: string, currentState: string, cause?: Error) {
    super(message, {
      category: 'business',
      severity: 'medium' as ErrorSeverity,
      context: { epicId, currentState },
      recoverable: true,
      cause
    });
    this.epicId = epicId;
    this.currentState = currentState;
  }
}

/**
 * Business case validation error
 */
export class BusinessCaseError extends BaseError {
  public readonly businessCaseId: string;

  constructor(message: string, businessCaseId: string, cause?: Error) {
    super(message, {
      category: 'business',
      severity: 'high' as ErrorSeverity,
      context: { businessCaseId },
      recoverable: true,
      cause
    });
    this.businessCaseId = businessCaseId;
  }
}

/**
 * Portfolio Kanban state transition error
 */
export class KanbanTransitionError extends BaseError {
  public readonly fromState: string;
  public readonly toState: string;

  constructor(message: string, fromState: string, toState: string, cause?: Error) {
    super(message, {
      category: 'operational',
      severity: 'medium' as ErrorSeverity,  
      context: { fromState, toState },
      recoverable: true,
      cause
    });
    this.fromState = fromState;
    this.toState = toState;
  }
}

/**
 * Simple error creation utilities using foundation patterns
 */
export const createSAFeError = {
  epicLifecycle: (epicId: string, currentState: string, operation: string, cause?: Error) =>
    new EpicLifecycleError(`Epic ${operation} failed`, epicId, currentState, cause),

  businessCase: (businessCaseId: string, reason: string, cause?: Error) =>
    new BusinessCaseError(`Business case validation failed: ${reason}`, businessCaseId, cause),

  kanbanTransition: (epicId: string, fromState: string, toState: string, reason: string, cause?: Error) =>
    new KanbanTransitionError(`Invalid transition for epic ${epicId}: ${reason}`, fromState, toState, cause)
};