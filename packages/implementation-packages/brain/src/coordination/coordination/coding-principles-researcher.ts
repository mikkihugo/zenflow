/**
 * @fileoverview Coding Principles Researcher - Dynamic Language Standards Research
 *
 * AI-powered research system that dynamically discovers and learns coding principles
 * for different languages, frameworks, and task types. Provides human-reviewable
 * templates that can be improved over time.
 *
 * Features:
 * - Language-specific principle research
 * - Task type optimization (API, web-app, mobile, etc.)
 * - Human-reviewable template generation
 * - Continuous learning from successful patterns
 * - DSPy-optimized principle discovery
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { getLogger } from '@claude-zen/foundation';

import type { BehavioralIntelligence } from '../../behavioral-intelligence';
import type { DSPyLLMBridge } from '../../coordination/dspy-llm-bridge';

/**
 * Language and framework types for principle research
 */
export type ProgrammingLanguage = 'typescript' | 'javascript' | 'python' | 'rust' | 'go' | 'java' | 'csharp' | 'swift' | 'kotlin';

export type TaskDomain = 'rest-api' | 'web-app' | 'mobile-app' | 'desktop-app' | 'microservices' | 'data-pipeline' | 'ml-model' | 'blockchain' | 'game-dev' | 'embedded';

export type DevelopmentRole = 'backend-developer' | 'frontend-developer' | 'fullstack-developer' | 'mobile-developer' | 'devops-engineer' | 'ml-engineer' | 'architect' | 'tech-lead';

/**
 * Coding principles research configuration
 */
export interface PrinciplesResearchConfig {
  /** Language to research */
  language: ProgrammingLanguage;
  /** Task domain context */
  domain?: TaskDomain;
  /** Developer role context */
  role?: DevelopmentRole;
  /** Include performance guidelines */
  includePerformance?: boolean;
  /** Include security guidelines */
  includeSecurity?: boolean;
  /** Include testing guidelines */
  includeTesting?: boolean;
  /** Research depth level */
  depth?: 'basic|intermediate|advanced|expert';
}

/**
 * Researched coding principles result
 */
export interface CodingPrinciples {
  /** Language and context */
  language: ProgrammingLanguage;
  domain?: TaskDomain;
  role?: DevelopmentRole;

  /** Core principles */
  coreStandards: {
    repositoryStructure: string[];
    fileNaming: string[];
    folderOrganization: string[];
    functionComplexity: string[];
    codeOrganization: string[];
    errorHandling: string[];
    documentation: string[];
    codeQuality: string[];
    testingStrategy: string[];
  };

  /** Language-specific guidelines */
  languageSpecific: {
    typeSystem: string[];
    memoryManagement: string[];
    concurrency: string[];
    packageManagement: string[];
    buildTools: string[];
  };

  /** Domain-specific practices */
  domainSpecific?: {
    architecture: string[];
    dataHandling: string[];
    apiDesign: string[];
    userInterface: string[];
    deployment: string[];
  };

  /** Quality metrics */
  qualityMetrics: {
    complexity: { metric: string; threshold: number };
    coverage: { metric: string; threshold: number };
    maintainability: { metric: string; threshold: number };
    performance: { metric: string; threshold: number };
  };

  /** Best practices from successful patterns */
  bestPractices: string[];

  /** Anti-patterns to avoid */
  antiPatterns: string[];

  /** Human-reviewable template */
  template: string;

  /** Research metadata */
  researchMetadata: {
    researchedAt: Date;
    sources: string[];
    confidence: number;
    humanReviewed: boolean;
    lastUpdated: Date;
    version: string;
  };
}

/**
 * Human review feedback for improving templates
 */
export interface HumanFeedback {
  principlesId: string;
  reviewer: string;
  rating: 1 | 2 | 3 | 4 | 5;
  improvements: string[];
  approvedSections: string[];
  rejectedSections: string[];
  additionalGuidelines: string[];
  notes: string;
  reviewedAt: Date;
}

/**
 * Agent execution feedback for improving prompts
 */
export interface AgentExecutionFeedback {
  principlesId: string;
  agentId: string;
  taskType: string;
  accuracy: number; // 0-1 score
  completeness: number; // 0-1 score
  usefulness: number; // 0-1 score
  missingAreas: string[]; // What was missing from the principles
  incorrectGuidelines: string[]; // What guidelines were wrong/unhelpful
  additionalNeeds: string[]; // What additional guidance was needed
  actualCodeQuality: number; // 0-1 score of resulting code quality
  executionTime: number; // Time taken to complete task
  context: {
    language: ProgrammingLanguage;
    domain?: TaskDomain;
    role?: DevelopmentRole;
    taskComplexity:'simple|moderate|complex';
    requirementsCount: number;
  };
  timestamp: Date;
}

/**
 * Prompt confidence tracking
 */
export interface PromptConfidence {
  principlesId: string;
  initialConfidence: number; // 0-1 based on research quality
  executionCount: number; // How many times used
  averageAccuracy: number; // Average accuracy from agent feedback
  averageCompleteness: number; // Average completeness from agent feedback
  averageUsefulness: number; // Average usefulness from agent feedback
  overallConfidence: number; // Calculated confidence (0-1)
  needsImprovement: boolean; // Whether prompt needs research update
  lastUpdated: Date;
  improvementHistory: Array<{
    version: string;
    changes: string[];
    confidenceChange: number;
    timestamp: Date;
  }>;
}

/**
 * Coding Principles Researcher
 *
 * Dynamically researches and learns coding principles for different languages,
 * domains, and roles using AI research and human feedback loops.
 */
export class CodingPrinciplesResearcher {
  private cache = new Map<string, CodingPrinciples>();
  private humanFeedback = new Map<string, HumanFeedback[]>();
  private agentFeedback = new Map<string, AgentExecutionFeedback[]>();
  private promptConfidence = new Map<string, PromptConfidence>();
  private minimumConfidenceThreshold = 0.7; // Minimum confidence before using principles
  private logger = getLogger('CodingPrinciplesResearcher');

