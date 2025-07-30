/**
 * API System Types
 * RESTful API, GraphQL, WebSocket, and gRPC interfaces
 */

import { Identifiable, JSONObject, JSONValue, ResourceUsage } from './core';

// =============================================================================
// API CORE TYPES
// =============================================================================

export type APIType = 'rest' | 'graphql' | 'grpc' | 'websocket' | 'sse' | 'webhook' | 'rpc';
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
export type APIStatus = 'active' | 'deprecated' | 'beta' | 'alpha' | 'retired' | 'maintenance';
export type AuthenticationType = 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2' | 'jwt' | 'custom';
export type RateLimitType = 'fixed-window' | 'sliding-window' | 'token-bucket' | 'leaky-bucket';

// =============================================================================
// API DEFINITION
// =============================================================================

export interface APIDefinition extends Identifiable {
  name: string;
  version: string;
  type: APIType;
  status: APIStatus;
  
  // Basic information
  title: string;
  description: string;
  baseUrl: string;
  basePath?: string;
  
  // Server configuration
  servers: APIServer[];
  
  // API specification
  specification: APISpecification;
  
  // Security
  security: SecurityScheme[];
  authentication: AuthenticationType;
  authorization: AuthorizationConfig;
  
  // Rate limiting
  rateLimiting: RateLimitConfig;
  
  // CORS configuration
  cors: CORSConfig;
  
  // Monitoring and observability
  monitoring: MonitoringConfig;
  
  // Documentation
  documentation: DocumentationConfig;
  
  // Lifecycle
  deprecated: boolean;
  deprecationDate?: Date;
  retirementDate?: Date;
  migrationPath?: string;
  
  // Metadata
  tags: string[];
  categories: string[];
  owner: string;
  maintainers: string[];
  
  // Quality attributes
  sla: ServiceLevelAgreement;
  
  // Usage statistics
  statistics: APIStatistics;
}

export interface APIServer {
  url: string;
  description: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  
  // Configuration
  timeout: number; // milliseconds
  retries: number;
  keepAlive: boolean;
  compression: boolean;
  
  // Health
  healthy: boolean;
  lastHealthCheck: Date;
  responseTime: number; // milliseconds
  
  // Load balancing
  weight: number;
  priority: number;
  active: boolean;
}

// =============================================================================
// REST API
// =============================================================================

export interface RESTAPISpecification extends APISpecification {
  type: 'rest';
  openapi: string; // OpenAPI version
  
  // Resources and operations
  paths: Record<string, PathItem>;
  components: ComponentsObject;
  
  // Global configuration
  produces: string[];
  consumes: string[];
  
  // Parameters
  parameters: Parameter[];
  
  // Responses
  responses: Record<string, Response>;
  
  // Security
  securityDefinitions: Record<string, SecurityScheme>;
}

export interface PathItem {
  summary?: string;
  description?: string;
  
  // HTTP operations
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  head?: Operation;
  options?: Operation;
  trace?: Operation;
  
  // Parameters
  parameters?: Parameter[];
  
  // Servers
  servers?: APIServer[];
}

export interface Operation extends Identifiable {
  summary: string;
  description?: string;
  operationId: string;
  tags: string[];
  
  // Request/Response
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  
  // Security
  security: SecurityRequirement[];
  
  // Callbacks and webhooks
  callbacks?: Record<string, Callback>;
  
  // Extensions
  deprecated: boolean;
  servers?: APIServer[];
  
  // Custom attributes
  rateLimit?: RateLimitConfig;
  timeout?: number; // milliseconds
  caching?: CachingConfig;
  
  // Implementation details
  handler: string;
  middleware: string[];
  
  // Quality attributes
  complexity: 'low' | 'medium' | 'high';
  performance: PerformanceRequirements;
  
  // Documentation
  examples: Example[];
  externalDocs?: ExternalDocumentation;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie' | 'body' | 'form';
  description?: string;
  required: boolean;
  deprecated: boolean;
  
  // Schema
  schema: JSONSchema;
  
