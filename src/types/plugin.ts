/**
 * Plugin System Types
 * Comprehensive plugin architecture for extensible functionality
 */

import { Identifiable, JSONObject, TypedEventEmitter, LifecycleManager, LifecycleState, OperationResult, ErrorDetails, ValidationResult, HealthCheck } from './core.js';

// =============================================================================
// PLUGIN CORE TYPES
// =============================================================================

export type PluginType = 
  | 'ai-provider'
  | 'architect-advisor'
  | 'security-auth'
  | 'notifications'
  | 'export-system'
  | 'documentation-linker'
  | 'workflow-engine'
  | 'github-integration'
  | 'memory-backend'
  | 'performance-monitor'
  | 'code-analysis'
  | 'test-runner'
  | 'database-connector'
  | 'neural-processor'
  | 'vision-processor'
  | 'custom';

export type PluginStatus = 'unloaded' | 'loading' | 'loaded' | 'initializing' | 'active' | 'error' | 'disabled';

export type HookType = 
  | 'pre-task'
  | 'post-task'
  | 'pre-edit'
  | 'post-edit'
  | 'pre-search'
  | 'post-search'
  | 'pre-command'
  | 'post-command'
  | 'session-start'
  | 'session-end'
  | 'notification'
  | 'error'
  | 'health-check'
  | 'performance-metric';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  type: PluginType;
  author: string;
  license: string;
  homepage?: string;
  repository?: string;
  
  // Dependencies
  dependencies: {
    system: string[]; // System requirements
    plugins: Record<string, string>; // Plugin dependencies with versions
    node: string; // Node.js version requirement
    npm?: Record<string, string>; // NPM package dependencies
  };
  
  // Capabilities
  capabilities: {
    hooks: HookType[];
    apis: string[];
    permissions: PluginPermission[];
    resources: ResourceRequirement[];
    platforms: string[];
    languages: string[];
  };
  
  // Configuration
  configuration: {
    schema: JSONObject; // JSON Schema for configuration
    defaults: JSONObject;
    required: string[];
    sensitive: string[]; // Fields that contain secrets
  };
  
  // Entry points
  entryPoints: {
    main: string;
    worker?: string;
    hooks?: string;
    cli?: string;
    web?: string;
  };
  
  // Assets and resources
  assets: {
    files: string[];
    directories: string[];
    templates: string[];
    schemas: string[];
  };
  
  // Metadata
  keywords: string[];
  category: string;
  maturity: 'experimental' | 'beta' | 'stable' | 'deprecated';
  compatibility: {
    minVersion: string;
    maxVersion?: string;
    breaking: string[];
  };
}

export interface PluginConfig {
  // Plugin identification
  name: string;
  version: string;
  enabled: boolean;
  autoLoad: boolean;
  
  // Runtime configuration
  settings: JSONObject;
  environment: JSONObject;
  resources: {
    memory: number; // MB
    cpu: number; // percentage
    disk: number; // MB
    network: boolean;
  };
  
  // Security
  permissions: PluginPermission[];
  sandbox: boolean;
  trustedDomains: string[];
  
  // Hooks and integration
  hooks: {
    [key in HookType]?: {
      enabled: boolean;
      priority: number;
      conditions: string[];
      timeout: number;
    };
  };
  
  // Monitoring
  monitoring: {
    enabled: boolean;
    metrics: boolean;
    logging: boolean;
    performance: boolean;
    errors: boolean;
  };
  
  // Development
  development: {
    hotReload: boolean;
    debugMode: boolean;
    profiling: boolean;
    sourceMaps: boolean;
  };
}

export type PluginPermission = 
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network:outbound'
  | 'network:inbound'
  | 'process:spawn'
  | 'system:env'
  | 'database:read'
  | 'database:write'
  | 'memory:read'
  | 'memory:write'
  | 'hooks:register'
  | 'api:expose'
  | 'events:emit'
  | 'config:read'
  | 'config:write'
  | 'secrets:read'
  | 'users:read'
  | 'users:write'
  | 'admin:system';

export interface ResourceRequirement {
  type: 'memory' | 'cpu' | 'disk' | 'network' | 'gpu' | 'database';
  minimum: number;
  recommended: number;
  maximum?: number;
  unit: string;
  description: string;
}

// =============================================================================
// PLUGIN RUNTIME
// =============================================================================

export interface PluginContext {
  // Plugin information
  plugin: PluginMetadata;
  config: PluginConfig;
  manifest: PluginManifest;
  
