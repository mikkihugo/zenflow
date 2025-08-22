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
import type { BehavioralIntelligence } from '../../behavioral-intelligence';
import type { DSPyLLMBridge } from '../../coordination/dspy-llm-bridge';
/**
 * Language and framework types for principle research
 */
export type ProgrammingLanguage =' | ''typescript'' | ''javascript'' | ''python'' | ''rust'' | ''go'' | ''java'' | ''csharp'' | ''swift'' | ''kotlin';
export type TaskDomain =' | ''rest-api'' | ''web-app'' | ''mobile-app'' | ''desktop-app'' | ''microservices'' | ''data-pipeline'' | ''ml-model'' | ''blockchain'' | ''game-dev'' | ''embedded';
export type DevelopmentRole =' | ''backend-developer'' | ''frontend-developer'' | ''fullstack-developer'' | ''mobile-developer'' | ''devops-engineer'' | ''ml-engineer'' | ''architect'' | ''tech-lead';
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
  depth?: 'basic'' | ''intermediate'' | ''advanced'' | ''expert';
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
    taskComplexity:'simple'' | ''moderate'' | ''complex';
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
  private dspyBridge;
  private behavioralIntelligence?;
  private cache;
  private humanFeedback;
  private agentFeedback;
  private promptConfidence;
  private minimumConfidenceThreshold;
  private logger;
  constructor(
    dspyBridge: DSPyLLMBridge,
    behavioralIntelligence?: BehavioralIntelligence
  );
  /**
   * Research coding principles for a specific language/domain/role combination
   */
  researchPrinciples(
    config: PrinciplesResearchConfig
  ): Promise<CodingPrinciples>;
  /**
   * Submit human feedback for improving principles
   */
  submitHumanFeedback(feedback: HumanFeedback): Promise<void>;
  /**
   * Get human-reviewable template for a language/domain
   */
  getReviewableTemplate(config: PrinciplesResearchConfig): Promise<string>;
  /**
   * Update principles based on successful project patterns
   */
  learnFromSuccess(
    config: PrinciplesResearchConfig,
    successPatterns: {
      fileNamingPatterns: string[];
      successfulArchitectures: string[];
      performanceOptimizations: string[];
      commonPitfalls: string[];
    }
  ): Promise<void>;
  /**
   * Meta-learning: Research principles with confidence building
   *
   * Iteratively researches and improves prompts until confidence threshold is met
   */
  researchPrinciplesWithConfidence(
    config: PrinciplesResearchConfig,
    targetConfidence?: number
  ): Promise<CodingPrinciples>;
  /**
   * Submit agent execution feedback for continuous improvement
   */
  submitAgentFeedback(feedback: AgentExecutionFeedback): Promise<void>;
  /**
   * Get principles with automatic improvement based on feedback
   */
  getAdaptivePrinciples(
    config: PrinciplesResearchConfig
  ): Promise<CodingPrinciples>;
  /**
   * Build research prompt for DSPy
   */
  private buildResearchPrompt;
  /**
   * Get comprehensive research areas based on role and domain
   */
  private getComprehensiveResearchAreas;
  /**
   * Get domain-specific research areas
   */
  private getDomainSpecificResearchAreas;
  /**
   * Get role-specific research areas
   */
  private getRoleSpecificResearchAreas;
  /**
   * Get advanced research areas based on role and domain combination
   */
  private getAdvancedResearchAreas;
  /**
   * Parse DSPy research result into structured principles
   */
  private parseResearchResult;
  /**
   * Generate human-reviewable template
   */
  private generateReviewableTemplate;
  private getDefaultTypeSystem;
  private getDefaultMemoryManagement;
  private getDefaultConcurrency;
  private getDefaultPackageManagement;
  private getDefaultBuildTools;
  private generateTemplate;
  private generateCacheKey;
  private isCacheValid;
  private getFallbackPrinciples;
  private incorporateFeedback;
  private enhancePrinciplesWithLearning;
  /**
   * Calculate success rate from patterns data
   */
  private calculatePatternSuccessRate;
  /**
   * Extract best practices from successful patterns
   */
  private extractBestPracticesFromPatterns;
  /**
   * Get or initialize prompt confidence for a cache key
   */
  private getPromptConfidence;
  /**
   * Update prompt confidence based on research quality
   */
  private updatePromptConfidence;
  /**
   * Evaluate research quality to determine initial confidence
   */
  private evaluateResearchQuality;
  /**
   * Enhance research config based on existing feedback
   */
  private enhanceConfigWithFeedback;
  /**
   * Update confidence based on agent execution feedback
   */
  private updateConfidenceFromAgentFeedback;
  /**
   * Evaluate whether principles need improvement based on feedback
   */
  private evaluateImprovementNeeds;
  /**
   * Get most common items from an array
   */
  private getMostCommon;
}
/**
 * Export factory function
 */
export declare function createCodingPrinciplesResearcher(
  dspyBridge: DSPyLLMBridge,
  behavioralIntelligence?: BehavioralIntelligence
): CodingPrinciplesResearcher;
/**
 * Export default configuration for common languages
 */
export declare const DEFAULT_LANGUAGE_CONFIGS: Record<
  ProgrammingLanguage,
  PrinciplesResearchConfig
>;
//# sourceMappingURL=coding-principles-researcher.d.ts.map
