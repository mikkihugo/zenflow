/**
 * WebSocket client for real-time dashboard updates
 * Connects to claude-code-zen-server Socket.IO for live data streaming
 */

import { toast } from '@zerodevx/svelte-toast';
import { io, type Socket } from 'socket.io-client';
import { type Writable, writable } from 'svelte/store';

// Simple browser logger
const logger = {
  info: (msg: string, ...args: unknown[]) =>
    console.info('[websocket] ' + msg, ...args),

  warn: (msg: string, ...args: unknown[]) =>
    console.warn('[websocket] ' + msg, ...args),

  error: (msg: string, ...args: unknown[]) =>
    console.error('[websocket] ' + msg, ...args),
};

interface WebSocketData {
  event: string;
  data: unknown;
  timestamp: string;
}

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  error: string | null;
}

export class WebSocketManager {
  private socket: Socket | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions = new Set<string>();

  // Reactive stores for component binding
  public connectionState: Writable<ConnectionState> = writable({
    connected: false,
    connecting: false,
    reconnecting: false,
    error: null,
  });

  // Data stores for different channels
  public systemStatus = writable<Record<string, unknown> | null>(null);
  public agents = writable<Array<Record<string, unknown>>>([]);
  public tasks = writable<Array<Record<string, unknown>>>([]);
  public performance = writable<Record<string, unknown> | null>(null);
  public logs = writable<Array<Record<string, unknown>>>([]);

  // SAFe 6.0 Essential artifact stores
  public stories = writable<Array<Record<string, unknown>>>([]);
  public epics = writable<Array<Record<string, unknown>>>([]);
  public features = writable<Array<Record<string, unknown>>>([]);
  public teams = writable<Array<Record<string, unknown>>>([]);
  public safeMetrics = writable<Record<string, unknown> | null>(null);

  // Additional stores for full dashboard integration
  public facades = writable<Record<string, unknown> | null>(null);
  public swarms = writable<Array<Record<string, unknown>>>([]);
  public swarmStats = writable<Record<string, unknown> | null>(null);
  public memoryStatus = writable<Record<string, unknown> | null>(null);
  public databaseStatus = writable<Record<string, unknown> | null>(null);

  constructor(private serverUrl: string = 'http://localhost:3000') {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) return;

