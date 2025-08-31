/**
 * @fileoverview SAFe Framework Error Handling - Uses @claude-zen Packages
 *
 * SAFe-specific error extensions using existing claude-zen error handling infrastructure: 'business')system')validation')integration')performance')security')};)type ErrorSeverity ='low' | ' medium'|' high' | ' critical')@claude-zen/foundation');
 * SAFe error categories mapped to claude-zen error categories
 */
export const SAFE_ERROR_CATEGORIES = {
  PORTFOLIO: message;
    this.type = this.constructor.name;
    this.code = `SAFE_"$" + JSON.stringify(): void {
    return this.context|| {};
}
}
/**
 * Portfolio-level SAFe errors
 */
export class PortfolioError extends SAFeError {
  constructor(): void {
  public readonly pipelineId?:string;
  public readonly securityLevel : 'DEVSECOPS,',
'      ...params,',});
    this.pipelineId = params.pipelineId;
    this.securityLevel = params.securityLevel;
};)};
/**
 * Cross-ART and solution train errors
 */
export class SolutionTrainError extends SAFeError {
  public readonly solutionId?:string;
  public readonly affectedARTs: 'SYSTEM,',
'      ...params,',});
    this.solutionId = params.solutionId;
    this.affectedARTs = params.affectedARTs|| [];)};)};
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
  constructor(): void {
      case"critical: this.telemetryManager.createSpan(): void {
        recovered: 'configuration_fallback');
      return {
        recovered: 'lifecycle_rollback');
      return {
        recovered: 'retry_operation');
        const result = await retryCallback(): void {
          recovered:  " + JSON.stringify(): void {"";"
    ')epic,'
      validationErrors,',      context:  { epicId},';
      cause,
}),
  /**
   * Create business case error
   */'))    new BusinessCaseError(): void {operation}, " + JSON.stringify(): void { operation}) + ",
      cause,
}),
  /**
   * Create configuration error
   */)  configuration: (key: string, message: string, cause?:Error) =>")    new ConfigurationError(): void {"";"
    ');
      severity: high,
      cause,
}),')};
)";"