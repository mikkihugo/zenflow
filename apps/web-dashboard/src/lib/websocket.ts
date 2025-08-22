/**
 * WebSocket client for real-time dashboard updates
 * Connects to claude-code-zen-server Socket.IO for live data streaming
 */

import { io, type Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import { toast } from '@zerodevx/svelte-toast';

interface WebSocketData {
  event: string;
  data: any;
  timestamp: string;
}

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  error: string'' | ''null;
}

export class WebSocketManager {
  private socket: Socket'' | ''null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions = new Set<string>();
  
  // Reactive stores for component binding
  public connectionState: Writable<ConnectionState> = writable({
    connected: false,
    connecting: false,
    reconnecting: false,
    error: null
  });
  
  // Data stores for different channels
  public systemStatus = writable<any>(null);
  public agents = writable<any[]>([]);
  public tasks = writable<any[]>([]);
  public performance = writable<any>(null);
  public logs = writable<any[]>([]);
  
  constructor(private serverUrl: string ='http://localhost:3000') {}

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) return;

    this.connectionState.update(state => ({ 
      ...state, 
      connecting: true, 
      error: null 
    }));

    try {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventHandlers();
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.connectionState.update(state => ({
        ...state,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectionState.update(state => ({
        ...state,
        connected: true,
        connecting: false,
        reconnecting: false,
        error: null
      }));
      
      // Resubscribe to channels after reconnection
      this.subscriptions.forEach(channel => {
        this.socket?.emit('subscribe', channel);
      });

      toast.push('📡 Real-time updates connected', {
        theme: {
          '--toastBackground': '#48cc6c',
          '--toastColor': 'white',
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.connectionState.update(state => ({
        ...state,
        connected: false,
        connecting: false
      }));

      if (reason !== 'io client disconnect') {
        toast.push('📡 Real-time connection lost', {
          theme: {
            '--toastBackground': '#f56565',
            '--toastColor': 'white',
          }
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.connectionState.update(state => ({
        ...state,
        connecting: false,
        error: error.message
      }));
      
      toast.push(`📡 Connection error: ${error.message}`, {
        theme: {
          '--toastBackground': '#f56565',
          '--toastColor': 'white',
        }
      });
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔌 Reconnection attempt ${attempt}`);
      this.connectionState.update(state => ({
        ...state,
        reconnecting: true,
        connecting: false
      }));
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`🔌 Reconnected after ${attempt} attempts`);
      toast.push('📡 Real-time connection restored', {
        theme: {
          '--toastBackground': '#48cc6c',
          '--toastColor': 'white',
        }
      });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 Failed to reconnect');
      this.connectionState.update(state => ({
        ...state,
        reconnecting: false,
        error: 'Failed to reconnect to server'
      }));
      
      toast.push('📡 Failed to reconnect to server', {
        theme: {
          '--toastBackground': '#f56565',
          '--toastColor': 'white',
        }
      });
    });

    // Server response events
    this.socket.on('connected', (data) => {
      console.log('🎯 Server connection confirmed:', data);
    });

    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });

    // Data channel events
    this.setupDataChannelHandlers();
  }

  /**
   * Setup data channel event handlers
   */
  private setupDataChannelHandlers(): void {
    if (!this.socket) return;

    // System status updates
    this.socket.on('system:initial', (data: WebSocketData) => {
      console.log('📊 System initial data:', data.data);
      this.systemStatus.set(data.data);
    });

    this.socket.on('system:status', (data: WebSocketData) => {
      console.log('📊 System status update:', data.data);
      this.systemStatus.set(data.data);
    });

    // Agent updates
    this.socket.on('agents:initial', (data: WebSocketData) => {
      console.log('🤖 Agents initial data:', data.data);
      this.agents.set(data.data);
    });

    this.socket.on('agents:update', (data: WebSocketData) => {
      console.log('🤖 Agents update:', data.data);
      this.agents.set(data.data);
    });

    // Task updates
    this.socket.on('tasks:initial', (data: WebSocketData) => {
      console.log('✅ Tasks initial data:', data.data);
      this.tasks.set(data.data);
    });

    this.socket.on('tasks:update', (data: WebSocketData) => {
      console.log('✅ Tasks update:', data.data);
      this.tasks.set(data.data);
    });

    // Performance metrics
    this.socket.on('performance:update', (data: WebSocketData) => {
      console.log('📈 Performance update:', data.data);
      this.performance.set(data.data);
    });

    // Log updates  
    this.socket.on('logs:initial', (data: WebSocketData) => {
      console.log('📋 Logs initial data:', data.data);
      this.logs.set(data.data);
    });

    this.socket.on('logs:bulk', (data: WebSocketData) => {
      console.log('📋 Logs bulk update:', data.data);
      this.logs.set(data.data);
    });

    this.socket.on('logs:new', (data: WebSocketData) => {
      console.log('📋 New log entry:', data.data);
      this.logs.update(logs => [data.data, ...logs.slice(0, 99)]); // Keep last 100
    });
  }

  /**
   * Subscribe to a data channel
   */
  subscribe(channel: string): void {
    if (!this.socket) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    this.subscriptions.add(channel);
    this.socket.emit('subscribe', channel);
    console.log(`📡 Subscribed to channel: ${channel}`);
  }

  /**
   * Unsubscribe from a data channel
   */
  unsubscribe(channel: string): void {
    if (!this.socket) return;

    this.subscriptions.delete(channel);
    this.socket.emit('unsubscribe', channel);
    console.log(`📡 Unsubscribed from channel: ${channel}`);
  }

  /**
   * Send ping to server for connection health check
   */
  ping(): void {
    if (!this.socket?.connected) return;
    this.socket.emit('ping');
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.subscriptions.clear();
    this.connectionState.update(state => ({
      ...state,
      connected: false,
      connecting: false,
      reconnecting: false
    }));
  }

  /**
   * Get current connection status
   */
  isConnected(): boolean {
    return this.socket?.connected'' | '''' | ''false;
  }

  /**
   * Subscribe to multiple channels at once
   */
  subscribeToAll(): void {
    const channels = ['system', 'agents', 'tasks', 'performance', 'logs'];
    channels.forEach(channel => this.subscribe(channel));
  }

  /**
   * Setup connection health monitoring
   */
  startHealthCheck(interval = 30000): NodeJS.Timeout {
    return setInterval(() => {
      if (this.isConnected()) {
        this.ping();
      }
    }, interval);
  }
}

// Singleton instance for global use
export const webSocketManager = new WebSocketManager();

// Auto-connect on import (can be disabled if needed)
if (typeof window !== 'undefined') {
  webSocketManager.connect();
}