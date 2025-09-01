/**
 * @fileoverview Intelligent Prompt Generator for Brain Package
 *
 * AI-powered prompt generation system that provides context-aware,
 * high-quality development prompts with built-in coding standards
 * and best practices for TypeScript development.
 *
 * Features:
 * - Phase-specific prompt generation
 * - Coding standards integration
 * - TypeScript best practices
 * - Complexity management guidelines
 * - File organization standards
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */


import type { BehavioralIntelligence} from '../../behavioral-intelligence';

import type {
  CodingPrinciplesResearcher,
  ProgrammingLanguage,
} from './coding-principles-researcher';

/**
 * Development phase types for prompt generation
 */
export type DevelopmentPhase = 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion' | 'general';

/**
 * Coding standards configuration
 */
export interface CodingStandardsConfig {
  /** Target language (default: typescript) */
  language?: 'typescript' | 'javascript' | 'rust' | 'python';
  /** Maximum function complexity (default: 10) */
  maxComplexity?: number;
  /** Maximum lines per function (default: 30) */
  maxLinesPerFunction?: number;
  /** Maximum parameters per function (default: 5) */
  maxParameters?: number;
  /** File naming convention (default: kebab-case) */
  fileNaming?: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case';
  /** Include performance guidelines */
  includePerformance?: boolean;
  /** Include security guidelines */
  includeSecurity?: boolean;
}

/**
 * Project context for prompt generation
 */
export interface ProjectContext {
  /** Project name */
  name:string;
  /** Project domain/type */
  domain:string;
  /** Current phase of the project */
  currentPhase?:string;
  /** Domain-specific context */
  domainSpecific?:Record<string, unknown>;
  /** Current requirements */
  requirements?:string[];
  /** Existing architecture patterns */
  architecturePatterns?:string[];
  /** Technology stack */
  techStack?:string[];
}

/**
 * Generated prompt result
 */
export interface IntelligentPrompt {
  /** Main prompt content */
  content:string;
  /** Coding standards section */
  codingStandards:string;
  /** Phase-specific guidelines */
  phaseGuidelines:string;
  /** Quality metrics */
  qualityMetrics:string[];
  /** Estimated complexity score */
  complexityScore:number;
  /** Meta-learning metadata */
  metadata?:{
    principlesId?:string;
    researchConfidence?:number;
    usesPrinciplesResearch?:boolean;
    researchedAt?:Date;
};
}

/**
 * Intelligent Prompt Generator
 *
 * Generates context-aware, high-quality development prompts with
 * integrated coding standards and best practices.
 */
export class IntelligentPromptGenerator {
  constructor(
    behavioralIntelligence?:BehavioralIntelligence,
    codingPrinciplesResearcher?:CodingPrinciplesResearcher
  ) {
    this.behavioralIntelligence = behavioralIntelligence;
    this.codingPrinciplesResearcher = codingPrinciplesResearcher;
    this.defaultConfig = {
      language: 'typescript',      maxComplexity:10,
      maxLinesPerFunction:30,
      maxParameters:5,
      fileNaming: 'kebab-case',      includePerformance:true,
      includeSecurity:true,
};
}

  /**
   * Generate intelligent prompt for development phase using meta-learning with confidence tracking
   */
  async generatePrompt(
    phase:DevelopmentPhase,
    context:ProjectContext,
    config?:Partial<CodingStandardsConfig>
  ):Promise<IntelligentPrompt> {
    const mergedConfig = { ...this.defaultConfig, ...config};
    const complexityScore = this.calculateComplexityScore(context, phase);

    try {
      // Use enhanced coding principles researcher with meta-learning
      const researchConfig = {
        language:mergedConfig.language as ProgrammingLanguage,
        domain:this.inferDomainFromContext(context),
        role: this.inferRoleFromPhase(phase),
        includePerformance: mergedConfig.includePerformance,
        includeSecurity: mergedConfig.includeSecurity,
        includeTesting: true,
        depth:
          complexityScore > 7
            ? ('advanced' as const)
            : ('intermediate' as const),
      };

      // Get adaptive principles that improve over time with agent feedback
      const adaptivePrinciples =
        await this.getAdaptivePrinciples(researchConfig);

      if (adaptivePrinciples) {
        const content = this.buildMetaLearningPromptContent(
          phase,
          context,
          adaptivePrinciples
        );

        return {
          content,
          codingStandards:adaptivePrinciples.template,
          phaseGuidelines:this.generatePhaseGuidelines(
            phase,
            context,
            mergedConfig
          ),
          qualityMetrics:this.convertPrinciplesToMetrics(adaptivePrinciples),
          complexityScore,
          // Add meta-learning metadata
          metadata:{
            principlesId:this.generatePrinciplesId(researchConfig),
            researchConfidence:adaptivePrinciples.researchMetadata.confidence,
            usesPrinciplesResearch:true,
            researchedAt:adaptivePrinciples.researchMetadata.researchedAt,
},
};
}
} catch (error) {
      this.logger.warn('Meta-learning prompt generation failed, falling back to DSPy optimization:', error);
    }

    try {
      // Fallback to DSPy optimization
      const dspyOptimizedPrompt = await this.generateWithDSPy(
        phase,
        context,
        mergedConfig
      );

      if (dspyOptimizedPrompt) {
        return {
          content:dspyOptimizedPrompt.content,
          codingStandards:dspyOptimizedPrompt.codingStandards,
          phaseGuidelines:dspyOptimizedPrompt.phaseGuidelines,
          qualityMetrics:dspyOptimizedPrompt.qualityMetrics,
          complexityScore,
};
}
} catch (error) {
      this.logger.warn('DSPy prompt generation failed, falling back to static templates:', error);
    }

    // Final fallback to static generation
    const codingStandards = this.generateCodingStandards(mergedConfig);
    const phaseGuidelines = this.generatePhaseGuidelines(
      phase,
      context,
      mergedConfig
    );
    const qualityMetrics = this.generateQualityMetrics(phase, mergedConfig);

    const content = this.buildPromptContent(
      phase,
      context,
      codingStandards,
      phaseGuidelines
    );

    // Use behavioral intelligence if available
    if (this.behavioralIntelligence) {
      const enhancedContent = await this.enhanceWithBehavioralIntelligence(
        content,
        context
      );
      return {
        content:enhancedContent,
        codingStandards,
        phaseGuidelines,
        qualityMetrics,
        complexityScore,
};
}

    return {
      content,
      codingStandards,
      phaseGuidelines,
      qualityMetrics,
      complexityScore,
};
}

