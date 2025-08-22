/**
 * @fileoverview Recommendation Engine for repository improvements
 * AI-powered recommendations based on comprehensive analysis
 */

import { getLogger } from '@claude-zen/foundation';

import type {
  RepositoryMetrics,
  AnalysisRecommendation,
  AnalysisOptions,
  EffortEstimate,
} from '../types/index.js';

export class RecommendationEngine {
  private logger = getLogger('RecommendationEngine');

  /**
   * Generate comprehensive recommendations
   */
  async generateRecommendations(
    repository: RepositoryMetrics,
    options?: AnalysisOptions
  ): Promise<AnalysisRecommendation[]> {
    this.logger.info('Generating repository improvement recommendations');

    const recommendations: AnalysisRecommendation[] = [];

    // Use analysis options to customize recommendation depth and focus areas
    const analysisContext = await this.buildAnalysisContext(
      repository,
      options
    );

    // Complexity-based recommendations
    recommendations.push(...this.generateComplexityRecommendations(repository));

    // Dependency-based recommendations
    recommendations.push(...this.generateDependencyRecommendations(repository));

    // Domain-based recommendations
    recommendations.push(...this.generateDomainRecommendations(repository));

    // Git-based recommendations
    if (repository.gitMetrics) {
      recommendations.push(...this.generateGitRecommendations(repository));
    }

    // Architecture recommendations
    recommendations.push(
      ...this.generateArchitectureRecommendations(repository)
    );

    // Performance recommendations
    recommendations.push(
      ...this.generatePerformanceRecommendations(repository)
    );

    // Security recommendations
    recommendations.push(...this.generateSecurityRecommendations(repository));

    // Team workflow recommendations
    recommendations.push(...this.generateWorkflowRecommendations(repository));

    return recommendations
      .sort(
        (a, b) =>
          this.getPriorityWeight(b.priority) -
          this.getPriorityWeight(a.priority)
      )
      .slice(0, 50); // Limit to top 50 recommendations
  }

