/**
 * @file Coordination system: project-management-integration.
 */

import { getLogger } from '../../../../config/logging-config.ts';

const logger = getLogger(
  'coordination-swarm-sparc-integrations-project-management-integration'
);

/**
 * SPARC Integration with Existing Claude-Zen Infrastructure.
 *
 * Integrates SPARC methodology with existing sophisticated infrastructure:
 * - DocumentDrivenSystem (core document workflow)
 * - WorkflowEngine (Vision → ADRs → PRDs → Epics → Features → Tasks → Code)
 * - TaskAPI & EnhancedTaskTool (coordination)
 * - Existing ADR templates and project management systems.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { DocumentDrivenSystem } from '../../../../core/document-driven-system.ts';
import { MemorySystem } from '../../../../core/memory-system.ts';
import type { WorkflowEngine } from '../../../../workflows/workflow-engine.ts';
import { CoordinationAPI } from '../../../api.ts';

const TaskAPI = CoordinationAPI.tasks;

// import { type TaskConfig, TaskCoordinator } from '../../../protocols/distribution/task-distribution-engine.ts'; // Temporarily commented out
import { type TaskConfig, TaskCoordinator } from '../../../task-coordinator.ts';
import type {
  DetailedSpecification,
  SPARCProject,
} from '../types/sparc-types.ts';

// Task Management Integration Types
export interface Task {
  id: string;
  title: string;
  component: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: number;
  estimated_hours: number;
  actual_hours: number | null;
  dependencies: string[];
  acceptance_criteria: string[];
  notes: string;
  assigned_to: string;
  created_date: string;
  completed_date: string | null;
  sparc_project_id?: string; // Link to SPARC project
}

// ADR Integration Types
export interface ADR {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  consequences: string[];
  date: string;
  sparc_project_id?: string;
  phase: 'specification' | 'architecture' | 'refinement' | 'completion';
}

// PRD Integration Types
export interface PRD {
  id: string;
  title: string;
  version: string;
  overview: string;
  objectives: string[];
  success_metrics: string[];
  user_stories: UserStory[];
  functional_requirements: string[];
  non_functional_requirements: string[];
  constraints: string[];
  dependencies: string[];
  timeline: string;
  stakeholders: string[];
  sparc_project_id?: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  priority: 'high' | 'medium' | 'low';
  effort_estimate: number;
}

// Feature and Epic Types
export interface Feature {
  id: string;
  title: string;
  description: string;
  epic_id?: string;
  user_stories: string[]; // References to user story IDs
  status: 'backlog' | 'planned' | 'in_progress' | 'completed';
  sparc_project_id?: string;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  features: string[]; // References to feature IDs
  business_value: string;
  timeline: {
    start_date: string;
    end_date: string;
  };
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  sparc_project_id?: string;
}

// Roadmap Types
export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: 'epic' | 'feature' | 'initiative';
  quarter: string; // e.g., "2024-Q1"
  effort_estimate: number; // story points or hours
  business_value: 'high' | 'medium' | 'low';
  dependencies: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  sparc_project_id?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  timeframe: {
    start_quarter: string;
    end_quarter: string;
  };
  items: RoadmapItem[];
  last_updated: string;
}

/**
 * Project Management Integration Service.
 *
 * Integrates SPARC methodology with existing Claude-Zen infrastructure:
 * - Uses existing TaskAPI and EnhancedTaskTool for task management
 * - Integrates with TaskDistributionEngine for task coordination
 * - Leverages existing ADR infrastructure.
 * - Extends existing tasks.json format.
 *
 * @example
 */
export class ProjectManagementIntegration {
  private readonly projectRoot: string;
  private readonly tasksFile: string;
  private readonly adrDir: string;
  private readonly prdDir: string;
  private readonly featuresFile: string;
  private readonly epicsFile: string;
  private readonly roadmapFile: string;
  private readonly taskTool: TaskCoordinator;
  private readonly taskDistributor: unknown;
  private readonly logger?: unknown;

  // Enhanced infrastructure integration
  private documentDrivenSystem: DocumentDrivenSystem;
  private workflowEngine: WorkflowEngine | undefined;
  private memorySystem: MemorySystem;

  constructor(
    projectRoot: string = process.cwd(),
    workflowEngine?: WorkflowEngine,
    memorySystem?: MemorySystem,
    logger?: unknown
  ) {
    this.logger = logger;
    this.projectRoot = projectRoot;
    this.tasksFile = path.join(projectRoot, 'tasks.json');
    this.adrDir = path.join(projectRoot, 'docs', 'adrs');
    this.prdDir = path.join(projectRoot, 'docs', 'prds');
    this.featuresFile = path.join(projectRoot, 'docs', 'features.json');
    this.epicsFile = path.join(projectRoot, 'docs', 'epics.json');
    this.roadmapFile = path.join(projectRoot, 'docs', 'roadmap.json');

    // Use existing Claude-Zen infrastructure (with minimal setup to avoid dependency issues)
    this.taskTool = TaskCoordinator.getInstance();
    // Note: TaskDistributionEngine requires complex setup, will use TaskAPI instead
    this.taskDistributor = null;

    // Initialize sophisticated document-driven infrastructure
    this.memorySystem =
      memorySystem ||
      new MemorySystem({
        backend: 'json',
        path: path.join(projectRoot, '.memory'),
      });
    this.documentDrivenSystem = new DocumentDrivenSystem();
    this.workflowEngine = workflowEngine; // Optional - can be provided externally
  }

