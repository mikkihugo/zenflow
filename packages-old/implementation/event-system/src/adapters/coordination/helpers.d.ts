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
export declare const CoordinationEventHelpers: {
    /**
     * Create swarm initialization event.
     */
    createSwarmInitEvent(swarmId: string, topology: "mesh" | "hierarchical" | "ring" | "star", details?: unknown): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create agent spawn event.
     */
    createAgentSpawnEvent(agentId: string, swarmId: string, details?: unknown): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create task distribution event.
     */
    createTaskDistributionEvent(taskId: string, assignedTo: string[], details?: unknown): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create topology change event.
     */
    createTopologyChangeEvent(swarmId: string, topology: "mesh" | "hierarchical" | "ring" | "star", details?: unknown): Omit<CoordinationEvent, "id" | "timestamp">;
    /**
     * Create coordination error event.
     */
    createCoordinationErrorEvent(component: string, targetId: string, error: Error, details?: unknown): Omit<CoordinationEvent, "id" | "timestamp">;
};
/**
 * Utility functions for coordination event processing.
 */
export declare class CoordinationEventUtils {
    /**
     * Extract coordination operation from event type.
     */
    static extractCoordinationOperation(eventType: string): CoordinationEvent['operation'];
    /**
     * Extract target ID from event data.
     */
    static extractTargetId(data: unknown): string;
    /**
     * Determine event priority based on event type.
     */
    static determineEventPriority(eventType: string): 'critical' | 'high' | 'medium' | 'low';
    /**
     * Generate unique event ID.
     */
    static generateEventId(): string;
    /**
     * Generate unique subscription ID.
     */
    static generateSubscriptionId(): string;
    /**
     * Generate unique filter ID.
     */
    static generateFilterId(): string;
    /**
     * Generate unique transform ID.
     */
    static generateTransformId(): string;
    /**
     * Generate unique correlation ID.
     */
    static generateCorrelationId(): string;
}
//# sourceMappingURL=helpers.d.ts.map