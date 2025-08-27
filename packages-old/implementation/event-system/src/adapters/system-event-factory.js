/**
 * @file System Event Factory - Refactored Export
 *
 * This file now exports the modular system event factory system.
 * The original 563-line file has been broken down into smaller modules:
 *
 * - ./system-factory/types.ts - Type definitions and interfaces
 * - ./system-factory/helpers.ts - Helper functions and utilities
 * - ./system-factory/factory.ts - Main factory class
 * - ./system-factory/index.ts - Main exports and convenience functions
 */
// Re-export everything from the modular system factory system
export * from './system-factory';
export { default } from './system-factory';
