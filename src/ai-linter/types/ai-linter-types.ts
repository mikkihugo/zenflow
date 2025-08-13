/**
 * @fileoverview Type definitions for AI-Native Universal Linter
 *
 * Comprehensive types for the Claude-Biome bridge and AI-enhanced linting system.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 1.0.0
 */

/**
 * Context information for AI-powered linting analysis
 */
export interface LinterContext {
  /** Programming language being analyzed */
  language: string;

  /** File path for context */
  filePath: string;

  /** Project root for relative analysis */
  projectRoot: string;

  /** Framework/library context (React, Node.js, etc.) */
  framework?: string;

  /** Analysis mode configuration */
  mode: AnalysisMode;

  /** Custom analysis preferences */
  preferences: LinterPreferences;

  /** Associated metadata */
  metadata: Record<string, unknown>;
}

/**
 * Analysis modes for different use cases
 */
export type AnalysisMode =
  | 'strict' // Ultra-strict analysis with all AI insights
  | 'balanced' // Standard analysis with key insights
  | 'permissive' // Minimal analysis for legacy code
  | 'exploratory' // Deep analysis for code discovery
  | 'performance' // Focus on performance optimizations
  | 'security' // Focus on security vulnerabilities
  | 'maintainability'; // Focus on long-term maintainability

/**
 * User preferences for AI linting behavior
 */
export interface LinterPreferences {
  /** Enable AI-generated rule suggestions */
  enableAIRules: boolean;

  /** Enable swarm-based analysis */
  enableSwarmAnalysis: boolean;

  /** Confidence threshold for suggestions */
  confidenceThreshold: number;

  /** Auto-apply fixes below this confidence threshold */
  autoFixThreshold: number;

  /** Categories to focus on */
  focusAreas: LintingCategory[];

  /** Custom rule priorities */
  customPriorities: Record<string, 'low' | 'medium' | 'high' | 'critical'>;

  /** Enable caching for faster analysis */
  enableCaching: boolean;
}

/**
 * Main categories of linting analysis
 */
export type LintingCategory =
  | 'complexity'
  | 'type-safety'
  | 'performance'
  | 'security'
  | 'maintainability'
  | 'architecture'
  | 'style'
  | 'correctness'
  | 'accessibility'
  | 'i18n';

/**
 * Code pattern detected by AST analysis
 */
export interface CodePattern {
  /** Type of pattern detected */
  type: PatternType;

  /** Location in the source code */
  location: SourceLocation;

  /** Severity level */
  severity: SeverityLevel;

  /** Specific pattern identifier */
  pattern: string;

  /** Associated data and metrics */
  data: Record<string, unknown>;

  /** Pattern confidence score */
  confidence?: number;

  /** Human-readable description */
  description?: string;
}

/**
 * Types of code patterns that can be detected
 */
export type PatternType =
  | 'function_complexity'
  | 'type_annotation'
  | 'naming_convention'
  | 'code_duplication'
  | 'performance_issue'
  | 'security_vulnerability'
  | 'architectural_violation'
  | 'unused_code'
  | 'import_organization'
  | 'error_handling'
  | 'async_pattern'
  | 'memory_leak'
  | 'accessibility_issue';

/**
 * Location information in source code
 */
export interface SourceLocation {
  /** Line number (1-based) */
  line: number;

  /** Column number (1-based) */
  column: number;

  /** End line (for ranges) */
  endLine?: number;

  /** End column (for ranges) */
  endColumn?: number;

  /** Character offset from start of file */
  offset?: number;

  /** Length of the affected code */
  length?: number;
}

/**
 * Severity levels for issues and suggestions
 */
export type SeverityLevel =
  | 'error' // Must be fixed
  | 'warning' // Should be addressed
  | 'info' // Informational
  | 'hint' // Subtle suggestion
  | 'suggestion'; // AI-generated improvement idea

/**
 * Complete result from AI-powered analysis
 */
export interface AIAnalysisResult {
  /** File path that was analyzed */
  filePath: string;

  /** Analysis timestamp */
  timestamp: number;

  /** Detected code patterns */
  patterns: CodePattern[];

  /** Claude's natural language insights */
  claudeInsights: ClaudeInsights;

  /** Generated Biome-compatible rules */
  generatedRules: unknown[]; // BiomeRule[] when imported

  /** Enhancements from swarm coordination */
  swarmEnhancements: SwarmAnalysisResult;

  /** Overall confidence in the analysis */
  confidence: number;

