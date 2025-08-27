/**
 * @fileoverview Validation Utilities - Zod Integration for Kanban Domain
 *
 * Professional runtime validation using battle-tested Zod library.
 * Provides type-safe validation schemas for kanban workflow coordination.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { type ZodSafeParseResult, z } from '@claude-zen/foundation';
/**
 * Task state validation schema
 */
export declare const TaskStateSchema: z.ZodEnum<["backlog", "analysis", "development", "testing", "review", "deployment", "done", "blocked", "expedite"]>;
/**
 * Task priority validation schema
 */
export declare const TaskPrioritySchema: z.ZodEnum<["critical", "high", "medium", "low"]>;
/**
 * Task creation input schema
 */
export declare const TaskCreationSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
    estimatedEffort: z.ZodNumber;
    assignedAgent: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    priority?: "critical" | "high" | "medium" | "low";
    description?: string;
    tags?: string[];
    title?: string;
    estimatedEffort?: number;
    assignedAgent?: string;
    dependencies?: string[];
}, {
    priority?: "critical" | "high" | "medium" | "low";
    description?: string;
    tags?: string[];
    title?: string;
    estimatedEffort?: number;
    assignedAgent?: string;
    dependencies?: string[];
}>;
/**
 * Complete workflow task schema
 */
export declare const WorkflowTaskSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    state: z.ZodEnum<["backlog", "analysis", "development", "testing", "review", "deployment", "done", "blocked", "expedite"]>;
    priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
    assignedAgent: z.ZodOptional<z.ZodString>;
    estimatedEffort: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
    blockedAt: z.ZodOptional<z.ZodDate>;
    blockingReason: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodArray<z.ZodString, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    priority?: "critical" | "high" | "medium" | "low";
    metadata?: Record<string, unknown>;
    description?: string;
    tags?: string[];
    title?: string;
    estimatedEffort?: number;
    assignedAgent?: string;
    dependencies?: string[];
    state?: "backlog" | "analysis" | "development" | "testing" | "review" | "done" | "deployment" | "blocked" | "expedite";
    createdAt?: Date;
    updatedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    blockedAt?: Date;
    blockingReason?: string;
}, {
    id?: string;
    priority?: "critical" | "high" | "medium" | "low";
    metadata?: Record<string, unknown>;
    description?: string;
    tags?: string[];
    title?: string;
    estimatedEffort?: number;
    assignedAgent?: string;
    dependencies?: string[];
    state?: "backlog" | "analysis" | "development" | "testing" | "review" | "done" | "deployment" | "blocked" | "expedite";
    createdAt?: Date;
    updatedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    blockedAt?: Date;
    blockingReason?: string;
}>;
/**
 * WIP limits validation schema
 */
export declare const WIPLimitsSchema: z.ZodObject<{
    backlog: z.ZodNumber;
    analysis: z.ZodNumber;
    development: z.ZodNumber;
    testing: z.ZodNumber;
    review: z.ZodNumber;
    deployment: z.ZodNumber;
    done: z.ZodNumber;
    blocked: z.ZodNumber;
    expedite: z.ZodNumber;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    backlog?: number;
    analysis?: number;
    development?: number;
    testing?: number;
    review?: number;
    done?: number;
    deployment?: number;
    blocked?: number;
    expedite?: number;
    total?: number;
}, {
    backlog?: number;
    analysis?: number;
    development?: number;
    testing?: number;
    review?: number;
    done?: number;
    deployment?: number;
    blocked?: number;
    expedite?: number;
    total?: number;
}>;
/**
 * Kanban configuration schema
 */
