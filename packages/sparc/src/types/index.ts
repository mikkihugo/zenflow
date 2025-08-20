/**
 * @fileoverview SPARC Types
 * 
 * Types for the SPARC methodology system.
 */

// SPARC phases
export type SPARCPhase = 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';

// Project complexity levels
export type ProjectComplexity = 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise';

// Domain types
export type ProjectDomain = 
  | 'swarm-coordination'
  | 'neural-networks' 
  | 'wasm-integration'
  | 'rest-api'
  | 'memory-systems'
  | 'interfaces'
  | 'general';

// SPARC project definition
export interface SPARCProject {
  id: string;
  name: string;
  domain: ProjectDomain;
  complexity: ProjectComplexity;
  requirements: string[];
  currentPhase: SPARCPhase;
  specification?: ProjectSpecification;
  pseudocode?: ProjectPseudocode;
  architecture?: ProjectArchitecture;
  refinements?: ProjectRefinement[];
  implementation?: ProjectImplementation;
  progress: SPARCProgress;
  metadata: Record<string, unknown>;
}

// Phase result
export interface PhaseResult {
  phase: SPARCPhase;
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  timestamp: number;
}

// Project specification
export interface ProjectSpecification {
  goals: string[];
  scope: string;
  constraints: string[];
  stakeholders: string[];
  successCriteria: string[];
}

// Project pseudocode
export interface ProjectPseudocode {
  algorithms: AlgorithmPseudocode[];
  dataStructures: DataStructure[];
  workflows: WorkflowPseudocode[];
}

export interface AlgorithmPseudocode {
  id: string;
  name: string;
  purpose: string;
  inputs: Array<{ name: string; type: string; description: string; }>;
  outputs: Array<{ name: string; type: string; description: string; }>;
  steps: Array<{
    stepNumber: number;
    description: string;
    pseudocode: string;
    complexity?: string;
  }>;
  complexity: {
    time: string;
    space: string;
  };
  optimizations: string[];
}

export interface DataStructure {
  name: string;
  type: 'class' | 'interface' | 'enum' | 'type';
  purpose: string;
  properties: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }>;
}

export interface WorkflowPseudocode {
  name: string;
  description: string;
  steps: Array<{
    step: number;
    action: string;
    dependencies: string[];
  }>;
}

// Project architecture
export interface ProjectArchitecture {
  components: ArchitectureComponent[];
  relationships: ComponentRelationship[];
  patterns: string[];
  technologies: string[];
}

export interface ArchitectureComponent {
  name: string;
  type: 'service' | 'module' | 'component' | 'utility';
  purpose: string;
  interfaces: string[];
  dependencies: string[];
}

export interface ComponentRelationship {
  from: string;
  to: string;
  type: 'depends-on' | 'implements' | 'extends' | 'uses';
  description: string;
}

// Project refinement
export interface ProjectRefinement {
  id: string;
  phase: SPARCPhase;
  description: string;
  changes: string[];
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
}

// Project implementation
export interface ProjectImplementation {
  files: ImplementationFile[];
  tests: TestSuite[];
  documentation: DocumentationFile[];
  deployment: DeploymentConfig;
}

export interface ImplementationFile {
  path: string;
  language: string;
  content: string;
  dependencies: string[];
}

export interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'e2e';
  tests: TestCase[];
}

export interface TestCase {
  name: string;
  description: string;
  code: string;
  expected: unknown;
}

export interface DocumentationFile {
  name: string;
  format: 'markdown' | 'rst' | 'html';
  content: string;
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  platform: string;
  requirements: string[];
  scripts: Record<string, string>;
}

// Progress tracking
export interface SPARCProgress {
  phasesCompleted: SPARCPhase[];
  currentPhaseProgress: number; // 0-1
  overallProgress: number; // 0-1
  estimatedCompletion: number; // timestamp
  timeSpent: Record<SPARCPhase, number>; // minutes
}