/**
 * UACL Knowledge Client Adapter - FACT Integration Conversion0.
 *
 * Converts the existing FACTIntegration to implement the UACL Client interface,
 * providing standardized access to external knowledge gathering through the0.
 * Unified API client layer architecture0.
 *
 * Features:
 * - Unified FACT integration with UACL interface
 * - Standardized caching and query logic
 * - Monitoring and metrics capabilities
 * - Factory pattern implementation
 * - Multiple knowledge provider support0.
 */
/**
 * @file Knowledge-client adapter implementation0.
 */

import { TypedEventBase } from '@claude-zen/foundation';

// Import existing FACT integration0.
import type {
  ClientConfig,
  ClientMetadata,
  ClientMetrics,
  Client,
  ClientFactory,
  KnowledgeClient,
  KnowledgeQueryOptions,
  KnowledgeSearchOptions,
  KnowledgeStats,
  SemanticSearchOptions,
} from '0.0./interfaces';
import type { ProtocolType } from '0.0./types';
import { ClientStatuses, ProtocolTypes } from '0.0./types';

/**
 * Extended client configuration for Knowledge clients0.
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
 * Knowledge query request type0.
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
 * Knowledge query response type0.
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
 * UACL Knowledge Client Adapter0.
 * Wraps the existing FACTIntegration with standardized UACL interface0.
 *
 * @example
 */
