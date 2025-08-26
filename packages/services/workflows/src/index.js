"use strict";
/**
 * @fileoverview Workflows Package - Professional Battle-Tested Architecture
 *
 * Advanced workflow engine with comprehensive battle-tested npm dependencies for production reliability.
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
 * - **lodash-es: Data manipulation utilities (40M+ weekly downloads)**
 * - **date-fns: Date calculations and formatting (15M+ weekly downloads)**
 * - **nanoid: Secure ID generation (10M+ weekly downloads)**
 * - **zod: Schema validation (10M+ weekly downloads)**
 * - **rxjs: Reactive programming (15M+ weekly downloads)**
 * - **immer: Immutable updates (10M+ weekly downloads)**
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOWS_INFO = exports.WorkflowStepSchema = exports.WorkflowExecutionResultSchema = exports.WorkflowDefinitionSchema = exports.WorkflowContextSchema = exports.SecureIdGenerator = exports.SchemaValidator = exports.ObservableUtils = exports.ObjectProcessor = exports.ImmutableOps = exports.DateFormatter = exports.DateCalculator = exports.AsyncUtils = exports.ArrayProcessor = exports.WorkflowEngine = exports.default = void 0;
// =============================================================================
// MAIN WORKFLOW ENGINE - Battle-tested with modern npm packages
// =============================================================================
var main_1 = require("./main");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return main_1.WorkflowEngine; } });
Object.defineProperty(exports, "WorkflowEngine", { enumerable: true, get: function () { return main_1.WorkflowEngine; } });
// =============================================================================
// PROFESSIONAL UTILITIES - Library Integrations
// =============================================================================
var index_1 = require("./utilities/index");
// Collection utilities
Object.defineProperty(exports, "ArrayProcessor", { enumerable: true, get: function () { return index_1.ArrayProcessor; } });
Object.defineProperty(exports, "AsyncUtils", { enumerable: true, get: function () { return index_1.AsyncUtils; } });
Object.defineProperty(exports, "DateCalculator", { enumerable: true, get: function () { return index_1.DateCalculator; } });
// Date utilities
Object.defineProperty(exports, "DateFormatter", { enumerable: true, get: function () { return index_1.DateFormatter; } });
// State management utilities
Object.defineProperty(exports, "ImmutableOps", { enumerable: true, get: function () { return index_1.ImmutableOps; } });
Object.defineProperty(exports, "ObjectProcessor", { enumerable: true, get: function () { return index_1.ObjectProcessor; } });
// Reactive utilities
Object.defineProperty(exports, "ObservableUtils", { enumerable: true, get: function () { return index_1.ObservableUtils; } });
// Validation utilities
Object.defineProperty(exports, "SchemaValidator", { enumerable: true, get: function () { return index_1.SchemaValidator; } });
// ID generation utilities
Object.defineProperty(exports, "SecureIdGenerator", { enumerable: true, get: function () { return index_1.SecureIdGenerator; } });
Object.defineProperty(exports, "WorkflowContextSchema", { enumerable: true, get: function () { return index_1.WorkflowContextSchema; } });
Object.defineProperty(exports, "WorkflowDefinitionSchema", { enumerable: true, get: function () { return index_1.WorkflowDefinitionSchema; } });
Object.defineProperty(exports, "WorkflowExecutionResultSchema", { enumerable: true, get: function () { return index_1.WorkflowExecutionResultSchema; } });
Object.defineProperty(exports, "WorkflowStepSchema", { enumerable: true, get: function () { return index_1.WorkflowStepSchema; } });
// =============================================================================
// METADATA - Package information with battle-tested features
// =============================================================================
exports.WORKFLOWS_INFO = {
    version: '1.0.0',
    name: '@claude-zen/workflows',
    description: 'Production-ready workflow engine with battle-tested npm dependencies',
    battleTestedDependencies: [
        'expr-eval: Safe expression evaluation',
        'async: Professional async utilities',
        'p-limit: Controlled concurrency',
        'eventemitter3: High-performance events',
        'xstate: Robust state management',
        'mermaid: Professional visualization',
        'node-cron: Production scheduling',
        'foundation: Battle-tested storage',
    ],
    capabilities: [
        'Secure workflow orchestration (no arbitrary code execution)',
        'Foundation storage integration',
        'XState-powered state management',
        'Professional async utilities',
        'Controlled concurrency with p-limit',
        'High-performance eventemitter3 events',
        'Mermaid workflow visualization',
        'Production cron scheduling',
        'Battle-tested persistence layer',
        'Professional data manipulation (lodash-es)',
        'Secure ID generation (nanoid)',
        'Advanced date/time handling (date-fns)',
        'Runtime validation (zod)',
        'Reactive programming (rxjs)',
        'Immutable state management (immer)',
    ],
    security: {
        safeExpressionEvaluation: true,
        noArbitraryCodeExecution: true,
        foundationStorageIntegration: true,
        productionReady: true,
    },
};
