/**
 * @fileoverview Kanban Workflow Engine - Event-Driven Architecture
 *
 * Enterprise kanban workflow engine with pure event-driven coordination.
 * Provides complete kanban functionality via event orchestration for real workflows.
 */

/**
 * Default configuration for clean workflow kanban
 */
declare const DEFAULT_CONFIG: {
  enableIntelligentWIP: boolean;
  constructor(config: Record<string, unknown>): unknown;
};

/**
 * Kanban Engine Configuration
 */
export interface KanbanEngineConfig {
  enableIntelligentWIP: boolean;
  [key: string]: unknown;
}

/**
 * Kanban Engine Class
 */
export declare class KanbanEngine {
  constructor(_config: KanbanEngineConfig);
}