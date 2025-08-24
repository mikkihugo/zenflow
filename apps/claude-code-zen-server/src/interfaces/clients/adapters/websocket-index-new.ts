/**
 * WebSocket Client Adapter Index
 * 
 * Central export file for all WebSocket client components in UACL.
 * Provides a clean interface for importing WebSocket functionality.
 */

import { getLogger } from '@claude-zen/foundation';

// Import types for internal use
import type { WebSocketClientConfig } from './websocket-types';

const logger = getLogger('WebSocketIndex');

/**
 * WebSocket Client Adapter Index.
 *
 * Exports all WebSocket client components for UACL integration.
 */

// Re-export core UACL interfaces for convenience
export type {
  ClientConfig,
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  Client,
  ClientFactory,
  RequestOptions
} from '../core/interfaces';

// Re-export WebSocket-specific types
export type {
  WebSocketClientConfig,
  WebSocketConnectionOptions,
  WebSocketMessage,
  WebSocketEventData,
  WebSocketMetrics
} from './websocket-types';

// Re-export WebSocket client implementation
export { WebSocketClientAdapter } from './websocket-client-adapter';
export { default as WebSocketClient } from './websocket-client-adapter';

// Re-export WebSocket client factory
export { WebSocketClientFactory } from './websocket-client-factory';
export { default as WebSocketFactory } from './websocket-client-factory';

// Re-export additional WebSocket utilities if available
export type {
  ProtocolType
} from '../types';

export {
  ProtocolTypes,
  ClientStatuses
} from '../types';

/**
 * Create a WebSocket client adapter with default configuration
 */
export function createWebSocketClient(config: WebSocketClientConfig) {
  const { WebSocketClientAdapter } = require('./websocket-client-adapter');
  return new WebSocketClientAdapter(config);
}

/**
 * Create a WebSocket client factory with default configuration
 */
export function createWebSocketFactory() {
  const { WebSocketClientFactory } = require('./websocket-client-factory');
  return new WebSocketClientFactory();
}

/**
 * Utility function to validate WebSocket URL
 */
export function validateWebSocketUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'ws:' || parsedUrl.protocol === 'wss:';
  } catch {
    return false;
  }
}

/**
 * Utility function to get WebSocket protocol from URL
 */
export function getWebSocketProtocol(url: string): 'ws' | 'wss' | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'ws:') return 'ws';
    if (parsedUrl.protocol === 'wss:') return 'wss';
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if WebSocket is supported in current environment
 */
export function isWebSocketSupported(): boolean {
  if (typeof WebSocket !== 'undefined') {
    return true;
  }
  
  try {
    require('ws');
    return true;
  } catch {
    return false;
  }
}

logger.info('WebSocket client adapter index loaded successfully');

// Default export for convenience
export default {
  WebSocketClientAdapter,
  WebSocketClientFactory,
  createWebSocketClient,
  createWebSocketFactory,
  validateWebSocketUrl,
  getWebSocketProtocol,
  isWebSocketSupported
};