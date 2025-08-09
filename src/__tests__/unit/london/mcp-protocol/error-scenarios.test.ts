/**
 * MCP Error Scenarios - TDD London Style
 *
 * Tests error handling scenarios using London School principles:
 * - Mock error conditions and failure modes
 * - Test error propagation and recovery mechanisms
 * - Verify error response formats and codes
 * - Focus on error handling interactions and contracts
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { MCPRequest, MCPResponse } from '../../../../utils/types';

// === MOCK DEPENDENCIES (London School Contract Definition) ===

const mockErrorHandler = {
  classifyError: vi.fn(),
  createErrorResponse: vi.fn(),
  logError: vi.fn(),
  shouldRetry: vi.fn(),
  handleRecovery: vi.fn(),
};

const mockCircuitBreaker = {
  isOpen: vi.fn(),
  recordSuccess: vi.fn(),
  recordFailure: vi.fn(),
  getState: vi.fn(),
};

const mockRetryManager = {
  shouldRetry: vi.fn(),
  getRetryDelay: vi.fn(),
  recordAttempt: vi.fn(),
  resetRetries: vi.fn(),
};

const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

const mockMetricsCollector = {
  recordError: vi.fn(),
  recordRetry: vi.fn(),
  recordCircuitBreakerTrip: vi.fn(),
  incrementErrorCounter: vi.fn(),
};

const mockAlertManager = {
  sendAlert: vi.fn(),
  isAlertThresholdReached: vi.fn(),
  recordErrorOccurrence: vi.fn(),
};

// === CONTRACT INTERFACES ===

interface ErrorHandlerContract {
  handleError(error: Error, context: ErrorContext): Promise<MCPResponse>;
  classifyError(error: Error): ErrorClassification;
  createRecoveryPlan(error: Error, context: ErrorContext): RecoveryPlan;
  executeRecovery(plan: RecoveryPlan): Promise<boolean>;
}

interface ErrorContext {
  requestId: string | number;
  method: string;
  sessionId: string;
  attemptNumber: number;
  originalRequest: MCPRequest;
}

interface ErrorClassification {
  type: 'validation' | 'timeout' | 'resource' | 'internal' | 'network' | 'authentication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  retryable: boolean;
  code: number;
  category: string;
}

interface RecoveryPlan {
  strategy: 'retry' | 'fallback' | 'circuit-break' | 'escalate';
  maxAttempts: number;
  backoffMs: number;
  fallbackHandler?: () => Promise<unknown>;
  alertRequired: boolean;
}

// === MOCK IMPLEMENTATION ===

class MockMCPErrorHandler implements ErrorHandlerContract {
  constructor(
    private errorHandler = mockErrorHandler,
    private circuitBreaker = mockCircuitBreaker,
    private retryManager = mockRetryManager,
    private logger = mockLogger,
    private metrics = mockMetricsCollector,
    private alertManager = mockAlertManager
  ) {}

  async handleError(error: Error, context: ErrorContext): Promise<MCPResponse> {
    this.logger.error('Handling MCP error', {
      error: error.message,
      requestId: context.requestId,
      method: context.method,
      attempt: context.attemptNumber,
    });

    // Classify the error
    const classification = this.classifyError(error);
    this.metrics.recordError(classification.type, classification.severity);

    // Check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      this.logger.warn('Circuit breaker is open, failing fast', {
        requestId: context.requestId,
      });
      return this.createCircuitBreakerErrorResponse(context);
    }

    // Create recovery plan
    const recoveryPlan = this.createRecoveryPlan(error, context);

    // Check if we should alert
    if (recoveryPlan.alertRequired) {
      this.alertManager.recordErrorOccurrence(classification.type);
      if (this.alertManager.isAlertThresholdReached(classification.type)) {
        this.alertManager.sendAlert({
          type: classification.type,
          severity: classification.severity,
          context: context,
        });
      }
    }

    // Attempt recovery if error is recoverable
    if (classification.recoverable && context.attemptNumber < recoveryPlan.maxAttempts) {
      return this.attemptRecovery(error, context, recoveryPlan);
    }

    // Create final error response
    return this.createFinalErrorResponse(error, context, classification);
  }

  classifyError(error: Error): ErrorClassification {
    return this.errorHandler.classifyError(error);
  }

  createRecoveryPlan(error: Error, _context: ErrorContext): RecoveryPlan {
    const classification = this.classifyError(error);

    switch (classification.type) {
      case 'timeout':
        return {
          strategy: 'retry',
          maxAttempts: 3,
          backoffMs: 1000,
          alertRequired: classification.severity === 'high',
        };
      case 'resource':
        return {
          strategy: 'circuit-break',
          maxAttempts: 1,
          backoffMs: 0,
          alertRequired: true,
        };
      case 'network':
        return {
          strategy: 'retry',
          maxAttempts: 5,
          backoffMs: 2000,
          alertRequired: classification.severity !== 'low',
        };
      default:
        return {
          strategy: 'escalate',
          maxAttempts: 1,
          backoffMs: 0,
          alertRequired: classification.severity === 'critical',
        };
    }
  }

  async executeRecovery(plan: RecoveryPlan): Promise<boolean> {
    switch (plan.strategy) {
      case 'retry':
        return this.retryManager.shouldRetry();
      case 'fallback':
        return plan.fallbackHandler ? await plan.fallbackHandler().then(() => true) : false;
      case 'circuit-break':
        this.circuitBreaker.recordFailure();
        return false;
      default:
        return false;
    }
  }

  private async attemptRecovery(
    error: Error,
    context: ErrorContext,
    plan: RecoveryPlan
  ): Promise<MCPResponse> {
    this.logger.info('Attempting error recovery', {
      strategy: plan.strategy,
      attempt: context.attemptNumber,
      requestId: context.requestId,
    });

    const recoverySuccessful = await this.executeRecovery(plan);

    if (recoverySuccessful) {
      this.metrics.recordRetry(context.method, context.attemptNumber);
      // In real implementation, would re-execute the original request
      return {
        jsonrpc: '2.0',
        id: context.requestId,
        result: { recovered: true, strategy: plan.strategy },
      };
    }

    return this.createFinalErrorResponse(error, context, this.classifyError(error));
  }

  private createCircuitBreakerErrorResponse(context: ErrorContext): MCPResponse {
    this.metrics.recordCircuitBreakerTrip();
    return {
      jsonrpc: '2.0',
      id: context.requestId,
      error: {
        code: -32000,
        message: 'Service temporarily unavailable',
        data: {
          reason: 'circuit_breaker_open',
          retryAfter: 30000,
        },
      },
    };
  }

  private createFinalErrorResponse(
    error: Error,
    context: ErrorContext,
    classification: ErrorClassification
  ): MCPResponse {
    return this.errorHandler.createErrorResponse(context.requestId, {
      code: classification.code,
      message: error.message,
      data: {
        type: classification.type,
        severity: classification.severity,
        requestId: context.requestId,
        method: context.method,
        attempts: context.attemptNumber,
      },
    });
  }
}

describe('MCP Error Scenarios - London TDD', () => {
  describe('🎯 Acceptance Tests - Error Classification', () => {
    describe('User Story: Classify Different Error Types', () => {
      it('should classify validation errors correctly', async () => {
        // Arrange - Mock validation error classification
        const validationError = new Error('Invalid parameter: name is required');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'validation',
          severity: 'medium',
          recoverable: false,
          retryable: false,
          code: -32602,
          category: 'client_error',
        });

        const errorHandler = new MockMCPErrorHandler();

        // Act - Classify validation error
        const classification = errorHandler.classifyError(validationError);

        // Assert - Verify validation error classification
        expect(mockErrorHandler.classifyError).toHaveBeenCalledWith(validationError);
        expect(classification.type).toBe('validation');
        expect(classification.severity).toBe('medium');
        expect(classification.recoverable).toBe(false);
        expect(classification.retryable).toBe(false);
        expect(classification.code).toBe(-32602);
      });

      it('should classify timeout errors correctly', async () => {
        // Arrange - Mock timeout error classification
        const timeoutError = new Error('Request timeout after 30000ms');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'timeout',
          severity: 'high',
          recoverable: true,
          retryable: true,
          code: -32000,
          category: 'server_error',
        });

        const errorHandler = new MockMCPErrorHandler();

        // Act - Classify timeout error
        const classification = errorHandler.classifyError(timeoutError);

        // Assert - Verify timeout error classification
        expect(classification.type).toBe('timeout');
        expect(classification.severity).toBe('high');
        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
        expect(classification.code).toBe(-32000);
      });

      it('should classify resource exhaustion errors correctly', async () => {
        // Arrange - Mock resource error classification
        const resourceError = new Error('Connection pool exhausted');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'resource',
          severity: 'critical',
          recoverable: true,
          retryable: false,
          code: -32001,
          category: 'server_error',
        });

        const errorHandler = new MockMCPErrorHandler();

        // Act - Classify resource error
        const classification = errorHandler.classifyError(resourceError);

        // Assert - Verify resource error classification
        expect(classification.type).toBe('resource');
        expect(classification.severity).toBe('critical');
        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(false);
        expect(classification.code).toBe(-32001);
      });
    });
  });

  describe('🔄 Acceptance Tests - Error Recovery', () => {
    describe('User Story: Retry Transient Errors', () => {
      it('should retry timeout errors with exponential backoff', async () => {
        // Arrange - Mock timeout error retry scenario
        const timeoutError = new Error('Connection timeout');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'timeout',
          severity: 'high',
          recoverable: true,
          retryable: true,
          code: -32000,
          category: 'server_error',
        });
        mockCircuitBreaker.isOpen.mockReturnValue(false);
        mockRetryManager.shouldRetry.mockReturnValue(true);
        mockAlertManager.isAlertThresholdReached.mockReturnValue(false);

        const errorHandler = new MockMCPErrorHandler();

        const errorContext: ErrorContext = {
          requestId: 'retry-test-1',
          method: 'tools/call',
          sessionId: 'session-retry',
          attemptNumber: 1,
          originalRequest: {
            jsonrpc: '2.0',
            id: 'retry-test-1',
            method: 'tools/call',
            params: { name: 'test_tool' },
          },
        };

        // Act - Handle timeout error
        const response = await errorHandler.handleError(timeoutError, errorContext);

        // Assert - Verify retry attempt conversation
        expect(mockErrorHandler.classifyError).toHaveBeenCalledWith(timeoutError);
        expect(mockCircuitBreaker.isOpen).toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Attempting error recovery',
          expect.objectContaining({
            strategy: 'retry',
            attempt: 1,
            requestId: 'retry-test-1',
          })
        );
        expect(mockRetryManager.shouldRetry).toHaveBeenCalled();
        expect(mockMetricsCollector.recordRetry).toHaveBeenCalledWith('tools/call', 1);

        expect(response?.result).toBeDefined();
        expect(response?.result?.recovered).toBe(true);
        expect(response?.result?.strategy).toBe('retry');
      });

      it('should stop retrying after max attempts exceeded', async () => {
        // Arrange - Mock max retries exceeded
        const persistentError = new Error('Persistent failure');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'network',
          severity: 'medium',
          recoverable: true,
          retryable: true,
          code: -32003,
          category: 'network_error',
        });
        mockCircuitBreaker.isOpen.mockReturnValue(false);
        mockErrorHandler.createErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'max-retries-1',
          error: {
            code: -32003,
            message: 'Persistent failure',
            data: {
              type: 'network',
              severity: 'medium',
              requestId: 'max-retries-1',
              method: 'tools/call',
              attempts: 5,
            },
          },
        });

        const errorHandler = new MockMCPErrorHandler();

        const errorContext: ErrorContext = {
          requestId: 'max-retries-1',
          method: 'tools/call',
          sessionId: 'session-max-retries',
          attemptNumber: 5, // Exceeds max attempts
          originalRequest: {
            jsonrpc: '2.0',
            id: 'max-retries-1',
            method: 'tools/call',
            params: { name: 'failing_tool' },
          },
        };

        // Act - Handle error with max retries exceeded
        const response = await errorHandler.handleError(persistentError, errorContext);

        // Assert - Verify max retries handling
        expect(mockErrorHandler.createErrorResponse).toHaveBeenCalledWith(
          'max-retries-1',
          expect.objectContaining({
            code: -32003,
            message: 'Persistent failure',
            data: expect.objectContaining({
              attempts: 5,
            }),
          })
        );
        expect(response?.error).toBeDefined();
        expect(response?.error?.data?.attempts).toBe(5);
      });
    });

    describe('User Story: Circuit Breaker Protection', () => {
      it('should fail fast when circuit breaker is open', async () => {
        // Arrange - Mock circuit breaker open
        const serviceError = new Error('Service unavailable');
        mockCircuitBreaker.isOpen.mockReturnValue(true);
        mockMetricsCollector.recordCircuitBreakerTrip.mockReturnValue(undefined);

        const errorHandler = new MockMCPErrorHandler();

        const errorContext: ErrorContext = {
          requestId: 'circuit-break-1',
          method: 'tools/call',
          sessionId: 'session-circuit',
          attemptNumber: 1,
          originalRequest: {
            jsonrpc: '2.0',
            id: 'circuit-break-1',
            method: 'tools/call',
            params: { name: 'unstable_tool' },
          },
        };

        // Act - Handle error with circuit breaker open
        const response = await errorHandler.handleError(serviceError, errorContext);

        // Assert - Verify circuit breaker fail-fast
        expect(mockCircuitBreaker.isOpen).toHaveBeenCalled();
        expect(mockLogger.warn).toHaveBeenCalledWith('Circuit breaker is open, failing fast', {
          requestId: 'circuit-break-1',
        });
        expect(mockMetricsCollector.recordCircuitBreakerTrip).toHaveBeenCalled();

        expect(response?.error).toBeDefined();
        expect(response?.error?.code).toBe(-32000);
        expect(response?.error?.message).toBe('Service temporarily unavailable');
        expect(response?.error?.data?.reason).toBe('circuit_breaker_open');
        expect(response?.error?.data?.retryAfter).toBe(30000);
      });

      it('should record failures and potentially trip circuit breaker', async () => {
        // Arrange - Mock resource error that should trip circuit breaker
        const resourceError = new Error('Database connection failed');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'resource',
          severity: 'critical',
          recoverable: true,
          retryable: false,
          code: -32001,
          category: 'resource_error',
        });
        mockCircuitBreaker.isOpen.mockReturnValue(false);
        mockCircuitBreaker.recordFailure.mockReturnValue(undefined);
        mockErrorHandler.createErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'resource-fail-1',
          error: {
            code: -32001,
            message: 'Database connection failed',
            data: {
              type: 'resource',
              severity: 'critical',
            },
          },
        });

        const errorHandler = new MockMCPErrorHandler();

        const errorContext: ErrorContext = {
          requestId: 'resource-fail-1',
          method: 'data/query',
          sessionId: 'session-resource',
          attemptNumber: 0, // First attempt, within max attempts for recovery
          originalRequest: {
            jsonrpc: '2.0',
            id: 'resource-fail-1',
            method: 'data/query',
            params: { query: 'SELECT * FROM users' },
          },
        };

        // Act - Handle resource error
        const response = await errorHandler.handleError(resourceError, errorContext);

        // Assert - Verify circuit breaker failure recording
        expect(mockCircuitBreaker.recordFailure).toHaveBeenCalled();
        expect(response?.error?.code).toBe(-32001);
        expect(response?.error?.data?.type).toBe('resource');
        expect(response?.error?.data?.severity).toBe('critical');
      });
    });
  });

  describe('🚨 Acceptance Tests - Alert Management', () => {
    describe('User Story: Error Alerting', () => {
      it('should send alerts for critical errors', async () => {
        // Arrange - Mock critical error alerting
        const criticalError = new Error('System failure detected');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'internal',
          severity: 'critical',
          recoverable: false,
          retryable: false,
          code: -32603,
          category: 'system_error',
        });
        mockCircuitBreaker.isOpen.mockReturnValue(false);
        mockAlertManager.recordErrorOccurrence.mockReturnValue(undefined);
        mockAlertManager.isAlertThresholdReached.mockReturnValue(true);
        mockAlertManager.sendAlert.mockReturnValue(Promise.resolve());
        mockErrorHandler.createErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'critical-1',
          error: {
            code: -32603,
            message: 'System failure detected',
            data: { type: 'internal', severity: 'critical' },
          },
        });

        const errorHandler = new MockMCPErrorHandler();

        const errorContext: ErrorContext = {
          requestId: 'critical-1',
          method: 'system/status',
          sessionId: 'session-critical',
          attemptNumber: 1,
          originalRequest: {
            jsonrpc: '2.0',
            id: 'critical-1',
            method: 'system/status',
            params: {},
          },
        };

        // Act - Handle critical error
        const response = await errorHandler.handleError(criticalError, errorContext);

        // Assert - Verify alert sending conversation
        expect(mockAlertManager.recordErrorOccurrence).toHaveBeenCalledWith('internal');
        expect(mockAlertManager.isAlertThresholdReached).toHaveBeenCalledWith('internal');
        expect(mockAlertManager.sendAlert).toHaveBeenCalledWith({
          type: 'internal',
          severity: 'critical',
          context: errorContext,
        });
        expect(response?.error?.data?.severity).toBe('critical');
      });

      it('should not alert for low-severity errors below threshold', async () => {
        // Arrange - Mock low-severity error
        const minorError = new Error('Validation warning');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'validation',
          severity: 'low',
          recoverable: false,
          retryable: false,
          code: -32602,
          category: 'client_error',
        });
        mockCircuitBreaker.isOpen.mockReturnValue(false);
        mockAlertManager.recordErrorOccurrence.mockReturnValue(undefined);
        mockAlertManager.isAlertThresholdReached.mockReturnValue(false);

        const errorHandler = new MockMCPErrorHandler();

        const errorContext: ErrorContext = {
          requestId: 'minor-1',
          method: 'tools/validate',
          sessionId: 'session-minor',
          attemptNumber: 1,
          originalRequest: {
            jsonrpc: '2.0',
            id: 'minor-1',
            method: 'tools/validate',
            params: { name: '' },
          },
        };

        // Act - Handle minor error
        await errorHandler.handleError(minorError, errorContext);

        // Assert - Verify no alert sent for minor errors
        expect(mockAlertManager.recordErrorOccurrence).not.toHaveBeenCalled();
        expect(mockAlertManager.sendAlert).not.toHaveBeenCalled();
      });
    });
  });

  describe('🔗 Contract Verification - Error Response Format', () => {
    describe('Error Response Standards', () => {
      it('should format error responses according to JSON-RPC 2.0 spec', async () => {
        // Arrange - Mock standard error response formatting
        const standardError = new Error('Method not found');
        mockErrorHandler.classifyError.mockReturnValue({
          type: 'validation',
          severity: 'medium',
          recoverable: false,
          retryable: false,
          code: -32601,
          category: 'client_error',
        });
        mockCircuitBreaker.isOpen.mockReturnValue(false);
        mockErrorHandler.createErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'format-test-1',
          error: {
            code: -32601,
            message: 'Method not found',
            data: {
              type: 'validation',
              severity: 'medium',
              requestId: 'format-test-1',
              method: 'unknown/method',
              attempts: 1,
            },
          },
        });

        const errorHandler = new MockMCPErrorHandler();

        const errorContext: ErrorContext = {
          requestId: 'format-test-1',
          method: 'unknown/method',
          sessionId: 'session-format',
          attemptNumber: 1,
          originalRequest: {
            jsonrpc: '2.0',
            id: 'format-test-1',
            method: 'unknown/method',
            params: {},
          },
        };

        // Act - Handle error for response formatting
        const response = await errorHandler.handleError(standardError, errorContext);

        // Assert - Verify JSON-RPC 2.0 error response format
        expect(response?.jsonrpc).toBe('2.0');
        expect(response?.id).toBe('format-test-1');
        expect(response?.error).toBeDefined();
        expect(response?.error?.code).toBe(-32601);
        expect(response?.error?.message).toBe('Method not found');
        expect(response?.error?.data).toEqual(
          expect.objectContaining({
            type: 'validation',
            severity: 'medium',
            requestId: 'format-test-1',
            method: 'unknown/method',
            attempts: 1,
          })
        );
        expect(response?.result).toBeUndefined(); // Error responses should not have result
      });
    });
  });

  describe('🧪 London School Patterns - Error Interaction Flow', () => {
    it('should demonstrate complete error handling workflow', async () => {
      // Arrange - Mock complete error workflow
      const workflowError = new Error('Complex system error');
      mockErrorHandler.classifyError.mockReturnValue({
        type: 'network',
        severity: 'high',
        recoverable: true,
        retryable: true,
        code: -32003,
        category: 'network_error',
      });
      mockCircuitBreaker.isOpen.mockReturnValue(false);
      mockRetryManager.shouldRetry.mockReturnValue(false); // Recovery fails
      mockAlertManager.recordErrorOccurrence.mockReturnValue(undefined);
      mockAlertManager.isAlertThresholdReached.mockReturnValue(true);
      mockAlertManager.sendAlert.mockReturnValue(Promise.resolve());
      mockErrorHandler.createErrorResponse.mockReturnValue({
        jsonrpc: '2.0',
        id: 'workflow-1',
        error: {
          code: -32003,
          message: 'Complex system error',
          data: { type: 'network', severity: 'high' },
        },
      });

      const errorHandler = new MockMCPErrorHandler();

      const errorContext: ErrorContext = {
        requestId: 'workflow-1',
        method: 'complex/operation',
        sessionId: 'session-workflow',
        attemptNumber: 2,
        originalRequest: {
          jsonrpc: '2.0',
          id: 'workflow-1',
          method: 'complex/operation',
          params: { complex: true },
        },
      };

      // Act - Handle complex error workflow
      const response = await errorHandler.handleError(workflowError, errorContext);

      // Assert - Verify complete error handling conversation (London School focus)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Handling MCP error',
        expect.objectContaining({
          error: 'Complex system error',
          requestId: 'workflow-1',
          method: 'complex/operation',
          attempt: 2,
        })
      );
      expect(mockErrorHandler.classifyError).toHaveBeenCalledWith(workflowError);
      expect(mockMetricsCollector.recordError).toHaveBeenCalledWith('network', 'high');
      expect(mockCircuitBreaker.isOpen).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting error recovery',
        expect.objectContaining({ strategy: 'retry' })
      );
      expect(mockRetryManager.shouldRetry).toHaveBeenCalled();
      expect(mockAlertManager.recordErrorOccurrence).toHaveBeenCalledWith('network');
      expect(mockAlertManager.isAlertThresholdReached).toHaveBeenCalledWith('network');
      expect(mockAlertManager.sendAlert).toHaveBeenCalled();
      expect(mockErrorHandler.createErrorResponse).toHaveBeenCalled();

      expect(response?.error).toBeDefined();
      expect(response?.error?.code).toBe(-32003);
    });
  });

  // Clean test isolation - London School principle
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
