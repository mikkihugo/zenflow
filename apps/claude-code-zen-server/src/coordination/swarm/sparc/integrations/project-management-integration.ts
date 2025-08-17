/**
 * @file Database-driven SPARC coordination integration.
 */

import { getLogger } from '../../../../config/logging-config';

const logger = getLogger(
  'coordination-swarm-sparc-integrations-project-management-integration'
);

/**
 * SPARC Database-Driven Coordination Integration.
 *
 * Integrates SPARC methodology with database-driven coordination for SwarmCommander:
 * - Database entities for real-time agent coordination
 * - TaskAPI & TaskCoordinator for swarm task distribution
 * - Memory system for persistent coordination state
 * - NO file operations - pure database coordination
 */

import { MemorySystem } from '../../../../core/memory-system';
import { CoordinationAPI } from '../../../api';
import { CoordinationDao } from '../../../../database/dao/coordination.dao';
import type { 
  ProductProject,
  Feature,
  Task as DatabaseTask,
  Epic
} from '../../../../database/entities/product-entities';

const TaskAPI = CoordinationAPI.tasks;
import { type TaskConfig, TaskCoordinator } from '../../../task-coordinator';
import type {
  DetailedSpecification,
  SPARCProject,
} from '../types/sparc-types';

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

/**
 * Database-Driven SPARC Coordination Service.
 *
 * Coordinates SPARC methodology with database-driven swarm management:
 * - TaskAPI and TaskCoordinator for real-time task distribution
 * - Database entities for persistent coordination state
 * - Memory system for cross-session coordination
 * - SwarmCommander integration for agent assignment
 *
 * @example
 * const coordination = new ProjectManagementIntegration();
 * await coordination.updateDatabaseWithSPARC(project);
 * const tasks = await coordination.getTasksForSwarmAssignment();
 */
export class ProjectManagementIntegration {
  private readonly taskTool: TaskCoordinator;
  private readonly memorySystem: MemorySystem;
  private readonly coordinationDao: CoordinationDao<any>;
  private readonly logger?: unknown;

  constructor(
    memorySystem?: MemorySystem,
    coordinationDao?: CoordinationDao<any>,
    logger?: unknown
  ) {
    this.logger = logger;
    
    // Database-driven coordination components
    this.taskTool = TaskCoordinator.getInstance();
    this.coordinationDao = coordinationDao || new CoordinationDao();
    this.memorySystem =
      memorySystem ||
      new MemorySystem({
        backend: 'json',
        config: { 
          persistence: true,
          ttl: 86400000, // 24 hours
        },
      });
  }

  /**
   * Database-driven SPARC coordination for SwarmCommander.
   *
   * Updates database entities with SPARC context for real-time agent coordination.
   * No file operations - pure database coordination for swarm task assignment.
   *
   * @param project SPARC project to integrate
   * @param coordinationOptions Configuration for coordination behavior
   */
  async updateDatabaseWithSPARC(
    project: SPARCProject,
    coordinationOptions: {
      updateTasks?: boolean;
      createEpicFeatures?: boolean;
      enableMemoryStorage?: boolean;
    } = {
      updateTasks: true,
      createEpicFeatures: true,
      enableMemoryStorage: true,
    }
  ): Promise<{
    tasksUpdated: number;
    entitiesCreated: number;
    coordinationMemoryKeys: string[];
  }> {
    logger.info('Starting database-driven SPARC coordination', {
      projectId: project.id,
      projectName: project.name,
      options: coordinationOptions,
    });

    const results = {
      tasksUpdated: 0,
      entitiesCreated: 0,
      coordinationMemoryKeys: [] as string[],
    };

    // Database coordination operations
    if (coordinationOptions.updateTasks) {
      results.tasksUpdated = await this.updateTasksWithSPARCMetadata(project);
    }

    if (coordinationOptions.createEpicFeatures) {
      results.entitiesCreated = await this.createDatabaseEntitiesFromSPARC(
        project
      );
    }

    if (coordinationOptions.enableMemoryStorage) {
      results.coordinationMemoryKeys = await this.storeCoordinationInMemory(
        project
      );
    }

    logger.info('Database-driven SPARC coordination completed', {
      projectId: project.id,
      ...results,
    });

    return results;
  }

