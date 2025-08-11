/**
 * @file Template processing engine.
 */

import { getLogger } from '../../../../config/logging-config.ts';
import type {
  ArchitectureDesign,
  DetailedSpecification,
  ProjectDomain,
  ProjectSpecification,
  PseudocodeStructure,
  SPARCTemplate,
} from '../types/sparc-types.ts';

const logger = getLogger('coordination-swarm-sparc-core-template-engine');

/**
 * SPARC Template Engine.
 *
 * Core template management system for SPARC methodology.
 * Provides template loading, application, validation, and customization.
 */

import { nanoid } from 'nanoid';
// Import all available templates
import { MEMORY_SYSTEMS_TEMPLATE } from '../templates/memory-systems-template.ts';
import { NEURAL_NETWORKS_TEMPLATE } from '../templates/neural-networks-template.ts';
import { REST_API_TEMPLATE } from '../templates/rest-api-template.ts';
import { SWARM_COORDINATION_TEMPLATE } from '../templates/swarm-coordination-template.ts';

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
  score: number; // 0-1 compatibility score
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
export class TemplateEngine {
  private readonly templateRegistry: Map<string, TemplateRegistryEntry>;
  private readonly domainMappings: Map<ProjectDomain, string[]>;

  constructor() {
    this.templateRegistry = new Map();
    this.domainMappings = new Map();
    this.initializeTemplateRegistry();
  }

  /**
   * Initialize template registry with all available templates.
   */
  private initializeTemplateRegistry(): void {
    const templates = [
      MEMORY_SYSTEMS_TEMPLATE,
      NEURAL_NETWORKS_TEMPLATE,
      REST_API_TEMPLATE,
      SWARM_COORDINATION_TEMPLATE,
    ];

    for (const template of templates) {
      this.registerTemplate(template);
    }

    // Initialize domain mappings
    this.domainMappings.set('memory-systems', ['memory-systems-template']);
    this.domainMappings.set('neural-networks', ['neural-networks-template']);
    this.domainMappings.set('rest-api', ['rest-api-template']);
    this.domainMappings.set('swarm-coordination', ['swarm-coordination-template']);
    this.domainMappings.set('general', ['memory-systems-template', 'rest-api-template']);
  }

  /**
   * Register a new template with the engine.
   *
   * @param template
   */
  registerTemplate(template: SPARCTemplate): void {
    const entry: TemplateRegistryEntry = {
      template,
      metadata: {
        registeredAt: new Date(),
        usageCount: 0,
        averageRating: 0,
      },
    };

    this.templateRegistry.set(template.id, entry);
  }

  /**
   * Get all available templates.
   */
  getAllTemplates(): SPARCTemplate[] {
    return Array.from(this.templateRegistry.values()).map((entry) => entry.template);
  }

  /**
   * Get templates by domain.
   *
   * @param domain
   */
  getTemplatesByDomain(domain: ProjectDomain): SPARCTemplate[] {
    const templateIds = this.domainMappings.get(domain) || [];
    return templateIds
      .map((id) => this.templateRegistry.get(id)?.template)
      .filter((template): template is SPARCTemplate => template !== undefined);
  }

  /**
   * Get template by ID.
   *
   * @param templateId
   */
  getTemplate(templateId: string): SPARCTemplate | null {
    return this.templateRegistry.get(templateId)?.template || null;
  }

  /**
   * Find best matching template for a project specification.
   *
   * @param projectSpec
   */
  findBestTemplate(projectSpec: ProjectSpecification): {
    template: SPARCTemplate;
    compatibility: TemplateValidationResult;
  } | null {
    const domainTemplates = this.getTemplatesByDomain(projectSpec.domain);

    if (domainTemplates.length === 0) {
      logger.warn(`⚠️ No templates found for domain: ${projectSpec.domain}`);
      return null;
    }

    let bestMatch: { template: SPARCTemplate; compatibility: TemplateValidationResult } | null =
      null;
    let bestScore = 0;

    for (const template of domainTemplates) {
      const compatibility = this.validateTemplateCompatibility(template, projectSpec);

      if (compatibility.compatible && compatibility.score > bestScore) {
        bestScore = compatibility.score;
        bestMatch = { template, compatibility };
      }
    }

    return bestMatch;
  }

