/**
 * @fileoverview Biome configuration types for AI-native linting
 *
 * Type definitions that mirror and extend Biome's configuration schema
 * for AI-enhanced rule generation and dynamic configuration updates.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 1.0.0
 */

/**
 * Complete Biome configuration structure
 */
export interface BiomeConfiguration {
  /** Schema version */
  $schema?: string;

  /** Version control system configuration */
  vcs?: VCSConfiguration;

  /** Code assist features */
  assist?: AssistConfiguration;

  /** Formatter configuration */
  formatter?: FormatterConfiguration;

  /** Linter configuration */
  linter: LinterConfiguration;

  /** Language-specific configurations */
  javascript?: JavaScriptConfiguration;
  typescript?: TypeScriptConfiguration;
  json?: JSONConfiguration;
  css?: CSSConfiguration;

  /** File handling configuration */
  files?: FilesConfiguration;

  /** Override configurations for specific file patterns */
  overrides?: OverrideConfiguration[];

  /** AI-specific extensions (our custom additions) */
  aiExtensions?: AIExtensions;
}

/**
 * Version control system configuration
 */
export interface VCSConfiguration {
  /** Enable VCS integration */
  enabled?: boolean;

  /** VCS client type */
  clientKind?: 'git' | 'svn' | 'hg';

  /** Use VCS ignore files */
  useIgnoreFile?: boolean;

  /** Default branch name */
  defaultBranch?: string;
}

/**
 * Code assist configuration
 */
export interface AssistConfiguration {
  /** Assist actions */
  actions?: {
    source?: {
      organizeImports?: 'on' | 'off';
      fixAll?: 'on' | 'off';
    };
  };
}

/**
 * Formatter configuration
 */
export interface FormatterConfiguration {
  /** Enable formatting */
  enabled?: boolean;

  /** Format files with errors */
  formatWithErrors?: boolean;

  /** Line width limit */
  lineWidth?: number;

  /** Indentation style */
  indentStyle?: 'tab' | 'space';

  /** Indentation width */
  indentWidth?: number;

  /** Attribute position in HTML/JSX */
  attributePosition?: 'auto' | 'multiline';
}

/**
 * Main linter configuration
 */
export interface LinterConfiguration {
  /** Enable linting */
  enabled?: boolean;

  /** Linting rules configuration */
  rules: LinterRules;

  /** AI-enhanced rule settings */
  aiRules?: AIRuleConfiguration;
}

/**
 * Linter rules organization
 */
export interface LinterRules {
  /** Use recommended rules */
  recommended?: boolean;

  /** All rules category */
  all?: boolean;

  /** Suspicious code rules */
  suspicious?: Record<string, RuleConfiguration>;

  /** Code style rules */
  style?: Record<string, RuleConfiguration>;

  /** Complexity rules */
  complexity?: Record<string, RuleConfiguration>;

  /** Correctness rules */
  correctness?: Record<string, RuleConfiguration>;

  /** Performance rules */
  performance?: Record<string, RuleConfiguration>;

  /** Security rules */
  security?: Record<string, RuleConfiguration>;

  /** Nursery rules (experimental) */
  nursery?: Record<string, RuleConfiguration>;

  /** Accessibility rules */
  a11y?: Record<string, RuleConfiguration>;

  /** AI-generated rules */
  aiGenerated?: Record<string, RuleConfiguration>;
}

/**
 * Individual rule configuration
 */
export type RuleConfiguration =
  | 'off'
  | 'warn'
  | 'error'
  | {
      level: 'off' | 'warn' | 'error' | 'info';
      options?: Record<string, unknown>;
    };

/**
 * AI-enhanced rule configuration
 */
export interface AIRuleConfiguration {
  /** Enable AI rule generation */
  enabled?: boolean;

  /** Confidence threshold for applying AI rules */
  confidenceThreshold?: number;

  /** Allow dynamic rule updates */
  allowDynamicUpdates?: boolean;

  /** AI rule generation frequency */
  generationFrequency?: 'on-demand' | 'periodic' | 'on-change';

  /** Custom AI rule templates */
  customTemplates?: AIRuleTemplate[];
}

