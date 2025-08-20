/**
 * @fileoverview Knowledge Package - Cross-Agent Intelligence and Knowledge Management System
 * 
 * **ENTERPRISE-GRADE KNOWLEDGE MANAGEMENT & COLLECTIVE INTELLIGENCE PLATFORM**
 * 
 * Advanced cross-agent knowledge sharing and collective intelligence system for
 * collaborative reasoning, distributed learning, and knowledge synthesis across
 * multiple AI agents and domains. Built for enterprise-scale knowledge management
 * with semantic understanding, federated learning, and intelligent knowledge curation.
 * 
 * **⚠️ RECOMMENDED USAGE: Access via @claude-zen/foundation Package**
 * 
 * While this package can be used directly, it is recommended to access knowledge
 * functionality through `@claude-zen/foundation` which provides integrated knowledge
 * management with telemetry, logging, and configuration management.
 * 
 * **CORE COLLECTIVE INTELLIGENCE CAPABILITIES:**
 * - 🧠 **Collective Intelligence**: Multi-agent collaborative reasoning and decision-making
 * - 🔄 **Cross-Agent Knowledge Sharing**: Real-time knowledge exchange between agents
 * - 📚 **Distributed Learning**: Federated learning across agent networks
 * - 🎯 **Knowledge Synthesis**: Automated knowledge aggregation and distillation
 * - 🌐 **Cross-Domain Transfer**: Knowledge transfer between different problem domains
 * - 📊 **Performance Optimization**: AI-driven knowledge management optimization
 * - 💾 **Knowledge Persistence**: Long-term memory and knowledge storage
 * - 🔧 **Foundation Integration**: Complete @claude-zen/foundation support
 * 
 * **ADVANCED KNOWLEDGE FEATURES:**
 * - Semantic knowledge graphs with ontology management
 * - Natural language knowledge extraction and processing
 * - Multi-modal knowledge integration (text, code, diagrams, data)
 * - Temporal knowledge tracking with version control
 * - Collaborative knowledge validation and peer review
 * - Knowledge quality scoring and reputation systems
 * - Automated knowledge discovery and pattern recognition
 * - Real-time knowledge streaming and event-driven updates
 * 
 * **ENTERPRISE COLLECTIVE INTELLIGENCE FEATURES:**
 * - Multi-tenant knowledge isolation with strict security boundaries
 * - Enterprise-grade knowledge governance and compliance frameworks
 * - Advanced analytics for knowledge utilization and effectiveness
 * - Integration with external knowledge bases and repositories
 * - Distributed consensus algorithms for collaborative decision-making
 * - Knowledge workflow automation and approval processes
 * - Comprehensive audit trails for knowledge operations
 * - Performance optimization through intelligent knowledge caching
 * - Circuit breaker protection and graceful degradation strategies
 * - Knowledge backup, recovery, and disaster recovery capabilities
 * 
 * @example Basic Collective Intelligence Setup
 * ```typescript
 * import { IntelligenceHub } from '@claude-zen/knowledge';
 * 
 * const coordinator = new IntelligenceHub({
 *   maxAgents: 10,
 *   consensusThreshold: 0.8,
 *   enableDistributedLearning: true
 * });
 * 
 * await coordinator.initialize();
 * 
 * // Add agents with different expertise
 * await coordinator.addAgent({
 *   id: 'expert-1',
 *   expertise: ['machine-learning', 'data-science'],
 *   knowledgeLevel: 0.9
 * });
 * 
 * await coordinator.addAgent({
 *   id: 'expert-2', 
 *   expertise: ['software-architecture', 'system-design'],
 *   knowledgeLevel: 0.85
 * });
 * 
 * // Collaborative problem solving
 * const solution = await coordinator.solveCollectively({
 *   problem: 'Design scalable microservices architecture',
 *   context: { requirements, constraints },
 *   timeoutMs: 300000
 * });
 * ```
 * 
 * @example Cross-Domain Knowledge Transfer
 * ```typescript
 * import { CrossAgentKnowledgeIntegration } from '@claude-zen/knowledge';
 * 
 * const integration = new CrossAgentKnowledgeIntegration({
 *   enableCrossDomainTransfer: true,
 *   knowledgeValidation: 'strict',
 *   transferEfficiencyThreshold: 0.7
 * });
 * 
 * // Transfer knowledge from ML domain to NLP domain
 * const transferResult = await integration.transferKnowledge({
 *   sourceDomain: 'machine-learning',
 *   targetDomain: 'natural-language-processing',
 *   knowledgeType: 'optimization-strategies',
 *   context: {
 *     sourceExperience: mlOptimizationHistory,
 *     targetRequirements: nlpPerformanceGoals
 *   }
 * });
 * 
 * console.log(`Transfer efficiency: ${transferResult.efficiency}%`);
 * console.log(`Applicable patterns: ${transferResult.applicablePatterns.length}`);
 * ```
 * 
 * @example Distributed Learning Network
 * ```typescript
 * import { DistributedLearningSystem } from '@claude-zen/knowledge';
 * 
 * const learningSystem = new DistributedLearningSystem({
 *   networkTopology: 'federated',
 *   learningRate: 0.01,
 *   aggregationStrategy: 'weighted-average',
 *   privacyPreservation: true
 * });
 * 
 * // Create distributed learning session
 * const session = await learningSystem.createSession({
 *   taskType: 'classification',
 *   participants: [
 *     { agentId: 'agent-1', dataSize: 1000, contribution: 0.3 },
 *     { agentId: 'agent-2', dataSize: 1500, contribution: 0.45 },
 *     { agentId: 'agent-3', dataSize: 800, contribution: 0.25 }
 *   ],
 *   convergenceCriteria: { minAccuracy: 0.95, maxIterations: 100 }
 * });
 * 
 * // Execute federated learning
 * const result = await session.execute();
 * console.log(`Final accuracy: ${result.accuracy}`);
 * console.log(`Convergence iterations: ${result.iterations}`);
 * ```
 * 
 * @example Knowledge Quality Management
 * ```typescript
 * import { KnowledgeValidator } from '@claude-zen/knowledge';
 * 
 * const qualityManager = new KnowledgeValidator({
 *   validationRules: ['consistency', 'accuracy', 'relevance'],
 *   qualityThreshold: 0.8,
 *   automaticPruning: true
 * });
 * 
 * // Validate and assess knowledge quality
 * const assessment = await qualityManager.assessKnowledge({
 *   knowledgeBase: existingKnowledge,
 *   newKnowledge: incomingKnowledge,
 *   context: validationContext
 * });
 * 
 * if (assessment.quality >= 0.8) {
 *   await qualityManager.integrateKnowledge(incomingKnowledge);
 * } else {
 *   await qualityManager.flagForReview(incomingKnowledge, assessment.issues);
 * }
 * ```
 * 
 * @example Enterprise Knowledge Management System
 * ```typescript
 * import { 
 *   IntelligenceHub,
 *   KnowledgeValidator,
 *   IntelligenceCoordinationSystem,
 *   PerformanceOptimizer 
 * } from '@claude-zen/knowledge';
 * 
 * // Create enterprise knowledge management system
 * const enterpriseKnowledge = new IntelligenceHub({
 *   maxAgents: 100,
 *   consensusThreshold: 0.9,
 *   enableDistributedLearning: true,
 *   multiTenant: {
 *     enabled: true,
 *     isolation: 'strict',
 *     crossTenantSharing: false
 *   },
 *   security: {
 *     encryption: 'AES-256-GCM',
 *     auditTrail: 'comprehensive',
 *     accessControl: 'rbac'
 *   },
 *   performance: {
 *     caching: 'intelligent',
 *     prefetching: true,
 *     compression: 'lz4'
 *   }
 * });
 * 
 * // Add quality management layer
 * const qualityManager = new KnowledgeValidator({
 *   validationRules: ['consistency', 'accuracy', 'relevance', 'freshness'],
 *   qualityThreshold: 0.85,
 *   automaticPruning: true,
 *   peerReview: {
 *     enabled: true,
 *     requiredReviewers: 3,
 *     expertiseMatching: true
 *   }
 * });
 * 
 * // Intelligence coordination for expert routing
 * const intelligenceCoordinator = new IntelligenceCoordinationSystem({
 *   expertiseDiscovery: 'automatic',
 *   specializationEmergence: true,
 *   crossDomainTransfer: true,
 *   loadBalancing: 'weighted-round-robin'
 * });
 * 
 * // Performance optimization layer
 * const perfOptimizer = new PerformanceOptimizer({
 *   knowledgeCaching: {
 *     strategy: 'lru-with-predictive-prefetch',
 *     size: '10GB',
 *     ttl: 3600000 // 1 hour
 *   },
 *   queryOptimization: {
 *     enableIndexing: true,
 *     semanticCompression: true,
 *     parallelExecution: true
 *   }
 * });
 * 
 * // Enterprise knowledge processing workflow
 * const processingResult = await enterpriseKnowledge.processEnterpriseKnowledge({
 *   domain: 'financial-services',
 *   knowledgeTypes: ['regulatory-compliance', 'risk-assessment', 'market-analysis'],
 *   requirements: {
 *     compliance: ['SOX', 'GDPR', 'PCI-DSS'],
 *     security: 'classified',
 *     auditLevel: 'comprehensive'
 *   },
 *   performance: {
 *     latencyTarget: '100ms',
 *     throughputTarget: '10000/min',
 *     availabilityTarget: '99.99%'
 *   }
 * });
 * ```
 * 
 * @example Real-Time Knowledge Synchronization
 * ```typescript
 * import { 
 *   DistributedLearningSystem,
 *   KnowledgeSwarm,
 *   CrossAgentKnowledgeIntegration 
 * } from '@claude-zen/knowledge';
 * 
 * // Create real-time knowledge synchronization system
 * const knowledgeSync = new DistributedLearningSystem({
 *   networkTopology: 'federated-hierarchical',
 *   learningRate: 0.001,
 *   aggregationStrategy: 'weighted-average-with-expertise',
 *   privacyPreservation: {
 *     enabled: true,
 *     method: 'differential-privacy',
 *     epsilonBudget: 0.1
 *   },
 *   realTimeSync: {
 *     enabled: true,
 *     syncInterval: 1000, // 1 second
 *     conflictResolution: 'expertise-weighted'
 *   }
 * });
 * 
 * // Knowledge swarm for collective intelligence
 * const knowledgeSwarm = new KnowledgeSwarm({
 *   swarmSize: 50,
 *   specializations: [
 *     'natural-language-processing',
 *     'computer-vision', 
 *     'reinforcement-learning',
 *     'knowledge-graphs',
 *     'semantic-reasoning'
 *   ],
 *   coordination: {
 *     consensusAlgorithm: 'practical-byzantine-fault-tolerance',
 *     leaderElection: 'expertise-based',
 *     taskDistribution: 'capability-aware'
 *   }
 * });
 * 
 * // Cross-agent knowledge integration
 * const integration = new CrossAgentKnowledgeIntegration({
 *   enableCrossDomainTransfer: true,
 *   knowledgeValidation: 'peer-review-with-ai',
 *   transferEfficiencyThreshold: 0.8,
 *   integration: {
 *     factIntegration: {
 *       enabled: true,
 *       knowledgeSwarmIntegration: true,
 *       realTimeFactChecking: true
 *     },
 *     ragIntegration: {
 *       enabled: true,
 *       vectorStoreIntegration: true,
 *       semanticIndexing: true
 *     }
 *   }
 * });
 * 
 * // Continuous learning session
 * const learningSession = await knowledgeSync.createContinuousLearningSession({
 *   domain: 'multi-modal-ai',
 *   participants: await knowledgeSwarm.getSpecialists(['nlp', 'cv', 'kg']),
 *   objectives: {
 *     accuracyTarget: 0.95,
 *     convergenceTime: 3600000, // 1 hour
 *     knowledgeRetention: 0.9
 *   },
 *   constraints: {
 *     privacyBudget: 0.05,
 *     computeBudget: '100 GPU-hours',
 *     networkBandwidth: '1Gbps'
 *   }
 * });
 * 
 * // Execute with real-time monitoring
 * const result = await learningSession.executeWithMonitoring({
 *   monitoringInterval: 5000, // 5 seconds
 *   adaptiveLearningRate: true,
 *   earlyStoppingEnabled: true
 * });
 * 
 * console.log('Continuous Learning Results:', {
 *   finalAccuracy: result.accuracy,
 *   convergenceTime: result.convergenceTime,
 *   knowledgeTransferred: result.transferredBytes,
 *   participantContributions: result.contributions
 * });
 * ```
 * 
 * @example Advanced Knowledge Analytics and Insights
 * ```typescript
 * import { 
 *   KnowledgeValidator,
 *   PerformanceOptimizer,
 *   IntelligenceCoordinationSystem 
 * } from '@claude-zen/knowledge';
 * 
 * // Create advanced knowledge analytics system
 * const analytics = new KnowledgeValidator({
 *   validationRules: [
 *     'consistency', 'accuracy', 'relevance', 'freshness',
 *     'completeness', 'trustworthiness', 'citations'
 *   ],
 *   qualityThreshold: 0.9,
 *   automaticPruning: true,
 *   analytics: {
 *     realTimeScoring: true,
 *     trendAnalysis: true,
 *     predictiveQuality: true,
 *     anomalyDetection: true
 *   },
 *   reporting: {
 *     dashboards: ['quality-overview', 'knowledge-gaps', 'contributor-metrics'],
 *     alerts: {
 *       qualityDegradation: true,
 *       knowledgeGaps: true,
 *       expertiseImbalance: true
 *     }
 *   }
 * });
 * 
 * // Performance optimization with intelligent caching
 * const perfOptimizer = new PerformanceOptimizer({
 *   knowledgeCaching: {
 *     strategy: 'adaptive-lru-with-semantic-clustering',
 *     size: '50GB',
 *     ttl: 7200000, // 2 hours
 *     prefetchingEnabled: true,
 *     compressionRatio: 0.3
 *   },
 *   queryOptimization: {
 *     enableSemanticIndexing: true,
 *     parallelQueryExecution: true,
 *     adaptiveQueryPlanning: true,
 *     resultCaching: true
 *   },
 *   networkOptimization: {
 *     contentDistributionNetwork: true,
 *     edgeCaching: true,
 *     bandwidthOptimization: true
 *   }
 * });
 * 
 * // Intelligence coordination for expert discovery
 * const intelligenceCoord = new IntelligenceCoordinationSystem({
 *   expertiseDiscovery: {
 *     algorithm: 'graph-based-clustering',
 *     updateFrequency: 'real-time',
 *     confidenceThreshold: 0.8
 *   },
 *   specializationEmergence: {
 *     enabled: true,
 *     detectionWindow: 604800000, // 1 week
 *     significanceThreshold: 0.7
 *   },
 *   routingOptimization: {
 *     strategy: 'multi-objective-optimization',
 *     objectives: ['expertise-match', 'load-balance', 'latency'],
 *     weights: [0.5, 0.3, 0.2]
 *   }
 * });
 * 
 * // Comprehensive knowledge insights generation
 * const insights = await analytics.generateComprehensiveInsights({
 *   timeRange: '30d',
 *   domains: ['ai-research', 'software-engineering', 'business-strategy'],
 *   includeMetrics: {
 *     qualityTrends: true,
 *     expertiseMapping: true,
 *     knowledgeFlows: true,
 *     performanceMetrics: true,
 *     predictionAccuracy: true
 *   },
 *   analysis: {
 *     gapAnalysis: true,
 *     redundancyDetection: true,
 *     expertiseImbalance: true,
 *     emergingTopics: true,
 *     crossDomainOpportunities: true
 *   }
 * });
 * 
 * console.log('Knowledge System Insights:', {
 *   overallQualityScore: insights.quality.overall,
 *   knowledgeGaps: insights.gaps.length,
 *   expertiseDistribution: insights.expertise.distribution,
 *   performanceMetrics: {
 *     averageQueryLatency: insights.performance.queryLatency,
 *     cacheHitRatio: insights.performance.cacheHitRatio,
 *     knowledgeUtilization: insights.performance.utilization
 *   },
 *   recommendations: insights.recommendations,
 *   emergingTrends: insights.trends.emerging
 * });
 * ```
 * 
 * @example Knowledge Graph Construction and Reasoning
 * ```typescript
 * import { 
 *   KnowledgeSwarm,
 *   ProjectContextAnalyzer,
 *   ReasoningEngine 
 * } from '@claude-zen/knowledge';
 * 
 * // Create knowledge graph construction system
 * const knowledgeGraphBuilder = new KnowledgeSwarm({
 *   swarmSize: 20,
 *   specializations: [
 *     'entity-extraction',
 *     'relation-discovery', 
 *     'semantic-linking',
 *     'ontology-alignment',
 *     'knowledge-validation'
 *   ],
 *   graphConstruction: {
 *     strategy: 'incremental-distributed',
 *     consistencyLevel: 'eventual',
 *     conflictResolution: 'consensus-based'
 *   },
 *   reasoning: {
 *     inferenceEngine: 'probabilistic-logic',
 *     uncertaintyHandling: 'bayesian',
 *     temporalReasoning: true
 *   }
 * });
 * 
 * // Project context analyzer for domain understanding
 * const contextAnalyzer = new ProjectContextAnalyzer({
 *   analysisDepth: 'comprehensive',
 *   domainSpecialization: {
 *     enabled: true,
 *     domains: ['technology', 'business', 'science', 'healthcare'],
 *     adaptiveSpecialization: true
 *   },
 *   contextualEmbedding: {
 *     model: 'transformer-xl',
 *     dimensions: 2048,
 *     contextWindow: 32768
 *   }
 * });
 * 
 * // Collaborative reasoning for complex problem solving
 * const reasoningEngine = new ReasoningEngine({
 *   reasoningStrategies: [
 *     'deductive-reasoning',
 *     'inductive-reasoning',
 *     'abductive-reasoning',
 *     'analogical-reasoning',
 *     'causal-reasoning'
 *   ],
 *   collaboration: {
 *     consensusThreshold: 0.85,
 *     diversityBonus: 0.1,
 *     expertiseWeighting: true
 *   },
 *   problemDecomposition: {
 *     enabled: true,
 *     maxDepth: 5,
 *     parallelSolving: true
 *   }
 * });
 * 
 * // Build comprehensive knowledge graph
 * const knowledgeGraph = await knowledgeGraphBuilder.buildKnowledgeGraph({
 *   dataSources: [
 *     'scientific-papers',
 *     'technical-documentation',
 *     'code-repositories',
 *     'expert-interviews',
 *     'structured-databases'
 *   ],
 *   domain: 'artificial-intelligence',
 *   scope: {
 *     temporalRange: '2020-2024',
 *     geographicalScope: 'global',
 *     languageScope: ['en', 'zh', 'es', 'fr', 'de']
 *   },
 *   construction: {
 *     entityExtraction: {
 *       precision: 0.95,
 *       recall: 0.90,
 *       supportedTypes: ['person', 'organization', 'concept', 'method', 'tool']
 *     },
 *     relationExtraction: {
 *       confidenceThreshold: 0.8,
 *       supportedRelations: ['influences', 'derives-from', 'applies-to', 'contradicts']
 *     }
 *   }
 * });
 * 
 * // Perform collaborative reasoning
 * const reasoningResult = await reasoningEngine.solveCollectively({
 *   problem: {
 *     description: 'Optimize distributed machine learning training efficiency',
 *     context: knowledgeGraph,
 *     constraints: {
 *       computeResources: 'limited',
 *       networkBandwidth: 'high-latency',
 *       dataPrivacy: 'required'
 *     }
 *   },
 *   collaboration: {
 *     maxParticipants: 15,
 *     timeLimit: 1800000, // 30 minutes
 *     qualityThreshold: 0.9
 *   }
 * });
 * 
 * console.log('Knowledge Graph Reasoning Results:', {
 *   graphStatistics: {
 *     nodes: knowledgeGraph.nodeCount,
 *     edges: knowledgeGraph.edgeCount,
 *     domains: knowledgeGraph.domainCoverage
 *   },
 *   reasoningQuality: {
 *     consensus: reasoningResult.consensus,
 *     confidence: reasoningResult.confidence,
 *     novelty: reasoningResult.noveltyScore
 *   },
 *   solution: {
 *     approaches: reasoningResult.approaches.length,
 *     feasibility: reasoningResult.feasibilityScore,
 *     recommendations: reasoningResult.recommendations
 *   }
 * });
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 * 
 * @see {@link https://github.com/zen-neural/claude-code-zen} Claude Code Zen Documentation
 * @see {@link ./src/main} Main Implementation
 * 
 * @requires @claude-zen/foundation - Core utilities and infrastructure
 * @requires @claude-zen/brain - Neural intelligence integration
 * @requires @claude-zen/event-system - Knowledge event coordination
 * 
 * @packageDocumentation
 */

