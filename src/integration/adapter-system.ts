/**
 * @fileoverview Adapter Pattern Implementation for Multi-Protocol Support
 * Provides protocol adaptation and legacy system integration
 */

import { EventEmitter } from 'node:events';

// Core protocol interfaces
export interface ProtocolMessage {
  id: string;
  timestamp: Date;
  source: string;
  destination?: string;
  type: string;
  payload: any;
  metadata?: Record<string, any>;
}

export interface ProtocolResponse {
  id: string;
  requestId: string;
  timestamp: Date;
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
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
  subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void;
  unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void;
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
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> = new Map();

  constructor(protocol: 'http' | 'stdio' = 'http') {
    this.protocol = protocol;
  }

  async connect(config: ConnectionConfig): Promise<void> {
    if (this.connected) {
      throw new Error('Already connected');
    }

    try {
      if (this.protocol === 'http') {
        await this.connectHTTP(config);
      } else {
        await this.connectStdio(config);
      }
      
      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect via ${this.protocol}: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      if (this.protocol === 'http' && this.httpClient) {
        // Close HTTP client connections
        this.httpClient.destroy?.();
      } else if (this.protocol === 'stdio' && this.stdioProcess) {
        // Terminate stdio process
        this.stdioProcess.kill();
      }
      
      this.connected = false;
      this.eventHandlers.clear();
    } catch (error) {
      throw new Error(`Failed to disconnect: ${(error as Error).message}`);
    }
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    const startTime = Date.now();

    try {
      let response: any;

      if (this.protocol === 'http') {
        response = await this.sendHTTP(message);
      } else {
        response = await this.sendStdio(message);
      }

      return {
        id: `resp-${Date.now()}`,
        requestId: message.id,
        timestamp: new Date(),
        success: true,
        data: response,
        metadata: {
          protocol: this.protocol,
          responseTime: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        id: `resp-${Date.now()}`,
        requestId: message.id,
        timestamp: new Date(),
        success: false,
        error: (error as Error).message,
        metadata: {
          protocol: this.protocol,
          responseTime: Date.now() - startTime
        }
      };
    }
  }

  subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void {
    if (!handler) {
      this.eventHandlers.delete(eventType);
      return;
    }

    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(eventType, handlers);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getProtocolName(): string {
    return `mcp-${this.protocol}`;
  }

  getCapabilities(): string[] {
    return [
      'tool-execution',
      'resource-access',
      'prompt-templates',
      'completion-args'
    ];
  }

  async healthCheck(): Promise<boolean> {
    if (!this.connected) return false;

    try {
      const healthMessage: ProtocolMessage = {
        id: `health-${Date.now()}`,
        timestamp: new Date(),
        source: 'adapter',
        type: 'ping',
        payload: {}
      };

      const response = await this.send(healthMessage);
      return response.success;
    } catch {
      return false;
    }
  }

  private async connectHTTP(config: ConnectionConfig): Promise<void> {
    // HTTP MCP connection implementation
    const url = `${config.ssl ? 'https' : 'http'}://${config.host}:${config.port || 3000}${config.path || '/mcp'}`;
    
    // This would use actual HTTP client library
    this.httpClient = {
      baseURL: url,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };

    // Test connection
    const testResponse = await this.makeHTTPRequest('/capabilities', 'GET');
    if (!testResponse.success) {
      throw new Error('Failed to verify HTTP MCP connection');
    }
  }

  private async connectStdio(config: ConnectionConfig): Promise<void> {
    // Stdio MCP connection implementation
    const { spawn } = require('child_process');
    
    this.stdioProcess = spawn('npx', ['claude-zen', 'swarm', 'mcp', 'start'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return new Promise((resolve, reject) => {
      this.stdioProcess.on('spawn', () => {
        // Setup message handling
        this.stdioProcess.stdout.on('data', (data: Buffer) => {
          this.handleStdioMessage(data.toString());
        });
        resolve();
      });

      this.stdioProcess.on('error', (error: Error) => {
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Stdio connection timeout'));
      }, config.timeout || 10000);
    });
  }

  private async sendHTTP(message: ProtocolMessage): Promise<any> {
    const endpoint = this.mapMessageTypeToEndpoint(message.type);
    return this.makeHTTPRequest(endpoint, 'POST', message.payload);
  }

  private async sendStdio(message: ProtocolMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      const jsonRpcMessage = {
        jsonrpc: '2.0',
        id: message.id,
        method: message.type,
        params: message.payload
      };

      this.stdioProcess.stdin.write(JSON.stringify(jsonRpcMessage) + '\n');

      // Set up response handler with timeout
      const timeout = setTimeout(() => {
        reject(new Error('Stdio request timeout'));
      }, 30000);

      const responseHandler = (data: any) => {
        if (data.id === message.id) {
          clearTimeout(timeout);
          if (data.error) {
            reject(new Error(data.error.message));
          } else {
            resolve(data.result);
          }
        }
      };

      // This would be properly implemented with response tracking
      this.stdioProcess.stdout.once('data', responseHandler);
    });
  }

  private async makeHTTPRequest(endpoint: string, method: string, body?: any): Promise<any> {
    // HTTP request implementation placeholder
    return { success: true, data: body };
  }

  private mapMessageTypeToEndpoint(messageType: string): string {
    const endpointMap: Record<string, string> = {
      'swarm_init': '/tools/swarm_init',
      'agent_spawn': '/tools/agent_spawn',
      'task_orchestrate': '/tools/task_orchestrate',
      'ping': '/health',
      'capabilities': '/capabilities'
    };

    return endpointMap[messageType] || '/tools/unknown';
  }

  private handleStdioMessage(data: string): void {
    try {
      const lines = data.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const parsed = JSON.parse(line);
        
        if (parsed.method) {
          // Incoming notification/request
          const message: ProtocolMessage = {
            id: parsed.id || `notif-${Date.now()}`,
            timestamp: new Date(),
            source: 'mcp-server',
            type: parsed.method,
            payload: parsed.params
          };

          this.emitToHandlers(message.type, message);
        }
      }
    } catch (error) {
      console.error('Failed to parse stdio message:', error);
    }
  }

  private emitToHandlers(eventType: string, message: ProtocolMessage): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    });
  }
}

