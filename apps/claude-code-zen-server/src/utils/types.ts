/**
 * @fileoverview Utility Types - Strategic Package Delegation
 *
 * **TYPES MOVED TO @claude-zen/foundation**
 *
 * All utility types have been moved to their appropriate foundation packages
 * for better organization, reusability, and consistency across the codebase.
 * This file serves as a compatibility layer during the migration period.
 *
 * **Migration Mapping:**
 * - Result<T, E> → @claude-zen/foundation/types/result
 * - Logger → @claude-zen/foundation/logging/logger
 * - Config → @claude-zen/foundation/config/types
 * - AsyncResult<T> → @claude-zen/foundation/types/async
 * - Optional<T> → @claude-zen/foundation/types/optional
 * - DeepPartial<T> → @claude-zen/foundation/types/utility
 * - Disposable → @claude-zen/foundation/lifecycle/disposable
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 * @deprecated Use direct imports from @claude-zen/foundation instead
 */

// Re-export types from foundation packages for compatibility
export type {
  Result,
  Logger,
  Config,
  AsyncResult,
  Optional,
  DeepPartial

} from '@claude-zen/foundation';

// Re-export metrics types
export type { MetricData } from '@claude-zen/foundation';

// Re-export event types
export type { EventData } from '@claude-zen/intelligence';

/**
 * Local interface for Disposable pattern.
 * This is defined locally as it's not available in the foundation package.
 */
export interface Disposable {
  dispose(): void | Promise<void>
}

/**
 * Utility type for making all properties nullable.
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null
};

/**
 * Utility type for making specific properties optional.
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for making specific properties required.
 */
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * DEPRECATION NOTICE:
 * This file should be removed once all imports are updated to use foundation packages directly.
 *
 * **Migration Path:**
 * ``'typescript
 * // Old: import { Result } from './utils/types';
 * // New: import { Result } from '@claude-zen/foundation';
 * ```
 *
 * **Timeline:**
 * - v2.1.0: Add deprecation warnings
 * - v2.2.0: Remove this file
 */

export default {
  // Re-export everything for default import compatibility
  Disposable,
  Nullable,
  MakeOptional,
  MakeRequired

};