  /** Human-readable suggestions */
  suggestions: string[];

  /** Performance metrics */
  performance: AnalysisPerformanceMetrics;

  /** Cached result indicator */
  fromCache?: boolean;
}

/**
 * Claude's structured insights about the code
 */
export interface ClaudeInsights {
  /** Complexity-related observations */
  complexity_issues: ComplexityIssue[];

  /** Type safety concerns */
  type_safety_concerns: TypeSafetyConcern[];

  /** High-level architectural suggestions */
  architectural_suggestions: string[];

  /** Performance optimization opportunities */
  performance_optimizations: PerformanceOptimization[];

  /** Overall maintainability score (0-100) */
  maintainability_score: number;

  /** Code quality assessment */
  quality_assessment: QualityAssessment;

  /** Detected anti-patterns */
  antipatterns: Antipattern[];

  /** Positive patterns worth highlighting */
  good_practices: GoodPractice[];
}

/**
 * Complexity issue identified by Claude
 */
export interface ComplexityIssue {
  /** Function or method name */
  functionName: string;

  /** Calculated complexity score */
  complexityScore: number;

  /** Type of complexity (cyclomatic, cognitive, etc.) */
  complexityType: 'cyclomatic' | 'cognitive' | 'npath' | 'halstead';

  /** Specific suggestions for reducing complexity */
  suggestions: string[];

  /** Location of the complex code */
  location: SourceLocation;
}

/**
 * Type safety concern identified by Claude
 */
export interface TypeSafetyConcern {
  /** Type of safety issue */
  type:
    | 'implicit_any'
    | 'unsafe_cast'
    | 'null_reference'
    | 'undefined_behavior';

  /** Description of the concern */
  description: string;

  /** Suggested fix */
  suggestedFix: string;

  /** Severity of the type safety issue */
  severity: SeverityLevel;

  /** Location of the issue */
  location: SourceLocation;
}

/**
 * Performance optimization suggestion
 */
export interface PerformanceOptimization {
  /** Type of optimization */
  type: 'memoization' | 'lazy_loading' | 'batching' | 'caching' | 'algorithm';

  /** Description of the optimization opportunity */
  description: string;

  /** Estimated performance impact */
  impact: 'low' | 'medium' | 'high' | 'critical';

  /** Implementation difficulty */
  difficulty: 'easy' | 'medium' | 'hard';

  /** Code example or suggestion */
  implementation?: string;
}

/**
 * Overall quality assessment from Claude
 */
export interface QualityAssessment {
  /** Overall quality score (0-100) */
  overallScore: number;

  /** Breakdown by category */
  categoryScores: Record<LintingCategory, number>;

  /** Key strengths identified */
  strengths: string[];

  /** Areas for improvement */
  improvements: string[];

  /** Technical debt indicators */
  technicalDebt: TechnicalDebtIndicator[];
}

/**
 * Technical debt indicator
 */
export interface TechnicalDebtIndicator {
  /** Type of technical debt */
  type:
    | 'code_duplication'
    | 'complex_code'
    | 'missing_tests'
    | 'outdated_dependencies'
    | 'poor_naming';

  /** Debt severity */
  severity: SeverityLevel;

  /** Estimated effort to resolve */
  effort: 'low' | 'medium' | 'high';

  /** Business impact if not addressed */
  businessImpact: string;
}

/**
 * Anti-pattern detected in the code
 */
export interface Antipattern {
  /** Name of the anti-pattern */
  name: string;

  /** Description of why it's problematic */
  description: string;

  /** Suggested refactoring approach */
  refactoringApproach: string;

  /** Location where pattern was found */
  location: SourceLocation;

  /** Examples of better approaches */
  alternatives: string[];
}

/**
 * Good practice worth highlighting
 */
export interface GoodPractice {
  /** Name of the good practice */
  name: string;

  /** Description of why it's beneficial */
  description: string;

  /** Location of the good practice */
  location: SourceLocation;

  /** Category of good practice */
  category: LintingCategory;
}

/**
 * Result from swarm-based analysis coordination
 */
export interface SwarmAnalysisResult {
  /** Architectural review from reviewer agents */
  architectural_review: string;

  /** Security analysis from security-focused agents */
  security_analysis: string;

  /** Performance insights from optimization agents */
  performance_insights: string;

  /** Overall coordination quality */
  coordination_quality: 'low' | 'medium' | 'high';

  /** Detailed agent contributions */
  agent_contributions: AgentContribution[];

  /** Cross-agent consensus score */
  consensus_score: number;

