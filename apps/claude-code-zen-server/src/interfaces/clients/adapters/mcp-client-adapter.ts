/**
 * UACL MCP Client Adapter - Model Context Protocol Integration.
 *
 * Provides standardized access to external MCP servers like Context7, Deepwiki,
 * Semgrep, and GitMCP through the Unified API Client Layer architecture.
 *
 * Features:
 * - Support for HTTP/HTTPS and SSE transports
 * - Connection to external MCP servers (Context7, etc.)
 * - Standardized UACL interface implementation
 * - Tool execution and resource management
 * - Monitoring and metrics capabilities
 * - Factory pattern implementation
 */

import { EventEmitter } from 'eventemitter3';
import { MCPClient } from 'mcp-client';
import type {
  ClientConfig,
  ClientMetadata,
  ClientMetrics,
  Client,
  ClientFactory,
  McpClient,
} from '../interfaces';
import type { ProtocolType } from '../types';
import { ClientStatuses, ProtocolTypes } from '../types';

/**
 * Extended client configuration for MCP clients.
 */
export interface McpClientConfig extends ClientConfig {
  /** Client name for MCP handshake */
  clientName?: string;
  /** Client version for MCP handshake */
  clientVersion?: string;
  /** MCP protocol version */
  protocolVersion?: string;
  /** Client capabilities */
  capabilities?: {
    roots?: { listChanged?: boolean };
    sampling?: { enabled?: boolean };
    tools?: { enabled?: boolean };
    resources?: { enabled?: boolean; subscribe?: boolean };
    prompts?: { enabled?: boolean };
    logging?: { enabled?: boolean };
  };
  /** Connection options */
  connection?: {
    /** Connection timeout in ms */
    timeout?: number;
    /** Auto-reconnect on disconnect */
    autoReconnect?: boolean;
    /** Reconnection delay in ms */
    reconnectDelay?: number;
    /** Maximum reconnection attempts */
    maxReconnectAttempts?: number;
  };
}

/**
 * MCP request types for tool calls and resource access.
 */
