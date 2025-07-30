/**
 * Server Configuration and Management Types
 * Types for unified server architecture with multiple protocol support
 */

import { Request, Response, NextFunction } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';
import { 
  Identifiable, 
  JSONObject, 
  JSONValue, 
  LifecycleManager, 
  HealthCheck, 
  ResourceUsage,
  SystemStatus 
} from './core.js';
import { APIDefinition, HTTPMethod, AuthenticationType, RateLimitConfig, CORSConfig } from './api.js';
import { MCPServer, MCPCapabilities } from './mcp.js';

// =============================================================================
// SERVER CORE TYPES
// =============================================================================

export type ServerType = 'unified' | 'api' | 'mcp' | 'websocket' | 'grpc';
export type ServerEnvironment = 'development' | 'staging' | 'production' | 'test';
export type ProtocolType = 'http' | 'https' | 'ws' | 'wss' | 'grpc' | 'mcp';

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

export interface ServerConfig extends Identifiable {
  // Basic server configuration
  name: string;
  type: ServerType;
  version: string;
  environment: ServerEnvironment;
  
  // Network configuration
  host: string;
  port: number;
  secure: boolean;
  
  // Protocol support
  protocols: ProtocolSupport;
  
  // Feature flags
  features: ServerFeatures;
  
  // Security configuration
  security: SecurityConfig;
  
  // Performance settings
  performance: PerformanceConfig;
  
  // Monitoring and observability
  monitoring: MonitoringConfig;
  
  // Middleware configuration
  middleware: MiddlewareConfig;
  
  // Static file serving
  static?: StaticFileConfig;
  
  // External integrations
  integrations: IntegrationConfig;
}

export interface ProtocolSupport {
  // HTTP/HTTPS
  http: {
    enabled: boolean;
    version: '1.1' | '2.0';
    keepAlive: boolean;
    timeout: number; // milliseconds
  };
  
  // WebSocket
  websocket: {
    enabled: boolean;
    path: string;
    compression: boolean;
    heartbeat: boolean;
    heartbeatInterval: number; // milliseconds
  };
  
  // Model Context Protocol
  mcp: {
    enabled: boolean;
    endpoint: string;
    capabilities: MCPCapabilities;
    maxConnections: number;
  };
  
  // gRPC
  grpc: {
    enabled: boolean;
    reflection: boolean;
    healthCheck: boolean;
  };
  
  // Server-Sent Events
  sse: {
    enabled: boolean;
    endpoint: string;
    keepAlive: boolean;
  };
}

export interface ServerFeatures {
  // API features
  enableAPI: boolean;
  enableSwagger: boolean;
  enableGraphQL: boolean;
  
  // Real-time features
  enableWebSocket: boolean;
  enableSSE: boolean;
  
  // Protocol support
  enableMCP: boolean;
  enableGRPC: boolean;
  
  // Neural and AI features
  enableNeural: boolean;
  enableAGUI: boolean;
  
  // Development features
  enableHotReload: boolean;
  enableDebugMode: boolean;
  enableMetrics: boolean;
  enableTracing: boolean;
  
  // Security features
  enableCORS: boolean;
  enableCSRF: boolean;
  enableRateLimit: boolean;
  enableAuth: boolean;
}

export interface SecurityConfig {
  // Authentication
  authentication: {
    enabled: boolean;
    type: AuthenticationType;
    config: JSONObject;
  };
  
  // Authorization
  authorization: {
    enabled: boolean;
    defaultPolicy: 'allow' | 'deny';
    policies: AuthPolicy[];
  };
  
  // CORS configuration
  cors: CORSConfig;
  
  // Rate limiting
  rateLimit: RateLimitConfig;
  
  // CSRF protection
  csrf: {
    enabled: boolean;
    secret: string;
    cookie: {
      key: string;
      sameSite: 'strict' | 'lax' | 'none';
      secure: boolean;
      httpOnly: boolean;
    };
  };
  
