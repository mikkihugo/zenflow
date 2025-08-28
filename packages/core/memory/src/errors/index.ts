/**
 * @file Memory-specific Error Types and Handling
 * Comprehensive error classification and recovery for memory systems.
 */

export enum MemoryErrorCode {
  // Coordination Errors
  CoordinationFailed = 'MEMORY_COORDINATION_FAILED',
  ConsensusTimeout = 'MEMORY_CONSENSUS_TIMEOUT',
  NodeUnreachable = 'MEMORY_NODE_UNREACHABLE',
  QuorumNotReached = 'MEMORY_QUORUM_NOT_REACHED',
  // Backend Errors
  BackendInitializationFailed = 'MEMORY_BACKEND_INIT_FAILED',
  BackendConnectionLost = 'MEMORY_BACKEND_CONNECTION_LOST',
  BackendCorrupted = 'MEMORY_BACKEND_CORRUPTED',
  BackendCapacityExceeded = 'MEMORY_BACKEND_CAPACITY_EXCEEDED',
  // Data Errors
  DataCorruption = 'MEMORY_DATA_CORRUPTION',
  DataInconsistency = 'MEMORY_DATA_INCONSISTENCY',
  DataNotFound = 'MEMORY_DATA_NOT_FOUND',
  DataVersionConflict = 'MEMORY_DATA_VERSION_CONFLICT',
  // Performance Errors
  OptimizationFailed = 'MEMORY_OPTIMIZATION_FAILED',
  MemoryThresholdExceeded = 'MEMORY_THRESHOLD_EXCEEDED',
  CacheMissRateHigh = 'MEMORY_CACHE_MISS_RATE_HIGH',
  LatencyThresholdExceeded = 'MEMORY_LATENCY_THRESHOLD_EXCEEDED',
  // System Errors
  ResourceExhausted = 'MEMORY_RESOURCE_EXHAUSTED',
  ConfigurationInvalid = 'MEMORY_CONFIGURATION_INVALID',
  SystemOverload = 'MEMORY_SYSTEM_OVERLOAD',
  UnknownError = 'MEMORY_UNKNOWN_ERROR'
}

export interface MemoryErrorContext {
  sessionId?:string;
  backendId?:string;
  nodeId?:string;
  operation?:string;
  key?:string;
  timestamp:number;
  metadata?:Record<string, unknown>;
}

export class MemoryError extends Error {
  public readonly code:MemoryErrorCode;
  public readonly context:MemoryErrorContext;
  public readonly recoverable:boolean;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(
    code: MemoryErrorCode,
    message: string,
    context: MemoryErrorContext,
    options: {
      recoverable?: boolean;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'MemoryError';
    this.code = code;
    this.context = context;
    this.recoverable = options?.recoverable ?? MemoryError.isRecoverable(code);
    this.severity = options?.severity ?? MemoryError.getSeverity(code);

    if (options?.cause) {
      this.cause = options?.cause;
}

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MemoryError);
}
}

  /**
   * Check if an error code is typically recoverable.
   *
   * @param code
   */
  static isRecoverable(code: MemoryErrorCode): boolean {
    const recoverableErrors = new Set([
      MemoryErrorCode.ConsensusTimeout,
      MemoryErrorCode.NodeUnreachable,
      MemoryErrorCode.BackendConnectionLost,
      MemoryErrorCode.OptimizationFailed,
      MemoryErrorCode.CacheMissRateHigh,
      MemoryErrorCode.SystemOverload,
    ]);

    return recoverableErrors.has(code);
  }

  /**
   * Get severity level for an error code.
   *
   * @param code
   */
  static getSeverity(code: MemoryErrorCode): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      [MemoryErrorCode.CoordinationFailed]: 'high',
      [MemoryErrorCode.ConsensusTimeout]: 'medium',
      [MemoryErrorCode.NodeUnreachable]: 'medium',
      [MemoryErrorCode.QuorumNotReached]: 'high',
      [MemoryErrorCode.BackendInitializationFailed]: 'critical',
      [MemoryErrorCode.BackendConnectionLost]: 'high',
      [MemoryErrorCode.BackendCorrupted]: 'critical',
      [MemoryErrorCode.BackendCapacityExceeded]: 'high',
      [MemoryErrorCode.DataCorruption]: 'critical',
      [MemoryErrorCode.DataInconsistency]: 'high',
      [MemoryErrorCode.DataNotFound]: 'low',
      [MemoryErrorCode.DataVersionConflict]: 'medium',
      [MemoryErrorCode.OptimizationFailed]: 'low',
      [MemoryErrorCode.MemoryThresholdExceeded]: 'medium',
      [MemoryErrorCode.CacheMissRateHigh]: 'low',
      [MemoryErrorCode.LatencyThresholdExceeded]: 'medium',
      [MemoryErrorCode.ResourceExhausted]: 'high',
      [MemoryErrorCode.ConfigurationInvalid]: 'critical',
      [MemoryErrorCode.SystemOverload]: 'medium',
      [MemoryErrorCode.UnknownError]: 'medium',
    } as const;

    return severityMap[code] || 'medium';
  }

  /**
   * Convert to a serializable object.
   */
  toJSON() {
    return {
      name:this.name,
      message:this.message,
      code:this.code,
      context:this.context,
      recoverable:this.recoverable,
      severity:this.severity,
      stack:this.stack,
};
}

  /**
   * Create a MemoryError from a generic error.
   *
   * @param error
   * @param context
   */
  static fromError(error:Error, context:MemoryErrorContext): MemoryError {
    // Try to determine error code from error message or type
    let code = MemoryErrorCode.UnknownError;

    if (error.message.includes('timeout')) {
      code = MemoryErrorCode.ConsensusTimeout;
    } else if (
      error.message.includes('connection') ||
      error.message.includes('unreachable')
    ) {
      code = MemoryErrorCode.NodeUnreachable;
    } else if (
      error.message.includes('corruption') ||
      error.message.includes('corrupted')
    ) {
      code = MemoryErrorCode.DataCorruption;
    } else if (error.message.includes('not found')) {
      code = MemoryErrorCode.DataNotFound;
    } else if (
      error.message.includes('capacity') ||
      error.message.includes('full')
    ) {
      code = MemoryErrorCode.BackendCapacityExceeded;
    }

    return new MemoryError(code, error.message, context, { cause:error});
}
}

