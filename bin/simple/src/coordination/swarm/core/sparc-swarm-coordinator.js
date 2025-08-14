import { getLogger } from '../../../config/logging-config.ts';
import { SwarmCoordinator, } from './swarm-coordinator.ts';
const logger = getLogger('SPARCSwarmCoordinator');
export class SPARCSwarmCoordinator extends SwarmCoordinator {
    sparcTasks = new Map();
    sparcMetrics;
    constructor() {
        super();
        this.sparcMetrics = {
            ...this.getDefaultMetrics(),
            sparcTasksTotal: 0,
            sparcTasksCompleted: 0,
            phaseMetrics: this.initializePhaseMetrics(),
            averageSparcCycleTime: 0,
        };
        this.setupSPARCEventHandlers();
    }
    async processFeatureWithSPARC(feature) {
        logger.info(`🎯 Starting SPARC processing for feature: ${feature.title}`);
        const sparcTask = {
            id: `sparc-feature-${feature.id}`,
            type: 'feature',
            sourceDocument: feature,
            currentPhase: 'specification',
            phaseProgress: this.initializePhaseProgress(),
            assignedAgents: this.initializePhaseAgents(),
            status: 'not_started',
            priority: this.mapPriority(feature.priority),
        };
        this.sparcTasks.set(sparcTask.id, sparcTask);
        this.sparcMetrics.sparcTasksTotal++;
        await this.startSPARCCycle(sparcTask);
        this.emit('sparc:feature:started', { sparcTask, feature });
        return sparcTask;
    }
    async processTaskWithSPARC(task) {
        logger.info(`🔧 Starting SPARC processing for task: ${task.title}`);
        const sparcTask = {
            id: `sparc-task-${task.id}`,
            type: 'task',
            sourceDocument: task,
            currentPhase: 'specification',
            phaseProgress: this.initializePhaseProgress(),
            assignedAgents: this.initializePhaseAgents(),
            status: 'not_started',
            priority: this.mapPriority(task.priority),
        };
        this.sparcTasks.set(sparcTask.id, sparcTask);
        this.sparcMetrics.sparcTasksTotal++;
        await this.startSPARCCycle(sparcTask);
        this.emit('sparc:task:started', { sparcTask, task });
        return sparcTask;
    }
    async startSPARCCycle(sparcTask) {
        sparcTask.status = 'in_progress';
        const phases = [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
        ];
        for (const phase of phases) {
            try {
                logger.info(`📋 Executing SPARC phase: ${phase} for ${sparcTask.id}`);
                sparcTask.currentPhase = phase;
                await this.executeSPARCPhase(sparcTask, phase);
                const validation = await this.validatePhaseCompletion(sparcTask, phase);
                if (!validation.passed) {
                    logger.warn(`⚠️ Phase ${phase} validation failed for ${sparcTask.id}`);
                    if (validation.score < 0.6) {
                        await this.retryPhase(sparcTask, phase);
                    }
                }
                this.updatePhaseMetrics(phase, true);
                this.emit('sparc:phase:completed', { sparcTask, phase, validation });
            }
            catch (error) {
                logger.error(`❌ SPARC phase ${phase} failed for ${sparcTask.id}:`, error);
                sparcTask.phaseProgress[phase].status = 'failed';
                sparcTask.status = 'failed';
                this.updatePhaseMetrics(phase, false);
                throw error;
            }
        }
        sparcTask.status = 'completed';
        this.sparcMetrics.sparcTasksCompleted++;
        logger.info(`✅ SPARC cycle completed for ${sparcTask.id}`);
        this.emit('sparc:cycle:completed', { sparcTask });
    }
    async executeSPARCPhase(sparcTask, phase) {
        const phaseResult = sparcTask.phaseProgress[phase];
        phaseResult.status = 'in_progress';
        if (phaseResult?.metrics) {
            phaseResult.metrics.startTime = new Date();
        }
        const phaseAgents = this.selectPhaseAgents(phase, sparcTask);
        sparcTask.assignedAgents[phase] = phaseAgents.map((agent) => agent.id);
        if (phaseResult?.metrics) {
            phaseResult.metrics.agentsInvolved = phaseAgents.map((agent) => agent.id);
        }
        switch (phase) {
            case 'specification':
                await this.executeSpecificationPhase(sparcTask, phaseAgents);
                break;
            case 'pseudocode':
                await this.executePseudocodePhase(sparcTask, phaseAgents);
                break;
            case 'architecture':
                await this.executeArchitecturePhase(sparcTask, phaseAgents);
                break;
            case 'refinement':
                await this.executeRefinementPhase(sparcTask, phaseAgents);
                break;
            case 'completion':
                await this.executeCompletionPhase(sparcTask, phaseAgents);
                break;
        }
        phaseResult.status = 'completed';
        if (phaseResult?.metrics) {
            phaseResult.metrics.endTime = new Date();
            phaseResult.metrics.iterationsCount = 1;
        }
    }
    async executeSpecificationPhase(sparcTask, agents) {
        logger.info(`📝 Executing Specification phase for ${sparcTask.id}`);
        for (const agent of agents) {
            if (agent.type === 'analyst' || agent.type === 'requirements_analyst') {
                await this.assignTaskToAgent(agent.id, {
                    id: `spec-${sparcTask.id}-${agent.id}`,
                    type: 'specification',
                    requirements: ['analyze requirements', 'define acceptance criteria'],
                    priority: this.getPriorityValue(sparcTask.priority),
                });
            }
        }
        sparcTask.phaseProgress.specification.artifacts = [
            'requirements-analysis.md',
            'acceptance-criteria.md',
            'constraint-analysis.md',
        ];
    }
    async executePseudocodePhase(sparcTask, agents) {
        logger.info(`📐 Executing Pseudocode phase for ${sparcTask.id}`);
        for (const agent of agents) {
            if (agent.type === 'design-architect' ||
                agent.type === 'system-architect') {
                await this.assignTaskToAgent(agent.id, {
                    id: `pseudo-${sparcTask.id}-${agent.id}`,
                    type: 'pseudocode',
                    requirements: ['design algorithms', 'create pseudocode'],
                    priority: this.getPriorityValue(sparcTask.priority),
                });
            }
        }
        sparcTask.phaseProgress.pseudocode.artifacts = [
            'algorithm-design.md',
            'pseudocode-structure.md',
            'flow-diagrams.md',
        ];
    }
    async executeArchitecturePhase(sparcTask, agents) {
        logger.info(`🏗️ Executing Architecture phase for ${sparcTask.id}`);
        for (const agent of agents) {
            if (agent.type === 'system-architect' || agent.type === 'architect') {
                await this.assignTaskToAgent(agent.id, {
                    id: `arch-${sparcTask.id}-${agent.id}`,
                    type: 'architecture',
                    requirements: ['design system architecture', 'define components'],
                    priority: this.getPriorityValue(sparcTask.priority),
                });
            }
        }
        sparcTask.phaseProgress.architecture.artifacts = [
            'system-architecture.md',
            'component-design.md',
            'interface-specifications.md',
        ];
    }
    async executeRefinementPhase(sparcTask, agents) {
        logger.info(`🔍 Executing Refinement phase for ${sparcTask.id}`);
        for (const agent of agents) {
            if (agent.type === 'reviewer' || agent.type === 'tester') {
                await this.assignTaskToAgent(agent.id, {
                    id: `refine-${sparcTask.id}-${agent.id}`,
                    type: 'refinement',
                    requirements: ['review implementation', 'optimize code'],
                    priority: this.getPriorityValue(sparcTask.priority),
                });
            }
        }
        sparcTask.phaseProgress.refinement.artifacts = [
            'code-review-report.md',
            'optimization-recommendations.md',
            'quality-metrics.md',
        ];
    }
    async executeCompletionPhase(sparcTask, agents) {
        logger.info(`🎯 Executing Completion phase for ${sparcTask.id}`);
        for (const agent of agents) {
            if (agent.type === 'tester' || agent.type === 'deployment-ops') {
                await this.assignTaskToAgent(agent.id, {
                    id: `complete-${sparcTask.id}-${agent.id}`,
                    type: 'completion',
                    requirements: ['final testing', 'deployment preparation'],
                    priority: this.getPriorityValue(sparcTask.priority),
                });
            }
        }
        sparcTask.phaseProgress.completion.artifacts = [
            'test-results.md',
            'deployment-package.zip',
            'completion-report.md',
        ];
    }
    selectPhaseAgents(phase, _sparcTask) {
        const allAgents = this.getAgents();
        const phaseSpecialists = this.getPhaseSpecialists(phase);
        const suitableAgents = allAgents.filter((agent) => phaseSpecialists.includes(agent.type) &&
            (agent.status === 'idle' || agent.status === 'busy'));
        const selectedAgents = suitableAgents
            .sort((a, b) => b.performance.tasksCompleted - a.performance.tasksCompleted)
            .slice(0, Math.min(3, suitableAgents.length));
        if (selectedAgents.length === 0) {
            logger.warn(`⚠️ No suitable agents found for phase ${phase}`);
            return allAgents.filter((agent) => agent.status === 'idle').slice(0, 1);
        }
        return selectedAgents;
    }
    getPhaseSpecialists(phase) {
        const specialists = {
            specification: ['analyst', 'requirements_analyst', 'planner'],
            pseudocode: ['design-architect', 'system-architect', 'coder'],
            architecture: ['system-architect', 'architect', 'database-architect'],
            refinement: ['reviewer', 'tester', 'optimizer'],
            completion: ['tester', 'deployment-ops', 'production-validator'],
        };
        return specialists[phase] || ['specialist'];
    }
    async validatePhaseCompletion(sparcTask, phase) {
        const phaseResult = sparcTask.phaseProgress[phase];
        const hasArtifacts = phaseResult?.artifacts.length > 0;
        const hasAgents = phaseResult?.metrics?.agentsInvolved.length > 0;
        const hasTimestamps = phaseResult?.metrics?.startTime && phaseResult?.metrics?.endTime;
        const validationChecks = [hasArtifacts, hasAgents, hasTimestamps];
        const score = validationChecks.filter(Boolean).length / validationChecks.length;
        const feedback = [];
        if (!hasArtifacts)
            feedback.push(`Phase ${phase} produced no artifacts`);
        if (!hasAgents)
            feedback.push(`No agents were assigned to phase ${phase}`);
        if (!hasTimestamps)
            feedback.push(`Phase ${phase} timing not recorded`);
        phaseResult.validation = {
            passed: score >= 0.8,
            score,
            feedback,
        };
        return phaseResult?.validation;
    }
    async retryPhase(sparcTask, phase) {
        logger.info(`🔄 Retrying SPARC phase: ${phase} for ${sparcTask.id}`);
        sparcTask.phaseProgress[phase].status = 'not_started';
        if (sparcTask.phaseProgress[phase]?.metrics) {
            sparcTask.phaseProgress[phase].metrics.iterationsCount++;
        }
        await this.executeSPARCPhase(sparcTask, phase);
    }
    getSPARCMetrics() {
        return this.sparcMetrics;
    }
    getActiveSPARCTasks() {
        return Array.from(this.sparcTasks.values()).filter((task) => task.status === 'in_progress');
    }
    getSPARCTask(taskId) {
        return this.sparcTasks.get(taskId);
    }
    setupSPARCEventHandlers() {
        this.on('sparc:phase:completed', this.handlePhaseCompleted.bind(this));
        this.on('sparc:cycle:completed', this.handleCycleCompleted.bind(this));
    }
    handlePhaseCompleted(event) {
        logger.debug(`Phase ${event.phase} completed for ${event.sparcTask.id}`);
    }
    handleCycleCompleted(event) {
        logger.info(`SPARC cycle completed for ${event.sparcTask.id}`);
        this.updateAverageSparcCycleTime(event.sparcTask);
    }
    initializePhaseProgress() {
        const phases = [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
        ];
        const progress = {};
        phases.forEach((phase) => {
            progress[phase] = {
                phase,
                status: 'not_started',
                artifacts: [],
                metrics: {
                    agentsInvolved: [],
                    iterationsCount: 0,
                },
                validation: {
                    passed: false,
                    score: 0,
                    feedback: [],
                },
            };
        });
        return progress;
    }
    initializePhaseAgents() {
        const phases = [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
        ];
        const agents = {};
        phases.forEach((phase) => {
            agents[phase] = [];
        });
        return agents;
    }
    initializePhaseMetrics() {
        const phases = [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
        ];
        const metrics = {};
        phases.forEach((phase) => {
            metrics[phase] = {
                tasksProcessed: 0,
                averageCompletionTime: 0,
                successRate: 0,
            };
        });
        return metrics;
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
    getPriorityValue(priority) {
        const values = { low: 1, medium: 2, high: 3, critical: 4 };
        return values[priority];
    }
    updatePhaseMetrics(phase, success) {
        const metrics = this.sparcMetrics.phaseMetrics[phase];
        metrics.tasksProcessed++;
        if (success) {
            const totalSuccesses = metrics.tasksProcessed * metrics.successRate + 1;
            metrics.successRate = totalSuccesses / metrics.tasksProcessed;
        }
        else {
            const totalSuccesses = metrics.tasksProcessed * metrics.successRate;
            metrics.successRate = totalSuccesses / metrics.tasksProcessed;
        }
    }
    updateAverageSparcCycleTime(sparcTask) {
        const phases = Object.values(sparcTask.phaseProgress);
        const startTime = phases.length > 0 ? phases[0]?.metrics.startTime : undefined;
        const endTime = phases.length > 0
            ? phases[phases.length - 1]?.metrics.endTime
            : undefined;
        if (startTime && endTime) {
            const cycleTime = endTime.getTime() - startTime.getTime();
            const currentAvg = this.sparcMetrics.averageSparcCycleTime;
            const completed = this.sparcMetrics.sparcTasksCompleted;
            this.sparcMetrics.averageSparcCycleTime =
                (currentAvg * (completed - 1) + cycleTime) / completed;
        }
    }
    getDefaultMetrics() {
        return {
            agentCount: 0,
            activeAgents: 0,
            totalTasks: 0,
            completedTasks: 0,
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            uptime: 0,
        };
    }
    async assignTaskToAgent(agentId, task) {
        logger.debug(`Assigning task ${task.id} to agent ${agentId}`);
        return Promise.resolve();
    }
}
//# sourceMappingURL=sparc-swarm-coordinator.js.map