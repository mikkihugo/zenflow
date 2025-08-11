/**
 * Cross-Agent Knowledge Integration Layer.
 * Main integration system that connects all collective intelligence components.
 *
 * Architecture: Unified integration layer with FACT/RAG system compatibility
 * - System Integration: Connect all cross-agent knowledge sharing components
 * - FACT/RAG Integration: Seamless integration with existing knowledge systems
 * - Performance Monitoring: Comprehensive monitoring and metrics collection
 * - Error Handling: Robust error handling and recovery mechanisms
 * - Configuration Management: Centralized configuration and system management.
 */
/**
 * @file Cross-agent-knowledge-integration implementation.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
import type { CollaborativeReasoningConfig } from './collaborative-reasoning-engine.ts';
import type { CollectiveIntelligenceConfig } from './collective-intelligence-coordinator.ts';
import type { DistributedLearningConfig, ErrorHandlingConfig } from './distributed-learning-system.ts';
import type { IntelligenceCoordinationConfig } from './intelligence-coordination-system.ts';
import type { KnowledgeQualityConfig } from './knowledge-quality-management.ts';
import type { MonitoringConfig, PerformanceOptimizationConfig } from './performance-optimization-system.ts';
/**
 * Main Integration Configuration.
 *
 * @example
 */
export interface CrossAgentKnowledgeConfig {
    collectiveIntelligence: CollectiveIntelligenceConfig;
    distributedLearning: DistributedLearningConfig;
    collaborativeReasoning: CollaborativeReasoningConfig;
    intelligenceCoordination: IntelligenceCoordinationConfig;
    qualityManagement: KnowledgeQualityConfig;
    performanceOptimization: PerformanceOptimizationConfig;
    integration: IntegrationConfig;
}
export interface PerformanceTrackingConfig {
    enabled: boolean;
    metricsCollection: boolean;
    performanceThresholds: Record<string, number>;
    alertingEnabled: boolean;
    reportingInterval: number;
}
export interface IntegrationConfig {
    factIntegration: FACTIntegrationConfig;
    ragIntegration: RAGIntegrationConfig;
    performanceTracking: PerformanceTrackingConfig;
    errorHandling: ErrorHandlingConfig;
    monitoring: MonitoringConfig;
}
export interface FACTIntegrationConfig {
    enabled: boolean;
    knowledgeSwarmIntegration: boolean;
    processorIntegration: boolean;
    storageIntegration: boolean;
    crossValidation: boolean;
    knowledgeAugmentation: boolean;
}
export interface RAGIntegrationConfig {
    enabled: boolean;
    vectorStoreIntegration: boolean;
    embeddingEnhancement: boolean;
    retrievalOptimization: boolean;
    contextEnrichment: boolean;
    semanticValidation: boolean;
}
/**
 * Integration Result Types.
 *
 * @example
 */
export interface IntegrationStatus {
    systemStatus: SystemStatus;
    componentHealth: ComponentHealth[];
    performanceMetrics: IntegrationPerformanceMetrics;
    activeConnections: ActiveConnection[];
    errorCount: number;
    lastHealthCheck: number;
}
export interface SystemStatus {
    status: 'healthy' | 'degraded' | 'critical' | 'offline';
    uptime: number;
    version: string;
    componentsInitialized: number;
    totalComponents: number;
    memoryUsage: number;
    cpuUsage: number;
}
export interface ComponentHealth {
    componentName: string;
    status: 'healthy' | 'degraded' | 'critical' | 'offline';
    lastCheck: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
    availability: number;
}
export interface KnowledgeProcessingResult {
    processingId: string;
    originalQuery: KnowledgeQuery;
    collectiveResponse: CollectiveKnowledgeResponse;
    factsGathered: number;
    ragResults: number;
    consensusScore: number;
    qualityScore: number;
    processingTime: number;
    optimizationApplied: OptimizationSummary;
    timestamp: number;
}
export interface CollectiveKnowledgeResponse {
    primaryResponse: string;
    supportingEvidence: Evidence[];
    alternativeViewpoints: AlternativeViewpoint[];
    confidenceScore: number;
    sources: KnowledgeSource[];
    emergentInsights: EmergentInsight[];
    qualityMetrics: QualityMetrics;
}
/**
 * Main Cross-Agent Knowledge Integration System.
 *
 * @example
 */
