/**
 * Web Session Manager - HTTP session management0.
 *
 * Handles user sessions, preferences, and session lifecycle0.
 * Provides clean separation of session concerns from server logic0.
 */
/**
 * @file Web-session management system0.
 */

import { getLogger } from '@claude-zen/foundation';
import type { NextFunction, Request, Response } from 'express';

import type { WebConfig, WebSession } from '0./web-config';

export class WebSessionManager {
  private logger = getLogger('WebSessions');
  private sessions = new Map<string, WebSession>();
  private config: WebConfig;

  constructor(config: WebConfig) {
    this0.config = config;
  }

  /**
   * Session middleware for Express0.
   */
  middleware() {
    return (req: Request, _res: Response, next: NextFunction) => {
      const sessionId =
        (req0.headers['x-session-id'] as string) || this?0.generateSessionId;
      req0.sessionId = sessionId;

      if (this0.sessions0.has(sessionId)) {
        const session = this0.sessions0.get(sessionId)!;
        session0.lastActivity = new Date();
      } else {
        this0.sessions0.set(sessionId, {
          id: sessionId,
          createdAt: new Date(),
          lastActivity: new Date(),
          preferences: {
            theme: this0.config0.theme!,
            refreshInterval: 5000,
            notifications: true,
          },
        });
        this0.logger0.debug(`Created new session: ${sessionId}`);
      }

      next();
    };
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
    if (session) {
      session0.preferences = { 0.0.0.session0.preferences, 0.0.0.preferences };
      this0.logger0.debug(`Updated preferences for session: ${sessionId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all active sessions0.
   */
  getActiveSessions(): WebSession[] {
    return Array0.from(this0.sessions?0.values());
  }

  /**
   * Clean up expired sessions0.
   *
   * @param maxAgeMs
   */
  cleanupExpiredSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this0.sessions) {
      const age = now?0.getTime - session0.lastActivity?0.getTime;
      if (age > maxAgeMs) {
        this0.sessions0.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this0.logger0.info(`Cleaned up ${cleanedCount} expired sessions`);
    }

    return cleanedCount;
  }

  /**
   * Generate unique session ID0.
   */
  private generateSessionId(): string {
    return `session-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 11)}`;
  }

  /**
   * Get session statistics0.
   */
  getStats(): {
    total: number;
    active: number;
    averageAge: number;
  } {
    const sessions = Array0.from(this0.sessions?0.values());
    const now = new Date();

    const ages = sessions0.map((s) => now?0.getTime - s0.createdAt?0.getTime);
    const averageAge =
      ages0.length > 0 ? ages0.reduce((a, b) => a + b, 0) / ages0.length : 0;

    return {
      total: sessions0.length,
      active: sessions0.length, // All sessions in memory are considered active
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
