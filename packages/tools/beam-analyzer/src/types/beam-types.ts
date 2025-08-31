/**
 * @fileoverview BEAM Analyzer TypeScript Type Definitions
 * Comprehensive types for BEAM ecosystem static analysis and security scanning
 */

import type { Result} from '@claude-zen/foundation';

// BEAM Language Types
export type BeamLanguage = 'erlang|elixir|gleam|lfe';

// BEAM Analysis Configuration
export interface BeamAnalysisConfig {
  /** Languages to analyze */
  languages?:BeamLanguage[];
  /** Enable Dialyzer analysis */
  useDialyzer?:boolean;
  /** Enable Sobelow security scanning (Elixir) */
  useSobelow?:boolean;
  /** Enable Elvis style checking (Erlang) */
  useElvis?:boolean;
  /** Custom analysis rules */
  customRules?:BeamAnalysisRule[];
  /** Maximum analysis timeout (ms) */
  timeout?:number;
  /** Include dependencies in analysis */
  includeDeps?:boolean;
  /** OTP version to target */
  otpVersion?:string;
}

// BEAM Project Structure
export interface BeamProject {
  /** Project root directory */
  root: string;
  /** Detected language */
  language: BeamLanguage;
  /** Additional languages found */
  additionalLanguages?:BeamLanguage[];
  /** Build tool (mix, rebar3, gleam) */
  buildTool: BeamBuildTool;
  /** OTP applications found */
  applications: BeamApplication[];
  /** Dependencies */
  dependencies: BeamDependency[];
  /** Configuration files */
  configFiles: string[];
}

export type BeamBuildTool = 'mix|rebar3|gleam|lfetool|unknown';

export interface BeamApplication {
  /** Application name */
  name: string;
  /** Application type */
  type:'application' | ' library' | ' release';
  /** Entry point module */
  entryPoint?:string;
  /** Supervision tree root */
  supervisor?:string;
  /** Source directories */
  sourceDirs: string[];
  /** Test directories */
  testDirs: string[];
}

export interface BeamDependency {
  /** Package name */
  name: string;
  /** Version specification */
  version: string;
  /** Dependency source */
  source: 'hex' | 'git' | 'path' | 'unknown';
  /** Security vulnerabilities */
  vulnerabilities?:BeamVulnerability[];
}

// BEAM Analysis Results
export interface BeamAnalysisResult {
  /** Project information */
  project: BeamProject;
  /** Analysis findings */
  findings: BeamFinding[];
  /** Performance metrics */
  metrics: BeamAnalysisMetrics;
  /** Tool-specific results */
  toolResults:{
    dialyzer?:DialyzerResult;
    sobelow?:SobelowResult;
    elvis?:ElvisResult;
    custom?:CustomAnalysisResult[];
};
}

export interface BeamFinding {
  id: string;
}

export type BeamSeverity = 'info'|' low'|' medium'|' high'|' critical';

export type BeamFindingCategory = 'security'|' performance'|' reliability'|' maintainability'|' otp-patterns'|' concurrency'|' fault-tolerance'|' type-safety';

export interface BeamLocation {
  /** File path */
  file: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column?:number;
  /** End line */
  endLine?:number;
  /** End column */
  endColumn?:number;
  /** Function/module context */
  context?:string;
}

export type BeamAnalysisTool = 'dialyzer'|' sobelow'|' elvis'|' xref'|' custom'|' beam-analyzer';

export interface BeamFixSuggestion {
  /** Human-readable description */
  description: string;
  /** Automated fix if available */
  fix?:BeamAutomatedFix;
  /** Confidence in fix */
  confidence: number;
}

export interface BeamAutomatedFix {
  /** Text to replace */
  original: string;
  /** Replacement text */
  replacement: string;
  /** Additional files to modify */
  additionalChanges?:Array<{
    file: string;
    original: string;
    replacement: string;
}>;
}

// Tool-Specific Result Types
export interface DialyzerResult {
  /** Warnings found */
  warnings: DialyzerWarning[];
  /** Success typing information */
  successTypings?:SuccessTyping[];
  /** PLT (Persistent Lookup Table) info */
  pltInfo?:{
    file: string;
    modules: string[];
    lastModified: Date;
};
}

export interface DialyzerWarning {
  /** Warning type */
  type: DialyzerWarningType;
  /** Function signature */
  function: string;
  /** Warning message */
  message: string;
  /** Location information */
  location: BeamLocation;
}

export type DialyzerWarningType = 'no_return'|' unused_fun'|' undef'|' unknown_function'|' unknown_type'|' race_condition'|' contract_types'|' invalid_contract'|' pattern_match'|' opaque'|' specdiffs';

export interface SuccessTyping {
  /** Function name */
  function: string;
  /** Inferred type */
  type: string;
  /** Module name */
  module: string;
}

export interface SobelowResult {
  /** Security findings */
  findings: SobelowFinding[];
  /** Phoenix-specific issues */
  phoenixIssues?:PhoenixSecurityIssue[];
  /** Configuration issues */
  configIssues?:ConfigSecurityIssue[];
}

