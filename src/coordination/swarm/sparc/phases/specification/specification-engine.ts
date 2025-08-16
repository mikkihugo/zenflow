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

import { nanoid } from 'nanoid';
import { TemplateEngine } from '../../core/template-engine';
import type {
  AcceptanceCriterion,
  ConstraintAnalysis,
  DetailedSpecification,
  ExternalDependency,
  FunctionalRequirement,
  MitigationStrategy,
  NonFunctionalRequirement,
  ProjectAssumption,
  ProjectContext,
  ProjectDomain,
  ProjectRisk,
  ProjectSpecification,
  RequirementSet,
  RiskAnalysis,
  RiskLevel,
  SpecificationDocument,
  SpecificationEngine,
  SuccessMetric,
  SystemConstraint,
  ValidationReport,
  ValidationResult,
} from '../types/sparc-types';

export class SpecificationPhaseEngine implements SpecificationEngine {
  private readonly templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate specification from project using template-based approach.
   *
   * @param projectSpec
   * @param templateId
   */
  async generateSpecificationFromTemplate(
    projectSpec: ProjectSpecification,
    templateId?: string
  ): Promise<DetailedSpecification> {
    let template;
    if (templateId) {
      template = this.templateEngine.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
    } else {
      // Find best matching template
      const bestMatch = this.templateEngine.findBestTemplate(projectSpec);
      if (!bestMatch) {
        throw new Error(
          `No suitable template found for domain: ${projectSpec.domain}`
        );
      }
      template = bestMatch?.template;
    }

    // Apply template to project
    const result = await this.templateEngine.applyTemplate(
      template,
      projectSpec
    );

    // Generate additional specification details
    const enhancedSpec = await this.enhanceTemplateSpecification(
      result?.specification,
      projectSpec
    );

    return enhancedSpec;
  }

  /**
   * Enhance template-generated specification with additional analysis.
   *
   * @param templateSpec
   * @param projectSpec
   */
  private async enhanceTemplateSpecification(
    templateSpec: DetailedSpecification,
    projectSpec: ProjectSpecification
  ): Promise<DetailedSpecification> {
    // Add project-specific analysis
    const additionalRisks = await this.analyzeProjectSpecificRisks(projectSpec);
    const additionalDependencies =
      this.identifyAdditionalDependencies(projectSpec);
    const enhancedAcceptance = await this.defineAdditionalAcceptanceCriteria(
      templateSpec.functionalRequirements
    );

    return {
      ...templateSpec,
      riskAssessment: {
        ...templateSpec.riskAssessment,
        risks: [
          ...(templateSpec.riskAssessment?.risks || []),
          ...additionalRisks,
        ],
        mitigationStrategies:
          templateSpec.riskAssessment?.mitigationStrategies || [],
        overallRisk: templateSpec.riskAssessment?.overallRisk || 'LOW',
      },
      dependencies: [
        ...(templateSpec.dependencies || []),
        ...additionalDependencies,
      ],
      acceptanceCriteria: [
        ...(templateSpec.acceptanceCriteria || []),
        ...enhancedAcceptance,
      ],
    };
  }

  /**
   * List available templates for interactive selection.
   */
  getAvailableTemplates(): Array<{
    id: string;
    name: string;
    domain: string;
    description: string;
    complexity: string;
  }> {
    return this.templateEngine.getAllTemplates().map((template) => ({
      id: template.id,
      name: template.name,
      domain: template.domain,
      description: template.description,
      complexity: template.metadata.complexity,
    }));
  }

  /**
   * Validate template compatibility with project.
   *
   * @param projectSpec
   * @param templateId
   */
  validateTemplateCompatibility(
    projectSpec: ProjectSpecification,
    templateId: string
  ): {
    compatible: boolean;
    warnings: string[];
    recommendations: string[];
    score: number;
  } {
    const template = this.templateEngine.getTemplate(templateId);
    if (!template) {
      return {
        compatible: false,
        warnings: ['Template not found'],
        recommendations: ['Choose a different template'],
        score: 0,
      };
    }

    return this.templateEngine.validateTemplateCompatibility(
      template,
      projectSpec
    );
  }
  /**
   * Gather comprehensive requirements from project context.
   *
   * @param context
   */
  async gatherRequirements(context: ProjectContext): Promise<RequirementSet> {
    const functionalRequirements =
      await this.extractFunctionalRequirements(context);
    const nonFunctionalRequirements =
      await this.extractNonFunctionalRequirements(context);

    return [...functionalRequirements, ...nonFunctionalRequirements];
  }

