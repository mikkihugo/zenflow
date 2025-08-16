/**
 * SPARC Specification Phase Engine.
 *
 * Handles the first phase of SPARC methodology - gathering and analyzing.
 * Detailed requirements, constraints, and acceptance criteria.
 *
 * TEMPLATE NTEGRATION: Now supports template-based specification generation.
 * Using the TemplateEngine for domain-specific requirements and patterns.
 */
/**
 * @file Specification processing engine.
 */
import type { AcceptanceCriterion, ConstraintAnalysis, DetailedSpecification, FunctionalRequirement, NonFunctionalRequirement, ProjectContext, ProjectSpecification, RequirementSet, SpecificationDocument, SpecificationEngine, ValidationReport } from '../types/sparc-types';
export declare class SpecificationPhaseEngine implements SpecificationEngine {
    private readonly templateEngine;
    constructor();
    /**
     * Generate specification from project using template-based approach.
     *
     * @param projectSpec
     * @param templateId
     */
    generateSpecificationFromTemplate(projectSpec: ProjectSpecification, templateId?: string): Promise<DetailedSpecification>;
    /**
     * Enhance template-generated specification with additional analysis.
     *
     * @param templateSpec
     * @param projectSpec
     */
    private enhanceTemplateSpecification;
    /**
     * List available templates for interactive selection.
     */
    getAvailableTemplates(): Array<{
        id: string;
        name: string;
        domain: string;
        description: string;
        complexity: string;
    }>;
    /**
     * Validate template compatibility with project.
     *
     * @param projectSpec
     * @param templateId
     */
    validateTemplateCompatibility(projectSpec: ProjectSpecification, templateId: string): {
        compatible: boolean;
        warnings: string[];
        recommendations: string[];
        score: number;
    };
    /**
     * Gather comprehensive requirements from project context.
     *
     * @param context
     */
    gatherRequirements(context: ProjectContext): Promise<RequirementSet>;
    /**
     * Analyze system constraints and their implications.
     *
     * @param requirements
     */
    analyzeConstraints(requirements: RequirementSet): Promise<ConstraintAnalysis>;
    /**
     * Define comprehensive acceptance criteria for all requirements.
     *
     * @param requirements
     */
    defineAcceptanceCriteria(requirements: (FunctionalRequirement | NonFunctionalRequirement)[]): Promise<AcceptanceCriterion[]>;
    /**
     * Generate comprehensive specification document.
     *
     * @param analysis
     */
    generateSpecificationDocument(analysis: ConstraintAnalysis): Promise<SpecificationDocument>;
    /**
     * Validate specification completeness and quality.
     *
     * @param spec
     */
    validateSpecificationCompleteness(spec: SpecificationDocument): Promise<ValidationReport>;
    private extractFunctionalRequirements;
    private extractNonFunctionalRequirements;
    private deriveSystemConstraints;
    private identifyAssumptions;
    private determineTestMethod;
    private performRiskAnalysis;
    private identifyExternalDependencies;
    private defineSuccessMetrics;
    private getDomainSpecificRequirements;
    private extractFunctionalFromAnalysis;
    private extractNonFunctionalFromAnalysis;
    private extractConstraintsFromAnalysis;
    private extractAssumptionsFromAnalysis;
    private validateHighPriorityRequirements;
    private calculateHighPriorityCompleteness;
    private generateValidationRecommendations;
    private analyzeProjectSpecificRisks;
    private identifyAdditionalDependencies;
    private defineAdditionalAcceptanceCriteria;
}
//# sourceMappingURL=specification-engine.d.ts.map