/**
 * @fileoverview Comprehensive MCP Type Definitions for Claude Code Zen
 * 
 * This module provides the complete type system for MCP (Model Context Protocol)
 * operations in Claude Code Zen. It defines interfaces, types, and configurations
 * for all MCP tools, requests, responses, and server operations.
 * 
 * ## Type System Architecture
 * 
 * The type system is organized into several categories:
 * - **Tool Definitions**: Types for MCP tool structure and behavior
 * - **Communication Protocol**: Request/response types for MCP communication
 * - **Server Configuration**: Configuration types for MCP server setup
 * - **Result Structures**: Standardized result formats for tool outputs
 * - **Content Types**: Multi-modal content support for tool responses
 * 
 * ## MCP Protocol Compliance
 * 
 * All types are designed for full compliance with the Model Context Protocol
 * specification, ensuring seamless integration with Claude CLI and other
 * MCP-compatible clients.
 * 
 * ## Tool Categories
 * 
 * - **coordination**: High-level coordination and orchestration tools
 * - **swarm**: Multi-agent swarm management and coordination
 * - **system**: System-level operations and monitoring
 * - **neural**: AI/ML and neural network operations
 * - **memory**: Persistent memory and state management
 * 
 * @example
 * ```typescript
 * // Define a new MCP tool
 * const newTool: MCPTool = {
 *   name: 'custom_analyzer',
 *   description: 'Analyzes code patterns',
 *   parameters: {
 *     codeSnippet: { type: 'string', required: true },
 *     analysisDepth: { type: 'number', default: 3 }
 *   },
 *   handler: async (params) => {
 *     // Tool implementation
 *     return {
 *       success: true,
 *       data: analysisResults,
 *       content: [{
 *         type: 'text',
 *         text: JSON.stringify(analysisResults, null, 2)
 *       }]
 *     };
 *   },
 *   category: 'coordination',
 *   version: '1.0.0'
 * };
 * 
 * // Configure MCP server
 * const serverConfig: MCPServerConfig = {
 *   timeout: 30000,
 *   logLevel: 'info',
 *   maxConcurrentRequests: 10
 * };
 * ```
 * 
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 * @see {@link https://modelcontextprotocol.io} MCP Protocol Specification
 * @see {@link StdioMcpServer} MCP server implementation
 * @see {@link SwarmTools} Tools using these type definitions
 */

/**
 * Complete definition for an MCP tool with all required properties and metadata.
 * 
 * MCPTool defines the structure for all MCP tools in Claude Code Zen, including
 * their metadata, parameter definitions, execution handlers, and categorization.
 * This interface ensures consistent tool definitions across the entire system.
 * 
 * ## Tool Categories
 * 
 * - **coordination**: High-level coordination and orchestration operations
 * - **swarm**: Multi-agent swarm management and coordination
 * - **system**: System-level operations, monitoring, and diagnostics
 * - **neural**: AI/ML operations, neural networks, and cognitive patterns
 * - **memory**: Persistent memory, state management, and data persistence
 * 
 * @example
 * ```typescript
 * const swarmInitTool: MCPTool = {
 *   name: 'swarm_init',
 *   description: 'Initialize a new swarm coordination system',
 *   parameters: {
 *     topology: {
 *       type: 'string',
 *       enum: ['mesh', 'hierarchical', 'ring', 'star'],
 *       description: 'Swarm communication topology'
 *     },
 *     maxAgents: {
 *       type: 'number',
 *       default: 4,
 *       description: 'Maximum number of agents'
 *     }
 *   },
 *   handler: async (params) => {
 *     const swarm = await initializeSwarm(params);
 *     return {
 *       success: true,
 *       data: swarm,
 *       content: [{
 *         type: 'text',
 *         text: `Swarm ${swarm.id} initialized with ${params.topology} topology`
 *       }]
 *     };
 *   },
 *   category: 'swarm',
 *   version: '1.0.0'
 * };
 * ```
 */
export interface MCPTool {
  /** Unique tool name for MCP registration and invocation */
  name: string;
  
  /** Human-readable description of tool functionality */
  description: string;
  
