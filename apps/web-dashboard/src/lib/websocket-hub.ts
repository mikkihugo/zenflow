/* eslint-env browser */
/**
 * @fileoverview WebSocket Hub Client for Svelte Dashboard
 *
 * Connects to the unified WebSocket Hub for real-time coordination updates.
 * Replaces the old Socket.IO implementation with native WebSocket connection.
 */

import { getLogger } from '@claude-zen/foundation';
import { toast } from '@zerodevx/svelte-toast';
import { type Writable, writable } from 'svelte/store';

const logger = getLogger('websocket-hub');

// Uses global MessageEvent type from eslint globals

interface HubMessage {
  type: string;
  source: string;
  data: Record<string, unknown>;
  timestamp: Date;
  messageId?: string;
}

interface ServiceInfo {
  name: string;
  messageTypes: string[];
  description: string;
}

interface ServiceDiscoveryResponse {
  type: 'services_available';
  data: {
    services: ServiceInfo[];
    totalMessageTypes: string[];
    hubVersion: string;
  };
  timestamp: Date;
}

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  error: string | null;
  availableServices: string[];
  subscriptions: string[];
}

export class WebSocketHubManager {
  private ws: WebSocket | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private reconnectDelay = 1000;
  private connectionId: string;

  // Reactive stores for component binding
  public connectionState: Writable<ConnectionState> = writable({
    connected: false,
    connecting: false,
    reconnecting: false,
    error: null,
    availableServices: [],
    subscriptions: [],
  });

  // Unified data stores for all coordination events
  public taskmaster = writable({
    tasks: [],
    approvalGates: [],
    piProgress: null,
    flowMetrics: null,
  });

  public coordination = writable({
    systemHealth: null,
    agentCoordination: null,
    events: [],
  });

  public safe = writable({
    stories: [],
    epics: [],
    features: [],
    teams: [],
    metrics: null,
  });

  // Legacy stores for backward compatibility
  public systemStatus = writable<Record<string, unknown> | null>(null);
  public agents = writable<Array<Record<string, unknown>>>([]);
  public tasks = writable<Array<Record<string, unknown>>>([]);
  public performance = writable<Record<string, unknown> | null>(null);
  public logs = writable<Array<Record<string, unknown>>>([]);