  /**
   * Validate template compatibility with project specification.
   *
   * @param template
   * @param projectSpec
   */
  validateTemplateCompatibility(
    template: SPARCTemplate,
    projectSpec: ProjectSpecification
  ): TemplateValidationResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 1.0; // Start with perfect score

    // Check domain compatibility
    if (template.domain !== projectSpec.domain) {
      warnings.push(
        `Template domain (${template.domain}) doesn't match project domain (${projectSpec.domain})`
      );
      score -= 0.3;
    }

    // Check complexity compatibility
    const templateComplexity = template.metadata.complexity;
    const projectComplexity = projectSpec.complexity;

    if (templateComplexity === 'high' && projectComplexity === 'simple') {
      warnings.push('Template complexity may be higher than needed for simple project');
      recommendations.push('Consider simplifying template components');
      score -= 0.2;
    } else if (templateComplexity === 'simple' && projectComplexity === 'enterprise') {
      warnings.push('Template may be too simple for enterprise complexity');
      recommendations.push('Consider adding enterprise features');
      score -= 0.1;
    }

    // Check requirement coverage
    const templateRequirements = this.extractTemplateRequirements(template);
    const projectRequirements = projectSpec.requirements || [];

    const coverageScore = this.calculateRequirementCoverage(
      templateRequirements,
      projectRequirements
    );
    score = score * 0.7 + coverageScore * 0.3; // Weight the scores

    if (coverageScore < 0.7) {
      warnings.push('Template may not cover all project requirements');
      recommendations.push('Review and customize template to match specific requirements');
    }

    const compatible = score >= 0.6; // Minimum 60% compatibility required

