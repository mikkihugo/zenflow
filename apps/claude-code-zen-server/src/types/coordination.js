/**
 * Coordination Types
 *
 * Types for swarm coordination, agents, tasks, and teamwork.
 * Consolidated from: swarm-types.ts, agent-types.ts, task-types.ts, queen-types.ts, swarm-results.ts
 */
// ============================================================================
// Type Guards
// ============================================================================
export function isZenSwarm(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.topology === 'string' &&
        Array.isArray(obj.agents));
}
export function isSwarmAgent(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.type === 'string');
}
export function isTask(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj.status === 'string');
}
export function isSwarmMessage(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.from === 'string' &&
        typeof obj.type === 'string');
}
