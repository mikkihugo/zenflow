/**
 * @file Workflow Event Factory - Refactored Export
 * 
 * This file now exports the modular workflow event factory system.
 * The original 778-line file has been broken down into smaller modules:
 * 
 * - ./workflow-factory/types.ts - Type definitions and interfaces
 * - ./workflow-factory/helpers.ts - Helper functions and utilities
 * - ./workflow-factory/factory.ts - Main factory class
 * - ./workflow-factory/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular workflow factory system
export * from './workflow-factory';
export { default } from './workflow-factory';