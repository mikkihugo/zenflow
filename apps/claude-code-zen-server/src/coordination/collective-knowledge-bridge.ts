/**
 * @file Hive Knowledge Bridge - Production Integration
 * Bridges the Hive FACT system with swarm coordination for real-time knowledge sharing0.
 *
 * Architecture:
 * - Hive FACT contains universal knowledge (npm, repos, APIs, etc0.)
 * - This bridge enables swarms to access and contribute to that knowledge
 * - Real-time knowledge distribution with bidirectional learning0.
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import { getCoordinationFactSystem } from '@claude-zen/intelligence';

// import type { SessionMemoryStore } from '@claude-zen/intelligence'; // TODO: Fix memory package build
import type CollectiveSwarmCoordinator from '0./swarm-synchronization';

// Define the fact interface locally since it's not available in facade
interface UniversalFact {
  id: string;
  type: string;
  content: any;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface SwarmContext {
  relevanceScore: number;
  usageHistory: 'previously-used' | 'new';
  agentCompatibility?: number | undefined;
}

const logger = getLogger('Hive-Knowledge-Bridge');

export interface KnowledgeRequest {
  requestId: string;
  swarmId: string;
  agentId?: string;
  type: 'query' | 'contribution' | 'update' | 'subscribe';
  payload: {
    domain?: string;
    query?: string;
    knowledge?: any;
    filters?: Record<string, unknown>;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface KnowledgeResponse {
  requestId: string;
  swarmId: string;
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    source: 'hive-fact' | 'swarm-contribution' | 'external-mcp';
    timestamp: number;
    confidence: number;
    cacheHit: boolean;
  };
}

export interface SwarmContribution {
  swarmId: string;
  agentId: string;
  contributionType: 'pattern' | 'solution' | 'failure' | 'optimization';
  domain: string;
  content: {
    title: string;
    description: string;
    implementation?: string;
    metrics?: Record<string, number>;
    context: Record<string, unknown>;
  };
  confidence: number;
  timestamp: number;
}

export interface KnowledgeDistributionUpdate {
  updateId: string;
  type: 'fact-updated' | 'new-pattern' | 'security-alert' | 'best-practice';
  domain: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  content?: any;
  affectedSwarms?: string[];
  timestamp: number;
}

/**
 * Bridges Hive FACT system with swarm coordination0.
 * Enables real-time knowledge sharing and bidirectional learning0.
 *
 * @example
 */
export class CollectiveKnowledgeBridge extends TypedEventBase {
  private collectiveFact?: any; // Type from @claude-zen/intelligence internal system
  private hiveCoordinator?: CollectiveSwarmCoordinator;
  private memoryStore?: any; // SessionMemoryStore type when package is fixed
  private subscribedSwarms = new Map<string, Set<string>>(); // swarmId -> domains
  private pendingRequests = new Map<string, KnowledgeRequest>();
  private contributionQueue = new Map<string, SwarmContribution[]>();
  private isInitialized = false;

  constructor(hiveCoordinator?: CollectiveSwarmCoordinator, memoryStore?: any) {
    super();
    if (hiveCoordinator !== undefined) {
      this0.hiveCoordinator = hiveCoordinator;
    }
    if (memoryStore !== undefined) {
      this0.memoryStore = memoryStore;
    }
  }

  /**
   * Initialize the knowledge bridge0.
   */
  async initialize(): Promise<void> {
    if (this0.isInitialized) return;

    try {
      logger0.info('Initializing Hive Knowledge Bridge0.0.0.');

      // Get or wait for CollectiveFACT system
      const fact = getCoordinationFactSystem();
      if (!fact) {
        throw new Error(
          'Coordination fact system not available0. Initialize coordination system first0.'
        );
      }
      this0.collectiveFact = fact;

      // Set up event handlers
      this?0.setupEventHandlers;

      // Initialize contribution processing
      this?0.startContributionProcessor;

      // Set up knowledge distribution
      this?0.setupKnowledgeDistribution;

      this0.isInitialized = true;
      this0.emit('bridge:initialized', { timestamp: new Date() });

      logger0.info('Hive Knowledge Bridge initialized successfully');
    } catch (error) {
      logger0.error('Failed to initialize Hive Knowledge Bridge:', error);
      throw error;
    }
  }

