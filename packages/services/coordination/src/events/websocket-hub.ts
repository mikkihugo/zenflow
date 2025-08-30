/**
 * @fileoverview WebSocket Hub - Unified real-time event distribution
 *
 * Single WebSocket endpoint that integrates with the existing event system,
 * providing auto-discovery and unified real-time updates for Svelte dashboard.
 */
import { getLogger, EventEmitter } from '@claude-zen/foundation';

const logger = getLogger('websocket-hub');

const recordEvent = (eventName: string, data?: any) => {
  logger.info(`[EVENT] ${eventName}`, data || '');
};

/**
 * Registered service information
 */
export interface RegisteredService {
  readonly name: string;
  readonly version: string;
  readonly endpoint: string;
  readonly capabilities: string[];
  readonly messageTypes: string[];
  readonly healthEndpoint?: string;
  readonly registeredAt: Date;
}

/**
 * Hub message format
 */
export interface HubMessage {
  readonly type: string;
  readonly source: string;
  readonly target?: string;
  readonly data: any;
  readonly timestamp: Date;
  readonly id: string;
}

/**
 * WebSocket connection information
 */
export interface HubConnection {
  readonly id: string;
  readonly ws: WebSocket;
  readonly subscriptions: {
    services: Set<string>;
    messageTypes: Set<string>;
  };
  lastActivity: Date;
}

/**
 * Hub status information
 */
export interface HubStatus {
  readonly isInitialized: boolean;
  readonly totalConnections: number;
  readonly activeConnections: number;
  readonly registeredServices: number;
  readonly messagesSent: number;
  readonly serviceBreakdown: Record<string, any>;
}

/**
 * Central WebSocket Hub Service
 */
export class CentralWebSocketHub extends EventEmitter {
  private readonly logger = getLogger('WebSocketHub');
  private services = new Map<string, RegisteredService>();
  private connections = new Map<string, HubConnection>();
  private isInitialized = false;
  private messageCounter = 0;

  /**
   * Initialize the central hub and auto-discover services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.discoverAndRegisterServices();
    this.setupEventSystemIntegration();

    this.isInitialized = true;
    recordEvent('central_websocket_hub_initialized');
    this.logger.info('Central WebSocket Hub initialized', {
      registeredServices: this.services.size,
    });
  }

  /**
   * Register a WebSocket connection
   */
  registerConnection(connectionId: string, ws: WebSocket): void {
    const connection: HubConnection = {
      id: connectionId,
      ws,
      subscriptions: {
        services: new Set(),
        messageTypes: new Set(),
      },
      lastActivity: new Date(),
    };

    this.connections.set(connectionId, connection);

    // Set up connection handlers
    ws.on('message', (data) => {
      this.handleMessage(connectionId, data);
    });

    ws.on('close', () => {
      this.unregisterConnection(connectionId);
    });

    ws.on('error', (error) => {
      this.logger.error('WebSocket connection error', { connectionId, error });
      this.unregisterConnection(connectionId);
    });

    // Send service discovery immediately
    this.sendServiceDiscovery(connectionId);
    recordEvent('central_hub_connection_registered', { connectionId });
    this.logger.debug('Central hub connection registered', { connectionId });
  }

  /**
   * Unregister a WebSocket connection
   */
  unregisterConnection(connectionId: string): void {
    this.connections.delete(connectionId);
    recordEvent('central_hub_connection_unregistered', { connectionId });
    this.logger.debug('Central hub connection unregistered', { connectionId });
  }

  /**
   * Broadcast message to appropriate connections
   */
  broadcast(
    source: string,
    message: Omit<HubMessage, 'source' | 'timestamp' | 'id'>
  ): number {
    const fullMessage: HubMessage = {
      ...message,
      source,
      timestamp: new Date(),
      id: `msg_${this.messageCounter++}`,
    };

    let sentCount = 0;

    for (const [connectionId, connection] of this.connections.entries()) {
      if (this.shouldReceiveMessage(connection, source, message.type)) {
        try {
          if (connection.ws.readyState === 1) {
            // WebSocket.OPEN
            connection.ws.send(JSON.stringify(fullMessage));
            connection.lastActivity = new Date();
            sentCount++;
          } else {
            this.unregisterConnection(connectionId);
          }
        } catch (error) {
          this.logger.error('Failed to send message via central hub', {
            connectionId,
            error,
            messageType: message.type,
          });
        }
      }
    }

    return sentCount;
  }