  /**
   * Initialize sophisticated infrastructure integration.
   */
  async initialize(): Promise<void> {
    await this.memorySystem.initialize();
    await this.documentDrivenSystem.initialize();
    if (this.workflowEngine) {
      await this.workflowEngine.initialize();
    }
  }

  /**
   * Enhanced comprehensive project management artifacts using existing infrastructure.
   *
   * @param project
   * @param artifactTypes
   */
  async createAllProjectManagementArtifacts(
    project: SPARCProject,
    artifactTypes: string[] = ['all']
  ): Promise<{
    tasks: Task[];
    adrs: ADR[];
    prd: PRD;
    epics: Epic[];
    features: Feature[];
    workspaceId: string;
    workflowResults?: unknown;
  }> {
    // Initialize infrastructure
    await this.initialize();

    // Load workspace using DocumentDrivenSystem
    const workspaceId = await this.documentDrivenSystem.loadWorkspace(
      this.projectRoot
    );

    // Create vision document from SPARC project for document workflow
    const visionDocument = await this.createVisionDocumentFromSPARC(
      project,
      workspaceId
    );

    // Process through DocumentDrivenSystem
    await this.documentDrivenSystem.processVisionaryDocument(
      workspaceId,
      visionDocument.path
    );

    // Execute document workflows using UnifiedWorkflowEngine
    const workflowResults = await this.executeDocumentWorkflows(
      workspaceId,
      visionDocument
    );

    const results = {
      tasks: [] as Task[],
      adrs: [] as ADR[],
      prd: {} as PRD,
      epics: [] as Epic[],
      features: [] as Feature[],
      workspaceId,
      workflowResults,
    };

    if (artifactTypes.includes('all') || artifactTypes.includes('tasks')) {
      results.tasks = await this.generateTasksFromSPARC(project);
      await this.updateTasksWithSPARC(project);
      await this.distributeTasksWithCoordination(project);
    }

    if (artifactTypes.includes('all') || artifactTypes.includes('adrs')) {
      results.adrs = await this.generateADRFromSPARC(project);
      await this.createADRFiles(project);
    }

    if (artifactTypes.includes('all') || artifactTypes.includes('prd')) {
      results.prd = await this.generatePRDFromSPARC(project);
      await this.createPRDFile(project);
    }

    if (artifactTypes.includes('all') || artifactTypes.includes('epics')) {
      results.epics = await this.createEpicsFromSPARC(project);
      await this.saveEpicsToWorkspace(results?.epics, workspaceId);
    }

    if (artifactTypes.includes('all') || artifactTypes.includes('features')) {
      results.features = await this.createFeaturesFromSPARC(project);
      await this.saveFeaturesFromWorkspace(results?.features, workspaceId);
    }

    return results;
  }

  /**
   * Create vision document from SPARC project using DocumentDrivenSystem patterns.
   *
   * @param project
   * @param _workspaceId
   */
  private async createVisionDocumentFromSPARC(
    project: SPARCProject,
    _workspaceId: string
  ): Promise<{
    path: string;
    content: string;
  }> {
    const visionContent = `# Vision: ${project.name}

## Overview
${project.specification.successMetrics?.[0]?.description || `Vision for ${project.name} in the ${project.domain} domain.`}

## Domain
${project.domain}

## Objectives
${project.specification.functionalRequirements.map((req) => `- ${req.description}`).join('\n')}

## Success Metrics
${project.specification.acceptanceCriteria
  .map((criteria) => criteria.criteria.map((c) => `- ${c}`).join('\n'))
  .join('\n')}

## Constraints
${project.specification.constraints.map((constraint) => `- ${constraint.description}`).join('\n')}

## Dependencies
${project.specification.dependencies.map((dep) => `- ${dep.name} (${dep.type}): ${dep.version || 'latest'}${dep.critical ? ' [CRITICAL]' : ''}`).join('\n')}

---
Author: SPARC Engine
Created: ${new Date().toISOString()}
Status: draft
Related: SPARC-${project.id}
`;

    const visionDir = path.join(this.projectRoot, 'docs/01-vision');
    const visionPath = path.join(visionDir, `${project.id}-vision.md`);

    await fs.mkdir(visionDir, { recursive: true });
    await fs.writeFile(visionPath, visionContent);

    return { path: visionPath, content: visionContent };
  }

