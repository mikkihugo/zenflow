/**
 * @fileoverview Battle-hardened repository analysis types
 * Professional-grade types for comprehensive repository analysis
 */

export interface RepositoryMetrics {
  id: string;
  name: string;
  path: string;
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>; // language -> line count
  complexity: ComplexityMetrics;
  dependencies: DependencyMetrics;
  domains: Domain[];
  gitMetrics?: GitMetrics;
  analysisTimestamp: Date;
}

export interface ComplexityMetrics {
  cyclomatic: number; // Cyclomatic complexity
  halstead: HalsteadMetrics; // Halstead complexity measures
  maintainabilityIndex: number; // Microsoft maintainability index
  technicalDebt: number; // Estimated technical debt hours
  codeSmells: CodeSmell[]; // Identified code smells
  hotspots: ComplexityHotspot[]; // Most complex areas
}

export interface HalsteadMetrics {
  vocabulary: number; // n = n1 + n2
  length: number; // N = N1 + N2
  difficulty: number; // D = (n1/2) * (N2/n2)
  effort: number; // E = D * V
  time: number; // T = E / 18
  bugs: number; // B = V / 3000
  volume: number; // V = N * log2(n)
}

export interface CodeSmell {
  type:
    | 'long-method'
    | 'large-class'
    | 'duplicate-code'
    | 'dead-code'
    | 'god-class'
    | 'feature-envy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  startLine: number;
  endLine: number;
  description: string;
  suggestion: string;
}

