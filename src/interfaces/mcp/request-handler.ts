/**
 * MCP Request Handler.
 *
 * Handles MCP protocol requests and routes them to appropriate tool handlers.
 * Implements the Model Context Protocol specification for tool calls.
 */
/**
 * @file Interface implementation: request-handler.
 */

import { getLogger } from '../../config/logging-config.ts';

const logger = getLogger('MCP-RequestHandler');

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPCapabilities {
  tools: {};
  resources: {
    list: boolean;
    read: boolean;
  };
  notifications: {
    initialized: boolean;
  };
}

export interface MCPServerInfo {
  name: string;
  version: string;
  description: string;
}

/**
 * Handles MCP protocol requests.
 *
 * @example
 */
export class MCPRequestHandler {
  private toolRegistry: MCPToolRegistry;
  private serverInfo: MCPServerInfo;
  private capabilities: MCPCapabilities;
  private initialized: boolean = false;

  constructor(toolRegistry: MCPToolRegistry) {
    this.toolRegistry = toolRegistry;

    this.serverInfo = {
      name: 'claude-zen-http-mcp',
      version: '2.0.0',
      description: 'Claude-Zen HTTP MCP Server for Claude Desktop integration',
    };

    this.capabilities = {
      tools: {},
      resources: {
        list: true,
        read: true,
      },
      notifications: {
        initialized: true,
      },
    };
  }

  /**
   * Handle incoming MCP request.
   *
   * @param request
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const response: MCPResponse = {
      jsonrpc: '2.0',
      id: request.id,
    };

    try {
      logger.debug(`Processing MCP request: ${request.method}`, {
        id: request.id,
        method: request.method,
        hasParams: !!request.params,
      });

      switch (request.method) {
        case 'initialize':
          response?.result = await this.handleInitialize(request.params);
          break;

        case 'notifications/initialized':
          response?.result = await this.handleInitialized(request.params);
          break;

        case 'tools/list':
          response?.result = await this.handleToolsList();
          break;

        case 'tools/call':
          response?.result = await this.handleToolCall(request.params);
          break;

        case 'resources/list':
          response?.result = await this.handleResourcesList();
          break;

        case 'resources/read':
          response?.result = await this.handleResourceRead(request.params);
          break;

        case 'ping':
          response?.result = await this.handlePing();
          break;

        default:
          response?.error = {
            code: -32601,
            message: 'Method not found',
            data: {
              method: request.method,
              supportedMethods: [
                'initialize',
                'notifications/initialized',
                'tools/list',
                'tools/call',
                'resources/list',
                'resources/read',
                'ping',
              ],
            },
          };
      }
    } catch (error) {
      logger.error(`Request processing error for ${request.method}:`, error);

      response?.error = {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : String(error),
      };
    }

    return response;
  }

  /**
   * Handle initialization request.
   *
   * @param params
   */
  private async handleInitialize(params: any): Promise<any> {
    logger.info('MCP server initialization requested', {
      clientInfo: params?.clientInfo,
      protocolVersion: params?.protocolVersion,
    });

    this.initialized = true;

    return {
      protocolVersion: '2024-11-05',
      capabilities: this.capabilities,
      serverInfo: this.serverInfo,
    };
  }

  /**
   * Handle initialization notification.
   *
   * @param params
   */
  private async handleInitialized(params: any): Promise<any> {
    logger.info('MCP client initialization completed', { params });

    return {
      status: 'acknowledged',
      message: 'Server ready for requests',
    };
  }

  /**
   * Handle tools list request.
   */
  private async handleToolsList(): Promise<any> {
    const tools = await this.toolRegistry.listTools();

    logger.debug(`Listing ${tools.length} available tools`);

    return { tools };
  }

  /**
   * Handle tool call request.
   *
   * @param params
   */
  private async handleToolCall(params: any): Promise<any> {
    if (!(params && params?.name)) {
      throw new Error('Tool name is required');
    }

    const { name: toolName, arguments: toolArgs } = params;

    logger.info(`Executing tool: ${toolName}`, {
      tool: toolName,
      hasArgs: !!toolArgs,
      argKeys: toolArgs ? Object.keys(toolArgs) : [],
    });

    // Check if tool exists
    if (!this.toolRegistry.hasTool(toolName)) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Execute the tool
    try {
      const result = await this.toolRegistry.executeTool(toolName, toolArgs);

      // Format result for MCP protocol
      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      logger.error(`Tool execution failed: ${toolName}`, error);

      return {
        content: [
          {
            type: 'text',
            text: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle resources list request.
   */
  private async handleResourcesList(): Promise<any> {
    return {
      resources: [
        {
          uri: 'claude-zen://status',
          name: 'System Status',
          description: 'Current Claude-Zen system status and metrics',
          mimeType: 'application/json',
        },
        {
          uri: 'claude-zen://tools',
          name: 'Tool Registry',
          description: 'Information about registered MCP tools',
          mimeType: 'application/json',
        },
        {
          uri: 'claude-zen://metrics',
          name: 'Performance Metrics',
          description: 'Tool execution statistics and performance data',
          mimeType: 'application/json',
        },
      ],
    };
  }

  /**
   * Handle resource read request.
   *
   * @param params
   */
  private async handleResourceRead(params: any): Promise<any> {
    if (!(params && params?.uri)) {
      throw new Error('Resource URI is required');
    }

    const { uri } = params;

    logger.debug(`Reading resource: ${uri}`);

    switch (uri) {
      case 'claude-zen://status':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(await this.getSystemStatus(), null, 2),
            },
          ],
        };

      case 'claude-zen://tools':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(await this.getToolsInfo(), null, 2),
            },
          ],
        };

      case 'claude-zen://metrics':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(await this.getMetrics(), null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  /**
   * Handle ping request.
   */
  private async handlePing(): Promise<any> {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
      server: this.serverInfo.name,
      version: this.serverInfo.version,
      uptime: process.uptime(),
    };
  }

  /**
   * Get system status information.
   */
  private async getSystemStatus(): Promise<any> {
    const memUsage = process.memoryUsage();

    return {
      server: this.serverInfo,
      status: 'running',
      initialized: this.initialized,
      uptime: Math.floor(process.uptime()),
      memory: {
        used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      },
      tools: {
        registered: this.toolRegistry.getToolCount(),
        stats: this.toolRegistry.getRegistryStats(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get tools information.
   */
  private async getToolsInfo(): Promise<any> {
    const tools = await this.toolRegistry.listTools();
    const stats = this.toolRegistry.getToolStats();

    return {
      totalTools: tools.length,
      tools: tools.map((tool) => ({
        ...tool,
        stats: stats[tool.name] || {
          calls: 0,
          totalTime: 0,
          errors: 0,
          averageTime: 0,
        },
      })),
      registryStats: this.toolRegistry.getRegistryStats(),
    };
  }

  /**
   * Get performance metrics.
   */
  private async getMetrics(): Promise<any> {
    return {
      registry: this.toolRegistry.getRegistryStats(),
      tools: this.toolRegistry.getToolStats(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check if server is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get server information.
   */
  getServerInfo(): MCPServerInfo {
    return { ...this.serverInfo };
  }

  /**
   * Get server capabilities.
   */
  getCapabilities(): MCPCapabilities {
    return { ...this.capabilities };
  }
}

export default MCPRequestHandler;
