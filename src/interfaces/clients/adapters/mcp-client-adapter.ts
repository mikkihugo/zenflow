/**
 * MCP Client Adapter - UACL Implementation
 *
 * Converts the existing MCP client to implement the UACL IClient interface
 * Supports both stdio and HTTP MCP protocols with unified configuration
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import {
  type ClientConfig,
  ClientError,
  type ClientMetrics,
  type ClientResponse,
  type ClientStatus,
  ConnectionError,
  type IClient,
  type IClientFactory,
  type RequestOptions,
  TimeoutError,
} from '../core/interfaces.js';

/**
 * MCP-specific client configuration
 *
 * @example
 */
export interface MCPClientConfig extends ClientConfig {
  protocol: 'stdio' | 'http';
  command?: string[]; // For stdio protocol
  url?: string; // For HTTP protocol
  authentication?: {
    type: 'none' | 'bearer' | 'basic';
    credentials?: string;
  };
  tools?: {
    timeout: number;
    retries: number;
    discovery: boolean; // Auto-discover tools on connect
  };
  server?: {
    name: string;
    version: string;
    capabilities?: string[];
  };
  stdio?: {
    encoding: 'utf8' | 'buffer';
    killSignal: 'SIGTERM' | 'SIGKILL';
    killTimeout: number; // ms
  };
}

/**
 * MCP Tool definition
 *
 * @example
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
}

/**
 * MCP Protocol Message types
 *
 * @example
 */
export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Tool execution result
 *
 * @example
 */
export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * MCP Client Adapter - Implements UACL IClient interface
 *
 * @example
 */
export class MCPClientAdapter extends EventEmitter implements IClient {
  readonly config: MCPClientConfig;
  readonly name: string;

  private _isConnected = false;
  private _process?: ChildProcess;
  private _tools: Map<string, MCPTool> = new Map();
  private _pendingRequests: Map<
    string | number,
    {
      resolve: (value: any) => void;
      reject: (error: any) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();

  // Metrics tracking
  private _metrics: ClientMetrics = {
    name: '',
    requestCount: 0,
    successCount: 0,
    errorCount: 0,
    averageLatency: 0,
    p95Latency: 0,
    p99Latency: 0,
    throughput: 0,
    timestamp: new Date(),
  };
  private _latencyHistory: number[] = [];
  private _lastMetricsUpdate = Date.now();

  constructor(config: MCPClientConfig) {
    super();
    this.config = { ...config };
    this.name = config.name;
    this._metrics.name = config.name;
  }

  /**
   * Connect to MCP server
   */
  async connect(): Promise<void> {
    if (this._isConnected) {
      return;
    }

    try {
      if (this.config.protocol === 'stdio') {
        await this._connectStdio();
      } else if (this.config.protocol === 'http') {
        await this._connectHTTP();
      } else {
        throw new Error(`Unsupported protocol: ${this.config.protocol}`);
      }

      this._isConnected = true;

      // Auto-discover tools if enabled
      if (this.config.tools?.discovery !== false) {
        await this._discoverTools();
      }

      this.emit('connect', { client: this.name });
    } catch (error) {
      throw new ConnectionError(this.name, error as Error);
    }
  }

  /**
   * Connect via stdio protocol
   */
  private async _connectStdio(): Promise<void> {
    if (!this.config.command || this.config.command.length === 0) {
      throw new Error('Command required for stdio protocol');
    }

    const [command, ...args] = this.config.command;

    this._process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: this.config.stdio?.encoding || 'utf8',
    });

    // Handle process events
    this._process.on('error', (error) => {
      this.emit('error', new ConnectionError(this.name, error));
    });

    this._process.on('exit', (code, signal) => {
      this._isConnected = false;
      this.emit('disconnect', { client: this.name, code, signal });
    });

    // Setup message handling
    if (this._process.stdout) {
      this._process.stdout.on('data', (data) => {
        this._handleStdioMessage(data.toString());
      });
    }

    if (this._process.stderr) {
      this._process.stderr.on('data', (data) => {
        console.warn(`MCP stderr [${this.name}]:`, data.toString());
      });
    }

