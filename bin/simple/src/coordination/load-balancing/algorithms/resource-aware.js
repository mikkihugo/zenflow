export class ResourceAwareAlgorithm {
    name = 'resource_aware';
    resourceProfiles = new Map();
    config = {
        historySize: 100,
        trendAnalysisWindow: 20,
        resourceWeights: {
            cpu: 0.3,
            memory: 0.3,
            disk: 0.2,
            network: 0.2,
        },
        safetyMargin: 0.1,
        predictionHorizon: 300000,
        adaptiveThresholds: true,
        emergencyThresholds: {
            cpu: 0.95,
            memory: 0.95,
            disk: 0.9,
            network: 0.85,
        },
    };
    async selectAgent(task, availableAgents, metrics) {
        if (availableAgents.length === 0) {
            throw new Error('No available agents');
        }
        await this.updateResourceProfiles(availableAgents, metrics);
        const taskRequirements = this.estimateTaskRequirements(task);
        const scoredAgents = await this.scoreAgentsByResources(availableAgents, taskRequirements, metrics);
        const viableAgents = scoredAgents.filter((s) => s.canHandle);
        if (viableAgents.length === 0) {
            const fallbackAgent = this.selectFallbackAgent(scoredAgents);
            return {
                selectedAgent: fallbackAgent.agent,
                confidence: 0.3,
                reasoning: 'All agents overloaded, selected least loaded as fallback',
                alternativeAgents: [],
                estimatedLatency: this.estimateLatency(fallbackAgent.agent, metrics, true),
                expectedQuality: 0.4,
            };
        }
        viableAgents.sort((a, b) => b.score - a.score);
        const selectedAgent = viableAgents[0]?.agent;
        const confidence = this.calculateConfidence(viableAgents);
        const alternatives = viableAgents.slice(1, 4).map((s) => s.agent);
        await this.reserveResources(selectedAgent?.id, taskRequirements);
        return {
            selectedAgent,
            confidence,
            reasoning: `Selected based on optimal resource fit (score: ${viableAgents[0]?.score.toFixed(2)})`,
            alternativeAgents: alternatives,
            estimatedLatency: this.estimateLatency(selectedAgent, metrics, false),
            expectedQuality: this.estimateQuality(selectedAgent, metrics),
        };
    }
    async updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        for (const profile of this.resourceProfiles.values()) {
            this.updateResourceThresholds(profile);
        }
    }
    async getPerformanceMetrics() {
        const profiles = Array.from(this.resourceProfiles.values());
        const avgCpuUtilization = this.calculateAverageUtilization(profiles, 'cpu');
        const avgMemoryUtilization = this.calculateAverageUtilization(profiles, 'memory');
        const avgDiskUtilization = this.calculateAverageUtilization(profiles, 'disk');
        const avgNetworkUtilization = this.calculateAverageUtilization(profiles, 'network');
        const resourceEfficiency = this.calculateResourceEfficiency(profiles);
        const constraintViolations = this.countConstraintViolations(profiles);
        return {
            totalAgents: profiles.length,
            averageCpuUtilization: avgCpuUtilization,
            averageMemoryUtilization: avgMemoryUtilization,
            averageDiskUtilization: avgDiskUtilization,
            averageNetworkUtilization: avgNetworkUtilization,
            resourceEfficiency,
            constraintViolations,
            predictionAccuracy: await this.calculatePredictionAccuracy(),
        };
    }
    async onTaskComplete(agentId, task, duration, success) {
        const profile = this.getOrCreateResourceProfile(agentId);
        const taskRequirements = this.estimateTaskRequirements(task);
        await this.releaseResources(agentId, taskRequirements, duration, success);
        this.updateResourceTrends(profile, taskRequirements, duration, success);
    }
    async onAgentFailure(agentId, _error) {
        const profile = this.getOrCreateResourceProfile(agentId);
        profile.cpu.constraint = {
            type: 'cpu',
            threshold: 0.5,
            currentValue: 1.0,
            severity: 'high',
        };
        profile.memory.constraint = {
            type: 'memory',
            threshold: 0.5,
            currentValue: 1.0,
            severity: 'high',
        };
        profile.disk.constraint = {
            type: 'disk',
            threshold: 0.5,
            currentValue: 1.0,
            severity: 'high',
        };
        profile.network.constraint = {
            type: 'network',
            threshold: 0.5,
            currentValue: 1.0,
            severity: 'high',
        };
        profile.lastUpdate = new Date();
    }
    getOrCreateResourceProfile(agentId) {
        if (!this.resourceProfiles.has(agentId)) {
            this.resourceProfiles.set(agentId, {
                agentId,
                cpu: this.createResourceMetric(0.8),
                memory: this.createResourceMetric(0.8),
                disk: this.createResourceMetric(0.8),
                network: this.createResourceMetric(0.8),
                customResources: new Map(),
                resourceHistory: [],
                capacityLimits: {
                    maxCpuUtilization: 0.8,
                    maxMemoryUtilization: 0.8,
                    maxDiskUtilization: 0.8,
                    maxNetworkUtilization: 0.8,
                    maxConcurrentTasks: 10,
                },
                lastUpdate: new Date(),
            });
        }
        return this.resourceProfiles.get(agentId);
    }
    createResourceMetric(threshold) {
        return {
            current: 0,
            peak: 0,
            average: 0,
            trend: 'stable',
            utilization: 0,
            threshold,
        };
    }
    async updateResourceProfiles(agents, metrics) {
        const now = new Date();
        for (const agent of agents) {
            const profile = this.getOrCreateResourceProfile(agent.id);
            const agentMetrics = metrics.get(agent.id);
            if (agentMetrics) {
                profile.cpu.current = agentMetrics.cpuUsage;
                profile.memory.current = agentMetrics.memoryUsage;
                profile.disk.current = agentMetrics.diskUsage;
                profile.network.current = agentMetrics.networkUsage;
                profile.cpu.utilization = agentMetrics.cpuUsage;
                profile.memory.utilization = agentMetrics.memoryUsage;
                profile.disk.utilization = agentMetrics.diskUsage;
                profile.network.utilization = agentMetrics.networkUsage;
                profile.cpu.peak = Math.max(profile.cpu.peak, agentMetrics.cpuUsage);
                profile.memory.peak = Math.max(profile.memory.peak, agentMetrics.memoryUsage);
                profile.disk.peak = Math.max(profile.disk.peak, agentMetrics.diskUsage);
                profile.network.peak = Math.max(profile.network.peak, agentMetrics.networkUsage);
                const snapshot = {
                    timestamp: now,
                    cpu: agentMetrics.cpuUsage,
                    memory: agentMetrics.memoryUsage,
                    disk: agentMetrics.diskUsage,
                    network: agentMetrics.networkUsage,
                    activeTasks: agentMetrics.activeTasks,
                };
                profile.resourceHistory.push(snapshot);
                if (profile.resourceHistory.length > this.config.historySize) {
                    profile.resourceHistory.shift();
                }
                this.updateResourceAveragesAndTrends(profile);
                if (this.config.adaptiveThresholds) {
                    this.updateResourceThresholds(profile);
                }
                profile.lastUpdate = now;
            }
        }
    }
    estimateTaskRequirements(task) {
        const priorityMultiplier = task.priority / 3;
        const durationMultiplier = Math.min(2, task.estimatedDuration / 60000);
        return {
            estimatedCpu: 0.1 * priorityMultiplier * durationMultiplier,
            estimatedMemory: 0.05 * priorityMultiplier * durationMultiplier,
            estimatedDisk: 0.02 * priorityMultiplier,
            estimatedNetwork: 0.01 * priorityMultiplier,
            duration: task.estimatedDuration,
        };
    }
    async scoreAgentsByResources(agents, taskRequirements, metrics) {
        const scored = [];
        for (const agent of agents) {
            const profile = this.getOrCreateResourceProfile(agent.id);
            const agentMetrics = metrics.get(agent.id);
            const canHandle = this.canHandleTask(profile, taskRequirements);
            let bottleneck;
            let score = 0;
            const weights = this.config.resourceWeights;
            const cpuFitness = this.calculateResourceFitness(profile.cpu, taskRequirements.estimatedCpu);
            score += cpuFitness * weights.cpu;
            const memoryFitness = this.calculateResourceFitness(profile.memory, taskRequirements.estimatedMemory);
            score += memoryFitness * weights.memory;
            const diskFitness = this.calculateResourceFitness(profile.disk, taskRequirements.estimatedDisk);
            score += diskFitness * weights.disk;
            const networkFitness = this.calculateResourceFitness(profile.network, taskRequirements.estimatedNetwork);
            score += networkFitness * weights.network;
            const resourceFitness = {
                cpu: cpuFitness,
                memory: memoryFitness,
                disk: diskFitness,
                network: networkFitness,
            };
            const minFitness = Math.min(...Object.values(resourceFitness));
            bottleneck = Object.keys(resourceFitness).find((key) => resourceFitness[key] === minFitness);
            score = this.applyTrendPenalties(score, profile);
            score = this.applyConstraintPenalties(score, profile);
            if (agentMetrics && agentMetrics.errorRate < 0.01) {
                score *= 1.1;
            }
            scored.push({ agent, score, canHandle, bottleneck });
        }
        return scored;
    }
    canHandleTask(profile, requirements) {
        const safetyMargin = this.config.safetyMargin;
        const cpuAvailable = profile.capacityLimits.maxCpuUtilization - profile.cpu.utilization;
        const memoryAvailable = profile.capacityLimits.maxMemoryUtilization - profile.memory.utilization;
        const diskAvailable = profile.capacityLimits.maxDiskUtilization - profile.disk.utilization;
        const networkAvailable = profile.capacityLimits.maxNetworkUtilization -
            profile.network.utilization;
        return (cpuAvailable >= requirements.estimatedCpu + safetyMargin &&
            memoryAvailable >= requirements.estimatedMemory + safetyMargin &&
            diskAvailable >= requirements.estimatedDisk + safetyMargin &&
            networkAvailable >= requirements.estimatedNetwork + safetyMargin);
    }
    calculateResourceFitness(resource, requirement) {
        const available = resource.threshold - resource.utilization;
        const needed = requirement + this.config.safetyMargin;
        if (available <= 0)
            return 0;
        if (needed <= 0)
            return 1;
        const ratio = available / needed;
        return Math.min(1, Math.max(0, Math.log10(ratio + 1)));
    }
    applyTrendPenalties(score, profile) {
        let penalty = 1.0;
        if (profile.cpu.trend === 'increasing')
            penalty *= 0.9;
        if (profile.memory.trend === 'increasing')
            penalty *= 0.9;
        if (profile.disk.trend === 'increasing')
            penalty *= 0.95;
        if (profile.network.trend === 'increasing')
            penalty *= 0.95;
        return score * penalty;
    }
    applyConstraintPenalties(score, profile) {
        let penalty = 1.0;
        if (profile.cpu.constraint &&
            profile.cpu.constraint.severity === 'critical')
            penalty *= 0.1;
        if (profile.memory.constraint &&
            profile.memory.constraint.severity === 'critical')
            penalty *= 0.1;
        if (profile.disk.constraint && profile.disk.constraint.severity === 'high')
            penalty *= 0.5;
        if (profile.network.constraint &&
            profile.network.constraint.severity === 'high')
            penalty *= 0.5;
        return score * penalty;
    }
    async reserveResources(agentId, requirements) {
        const profile = this.getOrCreateResourceProfile(agentId);
        profile.cpu.utilization += requirements.estimatedCpu;
        profile.memory.utilization += requirements.estimatedMemory;
        profile.disk.utilization += requirements.estimatedDisk;
        profile.network.utilization += requirements.estimatedNetwork;
    }
    async releaseResources(agentId, requirements, actualDuration, success) {
        const profile = this.getOrCreateResourceProfile(agentId);
        profile.cpu.utilization = Math.max(0, profile.cpu.utilization - requirements.estimatedCpu);
        profile.memory.utilization = Math.max(0, profile.memory.utilization - requirements.estimatedMemory);
        profile.disk.utilization = Math.max(0, profile.disk.utilization - requirements.estimatedDisk);
        profile.network.utilization = Math.max(0, profile.network.utilization - requirements.estimatedNetwork);
        this.updateResourcePredictionModels(profile, requirements, actualDuration, success);
    }
    updateResourceAveragesAndTrends(profile) {
        const history = profile.resourceHistory;
        if (history.length < 2)
            return;
        const recent = history.slice(-this.config.trendAnalysisWindow);
        profile.cpu.average =
            recent.reduce((sum, s) => sum + s.cpu, 0) / recent.length;
        profile.memory.average =
            recent.reduce((sum, s) => sum + s.memory, 0) / recent.length;
        profile.disk.average =
            recent.reduce((sum, s) => sum + s.disk, 0) / recent.length;
        profile.network.average =
            recent.reduce((sum, s) => sum + s.network, 0) / recent.length;
        profile.cpu.trend = this.calculateTrend(recent.map((s) => s.cpu));
        profile.memory.trend = this.calculateTrend(recent.map((s) => s.memory));
        profile.disk.trend = this.calculateTrend(recent.map((s) => s.disk));
        profile.network.trend = this.calculateTrend(recent.map((s) => s.network));
    }
    calculateTrend(values) {
        if (values.length < 3)
            return 'stable';
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        if (slope > 0.01)
            return 'increasing';
        if (slope < -0.01)
            return 'decreasing';
        return 'stable';
    }
    updateResourceThresholds(profile) {
        const history = profile.resourceHistory;
        if (history.length < 10)
            return;
        const recent = history.slice(-20);
        const peaks = {
            cpu: Math.max(...recent.map((s) => s.cpu)),
            memory: Math.max(...recent.map((s) => s.memory)),
            disk: Math.max(...recent.map((s) => s.disk)),
            network: Math.max(...recent.map((s) => s.network)),
        };
        profile.cpu.threshold = Math.min(0.9, peaks.cpu * 1.2);
        profile.memory.threshold = Math.min(0.9, peaks.memory * 1.2);
        profile.disk.threshold = Math.min(0.9, peaks.disk * 1.2);
        profile.network.threshold = Math.min(0.9, peaks.network * 1.2);
    }
    selectFallbackAgent(scoredAgents) {
        return scoredAgents.reduce((best, current) => current?.score > best.score ? current : best);
    }
    calculateConfidence(viableAgents) {
        if (viableAgents.length < 2)
            return 1.0;
        const bestScore = viableAgents[0]?.score;
        const secondBestScore = viableAgents[1]?.score;
        const advantage = ((bestScore - secondBestScore) /
            Math.max(bestScore, 0.1));
        return Math.min(1.0, Math.max(0.3, advantage + 0.5));
    }
    estimateLatency(agent, metrics, isOverloaded) {
        const baseLatency = metrics.get(agent.id)?.responseTime || 1000;
        return isOverloaded ? baseLatency * 2 : baseLatency;
    }
    estimateQuality(agent, metrics) {
        const agentMetrics = metrics.get(agent.id);
        return agentMetrics ? Math.max(0.1, 1 - agentMetrics.errorRate) : 0.8;
    }
    calculateAverageUtilization(profiles, resource) {
        if (profiles.length === 0)
            return 0;
        return (profiles.reduce((sum, p) => sum + p[resource]?.utilization, 0) /
            profiles.length);
    }
    calculateResourceEfficiency(profiles) {
        let totalUtilization = 0;
        let totalCapacity = 0;
        for (const profile of profiles) {
            totalUtilization +=
                profile.cpu.utilization +
                    profile.memory.utilization +
                    profile.disk.utilization +
                    profile.network.utilization;
            totalCapacity +=
                profile.cpu.threshold +
                    profile.memory.threshold +
                    profile.disk.threshold +
                    profile.network.threshold;
        }
        return totalCapacity > 0 ? totalUtilization / totalCapacity : 0;
    }
    countConstraintViolations(profiles) {
        let violations = 0;
        for (const profile of profiles) {
            if (profile.cpu.constraint && profile.cpu.constraint.severity !== 'low')
                violations++;
            if (profile.memory.constraint &&
                profile.memory.constraint.severity !== 'low')
                violations++;
            if (profile.disk.constraint && profile.disk.constraint.severity !== 'low')
                violations++;
            if (profile.network.constraint &&
                profile.network.constraint.severity !== 'low')
                violations++;
        }
        return violations;
    }
    async calculatePredictionAccuracy() {
        return 0.85;
    }
    updateResourceTrends(_profile, _requirements, _duration, _success) {
    }
    updateResourcePredictionModels(_profile, _requirements, _actualDuration, _success) {
    }
}
//# sourceMappingURL=resource-aware.js.map