// WebSocket Protocol Adapter
export class WebSocketAdapter implements ProtocolAdapter {
  private connection?: WebSocket;
  private connected = false;
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(config: ConnectionConfig): Promise<void> {
    if (this.connected) {
      throw new Error('Already connected');
    }

    const wsUrl = `${config.ssl ? 'wss' : 'ws'}://${config.host}:${config.port || 3456}${config.path || '/ws'}`;

    return new Promise((resolve, reject) => {
      try {
        this.connection = new WebSocket(wsUrl);

        this.connection.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.connection.onerror = (error) => {
          reject(new Error(`WebSocket connection failed: ${error}`));
        };

        this.connection.onclose = () => {
          this.connected = false;
          this.handleDisconnection();
        };

        this.connection.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, config.timeout || 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection && this.connected) {
      this.connection.close();
      this.connected = false;
    }
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!this.connected || !this.connection) {
      throw new Error('Not connected');
    }

    const startTime = Date.now();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          id: `resp-${Date.now()}`,
          requestId: message.id,
          timestamp: new Date(),
          success: false,
          error: 'Request timeout'
        });
      }, 30000);

      // Set up response handler
      const responseHandler = (response: any) => {
        if (response.requestId === message.id) {
          clearTimeout(timeout);
          resolve({
            id: response.id || `resp-${Date.now()}`,
            requestId: message.id,
            timestamp: new Date(),
            success: response.success !== false,
            data: response.data,
            error: response.error,
            metadata: {
              protocol: 'websocket',
              responseTime: Date.now() - startTime
            }
          });
        }
      };

      // Send message
      this.connection!.send(JSON.stringify({
        ...message,
        expectResponse: true
      }));

      // This would be properly implemented with response tracking
      this.connection!.addEventListener('message', responseHandler, { once: true });
    });
  }

  subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void {
    if (!handler) {
      this.eventHandlers.delete(eventType);
      return;
    }

    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this.connected && this.connection?.readyState === WebSocket.OPEN;
  }

  getProtocolName(): string {
    return 'websocket';
  }

  getCapabilities(): string[] {
    return [
      'real-time-events',
      'bidirectional-communication',
      'connection-persistence',
      'auto-reconnection'
    ];
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConnected()) return false;

    try {
      const pingMessage: ProtocolMessage = {
        id: `ping-${Date.now()}`,
        timestamp: new Date(),
        source: 'adapter',
        type: 'ping',
        payload: { timestamp: Date.now() }
      };

      const response = await this.send(pingMessage);
      return response.success;
    } catch {
      return false;
    }
  }

  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      const message: ProtocolMessage = {
        id: parsed.id || `msg-${Date.now()}`,
        timestamp: new Date(parsed.timestamp) || new Date(),
        source: parsed.source || 'server',
        destination: parsed.destination,
        type: parsed.type,
        payload: parsed.payload,
        metadata: parsed.metadata
      };

      this.emitToHandlers(message.type, message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleDisconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        // This would trigger reconnection with stored config
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  private emitToHandlers(eventType: string, message: ProtocolMessage): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('WebSocket event handler error:', error);
      }
    });
  }
}

