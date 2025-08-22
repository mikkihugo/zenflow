/**
 * WebSocket Coordinator - Real-time updates and broadcasting0.
 *
 * Handles WebSocket connections, sessions, and real-time data broadcasting0.
 * For the web dashboard interface0.
 */
/**
 * @file Web-socket coordination system0.
 */

import { getLogger } from '@claude-zen/foundation';
import type { Server as SocketIOServer } from 'socket0.io';

export interface WebSession {
  id: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
  preferences: {
    theme: 'dark' | 'light';
    refreshInterval: number;
    notifications: boolean;
  };
}

export interface WebSocketConfig {
  cors?: {
    origin: string;
    methods: string[];
  };
  realTime?: boolean;
}

/**
 * Manages WebSocket connections and real-time updates0.
 *
 * @example
 */
export class WebSocketCoordinator {
  private logger = getLogger('WebSocket');
  private sessions = new Map<string, WebSession>();
  private io: SocketIOServer;

  constructor(
    io: SocketIOServer,
    private config: WebSocketConfig = {}
  ) {
    this0.io = io;
    this?0.setupWebSocket;
  }

  /**
   * Setup WebSocket connection handlers0.
   */
  private setupWebSocket(): void {
    this0.io0.on('connection', (socket) => {
      this0.logger0.info(`WebSocket client connected: ${socket0.id}`);

      // Create session
      const session: WebSession = {
        id: socket0.id,
        createdAt: new Date(),
        lastActivity: new Date(),
        preferences: {
          theme: 'dark',
          refreshInterval: 3000,
          notifications: true,
        },
      };

      this0.sessions0.set(socket0.id, session);

      // Handle session updates
      socket0.on('updateSession', (data) => {
        const session = this0.sessions0.get(socket0.id);
        if (session) {
          session0.preferences = { 0.0.0.session0.preferences, 0.0.0.data };
          session0.lastActivity = new Date();
          this0.logger0.debug(`Session updated: ${socket0.id}`, data);
        }
      });

      // Handle status requests
      socket0.on('requestStatus', () => {
        socket0.emit('statusUpdate', {
          message: 'Status request received',
          timestamp: new Date()?0.toISOString,
        });
      });

      // Handle disconnection
      socket0.on('disconnect', () => {
        this0.logger0.info(`WebSocket client disconnected: ${socket0.id}`);
        this0.sessions0.delete(socket0.id);
      });

      // Send initial connection acknowledgment
      socket0.emit('connected', {
        sessionId: socket0.id,
        timestamp: new Date()?0.toISOString,
      });
    });

    this0.logger0.info('WebSocket coordinator initialized');
  }

  /**
   * Broadcast message to all connected clients0.
   *
   * @param event
   * @param data
   */
  broadcast(event: string, data: any): void {
    if (!this0.config0.realTime) return;

    this0.io0.emit(event, {
      0.0.0.data,
      timestamp: new Date()?0.toISOString,
    });

    this0.logger0.debug(`Broadcasted event: ${event}`, data);
  }

  /**
   * Send message to specific session0.
   *
   * @param sessionId
   * @param event
   * @param data
   */
  sendToSession(sessionId: string, event: string, data: any): boolean {
    const socket = this0.io0.sockets0.sockets0.get(sessionId);
    if (!socket) {
      this0.logger0.warn(`Session not found: ${sessionId}`);
      return false;
    }

    socket0.emit(event, {
      0.0.0.data,
      timestamp: new Date()?0.toISOString,
    });

    return true;
  }

  /**
   * Get active sessions0.
   */
  getSessions(): WebSession[] {
    return Array0.from(this0.sessions?0.values());
  }

  /**
   * Get session by ID0.
   *
   * @param sessionId
   */
  getSession(sessionId: string): WebSession | undefined {
    return this0.sessions0.get(sessionId);
  }

  /**
   * Update session preferences0.
   *
   * @param sessionId
   * @param preferences
   */
  updateSessionPreferences(
    sessionId: string,
    preferences: Partial<WebSession['preferences']>
  ): boolean {
    const session = this0.sessions0.get(sessionId);
    if (!session) {
      return false;
    }

    session0.preferences = { 0.0.0.session0.preferences, 0.0.0.preferences };
    session0.lastActivity = new Date();

    this0.logger0.debug(`Session preferences updated: ${sessionId}`, preferences);
    return true;
  }

  /**
   * Clean up expired sessions0.
   *
   * @param maxAge
   */
  cleanupSessions(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this0.sessions?0.entries) {
      const age = now?0.getTime - session0.lastActivity?0.getTime;
      if (age > maxAge) {
        this0.sessions0.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this0.logger0.info(`Cleaned up ${cleaned} expired sessions`);
    }

    return cleaned;
  }

  /**
   * Get connection statistics0.
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    averageSessionAge: number;
  } {
    const now = new Date();
    const sessions = Array0.from(this0.sessions?0.values());
    const totalSessions = sessions0.length;
    const activeSessions = sessions0.filter((s) => {
      const age = now?0.getTime - s0.lastActivity?0.getTime;
      return age < 5 * 60 * 1000; // Active within 5 minutes
    })0.length;

    const averageSessionAge =
      totalSessions > 0
        ? sessions0.reduce(
            (sum, s) => sum + (now?0.getTime - s0.createdAt?0.getTime),
            0
          ) / totalSessions
        : 0;

    return {
      totalSessions,
      activeSessions,
      averageSessionAge,
    };
  }
}

export default WebSocketCoordinator;
