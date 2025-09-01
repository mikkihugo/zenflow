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
export declare const TaskStateSchema: z.ZodEnum<['backlog,']>;
/**
* Task creation input schema
*/
export declare const TaskCreationSchema: any;
/**
* Validate task creation input with comprehensive error reporting
*/
export declare function validateTaskCreation(
input: unknown
): ZodSafeParseResult<TaskCreationInput>;
/**
* Validate WIP limits with comprehensive error reporting
*/
export declare function validateWIPLimits(
input: unknown
): ZodSafeParseResult<z.infer<typeof WIPLimitsSchema>>;
/**
* Validate kanban configuration with comprehensive error reporting
*/
export declare function validateKanbanConfig(
input: unknown
): ZodSafeParseResult<z.infer<typeof KanbanConfigSchema>>;
//# sourceMappingURL=validation.d.ts.map