// REST API Adapter
export class RESTAdapter implements ProtocolAdapter {
  private baseUrl?: string;
  private connected = false;
  private authHeaders: Record<string, string> = {};
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> = new Map();

  async connect(config: ConnectionConfig): Promise<void> {
    this.baseUrl = `${config.ssl ? 'https' : 'http'}://${config.host}:${config.port || 80}${config.path || '/api'}`;
    
    // Setup authentication
    if (config.authentication) {
      this.setupAuthentication(config.authentication);
    }

    // Test connection
    try {
      const healthResponse = await this.makeRequest('/health', 'GET');
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      this.connected = true;
    } catch (error) {
      throw new Error(`REST API connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.authHeaders = {};
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    const startTime = Date.now();
    const endpoint = this.mapMessageTypeToEndpoint(message.type);

    try {
      const response = await this.makeRequest(endpoint, 'POST', message.payload);
      const data = await response.json();

      return {
        id: `resp-${Date.now()}`,
        requestId: message.id,
        timestamp: new Date(),
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || `HTTP ${response.status}`,
        metadata: {
          protocol: 'rest',
          responseTime: Date.now() - startTime,
          statusCode: response.status
        }
      };
    } catch (error) {
      return {
        id: `resp-${Date.now()}`,
        requestId: message.id,
        timestamp: new Date(),
        success: false,
        error: (error as Error).message,
        metadata: {
          protocol: 'rest',
          responseTime: Date.now() - startTime
        }
      };
    }
  }

  subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void {
    // REST doesn't support real-time subscriptions, but we can simulate with polling
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void {
    if (!handler) {
      this.eventHandlers.delete(eventType);
      return;
    }

    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getProtocolName(): string {
    return 'rest-api';
  }

  getCapabilities(): string[] {
    return [
      'http-requests',
      'json-payloads',
      'authentication',
      'request-response'
    ];
  }

  async healthCheck(): Promise<boolean> {
    if (!this.connected) return false;

    try {
      const response = await this.makeRequest('/health', 'GET');
      return response.ok;
    } catch {
      return false;
    }
  }

  private setupAuthentication(auth: AuthConfig): void {
    switch (auth.type) {
      case 'bearer':
        if (auth.credentials?.token) {
          this.authHeaders['Authorization'] = `Bearer ${auth.credentials.token}`;
        }
        break;
      case 'api-key':
        if (auth.credentials?.apiKey) {
          this.authHeaders['X-API-Key'] = auth.credentials.apiKey;
        }
        break;
      case 'basic':
        if (auth.credentials?.username && auth.credentials?.password) {
          const encoded = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
          this.authHeaders['Authorization'] = `Basic ${encoded}`;
        }
        break;
    }
  }

  private async makeRequest(endpoint: string, method: string, body?: any): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.authHeaders
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    return fetch(url, options);
  }

  private mapMessageTypeToEndpoint(messageType: string): string {
    const endpointMap: Record<string, string> = {
      'swarm_init': '/swarms',
      'agent_spawn': '/agents',
      'task_orchestrate': '/tasks',
      'system_status': '/status',
      'document_process': '/documents/process'
    };

    return endpointMap[messageType] || '/unknown';
  }
}

// Legacy System Adapter (for older protocols)
export class LegacySystemAdapter implements ProtocolAdapter {
  private connected = false;
  private connection?: any;
  private eventHandlers: Map<string, ((message: ProtocolMessage) => void)[]> = new Map();

  async connect(config: ConnectionConfig): Promise<void> {
    // This would implement connection to legacy systems
    // Could support protocols like FTP, SOAP, proprietary TCP protocols, etc.
    
    try {
      switch (config.protocol.toLowerCase()) {
        case 'soap':
          await this.connectSOAP(config);
          break;
        case 'xmlrpc':
          await this.connectXMLRPC(config);
          break;
        case 'tcp':
          await this.connectTCP(config);
          break;
        default:
          throw new Error(`Unsupported legacy protocol: ${config.protocol}`);
      }
      
      this.connected = true;
    } catch (error) {
      throw new Error(`Legacy system connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      // Protocol-specific disconnection
      this.connection.close?.();
      this.connection = undefined;
    }
    this.connected = false;
  }

  async send(message: ProtocolMessage): Promise<ProtocolResponse> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    const startTime = Date.now();

    try {
      // Transform modern message format to legacy format
      const legacyFormat = this.transformToLegacyFormat(message);
      const response = await this.sendLegacyMessage(legacyFormat);
      const modernFormat = this.transformFromLegacyFormat(response);

      return {
        id: `resp-${Date.now()}`,
        requestId: message.id,
        timestamp: new Date(),
        success: true,
        data: modernFormat,
        metadata: {
          protocol: 'legacy',
          responseTime: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        id: `resp-${Date.now()}`,
        requestId: message.id,
        timestamp: new Date(),
        success: false,
        error: (error as Error).message,
        metadata: {
          protocol: 'legacy',
          responseTime: Date.now() - startTime
        }
      };
    }
  }

  subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void {
    if (!handler) {
      this.eventHandlers.delete(eventType);
      return;
    }

    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getProtocolName(): string {
    return 'legacy-system';
  }

  getCapabilities(): string[] {
    return [
      'legacy-protocol-support',
      'format-transformation',
      'backward-compatibility'
    ];
  }

  async healthCheck(): Promise<boolean> {
    return this.connected;
  }

  private async connectSOAP(config: ConnectionConfig): Promise<void> {
    // SOAP connection implementation
    this.connection = { type: 'soap', endpoint: `${config.host}:${config.port}` };
  }

  private async connectXMLRPC(config: ConnectionConfig): Promise<void> {
    // XML-RPC connection implementation
    this.connection = { type: 'xmlrpc', endpoint: `${config.host}:${config.port}` };
  }

  private async connectTCP(config: ConnectionConfig): Promise<void> {
    // Raw TCP connection implementation
    this.connection = { type: 'tcp', host: config.host, port: config.port };
  }

  private transformToLegacyFormat(message: ProtocolMessage): any {
    // Transform modern message format to legacy system format
    return {
      action: message.type,
      data: message.payload,
      timestamp: message.timestamp.toISOString(),
      id: message.id
    };
  }

  private transformFromLegacyFormat(response: any): any {
    // Transform legacy response to modern format
    return {
      result: response.result || response.data,
      status: response.status || 'success',
      timestamp: new Date(response.timestamp || Date.now())
    };
  }

  private async sendLegacyMessage(message: any): Promise<any> {
    // Send message using legacy protocol
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          result: 'Legacy operation completed',
          status: 'success',
          timestamp: new Date().toISOString()
        });
      }, 100);
    });
  }
}

