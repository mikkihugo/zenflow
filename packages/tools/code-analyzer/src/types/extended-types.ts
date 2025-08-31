/**
 * Extended Types for Code Analysis
 * Comprehensive type definitions for advanced analysis features
 */

// AST-related types
export interface ImportSpecifier {
  name: string;
  alias?: string;
  kind: 'named' | 'default' | 'namespace';
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

// Control flow types
export interface ControlFlowNode {
  id: string;
}

export interface ControlFlowEdge {
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

// Data flow types
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
  location: CodeLocation;
  type: string;
  scope: string;
}

export interface Use {
  variable: string;
  location: CodeLocation;
  scope: string;
}

// Call graph types
export interface CallGraphNode {
  id: string;
}

export interface CallGraphEdge {
  from: string;
  to: string;
  callType: 'direct' | 'indirect' | 'virtual' | 'dynamic';
  location: CodeLocation;
}

export interface RecursiveCall {
  function: string;
  depth: number;
  location: CodeLocation;
}

// AI Analysis types
export interface ComplexityFactor {
  type: 'cyclomatic' | 'cognitive' | 'nesting' | 'coupling' | 'cohesion';
  value: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface ComplexityReduction {
  type:
    | 'extract-method'
    | 'extract-class'
    | 'simplify-condition'
    | 'reduce-nesting';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface RefactoringStep {
  id: string;
}

// Business logic types
export interface BusinessRule {
  id: string;
}

export interface Workflow {
  id: string;
}

export interface WorkflowStep {
  id: string;
}

export interface WorkflowData {
  name: string;
  type: string;
  required: boolean;
  validation?: string;
}

export interface BusinessEntity {
  name: string;
  attributes: EntityAttribute[];
  relationships: BusinessRelationship[];
  operations: EntityOperation[];
}

export interface EntityAttribute {
  name: string;
  type: string;
  required: boolean;
  constraints: string[];
}

export interface EntityOperation {
  name: string;
  type: 'create' | 'read' | 'update' | 'delete' | 'business';
  parameters: EntityAttribute[];
  returns: string;
}

export interface BusinessRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  description: string;
  constraints: string[];
}

export interface BusinessComplexity {
  score: number;
  factors: ComplexityFactor[];
}

// Architecture types
export interface PatternViolation {
  pattern: string;
  violation: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  location: CodeLocation;
  suggestion: string;
}

// Technical debt types
export interface TechnicalDebtHotspot {
  file: string;
  debt: number;
  category: 'maintainability' | 'reliability' | 'security' | 'performance';
  issues: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PayoffStrategy {
  name: string;
  effort: number;
  payoff: number;
  risk: 'low' | 'medium' | 'high';
  timeline: string;
  steps: string[];
}

// Bug prediction types
export interface RiskFactor {
  type:
    | 'complexity'
    | 'change-frequency'
    | 'developer-experience'
    | 'test-coverage';
  value: number;
  weight: number;
  description: string;
}

export interface HistoricalBugData {
  bugCount: number;
  patterns: BugPattern[];
  trends: BugTrend[];
}

export interface BugPattern {
  pattern: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  locations: CodeLocation[];
}

export interface BugTrend {
  period: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BugPreventionRecommendation {
  type: 'testing' | 'review' | 'refactoring' | 'monitoring';
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

// Performance types
export interface EffortPrediction {
  hours: number;
  confidence: number;
  factors: string[];
  assumptions: string[];
}

export interface ChangeProneness {
  score: number;
  factors: string[];
  frequency: ChangeFrequency;
}

export interface ChangeFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  trend: 'increasing' | 'improving' | 'stable' | 'declining' | 'decreasing';
}

export interface EvolutionaryHotspot {
  file: string;
  changeFrequency: number;
  complexity: number;
  riskScore: number;
  recommendations: string[];
}

export interface PerformanceBottleneck {
  type: 'cpu' | 'memory' | 'io' | 'network' | 'algorithm';
  location: CodeLocation;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestions: string[];
}

export interface ScalabilityAssessment {
  score: number;
  concerns: ScalabilityConcern[];
  recommendations: string[];
}

export interface ScalabilityConcern {
  type: 'throughput' | 'latency' | 'memory' | 'storage' | 'concurrency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
}

export interface OptimizationOpportunity {
  type:
    | 'algorithm'
    | 'data-structure'
    | 'caching'
    | 'parallel'
    | 'lazy-loading';
  location: CodeLocation;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  description: string;
}

// Skill analysis types
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

// Learning types
export interface LearningResource {
  type: 'documentation' | 'tutorial' | 'course' | 'book' | 'practice';
  title: string;
  url?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  skills: string[];
}

// Common location type
export interface CodeLocation {
  start: { line: number; column: number; offset?: number };
  end: { line: number; column: number; offset?: number };
}
