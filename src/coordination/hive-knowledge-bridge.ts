/**
 * @file Hive Knowledge Bridge - Production Integration
 * Bridges the Hive FACT system with swarm coordination for real-time knowledge sharing.
 *
 * Architecture:
 * - Hive FACT contains universal knowledge (npm, repos, APIs, etc.)
 * - This bridge enables swarms to access and contribute to that knowledge
 * - Real-time knowledge distribution with bidirectional learning.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import type { SessionMemoryStore } from '../memory';
import { getHiveFACT, type HiveFACTSystem, type UniversalFact } from './hive-fact-integration.ts';
import type { HiveSwarmCoordinator } from './hive-swarm-sync.ts';

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
    filters?: Record<string, any>;
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
    context: Record<string, any>;
  };
  confidence: number;
  timestamp: number;
}

export interface KnowledgeDistributionUpdate {
  updateId: string;
  type: 'fact-updated' | 'new-pattern' | 'security-alert' | 'best-practice';
  domain: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  content: any;
  affectedSwarms?: string[];
  timestamp: number;
}

/**
 * Bridges Hive FACT system with swarm coordination.
 * Enables real-time knowledge sharing and bidirectional learning.
 *
 * @example
 */
export class HiveKnowledgeBridge extends EventEmitter {
  private hiveFact?: HiveFACTSystem;
  private hiveCoordinator?: HiveSwarmCoordinator;
  private memoryStore?: SessionMemoryStore;
  private subscribedSwarms = new Map<string, Set<string>>(); // swarmId -> domains
  private pendingRequests = new Map<string, KnowledgeRequest>();
  private contributionQueue = new Map<string, SwarmContribution[]>();
  private isInitialized = false;

  constructor(hiveCoordinator?: HiveSwarmCoordinator, memoryStore?: SessionMemoryStore) {
    super();
    if (hiveCoordinator !== undefined) {
      this.hiveCoordinator = hiveCoordinator;
    }
    if (memoryStore !== undefined) {
      this.memoryStore = memoryStore;
    }
  }

  /**
   * Initialize the knowledge bridge.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing Hive Knowledge Bridge...');

      // Get or wait for HiveFACT system
      const fact = getHiveFACT();
      if (!fact) {
        throw new Error('HiveFACT system not available. Initialize HiveSwarmCoordinator first.');
      }
      this.hiveFact = fact;

      // Set up event handlers
      this.setupEventHandlers();

      // Initialize contribution processing
      this.startContributionProcessor();

      // Set up knowledge distribution
      this.setupKnowledgeDistribution();

      this.isInitialized = true;
      this.emit('bridge:initialized');

      logger.info('Hive Knowledge Bridge initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Hive Knowledge Bridge:', error);
      throw error;
    }
  }

  /**
   * Register a swarm with the knowledge bridge.
   *
   * @param swarmId
   * @param interests
   */
  async registerSwarm(swarmId: string, interests: string[] = []): Promise<void> {
    logger.info(`Registering swarm ${swarmId} with knowledge bridge`);

    if (!this.subscribedSwarms.has(swarmId)) {
      this.subscribedSwarms.set(swarmId, new Set());
    }

    const swarmInterests = this.subscribedSwarms.get(swarmId)!;
    interests.forEach((domain) => swarmInterests.add(domain));

    // Store swarm registration in memory
    if (this.memoryStore) {
      await this.memoryStore.store(`hive-bridge/swarms/${swarmId}`, 'registration', {
        swarmId,
        interests: Array.from(swarmInterests),
        registeredAt: Date.now(),
      });
    }

    this.emit('swarm:registered', { swarmId, interests });
  }