  /**
   * Analyze system constraints and their implications.
   *
   * @param requirements
   */
  async analyzeConstraints(
    requirements: RequirementSet
  ): Promise<ConstraintAnalysis> {
    const systemConstraints = this.deriveSystemConstraints(requirements);
    const assumptions = this.identifyAssumptions(requirements);

    return [...systemConstraints, ...assumptions] as ConstraintAnalysis;
  }

  /**
   * Define comprehensive acceptance criteria for all requirements.
   *
   * @param requirements
   */
  async defineAcceptanceCriteria(
    requirements: (FunctionalRequirement | NonFunctionalRequirement)[]
  ): Promise<AcceptanceCriterion[]> {
    const acceptanceCriteria: AcceptanceCriterion[] = [];

    for (const requirement of requirements) {
      if ('testCriteria' in requirement) {
        // Functional requirement
        const funcReq = requirement as FunctionalRequirement;
        acceptanceCriteria.push({
          id: nanoid(),
          requirement: funcReq.id,
          criteria: funcReq.testCriteria,
          testMethod: this.determineTestMethod(funcReq),
        });
      } else {
        // Non-functional requirement
        const nonFuncReq = requirement as NonFunctionalRequirement;
        acceptanceCriteria.push({
          id: nanoid(),
          requirement: nonFuncReq.id,
          criteria: [
            `System meets ${nonFuncReq.title} requirements`,
            ...Object.entries(nonFuncReq.metrics).map(
              ([key, value]) => `${key}: ${value}`
            ),
          ],
          testMethod: 'automated',
        });
      }
    }
    return acceptanceCriteria;
  }

  /**
   * Generate comprehensive specification document.
   *
   * @param analysis
   */
  async generateSpecificationDocument(
    analysis: ConstraintAnalysis
  ): Promise<SpecificationDocument> {
    const functionalRequirements = this.extractFunctionalFromAnalysis(analysis);
    const nonFunctionalRequirements =
      this.extractNonFunctionalFromAnalysis(analysis);
    const constraints = this.extractConstraintsFromAnalysis(analysis);
    const assumptions = this.extractAssumptionsFromAnalysis(analysis);

    const riskAnalysis = await this.performRiskAnalysis(
      functionalRequirements,
      constraints
    );
    const dependencies = this.identifyExternalDependencies(
      functionalRequirements
    );
    const acceptanceCriteria = await this.defineAcceptanceCriteria([
      ...functionalRequirements,
      ...nonFunctionalRequirements,
    ]);
    const successMetrics = this.defineSuccessMetrics(
      functionalRequirements,
      nonFunctionalRequirements
    );

    const specification: DetailedSpecification = {
      id: `spec-${Date.now()}`, // Generate unique specification ID
      domain: 'general' as ProjectDomain, // Default domain since analysis doesn't have domain
      functionalRequirements,
      nonFunctionalRequirements,
      constraints,
      assumptions,
      dependencies,
      acceptanceCriteria,
      riskAssessment: riskAnalysis,
      successMetrics,
    };

    return specification;
  }

