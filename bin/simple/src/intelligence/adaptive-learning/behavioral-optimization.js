import { EventEmitter } from 'node:events';
export class BehavioralOptimization extends EventEmitter {
    agentBehaviors = new Map();
    optimizationStrategies = new Map();
    behaviorClusters = new Map();
    optimizationHistory = [];
    config;
    constructor(config = {}) {
        super();
        this.config = {
            optimizationInterval: 600000,
            maxBehaviors: 1000,
            convergenceThreshold: 0.01,
            maxIterations: 100,
            mutationRate: 0.1,
            crossoverRate: 0.8,
            populationSize: 50,
            elitismRate: 0.2,
            ...config,
        };
        this.initializeOptimizationStrategies();
        this.startContinuousOptimization();
    }
    registerAgentBehavior(agentId, initialBehavior) {
        const behavior = {
            agentId,
            type: 'adaptive_agent',
            version: '1.0.0',
            parameters: this.createDefaultBehaviorParameters(initialBehavior),
            performance: this.createDefaultPerformance(),
            adaptations: [],
            lastUpdated: Date.now(),
        };
        this.agentBehaviors.set(agentId, behavior);
        this.emit('behavior_registered', { agentId, behavior });
        return agentId;
    }
    async optimizeAgentBehavior(agentId, patterns, strategy = 'genetic') {
        const currentBehavior = this.agentBehaviors.get(agentId);
        if (!currentBehavior) {
            throw new Error(`Agent behavior ${agentId} not found`);
        }
        const optimizationStrategy = this.optimizationStrategies.get(strategy);
        if (!optimizationStrategy) {
            throw new Error(`Optimization strategy ${strategy} not found`);
        }
        this.emit('optimization_started', { agentId, strategy });
        const startTime = Date.now();
        let optimizedBehavior;
        switch (optimizationStrategy.type) {
            case 'genetic':
                optimizedBehavior = await this.geneticOptimization(currentBehavior, patterns);
                break;
            case 'gradient_descent':
                optimizedBehavior = await this.gradientDescentOptimization(currentBehavior, patterns);
                break;
            case 'simulated_annealing':
                optimizedBehavior = await this.simulatedAnnealingOptimization(currentBehavior, patterns);
                break;
            case 'bayesian':
                optimizedBehavior = await this.bayesianOptimization(currentBehavior, patterns);
                break;
            case 'reinforcement':
                optimizedBehavior = await this.reinforcementOptimization(currentBehavior, patterns);
                break;
            default:
                throw new Error(`Unsupported optimization type: ${optimizationStrategy.type}`);
        }
        const improvement = this.calculateImprovement(currentBehavior, optimizedBehavior);
        const convergenceTime = Date.now() - startTime;
        const result = {
            strategyId: strategy,
            agentId,
            originalBehavior: { ...currentBehavior },
            optimizedBehavior,
            improvement,
            convergenceTime,
            iterations: this.config.maxIterations || 100,
        };
        if (improvement > 0.05) {
            this.agentBehaviors.set(agentId, optimizedBehavior);
            this.recordAdaptation(agentId, {
                type: 'optimization',
                description: `Applied ${strategy} optimization with ${(improvement * 100).toFixed(1)}% improvement`,
                parameters: { strategy, improvement },
                impact: {
                    performanceChange: improvement,
                    efficiencyGain: improvement * 0.8,
                    stabilityEffect: 0,
                    collaborationImprovement: improvement * 0.3,
                },
                success: true,
            });
        }
        this.optimizationHistory.push(result);
        this.emit('optimization_completed', result);
        return result;
    }
    async refineTaskAllocation(swarmId, patterns) {
        const taskPatterns = patterns.filter((p) => p.type === 'task_completion');
        const successfulPatterns = taskPatterns.filter((p) => p.metadata?.success === true);
        const allocationStrategy = {
            id: `allocation_${swarmId}_${Date.now()}`,
            swarmId,
            rules: [],
            weightings: {},
            constraints: {},
            performance: 0,
        };
        const taskTypes = new Set(successfulPatterns
            .map((p) => p.metadata?.taskType)
            .filter(Boolean));
        taskTypes.forEach((taskType) => {
            const typePatterns = successfulPatterns.filter((p) => p.metadata?.taskType === taskType);
            const avgPerformance = typePatterns.reduce((sum, p) => sum + p.confidence, 0) /
                typePatterns.length;
            allocationStrategy.rules.push({
                condition: `taskType === '${taskType}'`,
                action: 'assign_to_specialist',
                priority: avgPerformance,
                agentCriteria: this.extractAgentCriteria(typePatterns),
            });
            allocationStrategy.weightings[taskType] = avgPerformance;
        });
        const resourcePatterns = patterns.filter((p) => p.type === 'resource_utilization');
        allocationStrategy.constraints =
            this.extractResourceConstraints(resourcePatterns);
        this.emit('task_allocation_refined', allocationStrategy);
        return allocationStrategy;
    }
    async optimizeCommunicationProtocols(swarmId, patterns) {
        const commPatterns = patterns.filter((p) => p.type === 'communication');
        const optimization = {
            swarmId,
            protocols: [],
            frequencies: {},
            messageTypes: {},
            networkTopology: 'mesh',
            latencyTargets: {},
            throughputTargets: {},
        };
        const effectiveComms = commPatterns.filter((p) => p.metadata?.effective === true);
        const avgLatency = effectiveComms.reduce((sum, p) => sum + (p.metadata?.latency || 0), 0) / effectiveComms.length;
        optimization.frequencies = this.calculateOptimalFrequencies(effectiveComms);
        optimization.messageTypes = this.classifyMessageTypes(effectiveComms);
        optimization.latencyTargets = { default: avgLatency * 0.8 };
        optimization.networkTopology = this.determineOptimalTopology(commPatterns);
        this.emit('communication_optimized', optimization);
        return optimization;
    }
    async optimizeResourceAllocation(patterns) {
        const resourcePatterns = patterns.filter((p) => p.type === 'resource_utilization');
        const strategy = {
            id: `resource_strategy_${Date.now()}`,
            allocations: {},
            thresholds: {},
            scalingRules: [],
            priorities: {},
            constraints: {},
        };
        const resourceTypes = new Set(resourcePatterns
            .map((p) => p.metadata?.resourceType)
            .filter(Boolean));
        resourceTypes.forEach((resourceType) => {
            const typePatterns = resourcePatterns.filter((p) => p.metadata?.resourceType === resourceType);
            const avgUtilization = typePatterns.reduce((sum, p) => sum + (p.metadata?.utilization || 0), 0) / typePatterns.length;
            const peakUtilization = Math.max(...typePatterns.map((p) => p.metadata?.utilization || 0));
            strategy.allocations[resourceType] = avgUtilization * 1.2;
            strategy.thresholds[resourceType] = {
                warning: peakUtilization * 0.8,
                critical: peakUtilization * 0.95,
            };
            strategy.scalingRules.push({
                resource: resourceType,
                condition: `utilization > ${peakUtilization * 0.8}`,
                action: 'scale_up',
                factor: 1.5,
            });
        });
        this.emit('resource_allocation_optimized', strategy);
        return strategy;
    }
    async adaptCoordinationStrategies(swarmId, patterns) {
        const coordPatterns = patterns.filter((p) => p.type === 'coordination');
        const strategy = {
            swarmId,
            leadershipModel: 'adaptive',
            decisionMaking: 'consensus',
            conflictResolution: 'mediation',
            synchronization: {},
            coordination: {},
            adaptation: {},
        };
        const effectiveCoordination = coordPatterns.filter((p) => p.metadata?.effective === true);
        if (effectiveCoordination.length > 0) {
            const leadershipStyles = effectiveCoordination
                .map((p) => p.metadata?.leadershipStyle)
                .filter(Boolean);
            strategy.leadershipModel =
                this.getMostFrequent(leadershipStyles) || 'democratic';
            const decisionTimes = effectiveCoordination
                .map((p) => p.metadata?.decisionTime)
                .filter(Boolean);
            const avgDecisionTime = decisionTimes.reduce((sum, time) => sum + time, 0) /
                decisionTimes.length;
            strategy.synchronization = {
                frequency: this.calculateOptimalSyncFrequency(effectiveCoordination),
                timeout: avgDecisionTime * 1.5,
            };
        }
        this.emit('coordination_adapted', strategy);
        return strategy;
    }
    clusterBehaviors() {
        const behaviors = Array.from(this.agentBehaviors.values());
        const clusters = [];
        const visited = new Set();
        for (const behavior of behaviors) {
            if (visited.has(behavior.agentId))
                continue;
            const cluster = this.createBehaviorCluster(behavior, behaviors, visited);
            if (cluster.behaviors.length >= 3) {
                clusters.push(cluster);
            }
        }
        clusters.forEach((cluster) => {
            this.behaviorClusters.set(cluster.id, cluster);
        });
        return clusters;
    }
    getOptimizationRecommendations() {
        const recommendations = [];
        this.agentBehaviors.forEach((behavior) => {
            if (behavior.performance.efficiency < 0.7) {
                recommendations.push({
                    type: 'performance_improvement',
                    agentId: behavior.agentId,
                    priority: 'high',
                    description: 'Agent showing low efficiency, needs optimization',
                    suggestedStrategy: 'genetic',
                    expectedImprovement: 0.3,
                });
            }
            if (behavior.performance.errorRate > 0.1) {
                recommendations.push({
                    type: 'error_reduction',
                    agentId: behavior.agentId,
                    priority: 'high',
                    description: 'Agent has high error rate, needs parameter adjustment',
                    suggestedStrategy: 'gradient_descent',
                    expectedImprovement: 0.2,
                });
            }
            if (behavior.performance.resourceUtilization > 0.9) {
                recommendations.push({
                    type: 'resource_optimization',
                    agentId: behavior.agentId,
                    priority: 'medium',
                    description: 'Agent using too many resources, needs resource management optimization',
                    suggestedStrategy: 'simulated_annealing',
                    expectedImprovement: 0.15,
                });
            }
            if (Date.now() - behavior.lastUpdated > 86400000) {
                recommendations.push({
                    type: 'behavior_refresh',
                    agentId: behavior.agentId,
                    priority: 'low',
                    description: 'Agent behavior not updated recently, consider optimization',
                    suggestedStrategy: 'bayesian',
                    expectedImprovement: 0.1,
                });
            }
        });
        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    async applyBehaviorAdaptation(agentId, adaptationType, parameters) {
        const behavior = this.agentBehaviors.get(agentId);
        if (!behavior) {
            throw new Error(`Agent behavior ${agentId} not found`);
        }
        const originalPerformance = { ...behavior.performance };
        switch (adaptationType) {
            case 'learning_rate_adjustment':
                behavior.parameters.learning.adaptationRate = parameters['newRate'];
                break;
            case 'task_specialization':
                behavior.parameters.taskSelection.specialization =
                    parameters['specializations'];
                break;
            case 'communication_frequency':
                behavior.parameters.communication.frequency = parameters['frequency'];
                break;
            case 'resource_limits':
                behavior.parameters.resourceManagement = {
                    ...behavior.parameters.resourceManagement,
                    ...parameters,
                };
                break;
            case 'coordination_style':
                behavior.parameters.coordination.leadershipStyle = parameters['style'];
                break;
        }
        behavior.lastUpdated = Date.now();
        const performanceChange = behavior.performance.efficiency - originalPerformance.efficiency;
        const successRate = (behavior.performance.success_rate || 0) -
            (originalPerformance.success_rate || 0);
        this.recordAdaptation(agentId, {
            type: 'parameter_adjustment',
            description: `Applied ${adaptationType} adaptation`,
            parameters,
            impact: {
                performanceChange: performanceChange,
                efficiencyGain: successRate,
                stabilityEffect: (behavior.performance.response_time || 0) -
                    (originalPerformance.response_time || 0),
                collaborationImprovement: (behavior.performance.collaboration_score || 0) -
                    (originalPerformance.collaboration_score || 0),
            },
            success: performanceChange >= 0,
            originalPerformance,
            newPerformance: { ...behavior.performance },
        });
        this.emit('behavior_adapted', { agentId, adaptationType, parameters });
    }
    async geneticOptimization(behavior, patterns) {
        const population = this.createPopulation(behavior, this.config.populationSize || 50);
        for (let generation = 0; generation < (this.config.maxIterations || 100); generation++) {
            const fitness = population.map((individual) => this.evaluateFitness(individual, patterns));
            const parents = this.selectParents(population, fitness);
            const offspring = this.crossover(parents);
            this.mutate(offspring);
            population.splice(0, population.length, ...this.selectSurvivors(population, offspring, fitness));
            const bestFitness = Math.max(...fitness);
            if (generation > 0 &&
                Math.abs(bestFitness - (fitness[0] || 0)) <
                    (this.config.convergenceThreshold || 0.01)) {
                break;
            }
        }
        const finalFitness = population.map((individual) => this.evaluateFitness(individual, patterns));
        const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
        return population[bestIndex] || behavior;
    }
    async gradientDescentOptimization(behavior, patterns) {
        let currentBehavior = { ...behavior };
        const learningRate = 0.01;
        for (let iteration = 0; iteration < (this.config.maxIterations || 100); iteration++) {
            const currentFitness = this.evaluateFitness(currentBehavior, patterns);
            const gradients = this.calculateGradients(currentBehavior, patterns);
            currentBehavior = this.applyGradients(currentBehavior, gradients, learningRate);
            const newFitness = this.evaluateFitness(currentBehavior, patterns);
            if (Math.abs(newFitness - currentFitness) <
                (this.config.convergenceThreshold || 0.01)) {
                break;
            }
        }
        return currentBehavior;
    }
    async simulatedAnnealingOptimization(behavior, patterns) {
        let currentBehavior = { ...behavior };
        let bestBehavior = { ...behavior };
        let currentFitness = this.evaluateFitness(currentBehavior, patterns);
        let bestFitness = currentFitness;
        const initialTemperature = 100;
        const coolingRate = 0.95;
        let temperature = initialTemperature;
        for (let iteration = 0; iteration < (this.config.maxIterations || 100); iteration++) {
            const neighborBehavior = this.generateNeighbor(currentBehavior);
            const neighborFitness = this.evaluateFitness(neighborBehavior, patterns);
            const deltaFitness = neighborFitness - currentFitness;
            const acceptanceProbability = deltaFitness > 0 ? 1 : Math.exp(deltaFitness / temperature);
            if (Math.random() < acceptanceProbability) {
                currentBehavior = neighborBehavior;
                currentFitness = neighborFitness;
                if (currentFitness > bestFitness) {
                    bestBehavior = { ...currentBehavior };
                    bestFitness = currentFitness;
                }
            }
            temperature *= coolingRate;
            if (temperature < 0.01)
                break;
        }
        return bestBehavior;
    }
    async bayesianOptimization(behavior, patterns) {
        const candidates = [];
        const evaluations = [];
        for (let i = 0; i < 20; i++) {
            const candidate = this.generateRandomBehavior(behavior);
            candidates.push(candidate);
            evaluations.push(this.evaluateFitness(candidate, patterns));
        }
        for (let iteration = 0; iteration < (this.config.maxIterations || 100) / 5; iteration++) {
            const nextCandidate = this.selectNextCandidate(candidates, evaluations, behavior);
            const nextEvaluation = this.evaluateFitness(nextCandidate, patterns);
            candidates.push(nextCandidate);
            evaluations.push(nextEvaluation);
        }
        const bestIndex = evaluations.indexOf(Math.max(...evaluations));
        return candidates[bestIndex] || behavior;
    }
    async reinforcementOptimization(behavior, patterns) {
        const stateActionValues = new Map();
        let currentBehavior = { ...behavior };
        for (let episode = 0; episode < (this.config.maxIterations || 100) / 10; episode++) {
            const state = this.behaviorToState(currentBehavior);
            const actions = this.generatePossibleActions(currentBehavior);
            const action = this.selectAction(state, actions, stateActionValues);
            const newBehavior = this.applyAction(currentBehavior, action);
            const reward = this.evaluateFitness(newBehavior, patterns) -
                this.evaluateFitness(currentBehavior, patterns);
            const stateActionKey = `${state}_${action.id}`;
            const currentQ = stateActionValues.get(stateActionKey) || 0;
            const newQ = currentQ +
                0.1 *
                    (reward +
                        0.9 *
                            this.getMaxQValue(this.behaviorToState(newBehavior), stateActionValues) -
                        currentQ);
            stateActionValues.set(stateActionKey, newQ);
            currentBehavior = newBehavior;
        }
        return currentBehavior;
    }
    createPopulation(baseBehavior, size) {
        const population = [];
        for (let i = 0; i < size; i++) {
            population.push(this.generateRandomBehavior(baseBehavior));
        }
        return population;
    }
    generateRandomBehavior(baseBehavior) {
        const mutatedBehavior = JSON.parse(JSON.stringify(baseBehavior));
        mutatedBehavior.parameters.taskSelection.preferredComplexity +=
            (Math.random() - 0.5) * 0.2;
        mutatedBehavior.parameters.taskSelection.riskTolerance +=
            (Math.random() - 0.5) * 0.2;
        mutatedBehavior.parameters.communication.frequency +=
            (Math.random() - 0.5) * 0.2;
        mutatedBehavior.parameters.resourceManagement.memoryLimit +=
            (Math.random() - 0.5) * 100;
        mutatedBehavior.parameters.learning.adaptationRate +=
            (Math.random() - 0.5) * 0.1;
        mutatedBehavior.parameters.taskSelection.preferredComplexity = Math.max(0, Math.min(1, mutatedBehavior.parameters.taskSelection.preferredComplexity));
        mutatedBehavior.parameters.taskSelection.riskTolerance = Math.max(0, Math.min(1, mutatedBehavior.parameters.taskSelection.riskTolerance));
        mutatedBehavior.parameters.communication.frequency = Math.max(0, Math.min(1, mutatedBehavior.parameters.communication.frequency));
        mutatedBehavior.parameters.learning.adaptationRate = Math.max(0.001, Math.min(0.5, mutatedBehavior.parameters.learning.adaptationRate));
        return mutatedBehavior;
    }
    evaluateFitness(behavior, patterns) {
        let fitness = 0;
        fitness += behavior.performance.efficiency * 0.3;
        fitness += behavior.performance.accuracy * 0.25;
        fitness += behavior.performance.reliability * 0.2;
        fitness += behavior.performance.collaboration * 0.15;
        fitness += behavior.performance.adaptability * 0.1;
        const relevantPatterns = patterns.filter((p) => p.agentId === behavior.agentId);
        if (relevantPatterns.length > 0) {
            const avgConfidence = relevantPatterns.reduce((sum, p) => sum + p.confidence, 0) /
                relevantPatterns.length;
            fitness += avgConfidence * 0.2;
        }
        const extremePenalty = this.calculateExtremePenalty(behavior);
        fitness -= extremePenalty;
        return Math.max(0, Math.min(1, fitness));
    }
    calculateExtremePenalty(behavior) {
        let penalty = 0;
        if (behavior.parameters.learning.adaptationRate > 0.3)
            penalty += 0.1;
        if (behavior.parameters.learning.adaptationRate < 0.005)
            penalty += 0.1;
        if (behavior.parameters.communication.frequency > 0.9)
            penalty += 0.05;
        if (behavior.parameters.taskSelection.riskTolerance > 0.9)
            penalty += 0.05;
        return penalty;
    }
    selectParents(population, fitness) {
        const parents = [];
        const tournamentSize = 3;
        for (let i = 0; i < population.length; i++) {
            let bestIndex = Math.floor(Math.random() * population.length);
            let bestFitness = fitness[bestIndex];
            for (let j = 1; j < tournamentSize; j++) {
                const candidateIndex = Math.floor(Math.random() * population.length);
                if ((fitness[candidateIndex] || 0) > (bestFitness || 0)) {
                    bestIndex = candidateIndex;
                    bestFitness = fitness[candidateIndex] || 0;
                }
            }
            const selectedParent = population[bestIndex];
            if (selectedParent) {
                parents.push(selectedParent);
            }
        }
        return parents;
    }
    crossover(parents) {
        const offspring = [];
        for (let i = 0; i < parents.length - 1; i += 2) {
            const parent1 = parents?.[i];
            const parent2 = parents?.[i + 1];
            if (parent1 &&
                parent2 &&
                Math.random() < (this.config.crossoverRate || 0.8)) {
                const child1 = this.createChild(parent1, parent2);
                const child2 = this.createChild(parent2, parent1);
                offspring.push(child1, child2);
            }
            else {
                if (parent1)
                    offspring.push({ ...parent1 });
                if (parent2)
                    offspring.push({ ...parent2 });
            }
        }
        return offspring;
    }
    createChild(parent1, parent2) {
        const child = JSON.parse(JSON.stringify(parent1));
        if (Math.random() < 0.5 && child?.parameters && parent2?.parameters)
            child.parameters.taskSelection = { ...parent2.parameters.taskSelection };
        if (Math.random() < 0.5 && child?.parameters && parent2?.parameters)
            child.parameters.communication = { ...parent2.parameters.communication };
        if (Math.random() < 0.5 && child?.parameters && parent2?.parameters)
            child.parameters.resourceManagement = {
                ...parent2.parameters.resourceManagement,
            };
        if (Math.random() < 0.5 && child?.parameters && parent2?.parameters)
            child.parameters.coordination = { ...parent2.parameters.coordination };
        if (Math.random() < 0.5 && child?.parameters && parent2?.parameters)
            child.parameters.learning = { ...parent2.parameters.learning };
        return child;
    }
    mutate(population) {
        population.forEach((individual) => {
            if (Math.random() < (this.config.mutationRate || 0.1)) {
                const mutations = [
                    () => (individual.parameters.taskSelection.preferredComplexity +=
                        (Math.random() - 0.5) * 0.1),
                    () => (individual.parameters.taskSelection.riskTolerance +=
                        (Math.random() - 0.5) * 0.1),
                    () => (individual.parameters.communication.frequency +=
                        (Math.random() - 0.5) * 0.1),
                    () => (individual.parameters.learning.adaptationRate +=
                        (Math.random() - 0.5) * 0.05),
                    () => (individual.parameters.resourceManagement.memoryLimit +=
                        (Math.random() - 0.5) * 50),
                ];
                const randomMutation = mutations[Math.floor(Math.random() * mutations.length)];
                if (randomMutation) {
                    randomMutation();
                }
                individual.parameters.taskSelection.preferredComplexity = Math.max(0, Math.min(1, individual.parameters.taskSelection.preferredComplexity));
                individual.parameters.taskSelection.riskTolerance = Math.max(0, Math.min(1, individual.parameters.taskSelection.riskTolerance));
                individual.parameters.communication.frequency = Math.max(0, Math.min(1, individual.parameters.communication.frequency));
                individual.parameters.learning.adaptationRate = Math.max(0.001, Math.min(0.5, individual.parameters.learning.adaptationRate));
            }
        });
    }
    selectSurvivors(parents, offspring, parentFitness) {
        const combined = [...parents, ...offspring];
        const combinedFitness = [
            ...parentFitness,
            ...offspring.map((individual) => this.evaluateFitness(individual, [])),
        ];
        const indexed = combined.map((individual, index) => ({
            individual,
            fitness: combinedFitness[index] || 0,
        }));
        indexed.sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
        return indexed.slice(0, parents.length).map((item) => item?.individual);
    }
    calculateGradients(behavior, patterns) {
        const gradients = {};
        const epsilon = 0.001;
        const baseFitness = this.evaluateFitness(behavior, patterns);
        const parameters = [
            'taskSelection.preferredComplexity',
            'taskSelection.riskTolerance',
            'communication.frequency',
            'learning.adaptationRate',
        ];
        parameters.forEach((param) => {
            const modifiedBehavior = JSON.parse(JSON.stringify(behavior));
            this.setNestedProperty(modifiedBehavior.parameters, param, this.getNestedProperty(modifiedBehavior.parameters, param) + epsilon);
            const modifiedFitness = this.evaluateFitness(modifiedBehavior, patterns);
            gradients[param] = (modifiedFitness - baseFitness) / epsilon;
        });
        return gradients;
    }
    applyGradients(behavior, gradients, learningRate) {
        const updatedBehavior = JSON.parse(JSON.stringify(behavior));
        Object.entries(gradients).forEach(([param, gradient]) => {
            const currentValue = this.getNestedProperty(updatedBehavior.parameters, param);
            const newValue = currentValue + learningRate * gradient;
            this.setNestedProperty(updatedBehavior.parameters, param, newValue);
        });
        this.clampBehaviorParameters(updatedBehavior);
        return updatedBehavior;
    }
    generateNeighbor(behavior) {
        const neighbor = JSON.parse(JSON.stringify(behavior));
        const changeAmount = 0.05;
        neighbor.parameters.taskSelection.preferredComplexity +=
            (Math.random() - 0.5) * changeAmount;
        neighbor.parameters.taskSelection.riskTolerance +=
            (Math.random() - 0.5) * changeAmount;
        neighbor.parameters.communication.frequency +=
            (Math.random() - 0.5) * changeAmount;
        neighbor.parameters.learning.adaptationRate +=
            (Math.random() - 0.5) * changeAmount * 0.5;
        this.clampBehaviorParameters(neighbor);
        return neighbor;
    }
    selectNextCandidate(candidates, evaluations, baseBehavior) {
        const explorationCandidates = [];
        for (let i = 0; i < 10; i++) {
            const candidate = this.generateRandomBehavior(baseBehavior);
            const uncertainty = this.calculateUncertainty(candidate, candidates);
            const expectedImprovement = this.calculateExpectedImprovement(candidate, evaluations);
            const acquisitionValue = expectedImprovement + 0.1 * uncertainty;
            explorationCandidates.push({ candidate, acquisitionValue });
        }
        explorationCandidates.sort((a, b) => (b.acquisitionValue || 0) - (a.acquisitionValue || 0));
        return explorationCandidates[0]?.candidate || baseBehavior;
    }
    calculateUncertainty(candidate, existingCandidates) {
        if (existingCandidates.length === 0)
            return 1;
        const distances = existingCandidates.map((existing) => this.calculateBehaviorDistance(candidate, existing));
        return Math.min(...distances);
    }
    calculateExpectedImprovement(_candidate, evaluations) {
        if (evaluations.length === 0)
            return 0.5;
        const maxEvaluation = Math.max(...evaluations);
        const predictedValue = Math.random() * 0.5 + 0.25;
        return Math.max(0, predictedValue - maxEvaluation);
    }
    behaviorToState(behavior) {
        return `${behavior.parameters.taskSelection.preferredComplexity.toFixed(2)}_${behavior.parameters.taskSelection.riskTolerance.toFixed(2)}_${behavior.parameters.communication.frequency.toFixed(2)}`;
    }
    generatePossibleActions(_behavior) {
        const actions = [];
        const adjustments = [-0.1, -0.05, 0.05, 0.1];
        adjustments.forEach((adj) => {
            actions.push({
                id: `adjust_complexity_${adj}`,
                type: 'adjust_parameter',
                parameter: 'taskSelection.preferredComplexity',
                value: adj,
            });
            actions.push({
                id: `adjust_risk_${adj}`,
                type: 'adjust_parameter',
                parameter: 'taskSelection.riskTolerance',
                value: adj,
            });
        });
        return actions;
    }
    selectAction(state, actions, stateActionValues) {
        const epsilon = 0.1;
        if (Math.random() < epsilon) {
            const randomIndex = Math.floor(Math.random() * actions.length);
            return actions[randomIndex] || actions[0];
        }
        let bestAction = actions[0];
        let bestValue = stateActionValues.get(`${state}_${bestAction?.id}`) || 0;
        actions.forEach((action) => {
            const value = stateActionValues.get(`${state}_${action.id}`) || 0;
            if (value > bestValue) {
                bestValue = value;
                bestAction = action;
            }
        });
        return (bestAction || actions[0]);
    }
    applyAction(behavior, action) {
        const newBehavior = JSON.parse(JSON.stringify(behavior));
        if (action.type === 'adjust_parameter') {
            const currentValue = this.getNestedProperty(newBehavior.parameters, action.parameter);
            this.setNestedProperty(newBehavior.parameters, action.parameter, currentValue + action.value);
        }
        this.clampBehaviorParameters(newBehavior);
        return newBehavior;
    }
    getMaxQValue(state, stateActionValues) {
        const stateKeys = Array.from(stateActionValues.keys()).filter((key) => key.startsWith(state));
        if (stateKeys.length === 0)
            return 0;
        const values = stateKeys.map((key) => stateActionValues.get(key) || 0);
        return Math.max(...values);
    }
    createDefaultBehaviorParameters(initial) {
        return {
            taskSelection: {
                preferredComplexity: 0.5,
                riskTolerance: 0.3,
                specialization: [],
                priorityWeights: { urgent: 0.8, important: 0.6, routine: 0.2 },
                loadBalancing: 0.5,
                ...initial?.taskSelection,
            },
            communication: {
                frequency: 0.5,
                verbosity: 0.3,
                protocols: ['direct', 'broadcast'],
                broadcastThreshold: 0.7,
                responseTimeout: 5000,
                ...initial?.communication,
            },
            resourceManagement: {
                memoryLimit: 512,
                cpuThreshold: 0.8,
                storageQuota: 1024,
                networkBandwidth: 100,
                resourceSharing: true,
                ...initial?.resourceManagement,
            },
            coordination: {
                leadershipStyle: 'democratic',
                consensusThreshold: 0.6,
                conflictResolution: 'mediation',
                collaborationLevel: 0.7,
                autonomyLevel: 0.5,
                ...initial?.coordination,
            },
            learning: {
                adaptationRate: 0.1,
                explorationRate: 0.2,
                memoryRetention: 0.8,
                transferLearning: true,
                continuousImprovement: true,
                ...initial?.learning,
            },
        };
    }
    createDefaultPerformance() {
        return {
            efficiency: 0.5,
            accuracy: 0.5,
            reliability: 0.5,
            collaboration: 0.5,
            adaptability: 0.5,
            resourceUtilization: 0.5,
            taskCompletionRate: 0.5,
            errorRate: 0.1,
        };
    }
    recordAdaptation(agentId, adaptationData) {
        const behavior = this.agentBehaviors.get(agentId);
        if (!behavior)
            return;
        const adaptation = {
            id: `adaptation_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            timestamp: Date.now(),
            ...adaptationData,
        };
        behavior.adaptations.push(adaptation);
        if (behavior.adaptations.length > 50) {
            behavior.adaptations = behavior.adaptations.slice(-50);
        }
        this.emit('adaptation_recorded', { agentId, adaptation });
    }
    calculateImprovement(original, optimized) {
        const originalScore = this.calculateOverallPerformance(original);
        const optimizedScore = this.calculateOverallPerformance(optimized);
        return optimizedScore - originalScore;
    }
    calculateOverallPerformance(behavior) {
        const perf = behavior.performance;
        return ((perf.efficiency +
            perf.accuracy +
            perf.reliability +
            perf.collaboration +
            perf.adaptability) /
            5);
    }
    extractAgentCriteria(patterns) {
        const criteria = {};
        const successfulAgents = patterns
            .filter((p) => p.metadata?.success)
            .map((p) => p.agentId);
        const uniqueAgents = [...new Set(successfulAgents)];
        if (uniqueAgents.length > 0) {
            criteria['preferredAgents'] = uniqueAgents;
            criteria['minExperience'] = Math.min(...patterns.map((p) => p.metadata?.experience || 0));
            criteria['requiredSkills'] = this.extractRequiredSkills(patterns);
        }
        return criteria;
    }
    extractRequiredSkills(patterns) {
        const skills = new Set();
        patterns.forEach((pattern) => {
            const patternSkills = pattern.metadata?.skills;
            if (patternSkills && Array.isArray(patternSkills)) {
                patternSkills.forEach((skill) => skills.add(skill));
            }
        });
        return Array.from(skills);
    }
    extractResourceConstraints(patterns) {
        const constraints = {};
        if (patterns.length > 0) {
            const memoryUsages = patterns
                .map((p) => p.metadata?.memoryUsage || 0)
                .filter((m) => m > 0);
            const cpuUsages = patterns
                .map((p) => p.metadata?.cpuUsage || 0)
                .filter((c) => c > 0);
            if (memoryUsages.length > 0) {
                constraints['maxMemory'] = Math.max(...memoryUsages) * 1.2;
            }
            if (cpuUsages.length > 0) {
                constraints['maxCpu'] = Math.max(...cpuUsages) * 1.1;
            }
        }
        return constraints;
    }
    calculateOptimalFrequencies(patterns) {
        const frequencies = {};
        const messageTypes = new Set(patterns.map((p) => p.metadata?.messageType).filter(Boolean));
        messageTypes.forEach((messageType) => {
            const typePatterns = patterns.filter((p) => p.metadata?.messageType === messageType);
            const avgInterval = typePatterns.reduce((sum, p) => sum + (p.metadata?.interval || 1000), 0) / typePatterns.length;
            frequencies[messageType] = 1000 / avgInterval;
        });
        return frequencies;
    }
    classifyMessageTypes(patterns) {
        const messageTypes = {};
        patterns.forEach((pattern) => {
            const msgType = pattern.metadata?.messageType;
            if (msgType) {
                if (!messageTypes[msgType]) {
                    messageTypes[msgType] = {
                        count: 0,
                        avgSize: 0,
                        avgLatency: 0,
                        priority: 'normal',
                    };
                }
                messageTypes[msgType].count++;
                messageTypes[msgType].avgSize +=
                    pattern.metadata?.messageSize || 0;
                messageTypes[msgType].avgLatency +=
                    pattern.metadata?.latency || 0;
            }
        });
        Object.values(messageTypes).forEach((type) => {
            type.avgSize /= type.count;
            type.avgLatency /= type.count;
        });
        return messageTypes;
    }
    determineOptimalTopology(patterns) {
        const topologyScores = {
            mesh: 0,
            star: 0,
            ring: 0,
            tree: 0,
        };
        patterns.forEach((pattern) => {
            const commPattern = pattern.metadata?.communicationPattern;
            if (commPattern) {
                if (commPattern === 'broadcast')
                    topologyScores.mesh += pattern.confidence;
                if (commPattern === 'centralized')
                    topologyScores.star += pattern.confidence;
                if (commPattern === 'sequential')
                    topologyScores.ring += pattern.confidence;
                if (commPattern === 'hierarchical')
                    topologyScores.tree += pattern.confidence;
            }
        });
        return Object.entries(topologyScores).reduce((best, [topology, score]) => score > topologyScores[best]
            ? topology
            : best, 'mesh');
    }
    calculateOptimalSyncFrequency(patterns) {
        const syncIntervals = patterns
            .map((p) => p.metadata?.syncInterval)
            .filter(Boolean)
            .map(Number);
        if (syncIntervals.length === 0)
            return 5000;
        const avgInterval = syncIntervals.reduce((sum, interval) => sum + interval, 0) /
            syncIntervals.length;
        return Math.max(1000, avgInterval * 0.8);
    }
    getMostFrequent(items) {
        if (items.length === 0)
            return null;
        const counts = new Map();
        items.forEach((item) => {
            counts.set(item, (counts.get(item) || 0) + 1);
        });
        let mostFrequent = items[0];
        let maxCount = 0;
        counts.forEach((count, item) => {
            if (count > maxCount) {
                maxCount = count;
                mostFrequent = item;
            }
        });
        return mostFrequent || null;
    }
    createBehaviorCluster(seed, behaviors, visited) {
        const clusterBehaviors = [seed];
        visited.add(seed.agentId);
        behaviors.forEach((behavior) => {
            if (visited.has(behavior.agentId))
                return;
            const similarity = this.calculateBehaviorSimilarity(seed, behavior);
            if (similarity > 0.7) {
                clusterBehaviors.push(behavior);
                visited.add(behavior.agentId);
            }
        });
        const centroid = this.calculateBehaviorCentroid(clusterBehaviors);
        const avgPerformance = clusterBehaviors.reduce((sum, b) => sum + this.calculateOverallPerformance(b), 0) / clusterBehaviors.length;
        const stability = this.calculateClusterStability(clusterBehaviors);
        return {
            id: `cluster_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            behaviors: clusterBehaviors,
            centroid,
            characteristics: this.extractClusterCharacteristics(clusterBehaviors),
            performance: avgPerformance,
            stability,
        };
    }
    calculateBehaviorSimilarity(b1, b2) {
        let similarity = 0;
        let factors = 0;
        similarity +=
            1 -
                Math.abs(b1.parameters.taskSelection.preferredComplexity -
                    b2.parameters.taskSelection.preferredComplexity);
        similarity +=
            1 -
                Math.abs(b1.parameters.taskSelection.riskTolerance -
                    b2.parameters.taskSelection.riskTolerance);
        factors += 2;
        similarity +=
            1 -
                Math.abs(b1.parameters.communication.frequency -
                    b2.parameters.communication.frequency);
        factors += 1;
        similarity +=
            1 -
                Math.abs(b1.parameters.learning.adaptationRate -
                    b2.parameters.learning.adaptationRate);
        factors += 1;
        return similarity / factors;
    }
    calculateBehaviorDistance(b1, b2) {
        return 1 - this.calculateBehaviorSimilarity(b1, b2);
    }
    calculateBehaviorCentroid(behaviors) {
        const centroid = JSON.parse(JSON.stringify(behaviors[0]));
        centroid.parameters.taskSelection.preferredComplexity =
            behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.preferredComplexity, 0) / behaviors.length;
        centroid.parameters.taskSelection.riskTolerance =
            behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.riskTolerance, 0) / behaviors.length;
        centroid.parameters.communication.frequency =
            behaviors.reduce((sum, b) => sum + b.parameters.communication.frequency, 0) / behaviors.length;
        centroid.parameters.learning.adaptationRate =
            behaviors.reduce((sum, b) => sum + b.parameters.learning.adaptationRate, 0) / behaviors.length;
        Object.keys(centroid.performance).forEach((key) => {
            const perfValue = behaviors.reduce((sum, b) => {
                const value = b.performance[key];
                return sum + (typeof value === 'number' ? value : 0);
            }, 0) / behaviors.length;
            centroid.performance[key] = perfValue;
        });
        centroid.agentId = `centroid_${Date.now()}`;
        return centroid;
    }
    calculateClusterStability(behaviors) {
        if (behaviors.length <= 1)
            return 1;
        const centroid = this.calculateBehaviorCentroid(behaviors);
        const distances = behaviors.map((b) => this.calculateBehaviorDistance(b, centroid));
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        const maxDistance = Math.max(...distances);
        return maxDistance > 0 ? 1 - avgDistance / maxDistance : 1;
    }
    extractClusterCharacteristics(behaviors) {
        const characteristics = [];
        const avgComplexity = behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.preferredComplexity, 0) / behaviors.length;
        const avgRisk = behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.riskTolerance, 0) / behaviors.length;
        const avgCommunication = behaviors.reduce((sum, b) => sum + b.parameters.communication.frequency, 0) / behaviors.length;
        if (avgComplexity > 0.7)
            characteristics.push('high_complexity_preference');
        if (avgComplexity < 0.3)
            characteristics.push('low_complexity_preference');
        if (avgRisk > 0.7)
            characteristics.push('risk_tolerant');
        if (avgRisk < 0.3)
            characteristics.push('risk_averse');
        if (avgCommunication > 0.7)
            characteristics.push('highly_communicative');
        if (avgCommunication < 0.3)
            characteristics.push('low_communication');
        return characteristics;
    }
    getNestedProperty(obj, path) {
        return path
            .split('.')
            .reduce((current, key) => current?.[key], obj);
    }
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => current?.[key], obj);
        target[lastKey] = value;
    }
    clampBehaviorParameters(behavior) {
        behavior.parameters.taskSelection.preferredComplexity = Math.max(0, Math.min(1, behavior.parameters.taskSelection.preferredComplexity));
        behavior.parameters.taskSelection.riskTolerance = Math.max(0, Math.min(1, behavior.parameters.taskSelection.riskTolerance));
        behavior.parameters.communication.frequency = Math.max(0, Math.min(1, behavior.parameters.communication.frequency));
        behavior.parameters.learning.adaptationRate = Math.max(0.001, Math.min(0.5, behavior.parameters.learning.adaptationRate));
    }
    initializeOptimizationStrategies() {
        this.optimizationStrategies.set('genetic', {
            id: 'genetic',
            name: 'Genetic Algorithm',
            type: 'genetic',
            objective: 'maximize_overall_performance',
            constraints: { maxIterations: 100 },
            parameters: { populationSize: 50, mutationRate: 0.1, crossoverRate: 0.8 },
        });
        this.optimizationStrategies.set('gradient_descent', {
            id: 'gradient_descent',
            name: 'Gradient Descent',
            type: 'gradient_descent',
            objective: 'minimize_loss',
            constraints: { maxIterations: 200 },
            parameters: { learningRate: 0.01, momentum: 0.9 },
        });
        this.optimizationStrategies.set('simulated_annealing', {
            id: 'simulated_annealing',
            name: 'Simulated Annealing',
            type: 'simulated_annealing',
            objective: 'global_optimization',
            constraints: { maxIterations: 500 },
            parameters: { initialTemperature: 100, coolingRate: 0.95 },
        });
        this.optimizationStrategies.set('bayesian', {
            id: 'bayesian',
            name: 'Bayesian Optimization',
            type: 'bayesian',
            objective: 'efficient_exploration',
            constraints: { maxEvaluations: 100 },
            parameters: {
                acquisitionFunction: 'expected_improvement',
                kernel: 'gaussian',
            },
        });
        this.optimizationStrategies.set('reinforcement', {
            id: 'reinforcement',
            name: 'Reinforcement Learning',
            type: 'reinforcement',
            objective: 'maximize_reward',
            constraints: { maxEpisodes: 1000 },
            parameters: {
                learningRate: 0.1,
                discountFactor: 0.95,
                explorationRate: 0.1,
            },
        });
    }
    startContinuousOptimization() {
        setInterval(() => {
            this.performBatchOptimization();
        }, this.config.optimizationInterval);
    }
    async performBatchOptimization() {
        const recommendations = this.getOptimizationRecommendations();
        const highPriority = recommendations
            .filter((rec) => rec.priority === 'high')
            .slice(0, 3);
        for (const rec of highPriority) {
            try {
                await this.optimizeAgentBehavior(rec.agentId, [], rec.suggestedStrategy);
            }
            catch (error) {
                this.emit('optimization_error', { agentId: rec.agentId, error });
            }
        }
    }
    getAgentBehavior(agentId) {
        return this.agentBehaviors.get(agentId);
    }
    getAllBehaviors() {
        return Array.from(this.agentBehaviors.values());
    }
    getBehaviorClusters() {
        return Array.from(this.behaviorClusters.values());
    }
    getOptimizationHistory() {
        return [...this.optimizationHistory];
    }
    getOptimizationStrategies() {
        return Array.from(this.optimizationStrategies.values());
    }
}
export default BehavioralOptimization;
//# sourceMappingURL=behavioral-optimization.js.map