import { getLogger } from '../../config/logging-config.ts';
import { Domain, getDomainValidator, } from '../../core/domain-boundary-validator.ts';
import { createCorrelationId, createEvent, } from '../../core/type-safe-event-system.ts';
import { TerminalAGUI, } from './agui-adapter.ts';
const logger = getLogger('workflow-agui-adapter');
export class WorkflowAGUIAdapter extends TerminalAGUI {
    logger;
    domainValidator;
    eventBus;
    config;
    decisionAuditLog = [];
    activeGates = new Map();
    constructor(eventBus, config = {}) {
        super();
        this.logger = getLogger('workflow-agui-adapter');
        this.domainValidator = getDomainValidator(Domain.INTERFACES);
        this.eventBus = eventBus;
        this.config = {
            enableRichPrompts: true,
            enableDecisionLogging: true,
            enableTimeoutHandling: true,
            enableEscalationManagement: true,
            auditRetentionDays: 90,
            maxAuditRecords: 10000,
            timeoutConfig: {
                initialTimeout: 300000,
                escalationTimeouts: [600000, 1200000, 1800000],
                maxTotalTimeout: 3600000,
                enableAutoEscalation: true,
                notifyOnTimeout: true,
            },
            ...config,
        };
        this.logger.info('WorkflowAGUIAdapter initialized', {
            config: this.config,
        });
    }
    async askQuestion(question) {
        const startTime = Date.now();
        const correlationId = createCorrelationId();
        if (this.isWorkflowGateRequest(question)) {
            return this.processWorkflowGate(question, correlationId);
        }
        return super.askQuestion(question);
    }
    async processWorkflowGate(gateRequest, correlationId) {
        const startTime = Date.now();
        const gateCorrelationId = correlationId || createCorrelationId();
        this.logger.info('Processing workflow gate', {
            gateId: gateRequest.id,
            workflowId: gateRequest.workflowContext.workflowId,
            stepName: gateRequest.workflowContext.stepName,
            gateType: gateRequest.gateType,
            correlationId: gateCorrelationId,
        });
        try {
            if (this.config.enableDecisionLogging) {
                const validationResult = this.validateWorkflowGateRequest(gateRequest);
                if (!validationResult.success) {
                    throw new Error(`Gate validation failed: ${validationResult.error?.message}`);
                }
            }
            if (this.config.enableTimeoutHandling) {
                this.registerActiveGate(gateRequest, gateCorrelationId);
            }
            await this.emitGateOpenedEvent(gateRequest, gateCorrelationId);
            if (this.config.enableRichPrompts) {
                this.displayWorkflowPrompt(gateRequest);
            }
            const response = await this.getWorkflowInput(gateRequest);
            const processedResponse = this.processWorkflowResponse(gateRequest, response);
            if (this.config.enableDecisionLogging) {
                await this.logWorkflowDecision(gateRequest, processedResponse, startTime, gateCorrelationId);
            }
            await this.emitGateClosedEvent(gateRequest, {
                approved: this.interpretResponse(processedResponse),
                processingTime: Date.now() - startTime,
                response: processedResponse,
            }, gateCorrelationId);
            this.cleanupActiveGate(gateRequest.id);
            this.logger.info('Workflow gate processed successfully', {
                gateId: gateRequest.id,
                response: processedResponse,
                processingTime: Date.now() - startTime,
                correlationId: gateCorrelationId,
            });
            return processedResponse;
        }
        catch (error) {
            this.logger.error('Workflow gate processing failed', {
                gateId: gateRequest.id,
                error: error instanceof Error ? error.message : String(error),
                correlationId: gateCorrelationId,
            });
            this.cleanupActiveGate(gateRequest.id);
            await this.emitGateClosedEvent(gateRequest, {
                approved: false,
                processingTime: Date.now() - startTime,
                error: error instanceof Error ? error : new Error(String(error)),
            }, gateCorrelationId);
            throw error;
        }
    }
    async askBatchQuestions(questions) {
        const results = [];
        const workflowGates = [];
        const standardQuestions = [];
        for (const question of questions) {
            if (this.isWorkflowGateRequest(question)) {
                workflowGates.push(question);
            }
            else {
                standardQuestions.push(question);
            }
        }
        for (const gate of workflowGates) {
            const response = await this.processWorkflowGate(gate);
            results.push(response);
        }
        const standardResponses = await super.askBatchQuestions(standardQuestions);
        results.push(...standardResponses);
        return results;
    }
    displayWorkflowPrompt(gateRequest) {
        const context = gateRequest.workflowContext;
        const { workflowId, stepName, businessImpact, stakeholders, dependencies } = context;
        console.log('\n' + '='.repeat(80));
        console.log(`🔀 WORKFLOW GATE: ${gateRequest.gateType.toUpperCase()}`);
        console.log('='.repeat(80));
        console.log(`📋 Workflow: ${workflowId}`);
        console.log(`📍 Current Step: ${stepName}`);
        console.log(`⚡ Business Impact: ${businessImpact.toUpperCase()}`);
        console.log(`🎯 Decision Scope: ${context.decisionScope}`);
        if (stakeholders.length > 0) {
            console.log(`👥 Stakeholders: ${stakeholders.join(', ')}`);
        }
        if (dependencies && dependencies.length > 0) {
            console.log(`🔗 Dependencies:`);
            dependencies.forEach((dep) => {
                console.log(`   • ${dep.reference} (${dep.type}, ${dep.criticality} criticality)`);
            });
        }
        if (context.riskFactors && context.riskFactors.length > 0) {
            console.log(`⚠️  Risk Factors:`);
            context.riskFactors.forEach((risk) => {
                console.log(`   • ${risk.description} (${risk.severity}, ${Math.round(risk.probability * 100)}% probability)`);
            });
        }
        if (context.previousDecisions && context.previousDecisions.length > 0) {
            console.log(`📚 Previous Decisions:`);
            context.previousDecisions.slice(-3).forEach((decision) => {
                console.log(`   • ${decision.stepName}: ${decision.decision} (${decision.decisionMaker})`);
            });
        }
        if (context.deadline) {
            const timeRemaining = context.deadline.getTime() - Date.now();
            const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
            console.log(`⏰ Deadline: ${context.deadline.toLocaleString()} (${hoursRemaining}h remaining)`);
        }
        console.log('\n' + '-'.repeat(80));
        console.log(`❓ ${gateRequest.question}`);
        console.log('-'.repeat(80));
        if (gateRequest.escalationChain) {
            this.displayEscalationInfo(gateRequest.escalationChain);
        }
        if (gateRequest.options && gateRequest.options.length > 0) {
            console.log('\n📝 Available Options:');
            gateRequest.options.forEach((option, index) => {
                console.log(`   ${index + 1}. ${option}`);
            });
            if (gateRequest.allowCustom) {
                console.log('   0. Custom response');
            }
        }
        console.log('\n');
    }
    displayEscalationInfo(escalationChain) {
        console.log(`\n🔺 Escalation Chain: ${escalationChain.id}`);
        escalationChain.levels.forEach((level) => {
            const levelName = GateEscalationLevel[level.level];
            const approvers = level.approvers.join(', ');
            const timeLimit = level.timeLimit
                ? `${Math.round(level.timeLimit / 60000)}min`
                : 'no limit';
            console.log(`   ${levelName}: ${approvers} (${timeLimit})`);
        });
    }
    registerActiveGate(gateRequest, correlationId) {
        const gateInfo = {
            gateRequest,
            startTime: new Date(),
            escalationTimers: [],
            correlationId,
        };
        if (gateRequest.timeoutConfig?.initialTimeout) {
            gateInfo.timeoutId = setTimeout(() => {
                this.handleGateTimeout(gateRequest.id, 'initial');
            }, gateRequest.timeoutConfig.initialTimeout);
        }
        if (gateRequest.escalationChain && this.config.enableEscalationManagement) {
            this.setupEscalationTimers(gateRequest, gateInfo.escalationTimers);
        }
        this.activeGates.set(gateRequest.id, gateInfo);
        this.logger.debug('Registered active gate for timeout management', {
            gateId: gateRequest.id,
            initialTimeout: gateRequest.timeoutConfig?.initialTimeout,
            escalationLevels: gateRequest.escalationChain?.levels.length || 0,
        });
    }
    setupEscalationTimers(gateRequest, timers) {
        if (!gateRequest.escalationChain)
            return;
        gateRequest.escalationChain.levels.forEach((level, index) => {
            if (level.timeLimit) {
                const timer = setTimeout(() => {
                    this.handleEscalation(gateRequest.id, level.level);
                }, level.timeLimit);
                timers.push(timer);
            }
        });
    }
    async handleGateTimeout(gateId, timeoutType) {
        const activeGate = this.activeGates.get(gateId);
        if (!activeGate)
            return;
        const { gateRequest, correlationId } = activeGate;
        this.logger.warn('Workflow gate timeout', {
            gateId,
            timeoutType,
            workflowId: gateRequest.workflowContext.workflowId,
            stepName: gateRequest.workflowContext.stepName,
        });
        if (this.config.timeoutConfig.notifyOnTimeout) {
            console.log(`\n⏰ TIMEOUT WARNING: Gate ${gateId} has exceeded its time limit.`);
            if (this.config.timeoutConfig.enableAutoEscalation &&
                gateRequest.escalationChain) {
                console.log('🔺 Initiating automatic escalation...');
                await this.handleEscalation(gateId, GateEscalationLevel.TEAM_LEAD);
            }
        }
        await this.eventBus.emitEvent(createEvent('agui.gate.timeout', Domain.INTERFACES, {
            payload: {
                gateId,
                timeoutType,
                workflowId: gateRequest.workflowContext.workflowId,
                elapsedTime: Date.now() - activeGate.startTime.getTime(),
            },
        }, { correlationId, source: 'workflow-agui-adapter' }));
    }
    async handleEscalation(gateId, level) {
        const activeGate = this.activeGates.get(gateId);
        if (!activeGate)
            return;
        const { gateRequest, correlationId } = activeGate;
        this.logger.info('Initiating gate escalation', {
            gateId,
            escalationLevel: GateEscalationLevel[level],
            workflowId: gateRequest.workflowContext.workflowId,
        });
        const escalationRecord = {
            timestamp: new Date(),
            reason: 'Timeout triggered escalation',
            fromLevel: GateEscalationLevel.NONE,
            toLevel: level,
            triggeredBy: 'system',
            trigger: {
                type: 'timeout',
                threshold: 'time_limit',
                delay: 0,
            },
        };
        console.log(`\n🔺 ESCALATING TO ${GateEscalationLevel[level]} LEVEL`);
        console.log(`Reason: ${escalationRecord.reason}`);
        console.log(`Gate: ${gateId} (${gateRequest.workflowContext.stepName})\n`);
        await this.eventBus.emitEvent(createEvent('agui.gate.escalated', Domain.INTERFACES, {
            payload: {
                gateId,
                escalationRecord,
                workflowId: gateRequest.workflowContext.workflowId,
                newLevel: level,
            },
        }, { correlationId, source: 'workflow-agui-adapter' }));
    }
    cleanupActiveGate(gateId) {
        const activeGate = this.activeGates.get(gateId);
        if (!activeGate)
            return;
        if (activeGate.timeoutId) {
            clearTimeout(activeGate.timeoutId);
        }
        activeGate.escalationTimers.forEach((timer) => clearTimeout(timer));
        this.activeGates.delete(gateId);
        this.logger.debug('Cleaned up active gate', { gateId });
    }
    async logWorkflowDecision(gateRequest, response, startTime, correlationId) {
        const auditRecord = {
            gateId: gateRequest.id,
            workflowId: gateRequest.workflowContext.workflowId,
            stepName: gateRequest.workflowContext.stepName,
            timestamp: new Date(),
            decision: response,
            decisionMaker: 'user',
            rationale: this.extractRationale(response),
            escalationLevel: GateEscalationLevel.NONE,
            processingTime: Date.now() - startTime,
            context: gateRequest.workflowContext,
            correlationId,
        };
        this.decisionAuditLog.push(auditRecord);
        if (this.decisionAuditLog.length > this.config.maxAuditRecords) {
            this.decisionAuditLog.shift();
        }
        this.cleanupOldAuditRecords();
        this.logger.info('Workflow decision logged to audit trail', {
            gateId: gateRequest.id,
            workflowId: gateRequest.workflowContext.workflowId,
            decision: response,
            auditRecordCount: this.decisionAuditLog.length,
        });
        await this.eventBus.emitEvent(createEvent('workflow.decision.audited', Domain.INTERFACES, {
            payload: {
                auditRecord,
                totalAuditRecords: this.decisionAuditLog.length,
            },
        }, { correlationId, source: 'workflow-agui-adapter' }));
    }
    getWorkflowDecisionHistory(workflowId) {
        return this.decisionAuditLog.filter((record) => record.workflowId === workflowId);
    }
    getAllDecisionAudits() {
        return [...this.decisionAuditLog];
    }
    exportAuditTrail(format = 'json') {
        if (format === 'csv') {
            return this.exportAuditTrailAsCsv();
        }
        return JSON.stringify(this.decisionAuditLog, null, 2);
    }
    isWorkflowGateRequest(question) {
        return 'workflowContext' in question && 'gateType' in question;
    }
    validateWorkflowGateRequest(gateRequest) {
        try {
            if (!gateRequest.workflowContext.workflowId) {
                return {
                    success: false,
                    error: new Error('Workflow ID is required'),
                };
            }
            if (!gateRequest.workflowContext.stepName) {
                return {
                    success: false,
                    error: new Error('Step name is required'),
                };
            }
            if (gateRequest.workflowContext.stakeholders.length === 0 &&
                gateRequest.gateType !== 'emergency') {
                return {
                    success: false,
                    error: new Error('Stakeholders are required for non-emergency gates'),
                };
            }
            return {
                success: true,
                data: gateRequest,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    async getWorkflowInput(gateRequest) {
        return super.askQuestion(gateRequest);
    }
    processWorkflowResponse(gateRequest, response) {
        switch (gateRequest.gateType) {
            case 'approval':
                return this.processApprovalResponse(response);
            case 'checkpoint':
                return this.processCheckpointResponse(response);
            case 'decision':
                return this.processDecisionResponse(response);
            case 'emergency':
                return this.processEmergencyResponse(response);
            default:
                return response;
        }
    }
    processApprovalResponse(response) {
        const approvalKeywords = [
            'approve',
            'approved',
            'yes',
            'accept',
            'ok',
            'continue',
        ];
        const rejectionKeywords = [
            'reject',
            'rejected',
            'no',
            'deny',
            'stop',
            'cancel',
        ];
        const lowerResponse = response.toLowerCase();
        if (approvalKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return 'approved';
        }
        if (rejectionKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return 'rejected';
        }
        return response;
    }
    processCheckpointResponse(response) {
        return response;
    }
    processDecisionResponse(response) {
        return response;
    }
    processEmergencyResponse(response) {
        const urgentKeywords = ['emergency', 'urgent', 'critical', 'immediate'];
        const lowerResponse = response.toLowerCase();
        if (urgentKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return `URGENT: ${response}`;
        }
        return response;
    }
    extractRationale(response) {
        const rationaleKeywords = [
            'because',
            'since',
            'due to',
            'reason:',
            'rationale:',
        ];
        for (const keyword of rationaleKeywords) {
            const index = response.toLowerCase().indexOf(keyword);
            if (index >= 0) {
                return response.substring(index).trim();
            }
        }
        return undefined;
    }
    interpretResponse(response) {
        const positiveResponses = [
            'yes',
            'approve',
            'approved',
            'accept',
            'ok',
            'continue',
            '1',
            'true',
        ];
        return positiveResponses.some((pos) => response.toLowerCase().includes(pos));
    }
    cleanupOldAuditRecords() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.auditRetentionDays);
        const originalLength = this.decisionAuditLog.length;
        let i = 0;
        while (i < this.decisionAuditLog.length) {
            if (this.decisionAuditLog[i].timestamp < cutoffDate) {
                this.decisionAuditLog.splice(i, 1);
            }
            else {
                i++;
            }
        }
        if (this.decisionAuditLog.length < originalLength) {
            this.logger.debug('Cleaned up old audit records', {
                recordsRemoved: originalLength - this.decisionAuditLog.length,
                remainingRecords: this.decisionAuditLog.length,
            });
        }
    }
    exportAuditTrailAsCsv() {
        const headers = [
            'Gate ID',
            'Workflow ID',
            'Step Name',
            'Timestamp',
            'Decision',
            'Decision Maker',
            'Rationale',
            'Escalation Level',
            'Processing Time',
            'Business Impact',
            'Correlation ID',
        ];
        const rows = this.decisionAuditLog.map((record) => [
            record.gateId,
            record.workflowId,
            record.stepName,
            record.timestamp.toISOString(),
            record.decision,
            record.decisionMaker,
            record.rationale || '',
            GateEscalationLevel[record.escalationLevel],
            record.processingTime.toString(),
            record.context.businessImpact,
            record.correlationId,
        ]);
        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');
        return csvContent;
    }
    async emitGateOpenedEvent(gateRequest, correlationId) {
        const gateOpenedEvent = createEvent('agui.gate.opened', Domain.INTERFACES, {
            payload: {
                gateId: gateRequest.id,
                gateType: gateRequest.gateType,
                requiredApproval: gateRequest.gateType !== 'checkpoint',
                context: {
                    workflowContext: gateRequest.workflowContext,
                    question: gateRequest.question,
                    businessImpact: gateRequest.workflowContext.businessImpact,
                },
            },
        }, { correlationId, source: 'workflow-agui-adapter' });
        try {
            await this.eventBus.emitEvent(gateOpenedEvent);
        }
        catch (error) {
            this.logger.warn('Failed to emit gate opened event', {
                gateId: gateRequest.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async emitGateClosedEvent(gateRequest, result, correlationId) {
        const gateClosedEvent = createEvent('agui.gate.closed', Domain.INTERFACES, {
            payload: {
                gateId: gateRequest.id,
                approved: result.approved,
                duration: result.processingTime,
                humanInput: {
                    response: result.response,
                    error: result.error?.message,
                },
            },
        }, { correlationId, causationId: `gate-${gateRequest.id}` });
        try {
            await this.eventBus.emitEvent(gateClosedEvent);
        }
        catch (error) {
            this.logger.warn('Failed to emit gate closed event', {
                gateId: gateRequest.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async shutdown() {
        this.logger.info('Shutting down WorkflowAGUIAdapter');
        for (const [gateId, activeGate] of this.activeGates.entries()) {
            this.cleanupActiveGate(gateId);
        }
        this.close();
        this.logger.info('WorkflowAGUIAdapter shutdown complete');
    }
    getStatistics() {
        return {
            totalDecisionAudits: this.decisionAuditLog.length,
            activeGates: this.activeGates.size,
            config: this.config,
            lastAuditCleanup: new Date(),
        };
    }
}
export function createWorkflowAGUIAdapter(eventBus, config) {
    return new WorkflowAGUIAdapter(eventBus, config);
}
export function createProductionWorkflowAGUIAdapter(eventBus) {
    return new WorkflowAGUIAdapter(eventBus, {
        enableRichPrompts: true,
        enableDecisionLogging: true,
        enableTimeoutHandling: true,
        enableEscalationManagement: true,
        auditRetentionDays: 365,
        maxAuditRecords: 50000,
        timeoutConfig: {
            initialTimeout: 600000,
            escalationTimeouts: [900000, 1800000, 3600000],
            maxTotalTimeout: 7200000,
            enableAutoEscalation: true,
            notifyOnTimeout: true,
        },
    });
}
export function createTestWorkflowAGUIAdapter(eventBus) {
    return new WorkflowAGUIAdapter(eventBus, {
        enableRichPrompts: false,
        enableDecisionLogging: true,
        enableTimeoutHandling: false,
        enableEscalationManagement: false,
        auditRetentionDays: 1,
        maxAuditRecords: 100,
        timeoutConfig: {
            initialTimeout: 5000,
            escalationTimeouts: [10000],
            maxTotalTimeout: 30000,
            enableAutoEscalation: false,
            notifyOnTimeout: false,
        },
    });
}
export default WorkflowAGUIAdapter;
//# sourceMappingURL=workflow-agui-adapter.js.map