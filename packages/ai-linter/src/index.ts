/**
 * @fileoverview AI-Native Universal Linter Package
 *
 * Advanced linting system that combines Claude's intelligence with Biome's performance
 * for next-generation code analysis and automatic rule generation.
 *
 * Key Features:
 * - AI-powered pattern detection and rule generation
 * - Real-time code analysis with Claude integration
 * - Biome compatibility for high-performance AST parsing
 * - Swarm coordination for specialized analysis
 * - Dynamic rule evolution based on effectiveness
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 1.0.0
 */

// Core AI Linter Components
export { AIRuleGenerator } from './ai-rule-generator.js';
export type {
  AIRuleGeneratorConfig,
  RuleGenerationStrategy,
  RuleEvolutionConfig,
  CodebaseStatistics,
  RuleGenerationContext,
  ProjectMetadata,
  QualityRequirement,
  TeamPreferences,
  RuleFeedback,
} from './ai-rule-generator.js';

export { ClaudeESLintBridge, createClaudeESLintBridge } from './claude-eslint-bridge.js';
export type { EventBus } from './claude-eslint-bridge.js';

// Claude SDK Integration
export { ClaudeSDKIntegration, createClaudeSDKIntegration } from './claude-sdk-integration.js';
export type { ClaudeAnalysisConfig } from './claude-sdk-integration.js';

// Type Definitions
export type {
  // AI Linter Core Types
  LinterContext,
  AnalysisMode,
  LinterPreferences,
  LintingCategory,
  CodePattern,
  PatternType,
  SourceLocation,
  SeverityLevel,
  AIAnalysisResult,
  ClaudeInsights,
  ComplexityIssue,
  TypeSafetyConcern,
  PerformanceOptimization,
  QualityAssessment,
  TechnicalDebtIndicator,
  Antipattern,
  GoodPractice,
  SwarmAnalysisResult,
  AgentContribution,
  AnalysisConflict,
  AnalysisPerformanceMetrics,
  CacheStatistics,
  AILinterConfiguration,
  SwarmSettings,
  ClaudeSettings,
  PerformanceSettings,
  CacheSettings,
  CustomRuleTemplate,
} from './types/ai-linter-types.js';

// ESLint Integration Types (using existing ESLint ecosystem) 
export type { ESLintAIConfig } from './claude-eslint-bridge.js';

/**
 * Create a comprehensive AI linter configuration with sensible defaults
 */
export function createDefaultAILinterConfig(): import('./types/ai-linter-types').AILinterConfiguration {
  return {
    enableAIRules: true,
    swarmSettings: {
      enabled: true,
      maxAgents: 6,
      topology: 'hierarchical',
      strategy: 'adaptive',
      timeoutMs: 30000,
    },
    claudeSettings: {
      enabled: true,
      depth: 'medium',
      focusAreas: ['complexity', 'maintainability', 'type-safety'],
      maxTokens: 4000,
      enableCreativeSuggestions: true,
    },
    performance: {
      enableParallelProcessing: true,
      maxConcurrentAnalyses: 4,
      batchSize: 10,
      enableIncrementalAnalysis: true,
      memoryLimitMb: 512,
    },
    cache: {
      enabled: true,
      maxSizeMb: 100,
      ttlMs: 3600000, // 1 hour
      evictionStrategy: 'lru',
    },
    customRuleTemplates: [],
  };
}

/**
 * Create default ESLint AI configuration that works with our existing setup
 */
export function createDefaultESLintAIConfig(): import('./claude-eslint-bridge.js').ESLintAIConfig {
  return {
    enableAIRules: true,
    confidenceThreshold: 0.8,
    focusAreas: ['complexity', 'maintainability', 'type-safety', 'performance'],
    eslintConfig: {
      // Use our existing ESLint configuration
    },
  };
}

/**
 * Create a basic linter context for file analysis
 */
export function createLinterContext(
  filePath: string,
  language: string,
  projectRoot: string = process.cwd(),
  framework?: string
): import('./types/ai-linter-types').LinterContext {
  return {
    language,
    filePath,
    projectRoot,
    framework,
    mode: 'balanced',
    preferences: {
      enableAIRules: true,
      enableSwarmAnalysis: true,
      confidenceThreshold: 0.8,
      autoFixThreshold: 0.9,
      focusAreas: ['complexity', 'maintainability', 'type-safety'],
      customPriorities: {},
      enableCaching: true,
    },
    metadata: {
      analyzerVersion: '1.0.0',
      timestamp: Date.now(),
    },
  };
}

/**
 * Default AI rule generator configuration
 */
export function createDefaultRuleGeneratorConfig(): import('./ai-rule-generator.js').AIRuleGeneratorConfig {
  return {
    autoGenerate: true,
    confidenceThreshold: 0.8,
    maxRulesPerAnalysis: 10,
    trackEffectiveness: true,
    strategies: ['pattern-based', 'statistical', 'context-aware'],
    customPrompts: {
      complexity: 'Analyze function complexity and suggest thresholds',
      'type-safety': 'Review type annotations and safety patterns',
      performance: 'Identify performance optimization opportunities',
      security: 'Detect security vulnerabilities and best practices',
      maintainability: 'Assess long-term maintainability factors',
      architecture: 'Review architectural patterns and structure',
      style: 'Analyze coding style consistency',
      correctness: 'Verify code correctness and logic',
      accessibility: 'Check accessibility compliance',
      i18n: 'Review internationalization readiness',
    },
    evolution: {
      enabled: true,
      minSampleSize: 10,
      evolutionInterval: 86400000, // 24 hours
      retirementThreshold: 0.3,
    },
  };
}

/**
 * Version information
 */
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@claude-zen/ai-linter';

/**
 * Package metadata
 */
export const PACKAGE_INFO = {
  name: PACKAGE_NAME,
  version: VERSION,
  description: 'AI-Native Universal Linter with Claude integration',
  author: 'Claude Code Zen Team',
  license: 'MIT',
  repository: 'https://github.com/zen-neural/claude-code-zen',
  keywords: [
    'linter',
    'ai',
    'claude',
    'biome',
    'code-analysis',
    'swarm-coordination',
    'rule-generation',
    'typescript',
    'javascript',
  ],
} as const;