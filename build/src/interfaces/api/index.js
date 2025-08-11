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
import { getWebDashboardURL } from '../config/url-builder';
// HTTP API (REST/GraphQL - consolidated from src/api/)
export * from './http/index.ts';
// WebSocket API (real-time communication)
export * from './websocket/index.ts';
// Import WebSocketClient for internal use in this file
import { WebSocketClient } from './websocket/client.ts';
export { WebSocketClient };
// API utilities
export const APIUtils = {
    /**
     * Create WebSocket URL from base URL.
     *
     * @param baseUrl
     */
    createWebSocketUrl: (baseUrl) => {
        return `${baseUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws`;
    },
    /**
     * Validate API configuration.
     *
     * @param config
     */
    validateConfig: (config) => {
        return Boolean(config?.baseUrl || config?.websocketUrl);
    },
    /**
     * Parse API response.
     *
     * @param response
     */
    parseResponse: (response) => {
        if (response && typeof response === 'object') {
            if (response?.error) {
                return { success: false, error: response?.error };
            }
            return { success: true, data: response };
        }
        return { success: true, data: response };
    },
    /**
     * Format API request.
     *
     * @param method
     * @param params
     */
    formatRequest: (method, params = {}) => {
        return {
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now(),
        };
    },
};
// API client factory
export class APIClientFactory {
    static instances = new Map();
    /**
     * Create or get a WebSocket client instance.
     *
     * @param url
     * @param instanceKey
     */
    static getWebSocketClient(url, instanceKey = 'default') {
        const key = `ws:${instanceKey}`;
        if (!APIClientFactory.instances.has(key)) {
            const client = new WebSocketClient(url);
            APIClientFactory.instances.set(key, client);
        }
        return APIClientFactory.instances.get(key);
    }
    /**
     * Clear all cached instances.
     */
    static clearInstances() {
        for (const [, client] of APIClientFactory.instances) {
            client.disconnect();
        }
        APIClientFactory.instances.clear();
    }
    /**
     * Get all active instances.
     */
    static getActiveInstances() {
        return Array.from(APIClientFactory.instances.keys());
    }
}
// Default configuration
export const DEFAULT_API_CONFIG = {
    baseUrl: getWebDashboardURL(),
    websocketUrl: `${getWebDashboardURL({ protocol: 'ws' }).replace(/^https?/, 'ws')}/ws`,
    timeout: 5000,
    retries: 3,
    reconnect: true,
};
