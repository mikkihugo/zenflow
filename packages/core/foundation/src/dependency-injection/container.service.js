/**
 * @fileoverview Dependency Injection Container Service
 *
 * Professional DI container with event support, auto-discovery, and health monitoring.
 * Uses awilix-compatible patterns with comprehensive service lifecycle management.
 *
 * @example Basic Usage
 * ```typescript`
 * import { createContainer} from './container.service';
 *
 * const container = createContainer();
 *
 * // Register services
 * container.register('userService', UserService);
 * container.registerFunction('dbConnection', () => createDbConnection());
 * container.registerInstance('config', configInstance);
 *
 * // Resolve services
 * const userService = container.resolve<UserService>('userService');
 * ```
 */
/**
 * Creates a new dependency injection container with full service lifecycle management.
 * Provides registration, resolution, health monitoring, and service discovery.
 *
 * @returns A fully configured DI container instance
 *
 * @example
 * ```typescript`
 * const container = createContainer();
 *
 * // Register services
 * container.register('logger', Logger, { capabilities:[' logging'], tags:[' core']});
 *
 * // Start health monitoring
 * container.startHealthMonitoring(5000);
 *
 * // Listen to events
 * container.on('serviceRegistered', (event) => {
 *   console.log(`Service ${event.name} registered`);
 *});
 * ```
 */
import { ContainerImpl } from "./container-impl.js";
export const createContainer = () => new ContainerImpl();
// Service tokens for common services
export const TOKENS = {
    logger: "logger",
    config: "config",
    database: "database",
};
// STRATEGIC FORCING EXPORTS - Guide developers to industry-standard patterns
// These remain because they teach correct patterns and prevent bad habits
// Keep 'inject' as it teaches the injection pattern concept
export const inject = createContainer;
// Export a default container instance for convenience
export const container = createContainer();