  // System access
  system: {
    version: string;
    environment: string;
    instanceId: string;
    startTime: Date;
  };
  
  // APIs and services
  apis: {
    logger: PluginLogger;
    memory: PluginMemoryAPI;
    events: PluginEventAPI;
    http: PluginHttpAPI;
    filesystem: PluginFilesystemAPI;
    database: PluginDatabaseAPI;
    cache: PluginCacheAPI;
    queue: PluginQueueAPI;
    secrets: PluginSecretsAPI;
  };
  
  // Integration points
  hooks: PluginHookRegistry;
  router: PluginRouter;
  scheduler: PluginScheduler;
  metrics: PluginMetrics;
  
  // Security context
  security: {
    permissions: PluginPermission[];
    sandbox: boolean;
    userId?: string;
    sessionId?: string;
    requestId?: string;
  };
  
  // Resource management
  resources: {
    allocated: ResourceUsage;
    limits: ResourceRequirement[];
    monitoring: boolean;
  };
}

export interface PluginMetadata extends Identifiable {
  name: string;
  version: string;
  type: PluginType;
  status: PluginStatus;
  
  // Runtime information
  loadedAt: Date;
  lastActivity: Date;
  errorCount: number;
  restartCount: number;
  
  // Performance metrics
  metrics: {
    callCount: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
    successRate: number;
  };
  
  // Health status
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    issues: string[];
    lastCheck: Date;
  };
  
  // Dependencies
  dependencies: {
    loaded: string[];
    missing: string[];
    conflicts: string[];
  };
}

// =============================================================================
// PLUGIN EVENTS
// =============================================================================

export interface PluginEvents {
  // Index signature for EventMap compatibility
  [event: string]: (...args: any[]) => void;
  
  // Lifecycle events
  'loading': (pluginName: string) => void;
  'loaded': (pluginName: string, metadata: PluginMetadata) => void;
  'initializing': (pluginName: string) => void;
  'initialized': (pluginName: string) => void;
  'starting': (pluginName: string) => void;
  'started': (pluginName: string) => void;
  'stopping': (pluginName: string) => void;
  'stopped': (pluginName: string) => void;
  'unloading': (pluginName: string) => void;
  'unloaded': (pluginName: string) => void;
  'error': (pluginName: string, error: ErrorDetails) => void;
  'restarted': (pluginName: string) => void;
  
  // Hook events
  'hook-registered': (pluginName: string, hookType: HookType) => void;
  'hook-unregistered': (pluginName: string, hookType: HookType) => void;
  'hook-executed': (pluginName: string, hookType: HookType, duration: number) => void;
  'hook-failed': (pluginName: string, hookType: HookType, error: ErrorDetails) => void;
  
  // API events
  'api-registered': (pluginName: string, apiName: string) => void;
  'api-unregistered': (pluginName: string, apiName: string) => void;
  'api-called': (pluginName: string, apiName: string, duration: number) => void;
  'api-failed': (pluginName: string, apiName: string, error: ErrorDetails) => void;
  
  // Resource events
  'resource-warning': (pluginName: string, resource: string, usage: number, limit: number) => void;
  'resource-exceeded': (pluginName: string, resource: string, usage: number, limit: number) => void;
  'performance-degraded': (pluginName: string, metric: string, value: number) => void;
  
  // Security events
  'permission-denied': (pluginName: string, permission: PluginPermission, context: string) => void;
  'security-violation': (pluginName: string, violation: string, context: JSONObject) => void;
  'sandbox-breach': (pluginName: string, attempt: string) => void;
}

// =============================================================================
// PLUGIN INTERFACE
// =============================================================================

export interface Plugin extends Identifiable {
  // Metadata
  readonly manifest: PluginManifest;
  readonly config: PluginConfig;
  readonly metadata: PluginMetadata;
  readonly context: PluginContext;
  
  // Lifecycle state
  readonly state: LifecycleState;
  readonly startTime?: Date;
  readonly stopTime?: Date;
  
  // Event emitter methods
  on<K extends keyof PluginEvents>(event: K, listener: PluginEvents[K]): this;
  emit<K extends keyof PluginEvents>(event: K, ...args: Parameters<PluginEvents[K]>): boolean;
  once<K extends keyof PluginEvents>(event: K, listener: PluginEvents[K]): this;
  off<K extends keyof PluginEvents>(event: K, listener: PluginEvents[K]): this;
  removeAllListeners<K extends keyof PluginEvents>(event?: K): this;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  getHealth(): Promise<HealthCheck>;
  
