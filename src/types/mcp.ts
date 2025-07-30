/**
 * Model Context Protocol (MCP) Types
 * Types for MCP server integration and tool execution
 */

import { Identifiable, JSONObject, JSONValue } from './core.js';

// =============================================================================
// MCP CORE TYPES  
// =============================================================================

export type MCPVersion = '2024-11-05' | '1.0.0' | string;
export type MCPRole = 'client' | 'server';
export type MCPTransport = 'stdio' | 'sse' | 'websocket' | 'http';

export interface MCPCapabilities {
  // Logging capabilities
  logging?: {};
  
  // Prompts capabilities  
  prompts?: {
    listChanged?: boolean;
  };
  
  // Resources capabilities
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  
  // Tools capabilities
  tools?: {
    listChanged?: boolean;
  };
  
  // Roots capabilities (for client)
  roots?: {
    listChanged?: boolean;
  };
  
  // Sampling capabilities (for client)
  sampling?: {};
  
  // Experimental capabilities
  experimental?: Record<string, JSONObject>;
}

export interface MCPImplementation {
  name: string;
  version: string;
}

export interface MCPClientInfo {
  name: string;
  version: string;
}

export interface MCPServerInfo {
  name: string;
  version: string;
}

// =============================================================================
// MCP MESSAGES
// =============================================================================

export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number | null;
}

export interface MCPRequest extends MCPMessage {
  method: string;
  params?: JSONObject;
}

export interface MCPResponse extends MCPMessage {
  result?: JSONValue;
  error?: MCPError;
}

export interface MCPNotification extends MCPMessage {
  method: string;
  params?: JSONObject;
}

export interface MCPError {
  code: number;
  message: string;
  data?: JSONValue;
}

// Standard JSON-RPC error codes
export const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  
  // MCP-specific error codes
  RESOURCE_NOT_FOUND: -32001,
  TOOL_NOT_FOUND: -32002,
  PROMPT_NOT_FOUND: -32003,
  CANCELLED: -32004,
} as const;

// =============================================================================
// INITIALIZATION
// =============================================================================

export interface InitializeRequest extends MCPRequest {
  method: 'initialize';
  params: {
    protocolVersion: MCPVersion;
    capabilities: MCPCapabilities;
    clientInfo: MCPClientInfo;
  };
}

export interface InitializeResponse extends MCPResponse {
  result: {
    protocolVersion: MCPVersion;
    capabilities: MCPCapabilities;
    serverInfo: MCPServerInfo;
    instructions?: string;
  };
}

export interface InitializedNotification extends MCPNotification {
  method: 'initialized';
  params?: {};
}

// =============================================================================
// PING/PONG
// =============================================================================

export interface PingRequest extends MCPRequest {
  method: 'ping';
  params?: {};
}

export interface PongResponse extends MCPResponse {
  result: {};
}

// =============================================================================
// PROMPTS
// =============================================================================

export interface Prompt extends Identifiable {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface ListPromptsRequest extends MCPRequest {
  method: 'prompts/list';
  params?: {
    cursor?: string;
  };
}

export interface ListPromptsResponse extends MCPResponse {
  result: {
    prompts: Prompt[];
    nextCursor?: string;
  };
}

export interface GetPromptRequest extends MCPRequest {
  method: 'prompts/get'; 
  params: {
    name: string;
    arguments?: Record<string, string>;
  };
}

export interface PromptMessage {
  role: 'user' | 'assistant' | 'system';
  content: TextContent | ImageContent;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export interface GetPromptResponse extends MCPResponse {
  result: {
    description?: string;
    messages: PromptMessage[];
  };
}

// =============================================================================
// RESOURCES
// =============================================================================

export interface Resource extends Identifiable {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ListResourcesRequest extends MCPRequest {
  method: 'resources/list';
  params?: {
    cursor?: string;
  };
}

export interface ListResourcesResponse extends MCPResponse {
  result: {
    resources: Resource[];
    nextCursor?: string;
  };
}

export interface ReadResourceRequest extends MCPRequest {
  method: 'resources/read';
  params: {
    uri: string;
  };
}

export interface ResourceContents {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

export interface ReadResourceResponse extends MCPResponse {
  result: {
    contents: ResourceContents[];
  };
}

export interface SubscribeResourceRequest extends MCPRequest {
  method: 'resources/subscribe';
  params: {
    uri: string;
  };
}

export interface SubscribeResourceResponse extends MCPResponse {
  result: {};
}

export interface UnsubscribeResourceRequest extends MCPRequest {
  method: 'resources/unsubscribe';
  params: {
    uri: string;
  };
}

export interface UnsubscribeResourceResponse extends MCPResponse {
  result: {};
}

export interface ResourceUpdatedNotification extends MCPNotification {
  method: 'notifications/resources/updated';
  params: {
    uri: string;
  };
}

export interface ResourceListChangedNotification extends MCPNotification {
  method: 'notifications/resources/list_changed';
  params?: {};
}

// =============================================================================
// TOOLS
// =============================================================================

export interface Tool extends Identifiable {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  additionalProperties?: boolean;
  description?: string;
  enum?: JSONValue[];
  const?: JSONValue;
  
