export class AdaptiveLearningAlgorithm {
    name = 'adaptive_learning';
    strategies = new Map();
    patterns = new Map();
    decisionHistory = [];
    reinforcementHistory = [];
    config = {
        maxHistorySize: 5000,
        learningRate: 0.1,
        explorationRate: 0.2,
        explorationDecay: 0.995,
        minExplorationRate: 0.05,
        patternDetectionWindow: 100,
        strategyUpdateInterval: 1000,
        contextSimilarityThreshold: 0.8,
        reinforcementDiscountFactor: 0.9,
        strategySelectionMethod: 'epsilon_greedy',
    };
    constructor() {
        this.initializeStrategies();
    }
    async selectAgent(task, availableAgents, metrics) {
        if (availableAgents.length === 0) {
            throw new Error('No available agents');
        }
        const context = this.extractContext(task, availableAgents, metrics);
        const detectedPattern = this.detectPattern(context);
        const selectedStrategy = await this.selectStrategy(context, detectedPattern);
        const result = await this.applyStrategy(selectedStrategy, task, availableAgents, metrics, context);
        this.recordDecision(task, result, selectedStrategy, context);
        return result;
    }
    async updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        if (config?.explorationRate !== undefined) {
            this.config.explorationRate = Math.max(this.config.minExplorationRate, config?.explorationRate);
        }
    }
    async getPerformanceMetrics() {
        const strategies = Array.from(this.strategies.values());
        const totalDecisions = this.decisionHistory.length;
        const avgSuccessRate = strategies.length > 0
            ? strategies.reduce((sum, s) => sum + s.successRate, 0) /
                strategies.length
            : 0;
        const avgLatency = strategies.length > 0
            ? strategies.reduce((sum, s) => sum + s.averageLatency, 0) /
                strategies.length
            : 0;
        const mostUsedStrategy = strategies.reduce((best, current) => current?.usageCount > best.usageCount ? current : best, strategies[0] || { name: 'none', usageCount: 0 });
        return {
            totalStrategies: strategies.length,
            totalDecisions: totalDecisions,
            averageSuccessRate: avgSuccessRate,
            averageLatency: avgLatency,
            explorationRate: this.config.explorationRate,
            patternsDetected: this.patterns.size,
            mostUsedStrategy: mostUsedStrategy.usageCount,
            learningProgress: this.calculateLearningProgress(),
        };
    }
    async onTaskComplete(agentId, task, duration, success) {
        const decision = this.findRecentDecision(task.id, agentId);
        if (decision) {
            const reward = this.calculateReward(duration, success, task);
            await this.updateStrategyPerformance(decision.strategy, duration, success, reward);
            this.recordReinforcementState(decision, reward);
            this.updatePatterns(decision, success, duration);
            if (this.decisionHistory.length % this.config.strategyUpdateInterval ===
                0) {
                await this.performLearningUpdate();
            }
        }
        this.config.explorationRate = Math.max(this.config.minExplorationRate, this.config.explorationRate * this.config.explorationDecay);
    }
    async onAgentFailure(agentId, _error) {
        const recentDecisions = this.decisionHistory
            .filter((d) => d.agentId === agentId)
            .slice(-10);
        for (const decision of recentDecisions) {
            const strategy = this.strategies.get(decision.strategy);
            if (strategy) {
                const penalty = -1000;
                await this.updateStrategyPerformance(decision.strategy, 0, false, penalty);
            }
        }
    }
    initializeStrategies() {
        const initialStrategies = [
            'least_connections',
            'weighted_round_robin',
            'resource_aware',
            'response_time_based',
            'capability_matching',
            'hybrid_heuristic',
        ];
        for (const strategyName of initialStrategies) {
            this.strategies.set(strategyName, {
                name: strategyName,
                weight: 1.0,
                successRate: 0.5,
                averageLatency: 1000,
                usageCount: 0,
                lastUsed: new Date(0),
                confidence: 0.1,
            });
        }
    }
    extractContext(task, availableAgents, metrics) {
        const now = new Date();
        const totalLoad = Array.from(metrics.values()).reduce((sum, m) => sum + m.activeTasks, 0);
        return {
            timeOfDay: now.getHours(),
            dayOfWeek: now.getDay(),
            systemLoad: totalLoad / availableAgents.length,
            taskType: task.type,
            agentCount: availableAgents.length,
        };
    }
    detectPattern(context) {
        const patternKey = this.generatePatternKey(context);
        let pattern = this.patterns.get(patternKey);
        if (!pattern) {
            pattern = this.findSimilarPattern(context);
        }
        return pattern;
    }
    async selectStrategy(_context, detectedPattern) {
        if (detectedPattern && Math.random() > this.config.explorationRate) {
            return detectedPattern.optimalStrategy;
        }
        switch (this.config.strategySelectionMethod) {
            case 'epsilon_greedy':
                return this.epsilonGreedySelection();
            case 'ucb':
                return this.upperConfidenceBoundSelection();
            case 'thompson_sampling':
                return this.thompsonSamplingSelection();
            default:
                return this.epsilonGreedySelection();
        }
    }
    epsilonGreedySelection() {
        if (Math.random() < this.config.explorationRate) {
            const strategies = Array.from(this.strategies.keys());
            return strategies[Math.floor(Math.random() * strategies.length)];
        }
        let bestStrategy = '';
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const [name, strategy] of this.strategies) {
            const score = this.calculateStrategyScore(strategy);
            if (score > bestScore) {
                bestScore = score;
                bestStrategy = name;
            }
        }
        return bestStrategy || Array.from(this.strategies.keys())[0];
    }
    upperConfidenceBoundSelection() {
        const totalUsage = Array.from(this.strategies.values()).reduce((sum, s) => sum + s.usageCount, 0);
        let bestStrategy = '';
        let bestUCB = Number.NEGATIVE_INFINITY;
        for (const [name, strategy] of this.strategies) {
            if (strategy.usageCount === 0) {
                return name;
            }
            const exploitation = this.calculateStrategyScore(strategy);
            const exploration = Math.sqrt((2 * Math.log(totalUsage)) / strategy.usageCount);
            const ucbValue = exploitation + exploration;
            if (ucbValue > bestUCB) {
                bestUCB = ucbValue;
                bestStrategy = name;
            }
        }
        return bestStrategy || Array.from(this.strategies.keys())[0];
    }
    thompsonSamplingSelection() {
        let bestStrategy = '';
        let bestSample = Number.NEGATIVE_INFINITY;
        for (const [name, strategy] of this.strategies) {
            const alpha = strategy.successRate * strategy.usageCount + 1;
            const beta = (1 - strategy.successRate) * strategy.usageCount + 1;
            const sample = this.sampleBeta(alpha, beta);
            if (sample > bestSample) {
                bestSample = sample;
                bestStrategy = name;
            }
        }
        return bestStrategy || Array.from(this.strategies.keys())[0];
    }
    async applyStrategy(strategyName, task, availableAgents, metrics, _context) {
        let selectedAgent;
        let reasoning;
        switch (strategyName) {
            case 'least_connections':
                selectedAgent = this.selectByLeastConnections(availableAgents, metrics);
                reasoning = 'Selected agent with least active connections';
                break;
            case 'weighted_round_robin':
                selectedAgent = this.selectByWeightedRoundRobin(availableAgents, metrics);
                reasoning = 'Selected using weighted round robin based on performance';
                break;
            case 'resource_aware':
                selectedAgent = this.selectByResourceAwareness(availableAgents, metrics, task);
                reasoning = 'Selected based on resource availability and requirements';
                break;
            case 'response_time_based':
                selectedAgent = this.selectByResponseTime(availableAgents, metrics);
                reasoning = 'Selected agent with best average response time';
                break;
            case 'capability_matching':
                selectedAgent = this.selectByCapabilityMatch(availableAgents, task);
                reasoning = 'Selected agent with best capability match';
                break;
            default:
                selectedAgent = this.selectByHybridHeuristic(availableAgents, metrics, task);
                reasoning =
                    'Selected using hybrid heuristic combining multiple factors';
                break;
        }
        const alternatives = availableAgents
            .filter((a) => a.id !== selectedAgent?.id)
            .slice(0, 3);
        return {
            selectedAgent,
            confidence: this.strategies.get(strategyName)?.confidence || 0.5,
            reasoning: `${reasoning} (strategy: ${strategyName})`,
            alternativeAgents: alternatives,
            estimatedLatency: metrics.get(selectedAgent?.id)?.responseTime || 1000,
            expectedQuality: this.strategies.get(strategyName)?.successRate || 0.8,
        };
    }
    calculateReward(duration, success, task) {
        let reward = 0;
        reward += success ? 100 : -100;
        const targetLatency = task.estimatedDuration || 5000;
        const latencyRatio = duration / targetLatency;
        if (latencyRatio < 0.8) {
            reward += 50;
        }
        else if (latencyRatio > 1.5) {
            reward -= 50;
        }
        if (task.priority >= 4 && success) {
            reward += 25;
        }
        return reward;
    }
    async updateStrategyPerformance(strategyName, duration, success, reward) {
        const strategy = this.strategies.get(strategyName);
        if (!strategy)
            return;
        strategy.usageCount++;
        strategy.lastUsed = new Date();
        const alpha = this.config.learningRate;
        strategy.successRate =
            (1 - alpha) * strategy.successRate + alpha * (success ? 1 : 0);
        if (duration > 0) {
            strategy.averageLatency =
                (1 - alpha) * strategy.averageLatency + alpha * duration;
        }
        const weightAdjustment = (reward * this.config.learningRate) / 1000;
        strategy.weight = Math.max(0.1, strategy.weight + weightAdjustment);
        strategy.confidence = Math.min(1.0, (strategy.usageCount / 100) * strategy.successRate);
    }
    recordDecision(task, result, strategy, context) {
        const decision = {
            timestamp: new Date(),
            taskId: task.id,
            agentId: result?.selectedAgent?.id,
            strategy,
            features: {
                taskPriority: task.priority,
                timeOfDay: context.timeOfDay,
                systemLoad: context.systemLoad,
                agentCount: context.agentCount,
            },
            outcome: {
                latency: result?.estimatedLatency,
                success: true,
                quality: result?.expectedQuality,
            },
        };
        this.decisionHistory.push(decision);
        if (this.decisionHistory.length > this.config.maxHistorySize) {
            this.decisionHistory.shift();
        }
    }
    selectByLeastConnections(agents, metrics) {
        let bestAgent = agents[0];
        let minConnections = Number.POSITIVE_INFINITY;
        for (const agent of agents) {
            const agentMetrics = metrics.get(agent.id);
            const connections = agentMetrics?.activeTasks || 0;
            if (connections < minConnections) {
                minConnections = connections;
                bestAgent = agent;
            }
        }
        return bestAgent;
    }
    selectByWeightedRoundRobin(agents, metrics) {
        const weights = agents.map((agent) => {
            const agentMetrics = metrics.get(agent.id);
            const load = agentMetrics?.activeTasks || 0;
            return Math.max(0.1, 1 / (load + 1));
        });
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const random = Math.random() * totalWeight;
        let cumulative = 0;
        for (let i = 0; i < agents.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return agents[i];
            }
        }
        return agents[agents.length - 1];
    }
    selectByResourceAwareness(agents, metrics, _task) {
        let bestAgent = agents[0];
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const agent of agents) {
            const agentMetrics = metrics.get(agent.id);
            if (!agentMetrics)
                continue;
            const score = (1 - agentMetrics.cpuUsage) * 0.3 +
                (1 - agentMetrics.memoryUsage) * 0.3 +
                (1 - agentMetrics.errorRate) * 0.4;
            if (score > bestScore) {
                bestScore = score;
                bestAgent = agent;
            }
        }
        return bestAgent;
    }
    selectByResponseTime(agents, metrics) {
        let bestAgent = agents[0];
        let bestTime = Number.POSITIVE_INFINITY;
        for (const agent of agents) {
            const agentMetrics = metrics.get(agent.id);
            const responseTime = agentMetrics?.responseTime || Number.POSITIVE_INFINITY;
            if (responseTime < bestTime) {
                bestTime = responseTime;
                bestAgent = agent;
            }
        }
        return bestAgent;
    }
    selectByCapabilityMatch(agents, task) {
        let bestAgent = agents[0];
        let bestMatch = 0;
        for (const agent of agents) {
            const matchCount = task.requiredCapabilities.filter((cap) => agent.capabilities.includes(cap)).length;
            const matchRatio = task.requiredCapabilities.length > 0
                ? matchCount / task.requiredCapabilities.length
                : 1;
            if (matchRatio > bestMatch) {
                bestMatch = matchRatio;
                bestAgent = agent;
            }
        }
        return bestAgent;
    }
    selectByHybridHeuristic(agents, metrics, task) {
        let bestAgent = agents[0];
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const agent of agents) {
            const agentMetrics = metrics.get(agent.id);
            if (!agentMetrics)
                continue;
            const capabilityScore = task.requiredCapabilities.length > 0
                ? task.requiredCapabilities.filter((cap) => agent.capabilities.includes(cap)).length / task.requiredCapabilities.length
                : 1;
            const performanceScore = (1 - agentMetrics.cpuUsage) * 0.25 +
                (1 - agentMetrics.memoryUsage) * 0.25 +
                (1 - agentMetrics.errorRate) * 0.3 +
                (1 - Math.min(1, agentMetrics.activeTasks / 10)) * 0.2;
            const totalScore = capabilityScore * 0.4 + performanceScore * 0.6;
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestAgent = agent;
            }
        }
        return bestAgent;
    }
    calculateStrategyScore(strategy) {
        const latencyScore = Math.max(0, 1 - strategy.averageLatency / 10000);
        return strategy.successRate * 0.7 + latencyScore * 0.3;
    }
    sampleBeta(_alpha, _beta) {
        return Math.random();
    }
    generatePatternKey(context) {
        const timeSlot = Math.floor(context.timeOfDay / 4);
        const loadLevel = Math.floor(context.systemLoad / 2);
        return `${timeSlot}_${context.dayOfWeek}_${loadLevel}_${context.taskType}_${context.agentCount}`;
    }
    findSimilarPattern(context) {
        let bestMatch = null;
        let bestSimilarity = 0;
        for (const pattern of this.patterns.values()) {
            const similarity = this.calculateContextSimilarity(context, pattern.contexts[0]);
            if (similarity > bestSimilarity &&
                similarity >= this.config.contextSimilarityThreshold) {
                bestSimilarity = similarity;
                bestMatch = pattern;
            }
        }
        return bestMatch;
    }
    calculateContextSimilarity(context1, context2) {
        const timeSimilarity = 1 - Math.abs(context1.timeOfDay - context2.timeOfDay) / 24;
        const loadSimilarity = 1 -
            Math.abs(context1.systemLoad - context2.systemLoad) /
                Math.max(context1.systemLoad, context2.systemLoad, 1);
        const typeSimilarity = context1.taskType === context2.taskType ? 1 : 0;
        const agentSimilarity = 1 -
            Math.abs(context1.agentCount - context2.agentCount) /
                Math.max(context1.agentCount, context2.agentCount, 1);
        return ((timeSimilarity + loadSimilarity + typeSimilarity + agentSimilarity) / 4);
    }
    findRecentDecision(taskId, agentId) {
        return this.decisionHistory
            .reverse()
            .find((d) => d.taskId === taskId && d.agentId === agentId);
    }
    recordReinforcementState(decision, reward) {
        const state = {
            state: this.encodeState(decision.features),
            action: decision.strategy,
            reward,
            timestamp: new Date(),
        };
        this.reinforcementHistory.push(state);
        if (this.reinforcementHistory.length > this.config.maxHistorySize) {
            this.reinforcementHistory.shift();
        }
    }
    encodeState(features) {
        return Object.entries(features)
            .map(([key, value]) => `${key}:${Math.floor(value * 10)}`)
            .join('|');
    }
    updatePatterns(decision, success, _duration) {
        const context = {
            timeOfDay: decision.features.timeOfDay,
            dayOfWeek: new Date(decision.timestamp).getDay(),
            systemLoad: decision.features.systemLoad,
            taskType: decision.taskId.split('_')[0],
            agentCount: decision.features.agentCount,
        };
        const patternKey = this.generatePatternKey(context);
        let pattern = this.patterns.get(patternKey);
        if (!pattern) {
            pattern = {
                pattern: patternKey,
                frequency: 0,
                successRate: 0,
                optimalStrategy: decision.strategy,
                contexts: [context],
                lastSeen: new Date(),
            };
            this.patterns.set(patternKey, pattern);
        }
        pattern.frequency++;
        pattern.successRate =
            (pattern.successRate * (pattern.frequency - 1) + (success ? 1 : 0)) /
                pattern.frequency;
        pattern.lastSeen = new Date();
        const currentStrategyScore = this.strategies.get(decision.strategy)?.successRate || 0;
        const optimalStrategyScore = this.strategies.get(pattern.optimalStrategy)?.successRate || 0;
        if (currentStrategyScore > optimalStrategyScore) {
            pattern.optimalStrategy = decision.strategy;
        }
    }
    async performLearningUpdate() {
        const recentDecisions = this.decisionHistory.slice(-this.config.strategyUpdateInterval);
        const strategyPerformance = new Map();
        for (const decision of recentDecisions) {
            const perf = strategyPerformance.get(decision.strategy) || {
                successes: 0,
                total: 0,
            };
            perf.total++;
            if (decision.outcome.success) {
                perf.successes++;
            }
            strategyPerformance.set(decision.strategy, perf);
        }
        for (const [strategyName, perf] of strategyPerformance) {
            const strategy = this.strategies.get(strategyName);
            if (strategy && perf.total > 0) {
                const recentSuccessRate = perf.successes / perf.total;
                strategy.successRate =
                    strategy.successRate * 0.8 + recentSuccessRate * 0.2;
            }
        }
    }
    calculateLearningProgress() {
        const strategies = Array.from(this.strategies.values());
        const avgConfidence = strategies.reduce((sum, s) => sum + s.confidence, 0) / strategies.length;
        const patternsLearned = this.patterns.size / 100;
        return Math.min(1.0, (avgConfidence + patternsLearned) / 2);
    }
}
//# sourceMappingURL=adaptive-learning.js.map