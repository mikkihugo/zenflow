/**
 * Cross-Agent Knowledge Sharing Index.
 * Central export point for all collective intelligence and knowledge sharing systems.
 */
/**
 * @file Knowledge module exports.
 */
export type { CollaborativeSolution, ConsensusResult, DistributedReasoningResult, Problem, ProblemDecomposition, } from './collaborative-reasoning-engine.ts';
export { CollaborativeReasoningEngine } from './collaborative-reasoning-engine.ts';
export type { AgentContribution, AggregatedKnowledge, CollectiveDecision, DecisionContext, KnowledgeExchangeProtocol, KnowledgePacket, WorkDistributionResult, } from './collective-intelligence-coordinator.ts';
export { CollectiveIntelligenceCoordinator } from './collective-intelligence-coordinator.ts';
export type { CollectiveKnowledgeResponse, CollectiveProcessingOptions, ComponentHealth, CrossAgentKnowledgeConfig, CrossDomainTransferRequest, CrossDomainTransferResult, DistributedLearningRequest, DistributedLearningResult, FACTIntegrationConfig, IntegrationConfig, IntegrationMetrics, IntegrationStatus, KnowledgeProcessingResult, KnowledgeQuery, RAGIntegrationConfig, SystemStatus, } from './cross-agent-knowledge-integration.ts';
export { CrossAgentKnowledgeIntegration, createCrossAgentKnowledgeIntegration, getDefaultConfig as getDefaultKnowledgeConfig, } from './cross-agent-knowledge-integration.ts';
export type { CollectiveExperienceAggregation, FederatedLearningRound, KnowledgeTransferResult, ModelSnapshot, ModelSynchronizationResult, } from './distributed-learning-system.ts';
export { DistributedLearningSystem } from './distributed-learning-system.ts';
export type { CrossDomainTransferResult as IntelligenceTransferResult, ExpertiseDiscoveryResult, ExpertiseProfile, RoutingResult, SpecializationEmergenceResult, } from './intelligence-coordination-system.ts';
export { IntelligenceCoordinationSystem } from './intelligence-coordination-system.ts';
export { KnowledgeClient } from './knowledge-client.ts';
export type { ContributionRecord, KnowledgeItem, QualityMonitoringReport, ReputationScore, ReviewResult, ValidationResult, } from './knowledge-quality-management.ts';
export { KnowledgeQualityManagementSystem } from './knowledge-quality-management.ts';
export type { KnowledgeSwarmConfig, SwarmAgent, SwarmQuery, SwarmResult, } from './knowledge-swarm.ts';
export { KnowledgeSwarm } from './knowledge-swarm.ts';
export type { CacheOptimizationResult, KnowledgeRequest, KnowledgeSharingOptimization, KnowledgeSharingRequest, OptimizedKnowledgeResponse, } from './performance-optimization-system.ts';
export { PerformanceOptimizationSystem } from './performance-optimization-system.ts';
export { ProjectContextAnalyzer } from './project-context-analyzer.ts';
export { SQLiteBackend } from './storage-backends/sqlite-backend.ts';
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
export declare function createKnowledgeSharingSystem(config?: any, logger?: any, eventBus?: any): Promise<any>;
/**
 * Create a knowledge swarm system.
 *
 * @param config
 * @param vectorDb
 * @example
 */
export declare function createKnowledgeSwarm(config?: any): Promise<any>;
/**
 * Utility Functions.
 */
/**
 * Validate cross-agent knowledge configuration.
 *
 * @param config
 * @example
 */
export declare function validateKnowledgeConfig(config: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Get system capabilities based on configuration.
 *
 * @param config
 * @example
 */
export declare function getSystemCapabilities(config: any): {
    collectiveIntelligence: boolean;
    distributedLearning: boolean;
    collaborativeReasoning: boolean;
    crossDomainTransfer: boolean;
    qualityManagement: boolean;
    performanceOptimization: boolean;
    factIntegration: boolean;
    ragIntegration: boolean;
};
/**
 * Helper function to create minimal configuration for testing.
 *
 * @example
 */
export declare function createTestConfig(): any;
/**
 * Storage and Persistence Utilities.
 */
/**
 * Check if storage directory exists and create if needed.
 *
 * @param basePath
 * @example
 */
export declare function ensureStorageDirectory(basePath?: string): Promise<{
    swarmDir: string;
    hiveMindDir: string;
    knowledgeDir: string;
    cacheDir: string;
}>;
/**
 * Get storage paths for knowledge systems.
 *
 * @param basePath
 * @example
 */
export declare function getKnowledgeStoragePaths(basePath?: string): {
    collective: string;
    distributed: string;
    collaborative: string;
    intelligence: string;
    quality: string;
    performance: string;
};
/**
 * Main Integration System Class is exported above.
 * Default export pointing to the main class for convenience.
 */
//# sourceMappingURL=index.d.ts.map