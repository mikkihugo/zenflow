export class DIError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'DIError';
    }
}
export class CircularDependencyError extends DIError {
    constructor(dependencyChain) {
        super(`Circular dependency detected: ${dependencyChain.join(' -> ')}`, 'CIRCULAR_DEPENDENCY');
        this.name = 'CircularDependencyError';
    }
}
export class ServiceNotFoundError extends DIError {
    constructor(token) {
        super(`No provider registered for token: ${token}`, 'SERVICE_NOT_FOUND');
        this.name = 'ServiceNotFoundError';
    }
}
//# sourceMappingURL=di-types.js.map