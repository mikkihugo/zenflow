/**
 * @fileoverview Utility Types - REMOVED - Delegated to Foundation
 * 
 * **TYPES MOVED TO @claude-zen/foundation**
 * 
 * All utility types have been moved to their appropriate foundation packages:
 * - Result<T, E> → @claude-zen/foundation/types/result  
 * - Logger → @claude-zen/foundation/logging/logger
 * - Config → @claude-zen/foundation/config/types
 * - Metrics → @claude-zen/monitoring/metrics/types 
 * - EventData → @claude-zen/event-system/types
 * - AsyncResult<T> → @claude-zen/foundation/types/async
 * - Optional<T> → @claude-zen/foundation/types/optional
 * - DeepPartial<T> → @claude-zen/foundation/types/utility
 * - Disposable → @claude-zen/foundation/lifecycle/disposable
 * 
 * **FILE MARKED FOR REMOVAL - All types delegated to specialized packages**
 */

// Re-export types from foundation packages
export type {
  Result,
  Logger,
  Config,
  AsyncResult,
  Optional,
  DeepPartial,
  Disposable
} from '@claude-zen/foundation';

export type {
  Metrics
} from '@claude-zen/monitoring';

export type {
  EventData
} from '@claude-zen/event-system';

/**
 * DEPRECATION NOTICE:
 * This file should be removed once all imports are updated to use foundation packages directly.
 * 
 * **Migration Path:**
 * ```typescript
 * // Old: import { Result } from '../utils/types';
 * // New: import { Result } from '@claude-zen/foundation';
 * ```
 */