/**
 * @file Workflow Gate Request - Phase 1, Task 1.2 - AGUI Workflow Gates
 *
 * Extends existing ValidationQuestion interface for workflow orchestration gates.
 * Provides type-safe workflow context, escalation chains, and integration with
 * the existing AGUI system and type-safe event system.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Extends proven ValidationQuestion interface from progressive-confidence-builder
 * - Integrates with type-safe event system (HumanValidationRequestedEvent, AGUIGateOpenedEvent)
 * - Provides workflow-specific context and decision escalation chains
 * - Runtime validation using domain boundary validator
 * - Production-grade performance and monitoring
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
import { Domain, getDomainValidator, } from '../../core/domain-boundary-validator.ts';
import { createCorrelationId, createEvent, EventPriority, } from '../../core/type-safe-event-system.ts';
const logger = getLogger('workflow-gate-request');
// ============================================================================
// GATE ESCALATION TYPES - Decision escalation chains
// ============================================================================
/**
 * Escalation level for workflow gates
 */
export var GateEscalationLevel;
(function (GateEscalationLevel) {
    GateEscalationLevel[GateEscalationLevel["NONE"] = 0] = "NONE";
    GateEscalationLevel[GateEscalationLevel["TEAM_LEAD"] = 1] = "TEAM_LEAD";
    GateEscalationLevel[GateEscalationLevel["MANAGER"] = 2] = "MANAGER";
    GateEscalationLevel[GateEscalationLevel["DIRECTOR"] = 3] = "DIRECTOR";
    GateEscalationLevel[GateEscalationLevel["EXECUTIVE"] = 4] = "EXECUTIVE";
    GateEscalationLevel[GateEscalationLevel["BOARD"] = 5] = "BOARD";
})(GateEscalationLevel || (GateEscalationLevel = {}));
// ============================================================================
// WORKFLOW GATE REQUEST SCHEMA - Runtime validation
// ============================================================================
/**
 * TypeSchema for WorkflowGateRequest runtime validation
 */