  // Validation keywords
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
  
  // Composition keywords
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
  
  // Conditional keywords
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;
  
  // Extension keywords
  format?: string;
  title?: string;
  examples?: JSONValue[];
  default?: JSONValue;
  
  // Reference
  $ref?: string;
  $id?: string;
  $schema?: string;
}

export interface ListToolsRequest extends MCPRequest {
  method: 'tools/list';
  params?: {
    cursor?: string;
  };
}

export interface ListToolsResponse extends MCPResponse {
  result: {
    tools: Tool[];
    nextCursor?: string;
  };
}

export interface CallToolRequest extends MCPRequest {
  method: 'tools/call';
  params: {
    name: string;
    arguments?: JSONObject;
  };
}

export interface ToolResult {
  content: ToolContent[];
  isError?: boolean;
}

export interface ToolContent {
  type: 'text' | 'image' | 'resource';
  
  // Text content
  text?: string;
  
  // Image content  
  data?: string;
  mimeType?: string;
  
  // Resource content
  resource?: {
    uri: string;
    text?: string;
    blob?: string;
    mimeType?: string;
  };
}

export interface CallToolResponse extends MCPResponse {
  result: {
    content: ToolContent[];
    isError?: boolean;
  };
}

export interface ToolListChangedNotification extends MCPNotification {
  method: 'notifications/tools/list_changed';
  params?: {};
}

// =============================================================================
// LOGGING
// =============================================================================

export type LoggingLevel = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';

export interface SetLevelRequest extends MCPRequest {
  method: 'logging/setLevel';
  params: {
    level: LoggingLevel;
  };
}

export interface SetLevelResponse extends MCPResponse {
  result: {};
}

export interface LoggingMessageNotification extends MCPNotification {
  method: 'notifications/message';
  params: {
    level: LoggingLevel;
    logger?: string;
    data: JSONValue;
  };
}

// =============================================================================
// COMPLETION (CLIENT TO SERVER)
// =============================================================================

export interface CompleteRequest extends MCPRequest {
  method: 'completion/complete';
  params: {
    ref: {
      type: 'ref/prompt' | 'ref/resource';
      name: string;
    };
    argument: {
      name: string;
      value: string;
    };
  };
}

export interface Completion {
  values: string[];
  total?: number;
  hasMore?: boolean;
}

export interface CompleteResponse extends MCPResponse {
  result: {
    completion: Completion;
  };
}

// =============================================================================
// ROOTS (CLIENT CAPABILITY)
// =============================================================================

export interface Root {
  uri: string;
  name?: string;
}

export interface ListRootsRequest extends MCPRequest {
  method: 'roots/list';
  params?: {};
}

export interface ListRootsResponse extends MCPResponse {
  result: {
    roots: Root[];
  };
}

export interface RootListChangedNotification extends MCPNotification {
  method: 'notifications/roots/list_changed';
  params?: {};
}

// =============================================================================
// SAMPLING (CLIENT CAPABILITY)
// =============================================================================

export interface CreateMessageRequest extends MCPRequest {
  method: 'sampling/createMessage';
  params: {
    messages: SamplingMessage[];
    modelPreferences?: ModelPreferences;
    systemPrompt?: string;
    includeContext?: string; // 'none' | 'thisServer' | 'allServers'
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    metadata?: JSONObject;
  };
}

export interface SamplingMessage {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
}

export interface MessageContent {
  type: 'text' | 'image';
  
  // Text content
  text?: string;
  
  // Image content
  data?: string;
  mimeType?: string;
}

export interface ModelPreferences {
  hints?: ModelHint[];
  costPriority?: number; // 0-1, where 0 is cost-conscious and 1 is performance-conscious
  speedPriority?: number; // 0-1, where 0 is quality-conscious and 1 is speed-conscious
  intelligencePriority?: number; // 0-1, where 0 is efficiency-conscious and 1 is intelligence-conscious
}

export interface ModelHint {
  name?: string;
}

export interface CreateMessageResponse extends MCPResponse {
  result: {
    role: 'assistant';
    content: {
      type: 'text';
      text: string;
    };
    model: string;
    stopReason?: 'endTurn' | 'stopSequence' | 'maxTokens';
  };
}

// =============================================================================
// MCP SERVER INTERFACE
// =============================================================================

export interface MCPServer extends Identifiable {
  // Server information
  name: string;
  version: string;
  description?: string;
  
