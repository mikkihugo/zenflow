/**
 * API System Types
 * RESTful API, GraphQL, WebSocket, and gRPC interfaces
 */

import type { Identifiable, JSONObject, JSONValue, ResourceUsage } from './core';

// =============================================================================
// API CORE TYPES
// =============================================================================

export type APIType = 'rest' | 'graphql' | 'grpc' | 'websocket' | 'sse' | 'webhook' | 'rpc';
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
export type APIStatus = 'active' | 'deprecated' | 'beta' | 'alpha' | 'retired' | 'maintenance';
export type AuthenticationType =
  | 'none'
  | 'basic'
  | 'bearer'
  | 'api-key'
  | 'oauth2'
  | 'jwt'
  | 'custom';
export type RateLimitType = 'fixed-window' | 'sliding-window' | 'token-bucket' | 'leaky-bucket';

// =============================================================================
// API DEFINITION
// =============================================================================

export interface APIDefinition extends Identifiable {name = ============================================================================
// REST API
// =============================================================================

export interface RESTAPISpecification extends APISpecification {type = ============================================================================
// GRAPHQL API
// =============================================================================

export interface GraphQLAPISpecification extends APISpecification {type = ============================================================================
// WEBSOCKET API
// =============================================================================

export interface WebSocketAPISpecification extends APISpecification {type = ============================================================================
// GRPC API
// =============================================================================

export interface GRPCAPISpecification extends APISpecification {type = ============================================================================
// SECURITY
// =============================================================================

export interface SecurityScheme {type = ============================================================================
// RATE LIMITING
// =============================================================================

export interface RateLimitConfig {enabled = ============================================================================
// MONITORING & OBSERVABILITY
// =============================================================================

export interface MonitoringConfig {enabled = ============================================================================
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
