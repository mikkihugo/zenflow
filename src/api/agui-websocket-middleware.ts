/**
 * 🚀 AG-UI WebSocket Middleware for Claude Code Zen;
 *;
 * Integrates AG-UI protocol with existing WebSocket infrastructure;
 * Provides real-time AG-UI event streaming to connected clients;
 *;
 * @module AGUIWebSocketMiddleware;
 */

import { WebSocket } from 'ws';
import { AGUIAdapter, type AGUIEvent } from '../ai/agui-adapter.js';

export interface AGUIWebSocketOptions {
  enableBroadcast?: boolean;
  enableFiltering?: boolean;
  maxClients?: number;
  sessionTimeout?: number;
}
export interface ClientSession {
  ws: WebSocket;
  adapter: AGUIAdapter;
  sessionId: string;
  connectedAt: number;
  lastActivity: number;
}
export interface AGUIStats {
  clientsConnected: number;
  totalConnections: number;
  eventsRouted: number;
  messagesProcessed: number;
}
/**
 * AG-UI WebSocket Middleware;
 * Bridges Claude Zen WebSocket service with AG-UI protocol;
 */
export class AGUIWebSocketMiddleware {
  constructor(webSocketService: unknown, _options: AGUIWebSocketOptions = {}) {
    this.wss = webSocketService;
    this.options = {
      enableBroadcast: true,;
    enableFiltering: false,;
    maxClients: 100,;
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    ...options,
  }
  this;
  .
  stats = {
      clientsConnected: 0,;
  totalConnections: 0;
  ,
  eventsRouted: 0;
  ,
  messagesProcessed: 0;
  ,
}
// Global AG-UI adapter for server-wide events
this.globalAdapter = new AGUIAdapter({
      sessionId: 'server-global',;
threadId: 'server-thread',;
})
// Setup global event forwarding
this.setupGlobalEventForwarding()
}
/**
 * Setup global event forwarding;
 */
private
setupGlobalEventForwarding()
: void
{
  this.globalAdapter.on('agui-event', (event: AGUIEvent) => {
    this.broadcastAGUIEvent(event);
    this.stats.eventsRouted++;
  });
  // Listen for errors
  this.globalAdapter.on('error', (error: Error) => {
    console.error('AG-UI Global Adapter Error:', error);
  });
}
/**
 * Setup client connection with AG-UI protocol;
 */
setupClient(ws: WebSocket, sessionId?: string)
: string
{
  const _clientSessionId =;
  sessionId ?? `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  // Create AG-UI adapter for this client
  const _adapter = new AGUIAdapter({
      sessionId: clientSessionId,;
  threadId: `thread-${clientSessionId}`,;
}
)
// Store client adapter
this.clientAdapters.set(ws, adapter)
// Create session
const _session: ClientSession = {
      ws,;
adapter,;
sessionId: clientSessionId,;
connectedAt: Date.now(),;
lastActivity: Date.now(),;
}
this.sessions.set(clientSessionId, session)
// Setup event forwarding from adapter to client
adapter.on('agui-event', (event: AGUIEvent) =>
{
  this.sendToClient(ws, event);
}
)
// Setup client message handling
this.setupClientMessageHandling(ws, adapter)
// Update stats
this.stats.clientsConnected++
this.stats.totalConnections++
// Send welcome message
adapter.startRun()
adapter.emitCustomEvent('clientConnected', {
      sessionId: clientSessionId,;
timestamp: Date.now(),;
})
return clientSessionId;
//   // LINT: unreachable code removed}
/**
 * Setup client message handling;
 */
private
setupClientMessageHandling(ws: WebSocket, adapter: AGUIAdapter)
: void
{
  ws.on('message', (data: Buffer) => {
    try {
        const _message = JSON.parse(data.toString());
        this.handleClientMessage(ws, adapter, message);
        this.stats.messagesProcessed++;
;
        // Update session activity
        const _session = this.getSessionByWebSocket(ws);
        if (session) {
          session.lastActivity = Date.now();
        }
      } catch (/* error */) {
        console.error('Failed to parse client message:', error);
        this.sendError(ws, 'Invalid JSON message');
      }
  });
  ws.on('close', () => {
    this.handleClientDisconnect(ws);
  });
  ws.on('error', (error: Error) => {
    console.error('WebSocket client error:', error);
    this.handleClientDisconnect(ws);
  });
}
/**
 * Handle client message;
 */
private
handleClientMessage(ws: WebSocket, adapter: AGUIAdapter, message: unknown)
: void
{
  switch (message.type) {
    case 'startTextMessage':
      adapter.startTextMessage(message.messageId, message.role);
      break;
    case 'addTextContent':
      adapter.addTextContent(message.content, message.messageId);
      break;
    case 'endTextMessage':
      adapter.endTextMessage(message.messageId);
      break;
    case 'startToolCall':
      adapter.startToolCall(message.toolName, message.toolCallId, message.parentMessageId);
      break;
    case 'addToolCallArgs':
      adapter.addToolCallArgs(message.args, message.toolCallId);
      break;
    case 'endToolCall':
      adapter.endToolCall(message.toolCallId);
      break;
    case 'addToolCallResult':
      adapter.addToolCallResult(message.result, message.toolCallId);
      break;
    case 'emitCustomEvent':
      adapter.emitCustomEvent(message.eventType, message.data);
      break;
    case 'getStats':
      this.sendToClient(ws, {
          type: 'statsResponse',;
      {
        adapter: adapter.getStats(),;
        middleware: this.getMiddlewareStats(),;
      }
      ,
  }
  )
      break;
    default:
      console.warn('Unknown message type:', message.type);
      this.sendError(ws, `Unknown message type: ${message.type}`);
  }
}
/**
 * Handle client disconnect;
 */
private
handleClientDisconnect(ws: WebSocket)
: void
{
  const _adapter = this.clientAdapters.get(ws);
  const _session = this.getSessionByWebSocket(ws);
  if (adapter) {
    adapter.finishRun(undefined, 'disconnected');
    this.clientAdapters.delete(ws);
  }
  if (session) {
    this.sessions.delete(session.sessionId);
  }
  this.stats.clientsConnected--;
}
/**
 * Send message to specific client;
 */
private
sendToClient(ws: WebSocket, event: unknown)
: void
{
  if (ws.readyState === WebSocket.OPEN) {
    try {
        ws.send(JSON.stringify(event));
      } catch (/* error */) {
        console.error('Failed to send message to client:', error);
      }
  }
}
/**
 * Send error to client;
 */
private
sendError(ws: WebSocket, message: string)
: void
{
  this.sendToClient(ws, {
      type: 'error',;
  message,;
  timestamp: Date.now(),;
}
)
}
/**
 * Broadcast AG-UI event to all clients;
 */
private
broadcastAGUIEvent(event: AGUIEvent)
: void
{
  if (!this.options.enableBroadcast) return;
  // ; // LINT: unreachable code removed
  const _message = JSON.stringify(event);
  this.clientAdapters.forEach((_adapter, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
          ws.send(message);
        } catch (/* error */) {
          console.error('Failed to broadcast to client:', error);
        }
    }
  });
}
/**
 * Get session by WebSocket;
 */
private
getSessionByWebSocket(ws: WebSocket)
: ClientSession | undefined
{
    for (const session of this.sessions.values()) {
      if (session.ws === ws) {
        return session;
    //   // LINT: unreachable code removed}
    }
    return undefined;
    //   // LINT: unreachable code removed}
;
  /**
   * Get middleware statistics;
   */;
  getMiddlewareStats(): AGUIStats 
    return { ...this.stats };
    //   // LINT: unreachable code removed}
;
  /**
   * Get all active sessions;
   */;
  getActiveSessions(): ClientSession[] 
    return Array.from(this.sessions.values());
    //   // LINT: unreachable code removed}
;
  /**
   * Get global adapter for server-wide events;
   */;
  getGlobalAdapter(): AGUIAdapter 
    return this.globalAdapter;
    //   // LINT: unreachable code removed}
;
  /**
   * Cleanup expired sessions;
   */;
  cleanupExpiredSessions(): void {
    const _now = Date.now();
    const _expiredSessions: string[] = [];
;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.options.sessionTimeout!) {
        expiredSessions.push(sessionId);
      }
    }
;
    expiredSessions.forEach((sessionId) => {
      const _session = this.sessions.get(sessionId);
      if (session) {
        session.ws.close();
        this.sessions.delete(sessionId);
        this.clientAdapters.delete(session.ws);
        this.stats.clientsConnected--;
      }
    });
  }
;
  /**
   * Start periodic cleanup;
   */;
  startCleanupTimer(): void 
    setInterval(;
      () => {
        this.cleanupExpiredSessions();
      },;
      5 * 60 * 1000;
    ); // Every 5 minutes
;
export default AGUIWebSocketMiddleware;
