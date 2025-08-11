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
// Import existing FACT integration.
import {
  type FACTConfig,
  FACTIntegration,
  type FACTQuery,
  type FACTResult,
} from '../../../knowledge/knowledge-client.ts';
import type {
  ClientConfig,
  ClientMetadata,
  ClientMetrics,
  IClient,
  IClientFactory,
  IKnowledgeClient,
  KnowledgeQueryOptions,
  KnowledgeSearchOptions,
  KnowledgeStats,
  SemanticSearchOptions,
} from '../interfaces.ts';
import type { ProtocolType } from '../types.ts';
import { ClientStatuses, ProtocolTypes } from '../types.ts';

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
  // Vector search configuration
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
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
}

/**
 * UACL Knowledge Client Adapter.
 * Wraps the existing FACTIntegration with standardized UACL interface.
 *
 * @example
 */
export class KnowledgeClientAdapter
  extends EventEmitter
  implements IKnowledgeClient<KnowledgeRequest>
{
  private factIntegration: FACTIntegration;
  private _connected = false;
  private _status: string = ClientStatuses.DISCONNECTED;
  private metrics: ClientMetrics;
  private startTime: Date;
  private queryCounter: number = 0;

  constructor(private config: KnowledgeClientConfig) {
    super();

    this.startTime = new Date();
    this.metrics = this.initializeMetrics();

    // Convert UACL config to FACT config
    const factConfig = this.convertToFACTConfig(config);
    this.factIntegration = new FACTIntegration(factConfig);

    // Forward FACT events to UACL events
    this.setupEventForwarding();
  }

  /**
   * Get client configuration.
   */
  getConfig(): ClientConfig {
    return this.config;
  }

  /**
   * Check if client is connected.
   */
  isConnected(): boolean {
    return this._connected;
  }

  /**
   * Connect to the knowledge service.
   */
  async connect(): Promise<void> {
    if (this._connected) {
      return;
    }

    try {
      this._status = ClientStatuses.CONNECTING;
      this.emit('connecting');

      await this.factIntegration.initialize();

      this._connected = true;
      this._status = ClientStatuses.CONNECTED;

      this.emit('connect');
    } catch (error) {
      this._status = ClientStatuses.ERROR;
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from the knowledge service.
   */
  async disconnect(): Promise<void> {
    if (!this._connected) {
      return;
    }

    try {
      await this.factIntegration.shutdown();
      this._connected = false;
      this._status = ClientStatuses.DISCONNECTED;
      this.emit('disconnect');
    } catch (error) {
      this._status = ClientStatuses.ERROR;
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Send knowledge query and receive response.
   *
   * @param data
   */
  async send<R = KnowledgeResponse>(data: KnowledgeRequest): Promise<R> {
    if (!this._connected) {
      await this.connect();
    }

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Convert UACL request to FACT query
      const factQuery: FACTQuery = {
        query: data?.query,
        tools: data?.tools,
        useCache: this.config.caching?.enabled !== false,
        metadata: data?.metadata,
      };

      // Execute query through FACT integration
      const factResult = await this.factIntegration.query(factQuery);

      // Convert FACT result to UACL response
      const response: KnowledgeResponse = {
        response: factResult?.response,
        queryId: factResult?.queryId,
        executionTimeMs: factResult?.executionTimeMs,
        cacheHit: factResult?.cacheHit,
        toolsUsed: factResult?.toolsUsed,
        cost: factResult?.cost,
        confidence: this.calculateConfidence(factResult),
        sources: this.extractSources(factResult),
        metadata: factResult?.metadata,
      };

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true);

      return response as R;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, false);
      this.metrics.failedRequests++;

      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Health check for knowledge service.
   */
  async health(): Promise<boolean> {
    try {
      if (!this._connected) {
        return false;
      }

      // Perform a simple health check query
      const healthQuery: KnowledgeRequest = {
        query: 'health check',
        type: 'exact',
        tools: [],
        metadata: { type: 'health_check' },
      };

      await this.send(healthQuery);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get client metadata.
   */
  async getMetadata(): Promise<ClientMetadata> {
    const factMetrics = await this.factIntegration.getMetrics();

    return {
      protocol: this.config.protocol,
      version: '1.0.0',
      features: [
        'fact-integration',
        'caching',
        'semantic-search',
        'vector-search',
        'tool-execution',
      ],
      connection: {
        url: this.config.url,
        connected: this._connected,
        lastConnected: this.startTime,
        connectionDuration: Date.now() - this.startTime.getTime(),
      },
      metrics: this.metrics,
      custom: {
        provider: this.config.provider,
        factMetrics,
        cacheConfig: this.config.caching,
        tools: this.config.tools,
      },
    };
  }

  // IKnowledgeClient interface implementation

  /**
   * Query knowledge base.
   *
   * @param query
   * @param options
   */
  async query<R = KnowledgeResponse>(
    query: string,
    options?: KnowledgeQueryOptions,
  ): Promise<R> {
    const request: KnowledgeRequest = {
      query,
      type: 'semantic',
      tools: this.config.tools || undefined,
      options: options || undefined,
      metadata: { queryType: 'knowledge_query' },
    };

    return await this.send<R>(request);
  }

  /**
   * Search knowledge entries.
   *
   * @param searchTerm
   * @param options
   */
  async search<R = KnowledgeResponse>(
    searchTerm: string,
    options?: KnowledgeSearchOptions,
  ): Promise<R[]> {
    const request: KnowledgeRequest = {
      query: searchTerm,
      type: options?.fuzzy ? 'fuzzy' : 'exact',
      tools: ['web_scraper', 'documentation_parser'],
      options: options || undefined,
      metadata: { queryType: 'search' },
    };

    const response = await this.send<R>(request);
    return [response]; // FACT returns single result, wrap in array
  }

  /**
   * Get knowledge entry by ID.
   *
   * @param id
   */
  async getEntry<R = KnowledgeResponse>(id: string): Promise<R | null> {
    try {
      const request: KnowledgeRequest = {
        query: `Get entry with ID: ${id}`,
        type: 'exact',
        tools: ['database_lookup'],
        metadata: { queryType: 'get_entry', entryId: id },
      };

      return await this.send<R>(request);
    } catch (_error) {
      // Return null if entry not found
      return null;
    }
  }

  /**
   * Add knowledge entry.
   *
   * @param data
   */
  async addEntry(data: KnowledgeRequest): Promise<string> {
    const request: KnowledgeRequest = {
      query: `Add knowledge entry: ${JSON.stringify(data)}`,
      type: 'exact',
      tools: ['database_insert'],
      metadata: { queryType: 'add_entry', data },
    };

    const response = await this.send(request);
    return response?.queryId; // Use query ID as entry ID
  }

  /**
   * Update knowledge entry.
   *
   * @param id
   * @param data
   */
  async updateEntry(
    id: string,
    data: Partial<KnowledgeRequest>,
  ): Promise<boolean> {
    try {
      const request: KnowledgeRequest = {
        query: `Update entry ${id}: ${JSON.stringify(data)}`,
        type: 'exact',
        tools: ['database_update'],
        metadata: { queryType: 'update_entry', entryId: id, data },
      };

      await this.send(request);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Delete knowledge entry.
   *
   * @param id
   */
  async deleteEntry(id: string): Promise<boolean> {
    try {
      const request: KnowledgeRequest = {
        query: `Delete entry with ID: ${id}`,
        type: 'exact',
        tools: ['database_delete'],
        metadata: { queryType: 'delete_entry', entryId: id },
      };

      await this.send(request);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get knowledge statistics.
   */
  async getKnowledgeStats(): Promise<KnowledgeStats> {
    const factMetrics = await this.factIntegration.getMetrics();

    return {
      totalEntries: factMetrics.totalQueries, // Approximate with query count
      totalSize: 0, // Not available from FACT
      lastUpdated: new Date(),
      categories: {
        'fact-queries': factMetrics.totalQueries,
        'cached-results': Math.floor(
          factMetrics.totalQueries * factMetrics.cacheHitRate,
        ),
      },
      averageResponseTime: factMetrics.averageLatency,
      indexHealth: factMetrics.errorRate < 0.1 ? 1.0 : 0.5, // Simple health calculation
    };
  }

  /**
   * Execute semantic search.
   *
   * @param query
   * @param options
   */
  async semanticSearch<R = KnowledgeResponse>(
    query: string,
    options?: SemanticSearchOptions,
  ): Promise<R[]> {
    const request: KnowledgeRequest = {
      query,
      type: 'semantic',
      tools: options?.vectorSearch
        ? ['vector_search', 'semantic_analyzer']
        : ['semantic_analyzer'],
      options: options || undefined,
      metadata: {
        queryType: 'semantic_search',
        vectorSearch: options?.vectorSearch || undefined,
      },
    };

    const response = await this.send<R>(request);
    return [response]; // FACT returns single result, wrap in array
  }

  // Helper methods

  /**
   * Convert UACL config to FACT config.
   *
   * @param config
   */
  private convertToFACTConfig(config: KnowledgeClientConfig): FACTConfig {
    return {
      pythonPath: config?.factConfig?.pythonPath,
      factRepoPath: config?.factConfig?.factRepoPath || './FACT',
      anthropicApiKey:
        config?.factConfig?.anthropicApiKey ||
        process.env['ANTHROPIC_API_KEY'] ||
        '',
      cacheConfig: config?.caching
        ? {
            prefix: config?.caching?.prefix,
            minTokens: config?.caching?.minTokens,
            maxSize: '100MB', // Default from FACT
            ttlSeconds: config?.caching?.ttlSeconds,
          }
        : undefined,
      enableCache: config?.caching?.enabled ?? true,
      databasePath: './data/knowledge.db',
    };
  }

  /**
   * Setup event forwarding from FACT to UACL.
   */
  private setupEventForwarding(): void {
    this.factIntegration.on('initialized', () => {
      this.emit('initialized');
    });

    this.factIntegration.on('queryCompleted', (result: FACTResult) => {
      this.emit('queryCompleted', result);
    });

    this.factIntegration.on('queryError', (error: unknown) => {
      this.emit('queryError', error);
    });

    this.factIntegration.on('shutdown', () => {
      this.emit('shutdown');
    });
  }

  /**
   * Initialize metrics tracking.
   */
  private initializeMetrics(): ClientMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: undefined,
      uptime: 0,
      bytesSent: 0,
      bytesReceived: 0,
    };
  }

  /**
   * Update metrics after request.
   *
   * @param responseTime
   * @param success
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    if (success) {
      this.metrics.successfulRequests++;
    }

    // Update average response time
    const totalResponseTime =
      this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) +
      responseTime;
    this.metrics.averageResponseTime =
      totalResponseTime / this.metrics.totalRequests;

    this.metrics.lastRequestTime = new Date();
    this.metrics.uptime = Date.now() - this.startTime.getTime();
  }

  /**
   * Calculate confidence score from FACT result.
   *
   * @param result
   */
  private calculateConfidence(result: FACTResult): number {
    // Simple confidence calculation based on cache hit and tools used
    let confidence = 0.5; // Base confidence

    if (result?.cacheHit) confidence += 0.2;
    if (result?.toolsUsed.length > 0) confidence += 0.2;
    if (result?.executionTimeMs < 5000) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Extract sources from FACT result.
   *
   * @param result
   */
  private extractSources(
    result: FACTResult,
  ): Array<{ title: string; url: string; relevance: number }> {
    // FACT doesn't provide structured sources, so we'll create a placeholder
    return result?.toolsUsed.map((tool, index) => ({
      title: `${tool} result`,
      url: `fact://tool/${tool}`,
      relevance: 1.0 - index * 0.1,
    }));
  }
}

/**
 * Knowledge Client Factory.
 * Creates and manages Knowledge client instances.
 *
 * @example
 */
export class KnowledgeClientFactory implements IClientFactory {
  constructor(
    private logger?: {
      debug: Function;
      info: Function;
      warn: Function;
      error: Function;
    },
  ) {}

  /**
   * Create a Knowledge client instance.
   *
   * @param protocol
   * @param config
   */
  async create(protocol: ProtocolType, config: ClientConfig): Promise<IClient> {
    this.logger?.info(`Creating Knowledge client with protocol: ${protocol}`);

    // Validate configuration
    if (!this.validateConfig(protocol, config)) {
      throw new Error(
        `Invalid configuration for Knowledge client with protocol: ${protocol}`,
      );
    }

    const knowledgeConfig = config as KnowledgeClientConfig;

    // Ensure provider is set
    if (!knowledgeConfig?.provider) {
      knowledgeConfig.provider = 'fact';
    }

    // Create and return Knowledge client adapter
    const client = new KnowledgeClientAdapter(knowledgeConfig);

    this.logger?.info(`Successfully created Knowledge client`);
    return client;
  }

  /**
   * Check if factory supports a protocol.
   *
   * @param protocol
   */
  supports(protocol: ProtocolType): boolean {
    return [
      ProtocolTypes.HTTP as ProtocolType,
      ProtocolTypes.HTTPS as ProtocolType,
      ProtocolTypes.CUSTOM as ProtocolType,
    ].includes(protocol);
  }

  /**
   * Get supported protocols.
   */
  getSupportedProtocols(): ProtocolType[] {
    return [ProtocolTypes.HTTP, ProtocolTypes.HTTPS, ProtocolTypes.CUSTOM];
  }

  /**
   * Validate configuration for a protocol.
   *
   * @param protocol
   * @param config
   */
  validateConfig(protocol: ProtocolType, config: ClientConfig): boolean {
    if (!this.supports(protocol)) {
      return false;
    }

    const knowledgeConfig = config as KnowledgeClientConfig;

    // Validate required fields
    if (!knowledgeConfig?.url) {
      return false;
    }

    // Validate FACT configuration if provider is fact
    if (knowledgeConfig?.provider === 'fact') {
      if (!knowledgeConfig?.factConfig?.factRepoPath) {
        return false;
      }
      if (
        !(
          knowledgeConfig?.factConfig?.anthropicApiKey ||
          process.env['ANTHROPIC_API_KEY']
        )
      ) {
        return false;
      }
    }

    return true;
  }
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
export async function createFACTClient(
  factRepoPath: string,
  anthropicApiKey?: string,
  options?: Partial<KnowledgeClientConfig>,
): Promise<KnowledgeClientAdapter> {
  const config: KnowledgeClientConfig = {
    protocol: ProtocolTypes.CUSTOM,
    url: 'fact://local',
    provider: 'fact',
    factConfig: {
      factRepoPath,
      anthropicApiKey:
        anthropicApiKey || process.env['ANTHROPIC_API_KEY'] || '',
      pythonPath: 'python3',
    },
    caching: {
      enabled: true,
      prefix: 'claude-zen-knowledge',
      ttlSeconds: 3600,
      minTokens: 500,
    },
    tools: [
      'web_scraper',
      'documentation_parser',
      'api_documentation_scraper',
      'changelog_scraper',
      'stackoverflow_search',
      'github_search',
    ],
    timeout: 30000,
    ...options,
  };

  return new KnowledgeClientAdapter(config);
}

/**
 * Create a Knowledge client with custom provider.
 *
 * @param url
 * @param options
 * @example
 */
export async function createCustomKnowledgeClient(
  url: string,
  options?: Partial<KnowledgeClientConfig>,
): Promise<KnowledgeClientAdapter> {
  const config: KnowledgeClientConfig = {
    protocol: url.startsWith('https')
      ? ProtocolTypes.HTTPS
      : ProtocolTypes.HTTP,
    url,
    provider: 'custom',
    caching: {
      enabled: true,
      prefix: 'claude-zen-knowledge',
      ttlSeconds: 1800,
      minTokens: 300,
    },
    timeout: 15000,
    ...options,
  };

  return new KnowledgeClientAdapter(config);
}

/**
 * Export helper functions for FACT integration.
 */
export const KnowledgeHelpers = {
  /**
   * Get documentation for a framework.
   *
   * @param client
   * @param framework
   * @param version
   */
  async getDocumentation(
    client: KnowledgeClientAdapter,
    framework: string,
    version?: string,
  ): Promise<KnowledgeResponse> {
    return await client.query(
      `Get comprehensive documentation for ${framework} ${version ? `version ${version}` : '(latest version)'}`,
      {
        includeMetadata: true,
        filters: { type: 'documentation', framework, version },
      },
    );
  },

  /**
   * Search for API reference.
   *
   * @param client
   * @param api
   * @param endpoint
   */
  async getAPIReference(
    client: KnowledgeClientAdapter,
    api: string,
    endpoint?: string,
  ): Promise<KnowledgeResponse> {
    const query = endpoint
      ? `Get detailed API reference for ${api} endpoint: ${endpoint}`
      : `Get comprehensive API reference for ${api}`;

    return await client.query(query, {
      includeMetadata: true,
      filters: { type: 'api_reference', api, endpoint },
    });
  },

  /**
   * Search community knowledge.
   *
   * @param client
   * @param topic
   * @param tags
   */
  async searchCommunity(
    client: KnowledgeClientAdapter,
    topic: string,
    tags?: string[],
  ): Promise<KnowledgeResponse[]> {
    const query = `Search developer communities for: ${topic}${tags ? ` tags: ${tags.join(', ')}` : ''}`;

    return await client.search(query, {
      fuzzy: true,
      fields: ['title', 'content', 'tags'],
      filters: { type: 'community', topic, tags },
    });
  },
};

export default KnowledgeClientAdapter;
