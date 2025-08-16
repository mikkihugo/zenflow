/**
 * @file Knowledge-swarm implementation.
 */

import { getLogger } from '../config/logging-config';

const logger = getLogger('KnowledgeSwarm');

/**
 * Knowledge Swarm System for Claude-Zen.
 * Coordinates multiple knowledge gathering agents for external knowledge collection.
 *
 * Architecture: Distributed swarm of knowledge gathering agents
 * - Each agent specializes in different knowledge domains
 * - Parallel processing with intelligent load balancing
 * - Cross-agent knowledge sharing and deduplication.
 * - Independent storage system (separate from RAG/vector database).
 */

import { EventEmitter } from 'node:events';
import { createDao, DatabaseTypes, EntityTypes } from '../database/index';
import type { Repository } from '../database/interfaces';
// Import UACL for unified client management
import { ClientType, uacl } from '../interfaces/clients/index';
import type { ClientInstance } from '../interfaces/clients/registry';
import type {
  FACTResult,
  KnowledgeClientConfig,
  KnowledgeResult,
} from './knowledge-client';
import { FACTIntegration } from './knowledge-client';

export interface KnowledgeSwarmConfig extends KnowledgeClientConfig {
  swarmSize: number;
  specializations: KnowledgeAgentSpecialization[];
  parallelQueries: number;
  loadBalancingStrategy:
    | 'round-robin'
    | 'least-loaded'
    | 'specialization'
    | 'intelligent';
  crossAgentSharing: boolean;
  persistentStorage?: boolean;
  // Additional FACT-specific config properties
  factRepoPath: string;
  anthropicApiKey: string;
  pythonPath?: string;
  enableCache?: boolean;
  cacheConfig?: {
    prefix: string;
    minTokens: number;
    maxSize: string;
    ttlSeconds: number;
  };
}

export interface KnowledgeAgentSpecialization {
  name: string;
  domains: string[];
  tools: string[];
  priority: number;
  expertise: string[];
}

export interface KnowledgeQuery {
  id: string;
  query: string;
  domains?: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  parallel?: boolean;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeSwarmResult {
  queryId: string;
  results: KnowledgeResult[];
  consolidatedResponse: string;
  agentsUsed: string[];
  totalExecutionTime: number;
  knowledgeConfidence: number;
  sourcesDiversity: number;
}

// Aliases for index.ts compatibility
export type SwarmAgent = KnowledgeAgent;
export type SwarmQuery = KnowledgeQuery;
export type SwarmResult = KnowledgeSwarmResult;

interface KnowledgeAgent {
  id: string;
  specialization: KnowledgeAgentSpecialization;
  factInstance: FACTIntegration;
  clientInstance?: ClientInstance; // UACL client instance
  currentLoad: number;
  totalQueries: number;
  successRate: number;
  averageLatency: number;
  expertise: Map<string, number>; // domain -> confidence score
}

/**
 * FACT Swarm System - Orchestrates multiple FACT agents for comprehensive knowledge gathering.
 *
 * @example
 */
export class KnowledgeSwarm extends EventEmitter {
  private config: KnowledgeSwarmConfig;
  private agents: Map<string, KnowledgeAgent> = new Map();
  private queryQueue: KnowledgeQuery[] = [];
  private isProcessing = false;
  private queryCounter = 0;
  private vectorRepository?: Repository<any>;
  private vectorDAO?: unknown; // TODO: Add proper type

