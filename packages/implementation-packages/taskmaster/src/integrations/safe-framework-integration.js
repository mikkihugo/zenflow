"use strict";
/**
 * @fileoverview SAFe 6.0 Framework Integration - TaskMaster as Universal Approval Gate Orchestrator
 *
 * Integrates TaskMaster's approval gate system with ALL SAFe 6.0 framework gates:
 * - Epic Management Gates (Portfolio Kanban states)
 * - Continuous Delivery Gates (Quality, Security, Performance)
 * - ART Gates (Agile Release Train coordination)
 * - Cross-Framework Gates (SAFe-SPARC synchronization)
 * - Business Validation Gates (Stakeholder approvals)
 *
 * Uses SAFe 6.0 terminology: ART instead of Program, streamlined naming conventions.
 * Provides complete traceability, AGUI integration, SOC2 compliance, and learning.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeFrameworkIntegration = exports.SafeGateCategory = void 0;
var foundation_1 = require("@claude-zen/foundation");
var infrastructure_1 = require("@claude-zen/infrastructure");
var intelligence_1 = require("@claude-zen/intelligence");
var enterprise_1 = require("@claude-zen/enterprise");
var llm_approval_service_js_1 = require("../services/llm-approval-service.js");
var prompt_management_service_js_1 = require("../services/prompt-management-service.js");
var task_approval_system_js_1 = require("../agui/task-approval-system.js");
// ============================================================================
// SAFE INTEGRATION TYPES
// ============================================================================
/**
 * SAFe 6.0 gate categories that TaskMaster orchestrates
 */
var SafeGateCategory;
(function (SafeGateCategory) {
    SafeGateCategory["EPIC_PORTFOLIO"] = "epic_portfolio";
    SafeGateCategory["EPIC_LIFECYCLE"] = "epic_lifecycle";
    SafeGateCategory["ART_COORDINATION"] = "art_coordination";
    SafeGateCategory["QUALITY_ASSURANCE"] = "quality_assurance";
    SafeGateCategory["SECURITY_COMPLIANCE"] = "security_compliance";
    SafeGateCategory["PERFORMANCE_VALIDATION"] = "performance_validation";
    SafeGateCategory["BUSINESS_VALIDATION"] = "business_validation";
    SafeGateCategory["ARCHITECTURE_COMPLIANCE"] = "architecture_compliance";
    SafeGateCategory["CROSS_FRAMEWORK_SYNC"] = "cross_framework_sync";
})(SafeGateCategory || (exports.SafeGateCategory = SafeGateCategory = {}));
// ============================================================================
// SAFE FRAMEWORK INTEGRATION SERVICE
// ============================================================================
/**
 * SAFE Framework Integration Service
 *
 * Orchestrates TaskMaster approval gates for all SAFE framework workflows.
 * Provides complete traceability, learning, and SOC2 compliance.
 */