  /**
   * Execute document workflows using UnifiedWorkflowEngine.
   *
   * @param workspaceId
   * @param visionDocument
   * @param visionDocument.path
   * @param visionDocument.content
   */
  private async executeDocumentWorkflows(
    workspaceId: string,
    visionDocument: { path: string; content: string }
  ): Promise<unknown> {
    const workflows = [
      // Note: ADRs are NOT auto-generated from vision. They are independent architectural governance.
      'vision-to-prds',
      'prd-to-epics',
      'epic-to-features',
      'feature-to-tasks',
    ];

    const results = {};

    for (const workflowName of workflows) {
      try {
        const result = this.workflowEngine
          ? await this.workflowEngine.startWorkflow(workflowName, {
              currentDocument: {
                id: `vision-${workspaceId}-${Date.now()}`,
                type: 'vision',
                title: 'Vision Document',
                content: visionDocument.content,
                metadata: {
                  author: 'SPARC Engine',
                  tags: [workspaceId],
                  status: 'draft' as const,
                  priority: 'medium' as const,
                  dependencies: [],
                  relatedDocuments: [],
                },
                created: new Date(),
                updated: new Date(),
                version: '1.0.0',
              },
              workspaceId: this.projectRoot,
            })
          : { success: false, error: 'WorkflowEngine not available' };

        if (result?.success && result?.workflowId) {
          results[workflowName] = result?.workflowId;
        }
      } catch (error) {
        logger.warn(`Failed to execute workflow ${workflowName}:`, error);
        results[workflowName] = { error: (error as Error).message };
      }
    }

    return results;
  }

  /**
   * Generate tasks from SPARC project using existing task infrastructure.
   *
   * @param project
   */
  async generateTasksFromSPARC(project: SPARCProject): Promise<Task[]> {
    const tasks: Task[] = [];
    let taskCounter = 1;

    // Generate tasks for each phase using existing task infrastructure
    const phases = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];