  // Pre-defined agent specializations
  private static readonly DEFAULT_SPECIALIZATIONS: KnowledgeAgentSpecialization[] =
    [
      {
        name: 'documentation-specialist',
        domains: ['react', 'typescript', 'node', 'javascript', 'web-apis'],
        tools: [
          'web_scraper',
          'documentation_parser',
          'api_reference_extractor',
        ],
        priority: 9,
        expertise: ['official-docs', 'api-references', 'migration-guides'],
      },
      {
        name: 'community-knowledge-expert',
        domains: ['stackoverflow', 'github', 'dev-community', 'tutorials'],
        tools: ['stackoverflow_search', 'github_search', 'community_scraper'],
        priority: 8,
        expertise: ['problem-solving', 'code-examples', 'best-practices'],
      },
      {
        name: 'framework-specialist',
        domains: ['react', 'next', 'express', 'fastify', 'vue', 'angular'],
        tools: ['framework_docs', 'changelog_scraper', 'feature_tracker'],
        priority: 9,
        expertise: ['frameworks', 'libraries', 'ecosystem', 'versions'],
      },
      {
        name: 'api-integration-expert',
        domains: ['rest-apis', 'graphql', 'webhooks', 'authentication'],
        tools: [
          'api_documentation_scraper',
          'openapi_parser',
          'postman_importer',
        ],
        priority: 8,
        expertise: ['api-design', 'integration-patterns', 'authentication'],
      },
      {
        name: 'performance-optimization-specialist',
        domains: ['performance', 'optimization', 'benchmarking', 'monitoring'],
        tools: [
          'performance_analyzer',
          'benchmark_scraper',
          'optimization_guide',
        ],
        priority: 7,
        expertise: ['performance-tuning', 'scalability', 'monitoring'],
      },
      {
        name: 'security-compliance-expert',
        domains: ['security', 'compliance', 'authentication', 'encryption'],
        tools: ['security_scanner', 'compliance_checker', 'vulnerability_db'],
        priority: 9,
        expertise: [
          'security-patterns',
          'compliance',
          'vulnerability-analysis',
        ],
      },
    ];

  constructor(config: KnowledgeSwarmConfig) {
    super();

    this.config = {
      ...config,
      swarmSize: config.swarmSize || 6,
      specializations:
        config.specializations || KnowledgeSwarm.DEFAULT_SPECIALIZATIONS,
      parallelQueries: config.parallelQueries || 3,
      loadBalancingStrategy: config.loadBalancingStrategy || 'intelligent',
      crossAgentSharing:
        config.crossAgentSharing !== undefined
          ? config.crossAgentSharing
          : true,
    };
  }

  /**
   * Initialize the FACT swarm system.
   */
  async initialize(): Promise<void> {
    try {
      // Initialize UACL if not already initialized
      if (!uacl.isInitialized()) {
        await uacl.initialize({
          healthCheckInterval: 30000,
          enableLogging: true,
        });
      }

      // Initialize vector database for knowledge storage
      if (this.config.persistentStorage) {
        // TODO: Re-enable when createRepository is available
        // this.vectorRepository = await createRepository(
        //   EntityTypes.VectorDocument,
        //   DatabaseTypes?.LanceDB,
        //   {
        //     database: './data/knowledge-swarm',
        //     options: { vectorSize: 1536, metricType: 'cosine' },
        //   }
        // );

        this.vectorDAO = await createDao(EntityTypes.Vector, 'lancedb' as any, {
          database: './data/knowledge-swarm',
          options: { vectorSize: 1536 },
        });

        await this.setupKnowledgeStorage();
      }

      // Create specialized agents
      await this.createSwarmAgents();

      // Start processing queue
      this.startQueryProcessor();
      this.emit('swarmInitialized', { agentCount: this.agents.size });
    } catch (error) {
      logger.error('❌ FACT Swarm initialization failed:', error);
      throw error;
    }
  }

  /**
   * Query the swarm with intelligent agent selection and parallel processing.
   *
   * @param query
   */
  async querySwarm(query: SwarmQuery): Promise<SwarmResult> {
    const startTime = Date.now();

    try {
      // Select optimal agents for this query
      const selectedAgents = await this.selectOptimalAgents(query);

      // Execute query across selected agents
      const results = await this.executeParallelQuery(query, selectedAgents);

      // Consolidate and deduplicate results
      const consolidatedResponse = await this.consolidateResults(results);

      // Store knowledge for future queries
      if (this.config.persistentStorage) {
        await this.storeKnowledge(query, results);
      }

      // Share knowledge across agents
      if (this.config.crossAgentSharing) {
        await this.shareKnowledge(selectedAgents, results);
      }

      const totalTime = Date.now() - startTime;

      const swarmResult: SwarmResult = {
        queryId: query.id,
        results,
        consolidatedResponse,
        agentsUsed: selectedAgents?.map((a) => a.id),
        totalExecutionTime: totalTime,
        knowledgeConfidence: this.calculateConfidence(results),
        sourcesDiversity: this.calculateDiversity(results),
      };

      this.emit('swarmQueryCompleted', swarmResult);

      return swarmResult;
    } catch (error) {
      logger.error(`❌ Swarm Query failed [${query.id}]:`, error);
      throw error;
    }
  }

  /**
   * High-level knowledge gathering functions.
   */

