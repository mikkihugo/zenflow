/**
 * @fileoverview Enterprise Package - Simple Delegation
 * 
 * Strategic facade that simply delegates to enterprise packages.
 */

// Try to delegate to real packages, fall back gracefully
export * from './safe-framework';
export * from './sparc';
// Note: teamwork functionality now handled by @claude-zen/intelligence facade
export * from './agui';
export * from './knowledge';
export * from './kanban';
export * from './multi-level-orchestration';
export * from './agent-manager';
export * from './coordination-core';

// Re-export types
export * from './types';

// Teamwork is handled by @claude-zen/intelligence - use that facade directly