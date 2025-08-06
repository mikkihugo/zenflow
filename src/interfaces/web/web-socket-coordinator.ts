/**
 * WebSocket Coordinator - Real-time updates and broadcasting
 *
 * Handles WebSocket connections, sessions, and real-time data broadcasting
 * for the web dashboard interface.
 */

import type { Server as SocketIOServer } from 'socket.io';
import { createLogger } from '../../utils/logger';

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
 * Manages WebSocket connections and real-time updates
 *
 * @example
 */
export class WebSocketCoordinator {
  private logger = createLogger('WebSocket');
  private sessions = new Map<string, WebSession>();
  private io: SocketIOServer;

  constructor(
    io: SocketIOServer,
    private config: WebSocketConfig = {}
  ) {
    this.io = io;
    this.setupWebSocket();
  }

  /**
   * Setup WebSocket connection handlers
   */
  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      this.logger.info(`WebSocket client connected: ${socket.id}`);

      // Create session
      const session: WebSession = {
        id: socket.id,
        createdAt: new Date(),
        lastActivity: new Date(),
        preferences: {
          theme: 'dark',
          refreshInterval: 3000,
          notifications: true,
        },
      };

      this.sessions.set(socket.id, session);

      // Handle session updates
      socket.on('updateSession', (data) => {
        const session = this.sessions.get(socket.id);
        if (session) {
          session.preferences = { ...session.preferences, ...data };
          session.lastActivity = new Date();
          this.logger.debug(`Session updated: ${socket.id}`, data);
        }
      });

      // Handle status requests
      socket.on('requestStatus', () => {
        socket.emit('statusUpdate', {
          message: 'Status request received',
          timestamp: new Date().toISOString(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.logger.info(`WebSocket client disconnected: ${socket.id}`);
        this.sessions.delete(socket.id);
      });

      // Send initial connection acknowledgment
      socket.emit('connected', {
        sessionId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    this.logger.info('WebSocket coordinator initialized');
  }

  /**
   * Broadcast message to all connected clients
   *
   * @param event
   * @param data
   */
  broadcast(event: string, data: any): void {
    if (!this.config.realTime) return;

    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`Broadcasted event: ${event}`, data);
  }

  /**
   * Send message to specific session
   *
   * @param sessionId
   * @param event
   * @param data
   */
  sendToSession(sessionId: string, event: string, data: any): boolean {
    const socket = this.io.sockets.sockets.get(sessionId);
    if (!socket) {
      this.logger.warn(`Session not found: ${sessionId}`);
      return false;
    }

    socket.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Get active sessions
   */
  getSessions(): WebSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session by ID
   *
   * @param sessionId
   */
  getSession(sessionId: string): WebSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session preferences
   *
   * @param sessionId
   * @param preferences
   */
  updateSessionPreferences(
    sessionId: string,
    preferences: Partial<WebSession['preferences']>
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.preferences = { ...session.preferences, ...preferences };
    session.lastActivity = new Date();

    this.logger.debug(`Session preferences updated: ${sessionId}`, preferences);
    return true;
  }

  /**
   * Clean up expired sessions
   *
   * @param maxAge
   */
  cleanupSessions(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now.getTime() - session.lastActivity.getTime();
      if (age > maxAge) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.info(`Cleaned up ${cleaned} expired sessions`);
    }

    return cleaned;
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    averageSessionAge: number;
  } {
    const now = new Date();
    const sessions = Array.from(this.sessions.values());
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter((s) => {
      const age = now.getTime() - s.lastActivity.getTime();
      return age < 5 * 60 * 1000; // Active within 5 minutes
    }).length;

    const averageSessionAge =
      totalSessions > 0
        ? sessions.reduce((sum, s) => sum + (now.getTime() - s.createdAt.getTime()), 0) /
          totalSessions
        : 0;

    return {
      totalSessions,
      activeSessions,
      averageSessionAge,
    };
  }
}

export default WebSocketCoordinator;
