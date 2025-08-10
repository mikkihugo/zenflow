/**
 * @file Swarm Knowledge Synchronization
 * Handles knowledge synchronization between individual swarms and the Hive Knowledge Bridge.
 *
 * Features:
 * - Real-time knowledge queries to Hive FACT
 * - Contribution of learned patterns back to Hive
 * - Local knowledge caching for performance.
 * - Subscription management for domain-specific updates.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config';
import type {
  KnowledgeDistributionUpdate,
  KnowledgeRequest,
  KnowledgeResponse,
  SwarmContribution,
} from '../hive-knowledge-bridge';
import type { SessionMemoryStore } from '../memory/memory';

const logger = getLogger('Swarm-Knowledge-Sync');

export interface SwarmKnowledgeConfig {
  swarmId: string;
  cacheSize?: number;
  cacheTTL?: number; // milliseconds
  autoSubscribe?: boolean;
  contributionThreshold?: number; // minimum confidence to contribute
  maxRetries?: number;
}

export interface LocalKnowledgeEntry {
  id: string;
  query: string;
  data: any;
  metadata: {
    source: string;
    timestamp: number;
    confidence: number;
    accessCount: number;
    lastAccessed: number;
  };
  ttl: number;
}

export interface SwarmLearning {
  id: string;
  type: 'pattern' | 'solution' | 'failure' | 'optimization';
  domain: string;
  context: {
    taskType: string;
    agentTypes: string[];
    inputSize: number;
    complexity: 'low' | 'medium' | 'high';
  };
  outcome: {
    success: boolean;
    duration: number;
    quality: number;
    efficiency: number;
    userSatisfaction?: number;
  };
  insights: {
    whatWorked: string[];
    whatFailed: string[];
    optimizations: string[];
    bestPractices: string[];
  };
  confidence: number;
  timestamp: number;
}

/**
 * Manages knowledge synchronization for an individual swarm.
 *
 * @example
 */
export class SwarmKnowledgeSync extends EventEmitter {
  private config: SwarmKnowledgeConfig;
  private localCache = new Map<string, LocalKnowledgeEntry>();
  private subscriptions = new Set<string>(); // domains
  private memoryStore: SessionMemoryStore | undefined;
  private learningHistory: SwarmLearning[] = [];
  private isInitialized = false;
  private retryCount = new Map<string, number>();

  constructor(config: SwarmKnowledgeConfig, memoryStore?: SessionMemoryStore) {
    super();
    this.config = {
      cacheSize: 1000,
      cacheTTL: 3600000, // 1 hour
      autoSubscribe: true,
      contributionThreshold: 0.7,
      maxRetries: 3,
      ...config,
    };
    // Fix TS2412: Handle exact optional property types
    this.memoryStore = memoryStore;
  }