  /**
   * Get tasks ready for SwarmCommander assignment.
   *
   * Queries database for tasks with SPARC metadata for agent coordination.
   */
  async getTasksForSwarmAssignment(
    filters: {
      sparcProjectId?: string;
      domain?: string;
      phase?: string;
      status?: string;
    } = {}
  ): Promise<DatabaseTask[]> {
    // Use coordination DAO to query tasks with SPARC context
    return this.coordinationDao.findBy({ ...filters, type: 'sparc_task' });
  }

  /**
   * Updates existing tasks with SPARC project metadata in database.
   */
  private async updateTasksWithSPARCMetadata(
    project: SPARCProject
  ): Promise<number> {
    const tasks = await this.generateTasksFromSPARC(project);
    let updatedCount = 0;

    for (const task of tasks) {
      try {
        // Store in database with SPARC metadata
        await this.coordinationDao.update(task.id, {
          ...task,
          sparc_project_id: project.id,
          sparc_phase: project.currentPhase,
          sparc_domain: project.domain,
          sparc_metadata: {
            component: task.component,
            priority: task.priority,
            estimatedHours: task.estimated_hours,
            dependencies: task.dependencies,
          },
        });
        updatedCount++;
      } catch (error) {
        logger.warn(`Failed to update task ${task.id} with SPARC context:`, error);
      }
    }

    return updatedCount;
  }

  /**
   * Creates database entities (Features, Epics) from SPARC project.
   */
  private async createDatabaseEntitiesFromSPARC(
    project: SPARCProject
  ): Promise<number> {
    let createdCount = 0;

    // Create Epic from SPARC project
    const epic = await this.coordinationDao.create({
      title: `${project.name} Implementation`,
      description: project.description,
      businessValue: this.extractBusinessValue(project),
      sparcProjectId: project.id,
      status: this.mapSPARCStatusToEpicStatus(project.status),
    });
    createdCount++;

    // Create Features from SPARC deliverables
    const features = await this.createFeaturesFromSPARC(project);
    for (const feature of features) {
      await this.coordinationDao.create({
        ...feature,
        epicId: epic.id,
        sparcProjectId: project.id,
      });
      createdCount++;
    }

    return createdCount;
  }

  /**
   * Store coordination state in memory system for cross-session persistence.
   */
  private async storeCoordinationInMemory(
    project: SPARCProject
  ): Promise<string[]> {
    const memoryKeys: string[] = [];

    // Store SPARC project coordination state
    const projectKey = `sparc-coordination:${project.id}`;
    await this.memorySystem.store(projectKey, {
      projectId: project.id,
      name: project.name,
      domain: project.domain,
      currentPhase: project.currentPhase,
      status: project.status,
      lastUpdated: new Date().toISOString(),
      coordinationContext: {
        readyForSwarmAssignment: true,
        taskCount: project.phases?.length || 0,
        complexityLevel: project.complexity,
      },
    });
    memoryKeys.push(projectKey);

    // Store phase-specific coordination context
    for (const phase of project.phases || []) {
      const phaseKey = `sparc-phase:${project.id}:${phase.phase}`;
      await this.memorySystem.store(phaseKey, {
        phase: phase.phase,
        status: phase.status,
        deliverables: phase.deliverables,
        metrics: phase.metrics,
        sparcProjectId: project.id,
        coordinationReady: phase.status === 'completed',
      });
      memoryKeys.push(phaseKey);
    }

    return memoryKeys;
  }

  // Legacy method - kept for backward compatibility but now database-only
  async updateTasksWithSPARC(project: SPARCProject): Promise<void> {
    await this.updateTasksWithSPARCMetadata(project);
  }

