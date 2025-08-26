/**
 * @file Interface Event Factory - Refactored Export
 * 
 * This file now exports the modular interface event factory system.
 * The original 900+ line file has been broken down into smaller modules:
 * 
 * - ./interface-factory/types.ts - Type definitions and interfaces
 * - ./interface-factory/helpers.ts - Helper functions and utilities
 * - ./interface-factory/factory.ts - Main factory class
 * - ./interface-factory/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular interface factory system
export * from './interface-factory';
export { default } from './interface-factory';