    for (const phase of phases) {
      const taskId = `SPARC-${project.id.toUpperCase()}-${taskCounter.toString().padStart(3, '0')}`;

      // Create enhanced task configuration for existing infrastructure
      const enhancedTaskConfig: TaskConfig = {
        description: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase - ${project.name}`,
        prompt: this.generatePhasePrompt(phase, project),
        subagent_type: this.getOptimalAgentForPhase(phase),
        use_claude_subagent: true,
        domain_context: `SPARC ${project.domain} project: ${project.name}`,
        expected_output: this.getPhaseExpectedOutput(phase),
        tools_required: this.getPhaseTools(phase),
        priority: this.getPhasePriority(phase),
        dependencies:
          taskCounter > 1
            ? [
                `SPARC-${project.id.toUpperCase()}-${(taskCounter - 1).toString().padStart(3, '0')}`,
              ]
            : [],
        timeout_minutes: this.getPhaseTimeout(phase),
      };

      // Execute task through existing infrastructure to validate
      try {
        await this.taskTool.executeTask(enhancedTaskConfig);
      } catch (error) {
        logger.warn(`Task validation failed for ${phase}:`, error);
      }

      const task: Task = {
        id: taskId,
        title: enhancedTaskConfig?.description,
        component: `sparc-${phase}`,
        description: this.getPhaseDescription(phase),
        status:
          project.currentPhase === phase
            ? 'in_progress'
            : phases.indexOf(phase) < phases.indexOf(project.currentPhase)
              ? 'completed'
              : 'todo',
        priority: this.convertPriorityToNumber(
          enhancedTaskConfig?.priority || 'medium'
        ),
        estimated_hours: this.getPhaseEstimatedHours(phase),
        actual_hours: null,
        dependencies: enhancedTaskConfig?.dependencies || [],
        acceptance_criteria: this.getPhaseAcceptanceCriteria(phase, project),
        notes: `Generated from SPARC project: ${project.name}. Agent: ${enhancedTaskConfig?.subagent_type}`,
        assigned_to: 'sparc-engine',
        created_date: new Date().toISOString(),
        completed_date: null,
        sparc_project_id: project.id,
      };

      tasks.push(task);
      taskCounter++;
    }

    return tasks;
  }

  /**
   * Update existing tasks with SPARC project information using TaskAPI.
   *
   * @param project
   */
  async updateTasksWithSPARC(project: SPARCProject): Promise<void> {
    try {
      const tasksData = await fs.readFile(this.tasksFile, 'utf-8');
      const existingTasks: Task[] = JSON.parse(tasksData);

      // Add SPARC-generated tasks
      const sparcTasks = await this.generateTasksFromSPARC(project);

      // Use TaskAPI to validate tasks before adding
      for (const task of sparcTasks) {
        try {
          // Convert to TaskAPI format and validate
          const deadline = task.completed_date
            ? new Date(task.completed_date)
            : undefined;
          await TaskAPI.createTask({
            type: task.component,
            description: task.description,
            priority: task.priority * 20, // Convert to 0-100 scale
            ...(deadline && { deadline }),
          });
        } catch (error) {
          logger.warn(`Task validation failed for ${task.id}:`, error);
        }
      }

      existingTasks.push(...sparcTasks);

      // Write back to file
      await fs.writeFile(
        this.tasksFile,
        JSON.stringify(existingTasks, null, 2)
      );
    } catch (error) {
      logger.warn('Could not update tasks file:', error);
    }
  }

  /**
   * Create tasks using enhanced task distribution engine.
   *
   * @param project
   */
  async distributeTasksWithCoordination(project: SPARCProject): Promise<void> {
    try {
      const sparcTasks = await this.generateTasksFromSPARC(project);

      for (const task of sparcTasks) {
        const enhancedTaskConfig: TaskConfig = {
          description: task.description,
          prompt: this.generatePhasePrompt(
            task.component.replace('sparc-', ''),
            project
          ),
          subagent_type: this.getOptimalAgentForPhase(
            task.component.replace('sparc-', '')
          ),
          use_claude_subagent: true,
          domain_context: `SPARC ${project.domain} project`,
          expected_output: this.getPhaseExpectedOutput(
            task.component.replace('sparc-', '')
          ),
          priority: this.convertNumberToPriority(task.priority),
          dependencies: task.dependencies,
          timeout_minutes: task.estimated_hours * 60,
        };

        // Log enhanced task configuration for monitoring
        this.logger?.debug('Enhanced SPARC task configuration created', {
          taskId: task.id,
          component: task.component,
          priority: enhancedTaskConfig?.priority,
          agentType: enhancedTaskConfig?.subagent_type,
          estimatedHours: task.estimated_hours,
        });

        // Use TaskAPI for simpler integration (TaskDistributionEngine requires complex setup)
        try {
          const deadline = task.completed_date
            ? new Date(task.completed_date)
            : undefined;
          await TaskAPI.createTask({
            type: task.component,
            description: task.description,
            priority: task.priority * 20, // Convert to 0-100 scale
            ...(deadline && { deadline }),
          });
        } catch (error) {
          logger.warn(`Task creation failed for ${task.id}:`, error);
        }
      }
    } catch (error) {
      logger.warn('Could not distribute SPARC tasks:', error);
    }
  }

  /**
   * Generate ADR from SPARC architecture decisions.
   *
   * @param project
   */
  async generateADRFromSPARC(project: SPARCProject): Promise<ADR[]> {
    const adrs: ADR[] = [];

    if (project.architecture) {
      // Generate ADR for overall architecture
      const architectureADR: ADR = {
        id: `ADR-${project.id}-001`,
        title: `Architecture Decision for ${project.name}`,
        status: 'accepted',
        context: `Architecture decisions for SPARC project: ${project.name}\n\nDomain: ${project.domain}\nComplexity: moderate`,
        decision: this.formatArchitectureDecision(project),
        consequences: this.extractArchitectureConsequences(project),
        date: new Date().toISOString(),
        sparc_project_id: project.id,
        phase: 'architecture',
      };

      adrs.push(architectureADR);

      // Generate ADRs for significant components
      if (project.architecture?.systemArchitecture?.components) {
        project.architecture.systemArchitecture.components.forEach(
          (component, index) => {
            if (
              component.qualityAttributes &&
              component.qualityAttributes['importance'] === 'high'
            ) {
              const componentADR: ADR = {
                id: `ADR-${project.id}-${(index + 2).toString().padStart(3, '0')}`,
                title: `${component.name} Component Design`,
                status: 'accepted',
                context: `Design decisions for ${component.name} component in ${project.name}`,
                decision: `Implement ${component.name} with:\n- Type: ${component.type}\n- Responsibilities: ${component.responsibilities.join(', ')}\n- Interfaces: ${component.interfaces.join(', ')}`,
                consequences: [
                  `Enables ${component.responsibilities.join(' and ')}`,
                  'Requires integration with other components',
                ],
                date: new Date().toISOString(),
                sparc_project_id: project.id,
                phase: 'architecture',
              };
              adrs.push(componentADR);
            }
          }
        );
      }
    }

    return adrs;
  }

  /**
   * Generate PRD from SPARC specification.
   *
   * @param project
   */
  async generatePRDFromSPARC(project: SPARCProject): Promise<PRD> {
    const prd: PRD = {
      id: `PRD-${project.id}`,
      title: `Product Requirements - ${project.name}`,
      version: '1.0.0',
      overview:
        project.specification.successMetrics?.[0]?.description ||
        `Product requirements for ${project.name} in the ${project.domain} domain.`,
      objectives: project.specification.functionalRequirements.map(
        (req) => req.description
      ),
      success_metrics: project.specification.acceptanceCriteria.map(
        (criteria) => criteria.criteria.join(', ')
      ),
      user_stories: this.generateUserStoriesFromRequirements(
        project.specification
      ),
      functional_requirements: project.specification.functionalRequirements.map(
        (req) => req.description
      ),
      non_functional_requirements:
        project.specification.nonFunctionalRequirements.map(
          (req) => req.description
        ),
      constraints: project.specification.constraints.map(
        (constraint) => constraint.description
      ),
      dependencies: project.specification.dependencies.map((dep) => dep.name),
      timeline: `Estimated ${this.calculateProjectTimeline(project)} weeks`,
      stakeholders: ['Product Manager', 'Engineering Team', 'QA Team'],
      sparc_project_id: project.id,
    };

    return prd;
  }

  // Helper methods for task integration
  private generatePhasePrompt(phase: string, project: SPARCProject): string {
    const prompts = {
      specification: `Analyze and document comprehensive requirements for ${project.name} in the ${project.domain} domain. Focus on functional requirements, constraints, and success metrics.`,
      pseudocode: `Design algorithms and pseudocode for ${project.name}. Include complexity analysis and optimization strategies.`,
      architecture: `Design system architecture for ${project.name}. Include component relationships, data flow, and deployment strategies.`,
      refinement: `Optimize and refine the implementation of ${project.name}. Focus on performance, security, and scalability improvements.`,
      completion: `Generate production-ready implementation for ${project.name}. Include comprehensive tests, documentation, and deployment artifacts.`,
    };
    return prompts[phase] || `Execute ${phase} phase for ${project.name}`;
  }

  private getOptimalAgentForPhase(phase: string): unknown {
    const agentMapping = {
      specification: 'system-analyst',
      pseudocode: 'algorithm-designer',
      architecture: 'system-architect',
      refinement: 'performance-optimizer',
      completion: 'full-stack-developer',
    };
    return agentMapping[phase] || 'generalist';
  }

  private getPhaseExpectedOutput(phase: string): string {
    const outputs = {
      specification: 'Detailed requirements document with acceptance criteria',
      pseudocode: 'Algorithm designs with complexity analysis',
      architecture: 'System architecture diagrams and component specifications',
      refinement: 'Performance optimization report and recommendations',
      completion: 'Production-ready code with tests and documentation',
    };
    return outputs[phase] || 'Phase deliverables completed';
  }

  private getPhaseTools(phase: string): string[] {
    const tools = {
      specification: [
        'requirements-analysis',
        'stakeholder-interview',
        'constraint-modeling',
      ],
      pseudocode: [
        'algorithm-design',
        'complexity-analysis',
        'optimization-modeling',
      ],
      architecture: [
        'system-design',
        'component-modeling',
        'deployment-planning',
      ],
      refinement: [
        'performance-profiling',
        'security-analysis',
        'scalability-testing',
      ],
      completion: [
        'code-generation',
        'test-automation',
        'documentation-generation',
      ],
    };
    return tools[phase] || ['general-development'];
  }

  private getPhasePriority(
    phase: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const priorities = {
      specification: 'high',
      pseudocode: 'medium',
      architecture: 'high',
      refinement: 'medium',
      completion: 'critical',
    };
    return (priorities[phase] as any) || 'medium';
  }

  private getPhaseTimeout(phase: string): number {
    const timeouts = {
      specification: 120, // 2 hours
      pseudocode: 180, // 3 hours
      architecture: 240, // 4 hours
      refinement: 120, // 2 hours
      completion: 360, // 6 hours
    };
    return timeouts[phase] || 120;
  }

  private convertPriorityToNumber(
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): number {
    const mapping = { low: 1, medium: 3, high: 4, critical: 5 };
    return mapping[priority] || 3;
  }

  private convertNumberToPriority(
    num: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (num <= 1) return 'low';
    if (num <= 3) return 'medium';
    if (num <= 4) return 'high';
    return 'critical';
  }

  private generateEpicDescription(project: SPARCProject): string {
    return `Epic for ${project.name} development in the ${project.domain} domain using SPARC methodology.

**Scope:** Comprehensive implementation of ${project.name} with full SPARC methodology

**Key Deliverables:**
- Complete specification and requirements analysis
- System architecture and component design  
- Production-ready implementation
- Comprehensive testing and documentation

**Business Impact:** ${this.calculateBusinessValue(project)}

**Technical Complexity:** moderate`;
  }

  private calculateBusinessValue(project: SPARCProject): string {
    const domainValues = {
      'swarm-coordination':
        'High - Core platform capability for agent coordination',
      'neural-networks':
        'High - AI/ML acceleration and intelligence enhancement',
      'memory-systems':
        'Medium - Infrastructure efficiency and data management',
      'rest-api':
        'Medium - External integration and user interface capabilities',
      interfaces: 'Medium - User experience and system accessibility',
      'wasm-integration':
        'High - Performance optimization and computational efficiency',
      general: 'Low to Medium - General platform improvements',
    };

    return domainValues[project.domain] || 'Medium - Platform enhancement';
  }

  private calculateEpicEndDate(_project: SPARCProject): string {
    const complexityWeeks = {
      simple: 4,
      moderate: 8,
      high: 12,
      complex: 16,
      enterprise: 20,
    };

    const weeks = complexityWeeks.moderate;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + weeks * 7);

    return endDate.toISOString().split('T')[0] ?? '';
  }

  private generateFeaturesFromPhases(project: SPARCProject): Feature[] {
    const features: Feature[] = [];

    const phaseFeatures = [
      {
        phase: 'specification',
        title: `${project.name} Requirements Analysis`,
        description: 'Complete requirements gathering and constraint analysis',
      },
      {
        phase: 'architecture',
        title: `${project.name} System Architecture`,
        description: 'Design and document system architecture and components',
      },
      {
        phase: 'completion',
        title: `${project.name} Implementation`,
        description: 'Production-ready implementation with full test coverage',
      },
    ];

    phaseFeatures.forEach((phaseFeature, index) => {
      const feature: Feature = {
        id: `FEAT-${project.id}-${index + 1}`,
        title: phaseFeature.title,
        description: phaseFeature.description,
        epic_id: `EPIC-${project.id}`,
        user_stories: [
          `US-${project.id}-${phaseFeature.phase.toUpperCase()}-001`,
        ],
        status: this.getFeatureStatusFromProject(project, phaseFeature.phase),
        sparc_project_id: project.id,
      };

      features.push(feature);
    });

    return features;
  }

  private generateFeaturesFromRequirements(project: SPARCProject): Feature[] {
    const features: Feature[] = [];

    if (project.specification?.functionalRequirements) {
      project.specification.functionalRequirements.forEach((req, index) => {
        const feature: Feature = {
          id: `FEAT-${project.id}-REQ-${index + 1}`,
          title: req.description,
          description: `Implementation of functional requirement: ${req.description}`,
          epic_id: `EPIC-${project.id}`,
          user_stories: [`US-${project.id}-REQ-${index + 1}`],
          status: 'backlog',
          sparc_project_id: project.id,
        };

        features.push(feature);
      });
    }

    return features;
  }

  private getFeatureStatusFromProject(
    project: SPARCProject,
    phase: string
  ): 'backlog' | 'planned' | 'in_progress' | 'completed' {
    if (project.progress?.completedPhases?.includes(phase as any)) {
      return 'completed';
    }
    if (project.currentPhase === phase) {
      return 'in_progress';
    }
    return 'planned';
  }

  /**
   * Create ADR files from SPARC project using existing template structure.
   *
   * @param project
   */
  async createADRFiles(project: SPARCProject): Promise<void> {
    try {
      await fs.mkdir(this.adrDir, { recursive: true });

      const adrs = await this.generateADRFromSPARC(project);

      for (const adr of adrs) {
        const adrContent = this.formatADRContent(adr);
        const adrFile = path.join(this.adrDir, `${adr.id.toLowerCase()}.md`);
        await fs.writeFile(adrFile, adrContent);
      }
    } catch (error) {
      logger.warn('Could not create ADR files:', error);
    }
  }

  /**
   * Create PRD file from SPARC project with enhanced integration.
   *
   * @param project
   */
  async createPRDFile(project: SPARCProject): Promise<void> {
    try {
      await fs.mkdir(this.prdDir, { recursive: true });

      const prd = await this.generatePRDFromSPARC(project);
      const prdContent = this.formatPRDContent(prd);
      const prdFile = path.join(this.prdDir, `${prd.id.toLowerCase()}.md`);

      await fs.writeFile(prdFile, prdContent);
    } catch (error) {
      logger.warn('Could not create PRD file:', error);
    }
  }

  /**
   * Create or update epics file from SPARC project.
   *
   * @param project
   */
  async createEpicsFromSPARC(project: SPARCProject): Promise<Epic[]> {
    try {
      // Ensure docs directory exists
      await fs.mkdir(path.dirname(this.epicsFile), { recursive: true });

      // Load existing epics or create new array
      let epics: Epic[] = [];
      try {
        const epicsData = await fs.readFile(this.epicsFile, 'utf-8');
        epics = JSON.parse(epicsData);
      } catch {
        // File doesn't exist, start with empty array
      }

      // Generate epic for the project
      const projectEpic: Epic = {
        id: `EPIC-${project.id}`,
        title: `${project.name} Development Epic`,
        description: this.generateEpicDescription(project),
        features: [],
        business_value: this.calculateBusinessValue(project),
        timeline: {
          start_date: new Date().toISOString().split('T')[0] ?? '',
          end_date: this.calculateEpicEndDate(project),
        },
        status: 'approved',
        sparc_project_id: project.id,
      };

      // Check if epic already exists
      const existingEpicIndex = epics.findIndex(
        (e) => e.sparc_project_id === project.id
      );
      if (existingEpicIndex >= 0) {
        epics[existingEpicIndex] = projectEpic;
      } else {
        epics.push(projectEpic);
      }

      // Save epics file
      await fs.writeFile(this.epicsFile, JSON.stringify(epics, null, 2));

      return epics;
    } catch (error) {
      logger.warn('Could not create epics file:', error);
      return [];
    }
  }

  /**
   * Create or update features file from SPARC project.
   *
   * @param project
   */
  async createFeaturesFromSPARC(project: SPARCProject): Promise<Feature[]> {
    try {
      // Ensure docs directory exists
      await fs.mkdir(path.dirname(this.featuresFile), { recursive: true });

      // Load existing features or create new array
      let features: Feature[] = [];
      try {
        const featuresData = await fs.readFile(this.featuresFile, 'utf-8');
        features = JSON.parse(featuresData);
      } catch {
        // File doesn't exist, start with empty array
      }

      // Generate features for each SPARC phase
      const phaseFeatures = this.generateFeaturesFromPhases(project);

      // Add functional requirement features
      const requirementFeatures =
        this.generateFeaturesFromRequirements(project);

      const allProjectFeatures = [...phaseFeatures, ...requirementFeatures];

      // Remove existing features for this project
      features = features.filter((f) => f.sparc_project_id !== project.id);

      // Add new features
      features.push(...allProjectFeatures);

      // Save features file
      await fs.writeFile(this.featuresFile, JSON.stringify(features, null, 2));

      return allProjectFeatures;
    } catch (error) {
      logger.warn('Could not create features file:', error);
      return [];
    }
  }

  /**
   * Create comprehensive project management artifacts.
   *
   * @param project
   * @param phase
   */
  // Duplicate method createAllProjectManagementArtifacts removed

  // Helper methods
  private getPhaseDescription(phase: string): string {
    const descriptions = {
      specification:
        'Gather and analyze detailed requirements, constraints, and acceptance criteria',
      pseudocode:
        'Design algorithms and data structures with complexity analysis',
      architecture: 'Design system architecture and component relationships',
      refinement: 'Optimize and refine based on performance feedback',
      completion: 'Generate production-ready implementation and documentation',
    };
    return descriptions[phase] || 'SPARC methodology phase execution';
  }

  private getPhaseEstimatedHours(phase: string): number {
    const estimates = {
      specification: 4,
      pseudocode: 6,
      architecture: 8,
      refinement: 4,
      completion: 12,
    };
    return estimates[phase] || 4;
  }

  private getPhaseAcceptanceCriteria(
    phase: string,
    _project: SPARCProject
  ): string[] {
    const baseCriteria = {
      specification: [
        'All functional requirements identified and documented',
        'Non-functional requirements defined with measurable criteria',
        'Constraints and dependencies identified',
        'Acceptance criteria defined for each requirement',
      ],
      pseudocode: [
        'Core algorithms designed with pseudocode',
        'Time and space complexity analyzed',
        'Data structures specified',
        'Algorithm correctness validated',
      ],
      architecture: [
        'System architecture designed and documented',
        'Component relationships defined',
        'Interface specifications completed',
        'Deployment architecture planned',
      ],
      refinement: [
        'Performance optimization strategies identified',
        'Security considerations addressed',
        'Scalability improvements documented',
        'Quality metrics achieved',
      ],
      completion: [
        'Production-ready code generated',
        'Comprehensive test suite created',
        'Documentation completed',
        'Deployment artifacts ready',
      ],
    };

    return baseCriteria[phase] || ['Phase objectives completed'];
  }

  private formatArchitectureDecision(project: SPARCProject): string {
    if (!project.architecture) return 'Architecture not yet defined';

    return `Architecture Decision for ${project.name}:

## Components
${project.architecture?.systemArchitecture?.components?.map((comp) => `- ${comp.name}: ${comp.type}`).join('\n') || 'Components not defined'}

## Patterns
${project.architecture?.systemArchitecture?.architecturalPatterns?.map((p) => p.name).join('\n- ') || 'Patterns not defined'}

## Technology Stack
${project.architecture?.systemArchitecture?.technologyStack?.map((t) => t.technology).join('\n- ') || 'Technology stack not defined'}`;
  }

  private extractArchitectureConsequences(project: SPARCProject): string[] {
    const consequences = [
      'Establishes clear component boundaries and responsibilities',
      'Enables modular development and testing',
      'Provides foundation for scalable implementation',
    ];

    if (project.architecture?.systemArchitecture?.architecturalPatterns) {
      consequences.push(
        `Leverages proven architectural patterns: ${project.architecture.systemArchitecture.architecturalPatterns.map((p) => p.name).join(', ')}`
      );
    }

    return consequences;
  }

  private generateUserStoriesFromRequirements(
    spec: DetailedSpecification
  ): UserStory[] {
    return spec.functionalRequirements.map((req, index) => ({
      id: `US-${index + 1}`,
      title: req.description,
      description: `As a system user, I want ${req.description.toLowerCase()} so that I can achieve the system objectives.`,
      acceptance_criteria: [
        `System implements ${req.description}`,
        'Implementation meets performance requirements',
      ],
      priority:
        (req.priority?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
      effort_estimate: 5,
    }));
  }

  private calculateProjectTimeline(_project: SPARCProject): number {
    const complexityWeeks = {
      simple: 2,
      moderate: 4,
      high: 8,
      complex: 12,
      enterprise: 16,
    };

    return complexityWeeks.moderate || 4;
  }

  private formatADRContent(adr: ADR): string {
    return `# ${adr.title}

## Status
${adr.status}

## Context
${adr.context}

## Decision
${adr.decision}

## Consequences
${adr.consequences.map((c) => `- ${c}`).join('\n')}

---
*Generated from SPARC project: ${adr.sparc_project_id}*
*Date: ${adr.date}*
*Phase: ${adr.phase}*
`;
  }

  private formatPRDContent(prd: PRD): string {
    return `# ${prd.title}

**Version:** ${prd.version}
**Generated from SPARC Project:** ${prd.sparc_project_id}

## Overview
${prd.overview}

## Objectives
${prd.objectives.map((obj) => `- ${obj}`).join('\n')}

## Success Metrics
${prd.success_metrics.map((metric) => `- ${metric}`).join('\n')}

## User Stories
${prd.user_stories.map((story) => `### ${story.title}\n${story.description}\n\n**Acceptance Criteria:**\n${story.acceptance_criteria.map((ac) => `- ${ac}`).join('\n')}`).join('\n\n')}

## Functional Requirements
${prd.functional_requirements.map((req) => `- ${req}`).join('\n')}

## Non-Functional Requirements
${prd.non_functional_requirements.map((req) => `- ${req}`).join('\n')}

## Constraints
${prd.constraints.map((constraint) => `- ${constraint}`).join('\n')}

## Dependencies
${prd.dependencies.map((dep) => `- ${dep}`).join('\n')}

## Timeline
${prd.timeline}

## Stakeholders
${prd.stakeholders.map((stakeholder) => `- ${stakeholder}`).join('\n')}
`;
  }

  /**
   * Enhanced ADR creation using existing template structure and workspace management.
   *
   * @param adrs
   * @param workspaceId
   */
  async createADRFilesWithWorkspace(
    adrs: ADR[],
    workspaceId: string
  ): Promise<string[]> {
    const createdFiles: string[] = [];

    // Ensure ADR directory exists
    await fs.mkdir(this.adrDir, { recursive: true });

    // Check for existing ADR template (following existing patterns)
    const templatePath = path.join(
      this.projectRoot,
      'docs/adrs/adr-template.md'
    );
    let template = '';

    try {
      template = await fs.readFile(templatePath, 'utf-8');
    } catch {
      // Use default template that matches existing structure
      template = `# ADR-{NUMBER}: {TITLE}

## Status
{STATUS}

## Context
{CONTEXT}

## Decision
{DECISION}

## Consequences
{CONSEQUENCES}

## Date
{DATE}

## Related
- SPARC Project: {SPARC_PROJECT_ID}
- Phase: {PHASE}
`;
    }

    for (const adr of adrs) {
      const number = adr.id.replace(/.*ADR-/, '').replace(/-.*/, '');
      const filename = `${adr.id.toLowerCase()}-${adr.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const filePath = path.join(this.adrDir, filename);

      const content = template
        .replace(/{NUMBER}/g, number)
        .replace(/{TITLE}/g, adr.title)
        .replace(/{STATUS}/g, adr.status)
        .replace(/{CONTEXT}/g, adr.context)
        .replace(/{DECISION}/g, adr.decision)
        .replace(
          /{CONSEQUENCES}/g,
          Array.isArray(adr.consequences)
            ? adr.consequences.map((c) => `- ${c}`).join('\n')
            : adr.consequences
        )
        .replace(/{DATE}/g, adr.date)
        .replace(/{SPARC_PROJECT_ID}/g, adr.sparc_project_id || 'N/A')
        .replace(/{PHASE}/g, adr.phase || 'N/A');

      await fs.writeFile(filePath, content);
      createdFiles.push(filePath);

      // Store in memory system for workflow engine access
      if (this.memorySystem) {
        await this.memorySystem.storeDocument('adr', adr.id, {
          id: adr.id,
          title: adr.title,
          content,
          metadata: {
            status: adr.status,
            phase: adr.phase,
            sparcProjectId: adr.sparc_project_id,
            filePath,
          },
        });
      }

      // Process through document-driven system
      if (this.documentDrivenSystem && workspaceId) {
        await this.documentDrivenSystem.processVisionaryDocument(
          workspaceId,
          filePath
        );
      }
    }

    return createdFiles;
  }

  /**
   * Save epics to workspace using document-driven system.
   *
   * @param epics
   * @param workspaceId
   */
  async saveEpicsToWorkspace(
    epics: Epic[],
    workspaceId: string
  ): Promise<void> {
    const epicsDir = path.join(this.projectRoot, 'docs/04-epics');
    await fs.mkdir(epicsDir, { recursive: true });

    for (const epic of epics) {
      const filename = `${epic.id.toLowerCase()}-${epic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const filePath = path.join(epicsDir, filename);

      const content = `# Epic: ${epic.title}

## Description
${epic.description}

## Business Value
${epic.business_value}

## Timeline
- Start: ${epic.timeline.start_date}
- End: ${epic.timeline.end_date}

## Status
${epic.status}

## Features
${epic.features.map((f) => `- ${f}`).join('\n')}

## Related SPARC Project
${epic.sparc_project_id || 'N/A'}

---
Created: ${new Date().toISOString()}
Type: Epic
`;

      await fs.writeFile(filePath, content);

      // Process through document-driven system
      if (this.documentDrivenSystem && workspaceId) {
        await this.documentDrivenSystem.processVisionaryDocument(
          workspaceId,
          filePath
        );
      }
    }

    // Also save to epics.json for backward compatibility
    try {
      await fs.writeFile(this.epicsFile, JSON.stringify(epics, null, 2));
    } catch (error) {
      logger.warn('Could not save epics.json:', error);
    }
  }

  /**
   * Save features to workspace using document-driven system.
   *
   * @param features
   * @param workspaceId
   */
  async saveFeaturesFromWorkspace(
    features: Feature[],
    workspaceId: string
  ): Promise<void> {
    const featuresDir = path.join(this.projectRoot, 'docs/05-features');
    await fs.mkdir(featuresDir, { recursive: true });

    for (const feature of features) {
      const filename = `${feature.id.toLowerCase()}-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const filePath = path.join(featuresDir, filename);

      const content = `# Feature: ${feature.title}

## Description
${feature.description}

## Epic
${feature.epic_id || 'N/A'}

## Status
${feature.status}

## User Stories
${feature.user_stories.map((us) => `- ${us}`).join('\n')}

## Related SPARC Project
${feature.sparc_project_id || 'N/A'}

---
Created: ${new Date().toISOString()}
Type: Feature
`;

      await fs.writeFile(filePath, content);

      // Process through document-driven system
      if (this.documentDrivenSystem && workspaceId) {
        await this.documentDrivenSystem.processVisionaryDocument(
          workspaceId,
          filePath
        );
      }
    }

    // Also save to features.json for backward compatibility
    try {
      await fs.writeFile(this.featuresFile, JSON.stringify(features, null, 2));
    } catch (error) {
      logger.warn('Could not save features.json:', error);
    }
  }
}