export const WorkflowGateRequestSchema = {
    type: 'object',
    required: true,
    properties: {
        // ValidationQuestion base properties
        id: { type: 'string', required: true },
        type: {
            type: 'string',
            required: true,
            enum: ['relevance', 'boundary', 'relationship', 'naming', 'priority', 'checkpoint', 'review'],
        },
        question: { type: 'string', required: true },
        context: { type: 'object', required: true },
        options: {
            type: 'array',
            required: false,
            items: { type: 'string' },
        },
        allowCustom: { type: 'boolean', required: false },
        confidence: { type: 'number', required: true },
        priority: {
            type: 'string',
            required: false,
            enum: ['critical', 'high', 'medium', 'low'],
        },
        validationReason: { type: 'string', required: false },
        expectedImpact: { type: 'number', required: false },
        // WorkflowGateRequest specific properties
        workflowContext: {
            type: 'object',
            required: true,
            properties: {
                workflowId: { type: 'string', required: true },
                stepName: { type: 'string', required: true },
                businessImpact: {
                    type: 'string',
                    required: true,
                    enum: ['low', 'medium', 'high', 'critical'],
                },
                decisionScope: {
                    type: 'string',
                    required: true,
                    enum: ['task', 'feature', 'epic', 'prd', 'portfolio'],
                },
                stakeholders: {
                    type: 'array',
                    required: true,
                    items: { type: 'string' },
                },
                deadline: { type: 'object', required: false },
                dependencies: {
                    type: 'array',
                    required: false,
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', required: true },
                            type: {
                                type: 'string',
                                required: true,
                                enum: ['blocking', 'blocked_by', 'related', 'impacts', 'impacted_by'],
                            },
                            reference: { type: 'string', required: true },
                            criticality: {
                                type: 'string',
                                required: true,
                                enum: ['low', 'medium', 'high', 'critical'],
                            },
                            description: { type: 'string', required: false },
                        },
                    },
                },
            },
        },
        gateType: {
            type: 'string',
            required: true,
            enum: ['approval', 'checkpoint', 'review', 'decision', 'escalation', 'emergency'],
        },
        requiredApprovalLevel: {
            type: 'number',
            required: false,
            enum: [0, 1, 2, 3, 4, 5], // GateEscalationLevel values
        },
        escalationChain: {
            type: 'object',
            required: false,
            properties: {
                id: { type: 'string', required: true },
                levels: {
                    type: 'array',
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            level: { type: 'number', required: true },
                            approvers: {
                                type: 'array',
                                required: true,
                                items: { type: 'string' },
                            },
                            requiredApprovals: { type: 'number', required: false },
                            timeLimit: { type: 'number', required: false },
                        },
                    },
                },
                triggers: {
                    type: 'array',
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                required: true,
                                enum: [
                                    'timeout',
                                    'business_impact',
                                    'cost_threshold',
                                    'risk_level',
                                    'stakeholder_conflict',
                                ],
                            },
                            threshold: { type: 'any', required: true },
                            delay: { type: 'number', required: false },
                            skipLevels: { type: 'boolean', required: false },
                        },
                    },
                },
                maxLevel: { type: 'number', required: true },
                notifyAllLevels: { type: 'boolean', required: false },
            },
        },
        timeoutConfig: {
            type: 'object',
            required: false,
            properties: {
                initialTimeout: { type: 'number', required: true },
                escalationTimeouts: {
                    type: 'array',
                    required: true,
                    items: { type: 'number' },
                },
                maxTotalTimeout: { type: 'number', required: true },
            },
        },
        integrationConfig: {
            type: 'object',
            required: false,
            properties: {
                correlationId: { type: 'string', required: false },
                aguiInterface: { type: 'string', required: false },
                domainValidation: { type: 'boolean', required: false },
                enableMetrics: { type: 'boolean', required: false },
            },
        },
        conditionalLogic: {
            type: 'object',
            required: false,
            properties: {
                prerequisites: {
                    type: 'array',
                    required: false,
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', required: true },
                            type: {
                                type: 'string',
                                required: true,
                                enum: [
                                    'workflow_state',
                                    'user_role',
                                    'time_constraint',
                                    'dependency',
                                    'risk_threshold',
                                    'custom',
                                ],
                            },
                            operator: {
                                type: 'string',
                                required: true,
                                enum: [
                                    'equals',
                                    'not_equals',
                                    'greater_than',
                                    'less_than',
                                    'contains',
                                    'matches',
                                    'exists',
                                ],
                            },
                            value: { type: 'any', required: true },
                            field: { type: 'string', required: true },
                            required: { type: 'boolean', required: false },
                        },
                    },
                },
                autoApprovalConditions: {
                    type: 'array',
                    required: false,
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', required: true },
                            type: { type: 'string', required: true },
                            operator: { type: 'string', required: true },
                            value: { type: 'any', required: true },
                            field: { type: 'string', required: true },
                            required: { type: 'boolean', required: false },
                        },
                    },
                },
            },
        },
    },
};
// ============================================================================
// WORKFLOW GATE REQUEST PROCESSOR - Main orchestration class
// ============================================================================
/**
 * Workflow Gate Request Processor
 *
 * Handles workflow gate requests with full integration to existing systems:
 * - ValidationQuestion compatibility for existing AGUI system
 * - Type-safe event system integration for HumanValidationRequestedEvent and AGUIGateOpenedEvent
 * - Domain boundary validation for cross-domain operations
 * - Escalation chain processing and approval workflows
 * - Performance monitoring and analytics
 */
