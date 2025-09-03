import { EventBus } from '@claude-zen/foundation';
import type {
  SystemStatusData,
  TaskMetricsData,
} from '../web/data.handler';

export type CorrelatedPayload<T = unknown> = T & { correlationId?: string };

// Strongly-typed event map for the server API request/response flow
export interface AppEvents {
  // TaskMaster system events (renamed from confusing api: prefix)
  'taskmaster:system:status:request': CorrelatedPayload<{}>;
  'taskmaster:system:status:response': CorrelatedPayload<SystemStatusData>;
  'taskmaster:system:metrics:request': CorrelatedPayload<{}>;
  'taskmaster:system:metrics:response': CorrelatedPayload<SystemMetricsData>;
  'taskmaster:system:health:request': CorrelatedPayload<{}>;
  'taskmaster:system:health:response': CorrelatedPayload<SystemHealthData>;
  
  // TaskMaster task management events
  'taskmaster:tasks:metrics:request': CorrelatedPayload<{}>;
  'taskmaster:tasks:metrics:response': CorrelatedPayload<{ metrics: TaskMetricsData }>;
  'taskmaster:tasks:list:request': CorrelatedPayload<{}>;
  'taskmaster:tasks:list:response': CorrelatedPayload<{ tasks: unknown[] }>;
  'taskmaster:tasks:create:request': CorrelatedPayload<{ input: unknown }>;
  'taskmaster:tasks:create:response': CorrelatedPayload<{ task: unknown }>;
  'taskmaster:tasks:update:request': CorrelatedPayload<{ id: string; updates: unknown }>;
  'taskmaster:tasks:update:response': CorrelatedPayload<{ task: unknown }>;
  'taskmaster:tasks:delete:request': CorrelatedPayload<{ id: string }>;
  'taskmaster:tasks:delete:response': CorrelatedPayload<{ success: boolean }>;
  
  // Legacy events (keep for backward compatibility)
  'orchestrator:started': { config: unknown };
  'orchestrator:stopped': {};
  'task:completed': { task: unknown; result: unknown };
  'task:failed': { task: unknown; error: unknown };
  'health:check': SystemHealthData;
}

export type AppEventBus = EventBus<AppEvents>;

export function getEventBus(): AppEventBus {
  // Use the foundation EventBus singleton (typed)
  return EventBus.getInstance<AppEvents>({ enableMiddleware: true, enableMetrics: true });
}