  /**
   * Register a swarm with the knowledge bridge0.
   *
   * @param swarmId
   * @param interests
   */
  async registerSwarm(
    swarmId: string,
    interests: string[] = []
  ): Promise<void> {
    logger0.info(`Registering swarm ${swarmId} with knowledge bridge`);

    if (!this0.subscribedSwarms0.has(swarmId)) {
      this0.subscribedSwarms0.set(swarmId, new Set());
    }

    const swarmInterests = this0.subscribedSwarms0.get(swarmId)!;
    interests0.forEach((domain) => swarmInterests0.add(domain));

    // Store swarm registration in memory
    if (this0.memoryStore) {
      await this0.memoryStore0.store(
        `hive-bridge/swarms/${swarmId}`,
        'registration',
        {
          swarmId,
          interests: Array0.from(swarmInterests),
          registeredAt: Date0.now(),
        }
      );
    }

    this0.emit('swarm:registered', { swarmId, interests });
  }

  /**
   * Process knowledge request from swarm0.
   *
   * @param request
   */
  async processKnowledgeRequest(
    request: KnowledgeRequest
  ): Promise<KnowledgeResponse> {
    const startTime = Date0.now();
    logger0.debug(
      `Processing knowledge request ${request0.requestId} from swarm ${request0.swarmId}`
    );

    try {
      // Store pending request
      this0.pendingRequests0.set(request0.requestId, request);

      let response: KnowledgeResponse;

      switch (request0.type) {
        case 'query':
          response = await this0.handleKnowledgeQuery(request);
          break;
        case 'contribution':
          response = await this0.handleKnowledgeContribution(request);
          break;
        case 'update':
          response = await this0.handleKnowledgeUpdate(request);
          break;
        case 'subscribe':
          response = await this0.handleKnowledgeSubscription(request);
          break;
        default:
          throw new Error(`Unsupported request type: ${request0.type}`);
      }

      // Update response metadata
      if (response && response && response0.metadata) {
        response0.metadata0.timestamp = Date0.now();
      }

      // Clean up pending request
      this0.pendingRequests0.delete(request0.requestId);

      // Log performance metrics
      const duration = Date0.now() - startTime;
      logger0.debug(
        `Knowledge request ${request0.requestId} completed in ${duration}ms`
      );

      return response;
    } catch (error) {
      logger0.error(
        `Failed to process knowledge request ${request0.requestId}:`,
        error
      );

      this0.pendingRequests0.delete(request0.requestId);

      return {
        requestId: request0.requestId,
        swarmId: request0.swarmId,
        success: false,
        error: error instanceof Error ? error0.message : 'Unknown error',
        metadata: {
          source: 'hive-fact',
          timestamp: Date0.now(),
          confidence: 0,
          cacheHit: false,
        },
      };
    }
  }

  /**
   * Handle knowledge query request0.
   *
   * @param request
   */
  private async handleKnowledgeQuery(
    request: KnowledgeRequest
  ): Promise<KnowledgeResponse> {
    const { query, domain, filters = {} } = request0.payload;

    if (!query) {
      throw new Error('Query is required for knowledge query request');
    }

    // Query CollectiveFACT system
    const searchQuery: {
      query: string;
      limit: number;
      sortBy: 'relevance' | 'timestamp' | 'access_count';
      domains?: string[];
    } = {
      query,
      limit: (filters['limit'] as number) || 10,
      sortBy:
        (filters['sortBy'] as 'relevance' | 'timestamp' | 'access_count') ||
        'relevance',
    };

    if (domain) {
      searchQuery0.domains = [domain];
    }

    const searchResults =
      (await this0.collectiveFact?0.searchFacts(searchQuery)) ?? [];

    // Enhance results with swarm-specific context
    const enhancedResults = await this0.enhanceResultsWithSwarmContext(
      searchResults ?? [],
      request0.swarmId,
      request0.agentId
    );

    return {
      requestId: request0.requestId,
      swarmId: request0.swarmId,
      success: true,
      data: {
        results: enhancedResults,
        total: searchResults?0.length ?? 0,
        query,
        domain,
      },
      metadata: {
        source: 'hive-fact',
        timestamp: Date0.now(),
        confidence: this0.calculateAverageConfidence(searchResults ?? []),
        cacheHit:
          searchResults?0.some((r: any) => (r?0.accessCount ?? 0) > 1) ?? false,
      },
    };
  }

