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
export { isActivationFunction, isNeuralNetworkConfig, isNonEmptyString, isObjectArrayWithProps, isPositiveNumber, isValidNumber, } from '../utils/type-guards';
export * from './client-types';
export * from './events-types';
export * from './knowledge-types';
export * from './neural-types';
export * from './protocol-types';
export * from './services-types';
export * from './singletons';
export * from './workflow-types';
export * from './logger';
//# sourceMappingURL=index.js.map