  /**
   * Generate complexity-based recommendations
   */
  private generateComplexityRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];
    const complexity = repository.complexity;

    // High cyclomatic complexity
    if (complexity.cyclomatic > 50) {
      recommendations.push({
        type: 'refactor-hotspot',
        priority: 'high',
        title: 'Reduce Cyclomatic Complexity',
        description: `Repository has high cyclomatic complexity (${complexity.cyclomatic}). This makes code harder to understand, test, and maintain.`,
        rationale:
          'High cyclomatic complexity indicates complex decision logic that should be simplified through refactoring.',
        effort: this.estimateEffort(
          16,
          'medium',
          'Refactoring complex functions requires careful analysis and testing'
        ),
        benefits: [
          'Improved code readability and maintainability',
          'Easier unit testing with fewer test cases',
          'Reduced bug likelihood in complex logic',
          'Better team productivity with simpler code',
        ],
        risks: [
          'Refactoring may temporarily introduce bugs',
          'Requires comprehensive testing during changes',
        ],
        actionItems: [
          {
            description: 'Identify functions with complexity > 10',
            type: 'code-change',
            estimatedHours: 4,
            dependencies: [],
          },
          {
            description: 'Break down complex functions into smaller ones',
            type: 'code-change',
            estimatedHours: 8,
            dependencies: ['Identify functions with complexity > 10'],
          },
          {
            description: 'Add unit tests for refactored functions',
            type: 'code-change',
            estimatedHours: 4,
            dependencies: ['Break down complex functions into smaller ones'],
          },
        ],
      });
    }

    // Low maintainability index
    if (complexity.maintainabilityIndex < 30) {
      recommendations.push({
        type: 'improve-cohesion',
        priority: 'high',
        title: 'Improve Code Maintainability',
        description: `Maintainability index is ${complexity.maintainabilityIndex.toFixed(1)} (threshold: 30). Code requires significant effort to maintain.`,
        rationale:
          'Low maintainability index indicates code that is difficult to understand, modify, and extend.',
        effort: this.estimateEffort(
          24,
          'high',
          'Improving maintainability requires systematic refactoring'
        ),
        benefits: [
          'Faster development velocity',
          'Reduced time to fix bugs',
          'Easier onboarding for new team members',
          'Lower long-term maintenance costs',
        ],
        risks: [
          'Large-scale refactoring effort required',
          'May impact development velocity short-term',
        ],
        actionItems: [
          {
            description: 'Audit code for maintainability issues',
            type: 'code-change',
            estimatedHours: 8,
            dependencies: [],
          },
          {
            description: 'Implement coding standards and linting rules',
            type: 'tooling-change',
            estimatedHours: 4,
            dependencies: [],
          },
          {
            description: 'Refactor low-maintainability modules',
            type: 'code-change',
            estimatedHours: 12,
            dependencies: ['Audit code for maintainability issues'],
          },
        ],
      });
    }

    // High technical debt
    if (complexity.technicalDebt > 100) {
      recommendations.push({
        type: 'refactor-hotspot',
        priority: 'medium',
        title: 'Address Technical Debt',
        description: `Estimated technical debt: ${complexity.technicalDebt.toFixed(1)} hours. This represents accumulated shortcuts and suboptimal code.`,
        rationale:
          'High technical debt slows down development and increases maintenance costs over time.',
        effort: this.estimateEffort(
          complexity.technicalDebt * 0.5,
          'medium',
          'Technical debt requires gradual, systematic cleanup'
        ),
        benefits: [
          'Improved development velocity',
          'Reduced bug frequency',
          'Better code quality',
          'Easier feature development',
        ],
        risks: [
          'Resource allocation needed for non-feature work',
          'May introduce regressions if not carefully managed',
        ],
        actionItems: [
          {
            description: 'Prioritize technical debt items by impact',
            type: 'process-change',
            estimatedHours: 4,
            dependencies: [],
          },
          {
            description: 'Allocate 20% of sprint capacity to debt reduction',
            type: 'process-change',
            estimatedHours: 0,
            dependencies: ['Prioritize technical debt items by impact'],
          },
          {
            description: 'Track debt reduction progress',
            type: 'process-change',
            estimatedHours: 2,
            dependencies: [],
          },
        ],
      });
    }

    // Code smells
    if (complexity.codeSmells.length > 10) {
      const criticalSmells = complexity.codeSmells.filter(
        (s) => s.severity === 'high''' | '''' | ''s.severity ==='critical'
      );

      if (criticalSmells.length > 0) {
        recommendations.push({
          type: 'refactor-hotspot',
          priority: 'high',
          title: 'Fix Critical Code Smells',
          description: `Found ${criticalSmells.length} critical code smells that need immediate attention.`,
          rationale:
            'Critical code smells indicate fundamental design or implementation issues that impact code quality.',
          effort: this.estimateEffort(
            criticalSmells.length * 2,
            'medium',
            'Each code smell requires analysis and targeted refactoring'
          ),
          benefits: [
            'Improved code quality and readability',
            'Reduced bug likelihood',
            'Better maintainability',
            'Enhanced team productivity',
          ],
          risks: [
            'May require architectural changes',
            'Testing needed to ensure no regressions',
          ],
          actionItems: criticalSmells.slice(0, 5).map((smell) => ({
            description: `Fix ${smell.type} in ${smell.file}:${smell.startLine}`,
            type: 'code-change' as const,
            estimatedHours: 2,
            dependencies: [],
          })),
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate dependency-based recommendations
   */
  private generateDependencyRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];
    const dependencies = repository.dependencies;

    // Circular dependencies
    if (dependencies.circularDependencies.length > 0) {
      const criticalCycles = dependencies.circularDependencies.filter(
        (c) => c.severity === 'error'
      );

      recommendations.push({
        type: 'reduce-coupling',
        priority: criticalCycles.length > 0 ? 'urgent' : 'high',
        title: 'Break Circular Dependencies',
        description: `Found ${dependencies.circularDependencies.length} circular dependencies (${criticalCycles.length} critical). These create tight coupling and make code harder to test and maintain.`,
        rationale:
          'Circular dependencies prevent proper modularization and can cause build issues, infinite loops, and testing difficulties.',
        effort: this.estimateEffort(
          dependencies.circularDependencies.length * 4,
          'high',
          'Breaking circular dependencies requires architectural changes'
        ),
        benefits: [
          'Improved modularity and testability',
          'Easier code understanding and maintenance',
          'Better build performance and reliability',
          'Reduced risk of infinite loops and stack overflows',
        ],
        risks: [
          'May require significant architectural changes',
          'Risk of breaking existing functionality',
          'Complex refactoring effort required',
        ],
        actionItems: dependencies.circularDependencies
          .slice(0, 5)
          .map((cycle, index) => ({
            description: `Break circular dependency: ${cycle.cycle.join(' → ')}`,
            type: 'architecture-change' as const,
            estimatedHours: 4,
            dependencies:
              index > 0
                ? [
                    `Break circular dependency: ${dependencies.circularDependencies[index - 1].cycle.join(' → ')}`,
                  ]
                : [],
          })),
      });
    }

    // High instability
    if (dependencies.coupling.instability > 0.8) {
      recommendations.push({
        type: 'reduce-coupling',
        priority: 'medium',
        title: 'Reduce System Instability',
        description: `System instability is ${(dependencies.coupling.instability * 100).toFixed(1)}% (threshold: 80%). High instability makes the system more prone to changes and bugs.`,
        rationale:
          'High instability indicates that many modules depend on external dependencies, making the system fragile to changes.',
        effort: this.estimateEffort(
          20,
          'high',
          'Reducing instability requires architectural restructuring'
        ),
        benefits: [
          'More stable and predictable system behavior',
          'Easier to make changes without side effects',
          'Improved testing and debugging',
          'Better separation of concerns',
        ],
        risks: [
          'Requires significant architectural planning',
          'May impact development velocity during transition',
        ],
        actionItems: [
          {
            description: 'Identify modules with highest instability',
            type: 'architecture-change',
            estimatedHours: 4,
            dependencies: [],
          },
          {
            description: 'Apply Dependency Inversion Principle',
            type: 'architecture-change',
            estimatedHours: 12,
            dependencies: ['Identify modules with highest instability'],
          },
          {
            description: 'Introduce interfaces and abstractions',
            type: 'code-change',
            estimatedHours: 8,
            dependencies: ['Apply Dependency Inversion Principle'],
          },
        ],
      });
    }

    // Poor cohesion
    if (dependencies.cohesion.lcom > 0.7) {
      recommendations.push({
        type: 'improve-cohesion',
        priority: 'medium',
        title: 'Improve Module Cohesion',
        description: `Module cohesion is low (LCOM: ${(dependencies.cohesion.lcom * 100).toFixed(1)}%). Modules contain unrelated functionality.`,
        rationale:
          'Low cohesion indicates that modules are doing too many unrelated things, making them harder to understand and maintain.',
        effort: this.estimateEffort(
          16,
          'medium',
          'Improving cohesion requires careful module reorganization'
        ),
        benefits: [
          'Better organized and understandable code',
          'Easier testing and debugging',
          'Improved reusability',
          'Better team specialization',
        ],
        risks: [
          'May require module restructuring',
          'Need to maintain backward compatibility',
        ],
        actionItems: [
          {
            description: 'Analyze modules with low cohesion',
            type: 'architecture-change',
            estimatedHours: 6,
            dependencies: [],
          },
          {
            description: 'Split modules by single responsibility',
            type: 'code-change',
            estimatedHours: 10,
            dependencies: ['Analyze modules with low cohesion'],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate domain-based recommendations
   */
  private generateDomainRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];

    for (const domain of repository.domains) {
      if (domain.splitRecommendation?.shouldSplit) {
        const split = domain.splitRecommendation;

        recommendations.push({
          type: 'split-domain',
          priority: split.confidence > 0.8 ? 'high' : 'medium',
          title: `Split ${domain.name} Domain`,
          description: `Domain "${domain.name}" should be split (confidence: ${(split.confidence * 100).toFixed(1)}%). ${split.reasons.join('; ')}.`,
          rationale: `Domain analysis indicates that splitting would improve maintainability and team productivity.`,
          effort: split.estimatedEffort,
          benefits: Object.entries(split.benefits).map(
            ([key, value]) =>
              `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}% improvement`
          ),
          risks: split.risks.map((risk) => risk.description),
          actionItems: split.estimatedEffort.phases.map((phase) => ({
            description: phase.description,
            type: 'architecture-change' as const,
            estimatedHours: phase.estimatedHours,
            dependencies: phase.dependencies,
          })),
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate git-based recommendations
   */
  private generateGitRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];
    const git = repository.gitMetrics!;

    // Too many hot files
    if (git.hotFiles.length > 20) {
      const criticalHotFiles = git.hotFiles.filter((f) => f.riskScore > 0.8);

      recommendations.push({
        type: 'refactor-hotspot',
        priority: 'high',
        title: 'Address Hot Files',
        description: `Found ${git.hotFiles.length} frequently changed files (${criticalHotFiles.length} high-risk). These files are change-prone and may need refactoring.`,
        rationale:
          'Hot files indicate unstable code that changes frequently, often due to poor design or multiple responsibilities.',
        effort: this.estimateEffort(
          criticalHotFiles.length * 6,
          'medium',
          'Each hot file needs analysis and potential refactoring'
        ),
        benefits: [
          'Reduced change frequency and conflicts',
          'Improved code stability',
          'Better team productivity',
          'Lower bug frequency',
        ],
        risks: [
          'Hot files may be critical to system functionality',
          'Refactoring may require extensive testing',
        ],
        actionItems: criticalHotFiles.slice(0, 5).map((file) => ({
          description: `Refactor high-risk file: ${file.file}`,
          type: 'code-change' as const,
          estimatedHours: 6,
          dependencies: [],
        })),
      });
    }

    // Low contributor diversity
    if (git.contributors < 3) {
      recommendations.push({
        type: 'improve-cohesion',
        priority: 'medium',
        title: 'Increase Team Collaboration',
        description: `Only ${git.contributors} contributors found. Low contributor diversity may indicate knowledge silos or team structure issues.`,
        rationale:
          'Having few contributors creates bus factor risk and may indicate that knowledge is concentrated in too few people.',
        effort: this.estimateEffort(
          8,
          'low',
          'Improving collaboration requires process and cultural changes'
        ),
        benefits: [
          'Reduced bus factor risk',
          'Better knowledge sharing',
          'Improved code quality through reviews',
          'Enhanced team learning',
        ],
        risks: [
          'May require team structure changes',
          'Need to balance code review overhead',
        ],
        actionItems: [
          {
            description: 'Implement pair programming practices',
            type: 'process-change',
            estimatedHours: 2,
            dependencies: [],
          },
          {
            description: 'Establish code review requirements',
            type: 'process-change',
            estimatedHours: 2,
            dependencies: [],
          },
          {
            description: 'Create knowledge sharing sessions',
            type: 'process-change',
            estimatedHours: 4,
            dependencies: [],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate architecture recommendations
   */
  private generateArchitectureRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];

    // Large repository size
    if (repository.totalFiles > 500) {
      recommendations.push({
        type: 'split-domain',
        priority: 'medium',
        title: 'Consider Repository Splitting',
        description: `Repository has ${repository.totalFiles} files. Large repositories can impact development velocity and team coordination.`,
        rationale:
          'Large repositories become harder to navigate, build times increase, and team coordination becomes more complex.',
        effort: this.estimateEffort(
          40,
          'very-high',
          'Repository splitting is a major architectural change'
        ),
        benefits: [
          'Improved build and CI/CD performance',
          'Better team ownership and autonomy',
          'Easier navigation and understanding',
          'Reduced coordination overhead',
        ],
        risks: [
          'Complex migration effort required',
          'May impact shared dependencies',
          'Tooling and infrastructure changes needed',
        ],
        actionItems: [
          {
            description: 'Analyze repository boundaries and dependencies',
            type: 'architecture-change',
            estimatedHours: 16,
            dependencies: [],
          },
          {
            description: 'Plan migration strategy',
            type: 'architecture-change',
            estimatedHours: 12,
            dependencies: ['Analyze repository boundaries and dependencies'],
          },
          {
            description: 'Implement monorepo tools or split strategy',
            type: 'architecture-change',
            estimatedHours: 24,
            dependencies: ['Plan migration strategy'],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];

    // Many large files
    const avgFileSize = repository.totalLines / repository.totalFiles;
    if (avgFileSize > 200) {
      recommendations.push({
        type: 'refactor-hotspot',
        priority: 'medium',
        title: 'Reduce Large File Sizes',
        description: `Average file size is ${avgFileSize.toFixed(0)} lines. Large files are harder to understand and maintain.`,
        rationale:
          'Large files often violate the Single Responsibility Principle and are harder to review, test, and maintain.',
        effort: this.estimateEffort(
          12,
          'medium',
          'File splitting requires careful analysis of responsibilities'
        ),
        benefits: [
          'Improved code readability',
          'Easier code reviews',
          'Better testability',
          'Reduced merge conflicts',
        ],
        risks: [
          'May require interface changes',
          'Need to maintain logical cohesion',
        ],
        actionItems: [
          {
            description: 'Identify files larger than 300 lines',
            type: 'code-change',
            estimatedHours: 2,
            dependencies: [],
          },
          {
            description: 'Split large files by responsibility',
            type: 'code-change',
            estimatedHours: 10,
            dependencies: ['Identify files larger than 300 lines'],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];

    // High external dependencies
    if (repository.dependencies.totalDependencies > 100) {
      recommendations.push({
        type: 'reduce-coupling',
        priority: 'medium',
        title: 'Audit External Dependencies',
        description: `Repository has ${repository.dependencies.totalDependencies} external dependencies. This increases security attack surface.`,
        rationale:
          'Many external dependencies increase security risks, maintenance burden, and potential for supply chain attacks.',
        effort: this.estimateEffort(
          8,
          'low',
          'Dependency audit is primarily analysis work'
        ),
        benefits: [
          'Reduced security attack surface',
          'Lower maintenance burden',
          'Better control over code quality',
          'Improved build performance',
        ],
        risks: [
          'May need to implement functionality in-house',
          'Could impact development velocity short-term',
        ],
        actionItems: [
          {
            description: 'Audit all external dependencies for necessity',
            type: 'code-change',
            estimatedHours: 4,
            dependencies: [],
          },
          {
            description: 'Remove unused dependencies',
            type: 'code-change',
            estimatedHours: 2,
            dependencies: ['Audit all external dependencies for necessity'],
          },
          {
            description: 'Implement dependency scanning in CI/CD',
            type: 'tooling-change',
            estimatedHours: 2,
            dependencies: [],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate workflow recommendations
   */
  private generateWorkflowRecommendations(
    repository: RepositoryMetrics
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];

    // High complexity without sufficient tooling
    if (repository.complexity.cyclomatic > 30) {
      recommendations.push({
        type: 'improve-cohesion',
        priority: 'low',
        title: 'Implement Code Quality Gates',
        description:
          'High complexity detected. Implement automated code quality checks to prevent regression.',
        rationale:
          'Automated quality gates help maintain code quality standards and catch issues early in development.',
        effort: this.estimateEffort(
          6,
          'low',
          'Setting up quality gates is primarily configuration work'
        ),
        benefits: [
          'Consistent code quality standards',
          'Early detection of quality issues',
          'Reduced manual review overhead',
          'Better team alignment on standards',
        ],
        risks: [
          'May initially slow down development',
          'Need to calibrate thresholds appropriately',
        ],
        actionItems: [
          {
            description: 'Set up ESLint/TSLint with complexity rules',
            type: 'tooling-change',
            estimatedHours: 2,
            dependencies: [],
          },
          {
            description: 'Configure code coverage thresholds',
            type: 'tooling-change',
            estimatedHours: 2,
            dependencies: [],
          },
          {
            description: 'Add quality gates to CI/CD pipeline',
            type: 'tooling-change',
            estimatedHours: 2,
            dependencies: [
              'Set up ESLint/TSLint with complexity rules',
              'Configure code coverage thresholds',
            ],
          },
        ],
      });
    }

    return recommendations;
  }

  // Helper methods
  private estimateEffort(
    hours: number,
    difficulty: EffortEstimate['difficulty'],
    description: string
  ): EffortEstimate {
    return {
      hours: Math.max(1, Math.round(hours)),
      difficulty,
      phases: [
        {
          name: 'Planning',
          description: 'Plan implementation approach and identify dependencies',
          estimatedHours: Math.max(1, Math.round(hours * 0.2)),
          dependencies: [],
          risks: ['Insufficient planning may lead to scope creep'],
        },
        {
          name: 'Implementation',
          description: description,
          estimatedHours: Math.max(1, Math.round(hours * 0.6)),
          dependencies: ['Planning'],
          risks: ['Implementation complexity may exceed estimates'],
        },
        {
          name: 'Testing & Validation',
          description: 'Test changes and validate improvements',
          estimatedHours: Math.max(1, Math.round(hours * 0.2)),
          dependencies: ['Implementation'],
          risks: ['Testing may reveal additional issues requiring fixes'],
        },
      ],
    };
  }

  private getPriorityWeight(
    priority: AnalysisRecommendation['priority']
  ): number {
    const weights = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return weights[priority];
  }

  /**
   * Build analysis context based on options to customize recommendations
   */
  private async buildAnalysisContext(
    repository: RepositoryMetrics,
    options?: AnalysisOptions
  ): Promise<{
    focusAreas: string[];
    depth: 'shallow | moderate' | 'deep';
    performanceMode: 'fast | balanced' | 'thorough';
    customThresholds: Record<string, number>;
  }> {
    const defaultContext = {
      focusAreas: ['complexity', 'dependencies', 'maintainability'],
      depth: 'moderate' as const,
      performanceMode: 'balanced' as const,
      customThresholds: {
        cyclomaticComplexity: 50,
        maintainabilityIndex: 20,
        technicalDebt: 100,
      },
    };

    if (!options) return defaultContext;

    // Customize context based on analysis options
    const context = { ...defaultContext };

    if (options.analysisDepth) {
      context.depth = options.analysisDepth;
    }

    if (options.performanceMode) {
      context.performanceMode = options.performanceMode;
    }

    // Adjust focus areas based on enabled analysis types
    context.focusAreas = [];
    if (options.enableComplexityAnalysis) context.focusAreas.push('complexity');
    if (options.enableDependencyAnalysis)
      context.focusAreas.push('dependencies');
    if (options.enableGitAnalysis) context.focusAreas.push('git-history');
    if (options.enableDomainAnalysis)
      context.focusAreas.push('domain-structure');

    return context;
  }
}