  /**
   * Get comprehensive documentation for a technology.
   *
   * @param technology
   * @param version
   */
  async getTechnologyDocs(
    technology: string,
    version?: string
  ): Promise<SwarmResult> {
    const query: SwarmQuery = {
      id: `tech-docs-${++this.queryCounter}`,
      query: `Get comprehensive documentation for ${technology} ${version ? `version ${version}` : '(latest)'}. Include API reference, guides, examples, and migration notes.`,
      domains: [technology.toLowerCase(), 'documentation', 'api-reference'],
      urgency: 'medium',
      parallel: true,
      metadata: { technology, version, type: 'documentation' },
    };

    return this.querySwarm(query);
  }

  /**
   * Research solutions for a specific problem.
   *
   * @param problem
   * @param context
   */
  async researchProblem(
    problem: string,
    context?: string[]
  ): Promise<SwarmResult> {
    const query: SwarmQuery = {
      id: `problem-research-${++this.queryCounter}`,
      query: `Research solutions for: ${problem}${context ? `. Context: ${context.join(', ')}` : ''}. Include multiple approaches, code examples, and best practices.`,
      domains: ['stackoverflow', 'github', 'community', 'documentation'],
      urgency: 'high',
      parallel: true,
      metadata: { problem, context, type: 'problem_solving' },
    };

    return this.querySwarm(query);
  }

  /**
   * Get API integration guide.
   *
   * @param api
   * @param language
   */
  async getAPIIntegration(
    api: string,
    language?: string
  ): Promise<SwarmResult> {
    const query: SwarmQuery = {
      id: `api-integration-${++this.queryCounter}`,
      query: `Get comprehensive API integration guide for ${api}${language ? ` using ${language}` : ''}. Include authentication, endpoints, examples, and error handling.`,
      domains: ['api-integration', 'documentation', 'examples'],
      urgency: 'medium',
      parallel: true,
      metadata: { api, language, type: 'api_integration' },
    };

    return this.querySwarm(query);
  }

  /**
   * Research performance optimization strategies.
   *
   * @param context
   */
  async getPerformanceOptimization(context: string): Promise<SwarmResult> {
    const query: SwarmQuery = {
      id: `perf-optimization-${++this.queryCounter}`,
      query: `Research performance optimization strategies for: ${context}. Include benchmarking, profiling, and specific optimization techniques.`,
      domains: ['performance', 'optimization', 'benchmarking'],
      urgency: 'medium',
      parallel: true,
      metadata: { context, type: 'performance_optimization' },
    };

    return this.querySwarm(query);
  }

  /**
   * Get security best practices and vulnerability information.
   *
   * @param technology
   * @param context
   */
  async getSecurityGuidance(
    technology: string,
    context?: string
  ): Promise<SwarmResult> {
    const query: SwarmQuery = {
      id: `security-guidance-${++this.queryCounter}`,
      query: `Get security best practices and vulnerability guidance for ${technology}${context ? ` in context of ${context}` : ''}. Include common vulnerabilities, mitigation strategies, and compliance requirements.`,
      domains: ['security', 'compliance', 'vulnerabilities'],
      urgency: 'high',
      parallel: true,
      metadata: { technology, context, type: 'security_guidance' },
    };

    return this.querySwarm(query);
  }

