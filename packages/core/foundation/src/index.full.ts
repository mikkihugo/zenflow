/**
 * @fileoverview Foundation Package - Full Export Entry Point
 *
 * **🔧 COMPLETE FOUNDATION EXPORTS**
 *
 * This entry point exports ALL foundation utilities and types.
 * Use this for development or when you need comprehensive access
 * to all foundation functionality. For production, prefer specific imports.
 *
 * @example Full Import (Development/Testing)
 * ```typescript
 * // Import everything from foundation:
 * import * as Foundation from '@claude-zen/foundation/index.full';
 * ```
 *
 * @warning Large Bundle Size
 * This imports everything and may result in larger bundle sizes.
 * Use selective imports for production builds.
 */

// Re-export everything from the main index (this includes all utilities already)
export * from './index.js';