export interface McpRequest {
  type: 'tool_call' | 'resource_read' | 'resource_list' | 'tool_list';
  data: {
    toolName?: string;
    arguments?: Record<string, unknown>;
    resourceUri?: string;
    resourceType?: string;
    filters?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

/**
 * MCP response format.
 */
export interface McpResponse {
  success: boolean;
  data?: unknown;
  result?: unknown;
  tools?: Array<{
    name: string;
    description: string;
    inputSchema: unknown;
  }>;
  resources?: Array<{
    uri: string;
    name?: string;
    description?: string;
    mimeType?: string;
  }>;
  content?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  metadata?: Record<string, unknown>;
}

/**
 * UACL MCP Client Adapter.
 * Wraps the mcp-client library with standardized UACL interface.
 */
export class McpClientAdapter 
  extends EventEmitter 
  implements McpClient<McpRequest>
{
  private mcpClient: MCPClient;
  private _connected = false;
  private _status: string = ClientStatuses.DISCONNECTED;
  private metrics: ClientMetrics;
  private startTime: Date;
  private connectionRetries = 0;

  constructor(private config: McpClientConfig) {
    super();

    this.startTime = new Date();
    this.metrics = this.initializeMetrics();

    // Initialize MCP client
    this.mcpClient = new MCPClient({
      name: this.config.clientName || 'claude-zen-client',
      version: this.config.clientVersion || '1.0.0',
    });

    // Setup event forwarding
    this.setupEventForwarding();
  }

  /**
   * Get client configuration.
   */
  getConfig(): ClientConfig {
    return this.config;
  }

  /**
   * Check if client is connected.
   */
  isConnected(): boolean {
    return this._connected;
  }

  /**
   * Connect to the MCP server.
   */
  async connect(): Promise<void> {
    if (this._connected) {
      return;
    }

    try {
      this._status = ClientStatuses.CONNECTING;
      this.emit('connecting');

      // Determine connection type based on URL and protocol
      const connectionConfig = this.getConnectionConfig();
      
      await this.mcpClient.connect(connectionConfig);

      this._connected = true;
      this._status = ClientStatuses.CONNECTED;
      this.connectionRetries = 0;

      this.emit('connect');
    } catch (error) {
      this._status = ClientStatuses.ERROR;
      this.connectionRetries++;
      
      this.emit('error', error);
      
      // Auto-reconnect if enabled
      if (
        this.config.connection?.autoReconnect && 
        this.connectionRetries < (this.config.connection?.maxReconnectAttempts || 3)
      ) {
        setTimeout(() => this.connect(), this.config.connection?.reconnectDelay || 5000);
      } else {
        throw error;
      }
    }
  }

  /**
   * Disconnect from the MCP server.
   */
  async disconnect(): Promise<void> {
    if (!this._connected) {
      return;
    }

    try {
      await this.mcpClient.disconnect();
      this._connected = false;
      this._status = ClientStatuses.DISCONNECTED;
      this.emit('disconnect');
    } catch (error) {
      this._status = ClientStatuses.ERROR;
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Send MCP request and receive response.
   */
  async send<R = McpResponse>(data: McpRequest): Promise<R> {
    if (!this._connected) {
      await this.connect();
    }

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      let result: unknown;

      switch (data.type) {
        case 'tool_call': {
          if (!data.data.toolName) {
            throw new Error('Tool name is required for tool calls');
          }
          result = await this.mcpClient.callTool({
            name: data.data.toolName,
            arguments: data.data.arguments || {},
          });
          break;
        }

        case 'tool_list': {
          const tools = await this.mcpClient.getAllTools();
          result = { success: true, tools };
          break;
        }

        case 'resource_read': {
          if (!data.data.resourceUri) {
            throw new Error('Resource URI is required for resource reads');
          }
          const resource = await this.mcpClient.getResource(data.data.resourceUri);
          result = { success: true, content: resource };
          break;
        }

        case 'resource_list': {
          const resources = await this.mcpClient.getAllResources();
          result = { success: true, resources };
          break;
        }

        default:
          throw new Error(`Unsupported MCP request type: ${data.type}`);
      }

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true);

      return result as R;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, false);
      this.metrics.failedRequests++;

      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Health check for MCP server connection.
   */
  async health(): Promise<boolean> {
    try {
      if (!this._connected) {
        return false;
      }

      // Try to list tools as a simple health check
      await this.mcpClient.getAllTools();
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get client metadata.
   */
  async getMetadata(): Promise<ClientMetadata> {
    return {
      protocol: this.config.protocol,
      version: this.config.clientVersion || '1.0.0',
      features: [
        'mcp-protocol',
        'tool-execution',
        'resource-access',
        'auto-reconnect',
        'health-monitoring',
      ],
      connection: {
        url: this.config.url,
        connected: this._connected,
        lastConnected: this.startTime,
        connectionDuration: Date.now() - this.startTime.getTime(),
      },
      metrics: this.metrics,
      custom: {
        clientName: this.config.clientName,
        protocolVersion: this.config.protocolVersion,
        capabilities: this.config.capabilities,
        connectionRetries: this.connectionRetries,
      },
    };
  }

  // McpClient interface implementation

  /**
   * Execute tool on MCP server.
   */
  async callTool<R = unknown>(
    toolName: string,
    args?: Record<string, unknown>
  ): Promise<R> {
    const request: McpRequest = {
      type: 'tool_call',
      data: {
        toolName,
        arguments: args,
      },
    };

    const response = await this.send<McpResponse>(request);
    return (response.result || response.data) as R;
  }

  /**
   * List available tools.
   */
  async listTools(): Promise<Array<{
    name: string;
    description: string;
    inputSchema: unknown;
  }>> {
    const request: McpRequest = {
      type: 'tool_list',
      data: {},
    };

    const response = await this.send<McpResponse>(request);
    return response.tools || [];
  }

  /**
   * Read resource from MCP server.
   */
  async readResource<R = unknown>(uri: string): Promise<R> {
    const request: McpRequest = {
      type: 'resource_read',
      data: {
        resourceUri: uri,
      },
    };

    const response = await this.send<McpResponse>(request);
    return response.content as R;
  }

  /**
   * List available resources.
   */
  async listResources(): Promise<Array<{
    uri: string;
    name?: string;
    description?: string;
    mimeType?: string;
  }>> {
    const request: McpRequest = {
      type: 'resource_list',
      data: {},
    };

    const response = await this.send<McpResponse>(request);
    return response.resources || [];
  }

  // Helper methods

  /**
   * Get connection configuration based on URL and protocol.
   */
  private getConnectionConfig(): {
    type: 'httpStream' | 'sse' | 'stdio';
    url?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
  } {
    const { url, protocol } = this.config;

    if (protocol === ProtocolTypes.STDIO || url.startsWith('stdio://')) {
      // For stdio connections (local development)
      const command = url.replace('stdio://', '');
      return {
        type: 'stdio',
        command: command || 'npx',
        args: [],
        env: process.env,
      };
    }

    if (url.includes('/sse') || url.includes('sse')) {
      // SSE transport for servers that support it
      return {
        type: 'sse',
        url: url,
      };
    }

    // Default to HTTP streaming (most compatible)
    return {
      type: 'httpStream',
      url: url,
    };
  }

  /**
   * Setup event forwarding from MCP client to UACL events.
   */
  private setupEventForwarding(): void {
    // Note: mcp-client may not expose all these events
    // This is a placeholder for future event handling
    
    // Forward connection events
    this.mcpClient.on?.('connect', () => {
      this.emit('connect');
    });

    this.mcpClient.on?.('disconnect', () => {
      this.emit('disconnect');
    });

    this.mcpClient.on?.('error', (error: unknown) => {
      this.emit('error', error);
    });
  }

  /**
   * Initialize metrics tracking.
   */
  private initializeMetrics(): ClientMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: undefined,
      uptime: 0,
      bytesSent: 0,
      bytesReceived: 0,
    };
  }

  /**
   * Update metrics after request.
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    if (success) {
      this.metrics.successfulRequests++;
    }

    // Update average response time
    const totalResponseTime =
      this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) +
      responseTime;
    this.metrics.averageResponseTime =
      totalResponseTime / this.metrics.totalRequests;

    this.metrics.lastRequestTime = new Date();
    this.metrics.uptime = Date.now() - this.startTime.getTime();
  }
}

/**
 * MCP Client Factory.
 * Creates and manages MCP client instances.
 */
export class McpClientFactory implements ClientFactory {
  constructor(
    private logger?: {
      debug: Function;
      info: Function;
      warn: Function;
      error: Function;
    }
  ) {}

  /**
   * Create an MCP client instance.
   */
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client> {
    this.logger?.info(`Creating MCP client with protocol: ${protocol}`);

    // Validate configuration
    if (!this.validateConfig(protocol, config)) {
      throw new Error(
        `Invalid configuration for MCP client with protocol: ${protocol}`
      );
    }

    const mcpConfig = config as McpClientConfig;

    // Set default values
    if (!mcpConfig.clientName) {
      mcpConfig.clientName = 'claude-zen-client';
    }
    if (!mcpConfig.clientVersion) {
      mcpConfig.clientVersion = '1.0.0';
    }
    if (!mcpConfig.protocolVersion) {
      mcpConfig.protocolVersion = '2024-11-05';
    }

    // Create and return MCP client adapter
    const client = new McpClientAdapter(mcpConfig);

    this.logger?.info(`Successfully created MCP client for ${config.url}`);
    return client;
  }

  /**
   * Check if factory supports a protocol.
   */
  supports(protocol: ProtocolType): boolean {
    return [
      ProtocolTypes.HTTP as ProtocolType,
      ProtocolTypes.HTTPS as ProtocolType,
      ProtocolTypes.STDIO as ProtocolType,
      ProtocolTypes.CUSTOM as ProtocolType,
    ].includes(protocol);
  }

  /**
   * Get supported protocols.
   */
  getSupportedProtocols(): ProtocolType[] {
    return [
      ProtocolTypes.HTTP,
      ProtocolTypes.HTTPS,
      ProtocolTypes.STDIO,
      ProtocolTypes.CUSTOM,
    ];
  }

  /**
   * Validate configuration for a protocol.
   */
  validateConfig(protocol: ProtocolType, config: ClientConfig): boolean {
    if (!this.supports(protocol)) {
      return false;
    }

    const mcpConfig = config as McpClientConfig;

    // Validate required fields
    if (!mcpConfig.url) {
      return false;
    }

    // Validate URL format based on protocol
    if (protocol === ProtocolTypes.STDIO) {
      return mcpConfig.url.startsWith('stdio://') || mcpConfig.url.includes('npx');
    }

    if (protocol === ProtocolTypes.HTTPS) {
      return mcpConfig.url.startsWith('https://');
    }

    if (protocol === ProtocolTypes.HTTP) {
      return mcpConfig.url.startsWith('http://');
    }

    return true;
  }
}

/**
 * Convenience functions for creating MCP clients.
 */

/**
 * Create MCP client for Context7.
 */
export async function createContext7Client(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes.HTTPS,
    url: 'https://mcp.context7.com/mcp',
    clientName: 'claude-zen-context7',
    clientVersion: '1.0.0',
    timeout: 30000,
    capabilities: {
      tools: { enabled: true },
      resources: { enabled: true },
    },
    connection: {
      autoReconnect: true,
      reconnectDelay: 5000,
      maxReconnectAttempts: 3,
    },
  };

  return new McpClientAdapter(config);
}

/**
 * Create MCP client for Deepwiki (SSE).
 */
export async function createDeepwikiClient(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes.HTTPS,
    url: 'https://mcp.deepwiki.com/sse',
    clientName: 'claude-zen-deepwiki',
    clientVersion: '1.0.0',
    timeout: 30000,
    capabilities: {
      tools: { enabled: true },
      resources: { enabled: true },
    },
    connection: {
      autoReconnect: true,
      reconnectDelay: 5000,
      maxReconnectAttempts: 3,
    },
  };

  return new McpClientAdapter(config);
}

/**
 * Create MCP client for Semgrep (SSE).
 */
export async function createSemgrepClient(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes.HTTPS,
    url: 'https://mcp.semgrep.ai/sse',
    clientName: 'claude-zen-semgrep',
    clientVersion: '1.0.0',
    timeout: 30000,
    capabilities: {
      tools: { enabled: true },
      resources: { enabled: true },
    },
    connection: {
      autoReconnect: true,
      reconnectDelay: 5000,
      maxReconnectAttempts: 3,
    },
  };

  return new McpClientAdapter(config);
}

/**
 * Create MCP client for GitMCP.
 */
export async function createGitMcpClient(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes.HTTPS,
    url: 'https://gitmcp.io/docs',
    clientName: 'claude-zen-gitmcp',
    clientVersion: '1.0.0',
    timeout: 30000,
    capabilities: {
      tools: { enabled: true },
      resources: { enabled: true },
    },
    connection: {
      autoReconnect: true,
      reconnectDelay: 5000,
      maxReconnectAttempts: 3,
    },
  };

  return new McpClientAdapter(config);
}

export default McpClientAdapter;