    return {
      compatible,
      warnings,
      recommendations,
      score,
    };
  }

  /**
   * Apply template to project specification.
   *
   * @param template
   * @param projectSpec
   */
  async applyTemplate(
    template: SPARCTemplate,
    projectSpec: ProjectSpecification
  ): Promise<TemplateApplicationResult> {
    // Update usage statistics
    const entry = this.templateRegistry.get(template.id);
    if (entry) {
      entry.metadata.usageCount++;
      entry.metadata.lastUsed = new Date();
    }

    // Apply template using the template's own applyTo method
    const applied = await template.applyTo(projectSpec);

    // Generate unique IDs and update metadata
    const customizedSpec = {
      ...applied.specification,
      id: nanoid(),
      name: projectSpec.name,
      domain: projectSpec.domain,
    };

    const customizedPseudocode = {
      ...applied.pseudocode,
      id: nanoid(),
      specificationId: customizedSpec.id,
    };

    const customizedArchitecture = {
      ...applied.architecture,
      id: nanoid(),
      pseudocodeId: customizedPseudocode.id,
    };

    // Generate customization report
    const customizations = this.generateCustomizationReport(template, projectSpec);

    // Validate the applied template
    const validation = this.validateTemplateCompatibility(template, projectSpec);

    return {
      specification: customizedSpec,
      pseudocode: customizedPseudocode,
      architecture: customizedArchitecture,
      templateId: template.id,
      customizations,
      warnings: validation.warnings,
    };
  }

  /**
   * Create custom template from project specification.
   *
   * @param projectSpec
   * @param baseTemplateId
   */
  async createCustomTemplate(
    projectSpec: ProjectSpecification,
    baseTemplateId?: string
  ): Promise<SPARCTemplate> {
    let baseTemplate: SPARCTemplate | null = null;
    if (baseTemplateId) {
      baseTemplate = this.getTemplate(baseTemplateId);
    } else {
      // Find best matching template as base
      const bestMatch = this.findBestTemplate(projectSpec);
      baseTemplate = bestMatch?.template || null;
    }

    const customTemplateId = `custom-${projectSpec.domain}-${nanoid()}`;

    // Create basic template structure
    const customTemplate: SPARCTemplate = {
      id: customTemplateId,
      name: `Custom ${projectSpec.name} Template`,
      domain: projectSpec.domain,
      description: `Custom template generated for ${projectSpec.name}`,
      version: '1.0.0',
      metadata: {
        author: 'SPARC Template Engine',
        createdAt: new Date(),
        tags: [projectSpec.domain, projectSpec.complexity, 'custom'],
        complexity: projectSpec.complexity,
        estimatedDevelopmentTime: this.estimateDevelopmentTime(projectSpec),
        targetPerformance: 'Optimized for project requirements',
      },

      // Use base template structure or create minimal structure
      specification: baseTemplate?.specification || this.createMinimalSpecification(projectSpec),
      pseudocode: baseTemplate?.pseudocode || this.createMinimalPseudocode(projectSpec),
      architecture: baseTemplate?.architecture || this.createMinimalArchitecture(projectSpec),

      async applyTo(spec: ProjectSpecification) {
        return {
          specification: this.customizeSpecification(spec),
          pseudocode: this.customizePseudocode(spec),
          architecture: this.customizeArchitecture(spec),
        };
      },

      customizeSpecification:
        baseTemplate?.customizeSpecification || ((spec) => this.createMinimalSpecification(spec)),
      customizePseudocode:
        baseTemplate?.customizePseudocode || ((spec) => this.createMinimalPseudocode(spec)),
      customizeArchitecture:
        baseTemplate?.customizeArchitecture || ((spec) => this.createMinimalArchitecture(spec)),

      validateCompatibility:
        baseTemplate?.validateCompatibility ||
        ((_spec) => ({
          compatible: true,
          warnings: [],
          recommendations: [],
        })),
    };

    // Register the custom template
    this.registerTemplate(customTemplate);
    return customTemplate;
  }

  /**
   * Get template usage statistics.
   */
  getTemplateStats(): {
    totalTemplates: number;
    domainCoverage: Record<string, number>;
    mostUsed: string[];
    recentlyUsed: string[];
  } {
    const stats = {
      totalTemplates: this.templateRegistry.size,
      domainCoverage: {} as Record<string, number>,
      mostUsed: [] as string[],
      recentlyUsed: [] as string[],
    };

    // Calculate domain coverage
    for (const [domain, templateIds] of Array.from(this.domainMappings.entries())) {
      stats.domainCoverage[domain] = templateIds.length;
    }

    // Get most used templates
    const entriesByUsage = Array.from(this.templateRegistry.entries()).sort(
      (a, b) => b[1]?.metadata?.usageCount - a[1]?.metadata?.usageCount
    );
    stats.mostUsed = entriesByUsage.slice(0, 5).map(([id, _]) => id);

    // Get recently used templates
    const entriesByRecent = Array.from(this.templateRegistry.entries())
      .filter(([_, entry]) => entry.metadata.lastUsed)
      .sort((a, b) => b[1]?.metadata?.lastUsed!.getTime() - a[1]?.metadata?.lastUsed!.getTime());
    stats.recentlyUsed = entriesByRecent.slice(0, 5).map(([id, _]) => id);

    return stats;
  }

  // Private helper methods

  private extractTemplateRequirements(template: SPARCTemplate): string[] {
    const requirements: string[] = [];

    // Extract from functional requirements
    if (template.specification.functionalRequirements) {
      requirements.push(...template.specification.functionalRequirements.map((req) => req.title));
    }

    // Extract from template metadata tags
    if (template.metadata.tags) {
      requirements.push(...template.metadata.tags);
    }

    return requirements;
  }

  private calculateRequirementCoverage(
    templateRequirements: string[],
    projectRequirements: string[]
  ): number {
    if (projectRequirements.length === 0) {
      return 1.0; // Perfect score if no specific requirements
    }

    let matches = 0;
    for (const projectReq of projectRequirements) {
      const found = templateRequirements.some(
        (templateReq) =>
          templateReq.toLowerCase().includes(projectReq.toLowerCase()) ||
          projectReq.toLowerCase().includes(templateReq.toLowerCase())
      );
      if (found) matches++;
    }

    return matches / projectRequirements.length;
  }

  private generateCustomizationReport(
    template: SPARCTemplate,
    projectSpec: ProjectSpecification
  ): string[] {
    const customizations: string[] = [];

    if (template.domain !== projectSpec.domain) {
      customizations.push(`Adapted from ${template.domain} to ${projectSpec.domain} domain`);
    }

    if (projectSpec.constraints && projectSpec.constraints.length > 0) {
      customizations.push(`Added ${projectSpec.constraints.length} project-specific constraints`);
    }

    if (projectSpec.requirements && projectSpec.requirements.length > 0) {
      customizations.push(`Integrated ${projectSpec.requirements.length} custom requirements`);
    }

    customizations.push(`Updated project name to: ${projectSpec.name}`);
    customizations.push(`Set complexity level to: ${projectSpec.complexity}`);

    return customizations;
  }

  private estimateDevelopmentTime(projectSpec: ProjectSpecification): string {
    const complexityMultipliers = {
      simple: 1,
      moderate: 2,
      high: 3,
      complex: 4,
      enterprise: 6,
    };

    const baseWeeks = 2;
    const multiplier = complexityMultipliers[projectSpec.complexity] || 2;
    const estimatedWeeks = baseWeeks * multiplier;

    return `${estimatedWeeks}-${estimatedWeeks + 2} weeks`;
  }

  private createMinimalSpecification(projectSpec: ProjectSpecification): DetailedSpecification {
    return {
      id: nanoid(),
      domain: projectSpec.domain,
      functionalRequirements:
        projectSpec.requirements.map((req) => ({
          id: nanoid(),
          title: req,
          description: `Requirement: ${req}`,
          type: 'functional',
          priority: 'MEDIUM' as const,
          testCriteria: [`Implements ${req} successfully`],
        })) || [],
      nonFunctionalRequirements: [],
      constraints:
        projectSpec.constraints?.map((constraint) => ({
          id: nanoid(),
          type: 'business' as const,
          description: constraint,
          impact: 'medium' as const,
        })) || [],
      assumptions: [],
      dependencies: [],
      acceptanceCriteria: [],
      riskAssessment: {
        risks: [],
        mitigationStrategies: [],
        overallRisk: 'LOW' as const,
      },
      successMetrics: [],
    };
  }

  private createMinimalPseudocode(projectSpec: ProjectSpecification): PseudocodeStructure {
    return {
      id: nanoid(),
      algorithms: [],
      coreAlgorithms: [],
      dataStructures: [],
      controlFlows: [],
      optimizations: [],
      dependencies: [],
      complexityAnalysis: {
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        scalability: `Designed for ${projectSpec.complexity} complexity`,
        worstCase: 'TBD',
        bottlenecks: [],
      },
    };
  }

  private createMinimalArchitecture(_projectSpec: ProjectSpecification): ArchitectureDesign {
    return {
      id: nanoid(),
      components: [],
      relationships: [],
      patterns: [],
      securityRequirements: [],
      scalabilityRequirements: [],
      qualityAttributes: [],
      systemArchitecture: {
        components: [],
        interfaces: [],
        dataFlow: [],
        deploymentUnits: [],
        qualityAttributes: [],
        architecturalPatterns: [],
        technologyStack: [],
      },
      componentDiagrams: [],
      dataFlow: [],
      deploymentPlan: [],
      validationResults: {
        overall: true,
        score: 100,
        results: [],
        recommendations: [],
      },
    };
  }
}

// Export singleton instance
export const templateEngine = new TemplateEngine();
