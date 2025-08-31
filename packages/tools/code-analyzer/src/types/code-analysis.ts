/**
 * @fileoverview Code Analysis Types for Development Facade
 * Comprehensive type definitions for live code analysis and development tools
 */

export interface CodeAnalysisOptions {
  // Analysis scope
  includeTests?: boolean;
  includeNodeModules?: boolean;
  includeDotFiles?: boolean;
  maxFileSize?: number;
  excludePatterns?: string[];

  // Analysis depth
  analysisMode?: 'syntax' | 'semantic' | 'intelligent' | 'comprehensive';
  realTimeAnalysis?: boolean;
  enableWatching?: boolean;

  // AI-powered features
  enableAIRecommendations?: boolean;
  enableAILinting?: boolean;
  enableAIRefactoring?: boolean;
  enableContextualAnalysis?: boolean;

  // Performance settings
  batchSize?: number;
  throttleMs?: number;
  cachingEnabled?: boolean;
  parallelProcessing?: boolean;

  // Language support
  languages?: SupportedLanguage[];
  tsConfigPath?: string;
  babelConfigPath?: string;

  // Integration settings
  enableVSCodeIntegration?: boolean;
  enableIDEIntegration?: boolean;
  enableCIIntegration?: boolean;
}

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'tsx'
  | 'jsx'
  | 'vue'
  | 'svelte'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'cpp'
  | 'csharp';

export interface CodeAnalysisResult {
  id: string;
}

export interface ASTAnalysis {
  nodeCount: number;
  depth: number;
  complexity: number;
  patterns: DetectedPattern[];
  imports: ImportDeclaration[];
  exports: ExportDeclaration[];
  declarations: Declaration[];
  references: Reference[];
}

export interface SemanticAnalysis {
  scopes: Scope[];
  bindings: Binding[];
  typeInformation: TypeInfo[];
  controlFlow: ControlFlowGraph;
  dataFlow: DataFlowGraph;
  callGraph: CallGraph;
}

export interface CodeQualityMetrics {
  // Basic metrics
  linesOfCode: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;

  // Advanced metrics
  halsteadMetrics: HalsteadMetrics;
  couplingMetrics: CouplingMetrics;
  cohesionMetrics: CohesionMetrics;

  // Code smells
  codeSmells: CodeSmell[];
  antiPatterns: AntiPattern[];
  designPatterns: DesignPattern[];

  // Security analysis
  securityIssues: SecurityIssue[];
  vulnerabilities: Vulnerability[];
}

export interface CodeSuggestion {
  id: string;
}

export type SuggestionType =
  | 'syntax-error'
  | 'type-error'
  | 'code-smell'
  | 'performance'
  | 'security'
  | 'accessibility'
  | 'best-practice'
  | 'refactoring'
  | 'modernization'
  | 'optimization';

export interface AICodeInsights {
  // AI-powered analysis
  intentAnalysis: IntentAnalysis;
  complexityAssessment: ComplexityAssessment;
  refactoringOpportunities: RefactoringOpportunity[];

  // Contextual understanding
  businessLogicAnalysis: BusinessLogicAnalysis;
  architecturalPatterns: ArchitecturalPattern[];
  technicalDebtAssessment: TechnicalDebtAssessment;

  // Predictive insights
  bugPrediction: BugPrediction;
  maintenancePrediction: MaintenancePrediction;
  performancePrediction: PerformancePrediction;

  // Learning insights
  skillGapAnalysis: SkillGapAnalysis;
  learningRecommendations: LearningRecommendation[];
}

export interface LiveAnalysisSession {
  id: string;
}

export interface AnalysisQueueItem {
  id: string;
}

export interface SessionMetrics {
  analysisLatency: LatencyMetrics;
  throughput: ThroughputMetrics;
  resourceUsage: ResourceUsageMetrics;
  errorRates: ErrorRateMetrics;
  cacheMetrics: CacheMetrics;
}