  // Content Security Policy
  csp: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly: boolean;
  };
  
  // HTTPS configuration
  https: {
    enabled: boolean;
    cert?: string;
    key?: string;
    ca?: string;
    passphrase?: string;
    requestCert: boolean;
    rejectUnauthorized: boolean;
  };
  
  // Security headers
  headers: {
    helmet: boolean;
    hsts: boolean;
    nosniff: boolean;
    xssProtection: boolean;
    referrerPolicy: string;
  };
}

export interface AuthPolicy {
  name: string;
  resource: string;
  actions: string[];
  effect: 'allow' | 'deny';
  conditions?: PolicyCondition[];
  roles?: string[];
  users?: string[];
}

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'regex';
  value: JSONValue;
}

export interface PerformanceConfig {
  // Connection limits
  maxConnections: number;
  maxRequestsPerConnection: number;
  connectionTimeout: number; // milliseconds
  
  // Request handling
  requestTimeout: number; // milliseconds
  bodyParserLimit: string;
  maxConcurrentRequests: number;
  
  // Caching
  cache: {
    enabled: boolean;
    type: 'memory' | 'redis' | 'memcached';
    config: JSONObject;
    defaultTTL: number; // seconds
  };
  
  // Compression
  compression: {
    enabled: boolean;
    level: number; // 1-9
    threshold: number; // bytes
  };
  
  // Keep-alive
  keepAlive: {
    enabled: boolean;
    timeout: number; // seconds
    maxRequests: number;
  };
  
  // Resource limits
  limits: {
    memory: number; // MB
    cpu: number; // percentage
    fileDescriptors: number;
  };
}

export interface MonitoringConfig {
  // Health checks
  health: {
    enabled: boolean;
    endpoint: string;
    interval: number; // seconds
    timeout: number; // milliseconds
    checks: HealthCheckDefinition[];
  };
  
  // Metrics collection
  metrics: {
    enabled: boolean;
    endpoint: string;
    provider: 'prometheus' | 'datadog' | 'newrelic' | 'custom';
    interval: number; // seconds
    retention: number; // days
  };
  
  // Logging
  logging: {
    enabled: boolean;
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    format: 'json' | 'text' | 'bunyan' | 'winston';
    destination: 'console' | 'file' | 'syslog' | 'http';
    config: JSONObject;
  };
  
  // Tracing
  tracing: {
    enabled: boolean;
    provider: 'jaeger' | 'zipkin' | 'datadog' | 'custom';
    samplingRate: number; // 0-1
    endpoint?: string;
  };
  
  // Error tracking
  errorTracking: {
    enabled: boolean;
    provider: 'sentry' | 'bugsnag' | 'rollbar' | 'custom';
    config: JSONObject;
  };
}

export interface HealthCheckDefinition {
  name: string;
  type: 'database' | 'service' | 'file' | 'url' | 'custom';
  config: JSONObject;
  timeout: number; // milliseconds
  interval: number; // seconds
  retries: number;
  critical: boolean;
}

export interface MiddlewareConfig {
  // Built-in middleware
  builtin: {
    cors: boolean;
    helmet: boolean;
    compression: boolean;
    bodyParser: boolean;
    cookieParser: boolean;
    session: boolean;
    static: boolean;
  };
  
  // Custom middleware
  custom: CustomMiddleware[];
  
  // Middleware order
  order: string[];
  
  // Global middleware settings
  global: {
    timeout: number; // milliseconds
    errorHandler: boolean;
    notFoundHandler: boolean;
    requestLogger: boolean;
  };
}

export interface CustomMiddleware {
  name: string;
  path: string;
  options?: JSONObject;
  enabled: boolean;
  order: number;
  routes?: string[];
  methods?: HTTPMethod[];
}

export interface StaticFileConfig {
  enabled: boolean;
  root: string;
  options: {
    dotfiles: 'allow' | 'deny' | 'ignore';
    etag: boolean;
    extensions: string[];
    fallthrough: boolean;
    immutable: boolean;
    index: string | false;
    lastModified: boolean;
    maxAge: number; // milliseconds
    redirect: boolean;
    setHeaders?: string; // function name
  };
}

