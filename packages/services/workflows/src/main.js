"use strict";
/**
 * @fileoverview Workflows Package - Professional Battle-Tested Architecture
 *
 * Advanced workflow engine with battle-tested npm dependencies for production reliability.
 *
 * **BATTLE-TESTED DEPENDENCIES INTEGRATED:**
 * - expr-eval: Safe expression evaluation (replaces dangerous new Function())
 * - async: Professional async utilities for step execution
 * - p-limit: Controlled concurrency for parallel operations
 * - eventemitter3: High-performance event system
 * - xstate: Robust state management for workflows
 * - mermaid: Professional workflow visualization
 * - node-cron: Production-ready scheduling
 * - foundation storage: Battle-tested persistence layer
 *
 * Key Features:
 * - Tree-shakable exports for optimal bundle size
 * - Professional naming conventions
 * - Security-first architecture (no arbitrary code execution)
 * - Foundation storage integration (leverages existing battle-tested infrastructure)
 * - Type-safe workflow orchestration
 *
 * @example Basic workflow engine usage
 * ```typescript`
 * import { WorkflowEngine } from '@claude-zen/workflows';
 *
 * const engine = new WorkflowEngine({
 *   persistWorkflows: true,
 *   enableVisualization: true
 * });
 *
 * await engine.initialize();
 * const result = await engine.startWorkflow(workflowDefinition);
 * ````
 *
 * @example Advanced scheduling and state management
 * ```typescript`
 * import { WorkflowEngine } from '@claude-zen/workflows';
 *
 * const engine = new WorkflowEngine();
 *
 * // Schedule workflow with cron
 * const scheduleId = engine.scheduleWorkflow('0 9 * * *', 'daily-report');'
 *
 * // Generate Mermaid visualization
 * const diagram = engine.generateWorkflowVisualization(workflow);
 * ````
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = exports.default = void 0;
exports.getWorkflowSystemAccess = getWorkflowSystemAccess;
exports.getWorkflowEngine = getWorkflowEngine;
exports.getWorkflowOrchestration = getWorkflowOrchestration;
exports.getWorkflowManagement = getWorkflowManagement;
exports.getWorkflowVisualization = getWorkflowVisualization;
// =============================================================================
// MAIN WORKFLOW ENGINE - Battle-tested with modern npm packages
// =============================================================================
var engine_1 = require("./engine");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return engine_1.WorkflowEngine; } });
Object.defineProperty(exports, "WorkflowEngine", { enumerable: true, get: function () { return engine_1.WorkflowEngine; } });
// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================
function getWorkflowSystemAccess(config) {
    return __awaiter(this, void 0, void 0, function () {
        var engine;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    engine = new WorkflowEngine(config);
                    return [4 /*yield*/, engine.initialize()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, {
                            createEngine: function (engineConfig) {
                                return new WorkflowEngine(engineConfig);
                            },
                            startWorkflow: function (definition, initialContext) { return engine.startWorkflow(definition, initialContext); },
                            pauseWorkflow: function (workflowId) { return engine.pauseWorkflow(workflowId); },
                            resumeWorkflow: function (workflowId) { return engine.resumeWorkflow(workflowId); },
                            stopWorkflow: function (workflowId) { return engine.stopWorkflow(workflowId); },
                            getWorkflowState: function (workflowId) {
                                return engine.getWorkflowState(workflowId);
                            },
                            scheduleWorkflow: function (cronExpression, workflowId) {
                                return engine.scheduleWorkflow(cronExpression, workflowId);
                            },
                            generateVisualization: function (workflow) {
                                return engine.generateWorkflowVisualization(workflow);
                            },
                            listActiveWorkflows: function () { return engine.listActiveWorkflows(); },
                            shutdown: function () { return engine.shutdown(); },
                        }];
            }
        });
    });
}
function getWorkflowEngine(config) {
    return __awaiter(this, void 0, void 0, function () {
        var engine;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    engine = new WorkflowEngine(config);
                    return [4 /*yield*/, engine.initialize()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, engine];
            }
        });
    });
}
function getWorkflowOrchestration(config) {
    return __awaiter(this, void 0, void 0, function () {
        var system;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkflowSystemAccess(config)];
                case 1:
                    system = _a.sent();
                    return [2 /*return*/, {
                            execute: function (definition, context) {
                                return system.startWorkflow(definition, context);
                            },
                            schedule: function (cronExpression, workflowId) {
                                return system.scheduleWorkflow(cronExpression, workflowId);
                            },
                            visualize: function (workflow) {
                                return system.generateVisualization(workflow);
                            },
                            manage: function (workflowId) { return ({
                                pause: function () { return system.pauseWorkflow(workflowId); },
                                resume: function () { return system.resumeWorkflow(workflowId); },
                                stop: function () { return system.stopWorkflow(workflowId); },
                                getState: function () { return system.getWorkflowState(workflowId); },
                            }); },
                        }];
            }
        });
    });
}
function getWorkflowManagement(config) {
    return __awaiter(this, void 0, void 0, function () {
        var system;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkflowSystemAccess(config)];
                case 1:
                    system = _a.sent();
                    return [2 /*return*/, {
                            listActive: function () { return system.listActiveWorkflows(); },
                            getState: function (workflowId) { return system.getWorkflowState(workflowId); },
                            control: function (workflowId) { return ({
                                pause: function () { return system.pauseWorkflow(workflowId); },
                                resume: function () { return system.resumeWorkflow(workflowId); },
                                stop: function () { return system.stopWorkflow(workflowId); },
                            }); },
                            schedule: function (cronExpression, workflowId) {
                                return system.scheduleWorkflow(cronExpression, workflowId);
                            },
                        }];
            }
        });
    });
}
function getWorkflowVisualization(config) {
    return __awaiter(this, void 0, void 0, function () {
        var system, workflowSystem, WORKFLOWS_INFO;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkflowSystemAccess(config)];
                case 1:
                    system = _a.sent();
                    return [2 /*return*/, {
                            generate: function (workflow) {
                                return system.generateVisualization(workflow);
                            },
                            createDiagram: function (workflow) {
                                return system.generateVisualization(workflow);
                            },
                            export: function (workflow, format, ) {
                                if (format === void 0) { format = 'mermaid'; }
                                // Enhanced format validation and logging
                                var supportedFormats = ['mermaid', 'svg'];
                                ';
                                if (!supportedFormats.includes(format)) {
                                    logger.warn("Unsupported workflow export format: ".concat(format, ", defaulting to mermaid"));
                                    "\n        format = 'mermaid';\n      }\n      logger.debug(";
                                    Exporting;
                                    workflow;
                                    $workflow.idin;
                                    $formatformat(templateObject_1 || (templateObject_1 = __makeTemplateObject([");"], [");"])));
                                    return system.generateVisualization(workflow);
                                }
                            }
                        }
                        // Professional workflow system object with proper naming (matches brainSystem pattern)
                    ];
            }
        });
    });
}
var templateObject_1;