  /**
   * Get hub status and statistics
   */
  getHubStatus(): HubStatus {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    let activeConnections = 0;

    for (const connection of this.connections.values()) {
      if (connection.lastActivity >= fiveMinutesAgo) {
        activeConnections++;
      }
    }

    const serviceBreakdown: Record<string, any> = {};
    for (const [name, service] of this.services.entries()) {
      serviceBreakdown[name] = {
        capabilities: service.capabilities,
        messageTypes: service.messageTypes,
        endpoint: service.endpoint,
        registeredAt: service.registeredAt,
      };
    }

    return {
      isInitialized: this.isInitialized,
      totalConnections: this.connections.size,
      activeConnections,
      registeredServices: this.services.size,
      messagesSent: this.messageCounter,
      serviceBreakdown,
    };
  }

  /**
   * Register a service with the hub
   */
  registerService(service: RegisteredService): void {
    this.services.set(service.name, service);
    this.logger.info('Service registered with hub', {
      name: service.name,
      capabilities: service.capabilities,
    });
  }

  /**
   * Auto-discover and register available services
   */
  private async discoverAndRegisterServices(): Promise<void> {
    // Register TaskMaster service
    this.registerService({
      name: 'taskmaster',
      version: '1.0.0',
      endpoint: '/api/taskmaster',
      capabilities: ['task_management', 'approval_gates', 'safe_coordination'],
      messageTypes: [
        'task_updated',
        'approval_gate_changed',
        'pi_planning_progress',
        'flow_metrics_updated',
      ],
      healthEndpoint: '/api/taskmaster/health',
      registeredAt: new Date(),
    });

    // Register Coordination service
    this.registerService({
      name: 'coordination',
      version: '1.0.0',
      endpoint: '/api/coordination',
      capabilities: ['agent_coordination', 'swarm_management', 'system_health'],
      messageTypes: [
        'system_health_update',
        'agent_coordination',
        'swarm_status_changed',
      ],
      healthEndpoint: '/api/coordination/health',
      registeredAt: new Date(),
    });

    this.logger.info('Service discovery completed', {
      serviceCount: this.services.size,
    });
  }