  /** Parameter schema defining tool inputs and validation */
  parameters: Record<string, any>;
  
  /** Async handler function that executes the tool logic */
  handler: (params: any) => Promise<MCPToolResult>;
  
  /** Tool category for organization and filtering */
  category: 'coordination' | 'swarm' | 'system' | 'neural' | 'memory';
  
  /** Tool version for compatibility and updates */
  version: string;
}

/**
 * Standardized result structure for all MCP tool executions.
 * 
 * MCPToolResult provides a consistent format for tool outputs, supporting
 * both simple data results and rich multi-modal content responses. Includes
 * success indicators, error information, and execution metadata.
 * 
 * ## Content Types
 * 
 * - **text**: Plain text or JSON string content
 * - **image**: Image data with MIME type specification
 * - **resource**: File or resource references with metadata
 * 
 * @example
 * ```typescript
 * // Simple success result
 * const simpleResult: MCPToolResult = {
 *   success: true,
 *   data: { agentId: 'agent-001', status: 'active' },
 *   content: [{
 *     type: 'text',
 *     text: 'Agent successfully created'
 *   }]
 * };
 * 
 * // Error result with context
 * const errorResult: MCPToolResult = {
 *   success: false,
 *   error: 'Agent initialization failed',
 *   isError: true,
 *   metadata: {
 *     executionTime: 1250,
 *     toolVersion: '1.0.0',
 *     warnings: ['Low memory available']
 *   }
 * };
 * 
 * // Multi-modal result with image
 * const richResult: MCPToolResult = {
 *   success: true,
 *   data: chartData,
 *   content: [
 *     {
 *       type: 'text',
 *       text: 'Performance analysis complete'
 *     },
 *     {
 *       type: 'image',
 *       data: 'base64-encoded-chart-image',
 *       mimeType: 'image/png'
 *     }
 *   ]
 * };
 * ```
 */
export interface MCPToolResult {
  /** Whether the tool execution was successful (optional) */
  success?: boolean;
  
  /** Primary result data from tool execution (optional) */
  data?: any;
  
  /** Error message if execution failed (optional) */
  error?: string;
  
  /** Multi-modal content array for rich responses (optional) */
  content?: Array<{
    /** Content type indicating format and handling */
    type: 'text' | 'image' | 'resource';
    
    /** Text content for text type (optional) */
    text?: string;
    
    /** Binary or encoded data for non-text types (optional) */
    data?: string;
    
    /** MIME type for proper content handling (optional) */
    mimeType?: string;
  }>;
  
  /** Whether this result represents an error condition (optional) */
  isError?: boolean;
  
  /** Additional execution metadata (optional) */
  metadata?: {
    /** Tool execution time in milliseconds (optional) */
    executionTime?: number;
    
    /** Version of the tool that produced this result (optional) */
    toolVersion?: string;
    
    /** Non-fatal warnings from tool execution (optional) */
    warnings?: string[];
  };
}

/**
 * Standard MCP request structure for client-server communication.
 * 
 * MCPRequest defines the structure for all requests sent to the MCP server,
 * following the Model Context Protocol specification. Includes method
 * identification, parameters, and request tracking.
 * 
 * @example
 * ```typescript
 * // Tool invocation request
 * const toolRequest: MCPRequest = {
 *   method: 'tools/call',
 *   params: {
 *     name: 'swarm_init',
 *     arguments: {
 *       topology: 'mesh',
 *       maxAgents: 6
 *     }
 *   },
 *   id: 'request-001'
 * };
 * 
 * // Server capability query
 * const capabilityRequest: MCPRequest = {
 *   method: 'initialize',
 *   params: {
 *     protocolVersion: '2024-11-05',
 *     capabilities: {
 *       tools: {}
 *     },
 *     clientInfo: {
 *       name: 'claude-code-zen',
 *       version: '1.0.0'
 *     }
 *   },
 *   id: 'init-001'
 * };
 * ```
 */
export interface MCPRequest {
  /** MCP method name being invoked */
  method: string;
  
  /** Method parameters (optional) */
  params?: any;
  
  /** Request identifier for response correlation (optional) */
  id?: string | number;
}

