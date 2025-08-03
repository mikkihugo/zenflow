/**
 * Web Session Manager - HTTP session management
 *
 * Handles user sessions, preferences, and session lifecycle.
 * Provides clean separation of session concerns from server logic.
 */

import type { NextFunction, Request, Response } from 'express';
import { createLogger } from '../../utils/logger';
import type { WebConfig, WebSession } from './WebConfig';

export class WebSessionManager {
  private logger = createLogger('WebSessions');
  private sessions = new Map<string, WebSession>();
  private config: WebConfig;

  constructor(config: WebConfig) {
    this.config = config;
  }

  /**
   * Session middleware for Express
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const sessionId = (req.headers['x-session-id'] as string) || this.generateSessionId();
      req.sessionId = sessionId;

      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, {
          id: sessionId,
          createdAt: new Date(),
          lastActivity: new Date(),
          preferences: {
            theme: this.config.theme!,
            refreshInterval: 5000,
            notifications: true,
          },
        });
        this.logger.debug(`Created new session: ${sessionId}`);
      } else {
        const session = this.sessions.get(sessionId)!;
        session.lastActivity = new Date();
      }

      next();
    };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): WebSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session preferences
   */
  updateSessionPreferences(
    sessionId: string,
    preferences: Partial<WebSession['preferences']>
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.preferences = { ...session.preferences, ...preferences };
      this.logger.debug(`Updated preferences for session: ${sessionId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): WebSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions) {
      const age = now.getTime() - session.lastActivity.getTime();
      if (age > maxAgeMs) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info(`Cleaned up ${cleanedCount} expired sessions`);
    }

    return cleanedCount;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session statistics
   */
  getStats(): {
    total: number;
    active: number;
    averageAge: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const now = new Date();

    const ages = sessions.map((s) => now.getTime() - s.createdAt.getTime());
    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

    return {
      total: sessions.length,
      active: sessions.length, // All sessions in memory are considered active
      averageAge,
    };
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}