export declare class CrossAgentKnowledgeIntegration extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private collectiveIntelligence;
    private distributedLearning;
    private collaborativeReasoning;
    private intelligenceCoordination;
    private qualityManagement;
    private performanceOptimization;
    private isInitialized;
    private componentStatus;
    private activeProcessing;
    private integrationMetrics;
    constructor(config: CrossAgentKnowledgeConfig, logger: ILogger, eventBus: IEventBus);
    /**
     * Initialize the complete cross-agent knowledge integration system.
     */
    initialize(): Promise<void>;
    /**
     * Process knowledge query using collective intelligence.
     *
     * @param query
     * @param options
     */
    processKnowledgeCollectively(query: KnowledgeQuery, options?: CollectiveProcessingOptions): Promise<KnowledgeProcessingResult>;
    /**
     * Coordinate distributed learning across agents.
     *
     * @param learningRequest
     */
    coordinateDistributedLearning(learningRequest: DistributedLearningRequest): Promise<DistributedLearningResult>;
    /**
     * Facilitate cross-domain knowledge transfer.
     *
     * @param transferRequest
     */
    facilitateCrossDomainTransfer(transferRequest: CrossDomainTransferRequest): Promise<CrossDomainTransferResult>;
    /**
     * Get comprehensive integration metrics.
     */
    getIntegrationMetrics(): Promise<IntegrationMetrics>;
    /**
     * Get current system status.
     */
    getSystemStatus(): Promise<IntegrationStatus>;
    /**
     * Shutdown the integration system gracefully.
     */
    shutdown(): Promise<void>;
    private initializeCoreComponents;
    private setupInterComponentCommunication;
    private integrateWithExistingSystems;
    private integrateFACTSystems;
    private integrateRAGSystems;
    private setupMonitoringAndHealthChecks;
    private performHealthCheck;
    private startPerformanceOptimization;
    private gatherFactsCollectively;
    private enhanceWithRAG;
    private getSystemHealth;
    private applyCollaborativeReasoning;
    private validateKnowledgeQuality;
    private generateCollectiveResponse;
    private applyResponseOptimizations;
    private getOptimizationSummary;
    private storeProcessingResult;
    private calculateLearningImprovement;
    private getComponentMetrics;
    private getPerformanceMetrics;
    private getIntegrationSpecificMetrics;
    private getCollectiveIntelligenceMetrics;
    private getActiveConnections;
    private getErrorCount;
    private validateTransferApplicability;
    private validateTransferQuality;
    private distributeModel;
}
/**
 * Configuration and result type definitions.
 *
 * @example
 */
export interface KnowledgeQuery {
    id: string;
    content: string;
    type: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    metadata: any;
}
export interface CollectiveProcessingOptions {
    useDistributedReasoning?: boolean;
    requireConsensus?: boolean;
    qualityThreshold?: number;
    optimizePerformance?: boolean;
    validateResults?: boolean;
}
export interface DistributedLearningRequest {
    participants: any[];
    globalModel: any;
    experiences: any[];
    models: any[];
    type: string;
    syncStrategy: string;
}
export interface CrossDomainTransferRequest {
    sourceDomain: string;
    targetDomain: string;
    transferType: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface IntegrationMetrics {
    systemHealth: any;
    componentMetrics: any;
    performance: any;
    integration: any;
    collective: any;
}
export interface DistributedLearningResult {
    learningId: string;
    federatedResult: any;
    experienceAggregation: any;
    modelSync: any;
    intelligenceEvolution: any;
    overallImprovement: any;
    learningTime: number;
    timestamp: number;
}
export interface CrossDomainTransferResult {
    transferId: string;
    intelligenceTransfer: any;
    transferValidation: any;
    qualityAssurance: any;
    performanceOptimization: any;
    overallSuccess: boolean;
    transferTime: number;
    timestamp: number;
}
export interface KnowledgeProcessingTask {
    id: string;
    status: string;
    startTime: number;
}
export interface IntegrationMetric {
    name: string;
    value: number;
    timestamp: number;
}
export interface ActiveConnection {
    id: string;
    type: string;
    status: string;
    lastActivity: number;
}
export interface IntegrationPerformanceMetrics {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
}
export interface Evidence {
    type: string;
    content: string;
    confidence: number;
    source: string;
}
export interface AlternativeViewpoint {
    viewpoint: string;
    supporting_evidence: Evidence[];
    confidence: number;
}
export interface KnowledgeSource {
    id: string;
    type: string;
    reliability: number;
    metadata: any;
}
export interface EmergentInsight {
    insight: string;
    emergence_score: number;
    supporting_patterns: string[];
}
export interface QualityMetrics {
    accuracy: number;
    completeness: number;
    consistency: number;
    reliability: number;
}
export interface OptimizationSummary {
    optimizations_applied: string[];
    performance_improvement: number;
    resource_savings: number;
}
/**
 * Factory function to create and initialize the integration system.
 *
 * @param config
 * @param logger
 * @param eventBus
 * @example
 */
export declare function createCrossAgentKnowledgeIntegration(config: CrossAgentKnowledgeConfig, logger: ILogger, eventBus: IEventBus): Promise<CrossAgentKnowledgeIntegration>;
/**
 * Default configuration for cross-agent knowledge integration.
 *
 * @example
 */
export declare function getDefaultConfig(): CrossAgentKnowledgeConfig;
export default CrossAgentKnowledgeIntegration;
//# sourceMappingURL=cross-agent-knowledge-integration.d.ts.map