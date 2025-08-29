/**
 * @fileoverview SAFe Framework Error Handling - Uses @claude-zen Packages
 *
 * SAFe-specific error extensions using existing claude-zen error handling infrastructure: 'business')  SYSTEM = 'system')  VALIDATION = 'validation')  INTEGRATION = 'integration')  PERFORMANCE = 'performance')  SECURITY = 'security')'};)type ErrorSeverity ='low' | ' medium'|' high' | ' critical')import type { LogLevel} from '@claude-zen/foundation')/**';
 * SAFe error categories mapped to claude-zen error categories
 */
export const SAFE_ERROR_CATEGORIES = {
  PORTFOLIO: message;
    this.type = this.constructor.name;
    this.code = `SAFE_`${params.safeCategory}_ERROR``)    this.timestamp = Date.now() as Timestamp;';
    this.errorId = crypto.randomUUID() as UUID;
    this.context = params.context;
    this.cause = params.cause;
    this.retryable = params.recoverable ?? true;')    this.logLevel ='error' as LogLevel')    this.severity = params.severity;';
    this.category = SAFE_ERROR_CATEGORIES[params.safeCategory];
    this.recoverable = params.recoverable ?? true;
    this.safeCategory = params.safeCategory;
    this.suggestedActions = params.suggestedActions|| [];
}
  // Helper methods for BaseError compatibility
  getContext():Record<string, unknown> {
    return this.context|| {};
}
}
/**
 * Portfolio-level SAFe errors
 */
export class PortfolioError extends SAFeError {
  constructor(
    message: 'PORTFOLIO,',
'      ...params,',});')};)};;
/**
 * Epic lifecycle and management errors
 */
export class EpicLifecycleError extends PortfolioError {
  public readonly epicId?:string;
  public readonly currentState?:string;
  constructor(
    message: params.epicId;
    this.currentState = params.currentState;
}
}
/**
 * Business case validation errors
 */
export class BusinessCaseError extends PortfolioError {
  public readonly businessCaseId?:string;
  public readonly validationFailures: params.businessCaseId;
    this.validationFailures = params.validationFailures|| [];
}
}
/**
 * Program-level SAFe errors
 */
export class ProgramError extends SAFeError {
  constructor(
    message: 'PROGRAM,',
'      ...params,',});')};)};;
/**
 * Program Increment planning and execution errors
 */
export class ProgramIncrementError extends ProgramError {
  public readonly piId?:string;
  public readonly artId?:string;
  constructor(
    message: params.piId;
    this.artId = params.artId;
}
}
/**
 * Architecture and technical debt errors
 */
export class ArchitectureError extends SAFeError {
  public readonly componentId?:string;
  public readonly architectureType : 'ARCHITECTURE,',
'      ...params,',});
    this.componentId = params.componentId;
    this.architectureType = params.architectureType;
};)};;
/**
 * DevSecOps pipeline and security errors
 */
export class DevSecOpsError extends SAFeError {
  public readonly pipelineId?:string;
  public readonly securityLevel : 'DEVSECOPS,',
'      ...params,',});
    this.pipelineId = params.pipelineId;
    this.securityLevel = params.securityLevel;
};)};;
/**
 * Cross-ART and solution train errors
 */
export class SolutionTrainError extends SAFeError {
  public readonly solutionId?:string;
  public readonly affectedARTs: 'SYSTEM,',
'      ...params,',});
    this.solutionId = params.solutionId;
    this.affectedARTs = params.affectedARTs|| [];)};)};;
/**
 * Validation errors with detailed feedback
 */
export class ValidationError extends SAFeError {
  public readonly validationType : 'SYSTEM,',
'      severity: params.validationType;
    this.validationErrors = params.validationErrors;
}
}
/**
 * Configuration and setup errors
 */
export class ConfigurationError extends SAFeError {
  public readonly configurationKey?:string;
  constructor(
    message: 'SYSTEM,',
      severity: params.configurationKey;
}
}
/**
 * Error handler interface for consistent error processing
 */
export interface ErrorHandler {
  handle(error: logger;
    this.telemetryManager = telemetryManager;
}
  /**
   * Handle SAFe errors with comprehensive logging and telemetry
   */
  async handle(error: error.getContext();
    // Log based on severity
    switch (error.severity) {
      case`critical: this.telemetryManager.createSpan('safe_error_handled');
        this.telemetryManager.finishSpan(span, 
          error_id: error.errorId,
          error_category: error.category,
          error_severity: error.severity,);
} catch (telemetryError) {
    ')        this.logger.warn('Failed to send error telemetry:, telemetryError');`;
}
}
    // Log recovery suggestions
    if (error._suggestedActions._length > 0) {
    `)      this.logger.info(`Recovery suggestions for ${error.errorId}: `)        suggestions: error.suggestedActions,``;
});
}
}
  /**
   * Check if error can be handled by this handler
   */
  canHandle(error: Error): boolean {
    return error instanceof SAFeError;
};)};;
/**
 * Error recovery utilities
 */
export class ErrorRecovery {
  /**
   * Attempt to recover from recoverable errors
   */
  static async attemptRecovery(
    error: SAFeError,
    retryCallback?:() => Promise<any>
  ): Promise<{
    recovered: 'validation_retry')      // For validation errors, provide detailed feedback';
      return {
        recovered: 'configuration_fallback')      // Could implement fallback configuration logic';
      return {
        recovered: 'lifecycle_rollback')      // Could implement state rollback logic';
      return {
        recovered: 'retry_operation')      try {';
        const result = await retryCallback();
        return {
          recovered:  {
  /**
   * Create epic validation error
   */
  epicValidation: (
    epicId: string)    validationErrors: ValidationError[`validationErrors`],`;
    cause?:Error
  ) =>
    new ValidationError(`Epic validation failed for `${epicId}, {``;
    ')      validationType : 'epic,'
      validationErrors,',      context:  { epicId},';
      cause,
}),
  /**
   * Create business case error
   */')  businessCase: (businessCaseId: string, failures: string[], cause?:Error) =>')    new BusinessCaseError('Business case validation failed', {';
    ')      businessCaseId,';
      validationFailures: failures,
      severity: high,
      recoverable: true,')      suggestedActions: [')       'Review financial projections and assumptions,';
       'Validate market analysis data,';
       'Ensure ROI calculations are correct,';
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
    cause?:Error)  ) =>`)    new EpicLifecycleError(`Epic lifecycle operation failed: ${operation}, {``;
    ')      epicId,';
      currentState,
      severity: high,
      recoverable: true,
      suggestedActions: [';];;
       'Check epic state transition rules,')       'Verify required evidence is provided,';
       'Ensure portfolio kanban gates are satisfied,';
],
      context:  { operation},
      cause,
}),
  /**
   * Create configuration error
   */)  configuration: (key: string, message: string, cause?:Error) =>`)    new ConfigurationError(`Configuration error for ${key}:${message}, {``;
    ')      configurationKey: key,';
      severity: high,
      cause,
}),')'};;
)`;