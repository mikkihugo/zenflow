/**
 * @file Coordination Event Helpers
 * 
 * Helper functions for creating common coordination events
 * and utility functions for event processing.
 */

import type { CoordinationEvent } from '../../types';

/**
 * Helper functions for coordination event operations.
 */
export const CoordinationEventHelpers = {
  /**
   * Create swarm initialization event.
   */
  createSwarmInitEvent(
    swarmId: string,
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star',
    details?: unknown
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'swarm-coordinator',
      type: 'coordination:swarm',
      operation: 'init',
      targetId: swarmId,
      priority: 'high',
      payload: {
        ...(details && typeof details === 'object' ? details : {}),
        topology,
        swarmId,
      },
      details: {
        ...(details && typeof details === 'object' ? details : {}),
        topology,
      },
    };
  },

  /**
   * Create agent spawn event.
   */
  createAgentSpawnEvent(
    agentId: string,
    swarmId: string,
    details?: unknown
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'agent-manager',
      type: 'coordination:agent',
      operation: 'spawn',
      targetId: agentId,
      priority: 'high',
      payload: {
        ...(details && typeof details === 'object' ? details : {}),
        swarmId,
      },
      details: {
        ...(details && typeof details === 'object' ? details : {}),
      },
    };
  },

  /**
   * Create task distribution event.
   */
  createTaskDistributionEvent(
    taskId: string,
    assignedTo: string[],
    details?: unknown
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'orchestrator',
      type: 'coordination:task',
      operation: 'distribute',
      targetId: taskId,
      priority: 'medium',
      payload: {
        ...(details && typeof details === 'object' ? details : {}),
        assignedTo,
      },
      details: {
        ...(details && typeof details === 'object' ? details : {}),
        assignedTo,
      },
    };
  },

  /**
   * Create topology change event.
   */
  createTopologyChangeEvent(
    swarmId: string,
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star',
    details?: unknown
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'topology-manager',
      type: 'coordination:topology',
      operation: 'coordinate',
      targetId: swarmId,
      priority: 'medium',
      payload: {
        ...(details && typeof details === 'object' ? details : {}),
        topology,
        swarmId,
      },
      details: {
        ...(details && typeof details === 'object' ? details : {}),
        topology,
      },
    };
  },

  /**
   * Create coordination error event.
   */
  createCoordinationErrorEvent(
    component: string,
    targetId: string,
    error: Error,
    details?: unknown
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: component,
      type: 'coordination:swarm',
      operation: 'fail',
      targetId,
      priority: 'high',
      payload: {
        ...(details && typeof details === 'object' ? details : {}),
        errorCode: error.name,
        errorMessage: error.message,
      },
      details: {
        ...(details && typeof details === 'object' ? details : {}),
      },
    };
  },
};

/**
 * Utility functions for coordination event processing.
 */
export class CoordinationEventUtils {
  /**
   * Extract coordination operation from event type.
   */
  static extractCoordinationOperation(
    eventType: string
  ): CoordinationEvent['operation'] {
    if (
      eventType.includes('init') || 
      eventType.includes('start') || 
      eventType.includes('created')
    ) return 'init';
    
    if (eventType.includes('spawn') || eventType.includes('added'))
      return 'spawn';
    
    if (
      eventType.includes('destroy') || 
      eventType.includes('removed') || 
      eventType.includes('shutdown')
    ) return 'destroy';
    
    if (eventType.includes('assign') || eventType.includes('distribute'))
      return 'distribute';
    
    if (eventType.includes('complete')) return 'complete';
    
    if (eventType.includes('fail') || eventType.includes('error'))
      return 'fail';
    
    return 'coordinate';
  }

  /**
   * Extract target ID from event data.
   */
  static extractTargetId(data: unknown): string {
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      return (
        (typeof obj.swarmId === 'string' ? obj.swarmId : undefined) ||
        (typeof obj.agentId === 'string' ? obj.agentId : undefined) ||
        (typeof obj.taskId === 'string' ? obj.taskId : undefined) ||
        (typeof obj.id === 'string' ? obj.id : undefined) ||
        'unknown'
      );
    }
    return 'unknown';
  }

  /**
   * Determine event priority based on event type.
   */
  static determineEventPriority(eventType: string): 'critical' | 'high' | 'medium' | 'low' {
    if (
      eventType.includes('error') || 
      eventType.includes('fail') || 
      eventType.includes('timeout')
    ) return 'high';
    
    if (
      eventType.includes('start') || 
      eventType.includes('init') || 
      eventType.includes('shutdown')
    ) return 'high';
    
    if (eventType.includes('complete') || eventType.includes('success'))
      return 'medium';
    
    return 'medium';
  }

  /**
   * Generate unique event ID.
   */
  static generateEventId(): string {
    return `coord-evt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique subscription ID.
   */
  static generateSubscriptionId(): string {
    return `coord-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique filter ID.
   */
  static generateFilterId(): string {
    return `coord-flt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique transform ID.
   */
  static generateTransformId(): string {
    return `coord-txf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique correlation ID.
   */
  static generateCorrelationId(): string {
    return `coord-cor-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}