/**
 * Knowledge Swarm System for Claude-Zen
 * Coordinates multiple knowledge gathering agents for external knowledge collection
 *
 * Architecture: Distributed swarm of knowledge gathering agents
 * - Each agent specializes in different knowledge domains
 * - Parallel processing with intelligent load balancing
 * - Cross-agent knowledge sharing and deduplication
 * - Independent storage system (separate from RAG/vector database)
 */

import { EventEmitter } from 'node:events';
import type { KnowledgeClient, KnowledgeClientConfig, KnowledgeResult } from './knowledge-client';
import { FACTIntegration } from './knowledge-client';

export interface KnowledgeSwarmConfig extends KnowledgeClientConfig {
  swarmSize: number;
  specializations: KnowledgeAgentSpecialization[];
  parallelQueries: number;
  loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'specialization' | 'intelligent';
  crossAgentSharing: boolean;
  persistentStorage?: boolean;
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
  metadata?: Record<string, any>;
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
export type SwarmAgent = SwarmKnowledgeAgent;
export type SwarmQuery = KnowledgeQuery;
export type SwarmResult = KnowledgeSwarmResult;

interface KnowledgeAgent {
  id: string;
  specialization: KnowledgeAgentSpecialization;
  knowledgeClient: KnowledgeClient;
  currentLoad: number;
  totalQueries: number;
  successRate: number;
  averageLatency: number;
  expertise: Map<string, number>; // domain -> confidence score
}

/**
 * FACT Swarm System - Orchestrates multiple FACT agents for comprehensive knowledge gathering
 */
export class KnowledgeSwarm extends EventEmitter {
  private config: KnowledgeSwarmConfig;
  private agents: Map<string, KnowledgeAgent> = new Map();
  private queryQueue: KnowledgeQuery[] = [];
  private isProcessing = false;
  private queryCounter = 0;
  private vectorDb?: any;

  // Pre-defined agent specializations
  private static readonly DEFAULT_SPECIALIZATIONS: KnowledgeAgentSpecialization[] = [
    {
      name: 'documentation-specialist',
      domains: ['react', 'typescript', 'node', 'javascript', 'web-apis'],
      tools: ['web_scraper', 'documentation_parser', 'api_reference_extractor'],
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
      tools: ['api_documentation_scraper', 'openapi_parser', 'postman_importer'],
      priority: 8,
      expertise: ['api-design', 'integration-patterns', 'authentication'],
    },
    {
      name: 'performance-optimization-specialist',
      domains: ['performance', 'optimization', 'benchmarking', 'monitoring'],
      tools: ['performance_analyzer', 'benchmark_scraper', 'optimization_guide'],
      priority: 7,
      expertise: ['performance-tuning', 'scalability', 'monitoring'],
    },
    {
      name: 'security-compliance-expert',
      domains: ['security', 'compliance', 'authentication', 'encryption'],
      tools: ['security_scanner', 'compliance_checker', 'vulnerability_db'],
      priority: 9,
      expertise: ['security-patterns', 'compliance', 'vulnerability-analysis'],
    },
  ];

  constructor(config: KnowledgeSwarmConfig, vectorDb?: any) {
    super();

    this.config = {
      swarmSize: 6,
      specializations: KnowledgeSwarm.DEFAULT_SPECIALIZATIONS,
      parallelQueries: 3,
      loadBalancingStrategy: 'intelligent',
      crossAgentSharing: true,
      ...config,
    };

    this.vectorDb = vectorDb;
  }

  /**
   * Initialize the FACT swarm system
   */
  async initialize(): Promise<void> {
    try {
      // Initialize vector database for knowledge storage
      if (this.config.persistentStorage) {
        await this.vectorDb.initialize();
        await this.setupKnowledgeStorage();
      }

      // Create specialized agents
      await this.createSwarmAgents();

      // Start processing queue
      this.startQueryProcessor();
      this.emit('swarmInitialized', { agentCount: this.agents.size });
    } catch (error) {
      console.error('❌ FACT Swarm initialization failed:', error);
      throw error;
    }
  }

