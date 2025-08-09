/**
 * Analysis result types for domain splitting.
 */
/**
 * @file TypeScript type definitions
 */



import type { DependencyGraph } from './domain-types';

export interface AnalysisConfig {
  includeTests: boolean;
  includeConfig: boolean;
  maxComplexityThreshold: number;
  minFilesForSplit: number;
  coupling: {
    threshold: number;
    algorithm: 'shared-dependencies' | 'import-frequency' | 'structural';
  };
}

export interface FileAnalysis {
  path: string;
  size: number;
  linesOfCode: number;
  complexity: number;
  imports: ImportAnalysis[];
  exports: ExportAnalysis[];
  category: string;
  purpose: FilePurpose;
  quality: QualityMetrics;
}

export interface ImportAnalysis {
  module: string;
  type: 'default' | 'named' | 'namespace' | 'require' | 'dynamic';
  specifiers: string[];
  isRelative: boolean;
  resolvedPath?: string;
  external: boolean;
}

export interface ExportAnalysis {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'constant' | 'default';
  isPublic: boolean;
  usageCount?: number;
}

export interface FilePurpose {
  primary: 'algorithm' | 'data' | 'ui' | 'config' | 'test' | 'utility' | 'integration';
  secondary?: string[];
  confidence: number;
}

export interface QualityMetrics {
  maintainabilityIndex: number;
  technicalDebt: number;
  testCoverage?: number;
  cyclomaticComplexity: number;
  duplicatedCode: number;
}

export interface ComplexityAnalysis {
  overall: number;
  files: FileComplexity[];
  hotspots: ComplexityHotspot[];
  recommendations: ComplexityRecommendation[];
}

export interface FileComplexity {
  file: string;
  score: number;
  factors: {
    size: number;
    dependencies: number;
    coupling: number;
    cyclomatic: number;
  };
}

export interface ComplexityHotspot {
  area: string;
  files: string[];
  score: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export interface ComplexityRecommendation {
  type: 'split' | 'extract' | 'refactor' | 'consolidate';
  description: string;
  files: string[];
  benefit: number;
  effort: number;
}

export interface DependencyAnalysisResult {
  graph: DependencyGraph;
  metrics: DependencyMetrics;
  issues: DependencyIssue[];
  clusters: DependencyCluster[];
}

export interface DependencyMetrics {
  totalDependencies: number;
  averageDependenciesPerFile: number;
  maxDependencies: number;
  circularCount: number;
  externalDependencyRatio: number;
  stabilityIndex: number;
}

export interface DependencyIssue {
  type: 'circular' | 'high-coupling' | 'god-object' | 'orphaned';
  severity: 'error' | 'warning' | 'info';
  description: string;
  files: string[];
  suggestion: string;
}

export interface DependencyCluster {
  id: string;
  files: string[];
  cohesion: number;
  coupling: number;
  suggestedAction: 'keep-together' | 'split' | 'extract-interface';
}

export interface CouplingMetrics {
  afferent: { [file: string]: number }; // Incoming dependencies
  efferent: { [file: string]: number }; // Outgoing dependencies
  instability: { [file: string]: number }; // I = Ce / (Ca + Ce)
  abstractness: { [file: string]: number }; // A = Interfaces / Types
}

export interface SplittingScore {
  overall: number;
  factors: {
    complexity: number;
    coupling: number;
    cohesion: number;
    size: number;
    dependencies: number;
  };
  recommendation: 'split-now' | 'split-soon' | 'monitor' | 'keep-together';
  confidence: number;
}

export interface SplittingStrategy {
  name: string;
  description: string;
  applicability: number;
  steps: StrategicStep[];
  risks: Risk[];
  benefits: Benefit[];
}

export interface StrategicStep {
  order: number;
  description: string;
  type: 'analyze' | 'prepare' | 'execute' | 'validate' | 'cleanup';
  automated: boolean;
  dependencies: number[];
}

export interface Risk {
  type: 'breaking-change' | 'performance' | 'complexity' | 'maintenance';
  severity: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

export interface Benefit {
  type: 'maintainability' | 'performance' | 'testability' | 'reusability';
  impact: 'high' | 'medium' | 'low';
  description: string;
  measurable: boolean;
}

export interface ValidationMetrics {
  buildTime: {
    before: number;
    after: number;
    improvement: number;
  };
  testTime: {
    before: number;
    after: number;
    improvement: number;
  };
  complexity: {
    before: number;
    after: number;
    reduction: number;
  };
  maintainability: {
    before: number;
    after: number;
    improvement: number;
  };
}

export interface ProgressReport {
  stage: 'analyzing' | 'planning' | 'executing' | 'validating' | 'complete';
  progress: number; // 0-100
  currentOperation: string;
  estimatedTimeRemaining: number;
  completedOperations: string[];
  errors: string[];
  warnings: string[];
}

export interface RollbackPlan {
  backupLocation: string;
  steps: RollbackStep[];
  validation: string[];
  estimatedTime: number;
}

export interface RollbackStep {
  order: number;
  description: string;
  operation: 'restore-file' | 'update-imports' | 'rebuild-indexes' | 'validate';
  files: string[];
  reversible: boolean;
}

// Domain-specific analysis types
export interface DomainGraph {
  nodes: DomainNode[];
  edges: DomainEdge[];
  metadata: DomainMetadata;
}

export interface DomainNode {
  id: string;
  name: string;
  type: 'domain' | 'subdomain' | 'module' | 'file';
  size: number;
  complexity: number;
  responsibilities: string[];
}

export interface DomainEdge {
  from: string;
  to: string;
  type: 'depends-on' | 'extends' | 'implements' | 'uses';
  strength: number;
  frequency: number;
}

export interface DomainMetadata {
  totalNodes: number;
  totalEdges: number;
  maxDepth: number;
  averageFanOut: number;
  averageFanIn: number;
  clusters: number;
}

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  includeTests: true,
  includeConfig: true,
  maxComplexityThreshold: 10,
  minFilesForSplit: 15,
  coupling: {
    threshold: 0.7,
    algorithm: 'shared-dependencies',
  },
};
