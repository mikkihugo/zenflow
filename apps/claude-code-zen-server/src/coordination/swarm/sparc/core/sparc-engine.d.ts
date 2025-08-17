/**
 * @file Sparc processing engine.
 */
import type { ArtifactSet, CompletionValidation, PhaseResult, ProjectSpecification, RefinementFeedback, RefinementResult, SPARCEngine, SPARCPhase, SPARCProject } from '../types/sparc-types';
export declare class SPARCEngineCore implements SPARCEngine {
    private readonly phaseDefinitions;
    private readonly activeProjects;
    private readonly phaseEngines;
    private readonly projectManagement;
    private readonly documentDrivenSystem;
    private workflowEngine;
    private readonly swarmCoordinator;
    private readonly memorySystem;
    private readonly taskCoordinator;
    private readonly taskAPI;
    constructor();
    /**
     * Set the workflow engine to avoid circular dependency.
     *
     * This method provides dependency injection for the ProductWorkflowEngine to prevent
     * circular dependency issues while maintaining full integration capabilities.
     *
     * @param workflowEngine - The ProductWorkflowEngine instance to inject
     *
     * @example
     * ```typescript
     * const sparcEngine = new SPARCEngineCore();
     * const workflowEngine = new ProductWorkflowEngine(...);
     * sparcEngine.setWorkflowEngine(workflowEngine);
     * ```
     *
     * @since 1.0.0
     * @internal
     */
    setWorkflowEngine(workflowEngine: unknown): void;
    /**
     * Initialize specialized phase engines for all SPARC phases.
     *
     * Creates and configures dedicated engines for each SPARC methodology phase,
     * providing domain-specific processing capabilities and validation logic.
     *
     * @returns Map of SPARCPhase to corresponding engine instances
     *
     * @private
     * @since 1.0.0
     */
    private initializePhaseEngines;
    /**
     * Initialize a new SPARC project with configuration and domain-specific setup.
     *
     * This method creates a complete SPARC project structure with all phases initialized,
     * progress tracking, and domain-specific optimizations for the methodology.
     *
     * @param projectSpec - Configuration object for the SPARC project
     * @param projectSpec.name - Human-readable name for the project (e.g., "User Authentication API")
     * @param projectSpec.domain - Technical domain for domain-specific optimizations (e.g., "rest-api", "neural-networks", "swarm-coordination")
     * @param projectSpec.complexity - Project complexity level affecting phase execution strategies ("simple" | "moderate" | "complex")
     * @param projectSpec.requirements - Array of high-level requirements that will be refined during specification phase
     * @param projectSpec.constraints - Optional array of project constraints (performance, security, etc.)
     * @param projectSpec.stakeholders - Optional array of project stakeholders for context
     * @param projectSpec.timeline - Optional timeline information for project planning
     *
     * @returns Promise resolving to initialized SPARCProject with all phases ready for execution
     *
     * @throws {Error} When configuration is invalid or project initialization fails
     *
     * @example
     * ```typescript
     * const project = await sparcEngine.initializeProject({
     *   name: "E-commerce API",
     *   domain: "rest-api",
     *   complexity: "moderate",
     *   requirements: [
     *     "Secure user authentication",
     *     "Product catalog management",
     *     "Order processing workflow"
     *   ],
     *   constraints: ["PCI DSS compliance", "Sub-100ms response time"]
     * });
     * ```
     *
     * @since 1.0.0
     */
    initializeProject(projectSpec: ProjectSpecification): Promise<SPARCProject>;
    /**
     * Execute a specific SPARC methodology phase with intelligent orchestration.
     *
     * This method executes one of the five SPARC phases (Specification, Pseudocode, Architecture,
     * Refinement, Completion) with domain-specific optimizations and comprehensive deliverable generation.
     * Each phase builds upon previous phases and validates quality gates before completion.
     *
     * @param project - The SPARC project containing all phase state and configuration
     * @param phase - The specific SPARC phase to execute:
     *   - "specification": Detailed requirements analysis and specification generation
     *   - "pseudocode": Algorithm design and pseudocode generation with complexity analysis
     *   - "architecture": System architecture design with component and service definitions
     *   - "refinement": Optimization analysis and performance refinement strategies
     *   - "completion": Final implementation validation and production readiness assessment
     *
     * @returns Promise resolving to PhaseResult containing:
     *   - phase: The executed phase name for verification
     *   - success: Boolean indicating phase completion status
     *   - deliverables: Array of generated artifacts and documentation
     *   - metrics: Performance and quality metrics for the phase execution
     *   - nextPhase: Suggested next phase in the SPARC workflow (optional)
     *   - recommendations: Suggested next steps or optimizations for the phase
     *
     * @throws {Error} When phase execution fails due to missing dependencies or validation errors
     * @throws {ValidationError} When phase prerequisites are not met or quality gates fail
     *
     * @example
     * ```typescript
     * // Execute specification phase
     * const specResult = await sparcEngine.executePhase(project, 'specification');
     * if (specResult.success && specResult.metrics.qualityScore > 0.8) {
     *   // Proceed to pseudocode phase
     *   const pseudoResult = await sparcEngine.executePhase(project, 'pseudocode');
     * }
     * ```
     *
     * @since 1.0.0
     */
    executePhase(project: SPARCProject, phase: SPARCPhase): Promise<PhaseResult>;
    /**
     * Refine implementation based on feedback and optimization analysis.
     *
     * This method processes refinement feedback from various sources (code review, testing,
     * performance analysis) and applies systematic improvements to the SPARC project.
     * It identifies optimization opportunities and generates actionable refinement strategies.
     *
     * @param project - The SPARC project to refine with current implementation state
     * @param feedback - Structured feedback object containing:
     *   - id: Unique identifier for the feedback
     *   - metrics: Current performance metrics (latency, throughput, etc.)
     *   - targets: Target performance goals to achieve
     *   - issues: Array of identified performance, security, or quality issues
     *   - priority: Urgency level for addressing the feedback
     *   - source: Origin of feedback ("code_review", "testing", "performance_analysis", "security_audit")
     *
     * @returns Promise resolving to RefinementResult containing:
     *   - id: Unique identifier for the refinement result
     *   - architectureId: Reference to the refined architecture
     *   - feedbackId: Reference to the source feedback
     *   - optimizationStrategies: Array of high-level optimization approaches
     *   - performanceOptimizations: Specific performance improvement recommendations
     *   - securityOptimizations: Security enhancement suggestions
     *   - scalabilityOptimizations: Scalability improvement strategies
     *   - codeQualityOptimizations: Code quality enhancement recommendations
     *   - refinedArchitecture: The updated architecture design after refinements
     *   - benchmarkResults: Performance benchmark results if available
     *   - improvementMetrics: Measured or estimated improvement metrics
     *   - refactoringOpportunities: Code refactoring suggestions
     *   - technicalDebtAnalysis: Analysis of technical debt and remediation plan
     *   - recommendedNextSteps: Suggested follow-up actions
     *   - performanceGain: Estimated performance improvement percentage
     *   - resourceReduction: Estimated resource usage reduction percentage
     *   - scalabilityIncrease: Estimated scalability improvement factor
     *   - maintainabilityImprovement: Estimated maintainability improvement percentage
     *   - createdAt: Timestamp of refinement creation
     *   - updatedAt: Timestamp of last refinement update
     *
     * @throws {Error} When refinement process fails or feedback format is invalid
     * @throws {ValidationError} When suggested refinements would break existing functionality
     *
     * @example
     * ```typescript
     * const feedback: RefinementFeedback = {
     *   id: "perf-feedback-001",
     *   metrics: { latency: 250, throughput: 100 },
     *   targets: [{ metric: "latency", target: 100, priority: "high" }],
     *   issues: ["Database N+1 query pattern detected"],
     *   priority: "HIGH",
     *   source: "performance_analysis"
     * };
     *
     * const refinementResult = await sparcEngine.refineImplementation(project, feedback);
     * console.log(`Performance gain: ${refinementResult.performanceGain * 100}%`);
     * ```
     *
     * @since 1.0.0
     */
    refineImplementation(project: SPARCProject, feedback: RefinementFeedback): Promise<RefinementResult>;
    /**
     * Generate comprehensive artifacts for the entire SPARC project.
     *
     * This method creates a complete set of project artifacts including documentation,
     * architecture diagrams, source code templates, test specifications, and deployment
     * configurations. Artifacts are organized with proper relationships and metadata.
     *
     * @param project - The SPARC project for which to generate artifacts
     *
     * @returns Promise resolving to ArtifactSet containing:
     *   - artifacts: Array of ArtifactReference objects with:
     *     - id: Unique identifier for the artifact
     *     - name: Human-readable artifact name
     *     - type: Artifact category ("specification-document", "architecture-document", "source-code", "test-suite")
     *     - path: File system path where the artifact is stored
     *     - checksum: Content hash for integrity verification
     *     - createdAt: Timestamp of artifact creation
     *   - metadata: Set-level metadata including:
     *     - totalSize: Estimated total size of all artifacts in bytes
     *     - lastModified: Timestamp of most recent artifact modification
     *     - version: Version string from project metadata
     *     - author: Author information from project metadata
     *   - relationships: Array of artifact relationships defining dependencies:
     *     - source: Source artifact ID
     *     - target: Target artifact ID
     *     - type: Relationship type ("generates", "implements", "validates")
     *
     * @throws {Error} When artifact generation fails due to missing project data
     * @throws {ValidationError} When generated artifacts don't meet quality standards
     *
     * @example
     * ```typescript
     * const artifactSet = await sparcEngine.generateArtifacts(project);
     *
     * // Find specific artifact types
     * const specDocs = artifactSet.artifacts.filter(a => a.type === 'specification-document');
     * const sourceCode = artifactSet.artifacts.filter(a => a.type === 'source-code');
     *
     * console.log(`Generated ${artifactSet.artifacts.length} artifacts`);
     * console.log(`Total size: ${(artifactSet.metadata.totalSize / 1024 / 1024).toFixed(2)} MB`);
     * ```
     *
     * @since 1.0.0
     */
    generateArtifacts(project: SPARCProject): Promise<ArtifactSet>;
    /**
     * Validate comprehensive project completion and production readiness.
     *
     * This method performs thorough validation of all SPARC phases to ensure the project
     * meets production standards. It checks deliverable completeness, quality gates,
     * cross-phase consistency, and generates a detailed readiness assessment.
     *
     * @param project - The completed SPARC project to validate
     *
     * @returns Promise resolving to CompletionValidation containing:
     *   - readyForProduction: Boolean indicating if project passes all validation criteria
     *   - score: Overall completion score (0.0-1.0) based on weighted validation criteria
     *   - validations: Array of detailed validation results for each criterion:
     *     - criterion: Name of the validation rule (e.g., "all-phases-completed")
     *     - passed: Boolean indicating if criterion was met
     *     - score: Numeric score for this specific criterion
     *     - details: Detailed explanation of validation results
     *   - blockers: Array of critical issues preventing production deployment
     *   - warnings: Array of non-critical issues that should be addressed
     *   - overallScore: Duplicate of score for compatibility
     *   - validationResults: Duplicate of validations for compatibility
     *   - recommendations: Array of suggested actions based on validation results
     *   - approved: Boolean indicating if project is approved for production
     *   - productionReady: Duplicate of readyForProduction for compatibility
     *
     * @throws {Error} When validation process fails due to corrupted project state
     * @throws {ValidationError} When critical validation criteria cannot be evaluated
     *
     * @example
     * ```typescript
     * const validation = await sparcEngine.validateCompletion(project);
     *
     * if (validation.readyForProduction) {
     *   console.log(`✅ Project ready for production (Score: ${validation.score.toFixed(2)})`);
     *   if (validation.warnings.length > 0) {
     *     console.log(`⚠️ Warnings: ${validation.warnings.length}`);
     *   }
     * } else {
     *   console.log(`❌ Production readiness issues:`);
     *   validation.blockers.forEach(blocker => console.log(`  - ${blocker}`));
     *   console.log(`Recommendations:`);
     *   validation.recommendations.forEach(rec => console.log(`  - ${rec}`));
     * }
     * ```
     *
     * @since 1.0.0
     */
    validateCompletion(project: SPARCProject): Promise<CompletionValidation>;
    private initializePhaseDefinitions;
    private executePhaseLogic;
    private createEmptySpecification;
    private createEmptyPseudocode;
    private createEmptyArchitecture;
    private createEmptyImplementation;
    private createInitialProgress;
    private calculateOverallProgress;
    /**
     * Calculate real performance and quality metrics based on phase deliverables and project state.
     *
     * This method computes actual metrics from project data rather than using hardcoded values,
     * providing accurate assessment of phase execution quality and completeness.
     *
     * @param project - The SPARC project containing current state
     * @param phase - The specific SPARC phase that was executed
     * @param deliverables - Array of artifacts generated during phase execution
     * @param duration - Execution time in milliseconds
     *
     * @returns PhaseMetrics object containing:
     *   - duration: Execution time in minutes (minimum 0.01 for fast tests)
     *   - qualityScore: Calculated quality score (0.0-1.0) based on deliverable analysis
     *   - completeness: Completion percentage (0.0-1.0) based on expected deliverables
     *   - complexityScore: Complexity assessment (0.0-1.0) based on project requirements
     *
     * @private
     * @since 1.0.0
     */
    private calculatePhaseMetrics;
    private calculateSpecificationQuality;
    private calculateSpecificationCompleteness;
    private calculateArchitectureQuality;
    private calculateArchitectureCompleteness;
    private calculateImplementationQuality;
    private calculateImplementationCompleteness;
    private determineNextPhase;
    private generatePhaseRecommendations;
    private analyzePerformanceGaps;
    private generateRefinementStrategies;
    private calculateChecksum;
    /**
     * Create vision document for integration with DocumentDrivenSystem.
     *
     * @param project
     * @param spec
     */
    private createVisionDocument;
    /**
     * Execute existing document workflows using UnifiedProductWorkflowEngine.
     *
     * @param workspaceId
     * @param project
     */
    private executeDocumentWorkflows;
    /**
     * Generate all project management artifacts using existing infrastructure.
     *
     * @param project
     */
    private createAllProjectManagementArtifacts;
    /**
     * Create tasks from SPARC phases using existing TaskAPI.
     *
     * @param project
     */
    private createTasksFromSPARC;
    /**
     * Execute task using swarm coordination.
     *
     * @param _taskId
     * @param project
     * @param phase
     */
    private executeTaskWithSwarm;
    /**
     * Create ADR files using existing workspace structure.
     *
     * @param project
     */
    private createADRFilesWithWorkspace;
    /**
     * Save epics to workspace using existing document structure.
     *
     * @param project
     */
    private saveEpicsToWorkspace;
    /**
     * Save features from workspace using existing document structure.
     *
     * @param project
     */
    private saveFeaturesFromWorkspace;
    /**
     * Create epics from SPARC project phases.
     *
     * @param project
     */
    private createEpicsFromSPARC;
    /**
     * Create features from SPARC project.
     *
     * @param project
     */
    private createFeaturesFromSPARC;
    /**
     * Get comprehensive SPARC project status for external monitoring and coordination.
     *
     * This method provides detailed status information for monitoring systems,
     * SwarmCommander coordination, and infrastructure integration health checks.
     *
     * @param projectId - Unique identifier of the SPARC project
     *
     * @returns Promise resolving to comprehensive status object containing:
     *   - project: The SPARCProject instance or null if not found
     *   - swarmStatus: Current swarm coordination status and agent activity
     *   - infrastructureIntegration: Integration health for key systems:
     *     - documentWorkflows: Status of DocumentDrivenSystem integration
     *     - taskCoordination: Status of TaskAPI and TaskCoordinator integration
     *     - memoryPersistence: Status of MemorySystem integration
     *
     * @example
     * ```typescript
     * const status = await sparcEngine.getSPARCProjectStatus('project-123');
     *
     * if (status.project) {
     *   console.log(`Project: ${status.project.name}`);
     *   console.log(`Current Phase: ${status.project.currentPhase}`);
     *   console.log(`Progress: ${(status.project.progress.overallProgress * 100).toFixed(1)}%`);
     *
     *   if (status.infrastructureIntegration.documentWorkflows) {
     *     console.log('✅ Document workflows integrated');
     *   }
     * } else {
     *   console.log(`Project ${projectId} not found`);
     * }
     * ```
     *
     * @since 1.0.0
     */
    getSPARCProjectStatus(projectId: string): Promise<{
        project: SPARCProject | null;
        swarmStatus: unknown;
        infrastructureIntegration: {
            documentWorkflows: boolean;
            taskCoordination: boolean;
            memoryPersistence: boolean;
        };
    }>;
}
//# sourceMappingURL=sparc-engine.d.ts.map