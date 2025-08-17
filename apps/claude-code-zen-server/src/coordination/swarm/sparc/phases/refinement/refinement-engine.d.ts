/**
 * SPARC Refinement Phase Engine.
 *
 * Handles the fourth phase of SPARC methodology - performance optimization,
 * iterative improvement, and quality enhancement.
 */
/**
 * @file Refinement processing engine.
 */
import type { AlgorithmRefinement, ArchitecturalRefinement, ArchitectureDesign, GapAnalysis, ImpactAssessment, Implementation, OptimizationPlan, PerformanceFeedback, PerformanceMetrics, RefinementChange, RefinementEngine, RefinementFeedback, RefinementResult, RefinementValidation, SystemArchitecture, UpdatedArchitecture } from '../types/sparc-types';
export declare class RefinementPhaseEngine implements RefinementEngine {
    /**
     * Apply refinements to architecture design based on feedback.
     *
     * @param architecture
     * @param feedback
     */
    applyRefinements(architecture: ArchitectureDesign, feedback: RefinementFeedback): Promise<RefinementResult>;
    /**
     * Identify optimization strategies based on feedback.
     *
     * @param _architecture
     * @param feedback
     */
    private identifyOptimizationStrategies;
    /**
     * Generate performance optimizations.
     *
     * @param architecture
     * @param _feedback
     */
    private generatePerformanceOptimizations;
    /**
     * Generate security optimizations.
     *
     * @param _architecture
     * @param _feedback
     */
    private generateSecurityOptimizations;
    /**
     * Generate scalability optimizations.
     *
     * @param _architecture
     * @param _feedback
     */
    private generateScalabilityOptimizations;
    /**
     * Generate code quality optimizations.
     *
     * @param _architecture
     * @param _feedback
     */
    private generateCodeQualityOptimizations;
    /**
     * Apply optimizations to architecture.
     *
     * @param architecture
     * @param strategies
     * @param performanceOpts
     * @param securityOpts
     * @param scalabilityOpts
     * @param _codeQualityOpts
     */
    private applyOptimizations;
    /**
     * Benchmark improvements between original and refined architecture.
     *
     * @param _original
     * @param _refined
     */
    private benchmarkImprovements;
    /**
     * Calculate improvement metrics.
     *
     * @param benchmarks
     */
    private calculateImprovementMetrics;
    /**
     * Identify refactoring opportunities.
     *
     * @param _architecture
     */
    private identifyRefactoringOpportunities;
    /**
     * Analyze technical debt.
     *
     * @param architecture
     */
    private analyzeTechnicalDebt;
    /**
     * Generate next steps recommendations.
     *
     * @param metrics
     */
    private generateNextStepsRecommendations;
    private calculateImprovedPerformance;
    private generateImprovedCriteria;
    /**
     * Validate refinement results.
     *
     * @param refinement
     */
    validateRefinement(refinement: RefinementResult): Promise<RefinementValidation>;
    /**
     * Generate refinement recommendations.
     *
     * @param validationResults
     */
    private generateRefinementRecommendations;
    analyzeImplementationGaps(architecture: SystemArchitecture, _currentImpl: Implementation): Promise<GapAnalysis>;
    generateOptimizationSuggestions(performance: PerformanceMetrics): Promise<OptimizationPlan>;
    refineAlgorithms(feedback: PerformanceFeedback): Promise<AlgorithmRefinement[]>;
    updateArchitecture(refinements: ArchitecturalRefinement[]): Promise<UpdatedArchitecture>;
    validateRefinementImpact(changes: RefinementChange[]): Promise<ImpactAssessment>;
}
//# sourceMappingURL=refinement-engine.d.ts.map