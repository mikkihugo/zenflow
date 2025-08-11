/**
 * @file Progressive Confidence Builder for Domain Discovery
 * Builds confidence in domain discovery through iterations with human validation.
 * Integrates with HiveFACT for online research and MCP memory for persistence.
 */
import { EventEmitter } from 'node:events';
import type { AGUIInterface } from '../../interfaces/agui/agui-adapter.ts';
import type { SessionMemoryStore } from '../../memory/memory.ts';
import type { DiscoveredDomain, DomainDiscoveryBridge } from './domain-discovery-bridge.ts';
export interface LearningEvent {
    timestamp: number;
    type: 'document_import' | 'human_validation' | 'online_research' | 'confidence_update' | 'domain_refinement';
    data: any;
    confidenceBefore: number;
    confidenceAfter: number;
    source: string;
}
export interface ConfidenceMetrics {
    overall: number;
    documentCoverage: number;
    humanValidations: number;
    researchDepth: number;
    domainClarity: number;
    consistency: number;
}
export interface ValidationQuestion {
    id: string;
    type: 'relevance' | 'boundary' | 'relationship' | 'naming' | 'priority' | 'checkpoint' | 'review';
    question: string;
    context: any;
    options?: string[];
    allowCustom?: boolean;
    confidence: number;
    priority?: 'critical' | 'high' | 'medium' | 'low';
    validationReason?: string;
    expectedImpact?: number;
}
export interface ResearchResult {
    query: string;
    sources: string[];
    insights: string[];
    confidence: number;
    relevantDomains: string[];
}
export interface ConfidentDomainMap {
    domains: Map<string, ConfidentDomain>;
    relationships: DomainRelationship[];
    confidence: ConfidenceMetrics;
    learningHistory: LearningEvent[];
    validationCount: number;
    researchCount: number;
}
export interface ConfidentDomain {
    /** Unique domain identifier. */
    id: string;
    /** Domain name derived from analysis. */
    name: string;
    /** Domain description based on documents and code. */
    description: string;
    /** Overall confidence score (0-1) compatible with DiscoveredDomain. */
    confidence: number;
    /** Detailed confidence metrics. */
    detailedConfidence: ConfidenceMetrics;
    /** Associated document paths. */
    documents: string[];
    /** Associated code file paths. */
    codeFiles: string[];
    /** Extracted concepts from documents. */
    concepts: string[];
    /** Domain directory path. */
    path: string;
    /** Files associated with this domain. */
    files: string[];
    /** Suggested concepts for the domain. */
    suggestedConcepts: string[];
    /** Technologies detected in the domain. */
    technologies: string[];
    /** Related domains. */
    relatedDomains: string[];
    /** Domain category (e.g., 'coordination', 'neural', 'memory'). */
    category: string;
    /** Suggested swarm topology for this domain. */
    suggestedTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    /** Suggested agents for this domain. */
    suggestedAgents: string[];
    /** Human validation records. */
    validations: ValidationRecord[];
    /** Research results. */
    research: ResearchResult[];
    /** Domain refinement history. */
    refinementHistory: DomainRefinement[];
}
export interface ValidationRecord {
    questionId: string;
    question: string;
    userResponse: string;
    timestamp: number;
    impactOnConfidence: number;
    validationType: ValidationQuestion['type'];
    confidenceBefore: number;
    confidenceAfter: number;
    validationDuration?: number;
    validatorNotes?: string;
}
export interface DomainRefinement {
    timestamp: number;
    changes: string[];
    reason: string;
    confidenceImpact: number;
}
export interface DomainRelationship {
    sourceDomain: string;
    targetDomain: string;
    type: 'depends_on' | 'communicates_with' | 'extends' | 'implements' | 'uses';
    confidence: number;
    evidence: string[];
}
export interface ProgressiveConfidenceConfig {
    targetConfidence?: number;
    maxIterations?: number;
    researchThreshold?: number;
    validationBatchSize?: number;
    memoryNamespace?: string;
    validationCheckpoints?: number[];
    requireHumanApprovalAt?: number[];
    minimumValidationsPerDomain?: number;
    validationTimeoutMs?: number;
    enableDetailedAuditTrail?: boolean;
}
export interface ValidationAuditEntry {
    id: string;
    timestamp: number;
    sessionId: string;
    validationType: 'checkpoint' | 'approval' | 'correction' | 'review';
    confidenceLevel: number;
    domainCount: number;
    questionsAsked: number;
    questionsAnswered: number;
    significantChanges: string[];
    validatorId?: string;
    notes?: string;
}
export interface DiscoveryContext {
    projectPath: string;
    existingDomains?: DiscoveredDomain[];
    previousLearning?: LearningEvent[];
    userPreferences?: Record<string, any>;
    validatorId?: string;
    sessionId?: string;
}
/**
 * Progressive Confidence Builder.
 * Iteratively builds confidence in domain discovery through human validation and research.
 *
 * @example
 */
