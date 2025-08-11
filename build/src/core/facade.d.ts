/**
 * @file Facade Pattern Implementation for System Integration
 * Provides simplified interfaces to complex subsystems with dependency injection.
 */
import { EventEmitter } from 'node:events';
import type { ISystemEventManager } from '../interfaces/events/factories.ts';
import type { MCPCommandQueue } from '../interfaces/mcp/command-system.ts';
import type { EventMap as AllSystemEvents, SwarmTopology } from '../types/event-types.ts';
export type { SwarmTopology } from '../types/event-types.ts';
export interface CoordinationResult {
    success: boolean;
    operationId: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    warnings?: string[];
    errors?: string[];
}
export type SystemEventManager = ISystemEventManager;
export interface ISwarmService {
    initializeSwarm(config: SwarmConfig): Promise<SwarmResult>;
    getSwarmStatus(swarmId: string): Promise<SwarmStatus>;
    destroySwarm(swarmId: string): Promise<void>;
    coordinateSwarm(swarmId: string, operation: string): Promise<CoordinationResult>;
    spawnAgent(swarmId: string, agentConfig: AgentConfig): Promise<AgentResult>;
    listSwarms(): Promise<SwarmInfo[]>;
}
export interface INeuralService {
    trainModel(data: TrainingData): Promise<ModelResult>;
    predictWithModel(modelId: string, input: any[]): Promise<PredictionResult>;
    evaluateModel(modelId: string, testData: TestData): Promise<EvaluationResult>;
    optimizeModel(modelId: string, strategy: OptimizationStrategy): Promise<OptimizationResult>;
    listModels(): Promise<ModelInfo[]>;
    deleteModel(modelId: string): Promise<void>;
}
export interface IMemoryService {
    store(key: string, value: any, options?: MemoryOptions): Promise<void>;
    retrieve<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<boolean>;
    list(pattern: string): Promise<string[]>;
    clear(pattern?: string): Promise<number>;
    getStats(): Promise<MemoryStats>;
}
export interface IDatabaseService {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    insert(tableName: string, data: Record<string, any>): Promise<string>;
    update(tableName: string, id: string, data: Record<string, any>): Promise<boolean>;
    delete(tableName: string, id: string): Promise<boolean>;
    vectorSearch(embedding: number[], limit: number, filters?: Record<string, any>): Promise<VectorSearchResult[]>;
    createIndex(tableName: string, columns: string[]): Promise<void>;
    getHealth(): Promise<DatabaseHealth>;
}
export interface IInterfaceService {
    startHTTPMCP(config: MCPConfig): Promise<HTTPMCPServer>;
    startWebDashboard(config: WebConfig): Promise<WebServer>;
    startTUI(mode: TUIMode): Promise<TUIInstance>;
    startCLI(config: CLIConfig): Promise<CLIInstance>;
    stopInterface(interfaceId: string): Promise<void>;
    getInterfaceStatus(): Promise<InterfaceStatus[]>;
}
export interface IWorkflowService {
    executeWorkflow(workflowId: string, inputs: Record<string, any>): Promise<WorkflowResult>;
    createWorkflow(definition: WorkflowDefinition): Promise<string>;
    listWorkflows(): Promise<WorkflowInfo[]>;
    pauseWorkflow(workflowId: string): Promise<void>;
    resumeWorkflow(workflowId: string): Promise<void>;
    cancelWorkflow(workflowId: string): Promise<void>;
}
export interface ProjectInitConfig {
    name: string;
    template: 'basic' | 'advanced' | 'enterprise';
    swarm: SwarmConfig;
    interfaces: {
        http?: MCPConfig;
        web?: WebConfig;
        tui?: {
            mode: TUIMode;
        };
        cli?: CLIConfig;
    };
    neural?: {
        models: string[];
        autoOptimize: boolean;
    };
    memory?: {
        backend: 'redis' | 'memory' | 'file';
        persistence: boolean;
    };
    database?: {
        provider: 'sqlite' | 'postgresql' | 'mysql';
        vectorStore: boolean;
    };
    workflows?: string[];
}
export interface ProcessingOptions {
    swarmId?: string;
    useNeural?: boolean;
    cacheResults?: boolean;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    timeout?: number;
    retryAttempts?: number;
}
export interface ProjectResult {
    projectId: string;
    swarmId?: string;
    status: 'initialized' | 'initializing' | 'failed';
    timestamp: Date;
    interfaces: Record<string, any>;
    metrics: OperationMetrics;
    errors?: string[] | undefined;
    warnings?: string[] | undefined;
}
export interface DocumentProcessingResult {
    documentId: string;
    analysis: {
        text: PredictionResult;
        structure: DocumentStructure;
        sentiment?: SentimentAnalysis;
        topics?: TopicAnalysis[];
    };
    recommendations: Recommendation[];
    processingTime: number;
    swarmId?: string;
    operationId: string;
    metadata: Record<string, any>;
}
export interface SystemStatus {
    overall: {
        health: number;
        status: 'healthy' | 'degraded' | 'unhealthy';
        timestamp: Date;
    };
    components: {
        swarm: ComponentStatus;
        memory: ComponentStatus;
        database: ComponentStatus;
        interfaces: ComponentStatus;
        neural: ComponentStatus;
        workflows: ComponentStatus;
    };
    metrics: SystemMetrics;
    alerts: SystemAlert[];
}
export interface SwarmConfig {
    topology: SwarmTopology;
    agentCount: number;
    capabilities?: string[];
    resourceLimits?: ResourceMetrics;
    timeout?: number;
}
export interface SwarmResult {
    swarmId: string;
    topology: SwarmTopology;
    agentCount: number;
    status: 'initializing' | 'ready' | 'error';
    estimatedReadyTime: number;
    warnings?: string[];
}
export interface SwarmStatus {
    healthy: boolean;
    activeAgents: number;
    completedTasks: number;
    errors: string[];
    topology: SwarmTopology;
    uptime: number;
}
export interface SwarmInfo {
    swarmId: string;
    name?: string;
    topology: SwarmTopology;
    agentCount: number;
    status: SwarmStatus;
    createdAt: Date;
}
export interface AgentConfig {
    type: string;
    capabilities: string[];
    resourceRequirements?: ResourceMetrics;
    configuration?: Record<string, any>;
}
export interface AgentResult {
    agentId: string;
    type: string;
    capabilities: string[];
    status: 'initializing' | 'ready' | 'error';
    resourceAllocation: ResourceMetrics;
}
export interface TrainingData {
    inputs: any[][];
    outputs: any[][];
    metadata?: Record<string, any>;
}
export interface ModelResult {
    modelId: string;
    accuracy: number;
    loss: number;
    trainingTime: number;
    status: 'training' | 'ready' | 'error';
}
export interface PredictionResult {
    predictions: any[];
    confidence: number[];
    modelId: string;
    processingTime: number;
}
export interface EvaluationResult {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix?: number[][];
}
export interface OptimizationStrategy {
    method: 'genetic' | 'gradient' | 'bayesian';
    maxIterations: number;
    targetMetric: string;
}
export interface OptimizationResult {
    improvedAccuracy: number;
    optimizationTime: number;
    strategy: OptimizationStrategy;
    iterations: number;
}
export interface ModelInfo {
    modelId: string;
    type: string;
    accuracy: number;
    createdAt: Date;
    lastUsed: Date;
    size: number;
}
export interface TestData extends TrainingData {
    labels?: string[];
}
export interface MemoryOptions {
    ttl?: number;
    compress?: boolean;
    replicate?: boolean;
}
export interface MemoryStats {
    totalKeys: number;
    memoryUsage: number;
    hitRate: number;
    missRate: number;
    avgResponseTime: number;
}
export interface VectorSearchResult {
    id: string;
    content: any;
    similarity: number;
    metadata: Record<string, any>;
}
export interface DatabaseHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    connectionCount: number;
    queryLatency: number;
    diskUsage: number;
    replicationLag?: number;
}
export interface MCPConfig {
    port: number;
    host: string;
    cors: boolean;
    timeout: number;
    maxRequestSize: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export interface WebConfig {
    port: number;
    host: string;
    theme: 'light' | 'dark' | 'auto';
    realTimeUpdates: boolean;
    authentication?: {
        enabled: boolean;
        provider: string;
    };
}
export type TUIMode = 'swarm-overview' | 'task-manager' | 'system-monitor';
export interface CLIConfig {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    colorOutput: boolean;
    progressBars: boolean;
}
export interface HTTPMCPServer {
    serverId: string;
    port: number;
    status: 'starting' | 'running' | 'stopped' | 'error';
    uptime: number;
}
export interface WebServer {
    serverId: string;
    port: number;
    status: 'starting' | 'running' | 'stopped' | 'error';
    activeConnections: number;
}
export interface TUIInstance {
    instanceId: string;
    mode: TUIMode;
    status: 'starting' | 'running' | 'stopped';
}
export interface CLIInstance {
    instanceId: string;
    status: 'ready' | 'executing' | 'stopped';
}
export interface InterfaceStatus {
    interfaceId: string;
    type: 'http' | 'web' | 'tui' | 'cli';
    status: 'starting' | 'running' | 'stopped' | 'error';
    port?: number;
    uptime?: number;
}
export interface WorkflowDefinition {
    name: string;
    description: string;
    steps: WorkflowStep[];
    triggers?: WorkflowTrigger[];
    configuration?: Record<string, any>;
}
export interface WorkflowStep {
    id: string;
    type: string;
    name: string;
    inputs: Record<string, any>;
    outputs: string[];
    dependencies?: string[];
}
export interface WorkflowTrigger {
    type: 'schedule' | 'event' | 'manual';
    configuration: Record<string, any>;
}
export interface WorkflowResult {
    workflowId: string;
    executionId: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    results: Record<string, any>;
    errors?: string[];
}
export interface WorkflowInfo {
    workflowId: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'disabled';
    createdAt: Date;
    lastExecuted?: Date;
    executionCount: number;
}
export interface ResourceMetrics {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
    timestamp: Date;
}
export interface OperationMetrics {
    duration: number;
    resourceUsage: ResourceMetrics;
    operations: number;
    errors: number;
    warnings: number;
}
export interface ComponentStatus {
    health: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Record<string, number>;
    lastChecked: Date;
    errors?: string[];
}
export interface SystemMetrics {
    uptime: number;
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    activeConnections: number;
    memoryUsage: ResourceMetrics;
}
export interface SystemAlert {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    component: string;
    timestamp: Date;
    resolved: boolean;
}
export interface DocumentStructure {
    sections: DocumentSection[];
    headings: DocumentHeading[];
    wordCount: number;
    readingTime: number;
    complexity: number;
}
export interface DocumentSection {
    title: string;
    content: string;
    wordCount: number;
    level: number;
}
export interface DocumentHeading {
    text: string;
    level: number;
    position: number;
}
export interface SentimentAnalysis {
    overall: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: Record<string, number>;
}
export interface TopicAnalysis {
    topic: string;
    relevance: number;
    keywords: string[];
}
export interface Recommendation {
    type: 'improvement' | 'warning' | 'optimization';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    implementation?: string;
}
export interface ILogger {
    debug(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
}
export interface IMetricsCollector {
    startOperation(operationType: string, operationId: string): void;
    endOperation(operationType: string, operationId: string, status: 'success' | 'error'): void;
    getOperationMetrics(operationId: string): OperationMetrics;
    getSystemMetrics(): SystemMetrics;
    recordEvent(event: keyof AllSystemEvents): void;
}
/**
 * ClaudeZenFacade - Main system facade providing simplified access to all subsystems.
 * Implements comprehensive orchestration with dependency injection and error handling.
 *
 * @example
 */
export declare class ClaudeZenFacade extends EventEmitter {
    private swarmService;
    private neuralService;
    private memoryService;
    private databaseService;
    private interfaceService;
    private workflowService;
    private eventManager;
    private commandQueue;
    private logger;
    private metrics;
    constructor(swarmService: ISwarmService, neuralService: INeuralService, memoryService: IMemoryService, databaseService: IDatabaseService, interfaceService: IInterfaceService, workflowService: IWorkflowService, eventManager: ISystemEventManager, commandQueue: MCPCommandQueue, logger: ILogger, metrics: IMetricsCollector);
    /**
     * High-level project initialization with comprehensive orchestration.
     *
     * @param config
     */
    initializeProject(config: ProjectInitConfig): Promise<ProjectResult>;
    /**
     * Complex document processing with AI coordination and caching.
     *
     * @param documentPath
     * @param options
     */
    processDocument(documentPath: string, options?: ProcessingOptions): Promise<DocumentProcessingResult>;
    /**
     * Comprehensive system health and status aggregation.
     */
    getSystemStatus(): Promise<SystemStatus>;
    /**
     * Execute complex multi-service workflows.
     *
     * @param workflowId
     * @param inputs
     */
    executeWorkflow(workflowId: string, inputs: Record<string, any>): Promise<WorkflowResult>;
    /**
     * Batch operation execution with progress tracking.
     *
     * @param operations
     */
    executeBatch(operations: Array<{
        type: string;
        params: any;
    }>): Promise<any[]>;
    /**
     * System shutdown with graceful cleanup.
     */
    shutdown(): Promise<void>;
    private setupEventHandlers;
    private validateProjectConfig;
    private generateOperationId;
    private generateProjectId;
    private loadDocument;
    private getOrCreateDefaultSwarm;
    private analyzeDocumentStructure;
    private analyzeSentiment;
    private analyzeTopics;
    private generateRecommendations;
    private getCurrentResourceUsage;
    private getSwarmSystemStatus;
    private getMemorySystemStatus;
    private getDatabaseSystemStatus;
    private getInterfaceSystemStatus;
    private getNeuralSystemStatus;
    private getWorkflowSystemStatus;
    private extractComponentStatus;
    private collectSystemAlerts;
}
//# sourceMappingURL=facade.d.ts.map