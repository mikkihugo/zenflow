/**
 * Simplified WebSocket-First API Client
 * Replaces the complex REST API with a single WebSocket connection
 */
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('websocket-api');

interface WebSocketMessage {
  id: string;
  type: 'request' | 'response' | 'event';
  action: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

type EventHandler = (data: Record<string, unknown>) => void;
type ConnectionHandler = (connected: boolean) => void;

export class WebSocketAPIClient {
  private ws: WebSocket | null = null;
  private requestMap = new Map<
    string,
    {
      resolve: (value: Record<string, unknown>) => void;
      reject: (error: Error) => void;
      timeout: number;
    }
  >();
  private eventHandlers = new Map<string, EventHandler[]>();
  private connectionHandlers: ConnectionHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;

  constructor(private url: string = 'ws://localhost:3000/ws') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          logger.info('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            logger.error('Failed to parse WebSocket message', { error });
          }
        };

        this.ws.onclose = () => {
          logger.warn('WebSocket disconnected');
          this.isConnected = false;
          this.notifyConnectionHandlers(false);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          logger.error('WebSocket error', { error });
          this.isConnected = false;
          this.notifyConnectionHandlers(false);
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    if (message.type === 'response') {
      const request = this.requestMap.get(message.id);
      if (request) {
        clearTimeout(request.timeout);
        this.requestMap.delete(message.id);
        request.resolve(message.data);
      }
    } else if (message.type === 'event') {
      const handlers = this.eventHandlers.get(message.action) || [];
      for (const handler of handlers) handler(message.data);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1);

      logger.info('Attempting to reconnect', {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        delay,
      });

      setTimeout(() => {
        this.connect().catch(() => {
          // Will try again if this fails
        });
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached');
    }
  }

  private notifyConnectionHandlers(connected: boolean): void {
    for (const handler of this.connectionHandlers) handler(connected);
  }

  private generateId(): string {
    return 'req_' + (Date.now()) + '_' + Math.random().toString(36).substr(2, 9);
  }

  request(
    action: string,
    data?: Record<string, unknown>,
    timeout: number = 10000
  ): Promise<Record<string, unknown>> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const id = this.generateId();
    const message: WebSocketMessage = {
      id,
      type: 'request',
      action,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.requestMap.delete(id);
        reject(new Error('Request timeout:' + action));
      }, timeout);

      this.requestMap.set(id, { resolve, reject, timeout: timeoutId });
      this.ws?.send(JSON.stringify(message));
    });
  }

  onEvent(action: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(action)) {
      this.eventHandlers.set(action, []);
    }
    this.eventHandlers.get(action)?.push(handler);
  }

  offEvent(action: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(action);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  get connected(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

// Simplified API methods using WebSocket
export class SimplifiedAPIClient {
  constructor(private ws: WebSocketAPIClient) {}

  // System operations
  getHealth(): Promise<{ status: string; timestamp: number }> {
    return this.ws.request('system.health') as Promise<{
      status: string;
      timestamp: number;
    }>;
  }

  async getSystemCapabilityDetailed(): Promise<{
    success: boolean;
    data: Record<string, unknown>;
    error?: string;
  }> {
    try {
      const data = await this.ws.request('system.capabilities');
      return { success: true, data };
    } catch (error) {
      return { success: false, data: {}, error: (error as Error).message };
    }
  }

  // Agent operations
  getAgentStatus(): Promise<Record<string, unknown>> {
    return this.ws.request('agents.status');
  }

  createSwarm(
    type: string,
    config: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this.ws.request('swarm.create', { type, config });
  }

  // Connection monitoring
  onConnectionChange(handler: (connected: boolean) => void): void {
    this.ws.onConnectionChange(handler);
  }

  get connected(): boolean {
    return this.ws.connected;
  }
}

// Global instance - replaces the complex REST API
const wsClient = new WebSocketAPIClient();
export const apiClient = new SimplifiedAPIClient(wsClient);

// Auto-connect
wsClient.connect().catch((error) => {
  logger.error('Failed to connect WebSocket client', { error });
});