export interface ComplexityHotspot {
  file: string;
  function?: string;
  class?: string;
  complexity: number;
  lines: number;
  maintainabilityIndex: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface DependencyMetrics {
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  circularDependencies: CircularDependency[];
  dependencyGraph: DependencyGraph;
  coupling: CouplingMetrics;
  cohesion: CohesionMetrics;
  stability: StabilityMetrics;
}

export interface CircularDependency {
  cycle: string[]; // File paths in the cycle
  severity: 'warning' | 'error';
  impactScore: number; // 0-1 impact on codebase
  suggestions: string[]; // How to break the cycle
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  clusters: DependencyCluster[];
}

export interface DependencyNode {
  id: string;
  file: string;
  type: 'module' | 'component' | 'service' | 'utility' | 'test';
  size: number; // Lines of code
  complexity: number;
  stability: number; // 0-1 stability score
}

export interface DependencyEdge {
  from: string;
  to: string;
  weight: number; // Coupling strength
  type: 'import' | 'require' | 'dynamic-import' | 'type-only';
}

export interface DependencyCluster {
  id: string;
  nodes: string[];
  cohesion: number; // 0-1 internal cohesion
  coupling: number; // 0-1 external coupling
  domain?: string; // Identified domain
}

export interface CouplingMetrics {
  afferentCoupling: number; // Ca - incoming dependencies
  efferentCoupling: number; // Ce - outgoing dependencies
  instability: number; // I = Ce / (Ca + Ce)
  abstractness: number; // A = abstract classes / total classes
  distance: number; // D = |A + I - 1|
}

export interface CohesionMetrics {
  lcom: number; // Lack of Cohesion of Methods
  tcc: number; // Tight Class Cohesion
  lcc: number; // Loose Class Cohesion
}

export interface StabilityMetrics {
  stabilityIndex: number; // 0-1 overall stability
  changeFrequency: number; // Changes per time period
  bugFrequency: number; // Bugs per time period
  riskScore: number; // 0-1 risk assessment
}

export interface GitMetrics {
  totalCommits: number;
  contributors: number;
  averageCommitsPerDay: number;
  fileChangeFrequency: Record<string, number>;
  hotFiles: GitHotFile[]; // Files changed most frequently
  contributorStats: ContributorStats[];
  branchMetrics: BranchMetrics;
}

export interface GitHotFile {
  file: string;
  changeCount: number;
  lastChanged: Date;
  contributors: number;
  complexity: number;
  riskScore: number; // High change + high complexity = high risk
}

export interface ContributorStats {
  author: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesModified: number;
  firstCommit: Date;
  lastCommit: Date;
}

export interface BranchMetrics {
  totalBranches: number;
  activeBranches: number;
  averageBranchLifetime: number; // days
  mergeConflictRate: number; // percentage
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  files: string[];
  dependencies: string[]; // Other domain IDs
  complexity: number; // 0-1 complexity score
  cohesion: number; // 0-1 internal cohesion
  coupling: number; // 0-1 external coupling
  size: DomainSize;
  type: DomainType;
  splitRecommendation?: SplitRecommendation;
  metadata: Record<string, any>;
}

export interface DomainSize {
  files: number;
  lines: number;
  functions: number;
  classes: number;
  interfaces: number;
}

export type DomainType =
  | 'core' // Central business logic
  | 'feature' // Feature-specific code
  | 'infrastructure' // Infrastructure/framework code
  | 'utility' // Shared utilities
  | 'api' // API/interface layer
  | 'ui' // User interface
  | 'data' // Data access layer
  | 'test'; // Test code

export interface SplitRecommendation {
  shouldSplit: boolean;
  confidence: number; // 0-1 confidence in recommendation
  reasons: string[];
  suggestedSplits: SuggestedSplit[];
  estimatedEffort: EffortEstimate;
  benefits: SplitBenefits;
  risks: SplitRisk[];
}

export interface SuggestedSplit {
  newDomainName: string;
  files: string[];
  rationale: string;
  complexity: number;
  dependencies: string[];
}

export interface EffortEstimate {
  hours: number;
  difficulty: 'low' | 'medium' | 'high' | 'very-high';
  phases: EffortPhase[];
}

export interface EffortPhase {
  name: string;
  description: string;
  estimatedHours: number;
  dependencies: string[]; // Other phase names
  risks: string[];
}

export interface SplitBenefits {
  complexityReduction: number; // Percentage reduction
  maintainabilityImprovement: number;
  testabilityImprovement: number;
  teamVelocityImprovement: number;
  deploymentRiskReduction: number;
}

export interface SplitRisk {
  type:
    | 'data-consistency'
    | 'performance'
    | 'complexity'
    | 'team-coordination'
    | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  probability: number; // 0-1 probability
  impact: number; // 0-1 impact if occurs
}

export interface AnalysisOptions {
  includeTests?: boolean;
  includeNodeModules?: boolean;
  maxFileSize?: number; // Skip files larger than this (bytes)
  excludePatterns?: string[]; // Glob patterns to exclude
  includeDotFiles?: boolean;
  analysisDepth?: 'shallow' | 'moderate' | 'deep' | 'comprehensive';
  enableGitAnalysis?: boolean;
  enableComplexityAnalysis?: boolean;
  enableDependencyAnalysis?: boolean;
  enableDomainAnalysis?: boolean;
  complexityThresholds?: ComplexityThresholds;
  performanceMode?: 'fast' | 'balanced' | 'thorough';
}

export interface ComplexityThresholds {
  cyclomaticComplexity: number; // Default: 10
  maintainabilityIndex: number; // Default: 20
  linesOfCode: number; // Default: 300
  parameters: number; // Default: 7
  nestingDepth: number; // Default: 4
}

export interface AnalysisResult {
  repository: RepositoryMetrics;
  domains: Domain[];
  recommendations: AnalysisRecommendation[];
  summary: AnalysisSummary;
  exportOptions: ExportFormat[];
}

export interface AnalysisRecommendation {
  type:
    | 'split-domain'
    | 'merge-domains'
    | 'refactor-hotspot'
    | 'reduce-coupling'
    | 'improve-cohesion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  rationale: string;
  effort: EffortEstimate;
  benefits: string[];
  risks: string[];
  actionItems: ActionItem[];
}

export interface ActionItem {
  description: string;
  type:
    | 'code-change'
    | 'architecture-change'
    | 'process-change'
    | 'tooling-change';
  estimatedHours: number;
  dependencies: string[];
}

export interface AnalysisSummary {
  overallScore: number; // 0-1 overall repository health
  strengths: string[];
  weaknesses: string[];
  criticalIssues: number;
  highPriorityRecommendations: number;
  estimatedImprovementEffort: number; // Total hours
  riskAssessment: RiskAssessment;
}

export interface RiskAssessment {
  technicalDebtRisk: 'low' | 'medium' | 'high' | 'critical';
  maintainabilityRisk: 'low' | 'medium' | 'high' | 'critical';
  scalabilityRisk: 'low' | 'medium' | 'high' | 'critical';
  teamVelocityRisk: 'low' | 'medium' | 'high' | 'critical';
}

export type ExportFormat =
  | 'json'
  | 'yaml'
  | 'csv'
  | 'html'
  | 'markdown'
  | 'pdf'
  | 'graphml'
  | 'dot';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-1 validation score
}

export interface ValidationError {
  type: string;
  severity: 'error' | 'warning';
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning';
}
