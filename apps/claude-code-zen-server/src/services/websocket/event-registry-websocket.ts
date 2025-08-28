/**
 * @fileoverview WebSocket Service for Real-Time Event Registry
 * 
 * Provides real-time streaming of event system data to dashboard clients
 */

import { getLogger, eventRegistryInitializer} from '@claude-zen/foundation';
import { WebSocketServer, WebSocket} from 'ws';

const logger = getLogger('event-registry-websocket');

// Constants for event types to avoid duplication
const MODULE_STATUS = 'module-status';
const EVENT_METRICS = 'event-metrics'; 
const EVENT_FLOWS = 'event-flows';
const MODULE_LIST = 'module-list';

export interface EventRegistryWebSocketMessage {
  type:typeof MODULE_STATUS | 'module-registry' | typeof MODULE_LIST | ' module-update' | typeof EVENT_FLOWS | typeof EVENT_METRICS | ' event-flow' | ' heartbeat';
  data:unknown;
  timestamp:string;
}

export interface WebSocketClient {
  ws:WebSocket;
  id:string;
  subscriptions:Set<string>;
  lastPing:Date;
}

/**
 * WebSocket service for real-time event registry data
 */
export class EventRegistryWebSocketService {
  private wss:WebSocketServer | null = null;
  private clients = new Map<string, WebSocketClient>();
  private updateInterval:NodeJS.Timer | null = null;
  private pingInterval:NodeJS.Timer | null = null;

  constructor() {
    logger.info('EventRegistryWebSocketService initialized');
}

  /**
   * Initialize WebSocket server
   */
  initialize(server:unknown): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/events/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startDataBroadcast();
    this.startPingClients();

    logger.info('🔌 Event Registry WebSocket server started at /api/events/ws');
}

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws:WebSocket): void {
    const clientId = this.generateClientId();
    const client:WebSocketClient = {
      ws,
      id:clientId,
      subscriptions:new Set([MODULE_STATUS, EVENT_METRICS, EVENT_FLOWS]),
      lastPing:new Date()
};

    this.clients.set(clientId, client);
    logger.info(`📡 New event registry client connected:${clientId} (${this.clients.size} total)`);

    // Send initial data
    this.sendToClient(client, MODULE_LIST, eventRegistryInitializer.getActiveModules());
    this.sendToClient(client, EVENT_METRICS, eventRegistryInitializer.getEventMetrics());
    this.sendToClient(client, EVENT_FLOWS, eventRegistryInitializer.getEventFlows().slice(0, 10));

    // Handle client messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleClientMessage(client, message);
} catch (error) {
        logger.error('Failed to parse WebSocket message: ', error);
      }
});

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(clientId);
      logger.info(`📡 Event registry client disconnected:${clientId} (${this.clients.size} remaining)`);
});

    // Handle client errors
    ws.on('error', (error) => {
      logger.error(`WebSocket client error (${clientId}):`, error);
      this.clients.delete(clientId);
});

    // Send pong responses
    ws.on('pong', () => {
      client.lastPing = new Date();
});
}

  /**
   * Handle messages from clients
   */
  private handleClientMessage(client:WebSocketClient, message:{ type: string; eventTypes?: string[]}):void {
    switch (message.type) {
      case 'subscribe':
        if (message.eventTypes && Array.isArray(message.eventTypes)) {
          for (const eventType of message.eventTypes) {
            client.subscriptions.add(eventType);
}
          logger.info(`Client ${client.id} subscribed to ${message.eventTypes.join(',    ')}`);
}
        break;

      case 'unsubscribe':
        if (message.eventTypes && Array.isArray(message.eventTypes)) {
          for (const eventType of message.eventTypes) {
            client.subscriptions.delete(eventType);
}
          logger.info(`Client ${client.id} unsubscribed from ${message.eventTypes.join(',    ')}`);
}
        break;

      case 'request':
        switch (message.eventType) {
          case MODULE_LIST:
            this.sendToClient(client, MODULE_LIST, eventRegistryInitializer.getActiveModules());
            break;
          case EVENT_FLOWS:
            this.sendToClient(client, EVENT_FLOWS, eventRegistryInitializer.getEventFlows().slice(0, 10));
            break;
          case EVENT_METRICS:
            this.sendToClient(client, EVENT_METRICS, eventRegistryInitializer.getEventMetrics());
            break;
}
        break;

      case 'ping':
        this.sendToClient(client, 'pong', { timestamp:new Date().toISOString()});
        break;

      default:
        logger.warn(`Unknown message type from client ${client.id}:`, message.type);
}
}

  /**
   * Send data to specific client
   */
  private sendToClient(client:WebSocketClient, type:EventRegistryWebSocketMessage['type'], data:unknown): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      const message:EventRegistryWebSocketMessage = {
        type,
        data,
        timestamp:new Date().toISOString()
};

      client.ws.send(JSON.stringify(message));
}
}

  /**
   * Broadcast data to all subscribed clients
   */
  broadcast(type:EventRegistryWebSocketMessage['type'], data:unknown): void {
    const message:EventRegistryWebSocketMessage = {
      type,
      data,
      timestamp:new Date().toISOString()
};

    const messageStr = JSON.stringify(message);

    for (const client of this.clients.values()) {
      if (client.subscriptions.has(type) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
}
}
}

  /**
   * Start broadcasting real-time data updates
   */
  private startDataBroadcast():void {
    // Start the event registry initializer
    eventRegistryInitializer.start();
    logger.info('📡 Event registry broadcasting started');
}

  /**
   * Start pinging clients to maintain connection
   */
  private startPingClients():void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      
      for (const [clientId, client] of this.clients.entries()) {
        if (client.ws.readyState === WebSocket.OPEN) {
          // Send ping
          client.ws.ping();
          
          // Check if client is stale (no pong received in last 60 seconds)
          if (now.getTime() - client.lastPing.getTime() > 60000) {
            logger.info(`Removing stale client:${clientId}`);
            client.ws.terminate();
            this.clients.delete(clientId);
}
} else {
          // Remove disconnected clients
          this.clients.delete(clientId);
}
}
}, 30000); // Ping every 30 seconds

    logger.info('📡 Started pinging clients every 30 seconds');
}

  /**
   * Generate unique client ID
   */
  private generateClientId():string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

  /**
   * Get current client stats
   */
  getStats():{ connectedClients: number; totalMessagesSent: number} {
    return {
      connectedClients:this.clients.size,
      totalMessagesSent:0 // Could implement message counting if needed
};
}

  /**
   * Stop the service and cleanup
   */
  stop():void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
}

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
}

    // Close all client connections
    for (const client of this.clients.values()) {
      client.ws.close();
}
    this.clients.clear();

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
}

    logger.info('📡 Event Registry WebSocket service stopped');
    
    // Stop the event registry initializer
    eventRegistryInitializer.stop();
}
}

// Singleton instance
export const eventRegistryWebSocketService = new EventRegistryWebSocketService();