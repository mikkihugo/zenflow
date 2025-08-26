/**
 * @file Neural Event Factory - Refactored Export
 *
 * This file now exports the modular neural event factory system.
 * The original 629-line file has been broken down into smaller modules:
 *
 * - ./neural-factory/types.ts - Type definitions and interfaces
 * - ./neural-factory/helpers.ts - Helper functions and utilities
 * - ./neural-factory/factory.ts - Main factory class
 * - ./neural-factory/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular neural factory system
export * from './neural-factory';
export { default } from './neural-factory';