  // Plugin-specific lifecycle methods
  load(config: PluginConfig): Promise<void>;
  unload(): Promise<void>;
  reload(): Promise<void>;
  configure(updates: Partial<PluginConfig>): Promise<void>;
  
  // Hook system
  registerHook(type: HookType, handler: HookHandler, options?: HookOptions): Promise<void>;
  unregisterHook(type: HookType, handler: HookHandler): Promise<void>;
  executeHook(type: HookType, context: JSONObject): Promise<HookResult>;
  
  // API system
  registerAPI(name: string, api: PluginAPI): Promise<void>;
  unregisterAPI(name: string): Promise<void>;
  callAPI(name: string, method: string, args: any[]): Promise<any>;
  
  // Resource management
  allocateResource(type: string, amount: number): Promise<boolean>;
  releaseResource(type: string, amount: number): Promise<void>;
  getResourceUsage(): Promise<ResourceUsage>;
  
  // Health and diagnostics
  healthCheck(): Promise<PluginHealthResult>;
  getMetrics(): Promise<PluginMetrics>;
  getDiagnostics(): Promise<PluginDiagnostics>;
  performSelfTest(): Promise<PluginTestResult>;
  
  // Configuration management
  getConfiguration(): JSONObject;
  updateConfiguration(updates: JSONObject): Promise<void>;
  validateConfiguration(config: JSONObject): Promise<ValidationResult[]>;
  resetConfiguration(): Promise<void>;
}

// =============================================================================
// HOOK SYSTEM
// =============================================================================

export interface HookHandler {
  (context: HookContext): Promise<HookResult>;
}

export interface HookContext {
  type: HookType;
  data: JSONObject;
  metadata: {
    pluginName: string;
    timestamp: Date;
    requestId: string;
    userId?: string;
    sessionId?: string;
  };
  
  // System context
  system: {
    version: string;
    environment: string;
    instanceId: string;
  };
  
  // Request context
  request?: {
    id: string;
    method: string;
    path: string;
    headers: Record<string, string>;
    query: Record<string, any>;
    body: any;
  };
  
  // Previous hook results
  previousResults: HookResult[];
  
  // Cancellation
  signal: AbortSignal;
}

export interface HookResult {
  success: boolean;
  data?: JSONObject;
  error?: ErrorDetails;
  metadata?: JSONObject;
  
  // Flow control
  continue: boolean;
  stop: boolean;
  skip: boolean;
  
  // Modifications
  modifications?: {
    data: JSONObject;
    headers?: Record<string, string>;
    status?: number;
  };
  
  // Performance
  executionTime: number;
  resourcesUsed: ResourceUsage;
}

export interface HookOptions {
  priority: number; // 0-100, higher = executed first
  timeout: number; // milliseconds
  retries: number;
  conditions: string[]; // Conditions when hook should run
  async: boolean; // Whether hook can run asynchronously
  cache: boolean; // Whether result can be cached
  cacheTTL: number; // Cache time-to-live in seconds
}

export interface PluginHookRegistry {
  register(type: HookType, handler: HookHandler, options?: HookOptions): Promise<string>;
  unregister(hookId: string): Promise<boolean>;
  execute(type: HookType, context: HookContext): Promise<HookResult[]>;
  list(type?: HookType): Promise<RegisteredHook[]>;
  clear(type?: HookType): Promise<void>;
}

export interface RegisteredHook {
  id: string;
  pluginName: string;
  type: HookType;
  handler: HookHandler;
  options: HookOptions;
  registeredAt: Date;
  callCount: number;
  averageExecutionTime: number;
  errorCount: number;
  lastCalled?: Date;
}

// =============================================================================
// API SYSTEM
// =============================================================================

export interface PluginAPI {
  name: string;
  version: string;
  description: string;
  methods: APIMethod[];
  authentication?: AuthenticationConfig;
  rateLimit?: RateLimitConfig;
  documentation?: string;
}

export interface APIMethod {
  name: string;
  description: string;
  parameters: APIParameter[];
  returns: APIResponse;
  async: boolean;
  
  // Security
  permissions: PluginPermission[];
  public: boolean;
  authenticated: boolean;
  
  // Performance
  timeout: number;
  caching: boolean;
  cacheTTL: number;
  
  // Documentation
  examples: APIExample[];
  deprecated: boolean;
  since: string;
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
  validation?: JSONObject; // JSON Schema
  examples: any[];
}

export interface APIResponse {
  type: string;
  description: string;
  schema?: JSONObject; // JSON Schema
  examples: any[];
}

