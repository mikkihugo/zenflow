export class TaskAgentMatcher {
    matchingHistory = new Map();
    async findCandidates(task, availableAgents, capacityManager) {
        const matchingScores = [];
        for (const agent of availableAgents) {
            const score = await this.calculateMatchingScore(task, agent, capacityManager);
            if (score.score > 0.3) {
                matchingScores.push(score);
            }
        }
        matchingScores?.sort((a, b) => b.score - a.score);
        this.matchingHistory.set(task.id, matchingScores);
        return matchingScores.map((score) => score.agent);
    }
    async calculateMatchingScore(task, agent, capacityManager) {
        const capabilityMatch = this.calculateCapabilityMatch(task, agent);
        const performanceMatch = this.calculatePerformanceMatch(task, agent);
        const capacity = await capacityManager.getCapacity(agent.id);
        const availabilityMatch = capacity.availableCapacity / capacity.maxConcurrentTasks;
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
        const reliability = agent.metadata?.reliability || 0.8;
        const avgLatency = agent.metadata?.averageLatency || 1000;
        const latencyScore = Math.max(0, 1 - avgLatency / 5000);
        return (reliability + latencyScore) / 2;
    }
}
//# sourceMappingURL=task-agent-matcher.js.map