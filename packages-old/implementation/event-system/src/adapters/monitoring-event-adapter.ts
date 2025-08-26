/**
 * @file Monitoring Event Adapter - Refactored Export
 *
 * This file now exports the modular monitoring event adapter system.
 * The original 3043-line file has been broken down into smaller modules:
 *
 * - ./monitoring/types.ts - Type definitions and interfaces
 * - ./monitoring/helpers.ts - Helper functions and utilities
 * - ./monitoring/adapter.ts - Main adapter implementation
 * - ./monitoring/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular monitoring adapter system
export * from './monitoring';
export { default } from './monitoring';