// Collaborative Reasoning Types
/**
 * @file Knowledge module exports.
 */

export type {
  CollaborativeSolution,
  ConsensusResult,
  DistributedReasoningResult,
  Problem,
  ProblemDecomposition,
} from './src/collaborative-reasoning-engine';
export { CollaborativeReasoningEngine } from './src/collaborative-reasoning-engine';
export { CollaborativeReasoningEngine as ReasoningEngine } from './src/collaborative-reasoning-engine';
// Collective Intelligence Types
export type {
  AgentContribution,
  AggregatedKnowledge,
  CollectiveDecision,
  DecisionContext,
  KnowledgeExchangeProtocol,
  KnowledgePacket,
  WorkDistributionResult,
} from './src/collective-intelligence-coordinator';
// Core Collective Intelligence Systems  
export { CollectiveIntelligenceCoordinator } from './src/collective-intelligence-coordinator';
export { CollectiveIntelligenceCoordinator as IntelligenceHub } from './src/collective-intelligence-coordinator';
// Type Definitions - Main Configuration Types
// Type Definitions - Result Types
// Type Definitions - Request Types
export type {
  CollectiveKnowledgeResponse,
  CollectiveProcessingOptions,
  ComponentHealth,
  CrossAgentKnowledgeConfig,
  CrossDomainTransferRequest,
  CrossDomainTransferResult,
  DistributedLearningRequest,
  DistributedLearningResult,
  FACTIntegrationConfig,
  IntegrationConfig,
  IntegrationMetrics,
  IntegrationStatus,
  KnowledgeProcessingResult,
  KnowledgeQuery,
  RAGIntegrationConfig,
  SystemStatus,
} from './src/cross-agent-knowledge-integration';
// Main Integration System
export {
  CrossAgentKnowledgeIntegration,
  createCrossAgentKnowledgeIntegration,
  getDefaultConfig as getDefaultKnowledgeConfig,
} from './src/cross-agent-knowledge-integration';
// Distributed Learning Types
export type {
  CollectiveExperienceAggregation,
  FederatedLearningRound,
  KnowledgeTransferResult,
  ModelSnapshot,
  ModelSynchronizationResult,
} from './src/distributed-learning-system';
export { DistributedLearningSystem } from './src/distributed-learning-system';
// Intelligence Coordination Types
export type {
  CrossDomainTransferResult as IntelligenceTransferResult,
  ExpertiseDiscoveryResult,
  ExpertiseProfile,
  RoutingResult,
  SpecializationEmergenceResult,
} from './src/intelligence-coordination-system';
export { IntelligenceCoordinationSystem } from './src/intelligence-coordination-system';
export { KnowledgeClient } from './src/knowledge-client';
// export { KnowledgeProcessor } from './src/knowledge-processor';
// Quality Management Types
export type {
  ContributionRecord,
  KnowledgeItem,
  QualityMonitoringReport,
  ReputationScore,
  ReviewResult,
  ValidationResult,
} from './src/knowledge-quality-management';
export { KnowledgeQualityManagementSystem } from './src/knowledge-quality-management';
export { KnowledgeQualityManagementSystem as KnowledgeValidator } from './src/knowledge-quality-management';
// export { KnowledgeStorage } from './src/knowledge-storage';
// Existing Knowledge System Types
export type {
  KnowledgeSwarmConfig,
  SwarmAgent,
  SwarmQuery,
  SwarmResult,
} from './src/knowledge-swarm';
// Existing Knowledge Systems (for integration)
export { KnowledgeSwarm } from './src/knowledge-swarm';
// Performance Optimization Types
export type {
  CacheOptimizationResult,
  KnowledgeRequest,
  KnowledgeSharingOptimization,
  KnowledgeSharingRequest,
  OptimizedKnowledgeResponse,
} from './src/performance-optimization-system';
export { PerformanceOptimizationSystem } from './src/performance-optimization-system';
export { PerformanceOptimizationSystem as PerformanceOptimizer } from './src/performance-optimization-system';
export { ProjectContextAnalyzer } from './src/project-context-analyzer';
// Storage Backends
export { SQLiteBackend } from './src/storage-backends/sqlite-backend';