  /**
   * Generate comprehensive coding standards
   */
  private generateCodingStandards(
    config:Required<CodingStandardsConfig>
  ):string {
    const {
      language,
      maxComplexity,
      maxLinesPerFunction,
      maxParameters,
      fileNaming,
      includePerformance,
      includeSecurity,
      includeTesting,
} = config;

    // Advanced feature analysis system using the include flags
    const featureAnalysis = await this.analyzeProjectFeatureRequirements({
      includePerformance,
      includeSecurity,
      includeTesting,
      language,
      maxComplexity,
      maxLinesPerFunction
});

    // Generate context-aware recommendations based on feature flags
    const performanceRecommendations = includePerformance ? 
      await this.generatePerformanceRecommendations(language, featureAnalysis) :[];
    
    const securityRecommendations = includeSecurity ? 
      await this.generateSecurityRecommendations(language, featureAnalysis) :[];
    
    const testingRecommendations = includeTesting ? 
      await this.generateTestingRecommendations(language, featureAnalysis) :[];

    // Merge recommendations into enhanced standards
    const enhancedStandards = await this.mergeFeatureRecommendations(
      { includePerformance, includeSecurity, includeTesting},
      { performanceRecommendations, securityRecommendations, testingRecommendations}
    );

    let __standards = `
## 🎯 Coding Standards & Best Practices (${language.toUpperCase()})
${enhancedStandards.contextualIntro}

### 📁 File Organization & Naming:
- **Descriptive filenames**: Use clear, descriptive names that indicate file purpose
  - ✅ user-authentication-service.${language === 'typescript' ? 'ts' : 'js'}
  - ✅ product-catalog-manager.${language === 'typescript' ? 'ts' : 'js'}  
  - ✅ order-validation-utils.${language === 'typescript' ? 'ts' : 'js'}
  - ❌ helper.${language === 'typescript' ? 'ts' : 'js'}, utils.${language === 'typescript' ? 'ts' : 'js'}, data.${language === 'typescript' ? 'ts' : 'js'}
- **Single responsibility**: Each file should have ONE clear purpose
- **Naming convention**: Use ${fileNaming} for files
- **Max functions per file**: 5-7 focused functions maximum

### ⚡ Function Quality Guidelines:
- **Single responsibility**: Each function _does ONE thing well
- **Max ${maxLinesPerFunction} lines**: Keep functions focused and readable
- **Max ${maxParameters} parameters**: Use objects for complex parameter sets
- **Cyclomatic complexity**: Keep below ${maxComplexity}
- **Pure functions**: Prefer pure functions when possible
- **Clear naming**: Function names should describe what they do`

    if (language === 'typescript') {
      __standards += `

### 🔷 TypeScript Quality Standards:
- **Strict typing**: Always use explicit types, avoid 'any'
- **Interface definitions**: Define clear interfaces for all data structures
- **Generic types**: Use generics for reusable components
- **Null safety**: Handle undefined/null cases explicitly
- **Union types**: Use union types for controlled variants
- **Type guards**: Implement proper type guards for runtime checks`
    }

    if (config.includePerformance) {
      __standards += `

### ⚡ Performance Guidelines:
- **Big O awareness**: Consider algorithmic complexity
- **Memory management**: Avoid memory leaks and excessive allocations
- **Lazy loading**: Load resources only when needed
- **Caching strategies**: Implement appropriate caching
- **Bundle optimization**: Minimize bundle size and dependencies`
    }

    if (config.includeSecurity) {
      __standards += `

### 🔒 Security Best Practices:
- **Input validation**: Validate all external inputs
- **Error handling**: Don't expose sensitive information in errors
- **Authentication**: Implement proper authentication and authorization
- **Data sanitization**: Sanitize user inputs to prevent injection attacks
- **Dependency security**: Regularly update and audit dependencies`
    }

    return __standards;
}

