/**
 * @fileoverview Foundation Package - Minimal Tree-Shakable Entry Point
 *
 * **🌳 TREE-SHAKING OPTIMIZED ENTRY POINT**
 *
 * This is the minimal entry point that imports only essential foundation utilities.
 * For better tree-shaking and smaller bundles, import from specific entry points:
 *
 * @example Tree-Shakable Imports (Recommended)
 * ```typescript
 * // Import only what you need for optimal bundle size:
 * import { getLogger } from '@claude-zen/foundation/core';
 * import { Result, ok, err } from '@claude-zen/foundation/resilience';
 * import { createContainer } from '@claude-zen/foundation/di';
 * import { _, nanoid } from '@claude-zen/foundation/utils';
 * ```
 *
 * @example Full Import (Not Recommended for Production)
 * ```typescript
 * // This imports everything (larger bundle):
 * import { getLogger, Result, createContainer } from '@claude-zen/foundation';
 * ```
 */

// =============================================================================
// ESSENTIAL CORE EXPORTS - Most commonly used utilities
// =============================================================================

// Core logging (essential for all apps)
export { getLogger } from './core/logging';
export type { Logger } from './core/logging';

// Core configuration (essential for all apps)
export { getConfig, isDevelopment, isProduction, isTest } from './core/config';
export type { Config } from './core/config';

// Core types (lightweight, commonly needed)
export type {
  UUID,
  JsonValue,
  JsonObject,
  UnknownRecord,
} from './types';

// Essential error handling (Result pattern)
export { Result, ok, err, safeAsync } from './error-handling';

// =============================================================================
// TREE-SHAKING GUIDANCE COMMENTS
// =============================================================================

/*
🌳 TREE-SHAKING OPTIMIZATION GUIDE:

For smaller bundles, import from specific entry points:

CORE UTILITIES (essential, lightweight):
  import { getLogger, getConfig } from '@claude-zen/foundation/core';

DEPENDENCY INJECTION (when you need DI):
  import { createContainer } from '@claude-zen/foundation/di';

RESILIENCE PATTERNS (error handling, circuit breakers):
  import { Result, ok, err, withRetry } from '@claude-zen/foundation/resilience';

UTILITIES (validation, dates, file ops):
  import { z, validateInput, _ } from '@claude-zen/foundation/utils';

TYPES ONLY (zero runtime cost):
  import type { UUID, Logger, Config } from '@claude-zen/foundation/types';

FULL FEATURE SETS (when you need comprehensive functionality):
  import * as Foundation from '@claude-zen/foundation/full';
*/

// =============================================================================
// OPTIONAL: Full import for backwards compatibility
// =============================================================================
// Uncomment the next line if you need full backward compatibility:
// export * from './index.full';