  /**
   * Validate specification completeness and quality.
   *
   * @param spec
   */
  async validateSpecificationCompleteness(
    spec: SpecificationDocument
  ): Promise<ValidationReport> {
    const validationResults: ValidationResult[] = [
      {
        criterion: 'functional-requirements-present',
        passed: spec.functionalRequirements.length > 0,
        score: spec.functionalRequirements.length > 0 ? 1.0 : 0.0,
        details: `${spec.functionalRequirements.length} functional requirements defined`,
      },
      {
        criterion: 'non-functional-requirements-present',
        passed: spec.nonFunctionalRequirements.length > 0,
        score: spec.nonFunctionalRequirements.length > 0 ? 1.0 : 0.0,
        details: `${spec.nonFunctionalRequirements.length} non-functional requirements defined`,
      },
      {
        criterion: 'acceptance-criteria-defined',
        passed: spec.acceptanceCriteria.length > 0,
        score: spec.acceptanceCriteria?.length
          ? spec.acceptanceCriteria.length /
            Math.max(1, spec.functionalRequirements.length)
          : 0,
        details: `${spec.acceptanceCriteria.length} acceptance criteria defined`,
      },
      {
        criterion: 'risk-assessment-complete',
        passed: spec.riskAssessment.risks.length > 0,
        score: spec.riskAssessment.risks.length > 0 ? 1.0 : 0.0,
        details: `${spec.riskAssessment.risks.length} risks identified and analyzed`,
      },
      {
        criterion: 'success-metrics-defined',
        passed: spec.successMetrics.length > 0,
        score: spec.successMetrics.length > 0 ? 1.0 : 0.0,
        details: `${spec.successMetrics.length} success metrics defined`,
      },
      {
        criterion: 'high-priority-requirements-complete',
        passed: this.validateHighPriorityRequirements(spec),
        score: this.calculateHighPriorityCompleteness(spec),
        details: 'High priority requirements have detailed acceptance criteria',
      },
    ];

    const overallScore =
      validationResults.reduce((sum, result) => sum + result?.score, 0) /
      validationResults.length;
    const allPassed = validationResults.every((result) => result?.passed);

    const recommendations =
      this.generateValidationRecommendations(validationResults);

    const report: ValidationReport = {
      overall: allPassed,
      score: overallScore,
      results: validationResults,
      recommendations,
    };
    return report;
  }

  // Private helper methods

  private async extractFunctionalRequirements(
    context: ProjectContext
  ): Promise<FunctionalRequirement[]> {
    const domainRequirements = this.getDomainSpecificRequirements(
      context.domain
    );

    const requirements: FunctionalRequirement[] = [
      {
        id: 'FR-001',
        title: 'Core System Functionality',
        description: `Primary functionality for ${context.domain} system`,
        type: 'functional',
        priority: 'HIGH',
        testCriteria: [
          'System provides core functionality',
          'All main use cases are supported',
          'System responds within acceptable time limits',
        ],
      },
      {
        id: 'FR-002',
        title: 'Error Handling',
        description: 'Comprehensive error handling and recovery',
        type: 'functional',
        priority: 'HIGH',
        testCriteria: [
          'System handles invalid inputs gracefully',
          'Appropriate error messages are displayed',
          'System maintains stability during errors',
        ],
      },
      {
        id: 'FR-003',
        title: 'Data Management',
        description: 'Efficient data storage and retrieval',
        type: 'functional',
        priority: 'MEDIUM',
        testCriteria: [
          'Data is stored securely and efficiently',
          'Data retrieval is fast and accurate',
          'Data integrity is maintained',
        ],
      },
      ...domainRequirements,
    ];

    return requirements;
  }

  private async extractNonFunctionalRequirements(
    context: ProjectContext
  ): Promise<NonFunctionalRequirement[]> {
    const baseRequirements: NonFunctionalRequirement[] = [
      {
        id: 'NFR-001',
        title: 'Performance Requirements',
        description: 'System performance benchmarks',
        metrics: {
          'response-time': '<100ms for API calls',
          throughput: '1000+ requests/second',
          'concurrent-users': '100+ simultaneous users',
        },
        priority: 'HIGH',
      },
      {
        id: 'NFR-002',
        title: 'Scalability Requirements',
        description: 'System scalability characteristics',
        metrics: {
          'horizontal-scaling': 'Support multiple instances',
          'load-distribution': 'Automatic load balancing',
          'resource-efficiency': '<50% CPU utilization at peak',
        },
        priority: 'HIGH',
      },
      {
        id: 'NFR-003',
        title: 'Reliability Requirements',
        description: 'System reliability and availability',
        metrics: {
          uptime: '99.9% availability',
          'error-rate': '<0.1% error rate',
          'recovery-time': '<30 seconds failure recovery',
        },
        priority: 'MEDIUM',
      },
      {
        id: 'NFR-004',
        title: 'Security Requirements',
        description: 'System security standards',
        metrics: {
          authentication: 'Multi-factor authentication support',
          authorization: 'Role-based access control',
          encryption: 'Data encryption at rest and in transit',
        },
        priority: 'HIGH',
      },
    ];

    // Add domain-specific non-functional requirements
    if (context.domain === 'neural-networks') {
      baseRequirements.push({
        id: 'NFR-005',
        title: 'Neural Processing Performance',
        description: 'Neural network computation requirements',
        metrics: {
          'training-speed': 'WASM acceleration for computations',
          'model-accuracy': '>95% accuracy on test datasets',
          'memory-efficiency': 'Optimized memory usage for large models',
        },
        priority: 'HIGH',
      });
    }

    if (context.domain === 'swarm-coordination') {
      baseRequirements.push({
        id: 'NFR-005',
        title: 'Coordination Performance',
        description: 'Agent coordination efficiency requirements',
        metrics: {
          'coordination-latency': '<5ms agent communication',
          'swarm-size': 'Support 1000+ concurrent agents',
          'consensus-time': '<100ms consensus decisions',
        },
        priority: 'HIGH',
      });
    }

    return baseRequirements;
  }

