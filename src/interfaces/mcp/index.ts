/**
 * MCP Interface Module
 *
 * Exports MCP (Model Context Protocol) interface components for Claude Desktop integration.
 *
 * This module provides HTTP MCP server functionality for Claude Desktop on port 3000,
 * separate from the swarm stdio MCP server used for swarm coordination.
 */

// HTTP MCP Server (for Claude Desktop)
export * from './http-mcp-server.ts';
// Default export
export { HTTPMCPServer as default } from './http-mcp-server.ts';
// Legacy interface (deprecated)
export * from './mcp-interface.ts';
export * from './request-handler.ts';
export * from './start-server.ts';
export * from './tool-registry.ts';