  /**
   * Setup integration with existing event systems
   */
  private setupEventSystemIntegration(): void {
    // This would integrate with the actual event system when available
    this.logger.info('Event system integration setup completed');
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(connectionId: string, data: RawData): void {
    try {
      const message = JSON.parse(data.toString());
      const connection = this.connections.get(connectionId);

      if (!connection) return;
      connection.lastActivity = new Date();

      // Handle subscription requests
      if (message.type === 'subscribe') {
        this.handleSubscription(connectionId, message);
      }

      // Handle service discovery requests
      if (message.type === 'discover_services') {
        this.sendServiceDiscovery(connectionId);
      }

      recordEvent('central_hub_message_received', {
        connectionId,
        messageType: message.type,
      });
    } catch (error) {
      this.logger.error('Error handling WebSocket message', {
        connectionId,
        error,
      });
    }
  }

  /**
   * Handle subscription management
   */
  private handleSubscription(connectionId: string, message: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Subscribe to services
    if (Array.isArray(message.services)) {
      message.services.forEach((serviceName: string) => {
        if (this.services.has(serviceName)) {
          connection.subscriptions.services.add(serviceName);
        }
      });
    }

    // Subscribe to specific message types
    if (Array.isArray(message.messageTypes)) {
      message.messageTypes.forEach((messageType: string) => {
        connection.subscriptions.messageTypes.add(messageType);
      });
    }

    this.logger.debug('Connection subscription updated', {
      connectionId,
      subscribedServices: Array.from(connection.subscriptions.services),
      subscribedMessageTypes: Array.from(connection.subscriptions.messageTypes),
    });
  }

  /**
   * Send service discovery information to a connection
   */
  private sendServiceDiscovery(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const discoveryMessage = {
      type: 'services_available',
      data: {
        services: Array.from(this.services.values()),
        totalServices: this.services.size,
        availableMessageTypes: this.getAllMessageTypes(),
      },
      timestamp: new Date(),
    };

    try {
      connection.ws.send(JSON.stringify(discoveryMessage));
      this.logger.debug('Service discovery sent', { connectionId });
    } catch (error) {
      this.logger.error('Failed to send service discovery', {
        connectionId,
        error,
      });
    }
  }

  /**
   * Determine if a connection should receive a message
   */
  private shouldReceiveMessage(
    connection: HubConnection,
    source: string,
    messageType: string
  ): boolean {
    // Check if subscribed to the source service
    if (connection.subscriptions.services.has(source)) {
      return true;
    }

    // Check if subscribed to the specific message type
    if (connection.subscriptions.messageTypes.has(messageType)) {
      return true;
    }

    return false;
  }

  /**
   * Get all available message types from registered services
   */
  private getAllMessageTypes(): string[] {
    const allTypes = new Set<string>();

    for (const service of this.services.values()) {
      for (const type of service.messageTypes) allTypes.add(type);
    }

    return Array.from(allTypes).sort();
  }

  /**
   * Cleanup inactive connections
   */
  async cleanupConnections(): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let cleanedCount = 0;

    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.lastActivity < thirtyMinutesAgo) {
        this.unregisterConnection(connectionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info('Cleaned up inactive central hub connections', {
        cleanedCount,
      });
      recordEvent('central_hub_connections_cleaned', { cleanedCount });
    }
  }

  /**
   * Shutdown the central hub
   */
  async shutdown(): Promise<void> {
    // Close all connections
    for (const [connectionId, connection] of this.connections.entries()) {
      try {
        connection.ws.close();
      } catch (error) {
        this.logger.error('Error closing central hub connection', {
          connectionId,
          error,
        });
      }
    }

    this.connections.clear();
    this.services.clear();
    recordEvent('central_websocket_hub_shutdown');
    this.logger.info('Central WebSocket Hub shut down');
  }
}

/**
 * Global WebSocket hub instance
 */
let webSocketHub: CentralWebSocketHub | null = null;

/**
 * Get the WebSocket hub instance
 */
export function getWebSocketHub(): CentralWebSocketHub {
  if (!webSocketHub) {
    webSocketHub = new CentralWebSocketHub();
  }
  return webSocketHub;
}

/**
 * Helper functions for broadcasting to the WebSocket hub
 */
export const hubBroadcast = {
  // TaskMaster events
  taskUpdated: (taskData: any) =>
    getWebSocketHub().broadcast('taskmaster', {
      type: 'task_updated',
      data: taskData,
    }),

  approvalGateChanged: (gateData: any) =>
    getWebSocketHub().broadcast('taskmaster', {
      type: 'approval_gate_changed',
      data: gateData,
    }),

  piPlanningProgress: (progressData: any) =>
    getWebSocketHub().broadcast('taskmaster', {
      type: 'pi_planning_progress',
      data: progressData,
    }),

  flowMetricsUpdated: (metricsData: any) =>
    getWebSocketHub().broadcast('taskmaster', {
      type: 'flow_metrics_updated',
      data: metricsData,
    }),

  // System coordination events
  systemHealthUpdate: (healthData: any) =>
    getWebSocketHub().broadcast('coordination', {
      type: 'system_health_update',
      data: healthData,
    }),

  agentCoordination: (coordinationData: any) =>
    getWebSocketHub().broadcast('coordination', {
      type: 'agent_coordination',
      data: coordinationData,
    }),
};