  private deriveSystemConstraints(
    requirements: RequirementSet
  ): SystemConstraint[] {
    const constraints: SystemConstraint[] = [
      {
        id: 'SC-001',
        type: 'technical',
        description: 'TypeScript implementation required for type safety',
        impact: 'medium',
      },
      {
        id: 'SC-002',
        type: 'performance',
        description: 'Sub-100ms response time requirement',
        impact: 'high',
      },
      {
        id: 'SC-003',
        type: 'business',
        description: 'Must integrate with existing Claude-Zen architecture',
        impact: 'high',
      },
    ];

    // Add constraints based on requirements analysis
    const hasPerformanceReqs = requirements.some(
      (req: unknown) =>
        'metrics' in req &&
        Object.keys(req.metrics).some(
          (key) =>
            key.includes('performance') ||
            key.includes('speed') ||
            key.includes('latency')
        )
    );

    if (hasPerformanceReqs) {
      constraints.push({
        id: 'SC-004',
        type: 'technical',
        description: 'High-performance implementation patterns required',
        impact: 'high',
      });
    }

    return constraints;
  }

  private identifyAssumptions(
    _requirements: RequirementSet
  ): ProjectAssumption[] {
    return [
      {
        id: 'PA-001',
        description: 'Users have basic technical knowledge',
        confidence: 'medium',
        riskIfIncorrect: 'MEDIUM',
      },
      {
        id: 'PA-002',
        description: 'Network connectivity is reliable',
        confidence: 'high',
        riskIfIncorrect: 'HIGH',
      },
      {
        id: 'PA-003',
        description:
          'System resources are adequate for performance requirements',
        confidence: 'medium',
        riskIfIncorrect: 'HIGH',
      },
    ];
  }

  private determineTestMethod(
    requirement: FunctionalRequirement
  ): 'automated' | 'manual' | 'integration' {
    if (requirement.priority === 'HIGH') {
      return 'automated';
    }
    if (
      requirement.testCriteria.some((criteria: unknown) =>
        criteria.includes('integration')
      )
    ) {
      return 'integration';
    }
    return 'manual';
  }

  private async performRiskAnalysis(
    _requirements: FunctionalRequirement[],
    _constraints: SystemConstraint[]
  ): Promise<RiskAnalysis> {
    const risks: ProjectRisk[] = [
      {
        id: 'PR-001',
        description: 'Performance requirements may be too aggressive',
        probability: 'medium',
        impact: 'high',
        category: 'technical',
      },
      {
        id: 'PR-002',
        description: 'Integration complexity with existing systems',
        probability: 'medium',
        impact: 'medium',
        category: 'technical',
      },
      {
        id: 'PR-003',
        description: 'Resource constraints may limit scalability',
        probability: 'low',
        impact: 'high',
        category: 'operational',
      },
    ];

    const mitigationStrategies: MitigationStrategy[] = [
      {
        riskId: 'PR-001',
        strategy:
          'Implement performance benchmarking and iterative optimization',
        priority: 'HIGH',
        effort: 'medium',
      },
      {
        riskId: 'PR-002',
        strategy: 'Create comprehensive integration test suite',
        priority: 'HIGH',
        effort: 'high',
      },
      {
        riskId: 'PR-003',
        strategy: 'Design for horizontal scaling from the start',
        priority: 'MEDIUM',
        effort: 'medium',
      },
    ];

    // Calculate overall risk level
    const highImpactRisks = risks.filter((r) => r.impact === 'high').length;
    const overallRisk: RiskLevel =
      highImpactRisks > 2 ? 'HIGH' : highImpactRisks > 0 ? 'MEDIUM' : 'LOW';

    return {
      risks,
      mitigationStrategies,
      overallRisk,
    };
  }

