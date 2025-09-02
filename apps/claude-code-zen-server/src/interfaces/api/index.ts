/**
 * API Interface Module.
 *
 * Unified API interface providing multiple communication protocols:
 * - HTTP API (REST/GraphQL server + client)
 * - WebSocket API (real-time communication)
 * - Unified configuration and utilities.
 *
 * Architecture:Protocol-based organization, not implementation-based.
 */

/**
 * @file Api module exports.
 */

// Direct package imports - no facades

// Utility function to replace facade
function getWebDashboardURL(options?: { protocol?: string }): string {
  const protocol = options?.protocol || 'http';
  return `${protocol  }://localhost:3002`;
}

// Import WebSocketClient for internal use in this file
import { WebSocketClient } from './websocket/client';

// HTTP API removed - using WebSocket-only architecture

// WebSocket API (real-time communication)
export * from './websocket/index';
export { WebSocketClient };

// API interface configuration
export interface APIInterfaceConfig {
  baseUrl?: string;
  websocketUrl?: string;
  timeout?: number;
  retries?: number;
  reconnect?: boolean;
}

// API utilities
export const apiUtils = {
  /**
   * Create WebSocket URL from base URL.
   *
   * @param baseUrl - The base HTTP URL to convert
   * @returns WebSocket URL
   */
  createWebSocketUrl: (baseUrl: string): string =>
    `${baseUrl.replace(/^http/, 'ws').replace(/\/$/, '')  }/ws`,

  /**
   * Validate API configuration.
   *
   * @param config - API configuration to validate
   * @returns True if configuration is valid
   */
  validateConfig: (config: APIInterfaceConfig): boolean =>
    Boolean(config?.baseUrl || config?.websocketUrl),

  /**
   * Parse API response.
   *
   * @param response - Raw API response
   * @returns Parsed response with success/error status
   */
  parseResponse: (
    response: unknown
  ): { success: boolean; data?: unknown; error?: string } => {
    if (response && typeof response === 'object') {
      const resp = response as { error?: string; data?: unknown };
      if (resp.error) {
        return {
          success: false,
          error: resp.error,
        };
      }
      return {
        success: true,
        data: response,
      };
    }
    return {
      success: true,
      data: response,
    };
  },

  /**
   * Format API request.
   *
   * @param method - API method name
   * @param params - Request parameters
   * @returns Formatted JSON-RPC request
   */
  formatRequest: (method: string, params: unknown = {}): unknown => ({
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
  }),
};

// API client factory
export class APIClientFactory {
  private static instances = new Map<string, WebSocketClient>();

  /**
   * Create or get a WebSocket client instance.
   *
   * @param url - WebSocket URL
   * @param instanceKey - Unique key for the instance
   * @returns WebSocket client instance
   */
  static getWebSocketClient(
    url: string,
    instanceKey = 'default'
  ): WebSocketClient {
    const key = `ws:${  instanceKey}`;
    if (!APIClientFactory.instances.has(key)) {
      const client = new WebSocketClient(url);
      APIClientFactory.instances.set(key, client);
    }
    return APIClientFactory.instances.get(key)!;
  }

  /**
   * Clear all cached instances.
   */
  static clearInstances(): void {
    for (const [, client] of APIClientFactory.instances) {
      client?.disconnect?.();
    }
    APIClientFactory.instances.clear();
  }

  /**
   * Get all active instances.
   *
   * @returns Array of instance keys
   */
  static getActiveInstances(): string[] {
    return Array.from(APIClientFactory.instances.keys());
  }
}

// Default configuration
export const DEFAULT_API_CONFIG: APIInterfaceConfig = {
  baseUrl: getWebDashboardURL(),
  websocketUrl: `${getWebDashboardURL({ protocol: 'ws' }).replace(/^https?/, 'ws')  }/ws`,
  timeout: 5000,
  retries: 3,
  reconnect: true,
};
