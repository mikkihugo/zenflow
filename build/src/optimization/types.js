/**
 * @fileoverview Optimization Domain Types - Single Source of Truth
 *
 * All optimization-related types for performance, neural, data, swarm, and WASM optimization.
 * Following Google TypeScript style guide and domain architecture standard.
 */
// Error types
export class OptimizationError extends Error {
    code;
    target;
    constructor(message, code, target) {
        super(message);
        this.code = code;
        this.target = target;
        this.name = 'OptimizationError';
    }
}
export class OptimizationConfigError extends OptimizationError {
    config;
    constructor(message, config) {
        super(message, 'OPTIMIZATION_CONFIG_ERROR');
        this.config = config;
        this.name = 'OptimizationConfigError';
    }
}
export class OptimizationTimeoutError extends OptimizationError {
    timeout;
    constructor(message, timeout) {
        super(message, 'OPTIMIZATION_TIMEOUT_ERROR');
        this.timeout = timeout;
        this.name = 'OptimizationTimeoutError';
    }
}
