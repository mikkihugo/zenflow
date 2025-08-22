"use strict";
/**
 * @fileoverview LLM Approval Service
 *
 * Intelligent auto-approval system using claude-zen intelligence facade
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
exports.LLMApprovalService = void 0;
var foundation_1 = require("@claude-zen/foundation");
var intelligence_1 = require("@claude-zen/intelligence");
var LLMApprovalService = /** @class */ (function () {
    function LLMApprovalService() {
        this.logger = (0, foundation_1.getLogger)('LLMApprovalService');
        this.learningData = [];
    }
    LLMApprovalService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, (0, intelligence_1.getBrainSystem)()];
                    case 1:
                        _a.brainSystem = _b.sent();
                        this.logger.info('LLM Approval Service initialized');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Evaluate a task for auto-approval using LLM
     */
    LLMApprovalService.prototype.evaluateForApproval = function (context, config, rules) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, gateId, ruleResult, llmDecision, autoApproved, escalatedToHuman, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        gateId = "gate_".concat(context.task.id, "_").concat(Date.now());
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.logger.info('Starting LLM approval evaluation', {
                            taskId: context.task.id,
                            gateId: gateId,
                            model: config.model
                        });
                        ruleResult = this.evaluateAutoApprovalRules(context, rules);
                        if (ruleResult.autoApprove) {
                            return [2 /*return*/, {
                                    gateId: gateId,
                                    taskId: context.task.id,
                                    decision: {
                                        approved: true,
                                        confidence: 1.0,
                                        reasoning: "Auto-approved by rule: ".concat(ruleResult.rule.name),
                                        concerns: [],
                                        suggestedActions: [],
                                        metadata: {
                                            model: 'rule-based',
                                            processingTime: Date.now() - startTime,
                                            tokenUsage: 0,
                                            version: '1.0.0'
                                        }
                                    },
                                    autoApproved: true,
                                    escalatedToHuman: false,
                                    rule: ruleResult.rule,
                                    processingTime: Date.now() - startTime,
                                    timestamp: new Date()
                                }];
                        }
                        return [4 /*yield*/, this.getLLMDecision(context, config)];
                    case 2:
                        llmDecision = _a.sent();
                        autoApproved = llmDecision.approved &&
                            llmDecision.confidence >= config.confidenceThreshold;
                        escalatedToHuman = !autoApproved || llmDecision.concerns.length > 0;
                        if (autoApproved) {
                            this.logger.info('LLM auto-approved task', {
                                taskId: context.task.id,
                                confidence: llmDecision.confidence,
                                reasoning: llmDecision.reasoning
                            });
                        }
                        else {
                            this.logger.info('LLM escalated task to human review', {
                                taskId: context.task.id,
                                confidence: llmDecision.confidence,
                                concerns: llmDecision.concerns
                            });
                        }
                        return [2 /*return*/, {
                                gateId: gateId,
                                taskId: context.task.id,
                                decision: llmDecision,
                                autoApproved: autoApproved,
                                escalatedToHuman: escalatedToHuman,
                                processingTime: Date.now() - startTime,
                                timestamp: new Date()
                            }];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error('LLM approval evaluation failed', error_1, {
                            taskId: context.task.id,
                            gateId: gateId
                        });
                        // Fail safe: escalate to human on any error
                        return [2 /*return*/, {
                                gateId: gateId,
                                taskId: context.task.id,
                                decision: {
                                    approved: false,
                                    confidence: 0.0,
                                    reasoning: 'LLM evaluation failed - escalated to human review',
                                    concerns: ['llm_error', 'requires_human_review'],
                                    suggestedActions: ['Review task manually', 'Check LLM service status'],
                                    metadata: {
                                        model: config.model,
                                        processingTime: Date.now() - startTime,
                                        tokenUsage: 0,
                                        version: '1.0.0'
                                    }
                                },
                                autoApproved: false,
                                escalatedToHuman: true,
                                processingTime: Date.now() - startTime,
                                timestamp: new Date()
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get LLM decision using intelligence facade
     */
    LLMApprovalService.prototype.getLLMDecision = function (context, config) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = this.buildApprovalPrompt(context, config);
                        return [4 /*yield*/, this.brainSystem.query({
                                prompt: prompt,
                                model: config.model,
                                maxTokens: 1000,
                                temperature: 0.1, // Low temperature for consistent decisions
                                timeout: config.timeout
                            })];
                    case 1:
                        response = _a.sent();
                        // Parse LLM response
                        return [2 /*return*/, this.parseLLMResponse(response, config)];
                }
            });
        });
    };
    /**
     * Build comprehensive approval prompt
     */
    LLMApprovalService.prototype.buildApprovalPrompt = function (context, config) {
        var task = context.task, workflow = context.workflow, history = context.history, security = context.security, codeAnalysis = context.codeAnalysis;
        return "You are an intelligent task approval system. Analyze this task and decide whether to approve it based on the criteria.\n\nTASK DETAILS:\n- ID: ".concat(task.id, "\n- Title: ").concat(task.title, "\n- Description: ").concat(task.description || 'None', "\n- Type: ").concat(task.type, "\n- Complexity: ").concat(task.complexity, "\n- Priority: ").concat(task.priority, "\n- Tags: ").concat(task.tags.join(', '), "\n- Dependencies: ").concat(task.dependencies.length, " dependencies\n\nWORKFLOW CONTEXT:\n- Workflow: ").concat(workflow.name, "\n- Current State: ").concat(workflow.currentState, "\n- Previous States: ").concat(workflow.previousStates.join(' → '), "\n\nSECURITY ANALYSIS:\n- Has Secrets: ").concat(security.hasSecrets, "\n- Risk Level: ").concat(security.riskLevel, "\n- Affected Systems: ").concat(security.affectedSystems.join(', '), "\n- Compliance Flags: ").concat(security.complianceFlags.join(', '), "\n\n").concat(codeAnalysis ? "\nCODE ANALYSIS:\n- Files Changed: ".concat(codeAnalysis.changedFiles.length, "\n- Lines Added: ").concat(codeAnalysis.linesAdded, "\n- Lines Deleted: ").concat(codeAnalysis.linesDeleted, "\n- Test Coverage: ").concat(codeAnalysis.testCoverage, "%\n") : '', "\n\nAPPROVAL CRITERIA:\n").concat(config.criteria.map(function (criterion) { return "- ".concat(criterion); }).join('\n'), "\n\nHISTORICAL CONTEXT:\nSimilar tasks: ").concat(history.similarTasks.length, " (").concat(history.similarTasks.filter(function (t) { return t.decision === 'approved'; }).length, " approved)\n\nINSTRUCTIONS:\n1. Analyze the task against the approval criteria\n2. Consider security implications and risk level\n3. Review code changes if applicable\n4. Check for patterns in historical decisions\n5. Provide a decision with confidence level (0.0-1.0)\n\nRespond in JSON format:\n{\n  \"approved\": boolean,\n  \"confidence\": number,\n  \"reasoning\": \"Detailed explanation of decision\",\n  \"concerns\": [\"array\", \"of\", \"specific\", \"concerns\"],\n  \"suggestedActions\": [\"array\", \"of\", \"suggested\", \"actions\"]\n}\n\nBase your decision on:\n- Security and compliance requirements\n- Code quality and testing standards\n- Task complexity and risk assessment\n- Historical approval patterns\n- Workflow stage appropriateness\n\nBe conservative: when in doubt, escalate to human review.");
    };
    /**
     * Parse and validate LLM response
     */
    LLMApprovalService.prototype.parseLLMResponse = function (response, config) {
        try {
            var parsed = typeof response === 'string' ? JSON.parse(response) : response;
            return {
                approved: Boolean(parsed.approved),
                confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
                reasoning: String(parsed.reasoning || 'No reasoning provided'),
                concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
                suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
                metadata: {
                    model: config.model,
                    processingTime: 0, // Will be filled by caller
                    tokenUsage: response.tokenUsage || 0,
                    version: '1.0.0'
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to parse LLM response', error);
            // Return safe default
            return {
                approved: false,
                confidence: 0.0,
                reasoning: 'Failed to parse LLM response - escalated to human review',
                concerns: ['parse_error'],
                suggestedActions: ['Review manually'],
                metadata: {
                    model: config.model,
                    processingTime: 0,
                    tokenUsage: 0,
                    version: '1.0.0'
                }
            };
        }
    };
    /**
     * Evaluate auto-approval rules (fast path)
     */
    LLMApprovalService.prototype.evaluateAutoApprovalRules = function (context, rules) {
        var _this = this;
        // Sort by priority (higher first)
        var sortedRules = rules
            .filter(function (rule) { return rule.enabled; })
            .sort(function (a, b) { return b.priority - a.priority; });
        var _loop_1 = function (rule) {
            try {
                var ruleContext_1 = {
                    task: context.task,
                    workflow: context.workflow,
                    security: context.security,
                    codeAnalysis: context.codeAnalysis
                };
                // Evaluate all conditions for this rule
                var allConditionsMet = rule.conditions.every(function (condition) {
                    try {
                        // Create a safe evaluation context
                        var evalFunc = new Function('context', "\n              const { task, workflow, security, codeAnalysis } = context;\n              return ".concat(condition, ";\n            "));
                        return evalFunc(ruleContext_1);
                    }
                    catch (error) {
                        _this.logger.warn('Rule condition evaluation failed', {
                            rule: rule.name,
                            condition: condition,
                            error: error
                        });
                        return false;
                    }
                });
                if (allConditionsMet) {
                    this_1.logger.info('Auto-approval rule matched', {
                        taskId: context.task.id,
                        rule: rule.name
                    });
                    return { value: { autoApprove: true, rule: rule } };
                }
            }
            catch (error) {
                this_1.logger.error('Rule evaluation error', error, { rule: rule.name });
            }
        };
        var this_1 = this;
        for (var _i = 0, sortedRules_1 = sortedRules; _i < sortedRules_1.length; _i++) {
            var rule = sortedRules_1[_i];
            var state_1 = _loop_1(rule);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return { autoApprove: false };
    };
    /**
     * Learn from human override decisions
     */
    LLMApprovalService.prototype.learnFromHumanFeedback = function (taskId, llmDecision, humanOverride) {
        return __awaiter(this, void 0, void 0, function () {
            var learning;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        learning = {
                            taskId: taskId,
                            llmDecision: llmDecision,
                            humanDecision: {
                                approved: humanOverride.action === 'approve',
                                reasoning: humanOverride.reason,
                                userId: humanOverride.userId
                            },
                            feedback: this.determineFeedbackType(llmDecision, humanOverride),
                            learningWeight: this.calculateLearningWeight(humanOverride),
                            patterns: this.extractLearningPatterns(llmDecision, humanOverride)
                        };
                        this.learningData.push(learning);
                        this.logger.info('Learning from human feedback', {
                            taskId: taskId,
                            feedback: learning.feedback,
                            patterns: learning.patterns
                        });
                        // TODO: Update ML model weights based on feedback
                        return [4 /*yield*/, this.updateLearningModel(learning)];
                    case 1:
                        // TODO: Update ML model weights based on feedback
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get approval metrics and analytics
     */
    LLMApprovalService.prototype.getApprovalMetrics = function () {
        // TODO: Implement metrics calculation from stored decisions
        return {
            totalDecisions: 0,
            autoApprovals: 0,
            humanEscalations: 0,
            accuracyRate: 0,
            averageConfidence: 0,
            averageProcessingTime: 0,
            commonReasons: [],
            improvementTrends: {
                accuracyOverTime: [],
                confidenceOverTime: []
            }
        };
    };
    LLMApprovalService.prototype.determineFeedbackType = function (llmDecision, humanOverride) {
        var llmApproved = llmDecision.approved;
        var humanApproved = humanOverride.action === 'approve';
        if (llmApproved === humanApproved) {
            return llmDecision.confidence > 0.8 ? 'correct' : 'partially_correct';
        }
        else {
            return 'incorrect';
        }
    };
    LLMApprovalService.prototype.calculateLearningWeight = function (humanOverride) {
        // Higher weight for more confident human decisions
        return Math.max(0.1, Math.min(1.0, humanOverride.confidence));
    };
    LLMApprovalService.prototype.extractLearningPatterns = function (llmDecision, humanOverride) {
        var patterns = [];
        // Extract patterns from reasoning differences
        if (llmDecision.reasoning && humanOverride.reason) {
            // TODO: Implement pattern extraction logic
            patterns.push('reasoning_mismatch');
        }
        return patterns;
    };
    LLMApprovalService.prototype.updateLearningModel = function (learning) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement model update logic
                // This would update the LLM's understanding based on human feedback
                this.logger.debug('Updated learning model', { taskId: learning.taskId });
                return [2 /*return*/];
            });
        });
    };
    return LLMApprovalService;
}());
exports.LLMApprovalService = LLMApprovalService;