  /**
   * Initialize knowledge sync system.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info(`Initializing knowledge sync for swarm ${this.config.swarmId}`);

      // Load cached knowledge from persistent storage
      await this.loadPersistedKnowledge();

      // Load learning history
      await this.loadLearningHistory();

      // Set up cache cleanup
      this.startCacheCleanup();

      // Auto-subscribe to relevant domains if enabled
      if (this.config.autoSubscribe) {
        await this.autoSubscribeToDomains();
      }

      this.isInitialized = true;
      this.emit('sync:initialized', { swarmId: this.config.swarmId });

      logger.info(`Knowledge sync initialized for swarm ${this.config.swarmId}`);
    } catch (error) {
      logger.error(`Failed to initialize knowledge sync for swarm ${this.config.swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Query knowledge from Hive FACT system.
   *
   * @param query
   * @param domain
   * @param agentId
   * @param options
   * @param options.useCache
   * @param options.priority
   * @param options.filters
   */
  async queryKnowledge(
    query: string,
    domain?: string,
    agentId?: string,
    options: {
      useCache?: boolean;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      filters?: Record<string, any>;
    } = {}
  ): Promise<any> {
    const cacheKey = `${query}:${domain || 'general'}`;

    // Check local cache first
    if (options?.useCache !== false) {
      const cached = this.getCachedKnowledge(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for query: ${query}`);
        return cached.data;
      }
    }

    try {
      // Fix TS2375: Build payload object with proper conditional assignment
      const payload: { query: string; domain?: string; filters?: Record<string, any> } = { query };
      if (domain !== undefined) {
        payload.domain = domain;
      }
      if (options?.filters !== undefined) {
        payload.filters = options?.filters;
      }

      // Create knowledge request
      const request: KnowledgeRequest = {
        requestId: this.generateRequestId(),
        swarmId: this.config.swarmId,
        ...(agentId !== undefined && { agentId }),
        type: 'query',
        payload,
        priority: options?.priority || 'medium',
        timestamp: Date.now(),
      };

      // Send request to Hive Knowledge Bridge (via event system)
      const response = await this.sendKnowledgeRequest(request);

      if (response?.success && response?.data) {
        // Cache the response
        if (options?.useCache !== false) {
          this.cacheKnowledge(cacheKey, response?.data, response?.metadata);
        }

        // Track successful query
        this.trackQuerySuccess(query, domain, response?.metadata?.confidence);

        return response?.data;
      } else {
        throw new Error(response?.error || 'Knowledge query failed');
      }
    } catch (error) {
      logger.error(`Knowledge query failed for swarm ${this.config.swarmId}:`, error);

      // Try to return fallback knowledge from cache or learning history
      const fallback = this.getFallbackKnowledge(query, domain);
      if (fallback) {
        logger.info('Using fallback knowledge from local sources');
        return fallback;
      }

      throw error;
    }
  }

  /**
   * Contribute learned knowledge back to Hive.
   *
   * @param learning
   * @param agentId
   */
  async contributeKnowledge(
    learning: Omit<SwarmLearning, 'id' | 'timestamp'>,
    agentId: string
  ): Promise<boolean> {
    // Check if contribution meets threshold
    if (learning.confidence < this.config.contributionThreshold!) {
      logger.debug(
        `Skipping contribution below threshold (${learning.confidence} < ${this.config.contributionThreshold})`
      );
      return false;
    }

    try {
      const contribution: SwarmContribution = {
        swarmId: this.config.swarmId,
        agentId,
        contributionType: learning.type,
        domain: learning.domain,
        content: {
          title: `${learning.type} in ${learning.domain}`,
          description: this.generateContributionDescription(learning),
          implementation: this.extractImplementationDetails(learning),
          metrics: this.extractMetrics(learning),
          context: {
            taskType: learning.context.taskType,
            agentTypes: learning.context.agentTypes,
            complexity: learning.context.complexity,
            insights: learning.insights,
          },
        },
        confidence: learning.confidence,
        timestamp: Date.now(),
      };

      const request: KnowledgeRequest = {
        requestId: this.generateRequestId(),
        swarmId: this.config.swarmId,
        ...(agentId !== undefined && { agentId }),
        type: 'contribution',
        payload: {
          knowledge: contribution,
        },
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await this.sendKnowledgeRequest(request);

      if (response?.success) {
        // Store in learning history
        const learningEntry: SwarmLearning = {
          ...learning,
          id: this.generateLearningId(),
          timestamp: Date.now(),
        };

        this.learningHistory.push(learningEntry);
        await this.persistLearningHistory();

        this.emit('knowledge:contributed', { learning: learningEntry, response });

        logger.info(
          `Successfully contributed knowledge to Hive: ${learning.type} in ${learning.domain}`
        );
        return true;
      } else {
        logger.error(`Failed to contribute knowledge: ${response?.error}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error contributing knowledge to Hive:`, error);
      return false;
    }
  }

  /**
   * Subscribe to knowledge updates for specific domain.
   *
   * @param domain
   */
  async subscribeToDomain(domain: string): Promise<boolean> {
    if (this.subscriptions.has(domain)) {
      logger.debug(`Already subscribed to domain: ${domain}`);
      return true;
    }

    try {
      const request: KnowledgeRequest = {
        requestId: this.generateRequestId(),
        swarmId: this.config.swarmId,
        type: 'subscribe',
        payload: { domain },
        priority: 'low',
        timestamp: Date.now(),
      };

      const response = await this.sendKnowledgeRequest(request);

      if (response?.success) {
        this.subscriptions.add(domain);
        await this.persistSubscriptions();

        this.emit('domain:subscribed', { domain });
        logger.info(`Subscribed to knowledge updates for domain: ${domain}`);
        return true;
      } else {
        logger.error(`Failed to subscribe to domain ${domain}: ${response?.error}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error subscribing to domain ${domain}:`, error);
      return false;
    }
  }

  /**
   * Handle incoming knowledge update from Hive.
   *
   * @param update
   */
  async handleKnowledgeUpdate(update: KnowledgeDistributionUpdate): Promise<void> {
    logger.info(`Received knowledge update: ${update.type} for domain ${update.domain}`);

    try {
      // Invalidate related cache entries
      this.invalidateCacheForDomain(update.domain);

      // Process update based on type
      switch (update.type) {
        case 'fact-updated':
          await this.handleFactUpdate(update);
          break;
        case 'new-pattern':
          await this.handleNewPattern(update);
          break;
        case 'security-alert':
          await this.handleSecurityAlert(update);
          break;
        case 'best-practice':
          await this.handleBestPractice(update);
          break;
        default:
          logger.warn(`Unknown knowledge update type: ${update.type}`);
      }

      // Store update for future reference
      if (this.memoryStore) {
        await this.memoryStore.store(
          `swarm-knowledge/${this.config.swarmId}/updates/${update.updateId}`,
          'knowledge-update',
          update
        );
      }

      this.emit('knowledge:updated', { update });
    } catch (error) {
      logger.error(`Error handling knowledge update ${update.updateId}:`, error);
    }
  }

  /**
   * Get swarm knowledge statistics.
   */
  getStats(): {
    cacheSize: number;
    cacheHitRate: number;
    subscriptions: number;
    learningHistory: number;
    successfulQueries: number;
    contributions: number;
  } {
    return {
      cacheSize: this.localCache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      subscriptions: this.subscriptions.size,
      learningHistory: this.learningHistory.length,
      successfulQueries: 0, // Would track this in production
      contributions: this.learningHistory.filter((l) => l.outcome.success).length,
    };
  }

  /**
   * Clear local cache.
   */
  clearCache(): void {
    this.localCache.clear();
    this.emit('cache:cleared');
    logger.info(`Cache cleared for swarm ${this.config.swarmId}`);
  }

  /**
   * Shutdown knowledge sync.
   */
  async shutdown(): Promise<void> {
    logger.info(`Shutting down knowledge sync for swarm ${this.config.swarmId}`);

    // Persist current state
    await this.persistCurrentState();

    // Clear all data
    this.localCache.clear();
    this.subscriptions.clear();
    this.learningHistory.length = 0;
    this.retryCount.clear();

    // Remove all listeners
    this.removeAllListeners();

    this.isInitialized = false;
  }

  // Private helper methods

  private getCachedKnowledge(key: string): LocalKnowledgeEntry | null {
    const entry = this.localCache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.metadata.timestamp + entry.ttl) {
      this.localCache.delete(key);
      return null;
    }

    // Update access stats
    entry.metadata.accessCount++;
    entry.metadata.lastAccessed = Date.now();

    return entry;
  }

  private cacheKnowledge(key: string, data: any, metadata: any): void {
    // Check cache size limit
    if (this.localCache.size >= this.config.cacheSize!) {
      this.evictOldestCacheEntry();
    }

    const entry: LocalKnowledgeEntry = {
      id: this.generateEntryId(),
      query: key,
      data,
      metadata: {
        source: metadata?.source,
        timestamp: Date.now(),
        confidence: metadata?.confidence,
        accessCount: 1,
        lastAccessed: Date.now(),
      },
      ttl: this.config.cacheTTL!,
    };

    this.localCache.set(key, entry);
  }

  private evictOldestCacheEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.localCache) {
      if (entry.metadata.lastAccessed < oldestTime) {
        oldestTime = entry.metadata.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.localCache.delete(oldestKey);
    }
  }

  private async sendKnowledgeRequest(request: KnowledgeRequest): Promise<KnowledgeResponse> {
    // In a real implementation, this would communicate with the Hive Knowledge Bridge
    // For now, we'll emit an event and expect a response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Knowledge request timeout'));
      }, 10000); // 10 second timeout

      const handleResponse = (response: KnowledgeResponse) => {
        if (response?.requestId === request.requestId) {
          clearTimeout(timeout);
          this.off('knowledge:response', handleResponse);
          resolve(response);
        }
      };

      this.on('knowledge:response', handleResponse);
      this.emit('knowledge:request', request);
    });
  }

  private trackQuerySuccess(_query: string, _domain?: string, _confidence?: number): void {
    // Track successful queries for analytics
    // Would be implemented with proper metrics collection
  }

  private getFallbackKnowledge(_query: string, domain?: string): any | null {
    // Try to find similar knowledge in learning history
    const relevantLearning = this.learningHistory.find(
      (learning) =>
        learning.domain === domain && learning.outcome.success && learning.confidence > 0.8
    );

    if (relevantLearning) {
      return {
        source: 'learning-history',
        insights: relevantLearning.insights,
        confidence: relevantLearning.confidence,
        fallback: true,
      };
    }

    return null;
  }

  private generateContributionDescription(
    learning: Omit<SwarmLearning, 'id' | 'timestamp'>
  ): string {
    return `${learning.type} learned in ${learning.domain}: ${learning.insights.whatWorked.join(', ')}`;
  }

  private extractImplementationDetails(learning: Omit<SwarmLearning, 'id' | 'timestamp'>): string {
    return JSON.stringify({
      bestPractices: learning.insights.bestPractices,
      optimizations: learning.insights.optimizations,
    });
  }

  private extractMetrics(
    learning: Omit<SwarmLearning, 'id' | 'timestamp'>
  ): Record<string, number> {
    return {
      duration: learning.outcome.duration,
      quality: learning.outcome.quality,
      efficiency: learning.outcome.efficiency,
      confidence: learning.confidence,
    };
  }

  private async loadPersistedKnowledge(): Promise<void> {
    if (!this.memoryStore) return;

    try {
      const cached = await this.memoryStore.retrieve(
        `swarm-knowledge/${this.config.swarmId}/cache`
      );

      if (cached) {
        // Restore cache from persistent storage
        for (const [key, entry] of Object.entries(cached as Record<string, LocalKnowledgeEntry>)) {
          if (Date.now() <= entry.metadata.timestamp + entry.ttl) {
            this.localCache.set(key, entry);
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to load persisted knowledge cache:', error);
    }
  }

  private async loadLearningHistory(): Promise<void> {
    if (!this.memoryStore) return;

    try {
      const history = await this.memoryStore.retrieve(
        `swarm-knowledge/${this.config.swarmId}/learning-history`
      );

      if (history && Array.isArray(history)) {
        this.learningHistory = history;
      }
    } catch (error) {
      logger.warn('Failed to load learning history:', error);
    }
  }

  private async persistCurrentState(): Promise<void> {
    if (!this.memoryStore) return;

    try {
      // Persist cache
      const cacheData = Object.fromEntries(this.localCache);
      await this.memoryStore.store(
        `swarm-knowledge/${this.config.swarmId}/cache`,
        'knowledge-cache',
        cacheData
      );

      // Persist learning history
      await this.persistLearningHistory();

      // Persist subscriptions
      await this.persistSubscriptions();
    } catch (error) {
      logger.error('Failed to persist knowledge sync state:', error);
    }
  }

  private async persistLearningHistory(): Promise<void> {
    if (!this.memoryStore) return;

    try {
      await this.memoryStore.store(
        `swarm-knowledge/${this.config.swarmId}/learning-history`,
        'learning-history',
        this.learningHistory
      );
    } catch (error) {
      logger.error('Failed to persist learning history:', error);
    }
  }

  private async persistSubscriptions(): Promise<void> {
    if (!this.memoryStore) return;

    try {
      await this.memoryStore.store(
        `swarm-knowledge/${this.config.swarmId}/subscriptions`,
        'subscriptions',
        Array.from(this.subscriptions)
      );
    } catch (error) {
      logger.error('Failed to persist subscriptions:', error);
    }
  }

  private async autoSubscribeToDomains(): Promise<void> {
    // Auto-subscribe to domains based on swarm specialization
    // This would typically be determined by swarm configuration
    const defaultDomains = ['general', 'performance', 'security'];

    for (const domain of defaultDomains) {
      await this.subscribeToDomain(domain);
    }
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 300000); // Clean up every 5 minutes
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.localCache) {
      if (now > entry.metadata.timestamp + entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.localCache.delete(key);
    }

    if (expiredKeys.length > 0) {
      logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  private invalidateCacheForDomain(domain: string): void {
    const keysToInvalidate: string[] = [];

    for (const [key, _entry] of this.localCache) {
      if (key.includes(domain)) {
        keysToInvalidate.push(key);
      }
    }

    for (const key of keysToInvalidate) {
      this.localCache.delete(key);
    }

    if (keysToInvalidate.length > 0) {
      logger.debug(`Invalidated ${keysToInvalidate.length} cache entries for domain ${domain}`);
    }
  }

  private async handleFactUpdate(update: KnowledgeDistributionUpdate): Promise<void> {
    this.emit('fact:updated', { update });
  }

  private async handleNewPattern(update: KnowledgeDistributionUpdate): Promise<void> {
    this.emit('pattern:discovered', { update });
  }

  private async handleSecurityAlert(update: KnowledgeDistributionUpdate): Promise<void> {
    this.emit('security:alert', { update, priority: 'critical' });
  }

  private async handleBestPractice(update: KnowledgeDistributionUpdate): Promise<void> {
    this.emit('practice:updated', { update });
  }

  private calculateCacheHitRate(): number {
    // Would implement proper hit rate calculation in production
    return 0.85; // Mock value
  }

  private generateRequestId(): string {
    return `req_${this.config.swarmId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private generateEntryId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private generateLearningId(): string {
    return `learning_${this.config.swarmId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export default SwarmKnowledgeSync;
