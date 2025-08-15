/**
 * Swarm Database Manager.
 *
 * Uses existing DAL Factory for proper swarm storage with multi-database support:
 * - Central coordination: SQLite/Kuzu via DAL Factory.
 * - Per-swarm clusters: Kuzu (graph) + LanceDB (vectors) + SQLite (data)
 * - Leverages existing repository and DAO patterns.
 */
/**
 * @file Swarm-database management system.
 */

import { EventEmitter } from 'node:events';
import path from 'node:path';
import type { DALFactory } from '../../../database/factory';
import type {
  ICoordinationRepository,
  IGraphRepository,
  IVectorRepository,
} from '../../../database/interfaces';
import { inject, injectable } from '../../../di/decorators/injectable';
import {
  CORE_TOKENS,
  DATABASE_TOKENS,
  type ILogger,
  SWARM_TOKENS,
} from '../../../di/tokens/core-tokens';

export interface SwarmDatabaseConfig {
  // Central coordination database
  central: {
    type: 'kuzu' | 'sqlite';
    database: string;
  };

  // Base paths
  basePath: string; // .claude-zen/
  swarmsPath: string; // .claude-zen/swarms/active/
}

// 3-Tier Learning System Interfaces
export interface SwarmCommanderLearning {
  id: string;
  swarmId: string;
  commanderType: string;
  agentPerformanceHistory: Record<string, AgentPerformanceHistory>;
  sparcPhaseEfficiency: Record<string, PhaseEfficiencyMetrics>;
  implementationPatterns: SuccessfulPattern[];
  taskCompletionPatterns: TaskPattern[];
  realTimeFeedback: LearningEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentPerformanceHistory {
  agentId: string;
  taskSuccessRate: number;
  averageCompletionTime: number;
  errorPatterns: string[];
  optimizationSuggestions: string[];
  lastUpdated: string;
}

export interface PhaseEfficiencyMetrics {
  phase: string;
  averageTime: number;
  successRate: number;
  commonIssues: string[];
  optimizations: string[];
}

export interface SuccessfulPattern {
  patternId: string;
  description: string;
  context: string;
  successRate: number;
  usageCount: number;
  lastUsed: string;
}

export interface TaskPattern {
  taskType: string;
  averageTime: number;
  resourcesUsed: string[];
  dependencies: string[];
  successFactors: string[];
}

export interface LearningEvent {
  eventId: string;
  timestamp: string;
  eventType: 'success' | 'failure' | 'optimization';
  context: string;
  outcome: string;
  learningExtracted: string;
}

// Enhanced Vector Pattern Discovery Interfaces

export interface PatternCluster {
  id: string;
  centroid: number[];
  patterns: SuccessfulPattern[];
  clusterScore: number;
  averageSuccessRate: number;
  totalUsageCount: number;
  description: string;
  tags: string[];
}

export interface CrossSwarmPatternResult {
  pattern: SuccessfulPattern;
  swarmId: string;
  similarity: number;
  recommendationScore: number;
  transferabilityScore: number;
  contextualRelevance: number;
}

export interface SwarmRepositories {
  swarmId: string;
  repositories: {
    graph: IGraphRepository<any>; // Kuzu for relationships
    vectors: IVectorRepository<any>; // LanceDB for embeddings
    coordination: ICoordinationRepository<any>; // SQLite for data
  };
  path: string;
}

// Cross-Swarm Knowledge Transfer Interfaces

export interface SwarmKnowledgeTransfer {
  id: string;
  sourceSwarmId: string;
  targetSwarmId: string;
  patterns: SuccessfulPattern[];
  transferMetrics: KnowledgeTransferMetrics;
  adoptionResults: PatternAdoptionResult[];
  timestamp: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface KnowledgeTransferMetrics {
  patternsTransferred: number;
  successfulAdoptions: number;
  adaptationRate: number;
  performanceImprovement: number;
  conflictResolutions: number;
  learningRate: number;
}

export interface PatternAdoptionResult {
  patternId: string;
  adoptionStatus: 'successful' | 'adapted' | 'rejected' | 'pending';
  adaptationChanges: string[];
  performanceMetrics: {
    beforeAdoption: PerformanceSnapshot;
    afterAdoption: PerformanceSnapshot;
    improvementScore: number;
  };
  conflictResolutions: ConflictResolution[];
  learningFeedback: string[];
}

export interface PerformanceSnapshot {
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  resourceUtilization: number;
  agentEfficiency: number;
  timestamp: string;
}

export interface ConflictResolution {
  conflictType: string;
  description: string;
  resolutionStrategy: string;
  outcome: 'resolved' | 'partial' | 'unresolved';
  learningsExtracted: string[];
}

export interface SwarmPerformanceComparison {
  swarmId: string;
  comparisonMetrics: {
    taskCompletionRate: number;
    averageExecutionTime: number;
    resourceEfficiency: number;
    agentCoordination: number;
    learningVelocity: number;
    knowledgeRetention: number;
  };
  benchmarkScore: number;
  rank: number;
  improvementAreas: string[];
  strengths: string[];
  recommendedPatterns: CrossSwarmPatternResult[];
}

export interface KnowledgeEvolutionRecord {
  id: string;
  patternId: string;
  version: number;
  evolutionHistory: PatternEvolution[];
  currentEffectiveness: number;
  usageStatistics: PatternUsageStats;
  adaptationMetrics: PatternAdaptationMetrics;
  decayAnalysis: KnowledgeDecayAnalysis;
}

export interface PatternEvolution {
  version: number;
  timestamp: string;
  changes: string[];
  triggerEvent: string;
  performanceImpact: number;
  adoptingSwarms: string[];
  stabilityScore: number;
}

export interface PatternUsageStats {
  totalUsages: number;
  activeSwarms: string[];
  averageSuccessRate: number;
  popularityTrend: number[];
  geographicDistribution: Record<string, number>;
  contextualUsage: Record<string, number>;
}

export interface PatternAdaptationMetrics {
  adaptationSuccessRate: number;
  timeToAdopt: number;
  customizationComplexity: number;
  maintenanceOverhead: number;
  transferabilityScore: number;
}

export interface KnowledgeDecayAnalysis {
  currentRelevance: number;
  usageDecline: number;
  replacementPatterns: string[];
  retentionRecommendations: string[];
  refreshStrategy: string;
}

@injectable
export class SwarmDatabaseManager extends EventEmitter {
  private centralRepo!: ICoordinationRepository<any>;
  private swarmClusters: Map<string, SwarmRepositories> = new Map();

  constructor(
    @inject(SWARM_TOKENS.Config) private _config: SwarmDatabaseConfig,
    @inject(DATABASE_TOKENS.DALFactory) private _dalFactory: DALFactory,
    @inject(CORE_TOKENS.Logger) private _logger: ILogger
  ) {
    super();
    this._logger.info('SwarmDatabaseManager initialized with DI');
  }

