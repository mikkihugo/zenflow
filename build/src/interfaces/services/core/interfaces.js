/**
 * @file USL (Unified Service Layer) Core Interfaces.
 *
 * Provides unified abstractions for all service implementations across Claude-Zen:
 * - Data services, web services, coordination services, neural services
 * - Consistent initialization, lifecycle management, and monitoring patterns
 * - Factory pattern for service creation and management
 * - Health checks, performance monitoring, and configuration management
 * - Type-safe service registry and discovery system.
 */
/**
 * Service error types.
 *
 * @example
 */
export class ServiceError extends Error {
    code;
    serviceName;
    cause;
    constructor(message, code, serviceName, cause) {
        super(message);
        this.code = code;
        this.serviceName = serviceName;
        this.cause = cause;
        this.name = 'ServiceError';
    }
}
export class ServiceInitializationError extends ServiceError {
    constructor(serviceName, cause) {
        super(`Service initialization failed: ${serviceName}`, 'SERVICE_INIT_ERROR', serviceName, cause);
        this.name = 'ServiceInitializationError';
    }
}
export class ServiceConfigurationError extends ServiceError {
    constructor(serviceName, details, cause) {
        super(`Service configuration error: ${serviceName} - ${details}`, 'SERVICE_CONFIG_ERROR', serviceName, cause);
        this.name = 'ServiceConfigurationError';
    }
}
export class ServiceDependencyError extends ServiceError {
    constructor(serviceName, dependency, cause) {
        super(`Service dependency error: ${serviceName} -> ${dependency}`, 'SERVICE_DEPENDENCY_ERROR', serviceName, cause);
        this.name = 'ServiceDependencyError';
    }
}
export class ServiceOperationError extends ServiceError {
    constructor(serviceName, operation, cause) {
        super(`Service operation failed: ${serviceName}.${operation}`, 'SERVICE_OPERATION_ERROR', serviceName, cause);
        this.name = 'ServiceOperationError';
    }
}
export class ServiceTimeoutError extends ServiceError {
    constructor(serviceName, operation, timeout, cause) {
        super(`Service operation timeout: ${serviceName}.${operation} (${timeout}ms)`, 'SERVICE_TIMEOUT_ERROR', serviceName, cause);
        this.name = 'ServiceTimeoutError';
    }
}
