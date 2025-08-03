/**
 * Domain splitting type definitions
 */

export interface DomainAnalysis {
  domainPath: string;
  totalFiles: number;
  categories: FileCategoryMap;
  dependencies: DependencyGraph;
  coupling: CouplingAnalysis;
  complexityScore: number;
  splittingRecommendations: SplittingRecommendation[];
}

export interface FileCategoryMap {
  'core-algorithms': string[];
  'training-systems': string[];
  'network-architectures': string[];
  'data-processing': string[];
  'evaluation-metrics': string[];
  visualization: string[];
  integration: string[];
  agents: string[];
  coordination: string[];
  utilities: string[];
  tests: string[];
  configuration: string[];
  bridge: string[];
  wasm: string[];
  models: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  file: string;
  imports: string[];
  exports: string[];
  type: 'module' | 'utility' | 'config' | 'test';
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'import' | 'require' | 'dynamic';
  weight: number;
}

export interface CouplingAnalysis {
  tightlyCoupledGroups: CouplingGroup[];
  averageCoupling: number;
  maxCoupling: number;
  isolatedFiles: string[];
}

export interface CouplingGroup {
  files: string[];
  couplingScore: number;
  sharedDependencies: string[];
}

export interface SplittingRecommendation {
  type: 'extract-subdomain' | 'merge-files' | 'create-shared-utility';
  description: string;
  files: string[];
  estimatedBenefit: number;
  estimatedEffort: number;
}

export interface SubDomainPlan {
  sourceDomain: string;
  targetSubDomains: SubDomainSpec[];
}

export interface SubDomainSpec {
  name: string;
  description: string;
  estimatedFiles: number;
  dependencies: string[];
  files?: string[];
  publicApi?: string[];
}

export interface SplittingMetrics {
  complexityReduction: number;
  maintainabilityImprovement: number;
  buildTimeImpact: number;
  testTimeImpact: number;
  migrationEffort: number;
}

export interface SplittingResult {
  success: boolean;
  subDomainsCreated: number;
  filesMoved: number;
  importsUpdated: number;
  validation: ValidationReport;
  rollbackPath?: string;
}

export interface ValidationReport {
  success: boolean;
  issues: ValidationIssue[];
  metrics: {
    buildSuccess: boolean;
    testSuccess: boolean;
    noCircularDependencies: boolean;
    allImportsResolved: boolean;
  };
}

export interface ValidationIssue {
  type: 'circular-dependency' | 'missing-import' | 'build-error' | 'test-failure';
  description: string;
  file?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface MigrationGuide {
  summary: string;
  breakingChanges: BreakingChange[];
  migrationSteps: MigrationStep[];
  rollbackInstructions: string[];
}

export interface BreakingChange {
  type: 'import-path-change' | 'api-change' | 'file-moved';
  description: string;
  before: string;
  after: string;
  affectedFiles: string[];
}

export interface MigrationStep {
  step: number;
  description: string;
  commands: string[];
  validation: string[];
}

export interface ImportDependency {
  file: string;
  importPath: string;
  importType: 'default' | 'named' | 'namespace' | 'require';
  exports: string[];
  isRelative: boolean;
  resolvedPath: string;
}

export interface FunctionUsageMap {
  [functionName: string]: {
    definition: string;
    usages: Array<{
      file: string;
      line: number;
      context: string;
    }>;
  };
}

export interface PublicInterface {
  file: string;
  exports: Array<{
    name: string;
    type: 'function' | 'class' | 'interface' | 'type' | 'constant';
    isDefault: boolean;
  }>;
}

export interface SharedUtility {
  name: string;
  files: string[];
  description: string;
  extractionPath: string;
}

export interface CircularDependency {
  cycle: string[];
  severity: 'error' | 'warning';
  suggestion: string;
}

export interface OptimizedStructure {
  reorganizedFiles: Array<{
    from: string;
    to: string;
  }>;
  newUtilities: SharedUtility[];
  removedDependencies: string[];
}

export interface APICompatibilityReport {
  compatibleAPIs: string[];
  breakingChanges: BreakingChange[];
  deprecations: Array<{
    api: string;
    reason: string;
    alternative: string;
  }>;
}

export interface BuildValidation {
  success: boolean;
  buildTime: number;
  errors: string[];
  warnings: string[];
}

// Neural domain specific types
export interface NeuralDomainStructure {
  totalFiles: number;
  categories: {
    'core-algorithms': string[];
    'training-systems': string[];
    'network-architectures': string[];
    'data-processing': string[];
    'evaluation-metrics': string[];
    visualization: string[];
    integration: string[];
  };
}

export const NEURAL_SPLITTING_PLAN: SubDomainPlan = {
  sourceDomain: 'neural',
  targetSubDomains: [
    {
      name: 'neural-core',
      description: 'Core neural network algorithms and primitives',
      estimatedFiles: 6,
      dependencies: ['utils', 'core'],
    },
    {
      name: 'neural-models',
      description: 'Neural network models, architectures, and presets',
      estimatedFiles: 19,
      dependencies: ['neural-core', 'utils'],
    },
    {
      name: 'neural-agents',
      description: 'Neural-specific agent implementations',
      estimatedFiles: 2,
      dependencies: ['neural-core', 'coordination'],
    },
    {
      name: 'neural-coordination',
      description: 'Neural coordination protocols and systems',
      estimatedFiles: 2,
      dependencies: ['neural-core', 'coordination'],
    },
    {
      name: 'neural-wasm',
      description: 'WASM integration and Rust computational core',
      estimatedFiles: 5,
      dependencies: ['neural-core'],
    },
    {
      name: 'neural-bridge',
      description: 'Bridge functionality and integration layers',
      estimatedFiles: 1,
      dependencies: ['neural-core', 'neural-models', 'neural-wasm'],
    },
  ],
};