    // Send initialization message
    await this._sendMessage({
      jsonrpc: '2.0',
      id: this._nextMessageId(),
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        clientInfo: {
          name: 'claude-zen-mcp-client',
          version: '1.0.0',
        },
      },
    });
  }

  /**
   * Connect via HTTP protocol
   */
  private async _connectHTTP(): Promise<void> {
    if (!this.config.url) {
      throw new Error('URL required for HTTP protocol');
    }

    // Test connection with health check
    const response = await fetch(`${this.config.url}/health`, {
      method: 'GET',
      headers: this._getAuthHeaders(),
      signal: AbortSignal.timeout(this.config.timeout || 10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP connection failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (!this._isConnected) {
      return;
    }

    try {
      // Clean up pending requests
      for (const [_id, pending] of this._pendingRequests) {
        clearTimeout(pending.timeout);
        pending.reject(new Error('Client disconnecting'));
      }
      this._pendingRequests.clear();

      if (this.config.protocol === 'stdio' && this._process) {
        // Send shutdown notification
        try {
          await this._sendMessage({
            jsonrpc: '2.0',
            method: 'notifications/shutdown',
          });
        } catch {
          // Ignore errors during shutdown
        }

        // Kill process
        this._process.kill(this.config.stdio?.killSignal || 'SIGTERM');

        // Force kill if not terminated within timeout
        const killTimeout = this.config.stdio?.killTimeout || 5000;
        setTimeout(() => {
          if (this._process && !this._process.killed) {
            this._process.kill('SIGKILL');
          }
        }, killTimeout);
      }

      this._isConnected = false;
      this.emit('disconnect', { client: this.name });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<ClientStatus> {
    const startTime = Date.now();
    let status: ClientStatus['status'] = 'unhealthy';
    let responseTime = 0;

    try {
      if (this.config.protocol === 'stdio') {
        // Send ping message for stdio
        await this._sendMessage({
          jsonrpc: '2.0',
          id: this._nextMessageId(),
          method: 'ping',
        });
        status = 'healthy';
      } else {
        // HTTP health check
        const response = await fetch(`${this.config.url}/health`, {
          signal: AbortSignal.timeout(this.config.health?.timeout || 5000),
        });
        status = response.ok ? 'healthy' : 'degraded';
      }

      responseTime = Date.now() - startTime;
    } catch (_error) {
      status = 'unhealthy';
      responseTime = Date.now() - startTime;
    }

    return {
      name: this.name,
      status,
      lastCheck: new Date(),
      responseTime,
      errorRate: this._calculateErrorRate(),
      uptime: Date.now() - this._lastMetricsUpdate,
      metadata: {
        protocol: this.config.protocol,
        toolCount: this._tools.size,
        processId: this._process?.pid,
      },
    };
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<ClientMetrics> {
    this._updateMetrics();
    return { ...this._metrics };
  }

  /**
   * Execute MCP tool (mapped to POST request)
   *
   * @param toolName
   * @param parameters
   * @param options
   */
  async post<T = any>(
    toolName: string,
    parameters?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const startTime = Date.now();

    try {
      const tool = this._tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      const result = await this._executeToolCall(toolName, parameters || {}, options);
      const responseTime = Date.now() - startTime;

      this._recordLatency(responseTime);
      this._metrics.successCount++;
      this._metrics.requestCount++;

      return {
        data: result as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: options || {},
        metadata: {
          tool: toolName,
          responseTime,
          protocol: this.config.protocol,
        },
      };
    } catch (error) {
      this._metrics.errorCount++;
      this._metrics.requestCount++;
      throw error;
    }
  }

  /**
   * Get available tools (mapped to GET request)
   *
   * @param endpoint
   * @param options
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    if (endpoint === '/tools') {
      const tools = Array.from(this._tools.values());
      return {
        data: tools as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: options || {},
        metadata: { endpoint },
      };
    }

    if (endpoint === '/status') {
      const status = await this.healthCheck();
      return {
        data: status as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: options || {},
        metadata: { endpoint },
      };
    }

    throw new Error(`Unsupported endpoint: ${endpoint}`);
  }

  /**
   * Not supported for MCP - throws error
   */
  async put<T = any>(): Promise<ClientResponse<T>> {
    throw new Error('PUT not supported for MCP client');
  }

  /**
   * Not supported for MCP - throws error
   */
  async delete<T = any>(): Promise<ClientResponse<T>> {
    throw new Error('DELETE not supported for MCP client');
  }

  /**
   * Update configuration
   *
   * @param config
   */
  updateConfig(config: Partial<MCPClientConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Cleanup and destroy client
   */
  async destroy(): Promise<void> {
    await this.disconnect();
    this.removeAllListeners();
  }

  /**
   * Execute MCP tool call
   *
   * @param toolName
   * @param parameters
   * @param options
   */
  private async _executeToolCall(
    toolName: string,
    parameters: any,
    options?: RequestOptions
  ): Promise<MCPToolResult> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this._nextMessageId(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: parameters,
      },
    };

    const timeout = options?.timeout || this.config.tools?.timeout || 30000;
    return this._sendMessage(message, timeout);
  }

  /**
   * Discover available tools from server
   */
  private async _discoverTools(): Promise<void> {
    try {
      const response = await this._sendMessage({
        jsonrpc: '2.0',
        id: this._nextMessageId(),
        method: 'tools/list',
      });

      if (response.tools) {
        this._tools.clear();
        for (const tool of response.tools) {
          this._tools.set(tool.name, tool);
        }
      }
    } catch (error) {
      console.warn(`Failed to discover tools for ${this.name}:`, error);
    }
  }

  /**
   * Send message to MCP server
   *
   * @param message
   * @param timeout
   */
  private async _sendMessage(message: MCPMessage, timeout = 30000): Promise<any> {
    if (!this._isConnected) {
      throw new ConnectionError(this.name);
    }

    if (this.config.protocol === 'stdio') {
      return this._sendStdioMessage(message, timeout);
    } else {
      return this._sendHTTPMessage(message, timeout);
    }
  }

  /**
   * Send message via stdio
   *
   * @param message
   * @param timeout
   */
  private async _sendStdioMessage(message: MCPMessage, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._process?.stdin) {
        reject(new Error('Process stdin not available'));
        return;
      }

      const messageStr = `${JSON.stringify(message)}\n`;

      if (message.id !== undefined) {
        // Setup response handler
        const timeoutHandle = setTimeout(() => {
          this._pendingRequests.delete(message.id!);
          reject(new TimeoutError(this.name, timeout));
        }, timeout);

        this._pendingRequests.set(message.id, {
          resolve,
          reject,
          timeout: timeoutHandle,
        });
      }

      this._process.stdin.write(messageStr, (error) => {
        if (error) {
          if (message.id !== undefined) {
            this._pendingRequests.delete(message.id);
          }
          reject(new ClientError('Failed to send message', 'SEND_ERROR', this.name, error));
        } else if (message.id === undefined) {
          // Notification - resolve immediately
          resolve(undefined);
        }
      });
    });
  }

  /**
   * Send message via HTTP
   *
   * @param message
   * @param timeout
   */
  private async _sendHTTPMessage(message: MCPMessage, timeout: number): Promise<any> {
    const response = await fetch(`${this.config.url}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this._getAuthHeaders(),
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new ClientError(
        `HTTP request failed: ${response.status} ${response.statusText}`,
        'HTTP_ERROR',
        this.name
      );
    }

    const result = await response.json();

    if (result.error) {
      throw new ClientError(`MCP error: ${result.error.message}`, 'MCP_ERROR', this.name);
    }

    return result.result;
  }

  /**
   * Handle stdio messages
   *
   * @param data
   */
  private _handleStdioMessage(data: string): void {
    const lines = data.trim().split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const message: MCPMessage = JSON.parse(line);

        if (message.id !== undefined && this._pendingRequests.has(message.id)) {
          const pending = this._pendingRequests.get(message.id)!;
          this._pendingRequests.delete(message.id);
          clearTimeout(pending.timeout);

          if (message.error) {
            pending.reject(
              new ClientError(`MCP error: ${message.error.message}`, 'MCP_ERROR', this.name)
            );
          } else {
            pending.resolve(message.result);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse MCP message [${this.name}]:`, line, error);
      }
    }
  }

  /**
   * Get authentication headers for HTTP
   */
  private _getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'bearer':
          if (this.config.authentication.credentials) {
            headers.Authorization = `Bearer ${this.config.authentication.credentials}`;
          }
          break;
        case 'basic':
          if (this.config.authentication.credentials) {
            headers.Authorization = `Basic ${this.config.authentication.credentials}`;
          }
          break;
      }
    }

    return headers;
  }

  /**
   * Generate next message ID
   */
  private _nextMessageId(): number {
    return ++this._messageId;
  }

  /**
   * Record latency for metrics
   *
   * @param latency
   */
  private _recordLatency(latency: number): void {
    this._latencyHistory.push(latency);

    // Keep only last 1000 measurements
    if (this._latencyHistory.length > 1000) {
      this._latencyHistory = this._latencyHistory.slice(-1000);
    }
  }

  /**
   * Calculate error rate
   */
  private _calculateErrorRate(): number {
    if (this._metrics.requestCount === 0) return 0;
    return this._metrics.errorCount / this._metrics.requestCount;
  }

  /**
   * Update metrics
   */
  private _updateMetrics(): void {
    const now = Date.now();
    const timeDiff = (now - this._lastMetricsUpdate) / 1000; // seconds

    // Calculate throughput
    this._metrics.throughput = timeDiff > 0 ? this._metrics.requestCount / timeDiff : 0;

    // Calculate latencies
    if (this._latencyHistory.length > 0) {
      const sorted = [...this._latencyHistory].sort((a, b) => a - b);
      this._metrics.averageLatency = sorted.reduce((a, b) => a + b) / sorted.length;
      this._metrics.p95Latency = sorted[Math.floor(sorted.length * 0.95)] || 0;
      this._metrics.p99Latency = sorted[Math.floor(sorted.length * 0.99)] || 0;
    }

    this._metrics.timestamp = new Date();
    this._lastMetricsUpdate = now;
  }
}

