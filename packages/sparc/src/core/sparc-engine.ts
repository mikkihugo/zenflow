/**
 * @fileoverview SPARC Engine
 * 
 * Core SPARC methodology implementation.
 */

import { getLogger } from '@claude-zen/foundation';
import type { 
  SPARCProject, 
  SPARCPhase, 
  PhaseResult,
  ProjectDomain,
  ProjectComplexity,
  SPARCProgress,
  ImplementationFile,
  TestSuite,
  DocumentationFile
} from '../types';

const logger = getLogger('sparc-engine');

export interface SPARCEngineConfig {
  defaultTimeout: number;
  enableMetrics: boolean;
  maxProjects: number;
}

export class SPARCEngineCore {
  private config: SPARCEngineConfig;
  private projects: Map<string, SPARCProject> = new Map();
  private phaseHandlers: Map<SPARCPhase, (project: SPARCProject) => Promise<PhaseResult>> = new Map();

  constructor(config: Partial<SPARCEngineConfig> = {}) {
    this.config = {
      defaultTimeout: 300000, // 5 minutes
      enableMetrics: true,
      maxProjects: 100,
      ...config
    };
    
    this.initializePhaseHandlers();
  }

  /**
   * Initialize phase handlers.
   */
  private initializePhaseHandlers(): void {
    this.phaseHandlers.set('specification', this.handleSpecificationPhase.bind(this));
    this.phaseHandlers.set('pseudocode', this.handlePseudocodePhase.bind(this));
    this.phaseHandlers.set('architecture', this.handleArchitecturePhase.bind(this));
    this.phaseHandlers.set('refinement', this.handleRefinementPhase.bind(this));
    this.phaseHandlers.set('completion', this.handleCompletionPhase.bind(this));
  }

  /**
   * Initialize a new SPARC project.
   */
  async initializeProject(params: {
    name: string;
    domain: ProjectDomain;
    complexity: ProjectComplexity;
    requirements: string[];
  }): Promise<SPARCProject> {
    const projectId = `sparc-${Date.now()}`;
    
    const project: SPARCProject = {
      id: projectId,
      name: params.name,
      domain: params.domain,
      complexity: params.complexity,
      requirements: params.requirements,
      currentPhase: 'specification',
      progress: this.initializeProgress(),
      metadata: {
        created: Date.now(),
        estimatedDuration: this.estimateProjectDuration(params.complexity)
      }
    };

    this.projects.set(projectId, project);
    logger.info(`Initialized SPARC project: ${projectId}`);
    
    return project;
  }

  /**
   * Initialize project progress.
   */
  private initializeProgress(): SPARCProgress {
    return {
      phasesCompleted: [],
      currentPhaseProgress: 0,
      overallProgress: 0,
      estimatedCompletion: Date.now() + (5 * 60 * 60 * 1000), // 5 hours
      timeSpent: {
        specification: 0,
        pseudocode: 0,
        architecture: 0,
        refinement: 0,
        completion: 0
      }
    };
  }

  /**
   * Estimate project duration based on complexity.
   */
  private estimateProjectDuration(complexity: ProjectComplexity): number {
    const durationMap: Record<ProjectComplexity, number> = {
      simple: 2 * 60, // 2 hours
      moderate: 5 * 60, // 5 hours
      high: 8 * 60, // 8 hours
      complex: 16 * 60, // 16 hours
      enterprise: 32 * 60 // 32 hours
    };
    return durationMap[complexity];
  }

