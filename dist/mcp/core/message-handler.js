/**
 * @fileoverview MCP Message Handler
 * Handles MCP protocol message routing and processing
 * @module MCPMessageHandler
 */

import { getToolSchema, validateToolArgs } from './tools-registry.js';

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
  constructor(server, toolExecutor, resourceManager) {
    this.server = server;
    this.toolExecutor = toolExecutor;
    this.resourceManager = resourceManager;
  }

  /**
   * Main message handling entry point
   * @param {Object} message - MCP protocol message
   * @returns {Promise<Object>} Response message
   */
  async handleMessage(message) {
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
        default:
          return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [MCP-Handler] Message handling failed:`, error);
      return this.createErrorResponse(id, -32603, `Internal error: ${error.message}`);
    }
  }

  /**
   * Handle initialize request
   * @param {string} id - Request ID
   * @param {Object} params - Initialize parameters
   * @returns {Object} Initialize response
   */
  handleInitialize(id, params) {
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Client connected with capabilities:`, 
      JSON.stringify(params?.capabilities || {}, null, 2));

    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: this.server.capabilities,
        serverInfo: {
          name: 'claude-flow-mcp-server',
          version: this.server.version
        }
      }
    };
  }

  /**
   * Handle tools list request
   * @param {string} id - Request ID
   * @returns {Object} Tools list response
   */
  handleToolsList(id) {
    const tools = Object.values(this.server.tools);
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Listing ${tools.length} available tools`);
    
    return {
      jsonrpc: '2.0',
      id,
      result: { tools }
    };
  }

  /**
   * Handle tool call request with validation
   * @param {string} id - Request ID
   * @param {Object} params - Tool call parameters
   * @returns {Promise<Object>} Tool call response
   */
  async handleToolCall(id, params) {
    const { name, arguments: args } = params;
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Tool call: ${name} with args:`, 
      JSON.stringify(args, null, 2));

    // Validate tool exists
    const schema = getToolSchema(name);
    if (!schema) {
      return this.createErrorResponse(id, -32602, `Unknown tool: ${name}`);
    }

    // Validate arguments
    const validation = validateToolArgs(name, args);
    if (!validation.valid) {
      return this.createErrorResponse(id, -32602, `Invalid arguments: ${validation.error}`);
    }

    try {
      // Execute tool
      const result = await this.toolExecutor.executeTool(name, args);
      
      console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Tool ${name} completed successfully`);
      
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }]
        }
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [MCP-Handler] Tool execution failed:`, error);
      return this.createErrorResponse(id, -32603, `Tool execution error: ${error.message}`);
    }
  }

  /**
   * Handle resources list request
   * @param {string} id - Request ID
   * @returns {Object} Resources list response
   */
  handleResourcesList(id) {
    const resources = this.server.resources;
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Listing ${resources.length} available resources`);
    
    return {
      jsonrpc: '2.0',
      id,
      result: { resources }
    };
  }

  /**
   * Handle resource read request
   * @param {string} id - Request ID
   * @param {Object} params - Resource read parameters
   * @returns {Promise<Object>} Resource read response
   */
  async handleResourceRead(id, params) {
    const { uri } = params;
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Handler] Reading resource: ${uri}`);

    try {
      const content = await this.resourceManager.readResource(uri);
      
      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(content, null, 2)
          }]
        }
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [MCP-Handler] Resource read failed:`, error);
      return this.createErrorResponse(id, -32603, `Resource read error: ${error.message}`);
    }
  }

  /**
   * Create standardized error response
   * @param {string} id - Request ID
   * @param {number} code - Error code
   * @param {string} message - Error message
   * @param {Object} data - Additional error data
   * @returns {Object} Error response
   */
  createErrorResponse(id, code, message, data = null) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: { code, message }
    };

    if (data) {
      response.error.data = data;
    }

    return response;
  }

  /**
   * Validate MCP message format
   * @param {Object} message - Message to validate
   * @returns {Object} Validation result
   */
  validateMessage(message) {
    if (!message) {
      return { valid: false, error: 'Message is null or undefined' };
    }

    if (message.jsonrpc !== '2.0') {
      return { valid: false, error: 'Invalid JSON-RPC version' };
    }

    if (!message.method) {
      return { valid: false, error: 'Missing method field' };
    }

    if (message.id === undefined) {
      return { valid: false, error: 'Missing id field' };
    }

    return { valid: true };
  }

  /**
   * Log message statistics
   * @param {string} method - Method name
   * @param {number} processingTime - Processing time in ms
   * @param {boolean} success - Whether the request succeeded
   */
  logMessageStats(method, processingTime, success) {
    const status = success ? 'SUCCESS' : 'FAILED';
    console.error(`[${new Date().toISOString()}] STATS [MCP-Handler] ${method}: ${status} (${processingTime}ms)`);
  }

  /**
   * Get handler statistics
   * @returns {Object} Handler statistics
   */
  getStats() {
    return {
      totalMessages: this.totalMessages || 0,
      successfulMessages: this.successfulMessages || 0,
      failedMessages: this.failedMessages || 0,
      averageProcessingTime: this.averageProcessingTime || 0,
      lastActivity: this.lastActivity || null
    };
  }
}