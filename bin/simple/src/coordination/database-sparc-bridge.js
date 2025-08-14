import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import { generateId } from '../core/helpers.ts';
const logger = getLogger('DatabaseSPARCBridge');
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
    async initialize() {
        logger.info('🌉 Initializing Database-SPARC Bridge');
        await this.databaseSystem.initialize();
        await this.sparcSwarm.initialize();
        this.setupDatabaseListeners();
        this.setupSPARCListeners();
        logger.info('✅ Database-SPARC Bridge ready');
        this.emit('bridge:initialized');
    }
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
        const sparcTask = await this.sparcSwarm.processFeatureWithSPARC(feature);
        this.emit('work:assigned', { assignment, sparcTask });
        return assignment.id;
    }
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
        const sparcTask = await this.sparcSwarm.processTaskWithSPARC(task);
        this.emit('work:assigned', { assignment, sparcTask });
        return assignment.id;
    }
    async getWorkStatus() {
        const activeAssignments = Array.from(this.activeAssignments.values());
        const completedWork = Array.from(this.completedWork.values());
        const successfulCompletions = completedWork.filter((work) => work.status === 'completed').length;
        const averageTime = completedWork.length > 0
            ? completedWork.reduce((sum, work) => sum + work.metrics.totalTimeMs, 0) / completedWork.length
            : 0;
        return {
            active: activeAssignments,
            completed: completedWork,
            metrics: {
                totalAssignments: activeAssignments.length + completedWork.length,
                completedAssignments: completedWork.length,
                averageCompletionTime: averageTime,
                successRate: completedWork.length > 0
                    ? successfulCompletions / completedWork.length
                    : 0,
            },
        };
    }
    async handleSPARCCompletion(sparcTask) {
        logger.info(`🎯 Processing SPARC completion: ${sparcTask.id}`);
        const assignment = Array.from(this.activeAssignments.values()).find((a) => a.document.id === sparcTask.sourceDocument.id);
        if (!assignment) {
            logger.error(`No assignment found for completed SPARC task: ${sparcTask.id}`);
            return;
        }
        const result = {
            workAssignmentId: assignment.id,
            sparcTaskId: sparcTask.id,
            status: sparcTask.status === 'completed' ? 'completed' : 'failed',
            artifacts: this.extractArtifacts(sparcTask),
            metrics: this.calculateMetrics(sparcTask),
            completionReport: this.generateCompletionReport(sparcTask),
        };
        await this.updateDocumentWithResults(assignment, result);
        this.activeAssignments.delete(assignment.id);
        this.completedWork.set(assignment.id, result);
        this.emit('work:completed', { assignment, result });
        logger.info(`✅ Work completed: ${assignment.id}`);
    }
    async updateDocumentWithResults(assignment, result) {
        const document = assignment.document;
        const updatedDocument = {
            ...document,
            status: result?.status === 'completed'
                ? 'approved'
                : 'draft',
            completion_percentage: result?.status === 'completed'
                ? 100
                : result?.status === 'partial'
                    ? 75
                    : 0,
            workflow_stage: 'sparc-completed',
            sparc_implementation: {
                task_id: result?.sparcTaskId,
                completion_date: new Date(),
                artifacts: result?.artifacts,
                metrics: result?.metrics,
                methodology_applied: 'SPARC',
                quality_score: result?.metrics?.qualityScore,
            },
        };
        if (assignment.type === 'feature') {
            await this.documentService.updateDocument(document.id, updatedDocument);
        }
        else {
            await this.documentService.updateDocument(document.id, updatedDocument);
        }
        logger.info(`📝 Updated document ${document.id} with SPARC results`);
    }
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
    calculateMetrics(sparcTask) {
        const phases = Object.values(sparcTask.phaseProgress);
        const allAgents = phases.flatMap((p) => p.metrics.agentsInvolved);
        const startTime = phases[0]?.metrics?.startTime;
        const endTime = phases[phases.length - 1]?.metrics?.endTime;
        const totalTime = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;
        const phaseTimes = {};
        phases.forEach((phase) => {
            if (phase.metrics?.startTime && phase.metrics?.endTime) {
                phaseTimes[phase.phase] =
                    phase.metrics.endTime.getTime() - phase.metrics.startTime.getTime();
            }
        });
        const validationScores = phases.map((p) => p.validation?.score || 0);
        const qualityScore = validationScores.reduce((sum, score) => sum + score, 0) /
            (validationScores.length || 1);
        return {
            totalTimeMs: totalTime,
            phaseTimes,
            agentsUsed: [...new Set(allAgents)],
            qualityScore,
        };
    }
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
    setupDatabaseListeners() {
        this.databaseSystem.on('document:processed', async (event) => {
            const { document } = event;
            if (document.type === 'feature' &&
                this.shouldAutoAssignToSparc(document)) {
                await this.assignFeatureToSparcs(document);
            }
            else if (document.type === 'task' &&
                this.shouldAutoAssignToSparc(document)) {
                await this.assignTaskToSparcs(document);
            }
        });
    }
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
        this.on('work:assigned', (event) => {
            logger.debug(`Work assigned: ${event.assignment.id}`);
        });
        this.on('work:completed', (event) => {
            logger.info(`Work completed: ${event.assignment.id}`);
        });
    }
    shouldAutoAssignToSparc(document) {
        return (document.priority === 'high' ||
            document.priority === 'critical' ||
            document.tags?.includes('sparc-auto-assign') ||
            document.workflow_stage === 'ready-for-implementation');
    }
    mapPriority(priority) {
        const mapping = {
            low: 'low',
            medium: 'medium',
            high: 'high',
            critical: 'critical',
        };
        return mapping[priority] || 'medium';
    }
    getStatus() {
        const sparcMetrics = this.sparcSwarm.getSPARCMetrics();
        return {
            bridgeStatus: 'active',
            activeAssignments: this.activeAssignments.size,
            completedWork: this.completedWork.size,
            sparcSwarmStatus: `${sparcMetrics.totalTasks} tasks, ${sparcMetrics.completedTasks} completed`,
            databaseConnection: true,
        };
    }
}
export { DatabaseSPARCBridge };
//# sourceMappingURL=database-sparc-bridge.js.map