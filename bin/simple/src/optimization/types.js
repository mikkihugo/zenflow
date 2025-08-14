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
//# sourceMappingURL=types.js.map