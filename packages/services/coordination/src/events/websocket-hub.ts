/**
 * @fileoverview WebSocket Hub - EventBus Integration
 *
 * Integrates packages/services/coordination/src/events/websocket-hub.ts with the foundation EventBus
 * so events can be broadcast to websocket clients and inbound messages can be published into the event system.
 */

import {
  EventBus,
  isValidEventName,
  EventLogger,
} from '@claude-zen/foundation';
import { randomUUID } from 'crypto';
import { WebSocket } from 'ws';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface WebSocketConnection {
  id: string;
  ws: WebSocket; // WebSocket connection object
  subscriptions: Set<string>; // Services and message types this connection is subscribed to
  lastPing: Date;
}

interface HubMessage {
  id: string;
  type: string;
  data: unknown;
  timestamp: string;
  source: string;
}

interface InboundMessage {
  type: 'subscribe' | 'unsubscribe' | 'publish' | 'ping';
  services?: string[];
  messageTypes?: string[];
  event?: string;
  payload?: unknown;
}

// =============================================================================
// WEBSOCKET HUB CLASS
// =============================================================================

export class WebsocketHub {
  private static readonly componentName = 'websocket-hub';
  private eventBus: EventBus;
  private connections: Map<string, WebSocketConnection> = new Map();
  private isInitialized = false;
  private bridgeEnabled: boolean;
  
  // Whitelist of EventBus event prefixes to broadcast
  private readonly eventWhitelist = ['registry:', 'system:', 'agent:', 'llm:'];

  constructor() {
    this.eventBus = EventBus.getInstance();
    
    // Feature flag ZEN_EVENT_HUB_BRIDGE (default: on)
    const flagValue = process.env['ZEN_EVENT_HUB_BRIDGE'];
    this.bridgeEnabled = flagValue !== 'off' && flagValue !== 'false';
    
    EventLogger.log('websocket-hub:constructor', {
      bridgeEnabled: this.bridgeEnabled,
      whitelistPrefixes: this.eventWhitelist
    });
  }

