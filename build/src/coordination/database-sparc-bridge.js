/**
 * Database-SPARC Bridge.
 *
 * Connects the database-driven product flow with SPARC swarm coordination.
 *
 * Flow:
 * 1. DatabaseDrivenSystem generates Features/Tasks
 * 2. DatabaseSPARCBridge receives assignments
 * 3. SPARCSwarmCoordinator processes using SPARC methodology
 * 4. Results are stored back in database.
 */
/**
 * @file Coordination system: database-sparc-bridge.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import { generateId } from '../core/helpers.ts';
const logger = getLogger('DatabaseSPARCBridge');
/**
 * Bridge between Database-Driven Product Flow and SPARC Swarm Coordination.
 *
 * @example
 */
class DatabaseSPARCBridge extends EventEmitter {
    databaseSystem;
    documentService;
    sparcSwarm;
    activeAssignments = new Map();
    completedWork = new Map();
    constructor(databaseSystem, documentService, sparcSwarm) {
        super();
        this.databaseSystem = databaseSystem;
        this.documentService = documentService;
        this.sparcSwarm = sparcSwarm;
        this.setupEventHandlers();
    }
    /**
     * Initialize the bridge and establish connections.
     */
    async initialize() {
        logger.info('🌉 Initializing Database-SPARC Bridge');
        // Initialize components
        await this.databaseSystem.initialize();
        await this.sparcSwarm.initialize();
        // Setup listeners for database-driven workflow events
        this.setupDatabaseListeners();
        this.setupSPARCListeners();
        logger.info('✅ Database-SPARC Bridge ready');
        this.emit('bridge:initialized');
    }
    /**
     * Assign a Feature to SPARC swarm for implementation.
     *
     * @param feature
     */
    async assignFeatureToSparcs(feature) {
        logger.info(`📋 Assigning feature to SPARC swarm: ${feature.title}`);
        const assignment = {
            id: `assignment-feature-${feature.id}`,
            type: 'feature',
            document: feature,
            assignedTo: 'sparc-swarm',
            priority: this.mapPriority(feature.priority),
            requirements: feature.acceptance_criteria || [],
            context: {
                projectId: feature.project_id ?? generateId(),
                ...(feature.parent_document_id !== undefined && {
                    parentDocumentId: feature.parent_document_id,
                }),
                relatedDocuments: feature.related_documents || [],
            },
        };
        this.activeAssignments.set(assignment.id, assignment);
        // Start SPARC processing
        const sparcTask = await this.sparcSwarm.processFeatureWithSPARC(feature);
        this.emit('work:assigned', { assignment, sparcTask });
        return assignment.id;
    }
    /**
     * Assign a Task to SPARC swarm for implementation.
     *
     * @param task
     */
    async assignTaskToSparcs(task) {
        logger.info(`🔧 Assigning task to SPARC swarm: ${task.title}`);
        const assignment = {
            id: `assignment-task-${task.id}`,
            type: 'task',
            document: task,
            assignedTo: 'sparc-swarm',
            priority: this.mapPriority(task.priority),
            requirements: task.implementation_details?.files_to_create || [],
            context: {
                projectId: task.project_id ?? generateId(),
                ...(task.parent_document_id !== undefined && {
                    parentDocumentId: task.parent_document_id,
                }),
                relatedDocuments: task.related_documents || [],
            },
        };
        this.activeAssignments.set(assignment.id, assignment);
        // Start SPARC processing
        const sparcTask = await this.sparcSwarm.processTaskWithSPARC(task);
        this.emit('work:assigned', { assignment, sparcTask });
        return assignment.id;
    }
    /**
     * Get status of all active work assignments.
     */
    async getWorkStatus() {
        const activeAssignments = Array.from(this.activeAssignments.values());
        const completedWork = Array.from(this.completedWork.values());
        const successfulCompletions = completedWork.filter((work) => work.status === 'completed').length;
        const averageTime = completedWork.length > 0
            ? completedWork.reduce((sum, work) => sum + work.metrics.totalTimeMs, 0) /
                completedWork.length
            : 0;
        return {
            active: activeAssignments,
            completed: completedWork,
            metrics: {
                totalAssignments: activeAssignments.length + completedWork.length,
                completedAssignments: completedWork.length,
                averageCompletionTime: averageTime,
                successRate: completedWork.length > 0 ? successfulCompletions / completedWork.length : 0,
            },
        };
    }
    /**
     * Process completion of SPARC work and update database.
     *
     * @param sparcTask
     */
    async handleSPARCCompletion(sparcTask) {
        logger.info(`🎯 Processing SPARC completion: ${sparcTask.id}`);
        // Find the original assignment
        const assignment = Array.from(this.activeAssignments.values()).find((a) => a.document.id === sparcTask.sourceDocument.id);
        if (!assignment) {
            logger.error(`No assignment found for completed SPARC task: ${sparcTask.id}`);
            return;
        }
        // Create implementation result
        const result = {
            workAssignmentId: assignment.id,
            sparcTaskId: sparcTask.id,
            status: sparcTask.status === 'completed' ? 'completed' : 'failed',
            artifacts: this.extractArtifacts(sparcTask),
            metrics: this.calculateMetrics(sparcTask),
            completionReport: this.generateCompletionReport(sparcTask),
        };
        // Update database with implementation results
        await this.updateDocumentWithResults(assignment, result);
        // Move from active to completed
        this.activeAssignments.delete(assignment.id);
        this.completedWork.set(assignment.id, result);
        this.emit('work:completed', { assignment, result });
        logger.info(`✅ Work completed: ${assignment.id}`);
    }
    /**
     * Update the original document with SPARC implementation results.
     *
     * @param assignment
     * @param result
     */
    async updateDocumentWithResults(assignment, result) {
        const document = assignment.document;
        // Update document with SPARC implementation details
        const updatedDocument = {
            ...document,
            status: result?.status === 'completed' ? 'approved' : 'draft',
            completion_percentage: result?.status === 'completed' ? 100 : result?.status === 'partial' ? 75 : 0,
            workflow_stage: 'sparc-completed',
            // Add SPARC-specific fields
            sparc_implementation: {
                task_id: result?.sparcTaskId,
                completion_date: new Date(),
                artifacts: result?.artifacts,
                metrics: result?.metrics,
                methodology_applied: 'SPARC',
                quality_score: result?.metrics?.qualityScore,
            },
        };
        // Save to database
        if (assignment.type === 'feature') {
            await this.documentService.updateDocument(document.id, updatedDocument);
        }
        else {
            await this.documentService.updateDocument(document.id, updatedDocument);
        }
        logger.info(`📝 Updated document ${document.id} with SPARC results`);
    }
    /**
     * Extract artifacts from completed SPARC task.
     *
     * @param sparcTask
     */
    extractArtifacts(sparcTask) {
        const phases = Object.values(sparcTask.phaseProgress);
        return {
            specification: phases.find((p) => p.phase === 'specification')?.artifacts || [],
            pseudocode: phases.find((p) => p.phase === 'pseudocode')?.artifacts || [],
            architecture: phases.find((p) => p.phase === 'architecture')?.artifacts || [],
            implementation: phases.find((p) => p.phase === 'completion')?.artifacts || [],
            tests: phases
                .find((p) => p.phase === 'completion')
                ?.artifacts?.filter((a) => a.includes('test')) || [],
            documentation: [
                ...(phases.find((p) => p.phase === 'specification')?.artifacts || []),
                ...(phases.find((p) => p.phase === 'architecture')?.artifacts || []),
            ],
        };
    }
    /**
     * Calculate metrics from SPARC task execution.
     *
     * @param sparcTask
     */
    calculateMetrics(sparcTask) {
        const phases = Object.values(sparcTask.phaseProgress);
        const allAgents = phases.flatMap((p) => p.metrics.agentsInvolved);
        // Calculate total time
        const startTime = phases[0]?.metrics?.startTime;
        const endTime = phases[phases.length - 1]?.metrics?.endTime;
        const totalTime = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;
        // Calculate phase times
        const phaseTimes = {};
        phases.forEach((phase) => {
            if (phase.metrics?.startTime && phase.metrics?.endTime) {
                phaseTimes[phase.phase] =
                    phase.metrics.endTime.getTime() - phase.metrics.startTime.getTime();
            }
        });
        // Calculate quality score based on validation results
        const validationScores = phases.map((p) => p.validation?.score || 0);
        const qualityScore = validationScores.reduce((sum, score) => sum + score, 0) / (validationScores.length || 1);
        return {
            totalTimeMs: totalTime,
            phaseTimes,
            agentsUsed: [...new Set(allAgents)],
            qualityScore,
        };
    }
    /**
     * Generate completion report.
     *
     * @param sparcTask
     */
    generateCompletionReport(sparcTask) {
        const document = sparcTask.sourceDocument;
        const phases = Object.values(sparcTask.phaseProgress);
        const report = `
# SPARC Implementation Report

**Document**: ${document.title}
**Type**: ${sparcTask.type.toUpperCase()}
**Status**: ${sparcTask.status.toUpperCase()}
**Completion Date**: ${new Date().toISOString()}

## Phase Summary

${phases
            .map((phase) => `
### ${phase.phase?.toUpperCase() || 'UNKNOWN'} Phase
- **Status**: ${phase.status}
- **Agents**: ${phase.metrics?.agentsInvolved?.length || 0}
- **Artifacts**: ${phase.artifacts?.length || 0}
- **Quality Score**: ${((phase.validation?.score || 0) * 100).toFixed(1)}%
- **Iterations**: ${phase.metrics?.iterationsCount || 0}
`)
            .join('\n')}

## Overall Results
- **Total Agents Used**: ${[...new Set(phases.flatMap((p) => p.metrics?.agentsInvolved || []))].length}
- **Total Artifacts**: ${phases.reduce((sum, p) => sum + (p.artifacts?.length || 0), 0)}
- **Average Quality**: ${((phases.reduce((sum, p) => sum + (p.validation?.score || 0), 0) / (phases.length || 1)) * 100).toFixed(1)}%

## Methodology Applied
This implementation used the SPARC methodology (Specification → Pseudocode → Architecture → Refinement → Completion) with distributed swarm coordination.

---
*Generated by Database-SPARC Bridge*
`;
        return report.trim();
    }
    /**
     * Setup event handlers for database system.
     */
    setupDatabaseListeners() {
        this.databaseSystem.on('document:processed', async (event) => {
            const { document } = event;
            // Auto-assign Features and Tasks to SPARC swarm if they meet criteria
            if (document.type === 'feature' && this.shouldAutoAssignToSparc(document)) {
                await this.assignFeatureToSparcs(document);
            }
            else if (document.type === 'task' && this.shouldAutoAssignToSparc(document)) {
                await this.assignTaskToSparcs(document);
            }
        });
    }
    /**
     * Setup event handlers for SPARC swarm.
     */
    setupSPARCListeners() {
        this.sparcSwarm.on('sparc:cycle:completed', async (event) => {
            await this.handleSPARCCompletion(event.sparcTask);
        });
        this.sparcSwarm.on('sparc:phase:completed', (event) => {
            logger.debug(`SPARC phase ${event.phase} completed for ${event.sparcTask.id}`);
            this.emit('sparc:phase:update', event);
        });
    }
    setupEventHandlers() {
        // Bridge-specific event handlers
        this.on('work:assigned', (event) => {
            logger.debug(`Work assigned: ${event.assignment.id}`);
        });
        this.on('work:completed', (event) => {
            logger.info(`Work completed: ${event.assignment.id}`);
        });
    }
    /**
     * Determine if a document should be auto-assigned to SPARC swarm.
     *
     * @param document
     */
    shouldAutoAssignToSparc(document) {
        // Auto-assign high-priority items or items tagged for swarm processing
        return (document.priority === 'high' ||
            document.priority === 'critical' ||
            document.tags?.includes('sparc-auto-assign') ||
            document.workflow_stage === 'ready-for-implementation');
    }
    /**
     * Map document priority to work assignment priority.
     *
     * @param priority
     */
    mapPriority(priority) {
        const mapping = {
            low: 'low',
            medium: 'medium',
            high: 'high',
            critical: 'critical',
        };
        return mapping[priority] || 'medium';
    }
    /**
     * Get bridge status and metrics.
     */
    getStatus() {
        const sparcMetrics = this.sparcSwarm.getSPARCMetrics();
        return {
            bridgeStatus: 'active',
            activeAssignments: this.activeAssignments.size,
            completedWork: this.completedWork.size,
            sparcSwarmStatus: `${sparcMetrics.totalTasks} tasks, ${sparcMetrics.completedTasks} completed`,
            databaseConnection: true, // Would check actual connection
        };
    }
}
export { DatabaseSPARCBridge };
