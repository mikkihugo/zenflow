/**
 * @fileoverview Operations Package - Simple Delegation
 * 
 * Strategic facade that simply delegates to operations packages.
 */

// Try to delegate to real packages, fall back gracefully
export * from './agent-monitoring';
export * from './chaos-engineering';
export * from './monitoring';
export * from './memory';
export * from './llm-routing';

// LLM provider and routing now properly handled by llm-routing.ts

// Re-export types
export * from './types';