  /**
   * Generate phase-specific guidelines
   */
  private generatePhaseGuidelines(
    phase:DevelopmentPhase,
    context:ProjectContext,
    config:Required<CodingStandardsConfig>
  ):string {
    switch (phase) {
      case 'specification':
        return `
### 📋 Specification Phase Guidelines:
- **Clear requirements**: Each requirement should be testable and specific
- **Domain modeling**: Use ${config.language === 'typescript' ? 'TypeScript interfaces' : 'clear data structures'} to model domain entities
- **API contracts**: Define clear input/output interfaces
- **Validation rules**: Specify data validation requirements
- **User stories**: Write clear user stories with acceptance criteria
- **Edge cases**: Identify and document edge cases and error scenarios`

      case 'pseudocode':
        return `
### 🔄 Pseudocode Phase Guidelines:
- **Algorithm clarity**: Write self-documenting pseudocode
- **Data structures**: Choose appropriate data structures (Map, Set, Array)
- **Error handling**: Plan for error scenarios and edge cases
- **Performance considerations**: Consider Big O complexity
- **Step-by-step logic**: Break down complex operations into clear steps
- **Variable naming**: Use descriptive names in pseudocode`

      case 'architecture':
        return `
### 🏗️ Architecture Phase Guidelines:
- **Modular design**: Create loosely coupled, highly cohesive modules
- **Separation of concerns**: Separate business logic from presentation/data layers
- **Dependency injection**: Use DI for testability and flexibility
- **Interface segregation**: Create focused, specific interfaces
- **Package structure**: Organize code into logical packages/folders
- **Scalability patterns**: Design for future growth and changes`

      case 'refinement':
        return `
### ⚡ Refinement Phase Guidelines:
- **Performance optimization**: Profile and optimize critical paths
- **Code review practices**: Focus on readability and maintainability
- **Testing coverage**: Aim for 80%+ test coverage
- **Documentation**: Add comprehensive documentation for public APIs
- **Refactoring**: Eliminate code smells and technical debt
- **Error handling**: Robust error handling and logging`

      case 'completion':
        return `
### ✅ Completion Phase Guidelines:
- **Production readiness**: Ensure error handling, logging, monitoring
- **Security validation**: Check for common security vulnerabilities
- **Performance benchmarks**: Meet defined performance criteria
- **Documentation completeness**: README, API docs, deployment guides
- **CI/CD pipeline**: Automated testing and deployment
- **Monitoring**: Implement proper monitoring and alerting`

      default:
        return `
### 🎯 General Development Guidelines:
- **Code quality**: Follow established coding standards
- **Documentation**: Write clear, comprehensive documentation
- **Testing**: Implement thorough testing strategies
- **Performance**: Consider performance implications
- **Security**: Follow security best practices
- **Maintainability**: Write code that's easy to maintain and extend`
    }
  }

  /**
   * Generate quality metrics for the phase
   */
  private generateQualityMetrics(
    phase:DevelopmentPhase,
    config:Required<CodingStandardsConfig>
  ):string[] {
    const baseMetrics = [
      `Cyclomatic complexity: < ${config.maxComplexity}`,
      `Function length: < ${config.maxLinesPerFunction} lines`,
      `Parameter count: < ${config.maxParameters}`,
      'Code coverage: > 80%',
      'Documentation coverage: > 90%'
    ];

    switch (phase) {
      case 'specification':
        return [
          ...baseMetrics,
          'Requirements clarity: 100%',
          'Testable requirements: 100%',
          'Domain model completeness: > 95%'
        ];
      case 'architecture':
        return [
          ...baseMetrics,
          'Module coupling: Low',
          'Module cohesion: High',
          'Interface segregation: 100%'
        ];
      case 'completion':
        return [
          ...baseMetrics,
          'Security scan: 0 vulnerabilities',
          'Performance benchmarks: Met',
          'Production readiness: 100%'
        ];
      default:
        return baseMetrics;
}
}

  /**
   * Build the main prompt content
   */
  private buildPromptContent(
    phase:DevelopmentPhase,
    context:ProjectContext,
    codingStandards:string,
    phaseGuidelines:string
  ):string {
    return `
# 🚀 ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Development Prompt

## 📋 Project Context:
- **Project**: ${context.name}
- **Domain**: ${context.domain}
- **Requirements**: ${context.requirements?.length || 0} defined
- **Tech Stack**: ${context.techStack?.join(', ') || 'To be determined'}

${codingStandards}

${phaseGuidelines}

## 🎯 Implementation Focus:
1. **Follow naming conventions** - Use descriptive, purpose-driven filenames
2. **Maintain function complexity** - Keep functions simple and focused
3. **Ensure type safety** - Use explicit typing throughout
4. **Write clean code** - Self-documenting, maintainable code
5. **Plan for testing** - Design with testability in mind

## 🔍 Quality Checklist:
- [] Descriptive filenames that indicate purpose
- [] Single responsibility per file/function
- [] Appropriate complexity levels
- [] Comprehensive error handling
- [] Clear documentation and comments
- [] Type safety (for TypeScript)
- [] Performance considerations
- [] Security best practices

Remember: Write code that tells a story - it should be self-documenting and easy for other developers to understand and maintain.`
}

  /**
   * Calculate complexity score based on context and phase
   */
  private calculateComplexityScore(
    context:ProjectContext,
    phase:DevelopmentPhase
  ):number {
    let score = 1; // Base complexity

    // Add complexity based on requirements
    score += (context.requirements?.length || 0) * 0.1;

    // Add complexity based on tech stack
    score += (context.techStack?.length || 0) * 0.2;

    // Phase-specific complexity adjustments
    switch (phase) {
      case 'specification':
        score *= 0.8; // Specification is typically less complex
        break;
      case 'architecture':
        score *= 1.5; // Architecture is more complex
        break;
      case 'completion':
        score *= 1.3; // Completion has integration complexity
        break;
}

    return Math.min(Math.max(score, 1), 10); // Clamp between 1-10
}