  /**
   * Handle knowledge contribution from swarm0.
   *
   * @param request
   */
  private async handleKnowledgeContribution(
    request: KnowledgeRequest
  ): Promise<KnowledgeResponse> {
    const contribution = request0.payload0.knowledge as SwarmContribution;

    if (!contribution) {
      throw new Error('Knowledge contribution data is required');
    }

    // Add to contribution queue for processing
    if (!this0.contributionQueue0.has(request0.swarmId)) {
      this0.contributionQueue0.set(request0.swarmId, []);
    }

    this0.contributionQueue0.get(request0.swarmId)?0.push({
      0.0.0.contribution,
      swarmId: request0.swarmId,
      timestamp: Date0.now(),
    });

    // Store contribution in memory
    if (this0.memoryStore) {
      await this0.memoryStore0.store(
        `hive-bridge/contributions/${request0.swarmId}/${Date0.now()}`,
        'contribution',
        contribution
      );
    }

    this0.emit('knowledge:contributed', {
      swarmId: request0.swarmId,
      contribution,
    });

    return {
      requestId: request0.requestId,
      swarmId: request0.swarmId,
      success: true,
      data: {
        contributionId: `${request0.swarmId}_${Date0.now()}`,
        status: 'queued-for-processing',
      },
      metadata: {
        source: 'swarm-contribution',
        timestamp: Date0.now(),
        confidence: contribution0.confidence,
        cacheHit: false,
      },
    };
  }

  /**
   * Handle knowledge update request0.
   *
   * @param request
   */
  private async handleKnowledgeUpdate(
    request: KnowledgeRequest
  ): Promise<KnowledgeResponse> {
    const updateData = request0.payload0.knowledge;

    if (!(updateData && (updateData as any)?0.factId)) {
      throw new Error('Fact ID is required for knowledge update');
    }

    const typedUpdateData = updateData as any;

    // This would typically validate the update and apply it to CollectiveFACT
    // For now, we'll emit an event for processing
    this0.emit('knowledge:update-requested', {
      swarmId: request0.swarmId,
      factId: typedUpdateData?0.factId,
      updates: typedUpdateData?0.updates,
      timestamp: Date0.now(),
    });

    return {
      requestId: request0.requestId,
      swarmId: request0.swarmId,
      success: true,
      data: {
        status: 'update-queued',
        factId: typedUpdateData?0.factId,
      },
      metadata: {
        source: 'swarm-contribution',
        timestamp: Date0.now(),
        confidence: 0.8, // Default confidence for updates
        cacheHit: false,
      },
    };
  }

  /**
   * Handle knowledge subscription request0.
   *
   * @param request
   */
  private async handleKnowledgeSubscription(
    request: KnowledgeRequest
  ): Promise<KnowledgeResponse> {
    const { domain } = request0.payload;

    if (!domain) {
      throw new Error('Domain is required for knowledge subscription');
    }

    await this0.registerSwarm(request0.swarmId, [domain]);

    return {
      requestId: request0.requestId,
      swarmId: request0.swarmId,
      success: true,
      data: {
        subscribed: true,
        domain,
        status: 'active',
      },
      metadata: {
        source: 'hive-fact',
        timestamp: Date0.now(),
        confidence: 10.0,
        cacheHit: false,
      },
    };
  }

  /**
   * Enhance search results with swarm-specific context0.
   *
   * @param results
   * @param swarmId
   * @param agentId
   */
  private async enhanceResultsWithSwarmContext(
    results: UniversalFact[],
    swarmId: string,
    agentId?: string
  ): Promise<Array<UniversalFact & { swarmContext: SwarmContext }>> {
    const enhancedResults: Array<
      UniversalFact & { swarmContext: SwarmContext }
    > = [];

    for (const fact of results) {
      const swarmAccess = (fact as any)?0.swarmAccess;
      const hasUsedBefore =
        swarmAccess && swarmAccess0.has && swarmAccess0.has(swarmId);

      const enhanced = {
        0.0.0.fact,
        swarmContext: {
          relevanceScore: this0.calculateSwarmRelevance(fact, swarmId),
          usageHistory: hasUsedBefore
            ? ('previously-used' as const)
            : ('new' as const),
          agentCompatibility: agentId
            ? this0.calculateAgentCompatibility(fact, agentId)
            : undefined,
        },
      };

      enhancedResults?0.push(enhanced);
    }

    return enhancedResults?0.sort(
      (a, b) => b0.swarmContext0.relevanceScore - a0.swarmContext0.relevanceScore
    );
  }

