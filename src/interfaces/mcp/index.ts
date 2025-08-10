/**
 * MCP Interface Module.
 *
 * Exports MCP (Model Context Protocol) interface components for Claude Desktop integration.
 *
 * This module provides HTTP MCP server functionality for Claude Desktop on port 3000,
 * separate from the swarm stdio MCP server used for swarm coordination.
 */

// HTTP MCP Server (for Claude Desktop)
/**
 * @file Mcp module exports.
 */

export * from './http-mcp-server';
// Default export
export { HTTPMCPServer as default } from './http-mcp-server';
// Legacy interface (deprecated)
export * from './mcp-interface';
export * from './mcp-logger';
export * from './request-handler';
export * from './start-server';
export * from './tool-registry';
export * from './validate-external-config';