  // Validation
  allowEmptyValue: boolean;
  style?: string;
  explode: boolean;
  allowReserved: boolean;
  
  // Examples
  example?: JSONValue;
  examples?: Record<string, Example>;
}

export interface RequestBody {
  description?: string;
  content: Record<string, MediaType>;
  required: boolean;
  
  // Validation
  maxSize?: number; // bytes
  
  // Examples
  examples?: Record<string, Example>;
}

export interface Response {
  description: string;
  headers?: Record<string, Header>;
  content?: Record<string, MediaType>;
  
  // Caching
  caching?: ResponseCachingConfig;
  
  // Examples
  examples?: Record<string, Example>;
}

export interface MediaType {
  schema: JSONSchema;
  example?: JSONValue;
  examples?: Record<string, Example>;
  encoding?: Record<string, Encoding>;
}

export interface Header {
  description?: string;
  required: boolean;
  deprecated: boolean;
  schema: JSONSchema;
  
  // Style
  style?: string;
  explode: boolean;
  
  // Examples
  example?: JSONValue;
  examples?: Record<string, Example>;
}

// =============================================================================
// GRAPHQL API
// =============================================================================

export interface GraphQLAPISpecification extends APISpecification {
  type: 'graphql';
  
  // Schema definition
  schema: GraphQLSchema;
  
  // Resolvers
  resolvers: Record<string, GraphQLResolver>;
  
  // Directives
  directives: GraphQLDirective[];
  
  // Subscriptions
  subscriptions: GraphQLSubscription[];
  
  // Federation
  federation?: FederationConfig;
  
  // Introspection
  introspection: boolean;
  playground: boolean;
  
  // Performance
  queryComplexity: QueryComplexityConfig;
  queryDepth: number;
  queryTimeout: number; // milliseconds
  
  // Caching
  caching: GraphQLCachingConfig;
}

export interface GraphQLSchema {
  // Root types
  query: GraphQLObjectType;
  mutation?: GraphQLObjectType;
  subscription?: GraphQLObjectType;
  
  // Type definitions
  types: Record<string, GraphQLType>;
  
  // Enums
  enums: Record<string, GraphQLEnumType>;
  
  // Interfaces
  interfaces: Record<string, GraphQLInterfaceType>;
  
  // Unions
  unions: Record<string, GraphQLUnionType>;
  
  // Scalars
  scalars: Record<string, GraphQLScalarType>;
  
  // Input types
  inputs: Record<string, GraphQLInputType>;
}

export interface GraphQLType {
  name: string;
  description?: string;
  fields: Record<string, GraphQLField>;
  interfaces?: string[];
  
  // Authorization
  authorize?: string[];
  
  // Caching
  cacheControl?: CacheControlConfig;
}

export interface GraphQLField {
  type: string;
  description?: string;
  args: Record<string, GraphQLArgument>;
  
  // Deprecation
  deprecated: boolean;
  deprecationReason?: string;
  
  // Authorization
  authorize?: string[];
  
  // Caching
  cacheControl?: CacheControlConfig;
  
  // Resolution
  resolver?: string;
  complexity?: number;
}

export interface GraphQLArgument {
  type: string;
  description?: string;
  defaultValue?: JSONValue;
  
  // Validation
  required: boolean;
  validation?: ValidationRule[];
}

export interface GraphQLResolver {
  name: string;
  type: 'query' | 'mutation' | 'subscription' | 'field';
  implementation: string;
  
  // Performance
  timeout?: number; // milliseconds
  complexity?: number;
  
  // Caching
  caching?: CachingConfig;
  
  // Authorization
  authorize?: string[];
  
  // Rate limiting
  rateLimit?: RateLimitConfig;
}

// =============================================================================
// WEBSOCKET API
// =============================================================================

export interface WebSocketAPISpecification extends APISpecification {
  type: 'websocket';
  
  // Connection
  path: string;
  protocols: string[];
  
  // Message types
  messages: Record<string, WebSocketMessage>;
  
  // Events
  events: Record<string, WebSocketEvent>;
  
