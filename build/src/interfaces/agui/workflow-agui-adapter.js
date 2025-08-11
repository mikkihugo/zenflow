/**
 * @file Workflow AGUI Adapter - Phase 1, Task 1.3 - AGUI Workflow Gates
 *
 * Extends TerminalAGUI with workflow-aware prompts, decision logging, and
 * gate timeout/escalation handling. Integrates with WorkflowGateRequest
 * and type-safe event system for comprehensive workflow orchestration.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Extends proven TerminalAGUI interface for consistency
 * - Integrates with WorkflowGateRequest from Phase 1, Task 1.2
 * - Uses type-safe event system for gate lifecycle events
 * - Runtime validation using domain boundary validator
 * - Production-grade performance and audit trail
 */
import { getLogger } from '../../config/logging-config.ts';
import { Domain, getDomainValidator, } from '../../core/domain-boundary-validator.ts';
import { createCorrelationId, createEvent, } from '../../core/type-safe-event-system.ts';
import { TerminalAGUI, } from './agui-adapter.ts';
const logger = getLogger('workflow-agui-adapter');
// ============================================================================
// WORKFLOW AGUI ADAPTER - Enhanced AGUI with workflow capabilities
// ============================================================================
/**
 * Workflow-aware AGUI adapter extending TerminalAGUI with enhanced capabilities
 * for workflow orchestration, decision logging, and escalation handling.
 */