export declare class ProgressiveConfidenceBuilder extends EventEmitter {
    private memoryStore;
    private agui;
    private config;
    private confidence;
    private confidenceMetrics;
    private learningHistory;
    private domains;
    private relationships;
    private iteration;
    private hiveFact?;
    private validationAuditTrail;
    private currentSessionId;
    private validatorId?;
    private totalQuestionsAsked;
    private totalQuestionsAnswered;
    private checkpointsReached;
    constructor(_discoveryBridge: DomainDiscoveryBridge, // xxx NEEDS_HUMAN: Parameter not used - confirm if needed for future features
    memoryStore: SessionMemoryStore, agui: AGUIInterface, config?: ProgressiveConfidenceConfig);
    /**
     * Build confidence through progressive iterations.
     *
     * @param context
     */
    buildConfidence(context: DiscoveryContext): Promise<ConfidentDomainMap>;
    /**
     * Check if we've reached a validation checkpoint.
     */
    private checkValidationCheckpoints;
    /**
     * Perform validation at a checkpoint.
     *
     * @param checkpoint
     * @param requireApproval
     */
    private performCheckpointValidation;
    /**
     * Import more documents and extract insights.
     *
     * @param _context
     */
    private importMoreDocuments;
    /**
     * Perform targeted human validation.
     */
    private performHumanValidation;
    /**
     * Perform online research using HiveFACT.
     */
    private performOnlineResearch;
    /**
     * Refine domain understanding based on accumulated knowledge.
     */
    private refineDomainUnderstanding;
    /**
     * Update confidence metrics based on current state.
     */
    private updateConfidenceMetrics;
    /**
     * Persist learning to memory store.
     */
    private persistLearning;
    /**
     * Show progress to user.
     */
    private showProgress;
    /**
     * Perform final validation before completion.
     */
    private performFinalValidation;
    /**
     * Initialize from existing domains.
     *
     * @param existingDomains
     */
    private initializeFromExisting;
    /**
     * Generate validation questions based on current state.
     */
    private generateValidationQuestions;
    /**
     * Generate research queries for a domain.
     *
     * @param domain
     */
    private generateResearchQueries;
    /**
     * Helper methods.
     */
    private initializeMetrics;
    private recordLearningEvent;
    private analyzeDocument;
    private batchQuestions;
    private processValidationResponse;
    /**
     * Calculate confidence impact based on question type and response.
     *
     * @param question
     * @param response
     * @param domain
     */
    private calculateConfidenceImpact;
    private extractInsights;
    private calculateResearchConfidence;
    private analyzePatterns;
    private applyRefinement;
    private updateDomainRelationships;
    private detectRelationship;
    private calculateDocumentCoverage;
    private calculateValidationScore;
    private calculateResearchDepth;
    private calculateDomainClarity;
    private calculateConsistency;
    private updateDomainConfidence;
    private getDocumentCount;
    private getTotalValidations;
    private getTotalResearch;
    private generateSummary;
    private performManualAdjustments;
    private recalculateConfidenceFromHistory;
    private buildConfidentDomainMap;
    /**
     * Review domains interactively.
     */
    private reviewDomains;
    /**
     * Allow manual confidence adjustment.
     */
    private adjustConfidence;
    /**
     * Collect validator notes.
     *
     * @param checkpoint
     */
    private collectValidatorNotes;
    /**
     * Check if question is relevant to a domain.
     *
     * @param question
     * @param domain
     */
    private isQuestionRelevantToDomain;
    /**
     * Prioritize questions based on confidence and importance.
     *
     * @param questions
     */
    private prioritizeQuestions;
    /**
     * Check if minimum validations are met for each domain.
     */
    private checkMinimumValidations;
    /**
     * Update audit trail.
     */
    private updateAuditTrail;
}
export default ProgressiveConfidenceBuilder;
//# sourceMappingURL=progressive-confidence-builder.d.ts.map