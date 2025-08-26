/**
 * @file Coordination Event Adapter - Refactored Export
 * 
 * This file now exports the modular coordination event adapter system.
 * The original 2700+ line file has been broken down into smaller modules:
 * 
 * - ./coordination/types.ts - Type definitions and interfaces
 * - ./coordination/helpers.ts - Helper functions and utilities  
 * - ./coordination/extractor.ts - Data extraction utilities
 * - ./coordination/adapter.ts - Main adapter class (work in progress)
 * - ./coordination/index.ts - Main exports and factory functions
 */

// Re-export everything from the modular coordination system
export * from './coordination';
export { default } from './coordination';