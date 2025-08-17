/**
 * @file Database-driven SPARC coordination integration.
 */
import { getLogger } from '../../../../config/logging-config';
const logger = getLogger('coordination-swarm-sparc-integrations-project-management-integration');
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
const TaskAPI = CoordinationAPI.tasks;
import { TaskCoordinator } from '../../../task-coordinator';
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
    taskTool;
    memorySystem;
    coordinationDao;
    logger;
    constructor(memorySystem, coordinationDao, logger) {
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
    async updateDatabaseWithSPARC(project, coordinationOptions = {
        updateTasks: true,
        createEpicFeatures: true,
        enableMemoryStorage: true,
    }) {
        logger.info('Starting database-driven SPARC coordination', {
            projectId: project.id,
            projectName: project.name,
            options: coordinationOptions,
        });
        const results = {
            tasksUpdated: 0,
            entitiesCreated: 0,
            coordinationMemoryKeys: [],
        };
        // Database coordination operations
        if (coordinationOptions.updateTasks) {
            results.tasksUpdated = await this.updateTasksWithSPARCMetadata(project);
        }
        if (coordinationOptions.createEpicFeatures) {
            results.entitiesCreated = await this.createDatabaseEntitiesFromSPARC(project);
        }
        if (coordinationOptions.enableMemoryStorage) {
            results.coordinationMemoryKeys = await this.storeCoordinationInMemory(project);
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
    async getTasksForSwarmAssignment(filters = {}) {
        // Use coordination DAO to query tasks with SPARC context
        return this.coordinationDao.findBy({ ...filters, type: 'sparc_task' });
    }
    /**
     * Updates existing tasks with SPARC project metadata in database.
     */
    async updateTasksWithSPARCMetadata(project) {
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
            }
            catch (error) {
                logger.warn(`Failed to update task ${task.id} with SPARC context:`, error);
            }
        }
        return updatedCount;
    }
    /**
     * Creates database entities (Features, Epics) from SPARC project.
     */
    async createDatabaseEntitiesFromSPARC(project) {
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
    async storeCoordinationInMemory(project) {
        const memoryKeys = [];
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
    async updateTasksWithSPARC(project) {
        await this.updateTasksWithSPARCMetadata(project);
    }
    // Legacy method - kept for backward compatibility but now database-only  
    async createADRFiles(project) {
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
    async createPRDFile(project) {
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
    async generateTasksFromSPARC(project) {
        const tasks = [];
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
    generateTasksForPhase(project, phase) {
        const tasks = [];
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
    async createFeaturesFromSPARC(project) {
        const features = [];
        // Create a feature for each major deliverable
        for (const phase of project.phases || []) {
            if (phase.deliverables && phase.deliverables.length > 0) {
                features.push({
                    id: `feature-${project.id}-${phase.phase}`,
                    title: `${project.name} - ${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}`,
                    description: `Feature implementation for ${phase.phase} phase`,
                    status: this.mapSPARCStatusToFeatureStatus(phase.status),
                    userStories: phase.deliverables.map((deliverable, index) => ({
                        id: `story-${project.id}-${phase.phase}-${index}`,
                        title: deliverable,
                        description: `User story for ${deliverable}`,
                        acceptance_criteria: [`${deliverable} is completed`],
                        priority: 'medium',
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
    async generateADRFromSPARC(project) {
        const adrs = [];
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
    async generatePRDFromSPARC(project) {
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
    formatADRContent(adr) {
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
    formatPRDContent(prd) {
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
    mapSPARCStatusToTaskStatus(status) {
        switch (status) {
            case 'completed': return 'completed';
            case 'in_progress': return 'in_progress';
            case 'not_started': return 'todo';
            default: return 'todo';
        }
    }
    mapSPARCStatusToFeatureStatus(status) {
        switch (status) {
            case 'completed': return 'completed';
            case 'in_progress': return 'in_progress';
            case 'not_started': return 'backlog';
            default: return 'backlog';
        }
    }
    mapSPARCStatusToEpicStatus(status) {
        switch (status) {
            case 'completed': return 'completed';
            case 'in_progress': return 'in_progress';
            case 'not_started': return 'draft';
            default: return 'draft';
        }
    }
    calculateTaskPriority(phase) {
        const phasePriorities = {
            specification: 5,
            pseudocode: 4,
            architecture: 5,
            refinement: 3,
            completion: 4,
        };
        return phasePriorities[phase] || 3;
    }
    estimateTaskHours(phase, complexity) {
        const baseHours = {
            specification: 8,
            pseudocode: 16,
            architecture: 24,
            refinement: 12,
            completion: 20,
        };
        const complexityMultiplier = {
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
    getTaskDependencies(phase) {
        const dependencies = {
            pseudocode: ['specification'],
            architecture: ['specification', 'pseudocode'],
            refinement: ['architecture'],
            completion: ['refinement'],
        };
        return dependencies[phase] || [];
    }
    extractBusinessValue(project) {
        return `Implements ${project.name} using SPARC methodology for ${project.domain} domain`;
    }
}
//# sourceMappingURL=project-management-integration.js.map