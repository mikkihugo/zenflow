/**
 * MCP Interface Module.
 *
 * Exports MCP (Model Context Protocol) interface components for Claude Desktop integration.
 *
 * This module provides HTTP MCP server functionality for Claude Desktop on port 3000,
 * separate from the swarm stdio MCP server used for swarm coordination.
 */
/**
 * @file Mcp module exports.
 */
export * from './http-mcp-server.ts';
export { HTTPMCPServer as default } from './http-mcp-server.ts';
export * from './mcp-interface.ts';
export * from './mcp-logger.ts';
export * from './request-handler.ts';
export * from './start-server.ts';
export * from './tool-registry.ts';
export * from './validate-external-config.ts';
//# sourceMappingURL=index.d.ts.map