  constructor(private hubEndpoint: string = 'ws://localhost:3000/ws/hub') {
    this.connectionId = 'svelte_' + (Date.now()) + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Connect to the WebSocket Hub
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.connectionState.update((state) => ({
      ...state,
      connecting: true,
      error: null,
    }));

    try {
      this.ws = new WebSocket(this.hubEndpoint);
      this.setupEventHandlers();
    } catch (error) {
      logger.error('Failed to connect to WebSocket Hub', { error });
      this.connectionState.update((state) => ({
        ...state,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => this.handleConnect();
    this.ws.onclose = () => this.handleDisconnect();
    this.ws.onerror = (error) => this.handleError(error);
    this.ws.onmessage = (event) => this.handleMessage(event);
  }

  private handleConnect(): void {
    logger.info('WebSocket Hub connected');
    this.reconnectAttempts = 0;

    this.connectionState.update((state) => ({
      ...state,
      connected: true,
      connecting: false,
      reconnecting: false,
      error: null,
    }));

    toast.push(' Connected to WebSocket Hub', {
      theme: {
        '--toastBackground': '#48cc6c',
        '--toastColor': 'white',
      },
    });

    // Request service discovery
    this.requestServiceDiscovery();
  }

  private handleDisconnect(): void {
    logger.info('WebSocket Hub disconnected');
    this.connectionState.update((state) => ({
      ...state,
      connected: false,
      connecting: false,
    }));

    toast.push(' WebSocket Hub disconnected', {
      theme: {
        '--toastBackground': '#f56565',
        '--toastColor': 'white',
      },
    });

    this.handleReconnect();
  }

  private handleError(error: Event): void {
    logger.error('WebSocket Hub error', { error });
    this.connectionState.update((state) => ({
      ...state,
      connecting: false,
      error: 'WebSocket connection error',
    }));
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: HubMessage | ServiceDiscoveryResponse = JSON.parse(
        event.data
      );

      switch (message.type) {
        case 'services_available':
          this.handleServiceDiscovery(message as ServiceDiscoveryResponse);
          break;

        case 'task_updated':
          this.handleTaskUpdate(message as HubMessage);
          break;

        case 'approval_gate_changed':
          this.handleApprovalGateUpdate(message as HubMessage);
          break;

        case 'pi_planning_progress':
          this.handlePIPlanningUpdate(message as HubMessage);
          break;

        case 'flow_metrics_updated':
          this.handleFlowMetricsUpdate(message as HubMessage);
          break;

        case 'system_health_update':
          this.handleSystemHealthUpdate(message as HubMessage);
          break;

        case 'agent_coordination':
          this.handleAgentCoordination(message as HubMessage);
          break;

        default:
          this.handleGenericEvent(message as HubMessage);
      }
    } catch (error) {
      logger.error('Failed to parse WebSocket message', {
        error,
        data: event.data,
      });
    }
  }

  private handleServiceDiscovery(message: ServiceDiscoveryResponse): void {
    const serviceNames = message.data.services.map((s) => s.name);

    this.connectionState.update((state) => ({
      ...state,
      availableServices: serviceNames,
    }));

    logger.info('Services discovered', {
      services: serviceNames,
      messageTypes: message.data.totalMessageTypes.length,
      hubVersion: message.data.hubVersion,
    });

    // Auto-subscribe to essential coordination services
    this.subscribe(
      ['taskmaster', 'coordination'],
      [
        'task_updated',
        'approval_gate_changed',
        'pi_planning_progress',
        'flow_metrics_updated',
        'system_health_update',
        'agent_coordination',
      ]
    );
  }

  private handleTaskUpdate(message: HubMessage): void {
    this.taskmaster.update((state) => ({
      ...state,
      tasks: message.data.tasks || state.tasks,
    }));

    // Update legacy store for backward compatibility
    this.tasks.set(message.data.tasks || []);

    logger.debug('Task update received', {
      taskCount: message.data.tasks?.length,
    });
  }

  private handleApprovalGateUpdate(message: HubMessage): void {
    this.taskmaster.update((state) => ({
      ...state,
      approvalGates: message.data.gates || state.approvalGates,
    }));

    logger.debug('Approval gates updated', {
      gateCount: message.data.gates?.length,
    });
  }

  private handlePIPlanningUpdate(message: HubMessage): void {
    this.taskmaster.update((state) => ({
      ...state,
      piProgress: message.data,
    }));

    // Also update SAFe store
    this.safe.update((state) => ({
      ...state,
      metrics: { ...state.metrics, piProgress: message.data },
    }));

    logger.debug('PI Planning progress updated', {
      progress: message.data.percentage,
    });
  }

  private handleFlowMetricsUpdate(message: HubMessage): void {
    this.taskmaster.update((state) => ({
      ...state,
      flowMetrics: message.data,
    }));

    // Update legacy performance store
    this.performance.set(message.data);

    logger.debug('Flow metrics updated', { metrics: message.data });
  }

  private handleSystemHealthUpdate(message: HubMessage): void {
    this.coordination.update((state) => ({
      ...state,
      systemHealth: message.data,
    }));

    // Update legacy system status store
    this.systemStatus.set(message.data);

    logger.debug('System health updated', { health: message.data.status });
  }

  private handleAgentCoordination(message: HubMessage): void {
    this.coordination.update((state) => ({
      ...state,
      agentCoordination: message.data,
    }));

    // Update legacy agents store
    this.agents.set(message.data.agents || []);

    logger.debug('Agent coordination updated', {
      agentCount: message.data.agents?.length,
    });
  }

  private handleGenericEvent(message: HubMessage): void {
    this.coordination.update((state) => ({
      ...state,
      events: [message, ...state.events.slice(0, 99)], // Keep last 100 events
    }));

    logger.debug('Generic event received', {
      type: message.type,
      source: message.source,
    });
  }

  /**
   * Request service discovery from the hub
   */
  private requestServiceDiscovery(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type: 'discover_services',
      })
    );
  }

  /**
   * Subscribe to services and message types
   */
  subscribe(services: string[], messageTypes: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('Cannot subscribe:WebSocket Hub not connected');
      return;
    }

    this.ws.send(
      JSON.stringify({
        type: 'subscribe',
        services,
        messageTypes,
      })
    );

    this.connectionState.update((state) => ({
      ...state,
      subscriptions: Array.from(
        new Set([...state.subscriptions, ...services, ...messageTypes])
      ),
    }));

    logger.info('Subscribed to WebSocket Hub', { services, messageTypes });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      this.connectionState.update((state) => ({
        ...state,
        error: 'Max reconnection attempts reached',
      }));
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * this.reconnectDelay;

    this.connectionState.update((state) => ({
      ...state,
      reconnecting: true,
    }));

    logger.info(
      'Reconnecting in ' + (delay) + 'ms (attempt ' + (this.reconnectAttempts) + '/' + this.maxReconnectAttempts + ')'
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        logger.error('Reconnection failed', { error });
      });
    }, delay);
  }

  /**
   * Disconnect from WebSocket Hub
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionState.update((state) => ({
      ...state,
      connected: false,
      connecting: false,
      reconnecting: false,
      subscriptions: [],
    }));

    logger.info('Disconnected from WebSocket Hub');
  }

  /**
   * Get current connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    connected: boolean;
    availableServices: string[];
    activeSubscriptions: number;
    reconnectAttempts: number;
  } {
    const state = this.connectionState;
    let currentState: ConnectionState;
    state.subscribe((s) => (currentState = s))(); // Get current value

    return {
      connected: this.isConnected(),
      availableServices: currentState!.availableServices,
      activeSubscriptions: currentState!.subscriptions.length,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Send ping for health check
   */
  ping(): void {
    if (!this.isConnected()) return;

    this.ws!.send(
      JSON.stringify({
        type: 'ping',
        timestamp: Date.now(),
      })
    );
  }

  /**
   * Start health check interval
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
export const webSocketHubManager = new WebSocketHubManager();

// Auto-connect on import (browser only)
if (typeof window !== 'undefined') {
  webSocketHubManager.connect();
}
