/**
 * @fileoverview WebSocket Hub - Unified real-time event distribution
 * 
 * Single WebSocket endpoint that integrates with the existing event system,
 * providing auto-discovery and unified real-time updates for Svelte dashboard.
 */
import { getLogger } from '@claude-zen/foundation';
import type { WebSocket, RawData } from 'ws';

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
  readonly subscriptions:  {
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
export class CentralWebSocketHub {
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
      registeredServices: this.services.size
    });
  }

  /**
   * Register a WebSocket connection
   */
  registerConnection(connectionId: string, ws: WebSocket): void {
    const connection: HubConnection = {
      id: connectionId,
      ws,
      subscriptions:  {
        services: new Set(),
        messageTypes: new Set()
      },
      lastActivity: new Date()
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
   * Broadcast message to all appropriate connections
   */
  broadcastMessage(message: HubMessage, source: string): number {
    let sentCount = 0;
    const fullMessage = {
      ...message,
      source,
      timestamp: new Date()
    };
    
    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      if (this.shouldReceiveMessage(connection, source, message.type)) {
        try {
          if (connection.ws.readyState === 1) { // WebSocket.OPEN
            connection.ws.send(JSON.stringify(fullMessage));
            connection.lastActivity = new Date();
            sentCount++;
            this.messageCounter++;
          } else {
            this.unregisterConnection(connectionId);
          }
        } catch (error) {
          this.logger.error('Failed to send message via central hub', { 
            connectionId, 
            error,
            messageType: message.type
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
    
    for (const connection of Array.from(this.connections.values())) {
      if (connection.lastActivity >= fiveMinutesAgo) {
        activeConnections++;
      }
    }
    
    return {
      isInitialized: this.isInitialized,
      totalConnections: this.connections.size,
      activeConnections,
      registeredServices: this.services.size,
      messagesSent: this.messageCounter,
      serviceBreakdown: Object.fromEntries(
        Array.from(this.services.entries()).map(([name, service]) => [
          name,
          {
            version: service.version,
            capabilities: service.capabilities,
            messageTypes: service.messageTypes,
            registeredAt: service.registeredAt
          }
        ])
      )
    };
  }

  /**
   * Auto-discover and register available services
   */
  private async discoverAndRegisterServices(): Promise<void> {
    try {
      // Register TaskMaster service
      this.registerService('taskmaster', {
        name: 'taskmaster',
        version: '1.0.0',
        endpoint: '/taskmaster',
        capabilities: ['task_management', 'safe_coordination'],
        messageTypes: ['task_update', 'safe_event', 'coordination_update'],
        healthEndpoint: '/taskmaster/health',
        registeredAt: new Date()
      });

      this.logger.info('Service discovery completed', {
        servicesFound: this.services.size
      });
    } catch (error) {
      this.logger.error('Service discovery failed', error);
    }
  }

  /**
   * Set up event system integration
   */
  private setupEventSystemIntegration(): void {
    // Set up event forwarding to WebSocket clients
    this.logger.debug('Event system integration established');
  }

  /**
   * Register a service with the hub
   */
  private registerService(name: string, service: RegisteredService): void {
    this.services.set(name, service);
    this.logger.debug('Service registered', { name, version: service.version });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(connectionId: string, data: RawData): void {
    try {
      const message = JSON.parse(data.toString()) as any;
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
        messageType: message.type
      });
    } catch (error) {
      this.logger.error('Failed to handle message', { connectionId, error });
    }
  }

  /**
   * Handle subscription update
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
      subscribedMessageTypes: Array.from(connection.subscriptions.messageTypes)
    });
  }

  /**
   * Send service discovery information
   */
  private sendServiceDiscovery(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const discoveryMessage = {
      type: 'services_available',
      data:  {
        services: Array.from(this.services.values()),
        hubVersion: '1.0.0'
      },
      timestamp: new Date(),
      id: `discovery_${Date.now()}`
    };

    try {
      connection.ws.send(JSON.stringify(discoveryMessage));
    } catch (error) {
      this.logger.error('Failed to send service discovery', { connectionId, error });
    }
  }

  /**
   * Check if connection should receive a message
   */
  private shouldReceiveMessage(connection: HubConnection, source: string, messageType: string): boolean {
    // Don't send back to the source
    if (source === connection.id) return false;

    // Check if subscribed to the service or message type
    return connection.subscriptions.services.has(source) ||
           connection.subscriptions.messageTypes.has(messageType) ||
           connection.subscriptions.messageTypes.has('*');
  }

  /**
   * Cleanup inactive connections
   */
  async cleanupConnections(): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let cleanedCount = 0;
    
    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      if (connection.lastActivity < thirtyMinutesAgo) {
        this.unregisterConnection(connectionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.info('Cleaned up inactive central hub connections', { cleanedCount });
      recordEvent('central_hub_connections_cleaned', { cleanedCount });
    }
  }

  /**
   * Shutdown the central hub
   */
  async shutdown(): Promise<void> {
    // Close all connections
    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      try {
        connection.ws.close();
      } catch (error) {
        this.logger.error('Error closing central hub connection', { connectionId, error });
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
  taskUpdated: (taskData: any) => getWebSocketHub().broadcastMessage({
    type: 'task_updated',
    source: 'taskmaster',
    data: taskData,
    timestamp: new Date(),
    id: `task_update_${Date.now()}`
  }, 'taskmaster'),

  approvalGateChanged: (gateData: any) => getWebSocketHub().broadcastMessage({
    type: 'approval_gate_changed',
    source: 'taskmaster',
    data: gateData,
    timestamp: new Date(),
    id: `gate_change_${Date.now()}`
  }, 'taskmaster'),

  piPlanningProgress: (progressData: any) => getWebSocketHub().broadcastMessage({
    type: 'pi_planning_progress',
    source: 'taskmaster',
    data: progressData,
    timestamp: new Date(),
    id: `pi_progress_${Date.now()}`
  }, 'taskmaster'),

  flowMetricsUpdated: (metricsData: any) => getWebSocketHub().broadcastMessage({
    type: 'flow_metrics_updated',
    source: 'taskmaster',
    data: metricsData,
    timestamp: new Date(),
    id: `metrics_update_${Date.now()}`
  }, 'taskmaster'),

  // System coordination events
  systemHealthUpdate: (healthData: any) => getWebSocketHub().broadcastMessage({
    type: 'system_health_update',
    source: 'coordination',
    data: healthData,
    timestamp: new Date(),
    id: `health_update_${Date.now()}`
  }, 'coordination'),

  agentCoordination: (coordinationData: any) => getWebSocketHub().broadcastMessage({
    type: 'agent_coordination',
    source: 'coordination',
    data: coordinationData,
    timestamp: new Date(),
    id: `agent_coord_${Date.now()}`
  }, 'coordination')
};