export interface IntegrationConfig {
  // Neural engine integration
  neural: {
    enabled: boolean;
    endpoint?: string;
    models: string[];
    caching: boolean;
  };
  
  // AG-UI integration
  agui: {
    enabled: boolean;
    broadcast: boolean;
    filtering: boolean;
  };
  
  // Database integrations
  databases: {
    sqlite: DatabaseConnection;
    lancedb: DatabaseConnection;
    kuzu: DatabaseConnection;
    postgresql?: DatabaseConnection;
  };
  
  // External services
  services: ExternalService[];
}

export interface DatabaseConnection {
  enabled: boolean;
  url: string;
  options: JSONObject;
  poolSize?: number;
  timeout?: number; // milliseconds
}

export interface ExternalService {
  name: string;
  type: 'http' | 'grpc' | 'mcp';
  endpoint: string;
  authentication?: {
    type: string;
    config: JSONObject;
  };
  timeout: number; // milliseconds
  retries: number;
  circuitBreaker: boolean;
}

// =============================================================================
// SERVER IMPLEMENTATION INTERFACES
// =============================================================================

export interface UnifiedServer extends LifecycleManager {
  // Configuration
  readonly config: ServerConfig;
  
  // Server instances
  readonly httpServer: HTTPServer | null;
  readonly wsServer: WebSocketServer | null;
  readonly mcpServer: MCPServer | null;
  
  // Status and health
  readonly status: SystemStatus;
  readonly metrics: ServerMetrics;
  
  // Core operations
  start(): Promise<void>;
  stop(graceful?: boolean): Promise<void>;
  restart(): Promise<void>;
  reload(): Promise<void>;
  
  // Health and monitoring
  getHealth(): Promise<ServerHealth>;
  getMetrics(): Promise<ServerMetrics>;
  getStatus(): ServerStatus;
  
  // Route and middleware management
  addRoute(route: RouteDefinition): void;
  removeRoute(path: string, method?: HTTPMethod): void;
  addMiddleware(middleware: MiddlewareDefinition): void;
  removeMiddleware(name: string): void;
  
  // WebSocket management
  broadcast(event: string, data: JSONValue): void;
  getConnectedClients(): WebSocketClient[];
  
  // MCP operations
  registerMCPTool(tool: MCPToolDefinition): void;
  unregisterMCPTool(name: string): void;
  
  // Configuration updates
  updateConfig(config: Partial<ServerConfig>): Promise<void>;
  validateConfig(config: ServerConfig): ValidationResult[];
}

export interface RouteDefinition {
  path: string;
  method: HTTPMethod;
  handler: RouteHandler;
  middleware?: MiddlewareFunction[];
  schema?: {
    params?: JSONObject;
    query?: JSONObject;
    body?: JSONObject;
    response?: JSONObject;
  };
  options?: {
    timeout?: number;
    rateLimit?: RateLimitConfig;
    auth?: boolean;
    cache?: boolean;
  };
}

export interface MiddlewareDefinition {
  name: string;
  handler: MiddlewareFunction;
  order?: number;
  routes?: string[];
  methods?: HTTPMethod[];
  enabled?: boolean;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONObject;
  handler: MCPToolHandler;
  category?: string;
  metadata?: JSONObject;
}

// =============================================================================
// HANDLER TYPES
// =============================================================================

export type RouteHandler = (
  req: TypedRequest,
  res: TypedResponse,
  next: NextFunction
) => void | Promise<void>;

export type MiddlewareFunction = (
  req: TypedRequest,
  res: TypedResponse,
  next: NextFunction
) => void | Promise<void>;

export type MCPToolHandler = (
  args: JSONObject,
  context: MCPToolContext
) => Promise<MCPToolResult>;

export interface TypedRequest extends Request {
  // Enhanced request with type safety
  user?: UserContext;
  session?: SessionContext;
  correlation?: {
    id: string;
    traceId: string;
    spanId: string;
  };
  context?: JSONObject;
  
  // Validation results
  validation?: {
    params: ValidationResult;
    query: ValidationResult;
    body: ValidationResult;
    headers: ValidationResult;
  };
  