export declare const KanbanConfigSchema: z.ZodObject<{
    enableIntelligentWIP: z.ZodDefault<z.ZodBoolean>;
    enableBottleneckDetection: z.ZodDefault<z.ZodBoolean>;
    enableFlowOptimization: z.ZodDefault<z.ZodBoolean>;
    enableRealTimeMonitoring: z.ZodDefault<z.ZodBoolean>;
    wipCalculationInterval: z.ZodDefault<z.ZodNumber>;
    bottleneckDetectionInterval: z.ZodDefault<z.ZodNumber>;
    optimizationAnalysisInterval: z.ZodDefault<z.ZodNumber>;
    maxConcurrentTasks: z.ZodDefault<z.ZodNumber>;
    defaultWIPLimits: z.ZodObject<{
        backlog: z.ZodNumber;
        analysis: z.ZodNumber;
        development: z.ZodNumber;
        testing: z.ZodNumber;
        review: z.ZodNumber;
        deployment: z.ZodNumber;
        done: z.ZodNumber;
        blocked: z.ZodNumber;
        expedite: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        backlog?: number;
        analysis?: number;
        development?: number;
        testing?: number;
        review?: number;
        done?: number;
        deployment?: number;
        blocked?: number;
        expedite?: number;
        total?: number;
    }, {
        backlog?: number;
        analysis?: number;
        development?: number;
        testing?: number;
        review?: number;
        done?: number;
        deployment?: number;
        blocked?: number;
        expedite?: number;
        total?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    enableIntelligentWIP?: boolean;
    enableBottleneckDetection?: boolean;
    enableFlowOptimization?: boolean;
    enableRealTimeMonitoring?: boolean;
    wipCalculationInterval?: number;
    bottleneckDetectionInterval?: number;
    optimizationAnalysisInterval?: number;
    maxConcurrentTasks?: number;
    defaultWIPLimits?: {
        backlog?: number;
        analysis?: number;
        development?: number;
        testing?: number;
        review?: number;
        done?: number;
        deployment?: number;
        blocked?: number;
        expedite?: number;
        total?: number;
    };
}, {
    enableIntelligentWIP?: boolean;
    enableBottleneckDetection?: boolean;
    enableFlowOptimization?: boolean;
    enableRealTimeMonitoring?: boolean;
    wipCalculationInterval?: number;
    bottleneckDetectionInterval?: number;
    optimizationAnalysisInterval?: number;
    maxConcurrentTasks?: number;
    defaultWIPLimits?: {
        backlog?: number;
        analysis?: number;
        development?: number;
        testing?: number;
        review?: number;
        done?: number;
        deployment?: number;
        blocked?: number;
        expedite?: number;
        total?: number;
    };
}>;
export type TaskCreationInput = z.infer<typeof TaskCreationSchema>;
/**
 * Validation utilities class using Zod schemas
 */
export declare class ValidationUtils {
    /**
     * Validate task creation input
     */
    static validateTaskCreation(input: unknown): ZodSafeParseResult<TaskCreationInput>;
    /**
     * Validate workflow task
     */
    static validateWorkflowTask(input: unknown): ZodSafeParseResult<z.infer<typeof WorkflowTaskSchema>>;
    /**
     * Validate WIP limits
     */
    static validateWIPLimits(input: unknown): ZodSafeParseResult<z.infer<typeof WIPLimitsSchema>>;
    /**
     * Validate kanban configuration
     */
    static validateKanbanConfig(input: unknown): ZodSafeParseResult<z.infer<typeof KanbanConfigSchema>>;
    /**
     * Validate task state transition
     */
    static validateStateTransition(fromState: string, toState: string): boolean;
}
/**
 * Validate task creation input with comprehensive error reporting
 */
export declare function validateTaskCreation(input: unknown): ZodSafeParseResult<TaskCreationInput>;
/**
 * Validate WIP limits with comprehensive error reporting
 */
export declare function validateWIPLimits(input: unknown): ZodSafeParseResult<z.infer<typeof WIPLimitsSchema>>;
/**
 * Validate kanban configuration with comprehensive error reporting
 */
export declare function validateKanbanConfig(input: unknown): ZodSafeParseResult<z.infer<typeof KanbanConfigSchema>>;
//# sourceMappingURL=validation.d.ts.map