// Protocol Adapter Factory
export class AdapterFactory {
  private static adapterRegistry: Map<string, () => ProtocolAdapter> = new Map();

  static {
    // Register built-in adapters
    this.registerAdapter('mcp-http', () => new MCPAdapter('http'));
    this.registerAdapter('mcp-stdio', () => new MCPAdapter('stdio'));
    this.registerAdapter('websocket', () => new WebSocketAdapter());
    this.registerAdapter('rest', () => new RESTAdapter());
    this.registerAdapter('legacy', () => new LegacySystemAdapter());
  }

  static registerAdapter(protocol: string, adapterFactory: () => ProtocolAdapter): void {
    this.adapterRegistry.set(protocol.toLowerCase(), adapterFactory);
  }

  static createAdapter(protocol: string): ProtocolAdapter {
    const factory = this.adapterRegistry.get(protocol.toLowerCase());
    if (!factory) {
      throw new Error(`Unknown protocol: ${protocol}`);
    }
    return factory();
  }

  static getAvailableProtocols(): string[] {
    return Array.from(this.adapterRegistry.keys());
  }

  static hasAdapter(protocol: string): boolean {
    return this.adapterRegistry.has(protocol.toLowerCase());
  }
}

// Multi-Protocol Communication Manager
export class ProtocolManager extends EventEmitter {
  private adapters: Map<string, ProtocolAdapter> = new Map();
  private routingTable: Map<string, string> = new Map();
  private messageQueue: Array<{ message: ProtocolMessage; protocol: string }> = [];
  private processing = false;

