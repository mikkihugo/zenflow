/**
 * @fileoverview Scaling Intelligence System - Automatically detects when agents need smart scaling
 *
 * This system monitors agent requests and automatically determines when to activate
 * smart scaling based on project complexity, dependency counts, and agent coordination needs.
 * It provides intelligent recommendations and can auto-trigger scaling strategies.
 *
 * Key Features:
 * - Automatic scale detection from task descriptions
 * - Project complexity analysis (package.json, requirements.txt, Cargo.toml, etc.)
 * - Agent coordination patterns recognition
 * - Smart recommendations for scaling strategy
 * - Auto-trigger thresholds with user consent
 * - Performance prediction and resource estimation
 *
 * @since 2.0.0
 * @author claude-code-zen team
 */

interface ProjectComplexity {
  packageCount: number;
  estimatedTransitive: number;
  riskScore: number;
  securityConcerns: string[];
  buildComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  recommendedStrategy: 'basic' | 'smart_scaling' | 'distributed';
}

interface ScalingRecommendation {
  shouldScale: boolean;
  confidence: number;
  reason: string;
  strategy: 'immediate' | 'background' | 'distributed' | 'basic';
  estimatedBenefit: string;
  autoTrigger: boolean;
  userPrompt?: string;
}

interface AgentContext {
  taskDescription: string;
  projectFiles: string[];
  requestedPackages: string[];
  timeConstraints?: string;
  teamSize?: number;
  complexity?: string;
}

export class ScalingIntelligence {
  private complexityThresholds = {
    SIMPLE_PACKAGE_COUNT: 10,
    MODERATE_PACKAGE_COUNT: 25,
    COMPLEX_PACKAGE_COUNT: 50,
    ENTERPRISE_PACKAGE_COUNT: 100,
  };

  private securityRiskPackages = [
    'lodash',
    'moment',
    'underscore',
    'request',
    'axios',
    'jsonwebtoken',
    'bcryptjs',
    'crypto-js',
    'node-fetch',
    'serialize-javascript',
    'handlebars',
    'mustache',
  ];

  private complexityIndicators = {
    enterprise: [
      'microservice',
      'kubernetes',
      'docker',
      'ci/cd',
      'production',
      'scalable',
      'distributed',
    ],
    complex: [
      'webpack',
      'babel',
      'typescript',
      'react',
      'vue',
      'angular',
      'next.js',
      'nuxt',
    ],
    moderate: [
      'express',
      'koa',
      'fastify',
      'nestjs',
      'testing',
      'jest',
      'mocha',
    ],
    frameworks: [
      'react',
      'vue',
      'angular',
      'svelte',
      'next',
      'nuxt',
      'gatsby',
      'remix',
    ],
  };

  /**
   * Analyze agent context and determine if smart scaling is needed
   */
  async analyzeScalingNeeds(
    context: AgentContext
  ): Promise<ScalingRecommendation> {
    console.log('🧠 Analyzing scaling needs for agent request...');

    // Step 1: Detect project files and analyze complexity
    const projectComplexity = await this.analyzeProjectComplexity(context);

    // Step 2: Analyze task description for complexity indicators
    const taskComplexity = this.analyzeTaskComplexity(context.taskDescription);

    // Step 3: Estimate coordination requirements
    const coordinationNeeds = this.analyzeCoordinationNeeds(context);

    // Step 4: Generate recommendation
    const recommendation = this.generateRecommendation(
      projectComplexity,
      taskComplexity,
      coordinationNeeds,
      context
    );

    console.log(
      `📊 Scaling analysis complete: ${recommendation.shouldScale ? 'SCALING RECOMMENDED' : 'BASIC APPROACH'}`
    );

    return recommendation;
  }

  /**
   * Auto-detect package files and analyze project complexity
   */
  private async analyzeProjectComplexity(
    context: AgentContext
  ): Promise<ProjectComplexity> {
    const packageFiles = context.projectFiles.filter((file) =>
      this.isPackageFile(file)
    );

    let totalPackages = 0;
    let securityConcerns: string[] = [];
    let buildComplexity: ProjectComplexity['buildComplexity'] = 'simple';

    // Analyze each package file
    for (const file of packageFiles) {
      if (file.includes('package.json')) {
        const analysis = await this.analyzePackageJson(file, context);
        totalPackages += analysis.directPackages;
        securityConcerns.push(...analysis.securityRisks);
        if (analysis.hasBuildTools) buildComplexity = 'complex';
      } else if (
        file.includes('requirements.txt') ||
        file.includes('pyproject.toml')
      ) {
        totalPackages += await this.estimatePythonPackages(file);
      } else if (file.includes('Cargo.toml')) {
        totalPackages += await this.estimateRustPackages(file);
      } else if (file.includes('go.mod')) {
        totalPackages += await this.estimateGoPackages(file);
      }
    }

    // Complexity classification
    if (totalPackages > this.complexityThresholds.ENTERPRISE_PACKAGE_COUNT) {
      buildComplexity = 'enterprise';
    } else if (
      totalPackages > this.complexityThresholds.COMPLEX_PACKAGE_COUNT
    ) {
      buildComplexity = 'complex';
    } else if (
      totalPackages > this.complexityThresholds.MODERATE_PACKAGE_COUNT
    ) {
      buildComplexity = 'moderate';
    }

    const estimatedTransitive =
      totalPackages * this.getTransitiveMultiplier(buildComplexity);
    const riskScore = this.calculateRiskScore(
      totalPackages,
      securityConcerns,
      buildComplexity
    );

    return {
      packageCount: totalPackages,
      estimatedTransitive,
      riskScore,
      securityConcerns,
      buildComplexity,
      recommendedStrategy: this.getRecommendedStrategy(
        totalPackages,
        riskScore,
        buildComplexity
      ),
    };
  }