  constructor(
    private dspyBridge: DSPyLLMBridge,
    private behavioralIntelligence?: BehavioralIntelligence
  ) {}

  /**
   * Research coding principles for a specific language/domain/role combination
   */
  async researchPrinciples(
    config: PrinciplesResearchConfig
  ): Promise<CodingPrinciples> {
    const cacheKey = this.generateCacheKey(config);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    try {
      // Use DSPy to research coding principles
      const researchTask = {
        id: `principles-research-${cacheKey}-${Date.now()}`,
        type: 'reasoning'as const,
        input: this.buildResearchPrompt(config),
        context: {
          language: config.language,
          domain: config.domain,
          role: config.role,
          depth: config.depth || 'intermediate',
          includePerformance: config.includePerformance,
          includeSecurity: config.includeSecurity,
          includeTesting: config.includeTesting,
        },
        priority: 'high' as const,
      };

      const researchResult =
        await this.dspyBridge.processCoordinationTask(researchTask);

      if (researchResult.success && researchResult.result) {
        const principles = await this.parseResearchResult(
          researchResult.result,
          config
        );

        // Cache the result
        this.cache.set(cacheKey, principles);

        return principles;
      }

      throw new Error('Research failed to produce valid results');
    } catch (error) {
      this.logger.warn('Principles research failed, using fallback:', error);
      return this.getFallbackPrinciples(config);
    }
  }

  /**
   * Submit human feedback for improving principles
   */
  async submitHumanFeedback(feedback: HumanFeedback): Promise<void> {
    const existing = this.humanFeedback.get(feedback.principlesId) || [];
    existing.push(feedback);
    this.humanFeedback.set(feedback.principlesId, existing);

    // Use feedback to improve future research
    await this.incorporateFeedback(feedback);
  }

  /**
   * Get human-reviewable template for a language/domain
   */
  async getReviewableTemplate(
    config: PrinciplesResearchConfig
  ): Promise<string> {
    const principles = await this.researchPrinciples(config);
    return this.generateReviewableTemplate(principles);
  }

  /**
   * Update principles based on successful project patterns
   */
  async learnFromSuccess(
    config: PrinciplesResearchConfig,
    successPatterns: {
      fileNamingPatterns: string[];
      successfulArchitectures: string[];
      performanceOptimizations: string[];
      commonPitfalls: string[];
    }
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(config);
    const existing = this.cache.get(cacheKey);

    if (existing) {
      // Enhance existing principles with learned patterns
      await this.enhancePrinciplesWithLearning(existing, successPatterns);
      this.cache.set(cacheKey, existing);
    }
  }

  /**
   * Meta-learning: Research principles with confidence building
   *
   * Iteratively researches and improves prompts until confidence threshold is met
   */
  async researchPrinciplesWithConfidence(
    config: PrinciplesResearchConfig,
    targetConfidence: number = this.minimumConfidenceThreshold
  ): Promise<CodingPrinciples> {
    const cacheKey = this.generateCacheKey(config);
    let confidence = this.getPromptConfidence(cacheKey);

    // If we already have high-confidence principles, return them
    if (
      confidence.overallConfidence >= targetConfidence &&
      !confidence.needsImprovement
    ) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Research multiple versions until we achieve confidence
    let bestPrinciples: CodingPrinciples | null = null;
    let bestConfidence = 0;
    let researchAttempts = 0;
    const maxAttempts = 5;

    while (
      bestConfidence < targetConfidence &&
      researchAttempts < maxAttempts
    ) {
      researchAttempts++;

      try {
        // Research with focus on areas that need improvement
        const researchConfig = this.enhanceConfigWithFeedback(
          config,
          confidence
        );
        const principles = await this.researchPrinciples(researchConfig);

        // Evaluate research quality
        const researchConfidence = await this.evaluateResearchQuality(
          principles,
          config
        );

        if (researchConfidence > bestConfidence) {
          bestPrinciples = principles;
          bestConfidence = researchConfidence;

          // Update confidence tracking
          confidence = this.updatePromptConfidence(cacheKey, {
            initialConfidence: researchConfidence,
            version: `research-v${researchAttempts}`,
            improvements: [
              `Research attempt ${researchAttempts}: confidence ${researchConfidence.toFixed(3)}`,
            ],
          });
        }

        this.logger.info(`Research attempt ${researchAttempts}: confidence ${researchConfidence.toFixed(3)} (target: ${targetConfidence})`);
      } catch (error) {
        this.logger.warn(`Research attempt ${researchAttempts} failed:`, error);
      }
    }

    if (!bestPrinciples) {
      // Fallback to basic research if all attempts failed
      return await this.researchPrinciples(config);
    }

    // Cache the best principles found
    this.cache.set(cacheKey, bestPrinciples);

    this.logger.info(`Research completed after ${researchAttempts} attempts. Final confidence: ${bestConfidence.toFixed(3)}`);
    return bestPrinciples;
  }

  /**
   * Submit agent execution feedback for continuous improvement
   */
  async submitAgentFeedback(feedback: AgentExecutionFeedback): Promise<void> {
    const existing = this.agentFeedback.get(feedback.principlesId) || [];
    existing.push(feedback);
    this.agentFeedback.set(feedback.principlesId, existing);

    // Update confidence based on agent feedback
    await this.updateConfidenceFromAgentFeedback(feedback);

    // Check if principles need improvement
    await this.evaluateImprovementNeeds(feedback.principlesId);
  }

  /**
   * Get principles with automatic improvement based on feedback
   */
  async getAdaptivePrinciples(
    config: PrinciplesResearchConfig
  ): Promise<CodingPrinciples> {
    const cacheKey = this.generateCacheKey(config);
    const confidence = this.getPromptConfidence(cacheKey);

    // If confidence is low or improvement is needed, research new principles
    if (
      confidence.overallConfidence < this.minimumConfidenceThreshold || confidence.needsImprovement
    ) {
      this.logger.info(`Principles need improvement (confidence: ${confidence.overallConfidence.toFixed(3)}). Researching...`);
      return await this.researchPrinciplesWithConfidence(config);
    }

    // Otherwise return cached principles
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // No cached principles, research new ones
    return await this.researchPrinciplesWithConfidence(config);
  }

