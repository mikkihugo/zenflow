
/**  AG-UI WebSocket Middleware for Claude Code Zen;
 *;
/** Integrates AG-UI protocol with existing WebSocket infrastructure;
/** Provides real-time AG-UI event streaming to connected clients;
 *;
 * @module AGUIWebSocketMiddleware;
 */

import { WebSocket  } from 'ws';
import { AGUIAdapter, type AGUIEvent  } from '../ai/agui-adapter.js';

export // interface AGUIWebSocketOptions {
//   enableBroadcast?;
//   enableFiltering?;
//   maxClients?;
//   sessionTimeout?;
// // }
export // interface ClientSession {
//   // ws: WebSocket
//   // adapter: AGUIAdapter
//   // sessionId: string
//   // connectedAt: number
//   // lastActivity: number
// // }
// export // interface AGUIStats {
//   // clientsConnected: number
//   // totalConnections: number
//   // eventsRouted: number
//   // messagesProcessed: number
// // }

/** AG-UI WebSocket Middleware;
/** Bridges Claude Zen WebSocket service with AG-UI protocol;

// export class AGUIWebSocketMiddleware {
  constructor(webSocketService, _options = {}) {
    this.wss = webSocketService;
    this.options = {
      enableBroadcast,
    enableFiltering,
    maxClients,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
..options }
  this;

  stats = {
      clientsConnected,
  // totalConnections: 0
  // eventsRouted: 0
  // messagesProcessed: 0
   //    }
// Global AG-UI adapter for server-wide events
this.globalAdapter = new AGUIAdapter({ sessionId: 'server-global',
threadId: 'server-thread'   })
// Setup global event forwarding
this.setupGlobalEventForwarding() {}
// }

/** Setup global event forwarding;

// private setupGlobalEventForwarding() {}
: void
// {
  this.globalAdapter.on('agui-event', (event) => {
    this.broadcastAGUIEvent(event);
    this.stats.eventsRouted++;
  });
  // Listen for errors
  this.globalAdapter.on('error', (error) => {
    console.error('AG-UI Global Adapter Error);'
  });
// }

/** Setup client connection with AG-UI protocol;

setupClient(ws, sessionId?)
: string
// {
  const _clientSessionId =;
  sessionId ?? `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  // Create AG-UI adapter for this client
  const _adapter = new AGUIAdapter({
      sessionId,
  threadId: `thread-${clientSessionId}` }
// )
// Store client adapter
this.clientAdapters.set(ws, adapter)
// Create session
const _session = {
      ws,
adapter,
sessionId,
connectedAt: Date.now(),
lastActivity: Date.now() }
this.sessions.set(clientSessionId, session)
// Setup event forwarding from adapter to client
adapter.on('agui-event', (event) =>
// {
  this.sendToClient(ws, event);
// }
// )
// Setup client message handling
this.setupClientMessageHandling(ws, adapter)
// Update stats
this.stats.clientsConnected++
this.stats.totalConnections++
// Send welcome message
adapter.startRun() {}
adapter.emitCustomEvent('clientConnected', {
      sessionId,)
timestamp: Date.now() })
// return clientSessionId;
//   // LINT: unreachable code removed}

/** Setup client message handling;

// private setupClientMessageHandling(ws, adapter)
: void
// {
  ws.on('message', (data) => {
    try {
        const _message = JSON.parse(data.toString());
        this.handleClientMessage(ws, adapter, message);
        this.stats.messagesProcessed++;

        // Update session activity
        const _session = this.getSessionByWebSocket(ws);
  if(session) {
          session.lastActivity = Date.now();
        //         }
      } catch(error) {
        console.error('Failed to parse client message);'
        this.sendError(ws, 'Invalid JSON message');
      //       }
  });
  ws.on('close', () => {
    this.handleClientDisconnect(ws);
  });
  ws.on('error', (error) => {
    console.error('WebSocket client error);'
    this.handleClientDisconnect(ws);
  });
// }

/** Handle client message;

// private handleClientMessage(ws, adapter, message)
: void
// {
  switch(message.type) {
    case 'startTextMessage': null
      adapter.startTextMessage(message.messageId, message.role);
      break;
    case 'addTextContent': null
      adapter.addTextContent(message.content, message.messageId);
      break;
    case 'endTextMessage': null
      adapter.endTextMessage(message.messageId);
      break;
    case 'startToolCall': null
      adapter.startToolCall(message.toolName, message.toolCallId, message.parentMessageId);
      break;
    case 'addToolCallArgs': null
      adapter.addToolCallArgs(message.args, message.toolCallId);
      break;
    case 'endToolCall': null
      adapter.endToolCall(message.toolCallId);
      break;
    case 'addToolCallResult': null
      adapter.addToolCallResult(message.result, message.toolCallId);
      break;
    case 'emitCustomEvent': null
      adapter.emitCustomEvent(message.eventType, message.data);
      break;
    case 'getStats': null
      this.sendToClient(ws, {
          type: 'statsResponse',
      //       {/g)
        adapter: adapter.getStats(),
        middleware: this.getMiddlewareStats() }
       //        }
  //   )
      break;
    // default: null
      console.warn('Unknown message type);'
      this.sendError(ws, `Unknown message type);`
  //   }
// }

/** Handle client disconnect;

// private handleClientDisconnect(ws)
: void
// {
  const _adapter = this.clientAdapters.get(ws);
  const _session = this.getSessionByWebSocket(ws);
  if(adapter) {
    adapter.finishRun(undefined, 'disconnected');
    this.clientAdapters.delete(ws);
  //   }
  if(session) {
    this.sessions.delete(session.sessionId);
  //   }
  this.stats.clientsConnected--;
// }

/** Send message to specific client;

// private sendToClient(ws, event)
: void
// {
  if(ws.readyState === WebSocket.OPEN) {
    try {
        ws.send(JSON.stringify(event));
      } catch(error) {
        console.error('Failed to send message to client);'
      //       }
  //   }
// }

/** Send error to client;

// private sendError(ws, message)
: void
// {
  this.sendToClient(ws, {
      type: 'error',
  message,)
  timestamp: Date.now() }
// )
// }

/** Broadcast AG-UI event to all clients;

// private broadcastAGUIEvent(event)
: void
// {
  if(!this.options.enableBroadcast) return;
  // ; // LINT: unreachable code removed
  const _message = JSON.stringify(event);
  this.clientAdapters.forEach((_adapter, ws) => {
  if(ws.readyState === WebSocket.OPEN) {
      try {
          ws.send(message);
        } catch(error) {
          console.error('Failed to broadcast to client);'
        //         }
    //     }
  });
// }

/** Get session by WebSocket;

// private getSessionByWebSocket(ws)
: ClientSession | undefined
// {
    for (const session of this.sessions.values()) {
  if(session.ws === ws) {
        // return session; 
    //   // LINT: unreachable code removed}
    //     }
    // return undefined; 
    //   // LINT: unreachable code removed}

/** Get middleware statistics;

  getMiddlewareStats() {: AGUIStats
    // return { ...this.stats };
    //   // LINT: unreachable code removed}

/** Get all active sessions;

  getActiveSessions(): ClientSession[]
    // return Array.from(this.sessions.values());
    //   // LINT: unreachable code removed}

/** Get global adapter for server-wide events;

  getGlobalAdapter(): AGUIAdapter
    // return this.globalAdapter;
    //   // LINT: unreachable code removed}

/** Cleanup expired sessions;

  cleanupExpiredSessions() {
    const _now = Date.now();
    const _expiredSessions = [];

    for (const [sessionId, session] of this.sessions.entries()) {
  if(now - session.lastActivity > this.options.sessionTimeout!) {
        expiredSessions.push(sessionId); //       }
    //     }

    expiredSessions.forEach((sessionId) => {
      const _session = this.sessions.get(sessionId); if(session) {
        session.ws.close();
        this.sessions.delete(sessionId);
        this.clientAdapters.delete(session.ws);
        this.stats.clientsConnected--;
      //       }
    });
  //   }

/** Start periodic cleanup;

  startCleanupTimer(): void
    setInterval(;
      () => {
        this.cleanupExpiredSessions();
      },
      5 * 60 * 1000;
    ); // Every 5 minutes

// export default AGUIWebSocketMiddleware;
