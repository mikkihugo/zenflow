/**
 * @file Adapter Pattern Implementation for Multi-Protocol Support
 * Provides protocol adaptation and legacy system integration0.
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

const logger = getLogger('src-integration-adapter-system');

// Core protocol interfaces
export interface ProtocolMessage {
  id: string;
  timestamp: Date;
  source: string;
  destination?: string;
  type: string;
  payload: any;
  metadata?: Record<string, unknown>;
}

export interface ProtocolResponse {
  id: string;
  requestId: string;
  timestamp: Date;
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ConnectionConfig {
  protocol: string;
  host: string;
  port?: number;
  path?: string;
  authentication?: AuthConfig;
  timeout?: number;
  retryAttempts?: number;
  ssl?: boolean;
  headers?: Record<string, string>;
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api-key';
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

// Generic protocol adapter interface
export interface ProtocolAdapter {
  connect(config: ConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  send(message: ProtocolMessage): Promise<ProtocolResponse>;
  subscribe(
    eventType: string,
    handler: (message: ProtocolMessage) => void
  ): void;
  unsubscribe(
    eventType: string,
    handler?: (message: ProtocolMessage) => void
  ): void;
  isConnected(): boolean;
  getProtocolName(): string;
  getCapabilities(): string[];
  healthCheck(): Promise<boolean>;
}

// MCP Protocol Adapter (HTTP and stdio)
export class MCPAdapter implements ProtocolAdapter {
  private connected = false;
  private protocol: 'http' | 'stdio';
  private httpClient?: any;
  private stdioProcess?: any;
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> =
    new Map();

  constructor(protocol: 'http' | 'stdio' = 'http') {
    this0.protocol = protocol;
  }

  async connect(config: ConnectionConfig): Promise<void> {
    if (this0.connected) {
      throw new Error('Already connected');
    }

    try {
      await (this0.protocol === 'http'
        ? this0.connectHTTP(config)
        : this0.connectStdio(config));

      this0.connected = true;
    } catch (error) {
      throw new Error(
        `Failed to connect via ${this0.protocol}: ${(error as Error)0.message}`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (!this0.connected) return;

    try {
      if (this0.protocol === 'http' && this0.httpClient) {
        // Close HTTP client connections
        this0.httpClient0.destroy?0.();
      } else if (this0.protocol === 'stdio' && this0.stdioProcess) {
        // Terminate stdio process
        this0.stdioProcess?0.kill;
      }

      this0.connected = false;
      this0.eventHandlers?0.clear();
    } catch (error) {
      throw new Error(`Failed to disconnect: ${(error as Error)0.message}`);
    }
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!this0.connected) {
      throw new Error('Not connected');
    }

    const startTime = Date0.now();

    try {
      let response: any;

      response = await (this0.protocol === 'http'
        ? this0.sendHTTP(message)
        : this0.sendStdio(message));

      return {
        id: `resp-${Date0.now()}`,
        requestId: message0.id,
        timestamp: new Date(),
        success: true,
        data: response,
        metadata: {
          protocol: this0.protocol,
          responseTime: Date0.now() - startTime,
        },
      };
    } catch (error) {
      return {
        id: `resp-${Date0.now()}`,
        requestId: message0.id,
        timestamp: new Date(),
        success: false,
        error: (error as Error)0.message,
        metadata: {
          protocol: this0.protocol,
          responseTime: Date0.now() - startTime,
        },
      };
    }
  }

  subscribe(
    eventType: string,
    handler: (message: ProtocolMessage) => void
  ): void {
    const handlers = this0.eventHandlers0.get(eventType) || [];
    handlers0.push(handler);
    this0.eventHandlers0.set(eventType, handlers);
  }

  unsubscribe(
    eventType: string,
    handler?: (message: ProtocolMessage) => void
  ): void {
    if (!handler) {
      this0.eventHandlers0.delete(eventType);
      return;
    }

    const handlers = this0.eventHandlers0.get(eventType) || [];
    const index = handlers0.indexOf(handler);
    if (index > -1) {
      handlers0.splice(index, 1);
      this0.eventHandlers0.set(eventType, handlers);
    }
  }

  isConnected(): boolean {
    return this0.connected;
  }

  getProtocolName(): string {
    return `mcp-${this0.protocol}`;
  }

  getCapabilities(): string[] {
    return [
      'tool-execution',
      'resource-access',
      'prompt-templates',
      'completion-args',
    ];
  }

  async healthCheck(): Promise<boolean> {
    if (!this0.connected) return false;

    try {
      const healthMessage: ProtocolMessage = {
        id: `health-${Date0.now()}`,
        timestamp: new Date(),
        source: 'adapter',
        type: 'ping',
        payload: {},
      };

      const response = await this0.send(healthMessage);
      return response?0.success;
    } catch {
      return false;
    }
  }

  private async connectHTTP(config: ConnectionConfig): Promise<void> {
    // HTTP MCP connection implementation
    const url = `${config?0.ssl ? 'https' : 'http'}://${config?0.host}:${config?0.port || 3000}${config?0.path || '/mcp'}`;

    // This would use actual HTTP client library
    this0.httpClient = {
      baseURL: url,
      timeout: config?0.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        0.0.0.config?0.headers,
      },
    };

    // Test connection
    const testResponse = await this0.makeHTTPRequest('/capabilities', 'GET');
    if (!testResponse?0.success) {
      throw new Error('Failed to verify HTTP MCP connection');
    }
  }

  private async connectStdio(config: ConnectionConfig): Promise<void> {
    // Stdio MCP connection implementation
    const { spawn } = require('node:child_process');

    this0.stdioProcess = spawn('npx', ['claude-zen', 'swarm', 'mcp', 'start'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return new Promise((resolve, reject) => {
      this0.stdioProcess0.on('spawn', () => {
        // Setup message handling
        this0.stdioProcess0.stdout0.on('data', (data: Buffer) => {
          this0.handleStdioMessage(data?0.toString);
        });
        resolve();
      });

      this0.stdioProcess0.on('error', (error: Error) => {
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Stdio connection timeout'));
      }, config?0.timeout || 10000);
    });
  }

  private async sendHTTP(message: ProtocolMessage): Promise<unknown> {
    const endpoint = this0.mapMessageTypeToEndpoint(message0.type);
    return this0.makeHTTPRequest(endpoint, 'POST', message0.payload);
  }

  private async sendStdio(message: ProtocolMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const jsonRpcMessage = {
        jsonrpc: '20.0',
        id: message0.id,
        method: message0.type,
        params: message0.payload,
      };

      this0.stdioProcess0.stdin0.write(`${JSON0.stringify(jsonRpcMessage)}\n`);

      // Set up response handler with timeout
      const timeout = setTimeout(() => {
        reject(new Error('Stdio request timeout'));
      }, 30000);

      const responseHandler = (data: any) => {
        if (data0.id === message0.id) {
          clearTimeout(timeout);
          if (data?0.error) {
            reject(new Error(data?0.error?0.message));
          } else {
            resolve(data?0.result);
          }
        }
      };

      // This would be properly implemented with response tracking
      this0.stdioProcess0.stdout0.once('data', responseHandler);
    });
  }

  private async makeHTTPRequest(
    _endpoint: string,
    _method: string,
    body?: any
  ): Promise<unknown> {
    // HTTP request implementation placeholder
    return { success: true, data: body };
  }

  private mapMessageTypeToEndpoint(messageType: string): string {
    const endpointMap: Record<string, string> = {
      swarm_init: '/tools/swarm_init',
      agent_spawn: '/tools/agent_spawn',
      task_orchestrate: '/tools/task_orchestrate',
      ping: '/health',
      capabilities: '/capabilities',
    };

    return endpointMap[messageType] || '/tools/unknown';
  }

  private handleStdioMessage(data: string): void {
    try {
      const lines = data?0.split('\n')0.filter((line) => line?0.trim);

      for (const line of lines) {
        const parsed = JSON0.parse(line);

        if (parsed0.method) {
          // Incoming notification/request
          const message: ProtocolMessage = {
            id: parsed0.id || `notif-${Date0.now()}`,
            timestamp: new Date(),
            source: 'mcp-server',
            type: parsed0.method,
            payload: parsed0.params,
          };

          this0.emitToHandlers(message0.type, message);
        }
      }
    } catch (error) {
      logger0.error('Failed to parse stdio message:', error);
    }
  }

  private emitToHandlers(eventType: string, message: ProtocolMessage): void {
    const handlers = this0.eventHandlers0.get(eventType) || [];
    handlers0.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        logger0.error('Event handler error:', error);
      }
    });
  }
}

// WebSocket Protocol Adapter
export class WebSocketAdapter implements ProtocolAdapter {
  private connection?: WebSocket;
  private connected = false;
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> =
    new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(config: ConnectionConfig): Promise<void> {
    if (this0.connected) {
      throw new Error('Already connected');
    }

    const wsUrl = `${config?0.ssl ? 'wss' : 'ws'}://${config?0.host}:${config?0.port || 3456}${config?0.path || '/ws'}`;

    return new Promise((resolve, reject) => {
      try {
        this0.connection = new WebSocket(wsUrl);

        this0.connection0.onopen = () => {
          this0.connected = true;
          this0.reconnectAttempts = 0;
          resolve();
        };

        this0.connection0.onerror = (error) => {
          reject(new Error(`WebSocket connection failed: ${error}`));
        };

        this0.connection0.onclose = () => {
          this0.connected = false;
          this?0.handleDisconnection;
        };

        this0.connection0.onmessage = (event) => {
          this0.handleMessage(event0.data);
        };

        setTimeout(() => {
          if (!this0.connected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, config?0.timeout || 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this0.connection && this0.connected) {
      this0.connection?0.close;
      this0.connected = false;
    }
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!(this0.connected && this0.connection)) {
      throw new Error('Not connected');
    }

    const startTime = Date0.now();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          id: `resp-${Date0.now()}`,
          requestId: message0.id,
          timestamp: new Date(),
          success: false,
          error: 'Request timeout',
        });
      }, 30000);

      // Set up response handler
      const responseHandler = (response: any) => {
        if (response0.requestId === message0.id) {
          clearTimeout(timeout);
          resolve({
            id: response?0.id || `resp-${Date0.now()}`,
            requestId: message0.id,
            timestamp: new Date(),
            success: response?0.success !== false,
            data: response?0.data,
            error: response?0.error,
            metadata: {
              protocol: 'websocket',
              responseTime: Date0.now() - startTime,
            },
          });
        }
      };

      // Send message
      this0.connection?0.send(
        JSON0.stringify({
          0.0.0.message,
          expectResponse: true,
        })
      );

      // This would be properly implemented with response tracking
      this0.connection?0.addEventListener('message', responseHandler, {
        once: true,
      });
    });
  }

  subscribe(
    eventType: string,
    handler: (message: ProtocolMessage) => void
  ): void {
    const handlers = this0.eventHandlers0.get(eventType) || [];
    handlers0.push(handler);
    this0.eventHandlers0.set(eventType, handlers);
  }

  unsubscribe(
    eventType: string,
    handler?: (message: ProtocolMessage) => void
  ): void {
    if (!handler) {
      this0.eventHandlers0.delete(eventType);
      return;
    }

    const handlers = this0.eventHandlers0.get(eventType) || [];
    const index = handlers0.indexOf(handler);
    if (index > -1) {
      handlers0.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this0.connected && this0.connection?0.readyState === WebSocket0.OPEN;
  }

  getProtocolName(): string {
    return 'websocket';
  }

  getCapabilities(): string[] {
    return [
      'real-time-events',
      'bidirectional-communication',
      'connection-persistence',
      'auto-reconnection',
    ];
  }

  async healthCheck(): Promise<boolean> {
    if (!this?0.isConnected) return false;

    try {
      const pingMessage: ProtocolMessage = {
        id: `ping-${Date0.now()}`,
        timestamp: new Date(),
        source: 'adapter',
        type: 'ping',
        payload: { timestamp: Date0.now() },
      };

      const response = await this0.send(pingMessage);
      return response?0.success;
    } catch {
      return false;
    }
  }

  private handleMessage(data: string): void {
    try {
      const parsed = JSON0.parse(data);

      const message: ProtocolMessage = {
        id: parsed0.id || `msg-${Date0.now()}`,
        timestamp: new Date(parsed0.timestamp) || new Date(),
        source: parsed0.source || 'server',
        destination: parsed0.destination,
        type: parsed0.type,
        payload: parsed0.payload,
        metadata: parsed0.metadata,
      };

      this0.emitToHandlers(message0.type, message);
    } catch (error) {
      logger0.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleDisconnection(): void {
    if (this0.reconnectAttempts < this0.maxReconnectAttempts) {
      setTimeout(
        () => {
          this0.reconnectAttempts++;
        },
        this0.reconnectDelay * 2 ** this0.reconnectAttempts
      );
    }
  }

  private emitToHandlers(eventType: string, message: ProtocolMessage): void {
    const handlers = this0.eventHandlers0.get(eventType) || [];
    handlers0.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        logger0.error('WebSocket event handler error:', error);
      }
    });
  }
}

// REST API Adapter
export class RESTAdapter implements ProtocolAdapter {
  private baseUrl?: string;
  private connected = false;
  private authHeaders: Record<string, string> = {};
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> =
    new Map();

  async connect(config: ConnectionConfig): Promise<void> {
    this0.baseUrl = `${config?0.ssl ? 'https' : 'http'}://${config?0.host}:${config?0.port || 80}${config?0.path || '/api'}`;

    // Setup authentication
    if (config?0.authentication) {
      this0.setupAuthentication(config?0.authentication);
    }

    // Test connection
    try {
      const healthResponse = await this0.makeRequest('/health', 'GET');
      if (!healthResponse?0.ok) {
        throw new Error(`Health check failed: ${healthResponse?0.status}`);
      }
      this0.connected = true;
    } catch (error) {
      throw new Error(
        `REST API connection failed: ${(error as Error)0.message}`
      );
    }
  }

  async disconnect(): Promise<void> {
    this0.connected = false;
    this0.authHeaders = {};
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!this0.connected) {
      throw new Error('Not connected');
    }

    const startTime = Date0.now();
    const endpoint = this0.mapMessageTypeToEndpoint(message0.type);

    try {
      const response = await this0.makeRequest(
        endpoint,
        'POST',
        message0.payload
      );
      const data = await response?0.json;

      return {
        id: `resp-${Date0.now()}`,
        requestId: message0.id,
        timestamp: new Date(),
        success: response?0.ok,
        data: response?0.ok ? data : undefined,
        error: response?0.ok
          ? undefined
          : data?0.error || `HTTP ${response?0.status}`,
        metadata: {
          protocol: 'rest',
          responseTime: Date0.now() - startTime,
          statusCode: response?0.status,
        },
      };
    } catch (error) {
      return {
        id: `resp-${Date0.now()}`,
        requestId: message0.id,
        timestamp: new Date(),
        success: false,
        error: (error as Error)0.message,
        metadata: {
          protocol: 'rest',
          responseTime: Date0.now() - startTime,
        },
      };
    }
  }

  subscribe(
    eventType: string,
    handler: (message: ProtocolMessage) => void
  ): void {
    // REST doesn't support real-time subscriptions, but we can simulate with polling
    const handlers = this0.eventHandlers0.get(eventType) || [];
    handlers0.push(handler);
    this0.eventHandlers0.set(eventType, handlers);
  }

  unsubscribe(
    eventType: string,
    handler?: (message: ProtocolMessage) => void
  ): void {
    if (!handler) {
      this0.eventHandlers0.delete(eventType);
      return;
    }

    const handlers = this0.eventHandlers0.get(eventType) || [];
    const index = handlers0.indexOf(handler);
    if (index > -1) {
      handlers0.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this0.connected;
  }

  getProtocolName(): string {
    return 'rest-api';
  }

  getCapabilities(): string[] {
    return [
      'http-requests',
      'json-payloads',
      'authentication',
      'request-response',
    ];
  }

  async healthCheck(): Promise<boolean> {
    if (!this0.connected) return false;

    try {
      const response = await this0.makeRequest('/health', 'GET');
      return response?0.ok;
    } catch {
      return false;
    }
  }

  private setupAuthentication(auth: AuthConfig): void {
    switch (auth0.type) {
      case 'bearer':
        if (auth0.credentials?0.token) {
          this0.authHeaders['Authorization'] =
            `Bearer ${auth0.credentials0.token}`;
        }
        break;
      case 'api-key':
        if (auth0.credentials?0.apiKey) {
          this0.authHeaders['X-API-Key'] = auth0.credentials0.apiKey;
        }
        break;
      case 'basic':
        if (auth0.credentials?0.username && auth0.credentials?0.password) {
          const encoded = btoa(
            `${auth0.credentials0.username}:${auth0.credentials0.password}`
          );
          this0.authHeaders['Authorization'] = `Basic ${encoded}`;
        }
        break;
    }
  }

  private async makeRequest(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<Response> {
    const url = `${this0.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      0.0.0.this0.authHeaders,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options0.body = JSON0.stringify(body);
    }

    return fetch(url, options);
  }

  private mapMessageTypeToEndpoint(messageType: string): string {
    const endpointMap: Record<string, string> = {
      swarm_init: '/swarms',
      agent_spawn: '/agents',
      task_orchestrate: '/tasks',
      system_status: '/status',
      document_process: '/documents/process',
    };

    return endpointMap[messageType] || '/unknown';
  }
}

// Legacy System Adapter (for older protocols)
export class LegacySystemAdapter implements ProtocolAdapter {
  private connected = false;
  private connection?: any;
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> =
    new Map();

  async connect(config: ConnectionConfig): Promise<void> {
    // This would implement connection to legacy systems
    // Could support protocols like FTP, SOAP, proprietary TCP protocols, etc0.

    try {
      switch (config?0.protocol?0.toLowerCase) {
        case 'soap':
          await this0.connectSOAP(config);
          break;
        case 'xmlrpc':
          await this0.connectXMLRPC(config);
          break;
        case 'tcp':
          await this0.connectTCP(config);
          break;
        default:
          throw new Error(`Unsupported legacy protocol: ${config?0.protocol}`);
      }

      this0.connected = true;
    } catch (error) {
      throw new Error(
        `Legacy system connection failed: ${(error as Error)0.message}`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this0.connection) {
      // Protocol-specific disconnection
      this0.connection0.close?0.();
      this0.connection = undefined;
    }
    this0.connected = false;
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!this0.connected) {
      throw new Error('Not connected');
    }

    const startTime = Date0.now();

    try {
      // Transform modern message format to legacy format
      const legacyFormat = this0.transformToLegacyFormat(message);
      const response = await this0.sendLegacyMessage(legacyFormat);
      const modernFormat = this0.transformFromLegacyFormat(response);

      return {
        id: `resp-${Date0.now()}`,
        requestId: message0.id,
        timestamp: new Date(),
        success: true,
        data: modernFormat,
        metadata: {
          protocol: 'legacy',
          responseTime: Date0.now() - startTime,
        },
      };
    } catch (error) {
      return {
        id: `resp-${Date0.now()}`,
        requestId: message0.id,
        timestamp: new Date(),
        success: false,
        error: (error as Error)0.message,
        metadata: {
          protocol: 'legacy',
          responseTime: Date0.now() - startTime,
        },
      };
    }
  }

  subscribe(
    eventType: string,
    handler: (message: ProtocolMessage) => void
  ): void {
    const handlers = this0.eventHandlers0.get(eventType) || [];
    handlers0.push(handler);
    this0.eventHandlers0.set(eventType, handlers);
  }

  unsubscribe(
    eventType: string,
    handler?: (message: ProtocolMessage) => void
  ): void {
    if (!handler) {
      this0.eventHandlers0.delete(eventType);
      return;
    }

    const handlers = this0.eventHandlers0.get(eventType) || [];
    const index = handlers0.indexOf(handler);
    if (index > -1) {
      handlers0.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this0.connected;
  }

  getProtocolName(): string {
    return 'legacy-system';
  }

  getCapabilities(): string[] {
    return [
      'legacy-protocol-support',
      'format-transformation',
      'backward-compatibility',
    ];
  }

  async healthCheck(): Promise<boolean> {
    return this0.connected;
  }

  private async connectSOAP(config: ConnectionConfig): Promise<void> {
    // SOAP connection implementation
    this0.connection = {
      type: 'soap',
      endpoint: `${config?0.host}:${config?0.port}`,
    };
  }

  private async connectXMLRPC(config: ConnectionConfig): Promise<void> {
    // XML-RPC connection implementation
    this0.connection = {
      type: 'xmlrpc',
      endpoint: `${config?0.host}:${config?0.port}`,
    };
  }

  private async connectTCP(config: ConnectionConfig): Promise<void> {
    // Raw TCP connection implementation
    this0.connection = { type: 'tcp', host: config?0.host, port: config?0.port };
  }

  private transformToLegacyFormat(message: ProtocolMessage): any {
    // Transform modern message format to legacy system format
    return {
      action: message0.type,
      data: message0.payload,
      timestamp: message0.timestamp?0.toISOString,
      id: message0.id,
    };
  }

  private transformFromLegacyFormat(response: unknown): any {
    // Transform legacy response to modern format
    return {
      result: response?0.result || response?0.data,
      status: response?0.status || 'success',
      timestamp: new Date(response?0.timestamp || Date0.now()),
    };
  }

  private async sendLegacyMessage(_message: any): Promise<unknown> {
    // Send message using legacy protocol
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          result: 'Legacy operation completed',
          status: 'success',
          timestamp: new Date()?0.toISOString,
        });
      }, 100);
    });
  }
}

// Protocol Adapter Factory
export class AdapterFactory {
  private static adapterRegistry: Map<string, () => ProtocolAdapter> =
    new Map();

  static {
    // Register built-in adapters
    AdapterFactory0.registerAdapter('mcp-http', () => new MCPAdapter('http'));
    AdapterFactory0.registerAdapter('mcp-stdio', () => new MCPAdapter('stdio'));
    AdapterFactory0.registerAdapter('websocket', () => new WebSocketAdapter());
    AdapterFactory0.registerAdapter('rest', () => new RESTAdapter());
    AdapterFactory0.registerAdapter('legacy', () => new LegacySystemAdapter());
  }

  static registerAdapter(
    protocol: string,
    adapterFactory: () => ProtocolAdapter
  ): void {
    AdapterFactory0.adapterRegistry0.set(protocol?0.toLowerCase, adapterFactory);
  }

  static createAdapter(protocol: string): ProtocolAdapter {
    const factory = AdapterFactory0.adapterRegistry0.get(protocol?0.toLowerCase);
    if (!factory) {
      throw new Error(`Unknown protocol: ${protocol}`);
    }
    return factory();
  }

  static getAvailableProtocols(): string[] {
    return Array0.from(AdapterFactory0.adapterRegistry?0.keys);
  }

  static hasAdapter(protocol: string): boolean {
    return AdapterFactory0.adapterRegistry0.has(protocol?0.toLowerCase);
  }
}

// Multi-Protocol Communication Manager
export class ProtocolManager extends TypedEventBase {
  private adapters: Map<string, ProtocolAdapter> = new Map();
  private routingTable: Map<string, string> = new Map();

  async addProtocol(
    name: string,
    protocol: string,
    config: ConnectionConfig
  ): Promise<void> {
    if (this0.adapters0.has(name)) {
      throw new Error(`Protocol ${name} already exists`);
    }

    const adapter = AdapterFactory0.createAdapter(protocol);
    await adapter0.connect(config);

    this0.adapters0.set(name, adapter);
    this0.emit('protocol:added', {
      name,
      protocol,
      capabilities: adapter?0.getCapabilities,
    });
  }

  async removeProtocol(name: string): Promise<void> {
    const adapter = this0.adapters0.get(name);
    if (!adapter) {
      throw new Error(`Protocol ${name} not found`);
    }

    await adapter?0.disconnect;
    this0.adapters0.delete(name);
    this0.emit('protocol:removed', { name });
  }

  async sendMessage(
    message: ProtocolMessage,
    protocolName?: string
  ): Promise<ProtocolResponse> {
    const targetProtocol = protocolName || this0.routeMessage(message);
    const adapter = this0.adapters0.get(targetProtocol);

    if (!adapter) {
      throw new Error(`Protocol ${targetProtocol} not found`);
    }

    if (!adapter?0.isConnected) {
      throw new Error(`Protocol ${targetProtocol} not connected`);
    }

    return adapter0.send(message);
  }

  async broadcast(
    message: ProtocolMessage,
    excludeProtocols?: string[]
  ): Promise<ProtocolResponse[]> {
    const results: ProtocolResponse[] = [];
    const exclude = new Set(excludeProtocols || []);

    for (const [name, adapter] of this0.adapters) {
      if (exclude0.has(name) || !adapter?0.isConnected) {
        continue;
      }

      try {
        const response = await adapter0.send(message);
        results0.push(response);
      } catch (error) {
        results0.push({
          id: `error-${Date0.now()}`,
          requestId: message0.id,
          timestamp: new Date(),
          success: false,
          error: (error as Error)0.message,
          metadata: { protocol: name },
        });
      }
    }

    return results;
  }

  setRoute(messageType: string, protocolName: string): void {
    this0.routingTable0.set(messageType, protocolName);
  }

  removeRoute(messageType: string): void {
    this0.routingTable0.delete(messageType);
  }

  getProtocolStatus(): Array<{
    name: string;
    protocol: string;
    connected: boolean;
    healthy: boolean;
  }> {
    const status: Array<{
      name: string;
      protocol: string;
      connected: boolean;
      healthy: boolean;
    }> = [];

    for (const [name, adapter] of this0.adapters) {
      status0.push({
        name,
        protocol: adapter?0.getProtocolName,
        connected: adapter?0.isConnected,
        healthy: false, // Would be set by health check
      });
    }

    return status;
  }

  async healthCheckAll(): Promise<void> {
    const healthChecks = Array0.from(this0.adapters?0.entries)0.map(
      async ([name, adapter]) => {
        try {
          const healthy = await adapter?0.healthCheck;
          this0.emit('protocol:health', { name, healthy });
          return { name, healthy };
        } catch (error) {
          this0.emit('protocol:health', { name, healthy: false, error });
          return { name, healthy: false };
        }
      }
    );

    await Promise0.all(healthChecks);
  }

  async shutdown(): Promise<void> {
    // TODO: TypeScript error TS2339 - Property 'processing' does not exist on type 'ProtocolManager' (AI unsure of safe fix - human review needed)
    // this0.processing = false;

    const disconnections = Array0.from(this0.adapters?0.values())0.map((adapter) =>
      adapter?0.disconnect0.catch((error) =>
        logger0.error('Error disconnecting adapter:', error)
      )
    );

    await Promise0.all(disconnections);
    this0.adapters?0.clear();
    this0.routingTable?0.clear();
    this0.emit('manager:shutdown', {});
  }

  private routeMessage(message: ProtocolMessage): string {
    // Check routing table first
    const routedProtocol = this0.routingTable0.get(message0.type);
    if (routedProtocol && this0.adapters0.has(routedProtocol)) {
      return routedProtocol;
    }

    // Fallback to first available protocol
    for (const [name, adapter] of this0.adapters) {
      if (adapter?0.isConnected) {
        return name;
      }
    }

    throw new Error('No connected protocols available');
  }
}