  // Authentication
  authentication: WebSocketAuth;
  
  // Configuration
  maxConnections: number;
  maxMessageSize: number; // bytes
  heartbeatInterval: number; // milliseconds
  
  // Compression
  compression: boolean;
  extensions: string[];
}

export interface WebSocketMessage {
  type: string;
  description?: string;
  schema: JSONSchema;
  
  // Direction
  direction: 'client-to-server' | 'server-to-client' | 'bidirectional';
  
  // Processing
  handler?: string;
  validator?: string;
  
  // Rate limiting
  rateLimit?: RateLimitConfig;
  
  // Examples
  examples: Example[];
}

export interface WebSocketEvent {
  name: string;
  description?: string;
  payload: JSONSchema;
  
  // Subscription
  subscription?: boolean;
  filters?: EventFilter[];
  
  // Examples
  examples: Example[];
}

export interface WebSocketAuth {
  required: boolean;
  methods: ('token' | 'cookie' | 'header' | 'query')[];
  
  // Token validation  
  tokenValidation?: TokenValidationConfig;
  
  // Session management
  sessionTimeout: number; // milliseconds
  maxSessions: number;
}

// =============================================================================
// GRPC API
// =============================================================================

export interface GRPCAPISpecification extends APISpecification {
  type: 'grpc';
  
  // Protocol buffer definition
  protoFile: string;
  package: string;
  
  // Services
  services: Record<string, GRPCService>;
  
  // Messages
  messages: Record<string, GRPCMessage>;
  
  // Enums
  enums: Record<string, GRPCEnum>;
  
  // Imports
  imports: string[];
  
  // Options
  options: Record<string, JSONValue>;
}

export interface GRPCService {
  name: string;
  description?: string;
  methods: Record<string, GRPCMethod>;
  
  // Configuration
  timeout: number; // milliseconds
  retry: RetryConfig;
  
  // Security
  authentication: boolean;
  authorization: string[];
}

export interface GRPCMethod {
  name: string;
  description?: string;
  inputType: string;
  outputType: string;
  
  // Streaming
  clientStreaming: boolean;
  serverStreaming: boolean;
  
  // Configuration
  timeout?: number; // milliseconds
  idempotent: boolean;
  
  // Implementation
  handler: string;
  
  // Options
  options: Record<string, JSONValue>;
}

export interface GRPCMessage {
  name: string;
  fields: Record<string, GRPCField>;
  
  // Nested types
  nested?: Record<string, GRPCMessage>;
  
  // Options
  options?: Record<string, JSONValue>;
}

export interface GRPCField {
  type: string;
  number: number;
  rule?: 'optional' | 'required' | 'repeated';
  
  // Options
  options?: Record<string, JSONValue>;
}

export interface GRPCEnum {
  name: string;
  values: Record<string, number>;
  
  // Options
  options?: Record<string, JSONValue>;
}

// =============================================================================
// SECURITY
// =============================================================================

export interface SecurityScheme {
  type: AuthenticationType;
  name: string;
  description?: string;
  
  // Configuration based on type
  config: SecuritySchemeConfig;
  
  // Scopes (for OAuth2)
  scopes?: Record<string, string>;
  
  // Token configuration
  tokenConfig?: TokenConfig;
}

export interface SecuritySchemeConfig {
  // Basic auth
  realm?: string;
  
  // API Key
  keyLocation?: 'header' | 'query' | 'cookie';
  keyName?: string;
  
  // OAuth2
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  flows?: OAuthFlow[];
  
  // JWT
  algorithm?: string;
  publicKey?: string;
  issuer?: string;
  audience?: string;
  
  // Custom
  validator?: string;
  
  // Common settings
  caseSensitive?: boolean;
  required?: boolean;
}