export class MemoryCoordinationError extends MemoryError {
  constructor(
    message:string,
    context:MemoryErrorContext,
    options:{ cause?: Error} = {}
  ) {
    super(MemoryErrorCode.COORDINATION_FAILED, message, context, options);
    this.name = 'MemoryCoordinationError';
}
}

export class MemoryBackendError extends MemoryError {
  constructor(
    code:MemoryErrorCode,
    message:string,
    context:MemoryErrorContext,
    options:{ cause?: Error} = {}
  ) {
    super(code, message, context, options);
    this.name = 'MemoryBackendError';
}
}

export class MemoryDataError extends MemoryError {
  constructor(
    code:MemoryErrorCode,
    message:string,
    context:MemoryErrorContext,
    options:{ cause?: Error} = {}
  ) {
    super(code, message, context, options);
    this.name = 'MemoryDataError';
}
}

export class MemoryPerformanceError extends MemoryError {
  constructor(
    code:MemoryErrorCode,
    message:string,
    context:MemoryErrorContext,
    options:{ cause?: Error} = {}
  ) {
    super(code, message, context, options);
    this.name = 'MemoryPerformanceError';
}
}

/**
 * Error classification helper.
 *
 * @example
 */
export class MemoryErrorClassifier {
  /**
   * Classify an error by its characteristics.
   *
   * @param error
   */
  static classify(error:Error | MemoryError): {
    category: 'coordination|backend|data|performance|system';
    priority: 'low|medium|high|critical';
    actionRequired:boolean;
    suggestedActions:string[];
} {
    if (error instanceof MemoryError) {
      return MemoryErrorClassifier.classifyMemoryError(error);
}

    // Classify generic errors
    const category = MemoryErrorClassifier.inferCategory(error);
    const priority = MemoryErrorClassifier.inferPriority(error);

    return {
      category,
      priority,
      actionRequired:priority === 'high' || priority === ' critical',      suggestedActions:MemoryErrorClassifier.getSuggestedActions(
        category,
        error.message
      ),
};
}

  private static classifyMemoryError(error:MemoryError) {
    let category: 'coordination|backend|data|performance|system';

    if (
      error.code.includes('COORDINATION') ||
      error.code.includes('CONSENSUS') ||
      error.code.includes('QUORUM')
    ) {
      category = 'coordination';
} else if (error.code.includes('BACKEND')) {
      category = 'backend';
} else if (error.code.includes('DATA')) {
      category = 'data';
} else if (
      error.code.includes('OPTIMIZATION') ||
      error.code.includes('CACHE') ||
      error.code.includes('LATENCY')
    ) {
      category = 'performance';
} else {
      category = 'system';
}

    return {
      category,
      priority:error.severity,
      actionRequired:
        error.severity === 'high' || error.severity === ' critical',      suggestedActions:MemoryErrorClassifier.getSuggestedActions(
        category,
        error.message
      ),
};
}

  private static inferCategory(
    error:Error
  ):'coordination|backend|data|performance|system' {
    const message = error.message.toLowerCase();

    if (
      message.includes('coordination') ||
      message.includes('consensus') ||
      message.includes('node')
    ) {
      return 'coordination';
}
    if (
      message.includes('backend') ||
      message.includes('connection') ||
      message.includes('database')
    ) {
      return 'backend';
}
    if (
      message.includes('data') ||
      message.includes('corruption') ||
      message.includes('not found')
    ) {
      return 'data';
}
    if (
      message.includes('performance') ||
      message.includes('slow') ||
      message.includes('cache')
    ) {
      return 'performance';
}
    return 'system';
}

  private static inferPriority(error:Error): 'low|medium|high|critical' {
    const message = error.message.toLowerCase();

    if (
      message.includes('corruption') ||
      message.includes('critical') ||
      message.includes('fatal')
    ) {
      return 'critical';
}
    if (
      message.includes('failed') ||
      message.includes('error') ||
      message.includes('unreachable')
    ) {
      return 'high';
}
    if (
      message.includes('warning') ||
      message.includes('slow') ||
      message.includes('timeout')
    ) {
      return 'medium';
}
    return 'low';
}

  private static getSuggestedActions(
    category:string,
    message:string
  ):string[] {
    const actions = [];

    switch (category) {
      case 'coordination':
        actions.push('Check node connectivity');
        actions.push('Verify consensus configuration');
        if (message.includes('timeout')) {
          actions.push('Increase consensus timeout');
}
        break;

      case 'backend':
        actions.push('Check backend connectivity');
        actions.push('Verify backend configuration');
        if (message.includes('capacity')) {
          actions.push('Scale backend storage');
}
        break;

      case 'data':
        actions.push('Verify data integrity');
        if (message.includes('corruption')) {
          actions.push('Run data repair');
          actions.push('Check storage health');
}
        break;

      case 'performance':
        actions.push('Monitor system resources');
        actions.push('Review optimization settings');
        if (message.includes('cache')) {
          actions.push('Adjust cache configuration');
}
        break;

      case 'system':
        actions.push('Check system resources');
        actions.push('Review system logs');
        actions.push('Verify configuration');
        break;
}

    return actions;
}
}
