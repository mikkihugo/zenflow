/**
 * @file GNN-Enhanced DSPy TypeScript Error Analyzer.
 *
 * Integrates Graph Neural Networks with DSPy for intelligent TypeScript error fixing.
 * Uses GNN to understand error relationships and DSPy for generating intelligent fixes.
 */

import { getLogger } from '../config/logging-config';
import { NeuralDomainMapper } from '../coordination/discovery/neural-domain-mapper';
import { createDSPyWrapper, type DSPyWrapper } from './dspy-wrapper';
import { GNNModel } from './models/presets/gnn.js';
import type { DSPyConfig, DSPyProgram } from './types/dspy-types';
import { WASMNeuralAccelerator } from './wasm/wasm-neural-accelerator';

const logger = getLogger('GNN-DSPy-TS-Analyzer');

export interface TypeScriptError {
  id: string;
  message: string;
  code: string;
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  category: 'type' | 'syntax' | 'import' | 'declaration' | 'assignment' | 'generic';
  relatedErrors?: string[];
  context: {
    codeSnippet: string;
    functionContext?: string;
    classContext?: string;
    imports: string[];
    dependencies: string[];
  };
}

export interface ErrorRelationshipGraph {
  nodes: Float32Array; // Error features
  edges: Float32Array; // Relationship features
  adjacency: number[][]; // Error connections
  errorTypes: string[];
  relationships: Array<{
    source: string;
    target: string;
    type: 'dependency' | 'cascade' | 'similar' | 'root_cause';
    weight: number;
  }>;
}

export interface GNNErrorAnalysis {
  errorClusters: Array<{
    clusterId: string;
    errors: string[];
    rootCause: string;
    priority: number;
    suggestedFixOrder: string[];
  }>;
  errorRelationships: Array<{
    sourceError: string;
    targetError: string;
    relationshipType: 'causes' | 'similar_to' | 'depends_on';
    strength: number;
  }>;
  domainMapping: {
    errorDomains: Array<{
      domain: string;
      errors: string[];
      cohesionScore: number;
    }>;
    crossDomainDependencies: Array<{
      sourceDomain: string;
      targetDomain: string;
      errorCount: number;
    }>;
  };
  confidence: number;
}

export interface IntelligentFixSuggestion {
  errorId: string;
  fixType: 'type_annotation' | 'import_fix' | 'refactor' | 'config_change' | 'dependency_update';
  description: string;
  codeChanges: Array<{
    file: string;
    line: number;
    column: number;
    oldCode: string;
    newCode: string;
    explanation: string;
  }>;
  impactAnalysis: {
    affectedFiles: string[];
    riskLevel: 'low' | 'medium' | 'high';
    testingRequired: boolean;
    rollbackStrategy: string;
  };
  confidence: number;
  reasoning: string;
}

export class GNNDSPyTypeScriptAnalyzer {
  private gnnModel: GNNModel;
  private domainMapper: NeuralDomainMapper;
  private dspyWrapper: DSPyWrapper | null = null;
  private wasmAccelerator: WASMNeuralAccelerator;
  private errorAnalysisProgram: DSPyProgram | null = null;
  private fixGenerationProgram: DSPyProgram | null = null;
  private relationshipAnalysisProgram: DSPyProgram | null = null;

  constructor(config: DSPyConfig = {}) {
    // Initialize GNN model with TypeScript error-specific configuration
    this.gnnModel = new GNNModel({
      nodeDimensions: 64, // Error features dimension
      edgeDimensions: 32, // Relationship features dimension
      hiddenDimensions: 128,
      outputDimensions: 96,
      numLayers: 4,
      aggregation: 'mean',
      activation: 'relu',
      dropoutRate: 0.3,
      messagePassingSteps: 3,
    });

    this.domainMapper = new NeuralDomainMapper();
    this.wasmAccelerator = new WASMNeuralAccelerator({
      wasmPath: './wasm/neural.wasm',
      memoryPages: 256,
      maxInstances: 4,
      enableSIMD: true,
      enableThreads: false,
      optimizationLevel: 'O2',
    });

    this.initializeDSPyPrograms(config);

    logger.info('GNN-DSPy TypeScript Analyzer initialized', {
      gnnLayers: 4,
      dspyModel: config.model || 'claude-3-5-sonnet-20241022',
    });
  }

