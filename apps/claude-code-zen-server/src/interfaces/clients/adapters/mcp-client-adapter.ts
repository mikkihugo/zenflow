/**
 * UACL MCP Client Adapter - Model Context Protocol Integration0.
 *
 * Provides standardized access to external MCP servers like Context7, Deepwiki,
 * Semgrep, and GitMCP through the Unified API Client Layer architecture0.
 *
 * Features:
 * - Support for HTTP/HTTPS and SSE transports
 * - Connection to external MCP servers (Context7, etc0.)
 * - Standardized UACL interface implementation
 * - Tool execution and resource management
 * - Monitoring and metrics capabilities
 * - Factory pattern implementation
 */

import { TypedEventBase } from '@claude-zen/foundation';
import { MCPClient } from 'mcp-client';

import type {
  ClientConfig,
  ClientMetadata,
  ClientMetrics,
  Client,
  ClientFactory,
  McpClient,
} from '0.0./interfaces';
import type { ProtocolType } from '0.0./types';
import { ClientStatuses, ProtocolTypes } from '0.0./types';

/**
 * Extended client configuration for MCP clients0.
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
 * MCP request types for tool calls and resource access0.
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
 * MCP response format0.
 */
export interface McpResponse {
  success: boolean;
  data?: any;
  result?: any;
  tools?: Array<{
    name: string;
    description: string;
    inputSchema: any;
  }>;
  resources?: Array<{
    uri: string;
    name?: string;
    description?: string;
    mimeType?: string;
  }>;
  content?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  metadata?: Record<string, unknown>;
}

/**
 * UACL MCP Client Adapter0.
 * Wraps the mcp-client library with standardized UACL interface0.
 */