// Knowledge Domain Error Classes
export {
  BaseKnowledgeError,
  FACTError,
  FACTStorageError,
  FACTGatheringError,
  FACTProcessingError,
  RAGError,
  RAGVectorError,
  RAGEmbeddingError,
  RAGRetrievalError,
  isRecoverableKnowledgeError,
  getKnowledgeErrorSeverity,
  createKnowledgeError
} from './src/errors';
export type { KnowledgeErrorContext } from './src/errors';

// Direct error class exports for easy access
export * from './src/errors.js';
// export { StorageInterface } from './src/storage-interface';

/**
 * Factory Functions for Easy System Creation.
 */

/**
 * Create a complete cross-agent knowledge sharing system.
 *
 * @param config
 * @param logger
 * @param eventBus
 * @example
 */
export async function createKnowledgeSharingSystem(
  config?: unknown,
  logger?: unknown,
  eventBus?: unknown
): Promise<unknown> {
  const { CrossAgentKnowledgeIntegration, getDefaultConfig } = await import(
    './cross-agent-knowledge-integration'
  );

  // Use provided config or create default
  const finalConfig = config
    ? { ...getDefaultConfig(), ...config }
    : getDefaultConfig();

  // Create logger and event bus if not provided
  const finalLogger = logger || console;
  const finalEventBus =
    eventBus || new (await import('node:events')).EventEmitter();

  const system = new CrossAgentKnowledgeIntegration(
    finalConfig,
    finalLogger,
    finalEventBus
  );
  await system.initialize();

  return system;
}

