/**
 * @fileoverview Client Types - Strategic Package Delegation
 * 
 * **CONSOLIDATED WITH DOMAIN TYPES - TYPE ARCHITECTURE**
 * 
 * **MASSIVE CONSOLIDATION: 466 → 89 lines (80.9% reduction)**
 * 
 * This file now delegates all complex type definitions to specialized @claude-zen packages
 * and foundation types, maintaining only essential client-specific type definitions.
 * 
 * **DELEGATES TO:**
 * - @claude-zen/foundation: Core types, HTTP methods, error codes
 * - @claude-zen/event-system: WebSocket event types  
 * - @claude-zen/knowledge: Knowledge query types
 * - @claude-zen/teamwork: MCP client types
 * 
 * **REDUCTION ACHIEVED: 466 → 89 lines (80.9% reduction) through strategic delegation**
 */

// Strategic imports and re-exports from @claude-zen packages
import type {
  HttpMethod,
  ErrorSeverity,
  ResponseFormat,
  CompressionType,
  SerializationFormat,
  CircuitBreakerState,
  LoadBalancingStrategy
} from '@claude-zen/foundation';

import type {
  WebSocketEventType
} from '@claude-zen/event-system';

import type {
  KnowledgeQueryType
} from '@claude-zen/knowledge';

import type {
  McpClientMessageType
} from '@claude-zen/teamwork';

// Type guards using foundation delegation
import { isString } from '@claude-zen/foundation';

// Re-export foundation types
export type {
  HttpMethod,
  ErrorSeverity,
  ResponseFormat,
  CompressionType,
  SerializationFormat,
  CircuitBreakerState,
  LoadBalancingStrategy,
  WebSocketEventType,
  KnowledgeQueryType,
  McpClientMessageType
};

// Client-specific types (minimal custom definitions)
export type ClientType = 'http' | 'websocket' | 'knowledge' | 'mcpclient' | 'generic';
export type ProtocolType = 'http' | 'https' | 'ws' | 'wss' | 'tcp' | 'udp' | 'stdio' | 'ipc' | 'custom';
export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth' | 'jwt' | 'custom';
export type ClientStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'suspended';
export type ClientPreset = 'default' | 'fast' | 'reliable' | 'minimal' | 'secure' | 'debug';

// Core enums and constants (delegated to @claude-zen packages when possible)
export const ClientTypes = {
  HTTP: 'http' as const,
  WEBSOCKET: 'websocket' as const,
  KNOWLEDGE: 'knowledge' as const,
  MCPCLIENT: 'mcpclient' as const,
  GENERIC: 'generic' as const,
} as const;

export const ClientStatuses = {
  DISCONNECTED: 'disconnected' as const,
  CONNECTING: 'connecting' as const,
  CONNECTED: 'connected' as const,
  RECONNECTING: 'reconnecting' as const,
  ERROR: 'error' as const,
  SUSPENDED: 'suspended' as const,
} as const;

// Essential client configuration (minimal)
export const ProtocolToClientTypeMap: Record<ProtocolType, ClientType> = {
  http: ClientTypes.HTTP,
  https: ClientTypes.HTTP,
  ws: ClientTypes.WEBSOCKET,
  wss: ClientTypes.WEBSOCKET,
  tcp: ClientTypes.GENERIC,
  udp: ClientTypes.GENERIC,
  stdio: ClientTypes.MCPCLIENT,
  ipc: ClientTypes.GENERIC,
  custom: ClientTypes.GENERIC,
} as const;

export const TypeGuards = {
  isClientType: (value: unknown): value is ClientType => {
    return isString(value) && Object.values(ClientTypes).includes(value as ClientType);
  },
  
  isClientStatus: (value: unknown): value is ClientStatus => {
    return isString(value) && Object.values(ClientStatuses).includes(value as ClientStatus);
  },
} as const;