/**
 * MCP Client Factory - Creates and manages MCP clients
 *
 * @example
 */
export class MCPClientFactory implements IClientFactory<MCPClientConfig> {
  private _clients: Map<string, MCPClientAdapter> = new Map();

  /**
   * Create new MCP client
   *
   * @param config
   */
  async create(config: MCPClientConfig): Promise<IClient> {
    const client = new MCPClientAdapter(config);
    this._clients.set(config.name, client);
    return client;
  }

  /**
   * Create multiple MCP clients
   *
   * @param configs
   */
  async createMultiple(configs: MCPClientConfig[]): Promise<IClient[]> {
    const clients: IClient[] = [];

    for (const config of configs) {
      const client = await this.create(config);
      clients.push(client);
    }

    return clients;
  }

  /**
   * Get client by name
   *
   * @param name
   */
  get(name: string): IClient | undefined {
    return this._clients.get(name);
  }

  /**
   * List all clients
   */
  list(): IClient[] {
    return Array.from(this._clients.values());
  }

  /**
   * Check if client exists
   *
   * @param name
   */
  has(name: string): boolean {
    return this._clients.has(name);
  }

  /**
   * Remove client
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const client = this._clients.get(name);
    if (!client) return false;

    await client.destroy();
    return this._clients.delete(name);
  }

  /**
   * Health check all clients
   */
  async healthCheckAll(): Promise<Map<string, ClientStatus>> {
    const results = new Map<string, ClientStatus>();

    for (const [name, client] of this._clients) {
      try {
        const status = await client.healthCheck();
        results.set(name, status);
      } catch (error) {
        results.set(name, {
          name,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: 0,
          errorRate: 1,
          uptime: 0,
          metadata: { error: (error as Error).message },
        });
      }
    }

    return results;
  }