/**
 * Create a knowledge swarm system.
 *
 * @param config
 * @param vectorDb
 * @example
 */
export async function createKnowledgeSwarm(config?: unknown): Promise<unknown> {
  const { initializeFACTSwarm } = await import('./knowledge-swarm');
  return initializeFACTSwarm(config);
}

/**
 * Utility Functions.
 */

/**
 * Validate cross-agent knowledge configuration.
 *
 * @param config
 * @example
 */
export function validateKnowledgeConfig(config: unknown): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate collective intelligence config
  if (!config?.collectiveIntelligence) {
    errors.push('Missing collectiveIntelligence configuration');
  }

  // Validate integration config
  if (config?.integration) {
    if (
      config?.integration?.factIntegration?.enabled &&
      !config?.integration?.factIntegration?.knowledgeSwarmIntegration
    ) {
      warnings.push(
        'FACT integration enabled but knowledge swarm integration disabled'
      );
    }

    if (
      config?.integration?.ragIntegration?.enabled &&
      !config?.integration?.ragIntegration?.vectorStoreIntegration
    ) {
      warnings.push(
        'RAG integration enabled but vector store integration disabled'
      );
    }
  } else {
    errors.push('Missing integration configuration');
  }

  // Validate distributed learning config
  if (config?.distributedLearning?.federatedConfig) {
    const fedConfig = config?.distributedLearning?.federatedConfig;
    if (fedConfig?.clientFraction > 1.0 || fedConfig?.clientFraction <= 0) {
      errors.push('federatedConfig.clientFraction must be between 0 and 1');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get system capabilities based on configuration.
 *
 * @param config
 * @example
 */
export function getSystemCapabilities(config: unknown): {
  collectiveIntelligence: boolean;
  distributedLearning: boolean;
  collaborativeReasoning: boolean;
  crossDomainTransfer: boolean;
  qualityManagement: boolean;
  performanceOptimization: boolean;
  factIntegration: boolean;
  ragIntegration: boolean;
} {
  return {
    collectiveIntelligence: !!config?.collectiveIntelligence,
    distributedLearning: !!config?.distributedLearning,
    collaborativeReasoning: !!config?.collaborativeReasoning,
    crossDomainTransfer: !!config?.intelligenceCoordination,
    qualityManagement: !!config?.qualityManagement,
    performanceOptimization: !!config?.performanceOptimization,
    factIntegration: config?.integration?.factIntegration?.enabled,
    ragIntegration: config?.integration?.ragIntegration?.enabled,
  };
}

/**
 * Helper function to create minimal configuration for testing.
 *
 * @example
 */
export function createTestConfig(): unknown {
  const defaultConfig = {} as any;

  return {
    ...defaultConfig,
    integration: {
      ...defaultConfig?.integration,
      factIntegration: {
        ...defaultConfig?.integration?.factIntegration,
        enabled: false, // Disable for testing
      },
      ragIntegration: {
        ...defaultConfig?.integration?.ragIntegration,
        enabled: false, // Disable for testing
      },
    },
  };
}

/**
 * Storage and Persistence Utilities.
 */

/**
 * Check if storage directory exists and create if needed.
 *
 * @param basePath
 * @example
 */
export async function ensureStorageDirectory(
  basePath: string = process.cwd()
): Promise<{
  swarmDir: string;
  hiveMindDir: string;
  knowledgeDir: string;
  cacheDir: string;
}> {
  const path = await import('node:path');
  const fs = await import('node:fs/promises');

  const swarmDir = path.join(basePath, '.swarm');
  const hiveMindDir = path.join(basePath, '.hive-mind');
  const knowledgeDir = path.join(basePath, '.knowledge');
  const cacheDir = path.join(basePath, '.cache', 'knowledge');

  // Create directories if they don't exist
  await fs.mkdir(swarmDir, { recursive: true });
  await fs.mkdir(hiveMindDir, { recursive: true });
  await fs.mkdir(knowledgeDir, { recursive: true });
  await fs.mkdir(cacheDir, { recursive: true });

  return {
    swarmDir,
    hiveMindDir,
    knowledgeDir,
    cacheDir,
  };
}

/**
 * Get storage paths for knowledge systems.
 *
 * @param basePath
 * @example
 */
export function getKnowledgeStoragePaths(basePath: string = process.cwd()): {
  collective: string;
  distributed: string;
  collaborative: string;
  intelligence: string;
  quality: string;
  performance: string;
} {
  const path = require('node:path');

  return {
    collective: path.join(basePath, '.hive-mind', 'collective-intelligence'),
    distributed: path.join(basePath, '.swarm', 'distributed-learning'),
    collaborative: path.join(basePath, '.hive-mind', 'collaborative-reasoning'),
    intelligence: path.join(basePath, '.swarm', 'intelligence-coordination'),
    quality: path.join(basePath, '.knowledge', 'quality-management'),
    performance: path.join(basePath, '.cache', 'performance-optimization'),
  };
}

/**
 * Main Integration System Class is exported above.
 * Default export pointing to the main class for convenience.
 */
