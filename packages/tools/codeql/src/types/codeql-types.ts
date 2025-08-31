/**
 * @fileoverview CodeQL TypeScript Type Definitions
 * Comprehensive types for CodeQL CLI integration and SARIF result processing
 */

import type { Result } from '@claude-zen/foundation';

// Core CodeQL Configuration
export interface CodeQLConfig {
  /** Path to CodeQL CLI executable */
  codeqlPath?: string;
  /** Maximum memory for CodeQL operations (MB) */
  maxMemory?: number;
  /** Number of threads for parallel analysis */
  threads?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Timeout for operations (ms) */
  timeout?: number;
  /** Temporary directory for databases */
  tempDir?: string;
}

// Supported Languages
export type CodeQLLanguage =
  | 'javascript'
  | ' typescript'
  | ' python'
  | ' java'
  | ' csharp'
  | ' cpp'
  | ' go'
  | ' ruby'
  | ' swift'
  | ' kotlin';

// Database Management
export interface CodeQLDatabase {
  id: string;
}

export interface DatabaseCreationOptions {
  /** Languages to analyze */
  languages: CodeQLLanguage[];
  /** Build command for compiled languages */
  buildCommand?: string;
  /** Additional source directories */
  additionalSources?: string[];
  /** Files/patterns to exclude */
  excludePatterns?: string[];
  /** Overwrite existing database */
  overwrite?: boolean;
  /** Working directory for build commands */
  workingDirectory?: string;
  /** Environment variables for build */
  environmentVariables?: Record<string, string>;
}

// Query Execution
export interface QueryPack {
  /** Name of the query pack */
  name: string;
  /** Version of query pack */
  version?: string;
  /** Path to query pack directory */
  path?: string;
  /** Individual queries to run */
  queries?: string[];
  /** Query pack metadata */
  metadata?: Record<string, unknown>;
}

export interface QueryExecutionOptions {
  /** Output format for results */
  format: 'sarif-latest' | ' sarif-2.1.0' | ' csv' | ' json';
  /** Output file path */
  outputPath?: string;
  /** Maximum number of results per query */
  maxResults?: number;
  /** Timeout per query (ms) */
  queryTimeout?: number;
  /** Additional CLI arguments */
  additionalArgs?: string[];
}

// SARIF Result Types (Subset of SARIF 2.1.0 schema)
export interface SARIFResult {
  /** SARIF format version */
  version: string;
  /** Schema URI */
  $schema: string;
  /** Analysis runs */
  runs: SARIFRun[];
}

export interface SARIFRun {
  /** Analysis tool information */
  tool: SARIFTool;
  /** Analysis results */
  results: SARIFAnalysisResult[];
  /** Analyzed artifacts (files) */
  artifacts?: SARIFArtifact[];
  /** Analysis invocation details */
  invocations?: SARIFInvocation[];
  /** Run properties */
  properties?: Record<string, unknown>;
}

export interface SARIFTool {
  /** Tool driver (CodeQL) */
  driver: SARIFDriver;
  /** Additional tool extensions */
  extensions?: SARIFExtension[];
}

export interface SARIFDriver {
  /** Tool name */
  name: string;
  /** Tool version */
  version?: string;
  /** Information URI */
  informationUri?: string;
  /** Available rules */
  rules?: SARIFRule[];
  /** Tool notifications */
  notifications?: SARIFNotification[];
}

export interface SARIFRule {
  id: string;
};
  /** Help information */
  help?: SARIFMessage;
  /** Rule properties */
  properties?: Record<string, unknown>;
}

export interface SARIFAnalysisResult {
  /** Rule that generated this result */
  ruleId: string;
  /** Rule index in driver.rules array */
  ruleIndex?: number;
  /** Result message */
  message: SARIFMessage;
  /** Primary location of the result */
  locations: SARIFLocation[];
  /** Additional related locations */
  relatedLocations?: SARIFLocation[];
  /** Code flows (for taint tracking) */
  codeFlows?: SARIFCodeFlow[];
  /** Result severity level */
  level?: 'error' | ' warning' | ' note' | ' info';
  /** Analysis target */
  analysisTarget?: SARIFArtifactLocation;
  /** Result properties */
  properties?: Record<string, unknown>;
}