  // Parsed data with type safety
  typedParams<T = any>(): T;
  typedQuery<T = any>(): T;
  typedBody<T = any>(): T;
}

export interface TypedResponse extends Response {
  // Enhanced response with type safety
  success<T = any>(data: T, message?: string): void;
  error(message: string, code?: number, details?: JSONObject): void;
  paginated<T = any>(data: T[], pagination: PaginationInfo): void;
  
  // Custom response methods
  cached(data: JSONValue, ttl?: number): void;
  stream(data: AsyncIterable<any>): void;
}

export interface UserContext {
  id: string;
  username?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  metadata?: JSONObject;
}

export interface SessionContext {
  id: string;
  userId?: string;
  data: JSONObject;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

export interface MCPToolContext {
  server: string;
  toolName: string;
  user?: UserContext;
  session?: SessionContext;
  correlation: {
    id: string;
    traceId: string;
  };
}

export interface MCPToolResult {
  success: boolean;
  content: MCPToolContent[];
  error?: {
    code: number;
    message: string;
    details?: JSONObject;
  };
}

export interface MCPToolContent {
  type: 'text' | 'image' | 'json' | 'binary';
  data: string | JSONObject;
  mimeType?: string;
  metadata?: JSONObject;
}

// =============================================================================
// SERVER STATUS AND METRICS
// =============================================================================

export interface ServerStatus {
  // Basic status
  running: boolean;
  uptime: number; // seconds
  version: string;
  environment: ServerEnvironment;
  
  // Network status
  host: string;
  port: number;
  secure: boolean;
  
  // Component status
  components: {
    http: ComponentStatus;
    websocket: ComponentStatus;
    mcp: ComponentStatus;
    neural: ComponentStatus;
    database: ComponentStatus;
  };
  
  // Health summary
  health: {
    overall: SystemStatus;
    checks: number;
    passing: number;
    failing: number;
    lastCheck: Date;
  };
  
  // Resource usage
  resources: ResourceUsage;
  
  // Configuration
  features: ServerFeatures;
  
  // Last updated
  timestamp: Date;
}

export interface ComponentStatus {
  enabled: boolean;
  running: boolean;
  healthy: boolean;
  message?: string;
  lastCheck?: Date;
  metrics?: JSONObject;
}

export interface ServerMetrics {
  // Request metrics
  requests: {
    total: number;
    success: number;
    error: number;
    rate: number; // requests per second
    averageResponseTime: number; // milliseconds
    p95ResponseTime: number; // milliseconds
    p99ResponseTime: number; // milliseconds
  };
  
  // Connection metrics
  connections: {
    active: number;
    total: number;
    websocket: number;
    mcp: number;
  };
  
  // Error metrics
  errors: {
    total: number;
    rate: number; // errors per second
    byType: Record<string, number>;
    byEndpoint: Record<string, number>;
  };
  
  // Performance metrics
  performance: {
    cpuUsage: number; // percentage
    memoryUsage: number; // MB
    diskUsage: number; // MB
    networkIO: {
      bytesIn: number;
      bytesOut: number;
    };
  };
  
  // Custom metrics
  custom: Record<string, number>;
  
  // Time range
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface ServerHealth extends HealthCheck {
  // Overall health (status from HealthCheck)
  // message from HealthCheck
  // name from HealthCheck
  // timestamp from HealthCheck
  
  // Individual health checks
  checks: HealthCheck[];
  
  // Component health
  components: {
    server: HealthCheck;
    database: HealthCheck;
    neural: HealthCheck;
    external: HealthCheck[];
  };
  
  // Resource health
  resources: {
    memory: HealthCheck;
    cpu: HealthCheck;
    disk: HealthCheck;
    network: HealthCheck;
  };
  
  // Dependencies
  dependencies: {
    name: string;
    status: SystemStatus;
    responseTime?: number;
    lastCheck: Date;
    endpoint?: string;
  }[];
  
  // Recommendations
  recommendations: string[];
  
  // Health summary
  summary: {
    uptime: number; // seconds
    availability: number; // percentage
    reliability: number; // percentage
    performance: number; // percentage (0-100)
  };
  
  // Last health check
  lastCheck: Date;
  nextCheck: Date;
}

// =============================================================================
// WEBSOCKET TYPES
// =============================================================================

export interface WebSocketClient {
  id: string;
  socket: WebSocket;
  user?: UserContext;
  metadata: JSONObject;
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: string[];
}

export interface WebSocketMessage {
  type: string;
  id?: string;
  data: JSONValue;
  timestamp: Date;
  user?: string;
  correlation?: string;
}

export interface WebSocketConfig {
  enabled: boolean;
  path: string;
  compression: boolean;
  heartbeat: {
    enabled: boolean;
    interval: number; // milliseconds
    timeout: number; // milliseconds
  };
  