export interface OAuthFlow {
  type: 'authorizationCode' | 'implicit' | 'password' | 'clientCredentials';
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface TokenConfig {
  lifetime: number; // seconds
  refreshable: boolean;
  algorithm: string;
  issuer: string;
  audience: string;
  
  // Validation
  validateIssuer: boolean;
  validateAudience: boolean;
  validateExpiry: boolean;
  validateSignature: boolean;
  
  // Claims
  requiredClaims: string[];
  optionalClaims: string[];
  
  // Refresh token
  refreshTokenLifetime?: number; // seconds
  refreshTokenRotation?: boolean;
}

export interface AuthorizationConfig {
  enabled: boolean;
  defaultPolicy: 'allow' | 'deny';
  
  // Role-based access control
  rbac: RBACConfig;
  
  // Attribute-based access control
  abac: ABACConfig;
  
  // Resource-based permissions
  permissions: Permission[];
  
  // Policy engine
  policyEngine?: PolicyEngineConfig;
}

export interface RBACConfig {
  enabled: boolean;
  roles: Role[];
  hierarchical: boolean;
  inheritance: boolean;
}

export interface ABACConfig {
  enabled: boolean;
  policies: ABACPolicy[];
  attributes: AttributeDefinition[];
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: PermissionCondition[];
  
  // Scope
  scope: 'global' | 'tenant' | 'user' | 'resource';
  
  // Inheritance
  inheritable: boolean;
  inherited: boolean;
}

export interface Role {
  name: string;
  description?: string;
  permissions: string[];
  
  // Hierarchy
  parent?: string;
  children: string[];
  
  // Metadata
  system: boolean;
  assignable: boolean;
}

export interface ABACPolicy {
  name: string;
  description?: string;
  effect: 'allow' | 'deny';
  
  // Conditions
  subject: AttributeCondition[];
  resource: AttributeCondition[];
  action: AttributeCondition[];
  environment: AttributeCondition[];
  
  // Policy language
  expression?: string;
  
  // Priority
  priority: number;
}

export interface AttributeDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description?: string;
  
  // Value constraints
  required: boolean;
  multiple: boolean;
  values?: JSONValue[];
  
  // Sources
  sources: AttributeSource[];
}

export interface AttributeSource {
  type: 'static' | 'token' | 'header' | 'query' | 'database' | 'service' | 'computed';
  config: JSONObject;
  caching?: CachingConfig;
}

export interface AttributeCondition {
  attribute: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex' | 'contains';
  value: JSONValue;
}

export interface PermissionCondition {
  type: 'time' | 'location' | 'resource' | 'custom';
  expression: string;
  parameters: JSONObject;
}

export interface PolicyEngineConfig {
  engine: 'opa' | 'casbin' | 'cedar' | 'custom';
  policies: string[];
  dataSource?: string;
  
  // Performance
  caching: boolean;
  cacheTTL: number; // seconds
  
  // Decision logging
  logging: boolean;
  auditTrail: boolean;
}

// =============================================================================
// RATE LIMITING
// =============================================================================

export interface RateLimitConfig {
  enabled: boolean;
  type: RateLimitType;
  
  // Limits
  requests: number;
  window: number; // seconds
  burst?: number;
  
  // Scope
  scope: 'global' | 'user' | 'ip' | 'api-key' | 'custom';
  keyExtractor?: string;
  
  // Behavior
  skipSuccessful?: boolean;
  skipFailed?: boolean;
  
  // Response
  headers: boolean;
  message?: string;
  retryAfter?: boolean;
  
  // Storage
  storage: RateLimitStorage;
  
  // Exemptions
  whitelist: string[];
  
  // Dynamic limits
  dynamic?: DynamicRateLimitConfig;
}

export interface RateLimitStorage {
  type: 'memory' | 'redis' | 'database' | 'custom';
  config: JSONObject;
  
  // Performance
  keyPrefix?: string;
  ttl?: number; // seconds
}

export interface DynamicRateLimitConfig {
  enabled: boolean;
  factors: RateLimitFactor[];
  
  // Scaling
  minRate: number;
  maxRate: number;
  scalingFactor: number;
  
  // Adaptation
  adaptationPeriod: number; // seconds
  cooldownPeriod: number; // seconds
}

