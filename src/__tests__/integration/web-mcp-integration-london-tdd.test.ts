/**
 * Claude-Zen Web ↔ MCP Integration Layer - London School TDD Tests
 *
 * Testing the integration layer that bridges Web API and MCP server using London School principles:
 * - Outside-in development from user API requests to MCP protocol
 * - Mock-driven contracts for seamless component bridging
 * - Behavior verification for request/response transformation
 * - Focus on protocol translation and error handling
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

// === MOCK DEPENDENCIES (London School Contract Definition) ===

// Mock Web API Server - HTTP request handling contract
const mockWebApiServer = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  use: jest.fn(),
  listen: jest.fn(),
  close: jest.fn(),
};

// Mock MCP Server - Protocol communication contract
const mockMcpServer = {
  call: jest.fn(),
  listTools: jest.fn(),
  getCapabilities: jest.fn(),
  notify: jest.fn(),
};

// Mock Request Transformer - HTTP to MCP transformation contract
const mockRequestTransformer = {
  httpToMcp: jest.fn(),
  mcpToHttp: jest.fn(),
  validateHttpRequest: jest.fn(),
  validateMcpResponse: jest.fn(),
};

// Mock Response Formatter - Response standardization contract
const mockResponseFormatter = {
  formatSuccess: jest.fn(),
  formatError: jest.fn(),
  formatStream: jest.fn(),
  addMetadata: jest.fn(),
};

// Mock Error Handler - Error transformation contract
const mockErrorHandler = {
  handleMcpError: jest.fn(),
  handleHttpError: jest.fn(),
  createErrorResponse: jest.fn(),
  logError: jest.fn(),
};

// Mock Authentication - Security contract
const mockAuthHandler = {
  validateApiKey: jest.fn(),
  checkPermissions: jest.fn(),
  createAuthContext: jest.fn(),
};

// === CONTRACT INTERFACES ===

interface IntegrationLayerContract {
  initialize(webPort: number, mcpEndpoint: string): Promise<void>;
  bridgeRequest(httpRequest: any): Promise<any>;
  setupRoutes(): void;
  shutdown(): Promise<void>;
}

interface RequestTransformationContract {
  httpToMcp(httpRequest: any): any;
  mcpToHttp(mcpResponse: any): any;
  validateTransformation(original: any, transformed: any): boolean;
}

interface ErrorBridgingContract {
  transformMcpError(mcpError: any): any;
  transformHttpError(httpError: any): any;
  shouldRetry(error: any): boolean;
}

describe('Claude-Zen Web ↔ MCP Integration Layer - London School TDD', () => {
  // Mock Integration Layer class (based on architectural needs)
  class MockWebMcpIntegrationLayer {
    constructor() {
      this.webServer = mockWebApiServer;
      this.mcpServer = mockMcpServer;
      this.requestTransformer = mockRequestTransformer;
      this.responseFormatter = mockResponseFormatter;
      this.errorHandler = mockErrorHandler;
      this.authHandler = mockAuthHandler;
    }

    async initialize(webPort: number, _mcpEndpoint: string) {
      // Setup web server
      mockWebApiServer.listen.mockResolvedValue(undefined);
      await mockWebApiServer.listen(webPort);

      // Setup routes
      this.setupRoutes();

      return Promise.resolve();
    }

    setupRoutes() {
      // Route: List available tools
      mockWebApiServer.get('/api/tools', async (req: any, res: any) => {
        return this.handleToolsList(req, res);
      });

      // Route: Execute tool
      mockWebApiServer.post('/api/tools/:toolName', async (req: any, res: any) => {
        return this.handleToolExecution(req, res);
      });

      // Route: Queen task coordination
      mockWebApiServer.post('/api/queens/:queenType/task', async (req: any, res: any) => {
        return this.handleQueenTask(req, res);
      });
    }

    async handleToolsList(req: any, _res: any) {
      try {
        // Authenticate request
        const _authContext = await mockAuthHandler.validateApiKey(req.headers.authorization);

        // Get tools from MCP server
        const mcpResponse = await mockMcpServer.listTools();

        // Transform to HTTP response
        const httpResponse = mockRequestTransformer.mcpToHttp(mcpResponse);

        // Format response
        return mockResponseFormatter.formatSuccess(httpResponse);
      } catch (error) {
        return mockErrorHandler.handleHttpError(error);
      }
    }

    async handleToolExecution(req: any, _res: any) {
      try {
        // Validate and transform request
        const isValid = mockRequestTransformer.validateHttpRequest(req);
        if (!isValid) {
          throw new Error('Invalid request format');
        }

        const mcpRequest = mockRequestTransformer.httpToMcp({
          method: 'tools/call',
          params: {
            name: req.params.toolName,
            arguments: req.body,
          },
        });

        // Execute via MCP
        const mcpResponse = await mockMcpServer.call(mcpRequest);

        // Transform back to HTTP
        const httpResponse = mockRequestTransformer.mcpToHttp(mcpResponse);

        return mockResponseFormatter.formatSuccess(httpResponse);
      } catch (error) {
        const transformedError = mockErrorHandler.handleMcpError(error);
        return mockResponseFormatter.formatError(transformedError);
      }
    }

    async handleQueenTask(req: any, _res: any) {
      try {
        const queenType = req.params.queenType;
        const task = req.body;

        // Transform to Queen-specific MCP call
        const mcpRequest = mockRequestTransformer.httpToMcp({
          method: 'tools/call',
          params: {
            name: `queen-${queenType}-process`,
            arguments: {
              task,
              queenType,
              context: req.headers['x-context'] || 'default',
            },
          },
        });

        // Execute Queen task via MCP
        const mcpResponse = await mockMcpServer.call(mcpRequest);

        // Format Queen response
        const queenResponse = mockRequestTransformer.mcpToHttp(mcpResponse);
        return mockResponseFormatter.formatSuccess({
          queenType,
          taskId: queenResponse.taskId,
          status: queenResponse.status,
          result: queenResponse.result,
        });
      } catch (error) {
        return mockErrorHandler.handleQueenError(error, req.params.queenType);
      }
    }
  }

  describe('🎯 Acceptance Tests - Web to MCP Bridge', () => {
    describe('User Story: API Tool Discovery', () => {
      it('should expose MCP tools through REST API with proper transformation', async () => {
        // Arrange - Mock tool discovery workflow
        mockAuthHandler.validateApiKey.mockResolvedValue({ valid: true, user: 'test-user' });
        mockMcpServer.listTools.mockResolvedValue({
          jsonrpc: '2.0',
          id: 1,
          result: {
            tools: [
              { name: 'claude-zen-analyze', description: 'Analyze code architecture' },
              { name: 'queen-architect-design', description: 'Design system architecture' },
            ],
          },
        });

        mockRequestTransformer.mcpToHttp.mockReturnValue({
          tools: [
            { name: 'claude-zen-analyze', description: 'Analyze code architecture' },
            { name: 'queen-architect-design', description: 'Design system architecture' },
          ],
        });

        mockResponseFormatter.formatSuccess.mockReturnValue({
          status: 'success',
          data: {
            tools: [
              { name: 'claude-zen-analyze', description: 'Analyze code architecture' },
              { name: 'queen-architect-design', description: 'Design system architecture' },
            ],
          },
        });

        const integrationLayer = new MockWebMcpIntegrationLayer();

        // Act - Request tools list via HTTP API
        const mockReq = {
          headers: { authorization: 'Bearer test-token' },
        };
        const mockRes = {};

        const response = await integrationLayer.handleToolsList(mockReq, mockRes);

        // Assert - Verify complete transformation chain
        expect(mockAuthHandler.validateApiKey).toHaveBeenCalledWith('Bearer test-token');
        expect(mockMcpServer.listTools).toHaveBeenCalled();
        expect(mockRequestTransformer.mcpToHttp).toHaveBeenCalledWith(
          expect.objectContaining({
            result: expect.objectContaining({
              tools: expect.any(Array),
            }),
          })
        );
        expect(mockResponseFormatter.formatSuccess).toHaveBeenCalled();

        expect(response.status).toBe('success');
        expect(response.data.tools).toHaveLength(2);
        expect(response.data.tools[0].name).toBe('claude-zen-analyze');
      });
    });

    describe('User Story: Tool Execution via REST API', () => {
      it('should execute MCP tools through HTTP endpoints with parameter transformation', async () => {
        // Arrange - Mock tool execution workflow
        const httpToolRequest = {
          params: { toolName: 'claude-zen-analyze' },
          body: {
            codebase: 'typescript-monorepo',
            focus: 'architecture',
          },
        };

        mockRequestTransformer.validateHttpRequest.mockReturnValue(true);
        mockRequestTransformer.httpToMcp.mockReturnValue({
          method: 'tools/call',
          params: {
            name: 'claude-zen-analyze',
            arguments: {
              codebase: 'typescript-monorepo',
              focus: 'architecture',
            },
          },
        });

        mockMcpServer.call.mockResolvedValue({
          jsonrpc: '2.0',
          id: 1,
          result: {
            analysis: 'clean-architecture-detected',
            recommendations: ['enhance-separation-of-concerns'],
            confidence: 0.91,
          },
        });

        mockRequestTransformer.mcpToHttp.mockReturnValue({
          analysis: 'clean-architecture-detected',
          recommendations: ['enhance-separation-of-concerns'],
          confidence: 0.91,
        });

        mockResponseFormatter.formatSuccess.mockReturnValue({
          status: 'success',
          data: {
            analysis: 'clean-architecture-detected',
            recommendations: ['enhance-separation-of-concerns'],
            confidence: 0.91,
          },
        });

        const integrationLayer = new MockWebMcpIntegrationLayer();

        // Act - Execute tool via HTTP
        const response = await integrationLayer.handleToolExecution(httpToolRequest, {});

        // Assert - Verify request/response transformation chain
        expect(mockRequestTransformer.validateHttpRequest).toHaveBeenCalledWith(httpToolRequest);
        expect(mockRequestTransformer.httpToMcp).toHaveBeenCalledWith({
          method: 'tools/call',
          params: {
            name: 'claude-zen-analyze',
            arguments: {
              codebase: 'typescript-monorepo',
              focus: 'architecture',
            },
          },
        });
        expect(mockMcpServer.call).toHaveBeenCalled();
        expect(mockRequestTransformer.mcpToHttp).toHaveBeenCalled();
        expect(mockResponseFormatter.formatSuccess).toHaveBeenCalled();

        expect(response.status).toBe('success');
        expect(response.data.analysis).toBe('clean-architecture-detected');
        expect(response.data.confidence).toBe(0.91);
      });
    });

    describe('User Story: Queen Task Coordination via API', () => {
      it('should route Queen tasks through MCP with proper context handling', async () => {
        // Arrange - Mock Queen task coordination
        const queenTaskRequest = {
          params: { queenType: 'architect' },
          headers: { 'x-context': 'microservices-project' },
          body: {
            task: 'design-api-gateway',
            requirements: ['scalability', 'security'],
            deadline: '2024-08-15',
          },
        };

        mockRequestTransformer.httpToMcp.mockReturnValue({
          method: 'tools/call',
          params: {
            name: 'queen-architect-process',
            arguments: {
              task: {
                task: 'design-api-gateway',
                requirements: ['scalability', 'security'],
                deadline: '2024-08-15',
              },
              queenType: 'architect',
              context: 'microservices-project',
            },
          },
        });

        mockMcpServer.call.mockResolvedValue({
          jsonrpc: '2.0',
          id: 1,
          result: {
            taskId: 'queen-arch-task-001',
            status: 'in-progress',
            result: {
              design: 'api-gateway-blueprint',
              estimated_completion: '2024-08-10',
            },
          },
        });

        mockRequestTransformer.mcpToHttp.mockReturnValue({
          taskId: 'queen-arch-task-001',
          status: 'in-progress',
          result: {
            design: 'api-gateway-blueprint',
            estimated_completion: '2024-08-10',
          },
        });

        mockResponseFormatter.formatSuccess.mockReturnValue({
          status: 'success',
          data: {
            queenType: 'architect',
            taskId: 'queen-arch-task-001',
            status: 'in-progress',
            result: {
              design: 'api-gateway-blueprint',
              estimated_completion: '2024-08-10',
            },
          },
        });

        const integrationLayer = new MockWebMcpIntegrationLayer();

        // Act - Execute Queen task via API
        const response = await integrationLayer.handleQueenTask(queenTaskRequest, {});

        // Assert - Verify Queen coordination workflow
        expect(mockRequestTransformer.httpToMcp).toHaveBeenCalledWith({
          method: 'tools/call',
          params: {
            name: 'queen-architect-process',
            arguments: {
              task: queenTaskRequest.body,
              queenType: 'architect',
              context: 'microservices-project',
            },
          },
        });
        expect(mockMcpServer.call).toHaveBeenCalled();
        expect(mockResponseFormatter.formatSuccess).toHaveBeenCalledWith({
          queenType: 'architect',
          taskId: 'queen-arch-task-001',
          status: 'in-progress',
          result: expect.any(Object),
        });

        expect(response.data.queenType).toBe('architect');
        expect(response.data.taskId).toBe('queen-arch-task-001');
        expect(response.data.result.design).toBe('api-gateway-blueprint');
      });
    });
  });

  describe('🔗 Contract Verification - Protocol Translation', () => {
    describe('Error Transformation', () => {
      it('should properly transform MCP errors to HTTP error responses', async () => {
        // Arrange - Mock error scenarios
        const mcpError = {
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32602,
            message: 'Invalid params',
            data: { param: 'arguments', reason: 'missing required field' },
          },
        };

        mockRequestTransformer.validateHttpRequest.mockReturnValue(true);
        mockRequestTransformer.httpToMcp.mockReturnValue({
          method: 'tools/call',
          params: { name: 'invalid-tool' },
        });

        mockMcpServer.call.mockRejectedValue(mcpError);

        mockErrorHandler.handleMcpError.mockReturnValue({
          type: 'validation_error',
          message: 'Invalid request parameters',
          details: 'missing required field in arguments',
          code: 400,
        });

        mockResponseFormatter.formatError.mockReturnValue({
          status: 'error',
          error: {
            type: 'validation_error',
            message: 'Invalid request parameters',
            code: 400,
          },
        });

        const integrationLayer = new MockWebMcpIntegrationLayer();

        // Act - Handle error during tool execution
        const response = await integrationLayer.handleToolExecution(
          {
            params: { toolName: 'invalid-tool' },
            body: {},
          },
          {}
        );

        // Assert - Verify error transformation chain
        expect(mockMcpServer.call).toHaveBeenCalled();
        expect(mockErrorHandler.handleMcpError).toHaveBeenCalledWith(mcpError);
        expect(mockResponseFormatter.formatError).toHaveBeenCalled();

        expect(response.status).toBe('error');
        expect(response.error.type).toBe('validation_error');
        expect(response.error.code).toBe(400);
      });
    });
  });

  describe('🧪 London School Patterns - Integration Focus', () => {
    it('should demonstrate protocol bridging through interaction testing', () => {
      // London School: Test HOW protocols communicate, not implementation details
      const mockProtocolBridge = {
        translateRequest: jest.fn(),
        translateResponse: jest.fn(),
        validateTranslation: jest.fn(),
      };

      const protocolIntegrator = {
        bridge: (sourceRequest: any, _sourceProtocol: string, targetProtocol: string) => {
          const translated = mockProtocolBridge.translateRequest(sourceRequest, targetProtocol);
          const isValid = mockProtocolBridge.validateTranslation(sourceRequest, translated);

          if (!isValid) {
            throw new Error('Translation validation failed');
          }

          return translated;
        },
      };

      // Mock the protocol translation conversation
      mockProtocolBridge.translateRequest.mockReturnValue({ method: 'translated', params: {} });
      mockProtocolBridge.validateTranslation.mockReturnValue(true);

      // Act - Test protocol bridging
      const httpRequest = { endpoint: '/api/test', body: { data: 'test' } };
      const result = protocolIntegrator.bridge(httpRequest, 'HTTP', 'MCP');

      // Assert - Verify protocol interaction
      expect(mockProtocolBridge.translateRequest).toHaveBeenCalledWith(httpRequest, 'MCP');
      expect(mockProtocolBridge.validateTranslation).toHaveBeenCalledWith(httpRequest, result);
      expect(result.method).toBe('translated');
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
