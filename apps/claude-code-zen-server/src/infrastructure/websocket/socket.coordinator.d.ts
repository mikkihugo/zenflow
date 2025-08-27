/**
 * WebSocket Coordinator - Real-time updates and broadcasting.
 *
 * Handles WebSocket connections, sessions, and real-time data broadcasting.
 * For the web dashboard interface.
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
     */
    broadcast(event: string, data: unknown): void;
    /**
     * Send message to specific session.
     */
    sendToSession(sessionId: string, event: string, data: unknown): boolean;
    /**
     * Get active sessions.
     */
    getSessions(): WebSession[];
    /**
     * Get session by ID.
     */
    getSession(sessionId: string): WebSession | undefined;
    /**
     * Update session preferences.
     */
    updateSessionPreferences(sessionId: string, preferences: Partial<WebSession['preferences']>): boolean;
    /**
     * Clean up expired sessions.
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
//# sourceMappingURL=socket.coordinator.d.ts.map