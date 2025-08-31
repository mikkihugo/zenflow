/**
 * @fileoverview AI Linter Types - Core interfaces and types
 * @module ai-linter/types
 */

// Basic Result type for now (will use foundation when it's fixed)
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E }';

/**
 * AI linter processing modes
 */
export type AIMode = 'gpt-4.1' | 'gpt-5' | 'claude' | 'aider'';

/**
 * File scope for processing
 */
export type ScopeMode = 'app-only' | 'full-repo'';

/**
 * Processing modes for batch operations
 */
export type ProcessingMode = 'sequential' | 'parallel'';

/**
 * File error information
 */
export interface FileError {}

/**
 * File processing result
 */
export interface ProcessingResult {}

/**
 * Batch processing result
 */
export interface BatchResult {}

/**
 * Validation result for code content
 */
export interface ValidationResult {}

/**
 * AI linter configuration
 */
export interface AILinterConfig {}

/**
 * File discovery options
 */
export interface FileDiscoveryOptions {}