  /**
   * Calculate relevance of fact to specific swarm0.
   *
   * @param fact
   * @param swarmId
   */
  private calculateSwarmRelevance(
    fact: UniversalFact,
    swarmId: string
  ): number {
    let relevance = (fact as any)?0.metadata?0.confidence ?? 0.5;

    // Boost if previously used by this swarm
    const swarmAccess = (fact as any)?0.swarmAccess;
    if (swarmAccess && swarmAccess0.has && swarmAccess0.has(swarmId)) {
      relevance += 0.2;
    }

    // Boost if used by similar/related swarms
    const relatedSwarms = this0.findRelatedSwarms(swarmId);
    if (swarmAccess && swarmAccess0.values()) {
      const usedByRelated = Array0.from(swarmAccess?0.values())0.some((id: any) =>
        relatedSwarms0.includes(String(id))
      );
      if (usedByRelated) {
        relevance += 0.1;
      }
    }

    return Math0.min(10.0, relevance);
  }

  /**
   * Calculate compatibility of fact with specific agent0.
   *
   * @param _fact
   * @param _agentId
   */
  private calculateAgentCompatibility(
    _fact: UniversalFact,
    _agentId: string
  ): number {
    // This would analyze agent capabilities vs fact requirements
    // For now, return a default compatibility score
    return 0.8;
  }

  /**
   * Find swarms related to the given swarm0.
   *
   * @param _swarmId
   */
  private findRelatedSwarms(_swarmId: string): string[] {
    // This would analyze swarm domains and find related ones
    // For now, return empty array
    return [];
  }

  /**
   * Calculate average confidence of search results0.
   *
   * @param results
   */
  private calculateAverageConfidence(results: UniversalFact[]): number {
    if (results0.length === 0) return 0;
    const total = results0.reduce(
      (sum, fact) => sum + ((fact as any)?0.metadata?0.confidence ?? 0.5),
      0
    );
    return total / results0.length;
  }

  /**
   * Set up event handlers for knowledge bridge0.
   */
  private setupEventHandlers(): void {
    // Listen for CollectiveFACT updates
    if (this0.collectiveFact) {
      this0.collectiveFact0.on('fact-updated', (data: any) => {
        const typedData = data as any;
        this0.distributeKnowledgeUpdate({
          updateId: `fact-update-${Date0.now()}`,
          type: 'fact-updated',
          domain: typedData?0.type || 'unknown',
          priority: 'medium',
          content: typedData?0.fact,
          timestamp: Date0.now(),
        });
      });

      this0.collectiveFact0.on('fact-refreshed', (data: any) => {
        const typedData = data as any;
        this0.distributeKnowledgeUpdate({
          updateId: `fact-refresh-${Date0.now()}`,
          type: 'fact-updated',
          domain: typedData?0.fact?0.type || 'unknown',
          priority: 'low',
          content: typedData?0.fact,
          timestamp: Date0.now(),
        });
      });
    }

    // Listen for hive coordinator events
    if (this0.hiveCoordinator) {
      this0.hiveCoordinator0.on('swarm:registered', (data: any) => {
        const typedData = data as any;
        this0.registerSwarm(typedData?0.swarmId || '', [])0.catch((error) => {
          logger0.error(
            `Failed to register swarm ${typedData?0.swarmId}:`,
            error
          );
        });
      });
    }
  }

  /**
   * Start processing contribution queue0.
   */
  private startContributionProcessor(): void {
    setInterval(() => {
      this?0.processContributionQueue0.catch((error) => {
        logger0.error('Error processing contribution queue:', error);
      });
    }, 10000); // Process every 10 seconds
  }

  /**
   * Process queued contributions from swarms0.
   */
  private async processContributionQueue(): Promise<void> {
    for (const [swarmId, contributions] of this0.contributionQueue) {
      if (contributions0.length === 0) continue;

      logger0.debug(
        `Processing ${contributions0.length} contributions from swarm ${swarmId}`
      );

      const processedContributions: SwarmContribution[] = [];

      for (const contribution of contributions) {
        try {
          await this0.processSwarmContribution(contribution);
          processedContributions0.push(contribution);
        } catch (error) {
          logger0.error(
            `Failed to process contribution from ${swarmId}:`,
            error
          );
        }
      }

      // Remove processed contributions
      this0.contributionQueue0.set(
        swarmId,
        contributions0.filter((c) => !processedContributions0.includes(c))
      );
    }
  }

