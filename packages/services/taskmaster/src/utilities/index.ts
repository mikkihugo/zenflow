/**
 * @fileoverview Utilities Index - Battle-Tested Immer Integration
 *
 * Professional utility module organization with valuable dependencies:
 * - immutable-utils.ts - Immer integration for safe state management
 * - validation.ts - Zod integration for runtime validation
 *
 * Only exports utilities that provide actual value in the kanban package.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// Validation utilities (Zod integration) - RUNTIME SAFETY FOR KANBAN
export {
  KanbanConfigSchema,
  TaskPrioritySchema,
  TaskStateSchema,
  ValidationUtils,
  WIPLimitsSchema,
  WorkflowTaskSchema,
} from '../utils/validation';
// Immutable state utilities (Immer integration) - CORE VALUE FOR KANBAN
export {
  ImmutableContextUtils,
  ImmutableMetricsUtils,
  ImmutableTaskUtils,
  ImmutableUtils,
  ImmutableWIPUtils,
} from './immutable-utils';
