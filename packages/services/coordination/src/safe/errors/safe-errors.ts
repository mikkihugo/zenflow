/**
 * @fileoverview SAFe Framework Error Handling - Uses @claude-zen Packages
 *
 * SAFe-specific error extensions using existing claude-zen error handling infrastructure:
 * - @claude-zen/foundation: Core error types and logging
 * - @claude-zen/ai-safety: Deception detection and safety protocols
 * - @claude-zen/agent-monitoring: Error tracking and metrics
 *
 * This file only adds SAFe-specific context to proven error handling patterns.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import type { BaseError, Timestamp, UUID } from '@claude-zen/foundation';
// Define error types locally since not exported from foundation
enum ErrorCategory {
  BUSINESS ='business,
  SYSTEM ='system,
  VALIDATION ='validation,
  INTEGRATION ='integration,
  PERFORMANCE ='performance,
  SECURITY ='security,
}

type ErrorSeverity ='low'|'medium'|'high'|'critical';
import type { LogLevel } from '@claude-zen/foundation';
/**
 * SAFe error categories mapped to claude-zen error categories
 */
export const SAFE_ERROR_CATEGORIES = {
  PORTFOLIO: ErrorCategory.BUSINESS,
  PROGRAM: ErrorCategory.BUSINESS,
  TEAM: ErrorCategory.BUSINESS,
  ARCHITECTURE: ErrorCategory.SYSTEM,
  DEVSECOPS: ErrorCategory.SYSTEM,
  SYSTEM: ErrorCategory.SYSTEM,
} as const;

/**
 * Base SAFe error using @claude-zen/foundation BaseError
 */
export abstract class SAFeError extends Error implements BaseError {
  public readonly safeCategory: keyof typeof SAFE_ERROR_CATEGORIES;
  public readonly suggestedActions: string[];

  // BaseError required properties
  public readonly type: string;
  public readonly code: string;
  public readonly message: string;
  public readonly timestamp: Timestamp;
  public readonly errorId: UUID;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error;
  public readonly retryable: boolean;
  public readonly logLevel: LogLevel;

  // Additional SAFe properties
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly recoverable: boolean;

