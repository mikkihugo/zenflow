/**
 * Web Session Manager - HTTP session management.
 *
 * Handles user sessions, preferences, and session lifecycle.
 * Provides clean separation of session concerns from server logic.
 */
/**
 * @file Web-session management system.
 */
import { getLogger } from '../../config/logging-config.ts';
export class WebSessionManager {
    logger = getLogger('WebSessions');
    sessions = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Session middleware for Express.
     */
    middleware() {
        return (req, _res, next) => {
            const sessionId = req.headers['x-session-id'] || this.generateSessionId();
            req.sessionId = sessionId;
            if (!this.sessions.has(sessionId)) {
                this.sessions.set(sessionId, {
                    id: sessionId,
                    createdAt: new Date(),
                    lastActivity: new Date(),
                    preferences: {
                        theme: this.config.theme,
                        refreshInterval: 5000,
                        notifications: true,
                    },
                });
                this.logger.debug(`Created new session: ${sessionId}`);
            }
            else {
                const session = this.sessions.get(sessionId);
                session.lastActivity = new Date();
            }
            next();
        };
    }
    /**
     * Get session by ID.
     *
     * @param sessionId
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Update session preferences.
     *
     * @param sessionId
     * @param preferences
     */
    updateSessionPreferences(sessionId, preferences) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.preferences = { ...session.preferences, ...preferences };
            this.logger.debug(`Updated preferences for session: ${sessionId}`);
            return true;
        }
        return false;
    }
    /**
     * Get all active sessions.
     */
    getActiveSessions() {
        return Array.from(this.sessions.values());
    }
    /**
     * Clean up expired sessions.
     *
     * @param maxAgeMs
     */
    cleanupExpiredSessions(maxAgeMs = 24 * 60 * 60 * 1000) {
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
     * Generate unique session ID.
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * Get session statistics.
     */
    getStats() {
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
