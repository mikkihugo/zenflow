/**
 * @fileoverview: Intelligent Prompt: Generator for: Brain Package
 *
 * A: I-powered prompt generation system that provides context-aware,
 * high-quality development prompts with built-in coding standards
 * and best practices for: TypeScript development.
 *
 * Features:
 * - Phase-specific prompt generation
 * - Coding standards integration
 * - Type: Script best practices
 * - Complexity management guidelines
 * - File organization standards
 *
 * @author: Claude Code: Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import type { Behavioral: Intelligence} from '../../behavioral-intelligence';

import type {
  CodingPrinciples: Researcher,
  Programming: Language,
} from './coding-principles-researcher';

/**
 * Development phase types for prompt generation
 */
export type: DevelopmentPhase = 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion' | 'general';

/**
 * Coding standards configuration
 */
export interface: CodingStandardsConfig {
  /** Target language (default: typescript) */
  language?: 'typescript' | 'javascript' | 'rust' | 'python';
  /** Maximum function complexity (default: 10) */
  max: Complexity?: number;
  /** Maximum lines per function (default: 30) */
  maxLinesPer: Function?: number;
  /** Maximum parameters per function (default: 5) */
  max: Parameters?: number;
  /** File naming convention (default: kebab-case) */
  file: Naming?: 'kebab-case' | 'camel: Case' | 'Pascal: Case' | 'snake_case';
  /** Include performance guidelines */
  include: Performance?: boolean;
  /** Include security guidelines */
  include: Security?: boolean;
}

/**
 * Project context for prompt generation
 */
export interface: ProjectContext {
  /** Project name */
  name:string;
  /** Project domain/type */
  domain:string;
  /** Current phase of the project */
  current: Phase?:string;
  /** Domain-specific context */
  domain: Specific?:Record<string, unknown>;
  /** Current requirements */
  requirements?:string[];
  /** Existing architecture patterns */
  architecture: Patterns?:string[];
  /** Technology stack */
  tech: Stack?:string[];
}

/**
 * Generated prompt result
 */
export interface: IntelligentPrompt {
  /** Main prompt content */
  content:string;
  /** Coding standards section */
  coding: Standards:string;
  /** Phase-specific guidelines */
  phase: Guidelines:string;
  /** Quality metrics */
  quality: Metrics:string[];
  /** Estimated complexity score */
  complexity: Score:number;
  /** Meta-learning metadata */
  metadata?:{
    principles: Id?:string;
    research: Confidence?:number;
    usesPrinciples: Research?:boolean;
    researched: At?:Date;
};
}

/**
 * Intelligent: Prompt Generator
 *
 * Generates context-aware, high-quality development prompts with
 * integrated coding standards and best practices.
 */
export class: IntelligentPromptGenerator {
  constructor(): void {
    this.behavioral: Intelligence = behavioral: Intelligence;
    this.codingPrinciples: Researcher = codingPrinciples: Researcher;
    this.default: Config = {
      language: 'typescript',      max: Complexity:10,
      maxLinesPer: Function:30,
      max: Parameters:5,
      file: Naming: 'kebab-case',      include: Performance:true,
      include: Security:true,
};
}