export class WorkflowGateRequestProcessor extends EventEmitter {
    eventBus;
    aguiInterface;
    config;
    logger;
    domainValidator;
    pendingGates = new Map();
    escalationTimers = new Map();
    gateCounter = 0;
    constructor(eventBus, aguiInterface, config = {}) {
        super();
        this.eventBus = eventBus;
        this.aguiInterface = aguiInterface;
        this.config = config;
        this.logger = getLogger('workflow-gate-processor');
        this.domainValidator = getDomainValidator(Domain.WORKFLOWS);
        this.config = {
            enableMetrics: true,
            enableDomainValidation: true,
            defaultTimeout: 300000, // 5 minutes
            maxEscalationLevel: GateEscalationLevel.EXECUTIVE,
            enableAutoApproval: true,
            ...config,
        };
        this.initializeEventHandlers();
    }
    // ============================================================================
    // PUBLIC API - Core workflow gate operations
    // ============================================================================
    /**
     * Process a workflow gate request with full validation and escalation support
     */
    async processWorkflowGate(gateRequest, options = {}) {
        const startTime = Date.now();
        const correlationId = gateRequest.integrationConfig?.correlationId || createCorrelationId();
        this.logger.info('Processing workflow gate request', {
            gateId: gateRequest.id,
            workflowId: gateRequest.workflowContext.workflowId,
            stepName: gateRequest.workflowContext.stepName,
            gateType: gateRequest.gateType,
            businessImpact: gateRequest.workflowContext.businessImpact,
            correlationId,
        });
        try {
            // 1. Validate the gate request
            if (!options.skipValidation && this.config.enableDomainValidation) {
                const validationResult = await this.validateGateRequest(gateRequest);
                if (!validationResult.success) {
                    throw new Error(`Gate validation failed: ${validationResult.error?.message}`);
                }
            }
            // 2. Check prerequisites and auto-approval conditions
            const prerequisiteResult = await this.checkPrerequisites(gateRequest);
            if (!prerequisiteResult.met) {
                return {
                    success: false,
                    gateId: gateRequest.id,
                    approved: false,
                    processingTime: Date.now() - startTime,
                    error: new Error(`Prerequisites not met: ${prerequisiteResult.missing.join(', ')}`),
                    escalationLevel: GateEscalationLevel.NONE,
                    correlationId,
                };
            }
            // 3. Check for auto-approval
            if (this.config.enableAutoApproval) {
                const autoApprovalResult = await this.checkAutoApproval(gateRequest);
                if (autoApprovalResult.approved) {
                    this.logger.info('Gate auto-approved', {
                        gateId: gateRequest.id,
                        reason: autoApprovalResult.reason,
                        correlationId,
                    });
                    return {
                        success: true,
                        gateId: gateRequest.id,
                        approved: true,
                        processingTime: Date.now() - startTime,
                        escalationLevel: GateEscalationLevel.NONE,
                        decisionMaker: 'system',
                        autoApproved: true,
                        correlationId,
                    };
                }
            }
            // 4. Initialize the gate request with escalation chain
            const escalationChain = options.escalationOverride ||
                gateRequest.escalationChain ||
                this.createDefaultEscalationChain(gateRequest);
            const pendingGate = {
                gateRequest,
                escalationChain,
                correlationId,
                startTime: new Date(),
                currentLevel: GateEscalationLevel.NONE,
                approvals: [],
                escalations: [],
                status: 'pending',
            };
            this.pendingGates.set(gateRequest.id, pendingGate);
            // 5. Emit AGUI gate opened event for integration
            await this.emitGateOpenedEvent(gateRequest, correlationId);
            // 6. Request human validation through existing AGUI system
            const validationResult = await this.requestHumanValidation(gateRequest, escalationChain, correlationId);
            // 7. Process the validation result through escalation chain if needed
            const finalResult = await this.processEscalationChain(gateRequest.id, validationResult, escalationChain);
            // 8. Emit gate closed event
            await this.emitGateClosedEvent(gateRequest, finalResult, correlationId);
            // 9. Cleanup
            this.cleanup(gateRequest.id);
            this.logger.info('Workflow gate processing completed', {
                gateId: gateRequest.id,
                approved: finalResult.approved,
                escalationLevel: finalResult.escalationLevel,
                processingTime: Date.now() - startTime,
                correlationId,
            });
            return finalResult;
        }
        catch (error) {
            this.logger.error('Workflow gate processing failed', {
                gateId: gateRequest.id,
                error: error instanceof Error ? error.message : String(error),
                correlationId,
            });
            // Cleanup on error
            this.cleanup(gateRequest.id);
            return {
                success: false,
                gateId: gateRequest.id,
                approved: false,
                processingTime: Date.now() - startTime,
                error: error instanceof Error ? error : new Error(String(error)),
                escalationLevel: GateEscalationLevel.NONE,
                correlationId,
            };
        }
    }
    /**
     * Create a workflow gate request from basic parameters
     */
    createWorkflowGateRequest(workflowId, stepName, gateType, question, context, workflowContext, options = {}) {
        const gateId = `gate-${Date.now()}-${++this.gateCounter}`;
        const fullWorkflowContext = {
            workflowId,
            stepName,
            businessImpact: 'medium',
            decisionScope: 'task',
            stakeholders: [],
            ...workflowContext,
        };
        return {
            // ValidationQuestion base properties
            id: gateId,
            type: 'checkpoint',
            question,
            context,
            confidence: 0.8,
            priority: options.priority || 'medium',
            validationReason: `Workflow gate for ${stepName}`,
            expectedImpact: options.expectedImpact || 0.1,
            // WorkflowGateRequest specific properties
            workflowContext: fullWorkflowContext,
            gateType,
            escalationChain: options.escalationChain,
            timeoutConfig: options.timeoutConfig,
            integrationConfig: options.integrationConfig,
        };
    }
    /**
     * Get status of all pending gates
     */
    getPendingGates() {
        return new Map(this.pendingGates);
    }
    /**
     * Cancel a pending gate request
     */
    async cancelGate(gateId, reason) {
        const pendingGate = this.pendingGates.get(gateId);
        if (!pendingGate) {
            return false;
        }
        this.logger.info('Canceling workflow gate', { gateId, reason });
        // Clear any escalation timers
        this.clearEscalationTimers(gateId);
        // Mark as cancelled
        pendingGate.status = 'cancelled';
        // Emit gate closed event with cancellation
        await this.emitGateClosedEvent(pendingGate.gateRequest, {
            success: false,
            gateId,
            approved: false,
            processingTime: Date.now() - pendingGate.startTime.getTime(),
            escalationLevel: pendingGate.currentLevel,
            error: new Error(`Gate cancelled: ${reason}`),
            correlationId: pendingGate.correlationId,
        }, pendingGate.correlationId);
        // Cleanup
        this.cleanup(gateId);
        return true;
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async validateGateRequest(gateRequest) {
        try {
            // Validate using domain boundary validator with schema
            const validatedRequest = this.domainValidator.validateInput(gateRequest, WorkflowGateRequestSchema);
            // Additional business logic validation
            if (gateRequest.workflowContext.stakeholders.length === 0 &&
                gateRequest.gateType !== 'emergency') {
                return {
                    success: false,
                    error: new Error('Stakeholders are required for non-emergency gates'),
                };
            }
            if (gateRequest.workflowContext.deadline &&
                gateRequest.workflowContext.deadline < new Date()) {
                return {
                    success: false,
                    error: new Error('Gate deadline has already passed'),
                };
            }
            return {
                success: true,
                data: validatedRequest,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    async checkPrerequisites(gateRequest) {
        const prerequisites = gateRequest.conditionalLogic?.prerequisites || [];
        const missing = [];
        for (const prerequisite of prerequisites) {
            const result = await this.evaluateCondition(prerequisite, gateRequest.workflowContext);
            if (!result && prerequisite.required !== false) {
                missing.push(prerequisite.id);
            }
        }
        return {
            met: missing.length === 0,
            missing,
        };
    }
    async checkAutoApproval(gateRequest) {
        const autoApprovalConditions = gateRequest.conditionalLogic?.autoApprovalConditions || [];
        if (autoApprovalConditions.length === 0) {
            return { approved: false };
        }
        for (const condition of autoApprovalConditions) {
            const result = await this.evaluateCondition(condition, gateRequest.workflowContext);
            if (result) {
                return {
                    approved: true,
                    reason: `Auto-approval condition met: ${condition.id}`,
                };
            }
        }
        return { approved: false };
    }
    async evaluateCondition(condition, context) {
        // Simple condition evaluation - in production this would be more sophisticated
        const fieldValue = this.getFieldValue(context, condition.field);
        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value;
            case 'not_equals':
                return fieldValue !== condition.value;
            case 'greater_than':
                return Number(fieldValue) > Number(condition.value);
            case 'less_than':
                return Number(fieldValue) < Number(condition.value);
            case 'contains':
                return String(fieldValue).includes(String(condition.value));
            case 'matches':
                return new RegExp(String(condition.value)).test(String(fieldValue));
            case 'exists':
                return fieldValue !== undefined && fieldValue !== null;
            default:
                return false;
        }
    }
    getFieldValue(context, field) {
        const parts = field.split('.');
        let value = context;
        for (const part of parts) {
            value = value?.[part];
        }
        return value;
    }
    createDefaultEscalationChain(gateRequest) {
        const levels = [];
        // Create escalation levels based on business impact
        switch (gateRequest.workflowContext.businessImpact) {
            case 'low':
                levels.push({
                    level: GateEscalationLevel.TEAM_LEAD,
                    approvers: ['team-lead'],
                    requiredApprovals: 1,
                    timeLimit: 3600000, // 1 hour
                });
                break;
            case 'medium':
                levels.push({
                    level: GateEscalationLevel.TEAM_LEAD,
                    approvers: ['team-lead'],
                    requiredApprovals: 1,
                    timeLimit: 1800000, // 30 minutes
                }, {
                    level: GateEscalationLevel.MANAGER,
                    approvers: ['manager'],
                    requiredApprovals: 1,
                    timeLimit: 3600000, // 1 hour
                });
                break;
            case 'high':
            case 'critical':
                levels.push({
                    level: GateEscalationLevel.TEAM_LEAD,
                    approvers: ['team-lead'],
                    requiredApprovals: 1,
                    timeLimit: 900000, // 15 minutes
                }, {
                    level: GateEscalationLevel.MANAGER,
                    approvers: ['manager'],
                    requiredApprovals: 1,
                    timeLimit: 1800000, // 30 minutes
                }, {
                    level: GateEscalationLevel.DIRECTOR,
                    approvers: ['director'],
                    requiredApprovals: 1,
                    timeLimit: 3600000, // 1 hour
                });
                break;
        }
        return {
            id: `escalation-${gateRequest.id}`,
            levels,
            triggers: [
                {
                    type: 'timeout',
                    threshold: 'time_limit',
                    delay: 0,
                },
                {
                    type: 'business_impact',
                    threshold: gateRequest.workflowContext.businessImpact,
                    delay: 300000, // 5 minutes
                },
            ],
            maxLevel: this.config.maxEscalationLevel || GateEscalationLevel.EXECUTIVE,
        };
    }
    async requestHumanValidation(gateRequest, escalationChain, correlationId) {
        // Create human validation request event for integration with existing AGUI system
        const validationRequestEvent = createEvent('human.validation.requested', Domain.INTERFACES, {
            payload: {
                requestId: `gate-${gateRequest.id}`,
                validationType: gateRequest.gateType === 'approval' ? 'approval' : 'review',
                context: {
                    workflowGate: gateRequest,
                    escalationChain,
                },
                priority: this.mapPriorityToEventPriority(gateRequest.priority),
                timeout: gateRequest.timeoutConfig?.initialTimeout || this.config.defaultTimeout,
            },
        }, {
            correlationId,
            source: 'workflow-gate-processor',
        });
        // Emit validation request event
        const eventResult = await this.eventBus.emitEvent(validationRequestEvent);
        if (!eventResult.success) {
            throw new Error(`Failed to emit validation request: ${eventResult.error?.message}`);
        }
        // Use existing AGUI interface for actual validation
        try {
            const response = await this.aguiInterface.askQuestion(gateRequest);
            return {
                approved: this.interpretResponse(response),
                response,
                processingTime: Date.now() - validationRequestEvent.timestamp.getTime(),
                level: GateEscalationLevel.TEAM_LEAD, // Start with team lead level
                approver: 'user',
            };
        }
        catch (error) {
            throw new Error(`Human validation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async processEscalationChain(gateId, initialResult, escalationChain) {
        const pendingGate = this.pendingGates.get(gateId);
        if (!pendingGate) {
            throw new Error(`Pending gate not found: ${gateId}`);
        }
        // If initially approved, we're done
        if (initialResult.approved) {
            return {
                success: true,
                gateId,
                approved: true,
                processingTime: initialResult.processingTime,
                escalationLevel: initialResult.level,
                decisionMaker: initialResult.approver,
                correlationId: pendingGate.correlationId,
            };
        }
        // Process escalation chain
        let currentLevel = GateEscalationLevel.TEAM_LEAD;
        let finalApproval = false;
        let finalLevel = GateEscalationLevel.NONE;
        let decisionMaker = 'unknown';
        for (const level of escalationChain.levels) {
            if (level.level <= currentLevel)
                continue;
            currentLevel = level.level;
            pendingGate.currentLevel = currentLevel;
            this.logger.info('Escalating to level', {
                gateId,
                level: currentLevel,
                approvers: level.approvers,
            });
            // Set escalation timer if time limit specified
            if (level.timeLimit) {
                this.setEscalationTimer(gateId, level.timeLimit, currentLevel);
            }
            // Simulate approval at this level (in production, this would involve actual approver interaction)
            const approval = await this.simulateApprovalAtLevel(level, pendingGate);
            const approvalRecord = {
                approver: approval.approver,
                timestamp: new Date(),
                decision: approval.decision,
                comments: approval.comments,
                level: currentLevel,
                responseTime: approval.responseTime,
            };
            pendingGate.approvals.push(approvalRecord);
            if (approval.decision === 'approve') {
                finalApproval = true;
                finalLevel = currentLevel;
                decisionMaker = approval.approver;
                break;
            }
            else if (approval.decision === 'reject') {
                finalApproval = false;
                finalLevel = currentLevel;
                decisionMaker = approval.approver;
                break;
            }
            // If 'escalate', continue to next level
        }
        // Clear any remaining timers
        this.clearEscalationTimers(gateId);
        return {
            success: true,
            gateId,
            approved: finalApproval,
            processingTime: Date.now() - pendingGate.startTime.getTime(),
            escalationLevel: finalLevel,
            decisionMaker,
            approvalChain: {
                completed: true,
                approved: finalApproval,
                decisionLevel: finalLevel,
                decisionMaker,
                processingTime: Date.now() - pendingGate.startTime.getTime(),
                approvals: pendingGate.approvals,
                escalations: pendingGate.escalations,
            },
            correlationId: pendingGate.correlationId,
        };
    }
    async simulateApprovalAtLevel(level, pendingGate) {
        const startTime = Date.now();
        // Simulate decision making based on business impact and level
        const businessImpact = pendingGate.gateRequest.workflowContext.businessImpact;
        const approver = level.approvers[0] || 'unknown';
        // Simple simulation logic
        let decision = 'approve';
        let comments = `Approved at ${GateEscalationLevel[level.level]} level`;
        if (businessImpact === 'critical' && level.level < GateEscalationLevel.DIRECTOR) {
            decision = 'escalate';
            comments = 'Critical impact requires higher level approval';
        }
        else if (businessImpact === 'high' && level.level < GateEscalationLevel.MANAGER) {
            decision = 'escalate';
            comments = 'High impact requires management approval';
        }
        // Simulate processing time
        const responseTime = Date.now() - startTime + 100; // Add some processing time
        return {
            decision,
            approver,
            comments,
            responseTime,
        };
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
        }, { correlationId, source: 'workflow-gate-processor' });
        const result = await this.eventBus.emitEvent(gateOpenedEvent);
        if (!result.success) {
            this.logger.warn('Failed to emit gate opened event', {
                gateId: gateRequest.id,
                error: result.error?.message,
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
                    escalationLevel: result.escalationLevel,
                    decisionMaker: result.decisionMaker,
                    approvalChain: result.approvalChain,
                },
            },
        }, { correlationId, causationId: `gate-${gateRequest.id}` });
        const eventResult = await this.eventBus.emitEvent(gateClosedEvent);
        if (!eventResult.success) {
            this.logger.warn('Failed to emit gate closed event', {
                gateId: gateRequest.id,
                error: eventResult.error?.message,
            });
        }
    }
    initializeEventHandlers() {
        // Listen for human validation completion events
        this.eventBus.registerHandler('human.validation.completed', async (event) => {
            const { requestId, approved, feedback } = event.payload;
            // Check if this is for one of our gates
            const gateId = requestId.replace('gate-', '');
            const pendingGate = this.pendingGates.get(gateId);
            if (pendingGate) {
                this.logger.debug('Received validation completion for gate', {
                    gateId,
                    approved,
                    feedback,
                });
                // Emit internal event for gate processing
                this.emit('validation-completed', {
                    gateId,
                    approved,
                    feedback,
                    processingTime: event.payload.processingTime,
                });
            }
        });
    }
    setEscalationTimer(gateId, timeLimit, level) {
        const timerId = setTimeout(() => {
            this.logger.info('Escalation timer triggered', { gateId, level });
            this.emit('escalation-timeout', { gateId, level });
        }, timeLimit);
        // Store timer for cleanup
        const timerKey = `${gateId}-${level}`;
        this.escalationTimers.set(timerKey, timerId);
    }
    clearEscalationTimers(gateId) {
        // Clear all timers for this gate
        for (const [key, timerId] of this.escalationTimers.entries()) {
            if (key.startsWith(gateId)) {
                clearTimeout(timerId);
                this.escalationTimers.delete(key);
            }
        }
    }
    cleanup(gateId) {
        this.pendingGates.delete(gateId);
        this.clearEscalationTimers(gateId);
    }
    interpretResponse(response) {
        const positiveResponses = ['yes', 'approve', 'approved', 'accept', 'ok', 'continue', '1'];
        return positiveResponses.some((pos) => response.toLowerCase().includes(pos));
    }
    mapPriorityToEventPriority(priority) {
        switch (priority) {
            case 'critical':
                return EventPriority.CRITICAL;
            case 'high':
                return EventPriority.HIGH;
            case 'medium':
                return EventPriority.NORMAL;
            case 'low':
                return EventPriority.LOW;
            default:
                return EventPriority.NORMAL;
        }
    }
}
// ============================================================================
// FACTORY FUNCTIONS - Convenience functions for common usage
// ============================================================================
/**
 * Create a simple approval gate
 */
export function createApprovalGate(workflowId, stepName, question, stakeholders, options = {}) {
    const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullWorkflowContext = {
        workflowId,
        stepName,
        businessImpact: options.businessImpact || 'medium',
        decisionScope: 'task',
        stakeholders,
        deadline: options.deadline,
    };
    return {
        // ValidationQuestion base properties
        id: gateId,
        type: 'checkpoint',
        question,
        context: { type: 'approval_request' },
        confidence: 0.8,
        priority: options.priority || 'medium',
        validationReason: `Workflow gate for ${stepName}`,
        expectedImpact: 0.1,
        // WorkflowGateRequest specific properties
        workflowContext: fullWorkflowContext,
        gateType: 'approval',
    };
}
/**
 * Create a checkpoint gate for workflow progress validation
 */
export function createCheckpointGate(workflowId, stepName, checkpointData, options = {}) {
    const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const autoApprovalConditions = [];
    if (options.autoApprovalThreshold) {
        autoApprovalConditions.push({
            id: 'confidence_threshold',
            type: 'custom',
            operator: 'greater_than',
            field: 'confidence',
            value: options.autoApprovalThreshold,
        });
    }
    const fullWorkflowContext = {
        workflowId,
        stepName,
        businessImpact: options.businessImpact || 'low',
        decisionScope: 'task',
        stakeholders: ['system'],
    };
    return {
        // ValidationQuestion base properties
        id: gateId,
        type: 'checkpoint',
        question: `Checkpoint reached: ${stepName}. Continue?`,
        context: checkpointData,
        confidence: 0.8,
        priority: 'medium',
        validationReason: `Workflow gate for ${stepName}`,
        expectedImpact: 0.1,
        // WorkflowGateRequest specific properties
        workflowContext: fullWorkflowContext,
        gateType: 'checkpoint',
        conditionalLogic: {
            autoApprovalConditions: autoApprovalConditions.length > 0 ? autoApprovalConditions : undefined,
        },
        integrationConfig: {
            domainValidation: true,
            enableMetrics: true,
        },
    };
}
/**
 * Create an emergency gate for critical decisions
 */
export function createEmergencyGate(workflowId, stepName, emergencyContext, stakeholders) {
    const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const escalationChain = {
        id: `emergency-${workflowId}-${stepName}`,
        levels: [
            {
                level: GateEscalationLevel.MANAGER,
                approvers: stakeholders.slice(0, 1),
                requiredApprovals: 1,
                timeLimit: 300000, // 5 minutes
            },
            {
                level: GateEscalationLevel.DIRECTOR,
                approvers: stakeholders.slice(1, 2),
                requiredApprovals: 1,
                timeLimit: 600000, // 10 minutes
            },
            {
                level: GateEscalationLevel.EXECUTIVE,
                approvers: stakeholders.slice(2),
                requiredApprovals: 1,
                timeLimit: 900000, // 15 minutes
            },
        ],
        triggers: [
            {
                type: 'timeout',
                threshold: 'time_limit',
                delay: 0,
                skipLevels: true,
            },
        ],
        maxLevel: GateEscalationLevel.EXECUTIVE,
        notifyAllLevels: true,
    };
    const fullWorkflowContext = {
        workflowId,
        stepName,
        businessImpact: 'critical',
        decisionScope: 'portfolio',
        stakeholders,
        deadline: new Date(Date.now() + 1800000), // 30 minutes from now
    };
    return {
        // ValidationQuestion base properties
        id: gateId,
        type: 'checkpoint',
        question: 'EMERGENCY: Immediate decision required',
        context: emergencyContext,
        confidence: 0.8,
        priority: 'critical',
        validationReason: `Workflow gate for ${stepName}`,
        expectedImpact: 0.9,
        // WorkflowGateRequest specific properties
        workflowContext: fullWorkflowContext,
        gateType: 'emergency',
        escalationChain,
        timeoutConfig: {
            initialTimeout: 300000, // 5 minutes
            escalationTimeouts: [300000, 600000, 900000],
            maxTotalTimeout: 1800000, // 30 minutes total
        },
    };
}
// ============================================================================
// EXPORTS
// ============================================================================
export default WorkflowGateRequestProcessor;
