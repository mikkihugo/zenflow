/**
 * @file Coordination Event Data Extractors
 *
 * Utility functions for extracting specific data from events,
 * such as swarm IDs, agent IDs, task IDs, etc.
 */
/**
 * Data extraction utilities for coordination events.
 */
export class CoordinationEventExtractor {
    /**
     * Extract swarm ID from event.
     */
    static extractSwarmId(event) {
        // Check payload first, then metadata as fallback
        const swarmId = (event.payload && typeof event.payload === 'object'
            ? event.payload.swarmId
            : undefined) ||
            (event.metadata && typeof event.metadata === 'object'
                ? event.metadata.swarmId
                : undefined);
        return typeof swarmId === 'string' ? swarmId : undefined;
    }
    /**
     * Extract agent ID from event.
     */
    static extractAgentId(event) {
        const coordinationEvent = event;
        const { targetId } = coordinationEvent;
        return ((coordinationEvent.payload &&
            typeof coordinationEvent.payload === 'object'
            ? coordinationEvent.payload
                .agentId
            : undefined) ||
            (event.metadata && typeof event.metadata === 'object'
                ? event.metadata.agentId
                : undefined) ||
            (targetId && typeof targetId === 'string' && targetId.includes('agent')
                ? targetId
                : undefined));
    }
    /**
     * Extract task ID from event.
     */
    static extractTaskId(event) {
        const coordinationEvent = event;
        const { targetId } = coordinationEvent;
        return ((event.payload && typeof event.payload === 'object'
            ? event.payload.taskId
            : undefined) ||
            (event.metadata && typeof event.metadata === 'object'
                ? event.metadata.taskId
                : undefined) ||
            (targetId && typeof targetId === 'string' && targetId.includes('task')
                ? targetId
                : undefined));
    }
    /**
     * Extract agent IDs (as array) from event.
     */
    static extractAgentIds(event) {
        const agentId = this.extractAgentId(event);
        return agentId ? [agentId] : [];
    }
    /**
     * Extract task IDs (as array) from event.
     */
    static extractTaskIds(event) {
        const taskId = this.extractTaskId(event);
        return taskId ? [taskId] : [];
    }
    /**
     * Extract component type from event source.
     */
    static extractComponentType(source) {
        if (source.includes('swarm'))
            return 'swarm';
        if (source.includes('agent'))
            return 'agent';
        if (source.includes('orchestrator') || source.includes('task'))
            return 'orchestrator';
        return 'protocol';
    }
    /**
     * Extract correlation patterns from events.
     */
    static extractCorrelationPatterns(events) {
        const patterns = [];
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
    static extractResourceUsage(event) {
        const defaultUsage = { cpu: 0, memory: 0, network: 0 };
        if (!event.metadata || typeof event.metadata !== 'object') {
            return defaultUsage;
        }
        const metadata = event.metadata;
        const resourceUsage = metadata.resourceUsage;
        if (!resourceUsage || typeof resourceUsage !== 'object') {
            return defaultUsage;
        }
        return {
            cpu: typeof resourceUsage.cpu === 'number' ? resourceUsage.cpu : 0,
            memory: typeof resourceUsage.memory === 'number' ? resourceUsage.memory : 0,
            network: typeof resourceUsage.network === 'number' ? resourceUsage.network : 0,
        };
    }
    /**
     * Extract metrics from event payload.
     */
    static extractMetrics(event) {
        const metrics = {};
        if (!event.payload || typeof event.payload !== 'object') {
            return metrics;
        }
        const payload = event.payload;
        const eventMetrics = payload.metrics;
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
    static extractErrorInfo(event) {
        const errorInfo = {};
        // Check payload first
        if (event.payload && typeof event.payload === 'object') {
            const payload = event.payload;
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
            const metadata = event.metadata;
            if (!errorInfo.errorCode && typeof metadata.errorCode === 'string') {
                errorInfo.errorCode = metadata.errorCode;
            }
            if (!errorInfo.errorMessage &&
                typeof metadata.errorMessage === 'string') {
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
    static extractTimingInfo(event) {
        const timingInfo = {};
        // Check payload first
        if (event.payload && typeof event.payload === 'object') {
            const payload = event.payload;
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
