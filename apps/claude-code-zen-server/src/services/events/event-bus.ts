import { EventBus } from '@claude-zen/foundation';
import type {
  SystemStatusData,
  SwarmStatusData,
  TaskMetricsData,
} from '../web/data.handler';

export type CorrelatedPayload<T = unknown> = T & { correlationId?: string };

// Strongly-typed event map for the server API request/response flow
export interface AppEvents {
  // Health/status
  'api:system:status:request': CorrelatedPayload<{}>;
  'api:system:status:response': CorrelatedPayload<SystemStatusData>;

  // Swarms
  'api:swarms:list:request': CorrelatedPayload<{}>;
  'api:swarms:list:response': CorrelatedPayload<{ swarms: SwarmStatusData[] }>;

  // Tasks (metrics + CRUD slice we expose)
  'api:tasks:metrics:request': CorrelatedPayload<{}>;
  'api:tasks:metrics:response': CorrelatedPayload<{ metrics: TaskMetricsData }>;
  'api:tasks:list:request': CorrelatedPayload<{}>;
  'api:tasks:list:response': CorrelatedPayload<{ tasks: unknown[] }>;
  'api:tasks:create:request': CorrelatedPayload<{ input: unknown }>;
  'api:tasks:create:response': CorrelatedPayload<{ task: unknown }>;

  // Documents
  'api:documents:list:request': CorrelatedPayload<{}>;
  'api:documents:list:response': CorrelatedPayload<{ documents: unknown[] }>;

  // Execute generic command
  'api:execute:request': CorrelatedPayload<{ input: unknown }>;
  'api:execute:response': CorrelatedPayload<{ result: unknown }>;

  // Settings
  'api:settings:get:request': CorrelatedPayload<{}>;
  'api:settings:get:response': CorrelatedPayload<{ settings: unknown }>;
  'api:settings:update:request': CorrelatedPayload<{ input: unknown }>;
  'api:settings:update:response': CorrelatedPayload<{ settings: unknown }>;

  // Logs
  'api:logs:list:request': CorrelatedPayload<{ limit?: number; offset?: number }>;
  'api:logs:list:response': CorrelatedPayload<{ logs: unknown[] }>;

  // Brain intelligence events
  'api:brain:analyze:request': CorrelatedPayload<{ task: string; context?: Record<string, unknown> }>;
  'api:brain:analyze:response': CorrelatedPayload<{ analysis: { taskId: string; taskType: string; complexity: number; suggestedTools?: string[] } }>;
  'api:brain:optimize:request': CorrelatedPayload<{ task: string; basePrompt: string; context?: Record<string, unknown>; priority?: string }>;
  'api:brain:optimize:response': CorrelatedPayload<{ optimization: { strategy: string; prompt: string; confidence: number; reasoning: string } }>;
  'api:brain:complexity:request': CorrelatedPayload<{ taskId: string; task: string; context?: Record<string, unknown> }>;
  'api:brain:complexity:response': CorrelatedPayload<{ complexity: { taskId: string; estimate: any; timestamp: number } }>;
  'api:brain:status:request': CorrelatedPayload<{}>;
  'api:brain:status:response': CorrelatedPayload<{ status: { initialized: boolean; sessionId?: string; metrics: any } }>;

  // Error channel
  'api:error': CorrelatedPayload<{ scope: string; error: string }>;
}

export type AppEventBus = EventBus<AppEvents>;

export function getEventBus(): AppEventBus {
  // Use the foundation EventBus singleton (typed)
  return EventBus.getInstance<AppEvents>({ enableMiddleware: true, enableMetrics: true });
}