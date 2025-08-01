/**
 * MCP Interface Module
 * 
 * Exports MCP (Model Context Protocol) interface components for Claude Desktop integration.
 * 
 * This module provides HTTP MCP server functionality for Claude Desktop on port 3000,
 * separate from the swarm stdio MCP server used for swarm coordination.
 */

// HTTP MCP Server (for Claude Desktop)
export * from './http-mcp-server.js';
export * from './tool-registry.js';
export * from './request-handler.js';
export * from './start-server.js';

// Legacy interface (deprecated)
export * from './mcp-interface.js';

// Default export
export { HTTPMCPServer as default } from './http-mcp-server.js';