/**
 * Standard MCP response structure for server-client communication.
 * 
 * MCPResponse defines the structure for all responses sent from the MCP server,
 * following the Model Context Protocol specification. Includes success results,
 * error information, and request correlation.
 * 
 * ## Error Codes
 * 
 * Standard MCP error codes:
 * - `-32700`: Parse error
 * - `-32600`: Invalid request
 * - `-32601`: Method not found
 * - `-32602`: Invalid parameters
 * - `-32603`: Internal error
 * 
 * @example
 * ```typescript
 * // Successful response
 * const successResponse: MCPResponse = {
 *   result: {
 *     content: [{
 *       type: 'text',
 *       text: JSON.stringify({
 *         swarmId: 'swarm-001',
 *         topology: 'mesh',
 *         agents: []
 *       }, null, 2)
 *     }]
 *   },
 *   id: 'request-001'
 * };
 * 
 * // Error response
 * const errorResponse: MCPResponse = {
 *   error: {
 *     code: -32602,
 *     message: 'Invalid parameters: topology must be one of [mesh, hierarchical, ring, star]',
 *     data: {
 *       parameter: 'topology',
 *       received: 'invalid-topology',
 *       expected: ['mesh', 'hierarchical', 'ring', 'star']
 *     }
 *   },
 *   id: 'request-001'
 * };
 * ```
 */
export interface MCPResponse {
  /** Successful result data (optional, mutually exclusive with error) */
  result?: any;
  
  /** Error information if request failed (optional, mutually exclusive with result) */
  error?: {
    /** Standard MCP error code */
    code: number;
    
    /** Human-readable error message */
    message: string;
    
    /** Additional error context data (optional) */
    data?: any;
  };
  
  /** Request identifier for correlation (optional) */
  id?: string | number;
}

/**
 * Comprehensive configuration interface for MCP server setup.
 * 
 * MCPServerConfig defines all configuration options for the MCP server,
 * including network settings, timeouts, logging, and performance tuning.
 * Provides sensible defaults for all optional settings.
 * 
 * ## Default Values
 * 
 * - **timeout**: 30000ms (30 seconds) for reliable tool execution
 * - **logLevel**: 'info' for balanced logging output
 * - **maxConcurrentRequests**: 10 for stability and resource management
 * - **port**: Not used for stdio transport
 * - **host**: Not used for stdio transport
 * 
 * @example
 * ```typescript
 * // Development configuration
 * const devConfig: MCPServerConfig = {
 *   timeout: 60000,
 *   logLevel: 'debug',
 *   maxConcurrentRequests: 5
 * };
 * 
 * // Production configuration
 * const prodConfig: MCPServerConfig = {
 *   timeout: 30000,
 *   logLevel: 'warn',
 *   maxConcurrentRequests: 20
 * };
 * 
 * // HTTP server configuration (if needed)
 * const httpConfig: MCPServerConfig = {
 *   port: 3000,
 *   host: 'localhost',
 *   timeout: 45000,
 *   logLevel: 'info',
 *   maxConcurrentRequests: 15
 * };
 * ```
 */
export interface MCPServerConfig {
  /** Server port for HTTP transport (optional, not used for stdio) */
  port?: number;
  
  /** Server host for HTTP transport (optional, not used for stdio) */
  host?: string;
  
  /** Tool execution timeout in milliseconds (optional, default: 30000) */
  timeout?: number;
  
  /** Logging level for server operations (optional, default: 'info') */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  /** Maximum concurrent tool executions (optional, default: 10) */
  maxConcurrentRequests?: number;
}

/**
 * Re-export all types from DAA tools for comprehensive type availability.
 * 
 * This re-export ensures that all DAA-related types are available when
 * importing from the main types module, providing a single source of
 * truth for all MCP type definitions.
 * 
 * @example
 * ```typescript
 * // Import all MCP types including DAA types
 * import {
 *   MCPTool,
 *   MCPToolResult,
 *   MCPRequest,
 *   MCPResponse,
 *   MCPServerConfig,
 *   // DAA types are also available
 *   DAA_MCPTools
 * } from './types.ts';
 * ```
 */
export * from './mcp-daa-tools.ts';
