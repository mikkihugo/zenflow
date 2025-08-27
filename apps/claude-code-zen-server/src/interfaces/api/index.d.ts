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
import { WebSocketClient } from './websocket/client';
export * from './websocket/index';
export { WebSocketClient };
export interface APIInterfaceConfig {
    baseUrl?: string;
    websocketUrl?: string;
    timeout?: number;
    retries?: number;
    reconnect?: boolean;
}
export declare const apiUtils: {
    /**
     * Create WebSocket URL from base URL.
     *
     * @param baseUrl - The base HTTP URL to convert
     * @returns WebSocket URL
     */
    createWebSocketUrl: (baseUrl: string) => string;
    /**
     * Validate API configuration.
     *
     * @param config - API configuration to validate
     * @returns True if configuration is valid
     */
    validateConfig: (config: APIInterfaceConfig) => boolean;
    /**
     * Parse API response.
     *
     * @param response - Raw API response
     * @returns Parsed response with success/error status
     */
    parseResponse: (response: unknown) => {
        success: boolean;
        data?: unknown;
        error?: string;
    };
    /**
     * Format API request.
     *
     * @param method - API method name
     * @param params - Request parameters
     * @returns Formatted JSON-RPC request
     */
    formatRequest: (method: string, params?: unknown) => unknown;
};
export declare class APIClientFactory {
    private static instances;
    /**
     * Create or get a WebSocket client instance.
     *
     * @param url - WebSocket URL
     * @param instanceKey - Unique key for the instance
     * @returns WebSocket client instance
     */
    static getWebSocketClient(url: string, instanceKey?: string): WebSocketClient;
    /**
     * Clear all cached instances.
     */
    static clearInstances(): void;
    /**
     * Get all active instances.
     *
     * @returns Array of instance keys
     */
    static getActiveInstances(): string[];
}
export declare const DEFAULT_API_CONFIG: APIInterfaceConfig;
//# sourceMappingURL=index.d.ts.map