/**
 * HTTP transport for MCP
 */

import { ITransport, RequestHandler, NotificationHandler } from './base.ts';
import { MCPRequest, MCPResponse, MCPNotification, MCPConfig } from '../../utils/types.ts';
import { ILogger } from '../../core/logger.ts';
import { MCPTransportError } from '../../utils/errors.ts';

/**
 * HTTP transport implementation
 */
export class HttpTransport implements ITransport {
  private requestHandler?: RequestHandler;
  private notificationHandler?: NotificationHandler;
  private server?: Deno.HttpServer | undefined;
  private messageCount = 0;
  private notificationCount = 0;
  private running = false;
  private connections = new Set<WebSocket>();
  private activeWebSockets = new Set<WebSocket>();

  constructor(
    private host: string,
    private port: number,
    private tlsEnabled: boolean,
    private logger: ILogger,
    private config?: MCPConfig,
  ) {}

  async start(): Promise<void> {
    if (this.running) {
      throw new MCPTransportError('Transport already running');
    }

    this.logger.info('Starting HTTP transport', { 
      host: this.host,
      port: this.port,
      tls: this.tlsEnabled,
    });

    try {
      // Create listener
      const listener = Deno.listen({ 
        hostname: this.host,
        port: this.port,
      });

      this.server = Deno.serve({
        port: this.port,
        hostname: this.host,
        handler: (request) => this.handleRequest(request),
        onListen: ({ hostname, port }) => {
          this.logger.info(`HTTP server listening on ${hostname}:${port}`);
        },
      });

      this.running = true;
      this.logger.info('HTTP transport started');
    } catch (error) {
      throw new MCPTransportError('Failed to start HTTP transport', { error });
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.logger.info('Stopping HTTP transport');

    this.running = false;

    // Close all connections
    for (const conn of this.connections) {
      try {
        conn.close();
      } catch {
        // Ignore errors
      }
    }
    this.connections.clear();

    // Shutdown server
    if (this.server) {
      await this.server.shutdown();
      this.server = undefined;
    }

    this.logger.info('HTTP transport stopped');
  }

  onRequest(handler: RequestHandler): void {
    this.requestHandler = handler;
  }

  onNotification(handler: NotificationHandler): void {
    this.notificationHandler = handler;
  }

  async sendNotification(notification: MCPNotification): Promise<void> {
    // Send notification to all connected WebSocket clients
    const message = JSON.stringify(notification);
    const promises: Promise<void>[] = [];

    for (const ws of this.activeWebSockets) {
      if (ws.readyState === WebSocket.OPEN) {
        promises.push(
          new Promise<void>((resolve, reject) => {
            try {
              ws.send(message);
              resolve();
            } catch (error) {
              reject(error);
            }
          })
        );
      }
    }

    try {
      await Promise.all(promises);
      this.notificationCount++;
      
      this.logger.debug('Notification sent to WebSocket clients', {
        method: notification.method,
        clientCount: this.activeWebSockets.size,
      });
    } catch (error) {
      this.logger.error('Failed to send notification to some clients', { error });
      throw new MCPTransportError('Failed to send notification', { error });
    }
  }

  async getHealthStatus(): Promise<{ 
    healthy: boolean; 
    error?: string; 
    metrics?: Record<string, number>;
  }> {
    return {
      healthy: this.running,
      metrics: {
        messagesReceived: this.messageCount,
        notificationsSent: this.notificationCount,
        activeConnections: this.connections.size,
        activeWebSockets: this.activeWebSockets.size,
      },
    };
  }

  private async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return this.handleCORS(request);
    }

    // Handle WebSocket upgrade for real-time notifications
    if (request.headers.get('upgrade') === 'websocket' && pathname === '/ws') {
      return this.handleWebSocketUpgrade(request);
    }

    // Only accept POST requests to /rpc for JSON-RPC
    if (request.method !== 'POST' || pathname !== '/rpc') {
      return this.createErrorResponse(405, 'Method not allowed');
    }

