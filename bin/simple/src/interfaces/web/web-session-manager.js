import { getLogger } from '../../config/logging-config.ts';
export class WebSessionManager {
    logger = getLogger('WebSessions');
    sessions = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    middleware() {
        return (req, _res, next) => {
            const sessionId = req.headers['x-session-id'] || this.generateSessionId();
            req.sessionId = sessionId;
            if (this.sessions.has(sessionId)) {
                const session = this.sessions.get(sessionId);
                session.lastActivity = new Date();
            }
            else {
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
            next();
        };
    }
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    updateSessionPreferences(sessionId, preferences) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.preferences = { ...session.preferences, ...preferences };
            this.logger.debug(`Updated preferences for session: ${sessionId}`);
            return true;
        }
        return false;
    }
    getActiveSessions() {
        return Array.from(this.sessions.values());
    }
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
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    getStats() {
        const sessions = Array.from(this.sessions.values());
        const now = new Date();
        const ages = sessions.map((s) => now.getTime() - s.createdAt.getTime());
        const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
        return {
            total: sessions.length,
            active: sessions.length,
            averageAge,
        };
    }
}
//# sourceMappingURL=web-session-manager.js.map