export interface SARIFMessage {
  /** Message text */
  text: string;
  /** Markdown-formatted message */
  markdown?: string;
  /** Message arguments */
  arguments?: string[];
}

export interface SARIFLocation {
  /** Physical location in source */
  physicalLocation?: SARIFPhysicalLocation;
  /** Logical location (function, class, etc.) */
  logicalLocations?: SARIFLogicalLocation[];
  /** Location message */
  message?: SARIFMessage;
  /** Location properties */
  properties?: Record<string, unknown>;
}

export interface SARIFPhysicalLocation {
  /** File artifact */
  artifactLocation: SARIFArtifactLocation;
  /** Text region */
  region?: SARIFRegion;
  /** Context region */
  contextRegion?: SARIFRegion;
}

export interface SARIFArtifactLocation {
  /** Relative file path */
  uri: string;
  /** URI base ID */
  uriBaseId?: string;
  /** File index in artifacts array */
  index?: number;
}

export interface SARIFRegion {
  /** Start line (1-based) */
  startLine: number;
  /** Start column (1-based) */
  startColumn?: number;
  /** End line (1-based) */
  endLine?: number;
  /** End column (1-based) */
  endColumn?: number;
  /** Character offset */
  charOffset?: number;
  /** Character length */
  charLength?: number;
  /** Snippet of code */
  snippet?: SARIFArtifactContent;
}

export interface SARIFLogicalLocation {
  /** Logical location name */
  name?: string;
  /** Location index */
  index?: number;
  /** Fully qualified name */
  fullyQualifiedName?: string;
  /** Decorated name */
  decoratedName?: string;
  /** Parent location index */
  parentIndex?: number;
  /** Location kind */
  kind?: string;
}

export interface SARIFCodeFlow {
  /** Thread flows */
  threadFlows: SARIFThreadFlow[];
  /** Flow message */
  message?: SARIFMessage;
}

export interface SARIFThreadFlow {
  /** Flow locations */
  locations: SARIFThreadFlowLocation[];
  /** Thread flow message */
  message?: SARIFMessage;
}

export interface SARIFThreadFlowLocation {
  /** Flow step location */
  location: SARIFLocation;
  /** Stack frame */
  stack?: SARIFStack;
  /** Execution order */
  executionOrder?: number;
  /** Location importance */
  importance?: 'important' | ' essential' | ' unimportant';
}

export interface SARIFArtifact {
  /** Artifact location */
  location?: SARIFArtifactLocation;
  /** File length */
  length?: number;
  /** MIME type */
  mimeType?: string;
  /** File contents */
  contents?: SARIFArtifactContent;
  /** File encoding */
  encoding?: string;
  /** Source language */
  sourceLanguage?: string;
  /** File hashes */
  hashes?: Record<string, string>;
}

export interface SARIFArtifactContent {
  /** Text content */
  text?: string;
  /** Binary content (base64) */
  binary?: string;
  /** Rendered content */
  rendered?: SARIFMultiformatMessageString;
}

export interface SARIFMultiformatMessageString {
  /** Plain text */
  text: string;
  /** Markdown format */
  markdown?: string;
}

export interface SARIFInvocation {
  /** Command line */
  commandLine?: string;
  /** Exit code */
  exitCode?: number;
  /** Start time */
  startTimeUtc?: string;
  /** End time */
  endTimeUtc?: string;
  /** Working directory */
  workingDirectory?: SARIFArtifactLocation;
  /** Environment variables */
  environmentVariables?: Record<string, string>;
}

export interface SARIFExtension {
  /** Extension name */
  name: string;
  /** Extension version */
  version?: string;
  /** Extension rules */
  rules?: SARIFRule[];
}

export interface SARIFNotification {
  /** Notification ID */
  id?: string;
  /** Notification message */
  message: SARIFMessage;
  /** Severity level */
  level?: 'error' | ' warning' | ' note' | ' info';
  /** Associated locations */
  locations?: SARIFLocation[];
}

export interface SARIFStack {
  /** Stack frames */
  frames: SARIFStackFrame[];
  /** Stack message */
  message?: SARIFMessage;
}

