import { getLogger } from '../../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-sparc-core-template-engine');
import { nanoid } from 'nanoid';
import { MEMORY_SYSTEMS_TEMPLATE } from '../templates/memory-systems-template.ts';
import { NEURAL_NETWORKS_TEMPLATE } from '../templates/neural-networks-template.ts';
import { REST_API_TEMPLATE } from '../templates/rest-api-template.ts';
import { SWARM_COORDINATION_TEMPLATE } from '../templates/swarm-coordination-template.ts';
export class TemplateEngine {
    templateRegistry;
    domainMappings;
    constructor() {
        this.templateRegistry = new Map();
        this.domainMappings = new Map();
        this.initializeTemplateRegistry();
    }
    initializeTemplateRegistry() {
        const templates = [
            MEMORY_SYSTEMS_TEMPLATE,
            NEURAL_NETWORKS_TEMPLATE,
            REST_API_TEMPLATE,
            SWARM_COORDINATION_TEMPLATE,
        ];
        for (const template of templates) {
            this.registerTemplate(template);
        }
        this.domainMappings.set('memory-systems', ['memory-systems-template']);
        this.domainMappings.set('neural-networks', ['neural-networks-template']);
        this.domainMappings.set('rest-api', ['rest-api-template']);
        this.domainMappings.set('swarm-coordination', [
            'swarm-coordination-template',
        ]);
        this.domainMappings.set('general', [
            'memory-systems-template',
            'rest-api-template',
        ]);
    }
    registerTemplate(template) {
        const entry = {
            template,
            metadata: {
                registeredAt: new Date(),
                usageCount: 0,
                averageRating: 0,
            },
        };
        this.templateRegistry.set(template.id, entry);
    }
    getAllTemplates() {
        return Array.from(this.templateRegistry.values()).map((entry) => entry.template);
    }
    getTemplatesByDomain(domain) {
        const templateIds = this.domainMappings.get(domain) || [];
        return templateIds
            .map((id) => this.templateRegistry.get(id)?.template)
            .filter((template) => template !== undefined);
    }
    getTemplate(templateId) {
        return this.templateRegistry.get(templateId)?.template || null;
    }
    findBestTemplate(projectSpec) {
        const domainTemplates = this.getTemplatesByDomain(projectSpec.domain);
        if (domainTemplates.length === 0) {
            logger.warn(`⚠️ No templates found for domain: ${projectSpec.domain}`);
            return null;
        }
        let bestMatch = null;
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
    validateTemplateCompatibility(template, projectSpec) {
        const warnings = [];
        const recommendations = [];
        let score = 1.0;
        if (template.domain !== projectSpec.domain) {
            warnings.push(`Template domain (${template.domain}) doesn't match project domain (${projectSpec.domain})`);
            score -= 0.3;
        }
        const templateComplexity = template.metadata.complexity;
        const projectComplexity = projectSpec.complexity;
        if (templateComplexity === 'high' && projectComplexity === 'simple') {
            warnings.push('Template complexity may be higher than needed for simple project');
            recommendations.push('Consider simplifying template components');
            score -= 0.2;
        }
        else if (templateComplexity === 'simple' &&
            projectComplexity === 'enterprise') {
            warnings.push('Template may be too simple for enterprise complexity');
            recommendations.push('Consider adding enterprise features');
            score -= 0.1;
        }
        const templateRequirements = this.extractTemplateRequirements(template);
        const projectRequirements = projectSpec.requirements || [];
        const coverageScore = this.calculateRequirementCoverage(templateRequirements, projectRequirements);
        score = score * 0.7 + coverageScore * 0.3;
        if (coverageScore < 0.7) {
            warnings.push('Template may not cover all project requirements');
            recommendations.push('Review and customize template to match specific requirements');
        }
        const compatible = score >= 0.6;
        return {
            compatible,
            warnings,
            recommendations,
            score,
        };
    }
    async applyTemplate(template, projectSpec) {
        const entry = this.templateRegistry.get(template.id);
        if (entry) {
            entry.metadata.usageCount++;
            entry.metadata.lastUsed = new Date();
        }
        const applied = await template.applyTo(projectSpec);
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
        const customizations = this.generateCustomizationReport(template, projectSpec);
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
    async createCustomTemplate(projectSpec, baseTemplateId) {
        let baseTemplate = null;
        if (baseTemplateId) {
            baseTemplate = this.getTemplate(baseTemplateId);
        }
        else {
            const bestMatch = this.findBestTemplate(projectSpec);
            baseTemplate = bestMatch?.template || null;
        }
        const customTemplateId = `custom-${projectSpec.domain}-${nanoid()}`;
        const customTemplate = {
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
            specification: baseTemplate?.specification ||
                this.createMinimalSpecification(projectSpec),
            pseudocode: baseTemplate?.pseudocode || this.createMinimalPseudocode(projectSpec),
            architecture: baseTemplate?.architecture ||
                this.createMinimalArchitecture(projectSpec),
            async applyTo(spec) {
                return {
                    specification: this.customizeSpecification(spec),
                    pseudocode: this.customizePseudocode(spec),
                    architecture: this.customizeArchitecture(spec),
                };
            },
            customizeSpecification: baseTemplate?.customizeSpecification ||
                ((spec) => this.createMinimalSpecification(spec)),
            customizePseudocode: baseTemplate?.customizePseudocode ||
                ((spec) => this.createMinimalPseudocode(spec)),
            customizeArchitecture: baseTemplate?.customizeArchitecture ||
                ((spec) => this.createMinimalArchitecture(spec)),
            validateCompatibility: baseTemplate?.validateCompatibility ||
                ((_spec) => ({
                    compatible: true,
                    warnings: [],
                    recommendations: [],
                })),
        };
        this.registerTemplate(customTemplate);
        return customTemplate;
    }
    getTemplateStats() {
        const stats = {
            totalTemplates: this.templateRegistry.size,
            domainCoverage: {},
            mostUsed: [],
            recentlyUsed: [],
        };
        for (const [domain, templateIds] of Array.from(this.domainMappings.entries())) {
            stats.domainCoverage[domain] = templateIds.length;
        }
        const entriesByUsage = Array.from(this.templateRegistry.entries()).sort((a, b) => b[1]?.metadata?.usageCount - a[1]?.metadata?.usageCount);
        stats.mostUsed = entriesByUsage.slice(0, 5).map(([id, _]) => id);
        const entriesByRecent = Array.from(this.templateRegistry.entries())
            .filter(([_, entry]) => entry.metadata.lastUsed)
            .sort((a, b) => b[1]?.metadata?.lastUsed.getTime() -
            a[1]?.metadata?.lastUsed.getTime());
        stats.recentlyUsed = entriesByRecent.slice(0, 5).map(([id, _]) => id);
        return stats;
    }
    extractTemplateRequirements(template) {
        const requirements = [];
        if (template.specification.functionalRequirements) {
            requirements.push(...template.specification.functionalRequirements.map((req) => req.title));
        }
        if (template.metadata.tags) {
            requirements.push(...template.metadata.tags);
        }
        return requirements;
    }
    calculateRequirementCoverage(templateRequirements, projectRequirements) {
        if (projectRequirements.length === 0) {
            return 1.0;
        }
        let matches = 0;
        for (const projectReq of projectRequirements) {
            const found = templateRequirements.some((templateReq) => templateReq.toLowerCase().includes(projectReq.toLowerCase()) ||
                projectReq.toLowerCase().includes(templateReq.toLowerCase()));
            if (found)
                matches++;
        }
        return matches / projectRequirements.length;
    }
    generateCustomizationReport(template, projectSpec) {
        const customizations = [];
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
    estimateDevelopmentTime(projectSpec) {
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
    createMinimalSpecification(projectSpec) {
        return {
            id: nanoid(),
            domain: projectSpec.domain,
            functionalRequirements: projectSpec.requirements.map((req) => ({
                id: nanoid(),
                title: req,
                description: `Requirement: ${req}`,
                type: 'functional',
                priority: 'MEDIUM',
                testCriteria: [`Implements ${req} successfully`],
            })) || [],
            nonFunctionalRequirements: [],
            constraints: projectSpec.constraints?.map((constraint) => ({
                id: nanoid(),
                type: 'business',
                description: constraint,
                impact: 'medium',
            })) || [],
            assumptions: [],
            dependencies: [],
            acceptanceCriteria: [],
            riskAssessment: {
                risks: [],
                mitigationStrategies: [],
                overallRisk: 'LOW',
            },
            successMetrics: [],
        };
    }
    createMinimalPseudocode(projectSpec) {
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
    createMinimalArchitecture(_projectSpec) {
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
export const templateEngine = new TemplateEngine();
//# sourceMappingURL=template-engine.js.map