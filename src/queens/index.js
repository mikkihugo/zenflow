// Base Queen class and types
export { BaseQueen } from './base-queen.js';

// Specialized Queen implementations
export { CodeQueen } from './code-queen.js';
export { DebugQueen } from './debug-queen.js';
export { ArchitectAdvisor } from './architect-advisor.js';

// Queen Coordinator
export { QueenCoordinator } from './queen-coordinator.js';

// Convenience factory function
import { QueenCoordinator } from './queen-coordinator.js';

export async function createQueenCoordinator(config) {
    const coordinator = new QueenCoordinator(config);
    await coordinator.start();
    return coordinator;
}