// Supporting interfaces
export interface DetectedPattern {
  type: string;
  name: string;
  confidence: number;
  location: SourceRange;
  description: string;
}

export interface ImportSpecifier {
  name: string;
  alias?: string;
  kind: 'named' | 'default' | 'namespace';
}

export interface ImportDeclaration {
  source: string;
  specifiers: ImportSpecifier[];
  kind: 'import' | 'require' | 'dynamic-import';
  location: SourceRange;
}

export interface ExportDeclaration {
  name: string;
  kind: 'named' | 'default' | 'namespace';
  source?: string;
  location: SourceRange;
}

export interface Declaration {
  name: string;
  kind: 'variable' | 'function' | 'class' | 'interface' | 'type' | 'enum';
  scope: string;
  location: SourceRange;
  typeAnnotation?: TypeInfo;
}

export interface Reference {
  name: string;
  kind: 'read' | 'write' | 'call';
  declaration?: Declaration;
  location: SourceRange;
}

export interface Scope {
  id: string;
}

export interface Binding {
  name: string;
  kind: 'var' | 'let' | 'const' | 'function' | 'class' | 'parameter';
  scope: string;
  references: Reference[];
  typeInfo?: TypeInfo;
}

export interface TypeInfo {
  type: string;
  primitive: boolean;
  nullable: boolean;
  generic: boolean;
  union: boolean;
  intersection: boolean;
  properties?: TypeProperty[];
  methods?: TypeMethod[];
}

export interface TypeProperty {
  name: string;
  type: string;
  optional: boolean;
  readonly: boolean;
}

export interface TypeMethod {
  name: string;
  parameters: TypeProperty[];
  returnType: string;
  accessibility: 'public' | 'private' | 'protected';
}

export interface ControlFlowNode {
  id: string;
}

