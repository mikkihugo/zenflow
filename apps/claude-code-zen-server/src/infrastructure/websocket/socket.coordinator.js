/**
 * WebSocket Coordinator - Real-time updates and broadcasting.
 *
 * Handles WebSocket connections, sessions, and real-time data broadcasting.
 * For the web dashboard interface.
 */
const { getLogger } = global.foundation;
/**
 * Manages WebSocket connections and real-time updates.
 */
export class WebSocketCoordinator {
    config;
    logger = getLogger('WebSocketCoordinator');
    sessions = new Map();
    io;
    constructor(io, config = {}) {
        this.config = config;
        this.io = io;
        this.setupWebSocket();
    }
    /**
     * Setup WebSocket connection handlers.
     */
    setupWebSocket() {
        this.io.on('connection', (socket) => {
            this.logger.info(`WebSocket client connected: ${socket.id}`);
            // Create session
            const session = {
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
                    session.preferences = {
                        ...session.preferences,
                        ...data,
                    };
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
     * Broadcast message to all connected clients.
     */
    broadcast(event, data) {
        if (!this.config.realTime)
            return;
        this.io.emit(event, {
            ...data,
            timestamp: new Date().toISOString(),
        });
        this.logger.debug(`Broadcasted event: ${event}`, data);
    }
    /**
     * Send message to specific session.
     */
    sendToSession(sessionId, event, data) {
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
     * Get active sessions.
     */
    getSessions() {
        return Array.from(this.sessions.values());
    }
    /**
     * Get session by ID.
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Update session preferences.
     */
    updateSessionPreferences(sessionId, preferences) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }
        session.preferences = {
            ...session.preferences,
            ...preferences,
        };
        session.lastActivity = new Date();
        this.logger.debug(`Session preferences updated: ${sessionId}`, preferences);
        return true;
    }
    /**
     * Clean up expired sessions.
     */
    cleanupSessions(maxAge = 24 * 60 * 60 * 1000) {
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
     * Get connection statistics.
     */
    getStats() {
        const now = new Date();
        const sessions = Array.from(this.sessions.values());
        const totalSessions = sessions.length;
        const activeSessions = sessions.filter((s) => {
            const age = now.getTime() - s.lastActivity.getTime();
            return age < 5 * 60 * 1000; // Active within 5 minutes
        }).length;
        const averageSessionAge = totalSessions > 0
            ? sessions.reduce((sum, s) => sum + (now.getTime() - s.createdAt.getTime()), 0) / totalSessions
            : 0;
        return {
            totalSessions,
            activeSessions,
            averageSessionAge,
        };
    }
}
export default WebSocketCoordinator;
