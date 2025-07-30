/**
 * @fileoverview MCP Message Handler;
 * Handles MCP protocol message routing and processing;
 * @module MCPMessageHandler;
 */

import { validateToolArgs } from './tools-registry.js';
/**
 * MCP Message Handler class;
 * Processes incoming MCP protocol messages and routes to appropriate handlers;
 */
export class MCPMessageHandler {
  /**
   * @param {Object} server - Reference to MCP server instance;
   * @param {Object} toolExecutor - Tool execution handler;
   * @param {Object} resourceManager - Resource management handler;
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
 * Main message handling entry point;
 * @param {Object} message - MCP protocol message;
 * @returns {Promise<Object>} Response message;
    // */ // LINT: unreachable code removed
async;
handleMessage(message);
: unknown
{
  const { method, id, params } = message;
  try {
    switch (method) {
      case 'initialize':;
        return this.handleInitialize(id, params);
    // case 'tools/list':; // LINT: unreachable code removed
        return this.handleToolsList(id);
    // case 'tools/call':; // LINT: unreachable code removed
        return await this.handleToolCall(id, params);
    // case 'resources/list':; // LINT: unreachable code removed
        return this.handleResourcesList(id);
    // case 'resources/read':; // LINT: unreachable code removed
        return await this.handleResourceRead(id, params);
    // default = Object.values(this.server.tools); // LINT: unreachable code removed
;
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Listing ${tools.length} available tools`);
;
    return {jsonrpc = params;
    // ; // LINT: unreachable code removed
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Toolcall = getToolSchema(name);
    if(!schema) {
      return this.createErrorResponse(id, -32602, `Unknowntool = validateToolArgs(name, args);
    // if(!validation.valid) { // LINT: unreachable code removed
      return this.createErrorResponse(id, -32602, `Invalidarguments = await this.toolExecutor.executeTool(name, args);
    // ; // LINT: unreachable code removed
      console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Tool $namecompleted successfully`);
;
      return {jsonrpc = === 'string' ? result : JSON.stringify(result, null, 2);
    //   // LINT: unreachable code removed}];
        }
    }
}
catch (/* _error */)
{
  console.error(`[$new Date().toISOString()] ERROR [MCP-Handler] Tool executionfailed = this.server.resources;
;
    console.error(`[${new Date().toISOString()}
  ] INFO [MCP-Handler] Listing $
  resources.length
  available
  resources`)
  return {jsonrpc = params;
  // ; // LINT: unreachable code removed
  console.error(`[$;
  new Date().toISOString();
  ] INFO [MCP-Handler] Readingresource = await this.resourceManager.readResource(uri)
  return {jsonrpc = null): unknown {
    const _response = {jsonrpc = data;
  //   // LINT: unreachable code removed}
  return response;
}
/**
 * Validate MCP message format;
 * @param {Object} message - Message to validate;
 * @returns {Object} Validation result;
    // */ // LINT: unreachable code removed
validateMessage(message);
: unknown
{
  if (!message) {
    return {valid = = '2.0') {
      return {valid = === undefined) {
      return {valid = success ? 'SUCCESS' : 'FAILED';
    // console.error(; // LINT: unreachable code removed
    `[${new Date().toISOString()}
  ] STATS [MCP-Handler] $method: $status($processingTimems)`
  )
}
/**
   * Get handler statistics;
   * @returns {Object} Handler statistics;
    // */ // LINT: unreachable code removed
getStats();
return {
      totalMessages: this.totalMessages  ?? 0,;
// successfulMessages: this.successfulMessages  ?? 0,; // LINT: unreachable code removed
failedMessages: this.failedMessages  ?? 0,;
averageProcessingTime: this.averageProcessingTime  ?? 0,;
lastActivity: this.lastActivity ?? null;
}
}