  constructor(
    message: string,
    params: {
      safeCategory: keyof typeof SAFE_ERROR_CATEGORIES;
      severity: ErrorSeverity;
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message);

    this.message = message;
    this.type = this.constructor.name;
    this.code = `SAFE_${params.safeCategory}_ERROR`;`
    this.timestamp = Date.now() as Timestamp;
    this.errorId = crypto.randomUUID() as UUID;
    this.context = params.context;
    this.cause = params.cause;
    this.retryable = params.recoverable ?? true;
    this.logLevel ='error'as LogLevel';
    this.severity = params.severity;
    this.category = SAFE_ERROR_CATEGORIES[params.safeCategory];
    this.recoverable = params.recoverable ?? true;
    this.safeCategory = params.safeCategory;
    this.suggestedActions = params.suggestedActions|| [];
  }

  // Helper methods for BaseError compatibility
  getContext(): Record<string, unknown> {
    return this.context|| {};
  }
}

/**
 * Portfolio-level SAFe errors
 */
export class PortfolioError extends SAFeError {
  constructor(
    message: string,
    params: {
      severity: ErrorSeverity;
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, {
      safeCategory:'PORTFOLIO,
      ...params,
    });
  }
}

/**
 * Epic lifecycle and management errors
 */
export class EpicLifecycleError extends PortfolioError {
  public readonly epicId?: string;
  public readonly currentState?: string;

  constructor(
    message: string,
    params: {
      epicId?: string;
      currentState?: string;
      severity:  SAFeError[severity];
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, params);
    this.epicId = params.epicId;
    this.currentState = params.currentState;
  }
}

/**
 * Business case validation errors
 */
export class BusinessCaseError extends PortfolioError {
  public readonly businessCaseId?: string;
  public readonly validationFailures: string[];

  constructor(
    message: string,
    params: {
      businessCaseId?: string;
      validationFailures?: string[];
      severity:  SAFeError[severity];
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, params);
    this.businessCaseId = params.businessCaseId;
    this.validationFailures = params.validationFailures|| [];
  }
}

/**
 * Program-level SAFe errors
 */
export class ProgramError extends SAFeError {
  constructor(
    message: string,
    params: {
      severity:  SAFeError[severity];
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, {
      safeCategory:'PROGRAM,
      ...params,
    });
  }
}

/**
 * Program Increment planning and execution errors
 */
export class ProgramIncrementError extends ProgramError {
  public readonly piId?: string;
  public readonly artId?: string;

  constructor(
    message: string,
    params: {
      piId?: string;
      artId?: string;
      severity:  SAFeError[severity];
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, params);
    this.piId = params.piId;
    this.artId = params.artId;
  }
}

/**
 * Architecture and technical debt errors
 */
export class ArchitectureError extends SAFeError {
  public readonly componentId?: string;
  public readonly architectureType:'runway'|'enabler'|'decision'|'debt';
  constructor(
    message: string,
    params: {
      componentId?: string;
      architectureType: ArchitectureError['architectureType];
      severity:  SAFeError[severity];
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, {
      safeCategory:'ARCHITECTURE,
      ...params,
    });
    this.componentId = params.componentId;
    this.architectureType = params.architectureType;
  }
}

/**
 * DevSecOps pipeline and security errors
 */
export class DevSecOpsError extends SAFeError {
  public readonly pipelineId?: string;
  public readonly securityLevel:'scan'|'compliance'|'incident'|'vulnerability';
  constructor(
    message: string,
    params: {
      pipelineId?: string;
      securityLevel: DevSecOpsError['securityLevel];
      severity:  SAFeError[severity];
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, {
      safeCategory:'DEVSECOPS,
      ...params,
    });
    this.pipelineId = params.pipelineId;
    this.securityLevel = params.securityLevel;
  }
}

/**
 * Cross-ART and solution train errors
 */
export class SolutionTrainError extends SAFeError {
  public readonly solutionId?: string;
  public readonly affectedARTs: string[];

  constructor(
    message: string,
    params: {
      solutionId?: string;
      affectedARTs?: string[];
      severity:  SAFeError[severity];
      context?: Record<string, any>;
      recoverable?: boolean;
      suggestedActions?: string[];
      cause?: Error;
    }
  ) {
    super(message, {
      safeCategory:'SYSTEM,
      ...params,
    });
    this.solutionId = params.solutionId;
    this.affectedARTs = params.affectedARTs|| [];
  }
}

/**
 * Validation errors with detailed feedback
 */
export class ValidationError extends SAFeError {
  public readonly validationType:'javascript'|'typescript'|'python'|'java'|'csharp'|'cpp'|'go'|'ruby'|'swift'|'kotlin';
  public readonly validationErrors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;

  constructor(
    message: string,
    params: {
      validationType: ValidationError['validationType];
      validationErrors: ValidationError['validationErrors];
      context?: Record<string, any>;
      cause?: Error;
    }
  ) {
    super(message, {
      safeCategory:'SYSTEM,
      severity: medium,
      recoverable: true,
      suggestedActions: [
       'Review validation errors and correct input data,
       'Ensure all required fields are provided,
       'Verify data types and constraints,
      ],
      ...params,
    });
    this.validationType = params.validationType;
    this.validationErrors = params.validationErrors;
  }
}

/**
 * Configuration and setup errors
 */
export class ConfigurationError extends SAFeError {
  public readonly configurationKey?: string;

  constructor(
    message: string,
    params: {
      configurationKey?: string;
      severity?: SAFeError['severity];
      context?: Record<string, any>;
      cause?: Error;
    }
  ) {
    super(message, {
      safeCategory:'SYSTEM,
      severity:  params.severity||high,
      recoverable: true,
      suggestedActions: [
       'Review configuration settings,
       'Check environment variables and config files,
       'Validate dependency injection setup,
      ],
      ...params,
    });
    this.configurationKey = params.configurationKey;
  }
}

/**
 * Error handler interface for consistent error processing
 */
export interface ErrorHandler {
  handle(error: SAFeError): Promise<void>;
  canHandle(error: Error): boolean;
}

/**
 * Comprehensive SAFe error handler with telemetry integration
 */
export class SAFeErrorHandler implements ErrorHandler {
  private readonly logger: any;
  private readonly telemetryManager?: any;

  constructor(logger: any, telemetryManager?: any) {
    this.logger = logger;
    this.telemetryManager = telemetryManager;
  }

  /**
   * Handle SAFe errors with comprehensive logging and telemetry
   */
  async handle(error: SAFeError): Promise<void> {
    const context = error.getContext();

    // Log based on severity
    switch (error.severity) {
      case'critical:
        this.logger.error(`[CRITICAL] $error.message`, context);`
        break;
      case'high:
        this.logger.error(`[HIGH] $error.message`, context);`
        break;
      case'medium:
        this.logger.warn(`[MEDIUM] $error.message`, context);`
        break;
      case'low:
        this.logger.info(`[LOW] $error.message`, context);`
        break;
    }

    // Send to telemetry if available
    if (this._telemetryManager) {
      try {
        // Record error counter
        this.telemetryManager.recordCounter('safe_errors_total,1, {
          category: error.category,
          severity: error.severity,
          error_type: error.constructor.name,
          recoverable: error.recoverable.toString(),
        });

        // Create error span for tracing
        const _span = this.telemetryManager.createSpan('safe_error_handled'');
        this.telemetryManager.finishSpan(span, 
          error_id: error.errorId,
          error_category: error.category,
          error_severity: error.severity,);
      } catch (telemetryError) {
        this.logger.warn('Failed to send error telemetry:,telemetryError');
      }
    }

    // Log recovery suggestions
    if (error._suggestedActions._length > 0) {
      this.logger.info(`Recovery suggestions for ${error.errorId}:`, {`
        suggestions: error.suggestedActions,
      });
    }
  }

  /**
   * Check if error can be handled by this handler
   */
  canHandle(error: Error): boolean {
    return error instanceof SAFeError;
  }
}