  private async initializeDSPyPrograms(config: DSPyConfig): Promise<void> {
    try {
      this.dspyWrapper = await createDSPyWrapper({
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
        maxTokens: 4000,
        ...config,
      });

      // Error Analysis Program
      this.errorAnalysisProgram = await this.dspyWrapper.createProgram(
        'typescript_errors: array, error_graph: object, domain_analysis: object -> error_clusters: array, root_causes: array, fix_priority: array, reasoning: string',
        'Analyze TypeScript errors using GNN relationship understanding to identify clusters, root causes, and optimal fix strategies'
      );

      // Fix Generation Program
      this.fixGenerationProgram = await this.dspyWrapper.createProgram(
        'error_analysis: object, code_context: string, project_structure: object -> fix_suggestions: array, code_changes: array, impact_analysis: object, confidence: number',
        'Generate intelligent TypeScript error fixes based on GNN analysis and code understanding'
      );

      // Relationship Analysis Program
      this.relationshipAnalysisProgram = await this.dspyWrapper.createProgram(
        'error_graph: object, gnn_predictions: array, domain_mapping: object -> relationship_insights: array, cascade_analysis: object, optimization_suggestions: array',
        'Analyze error relationships and cascading effects using GNN predictions for optimal fix sequencing'
      );

      logger.info('DSPy programs initialized for TypeScript error analysis');
    } catch (error) {
      logger.error('Failed to initialize DSPy programs:', error);
      throw error;
    }
  }

