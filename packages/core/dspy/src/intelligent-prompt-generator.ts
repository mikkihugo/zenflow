/**
 * @fileoverview Intelligent Prompt Generator for DSPy Package
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

// TODO: The import for BehavioralIntelligence is currently broken or missing.
// If the module exists, ensure the path and type declarations are correct.
// If not, comment out or remove the import to prevent build errors.

// import type { BehavioralIntelligence } from '../../behavioral-intelligence';

import { getLogger } from '@claude-zen/foundation';
import type {
  CodingPrinciplesResearcher,
  ProgrammingLanguage,
  TaskDomain,
  DevelopmentRole,
} from './coding-principles-researcher';

// Add missing type declarations
// Type for behavioral intelligence - define as needed or import if available
interface BehavioralIntelligence {
  // Add properties as needed based on actual usage
  [key: string]: unknown;
}

// Interface for coding principles with quality metrics
interface CodingPrinciples {
  qualityMetrics: {
    complexity?: {
      metric: string;
      threshold: number;
    };
    maintainability?: {
      metric: string;
      threshold: number;
    };
    testability?: {
      metric: string;
      threshold: number;
    };
    coverage?: {
      metric: string;
      threshold: number;
    };
    performance?: {
      metric: string;
      threshold: number;
    };
  };
  patterns?: {
    [key: string]: unknown;
  };
  template?: string;
  researchMetadata?: {
    confidence: number;
    researchedAt: Date;
  };
}

// Interface for analysis data
interface AnalysisData {
  securityRisks?: string[];
  recommendations?: string[];
  [key: string]: unknown;
}

// Interface for adaptive config
interface AdaptiveConfig {
  language: string;
  domain?: string;
  role?: string;
  depth?: string;
  maxComplexity: number;
  maxLinesPerFunction: number;
  includePerformance?: boolean;
  includeSecurity?: boolean;
}

// Interface for feature analysis result
interface FeatureAnalysisResult {
  performanceProfile?: {
    requiresOptimization: boolean;
    complexityLevel: string;
    languageSpecific: string[];
  };
  securityProfile?: {
    riskLevel: string;
    vulnerabilities: string[];
    frameworks: string[];
  };
}

// Interface for merged recommendations result
interface MergedRecommendationsResult {
  activeFeatures: string[];
  recommendations: string[];
  summary: string;
}

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
  private behavioralIntelligence?: BehavioralIntelligence;
  private codingPrinciplesResearcher?: CodingPrinciplesResearcher;
  private defaultConfig: Required<CodingStandardsConfig>;
  private logger: ReturnType<typeof getLogger>;

  constructor(
    behavioralIntelligence?:BehavioralIntelligence,
    codingPrinciplesResearcher?:CodingPrinciplesResearcher
  ) {
    this.logger = getLogger('IntelligentPromptGenerator');
    this.behavioralIntelligence = behavioralIntelligence;
    this.codingPrinciplesResearcher = codingPrinciplesResearcher;
    this.defaultConfig = {
      language: 'typescript',
      maxComplexity: 10,
      maxLinesPerFunction: 30,
      maxParameters: 5,
      fileNaming: 'kebab-case',
      includePerformance: true,
      includeSecurity: true,
};
}

  /**
   * Generate intelligent prompt for development phase using meta-learning with confidence tracking
   */
  async generatePrompt(
    phase: DevelopmentPhase,
    context: ProjectContext,
    config?: Partial<CodingStandardsConfig>
  ): Promise<IntelligentPrompt> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const complexityScore = this.calculateComplexityScore(context, phase);

    // Try meta-learning approach first
    const metaLearningResult = await this.tryMetaLearningGeneration(
      phase, context, mergedConfig, complexityScore
    );
    if (metaLearningResult) return metaLearningResult;

    // Fallback to DSPy optimization
    const dspyResult = await this.tryDSPyGeneration(
      phase, context, mergedConfig, complexityScore
    );
    if (dspyResult) return dspyResult;

    // Final fallback to static generation
    return this.generateStaticPrompt(
      phase, context, mergedConfig, complexityScore
    );
  }

  /**
   * Try meta-learning prompt generation
   */
  private async tryMetaLearningGeneration(
    phase: DevelopmentPhase,
    context: ProjectContext,
    config: Required<CodingStandardsConfig>,
    complexityScore: number
  ): Promise<IntelligentPrompt | null> {
    try {
      const researchConfig = this.buildResearchConfig(config, context, complexityScore);
      const adaptivePrinciples = await this.getAdaptivePrinciples(researchConfig);

      if (adaptivePrinciples) {
        return this.buildMetaLearningPrompt(
          phase, context, config, adaptivePrinciples, complexityScore, researchConfig
        );
      }
    } catch (error) {
      this.logger.warn('Meta-learning prompt generation failed:', error);
    }
    return null;
  }

  /**
   * Try DSPy optimization prompt generation
   */
  private async tryDSPyGeneration(
    phase: DevelopmentPhase,
    context: ProjectContext,
    config: Required<CodingStandardsConfig>,
    complexityScore: number
  ): Promise<IntelligentPrompt | null> {
    try {
      const dspyOptimizedPrompt = await this.generateWithDSPy(phase, context, config);
      
      if (dspyOptimizedPrompt) {
        return {
          content: dspyOptimizedPrompt.content,
          codingStandards: dspyOptimizedPrompt.codingStandards,
          phaseGuidelines: dspyOptimizedPrompt.phaseGuidelines,
          qualityMetrics: dspyOptimizedPrompt.qualityMetrics,
          complexityScore
        };
      }
    } catch (error) {
      this.logger.warn('DSPy prompt generation failed:', error);
    }
    return null;
  }

  /**
   * Generate static prompt as final fallback
   */
  private async generateStaticPrompt(
    phase: DevelopmentPhase,
    context: ProjectContext,
    config: Required<CodingStandardsConfig>,
    complexityScore: number
  ): Promise<IntelligentPrompt> {
    const codingStandards = this.generateCodingStandards(config);
    const phaseGuidelines = this.generatePhaseGuidelines(phase, context, config);
    const qualityMetrics = this.generateQualityMetrics(phase, config);
    
    const content = this.buildPromptContent(
      phase, context, codingStandards, phaseGuidelines
    );

    // Use behavioral intelligence if available
    if (this.behavioralIntelligence) {
      const enhancedContent = await this.enhanceWithBehavioralIntelligence(content, context);
      return {
        content: enhancedContent,
        codingStandards,
        phaseGuidelines,
        qualityMetrics,
        complexityScore
      };
    }

    return {
      content,
      codingStandards,
      phaseGuidelines,
      qualityMetrics,
      complexityScore
    };
  }

  /**
   * Build research configuration for meta-learning
   */
  private buildResearchConfig(
    config: Required<CodingStandardsConfig>,
    context: ProjectContext,
    complexityScore: number
  ): AdaptiveConfig {
    return {
      language: config.language as ProgrammingLanguage,
      domain: this.inferDomainFromContext(context)?.toString(),
      role: this.inferRoleFromPhase('general')?.toString(),
      includePerformance: config.includePerformance,
      includeSecurity: config.includeSecurity,
      maxComplexity: config.maxComplexity,
      maxLinesPerFunction: config.maxLinesPerFunction,
      depth: complexityScore > 7 ? 'advanced' : 'intermediate'
    };
  }

  /**
   * Build meta-learning prompt result
   */
  private buildMetaLearningPrompt(
    phase: DevelopmentPhase,
    context: ProjectContext,
    config: Required<CodingStandardsConfig>,
    principles: CodingPrinciples,
    complexityScore: number,
    researchConfig: AdaptiveConfig
  ): IntelligentPrompt {
    const content = this.buildMetaLearningPromptContent(phase, context, principles);
    
    return {
      content,
      codingStandards: principles.template || 'No template available',
      phaseGuidelines: this.generatePhaseGuidelines(phase, context, config),
      qualityMetrics: this.convertPrinciplesToMetrics(principles),
      complexityScore,
      metadata: {
        principlesId: this.generatePrinciplesId(researchConfig),
        researchConfidence: principles.researchMetadata?.confidence || 0,
        usesPrinciplesResearch: true,
        researchedAt: principles.researchMetadata?.researchedAt || new Date()
      }
    };
  }

  /**
   * Generate comprehensive coding standards
   */
  private generateCodingStandards(
    config: Required<CodingStandardsConfig>
  ): string {
    const enhancedStandards = this.buildEnhancedStandards(config);
    const baseStandards = this.generateBaseStandards(config);
    const languageStandards = this.generateLanguageSpecificStandards(config);
    const featureStandards = this.generateFeatureStandards(config);
    const enhancedSections = this.appendEnhancedSections(enhancedStandards);

    return baseStandards + languageStandards + featureStandards + enhancedSections;
  }

  /**
   * Build enhanced standards configuration
   */
  private buildEnhancedStandards(config: Required<CodingStandardsConfig>) {
    const { language, includePerformance, includeSecurity, includeTesting } = config;
    
    const featureAnalysis = {
      performanceWeight: includePerformance ? 0.3 : 0.1,
      securityWeight: includeSecurity ? 0.3 : 0.1,
      testingWeight: includeTesting ? 0.3 : 0.1,
    };

    const performanceRecommendations = includePerformance ? 
      this.getPerformanceRecommendations(language, featureAnalysis) : [];
    
    const securityRecommendations = includeSecurity ? 
      this.getSecurityRecommendations(language, featureAnalysis) : [];
    
    const testingRecommendations = includeTesting ? 
      this.getTestingRecommendations(language, featureAnalysis) : [];

    return {
      contextualIntro: `These standards are customized for ${language} with emphasis on ${includePerformance ? 'performance, ' : ''}${includeSecurity ? 'security, ' : ''}${includeTesting ? 'testing' : ''}.`,
      performanceSection: performanceRecommendations.length > 0 ? `## Performance Standards:\n${performanceRecommendations.map(r => `- ${r}`).join('\n')}` : '',
      securitySection: securityRecommendations.length > 0 ? `## Security Standards:\n${securityRecommendations.map(r => `- ${r}`).join('\n')}` : '',
      testingSection: testingRecommendations.length > 0 ? `## Testing Standards:\n${testingRecommendations.map(r => `- ${r}`).join('\n')}` : '',
    };
  }

  /**
   * Generate base coding standards  
   */
  private generateBaseStandards(config: Required<CodingStandardsConfig>): string {
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
    const featureAnalysis = {
      performanceWeight: includePerformance ? 0.3 : 0.1,
      securityWeight: includeSecurity ? 0.3 : 0.1,
      testingWeight: includeTesting ? 0.3 : 0.1,
    };

    // Generate context-aware recommendations based on feature flags
    const performanceRecommendations = includePerformance ? 
      this.getPerformanceRecommendations(language, featureAnalysis) : [];
    
    const securityRecommendations = includeSecurity ? 
      this.getSecurityRecommendations(language, featureAnalysis) : [];
    
    const testingRecommendations = includeTesting ? 
      this.getTestingRecommendations(language, featureAnalysis) : [];

    // Merge recommendations into enhanced standards
    const enhancedStandards = {
      contextualIntro: `These standards are customized for ${language} with emphasis on ${includePerformance ? 'performance, ' : ''}${includeSecurity ? 'security, ' : ''}${includeTesting ? 'testing' : ''}.`,
      performanceSection: performanceRecommendations.length > 0 ? `## Performance Standards:\n${performanceRecommendations.map(r => `- ${r}`).join('\n')}` : '',
      securitySection: securityRecommendations.length > 0 ? `## Security Standards:\n${securityRecommendations.map(r => `- ${r}`).join('\n')}` : '',
      testingSection: testingRecommendations.length > 0 ? `## Testing Standards:\n${testingRecommendations.map(r => `- ${r}`).join('\n')}` : '',
    };

    let standards = `
## Coding Standards & Best Practices (${language.toUpperCase()})
${enhancedStandards.contextualIntro}

### File Organization & Naming:
- **Descriptive filenames**: Use clear, descriptive names that indicate file purpose
  - Good: user-authentication-service.${language === 'typescript' ? 'ts' : 'js'}
  - Good: product-catalog-manager.${language === 'typescript' ? 'ts' : 'js'}  
  - Good: order-validation-utils.${language === 'typescript' ? 'ts' : 'js'}
  - Bad: helper.${language === 'typescript' ? 'ts' : 'js'}, utils.${language === 'typescript' ? 'ts' : 'js'}, data.${language === 'typescript' ? 'ts' : 'js'}
- **Single responsibility**: Each file should have ONE clear purpose
- **Naming convention**: Use ${fileNaming} for files
- **Max functions per file**: 5-7 focused functions maximum

### Function Quality Guidelines:
- **Single responsibility**: Each function does ONE thing well
- **Max ${maxLinesPerFunction} lines**: Keep functions focused and readable
- **Max ${maxParameters} parameters**: Use objects for complex parameter sets
- **Cyclomatic complexity**: Keep below ${maxComplexity}
- **Pure functions**: Prefer pure functions when possible
- **Clear naming**: Function names should describe what they do`;

    if (language === 'typescript') {
      standards += `

### TypeScript Quality Standards:
- **Strict typing**: Always use explicit types, avoid 'any'
- **Interface definitions**: Define clear interfaces for all data structures
- **Type inference**: Leverage TypeScript's type inference when possible
- **Null safety**: Handle undefined/null cases explicitly
- **Union types**: Use union types for controlled variants
- **Type guards**: Implement proper type guards for runtime checks`;
    }

    if (includePerformance) {
      standards += `

### Performance Guidelines:
- **Big O awareness**: Consider algorithmic complexity
- **Memory management**: Avoid memory leaks and excessive allocations
- **Lazy loading**: Load resources only when needed
- **Caching strategies**: Implement appropriate caching
- **Bundle optimization**: Minimize bundle size and dependencies`;
    }

    if (includeSecurity) {
      standards += `

### Security Best Practices:
- **Input validation**: Validate all external inputs
- **Error handling**: Don't expose sensitive information in errors
- **Authentication**: Implement proper authentication and authorization
- **Data sanitization**: Sanitize user inputs to prevent injection attacks
- **Dependency security**: Regularly update and audit dependencies`;
    }

    if (includeTesting) {
      standards += `

### Testing Requirements:
- **Unit tests**: Cover core business logic
- **Integration tests**: Verify component interactions
- **Test-driven development**: Consider TDD for complex features
- **Mocking**: Use mocks for external dependencies
- **Coverage**: Aim for 80%+ test coverage`;
    }

    if (enhancedStandards.performanceSection) {
      standards += `

${enhancedStandards.performanceSection}`;
    }
    if (enhancedStandards.securitySection) {
      standards += `

${enhancedStandards.securitySection}`;
    }
    if (enhancedStandards.testingSection) {
      standards += `

${enhancedStandards.testingSection}`;
    }

    return standards;
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
### Specification Phase Guidelines:
- **Clear requirements**: Each requirement should be testable and specific
- **Domain modeling**: Use ${config.language === 'typescript' ? 'TypeScript interfaces' : 'clear data structures'} to model domain entities
- **API contracts**: Define clear input/output interfaces
- **Validation rules**: Specify data validation requirements
- **User stories**: Write clear user stories with acceptance criteria
- **Edge cases**: Identify and document edge cases and error scenarios`;

      case 'pseudocode':
        return `
### Pseudocode Phase Guidelines:
- **Algorithm clarity**: Write self-documenting pseudocode
- **Data structures**: Choose appropriate data structures (Map, Set, Array)
- **Control flow**: Clearly define logic and branching
- **Performance considerations**: Consider Big O complexity
- **Step-by-step logic**: Break down complex operations into clear steps
- **Variable naming**: Use descriptive names in pseudocode`;

      case 'architecture':
        return `
### Architecture Phase Guidelines:
- **Modular design**: Create loosely coupled, highly cohesive modules
- **Separation of concerns**: Separate business logic from presentation/data layers
- **Dependency management**: Minimize and clearly define dependencies
- **Interface segregation**: Create focused, specific interfaces
- **Package structure**: Organize code into logical packages/folders
- **Scalability patterns**: Design for future growth and changes`;

      case 'refinement':
        return `
### Refinement Phase Guidelines:
- **Performance optimization**: Profile and optimize critical paths
- **Code review practices**: Focus on readability and maintainability
- **Testing coverage**: Aim for 80%+ test coverage
- **Documentation**: Add comprehensive documentation for public APIs
- **Refactoring**: Eliminate code smells and technical debt
- **Error handling**: Robust error handling and logging`;

      case 'completion':
        return `
### Completion Phase Guidelines:
- **Production readiness**: Ensure error handling, logging, monitoring
- **Security validation**: Check for common security vulnerabilities
- **Performance benchmarks**: Establish performance baselines
- **Documentation completeness**: README, API docs, deployment guides
- **CI/CD pipeline**: Automated testing and deployment
- **Monitoring**: Implement proper monitoring and alerting`;

      default:
        return `
### General Development Guidelines:
- **Code quality**: Follow established coding standards
- **Documentation**: Write clear, comprehensive documentation
- **Testing**: Include appropriate unit and integration tests
- **Performance**: Optimize for speed and resource usage
- **Security**: Follow security best practices
- **Maintainability**: Write code that is easy to update and extend`;
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
# ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Development Prompt

## Project Context:
- **Project**: ${context.name}
- **Domain**: ${context.domain}
- **Requirements**: ${context.requirements?.length || 0} defined
- **Tech Stack**: ${context.techStack?.join(', ') || 'To be determined'}

${codingStandards}

${phaseGuidelines}

## Implementation Focus:
1. **Follow naming conventions** - Use descriptive, purpose-driven filenames
2. **Maintain function complexity** - Keep functions simple and focused
3. **Ensure type safety** - Use explicit typing throughout
4. **Write clean code** - Self-documenting, maintainable code
5. **Plan for testing** - Design with testability in mind

## Quality Checklist:
- [ ] Descriptive filenames that indicate purpose
- [ ] Single responsibility per file/function
- [ ] Appropriate complexity levels
- [ ] Comprehensive error handling
- [ ] Clear documentation and comments
- [ ] Type safety (for TypeScript)
- [ ] Performance considerations
- [ ] Security best practices

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
      // Import DSPy components
      // Note: DSPyLLMBridge and NeuralBridge are deprecated and removed
      // const { DSPyLLMBridge } = await import('../../coordination/dspy-llm-bridge');
      // const { NeuralBridge } = await import('../../neural-bridge');
      // Use modern EventBus for coordination instead
      const { getEventBus } = await import('@claude-zen/foundation');
      const eventBus = getEventBus();
      // Initialize DSPy bridge if not available
      // Legacy logger import removed as NeuralBridge is deprecated
      // const neuralBridge = new NeuralBridge(logger); // This line is removed as NeuralBridge is removed
      // const dspyBridge = new DSPyLLMBridge( // This line is removed as DSPyLLMBridge is removed
      //   {
      //     teleprompter: 'MIPROv2', // Use MIPROv2 for best optimization
      //     maxTokens: 16384,
      //     optimizationSteps: 3,
      //     coordinationFeedback:true,
      //     hybridMode:true,
      // },
      //   neuralBridge
      // );

      // await dspyBridge.initialize(); // This line is removed as DSPyLLMBridge is removed

      // Create coordination task with DSPy examples for prompt generation
      const promptTask = {
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
      const result = await eventBus.publishAndWaitForResponse(promptTask); // Changed to use eventBus

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
        return `- Follow established coding standards\n- Write maintainable, self-documenting code\n- Ensure comprehensive testing`;
    }
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
        output: `# Development Prompt for ${phase} Phase\n\n## Project Context\n## Coding Standards\n## Critical Instructions\n1. Use descriptive, purpose-driven filenames\n2. Keep functions simple and focused\n3. Follow ${config.language} best practices`
      },
      {
        input: `Generate ${phase} phase prompt for mobile app project in mobile domain using ${config.language}`,
        output: `# Development Prompt for ${phase} Phase\n\n## Project Context\n## Coding Standards\n## Critical Instructions\n1. Use descriptive, purpose-driven filenames\n2. Optimize for mobile performance\n3. Follow ${config.language} best practices`
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
      let contextualInsights = '';

      if (context.currentPhase) {
        contextualInsights += `- Project phase: ${context.currentPhase} - applying phase-specific patterns\n`;
}

      if (context.domainSpecific) {
        contextualInsights += `- Domain: ${context.domainSpecific} - leveraging domain expertise\n`;
}

      if (complexityLevel > 0.7) {
        contextualInsights += `- High complexity detected (${(complexityLevel * 100).toFixed(1)}%) - extra attention needed\n`;
}

      // Include agent performance insights relevant to project type
      if (enhancedStats.averagePerformance > 0.8) {
        contextualInsights += `- High-performing agent patterns available (${(enhancedStats.averagePerformance * 100).toFixed(1)}%)\n`;
}

      return `${content}

## AI-Enhanced Recommendations:
Based on ${agentProfiles.size} agent profiles and project context analysis:
${contextualInsights}
- Focus on areas where similar ${projectTags.join(', ')} projects typically encounter issues
- Leverage patterns that have proven successful in comparable domains
- Pay special attention to complexity hotspots identified by behavioral analysis
- Apply lessons from ${enhancedStats.totalAgents} agents' collective experience`;
} catch (error) {
      this.logger.warn(
        'Error enhancing prompt with behavioral intelligence: ',
        error
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
      tags.push(`${context.requirements.length}-requirements`);
    }

    if (tags.length === 0) {
      tags.push('general');
    }

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
  private async getAdaptivePrinciples(config: AdaptiveConfig): Promise<CodingPrinciples | null> {
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
    if (!domain) return undefined;

    return this.matchDomainPatterns(domain);
}

  /**
   * Match domain patterns using lookup table approach
   */
  private matchDomainPatterns(domain: string): TaskDomain | undefined {
    const domainMappings: Array<{
      patterns: string[];
      taskDomain: TaskDomain;
    }> = [
      {
        patterns: ['event', 'service', 'coordination'],
        taskDomain: 'event-driven'
      },
      {
        patterns: ['web', 'frontend', 'react', 'vue'],
        taskDomain: 'web-app'
      },
      {
        patterns: ['mobile', 'ios', 'android'],
        taskDomain: 'mobile-app'
      },
      {
        patterns: ['microservice'],
        taskDomain: 'microservices'
      },
      {
        patterns: ['data', 'pipeline', 'etl'],
        taskDomain: 'data-pipeline'
      },
      {
        patterns: ['ml', 'machine-learning', 'ai'],
        taskDomain: 'ml-model'
      },
      {
        patterns: ['game'],
        taskDomain: 'game-dev'
      },
      {
        patterns: ['blockchain', 'crypto'],
        taskDomain: 'blockchain'
      },
      {
        patterns: ['embedded', 'iot'],
        taskDomain: 'embedded'
      },
      {
        patterns: ['desktop'],
        taskDomain: 'desktop-app'
      }
    ];

    return this.findMatchingDomain(domain, domainMappings);
  }

  /**
   * Find matching domain from patterns
   */
  private findMatchingDomain(
    domain: string,
    mappings: Array<{ patterns: string[]; taskDomain: TaskDomain }>
  ): TaskDomain | undefined {
    for (const mapping of mappings) {
      if (mapping.patterns.some(pattern => domain.includes(pattern))) {
        return mapping.taskDomain;
      }
    }
    return undefined;
  }

  /**
   * Infer role from development phase
   */
  private inferRoleFromPhase(
    phase: DevelopmentPhase
  ): DevelopmentRole | undefined {
    switch (phase) {
      case 'architecture':
        return 'architect';
      case 'specification':
        return 'tech-lead';
      case 'pseudocode':
      case 'refinement':
      case 'completion':
        return 'fullstack-developer';
      default:
        return undefined;
    }
  }

  /**
   * Build meta-learning prompt content using researched principles
   */
  private buildMetaLearningPromptContent(
    phase: DevelopmentPhase,
    context: ProjectContext,
    principles: CodingPrinciples
  ): string {
    return `# ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Development Prompt

## META-LEARNING ENABLED

## Project Context:
- **Project**: ${context.name}
- **Domain**: ${context.domain}
- **Requirements**: ${context.requirements?.length || 0}
- **Tech Stack**: ${context.techStack?.join(', ') || 'To be determined'}
- **Research Confidence**: ${(principles.researchMetadata.confidence * 100).toFixed(1)}%

## AI-Researched Standards:
${principles.template}

## Quality Metrics (Research-Based):
- **Complexity**: ${principles.qualityMetrics.complexity.metric} < ${principles.qualityMetrics.complexity.threshold}
- **Coverage**: ${principles.qualityMetrics.coverage.metric} > ${principles.qualityMetrics.coverage.threshold}%
- **Maintainability**: ${principles.qualityMetrics.maintainability.metric} > ${principles.qualityMetrics.maintainability.threshold}
- **Performance**: ${principles.qualityMetrics.performance.metric} < ${principles.qualityMetrics.performance.threshold}ms

## Meta-Learning Instructions:
1. **Track your execution**: Note what works well and what doesn't
2. **Report feedback**: Identify missing guidelines or incorrect assumptions
3. **Continuous improvement**: This prompt adapts based on your feedback
4. **Second opinion validation**: Your work may be reviewed by another AI for accuracy

## CRITICAL INSTRUCTIONS:
1. **Follow research-based guidelines** above - these improve over time
2. **Use descriptive, purpose-driven filenames**
3. **Maintain function complexity** within researched thresholds
4. **Consider domain-specific patterns** for ${context.domain || 'general'} applications
5. **Plan for validation** - another AI may review your work for accuracy

Remember: This prompt learns from your execution. The better you follow and provide feedback on these guidelines, the more effective future prompts become.`;
  }

  /**
   * Convert principles to quality metrics
   */
  private convertPrinciplesToMetrics(principles: CodingPrinciples): string[] {
    const metrics: string[] = [];

    if (principles.qualityMetrics.complexity) {
      metrics.push(
        `Complexity: ${principles.qualityMetrics.complexity.metric} < ${principles.qualityMetrics.complexity.threshold}`
      );
    }
    if (principles.qualityMetrics.coverage) {
      metrics.push(
        `Coverage: ${principles.qualityMetrics.coverage.metric} > ${principles.qualityMetrics.coverage.threshold}%`
      );
    }
    if (principles.qualityMetrics.maintainability) {
      metrics.push(
        `Maintainability: ${principles.qualityMetrics.maintainability.metric} > ${principles.qualityMetrics.maintainability.threshold}`
      );
    }
    if (principles.qualityMetrics.performance) {
      metrics.push(
        `Performance: ${principles.qualityMetrics.performance.metric} < ${principles.qualityMetrics.performance.threshold}ms`
      );
    }

    return metrics;
  }

  /**
   * Generate principles ID for tracking
   */
  private generatePrinciplesId(config: AdaptiveConfig): string {
    return `${config.language}-${config.domain || 'general'}-${config.role || 'general'}-${config.depth || 'intermediate'}`
}

  /**
   * Submit agent execution feedback for continuous improvement
   */
  async submitFeedback(
    principlesId: string,
    feedback: {
      agentId: string;
      taskType: string;
      promptUsed: string;
      outputQuality: 'poor' | 'fair' | 'good' | 'excellent';
      adherenceToStandards: number;
      issuesFound: string[];
      suggestions: string[];
      incorrectGuidelines: string[];
      additionalNeeds: string[];
      actualCodeQuality: number;
      executionTime: number;
      taskComplexity: 'simple' | 'moderate' | 'complex';
      requirementsCount: number;
    }
  ): Promise<void> {
    if (!this.codingPrinciplesResearcher) {
      this.logger.warn('Cannot submit feedback: CodingPrinciplesResearcher not available');
      return;
    }

    const agentFeedback = {
      principlesId,
      agentId: feedback.agentId,
      taskType: feedback.taskType,
      promptUsed: feedback.promptUsed,
      outputQuality: feedback.outputQuality,
      adherenceToStandards: feedback.adherenceToStandards,
      issuesFound: feedback.issuesFound,
      suggestions: feedback.suggestions,
      incorrectGuidelines: feedback.incorrectGuidelines,
      additionalNeeds: feedback.additionalNeeds,
      actualCodeQuality: feedback.actualCodeQuality,
      executionTime: feedback.executionTime,
      taskComplexity: feedback.taskComplexity,
      requirementsCount: feedback.requirementsCount,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };

    try {
      await this.codingPrinciplesResearcher.submitFeedback(agentFeedback);
      this.logger.info('Feedback submitted successfully', { principlesId, agentId: feedback.agentId });
    } catch (error) {
      this.logger.error('Error submitting feedback:', error);
    }
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
    return `# Second Opinion Validation

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
- **Requirements**: ${context.requirements?.join(', ') || 'Not specified'}

## Validation Instructions:

### 1. Requirement Compliance Check
- Did the agent address all requirements from the original prompt?
- Are there any missing or misunderstood requirements?
- Rate compliance: 0-100%

### 2. Quality Standards Validation  
- Does the implementation follow the coding standards specified?
- Are naming conventions, complexity, and structure appropriate?
- Rate quality adherence: 0-100%

### 3. Misunderstanding Detection
- Identify any apparent misunderstandings of the task
- Note any implementations that don't match the intent
- Highlight areas where clarification might have helped

### 4. Correctness Assessment
- Is the implementation functionally correct?
- Are there logical errors or potential bugs?
- Does it solve the intended problem?

### 5. Improvement Opportunities
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
  private async analyzeProjectFeatureRequirements(config: AdaptiveConfig): Promise<FeatureAnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate analysis time
    
    const analysis = {
      performanceProfile: config.includePerformance ? {
        requiresOptimization: config.maxComplexity > 15 || config.maxLinesPerFunction > 50,
        complexityLevel: config.maxComplexity > 20 ? 'high' : config.maxComplexity > 10 ? 'medium' : 'low',
        languageSpecific: this.getLanguageSpecificPerformanceTips(config.language),
        recommendedTools: this.getPerformanceTools(config.language)
      } : null,
      
      securityProfile: config.includeSecurity ? {
        securityLevel: this.determineSecurityLevel(config.maxComplexity),
        recommendedPractices: this.getSecurityPractices(config.language),
        vulnerabilityTypes: this.getCommonVulnerabilities(config.language),
        securityFrameworks: this.getSecurityFrameworks(config.language),
        complianceRequirements: this.getComplianceRequirements()
      } : null,
      
      testingProfile: config.includeTesting ? {
        testingStrategy: this.determineTestingStrategy(config.language, config.maxComplexity),
        recommendedFrameworks: this.getTestingFrameworks(config.language),
        coverageTargets: this.getCoverageTargets(config.maxComplexity),
        testTypes: this.getRecommendedTestTypes(config.language)
      } : null,
      
      projectMetadata: {
        language: config.language,
        complexity: config.maxComplexity,
        codebaseSize: config.maxLinesPerFunction > 100 ? 'large' : 'medium',
        analysisTimestamp: new Date().toISOString()
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
  private async generatePerformanceRecommendations(language: string, analysis: AnalysisData): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const recommendations = [
      'Performance Optimization Guidelines',
      `- Big O complexity: Keep algorithms under O(n log n) when possible`,
      `- Memory management: ${this.getMemoryTips(language)}`,
      `- Lazy loading: Implement for ${this.getLazyLoadingOpportunities(language)}`,
      '- Caching strategies: Use memoization for expensive computations',
      '- Bundle optimization: Tree-shake unused code and minimize dependencies'
    ];

    if (analysis.performanceProfile?.requiresOptimization) {
      recommendations.push(
        '- Critical: High complexity detected - implement performance monitoring',
        '- Consider code splitting and async loading for large modules',
        '- Use performance profiling tools for bottleneck identification'
      );
    }

    recommendations.push(...analysis.performanceProfile?.recommendedTools.map((tool: string) => 
      `- Use ${tool} for performance monitoring`
    ) || []);

    return recommendations;
  }

  /**
   * Generate security-specific recommendations
   */
  private async generateSecurityRecommendations(language: string, analysis: AnalysisData): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const recommendations = [
      'Security Best Practices',
      '- Input validation: Sanitize and validate all user inputs',
      '- Authentication: Use strong, multi-factor authentication',
      '- Authorization: Implement principle of least privilege',
      '- Data encryption: Encrypt sensitive data at rest and in transit'
    ];

    if (analysis.securityProfile) {
      recommendations.push(
        `- ${language} Security: ${this.getLanguageSecurityTips(language)}`,
        ...analysis.securityProfile.vulnerabilityTypes.map((vuln: string) => 
          `- Prevent ${vuln}: ${this.getVulnerabilityPreventionTip(vuln)}`
        )
      );
    }

    return recommendations;
  }

  /**
   * Generate testing-specific recommendations
   */
  private async generateTestingRecommendations(language: string, analysis: AnalysisData): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const recommendations = [
      'Testing Excellence Guidelines',
      '- Unit tests: Achieve 80%+ code coverage for critical functions',
      '- Integration tests: Test component interactions and data flow',
      '- End-to-end tests: Validate complete user workflows'
    ];

    if (analysis.testingProfile) {
      recommendations.push(
        `- Testing Strategy:${analysis.testingProfile.testingStrategy}`,
        `- Coverage Target:${analysis.testingProfile.coverageTargets}`,
        ...analysis.testingProfile.recommendedFrameworks.map((framework:string) => 
          `- Use ${framework} for ${language} testing`
        ),
        ...analysis.testingProfile.testTypes.map((testType:string) => 
          `- Implement ${testType} tests for comprehensive coverage`
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
  ): Promise<MergedRecommendationsResult> {
    await new Promise(resolve => setTimeout(resolve, 2));
    
    const activeFeatures = [];
    if (flags.includePerformance) activeFeatures.push('Performance');
    if (flags.includeSecurity) activeFeatures.push('Security');
    if (flags.includeTesting) activeFeatures.push('Testing');
    const contextualIntro = activeFeatures.length > 0 ? 
      `\n### Enhanced Features: ${activeFeatures.join(', ')} optimization enabled` : '';

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
      java:['Use StringBuilder',    'Optimize garbage collection',    'Implement connection pooling']
    };
    return tips[language] || tips.javascript;
  }

  private getPerformanceTools(language:string): string[] {
    const tools:Record<string, string[]> = {
      typescript:['webpack-bundle-analyzer',    'Lighthouse',    '@typescript-eslint/performance'],
      javascript:['Chrome DevTools',    'Web Vitals',    'bundle-analyzer'],
      python:['cProfile',    'memory_profiler',    'py-spy'],
      java:['JProfiler',    'VisualVM',    'Java Flight Recorder']
    };
    return tools[language] || tools.javascript;
  }

  private getMemoryTips(language:string): string {
    const tips:Record<string, string> = {
      typescript: 'Use object pooling and avoid memory leaks with proper cleanup',
      javascript: 'Use WeakMap/WeakSet for metadata and clean up event listeners',
      python: 'Use generators for large datasets and del unused references',
      java: 'Implement proper object lifecycle management and connection pooling'
    };
    return tips[language] || tips.javascript;
  }

  private getLazyLoadingOpportunities(language:string): string {
    const opportunities:Record<string, string> = {
      typescript: 'components, modules, and heavy libraries',
      javascript: 'images, scripts, and route-based code splitting',
      python: 'modules, data processing pipelines, and ML models',
      java: 'classes, resources, and database connections'
    };
    return opportunities[language] || opportunities.javascript;
  }

  private determineSecurityLevel(complexity:number): string {
    if (complexity > 20) return 'High - Enterprise-level security';
    if (complexity > 10) return 'Medium - Web-based vulnerabilities';
    return 'Low - Basic security practices';
  }

  private getSecurityPractices(language:string): string[] {
    const practices:Record<string, string[]> = {
      typescript: ['Enable strict type checking', 'Use ESLint security rules', 'Avoid eval()', 'Implement Content Security Policy'],
      javascript: ['Avoid eval()', 'Validate inputs', 'Use Content Security Policy', 'Implement anti-CSRF tokens'],
      python: ['Use parameterized queries', 'Validate file paths', 'Sanitize user input', 'Implement anti-CSRF tokens'],
      java: ['Use prepared statements', 'Validate XML input', 'Implement proper authentication', 'Use anti-CSRF tokens']
    };
    return practices[language] || practices.javascript;
  }

  private getCommonVulnerabilities(language:string): string[] {
    const vulnerabilities:Record<string, string[]> = {
      typescript:['XSS',    'CSRF',    'Prototype pollution',    'Dependency vulnerabilities'],
      javascript:['XSS',    'CSRF',    'Injection attacks',    'DOM manipulation'],
      python:['SQL Injection',    'Command Injection',    'Deserialization',    'Path traversal'],
      java: ['SQL Injection', 'XML External Entities', 'Deserialization', 'LDAP Injection']
    };
    return vulnerabilities[language] || vulnerabilities.javascript;
  }

  private getSecurityFrameworks(language:string): string[] {
    const frameworks:Record<string, string[]> = {
      typescript:['Helmet.js',    'OWASP ZAP',    'Snyk',    'SonarQube'],
      javascript:['Helmet.js',    'Express-rate-limit',    'Joi validation'],
      python:['Django Security',    'Flask-Security',    'Bandit',    'Safety'],
      java: ['Spring Security', 'OWASP ESAPI', 'Shiro', 'FindBugs']
    };
    return frameworks[language] || frameworks.javascript;
  }

  private getComplianceRequirements():string[] {
    return ['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI-DSS'];
  }

  private getLanguageSecurityTips(language:string): string {
    const tips:Record<string, string> = {
      typescript: 'Enable strict type checking and use ESLint security rules',
      javascript: 'Avoid eval(), validate inputs, use Content Security Policy',
      python: 'Use parameterized queries, validate file paths, sanitize user input',
      java: 'Use prepared statements, validate XML input, implement proper authentication'
    };
    return tips[language] || tips.javascript;
  }

  private getVulnerabilityPreventionTip(vulnerability:string): string {
    const tips:Record<string, string> = {
      'XSS': 'Escape output and use Content Security Policy',
      'CSRF': 'Implement anti-CSRF tokens and SameSite cookies',
      'SQL Injection': 'Use parameterized queries and input validation',
      'Command Injection': 'Avoid system calls and validate all inputs',
      'Prototype pollution': 'Use Object.create(null) and validate object keys'
    };
    return tips[vulnerability] || 'Implement input validation and secure coding practices';
  }

  private determineTestingStrategy(language:string, complexity:number): string {
    if (complexity > 20) return 'Comprehensive testing with unit, integration, and E2E tests';
    if (complexity > 10) return 'Balanced testing with focus on critical paths';
    return 'Focused unit testing with selective integration tests';
  }

  private getTestingFrameworks(language:string): string[] {
    const frameworks:Record<string, string[]> = {
      typescript:['Jest',    'Vitest',    'Playwright',    'Cypress'],
      javascript:['Jest',    'Mocha',    'Jasmine',    'Cypress'],
      python:['pytest',    'unittest',    'Selenium',    'hypothesis'],
      java: ['JUnit 5', 'TestNG', 'Mockito', 'Selenium']
    };
    return frameworks[language] || frameworks.javascript;
  }

  private getCoverageTargets(complexity:number): string {
    if (complexity > 20) return '90%+ for critical functions, 80%+ overall';
    if (complexity > 10) return '80%+ for critical functions, 70%+ overall';
    return '70%+ for critical functions, 60%+ overall';
  }

  private getRecommendedTestTypes(language:string): string[] {
    const testTypes:Record<string, string[]> = {
      typescript:['Unit',    'Integration',    'Component',    'E2E'],
      javascript:['Unit',    'Integration',    'Visual regression',    'Performance'],
      python:['Unit',    'Integration',    'Property-based',    'Load'],
      java: ['Unit', 'Integration', 'Contract', 'Performance']
    };
    return testTypes[language] || testTypes.javascript;
  }

  private buildValidationPrompt(
    context: ProjectContext,
    agentResponse: string
  ): string {
    return `# Agent Response Validation Request

## Agent's Implementation:
\`\`\`
${agentResponse}
\`\`\`

## Project Context:
- **Project**: ${context.name}
- **Domain**: ${context.domain}
- **Requirements**: ${context.requirements?.join(', ') || 'Not specified'}

## Validation Instructions:

### 1. Requirement Compliance Check
- Did the agent address all requirements from the original prompt?
- Are there any missing or misunderstood requirements?
- Rate compliance: 0-100%

### 2. Quality Standards Validation  
- Does the implementation follow the coding standards specified?
- Are naming conventions, complexity, and structure appropriate?
- Rate quality adherence: 0-100%

### 3. Misunderstanding Detection
- Identify any apparent misunderstandings of the task
- Note any implementations that don't match the intent
- Highlight areas where clarification might have helped

### 4. Correctness Assessment
- Is the implementation functionally correct?
- Are there logical errors or potential bugs?
- Does it solve the intended problem?

### 5. Improvement Opportunities
- What could be improved in the implementation?
- Are there better approaches or patterns?
- Suggest specific code improvements

Please provide a detailed assessment to help improve the agent's output. Your feedback is critical for continuous learning.`;
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