    // Add CORS headers to all responses
    const headers = this.getCORSHeaders();
    headers.set('content-type', 'application/json');

    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return this.createErrorResponse(400, 'Invalid content type', headers);
    }

    // Check authorization if authentication is enabled
    if (this.config?.auth?.enabled) {
      const authResult = await this.validateAuth(request);
      if (!authResult.valid) {
        return this.createErrorResponse(401, authResult.error || 'Unauthorized', headers);
      }
    }

    try {
      // Parse request body
      const body = await request.text();
      
      let mcpMessage: any;
      try {
        mcpMessage = JSON.parse(body);
      } catch {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32700,
              message: 'Parse error',
            },
          }),
          { status: 400, headers },
        );
      }

      // Validate JSON-RPC format
      if (!mcpMessage.jsonrpc || mcpMessage.jsonrpc !== '2.0') {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: mcpMessage.id || null,
            error: {
              code: -32600,
              message: 'Invalid request - missing or invalid jsonrpc version',
            },
          }),
          { status: 400, headers },
        );
      }

      if (!mcpMessage.method) {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: mcpMessage.id || null,
            error: {
              code: -32600,
              message: 'Invalid request - missing method',
            },
          }),
          { status: 400, headers },
        );
      }

      this.messageCount++;

      // Check if this is a notification (no id) or request
      if (mcpMessage.id === undefined) {
        // Handle notification
        await this.handleNotificationMessage(mcpMessage as MCPNotification);
        // Notifications don't get responses
        return new Response('', { status: 204, headers });
      } else {
        // Handle request
        const response = await this.handleRequestMessage(mcpMessage as MCPRequest);
        return new Response(JSON.stringify(response), { status: 200, headers });
      }
    } catch (error) {
      this.logger.error('Error handling HTTP request', error);

      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : String(error),
          },
        }),
        { status: 500, headers },
      );
    }
  }

  private handleCORS(request: Request): Response {
    const headers = this.getCORSHeaders();
    
    // Handle preflight request
    const requestMethod = request.headers.get('access-control-request-method');
    const requestHeaders = request.headers.get('access-control-request-headers');

    if (requestMethod) {
      headers.set('access-control-allow-methods', 'POST, OPTIONS');
    }
    
    if (requestHeaders) {
      headers.set('access-control-allow-headers', requestHeaders);
    }

    return new Response('', { status: 204, headers });
  }

  private getCORSHeaders(): Headers {
    const headers = new Headers();
    
    if (this.config?.corsEnabled) {
      const origins = this.config.corsOrigins || ['*'];
      headers.set('access-control-allow-origin', origins.join(', '));
      headers.set('access-control-allow-credentials', 'true');
      headers.set('access-control-max-age', '86400'); // 24 hours
    }

    return headers;
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    try {
      // Check authentication for WebSocket connections
      if (this.config?.auth?.enabled) {
        const authResult = await this.validateAuth(request);
        if (!authResult.valid) {
          return this.createErrorResponse(401, authResult.error || 'Unauthorized');
        }
      }

      const { socket, response } = Deno.upgradeWebSocket(request);
      
      socket.onopen = () => {
        this.activeWebSockets.add(socket);
        this.logger.info('WebSocket client connected', {
          totalClients: this.activeWebSockets.size,
        });
      };

      socket.onclose = () => {
        this.activeWebSockets.delete(socket);
        this.logger.info('WebSocket client disconnected', {
          totalClients: this.activeWebSockets.size,
        });
      };

      socket.onerror = (error) => {
        this.logger.error('WebSocket error', error);
        this.activeWebSockets.delete(socket);
      };

      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.id === undefined) {
            // Notification from client
            await this.handleNotificationMessage(message as MCPNotification);
          } else {
            // Request from client
            const response = await this.handleRequestMessage(message as MCPRequest);
            socket.send(JSON.stringify(response));
          }
        } catch (error) {
          this.logger.error('Error processing WebSocket message', error);
          
          // Send error response if it was a request
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.id !== undefined) {
              socket.send(JSON.stringify({
                jsonrpc: '2.0',
                id: parsed.id,
                error: {
                  code: -32603,
                  message: 'Internal error',
                },
              }));
            }
          } catch {
            // Ignore parse errors for error responses
          }
        }
      };

      return response;
    } catch (error) {
      this.logger.error('Error upgrading WebSocket connection', error);
      return this.createErrorResponse(500, 'Failed to upgrade WebSocket connection');
    }
  }

  private async handleRequestMessage(request: MCPRequest): Promise<MCPResponse> {
    if (!this.requestHandler) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'No request handler registered',
        },
      };
    }

    try {
      return await this.requestHandler(request);
    } catch (error) {
      this.logger.error('Request handler error', { request, error });
      
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleNotificationMessage(notification: MCPNotification): Promise<void> {
    if (!this.notificationHandler) {
      this.logger.warn('Received notification but no handler registered', {
        method: notification.method,
      });
      return;
    }

    try {
      await this.notificationHandler(notification);
    } catch (error) {
      this.logger.error('Notification handler error', { notification, error });
      // Notifications don't send error responses
    }
  }

  private async validateAuth(request: Request): Promise<{ valid: boolean; error?: string }> {
    const auth = request.headers.get('authorization');
    
    if (!auth) {
      return { valid: false, error: 'Authorization header required' };
    }

    // Extract token from Authorization header
    const tokenMatch = auth.match(/^Bearer\s+(.+)$/i);
    if (!tokenMatch) {
      return { valid: false, error: 'Invalid authorization format - use Bearer token' };
    }

    const token = tokenMatch[1];

    // Validate against configured tokens
    if (this.config?.auth?.tokens && this.config.auth.tokens.length > 0) {
      const isValid = this.config.auth.tokens.includes(token);
      if (!isValid) {
        return { valid: false, error: 'Invalid token' };
      }
    }

    return { valid: true };
  }

  private createErrorResponse(status: number, message: string, headers?: Headers): Response {
    const responseHeaders = headers || this.getCORSHeaders();
    responseHeaders.set('content-type', 'application/json');

    return new Response(
      JSON.stringify({
        error: {
          code: status,
          message,
        },
      }),
      { status, headers: responseHeaders },
    );
  }
}