  // Legacy method - kept for backward compatibility but now database-only  
  async createADRFiles(project: SPARCProject): Promise<void> {
    // Store ADR content in database instead of files
    const adrs = await this.generateADRFromSPARC(project);
    for (const adr of adrs) {
      await this.coordinationDao.create({
        sparcProjectId: project.id,
        title: adr.title,
        content: this.formatADRContent(adr),
        phase: adr.phase,
        status: adr.status,
      });
    }
  }

  // Legacy method - kept for backward compatibility but now database-only
  async createPRDFile(project: SPARCProject): Promise<void> {
    // Store PRD content in database instead of files
    const prd = await this.generatePRDFromSPARC(project);
    await this.coordinationDao.create({
      sparcProjectId: project.id,
      title: prd.title,
      content: this.formatPRDContent(prd),
      version: prd.version,
    });
  }

  /**
   * Generate tasks from SPARC project for coordination.
   */
  private async generateTasksFromSPARC(project: SPARCProject): Promise<Task[]> {
    const tasks: Task[] = [];

    // Generate tasks from each SPARC phase
    for (const phase of project.phases || []) {
      const phaseTasks = this.generateTasksForPhase(project, phase);
      tasks.push(...phaseTasks);
    }

    return tasks;
  }

  /**
   * Generate tasks for a specific SPARC phase.
   */
  private generateTasksForPhase(project: SPARCProject, phase: any): Task[] {
    const tasks: Task[] = [];
    const phaseId = `${project.id}-${phase.phase}`;

    // Create main implementation task for phase
    tasks.push({
      id: `task-${phaseId}-impl`,
      title: `${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)} Implementation`,
      component: project.domain || 'general',
      description: `Implement ${phase.phase} phase for ${project.name}`,
      status: this.mapSPARCStatusToTaskStatus(phase.status),
      priority: this.calculateTaskPriority(phase.phase),
      estimated_hours: this.estimateTaskHours(phase.phase, project.complexity),
      actual_hours: null,
      dependencies: this.getTaskDependencies(phase.phase),
      acceptance_criteria: phase.deliverables || [],
      notes: `Generated from SPARC ${phase.phase} phase`,
      assigned_to: 'swarm-coordinator',
      created_date: new Date().toISOString(),
      completed_date: phase.status === 'completed' ? new Date().toISOString() : null,
      sparc_project_id: project.id,
    });

    return tasks;
  }

  /**
   * Generate Features from SPARC project.
   */
  private async createFeaturesFromSPARC(project: SPARCProject): Promise<any[]> {
    const features: any[] = [];

    // Create a feature for each major deliverable
    for (const phase of project.phases || []) {
      if (phase.deliverables && phase.deliverables.length > 0) {
        features.push({
          id: `feature-${project.id}-${phase.phase}`,
          title: `${project.name} - ${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}`,
          description: `Feature implementation for ${phase.phase} phase`,
          status: this.mapSPARCStatusToFeatureStatus(phase.status),
          userStories: phase.deliverables.map((deliverable: string, index: number) => ({
            id: `story-${project.id}-${phase.phase}-${index}`,
            title: deliverable,
            description: `User story for ${deliverable}`,
            acceptance_criteria: [`${deliverable} is completed`],
            priority: 'medium' as const,
            effort_estimate: 3,
          })),
        });
      }
    }

    return features;
  }

  /**
   * Generate ADRs from SPARC project.
   */
  private async generateADRFromSPARC(project: SPARCProject): Promise<ADR[]> {
    const adrs: ADR[] = [];

    // Generate ADR for architectural decisions
    if (project.phases?.some(p => p.phase === 'architecture')) {
      adrs.push({
        id: `adr-${project.id}-architecture`,
        title: `Architecture Decision for ${project.name}`,
        status: 'accepted',
        context: `Architectural decisions for ${project.name} implementation`,
        decision: `Use ${project.domain} domain architecture pattern`,
        consequences: ['Improved maintainability', 'Clear separation of concerns'],
        date: new Date().toISOString(),
        sparc_project_id: project.id,
        phase: 'architecture',
      });
    }

    return adrs;
  }

