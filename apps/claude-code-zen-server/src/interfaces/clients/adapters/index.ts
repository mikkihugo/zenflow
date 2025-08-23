/**
 * UACL Client Adapters.
 *
 * Adapters that convert existing clients to UACL interface compliance.
 * Provides unified client management and interoperability across the system.
 *
 * @file Client adapters module exports.
 * @module interfaces/clients/adapters
 * @version 2.0.0
 */

// Core base adapter and interfaces
export * from './base-client-adapter';
export * from './core/interfaces';

// HTTP client adapter
export * from './http-client-adapter';
export * from './http-types';

// Knowledge client adapter
export * from './knowledge-client-adapter';

// MCP client adapter
export * from './mcp-client-adapter';

// Type re-exports for convenience
export type {
  ClientAdapter,
  ClientAdapterFactory,
  ClientResult,
  ClientHealth,
  ClientComponentHealth

} from './base-client-adapter';

export type {
  HTTPClientConfig,
  HTTPAuthenticationConfig,
  HTTPRetryConfig,
  HTTPRequestOptions,
  HTTPResponse,
  HTTPErrorDetails,
  HTTPClientCapabilities,
  OAuthCredentials

} from './http-types';