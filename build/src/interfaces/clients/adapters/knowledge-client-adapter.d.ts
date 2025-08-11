/**
 * UACL Knowledge Client Adapter - FACT Integration Conversion.
 *
 * Converts the existing FACTIntegration to implement the UACL IClient interface,
 * providing standardized access to external knowledge gathering through the.
 * Unified API client layer architecture.
 *
 * Features:
 * - Unified FACT integration with UACL interface
 * - Standardized caching and query logic
 * - Monitoring and metrics capabilities
 * - Factory pattern implementation
 * - Multiple knowledge provider support.
 */
/**
 * @file Knowledge-client adapter implementation.
 */
import { EventEmitter } from 'node:events';
import type { ClientConfig, ClientMetadata, IClient, IClientFactory, IKnowledgeClient, KnowledgeQueryOptions, KnowledgeSearchOptions, KnowledgeStats, SemanticSearchOptions } from '../interfaces.ts';
import type { ProtocolType } from '../types.ts';
/**
 * Extended client configuration for Knowledge clients.
 *
 * @example
 */
export interface KnowledgeClientConfig extends ClientConfig {
    provider: 'fact' | 'custom';
    factConfig?: {
        pythonPath?: string;
        factRepoPath: string;
        anthropicApiKey: string;
    };
    caching?: {
        enabled: boolean;
        prefix: string;
        ttlSeconds: number;
        minTokens: number;
    };
    tools?: string[];
    rateLimit?: {
        requestsPerMinute: number;
        burstLimit: number;
    };
    vectorConfig?: {
        dimensions: number;
        similarity: 'cosine' | 'euclidean' | 'dot';
        threshold: number;
    };
}
/**
 * Knowledge query request type.
 *
 * @example
 */
export interface KnowledgeRequest {
    query: string;
    type: 'exact' | 'fuzzy' | 'semantic' | 'vector' | 'hybrid';
    tools?: string[] | undefined;
    metadata?: Record<string, any>;
    options?: KnowledgeQueryOptions | undefined;
}
/**
 * Knowledge query response type.
 *
 * @example
 */
export interface KnowledgeResponse {
    response: string;
    queryId: string;
    executionTimeMs: number;
    cacheHit: boolean;
    toolsUsed: string[];
    cost?: number;
    confidence?: number;
    sources?: Array<{
        title: string;
        url: string;
        relevance: number;
    }>;
    metadata?: Record<string, any>;
}
/**
 * UACL Knowledge Client Adapter.
 * Wraps the existing FACTIntegration with standardized UACL interface.
 *
 * @example
 */
