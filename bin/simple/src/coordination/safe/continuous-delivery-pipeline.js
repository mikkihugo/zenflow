import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export var SPARCPhase;
(function (SPARCPhase) {
    SPARCPhase["SPECIFICATION"] = "specification";
    SPARCPhase["PSEUDOCODE"] = "pseudocode";
    SPARCPhase["ARCHITECTURE"] = "architecture";
    SPARCPhase["REFINEMENT"] = "refinement";
    SPARCPhase["COMPLETION"] = "completion";
})(SPARCPhase || (SPARCPhase = {}));
export var StageType;
(function (StageType) {
    StageType["BUILD"] = "build";
    StageType["TEST"] = "test";
    StageType["SECURITY"] = "security";
    StageType["QUALITY"] = "quality";
    StageType["DEPLOY"] = "deploy";
    StageType["MONITOR"] = "monitor";
    StageType["APPROVAL"] = "approval";
})(StageType || (StageType = {}));
export var QualityGateType;
(function (QualityGateType) {
    QualityGateType["CODE_QUALITY"] = "code_quality";
    QualityGateType["TEST_COVERAGE"] = "test_coverage";
    QualityGateType["SECURITY_SCAN"] = "security_scan";
    QualityGateType["PERFORMANCE"] = "performance";
    QualityGateType["COMPLIANCE"] = "compliance";
    QualityGateType["ARCHITECTURE"] = "architecture";
    QualityGateType["BUSINESS_VALIDATION"] = "business_validation";
})(QualityGateType || (QualityGateType = {}));
export var AutomationType;
(function (AutomationType) {
    AutomationType["BUILD"] = "build";
    AutomationType["TEST"] = "test";
    AutomationType["DEPLOY"] = "deploy";
    AutomationType["NOTIFICATION"] = "notification";
    AutomationType["APPROVAL"] = "approval";
    AutomationType["ROLLBACK"] = "rollback";
    AutomationType["MONITORING"] = "monitoring";
})(AutomationType || (AutomationType = {}));
export var PipelineStatus;
(function (PipelineStatus) {
    PipelineStatus["PENDING"] = "pending";
    PipelineStatus["RUNNING"] = "running";
    PipelineStatus["SUCCESS"] = "success";
    PipelineStatus["FAILED"] = "failed";
    PipelineStatus["CANCELLED"] = "cancelled";
    PipelineStatus["TIMEOUT"] = "timeout";
})(PipelineStatus || (PipelineStatus = {}));
export var StageStatus;
(function (StageStatus) {
    StageStatus["PENDING"] = "pending";
    StageStatus["RUNNING"] = "running";
    StageStatus["SUCCESS"] = "success";
    StageStatus["FAILED"] = "failed";
    StageStatus["SKIPPED"] = "skipped";
    StageStatus["CANCELLED"] = "cancelled";
})(StageStatus || (StageStatus = {}));
export class ContinuousDeliveryPipelineManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    swarmOrchestrator;
    valueStreamMapper;
    config;
    state;
    monitoringTimer;
    cleanupTimer;
    constructor(eventBus, memory, swarmOrchestrator, valueStreamMapper, config = {}) {
        super();
        this.logger = getLogger('cd-pipeline-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.swarmOrchestrator = swarmOrchestrator;
        this.valueStreamMapper = valueStreamMapper;
        this.config = {
            enableSPARCIntegration: true,
            enableAutomatedGates: true,
            enableDeploymentAutomation: true,
            enablePerformanceMonitoring: true,
            enableValueStreamIntegration: true,
            pipelineTimeout: 7200000,
            stageTimeout: 1800000,
            qualityGateTimeout: 600000,
            deploymentTimeout: 1200000,
            monitoringInterval: 60000,
            maxConcurrentPipelines: 20,
            retryAttempts: 3,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Continuous Delivery Pipeline Manager', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            await this.initializePipelineTemplates();
            await this.initializeQualityGateTemplates();
            if (this.config.enablePerformanceMonitoring) {
                this.startPerformanceMonitoring();
            }
            this.startPeriodicCleanup();
            this.registerEventHandlers();
            this.logger.info('CD Pipeline Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize CD Pipeline Manager', { error });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down CD Pipeline Manager');
        if (this.monitoringTimer)
            clearInterval(this.monitoringTimer);
        if (this.cleanupTimer)
            clearInterval(this.cleanupTimer);
        await this.cancelActivePipelines();
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('CD Pipeline Manager shutdown complete');
    }
    async mapSPARCToPipelineStages() {
        this.logger.info('Mapping SPARC phases to CD pipeline stages');
        const pipelineTemplates = new Map();
        const standardPipeline = await this.createStandardPipelineFromSPARC();
        pipelineTemplates.set('standard', standardPipeline);
        const microservicePipeline = await this.createMicroservicePipelineFromSPARC();
        pipelineTemplates.set('microservice', microservicePipeline);
        const libraryPipeline = await this.createLibraryPipelineFromSPARC();
        pipelineTemplates.set('library', libraryPipeline);
        this.state.pipelineTemplates = pipelineTemplates;
        this.logger.info('SPARC to CD pipeline mapping completed', {
            templateCount: pipelineTemplates.size,
        });
        return pipelineTemplates;
    }
    async executePipelineForSPARCProject(sparcProjectId, featureId, valueStreamId, pipelineType = 'standard') {
        this.logger.info('Starting CD pipeline for SPARC project', {
            sparcProjectId,
            featureId,
            pipelineType,
        });
        const context = {
            pipelineId: `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            featureId,
            valueStreamId,
            sparcProjectId,
            initiator: 'swarm-orchestrator',
            priority: 'medium',
            environment: 'development',
            metadata: {
                pipelineType,
                startedBy: 'sparc-completion',
            },
            startTime: new Date(),
            timeoutAt: new Date(Date.now() + this.config.pipelineTimeout),
        };
        const stageTemplates = this.state.pipelineTemplates.get(pipelineType);
        if (!stageTemplates) {
            throw new Error(`Pipeline template not found: ${pipelineType}`);
        }
        const execution = {
            context,
            status: PipelineStatus.PENDING,
            stages: stageTemplates.map((template) => ({
                stageId: template.id,
                status: StageStatus.PENDING,
                automationResults: [],
                qualityGateResults: [],
                artifacts: [],
                logs: [],
                errors: [],
            })),
            qualityGateResults: [],
            artifacts: [],
            metrics: this.initializePipelineMetrics(),
            errors: [],
        };
        this.state.activePipelines.set(context.pipelineId, execution);
        this.executePipelineAsync(execution, stageTemplates).catch((error) => {
            this.logger.error('Pipeline execution failed', {
                pipelineId: context.pipelineId,
                error,
            });
        });
        this.logger.info('CD pipeline started', {
            pipelineId: context.pipelineId,
            stageCount: stageTemplates.length,
        });
        this.emit('pipeline-started', { execution, stageTemplates });
        return context.pipelineId;
    }
    async createAutomatedQualityGates() {
        this.logger.info('Creating automated quality gates');
        const qualityGates = new Map();
        const codeQualityGate = await this.createCodeQualityGate();
        qualityGates.set(codeQualityGate.id, codeQualityGate);
        const testCoverageGate = await this.createTestCoverageGate();
        qualityGates.set(testCoverageGate.id, testCoverageGate);
        const securityGate = await this.createSecurityGate();
        qualityGates.set(securityGate.id, securityGate);
        const performanceGate = await this.createPerformanceGate();
        qualityGates.set(performanceGate.id, performanceGate);
        const architectureGate = await this.createArchitectureComplianceGate();
        qualityGates.set(architectureGate.id, architectureGate);
        this.state.qualityGateTemplates = qualityGates;
        this.logger.info('Automated quality gates created', {
            gateCount: qualityGates.size,
        });
        return qualityGates;
    }
    async executeQualityGate(gateId, pipelineId, stageId) {
        const gate = this.state.qualityGateTemplates.get(gateId);
        if (!gate) {
            throw new Error(`Quality gate not found: ${gateId}`);
        }
        this.logger.info('Executing quality gate', { gateId, pipelineId, stageId });
        const startTime = Date.now();
        const criterionResults = [];
        let totalScore = 0;
        let totalWeight = 0;
        for (const criterion of gate.criteria) {
            const result = await this.executeCriterion(criterion, pipelineId);
            criterionResults.push(result);
            totalScore += result.contribution;
            totalWeight += result.weight;
        }
        const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
        let status = 'pass';
        const criticalFailures = criterionResults.filter((r) => !r.passed && gate.criteria.find((c) => c.metric === r.metric)?.critical);
        if (criticalFailures.length > 0) {
            status = 'fail';
        }
        else if (finalScore < 70) {
            status = 'warning';
        }
        const result = {
            gateId,
            status,
            score: finalScore,
            criterionResults,
            executionTime: Date.now() - startTime,
            message: this.generateGateResultMessage(status, finalScore, criticalFailures.length),
            recommendations: await this.generateGateRecommendations(criterionResults),
            timestamp: new Date(),
        };
        this.logger.info('Quality gate executed', {
            gateId,
            status,
            score: finalScore,
            executionTime: result.executionTime,
        });
        this.emit('quality-gate-executed', { pipelineId, stageId, result });
        return result;
    }
    async executeDeploymentAutomation(pipelineId, environment, artifacts) {
        this.logger.info('Executing deployment automation', {
            pipelineId,
            environment,
            artifactCount: artifacts.length,
        });
        const execution = this.state.activePipelines.get(pipelineId);
        if (!execution) {
            throw new Error(`Pipeline execution not found: ${pipelineId}`);
        }
        try {
            await this.validateDeploymentReadiness(artifacts, environment);
            await this.executeDeploymentSteps(execution, environment, artifacts);
            await this.verifyDeploymentSuccess(execution, environment);
            if (this.config.enableValueStreamIntegration) {
                await this.updateValueStreamDeploymentMetrics(execution.context.valueStreamId, execution, environment);
            }
            this.logger.info('Deployment automation completed', {
                pipelineId,
                environment,
            });
            this.emit('deployment-completed', { pipelineId, environment });
        }
        catch (error) {
            this.logger.error('Deployment automation failed', {
                pipelineId,
                environment,
                error,
            });
            await this.executeRollback(execution, environment);
            throw error;
        }
    }
    async monitorPipelinePerformance() {
        if (!this.config.enablePerformanceMonitoring)
            return;
        this.logger.debug('Monitoring pipeline performance');
        for (const [pipelineId, execution] of this.state.activePipelines) {
            try {
                const metrics = await this.calculatePipelineMetrics(execution);
                this.state.performanceMetrics.set(pipelineId, metrics);
                await this.checkPerformanceAlerts(execution, metrics);
            }
            catch (error) {
                this.logger.error('Pipeline performance monitoring failed', {
                    pipelineId,
                    error,
                });
            }
        }
        await this.analyzePipelineTrends();
        if (this.config.enableValueStreamIntegration) {
            await this.updateValueStreamPipelineMetrics();
        }
    }
    initializeState() {
        return {
            pipelineTemplates: new Map(),
            activePipelines: new Map(),
            qualityGateTemplates: new Map(),
            automationTemplates: new Map(),
            performanceMetrics: new Map(),
            historicalExecutions: [],
            lastCleanup: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('cd-pipeline:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    pipelineTemplates: new Map(persistedState.pipelineTemplates || []),
                    activePipelines: new Map(persistedState.activePipelines || []),
                    qualityGateTemplates: new Map(persistedState.qualityGateTemplates || []),
                    automationTemplates: new Map(persistedState.automationTemplates || []),
                    performanceMetrics: new Map(persistedState.performanceMetrics || []),
                };
                this.logger.info('CD Pipeline Manager state loaded');
            }
        }
        catch (error) {
            this.logger.warn('Failed to load persisted state', { error });
        }
    }
    async persistState() {
        try {
            const stateToSerialize = {
                ...this.state,
                pipelineTemplates: Array.from(this.state.pipelineTemplates.entries()),
                activePipelines: Array.from(this.state.activePipelines.entries()),
                qualityGateTemplates: Array.from(this.state.qualityGateTemplates.entries()),
                automationTemplates: Array.from(this.state.automationTemplates.entries()),
                performanceMetrics: Array.from(this.state.performanceMetrics.entries()),
            };
            await this.memory.store('cd-pipeline:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    async initializePipelineTemplates() {
        await this.mapSPARCToPipelineStages();
    }
    async initializeQualityGateTemplates() {
        await this.createAutomatedQualityGates();
    }
    startPerformanceMonitoring() {
        this.monitoringTimer = setInterval(async () => {
            try {
                await this.monitorPipelinePerformance();
            }
            catch (error) {
                this.logger.error('Pipeline performance monitoring failed', { error });
            }
        }, this.config.monitoringInterval);
    }
    startPeriodicCleanup() {
        this.cleanupTimer = setInterval(async () => {
            try {
                await this.cleanupCompletedPipelines();
            }
            catch (error) {
                this.logger.error('Pipeline cleanup failed', { error });
            }
        }, 3600000);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('sparc-project-completed', async (event) => {
            await this.handleSPARCProjectCompletion(event.payload);
        });
        this.eventBus.registerHandler('feature-ready-for-deployment', async (event) => {
            await this.handleFeatureDeploymentRequest(event.payload);
        });
    }
    async createStandardPipelineFromSPARC() {
        return [];
    }
    async createMicroservicePipelineFromSPARC() {
        return [];
    }
    async createLibraryPipelineFromSPARC() {
        return [];
    }
    initializePipelineMetrics() {
        return {
            totalDuration: 0,
            stageDurations: {},
            queueTime: 0,
            executionTime: 0,
            throughput: 0,
            successRate: 1.0,
            failureRate: 0,
            averageQualityScore: 0,
            bottlenecks: [],
            trends: [],
        };
    }
    async executePipelineAsync(execution, stages) { }
    async createCodeQualityGate() {
        return {};
    }
    async createTestCoverageGate() {
        return {};
    }
    async createSecurityGate() {
        return {};
    }
    async createPerformanceGate() {
        return {};
    }
    async createArchitectureComplianceGate() {
        return {};
    }
    async executeCriterion(criterion, pipelineId) {
        return {};
    }
    generateGateResultMessage(status, score, criticalFailures) {
        return '';
    }
    async generateGateRecommendations(results) {
        return [];
    }
    async validateDeploymentReadiness(artifacts, environment) { }
    async executeDeploymentSteps(execution, environment, artifacts) { }
    async verifyDeploymentSuccess(execution, environment) { }
    async updateValueStreamDeploymentMetrics(streamId, execution, environment) { }
    async executeRollback(execution, environment) { }
    async calculatePipelineMetrics(execution) {
        return {};
    }
    async checkPerformanceAlerts(execution, metrics) { }
    async analyzePipelineTrends() { }
    async updateValueStreamPipelineMetrics() { }
    async cancelActivePipelines() { }
    async cleanupCompletedPipelines() { }
    async handleSPARCProjectCompletion(payload) { }
    async handleFeatureDeploymentRequest(payload) { }
}
export default ContinuousDeliveryPipelineManager;
//# sourceMappingURL=continuous-delivery-pipeline.js.map