export interface RateLimitFactor {
  type: 'load' | 'errors' | 'latency' | 'custom';
  weight: number;
  threshold: number;
  operation: 'increase' | 'decrease' | 'multiply' | 'divide';
}

// =============================================================================
// MONITORING & OBSERVABILITY
// =============================================================================

export interface MonitoringConfig {
  enabled: boolean;
  
  // Metrics
  metrics: MetricsConfig;
  
  // Logging
  logging: LoggingConfig;
  
  // Tracing
  tracing: TracingConfig;
  
  // Health checks
  healthChecks: HealthCheckConfig;
  
  // Alerting
  alerting: AlertingConfig;
}

export interface MetricsConfig {
  enabled: boolean;
  provider: 'prometheus' | 'datadog' | 'newrelic' | 'custom';
  
  // Collection
  interval: number; // seconds
  retention: number; // days
  
  // Metrics to collect
  requestCount: boolean;
  responseTime: boolean;
  errorRate: boolean;
  throughput: boolean;
  concurrency: boolean;
  
  // Custom metrics
  custom: CustomMetric[];
  
  // Cardinality limits
  maxCardinality: number;
  
  // Export
  exportInterval: number; // seconds
  exportBatch: number;
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  
  // Request/Response logging
  requests: boolean;
  responses: boolean;
  errors: boolean;
  
  // Content
  headers: boolean;
  body: boolean;
  maxBodySize: number; // bytes
  
  // Sensitive data
  sanitization: boolean;
  sensitiveFields: string[];
  
  // Structured logging
  structured: boolean;
  format: 'json' | 'text' | 'custom';
  
  // Correlation
  correlationId: boolean;
  traceId: boolean;
  
  // Sampling
  sampling: SamplingConfig;
}

export interface TracingConfig {
  enabled: boolean;
  provider: 'jaeger' | 'zipkin' | 'datadog' | 'custom';
  
  // Sampling
  samplingRate: number; // 0-1
  samplingStrategy: 'constant' | 'probabilistic' | 'adaptive';
  
  // Propagation
  propagation: string[];
  
  // Tags
  defaultTags: Record<string, string>;
  
  // Performance
  maxSpans: number;
  batchSize: number;
  flushInterval: number; // milliseconds
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // seconds
  timeout: number; // milliseconds
  
  // Checks
  checks: HealthCheck[];
  
  // Endpoints
  endpoint: string;
  detailedEndpoint: string;
  
  // Response format
  format: 'simple' | 'detailed' | 'custom';
}

export interface HealthCheck {
  name: string;
  type: 'database' | 'service' | 'file' | 'custom';
  config: JSONObject;
  
  // Thresholds
  timeout: number; // milliseconds
  retries: number;
  
  // Criticality
  critical: boolean;
  weight: number;
}

export interface AlertingConfig {
  enabled: boolean;
  
  // Alert rules
  rules: AlertRule[];
  
  // Notification channels
  channels: NotificationChannel[];
  
  // Grouping and suppression
  grouping: AlertGroupingConfig;
  suppression: AlertSuppressionConfig;
  
  // Escalation
  escalation: AlertEscalationConfig;
}

export interface AlertRule {
  name: string;
  description?: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  
  // Condition
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  threshold: number;
  duration: number; // seconds
  
  // Evaluation
  evaluationInterval: number; // seconds
  forPeriod: number; // seconds
  
  // Actions
  actions: AlertAction[];
  
  // Labels
  labels: Record<string, string>;
  
  // State
  enabled: boolean;
  muted: boolean;
}

export interface NotificationChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'sms' | 'custom';
  config: JSONObject;
  
  // Filtering
  severities: string[];
  tags: Record<string, string>;
  
  // Rate limiting
  rateLimit?: RateLimitConfig;
  
  // Template
  template?: string;
}

export interface AlertAction {
  type: 'notify' | 'webhook' | 'script' | 'restart' | 'scale' | 'custom';
  config: JSONObject;
  
  // Conditions
  conditions?: AlertCondition[];
  
