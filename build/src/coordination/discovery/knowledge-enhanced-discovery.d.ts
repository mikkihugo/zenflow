/**
 * @file Knowledge-Aware Domain Discovery
 * Uses Hive Knowledge System to improve domain discovery accuracy and efficiency.
 *
 * Features:
 * - Leverages universal knowledge from Hive FACT for domain patterns
 * - Applies learned patterns from other projects and swarms
 * - Real-time knowledge integration during discovery process
 * - Confidence boosting through knowledge validation.
 */
import { EventEmitter } from 'node:events';
import type { DiscoveredDomain } from '../../interfaces/tui/types.ts';
import type { SessionMemoryStore } from '../../memory/memory.ts';
import type { HiveFACTSystem } from '../hive-fact-integration.ts';
import type { SwarmKnowledgeSync } from '../swarm/knowledge-sync.ts';
export interface KnowledgeAwareConfig {
    swarmId: string;
    useHiveFACT?: boolean;
    useSwarmKnowledge?: boolean;
    knowledgeWeight?: number;
    confidenceThreshold?: number;
    maxKnowledgeQueries?: number;
}
export interface DomainKnowledge {
    domain: string;
    patterns: DomainPattern[];
    bestPractices: string[];
    commonPitfalls: string[];
    relatedDomains: string[];
    toolRecommendations: string[];
    confidenceScore: number;
    source: 'hive-fact' | 'swarm-learning' | 'external-mcp';
}
export interface DomainPattern {
    id: string;
    name: string;
    description: string;
    indicators: {
        filePatterns: string[];
        directoryStructures: string[];
        dependencies: string[];
        keywords: string[];
    };
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    agentTypes: string[];
    complexity: 'low' | 'medium' | 'high';
    confidenceScore: number;
    usageCount: number;
    successRate: number;
}
export interface KnowledgeAwareDomain extends DiscoveredDomain {
    relatedDomains?: string[];
    knowledgeInsights: {
        appliedPatterns: DomainPattern[];
        knowledgeScore: number;
        recommendedTopology: string;
        recommendedAgents: string[];
        riskFactors: string[];
        optimizations: string[];
    };
}
export interface KnowledgeDiscoveryContext {
    projectType: string;
    technologies: string[];
    size: 'small' | 'medium' | 'large' | 'enterprise';
    complexity: 'simple' | 'moderate' | 'complex' | 'highly-complex';
    domains: string[];
    existingPatterns: string[];
}
/**
 * Improves domain discovery with knowledge from Hive FACT and swarm learning.
 *
 * @example
 */
export declare class KnowledgeAwareDiscovery extends EventEmitter {
    private config;
    private hiveFact;
    private swarmKnowledge;
    private memoryStore;
    private appliedPatterns;
    constructor(config: KnowledgeAwareConfig, hiveFact?: HiveFACTSystem, swarmKnowledge?: SwarmKnowledgeSync, memoryStore?: SessionMemoryStore);
    /**
     * Apply knowledge insights to domain discovery.
     *
     * @param originalDomains
     * @param context
     */
    applyKnowledgeInsights(originalDomains: DiscoveredDomain[], context: KnowledgeDiscoveryContext): Promise<KnowledgeAwareDomain[]>;
    /**
     * Load relevant knowledge for project context.
     *
     * @param context
     */
    private loadProjectKnowledge;
    /**
     * Query Hive FACT for domain-specific knowledge.
     *
     * @param domain
     * @param context
     */
    private queryHiveFACTForDomain;
    /**
     * Query swarm knowledge for domain patterns.
     *
     * @param domain
     * @param context
     */
    private querySwarmKnowledgeForDomain;
    /**
     * Query technology-specific patterns.
     *
     * @param technology
     * @param _context
     */
    private queryTechnologyPatterns;
    /**
     * Apply knowledge to individual domain.
     *
     * @param domain
     * @param projectKnowledge
     * @param _context
     */
    private applyDomainKnowledge;
    /**
     * Apply cross-domain knowledge and relationships.
     *
     * @param domains
     * @param projectKnowledge
     */
    private applyCrossDomainKnowledge;
    /**
     * Convert Hive FACT results to domain knowledge.
     *
     * @param domain
     * @param facts
     * @param source
     */
    private convertFactsToDomainKnowledge;
    /**
     * Convert swarm knowledge to domain knowledge.
     *
     * @param domain
     * @param swarmData
     * @param source
     */
    private convertSwarmKnowledgeToDomainKnowledge;
    /**
     * Find best matching knowledge for domain.
     *
     * @param domain
     * @param projectKnowledge
     */
    private findBestMatchingKnowledge;
    private selectRelevantPatterns;
    private calculateKnowledgeScore;
    private getTopologyRecommendation;
    private getAgentRecommendations;
    private identifyRiskFactors;
    private generateOptimizations;
    private calculateKnowledgeAwareConfidence;
    private adjustConfidenceWithKnowledge;
    private storeKnowledgeAwareResults;
    private createMinimalKnowledgeInsights;
    private extractPatternsFromContent;
    private extractPatternsFromSwarmData;
    private calculateAverageConfidence;
    private calculateDomainSimilarity;
    private calculateDomainRelationshipStrength;
    private applyCrossDomainOptimizations;
    private mergeKnowledge;
    private getMostCommon;
}
export default KnowledgeAwareDiscovery;
//# sourceMappingURL=knowledge-enhanced-discovery.d.ts.map