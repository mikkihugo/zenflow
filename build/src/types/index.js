/**
 * Types Module - Barrel Export.
 *
 * Central export point for all shared types across the system.
 */
// Type guards and utilities
export function isZenSwarm(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj['topology'] === 'string' &&
        Array.isArray(obj['agents']));
}
export function isSwarmAgent(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.type === 'string');
}
export function isSystemEvent(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj['source'] === 'string');
}
// Export additional type guards from utils for system-wide availability
export { isActivationFunction, isNeuralNetworkConfig, isNonEmptyString, isObjectArrayWithProps, isPositiveNumber, isValidNumber, } from '../utils/type-guards.ts';
export * from './client-types.ts';
export * from './conversation-types.ts';
export * from './events-types.ts';
export * from './knowledge-types.ts';
export * from './mcp-types.ts';
export * from './neural-types.ts';
export * from './protocol-types.ts';
export * from './services-types.ts';
export * from './singletons.ts';
export * from './workflow-types.ts';