  /**
   * Generate PRD from SPARC project.
   */
  private async generatePRDFromSPARC(project: SPARCProject): Promise<PRD> {
    return {
      id: `prd-${project.id}`,
      title: `Product Requirements - ${project.name}`,
      version: '1.0.0',
      overview: project.description,
      objectives: [`Implement ${project.name} using SPARC methodology`],
      success_metrics: ['Implementation completed', 'All phases delivered'],
      user_stories: [],
      functional_requirements: project.phases?.map(p => `${p.phase} phase deliverable`) || [],
      non_functional_requirements: [`${project.complexity} complexity level`],
      constraints: ['SPARC methodology compliance'],
      dependencies: [],
      timeline: 'TBD based on phase completion',
      stakeholders: ['Development team', 'SwarmCommander'],
      sparc_project_id: project.id,
    };
  }

  /**
   * Format ADR content for storage.
   */
  private formatADRContent(adr: ADR): string {
    return `# ${adr.title}

**Status:** ${adr.status}
**Date:** ${adr.date}
**Phase:** ${adr.phase}

## Context
${adr.context}

## Decision
${adr.decision}

## Consequences
${adr.consequences.map(c => `- ${c}`).join('\n')}
`;
  }

  /**
   * Format PRD content for storage.
   */
  private formatPRDContent(prd: PRD): string {
    return `# ${prd.title}

**Version:** ${prd.version}

## Overview
${prd.overview}

## Objectives
${prd.objectives.map(o => `- ${o}`).join('\n')}

## Success Metrics
${prd.success_metrics.map(m => `- ${m}`).join('\n')}

## Functional Requirements
${prd.functional_requirements.map(r => `- ${r}`).join('\n')}

## Non-Functional Requirements
${prd.non_functional_requirements.map(r => `- ${r}`).join('\n')}
`;
  }

  // Helper methods for status mapping and calculation
  private mapSPARCStatusToTaskStatus(status: string): 'todo' | 'in_progress' | 'completed' | 'blocked' {
    switch (status) {
      case 'completed': return 'completed';
      case 'in_progress': return 'in_progress';
      case 'not_started': return 'todo';
      default: return 'todo';
    }
  }

  private mapSPARCStatusToFeatureStatus(status: string): 'backlog' | 'planned' | 'in_progress' | 'completed' {
    switch (status) {
      case 'completed': return 'completed';
      case 'in_progress': return 'in_progress';
      case 'not_started': return 'backlog';
      default: return 'backlog';
    }
  }

  private mapSPARCStatusToEpicStatus(status: string): 'draft' | 'approved' | 'in_progress' | 'completed' {
    switch (status) {
      case 'completed': return 'completed';
      case 'in_progress': return 'in_progress';
      case 'not_started': return 'draft';
      default: return 'draft';
    }
  }

  private calculateTaskPriority(phase: string): number {
    const phasePriorities: Record<string, number> = {
      specification: 5,
      pseudocode: 4,
      architecture: 5,
      refinement: 3,
      completion: 4,
    };
    return phasePriorities[phase] || 3;
  }

  private estimateTaskHours(phase: string, complexity: string): number {
    const baseHours: Record<string, number> = {
      specification: 8,
      pseudocode: 16,
      architecture: 24,
      refinement: 12,
      completion: 20,
    };

    const complexityMultiplier: Record<string, number> = {
      simple: 0.5,
      moderate: 1.0,
      high: 1.5,
      complex: 2.0,
      enterprise: 3.0,
    };

    const base = baseHours[phase] || 8;
    const multiplier = complexityMultiplier[complexity] || 1.0;
    return Math.round(base * multiplier);
  }

  private getTaskDependencies(phase: string): string[] {
    const dependencies: Record<string, string[]> = {
      pseudocode: ['specification'],
      architecture: ['specification', 'pseudocode'],
      refinement: ['architecture'],
      completion: ['refinement'],
    };
    return dependencies[phase] || [];
  }

  private extractBusinessValue(project: SPARCProject): string {
    return `Implements ${project.name} using SPARC methodology for ${project.domain} domain`;
  }
}