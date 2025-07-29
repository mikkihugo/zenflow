/**
 * 🚀 AG-UI WebSocket Middleware for Claude Code Zen
 * 
 * Integrates AG-UI protocol with existing WebSocket infrastructure
 * Provides real-time AG-UI event streaming to connected clients
 * 
 * @module AGUIWebSocketMiddleware
 */

import { AGUIAdapter } from '../ai/agui-adapter.js';
import pkg from '@ag-ui/core';
const { EventType } = pkg;

/**
 * AG-UI WebSocket Middleware
 * Bridges Claude Zen WebSocket service with AG-UI protocol
 */
export class AGUIWebSocketMiddleware {
  constructor(webSocketService, options = {}) {
    this.wss = webSocketService;
    this.options = {
      enableBroadcast: true,
      enableFiltering: true,
      enableCompression: false,
      ...options
    };
    
    // Map of client connections to their AG-UI adapters
    this.clientAdapters = new Map();
    
    // Global AG-UI adapter for server-wide events
    this.globalAdapter = new AGUIAdapter({
      sessionId: 'server-global',
      threadId: 'server-thread'
    });
    
    this.stats = {
      clientsConnected: 0,
      eventsRouted: 0,
      broadcastsSent: 0
    };
    
    this.setupGlobalAdapter();
  }

  /**
   * Setup global adapter for server-wide AG-UI events
   */
  setupGlobalAdapter() {
    this.globalAdapter.on('agui:event', (event) => {
      this.broadcastAGUIEvent(event);
      this.stats.eventsRouted++;
    });
    
    // Listen for errors
    this.globalAdapter.on('error', (error) => {
      console.error('AG-UI Global Adapter Error:', error);
    });
  }