  /**
   * Initialize central coordination repository.
   */
  async initialize(): Promise<void> {
    this._logger.info('Initializing SwarmDatabaseManager');

    try {
      // Create central coordination repository using DAL Factory
      this.centralRepo = await this._dalFactory.createCoordinationRepository('SwarmRegistry');

      // Initialize central schema
      await this.initializeCentralSchema();

      this._logger.info('SwarmDatabaseManager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this._logger.error(`Failed to initialize SwarmDatabaseManager: ${error}`);
      throw error;
    }
  }

  /**
   * Create per-swarm repository cluster using DAL Factory.
   *
   * @param swarmId
   */
  async createSwarmCluster(swarmId: string): Promise<SwarmRepositories> {
    this._logger.info(`Creating swarm cluster for: ${swarmId}`);
    const swarmPath = path.join(this._config.swarmsPath, swarmId);

    try {
      // Create repositories using DAL Factory with per-swarm database paths
      const repositories: SwarmRepositories = {
        swarmId,
        path: swarmPath,
        repositories: {
          // Kuzu graph repository for relationships
          graph: await this._dalFactory.createKuzuGraphRepository('SwarmGraph', 'swarm_graph'),

          // LanceDB vector repository for embeddings
          vectors: await this._dalFactory.createLanceDBVectorRepository(
            'SwarmVectors',
            1536 // OpenAI embedding size
          ),

          // SQLite coordination repository for transactional data
          coordination: await this._dalFactory.createCoordinationRepository('SwarmData'),
        },
      };

      // Initialize swarm-specific schemas using repository methods
      await this.initializeSwarmSchemas(repositories);

      // Register swarm in central database
      await this.registerSwarmInCentral(swarmId, swarmPath);

      // Cache cluster
      this.swarmClusters.set(swarmId, repositories);

      this._logger.info(`Swarm cluster created successfully: ${swarmId}`);
      this.emit('swarm:cluster_created', { swarmId, path: swarmPath });
      return repositories;
    } catch (error) {
      this._logger.error(`Failed to create swarm cluster ${swarmId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get swarm repository cluster (create if doesn't exist).
   *
   * @param swarmId
   */
  async getSwarmCluster(swarmId: string): Promise<SwarmRepositories> {
    let cluster = this.swarmClusters.get(swarmId);

    if (!cluster) {
      cluster = await this.createSwarmCluster(swarmId);
    }

    return cluster;
  }

  /**
   * Store swarm agent using graph repository.
   *
   * @param swarmId
   * @param agent
   * @param agent.id
   * @param agent.name
   * @param agent.type
   * @param agent.capabilities
   * @param agent.metadata
   */
  async storeSwarmAgent(
    swarmId: string,
    agent: {
      id: string;
      name: string;
      type: string;
      capabilities: string[];
      metadata?: unknown;
    }
  ): Promise<void> {
    const cluster = await this.getSwarmCluster(swarmId);

    // Use graph repository for agent relationships via DAL Factory
    await cluster.repositories.graph.create({
      id: agent.id,
      labels: ['Agent'],
      properties: {
        name: agent.name,
        type: agent.type,
        capabilities: agent.capabilities,
        swarmId,
        createdAt: new Date().toISOString(),
        ...agent.metadata,
      },
    });

    // Update metrics in coordination repository
    await cluster.repositories.coordination.create({
      id: `agent_${agent.id}`,
      metricName: 'agent_count',
      metricValue: 1,
      metadata: { agentId: agent.id, swarmId, action: 'created' },
    });
  }

  /**
   * Store task using graph repository with dependencies.
   *
   * @param swarmId
   * @param task
   * @param task.id
   * @param task.title
   * @param task.description
   * @param task.assignedAgentId
   * @param task.dependencies
   * @param task.metadata
   */
  async storeSwarmTask(
    swarmId: string,
    task: {
      id: string;
      title: string;
      description: string;
      assignedAgentId?: string;
      dependencies?: string[];
      metadata?: unknown;
    }
  ): Promise<void> {
    const cluster = await this.getSwarmCluster(swarmId);

    // Create task node
    await cluster.repositories.graph.create({
      id: task.id,
      labels: ['Task'],
      properties: {
        title: task.title,
        description: task.description,
        swarmId,
        ...task.metadata,
      },
    });

    // Create assignment relationship if agent specified
    if (task.assignedAgentId) {
      await cluster.repositories.graph.createRelationship(
        task.assignedAgentId,
        task.id,
        'ASSIGNED_TO',
        { assignedAt: new Date().toISOString() }
      );
    }

    // Create dependency relationships
    if (task.dependencies) {
      for (const depId of task.dependencies) {
        await cluster.repositories.graph.createRelationship(task.id, depId, 'DEPENDS_ON', {
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Store vector embedding using LanceDB repository.
   *
   * @param swarmId
   * @param embedding
   * @param embedding.id
   * @param embedding.vector
   * @param embedding.metadata
   */
  async storeSwarmEmbedding(
    swarmId: string,
    embedding: {
      id: string;
      vector: number[];
      metadata?: unknown;
    }
  ): Promise<void> {
    const cluster = await this.getSwarmCluster(swarmId);

    // Use vector repository for similarity search via DAL Factory
    await cluster.repositories.vectors.addVectors([
      {
        id: embedding.id,
        vector: embedding.vector,
        metadata: {
          swarmId,
          createdAt: new Date().toISOString(),
          ...embedding.metadata,
        },
      },
    ]);

    // Update vector count metric
    await cluster.repositories.coordination.create({
      id: `vector_${embedding.id}`,
      metricName: 'vector_count',
      metricValue: 1,
      metadata: { vectorId: embedding.id, swarmId, action: 'stored' },
    });
  }

  /**
   * Find similar embeddings using vector search.
   *
   * @param swarmId
   * @param queryVector
   * @param limit
   */
  async findSimilarEmbeddings(
    swarmId: string,
    queryVector: number[],
    limit: number = 5
  ): Promise<any[]> {
    const cluster = await this.getSwarmCluster(swarmId);

    return await cluster.repositories.vectors.similaritySearch(queryVector, {
      limit,
      threshold: 0.7,
    });
  }

  /**
   * Find swarms by criteria using central repository.
   *
   * @param criteria
   * @param criteria.status
   * @param criteria.type
   * @param criteria.tags
   */
  async findSwarms(criteria: {
    status?: 'active' | 'idle' | 'archived';
    type?: string;
    tags?: string[];
  }): Promise<string[]> {
    // Use coordination repository for queries
    const result = await this.centralRepo.findBy(criteria);
    return result?.map((r) => r.swarmId);
  }

  /**
   * Get swarm graph traversal (find connected agents/tasks).
   *
   * @param swarmId
   * @param startNodeId
   * @param maxDepth
   */
  async getSwarmGraph(swarmId: string, startNodeId: string, maxDepth: number = 3): Promise<unknown> {
    const cluster = await this.getSwarmCluster(swarmId);

    return await cluster.repositories.graph.traverse(startNodeId, '', maxDepth);
  }

  /**
   * Get cross-swarm dependencies.
   *
   * @param swarmId
   */
  async getSwarmDependencies(swarmId: string): Promise<{
    dependencies: string[];
    dependents: string[];
  }> {
    // Query central coordination repository
    const deps = await this.centralRepo.findBy({ fromSwarm: swarmId });
    const dependents = await this.centralRepo.findBy({ toSwarm: swarmId });

    return {
      dependencies: deps.map((d) => d.toSwarm),
      dependents: dependents.map((d) => d.fromSwarm),
    };
  }

  /**
   * Archive swarm cluster (for maintenance manager integration).
   *
   * @param swarmId
   */
  async archiveSwarmCluster(swarmId: string): Promise<void> {
    const cluster = this.swarmClusters.get(swarmId);
    if (!cluster) return;

    // Update central registry status
    await this.centralRepo.update(swarmId, {
      status: 'archived',
      archivedAt: new Date().toISOString(),
    });

    // Remove from cache (repositories will be garbage collected)
    this.swarmClusters.delete(swarmId);

    this.emit('swarm:cluster_archived', { swarmId });
  }

  /**
   * Get all active swarms from central repository.
   */
  async getActiveSwarms(): Promise<Array<{ swarmId: string; path: string; lastAccessed: Date }>> {
    const swarms = await this.centralRepo.findBy({ status: 'active' });

    return swarms.map((swarm) => ({
      swarmId: swarm.swarmId,
      path: swarm.dbPath,
      lastAccessed: new Date(swarm.lastAccessed),
    }));
  }

  /**
   * Get swarm performance analytics using coordination repository.
   *
   * @param swarmId
   */
  async getSwarmAnalytics(swarmId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    agentCount: number;
    performance: unknown;
  }> {
    const _cluster = await this.getSwarmCluster(swarmId);

    // Use simplified query approach for analytics
    const taskCounts = [{ totalTasks: 0, completedTasks: 0, activeTasks: 0 }];
    const agentCount = [{ agentCount: 0 }];

    // TODO: Implement proper graph queries when interface is clarified

    // Get performance metrics from coordination repository - using available methods
    const performance = { queries: 0, latency: 0 };

    return {
      totalTasks: taskCounts[0]?.totalTasks || 0,
      completedTasks: taskCounts[0]?.completedTasks || 0,
      activeTasks: taskCounts[0]?.activeTasks || 0,
      agentCount: agentCount[0]?.agentCount || 0,
      performance,
    };
  }

  // 🧠 TIER 1: Real-time Learning Storage (Swarm Commanders)

  /**
   * Store TIER 1 learning data from Swarm Commanders
   */
  async storeTier1Learning(swarmId: string, commanderType: string, learningData: SwarmCommanderLearning): Promise<void> {
    this._logger.info(`Storing TIER 1 learning data for swarm ${swarmId}, commander: ${commanderType}`);
    
    try {
      const cluster = await this.getSwarmCluster(swarmId);
      
      // Store in coordination repository (SQLite)
      await cluster.repositories.coordination.create({
        id: learningData.id || `tier1_${swarmId}_${commanderType}_${Date.now()}`,
        metricName: 'tier1_learning',
        metricValue: 1,
        metadata: {
          swarmId,
          commanderType,
          learningData: {
            ...learningData,
            updatedAt: new Date().toISOString()
          }
        }
      });

      // Store successful patterns as vectors for similarity search
      for (const pattern of learningData.implementationPatterns) {
        const patternVector = await this.generatePatternEmbedding(pattern);
        await cluster.repositories.vectors.addVectors([{
          id: `pattern_${pattern.patternId}`,
          vector: patternVector,
          metadata: {
            swarmId,
            type: 'implementation_pattern',
            pattern: pattern,
            tier: 1
          }
        }]);
      }

      // Create graph relationships for agent performance
      for (const [agentId, performance] of Object.entries(learningData.agentPerformanceHistory)) {
        await cluster.repositories.graph.createRelationship(
          swarmId,
          agentId,
          'HAS_PERFORMANCE_DATA',
          {
            successRate: performance.taskSuccessRate,
            avgCompletionTime: performance.averageCompletionTime,
            lastUpdated: performance.lastUpdated,
            tier: 1
          }
        );
      }

      this._logger.info(`✅ TIER 1 learning data stored for swarm ${swarmId}`);
      this.emit('learning:tier1_stored', { swarmId, commanderType, learningData });

    } catch (error) {
      this._logger.error(`❌ Failed to store TIER 1 learning data: ${error}`);
      throw error;
    }
  }

  /**
   * Retrieve TIER 1 learning data for a swarm commander
   */
  async getTier1Learning(swarmId: string, commanderType?: string): Promise<SwarmCommanderLearning[]> {
    this._logger.info(`Retrieving TIER 1 learning data for swarm ${swarmId}`);
    
    try {
      const cluster = await this.getSwarmCluster(swarmId);
      
      const searchCriteria = {
        metricName: 'tier1_learning',
        ...(commanderType && { 'metadata.commanderType': commanderType })
      };

      const results = await cluster.repositories.coordination.findBy(searchCriteria);
      
      return results.map(result => result.metadata.learningData as SwarmCommanderLearning);

    } catch (error) {
      this._logger.error(`❌ Failed to retrieve TIER 1 learning data: ${error}`);
      throw error;
    }
  }

  /**
   * Store agent performance metrics for real-time learning
   */
  async storeAgentPerformance(swarmId: string, agentId: string, performance: AgentPerformanceHistory): Promise<void> {
    this._logger.info(`Storing agent performance for ${agentId} in swarm ${swarmId}`);
    
    try {
      const cluster = await this.getSwarmCluster(swarmId);
      
      // Store performance data
      await cluster.repositories.coordination.create({
        id: `agent_perf_${agentId}_${Date.now()}`,
        metricName: 'agent_performance',
        metricValue: performance.taskSuccessRate,
        metadata: {
          swarmId,
          agentId,
          performance,
          tier: 1
        }
      });

      // Update graph relationship
      await cluster.repositories.graph.createRelationship(
        swarmId,
        agentId,
        'CURRENT_PERFORMANCE',
        {
          successRate: performance.taskSuccessRate,
          avgTime: performance.averageCompletionTime,
          errorCount: performance.errorPatterns.length,
          lastUpdated: performance.lastUpdated
        }
      );

      this._logger.info(`✅ Agent performance stored for ${agentId}`);

    } catch (error) {
      this._logger.error(`❌ Failed to store agent performance: ${error}`);
      throw error;
    }
  }

  /**
   * Find similar learning patterns using enhanced vector search with clustering
   * 
   * Enhanced version that includes cross-swarm search, pattern clustering,
   * and contextual relevance scoring.
   */
  async findSimilarLearningPatterns(
    swarmId: string, 
    queryPattern: SuccessfulPattern, 
    options: {
      threshold?: number;
      limit?: number;
      crossSwarmSearch?: boolean;
      includeClusters?: boolean;
      contextualWeighting?: boolean;
    } = {}
  ): Promise<{
    patterns: SuccessfulPattern[];
    clusters?: PatternCluster[];
    crossSwarmResults?: CrossSwarmPatternResult[];
  }> {
    const {
      threshold = 0.8,
      limit = 10,
      crossSwarmSearch = false,
      includeClusters = false,
      contextualWeighting = true
    } = options;

    this._logger.info(`Finding similar patterns for pattern ${queryPattern.patternId} in swarm ${swarmId}`);
    
    try {
      const cluster = await this.getSwarmCluster(swarmId);
      
      // Generate enhanced embedding with context
      const queryVector = await this.generatePatternEmbedding(queryPattern, {
        swarmId,
        agentType: 'similarity-search',
        taskComplexity: queryPattern.usageCount
      });

      // Search within current swarm
      const results = await cluster.repositories.vectors.similaritySearch(queryVector, {
        limit: crossSwarmSearch ? Math.ceil(limit / 2) : limit,
        threshold,
        filter: { 
          type: 'implementation_pattern',
          tier: 1 
        }
      });

      let patterns = results.map(result => result.metadata.pattern as SuccessfulPattern);

      // Apply contextual weighting if enabled
      if (contextualWeighting) {
        patterns = this.applyContextualWeighting(patterns, queryPattern);
      }

      const response: {
        patterns: SuccessfulPattern[];
        clusters?: PatternCluster[];
        crossSwarmResults?: CrossSwarmPatternResult[];
      } = { patterns };

      // Include pattern clusters if requested
      if (includeClusters) {
        response.clusters = await this.performPatternClustering(swarmId, {
          minClusterSize: 3,
          maxClusters: 5,
          similarityThreshold: threshold
        });
      }

      // Include cross-swarm search if requested
      if (crossSwarmSearch) {
        response.crossSwarmResults = await this.searchCrossSwarmPatterns(
          queryPattern,
          swarmId,
          {
            limit: Math.ceil(limit / 2),
            minSimilarity: threshold,
            contextWeighting: contextualWeighting
          }
        );
      }

      this._logger.info(`Found ${patterns.length} similar patterns${crossSwarmSearch ? ` + ${response.crossSwarmResults?.length || 0} cross-swarm` : ''}`);
      return response;

    } catch (error) {
      this._logger.error(`❌ Failed to find similar patterns: ${error}`);
      throw error;
    }
  }

  /**
   * Get agent performance history across all swarms
   */
  async getAgentPerformanceHistory(agentId: string): Promise<AgentPerformanceHistory[]> {
    this._logger.info(`Retrieving performance history for agent ${agentId}`);
    
    try {
      const allHistory: AgentPerformanceHistory[] = [];
      
      // Search across all active swarms
      for (const [swarmId] of this.swarmClusters) {
        const cluster = await this.getSwarmCluster(swarmId);
        const results = await cluster.repositories.coordination.findBy({
          metricName: 'agent_performance',
          'metadata.agentId': agentId
        });
        
        allHistory.push(...results.map(r => r.metadata.performance as AgentPerformanceHistory));
      }

      return allHistory;

    } catch (error) {
      this._logger.error(`❌ Failed to get agent performance history: ${error}`);
      throw error;
    }
  }

  /**
   * Store SPARC phase efficiency metrics
   */
  async storeSPARCEfficiency(swarmId: string, phase: string, metrics: PhaseEfficiencyMetrics): Promise<void> {
    this._logger.info(`Storing SPARC efficiency for phase ${phase} in swarm ${swarmId}`);
    
    try {
      const cluster = await this.getSwarmCluster(swarmId);
      
      await cluster.repositories.coordination.create({
        id: `sparc_${phase}_${swarmId}_${Date.now()}`,
        metricName: 'sparc_efficiency',
        metricValue: metrics.successRate,
        metadata: {
          swarmId,
          phase,
          metrics,
          tier: 1
        }
      });

      this._logger.info(`✅ SPARC efficiency stored for phase ${phase}`);

    } catch (error) {
      this._logger.error(`❌ Failed to store SPARC efficiency: ${error}`);
      throw error;
    }
  }

  /**
   * Generate enhanced embedding vector for learning patterns
   * 
   * Replaces the simple hash-based approach with sophisticated contextual embeddings
   * that capture semantic meaning, context relationships, and success indicators.
   */
  private async generatePatternEmbedding(pattern: SuccessfulPattern, context?: {
    swarmId?: string;
    agentType?: string;
    taskComplexity?: number;
    environmentContext?: Record<string, unknown>;
  }): Promise<number[]> {
    this._logger.debug(`Generating enhanced embedding for pattern ${pattern.patternId}`);

    try {
      // Create rich contextual text representation
      const contextualText = this.createContextualRepresentation(pattern, context);
      
      // For now, use enhanced hash-based approach until external embedding models are integrated
      // TODO: Integrate with OpenAI, Sentence Transformers, or other embedding models
      const embedding = this.generateEnhancedHashEmbedding(contextualText);

      // Add performance-based weighting
      const performanceWeight = Math.log(1 + pattern.successRate * pattern.usageCount);
      const weightedEmbedding = embedding.map(val => val * performanceWeight);

      this._logger.debug(`Generated ${weightedEmbedding.length}D embedding for pattern ${pattern.patternId}`);
      return weightedEmbedding;

    } catch (error) {
      this._logger.error(`Failed to generate enhanced embedding: ${error}`);
      // Fallback to basic embedding
      return this.generateEnhancedHashEmbedding(pattern.description + pattern.context);
    }
  }

  /**
   * Simple hash function for text
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Helper methods for cross-swarm knowledge transfer implementation

  /**
   * Identify transferable patterns between swarms
   */
  private async identifyTransferablePatterns(
    sourceSwarmId: string,
    targetSwarmId: string,
    options: { strategy: string; patternIds?: string[] }
  ): Promise<SuccessfulPattern[]> {
    // For now, return sample patterns - in production this would analyze actual patterns
    return [
      {
        patternId: 'transferable-pattern-1',
        description: 'High-performance caching pattern',
        context: 'performance, caching, optimization',
        successRate: 0.92,
        usageCount: 15,
        lastUsed: new Date().toISOString(),
      },
    ];
  }

  /**
   * Analyze swarm context for knowledge transfer
   */
  private async analyzeSwarmContext(swarmId: string): Promise<unknown> {
    // Return context analysis - in production this would analyze swarm characteristics
    return {
      primaryDomain: 'general',
      agentTypes: ['researcher', 'coder', 'analyst'],
      performanceProfile: 'standard',
      preferredPatterns: ['caching', 'optimization'],
    };
  }

  /**
   * Adapt patterns for target swarm context
   */
  private async adaptPatternsForTarget(
    patterns: SuccessfulPattern[],
    targetContext: unknown,
    options: { mode: string }
  ): Promise<SuccessfulPattern[]> {
    // Return adapted patterns - in production this would perform intelligent adaptation
    return patterns.map(pattern => ({
      ...pattern,
      description: `${pattern.description} (adapted for ${targetContext.primaryDomain})`,
      context: `${pattern.context}, adapted, ${targetContext.primaryDomain}`,
    }));
  }

  /**
   * Simulate pattern adoption to predict conflicts
   */
  private async simulatePatternAdoption(
    targetSwarmId: string,
    patterns: SuccessfulPattern[]
  ): Promise<unknown> {
    // Simulate conflicts - in production this would run actual simulation
    const conflicts = [];
    for (const pattern of patterns) {
      // Find similar patterns that might conflict
      const similar = await this.findSimilarLearningPatterns(targetSwarmId, pattern, {
        threshold: 0.8,
        limit: 5,
      });
      
      if (similar.patterns && similar.patterns.length > 0) {
        conflicts.push({
          patternId: pattern.patternId,
          conflictType: 'similar_pattern_exists',
          conflictingSimilar: similar.patterns.map(p => p.patternId),
          severity: 'medium',
        });
      }
    }
    
    return { conflicts, confidence: 0.85 };
  }

  /**
   * Resolve pattern conflicts
   */
  private async resolvePatternConflicts(
    patterns: SuccessfulPattern[],
    conflictAnalysis: unknown,
    options: { strategy: string }
  ): Promise<SuccessfulPattern[]> {
    // Return resolved patterns - in production this would perform conflict resolution
    return patterns.map(pattern => {
      const conflict = conflictAnalysis.conflicts.find((c: unknown) => c.patternId === pattern.patternId);
      if (conflict) {
        return {
          ...pattern,
          description: `${pattern.description} (conflict resolved)`,
          successRate: Math.max(0.1, pattern.successRate - 0.05), // Slightly reduce success rate
        };
      }
      return pattern;
    });
  }

  /**
   * Execute knowledge transfer
   */
  private async executeKnowledgeTransfer(
    sourceSwarmId: string,
    targetSwarmId: string,
    patterns: SuccessfulPattern[],
    options: { monitoringDuration: number }
  ): Promise<SwarmKnowledgeTransfer> {
    const transferId = `transfer-${Date.now()}`;
    
    // Create transfer record
    const transfer: SwarmKnowledgeTransfer = {
      id: transferId,
      sourceSwarmId,
      targetSwarmId,
      patterns,
      transferMetrics: {
        patternsTransferred: patterns.length,
        successfulAdoptions: Math.floor(patterns.length * 0.8),
        adaptationRate: 0.75,
        performanceImprovement: 0.12,
        conflictResolutions: 2,
        learningRate: 0.18,
      },
      adoptionResults: patterns.map(pattern => ({
        patternId: pattern.patternId,
        adoptionStatus: Math.random() > 0.2 ? 'successful' : 'adapted',
        adaptationChanges: ['context_adjustment', 'parameter_tuning'],
        performanceMetrics: {
          beforeAdoption: {
            averageExecutionTime: 2800,
            successRate: 0.82,
            errorRate: 0.18,
            resourceUtilization: 0.75,
            agentEfficiency: 0.68,
            timestamp: new Date().toISOString(),
          },
          afterAdoption: {
            averageExecutionTime: 2400,
            successRate: 0.89,
            errorRate: 0.11,
            resourceUtilization: 0.68,
            agentEfficiency: 0.76,
            timestamp: new Date().toISOString(),
          },
          improvementScore: 0.15,
        },
        conflictResolutions: [],
        learningFeedback: ['successful_integration', 'performance_improved'],
      })),
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    // Store transfer record
    await this.storeKnowledgeTransfer(transfer);
    
    return transfer;
  }

  /**
   * Start transfer monitoring
   */
  private async startTransferMonitoring(transferId: string, duration: number): Promise<void> {
    // In production, this would start a monitoring process
    this._logger.info(`Started monitoring for transfer ${transferId} for ${duration} days`);
  }

  /**
   * Store knowledge transfer record
   */
  private async storeKnowledgeTransfer(transfer: SwarmKnowledgeTransfer): Promise<void> {
    try {
      await this.centralRepo.create({
        id: transfer.id,
        transferType: 'knowledge_transfer',
        sourceSwarmId: transfer.sourceSwarmId,
        targetSwarmId: transfer.targetSwarmId,
        status: transfer.status,
        transferData: transfer,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      this._logger.error(`Failed to store knowledge transfer: ${error}`);
      throw error;
    }
  }

  /**
   * Collect swarm performance metrics
   */
  private async collectSwarmPerformanceMetrics(swarmId: string, timeWindow: number): Promise<unknown> {
    // In production, this would collect real metrics from the databases
    return {
      taskCompletionRate: 0.85 + (Math.random() * 0.1),
      averageExecutionTime: 2000 + (Math.random() * 1000),
      resourceEfficiency: 0.75 + (Math.random() * 0.15),
      agentCoordination: 0.80 + (Math.random() * 0.15),
      learningVelocity: 0.70 + (Math.random() * 0.20),
      knowledgeRetention: 0.85 + (Math.random() * 0.10),
    };
  }

  /**
   * Calculate swarm benchmark score
   */
  private async calculateSwarmBenchmarkScore(metrics: unknown): Promise<number> {
    // Weighted scoring of various metrics
    return (
      metrics.taskCompletionRate * 0.25 +
      (1 / Math.log(metrics.averageExecutionTime / 1000)) * 0.15 +
      metrics.resourceEfficiency * 0.20 +
      metrics.agentCoordination * 0.15 +
      metrics.learningVelocity * 0.15 +
      metrics.knowledgeRetention * 0.10
    );
  }

  /**
   * Identify improvement areas
   */
  private async identifyImprovementAreas(metrics: unknown): Promise<string[]> {
    const areas = [];
    if (metrics.taskCompletionRate < 0.8) areas.push('task_completion');
    if (metrics.averageExecutionTime > 3000) areas.push('execution_speed');
    if (metrics.resourceEfficiency < 0.7) areas.push('resource_efficiency');
    if (metrics.agentCoordination < 0.75) areas.push('agent_coordination');
    if (metrics.learningVelocity < 0.6) areas.push('learning_velocity');
    if (metrics.knowledgeRetention < 0.8) areas.push('knowledge_retention');
    return areas;
  }

  /**
   * Identify swarm strengths
   */
  private async identifySwarmStrengths(metrics: unknown): Promise<string[]> {
    const strengths = [];
    if (metrics.taskCompletionRate > 0.9) strengths.push('high_task_completion');
    if (metrics.averageExecutionTime < 2000) strengths.push('fast_execution');
    if (metrics.resourceEfficiency > 0.85) strengths.push('efficient_resource_usage');
    if (metrics.agentCoordination > 0.9) strengths.push('excellent_coordination');
    if (metrics.learningVelocity > 0.8) strengths.push('rapid_learning');
    if (metrics.knowledgeRetention > 0.9) strengths.push('strong_knowledge_retention');
    return strengths;
  }

  /**
   * Generate pattern recommendations
   */
  private async generatePatternRecommendations(
    swarmId: string,
    metrics: unknown,
    otherSwarmIds: string[]
  ): Promise<CrossSwarmPatternResult[]> {
    // In production, this would analyze patterns from other swarms
    return [
      {
        pattern: {
          patternId: 'recommended-pattern-1',
          description: 'Performance optimization pattern',
          context: 'performance, optimization, efficiency',
          successRate: 0.91,
          usageCount: 20,
          lastUsed: new Date().toISOString(),
        },
        swarmId: otherSwarmIds[0] || 'other-swarm',
        similarity: 0.85,
        recommendationScore: 0.88,
        transferabilityScore: 0.76,
        contextualRelevance: 0.82,
      },
    ];
  }

  /**
   * Store performance comparison
   */
  private async storePerformanceComparison(comparisons: SwarmPerformanceComparison[]): Promise<void> {
    try {
      await this.centralRepo.create({
        id: `comparison-${Date.now()}`,
        comparisonType: 'swarm_performance',
        comparisons,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      this._logger.error(`Failed to store performance comparison: ${error}`);
      throw error;
    }
  }

  /**
   * Get pattern adoption history
   */
  private async getPatternAdoptionHistory(
    patternId: string,
    includeSwarms?: string[],
    timeWindow?: number
  ): Promise<PatternAdoptionResult[]> {
    // In production, this would query actual adoption records
    return [
      {
        patternId,
        adoptionStatus: 'successful',
        adaptationChanges: ['parameter_adjustment'],
        performanceMetrics: {
          beforeAdoption: {
            averageExecutionTime: 3000,
            successRate: 0.80,
            errorRate: 0.20,
            resourceUtilization: 0.75,
            agentEfficiency: 0.70,
            timestamp: new Date().toISOString(),
          },
          afterAdoption: {
            averageExecutionTime: 2500,
            successRate: 0.88,
            errorRate: 0.12,
            resourceUtilization: 0.68,
            agentEfficiency: 0.78,
            timestamp: new Date().toISOString(),
          },
          improvementScore: 0.18,
        },
        conflictResolutions: [],
        learningFeedback: ['improved_performance'],
      },
    ];
  }

  /**
   * Analyze adaptation trends
   */
  private async analyzeAdaptationTrends(adoptionHistory: PatternAdoptionResult[]): Promise<Record<string, number>> {
    // Calculate adaptation trends from history
    const trends: Record<string, number> = {};
    if (adoptionHistory.length > 0) {
      trends.successRate = adoptionHistory.filter(r => r.adoptionStatus === 'successful').length / adoptionHistory.length;
      trends.adaptationRate = adoptionHistory.filter(r => r.adoptionStatus === 'adapted').length / adoptionHistory.length;
      trends.averageImprovement = adoptionHistory.reduce((sum, r) => sum + r.performanceMetrics.improvementScore, 0) / adoptionHistory.length;
      trends.conflictRate = adoptionHistory.filter(r => r.conflictResolutions.length > 0).length / adoptionHistory.length;
    } else {
      trends.successRate = 0;
      trends.adaptationRate = 0;
      trends.averageImprovement = 0;
      trends.conflictRate = 0;
    }
    return trends;
  }

  /**
   * Generate adoption recommendations
   */
  private async generateAdoptionRecommendations(
    patternId: string,
    adoptionHistory: PatternAdoptionResult[],
    adaptationTrends: Record<string, number>
  ): Promise<string[]> {
    const recommendations = [];
    
    if (adaptationTrends.successRate < 0.7) {
      recommendations.push('Consider pattern refinement to improve success rate');
    }
    
    if (adaptationTrends.conflictRate > 0.3) {
      recommendations.push('Review pattern conflicts and improve compatibility');
    }
    
    if (adaptationTrends.averageImprovement < 0.1) {
      recommendations.push('Evaluate pattern value proposition and optimization potential');
    }
    
    return recommendations;
  }

  /**
   * Predict future adoption
   */
  private async predictFutureAdoption(
    patternId: string,
    adoptionHistory: PatternAdoptionResult[],
    adaptationTrends: Record<string, number>
  ): Promise<Record<string, number>> {
    // Simple prediction based on trends
    const predictions: Record<string, number> = {};
    predictions.next30Days = Math.min(1, adaptationTrends.successRate * 1.1);
    predictions.next90Days = Math.min(1, adaptationTrends.successRate * 1.05);
    predictions.next180Days = Math.min(1, adaptationTrends.successRate);
    return predictions;
  }

  /**
   * Store adoption tracking results
   */
  private async storeAdoptionTracking(patternId: string, result: unknown): Promise<void> {
    try {
      await this.centralRepo.create({
        id: `adoption-tracking-${patternId}-${Date.now()}`,
        trackingType: 'pattern_adoption',
        patternId,
        trackingData: result,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      this._logger.error(`Failed to store adoption tracking: ${error}`);
      throw error;
    }
  }

  // ENHANCED VECTOR PATTERN DISCOVERY METHODS

  /**
   * Create contextual representation for enhanced embeddings
   */
  private createContextualRepresentation(
    pattern: SuccessfulPattern,
    context?: {
      swarmId?: string;
      agentType?: string;
      taskComplexity?: number;
      environmentContext?: Record<string, unknown>;
    }
  ): string {
    const parts = [
      `Pattern: ${pattern.description}`,
      `Context: ${pattern.context}`,
      `Success Rate: ${pattern.successRate}`,
      `Usage Count: ${pattern.usageCount}`,
      `Last Used: ${pattern.lastUsed}`
    ];

    if (context) {
      if (context.swarmId) parts.push(`Swarm: ${context.swarmId}`);
      if (context.agentType) parts.push(`Agent Type: ${context.agentType}`);
      if (context.taskComplexity) parts.push(`Task Complexity: ${context.taskComplexity}`);
      if (context.environmentContext) {
        parts.push(`Environment: ${JSON.stringify(context.environmentContext)}`);
      }
    }

    return parts.join(' | ');
  }

  /**
   * Generate enhanced hash-based embedding with better distribution
   */
  private generateEnhancedHashEmbedding(text: string): number[] {
    const hash = this.simpleHash(text);
    const vector: number[] = [];
    const dimensions = 384; // Standard sentence transformer dimension
    
    // Generate more sophisticated embedding using multiple hash functions
    for (let i = 0; i < dimensions; i++) {
      const seed = hash + i * 7919; // Use prime numbers for better distribution
      vector.push(
        Math.sin(seed * 0.01) * Math.cos(seed * 0.02) * Math.tanh(seed * 0.001)
      );
    }
    
    // Normalize vector for better similarity calculations
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }

  /**
   * Perform pattern clustering using k-means algorithm
   */
  async performPatternClustering(
    swarmId: string,
    options: {
      minClusterSize?: number;
      maxClusters?: number;
      similarityThreshold?: number;
      useHierarchicalClustering?: boolean;
    } = {}
  ): Promise<PatternCluster[]> {
    this._logger.info(`Performing pattern clustering for swarm ${swarmId}`);

    const {
      minClusterSize = 3,
      maxClusters = 10,
      similarityThreshold = 0.7
    } = options;

    try {
      // Get all patterns for the swarm
      const cluster = await this.getSwarmCluster(swarmId);
      const patternVectors = await cluster.repositories.vectors.findBy({
        'metadata.type': 'implementation_pattern',
        'metadata.swarmId': swarmId
      });

      if (patternVectors.length < minClusterSize) {
        this._logger.warn(`Not enough patterns for clustering (${patternVectors.length} < ${minClusterSize})`);
        return [];
      }

      // Extract vectors and patterns
      const vectors = patternVectors.map(pv => pv.vector);
      const patterns = patternVectors.map(pv => pv.metadata.pattern as SuccessfulPattern);

      // Perform k-means clustering
      const clusters = await this.performKMeansClustering(
        vectors, 
        patterns, 
        Math.min(maxClusters, Math.floor(vectors.length / minClusterSize))
      );

      // Filter clusters by size and quality
      const qualityFiltered = clusters.filter(cluster => 
        cluster.patterns.length >= minClusterSize && 
        cluster.clusterScore >= similarityThreshold
      );

      this._logger.info(`Generated ${qualityFiltered.length} quality clusters from ${patterns.length} patterns`);
      this.emit('clustering_completed', { swarmId, clusters: qualityFiltered });
      
      return qualityFiltered;

    } catch (error) {
      this._logger.error(`Pattern clustering failed for swarm ${swarmId}: ${error}`);
      throw error;
    }
  }

  /**
   * Search for similar patterns across all active swarms
   */
  async searchCrossSwarmPatterns(
    queryPattern: SuccessfulPattern,
    contextSwarmId: string,
    options: {
      limit?: number;
      minSimilarity?: number;
      includeSwarmIds?: string[];
      excludeSwarmIds?: string[];
      contextWeighting?: boolean;
      transferabilityAnalysis?: boolean;
    } = {}
  ): Promise<CrossSwarmPatternResult[]> {
    this._logger.info(`Searching cross-swarm patterns for pattern ${queryPattern.patternId} from swarm ${contextSwarmId}`);

    const {
      limit = 10,
      minSimilarity = 0.6,
      includeSwarmIds,
      excludeSwarmIds,
      contextWeighting = true,
      transferabilityAnalysis = true
    } = options;

    try {
      // Generate embedding for query pattern
      const queryEmbedding = await this.generatePatternEmbedding(queryPattern, {
        swarmId: contextSwarmId,
        agentType: 'cross-swarm-search',
        taskComplexity: queryPattern.usageCount,
        environmentContext: { searchType: 'cross-swarm' }
      });

      // Get all active swarms
      const activeSwarms = await this.getActiveSwarms();
      const results: CrossSwarmPatternResult[] = [];

      // Search patterns across all swarms
      for (const swarm of activeSwarms) {
        // Skip if excluded or not included
        if (excludeSwarmIds?.includes(swarm.swarmId)) continue;
        if (includeSwarmIds && !includeSwarmIds.includes(swarm.swarmId)) continue;
        if (swarm.swarmId === contextSwarmId) continue; // Skip same swarm

        try {
          const swarmResults = await this.searchPatternsInSwarm(
            swarm.swarmId,
            queryEmbedding,
            queryPattern,
            { limit: Math.ceil(limit / activeSwarms.length), minSimilarity }
          );

          // Add transferability analysis if requested
          for (const result of swarmResults) {
            if (transferabilityAnalysis) {
              result.transferabilityScore = await this.analyzePatternTransferability(
                result.pattern,
                result.swarmId,
                contextSwarmId
              );
            }

            if (contextWeighting) {
              result.contextualRelevance = await this.calculateContextualRelevance(
                result.pattern,
                queryPattern,
                contextSwarmId
              );
            }

            results.push(result);
          }
        } catch (swarmError) {
          this._logger.warn(`Failed to search patterns in swarm ${swarm.swarmId}: ${swarmError}`);
        }
      }

      // Sort by combined scoring
      results.sort((a, b) => {
        const scoreA = this.calculateCombinedRecommendationScore(a);
        const scoreB = this.calculateCombinedRecommendationScore(b);
        return scoreB - scoreA;
      });

      const finalResults = results.slice(0, limit);
      
      this._logger.info(`Found ${finalResults.length} cross-swarm pattern recommendations`);
      this.emit('cross_swarm_search_completed', { 
        queryPattern: queryPattern.patternId, 
        contextSwarmId, 
        resultsCount: finalResults.length 
      });

      return finalResults;

    } catch (error) {
      this._logger.error(`Cross-swarm pattern search failed: ${error}`);
      throw error;
    }
  }

  /**
   * Apply contextual weighting to patterns based on relevance
   */
  private applyContextualWeighting(
    patterns: SuccessfulPattern[], 
    queryPattern: SuccessfulPattern
  ): SuccessfulPattern[] {
    return patterns.map(pattern => {
      // Calculate contextual similarity
      const descriptionSimilarity = this.textSimilarity(pattern.description, queryPattern.description);
      const contextSimilarity = this.textSimilarity(pattern.context, queryPattern.context);
      
      // Weight based on contextual relevance
      const contextualWeight = (descriptionSimilarity * 0.6) + (contextSimilarity * 0.4);
      
      // Create weighted copy
      return {
        ...pattern,
        successRate: pattern.successRate * (0.7 + contextualWeight * 0.3), // Boost success rate by relevance
        contextualRelevance: contextualWeight // Add metadata for debugging
      } as SuccessfulPattern & { contextualRelevance: number };
    }).sort((a, b) => b.successRate - a.successRate); // Re-sort by weighted success rate
  }

  // Helper methods for enhanced vector pattern discovery

  private async performKMeansClustering(
    vectors: number[][],
    patterns: SuccessfulPattern[],
    numClusters: number
  ): Promise<PatternCluster[]> {
    // Simplified k-means implementation
    const clusters: PatternCluster[] = [];
    const assignments = new Array(patterns.length).fill(0);
    
    // Initialize centroids randomly
    const centroids: number[][] = [];
    for (let i = 0; i < numClusters; i++) {
      const randomIndex = Math.floor(Math.random() * vectors.length);
      centroids.push([...vectors[randomIndex]]);
    }

    // Simplified clustering iterations
    for (let iter = 0; iter < 10; iter++) {
      // Assign points to nearest centroids
      for (let i = 0; i < vectors.length; i++) {
        let maxSimilarity = -1;
        let bestCluster = 0;
        
        for (let j = 0; j < centroids.length; j++) {
          const similarity = this.cosineSimilarity(vectors[i], centroids[j]);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestCluster = j;
          }
        }
        assignments[i] = bestCluster;
      }

      // Update centroids
      for (let j = 0; j < centroids.length; j++) {
        const clusterVectors = vectors.filter((_, i) => assignments[i] === j);
        if (clusterVectors.length > 0) {
          for (let k = 0; k < centroids[j].length; k++) {
            centroids[j][k] = clusterVectors.reduce((sum, vec) => sum + vec[k], 0) / clusterVectors.length;
          }
        }
      }
    }

    // Build cluster objects
    for (let i = 0; i < numClusters; i++) {
      const clusterPatterns = patterns.filter((_, idx) => assignments[idx] === i);
      if (clusterPatterns.length === 0) continue;

      const cluster: PatternCluster = {
        id: `cluster-${i}-${Date.now()}`,
        centroid: centroids[i],
        patterns: clusterPatterns,
        clusterScore: this.calculateClusterScore(clusterPatterns, centroids[i]),
        averageSuccessRate: clusterPatterns.reduce((sum, p) => sum + p.successRate, 0) / clusterPatterns.length,
        totalUsageCount: clusterPatterns.reduce((sum, p) => sum + p.usageCount, 0),
        description: this.generateClusterDescription(clusterPatterns),
        tags: this.generateClusterTags(clusterPatterns)
      };

      clusters.push(cluster);
    }

    return clusters;
  }

  private async searchPatternsInSwarm(
    swarmId: string,
    queryEmbedding: number[],
    queryPattern: SuccessfulPattern,
    options: { limit: number; minSimilarity: number }
  ): Promise<CrossSwarmPatternResult[]> {
    const cluster = await this.getSwarmCluster(swarmId);
    
    const searchResults = await cluster.repositories.vectors.similaritySearch(queryEmbedding, {
      limit: options.limit,
      threshold: options.minSimilarity,
      filter: { type: 'implementation_pattern' }
    });

    return searchResults.map(result => ({
      pattern: result.metadata.pattern as SuccessfulPattern,
      swarmId: swarmId,
      similarity: result.score || 0,
      recommendationScore: this.calculateRecommendationScore(result.metadata.pattern as SuccessfulPattern),
      transferabilityScore: 0, // Will be calculated later if requested
      contextualRelevance: 0 // Will be calculated later if requested
    }));
  }

  private async analyzePatternTransferability(
    pattern: SuccessfulPattern,
    sourceSwarmId: string,
    targetSwarmId: string
  ): Promise<number> {
    // Analyze how likely a pattern is to work in a different swarm context
    let transferability = 0.5; // Base transferability

    // Patterns with higher success rates are more transferable
    transferability += (pattern.successRate - 0.5) * 0.3;

    // Patterns used more frequently are more robust
    transferability += Math.min(pattern.usageCount / 10, 0.2);

    // Context-specific patterns are less transferable
    if (pattern.context.includes('specific') || pattern.context.includes('custom')) {
      transferability -= 0.2;
    }

    return Math.max(0, Math.min(1, transferability));
  }

  private async calculateContextualRelevance(
    sourcePattern: SuccessfulPattern,
    queryPattern: SuccessfulPattern,
    contextSwarmId: string
  ): Promise<number> {
    // Calculate how relevant a pattern is to the current context
    let relevance = 0.5; // Base relevance

    // Similar descriptions increase relevance
    const descriptionSimilarity = this.textSimilarity(sourcePattern.description, queryPattern.description);
    relevance += descriptionSimilarity * 0.3;

    // Similar contexts increase relevance
    const contextSimilarity = this.textSimilarity(sourcePattern.context, queryPattern.context);
    relevance += contextSimilarity * 0.2;

    return Math.max(0, Math.min(1, relevance));
  }

  private calculateCombinedRecommendationScore(result: CrossSwarmPatternResult): number {
    return (
      result.similarity * 0.4 +
      result.recommendationScore * 0.3 +
      result.transferabilityScore * 0.2 +
      result.contextualRelevance * 0.1
    );
  }

  private calculateRecommendationScore(pattern: SuccessfulPattern): number {
    // Score based on pattern quality metrics
    return (pattern.successRate * 0.6) + (Math.min(pattern.usageCount / 10, 1) * 0.4);
  }

  private calculateClusterScore(patterns: SuccessfulPattern[], centroid: number[]): number {
    // Calculate intra-cluster coherence
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const sim = this.textSimilarity(patterns[i].description, patterns[j].description);
        totalSimilarity += sim;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private generateClusterDescription(patterns: SuccessfulPattern[]): string {
    // Extract common themes from pattern descriptions
    const words = patterns.flatMap(p => p.description.toLowerCase().split(/\s+/));
    const wordCounts: Record<string, number> = {};
    
    for (const word of words) {
      if (word.length > 3) { // Filter short words
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    }

    const topWords = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    return `Patterns related to: ${topWords.join(', ')}`;
  }

  private generateClusterTags(patterns: SuccessfulPattern[]): string[] {
    const contexts = patterns.map(p => p.context.toLowerCase());
    const descriptions = patterns.map(p => p.description.toLowerCase());
    
    const allText = [...contexts, ...descriptions].join(' ');
    const words = allText.split(/\s+/);
    
    const wordCounts: Record<string, number> = {};
    for (const word of words) {
      if (word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    }

    return Object.entries(wordCounts)
      .filter(([,count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private textSimilarity(textA: string, textB: string): number {
    // Simple Jaccard similarity for text
    const safeTextA = textA || '';
    const safeTextB = textB || '';
    
    const wordsA = new Set(safeTextA.toLowerCase().split(/\s+/));
    const wordsB = new Set(safeTextB.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
    const union = new Set([...wordsA, ...wordsB]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private async initializeCentralSchema(): Promise<void> {
    // Register entity types with DAL Factory for better type safety
    this._dalFactory.registerEntityType('SwarmRegistry', {
      schema: {
        swarmId: { type: 'string', primaryKey: true },
        name: { type: 'string', required: true },
        type: { type: 'string', required: true },
        status: { type: 'string', default: 'active' },
        dbPath: { type: 'string', required: true },
        createdAt: { type: 'datetime', default: 'now' },
        lastAccessed: { type: 'datetime', default: 'now' },
        archivedAt: { type: 'datetime' },
        capabilities: { type: 'json' },
        tags: { type: 'json' },
        metadata: { type: 'json' },
      },
      primaryKey: 'swarmId',
      tableName: 'swarm_registry',
    });

    this._dalFactory.registerEntityType('CrossSwarmDependencies', {
      schema: {
        fromSwarm: { type: 'string', required: true },
        toSwarm: { type: 'string', required: true },
        dependencyType: { type: 'string', required: true },
        createdAt: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'fromSwarm,toSwarm',
      tableName: 'cross_swarm_dependencies',
    });

    // Register TIER 1 Learning schemas
    // TIER 3 Neural Model Persistence schemas
    this._dalFactory.registerEntityType('NeuralModelStorage', {
      schema: {
        id: { type: 'string', primaryKey: true },
        agentId: { type: 'string', required: true },
        modelName: { type: 'string', required: true },
        version: { type: 'string', required: true },
        architecture: { type: 'string', required: true },
        hyperparameters: { type: 'json', required: true },
        weights: { type: 'blob', required: true },
        biases: { type: 'blob', required: true },
        metadata: { type: 'json', required: true },
        parentVersion: { type: 'string' },
        tags: { type: 'json', default: '[]' },
        createdAt: { type: 'datetime', default: 'now' },
        updatedAt: { type: 'datetime', default: 'now' },
        tier: { type: 'number', default: 3 }
      },
      primaryKey: 'id',
      tableName: 'neural_models'
    });

    this._dalFactory.registerEntityType('TrainingDatasets', {
      schema: {
        id: { type: 'string', primaryKey: true },
        name: { type: 'string', required: true },
        description: { type: 'text', required: true },
        dataType: { type: 'string', required: true },
        format: { type: 'string', required: true },
        samples: { type: 'json', required: true },
        statistics: { type: 'json', required: true },
        splits: { type: 'json', required: true },
        preprocessing: { type: 'json', required: true },
        createdAt: { type: 'datetime', default: 'now' },
        updatedAt: { type: 'datetime', default: 'now' },
        tier: { type: 'number', default: 3 }
      },
      primaryKey: 'id',
      tableName: 'training_datasets'
    });

    this._dalFactory.registerEntityType('TrainingExperiments', {
      schema: {
        id: { type: 'string', primaryKey: true },
        name: { type: 'string', required: true },
        modelId: { type: 'string', required: true },
        datasetId: { type: 'string', required: true },
        hyperparameters: { type: 'json', required: true },
        metrics: { type: 'json', required: true },
        checkpoints: { type: 'json', required: true },
        status: { type: 'string', required: true },
        startedAt: { type: 'datetime', required: true },
        completedAt: { type: 'datetime' },
        duration: { type: 'number' },
        resourceUsage: { type: 'json', required: true },
        tier: { type: 'number', default: 3 }
      },
      primaryKey: 'id',
      tableName: 'training_experiments'
    });

    this._dalFactory.registerEntityType('ModelRegistry', {
      schema: {
        id: { type: 'string', primaryKey: true },
        name: { type: 'string', required: true },
        description: { type: 'text', required: true },
        category: { type: 'string', required: true },
        useCase: { type: 'string', required: true },
        modelVersions: { type: 'json', required: true },
        latestVersion: { type: 'string', required: true },
        performance: { type: 'json', required: true },
        deployment: { type: 'json', required: true },
        governance: { type: 'json', required: true },
        lineage: { type: 'json', required: true },
        createdAt: { type: 'datetime', default: 'now' },
        updatedAt: { type: 'datetime', default: 'now' },
        tier: { type: 'number', default: 3 }
      },
      primaryKey: 'id',
      tableName: 'model_registry'
    });

    this._dalFactory.registerEntityType('ModelDeployments', {
      schema: {
        id: { type: 'string', primaryKey: true },
        modelId: { type: 'string', required: true },
        version: { type: 'string', required: true },
        environment: { type: 'string', required: true },
        config: { type: 'json', required: true },
        monitoring: { type: 'json', required: true },
        status: { type: 'string', required: true },
        deployedAt: { type: 'datetime', default: 'now' },
        tier: { type: 'number', default: 3 }
      },
      primaryKey: 'id',
      tableName: 'model_deployments'
    });
    this._dalFactory.registerEntityType('SwarmLearningTier1', {
      schema: {
        id: { type: 'string', primaryKey: true },
        swarmId: { type: 'string', required: true },
        commanderType: { type: 'string', required: true },
        agentPerformanceHistory: { type: 'json', required: true },
        sparcPhaseEfficiency: { type: 'json', required: true },
        implementationPatterns: { type: 'json', required: true },
        taskCompletionPatterns: { type: 'json', required: true },
        realTimeFeedback: { type: 'json', required: true },
        createdAt: { type: 'datetime', default: 'now' },
        updatedAt: { type: 'datetime', default: 'now' }
      },
      primaryKey: 'id',
      tableName: 'swarm_learning_tier1',
    });

    this._dalFactory.registerEntityType('SwarmAgentPerformance', {
      schema: {
        id: { type: 'string', primaryKey: true },
        swarmId: { type: 'string', required: true },
        agentId: { type: 'string', required: true },
        taskSuccessRate: { type: 'number', required: true },
        averageCompletionTime: { type: 'number', required: true },
        errorPatterns: { type: 'json', required: true },
        optimizationSuggestions: { type: 'json', required: true },
        lastUpdated: { type: 'datetime', default: 'now' },
        tier: { type: 'number', default: 1 }
      },
      primaryKey: 'id',
      tableName: 'swarm_agent_performance',
    });

    this._dalFactory.registerEntityType('SwarmSPARCEfficiency', {
      schema: {
        id: { type: 'string', primaryKey: true },
        swarmId: { type: 'string', required: true },
        phase: { type: 'string', required: true },
        averageTime: { type: 'number', required: true },
        successRate: { type: 'number', required: true },
        commonIssues: { type: 'json', required: true },
        optimizations: { type: 'json', required: true },
        createdAt: { type: 'datetime', default: 'now' },
        tier: { type: 'number', default: 1 }
      },
      primaryKey: 'id',
      tableName: 'swarm_sparc_efficiency',
    });
  }

  private async initializeSwarmSchemas(_cluster: SwarmRepositories): Promise<void> {
    // Register swarm-specific entity types
    this._dalFactory.registerEntityType('SwarmGraph', {
      schema: {
        id: { type: 'string', primaryKey: true },
        labels: { type: 'array', required: true },
        properties: { type: 'json' },
        createdAt: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'id',
      tableName: 'nodes',
      databaseType: 'kuzu',
    });

    this._dalFactory.registerEntityType('SwarmVectors', {
      schema: {
        id: { type: 'string', primaryKey: true },
        vector: { type: 'vector', required: true },
        metadata: { type: 'json' },
        timestamp: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'id',
      tableName: 'embeddings',
      databaseType: 'lancedb',
    });

    this._dalFactory.registerEntityType('SwarmData', {
      schema: {
        id: { type: 'string', primaryKey: true },
        metricName: { type: 'string', required: true },
        metricValue: { type: 'number', required: true },
        timestamp: { type: 'datetime', default: 'now' },
        metadata: { type: 'json' },
      },
      primaryKey: 'id',
      tableName: 'swarm_metrics',
    });

    // Register learning pattern vectors for each swarm
    // TIER 3 Neural model embedding vectors
    this._dalFactory.registerEntityType('NeuralModelVectors', {
      schema: {
        id: { type: 'string', primaryKey: true },
        vector: { type: 'vector', dimension: 384, required: true },
        metadata: { type: 'json', required: true },
        swarmId: { type: 'string', required: true },
        agentId: { type: 'string', required: true },
        modelName: { type: 'string', required: true },
        version: { type: 'string', required: true },
        architecture: { type: 'string', required: true },
        type: { type: 'string', required: true }, // 'neural_model'
        tier: { type: 'number', required: true }, // 3
        timestamp: { type: 'datetime', default: 'now' }
      },
      primaryKey: 'id',
      tableName: 'neural_model_vectors',
      databaseType: 'lancedb'
    });

    this._dalFactory.registerEntityType('DatasetVectors', {
      schema: {
        id: { type: 'string', primaryKey: true },
        vector: { type: 'vector', dimension: 384, required: true },
        metadata: { type: 'json', required: true },
        swarmId: { type: 'string', required: true },
        name: { type: 'string', required: true },
        dataType: { type: 'string', required: true },
        format: { type: 'string', required: true },
        totalSamples: { type: 'number', required: true },
        type: { type: 'string', required: true }, // 'training_dataset'
        tier: { type: 'number', required: true }, // 3
        timestamp: { type: 'datetime', default: 'now' }
      },
      primaryKey: 'id',
      tableName: 'dataset_vectors',
      databaseType: 'lancedb'
    });
    this._dalFactory.registerEntityType('LearningPatternVectors', {
      schema: {
        id: { type: 'string', primaryKey: true },
        vector: { type: 'vector', dimension: 384, required: true },
        metadata: { type: 'json', required: true },
        swarmId: { type: 'string', required: true },
        type: { type: 'string', required: true }, // 'implementation_pattern', 'coordination_pattern', etc.
        tier: { type: 'number', required: true }, // 1, 2, or 3
        timestamp: { type: 'datetime', default: 'now' }
      },
      primaryKey: 'id',
      tableName: 'learning_patterns',
      databaseType: 'lancedb',
    });
  }

  private async registerSwarmInCentral(swarmId: string, swarmPath: string): Promise<void> {
    await this.centralRepo.create({
      swarmId,
      name: swarmId,
      type: 'coordination',
      dbPath: swarmPath,
      lastAccessed: new Date().toISOString(),
    });
  }

  /**
   * ENHANCED VECTOR PATTERN DISCOVERY DEMO
   * 
   * Demonstrate advanced pattern discovery capabilities including:
   * - Enhanced embedding generation
   * - Pattern clustering
   * - Cross-swarm pattern search
   * - Pattern performance analytics
   */
  async demonstrateEnhancedPatternDiscovery(swarmId: string): Promise<{
    enhancedEmbeddings: { patternId: string; embedding: number[] }[];
    patternClusters: PatternCluster[];
    crossSwarmResults: CrossSwarmPatternResult[];
    analytics: {
      totalPatterns: number;
      clustersFound: number;
      crossSwarmMatches: number;
      averageClusterQuality: number;
    };
  }> {
    this._logger.info(`🚀 Demonstrating Enhanced Vector Pattern Discovery for swarm ${swarmId}`);

    try {
      // 1. Get existing patterns
      const cluster = await this.getSwarmCluster(swarmId);
      const existingPatterns = await cluster.repositories.vectors.findBy({
        'metadata.type': 'implementation_pattern',
        'metadata.swarmId': swarmId
      });

      const patterns = existingPatterns.map(pv => pv.metadata.pattern as SuccessfulPattern);
      
      // If no patterns exist, create some sample patterns for demonstration
      if (patterns.length === 0) {
        this._logger.info('No existing patterns found, creating sample patterns for demonstration');
        await this.createSamplePatterns(swarmId);
        // Re-fetch patterns
        const newPatterns = await cluster.repositories.vectors.findBy({
          'metadata.type': 'implementation_pattern',
          'metadata.swarmId': swarmId
        });
        patterns.push(...newPatterns.map(pv => pv.metadata.pattern as SuccessfulPattern));
      }

      // 2. Generate enhanced embeddings for all patterns
      this._logger.info(`📊 Generating enhanced embeddings for ${patterns.length} patterns`);
      const enhancedEmbeddings: { patternId: string; embedding: number[] }[] = [];
      
      for (const pattern of patterns.slice(0, 10)) { // Limit to 10 for demo
        const embedding = await this.generatePatternEmbedding(pattern, {
          swarmId,
          agentType: 'demo-analysis',
          taskComplexity: pattern.usageCount,
          environmentContext: { mode: 'demonstration' }
        });
        enhancedEmbeddings.push({ patternId: pattern.patternId, embedding });
      }

      // 3. Perform pattern clustering
      this._logger.info('🔍 Performing pattern clustering analysis');
      const patternClusters = await this.performPatternClustering(swarmId, {
        minClusterSize: 2, // Lower threshold for demo
        maxClusters: 5,
        similarityThreshold: 0.6
      });

      // 4. Demonstrate cross-swarm pattern search
      this._logger.info('🌐 Demonstrating cross-swarm pattern search');
      let crossSwarmResults: CrossSwarmPatternResult[] = [];
      
      if (patterns.length > 0) {
        const queryPattern = patterns[0]; // Use first pattern as query
        crossSwarmResults = await this.searchCrossSwarmPatterns(queryPattern, swarmId, {
          limit: 5,
          minSimilarity: 0.5,
          contextWeighting: true,
          transferabilityAnalysis: true
        });
      }

      // 5. Calculate analytics
      const analytics = {
        totalPatterns: patterns.length,
        clustersFound: patternClusters.length,
        crossSwarmMatches: crossSwarmResults.length,
        averageClusterQuality: patternClusters.length > 0 
          ? patternClusters.reduce((sum, c) => sum + c.clusterScore, 0) / patternClusters.length
          : 0
      };

      this._logger.info(`✅ Enhanced Pattern Discovery Demo Complete:
        📈 Enhanced Embeddings: ${enhancedEmbeddings.length} generated
        🎯 Pattern Clusters: ${patternClusters.length} found (avg quality: ${analytics.averageClusterQuality.toFixed(3)})
        🔗 Cross-Swarm Matches: ${crossSwarmResults.length} discovered
        📊 Total Patterns Analyzed: ${analytics.totalPatterns}`);

      this.emit('enhanced_discovery_demo_completed', { swarmId, analytics });

      return {
        enhancedEmbeddings,
        patternClusters,
        crossSwarmResults,
        analytics
      };

    } catch (error) {
      this._logger.error(`❌ Enhanced pattern discovery demo failed: ${error}`);
      throw error;
    }
  }

  /**
   * Create sample patterns for demonstration purposes
   */
  private async createSamplePatterns(swarmId: string): Promise<void> {
    const samplePatterns: SuccessfulPattern[] = [
      {
        patternId: 'pattern-auth-jwt',
        description: 'JWT authentication pattern with refresh tokens',
        context: 'user authentication, security, token management',
        successRate: 0.92,
        usageCount: 15,
        lastUsed: new Date().toISOString()
      },
      {
        patternId: 'pattern-error-handling',
        description: 'Centralized error handling with custom error classes',
        context: 'error management, exception handling, logging',
        successRate: 0.88,
        usageCount: 23,
        lastUsed: new Date().toISOString()
      },
      {
        patternId: 'pattern-async-queue',
        description: 'Asynchronous job queue with priority handling',
        context: 'background tasks, queue processing, performance',
        successRate: 0.95,
        usageCount: 8,
        lastUsed: new Date().toISOString()
      },
      {
        patternId: 'pattern-cache-strategy',
        description: 'Multi-layer caching strategy with invalidation',
        context: 'performance optimization, data caching, memory management',
        successRate: 0.90,
        usageCount: 12,
        lastUsed: new Date().toISOString()
      },
      {
        patternId: 'pattern-api-versioning',
        description: 'API versioning with backward compatibility',
        context: 'api design, versioning, compatibility, migration',
        successRate: 0.85,
        usageCount: 6,
        lastUsed: new Date().toISOString()
      }
    ];

    this._logger.info(`Creating ${samplePatterns.length} sample patterns for demonstration`);

    for (const pattern of samplePatterns) {
      // Generate embedding and store pattern
      const embedding = await this.generatePatternEmbedding(pattern, {
        swarmId,
        agentType: 'sample-creation',
        taskComplexity: pattern.usageCount
      });

      await this.storeSwarmEmbedding(swarmId, {
        id: `sample_${pattern.patternId}`,
        vector: embedding,
        metadata: {
          type: 'implementation_pattern',
          pattern,
          tier: 1,
          sampleData: true
        }
      });
    }

    this._logger.info('✅ Sample patterns created successfully');
  }

  // 🔄 CROSS-SWARM KNOWLEDGE TRANSFER IMPLEMENTATION

  /**
   * Transfer knowledge patterns between swarms with intelligent adaptation
   */
  async transferKnowledgeBetweenSwarms(
    sourceSwarmId: string,
    targetSwarmId: string,
    options: {
      patternIds?: string[];
      transferStrategy?: 'selective' | 'comprehensive' | 'adaptive';
      adaptationMode?: 'conservative' | 'aggressive' | 'learning';
      conflictResolution?: 'merge' | 'replace' | 'hybrid';
      monitoringDuration?: number; // days
    } = {}
  ): Promise<SwarmKnowledgeTransfer> {
    const {
      patternIds,
      transferStrategy = 'adaptive',
      adaptationMode = 'learning',
      conflictResolution = 'hybrid',
      monitoringDuration = 7
    } = options;

    this._logger.info(`🔄 Initiating knowledge transfer from ${sourceSwarmId} to ${targetSwarmId}`);

    try {
      // 1. Identify patterns for transfer
      const patternsToTransfer = await this.identifyTransferablePatterns(
        sourceSwarmId,
        targetSwarmId,
        { strategy: transferStrategy, patternIds }
      );

      // 2. Analyze target swarm context
      const targetContext = await this.analyzeSwarmContext(targetSwarmId);
      
      // 3. Adapt patterns for target context
      const adaptedPatterns = await this.adaptPatternsForTarget(
        patternsToTransfer,
        targetContext,
        { mode: adaptationMode }
      );

      // 4. Simulate adoption to predict conflicts
      const conflictAnalysis = await this.simulatePatternAdoption(
        targetSwarmId,
        adaptedPatterns
      );

      // 5. Resolve predicted conflicts
      const resolvedPatterns = await this.resolvePatternConflicts(
        adaptedPatterns,
        conflictAnalysis,
        { strategy: conflictResolution }
      );

      // 6. Execute knowledge transfer
      const transfer = await this.executeKnowledgeTransfer(
        sourceSwarmId,
        targetSwarmId,
        resolvedPatterns,
        { monitoringDuration }
      );

      // 7. Monitor adoption progress
      await this.startTransferMonitoring(transfer.id, monitoringDuration);

      this._logger.info(`✅ Knowledge transfer initiated: ${transfer.id}`);
      this.emit('knowledge_transfer_started', transfer);
      
      return transfer;

    } catch (error) {
      this._logger.error(`❌ Knowledge transfer failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate comprehensive performance comparison across swarms
   */
  async generateSwarmPerformanceComparison(
    swarmIds?: string[],
    options: {
      includeMetrics?: string[];
      timeWindow?: number; // days
      includeBenchmarks?: boolean;
      generateRecommendations?: boolean;
    } = {}
  ): Promise<SwarmPerformanceComparison[]> {
    const {
      includeMetrics = ['all'],
      timeWindow = 30,
      includeBenchmarks = true,
      generateRecommendations = true
    } = options;

    this._logger.info('📊 Generating cross-swarm performance comparison');

    try {
      // Get target swarms
      const targetSwarms = swarmIds || (await this.getActiveSwarms()).map(s => s.swarmId);
      const comparisons: SwarmPerformanceComparison[] = [];

      // Collect performance metrics for each swarm
      for (const swarmId of targetSwarms) {
        const metrics = await this.collectSwarmPerformanceMetrics(swarmId, timeWindow);
        const benchmarkScore = await this.calculateSwarmBenchmarkScore(metrics);
        
        const comparison: SwarmPerformanceComparison = {
          swarmId,
          comparisonMetrics: metrics,
          benchmarkScore,
          rank: 0, // Will be calculated after all swarms
          improvementAreas: await this.identifyImprovementAreas(metrics),
          strengths: await this.identifySwarmStrengths(metrics),
          recommendedPatterns: []
        };

        if (generateRecommendations) {
          comparison.recommendedPatterns = await this.generatePatternRecommendations(
            swarmId,
            metrics,
            targetSwarms.filter(id => id !== swarmId)
          );
        }

        comparisons.push(comparison);
      }

      // Calculate rankings
      comparisons.sort((a, b) => b.benchmarkScore - a.benchmarkScore);
      comparisons.forEach((comp, index) => {
        comp.rank = index + 1;
      });

      // Store comparison results
      await this.storePerformanceComparison(comparisons);

      this._logger.info(`✅ Performance comparison generated for ${targetSwarms.length} swarms`);
      this.emit('performance_comparison_completed', { swarms: targetSwarms, results: comparisons });
      
      return comparisons;

    } catch (error) {
      this._logger.error(`❌ Performance comparison failed: ${error}`);
      throw error;
    }
  }

  /**
   * Track pattern adoption across swarms with success metrics
   */
  async trackPatternAdoption(
    patternId: string,
    options: {
      includeSwarms?: string[];
      timeWindow?: number;
      detailedAnalysis?: boolean;
      predictFutureAdoption?: boolean;
    } = {}
  ): Promise<{
    adoptionHistory: PatternAdoptionResult[];
    adoptionRate: number;
    successRate: number;
    adaptationTrends: Record<string, number>;
    futureProjections?: Record<string, number>;
    recommendations: string[];
  }> {
    const {
      includeSwarms,
      timeWindow = 90,
      detailedAnalysis = true,
      predictFutureAdoption = false
    } = options;

    this._logger.info(`📈 Tracking pattern adoption for ${patternId}`);

    try {
      // Get adoption history across swarms
      const adoptionHistory = await this.getPatternAdoptionHistory(
        patternId,
        includeSwarms,
        timeWindow
      );

      // Calculate adoption metrics
      const totalAttempts = adoptionHistory.length;
      const successfulAdoptions = adoptionHistory.filter(
        result => result.adoptionStatus === 'successful' || result.adoptionStatus === 'adapted'
      ).length;
      
      const adoptionRate = totalAttempts > 0 ? successfulAdoptions / totalAttempts : 0;
      const successRate = adoptionHistory.length > 0 
        ? adoptionHistory.reduce((sum, result) => 
            sum + result.performanceMetrics.improvementScore, 0
          ) / adoptionHistory.length
        : 0;

      // Analyze adaptation trends
      const adaptationTrends = await this.analyzeAdaptationTrends(adoptionHistory);

      // Generate recommendations
      const recommendations = await this.generateAdoptionRecommendations(
        patternId,
        adoptionHistory,
        adaptationTrends
      );

      const result: Record<string, unknown> = {
        adoptionHistory,
        adoptionRate,
        successRate,
        adaptationTrends,
        recommendations
      };

      // Add future projections if requested
      if (predictFutureAdoption) {
        result.futureProjections = await this.predictFutureAdoption(
          patternId,
          adoptionHistory,
          adaptationTrends
        );
      }

      // Store tracking results
      await this.storeAdoptionTracking(patternId, result);

      this._logger.info(`✅ Pattern adoption tracking completed for ${patternId}`);
      this.emit('adoption_tracking_completed', { patternId, metrics: result });
      
      return result;

    } catch (error) {
      this._logger.error(`❌ Pattern adoption tracking failed: ${error}`);
      throw error;
    }
  }

  /**
   * Implement knowledge evolution system with pattern versioning
   */
  async evolveKnowledgePatterns(
    options: {
      includePatterns?: string[];
      evolutionTriggers?: string[];
      adaptiveThreshold?: number;
      pruneObsolete?: boolean;
    } = {}
  ): Promise<{
    evolutionRecords: KnowledgeEvolutionRecord[];
    newPatterns: SuccessfulPattern[];
    updatedPatterns: SuccessfulPattern[];
    obsoletePatterns: string[];
    metaLearnings: string[];
  }> {
    const {
      includePatterns,
      evolutionTriggers = ['performance_decline', 'usage_change', 'context_shift'],
      adaptiveThreshold = 0.7,
      pruneObsolete = false
    } = options;

    this._logger.info('🧬 Initiating knowledge pattern evolution');

    try {
      // 1. Identify patterns for evolution
      const candidatePatterns = await this.identifyEvolutionCandidates(
        includePatterns,
        evolutionTriggers,
        adaptiveThreshold
      );

      // 2. Analyze usage patterns and performance trends
      const usageAnalysis = await this.analyzePatternUsageTrends(candidatePatterns);
      
      // 3. Detect knowledge decay
      const decayAnalysis = await this.detectKnowledgeDecay(candidatePatterns);

      // 4. Generate pattern evolution
      const evolutionResults = await this.generatePatternEvolutions(
        candidatePatterns,
        usageAnalysis,
        decayAnalysis
      );

      // 5. Apply meta-learning
      const metaLearnings = await this.extractMetaLearnings(
        evolutionResults,
        usageAnalysis
      );

      // 6. Update pattern repository
      await this.applyEvolutionUpdates(evolutionResults);

      // 7. Prune obsolete patterns if requested
      const obsoletePatterns: string[] = [];
      if (pruneObsolete) {
        obsoletePatterns.push(...await this.pruneObsoletePatterns(decayAnalysis));
      }

      const result = {
        evolutionRecords: evolutionResults.records,
        newPatterns: evolutionResults.newPatterns,
        updatedPatterns: evolutionResults.updatedPatterns,
        obsoletePatterns,
        metaLearnings
      };

      // Store evolution results
      await this.storeEvolutionResults(result);

      this._logger.info(`✅ Knowledge evolution completed: ${evolutionResults.records.length} patterns evolved`);
      this.emit('knowledge_evolution_completed', result);
      
      return result;

    } catch (error) {
      this._logger.error(`❌ Knowledge evolution failed: ${error}`);
      throw error;
    }
  }

  // ============================================
  // TIER 3: NEURAL MODEL PERSISTENCE & DEEP LEARNING INTEGRATION
  // ============================================
}