  /**
   * Query the swarm with intelligent agent selection and parallel processing
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
        agentsUsed: selectedAgents.map((a) => a.id),
        totalExecutionTime: totalTime,
        knowledgeConfidence: this.calculateConfidence(results),
        sourcesDiversity: this.calculateDiversity(results),
      };

      this.emit('swarmQueryCompleted', swarmResult);

      return swarmResult;
    } catch (error) {
      console.error(`❌ Swarm Query failed [${query.id}]:`, error);
      throw error;
    }
  }

  /**
   * High-level knowledge gathering functions
   */

  /**
   * Get comprehensive documentation for a technology
   */
  async getTechnologyDocs(technology: string, version?: string): Promise<SwarmResult> {
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
   * Research solutions for a specific problem
   */
  async researchProblem(problem: string, context?: string[]): Promise<SwarmResult> {
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
   * Get API integration guide
   */
  async getAPIIntegration(api: string, language?: string): Promise<SwarmResult> {
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
   * Research performance optimization strategies
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
   * Get security best practices and vulnerability information
   */
  async getSecurityGuidance(technology: string, context?: string): Promise<SwarmResult> {
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
   * Create specialized swarm agents
   */
  private async createSwarmAgents(): Promise<void> {
    const agentPromises = this.config.specializations
      .slice(0, this.config.swarmSize)
      .map(async (spec, index) => {
        const agentId = `fact-agent-${index}-${spec.name}`;

        // Create FACT instance for this agent
        const factConfig: FACTConfig = {
          ...this.config,
          cacheConfig: {
            ...this.config.cacheConfig,
            prefix: `${this.config.cacheConfig?.prefix || 'fact'}-${spec.name}`,
          },
        };

        const factInstance = new FACTIntegration(factConfig);
        await factInstance.initialize();

        // Create agent
        const agent: SwarmAgent = {
          id: agentId,
          specialization: spec,
          factInstance,
          currentLoad: 0,
          totalQueries: 0,
          successRate: 1.0,
          averageLatency: 0,
          expertise: new Map(spec.expertise.map((e) => [e, 0.8])), // Initial confidence
        };

        this.agents.set(agentId, agent);
      });

    await Promise.all(agentPromises);
  }

  /**
   * Select optimal agents for a query using intelligent routing
   */
  private async selectOptimalAgents(query: SwarmQuery): Promise<SwarmAgent[]> {
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
   * Intelligent agent selection based on specialization, load, and performance
   */
  private selectIntelligent(candidates: SwarmAgent[], query: SwarmQuery): SwarmAgent[] {
    const scores = candidates.map((agent) => {
      let score = 0;

      // Specialization match
      const domainMatch =
        query.domains?.some((domain) =>
          agent.specialization.domains.some(
            (agentDomain) => domain.includes(agentDomain) || agentDomain.includes(domain)
          )
        ) || false;

      if (domainMatch) score += 50;

      // Priority weight
      score += agent.specialization.priority * 5;

      // Performance factors
      score += agent.successRate * 20;
      score -= agent.currentLoad * 10;
      score -= (agent.averageLatency / 1000) * 5; // Penalty for slow agents

      // Expertise match
      if (query.metadata?.type) {
        const expertiseMatch = agent.expertise.has(query.metadata.type);
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
   * Select agents by specialization
   */
  private selectBySpecialization(candidates: SwarmAgent[], query: SwarmQuery): SwarmAgent[] {
    if (!query.domains) {
      return [candidates[0]]; // Fallback to first agent
    }

    const specialized = candidates.filter((agent) =>
      query.domains?.some((domain) => agent.specialization.domains.includes(domain))
    );

    return specialized.length > 0
      ? specialized.slice(0, this.config.parallelQueries)
      : [candidates[0]];
  }

  /**
   * Select least loaded agents
   */
  private selectLeastLoaded(candidates: SwarmAgent[], query: SwarmQuery): SwarmAgent[] {
    const sorted = [...candidates].sort((a, b) => a.currentLoad - b.currentLoad);
    return sorted.slice(0, query.parallel ? this.config.parallelQueries : 1);
  }

  /**
   * Round-robin agent selection
   */
  private selectRoundRobin(candidates: SwarmAgent[], _query: SwarmQuery): SwarmAgent[] {
    const index = this.queryCounter % candidates.length;
    return [candidates[index]];
  }

  /**
   * Execute query across multiple agents in parallel
   */
  private async executeParallelQuery(
    query: SwarmQuery,
    agents: SwarmAgent[]
  ): Promise<FACTResult[]> {
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
          (agent.averageLatency * (agent.totalQueries - 1) + executionTime) / agent.totalQueries;

        return result;
      } catch (error) {
        // Update failure rate
        agent.successRate = (agent.successRate * agent.totalQueries) / (agent.totalQueries + 1);
        throw error;
      } finally {
        agent.currentLoad--;
      }
    });

    const results = await Promise.allSettled(promises);
    return results
      .filter(
        (result): result is PromiseFulfilledResult<FACTResult> => result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }

  /**
   * Consolidate results from multiple agents
   */
  private async consolidateResults(results: FACTResult[]): Promise<string> {
    if (results.length === 0) {
      return 'No results found from swarm agents.';
    }

    if (results.length === 1) {
      return results[0].response;
    }

    // Group results by similarity and merge
    const uniqueResults = this.deduplicateResults(results);

    // Create consolidated response
    let consolidatedResponse = '# Consolidated Knowledge Swarm Results\\n\\n';

    uniqueResults.forEach((result, index) => {
      consolidatedResponse += `## Source ${index + 1} (${result.metadata?.agentId || 'Unknown Agent'})\n`;
      consolidatedResponse += `**Tools Used:** ${result.toolsUsed.join(', ')}\n`;
      consolidatedResponse += `**Execution Time:** ${result.executionTimeMs}ms\n`;
      consolidatedResponse += `**Cache Hit:** ${result.cacheHit ? 'Yes' : 'No'}\n\n`;
      consolidatedResponse += `${result.response}\n\n`;
      consolidatedResponse += '---\n\n';
    });

    return consolidatedResponse;
  }

  /**
   * Deduplicate similar results
   */
  private deduplicateResults(results: FACTResult[]): FACTResult[] {
    // Simple deduplication based on response similarity
    const unique: FACTResult[] = [];

    for (const result of results) {
      const isDuplicate = unique.some((existing) => {
        const similarity = this.calculateSimilarity(existing.response, result.response);
        return similarity > 0.8; // 80% similarity threshold
      });

      if (!isDuplicate) {
        unique.push(result);
      }
    }

    return unique;
  }

  /**
   * Calculate text similarity (simple implementation)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\W+/));
    const words2 = new Set(text2.toLowerCase().split(/\W+/));

    const intersection = new Set([...words1].filter((word) => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Store knowledge in vector database
   */
  private async storeKnowledge(query: SwarmQuery, results: FACTResult[]): Promise<void> {
    try {
      const documents = results.map((result, index) => ({
        id: `${query.id}-result-${index}`,
        vector: new Array(1536).fill(0).map(() => Math.random()), // Placeholder embedding
        metadata: {
          queryId: query.id,
          query: query.query,
          agentId: result.metadata?.agentId || 'unknown',
          specialization: result.metadata?.specialization || 'general',
          domains: query.domains?.join(',') || '',
          timestamp: new Date().toISOString(),
          executionTime: result.executionTimeMs.toString(),
          cacheHit: result.cacheHit.toString(),
        },
        timestamp: Date.now(),
      }));

      await this.vectorDb.insertVectors('fact_knowledge', documents);
    } catch (error) {
      console.error('Failed to store knowledge:', error);
    }
  }

  /**
   * Share knowledge across agents
   */
  private async shareKnowledge(_agents: SwarmAgent[], results: FACTResult[]): Promise<void> {
    // Update agent expertise based on successful results
    results.forEach((result) => {
      const agentId = result.metadata?.agentId;
      if (agentId) {
        const agent = this.agents.get(agentId);
        if (agent && result.executionTimeMs < 5000) {
          // Good performance
          // Boost expertise in relevant domains
          if (result.metadata?.type) {
            const currentConfidence = agent.expertise.get(result.metadata.type) || 0.5;
            agent.expertise.set(result.metadata.type, Math.min(1.0, currentConfidence + 0.1));
          }
        }
      }
    });
  }

  /**
   * Calculate confidence score for results
   */
  private calculateConfidence(results: FACTResult[]): number {
    if (results.length === 0) return 0;

    let totalConfidence = 0;

    results.forEach((result) => {
      let confidence = 0.5; // Base confidence

      // Cache hit bonus (cached results are more reliable)
      if (result.cacheHit) confidence += 0.2;

      // Fast execution bonus
      if (result.executionTimeMs < 1000) confidence += 0.1;

      // Multiple tools used bonus
      if (result.toolsUsed.length > 1) confidence += 0.1;

      // Agent specialization bonus
      const agent = Array.from(this.agents.values()).find((a) => a.id === result.metadata?.agentId);
      if (agent && agent.successRate > 0.8) confidence += 0.1;

      totalConfidence += Math.min(1.0, confidence);
    });

    return totalConfidence / results.length;
  }

  /**
   * Calculate diversity score for sources
   */
  private calculateDiversity(results: FACTResult[]): number {
    if (results.length <= 1) return 0;

    const agents = new Set(results.map((r) => r.metadata?.agentId));
    const tools = new Set(results.flatMap((r) => r.toolsUsed));

    // Diversity based on agent variety and tool variety
    const agentDiversity = agents.size / this.agents.size;
    const toolDiversity = Math.min(1.0, tools.size / 10); // Assume max 10 different tools

    return (agentDiversity + toolDiversity) / 2;
  }

  /**
   * Setup knowledge storage tables in vector database
   */
  private async setupKnowledgeStorage(): Promise<void> {
    try {
      const schema = {
        id: 'string',
        vector: `array<float>(1536)`,
        metadata: 'map<string, string>',
        timestamp: 'int64',
      };

      await this.vectorDb.createTable('fact_knowledge', schema);
    } catch (error) {
      console.error('Failed to setup knowledge storage:', error);
    }
  }

  /**
   * Start the query processing system
   */
  private startQueryProcessor(): void {}

  /**
   * Get swarm performance metrics
   */
  async getSwarmMetrics(): Promise<any> {
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
   * Shutdown the swarm system
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
}

/**
 * Global FACT swarm instance
 */
let globalFACTSwarm: FACTSwarmSystem | null = null;

/**
 * Initialize global FACT swarm system
 */
export async function initializeFACTSwarm(
  config: FACTSwarmConfig,
  vectorDb: LanceDBInterface
): Promise<FACTSwarmSystem> {
  if (globalFACTSwarm) {
    return globalFACTSwarm;
  }

  globalFACTSwarm = new FACTSwarmSystem(config, vectorDb);
  await globalFACTSwarm.initialize();

  return globalFACTSwarm;
}

/**
 * Get the global FACT swarm instance
 */
export function getFACTSwarm(): FACTSwarmSystem | null {
  return globalFACTSwarm;
}

/**
 * Quick swarm helper functions
 */
export const FACTSwarmHelpers = {
  /**
   * Research a development problem using the swarm
   */
  async researchProblem(problem: string, context?: string[]): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.researchProblem(problem, context);
    return result.consolidatedResponse;
  },

  /**
   * Get comprehensive technology documentation
   */
  async getTechDocs(technology: string, version?: string): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getTechnologyDocs(technology, version);
    return result.consolidatedResponse;
  },

  /**
   * Get API integration guidance
   */
  async getAPIGuidance(api: string, language?: string): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getAPIIntegration(api, language);
    return result.consolidatedResponse;
  },

  /**
   * Get performance optimization strategies
   */
  async getPerformanceGuidance(context: string): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getPerformanceOptimization(context);
    return result.consolidatedResponse;
  },

  /**
   * Get security guidance and best practices
   */
  async getSecurityGuidance(technology: string, context?: string): Promise<string> {
    const swarm = getFACTSwarm();
    if (!swarm) throw new Error('FACT Swarm not initialized');

    const result = await swarm.getSecurityGuidance(technology, context);
    return result.consolidatedResponse;
  },
};

export default KnowledgeSwarm;
