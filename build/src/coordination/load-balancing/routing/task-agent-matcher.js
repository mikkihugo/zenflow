/**
 * Task-Agent Matcher.
 * Intelligent matching of tasks to suitable agents based on capabilities and performance.
 */
/**
 * @file Coordination system: task-agent-matcher
 */
export class TaskAgentMatcher {
    matchingHistory = new Map();
    async findCandidates(task, availableAgents, capacityManager) {
        const matchingScores = [];
        for (const agent of availableAgents) {
            const score = await this.calculateMatchingScore(task, agent, capacityManager);
            if (score.score > 0.3) {
                // Minimum threshold
                matchingScores.push(score);
            }
        }
        // Sort by score (highest first)
        matchingScores?.sort((a, b) => b.score - a.score);
        // Store matching history
        this.matchingHistory.set(task.id, matchingScores);
        return matchingScores.map((score) => score.agent);
    }
    async calculateMatchingScore(task, agent, capacityManager) {
        // Calculate capability match
        const capabilityMatch = this.calculateCapabilityMatch(task, agent);
        // Calculate performance match based on historical data
        const performanceMatch = this.calculatePerformanceMatch(task, agent);
        // Calculate availability match
        const capacity = await capacityManager.getCapacity(agent.id);
        const availabilityMatch = capacity.availableCapacity / capacity.maxConcurrentTasks;
        // Combine scores with weights
        const score = capabilityMatch * 0.4 + performanceMatch * 0.3 + availabilityMatch * 0.3;
        return {
            agent,
            score,
            reasoning: `Capability: ${(capabilityMatch * 100).toFixed(1)}%, Performance: ${(performanceMatch * 100).toFixed(1)}%, Availability: ${(availabilityMatch * 100).toFixed(1)}%`,
            capabilityMatch,
            performanceMatch,
            availabilityMatch,
        };
    }
    calculateCapabilityMatch(task, agent) {
        if (task.requiredCapabilities.length === 0)
            return 1.0;
        const matchingCapabilities = task.requiredCapabilities.filter((capability) => agent.capabilities.includes(capability));
        return matchingCapabilities.length / task.requiredCapabilities.length;
    }
    calculatePerformanceMatch(_task, agent) {
        // In practice, this would use historical performance data
        // For now, return a score based on agent metadata
        const reliability = agent.metadata?.reliability || 0.8;
        const avgLatency = agent.metadata?.averageLatency || 1000;
        // Lower latency is better
        const latencyScore = Math.max(0, 1 - avgLatency / 5000);
        return (reliability + latencyScore) / 2;
    }
}