  // Connection details
  transport: MCPTransport;
  endpoint?: string;
  command?: string[];
  args?: string[];
  env?: Record<string, string>;
  
  // Capabilities
  capabilities: MCPCapabilities;
  
  // State
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastConnection?: Date;
  lastError?: string;
  
  // Configuration
  config: MCPServerConfig;
  
  // Statistics
  stats: MCPServerStats;
  
  // Health monitoring
  health: MCPServerHealth;
}

export interface MCPServerConfig {
  // Connection settings
  timeout: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
  keepAlive: boolean;
  
  // Security settings
  trusted: boolean;
  allowedMethods: string[];
  allowedResources: string[];
  
  // Resource limits
  maxMemory: number; // MB
  maxCPU: number; // percentage
  maxRequests: number; // per minute
  
  // Logging
  logLevel: LoggingLevel;
  logRequests: boolean;
  logResponses: boolean;
  
  // Caching
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  
  // Monitoring
  healthCheckInterval: number; // seconds
  metricsEnabled: boolean;
}

export interface MCPServerStats {
  // Connection statistics
  connectionsAttempted: number;
  connectionsSuccessful: number;
  connectionsFailed: number;
  totalUptime: number; // seconds
  
  // Request statistics  
  requestsSent: number;
  responsesReceived: number;
  errorsReceived: number;
  averageResponseTime: number; // milliseconds
  
  // Resource usage
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  
  // Feature usage
  toolCalls: number;
  resourceReads: number;
  promptGets: number;
  
  // Error statistics
  errorsByType: Record<string, number>;
  timeouts: number;
  
  // Performance metrics
  p50ResponseTime: number; // milliseconds
  p95ResponseTime: number; // milliseconds
  p99ResponseTime: number; // milliseconds
  
  // Time range
  collectedAt: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface MCPServerHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  
  // Health checks
  checks: {
    connection: HealthCheckResult;
    responsiveness: HealthCheckResult;
    resources: HealthCheckResult;
    errors: HealthCheckResult;
  };
  
  // Issues
  issues: HealthIssue[];
  
  // Last health check
  lastCheck: Date;
  nextCheck: Date;
}

export interface HealthCheckResult {
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
}

export interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'connection' | 'performance' | 'resource' | 'error';
  description: string;
  recommendation?: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

// =============================================================================
// MCP CLIENT INTERFACE
// =============================================================================

export interface MCPClient extends Identifiable {
  // Client information
  name: string;
  version: string;
  
  // Connection management
  connect(server: MCPServer): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Protocol methods
  initialize(capabilities: MCPCapabilities): Promise<InitializeResponse>;
  ping(): Promise<PongResponse>;
  
  // Prompts
  listPrompts(cursor?: string): Promise<ListPromptsResponse>;
  getPrompt(name: string, args?: Record<string, string>): Promise<GetPromptResponse>;
  
  // Resources
  listResources(cursor?: string): Promise<ListResourcesResponse>;
  readResource(uri: string): Promise<ReadResourceResponse>;
  subscribeResource(uri: string): Promise<void>;
  unsubscribeResource(uri: string): Promise<void>;
  
  // Tools
  listTools(cursor?: string): Promise<ListToolsResponse>;
  callTool(name: string, args?: JSONObject): Promise<CallToolResponse>;
  
  // Logging
  setLogLevel(level: LoggingLevel): Promise<void>;
  
  // Completion
  complete(ref: {type: string; name: string}, argument: {name: string; value: string}): Promise<CompleteResponse>;
  
  // Event handling
  on(event: string, handler: MCPEventHandler): void;
  off(event: string, handler: MCPEventHandler): void;
  
  // Statistics and monitoring
  getStats(): MCPServerStats;
  getHealth(): MCPServerHealth;
}

export interface MCPEventHandler {
  (event: MCPEvent): void;
}

export interface MCPEvent {
  type: string;
  timestamp: Date;
  data: JSONObject;
  server?: string;
}

// =============================================================================
// MCP TRANSPORT INTERFACES
// =============================================================================

export interface MCPTransportConfig {
  type: MCPTransport;
  config: JSONObject;
}

export interface StdioTransportConfig extends MCPTransportConfig {
  type: 'stdio';
  config: {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
  };
}

export interface SSETransportConfig extends MCPTransportConfig {
  type: 'sse';
  config: {
    url: string;
    headers?: Record<string, string>;
    reconnect?: boolean;
    reconnectDelay?: number; // milliseconds
  };
}

export interface WebSocketTransportConfig extends MCPTransportConfig {
  type: 'websocket';
  config: {
    url: string;
    protocols?: string[];
    headers?: Record<string, string>;
    reconnect?: boolean;
    reconnectDelay?: number; // milliseconds
  };
}

export interface HTTPTransportConfig extends MCPTransportConfig {
  type: 'http';
  config: {
    baseUrl: string;
    headers?: Record<string, string>;
    timeout?: number; // milliseconds
    retries?: number;
  };
}

// =============================================================================
// MCP TOOL EXECUTOR
// =============================================================================

export interface MCPToolExecutor {
  // Tool execution
  executeTool(server: string, toolName: string, args: JSONObject): Promise<ToolExecutionResult>;
  executeToolBatch(requests: ToolExecutionRequest[]): Promise<ToolExecutionResult[]>;
  
