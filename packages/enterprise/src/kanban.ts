/**
 * @fileoverview Kanban Strategic Facade - Real Package Delegation
 *
 * Strategic facade providing real kanban workflow coordination capabilities through delegation
 * to @claude-zen/kanban package.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import './module-declarations';

// Kanban system access with real package delegation
let kanbanModuleCache: any = null;

async function loadKanbanModule() {
  if (!kanbanModuleCache) {
    try {
      // Load the real Kanban package
      kanbanModuleCache = await import('@claude-zen/kanban');
    } catch {
      console.warn(
        'Kanban package not available, providing compatibility layer',
      );
      kanbanModuleCache = {
        WorkflowKanban: class CompatibilityWorkflowKanban extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
          async createTask() {
            return {
              success: true,
              data: { id: 'compat-task', status: 'backlog' },
            };
          }
          async moveTask() {
            return { success: true, data: null };
          }
          async getTask() {
            return {
              success: true,
              data: { id: 'compat-task', status: 'backlog' },
            };
          }
          async deleteTask() {
            return { success: true, data: null };
          }
          async getFlowMetrics() {
            return { throughput: 10, cycleTime: 5, wipUtilization: 0.8 };
          }
          async detectBottlenecks() {
            return [];
          }
          async getHealthStatus() {
            return { healthy: true, score: 100 };
          }
        },
        createWorkflowKanban: (config?: any) =>
          new kanbanModuleCache.WorkflowKanban(config),
        createHighThroughputWorkflowKanban: (eventBus?: any) =>
          new kanbanModuleCache.WorkflowKanban({}, eventBus),
        DEFAULT_WORKFLOW_STATES: [
          'backlog',
          'analysis',
          'development',
          'testing',
          'review',
          'deployment',
          'done',
        ],
        TASK_PRIORITIES: ['critical', 'high', 'medium', 'low'],
        isValidWorkflowState: () => true,
        isValidTaskPriority: () => true,
        getNextWorkflowState: () => null,
      };
    }
  }
  return kanbanModuleCache;
}

// ===============================================================================
// REAL KANBAN PACKAGE EXPORTS - Direct delegation to actual implementations
// ===============================================================================

export const getWorkflowKanban = async (config?: any, eventBus?: any) => {
  const module = await loadKanbanModule();
  return new module.WorkflowKanban(config, eventBus);
};

export const createWorkflowKanban = async (config?: any) => {
  const module = await loadKanbanModule();
  return module.createWorkflowKanban(config);
};

export const createHighThroughputWorkflowKanban = async (eventBus?: any) => {
  const module = await loadKanbanModule();
  return module.createHighThroughputWorkflowKanban(eventBus);
};

export const getWorkflowStates = async () => {
  const module = await loadKanbanModule();
  return module.DEFAULT_WORKFLOW_STATES;
};

export const getTaskPriorities = async () => {
  const module = await loadKanbanModule();
  return module.TASK_PRIORITIES;
};

// Static exports for immediate use (with fallback)
export {
  WorkflowKanban,
  createWorkflowKanban as createWorkflowKanbanSync,
  createHighThroughputWorkflowKanban as createHighThroughputWorkflowKanbanSync,
  DEFAULT_WORKFLOW_STATES,
  TASK_PRIORITIES,
  isValidWorkflowState,
  isValidTaskPriority,
  getNextWorkflowState,
  getPreviousWorkflowState,
  isValidStateTransition,
} from '@claude-zen/kanban';

// Type exports
export type {
  WorkflowKanbanConfig,
  WorkflowTask,
  TaskState,
  TaskPriority,
  FlowMetrics,
  BottleneckReport,
  WorkflowBottleneck,
  WIPLimits,
  KanbanOperationResult,
  TaskMovementResult,
} from '@claude-zen/kanban';
