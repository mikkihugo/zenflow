/**
 * Core type definitions for Claude-Flow.
 */
/**
 * @file TypeScript type definitions for core.
 */
export interface Config {
    env: 'development' | 'production' | 'test';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics?: boolean;
    orchestrator?: {
        dataDir?: string;
        maxAgents?: number;
        taskTimeout?: number;
        persistSessions?: boolean;
        shutdownTimeout?: number;
        maxConcurrentAgents?: number;
    };
    logging?: LoggingConfig;
    terminal?: {
        shell?: string;
        timeout?: number;
        maxSessions?: number;
    };
    memory?: {
        backend?: 'sqlite' | 'memory';
        ttl?: number;
        maxEntries?: number;
    };
    coordination?: {
        enabled?: boolean;
        maxConnections?: number;
    };
    mcp?: {
        enabled?: boolean;
        port?: number;
    };
    database?: {
        url: string;
        poolSize?: number;
    };
    redis?: {
        url: string;
        keyPrefix?: string;
    };
    api?: {
        port: number;
        host: string;
        cors?: {
            origin: string[];
            credentials: boolean;
        };
    };
    agents?: {
        maxConcurrent: number;
        timeout: number;
    };
    security?: {
        jwtSecret: string;
        encryptionKey: string;
    };
}
export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'text' | 'json';
    destination: 'console' | 'file' | 'both';
    file?: {
        path: string;
        maxSize: number;
        maxFiles: number;
    };
    enableTimestamps?: boolean;
    enableContext?: boolean;
}
export interface OrchestratorMetrics {
    uptime: number;
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    queuedTasks: number;
    avgTaskDuration: number;
    memoryUsage: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
        arrayBuffers: number;
    };
    cpuUsage: {
        user: number;
        system: number;
    };
    timestamp: Date;
}
export interface AgentProfile {
    id: string;
    name: string;
    type: 'coordinator' | 'researcher' | 'implementer' | 'analyst' | 'custom';
    capabilities: string[];
    systemPrompt?: string;
    maxConcurrentTasks: number;
    priority?: number;
    environment?: Record<string, string>;
    workingDirectory?: string;
    shell?: string;
    metadata?: Record<string, unknown>;
}
export interface AgentSession {
    id: string;
    agentId: string;
    terminalId: string;
    startTime: Date;
    endTime?: Date;
    status: 'active' | 'idle' | 'terminated' | 'error';
    lastActivity: Date;
    memoryBankId: string;
}
export interface Task {
    id: string;
    type: string;
    description: string;
    priority: number;
    dependencies: string[];
    assignedAgent?: string;
    status: TaskStatus;
    input: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: Error;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    metadata?: Record<string, unknown>;
}
export type TaskStatus = 'pending' | 'queued' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface MemoryEntry {
    id: string;
    agentId: string;
    sessionId: string;
    type: 'observation' | 'insight' | 'decision' | 'artifact' | 'error';
    content: string;
    context: Record<string, unknown>;
    timestamp: Date;
    tags: string[];
    version: number;
    parentId?: string;
    metadata?: Record<string, unknown>;
}
export interface MemoryQuery {
    agentId?: string;
    sessionId?: string;
    type?: MemoryEntry['type'];
    tags?: string[];
    startTime?: Date;
    endTime?: Date;
    search?: string;
    limit?: number;
    offset?: number;
    namespace?: string;
}
export declare enum SystemEvents {
    AGENT_SPAWNED = "agent:spawned",
    AGENT_TERMINATED = "agent:terminated",
    AGENT_ERROR = "agent:error",
    AGENT_IDLE = "agent:idle",
    AGENT_ACTIVE = "agent:active",
    TASK_CREATED = "task:created",
    TASK_ASSIGNED = "task:assigned",
    TASK_STARTED = "task:started",
    TASK_COMPLETED = "task:completed",
    TASK_FAILED = "task:failed",
    TASK_CANCELLED = "task:cancelled",
    MEMORY_CREATED = "memory:created",
    MEMORY_UPDATED = "memory:updated",
    MEMORY_DELETED = "memory:deleted",
    MEMORY_SYNCED = "memory:synced",
    SYSTEM_READY = "system:ready",
    SYSTEM_SHUTDOWN = "system:shutdown",
    SYSTEM_ERROR = "system:error",
    SYSTEM_HEALTHCHECK = "system:healthcheck",
    RESOURCE_ACQUIRED = "resource:acquired",
    RESOURCE_RELEASED = "resource:released",
    DEADLOCK_DETECTED = "deadlock:detected",
    MESSAGE_SENT = "message:sent",
    MESSAGE_RECEIVED = "message:received"
}
export interface EventMap extends Record<string, unknown> {
    'metrics:collected': OrchestratorMetrics;
}
export interface SystemConfig {
    orchestrator: OrchestratorConfig;
    terminal: TerminalConfig;
    memory: MemoryConfig;
    coordination: CoordinationConfig;
    mcp: MCPConfig;
    logging: LoggingConfig;
    credentials?: CredentialsConfig;
    security?: SecurityConfig;
}
export interface OrchestratorConfig {
    maxConcurrentAgents: number;
    taskQueueSize: number;
    healthCheckInterval: number;
    shutdownTimeout: number;
    maintenanceInterval?: number;
    metricsInterval?: number;
    persistSessions?: boolean;
    dataDir?: string;
    sessionRetentionMs?: number;
    taskHistoryRetentionMs?: number;
    taskMaxRetries?: number;
}
export interface TerminalConfig {
    type: 'vscode' | 'native' | 'auto';
    poolSize: number;
    recycleAfter: number;
    healthCheckInterval: number;
    commandTimeout: number;
}
export interface MemoryConfig {
    backend: 'sqlite' | 'markdown' | 'hybrid';
    cacheSizeMB: number;
    syncInterval: number;
    conflictResolution: 'last-write' | 'crdt' | 'manual';
    retentionDays: number;
    sqlitePath?: string;
    markdownDir?: string;
}
export interface CoordinationConfig {
    maxRetries: number;
    retryDelay: number;
    deadlockDetection: boolean;
    resourceTimeout: number;
    messageTimeout: number;
}
export interface MCPConfig {
    transport: 'stdio' | 'http' | 'websocket';
    host?: string;
    port?: number;
    tlsEnabled?: boolean;
    authToken?: string;
    auth?: MCPAuthConfig;
    loadBalancer?: MCPLoadBalancerConfig;
    sessionTimeout?: number;
    maxSessions?: number;
    enableMetrics?: boolean;
    corsEnabled?: boolean;
    corsOrigins?: string[];
}
export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    destination: 'console' | 'file' | 'both';
    filePath?: string;
    maxFileSize?: number;
    maxFiles?: number;
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, ComponentHealth>;
    timestamp: Date;
}
export interface ComponentHealth {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    error?: string;
    metrics?: Record<string, number>;
}
export interface Message {
    id: string;
    type: string;
    payload: unknown;
    timestamp: Date;
    priority: number;
    expiry?: Date;
}
export interface Resource {
    id: string;
    type: string;
    owner?: string;
    locked: boolean;
    lockedBy?: string;
    lockedAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface MCPProtocolVersion {
    major: number;
    minor: number;
    patch: number;
}
export interface MCPCapabilities {
    logging?: {
        level?: 'debug' | 'info' | 'warn' | 'error';
    };
    prompts?: {
        listChanged?: boolean;
    };
    resources?: {
        listChanged?: boolean;
        subscribe?: boolean;
    };
    tools?: {
        listChanged?: boolean;
    };
    sampling?: Record<string, unknown>;
}
export interface MCPInitializeParams {
    protocolVersion: MCPProtocolVersion;
    capabilities: MCPCapabilities;
    clientInfo: {
        name: string;
        version: string;
    };
}
export interface MCPInitializeResult {
    protocolVersion: MCPProtocolVersion;
    capabilities: MCPCapabilities;
    serverInfo: {
        name: string;
        version: string;
    };
    instructions?: string;
}
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (input: unknown, context?: MCPContext) => Promise<unknown>;
}
export interface MCPPrompt {
    name: string;
    description?: string;
    arguments?: Array<{
        name: string;
        description?: string;
        required?: boolean;
    }>;
}
export interface MCPResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
export interface MCPRequest {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: unknown;
}
export interface MCPResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: MCPError;
}
export interface MCPNotification {
    jsonrpc: '2.0';
    method: string;
    params?: unknown;
}
export interface MCPError {
    code: number;
    message: string;
    data?: unknown;
}
export interface MCPToolCall {
    name: string;
    arguments?: Record<string, unknown>;
}
export interface MCPToolResult {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}
export interface MCPLogEntry {
    level: 'debug' | 'info' | 'warn' | 'error';
    data?: unknown;
    logger?: string;
}
export interface MCPSession {
    id: string;
    clientInfo: {
        name: string;
        version: string;
    };
    protocolVersion: MCPProtocolVersion;
    capabilities: MCPCapabilities;
    isInitialized: boolean;
    createdAt: Date;
    lastActivity: Date;
    transport: 'stdio' | 'http' | 'websocket';
    authenticated: boolean;
    authData?: {
        token?: string;
        user?: string;
        permissions?: string[];
    };
}
export interface MCPAuthConfig {
    enabled: boolean;
    method: 'token' | 'basic' | 'oauth';
    tokens?: string[];
    users?: Array<{
        username: string;
        password: string;
        permissions: string[];
        roles?: string[];
    }>;
    jwtSecret?: string;
    sessionTimeout?: number;
}
export interface MCPLoadBalancerConfig {
    enabled: boolean;
    strategy: 'round-robin' | 'least-connections' | 'weighted';
    maxRequestsPerSecond: number;
    healthCheckInterval: number;
    circuitBreakerThreshold: number;
}
export interface MCPMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    activeSessions: number;
    toolInvocations: Record<string, number>;
    errors: Record<string, number>;
    lastReset: Date;
}
export interface ILogger {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, error?: unknown): void;
    configure(config: LoggingConfig): Promise<void>;
}
export interface IEventBus {
    emit(event: string, data?: unknown): void;
    on(event: string, handler: (data: unknown) => void): void;
    off(event: string, handler: (data: unknown) => void): void;
    once(event: string, handler: (data: unknown) => void): void;
}
export interface Terminal {
    id: string;
    pid?: number;
    type: 'vscode' | 'native';
    status: 'active' | 'idle' | 'dead';
}
export interface TerminalCommand {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
    timeout?: number;
}
export interface MCPContext {
    sessionId: string;
    agentId?: string;
    logger: ILogger;
}
export interface CredentialsConfig {
    apiKey?: string;
    token?: string;
    password?: string;
    secret?: string;
    [key: string]: string | undefined;
}
export interface SecurityConfig {
    encryptionEnabled: boolean;
    auditLogging: boolean;
    maskSensitiveValues: boolean;
    allowEnvironmentOverrides: boolean;
}
//# sourceMappingURL=types.d.ts.map