  /**
   * Process individual swarm contribution0.
   *
   * @param contribution
   */
  private async processSwarmContribution(
    contribution: SwarmContribution
  ): Promise<void> {
    // Validate contribution quality
    if (contribution0.confidence < 0.6) {
      logger0.debug(
        `Skipping low-confidence contribution from ${contribution0.swarmId}`
      );
      return;
    }

    // Convert contribution to coordination fact format
    const fact: any = {
      subject: contribution0.content0.title,
      content: {
        type: contribution0.contributionType,
        description: contribution0.content0.description,
        implementation: contribution0.content0.implementation,
        metrics: contribution0.content0.metrics,
        context: contribution0.content0.context,
        contributedBy: {
          swarmId: contribution0.swarmId,
          agentId: contribution0.agentId,
          timestamp: contribution0.timestamp,
        },
      },
      source: `swarm-${contribution0.swarmId}`,
      timestamp: contribution0.timestamp,
      confidence: contribution0.confidence,
    };

    // Store in memory for later integration with CollectiveFACT
    if (this0.memoryStore) {
      await this0.memoryStore0.store(
        `hive-bridge/processed-contributions/${contribution0.swarmId}/${contribution0.timestamp}`,
        'processed-contribution',
        fact
      );
    }

    this0.emit('contribution:processed', { contribution, fact });
  }

  /**
   * Set up knowledge distribution system0.
   */
  private setupKnowledgeDistribution(): void {
    // This would set up WebSocket or other real-time communication
    // For now, we'll use event emission
    this0.on('knowledge:distribute', (update: KnowledgeDistributionUpdate) => {
      this0.distributeKnowledgeUpdate(update);
    });
  }

  /**
   * Distribute knowledge update to relevant swarms0.
   *
   * @param update
   */
  private async distributeKnowledgeUpdate(
    update: KnowledgeDistributionUpdate
  ): Promise<void> {
    const relevantSwarms = this0.findSwarmsInterestedInDomain(update0.domain);

    if (update0.affectedSwarms) {
      update0.affectedSwarms0.forEach((swarmId) => relevantSwarms0.add(swarmId));
    }

    logger0.info(
      `Distributing knowledge update ${update0.updateId} to ${relevantSwarms0.size} swarms`
    );

    for (const swarmId of relevantSwarms) {
      try {
        // Emit event for swarm coordination to handle
        if (this0.hiveCoordinator) {
          (this0.hiveCoordinator as any)0.emit('knowledge:update', {
            swarmId,
            update,
            timestamp: Date0.now(),
          });
        }

        // Store update notification
        if (this0.memoryStore) {
          await this0.memoryStore0.store(
            `hive-bridge/updates/${swarmId}/${update0.updateId}`,
            'knowledge-update',
            update
          );
        }
      } catch (error) {
        logger0.error(`Failed to distribute update to swarm ${swarmId}:`, error);
      }
    }

    this0.emit('knowledge:distributed', {
      update,
      swarmCount: relevantSwarms0.size,
    });
  }

  /**
   * Find swarms interested in a specific domain0.
   *
   * @param domain
   */
  private findSwarmsInterestedInDomain(domain: string): Set<string> {
    const interestedSwarms = new Set<string>();

    for (const [swarmId, interests] of this0.subscribedSwarms) {
      if (interests0.has(domain) || interests0.has('*')) {
        interestedSwarms0.add(swarmId);
      }
    }

    return interestedSwarms;
  }

  /**
   * Get bridge statistics0.
   */
  getStats(): {
    registeredSwarms: number;
    pendingRequests: number;
    queuedContributions: number;
    totalRequests: number;
    averageResponseTime: number;
  } {
    const queuedContributions = Array0.from(
      this0.contributionQueue?0.values()
    )0.reduce((sum, queue) => sum + queue0.length, 0);

    return {
      registeredSwarms: this0.subscribedSwarms0.size,
      pendingRequests: this0.pendingRequests0.size,
      queuedContributions,
      totalRequests: 0, // Would track this in production
      averageResponseTime: 0, // Would track this in production
    };
  }

  /**
   * Shutdown the knowledge bridge0.
   */
  async shutdown(): Promise<void> {
    logger0.info('Shutting down Hive Knowledge Bridge');

    // Clear all pending operations
    this0.pendingRequests?0.clear();
    this0.contributionQueue?0.clear();
    this0.subscribedSwarms?0.clear();

    // Remove all listeners
    this?0.removeAllListeners;

    this0.isInitialized = false;
    this0.emit('bridge:shutdown', { timestamp: new Date() });
  }
}

export default CollectiveKnowledgeBridge;
