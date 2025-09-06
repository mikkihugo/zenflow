import { EventBus } from '@claude-zen/foundation';
import type {
  SystemStatusData,
  SwarmStatusData,
  TaskMetricsData,
} from '../web/data.handler';

export type CorrelatedPayload<T = unknown> = T & { correlationId?: string };

// Strongly-typed event map for internal service communication
export interface AppEvents {
  // System health/status
  'system:status:request': CorrelatedPayload<{}>;
  'system:status:response': CorrelatedPayload<SystemStatusData>;

  // Swarm coordination
  'swarms:list:request': CorrelatedPayload<{}>;
  'swarms:list:response': CorrelatedPayload<{ swarms: SwarmStatusData[] }>;

  // TaskMaster service events
  'taskmaster:metrics:request': CorrelatedPayload<{}>;
  'taskmaster:metrics:response': CorrelatedPayload<{ metrics: TaskMetricsData }>;
  'taskmaster:list:request': CorrelatedPayload<{}>;
  'taskmaster:list:response': CorrelatedPayload<{ tasks: unknown[] }>;
  'taskmaster:create:request': CorrelatedPayload<{ input: unknown }>;
  'taskmaster:create:response': CorrelatedPayload<{ task: unknown }>;

  // Document service
  'documents:list:request': CorrelatedPayload<{}>;
  'documents:list:response': CorrelatedPayload<{ documents: unknown[] }>;

  // Command execution service
  'execution:request': CorrelatedPayload<{ input: unknown }>;
  'execution:response': CorrelatedPayload<{ result: unknown }>;

  // Configuration service
  'config:get:request': CorrelatedPayload<{}>;
  'config:get:response': CorrelatedPayload<{ settings: unknown }>;
  'config:update:request': CorrelatedPayload<{ input: unknown }>;
  'config:update:response': CorrelatedPayload<{ settings: unknown }>;

  // Logging service
  'logs:list:request': CorrelatedPayload<{ limit?: number; offset?: number }>;
  'logs:list:response': CorrelatedPayload<{ logs: unknown[] }>;

  // Brain intelligence service
  'brain:analyze:request': CorrelatedPayload<{ task: string; context?: Record<string, unknown> }>;
  'brain:analyze:response': CorrelatedPayload<{ analysis: { taskId: string; taskType: string; complexity: number; suggestedTools?: string[] } }>;
  'brain:optimize:request': CorrelatedPayload<{ task: string; basePrompt: string; context?: Record<string, unknown>; priority?: string }>;
  'brain:optimize:response': CorrelatedPayload<{ optimization: { strategy: string; prompt: string; confidence: number; reasoning: string } }>;
  'brain:complexity:request': CorrelatedPayload<{ taskId: string; task: string; context?: Record<string, unknown> }>;
  'brain:complexity:response': CorrelatedPayload<{ complexity: { taskId: string; estimate: any; timestamp: number } }>;
  'brain:status:request': CorrelatedPayload<{}>;
  'brain:status:response': CorrelatedPayload<{ status: { initialized: boolean; sessionId?: string; metrics: any } }>;

  // Service error channel
  'service:error': CorrelatedPayload<{ scope: string; error: string }>;
}

export type AppEventBus = EventBus<AppEvents>;

export function getEventBus(): AppEventBus {
  // Use the foundation EventBus singleton (typed)
  return EventBus.getInstance<AppEvents>({ enableMiddleware: true, enableMetrics: true });
}