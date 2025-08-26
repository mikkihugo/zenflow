/**
 * @file Coordination Event Data Extractors
 *
 * Utility functions for extracting specific data from events,
 * such as swarm IDs, agent IDs, task IDs, etc.
 */

import type { SystemEvent } from '../../core/interfaces';
import type { CoordinationEvent } from '../../types';

/**
 * Data extraction utilities for coordination events.
 */
export class CoordinationEventExtractor {
  /**
   * Extract swarm ID from event.
   */
  static extractSwarmId(event: SystemEvent): string | undefined {
    // Check payload first, then metadata as fallback
    const swarmId =
      (event.payload && typeof event.payload === 'object'
        ? (event.payload as Record<string, unknown>).swarmId
        : undefined) ||
      (event.metadata && typeof event.metadata === 'object'
        ? (event.metadata as Record<string, unknown>).swarmId
        : undefined);

    return typeof swarmId === 'string' ? swarmId : undefined;
  }

  /**
   * Extract agent ID from event.
   */
  static extractAgentId(event: SystemEvent): string | undefined {
    const coordinationEvent = event as CoordinationEvent;
    const {targetId} = coordinationEvent;
    return (
      (coordinationEvent.payload &&
      typeof coordinationEvent.payload === 'object'
        ? ((coordinationEvent.payload as Record<string, unknown>)
            .agentId as string)
        : undefined) ||
      (event.metadata && typeof event.metadata === 'object'
        ? ((event.metadata as Record<string, unknown>).agentId as string)
        : undefined) ||
      (targetId && typeof targetId === 'string' && targetId.includes('agent')
        ? targetId
        : undefined)
    );
  }

  /**
   * Extract task ID from event.
   */
  static extractTaskId(event: SystemEvent): string | undefined {
    const coordinationEvent = event as CoordinationEvent;
    const {targetId} = coordinationEvent;
    return (
      (event.payload && typeof event.payload === 'object'
        ? ((event.payload as Record<string, unknown>).taskId as string)
        : undefined) ||
      (event.metadata && typeof event.metadata === 'object'
        ? ((event.metadata as Record<string, unknown>).taskId as string)
        : undefined) ||
      (targetId && typeof targetId === 'string' && targetId.includes('task')
        ? targetId
        : undefined)
    );
  }

  /**
   * Extract agent IDs (as array) from event.
   */
  static extractAgentIds(event: SystemEvent): string[] {
    const agentId = this.extractAgentId(event);
    return agentId ? [agentId] : [];
  }

  /**
   * Extract task IDs (as array) from event.
   */
  static extractTaskIds(event: SystemEvent): string[] {
    const taskId = this.extractTaskId(event);
    return taskId ? [taskId] : [];
  }

  /**
   * Extract component type from event source.
   */
  static extractComponentType(
    source: string
  ): 'swarm' | 'agent' | 'orchestrator' | 'protocol' {
    if (source.includes('swarm')) return 'swarm';
    if (source.includes('agent')) return 'agent';
    if (source.includes('orchestrator') || source.includes('task'))
      return 'orchestrator';
    return 'protocol';
  }

  /**
   * Extract correlation patterns from events.
   */
  static extractCorrelationPatterns(events: CoordinationEvent[]): string[] {
    const patterns: string[] = [];

    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];

      if (current.correlationId === next.correlationId) {
        patterns.push(`${current.type}->${next.type}`);
      }
    }

    return [...new Set(patterns)]; // Remove duplicates
  }

  /**
   * Extract resource usage from event metadata.
   */
  static extractResourceUsage(event: SystemEvent): {
    cpu: number;
    memory: number;
    network: number;
  } {
    const defaultUsage = { cpu: 0, memory: 0, network: 0 };

    if (!event.metadata || typeof event.metadata !== 'object') {
      return defaultUsage;
    }

    const metadata = event.metadata as Record<string, unknown>;
    const resourceUsage = metadata.resourceUsage as any;

    if (!resourceUsage || typeof resourceUsage !== 'object') {
      return defaultUsage;
    }

    return {
      cpu: typeof resourceUsage.cpu === 'number' ? resourceUsage.cpu : 0,
      memory:
        typeof resourceUsage.memory === 'number' ? resourceUsage.memory : 0,
      network:
        typeof resourceUsage.network === 'number' ? resourceUsage.network : 0,
    };
  }

  /**
   * Extract metrics from event payload.
   */
  static extractMetrics(event: SystemEvent): Record<string, number> {
    const metrics: Record<string, number> = {};

    if (!event.payload || typeof event.payload !== 'object') {
      return metrics;
    }

    const payload = event.payload as Record<string, unknown>;
    const eventMetrics = payload.metrics as any;

    if (!eventMetrics || typeof eventMetrics !== 'object') {
      return metrics;
    }

    // Extract numeric metrics
    for (const [key, value] of Object.entries(eventMetrics)) {
      if (typeof value === 'number') {
        metrics[key] = value;
      }
    }

    return metrics;
  }

  /**
   * Extract error information from event.
   */
  static extractErrorInfo(event: SystemEvent): {
    errorCode?: string;
    errorMessage?: string;
    errorType?: string;
  } {
    const errorInfo: {
      errorCode?: string;
      errorMessage?: string;
      errorType?: string;
    } = {};

    // Check payload first
    if (event.payload && typeof event.payload === 'object') {
      const payload = event.payload as Record<string, unknown>;

      if (typeof payload.errorCode === 'string') {
        errorInfo.errorCode = payload.errorCode;
      }
      if (typeof payload.errorMessage === 'string') {
        errorInfo.errorMessage = payload.errorMessage;
      }
      if (typeof payload.errorType === 'string') {
        errorInfo.errorType = payload.errorType;
      }
    }

    // Check metadata as fallback
    if (event.metadata && typeof event.metadata === 'object') {
      const metadata = event.metadata as Record<string, unknown>;

      if (!errorInfo.errorCode && typeof metadata.errorCode === 'string') {
        errorInfo.errorCode = metadata.errorCode;
      }
      if (
        !errorInfo.errorMessage &&
        typeof metadata.errorMessage === 'string'
      ) {
        errorInfo.errorMessage = metadata.errorMessage;
      }
      if (!errorInfo.errorType && typeof metadata.errorType === 'string') {
        errorInfo.errorType = metadata.errorType;
      }
    }

    return errorInfo;
  }

  /**
   * Extract timing information from event.
   */
  static extractTimingInfo(event: SystemEvent): {
    duration?: number;
    startTime?: Date;
    endTime?: Date;
  } {
    const timingInfo: {
      duration?: number;
      startTime?: Date;
      endTime?: Date;
    } = {};

    // Check payload first
    if (event.payload && typeof event.payload === 'object') {
      const payload = event.payload as Record<string, unknown>;

      if (typeof payload.duration === 'number') {
        timingInfo.duration = payload.duration;
      }
      if (payload.startTime instanceof Date) {
        timingInfo.startTime = payload.startTime;
      }
      if (payload.endTime instanceof Date) {
        timingInfo.endTime = payload.endTime;
      }
    }

    // Calculate duration if start and end times are available
    if (!timingInfo.duration && timingInfo.startTime && timingInfo.endTime) {
      timingInfo.duration =
        timingInfo.endTime.getTime() - timingInfo.startTime.getTime();
    }

    return timingInfo;
  }
}