  /**
   * Create specialized swarm agents.
   */
  private async createSwarmAgents(): Promise<void> {
    const agentPromises = this.config.specializations
      .slice(0, this.config.swarmSize)
      .map(async (spec, index) => {
        const agentId = `fact-agent-${index}-${spec.name}`;

        try {
          // Create UACL knowledge client instance for this agent
          const clientInstance = await uacl.createKnowledgeClient(
            agentId,
            this.config.factRepoPath,
            this.config.anthropicApiKey,
            {
              enabled: true,
              priority: spec.priority,
              pythonPath: this.config.pythonPath,
              enableCache: this.config.enableCache,
              cacheConfig: {
                prefix: `${this.config.cacheConfig?.prefix || 'fact'}-${spec.name}`,
                minTokens: this.config.cacheConfig?.minTokens || 100,
                maxSize: this.config.cacheConfig?.maxSize || '1MB',
                ttlSeconds: this.config.cacheConfig?.ttlSeconds || 3600,
              },
            }
          );

          // Get the underlying FACT instance from the client
          const factInstance = clientInstance.client as FACTIntegration;

          // Create agent
          const agent: KnowledgeAgent = {
            id: agentId,
            specialization: spec,
            factInstance,
            clientInstance, // Store the UACL client instance
            currentLoad: 0,
            totalQueries: 0,
            successRate: 1.0,
            averageLatency: 0,
            expertise: new Map(spec.expertise.map((e) => [e, 0.8])), // Initial confidence
          };

          this.agents.set(agentId, agent);
        } catch (error) {
          logger.error(
            `❌ Failed to create UACL-managed agent ${agentId}:`,
            error
          );

          // Fallback to direct FACT integration
          try {
            const factInstance = new FACTIntegration({
              factRepoPath: this.config.factRepoPath,
              anthropicApiKey: this.config.anthropicApiKey,
              pythonPath: this.config.pythonPath,
              enableCache: this.config.enableCache,
              cacheConfig: {
                prefix: `${this.config.cacheConfig?.prefix || 'fact'}-${spec.name}`,
                minTokens: this.config.cacheConfig?.minTokens || 100,
                maxSize: this.config.cacheConfig?.maxSize || '1MB',
                ttlSeconds: this.config.cacheConfig?.ttlSeconds || 3600,
              },
            });

            const agent: KnowledgeAgent = {
              id: agentId,
              specialization: spec,
              factInstance,
              clientInstance: undefined as ClientInstance | undefined,
              currentLoad: 0,
              totalQueries: 0,
              successRate: 1.0,
              averageLatency: 0,
              expertise: new Map(spec.expertise.map((e) => [e, 0.8])),
            };

            this.agents.set(agentId, agent);
          } catch (fallbackError) {
            logger.error(
              `❌ Both UACL and direct FACT creation failed for ${agentId}:`,
              fallbackError
            );
            throw fallbackError;
          }
        }
      });

    await Promise.all(agentPromises);
  }

  /**
   * Select optimal agents for a query using intelligent routing.
   *
   * @param query
   */
  private async selectOptimalAgents(
    query: SwarmQuery
  ): Promise<KnowledgeAgent[]> {
    const candidates = Array.from(this.agents.values());

    switch (this.config.loadBalancingStrategy) {
      case 'specialization':
        return this.selectBySpecialization(candidates, query);
      case 'least-loaded':
        return this.selectLeastLoaded(candidates, query);
      case 'round-robin':
        return this.selectRoundRobin(candidates, query);
      default:
        return this.selectIntelligent(candidates, query);
    }
  }

  /**
   * Intelligent agent selection based on specialization, load, and performance.
   *
   * @param candidates
   * @param query
   */
  private selectIntelligent(
    candidates: KnowledgeAgent[],
    query: SwarmQuery
  ): KnowledgeAgent[] {
    const scores = candidates.map((agent) => {
      let score = 0;

      // Specialization match
      const domainMatch = query.domains?.some((domain) =>
        agent.specialization.domains.some(
          (agentDomain) =>
            domain.includes(agentDomain) || agentDomain.includes(domain)
        )
      );

      if (domainMatch) score += 50;

      // Priority weight
      score += agent.specialization.priority * 5;

      // Performance factors
      score += agent.successRate * 20;
      score -= agent.currentLoad * 10;
      score -= (agent.averageLatency / 1000) * 5; // Penalty for slow agents

      // Expertise match
      if (query.metadata?.['type']) {
        const expertiseMatch = agent.expertise.has(query.metadata['type']);
        if (expertiseMatch) score += 30;
      }

      return { agent, score };
    });

    // Sort by score and select top agents
    scores.sort((a, b) => b.score - a.score);

    const selectedCount = Math.min(
      query.parallel ? this.config.parallelQueries : 1,
      Math.max(1, Math.ceil(candidates.length / 2))
    );

    return scores.slice(0, selectedCount).map((s) => s.agent);
  }

  /**
   * Select agents by specialization.
   *
   * @param candidates
   * @param query
   */
  private selectBySpecialization(
    candidates: KnowledgeAgent[],
    query: SwarmQuery
  ): KnowledgeAgent[] {
    if (!query.domains || query.domains.length === 0) {
      const firstAgent = candidates[0];
      return firstAgent ? [firstAgent] : [];
    }

    const specialized = candidates.filter((agent) =>
      query.domains!.some((domain) =>
        agent.specialization.domains.includes(domain)
      )
    );

    const fallbackAgent = candidates[0];
    return specialized.length > 0
      ? specialized.slice(0, this.config.parallelQueries)
      : fallbackAgent
        ? [fallbackAgent]
        : [];
  }

