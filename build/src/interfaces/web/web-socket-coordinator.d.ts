/**
 * WebSocket Coordinator - Real-time updates and broadcasting.
 *
 * Handles WebSocket connections, sessions, and real-time data broadcasting.
 * For the web dashboard interface.
 */
/**
 * @file Web-socket coordination system.
 */
import type { Server as SocketIOServer } from 'socket.io';
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
 * Manages WebSocket connections and real-time updates.
 *
 * @example
 */
export declare class WebSocketCoordinator {
    private config;
    private logger;
    private sessions;
    private io;
    constructor(io: SocketIOServer, config?: WebSocketConfig);
    /**
     * Setup WebSocket connection handlers.
     */
    private setupWebSocket;
    /**
     * Broadcast message to all connected clients.
     *
     * @param event
     * @param data
     */
    broadcast(event: string, data: any): void;
    /**
     * Send message to specific session.
     *
     * @param sessionId
     * @param event
     * @param data
     */
    sendToSession(sessionId: string, event: string, data: any): boolean;
    /**
     * Get active sessions.
     */
    getSessions(): WebSession[];
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
     * Clean up expired sessions.
     *
     * @param maxAge
     */
    cleanupSessions(maxAge?: number): number;
    /**
     * Get connection statistics.
     */
    getStats(): {
        totalSessions: number;
        activeSessions: number;
        averageSessionAge: number;
    };
}
export default WebSocketCoordinator;
//# sourceMappingURL=web-socket-coordinator.d.ts.map