/**
 * AI rule template for dynamic generation
 */
export interface AIRuleTemplate {
  /** Template identifier */
  id: string;

  /** Template name */
  name: string;

  /** Target rule category */
  category: keyof LinterRules;

  /** AI prompt for rule generation */
  prompt: string;

  /** Default configuration */
  defaultConfig: RuleConfiguration;

  /** Applicable file patterns */
  filePatterns?: string[];
}

/**
 * Generated Biome rule structure
 */
export interface BiomeRule {
  /** Rule name/identifier */
  name: string;

  /** Rule category */
  category: keyof LinterRules;

  /** Default severity level */
  level: 'off' | 'warn' | 'error' | 'info';

  /** Rule options */
  options?: Record<string, unknown>;

  /** AI generation metadata */
  metadata?: BiomeRuleMetadata;
}

/**
 * Metadata for AI-generated Biome rules
 */
export interface BiomeRuleMetadata {
  /** Indicates rule was AI-generated */
  aiGenerated: boolean;

  /** Generation timestamp */
  generatedAt: number;

  /** Claude reasoning for the rule */
  reasoning: string;

  /** Confidence score for the rule */
  confidence: number;

  /** Source analysis that triggered rule creation */
  sourceAnalysis: string;

  /** Rule effectiveness tracking */
  effectiveness?: RuleEffectiveness;
}

/**
 * Rule effectiveness tracking
 */
export interface RuleEffectiveness {
  /** Number of times rule was triggered */
  triggerCount: number;

  /** Number of issues successfully fixed */
  fixCount: number;

  /** Number of false positives */
  falsePositiveCount: number;

  /** User feedback ratings */
  userRatings: number[];

  /** Average effectiveness score */
  effectivenessScore: number;
}

/**
 * JavaScript-specific configuration
 */
export interface JavaScriptConfiguration {
  /** Formatter settings */
  formatter?: JavaScriptFormatterConfiguration;

  /** Global variables */
  globals?: string[];

  /** Parser configuration */
  parser?: JavaScriptParserConfiguration;
}

/**
 * JavaScript formatter configuration
 */
export interface JavaScriptFormatterConfiguration {
  /** Quote style */
  quoteStyle?: 'single' | 'double';

  /** Quote properties */
  quoteProperties?: 'asNeeded' | 'consistent' | 'preserve';

  /** Semicolon usage */
  semicolons?: 'always' | 'asNeeded';

  /** Trailing commas */
  trailingCommas?: 'none' | 'es5' | 'all';

  /** Arrow function parentheses */
  arrowParentheses?: 'always' | 'asNeeded';

  /** Bracket spacing */
  bracketSpacing?: boolean;

  /** Bracket same line */
  bracketSameLine?: boolean;
}

/**
 * JavaScript parser configuration
 */
export interface JavaScriptParserConfiguration {
  /** Unsafe parameter decorators */
  unsafeParameterDecoratorsEnabled?: boolean;
}

/**
 * TypeScript-specific configuration
 */
export interface TypeScriptConfiguration {
  /** Formatter settings */
  formatter?: JavaScriptFormatterConfiguration; // Same as JS

  /** Parser configuration */
  parser?: TypeScriptParserConfiguration;
}

/**
 * TypeScript parser configuration
 */
export interface TypeScriptParserConfiguration {
  /** Unsafe parameter decorators */
  unsafeParameterDecoratorsEnabled?: boolean;
}

/**
 * JSON configuration
 */
export interface JSONConfiguration {
  /** Formatter settings */
  formatter?: JSONFormatterConfiguration;

  /** Parser configuration */
  parser?: JSONParserConfiguration;
}

/**
 * JSON formatter configuration
 */
export interface JSONFormatterConfiguration {
  /** Enable JSON formatting */
  enabled?: boolean;

  /** Trailing commas in JSON */
  trailingCommas?: 'none';
}

/**
 * JSON parser configuration
 */
export interface JSONParserConfiguration {
  /** Allow comments in JSON */
  allowComments?: boolean;

  /** Allow trailing commas */
  allowTrailingCommas?: boolean;
}

/**
 * CSS configuration
 */