export interface SARIFStackFrame {
  /** Frame location */
  location: SARIFLocation;
  /** Module name */
  module?: string;
  /** Function name */
  function?: string;
  /** Frame parameters */
  parameters?: string[];
}

// CodeQL Analysis Results (Processed)
export interface CodeQLAnalysisResult {
  id: string;
}

export interface CodeQLFinding {
  id: string;
}

export interface SourceLocation {
  /** File path */
  filePath: string;
  /** Start line (1-based) */
  startLine: number;
  /** Start column (1-based) */
  startColumn?: number;
  /** End line (1-based) */
  endLine?: number;
  /** End column (1-based) */
  endColumn?: number;
  /** Location message */
  message?: string;
}

export interface DataFlowPath {
  /** Flow steps */
  steps: DataFlowStep[];
  /** Source of the flow */
  source: SourceLocation;
  /** Sink of the flow */
  sink: SourceLocation;
  /** Flow type */
  type: 'taint' | ' value' | ' control';
}

export interface DataFlowStep {
  /** Step location */
  location: SourceLocation;
  /** Step description */
  description: string;
  /** Step number in flow */
  stepNumber: number;
  /** Whether this is a sanitizer */
  isSanitizer?: boolean;
}

export interface SecurityClassification {
  /** CWE (Common Weakness Enumeration) ID */
  cweId?: number;
  /** OWASP Top 10 category */
  owaspCategory?: string;
  /** Security severity */
  securitySeverity: 'critical' | ' high' | ' medium' | ' low';
  /** Attack vector */
  attackVector?: 'network' | ' adjacent' | ' local' | ' physical';
  /** Exploitability score (0-1) */
  exploitability?: number;
}

export interface FixSuggestion {
  /** Suggested fix description */
  description: string;
  /** File to modify */
  filePath: string;
  /** Text replacement */
  replacement?: TextReplacement;
  /** Confidence in fix (0-1) */
  confidence: number;
  /** Fix type */
  type: 'replace' | ' insert' | ' delete' | ' rewrite';
}

export interface TextReplacement {
  /** Original text to replace */
  originalText: string;
  /** New text */
  newText: string;
  /** Location of replacement */
  location: SourceLocation;
}

export interface AnalysisMetadata {
  /** Analysis start time */
  startTime: Date;
  /** Analysis end time */
  endTime: Date;
  /** CodeQL version used */
  codeqlVersion: string;
  /** Query pack versions */
  queryPackVersions: Record<string, string>;
  /** Analysis configuration */
  configuration: Record<string, unknown>;
}

export interface AnalysisMetrics {
  /** Total analysis duration (ms) */
  durationMs: number;
  /** Database size (bytes) */
  databaseSizeBytes: number;
  /** Files analyzed */
  filesAnalyzed: number;
  /** Lines of code analyzed */
  linesAnalyzed: number;
  /** Memory usage peak (MB) */
  peakMemoryMb: number;
  /** CPU time used (ms) */
  cpuTimeMs: number;
}

// Error Types
export interface CodeQLError extends Error {
  /** Error type */
  type: 'config' | ' database' | ' query' | ' parse' | ' system';
  /** Error code */
  code?: string | number;
  /** Command that failed */
  command?: string;
  /** Exit code */
  exitCode?: number;
  /** Standard error output */
  stderr?: string;
}

// API Response Types
export type DatabaseCreationResult = Result<CodeQLDatabase, CodeQLError>;
export type QueryExecutionResult = Result<CodeQLAnalysisResult, CodeQLError>;
export type DatabaseListResult = Result<CodeQLDatabase[], CodeQLError>;

// Event Types for Integration
export interface CodeQLEvents {
  'database-created': { database: CodeQLDatabase };
  'database-deleted': { databaseId: string };
  'analysis-started': { database: CodeQLDatabase; queryPacks: QueryPack[] };
  'analysis-completed': { result: CodeQLAnalysisResult };
  'analysis-failed': { error: CodeQLError };
  'finding-discovered': { finding: CodeQLFinding };
}

// Utility Types
export type CodeQLEventType = keyof CodeQLEvents;
export type CodeQLEventData<T extends CodeQLEventType> = CodeQLEvents[T];