  /**
   * Generate intelligent prompt for development phase using meta-learning with confidence tracking
   */
  async generate: Prompt(): void {
    const merged: Config = { ...this.default: Config, ...config};
    const complexity: Score = this.calculateComplexity: Score(): void {
       {
      // Use enhanced coding principles researcher with meta-learning
      const research: Config = {
        language:merged: Config.language as: ProgrammingLanguage,
        domain:this.inferDomainFrom: Context(): void {
        const content = this.buildMetaLearningPrompt: Content(): void {
          content,
          coding: Standards:adaptive: Principles.template,
          phase: Guidelines:this.generatePhase: Guidelines(): void {
            principles: Id:this.generatePrinciples: Id(): void {
       {
      this.logger.warn(): void {
    const base: Metrics = [
      "Cyclomatic complexity:< ${config.max: Complexity}"""
      "Function length:< ${config.maxLinesPer: Function} lines"""
      "Parameter count:< ${config.max: Parameters}"""
      'Code coverage:> 80%',      'Documentation coverage:> 90%',];

    switch (phase) {
      case 'specification':
        return [
          ...base: Metrics,
          'Requirements clarity:100%',          'Testable requirements:100%',          'Domain model completeness:> 95%',];
      case 'architecture':
        return [
          ...base: Metrics,
          'Module coupling:Low',          'Module cohesion:High',          'Interface segregation:100%',];
      case 'completion':
        return [
          ...base: Metrics,
          'Security scan:0 vulnerabilities',          'Performance benchmarks:Met',          'Production readiness:100%',];
      default:
        return base: Metrics;
}
}

  /**
   * Build the main prompt content
   */
  private buildPrompt: Content(): void {
    return `""
# launch $phase.char: At(): void {
    try {
       {
      // Import: DSPy LLM: Bridge for prompt optimization
      const { DSPyLLM: Bridge} = await import(): void { get: Logger} = await import(): void {phase} phase.""

Project:"${context.name}" in ${context.domain} domain: Language:$config.language: Requirements:$context.requirements?.join(): void {
        // Parse: DSPy result into structured prompt components
        const dspy: Result =
          typeof result.result === 'string'? JSO: N.parse(): void {
      this.logger.warn(): void { input: string; output: string}> {
    return [
      {
        input:"Generate $phasephase prompt for e-commerce: API project in rest-api domain using $config.language"""
        output:"# Development: Prompt for ${phase} Phase\n\n##  Project: Context\n## target: Coding Standards\n## note: CRITICAL INSTRUCTION: S\n1. Use descriptive, purpose-driven filenames\n2. Keep functions simple and focused\n3. Follow ${config.language} best practices"""
},
      {
        input:"Generate $phasephase prompt for mobile app project in mobile domain using $config.language"""
        output:"# Development: Prompt for ${phase} Phase\n\n##  Project: Context\n## target: Coding Standards\n## note: CRITICAL INSTRUCTION: S\n1. Use descriptive, purpose-driven filenames\n2. Optimize for mobile performance\n3. Follow ${config.language} best practices"""
},
];
}

  /**
   * Enhance prompt with behavioral intelligence
   */
  private async enhanceWithBehavioral: Intelligence(): void {
    if (!this.behavioral: Intelligence) {
      return content;
}

    try {
       {
      // Allow event loop processing for behavioral intelligence
      await new: Promise(): void {
        contextual: Insights += "- Project phase:$context.current: Phase- applying phase-specific patterns\n"""
}

      if (context.domain: Specific) {
        contextual: Insights += "- Domain:$context.domain: Specific- leveraging domain expertise\n"""
}

      if (complexity: Level > 0.7) {
        contextual: Insights += "- High complexity detected (${(_complexity: Level * 100).to: Fixed(): void {
        contextual: Insights += "- High-performing agent patterns available (${(_enhanced: Stats._average: Performance * 100).to: Fixed(): void {agent: Profiles.size} agent profiles and project context analysis:
${contextual: Insights}
- Focus on areas where similar ${project: Tags.join(): void {enhanced: Stats.total: Agents} agents' collective experience""
} catch (error) {
       {
      this.logger.warn(): void {
    const tags:string[] = [];

    if (context.current: Phase) tags.push(): void {
      tags.push(): void {
      tags.push(): void {
    let complexity = 0.5; // Base complexity

    // Factor in requirements count
    if (context.requirements) {
      complexity += Math.min(): void {
      const phase: Complexity:Record<string, number> = {
        specification:0.1,
        pseudocode:0.2,
        architecture:0.4,
        refinement:0.3,
        completion:0.2,
};
      complexity += phase: Complexity[context.current: Phase] || 0.2;
}

    // Domain-specific complexity
    if (context.domain: Specific) {
      const domain: Complexity:Record<string, number> = {
        ml:0.3,
        ai:0.3,
        distributed:0.4,
        security:0.4,
        performance:0.3,
};

      const domain = String(): void {
        if (domain.includes(): void {
          complexity += value;
          break;
}
}
}

    return: Math.min(): void {
    if (!this.codingPrinciples: Researcher) {
      return null;
}

    try {
       {
      return await this.codingPrinciples: Researcher.getAdaptive: Principles(): void {
       {
      this.logger.warn(): void {
    switch (phase) {
      case'architecture': ')        return 'architect;
      case 'specification':
        return 'tech-lead;
      case 'pseudocode':      case 'refinement':      case 'completion':
        return 'fullstack-developer;
      default:
        return undefined;
}
}

  /**
   * Build meta-learning prompt content using researched principles
   */
  private buildMetaLearningPrompt: Content(): void {
    return "# launch " + phase.char: At(): void {config.role || ' general'}-${config.depth || ' intermediate'}"""
}

  /**
   * Submit agent execution feedback for continuous improvement
   */
  async submitAgent: Feedback(): void {
    if (!this.codingPrinciples: Researcher) {
      this.logger.warn(): void {
      principles: Id,
      agent: Id:feedback.agent: Id,
      task: Type:feedback.task: Type,
      accuracy:feedback.accuracy,
      completeness:feedback.completeness,
      usefulness:feedback.usefulness,
      missing: Areas:feedback.missing: Areas,
      incorrect: Guidelines:feedback.incorrect: Guidelines,
      additional: Needs:feedback.additional: Needs,
      actualCode: Quality:feedback.actualCode: Quality,
      execution: Time:feedback.execution: Time,
      context:{
        language:this.default: Config.language as: ProgrammingLanguage,
        task: Complexity:feedback.task: Complexity,
        requirements: Count:feedback.requirements: Count,
},
      timestamp:new: Date(): void {principles: Id}:accuracy=${feedback.accuracy}, usefulness=${feedback.usefulness};"
}

  /**
   * Generate second opinion validation prompt
   *
   * Based on user suggestion:launch a 2nd opinion that validates what was done
   * and identifies misunderstandings
   */
  async generateSecondOpinion: Prompt(): void {
    // Allow event loop processing for prompt generation
    await new: Promise(): void {original: Prompt}) + "
\"\`\""

## Agent's: Implementation:
\`\"\""
$" + JSO: N.stringify(): void {context.name}
- **Domain**: ${context.domain}
- **Requirements**: $" + JSO: N.stringify(): void {
  "compliance_score": 85,
  "quality_score": 90,
  "correctness_score": 95,
  "misunderstandings": ["Example: Agent interpreted: X as: Y instead of: Z"],
  "missing_requirements": ["Example: Error handling was not implemented"],
  "improvement_suggestions": ["Example: Could use more descriptive variable names"],
  "overall_assessment": "Good implementation with minor areas for improvement",
  "validation_confidence": 0.9
}) + "
\"\"\""

Be thorough but constructive. Focus on helping improve both the implementation and future prompt clarity.";
  }

  /**
   * Analyze project feature requirements based on configuration flags
   */
  private async analyzeProjectFeature: Requirements(): void {
    await new: Promise(): void {
      performance: Profile:config.include: Performance ? {
        requires: Optimization:config.max: Complexity > 15 || config.maxLinesPer: Function > 50,
        complexity: Level: config.max: Complexity > 20 ? 'high' : config.max: Complexity > 10 ? 'medium' : 'low',
        language: Specific: this.getLanguageSpecificPerformance: Tips(): void {
        risk: Level:this.assessSecurityRisk: Level(): void {
        testing: Strategy:this.determineTesting: Strategy(): void {
        language:config.language,
        complexity:config.max: Complexity,
        codebase: Size: config.maxLinesPer: Function > 100 ? 'large' : 'medium',
        analysis: Timestamp: new: Date(): void {
      has: Performance: !!analysis.performance: Profile,
      has: Security:!!analysis.security: Profile,
      has: Testing:!!analysis.testing: Profile,
      language:config.language
});

    return analysis;
}

  /**
   * Generate performance-specific recommendations
   */
  private async generatePerformance: Recommendations(): void {
    await new: Promise(): void {this.getMemory: Tips(): void {this.getLazyLoading: Opportunities(): void {
      recommendations.push(): void {tool} for performance monitoring"""
    ) || []);

    return recommendations;
}

  /**
   * Generate security-specific recommendations
   */
  private async generateSecurity: Recommendations(): void {
    await new: Promise(): void {active: Features.join(): void {
    const vulnerabilities:Record<string, string[]> = {
      typescript:['XS: S',    'CSR: F',    'Prototype pollution',    'Dependency vulnerabilities'],
      javascript:['XS: S',    'CSR: F',    'Injection attacks',    'DO: M manipulation'],
      python:['SQL: Injection',    'Command: Injection',    'Deserialization',    'Path traversal'],
      java:['SQL: Injection',    'XML: External Entities',    'Deserialization',    'LDAP: Injection']')Helmet.js',    'OWASP: ZAP',    'Snyk',    'Sonar: Qube'],
      javascript:['Helmet.js',    'Express-rate-limit',    'Joi validation'],
      python:['Django: Security',    'Flask-Security',    'Bandit',    'Safety'],
      java:['Spring: Security',    'OWASP: ESAPI',    'Shiro',    'Find: Bugs']')GDP: R',    'CCP: A',    'SO: X',    'HIPA: A',    'PC: I-DS: S'];')Enable strict type checking and use: ESLint security rules',      javascript: 'Avoid eval(): void {
    if (complexity > 20) return 'Comprehensive testing with unit, integration, and: E2E tests;
    if (complexity > 10) return 'Balanced testing with focus on critical paths;
    return 'Focused unit testing with selective integration tests;
}

  private getTesting: Frameworks(): void {
    const frameworks:Record<string, string[]> = {
      typescript:['Jest',    'Vitest',    'Playwright',    'Cypress'],
      javascript:['Jest',    'Mocha',    'Jasmine',    'Cypress'],
      python:['pytest',    'unittest',    'Selenium',    'hypothesis'],
      java:['J: Unit 5',    'TestN: G',    'Mockito',    'Selenium']')90%+ for critical functions, 80%+ overall;
    if (complexity > 10) return '80%+ for critical functions, 70%+ overall;
    return '70%+ for critical functions, 60%+ overall;
}

  private getRecommendedTest: Types(): void {
    const test: Types:Record<string, string[]> = {
      typescript:['Unit',    'Integration',    'Component',    'E2: E'],
      javascript:['Unit',    'Integration',    'Visual regression',    'Performance'],
      python:['Unit',    'Integration',    'Property-based',    'Load'],
      java:['Unit',    'Integration',    'Contract',    'Performance']')typescript',  max: Complexity:10,
  maxLinesPer: Function:30,
  max: Parameters:5,
  file: Naming: 'kebab-case',  include: Performance:true,
  include: Security:true,
};