/**
 * Error recovery utilities
 */
export class ErrorRecovery {
  /**
   * Attempt to recover from recoverable errors
   */
  static async attemptRecovery(
    error: SAFeError,
    retryCallback?: () => Promise<any>
  ): Promise<{
    recovered: boolean;
    result?: any;
    recoveryStrategy?: string;
  }> {
    if (!error.recoverable) {
      return { recovered: false };
    }

    // Recovery strategies based on error type
    let recoveryStrategy: string;

    if (error instanceof ValidationError) {
      recoveryStrategy = 'validation_retry';
      // For validation errors, provide detailed feedback
      return {
        recovered: false,
        recoveryStrategy,
        result: {
          validationErrors: error.validationErrors,
          suggestedActions: error.suggestedActions,
        },
      };
    }

    if (error instanceof ConfigurationError) {
      recoveryStrategy = 'configuration_fallback';
      // Could implement fallback configuration logic
      return {
        recovered: false,
        recoveryStrategy,
      };
    }

    if (error instanceof EpicLifecycleError) {
      recoveryStrategy = 'lifecycle_rollback';
      // Could implement state rollback logic
      return {
        recovered: false,
        recoveryStrategy,
      };
    }

    // Generic retry strategy
    if (retryCallback) {
      recoveryStrategy = 'retry_operation';
      try {
        const result = await retryCallback();
        return {
          recovered: true,
          result,
          recoveryStrategy,
        };
      } catch (_retryError) {
        return {
          recovered: false,
          recoveryStrategy,
        };
      }
    }

    return { recovered: false };
  }
}

/**
 * Utility functions for creating common SAFe errors
 */
export const createSAFeErrors = {
  /**
   * Create epic validation error
   */
  epicValidation: (
    epicId: string,
    validationErrors: ValidationError['validationErrors'],
    cause?: Error
  ) =>
    new ValidationError(`Epic validation failed for ${epicId}`, {`
      validationType:'epic,
      validationErrors,
      context: { epicId },
      cause,
    }),

  /**
   * Create business case error
   */
  businessCase: (businessCaseId: string, failures: string[], cause?: Error) =>
    new BusinessCaseError(`Business case validation failed`, {`
      businessCaseId,
      validationFailures: failures,
      severity: high,
      recoverable: true,
      suggestedActions: [
       'Review financial projections and assumptions,
       'Validate market analysis data,
       'Ensure ROI calculations are correct,
      ],
      cause,
    }),

  /**
   * Create epic lifecycle error
   */
  epicLifecycle: (
    epicId: string,
    currentState: string,
    operation: string,
    cause?: Error
  ) =>
    new EpicLifecycleError(`Epic lifecycle operation failed: ${operation}`, {`
      epicId,
      currentState,
      severity: high,
      recoverable: true,
      suggestedActions: [
       'Check epic state transition rules,
       'Verify required evidence is provided,
       'Ensure portfolio kanban gates are satisfied,
      ],
      context: { operation },
      cause,
    }),

  /**
   * Create configuration error
   */
  configuration: (key: string, message: string, cause?: Error) =>
    new ConfigurationError(`Configuration error for ${key}: ${message}`, {`
      configurationKey: key,
      severity: high,
      cause,
    }),
};
