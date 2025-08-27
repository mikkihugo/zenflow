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
export declare class CoordinationEventExtractor {
    /**
     * Extract swarm ID from event.
     */
    static extractSwarmId(event: SystemEvent): string | undefined;
    /**
     * Extract agent ID from event.
     */
    static extractAgentId(event: SystemEvent): string | undefined;
    /**
     * Extract task ID from event.
     */
    static extractTaskId(event: SystemEvent): string | undefined;
    /**
     * Extract agent IDs (as array) from event.
     */
    static extractAgentIds(event: SystemEvent): string[];
    /**
     * Extract task IDs (as array) from event.
     */
    static extractTaskIds(event: SystemEvent): string[];
    /**
     * Extract component type from event source.
     */
    static extractComponentType(source: string): 'swarm' | 'agent' | 'orchestrator' | 'protocol';
    /**
     * Extract correlation patterns from events.
     */
    static extractCorrelationPatterns(events: CoordinationEvent[]): string[];
    /**
     * Extract resource usage from event metadata.
     */
    static extractResourceUsage(event: SystemEvent): {
        cpu: number;
        memory: number;
        network: number;
    };
    /**
     * Extract metrics from event payload.
     */
    static extractMetrics(event: SystemEvent): Record<string, number>;
    /**
     * Extract error information from event.
     */
    static extractErrorInfo(event: SystemEvent): {
        errorCode?: string;
        errorMessage?: string;
        errorType?: string;
    };
    /**
     * Extract timing information from event.
     */
    static extractTimingInfo(event: SystemEvent): {
        duration?: number;
        startTime?: Date;
        endTime?: Date;
    };
}
//# sourceMappingURL=extractor.d.ts.map