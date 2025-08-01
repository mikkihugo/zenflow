/**
 * MCP Tool Registration and Discovery - TDD London Style
 *
 * Tests tool registration and discovery mechanisms using London School principles:
 * - Mock tool registry to focus on registration contracts
 * - Test tool discovery and enumeration behavior
 * - Verify tool metadata validation and schema compliance
 * - Focus on interaction patterns between components
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type {
  MCPContext,
  MCPRequest,
  MCPResponse,
  MCPTool,
  MCPToolCall,
  MCPToolResult,
} from '../../../../utils/types';

// === MOCK DEPENDENCIES (London School Contract Definition) ===

const mockToolRegistry = {
  register: jest.fn(),
  unregister: jest.fn(),
  get: jest.fn(),
  list: jest.fn(),
  exists: jest.fn(),
  validateTool: jest.fn(),
  getSchema: jest.fn(),
};

const mockSchemaValidator = {
  validateToolDefinition: jest.fn(),
  validateInputSchema: jest.fn(),
  validateToolCall: jest.fn(),
};

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockMetricsCollector = {
  recordToolRegistration: jest.fn(),
  recordToolDiscovery: jest.fn(),
  recordToolCall: jest.fn(),
  incrementCounter: jest.fn(),
};

const mockEventBus = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

// === CONTRACT INTERFACES ===

interface ToolRegistryContract {
  registerTool(tool: MCPTool): Promise<RegistrationResult>;
  unregisterTool(name: string): Promise<boolean>;
  discoverTools(): Promise<MCPTool[]>;
  getTool(name: string): Promise<MCPTool | null>;
  validateToolDefinition(tool: MCPTool): Promise<ValidationResult>;
}

interface RegistrationResult {
  success: boolean;
  toolName: string;
  errors?: string[];
  warnings?: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ToolDiscoveryContract {
  handleToolsList(request: MCPRequest): Promise<MCPResponse>;
  generateToolsResponse(tools: MCPTool[]): MCPResponse;
  filterToolsByCapabilities(tools: MCPTool[], capabilities: string[]): MCPTool[];
}

// === MOCK IMPLEMENTATION ===

class MockMCPToolManager implements ToolRegistryContract, ToolDiscoveryContract {
  constructor(
    private registry = mockToolRegistry,
    private validator = mockSchemaValidator,
    private logger = mockLogger,
    private metrics = mockMetricsCollector,
    private eventBus = mockEventBus
  ) {}

  async registerTool(tool: MCPTool): Promise<RegistrationResult> {
    this.logger.info('Registering tool', { name: tool.name });

    // Validate tool definition
    const validation = await this.validateToolDefinition(tool);
    if (!validation.valid) {
      this.metrics.recordToolRegistration(tool.name, 'failed');
      return {
        success: false,
        toolName: tool.name,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    // Check if tool already exists
    const exists = this.registry.exists(tool.name);
    if (exists) {
      this.logger.warn('Tool already registered, updating', { name: tool.name });
      this.eventBus.emit('tool:updated', { name: tool.name, tool });
    } else {
      this.eventBus.emit('tool:registered', { name: tool.name, tool });
    }

    // Register with registry
    const registered = this.registry.register(tool);

    if (registered) {
      this.metrics.recordToolRegistration(tool.name, 'success');
      this.logger.info('Tool registered successfully', { name: tool.name });
      return {
        success: true,
        toolName: tool.name,
        warnings: validation.warnings,
      };
    }

    return {
      success: false,
      toolName: tool.name,
      errors: ['Registry registration failed'],
    };
  }

  async unregisterTool(name: string): Promise<boolean> {
    this.logger.info('Unregistering tool', { name });

    const exists = this.registry.exists(name);
    if (!exists) {
      this.logger.warn('Tool not found for unregistration', { name });
      return false;
    }

    const unregistered = this.registry.unregister(name);
    if (unregistered) {
      this.eventBus.emit('tool:unregistered', { name });
      this.logger.info('Tool unregistered successfully', { name });
    }

    return unregistered;
  }

  async discoverTools(): Promise<MCPTool[]> {
    this.logger.debug('Discovering available tools');
    this.metrics.recordToolDiscovery();

    return this.registry.list();
  }

  async getTool(name: string): Promise<MCPTool | null> {
    this.logger.debug('Getting tool', { name });
    return this.registry.get(name);
  }

  async validateToolDefinition(tool: MCPTool): Promise<ValidationResult> {
    const schemaValidation = this.validator.validateToolDefinition(tool);
    const inputSchemaValidation = this.validator.validateInputSchema(tool.inputSchema);

    return {
      valid: schemaValidation.valid && inputSchemaValidation.valid,
      errors: [...schemaValidation.errors, ...inputSchemaValidation.errors],
      warnings: [...schemaValidation.warnings, ...inputSchemaValidation.warnings],
    };
  }

  async handleToolsList(request: MCPRequest): Promise<MCPResponse> {
    this.logger.debug('Handling tools/list request', { id: request.id });

    const tools = await this.discoverTools();
    return this.generateToolsResponse(tools);
  }

  generateToolsResponse(tools: MCPTool[]): MCPResponse {
    return {
      jsonrpc: '2.0',
      id: 'tools-list',
      result: {
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      },
    };
  }

  filterToolsByCapabilities(tools: MCPTool[], capabilities: string[]): MCPTool[] {
    return tools.filter((tool) =>
      capabilities.some(
        (cap) =>
          tool.name.includes(cap) || tool.description.toLowerCase().includes(cap.toLowerCase())
      )
    );
  }
}

describe('MCP Tool Registration and Discovery - London TDD', () => {
  describe('🎯 Acceptance Tests - Tool Registration', () => {
    describe('User Story: Register New Tool', () => {
      it('should register a valid tool with proper validation', async () => {
        // Arrange - Mock successful tool registration
        mockSchemaValidator.validateToolDefinition.mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
        });
        mockSchemaValidator.validateInputSchema.mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
        });
        mockToolRegistry.exists.mockReturnValue(false);
        mockToolRegistry.register.mockReturnValue(true);

        const toolManager = new MockMCPToolManager();

        const validTool: MCPTool = {
          name: 'code_analyzer',
          description: 'Analyzes code quality and patterns',
          inputSchema: {
            type: 'object',
            required: ['codebase'],
            properties: {
              codebase: { type: 'string', description: 'Path to codebase' },
              language: { type: 'string', enum: ['typescript', 'javascript', 'python'] },
              includeTests: { type: 'boolean', default: false },
            },
          },
          handler: jest.fn(),
        };

        // Act - Register the tool
        const result = await toolManager.registerTool(validTool);

        // Assert - Verify registration conversation (London School focus)
        expect(mockLogger.info).toHaveBeenCalledWith('Registering tool', { name: 'code_analyzer' });
        expect(mockSchemaValidator.validateToolDefinition).toHaveBeenCalledWith(validTool);
        expect(mockSchemaValidator.validateInputSchema).toHaveBeenCalledWith(validTool.inputSchema);
        expect(mockToolRegistry.exists).toHaveBeenCalledWith('code_analyzer');
        expect(mockToolRegistry.register).toHaveBeenCalledWith(validTool);
        expect(mockEventBus.emit).toHaveBeenCalledWith('tool:registered', {
          name: 'code_analyzer',
          tool: validTool,
        });
        expect(mockMetricsCollector.recordToolRegistration).toHaveBeenCalledWith(
          'code_analyzer',
          'success'
        );

        expect(result.success).toBe(true);
        expect(result.toolName).toBe('code_analyzer');
      });

      it('should reject tool with invalid schema', async () => {
        // Arrange - Mock schema validation failure
        mockSchemaValidator.validateToolDefinition.mockReturnValue({
          valid: false,
          errors: ['Tool name cannot be empty', 'Description is required'],
          warnings: [],
        });
        mockSchemaValidator.validateInputSchema.mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
        });

        const toolManager = new MockMCPToolManager();

        const invalidTool: MCPTool = {
          name: '', // Invalid: empty name
          description: '', // Invalid: empty description
          inputSchema: { type: 'object' },
          handler: jest.fn(),
        };

        // Act - Attempt to register invalid tool
        const result = await toolManager.registerTool(invalidTool);

        // Assert - Verify validation error handling
        expect(mockSchemaValidator.validateToolDefinition).toHaveBeenCalledWith(invalidTool);
        expect(mockMetricsCollector.recordToolRegistration).toHaveBeenCalledWith('', 'failed');
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Tool name cannot be empty');
        expect(result.errors).toContain('Description is required');
      });

      it('should handle tool updates when re-registering existing tool', async () => {
        // Arrange - Mock tool update scenario
        mockSchemaValidator.validateToolDefinition.mockReturnValue({
          valid: true,
          errors: [],
          warnings: ['Tool updated with new capabilities'],
        });
        mockSchemaValidator.validateInputSchema.mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
        });
        mockToolRegistry.exists.mockReturnValue(true); // Tool already exists
        mockToolRegistry.register.mockReturnValue(true);

        const toolManager = new MockMCPToolManager();

        const updatedTool: MCPTool = {
          name: 'existing_tool',
          description: 'Updated tool with enhanced features',
          inputSchema: {
            type: 'object',
            properties: {
              newFeature: { type: 'boolean' },
            },
          },
          handler: jest.fn(),
        };

        // Act - Re-register existing tool
        const result = await toolManager.registerTool(updatedTool);

        // Assert - Verify update conversation
        expect(mockToolRegistry.exists).toHaveBeenCalledWith('existing_tool');
        expect(mockLogger.warn).toHaveBeenCalledWith('Tool already registered, updating', {
          name: 'existing_tool',
        });
        expect(mockEventBus.emit).toHaveBeenCalledWith('tool:updated', {
          name: 'existing_tool',
          tool: updatedTool,
        });
        expect(result.success).toBe(true);
        expect(result.warnings).toContain('Tool updated with new capabilities');
      });
    });

    describe('User Story: Unregister Tool', () => {
      it('should unregister existing tool successfully', async () => {
        // Arrange - Mock successful unregistration
        mockToolRegistry.exists.mockReturnValue(true);
        mockToolRegistry.unregister.mockReturnValue(true);

        const toolManager = new MockMCPToolManager();

        // Act - Unregister tool
        const result = await toolManager.unregisterTool('test_tool');

        // Assert - Verify unregistration conversation
        expect(mockLogger.info).toHaveBeenCalledWith('Unregistering tool', { name: 'test_tool' });
        expect(mockToolRegistry.exists).toHaveBeenCalledWith('test_tool');
        expect(mockToolRegistry.unregister).toHaveBeenCalledWith('test_tool');
        expect(mockEventBus.emit).toHaveBeenCalledWith('tool:unregistered', {
          name: 'test_tool',
        });
        expect(result).toBe(true);
      });

      it('should handle unregistration of non-existent tool', async () => {
        // Arrange - Mock non-existent tool
        mockToolRegistry.exists.mockReturnValue(false);

        const toolManager = new MockMCPToolManager();

        // Act - Attempt to unregister non-existent tool
        const result = await toolManager.unregisterTool('nonexistent_tool');

        // Assert - Verify non-existent tool handling
        expect(mockToolRegistry.exists).toHaveBeenCalledWith('nonexistent_tool');
        expect(mockLogger.warn).toHaveBeenCalledWith('Tool not found for unregistration', {
          name: 'nonexistent_tool',
        });
        expect(mockToolRegistry.unregister).not.toHaveBeenCalled();
        expect(result).toBe(false);
      });
    });
  });

  describe('🔍 Acceptance Tests - Tool Discovery', () => {
    describe('User Story: List Available Tools', () => {
      it('should discover and return all registered tools', async () => {
        // Arrange - Mock tool discovery
        const mockTools: MCPTool[] = [
          {
            name: 'analyze_code',
            description: 'Code analysis tool',
            inputSchema: { type: 'object' },
            handler: jest.fn(),
          },
          {
            name: 'format_code',
            description: 'Code formatting tool',
            inputSchema: { type: 'object' },
            handler: jest.fn(),
          },
          {
            name: 'test_runner',
            description: 'Test execution tool',
            inputSchema: { type: 'object' },
            handler: jest.fn(),
          },
        ];

        mockToolRegistry.list.mockReturnValue(mockTools);

        const toolManager = new MockMCPToolManager();

        // Act - Discover tools
        const discoveredTools = await toolManager.discoverTools();

        // Assert - Verify discovery conversation
        expect(mockLogger.debug).toHaveBeenCalledWith('Discovering available tools');
        expect(mockMetricsCollector.recordToolDiscovery).toHaveBeenCalled();
        expect(mockToolRegistry.list).toHaveBeenCalled();
        expect(discoveredTools).toHaveLength(3);
        expect(discoveredTools).toEqual(mockTools);
      });

      it('should handle tools/list MCP request properly', async () => {
        // Arrange - Mock MCP tools/list request
        const mockTools: MCPTool[] = [
          {
            name: 'test_tool',
            description: 'Test tool for demo',
            inputSchema: {
              type: 'object',
              required: ['input'],
              properties: {
                input: { type: 'string' },
              },
            },
            handler: jest.fn(),
          },
        ];

        mockToolRegistry.list.mockReturnValue(mockTools);

        const toolManager = new MockMCPToolManager();

        const toolsListRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'tools-list-1',
          method: 'tools/list',
          params: {},
        };

        // Act - Handle tools/list request
        const response = await toolManager.handleToolsList(toolsListRequest);

        // Assert - Verify MCP response generation
        expect(mockLogger.debug).toHaveBeenCalledWith('Handling tools/list request', {
          id: 'tools-list-1',
        });
        expect(response.jsonrpc).toBe('2.0');
        expect(response.result).toBeDefined();
        expect(response.result.tools).toHaveLength(1);
        expect(response.result.tools[0]).toEqual({
          name: 'test_tool',
          description: 'Test tool for demo',
          inputSchema: {
            type: 'object',
            required: ['input'],
            properties: {
              input: { type: 'string' },
            },
          },
        });
      });
    });

    describe('User Story: Filter Tools by Capabilities', () => {
      it('should filter tools based on capability requirements', async () => {
        // Arrange - Mock tools with different capabilities
        const allTools: MCPTool[] = [
          {
            name: 'code_analyzer',
            description: 'Analyzes code quality and complexity',
            inputSchema: { type: 'object' },
            handler: jest.fn(),
          },
          {
            name: 'test_generator',
            description: 'Generates unit tests automatically',
            inputSchema: { type: 'object' },
            handler: jest.fn(),
          },
          {
            name: 'doc_writer',
            description: 'Creates documentation from code',
            inputSchema: { type: 'object' },
            handler: jest.fn(),
          },
        ];

        const toolManager = new MockMCPToolManager();

        // Act - Filter tools by capabilities
        const codeRelatedTools = toolManager.filterToolsByCapabilities(allTools, [
          'code',
          'analyzer',
        ]);
        const testRelatedTools = toolManager.filterToolsByCapabilities(allTools, [
          'test',
          'testing',
        ]);

        // Assert - Verify filtering logic
        expect(codeRelatedTools).toHaveLength(2); // code_analyzer + doc_writer (from 'code')
        expect(codeRelatedTools.map((t) => t.name)).toContain('code_analyzer');
        expect(codeRelatedTools.map((t) => t.name)).toContain('doc_writer');

        expect(testRelatedTools).toHaveLength(1); // test_generator
        expect(testRelatedTools[0].name).toBe('test_generator');
      });
    });
  });

  describe('🔗 Contract Verification - Tool Access', () => {
    describe('Individual Tool Access', () => {
      it('should retrieve specific tool by name', async () => {
        // Arrange - Mock specific tool retrieval
        const specificTool: MCPTool = {
          name: 'specific_tool',
          description: 'A specific tool for testing',
          inputSchema: { type: 'object' },
          handler: jest.fn(),
        };

        mockToolRegistry.get.mockReturnValue(specificTool);

        const toolManager = new MockMCPToolManager();

        // Act - Get specific tool
        const retrievedTool = await toolManager.getTool('specific_tool');

        // Assert - Verify tool retrieval conversation
        expect(mockLogger.debug).toHaveBeenCalledWith('Getting tool', { name: 'specific_tool' });
        expect(mockToolRegistry.get).toHaveBeenCalledWith('specific_tool');
        expect(retrievedTool).toEqual(specificTool);
      });

      it('should return null for non-existent tool', async () => {
        // Arrange - Mock non-existent tool
        mockToolRegistry.get.mockReturnValue(null);

        const toolManager = new MockMCPToolManager();

        // Act - Get non-existent tool
        const retrievedTool = await toolManager.getTool('nonexistent');

        // Assert - Verify null handling
        expect(mockToolRegistry.get).toHaveBeenCalledWith('nonexistent');
        expect(retrievedTool).toBeNull();
      });
    });
  });

  describe('🧪 London School Patterns - Event-Driven Registration', () => {
    it('should demonstrate event-driven tool lifecycle management', async () => {
      // Arrange - Mock complete tool lifecycle with events
      mockSchemaValidator.validateToolDefinition.mockReturnValue({
        valid: true,
        errors: [],
        warnings: [],
      });
      mockSchemaValidator.validateInputSchema.mockReturnValue({
        valid: true,
        errors: [],
        warnings: [],
      });
      mockToolRegistry.exists.mockReturnValue(false);
      mockToolRegistry.register.mockReturnValue(true);
      mockToolRegistry.unregister.mockReturnValue(true);

      const toolManager = new MockMCPToolManager();

      const lifecycleTool: MCPTool = {
        name: 'lifecycle_tool',
        description: 'Tool for testing lifecycle events',
        inputSchema: { type: 'object' },
        handler: jest.fn(),
      };

      // Act - Register tool
      await toolManager.registerTool(lifecycleTool);

      // Update exists mock for unregistration
      mockToolRegistry.exists.mockReturnValue(true);

      // Act - Unregister tool
      await toolManager.unregisterTool('lifecycle_tool');

      // Assert - Verify complete event conversation
      expect(mockEventBus.emit).toHaveBeenCalledWith('tool:registered', {
        name: 'lifecycle_tool',
        tool: lifecycleTool,
      });
      expect(mockEventBus.emit).toHaveBeenCalledWith('tool:unregistered', {
        name: 'lifecycle_tool',
      });

      // Verify call order
      const emitCalls = mockEventBus.emit.mock.calls;
      expect(emitCalls[0][0]).toBe('tool:registered');
      expect(emitCalls[1][0]).toBe('tool:unregistered');
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
