/**
 * DSPy Wrapper Type Definitions.
 *
 * ⚠️  CRITICAL DSPY TYPE SYSTEM - NEVER REMOVE ⚠️.
 *
 * This module is CENTRAL to the massive DSPy implementation (13+ files):
 * - Re-exports from dspy.ts: GenerationOptions, LMDriver, LMError
 * - Provides compatibility layer between Claude-Zen and dspy.ts v0.1.3 API
 * - Used by: dspy-wrapper.ts, dspy-integration-manager.ts, dspy-enhanced-tools.ts
 * - Supports: dspy-swarm-coordinator.ts, dspy-agent-integration.ts, dspy-enhanced-operations.ts
 * - And 7+ other DSPy system files.
 *
 * Static analysis misses usage because:
 * 1. Type-only imports and re-exports
 * 2. Complex DSPy wrapper architecture
 * 3. Compatibility layer pattern
 * 4. Integration with external dspy.ts package.
 *
 * Comprehensive TypeScript interfaces for the DSPy wrapper system.
 * These types ensure full compatibility between Claude-Zen's expected DSPy interface
 * and the actual dspy.ts v0.1.3 API through the wrapper layer.
 *
 * @usage CRITICAL - Core type definitions for entire DSPy system (13+ files)
 * @reExports dspy.ts package types for compatibility
 * @usedBy dspy-wrapper.ts, dspy-integration-manager.ts, dspy-enhanced-tools.ts, and 10+ other DSPy modules
 */
// ============================================================================
// RE-EXPORT ACTUAL DSPY.TS TYPES
// ============================================================================
/**
 * @file TypeScript type definitions.
 */
export { LMError } from 'dspy.ts';
// ============================================================================
// ERROR TYPES
// ============================================================================
/**
 * DSPy wrapper specific error types.
 *
 * @example
 */
export class DSPyWrapperError extends Error {
    code;
    cause;
    metadata;
    constructor(message, code, cause, metadata) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.metadata = metadata;
        this.name = 'DSPyWrapperError';
    }
}
// ============================================================================
// NOTE: All types are exported above with their definitions
// No need for duplicate export declarations
// ============================================================================
// Default export for convenience
export default {
    DSPyWrapperError,
    // All other types are available as named exports
};
