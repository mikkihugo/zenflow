/**
 * @fileoverview Service Container Implementation Package
 *
 * Professional service container implementation leveraging the battle-tested Awilix
 * dependency injection framework. Provides production-ready service discovery,
 * lifecycle management, scoping, and health checking capabilities.
 *
 * This is an IMPLEMENTATION PACKAGE - contains actual business logic.
 * Strategic facades should delegate to this package.
 *
 * Key Features:
 * - Auto-discovery and registration of services
 * - Lifecycle management (singleton, scoped, transient)
 * - Service health checking and monitoring
 * - Capability-based service discovery
 * - Graceful degradation and fallback strategies
 * - Type-safe service resolution
 * - Integration with existing TSyringe-based DI
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// Re-export everything from service-container
export * from './service-container';
export type * from './service-container';

// Re-export everything from di-container
export * from './di-container';
export type * from './di-container';

// Re-export Awilix types for external use
export { Lifetime, InjectionMode } from 'awilix';
export type { AwilixContainer, BuildResolverOptions, ListModulesOptions } from 'awilix';