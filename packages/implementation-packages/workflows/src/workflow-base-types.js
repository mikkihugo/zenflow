/**
 * @fileoverview Base Workflow Types - Foundation types without circular dependencies
 *
 * This file contains the core workflow types that are needed by multiple modules
 * without import.*from.* to avoid circular dependencies.
 *
 * These types are extracted from workflow-engine.ts to break the circular dependency:
 * workflow-gate-request.ts → domain-boundary-validator.ts → workflows/types.ts → workflows/workflow-engine.ts
 */
export {};
