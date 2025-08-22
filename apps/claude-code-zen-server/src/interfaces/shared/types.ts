/**
 * @fileoverview Shared Types - REMOVED - Delegated to Foundation
 *
 * **TYPES MOVED TO @claude-zen/foundation**
 *
 * All shared interface types have been moved to their appropriate foundation packages:
 * - ComponentStatus → @claude-zen/monitoring/health/component-status
 * - WebServerConfig → @claude-zen/foundation/web/server-config
 * - SessionConfig → @claude-zen/foundation/web/session-config
 * - WebConfig → @claude-zen/foundation/web/web-config
 *
 * **FILE MARKED FOR REMOVAL - All types delegated to specialized packages**
 */

// Re-export types from foundation packages
export type { PerformanceMetrics } from '@claude-zen/foundation';

export type {
  WebServerConfig,
  SessionConfig,
  WebConfig,
} from '@claude-zen/foundation';

/**
 * DEPRECATION NOTICE:
 * This file should be removed once all imports are updated to use foundation packages directly.
 *
 * **Migration Path:**
 * ```typescript
 * // Old: import { WebConfig } from './interfaces/shared/types';
 * // New: import { WebConfig } from '@claude-zen/foundation';
 * ```
 */