  // Retry
  retries: number;
  retryDelay: number; // seconds
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface APISpecification {
  type: APIType;
  version: string;
  
  // Common fields will be extended by specific API types
  info: {
    title: string;
    description?: string;
    version: string;
    contact?: ContactInfo;
    license?: LicenseInfo;
    termsOfService?: string;
  };
  
  // External documentation
  externalDocs?: ExternalDocumentation;
  
  // Extensions
  extensions?: Record<string, JSONValue>;
}

export interface ComponentsObject {
  schemas: Record<string, JSONSchema>;
  responses: Record<string, Response>;
  parameters: Record<string, Parameter>;
  examples: Record<string, Example>;
  requestBodies: Record<string, RequestBody>;
  headers: Record<string, Header>;
  securitySchemes: Record<string, SecurityScheme>;
  links: Record<string, Link>;
  callbacks: Record<string, Callback>;
  pathItems: Record<string, PathItem>;
}

export interface JSONSchema {
  type: string;
  format?: string;
  title?: string;
  description?: string;
  
  // Validation
  required?: string[];
  properties?: Record<string, JSONSchema>;
  additionalProperties?: boolean | JSONSchema;
  items?: JSONSchema;
  
  // Constraints
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: JSONValue[];
  
  // Examples
  example?: JSONValue;
  examples?: JSONValue[];
  
  // Composition
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
  
  // References
  $ref?: string;
  
  // Extensions
  [key: string]: any;
}

export interface Example {
  summary?: string;
  description?: string;
  value?: JSONValue;
  externalValue?: string;
}

export interface ExternalDocumentation {
  description?: string;
  url: string;
}

export interface ContactInfo {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseInfo {
  name: string;
  identifier?: string;
  url?: string;
}

export interface SecurityRequirement {
  [name: string]: string[];
}

export interface Callback {
  [expression: string]: PathItem | Reference;
}

export interface Link {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, JSONValue>;
  requestBody?: JSONValue;
  description?: string;
  server?: APIServer;
}

export interface Reference {
  $ref: string;
  summary?: string;
  description?: string;
}

export interface Encoding {
  contentType?: string;
  headers?: Record<string, Header>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

export interface EventFilter {
  field: string;
  operator: string;
  value: JSONValue;
}

export interface ValidationRule {
  type: string;
  config: JSONObject;
  message?: string;
}

export interface CachingConfig {
  enabled: boolean;
  strategy: 'ttl' | 'lru' | 'lfu' | 'custom';
  ttl: number; // seconds
  maxSize: number;
  key?: string;
  
  // Invalidation
  invalidateOn: string[];
  tags: string[];
  
  // Headers
  cacheControl: boolean;
  etag: boolean;
  lastModified: boolean;
  vary: string[];
}

export interface ResponseCachingConfig extends CachingConfig {
  // Response-specific caching
  statusCodes: number[];
  private: boolean;
  noStore: boolean;
  noCache: boolean;
  mustRevalidate: boolean;
  staleWhileRevalidate: number; // seconds
}

export interface CacheControlConfig {
  maxAge: number; // seconds
  scope: 'public' | 'private';
}

export interface PerformanceRequirements {
  maxResponseTime: number; // milliseconds
  minThroughput: number; // requests per second
  maxConcurrency: number;
  maxMemoryUsage: number; // MB
  maxCpuUsage: number; // percentage
}

export interface ServiceLevelAgreement {
  availability: number; // 0-1
  responseTime: number; // milliseconds (95th percentile)
  throughput: number; // requests per second
  errorRate: number; // 0-1
  
  // Uptime requirements
  uptimeDaily: number; // 0-1
  uptimeMonthly: number; // 0-1
  uptimeYearly: number; // 0-1
  
  // Recovery
  mttd: number; // mean time to detection (minutes)
  mttr: number; // mean time to recovery (minutes)
  
  // Business hours
  businessHours?: {
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
    weekdays: number[]; // 0-6
  };
}

export interface APIStatistics {
  // Usage statistics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  
  // Performance statistics
  averageResponseTime: number; // milliseconds
  p95ResponseTime: number; // milliseconds
  p99ResponseTime: number; // milliseconds
  
