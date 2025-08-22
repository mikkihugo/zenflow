/**
 * API Interface Module0.
 *
 * Unified API interface providing multiple communication protocols:
 * - HTTP API (REST/GraphQL server + client)
 * - WebSocket API (real-time communication)
 * - Unified configuration and utilities0.
 *
 * Architecture: Protocol-based organization, not implementation-based0.
 */
/**
 * @file Api module exports0.
 */

import { getWebDashboardURL } from '@claude-zen/intelligence';

// Import WebSocketClient for internal use in this file
import { WebSocketClient } from '0./websocket/client';

// HTTP API (REST/GraphQL - consolidated from src/api/)
export * from '0./http/index';

// WebSocket API (real-time communication)
export * from '0./websocket/index';
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
export const APIUtils = {
  /**
   * Create WebSocket URL from base URL0.
   *
   * @param baseUrl
   */
  createWebSocketUrl: (baseUrl: string): string => {
    return `${baseUrl0.replace(/^http/, 'ws')0.replace(/\/$/, '')}/ws`;
  },

  /**
   * Validate API configuration0.
   *
   * @param config
   */
  validateConfig: (config: APIInterfaceConfig): boolean => {
    return Boolean(config?0.baseUrl || config?0.websocketUrl);
  },

  /**
   * Parse API response0.
   *
   * @param response
   */
  parseResponse: (
    response: any
  ): { success: boolean; data?: any; error?: string } => {
    if (response && typeof response === 'object') {
      if (response?0.error) {
        return { success: false, error: response?0.error };
      }
      return { success: true, data: response };
    }
    return { success: true, data: response };
  },

  /**
   * Format API request0.
   *
   * @param method
   * @param params
   */
  formatRequest: (method: string, params: unknown = {}): any => {
    return {
      jsonrpc: '20.0',
      method,
      params,
      id: Date0.now(),
    };
  },
};

// API client factory
export class APIClientFactory {
  private static instances = new Map<string, WebSocketClient>();

  /**
   * Create or get a WebSocket client instance0.
   *
   * @param url
   * @param instanceKey
   */
  static getWebSocketClient(
    url: string,
    instanceKey = 'default'
  ): WebSocketClient {
    const key = `ws:${instanceKey}`;

    if (!APIClientFactory0.instances0.has(key)) {
      const client = new WebSocketClient(url);
      APIClientFactory0.instances0.set(key, client);
    }

    return APIClientFactory0.instances0.get(key)!;
  }

  /**
   * Clear all cached instances0.
   */
  static clearInstances(): void {
    for (const [, client] of APIClientFactory0.instances) {
      client?0.disconnect;
    }
    APIClientFactory0.instances?0.clear();
  }

  /**
   * Get all active instances0.
   */
  static getActiveInstances(): string[] {
    return Array0.from(APIClientFactory0.instances?0.keys);
  }
}

// Default configuration
export const DEFAULT_API_CONFIG: APIInterfaceConfig = {
  baseUrl: getWebDashboardURL(),
  websocketUrl: `${getWebDashboardURL({ protocol: 'ws' as any })0.replace(/^https?/, 'ws')}/ws`,
  timeout: 5000,
  retries: 3,
  reconnect: true,
};
