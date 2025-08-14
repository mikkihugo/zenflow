export class LeastConnectionsAlgorithm {
    name = 'least_connections';
    connectionStates = new Map();
    config = {
        defaultMaxConnections: 100,
        capacityPredictionWindow: 300000,
        historySize: 100,
        adaptiveCapacityEnabled: true,
        connectionTimeoutMs: 30000,
        capacityBufferRatio: 0.8,
        smoothingFactor: 0.3,
    };
    async selectAgent(task, availableAgents, metrics) {
        if (availableAgents.length === 0) {
            throw new Error('No available agents');
        }
        if (availableAgents.length === 1) {
            const agent = availableAgents[0];
            return {
                selectedAgent: agent,
                confidence: 1.0,
                reasoning: 'Only agent available',
                alternativeAgents: [],
                estimatedLatency: this.estimateLatency(agent, metrics),
                expectedQuality: 0.8,
            };
        }
        await this.updateConnectionStates(availableAgents, metrics);
        const scoredAgents = await this.scoreAgents(availableAgents, task, metrics);
        scoredAgents.sort((a, b) => a.score - b.score);
        const selectedAgent = scoredAgents[0]?.agent;
        const confidence = this.calculateConfidence(scoredAgents);
        const alternatives = scoredAgents.slice(1, 4).map((s) => s.agent);
        await this.incrementConnections(selectedAgent?.id);
        return {
            selectedAgent,
            confidence,
            reasoning: `Selected agent with ${scoredAgents[0]?.connections} active connections (capacity: ${scoredAgents[0]?.capacity})`,
            alternativeAgents: alternatives,
            estimatedLatency: this.estimateLatency(selectedAgent, metrics),
            expectedQuality: this.estimateQuality(selectedAgent, metrics),
        };
    }
    async updateConfiguration(config) {
        this.config = { ...this.config, ...config };
    }
    async getPerformanceMetrics() {
        const states = Array.from(this.connectionStates.values());
        const totalConnections = states.reduce((sum, s) => sum + s.activeConnections, 0);
        const totalCapacity = states.reduce((sum, s) => sum + s.maxConnections, 0);
        const avgUtilization = totalCapacity > 0 ? totalConnections / totalCapacity : 0;
        return {
            totalAgents: states.length,
            totalActiveConnections: totalConnections,
            totalCapacity: totalCapacity,
            averageUtilization: avgUtilization,
            capacityPredictionAccuracy: await this.calculatePredictionAccuracy(),
            averageConnectionDuration: this.calculateAverageConnectionDuration(states),
        };
    }
    async onTaskComplete(agentId, _task, duration, _success) {
        const state = this.getOrCreateConnectionState(agentId);
        state.activeConnections = Math.max(0, state.activeConnections - 1);
        state.recentCompletions.push(new Date());
        const cutoff = new Date(Date.now() - this.config.capacityPredictionWindow);
        state.recentCompletions = state.recentCompletions.filter((date) => date > cutoff);
        this.updateAverageConnectionDuration(state, duration);
        if (this.config.adaptiveCapacityEnabled) {
            await this.updateCapacityPrediction(state);
        }
    }
    async onAgentFailure(agentId, _error) {
        const state = this.getOrCreateConnectionState(agentId);
        state.activeConnections = 0;
        state.predictedCapacity = Math.max(1, state.predictedCapacity * 0.5);
        state.lastCapacityUpdate = new Date();
    }
    getOrCreateConnectionState(agentId) {
        if (!this.connectionStates.has(agentId)) {
            this.connectionStates.set(agentId, {
                agentId,
                activeConnections: 0,
                maxConnections: this.config.defaultMaxConnections,
                averageConnectionDuration: 5000,
                recentCompletions: [],
                predictedCapacity: this.config.defaultMaxConnections,
                connectionHistory: [],
                lastCapacityUpdate: new Date(),
            });
        }
        return this.connectionStates.get(agentId);
    }
    async updateConnectionStates(agents, metrics) {
        for (const agent of agents) {
            const state = this.getOrCreateConnectionState(agent.id);
            const agentMetrics = metrics.get(agent.id);
            if (agentMetrics) {
                state.activeConnections = agentMetrics.activeTasks;
                state.connectionHistory.push(agentMetrics.activeTasks);
                if (state.connectionHistory.length > this.config.historySize) {
                    state.connectionHistory.shift();
                }
                if (this.config.adaptiveCapacityEnabled) {
                    await this.updateCapacityPrediction(state);
                }
            }
        }
    }
    async scoreAgents(agents, task, metrics) {
        const scored = [];
        for (const agent of agents) {
            const state = this.getOrCreateConnectionState(agent.id);
            const agentMetrics = metrics.get(agent.id);
            const availableCapacity = state.predictedCapacity * this.config.capacityBufferRatio;
            if (state.activeConnections >= availableCapacity) {
                continue;
            }
            let score = state.activeConnections;
            const utilizationRatio = state.activeConnections / state.predictedCapacity;
            score += utilizationRatio * 100;
            if (task.priority > 3) {
                score *= 0.8;
            }
            if (agentMetrics) {
                const responseTimeFactor = Math.min(2, agentMetrics.responseTime / 1000);
                score += responseTimeFactor;
            }
            if (agentMetrics && agentMetrics.errorRate > 0) {
                score += agentMetrics.errorRate * 1000;
            }
            scored.push({
                agent,
                score,
                connections: state.activeConnections,
                capacity: Math.floor(state.predictedCapacity),
            });
        }
        return scored;
    }
    async incrementConnections(agentId) {
        const state = this.getOrCreateConnectionState(agentId);
        state.activeConnections++;
    }
    async updateCapacityPrediction(state) {
        const now = new Date();
        const timeSinceUpdate = now.getTime() - state.lastCapacityUpdate.getTime();
        if (timeSinceUpdate < 30000)
            return;
        const recentThroughput = this.calculateRecentThroughput(state);
        const throughputBasedCapacity = recentThroughput * (state.averageConnectionDuration / 1000);
        const historicalPeak = Math.max(...state.connectionHistory, state.maxConnections);
        const newPrediction = Math.max(throughputBasedCapacity, historicalPeak * 0.8, state.maxConnections * 0.5);
        state.predictedCapacity =
            state.predictedCapacity * (1 - this.config.smoothingFactor) +
                newPrediction * this.config.smoothingFactor;
        state.lastCapacityUpdate = now;
    }
    calculateRecentThroughput(state) {
        const now = new Date();
        const windowStart = new Date(now.getTime() - this.config.capacityPredictionWindow);
        const recentCompletions = state.recentCompletions.filter((date) => date > windowStart);
        const windowDurationSeconds = this.config.capacityPredictionWindow / 1000;
        return recentCompletions.length / windowDurationSeconds;
    }
    updateAverageConnectionDuration(state, newDuration) {
        state.averageConnectionDuration =
            state.averageConnectionDuration * (1 - this.config.smoothingFactor) +
                newDuration * this.config.smoothingFactor;
    }
    calculateConfidence(scoredAgents) {
        if (scoredAgents.length < 2)
            return 1.0;
        const bestScore = scoredAgents[0]?.score;
        const secondBestScore = scoredAgents[1]?.score;
        const scoreDifference = secondBestScore - bestScore;
        const relativeAdvantage = scoreDifference / (secondBestScore + 1);
        return Math.min(1.0, Math.max(0.1, relativeAdvantage + 0.5));
    }
    estimateLatency(agent, metrics) {
        const agentMetrics = metrics.get(agent.id);
        const state = this.getOrCreateConnectionState(agent.id);
        let baseLatency = agentMetrics?.responseTime || 1000;
        const loadFactor = state.activeConnections / state.predictedCapacity;
        baseLatency *= 1 + loadFactor;
        return Math.max(100, baseLatency);
    }
    estimateQuality(agent, metrics) {
        const agentMetrics = metrics.get(agent.id);
        const state = this.getOrCreateConnectionState(agent.id);
        let quality = 0.9;
        if (agentMetrics?.errorRate) {
            quality *= 1 - agentMetrics.errorRate;
        }
        const utilization = state.activeConnections / state.predictedCapacity;
        if (utilization > 0.8) {
            quality *= 1 - (utilization - 0.8) * 2;
        }
        return Math.max(0.1, quality);
    }
    async calculatePredictionAccuracy() {
        const states = Array.from(this.connectionStates.values());
        let totalError = 0;
        let samples = 0;
        for (const state of states) {
            if (state.connectionHistory.length > 10) {
                const recent = state.connectionHistory.slice(-10);
                const actual = Math.max(...recent);
                const predicted = state.predictedCapacity;
                const error = Math.abs(actual - predicted) / Math.max(actual, predicted, 1);
                totalError += error;
                samples++;
            }
        }
        return samples > 0 ? 1 - totalError / samples : 0.8;
    }
    calculateAverageConnectionDuration(states) {
        if (states.length === 0)
            return 0;
        const totalDuration = states.reduce((sum, s) => sum + s.averageConnectionDuration, 0);
        return totalDuration / states.length;
    }
}
//# sourceMappingURL=least-connections.js.map