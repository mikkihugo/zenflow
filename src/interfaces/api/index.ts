/**
 * API Interface Module
 *
 * Unified API interface providing multiple communication protocols:
 * - HTTP API (REST/GraphQL server + client)
 * - WebSocket API (real-time communication)
 * - Unified configuration and utilities
 *
 * Architecture: Protocol-based organization, not implementation-based
 */

// HTTP API (REST/GraphQL - consolidated from src/api/)
export * from './http/index.js';

// WebSocket API (real-time communication)
export * from './websocket/index.js';
export { default as WebSocketClient } from './websocket/index.js';

// API interface configuration
export interface APIInterfaceConfig {
  baseUrl?: string;
  websocketUrl?: string;
  timeout?: number;
  retries?: number;
  reconnect?: boolean;
}

// API utilities
export const APIUtils = {
  /**
   * Create WebSocket URL from base URL
   */
  createWebSocketUrl: (baseUrl: string): string => {
    return baseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/ws';
  },

  /**
   * Validate API configuration
   */
  validateConfig: (config: APIInterfaceConfig): boolean => {
    return Boolean(config.baseUrl || config.websocketUrl);
  },

  /**
   * Parse API response
   */
  parseResponse: (response: any): { success: boolean; data?: any; error?: string } => {
    if (response && typeof response === 'object') {
      if (response.error) {
        return { success: false, error: response.error };
      }
      return { success: true, data: response };
    }
    return { success: true, data: response };
  },

  /**
   * Format API request
   */
  formatRequest: (method: string, params: any = {}): any => {
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
  private static instances = new Map<string, WebSocketClient>();

  /**
   * Create or get a WebSocket client instance
   */
  static getWebSocketClient(url: string, instanceKey = 'default'): WebSocketClient {
    const key = `ws:${instanceKey}`;

    if (!APIClientFactory.instances.has(key)) {
      const client = new WebSocketClient(url);
      APIClientFactory.instances.set(key, client);
    }

    return APIClientFactory.instances.get(key)!;
  }

  /**
   * Clear all cached instances
   */
  static clearInstances(): void {
    for (const [, client] of APIClientFactory.instances) {
      client.disconnect();
    }
    APIClientFactory.instances.clear();
  }

  /**
   * Get all active instances
   */
  static getActiveInstances(): string[] {
    return Array.from(APIClientFactory.instances.keys());
  }
}

// Default configuration
export const DEFAULT_API_CONFIG: APIInterfaceConfig = {
  baseUrl: 'http://localhost:3456',
  websocketUrl: 'ws://localhost:3456/ws',
  timeout: 5000,
  retries: 3,
  reconnect: true,
};
