/**
 * WebSocket Manager - Real-time communication system.
 *
 * Handles WebSocket connections, real-time data broadcasting,
 * and client event management for the web dashboard.
 */
import type { Server as SocketIOServer } from 'socket.io';
export interface BroadcastData {
    event: string;
    data: unknown;
    timestamp: string;
}
export interface WebConfig {
    realTime?: boolean;
}
export interface WebDataService {
    getSystemStatus(): Promise<Record<string, unknown>>;
    getSwarms(): Promise<unknown[]>;
    getTasks(): Promise<unknown[]>;
    getServiceStats(): Record<string, unknown>;
}
export declare class WebSocketManager {
    private logger;
    private io;
    private config;
    private dataService;
    private broadcastIntervals;
    constructor(io: SocketIOServer, config: WebConfig, dataService: WebDataService);
    /**
     * Setup WebSocket event handlers.
     */
    setupWebSocket(): void;
    /**
     * Send initial data for a specific channel.
     */
    private sendChannelData;
    /**
     * Start broadcasting real-time data updates.
     */
    private startDataBroadcast;
    /**
     * Broadcast message to all connected clients.
     */
    broadcast(event: string, data: unknown): void;
    /**
     * Broadcast to specific room/channel.
     */
    broadcastToRoom(room: string, event: string, data: unknown): void;
    /**
     * Get connected client statistics.
     */
    getConnectionStats(): {
        totalConnections: number;
        connectedClients: string[];
        rooms: string[];
    };
    /**
     * Stop all broadcasting intervals.
     */
    stopBroadcasting(): void;
    /**
     * Setup log broadcaster for real-time log updates.
     */
    private setupLogBroadcaster;
    /**
     * Shutdown WebSocket manager.
     */
    shutdown(): void;
}
//# sourceMappingURL=socket.manager.d.ts.map