/**
 * Socket.IO WebSocket API Client (Uses Existing Backend)
 *
 * The backend already has Socket.IO WebSocket support - this client uses it
 * instead of polling REST endpoints every 10-30 seconds.
 */
import { io, type Socket } from 'socket.io-client';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('socket-api');

type EventHandler = (data: unknown) => void;
type ConnectionHandler = (connected: boolean) => void;

export class SocketIOAPIClient {
  private socket: Socket | null = null;
  private connectionHandlers: ConnectionHandler[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string = 'http://localhost:3000') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        this.socket.on('connect', () => {
          logger.info('Socket.IO connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          logger.warn('Socket.IO disconnected', { reason });
          this.isConnected = false;
          this.notifyConnectionHandlers(false);
        });

        this.socket.on('connect_error', (error) => {
          logger.error('Socket.IO connection error', { error });
          this.isConnected = false;
          this.notifyConnectionHandlers(false);
          reject(new Error('Socket.IO connection failed'));
        });

        // Handle server acknowledgment
        this.socket.on('connected', (data) => {
          logger.info('Socket.IO session established', { data });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean): void {
    for (const handler of this.connectionHandlers) handler(connected);
  }

  // Subscribe to real-time data channels (uses existing backend channels)
  subscribeToChannel(channel: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe', channel);
      logger.info('Subscribed to channel', { channel });
    }
  }

  unsubscribeFromChannel(channel: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe', channel);
      logger.info('Unsubscribed from channel', { channel });
    }
  }

  // Listen to real-time events (existing backend events)
  on(event: string, handler: EventHandler): void {
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: string, handler: EventHandler): void {
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  // Connection monitoring
  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Simple health check equivalent
  getHealth(): Promise<{ status: string; timestamp: number }> {
    if (!this.connected) {
      throw new Error('Socket.IO not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Health check timeout'));
      }, 5000);

      // Use ping/pong for health check
      this.socket!.emit('ping');
      this.socket!.once('pong', () => {
        clearTimeout(timeout);
        resolve({
          status: 'ok',
          timestamp: Date.now(),
        });
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

// Simplified API client using Socket.IO (matches existing backend)
export class SocketAPIClient {
  constructor(private socketClient: SocketIOAPIClient) {}

  // Use existing backend Socket.IO channels
  async initialize(): Promise<void> {
    await this.socketClient.connect();

    // Subscribe to existing backend channels
    this.socketClient.subscribeToChannel('system'); // System status
    this.socketClient.subscribeToChannel('tasks'); // Task updates
    this.socketClient.subscribeToChannel('logs'); // Real-time logs
  }

  // Health check using Socket.IO ping/pong
  getHealth(): Promise<{ status: string; timestamp: number }> {
    return this.socketClient.getHealth();
  }

  // System capabilities using existing Socket.IO events
  getSystemCapabilityDetailed(): Promise<{
    success: boolean;
    data: Record<string, unknown>;
    error?: string;
  }> {
    return new Promise((resolve) => {
      if (!this.socketClient.connected) {
        resolve({ success: false, data: {}, error: 'Socket not connected' });
        return;
      }

      // Listen for system initial data (existing backend event)
      this.socketClient.on('system:initial', (response) => {
        resolve({ success: true, data: response.data });
      });

      // Request system data (existing backend supports this)
      this.socketClient.socket?.emit('subscribe', 'system');
    });
  }

  // Real-time event subscriptions (use existing backend events)
  onSystemUpdate(handler: (data: Record<string, unknown>) => void): void {
    this.socketClient.on('system:status', handler);
  }

  onTaskUpdate(handler: (data: Record<string, unknown>) => void): void {
    this.socketClient.on('tasks:update', handler);
  }

  onPerformanceUpdate(handler: (data: Record<string, unknown>) => void): void {
    this.socketClient.on('performance:update', handler);
  }

  // Connection monitoring
  onConnectionChange(handler: (connected: boolean) => void): void {
    this.socketClient.onConnectionChange(handler);
  }

  get connected(): boolean {
    return this.socketClient.connected;
  }
}

// Global instance using existing backend Socket.IO
const socketClient = new SocketIOAPIClient();
export const apiClient = new SocketAPIClient(socketClient);

// Auto-initialize
apiClient.initialize().catch((error) => {
  logger.error('Failed to initialize Socket API client', { error });
});
