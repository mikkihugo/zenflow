/**
 * @fileoverview SPARC Multi-Swarm Executor
 *
 * Advanced multi-swarm A/B testing system specifically designed for SPARC Commander.
 * Since SPARC Commander is the only system that can write code, this executor
 * launches multiple SPARC instances in parallel using git trees for isolation.
 *
 * Features:
 * - Parallel SPARC execution with git tree isolation
 * - A/B testing of different SPARC configurations
 * - Statistical comparison of SPARC results
 * - Git worktree management for safe parallel execution
 * - Integration with MultiSwarmABTesting for strategy optimization
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
import { type ABTestStrategy } from './multi-swarm-ab-testing';
/**
 * SPARC-specific strategy configuration
 */
export interface SPARCStrategy extends ABTestStrategy {
  sparcConfig: {
    methodology:' | ''full-sparc'' | ''rapid-sparc'' | ''quality-sparc'' | ''performance-sparc';
    phaseOptimization: {
      specification: 'detailed'' | ''concise'' | ''user-driven';
      pseudocode: 'algorithmic'' | ''high-level'' | ''step-by-step';
      architecture: 'microservices'' | ''monolithic'' | ''layered'' | ''event-driven';
      refinement: 'performance'' | ''quality'' | ''maintainability';
      completion: 'mvp'' | ''production-ready'' | ''enterprise-grade';
    };
    gitTreeStrategy: 'isolated'' | ''shared'' | ''hybrid';
    intelligentSystems: {
      usePromptGeneration: boolean;
      useBehavioralIntelligence: boolean;
      useNeuralForecasting: boolean;
      useAISafety: boolean;
    };
  };
}
/**
 * SPARC execution result for A/B testing
 */
export interface SPARCExecutionResult {
  strategy: SPARCStrategy;
  success: boolean;
  duration: number;
  sparcMetrics: {
    phaseCompletionRate: number;
    requirementsCoverage: number;
    architecturalQuality: number;
    implementationReadiness: number;
    overallSPARCScore: number;
  };
  qualityMetrics: {
    codeQuality: number;
    maintainability: number;
    testCoverage: number;
    documentation: number;
    performance: number;
  };
  deliverables: {
    filesCreated: string[];
    linesOfCode: number;
    functionsImplemented: number;
    testsGenerated: number;
  };
  gitTreeInfo: {
    worktreePath: string;
    branchName: string;
    commitsCreated: number;
    mergedToMain: boolean;
  };
  error?: string;
  insights: string[];
}
/**
 * SPARC Multi-Swarm A/B Test Result
 */
export interface SPARCMultiSwarmResult {
  testId: string;
  taskDescription: string;
  strategies: SPARCStrategy[];
  results: SPARCExecutionResult[];
  comparison: {
    winner: SPARCStrategy;
    confidence: number;
    significance: 'high'' | ''medium'' | ''low'' | ''none';
    sparcPerformanceDelta: Record<string, number>;
    qualityDelta: Record<string, number>;
  };
  recommendations: {
    bestMethodology: string;
    optimalConfiguration: SPARCStrategy['sparcConfig'];
    reasoning: string[];
  };
  metadata: {
    startTime: Date;
    endTime: Date;
    totalDuration: number;
    parallelExecution: boolean;
    gitTreesUsed: boolean;
    totalWorktreesCreated: number;
  };
}
/**
 * SPARC Multi-Swarm Executor
 *
 * Orchestrates parallel execution of multiple SPARC methodologies to identify
 * optimal approaches for systematic development workflows.
 */
export declare class SPARCMultiSwarmExecutor {
  private abTesting;
  private codingPrinciplesResearcher;
  private promptGenerator;
  constructor();
  /**
   * Execute multi-swarm SPARC A/B test with git tree isolation
   */
  executeSPARCMultiSwarmTest(
    taskDescription: string,
    sparcStrategies: SPARCStrategy[],
    options?: {
      useGitTrees?: boolean;
      parallelExecution?: boolean;
      timeoutMs?: number;
      cleanupWorktrees?: boolean;
    }
  ): Promise<SPARCMultiSwarmResult>;
  /**
   * Create predefined SPARC strategy sets for common scenarios
   */
  createSPARCStrategySet(
    scenario:' | ''rapid-development'' | ''quality-focused'' | ''enterprise-grade'' | ''comprehensive'): SPARCStrategy[];
  /**
   * Execute SPARC strategies in parallel with git tree isolation
   */
  private executeSPARCStrategiesParallel;
  /**
   * Execute SPARC strategies sequentially with git tree isolation
   */
  private executeSPARCStrategiesSequential;
  /**
   * Execute a single SPARC strategy with git tree isolation
   */
  private executeSingleSPARCStrategy;
  /**
   * Simulate SPARC Commander execution with realistic metrics
   */
  private simulateSPARCExecution;
  /**
   * Calculate base SPARC quality for model and configuration
   */
  private getBaseSPARCQuality;
  /**
   * Get methodology multiplier for SPARC approach
   */
  private getMethodologyMultiplier;
  /**
   * Get intelligence systems bonus
   */
  private getIntelligenceBonus;
  /**
   * Get execution delay based on methodology
   */
  private getExecutionDelay;
  /**
   * Analyze and compare SPARC results
   */
  private analyzeSPARCResults;
  /**
   * Generate SPARC-specific recommendations
   */
  private generateSPARCRecommendations;
}
/**
 * Export convenience function for quick SPARC A/B testing
 */
export declare function quickSPARCTest(
  taskDescription: string,
  scenario?:' | ''rapid-development'' | ''quality-focused'' | ''enterprise-grade'' | ''comprehensive',
  options?: {
    useGitTrees?: boolean;
    timeoutMs?: number;
    cleanupWorktrees?: boolean;
  }
): Promise<SPARCMultiSwarmResult>;
/**
 * Export default instance for immediate use
 */
export declare const sparcMultiSwarmExecutor: SPARCMultiSwarmExecutor;
//# sourceMappingURL=sparc-multi-swarm-executor.d.ts.map
