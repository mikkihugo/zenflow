/**
/// <reference types="./global-types" />
 * Network Test Helper - Network Testing Utilities
 *
 * Comprehensive network testing support for HTTP, WebSocket, and other protocols
 */

export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export interface NetworkTestHelper {
  startMockServer(port?: number): Promise<number>;
  stopMockServer(): Promise<void>;
  mockRequest(method: string, path: string, response: HttpResponse): void;
  mockWebSocket(path: string, handlers: WebSocketHandlers): void;
  captureRequests(): HttpRequest[];
  clearRequests(): void;
  simulateNetworkDelay(delayMs: number): void;
  simulateNetworkError(errorType: 'timeout' | 'connection' | 'dns'): void;
  resetNetworkConditions(): void;
  createHttpClient(baseUrl?: string): HttpClient;
  createWebSocketClient(url: string): WebSocketClient;
}

export interface WebSocketHandlers {
  onConnect?: () => void;
  onMessage?: (message: unknown) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface HttpClient {
  get(path: string, headers?: Record<string, string>): Promise<HttpResponse>;
  post(
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>;
  put(
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>;
  delete(path: string, headers?: Record<string, string>): Promise<HttpResponse>;
  patch(
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>;
}

export interface WebSocketClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: unknown): Promise<void>;
  onMessage(callback: (message: unknown) => void): void;
  onError(callback: (error: Error) => void): void;
  onConnect(callback: () => void): void;
  onDisconnect(callback: () => void): void;
}

export class MockNetworkTestHelper implements NetworkTestHelper {
  private routes = new Map<string, HttpResponse>();
  private webSocketHandlers = new Map<string, WebSocketHandlers>();
  private requests: HttpRequest[] = [];
  private networkDelay = 0;
  private networkError: string | null = null;
  private isRunning = false;
  private port = 0;

  async startMockServer(port: number = 0): Promise<number> {
    this.port = port || this.getRandomPort();
    this.isRunning = true;
    return this.port;
  }

  async stopMockServer(): Promise<void> {
    this.isRunning = false;
    this.routes.clear();
    this.webSocketHandlers.clear();
    this.requests = [];
  }

  mockRequest(method: string, path: string, response: HttpResponse): void {
    const key = `${method.toUpperCase()} ${path}`;
    this.routes.set(key, response);
  }

  mockWebSocket(path: string, handlers: WebSocketHandlers): void {
    this.webSocketHandlers.set(path, handlers);
  }

  captureRequests(): HttpRequest[] {
    return [...this.requests];
  }

  clearRequests(): void {
    this.requests = [];
  }

  simulateNetworkDelay(delayMs: number): void {
    this.networkDelay = delayMs;
  }

  simulateNetworkError(errorType: 'timeout' | 'connection' | 'dns'): void {
    this.networkError = errorType;
  }

  resetNetworkConditions(): void {
    this.networkDelay = 0;
    this.networkError = null;
  }

  createHttpClient(baseUrl?: string): HttpClient {
    const self = this;
    const _url = baseUrl || `http://localhost:${this.port}`;

    return {
      async get(
        path: string,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return self.makeRequest('GET', path, undefined, headers);
      },

      async post(
        path: string,
        body?: any,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return self.makeRequest('POST', path, body, headers);
      },

      async put(
        path: string,
        body?: any,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return self.makeRequest('PUT', path, body, headers);
      },

      async delete(
        path: string,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return self.makeRequest('DELETE', path, undefined, headers);
      },

      async patch(
        path: string,
        body?: any,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return self.makeRequest('PATCH', path, body, headers);
      },
    };
  }

  createWebSocketClient(url: string): WebSocketClient {
    const self = this;
    const path = new URL(url).pathname;
    let isConnected = false;
    const messageCallbacks: Array<(message: unknown) => void> = [];
    const errorCallbacks: Array<(error: Error) => void> = [];
    const connectCallbacks: Array<() => void> = [];
    const disconnectCallbacks: Array<() => void> = [];

    return {
      async connect(): Promise<void> {
        if (self.networkError) {
          throw new Error(`Network error: ${self.networkError}`);
        }

        if (self.networkDelay > 0) {
          await self.delay(self.networkDelay);
        }

        isConnected = true;
        const handlers = self.webSocketHandlers.get(path);

        if (handlers?.onConnect) {
          handlers.onConnect();
        }

        connectCallbacks.forEach((callback) => callback());
      },

      async disconnect(): Promise<void> {
        isConnected = false;
        const handlers = self.webSocketHandlers.get(path);

        if (handlers?.onDisconnect) {
          handlers.onDisconnect();
        }

        disconnectCallbacks.forEach((callback) => callback());
      },

      async send(message: unknown): Promise<void> {
        if (!isConnected) {
          throw new Error('WebSocket not connected');
        }

        if (self.networkError) {
          throw new Error(`Network error: ${self.networkError}`);
        }

        if (self.networkDelay > 0) {
          await self.delay(self.networkDelay);
        }

        const handlers = self.webSocketHandlers.get(path);
        if (handlers?.onMessage) {
          handlers.onMessage(message);
        }
      },

      onMessage(callback: (message: unknown) => void): void {
        messageCallbacks.push(callback);
      },

      onError(callback: (error: Error) => void): void {
        errorCallbacks.push(callback);
      },

      onConnect(callback: () => void): void {
        connectCallbacks.push(callback);
      },

      onDisconnect(callback: () => void): void {
        disconnectCallbacks.push(callback);
      },
    };
  }

  private async makeRequest(
    method: string,
    path: string,
    body?: any,
    headers: Record<string, string> = {},
  ): Promise<HttpResponse> {
    if (!this.isRunning) {
      throw new Error('Mock server not running');
    }

    if (this.networkError) {
      throw new Error(`Network error: ${this.networkError}`);
    }

    if (this.networkDelay > 0) {
      await this.delay(this.networkDelay);
    }

    // Record the request
    const request: HttpRequest = {
      method: method.toUpperCase(),
      url: path,
      headers,
      body,
      timestamp: Date.now(),
    };
    this.requests.push(request);

    // Find matching route
    const key = `${method.toUpperCase()} ${path}`;
    const response = this.routes.get(key);

    if (response) {
      return response;
    }

    // Default 404 response
    return {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Not Found', path },
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getRandomPort(): number {
    return Math.floor(Math.random() * (65535 - 3000) + 3000);
  }
}

export class RealNetworkTestHelper implements NetworkTestHelper {
  private server: any = null;
  private port = 0;
  private routes = new Map<string, HttpResponse>();
  private requests: HttpRequest[] = [];

  async startMockServer(port: number = 0): Promise<number> {
    try {
      const http = await import('node:http');

      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.port = port || this.getRandomPort();

      await new Promise<void>((resolve, reject) => {
        this.server.listen(this.port, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return this.port;
    } catch (error) {
      console.warn('Real HTTP server not available, using mock');
      throw error;
    }
  }

  async stopMockServer(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server.close(() => resolve());
      });
      this.server = null;
    }

    this.routes.clear();
    this.requests = [];
  }

  mockRequest(method: string, path: string, response: HttpResponse): void {
    const key = `${method.toUpperCase()} ${path}`;
    this.routes.set(key, response);
  }

  mockWebSocket(_path: string, _handlers: WebSocketHandlers): void {
    // WebSocket support would require additional setup
    console.warn('WebSocket mocking not fully implemented for real server');
  }

  captureRequests(): HttpRequest[] {
    return [...this.requests];
  }

  clearRequests(): void {
    this.requests = [];
  }

  simulateNetworkDelay(_delayMs: number): void {
    // Not applicable for real server
    console.warn('Network delay simulation not supported for real server');
  }

  simulateNetworkError(_errorType: 'timeout' | 'connection' | 'dns'): void {
    // Not applicable for real server
    console.warn('Network error simulation not supported for real server');
  }

  resetNetworkConditions(): void {
    // Not applicable for real server
  }

  createHttpClient(baseUrl?: string): HttpClient {
    const url = baseUrl || `http://localhost:${this.port}`;

    return {
      async get(
        path: string,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return this.makeRealRequest('GET', `${url}${path}`, undefined, headers);
      },

      async post(
        path: string,
        body?: any,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return this.makeRealRequest('POST', `${url}${path}`, body, headers);
      },

      async put(
        path: string,
        body?: any,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return this.makeRealRequest('PUT', `${url}${path}`, body, headers);
      },

      async delete(
        path: string,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return this.makeRealRequest(
          'DELETE',
          `${url}${path}`,
          undefined,
          headers,
        );
      },

      async patch(
        path: string,
        body?: any,
        headers: Record<string, string> = {},
      ): Promise<HttpResponse> {
        return this.makeRealRequest('PATCH', `${url}${path}`, body, headers);
      },
    };
  }

  createWebSocketClient(_url: string): WebSocketClient {
    // Real WebSocket implementation would go here
    throw new Error('Real WebSocket client not implemented');
  }

  private async handleRequest(req: any, res: any): Promise<void> {
    // Collect request body
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const body =
        chunks.length > 0 ? Buffer.concat(chunks).toString() : undefined;

      // Record the request
      const request: HttpRequest = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: body ? this.tryParseJson(body) : undefined,
        timestamp: Date.now(),
      };
      this.requests.push(request);

      // Find matching route
      const key = `${req.method} ${req.url}`;
      const response = this.routes.get(key);

      if (response) {
        res.writeHead(response?.status, response?.headers);
        res.end(
          typeof response?.body === 'string'
            ? response?.body
            : JSON.stringify(response?.body),
        );
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found', path: req.url }));
      }
    });
  }

  private async makeRealRequest(
    method: string,
    url: string,
    body?: any,
    headers: Record<string, string> = {},
  ): Promise<HttpResponse> {
    try {
      // Use fetch if available, otherwise use http module
      if (typeof fetch !== 'undefined') {
        const options: RequestInit = {
          method,
          headers,
        };

        if (body) {
          options.body = typeof body === 'string' ? body : JSON.stringify(body);
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }

        const response = await fetch(url, options);
        const responseBody = await response?.text();

        return {
          status: response?.status,
          headers: Object.fromEntries(response?.headers?.entries()),
          body: this.tryParseJson(responseBody),
        };
      }
      throw new Error('fetch not available');
    } catch (error) {
      throw new Error(`HTTP request failed: ${error}`);
    }
  }

  private tryParseJson(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private getRandomPort(): number {
    return Math.floor(Math.random() * (65535 - 3000) + 3000);
  }
}

// Factory functions
export function createMockNetworkHelper(): NetworkTestHelper {
  return new MockNetworkTestHelper();
}

export function createRealNetworkHelper(): NetworkTestHelper {
  return new RealNetworkTestHelper();
}

// Helper functions for common testing patterns
export async function testHttpEndpoint(
  helper: NetworkTestHelper,
  method: string,
  path: string,
  expectedResponse: Partial<HttpResponse>,
  requestBody?: any,
): Promise<HttpResponse> {
  const client = helper.createHttpClient();

  let response: HttpResponse;

  switch (method.toUpperCase()) {
    case 'GET':
      response = await client.get(path);
      break;
    case 'POST':
      response = await client.post(path, requestBody);
      break;
    case 'PUT':
      response = await client.put(path, requestBody);
      break;
    case 'DELETE':
      response = await client.delete(path);
      break;
    case 'PATCH':
      response = await client.patch(path, requestBody);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  // Verify expected response
  if (expectedResponse?.status !== undefined) {
    if (response?.status !== expectedResponse?.status) {
      throw new Error(
        `Expected status ${expectedResponse?.status}, got ${response?.status}`,
      );
    }
  }

  return response;
}

export async function setupRestApiMock(
  helper: NetworkTestHelper,
  endpoints: Array<{
    method: string;
    path: string;
    response: HttpResponse;
  }>,
): Promise<void> {
  await helper.startMockServer();

  for (const endpoint of endpoints) {
    helper.mockRequest(endpoint.method, endpoint.path, endpoint.response);
  }
}
