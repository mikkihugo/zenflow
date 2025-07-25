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
  constructor(options = {}) {
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
      totalErrors: 0,
      recoveredErrors: 0,
      permanentFailures: 0,
      circuitBreakerTrips: 0,
      lastError: null,
      errorHistory: []
    };
  }

  /**
   * Execute operation with retry logic and circuit breaker
   * @param {Function} operation - Operation to execute
   * @param {Object} context - Operation context
   * @returns {Promise<any>} Operation result
   */
  async executeWithRetry(operation, context = {}) {
    // Check circuit breaker
    if (this.circuitState === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.circuitBreakerTimeout) {
        throw new Error('Circuit breaker is OPEN - operation rejected');
      } else {
        this.circuitState = 'HALF_OPEN';
        console.error(`[${new Date().toISOString()}] INFO [ErrorHandler] Circuit breaker transitioning to HALF_OPEN`);
      }
    }

    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Operation succeeded
        this.onOperationSuccess();
        return result;
        
      } catch (error) {
        lastError = error;
        this.recordError(error, context);
        
        // Don't retry on certain error types
        if (this.isNonRetryableError(error)) {
          console.error(`[${new Date().toISOString()}] ERROR [ErrorHandler] Non-retryable error:`, error.message);
          break;
        }
        
        // Don't retry on last attempt
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Calculate retry delay with exponential backoff
        const delay = this.calculateRetryDelay(attempt);
        console.error(`[${new Date().toISOString()}] WARN [ErrorHandler] Attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`);
        
        await this.delay(delay);
      }
    }
    
    // All retries failed
    this.onOperationFailure(lastError);
    throw lastError;
  }

  /**
   * Handle operation success
   */
  onOperationSuccess() {
    this.successCount++;
    
    if (this.circuitState === 'HALF_OPEN') {
      this.circuitState = 'CLOSED';
      this.failureCount = 0;
      console.error(`[${new Date().toISOString()}] INFO [ErrorHandler] Circuit breaker CLOSED after successful operation`);
    }
  }

  /**
   * Handle operation failure
   * @param {Error} error - The error that occurred
   */
  onOperationFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // Check if circuit breaker should trip
    if (this.failureCount >= this.circuitBreakerThreshold && this.circuitState === 'CLOSED') {
      this.circuitState = 'OPEN';
      this.errorStats.circuitBreakerTrips++;
      console.error(`[${new Date().toISOString()}] ERROR [ErrorHandler] Circuit breaker OPEN after ${this.failureCount} failures`);
    }
    
    this.errorStats.permanentFailures++;
  }

  /**
   * Record error for statistics and analysis
   * @param {Error} error - The error to record
   * @param {Object} context - Error context
   */
  recordError(error, context) {
    this.errorStats.totalErrors++;
    this.errorStats.lastError = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    // Keep limited error history
    this.errorStats.errorHistory.push({
      message: error.message,
      type: error.constructor.name,
      timestamp: new Date().toISOString(),
      context: context.operation || 'unknown'
    });
    
    // Limit history size
    if (this.errorStats.errorHistory.length > 100) {
      this.errorStats.errorHistory = this.errorStats.errorHistory.slice(-50);
    }
  }

  /**
   * Check if error is non-retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error should not be retried
   */
  isNonRetryableError(error) {
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
  calculateRetryDelay(attempt) {
    const baseDelay = this.retryDelay;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
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
  createErrorResponse(id, error, context = {}) {
    let errorCode = -32603; // Internal error default
    const errorMessage = error.message;
    
    // Map common errors to appropriate codes
    if (error.message.includes('Method not found')) {
      errorCode = -32601;
    } else if (error.message.includes('Invalid arguments') || error.message.includes('Invalid JSON')) {
      errorCode = -32602;
    } else if (error.message.includes('Parse error')) {
      errorCode = -32700;
    } else if (error.message.includes('Invalid Request')) {
      errorCode = -32600;
    }
    
    const errorResponse = {
      jsonrpc: '2.0',
      id,
      error: {
        code: errorCode,
        message: errorMessage
      }
    };
    
    // Add additional error data if available
    if (context.operation) {
      errorResponse.error.data = {
        operation: context.operation,
        timestamp: new Date().toISOString()
      };
    }
    
    return errorResponse;
  }

  /**
   * Handle critical errors that require shutdown
   * @param {Error} error - Critical error
   * @param {Object} context - Error context
   */
  handleCriticalError(error, context = {}) {
    console.error(`[${new Date().toISOString()}] CRITICAL [ErrorHandler] Critical error detected:`, error);
    console.error(`[${new Date().toISOString()}] CRITICAL [ErrorHandler] Context:`, context);
    
    // Log error statistics
    console.error(`[${new Date().toISOString()}] CRITICAL [ErrorHandler] Error statistics:`, this.getErrorStats());
    
    // Emit critical error event
    process.emit('critical-error', error, context);
    
    // Graceful shutdown with timeout
    setTimeout(() => {
      console.error(`[${new Date().toISOString()}] CRITICAL [ErrorHandler] Forcing shutdown due to critical error`);
      process.exit(1);
    }, 5000);
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    return {
      ...this.errorStats,
      circuitState: this.circuitState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      errorRate: this.errorStats.totalErrors / (this.errorStats.totalErrors + this.successCount) || 0
    };
  }

  /**
   * Reset circuit breaker (manual intervention)
   */
  resetCircuitBreaker() {
    this.circuitState = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    console.error(`[${new Date().toISOString()}] INFO [ErrorHandler] Circuit breaker manually reset`);
  }

  /**
   * Utility delay function
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Error recovery strategies
 */
export class ErrorRecoveryStrategies {
  /**
   * Attempt to recover from message parsing errors
   * @param {string} buffer - Corrupted message buffer
   * @returns {Array} Recovered messages
   */
  static recoverFromParsingError(buffer) {
    const recovered = [];
    
    try {
      // Try to find valid JSON objects in the buffer
      const jsonMatches = buffer.match(/\{[^{}]*\}/g) || [];
      
      for (const match of jsonMatches) {
        try {
          const message = JSON.parse(match);
          recovered.push(message);
        } catch (e) {
          // Skip invalid JSON
        }
      }
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] WARN [ErrorRecovery] Buffer recovery failed:`, error);
    }
    
    return recovered;
  }

  /**
   * Attempt to recover connection
   * @returns {Promise<boolean>} Recovery success
   */
  static async recoverConnection() {
    try {
      // Test if stdio streams are still available
      if (process.stdout.writable && process.stdin.readable) {
        // Send a test message
        const testMessage = JSON.stringify({ 
          jsonrpc: '2.0', 
          method: 'ping', 
          id: 'connection-test' 
        }) + '\n';
        
        return new Promise((resolve) => {
          process.stdout.write(testMessage, (error) => {
            resolve(!error);
          });
        });
      }
      
      return false;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] WARN [ErrorRecovery] Connection recovery failed:`, error);
      return false;
    }
  }

  /**
   * Clean up corrupted state
   * @param {Object} state - Current state object
   * @returns {Object} Cleaned state
   */
  static cleanupState(state) {
    try {
      // Create a clean copy of the state
      const cleanState = {
        ...state,
        messageBuffer: '',
        pendingMessages: [],
        errorCount: Math.min(state.errorCount || 0, 100) // Reset if too high
      };
      
      return cleanState;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] WARN [ErrorRecovery] State cleanup failed:`, error);
      return {};
    }
  }
}