/**
 * Enhanced WebSocket Client with UACL Integration.
 *
 * Extends the original WebSocket client to implement UACL interface.
 * While maintaining 100% backward compatibility with existing code.
 */
/**
 * @file Interface implementation: enhanced-websocket-client.
 */
import { EventEmitter } from 'node:events';
import type { ClientMetrics, ClientResponse, ClientStatus, IClient, RequestOptions } from '../core/interfaces.ts';
import type { WebSocketClientConfig, WebSocketConnectionInfo, WebSocketMessage, WebSocketMetrics, WebSocketRequestOptions } from './websocket-types.ts';
interface WebSocketClientOptions {
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    timeout?: number;
}
/**
 * Enhanced WebSocket Client implementing both legacy interface and UACL.
 *
 * Maintains 100% backward compatibility with the original WebSocketClient.
 * While adding UACL interface support for unified client management..
 *
 * @example
 */
export declare class EnhancedWebSocketClient extends EventEmitter implements IClient {
    readonly config: WebSocketClientConfig;
    readonly name: string;
    private url;
    private options;
    private ws;
    private messageQueue;
    private reconnectTimer;
    private heartbeatTimer;
    private _isConnected;
    private reconnectAttempts;
    private connectionId;
    private metrics;
    private startTime;
    private connectionInfo;
    /**
     * Constructor supporting both legacy and UACL patterns.
     *
     * @param urlOrConfig
     * @param legacyOptions
     */
    constructor(urlOrConfig: string | WebSocketClientConfig, legacyOptions?: WebSocketClientOptions);
    /**
     * Connect to WebSocket server (UACL interface).
     */
    connect(): Promise<void>;
    /**
     * Disconnect from WebSocket server (UACL interface).
     */
    disconnect(): Promise<void>;
    /**
     * Check if client is connected (UACL interface).
     */
    isConnected(): boolean;
    /**
     * Health check (UACL interface).
     */
    healthCheck(): Promise<ClientStatus>;
    /**
     * Get client metrics (UACL interface).
     */
    getMetrics(): Promise<ClientMetrics>;
    /**
     * Generic GET request (UACL interface).
     *
     * @param endpoint
     * @param options.
     * @param options
     */
    get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Generic POST request (UACL interface).
     *
     * @param endpoint
     * @param data
     * @param options
     */
    post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Generic PUT request (UACL interface).
     *
     * @param endpoint
     * @param data
     * @param options
     */
    put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Generic DELETE request (UACL interface).
     *
     * @param endpoint
     * @param options.
     * @param options
     */
    delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Update client configuration (UACL interface).
     *
     * @param config.
     * @param config
     */
    updateConfig(config: Partial<WebSocketClientConfig>): void;
    /**
     * Event handler registration (UACL interface).
     *
     * @param event
     * @param handler.
     * @param handler
     */
    on(event: 'connect' | 'disconnect' | 'error' | 'retry' | string, handler: (...args: any[]) => void): this;
    /**
     * Event handler removal (UACL interface).
     *
     * @param event
     * @param handler.
     * @param handler
     */
    off(event: string, handler?: (...args: any[]) => void): this;
    /**
     * Cleanup and destroy client (UACL interface).
     */
    destroy(): Promise<void>;
    /**
     * Send message (legacy method - exact same signature as original).
     *
     * @param data.
     * @param data
     */
    send(data: any): void;
    /**
     * Get connection status (legacy property).
     */
    get connected(): boolean;
    /**
     * Get connection URL (legacy property).
     */
    get connectionUrl(): string;
    /**
     * Get queued message count (legacy property).
     */
    get queuedMessages(): number;
    /**
     * Send typed message with enhanced features.
     *
     * @param message
     * @param options
     * @param _options
     */
    sendMessage<T = any>(message: WebSocketMessage<T>, _options?: WebSocketRequestOptions): Promise<void>;
    /**
     * Get connection information.
     */
    getConnectionInfo(): WebSocketConnectionInfo;
    /**
     * Get WebSocket-specific metrics.
     */
    getWebSocketMetrics(): Promise<WebSocketMetrics>;
    /**
     * Get current ready state.
     */
    get readyState(): number;
    private handleMessage;
    private sendRequest;
    private queueMessage;
    private flushMessageQueue;
    private scheduleReconnect;
    private startHeartbeat;
    private stopHeartbeat;
    private isHeartbeatResponse;
    private measurePingTime;
    private calculateErrorRate;
    private generateConnectionId;
    private generateMessageId;
    private initializeMetrics;
    private initializeConnectionInfo;
    private updateMetrics;
    private convertLegacyToUACL;
    private convertUACLToLegacy;
}
export { EnhancedWebSocketClient as WebSocketClient };
export default EnhancedWebSocketClient;
//# sourceMappingURL=enhanced-websocket-client.d.ts.map