  /**
   * Build research prompt for DSPy
   */
  private buildResearchPrompt(config: PrinciplesResearchConfig): string {
    const { language, domain, role, depth, includePerformance, includeSecurity, includeTesting } = config;

    // Get comprehensive research areas based on role and domain
    const researchAreas = this.getComprehensiveResearchAreas(role, domain);

    return `Research and compile comprehensive coding principles for ${language} development.

Context:
- Language: ${language}
- Domain: ${domain || 'general'}
- Role: ${role || 'general-developer'}
- Depth: ${depth || 'intermediate'}
- Include Performance: ${includePerformance ? 'Yes' : 'No'}
- Include Security: ${includeSecurity ? 'Yes' : 'No'}
- Include Testing: ${includeTesting ? 'Yes' : 'No'}

Research the following comprehensive areas and provide specific, actionable guidelines:

1. CORE STANDARDS:
   - Repository structure and organization for ${domain || 'general'} projects
   - File naming conventions specific to ${language} and ${role || 'general-developer'} workflows
   - Folder organization patterns for ${domain || 'general'} applications
   - Function complexity guidelines appropriate for ${role || 'developer'} responsibilities
   - Code organization patterns that scale with team size
   - Error handling best practices for ${domain || 'general'} environments
   - Documentation standards for ${role || 'developer'} deliverables
   - Code quality metrics and enforcement strategies
   - Testing strategy for ${language} in ${domain || 'general'} context

2. LANGUAGE-SPECIFIC:
   - ${language} type system best practices for ${role || 'developer'} work
   - Memory management patterns (if applicable to ${language})
   - Concurrency and async patterns for ${domain || 'general'} applications
   - Package/module management strategies
   - Build tools and CI/CD pipeline recommendations for ${language}

${
  researchAreas.domainSpecific.length > 0
    ? `
3. DOMAIN-SPECIFIC (${domain || 'general'}):
${researchAreas.domainSpecific.map((area) => `   - ${area}`).join('\n')}
`
    : ''}

${
  researchAreas.roleSpecific.length > 0
    ? `
4. ROLE-SPECIFIC (${role || 'general-developer'}):
${researchAreas.roleSpecific.map((area) => `   - ${area}`).join('\n')}
`
    : ''}

5. QUALITY METRICS & STANDARDS:
   - Measurable complexity thresholds for ${language}
   - Code coverage expectations for ${domain || 'general'} projects
   - Maintainability indices and technical debt management
   - Performance benchmarks relevant to ${role || 'developer'} work
   - Security validation requirements for ${domain || 'general'} applications

6. ADVANCED PRACTICES:
${researchAreas.advanced.map((area) => `   - ${area}`).join('\n')}

Provide specific, actionable guidelines that a ${role || 'developer'} can immediately apply in ${language} development.
Focus on current industry best practices and emerging patterns for ${domain || 'general'} domain.
Include specific examples and anti-patterns to avoid.
Consider the unique challenges and responsibilities of ${role || 'developer'} role.

Respond in JSON format with structured guidelines that cover all research areas comprehensively.`;
  }

  /**
   * Get comprehensive research areas based on role and domain
   */
  private getComprehensiveResearchAreas(
    role?: DevelopmentRole,
    domain?: TaskDomain
  ): {
    domainSpecific: string[];
    roleSpecific: string[];
    advanced: string[];
  } {
    return {
      domainSpecific: this.getDomainSpecificResearchAreas(domain),
      roleSpecific: this.getRoleSpecificResearchAreas(role),
      advanced: this.getAdvancedResearchAreas(role, domain),
    };
  }

  /**
   * Get domain-specific research areas
   */
  private getDomainSpecificResearchAreas(domain?: TaskDomain): string[] {
    const domainAreas: Record<TaskDomain, string[]> = {
      'rest-api': [
        'RESTful API design principles and OpenAPI specification',
        'Authentication and authorization patterns (JWT, OAuth2, API keys)',
        'Rate limiting and API versioning strategies',
        'Input validation and sanitization for API endpoints',
        'Error response formatting and HTTP status code usage',
        'API documentation and testing strategies',
        'Microservices communication patterns',
      ],
      'web-app': [
        'Component-based architecture and state management',
        'Client-side routing and navigation patterns',
        'Performance optimization (lazy loading, code splitting)',
        'Accessibility (WCAG) compliance and semantic HTML',
        'Progressive Web App (PWA) implementation',
        'Browser compatibility and polyfill strategies',
        'SEO optimization and meta tag management',
      ],
      'mobile-app': [
        'Mobile-first design principles and responsive layouts',
        'Touch interaction patterns and gesture handling',
        'Device-specific optimization (iOS/Android guidelines)',
        'Offline functionality and local storage strategies',
        'Push notification implementation',
        'App store deployment and versioning',
        'Performance optimization for mobile devices',
      ],
      'desktop-app': [
        'Native desktop UI patterns and platform guidelines',
        'File system integration and local data management',
        'Cross-platform compatibility strategies',
        'Desktop-specific security considerations',
        'System integration (notifications, shortcuts)',
        'Application packaging and distribution',
        'Auto-update mechanisms',
      ],
      microservices: [
        'Service decomposition and bounded context design',
        'Inter-service communication patterns (sync/async)',
        'Service discovery and load balancing',
        'Distributed transaction management',
        'Monitoring and observability across services',
        'Container orchestration and deployment strategies',
        'Data consistency and eventual consistency patterns',
      ],
      'data-pipeline': [
        'ETL/ELT pipeline design and data flow optimization',
        'Data validation and quality assurance',
        'Stream processing and batch processing patterns',
        'Data schema evolution and versioning',
        'Error handling and data recovery strategies',
        'Monitoring and alerting for data pipelines',
        'Scalability and partitioning strategies',
      ],
      'ml-model': [
        'Model training pipeline and experiment tracking',
        'Feature engineering and data preprocessing',
        'Model validation and performance metrics',
        'Model deployment and serving infrastructure',
        'A/B testing and model monitoring',
        'Data versioning and model lineage',
        'MLOps and continuous integration for models',
      ],
      blockchain: [
        'Smart contract design patterns and security',
        'Gas optimization and transaction efficiency',
        'Decentralized application (dApp) architecture',
        'Blockchain integration and wallet connectivity',
        'Consensus mechanism considerations',
        'Token economics and governance patterns',
        'Security auditing and formal verification',
      ],
      'game-dev': [
        'Game loop architecture and frame timing',
        'Asset management and resource optimization',
        'Physics simulation and collision detection',
        'State management for game objects',
        'Multiplayer networking and synchronization',
        'Performance profiling for real-time systems',
        'Platform-specific optimization (console/PC/mobile)',
      ],
      embedded: [
        'Resource-constrained programming patterns',
        'Real-time system design and timing constraints',
        'Hardware abstraction layer design',
        'Power management and energy efficiency',
        'Interrupt handling and concurrency',
        'Memory management in constrained environments',
        'Testing strategies for embedded systems',
      ],
    };

    return domain ? domainAreas[domain] || [] : [];
  }