export interface SobelowFinding {
  /** Security category */
  category: SobelowCategory;
  /** Confidence level */
  confidence:'high' | ' medium' | ' low';
  /** Details */
  details: string;
  /** Location */
  location: BeamLocation;
  /** OWASP classification */
  owasp?:string;
  /** CWE classification */
  cwe?:number;
}

export type SobelowCategory = 'sql_injection'|' xss'|' csrf'|' directory_traversal'|' command_injection'|' code_injection'|' redirect'|' traversal'|' rce'|' dos'|' misc';

export interface PhoenixSecurityIssue {
  /** Issue type */
  type: PhoenixIssueType;
  /** Controller/view affected */
  component: string;
  /** Risk level */
  risk: BeamSeverity;
  /** Mitigation suggestion */
  mitigation: string;
}

export type PhoenixIssueType = 
  | 'unsafe_params'
  | 'missing_csrf'
  | 'weak_session'
  | 'insecure_headers'
  | 'unsafe_redirect'
  | 'mass_assignment'
  | 'weak_crypto';

export interface ConfigSecurityIssue {
  /** Configuration file */
  file: string;
  /** Setting name */
  setting: string;
  /** Issue description */
  issue: string;
  /** Recommended value */
  recommendation: string;
}

export interface ElvisResult {
  /** Style violations */
  violations: ElvisViolation[];
  /** Rules that passed */
  passed: string[];
  /** Rules that failed */
  failed: string[];
}

export interface ElvisViolation {
  /** Rule name */
  rule: string;
  /** Violation message */
  message: string;
  /** Location */
  location: BeamLocation;
  /** Rule category */
  category: ElvisCategory;
}

export type ElvisCategory = 'line_length'|' no_tabs'|' no_trailing_whitespace'|' macro_names'|' operator_spaces'|' nesting_level'|' function_naming'|' variable_naming'|' module_naming';

export interface CustomAnalysisResult {
  /** Rule name */
  rule: string;
  /** Analysis type */
  type: 'pattern' | 'security' | 'performance' | 'otp';
  /** Findings */
  findings: BeamFinding[];
  /** Execution time */
  executionTime: number;
}

// Analysis Rules
export interface BeamAnalysisRule {
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Rule severity */
  severity: BeamSeverity;
  /** Languages this rule applies to */
  languages: BeamLanguage[];
  /** Pattern to match */
  pattern: BeamPattern;
  /** Message template */
  messageTemplate: string;
  /** Fix suggestion */
  fixSuggestion?:string;
}

export interface BeamPattern {
  /** Pattern type */
  type: 'ast|regex|function_call|module_attribute;
'  /** Pattern expression */
  expression: string;
  /** Additional constraints */
  constraints?:Record<string, unknown>;
}

// Metrics and Performance
export interface BeamAnalysisMetrics {
  /** Total analysis time */
  totalTime: number;
  /** Files analyzed */
  filesAnalyzed: number;
  /** Lines of code analyzed */
  linesOfCode: number;
  /** Functions analyzed */
  functions: number;
  /** Modules analyzed */
  modules: number;
  /** Processes identified */
  processes?:number;
  /** GenServer instances */
  genServers?:number;
  /** Supervisor trees */
  supervisors?:number;
  /** Performance breakdown */
  breakdown:{
    parsing: number;
    dialyzer?:number;
    sobelow?:number;
    elvis?:number;
    custom: number;
};
}

// Vulnerability Information
export interface BeamVulnerability {
  /** CVE identifier */
  cve?:string;
  /** Severity score */
  severity: number;
  /** Description */
  description: string;
  /** Affected versions */
  affectedVersions: string[];
  /** Fixed version */
  fixedVersion?:string;
  /** OWASP category */
  owasp?:string;
  /** CWE classification */
  cwe?:number;
}

// Execution Context
export interface BeamAnalysisContext {
  /** Working directory */
  workingDirectory: string;
  /** Environment variables */
  environment: Record<string, string>;
  /** Tool versions */
  toolVersions:{
    erlang?:string;
    elixir?:string;
    gleam?:string;
    dialyzer?:string;
    sobelow?:string;
    elvis?:string;
};
  /** Available tools */
  availableTools: BeamAnalysisTool[];
}

// Error Types
export interface BeamAnalysisError {
  /** Error code */
  code: BeamErrorCode;
  /** Error message */
  message: string;
  /** Tool that failed */
  tool?:BeamAnalysisTool;
  /** Additional context */
  context?:Record<string, unknown>;
  /** Original error */
  originalError?:Error;
}

export type BeamErrorCode =|'TOOL_NOT_FOUND|COMPILATION_FAILED|TIMEOUT|INVALID_PROJECT|PERMISSION_DENIED|NETWORK_ERROR|CONFIGURATION_ERROR|ANALYSIS_FAILED;

// Result Wrapper Types
export type BeamAnalysisExecutionResult = Result<
  BeamAnalysisResult,
  BeamAnalysisError
>;
export type BeamProjectDetectionResult = Result<BeamProject, BeamAnalysisError>;
export type BeamToolExecutionResult = Result<unknown, BeamAnalysisError>;