  private identifyExternalDependencies(
    _requirements: FunctionalRequirement[]
  ): ExternalDependency[] {
    return [
      {
        id: 'ED-001',
        name: 'TypeScript',
        type: 'library',
        version: '^5.0.0',
        critical: true,
      },
      {
        id: 'ED-002',
        name: 'Node',
        type: 'infrastructure',
        version: '>=20.0.0',
        critical: true,
      },
      {
        id: 'ED-003',
        name: 'Jest',
        type: 'library',
        version: '^30.0.0',
        critical: false,
      },
    ];
  }

  private defineSuccessMetrics(
    _functional: FunctionalRequirement[],
    _nonFunctional: NonFunctionalRequirement[]
  ): SuccessMetric[] {
    return [
      {
        id: 'SM-001',
        name: 'Requirement Coverage',
        description: 'Percentage of requirements successfully implemented',
        target: '100%',
        measurement: 'Automated testing and validation',
      },
      {
        id: 'SM-002',
        name: 'Performance Targets',
        description: 'Meeting all performance benchmarks',
        target: '100% of performance requirements met',
        measurement: 'Automated performance testing',
      },
      {
        id: 'SM-003',
        name: 'Code Quality',
        description: 'Maintainable, well-tested code',
        target: '>90% test coverage',
        measurement: 'Code coverage tools and quality metrics',
      },
    ];
  }

  private getDomainSpecificRequirements(
    domain: string
  ): FunctionalRequirement[] {
    const domainRequirements: Record<string, FunctionalRequirement[]> = {
      'swarm-coordination': [
        {
          id: 'FR-SWM-001',
          title: 'Agent Registration',
          description: 'Dynamic agent registration and discovery',
          type: 'functional',
          priority: 'HIGH',
          testCriteria: [
            'Agents can register with unique identifiers',
            'Agent capabilities are discoverable',
            'Failed agents are automatically deregistered',
          ],
        },
        {
          id: 'FR-SWM-002',
          title: 'Task Distribution',
          description: 'Intelligent task distribution to optimal agents',
          type: 'functional',
          priority: 'HIGH',
          testCriteria: [
            'Tasks are routed to capable agents within 100ms',
            'Load balancing maintains agent utilization balance',
            'Failed tasks are automatically redistributed',
          ],
        },
      ],
      'neural-networks': [
        {
          id: 'FR-NN-001',
          title: 'Neural Network Training',
          description:
            'Efficient neural network training with WASM acceleration',
          type: 'functional',
          priority: 'HIGH',
          testCriteria: [
            'Training uses WASM for heavy computations',
            'Training converges within expected iterations',
            'Model accuracy meets target thresholds',
          ],
        },
      ],
    };

    return domainRequirements[domain] || [];
  }

  private extractFunctionalFromAnalysis(
    _analysis: ConstraintAnalysis
  ): FunctionalRequirement[] {
    // Extract functional requirements from constraint analysis
    // This is a simplified implementation
    return [];
  }

  private extractNonFunctionalFromAnalysis(
    _analysis: ConstraintAnalysis
  ): NonFunctionalRequirement[] {
    // Extract non-functional requirements from constraint analysis
    return [];
  }

  private extractConstraintsFromAnalysis(
    analysis: ConstraintAnalysis
  ): SystemConstraint[] {
    return analysis.filter(
      (item): item is SystemConstraint =>
        'type' in item &&
        ['technical', 'business', 'regulatory', 'performance'].includes(
          item?.type
        )
    );
  }

  private extractAssumptionsFromAnalysis(
    analysis: ConstraintAnalysis
  ): ProjectAssumption[] {
    // Filter out only ProjectAssumption items
    const assumptions: ProjectAssumption[] = [];
    for (const item of analysis) {
      if ('confidence' in item && 'riskIfIncorrect' in item) {
        assumptions.push(item as ProjectAssumption);
      }
    }
    return assumptions;
  }

  private validateHighPriorityRequirements(
    spec: DetailedSpecification
  ): boolean {
    const highPriorityReqs = spec.functionalRequirements.filter(
      (req: unknown) => req.priority === 'HIGH'
    );
    return highPriorityReqs.every((req: unknown) =>
      spec.acceptanceCriteria.some((ac: unknown) => ac.requirement === req.id)
    );
  }

