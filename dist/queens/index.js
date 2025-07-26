// Base Queen class and types
export { BaseQueen, type Task, type Result, type Consensus, type QueenMetrics } from './base-queen.js';

// Specialized Queen implementations
export { CodeQueen } from './code-queen.js';
export { DebugQueen } from './debug-queen.js';

// Queen Coordinator
export { QueenCoordinator, type QueenCoordinatorConfig, type TaskQueue, type CoordinatorMetrics } from './queen-coordinator.js';

// Convenience factory function
import { QueenCoordinator } from './queen-coordinator.js';

export async function createQueenCoordinator(config?: import('./queen-coordinator.js').QueenCoordinatorConfig): Promise<QueenCoordinator> {
    const coordinator = new QueenCoordinator(config);
    await coordinator.start();
    return coordinator;
}