export interface APIExample {
  name: string;
  description: string;
  request: JSONObject;
  response: JSONObject;
}

export interface AuthenticationConfig {
  required: boolean;
  methods: ('api-key' | 'jwt' | 'oauth' | 'basic')[];
  scopes?: string[];
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  window: number; // seconds
  burst: number;
  skipAuthenticated: boolean;
}

// =============================================================================
// PLUGIN APIS
// =============================================================================

export interface PluginLogger {
  trace(message: string, meta?: JSONObject): void;
  debug(message: string, meta?: JSONObject): void;
  info(message: string, meta?: JSONObject): void;
  warn(message: string, meta?: JSONObject): void;
  error(message: string, error?: Error, meta?: JSONObject): void;
  fatal(message: string, error?: Error, meta?: JSONObject): void;
}

export interface PluginMemoryAPI {
  get(key: string, namespace?: string): Promise<any>;
  set(key: string, value: any, options?: { ttl?: number; namespace?: string }): Promise<void>;
  delete(key: string, namespace?: string): Promise<boolean>;
  exists(key: string, namespace?: string): Promise<boolean>;
  list(namespace?: string): Promise<string[]>;
  clear(namespace?: string): Promise<void>;
}

export interface PluginEventAPI {
  emit(event: string, data: any): Promise<void>;
  on(event: string, handler: (data: any) => void): Promise<void>;
  off(event: string, handler: (data: any) => void): Promise<void>;
  once(event: string, handler: (data: any) => void): Promise<void>;
}

export interface PluginHttpAPI {
  request(options: HttpRequestOptions): Promise<HttpResponse>;
  get(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
  post(url: string, data: any, options?: HttpRequestOptions): Promise<HttpResponse>;
  put(url: string, data: any, options?: HttpRequestOptions): Promise<HttpResponse>;
  delete(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
}

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  validateStatus?: (status: number) => boolean;
  proxy?: string;
  auth?: {
    username: string;
    password: string;
  };
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}

export interface PluginFilesystemAPI {
  readFile(path: string): Promise<Buffer>;
  writeFile(path: string, data: Buffer | string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStats>;
  watch(path: string, handler: (event: string, filename: string) => void): Promise<void>;
}

export interface FileStats {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  modified: Date;
  created: Date;
  permissions: string;
}

export interface PluginDatabaseAPI {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastId: number }>;
  transaction(queries: Array<{ sql: string; params?: any[] }>): Promise<any[]>;
}

export interface PluginCacheAPI {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

export interface PluginQueueAPI {
  enqueue(queue: string, job: JSONObject, options?: { delay?: number; priority?: number }): Promise<string>;
  dequeue(queue: string): Promise<QueueJob | null>;
  ack(jobId: string): Promise<void>;
  nack(jobId: string, requeue?: boolean): Promise<void>;
  getQueueSize(queue: string): Promise<number>;
}

export interface QueueJob {
  id: string;
  queue: string;
  data: JSONObject;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface PluginSecretsAPI {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<boolean>;
  list(): Promise<string[]>;
}

// =============================================================================
// PLUGIN MANAGER
// =============================================================================

export interface PluginManager extends TypedEventEmitter<PluginEvents> {
  // Plugin lifecycle
  loadPlugin(path: string, config?: PluginConfig): Promise<Plugin>;
  unloadPlugin(name: string): Promise<boolean>;
  reloadPlugin(name: string): Promise<void>;
  enablePlugin(name: string): Promise<void>;
  disablePlugin(name: string): Promise<void>;
  
  // Plugin management
  getPlugin(name: string): Promise<Plugin | null>;
  getAllPlugins(): Promise<Plugin[]>;
  getActivePlugins(): Promise<Plugin[]>;
  getPluginsByType(type: PluginType): Promise<Plugin[]>;
  
  // Plugin discovery
  discoverPlugins(directory: string): Promise<PluginManifest[]>;
  installPlugin(source: string): Promise<Plugin>;
  uninstallPlugin(name: string): Promise<boolean>;
  updatePlugin(name: string): Promise<Plugin>;
  
  // Hook management
  executeHooks(type: HookType, context: HookContext): Promise<HookResult[]>;
  getHooks(type?: HookType): Promise<RegisteredHook[]>;
  
  // API management
  getAPI(pluginName: string, apiName: string): Promise<PluginAPI | null>;
  callAPI(pluginName: string, apiName: string, method: string, args: any[]): Promise<any>;
  getAllAPIs(): Promise<Array<{ plugin: string; api: PluginAPI }>>;
  