  /**
   * Initialize AG-UI for a WebSocket connection
   */
  initializeClient(ws, sessionId = null) {
    const clientSessionId = sessionId || `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Create AG-UI adapter for this client
    const adapter = new AGUIAdapter({
      sessionId: clientSessionId,
      threadId: `thread-${clientSessionId}`,
      runId: `run-${clientSessionId}`
    });
    
    // Store adapter reference
    this.clientAdapters.set(ws, adapter);
    ws.claudeZenAGUI = adapter;
    
    // Setup event forwarding from adapter to client
    adapter.on('agui:event', (event) => {
      this.sendToClient(ws, event);
    });
    
    // Setup client message handling
    this.setupClientMessageHandling(ws, adapter);
    
    // Connect to global emitter
    adapter.connectGlobalEmitter(this.globalAdapter);
    
    this.stats.clientsConnected++;
    
    // Send initial connection event
    adapter.emitCustomEvent('client_connected', {
      sessionId: clientSessionId,
      timestamp: Date.now()
    });
    
    return adapter;
  }

  /**
   * Setup handling of client messages with AG-UI context
   */
  setupClientMessageHandling(ws, adapter) {
    const originalOnMessage = ws.onmessage;
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle AG-UI specific commands
        if (data.type === 'agui:command') {
          this.handleAGUICommand(ws, adapter, data);
          return;
        }
        
        // For regular messages, wrap in AG-UI context
        if (data.type === 'message' && data.content) {
          // Start a user message in AG-UI format
          const messageId = adapter.startTextMessage(null, 'user');
          adapter.addTextContent(data.content, messageId);
          adapter.endTextMessage(messageId);
        }
        
        // Call original handler if exists
        if (originalOnMessage) {
          originalOnMessage.call(ws, event);
        }
        
      } catch (error) {
        console.error('AG-UI WebSocket message handling error:', error);
        adapter.emitCustomEvent('error', {
          error: error.message,
          data: event.data
        });
      }
    };
  }

  /**
   * Handle AG-UI specific commands from clients
   */
  handleAGUICommand(ws, adapter, data) {
    const { command, payload } = data;
    
    switch (command) {
      case 'start_run':
        adapter.startRun(payload.runId, payload.threadId);
        break;
        
      case 'finish_run':
        adapter.finishRun(payload.result, payload.runId, payload.threadId);
        break;
        
      case 'emit_custom':
        adapter.emitCustomEvent(payload.name, payload.value);
        break;
        
      case 'get_stats':
        this.sendToClient(ws, {
          type: 'agui:stats',
          stats: adapter.getStats(),
          serverStats: this.getStats()
        });
        break;
        
      case 'reset_session':
        adapter.reset();
        this.sendToClient(ws, {
          type: 'agui:session_reset',
          sessionId: adapter.sessionId
        });
        break;
        
      default:
        console.warn('Unknown AG-UI command:', command);
    }
  }

  /**
   * Send AG-UI event to specific client
   */
  sendToClient(ws, event) {
    if (ws.readyState === ws.OPEN) {
      try {
        const message = {
          type: 'agui:event',
          event: event,
          timestamp: Date.now()
        };
        
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send AG-UI event to client:', error);
      }
    }
  }

  /**
   * Broadcast AG-UI event to all connected clients
   */
  broadcastAGUIEvent(event) {
    if (!this.options.enableBroadcast) return;
    
    const message = {
      type: 'agui:broadcast',
      event: event,
      timestamp: Date.now()
    };
    
    const messageStr = JSON.stringify(message);
    let sentCount = 0;
    
    // Broadcast to all clients with AG-UI adapters
    this.clientAdapters.forEach((adapter, ws) => {
      if (ws.readyState === ws.OPEN) {
        try {
          ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error('Failed to broadcast AG-UI event:', error);
        }
      }
    });
    
    this.stats.broadcastsSent++;
    return sentCount;
  }

  /**
   * Get AG-UI adapter for a specific client
   */
  getClientAdapter(ws) {
    return this.clientAdapters.get(ws);
  }

  /**
   * Get global AG-UI adapter
   */
  getGlobalAdapter() {
    return this.globalAdapter;
  }

  /**
   * Handle client disconnection
   */
  handleClientDisconnect(ws) {
    const adapter = this.clientAdapters.get(ws);
    if (adapter) {
      // Emit disconnection event
      adapter.emitCustomEvent('client_disconnected', {
        sessionId: adapter.sessionId,
        timestamp: Date.now()
      });
      
      // Clean up
      this.clientAdapters.delete(ws);
      this.stats.clientsConnected--;
    }
  }

  /**
   * Convenience methods for emitting AG-UI events through global adapter
   */
  emitTextMessage(content, role = 'assistant') {
    const messageId = this.globalAdapter.startTextMessage(null, role);
    this.globalAdapter.addTextContent(content, messageId);
    this.globalAdapter.endTextMessage(messageId);
    return messageId;
  }

  emitToolCall(toolName, args, result) {
    return this.globalAdapter.startToolCall(toolName)
      .then(toolCallId => {
        this.globalAdapter.addToolCallArgs(JSON.stringify(args), toolCallId);
        this.globalAdapter.endToolCall(toolCallId);
        this.globalAdapter.emitToolCallResult(result, toolCallId);
        return toolCallId;
      });
  }

  emitQueenAction(queenId, action, data) {
    this.globalAdapter.emitQueenEvent(queenId, action, data);
  }

  emitSwarmAction(swarmId, action, agents, data) {
    this.globalAdapter.emitSwarmEvent(swarmId, action, agents, data);
  }

  emitHiveMindUpdate(action, data) {
    this.globalAdapter.emitHiveMindEvent(action, data);
  }

  emitStateUpdate(state) {
    this.globalAdapter.emitStateSnapshot(state);
  }

  /**
   * Get middleware statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeClients: this.clientAdapters.size,
      globalAdapterStats: this.globalAdapter.getStats()
    };
  }

  /**
   * Filter events based on client preferences (future enhancement)
   */
  shouldSendToClient(ws, event) {
    if (!this.options.enableFiltering) return true;
    
    const adapter = this.clientAdapters.get(ws);
    if (!adapter) return false;
    
    // Add filtering logic here based on client subscriptions
    return true;
  }
}

/**
 * Factory function for creating AG-UI WebSocket middleware
 */
export function createAGUIWebSocketMiddleware(webSocketService, options = {}) {
  return new AGUIWebSocketMiddleware(webSocketService, options);
}

/**
 * Integration helper for existing WebSocket services
 */
export function integrateAGUIWithWebSocket(webSocketService, options = {}) {
  const middleware = new AGUIWebSocketMiddleware(webSocketService, options);
  
  // Override connection handler to initialize AG-UI
  const originalConnectionHandler = webSocketService.onConnection || (() => {});
  
  webSocketService.onConnection = (ws, request) => {
    // Initialize AG-UI for this client
    middleware.initializeClient(ws);
    
    // Setup disconnect handling
    ws.on('close', () => {
      middleware.handleClientDisconnect(ws);
    });
    
    // Call original handler
    originalConnectionHandler(ws, request);
  };
  
  // Add AG-UI helper methods to WebSocket service
  webSocketService.agui = middleware;
  
  return middleware;
}

export default AGUIWebSocketMiddleware;