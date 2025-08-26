"use strict";
/**
 * @file Engine implementation - Battle-Tested Workflow Processing
 *
 * Professional workflow engine using battle-tested libraries for reliability:
 * - lodash-es: Data manipulation and collection operations
 * - date-fns: Professional date/time handling
 * - nanoid: Secure ID generation
 * - zod: Runtime validation and type safety
 * - rxjs: Reactive programming and async coordination
 * - immer: Immutable state management
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
var foundation_1 = require("@claude-zen/foundation");
// Professional utility imports
var index_1 = require("./utilities/index");
var logger = (0, foundation_1.getLogger)('WorkflowEngine');
';
/**
 * Workflow Engine
 * Sequential workflow processing engine using battle-tested libraries.
 * Replaced custom implementations with reliable, optimized solutions.
 */
var promises_1 = require("node:fs/promises");
var async = require("async");
// Mermaid will be imported dynamically when needed
var cron = require("node-cron");
var p_limit_1 = require("p-limit");
var WorkflowEngine = /** @class */ (function (_super) {
    __extends(WorkflowEngine, _super);
    function WorkflowEngine(config, documentManager, memoryFactory) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.activeWorkflows = new Map();
        _this.workflowDefinitions = new Map();
        _this.stepHandlers = new Map();
        _this.isInitialized = false;
        _this.definition = foundDefinition;
        _this.config = {
            maxConcurrentWorkflows: config.maxConcurrentWorkflows === undefined
                ? 10
                : config === null || config === void 0 ? void 0 : config.maxConcurrentWorkflows,
            persistWorkflows: config.persistWorkflows === undefined
                ? false
                : config === null || config === void 0 ? void 0 : config.persistWorkflows,
            persistencePath: config.persistencePath === undefined
                ? './workflows' : , ': config === null || config === void 0 ? void 0 : config.persistencePath,
            stepTimeout: config.stepTimeout === undefined ? 30000 : config === null || config === void 0 ? void 0 : config.stepTimeout,
            retryDelay: config.retryDelay === undefined ? 1000 : config === null || config === void 0 ? void 0 : config.retryDelay,
            enableVisualization: config.enableVisualization === undefined
                ? false
                : config === null || config === void 0 ? void 0 : config.enableVisualization,
            enableAdvancedOrchestration: config.enableAdvancedOrchestration === undefined
                ? true
                : config === null || config === void 0 ? void 0 : config.enableAdvancedOrchestration,
        };
        // Enhanced capabilities
        _this.documentManager = documentManager;
        _this.memory = memoryFactory;
        // Initialize KV store
        _this.kvStore = (0, foundation_1.getKVStore)('workflows');
        ';
        return _this;
    }
    WorkflowEngine_1 = WorkflowEngine;
    WorkflowEngine.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized)
                            return [2 /*return*/];
                        if (!this.config.persistWorkflows) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, promises_1.mkdir)(this.config.persistencePath, { recursive: true })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Register built-in step handlers
                        this.registerBuiltInHandlers();
                        if (!this.config.persistWorkflows) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.loadPersistedWorkflows()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.isInitialized = true;
                        this.emit('initialized', { timestamp: new Date() });
                        ';
                        return [2 /*return*/];
                }
            });
        });
    };
    WorkflowEngine.prototype.registerBuiltInHandlers = function () {
        var _this = this;
        // Delay step
        this.registerStepHandler('delay', function (_context, params) { return __awaiter(_this, void 0, void 0, function () {
            var duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        duration = (params === null || params === void 0 ? void 0 : params.duration) || 1000;
                        return [4 /*yield*/, index_1.ObservableUtils.delay(duration).toPromise()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { delayed: duration }];
                }
            });
        }); });
        // Transform data step
        this.registerStepHandler('transform', function (context, params) { return __awaiter(_this, void 0, void 0, function () {
            var data, transformed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = this.getContextValue(context, params === null || params === void 0 ? void 0 : params.input);
                        return [4 /*yield*/, this.applyTransformation(data, params === null || params === void 0 ? void 0 : params.transformation)];
                    case 1:
                        transformed = _a.sent();
                        return [2 /*return*/, { output: transformed }];
                }
            });
        }); });
        // Parallel execution step using async utilities
        this.registerStepHandler('parallel', function (context, params) { return __awaiter(_this, void 0, void 0, function () {
            var tasks, concurrencyLimit, limit, limitedTasks, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tasks = (params === null || params === void 0 ? void 0 : params.tasks) || [];
                        concurrencyLimit = (params === null || params === void 0 ? void 0 : params.concurrency) || 5;
                        limit = (0, p_limit_1.default)(concurrencyLimit);
                        limitedTasks = tasks.map(function (task) {
                            return limit(function () { return _this.executeStep(task, context); });
                        });
                        return [4 /*yield*/, Promise.all(limitedTasks)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, { results: results }];
                }
            });
        }); });
        // Loop step using async utilities
        this.registerStepHandler('loop', function (context, params) { return __awaiter(_this, void 0, void 0, function () {
            var items, concurrencyLimit, step, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        items = this.getContextValue(context, params === null || params === void 0 ? void 0 : params.items);
                        concurrencyLimit = (params === null || params === void 0 ? void 0 : params.concurrency) || 1;
                        step = params === null || params === void 0 ? void 0 : params.step;
                        if (!Array.isArray(items)) {
                            throw new Error('Loop items must be an array');
                            ';
                        }
                        return [4 /*yield*/, async.mapLimit(items, concurrencyLimit, function (item) { return __awaiter(_this, void 0, void 0, function () {
                                var loopContext;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            loopContext = __assign(__assign({}, context), { loopItem: item });
                                            return [4 /*yield*/, this.executeStep(step, loopContext)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, { results: results }];
                }
            });
        }); });
        // Conditional step
        this.registerStepHandler('condition', function (context, params) { return __awaiter(_this, void 0, void 0, function () {
            var condition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        condition = this.evaluateCondition(context, params === null || params === void 0 ? void 0 : params.condition);
                        if (!condition) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.executeStep(params === null || params === void 0 ? void 0 : params.thenStep, context)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!(params === null || params === void 0 ? void 0 : params.elseStep)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executeStep(params === null || params === void 0 ? void 0 : params.elseStep, context)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/, { skipped: true }];
                }
            });
        }); });
    };
    WorkflowEngine.prototype.registerStepHandler = function (type, handler) {
        this.stepHandlers.set(type, handler);
    };
    WorkflowEngine.prototype.executeStep = function (step, _context) {
        return __awaiter(this, void 0, void 0, function () {
            var handler;
            return __generator(this, function (_a) {
                handler = this.stepHandlers.get(step.type);
                if (!handler) {
                    throw new Error("No handler registered for step type: ".concat(step.type));
                    "\n    }\n\n    return await handler(context, step.params||{});\n  }\n\n  private evaluateCondition(\n    context: WorkflowContext,\n    expression: string\n  ): boolean {\n    try {\n      // Use expr-eval for safe expression evaluation (no arbitrary code execution)\n      const parser = new Parser();\n      const expr = parser.parse(expression);\n      return expr.evaluate(context as any);\n    } catch (error) {\n      logger.error(\n        "[WorkflowEngine_1];
                    Failed;
                    to;
                    evaluate;
                    condition: $expression(templateObject_1 || (templateObject_1 = __makeTemplateObject([","], [","])));
                    error;
                    ;
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    WorkflowEngine.prototype.getContextValue = function (context, path) {
        var parts = path.split('.');
        ';
        var value = context;
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            value = value === null || value === void 0 ? void 0 : value[part];
        }
        return value;
    };
    WorkflowEngine.prototype.applyTransformation = function (data, transformation) {
        return __awaiter(this, void 0, void 0, function () {
            var validator, isValidInput, transformationObj, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validator = new index_1.SchemaValidator();
                        return [4 /*yield*/, validator.validateAsync(data, index_1.WorkflowContextSchema)];
                    case 1:
                        isValidInput = _a.sent();
                        if (!isValidInput) {
                            logger.warn('Invalid data provided to transformation', validator.getErrors());
                            ';
                        }
                        if (typeof transformation === 'function') {
                            ';
                            return [2 /*return*/, transformation(data)];
                        }
                        if (!(typeof transformation === 'object')) return [3 /*break*/, 3];
                        ';
                        transformationObj = (transformation || {});
                        return [4 /*yield*/, index_1.ImmutableOps.deepTransform(transformationObj, data)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, index_1.ObjectProcessor.mapValues(result, function (value) {
                                if (typeof value === 'string' && value.startsWith('$.')) {
                                    ';
                                    return _this.getContextValue({ data: data }, value.substring(2));
                                }
                                else {
                                    return value;
                                }
                            })];
                    case 3: return [2 /*return*/, data];
                }
            });
        });
    };
    WorkflowEngine.prototype.loadPersistedWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var kvStore, workflowKeys, _i, workflowKeys_2, key, workflowData, kvStore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 9, 10]);
                        return [4 /*yield*/, this.kvStore];
                    case 1:
                        kvStore = _a.sent();
                        return [4 /*yield*/, kvStore.keys('workflow:*')];
                    case 2:
                        workflowKeys = _a.sent();
                        ';
                        _i = 0, workflowKeys_2 = workflowKeys;
                        _a.label = 3;
                    case 3:
                        if (!(_i < workflowKeys_2.length)) return [3 /*break*/, 6];
                        key = workflowKeys_2[_i];
                        return [4 /*yield*/, kvStore.get(key)];
                    case 4:
                        workflowData = _a.sent();
                        if (workflowData &&
                            (workflowData.status === 'running' || workflowData.status === 'paused'))
                            ';
                        this.activeWorkflows.set(workflowData.id, workflowData);
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        logger.info("[WorkflowEngine] Loaded ".concat(workflowKeys.length, " persisted workflows from storage")(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      );\n    } catch (error) {\n      logger.error(\n        '[WorkflowEngine] Failed to load persisted workflows from storage:',\n        error\n      );\n    }\n  }\n\n  private async saveWorkflow(workflow: WorkflowState): Promise<void> {\n    if (!this.config.persistWorkflows) return;\n\n    try {\n      // Use foundation storage with structured key\n      const storageKey = "], ["\n      );\n    } catch (error) {\n      logger.error(\n        '[WorkflowEngine] Failed to load persisted workflows from storage:',\n        error\n      );\n    }\n  }\n\n  private async saveWorkflow(workflow: WorkflowState): Promise<void> {\n    if (!this.config.persistWorkflows) return;\n\n    try {\n      // Use foundation storage with structured key\n      const storageKey = "]))), workflow, $, { workflow: workflow, : .id }(templateObject_3 || (templateObject_3 = __makeTemplateObject([";"], [";"]))));
                        return [4 /*yield*/, this.kvStore];
                    case 7:
                        kvStore = _a.sent();
                        return [4 /*yield*/, kvStore.set(storageKey, workflow)];
                    case 8:
                        _a.sent();
                        logger.debug("[WorkflowEngine] Saved workflow $workflow.idto storage");
                        "\n    } catch (_error) {\n      logger.error(\n        "[WorkflowEngine_1];
                        Failed;
                        to;
                        save;
                        workflow;
                        $;
                        {
                            workflow.id;
                        }
                        to;
                        storage: ",";
                        error;
                        ;
                        return [3 /*break*/, 10];
                    case 9: return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    WorkflowEngine.prototype.registerWorkflowDefinition = function (name, definition) {
        return __awaiter(this, void 0, void 0, function () {
            var validator, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Enhanced with schema validation for safety
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1); })];
                    case 1:
                        // Enhanced with schema validation for safety
                        _a.sent();
                        validator = new index_1.SchemaValidator();
                        isValid = validator.validate(definition, WorkflowDefinitionSchema);
                        if (!isValid) {
                            logger.warn("Workflow definition validation failed for ".concat(name), validator.getErrors());
                            "\n    }\n    \n    logger.debug(";
                            Registering;
                            workflow;
                            definition: $name(templateObject_4 || (templateObject_4 = __makeTemplateObject([");"], [");"])));
                            this.workflowDefinitions.set(name, definition);
                        }
                        async;
                        createWorkflow(definition, WorkflowDefinition);
                        Promise < string > {
                            const: workflowId = index_1.SecureIdGenerator.generateWorkflowId(),
                            // Register the workflow definition with a unique name
                            const: _workflowName = "".concat(definition.name, "-").concat(workflowId)
                        }(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n    await this.registerWorkflowDefinition(workflowName, definition);\n\n    return workflowId;\n  }\n\n  async startWorkflow(\n    workflowDefinitionOrName: string|WorkflowDefinition,\n    context: WorkflowContext = {}\n  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {\n    await this.initialize();\n\n    let definition: WorkflowDefinition;\n\n    if (typeof workflowDefinitionOrName ==='string') {'\n      const foundDefinition = this.workflowDefinitions.get(\n        workflowDefinitionOrName\n      );\n      if (!foundDefinition) {\n        throw new Error(\n          "], ["\n    await this.registerWorkflowDefinition(workflowName, definition);\n\n    return workflowId;\n  }\n\n  async startWorkflow(\n    workflowDefinitionOrName: string|WorkflowDefinition,\n    context: WorkflowContext = {}\n  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {\n    await this.initialize();\n\n    let definition: WorkflowDefinition;\n\n    if (typeof workflowDefinitionOrName ==='string') {'\n      const foundDefinition = this.workflowDefinitions.get(\n        workflowDefinitionOrName\n      );\n      if (!foundDefinition) {\n        throw new Error(\n          "])));
                        Workflow;
                        definition;
                        '${workflowDefinitionOrName}';
                        not;
                        found(templateObject_6 || (templateObject_6 = __makeTemplateObject([""], [""])));
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    var WorkflowEngine_1;
    WorkflowEngine = WorkflowEngine_1 = __decorate([
        (0, foundation_1.injectable)(),
        (0, foundation_1.singleton)()
    ], WorkflowEngine);
    return WorkflowEngine;
}(foundation_1.TypedEventBase));
exports.WorkflowEngine = WorkflowEngine;
{
    definition = workflowDefinitionOrName;
}
// Check concurrent workflow limit
var activeCount = index_1.ArrayProcessor.filter(Array.from(this.activeWorkflows.values()), function (w) { return w.status === 'running'; }, ').length;
if (activeCount >= this.config.maxConcurrentWorkflows) {
    throw new Error("Maximum concurrent workflows (".concat(this.config.maxConcurrentWorkflows, ") reached")(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n      );\n    }\n\n    const workflowId = SecureIdGenerator.generateWorkflowId();\n    const workflow: WorkflowState = {\n      id: workflowId,\n      definition,\n      status: 'pending',\n      context,\n      currentStep: 0,\n      steps: definition.steps,\n      stepResults: {},\n      completedSteps: [],\n      startTime: DateFormatter.formatISOString(),\n    };\n\n    this.activeWorkflows.set(workflowId, workflow);\n\n    // Create XState machine for robust state management\n    const stateMachine = this.createWorkflowStateMachine(workflowId);\n    this.workflowStateMachines.set(workflowId, stateMachine);\n\n    // Start execution asynchronously\n    this.executeWorkflow(workflow).catch((error) => {\n      logger.error("], ["\n      );\n    }\n\n    const workflowId = SecureIdGenerator.generateWorkflowId();\n    const workflow: WorkflowState = {\n      id: workflowId,\n      definition,\n      status: 'pending',\n      context,\n      currentStep: 0,\n      steps: definition.steps,\n      stepResults: {},\n      completedSteps: [],\n      startTime: DateFormatter.formatISOString(),\n    };\n\n    this.activeWorkflows.set(workflowId, workflow);\n\n    // Create XState machine for robust state management\n    const stateMachine = this.createWorkflowStateMachine(workflowId);\n    this.workflowStateMachines.set(workflowId, stateMachine);\n\n    // Start execution asynchronously\n    this.executeWorkflow(workflow).catch((error) => {\n      logger.error("])))[WorkflowEngine], Workflow, $, { workflowId: workflowId }, failed, ", error);", stateMachine.send({ type: 'FAIL' }));
    ';
}
;
this.emit('workflow-started', workflowId);
';
stateMachine.send({ type: 'START' });
';
return { success: true, workflowId: workflowId };
async;
executeWorkflow(workflow, WorkflowState);
Promise < void  > {
    try: {
        workflow: workflow,
        : .status = 'running',
        await: await,
        this: .saveWorkflow(workflow),
        for: function (let, i, i, , workflow) {
            if (i === void 0) { i = workflow.currentStep; }
        },
        : .steps.length,
        i: i
    }++
};
{
    if (workflow.status !== 'running') {
        ';
        break; // Workflow was paused or cancelled
    }
    var step = workflow.steps[i];
    workflow.currentStep = i;
    if (step) {
        await this.executeWorkflowStep(workflow, step, i);
    }
}
if (workflow.status === 'running') {
    ';
    workflow.status = 'completed';
    workflow.endTime = index_1.DateFormatter.formatISOString();
    this.emit('workflow-completed', workflow.id);
    ';
}
try { }
catch (error) {
    workflow.status = 'failed';
    workflow.error = error.message;
    workflow.endTime = index_1.DateFormatter.formatISOString();
    this.emit('workflow-failed', workflow.id, error);
    ';
}
finally {
    await this.saveWorkflow(workflow);
}
async;
executeWorkflowStep(workflow, WorkflowState, step, WorkflowStep, stepIndex, number);
Promise < void  > {
    const: stepId = "step-$stepIndex"
}(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n    let retries = 0;\n    const maxRetries = step.retries !== undefined ? step.retries : 0;\n\n    while (retries <= maxRetries) {\n      try {\n        this.emit('step-started', workflow.id, stepId);'\n\n        // Set up timeout\n        const timeout = step.timeout||this.config.stepTimeout;\n        const timeoutPromise = new Promise((_resolve, reject) => {\n          setTimeout(() => reject(new Error('Step timeout')), timeout);'\n        });\n\n        // Execute step\n        const stepPromise = this.executeStep(step, workflow.context);\n        const result = await Promise.race([stepPromise, timeoutPromise]);\n\n        // Store result in context if specified\n        if (step.output) {\n          workflow.context[step.output] = result;\n        }\n\n        // Store in step results\n        workflow.stepResults[stepId] = result;\n\n        workflow.completedSteps.push({\n          index: stepIndex,\n          step,\n          result,\n          duration: 0, // Would calculate actual duration\n          timestamp: DateFormatter.formatISOString(),\n        });\n\n        this.emit('step-completed', workflow.id, stepId, result);'\n        break;\n      } catch (error) {\n        retries++;\n\n        logger.warn(\n          "], ["\n    let retries = 0;\n    const maxRetries = step.retries !== undefined ? step.retries : 0;\n\n    while (retries <= maxRetries) {\n      try {\n        this.emit('step-started', workflow.id, stepId);'\n\n        // Set up timeout\n        const timeout = step.timeout||this.config.stepTimeout;\n        const timeoutPromise = new Promise((_resolve, reject) => {\n          setTimeout(() => reject(new Error('Step timeout')), timeout);'\n        });\n\n        // Execute step\n        const stepPromise = this.executeStep(step, workflow.context);\n        const result = await Promise.race([stepPromise, timeoutPromise]);\n\n        // Store result in context if specified\n        if (step.output) {\n          workflow.context[step.output] = result;\n        }\n\n        // Store in step results\n        workflow.stepResults[stepId] = result;\n\n        workflow.completedSteps.push({\n          index: stepIndex,\n          step,\n          result,\n          duration: 0, // Would calculate actual duration\n          timestamp: DateFormatter.formatISOString(),\n        });\n\n        this.emit('step-completed', workflow.id, stepId, result);'\n        break;\n      } catch (error) {\n        retries++;\n\n        logger.warn(\n          "])))[WorkflowEngine];
Step;
$;
{
    step.name;
}
failed(attempt, $, { retries: retries } / $, { maxRetries: maxRetries } + 1);
$;
{
    error.message;
}
"";
;
if (retries > maxRetries) {
    this.emit('step-failed', workflow.id, stepId, error);
    ';
    if (step.onError === 'continue') {
        ';
        workflow.stepResults[stepId] = { error: error.message };
        break;
    }
    if (step.onError === 'skip') {
        ';
        workflow.stepResults[stepId] = { skipped: true };
        break;
    }
    throw error;
}
// Wait before retry
await new Promise(function (resolve) {
    return AsyncUtils.createDelay(_this.config.retryDelay * retries).then(resolve);
});
async;
getWorkflowStatus(workflowId, string);
Promise < unknown > {
    // Enhanced with async validation and foundation event system
    this: .emit('workflow-status-requested', { workflowId: workflowId, timestamp: Date.now() }), ': 
    // Async workflow lookup with validation and timeout
    ,
    // Async workflow lookup with validation and timeout
    const: validatedWorkflow = await AsyncUtils.withTimeout(Promise.resolve(this.activeWorkflows.get(workflowId)), 1000),
    if: function (, validatedWorkflow) {
        throw new Error("Workflow ".concat(workflowId, " not found"));
        "\n    }\n    const workflow = validatedWorkflow;\n\n    const duration = workflow.endTime\n      ? DateCalculator.getDurationMs(\n          DateFormatter.parseISO(workflow.startTime)!,\n          DateFormatter.parseISO(workflow.endTime!)!\n        )\n      : DateCalculator.getDurationMs(\n          DateFormatter.parseISO(workflow.startTime)!\n        );\n\n    return {\n      id: workflow.id,\n      status: workflow.status,\n      currentStep: workflow.currentStep,\n      totalSteps: workflow.steps.length,\n      progress:\n        workflow.steps.length > 0\n          ? (workflow.currentStep / workflow.steps.length) * 100\n          : 0,\n      startTime: workflow.startTime,\n      endTime: workflow.endTime,\n      duration,\n      error: workflow.error,\n    };\n  }\n\n  async pauseWorkflow(\n    workflowId: string\n  ): Promise<success: boolean; error?: string > {\n    const workflow = this.activeWorkflows.get(workflowId);\n    if (workflow && workflow.status === 'running') {'\n      workflow.status = 'paused';\n      workflow.pausedAt = DateFormatter.formatISOString();\n      await this.saveWorkflow(workflow);\n      this.emit('workflow-paused', workflowId);'\n      return { success: true };\n    }\n    return { success: false, error: 'Workflow not found or not running' };'\n  }\n\n  async resumeWorkflow(\n    workflowId: string\n  ): Promise<success: boolean; error?: string > {\n    const workflow = this.activeWorkflows.get(workflowId);\n    if (workflow && workflow.status === 'paused') {'\n      workflow.status = 'running';\n      workflow.pausedAt = undefined;\n\n      // Resume execution\n      this.executeWorkflow(workflow).catch((_error) => {\n        logger.error(\n          "[WorkflowEngine];
        Workflow;
        $;
        {
            workflowId;
        }
        failed;
        after;
        resume: ",";
        error;
        ;
    },
    this: .emit('workflow-resumed', workflowId), ': ,
    return: { success: true }
};
return { success: false, error: 'Workflow not found or not paused' };
';
async;
cancelWorkflow(workflowId, string);
Promise < { success: boolean, error: string } > {
    const: workflow = this.activeWorkflows.get(workflowId),
    if: function (workflow) { }
} && ['running', 'paused'].includes(workflow.status);
{
    ';
    workflow.status = 'cancelled';
    workflow.endTime = index_1.DateFormatter.formatISOString();
    await this.saveWorkflow(workflow);
    this.emit('workflow-cancelled', workflowId);
    ';
    return { success: true };
}
return { success: false, error: 'Workflow not found or not active' };
';
async;
getActiveWorkflows();
Promise < any[] > {
    // Enhanced with ValidatedWorkflowStep processing and async filtering
    const: workflows = await Promise.all(Array.from(this.activeWorkflows.values()).map(function (w) { return __awaiter(void 0, void 0, void 0, function () {
        var validatedSteps;
        return __generator(this, function (_a) {
            validatedSteps = w.steps.map(function (step) {
                var validator = new index_1.SchemaValidator();
                var isValid = validator.validate(step, WorkflowStepSchema);
                return isValid ? step : step;
            });
            return [2 /*return*/, __assign(__assign({}, w), { validatedSteps: validatedSteps })];
        });
    }); })),
    const: active = workflows
        .filter(function (w) { return ['running', 'paused'].includes(w.status); }), ': 
        .map(function (w) {
        var _a;
        return ({
            id: w.id,
            name: (_a = w.definition) === null || _a === void 0 ? void 0 : _a.name,
            status: w.status,
            currentStep: w.currentStep,
            totalSteps: w.steps.length,
            progress: w.steps.length > 0 ? (w.currentStep / w.steps.length) * 100 : 0,
            startTime: w.startTime,
            pausedAt: w.pausedAt,
        });
    }),
    return: active
};
async;
getWorkflowHistory(limit, number = 100);
Promise < WorkflowState[] > {
    : .config.persistWorkflows
};
{
    return Array.from(this.activeWorkflows.values()).slice(-limit);
}
try {
    // Use foundation storage to get workflow history
    var kvStore = await this.kvStore;
    var workflowKeys = await kvStore.keys('workflow:*');
    ';
    // Load workflows and sort by start time
    var workflows = [];
    for (var _i = 0, workflowKeys_1 = workflowKeys; _i < workflowKeys_1.length; _i++) {
        var key = workflowKeys_1[_i];
        var workflow = await kvStore.get(key);
        if (workflow) {
            workflows.push(workflow);
        }
    }
    // Sort by start time (newest first) and limit
    var sortedWorkflows = workflows
        .sort(function (a, b) {
        return index_1.DateFormatter.parseISO(b.startTime).getTime() -
            index_1.DateFormatter.parseISO(a.startTime).getTime();
    })
        .slice(0, limit);
    return sortedWorkflows;
}
catch (error) {
    logger.error('[WorkflowEngine] Failed to get workflow history from storage:', error);
    return [];
}
async;
getWorkflowMetrics();
Promise < unknown > {
    const: workflows = Array.from(this.activeWorkflows.values())(),
    const: metrics,
    any: any,
    workflows: workflows,
    : .forEach(function (w) {
        metrics[w.status] = (metrics[w.status] || 0) + 1;
    }),
    const: completed = workflows.filter(function (w) { return w.status === 'completed'; }), ': ,
    if: function (completed) { },
    : .length > 0
};
{
    var totalDuration = completed.reduce(function (sum, w) {
        return (sum +
            index_1.DateCalculator.getDurationMs(index_1.DateFormatter.parseISO(w.startTime), index_1.DateFormatter.parseISO(w.endTime)));
    }, 0);
    metrics.averageDuration = totalDuration / completed.length;
}
if (metrics.total > 0) {
    metrics.successRate = metrics.completed / metrics.total;
}
return metrics;
generateWorkflowVisualization(workflow, WorkflowState);
string | null;
{
    if (!this.config.enableVisualization)
        return null;
    // Generate an enhanced Mermaid diagram with proper styling
    var lines = ['graph TD'];
    ';
    // Add start and end nodes
    lines.push('    start([Start])');
    ';
    lines.push('    end_node([End])');
    ';
    workflow.steps.forEach(function (step, index) {
        var nodeId = "step".concat(index);
        "\n      const label = (step.name||step.type).replace(/[^a-zA-Z0-9s]/g,''); // Clean label for Mermaid'\n      const status =\n        index < workflow.currentStep\n          ? 'completed''\n          : index === workflow.currentStep\n            ? 'current''\n            : 'pending;\n\n      // Add different shapes based on step type\n      if (step.type === 'condition') {'\n        lines.push(";
        $nodeId$label(templateObject_9 || (templateObject_9 = __makeTemplateObject(["); // Diamond for conditionals"], ["); // Diamond for conditionals"])));
    });
    if (step.type === 'parallel') {
        ';
        lines.push("    $nodeId[[".concat(label, "]]")); // Double square for parallel`
    }
    else {
        lines.push("    ".concat(nodeId, "[").concat(label, "]")); // Rectangle for normal steps`
    }
    // Add styling based on status
    if (status === 'completed') {
        ';
        lines.push("    style $nodeIdfill:#90EE90,stroke:#006400,stroke-width:2px"(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n        );\n      } else if (status === 'current') {'\n        lines.push(\n          "], ["\n        );\n      } else if (status === 'current') {'\n        lines.push(\n          "]))), style, $nodeIdfill, , stroke, , stroke - width, 3, px(templateObject_11 || (templateObject_11 = __makeTemplateObject([""], [""]))));
    }
    else {
        lines.push("    style ".concat(nodeId, " fill:#F0F0F0,stroke:#888888,stroke-width:1px")(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n        );\n      }\n\n      // Connect steps\n      if (index === 0) {\n        lines.push("], ["\n        );\n      }\n\n      // Connect steps\n      if (index === 0) {\n        lines.push("]))), start-- > $, { nodeId: nodeId }(templateObject_13 || (templateObject_13 = __makeTemplateObject([");"], [");"]))));
    }
    lines.push("    step".concat(index - 1, " --> ").concat(nodeId));
    "\n      }\n\n      // Connect last step to end\n      if (index === workflow.steps.length - 1) {\n        lines.push(";
    $nodeId-- > end_node(templateObject_14 || (templateObject_14 = __makeTemplateObject([");"], [");"])));
}
;
// Add status indicator
var statusColor = workflow.status === 'completed';
'
    ? '#90EE90' : ;
';
workflow.status === 'failed';
'
    ? '#FFB6C1' : ;
';
workflow.status === 'running';
'
    ? '#FFD700' : ;
';
'#F0F0F0;;
lines.push("    style start fill:$statusColor");
"\n    lines.push(";
style;
end_node;
fill: $;
{
    statusColor;
}
");";
return lines.join('\n');
';
/**
 * Generate advanced Mermaid visualization with state transitions
 */
generateAdvancedVisualization(_workflow, WorkflowState);
string | null;
{
    if (!this.config.enableVisualization)
        return null;
    // Generate state diagram showing workflow states
    var lines = ['stateDiagram-v2'];
    ';
    lines.push('    [*] --> pending');
    ';
    lines.push('    pending --> running : start');
    ';
    lines.push('    running --> paused : pause');
    ';
    lines.push('    running --> completed : success');
    ';
    lines.push('    running --> failed : error');
    ';
    lines.push('    paused --> running : resume');
    ';
    lines.push('    paused --> cancelled : cancel');
    ';
    lines.push('    failed --> running : retry');
    ';
    lines.push('    failed --> cancelled : cancel');
    ';
    lines.push('    completed --> [*]');
    ';
    lines.push('    cancelled --> [*]');
    ';
    return lines.join('\n');
    ';
}
/**
 * Schedule a workflow to run at specified times using cron syntax
 */
scheduleWorkflow(cronExpression, string, workflowName, string, context, WorkflowContext = {}, scheduleId ?  : string);
string;
{
    var id = scheduleId || "schedule-$workflowName-$SecureIdGenerator.generate(8)";
    "\n\n    if (!cron.validate(cronExpression)) {\n      throw new Error(";
    Invalid;
    cron;
    expression: $;
    {
        cronExpression;
    }
    ");";
}
var task = cron.schedule(cronExpression, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            logger.info("[WorkflowEngine] Starting scheduled workflow: $workflowName"(templateObject_15 || (templateObject_15 = __makeTemplateObject(["\n        );\n        const result = await this.startWorkflow(workflowName, {\n          ...context,\n          scheduledRun: true,\n          scheduleId: id,\n          triggeredAt: DateFormatter.formatISOString(),\n        });\n\n        if (result.success) {\n          this.emit('scheduled-workflow-started',\n            workflowName,\n            result.workflowId\n          );\n        } else {\n          logger.error(\n            "], ["\n        );\n        const result = await this.startWorkflow(workflowName, {\n          ...context,\n          scheduledRun: true,\n          scheduleId: id,\n          triggeredAt: DateFormatter.formatISOString(),\n        });\n\n        if (result.success) {\n          this.emit('scheduled-workflow-started',\n            workflowName,\n            result.workflowId\n          );\n        } else {\n          logger.error(\n            "])))[WorkflowEngine], Failed, to, start, scheduled, workflow, $, { workflowName: workflowName }, $, { result: result, : .error }(templateObject_16 || (templateObject_16 = __makeTemplateObject([""], [""]))));
        }
        finally {
        }
        return [2 /*return*/];
    });
}); });
try { }
catch (error) {
    logger.error("[WorkflowEngine] Error in scheduled workflow ".concat(workflowName, ":"), "\n          error\n        );\n        this.emit('scheduled-workflow-error', workflowName, error);'\n      }\n    });\n\n    this.scheduledTasks.set(id, task);\n    logger.info(\n      "[WorkflowEngine], Scheduled, workflow, $, { workflowName: workflowName });
    with (cron)
        : $;
    {
        cronExpression;
    }
    "";
    ;
    return id;
}
/**
 * Start a scheduled task
 */
startSchedule(scheduleId, string);
boolean;
{
    var task_1 = this.scheduledTasks.get(scheduleId);
    if (task_1) {
        task_1.start();
        logger.info("[WorkflowEngine] Started schedule: ".concat(scheduleId));
        "\n      return true;\n    }\n    return false;\n  }\n\n  /**\n   * Stop a scheduled task\n   */\n  stopSchedule(scheduleId: string): boolean {\n    const task = this.scheduledTasks.get(scheduleId);\n    if (task) {\n      task.stop();\n      logger.info("[WorkflowEngine];
        Stopped;
        schedule: $scheduleId(templateObject_17 || (templateObject_17 = __makeTemplateObject([");"], [");"])));
        return true;
    }
    return false;
}
/**
 * Remove a scheduled task completely
 */
removeSchedule(scheduleId, string);
boolean;
{
    var task_2 = this.scheduledTasks.get(scheduleId);
    if (task_2) {
        task_2.destroy();
        this.scheduledTasks.delete(scheduleId);
        logger.info("[WorkflowEngine] Removed schedule: ".concat(scheduleId));
        "\n      return true;\n    }\n    return false;\n  }\n\n  /**\n   * Get all active schedules\n   */\n  getActiveSchedules(): Array<{ id: string; status: string }> {\n    return Array.from(this.scheduledTasks.entries()).map(([id, task]) => ({\n      id,\n      status: (task as any).running ? 'running' : 'stopped',\n    }));\n  }\n\n  async cleanup(): Promise<void> {\n    // Clean up scheduled tasks\n    for (const [id, task] of this.scheduledTasks) {\n      task.destroy();\n      logger.info("[WorkflowEngine];
        Destroyed;
        scheduled;
        task: $id(templateObject_18 || (templateObject_18 = __makeTemplateObject([");"], [");"])));
    }
    this.scheduledTasks.clear();
    // Clean up state machines
    for (var _a = 0, _b = this.workflowStateMachines; _a < _b.length; _a++) {
        var _c = _b[_a], id = _c[0], machine = _c[1];
        machine.stop();
        logger.info("[WorkflowEngine] Stopped state machine: ".concat(id));
        "\n    }\n    this.workflowStateMachines.clear();\n\n    // Clean up other resources\n    this.activeWorkflows.clear();\n    this.workflowDefinitions.clear();\n    this.stepHandlers.clear();\n    this.workflowMetrics.clear();\n    this.removeAllListeners();\n  }\n\n  // ====================================================================\n  // ENHANCED METHODS TO MATCH CORE WORKFLOW ENGINE NTERFACE\n  // ====================================================================\n\n  /**\n   * Register document workflows for automated processing.\n   */\n  async registerDocumentWorkflows(): Promise<void> {\n    // Document workflow definitions\n    const documentWorkflows = [\n      {\n        name: 'vision-to-prds',\n        description:\n          'Process vision document and generate product requirements documents',\n        version: '1.0.0',\n        steps: [\n          {\n            type: 'extract-product-requirements',\n            name: 'Extract product requirements from vision',\n            params: { outputKey: 'product_requirements' },\n          },\n          {\n            type: 'create-prd-document',\n            name: 'Create PRD document',\n            params: { templateKey: 'prd_template', outputKey: 'prd_document'},\n          },\n        ],\n      },\n    ];\n\n    // Register all document workflows\n    for (const workflow of documentWorkflows) {\n      await this.registerWorkflowDefinition(\n        workflow.name,\n        workflow as WorkflowDefinition\n      );\n      this.documentWorkflows.set(workflow.name, workflow as WorkflowDefinition);\n    }\n\n    logger.info(";
        Registered;
        $documentWorkflows.lengthdocument;
        workflows(templateObject_19 || (templateObject_19 = __makeTemplateObject([");"], [");"])));
    }
    /**
     * Process document event to trigger appropriate workflows.
     */
    async;
    processDocumentEvent(eventType, string, documentData, unknown);
    Promise;
    logger.info("Processing document event: ".concat(eventType));
    "\n\n    // Auto-trigger workflows based on document type\n    const documentType = (documentData as any)?.type||'unknown;\n    const triggerWorkflows: string[] = [];\n\n    switch (documentType) {\n      case 'vision':'\n        triggerWorkflows.push('vision-to-prds');'\n        break;\n      case 'prd':'\n        triggerWorkflows.push('prds-to-epics');'\n        break;\n      default:\n        logger.debug(\n          ";
    No;
    automatic;
    workflow;
    for (document; type; )
        : $documentType(templateObject_20 || (templateObject_20 = __makeTemplateObject([""], [""])));
    ;
    return;
    // Execute triggered workflows
    for (var _d = 0, triggerWorkflows_1 = triggerWorkflows; _d < triggerWorkflows_1.length; _d++) {
        var workflowName = triggerWorkflows_1[_d];
        try {
            var result = await this.startWorkflow(workflowName, {
                documentData: documentData,
                eventType: eventType,
                triggeredAt: index_1.DateFormatter.formatISOString(),
            });
            logger.info("Triggered workflow ".concat(workflowName, ": ").concat(result.success ? 'SUCCESS' : 'FAILED')(templateObject_21 || (templateObject_21 = __makeTemplateObject(["\n        );\n      } catch (error) {\n        logger.error("], ["\n        );\n      } catch (error) {\n        logger.error("]))), Failed, to, trigger, workflow, $, { workflowName: workflowName }, ", error);");
        }
        finally /**
         * Convert entity to document content.
         */ {
        }
    }
}
/**
 * Convert entity to document content.
 */
convertEntityToDocumentContent(entity, any);
DocumentContent;
{
    return {
        id: entity.id,
        type: entity.type,
        title: entity.title || "$entity.typeDocument",
    }(templateObject_22 || (templateObject_22 = __makeTemplateObject(["\n      content: entity.content || '',\n      metadata: \n        entityId: entity.id,\n        createdAt: entity.createdAt,\n        updatedAt: entity.updatedAt,\n        version: entity.version,\n        status: entity.status,,\n    };\n  }\n\n  /**\n   * Execute workflow step with enhanced error handling (public method).\n   */\n  async executeWorkflowStepPublic(\n    step: WorkflowStep,\n    context: WorkflowContext,\n    _workflowId: string\n  ): Promise<StepExecutionResult> {\n    const _startTime = new Date();\n\n    try {\n      const handler = this.stepHandlers.get(step.type);\n      if (!handler) {\n        throw new Error("], ["\n      content: entity.content || '',\n      metadata: \n        entityId: entity.id,\n        createdAt: entity.createdAt,\n        updatedAt: entity.updatedAt,\n        version: entity.version,\n        status: entity.status,,\n    };\n  }\n\n  /**\n   * Execute workflow step with enhanced error handling (public method).\n   */\n  async executeWorkflowStepPublic(\n    step: WorkflowStep,\n    context: WorkflowContext,\n    _workflowId: string\n  ): Promise<StepExecutionResult> {\n    const _startTime = new Date();\n\n    try {\n      const handler = this.stepHandlers.get(step.type);\n      if (!handler) {\n        throw new Error("])));
    No;
    handler;
    found;
    for (step; type; )
        : $;
    {
        step.type;
    }
    ");";
}
var output = await handler(context, step.params || {});
var duration = index_1.DateCalculator.getDurationMs(startTime);
return { success: true, output: output, duration: duration };
try { }
catch (error) {
    var duration_1 = index_1.DateCalculator.getDurationMs(startTime);
    return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: duration_1,
    };
}
/**
 * Get workflow data by ID.
 */
async;
getWorkflowData(workflowId, string);
Promise < WorkflowData | null > {
    const: workflow = this.activeWorkflows.get(workflowId),
    if: function (, workflow) {
        return null;
    },
    return: {
        id: workflow.id,
        name: workflow.definition.name,
        description: workflow.definition.description,
        version: workflow.definition.version,
        data: {
            status: workflow.status,
            context: workflow.context,
            currentStep: workflow.currentStep,
            stepResults: workflow.stepResults,
        },
    }
};
/**
 * Create workflow from data.
 */
async;
createWorkflowFromData(data, WorkflowData);
Promise < string > {
    const: definition,
    WorkflowDefinition: WorkflowDefinition,
    const: result = await this.startWorkflow(definition, data.data || {}),
    if: function () { }
}(result.success && result.workflowId);
{
    throw new Error("Failed to create workflow: $result.error");
    "\n    }\n\n    return result.workflowId;\n  }\n\n  /**\n   * Update workflow data.\n   */\n  async updateWorkflowData(\n    workflowId: string,\n    updates: Partial<WorkflowData>\n  ): Promise<void> {\n    const workflow = this.activeWorkflows.get(workflowId);\n    if (!workflow) {\n      throw new Error(";
    Workflow;
    $;
    {
        workflowId;
    }
    not;
    found(templateObject_23 || (templateObject_23 = __makeTemplateObject([");"], [");"])));
}
if (updates.data) {
    Object.assign(workflow.context, updates.data);
}
await this.saveWorkflow(workflow);
/**
 * Intelligent workflow analysis using LLM.
 * Analyzes workflow performance and suggests optimizations.
 */
async;
analyzeWorkflowIntelligently(workflowId, string);
Promise < {
    performance: {
        averageExecutionTime: number,
        successRate: number,
        bottlenecks: string[]
    },
    suggestions: string[],
    optimizations: string[]
} > {
    const: workflow = this.activeWorkflows.get(workflowId),
    if: function (, workflow) {
        var _a, _b;
        throw new Error("Workflow $workflowIdnot found");
        "\n    }\n\n    // Gather workflow performance data\n    const performanceData = {\n      executionHistory: workflow.steps.map((step) => ({\n        name: step.name||step.type,\n        avgDuration: 0, // Would be calculated from actual metrics\n        errorRate: 0,\n        retryCount: step.retries||0,\n      })),\n      totalExecutions: 1, // Would be tracked in real metrics\n      successfulExecutions: workflow.status ==='completed' ? 1 : 0,\n      currentStatus: workflow.status,\n    };\n\n    // Use LLM to analyze workflow performance\n    const llm = getGlobalLLM();\n    llm.setRole('analyst');'\n\n    const _analysisPrompt = ";
        Analyze;
        this;
        workflow;
        performance;
        data;
        and;
        provide;
        optimization;
        suggestions: "\n\nWorkflow: $workflow.definition.name\nDescription: $workflow.definition.description||'No description''\nSteps: $workflow.definition.steps.length\nCurrent Status: $workflow.status\n\nPerformance Data:\n$JSON.stringify(performanceData, null, 2)\n\nPlease provide:\n1. Performance analysis (bottlenecks, efficiency issues)\n2. Specific optimization suggestions\n3. Recommended improvements\n\nFormat as JSON with keys: performance, suggestions, optimizations";
        "\n\n    try {\n      // Note: temperature and maxTokens are accepted but may not be supported by Claude Code SDK\n      const analysis = await llm.complete(analysisPrompt, {\n        temperature: 0.3, // Accepted - may be ignored if not supported (lower temperature for more focused analysis)\n        maxTokens: 1500, // Accepted - may be ignored if not supported\n      });\n\n      // Parse LLM response\n      const parsedAnalysis = JSON.parse(analysis);\n\n      logger.info(";
        Intelligent;
        analysis;
        completed;
        for (workflow; $; { workflowId: workflowId }(templateObject_24 || (templateObject_24 = __makeTemplateObject([", {"], [", {"]))))
            suggestions: ((_a = parsedAnalysis.suggestions) === null || _a === void 0 ? void 0 : _a.length) || 0,
                optimizations;
        ((_b = parsedAnalysis.optimizations) === null || _b === void 0 ? void 0 : _b.length) || 0,
            operation;
        'intelligent_workflow_analysis',
        ;
    },
    return: parsedAnalysis
};
try { }
catch (error) {
}
logger.error('Failed to perform intelligent workflow analysis:', error);
';
if (error instanceof SyntaxError) {
    throw new Error('LLM response parsing failed - invalid JSON format returned', ');
}
throw new Error('Intelligent workflow analysis failed');
';
/**
 * Generate intelligent workflow documentation using LLM.
 */
async;
generateWorkflowDocumentation(workflowId, string);
Promise <
    overview;
string;
[stepName, string];
string;
usageGuide: string;
troubleshooting: string[];
 > {
    const: workflow = this.activeWorkflows.get(workflowId),
    if: function (, workflow) {
        throw new Error("Workflow ".concat(workflowId, " not found"));
        "\n    }\n\n    const llm = getGlobalLLM();\n    llm.setRole('architect'); // Use architect role for documentation'\n\n    const docPrompt = ";
        Generate;
        comprehensive;
        documentation;
        for (this; workflow; )
            : "\n\nWorkflow Name: $workflow.definition.name\nDescription: $workflow.definition.description||'No description provided''\n\nSteps:\n$workflow.definition.steps.map((step, index) => ";
        $;
        {
            index + 1;
        }
    },
    : .$
};
{
    step.name || step.type;
}
($);
{
    step.type;
}
").join('\n')'\n\nPlease generate:\n1. Overview - high-level explanation of what this workflow does\n2. Step descriptions - detailed explanation of each step\n3. Usage guide - how to use this workflow effectively\n4. Troubleshooting - common issues and solutions\n\nFormat as JSON with keys: overview, stepDescriptions, usageGuide, troubleshooting";
"\n\n    try {\n      // Note: temperature and maxTokens are accepted but may not be supported by Claude Code SDK\n      const documentation = await llm.complete(docPrompt, {\n        temperature: 0.4, // Accepted - may be ignored if not supported\n        maxTokens: 2000, // Accepted - may be ignored if not supported\n      });\n\n      const parsedDocs = JSON.parse(documentation);\n\n      logger.info(";
Documentation;
generated;
for (workflow; $; { workflowId: workflowId }(templateObject_25 || (templateObject_25 = __makeTemplateObject([");"], [");"]))))
    return parsedDocs;
try { }
catch (error) {
}
logger.error('Failed to generate workflow documentation:', error);
';
if (error instanceof SyntaxError) {
    throw new Error('LLM response parsing failed - invalid JSON format returned', ');
}
throw new Error('Workflow documentation generation failed');
';
/**
 * Suggest workflow optimizations based on patterns and best practices.
 */
async;
suggestWorkflowOptimizations(workflowDefinition, WorkflowDefinition);
Promise <
    structuralSuggestions;
string[];
performanceSuggestions: string[];
reliabilitySuggestions: string[];
maintainabilitySuggestions: string[];
 > {
    const: llm = (0, foundation_1.getGlobalLLM)(),
    llm: llm,
    : .setRole('architect'), ': ,
    const: _optimizationPrompt = "Analyze this workflow definition and suggest optimizations:",
    $JSON: $JSON,
    : .stringify(workflowDefinition, null, 2),
    Please: Please,
    analyze: analyze,
    for: 1.,
    Structural: Structural,
    2.: Performance,
    3.: Reliability,
    4.: Maintainability,
    Provide: Provide,
    specific: specific,
    actionable: actionable,
    suggestions: suggestions,
    for: each,
    category: category,
    : .
    ,
    Format: Format,
    as: as,
    JSON: JSON,
    with: keys,
    structuralSuggestions: structuralSuggestions,
    performanceSuggestions: performanceSuggestions,
    reliabilitySuggestions: reliabilitySuggestions,
    maintainabilitySuggestions: maintainabilitySuggestions
}(templateObject_26 || (templateObject_26 = __makeTemplateObject([";"], [";"])));
try {
    // Note: temperature and maxTokens are accepted but may not be supported by Claude Code SDK
    var suggestions = await llm.complete(optimizationPrompt, {
        temperature: 0.3, // Accepted - may be ignored if not supported
        maxTokens: 2000, // Accepted - may be ignored if not supported
    });
    var parsedSuggestions = JSON.parse(suggestions);
    logger.info('Workflow optimization suggestions generated', { ': workflowName, workflowDefinition: workflowDefinition, : .name,
        totalSuggestions: Object.values(parsedSuggestions).flat().length, });
    return parsedSuggestions;
}
catch (error) {
    logger.error('Failed to generate workflow optimization suggestions:', error);
    if (error instanceof SyntaxError) {
        throw new Error('LLM response parsing failed - invalid JSON format returned', ');
    }
    throw new Error('Workflow optimization analysis failed');
    ';
}
/**
 * Enhanced shutdown with cleanup.
 */
async;
shutdown();
Promise < void  > {
    logger: logger,
    : .info('Shutting down WorkflowEngine...'), ': ,
    const: activeWorkflowIds = Array.from(this.activeWorkflows.keys())(),
    for: function (, workflowId, of, activeWorkflowIds) {
        try {
            yield this.cancelWorkflow(workflowId);
        }
        catch (error) {
            logger.error("Error cancelling workflow $workflowId:", error);
            "\n      }\n    }\n\n    await this.cleanup();\n    this.isInitialized = false;\n  }\n}\n\nexport default WorkflowEngine;\n";
        }
    }
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26;
