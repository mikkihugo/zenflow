/** Node.js 22 Native WebSocket Client Implementation
 * Uses the built-in WebSocket client available in Node.js 22+
 * Provides high-performance, standards-compliant WebSocket connectivity.
 */
/**
 * @file Interface implementation: client.
 */
import { EventEmitter } from 'node:events';
interface WebSocketClientOptions {
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    timeout?: number;
}
/** Native WebSocket Client using Node.js 22 built-in WebSocket.
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Heartbeat/ping-pong support
 * - Connection state management
 * - Error handling and recovery.
 */
export declare class WebSocketClient extends EventEmitter {
    private url;
    private options;
    private ws;
    private messageQueue;
    private reconnectTimer;
    private heartbeatTimer;
    private isConnected;
    private reconnectAttempts;
    constructor(url: string, options?: WebSocketClientOptions);
    /** Connect to WebSocket server */
    connect(): Promise<void>;
    /** Disconnect from WebSocket server */
    disconnect(): void;
    /** Send message to server */
    send(data: any): void;
    /**
     * Queue message for later sending.
     *
     * @param message
     */
    private queueMessage;
    /** Send all queued messages */
    private flushMessageQueue;
    /** Schedule reconnection attempt */
    private scheduleReconnect;
    /** Start heartbeat mechanism */
    private startHeartbeat;
    /** Stop heartbeat mechanism */
    private stopHeartbeat;
    /** Get connection status */
    get connected(): boolean;
    /** Get connection URL */
    get connectionUrl(): string;
    /** Get queued message count */
    get queuedMessages(): number;
}
export default WebSocketClient;
//# sourceMappingURL=client.d.ts.map