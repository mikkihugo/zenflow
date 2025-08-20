/**
 * @fileoverview Ensemble Teleprompter - 100% Stanford DSPy API Compatible
 *
 * Direct TypeScript port of Stanford's dspy/teleprompt/ensemble.py
 * Maintains exact API compatibility with original Python implementation.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 * @see {@link https://github.com/stanfordnlp/dspy/blob/main/dspy/teleprompt/ensemble.py} Original Implementation
 */
import { DSPyModule } from '../primitives/module';
import type { Example } from '../primitives/example';
import type { Prediction } from '../primitives/prediction';
/**
 * Configuration interface for Ensemble teleprompter
 * Matches Stanford DSPy ensemble.py API exactly
 */
export interface EnsembleConfig {
    /** Reduce function to combine outputs (e.g., dspy.majority) */
    reduce_fn?: ((outputs: Prediction[]) => Prediction) | null;
    /** Number of programs to sample for ensemble (null = use all) */
    size?: number | null;
    /** Whether to use deterministic sampling (not implemented yet) */
    deterministic?: boolean;
}
/**
 * EnsembledProgram class - Internal implementation
 * Exact port of Stanford DSPy's EnsembledProgram
 */
declare class EnsembledProgram extends DSPyModule {
    private programs;
    private reduceFunction?;
    private size?;
    private rng;
    constructor(programs: DSPyModule[], reduceFunction?: ((outputs: Prediction[]) => Prediction) | null, size?: number | null);
    /**
     * Forward pass through ensemble
     * Exact implementation of Stanford DSPy's forward method
     */
    forward(example: Example): Promise<Prediction>;
    /**
     * Get predictors from all ensemble programs
     */
    predictors(): any[];
    /**
     * Get named predictors from all ensemble programs
     */
    namedPredictors(): [string, any][];
    /**
     * Deep copy ensemble program
     */
    deepcopy(): EnsembledProgram;
}
/**
 * Ensemble Teleprompter
 *
 * 100% compatible with Stanford DSPy's Ensemble teleprompter.
 * Combines multiple programs into an ensemble with optional reduce function.
 *
 * @example
 * ```typescript
 * // Basic ensemble with all programs
 * const ensemble = new Ensemble();
 * const ensembledProgram = ensemble.compile([
 *   optimizedProgram1,
 *   optimizedProgram2,
 *   optimizedProgram3
 * ]);
 *
 * // Ensemble with majority voting
 * const majorityEnsemble = new Ensemble({
 *   reduce_fn: (outputs) => {
 *     // Implement majority voting
 *     const votes = outputs.map(o => o.data.answer);
 *     const counts = votes.reduce((acc, vote) => {
 *       acc[vote] = (acc[vote] || 0) + 1;
 *       return acc;
 *     }, {});
 *     const winner = Object.keys(counts).reduce((a, b) =>
 *       counts[a] > counts[b] ? a : b
 *     );
 *     return { data: { answer: winner }, confidence: counts[winner] / votes.length };
 *   }
 * });
 * const majorityProgram = majorityEnsemble.compile([
 *   program1, program2, program3, program4, program5
 * ]);
 *
 * // Ensemble with random sampling (useful for large program sets)
 * const samplingEnsemble = new Ensemble({
 *   size: 3,  // Randomly sample 3 programs per prediction
 *   reduce_fn: (outputs) => {
 *     // Average confidence scores
 *     const avgConfidence = outputs.reduce((sum, o) =>
 *       sum + (o.confidence || 0), 0) / outputs.length;
 *
 *     // Use highest confidence prediction
 *     const best = outputs.reduce((best, current) =>
 *       (current.confidence || 0) > (best.confidence || 0) ? current : best
 *     );
 *
 *     return { ...best, confidence: avgConfidence };
 *   }
 * });
 * const sampledProgram = samplingEnsemble.compile(manyPrograms);
 *
 * // Production ensemble with error handling
 * const productionEnsemble = new Ensemble({
 *   reduce_fn: (outputs) => {
 *     try {
 *       // Filter out failed predictions
 *       const validOutputs = outputs.filter(o => o.data && !o.data.error);
 *
 *       if (validOutputs.length === 0) {
 *         return { data: { error: "All ensemble members failed" }, confidence: 0 };
 *       }
 *
 *       // Weighted voting based on confidence
 *       const weighted = validOutputs.map(o => ({
 *         ...o,
 *         weight: o.confidence || 0.5
 *       }));
 *
 *       const totalWeight = weighted.reduce((sum, o) => sum + o.weight, 0);
 *       const normalized = weighted.map(o => ({
 *         ...o,
 *         normalizedWeight: o.weight / totalWeight
 *       }));
 *
 *       // Return consensus with aggregated confidence
 *       const consensus = selectConsensus(normalized);
 *       return {
 *         data: consensus.data,
 *         confidence: consensus.normalizedWeight,
 *         reasoning: `Ensemble consensus from ${validOutputs.length}/${outputs.length} members`
 *       };
 *     } catch (error) {
 *       return {
 *         data: { error: `Ensemble reduce failed: ${error.message}` },
 *         confidence: 0
 *       };
 *     }
 *   }
 * });
 *
 * // Multi-domain ensemble (different programs for different tasks)
 * const multiDomainEnsemble = new Ensemble({
 *   size: 2,  // Sample 2 programs per prediction
 *   reduce_fn: (outputs) => {
 *     // Domain-aware aggregation
 *     const domainScores = outputs.map(o => ({
 *       ...o,
 *       domain: detectDomain(o.data),
 *       expertise: calculateExpertise(o.data)
 *     }));
 *
 *     // Weight by domain expertise
 *     const expertChoice = domainScores.reduce((best, current) =>
 *       current.expertise > best.expertise ? current : best
 *     );
 *
 *     return {
 *       data: expertChoice.data,
 *       confidence: expertChoice.expertise,
 *       reasoning: `Selected expert for domain: ${expertChoice.domain}`
 *     };
 *   }
 * });
 *
 * const domainProgram = multiDomainEnsemble.compile([
 *   mathSpecialistProgram,
 *   scienceSpecialistProgram,
 *   generalPurposeProgram
 * ]);
 *
 * // Run ensemble prediction
 * const input = new Example({ question: "What is 2+2?", context: "math" });
 * const result = await ensembledProgram.forward(input);
 * console.log('Ensemble result:', result);
 *
 * // Access ensemble configuration
 * const config = ensemble.getConfig();
 * console.log('Ensemble settings:', config);
 * ```
 */
export declare class Ensemble {
    private config;
    /**
     * Initialize Ensemble teleprompter
     * Exact API match with Stanford DSPy constructor
     */
    constructor(config?: EnsembleConfig);
    /**
     * Compile multiple programs into an ensemble
     * Exact API match with Stanford DSPy compile method
     *
     * @param programs Array of DSPy modules to ensemble
     * @returns EnsembledProgram that combines all input programs
     */
    compile(programs: DSPyModule[]): EnsembledProgram;
    /**
     * Get configuration
     */
    getConfig(): Required<EnsembleConfig>;
}
export { Ensemble as EnsembleTeleprompter };
export default Ensemble;
//# sourceMappingURL=ensemble.d.ts.map