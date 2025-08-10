/**
 * MCP Protocol Message Validation - TDD London Style
 *
 * Tests protocol message validation using London School principles:
 * - Mock all dependencies to focus on interaction contracts
 * - Test behavior and communication patterns, not implementation
 * - Outside-in development from protocol requirements
 * - Verify the conversation between components
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

// === MOCK DEPENDENCIES (London School Contract Definition) ===

const mockSchemaValidator = {
  validateJsonRpc: vi.fn(),
  validateMethod: vi.fn(),
  validateParams: vi.fn(),
  validateVersion: vi.fn(),
  getSchemaForMethod: vi.fn(),
};

const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

const mockMetricsCollector = {
  recordValidation: vi.fn(),
  recordValidationError: vi.fn(),
  incrementCounter: vi.fn(),
};

// === CONTRACT INTERFACES ===

interface MessageValidatorContract {
  validate(message: unknown): Promise<ValidationResult>;
  validateRequest(request: MCPRequest): Promise<ValidationResult>;
  validateResponse(response: MCPResponse): Promise<ValidationResult>;
  validateNotification(notification: MCPNotification): Promise<ValidationResult>;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  message?: string;
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
  expected?: unknown;
  actual?: unknown;
}

// === MOCK IMPLEMENTATION ===

class MockMCPMessageValidator implements MessageValidatorContract {
  constructor(
    private schemaValidator = mockSchemaValidator,
    private logger = mockLogger,
    private metrics = mockMetricsCollector
  ) {}

  async validate(message: unknown): Promise<ValidationResult> {
    this.logger.debug('Validating MCP message', { messageType: typeof message });

    const jsonRpcResult = this.schemaValidator.validateJsonRpc(message);
    if (!jsonRpcResult?.valid) {
      this.metrics.recordValidationError('jsonrpc_invalid');
      return { valid: false, errors: jsonRpcResult?.errors };
    }

    const mcpMessage = message as MCPRequest | MCPResponse | MCPNotification;

    if ('id' in mcpMessage && 'method' in mcpMessage) {
      return this.validateRequest(mcpMessage as MCPRequest);
    } else if ('id' in mcpMessage && ('result' in mcpMessage || 'error' in mcpMessage)) {
      return this.validateResponse(mcpMessage as MCPResponse);
    } else if ('method' in mcpMessage && !('id' in mcpMessage)) {
      return this.validateNotification(mcpMessage as MCPNotification);
    }

    return {
      valid: false,
      errors: [{ field: 'message', code: 'UNKNOWN_TYPE', message: 'Unknown message type' }],
    };
  }

  async validateRequest(request: MCPRequest): Promise<ValidationResult> {
    this.logger.debug('Validating MCP request', { method: request.method });

    const methodResult = this.schemaValidator.validateMethod(request.method);
    if (!methodResult?.valid) {
      this.metrics.recordValidationError('method_invalid');
      return { valid: false, errors: methodResult?.errors };
    }

    const schema = this.schemaValidator.getSchemaForMethod(request.method);
    const paramsResult = this.schemaValidator.validateParams(request.params, schema);

    if (!paramsResult?.valid) {
      this.metrics.recordValidationError('params_invalid');
      return { valid: false, errors: paramsResult?.errors };
    }

    this.metrics.recordValidation('request_valid');
    return { valid: true, errors: [] };
  }

  async validateResponse(response: MCPResponse): Promise<ValidationResult> {
    this.logger.debug('Validating MCP response', { id: response?.id });

    if (response?.error) {
      const errorValid = this.validateError(response?.error);
      if (!errorValid.valid) {
        this.metrics.recordValidationError('error_invalid');
        return errorValid;
      }
    }

    this.metrics.recordValidation('response_valid');
    return { valid: true, errors: [] };
  }

  async validateNotification(notification: MCPNotification): Promise<ValidationResult> {
    this.logger.debug('Validating MCP notification', { method: notification.method });

    const methodResult = this.schemaValidator.validateMethod(notification.method);
    if (!methodResult?.valid) {
      this.metrics.recordValidationError('notification_method_invalid');
      return { valid: false, errors: methodResult?.errors };
    }

    this.metrics.recordValidation('notification_valid');
    return { valid: true, errors: [] };
  }

  private validateError(error: MCPError): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof error.code !== 'number') {
      errors.push({
        field: 'error.code',
        code: 'INVALID_TYPE',
        message: 'Error code must be a number',
      });
    }

    if (typeof error.message !== 'string') {
      errors.push({
        field: 'error.message',
        code: 'INVALID_TYPE',
        message: 'Error message must be a string',
      });
    }

    return { valid: errors.length === 0, errors };
  }
}

describe('MCP Protocol Message Validation - London TDD', () => {
  describe('🎯 Acceptance Tests - Protocol Compliance', () => {
    describe('JSON-RPC 2.0 Base Protocol Validation', () => {
      it('should validate required JSON-RPC 2.0 fields in requests', async () => {
        // Arrange - Mock valid JSON-RPC validation
        mockSchemaValidator.validateJsonRpc.mockReturnValue({
          valid: true,
          errors: [],
        });
        mockSchemaValidator.validateMethod.mockReturnValue({
          valid: true,
          errors: [],
        });
        mockSchemaValidator.getSchemaForMethod.mockReturnValue({ type: 'object' });
        mockSchemaValidator.validateParams.mockReturnValue({
          valid: true,
          errors: [],
        });

        const validator = new MockMCPMessageValidator();

        const validRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'test-123',
          method: 'tools/list',
          params: {},
        };

        // Act - Validate the request
        const result = await validator.validate(validRequest);

        // Assert - Verify JSON-RPC validation conversation
        expect(mockSchemaValidator.validateJsonRpc).toHaveBeenCalledWith(validRequest);
        expect(mockSchemaValidator.validateMethod).toHaveBeenCalledWith('tools/list');
        expect(mockSchemaValidator.validateParams).toHaveBeenCalledWith({}, { type: 'object' });
        expect(mockMetricsCollector.recordValidation).toHaveBeenCalledWith('request_valid');
        expect(result?.valid).toBe(true);
      });

      it('should reject messages with invalid JSON-RPC version', async () => {
        // Arrange - Mock JSON-RPC validation failure
        mockSchemaValidator.validateJsonRpc.mockReturnValue({
          valid: false,
          errors: [
            {
              field: 'jsonrpc',
              code: 'INVALID_VERSION',
              message: 'JSON-RPC version must be "2.0"',
            },
          ],
        });

        const validator = new MockMCPMessageValidator();

        const invalidRequest = {
          jsonrpc: '1.0', // Invalid version
          id: 'test-123',
          method: 'tools/list',
        };

        // Act - Validate invalid request
        const result = await validator.validate(invalidRequest);

        // Assert - Verify error handling conversation
        expect(mockSchemaValidator.validateJsonRpc).toHaveBeenCalledWith(invalidRequest);
        expect(mockMetricsCollector.recordValidationError).toHaveBeenCalledWith('jsonrpc_invalid');
        expect(result?.valid).toBe(false);
        expect(result?.errors).toHaveLength(1);
        expect(result?.errors?.[0]?.code).toBe('INVALID_VERSION');
      });
    });

    describe('MCP Method Validation', () => {
      it('should validate standard MCP methods', async () => {
        // Arrange - Mock standard MCP method validation
        mockSchemaValidator.validateJsonRpc.mockReturnValue({ valid: true, errors: [] });
        mockSchemaValidator.validateMethod.mockReturnValue({ valid: true, errors: [] });
        mockSchemaValidator.getSchemaForMethod.mockReturnValue({ type: 'object' });
        mockSchemaValidator.validateParams.mockReturnValue({ valid: true, errors: [] });

        const validator = new MockMCPMessageValidator();

        const standardMethods = [
          'initialize',
          'tools/list',
          'tools/call',
          'resources/list',
          'resources/read',
          'prompts/list',
          'prompts/get',
          'logging/setLevel',
        ];

        // Act - Validate each standard method
        for (const method of standardMethods) {
          const request: MCPRequest = {
            jsonrpc: '2.0',
            id: `test-${method}`,
            method,
            params: {},
          };

          const result = await validator.validate(request);

          // Assert - Verify method validation conversation
          expect(mockSchemaValidator.validateMethod).toHaveBeenCalledWith(method);
          expect(result?.valid).toBe(true);
        }

        expect(mockSchemaValidator.validateMethod).toHaveBeenCalledTimes(standardMethods.length);
      });

      it('should reject unknown methods', async () => {
        // Arrange - Mock unknown method rejection
        mockSchemaValidator.validateJsonRpc.mockReturnValue({ valid: true, errors: [] });
        mockSchemaValidator.validateMethod.mockReturnValue({
          valid: false,
          errors: [
            {
              field: 'method',
              code: 'UNKNOWN_METHOD',
              message: 'Method not recognized',
            },
          ],
        });

        const validator = new MockMCPMessageValidator();

        const requestWithUnknownMethod: MCPRequest = {
          jsonrpc: '2.0',
          id: 'test-123',
          method: 'unknown/method',
          params: {},
        };

        // Act - Validate unknown method
        const result = await validator.validate(requestWithUnknownMethod);

        // Assert - Verify unknown method handling
        expect(mockSchemaValidator.validateMethod).toHaveBeenCalledWith('unknown/method');
        expect(mockMetricsCollector.recordValidationError).toHaveBeenCalledWith('method_invalid');
        expect(result?.valid).toBe(false);
        expect(result?.errors?.[0]?.code).toBe('UNKNOWN_METHOD');
      });
    });

    describe('Parameter Validation', () => {
      it('should validate parameters against method schemas', async () => {
        // Arrange - Mock parameter validation
        mockSchemaValidator.validateJsonRpc.mockReturnValue({ valid: true, errors: [] });
        mockSchemaValidator.validateMethod.mockReturnValue({ valid: true, errors: [] });

        const toolCallSchema = {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            arguments: { type: 'object' },
          },
        };

        mockSchemaValidator.getSchemaForMethod.mockReturnValue(toolCallSchema);
        mockSchemaValidator.validateParams.mockReturnValue({ valid: true, errors: [] });

        const validator = new MockMCPMessageValidator();

        const toolCallRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'tool-call-1',
          method: 'tools/call',
          params: {
            name: 'analyze_code',
            arguments: {
              language: 'typescript',
              file: 'src/main.ts',
            },
          },
        };

        // Act - Validate tool call with parameters
        const result = await validator.validate(toolCallRequest);

        // Assert - Verify parameter validation conversation
        expect(mockSchemaValidator.getSchemaForMethod).toHaveBeenCalledWith('tools/call');
        expect(mockSchemaValidator.validateParams).toHaveBeenCalledWith(
          toolCallRequest.params,
          toolCallSchema
        );
        expect(result?.valid).toBe(true);
      });

      it('should reject invalid parameters', async () => {
        // Arrange - Mock parameter validation failure
        mockSchemaValidator.validateJsonRpc.mockReturnValue({ valid: true, errors: [] });
        mockSchemaValidator.validateMethod.mockReturnValue({ valid: true, errors: [] });
        mockSchemaValidator.getSchemaForMethod.mockReturnValue({
          type: 'object',
          required: ['name'],
        });
        mockSchemaValidator.validateParams.mockReturnValue({
          valid: false,
          errors: [
            {
              field: 'params.name',
              code: 'MISSING_REQUIRED',
              message: 'Required field "name" is missing',
            },
          ],
        });

        const validator = new MockMCPMessageValidator();

        const invalidToolCall: MCPRequest = {
          jsonrpc: '2.0',
          id: 'invalid-call',
          method: 'tools/call',
          params: {
            // Missing required 'name' field
            arguments: { file: 'test.ts' },
          },
        };

        // Act - Validate invalid parameters
        const result = await validator.validate(invalidToolCall);

        // Assert - Verify parameter error handling
        expect(mockSchemaValidator.validateParams).toHaveBeenCalled();
        expect(mockMetricsCollector.recordValidationError).toHaveBeenCalledWith('params_invalid');
        expect(result?.valid).toBe(false);
        expect(result?.errors?.[0]?.code).toBe('MISSING_REQUIRED');
      });
    });
  });

  describe('🔗 Contract Verification - Response Validation', () => {
    describe('Success Response Validation', () => {
      it('should validate successful response structure', async () => {
        // Arrange - Mock successful response validation
        const validator = new MockMCPMessageValidator();

        const successResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: 'test-123',
          result: {
            tools: [
              {
                name: 'analyze_code',
                description: 'Analyzes code structure and patterns',
                inputSchema: { type: 'object' },
              },
            ],
          },
        };

        // Act - Validate success response
        const result = await validator.validateResponse(successResponse);

        // Assert - Verify success response validation
        expect(mockLogger.debug).toHaveBeenCalledWith('Validating MCP response', {
          id: 'test-123',
        });
        expect(mockMetricsCollector.recordValidation).toHaveBeenCalledWith('response_valid');
        expect(result?.valid).toBe(true);
      });
    });

    describe('Error Response Validation', () => {
      it('should validate error response structure', async () => {
        // Arrange - Mock error response validation
        const validator = new MockMCPMessageValidator();

        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: 'error-test',
          error: {
            code: -32602,
            message: 'Invalid params',
            data: {
              detail: 'Parameter "name" is required',
              field: 'name',
            },
          },
        };

        // Act - Validate error response
        const result = await validator.validateResponse(errorResponse);

        // Assert - Verify error response validation
        expect(result?.valid).toBe(true);
        expect(mockMetricsCollector.recordValidation).toHaveBeenCalledWith('response_valid');
      });

      it('should reject malformed error structures', async () => {
        // Arrange - Mock malformed error validation
        const validator = new MockMCPMessageValidator();

        const malformedErrorResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: 'malformed-error',
          error: {
            code: 'not-a-number' as any, // Invalid: should be number
            message: 123 as any, // Invalid: should be string
          },
        };

        // Act - Validate malformed error
        const result = await validator.validateResponse(malformedErrorResponse);

        // Assert - Verify malformed error handling
        expect(mockMetricsCollector.recordValidationError).toHaveBeenCalledWith('error_invalid');
        expect(result?.valid).toBe(false);
        expect(result?.errors).toHaveLength(2);
        expect(result?.errors?.some((e) => e.field === 'error.code')).toBe(true);
        expect(result?.errors?.some((e) => e.field === 'error.message')).toBe(true);
      });
    });
  });

  describe('🧪 London School Patterns - Interaction Focus', () => {
    it('should demonstrate validation workflow coordination', async () => {
      // Arrange - Mock complete validation workflow
      const validator = new MockMCPMessageValidator();

      // Setup validation chain mocks
      mockSchemaValidator.validateJsonRpc.mockReturnValue({ valid: true, errors: [] });
      mockSchemaValidator.validateMethod.mockReturnValue({ valid: true, errors: [] });
      mockSchemaValidator.getSchemaForMethod.mockReturnValue({ type: 'object' });
      mockSchemaValidator.validateParams.mockReturnValue({ valid: true, errors: [] });

      const complexRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'complex-validation',
        method: 'tools/call',
        params: {
          name: 'complex_analysis',
          arguments: {
            codebase: '/path/to/project',
            options: {
              depth: 3,
              includeTests: true,
              formats: ['typescript', 'javascript'],
            },
          },
        },
      };

      // Act - Validate complex request
      const result = await validator.validate(complexRequest);

      // Assert - Verify complete validation conversation (London School focus)
      expect(mockLogger.debug).toHaveBeenCalledWith('Validating MCP message', {
        messageType: 'object',
      });
      expect(mockSchemaValidator.validateJsonRpc).toHaveBeenCalledWith(complexRequest);
      expect(mockSchemaValidator.validateMethod).toHaveBeenCalledWith('tools/call');
      expect(mockSchemaValidator.getSchemaForMethod).toHaveBeenCalledWith('tools/call');
      expect(mockSchemaValidator.validateParams).toHaveBeenCalledWith(complexRequest.params, {
        type: 'object',
      });
      expect(mockMetricsCollector.recordValidation).toHaveBeenCalledWith('request_valid');

      expect(result?.valid).toBe(true);
      expect(result?.errors).toHaveLength(0);
    });

    it('should handle validation error cascade properly', async () => {
      // Arrange - Mock validation error cascade
      const validator = new MockMCPMessageValidator();

      // First validation passes, second fails
      mockSchemaValidator.validateJsonRpc.mockReturnValue({ valid: true, errors: [] });
      mockSchemaValidator.validateMethod.mockReturnValue({
        valid: false,
        errors: [
          {
            field: 'method',
            code: 'METHOD_NOT_FOUND',
            message: 'Method does not exist',
          },
        ],
      });

      const invalidRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'cascade-test',
        method: 'nonexistent/method',
        params: {},
      };

      // Act - Validate request with method error
      const result = await validator.validate(invalidRequest);

      // Assert - Verify error cascade conversation
      expect(mockSchemaValidator.validateJsonRpc).toHaveBeenCalledWith(invalidRequest);
      expect(mockSchemaValidator.validateMethod).toHaveBeenCalledWith('nonexistent/method');

      // Should stop at method validation, not proceed to params
      expect(mockSchemaValidator.validateParams).not.toHaveBeenCalled();

      expect(mockMetricsCollector.recordValidationError).toHaveBeenCalledWith('method_invalid');
      expect(result?.valid).toBe(false);
      expect(result?.errors?.[0]?.code).toBe('METHOD_NOT_FOUND');
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
