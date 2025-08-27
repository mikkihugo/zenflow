/**
 * @fileoverview Coding Principles Researcher - Dynamic Language Standards Research
 *
 * AI-powered research system that dynamically discovers and learns coding principles
 * for different languages, frameworks, and task types. Provides human-reviewable
 * templates that can be improved over time.
 *
 * Features:
 * - Language-specific principle research
 * - Task type optimization (API, web-app, mobile, etc.)
 * - Human-reviewable template generation
 * - Continuous learning from successful patterns
 * - DSPy-optimized principle discovery
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
/**
 * Language and framework types for principle research
 */
export type ProgrammingLanguage = 'typescript' | 'javascript' | 'python' | 'rust' | 'go' | 'java' | 'csharp' | 'swift' | 'kotlin';
export type TaskDomain = 'rest-api' | 'web-app' | 'mobile-app' | 'desktop-app' | 'microservices' | 'data-pipeline' | 'ml-model' | 'blockchain' | 'game-dev' | 'embedded';
export type DevelopmentRole = 'backend-developer' | 'frontend-developer' | 'fullstack-developer' | 'mobile-developer' | 'devops-engineer' | 'ml-engineer' | 'architect' | 'tech-lead';
/**
 * Coding principles research configuration
 */
export interface PrinciplesResearchConfig {
    /** Language to research */
    language: ProgrammingLanguage;
    /** Task domain context */
    domain?: TaskDomain;
    /** Developer role context */
    role?: DevelopmentRole;
    /** Include performance guidelines */
    includePerformance?: boolean;
    /** Include security guidelines */
    includeSecurity?: boolean;
    /** Include testing guidelines */
    includeTesting?: boolean;
    /** Research depth level */
    depth?: 'basic|intermediate|advanced|expert;;
}
/**
 * Researched coding principles result
 */
export interface CodingPrinciples {
    /** Language and context */
    language: ProgrammingLanguage;
    domain?: TaskDomain;
    role?: DevelopmentRole;
    /** Core principles */
    coreStandards: {
        repositoryStructure: string[];
        fileNaming: string[];
        folderOrganization: string[];
        functionComplexity: string[];
        codeOrganization: string[];
        errorHandling: string[];
        documentation: string[];
        codeQuality: string[];
        testingStrategy: string[];
    };
    /** Language-specific guidelines */
    languageSpecific: {
        typeSystem: string[];
        memoryManagement: string[];
        concurrency: string[];
        packageManagement: string[];
        buildTools: string[];
    };
    /** Domain-specific practices */
    domainSpecific?: {
        architecture: string[];
        dataHandling: string[];
        apiDesign: string[];
        userInterface: string[];
        deployment: string[];
    };
    /** Quality metrics */
    qualityMetrics: {
        complexity: {
            metric: string;
            threshold: number;
        };
        coverage: {
            metric: string;
            threshold: number;
        };
        maintainability: {
            metric: string;
            threshold: number;
        };
        performance: {
            metric: string;
            threshold: number;
        };
    };
    /** Best practices from successful patterns */
    bestPractices: string[];
    /** Anti-patterns to avoid */
    antiPatterns: string[];
    /** Human-reviewable template */
    template: string;
    /** Research metadata */
    researchMetadata: {
        researchedAt: Date;
        sources: string[];
        confidence: number;
        humanReviewed: boolean;
        lastUpdated: Date;
        version: string;
    };
}
/**
 * Human review feedback for improving templates
 */
export interface HumanFeedback {
    principlesId: string;
    reviewer: string;
    rating: 1 | 2 | 3 | 4 | 5;
    improvements: string[];
    approvedSections: string[];
    rejectedSections: string[];
    additionalGuidelines: string[];
    notes: string;
    reviewedAt: Date;
}
/**
 * Agent execution feedback for improving prompts
 */
export interface AgentExecutionFeedback {
    principlesId: string;
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
    context: {
        language: ProgrammingLanguage;
        domain?: TaskDomain;
        role?: DevelopmentRole;
        taskComplexity: 'simple' | 'moderate' | 'complex';
        requirementsCount: number;
    };
    timestamp: Date;
}
/**
 * Prompt confidence tracking
 */
export interface PromptConfidence {
    principlesId: string;
    initialConfidence: number;
    executionCount: number;
    averageAccuracy: number;
    averageCompleteness: number;
    averageUsefulness: number;
    overallConfidence: number;
    needsImprovement: boolean;
    lastUpdated: Date;
    improvementHistory: Array<{
        version: string;
        changes: string[];
        confidenceChange: number;
        timestamp: Date;
    }>;
}
/**
 * Coding Principles Researcher
 *
 * Dynamically researches and learns coding principles for different languages,
 * domains, and roles using AI research and human feedback loops.
 */
export declare class CodingPrinciplesResearcher {
    ': any;
    constructor();
    /**
     * Research coding principles for a specific language/domain/role combination
     */
    researchPrinciples(config: PrinciplesResearchConfig): Promise<CodingPrinciples>;
    ': any;
    $: any;
}
/**
 * Export factory function
 */
export declare function createCodingPrinciplesResearcher(dspyBridge: DSPyLLMBridge, behavioralIntelligence?: BehavioralIntelligence): CodingPrinciplesResearcher;
/**
 * Export default configuration for common languages
 */
export declare const DEFAULT_LANGUAGE_CONFIGS: Record<ProgrammingLanguage, PrinciplesResearchConfig>;
//# sourceMappingURL=coding-principles-researcher.d.ts.map