/**
 * MCP Request/Response Handling - TDD London Style
 *
 * Tests request/response handling mechanisms using London School principles:
 * - Mock message routing and processing components
 * - Test request lifecycle and response generation
 * - Verify error handling and timeout scenarios
 * - Focus on interaction patterns and communication flow
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type {
  MCPContext,
  MCPError,
  MCPNotification,
  MCPRequest,
  MCPResponse,
  MCPToolCall,
  MCPToolResult,
} from '../../../../utils/types';

// === MOCK DEPENDENCIES (London School Contract Definition) ===

const mockRequestRouter = {
  route: jest.fn(),
  addHandler: jest.fn(),
  removeHandler: jest.fn(),
  getHandler: jest.fn(),
};

const mockResponseBuilder = {
  buildSuccessResponse: jest.fn(),
  buildErrorResponse: jest.fn(),
  buildNotificationResponse: jest.fn(),
};

const mockRequestValidator = {
  validate: jest.fn(),
  validateParams: jest.fn(),
  validateMethod: jest.fn(),
};

const mockToolExecutor = {
  execute: jest.fn(),
  getExecutionContext: jest.fn(),
  setExecutionTimeout: jest.fn(),
};

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockMetricsCollector = {
  recordRequest: jest.fn(),
  recordResponse: jest.fn(),
  recordLatency: jest.fn(),
  recordError: jest.fn(),
};

const mockSessionManager = {
  getSession: jest.fn(),
  createSession: jest.fn(),
  updateActivity: jest.fn(),
  isSessionActive: jest.fn(),
};

// === CONTRACT INTERFACES ===

interface RequestHandlerContract {
  handleRequest(request: MCPRequest, context: MCPContext): Promise<MCPResponse>;
  handleNotification(notification: MCPNotification, context: MCPContext): Promise<void>;
  setRequestTimeout(timeout: number): void;
  getRequestMetrics(): RequestMetrics;
}

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  timeouts: number;
}

interface ResponseBuilderContract {
  createSuccessResponse(id: string | number, result: unknown): MCPResponse;
  createErrorResponse(id: string | number, error: MCPError): MCPResponse;
  createNotificationAck(method: string): void;
}

interface RoutingContract {
  addRoute(method: string, handler: RequestHandler): void;
  routeRequest(request: MCPRequest, context: MCPContext): Promise<MCPResponse>;
  routeNotification(notification: MCPNotification, context: MCPContext): Promise<void>;
}

type RequestHandler = (params: unknown, context: MCPContext) => Promise<unknown>;

// === MOCK IMPLEMENTATION ===

class MockMCPRequestHandler
  implements RequestHandlerContract, ResponseBuilderContract, RoutingContract
{
  private requestTimeout = 30000; // 30 seconds
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    timeouts: 0,
  };

  constructor(
    private router = mockRequestRouter,
    private responseBuilder = mockResponseBuilder,
    private validator = mockRequestValidator,
    private toolExecutor = mockToolExecutor,
    private logger = mockLogger,
    private metricsCollector = mockMetricsCollector,
    private sessionManager = mockSessionManager
  ) {}

  async handleRequest(request: MCPRequest, context: MCPContext): Promise<MCPResponse> {
    const startTime = Date.now();
    this.logger.info('Handling MCP request', {
      id: request.id,
      method: request.method,
      sessionId: context.sessionId,
    });

    this.metricsCollector.recordRequest(request.method);
    this.sessionManager.updateActivity(context.sessionId);

    try {
      // Validate request
      const validation = this.validator.validate(request);
      if (!validation.valid) {
        const errorResponse = this.createErrorResponse(request.id, {
          code: -32602,
          message: 'Invalid params',
          data: validation.errors,
        });

        this.recordRequestCompletion(startTime, false);
        return errorResponse;
      }

      // Route and execute request
      const response = await this.routeRequest(request, context);

      this.recordRequestCompletion(startTime, true);
      this.logger.info('Request completed successfully', {
        id: request.id,
        duration: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      this.logger.error('Request handling failed', {
        id: request.id,
        error: error.message,
      });

      const errorResponse = this.createErrorResponse(request.id, {
        code: -32603,
        message: 'Internal error',
        data: { error: error.message },
      });

      this.recordRequestCompletion(startTime, false);
      return errorResponse;
    }
  }

  async handleNotification(notification: MCPNotification, context: MCPContext): Promise<void> {
    this.logger.debug('Handling MCP notification', {
      method: notification.method,
      sessionId: context.sessionId,
    });

    this.sessionManager.updateActivity(context.sessionId);

    try {
      await this.routeNotification(notification, context);
      this.logger.debug('Notification handled successfully', { method: notification.method });
    } catch (error) {
      this.logger.error('Notification handling failed', {
        method: notification.method,
        error: error.message,
      });
    }
  }

  async routeRequest(request: MCPRequest, context: MCPContext): Promise<MCPResponse> {
    const handler = this.router.getHandler(request.method);
    if (!handler) {
      throw new Error(`No handler found for method: ${request.method}`);
    }

    const result = await Promise.race([
      handler(request.params, context),
      this.createTimeoutPromise(),
    ]);

    if (result === 'TIMEOUT') {
      this.metrics.timeouts++;
      throw new Error('Request timeout');
    }

    return this.createSuccessResponse(request.id, result);
  }

  async routeNotification(notification: MCPNotification, context: MCPContext): Promise<void> {
    const handler = this.router.getHandler(notification.method);
    if (handler) {
      await handler(notification.params, context);
    } else {
      this.logger.warn('No handler for notification', { method: notification.method });
    }
  }

  createSuccessResponse(id: string | number, result: unknown): MCPResponse {
    return this.responseBuilder.buildSuccessResponse(id, result);
  }

  createErrorResponse(id: string | number, error: MCPError): MCPResponse {
    return this.responseBuilder.buildErrorResponse(id, error);
  }

  createNotificationAck(method: string): void {
    this.logger.debug('Notification acknowledged', { method });
  }

  addRoute(method: string, handler: RequestHandler): void {
    this.router.addHandler(method, handler);
    this.logger.debug('Route added', { method });
  }

  setRequestTimeout(timeout: number): void {
    this.requestTimeout = timeout;
  }

  getRequestMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  private createTimeoutPromise(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve('TIMEOUT'), this.requestTimeout);
    });
  }

  private recordRequestCompletion(startTime: number, success: boolean): void {
    const duration = Date.now() - startTime;

    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update rolling average
    const totalCompleted = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (totalCompleted - 1) + duration) / totalCompleted;

    this.metricsCollector.recordLatency(duration);
    if (!success) {
      this.metricsCollector.recordError('request_failed');
    }
  }
}

describe('MCP Request/Response Handling - London TDD', () => {
  describe('🎯 Acceptance Tests - Request Processing', () => {
    describe('User Story: Handle Standard MCP Requests', () => {
      it('should process tools/list request successfully', async () => {
        // Arrange - Mock tools/list handling
        mockRequestValidator.validate.mockReturnValue({ valid: true, errors: [] });
        mockRequestRouter.getHandler.mockReturnValue(async () => {
          return {
            tools: [
              {
                name: 'test_tool',
                description: 'Test tool',
                inputSchema: { type: 'object' },
              },
            ],
          };
        });
        mockResponseBuilder.buildSuccessResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'tools-1',
          result: {
            tools: [
              {
                name: 'test_tool',
                description: 'Test tool',
                inputSchema: { type: 'object' },
              },
            ],
          },
        });
        mockSessionManager.updateActivity.mockReturnValue(undefined);

        const handler = new MockMCPRequestHandler();

        const toolsListRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'tools-1',
          method: 'tools/list',
          params: {},
        };

        const context: MCPContext = {
          sessionId: 'session-123',
          logger: mockLogger,
        };

        // Act - Handle tools/list request
        const response = await handler.handleRequest(toolsListRequest, context);

        // Assert - Verify request processing conversation
        expect(mockLogger.info).toHaveBeenCalledWith('Handling MCP request', {
          id: 'tools-1',
          method: 'tools/list',
          sessionId: 'session-123',
        });
        expect(mockRequestValidator.validate).toHaveBeenCalledWith(toolsListRequest);
        expect(mockRequestRouter.getHandler).toHaveBeenCalledWith('tools/list');
        expect(mockSessionManager.updateActivity).toHaveBeenCalledWith('session-123');
        expect(mockMetricsCollector.recordRequest).toHaveBeenCalledWith('tools/list');
        expect(mockResponseBuilder.buildSuccessResponse).toHaveBeenCalledWith(
          'tools-1',
          expect.objectContaining({ tools: expect.any(Array) })
        );

        expect(response.jsonrpc).toBe('2.0');
        expect(response.id).toBe('tools-1');
        expect(response.result).toBeDefined();
      });

      it('should process tools/call request with proper execution context', async () => {
        // Arrange - Mock tools/call handling
        mockRequestValidator.validate.mockReturnValue({ valid: true, errors: [] });
        mockRequestRouter.getHandler.mockReturnValue(async (params, context) => {
          // Simulate tool execution
          const toolResult = await mockToolExecutor.execute(params.name, params.arguments);
          return toolResult;
        });
        mockToolExecutor.execute.mockResolvedValue({
          content: [
            {
              type: 'text',
              text: 'Analysis complete: Found 5 issues in codebase',
            },
          ],
        });
        mockResponseBuilder.buildSuccessResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'tool-call-1',
          result: {
            content: [
              {
                type: 'text',
                text: 'Analysis complete: Found 5 issues in codebase',
              },
            ],
          },
        });

        const handler = new MockMCPRequestHandler();

        const toolCallRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'tool-call-1',
          method: 'tools/call',
          params: {
            name: 'analyze_code',
            arguments: {
              codebase: '/path/to/project',
              language: 'typescript',
            },
          },
        };

        const context: MCPContext = {
          sessionId: 'session-456',
          agentId: 'agent-789',
          logger: mockLogger,
        };

        // Act - Handle tool call
        const response = await handler.handleRequest(toolCallRequest, context);

        // Assert - Verify tool execution conversation
        expect(mockRequestRouter.getHandler).toHaveBeenCalledWith('tools/call');
        expect(mockToolExecutor.execute).toHaveBeenCalledWith('analyze_code', {
          codebase: '/path/to/project',
          language: 'typescript',
        });
        expect(response.result).toBeDefined();
        expect(response.result.content[0].text).toContain('Analysis complete');
      });
    });

    describe('User Story: Handle Request Validation Errors', () => {
      it('should return validation error for invalid request', async () => {
        // Arrange - Mock validation failure
        mockRequestValidator.validate.mockReturnValue({
          valid: false,
          errors: ['Method is required', 'Invalid JSON-RPC format'],
        });
        mockResponseBuilder.buildErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'invalid-1',
          error: {
            code: -32602,
            message: 'Invalid params',
            data: ['Method is required', 'Invalid JSON-RPC format'],
          },
        });

        const handler = new MockMCPRequestHandler();

        const invalidRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'invalid-1',
          method: '', // Invalid: empty method
          params: 'invalid-params', // Invalid: should be object
        } as any;

        const context: MCPContext = {
          sessionId: 'session-error',
          logger: mockLogger,
        };

        // Act - Handle invalid request
        const response = await handler.handleRequest(invalidRequest, context);

        // Assert - Verify validation error handling
        expect(mockRequestValidator.validate).toHaveBeenCalledWith(invalidRequest);
        expect(mockResponseBuilder.buildErrorResponse).toHaveBeenCalledWith('invalid-1', {
          code: -32602,
          message: 'Invalid params',
          data: ['Method is required', 'Invalid JSON-RPC format'],
        });
        expect(response.error).toBeDefined();
        expect(response.error.code).toBe(-32602);
      });

      it('should handle method not found errors', async () => {
        // Arrange - Mock method not found
        mockRequestValidator.validate.mockReturnValue({ valid: true, errors: [] });
        mockRequestRouter.getHandler.mockReturnValue(null); // No handler found
        mockResponseBuilder.buildErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'not-found-1',
          error: {
            code: -32603,
            message: 'Internal error',
            data: { error: 'No handler found for method: unknown/method' },
          },
        });

        const handler = new MockMCPRequestHandler();

        const unknownMethodRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'not-found-1',
          method: 'unknown/method',
          params: {},
        };

        const context: MCPContext = {
          sessionId: 'session-unknown',
          logger: mockLogger,
        };

        // Act - Handle unknown method request
        const response = await handler.handleRequest(unknownMethodRequest, context);

        // Assert - Verify method not found handling
        expect(mockRequestRouter.getHandler).toHaveBeenCalledWith('unknown/method');
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Request handling failed',
          expect.objectContaining({
            id: 'not-found-1',
            error: expect.stringContaining('No handler found'),
          })
        );
        expect(response.error).toBeDefined();
        expect(response.error.code).toBe(-32603);
      });
    });
  });

  describe('🔔 Acceptance Tests - Notification Handling', () => {
    describe('User Story: Process MCP Notifications', () => {
      it('should handle notifications without response', async () => {
        // Arrange - Mock notification handling
        mockRequestRouter.getHandler.mockReturnValue(async (params, context) => {
          // Simulate notification processing
          mockLogger.info('Processing notification', { params, sessionId: context.sessionId });
          return undefined; // Notifications don't return responses
        });

        const handler = new MockMCPRequestHandler();

        const logNotification: MCPNotification = {
          jsonrpc: '2.0',
          method: 'notifications/message',
          params: {
            level: 'info',
            message: 'Task completed successfully',
            logger: 'agent-executor',
          },
        };

        const context: MCPContext = {
          sessionId: 'session-notification',
          logger: mockLogger,
        };

        // Act - Handle notification
        await handler.handleNotification(logNotification, context);

        // Assert - Verify notification processing conversation
        expect(mockLogger.debug).toHaveBeenCalledWith('Handling MCP notification', {
          method: 'notifications/message',
          sessionId: 'session-notification',
        });
        expect(mockSessionManager.updateActivity).toHaveBeenCalledWith('session-notification');
        expect(mockRequestRouter.getHandler).toHaveBeenCalledWith('notifications/message');
        expect(mockLogger.debug).toHaveBeenCalledWith('Notification handled successfully', {
          method: 'notifications/message',
        });
      });

      it('should handle notifications for unknown methods gracefully', async () => {
        // Arrange - Mock unknown notification method
        mockRequestRouter.getHandler.mockReturnValue(null); // No handler

        const handler = new MockMCPRequestHandler();

        const unknownNotification: MCPNotification = {
          jsonrpc: '2.0',
          method: 'unknown/notification',
          params: { data: 'test' },
        };

        const context: MCPContext = {
          sessionId: 'session-unknown-notification',
          logger: mockLogger,
        };

        // Act - Handle unknown notification
        await handler.handleNotification(unknownNotification, context);

        // Assert - Verify graceful handling of unknown notifications
        expect(mockRequestRouter.getHandler).toHaveBeenCalledWith('unknown/notification');
        expect(mockLogger.warn).toHaveBeenCalledWith('No handler for notification', {
          method: 'unknown/notification',
        });
        // Should not throw error for unknown notifications
      });
    });
  });

  describe('⏱️ Acceptance Tests - Timeout Handling', () => {
    describe('User Story: Handle Request Timeouts', () => {
      it('should timeout long-running requests', async () => {
        // Arrange - Mock long-running request that times out
        mockRequestValidator.validate.mockReturnValue({ valid: true, errors: [] });
        mockRequestRouter.getHandler.mockReturnValue(async () => {
          // Simulate long-running operation that exceeds timeout
          await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay for test
          return { result: 'completed' };
        });
        mockResponseBuilder.buildErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'timeout-1',
          error: {
            code: -32603,
            message: 'Internal error',
            data: { error: 'Request timeout' },
          },
        });

        const handler = new MockMCPRequestHandler();
        handler.setRequestTimeout(50); // Very short timeout for test

        const longRunningRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'timeout-1',
          method: 'long/operation',
          params: { duration: 1000 },
        };

        const context: MCPContext = {
          sessionId: 'session-timeout',
          logger: mockLogger,
        };

        // Act - Handle request that should timeout
        const response = await handler.handleRequest(longRunningRequest, context);

        // Assert - Verify timeout handling
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Request handling failed',
          expect.objectContaining({
            id: 'timeout-1',
            error: 'Request timeout',
          })
        );
        expect(response.error).toBeDefined();
        expect(response.error.data.error).toBe('Request timeout');

        const metrics = handler.getRequestMetrics();
        expect(metrics.timeouts).toBe(1);
      });
    });
  });

  describe('🔗 Contract Verification - Response Building', () => {
    describe('Response Construction', () => {
      it('should build proper success responses', async () => {
        // Arrange - Mock response building
        const expectedResult = { status: 'success', data: { count: 42 } };
        mockResponseBuilder.buildSuccessResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'success-1',
          result: expectedResult,
        });

        const handler = new MockMCPRequestHandler();

        // Act - Build success response
        const response = handler.createSuccessResponse('success-1', expectedResult);

        // Assert - Verify success response construction
        expect(mockResponseBuilder.buildSuccessResponse).toHaveBeenCalledWith(
          'success-1',
          expectedResult
        );
        expect(response.jsonrpc).toBe('2.0');
        expect(response.id).toBe('success-1');
        expect(response.result).toEqual(expectedResult);
      });

      it('should build proper error responses', async () => {
        // Arrange - Mock error response building
        const errorDetails: MCPError = {
          code: -32000,
          message: 'Server error',
          data: { context: 'database connection failed' },
        };
        mockResponseBuilder.buildErrorResponse.mockReturnValue({
          jsonrpc: '2.0',
          id: 'error-1',
          error: errorDetails,
        });

        const handler = new MockMCPRequestHandler();

        // Act - Build error response
        const response = handler.createErrorResponse('error-1', errorDetails);

        // Assert - Verify error response construction
        expect(mockResponseBuilder.buildErrorResponse).toHaveBeenCalledWith(
          'error-1',
          errorDetails
        );
        expect(response.jsonrpc).toBe('2.0');
        expect(response.id).toBe('error-1');
        expect(response.error).toEqual(errorDetails);
      });
    });
  });

  describe('🧪 London School Patterns - Request Lifecycle', () => {
    it('should demonstrate complete request/response lifecycle', async () => {
      // Arrange - Mock complete request lifecycle
      mockRequestValidator.validate.mockReturnValue({ valid: true, errors: [] });
      mockRequestRouter.getHandler.mockReturnValue(async (params, context) => {
        return { processed: true, sessionId: context.sessionId };
      });
      mockResponseBuilder.buildSuccessResponse.mockReturnValue({
        jsonrpc: '2.0',
        id: 'lifecycle-1',
        result: { processed: true, sessionId: 'session-lifecycle' },
      });
      mockSessionManager.updateActivity.mockReturnValue(undefined);

      const handler = new MockMCPRequestHandler();

      const lifecycleRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'lifecycle-1',
        method: 'test/lifecycle',
        params: { test: true },
      };

      const context: MCPContext = {
        sessionId: 'session-lifecycle',
        logger: mockLogger,
      };

      // Act - Process complete request lifecycle
      const response = await handler.handleRequest(lifecycleRequest, context);

      // Assert - Verify complete lifecycle conversation (London School focus)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Handling MCP request',
        expect.objectContaining({ id: 'lifecycle-1', method: 'test/lifecycle' })
      );
      expect(mockMetricsCollector.recordRequest).toHaveBeenCalledWith('test/lifecycle');
      expect(mockSessionManager.updateActivity).toHaveBeenCalledWith('session-lifecycle');
      expect(mockRequestValidator.validate).toHaveBeenCalledWith(lifecycleRequest);
      expect(mockRequestRouter.getHandler).toHaveBeenCalledWith('test/lifecycle');
      expect(mockResponseBuilder.buildSuccessResponse).toHaveBeenCalledWith(
        'lifecycle-1',
        expect.objectContaining({ processed: true })
      );
      expect(mockMetricsCollector.recordLatency).toHaveBeenCalledWith(expect.any(Number));
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request completed successfully',
        expect.objectContaining({ id: 'lifecycle-1' })
      );

      expect(response.result.processed).toBe(true);

      const metrics = handler.getRequestMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
    });
  });

  // Clean test isolation - London School principle
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