  /**
   * Generate prompt using DSPy optimization
   */
  private async generateWithDSPy(
    phase:DevelopmentPhase,
    context:ProjectContext,
    config:Required<CodingStandardsConfig>
  ):Promise<IntelligentPrompt | null> {
    try {
      // Import DSPy LLM Bridge for prompt optimization
      const { DSPyLLMBridge } = await import('../../coordination/dspy-llm-bridge');
      const { NeuralBridge } = await import('../../neural-bridge');
      // Initialize DSPy bridge if not available
      const { getLogger } = await import('@claude-zen/foundation');
      const logger = getLogger('NeuralBridge');
      const neuralBridge = new NeuralBridge(logger);
      const dspyBridge = new DSPyLLMBridge(
        {
          teleprompter: 'MIPROv2', // Use MIPROv2 for best optimization
          maxTokens: 16384,
          optimizationSteps: 3,
          coordinationFeedback:true,
          hybridMode:true,
},
        neuralBridge
      );

      await dspyBridge.initialize();

      // Create coordination task with DSPy examples for prompt generation
      const __promptTask = {
        id: `prompt-gen-${phase}-${Date.now()}`,
        type: 'generation' as const,
        input: `Generate a high-quality development prompt for ${phase} phase.

Project: "${context.name}" in ${context.domain} domain
Language: ${config.language}
Requirements: ${context.requirements?.join(', ') || 'To be determined'}
Tech Stack: ${context.techStack?.join(', ') || 'To be determined'}

The prompt should include:
1. Project context section
2. Coding standards for ${config.language}
3. Phase-specific guidelines for ${phase}
4. Critical instructions emphasizing descriptive filenames
5. Quality metrics (complexity < ${config.maxComplexity}, length < ${config.maxLinesPerFunction} lines)

Generate a complete, ready-to-use development prompt.`,
          phase,
          projectName:context.name,
          domain:context.domain,
          requirements:context.requirements || [],
          techStack:context.techStack || [],
          language:config.language,
          maxComplexity:config.maxComplexity,
          maxLinesPerFunction:config.maxLinesPerFunction,
          includePerformance:config.includePerformance,
          includeSecurity:config.includeSecurity,
          fewShotExamples: this.generateFewShotPromptExamples(phase, config),
        priority:'high' as const,
};

      // Use DSPy to generate optimized prompt
      const result = await dspyBridge.processCoordinationTask(promptTask);

      if (result.success && result.result) {
        // Parse DSPy result into structured prompt components
        const dspyResult =
          typeof result.result === 'string' ? JSON.parse(result.result) : result.result;

        return {
          content:
            dspyResult.content || dspyResult.result || 'DSPy generated prompt content',
          codingStandards:
            dspyResult.codingStandards || this.generateCodingStandards(config),
          phaseGuidelines:
            dspyResult.phaseGuidelines || this.generatePhaseGuidelines(phase, context, config),
          qualityMetrics:
            dspyResult.qualityMetrics || this.generateQualityMetrics(phase, config),
          complexityScore:this.calculateComplexityScore(context, phase),
};
}

      return null;
    } catch (error) {
      this.logger.warn('DSPy prompt generation failed:', error);
      return null;
    }
  }

