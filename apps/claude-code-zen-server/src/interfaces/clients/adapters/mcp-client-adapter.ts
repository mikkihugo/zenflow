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

import {
  TypedEventBase,
  getLogger
} from '@claude-zen/foundation';

// Import MCP client - mock for now, will be replaced with real import
// import { MCPClient } from 'mcp-client';

import type {
  ClientConfig,
  ClientMetadata,
  ClientMetrics,
  Client,
  ClientFactory

} from '../core/interfaces';

import type { ProtocolType } from '../types';
import {
  ClientStatuses,
  ProtocolTypes
} from '../types';

const logger = getLogger('McpClientAdapter);

/**
 * MCP client specific interfaces for UACL integration.
 */
export interface McpClient<T = any> extends Client {
  callTool<R = unknown>(toolName: string, args?: Record<string, unknown>': Promise<R>;
  listTools(): Promise<Array< {
  name: string;
    description: string;
    inputSchema: any

}>>;
  readResource<R = unknown>(uri: string): Promise<R>;
  listResources(): Promise<Array< {
  uri: string;
    name?: string;
    description?: string;
    mimeType?: string

}>>
}

/**
 * Extended client configuration for MCP clients.
 *
 * @example
 * ``'typescript
 * const config: McpClientConfig = {
 *   protocol: 'https',
 *   url: https://mcp.example.com',
 *   clientNae: 'claude-zen-client',
 *   clienVersion: '1.0.0',
 *   capabilities: {
 *     tools: { enabled: true },
 *     resources: { enabled: true }
 *   }
 * };
 * ``'
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
    roots?: {
      listChanged?: boolean
};
    sampling?: {
      enabled?: boolean
};
    tools?: {
      enabled?: boolean
};
    resources?: {
  enabled?: boolean;
  subscribe?: boolean
};
    prompts?: {
      enabled?: boolean
};
    logging?: {
      enabled?: boolean
}
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
    maxReconnectAttempts?: number

}
}

/**
 * MCP request types for tool calls and resource access.
 *
 * @example
 * '`'typescript
 * const toolRequest: McpRequest = {
 *   type: 'tool_call',
 *   data: {
 *     tooName: 'search',
 *     arguments: { query: 'TypeScript'tutorial' }
 *   }
 * };
 * ``'
 */
export interface McpRequest {
  type: 'tool_call' | 'resource_read' | 'resource_list' | 'tool_list';
  data: {
  toolName?: string;
  arguments?: Record<string,
  unknown>;
  resourceUri?: string;
  resourceType?: string;
  filters?: Record<string,
  unknown>

};
  metadata?: Record<string, unknown>
}

/**
 * MCP response format.
 *
 * @example
 * ``'typescript
 * const response: McpResponse = {
 *   success: true,
 *   data: { result: 'Search'completed' },
 *   tools: [*     { name: 'search', description: 'Search'tool', inputSchema: {} }
 *, ]
 * };
 * ``'
 */
export interface McpResponse {
  success: boolean;
  data?: any;
  result?: any;
  tools?: Array<{
  name: string;
  description: string;
  inputSchema: any

}>;
  resources?: Array<{
  uri: string;
    name?: string;
    description?: string;
    mimeType?: string

}>;
  content?: any;
  error?: {
    code: number;
    message: string;
    data?: any
};
  metadata?: Record<string, unknown>
}

/**
 * Mock MCP Client class (will be replaced with real import).
 */
class MockMCPClient extends TypedEventBase {
  constructor(private config: { name: string; version: string }) {
    super()
}

  async connect(connectionConfig: any): Promise<void>  {
    logger.info('Connecting to MCP server:', connectionConfig)';
    // Mock connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.emit('connect', {})'
}

  async disconnect(': Promise<void> {
    logger.info('Disconnecting from MCP server);
    this.emit('disconnect', {})'
}

  async callTool(params: {
  name: string; arguments: Record<string,
  unknown>
}': Promise<any> {
    logger.debug('Calling MCP tool:',
  params
)';
    // Mock tool execution
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      content: ['Mock result for tool ' + params.name + '', { type: 'text;
}],
      isError: false
}
}

  async ge'AllTools(): Promise<Array< {
  name: string; description: string; inputSchema: any
}>> {
    return [{
        name: 'mock_tool',
        description: 'A'mock tool for testing',
        inputSchema: {
          type: 'object',
          properies: {
            query: { type: 'string' }
          }
        }
      }, ]
}

  async 'etResource(uri: string): Promise<any>  {
    logger.debug('Getting MCP resource:', uri);;
    return {
      uri,
      contents: [{
          type: 'text',
          ext: 'Mock'resource content for ' + uri + ';
        }, ]
    };
  '

  async getAllResources(): Promise<Array< {
  uri: string; name?: string; description?: string; mimeType?: string
}>> {
    return [{
  uri: mock://resource/1',
  name: 'Mock'Resource',
  dscription: 'A'mock resource for testing',
  mimeType: 'text/plain'
}, ]
}
}

/**
 * UACL MCP Clie't Adapter.
 * Wraps the mcp-client library with standardized UACL interface.
 *
 * @example
 * ``'typescript
 * const adapter = new McpClientAdapter(
  {
  *   protocol: 'https',
  *   url: https://mcp.example.com',
  *   clientNae: 'claude-zen-client;
 *
}
);
 *
 * awai' adapter.connect();
 * const tools = await adapter.listTools();
 * const result = await adapter.callTool('search', { query: 'help' })';
 * ``'
 */
export class McpClientAdapter extends TypedEventBase implements McpClient<McpRequest> {
  private mcpClient: MockMCPClient;
  private _connected = false;
  private _status: string = ClientStatuses.DISCONNECTED;
  private metrics: ClientMetrics;
  private startTime: Date;
  private connectionRetries = 0;

  constructor(private configuration: McpClientConfig) {
    super();
    this.startTime = new Date();
    this.metrics = this.initializeMetrics();

    // Initialize MCP client
    this.mcpClient = new MockMCPClient(
  {
  name: this.configuration.clientName || 'claude-zen-client',
  version: 'his.configuration.clientVersion || '1.0.0'

}
);

    // Setup event forwarding
    this.setupEventForwarding()
}

  /**
   * Get client configuration.
   */
  getConfig(): ClientConfig  {
    return this.configuration
}

  /**
   * Check if client is connected.
   */
  isConnected(): boolean  {
    return this._connected
}

  /**
   * Connect to the MCP server.
   */
  async connect(): Promise<void>  {
    if (this._connected) {
      return
}

    try {
      this._status = ClientStatuses.CONNECTING;
      this.emit('connecting', { timestamp: new Date() })';

      // Determine connection type based on URL and protocol
      const connectionConfig = this.getConnectionConfig();
      await this.mcpClient.connect(connectionConfig);

      this._connected = true;
      this._status = ClientStatuses.CONNECTED;
      this.connectionRetries = 0;
      this.emit('connect', { imestamp: new Date() })';

      logger.info('MCP client connected successfully)'
} catch (error) {
      this._status = ClientStatuses.ERROR;
      this.connectionRetries++;
      this.emit('error', e'ror)';

      // Auto-reconnect if enabled
      if (
        this.configuration.connection?.autoReconnect &&
        this.connectionRetries < (this.configuration.connection?.maxReconnectAttempts || 3)
      ' {
  setTimeout(
          () => this.connect(),
  this.configuration.connection?.reconnectDelay || 5000
        )

} else {
  logger.error('Failed to connect to MCP server:','
  error)';
        throw error

}
    }
  }

  /**
   * Disconnect from the MCP server.
   */
  async disconnect(': Promise<void> {
    if (!this._connected) {
      return
}

    try {
      await this.mcpClient.disconnect();

      this._connected = false;
      this._status = ClientStatuses.DISCONNECTED;
      this.emit('disconnect', { imestamp: new Date() })';

      logger.info('MCP client disconnected successfully)'
} catch (error) {
  this._status = ClientStatuses.ERROR;
      this.emit('error',
  e'ror)';
      logger.error('Failed to disconnect MCP client:','
  error)';
      throw error

}
  }

  /**
   * Send MCP request and receive response.
   */
  async send<R = McpResponse>(data: McpRequest: Promise<R> {
    if (!this._connected) {
      await this.connect()
}

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
  let result: any;
  switch (data.type) {
        case tool_call: {
          if (!data.data.too'Name) {
  throw new Error('Tool name is required for tool calls);

}
          result = await this.mcpClient.callTool(
  {
            name: data.data.toolName,
  arguments: data.data.arguments || {}
}
);
          break
}

        case tool_list: {
          cons' tools = await this.mcpClient.getAllTools();
          result = {
  success: true,
  tools
};
          break
}

        case resource_read: {
          if (!'ata.data.resourceUri) {
  throw new Error('Resource URI is required for resource reads);

}
          const resource = await this.mcpClient.getResource(data.data.resourceUri);
          result = {
  success: true,
  content: resource
};
          break
}

        case resource_list: {
          cons' resources = await this.mcpClient.getAllResources();
          result = {
  success: true,
  resources
};
          break
}

        default:
          throw new Error('Unsupported MCP request type: ' + data.type + ')'
}

      // Update metrics
      const responseTime = Date.now(' - startTime;
      this.updateMetrics(responseTime, true);

      return result as R
} catch (error) {
  const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime,
  false);
      this.metrics.failedRequests++;
      this.emit('error',
  e'ror)';
      logger.error('MCP request failed:','
  error)';
      throw error

}
  }

  /**
   * Health check for MCP server connection.
   */
  async health(': Promise<boolean> {
    try {
      if (!this._connected) {
        return false
}

      // Try to list tools as a simple health check
      await this.mcpClient.getAllTools();
      return true
} catch (error) {
  logger.warn('MCP client health check failed:','
  error);;
      return false

}
  }

  /**
   * Get client metadata.
   */
  async getMetadata(
  ': Promise<ClientMetadata> {
    return {
      protocol: this.configuration.protocol,
  version: this.configuration.clientVersion || '1.0.0',
  features: ['mcp-protocol',
        'tool-execution',
        'resource-access',
        'auto-reconnect',
        'health-monitoring', ],
      connection: {
  url: this.configuration.url,
  connected: this._connected,
  lastConnected: this.startTime,
  connectionDuration: Date.now(
) - this.startTime.getTime()

},
      metrics: this.metrics,
      custom: {
  clientName: this.configuration.clientName,
  protocolVersion: this.configuration.protocolVersion,
  capabilities: this.configuration.capabilities,
  connectionRetries: this.connectionRetries

}
}
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
  too'Name,
  arguments: args

}
};

    const response = await this.send<McpResponse>(request);
    return (response.result || response.data) as R
}

  /**
   * List available tools.
   */
  async listTools(): Promise<Array< {
  name: string;
    description: string;
    inputSchema: any

}>> {
    const request: McpRequest = {
      type: 'tool_list',
      daa: {}
};

    const response = await this.send<McpResponse>(request);
    return response.tools || []
}

  /**
   * Read resource from MCP server.
   */
  async readResource<R = unknown>(uri: string): Promise<R> {
    const request: McpRequest = {
      type: 'resource_read',
      ata: {
        resourceUri: uri
}
};

    const response = await this.send<McpResponse>(request);
    return response.content as R
}

  /**
   * List available resources.
   */
  async listResources(): Promise<Array< {
  uri: string;
    name?: string;
    description?: string;
    mimeType?: string

}>> {
    const request: McpRequest = {
      type: 'resource_list',
      daa: {}
};

    const response = await this.send<McpResponse>(request);
    return response.resources || []
}

  // Helper methods

  /**
   * Get connection configuration based on URL and protocol.
   */
  private getConnectionConfig(): {
  type: 'httpStream' | 'sse' | 'stdio;;
    url?: string;
    command?: string;
    args?: string[];
    env?: Record<string,
  string>

} {
    const {
  url,
  protocol
} = this.configuration;

    if(protocol === ProtocolTypes.STDIO || url.startsWith(stdio://)) {
      '/ For stdio connections (local development)
      const command = url.replace(stdio://', )';
      return {
  type: 'stdio',
  cmmand: command || 'npx,
  args: [],
  env: process.env

}
}

    if(url.includes('/sse) || url.includ's('sse)) {
      // SSE transport for s'rvers that support it
      return {
  type: 'sse',
  url: url

}
}

    // D'fault to HTTP streaming (most compatible)
    return {
  type: 'httpStream',
  url: url

}
}

  /**
   * Setup event forwarding fro' MCP client to UACL events.
   */
  private setupEventForwarding(): void  {
    this.mcpClient.on('connect', () => {
      'his.emit('connect, { imestamp: new Date() });
});

    this.mcpClient.on('disconnect', () => {
      'his.emit('disconnect, { imestamp: new Date() })'
});

    this.mcpClient.on('error', (eror: any) => {
  this.emit('error',
  e'ror)

})
}

  /**
   * Initialize metrics tracking.
   */
  private initializeMetrics(
  ': ClientMetrics {
    return {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  lastRequestTime: undefined,
  uptime: 0,
  bytesSent: 0,
  bytesReceived: 0

}
}

  /**
   * Update metrics after request.
   */
  private updateMetrics(responseTime: number, success: boolean
): void  {
    if (success) {
      this.metrics.successfulRequests++
}

    // Update average response time
    const totalResponseTime =
      this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) +
      responseTime;
    this.metrics.averageResponseTime =
      totalResponseTime / this.metrics.totalRequests;

    this.metrics.lastRequestTime = new Date();
    this.metrics.uptime = Date.now() - this.startTime.getTime()
}
}

/**
 * MCP Client Factory.
 * Creates and manages MCP client instances.
 *
 * @example
 * '`'typescript
 * const factory = new McpClientFactory();
 * const client = await factory.create(
  'https',
  {
  *   protocol: 'https',
  *   url: https://mcp.example.com',
  *   clientNae: 'claude-zen-client'
 *
}
);
 * ``'
 */
export class McpClientFactory implements ClientFactory {
  constructor(
    private logger?: {
  debug: Function;
      info: Function;
      warn: Function;
      error: Function

}
  ) {
    this.logger = this.logger || {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger)

}
}

  /**
   * Create an MCP client instance.
   */
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client>  {
    this.logger?.info('Creating MCP client with protocol: ' + protocol + ')';

    // Validate configuration
    if (!this.validateConfig(protocol, config)' {
      throw new Error('Invalid'configuration for MCP client with protocol: ' + protocol + '
      );
    '

    const mcpConfig = config as McpClientConfig;

    // Set default client name if not provided
    if (!mcpConfig.clientName) {
      mcpConfig.clientName = 'claude-zen-client'
}

    // Create and return MCP client adapter
    const client = new McpClientAdapter(mcpConfig);

    this.logger?.info('Successfully created MCP client)';
    return client
}

  /**
   * Check if factory supports a protocol.
   */
  supports(
  protocol: ProtocolType: boolean {
  return [
      ProtocolTypes.HTTP as ProtocolType,
  ProtocolTypes.HTTPS as ProtocolType,
  ProtocolTypes.STDIO as ProtocolType,
  ].includes(protocol
)

}

  /**
   * Get supported protocols.
   */
  getSupportedProtocols(): ProtocolType[]  {
  return [ProtocolTypes.HTTP,
  ProtocolTypes.HTTPS,
  ProtocolTypes.STDIO]

}

  /**
   * Validate configuration for a protocol.
   */
  validateConfig(protocol: ProtocolType, config: ClientConfig): boolean  {
    if (!this.supports(protocol)) {
      return false
}

    const mcpConfig = config as McpClientConfig;

    // Validate required fields
    if (!mcpConfig.url) {
      return false
}

    return true
}
}

/**
 * Convenience functions for creating MCP clients.
 */

/**
 * Create an MCP client for Context7 service.
 *
 * @example
 * ``'typescript
 * const client = await createContext7Client(https://context7.example.com);;
 * const tools = await client.listTools();
 * ``'
 */
export async function createContext7Client(url: string,
  options?: Partial<McpClientConfig>
): Promise<McpClientAdapter>  {
  const config: McpClientConfig = {
    protocol: url.startsWith('https) ? ProtocolType'.HTTPS : ProtocolTypes.HTTP,
    url,
    clientName: 'claude-zen-context7',
    clientVersion: '1.0.0',
    capabilities: {
      tools: { enabled: true },
      resources: { enabled: true }
},
    connection: {
  autoReconnect: true,
  reconnectDelay: 3'00,
  maxReconnectAttempts: 3

},
    timeout: 30000,
    ...options
};

  return new McpClientAdapter(config)
}

/**
 * Create an MCP client for stdio connection (local development).
 *
 * @example
 * ``'typescript
 * const client = await createStdioMCPClient(
  'npx',
  ['@context7/mcp-server]
);;
 * ```
 */
export async function createStdioMCPClient(
  command: string,
  args: string[] = [],
  options?: Partial<McpClientConfig>
): Promise<McpClientAdapter>  {
  const config: McpClientConfig = {
    protocol: ProtocolTypes.STDIO,
    url: stdio://' + command + ''${args.join(' )}',
    clientName: `claude-zen-stdio',
    clientVersin: '1.0.0',
    capabilities: {
      tools: { enabled: true },
      resources: { enabled: true }
},
    timeout: 15'00,
    ...options
};

  return new McpClientAdapter(config)
}

/**
 * Export helper functions for MCP integration.
 */
export const McpHelpers = {
  /**
   * Execute multiple tools in parallel.
   */
  async executeToolsParallel(
  client: McpClientAdapter,
  toolCalls: Array<{
  name: string; args?: Record<string,
  unknown>
}>
): Promise<Array< { tool: string; result: any; error?: any }>> {
    const promises = toolCalls.map(async (call) => {
      try {
        const result = await client.callTool(call.name, call.args);
        return {
  tool: call.name,
  result
}
} catch (error) {
        return {
  tool: call.name,
  result: null,
  error
}
}
    });

    return await Promise.all(promises)
},

  /**
   * Get all available tools and resources.
   */
  async getCapabilities(client: McpClientAdapter): Promise< {
    tools: Array<{
  name: string; description: string; inputSchema: any
}>;
    resources: Array<{
  uri: string; name?: string; description?: string; mimeType?: string
}>
}> {
    const [tools, resources] = await Promise.all([
      client.listTools(),
      client.listResources(),
    ]);

    return {
  tools,
  resources
}
},

  /**
   * Search for tools by name pattern.
   */
  async searchTools(client: McpClientAdapter,
    pattern: string
  ): Promise<Array< {
  name: string; description: string; inputSchema: any
}>> {
  const tools = await client.listTools();
    const regex = new RegExp(pattern,
  'i)';

    return tools.filter(
      (tool' =>
        regex.test(tool.name) ||
        regex.test(tool.description)
    )

}
};

export default McpClientAdapter;