export interface CSSConfiguration {
  /** Formatter settings */
  formatter?: CSSFormatterConfiguration;

  /** Linter settings */
  linter?: CSSLinterConfiguration;
}

/**
 * CSS formatter configuration
 */
export interface CSSFormatterConfiguration {
  /** Enable CSS formatting */
  enabled?: boolean;

  /** Indentation style */
  indentStyle?: 'tab' | 'space';

  /** Indentation width */
  indentWidth?: number;

  /** Line width */
  lineWidth?: number;

  /** Quote style */
  quoteStyle?: 'single' | 'double';
}

/**
 * CSS linter configuration
 */
export interface CSSLinterConfiguration {
  /** Enable CSS linting */
  enabled?: boolean;

  /** CSS-specific rules */
  rules?: {
    /** Suspicious CSS patterns */
    suspicious?: Record<string, RuleConfiguration>;

    /** CSS correctness rules */
    correctness?: Record<string, RuleConfiguration>;
  };
}

/**
 * Files handling configuration
 */
export interface FilesConfiguration {
  /** File patterns to include */
  includes?: string[];

  /** File patterns to exclude */
  excludes?: string[];

  /** Experimental scanner ignores */
  experimentalScannerIgnores?: string[];

  /** Ignore unknown files */
  ignoreUnknown?: boolean;

  /** Maximum file size to process */
  maxSize?: number;
}

/**
 * Override configuration for specific file patterns
 */
export interface OverrideConfiguration {
  /** File patterns to match */
  includes?: string[];

  /** File patterns to exclude */
  excludes?: string[];

  /** Language-specific overrides */
  javascript?: Partial<JavaScriptConfiguration>;
  typescript?: Partial<TypeScriptConfiguration>;
  json?: Partial<JSONConfiguration>;
  css?: Partial<CSSConfiguration>;

  /** Formatter overrides */
  formatter?: Partial<FormatterConfiguration>;

  /** Linter overrides */
  linter?: Partial<LinterConfiguration>;
}

/**
 * AI extensions to Biome configuration
 */
export interface AIExtensions {
  /** Enable AI-enhanced linting */
  enabled?: boolean;

  /** AI rule generation settings */
  ruleGeneration?: AIRuleGenerationSettings;

  /** Claude integration settings */
  claude?: ClaudeIntegrationSettings;

  /** Swarm coordination settings */
  swarm?: SwarmCoordinationSettings;

  /** Performance monitoring */
  monitoring?: AIMonitoringSettings;
}

/**
 * AI rule generation settings
 */
export interface AIRuleGenerationSettings {
  /** Enable automatic rule generation */
  autoGenerate?: boolean;

  /** Generation triggers */
  triggers?: ('file-change' | 'manual' | 'scheduled')[];

  /** Rule approval process */
  approvalProcess?: 'automatic' | 'manual' | 'hybrid';

  /** Custom rule categories */
  customCategories?: string[];
}

/**
 * Claude integration settings for Biome
 */
export interface ClaudeIntegrationSettings {
  /** Enable Claude analysis */
  enabled?: boolean;

  /** Analysis depth */
  analysisDepth?: 'shallow' | 'medium' | 'deep';

  /** Real-time analysis */
  realTimeAnalysis?: boolean;

  /** Batch processing settings */
  batchSettings?: {
    batchSize: number;
    processingInterval: number;
  };
}

/**
 * Swarm coordination settings for Biome
 */
export interface SwarmCoordinationSettings {
  /** Enable swarm-based analysis */
  enabled?: boolean;

  /** Swarm topology */
  topology?: 'mesh' | 'hierarchical' | 'star';

  /** Maximum agents */
  maxAgents?: number;

  /** Coordination strategy */
  strategy?: 'balanced' | 'specialized' | 'adaptive';
}

/**
 * AI monitoring settings
 */
export interface AIMonitoringSettings {
  /** Enable performance monitoring */
  enabled?: boolean;

  /** Metrics collection */
  collectMetrics?: boolean;

  /** Log AI decisions */
  logDecisions?: boolean;

  /** Export metrics */
  exportMetrics?: {
    format: 'json' | 'csv' | 'prometheus';
    interval: number;
    destination: string;
  };
}