  // Authentication
  auth: {
    required: boolean;
    methods: ('token' | 'cookie' | 'header')[];
  };
  
  // Rate limiting
  rateLimit: {
    enabled: boolean;
    maxMessages: number;
    window: number; // seconds
  };
  
  // Connection limits
  maxConnections: number;
  maxConnectionsPerUser: number;
  
  // Message handling
  maxMessageSize: number; // bytes
  enableBroadcast: boolean;
  enableFiltering: boolean;
}

// =============================================================================
// VALIDATION AND UTILITY TYPES
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: JSONValue;
  code?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ServerEvent {
  type: 'started' | 'stopped' | 'restarted' | 'error' | 'health-changed' | 'config-updated';
  timestamp: Date;
  data: JSONObject;
  correlation?: string;
}

// =============================================================================
// SERVER FACTORY AND BUILDER
// =============================================================================

export interface ServerFactory {
  createUnifiedServer(config: ServerConfig): Promise<UnifiedServer>;
  createAPIServer(config: Partial<ServerConfig>): Promise<UnifiedServer>;
  createMCPServer(config: Partial<ServerConfig>): Promise<UnifiedServer>;
  validateConfig(config: ServerConfig): ValidationResult[];
  getDefaultConfig(type: ServerType): ServerConfig;
}

export interface ServerBuilder {
  withConfig(config: Partial<ServerConfig>): ServerBuilder;
  withProtocol(protocol: ProtocolType, enabled: boolean): ServerBuilder;
  withFeature(feature: keyof ServerFeatures, enabled: boolean): ServerBuilder;
  withMiddleware(middleware: MiddlewareDefinition): ServerBuilder;
  withRoute(route: RouteDefinition): ServerBuilder;
  withHealthCheck(check: HealthCheckDefinition): ServerBuilder;
  build(): Promise<UnifiedServer>;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

export interface ServerEvents {
  // Lifecycle events
  'server-starting': () => void;
  'server-started': (status: ServerStatus) => void;
  'server-stopping': () => void;
  'server-stopped': () => void;
  'server-error': (error: Error) => void;
  
  // Request events
  'request-received': (req: TypedRequest) => void;
  'request-completed': (req: TypedRequest, res: TypedResponse, duration: number) => void;
  'request-error': (req: TypedRequest, error: Error) => void;
  
  // WebSocket events
  'websocket-connected': (client: WebSocketClient) => void;
  'websocket-disconnected': (client: WebSocketClient) => void;
  'websocket-message': (client: WebSocketClient, message: WebSocketMessage) => void;
  'websocket-error': (client: WebSocketClient, error: Error) => void;
  
  // MCP events
  'mcp-tool-called': (toolName: string, args: JSONObject, result: MCPToolResult) => void;
  'mcp-tool-error': (toolName: string, args: JSONObject, error: Error) => void;
  
  // Health events
  'health-check': (check: HealthCheck) => void;
  'health-changed': (health: ServerHealth) => void;
  
  // Configuration events
  'config-updated': (config: ServerConfig, changes: string[]) => void;
  'config-error': (error: Error) => void;
  
  // Metrics events
  'metrics-collected': (metrics: ServerMetrics) => void;
  'performance-warning': (metric: string, value: number, threshold: number) => void;
}