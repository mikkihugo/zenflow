/**
 * @fileoverview Intelligent Prompt Generator for Brain Package
 *
 * AI-powered prompt generation system that provides context-aware,
 * high-quality development prompts with built-in coding standards
 * and best practices for TypeScript development.
 *
 * Features:
 * - Phase-specific prompt generation
 * - Coding standards integration
 * - TypeScript best practices
 * - Complexity management guidelines
 * - File organization standards
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
import type { BehavioralIntelligence } from '../../behavioral-intelligence';
import { CodingPrinciplesResearcher } from './coding-principles-researcher';
/**
 * Development phase types for prompt generation
 */
export type DevelopmentPhase = 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion' | 'general';
/**
 * Coding standards configuration
 */
export interface CodingStandardsConfig {
    /** Target language (default: typescript) */
    language?: 'typescript' | 'javascript' | 'rust' | 'python';
    /** Maximum function complexity (default: 10) */
    maxComplexity?: number;
    /** Maximum lines per function (default: 30) */
    maxLinesPerFunction?: number;
    /** Maximum parameters per function (default: 5) */
    maxParameters?: number;
    /** File naming convention (default: kebab-case) */
    fileNaming?: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case';
    /** Include performance guidelines */
    includePerformance?: boolean;
    /** Include security guidelines */
    includeSecurity?: boolean;
}
/**
 * Project context for prompt generation
 */
export interface ProjectContext {
    /** Project name */
    name: string;
    /** Project domain/type */
    domain: string;
    /** Current phase of the project */
    currentPhase?: string;
    /** Domain-specific context */
    domainSpecific?: Record<string, unknown>;
    /** Current requirements */
    requirements?: string[];
    /** Existing architecture patterns */
    architecturePatterns?: string[];
    /** Technology stack */
    techStack?: string[];
}
/**
 * Generated prompt result
 */
export interface IntelligentPrompt {
    /** Main prompt content */
    content: string;
    /** Coding standards section */
    codingStandards: string;
    /** Phase-specific guidelines */
    phaseGuidelines: string;
    /** Quality metrics */
    qualityMetrics: string[];
    /** Estimated complexity score */
    complexityScore: number;
    /** Meta-learning metadata */
    metadata?: {
        principlesId?: string;
        researchConfidence?: number;
        usesPrinciplesResearch?: boolean;
        researchedAt?: Date;
    };
}
/**
 * Intelligent Prompt Generator
 *
 * Generates context-aware, high-quality development prompts with
 * integrated coding standards and best practices.
 */
export declare class IntelligentPromptGenerator {
    private behavioralIntelligence?;
    private codingPrinciplesResearcher?;
    private defaultConfig;
    private logger;
    constructor(behavioralIntelligence?: BehavioralIntelligence, codingPrinciplesResearcher?: CodingPrinciplesResearcher);
    /**
     * Generate intelligent prompt for development phase using meta-learning with confidence tracking
     */
    generatePrompt(phase: DevelopmentPhase, context: ProjectContext, config?: Partial<CodingStandardsConfig>): Promise<IntelligentPrompt>;
    /**
     * Generate comprehensive coding standards
     */
    private generateCodingStandards;
    /**
     * Generate phase-specific guidelines
     */
    private generatePhaseGuidelines;
    /**
     * Generate quality metrics for the phase
     */
    private generateQualityMetrics;
    /**
     * Build the main prompt content
     */
    private buildPromptContent;
    /**
     * Calculate complexity score based on context and phase
     */
    private calculateComplexityScore;
    /**
     * Generate prompt using DSPy optimization
     */
    private generateWithDSPy;
    /**
     * Get phase-specific example guidelines for DSPy training
     */
    private getPhaseExampleGuidelines;
    /**
     * Generate few-shot examples for DSPy prompt optimization
     */
    private generateFewShotPromptExamples;
    /**
     * Enhance prompt with behavioral intelligence
     */
    private enhanceWithBehavioralIntelligence;
    /**
     * Extract project tags from context for behavioral analysis
     */
    private extractProjectTags;
    /**
     * Assess project complexity based on context
     */
    private assessProjectComplexity;
    /**
     * Get adaptive principles using the coding principles researcher
     */
    private getAdaptivePrinciples;
    /**
     * Infer domain from project context
     */
    private inferDomainFromContext;
    /**
     * Infer role from development phase
     */
    private inferRoleFromPhase;
    /**
     * Build meta-learning prompt content using researched principles
     */
    private buildMetaLearningPromptContent;
    /**
     * Convert principles to quality metrics
     */
    private convertPrinciplesToMetrics;
    /**
     * Generate principles ID for tracking
     */
    private generatePrinciplesId;
    /**
     * Submit agent execution feedback for continuous improvement
     */
    submitAgentFeedback(principlesId: string, feedback: {
        agentId: string;
        taskType: string;
        accuracy: number;
        completeness: number;
        usefulness: number;
        missingAreas: string[];
        incorrectGuidelines: string[];
        additionalNeeds: string[];
        actualCodeQuality: number;
        executionTime: number;
        taskComplexity: 'simple' | 'moderate' | 'complex';
        requirementsCount: number;
    }): Promise<void>;
    /**
     * Generate second opinion validation prompt
     *
     * Based on user suggestion: launch a 2nd opinion that validates what was done
     * and identifies misunderstandings
     */
    generateSecondOpinionPrompt(originalPrompt: string, agentResponse: string, context: ProjectContext): Promise<string>;
}
/**
 * Export convenient factory function
 */
export declare function createIntelligentPromptGenerator(behavioralIntelligence?: BehavioralIntelligence): IntelligentPromptGenerator;
/**
 * Export default configuration
 */
export declare const DEFAULT_CODING_STANDARDS: Required<CodingStandardsConfig>;
//# sourceMappingURL=intelligent-prompt-generator.d.ts.map