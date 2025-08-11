/**
 * Knowledge Evolution System for Continuous Learning.
 *
 * Manages continuous learning from swarm interactions, pattern-based knowledge base updates,
 * expertise evolution tracking, best practice emergence, and anti-pattern detection.
 */
/**
 * @file Knowledge-evolution implementation.
 */
import { EventEmitter } from 'node:events';
import type { AgentBehavior } from './behavioral-optimization.ts';
import type { ExecutionPattern } from './pattern-recognition-engine.ts';
import type { PatternCluster } from './types.ts';
export interface KnowledgeBase {
    id: string;
    domain: string;
    version: string;
    knowledge: KnowledgeItem[];
    metadata: KnowledgeMetadata;
    lastUpdated: number;
    evolutionHistory: Evolution[];
}
export interface KnowledgeItem {
    id: string;
    type: 'fact' | 'rule' | 'pattern' | 'best_practice' | 'anti_pattern' | 'expertise';
    content: string;
    confidence: number;
    evidence: Evidence[];
    relationships: Relationship[];
    tags: string[];
    applicability: Applicability;
    createdAt: number;
    lastVerified: number;
}
export interface KnowledgeMetadata {
    totalItems: number;
    avgConfidence: number;
    domains: string[];
    coverage: number;
    reliability: number;
    recency: number;
}
export interface Evidence {
    id: string;
    type: 'pattern' | 'behavior' | 'outcome' | 'expert_validation';
    source: string;
    strength: number;
    timestamp: number;
    context: Record<string, any>;
}
export interface Relationship {
    type: 'depends_on' | 'conflicts_with' | 'enhances' | 'implies' | 'generalizes';
    targetId: string;
    strength: number;
    confidence: number;
}
export interface Applicability {
    contexts: string[];
    conditions: string[];
    limitations: string[];
    prerequisites: string[];
}
export interface Evolution {
    id: string;
    type: 'creation' | 'update' | 'merge' | 'split' | 'deprecation' | 'validation';
    timestamp: number;
    description: string;
    trigger: EvolutionTrigger;
    impact: EvolutionImpact;
    changes: Change[];
}
export interface EvolutionTrigger {
    type: 'pattern_discovery' | 'performance_change' | 'conflict_resolution' | 'expert_input' | 'validation_failure';
    source: string;
    confidence: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface EvolutionImpact {
    itemsAffected: number;
    confidenceChange: number;
    coverageChange: number;
    performanceImpact: number;
    stabilityImpact: number;
}
export interface Change {
    itemId: string;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
}
export interface ExpertiseProfile {
    agentId: string;
    domain: string;
    level: number;
    skills: Skill[];
    experience: Experience[];
    specializations: string[];
    adaptability: number;
    reliability: number;
    knowledgeContributions: number;
    lastAssessment: number;
}
export interface Skill {
    name: string;
    proficiency: number;
    confidence: number;
    evidence: Evidence[];
    developmentTrend: 'improving' | 'stable' | 'declining';
}
export interface Experience {
    taskType: string;
    completions: number;
    successRate: number;
    avgPerformance: number;
    complexityHandled: number;
    lastExperience: number;
}
export interface BestPractice {
    id: string;
    name: string;
    description: string;
    applicableContexts: string[];
    effectiveness: number;
    adoption: number;
    evidence: Evidence[];
    variations: BestPracticeVariation[];
    emergencePattern: EmergencePattern;
}
export interface BestPracticeVariation {
    id: string;
    description: string;
    context: string;
    effectiveness: number;
    usage: number;
}
export interface EmergencePattern {
    discoveryDate: number;
    discoveryTrigger: string;
    evolutionStages: string[];
    adoptionRate: number;
    stabilityIndicators: Record<string, number>;
}
export interface AntiPattern {
    id: string;
    name: string;
    description: string;
    harmfulEffects: string[];
    detectionCriteria: string[];
    prevalence: number;
    severity: number;
    alternatives: string[];
    preventionStrategies: string[];
}
export declare class KnowledgeEvolution extends EventEmitter {
    private knowledgeBases;
    private expertiseProfiles;
    private bestPractices;
    private antiPatterns;
    private evolutionQueue;
    private config;
    constructor(config?: KnowledgeEvolutionConfig);
    /**
     * Learn from swarm interactions and update knowledge base.
     *
     * @param patterns
     * @param behaviors
     * @param domain
     */
    learnFromInteractions(patterns: ExecutionPattern[], behaviors: AgentBehavior[], domain?: string): Promise<KnowledgeLearningResult>;
    /**
     * Update knowledge base with pattern-based insights.
     *
     * @param patternClusters
     * @param domain
     */
    updateKnowledgeFromPatterns(patternClusters: PatternCluster[], domain?: string): Promise<void>;
    /**
     * Track expertise evolution for agents.
     *
     * @param agentId
     * @param patterns
     * @param domain
     */
    trackExpertiseEvolution(agentId: string, patterns: ExecutionPattern[], domain?: string): Promise<ExpertiseEvolution>;
    /**
     * Identify and codify emerging best practices.
     *
     * @param patterns
     * @param minEffectiveness
     * @param minOccurrences
     */
    identifyBestPractices(patterns: ExecutionPattern[], minEffectiveness?: number, minOccurrences?: number): Promise<BestPractice[]>;
    /**
     * Detect and catalog anti-patterns.
     *
     * @param patterns
     * @param behaviors
     */
    detectAntiPatterns(patterns: ExecutionPattern[], behaviors: AgentBehavior[]): Promise<AntiPattern[]>;
    /**
     * Validate and maintain knowledge consistency.
     *
     * @param knowledgeBase
     */
    validateKnowledgeConsistency(knowledgeBase: KnowledgeBase): Promise<ConsistencyReport>;
    /**
     * Evolve knowledge base based on new evidence.
     *
     * @param domain
     * @param trigger
     * @param evidence
     */
    evolveKnowledgeBase(domain: string, trigger: EvolutionTrigger, evidence: Evidence[]): Promise<Evolution>;
    /**
     * Get knowledge recommendations based on context.
     *
     * @param context
     */
    getKnowledgeRecommendations(context: RecommendationContext): KnowledgeRecommendation[];
    /**
     * Export knowledge for transfer learning.
     *
     * @param domain
     * @param format
     */
    exportKnowledge(domain: string, format?: 'json' | 'rdf' | 'ontology'): KnowledgeExport;
    private extractKnowledgeFromPatterns;
    private identifyEmergentPatterns;
    private detectBestPractices;
    private clusterPatternsByPractice;
    private codifyBestPractice;
    private groupSimilarFailures;
    private identifyAntiPattern;
    private detectBehavioralAntiPatterns;
    private detectKnowledgeConflicts;
    private detectRuleConflict;
    private detectFactConflict;
    private calculateOverallPerformance;
    private getOrCreateKnowledgeBase;
    private getOrCreateExpertiseProfile;
    private createTimeWindows;
    private extractEmergenceContext;
    private generateEvolutionId;
    private determineEvolutionType;
    private generateEvolutionDescription;
    private calculateEvolutionImpact;
    private createNewKnowledge;
    private updateExistingKnowledge;
    private mergeKnowledgeItems;
    private splitKnowledgeItems;
    private deprecateKnowledge;
    private validateKnowledgeItems;
    private extractCharacteristics;
    private calculatePatternSimilarity;
    private initializeDefaultKnowledgeBases;
    private startContinuousEvolution;
    private processEvolutionQueue;
    private validateAllKnowledgeBases;
    private decayExpertise;
    getKnowledgeBase(domain: string): KnowledgeBase | undefined;
    getAllKnowledgeBases(): KnowledgeBase[];
    getExpertiseProfile(agentId: string): ExpertiseProfile | undefined;
    getBestPractices(): BestPractice[];
    getAntiPatterns(): AntiPattern[];
    private groupPatternsByType;
    private extractRuleFromPatterns;
    private extractFactsFromPatterns;
    private patternToEvidence;
    private calculateFailureSeverity;
    private calculateFailureSimilarity;
    private extractFailureCauses;
    private generatePracticeName;
    private generatePracticeDescription;
    private extractApplicableContexts;
    private generateAntiPatternName;
    private generateAntiPatternDescription;
    private extractHarmfulEffects;
    private generateDetectionCriteria;
    private suggestAlternatives;
    private generatePreventionStrategies;
    private identifyCommonBehavioralIssues;
    private detectInconsistencies;
    private identifyOutdatedKnowledge;
    private validateEvidence;
    private generateConsistencyRecommendations;
    private applyAutomaticFixes;
    private updateKnowledgeBase;
    private updateSkillsFromPatterns;
    private updateExperienceFromPatterns;
    private updateExpertiseProfiles;
    private calculateExpertiseLevel;
    private identifyEvolutionFactors;
    private findRelevantKnowledgeBases;
    private findApplicableKnowledge;
    private calculateRelevance;
    private determineRecommendationType;
    private assessApplicability;
    private generateReasoningExplanation;
    private serializeKnowledge;
    private evidenceToKnowledgeItem;
    private findRelevantKnowledgeItems;
    private recalculateConfidence;
    private areItemsSimilar;
    private mergeItems;
    private isEvidenceRelevant;
    private validateItemWithEvidence;
    private addOrUpdateKnowledgeItem;
    private createKnowledgeItemFromCluster;
}
interface KnowledgeEvolutionConfig {
    maxKnowledgeItems?: number;
    confidenceThreshold?: number;
    evolutionInterval?: number;
    validationInterval?: number;
    expertiseDecayRate?: number;
    knowledgeRetentionPeriod?: number;
    bestPracticeThreshold?: number;
    antiPatternThreshold?: number;
}
interface KnowledgeLearningResult {
    domain: string;
    newKnowledge: KnowledgeItem[];
    updatedKnowledge: KnowledgeItem[];
    emergentPatterns: EmergentPattern[];
    bestPracticesIdentified: BestPractice[];
    antiPatternsDetected: AntiPattern[];
    expertiseUpdates: ExpertiseUpdate[];
}
interface EmergentPattern {
    type: string;
    emergenceTime: number;
    frequency: number;
    growthRate: number;
    confidence: number;
    context: Record<string, any>;
}
interface ExpertiseEvolution {
    agentId: string;
    domain: string;
    change: number;
    newLevel: number;
    factors: string[];
}
interface ExpertiseUpdate {
    agentId: string;
    skill: string;
    change: number;
    evidence: Evidence[];
}
interface KnowledgeConflict {
    type: string;
    item1Id: string;
    item2Id: string;
    description: string;
    severity: number;
    resolution: string;
}
interface KnowledgeInconsistency {
    type: string;
    description: string;
    itemIds: string[];
    severity: number;
}
interface OutdatedKnowledge {
    itemId: string;
    age: number;
    lastVerified: number;
    confidence: number;
    reason: string;
}
interface ValidationResult {
    itemId: string;
    type: string;
    severity: string;
    description: string;
    recommendation: string;
}
interface ConsistencyReport {
    knowledgeBaseId: string;
    conflicts: KnowledgeConflict[];
    inconsistencies: KnowledgeInconsistency[];
    outdatedItems: OutdatedKnowledge[];
    validationResults: ValidationResult[];
    recommendations: string[];
}
interface RecommendationContext {
    domain?: string;
    taskType?: string;
    agentId?: string;
    swarmId?: string;
    complexity?: number;
    constraints?: Record<string, any>;
}
interface KnowledgeRecommendation {
    type: string;
    knowledgeItem: KnowledgeItem;
    relevance: number;
    confidence: number;
    applicability: number;
    reasoning: string;
}
interface KnowledgeExport {
    domain: string;
    format: string;
    timestamp: number;
    version: string;
    data: any;
    metadata: {
        itemCount: number;
        avgConfidence: number;
        coverage: number;
        exportSize: number;
    };
}
export default KnowledgeEvolution;
//# sourceMappingURL=knowledge-evolution.d.ts.map