    this.connectionState.update((state) => ({
      ...state,
      connecting: true,
      error: null,
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
      logger.error('Failed to connect to WebSocket', { error });
      this.connectionState.update((state) => ({
        ...state,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => this.handleConnect());
    this.socket.on('disconnect', (reason) => this.handleDisconnect(reason));
    this.socket.on('connect_error', (error) => this.handleConnectError(error));
    this.socket.on('reconnect', () => this.handleReconnect());
    this.socket.on('reconnect_error', () => this.handleReconnectError());
    this.socket.on('reconnect_failed', () => this.handleReconnectFailed());

    // Data events
    this.setupDataEventHandlers();
  }

  private handleConnect(): void {
    logger.info('WebSocket connected');
    this.reconnectAttempts = 0;
    this.connectionState.update((state) => ({
      ...state,
      connected: true,
      connecting: false,
      reconnecting: false,
      error: null,
    }));

    // Resubscribe to channels after reconnection
    for (const channel of this.subscriptions) {
      this.socket?.emit('subscribe', channel);
    }

    toast.push(' Real-time updates connected', {
      theme: {
        '--toastBackground': '#48cc6c',
        '--toastColor': 'white',
      },
    });
  }

  /**
   * Setup data channel event handlers
   */
  private setupDataChannelHandlers(): void {
    if (!this.socket) return;

    // Setup standard data channel handlers using mapping
    this.setupStandardDataHandlers();
    this.setupSafeArtifactHandlers();
    this.setupSpecialLogHandlers();
  }

  private setupStandardDataHandlers(): void {
    const dataChannels = [
      {
        event: 'system:initial',
        store: this.systemStatus,
        icon: '',
        name: 'System initial',
      },
      {
        event: 'system:status',
        store: this.systemStatus,
        icon: '',
        name: 'System status',
      },
      {
        event: 'agents:initial',
        store: this.agents,
        icon: '',
        name: 'Agents initial',
      },
      {
        event: 'agents:update',
        store: this.agents,
        icon: '',
        name: 'Agents',
      },
      {
        event: 'tasks:initial',
        store: this.tasks,
        icon: '',
        name: 'Tasks initial',
      },
      { event: 'tasks:update', store: this.tasks, icon: '', name: 'Tasks' },
      {
        event: 'performance:update',
        store: this.performance,
        icon: '',
        name: 'Performance',
      },
      // New facade events
      {
        event: 'facades:initial',
        store: this.facades,
        icon: '️',
        name: 'Facades initial',
      },
      {
        event: 'facades:status',
        store: this.facades,
        icon: '️',
        name: 'Facades status',
      },
      // New swarm events
      {
        event: 'swarms:initial', 
        store: this.swarms,
        icon: '',
        name: 'Swarms initial',
      },
      {
        event: 'swarms:update',
        store: this.swarms,
        icon: '', 
        name: 'Swarms',
      },
      // New swarm stats events
      {
        event: 'swarm-stats:initial',
        store: this.swarmStats,
        icon: '',
        name: 'Swarm Stats initial',
      },
      {
        event: 'swarm-stats:update',
        store: this.swarmStats,
        icon: '',
        name: 'Swarm Stats',
      },
      // New memory events
      {
        event: 'memory:initial',
        store: this.memoryStatus,
        icon: '',
        name: 'Memory initial',
      },
      {
        event: 'memory:status',
        store: this.memoryStatus,
        icon: '',
        name: 'Memory status',
      },
      // New database events
      {
        event: 'database:initial',
        store: this.databaseStatus,
        icon: '️',
        name: 'Database initial',
      },
      {
        event: 'database:status',
        store: this.databaseStatus,
        icon: '️',
        name: 'Database status',
      },
    ];

    for (const { event, store, name } of dataChannels) {
      this.socket?.on(event, (data: WebSocketData) => {
        logger.debug(name + ' data received', { data: data.data });
        store.set(data.data);
      });
    }
  }

  private setupSafeArtifactHandlers(): void {
    const safeChannels = [
      {
        event: 'stories:initial',
        store: this.stories,
        icon: '',
        name: 'User Stories initial',
        key: 'stories',
      },
      {
        event: 'stories:update',
        store: this.stories,
        icon: '',
        name: 'User Stories',
        key: 'stories',
      },
      {
        event: 'epics:initial',
        store: this.epics,
        icon: '️',
        name: 'Epics initial',
        key: 'epics',
      },
      {
        event: 'epics:update',
        store: this.epics,
        icon: '️',
        name: 'Epics',
        key: 'epics',
      },
      {
        event: 'features:initial',
        store: this.features,
        icon: '',
        name: 'Features initial',
        key: 'features',
      },
      {
        event: 'features:update',
        store: this.features,
        icon: '',
        name: 'Features',
        key: 'features',
      },
      {
        event: 'teams:initial',
        store: this.teams,
        icon: '',
        name: 'Teams initial',
        key: 'teams',
      },
      {
        event: 'teams:update',
        store: this.teams,
        icon: '',
        name: 'Teams',
        key: 'teams',
      },
    ];

    for (const { event, store, name, key } of safeChannels) {
      this.socket?.on(event, (data: WebSocketData) => {
        logger.debug(name + ' data received', { data: data.data });
        store.set(data.data?.[key] || []);
      });
    }
  }

  private setupSpecialLogHandlers(): void {
    this.socket?.on('logs:initial', (data: WebSocketData) => {
      logger.debug('Logs initial data received', { data: data.data });
      this.logs.set(data.data);
    });

    this.socket?.on('logs:bulk', (data: WebSocketData) => {
      logger.debug('Logs bulk update received', { data: data.data });
      this.logs.set(data.data);
    });

    this.socket?.on('logs:new', (data: WebSocketData) => {
      logger.debug('New log entry received', { data: data.data });
      this.logs.update((logs) => [data.data, ...logs.slice(0, 99)]); // Keep last 100
    });

    this.socket.on('safe-metrics:initial', (data: WebSocketData) => {
      logger.debug('SAFe LPM metrics initial data received', {
        data: data.data,
      });
      this.safeMetrics.set(data.data);
    });

    this.socket.on('safe-metrics:update', (data: WebSocketData) => {
      logger.debug('SAFe LPM metrics update received', { data: data.data });
      this.safeMetrics.set(data.data);
    });
  }

  /**
   * Subscribe to a data channel
   */
  subscribe(channel: string): void {
    if (!this.socket) {
      logger.warn('Cannot subscribe:WebSocket not connected');
      return;
    }

    this.subscriptions.add(channel);
    this.socket.emit('subscribe', channel);
    logger.info('Subscribed to channel', { channel });
  }

  /**
   * Unsubscribe from a data channel
   */
  unsubscribe(channel: string): void {
    if (!this.socket) return;

    this.subscriptions.delete(channel);
    this.socket.emit('unsubscribe', channel);
    logger.info('Unsubscribed from channel', { channel });
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
    this.connectionState.update((state) => ({
      ...state,
      connected: false,
      connecting: false,
      reconnecting: false,
    }));
  }

  /**
   * Get current connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Subscribe to multiple channels at once
   */
  subscribeToAll(): void {
    const channels = [
      'system',
      'agents',
      'tasks',
      'performance',
      'logs',
      'stories',
      'epics',
      'features',
      'teams',
      'safe-metrics',
    ];
    for (const channel of channels) this.subscribe(channel);
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

  private handleDisconnect(reason: string): void {
    logger.info('WebSocket disconnected', { reason });
    this.connectionState.update((state) => ({
      ...state,
      connected: false,
      connecting: false,
    }));

    if (reason !== 'io client disconnect') {
      toast.push(' Real-time connection lost', {
        theme: {
          '--toastBackground': '#f56565',
          '--toastColor': 'white',
        },
      });
    }
  }

  private handleConnectError(error: Error): void {
    logger.error('WebSocket connection error', { error });
    this.connectionState.update((state) => ({
      ...state,
      connecting: false,
      error: error.message,
    }));

    toast.push(' Connection error: ' + error.message, {
      theme: {
        '--toastBackground': '#f56565',
        '--toastColor': 'white',
      },
    });
  }

  private handleReconnect(): void {
    logger.info('WebSocket reconnected');
    toast.push(' Real-time connection restored', {
      theme: {
        '--toastBackground': '#48cc6c',
        '--toastColor': 'white',
      },
    });
  }

  private handleReconnectError(): void {
    this.reconnectAttempts++;
  }

  private handleReconnectFailed(): void {
    logger.error('Failed to reconnect to WebSocket');
    this.connectionState.update((state) => ({
      ...state,
      reconnecting: false,
      error: 'Failed to reconnect to server',
    }));

    toast.push(' Failed to reconnect to server', {
      theme: {
        '--toastBackground': '#f56565',
        '--toastColor': 'white',
      },
    });
  }

  private setupDataEventHandlers(): void {
    if (!this.socket) return;

    // Server response events
    this.socket.on('connected', (data) => {
      logger.info('Server connection confirmed', { data });
    });

    this.socket.on('pong', (data) => {
      logger.debug('Pong received', { data });
    });

    // Call the data channel handlers
    this.setupDataChannelHandlers();
  }
}

// Singleton instance for global use
export const webSocketManager = new WebSocketManager();

// Auto-connect on import (can be disabled if needed)
if (typeof window !== 'undefined') {
  webSocketManager.connect();
}
