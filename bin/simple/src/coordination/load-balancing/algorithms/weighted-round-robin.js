export class WeightedRoundRobinAlgorithm {
    name = 'weighted_round_robin';
    weights = new Map();
    config = {
        initialWeight: 100,
        minWeight: 1,
        maxWeight: 1000,
        weightDecayFactor: 0.9,
        performanceWindow: 300000,
        adaptationRate: 0.1,
    };
    async selectAgent(_task, availableAgents, metrics) {
        if (availableAgents.length === 0) {
            throw new Error('No available agents');
        }
        if (availableAgents.length === 1) {
            return {
                selectedAgent: availableAgents[0],
                confidence: 1.0,
                reasoning: 'Only agent available',
                alternativeAgents: [],
                estimatedLatency: this.estimateLatency(availableAgents[0], metrics),
                expectedQuality: 0.8,
            };
        }
        await this.updateWeightsFromMetrics(availableAgents, metrics);
        let selectedAgent = null;
        let maxCurrentWeight = -1;
        let totalWeight = 0;
        for (const agent of availableAgents) {
            const weight = this.getOrCreateWeight(agent.id);
            totalWeight += weight.effectiveWeight;
            weight.currentWeight += weight.effectiveWeight;
            if (weight.currentWeight > maxCurrentWeight) {
                maxCurrentWeight = weight.currentWeight;
                selectedAgent = agent;
            }
        }
        if (!selectedAgent) {
            selectedAgent = availableAgents[0];
        }
        const selectedWeight = this.weights.get(selectedAgent?.id);
        selectedWeight.currentWeight -= totalWeight;
        const confidence = this.calculateConfidence(selectedAgent, availableAgents, metrics);
        const alternatives = this.getAlternativeAgents(selectedAgent, availableAgents, 3);
        return {
            selectedAgent,
            confidence,
            reasoning: `Selected based on weighted round robin (weight: ${selectedWeight?.effectiveWeight})`,
            alternativeAgents: alternatives,
            estimatedLatency: this.estimateLatency(selectedAgent, metrics),
            expectedQuality: this.estimateQuality(selectedAgent, metrics),
        };
    }
    async updateConfiguration(config) {
        this.config = { ...this.config, ...config };
    }
    async getPerformanceMetrics() {
        const weights = Array.from(this.weights.values());
        return {
            totalAgents: weights.length,
            averageWeight: weights.reduce((sum, w) => sum + w.weight, 0) / weights.length,
            weightVariance: this.calculateWeightVariance(weights),
            adaptationRate: this.config.adaptationRate,
            successRate: this.calculateOverallSuccessRate(weights),
        };
    }
    async updateWeights(agents, metrics) {
        await this.updateWeightsFromMetrics(agents, metrics);
    }
    async onTaskComplete(agentId, _task, _duration, success) {
        const weight = this.getOrCreateWeight(agentId);
        if (success) {
            weight.successCount++;
            weight.weight = Math.min(this.config.maxWeight, weight.weight * (1 + this.config.adaptationRate));
        }
        else {
            weight.failureCount++;
            weight.weight = Math.max(this.config.minWeight, weight.weight * this.config.weightDecayFactor);
        }
        weight.lastUpdate = new Date();
        this.updateEffectiveWeight(weight);
    }
    async onAgentFailure(agentId, _error) {
        const weight = this.getOrCreateWeight(agentId);
        weight.failureCount++;
        weight.weight = Math.max(this.config.minWeight, weight.weight * 0.5);
        weight.lastUpdate = new Date();
        this.updateEffectiveWeight(weight);
    }
    getOrCreateWeight(agentId) {
        if (!this.weights.has(agentId)) {
            this.weights.set(agentId, {
                agentId,
                weight: this.config.initialWeight,
                currentWeight: 0,
                effectiveWeight: this.config.initialWeight,
                successCount: 0,
                failureCount: 0,
                lastUpdate: new Date(),
            });
        }
        return this.weights.get(agentId);
    }
    async updateWeightsFromMetrics(agents, metrics) {
        const now = new Date();
        for (const agent of agents) {
            const agentMetrics = metrics.get(agent.id);
            if (!agentMetrics)
                continue;
            const weight = this.getOrCreateWeight(agent.id);
            const performanceScore = this.calculatePerformanceScore(agentMetrics);
            const targetWeight = this.config.initialWeight * performanceScore;
            const weightDelta = (targetWeight - weight.weight) * this.config.adaptationRate;
            weight.weight = Math.max(this.config.minWeight, Math.min(this.config.maxWeight, weight.weight + weightDelta));
            weight.lastUpdate = now;
            this.updateEffectiveWeight(weight);
        }
    }
    calculatePerformanceScore(metrics) {
        const cpuScore = Math.max(0, 1 - metrics.cpuUsage);
        const memoryScore = Math.max(0, 1 - metrics.memoryUsage);
        const responseTimeScore = Math.max(0, 1 - metrics.responseTime / 10000);
        const errorScore = Math.max(0, 1 - metrics.errorRate);
        const throughputScore = Math.min(1, metrics.throughput / 100);
        return (cpuScore * 0.2 +
            memoryScore * 0.2 +
            responseTimeScore * 0.3 +
            errorScore * 0.2 +
            throughputScore * 0.1);
    }
    updateEffectiveWeight(weight) {
        const now = new Date();
        const timeSinceUpdate = now.getTime() - weight.lastUpdate.getTime();
        if (timeSinceUpdate > this.config.performanceWindow) {
            weight.effectiveWeight = weight.weight * this.config.weightDecayFactor;
        }
        else {
            weight.effectiveWeight = weight.weight;
        }
        const totalOperations = weight.successCount + weight.failureCount;
        if (totalOperations > 0) {
            const successRate = weight.successCount / totalOperations;
            weight.effectiveWeight *= 0.5 + successRate * 0.5;
        }
    }
    calculateConfidence(selectedAgent, availableAgents, _metrics) {
        const selectedWeight = this.weights.get(selectedAgent?.id);
        if (!selectedWeight)
            return 0.5;
        const weights = availableAgents
            .map((agent) => this.weights.get(agent.id)?.effectiveWeight ||
            this.config.initialWeight)
            .sort((a, b) => b - a);
        if (weights.length < 2)
            return 1.0;
        const topWeight = weights[0];
        const secondWeight = weights[1];
        const advantage = (topWeight - secondWeight) / topWeight;
        return Math.min(1.0, Math.max(0.1, advantage + 0.5));
    }
    getAlternativeAgents(selectedAgent, availableAgents, count) {
        return availableAgents
            .filter((agent) => agent.id !== selectedAgent?.id)
            .sort((a, b) => {
            const weightA = this.weights.get(a.id)?.effectiveWeight || this.config.initialWeight;
            const weightB = this.weights.get(b.id)?.effectiveWeight || this.config.initialWeight;
            return weightB - weightA;
        })
            .slice(0, count);
    }
    estimateLatency(agent, metrics) {
        const agentMetrics = metrics.get(agent.id);
        if (!agentMetrics)
            return 1000;
        return agentMetrics.responseTime || 1000;
    }
    estimateQuality(agent, metrics) {
        const agentMetrics = metrics.get(agent.id);
        if (!agentMetrics)
            return 0.8;
        return Math.max(0, 1 - agentMetrics.errorRate);
    }
    calculateWeightVariance(weights) {
        if (weights.length === 0)
            return 0;
        const mean = weights.reduce((sum, w) => sum + w.weight, 0) / weights.length;
        const variance = weights.reduce((sum, w) => sum + (w.weight - mean) ** 2, 0) /
            weights.length;
        return variance;
    }
    calculateOverallSuccessRate(weights) {
        const totalSuccess = weights.reduce((sum, w) => sum + w.successCount, 0);
        const totalOperations = weights.reduce((sum, w) => sum + w.successCount + w.failureCount, 0);
        return totalOperations > 0 ? totalSuccess / totalOperations : 0;
    }
}
//# sourceMappingURL=weighted-round-robin.js.map