export class WorkflowAGUIAdapter extends TerminalAGUI {
    logger;
    domainValidator;
    eventBus;
    config;
    // Decision audit trail
    decisionAuditLog = [];
    // Active gate tracking
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
                initialTimeout: 300000, // 5 minutes
                escalationTimeouts: [600000, 1200000, 1800000], // 10, 20, 30 minutes
                maxTotalTimeout: 3600000, // 1 hour
                enableAutoEscalation: true,
                notifyOnTimeout: true,
            },
            ...config,
        };
        this.logger.info('WorkflowAGUIAdapter initialized', {
            config: this.config,
        });
    }
    // ============================================================================
    // ENHANCED VALIDATION METHODS - Workflow-aware question handling
    // ============================================================================
    /**
     * Enhanced askQuestion method with workflow-specific capabilities
     */
    async askQuestion(question) {
        const startTime = Date.now();
        const correlationId = createCorrelationId();
        // Check if this is a workflow gate request
        if (this.isWorkflowGateRequest(question)) {
            return this.processWorkflowGate(question, correlationId);
        }
        // Fall back to standard question handling
        return super.askQuestion(question);
    }
    /**
     * Process a workflow gate request with full workflow context
     */
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
            // 1. Validate the gate request
            if (this.config.enableDecisionLogging) {
                const validationResult = this.validateWorkflowGateRequest(gateRequest);
                if (!validationResult.success) {
                    throw new Error(`Gate validation failed: ${validationResult.error?.message}`);
                }
            }
            // 2. Register the active gate for timeout/escalation management
            if (this.config.enableTimeoutHandling) {
                this.registerActiveGate(gateRequest, gateCorrelationId);
            }
            // 3. Emit gate opened event
            await this.emitGateOpenedEvent(gateRequest, gateCorrelationId);
            // 4. Display enhanced workflow prompt
            if (this.config.enableRichPrompts) {
                this.displayWorkflowPrompt(gateRequest);
            }
            // 5. Get user input with timeout handling
            const response = await this.getWorkflowInput(gateRequest);
            // 6. Process and validate the response
            const processedResponse = this.processWorkflowResponse(gateRequest, response);
            // 7. Log the decision to audit trail
            if (this.config.enableDecisionLogging) {
                await this.logWorkflowDecision(gateRequest, processedResponse, startTime, gateCorrelationId);
            }
            // 8. Emit gate closed event
            await this.emitGateClosedEvent(gateRequest, {
                approved: this.interpretResponse(processedResponse),
                processingTime: Date.now() - startTime,
                response: processedResponse,
            }, gateCorrelationId);
            // 9. Cleanup active gate
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
            // Cleanup on error
            this.cleanupActiveGate(gateRequest.id);
            // Emit error event
            await this.emitGateClosedEvent(gateRequest, {
                approved: false,
                processingTime: Date.now() - startTime,
                error: error instanceof Error ? error : new Error(String(error)),
            }, gateCorrelationId);
            throw error;
        }
    }
    /**
     * Enhanced batch question processing with workflow awareness
     */
    async askBatchQuestions(questions) {
        const results = [];
        const workflowGates = [];
        const standardQuestions = [];
        // Separate workflow gates from standard questions
        for (const question of questions) {
            if (this.isWorkflowGateRequest(question)) {
                workflowGates.push(question);
            }
            else {
                standardQuestions.push(question);
            }
        }
        // Process workflow gates with full context
        for (const gate of workflowGates) {
            const response = await this.processWorkflowGate(gate);
            results.push(response);
        }
        // Process standard questions normally
        const standardResponses = await super.askBatchQuestions(standardQuestions);
        results.push(...standardResponses);
        return results;
    }
    // ============================================================================
    // WORKFLOW PROMPT ENHANCEMENT - Rich context display
    // ============================================================================
    /**
     * Display enhanced workflow prompt with rich context
     */
    displayWorkflowPrompt(gateRequest) {
        const context = gateRequest.workflowContext;
        const { workflowId, stepName, businessImpact, stakeholders, dependencies } = context;
        console.log('\n' + '='.repeat(80));
        console.log(`🔀 WORKFLOW GATE: ${gateRequest.gateType.toUpperCase()}`);
        console.log('='.repeat(80));
        // Workflow Information
        console.log(`📋 Workflow: ${workflowId}`);
        console.log(`📍 Current Step: ${stepName}`);
        console.log(`⚡ Business Impact: ${businessImpact.toUpperCase()}`);
        console.log(`🎯 Decision Scope: ${context.decisionScope}`);
        // Stakeholders
        if (stakeholders.length > 0) {
            console.log(`👥 Stakeholders: ${stakeholders.join(', ')}`);
        }
        // Dependencies
        if (dependencies && dependencies.length > 0) {
            console.log(`🔗 Dependencies:`);
            dependencies.forEach((dep) => {
                console.log(`   • ${dep.reference} (${dep.type}, ${dep.criticality} criticality)`);
            });
        }
        // Risk Factors
        if (context.riskFactors && context.riskFactors.length > 0) {
            console.log(`⚠️  Risk Factors:`);
            context.riskFactors.forEach((risk) => {
                console.log(`   • ${risk.description} (${risk.severity}, ${Math.round(risk.probability * 100)}% probability)`);
            });
        }
        // Previous Decisions Context
        if (context.previousDecisions && context.previousDecisions.length > 0) {
            console.log(`📚 Previous Decisions:`);
            context.previousDecisions.slice(-3).forEach((decision) => {
                console.log(`   • ${decision.stepName}: ${decision.decision} (${decision.decisionMaker})`);
            });
        }
        // Deadline Information
        if (context.deadline) {
            const timeRemaining = context.deadline.getTime() - Date.now();
            const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
            console.log(`⏰ Deadline: ${context.deadline.toLocaleString()} (${hoursRemaining}h remaining)`);
        }
        console.log('\n' + '-'.repeat(80));
        console.log(`❓ ${gateRequest.question}`);
        console.log('-'.repeat(80));
        // Escalation Information
        if (gateRequest.escalationChain) {
            this.displayEscalationInfo(gateRequest.escalationChain);
        }
        // Options
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
    /**
     * Display escalation chain information
     */
    displayEscalationInfo(escalationChain) {
        console.log(`\n🔺 Escalation Chain: ${escalationChain.id}`);
        escalationChain.levels.forEach((level) => {
            const levelName = GateEscalationLevel[level.level];
            const approvers = level.approvers.join(', ');
            const timeLimit = level.timeLimit ? `${Math.round(level.timeLimit / 60000)}min` : 'no limit';
            console.log(`   ${levelName}: ${approvers} (${timeLimit})`);
        });
    }
    // ============================================================================
    // TIMEOUT AND ESCALATION HANDLING - Gate lifecycle management
    // ============================================================================
    /**
     * Register an active gate for timeout and escalation management
     */
    registerActiveGate(gateRequest, correlationId) {
        const gateInfo = {
            gateRequest,
            startTime: new Date(),
            escalationTimers: [],
            correlationId,
        };
        // Set initial timeout if configured
        if (gateRequest.timeoutConfig?.initialTimeout) {
            gateInfo.timeoutId = setTimeout(() => {
                this.handleGateTimeout(gateRequest.id, 'initial');
            }, gateRequest.timeoutConfig.initialTimeout);
        }
        // Set escalation timers if escalation chain is configured
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
    /**
     * Setup escalation timers for a gate
     */
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
    /**
     * Handle gate timeout
     */
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
        // Notify about timeout
        if (this.config.timeoutConfig.notifyOnTimeout) {
            console.log(`\n⏰ TIMEOUT WARNING: Gate ${gateId} has exceeded its time limit.`);
            // Auto-escalate if configured
            if (this.config.timeoutConfig.enableAutoEscalation && gateRequest.escalationChain) {
                console.log('🔺 Initiating automatic escalation...');
                await this.handleEscalation(gateId, GateEscalationLevel.TEAM_LEAD);
            }
        }
        // Emit timeout event
        await this.eventBus.emitEvent(createEvent('agui.gate.timeout', Domain.INTERFACES, {
            payload: {
                gateId,
                timeoutType,
                workflowId: gateRequest.workflowContext.workflowId,
                elapsedTime: Date.now() - activeGate.startTime.getTime(),
            },
        }, { correlationId, source: 'workflow-agui-adapter' }));
    }
    /**
     * Handle escalation to a specific level
     */
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
        // Display escalation notification
        console.log(`\n🔺 ESCALATING TO ${GateEscalationLevel[level]} LEVEL`);
        console.log(`Reason: ${escalationRecord.reason}`);
        console.log(`Gate: ${gateId} (${gateRequest.workflowContext.stepName})\n`);
        // Emit escalation event
        await this.eventBus.emitEvent(createEvent('agui.gate.escalated', Domain.INTERFACES, {
            payload: {
                gateId,
                escalationRecord,
                workflowId: gateRequest.workflowContext.workflowId,
                newLevel: level,
            },
        }, { correlationId, source: 'workflow-agui-adapter' }));
    }
    /**
     * Cleanup active gate tracking
     */
    cleanupActiveGate(gateId) {
        const activeGate = this.activeGates.get(gateId);
        if (!activeGate)
            return;
        // Clear timeout
        if (activeGate.timeoutId) {
            clearTimeout(activeGate.timeoutId);
        }
        // Clear escalation timers
        activeGate.escalationTimers.forEach((timer) => clearTimeout(timer));
        // Remove from active gates
        this.activeGates.delete(gateId);
        this.logger.debug('Cleaned up active gate', { gateId });
    }
    // ============================================================================
    // DECISION LOGGING AND AUDIT TRAIL - Comprehensive decision tracking
    // ============================================================================
    /**
     * Log workflow decision to audit trail
     */
    async logWorkflowDecision(gateRequest, response, startTime, correlationId) {
        const auditRecord = {
            gateId: gateRequest.id,
            workflowId: gateRequest.workflowContext.workflowId,
            stepName: gateRequest.workflowContext.stepName,
            timestamp: new Date(),
            decision: response,
            decisionMaker: 'user', // In a production system, this would be the actual user ID
            rationale: this.extractRationale(response),
            escalationLevel: GateEscalationLevel.NONE, // Would be determined by actual escalation
            processingTime: Date.now() - startTime,
            context: gateRequest.workflowContext,
            correlationId,
        };
        // Add to audit log
        this.decisionAuditLog.push(auditRecord);
        // Maintain audit log size
        if (this.decisionAuditLog.length > this.config.maxAuditRecords) {
            this.decisionAuditLog.shift();
        }
        // Clean old records based on retention policy
        this.cleanupOldAuditRecords();
        this.logger.info('Workflow decision logged to audit trail', {
            gateId: gateRequest.id,
            workflowId: gateRequest.workflowContext.workflowId,
            decision: response,
            auditRecordCount: this.decisionAuditLog.length,
        });
        // Emit audit event
        await this.eventBus.emitEvent(createEvent('workflow.decision.audited', Domain.INTERFACES, {
            payload: {
                auditRecord,
                totalAuditRecords: this.decisionAuditLog.length,
            },
        }, { correlationId, source: 'workflow-agui-adapter' }));
    }
    /**
     * Get workflow decision history for a specific workflow
     */
    getWorkflowDecisionHistory(workflowId) {
        return this.decisionAuditLog.filter((record) => record.workflowId === workflowId);
    }
    /**
     * Get all decision audit records
     */
    getAllDecisionAudits() {
        return [...this.decisionAuditLog];
    }
    /**
     * Export audit trail for compliance/analysis
     */
    exportAuditTrail(format = 'json') {
        if (format === 'csv') {
            return this.exportAuditTrailAsCsv();
        }
        return JSON.stringify(this.decisionAuditLog, null, 2);
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    /**
     * Check if a validation question is a workflow gate request
     */
    isWorkflowGateRequest(question) {
        return 'workflowContext' in question && 'gateType' in question;
    }
    /**
     * Validate workflow gate request
     */
    validateWorkflowGateRequest(gateRequest) {
        try {
            // Basic validation using domain validator
            // Note: In a full implementation, this would use the WorkflowGateRequestSchema
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
    /**
     * Get workflow input with enhanced handling
     */
    async getWorkflowInput(gateRequest) {
        // Use the base class method for now, but this could be enhanced
        // with workflow-specific input validation and processing
        return super.askQuestion(gateRequest);
    }
    /**
     * Process workflow response with validation
     */
    processWorkflowResponse(gateRequest, response) {
        // Enhance response processing based on gate type
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
    /**
     * Process approval-specific responses
     */
    processApprovalResponse(response) {
        const approvalKeywords = ['approve', 'approved', 'yes', 'accept', 'ok', 'continue'];
        const rejectionKeywords = ['reject', 'rejected', 'no', 'deny', 'stop', 'cancel'];
        const lowerResponse = response.toLowerCase();
        if (approvalKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return 'approved';
        }
        else if (rejectionKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return 'rejected';
        }
        return response; // Return as-is if no clear approval/rejection
    }
    /**
     * Process checkpoint-specific responses
     */
    processCheckpointResponse(response) {
        // Enhanced processing for checkpoint gates
        return response;
    }
    /**
     * Process decision-specific responses
     */
    processDecisionResponse(response) {
        // Enhanced processing for decision gates
        return response;
    }
    /**
     * Process emergency-specific responses
     */
    processEmergencyResponse(response) {
        // Emergency gates require immediate, clear responses
        const urgentKeywords = ['emergency', 'urgent', 'critical', 'immediate'];
        const lowerResponse = response.toLowerCase();
        if (urgentKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return `URGENT: ${response}`;
        }
        return response;
    }
    /**
     * Extract rationale from response
     */
    extractRationale(response) {
        // Simple rationale extraction - look for explanatory text
        const rationaleKeywords = ['because', 'since', 'due to', 'reason:', 'rationale:'];
        for (const keyword of rationaleKeywords) {
            const index = response.toLowerCase().indexOf(keyword);
            if (index >= 0) {
                return response.substring(index).trim();
            }
        }
        return undefined;
    }
    /**
     * Interpret response as boolean (approved/rejected)
     */
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
    /**
     * Cleanup old audit records based on retention policy
     */
    cleanupOldAuditRecords() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.auditRetentionDays);
        const originalLength = this.decisionAuditLog.length;
        // Remove records older than retention period
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
    /**
     * Export audit trail as CSV
     */
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
    /**
     * Emit gate opened event
     */
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
    /**
     * Emit gate closed event
     */
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
    // ============================================================================
    // LIFECYCLE MANAGEMENT - Cleanup and shutdown
    // ============================================================================
    /**
     * Shutdown the workflow AGUI adapter gracefully
     */
    async shutdown() {
        this.logger.info('Shutting down WorkflowAGUIAdapter');
        // Clear all active gates and timers
        for (const [gateId, activeGate] of this.activeGates.entries()) {
            this.cleanupActiveGate(gateId);
        }
        // Close the terminal interface
        this.close();
        this.logger.info('WorkflowAGUIAdapter shutdown complete');
    }
    /**
     * Get adapter statistics
     */
    getStatistics() {
        return {
            totalDecisionAudits: this.decisionAuditLog.length,
            activeGates: this.activeGates.size,
            config: this.config,
            lastAuditCleanup: new Date(),
        };
    }
}
// ============================================================================
// FACTORY FUNCTIONS - Convenience constructors
// ============================================================================
/**
 * Create a workflow AGUI adapter with default configuration
 */
export function createWorkflowAGUIAdapter(eventBus, config) {
    return new WorkflowAGUIAdapter(eventBus, config);
}
/**
 * Create a workflow AGUI adapter optimized for production use
 */
export function createProductionWorkflowAGUIAdapter(eventBus) {
    return new WorkflowAGUIAdapter(eventBus, {
        enableRichPrompts: true,
        enableDecisionLogging: true,
        enableTimeoutHandling: true,
        enableEscalationManagement: true,
        auditRetentionDays: 365, // 1 year retention
        maxAuditRecords: 50000,
        timeoutConfig: {
            initialTimeout: 600000, // 10 minutes
            escalationTimeouts: [900000, 1800000, 3600000], // 15, 30, 60 minutes
            maxTotalTimeout: 7200000, // 2 hours
            enableAutoEscalation: true,
            notifyOnTimeout: true,
        },
    });
}
/**
 * Create a workflow AGUI adapter for testing/development
 */
export function createTestWorkflowAGUIAdapter(eventBus) {
    return new WorkflowAGUIAdapter(eventBus, {
        enableRichPrompts: false,
        enableDecisionLogging: true,
        enableTimeoutHandling: false,
        enableEscalationManagement: false,
        auditRetentionDays: 1,
        maxAuditRecords: 100,
        timeoutConfig: {
            initialTimeout: 5000, // 5 seconds
            escalationTimeouts: [10000], // 10 seconds
            maxTotalTimeout: 30000, // 30 seconds
            enableAutoEscalation: false,
            notifyOnTimeout: false,
        },
    });
}
// ============================================================================
// EXPORTS
// ============================================================================
export default WorkflowAGUIAdapter;
