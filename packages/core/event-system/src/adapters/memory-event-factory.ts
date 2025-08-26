/**
 * @file Memory Event Factory - Refactored Export
 *
 * This file now exports the modular memory event factory system.
 * The original 965-line file has been broken down into smaller modules:
 *
 * - ./memory-factory/types.ts - Type definitions and interfaces
 * - ./memory-factory/helpers.ts - Helper functions and utilities
 * - ./memory-factory/factory.ts - Main factory class
 * - ./memory-factory/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular memory factory system
export * from './memory-factory';
export { default } from './memory-factory';
