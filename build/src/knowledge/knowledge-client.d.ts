/**
 * @file Knowledge-client implementation.
 */
import { EventEmitter } from 'node:events';
export interface FACTConfig {
    pythonPath?: string;
    factRepoPath: string;
    anthropicApiKey: string;
    cacheConfig?: {
        prefix: string;
        minTokens: number;
        maxSize: string;
        ttlSeconds: number;
    };
    databasePath?: string;
    enableCache?: boolean;
}
export interface FACTQuery {
    query: string;
    tools?: string[];
    useCache?: boolean;
    metadata?: Record<string, any>;
}
export interface FACTResult {
    response: string;
    queryId: string;
    executionTimeMs: number;
    cacheHit: boolean;
    toolsUsed: string[];
    cost?: number;
    metadata?: Record<string, any>;
}
export type KnowledgeClientConfig = FACTConfig;
export type KnowledgeResult = FACTResult;
export type KnowledgeClient = FACTIntegration;
interface FACTMetrics {
    totalQueries: number;
    cacheHitRate: number;
    averageLatency: number;
    costSavings: number;
    toolExecutions: number;
    errorRate: number;
}
/**
 * FACT Integration class that bridges to the Python FACT system.
 * Provides external knowledge gathering through MCP tools and intelligent caching.
 *
 * @example
 */
export declare class FACTIntegration extends EventEmitter {
    private config;
    private factProcess;
    private isInitialized;
    private queryCounter;
    private pendingQueries;
    constructor(config: FACTConfig);
    /**
     * Initialize the FACT system.
     */
    initialize(): Promise<void>;
    /**
     * Query external knowledge using FACT system.
     *
     * @param factQuery
     */
    query(factQuery: FACTQuery): Promise<FACTResult>;
    /**
     * Get real-time documentation for frameworks/libraries.
     *
     * @param framework
     * @param version
     */
    getDocumentation(framework: string, version?: string): Promise<FACTResult>;
    /**
     * Get specific API reference information.
     *
     * @param api
     * @param endpoint
     */
    getAPIReference(api: string, endpoint?: string): Promise<FACTResult>;
    /**
     * Get changelog and release information.
     *
     * @param project
     * @param version
     */
    getChangelog(project: string, version?: string): Promise<FACTResult>;
    /**
     * Search Stack Overflow and developer communities.
     *
     * @param topic
     * @param tags
     */
    searchCommunityKnowledge(topic: string, tags?: string[]): Promise<FACTResult>;
    /**
     * Get current metrics from FACT system.
     */
    getMetrics(): Promise<FACTMetrics>;
    /**
     * Shutdown the FACT system.
     */
    shutdown(): Promise<void>;
    /**
     * Verify FACT repository exists and is properly set up.
     */
    private verifyFACTRepository;
    /**
     * Set up environment variables for FACT system.
     */
    private setupEnvironment;
    /**
     * Initialize the FACT system (install dependencies, etc.).
     */
    private initializeFACTSystem;
    /**
     * Execute a FACT query through Python interface.
     *
     * @param queryId
     * @param factQuery
     */
    private executeFACTQuery;
    /**
     * Execute Python command in FACT repository.
     *
     * @param command
     */
    private executePythonCommand;
}
/**
 * Initialize global FACT integration.
 *
 * @param config
 * @example
 */
export declare function initializeFACT(config: FACTConfig): Promise<FACTIntegration>;
/**
 * Get the global FACT integration instance.
 *
 * @example
 */
export declare function getFACT(): FACTIntegration | null;
/**
 * Shutdown global FACT integration.
 *
 * @example
 */
export declare function shutdownFACT(): Promise<void>;
/**
 * Quick helper functions for common FACT operations.
 */
export declare const FACTHelpers: {
    /**
     * Get React documentation.
     *
     * @param version
     */
    getReactDocs(version?: string): Promise<string>;
    /**
     * Get TypeScript documentation.
     *
     * @param version
     */
    getTypeScriptDocs(version?: string): Promise<string>;
    /**
     * Search for solutions to coding problems.
     *
     * @param problem
     * @param tags
     */
    searchSolutions(problem: string, tags?: string[]): Promise<string>;
    /**
     * Get API documentation.
     *
     * @param api
     * @param endpoint
     */
    getAPIDocs(api: string, endpoint?: string): Promise<string>;
};
export default FACTIntegration;
//# sourceMappingURL=knowledge-client.d.ts.map