  /**
   * Get role-specific research areas
   */
  private getRoleSpecificResearchAreas(role?: DevelopmentRole): string[] {
    const roleAreas: Record<DevelopmentRole, string[]> = {'backend-developer': [
        'Database design and query optimization',
        'Server architecture and scalability patterns',
        'Caching strategies and session management',
        'Background job processing and queue management',
        'Logging, monitoring, and observability',
        'Configuration management and environment handling',
        'Third-party service integration patterns',
      ],
      'frontend-developer': [
        'Component lifecycle and state management',
        'Browser performance optimization and rendering',
        'CSS architecture and maintainable styling',
        'Cross-browser compatibility and testing',
        'Build tools and asset optimization',
        'User experience (UX) implementation patterns',
        'Internationalization (i18n) and localization',
      ],
      'fullstack-developer': [
        'Full-stack architecture and layer separation',
        'Frontend-backend communication patterns',
        'End-to-end testing strategies',
        'Development workflow and toolchain integration',
        'Cross-cutting concerns (authentication, logging)',
        'Technology stack selection and integration',
        'DevOps practices for full-stack applications',
      ],
      'mobile-developer': [
        'Platform-specific development guidelines (iOS/Android)',
        'Mobile UI/UX patterns and native components',
        'Device capability integration (camera, GPS, sensors)',
        'App lifecycle management and background processing',
        'Mobile security and data protection',
        'App store guidelines and submission processes',
        'Cross-platform development strategies',
      ],
      'devops-engineer': [
        'Infrastructure as Code (IaC) and configuration management',
        'CI/CD pipeline design and automation',
        'Container orchestration and service mesh',
        'Monitoring, logging, and alerting systems',
        'Security scanning and vulnerability management',
        'Disaster recovery and backup strategies',
        'Cost optimization and resource management',
      ],
      'ml-engineer': [
        'Machine learning pipeline design and automation',
        'Model versioning and experiment tracking',
        'Feature stores and data pipeline integration',
        'Model serving and inference optimization',
        'A/B testing and model monitoring',
        'MLOps practices and continuous deployment',
        'Distributed training and model parallelization',
      ],
      architect: [
        'System architecture patterns and trade-offs',
        'Technology evaluation and decision frameworks',
        'Scalability planning and capacity management',
        'Cross-functional requirement analysis',
        'Technical debt management and refactoring strategies',
        'Team coordination and technical leadership',
        'Documentation and architectural decision records (ADRs)',
      ],
      'tech-lead': [
        'Code review processes and quality standards',
        'Team mentoring and knowledge sharing',
        'Technical decision making and consensus building',
        'Project planning and estimation techniques',
        'Risk assessment and mitigation strategies',
        'Stakeholder communication and requirement gathering',
        'Agile/Scrum practices and team productivity',
      ],
    };

    return role ? roleAreas[role] || [] : [];
  }

  /**
   * Get advanced research areas based on role and domain combination
   */
  private getAdvancedResearchAreas(
    role?: DevelopmentRole,
    domain?: TaskDomain
  ): string[] {
    const baseAdvanced = ['Design patterns and architectural patterns',
      'SOLID principles and clean code practices',
      'Domain-driven design (DDD) concepts',
      'Test-driven development (TDD) and behavior-driven development (BDD)',
      'Continuous integration and deployment strategies',
      'Code review and pair programming practices',
      'Technical documentation and knowledge sharing',
    ];

    // Add role-specific advanced areas
    const roleAdvanced: Partial<Record<DevelopmentRole, string[]>> = {
      architect: [
        'Enterprise architecture patterns and frameworks',
        'Distributed systems design and CAP theorem',
        'Event-driven architecture and CQRS patterns',
        'Performance engineering and capacity planning',
        'Security architecture and threat modeling',
      ],
      'tech-lead': [
        'Team scaling and knowledge transfer strategies',
        'Technical roadmap planning and prioritization',
        'Cross-team collaboration and dependency management',
        'Innovation management and technology adoption',
        'Performance management and career development',
      ],
      'devops-engineer': [
        'Site reliability engineering (SRE) practices',
        'Chaos engineering and fault tolerance',
        'Cloud-native architecture and serverless patterns',
        'Security automation and compliance as code',
        'Performance monitoring and optimization',
      ],
    };

    // Add domain-specific advanced areas
    const domainAdvanced: Partial<Record<TaskDomain, string[]>> = {
      microservices: [
        'Service mesh architecture and implementation',
        'Distributed tracing and observability',
        'Event sourcing and eventual consistency',
        'Circuit breaker and bulkhead patterns',
        'Service decomposition strategies',
      ],
      'ml-model': [
        'Advanced model architectures and hyperparameter tuning',
        'Distributed training and model parallelization',
        'Model interpretation and explainability',
        'Federated learning and privacy-preserving ML',
        'AutoML and neural architecture search',
      ],
    };

    const advanced = [...baseAdvanced];

    if (role && roleAdvanced[role]) {
      advanced.push(...roleAdvanced[role]);
    }

    if (domain && domainAdvanced[domain]) {
      advanced.push(...domainAdvanced[domain]);
    }

    return advanced;
  }

