/**
 * Index Module;
 * Converted from JavaScript to TypeScript;
 */

export { ArchitectAdvisor } from './architect-advisor.js';
// Base Queen class and types
export { BaseQueen } from './base-queen.js';
// Specialized Queen implementations
export { CodeQueen } from './code-queen.js';
export { DebugQueen } from './debug-queen.js';

// Queen Coordinator
export { QueenCoordinator } from './queen-coordinator.js';

// Convenience factory function
import { QueenCoordinator } from './queen-coordinator.js';

export async function createQueenCoordinator(config = new QueenCoordinator(config: unknown);
// await coordinator.start();
return coordinator;
}