  // Health and monitoring
  getSystemHealth(): Promise<PluginSystemHealth>;
  getPluginMetrics(name?: string): Promise<PluginMetrics[]>;
  performHealthCheck(): Promise<PluginHealthReport>;
  
  // Configuration
  updatePluginConfig(name: string, updates: Partial<PluginConfig>): Promise<void>;
  getPluginConfig(name: string): Promise<PluginConfig | null>;
  validatePluginConfig(name: string, config: PluginConfig): Promise<ValidationResult[]>;
  
  // Security
  checkPermission(pluginName: string, permission: PluginPermission): Promise<boolean>;
  grantPermission(pluginName: string, permission: PluginPermission): Promise<void>;
  revokePermission(pluginName: string, permission: PluginPermission): Promise<void>;
  auditPermissions(): Promise<PermissionAuditReport>;
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface PluginHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  issues: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    component: string;
    recommendation?: string;
  }[];
  metrics: JSONObject;
  lastCheck: Date;
}

export interface PluginMetrics {
  pluginName: string;
  performance: {
    callCount: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    errorRate: number;
    successRate: number;
    throughput: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkUsage: number;
  };
  hooks: {
    [type in HookType]?: {
      callCount: number;
      averageExecutionTime: number;
      errorCount: number;
    };
  };
  apis: Record<string, {
    callCount: number;
    averageExecutionTime: number;
    errorCount: number;
  }>;
}

export interface PluginDiagnostics {
  pluginName: string;
  version: string;
  status: PluginStatus;
  uptime: number;
  
  environment: {
    nodeVersion: string;
    platform: string;
    architecture: string;
    memoryUsage: JSONObject;
  };
  
  dependencies: {
    loaded: string[];
    missing: string[];
    outdated: string[];
    conflicts: string[];
  };
  
  configuration: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  performance: {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    memoryLeaks: boolean;
  };
  
  security: {
    permissions: PluginPermission[];
    violations: string[];
    sandboxed: boolean;
  };
}

export interface PluginTestResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  
  tests: {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    message?: string;
  }[];
  
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export interface PluginSystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  pluginCount: number;
  activePlugins: number;
  errorPlugins: number;
  
  performance: {
    averageResponseTime: number;
    totalThroughput: number;
    systemLoad: number;
    memoryUsage: number;
  };
  
  issues: {
    plugin: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    issue: string;
    impact: string;
  }[];
  
  recommendations: string[];
}

export interface PluginHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: Date;
  
  plugins: {
    [name: string]: PluginHealthResult;
  };
  
  system: {
    resourceUsage: ResourceUsage;
    performance: JSONObject;
    errors: string[];
  };
  
  summary: {
    totalPlugins: number;
    healthyPlugins: number;
    degradedPlugins: number;
    unhealthyPlugins: number;
    criticalIssues: number;
  };
}

export interface PermissionAuditReport {
  timestamp: Date;
  plugins: {
    [name: string]: {
      requested: PluginPermission[];
      granted: PluginPermission[];
      denied: PluginPermission[];
      violations: {
        permission: PluginPermission;
        attempts: number;
        lastAttempt: Date;
      }[];
    };
  };
  
  summary: {
    totalPlugins: number;
    highRiskPlugins: number;
    permissionViolations: number;
    recommendations: string[];
  };
}

export interface ResourceUsage {
  memory: number; // MB
  cpu: number; // percentage
  disk: number; // MB
  network: number; // KB/s
  handles: number;
  timestamp: Date;
}

export interface PluginRouter {
  register(path: string, handler: RouteHandler): Promise<void>;
  unregister(path: string): Promise<void>;
  route(request: RouteRequest): Promise<RouteResponse>;
}

export interface RouteHandler {
  (request: RouteRequest): Promise<RouteResponse>;
}

export interface RouteRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, any>;
  body: any;
  user?: any;
  session?: any;
}

export interface RouteResponse {
  status: number;
  headers?: Record<string, string>;
  body?: any;
}

export interface PluginScheduler {
  schedule(name: string, cron: string, handler: () => Promise<void>): Promise<void>;
  unschedule(name: string): Promise<void>;
  trigger(name: string): Promise<void>;
  list(): Promise<ScheduledJob[]>;
}

export interface ScheduledJob {
  name: string;
  cron: string;
  nextRun: Date;
  lastRun?: Date;
  enabled: boolean;
  runCount: number;
  errorCount: number;
}