  /**
   * Select least loaded agents.
   *
   * @param candidates
   * @param query
   */
  private selectLeastLoaded(
    candidates: KnowledgeAgent[],
    query: SwarmQuery
  ): KnowledgeAgent[] {
    const sorted = [...candidates].sort(
      (a, b) => a.currentLoad - b.currentLoad
    );
    return sorted.slice(0, query.parallel ? this.config.parallelQueries : 1);
  }

  /**
   * Round-robin agent selection.
   *
   * @param candidates
   * @param _query
   */
  private selectRoundRobin(
    candidates: KnowledgeAgent[],
    _query: SwarmQuery
  ): KnowledgeAgent[] {
    const index = this.queryCounter % candidates.length;
    const selectedAgent = candidates[index];
    return selectedAgent ? [selectedAgent] : [];
  }

  /**
   * Execute query across multiple agents in parallel.
   *
   * @param query
   * @param agents
   */
  private async executeParallelQuery(
    query: SwarmQuery,
    agents: KnowledgeAgent[]
  ): Promise<KnowledgeResult[]> {
    const promises = agents.map(async (agent) => {
      agent.currentLoad++;
      const startTime = Date.now();

      try {
        const result = await agent.factInstance.query({
          query: query.query,
          tools: agent.specialization.tools,
          metadata: {
            ...query.metadata,
            agentId: agent.id,
            specialization: agent.specialization.name,
          },
        });

        // Update agent metrics
        const executionTime = Date.now() - startTime;
        agent.totalQueries++;
        agent.averageLatency =
          (agent.averageLatency * (agent.totalQueries - 1) + executionTime) /
          agent.totalQueries;

        return result;
      } catch (error) {
        // Update failure rate
        agent.successRate =
          (agent.successRate * agent.totalQueries) / (agent.totalQueries + 1);
        throw error;
      } finally {
        agent.currentLoad--;
      }
    });

    const results = await Promise.allSettled(promises);
    return results
      .filter(
        (result): result is PromiseFulfilledResult<KnowledgeResult> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }

  /**
   * Consolidate results from multiple agents.
   *
   * @param results
   */
  private async consolidateResults(
    results: KnowledgeResult[]
  ): Promise<string> {
    if (results.length === 0) {
      return 'No results found from swarm agents.';
    }

    if (results.length === 1) {
      return results[0]?.response || 'No response available';
    }

    // Group results by similarity and merge
    const uniqueResults = this.deduplicateResults(results);

    // Create consolidated response
    let consolidatedResponse = '# Consolidated Knowledge Swarm Results\\n\\n';

    uniqueResults?.forEach((result, index) => {
      consolidatedResponse += `## Source ${index + 1} (${(result?.metadata as any)?.['agentId'] || 'Unknown Agent'})\n`;
      consolidatedResponse += `**Tools Used:** ${result?.toolsUsed?.join(', ')}\n`;
      consolidatedResponse += `**Execution Time:** ${result?.executionTimeMs}ms\n`;
      consolidatedResponse += `**Cache Hit:** ${result?.cacheHit ? 'Yes' : 'No'}\n\n`;
      consolidatedResponse += `${result?.response}\n\n`;
      consolidatedResponse += '---\n\n';
    });

    return consolidatedResponse;
  }

  /**
   * Deduplicate similar results.
   *
   * @param results
   */
  private deduplicateResults(results: KnowledgeResult[]): KnowledgeResult[] {
    // Simple deduplication based on response similarity
    const unique: KnowledgeResult[] = [];

    for (const result of results) {
      const isDuplicate = unique.some((existing) => {
        const similarity = this.calculateSimilarity(
          existing.response,
          result?.response
        );
        return similarity > 0.8; // 80% similarity threshold
      });

      if (!isDuplicate) {
        unique.push(result);
      }
    }

    return unique;
  }

  /**
   * Calculate text similarity (simple implementation).
   *
   * @param text1
   * @param text2
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\W+/));
    const words2 = new Set(text2.toLowerCase().split(/\W+/));

    const intersection = new Set(
      [...words1].filter((word) => words2.has(word))
    );
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Store knowledge in vector database.
   *
   * @param query
   * @param results
   */
  private async storeKnowledge(
    query: SwarmQuery,
    results: KnowledgeResult[]
  ): Promise<void> {
    try {
      const documents = results.map((result, index) => ({
        id: `${query.id}-result-${index}`,
        vector: new Array(1536).fill(0).map(() => Math.random()), // Placeholder embedding
        metadata: {
          queryId: query.id,
          query: query.query,
          agentId: (result?.metadata as any)?.['agentId'] || 'unknown',
          specialization:
            (result?.metadata as any)?.['specialization'] || 'general',
          domains: query.domains?.join(',') || '',
          timestamp: new Date().toISOString(),
          executionTime: result?.executionTimeMs.toString(),
          cacheHit: result?.cacheHit.toString(),
        },
        timestamp: Date.now(),
      }));

      if (this.vectorRepository) {
        // Store documents using DAL vector repository
        for (const doc of documents) {
          await this.vectorRepository.create({
            id: doc.id,
            vector: doc.vector,
            metadata: doc.metadata,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to store knowledge:', error);
    }
  }

  /**
   * Share knowledge across agents.
   *
   * @param _agents
   * @param results
   */
  private async shareKnowledge(
    _agents: KnowledgeAgent[],
    results: KnowledgeResult[]
  ): Promise<void> {
    // Update agent expertise based on successful results
    results.forEach((result) => {
      const agentId = result?.metadata?.['agentId'];
      if (agentId) {
        const agent = this.agents.get(agentId);
        if (agent && result?.executionTimeMs < 5000) {
          // Good performance
          // Boost expertise in relevant domains
          if (result?.metadata?.['type']) {
            const currentConfidence =
              agent.expertise.get(result.metadata['type']) || 0.5;
            agent.expertise.set(
              result.metadata['type'],
              Math.min(1.0, currentConfidence + 0.1)
            );
          }
        }
      }
    });
  }

  /**
   * Calculate confidence score for results.
   *
   * @param results
   */
  private calculateConfidence(results: KnowledgeResult[]): number {
    if (results.length === 0) return 0;

    let totalConfidence = 0;

    results.forEach((result) => {
      let confidence = 0.5; // Base confidence

      // Cache hit bonus (cached results are more reliable)
      if (result?.cacheHit) confidence += 0.2;

      // Fast execution bonus
      if (result?.executionTimeMs < 1000) confidence += 0.1;

      // Multiple tools used bonus
      if (result?.toolsUsed.length > 1) confidence += 0.1;

      // Agent specialization bonus
      const agent = Array.from(this.agents.values()).find(
        (a) => a.id === result?.metadata?.['agentId']
      );
      if (agent && agent.successRate > 0.8) confidence += 0.1;

      totalConfidence += Math.min(1.0, confidence);
    });

    return totalConfidence / results.length;
  }

  /**
   * Calculate diversity score for sources.
   *
   * @param results
   */
  private calculateDiversity(results: KnowledgeResult[]): number {
    if (results.length <= 1) return 0;

    const agents = new Set(results.map((r) => r.metadata?.['agentId']));
    const tools = new Set(results.flatMap((r) => r.toolsUsed));

    // Diversity based on agent variety and tool variety
    const agentDiversity = agents.size / this.agents.size;
    const toolDiversity = Math.min(1.0, tools.size / 10); // Assume max 10 different tools

    return (agentDiversity + toolDiversity) / 2;
  }

  /**
   * Setup knowledge storage tables in vector database.
   */
  private async setupKnowledgeStorage(): Promise<void> {
    try {
    } catch (error) {
      logger.error('Failed to setup knowledge storage:', error);
    }
  }

  /**
   * Start the query processing system.
   */
  private startQueryProcessor(): void {}

  /**
   * Get swarm performance metrics.
   */
  async getSwarmMetrics(): Promise<unknown> {
    const agentMetrics = Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      specialization: agent.specialization.name,
      currentLoad: agent.currentLoad,
      totalQueries: agent.totalQueries,
      successRate: agent.successRate,
      averageLatency: agent.averageLatency,
      expertiseAreas: Object.fromEntries(agent.expertise),
    }));

    return {
      totalAgents: this.agents.size,
      agentMetrics,
      queueSize: this.queryQueue.length,
      isProcessing: this.isProcessing,
      totalQueries: this.queryCounter,
      configuration: {
        swarmSize: this.config.swarmSize,
        parallelQueries: this.config.parallelQueries,
        loadBalancingStrategy: this.config.loadBalancingStrategy,
      },
    };
  }

  /**
   * Shutdown the swarm system.
   */
  async shutdown(): Promise<void> {
    // Shutdown all agents
    const shutdownPromises = Array.from(this.agents.values()).map((agent) =>
      agent.factInstance.shutdown()
    );

    await Promise.all(shutdownPromises);

    this.agents.clear();
    this.queryQueue = [];
    this.isProcessing = false;

    this.emit('swarmShutdown');
  }

  /**
   * Get swarm health status.
   */
  getSwarmHealth(): {
    agentCount: number;
    healthyAgents: number;
    averageLoad: number;
    totalQueries: number;
    successRate: number;
    uaclStatus: unknown;
  } {
    const agents = Array.from(this.agents.values());
    const healthyAgents = agents.filter(
      (agent) => agent.clientInstance?.status === 'connected'
    ).length;
    const averageLoad =
      agents.length > 0
        ? agents.reduce((sum, a) => sum + a.currentLoad, 0) / agents.length
        : 0;
    const totalQueries = agents.reduce((sum, a) => sum + a.totalQueries, 0);
    const averageSuccessRate =
      agents.length > 0
        ? agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length
        : 1.0;

    // Get UACL client health for knowledge clients
    const knowledgeClients = uacl.getClientsByType(ClientType.KNOWLEDGE);
    const uaclStatus = {
      knowledgeClients: knowledgeClients.length,
      healthyKnowledgeClients: knowledgeClients.filter(
        (c) => c.status === 'connected'
      ).length,
      overallHealth: uacl.getHealthStatus(),
    };

    return {
      agentCount: agents.length,
      healthyAgents,
      averageLoad,
      totalQueries,
      successRate: averageSuccessRate,
      uaclStatus,
    };
  }

  /**
   * Get detailed agent metrics.
   */
  getAgentMetrics(): Array<{
    id: string;
    specialization: string;
    load: number;
    queries: number;
    successRate: number;
    latency: number;
    clientStatus: string;
    expertise: Record<string, number>;
  }> {
    return Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      specialization: agent.specialization.name,
      load: agent.currentLoad,
      queries: agent.totalQueries,
      successRate: agent.successRate,
      latency: agent.averageLatency,
      clientStatus: agent.clientInstance?.status || 'unknown',
      expertise: Object.fromEntries(agent.expertise),
    }));
  }
}

