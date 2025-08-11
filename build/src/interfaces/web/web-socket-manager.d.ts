/**
 * WebSocket Manager - Real-time communication system.
 *
 * Handles WebSocket connections, real-time data broadcasting,
 * and client event management for the web dashboard.
 */
/**
 * @file Web-socket management system.
 */
import type { Server as SocketIOServer } from 'socket.io';
import type { WebConfig } from './web-config.ts';
import type { WebDataService } from './web-data-service.ts';
export interface BroadcastData {
    event: string;
    data: any;
    timestamp: string;
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
     *
     * @param socket
     * @param channel
     */
    private sendChannelData;
    /**
     * Start broadcasting real-time data updates.
     */
    private startDataBroadcast;
    /**
     * Broadcast message to all connected clients.
     *
     * @param event
     * @param data
     */
    broadcast(event: string, data: any): void;
    /**
     * Broadcast to specific room/channel.
     *
     * @param room
     * @param event
     * @param data
     */
    broadcastToRoom(room: string, event: string, data: any): void;
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
     * Shutdown WebSocket manager.
     */
    shutdown(): void;
}
//# sourceMappingURL=web-socket-manager.d.ts.map