  // Throughput
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  
  // Error statistics
  errorRate: number; // 0-1
  timeoutRate: number; // 0-1
  
  // Status code distribution
  statusCodes: Record<number, number>;
  
  // Popular endpoints
  popularEndpoints: {
    path: string;
    method: HTTPMethod;
    requests: number;
    averageResponseTime: number;
  }[];
  
  // User statistics
  uniqueUsers: number;
  activeUsers: number;
  
  // Geographic distribution
  geographicDistribution: Record<string, number>;
  
  // Time-based statistics
  timeRange: {
    start: Date;
    end: Date;
  };
  
  // Resource usage
  resourceUsage: ResourceUsage;
  
  // Cache statistics
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number; // 0-1
    evictions: number;
  };
}

export interface DocumentationConfig {
  enabled: boolean;
  
  // Auto-generation
  autoGenerate: boolean;
  outputPath: string;
  format: 'html' | 'markdown' | 'pdf' | 'openapi' | 'postman';
  
  // Content
  includeExamples: boolean;
  includeSchemas: boolean;
  includeAuthentication: boolean;
  includeRateLimiting: boolean;
  
  // Customization
  theme?: string;
  logo?: string;
  customCSS?: string;
  customJS?: string;
  
  // Interactive features
  tryItOut: boolean;
  codeGeneration: boolean;
  
  // Publishing
  publish: boolean;
  publishUrl?: string;
  accessControl?: string[];
}

export interface CORSConfig {
  enabled: boolean;
  allowedOrigins: string[];
  allowedMethods: HTTPMethod[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number; // seconds
  
  // Security
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  
  // Collection
  extractor: string;
  conditions?: MetricCondition[];
  
  // Aggregation
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  
  // Alerting
  alertRules?: AlertRule[];
}

export interface MetricCondition {
  field: string;
  operator: string;
  value: JSONValue;
}

export interface SamplingConfig {
  enabled: boolean;
  rate: number; // 0-1
  strategy: 'random' | 'deterministic' | 'adaptive';
  
  // Adaptive sampling
  targetRate?: number;
  adjustmentInterval?: number; // seconds
  
  // Conditional sampling
  conditions?: SamplingCondition[];
}

export interface SamplingCondition {
  field: string;
  operator: string;
  value: JSONValue;
  sampleRate: number; // 0-1
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  multiplier: number;
  jitter: boolean;
  
  // Retry conditions
  retryableStatus: number[];
  retryableErrors: string[];
  
  // Circuit breaker
  circuitBreaker?: CircuitBreakerConfig;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number; // milliseconds
  successThreshold: number;
  
  // Monitoring
  monitoringPeriod: number; // milliseconds
  
  // Half-open state
  halfOpenMaxCalls: number;
}

export interface TokenValidationConfig {
  algorithm: string;
  publicKey: string;
  issuer?: string;
  audience?: string;
  
  // Validation options
  validateIssuer: boolean;
  validateAudience: boolean;
  validateExpiry: boolean;
  validateNotBefore: boolean;
  
  // Clock skew
  clockSkew: number; // seconds
  
  // Custom validation
  customValidator?: string;
}

export interface AlertGroupingConfig {
  enabled: boolean;
  groupBy: string[];
  groupWait: number; // seconds
  groupInterval: number; // seconds
  repeatInterval: number; // seconds
}

export interface AlertSuppressionConfig {
  enabled: boolean;
  rules: SuppressionRule[];
}

export interface SuppressionRule {
  name: string;
  condition: string;
  duration: number; // seconds
  reason: string;
}

export interface AlertEscalationConfig {
  enabled: boolean;
  levels: EscalationLevel[];
}

export interface EscalationLevel {
  level: number;
  delay: number; // seconds
  channels: string[];
  conditions?: AlertCondition[];
}

export interface AlertCondition {
  field: string;
  operator: string;
  value: JSONValue;
}