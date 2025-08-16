/**
 * @file @zen-ai/event-system - Main Export File
 * 
 * Type-safe event system with domain validation, unified event layer (UEL), 
 * and advanced coordination capabilities.
 * 
 * Features:
 * - Type-safe event system with runtime validation
 * - Domain boundary validation integration  
 * - UEL (Unified Event Layer) with multiple adapters
 * - Event factories, registries, and managers
 * - Comprehensive validation framework
 * - Migration helpers and compatibility layers
 * - Health monitoring and metrics
 * - Cross-domain event coordination
 * 
 * @author Zen AI Team
 * @version 1.0.0
 * @license MIT
 */

// Core event system exports
export * from './core/type-safe-event-system';
export * from './core/event-bus';

// UEL (Unified Event Layer) exports - Main interface
export * from './index';

// Core interfaces and types
export * from './core/interfaces';
export * from './types';

// Event adapters
export * from './adapters/index';

// Event factories and registry
export * from './factories/index';
export * from './registry';

// Event manager
export * from './manager';

// Validation framework
export * from './validation/index';

// Compatibility and migration helpers
export * from './compatibility/index';

// System integrations
export * from './system-integrations/index';

// Observer system (legacy compatibility)
export * from './observer-system';

// UEL singleton and core
export * from './core/uel-singleton';

// Default export - UEL singleton for convenience
export { uel as default } from './core/uel-singleton';