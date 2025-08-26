/**
 * @file System Event Adapter - Refactored Export
 *
 * This file now exports the modular system event adapter system.
 * The original 2026-line file has been broken down into smaller modules:
 *
 * - ./system/types.ts - Type definitions and interfaces
 * - ./system/helpers.ts - Helper functions and utilities
 * - ./system/adapter.ts - Main adapter implementation
 * - ./system/index.ts - Main exports and convenience functions
 */

// Re-export everything from the modular system adapter system
export * from './system';
export { default } from './system';