  /**
   * Initialize the WebSocket Hub and set up EventBus integration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      EventLogger.log('websocket-hub:already-initialized');
      return;
    }

    try {
      // Set up EventBus integration if bridge is enabled
      if (this.bridgeEnabled) {
        await this.setupEventSystemIntegration();
      }

      this.isInitialized = true;
      EventLogger.log('websocket-hub:initialized');
    } catch (error) {
      // Fail-open: log and continue
      EventLogger.logError('websocket-hub:initialization-failed', error as Error, {
        component: WebsocketHub.componentName
      });
    }
  }

  /**
   * Set up EventBus integration - subscribe to whitelisted events and forward to clients
   */
  private setupEventSystemIntegration(): void {
    try {
      // Subscribe to all EventBus events using wildcard
      this.eventBus.on('*', (...args: unknown[]) => {
        try {
          const payload = args[0];
          const eventName = args[1] as string | undefined;
          if (!eventName) return;
          
          // Check if event matches our whitelist
          const isWhitelisted = this.eventWhitelist.some(prefix => 
            eventName.startsWith(prefix)
          );
          
          if (!isWhitelisted) {
            return; // Don't broadcast non-whitelisted events
          }

          // Broadcast to subscribed connections
          this.broadcast('eventbus', {
            type: eventName,
            data: payload
          });
          
        } catch (error) {
          // Fail-open: log and continue
          EventLogger.logError('websocket-hub:event-broadcast-failed', error as Error, {
            component: WebsocketHub.componentName
          });
        }
      });

      EventLogger.log('websocket-hub:event-integration-setup');
    } catch (error) {
      // Fail-open: log and continue  
      EventLogger.logError('websocket-hub:integration-setup-failed', error as Error, {
        component: WebsocketHub.componentName
      });
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(connectionId: string, rawMessage: string): void {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        EventLogger.log('websocket-hub:unknown-connection');
        return;
      }

      const message: InboundMessage = JSON.parse(rawMessage);
      
      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(connection, message);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscribe(connection, message);
          break;
          
        case 'publish':
          this.handlePublish(connection, message);
          break;
          
        case 'ping':
          this.handlePing(connection);
          break;
          
        default:
          EventLogger.log('websocket-hub:unknown-message-type');
      }
    } catch (error) {
      // Fail-open: log and continue
      EventLogger.logError('websocket-hub:message-handling-failed', error as Error, {
        component: WebsocketHub.componentName
      });
    }
  }

  /**
   * Handle subscription requests
   */
  private handleSubscribe(connection: WebSocketConnection, message: InboundMessage): void {
    const services = message.services || [];
    const messageTypes = message.messageTypes || [];
    
    // Add to connection's subscriptions
    for (const item of [...services, ...messageTypes]) {
      connection.subscriptions.add(item);
    }
    
    EventLogger.log('websocket-hub:subscription-added');
  }

  /**
   * Handle unsubscription requests
   */
  private handleUnsubscribe(connection: WebSocketConnection, message: InboundMessage): void {
    const services = message.services || [];
    const messageTypes = message.messageTypes || [];
    
    // Remove from connection's subscriptions
    for (const item of [...services, ...messageTypes]) {
      connection.subscriptions.delete(item);
    }
    
    EventLogger.log('websocket-hub:subscription-removed');
  }

  /**
   * Handle publish requests - forward to EventBus
   */
  private handlePublish(_connection: WebSocketConnection, message: InboundMessage): void {
    if (!message.event) {
      EventLogger.log('websocket-hub:publish-missing-event');
      return;
    }

    // Validate event name
    if (!isValidEventName(message.event)) {
      EventLogger.log('websocket-hub:publish-invalid-event');
      return;
    }

    try {
      // Forward to EventBus using emitSafe
      this.eventBus.emitSafe(message.event, message.payload).then(result => {
        if (result.isErr()) {
          EventLogger.logError('websocket-hub:publish-emit-failed', result.error!, {
            component: WebsocketHub.componentName
          });
        } else {
          EventLogger.log('websocket-hub:publish-success');
        }
      }).catch(error => {
        EventLogger.logError('websocket-hub:publish-async-failed', error, {
          component: WebsocketHub.componentName
        });
      });
    } catch (error) {
      // Fail-open: log and continue
      EventLogger.logError('websocket-hub:publish-failed', error as Error, {
        component: WebsocketHub.componentName
      });
    }
  }

  /**
   * Handle ping requests
   */
  private handlePing(connection: WebSocketConnection): void {
    connection.lastPing = new Date();
    
    // Send pong response
    this.sendToConnection(connection.id, {
      id: randomUUID(),
      type: 'pong',
      data: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      source: WebsocketHub.componentName
    });
  }

  /**
   * Broadcast message to all subscribed connections
   */
  broadcast(type: string, data: unknown): void {
    if (this.connections.size === 0) {
      // No runtime errors with no clients connected
      return;
    }

    const message: HubMessage = {
      id: randomUUID(),
      type,
      data,
      timestamp: new Date().toISOString(),
      source: 'websocket-hub'
    };

    try {
      for (const connection of Array.from(this.connections.values())) {
        // Check if connection is subscribed to this message type or service
        const isSubscribed = connection.subscriptions.has(type) || 
                           connection.subscriptions.has('all') ||
                           this.checkSubscriptionMatch(connection, type);
        
        if (isSubscribed) {
          this.sendToConnection(connection.id, message);
        }
      }
      
      EventLogger.log('websocket-hub:broadcast-sent');
    } catch (error) {
      // Fail-open: log and continue
      EventLogger.logError('websocket-hub:broadcast-failed', error as Error, {
        component: WebsocketHub.componentName
      });
    }
  }

  /**
   * Check if connection subscriptions match the message type
   */
  private checkSubscriptionMatch(connection: WebSocketConnection, messageType: string): boolean {
    // Check for wildcard or prefix matches in subscriptions
    for (const subscription of Array.from(connection.subscriptions)) {
      if (subscription.endsWith('*') && messageType.startsWith(subscription.slice(0, -1))) {
        return true;
      }
      if (messageType.startsWith(`${subscription}:`) || messageType === subscription) {
        return true;
      }
    }
    return false;
  }

  /**
   * Send message to a specific connection
   */
  private sendToConnection(connectionId: string, message: HubMessage): void {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection || !connection.ws) {
        return;
      }

      // Send message (assuming WebSocket-like interface)
      connection.ws.send(JSON.stringify(message));
    } catch (error) {
      // Fail-open: log and continue
      EventLogger.logError('websocket-hub:send-failed', error as Error, {
        component: WebsocketHub.componentName
      });
      
      // Remove invalid connections
      this.connections.delete(connectionId);
    }
  }

  /**
   * Add a new WebSocket connection
   */
  addConnection(ws: WebSocket): string {
    const connectionId = randomUUID();
    const connection: WebSocketConnection = {
      id: connectionId,
      ws,
      subscriptions: new Set(),
      lastPing: new Date()
    };
    
    this.connections.set(connectionId, connection);
    
    EventLogger.log('websocket-hub:connection-added');
    
    return connectionId;
  }

  /**
   * Remove a WebSocket connection
   */
  removeConnection(connectionId: string): void {
    if (this.connections.delete(connectionId)) {
      EventLogger.log('websocket-hub:connection-removed');
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): { connections: number; totalSubscriptions: number } {
    const totalSubscriptions = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.subscriptions.size, 0);
    
    return {
      connections: this.connections.size,
      totalSubscriptions
    };
  }

  /**
   * Legacy execute method for compatibility
   */
  async execute(): Promise<void> {
    await this.initialize();
  }
}