  /**
   * Analyze TypeScript errors using GNN-enhanced DSPy intelligence.
   *
   * @param errors
   */
  async analyzeTypeScriptErrors(errors: TypeScriptError[]): Promise<GNNErrorAnalysis> {
    logger.info('Starting GNN-enhanced TypeScript error analysis', {
      errorCount: errors.length,
    });

    try {
      // Step 1: Build error relationship graph
      const errorGraph = await this.buildErrorRelationshipGraph(errors);

      // Step 2: Run GNN analysis on error relationships
      const gnnPredictions = await this.runGNNAnalysis(errorGraph);

      // Step 3: Map errors to domains using neural domain mapper
      const domainMapping = await this.mapErrorsToDomains(errors, errorGraph);

      // Step 4: Use DSPy for intelligent error clustering and analysis
      const analysis = await this.performDSPyErrorAnalysis(
        errors,
        errorGraph,
        gnnPredictions,
        domainMapping
      );

      logger.info('GNN-enhanced analysis completed', {
        clusters: analysis.errorClusters.length,
        relationships: analysis.errorRelationships.length,
        confidence: analysis.confidence,
      });

      return analysis;
    } catch (error) {
      logger.error('Error analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent fixes for TypeScript errors.
   *
   * @param errors
   * @param analysis
   * @param codeContext
   */
  async generateIntelligentFixes(
    errors: TypeScriptError[],
    analysis: GNNErrorAnalysis,
    codeContext: Record<string, string>
  ): Promise<IntelligentFixSuggestion[]> {
    if (!this.fixGenerationProgram || !this.dspyWrapper) {
      throw new Error('Fix generation program not initialized');
    }

    logger.info('Generating intelligent fixes using GNN analysis');

    const fixes: IntelligentFixSuggestion[] = [];

    // Process errors in order of priority from GNN analysis
    for (const cluster of analysis.errorClusters.sort((a, b) => b.priority - a.priority)) {
      for (const errorId of cluster.suggestedFixOrder) {
        const error = errors.find((e) => e.id === errorId);
        if (!error) continue;

        try {
          const result = await this.dspyWrapper.execute(this.fixGenerationProgram, {
            error_analysis: {
              error: error,
              cluster: cluster,
              relationships: analysis.errorRelationships.filter(
                (r) => r.sourceError === errorId || r.targetError === errorId
              ),
              domain_context: analysis.domainMapping.errorDomains.find((d) =>
                d.errors.includes(errorId)
              ),
            },
            code_context: codeContext[error.file] || '',
            project_structure: {
              domains: analysis.domainMapping.errorDomains,
              dependencies: analysis.domainMapping.crossDomainDependencies,
            },
          });

          if (result?.success && result?.result) {
            const suggestion: IntelligentFixSuggestion = {
              errorId: error.id,
              fixType: this.determinateFixType(error, result.result),
              description:
                result.result['fix_suggestions']?.[0]?.description || 'Fix TypeScript error',
              codeChanges: result.result['code_changes'] || [],
              impactAnalysis: result.result['impact_analysis'] || {
                affectedFiles: [error.file],
                riskLevel: 'low',
                testingRequired: false,
                rollbackStrategy: 'Revert code changes',
              },
              confidence: result.result['confidence'] || 0.8,
              reasoning: result.result['reasoning'] || 'Generated using GNN-enhanced analysis',
            };

            fixes.push(suggestion);
          }
        } catch (error) {
          logger.warn(`Failed to generate fix for error ${errorId}:`, error);
        }
      }
    }

    logger.info('Generated intelligent fixes', { fixCount: fixes.length });
    return fixes;
  }

  private async buildErrorRelationshipGraph(
    errors: TypeScriptError[]
  ): Promise<ErrorRelationshipGraph> {
    const numErrors = errors.length;

    // Build node features (error characteristics)
    const nodeFeatures = new Float32Array(numErrors * 8); // 8 features per error
    for (let i = 0; i < numErrors; i++) {
      const error = errors[i];
      if (!error) continue;
      const baseIdx = i * 8;

      // Feature encoding for TypeScript errors
      nodeFeatures[baseIdx + 0] = this.encodeErrorSeverity(error.severity);
      nodeFeatures[baseIdx + 1] = this.encodeErrorCategory(error.category);
      nodeFeatures[baseIdx + 2] = error.line / 1000; // Normalized line number
      nodeFeatures[baseIdx + 3] = error.column / 100; // Normalized column
      nodeFeatures[baseIdx + 4] = error.context.codeSnippet.length / 1000; // Code complexity
      nodeFeatures[baseIdx + 5] = error.context.imports.length / 10; // Import complexity
      nodeFeatures[baseIdx + 6] = error.context.dependencies.length / 10; // Dependency complexity
      nodeFeatures[baseIdx + 7] = error.relatedErrors?.length || 0; // Related error count
    }

    // Build adjacency and edge features
    const adjacency: number[][] = [];
    const edgeFeaturesList: number[] = [];

    for (let i = 0; i < numErrors; i++) {
      const error1 = errors[i];

      for (let j = i + 1; j < numErrors; j++) {
        const error2 = errors[j];
        if (!error2) continue;
        const relationship = this.calculateErrorRelationship(error1!, error2);

        if (relationship.strength > 0.3) {
          // Threshold for meaningful relationships
          adjacency.push([i, j]);
          adjacency.push([j, i]); // Bidirectional

          // Edge features: [relationship_strength, same_file, same_function, error_distance]
          edgeFeaturesList.push(
            relationship.strength,
            error1?.file === error2?.file ? 1 : 0,
            this.areSameFunction(error1!, error2) ? 1 : 0,
            Math.abs((error1?.line || 0) - (error2?.line || 0)) / 100
          );
          edgeFeaturesList.push(
            relationship.strength,
            error1?.file === error2?.file ? 1 : 0,
            this.areSameFunction(error1!, error2) ? 1 : 0,
            Math.abs((error1?.line || 0) - (error2?.line || 0)) / 100
          );
        }
      }
    }

    const edgeFeatures = new Float32Array(edgeFeaturesList);

    return {
      nodes: nodeFeatures,
      edges: edgeFeatures,
      adjacency,
      errorTypes: errors.map((e) => e.category),
      relationships: [], // Will be populated after GNN analysis
    };
  }

  private async runGNNAnalysis(graph: ErrorRelationshipGraph): Promise<Float32Array> {
    logger.debug('Running GNN analysis on error relationship graph');

    try {
      // Use WASM acceleration if available
      if (this.wasmAccelerator.getMetrics) {
        // Fallback to JavaScript implementation since WASM methods don't match our needs
        return await this.gnnModel.forward({
          nodes: graph.nodes,
          edges: graph.edges,
          adjacency: graph.adjacency,
        });
      } else {
        return await this.gnnModel.forward({
          nodes: graph.nodes,
          edges: graph.edges,
          adjacency: graph.adjacency,
        });
      }
    } catch (error) {
      logger.error('GNN analysis failed:', error);
      throw error;
    }
  }

  private async mapErrorsToDomains(
    errors: TypeScriptError[],
    graph: ErrorRelationshipGraph
  ): Promise<any> {
    // Convert errors to domain format for neural domain mapper
    const domains = this.extractDomainsFromErrors(errors);
    const dependencies = this.buildDomainDependencies(errors, graph);

    return await this.domainMapper.mapDomainRelationships(domains, dependencies);
  }

  private async performDSPyErrorAnalysis(
    errors: TypeScriptError[],
    graph: ErrorRelationshipGraph,
    gnnPredictions: Float32Array,
    domainMapping: any
  ): Promise<GNNErrorAnalysis> {
    if (!this.errorAnalysisProgram || !this.dspyWrapper) {
      throw new Error('Error analysis program not initialized');
    }

    const result = await this.dspyWrapper.execute(this.errorAnalysisProgram, {
      typescript_errors: errors.map((e) => ({
        id: e.id,
        message: e.message,
        category: e.category,
        severity: e.severity,
        file: e.file,
        context: e.context,
      })),
      error_graph: {
        relationships: graph.relationships,
        adjacency: graph.adjacency,
        gnn_embeddings: Array.from(gnnPredictions),
      },
      domain_analysis: domainMapping,
    });

    if (!result?.success || !result?.result) {
      throw new Error('DSPy error analysis failed');
    }

    // Extract relationships from GNN predictions
    const relationships = this.extractRelationshipsFromGNN(errors, gnnPredictions, graph.adjacency);

    return {
      errorClusters: result.result['error_clusters'] || [],
      errorRelationships: relationships,
      domainMapping: {
        errorDomains:
          domainMapping.cohesionScores?.map((cs: any) => ({
            domain: cs.domainName,
            errors: errors.filter((e) => e.file.includes(cs.domainName)).map((e) => e.id),
            cohesionScore: cs.score,
          })) || [],
        crossDomainDependencies: domainMapping.crossDomainDependencies || [],
      },
      confidence: result.result['confidence'] || 0.8,
    };
  }

  private calculateErrorRelationship(
    error1: TypeScriptError,
    error2: TypeScriptError
  ): {
    strength: number;
    type: 'dependency' | 'cascade' | 'similar' | 'root_cause';
  } {
    let strength = 0;
    let type: 'dependency' | 'cascade' | 'similar' | 'root_cause' = 'similar';

    // Same file bonus
    if (error1.file === error2.file) {
      strength += 0.3;
    }

    // Same category bonus
    if (error1.category === error2.category) {
      strength += 0.2;
      type = 'similar';
    }

    // Import/dependency relationship
    if (error1.category === 'import' || error2.category === 'import') {
      if (error1.context.imports.some((imp) => error2.context.imports.includes(imp))) {
        strength += 0.4;
        type = 'dependency';
      }
    }

    // Type error cascading
    if (error1.category === 'type' && error2.category === 'type') {
      if (Math.abs(error1.line - error2.line) < 10) {
        strength += 0.3;
        type = 'cascade';
      }
    }

    // Related errors
    if (error1.relatedErrors?.includes(error2.id) || error2.relatedErrors?.includes(error1.id)) {
      strength += 0.5;
      type = 'root_cause';
    }

    return { strength: Math.min(strength, 1.0), type };
  }

  private extractRelationshipsFromGNN(
    errors: TypeScriptError[],
    predictions: Float32Array,
    adjacency: number[][]
  ): Array<{
    sourceError: string;
    targetError: string;
    relationshipType: 'causes' | 'similar_to' | 'depends_on';
    strength: number;
  }> {
    const relationships: Array<{
      sourceError: string;
      targetError: string;
      relationshipType: 'causes' | 'similar_to' | 'depends_on';
      strength: number;
    }> = [];
    const outputDim = predictions.length / errors.length;

    for (const [sourceIdx, targetIdx] of adjacency) {
      if (sourceIdx == null || targetIdx == null || sourceIdx >= targetIdx) continue; // Avoid duplicates

      const sourceEmbedding = predictions.slice(
        (sourceIdx || 0) * outputDim,
        ((sourceIdx || 0) + 1) * outputDim
      );
      const targetEmbedding = predictions.slice(
        (targetIdx || 0) * outputDim,
        ((targetIdx || 0) + 1) * outputDim
      );

      // Calculate similarity using dot product
      let similarity = 0;
      for (let i = 0; i < outputDim; i++) {
        similarity += (sourceEmbedding?.[i] || 0) * (targetEmbedding?.[i] || 0);
      }
      similarity = Math.max(0, Math.min(1, similarity));

      const sourceError = errors[sourceIdx || 0];
      const targetError = errors[targetIdx || 0];

      if (similarity > 0.5 && sourceError && targetError) {
        relationships.push({
          sourceError: sourceError.id,
          targetError: targetError.id,
          relationshipType: this.determineRelationshipType(sourceError, targetError),
          strength: similarity,
        });
      }
    }

    return relationships;
  }

  // Helper methods
  private encodeErrorSeverity(severity: string): number {
    const mapping: Record<string, number> = { error: 1.0, warning: 0.5, info: 0.1 };
    return mapping[severity] || 0.5;
  }

  private encodeErrorCategory(category: string): number {
    const mapping: Record<string, number> = {
      type: 0.8,
      syntax: 0.9,
      import: 0.7,
      declaration: 0.6,
      assignment: 0.5,
      generic: 0.4,
    };
    return mapping[category] || 0.5;
  }

  private areSameFunction(error1: TypeScriptError, error2: TypeScriptError): boolean {
    return (
      error1.file === error2.file &&
      error1.context.functionContext === error2.context.functionContext &&
      error1.context.functionContext !== undefined
    );
  }

  private determinateFixType(
    error: TypeScriptError,
    result: any
  ): IntelligentFixSuggestion['fixType'] {
    if (error.category === 'type') return 'type_annotation';
    if (error.category === 'import') return 'import_fix';
    if (result.fix_suggestions?.[0]?.type) return result.fix_suggestions[0].type;
    return 'refactor';
  }

  private determineRelationshipType(
    error1: TypeScriptError,
    error2: TypeScriptError
  ): 'causes' | 'similar_to' | 'depends_on' {
    if (error1.category === 'import' && error2.category !== 'import') return 'causes';
    if (error1.category === error2.category) return 'similar_to';
    return 'depends_on';
  }

  private extractDomainsFromErrors(errors: TypeScriptError[]): any[] {
    const fileGroups = new Map<string, TypeScriptError[]>();

    errors.forEach((error) => {
      const domain = this.extractDomainFromFile(error.file);
      if (!fileGroups.has(domain)) {
        fileGroups.set(domain, []);
      }
      fileGroups.get(domain)!.push(error);
    });

    return Array.from(fileGroups.entries()).map(([domain, domainErrors]) => ({
      name: domain,
      files: Array.from(new Set(domainErrors.map((e) => e.file))),
      dependencies: Array.from(new Set(domainErrors.flatMap((e) => e.context.dependencies))),
      confidenceScore: domainErrors.length / errors.length,
    }));
  }

  private extractDomainFromFile(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.includes('src')) {
      const srcIndex = parts.indexOf('src');
      return parts[srcIndex + 1] || 'root';
    }
    return 'root';
  }

  private buildDomainDependencies(errors: TypeScriptError[], graph: ErrorRelationshipGraph): any {
    const dependencies: Record<string, Record<string, number>> = {};

    for (const [sourceIdx, targetIdx] of graph.adjacency) {
      if (sourceIdx == null || targetIdx == null) continue;
      const sourceError = errors[sourceIdx];
      const targetError = errors[targetIdx];
      if (!sourceError || !targetError) continue;

      const sourceDomain = this.extractDomainFromFile(sourceError.file);
      const targetDomain = this.extractDomainFromFile(targetError.file);

      if (sourceDomain !== targetDomain) {
        if (!dependencies[sourceDomain]) {
          dependencies[sourceDomain] = {};
        }
        dependencies[sourceDomain][targetDomain] =
          (dependencies[sourceDomain][targetDomain] || 0) + 1;
      }
    }

    return dependencies;
  }

  /**
   * Get system statistics.
   */
  getAnalyzerStats() {
    return {
      gnnModel: this.gnnModel.getConfig(),
      initialized: !!this.dspyWrapper,
      programs: {
        errorAnalysis: !!this.errorAnalysisProgram,
        fixGeneration: !!this.fixGenerationProgram,
        relationshipAnalysis: !!this.relationshipAnalysisProgram,
      },
      wasmAcceleration: !!this.wasmAccelerator.getMetrics,
    };
  }

  /**
   * Cleanup resources.
   */
  async cleanup(): Promise<void> {
    if (this.dspyWrapper?.cleanup) {
      await this.dspyWrapper.cleanup();
    }

    await this.wasmAccelerator.shutdown();

    logger.info('GNN-DSPy TypeScript Analyzer cleaned up');
  }
}

export default GNNDSPyTypeScriptAnalyzer;
