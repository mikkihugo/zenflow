/**
 * SPARC Pseudocode Phase Engine.
 *
 * Handles the second phase of SPARC methodology - generating algorithmic.
 * Pseudocode with complexity analysis and optimization strategies.
 */
/**
 * @file Pseudocode processing engine.
 */
import type { AlgorithmPseudocode, ControlFlowDiagram, DataStructureDesign, DetailedSpecification, FunctionalRequirement, LogicValidation, OptimizationSuggestion, PseudocodeEngine, PseudocodeStructure, PseudocodeValidation } from '../../types/sparc-types';
export declare class PseudocodePhaseEngine implements PseudocodeEngine {
    /**
     * Generate algorithmic pseudocode from detailed specifications.
     *
     * @param spec
     */
    generateAlgorithmPseudocode(spec: DetailedSpecification): Promise<AlgorithmPseudocode[]>;
    designDataStructures(requirements: FunctionalRequirement[]): Promise<DataStructureDesign[]>;
    mapControlFlows(algorithms: AlgorithmPseudocode[]): Promise<ControlFlowDiagram[]>;
    optimizeAlgorithmComplexity(pseudocode: AlgorithmPseudocode): Promise<OptimizationSuggestion[]>;
    validatePseudocodeLogic(pseudocode: AlgorithmPseudocode[]): Promise<LogicValidation>;
    /**
     * Generate algorithmic pseudocode from detailed specifications.
     *
     * @param specification
     */
    generatePseudocode(specification: DetailedSpecification): Promise<PseudocodeStructure>;
    /**
     * Analyze computational complexity of algorithms.
     *
     * @param algorithms
     */
    private analyzeComplexity;
    private calculateWorstCaseComplexity;
    private calculateAverageCaseComplexity;
    private calculateBestCaseComplexity;
    private calculateSpaceComplexity;
    private maxComplexity;
    private analyzeScalability;
    private identifyBottlenecks;
    /**
     * Identify optimization opportunities.
     *
     * @param algorithms
     */
    private identifyOptimizations;
    /**
     * Generate algorithm-specific pseudocode.
     *
     * @param requirement
     * @param _domain
     */
    private generateAlgorithmPseudocodePrivate;
    /**
     * Estimate algorithm complexity.
     *
     * @param _requirement
     */
    private estimateAlgorithmComplexity;
    /**
     * Extract input parameters from requirement as ParameterDefinition[].
     *
     * @param requirement.
     * @param requirement
     */
    private extractInputParameterDefinitions;
    /**
     * Extract output definitions from requirement as ReturnDefinition[].
     *
     * @param requirement.
     * @param requirement
     */
    private extractOutputDefinitions;
    /**
     * Generate pseudocode steps from requirement.
     *
     * @param requirement
     * @param domain
     */
    private generatePseudocodeSteps;
    /**
     * Identify optimization opportunities for specific algorithm.
     *
     * @param requirement
     */
    private identifyAlgorithmOptimizations;
    /**
     * Validate generated pseudocode.
     *
     * @param pseudocode
     */
    validatePseudocode(pseudocode: PseudocodeStructure): Promise<PseudocodeValidation>;
    /**
     * Generate recommendations based on validation results.
     *
     * @param validationResults
     */
    private generateRecommendations;
}
//# sourceMappingURL=pseudocode-engine.d.ts.map