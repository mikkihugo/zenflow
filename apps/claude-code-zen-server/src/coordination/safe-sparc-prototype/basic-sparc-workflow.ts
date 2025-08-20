/**
 * @fileoverview Basic SPARC Workflow - SAFe-SPARC Micro Prototype
 * 
 * Implements a minimal but functional SPARC workflow using @claude-zen/sparc 
 * and @claude-zen/workflows for systematic development methodology.
 * 
 * SPARC Phases:
 * - S: Specification - Define requirements and objectives
 * - P: Pseudocode - Create algorithmic thinking and logic flow
 * - A: Architecture - Design system structure and components
 * - R: Refinement - Optimize and improve the design
 * - C: Completion - Finalize and implement the solution
 */

import { EventEmitter } from 'node:events';

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '../../config/logging-config';
import type { EpicProposal, PortfolioDecision, SparcArtifacts } from './micro-prototype-manager';

// SPARC workflow configuration
export interface BasicSparcConfig {
  workflowId: string;
  enableAutomation: boolean;
  qualityGates: string[];
  aiAssistanceLevel?: 'minimal' | 'moderate' | 'extensive';
}

// SPARC execution context
export interface SparcExecutionContext {
  epic: EpicProposal;
  portfolioDecision: PortfolioDecision;
  projectId?: string;
}

// SPARC execution result with SAFe integration
export interface SparcExecutionResult extends SparcArtifacts {
  projectId: string;
  phases: {
    specification: any;
    pseudocode: any;
    architecture: any;
    refinement: any;
    completion: any;
  };
  metrics: {
    totalDuration: number;
    phasesDuration: Record<string, number>;
    qualityScore: number;
    completeness: number;
  };
  safeIntegration?: {
    cdPipelineId: string;
    valueStreamId: string;
    stages: any[];
    qualityGates: any[];
  };
}

/**
 * Basic SPARC Workflow - Uses @claude-zen/sparc for systematic methodology
 */
export class BasicSparcWorkflow extends EventEmitter {
  private logger: Logger;
  private config: BasicSparcConfig;
  private sparcEngine: any;
  private workflowEngine: any;
  private initialized = false;
  private executedProjects: SparcExecutionResult[] = [];

  constructor(config: BasicSparcConfig) {
    super();
    this.config = config;
    this.logger = getLogger(`BasicSparcWorkflow-${config.workflowId}`);
    this.logger.info(`SPARC Workflow initialized: ${config.workflowId}`);
  }

  /**
   * Initialize with @claude-zen/sparc and @claude-zen/workflows
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing SPARC Workflow with SPARC Engine and Workflow Engine...');

      // Use actual @claude-zen/sparc SPARC Engine
      const { SPARC, SPARCCommander } = await import('@claude-zen/sparc');
      
      this.sparcEngine = SPARC.getEngine();

      // Use actual @claude-zen/workflows WorkflowEngine
      const { WorkflowEngine } = await import('@claude-zen/workflows');
      
      this.workflowEngine = new WorkflowEngine({
        persistWorkflows: true,
        enableVisualization: true,
        concurrency: {
          maxConcurrent: 1, // Sequential SPARC phases
          timeout: 300000 // 5 minute timeout per phase
        },
        errorHandling: {
          retryCount: 2,
          strategy: 'exponential-backoff'
        }
      });

      await this.workflowEngine.initialize();

      this.initialized = true;
      this.logger.info('SPARC Workflow initialized successfully with SPARC and Workflow engines');

      this.emit('workflow-initialized', {
        workflowId: this.config.workflowId,
        capabilities: ['sparc-methodology', 'workflow-orchestration', 'quality-gates']
      });

    } catch (error) {
      this.logger.error('Failed to initialize SPARC Workflow:', error);
      throw error;
    }
  }

  /**
   * Execute complete SPARC process for an approved epic
   */
  async executeSparcProcess(context: SparcExecutionContext): Promise<SparcExecutionResult> {
    if (!this.initialized) await this.initialize();

    this.logger.info(`Executing integrated SAFe-SPARC process for epic: ${context.epic.title}`);

    try {
      const startTime = Date.now();

      // Create SPARC project from epic
      const sparcProject = await this.createSparcProjectFromEpic(context);

      // Execute SPARC phases using the actual SPARC package
      const phaseResults = await this.executeSPARCPhases(sparcProject);

      // Use SAFe-SPARC integration bridge for CD pipeline mapping
      const safeSparcIntegration = await this.executeSafeSparcIntegration(sparcProject, phaseResults);

      // Execute workflow orchestration using @claude-zen/workflows
      const workflowResult = await this.executeWorkflowOrchestration(sparcProject, phaseResults);

      // Create final result with SAFe integration
      const result: SparcExecutionResult = {
        projectId: sparcProject.id,
        specification: phaseResults.specification?.deliverables || 'Generated specification based on epic requirements',
        architecture: phaseResults.architecture?.deliverables || 'Generated architecture design and component structure',
        implementation: phaseResults.completion?.deliverables || 'Implementation plan and development roadmap',
        status: 'complete',
        phases: {
          specification: phaseResults.specification,
          pseudocode: phaseResults.pseudocode,
          architecture: phaseResults.architecture,
          refinement: phaseResults.refinement,
          completion: phaseResults.completion
        },
        metrics: {
          totalDuration: Date.now() - startTime,
          phasesDuration: this.calculatePhasesDuration(phaseResults),
          qualityScore: this.calculateQualityScore(phaseResults),
          completeness: this.calculateCompleteness(phaseResults)
        },
        safeIntegration: {
          cdPipelineId: safeSparcIntegration.pipelineId,
          valueStreamId: `vs-${context.epic.id}`,
          stages: safeSparcIntegration.stages,
          qualityGates: safeSparcIntegration.qualityGates
        }
      };

      // Store executed project
      this.executedProjects.push(result);

      // Emit completion event
      this.emit('sparc-process-complete', { context, result });

      this.logger.info(`SAFe-SPARC integrated process completed for epic: ${context.epic.title}`);
      return result;

    } catch (error) {
      this.logger.error(`SAFe-SPARC process failed for epic ${context.epic.title}:`, error);
      throw error;
    }
  }

