/**
 * @fileoverview MOVED: Workflow Types - Now in Workflows Domain
 *
 * This file provides compatibility by re-exporting from the workflows domain.
 * All workflow types have been consolidated in /workflows/ for clean architecture.
 *
 * MIGRATION PATH:
 * - OLD: import {WorkflowStep} from '../types/workflow-types.ts';
 * - NEW: import {WorkflowStep} from '../workflows/types.ts';
 *
 * This compatibility layer will be removed in a future version.
 */
export {};
// Remove convenience exports to avoid conflicts
// All types are exported individually above