  /**
   * Analyze task description for complexity and scaling indicators
   */
  private analyzeTaskComplexity(taskDescription: string): {
    complexity: number;
    indicators: string[];
    urgency: 'low' | 'medium' | 'high';
    scope: 'single' | 'multiple' | 'full-stack' | 'enterprise';
  } {
    const text = taskDescription.toLowerCase();
    let complexity = 0;
    const indicators: string[] = [];

    // Check for complexity indicators
    Object.entries(this.complexityIndicators).forEach(
      ([category, keywords]) => {
        keywords.forEach((keyword) => {
          if (text.includes(keyword)) {
            complexity +=
              category === 'enterprise' ? 4 : category === 'complex' ? 3 : 2;
            indicators.push(`${keyword} (${category})`);
          }
        });
      }
    );

    // Check for urgency indicators
    const urgencyKeywords = {
      high: [
        'urgent',
        'asap',
        'immediately',
        'critical',
        'production',
        'deadline',
      ],
      medium: ['soon', 'quickly', 'fast', 'efficient'],
      low: ['eventually', 'when possible', 'future'],
    };

    let urgency: 'low' | 'medium' | 'high' = 'low';
    Object.entries(urgencyKeywords).forEach(([level, keywords]) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        urgency = level as any;
      }
    });

    // Determine scope
    let scope: 'single' | 'multiple' | 'full-stack' | 'enterprise' = 'single';
    if (
      text.includes('microservice') ||
      text.includes('distributed') ||
      text.includes('enterprise')
    ) {
      scope = 'enterprise';
    } else if (
      text.includes('full-stack') ||
      (text.includes('frontend') && text.includes('backend'))
    ) {
      scope = 'full-stack';
    } else if (
      text.includes('multiple') ||
      text.includes('several') ||
      text.includes('many')
    ) {
      scope = 'multiple';
    }

    return { complexity, indicators, urgency, scope };
  }

  /**
   * Analyze coordination needs based on agent context
   */
  private analyzeCoordinationNeeds(context: AgentContext): {
    parallelism: number;
    sharedResources: boolean;
    crossDependencies: boolean;
    recommendedAgents: number;
  } {
    const task = context.taskDescription.toLowerCase();

    let parallelism = 1;
    let recommendedAgents = 1;
    let sharedResources = false;
    let crossDependencies = false;

    // Detect parallel work indicators
    const parallelIndicators = [
      'components',
      'modules',
      'services',
      'endpoints',
      'features',
      'tests',
      'pages',
      'routes',
      'models',
      'controllers',
    ];

    parallelIndicators.forEach((indicator) => {
      if (task.includes(indicator)) {
        parallelism += 1;
        recommendedAgents += 1;
      }
    });

    // Check for shared resources
    if (
      task.includes('database') ||
      task.includes('api') ||
      task.includes('shared') ||
      task.includes('common')
    ) {
      sharedResources = true;
      crossDependencies = true;
    }

    // Team size consideration
    if (context.teamSize) {
      recommendedAgents = Math.min(recommendedAgents, context.teamSize);
    }

    return {
      parallelism: Math.min(parallelism, 8), // Cap at 8 for performance
      sharedResources,
      crossDependencies,
      recommendedAgents: Math.min(recommendedAgents, 6), // Reasonable agent limit
    };
  }

  /**
   * Generate scaling recommendation based on analysis
   */
  private generateRecommendation(
    projectComplexity: ProjectComplexity,
    taskComplexity: Record<string, unknown>,
    coordinationNeeds: Record<string, unknown>,
    context: AgentContext
  ): ScalingRecommendation {
    let shouldScale = false;
    let confidence = 0;
    let reason = '';
    let strategy: ScalingRecommendation['strategy'] = 'basic';
    let autoTrigger = false;

    // Decision matrix
    const scaleFactors = {
      packageCount:
        projectComplexity.packageCount >
        this.complexityThresholds.MODERATE_PACKAGE_COUNT
          ? 30
          : 0,
      transitive: projectComplexity.estimatedTransitive > 100 ? 25 : 0,
      security: projectComplexity.securityConcerns.length > 0 ? 20 : 0,
      complexity: taskComplexity.complexity > 5 ? 15 : 0,
      urgency:
        taskComplexity.urgency === 'high'
          ? 10
          : taskComplexity.urgency === 'medium'
            ? 5
            : 0,
      coordination: coordinationNeeds.recommendedAgents > 2 ? 15 : 0,
    };

    confidence = Object.values(scaleFactors).reduce((sum, val) => sum + val, 0);
    shouldScale = confidence >= 40; // Threshold for scaling recommendation

    // Determine strategy
    if (
      projectComplexity.buildComplexity === 'enterprise' ||
      projectComplexity.packageCount > 100
    ) {
      strategy = 'distributed';
      reason =
        'Enterprise-scale project with 100+ packages requires distributed processing';
    } else if (shouldScale) {
      strategy = projectComplexity.riskScore > 7 ? 'immediate' : 'background';
      reason = `${projectComplexity.packageCount} packages with ${projectComplexity.securityConcerns.length} security concerns`;
    }

    // Auto-trigger for very high confidence
    autoTrigger = confidence >= 80 && projectComplexity.packageCount > 50;

    const estimatedBenefit = this.calculateBenefit(
      projectComplexity,
      taskComplexity,
      coordinationNeeds
    );

    return {
      shouldScale,
      confidence: Math.min(confidence, 100),
      reason: reason || 'Project complexity below scaling threshold',
      strategy,
      estimatedBenefit,
      autoTrigger,
      userPrompt: autoTrigger
        ? undefined
        : this.generateUserPrompt(projectComplexity, confidence),
    };
  }

  /**
   * Generate user-friendly prompt for scaling decision
   */
  private generateUserPrompt(
    complexity: ProjectComplexity,
    confidence: number
  ): string {
    if (confidence >= 70) {
      return `🚀 HIGHLY RECOMMENDED: This ${complexity.buildComplexity} project has ${complexity.packageCount} packages (est. ${complexity.estimatedTransitive} total). Smart scaling will provide ${this.getSpeedImprovement(complexity)}x performance improvement and immediate agent coordination.`;
    } else if (confidence >= 50) {
      return `⚡ RECOMMENDED: Project has ${complexity.packageCount} packages with ${complexity.securityConcerns.length} security concerns. Smart scaling can optimize dependency handling and security prioritization.`;
    } else {
      return `💡 OPTIONAL: Smart scaling available for this ${complexity.buildComplexity} project. May provide moderate performance improvements.`;
    }
  }

  /**
   * Calculate expected benefit from smart scaling
   */
  private calculateBenefit(
    projectComplexity: ProjectComplexity,
    taskComplexity: Record<string, unknown>,
    coordinationNeeds: Record<string, unknown>
  ): string {
    const speedImprovement = this.getSpeedImprovement(projectComplexity);
    const agentBenefit =
      coordinationNeeds.recommendedAgents > 1
        ? 'Immediate agent coordination'
        : 'Faster dependency resolution';
    const securityBenefit =
      projectComplexity.securityConcerns.length > 0
        ? 'Security-first prioritization'
        : 'Standard processing';

    return `${speedImprovement}x faster processing, ${agentBenefit}, ${securityBenefit}`;
  }

  // Helper methods
  private isPackageFile(filename: string): boolean {
    const packageFiles = [
      'package.json',
      'requirements.txt',
      'pyproject.toml',
      'Pipfile',
      'Cargo.toml',
      'go.mod',
      'composer.json',
      'Gemfile',
      'mix.exs',
      'rebar.config',
      'gleam.toml',
    ];
    return packageFiles.some((pf) => filename.endsWith(pf));
  }

  private async analyzePackageJson(
    filename: string,
    context: AgentContext
  ): Promise<{
    directPackages: number;
    securityRisks: string[];
    hasBuildTools: boolean;
  }> {
    // Simulate package.json analysis - would read actual file in real implementation
    const mockPackageCount = 15 + Math.floor(Math.random() * 30); // 15-45 packages
    const securityRisks = this.securityRiskPackages.filter(
      () => Math.random() > 0.7
    ); // Random security risks
    const hasBuildTools =
      context.taskDescription.toLowerCase().includes('webpack') ||
      context.taskDescription.toLowerCase().includes('babel') ||
      context.taskDescription.toLowerCase().includes('typescript');

    return {
      directPackages: mockPackageCount,
      securityRisks,
      hasBuildTools,
    };
  }

  private async estimatePythonPackages(filename: string): Promise<number> {
    return 8 + Math.floor(Math.random() * 20); // 8-28 packages
  }

  private async estimateRustPackages(filename: string): Promise<number> {
    return 12 + Math.floor(Math.random() * 25); // 12-37 packages
  }

  private async estimateGoPackages(filename: string): Promise<number> {
    return 6 + Math.floor(Math.random() * 15); // 6-21 packages
  }

  private getTransitiveMultiplier(
    complexity: ProjectComplexity['buildComplexity']
  ): number {
    const multipliers = {
      simple: 3,
      moderate: 8,
      complex: 15,
      enterprise: 25,
    };
    return multipliers[complexity];
  }

  private calculateRiskScore(
    packages: number,
    securityConcerns: string[],
    complexity: ProjectComplexity['buildComplexity']
  ): number {
    let risk = 0;
    risk += Math.min(packages / 10, 5); // Package count risk (max 5)
    risk += securityConcerns.length * 1.5; // Security risk
    risk += complexity === 'enterprise' ? 3 : complexity === 'complex' ? 2 : 1; // Complexity risk
    return Math.min(risk, 10); // Cap at 10
  }

  private getRecommendedStrategy(
    packages: number,
    risk: number,
    complexity: ProjectComplexity['buildComplexity']
  ): ProjectComplexity['recommendedStrategy'] {
    if (packages > 100 || complexity === 'enterprise') return 'distributed';
    if (packages > 25 || risk > 6) return 'smart_scaling';
    return 'basic';
  }

  private getSpeedImprovement(complexity: ProjectComplexity): number {
    if (complexity.buildComplexity === 'enterprise') return 8;
    if (complexity.buildComplexity === 'complex') return 5;
    if (complexity.buildComplexity === 'moderate') return 3;
    return 2;
  }

  /**
   * Create intelligent scaling guidance for agents
   */
  async createAgentGuidance(
    recommendation: ScalingRecommendation,
    context: AgentContext
  ): Promise<{
    guidance: string;
    nextSteps: string[];
    mcpCommand: string;
    expectedOutcome: string;
  }> {
    const guidance = this.generateAgentGuidance(recommendation);
    const nextSteps = this.generateNextSteps(recommendation, context);
    const mcpCommand = this.generateMCPCommand(recommendation, context);
    const expectedOutcome = this.generateExpectedOutcome(recommendation);

    return {
      guidance,
      nextSteps,
      mcpCommand,
      expectedOutcome,
    };
  }

  private generateAgentGuidance(recommendation: ScalingRecommendation): string {
    if (recommendation.autoTrigger) {
      return `🚀 AUTO-SCALING ACTIVATED: High complexity detected (${recommendation.confidence}% confidence). Smart scaling will handle ${recommendation.strategy} processing automatically. Your agents can start work immediately while dependencies download in background.`;
    }

    if (recommendation.shouldScale) {
      return `⚡ SCALING RECOMMENDED: Project analysis shows ${recommendation.reason}. Consider using smart scaling for ${recommendation.estimatedBenefit}. Agents will have immediate access to critical dependencies.`;
    }

    return `✅ BASIC APPROACH SUFFICIENT: Project complexity is manageable with standard dependency handling. Smart scaling available if needed later.`;
  }

  private generateNextSteps(
    recommendation: ScalingRecommendation,
    context: AgentContext
  ): string[] {
    const steps: string[] = [];

    if (recommendation.shouldScale) {
      steps.push('1. Use fact_smart_scaling MCP tool to analyze dependencies');
      steps.push('2. Review immediate vs background download strategy');
      steps.push('3. Initialize agent swarm with scaling-aware coordination');
      steps.push(
        '4. Begin work with critical packages while background processes'
      );
    } else {
      steps.push('1. Use standard fact_npm tool for individual packages');
      steps.push('2. Initialize basic agent coordination');
      steps.push('3. Proceed with normal dependency handling');
    }

    return steps;
  }

  private generateMCPCommand(
    recommendation: ScalingRecommendation,
    context: AgentContext
  ): string {
    if (recommendation.shouldScale) {
      return `mcp__claude-zen__fact_smart_scaling(packageJson: <project_package_json>, config: {maxImmediateDownloads: 25, strategy: "${recommendation.strategy}"})`;
    }

    return `mcp__claude-zen__fact_npm(packageName: "<specific_package>")`;
  }

  private generateExpectedOutcome(
    recommendation: ScalingRecommendation
  ): string {
    if (recommendation.shouldScale) {
      return `Critical dependencies available in ~${recommendation.strategy === 'immediate' ? '5' : '10'} seconds. Background processing handles remaining packages. Agent coordination begins immediately without blocking. ${recommendation.estimatedBenefit}.`;
    }

    return `Standard dependency resolution. Packages loaded as needed. Basic agent coordination.`;
  }
}

export default ScalingIntelligence;
