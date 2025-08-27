/**
 * Web Session Manager - HTTP session management.
 *
 * Handles user sessions, preferences, and session lifecycle.
 * Provides clean separation of session concerns from server logic.
 */
import type { NextFunction, Request, Response } from 'express';
import type { WebConfig } from '../config/server/server.config';
export interface WebSession {
    id: string;
    createdAt: Date;
    lastActivity: Date;
    preferences: {
        theme: string;
        refreshInterval: number;
        notifications: boolean;
    };
}
export declare class WebSessionManager {
    private logger;
    private sessions;
    private config;
    constructor(config: WebConfig);
    /**
     * Session middleware for Express.
     */
    middleware(): (req: Request, unusedRes: Response, next: NextFunction) => void;
    /**
     * Get session by ID.
     *
     * @param sessionId
     */
    getSession(sessionId: string): WebSession | undefined;
    /**
     * Update session preferences.
     *
     * @param sessionId
     * @param preferences
     */
    updateSessionPreferences(sessionId: string, preferences: Partial<WebSession['preferences']>): boolean;
    /**
     * Get all active sessions.
     */
    getActiveSessions(): WebSession[];
    /**
     * Clean up expired sessions.
     *
     * @param maxAgeMs
     */
    cleanupExpiredSessions(maxAgeMs?: number): number;
    /**
     * Generate unique session ID.
     */
    private generateSessionId;
    /**
     * Get session statistics.
     */
    getStats(): {
        total: number;
        active: number;
        averageAge: number;
    };
}
declare global {
    namespace Express {
        interface Request {
            sessionId?: string;
        }
    }
}
//# sourceMappingURL=session.manager.d.ts.map