export declare class KnowledgeClientAdapter extends EventEmitter implements IKnowledgeClient<KnowledgeRequest> {
    private config;
    private factIntegration;
    private _connected;
    private _status;
    private metrics;
    private startTime;
    private queryCounter;
    constructor(config: KnowledgeClientConfig);
    /**
     * Get client configuration.
     */
    getConfig(): ClientConfig;
    /**
     * Check if client is connected.
     */
    isConnected(): boolean;
    /**
     * Connect to the knowledge service.
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the knowledge service.
     */
    disconnect(): Promise<void>;
    /**
     * Send knowledge query and receive response.
     *
     * @param data
     */
    send<R = KnowledgeResponse>(data: KnowledgeRequest): Promise<R>;
    /**
     * Health check for knowledge service.
     */
    health(): Promise<boolean>;
    /**
     * Get client metadata.
     */
    getMetadata(): Promise<ClientMetadata>;
    /**
     * Query knowledge base.
     *
     * @param query
     * @param options
     */
    query<R = KnowledgeResponse>(query: string, options?: KnowledgeQueryOptions): Promise<R>;
    /**
     * Search knowledge entries.
     *
     * @param searchTerm
     * @param options
     */
    search<R = KnowledgeResponse>(searchTerm: string, options?: KnowledgeSearchOptions): Promise<R[]>;
    /**
     * Get knowledge entry by ID.
     *
     * @param id
     */
    getEntry<R = KnowledgeResponse>(id: string): Promise<R | null>;
    /**
     * Add knowledge entry.
     *
     * @param data
     */
    addEntry(data: KnowledgeRequest): Promise<string>;
    /**
     * Update knowledge entry.
     *
     * @param id
     * @param data
     */
    updateEntry(id: string, data: Partial<KnowledgeRequest>): Promise<boolean>;
    /**
     * Delete knowledge entry.
     *
     * @param id
     */
    deleteEntry(id: string): Promise<boolean>;
    /**
     * Get knowledge statistics.
     */
    getKnowledgeStats(): Promise<KnowledgeStats>;
    /**
     * Execute semantic search.
     *
     * @param query
     * @param options
     */
    semanticSearch<R = KnowledgeResponse>(query: string, options?: SemanticSearchOptions): Promise<R[]>;
    /**
     * Convert UACL config to FACT config.
     *
     * @param config
     */
    private convertToFACTConfig;
    /**
     * Setup event forwarding from FACT to UACL.
     */
    private setupEventForwarding;
    /**
     * Initialize metrics tracking.
     */
    private initializeMetrics;
    /**
     * Update metrics after request.
     *
     * @param responseTime
     * @param success
     */
    private updateMetrics;
    /**
     * Calculate confidence score from FACT result.
     *
     * @param result
     */
    private calculateConfidence;
    /**
     * Extract sources from FACT result.
     *
     * @param result
     */
    private extractSources;
}
/**
 * Knowledge Client Factory.
 * Creates and manages Knowledge client instances.
 *
 * @example
 */
export declare class KnowledgeClientFactory implements IClientFactory {
    private logger?;
    constructor(logger?: {
        debug: Function;
        info: Function;
        warn: Function;
        error: Function;
    } | undefined);
    /**
     * Create a Knowledge client instance.
     *
     * @param protocol
     * @param config
     */
    create(protocol: ProtocolType, config: ClientConfig): Promise<IClient>;
    /**
     * Check if factory supports a protocol.
     *
     * @param protocol
     */
    supports(protocol: ProtocolType): boolean;
    /**
     * Get supported protocols.
     */
    getSupportedProtocols(): ProtocolType[];
    /**
     * Validate configuration for a protocol.
     *
     * @param protocol
     * @param config
     */
    validateConfig(protocol: ProtocolType, config: ClientConfig): boolean;
}
/**
 * Convenience functions for creating Knowledge clients.
 */
/**
 * Create a Knowledge client with FACT provider.
 *
 * @param factRepoPath
 * @param anthropicApiKey
 * @param options
 * @example
 */
export declare function createFACTClient(factRepoPath: string, anthropicApiKey?: string, options?: Partial<KnowledgeClientConfig>): Promise<KnowledgeClientAdapter>;
/**
 * Create a Knowledge client with custom provider.
 *
 * @param url
 * @param options
 * @example
 */
export declare function createCustomKnowledgeClient(url: string, options?: Partial<KnowledgeClientConfig>): Promise<KnowledgeClientAdapter>;
/**
 * Export helper functions for FACT integration.
 */
export declare const KnowledgeHelpers: {
    /**
     * Get documentation for a framework.
     *
     * @param client
     * @param framework
     * @param version
     */
    getDocumentation(client: KnowledgeClientAdapter, framework: string, version?: string): Promise<KnowledgeResponse>;
    /**
     * Search for API reference.
     *
     * @param client
     * @param api
     * @param endpoint
     */
    getAPIReference(client: KnowledgeClientAdapter, api: string, endpoint?: string): Promise<KnowledgeResponse>;
    /**
     * Search community knowledge.
     *
     * @param client
     * @param topic
     * @param tags
     */
    searchCommunity(client: KnowledgeClientAdapter, topic: string, tags?: string[]): Promise<KnowledgeResponse[]>;
};
export default KnowledgeClientAdapter;
//# sourceMappingURL=knowledge-client-adapter.d.ts.map