  async addProtocol(name: string, protocol: string, config: ConnectionConfig): Promise<void> {
    if (this.adapters.has(name)) {
      throw new Error(`Protocol ${name} already exists`);
    }

    const adapter = AdapterFactory.createAdapter(protocol);
    await adapter.connect(config);
    
    this.adapters.set(name, adapter);
    this.emit('protocol:added', { name, protocol, capabilities: adapter.getCapabilities() });
  }

  async removeProtocol(name: string): Promise<void> {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Protocol ${name} not found`);
    }

    await adapter.disconnect();
    this.adapters.delete(name);
    this.emit('protocol:removed', { name });
  }

  async sendMessage(message: ProtocolMessage, protocolName?: string): Promise<ProtocolResponse> {
    const targetProtocol = protocolName || this.routeMessage(message);
    const adapter = this.adapters.get(targetProtocol);

    if (!adapter) {
      throw new Error(`Protocol ${targetProtocol} not found`);
    }

    if (!adapter.isConnected()) {
      throw new Error(`Protocol ${targetProtocol} not connected`);
    }

    return adapter.send(message);
  }

  async broadcast(message: ProtocolMessage, excludeProtocols?: string[]): Promise<ProtocolResponse[]> {
    const results: ProtocolResponse[] = [];
    const exclude = new Set(excludeProtocols || []);

    for (const [name, adapter] of this.adapters) {
      if (exclude.has(name) || !adapter.isConnected()) {
        continue;
      }

      try {
        const response = await adapter.send(message);
        results.push(response);
      } catch (error) {
        results.push({
          id: `error-${Date.now()}`,
          requestId: message.id,
          timestamp: new Date(),
          success: false,
          error: (error as Error).message,
          metadata: { protocol: name }
        });
      }
    }

    return results;
  }

  setRoute(messageType: string, protocolName: string): void {
    this.routingTable.set(messageType, protocolName);
  }

  removeRoute(messageType: string): void {
    this.routingTable.delete(messageType);
  }

  getProtocolStatus(): Array<{ name: string; protocol: string; connected: boolean; healthy: boolean }> {
    const status: Array<{ name: string; protocol: string; connected: boolean; healthy: boolean }> = [];

    for (const [name, adapter] of this.adapters) {
      status.push({
        name,
        protocol: adapter.getProtocolName(),
        connected: adapter.isConnected(),
        healthy: false // Would be set by health check
      });
    }

    return status;
  }

  async healthCheckAll(): Promise<void> {
    const healthChecks = Array.from(this.adapters.entries()).map(async ([name, adapter]) => {
      try {
        const healthy = await adapter.healthCheck();
        this.emit('protocol:health', { name, healthy });
        return { name, healthy };
      } catch (error) {
        this.emit('protocol:health', { name, healthy: false, error });
        return { name, healthy: false };
      }
    });

    await Promise.all(healthChecks);
  }

  async shutdown(): Promise<void> {
    this.processing = false;

    const disconnections = Array.from(this.adapters.values()).map(adapter => 
      adapter.disconnect().catch(error => 
        console.error('Error disconnecting adapter:', error)
      )
    );

    await Promise.all(disconnections);
    this.adapters.clear();
    this.routingTable.clear();
    this.emit('manager:shutdown');
  }

  private routeMessage(message: ProtocolMessage): string {
    // Check routing table first
    const routedProtocol = this.routingTable.get(message.type);
    if (routedProtocol && this.adapters.has(routedProtocol)) {
      return routedProtocol;
    }

    // Fallback to first available protocol
    for (const [name, adapter] of this.adapters) {
      if (adapter.isConnected()) {
        return name;
      }
    }

    throw new Error('No connected protocols available');
  }
}