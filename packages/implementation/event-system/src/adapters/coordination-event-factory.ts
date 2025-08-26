/**
 * @file Coordination Event Factory - Refactored Export
 * 
 * This file now exports the modular coordination event factory system.
 * The original 900+ line file has been broken down into smaller modules:
 * 
 * - ./coordination-factory/types.ts - Type definitions and interfaces
 * - ./coordination-factory/helpers.ts - Helper functions and utilities
 * - ./coordination-factory/factory.ts - Main factory class
 * - ./coordination-factory/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular coordination factory system
export * from './coordination-factory';
export { default } from './coordination-factory';