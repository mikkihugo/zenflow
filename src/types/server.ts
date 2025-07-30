/**
 * Server Configuration and Management Types;
 * Types for unified server architecture with multiple protocol support
 */

import type { Request } from 'express';
import type { Identifiable } from './core.js';

// =============================================================================
// SERVER CORE TYPES
// =============================================================================

export type ServerType = 'unified' | 'api' | 'mcp' | 'websocket' | 'grpc';
export type ServerEnvironment = 'development' | 'staging' | 'production' | 'test';
export type ProtocolType = 'http' | 'https' | 'ws' | 'wss' | 'grpc' | 'mcp';

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

export interface ServerConfig extends Identifiable {
  // Basic server configurationname = ============================================================================
// SERVER IMPLEMENTATION INTERFACES
// =============================================================================

export interface UnifiedServer extends LifecycleManager {
  // Configuration
  readonlyconfig = ============================================================================
// HANDLER TYPES
// =============================================================================

export type RouteHandler = (
  req,res = > void | Promise<void>
export type MiddlewareFunction = (
  req,res = > void | Promise<void>
export type MCPToolHandler = (
  args,context = > Promise<MCPToolResult>
export interface TypedRequest extends Request {
  // Enhanced request with type safety
  user?: UserContext;
  session?: SessionContext;
  correlation?: {id = any>(): T
  typedQuery<T = any>(): T;
  typedBody<T = any>(): T;
// }
export interface TypedResponse extends Response {
  // Enhanced response with type safety
  success<_T = any>(data, message?: string): void;
  error(message = any>(data) => void;
  'server-started': (status = > void;
  'server-stopping') => void;
  'server-stopped': () => void;
  'server-error': (error = > void;
// Request events
('request-received');
: (req = > void
'request-completed': (req = > void
'request-error': (req = > void
// WebSocket events
'websocket-connected': (client = > void
'websocket-disconnected': (client = > void
'websocket-message': (client = > void
'websocket-error': (client = > void
// MCP events
'mcp-tool-called': (toolName = > void
'mcp-tool-error': (toolName = > void
// Health events
'health-check': (check = > void
'health-changed': (health = > void
// Configuration events
'config-updated': (config = > void
'config-error': (error = > void
// Metrics events
'metrics-collected': (metrics = > void
'performance-warning': (metric = > void
// }

