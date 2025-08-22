"use strict";
/**
 * Task Approval System - Human-in-the-loop approval for generated swarm tasks
 *
 * Integrates with existing AGUI system to provide human approval workflow
 * for tasks generated from document scanning and code analysis.
 *
 * Uses the existing WorkflowAGUIAdapter and document entity system
 * for consistent user experience and audit trail.
 *
 * @file Task approval system with AGUI integration.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskApprovalSystem = void 0;
exports.createTaskApprovalSystem = createTaskApprovalSystem;
var foundation_1 = require("@claude-zen/foundation");
var foundation_2 = require("@claude-zen/foundation");
var logger = (0, foundation_2.getLogger)('TaskApprovalSystem');
/**
 * Task Approval System with AGUI integration
 */
var TaskApprovalSystem = /** @class */ (function (_super) {
    __extends(TaskApprovalSystem, _super);
    function TaskApprovalSystem(agui, config) {
        if (config === void 0) { config = {}; }
        var _a, _b, _c, _d, _e, _f;
        var _this = _super.call(this) || this;
        _this.approvalHistory = [];
        _this.statistics = {
            totalTasksProcessed: 0,
            approvalRate: 0,
            rejectionRate: 0,
            modificationRate: 0,
            averageProcessingTime: 0,
            topRejectionReasons: [],
            approvalsByType: {}
        };
        // 📊 Internal tracking
        _this.isInitialized = false;
        _this.shutdownInProgress = false;
        _this.agui = agui;
        _this.logger = (0, foundation_2.getLogger)('TaskApprovalSystem');
        // 🏥 Initialize Foundation monitoring systems
        _this.systemMonitor = (0, foundation_2.createSystemMonitor)({ intervalMs: 5000 });
        _this.performanceTracker = (0, foundation_2.createPerformanceTracker)();
        _this.agentMonitor = (0, foundation_2.createAgentMonitor)();
        _this.mlMonitor = (0, foundation_2.createMLMonitor)();
        // 🛡️ Initialize circuit breakers for external dependencies
        _this.approvalCircuitBreaker = (0, foundation_2.createCircuitBreaker)(function () { return Promise.resolve(); });
        _this.storageCircuitBreaker = (0, foundation_2.createCircuitBreaker)(function () { return Promise.resolve(); });
        _this.aguiCircuitBreaker = (0, foundation_2.createCircuitBreaker)(function () { return Promise.resolve(); });
        // Use default configuration with overrides
        _this.config = __assign({ enableRichDisplay: (_a = config.enableRichDisplay) !== null && _a !== void 0 ? _a : true, enableBatchMode: (_b = config.enableBatchMode) !== null && _b !== void 0 ? _b : true, batchSize: (_c = config.batchSize) !== null && _c !== void 0 ? _c : 5, autoApproveLowSeverity: (_d = config.autoApproveLowSeverity) !== null && _d !== void 0 ? _d : true, requireRationale: (_e = config.requireRationale) !== null && _e !== void 0 ? _e : true, enableModification: (_f = config.enableModification) !== null && _f !== void 0 ? _f : true }, config);
        // 📊 Record initialization metrics
        (0, foundation_2.recordEvent)('task_approval_system_initializing', {
            config: JSON.stringify(_this.config),
            timestamp: Date.now()
        });
        // Initialize storage for approval history persistence
        _this.initializeStorage();
        _this.logger.info('TaskApprovalSystem initialized with Foundation monitoring', {
            config: _this.config,
            monitoringEnabled: true,
            circuitBreakersEnabled: true
        });
        // 🎯 Mark as initialized and record metrics
        _this.isInitialized = true;
        (0, foundation_2.recordMetric)('task_approval_system_initialized', 1);
        (0, foundation_2.recordEvent)('task_approval_system_ready', {
            config: JSON.stringify(_this.config),
            timestamp: Date.now()
        });
        return _this;
    }
    /**
     * Initialize storage for approval history persistence
     */
    TaskApprovalSystem.prototype.initializeStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, foundation_2.withAsyncTrace)('task-approval-storage-init', function (span) { return __awaiter(_this, void 0, void 0, function () {
                        var storageInitStartTime, error_1, initDuration;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    storageInitStartTime = Date.now();
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    (0, foundation_2.setTraceAttributes)({
                                        'storage.type': 'memory-only',
                                        'storage.initialization': 'starting'
                                    });
                                    (0, foundation_2.recordEvent)('task_approval_storage_initialization_started', {
                                        storageType: 'memory-only',
                                        timestamp: Date.now()
                                    });
                                    // 🛡️ Use circuit breaker protection for storage initialization
                                    return [4 /*yield*/, this.storageCircuitBreaker.execute(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var initDuration;
                                            return __generator(this, function (_a) {
                                                // For now, use memory-only storage
                                                // TODO: Integrate with database when available
                                                this.storage = null;
                                                initDuration = Date.now() - storageInitStartTime;
                                                (0, foundation_2.recordHistogram)('task_approval_storage_init_duration', initDuration);
                                                (0, foundation_2.recordMetric)('task_approval_storage_initialized', 1);
                                                (0, foundation_2.setTraceAttributes)({
                                                    'storage.initialization': 'completed',
                                                    'storage.init_duration_ms': initDuration
                                                });
                                                this.logger.debug('Task approval system using memory-only storage', {
                                                    initDuration: initDuration,
                                                    storageType: 'memory-only'
                                                });
                                                (0, foundation_2.recordEvent)('task_approval_storage_initialization_completed', {
                                                    storageType: 'memory-only',
                                                    duration: initDuration,
                                                    success: true
                                                });
                                                return [2 /*return*/];
                                            });
                                        }); })];
                                case 2:
                                    // 🛡️ Use circuit breaker protection for storage initialization
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    initDuration = Date.now() - storageInitStartTime;
                                    (0, foundation_2.recordMetric)('task_approval_storage_init_failed', 1);
                                    (0, foundation_2.recordHistogram)('task_approval_storage_init_error_duration', initDuration);
                                    (0, foundation_2.setTraceAttributes)({
                                        'storage.initialization': 'failed',
                                        'storage.error': error_1 instanceof Error ? error_1.message : String(error_1),
                                        'storage.init_duration_ms': initDuration
                                    });
                                    this.logger.warn('Failed to initialize storage, using memory-only mode', {
                                        error: error_1 instanceof Error ? error_1.message : String(error_1),
                                        duration: initDuration
                                    });
                                    (0, foundation_2.recordEvent)('task_approval_storage_initialization_failed', {
                                        error: error_1 instanceof Error ? error_1.message : String(error_1),
                                        duration: initDuration,
                                        fallbackMode: 'memory-only'
                                    });
                                    this.storage = null; // Fallback to memory-only mode
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Review and approve tasks generated from document scanning
     */
    TaskApprovalSystem.prototype.reviewGeneratedTasks = function (scanResults) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, foundation_2.withAsyncTrace)('task-approval-review-process', function (span) { return __awaiter(_this, void 0, void 0, function () {
                        var startTime, error_2, processingDuration;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    startTime = Date.now();
                                    (0, foundation_2.setTraceAttributes)({
                                        'tasks.total_count': scanResults.generatedTasks.length,
                                        'tasks.batch_mode': this.config.enableBatchMode,
                                        'tasks.batch_size': this.config.batchSize,
                                        'tasks.scan_duration': scanResults.scanDuration
                                    });
                                    (0, foundation_2.recordEvent)('task_approval_review_started', {
                                        totalTasks: scanResults.generatedTasks.length,
                                        batchMode: this.config.enableBatchMode,
                                        batchSize: this.config.batchSize,
                                        timestamp: Date.now()
                                    });
                                    this.logger.info("Starting task approval process for ".concat(scanResults.generatedTasks.length, " tasks"), {
                                        totalTasks: scanResults.generatedTasks.length,
                                        batchMode: this.config.enableBatchMode,
                                        batchSize: this.config.batchSize
                                    });
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, this.approvalCircuitBreaker.execute(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var decisions, approvedTasks, totalBatches, i, batchIndex, batch, batchStartTime, batchDecisions, batchDuration, batchApprovedCount, _loop_1, this_1, _i, batchDecisions_1, decision, taskIndex, task, taskStartTime, decision, taskDuration, results, approvalRate;
                                            var _a;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0: 
                                                    // Show scan summary first
                                                    return [4 /*yield*/, this.showScanSummary(scanResults)];
                                                    case 1:
                                                        // Show scan summary first
                                                        _b.sent();
                                                        decisions = [];
                                                        approvedTasks = [];
                                                        if (!(this.config.enableBatchMode && scanResults.generatedTasks.length > this.config.batchSize)) return [3 /*break*/, 6];
                                                        totalBatches = Math.ceil(scanResults.generatedTasks.length / this.config.batchSize);
                                                        (0, foundation_2.recordGauge)('task_approval_batch_count', totalBatches);
                                                        i = 0;
                                                        _b.label = 2;
                                                    case 2:
                                                        if (!(i < scanResults.generatedTasks.length)) return [3 /*break*/, 5];
                                                        batchIndex = Math.floor(i / this.config.batchSize);
                                                        batch = scanResults.generatedTasks.slice(i, i + this.config.batchSize);
                                                        (0, foundation_2.recordEvent)('task_approval_batch_processing_started', {
                                                            batchIndex: batchIndex,
                                                            batchSize: batch.length,
                                                            totalBatches: totalBatches
                                                        });
                                                        batchStartTime = Date.now();
                                                        return [4 /*yield*/, this.processBatch(batch)];
                                                    case 3:
                                                        batchDecisions = _b.sent();
                                                        batchDuration = Date.now() - batchStartTime;
                                                        (0, foundation_2.recordHistogram)('task_approval_batch_processing_duration', batchDuration, {
                                                            batchIndex: batchIndex.toString(),
                                                            batchSize: batch.length.toString()
                                                        });
                                                        decisions.push.apply(decisions, batchDecisions);
                                                        batchApprovedCount = 0;
                                                        _loop_1 = function (decision) {
                                                            if (decision.approved) {
                                                                var originalTask = batch.find(function (t) { return t.id === decision.taskId; });
                                                                if (originalTask) {
                                                                    approvedTasks.push(this_1.applyModifications(originalTask, decision));
                                                                    batchApprovedCount++;
                                                                }
                                                            }
                                                        };
                                                        this_1 = this;
                                                        for (_i = 0, batchDecisions_1 = batchDecisions; _i < batchDecisions_1.length; _i++) {
                                                            decision = batchDecisions_1[_i];
                                                            _loop_1(decision);
                                                        }
                                                        (0, foundation_2.recordEvent)('task_approval_batch_processing_completed', {
                                                            batchIndex: batchIndex,
                                                            batchSize: batch.length,
                                                            approved: batchApprovedCount,
                                                            duration: batchDuration
                                                        });
                                                        _b.label = 4;
                                                    case 4:
                                                        i += this.config.batchSize;
                                                        return [3 /*break*/, 2];
                                                    case 5: return [3 /*break*/, 10];
                                                    case 6:
                                                        // 🔄 Process individually with comprehensive telemetry
                                                        (0, foundation_2.recordEvent)('task_approval_individual_processing_started', {
                                                            totalTasks: scanResults.generatedTasks.length
                                                        });
                                                        taskIndex = 0;
                                                        _b.label = 7;
                                                    case 7:
                                                        if (!(taskIndex < scanResults.generatedTasks.length)) return [3 /*break*/, 10];
                                                        task = scanResults.generatedTasks[taskIndex];
                                                        taskStartTime = Date.now();
                                                        return [4 /*yield*/, this.reviewSingleTask(task)];
                                                    case 8:
                                                        decision = _b.sent();
                                                        taskDuration = Date.now() - taskStartTime;
                                                        (0, foundation_2.recordHistogram)('task_approval_individual_processing_duration', taskDuration, {
                                                            taskType: task.type,
                                                            priority: task.priority,
                                                            severity: task.sourceAnalysis.severity
                                                        });
                                                        decisions.push(decision);
                                                        if (decision.approved) {
                                                            approvedTasks.push(this.applyModifications(task, decision));
                                                        }
                                                        (0, foundation_2.recordEvent)('task_approval_individual_task_processed', {
                                                            taskId: task.id,
                                                            taskType: task.type,
                                                            approved: decision.approved,
                                                            decision: decision.decision,
                                                            duration: taskDuration
                                                        });
                                                        _b.label = 9;
                                                    case 9:
                                                        taskIndex++;
                                                        return [3 /*break*/, 7];
                                                    case 10:
                                                        results = {
                                                            totalTasks: scanResults.generatedTasks.length,
                                                            approved: decisions.filter(function (d) { return d.approved; }).length,
                                                            rejected: decisions.filter(function (d) { return d.decision === 'reject'; }).length,
                                                            modified: decisions.filter(function (d) { return d.decision === 'modify'; }).length,
                                                            deferred: decisions.filter(function (d) { return d.decision === 'defer'; }).length,
                                                            decisions: decisions,
                                                            processingTime: Date.now() - startTime,
                                                            approvedTasks: approvedTasks
                                                        };
                                                        // 📈 Record comprehensive metrics
                                                        (0, foundation_2.recordGauge)('task_approval_total_processed', results.totalTasks);
                                                        (0, foundation_2.recordGauge)('task_approval_approved_count', results.approved);
                                                        (0, foundation_2.recordGauge)('task_approval_rejected_count', results.rejected);
                                                        (0, foundation_2.recordGauge)('task_approval_modified_count', results.modified);
                                                        (0, foundation_2.recordGauge)('task_approval_deferred_count', results.deferred);
                                                        (0, foundation_2.recordHistogram)('task_approval_total_processing_duration', results.processingTime);
                                                        approvalRate = results.totalTasks > 0 ? results.approved / results.totalTasks : 0;
                                                        (0, foundation_2.recordGauge)('task_approval_approval_rate', approvalRate);
                                                        (0, foundation_2.setTraceAttributes)({
                                                            'tasks.results.total': results.totalTasks,
                                                            'tasks.results.approved': results.approved,
                                                            'tasks.results.rejected': results.rejected,
                                                            'tasks.results.modified': results.modified,
                                                            'tasks.results.deferred': results.deferred,
                                                            'tasks.results.approval_rate': approvalRate,
                                                            'tasks.results.processing_time_ms': results.processingTime
                                                        });
                                                        // Update statistics
                                                        this.updateStatistics(decisions, results.processingTime);
                                                        // Store approval history
                                                        (_a = this.approvalHistory).push.apply(_a, decisions);
                                                        // Show final summary
                                                        return [4 /*yield*/, this.showApprovalSummary(results)];
                                                    case 11:
                                                        // Show final summary
                                                        _b.sent();
                                                        this.logger.info('Task approval process completed successfully', {
                                                            totalTasks: results.totalTasks,
                                                            approved: results.approved,
                                                            rejected: results.rejected,
                                                            modified: results.modified,
                                                            deferred: results.deferred,
                                                            approvalRate: approvalRate,
                                                            processingTime: results.processingTime
                                                        });
                                                        (0, foundation_2.recordEvent)('task_approval_review_completed', {
                                                            totalTasks: results.totalTasks,
                                                            approved: results.approved,
                                                            rejected: results.rejected,
                                                            modified: results.modified,
                                                            deferred: results.deferred,
                                                            approvalRate: approvalRate,
                                                            processingTime: results.processingTime,
                                                            success: true
                                                        });
                                                        this.emit('approval:completed', results);
                                                        return [2 /*return*/, results];
                                                }
                                            });
                                        }); })];
                                case 2: 
                                // 🛡️ Use circuit breaker protection for approval processing
                                return [2 /*return*/, _a.sent()];
                                case 3:
                                    error_2 = _a.sent();
                                    processingDuration = Date.now() - startTime;
                                    (0, foundation_2.recordMetric)('task_approval_review_failed', 1);
                                    (0, foundation_2.recordHistogram)('task_approval_review_error_duration', processingDuration);
                                    (0, foundation_2.setTraceAttributes)({
                                        'tasks.processing.failed': true,
                                        'tasks.processing.error': error_2 instanceof Error ? error_2.message : String(error_2),
                                        'tasks.processing.duration_ms': processingDuration
                                    });
                                    this.logger.error('Task approval process failed', {
                                        error: error_2 instanceof Error ? error_2.message : String(error_2),
                                        totalTasks: scanResults.generatedTasks.length,
                                        duration: processingDuration
                                    });
                                    (0, foundation_2.recordEvent)('task_approval_review_failed', {
                                        error: error_2 instanceof Error ? error_2.message : String(error_2),
                                        totalTasks: scanResults.generatedTasks.length,
                                        duration: processingDuration
                                    });
                                    throw new foundation_2.EnhancedError('Task approval process failed', {
                                        cause: error_2,
                                        totalTasks: scanResults.generatedTasks.length,
                                        duration: processingDuration
                                    });
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Review a single task for approval
     */
    TaskApprovalSystem.prototype.reviewSingleTask = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, foundation_2.withAsyncTrace)('single-task-review', function (span) { return __awaiter(_this, void 0, void 0, function () {
                        var startTime, correlationId, error_3, reviewDuration;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    startTime = Date.now();
                                    correlationId = "task-approval-".concat(task.id, "-").concat(Date.now());
                                    (0, foundation_2.setTraceAttributes)({
                                        'task.id': task.id,
                                        'task.type': task.type,
                                        'task.priority': task.priority,
                                        'task.severity': task.sourceAnalysis.severity,
                                        'task.estimated_hours': task.estimatedHours,
                                        'task.correlation_id': correlationId
                                    });
                                    (0, foundation_2.recordEvent)('single_task_review_started', {
                                        taskId: task.id,
                                        taskType: task.type,
                                        priority: task.priority,
                                        severity: task.sourceAnalysis.severity,
                                        correlationId: correlationId
                                    });
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, this.aguiCircuitBreaker.execute(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var autoDecision, reviewDuration, questionStartTime, question, questionCreationDuration, displayStartTime, displayDuration, aguiStartTime, response, aguiDuration, parseStartTime, decision, parseDuration, rationale, rationaleStartTime, rationaleDuration, modifications, modStartTime, modDuration, approvalDecision, totalReviewDuration;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        // Auto-approve low severity tasks if configured
                                                        if (this.config.autoApproveLowSeverity &&
                                                            task.sourceAnalysis.severity === 'low' &&
                                                            task.priority === 'low') {
                                                            (0, foundation_2.recordEvent)('task_auto_approved', {
                                                                taskId: task.id,
                                                                reason: 'low-severity-auto-approval',
                                                                correlationId: correlationId
                                                            });
                                                            this.logger.debug("Auto-approving low severity task: ".concat(task.id), {
                                                                taskType: task.type,
                                                                priority: task.priority,
                                                                severity: task.sourceAnalysis.severity
                                                            });
                                                            autoDecision = {
                                                                taskId: task.id,
                                                                approved: true,
                                                                decision: 'approve',
                                                                rationale: 'Auto-approved: Low severity task with low priority',
                                                                decisionMaker: 'system',
                                                                timestamp: new Date(),
                                                                correlationId: correlationId
                                                            };
                                                            reviewDuration = Date.now() - startTime;
                                                            (0, foundation_2.recordHistogram)('single_task_review_duration', reviewDuration, {
                                                                approval_type: 'auto-approved',
                                                                task_type: task.type,
                                                                priority: task.priority
                                                            });
                                                            (0, foundation_2.setTraceAttributes)({
                                                                'task.auto_approved': true,
                                                                'task.review_duration_ms': reviewDuration,
                                                                'task.decision': 'approve'
                                                            });
                                                            return [2 /*return*/, autoDecision];
                                                        }
                                                        questionStartTime = Date.now();
                                                        question = this.createTaskReviewQuestion(task, correlationId);
                                                        questionCreationDuration = Date.now() - questionStartTime;
                                                        (0, foundation_2.recordHistogram)('task_question_creation_duration', questionCreationDuration);
                                                        if (!this.config.enableRichDisplay) return [3 /*break*/, 2];
                                                        displayStartTime = Date.now();
                                                        return [4 /*yield*/, this.displayTaskDetails(task)];
                                                    case 1:
                                                        _a.sent();
                                                        displayDuration = Date.now() - displayStartTime;
                                                        (0, foundation_2.recordHistogram)('task_details_display_duration', displayDuration);
                                                        (0, foundation_2.recordEvent)('task_details_displayed', {
                                                            taskId: task.id,
                                                            displayDuration: displayDuration,
                                                            correlationId: correlationId
                                                        });
                                                        _a.label = 2;
                                                    case 2:
                                                        aguiStartTime = Date.now();
                                                        return [4 /*yield*/, this.agui.askQuestion(question)];
                                                    case 3:
                                                        response = _a.sent();
                                                        aguiDuration = Date.now() - aguiStartTime;
                                                        (0, foundation_2.recordHistogram)('agui_question_response_duration', aguiDuration);
                                                        (0, foundation_2.recordEvent)('agui_response_received', {
                                                            taskId: task.id,
                                                            responseLength: response.length,
                                                            aguiDuration: aguiDuration,
                                                            correlationId: correlationId
                                                        });
                                                        parseStartTime = Date.now();
                                                        decision = this.parseApprovalResponse(response);
                                                        parseDuration = Date.now() - parseStartTime;
                                                        (0, foundation_2.recordHistogram)('decision_parsing_duration', parseDuration);
                                                        rationale = this.extractRationale(response);
                                                        if (!(!rationale && (this.config.requireRationale || decision.decision === 'reject'))) return [3 /*break*/, 5];
                                                        rationaleStartTime = Date.now();
                                                        return [4 /*yield*/, this.askForRationale(decision.decision)];
                                                    case 4:
                                                        rationale = _a.sent();
                                                        rationaleDuration = Date.now() - rationaleStartTime;
                                                        (0, foundation_2.recordHistogram)('rationale_collection_duration', rationaleDuration);
                                                        (0, foundation_2.recordEvent)('rationale_collected', {
                                                            taskId: task.id,
                                                            decision: decision.decision,
                                                            rationaleLength: rationale.length,
                                                            duration: rationaleDuration,
                                                            correlationId: correlationId
                                                        });
                                                        _a.label = 5;
                                                    case 5:
                                                        if (!(decision.decision === 'modify' && this.config.enableModification)) return [3 /*break*/, 7];
                                                        modStartTime = Date.now();
                                                        return [4 /*yield*/, this.getTaskModifications(task)];
                                                    case 6:
                                                        modifications = _a.sent();
                                                        modDuration = Date.now() - modStartTime;
                                                        (0, foundation_2.recordHistogram)('task_modifications_collection_duration', modDuration);
                                                        (0, foundation_2.recordEvent)('task_modifications_collected', {
                                                            taskId: task.id,
                                                            modificationsCount: modifications ? Object.keys(modifications).length : 0,
                                                            duration: modDuration,
                                                            correlationId: correlationId
                                                        });
                                                        _a.label = 7;
                                                    case 7:
                                                        approvalDecision = __assign(__assign({ taskId: task.id, approved: decision.approved, decision: decision.decision }, (modifications !== undefined && { modifications: modifications })), { rationale: rationale || 'No rationale provided', decisionMaker: 'user', timestamp: new Date(), correlationId: correlationId });
                                                        totalReviewDuration = Date.now() - startTime;
                                                        (0, foundation_2.recordHistogram)('single_task_review_duration', totalReviewDuration, {
                                                            approval_type: 'manual',
                                                            task_type: task.type,
                                                            priority: task.priority,
                                                            decision: decision.decision,
                                                            severity: task.sourceAnalysis.severity
                                                        });
                                                        (0, foundation_2.recordMetric)("task_".concat(decision.decision, "_count"), 1);
                                                        (0, foundation_2.recordGauge)('task_review_completion_rate', 1.0);
                                                        (0, foundation_2.setTraceAttributes)({
                                                            'task.manual_review': true,
                                                            'task.review_duration_ms': totalReviewDuration,
                                                            'task.decision': decision.decision,
                                                            'task.approved': decision.approved,
                                                            'task.has_modifications': !!modifications,
                                                            'task.rationale_provided': !!rationale
                                                        });
                                                        (0, foundation_2.recordEvent)('single_task_review_completed', {
                                                            taskId: task.id,
                                                            decision: decision.decision,
                                                            approved: decision.approved,
                                                            totalDuration: totalReviewDuration,
                                                            hasModifications: !!modifications,
                                                            rationaleProvided: !!rationale,
                                                            correlationId: correlationId,
                                                            success: true
                                                        });
                                                        this.emit('task:reviewed', { task: task, decision: approvalDecision });
                                                        this.logger.info('Single task review completed successfully', {
                                                            taskId: task.id,
                                                            decision: decision.decision,
                                                            approved: decision.approved,
                                                            duration: totalReviewDuration,
                                                            correlationId: correlationId
                                                        });
                                                        return [2 /*return*/, approvalDecision];
                                                }
                                            });
                                        }); })];
                                case 2: 
                                // 🛡️ Use circuit breaker protection for AGUI operations
                                return [2 /*return*/, _a.sent()];
                                case 3:
                                    error_3 = _a.sent();
                                    reviewDuration = Date.now() - startTime;
                                    (0, foundation_2.recordMetric)('single_task_review_failed', 1);
                                    (0, foundation_2.recordHistogram)('single_task_review_error_duration', reviewDuration);
                                    (0, foundation_2.setTraceAttributes)({
                                        'task.review_failed': true,
                                        'task.error': error_3 instanceof Error ? error_3.message : String(error_3),
                                        'task.review_duration_ms': reviewDuration
                                    });
                                    this.logger.error('Single task review failed', {
                                        taskId: task.id,
                                        error: error_3 instanceof Error ? error_3.message : String(error_3),
                                        duration: reviewDuration,
                                        correlationId: correlationId
                                    });
                                    (0, foundation_2.recordEvent)('single_task_review_failed', {
                                        taskId: task.id,
                                        error: error_3 instanceof Error ? error_3.message : String(error_3),
                                        duration: reviewDuration,
                                        correlationId: correlationId
                                    });
                                    throw new foundation_2.EnhancedError('Single task review failed', {
                                        cause: error_3,
                                        taskId: task.id,
                                        duration: reviewDuration,
                                        correlationId: correlationId
                                    });
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Process a batch of tasks for approval with Foundation monitoring
     */
    TaskApprovalSystem.prototype.processBatch = function (tasks) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, foundation_2.withAsyncTrace)('batch-processing', function (span) { return __awaiter(_this, void 0, void 0, function () {
                        var startTime, error_4, duration;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    startTime = Date.now();
                                    (0, foundation_2.setTraceAttributes)({
                                        'batch.size': tasks.length,
                                        'batch.processing_mode': 'batch'
                                    });
                                    (0, foundation_2.recordEvent)('batch_processing_started', {
                                        batchSize: tasks.length,
                                        timestamp: Date.now()
                                    });
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, this.aguiCircuitBreaker.execute(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var summaryStartTime, summaryDuration, batchQuestion, questionStartTime, batchResponse, questionDuration, result, processingStartTime, _a, decisions, i, task, taskStartTime, decision, taskDuration, processingDuration, totalDuration;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0: return [4 /*yield*/, this.agui.showMessage("\n\uD83D\uDCCB Reviewing batch of ".concat(tasks.length, " tasks"), 'info')];
                                                    case 1:
                                                        _b.sent();
                                                        summaryStartTime = Date.now();
                                                        return [4 /*yield*/, this.showBatchSummary(tasks)];
                                                    case 2:
                                                        _b.sent();
                                                        summaryDuration = Date.now() - summaryStartTime;
                                                        (0, foundation_2.recordHistogram)('batch_summary_display_duration', summaryDuration);
                                                        batchQuestion = {
                                                            id: "batch-review-".concat(Date.now()),
                                                            type: 'review',
                                                            question: 'How would you like to process this batch?',
                                                            context: { taskCount: tasks.length },
                                                            options: [
                                                                'Approve all tasks',
                                                                'Review each task individually',
                                                                'Reject entire batch',
                                                                'Apply bulk modifications'
                                                            ],
                                                            confidence: 0.8,
                                                            priority: 'medium'
                                                        };
                                                        questionStartTime = Date.now();
                                                        return [4 /*yield*/, this.agui.askQuestion(batchQuestion)];
                                                    case 3:
                                                        batchResponse = _b.sent();
                                                        questionDuration = Date.now() - questionStartTime;
                                                        (0, foundation_2.recordHistogram)('batch_decision_response_duration', questionDuration);
                                                        (0, foundation_2.recordEvent)('batch_decision_received', {
                                                            batchSize: tasks.length,
                                                            decision: batchResponse,
                                                            questionDuration: questionDuration
                                                        });
                                                        processingStartTime = Date.now();
                                                        _a = batchResponse;
                                                        switch (_a) {
                                                            case 'Approve all tasks': return [3 /*break*/, 4];
                                                            case '1': return [3 /*break*/, 4];
                                                            case 'Reject entire batch': return [3 /*break*/, 5];
                                                            case '3': return [3 /*break*/, 5];
                                                            case 'Apply bulk modifications': return [3 /*break*/, 6];
                                                            case '4': return [3 /*break*/, 6];
                                                        }
                                                        return [3 /*break*/, 8];
                                                    case 4:
                                                        (0, foundation_2.recordEvent)('batch_bulk_approval_started', { batchSize: tasks.length });
                                                        result = this.approveAllTasks(tasks, 'Bulk approval of entire batch');
                                                        (0, foundation_2.recordMetric)('batch_bulk_approvals', 1);
                                                        return [3 /*break*/, 13];
                                                    case 5:
                                                        (0, foundation_2.recordEvent)('batch_bulk_rejection_started', { batchSize: tasks.length });
                                                        result = this.rejectAllTasks(tasks, 'Bulk rejection of entire batch');
                                                        (0, foundation_2.recordMetric)('batch_bulk_rejections', 1);
                                                        return [3 /*break*/, 13];
                                                    case 6:
                                                        (0, foundation_2.recordEvent)('batch_bulk_modifications_started', { batchSize: tasks.length });
                                                        return [4 /*yield*/, this.applyBulkModifications(tasks)];
                                                    case 7:
                                                        result = _b.sent();
                                                        (0, foundation_2.recordMetric)('batch_bulk_modifications', 1);
                                                        return [3 /*break*/, 13];
                                                    case 8:
                                                        // Review individually with comprehensive telemetry
                                                        (0, foundation_2.recordEvent)('batch_individual_review_started', { batchSize: tasks.length });
                                                        decisions = [];
                                                        i = 0;
                                                        _b.label = 9;
                                                    case 9:
                                                        if (!(i < tasks.length)) return [3 /*break*/, 12];
                                                        task = tasks[i];
                                                        taskStartTime = Date.now();
                                                        return [4 /*yield*/, this.reviewSingleTask(task)];
                                                    case 10:
                                                        decision = _b.sent();
                                                        taskDuration = Date.now() - taskStartTime;
                                                        (0, foundation_2.recordHistogram)('batch_individual_task_duration', taskDuration, {
                                                            task_index: i.toString(),
                                                            task_type: task.type,
                                                            priority: task.priority
                                                        });
                                                        decisions.push(decision);
                                                        _b.label = 11;
                                                    case 11:
                                                        i++;
                                                        return [3 /*break*/, 9];
                                                    case 12:
                                                        (0, foundation_2.recordMetric)('batch_individual_reviews', 1);
                                                        result = decisions;
                                                        return [3 /*break*/, 13];
                                                    case 13:
                                                        processingDuration = Date.now() - processingStartTime;
                                                        totalDuration = Date.now() - startTime;
                                                        (0, foundation_2.recordHistogram)('batch_processing_duration', totalDuration, {
                                                            batch_size: tasks.length.toString(),
                                                            decision_type: batchResponse
                                                        });
                                                        (0, foundation_2.setTraceAttributes)({
                                                            'batch.decision_type': batchResponse,
                                                            'batch.processing_duration_ms': processingDuration,
                                                            'batch.total_duration_ms': totalDuration,
                                                            'batch.decisions_count': result.length
                                                        });
                                                        (0, foundation_2.recordEvent)('batch_processing_completed', {
                                                            batchSize: tasks.length,
                                                            decisionType: batchResponse,
                                                            decisionsCount: result.length,
                                                            processingDuration: processingDuration,
                                                            totalDuration: totalDuration,
                                                            success: true
                                                        });
                                                        this.logger.info('Batch processing completed successfully', {
                                                            batchSize: tasks.length,
                                                            decisionType: batchResponse,
                                                            decisionsCount: result.length,
                                                            totalDuration: totalDuration
                                                        });
                                                        return [2 /*return*/, result];
                                                }
                                            });
                                        }); })];
                                case 2: 
                                // 🛡️ Use circuit breaker protection for AGUI operations
                                return [2 /*return*/, _a.sent()];
                                case 3:
                                    error_4 = _a.sent();
                                    duration = Date.now() - startTime;
                                    (0, foundation_2.recordMetric)('batch_processing_failed', 1);
                                    (0, foundation_2.recordHistogram)('batch_processing_error_duration', duration);
                                    (0, foundation_2.setTraceAttributes)({
                                        'batch.failed': true,
                                        'batch.error': error_4 instanceof Error ? error_4.message : String(error_4),
                                        'batch.duration_ms': duration
                                    });
                                    this.logger.error('Batch processing failed', {
                                        batchSize: tasks.length,
                                        error: error_4 instanceof Error ? error_4.message : String(error_4),
                                        duration: duration
                                    });
                                    (0, foundation_2.recordEvent)('batch_processing_failed', {
                                        batchSize: tasks.length,
                                        error: error_4 instanceof Error ? error_4.message : String(error_4),
                                        duration: duration
                                    });
                                    throw new foundation_2.EnhancedError('Batch processing failed', {
                                        cause: error_4,
                                        batchSize: tasks.length,
                                        duration: duration
                                    });
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Show scan summary to user
     */
    TaskApprovalSystem.prototype.showScanSummary = function (scanResults) {
        return __awaiter(this, void 0, void 0, function () {
            var summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        summary = "\n\uD83D\uDD0D Document Scan Results Summary\n================================\n\uD83D\uDCC1 Files Scanned: ".concat(scanResults.scannedFiles, "\n\uD83D\uDD0D Issues Found: ").concat(scanResults.totalIssues, "\n\uD83D\uDCCB Tasks Generated: ").concat(scanResults.generatedTasks.length, "\n\u23F1\uFE0F  Scan Duration: ").concat(Math.round(scanResults.scanDuration / 1000), "s\n\n\uD83D\uDCCA Issue Severity Breakdown:\n").concat(Object.entries(scanResults.severityCounts)
                            .map(function (_a) {
                            var severity = _a[0], count = _a[1];
                            return "   ".concat(severity, ": ").concat(count);
                        })
                            .join('\n'), "\n\n\uD83D\uDCC8 Issue Pattern Breakdown:\n").concat(Object.entries(scanResults.patternCounts)
                            .map(function (_a) {
                            var pattern = _a[0], count = _a[1];
                            return "   ".concat(pattern, ": ").concat(count);
                        })
                            .join('\n'), "\n");
                        return [4 /*yield*/, this.agui.showMessage(summary, 'info')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Display detailed task information
     */
    TaskApprovalSystem.prototype.displayTaskDetails = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        details = "\n\uD83C\uDFAF Task Review: ".concat(task.title, "\n").concat('='.repeat(60), "\n\uD83D\uDCDD Description: ").concat(task.description, "\n\uD83C\uDFF7\uFE0F  Type: ").concat(task.type, "\n\u26A1 Priority: ").concat(task.priority, " \n\u23F1\uFE0F  Estimated Hours: ").concat(task.estimatedHours, "\n\uD83E\uDD16 Suggested Swarm: ").concat(task.suggestedSwarmType, "\n\uD83D\uDC65 Required Agents: ").concat(task.requiredAgentTypes.join(', '), "\n\n\uD83D\uDCCA Source Analysis:\n   \u2022 File: ").concat(task.sourceAnalysis.filePath, "\n   \u2022 Line: ").concat(task.sourceAnalysis.lineNumber || 'N/A', "\n   \u2022 Type: ").concat(task.sourceAnalysis.type, "\n   \u2022 Severity: ").concat(task.sourceAnalysis.severity, "\n   \u2022 Code: ").concat(task.sourceAnalysis.codeSnippet || 'N/A', "\n\n\u2705 Acceptance Criteria:\n").concat(task.acceptanceCriteria.map(function (criterion) { return "   \u2022 ".concat(criterion); }).join('\n'), "\n\n\uD83C\uDFF7\uFE0F  Tags: ").concat(task.sourceAnalysis.tags.join(', '), "\n");
                        return [4 /*yield*/, this.agui.showMessage(details, 'info')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show batch summary
     */
    TaskApprovalSystem.prototype.showBatchSummary = function (tasks) {
        return __awaiter(this, void 0, void 0, function () {
            var summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        summary = "\n\uD83D\uDCE6 Batch Summary (".concat(tasks.length, " tasks)\n").concat('='.repeat(40), "\n").concat(tasks.map(function (task, index) {
                            return "".concat(index + 1, ". ").concat(task.title, " [").concat(task.priority, "] (").concat(task.estimatedHours, "h)");
                        }).join('\n'), "\n");
                        return [4 /*yield*/, this.agui.showMessage(summary, 'info')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show final approval summary
     */
    TaskApprovalSystem.prototype.showApprovalSummary = function (results) {
        return __awaiter(this, void 0, void 0, function () {
            var summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        summary = "\n\u2705 Task Approval Summary\n========================\n\uD83D\uDCCB Total Tasks: ".concat(results.totalTasks, "\n\u2705 Approved: ").concat(results.approved, "\n\u274C Rejected: ").concat(results.rejected, "\n\uD83D\uDCDD Modified: ").concat(results.modified, "\n\u23F8\uFE0F  Deferred: ").concat(results.deferred, "\n\u23F1\uFE0F  Processing Time: ").concat(Math.round(results.processingTime / 1000), "s\n\n").concat(results.approved > 0 ?
                            "\n\uD83D\uDE80 ".concat(results.approved, " tasks approved and ready for swarm execution!") :
                            '\n⚠️  No tasks were approved for execution.', "\n");
                        return [4 /*yield*/, this.agui.showMessage(summary, 'success')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create validation question for task review
     */
    TaskApprovalSystem.prototype.createTaskReviewQuestion = function (task, correlationId) {
        return {
            id: "task-review-".concat(task.id),
            type: 'review',
            question: "Do you want to approve this ".concat(task.type, "? \"").concat(task.title, "\""),
            context: {
                task: task,
                analysis: task.sourceAnalysis,
                correlationId: correlationId
            },
            options: [
                'Approve - Add to swarm queue',
                'Modify - Make changes before approval',
                'Reject - Do not create this task',
                'Defer - Review later'
            ],
            allowCustom: true,
            confidence: 0.9,
            priority: task.priority,
            validationReason: "Task generated from ".concat(task.sourceAnalysis.type, " analysis")
        };
    };
    /**
     * Parse user response to approval question
     */
    TaskApprovalSystem.prototype.parseApprovalResponse = function (response) {
        var lowerResponse = response.toLowerCase();
        if (lowerResponse.includes('approve') || lowerResponse === '1') {
            return { decision: 'approve', approved: true };
        }
        if (lowerResponse.includes('modify') || lowerResponse === '2') {
            return { decision: 'modify', approved: true };
        }
        if (lowerResponse.includes('reject') || lowerResponse === '3') {
            return { decision: 'reject', approved: false };
        }
        if (lowerResponse.includes('defer') || lowerResponse === '4') {
            return { decision: 'defer', approved: false };
        }
        // Default to approval for positive responses
        var positiveKeywords = ['yes', 'ok', 'sure', 'good', 'fine'];
        if (positiveKeywords.some(function (keyword) { return lowerResponse.includes(keyword); })) {
            return { decision: 'approve', approved: true };
        }
        return { decision: 'reject', approved: false };
    };
    /**
     * Extract rationale from response
     */
    TaskApprovalSystem.prototype.extractRationale = function (response) {
        var rationaleMarkers = ['because', 'since', 'reason:', 'rationale:', 'due to'];
        for (var _i = 0, rationaleMarkers_1 = rationaleMarkers; _i < rationaleMarkers_1.length; _i++) {
            var marker = rationaleMarkers_1[_i];
            var index = response.toLowerCase().indexOf(marker);
            if (index >= 0) {
                return response.substring(index).trim();
            }
        }
        // If response is longer than a simple yes/no, treat it as rationale
        if (response.length > 10 && !['1', '2', '3', '4'].includes(response)) {
            return response;
        }
        return undefined;
    };
    /**
     * Ask for rationale for decision
     */
    TaskApprovalSystem.prototype.askForRationale = function (decision) {
        return __awaiter(this, void 0, void 0, function () {
            var rationaleQuestion;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rationaleQuestion = {
                            id: "rationale-".concat(Date.now()),
                            type: 'review',
                            question: "Please provide a rationale for your ".concat(decision, " decision:"),
                            context: { decision: decision },
                            confidence: 1.0,
                            priority: 'medium'
                        };
                        return [4 /*yield*/, this.agui.askQuestion(rationaleQuestion)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get modifications for a task
     */
    TaskApprovalSystem.prototype.getTaskModifications = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var modifications, modifyQuestion, modifyResponse, _a, _b, priorityQuestion, newPriority, hoursStr;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        modifications = {};
                        modifyQuestion = {
                            id: "modify-".concat(task.id),
                            type: 'review',
                            question: 'What would you like to modify?',
                            context: { task: task },
                            options: [
                                'Title',
                                'Description',
                                'Priority',
                                'Estimated Hours',
                                'Required Agent Types',
                                'Acceptance Criteria',
                                'Multiple items'
                            ],
                            confidence: 0.8
                        };
                        return [4 /*yield*/, this.agui.askQuestion(modifyQuestion)];
                    case 1:
                        modifyResponse = _c.sent();
                        if (!(modifyResponse.includes('Title') || modifyResponse === '1')) return [3 /*break*/, 3];
                        _a = modifications;
                        return [4 /*yield*/, this.askForNewValue('title', task.title)];
                    case 2:
                        _a.title = _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!(modifyResponse.includes('Description') || modifyResponse === '2')) return [3 /*break*/, 5];
                        _b = modifications;
                        return [4 /*yield*/, this.askForNewValue('description', task.description)];
                    case 4:
                        _b.description = _c.sent();
                        _c.label = 5;
                    case 5:
                        if (!(modifyResponse.includes('Priority') || modifyResponse === '3')) return [3 /*break*/, 7];
                        priorityQuestion = {
                            id: "priority-".concat(task.id),
                            type: 'review',
                            question: 'Select new priority:',
                            options: ['low', 'medium', 'high', 'critical'],
                            context: { currentPriority: task.priority },
                            confidence: 1.0
                        };
                        return [4 /*yield*/, this.agui.askQuestion(priorityQuestion)];
                    case 6:
                        newPriority = _c.sent();
                        modifications.priority = newPriority;
                        _c.label = 7;
                    case 7:
                        if (!(modifyResponse.includes('Hours') || modifyResponse === '4')) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.askForNewValue('estimated hours', task.estimatedHours.toString())];
                    case 8:
                        hoursStr = _c.sent();
                        modifications.estimatedHours = Number.parseInt(hoursStr) || task.estimatedHours;
                        _c.label = 9;
                    case 9: return [2 /*return*/, modifications];
                }
            });
        });
    };
    /**
     * Ask for new value for a field
     */
    TaskApprovalSystem.prototype.askForNewValue = function (fieldName, currentValue) {
        return __awaiter(this, void 0, void 0, function () {
            var question;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        question = {
                            id: "new-".concat(fieldName, "-").concat(Date.now()),
                            type: 'review',
                            question: "Enter new ".concat(fieldName, " (current: \"").concat(currentValue, "\"):"),
                            context: { fieldName: fieldName, currentValue: currentValue },
                            confidence: 1.0
                        };
                        return [4 /*yield*/, this.agui.askQuestion(question)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Apply modifications to a task
     */
    TaskApprovalSystem.prototype.applyModifications = function (task, decision) {
        if (!decision.modifications) {
            return task;
        }
        return __assign(__assign({}, task), { title: decision.modifications.title || task.title, description: decision.modifications.description || task.description, priority: decision.modifications.priority || task.priority, estimatedHours: decision.modifications.estimatedHours || task.estimatedHours, requiredAgentTypes: decision.modifications.requiredAgentTypes || task.requiredAgentTypes, acceptanceCriteria: decision.modifications.acceptanceCriteria || task.acceptanceCriteria });
    };
    /**
     * Approve all tasks in a batch
     */
    TaskApprovalSystem.prototype.approveAllTasks = function (tasks, rationale) {
        return tasks.map(function (task) { return ({
            taskId: task.id,
            approved: true,
            decision: 'approve',
            rationale: rationale,
            decisionMaker: 'user',
            timestamp: new Date(),
            correlationId: "batch-approve-".concat(Date.now())
        }); });
    };
    /**
     * Reject all tasks in a batch
     */
    TaskApprovalSystem.prototype.rejectAllTasks = function (tasks, rationale) {
        return tasks.map(function (task) { return ({
            taskId: task.id,
            approved: false,
            decision: 'reject',
            rationale: rationale,
            decisionMaker: 'user',
            timestamp: new Date(),
            correlationId: "batch-reject-".concat(Date.now())
        }); });
    };
    /**
     * Apply bulk modifications to all tasks
     */
    TaskApprovalSystem.prototype.applyBulkModifications = function (tasks) {
        return __awaiter(this, void 0, void 0, function () {
            var bulkModifications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBulkModifications()];
                    case 1:
                        bulkModifications = _a.sent();
                        return [2 /*return*/, tasks.map(function (task) { return (__assign(__assign({ taskId: task.id, approved: true, decision: 'modify' }, (bulkModifications !== undefined && { modifications: bulkModifications })), { rationale: 'Bulk modifications applied to entire batch', decisionMaker: 'user', timestamp: new Date(), correlationId: "batch-modify-".concat(Date.now()) })); })];
                }
            });
        });
    };
    /**
     * Get bulk modifications for batch processing
     */
    TaskApprovalSystem.prototype.getBulkModifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var question, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        question = {
                            id: "bulk-modify-".concat(Date.now()),
                            type: 'review',
                            question: 'What bulk modifications would you like to apply?',
                            options: [
                                'Lower all priorities',
                                'Increase estimated hours by 50%',
                                'Add specific agent type to all tasks',
                                'Custom modifications'
                            ],
                            context: {},
                            confidence: 0.8
                        };
                        return [4 /*yield*/, this.agui.askQuestion(question)];
                    case 1:
                        response = _a.sent();
                        // Process bulk modification choice
                        switch (response) {
                            case '1':
                            case 'Lower all priorities':
                                return [2 /*return*/, { priority: 'low' }];
                            case '2':
                            case 'Increase estimated hours by 50%':
                                return [2 /*return*/, {}]; // Would need to calculate per-task
                            default:
                                return [2 /*return*/, {}];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update approval statistics with Foundation telemetry
     */
    TaskApprovalSystem.prototype.updateStatistics = function (decisions, processingTime) {
        var _this = this;
        (0, foundation_2.withTrace)('update-statistics', function (span) {
            var _a;
            var startTime = Date.now();
            // Track previous statistics for comparison
            var previousStats = __assign({}, _this.statistics);
            _this.statistics.totalTasksProcessed += decisions.length;
            var approved = decisions.filter(function (d) { return d.approved; }).length;
            var rejected = decisions.filter(function (d) { return d.decision === 'reject'; }).length;
            var modified = decisions.filter(function (d) { return d.decision === 'modify'; }).length;
            var deferred = decisions.filter(function (d) { return d.decision === 'defer'; }).length;
            _this.statistics.approvalRate = _this.statistics.totalTasksProcessed > 0
                ? (previousStats.totalTasksProcessed * previousStats.approvalRate + approved) / _this.statistics.totalTasksProcessed
                : 0;
            _this.statistics.rejectionRate = _this.statistics.totalTasksProcessed > 0
                ? (previousStats.totalTasksProcessed * previousStats.rejectionRate + rejected) / _this.statistics.totalTasksProcessed
                : 0;
            _this.statistics.modificationRate = _this.statistics.totalTasksProcessed > 0
                ? (previousStats.totalTasksProcessed * previousStats.modificationRate + modified) / _this.statistics.totalTasksProcessed
                : 0;
            // Update average processing time with weighted average
            var currentAvg = _this.statistics.averageProcessingTime;
            var newAvg = currentAvg === 0 ? processingTime : (currentAvg + processingTime) / 2;
            _this.statistics.averageProcessingTime = newAvg;
            // Track rejection reasons with telemetry
            var newRejectionReasons = 0;
            var _loop_2 = function (decision) {
                if (decision.decision === 'reject') {
                    var existingReason = _this.statistics.topRejectionReasons.find(function (r) { return r.reason === decision.rationale; });
                    if (existingReason) {
                        existingReason.count++;
                    }
                    else {
                        _this.statistics.topRejectionReasons.push({
                            reason: decision.rationale,
                            count: 1
                        });
                        newRejectionReasons++;
                    }
                }
                // Track approval by type
                if (decision.approved) {
                    var taskType = ((_a = decisions.find(function (d) { return d.taskId === decision.taskId; })) === null || _a === void 0 ? void 0 : _a.taskId) ? 'unknown' : 'task';
                    _this.statistics.approvalsByType[taskType] = (_this.statistics.approvalsByType[taskType] || 0) + 1;
                }
            };
            for (var _i = 0, decisions_1 = decisions; _i < decisions_1.length; _i++) {
                var decision = decisions_1[_i];
                _loop_2(decision);
            }
            // Sort rejection reasons by count
            _this.statistics.topRejectionReasons.sort(function (a, b) { return b.count - a.count; });
            // 📊 Record comprehensive metrics
            (0, foundation_2.recordGauge)('task_approval_total_processed', _this.statistics.totalTasksProcessed);
            (0, foundation_2.recordGauge)('task_approval_approval_rate', _this.statistics.approvalRate);
            (0, foundation_2.recordGauge)('task_approval_rejection_rate', _this.statistics.rejectionRate);
            (0, foundation_2.recordGauge)('task_approval_modification_rate', _this.statistics.modificationRate);
            (0, foundation_2.recordGauge)('task_approval_average_processing_time', _this.statistics.averageProcessingTime);
            (0, foundation_2.recordMetric)('statistics_updated', 1);
            (0, foundation_2.recordMetric)('decisions_processed_in_update', decisions.length);
            (0, foundation_2.setTraceAttributes)({
                'statistics.decisions_processed': decisions.length,
                'statistics.approved': approved,
                'statistics.rejected': rejected,
                'statistics.modified': modified,
                'statistics.deferred': deferred,
                'statistics.new_rejection_reasons': newRejectionReasons,
                'statistics.total_processed': _this.statistics.totalTasksProcessed,
                'statistics.approval_rate': _this.statistics.approvalRate,
                'statistics.processing_time': processingTime
            });
            var updateDuration = Date.now() - startTime;
            (0, foundation_2.recordHistogram)('statistics_update_duration', updateDuration);
            (0, foundation_2.recordEvent)('statistics_updated', {
                decisionsProcessed: decisions.length,
                approved: approved,
                rejected: rejected,
                modified: modified,
                deferred: deferred,
                totalProcessed: _this.statistics.totalTasksProcessed,
                approvalRate: _this.statistics.approvalRate,
                rejectionRate: _this.statistics.rejectionRate,
                modificationRate: _this.statistics.modificationRate,
                averageProcessingTime: _this.statistics.averageProcessingTime,
                newRejectionReasons: newRejectionReasons,
                updateDuration: updateDuration
            });
            _this.logger.debug('Approval statistics updated successfully', {
                decisionsProcessed: decisions.length,
                approved: approved,
                rejected: rejected,
                modified: modified,
                deferred: deferred,
                totalProcessed: _this.statistics.totalTasksProcessed,
                approvalRate: _this.statistics.approvalRate,
                updateDuration: updateDuration
            });
        });
    };
    /**
     * Get approval statistics with Foundation telemetry
     */
    TaskApprovalSystem.prototype.getStatistics = function () {
        var _this = this;
        return (0, foundation_2.withTrace)('get-approval-statistics', function (span) {
            (0, foundation_2.recordEvent)('approval_statistics_accessed', {
                totalProcessed: _this.statistics.totalTasksProcessed,
                approvalRate: _this.statistics.approvalRate,
                timestamp: Date.now()
            });
            (0, foundation_2.setTraceAttributes)({
                'statistics.total_processed': _this.statistics.totalTasksProcessed,
                'statistics.approval_rate': _this.statistics.approvalRate,
                'statistics.rejection_rate': _this.statistics.rejectionRate,
                'statistics.modification_rate': _this.statistics.modificationRate
            });
            (0, foundation_2.recordMetric)('approval_statistics_accessed', 1);
            return __assign({}, _this.statistics);
        });
    };
    /**
     * Get approval history with Foundation telemetry
     */
    TaskApprovalSystem.prototype.getApprovalHistory = function () {
        var _this = this;
        return (0, foundation_2.withTrace)('get-approval-history', function (span) {
            (0, foundation_2.recordEvent)('approval_history_accessed', {
                historyLength: _this.approvalHistory.length,
                timestamp: Date.now()
            });
            (0, foundation_2.setTraceAttributes)({
                'history.length': _this.approvalHistory.length,
                'history.accessed': true
            });
            (0, foundation_2.recordMetric)('approval_history_accessed', 1);
            (0, foundation_2.recordGauge)('approval_history_size', _this.approvalHistory.length);
            return __spreadArray([], _this.approvalHistory, true);
        });
    };
    /**
     * Export approval decisions for audit with Foundation telemetry
     */
    TaskApprovalSystem.prototype.exportDecisions = function (format) {
        var _this = this;
        if (format === void 0) { format = 'json'; }
        return (0, foundation_2.withTrace)('export-approval-decisions', function (span) {
            var startTime = Date.now();
            (0, foundation_2.setTraceAttributes)({
                'export.format': format,
                'export.decisions_count': _this.approvalHistory.length
            });
            (0, foundation_2.recordEvent)('approval_decisions_export_started', {
                format: format,
                decisionsCount: _this.approvalHistory.length,
                timestamp: Date.now()
            });
            try {
                var result = void 0;
                if (format === 'csv') {
                    var headers = ['Task ID', 'Decision', 'Approved', 'Rationale', 'Decision Maker', 'Timestamp'];
                    var rows = _this.approvalHistory.map(function (decision) { return [
                        decision.taskId,
                        decision.decision,
                        decision.approved.toString(),
                        decision.rationale,
                        decision.decisionMaker,
                        decision.timestamp.toISOString()
                    ]; });
                    result = __spreadArray([headers], rows, true).map(function (row) { return row.map(function (cell) { return "\"".concat(cell, "\""); }).join(','); })
                        .join('\n');
                }
                else {
                    result = JSON.stringify(_this.approvalHistory, null, 2);
                }
                var exportDuration = Date.now() - startTime;
                (0, foundation_2.recordHistogram)('approval_decisions_export_duration', exportDuration, {
                    format: format,
                    decisions_count: _this.approvalHistory.length.toString()
                });
                (0, foundation_2.setTraceAttributes)({
                    'export.success': true,
                    'export.duration_ms': exportDuration,
                    'export.size_bytes': result.length
                });
                (0, foundation_2.recordEvent)('approval_decisions_export_completed', {
                    format: format,
                    decisionsCount: _this.approvalHistory.length,
                    exportSize: result.length,
                    duration: exportDuration,
                    success: true
                });
                (0, foundation_2.recordMetric)('approval_decisions_exported', 1);
                _this.logger.info('Approval decisions exported successfully', {
                    format: format,
                    decisionsCount: _this.approvalHistory.length,
                    exportSize: result.length,
                    duration: exportDuration
                });
                return result;
            }
            catch (error) {
                var exportDuration = Date.now() - startTime;
                (0, foundation_2.recordMetric)('approval_decisions_export_failed', 1);
                (0, foundation_2.recordHistogram)('approval_decisions_export_error_duration', exportDuration);
                (0, foundation_2.setTraceAttributes)({
                    'export.failed': true,
                    'export.error': error instanceof Error ? error.message : String(error),
                    'export.duration_ms': exportDuration
                });
                _this.logger.error('Approval decisions export failed', {
                    format: format,
                    error: error instanceof Error ? error.message : String(error),
                    duration: exportDuration
                });
                (0, foundation_2.recordEvent)('approval_decisions_export_failed', {
                    format: format,
                    error: error instanceof Error ? error.message : String(error),
                    duration: exportDuration
                });
                throw new foundation_2.EnhancedError('Failed to export approval decisions', {
                    cause: error,
                    format: format,
                    decisionsCount: _this.approvalHistory.length,
                    duration: exportDuration
                });
            }
        });
    };
    /**
     * Graceful shutdown with Foundation cleanup
     */
    TaskApprovalSystem.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, foundation_2.withAsyncTrace)('task-approval-shutdown', function (span) { return __awaiter(_this, void 0, void 0, function () {
                        var shutdownStartTime, shutdownDuration, error_5, shutdownDuration;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (this.shutdownInProgress) {
                                        this.logger.warn('Shutdown already in progress');
                                        return [2 /*return*/];
                                    }
                                    this.shutdownInProgress = true;
                                    shutdownStartTime = Date.now();
                                    (0, foundation_2.recordEvent)('task_approval_system_shutdown_started', {
                                        timestamp: Date.now()
                                    });
                                    this.logger.info('Initiating TaskApprovalSystem shutdown...');
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, 5, 6]);
                                    // 🛑 Stop accepting new operations
                                    (0, foundation_2.setTraceAttributes)({
                                        'shutdown.initiated': true,
                                        'shutdown.total_decisions': this.approvalHistory.length,
                                        'shutdown.total_processed': this.statistics.totalTasksProcessed
                                    });
                                    if (!this.storage) return [3 /*break*/, 3];
                                    return [4 /*yield*/, this.storageCircuitBreaker.execute(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                // Save approval history if storage is available
                                                this.logger.debug('Saving approval history during shutdown');
                                                return [2 /*return*/];
                                            });
                                        }); })];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    // 📊 Record final statistics
                                    (0, foundation_2.recordGauge)('task_approval_final_total_processed', this.statistics.totalTasksProcessed);
                                    (0, foundation_2.recordGauge)('task_approval_final_approval_rate', this.statistics.approvalRate);
                                    (0, foundation_2.recordGauge)('task_approval_final_history_size', this.approvalHistory.length);
                                    // 🧹 Clean up monitoring systems
                                    // Foundation monitoring systems don't need explicit cleanup
                                    // 🔌 Clear event listeners
                                    this.removeAllListeners();
                                    // 🎯 Mark as no longer initialized
                                    this.isInitialized = false;
                                    shutdownDuration = Date.now() - shutdownStartTime;
                                    (0, foundation_2.recordHistogram)('task_approval_system_shutdown_duration', shutdownDuration);
                                    (0, foundation_2.setTraceAttributes)({
                                        'shutdown.completed': true,
                                        'shutdown.duration_ms': shutdownDuration,
                                        'shutdown.clean': true
                                    });
                                    (0, foundation_2.recordEvent)('task_approval_system_shutdown_completed', {
                                        totalDecisions: this.approvalHistory.length,
                                        totalProcessed: this.statistics.totalTasksProcessed,
                                        shutdownDuration: shutdownDuration,
                                        success: true
                                    });
                                    this.logger.info('TaskApprovalSystem shutdown completed successfully', {
                                        totalDecisions: this.approvalHistory.length,
                                        totalProcessed: this.statistics.totalTasksProcessed,
                                        shutdownDuration: shutdownDuration
                                    });
                                    (0, foundation_2.recordMetric)('task_approval_system_shutdown_completed', 1);
                                    return [3 /*break*/, 6];
                                case 4:
                                    error_5 = _a.sent();
                                    shutdownDuration = Date.now() - shutdownStartTime;
                                    (0, foundation_2.recordMetric)('task_approval_system_shutdown_failed', 1);
                                    (0, foundation_2.recordHistogram)('task_approval_system_shutdown_error_duration', shutdownDuration);
                                    (0, foundation_2.setTraceAttributes)({
                                        'shutdown.failed': true,
                                        'shutdown.error': error_5 instanceof Error ? error_5.message : String(error_5),
                                        'shutdown.duration_ms': shutdownDuration
                                    });
                                    this.logger.error('TaskApprovalSystem shutdown failed', {
                                        error: error_5 instanceof Error ? error_5.message : String(error_5),
                                        duration: shutdownDuration
                                    });
                                    (0, foundation_2.recordEvent)('task_approval_system_shutdown_failed', {
                                        error: error_5 instanceof Error ? error_5.message : String(error_5),
                                        duration: shutdownDuration
                                    });
                                    throw new foundation_2.EnhancedError('TaskApprovalSystem shutdown failed', {
                                        cause: error_5,
                                        duration: shutdownDuration
                                    });
                                case 5:
                                    this.shutdownInProgress = false;
                                    return [7 /*endfinally*/];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    return TaskApprovalSystem;
}(foundation_1.TypedEventBase));
exports.TaskApprovalSystem = TaskApprovalSystem;
/**
 * Create task approval system with AGUI integration
 */
function createTaskApprovalSystem(agui, config) {
    return new TaskApprovalSystem(agui, config);
}