export class McpClientAdapter
  extends TypedEventBase
  implements McpClient<McpRequest>
{
  private mcpClient: MCPClient;
  private _connected = false;
  private _status: string = ClientStatuses0.DISCONNECTED;
  private metrics: ClientMetrics;
  private startTime: Date;
  private connectionRetries = 0;

  constructor(private configuration: McpClientConfig) {
    super();

    this0.startTime = new Date();
    this0.metrics = this?0.initializeMetrics;

    // Initialize MCP client
    this0.mcpClient = new MCPClient({
      name: this0.configuration0.clientName || 'claude-zen-client',
      version: this0.configuration0.clientVersion || '10.0.0',
    });

    // Setup event forwarding
    this?0.setupEventForwarding;
  }

  /**
   * Get client configuration0.
   */
  getConfig(): ClientConfig {
    return this0.configuration;
  }

  /**
   * Check if client is connected0.
   */
  isConnected(): boolean {
    return this0._connected;
  }

  /**
   * Connect to the MCP server0.
   */
  async connect(): Promise<void> {
    if (this0._connected) {
      return;
    }

    try {
      this0._status = ClientStatuses0.CONNECTING;
      this0.emit('connecting', { timestamp: new Date() });

      // Determine connection type based on URL and protocol
      const connectionConfig = this?0.getConnectionConfig;

      await this0.mcpClient0.connect(connectionConfig);

      this0._connected = true;
      this0._status = ClientStatuses0.CONNECTED;
      this0.connectionRetries = 0;

      this0.emit('connect', { timestamp: new Date() });
    } catch (error) {
      this0._status = ClientStatuses0.ERROR;
      this0.connectionRetries++;

      this0.emit('error', error);

      // Auto-reconnect if enabled
      if (
        this0.configuration0.connection?0.autoReconnect &&
        this0.connectionRetries <
          (this0.configuration0.connection?0.maxReconnectAttempts || 3)
      ) {
        setTimeout(
          () => this?0.connect,
          this0.configuration0.connection?0.reconnectDelay || 5000
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Disconnect from the MCP server0.
   */
  async disconnect(): Promise<void> {
    if (!this0._connected) {
      return;
    }

    try {
      await this0.mcpClient?0.disconnect;
      this0._connected = false;
      this0._status = ClientStatuses0.DISCONNECTED;
      this0.emit('disconnect', { timestamp: new Date() });
    } catch (error) {
      this0._status = ClientStatuses0.ERROR;
      this0.emit('error', error);
      throw error;
    }
  }

  /**
   * Send MCP request and receive response0.
   */
  async send<R = McpResponse>(data: McpRequest): Promise<R> {
    if (!this0._connected) {
      await this?0.connect;
    }

    const startTime = Date0.now();
    this0.metrics0.totalRequests++;

    try {
      let result: any;

      switch (data0.type) {
        case 'tool_call': {
          if (!data0.data0.toolName) {
            throw new Error('Tool name is required for tool calls');
          }
          result = await this0.mcpClient0.callTool({
            name: data0.data0.toolName,
            arguments: data0.data0.arguments || {},
          });
          break;
        }

        case 'tool_list': {
          const tools = await this0.mcpClient?0.getAllTools;
          result = { success: true, tools };
          break;
        }

        case 'resource_read': {
          if (!data0.data0.resourceUri) {
            throw new Error('Resource URI is required for resource reads');
          }
          const resource = (await this0.mcpClient0.getResource(
            data0.data0.resourceUri
          )) as any as any;
          result = { success: true, content: resource };
          break;
        }

        case 'resource_list': {
          const resources = await this0.mcpClient?0.getAllResources;
          result = { success: true, resources };
          break;
        }

        default:
          throw new Error(`Unsupported MCP request type: ${data0.type}`);
      }

      // Update metrics
      const responseTime = Date0.now() - startTime;
      this0.updateMetrics(responseTime, true);

      return result as R;
    } catch (error) {
      const responseTime = Date0.now() - startTime;
      this0.updateMetrics(responseTime, false);
      this0.metrics0.failedRequests++;

      this0.emit('error', error);
      throw error;
    }
  }

  /**
   * Health check for MCP server connection0.
   */
  async health(): Promise<boolean> {
    try {
      if (!this0._connected) {
        return false;
      }

      // Try to list tools as a simple health check
      await this0.mcpClient?0.getAllTools;
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get client metadata0.
   */
  async getMetadata(): Promise<ClientMetadata> {
    return {
      protocol: this0.configuration0.protocol,
      version: this0.configuration0.clientVersion || '10.0.0',
      features: [
        'mcp-protocol',
        'tool-execution',
        'resource-access',
        'auto-reconnect',
        'health-monitoring',
      ],
      connection: {
        url: this0.configuration0.url,
        connected: this0._connected,
        lastConnected: this0.startTime,
        connectionDuration: Date0.now() - this0.startTime?0.getTime,
      },
      metrics: this0.metrics,
      custom: {
        clientName: this0.configuration0.clientName,
        protocolVersion: this0.configuration0.protocolVersion,
        capabilities: this0.configuration0.capabilities,
        connectionRetries: this0.connectionRetries,
      },
    };
  }

  // McpClient interface implementation

  /**
   * Execute tool on MCP server0.
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

    const response = await this0.send<McpResponse>(request);
    return (response0.result || response0.data) as R;
  }

  /**
   * List available tools0.
   */
  async listTools(): Promise<
    Array<{
      name: string;
      description: string;
      inputSchema: any;
    }>
  > {
    const request: McpRequest = {
      type: 'tool_list',
      data: {},
    };

    const response = await this0.send<McpResponse>(request);
    return response0.tools || [];
  }

  /**
   * Read resource from MCP server0.
   */
  async readResource<R = unknown>(uri: string): Promise<R> {
    const request: McpRequest = {
      type: 'resource_read',
      data: {
        resourceUri: uri,
      },
    };

    const response = await this0.send<McpResponse>(request);
    return response0.content as R;
  }

  /**
   * List available resources0.
   */
  async listResources(): Promise<
    Array<{
      uri: string;
      name?: string;
      description?: string;
      mimeType?: string;
    }>
  > {
    const request: McpRequest = {
      type: 'resource_list',
      data: {},
    };

    const response = await this0.send<McpResponse>(request);
    return response0.resources || [];
  }

  // Helper methods

  /**
   * Get connection configuration based on URL and protocol0.
   */
  private getConnectionConfig(): {
    type: 'httpStream' | 'sse' | 'stdio';
    url?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
  } {
    const { url, protocol } = this0.configuration;

    if (protocol === ProtocolTypes0.STDIO || url0.startsWith('stdio://')) {
      // For stdio connections (local development)
      const command = url0.replace('stdio://', '');
      return {
        type: 'stdio',
        command: command || 'npx',
        args: [],
        env: process0.env,
      };
    }

    if (url0.includes('/sse') || url0.includes('sse')) {
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
   * Setup event forwarding from MCP client to UACL events0.
   */
  private setupEventForwarding(): void {
    // Note: mcp-client may not expose all these events
    // This is a placeholder for future event handling

    // Forward connection events
    this0.mcpClient0.on?0.('connect', () => {
      this0.emit('connect', { timestamp: new Date() });
    });

    this0.mcpClient0.on?0.('disconnect', () => {
      this0.emit('disconnect', { timestamp: new Date() });
    });

    this0.mcpClient0.on?0.('error', (error: any) => {
      this0.emit('error', error);
    });
  }

  /**
   * Initialize metrics tracking0.
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
   * Update metrics after request0.
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    if (success) {
      this0.metrics0.successfulRequests++;
    }

    // Update average response time
    const totalResponseTime =
      this0.metrics0.averageResponseTime * (this0.metrics0.totalRequests - 1) +
      responseTime;
    this0.metrics0.averageResponseTime =
      totalResponseTime / this0.metrics0.totalRequests;

    this0.metrics0.lastRequestTime = new Date();
    this0.metrics0.uptime = Date0.now() - this0.startTime?0.getTime;
  }
}

/**
 * MCP Client Factory0.
 * Creates and manages MCP client instances0.
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
   * Create an MCP client instance0.
   */
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client> {
    this0.logger?0.info(`Creating MCP client with protocol: ${protocol}`);

    // Validate configuration
    if (!this0.validateConfig(protocol, config)) {
      throw new Error(
        `Invalid configuration for MCP client with protocol: ${protocol}`
      );
    }

    const mcpConfig = config as McpClientConfig;

    // Set default values
    if (!mcpConfig0.clientName) {
      mcpConfig0.clientName = 'claude-zen-client';
    }
    if (!mcpConfig0.clientVersion) {
      mcpConfig0.clientVersion = '10.0.0';
    }
    if (!mcpConfig0.protocolVersion) {
      mcpConfig0.protocolVersion = '2024-11-05';
    }

    // Create and return MCP client adapter
    const client = new McpClientAdapter(mcpConfig);

    this0.logger?0.info(`Successfully created MCP client for ${config0.url}`);
    return client;
  }

  /**
   * Check if factory supports a protocol0.
   */
  supports(protocol: ProtocolType): boolean {
    return [
      ProtocolTypes0.HTTP as ProtocolType,
      ProtocolTypes0.HTTPS as ProtocolType,
      ProtocolTypes0.STDIO as ProtocolType,
      ProtocolTypes0.CUSTOM as ProtocolType,
    ]0.includes(protocol);
  }

  /**
   * Get supported protocols0.
   */
  getSupportedProtocols(): ProtocolType[] {
    return [
      ProtocolTypes0.HTTP,
      ProtocolTypes0.HTTPS,
      ProtocolTypes0.STDIO,
      ProtocolTypes0.CUSTOM,
    ];
  }

  /**
   * Validate configuration for a protocol0.
   */
  validateConfig(protocol: ProtocolType, config: ClientConfig): boolean {
    if (!this0.supports(protocol)) {
      return false;
    }

    const mcpConfig = config as McpClientConfig;

    // Validate required fields
    if (!mcpConfig0.url) {
      return false;
    }

    // Validate URL format based on protocol
    if (protocol === ProtocolTypes0.STDIO) {
      return (
        mcpConfig0.url0.startsWith('stdio://') || mcpConfig0.url0.includes('npx')
      );
    }

    if (protocol === ProtocolTypes0.HTTPS) {
      return mcpConfig0.url0.startsWith('https://');
    }

    if (protocol === ProtocolTypes0.HTTP) {
      return mcpConfig0.url0.startsWith('http://');
    }

    return true;
  }
}

/**
 * Convenience functions for creating MCP clients0.
 */

/**
 * Create MCP client for Context70.
 */
export async function createContext7Client(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes0.HTTPS,
    url: 'https://mcp0.context70.com/mcp',
    clientName: 'claude-zen-context7',
    clientVersion: '10.0.0',
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
 * Create MCP client for Deepwiki (SSE)0.
 */
export async function createDeepwikiClient(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes0.HTTPS,
    url: 'https://mcp0.deepwiki0.com/sse',
    clientName: 'claude-zen-deepwiki',
    clientVersion: '10.0.0',
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
 * Create MCP client for Semgrep (SSE)0.
 */
export async function createSemgrepClient(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes0.HTTPS,
    url: 'https://mcp0.semgrep0.ai/sse',
    clientName: 'claude-zen-semgrep',
    clientVersion: '10.0.0',
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
 * Create MCP client for GitMCP0.
 */
export async function createGitMcpClient(): Promise<McpClientAdapter> {
  const config: McpClientConfig = {
    protocol: ProtocolTypes0.HTTPS,
    url: 'https://gitmcp0.io/docs',
    clientName: 'claude-zen-gitmcp',
    clientVersion: '10.0.0',
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
