/**
 * @fileoverview Enhanced error handling for MCP server
 * Provides retry logic, circuit breaker patterns, and error recovery
 * @module ErrorHandler
 */

/**
 * Enhanced error handler with retry logic and circuit breaker
 */
export class MCPErrorHandler {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}): any {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 10;
    this.circuitBreakerTimeout = options.circuitBreakerTimeout || 30000;
    
    // Circuit breaker state
    this.circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    
    // Error statistics
    this.errorStats = {
      totalErrors,
      recoveredErrors = {}): any {
    // Check circuit breaker
    if(this._circuitState === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.circuitBreakerTimeout) {
        throw new Error('Circuit breaker is OPEN - operation rejected');
      } else {
        this.circuitState = 'HALF_OPEN';
        console.error(`[${new Date().toISOString()}] INFO [ErrorHandler] Circuit breaker transitioning to HALF_OPEN`);
      }
    }

    let lastError;
    
    for(let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Operation succeeded
        this.onOperationSuccess();
        return result;
        
      } catch(error) {
        lastError = error;
        this.recordError(error, context);
        
        // Don't retry on certain error types
        if (this.isNonRetryableError(error)) {
          console.error(`[${new Date().toISOString()}] ERROR [ErrorHandler] Non-retryableerror = == this.maxRetries) {
          break;
        }
        
        // Calculate retry delay with exponential backoff
        const delay = this.calculateRetryDelay(attempt);
        console.error(`[${new Date().toISOString()}] WARN [ErrorHandler] Attempt $attemptfailed, retrying in $delayms = == 'HALF_OPEN') 
      this.circuitState = 'CLOSED';
      this.failureCount = 0;
      console.error(`[${new Date().toISOString()}] INFO [ErrorHandler] Circuit breaker CLOSED after successful operation`);
  }

  /**
   * Handle operation failure
   * @param {Error} error - The error that occurred
   */
  onOperationFailure(error): any 
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // Check if circuit breaker should trip
    if(this.failureCount >= this.circuitBreakerThreshold && this.circuitState === 'CLOSED') {
      this.circuitState = 'OPEN';
      this.errorStats.circuitBreakerTrips++;
      console.error(`[${new Date().toISOString()}] ERROR [ErrorHandler] Circuit breaker OPEN after ${this.failureCount} failures`);
    }
    
    this.errorStats.permanentFailures++;

  /**
   * Record error for statistics and analysis
   * @param {Error} error - The error to record
   * @param {Object} context - Error context
   */
  recordError(error, context): any 
    this.errorStats.totalErrors++;
    this.errorStats.lastError = {message = this.errorStats.errorHistory.slice(-50);
  }

  /**
   * Check if error is non-retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error should not be retried
   */
  isNonRetryableError(error): any {
    const nonRetryablePatterns = [
      /Invalid JSON/i,
      /Method not found/i,
      /Invalid arguments/i,
      /Permission denied/i,
      /Authentication failed/i,
      /Unauthorized/i,
      /Forbidden/i,
      /Not found/i,
      /Bad request/i
    ];
    
    return nonRetryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   * @param {number} attempt - Current attempt number
   * @returns {number} Delay in milliseconds
   */
  calculateRetryDelay(attempt): any {
    const baseDelay = this.retryDelay;
    const exponentialDelay = baseDelay * 2 ** (attempt - 1);
    const maxDelay = 30000; // 30 seconds max
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Create standardized error response
   * @param {string} id - Request ID
   * @param {Error} error - Original error
   * @param {Object} context - Error context
   * @returns {Object} Error response
   */
  createErrorResponse(id, error, context = {}): any {
    let _errorCode = -32603; // Internal error default

    // Map common errors to appropriate codes
    if (error.message.includes('Method not found')) {
      _errorCode = -32601;
    } else if (error.message.includes('Invalid arguments') || error.message.includes('Invalid JSON')) {
      _errorCode = -32602;
    } else if (error.message.includes('Parse error')) {
      _errorCode = -32700;
    } else if (error.message.includes('Invalid Request')) {
      _errorCode = -32600;
    }

      process.exit(1);
    }, 5000);
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() 
    return {
      ...this.errorStats,circuitState = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    console.error(`[${new Date().toISOString()}] INFO [ErrorHandler] Circuit breaker manually reset`);

  /**
   * Utility delay function
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise<void>}
   */
  delay(ms): any 
    return new Promise(resolve => setTimeout(resolve, ms));
}

  /**
   * Error recovery strategies
   */
  export;
  class;
  ErrorRecoveryStrategies;
  {
  /**
   * Attempt to recover from message parsing errors
   * @param {string} buffer - Corrupted message buffer
   * @returns {Array} Recovered messages
   */
  static recoverFromParsingError(buffer): any {
    const recovered = [];

    try {
      // Try to find valid JSON objects in the buffer
      const jsonMatches = buffer.match(/\{[^{}]*\}/g) || [];

      for (const match of jsonMatches) {
        try {
          const message = JSON.parse(match);
          recovered.push(message);
        } catch (_e) {
          // Skip invalid JSON
        }
      }
    } catch (_error) {
      console.error(`[${new Date().toISOString()}] WARN [ErrorRecovery] Buffer recoveryfailed = JSON.stringify({ 
          jsonrpc => {
          process.stdout.write(testMessage, (error) => {
            resolve(!error);
          });
        });
      }
      
      return false;
    } catch(error) {
      console.error(`[${new Date().toISOString()}
      ] WARN [ErrorRecovery] Connection recovery failed = 
        ...state,
        messageBuffer: '',
        pendingMessages: [],
        errorCount: Math.min(state.errorCount || 0, 100) // Reset if too high;

      return cleanState;
    }
    catch(error) 
      console.error(`[$
      new Date().toISOString()
    ] WARN [ErrorRecovery] State cleanup failed:`, error)
    return {};
  }
}