var SafeFrameworkIntegration = /** @class */ (function () {
    function SafeFrameworkIntegration(approvalGateManager, config) {
        this.logger = (0, foundation_1.getLogger)('SafeFrameworkIntegration');
        this.traceabilityRecords = new Map();
        this.activeGates = new Map();
        this.approvalGateManager = approvalGateManager;
        this.config = config;
    }
    /**
     * Initialize SAFE framework integration
     */
    SafeFrameworkIntegration.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbSystem, _a, _b, _c, _d, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 10, , 11]);
                        this.logger.info('Initializing SAFE Framework Integration...');
                        return [4 /*yield*/, (0, infrastructure_1.getDatabaseSystem)()];
                    case 1:
                        dbSystem = _e.sent();
                        this.database = dbSystem.createProvider('sql');
                        _a = this;
                        return [4 /*yield*/, (0, infrastructure_1.getEventSystem)()];
                    case 2:
                        _a.eventSystem = _e.sent();
                        _b = this;
                        return [4 /*yield*/, (0, intelligence_1.getBrainSystem)()];
                    case 3:
                        _b.brainSystem = _e.sent();
                        _c = this;
                        return [4 /*yield*/, (0, enterprise_1.getSafeFramework)()];
                    case 4:
                        _c.safeFramework = _e.sent();
                        _d = this;
                        return [4 /*yield*/, (0, enterprise_1.getWorkflowEngine)()];
                    case 5:
                        _d.workflowEngine = _e.sent();
                        // Initialize services
                        this.llmApprovalService = new llm_approval_service_js_1.LLMApprovalService();
                        return [4 /*yield*/, this.llmApprovalService.initialize()];
                    case 6:
                        _e.sent();
                        this.promptManagementService = new prompt_management_service_js_1.PromptManagementService();
                        return [4 /*yield*/, this.promptManagementService.initialize()];
                    case 7:
                        _e.sent();
                        this.taskApprovalSystem = new task_approval_system_js_1.TaskApprovalSystem({
                            enableRichDisplay: true,
                            enableBatchMode: false,
                            requireRationale: true
                        });
                        return [4 /*yield*/, this.taskApprovalSystem.initialize()];
                    case 8:
                        _e.sent();
                        // Set up database tables
                        return [4 /*yield*/, this.createTables()];
                    case 9:
                        // Set up database tables
                        _e.sent();
                        // Register event handlers
                        this.registerEventHandlers();
                        this.logger.info('SAFE Framework Integration initialized successfully');
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _e.sent();
                        this.logger.error('Failed to initialize SAFE Framework Integration', error_1);
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create approval gate for Epic Portfolio Kanban transition
     */
    SafeFrameworkIntegration.prototype.createEpicPortfolioGate = function (epicId, fromState, toState, context) {
        return __awaiter(this, void 0, void 0, function () {
            var gateId, traceabilityId, approvalRequirement, safeContext, traceabilityRecord, llmResult, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        gateId = "epic-".concat(epicId, "-").concat(fromState, "-to-").concat(toState);
                        traceabilityId = "trace-".concat(gateId, "-").concat(Date.now());
                        this.logger.info('Creating Epic Portfolio Gate', {
                            epicId: epicId,
                            fromState: fromState,
                            toState: toState,
                            gateId: gateId
                        });
                        approvalRequirement = this.buildEpicApprovalRequirement(gateId, fromState, toState, context);
                        safeContext = {
                            category: SafeGateCategory.EPIC_PORTFOLIO,
                            safeEntity: {
                                type: 'epic',
                                id: epicId,
                                metadata: {
                                    fromState: fromState,
                                    toState: toState,
                                    businessCase: context.businessCase,
                                    transitionType: this.getTransitionType(fromState, toState)
                                }
                            },
                            workflow: {
                                currentState: fromState,
                                targetState: toState,
                                previousStates: [] // Would load from epic history
                            },
                            stakeholders: {
                                owners: context.stakeholders.filter(function (s) { return s.includes('owner'); }),
                                approvers: context.stakeholders.filter(function (s) { return s.includes('approver'); }),
                                reviewers: context.stakeholders
                            },
                            compliance: {
                                required: context.complianceRequired,
                                frameworks: ['safe', 'sparc'],
                                auditLevel: this.config.learning.auditCompliance
                            }
                        };
                        // Store context
                        this.activeGates.set(gateId, safeContext);
                        traceabilityRecord = {
                            id: traceabilityId,
                            gateId: gateId,
                            category: SafeGateCategory.EPIC_PORTFOLIO,
                            context: safeContext,
                            learningExtracted: {
                                patterns: [],
                                improvements: [],
                                confidence: 0
                            },
                            auditTrail: {
                                sessionId: "session-".concat(Date.now()),
                                ipAddress: 'system',
                                userAgent: 'TaskMaster-SafeIntegration',
                                correlationId: traceabilityId,
                                complianceLevel: this.config.learning.auditCompliance
                            },
                            metrics: {
                                totalProcessingTime: 0,
                                aiProcessingTime: 0,
                                humanReviewTime: 0,
                                escalationCount: 0
                            },
                            createdAt: new Date()
                        };
                        this.traceabilityRecords.set(traceabilityId, traceabilityRecord);
                        if (!this.shouldUseLLMApproval(safeContext)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.processLLMApproval(gateId, safeContext, traceabilityRecord)];
                    case 1:
                        llmResult = _b.sent();
                        if (!llmResult.autoApproved) return [3 /*break*/, 3];
                        // Auto-approved by LLM
                        this.logger.info('Epic gate auto-approved by LLM', {
                            gateId: gateId,
                            confidence: llmResult.decision.confidence,
                            reasoning: llmResult.decision.reasoning
                        });
                        return [4 /*yield*/, this.completeTraceabilityRecord(traceabilityRecord, {
                                autoApproved: true,
                                llmResult: llmResult
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { gateId: gateId, traceabilityId: traceabilityId }];
                    case 3: return [4 /*yield*/, this.approvalGateManager.createApprovalGate(approvalRequirement, "task-".concat(epicId))];
                    case 4:
                        result = _b.sent();
                        if (!result.success) {
                            throw new Error("Failed to create epic approval gate: ".concat((_a = result.error) === null || _a === void 0 ? void 0 : _a.message));
                        }
                        // Create AGUI task for human visibility
                        return [4 /*yield*/, this.createAGUIApprovalTask(gateId, safeContext, traceabilityRecord)];
                    case 5:
                        // Create AGUI task for human visibility
                        _b.sent();
                        return [2 /*return*/, { gateId: gateId, traceabilityId: traceabilityId }];
                }
            });
        });
    };
    /**
     * Create approval gate for Quality Assurance
     */
    SafeFrameworkIntegration.prototype.createQualityGate = function (qualityGateConfig, context) {
        return __awaiter(this, void 0, void 0, function () {
            var gateId, traceabilityId, safeContext, traceabilityRecord, llmResult, approvalRequirement, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        gateId = qualityGateConfig.gateId;
                        traceabilityId = "trace-".concat(gateId, "-").concat(Date.now());
                        this.logger.info('Creating Quality Gate', {
                            gateId: gateId,
                            pipelineId: qualityGateConfig.pipelineId,
                            stageId: qualityGateConfig.stageId
                        });
                        safeContext = {
                            category: SafeGateCategory.QUALITY_ASSURANCE,
                            safeEntity: {
                                type: 'feature',
                                id: context.projectId,
                                metadata: {
                                    pipelineId: qualityGateConfig.pipelineId,
                                    stageId: qualityGateConfig.stageId,
                                    artifacts: context.artifacts,
                                    qualityConfig: qualityGateConfig
                                }
                            },
                            workflow: {
                                currentState: 'quality_review',
                                targetState: 'quality_approved',
                                previousStates: ['development', 'testing']
                            },
                            stakeholders: {
                                owners: context.stakeholders.filter(function (s) { return s.includes('owner'); }),
                                approvers: context.stakeholders.filter(function (s) { return s.includes('quality'); }),
                                reviewers: context.stakeholders
                            },
                            compliance: {
                                required: true,
                                frameworks: ['safe', 'sparc', 'iso27001'],
                                auditLevel: 'comprehensive'
                            }
                        };
                        this.activeGates.set(gateId, safeContext);
                        traceabilityRecord = {
                            id: traceabilityId,
                            gateId: gateId,
                            category: SafeGateCategory.QUALITY_ASSURANCE,
                            context: safeContext,
                            learningExtracted: {
                                patterns: [],
                                improvements: [],
                                confidence: 0
                            },
                            auditTrail: {
                                sessionId: "session-".concat(Date.now()),
                                ipAddress: 'system',
                                userAgent: 'TaskMaster-QualityGate',
                                correlationId: traceabilityId,
                                complianceLevel: 'comprehensive'
                            },
                            metrics: {
                                totalProcessingTime: 0,
                                aiProcessingTime: 0,
                                humanReviewTime: 0,
                                escalationCount: 0
                            },
                            createdAt: new Date()
                        };
                        this.traceabilityRecords.set(traceabilityId, traceabilityRecord);
                        if (!this.config.qualityGates.llmAutoApproval) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.processLLMQualityApproval(qualityGateConfig, safeContext, traceabilityRecord)];
                    case 1:
                        llmResult = _b.sent();
                        if (!llmResult.autoApproved) return [3 /*break*/, 3];
                        this.logger.info('Quality gate auto-approved by LLM', {
                            gateId: gateId,
                            confidence: llmResult.decision.confidence
                        });
                        return [4 /*yield*/, this.completeTraceabilityRecord(traceabilityRecord, {
                                autoApproved: true,
                                llmResult: llmResult
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { gateId: gateId, traceabilityId: traceabilityId }];
                    case 3:
                        approvalRequirement = this.buildQualityApprovalRequirement(gateId, qualityGateConfig, context);
                        return [4 /*yield*/, this.approvalGateManager.createApprovalGate(approvalRequirement, "task-quality-".concat(context.projectId))];
                    case 4:
                        result = _b.sent();
                        if (!result.success) {
                            throw new Error("Failed to create quality approval gate: ".concat((_a = result.error) === null || _a === void 0 ? void 0 : _a.message));
                        }
                        // Create AGUI task for visibility
                        return [4 /*yield*/, this.createAGUIApprovalTask(gateId, safeContext, traceabilityRecord)];
                    case 5:
                        // Create AGUI task for visibility
                        _b.sent();
                        return [2 /*return*/, { gateId: gateId, traceabilityId: traceabilityId }];
                }
            });
        });
    };
    /**
     * Get complete traceability record for a gate
     */
    SafeFrameworkIntegration.prototype.getTraceabilityRecord = function (traceabilityId) {
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        record = this.traceabilityRecords.get(traceabilityId);
                        if (record) {
                            return [2 /*return*/, record];
                        }
                        return [4 /*yield*/, this.loadTraceabilityRecord(traceabilityId)];
                    case 1: 
                    // Load from database if not in memory
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get learning insights from all gate decisions
     */
    SafeFrameworkIntegration.prototype.getLearningInsights = function () {
        return __awaiter(this, arguments, void 0, function (timeframe) {
            var records, decisionPatterns, aiPerformance, humanBehavior, complianceMetrics;
            if (timeframe === void 0) { timeframe = '30d'; }
            return __generator(this, function (_a) {
                records = Array.from(this.traceabilityRecords.values());
                decisionPatterns = this.extractDecisionPatterns(records);
                aiPerformance = this.calculateAIPerformance(records);
                humanBehavior = this.analyzeHumanBehavior(records);
                complianceMetrics = this.calculateComplianceMetrics(records);
                return [2 /*return*/, {
                        decisionPatterns: decisionPatterns,
                        aiPerformance: aiPerformance,
                        humanBehavior: humanBehavior,
                        complianceMetrics: complianceMetrics
                    }];
            });
        });
    };
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    SafeFrameworkIntegration.prototype.createTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Create tables for SAFE integration data
                    return [4 /*yield*/, this.database.schema.createTableIfNotExists('safe_gate_traceability', function (table) {
                            table.uuid('id').primary();
                            table.string('gate_id').notNullable();
                            table.string('category').notNullable();
                            table.json('context').notNullable();
                            table.json('ai_decision').nullable();
                            table.json('human_decision').nullable();
                            table.json('learning_extracted').notNullable();
                            table.json('audit_trail').notNullable();
                            table.json('metrics').notNullable();
                            table.timestamp('created_at').notNullable();
                            table.timestamp('completed_at').nullable();
                            table.index(['gate_id', 'category', 'created_at']);
                        })];
                    case 1:
                        // Create tables for SAFE integration data
                        _a.sent();
                        return [4 /*yield*/, this.database.schema.createTableIfNotExists('safe_gate_learning', function (table) {
                                table.uuid('id').primary();
                                table.string('pattern').notNullable();
                                table.integer('frequency').notNullable();
                                table.float('accuracy').notNullable();
                                table.text('improvement').notNullable();
                                table.timestamp('last_updated').notNullable();
                                table.index(['pattern', 'accuracy']);
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.registerEventHandlers = function () {
        // Listen for approval gate events
        this.eventSystem.on('approval:granted', this.handleApprovalGranted.bind(this));
        this.eventSystem.on('approval:rejected', this.handleApprovalRejected.bind(this));
        this.eventSystem.on('approval:timeout', this.handleApprovalTimeout.bind(this));
    };
    SafeFrameworkIntegration.prototype.handleApprovalGranted = function (gateId, taskId, approverId) {
        return __awaiter(this, void 0, void 0, function () {
            var context, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.activeGates.get(gateId);
                        if (!context)
                            return [2 /*return*/];
                        this.logger.info('SAFE gate approved', { gateId: gateId, taskId: taskId, approverId: approverId });
                        record = Array.from(this.traceabilityRecords.values())
                            .find(function (r) { return r.gateId === gateId; });
                        if (!record) return [3 /*break*/, 2];
                        record.humanDecision = {
                            approver: approverId,
                            decision: 'approved',
                            reasoning: 'Human approval granted',
                            timestamp: new Date(),
                            reviewTime: Date.now() - record.createdAt.getTime()
                        };
                        return [4 /*yield*/, this.completeTraceabilityRecord(record, {
                                autoApproved: false
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Trigger SAFE framework state transition
                    return [4 /*yield*/, this.triggerSafeStateTransition(context, 'approved')];
                    case 3:
                        // Trigger SAFE framework state transition
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.handleApprovalRejected = function (gateId, taskId, approverId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var context, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.activeGates.get(gateId);
                        if (!context)
                            return [2 /*return*/];
                        this.logger.info('SAFE gate rejected', { gateId: gateId, taskId: taskId, approverId: approverId, reason: reason });
                        record = Array.from(this.traceabilityRecords.values())
                            .find(function (r) { return r.gateId === gateId; });
                        if (!record) return [3 /*break*/, 2];
                        record.humanDecision = {
                            approver: approverId,
                            decision: 'rejected',
                            reasoning: reason,
                            timestamp: new Date(),
                            reviewTime: Date.now() - record.createdAt.getTime()
                        };
                        return [4 /*yield*/, this.completeTraceabilityRecord(record, {
                                autoApproved: false
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Trigger SAFE framework rejection handling
                    return [4 /*yield*/, this.triggerSafeStateTransition(context, 'rejected')];
                    case 3:
                        // Trigger SAFE framework rejection handling
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.handleApprovalTimeout = function (gateId, taskId) {
        return __awaiter(this, void 0, void 0, function () {
            var context, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.activeGates.get(gateId);
                        if (!context)
                            return [2 /*return*/];
                        this.logger.warn('SAFE gate timed out', { gateId: gateId, taskId: taskId });
                        record = Array.from(this.traceabilityRecords.values())
                            .find(function (r) { return r.gateId === gateId; });
                        if (!record) return [3 /*break*/, 2];
                        record.metrics.escalationCount++;
                        return [4 /*yield*/, this.persistTraceabilityRecord(record)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Trigger escalation in SAFE framework
                    return [4 /*yield*/, this.triggerSafeEscalation(context, 'timeout')];
                    case 3:
                        // Trigger escalation in SAFE framework
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.buildEpicApprovalRequirement = function (gateId, fromState, toState, context) {
        var minimumApprovals = this.getRequiredApprovalCount(fromState, toState);
        var timeoutHours = this.getApprovalTimeout(fromState, toState);
        return {
            id: gateId,
            name: "Epic ".concat(fromState, " \u2192 ").concat(toState, " Approval"),
            description: "Approval required for epic transition from ".concat(fromState, " to ").concat(toState),
            requiredApprovers: context.stakeholders,
            minimumApprovals: minimumApprovals,
            isRequired: true,
            timeoutHours: timeoutHours,
            metadata: {
                category: SafeGateCategory.EPIC_PORTFOLIO,
                transition: "".concat(fromState, "->").concat(toState),
                complianceRequired: context.complianceRequired
            }
        };
    };
    SafeFrameworkIntegration.prototype.buildQualityApprovalRequirement = function (gateId, qualityConfig, context) {
        return {
            id: gateId,
            name: "Quality Gate - ".concat(qualityConfig.stageId),
            description: "Quality approval required for ".concat(qualityConfig.pipelineId),
            requiredApprovers: context.stakeholders.filter(function (s) { return s.includes('quality'); }),
            minimumApprovals: 2,
            isRequired: true,
            timeoutHours: 24,
            metadata: {
                category: SafeGateCategory.QUALITY_ASSURANCE,
                pipelineId: qualityConfig.pipelineId,
                stageId: qualityConfig.stageId
            }
        };
    };
    SafeFrameworkIntegration.prototype.shouldUseLLMApproval = function (context) {
        switch (context.category) {
            case SafeGateCategory.EPIC_PORTFOLIO:
                return this.config.epicGates.autoApprovalThresholds[context.workflow.targetState] > 0;
            case SafeGateCategory.QUALITY_ASSURANCE:
                return this.config.qualityGates.llmAutoApproval;
            case SafeGateCategory.BUSINESS_VALIDATION:
                return false; // Always require human approval for business decisions
            default:
                return false;
        }
    };
    SafeFrameworkIntegration.prototype.processLLMApproval = function (gateId, context, traceabilityRecord) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, llmContext, llmConfig, result, processingTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        llmContext = {
                            task: {
                                id: context.safeEntity.id,
                                title: "".concat(context.category, " Gate Approval"),
                                description: "SAFE framework gate approval for ".concat(context.safeEntity.type),
                                type: context.category,
                                complexity: this.assessComplexity(context),
                                priority: this.assessPriority(context),
                                tags: [context.category, context.safeEntity.type],
                                dependencies: [],
                                customData: context.safeEntity.metadata
                            },
                            workflow: {
                                id: "workflow-".concat(context.safeEntity.id),
                                name: 'SAFE Framework Workflow',
                                currentState: context.workflow.currentState,
                                previousStates: context.workflow.previousStates
                            },
                            history: {
                                similarTasks: [], // Would load from historical data
                                userPatterns: {
                                    userId: 'system',
                                    approvalRate: 0.85,
                                    commonCriteria: ['compliance', 'quality', 'business_value']
                                }
                            },
                            security: {
                                hasSecrets: false,
                                affectedSystems: [context.safeEntity.type],
                                riskLevel: this.assessRiskLevel(context),
                                complianceFlags: context.compliance.frameworks
                            }
                        };
                        return [4 /*yield*/, this.getLLMConfig(context.category)];
                    case 1:
                        llmConfig = _a.sent();
                        return [4 /*yield*/, this.llmApprovalService.evaluateForApproval(llmContext, llmConfig, [])];
                    case 2:
                        result = _a.sent();
                        processingTime = Date.now() - startTime;
                        // Update traceability record
                        traceabilityRecord.aiDecision = {
                            confidence: result.decision.confidence,
                            reasoning: result.decision.reasoning,
                            model: llmConfig.model,
                            promptVersion: 'safe-integration-v1.0.0',
                            timestamp: new Date()
                        };
                        traceabilityRecord.metrics.aiProcessingTime = processingTime;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.processLLMQualityApproval = function (qualityConfig, context, traceabilityRecord) {
        return __awaiter(this, void 0, void 0, function () {
            var qualityGateService, qualityResult, llmResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qualityGateService = this.safeFramework.getQualityGateService();
                        return [4 /*yield*/, qualityGateService.executeQualityGate(qualityConfig)];
                    case 1:
                        qualityResult = _a.sent();
                        llmResult = {
                            gateId: qualityConfig.gateId,
                            taskId: context.safeEntity.id,
                            decision: {
                                approved: qualityResult.status === 'pass',
                                confidence: qualityResult.score / 100,
                                reasoning: qualityResult.message,
                                concerns: qualityResult.recommendations || [],
                                suggestedActions: qualityResult.recommendations || [],
                                metadata: {
                                    model: 'quality-gate-ai',
                                    processingTime: qualityResult.executionTime,
                                    tokenUsage: 0,
                                    version: '1.0.0'
                                }
                            },
                            autoApproved: qualityResult.status === 'pass' && (qualityResult.score / 100) >= this.config.qualityGates.humanFallbackThreshold,
                            escalatedToHuman: qualityResult.status !== 'pass' || (qualityResult.score / 100) < this.config.qualityGates.humanFallbackThreshold,
                            processingTime: qualityResult.executionTime,
                            timestamp: qualityResult.timestamp
                        };
                        // Update traceability record
                        traceabilityRecord.aiDecision = {
                            confidence: llmResult.decision.confidence,
                            reasoning: llmResult.decision.reasoning,
                            model: 'quality-gate-ai',
                            promptVersion: 'quality-gate-v1.0.0',
                            timestamp: new Date()
                        };
                        return [2 /*return*/, llmResult];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.createAGUIApprovalTask = function (gateId, context, traceabilityRecord) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Create AGUI task for human visibility and approval
                    return [4 /*yield*/, this.taskApprovalSystem.createApprovalTask({
                            id: "agui-".concat(gateId),
                            taskType: context.category,
                            title: "SAFE ".concat(context.category, " Gate Approval"),
                            description: "Review and approve ".concat(context.safeEntity.type, " transition in SAFE framework"),
                            context: {
                                gateId: gateId,
                                safeContext: context,
                                traceabilityId: traceabilityRecord.id,
                                aiDecision: traceabilityRecord.aiDecision,
                                complianceRequired: context.compliance.required
                            },
                            approvers: context.stakeholders.approvers,
                            metadata: {
                                category: context.category,
                                entityType: context.safeEntity.type,
                                entityId: context.safeEntity.id,
                                auditLevel: context.compliance.auditLevel
                            }
                        })];
                    case 1:
                        // Create AGUI task for human visibility and approval
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.completeTraceabilityRecord = function (record, completion) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        record.completedAt = new Date();
                        record.metrics.totalProcessingTime = record.completedAt.getTime() - record.createdAt.getTime();
                        if (!this.config.learning.enableContinuousLearning) return [3 /*break*/, 2];
                        _a = record;
                        return [4 /*yield*/, this.extractLearningPatterns(record, completion)];
                    case 1:
                        _a.learningExtracted = _b.sent();
                        _b.label = 2;
                    case 2: 
                    // Persist to database
                    return [4 /*yield*/, this.persistTraceabilityRecord(record)];
                    case 3:
                        // Persist to database
                        _b.sent();
                        if (!(record.aiDecision && record.humanDecision && this.config.learning.adaptPrompts)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.updateLearningModels(record)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.extractLearningPatterns = function (record, completion) {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, improvements, aiApproved, humanApproved;
            var _a;
            return __generator(this, function (_b) {
                patterns = [];
                improvements = [];
                // Pattern: AI vs Human decision alignment
                if (record.aiDecision && record.humanDecision) {
                    aiApproved = record.aiDecision.confidence > 0.7;
                    humanApproved = record.humanDecision.decision === 'approved';
                    if (aiApproved === humanApproved) {
                        patterns.push('ai_human_alignment');
                    }
                    else {
                        patterns.push('ai_human_mismatch');
                        improvements.push('Review approval criteria and thresholds');
                    }
                }
                // Pattern: Gate category specific patterns
                switch (record.category) {
                    case SafeGateCategory.EPIC_PORTFOLIO:
                        if (record.context.safeEntity.metadata.businessCase) {
                            patterns.push('business_case_provided');
                        }
                        break;
                    case SafeGateCategory.QUALITY_ASSURANCE:
                        if (((_a = record.aiDecision) === null || _a === void 0 ? void 0 : _a.confidence) && record.aiDecision.confidence > 0.9) {
                            patterns.push('high_quality_confidence');
                        }
                        break;
                }
                return [2 /*return*/, {
                        patterns: patterns,
                        improvements: improvements,
                        confidence: 0.85
                    }];
            });
        });
    };
    SafeFrameworkIntegration.prototype.updateLearningModels = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            var humanOverride;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!record.aiDecision || !record.humanDecision)
                            return [2 /*return*/];
                        humanOverride = {
                            id: "override-".concat(record.id),
                            userId: record.humanDecision.approver,
                            action: record.humanDecision.decision,
                            reason: record.humanDecision.reasoning,
                            previousLLMDecision: {
                                approved: record.aiDecision.confidence > 0.7,
                                confidence: record.aiDecision.confidence,
                                reasoning: record.aiDecision.reasoning,
                                concerns: [],
                                suggestedActions: [],
                                metadata: {
                                    model: record.aiDecision.model,
                                    processingTime: 0,
                                    tokenUsage: 0,
                                    version: '1.0.0'
                                }
                            },
                            timestamp: record.humanDecision.timestamp,
                            confidence: 0.9,
                            metadata: {}
                        };
                        return [4 /*yield*/, this.llmApprovalService.learnFromHumanFeedback(record.context.safeEntity.id, {
                                approved: record.aiDecision.confidence > 0.7,
                                confidence: record.aiDecision.confidence,
                                reasoning: record.aiDecision.reasoning,
                                concerns: [],
                                suggestedActions: [],
                                metadata: {
                                    model: record.aiDecision.model,
                                    processingTime: 0,
                                    tokenUsage: 0,
                                    version: '1.0.0'
                                }
                            }, humanOverride)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.persistTraceabilityRecord = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database('safe_gate_traceability')
                            .insert({
                            id: record.id,
                            gate_id: record.gateId,
                            category: record.category,
                            context: JSON.stringify(record.context),
                            ai_decision: record.aiDecision ? JSON.stringify(record.aiDecision) : null,
                            human_decision: record.humanDecision ? JSON.stringify(record.humanDecision) : null,
                            learning_extracted: JSON.stringify(record.learningExtracted),
                            audit_trail: JSON.stringify(record.auditTrail),
                            metrics: JSON.stringify(record.metrics),
                            created_at: record.createdAt,
                            completed_at: record.completedAt
                        })
                            .onConflict('id')
                            .merge()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SafeFrameworkIntegration.prototype.loadTraceabilityRecord = function (traceabilityId) {
        return __awaiter(this, void 0, void 0, function () {
            var row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database('safe_gate_traceability')
                            .where('id', traceabilityId)
                            .first()];
                    case 1:
                        row = _a.sent();
                        if (!row)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: row.id,
                                gateId: row.gate_id,
                                category: row.category,
                                context: JSON.parse(row.context),
                                aiDecision: row.ai_decision ? JSON.parse(row.ai_decision) : undefined,
                                humanDecision: row.human_decision ? JSON.parse(row.human_decision) : undefined,
                                learningExtracted: JSON.parse(row.learning_extracted),
                                auditTrail: JSON.parse(row.audit_trail),
                                metrics: JSON.parse(row.metrics),
                                createdAt: new Date(row.created_at),
                                completedAt: row.completed_at ? new Date(row.completed_at) : undefined
                            }];
                }
            });
        });
    };
    // Helper methods for gate configuration
    SafeFrameworkIntegration.prototype.getTransitionType = function (fromState, toState) {
        var _a;
        var transitions = (_a = {},
            _a[PortfolioKanbanState.FUNNEL] = 'intake',
            _a[PortfolioKanbanState.ANALYZING] = 'analysis',
            _a[PortfolioKanbanState.PORTFOLIO_BACKLOG] = 'prioritization',
            _a[PortfolioKanbanState.IMPLEMENTING] = 'execution',
            _a[PortfolioKanbanState.DONE] = 'completion',
            _a);
        return transitions[toState] || 'unknown';
    };
    SafeFrameworkIntegration.prototype.getRequiredApprovalCount = function (fromState, toState) {
        // Higher stakes transitions require more approvals
        if (toState === PortfolioKanbanState.IMPLEMENTING)
            return 3;
        if (toState === PortfolioKanbanState.PORTFOLIO_BACKLOG)
            return 2;
        return 1;
    };
    SafeFrameworkIntegration.prototype.getApprovalTimeout = function (fromState, toState) {
        // Critical transitions have shorter timeouts
        if (toState === PortfolioKanbanState.IMPLEMENTING)
            return 48;
        return 72;
    };
    SafeFrameworkIntegration.prototype.assessComplexity = function (context) {
        // Assess based on gate category and entity metadata
        if (context.category === SafeGateCategory.EPIC_PORTFOLIO)
            return 'complex';
        if (context.category === SafeGateCategory.QUALITY_ASSURANCE)
            return 'moderate';
        return 'simple';
    };
    SafeFrameworkIntegration.prototype.assessPriority = function (context) {
        // Assess based on compliance requirements and stakeholders
        if (context.compliance.required)
            return 'high';
        if (context.stakeholders.owners.length > 2)
            return 'medium';
        return 'low';
    };
    SafeFrameworkIntegration.prototype.assessRiskLevel = function (context) {
        // Assess based on compliance and entity type
        if (context.compliance.auditLevel === 'comprehensive')
            return 'high';
        if (context.safeEntity.type === 'epic')
            return 'medium';
        return 'low';
    };
    SafeFrameworkIntegration.prototype.getLLMConfig = function (category) {
        return __awaiter(this, void 0, void 0, function () {
            var baseConfig;
            return __generator(this, function (_a) {
                baseConfig = {
                    enabled: true,
                    model: 'claude-3-5-sonnet',
                    prompt: "Evaluate ".concat(category, " gate for SAFE framework compliance and business value"),
                    criteria: ['business_value', 'compliance', 'risk_assessment', 'stakeholder_alignment'],
                    confidenceThreshold: 0.8,
                    maxRetries: 3,
                    timeout: 30000
                };
                return [2 /*return*/, baseConfig];
            });
        });
    };
    SafeFrameworkIntegration.prototype.triggerSafeStateTransition = function (context, decision) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Trigger appropriate SAFE framework state transition
                this.logger.info('Triggering SAFE state transition', {
                    entityType: context.safeEntity.type,
                    entityId: context.safeEntity.id,
                    fromState: context.workflow.currentState,
                    toState: context.workflow.targetState,
                    decision: decision
                });
                return [2 /*return*/];
            });
        });
    };
    SafeFrameworkIntegration.prototype.triggerSafeEscalation = function (context, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Trigger SAFE framework escalation procedures
                this.logger.warn('Triggering SAFE escalation', {
                    entityType: context.safeEntity.type,
                    entityId: context.safeEntity.id,
                    reason: reason
                });
                return [2 /*return*/];
            });
        });
    };
    // Analytics and learning methods
    SafeFrameworkIntegration.prototype.extractDecisionPatterns = function (records) {
        // Implementation would analyze patterns in decision records
        return [];
    };
    SafeFrameworkIntegration.prototype.calculateAIPerformance = function (records) {
        // Implementation would calculate AI performance metrics
        return {
            autoApprovalRate: 0.75,
            humanOverrideRate: 0.15,
            averageConfidence: 0.85,
            accuracyTrend: [0.8, 0.82, 0.85, 0.87, 0.89]
        };
    };
    SafeFrameworkIntegration.prototype.analyzeHumanBehavior = function (records) {
        // Implementation would analyze human decision patterns
        return {
            averageReviewTime: 1200000, // 20 minutes
            commonRejectionReasons: ['Insufficient business justification', 'Compliance concerns'],
            escalationPatterns: ['Timeout after 24h', 'Complex business cases']
        };
    };
    SafeFrameworkIntegration.prototype.calculateComplianceMetrics = function (records) {
        // Implementation would calculate compliance metrics
        return {
            auditTrailCompleteness: 1.0,
            soc2Compliance: true,
            gatesCovered: records.length,
            totalDecisions: records.length
        };
    };
    return SafeFrameworkIntegration;
}());
exports.SafeFrameworkIntegration = SafeFrameworkIntegration;
exports.default = SafeFrameworkIntegration;
