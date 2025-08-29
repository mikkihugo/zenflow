/**
 * @fileoverview Types for Domain Discovery and Neural Analysis
 * 
 * Shared type definitions for domain discovery, neural domain mapping,
 * and graph neural network analysis functionality.
 */

// Re-export from neural domain mapper for backward compatibility
export type {
  Domain,
  DependencyGraph,
  DomainNode,
  DependencyEdge,
  GraphMetadata,
  DomainRelationshipMap,
  DomainRelationship,
  TopologyRecommendation,
  GNNModel,
  WasmNeuralAccelerator
} from './neural-domain-mapper';

// Additional discovery-specific types

export interface DiscoveryContext {
  rootPath: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  analysisDepth: 'shallow' | 'medium' | 'deep';
  enableNeuralAnalysis: boolean;
}

export interface DiscoveryResult {
  domains: Domain[];
  relationships: DomainRelationshipMap | null;
  metadata: DiscoveryMetadata;
  warnings: string[];
  errors: Error[];
}

export interface DiscoveryMetadata {
  totalFiles: number;
  totalDirectories: number;
  analysisTimeMs: number;
  neuralAnalysisEnabled: boolean;
  confidence: number;
  version: string;
}

export interface ValidationCheckpoint {
  id: string;
  type: 'domain_boundaries' | 'neural_relationships' | 'topology_recommendation';
  confidence: number;
  requiresHumanApproval: boolean;
  question: string;
  context: any;
  timestamp: Date;
}

export interface HumanValidationResponse {
  checkpointId: string;
  approved: boolean;
  modifications?: any;
  feedback?: string;
  timestamp: Date;
}

// Domain-specific types extending base Domain interface
export interface Domain {
  id: string;
  name: string;
  path: string;
  files: string[];
  dependencies: string[];
  complexity: number;
  // Extended properties for discovery
  type?: 'core' | 'service' | 'utility' | 'interface' | 'test';
  language?: string;
  framework?: string;
  size: {
    lines: number;
    bytes: number;
  };
  lastModified: Date;
  contributors?: string[];
  testCoverage?: number;
}

// Neural analysis configuration
export interface NeuralAnalysisConfig {
  enableGNN: boolean;
  enableWasmAcceleration: boolean;
  modelType: 'gnn' | 'transformer' | 'hybrid';
  confidenceThreshold: number;
  maxAnalysisTime: number;
  fallbackToHeuristics: boolean;
}

// Graph analysis types
export interface GraphAnalysisResult {
  centralityScores: Map<string, number>;
  clusteringCoefficient: number;
  averagePathLength: number;
  communityStructure: CommunityCluster[];
  criticalNodes: string[];
  bottlenecks: GraphBottleneck[];
}

export interface CommunityCluster {
  id: string;
  nodes: string[];
  cohesion: number;
  size: number;
  dominantType: string;
}

export interface GraphBottleneck {
  nodeId: string;
  betweennessCentrality: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

// Integration with existing domain validation
export interface EnhancedDomainBoundary {
  name: string;
  type: 'public-api' | 'private-implementation' | 'internal-specialized' | 'restricted-access' | 'deep-core';
  packages: string[];
  allowedImports: string[];
  violations: DomainViolation[];
  // Neural enhancements
  neuralScore?: number;
  recommendedActions?: string[];
  alternativeStructures?: AlternativeStructure[];
}

export interface DomainViolation {
  type: 'tier-boundary' | 'circular-dependency' | 'forbidden-import' | 'facade-bypass' | 'neural-anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file: string;
  line?: number;
  suggestion: string;
  confidence?: number;
}

export interface AlternativeStructure {
  description: string;
  confidence: number;
  benefits: string[];
  drawbacks: string[];
  migrationEffort: 'low' | 'medium' | 'high';
}

// Event types for discovery process
export interface DiscoveryEvent {
  type: 'started' | 'progress' | 'neural_analysis' | 'validation_required' | 'completed' | 'error';
  timestamp: Date;
  data: any;
  source: 'domain_scanner' | 'neural_mapper' | 'validator' | 'human_interface';
}

// AGUI integration types
export interface AGUIValidationRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiredActions: string[];
  context: any;
  timeoutMs?: number;
}

export interface AGUIValidationResult {
  requestId: string;
  response: any;
  confidence: number;
  processingTimeMs: number;
  validatorId?: string;
}

// Performance and monitoring types
export interface DiscoveryPerformanceMetrics {
  fileScanning: {
    filesProcessed: number;
    averageTimePerFile: number;
    totalTimeMs: number;
  };
  neuralAnalysis: {
    domainsAnalyzed: number;
    gnnInferenceTime: number;
    wasmAccelerationUsed: boolean;
    fallbacksUsed: number;
  };
  validation: {
    checkpointsTriggered: number;
    humanInterventions: number;
    averageResponseTime: number;
  };
  overall: {
    totalTimeMs: number;
    memoryUsage: number;
    confidenceScore: number;
  };
}

// Export all as a namespace for easy importing
export namespace DiscoveryTypes {
  export type Context = DiscoveryContext;
  export type Result = DiscoveryResult;
  export type Metadata = DiscoveryMetadata;
  export type ValidationCheckpoint = ValidationCheckpoint;
  export type HumanValidationResponse = HumanValidationResponse;
  export type NeuralAnalysisConfig = NeuralAnalysisConfig;
  export type GraphAnalysisResult = GraphAnalysisResult;
  export type CommunityCluster = CommunityCluster;
  export type GraphBottleneck = GraphBottleneck;
  export type EnhancedDomainBoundary = EnhancedDomainBoundary;
  export type DomainViolation = DomainViolation;
  export type AlternativeStructure = AlternativeStructure;
  export type DiscoveryEvent = DiscoveryEvent;
  export type AGUIValidationRequest = AGUIValidationRequest;
  export type AGUIValidationResult = AGUIValidationResult;
  export type DiscoveryPerformanceMetrics = DiscoveryPerformanceMetrics;
}