  /**
   * Execute a SPARC phase.
   */
  async executePhase(project: SPARCProject, phase: SPARCPhase): Promise<PhaseResult> {
    const startTime = Date.now();
    logger.info(`Executing ${phase} phase for project ${project.id}`);

    try {
      const handler = this.phaseHandlers.get(phase);
      if (!handler) {
        throw new Error(`No handler found for phase: ${phase}`);
      }

      const result = await handler(project);
      
      // Update project progress
      project.currentPhase = this.getNextPhase(phase);
      project.progress.phasesCompleted.push(phase);
      project.progress.timeSpent[phase] = Date.now() - startTime;
      project.progress.currentPhaseProgress = 0;
      project.progress.overallProgress = this.calculateOverallProgress(project);

      return result;
    } catch (error) {
      logger.error(`Failed to execute ${phase} phase:`, error);
      return {
        phase,
        success: false,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get next phase in sequence.
   */
  private getNextPhase(currentPhase: SPARCPhase): SPARCPhase {
    const phases: SPARCPhase[] = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
    const currentIndex = phases.indexOf(currentPhase);
    return phases[currentIndex + 1] || 'completion';
  }

  /**
   * Calculate overall progress.
   */
  private calculateOverallProgress(project: SPARCProject): number {
    const totalPhases = 5;
    const completedPhases = project.progress.phasesCompleted.length;
    return Math.min(completedPhases / totalPhases, 1.0);
  }

  /**
   * Handle specification phase.
   */
  private async handleSpecificationPhase(project: SPARCProject): Promise<PhaseResult> {
    logger.info(`Processing specification for ${project.name}`);
    
    // Mock specification processing
    project.specification = {
      goals: project.requirements.map(req => `Implement ${req}`),
      scope: `${project.domain} project with ${project.complexity} complexity`,
      constraints: ['Time constraints', 'Resource limitations'],
      stakeholders: ['Development team', 'End users'],
      successCriteria: ['All requirements met', 'System is functional', 'Tests pass']
    };

    return {
      phase: 'specification',
      success: true,
      data: project.specification,
      duration: 1500, // 1.5 seconds
      timestamp: Date.now()
    };
  }

  /**
   * Handle pseudocode phase.
   */
  private async handlePseudocodePhase(project: SPARCProject): Promise<PhaseResult> {
    logger.info(`Processing pseudocode for ${project.name}`);
    
    // Mock pseudocode processing
    project.pseudocode = {
      algorithms: [],
      dataStructures: [],
      workflows: []
    };

    return {
      phase: 'pseudocode',
      success: true,
      data: project.pseudocode,
      duration: 2000, // 2 seconds
      timestamp: Date.now()
    };
  }

  /**
   * Handle architecture phase with Claude SDK assistance.
   */
  private async handleArchitecturePhase(project: SPARCProject): Promise<PhaseResult> {
    logger.info(`Processing architecture for ${project.name}`);
    
    const startTime = Date.now();

    try {
      // Import Claude SDK for architecture design
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const architecturePrompt = this.buildArchitecturePrompt(project);
      
      // Use Claude SDK for architecture design
      const claudeMessages = await executeClaudeTask(architecturePrompt, {
        model: 'sonnet',
        maxTurns: 2,
        customSystemPrompt: 'You are Claude Code designing software architecture using SPARC methodology.',
        allowedTools: ['Write'],
        permissionMode: 'acceptEdits',
        timeoutMs: 90000 // 90 seconds for architecture design
      });

      // Extract architecture design from Claude response
      const architectureData = this.extractArchitectureFromMessages(claudeMessages);

      project.architecture = {
        components: architectureData.components || [],
        relationships: architectureData.relationships || [],
        patterns: architectureData.patterns || ['MVC', 'Repository Pattern'],
        technologies: architectureData.technologies || ['TypeScript', 'Node.js']
      };

      return {
        phase: 'architecture',
        success: true,
        data: project.architecture,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      logger.error(`Failed to generate architecture using Claude SDK:`, error);
      
      // Fallback to basic architecture
      project.architecture = {
        components: [],
        relationships: [],
        patterns: ['MVC', 'Repository Pattern'],
        technologies: ['TypeScript', 'Node.js']
      };

      return {
        phase: 'architecture',
        success: false,
        error: `Architecture generation failed: ${error instanceof Error ? error.message : String(error)}`,
        data: project.architecture,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Handle refinement phase.
   */
  private async handleRefinementPhase(project: SPARCProject): Promise<PhaseResult> {
    logger.info(`Processing refinements for ${project.name}`);
    
    // Mock refinement processing
    project.refinements = [{
      id: `refinement-${Date.now()}`,
      phase: 'refinement',
      description: 'Optimize algorithm performance',
      changes: ['Improved data structure', 'Reduced complexity'],
      impact: 'medium',
      timestamp: Date.now()
    }];

    return {
      phase: 'refinement',
      success: true,
      data: project.refinements,
      duration: 1800, // 1.8 seconds
      timestamp: Date.now()
    };
  }

  /**
   * Handle completion phase with real Claude SDK code generation.
   */
  private async handleCompletionPhase(project: SPARCProject): Promise<PhaseResult> {
    logger.info(`Processing completion for ${project.name}`);
    
    const startTime = Date.now();
    
    try {
      // Import Claude SDK from @claude-zen/foundation for real code generation
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const codeGenerationPrompt = this.buildCodeGenerationPrompt(project);
      
      // Use Claude SDK for actual code generation
      const claudeMessages = await executeClaudeTask(codeGenerationPrompt, {
        model: 'sonnet',
        maxTurns: 3,
        customSystemPrompt: 'You are Claude Code generating production-ready code using SPARC methodology.',
        allowedTools: ['Write', 'MultiEdit', 'Bash'],
        permissionMode: 'acceptEdits',
        timeoutMs: 120000 // 2 minutes for code generation
      });

      // Extract generated code artifacts from Claude messages
      const generatedFiles = this.extractGeneratedFiles(claudeMessages);
      const generatedTests = this.extractGeneratedTests(claudeMessages);
      const generatedDocs = this.extractGeneratedDocs(claudeMessages);

      project.implementation = {
        files: generatedFiles,
        tests: generatedTests,
        documentation: generatedDocs,
        deployment: {
          environment: 'development',
          platform: 'Node.js',
          requirements: ['Node.js >= 18', 'npm >= 8'],
          scripts: {
            build: 'npm run build',
            start: 'npm start',
            test: 'npm test'
          }
        }
      };

      return {
        phase: 'completion',
        success: true,
        data: project.implementation,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      logger.error(`Failed to generate code using Claude SDK:`, error);
      
      // Fallback to mock implementation if Claude SDK fails
      project.implementation = {
        files: [],
        tests: [],
        documentation: [],
        deployment: {
          environment: 'development',
          platform: 'Node.js',
          requirements: ['Node.js >= 18', 'npm >= 8'],
          scripts: {
            build: 'npm run build',
            start: 'npm start',
            test: 'npm test'
          }
        }
      };

      return {
        phase: 'completion',
        success: false,
        error: `Code generation failed: ${error instanceof Error ? error.message : String(error)}`,
        data: project.implementation,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get project by ID.
   */
  getProject(projectId: string): SPARCProject | undefined {
    return this.projects.get(projectId);
  }

  /**
   * List all projects.
   */
  listProjects(): SPARCProject[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get engine metrics.
   */
  getMetrics() {
    return {
      totalProjects: this.projects.size,
      maxProjects: this.config.maxProjects,
      averageProjectDuration: this.calculateAverageProjectDuration()
    };
  }

  /**
   * Calculate average project duration.
   */
  private calculateAverageProjectDuration(): number {
    const projects = Array.from(this.projects.values());
    if (projects.length === 0) return 0;

    const totalTime = projects.reduce((sum, project) => {
      const phaseTime = Object.values(project.progress.timeSpent).reduce((a, b) => a + b, 0);
      return sum + phaseTime;
    }, 0);

    return totalTime / projects.length;
  }

  /**
   * Build architecture design prompt for Claude SDK.
   */
  private buildArchitecturePrompt(project: SPARCProject): string {
    return `
Design comprehensive software architecture for the following SPARC project:

Project Name: ${project.name}
Domain: ${project.domain}
Complexity: ${project.complexity}
Requirements: ${project.requirements.join(', ')}

Specification:
${JSON.stringify(project.specification, null, 2)}

Please provide:
1. System components and their responsibilities
2. Component relationships and data flow
3. Architectural patterns to apply
4. Technology stack recommendations
5. Scalability considerations
6. Security architecture
7. Integration patterns
8. Database design

Return your architecture design as JSON with the following structure:
{
  "components": ["Component1", "Component2", ...],
  "relationships": ["Component1 -> Component2", ...],
  "patterns": ["Pattern1", "Pattern2", ...],
  "technologies": ["Tech1", "Tech2", ...]
}
`;
  }

  /**
   * Build code generation prompt for Claude SDK based on SPARC project.
   */
  private buildCodeGenerationPrompt(project: SPARCProject): string {
    return `
Generate production-ready code for the following SPARC project:

Project Name: ${project.name}
Domain: ${project.domain}
Complexity: ${project.complexity}
Requirements: ${project.requirements.join(', ')}

Specification:
${JSON.stringify(project.specification, null, 2)}

Architecture: 
${JSON.stringify(project.architecture, null, 2)}

Please generate:
1. Main application files (TypeScript/JavaScript)
2. Database models and schemas
3. API endpoints and routes
4. Business logic services
5. Unit and integration tests
6. README documentation
7. Package.json with dependencies
8. Docker configuration for deployment

Create a complete, working application that meets all the requirements.
Use modern patterns, proper error handling, and comprehensive testing.
Make it production-ready with proper structure and documentation.
`;
  }

  /**
   * Extract architecture data from Claude messages.
   */
  private extractArchitectureFromMessages(claudeMessages: any[]): any {
    for (const message of claudeMessages) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const content of message.message.content) {
          if (content.type === 'text' && content.text) {
            // Look for JSON architecture design in the response
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                return JSON.parse(jsonMatch[0]);
              } catch (error) {
                logger.warn('Failed to parse architecture JSON from Claude response:', error);
              }
            }
          }
        }
      }
    }
    
    // Fallback if no valid JSON found
    return {
      components: [],
      relationships: [],
      patterns: ['MVC', 'Repository Pattern'],
      technologies: ['TypeScript', 'Node.js']
    };
  }

  /**
   * Extract generated files from Claude messages.
   */
  private extractGeneratedFiles(claudeMessages: any[]): ImplementationFile[] {
    const files: ImplementationFile[] = [];
    
    for (const message of claudeMessages) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const content of message.message.content) {
          if (content.type === 'tool_use' && content.tool_use?.name === 'Write') {
            const filePath = content.tool_use.input.file_path;
            const fileContent = content.tool_use.input.content || '';
            if (filePath && !files.some(f => f.path === filePath)) {
              files.push({
                path: filePath,
                language: filePath.endsWith('.ts') ? 'typescript' : 'javascript',
                content: fileContent,
                dependencies: []
              });
            }
          }
        }
      }
    }
    
    return files;
  }

  /**
   * Extract generated test files from Claude messages.
   */
  private extractGeneratedTests(claudeMessages: any[]): TestSuite[] {
    const testSuites: TestSuite[] = [];
    
    for (const message of claudeMessages) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const content of message.message.content) {
          if (content.type === 'tool_use' && content.tool_use?.name === 'Write') {
            const filePath = content.tool_use.input.file_path;
            const fileContent = content.tool_use.input.content || '';
            if (filePath && (filePath.includes('test') || filePath.includes('spec')) && !testSuites.some(t => t.name === filePath)) {
              testSuites.push({
                name: filePath,
                type: filePath.includes('e2e') ? 'e2e' : filePath.includes('integration') ? 'integration' : 'unit',
                tests: [{
                  name: 'Generated test',
                  description: 'Test extracted from Claude messages',
                  code: fileContent,
                  expected: 'success'
                }]
              });
            }
          }
        }
      }
    }
    
    return testSuites;
  }

  /**
   * Extract generated documentation from Claude messages.
   */
  private extractGeneratedDocs(claudeMessages: any[]): DocumentationFile[] {
    const docFiles: DocumentationFile[] = [];
    
    for (const message of claudeMessages) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const content of message.message.content) {
          if (content.type === 'tool_use' && content.tool_use?.name === 'Write') {
            const filePath = content.tool_use.input.file_path;
            const fileContent = content.tool_use.input.content || '';
            if (filePath && (filePath.endsWith('.md') || filePath.includes('doc')) && !docFiles.some(d => d.name === filePath)) {
              docFiles.push({
                name: filePath,
                format: filePath.endsWith('.md') ? 'markdown' : 'html',
                content: fileContent
              });
            }
          }
        }
      }
    }
    
    return docFiles;
  }
}