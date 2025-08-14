import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
import { Domain, getDomainValidator, } from '../../core/domain-boundary-validator.ts';
import { createCorrelationId, createEvent, EventPriority, } from '../../core/type-safe-event-system.ts';
const logger = getLogger('workflow-gate-request');
export var GateEscalationLevel;
(function (GateEscalationLevel) {
    GateEscalationLevel[GateEscalationLevel["NONE"] = 0] = "NONE";
    GateEscalationLevel[GateEscalationLevel["TEAM_LEAD"] = 1] = "TEAM_LEAD";
    GateEscalationLevel[GateEscalationLevel["MANAGER"] = 2] = "MANAGER";
    GateEscalationLevel[GateEscalationLevel["DIRECTOR"] = 3] = "DIRECTOR";
    GateEscalationLevel[GateEscalationLevel["EXECUTIVE"] = 4] = "EXECUTIVE";
    GateEscalationLevel[GateEscalationLevel["BOARD"] = 5] = "BOARD";
})(GateEscalationLevel || (GateEscalationLevel = {}));
export const WorkflowGateRequestSchema = {
    type: 'object',
    required: true,
    properties: {
        id: { type: 'string', required: true },
        type: {
            type: 'string',
            required: true,
            enum: [
                'relevance',
                'boundary',
                'relationship',
                'naming',
                'priority',
                'checkpoint',
                'review',
            ],
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
                                enum: [
                                    'blocking',
                                    'blocked_by',
                                    'related',
                                    'impacts',
                                    'impacted_by',
                                ],
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
            enum: [
                'approval',
                'checkpoint',
                'review',
                'decision',
                'escalation',
                'emergency',
            ],
        },
        requiredApprovalLevel: {
            type: 'number',
            required: false,
            enum: [0, 1, 2, 3, 4, 5],
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
            defaultTimeout: 300000,
            maxEscalationLevel: GateEscalationLevel.EXECUTIVE,
            enableAutoApproval: true,
            ...config,
        };
        this.initializeEventHandlers();
    }
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
            if (!options.skipValidation && this.config.enableDomainValidation) {
                const validationResult = await this.validateGateRequest(gateRequest);
                if (!validationResult.success) {
                    throw new Error(`Gate validation failed: ${validationResult.error?.message}`);
                }
            }
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
            await this.emitGateOpenedEvent(gateRequest, correlationId);
            const validationResult = await this.requestHumanValidation(gateRequest, escalationChain, correlationId);
            const finalResult = await this.processEscalationChain(gateRequest.id, validationResult, escalationChain);
            await this.emitGateClosedEvent(gateRequest, finalResult, correlationId);
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
            id: gateId,
            type: 'checkpoint',
            question,
            context,
            confidence: 0.8,
            priority: options.priority || 'medium',
            validationReason: `Workflow gate for ${stepName}`,
            expectedImpact: options.expectedImpact || 0.1,
            workflowContext: fullWorkflowContext,
            gateType,
            escalationChain: options.escalationChain,
            timeoutConfig: options.timeoutConfig,
            integrationConfig: options.integrationConfig,
        };
    }
    getPendingGates() {
        return new Map(this.pendingGates);
    }
    async cancelGate(gateId, reason) {
        const pendingGate = this.pendingGates.get(gateId);
        if (!pendingGate) {
            return false;
        }
        this.logger.info('Canceling workflow gate', { gateId, reason });
        this.clearEscalationTimers(gateId);
        pendingGate.status = 'cancelled';
        await this.emitGateClosedEvent(pendingGate.gateRequest, {
            success: false,
            gateId,
            approved: false,
            processingTime: Date.now() - pendingGate.startTime.getTime(),
            escalationLevel: pendingGate.currentLevel,
            error: new Error(`Gate cancelled: ${reason}`),
            correlationId: pendingGate.correlationId,
        }, pendingGate.correlationId);
        this.cleanup(gateId);
        return true;
    }
    async validateGateRequest(gateRequest) {
        try {
            const validatedRequest = this.domainValidator.validateInput(gateRequest, WorkflowGateRequestSchema);
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
        try {
            const fieldValue = this.getFieldValue(context, condition.field);
            const expectedValue = condition.value;
            logger.debug('Evaluating condition:', {
                field: condition.field,
                operator: condition.operator,
                fieldValue,
                expectedValue,
                fieldType: typeof fieldValue,
                expectedType: typeof expectedValue,
            });
            const result = await this.executeConditionOperator(condition.operator, fieldValue, expectedValue, condition);
            logger.debug('Condition evaluation result:', {
                field: condition.field,
                operator: condition.operator,
                result,
                metadata: {
                    evaluation_time: new Date().toISOString(),
                    context_keys: Object.keys(context || {}),
                },
            });
            return result;
        }
        catch (error) {
            logger.error('Error evaluating condition:', {
                condition,
                error: error.message,
                context_summary: this.summarizeContext(context),
            });
            return condition.operator === 'not_exists';
        }
    }
    async executeConditionOperator(operator, fieldValue, expectedValue, condition) {
        switch (operator) {
            case 'equals':
                return this.evaluateEquals(fieldValue, expectedValue);
            case 'not_equals':
                return !this.evaluateEquals(fieldValue, expectedValue);
            case 'greater_than':
                return this.evaluateGreaterThan(fieldValue, expectedValue);
            case 'greater_than_or_equal':
                return this.evaluateGreaterThanOrEqual(fieldValue, expectedValue);
            case 'less_than':
                return this.evaluateLessThan(fieldValue, expectedValue);
            case 'less_than_or_equal':
                return this.evaluateLessThanOrEqual(fieldValue, expectedValue);
            case 'contains':
                return this.evaluateContains(fieldValue, expectedValue);
            case 'not_contains':
                return !this.evaluateContains(fieldValue, expectedValue);
            case 'starts_with':
                return this.evaluateStartsWith(fieldValue, expectedValue);
            case 'ends_with':
                return this.evaluateEndsWith(fieldValue, expectedValue);
            case 'matches':
                return this.evaluateMatches(fieldValue, expectedValue);
            case 'not_matches':
                return !this.evaluateMatches(fieldValue, expectedValue);
            case 'exists':
                return this.evaluateExists(fieldValue);
            case 'not_exists':
                return !this.evaluateExists(fieldValue);
            case 'empty':
                return this.evaluateEmpty(fieldValue);
            case 'not_empty':
                return !this.evaluateEmpty(fieldValue);
            case 'in':
                return this.evaluateIn(fieldValue, expectedValue);
            case 'not_in':
                return !this.evaluateIn(fieldValue, expectedValue);
            case 'between':
                return this.evaluateBetween(fieldValue, expectedValue);
            case 'type_is':
                return this.evaluateTypeIs(fieldValue, expectedValue);
            case 'length_equals':
                return this.evaluateLengthEquals(fieldValue, expectedValue);
            case 'length_greater_than':
                return this.evaluateLengthGreaterThan(fieldValue, expectedValue);
            case 'length_less_than':
                return this.evaluateLengthLessThan(fieldValue, expectedValue);
            default:
                logger.warn('Unknown condition operator:', operator);
                throw new Error(`Unsupported condition operator: ${operator}`);
        }
    }
    evaluateEquals(fieldValue, expectedValue) {
        if (fieldValue === null || fieldValue === undefined) {
            return expectedValue === null || expectedValue === undefined;
        }
        if (fieldValue === expectedValue)
            return true;
        if (typeof fieldValue !== typeof expectedValue) {
            return String(fieldValue) === String(expectedValue);
        }
        return false;
    }
    evaluateGreaterThan(fieldValue, expectedValue) {
        const numField = this.toNumber(fieldValue);
        const numExpected = this.toNumber(expectedValue);
        if (numField === null || numExpected === null) {
            return String(fieldValue) > String(expectedValue);
        }
        return numField > numExpected;
    }
    evaluateGreaterThanOrEqual(fieldValue, expectedValue) {
        return (this.evaluateGreaterThan(fieldValue, expectedValue) ||
            this.evaluateEquals(fieldValue, expectedValue));
    }
    evaluateLessThan(fieldValue, expectedValue) {
        const numField = this.toNumber(fieldValue);
        const numExpected = this.toNumber(expectedValue);
        if (numField === null || numExpected === null) {
            return String(fieldValue) < String(expectedValue);
        }
        return numField < numExpected;
    }
    evaluateLessThanOrEqual(fieldValue, expectedValue) {
        return (this.evaluateLessThan(fieldValue, expectedValue) ||
            this.evaluateEquals(fieldValue, expectedValue));
    }
    evaluateContains(fieldValue, expectedValue) {
        if (Array.isArray(fieldValue)) {
            return fieldValue.includes(expectedValue);
        }
        if (fieldValue && typeof fieldValue === 'object') {
            return Object.hasOwn(fieldValue, expectedValue);
        }
        return String(fieldValue)
            .toLowerCase()
            .includes(String(expectedValue).toLowerCase());
    }
    evaluateStartsWith(fieldValue, expectedValue) {
        return String(fieldValue)
            .toLowerCase()
            .startsWith(String(expectedValue).toLowerCase());
    }
    evaluateEndsWith(fieldValue, expectedValue) {
        return String(fieldValue)
            .toLowerCase()
            .endsWith(String(expectedValue).toLowerCase());
    }
    evaluateMatches(fieldValue, expectedValue) {
        try {
            const regex = new RegExp(String(expectedValue), 'i');
            return regex.test(String(fieldValue));
        }
        catch (error) {
            logger.error('Invalid regex pattern:', expectedValue, error);
            return false;
        }
    }
    evaluateExists(fieldValue) {
        return fieldValue !== undefined && fieldValue !== null;
    }
    evaluateEmpty(fieldValue) {
        if (fieldValue === null || fieldValue === undefined)
            return true;
        if (typeof fieldValue === 'string')
            return fieldValue.trim() === '';
        if (Array.isArray(fieldValue))
            return fieldValue.length === 0;
        if (typeof fieldValue === 'object')
            return Object.keys(fieldValue).length === 0;
        return false;
    }
    evaluateIn(fieldValue, expectedValue) {
        if (!Array.isArray(expectedValue)) {
            logger.warn('Expected array for "in" operator, got:', typeof expectedValue);
            return false;
        }
        return expectedValue.includes(fieldValue);
    }
    evaluateBetween(fieldValue, expectedValue) {
        if (!Array.isArray(expectedValue) || expectedValue.length !== 2) {
            logger.warn('Expected array of length 2 for "between" operator');
            return false;
        }
        const numField = this.toNumber(fieldValue);
        const minValue = this.toNumber(expectedValue[0]);
        const maxValue = this.toNumber(expectedValue[1]);
        if (numField === null || minValue === null || maxValue === null) {
            return false;
        }
        return numField >= minValue && numField <= maxValue;
    }
    evaluateTypeIs(fieldValue, expectedValue) {
        const actualType = Array.isArray(fieldValue) ? 'array' : typeof fieldValue;
        return actualType === String(expectedValue).toLowerCase();
    }
    evaluateLengthEquals(fieldValue, expectedValue) {
        const length = this.getLength(fieldValue);
        return length !== null && length === this.toNumber(expectedValue);
    }
    evaluateLengthGreaterThan(fieldValue, expectedValue) {
        const length = this.getLength(fieldValue);
        const expected = this.toNumber(expectedValue);
        return length !== null && expected !== null && length > expected;
    }
    evaluateLengthLessThan(fieldValue, expectedValue) {
        const length = this.getLength(fieldValue);
        const expected = this.toNumber(expectedValue);
        return length !== null && expected !== null && length < expected;
    }
    toNumber(value) {
        if (typeof value === 'number' && !isNaN(value))
            return value;
        const parsed = Number(value);
        return isNaN(parsed) ? null : parsed;
    }
    getLength(value) {
        if (typeof value === 'string')
            return value.length;
        if (Array.isArray(value))
            return value.length;
        if (value && typeof value === 'object')
            return Object.keys(value).length;
        return null;
    }
    summarizeContext(context) {
        if (!context)
            return null;
        return {
            keys: Object.keys(context),
            hasData: Object.keys(context).length > 0,
            types: Object.entries(context).reduce((acc, [key, value]) => {
                acc[key] = Array.isArray(value) ? 'array' : typeof value;
                return acc;
            }, {}),
        };
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
        switch (gateRequest.workflowContext.businessImpact) {
            case 'low':
                levels.push({
                    level: GateEscalationLevel.TEAM_LEAD,
                    approvers: ['team-lead'],
                    requiredApprovals: 1,
                    timeLimit: 3600000,
                });
                break;
            case 'medium':
                levels.push({
                    level: GateEscalationLevel.TEAM_LEAD,
                    approvers: ['team-lead'],
                    requiredApprovals: 1,
                    timeLimit: 1800000,
                }, {
                    level: GateEscalationLevel.MANAGER,
                    approvers: ['manager'],
                    requiredApprovals: 1,
                    timeLimit: 3600000,
                });
                break;
            case 'high':
            case 'critical':
                levels.push({
                    level: GateEscalationLevel.TEAM_LEAD,
                    approvers: ['team-lead'],
                    requiredApprovals: 1,
                    timeLimit: 900000,
                }, {
                    level: GateEscalationLevel.MANAGER,
                    approvers: ['manager'],
                    requiredApprovals: 1,
                    timeLimit: 1800000,
                }, {
                    level: GateEscalationLevel.DIRECTOR,
                    approvers: ['director'],
                    requiredApprovals: 1,
                    timeLimit: 3600000,
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
                    delay: 300000,
                },
            ],
            maxLevel: this.config.maxEscalationLevel || GateEscalationLevel.EXECUTIVE,
        };
    }
    async requestHumanValidation(gateRequest, escalationChain, correlationId) {
        const validationRequestEvent = createEvent('human.validation.requested', Domain.INTERFACES, {
            payload: {
                requestId: `gate-${gateRequest.id}`,
                validationType: gateRequest.gateType === 'approval' ? 'approval' : 'review',
                context: {
                    workflowGate: gateRequest,
                    escalationChain,
                },
                priority: this.mapPriorityToEventPriority(gateRequest.priority),
                timeout: gateRequest.timeoutConfig?.initialTimeout ||
                    this.config.defaultTimeout,
            },
        }, {
            correlationId,
            source: 'workflow-gate-processor',
        });
        const eventResult = await this.eventBus.emitEvent(validationRequestEvent);
        if (!eventResult.success) {
            throw new Error(`Failed to emit validation request: ${eventResult.error?.message}`);
        }
        try {
            const response = (await this.aguiInterface.askQuestion(gateRequest));
            return {
                approved: this.interpretResponse(response),
                response,
                processingTime: Date.now() - validationRequestEvent.timestamp.getTime(),
                level: GateEscalationLevel.TEAM_LEAD,
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
            if (level.timeLimit) {
                this.setEscalationTimer(gateId, level.timeLimit, currentLevel);
            }
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
            if (approval.decision === 'reject') {
                finalApproval = false;
                finalLevel = currentLevel;
                decisionMaker = approval.approver;
                break;
            }
        }
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
        const businessImpact = pendingGate.gateRequest.workflowContext.businessImpact;
        const approver = level.approvers[0] || 'unknown';
        let decision = 'approve';
        let comments = `Approved at ${GateEscalationLevel[level.level]} level`;
        if (businessImpact === 'critical' &&
            level.level < GateEscalationLevel.DIRECTOR) {
            decision = 'escalate';
            comments = 'Critical impact requires higher level approval';
        }
        else if (businessImpact === 'high' &&
            level.level < GateEscalationLevel.MANAGER) {
            decision = 'escalate';
            comments = 'High impact requires management approval';
        }
        const responseTime = Date.now() - startTime + 100;
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
        this.eventBus.registerHandler('human.validation.completed', async (event) => {
            const { requestId, approved, feedback } = event.payload;
            const gateId = requestId.replace('gate-', '');
            const pendingGate = this.pendingGates.get(gateId);
            if (pendingGate) {
                this.logger.debug('Received validation completion for gate', {
                    gateId,
                    approved,
                    feedback,
                });
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
        const timerKey = `${gateId}-${level}`;
        this.escalationTimers.set(timerKey, timerId);
    }
    clearEscalationTimers(gateId) {
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
        const positiveResponses = [
            'yes',
            'approve',
            'approved',
            'accept',
            'ok',
            'continue',
            '1',
        ];
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
        id: gateId,
        type: 'checkpoint',
        question,
        context: { type: 'approval_request' },
        confidence: 0.8,
        priority: options.priority || 'medium',
        validationReason: `Workflow gate for ${stepName}`,
        expectedImpact: 0.1,
        workflowContext: fullWorkflowContext,
        gateType: 'approval',
    };
}
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
        id: gateId,
        type: 'checkpoint',
        question: `Checkpoint reached: ${stepName}. Continue?`,
        context: checkpointData,
        confidence: 0.8,
        priority: 'medium',
        validationReason: `Workflow gate for ${stepName}`,
        expectedImpact: 0.1,
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
export function createEmergencyGate(workflowId, stepName, emergencyContext, stakeholders) {
    const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const escalationChain = {
        id: `emergency-${workflowId}-${stepName}`,
        levels: [
            {
                level: GateEscalationLevel.MANAGER,
                approvers: stakeholders.slice(0, 1),
                requiredApprovals: 1,
                timeLimit: 300000,
            },
            {
                level: GateEscalationLevel.DIRECTOR,
                approvers: stakeholders.slice(1, 2),
                requiredApprovals: 1,
                timeLimit: 600000,
            },
            {
                level: GateEscalationLevel.EXECUTIVE,
                approvers: stakeholders.slice(2),
                requiredApprovals: 1,
                timeLimit: 900000,
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
        deadline: new Date(Date.now() + 1800000),
    };
    return {
        id: gateId,
        type: 'checkpoint',
        question: 'EMERGENCY: Immediate decision required',
        context: emergencyContext,
        confidence: 0.8,
        priority: 'critical',
        validationReason: `Workflow gate for ${stepName}`,
        expectedImpact: 0.9,
        workflowContext: fullWorkflowContext,
        gateType: 'emergency',
        escalationChain,
        timeoutConfig: {
            initialTimeout: 300000,
            escalationTimeouts: [300000, 600000, 900000],
            maxTotalTimeout: 1800000,
        },
    };
}
export default WorkflowGateRequestProcessor;
//# sourceMappingURL=workflow-gate-request.js.map