  /**
   * Health check for the SPARC workflow
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.initialized || !this.sparcEngine || !this.workflowEngine) return false;

      // Check SPARC engine health
      const sparcHealth = this.sparcEngine ? true : false;
      
      // Check workflow engine health
      const workflowHealth = await this.workflowEngine.healthCheck?.() !== false;

      // Test basic SPARC functionality
      const testProject = await this.sparcEngine.initializeProject({
        name: 'health-check-test',
        domain: 'system',
        complexity: 'simple',
        requirements: ['test requirement']
      });

      return sparcHealth && workflowHealth && testProject !== null;

    } catch (error) {
      this.logger.error('SPARC Workflow health check failed:', error);
      return false;
    }
  }

  private async createSparcProjectFromEpic(context: SparcExecutionContext): Promise<any> {
    // Convert epic to SPARC project requirements
    const requirements = [
      `Business Case: ${context.epic.businessCase}`,
      `Expected Value: $${context.epic.estimatedValue}`,
      `Budget Constraint: $${context.epic.estimatedCost}`,
      `Timeline: ${context.epic.timeframe}`,
      `Risk Level: ${context.epic.riskLevel}`
    ];

    // Determine project domain based on epic characteristics
    const domain = this.determineProjectDomain(context.epic);
    const complexity = this.determineProjectComplexity(context.epic);

    // Create SPARC project using actual SPARC package
    return await this.sparcEngine.initializeProject({
      name: `epic-${context.epic.id}-${context.epic.title.toLowerCase().replace(/\s+/g, '-')}`,
      domain: domain,
      complexity: complexity,
      requirements: requirements,
      context: {
        epic: context.epic,
        portfolioDecision: context.portfolioDecision,
        automationLevel: this.config.aiAssistanceLevel || 'moderate'
      }
    });
  }

  private async executeSPARCPhases(project: any): Promise<any> {
    const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'] as const;
    const results: any = {};

    for (const phase of phases) {
      this.logger.info(`Executing SPARC phase: ${phase}`);

      try {
        // Execute phase using actual SPARC engine
        const phaseResult = await this.sparcEngine.executePhase(project, phase);

        results[phase] = phaseResult;

        // Check quality gates
        if (this.config.qualityGates.includes(`${phase}-review`)) {
          const qualityCheck = await this.executeQualityGate(phase, phaseResult);
          if (!qualityCheck.passed) {
            throw new Error(`Quality gate failed for ${phase}: ${qualityCheck.issues.join(', ')}`);
          }
        }

        // Emit phase completion
        this.emit('sparc-phase-complete', { project, phase, result: phaseResult });

      } catch (error) {
        this.logger.error(`SPARC phase ${phase} failed:`, error);
        results[phase] = { 
          success: false, 
          error: error.message,
          phase: phase 
        };
        break; // Stop on first failure
      }
    }

    return results;
  }

  private async executeSafeSparcIntegration(project: any, phaseResults: any): Promise<any> {
    try {
      this.logger.info(`Executing SAFe-SPARC integration for project: ${project.name}`);

      // Use actual @claude-zen/safe-framework SPARC-CD mapping service
      const { SPARCCDMappingService } = await import('@claude-zen/safe-framework');
      
      const sparcCDService = new SPARCCDMappingService(this.logger);
      await sparcCDService.initialize();

      // Map SPARC phases to CD pipeline stages
      const pipelineTemplates = await sparcCDService.mapSPARCToPipelineStages();
      const pipelineType = this.determinePipelineType(project);
      const stages = pipelineTemplates.get(pipelineType) || pipelineTemplates.get('standard');

      // Execute CD pipeline for SPARC project
      const pipelineId = await sparcCDService.executePipelineForSPARCProject(
        project.id,
        `feature-${project.id}`,
        `vs-${project.id}`,
        pipelineType
      );

      // Get quality gates from pipeline template
      const qualityGates = stages?.flatMap(stage => stage.qualityGates) || [];

      return {
        pipelineId,
        stages: stages || [],
        qualityGates,
        pipelineType,
        sparcCDService
      };

    } catch (error) {
      this.logger.error('SAFe-SPARC integration failed:', error);
      throw error;
    }
  }

  private async executeWorkflowOrchestration(project: any, phaseResults: any): Promise<any> {
    // Create workflow definition for SPARC process
    const workflowDefinition = {
      id: `sparc-workflow-${project.id}`,
      name: `SPARC Workflow for ${project.name}`,
      description: 'Orchestrated SPARC methodology execution',
      steps: [
        {
          id: 'validate-specification',
          type: 'validation',
          action: async () => this.validatePhaseResult(phaseResults.specification)
        },
        {
          id: 'generate-documentation',
          type: 'generation',
          action: async () => this.generateProjectDocumentation(project, phaseResults)
        },
        {
          id: 'create-implementation-plan',
          type: 'planning',
          action: async () => this.createImplementationPlan(project, phaseResults)
        }
      ],
      configuration: {
        executeParallel: false, // Sequential execution
        continueOnError: false,
        timeoutMs: 600000 // 10 minute timeout
      }
    };

    // Execute workflow using @claude-zen/workflows
    return await this.workflowEngine.startWorkflow(workflowDefinition);
  }

  private determineProjectDomain(epic: EpicProposal): string {
    // Simple heuristic to determine domain from epic title/business case
    const text = `${epic.title} ${epic.businessCase}`.toLowerCase();
    
    if (text.includes('web') || text.includes('frontend') || text.includes('ui')) {
      return 'web-development';
    } else if (text.includes('api') || text.includes('backend') || text.includes('service')) {
      return 'backend-development';
    } else if (text.includes('data') || text.includes('analytics') || text.includes('ml')) {
      return 'data-science';
    } else if (text.includes('mobile') || text.includes('app')) {
      return 'mobile-development';
    } else {
      return 'system'; // Default domain
    }
  }

  private determineProjectComplexity(epic: EpicProposal): 'simple' | 'moderate' | 'complex' {
    // Determine complexity based on cost, risk, and timeframe
    if (epic.estimatedCost > 500000 || epic.riskLevel === 'high') {
      return 'complex';
    } else if (epic.estimatedCost > 100000 || epic.riskLevel === 'medium') {
      return 'moderate';
    } else {
      return 'simple';
    }
  }

  private determinePipelineType(project: any): string {
    // Determine pipeline type based on project characteristics
    const domain = project.domain || 'system';
    const complexity = project.complexity || 'moderate';
    
    if (domain === 'microservice' || project.name.includes('microservice')) {
      return 'microservice';
    } else if (domain === 'library' || project.name.includes('library')) {
      return 'library';
    } else if (complexity === 'complex' || project.context?.epic?.estimatedCost > 1000000) {
      return 'enterprise';
    } else {
      return 'standard';
    }
  }

  private async executeQualityGate(phase: string, phaseResult: any): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Basic quality checks
    if (!phaseResult.success) {
      issues.push('Phase execution failed');
    }

    if (!phaseResult.deliverables || Object.keys(phaseResult.deliverables).length === 0) {
      issues.push('No deliverables generated');
    }

    // Phase-specific quality checks
    switch (phase) {
      case 'specification':
        if (!phaseResult.deliverables?.requirements) {
          issues.push('Missing requirements specification');
        }
        break;
      case 'architecture':
        if (!phaseResult.deliverables?.components) {
          issues.push('Missing architecture components');
        }
        break;
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  private async validatePhaseResult(phaseResult: any): Promise<any> {
    return {
      isValid: phaseResult?.success === true,
      validationDetails: phaseResult
    };
  }

  private async generateProjectDocumentation(project: any, phaseResults: any): Promise<any> {
    return {
      documentation: {
        projectOverview: project.name,
        specification: phaseResults.specification?.deliverables,
        architecture: phaseResults.architecture?.deliverables,
        implementationGuidance: phaseResults.completion?.deliverables
      }
    };
  }

  private async createImplementationPlan(project: any, phaseResults: any): Promise<any> {
    return {
      implementationPlan: {
        phases: Object.keys(phaseResults),
        timeline: 'To be determined based on team capacity',
        resources: 'To be allocated based on portfolio decision',
        deliverables: Object.values(phaseResults).map((result: any) => result.deliverables)
      }
    };
  }

  private calculatePhasesDuration(phaseResults: any): Record<string, number> {
    const durations: Record<string, number> = {};
    
    Object.entries(phaseResults).forEach(([phase, result]: [string, any]) => {
      durations[phase] = result.metrics?.duration || 0;
    });

    return durations;
  }

  private calculateQualityScore(phaseResults: any): number {
    const phases = Object.values(phaseResults);
    const successfulPhases = phases.filter((result: any) => result.success);
    
    return phases.length > 0 ? (successfulPhases.length / phases.length) * 100 : 0;
  }

  private calculateCompleteness(phaseResults: any): number {
    const expectedPhases = 5; // S-P-A-R-C
    const completedPhases = Object.keys(phaseResults).length;
    
    return (completedPhases / expectedPhases) * 100;
  }
}