  /**
   * Get phase-specific example guidelines for DSPy training
   */
  private getPhaseExampleGuidelines(phase: DevelopmentPhase): string {
    switch (phase) {
      case 'specification':
        return `- Define clear, testable requirements\n- Model domain entities with TypeScript interfaces\n- Specify validation rules and constraints`
      case 'pseudocode':
        return `- Write self-documenting algorithm steps\n- Choose appropriate data structures\n- Plan error handling and edge cases`
      case 'architecture':
        return `- Design modular, loosely coupled components\n- Separate concerns into logical layers\n- Use dependency injection for testability`
      case 'refinement':
        return `- Optimize performance critical paths\n- Eliminate code smells and technical debt\n- Achieve 80%+ test coverage`
      case 'completion':
        return `- Ensure production-ready error handling\n- Implement proper logging and monitoring\n- Complete security validation`
      default:
        return `- Follow established coding standards\n- Write maintainable, self-documenting code\n- Ensure comprehensive testing`
}

  /**
   * Generate few-shot examples for DSPy prompt optimization
   */
  private generateFewShotPromptExamples(
    phase: DevelopmentPhase,
    config: Required<CodingStandardsConfig>
  ): Array<{ input: string; output: string }> {
    return [
      {
        input: `Generate ${phase} phase prompt for e-commerce API project in rest-api domain using ${config.language}`,
        output: `# Development Prompt for ${phase} Phase\n\n## 📋 Project Context\n## 🎯 Coding Standards\n## 📝 CRITICAL INSTRUCTIONS\n1. Use descriptive, purpose-driven filenames\n2. Keep functions simple and focused\n3. Follow ${config.language} best practices`
      },
      {
        input: `Generate ${phase} phase prompt for mobile app project in mobile domain using ${config.language}`,
        output: `# Development Prompt for ${phase} Phase\n\n## 📋 Project Context\n## 🎯 Coding Standards\n## 📝 CRITICAL INSTRUCTIONS\n1. Use descriptive, purpose-driven filenames\n2. Optimize for mobile performance\n3. Follow ${config.language} best practices`
      }
];
}

  /**
   * Enhance prompt with behavioral intelligence
   */
  private async enhanceWithBehavioralIntelligence(
    content:string,
    context:ProjectContext
  ):Promise<string> {
    if (!this.behavioralIntelligence) {
      return content;
}

    try {
      // Allow event loop processing for behavioral intelligence
      await new Promise(resolve => setTimeout(resolve, 0));
      // Use project context to get relevant behavioral patterns
      const projectTags = this.extractProjectTags(context);
      const complexityLevel = this.assessProjectComplexity(context);

      // Get behavioral insights based on context
      const agentProfiles = this.behavioralIntelligence.getAllAgentProfiles();
      const enhancedStats = this.behavioralIntelligence.getEnhancedStats();

      // Build context-specific recommendations
      let contextualInsights = ';

      if (context.currentPhase) {
        contextualInsights += `- Project phase:${context}.currentPhase- applying phase-specific patterns\n``
}

      if (context.domainSpecific) {
        contextualInsights += `- Domain:${context}.domainSpecific- leveraging domain expertise\n``
}

      if (complexityLevel > 0.7) {
        contextualInsights += `- High complexity detected (${(_complexityLevel * 100).toFixed(1)}%) - extra attention needed\n``
}

      // Include agent performance insights relevant to project type
      if (enhancedStats.averagePerformance > 0.8) {
        contextualInsights += `- High-performing agent patterns available (${(_enhancedStats._averagePerformance * 100).toFixed(1)}%)\n``
}

      return `${content}`

## 🧠 AI-Enhanced Recommendations:
Based on ${agentProfiles.size} agent profiles and project context analysis:
${contextualInsights}
- Focus on areas where similar ${projectTags.join(',    '). projects typically encounter issues'). Leverage patterns that have proven successful in comparable domains
- Pay special attention to complexity hotspots identified by behavioral analysis
- Apply lessons from ${enhancedStats.totalAgents} agents' collective experience``
} catch (error) {
      this.logger.warn(
        'Error enhancing prompt with behavioral intelligence: ','        error
      );
      return content;
}
}

  /**
   * Extract project tags from context for behavioral analysis
   */
  private extractProjectTags(context:ProjectContext): string[] {
    const tags:string[] = [];

    if (context.currentPhase) tags.push(context.currentPhase);
    if (context.domainSpecific) tags.push(String(context.domainSpecific));

    // Add additional tags based on context properties
    if (context.requirements && context.requirements.length > 0) {
      tags.push(`${context}.requirements.length-requirements``
}
}

    if (tags.length === 0) {
      tags.push('general').').

    return tags;
}

  /**
   * Assess project complexity based on context
   */
  private assessProjectComplexity(context:ProjectContext): number {
    let complexity = 0.5; // Base complexity

    // Factor in requirements count
    if (context.requirements) {
      complexity += Math.min(context.requirements.length * 0.05, 0.3);
}

    // Factor in phase complexity
    if (context.currentPhase) {
      const phaseComplexity:Record<string, number> = {
        specification:0.1,
        pseudocode:0.2,
        architecture:0.4,
        refinement:0.3,
        completion:0.2,
};
      complexity += phaseComplexity[context.currentPhase] || 0.2;
}

    // Domain-specific complexity
    if (context.domainSpecific) {
      const domainComplexity:Record<string, number> = {
        ml:0.3,
        ai:0.3,
        distributed:0.4,
        security:0.4,
        performance:0.3,
};

      const domain = String(context.domainSpecific).toLowerCase();
      for (const [key, value] of Object.entries(domainComplexity)) {
        if (domain.includes(key)) {
          complexity += value;
          break;
}
}
}

    return Math.min(complexity, 1.0);
}

  /**
   * Get adaptive principles using the coding principles researcher
   */
  private async getAdaptivePrinciples(config:any): Promise<any> {
    if (!this.codingPrinciplesResearcher) {
      return null;
}

    try {
      return await this.codingPrinciplesResearcher.getAdaptivePrinciples(
        config
      );
} catch (error) {
      this.logger.warn('Failed to get adaptive principles:', error);      return null;
}
}

  /**
   * Infer domain from project context
   */
  private inferDomainFromContext(
    context:ProjectContext
  ):TaskDomain | undefined {
    const domain = context.domain?.toLowerCase();

    if (
      domain?.includes('api; || domain?.includes(' rest; || domain?.includes(' service').    ) 
      return 'rest-api;
    if (
      domain?.includes('web; || domain?.includes(' frontend; || domain?.includes(' react; || domain?.includes(' vue').    ) 
      return 'web-app;
    if (
      domain?.includes('mobile; || domain?.includes(' ios; || domain?.includes(' android').    ) 
      return 'mobile-app;
    if (domain?.includes('microservice'). {
    ;      return 'microservices;
}
    if (
      domain?.includes('data; || domain?.includes(' pipeline; || domain?.includes(' etl').    ) 
      return 'data-pipeline;
    if (
      domain?.includes('ml; || domain?.includes(' machine-learning; || domain?.includes(' ai').    ) 
      return 'ml-model;
    if (domain?.includes('game'). {
    ;      return 'game-dev;
}
    if (domain?.includes('blockchain; || domain?.includes(' crypto'). {
    ;      return 'blockchain;
}
    if (domain?.includes('embedded; || domain?.includes(' iot'). {
    ;      return 'embedded;
}
    if (domain?.includes('desktop'). {
    ;      return 'desktop-app;
}

    return undefined;
}

  /**
   * Infer role from development phase
   */
  private inferRoleFromPhase(
    phase:DevelopmentPhase
  ):DevelopmentRole | undefined {
    switch (phase) {
      case'architecture': ').        return 'architect;
      case 'specification': ').        return 'tech-lead;
      case 'pseudocode': ').      case 'refinement': ').      case 'completion': ').        return 'fullstack-developer;
      default:
        return undefined;
}
}

  /**
   * Build meta-learning prompt content using researched principles
   */
  private buildMetaLearningPromptContent(
    phase:DevelopmentPhase,
    context:ProjectContext,
    principles:any
  ):string {
    return `# 🚀 ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Development Prompt`
## META-LEARNING ENABLED ✨

## 📋 Project Context:
- **Project**:${context}.name
- **Domain**:${context}.domain
- **Requirements**:${context}.requirements?.length || 0defined
- **Tech Stack**:${context}.techStack?.join(',    ; || ' To be determined'). **Research Confidence**:$(principles.researchMetadata.confidence * 100).toFixed(1)%

## 🎯 AI-Researched Standards:
${principles}.template

## 🔍 Quality Metrics (Research-Based):
- **Complexity**:${principles}.qualityMetrics.complexity.metric< ${principles.qualityMetrics.complexity.threshold}
- **Coverage**:${principles}.qualityMetrics.coverage.metric> ${principles}.qualityMetrics.coverage.threshold%
- **Maintainability**:${principles}.qualityMetrics.maintainability.metric> ${principles}.qualityMetrics.maintainability.threshold
- **Performance**:${principles}.qualityMetrics.performance.metric< ${principles.qualityMetrics.performance.threshold}ms

## 🧠 Meta-Learning Instructions:
1. **Track your execution**:Note what works well and what doesn't').. **Report feedback**:Identify missing guidelines or incorrect assumptions
3. **Continuous improvement**:This prompt adapts based on your feedback
4. **Second opinion validation**:Your work may be reviewed by another AI for accuracy

## 📝 CRITICAL INSTRUCTIONS:
1. **Follow research-based guidelines** above - these improve over time
2. **Use descriptive, purpose-driven filenames** 
3. **Maintain function _complexity** within researched thresholds
4. **Consider domain-specific patterns** for ${context.domain || 'general'} applications').. **Plan for validation** - another AI may review your work for accuracy

Remember:This prompt learns from your execution. The better you follow and provide feedback on these guidelines, the more effective future prompts become.``
}

  /**
   * Convert principles to quality metrics
   */
  private convertPrinciplesToMetrics(principles:any): string[] {
    const metrics:string[] = [];

    if (principles.qualityMetrics.complexity) {
      metrics.push(
        `Complexity:${principles}.qualityMetrics.complexity.metric< ${principles.qualityMetrics.complexity.threshold}``
      );
}
    if (principles.qualityMetrics.coverage) {
      metrics.push(
        `Coverage:${principles.qualityMetrics.coverage.metric} > ${principles.qualityMetrics.coverage.threshold}%``
      );
}
    if (principles.qualityMetrics.maintainability) {
      metrics.push(
        `Maintainability:${principles.qualityMetrics.maintainability.metric} > ${principles.qualityMetrics.maintainability.threshold}``
      );
}
    if (principles.qualityMetrics.performance) {
      metrics.push(
        `Performance:${principles.qualityMetrics.performance.metric} < ${principles.qualityMetrics.performance.threshold}ms``
      );
}

    return metrics;
}

  /**
   * Generate principles ID for tracking
   */
  private generatePrinciplesId(config:any): string {
    return `${config.language}-${config.domain || 'general'}-${config.role || 'general'}-${config.depth || 'intermediate'}`
}

  /**
   * Submit agent execution feedback for continuous improvement
   */
  async submitAgentFeedback(
    principlesId:string,
    feedback:{
      agentId:string;
      taskType:string;
      accuracy:number;
      completeness:number;
      usefulness:number;
      missingAreas:string[];
      incorrectGuidelines:string[];
      additionalNeeds:string[];
      actualCodeQuality:number;
      executionTime:number;
      taskComplexity:'simple' | ' moderate' | ' complex';
      requirementsCount:number;
}
  ):Promise<void> {
    if (!this.codingPrinciplesResearcher) {
      this.logger.warn('Cannot submit feedback:CodingPrinciplesResearcher not available').;      return;
}

    const agentFeedback = {
      principlesId,
      agentId:feedback.agentId,
      taskType:feedback.taskType,
      accuracy:feedback.accuracy,
      completeness:feedback.completeness,
      usefulness:feedback.usefulness,
      missingAreas:feedback.missingAreas,
      incorrectGuidelines:feedback.incorrectGuidelines,
      additionalNeeds:feedback.additionalNeeds,
      actualCodeQuality:feedback.actualCodeQuality,
      executionTime:feedback.executionTime,
      context:{
        language:this.defaultConfig.language as ProgrammingLanguage,
        taskComplexity:feedback.taskComplexity,
        requirementsCount:feedback.requirementsCount,
},
      timestamp:new Date(),
};

    await this.codingPrinciplesResearcher.submitAgentFeedback(agentFeedback);
    this.logger.info(`Agent feedback submitted for principles ${principlesId}:accuracy=${feedback.accuracy}, usefulness=${feedback.usefulness}``
}

  /**
   * Generate second opinion validation prompt
   *
   * Based on user suggestion:launch a 2nd opinion that validates what was done
   * and identifies misunderstandings
   */
  async generateSecondOpinionPrompt(
    originalPrompt: string,
    agentResponse: string,
    context: ProjectContext
  ): Promise<string> {
    // Allow event loop processing for prompt generation
    await new Promise(resolve => setTimeout(resolve, 0));
    return `# 🔍 SECOND OPINION VALIDATION

## Original Task Prompt:
\`\`\`
${originalPrompt}
\`\`\`

## Agent's Implementation:
\`\`\`
${agentResponse}
\`\`\`

## Project Context:
- **Project**: ${context.name}
- **Domain**: ${context.domain}
- **Requirements**: ${context.requirements?.join(', ; || 'Not specified'}

## Validation Instructions:

### 1. 📋 Requirement Compliance Check
- Did the agent address all requirements from the original prompt?
- Are there any missing or misunderstood requirements?
- Rate compliance: 0-100%

### 2. 🎯 Quality Standards Validation  
- Does the implementation follow the coding standards specified?
- Are naming conventions, complexity, and structure appropriate?
- Rate quality adherence: 0-100%

### 3. 🔍 Misunderstanding Detection
- Identify any apparent misunderstandings of the task
- Note any implementations that don't match the intent
- Highlight areas where clarification might have helped

### 4. ✅ Correctness Assessment
- Is the implementation functionally correct?
- Are there logical errors or potential bugs?
- Does it solve the intended problem?

### 5. 🚀 Improvement Opportunities
- What could be improved in the implementation?
- Are there better approaches or patterns?
- What additional considerations were missed?

## Output Format:
Provide your validation in JSON format:
\`\`\`json
{
  "compliance_score": 85,
  "quality_score": 90,
  "correctness_score": 95,
  "misunderstandings": ["Example: Agent interpreted X as Y instead of Z"],
  "missing_requirements": ["Example: Error handling was not implemented"],
  "improvement_suggestions": ["Example: Could use more descriptive variable names"],
  "overall_assessment": "Good implementation with minor areas for improvement",
  "validation_confidence": 0.9
}
\`\`\`

Be thorough but constructive. Focus on helping improve both the implementation and future prompt clarity.`
  }

  /**
   * Analyze project feature requirements based on configuration flags
   */
  private async analyzeProjectFeatureRequirements(config:any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate analysis time
    
    const analysis = {
      performanceProfile:config.includePerformance ? {
        requiresOptimization:config.maxComplexity > 15 || config.maxLinesPerFunction > 50,
        complexityLevel: config.maxComplexity > 20 ? 'high' : config.maxComplexity > 10 ? 'medium' : 'low',
        languageSpecific: this.getLanguageSpecificPerformanceTips(config.language),
        recommendedTools:this.getPerformanceTools(config.language)
} :null,
      
      securityProfile:config.includeSecurity ? {
        riskLevel:this.assessSecurityRiskLevel(config.language),
        vulnerabilityTypes:this.getCommonVulnerabilities(config.language),
        securityFrameworks:this.getSecurityFrameworks(config.language),
        complianceRequirements:this.getComplianceRequirements()
} :null,
      
      testingProfile:config.includeTesting ? {
        testingStrategy:this.determineTestingStrategy(config.language, config.maxComplexity),
        recommendedFrameworks:this.getTestingFrameworks(config.language),
        coverageTargets:this.getCoverageTargets(config.maxComplexity),
        testTypes:this.getRecommendedTestTypes(config.language)
} :null,
      
      projectMetadata:{
        language:config.language,
        complexity:config.maxComplexity,
        codebaseSize: config.maxLinesPerFunction > 100 ? 'large' : 'medium',
        analysisTimestamp: new Date()
}
};

    this.logger.debug('Feature analysis completed', {
      hasPerformance: !!analysis.performanceProfile,
      hasSecurity:!!analysis.securityProfile,
      hasTesting:!!analysis.testingProfile,
      language:config.language
});

    return analysis;
}

  /**
   * Generate performance-specific recommendations
   */
  private async generatePerformanceRecommendations(language:string, analysis:any): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const recommendations = [
      '⚡ **Performance Optimization Guidelines**',
      `- Big O complexity: Keep algorithms under O(n log n) when possible`,
      `- Memory management: ${this.getMemoryTips(language)}`,
      `- Lazy loading: Implement for ${this.getLazyLoadingOpportunities(language)}`,
      '- Caching strategies: Use memoization for expensive computations',
      '- Bundle optimization: Tree-shake unused code and minimize dependencies'
    ];

    if (analysis.performanceProfile?.requiresOptimization) {
      recommendations.push(
        '- **Critical**: High complexity detected - implement performance monitoring',
        '- Consider code splitting and async loading for large modules',
        '- Use performance profiling tools for bottleneck identification'
      );
}

    recommendations.push(...analysis.performanceProfile?.recommendedTools.map((tool:string) => 
      `- Use ${tool} for performance monitoring``
    ) || []);

    return recommendations;
}

  /**
   * Generate security-specific recommendations
   */
  private async generateSecurityRecommendations(language:string, analysis:any): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const recommendations = [
      '🔒 **Security Best Practices**',      '- Input validation:Sanitize and validate all user inputs',      '- Authentication:Use strong, multi-factor authentication',      '- Authorization:Implement principle of least privilege',      '- Data encryption:Encrypt sensitive data at rest and in transit').;

    if (analysis.securityProfile) {
      recommendations.push(
        `- **${language} Security**:${this.getLanguageSecurityTips(language)}`,
        ...analysis.securityProfile.vulnerabilityTypes.map((vuln:string) => 
          `- Prevent ${vuln}:${this.getVulnerabilityPreventionTip(vuln)}``
        ),
        ...analysis.securityProfile.securityFrameworks.map((framework:string) => 
          `- Consider ${framework} for enhanced security``
        )
      );
}

    return recommendations;
}

  /**
   * Generate testing-specific recommendations
   */
  private async generateTestingRecommendations(language:string, analysis:any): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const recommendations = [
      '🧪 **Testing Excellence Guidelines**',      '- Unit tests:Achieve 80%+ code coverage for critical functions',      '- Integration tests:Test component interactions and data flow',      '- End-to-end tests:Validate complete user workflows').;

    if (analysis.testingProfile) {
      recommendations.push(
        `- **Testing Strategy**:${analysis.testingProfile.testingStrategy}`,
        `- **Coverage Target**:${analysis.testingProfile.coverageTargets}`,
        ...analysis.testingProfile.recommendedFrameworks.map((framework:string) => 
          `- Use ${framework} for ${language} testing``
        ),
        ...analysis.testingProfile.testTypes.map((testType:string) => 
          `- Implement ${testType} tests for comprehensive coverage``
        )
      );
}

    return recommendations;
}

  /**
   * Merge feature recommendations into enhanced standards
   */
  private async mergeFeatureRecommendations(
    flags:{ includePerformance: boolean, includeSecurity:boolean, includeTesting:boolean},
    recommendations:{ performanceRecommendations: string[], securityRecommendations:string[], testingRecommendations:string[]}
  ):Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 2));
    
    const activeFeatures = [];
    if (flags.includePerformance) activeFeatures.push('Performance').;    if (flags.includeSecurity) activeFeatures.push('Security').  ;    if (flags.includeTesting) activeFeatures.push('Testing').')
    const contextualIntro = activeFeatures.length > 0 ? 
      `\n### 🎯 **Enhanced Features**:${activeFeatures.join(',    '). optimization enabled` :`

    return {
      contextualIntro,
      allRecommendations:[
        ...recommendations.performanceRecommendations,
        ...recommendations.securityRecommendations,
        ...recommendations.testingRecommendations
].filter(Boolean),
      featureMatrix:{
        performance:flags.includePerformance,
        security:flags.includeSecurity,
        testing:flags.includeTesting,
        totalFeatures:activeFeatures.length
}
};
}

  // Supporting utility methods for feature analysis
  private getLanguageSpecificPerformanceTips(language:string): string[] {
    const tips:Record<string, string[]> = {
      typescript:['Use type-only imports',    'Leverage tree-shaking',    'Optimize TypeScript compilation'],
      javascript:['Use WeakMap for metadata',    'Implement code splitting',    'Optimize event listeners'],
      python:['Use list comprehensions',    'Leverage asyncio',    'Profile with cProfile'],
      java:['Use StringBuilder',    'Optimize garbage collection',    'Implement connection pooling']').;
    return tips[language] || tips.javascript;
}

  private getPerformanceTools(language:string): string[] {
    const tools:Record<string, string[]> = {
      typescript:['webpack-bundle-analyzer',    'Lighthouse',    '@typescript-eslint/performance'],
      javascript:['Chrome DevTools',    'Web Vitals',    'bundle-analyzer'],
      python:['cProfile',    'memory_profiler',    'py-spy'],
      java:['JProfiler',    'VisualVM',    'Java Flight Recorder']').;
    return tools[language] || tools.javascript;
}

  private getMemoryTips(language:string): string {
    const tips:Record<string, string> = {
      typescript: 'Use object pooling and avoid memory leaks with proper cleanup',      javascript: 'Use WeakMap/WeakSet for metadata and clean up event listeners',      python: 'Use generators for large datasets and del unused references',      java:'Implement proper object lifecycle management and connection pooling').;
    return tips[language] || tips.javascript;
}

  private getLazyLoadingOpportunities(language:string): string {
    const opportunities:Record<string, string> = {
      typescript: 'components, modules, and heavy libraries',      javascript: 'images, scripts, and route-based code splitting',      python: 'modules, data processing pipelines, and ML models',      java:'classes, resources, and database connections').;
    return opportunities[language] || opportunities.javascript;
}

  private assessSecurityRiskLevel(language:string): string {
    const riskLevels:Record<string, string> = {
      typescript: 'Medium - Web-based vulnerabilities',      javascript: 'High - Client-side exposure and injection risks',      python: 'Medium - Server-side and data processing risks',      java:'Medium - Enterprise and injection vulnerabilities').;
    return riskLevels[language] || 'Medium;
}

  private getCommonVulnerabilities(language:string): string[] {
    const vulnerabilities:Record<string, string[]> = {
      typescript:['XSS',    'CSRF',    'Prototype pollution',    'Dependency vulnerabilities'],
      javascript:['XSS',    'CSRF',    'Injection attacks',    'DOM manipulation'],
      python:['SQL Injection',    'Command Injection',    'Deserialization',    'Path traversal'],
      java:['SQL Injection',    'XML External Entities',    'Deserialization',    'LDAP Injection']').;
    return vulnerabilities[language] || vulnerabilities.javascript;
}

  private getSecurityFrameworks(language:string): string[] {
    const frameworks:Record<string, string[]> = {
      typescript:['Helmet.js',    'OWASP ZAP',    'Snyk',    'SonarQube'],
      javascript:['Helmet.js',    'Express-rate-limit',    'Joi validation'],
      python:['Django Security',    'Flask-Security',    'Bandit',    'Safety'],
      java:['Spring Security',    'OWASP ESAPI',    'Shiro',    'FindBugs']').;
    return frameworks[language] || frameworks.javascript;
}

  private getComplianceRequirements():string[] {
    return ['GDPR',    'CCPA',    'SOX',    'HIPAA',    'PCI-DSS'];').

  private getLanguageSecurityTips(language:string): string {
    const tips:Record<string, string> = {
      typescript: 'Enable strict type checking and use ESLint security rules',      javascript: 'Avoid eval(), validate inputs, use Content Security Policy',      python: 'Use parameterized queries, validate file paths, sanitize user input',      java:'Use prepared statements, validate XML input, implement proper authentication').;
    return tips[language] || tips.javascript;
}

  private getVulnerabilityPreventionTip(vulnerability:string): string {
    const tips:Record<string, string> = {
      'XSS': ' Escape output and use Content Security Policy',      'CSRF': ' Implement anti-CSRF tokens and SameSite cookies',      'SQL Injection': ' Use parameterized queries and input validation',      'Command Injection': ' Avoid system calls and validate all inputs',      'Prototype pollution':' Use Object.create(null) and validate object keys').;
    return tips[vulnerability] || 'Implement input validation and secure coding practices;
}

  private determineTestingStrategy(language:string, complexity:number): string {
    if (complexity > 20) return 'Comprehensive testing with unit, integration, and E2E tests;
    if (complexity > 10) return 'Balanced testing with focus on critical paths;
    return 'Focused unit testing with selective integration tests;
}

  private getTestingFrameworks(language:string): string[] {
    const frameworks:Record<string, string[]> = {
      typescript:['Jest',    'Vitest',    'Playwright',    'Cypress'],
      javascript:['Jest',    'Mocha',    'Jasmine',    'Cypress'],
      python:['pytest',    'unittest',    'Selenium',    'hypothesis'],
      java:['JUnit 5',    'TestNG',    'Mockito',    'Selenium']').;
    return frameworks[language] || frameworks.javascript;
}

  private getCoverageTargets(complexity:number): string {
    if (complexity > 20) return '90%+ for critical functions, 80%+ overall;
    if (complexity > 10) return '80%+ for critical functions, 70%+ overall;
    return '70%+ for critical functions, 60%+ overall;
}

  private getRecommendedTestTypes(language:string): string[] {
    const testTypes:Record<string, string[]> = {
      typescript:['Unit',    'Integration',    'Component',    'E2E'],
      javascript:['Unit',    'Integration',    'Visual regression',    'Performance'],
      python:['Unit',    'Integration',    'Property-based',    'Load'],
      java:['Unit',    'Integration',    'Contract',    'Performance']').;
    return testTypes[language] || testTypes.javascript;
}
}

/**
 * Export convenient factory function
 */
export function createIntelligentPromptGenerator(
  behavioralIntelligence?:BehavioralIntelligence
):IntelligentPromptGenerator {
  return new IntelligentPromptGenerator(behavioralIntelligence);
}

/**
 * Export default configuration
 */
export const DEFAULT_CODING_STANDARDS:Required<CodingStandardsConfig> = {
  language: 'typescript',  maxComplexity:10,
  maxLinesPerFunction:30,
  maxParameters:5,
  fileNaming: 'kebab-case',  includePerformance:true,
  includeSecurity:true,
};
