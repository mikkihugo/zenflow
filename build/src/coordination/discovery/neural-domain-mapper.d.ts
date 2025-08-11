/**
 * @file Neural network-based domain mapper for analyzing and mapping relationships between domains.
 * Uses GNN models and WASM acceleration to identify domain boundaries and cross-domain dependencies.
 */
import type { DependencyGraph, Domain, DomainRelationshipMap } from './types.ts';
export declare class NeuralDomainMapper {
    private gnnModel;
    private _wasmAccelerator;
    constructor();
    mapDomainRelationships(domains: Domain[], dependencies: DependencyGraph, bazelMetadata?: Record<string, unknown>): Promise<DomainRelationshipMap>;
    private askHuman;
    private convertToGraphData;
    private extractBoundaries;
    /**
     * Convert Bazel workspace data to enhanced graph format for GNN analysis.
     * Incorporates target types, language information, and explicit dependencies.
     *
     * @param domains
     * @param dependencies
     * @param bazelMetadata
     */
    private convertBazelToGraphData;
    /**
     * Extract enhanced domain boundaries using Bazel metadata.
     *
     * @param predictions
     * @param domains
     * @param adjacency
     * @param bazelMetadata
     */
    private extractBazelEnhancedBoundaries;
    private calculateLanguageComplexity;
    private calculateTargetTypeDistribution;
    private calculateTargetTypeSimilarity;
    private calculateLanguageCompatibility;
    private calculateTargetCohesionBonus;
    private calculateBazelRelationshipBonus;
    private findSharedLanguages;
    private extractLanguagesFromTargets;
}
//# sourceMappingURL=neural-domain-mapper.d.ts.map