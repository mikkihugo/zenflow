/**
 * Web Session Manager - HTTP session management.
 *
 * Handles user sessions, preferences, and session lifecycle.
 * Provides clean separation of session concerns from server logic.
 */
/**
 * @file Web-session management system.
 */
import type { NextFunction, Request, Response } from 'express';
import type { WebConfig, WebSession } from './web-config';
export declare class WebSessionManager {
    private logger;
    private sessions;
    private config;
    constructor(config: WebConfig);
    /**
     * Session middleware for Express.
     */
    middleware(): (req: Request, _res: Response, next: NextFunction) => void;
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
//# sourceMappingURL=web-session-manager.d.ts.map