  private calculateHighPriorityCompleteness(
    spec: DetailedSpecification
  ): number {
    const highPriorityReqs = spec.functionalRequirements.filter(
      (req: unknown) => req.priority === 'HIGH'
    );
    if (highPriorityReqs.length === 0) return 1.0;

    const completedHighPriority = highPriorityReqs.filter((req: unknown) =>
      spec.acceptanceCriteria.some((ac: unknown) => ac.requirement === req.id)
    );

    return completedHighPriority.length / highPriorityReqs.length;
  }

  private generateValidationRecommendations(
    results: ValidationResult[]
  ): string[] {
    const recommendations: string[] = [];

    results.forEach((result) => {
      if (!result?.passed) {
        switch (result?.criterion) {
          case 'functional-requirements-present':
            recommendations.push(
              'Add detailed functional requirements for all major features'
            );
            break;
          case 'non-functional-requirements-present':
            recommendations.push(
              'Define performance, scalability, and reliability requirements'
            );
            break;
          case 'acceptance-criteria-defined':
            recommendations.push(
              'Create specific acceptance criteria for each functional requirement'
            );
            break;
          case 'risk-assessment-complete':
            recommendations.push(
              'Perform comprehensive risk analysis and define mitigation strategies'
            );
            break;
          case 'success-metrics-defined':
            recommendations.push(
              'Define measurable success metrics for project validation'
            );
            break;
          case 'high-priority-requirements-complete':
            recommendations.push(
              'Ensure all high-priority requirements have detailed acceptance criteria'
            );
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push(
        'Specification is complete - proceed to pseudocode phase'
      );
    }

    return recommendations;
  }

  // Template enhancement methods

  private async analyzeProjectSpecificRisks(
    projectSpec: ProjectSpecification
  ): Promise<ProjectRisk[]> {
    const risks: ProjectRisk[] = [];

    // Analyze complexity-based risks
    if (
      projectSpec.complexity === 'enterprise' ||
      projectSpec.complexity === 'complex'
    ) {
      risks.push({
        id: nanoid(),
        description: 'High complexity may lead to integration challenges',
        probability: 'medium',
        impact: 'high',
        category: 'technical',
      });
    }

    // Analyze domain-specific risks
    if (projectSpec.domain === 'neural-networks') {
      risks.push({
        id: nanoid(),
        description: 'WASM performance may not meet expectations',
        probability: 'low',
        impact: 'medium',
        category: 'technical',
      });
    }

    // Analyze constraint-based risks
    if (projectSpec.constraints && projectSpec.constraints.length > 3) {
      risks.push({
        id: nanoid(),
        description: 'Multiple constraints may conflict with each other',
        probability: 'medium',
        impact: 'medium',
        category: 'business',
      });
    }

    return risks;
  }

  private identifyAdditionalDependencies(
    projectSpec: ProjectSpecification
  ): ExternalDependency[] {
    const dependencies: ExternalDependency[] = [];

    // Add complexity-based dependencies
    if (projectSpec.complexity === 'enterprise') {
      dependencies.push({
        id: nanoid(),
        name: 'Enterprise Authentication',
        type: 'service',
        critical: true,
      });
    }

    // Add domain-specific dependencies
    if (projectSpec.domain === 'neural-networks') {
      dependencies.push({
        id: nanoid(),
        name: 'WASM Runtime',
        type: 'infrastructure',
        version: 'Latest',
        critical: true,
      });
    }

    return dependencies;
  }

  private async defineAdditionalAcceptanceCriteria(
    requirements: FunctionalRequirement[]
  ): Promise<AcceptanceCriterion[]> {
    const criteria: AcceptanceCriterion[] = [];

    for (const req of requirements) {
      if (
        req.priority === 'HIGH' &&
        req.testCriteria &&
        req.testCriteria.length > 0
      ) {
        criteria.push({
          id: nanoid(),
          requirement: req.id,
          criteria: [
            `${req.title} performance meets specification`,
            `${req.title} error handling is comprehensive`,
            `${req.title} integration testing passes`,
          ],
          testMethod: 'automated',
        });
      }
    }

    return criteria;
  }
}