  /** Conflicting opinions that need resolution */
  conflicts: AnalysisConflict[];
}

/**
 * Individual agent contribution to the analysis
 */
export interface AgentContribution {
  /** Agent identifier */
  agentId: string;

  /** Agent type and specialization */
  agentType: string;

  /** Specific insights provided */
  insights: string[];

  /** Confidence in the analysis */
  confidence: number;

  /** Processing time taken */
  processingTimeMs: number;
}

/**
 * Conflicts between different agent analyses
 */
export interface AnalysisConflict {
  /** Description of the conflict */
  description: string;

  /** Agents involved in the conflict */
  involvedAgents: string[];

  /** Different viewpoints */
  viewpoints: string[];

  /** Suggested resolution */
  resolution: string;
}

/**
 * Performance metrics for the analysis process
 */
export interface AnalysisPerformanceMetrics {
  /** Total analysis time in milliseconds */
  totalTimeMs: number;

  /** AST parsing time */
  astParsingTimeMs: number;

  /** Claude analysis time */
  claudeAnalysisTimeMs: number;

  /** Swarm coordination time */
  swarmCoordinationTimeMs: number;

  /** Rule generation time */
  ruleGenerationTimeMs: number;

  /** Memory usage in MB */
  memoryUsageMb: number;

  /** Number of tokens used (for LLM calls) */
  tokensUsed: number;

  /** Cache hit/miss information */
  cacheStats: CacheStatistics;
}

/**
 * Cache performance statistics
 */
export interface CacheStatistics {
  /** Number of cache hits */
  hits: number;

  /** Number of cache misses */
  misses: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** Cache size in entries */
  cacheSize: number;

  /** Memory used by cache in MB */
  cacheMemoryMb: number;
}

/**
 * Configuration for AI-enhanced linting rules
 */
export interface AILinterConfiguration {
  /** Enable AI-generated rules */
  enableAIRules: boolean;

  /** Swarm coordination settings */
  swarmSettings: SwarmSettings;

  /** Claude integration settings */
  claudeSettings: ClaudeSettings;

  /** Performance tuning options */
  performance: PerformanceSettings;

  /** Cache configuration */
  cache: CacheSettings;

  /** Custom rule templates */
  customRuleTemplates: CustomRuleTemplate[];
}

/**
 * Swarm coordination settings
 */
export interface SwarmSettings {
  /** Enable swarm-based analysis */
  enabled: boolean;

  /** Maximum number of agents to use */
  maxAgents: number;

  /** Swarm topology */
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';

  /** Agent selection strategy */
  strategy: 'balanced' | 'specialized' | 'adaptive';

  /** Timeout for swarm operations */
  timeoutMs: number;
}

/**
 * Claude integration settings
 */
export interface ClaudeSettings {
  /** Enable Claude analysis */
  enabled: boolean;

  /** Analysis depth */
  depth: 'shallow' | 'medium' | 'deep';

  /** Focus areas for Claude analysis */
  focusAreas: LintingCategory[];

  /** Maximum tokens per analysis */
  maxTokens: number;

  /** Enable creative suggestions */
  enableCreativeSuggestions: boolean;
}

/**
 * Performance tuning settings
 */
export interface PerformanceSettings {
  /** Enable parallel processing */
  enableParallelProcessing: boolean;

  /** Maximum concurrent analyses */
  maxConcurrentAnalyses: number;

  /** Batch size for bulk analysis */
  batchSize: number;

  /** Enable incremental analysis */
  enableIncrementalAnalysis: boolean;

  /** Memory limit in MB */
  memoryLimitMb: number;
}

/**
 * Cache configuration settings
 */
export interface CacheSettings {
  /** Enable analysis result caching */
  enabled: boolean;

  /** Maximum cache size in MB */
  maxSizeMb: number;

  /** Cache TTL in milliseconds */
  ttlMs: number;

  /** Cache eviction strategy */
  evictionStrategy: 'lru' | 'lfu' | 'ttl';

  /** Persistent cache location */
  persistentCacheLocation?: string;
}

/**
 * Custom rule template for generating AI rules
 */
export interface CustomRuleTemplate {
  /** Template name */
  name: string;

  /** Rule category */
  category: LintingCategory;

  /** Pattern to match */
  pattern: string;

  /** AI prompt template */
  promptTemplate: string;

  /** Default severity */
  defaultSeverity: SeverityLevel;

  /** Custom options */
  options: Record<string, unknown>;
}