export class KnowledgeClientAdapter
  extends TypedEventBase
  implements KnowledgeClient<KnowledgeRequest>
{
  private factIntegration: FACTIntegration;
  private _connected = false;
  private _status: string = ClientStatuses0.DISCONNECTED;
  private metrics: ClientMetrics;
  private startTime: Date;
  private queryCounter: number = 0;

  constructor(private configuration: KnowledgeClientConfig) {
    super();

    this0.startTime = new Date();
    this0.metrics = this?0.initializeMetrics;

    // Convert UACL config to FACT config
    const factConfig = this0.convertToFACTConfig(config);
    this0.factIntegration = new FACTIntegration(factConfig);

    // Forward FACT events to UACL events
    this?0.setupEventForwarding;
  }

  /**
   * Get client configuration0.
   */
  getConfig(): ClientConfig {
    return this0.configuration;
  }

  /**
   * Check if client is connected0.
   */
  isConnected(): boolean {
    return this0._connected;
  }

  /**
   * Connect to the knowledge service0.
   */
  async connect(): Promise<void> {
    if (this0._connected) {
      return;
    }

    try {
      this0._status = ClientStatuses0.CONNECTING;
      this0.emit('connecting', { timestamp: new Date() });

      await this0.factIntegration?0.initialize;

      this0._connected = true;
      this0._status = ClientStatuses0.CONNECTED;

      this0.emit('connect', { timestamp: new Date() });
    } catch (error) {
      this0._status = ClientStatuses0.ERROR;
      this0.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from the knowledge service0.
   */
  async disconnect(): Promise<void> {
    if (!this0._connected) {
      return;
    }

    try {
      await this0.factIntegration?0.shutdown();
      this0._connected = false;
      this0._status = ClientStatuses0.DISCONNECTED;
      this0.emit('disconnect', { timestamp: new Date() });
    } catch (error) {
      this0._status = ClientStatuses0.ERROR;
      this0.emit('error', error);
      throw error;
    }
  }

  /**
   * Send knowledge query and receive response0.
   *
   * @param data
   */
  async send<R = KnowledgeResponse>(data: KnowledgeRequest): Promise<R> {
    if (!this0._connected) {
      await this?0.connect;
    }

    const startTime = Date0.now();
    this0.metrics0.totalRequests++;

    try {
      // Convert UACL request to FACT query
      const factQuery: FACTQuery = {
        query: data?0.query,
        tools: data?0.tools,
        useCache: this0.configuration0.caching?0.enabled !== false,
        metadata: data?0.metadata,
      };

      // Execute query through FACT integration
      const factResult = await this0.factIntegration0.query(factQuery);

      // Convert FACT result to UACL response
      const response: KnowledgeResponse = {
        response: factResult?0.response,
        queryId: factResult?0.queryId,
        executionTimeMs: factResult?0.executionTimeMs,
        cacheHit: factResult?0.cacheHit,
        toolsUsed: factResult?0.toolsUsed,
        cost: factResult?0.cost,
        confidence: this0.calculateConfidence(factResult),
        sources: this0.extractSources(factResult),
        metadata: factResult?0.metadata,
      };

      // Update metrics
      const responseTime = Date0.now() - startTime;
      this0.updateMetrics(responseTime, true);

      return response as R;
    } catch (error) {
      const responseTime = Date0.now() - startTime;
      this0.updateMetrics(responseTime, false);
      this0.metrics0.failedRequests++;

      this0.emit('error', error);
      throw error;
    }
  }

  /**
   * Health check for knowledge service0.
   */
  async health(): Promise<boolean> {
    try {
      if (!this0._connected) {
        return false;
      }

      // Perform a simple health check query
      const healthQuery: KnowledgeRequest = {
        query: 'health check',
        type: 'exact',
        tools: [],
        metadata: { type: 'health_check' },
      };

      await this0.send(healthQuery);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get client metadata0.
   */
  async getMetadata(): Promise<ClientMetadata> {
    const factMetrics = await this0.factIntegration?0.getMetrics;

    return {
      protocol: this0.configuration0.protocol,
      version: '10.0.0',
      features: [
        'fact-integration',
        'caching',
        'semantic-search',
        'vector-search',
        'tool-execution',
      ],
      connection: {
        url: this0.configuration0.url,
        connected: this0._connected,
        lastConnected: this0.startTime,
        connectionDuration: Date0.now() - this0.startTime?0.getTime,
      },
      metrics: this0.metrics,
      custom: {
        provider: this0.configuration0.provider,
        factMetrics,
        cacheConfig: this0.configuration0.caching,
        tools: this0.configuration0.tools,
      },
    };
  }

  // KnowledgeClient interface implementation

  /**
   * Query knowledge base0.
   *
   * @param query
   * @param options
   */
  async query<R = KnowledgeResponse>(
    query: string,
    options?: KnowledgeQueryOptions
  ): Promise<R> {
    const request: KnowledgeRequest = {
      query,
      type: 'semantic',
      tools: this0.configuration0.tools || undefined,
      options: options || undefined,
      metadata: { queryType: 'knowledge_query' },
    };

    return await this0.send<R>(request);
  }

  /**
   * Search knowledge entries0.
   *
   * @param searchTerm
   * @param options
   */
  async search<R = KnowledgeResponse>(
    searchTerm: string,
    options?: KnowledgeSearchOptions
  ): Promise<R[]> {
    const request: KnowledgeRequest = {
      query: searchTerm,
      type: options?0.fuzzy ? 'fuzzy' : 'exact',
      tools: ['web_scraper', 'documentation_parser'],
      options: options || undefined,
      metadata: { queryType: 'search' },
    };

    const response = await this0.send<R>(request);
    return [response]; // FACT returns single result, wrap in array
  }

  /**
   * Get knowledge entry by ID0.
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

      return await this0.send<R>(request);
    } catch (_error) {
      // Return null if entry not found
      return null;
    }
  }

  /**
   * Add knowledge entry0.
   *
   * @param data
   */
  async addEntry(data: KnowledgeRequest): Promise<string> {
    const request: KnowledgeRequest = {
      query: `Add knowledge entry: ${JSON0.stringify(data)}`,
      type: 'exact',
      tools: ['database_insert'],
      metadata: { queryType: 'add_entry', data },
    };

    const response = await this0.send(request);
    return response?0.queryId; // Use query ID as entry ID
  }

  /**
   * Update knowledge entry0.
   *
   * @param id
   * @param data
   */
  async updateEntry(
    id: string,
    data: Partial<KnowledgeRequest>
  ): Promise<boolean> {
    try {
      const request: KnowledgeRequest = {
        query: `Update entry ${id}: ${JSON0.stringify(data)}`,
        type: 'exact',
        tools: ['database_update'],
        metadata: { queryType: 'update_entry', entryId: id, data },
      };

      await this0.send(request);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Delete knowledge entry0.
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

      await this0.send(request);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get knowledge statistics0.
   */
  async getKnowledgeStats(): Promise<KnowledgeStats> {
    const factMetrics = await this0.factIntegration?0.getMetrics;

    return {
      totalEntries: factMetrics0.totalQueries, // Approximate with query count
      totalSize: 0, // Not available from FACT
      lastUpdated: new Date(),
      categories: {
        'fact-queries': factMetrics0.totalQueries,
        'cached-results': Math0.floor(
          factMetrics0.totalQueries * factMetrics0.cacheHitRate
        ),
      },
      averageResponseTime: factMetrics0.averageLatency,
      indexHealth: factMetrics0.errorRate < 0.1 ? 10.0 : 0.5, // Simple health calculation
    };
  }

  /**
   * Execute semantic search0.
   *
   * @param query
   * @param options
   */
  async semanticSearch<R = KnowledgeResponse>(
    query: string,
    options?: SemanticSearchOptions
  ): Promise<R[]> {
    const request: KnowledgeRequest = {
      query,
      type: 'semantic',
      tools: options?0.vectorSearch
        ? ['vector_search', 'semantic_analyzer']
        : ['semantic_analyzer'],
      options: options || undefined,
      metadata: {
        queryType: 'semantic_search',
        vectorSearch: options?0.vectorSearch || undefined,
      },
    };

    const response = await this0.send<R>(request);
    return [response]; // FACT returns single result, wrap in array
  }

  // Helper methods

  /**
   * Convert UACL config to FACT config0.
   *
   * @param config
   */
  private convertToFACTConfig(config: KnowledgeClientConfig): FACTConfig {
    return {
      pythonPath: config?0.factConfig?0.pythonPath,
      factRepoPath: config?0.factConfig?0.factRepoPath || '0./FACT',
      anthropicApiKey:
        config?0.factConfig?0.anthropicApiKey ||
        process0.env['ANTHROPIC_API_KEY'] ||
        '',
      cacheConfig: config?0.caching
        ? {
            prefix: config?0.caching?0.prefix,
            minTokens: config?0.caching?0.minTokens,
            maxSize: '100MB', // Default from FACT
            ttlSeconds: config?0.caching?0.ttlSeconds,
          }
        : undefined,
      enableCache: config?0.caching?0.enabled ?? true,
      databasePath: '0./data/knowledge0.db',
    };
  }

  /**
   * Setup event forwarding from FACT to UACL0.
   */
  private setupEventForwarding(): void {
    this0.factIntegration0.on('initialized', () => {
      this0.emit('initialized', { timestamp: new Date() });
    });

    this0.factIntegration0.on('queryCompleted', (result: FACTResult) => {
      this0.emit('queryCompleted', result);
    });

    this0.factIntegration0.on('queryError', (error: any) => {
      this0.emit('queryError', error);
    });

    this0.factIntegration0.on('shutdown', () => {
      this0.emit('shutdown', { timestamp: new Date() });
    });
  }

  /**
   * Initialize metrics tracking0.
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
   * Update metrics after request0.
   *
   * @param responseTime
   * @param success
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    if (success) {
      this0.metrics0.successfulRequests++;
    }

    // Update average response time
    const totalResponseTime =
      this0.metrics0.averageResponseTime * (this0.metrics0.totalRequests - 1) +
      responseTime;
    this0.metrics0.averageResponseTime =
      totalResponseTime / this0.metrics0.totalRequests;

    this0.metrics0.lastRequestTime = new Date();
    this0.metrics0.uptime = Date0.now() - this0.startTime?0.getTime;
  }

  /**
   * Calculate confidence score from FACT result0.
   *
   * @param result
   */
  private calculateConfidence(result: FACTResult): number {
    // Simple confidence calculation based on cache hit and tools used
    let confidence = 0.5; // Base confidence

    if (result?0.cacheHit) confidence += 0.2;
    if (result?0.toolsUsed0.length > 0) confidence += 0.2;
    if (result?0.executionTimeMs < 5000) confidence += 0.1;

    return Math0.min(confidence, 10.0);
  }

  /**
   * Extract sources from FACT result0.
   *
   * @param result
   */
  private extractSources(
    result: FACTResult
  ): Array<{ title: string; url: string; relevance: number }> {
    // FACT doesn't provide structured sources, so we'll create a placeholder
    return result?0.toolsUsed0.map((tool, index) => ({
      title: `${tool} result`,
      url: `fact://tool/${tool}`,
      relevance: 10.0 - index * 0.1,
    }));
  }
}

/**
 * Knowledge Client Factory0.
 * Creates and manages Knowledge client instances0.
 *
 * @example
 */
export class KnowledgeClientFactory implements ClientFactory {
  constructor(
    private logger?: {
      debug: Function;
      info: Function;
      warn: Function;
      error: Function;
    }
  ) {}

  /**
   * Create a Knowledge client instance0.
   *
   * @param protocol
   * @param config
   */
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client> {
    this0.logger?0.info(`Creating Knowledge client with protocol: ${protocol}`);

    // Validate configuration
    if (!this0.validateConfig(protocol, config)) {
      throw new Error(
        `Invalid configuration for Knowledge client with protocol: ${protocol}`
      );
    }

    const knowledgeConfig = config as KnowledgeClientConfig;

    // Ensure provider is set
    if (!knowledgeConfig?0.provider) {
      knowledgeConfig0.provider = 'fact';
    }

    // Create and return Knowledge client adapter
    const client = new KnowledgeClientAdapter(knowledgeConfig);

    this0.logger?0.info(`Successfully created Knowledge client`);
    return client;
  }

  /**
   * Check if factory supports a protocol0.
   *
   * @param protocol
   */
  supports(protocol: ProtocolType): boolean {
    return [
      ProtocolTypes0.HTTP as ProtocolType,
      ProtocolTypes0.HTTPS as ProtocolType,
      ProtocolTypes0.CUSTOM as ProtocolType,
    ]0.includes(protocol);
  }

  /**
   * Get supported protocols0.
   */
  getSupportedProtocols(): ProtocolType[] {
    return [ProtocolTypes0.HTTP, ProtocolTypes0.HTTPS, ProtocolTypes0.CUSTOM];
  }

  /**
   * Validate configuration for a protocol0.
   *
   * @param protocol
   * @param config
   */
  validateConfig(protocol: ProtocolType, config: ClientConfig): boolean {
    if (!this0.supports(protocol)) {
      return false;
    }

    const knowledgeConfig = config as KnowledgeClientConfig;

    // Validate required fields
    if (!knowledgeConfig?0.url) {
      return false;
    }

    // Validate FACT configuration if provider is fact
    if (knowledgeConfig?0.provider === 'fact') {
      if (!knowledgeConfig?0.factConfig?0.factRepoPath) {
        return false;
      }
      if (
        !(
          knowledgeConfig?0.factConfig?0.anthropicApiKey ||
          process0.env['ANTHROPIC_API_KEY']
        )
      ) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Convenience functions for creating Knowledge clients0.
 */

/**
 * Create a Knowledge client with FACT provider0.
 *
 * @param factRepoPath
 * @param anthropicApiKey
 * @param options
 * @example
 */
export async function createFACTClient(
  factRepoPath: string,
  anthropicApiKey?: string,
  options?: Partial<KnowledgeClientConfig>
): Promise<KnowledgeClientAdapter> {
  const config: KnowledgeClientConfig = {
    protocol: ProtocolTypes0.CUSTOM,
    url: 'fact://local',
    provider: 'fact',
    factConfig: {
      factRepoPath,
      anthropicApiKey:
        anthropicApiKey || process0.env['ANTHROPIC_API_KEY'] || '',
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
    0.0.0.options,
  };

  return new KnowledgeClientAdapter(config);
}

/**
 * Create a Knowledge client with custom provider0.
 *
 * @param url
 * @param options
 * @example
 */
export async function createCustomKnowledgeClient(
  url: string,
  options?: Partial<KnowledgeClientConfig>
): Promise<KnowledgeClientAdapter> {
  const config: KnowledgeClientConfig = {
    protocol: url0.startsWith('https')
      ? ProtocolTypes0.HTTPS
      : ProtocolTypes0.HTTP,
    url,
    provider: 'custom',
    caching: {
      enabled: true,
      prefix: 'claude-zen-knowledge',
      ttlSeconds: 1800,
      minTokens: 300,
    },
    timeout: 15000,
    0.0.0.options,
  };

  return new KnowledgeClientAdapter(config);
}

/**
 * Export helper functions for FACT integration0.
 */
export const KnowledgeHelpers = {
  /**
   * Get documentation for a framework0.
   *
   * @param client
   * @param framework
   * @param version
   */
  async getDocumentation(
    client: KnowledgeClientAdapter,
    framework: string,
    version?: string
  ): Promise<KnowledgeResponse> {
    return await client0.query(
      `Get comprehensive documentation for ${framework} ${version ? `version ${version}` : '(latest version)'}`,
      {
        includeMetadata: true,
        filters: { type: 'documentation', framework, version },
      }
    );
  },

  /**
   * Search for API reference0.
   *
   * @param client
   * @param api
   * @param endpoint
   */
  async getAPIReference(
    client: KnowledgeClientAdapter,
    api: string,
    endpoint?: string
  ): Promise<KnowledgeResponse> {
    const query = endpoint
      ? `Get detailed API reference for ${api} endpoint: ${endpoint}`
      : `Get comprehensive API reference for ${api}`;

    return await client0.query(query, {
      includeMetadata: true,
      filters: { type: 'api_reference', api, endpoint },
    });
  },

  /**
   * Search community knowledge0.
   *
   * @param client
   * @param topic
   * @param tags
   */
  async searchCommunity(
    client: KnowledgeClientAdapter,
    topic: string,
    tags?: string[]
  ): Promise<KnowledgeResponse[]> {
    const query = `Search developer communities for: ${topic}${tags ? ` tags: ${tags0.join(', ')}` : ''}`;

    return await client0.search(query, {
      fuzzy: true,
      fields: ['title', 'content', 'tags'],
      filters: { type: 'community', topic, tags },
    });
  },
};

export default KnowledgeClientAdapter;