export interface ControlFlowEdge {
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

export interface ControlFlowGraph {
  nodes: ControlFlowNode[];
  edges: ControlFlowEdge[];
  entryPoints: string[];
  exitPoints: string[];
}

export interface DataFlowNode {
  id: string;
}

export interface DataFlowEdge {
  from: string;
  to: string;
  variable: string;
  flowType: 'def-use' | 'use-def' | 'def-def';
}

export interface Definition {
  variable: string;
  location: SourceRange;
  type: string;
  scope: string;
}

export interface Use {
  variable: string;
  location: SourceRange;
  scope: string;
}

export interface DataFlowGraph {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  definitions: Definition[];
  uses: Use[];
}

export interface CallGraphNode {
  id: string;
}

export interface CallGraphEdge {
  from: string;
  to: string;
  callType: 'direct' | 'indirect' | 'virtual' | 'dynamic';
  location: SourceRange;
}

export interface RecursiveCall {
  function: string;
  depth: number;
  location: SourceRange;
}

export interface CallGraph {
  nodes: CallGraphNode[];
  edges: CallGraphEdge[];
  entryPoints: string[];
  recursiveCalls: RecursiveCall[];
}

export interface HalsteadMetrics {
  vocabulary: number;
  length: number;
  difficulty: number;
  effort: number;
  time: number;
  bugs: number;
  volume: number;
}

export interface CouplingMetrics {
  afferentCoupling: number;
  efferentCoupling: number;
  instability: number;
  abstractness: number;
  distance: number;
}

export interface CohesionMetrics {
  lcom: number;
  tcc: number;
  lcc: number;
  scom: number;
}

export interface CodeSmell {
  type: CodeSmellType;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location: SourceRange;
  suggestion: string;
  autoFixable: boolean;
}

export type CodeSmellType =
  | 'long-method'
  | 'large-class'
  | 'duplicate-code'
  | 'dead-code'
  | 'god-class'
  | 'feature-envy'
  | 'data-clumps'
  | 'primitive-obsession'
  | 'switch-statements'
  | 'lazy-class'
  | 'speculative-generality'
  | 'temporary-field'
  | 'message-chains'
  | 'middle-man'
  | 'inappropriate-intimacy'
  | 'alternative-classes-with-different-interfaces'
  | 'refused-bequest'
  | 'comments';

export interface AntiPattern {
  name: string;
  category: 'architectural' | 'design' | 'implementation' | 'organizational';
  description: string;
  consequences: string[];
  refactoringApproach: string[];
  location: SourceRange;
  confidence: number;
}

export interface DesignPattern {
  name: string;
  category: 'creational' | 'structural' | 'behavioral';
  description: string;
  participants: string[];
  location: SourceRange;
  confidence: number;
  wellImplemented: boolean;
  improvements?: string[];
}

export interface SecurityIssue {
  type: SecurityIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: SourceRange;
  cweId?: string;
  cveId?: string;
  remediation: string;
  falsePositive: boolean;
}

export type SecurityIssueType =
  | 'injection'
  | 'authentication'
  | 'authorization'
  | 'data-exposure'
  | 'xml-entities'
  | 'broken-access-control'
  | 'security-misconfiguration'
  | 'xss'
  | 'insecure-deserialization'
  | 'vulnerable-components'
  | 'insufficient-logging';

export interface Vulnerability {
  id: string;
}

export interface SourceRange {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface CodeFix {
  title: string;
  description: string;
  edits: TextEdit[];
  imports?: ImportEdit[];
  confidence: number;
  impact: ImpactAssessment;
}

export interface TextEdit {
  range: SourceRange;
  newText: string;
}

export interface ImportEdit {
  action: 'add' | 'remove' | 'modify';
  source: string;
  specifiers: string[];
  location?: SourceRange;
}

export interface ImpactAssessment {
  scope: 'file' | 'module' | 'project' | 'codebase';
  breakingChange: boolean;
  testingRequired: boolean;
  performanceImpact: 'positive' | 'neutral' | 'negative';
  maintainabilityImpact: 'positive' | 'neutral' | 'negative';
  estimatedEffort: number; // in minutes
}

// AI-specific interfaces
export interface IntentAnalysis {
  primaryIntent: string;
  secondaryIntents: string[];
  businessDomain: string;
  technicalDomain: string;
  confidence: number;
}

export interface ComplexityAssessment {
  overallComplexity: 'low' | 'medium' | 'high' | 'very-high';
  complexityFactors: ComplexityFactor[];
  reductionOpportunities: ComplexityReduction[];
  cognitiveLoad: number;
}

export interface RefactoringOpportunity {
  type: RefactoringType;
  description: string;
  benefits: string[];
  effort: number;
  impact: ImpactAssessment;
  steps: RefactoringStep[];
  prerequisites: string[];
}

export type RefactoringType =
  | 'extract-method'
  | 'extract-class'
  | 'move-method'
  | 'rename'
  | 'introduce-parameter'
  | 'inline-method'
  | 'replace-conditional'
  | 'decompose-conditional'
  | 'consolidate-conditional'
  | 'replace-nested-conditional'
  | 'introduce-null-object'
  | 'replace-type-code'
  | 'replace-subclass'
  | 'extract-interface'
  | 'collapse-hierarchy'
  | 'form-template-method'
  | 'substitute-algorithm';

export interface BusinessLogicAnalysis {
  businessRules: BusinessRule[];
  workflows: Workflow[];
  entities: BusinessEntity[];
  relationships: BusinessRelationship[];
  complexity: BusinessComplexity;
}

export interface ArchitecturalPattern {
  name: string;
  category: string;
  description: string;
  adherence: number;
  violations: PatternViolation[];
  recommendations: string[];
}

export interface TechnicalDebtAssessment {
  totalDebt: number; // in hours
  debtByCategory: Record<string, number>;
  hotspots: TechnicalDebtHotspot[];
  trend: 'improving' | 'stable' | 'declining' | 'worsening';
  payoffStrategies: PayoffStrategy[];
}

export interface BugPrediction {
  riskScore: number;
  factors: RiskFactor[];
  historicalAnalysis: HistoricalBugData;
  recommendations: BugPreventionRecommendation[];
}

export interface MaintenancePrediction {
  maintainabilityScore: number;
  futureEffort: EffortPrediction;
  changeProneness: ChangeProneness;
  evolutionaryHotspots: EvolutionaryHotspot[];
}

export interface PerformancePrediction {
  performanceScore: number;
  bottlenecks: PerformanceBottleneck[];
  scalabilityAssessment: ScalabilityAssessment;
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface SkillGapAnalysis {
  requiredSkills: Skill[];
  demonstratedSkills: Skill[];
  gaps: SkillGap[];
  strengths: Skill[];
}

export interface Skill {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'pattern' | 'domain';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;
}

export interface SkillGap {
  skill: string;
  required: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  current: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'none';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface LearningResource {
  type: 'documentation' | 'tutorial' | 'course' | 'book' | 'practice';
  title: string;
  url?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  skills: string[];
}

export interface LearningRecommendation {
  skill: string;
  priority: 'low' | 'medium' | 'high';
  resources: LearningResource[];
  estimatedTime: number;
  prerequisites: string[];
}

// Event and notification interfaces
export interface EventHandler {
  event: AnalysisEvent;
  handler: (data: any) => void;
}

export type AnalysisEvent =
  | 'analysis-started'
  | 'analysis-completed'
  | 'analysis-failed'
  | 'file-changed'
  | 'suggestion-generated'
  | 'error-detected'
  | 'performance-threshold-exceeded';

export interface Notification {
  id: string;
}

export interface NotificationAction {
  label: string;
  action: string;
  primary?: boolean;
}

// Metrics interfaces
export interface LatencyMetrics {
  avg: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

export interface ThroughputMetrics {
  filesPerSecond: number;
  linesPerSecond: number;
  operationsPerSecond: number;
}

export interface ResourceUsageMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskIO: number;
  networkIO: number;
}

export interface ErrorRateMetrics {
  parseErrors: number;
  analysisErrors: number;
  overallErrorRate: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  size: number;
  evictions: number;
}

// Re-export types from extended-types to fix compilation
export type * from './extended-types';

// Missing type definitions to fix compilation errors
export interface ComplexityFactor {
  type: string;
  weight: number;
  description: string;
}

export interface ComplexityReduction {
  type: string;
  potential: number;
  description: string;
}

export interface RefactoringStep {
  description: string;
  order: number;
  effort: number;
}

export interface BusinessRule {
  id: string;
}

export interface Workflow {
  id: string;
}

export interface BusinessEntity {
  name: string;
  type: string;
  properties: string[];
}

export interface BusinessRelationship {
  from: string;
  to: string;
  type: string;
}

export interface BusinessComplexity {
  score: number;
  factors: string[];
}

// Removed duplicate ArchitecturalPattern - already defined above with more complete structure

export interface PatternViolation {
  pattern: string;
  violation: string;
  location: SourceRange;
}

export interface TechnicalDebtHotspot {
  location: SourceRange;
  debt: number;
  type: string;
}

export interface PayoffStrategy {
  description: string;
  effort: number;
  impact: number;
}

export interface RiskFactor {
  type: string;
  severity: number;
  description: string;
}

export interface HistoricalBugData {
  bugCount: number;
  patterns: string[];
}

export interface BugPreventionRecommendation {
  type: string;
  description: string;
  confidence: number;
}

export interface EffortPrediction {
  hours: number;
  confidence: number;
}

export interface ChangeProneness {
  score: number;
  factors: string[];
}

export interface EvolutionaryHotspot {
  location: SourceRange;
  changeFrequency: number;
  complexity: number;
}

export interface PerformanceBottleneck {
  location: SourceRange;
  type: string;
  severity: number;
}

export interface ScalabilityAssessment {
  score: number;
  concerns: string[];
}

export interface OptimizationOpportunity {
  type: string;
  description: string;
  impact: number;
  effort: number;
}
