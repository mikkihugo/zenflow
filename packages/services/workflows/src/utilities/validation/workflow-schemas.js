"use strict";
/**
 * @fileoverview Workflow Validation Schemas
 *
 * Professional workflow schemas using Zod library.
 * Focused on workflow-specific validation rules.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionResultSchema = exports.WorkflowContextSchema = exports.WorkflowDefinitionSchema = exports.WorkflowStepSchema = void 0;
var foundation_1 = require("@claude-zen/foundation");
/**
 * Workflow step validation schema
 */
exports.WorkflowStepSchema = foundation_1.z.object({
    type: foundation_1.z.string().min(1, 'Step type is required'),
    name: foundation_1.z.string().optional(),
    params: foundation_1.z.record(foundation_1.z.unknown()).optional(),
    retries: foundation_1.z.number().int().min(0).max(10).default(0),
    timeout: foundation_1.z.number().int().min(100).max(300000).optional(),
    output: foundation_1.z.string().optional(),
    onError: foundation_1.z.enum(['stop', 'continue', 'skip']).default('stop'),
});
/**
 * Workflow definition validation schema
 */
exports.WorkflowDefinitionSchema = foundation_1.z.object({
    name: foundation_1.z.string().min(1, 'Workflow name is required'),
    steps: foundation_1.z.array(exports.WorkflowStepSchema).min(1, 'At least one step is required'),
    description: foundation_1.z.string().optional(),
    version: foundation_1.z.string().optional(),
    tags: foundation_1.z.array(foundation_1.z.string()).optional(),
    timeout: foundation_1.z.number().int().min(1000).max(3600000).optional(),
    maxConcurrency: foundation_1.z.number().int().min(1).max(100).default(1),
});
/**
 * Workflow context validation schema
 */
exports.WorkflowContextSchema = foundation_1.z.record(foundation_1.z.unknown())();
/**
 * Workflow execution result schema
 */
exports.WorkflowExecutionResultSchema = foundation_1.z.object({
    workflowId: foundation_1.z.string(),
    success: foundation_1.z.boolean(),
    startTime: foundation_1.z.string(),
    endTime: foundation_1.z.string().optional(),
    duration: foundation_1.z.number().optional(),
    stepResults: foundation_1.z
        .array(foundation_1.z.object({
        stepName: foundation_1.z.string(),
        success: foundation_1.z.boolean(),
        output: foundation_1.z.unknown().optional(),
        error: foundation_1.z.string().optional(),
        duration: foundation_1.z.number().optional(),
    }))
        .optional(),
    context: exports.WorkflowContextSchema.optional(),
    metadata: foundation_1.z.record(foundation_1.z.unknown()).optional(),
});
