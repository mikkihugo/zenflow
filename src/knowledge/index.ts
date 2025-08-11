/**
 * Cross-Agent Knowledge Sharing Index.
 * Central export point for all collective intelligence and knowledge sharing systems.
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
} from './collaborative-reasoning-engine.ts';
export { CollaborativeReasoningEngine } from './collaborative-reasoning-engine.ts';
// Collective Intelligence Types
export type {
  AgentContribution,
  AggregatedKnowledge,
  CollectiveDecision,
  DecisionContext,
  KnowledgeExchangeProtocol,
  KnowledgePacket,
  WorkDistributionResult,
} from './collective-intelligence-coordinator.ts';
// Core Collective Intelligence Systems
export { CollectiveIntelligenceCoordinator } from './collective-intelligence-coordinator.ts';
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
} from './cross-agent-knowledge-integration.ts';
// Main Integration System
export {
  CrossAgentKnowledgeIntegration,
  createCrossAgentKnowledgeIntegration,
  getDefaultConfig as getDefaultKnowledgeConfig,
} from './cross-agent-knowledge-integration.ts';
// Distributed Learning Types
export type {
  CollectiveExperienceAggregation,
  FederatedLearningRound,
  KnowledgeTransferResult,
  ModelSnapshot,
  ModelSynchronizationResult,
} from './distributed-learning-system.ts';
export { DistributedLearningSystem } from './distributed-learning-system.ts';
// Intelligence Coordination Types
export type {
  CrossDomainTransferResult as IntelligenceTransferResult,
  ExpertiseDiscoveryResult,
  ExpertiseProfile,
  RoutingResult,
  SpecializationEmergenceResult,
} from './intelligence-coordination-system.ts';
export { IntelligenceCoordinationSystem } from './intelligence-coordination-system.ts';
export { KnowledgeClient } from './knowledge-client.ts';
// export { KnowledgeProcessor } from './knowledge-processor.ts';
// Quality Management Types
export type {
  ContributionRecord,
  KnowledgeItem,
  QualityMonitoringReport,
  ReputationScore,
  ReviewResult,
  ValidationResult,
} from './knowledge-quality-management.ts';
export { KnowledgeQualityManagementSystem } from './knowledge-quality-management.ts';
// export { KnowledgeStorage } from './knowledge-storage.ts';
// Existing Knowledge System Types
export type {
  KnowledgeSwarmConfig,
  SwarmAgent,
  SwarmQuery,
  SwarmResult,
} from './knowledge-swarm.ts';
// Existing Knowledge Systems (for integration)
export { KnowledgeSwarm } from './knowledge-swarm.ts';
// Performance Optimization Types
export type {
  CacheOptimizationResult,
  KnowledgeRequest,
  KnowledgeSharingOptimization,
  KnowledgeSharingRequest,
  OptimizedKnowledgeResponse,
} from './performance-optimization-system.ts';
export { PerformanceOptimizationSystem } from './performance-optimization-system.ts';
export { ProjectContextAnalyzer } from './project-context-analyzer.ts';
// Storage Backends
export { SQLiteBackend } from './storage-backends/sqlite-backend.ts';
// export { StorageInterface } from './storage-interface.ts';

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
  config?: any,
  logger?: any,
  eventBus?: any,
): Promise<any> {
  const { CrossAgentKnowledgeIntegration, getDefaultConfig } = await import(
    './cross-agent-knowledge-integration.ts'
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
    finalEventBus,
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
export async function createKnowledgeSwarm(config?: any): Promise<any> {
  const { initializeFACTSwarm } = await import('./knowledge-swarm.ts');
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
export function validateKnowledgeConfig(config: any): {
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
        'FACT integration enabled but knowledge swarm integration disabled',
      );
    }

    if (
      config?.integration?.ragIntegration?.enabled &&
      !config?.integration?.ragIntegration?.vectorStoreIntegration
    ) {
      warnings.push(
        'RAG integration enabled but vector store integration disabled',
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
export function getSystemCapabilities(config: any): {
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
export function createTestConfig(): any {
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
  basePath: string = process.cwd(),
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