  /**
   * Process knowledge request from swarm.
   *
   * @param request
   */
  async processKnowledgeRequest(request: KnowledgeRequest): Promise<KnowledgeResponse> {
    const startTime = Date.now();
    logger.debug(`Processing knowledge request ${request.requestId} from swarm ${request.swarmId}`);

    try {
      // Store pending request
      this.pendingRequests.set(request.requestId, request);

      let response: KnowledgeResponse;

      switch (request.type) {
        case 'query':
          response = await this.handleKnowledgeQuery(request);
          break;
        case 'contribution':
          response = await this.handleKnowledgeContribution(request);
          break;
        case 'update':
          response = await this.handleKnowledgeUpdate(request);
          break;
        case 'subscribe':
          response = await this.handleKnowledgeSubscription(request);
          break;
        default:
          throw new Error(`Unsupported request type: ${request.type}`);
      }

      // Update response metadata
      if (response) {
        response.metadata.timestamp = Date.now();
      }

      // Clean up pending request
      this.pendingRequests.delete(request.requestId);

      // Log performance metrics
      const duration = Date.now() - startTime;
      logger.debug(`Knowledge request ${request.requestId} completed in ${duration}ms`);

      return response;
    } catch (error) {
      logger.error(`Failed to process knowledge request ${request.requestId}:`, error);

      this.pendingRequests.delete(request.requestId);

      return {
        requestId: request.requestId,
        swarmId: request.swarmId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          source: 'hive-fact',
          timestamp: Date.now(),
          confidence: 0,
          cacheHit: false,
        },
      };
    }
  }

  /**
   * Handle knowledge query request.
   *
   * @param request
   */
  private async handleKnowledgeQuery(request: KnowledgeRequest): Promise<KnowledgeResponse> {
    const { query, domain, filters = {} } = request.payload;

    if (!query) {
      throw new Error('Query is required for knowledge query request');
    }

    // Query HiveFACT system
    const searchQuery: {
      query: string;
      limit: number;
      sortBy: 'relevance' | 'timestamp' | 'access_count';
      domains?: string[];
    } = {
      query,
      limit: (filters['limit'] as number) || 10,
      sortBy: (filters['sortBy'] as 'relevance' | 'timestamp' | 'access_count') || 'relevance',
    };

    if (domain) {
      searchQuery.domains = [domain];
    }

    const searchResults = (await this.hiveFact?.searchFacts(searchQuery)) ?? [];

    // Enhance results with swarm-specific context
    const enhancedResults = await this.enhanceResultsWithSwarmContext(
      searchResults ?? [],
      request.swarmId,
      request.agentId
    );

    return {
      requestId: request.requestId,
      swarmId: request.swarmId,
      success: true,
      data: {
        results: enhancedResults,
        total: searchResults?.length ?? 0,
        query,
        domain,
      },
      metadata: {
        source: 'hive-fact',
        timestamp: Date.now(),
        confidence: this.calculateAverageConfidence(searchResults ?? []),
        cacheHit: searchResults?.some((r) => (r.accessCount ?? 0) > 1) ?? false,
      },
    };
  }

  /**
   * Handle knowledge contribution from swarm.
   *
   * @param request
   */
  private async handleKnowledgeContribution(request: KnowledgeRequest): Promise<KnowledgeResponse> {
    const contribution = request.payload.knowledge as SwarmContribution;

    if (!contribution) {
      throw new Error('Knowledge contribution data is required');
    }

    // Add to contribution queue for processing
    if (!this.contributionQueue.has(request.swarmId)) {
      this.contributionQueue.set(request.swarmId, []);
    }

    this.contributionQueue.get(request.swarmId)?.push({
      ...contribution,
      swarmId: request.swarmId,
      timestamp: Date.now(),
    });

    // Store contribution in memory
    if (this.memoryStore) {
      await this.memoryStore.store(
        `hive-bridge/contributions/${request.swarmId}/${Date.now()}`,
        'contribution',
        contribution
      );
    }

    this.emit('knowledge:contributed', {
      swarmId: request.swarmId,
      contribution,
    });

    return {
      requestId: request.requestId,
      swarmId: request.swarmId,
      success: true,
      data: {
        contributionId: `${request.swarmId}_${Date.now()}`,
        status: 'queued-for-processing',
      },
      metadata: {
        source: 'swarm-contribution',
        timestamp: Date.now(),
        confidence: contribution.confidence,
        cacheHit: false,
      },
    };
  }

  /**
   * Handle knowledge update request.
   *
   * @param request
   */
  private async handleKnowledgeUpdate(request: KnowledgeRequest): Promise<KnowledgeResponse> {
    const updateData = request.payload.knowledge;

    if (!updateData || !updateData?.factId) {
      throw new Error('Fact ID is required for knowledge update');
    }

    // This would typically validate the update and apply it to HiveFACT
    // For now, we'll emit an event for processing
    this.emit('knowledge:update-requested', {
      swarmId: request.swarmId,
      factId: updateData?.factId,
      updates: updateData?.updates,
      timestamp: Date.now(),
    });

    return {
      requestId: request.requestId,
      swarmId: request.swarmId,
      success: true,
      data: {
        status: 'update-queued',
        factId: updateData?.factId,
      },
      metadata: {
        source: 'swarm-contribution',
        timestamp: Date.now(),
        confidence: 0.8, // Default confidence for updates
        cacheHit: false,
      },
    };
  }

  /**
   * Handle knowledge subscription request.
   *
   * @param request
   */
  private async handleKnowledgeSubscription(request: KnowledgeRequest): Promise<KnowledgeResponse> {
    const { domain } = request.payload;

    if (!domain) {
      throw new Error('Domain is required for knowledge subscription');
    }

    await this.registerSwarm(request.swarmId, [domain]);

    return {
      requestId: request.requestId,
      swarmId: request.swarmId,
      success: true,
      data: {
        subscribed: true,
        domain,
        status: 'active',
      },
      metadata: {
        source: 'hive-fact',
        timestamp: Date.now(),
        confidence: 1.0,
        cacheHit: false,
      },
    };
  }

  /**
   * Enhance search results with swarm-specific context.
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
    const enhancedResults: Array<UniversalFact & { swarmContext: SwarmContext }> = [];

    for (const fact of results) {
      const enhanced = {
        ...fact,
        swarmContext: {
          relevanceScore: this.calculateSwarmRelevance(fact, swarmId),
          usageHistory: fact.swarmAccess.has(swarmId)
            ? ('previously-used' as const)
            : ('new' as const),
          agentCompatibility: agentId ? this.calculateAgentCompatibility(fact, agentId) : undefined,
        },
      };

      enhancedResults?.push(enhanced);
    }

    return enhancedResults?.sort(
      (a, b) => b.swarmContext.relevanceScore - a.swarmContext.relevanceScore
    );
  }

  /**
   * Calculate relevance of fact to specific swarm.
   *
   * @param fact
   * @param swarmId
   */
  private calculateSwarmRelevance(fact: UniversalFact, swarmId: string): number {
    let relevance = fact.metadata.confidence;

    // Boost if previously used by this swarm
    if (fact.swarmAccess.has(swarmId)) {
      relevance += 0.2;
    }

    // Boost if used by similar/related swarms
    const relatedSwarms = this.findRelatedSwarms(swarmId);
    const usedByRelated = Array.from(fact.swarmAccess).some((id) => relatedSwarms.includes(id));
    if (usedByRelated) {
      relevance += 0.1;
    }

    return Math.min(1.0, relevance);
  }

  /**
   * Calculate compatibility of fact with specific agent.
   *
   * @param _fact
   * @param _agentId
   */
  private calculateAgentCompatibility(_fact: UniversalFact, _agentId: string): number {
    // This would analyze agent capabilities vs fact requirements
    // For now, return a default compatibility score
    return 0.8;
  }

  /**
   * Find swarms related to the given swarm.
   *
   * @param _swarmId
   */
  private findRelatedSwarms(_swarmId: string): string[] {
    // This would analyze swarm domains and find related ones
    // For now, return empty array
    return [];
  }

  /**
   * Calculate average confidence of search results.
   *
   * @param results
   */
  private calculateAverageConfidence(results: UniversalFact[]): number {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, fact) => sum + fact.metadata.confidence, 0);
    return total / results.length;
  }

  /**
   * Set up event handlers for knowledge bridge.
   */
  private setupEventHandlers(): void {
    // Listen for HiveFACT updates
    if (this.hiveFact) {
      this.hiveFact.on('fact-updated', (data) => {
        this.distributeKnowledgeUpdate({
          updateId: `fact-update-${Date.now()}`,
          type: 'fact-updated',
          domain: data?.type,
          priority: 'medium',
          content: data?.fact,
          timestamp: Date.now(),
        });
      });

      this.hiveFact.on('fact-refreshed', (data) => {
        this.distributeKnowledgeUpdate({
          updateId: `fact-refresh-${Date.now()}`,
          type: 'fact-updated',
          domain: data?.fact?.type,
          priority: 'low',
          content: data?.fact,
          timestamp: Date.now(),
        });
      });
    }

    // Listen for hive coordinator events
    if (this.hiveCoordinator) {
      this.hiveCoordinator.on('swarm:registered', (data) => {
        this.registerSwarm(data?.swarmId, []).catch((error) => {
          logger.error(`Failed to register swarm ${data?.swarmId}:`, error);
        });
      });
    }
  }

  /**
   * Start processing contribution queue.
   */
  private startContributionProcessor(): void {
    setInterval(() => {
      this.processContributionQueue().catch((error) => {
        logger.error('Error processing contribution queue:', error);
      });
    }, 10000); // Process every 10 seconds
  }

  /**
   * Process queued contributions from swarms.
   */
  private async processContributionQueue(): Promise<void> {
    for (const [swarmId, contributions] of this.contributionQueue) {
      if (contributions.length === 0) continue;

      logger.debug(`Processing ${contributions.length} contributions from swarm ${swarmId}`);

      const processedContributions: SwarmContribution[] = [];

      for (const contribution of contributions) {
        try {
          await this.processSwarmContribution(contribution);
          processedContributions.push(contribution);
        } catch (error) {
          logger.error(`Failed to process contribution from ${swarmId}:`, error);
        }
      }

      // Remove processed contributions
      this.contributionQueue.set(
        swarmId,
        contributions.filter((c) => !processedContributions.includes(c))
      );
    }
  }

  /**
   * Process individual swarm contribution.
   *
   * @param contribution
   */
  private async processSwarmContribution(contribution: SwarmContribution): Promise<void> {
    // Validate contribution quality
    if (contribution.confidence < 0.6) {
      logger.debug(`Skipping low-confidence contribution from ${contribution.swarmId}`);
      return;
    }

    // Convert contribution to universal fact format
    const fact: Partial<UniversalFact> = {
      type: 'general',
      subject: contribution.content.title,
      content: {
        type: contribution.contributionType,
        description: contribution.content.description,
        implementation: contribution.content.implementation,
        metrics: contribution.content.metrics,
        context: contribution.content.context,
        contributedBy: {
          swarmId: contribution.swarmId,
          agentId: contribution.agentId,
          timestamp: contribution.timestamp,
        },
      },
      metadata: {
        source: `swarm-${contribution.swarmId}`,
        timestamp: contribution.timestamp,
        confidence: contribution.confidence,
      },
    };

    // Store in memory for later integration with HiveFACT
    if (this.memoryStore) {
      await this.memoryStore.store(
        `hive-bridge/processed-contributions/${contribution.swarmId}/${contribution.timestamp}`,
        'processed-contribution',
        fact
      );
    }

    this.emit('contribution:processed', { contribution, fact });
  }

  /**
   * Set up knowledge distribution system.
   */
  private setupKnowledgeDistribution(): void {
    // This would set up WebSocket or other real-time communication
    // For now, we'll use event emission
    this.on('knowledge:distribute', (update: KnowledgeDistributionUpdate) => {
      this.distributeKnowledgeUpdate(update);
    });
  }

  /**
   * Distribute knowledge update to relevant swarms.
   *
   * @param update
   */
  private async distributeKnowledgeUpdate(update: KnowledgeDistributionUpdate): Promise<void> {
    const relevantSwarms = this.findSwarmsInterestedInDomain(update.domain);

    if (update.affectedSwarms) {
      update.affectedSwarms.forEach((swarmId) => relevantSwarms.add(swarmId));
    }

    logger.info(
      `Distributing knowledge update ${update.updateId} to ${relevantSwarms.size} swarms`
    );

    for (const swarmId of relevantSwarms) {
      try {
        // Emit event for swarm coordination to handle
        if (this.hiveCoordinator) {
          this.hiveCoordinator.emit('knowledge:update', {
            swarmId,
            update,
            timestamp: Date.now(),
          });
        }

        // Store update notification
        if (this.memoryStore) {
          await this.memoryStore.store(
            `hive-bridge/updates/${swarmId}/${update.updateId}`,
            'knowledge-update',
            update
          );
        }
      } catch (error) {
        logger.error(`Failed to distribute update to swarm ${swarmId}:`, error);
      }
    }

    this.emit('knowledge:distributed', {
      update,
      swarmCount: relevantSwarms.size,
    });
  }

  /**
   * Find swarms interested in a specific domain.
   *
   * @param domain
   */
  private findSwarmsInterestedInDomain(domain: string): Set<string> {
    const interestedSwarms = new Set<string>();

    for (const [swarmId, interests] of this.subscribedSwarms) {
      if (interests.has(domain) || interests.has('*')) {
        interestedSwarms.add(swarmId);
      }
    }

    return interestedSwarms;
  }

  /**
   * Get bridge statistics.
   */
  getStats(): {
    registeredSwarms: number;
    pendingRequests: number;
    queuedContributions: number;
    totalRequests: number;
    averageResponseTime: number;
  } {
    const queuedContributions = Array.from(this.contributionQueue.values()).reduce(
      (sum, queue) => sum + queue.length,
      0
    );

    return {
      registeredSwarms: this.subscribedSwarms.size,
      pendingRequests: this.pendingRequests.size,
      queuedContributions,
      totalRequests: 0, // Would track this in production
      averageResponseTime: 0, // Would track this in production
    };
  }

  /**
   * Shutdown the knowledge bridge.
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Hive Knowledge Bridge');

    // Clear all pending operations
    this.pendingRequests.clear();
    this.contributionQueue.clear();
    this.subscribedSwarms.clear();

    // Remove all listeners
    this.removeAllListeners();

    this.isInitialized = false;
    this.emit('bridge:shutdown');
  }
}

export default HiveKnowledgeBridge;
