/**
 * @file Monitoring Event Factory - Refactored Export
 *
 * This file now exports the modular monitoring event factory system.
 * The original 797-line file has been broken down into smaller modules:
 *
 * - ./monitoring-factory/types.ts - Type definitions and interfaces
 * - ./monitoring-factory/helpers.ts - Helper functions and utilities
 * - ./monitoring-factory/factory.ts - Main factory class
 * - ./monitoring-factory/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular monitoring factory system
export * from './monitoring-factory';
export { default } from './monitoring-factory';
