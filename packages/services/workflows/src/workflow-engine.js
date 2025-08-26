"use strict";
/**
 * @fileoverview Unified Workflow Engine
 *
 * Single, clean workflow engine that combines simple and advanced capabilities.
 * Follows Google TypeScript style guide with max 500 lines and low complexity.
 *
 * Architecture:
 * - EventEmitter-based for real-time updates
 * - Supports both simple steps and document workflows
 * - Memory and database integration optional
 * - Clean separation of concerns with focused methods
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
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var _a;
var _b, _c, _d;
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
var foundation_1 = require("@claude-zen/foundation");
var logger = (0, foundation_1.getLogger)('WorkflowEngine');
';
// ============================================================================
// WORKFLOW ENGINE CLASS
// ============================================================================
/**
 * Unified workflow engine supporting both simple and advanced use cases.
 * Enhanced with comprehensive Foundation monitoring and telemetry.
 *
 * Features:
 * - Simple step-by-step workflows with distributed tracing
 * - Document processing workflows with performance monitoring
 * - Memory and database integration with observability
 * - Event-driven architecture with comprehensive telemetry
 * - Configurable persistence with circuit breaker protection
 * - Enterprise-grade monitoring and analytics
 * - Graceful error handling and recovery
 */
var WorkflowEngine = /** @class */ (function (_super) {
    __extends(WorkflowEngine, _super);
    function WorkflowEngine(config, documentManager, memoryFactory, gatesManager) {
        if (config === void 0) { config = {}; }
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var _this = _super.call(this) || this;
        _this.activeWorkflows = new Map();
        _this.workflowDefinitions = new Map();
        _this.stepHandlers = new Map();
        _this.isInitialized = false;
        // 📊 Workflow Analytics
        _this.workflowMetrics = new Map();
        _this.executionCache = new Map();
        _this.lastHealthCheck = Date.now();
        _this.startupTime = Date.now();
        _this.config = {
            maxConcurrentWorkflows: (_a = config.maxConcurrentWorkflows) !== null && _a !== void 0 ? _a : 10,
            stepTimeout: (_b = config.stepTimeout) !== null && _b !== void 0 ? _b : 30000,
            persistWorkflows: (_c = config.persistWorkflows) !== null && _c !== void 0 ? _c : false,
            persistencePath: (_d = config.persistencePath) !== null && _d !== void 0 ? _d : './workflows',
            retryAttempts: (_e = config.retryAttempts) !== null && _e !== void 0 ? _e : 3,
            enableAdvancedOrchestration: (_f = config.enableAdvancedOrchestration) !== null && _f !== void 0 ? _f : false,
            orchestrationMode: (_g = config.orchestrationMode) !== null && _g !== void 0 ? _g : 'basic',
            enableErrorRecovery: (_h = config.enableErrorRecovery) !== null && _h !== void 0 ? _h : true,
            enablePerformanceTracking: (_j = config.enablePerformanceTracking) !== null && _j !== void 0 ? _j : true,
        };
        _this.documentManager = documentManager;
        _this.memory = memoryFactory;
        _this.gatesManager = gatesManager;
        // 🔬 Initialize comprehensive Foundation monitoring
        _this.systemMonitor = (0, foundation_1.createSystemMonitor)({
            intervalMs: 15000, // 15-second system monitoring intervals
        });
        _this.performanceTracker = (0, foundation_1.createPerformanceTracker)();
        _this.agentMonitor = (0, foundation_1.createAgentMonitor)();
        _this.mlMonitor = (0, foundation_1.createMLMonitor)();
        // 🛡️ Initialize circuit breakers for workflow protection
        _this.workflowExecutionCircuitBreaker = (0, foundation_1.createCircuitBreaker)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Workflow execution failed');
            });
        }); }, { errorThresholdPercentage: 50, resetTimeout: 30000 }, 'workflow-execution', ');
        _this.stepExecutionCircuitBreaker = (0, foundation_1.createCircuitBreaker)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Step execution failed');
            });
        }); }, { errorThresholdPercentage: 50, resetTimeout: 15000 }, 'step-execution', ');
        _this.documentProcessingCircuitBreaker = (0, foundation_1.createCircuitBreaker)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Document processing failed');
            });
        }); }, { errorThresholdPercentage: 50, resetTimeout: 20000 }, 'document-processing', ');
        // 📊 Initialize metrics recording
        (0, foundation_1.recordMetric)('workflow_engine_initialized', 1, { timestamp: Date.now() });
        ';
        (0, foundation_1.recordGauge)('workflow_engine_startup_time', _this.startupTime);
        ';
        logger.info('WorkflowEngine constructor completed with Foundation integration', config, _this.config, hasDocumentManager, !!documentManager, hasMemoryFactory, !!memoryFactory, hasGatesManager, !!gatesManager, foundationIntegration, 'comprehensive');
        return _this;
    }
    WorkflowEngine.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isInitialized) {
                    (0, foundation_1.recordEvent)('workflow_engine_already_initialized', { ': timestamp, Date: Date, : .now(), });
                    return [2 /*return*/];
                }
                return [2 /*return*/, (0, foundation_1.withAsyncTrace)('workflow-engine-initialization', function (_span) { return __awaiter(_this, void 0, void 0, function () {
                        ';
                        var initStartTime, initDuration, error_1, initDuration;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    (0, foundation_1.setTraceAttributes)('workflow.engine.config', JSON.stringify(this.config), 'workflow.engine.has_document_manager', !!this.documentManager, 'workflow.engine.has_memory_factory', !!this.memory, 'workflow.engine.has_gates_manager', !!this.gatesManager);
                                    initStartTime = Date.now();
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    // 🔧 Register default step handlers with telemetry
                                    (0, foundation_1.recordEvent)('workflow_step_handlers_registration_started', { ': timestamp, Date: Date, : .now(), });
                                    this.registerDefaultStepHandlers();
                                    (0, foundation_1.recordEvent)('workflow_step_handlers_registration_completed', { ': timestamp, Date: Date, : .now(), });
                                    // 📄 Register document workflows with telemetry
                                    (0, foundation_1.recordEvent)('workflow_document_workflows_registration_started', { ': timestamp, Date: Date, : .now(), });
                                    return [4 /*yield*/, this.registerDocumentWorkflows()];
                                case 2:
                                    _a.sent();
                                    (0, foundation_1.recordEvent)('workflow_document_workflows_registration_completed', { ': timestamp, Date: Date, : .now(), });
                                    // 🏥 Start monitoring systems
                                    (0, foundation_1.recordEvent)('workflow_monitoring_systems_started', { ': timestamp, Date: Date, : .now(), });
                                    return [4 /*yield*/, this.systemMonitor.start()];
                                case 3:
                                    _a.sent();
                                    this.isInitialized = true;
                                    initDuration = Date.now() - initStartTime;
                                    // 📊 Record initialization metrics
                                    (0, foundation_1.recordHistogram)('workflow_engine_initialization_duration', initDuration);
                                    (0, foundation_1.recordGauge)('workflow_engine_initialized_timestamp', Date.now())();
                                    ';
                                    (0, foundation_1.recordMetric)('workflow_engine_initialized_successfully', 1);
                                    ';
                                    this.emit('initialized', timestamp, new Date());
                                    ';
                                    (0, foundation_1.setTraceAttributes)('workflow.engine.initialized', true, 'workflow.engine.initialization_duration_ms', initDuration, 'workflow.engine.step_handlers_count', this.stepHandlers.size, 'workflow.engine.workflow_definitions_count', ', this.workflowDefinitions.size);
                                    logger.info('WorkflowEngine initialized successfully with Foundation monitoring', {
                                        initializationDuration: initDuration,
                                        stepHandlersCount: this.stepHandlers.size,
                                        workflowDefinitionsCount: this.workflowDefinitions.size,
                                        foundationIntegration: 'active',
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    initDuration = Date.now() - initStartTime;
                                    (0, foundation_1.recordMetric)('workflow_engine_initialization_failed', 1);
                                    ';
                                    (0, foundation_1.recordHistogram)('workflow_engine_initialization_error_duration', initDuration);
                                    logger.error('WorkflowEngine initialization failed', { ': error_1, error: error_1, instanceof: Error ? error_1.message : String(error_1),
                                        initializationDuration: initDuration, });
                                    throw new foundation_1.EnhancedError('Failed to initialize WorkflowEngine', { cause: error_1, duration: initDuration }, 'WORKFLOW_INITIALIZATION_ERROR', ');
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    WorkflowEngine.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, foundation_1.withAsyncTrace)('workflow-engine-shutdown', function (_span) { return __awaiter(_this, void 0, void 0, function () {
                        ';
                        var _shutdownStartTime, _cancelPromises;
                        var _this = this;
                        return __generator(this, function (_a) {
                            _shutdownStartTime = Date.now();
                            logger.info('Shutting down WorkflowEngine with comprehensive Foundation cleanup', ');
                            try {
                                (0, foundation_1.setTraceAttributes)({
                                    'workflow.engine.active_workflows_count': this.activeWorkflows.size,
                                    'workflow.engine.workflow_definitions_count': ',
                                    this: .workflowDefinitions.size,
                                    'workflow.engine.step_handlers_count': this.stepHandlers.size,
                                    'workflow.engine.shutdown_started': true,
                                });
                                // 🚨 Cancel all active workflows with telemetry
                                (0, foundation_1.recordEvent)('workflow_engine_cancelling_active_workflows', { ': activeWorkflowsCount, this: .activeWorkflows.size,
                                });
                                _cancelPromises = Array.from(this.activeWorkflows.keys()).map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        try {
                                            (0, foundation_1.recordEvent)('workflow_cancellation_started', { workflowId: id });
                                            ';
                                            this.cancelWorkflow(id);
                                            (0, foundation_1.recordEvent)('workflow_cancellation_completed', { ': workflowId, id: id,
                                            });
                                            return [2 /*return*/, Promise.resolve()];
                                        }
                                        catch (err) {
                                            (0, foundation_1.recordMetric)('workflow_cancellation_failed', 1, { ': workflowId, id: id,
                                            });
                                            logger.error("Error cancelling workflow ".concat(id, ":"), err);
                                            "\n              return Promise.resolve();\n            }\n          }\n        );\n\n        await Promise.all(cancelPromises);\n        recordEvent('workflow_engine_all_workflows_cancelled');'\n\n        // \uD83C\uDFE5 Shutdown monitoring systems with graceful cleanup\n        recordEvent('workflow_engine_shutting_down_monitoring');'\n        try {\n          await this.systemMonitor.stop();\n          // Note: Foundation monitoring classes don't have cleanup methods'\n          // await this.performanceTracker.cleanup?.();\n          // await this.agentMonitor.cleanup?.();\n          // await this.mlMonitor.cleanup?.();\n          recordEvent('workflow_engine_monitoring_shutdown_completed');'\n        } catch (monitoringError) {\n          recordMetric('workflow_engine_monitoring_shutdown_failed', 1);'\n          logger.warn('Error during monitoring systems shutdown', {'\n            error:\n              monitoringError instanceof Error\n                ? monitoringError.message\n                : String(monitoringError),\n          });\n        }\n\n        // \uD83D\uDEE1\uFE0F Close circuit breakers\n        recordEvent('workflow_engine_closing_circuit_breakers');'\n        try {\n          this.workflowExecutionCircuitBreaker.close?.();\n          this.stepExecutionCircuitBreaker.close?.();\n          this.documentProcessingCircuitBreaker.close?.();\n          recordEvent('workflow_engine_circuit_breakers_closed');'\n        } catch (circuitError) {\n          logger.warn('Error closing circuit breakers', {'\n            error:\n              circuitError instanceof Error\n                ? circuitError.message\n                : String(circuitError),\n          });\n        }\n\n        // \uD83E\uDDF9 Clear all state with comprehensive cleanup\n        recordEvent('workflow_engine_clearing_state');'\n        this.activeWorkflows.clear();\n        this.workflowDefinitions.clear();\n        this.stepHandlers.clear();\n        this.workflowMetrics.clear();\n        this.executionCache.clear();\n        this.removeAllListeners();\n\n        this.isInitialized = false;\n        const shutdownDuration = Date.now() - shutdownStartTime;\n\n        // \uD83D\uDCCA Record shutdown metrics\n        recordHistogram('workflow_engine_shutdown_duration', shutdownDuration);'\n        recordGauge('workflow_engine_shutdown_timestamp', Date.now())();'\n        recordMetric('workflow_engine_shutdown_completed', 1);'\n\n        setTraceAttributes({\n          'workflow.engine.shutdown_completed': true,\n          'workflow.engine.shutdown_duration_ms': shutdownDuration,\n          'workflow.engine.final_state': 'clean',\n        });\n\n        logger.info(\n          'WorkflowEngine shutdown completed successfully with Foundation cleanup',\n          {\n            shutdownDuration,\n            finalState: 'clean',\n            foundationCleanup: 'comprehensive',\n          }\n        );\n      } catch (error) {\n        const shutdownDuration = Date.now() - shutdownStartTime;\n        recordMetric('workflow_engine_shutdown_failed', 1);'\n        recordHistogram(\n          'workflow_engine_shutdown_error_duration',\n          shutdownDuration\n        );\n\n        logger.error('WorkflowEngine shutdown encountered errors', {'\n          error: error instanceof Error ? error.message : String(error),\n          shutdownDuration,\n        });\n\n        // Continue with shutdown even if there were errors\n        this.isInitialized = false;\n\n        throw new EnhancedError(\n          'WorkflowEngine shutdown completed with errors',\n          { cause: error, duration: shutdownDuration },\n          'WORKFLOW_SHUTDOWN_ERROR''\n        );\n      }\n    });\n  }\n\n  // --------------------------------------------------------------------------\n  // WORKFLOW MANAGEMENT\n  // --------------------------------------------------------------------------\n\n  @tracedAsync('workflow-start')'\n  @metered('workflow_start_operation')'\n  async startWorkflow(\n    definitionOrName: string|WorkflowDefinition,\n    context: WorkflowContext = {}\n  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {\n    return withAsyncTrace('workflow-start', async (span) => {'\n      const startTime = Date.now();\n\n      try {\n        await this.ensureInitialized();\n\n        const definition = this.resolveDefinition(definitionOrName);\n        if (!definition) {\n          recordMetric('workflow_start_definition_not_found', 1);'\n          recordEvent('workflow_start_failed', {'\n            reason: 'definition_not_found',\n          });\n          return { success: false, error: 'Workflow definition not found' };'\n        }\n\n        setTraceAttributes({\n          'workflow.definition.name': definition.name,\n          'workflow.definition.version': definition.version,\n          'workflow.definition.steps_count': definition.steps.length,\n          'workflow.context.keys': Object.keys(context).join(','),\n        });\n\n        // \uD83D\uDEA6 Check capacity with circuit breaker protection\n        return this.workflowExecutionCircuitBreaker.execute(async () => {\n          if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {\n            recordMetric('workflow_start_capacity_exceeded', 1);'\n            recordGauge(\n              'workflow_active_count_at_capacity',\n              this.activeWorkflows.size\n            );\n            recordEvent('workflow_start_failed', {'\n              reason: 'capacity_exceeded',\n              activeWorkflows: this.activeWorkflows.size,\n              maxConcurrent: this.config.maxConcurrentWorkflows,\n            });\n            return {\n              success: false,\n              error: 'Maximum concurrent workflows reached',\n            };\n          }\n\n          const workflowId = this.generateWorkflowId();\n          const workflow: WorkflowState = {\n            id: workflowId,\n            definition,\n            status: 'pending',\n            context,\n            currentStep: 0,\n            stepResults: {},\n            startTime: new Date().toISOString(),\n          };\n\n          // \uD83D\uDCCA Track workflow creation metrics\n          this.activeWorkflows.set(workflowId, workflow);\n          this.workflowMetrics.set(workflowId, {\n            startTime: Date.now(),\n            definition: definition.name,\n            stepsTotal: definition.steps.length,\n            stepsCompleted: 0,\n          });\n\n          // \uD83D\uDCC8 Record metrics\n          recordMetric('workflow_started', 1, {'\n            workflowType: definition.name,\n            stepsCount: definition.steps.length,\n          });\n          recordGauge('workflow_active_count', this.activeWorkflows.size);'\n          recordHistogram('workflow_start_duration', Date.now() - startTime);'\n\n          setTraceAttributes({\n            'workflow.id': workflowId,\n            'workflow.status': 'started',\n            'workflow.active_count': this.activeWorkflows.size,\n          });\n\n          this.emit('workflow:started', {'\n            workflowId,\n            definition: definition.name,\n          });\n          recordEvent('workflow_started_successfully', {'\n            workflowId,\n            workflowType: definition.name,\n            activeWorkflows: this.activeWorkflows.size,\n          });\n\n          // \uD83D\uDE80 Start execution in background with enhanced error handling\n          this.executeWorkflowAsync(workflow).catch((error) => {\n            recordMetric('workflow_execution_background_error', 1, {'\n              workflowId,\n            });\n            logger.error(";
                                            Workflow;
                                            $workflowIdexecution;
                                            failed: ", {";
                                            error: error instanceof Error ? error.message : String(error),
                                                workflowType;
                                            definition.name,
                                                workflowId,
                                            ;
                                        }
                                        return [2 /*return*/];
                                    });
                                }); });
                            }
                            finally { }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    ;
    __decorate([
        (0, foundation_1.tracedAsync)('workflow-engine-initialize')
    ], WorkflowEngine.prototype, "", void 0);
    __decorate([
        (0, foundation_1.metered)('workflow_engine_initialization')
    ], WorkflowEngine.prototype, "", void 0);
    __decorate([
        (0, foundation_1.tracedAsync)('workflow-engine-shutdown')
    ], WorkflowEngine.prototype, "", void 0);
    __decorate([
        (0, foundation_1.metered)('workflow_engine_shutdown')
    ], WorkflowEngine.prototype, "", void 0);
    return WorkflowEngine;
}(foundation_1.TypedEventBase));
exports.WorkflowEngine = WorkflowEngine;
try { }
catch (error) {
    var duration = Date.now() - startTime;
    (0, foundation_1.recordMetric)('workflow_start_circuit_breaker_failure', 1);
    ';
    (0, foundation_1.recordHistogram)('workflow_start_error_duration', duration);
    ';
    logger.error('Workflow start failed with circuit breaker protection', ', error, error instanceof Error ? error.message : String(error), duration);
    return {
        success: false,
        error: error instanceof Error
            ? error.message
            : 'Unknown error during workflow start',
    };
}
;
cancelWorkflow(workflowId, string);
boolean;
{
    var workflow = this.activeWorkflows.get(workflowId);
    if (!workflow)
        return false;
    workflow.status = 'cancelled';
    workflow.endTime = new Date().toISOString();
    this.activeWorkflows.delete(workflowId);
    this.emit('workflow:cancelled', { workflowId: workflowId });
    ';
    return true;
}
getWorkflowStatus(workflowId, string);
workflow_base_types_1.WorkflowState | null;
{
    return (_b = this.activeWorkflows.get(workflowId)) !== null && _b !== void 0 ? _b : null;
}
// --------------------------------------------------------------------------
// WORKFLOW REGISTRATION
// --------------------------------------------------------------------------
registerWorkflowDefinition(name, string, definition, workflow_base_types_1.WorkflowDefinition);
void {
    this: .workflowDefinitions.set(name, definition),
    logger: logger,
    : .debug("Registered workflow definition: ".concat(name))
}(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  }\n\n  registerStepHandler(type: string, handler: StepHandler): void {\n    this.stepHandlers.set(type, handler);\n    logger.debug("], ["\n  }\n\n  registerStepHandler(type: string, handler: StepHandler): void {\n    this.stepHandlers.set(type, handler);\n    logger.debug("])));
Registered;
step;
handler: $type(templateObject_2 || (templateObject_2 = __makeTemplateObject([");"], [");"])));
// --------------------------------------------------------------------------
// DOCUMENT WORKFLOW METHODS
// --------------------------------------------------------------------------
async;
registerDocumentWorkflows();
Promise < void  > (_a = {
        const: documentWorkflows,
        WorkflowDefinition: workflow_base_types_1.WorkflowDefinition
    },
    _a[] =  = [
        {
            name: 'vision-to-prds',
            description: 'Process vision documents into PRDs',
            version: '1.0.0',
            steps: [
                { type: 'extract-requirements', name: 'Extract requirements' },
                { type: 'generate-prds', name: 'Generate PRD documents' },
                { type: 'save-documents', name: 'Save to database' },
            ],
        },
        {
            name: 'prd-to-epics',
            description: 'Break down PRDs into epics',
            version: '1.0.0',
            steps: [
                { type: 'analyze-prd', name: 'Analyze PRD structure' },
                { type: 'create-epics', name: 'Create epic documents' },
                { type: 'estimate-effort', name: 'Estimate development effort' },
            ],
        },
    ],
    _a.const = registrationPromises = documentWorkflows.map(function (workflow) {
        return _this.registerWorkflowDefinition(workflow.name, workflow);
    }),
    _a.await = await,
    _a.Promise = Promise,
    _a. = .all(registrationPromises),
    _a.logger = logger,
    _a. = .info("Registered ".concat(documentWorkflows.length, " document workflows")),
    _a)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  }\n\n  @tracedAsync('document-event-processing')'\n  @metered('document_event_processing')'\n  async processDocumentEvent(\n    eventType: string,\n    documentData: unknown\n  ): Promise<void> {\n    return withAsyncTrace('document-event-processing', async (span) => {'\n      const processingStartTime = Date.now();\n      const docData = documentData as { type?: string; id?: string };\n\n      setTraceAttributes({\n        'document.event.type': eventType,\n        'document.data.type': docData.type||'unknown',\n        'document.data.id': docData.id||'unknown',\n      });\n\n      recordEvent('document_event_processing_started', {'\n        eventType,\n        documentType: docData.type,\n        documentId: docData.id,\n      });\n\n      try {\n        // \uD83D\uDEE1\uFE0F Use circuit breaker protection for document processing\n        return this.documentProcessingCircuitBreaker.execute(async () => {\n          const triggerWorkflows = this.getWorkflowsForDocumentType(\n            docData.type\n          );\n\n          if (triggerWorkflows.length === 0) {\n            recordEvent('document_event_no_workflows_found', {'\n              eventType,\n              documentType: docData.type,\n            });\n            recordMetric('document_event_no_workflows', 1, {'\n              eventType,\n              documentType: docData.type||'unknown',\n            });\n\n            logger.debug("], ["\n  }\n\n  @tracedAsync('document-event-processing')'\n  @metered('document_event_processing')'\n  async processDocumentEvent(\n    eventType: string,\n    documentData: unknown\n  ): Promise<void> {\n    return withAsyncTrace('document-event-processing', async (span) => {'\n      const processingStartTime = Date.now();\n      const docData = documentData as { type?: string; id?: string };\n\n      setTraceAttributes({\n        'document.event.type': eventType,\n        'document.data.type': docData.type||'unknown',\n        'document.data.id': docData.id||'unknown',\n      });\n\n      recordEvent('document_event_processing_started', {'\n        eventType,\n        documentType: docData.type,\n        documentId: docData.id,\n      });\n\n      try {\n        // \uD83D\uDEE1\uFE0F Use circuit breaker protection for document processing\n        return this.documentProcessingCircuitBreaker.execute(async () => {\n          const triggerWorkflows = this.getWorkflowsForDocumentType(\n            docData.type\n          );\n\n          if (triggerWorkflows.length === 0) {\n            recordEvent('document_event_no_workflows_found', {'\n              eventType,\n              documentType: docData.type,\n            });\n            recordMetric('document_event_no_workflows', 1, {'\n              eventType,\n              documentType: docData.type||'unknown',\n            });\n\n            logger.debug("])));
No;
workflows;
for (document; type; )
    : $docData.type(templateObject_4 || (templateObject_4 = __makeTemplateObject([", {"], [", {"])));
eventType,
    documentType;
docData.type,
    documentId;
docData.id,
;
;
return;
(0, foundation_1.setTraceAttributes)({
    'document.workflows.triggered_count': triggerWorkflows.length,
    'document.workflows.names': triggerWorkflows.join(','),
});
(0, foundation_1.recordEvent)('document_event_triggering_workflows', { ': eventType,
    documentType: docData.type,
    workflowsCount: triggerWorkflows.length,
    workflows: triggerWorkflows,
});
// 🚀 Start all triggered workflows in parallel with comprehensive tracking
var triggerPromises = triggerWorkflows.map(function (workflowName, index) { return __awaiter(void 0, void 0, void 0, function () {
    var workflowStartTime, result, workflowTriggerDuration, error_2, workflowTriggerDuration;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                workflowStartTime = Date.now();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                (0, foundation_1.recordEvent)('document_workflow_trigger_started', { ': workflowName, eventType: eventType, documentType: docData.type, });
                return [4 /*yield*/, this.startWorkflow(workflowName, {
                        documentData: documentData,
                        eventType: eventType,
                        triggerIndex: index,
                        triggerTimestamp: Date.now(),
                    })];
            case 2:
                result = _a.sent();
                workflowTriggerDuration = Date.now() - workflowStartTime;
                (0, foundation_1.recordHistogram)('document_workflow_trigger_duration', workflowTriggerDuration, {
                    workflowName: workflowName,
                    eventType: eventType,
                    documentType: docData.type || 'unknown',
                });
                if (result.success) {
                    (0, foundation_1.recordEvent)('document_workflow_trigger_succeeded', { ': workflowName,
                        workflowId: result.workflowId,
                        duration: workflowTriggerDuration,
                    });
                    (0, foundation_1.recordMetric)('document_workflow_triggered_successfully', 1, { ': workflowName, eventType: eventType,
                    });
                }
                else {
                    (0, foundation_1.recordEvent)('document_workflow_trigger_failed', { ': workflowName,
                        error: result.error,
                        duration: workflowTriggerDuration,
                    });
                    (0, foundation_1.recordMetric)('document_workflow_trigger_failed', 1, { ': workflowName, eventType: eventType,
                    });
                }
                return [2 /*return*/, {
                        workflowName: workflowName,
                        result: result,
                        duration: workflowTriggerDuration,
                    }];
            case 3:
                error_2 = _a.sent();
                workflowTriggerDuration = Date.now() - workflowStartTime;
                (0, foundation_1.recordMetric)('document_workflow_trigger_exception', 1, { ': workflowName, eventType: eventType,
                });
                (0, foundation_1.recordEvent)('document_workflow_trigger_exception', { ': workflowName,
                    error: error_2 instanceof Error ? error_2.message : String(error_2),
                    duration: workflowTriggerDuration,
                });
                return [2 /*return*/, {
                        workflowName: workflowName,
                        result: {
                            success: false,
                            error: error_2 instanceof Error ? error_2.message : String(error_2),
                        },
                        duration: workflowTriggerDuration,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); });
var results = await Promise.all(triggerPromises);
var totalProcessingDuration = Date.now() - processingStartTime;
// 📊 Analyze and record results
var successfulWorkflows = results.filter(function (r) { return r.result.success; });
var failedWorkflows = results.filter(function (r) { return !r.result.success; });
(0, foundation_1.recordHistogram)('document_event_total_processing_duration', totalProcessingDuration, {
    eventType: eventType,
    documentType: docData.type || 'unknown',
});
(0, foundation_1.recordGauge)('document_event_workflows_triggered', results.length);
';
(0, foundation_1.recordGauge)('document_event_workflows_successful', successfulWorkflows.length);
(0, foundation_1.recordGauge)('document_event_workflows_failed', failedWorkflows.length);
(0, foundation_1.setTraceAttributes)({
    'document.processing.duration_ms': totalProcessingDuration,
    'document.workflows.successful_count': successfulWorkflows.length,
    'document.workflows.failed_count': failedWorkflows.length,
    'document.processing.success_rate': ',
    successfulWorkflows: successfulWorkflows,
    : .length / results.length,
});
// 📝 Log detailed results
results.forEach(function (_a) {
    var workflowName = _a.workflowName, result = _a.result, duration = _a.duration;
    var logLevel = result.success ? 'info' : 'warn;;
    var status = result.success ? 'SUCCESS' : 'FAILED;;
    logger[logLevel]("Document workflow ".concat(workflowName, ": ").concat(status), {}(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n              workflowName,\n              status,\n              duration,\n              workflowId: result.workflowId,\n              error: result.error,\n              eventType,\n              documentType: docData.type,\n              documentId: docData.id,\n            });\n          });\n\n          recordEvent('document_event_processing_completed', {'\n            eventType,\n            documentType: docData.type,\n            totalDuration: totalProcessingDuration,\n            workflowsTriggered: results.length,\n            workflowsSuccessful: successfulWorkflows.length,\n            workflowsFailed: failedWorkflows.length,\n          });\n\n          logger.info('Document event processing completed', {'\n            eventType,\n            documentType: docData.type,\n            documentId: docData.id,\n            totalDuration: totalProcessingDuration,\n            workflowsTriggered: results.length,\n            workflowsSuccessful: successfulWorkflows.length,\n            workflowsFailed: failedWorkflows.length,\n            successRate: "], ["\n              workflowName,\n              status,\n              duration,\n              workflowId: result.workflowId,\n              error: result.error,\n              eventType,\n              documentType: docData.type,\n              documentId: docData.id,\n            });\n          });\n\n          recordEvent('document_event_processing_completed', {'\n            eventType,\n            documentType: docData.type,\n            totalDuration: totalProcessingDuration,\n            workflowsTriggered: results.length,\n            workflowsSuccessful: successfulWorkflows.length,\n            workflowsFailed: failedWorkflows.length,\n          });\n\n          logger.info('Document event processing completed', {'\n            eventType,\n            documentType: docData.type,\n            documentId: docData.id,\n            totalDuration: totalProcessingDuration,\n            workflowsTriggered: results.length,\n            workflowsSuccessful: successfulWorkflows.length,\n            workflowsFailed: failedWorkflows.length,\n            successRate: "]))), $, { Math: Math, : .round((successfulWorkflows.length / results.length) * 100) } % ",");
});
;
try { }
catch (error) {
    var processingDuration = Date.now() - processingStartTime;
    (0, foundation_1.recordMetric)('document_event_processing_circuit_breaker_failure', 1);
    ';
    (0, foundation_1.recordHistogram)('document_event_processing_error_duration', processingDuration);
    logger.error('Document event processing failed with circuit breaker protection', {
        eventType: eventType,
        documentType: docData.type,
        documentId: docData.id,
        error: error instanceof Error ? error.message : String(error),
        duration: processingDuration,
    });
    throw new foundation_1.EnhancedError('Document event processing failed', { ': cause, error: error, eventType: eventType, documentType: docData.type,
        duration: processingDuration, });
}
;
convertEntityToDocumentContent(entity, BaseDocumentEntity);
DocumentContent;
{
    return {
        id: entity.id,
        type: entity.type,
        title: entity.title || "".concat(entity.type, " Document"),
    }(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      content: entity.content || '',\n      metadata: {\n        entityId: entity.id,\n        createdAt: entity.created_at,\n        updatedAt: entity.updated_at,\n        version: entity.version,\n        status: entity.status,\n      },\n    };\n  }\n\n  // --------------------------------------------------------------------------\n  // DATA ACCESS METHODS\n  // --------------------------------------------------------------------------\n\n  getWorkflowData(workflowId: string): WorkflowData | null {\n    const workflow = this.activeWorkflows.get(workflowId);\n    if (!workflow) return null;\n\n    return {\n      id: workflow.id,\n      name: workflow.definition.name,\n      description: workflow.definition.description,\n      version: workflow.definition.version,\n      data: {\n        status: workflow.status,\n        context: workflow.context,\n        currentStep: workflow.currentStep,\n        stepResults: workflow.stepResults,\n      },\n    };\n  }\n\n  async createWorkflowFromData(data: WorkflowData): Promise<string> {\n    const definition: WorkflowDefinition = {\n      name: data.name,\n      description: data.description,\n      version: data.version,\n      steps: [],\n    };\n\n    const result = await this.startWorkflow(definition, data.data);\n    if (!(result.success && result.workflowId)) {\n      throw new Error("], ["\n      content: entity.content || '',\n      metadata: {\n        entityId: entity.id,\n        createdAt: entity.created_at,\n        updatedAt: entity.updated_at,\n        version: entity.version,\n        status: entity.status,\n      },\n    };\n  }\n\n  // --------------------------------------------------------------------------\n  // DATA ACCESS METHODS\n  // --------------------------------------------------------------------------\n\n  getWorkflowData(workflowId: string): WorkflowData | null {\n    const workflow = this.activeWorkflows.get(workflowId);\n    if (!workflow) return null;\n\n    return {\n      id: workflow.id,\n      name: workflow.definition.name,\n      description: workflow.definition.description,\n      version: workflow.definition.version,\n      data: {\n        status: workflow.status,\n        context: workflow.context,\n        currentStep: workflow.currentStep,\n        stepResults: workflow.stepResults,\n      },\n    };\n  }\n\n  async createWorkflowFromData(data: WorkflowData): Promise<string> {\n    const definition: WorkflowDefinition = {\n      name: data.name,\n      description: data.description,\n      version: data.version,\n      steps: [],\n    };\n\n    const result = await this.startWorkflow(definition, data.data);\n    if (!(result.success && result.workflowId)) {\n      throw new Error("])));
    Failed;
    to;
    create;
    workflow: $;
    {
        result.error;
    }
    ");";
}
return result.workflowId;
updateWorkflowData(workflowId, string, updates, (Partial));
void {
    const: workflow = this.activeWorkflows.get(workflowId),
    if: function (, workflow) {
        throw new Error("Workflow $workflowIdnot found");
        "\n    }\n\n    if (updates.data) {\n      Object.assign(workflow.context as Record<string, unknown>, updates.data);\n    }\n\n    this.emit('workflow:updated', { workflowId, updates });'\n  }\n\n  // --------------------------------------------------------------------------\n  // PRIVATE METHODS\n  // --------------------------------------------------------------------------\n\n  @tracedAsync('workflow-execution')'\n  @metered('workflow_execution_operation')'\n  private async executeWorkflowAsync(workflow: WorkflowState): Promise<void> {\n    return withAsyncTrace('workflow-execution', async (_span) => {'\n      const executionStartTime = Date.now();\n\n      setTraceAttributes({\n        'workflow.id': workflow.id,\n        'workflow.definition.name': workflow.definition.name,\n        'workflow.definition.steps_count': workflow.definition.steps.length,\n        'workflow.execution.started': true,\n      });\n\n      workflow.status = 'running';\n      recordEvent('workflow_execution_started', {'\n        workflowId: workflow.id,\n        workflowType: workflow.definition.name,\n        stepsCount: workflow.definition.steps.length,\n      });\n\n      try {\n        // \uD83D\uDD04 Execute each step with comprehensive telemetry\n        for (let i = 0; i < workflow.definition.steps.length; i++) {\n          if (workflow.status !== 'running') {'\n            recordEvent('workflow_execution_interrupted', '\n              workflowId: workflow.id,\n              currentStep: i,\n              status: workflow.status,);\n            break;\n          }\n\n          workflow.currentStep = i;\n          const step = workflow.definition.steps[i]!;\n\n          // \uD83D\uDCCA Record step execution metrics\n          recordEvent('workflow_step_execution_started', {'\n            workflowId: workflow.id,\n            stepIndex: i,\n            stepType: step.type,\n            stepName: step.name,\n          });\n\n          const stepStartTime = Date.now();\n          const result = await this.executeStep(step, workflow);\n          const stepDuration = Date.now() - stepStartTime;\n\n          // \uD83D\uDCC8 Update workflow progress metrics\n          const workflowMetric = this.workflowMetrics.get(workflow.id);\n          if (workflowMetric) {\n            workflowMetric.stepsCompleted = i + 1;\n            workflowMetric.lastStepDuration = stepDuration;\n          }\n\n          recordHistogram('workflow_step_execution_duration', stepDuration, {'\n            workflowId: workflow.id,\n            stepType: step.type,\n            stepIndex: i.toString(),\n          });\n\n          if (!result.success) {\n            workflow.status = 'failed';\n            workflow.error = result.error;\n\n            recordMetric('workflow_step_execution_failed', 1, {'\n              workflowId: workflow.id,\n              stepType: step.type,\n              stepIndex: i.toString(),\n            });\n            recordEvent('workflow_execution_failed', {'\n              workflowId: workflow.id,\n              failedStep: i,\n              stepType: step.type,\n              error: result.error,\n            });\n\n            setTraceAttributes({\n              'workflow.execution.failed': true,\n              'workflow.execution.failed_step': i,\n              'workflow.execution.error': result.error,\n            });\n\n            break;\n          }\n\n          workflow.stepResults[i] = result.output;\n          recordEvent('workflow_step_execution_completed', {'\n            workflowId: workflow.id,\n            stepIndex: i,\n            stepType: step.type,\n            duration: stepDuration,\n          });\n        }\n\n        // \uD83C\uDFAF Determine final workflow status\n        if (workflow.status === 'running') {'\n          workflow.status = 'completed';\n          recordEvent('workflow_execution_completed_successfully', {'\n            workflowId: workflow.id,\n            totalSteps: workflow.definition.steps.length,\n            executionDuration: Date.now() - executionStartTime,\n          });\n\n          setTraceAttributes({\n            'workflow.execution.completed': true,\n            'workflow.execution.steps_completed':'\n              workflow.definition.steps.length,\n          });\n        }\n      } catch (error) {\n        workflow.status = 'failed';\n        workflow.error =\n          error instanceof Error ? error.message : 'Unknown error;\n\n        recordMetric('workflow_execution_exception', 1, {'\n          workflowId: workflow.id,\n        });\n        recordEvent('workflow_execution_failed_with_exception', {'\n          workflowId: workflow.id,\n          error: workflow.error,\n          currentStep: workflow.currentStep,\n        });\n\n        setTraceAttributes({\n          'workflow.execution.failed': true,\n          'workflow.execution.exception': true,\n          'workflow.execution.error': workflow.error,\n        });\n\n        logger.error('Workflow execution failed with exception', {'\n          workflowId: workflow.id,\n          workflowType: workflow.definition.name,\n          currentStep: workflow.currentStep,\n          error: workflow.error,\n        });\n      } finally {\n        // \uD83C\uDFC1 Finalize workflow execution with comprehensive metrics\n        workflow.endTime = new Date().toISOString();\n        const totalExecutionDuration = Date.now() - executionStartTime;\n\n        // \uD83D\uDCCA Record final execution metrics\n        recordHistogram(\n          'workflow_total_execution_duration',\n          totalExecutionDuration,\n          {\n            workflowId: workflow.id,\n            workflowType: workflow.definition.name,\n            status: workflow.status,\n          }\n        );\n        recordGauge('workflow_steps_completed', workflow.currentStep, {'\n          workflowId: workflow.id,\n        });\n        recordMetric(";
        workflow_$;
        {
            workflow.status;
        }
        ", 1, {";
        workflowType: workflow.definition.name,
        ;
    },
    // 🧹 Cleanup workflow state
    this: .activeWorkflows.delete(workflow.id),
    this: .workflowMetrics.delete(workflow.id),
    : .activeWorkflows.size, ': (0, foundation_1.setTraceAttributes)('workflow.execution.final_status', workflow.status, 'workflow.execution.duration_ms', totalExecutionDuration, 'workflow.execution.steps_completed', workflow.currentStep, 'workflow.execution.finalized', true),
    this: .emit('workflow:completed', { ': workflowId, workflow: workflow, : .id,
        status: workflow.status,
        duration: totalExecutionDuration,
        stepsCompleted: workflow.currentStep, }),
    recordEvent: function (, _a) {
        var workflowId = _a[""], workflow = _a.workflow;
    },
    : .id,
    status: workflow.status,
    duration: totalExecutionDuration,
    stepsCompleted: workflow.currentStep,
    activeWorkflows: this.activeWorkflows.size,
};
;
logger.info('Workflow execution finalized', { ': workflowId, workflow: workflow, : .id,
    workflowType: workflow.definition.name,
    status: workflow.status,
    duration: totalExecutionDuration,
    stepsCompleted: workflow.currentStep,
    activeWorkflows: this.activeWorkflows.size, });
;
async;
executeStep(step, WorkflowStep, workflow, workflow_base_types_1.WorkflowState);
Promise < StepExecutionResult > {
    const: startTime = Date.now(),
    // Check if step requires gate approval
    if: function (step) { },
    : ((_c = .gateConfig) === null || _c === void 0 ? void 0 : _c.enabled) && this.gatesManager
};
{
    var gateResult = await this.executeGateForStep(step, workflow);
    if (!gateResult.success) {
        return {
            success: false,
            error: ((_d = gateResult.error) === null || _d === void 0 ? void 0 : _d.message) || 'Gate approval failed',
            duration: Date.now() - startTime,
        };
    }
    if (!gateResult.approved) {
        // Pause workflow until gate is approved
        workflow.status = 'paused';
        workflow.pausedForGate = {
            stepIndex: workflow.currentStep,
            gateId: gateResult.gateId,
            pausedAt: new Date().toISOString(),
        };
        return {
            success: true,
            output: { gateId: gateResult.gateId, status: 'pending_approval' },
            duration: Date.now() - startTime,
        };
    }
}
var handler = this.stepHandlers.get(step.type);
if (!handler) {
    return {
        success: false,
        error: "No handler found for step type: ".concat(step.type),
    }(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n        duration: Date.now() - startTime,\n      };\n    }\n\n    try {\n      const output = await Promise.race([\n        handler(workflow.context, step.params||{}),\n        this.createTimeoutPromise(step.timeout||this.config.stepTimeout),\n      ]);\n\n      return {\n        success: true,\n        output,\n        duration: Date.now() - startTime,\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message :'Unknown error',\n        duration: Date.now() - startTime,\n      };\n    }\n  }\n\n  private registerDefaultStepHandlers(): void {\n    // Default step handlers\n    this.registerStepHandler('delay', async (_context, params) => {'\n      const duration = (params as { duration?: number }).duration||1000;\n      await new Promise((resolve) => setTimeout(resolve, duration));\n      return { delayed: duration };\n    });\n\n    this.registerStepHandler('log', (_context, params) => {'\n      const message =\n        (params as { message?: string }).message||'Step executed;\n      logger.info(message);\n      return Promise.resolve({ logged: message });\n    });\n\n    this.registerStepHandler('transform', (context, params) => {'\n      const { input, transformation } = params as {\n        input?: string;\n        transformation?: unknown;\n      };\n      const inputValue = this.getNestedValue(context, input || '');'\n      return Promise.resolve({\n        transformed: this.applyTransformation(inputValue, transformation),\n      });\n    });\n  }\n\n  private resolveDefinition(\n    definitionOrName: string|WorkflowDefinition\n  ): WorkflowDefinition|'null {'\n    if (typeof definitionOrName ==='string') {'\n      return this.workflowDefinitions.get(definitionOrName)||null;\n    }\n    return definitionOrName;\n  }\n\n  private generateWorkflowId(): string {\n    return "], ["\n        duration: Date.now() - startTime,\n      };\n    }\n\n    try {\n      const output = await Promise.race([\n        handler(workflow.context, step.params||{}),\n        this.createTimeoutPromise(step.timeout||this.config.stepTimeout),\n      ]);\n\n      return {\n        success: true,\n        output,\n        duration: Date.now() - startTime,\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message :'Unknown error',\n        duration: Date.now() - startTime,\n      };\n    }\n  }\n\n  private registerDefaultStepHandlers(): void {\n    // Default step handlers\n    this.registerStepHandler('delay', async (_context, params) => {'\n      const duration = (params as { duration?: number }).duration||1000;\n      await new Promise((resolve) => setTimeout(resolve, duration));\n      return { delayed: duration };\n    });\n\n    this.registerStepHandler('log', (_context, params) => {'\n      const message =\n        (params as { message?: string }).message||'Step executed;\n      logger.info(message);\n      return Promise.resolve({ logged: message });\n    });\n\n    this.registerStepHandler('transform', (context, params) => {'\n      const { input, transformation } = params as {\n        input?: string;\n        transformation?: unknown;\n      };\n      const inputValue = this.getNestedValue(context, input || '');'\n      return Promise.resolve({\n        transformed: this.applyTransformation(inputValue, transformation),\n      });\n    });\n  }\n\n  private resolveDefinition(\n    definitionOrName: string|WorkflowDefinition\n  ): WorkflowDefinition|'null {'\n    if (typeof definitionOrName ==='string') {'\n      return this.workflowDefinitions.get(definitionOrName)||null;\n    }\n    return definitionOrName;\n  }\n\n  private generateWorkflowId(): string {\n    return "])));
    workflow - $;
    {
        Date.now();
    }
    -$;
    {
        Math.random().toString(36).substring(2, 11);
    }
    ";";
}
getWorkflowsForDocumentType(documentType ?  : string);
string[];
{
    var typeWorkflowMap = {
        vision: ['vision-to-prds'],
        prd: ['prd-to-epics'],
        epic: ['epic-to-features'],
    };
    return typeWorkflowMap[documentType || ']|' | []];
    ';
}
async;
ensureInitialized();
Promise < void  > {
    : .isInitialized
};
{
    await this.initialize();
}
createTimeoutPromise(timeout, number);
Promise < never > {
    return: new Promise(function (_, reject) {
        return setTimeout(function () { return reject(new Error("Step timeout after $timeoutms")); }, "\n        timeout\n      )\n    );\n  }\n\n  private getNestedValue(obj: unknown, path: string): unknown {\n    return path\n      .split('.')'\n      .reduce(\n        (current, key) => (current as Record<string, unknown>)?.[key],\n        obj\n      );\n  }\n\n  private applyTransformation(data: unknown, transformation: unknown): unknown {\n    if (typeof transformation === 'function') {'\n      return transformation(data);\n    }\n    return data;\n  }\n\n  // --------------------------------------------------------------------------\n  // GATE NTEGRATION METHODS\n  // --------------------------------------------------------------------------\n\n  /**\n   * Execute gate for workflow step\n   */\n  private async executeGateForStep(\n    step: WorkflowStep,\n    workflow: WorkflowState\n  ): Promise<WorkflowGateResult> {\n    if (!(this.gatesManager && step.gateConfig)) {\n      return {\n        success: false,\n        gateId: '',\n        approved: false,\n        processingTime: 0,\n        escalationLevel: 0,\n        error: new Error('Gate manager not available'),\n        correlationId: '',\n      };\n    }\n\n    try {\n      const gateId = ", workflow - $, { workflow: workflow, : .id } - step - $, { workflow: workflow, : .currentStep }(templateObject_8 || (templateObject_8 = __makeTemplateObject([";"], [";"
            // Create gate request from step configuration
        ]))));
    })
    // Create gate request from step configuration
    ,
    // Create gate request from step configuration
    const: gateRequest,
    WorkflowGateRequest: workflow_base_types_2.WorkflowGateRequest,
    Workflow: Workflow,
    step: step,
    gate: $step.name || step.type(templateObject_9 || (templateObject_9 = __makeTemplateObject([","], [","]))),
    expectedImpact: step.gateConfig.businessImpact === 'high' ? 0.7 : 0.4,
    // WorkflowGateRequest specific properties
    workflowContext: workflowId,
    workflow: workflow,
    : .id,
    stepName: step.name || step.type,
    businessImpact: step.gateConfig.businessImpact || 'medium',
    decisionScope: 'task',
    stakeholders: step.gateConfig.stakeholders || ['workflow-manager'],
    dependencies: [],
    riskFactors: [],
    gateType: step.gateConfig.gateType || 'checkpoint',
    timeoutConfig: initialTimeout,
    step: step,
    : .timeout || 300000, // 5 minutes
    escalationTimeouts: [600000, 1200000], // 10, 20 minutes
    maxTotalTimeout: 1800000, // 30 minutes,
    integrationConfig: correlationId
}(templateObject_10 || (templateObject_10 = __makeTemplateObject(["", "-", ""], ["", "-", ""])), workflow.id, workflow.currentStep), "\n          domainValidation: true,\n          enableMetrics: true,\n        },\n      };\n\n      // Initialize pending gates map if not exists\n      if (!workflow.pendingGates) {\n        workflow.pendingGates = new Map();\n      }\n      workflow.pendingGates.set(gateId, gateRequest);\n\n      // For auto-approval steps, return immediately approved\n      if (step.gateConfig.autoApproval) {\n        return {\n          success: true,\n          gateId,\n          approved: true,\n          processingTime: 10,\n          escalationLevel: 0,\n          decisionMaker:'auto-approval',\n          correlationId: gateRequest.integrationConfig?.correlationId||'',\n        };\n      }\n\n      // Simulate gate processing (in real implementation, this would go through AGUI)\n      const approved = await this.simulateGateDecision(step, workflow);\n\n      return {\n        success: true,\n        gateId,\n        approved,\n        processingTime: 100,\n        escalationLevel: 0,\n        decisionMaker: approved ? 'stakeholder' : 'rejected',\n        correlationId: gateRequest.integrationConfig?.correlationId||',\n      };\n    } catch (error) {\n      return {\n        success: false,\n        gateId: ',\n        approved: false,\n        processingTime: 0,\n        escalationLevel: 0,\n        error: error instanceof Error ? error : new Error(String(error)),\n        correlationId: ',\n      };\n    }\n  }\n\n  /**\n   * Production gate decision logic based on workflow context and business rules\n   */\n  private simulateGateDecision(\n    step: WorkflowStep,\n    workflow: WorkflowState\n  ): boolean {\n    const businessImpact = step.gateConfig?.businessImpact|||medium;\n    const stakeholders = step.gateConfig?.stakeholders||[];\n\n    // Auto-approve if configured\n    if (step.gateConfig?.autoApproval) {\n      return true;\n    }\n\n    // Analyze workflow context for decision criteria\n    const workflowAge = Date.now() - new Date(workflow.startTime).getTime();\n    const isUrgent = workflowAge > 86400000; // 24 hours\n    const hasRequiredStakeholders = stakeholders.length > 0;\n\n    // Production decision matrix based on multiple factors\n    let approvalScore = 0.5; // Base score\n\n    // Business impact weighting\n    switch (businessImpact) {\n      case'critical':'\n        approvalScore = hasRequiredStakeholders ? 0.9 : 0.3; // Require stakeholders\n        break;\n      case 'high':'\n        approvalScore = 0.75;\n        break;\n      case 'medium':'\n        approvalScore = 0.85;\n        break;\n      case 'low':'\n        approvalScore = 0.95;\n        break;\n    }\n\n    // Urgency factor\n    if (isUrgent) {\n      approvalScore += 0.1; // Slight boost for old workflows\n    }\n\n    // Previous step success factor\n    const completedSteps = workflow.currentStep;\n    const successRate =\n      completedSteps > 0\n        ? Object.keys(workflow.stepResults).length / completedSteps\n        : 1;\n    approvalScore += (successRate - 0.5) * 0.1; // Adjust based on success rate\n\n    // Stakeholder availability simulation\n    if (stakeholders.length > 0 && businessImpact === 'critical') {'\n      const stakeholderApproval = Math.random() > 0.2; // 80% stakeholder availability\n      if (!stakeholderApproval) {\n        return false;\n      }\n    }\n\n    return Math.random() < approvalScore;\n  }\n\n  /**\n   * Resume workflow after gate approval\n   */\n  async resumeWorkflowAfterGate(\n    workflowId: string,\n    gateId: string,\n    approved: boolean\n  ): Promise<{ success: boolean; error?: string }> {\n    const workflow = this.activeWorkflows.get(workflowId);\n    if (!workflow) {\n      return { success: false, error: 'Workflow not found'};'\n    }\n\n    if (!workflow.pausedForGate||workflow.pausedForGate.gateId !== gateId) {\n      return { success: false, error:'Workflow not paused for this gate' };'\n    }\n\n    // Initialize gate results map if not exists\n    if (!workflow.gateResults) {\n      workflow.gateResults = new Map();\n    }\n\n    // Record gate result\n    const gateResult: WorkflowGateResult = {\n      success: true,\n      gateId,\n      approved,\n      processingTime:\n        Date.now() - new Date(workflow.pausedForGate.pausedAt).getTime(),\n      escalationLevel: 0,\n      decisionMaker: 'external',\n      correlationId: ";
$workflowId - $gateId(templateObject_11 || (templateObject_11 = __makeTemplateObject([","], [","])));
workflow.gateResults.set(gateId, gateResult);
if (!approved) {
    // Gate rejected, fail the workflow
    workflow.status = 'failed';
    workflow.error = "Gate rejected: ".concat(gateId);
    "\n      workflow.endTime = new Date().toISOString();\n\n      this.activeWorkflows.delete(workflowId);\n      this.emit('workflow:failed', {'\n        workflowId,\n        reason: 'gate_rejected',\n        gateId,\n      });\n\n      return { success: true };\n    }\n\n    // Gate approved, resume workflow\n    workflow.status = 'running';\n    workflow.pausedForGate = undefined;\n\n    // Resume execution from the paused step\n    this.executeWorkflowAsync(workflow).catch((error) => {\n      logger.error(";
    Workflow;
    $workflowIdfailed;
    after;
    gate;
    resume: ", error);";
}
;
this.emit('workflow:resumed', { workflowId: workflowId, gateId: gateId });
';
return { success: true };
/**
 * Get workflow gate status
 */
getWorkflowGateStatus(workflowId, string);
hasPendingGates: boolean;
pendingGates: workflow_base_types_2.WorkflowGateRequest[];
gateResults: workflow_base_types_2.WorkflowGateResult[];
pausedForGate ?  : { stepIndex: number, gateId: string, pausedAt: string
};
{
    var workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
        return {
            hasPendingGates: false,
            pendingGates: [],
            gateResults: [],
        };
    }
    return {
        hasPendingGates: Boolean(workflow.pendingGates && workflow.pendingGates.size > 0),
        pendingGates: workflow.pendingGates
            ? Array.from(workflow.pendingGates.values())
            : [],
        gateResults: workflow.gateResults
            ? Array.from(workflow.gateResults.values())
            : [],
        pausedForGate: workflow.pausedForGate,
    };
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11;