/**
 * Global FACT swarm instance.
 */
let globalFACTSwarm: KnowledgeSwarm | null = null;

/**
 * Initialize global FACT swarm system.
 *
 * @param config
 * @example
 */
export async function initializeFACTSwarm(
  config: KnowledgeSwarmConfig
): Promise<KnowledgeSwarm> {
  if (globalFACTSwarm) {
    return globalFACTSwarm;
  }

  globalFACTSwarm = new KnowledgeSwarm(config);
  await globalFACTSwarm.initialize();

  return globalFACTSwarm;
}

/**
 * Get the global FACT swarm instance.
 *
 * @example
 */
export function getFACTSwarm(): KnowledgeSwarm | null {
  return globalFACTSwarm;
}

/**
 * Quick swarm helper functions.
 */
export const FACTSwarmHelpers = {
  /**
   * Research a development problem using the swarm.
   *
   * @param problem
   * @param context
   */
  async researchProblem(problem: string, context?: string[]): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.researchProblem(problem, context);
    return result?.consolidatedResponse;
  },

  /**
   * Get comprehensive technology documentation.
   *
   * @param technology
   * @param version
   */
  async getTechDocs(technology: string, version?: string): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getTechnologyDocs(technology, version);
    return result?.consolidatedResponse;
  },

  /**
   * Get API integration guidance.
   *
   * @param api
   * @param language
   */
  async getAPIGuidance(api: string, language?: string): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getAPIIntegration(api, language);
    return result?.consolidatedResponse;
  },

  /**
   * Get performance optimization strategies.
   *
   * @param context
   */
  async getPerformanceGuidance(context: string): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getPerformanceOptimization(context);
    return result?.consolidatedResponse;
  },

  /**
   * Get security guidance and best practices.
   *
   * @param technology
   * @param context
   */
  async getSecurityGuidance(
    technology: string,
    context?: string
  ): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getSecurityGuidance(technology, context);
    return result?.consolidatedResponse;
  },
};

export default KnowledgeSwarm;
