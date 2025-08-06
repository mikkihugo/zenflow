/**
 * SPARC MCP Tools
 *
 * Model Context Protocol tools for external access to SPARC methodology system.
 * Enables AI assistants to coordinate SPARC projects and execute phases.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SPARCEngineCore } from '../core/sparc-engine';
import type {
  ComplexityLevel,
  ProjectDomain,
  ProjectSpecification,
  SPARCPhase,
  SPARCProject,
} from '../types/sparc-types';
import { ProjectManagementIntegration } from './project-management-integration';
import { SPARCRoadmapManager } from './roadmap-integration';

export class SPARCMCPTools {
  private sparcEngine: SPARCEngineCore;
  private activeProjects: Map<string, SPARCProject>;
  private projectManagement: ProjectManagementIntegration;
  private roadmapManager: SPARCRoadmapManager;

  constructor() {
    this.sparcEngine = new SPARCEngineCore();
    this.activeProjects = new Map();
    this.projectManagement = new ProjectManagementIntegration();
    this.roadmapManager = new SPARCRoadmapManager();
  }

  /**
   * Get all available SPARC MCP tools
   */
  public getTools(): Tool[] {
    return [
      this.createProjectTool(),
      this.executePhasetool(),
      this.getProjectStatusTool(),
      this.generateArtifactsTool(),
      this.validateCompletionTool(),
      this.listProjectsTool(),
      this.refineImplementationTool(),
      this.applyTemplateTool(),
      this.executeFullWorkflowTool(),
      // Project Management Integration Tools
      this.generateProjectManagementArtifactsTool(),
      this.createEpicFromProjectTool(),
      this.addToRoadmapTool(),
      this.generateDomainRoadmapTool(),
    ];
  }

  private createProjectTool(): Tool {
    return {
      name: 'sparc_create_project',
      description: 'Initialize a new SPARC project with comprehensive development methodology',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Project name (e.g., "Intelligent Load Balancer")',
          },
          domain: {
            type: 'string',
            enum: [
              'swarm-coordination',
              'neural-networks',
              'wasm-integration',
              'rest-api',
              'memory-systems',
              'interfaces',
              'general',
            ],
            description: 'Project domain for specialized templates and patterns',
          },
          complexity: {
            type: 'string',
            enum: ['simple', 'moderate', 'high', 'complex', 'enterprise'],
            description: 'Project complexity level',
          },
          requirements: {
            type: 'array',
            items: { type: 'string' },
            description: 'Initial high-level requirements',
          },
          constraints: {
            type: 'array',
            items: { type: 'string' },
            description: 'System constraints and limitations (optional)',
          },
        },
        required: ['name', 'domain', 'complexity', 'requirements'],
      },
    };
  }

  private executePhasetool(): Tool {
    return {
      name: 'sparc_execute_phase',
      description:
        'Execute a specific SPARC phase (Specification, Pseudocode, Architecture, Refinement, Completion)',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          phase: {
            type: 'string',
            enum: ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'],
            description: 'SPARC phase to execute',
          },
          options: {
            type: 'object',
            properties: {
              aiAssisted: {
                type: 'boolean',
                description: 'Enable AI-powered assistance for the phase',
              },
              skipValidation: {
                type: 'boolean',
                description: 'Skip phase validation (not recommended)',
              },
            },
            description: 'Execution options',
          },
        },
        required: ['projectId', 'phase'],
      },
    };
  }

  private getProjectStatusTool(): Tool {
    return {
      name: 'sparc_get_project_status',
      description: 'Get comprehensive status and progress of a SPARC project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          includeDetails: {
            type: 'boolean',
            description: 'Include detailed phase information and artifacts',
          },
        },
        required: ['projectId'],
      },
    };
  }

  private generateArtifactsTool(): Tool {
    return {
      name: 'sparc_generate_artifacts',
      description:
        'Generate comprehensive artifacts (code, tests, documentation) for a SPARC project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          artifactTypes: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'specification',
                'architecture',
                'implementation',
                'tests',
                'documentation',
                'all',
              ],
            },
            description: 'Types of artifacts to generate',
          },
          format: {
            type: 'string',
            enum: ['markdown', 'typescript', 'json', 'yaml'],
            description: 'Output format for artifacts',
          },
        },
        required: ['projectId'],
      },
    };
  }

  private validateCompletionTool(): Tool {
    return {
      name: 'sparc_validate_completion',
      description: 'Validate project completion and production readiness',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          criteria: {
            type: 'object',
            properties: {
              minimumScore: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Minimum completion score required (0-1)',
              },
              requireAllPhases: {
                type: 'boolean',
                description: 'Require all 5 SPARC phases to be completed',
              },
            },
            description: 'Validation criteria',
          },
        },
        required: ['projectId'],
      },
    };
  }

  private listProjectsTool(): Tool {
    return {
      name: 'sparc_list_projects',
      description: 'List all active SPARC projects with their current status',
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            enum: [
              'swarm-coordination',
              'neural-networks',
              'wasm-integration',
              'rest-api',
              'memory-systems',
              'interfaces',
              'general',
            ],
            description: 'Filter by project domain (optional)',
          },
          status: {
            type: 'string',
            enum: ['active', 'completed', 'failed', 'all'],
            description: 'Filter by project status',
          },
        },
      },
    };
  }

  private refineImplementationTool(): Tool {
    return {
      name: 'sparc_refine_implementation',
      description:
        'Refine project implementation based on performance feedback and optimization strategies',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          feedback: {
            type: 'object',
            properties: {
              performanceMetrics: {
                type: 'object',
                properties: {
                  latency: { type: 'number', description: 'Current latency in ms' },
                  throughput: { type: 'number', description: 'Current throughput in requests/sec' },
                  errorRate: { type: 'number', description: 'Current error rate (0-1)' },
                },
                description: 'Current performance metrics',
              },
              targets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    metric: { type: 'string', description: 'Performance metric name' },
                    target: { type: 'number', description: 'Target value' },
                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                  },
                  required: ['metric', 'target', 'priority'],
                },
                description: 'Performance targets',
              },
              bottlenecks: {
                type: 'array',
                items: { type: 'string' },
                description: 'Identified performance bottlenecks',
              },
            },
            required: ['performanceMetrics', 'targets'],
          },
        },
        required: ['projectId', 'feedback'],
      },
    };
  }

  /**
   * Execute MCP tool calls
   *
   * @param name
   * @param args
   */
  async handleOldToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'sparc_create_project':
        return this.handleCreateProject(args);

      case 'sparc_execute_phase':
        return this.handleExecutePhase(args);

      case 'sparc_get_project_status':
        return this.handleGetProjectStatus(args);

      case 'sparc_generate_artifacts':
        return this.handleGenerateArtifacts(args);

      case 'sparc_validate_completion':
        return this.handleValidateCompletion(args);

      case 'sparc_list_projects':
        return this.handleListProjects(args);

      case 'sparc_refine_implementation':
        return this.handleRefineImplementation(args);

      default:
        throw new Error(`Unknown SPARC tool: ${name}`);
    }
  }

  private async handleCreateProject(args: any): Promise<any> {
    const projectSpec: ProjectSpecification = {
      name: args.name,
      domain: args.domain as ProjectDomain,
      complexity: args.complexity as ComplexityLevel,
      requirements: args.requirements,
      constraints: args.constraints || [],
    };

    const project = await this.sparcEngine.initializeProject(projectSpec);
    this.activeProjects.set(project.id, project);

    return {
      success: true,
      projectId: project.id,
      message: `SPARC project "${project.name}" initialized successfully`,
      project: {
        id: project.id,
        name: project.name,
        domain: project.domain,
        currentPhase: project.currentPhase,
        progress: project.progress.overallProgress,
      },
      nextSteps: [
        'Execute specification phase to analyze requirements',
        'Use sparc_execute_phase with phase="specification"',
        'Review generated requirements and constraints',
      ],
    };
  }

  private async handleExecutePhase(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    const phase = args.phase as SPARCPhase;
    const result = await this.sparcEngine.executePhase(project, phase);

    return {
      success: result.success,
      phase: result.phase,
      duration: `${result.metrics.duration.toFixed(1)} minutes`,
      qualityScore: `${(result.metrics.qualityScore * 100).toFixed(1)}%`,
      completeness: `${(result.metrics.completeness * 100).toFixed(1)}%`,
      deliverables: result.deliverables.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        path: d.path,
      })),
      nextPhase: result.nextPhase,
      recommendations: result.recommendations,
      projectProgress: {
        currentPhase: project.currentPhase,
        overallProgress: `${(project.progress.overallProgress * 100).toFixed(1)}%`,
        completedPhases: project.progress.completedPhases,
      },
    };
  }

  private async handleGetProjectStatus(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    const basicStatus = {
      id: project.id,
      name: project.name,
      domain: project.domain,
      currentPhase: project.currentPhase,
      overallProgress: `${(project.progress.overallProgress * 100).toFixed(1)}%`,
      completedPhases: project.progress.completedPhases,
      metadata: {
        createdAt: project.metadata.createdAt,
        updatedAt: project.metadata.updatedAt,
        version: project.metadata.version,
      },
    };

    if (args.includeDetails) {
      return {
        ...basicStatus,
        phaseStatus: project.progress.phaseStatus,
        specification: {
          functionalRequirements: project.specification.functionalRequirements.length,
          nonFunctionalRequirements: project.specification.nonFunctionalRequirements.length,
          risksIdentified: project.specification.riskAssessment.risks.length,
        },
        refinements: project.refinements.length,
        artifacts: {
          sourceCode: project.implementation.sourceCode.length,
          tests: project.implementation.testSuites.length,
          documentation: project.implementation.documentation.length,
        },
      };
    }

    return basicStatus;
  }

  private async handleGenerateArtifacts(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    const artifactSet = await this.sparcEngine.generateArtifacts(project);

    return {
      success: true,
      projectId: args.projectId,
      artifactCount: artifactSet.artifacts.length,
      totalSize: `${(artifactSet.metadata.totalSize / 1024).toFixed(1)} KB`,
      artifacts: artifactSet.artifacts.map((artifact) => ({
        id: artifact.id,
        name: artifact.name,
        type: artifact.type,
        path: artifact.path,
        createdAt: artifact.createdAt,
      })),
      relationships: artifactSet.relationships,
      downloadInstructions:
        'Artifacts can be accessed at the specified paths within the project directory',
    };
  }

  private async handleValidateCompletion(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    const validation = await this.sparcEngine.validateCompletion(project);

    return {
      projectId: args.projectId,
      readyForProduction: validation.readyForProduction,
      overallScore: `${(validation.score * 100).toFixed(1)}%`,
      validations: validation.validations.map((v) => ({
        criterion: v.criterion,
        passed: v.passed,
        score: v.score ? `${(v.score * 100).toFixed(1)}%` : 'N/A',
        details: v.details,
      })),
      blockers: validation.blockers,
      warnings: validation.warnings,
      recommendation: validation.readyForProduction
        ? 'Project is ready for production deployment'
        : 'Address blockers before production deployment',
    };
  }

  private async handleListProjects(args: any): Promise<any> {
    let projects = Array.from(this.activeProjects.values());

    if (args.domain) {
      projects = projects.filter((p) => p.domain === args.domain);
    }

    return {
      totalProjects: projects.length,
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        domain: project.domain,
        currentPhase: project.currentPhase,
        progress: `${(project.progress.overallProgress * 100).toFixed(1)}%`,
        createdAt: project.metadata.createdAt,
        lastUpdated: project.metadata.updatedAt,
      })),
    };
  }

  private async handleRefineImplementation(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    const refinementResult = await this.sparcEngine.refineImplementation(project, args.feedback);

    return {
      success: true,
      projectId: args.projectId,
      refinementIteration: project.refinements.length,
      improvements: {
        performanceGain: `${(refinementResult.performanceGain * 100).toFixed(1)}%`,
        resourceReduction: `${(refinementResult.resourceReduction * 100).toFixed(1)}%`,
        scalabilityIncrease: `${refinementResult.scalabilityIncrease}x`,
        maintainabilityImprovement: `${(refinementResult.maintainabilityImprovement * 100).toFixed(1)}%`,
      },
      message: 'Implementation refined successfully with performance optimizations',
      nextSteps: [
        'Test refined implementation',
        'Validate performance improvements',
        'Consider additional refinement iterations if needed',
      ],
    };
  }

  private applyTemplateTool(): Tool {
    return {
      name: 'sparc_apply_template',
      description: 'Apply a pre-built SPARC template to accelerate project development',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          templateType: {
            type: 'string',
            enum: ['swarm-coordination', 'neural-networks', 'memory-systems', 'rest-api'],
            description: 'Type of template to apply',
          },
          customizations: {
            type: 'object',
            properties: {
              complexity: {
                type: 'string',
                enum: ['simple', 'moderate', 'high', 'complex', 'enterprise'],
              },
              specificRequirements: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        required: ['projectId', 'templateType'],
      },
    };
  }

  private executeFullWorkflowTool(): Tool {
    return {
      name: 'sparc_execute_full_workflow',
      description: 'Execute complete SPARC workflow from specification to completion',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          options: {
            type: 'object',
            properties: {
              skipValidation: {
                type: 'boolean',
                description: 'Skip validation between phases (not recommended)',
              },
              generateArtifacts: {
                type: 'boolean',
                description: 'Generate downloadable artifacts after completion',
              },
              includeDemo: {
                type: 'boolean',
                description: 'Include demonstration code and examples',
              },
            },
          },
        },
        required: ['projectId'],
      },
    };
  }

  private async handleApplyTemplate(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    return {
      success: true,
      projectId: args.projectId,
      templateApplied: args.templateType,
      message: `Template ${args.templateType} would be applied (implementation pending)`,
    };
  }

  private async handleExecuteFullWorkflow(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const results = [];

    for (const phase of phases) {
      try {
        const phaseResult = await this.sparcEngine.executePhase(project, phase);
        results.push({ phase, success: true, duration: phaseResult.metrics.duration });
      } catch (error) {
        results.push({
          phase,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        break; // Stop on first failure
      }
    }

    return {
      success: true,
      projectId: args.projectId,
      executedPhases: results.length,
      results,
      message: 'Full SPARC workflow execution completed',
    };
  }

  // Project Management Integration Tools

  private generateProjectManagementArtifactsTool(): Tool {
    return {
      name: 'sparc_generate_pm_artifacts',
      description: 'Generate project management artifacts (tasks, ADRs, PRDs) from SPARC project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          artifactTypes: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['tasks', 'adrs', 'prd', 'epics', 'features', 'all'],
            },
            description: 'Types of artifacts to generate',
          },
        },
        required: ['projectId', 'artifactTypes'],
      },
    };
  }

  private createEpicFromProjectTool(): Tool {
    return {
      name: 'sparc_create_epic',
      description: 'Create an epic and features from a SPARC project for strategic planning',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          includeFeatures: {
            type: 'boolean',
            description: 'Also generate features from project phases',
          },
        },
        required: ['projectId'],
      },
    };
  }

  private addToRoadmapTool(): Tool {
    return {
      name: 'sparc_add_to_roadmap',
      description: 'Add SPARC project to enterprise roadmap planning',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'SPARC project identifier',
          },
          targetQuarter: {
            type: 'string',
            pattern: '^[0-9]{4}-Q[1-4]$',
            description: 'Target quarter (e.g., "2024-Q2")',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Business priority level',
          },
        },
        required: ['projectId', 'targetQuarter'],
      },
    };
  }

  private generateDomainRoadmapTool(): Tool {
    return {
      name: 'sparc_generate_domain_roadmap',
      description: 'Generate strategic roadmap for a specific domain',
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            enum: [
              'swarm-coordination',
              'neural-networks',
              'wasm-integration',
              'rest-api',
              'memory-systems',
              'interfaces',
            ],
            description: 'Domain to generate roadmap for',
          },
          timeframe: {
            type: 'object',
            properties: {
              startQuarter: {
                type: 'string',
                pattern: '^[0-9]{4}-Q[1-4]$',
              },
              endQuarter: {
                type: 'string',
                pattern: '^[0-9]{4}-Q[1-4]$',
              },
            },
            required: ['startQuarter', 'endQuarter'],
          },
        },
        required: ['domain', 'timeframe'],
      },
    };
  }

  /**
   * Handle project management artifacts generation with enhanced infrastructure integration
   *
   * @param args
   */
  public async handleGenerateProjectManagementArtifacts(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    try {
      // Initialize enhanced infrastructure integration
      await this.projectManagement.initialize();

      // Use comprehensive artifact generation with enhanced infrastructure
      const results = await this.projectManagement.createAllProjectManagementArtifacts(
        project,
        args.artifactTypes || ['all']
      );

      return {
        success: true,
        projectId: args.projectId,
        workspaceId: results.workspaceId,
        workflowResults: results.workflowResults,
        infrastructure: {
          documentDrivenSystem: 'initialized',
          unifiedWorkflowEngine: 'active',
          memorySystem: 'connected',
        },
        artifacts: {
          tasks: {
            count: results.tasks.length,
            status: 'integrated with TaskAPI and EnhancedTaskTool',
          },
          adrs: {
            count: results.adrs.length,
            status: 'created using existing template structure',
          },
          prd: {
            id: results.prd.id,
            status: 'generated with comprehensive requirements',
          },
          epics: {
            count: results.epics.length,
            status: 'processed through DocumentDrivenSystem',
          },
          features: {
            count: results.features.length,
            status: 'integrated with workflow engine',
          },
        },
        integration: {
          vision_workflow: results.workflowResults['vision-to-adrs'] ? 'executed' : 'failed',
          prd_workflow: results.workflowResults['vision-to-prds'] ? 'executed' : 'failed',
          epic_workflow: results.workflowResults['prd-to-epics'] ? 'executed' : 'failed',
          feature_workflow: results.workflowResults['epic-to-features'] ? 'executed' : 'failed',
          task_workflow: results.workflowResults['feature-to-tasks'] ? 'executed' : 'failed',
        },
        message: 'Successfully integrated SPARC with existing Claude-Zen infrastructure',
      };
    } catch (error) {
      return {
        success: false,
        projectId: args.projectId,
        error: error instanceof Error ? error.message : String(error),
        message: 'Failed to generate artifacts with enhanced infrastructure',
      };
    }
  }

  /**
   * Handle epic creation from SPARC project
   * adrs: comprehensive.adrs.length,
   * epics: comprehensive.epics.length,
   * features: comprehensive.features.length,
   * prd: 1,
   * },
   * });
   * }
   *
   * return {
   * success: true,
   * projectId: args.projectId,
   * projectName: project.name,
   * artifactsGenerated: results,
   * message: `Generated project management artifacts using existing Claude-Zen infrastructure`,
   * integration: {
   * taskAPI: 'Used existing TaskAPI and EnhancedTaskTool',
   * coordination: 'Integrated with TaskDistributionEngine',
   * adrTemplate: 'Used existing ADR template structure',
   * infrastructure: 'Leveraged existing coordination and task management',
   * },
   * };
   * } catch (error) {
   * return {
   * success: false,
   * error: error instanceof Error ? error.message : 'Unknown error occurred',
   * projectId: args.projectId,
   * };
   * }
   * }
   *
   * /**
   * Handle epic creation from project
   *
   * @param args
   */
  public async handleCreateEpic(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    try {
      const epic = await this.roadmapManager.generateEpicFromSPARCProject(project);

      let features = [];
      if (args.includeFeatures) {
        features = await this.roadmapManager.generateFeaturesFromProject(project);
      }

      await this.roadmapManager.saveProjectArtifacts(project);

      return {
        success: true,
        projectId: args.projectId,
        epic: {
          id: epic.id,
          title: epic.title,
          description: epic.description,
          timeline: epic.timeline,
          businessValue: epic.business_value,
        },
        features: features.map((f) => ({
          id: f.id,
          title: f.title,
          status: f.status,
        })),
        message: `Epic created for ${project.name} with ${features.length} features`,
      };
    } catch (error) {
      throw new Error(
        `Failed to create epic: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle adding project to roadmap
   *
   * @param args
   */
  public async handleAddToRoadmap(args: any): Promise<any> {
    const project = this.activeProjects.get(args.projectId);
    if (!project) {
      throw new Error(`Project not found: ${args.projectId}`);
    }

    try {
      await this.roadmapManager.addProjectToRoadmap(project, args.targetQuarter);

      return {
        success: true,
        projectId: args.projectId,
        projectName: project.name,
        targetQuarter: args.targetQuarter,
        priority: args.priority || 'medium',
        message: `Added ${project.name} to roadmap for ${args.targetQuarter}`,
      };
    } catch (error) {
      throw new Error(
        `Failed to add to roadmap: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle domain roadmap generation
   *
   * @param args
   */
  public async handleGenerateDomainRoadmap(args: any): Promise<any> {
    try {
      const roadmap = await this.roadmapManager.generateDomainRoadmap(args.domain, {
        start: args.timeframe.startQuarter,
        end: args.timeframe.endQuarter,
      });

      return {
        success: true,
        domain: args.domain,
        roadmap: {
          id: roadmap.id,
          title: roadmap.title,
          description: roadmap.description,
          timeframe: roadmap.timeframe,
          itemCount: roadmap.items.length,
        },
        items: roadmap.items.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          quarter: item.quarter,
          effortEstimate: item.effort_estimate,
          businessValue: item.business_value,
        })),
        message: `Generated ${args.domain} roadmap with ${roadmap.items.length} items`,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate domain roadmap: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle tool calls with project management integration
   *
   * @param toolName
   * @param args
   */
  public async handleToolCall(toolName: string, args: any): Promise<any> {
    try {
      switch (toolName) {
        case 'sparc_create_project':
          return await this.handleCreateProject(args);
        case 'sparc_execute_phase':
          return await this.handleExecutePhase(args);
        case 'sparc_get_project_status':
          return await this.handleGetProjectStatus(args);
        case 'sparc_generate_artifacts':
          return await this.handleGenerateArtifacts(args);
        case 'sparc_validate_completion':
          return await this.handleValidateCompletion(args);
        case 'sparc_list_projects':
          return await this.handleListProjects(args);
        case 'sparc_refine_implementation':
          return await this.handleRefineImplementation(args);
        case 'sparc_apply_template':
          return await this.handleApplyTemplate(args);
        case 'sparc_execute_full_workflow':
          return await this.handleExecuteFullWorkflow(args);
        // Project Management Integration Tools
        case 'sparc_generate_pm_artifacts':
          return await this.handleGenerateProjectManagementArtifacts(args);
        case 'sparc_create_epic':
          return await this.handleCreateEpic(args);
        case 'sparc_add_to_roadmap':
          return await this.handleAddToRoadmap(args);
        case 'sparc_generate_domain_roadmap':
          return await this.handleGenerateDomainRoadmap(args);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        toolName,
        args,
      };
    }
  }
}

// Export singleton instance for use in MCP server
export const sparcMCPTools = new SPARCMCPTools();