  /**
   * Parse DSPy research result into structured principles
   */
  private async parseResearchResult(
    result: any,
    config: PrinciplesResearchConfig
  ): Promise<CodingPrinciples> {
    try {
      // Allow event loop processing for parsing
      await new Promise(resolve => setTimeout(resolve, 0));
      const parsed = typeof result === 'string'? JSON.parse(result) : result;

      const principles: CodingPrinciples = {
        language: config.language,
        domain: config.domain,
        role: config.role,

        coreStandards: {
          repositoryStructure: parsed.coreStandards?.repositoryStructure || [
            `Use standard ${config.language} project structure`,'Separate source, tests, and documentation',
            'Include clear configuration files',
          ],
          fileNaming: parsed.coreStandards?.fileNaming || [
            `Use descriptive ${config.language} file names`,'Follow kebab-case convention',
            'Include purpose in filename',
          ],
          folderOrganization: parsed.coreStandards?.folderOrganization || ['Group by feature or domain',
            'Use consistent folder structure',
            'Separate utilities and shared code',
          ],
          functionComplexity: parsed.coreStandards?.functionComplexity || ['Keep functions under 30 lines',
            'Single responsibility principle',
            'Maximum 5 parameters',
          ],
          codeOrganization: parsed.coreStandards?.codeOrganization || ['Group related functionality',
            'Use consistent folder structure',
            'Separate concerns clearly',
          ],
          errorHandling: parsed.coreStandards?.errorHandling || ['Handle errors gracefully',
            'Use appropriate error types',
            'Provide meaningful error messages',
          ],
          documentation: parsed.coreStandards?.documentation || ['Document public APIs',
            'Use inline comments for complex logic',
            'Keep documentation up to date',
          ],
          codeQuality: parsed.coreStandards?.codeQuality || ['Follow consistent coding style',
            'Use linting and formatting tools',
            'Regular code review practices',
          ],
          testingStrategy: parsed.coreStandards?.testingStrategy || ['Write unit tests for core logic',
            'Include integration tests',
            'Maintain high test coverage',
          ],
        },

        languageSpecific: {
          typeSystem:
            parsed.languageSpecific?.typeSystem || this.getDefaultTypeSystem(config.language),
          memoryManagement:
            parsed.languageSpecific?.memoryManagement || this.getDefaultMemoryManagement(config.language),
          concurrency:
            parsed.languageSpecific?.concurrency || this.getDefaultConcurrency(config.language),
          packageManagement:
            parsed.languageSpecific?.packageManagement || this.getDefaultPackageManagement(config.language),
          buildTools:
            parsed.languageSpecific?.buildTools || this.getDefaultBuildTools(config.language),
        },

        domainSpecific: config.domain
          ? {
              architecture: parsed.domainSpecific?.architecture || [],
              dataHandling: parsed.domainSpecific?.dataHandling || [],
              apiDesign: parsed.domainSpecific?.apiDesign || [],
              userInterface: parsed.domainSpecific?.userInterface || [],
              deployment: parsed.domainSpecific?.deployment || [],
            }
          : undefined,

        qualityMetrics: {
          complexity: parsed.qualityMetrics?.complexity || {
            metric:'cyclomatic',
            threshold: 10,
          },
          coverage: parsed.qualityMetrics?.coverage || {
            metric:'line',
            threshold: 80,
          },
          maintainability: parsed.qualityMetrics?.maintainability || {
            metric:'maintainability_index',
            threshold: 70,
          },
          performance: parsed.qualityMetrics?.performance || {
            metric:'response_time',
            threshold: 100,
          },
        },

        bestPractices: parsed.bestPractices || [],
        antiPatterns: parsed.antiPatterns || [],

        template: this.generateTemplate(parsed),

        researchMetadata: {
          researchedAt: new Date(),
          sources: parsed.sources || ['AI Research'],
          confidence: 0.85,
          humanReviewed: false,
          lastUpdated: new Date(),
          version: '1.0.0',
        },
      };

      return principles;
    } catch (error) {
      this.logger.warn('Failed to parse research result:', error);
      return this.getFallbackPrinciples(config);
    }
  }

