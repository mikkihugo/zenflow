/**
 * @file Template processing engine.
 */
import type { ArchitectureDesign, DetailedSpecification, ProjectDomain, ProjectSpecification, PseudocodeStructure, SPARCTemplate } from '../types/sparc-types.ts';
export interface TemplateApplicationResult {
    specification: DetailedSpecification;
    pseudocode: PseudocodeStructure;
    architecture: ArchitectureDesign;
    templateId: string;
    customizations: string[];
    warnings: string[];
}
export interface TemplateValidationResult {
    compatible: boolean;
    warnings: string[];
    recommendations: string[];
    score: number;
}
export interface TemplateRegistryEntry {
    template: SPARCTemplate;
    metadata: {
        registeredAt: Date;
        usageCount: number;
        averageRating: number;
        lastUsed?: Date;
    };
}
/**
 * Core template engine for SPARC methodology.
 *
 * @example
 */
export declare class TemplateEngine {
    private readonly templateRegistry;
    private readonly domainMappings;
    constructor();
    /**
     * Initialize template registry with all available templates.
     */
    private initializeTemplateRegistry;
    /**
     * Register a new template with the engine.
     *
     * @param template
     */
    registerTemplate(template: SPARCTemplate): void;
    /**
     * Get all available templates.
     */
    getAllTemplates(): SPARCTemplate[];
    /**
     * Get templates by domain.
     *
     * @param domain
     */
    getTemplatesByDomain(domain: ProjectDomain): SPARCTemplate[];
    /**
     * Get template by ID.
     *
     * @param templateId
     */
    getTemplate(templateId: string): SPARCTemplate | null;
    /**
     * Find best matching template for a project specification.
     *
     * @param projectSpec
     */
    findBestTemplate(projectSpec: ProjectSpecification): {
        template: SPARCTemplate;
        compatibility: TemplateValidationResult;
    } | null;
    /**
     * Validate template compatibility with project specification.
     *
     * @param template
     * @param projectSpec
     */
    validateTemplateCompatibility(template: SPARCTemplate, projectSpec: ProjectSpecification): TemplateValidationResult;
    /**
     * Apply template to project specification.
     *
     * @param template
     * @param projectSpec
     */
    applyTemplate(template: SPARCTemplate, projectSpec: ProjectSpecification): Promise<TemplateApplicationResult>;
    /**
     * Create custom template from project specification.
     *
     * @param projectSpec
     * @param baseTemplateId
     */
    createCustomTemplate(projectSpec: ProjectSpecification, baseTemplateId?: string): Promise<SPARCTemplate>;
    /**
     * Get template usage statistics.
     */
    getTemplateStats(): {
        totalTemplates: number;
        domainCoverage: Record<string, number>;
        mostUsed: string[];
        recentlyUsed: string[];
    };
    private extractTemplateRequirements;
    private calculateRequirementCoverage;
    private generateCustomizationReport;
    private estimateDevelopmentTime;
    private createMinimalSpecification;
    private createMinimalPseudocode;
    private createMinimalArchitecture;
}
export declare const templateEngine: TemplateEngine;
//# sourceMappingURL=template-engine.d.ts.map