  // Tool discovery
  discoverTools(): Promise<ToolDiscoveryResult>;
  getAvailableTools(server?: string): Promise<Tool[]>;
  getToolSchema(server: string, toolName: string): Promise<JSONSchema>;
  
  // Server management
  addServer(config: MCPServerConfig): Promise<MCPServer>;
  removeServer(serverId: string): Promise<boolean>;
  getServers(): Promise<MCPServer[]>;
  getServer(serverId: string): Promise<MCPServer | null>;
  
  // Health and monitoring
  checkServerHealth(serverId: string): Promise<MCPServerHealth>;
  getExecutorStats(): Promise<ExecutorStats>;
  
  // Configuration
  updateServerConfig(serverId: string, config: Partial<MCPServerConfig>): Promise<void>;
  validateServerConfig(config: MCPServerConfig): Promise<ValidationResult[]>;
}

export interface ToolExecutionRequest {
  server: string;
  toolName: string;
  args: JSONObject;
  
  // Execution options
  timeout?: number; // milliseconds
  retries?: number;
  priority?: 'low' | 'medium' | 'high';
  
  // Context
  context?: JSONObject;
  correlationId?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  result?: ToolResult;
  error?: MCPError;
  
  // Execution metadata
  server: string;
  toolName: string;
  args: JSONObject;
  executionTime: number; // milliseconds
  
  // Resource usage
  resourceUsage: {
    memory: number; // MB
    cpu: number; // milliseconds
  };
  
  // Context
  context?: JSONObject;
  correlationId?: string;
  timestamp: Date;
}

export interface ToolDiscoveryResult {
  servers: {
    serverId: string;
    serverName: string;
    tools: Tool[];
    lastDiscovered: Date;
  }[];
  
  totalTools: number;
  duplicateTools: {
    toolName: string;
    servers: string[];
  }[];
  
  discoveryTime: number; // milliseconds
  timestamp: Date;
}

export interface ExecutorStats {
  // Tool execution statistics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // milliseconds
  
  // Server statistics
  activeServers: number;
  healthyServers: number;
  unhealthyServers: number;
  
  // Tool statistics
  totalTools: number;
  mostUsedTools: {
    server: string;
    toolName: string;
    executionCount: number;
  }[];
  
  // Error statistics
  errorsByType: Record<string, number>;
  errorsByServer: Record<string, number>;
  timeouts: number;
  
  // Performance statistics
  p50ExecutionTime: number; // milliseconds
  p95ExecutionTime: number; // milliseconds
  p99ExecutionTime: number; // milliseconds
  
  // Resource usage
  totalMemoryUsed: number; // MB
  totalCPUTime: number; // milliseconds
  
  // Time range
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// =============================================================================
// MCP EVENTS
// =============================================================================

export interface MCPEvents {
  // Connection events
  'server-connected': (serverId: string) => void;
  'server-disconnected': (serverId: string, reason: string) => void;
  'server-error': (serverId: string, error: MCPError) => void;
  'server-health-changed': (serverId: string, health: MCPServerHealth) => void;
  
  // Tool events
  'tool-executed': (result: ToolExecutionResult) => void;
  'tool-failed': (request: ToolExecutionRequest, error: MCPError) => void;
  'tools-discovered': (result: ToolDiscoveryResult) => void;
  'tool-list-changed': (serverId: string) => void;
  
  // Resource events
  'resource-updated': (serverId: string, uri: string) => void;
  'resource-list-changed': (serverId: string) => void;
  
  // Prompt events
  'prompt-list-changed': (serverId: string) => void;
  
  // Logging events
  'log-message': (serverId: string, level: LoggingLevel, message: string, data?: JSONValue) => void;
  
  // Performance events
  'performance-warning': (serverId: string, metric: string, value: number, threshold: number) => void;
  'resource-exhausted': (serverId: string, resource: string, usage: number, limit: number) => void;
}