  /**
   * Generate human-reviewable template
   */
  private generateReviewableTemplate(principles: CodingPrinciples): string {
    return `# ${principles.language.toUpperCase()} Coding Principles
${principles.domain ? `## Domain: ${principles.domain}` : ''}
${principles.role ? `## Role: ${principles.role}` : ''}

## 📁 File Naming & Organization
${principles.coreStandards.fileNaming.map((item) => `- ${item}`).join('\n')}

## ⚡ Function Guidelines  
${principles.coreStandards.functionComplexity.map((item) => `- ${item}`).join('\n')}

## 🔧 ${principles.language.charAt(0).toUpperCase() + principles.language.slice(1)}-Specific
### Type System
${principles.languageSpecific.typeSystem.map((item) => `- ${item}`).join('\n')}

### Package Management
${principles.languageSpecific.packageManagement.map((item) => `- ${item}`).join('\n')}

## 📊 Quality Metrics
- **Complexity**: ${principles.qualityMetrics.complexity.metric} < ${principles.qualityMetrics.complexity.threshold}
- **Coverage**: ${principles.qualityMetrics.coverage.metric} > ${principles.qualityMetrics.coverage.threshold}%
- **Maintainability**: ${principles.qualityMetrics.maintainability.metric} > ${principles.qualityMetrics.maintainability.threshold}

---
**Research Date**: ${principles.researchMetadata.researchedAt.toISOString()}
**Confidence**: ${(principles.researchMetadata.confidence * 100).toFixed(1)}%
**Human Reviewed**: ${principles.researchMetadata.humanReviewed ? 'Yes' : 'No'}

> This template is AI-generated and should be reviewed by human experts.
> Please provide feedback to improve future research.`;
  }

  // Helper methods for language-specific defaults
  private getDefaultTypeSystem(language: ProgrammingLanguage): string[] {
    switch (language) {
      case 'typescript':
        return [
          'Use explicit types',
          'Avoid any',
          'Define interfaces',
          'Use union types',
        ];
      case 'python':
        return [
          'Use type hints',
          'Import from typing',
          'Use Protocol for interfaces',
        ];
      case 'rust':
        return [
          'Leverage ownership system',
          'Use appropriate lifetimes',
          'Prefer Result over panic',
        ];
      default:
        return ['Follow language type conventions'];
    }
  }

  private getDefaultMemoryManagement(language: ProgrammingLanguage): string[] {
    switch (language) {
      case 'rust':
        return [
          'Understand ownership',
          'Use smart pointers appropriately',
          'Avoid memory leaks',
        ];
      case 'go':
        return [
          'Let GC handle memory',
          'Avoid goroutine leaks',
          'Use sync.Pool for object reuse',
        ];
      default:
        return ['Follow language memory best practices'];
    }
  }

  private getDefaultConcurrency(language: ProgrammingLanguage): string[] {
    switch (language) {
      case 'go':
        return [
          'Use goroutines and channels',
          'Avoid race conditions',
          'Use context for cancellation',
        ];
      case 'rust':
        return [
          'Use async/await',
          'Leverage Send/Sync traits',
          'Use Arc/Mutex for shared state',
        ];
      case 'javascript':
      case 'typescript':
        return [
          'Use async/await',
          'Handle Promise rejections',
          'Avoid blocking operations',
        ];
      default:
        return ['Follow language concurrency patterns'];
    }
  }

  private getDefaultPackageManagement(language: ProgrammingLanguage): string[] {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return [
          'Use npm/yarn/pnpm',
          'Lock dependency versions',
          'Audit for vulnerabilities',
        ];
      case 'rust':
        return [
          'Use Cargo.toml',
          'Specify feature flags',
          'Use workspace for multi-crate projects',
        ];
      case 'python':
        return [
          'Use pip/poetry',
          'Create requirements.txt',
          'Use virtual environments',
        ];
      default:
        return ['Follow language package conventions'];
    }
  }

  private getDefaultBuildTools(language: ProgrammingLanguage): string[] {
    switch (language) {
      case 'typescript':
        return [
          'Use TypeScript compiler',
          'Configure tsconfig.json',
          'Use bundler like Vite/Webpack',
        ];
      case 'rust':
        return [
          'Use cargo build',
          'Configure Cargo.toml',
          'Use cargo clippy for linting',
        ];
      default:
        return ['Use standard language build tools'];
    }
  }

  private generateTemplate(parsed: any): string {
    return parsed.template || 'AI-generated coding principles template';
  }

  private generateCacheKey(config: PrinciplesResearchConfig): string {
    return `${config.language}-${config.domain || 'general'}-${config.role || 'general'}-${config.depth || 'intermediate'}`;
  }

  private isCacheValid(principles: CodingPrinciples): boolean {
    const ageInDays =
      (Date.now() - principles.researchMetadata.researchedAt.getTime()) /
      (1000 * 60 * 60 * 24);
    return ageInDays < 30; // Cache valid for 30 days
  }

  private getFallbackPrinciples(
    config: PrinciplesResearchConfig
  ): CodingPrinciples {
    return {
      language: config.language,
      domain: config.domain,
      role: config.role,
      coreStandards: {
        repositoryStructure: [
          'Use clear directory structure',
          'Separate concerns into folders',
        ],
        fileNaming: ['Use descriptive filenames', 'Follow naming conventions'],
        folderOrganization: [
          'Group related files',
          'Use consistent folder structure',
        ],
        functionComplexity: ['Keep functions simple', 'Single responsibility'],
        codeOrganization: [
          'Organize code logically',
          'Group related functionality',
        ],
        errorHandling: [
          'Handle errors gracefully',
          'Provide meaningful messages',
        ],
        documentation: ['Document public APIs', 'Use clear comments'],
        codeQuality: ['Write maintainable code', 'Follow coding standards'],
        testingStrategy: ['Write comprehensive tests', 'Test edge cases'],
      },
      languageSpecific: {
        typeSystem: this.getDefaultTypeSystem(config.language),
        memoryManagement: this.getDefaultMemoryManagement(config.language),
        concurrency: this.getDefaultConcurrency(config.language),
        packageManagement: this.getDefaultPackageManagement(config.language),
        buildTools: this.getDefaultBuildTools(config.language),
      },
      bestPractices: [],
      antiPatterns: [],
      qualityMetrics: {
        complexity: { metric: 'cyclomatic', threshold: 10 },
        coverage: { metric: 'line', threshold: 80 },
        maintainability: { metric: 'maintainability_index', threshold: 70 },
        performance: { metric: 'response_time', threshold: 100 },
      },
      template: 'Fallback template - requires research',
      researchMetadata: {
        researchedAt: new Date(),
        sources: ['Fallback'],
        confidence: 0.5,
        humanReviewed: false,
        lastUpdated: new Date(),
        version: '0.1.0-fallback',
      },
    };
  }

  private async incorporateFeedback(feedback: HumanFeedback): Promise<void> {
    // Use feedback to improve future research prompts and caching
    // This would integrate with the behavioral intelligence system
    await new Promise(resolve => setTimeout(resolve, 0));
    this.logger.info('Incorporating human feedback for principles improvement:', {
      principlesId: feedback.principlesId
    });
  }

  private async enhancePrinciplesWithLearning(
    principles: CodingPrinciples,
    patterns: any
  ): Promise<void> {
    // Enhance principles with successful patterns learned from actual projects
    await new Promise(resolve => setTimeout(resolve, 0));
    principles.researchMetadata.lastUpdated = new Date();
    principles.researchMetadata.confidence = Math.min(
      principles.researchMetadata.confidence + 0.1,
      1.0
    );

    // Analyze patterns to enhance principles
    if (patterns && typeof patterns === 'object') {
      try {
        // Extract successful patterns from the data
        const patternKeys = Object.keys(patterns);

        if (patternKeys.length > 0) {
          // Use patterns to refine principles based on real-world success data
          const patternSuccessRate = this.calculatePatternSuccessRate(patterns);

          if (patternSuccessRate > 0.8) {
            // High success rate patterns enhance confidence
            principles.researchMetadata.confidence = Math.min(
              principles.researchMetadata.confidence + 0.2,
              1.0
            );

            // Extract best practices from successful patterns
            this.extractBestPracticesFromPatterns(principles, patterns);
          }

          // Add pattern insights to research metadata
          principles.researchMetadata.sources.push(
            `pattern-analysis-${patternKeys.length}-patterns`
          );
        }
      } catch (error) {
        this.logger.warn(
          'Error analyzing patterns for principles enhancement:',
          error
        );
      }
    }
  }

  /**
   * Calculate success rate from patterns data
   */
  private calculatePatternSuccessRate(patterns: any): number {
    try {
      if (Array.isArray(patterns)) {
        // If patterns is an array of success/failure data
        const successCount = patterns.filter(
          (p: any) => p.success === true || p.successful === true
        ).length;
        return patterns.length > 0 ? successCount / patterns.length : 0;
      } else if (typeof patterns ==='object') {
        // If patterns has success metrics
        if (patterns.successRate) return patterns.successRate;
        if (patterns.success !== undefined && patterns.total !== undefined) {
          return patterns.total > 0 ? patterns.success / patterns.total : 0;
        }
        // Default success rate based on pattern existence and structure
        const patternCount = Object.keys(patterns).length;
        return patternCount > 3 ? 0.7 : 0.5; // Heuristic: more patterns indicate higher success
      }
      return 0.5; // Default moderate success rate
    } catch (error) {
      this.logger.warn('Error calculating pattern success rate:', error);
      return 0.5;
    }
  }

  /**
   * Extract best practices from successful patterns
   */
  private extractBestPracticesFromPatterns(
    principles: CodingPrinciples,
    patterns: any
  ): void {
    try {
      // Look for common successful patterns to enhance principles
      if (patterns.commonPatterns) {
        principles.bestPractices.push(
          ...patterns.commonPatterns.filter(
            (p: string) =>
              typeof p === 'string' &&
              p.length > 10 &&
              !principles.bestPractices.includes(p)
          )
        );
      }

      if (patterns.recommendations) {
        principles.antiPatterns.push(
          ...(patterns.recommendations.avoid?.filter(
            (p: string) =>
              typeof p === 'string'&&
              p.length > 10 &&
              !principles.antiPatterns.includes(p)
          ) || [])
        );
      }

      // Extract quality metrics if available
      if (patterns.qualityMetrics) {
        principles.researchMetadata.confidence = Math.min(
          principles.researchMetadata.confidence +
            (patterns.qualityMetrics.score || 0) * 0.1,
          1.0
        );
      }
    } catch (error) {
      this.logger.warn('Error extracting best practices from patterns:', error);
    }
  }

  /**
   * Get or initialize prompt confidence for a cache key
   */
  private getPromptConfidence(cacheKey: string): PromptConfidence {
    if (!this.promptConfidence.has(cacheKey)) {
      this.promptConfidence.set(cacheKey, {
        principlesId: cacheKey,
        initialConfidence: 0.5,
        executionCount: 0,
        averageAccuracy: 0,
        averageCompleteness: 0,
        averageUsefulness: 0,
        overallConfidence: 0.5,
        needsImprovement: true,
        lastUpdated: new Date(),
        improvementHistory: [],
      });
    }
    return this.promptConfidence.get(cacheKey)!;
  }

  /**
   * Update prompt confidence based on research quality
   */
  private updatePromptConfidence(
    cacheKey: string,
    update: {
      initialConfidence?: number;
      version: string;
      improvements: string[];
    }
  ): PromptConfidence {
    const confidence = this.getPromptConfidence(cacheKey);

    if (update.initialConfidence !== undefined) {
      confidence.initialConfidence = update.initialConfidence;
      confidence.overallConfidence = update.initialConfidence;
    }

    confidence.improvementHistory.push({
      version: update.version,
      changes: update.improvements,
      confidenceChange: update.initialConfidence
        ? update.initialConfidence - confidence.initialConfidence
        : 0,
      timestamp: new Date(),
    });

    confidence.lastUpdated = new Date();
    this.promptConfidence.set(cacheKey, confidence);

    return confidence;
  }

  /**
   * Evaluate research quality to determine initial confidence
   */
  private async evaluateResearchQuality(
    principles: CodingPrinciples,
    config: PrinciplesResearchConfig
  ): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 0));
    let qualityScore = 0;
    let maxScore = 0;

    // Evaluate completeness of core standards
    const requiredCoreAreas = Object.keys(principles.coreStandards);
    const filledCoreAreas = requiredCoreAreas.filter(
      (area) =>
        principles.coreStandards[area as keyof typeof principles.coreStandards]
          .length > 0
    );
    qualityScore += (filledCoreAreas.length / requiredCoreAreas.length) * 0.3;
    maxScore += 0.3;

    // Evaluate language-specific coverage
    const requiredLangAreas = Object.keys(principles.languageSpecific);
    const filledLangAreas = requiredLangAreas.filter(
      (area) =>
        principles.languageSpecific[
          area as keyof typeof principles.languageSpecific
        ].length > 0
    );
    qualityScore += (filledLangAreas.length / requiredLangAreas.length) * 0.2;
    maxScore += 0.2;

    // Evaluate domain-specific coverage if domain provided
    if (config.domain && principles.domainSpecific) {
      const requiredDomainAreas = Object.keys(principles.domainSpecific);
      const filledDomainAreas = requiredDomainAreas.filter(
        (area) =>
          principles.domainSpecific![
            area as keyof typeof principles.domainSpecific
          ].length > 0
      );
      qualityScore +=
        (filledDomainAreas.length / Math.max(requiredDomainAreas.length, 1)) *
        0.2;
    }
    maxScore += 0.2;

    // Evaluate quality metrics completeness
    const hasValidMetrics = Object.values(principles.qualityMetrics).every(
      (metric) => metric.threshold > 0 && metric.metric.length > 0
    );
    qualityScore += hasValidMetrics ? 0.2 : 0;
    maxScore += 0.2;

    // Evaluate template quality (basic check for content length)
    const templateQuality = Math.min(principles.template.length / 500, 1) * 0.1; // Expect at least 500 chars
    qualityScore += templateQuality;
    maxScore += 0.1;

    return Math.min(qualityScore / maxScore, 1);
  }

  /**
   * Enhance research config based on existing feedback
   */
  private enhanceConfigWithFeedback(
    config: PrinciplesResearchConfig,
    confidence: PromptConfidence
  ): PrinciplesResearchConfig {
    const enhancedConfig = { ...config };

    // Get agent feedback for this principles ID
    const feedbacks = this.agentFeedback.get(confidence.principlesId) || [];

    if (feedbacks.length > 0) {
      // Analyze common missing areas and focus research there
      const missingAreas = feedbacks.flatMap((f) => f.missingAreas);
      const commonMissing = this.getMostCommon(missingAreas);

      // Increase depth if complexity is often too low
      const avgComplexity =
        feedbacks.reduce(
          (sum, f) =>
            sum +
            (f.context.taskComplexity ==='simple'
              ? 1
              : f.context.taskComplexity === 'moderate'
                ? 2
                : 3),
          0
        ) / feedbacks.length;

      if (avgComplexity > 2) {
        enhancedConfig.depth = 'advanced';
      }

      // Enable additional areas based on feedback
      if (
        commonMissing.some((area) => area.toLowerCase().includes('performance'))
      ) {
        enhancedConfig.includePerformance = true;
      }
      if (
        commonMissing.some((area) => area.toLowerCase().includes('security'))
      ) {
        enhancedConfig.includeSecurity = true;
      }
      if (commonMissing.some((area) => area.toLowerCase().includes('test'))) {
        enhancedConfig.includeTesting = true;
      }
    }

    return enhancedConfig;
  }

  /**
   * Update confidence based on agent execution feedback
   */
  private async updateConfidenceFromAgentFeedback(
    feedback: AgentExecutionFeedback
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
    const confidence = this.getPromptConfidence(feedback.principlesId);

    // Update execution count
    confidence.executionCount++;

    // Update running averages
    const count = confidence.executionCount;
    confidence.averageAccuracy =
      (confidence.averageAccuracy * (count - 1) + feedback.accuracy) / count;
    confidence.averageCompleteness =
      (confidence.averageCompleteness * (count - 1) + feedback.completeness) /
      count;
    confidence.averageUsefulness =
      (confidence.averageUsefulness * (count - 1) + feedback.usefulness) /
      count;

    // Calculate overall confidence (weighted average)
    confidence.overallConfidence =
      confidence.initialConfidence * 0.3 +
      confidence.averageAccuracy * 0.25 +
      confidence.averageCompleteness * 0.25 +
      confidence.averageUsefulness * 0.2;

    confidence.lastUpdated = new Date();
    this.promptConfidence.set(feedback.principlesId, confidence);
  }

  /**
   * Evaluate whether principles need improvement based on feedback
   */
  private async evaluateImprovementNeeds(principlesId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
    const confidence = this.getPromptConfidence(principlesId);
    const feedbacks = this.agentFeedback.get(principlesId) || [];

    if (feedbacks.length < 3) {
      // Need more data before making decisions
      return;
    }

    // Check recent feedback for declining performance
    const recentFeedbacks = feedbacks.slice(-5); // Last 5 executions
    const recentAvgAccuracy =
      recentFeedbacks.reduce((sum, f) => sum + f.accuracy, 0) /
      recentFeedbacks.length;
    const recentAvgUsefulness =
      recentFeedbacks.reduce((sum, f) => sum + f.usefulness, 0) /
      recentFeedbacks.length;

    // Mark for improvement if performance is declining or below threshold
    confidence.needsImprovement =
      confidence.overallConfidence < this.minimumConfidenceThreshold || recentAvgAccuracy < 0.7 || recentAvgUsefulness < 0.7 || feedbacks.some((f) => f.missingAreas.length > 2); // Many missing areas

    this.promptConfidence.set(principlesId, confidence);
  }

  /**
   * Get most common items from an array
   */
  private getMostCommon(items: string[]): string[] {
    const frequency = new Map<string, number>();
    items.forEach((item) => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item);
  }
}

/**
 * Export factory function
 */
export function createCodingPrinciplesResearcher(
  dspyBridge: DSPyLLMBridge,
  behavioralIntelligence?: BehavioralIntelligence
): CodingPrinciplesResearcher {
  return new CodingPrinciplesResearcher(dspyBridge, behavioralIntelligence);
}

/**
 * Export default configuration for common languages
 */
export const DEFAULT_LANGUAGE_CONFIGS: Record<
  ProgrammingLanguage,
  PrinciplesResearchConfig
> = {
  typescript: {
    language:'typescript',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'intermediate',
  },
  javascript: {
    language: 'javascript',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'intermediate',
  },
  python: {
    language: 'python',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'intermediate',
  },
  rust: {
    language: 'rust',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'advanced',
  },
  go: {
    language: 'go',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'intermediate',
  },
  java: {
    language: 'java',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'intermediate',
  },
  csharp: {
    language: 'csharp',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'intermediate',
  },
  swift: {
    language: 'swift',
    includePerformance: true,
    includeSecurity: false,
    includeTesting: true,
    depth: 'intermediate',
  },
  kotlin: {
    language: 'kotlin',
    includePerformance: true,
    includeSecurity: true,
    includeTesting: true,
    depth: 'intermediate',
  },
};
