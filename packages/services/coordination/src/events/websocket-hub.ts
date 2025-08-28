/**
 * @fileoverview WebSocket Hub - Unified real-time event distribution
 * 
 * Single WebSocket endpoint that integrates with the existing event system,
 * providing auto-discovery and unified real-time updates for Svelte dashboard.
 */

import { EventEmitter } from 'events';
import type { WebSocket, RawData } from 'ws';
// Temporary logger and recordEvent implementations until foundation is available
const getLogger = (name: string) => ({
  info: (msg: string, data?: any) => console.log(`[${name}] ${msg}`, data||''),
  debug: (msg: string, data?: any) => console.log(`[${name}] ${msg}`, data||''),
  error: (msg: string, data?: any) => console.error(`[${name}] ${msg}`, data||''),
  warn: (msg: string, data?: any) => console.warn(`[${name}] ${msg}`, data||'')
});

const recordEvent = (eventName: string, data?: any) => {
  console.log(`[EVENT] ${eventName}`, data||''');
};

/**
 * Registered service information
 */
export interface RegisteredService {
  name: string;
  messageTypes: string[];
  description: string;
  source?: any; // Reference to the actual service
}

/**
 * Hub connection with subscription management
 */
export interface HubConnection {
  id: string;
  ws: WebSocket;
  subscriptions: {
    services: Set<string>;
    messageTypes: Set<string>;
  };
  lastActivity: Date;
  metadata?: any;
}

/**
 * Central WebSocket message structure
 */
export interface HubMessage {
  type: string;
  source: string; // Which service sent this
  data: any;
  timestamp: Date;
  messageId?: string;
}

/**
 * Service discovery response
 */
export interface ServiceDiscoveryResponse {
  type: 'services_available';
  data: {
    services: RegisteredService[];
    totalMessageTypes: string[];
    hubVersion: string;
  };
  timestamp: Date;
}

/**
 * WebSocket Hub - Single point for all real-time communication
 * 
 * Integrates with existing coordination event system to provide unified
 * real-time updates to Svelte dashboard through single WebSocket connection.
 */
export class WebSocketHub extends EventEmitter {
  private readonly logger = getLogger('WebSocketHub'');
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
    recordEvent('central_websocket_hub_initialized'');
    this.logger.info('Central WebSocket Hub initialized,{
      registeredServices: Array.from(this.services.keys()),
      totalMessageTypes: this.getAllMessageTypes().length
    });
  }

  /**
   * Register a service with the central hub
   */
  registerService(name: string, service: RegisteredService): void {
    this.services.set(name, {
      ...service,
      name // Ensure name is consistent
    });

    recordEvent('websocket_service_registered,{ serviceName: name, messageTypes: service.messageTypes }');
    this.logger.info('WebSocket service registered,{ 
      serviceName: name, 
      messageTypes: service.messageTypes 
    });

    // Notify all connected clients about new service
    this.broadcastServiceDiscovery();
  }

  /**
   * Handle new WebSocket connection from Svelte
   */
  handleConnection(ws: WebSocket, connectionId: string): void {
    const connection: HubConnection = {
      id: connectionId,
      ws,
      subscriptions: {
        services: new Set(),
        messageTypes: new Set()
      },
      lastActivity: new Date()
    };

    this.connections.set(connectionId, connection);

    // Set up connection handlers
    ws.on('message,(data) => {
      this.handleMessage(connectionId, data);
    });

    ws.on('close,() => {
      this.unregisterConnection(connectionId);
    });

    ws.on('error,(error) => {
      this.logger.error('WebSocket connection error,{ connectionId, error }');
      this.unregisterConnection(connectionId);
    });

    // Send service discovery immediately
    this.sendServiceDiscovery(connectionId);

    recordEvent('central_hub_connection_registered,{ connectionId }');
    this.logger.debug('Central hub connection registered,{ connectionId }');
  }

  /**
   * Unregister a WebSocket connection
   */
  unregisterConnection(connectionId: string): void {
    this.connections.delete(connectionId);
    recordEvent('central_hub_connection_unregistered,{ connectionId }');
    this.logger.debug('Central hub connection unregistered,{ connectionId }');
  }

  /**
   * Broadcast message from a service to subscribed connections
   */
  broadcast(source: string, message: Omit<HubMessage,'source'|'timestamp'|'messageId'>): void {
    const fullMessage: HubMessage = {
      ...message,
      source,
      timestamp: new Date(),
      messageId: `msg_${++this.messageCounter}_${Date.now()}`
    };

    let sentCount = 0;

    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      if (this.shouldReceiveMessage(connection, source, message.type)) {
        try {
          if (connection.ws.readyState === 1) { // WebSocket.OPEN
            connection.ws.send(JSON.stringify(fullMessage);
            connection.lastActivity = new Date();
            sentCount++;
          } else {
            this.unregisterConnection(connectionId);
          }
        } catch (error) {
          this.logger.error('Failed to send message via central hub,{ 
            connectionId, 
            error,
            messageType: message.type,
            source
          });
          this.unregisterConnection(connectionId);
        }
      }
    }

    recordEvent('central_hub_message_broadcast,{
      source,
      messageType: message.type,
      sentCount,
      totalConnections: this.connections.size
    });

    this.logger.debug('Message broadcast via central hub,{
      source,
      messageType: message.type,
      sentCount,
      totalConnections: this.connections.size
    });
  }

  /**
   * Get hub statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    registeredServices: number;
    totalMessageTypes: number;
    serviceBreakdown: Record<string, { messageTypes: number }>;
  } {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    let activeConnections = 0;

    for (const connection of Array.from(this.connections.values())) {
      if (connection.lastActivity >= fiveMinutesAgo) {
        activeConnections++;
      }
    }

    const serviceBreakdown: Record<string, { messageTypes: number }> = {};
    for (const [name, service] of Array.from(this.services.entries())) {
      serviceBreakdown[name] = {
        messageTypes: service.messageTypes.length
      };
    }

    return {
      totalConnections: this.connections.size,
      activeConnections,
      registeredServices: this.services.size,
      totalMessageTypes: this.getAllMessageTypes().length,
      serviceBreakdown
    };
  }

  /**
   * Auto-discover and register known services
   */
  private async discoverAndRegisterServices(): Promise<void> {
    try {
      // TODO: Register TaskMaster WebSocket service when it's available
      // const { getDashboardWebSocketService } = await import('../taskmaster/infrastructure/websocket/dashboard-websocket'');
      // const taskMasterWS = getDashboardWebSocketService();
      
      this.registerService('taskmaster,{
        name:'taskmaster,
        messageTypes: [
         'task_updated,
         'approval_gate_changed,
         'pi_planning_progress,
         'flow_metrics_updated,
         'safe_dashboard_refresh'
        ],
        description:'Enterprise task management and SAFe coordination,
        source: null // Will be connected when TaskMaster service is available
      });

      // TODO: Auto-discover other services
      // - System monitoring
      // - Development tools  
      // - Agent coordination
      
    } catch (error) {
      this.logger.error('Error during service discovery,error');
    }
  }

  /**
   * Set up integration with existing event system
   */
  private setupEventSystemIntegration(): void {
    // Listen to coordination events and forward via WebSocket
    // Note: Using EventEmitter, but not setting up wildcard listener yet
    // TODO: Implement proper event forwarding when foundation is available
  }

  /**
   * Handle incoming messages from WebSocket connections
   */
  private handleMessage(connectionId: string, data: RawData): void {
    try {
      const message = JSON.parse(data.toString();
      const connection = this.connections.get(connectionId);
      
      if (!connection) return;

      connection.lastActivity = new Date();

      // Handle subscription requests
      if (message.type ==='subscribe){
        this.handleSubscription(connectionId, message);
      }

      // Handle service discovery requests
      if (message.type ==='discover_services){
        this.sendServiceDiscovery(connectionId);
      }

      recordEvent('central_hub_message_received,{
        connectionId,
        messageType: message.type
      });

    } catch (error) {
      this.logger.error('Failed to parse WebSocket message in central hub,{
        connectionId,
        error,
        data: data.toString().substring(0, 100)
      });
    }
  }

  /**
   * Handle subscription requests
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

    this.logger.debug('Connection subscription updated,{
      connectionId,
      subscribedServices: Array.from(connection.subscriptions.services),
      subscribedMessageTypes: Array.from(connection.subscriptions.messageTypes)
    });
  }

  /**
   * Send service discovery information to a specific connection
   */
  private sendServiceDiscovery(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const discoveryMessage: ServiceDiscoveryResponse = {
      type:'services_available,
      data: {
        services: Array.from(this.services.values()),
        totalMessageTypes: this.getAllMessageTypes(),
        hubVersion:'1.0.0'
      },
      timestamp: new Date()
    };

    try {
      connection.ws.send(JSON.stringify(discoveryMessage);
    } catch (error) {
      this.logger.error('Failed to send service discovery,{ connectionId, error }');
    }
  }

  /**
   * Broadcast service discovery to all connections
   */
  private broadcastServiceDiscovery(): void {
    for (const connectionId of Array.from(this.connections.keys())) {
      this.sendServiceDiscovery(connectionId);
    }
  }

  /**
   * Check if connection should receive a specific message
   */
  private shouldReceiveMessage(connection: HubConnection, source: string, messageType: string): boolean {
    // If subscribed to specific services, check service subscription
    if (connection.subscriptions.services.size > 0) {
      if (!connection.subscriptions.services.has(source)) {
        return false;
      }
    }

    // If subscribed to specific message types, check message type subscription
    if (connection.subscriptions.messageTypes.size > 0) {
      if (!connection.subscriptions.messageTypes.has(messageType)) {
        return false;
      }
    }

    // If no specific subscriptions, receive all messages
    return true;
  }

  /**
   * Get all available message types across all services
   */
  private getAllMessageTypes(): string[] {
    const allTypes = new Set<string>();
    
    for (const service of Array.from(this.services.values())) {
      service.messageTypes.forEach(type => allTypes.add(type);
    }

    return Array.from(allTypes).sort();
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
      this.logger.info('Cleaned up inactive central hub connections,{ cleanedCount }');
      recordEvent('central_hub_connections_cleaned,{ cleanedCount }');
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
        this.logger.error('Error closing central hub connection,{ connectionId, error }');
      }
    }

    this.connections.clear();
    this.services.clear();
    recordEvent('central_websocket_hub_shutdown'');
    this.logger.info('Central WebSocket Hub shut down'');
  }
}

/**
 * Global WebSocket hub instance
 */
let webSocketHub: WebSocketHub| null = null;

/**
 * Get the WebSocket hub instance
 */
export function getWebSocketHub(): WebSocketHub {
  if (!webSocketHub) {
    webSocketHub = new WebSocketHub();
  }
  return webSocketHub;
}

/**
 * Helper functions for broadcasting to the WebSocket hub
 */
export const hubBroadcast = {
  // TaskMaster events
  taskUpdated: (taskData: any) => getWebSocketHub().broadcast('taskmaster,{
    type:'task_updated,
    data: taskData
  }),

  approvalGateChanged: (gateData: any) => getWebSocketHub().broadcast('taskmaster,{
    type:'approval_gate_changed,
    data: gateData
  }),

  piPlanningProgress: (progressData: any) => getWebSocketHub().broadcast('taskmaster,{
    type:'pi_planning_progress,
    data: progressData
  }),

  flowMetricsUpdated: (metricsData: any) => getWebSocketHub().broadcast('taskmaster,{
    type:'flow_metrics_updated,
    data: metricsData
  }),

  // System coordination events
  systemHealthUpdate: (healthData: any) => getWebSocketHub().broadcast('coordination,{
    type:'system_health_update,
    data: healthData
  }),

  agentCoordination: (coordinationData: any) => getWebSocketHub().broadcast('coordination,{
    type:'agent_coordination,
    data: coordinationData
  })
};