/**
 * API Interface Module.
 *
 * Unified API interface providing multiple communication protocols:
 * - HTTP API (REST/GraphQL server + client)
 * - WebSocket API (real-time communication)
 * - Unified configuration and utilities.
 *
 * Architecture: Protocol-based organization, not implementation-based.
 */
/**
 * @file Api module exports.
 */
export * from './http/index.ts';
export * from './websocket/index.ts';
import { WebSocketClient } from './websocket/client.ts';
export { WebSocketClient };
export interface APIInterfaceConfig {
    baseUrl?: string;
    websocketUrl?: string;
    timeout?: number;
    retries?: number;
    reconnect?: boolean;
}
export declare const APIUtils: {
    /**
     * Create WebSocket URL from base URL.
     *
     * @param baseUrl
     */
    createWebSocketUrl: (baseUrl: string) => string;
    /**
     * Validate API configuration.
     *
     * @param config
     */
    validateConfig: (config: APIInterfaceConfig) => boolean;
    /**
     * Parse API response.
     *
     * @param response
     */
    parseResponse: (response: any) => {
        success: boolean;
        data?: any;
        error?: string;
    };
    /**
     * Format API request.
     *
     * @param method
     * @param params
     */
    formatRequest: (method: string, params?: any) => any;
};
export declare class APIClientFactory {
    private static instances;
    /**
     * Create or get a WebSocket client instance.
     *
     * @param url
     * @param instanceKey
     */
    static getWebSocketClient(url: string, instanceKey?: string): WebSocketClient;
    /**
     * Clear all cached instances.
     */
    static clearInstances(): void;
    /**
     * Get all active instances.
     */
    static getActiveInstances(): string[];
}
export declare const DEFAULT_API_CONFIG: APIInterfaceConfig;
//# sourceMappingURL=index.d.ts.map