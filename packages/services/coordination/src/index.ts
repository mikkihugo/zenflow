/**
 * @fileoverview Coordination Package - Workflow Orchestration and LLM Coordination
 * 
 * Provides coordination services for SPARC, teamwork, and LLM workflows.
 * This package orchestrates complex multi-agent and multi-step processes.
 */

// Note: DSPy moved to @claude-zen/dspy package
// This package focuses on workflow orchestration

// Core coordination
export * from './core/coordination-orchestrator';
export * from './core/coordination-event-module';

// Event types
export * from './types/events';

// SAFe framework
export * from './safe/index';

// TaskMaster system
export * from './taskmaster/index';

// Teamwork coordination
export * from './teamwork/index';
