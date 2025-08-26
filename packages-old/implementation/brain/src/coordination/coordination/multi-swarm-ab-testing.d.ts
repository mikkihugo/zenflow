/**
 * @fileoverview Multi-Swarm A/B Testing System
 *
 * Advanced A/B testing system that launches multiple swarms simultaneously
 * to compare results and identify optimal approaches. Supports git tree
 * integration and multiple AI model backends (Claude, Gemini, Aider, etc.)
 *
 * Features:
 * - Parallel swarm execution with result comparison
 * - Git tree integration for isolated testing environments
 * - Multi-model support (Claude, Gemini, Aider, GPT-4, etc.)
 * - Statistical analysis of performance differences
 * - Automated swarm selection based on success metrics
 * - A/B test result persistence and learning
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
import {
  CodingPrinciplesResearcher,
  type PrinciplesResearchConfig,
} from './coding-principles-researcher';
import { IntelligentPromptGenerator } from './intelligent-prompt-generator';
/**
 * Supported AI model backends for swarm A/B testing
 */
export type AIModelBackend =|claude-sonnet|claude-opus|claude-haiku|gemini-pro|gemini-flash|gpt-4|gpt-4-turbo|aider|'custom;
/**
 * A/B test strategy configuration
 */
export interface ABTestStrategy {
  /** Strategy identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** AI model backend to use */
  modelBackend: AIModelBackend;
  /** Swarm configuration parameters */
  swarmConfig: {
    topology: 'mesh|hierarchical|ring|star;
    maxAgents: number;
    strategy: 'balanced' | 'specialized' | 'adaptive';
    coordinationApproach: 'conservative' | 'aggressive' | 'exploratory';
  };
  /** Research configuration for this strategy */
  researchConfig?: Partial<PrinciplesResearchConfig>;
  /** Custom prompt variations */
  promptVariations?: {
    style: 'concise|detailed|step-by-step|creative;
    focus: 'performance|quality|speed|innovation;
  };
}
/**
 * Git tree configuration for isolated testing
 */
export interface GitTreeConfig {
  /** Create isolated git worktrees for each test */
  useGitWorktrees: boolean;
  /** Base branch to create worktrees from */
  baseBranch: string;
  /** Prefix for worktree branch names */
  branchPrefix: string;
  /** Clean up worktrees after testing */
  cleanupAfterTest: boolean;
  /** Maximum concurrent worktrees */
  maxWorktrees: number;
}
/**
 * A/B test execution result for a single strategy
 */
export interface SwarmTestResult {
  /** Strategy that was tested */
  strategy: ABTestStrategy;
  /** Execution success status */
  success: boolean;
  /** Execution duration in milliseconds */
  duration: number;
  /** Quality metrics */
  qualityMetrics: {
    codeQuality: number;
    requirementsCoverage: number;
    implementationCorrectness: number;
    maintainability: number;
    performance: number;
    overallScore: number;
    accuracy?: number;
    completeness?: number;
    efficiency?: number;
  };
  /** Generated artifacts and outputs */
  artifacts: {
    filesCreated: string[];
    linesOfCode: number;
    functionsCreated: number;
    testsGenerated: number;
  };
  /** Error information if failed */
  error?: string;
  /** Git worktree path if used */
  worktreePath?: string;
  /** Model-specific metadata */
  modelMetadata: {
    backend: AIModelBackend;
    tokenUsage?: number;
    requestCount: number;
    avgResponseTime: number;
    attemptNumber?: number;
    totalAttempts?: number;
    timedOut?: boolean;
  };
}
/**
 * Complete A/B test comparison result
 */
export interface ABTestResult {
  /** Test execution ID */
  testId: string;
  /** Test description */
  description: string;
  /** All strategies tested */
  strategies: ABTestStrategy[];
  /** Results for each strategy */
  results: SwarmTestResult[];
  /** Statistical comparison */
  comparison: {
    /** Best performing strategy */
    winner: ABTestStrategy;
    /** Confidence in winner selection (0-1) */
    confidence: number;
    /** Statistical significance */
    significance: 'high|medium|low|none;
    /** Performance differences */
    performanceDelta: Record<string, number>;
  };
  /** Execution metadata */
  metadata: {
    startTime: Date;
    endTime: Date;
    totalDuration: number;
    parallelExecution: boolean;
    gitTreesUsed: boolean;
  };
  /** Learning insights for future tests */
  insights: string[];
}
/**
 * Multi-Swarm A/B Testing System
 *
 * Orchestrates parallel execution of multiple swarm strategies to identify
 * optimal approaches through statistical comparison and analysis.
 */
export declare class MultiSwarmABTesting {
  private codingPrinciplesResearcher;
  private promptGenerator;
  private testHistory;
  constructor(
    codingPrinciplesResearcher?: CodingPrinciplesResearcher,
    promptGenerator?: IntelligentPromptGenerator
  );
  /**
   * Execute A/B test with multiple swarm strategies
   */
  executeABTest(
    taskDescription: string,
    strategies: ABTestStrategy[],
    options?: {
      gitConfig?: GitTreeConfig;
      parallelExecution?: boolean;
      timeoutMs?: number;
      collectDetailedMetrics?: boolean;
    }
  ): Promise<ABTestResult>;
  /**
   * Create predefined strategy sets for common scenarios
   */
  createStrategySet(
    scenario: 'performance|quality|innovation|comprehensive'): ABTestStrategy[];'
  /**
   * Get recommendations based on test history
   */
  getRecommendations(taskType: string): {
    recommendedStrategy: ABTestStrategy | null;
    confidence: number;
    reasoning: string[];
  };
  /**
   * Private helper methods
   */
  private prepareGitWorktrees;
  private executeStrategiesParallel;
  private executeStrategiesSequential;
  private executeStrategy;
  private generateStrategyPrompt;
  private simulateSwarmExecution;
  private getBaseQualityForModel;
  private getTopologyMultiplier;
  private analyzeResults;
  private generateInsights;
  private findMostSuccessfulStrategy;
  private cleanupGitWorktrees;
  private recordCleanupMetrics;
  private persistTestResult;
}
/**
 * Export convenience function for quick A/B testing
 */
export declare function quickABTest(
  taskDescription: string,
  scenario?:'performance|quality|innovation|comprehensive',
  options?: {
    useGitTrees?: boolean;
    timeoutMs?: number;
  }
): Promise<ABTestResult>;
/**
 * Export default instance for immediate use
 */
export declare const multiSwarmABTesting: MultiSwarmABTesting;
//# sourceMappingURL=multi-swarm-ab-testing.d.ts.map