  /**
   * Get metrics for all clients
   */
  async getMetricsAll(): Promise<Map<string, ClientMetrics>> {
    const results = new Map<string, ClientMetrics>();

    for (const [name, client] of this._clients) {
      try {
        const metrics = await client.getMetrics();
        results.set(name, metrics);
      } catch (error) {
        // Skip failed metrics
        console.warn(`Failed to get metrics for ${name}:`, error);
      }
    }

    return results;
  }

  /**
   * Shutdown all clients
   */
  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this._clients.values()).map((client) =>
      client
        .destroy()
        .catch((error) => console.warn(`Error shutting down client ${client.name}:`, error))
    );

    await Promise.all(shutdownPromises);
    this._clients.clear();
  }

  /**
   * Get active client count
   */
  getActiveCount(): number {
    return this._clients.size;
  }
}

/**
 * Helper function to create MCP client configurations from legacy format
 *
 * @param name
 * @param legacyConfig
 * @param legacyConfig.url
 * @param legacyConfig.type
 * @param legacyConfig.command
 * @param legacyConfig.timeout
 * @param legacyConfig.capabilities
 */
export function createMCPConfigFromLegacy(
  name: string,
  legacyConfig: {
    url?: string;
    type?: 'http' | 'sse';
    command?: string[];
    timeout?: number;
    capabilities?: string[];
  }
): MCPClientConfig {
  const protocol = legacyConfig.command ? 'stdio' : 'http';

  return {
    name,
    baseURL: legacyConfig.url || '',
    protocol,
    command: legacyConfig.command,
    url: legacyConfig.url,
    timeout: legacyConfig.timeout || 30000,
    authentication: { type: 'none' },
    tools: {
      timeout: 30000,
      retries: 3,
      discovery: true,
    },
    server: {
      name,
      version: '1.0.0',
      capabilities: legacyConfig.capabilities || [],
    },
    stdio: {
      encoding: 'utf8',
      killSignal: 'SIGTERM',
      killTimeout: 5000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 60000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
    },
  };
}
