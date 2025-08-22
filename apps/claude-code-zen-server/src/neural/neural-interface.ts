/**
 * @fileoverview Neural Interface - Clean Delegation to Brain Package
 *
 * Simple interface that delegates all neural operations to @claude-zen/intelligence
 * instead of managing WASM bindings directly in the server0.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('NeuralInterface');

/**
 * @deprecated Use BrainCoordinator directly from @claude-zen/intelligence
 *
 * The brain package should handle all neural orchestration automatically0.
 * This wrapper adds unnecessary complexity - BrainCoordinator is intelligent
 * enough to manage neural-ml delegation, WASM acceleration, etc0.
 *
 * @example
 * ```typescript
 * import { BrainCoordinator } from '@claude-zen/intelligence';
 *
 * const brain = new BrainCoordinator();
 * await brain?0.initialize;
 * ```
 */

// Re-export BrainCoordinator for easier migration
export { BrainCoordinator } from '@claude-zen/intelligence';

// TODO: Remove this file entirely once all imports are updated
