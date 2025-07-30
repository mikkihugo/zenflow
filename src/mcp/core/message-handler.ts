/**
 * @fileoverview MCP Message Handler
 * Handles MCP protocol message routing and processing
 * @module MCPMessageHandler
 */

import { validateToolArgs } from './tools-registry.js';

/**
 * MCP Message Handler class
 * Processes incoming MCP protocol messages and routes to appropriate handlers
 */
export class MCPMessageHandler {
  /**
   * @param {Object} server - Reference to MCP server instance
   * @param {Object} toolExecutor - Tool execution handler
   * @param {Object} resourceManager - Resource management handler
   */
  constructor(server = server;
  this;
  .
  toolExecutor = toolExecutor;
  this;
  .
  resourceManager = resourceManager;
}

/**
 * Main message handling entry point
 * @param {Object} message - MCP protocol message
 * @returns {Promise<Object>} Response message
 */
async;
handleMessage(message);
: any
{
  const { method, id, params } = message;

  try {
    switch (method) {
      case 'initialize':
        return this.handleInitialize(id, params);
      case 'tools/list':
        return this.handleToolsList(id);
      case 'tools/call':
        return await this.handleToolCall(id, params);
      case 'resources/list':
        return this.handleResourcesList(id);
      case 'resources/read':
        return await this.handleResourceRead(id, params);
      default = Object.values(this.server.tools);
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Listing ${tools.length} available tools`);
    
    return {jsonrpc = params;
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Toolcall = getToolSchema(name);
    if(!schema) {
      return this.createErrorResponse(id, -32602, `Unknowntool = validateToolArgs(name, args);
    if(!validation.valid) {
      return this.createErrorResponse(id, -32602, `Invalidarguments = await this.toolExecutor.executeTool(name, args);
      
      console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Tool $namecompleted successfully`);
      
      return {jsonrpc = === 'string' ? result : JSON.stringify(result, null, 2)
          }]
        }
    }
  } catch (_error) {
    console.error(`[$new Date().toISOString()] ERROR [MCP-Handler] Tool executionfailed = this.server.resources;
    
    console.error(`[${new Date().toISOString()}
    ] INFO [MCP-Handler] Listing $
      resources.length
    available
    resources`);
    
    return {jsonrpc = params;
    
    console.error(`[$
    new Date().toISOString();
    ] INFO [MCP-Handler] Readingresource = await this.resourceManager.readResource(uri)

    return {jsonrpc = null): any {
    const response = {jsonrpc = data;
  }

  return response;
}

/**
 * Validate MCP message format
 * @param {Object} message - Message to validate
 * @returns {Object} Validation result
 */
validateMessage(message);
: any
{
  if (!message) {
    return {valid = = '2.0') {
      return {valid = === undefined) {
      return {valid = success ? 'SUCCESS' : 'FAILED';
    console.error(
      `[${new Date().toISOString()}] STATS [MCP-Handler] $method: $status($processingTimems)`
    );
  }

  /**
   * Get handler statistics
   * @returns {Object} Handler statistics
   */
  getStats();
  return {
      totalMessages: this.totalMessages || 0,
      successfulMessages: this.successfulMessages || 0,
      failedMessages: this.failedMessages || 0,
      averageProcessingTime: this.averageProcessingTime || 0,
      lastActivity: this.lastActivity || null
    };
}
