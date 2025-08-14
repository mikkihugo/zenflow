import { EventEmitter } from 'events';
export class DynamicResourceManager extends EventEmitter {
    agents = new Map();
    swarms = new Map();
    allocations = new Map();
    conflicts = new Map();
    optimizationHistory = [];
    capacityPredictions = [];
    resourcePool;
    activeTransfers = new Map();
    performanceTracking;
    skillDatabase = new Map();
    constructor() {
        super();
        this.initializeResourcePool();
        this.initializeDefaultAgents();
        this.initializePerformanceTracking();
        this.setupPeriodicOptimization();
    }
    initializeResourcePool() {
        this.resourcePool = {
            portfolioLevel: {
                id: 'portfolio',
                name: 'Portfolio Level',
                priority: 1,
                agents: new Map(),
                reservedCapacity: 0.8,
                availableCapacity: 0.2,
                borrowingRules: [
                    {
                        fromLevel: 'shared',
                        maxBorrowPercent: 0.3,
                        urgencyThreshold: 'high',
                        durationLimit: 48,
                        returnPriority: 9,
                    },
                ],
                lendingRules: [
                    {
                        toLevel: 'program',
                        maxLendPercent: 0.2,
                        retainMinimum: 0.6,
                        priorityRequirement: 'critical',
                        compensationRequired: false,
                    },
                ],
                performanceMetrics: {
                    utilization: 0.7,
                    efficiency: 0.85,
                    quality: 0.9,
                    throughput: 5,
                    costEfficiency: 0.8,
                    agentSatisfaction: 0.85,
                },
            },
            programLevel: {
                id: 'program',
                name: 'Program Level',
                priority: 2,
                agents: new Map(),
                reservedCapacity: 0.6,
                availableCapacity: 0.4,
                borrowingRules: [
                    {
                        fromLevel: 'shared',
                        maxBorrowPercent: 0.4,
                        urgencyThreshold: 'medium',
                        durationLimit: 24,
                        returnPriority: 7,
                    },
                    {
                        fromLevel: 'portfolio',
                        maxBorrowPercent: 0.1,
                        urgencyThreshold: 'critical',
                        durationLimit: 12,
                        returnPriority: 10,
                    },
                ],
                lendingRules: [
                    {
                        toLevel: 'swarm',
                        maxLendPercent: 0.3,
                        retainMinimum: 0.4,
                        priorityRequirement: 'high',
                        compensationRequired: true,
                    },
                ],
                performanceMetrics: {
                    utilization: 0.75,
                    efficiency: 0.88,
                    quality: 0.85,
                    throughput: 15,
                    costEfficiency: 0.82,
                    agentSatisfaction: 0.8,
                },
            },
            swarmLevel: {
                id: 'swarm',
                name: 'Swarm Level',
                priority: 3,
                agents: new Map(),
                reservedCapacity: 0.5,
                availableCapacity: 0.5,
                borrowingRules: [
                    {
                        fromLevel: 'shared',
                        maxBorrowPercent: 0.6,
                        urgencyThreshold: 'low',
                        durationLimit: 8,
                        returnPriority: 5,
                    },
                    {
                        fromLevel: 'program',
                        maxBorrowPercent: 0.2,
                        urgencyThreshold: 'high',
                        durationLimit: 4,
                        returnPriority: 8,
                    },
                ],
                lendingRules: [
                    {
                        toLevel: 'shared',
                        maxLendPercent: 0.4,
                        retainMinimum: 0.3,
                        priorityRequirement: 'low',
                        compensationRequired: false,
                    },
                ],
                performanceMetrics: {
                    utilization: 0.8,
                    efficiency: 0.9,
                    quality: 0.8,
                    throughput: 50,
                    costEfficiency: 0.85,
                    agentSatisfaction: 0.75,
                },
            },
            sharedPool: {
                id: 'shared',
                name: 'Shared Resource Pool',
                priority: 0,
                agents: new Map(),
                reservedCapacity: 0.2,
                availableCapacity: 0.8,
                borrowingRules: [],
                lendingRules: [
                    {
                        toLevel: 'portfolio',
                        maxLendPercent: 0.3,
                        retainMinimum: 0.1,
                        priorityRequirement: 'medium',
                        compensationRequired: false,
                    },
                    {
                        toLevel: 'program',
                        maxLendPercent: 0.4,
                        retainMinimum: 0.1,
                        priorityRequirement: 'medium',
                        compensationRequired: false,
                    },
                    {
                        toLevel: 'swarm',
                        maxLendPercent: 0.6,
                        retainMinimum: 0.1,
                        priorityRequirement: 'low',
                        compensationRequired: false,
                    },
                ],
                performanceMetrics: {
                    utilization: 0.6,
                    efficiency: 0.85,
                    quality: 0.8,
                    throughput: 25,
                    costEfficiency: 0.9,
                    agentSatisfaction: 0.8,
                },
            },
        };
    }
    initializePerformanceTracking() {
        this.performanceTracking = {
            crossLevelEfficiency: 0.85,
            transferSuccessRate: 0.9,
            conflictResolutionTime: 2.5,
            costOptimization: 0.8,
            skillDevelopmentRate: 0.7,
            overallSystemHealth: 0.85,
        };
    }
    initializeDefaultAgents() {
        const defaultAgents = [
            {
                id: 'researcher-001',
                type: 'researcher',
                capabilities: [
                    {
                        id: 'research',
                        name: 'Research & Analysis',
                        level: 'expert',
                        domains: ['technology', 'market', 'competitive'],
                        efficiency: 0.9,
                        availability: 0.8,
                        cost: 100,
                    },
                    {
                        id: 'documentation',
                        name: 'Documentation',
                        level: 'advanced',
                        domains: ['technical', 'user'],
                        efficiency: 0.85,
                        availability: 0.9,
                        cost: 80,
                    },
                ],
                currentLoad: 0.3,
                maxConcurrency: 3,
                performanceHistory: [],
                preferences: {
                    preferredTaskTypes: ['research', 'analysis', 'documentation'],
                    preferredTimeSlots: [
                        {
                            start: '09:00',
                            end: '17:00',
                            timezone: 'UTC',
                            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                        },
                    ],
                    skillGrowthInterests: ['ai-research', 'data-analysis'],
                    collaborationPreferences: [{ style: 'independent', preference: 0.8 }],
                    workloadPreferences: {
                        type: 'steady',
                        preferredConcurrency: 2,
                        maxConcurrency: 3,
                        restPeriods: true,
                    },
                },
                status: 'available',
                costPerHour: 100,
                utilization: {
                    current: 0.3,
                    average: 0.5,
                    peak: 0.8,
                    idle: 0.2,
                    efficiency: 0.85,
                    burnoutRisk: 0.1,
                    overallHealth: 0.9,
                },
            },
            {
                id: 'coder-001',
                type: 'coder',
                capabilities: [
                    {
                        id: 'typescript',
                        name: 'TypeScript Development',
                        level: 'expert',
                        domains: ['web', 'api', 'tools'],
                        efficiency: 0.95,
                        availability: 0.85,
                        cost: 120,
                    },
                    {
                        id: 'architecture',
                        name: 'Software Architecture',
                        level: 'advanced',
                        domains: ['distributed', 'microservices'],
                        efficiency: 0.88,
                        availability: 0.7,
                        cost: 150,
                    },
                ],
                currentLoad: 0.6,
                maxConcurrency: 2,
                performanceHistory: [],
                preferences: {
                    preferredTaskTypes: ['coding', 'architecture', 'code-review'],
                    preferredTimeSlots: [
                        {
                            start: '08:00',
                            end: '16:00',
                            timezone: 'UTC',
                            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                        },
                    ],
                    skillGrowthInterests: ['ai-integration', 'performance-optimization'],
                    collaborationPreferences: [{ style: 'paired', preference: 0.7 }],
                    workloadPreferences: {
                        type: 'burst',
                        preferredConcurrency: 1,
                        maxConcurrency: 2,
                        restPeriods: false,
                    },
                },
                status: 'busy',
                costPerHour: 120,
                utilization: {
                    current: 0.6,
                    average: 0.7,
                    peak: 0.95,
                    idle: 0.05,
                    efficiency: 0.9,
                    burnoutRisk: 0.2,
                    overallHealth: 0.8,
                },
            },
            {
                id: 'analyst-001',
                type: 'analyst',
                capabilities: [
                    {
                        id: 'data-analysis',
                        name: 'Data Analysis',
                        level: 'expert',
                        domains: ['performance', 'business', 'user'],
                        efficiency: 0.92,
                        availability: 0.9,
                        cost: 110,
                    },
                    {
                        id: 'optimization',
                        name: 'Process Optimization',
                        level: 'advanced',
                        domains: ['workflow', 'performance'],
                        efficiency: 0.87,
                        availability: 0.8,
                        cost: 130,
                    },
                ],
                currentLoad: 0.4,
                maxConcurrency: 4,
                performanceHistory: [],
                preferences: {
                    preferredTaskTypes: ['analysis', 'optimization', 'reporting'],
                    preferredTimeSlots: [
                        {
                            start: '10:00',
                            end: '18:00',
                            timezone: 'UTC',
                            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                        },
                    ],
                    skillGrowthInterests: ['machine-learning', 'predictive-analytics'],
                    collaborationPreferences: [{ style: 'team', preference: 0.6 }],
                    workloadPreferences: {
                        type: 'mixed',
                        preferredConcurrency: 3,
                        maxConcurrency: 4,
                        restPeriods: true,
                    },
                },
                status: 'available',
                costPerHour: 110,
                utilization: {
                    current: 0.4,
                    average: 0.6,
                    peak: 0.85,
                    idle: 0.15,
                    efficiency: 0.88,
                    burnoutRisk: 0.15,
                    overallHealth: 0.85,
                },
            },
        ];
        defaultAgents.forEach((agent) => this.agents.set(agent.id, agent));
    }
    setupPeriodicOptimization() {
        setInterval(() => {
            this.runPeriodicOptimization();
        }, 300000);
    }
    async assignAgent(demand) {
        try {
            const availableAgents = Array.from(this.agents.values()).filter((agent) => agent.status === 'available' || agent.currentLoad < 0.8);
            if (availableAgents.length === 0) {
                return null;
            }
            const matches = availableAgents.map((agent) => this.calculateAgentMatch(agent, demand));
            const bestMatch = matches
                .filter((match) => match.score > 0.5)
                .sort((a, b) => b.score - a.score)[0];
            if (bestMatch) {
                await this.allocateAgent(bestMatch.agent, demand);
                return bestMatch;
            }
            return null;
        }
        catch (error) {
            console.error('Agent assignment failed:', error);
            return null;
        }
    }
    calculateAgentMatch(agent, demand) {
        const reasons = [];
        const conflicts = [];
        const recommendations = [];
        let score = 0;
        let totalWeight = 0;
        const capabilityScore = this.calculateCapabilityMatch(agent, demand);
        reasons.push({
            type: 'capability',
            factor: 'skills',
            score: capabilityScore,
            weight: 0.4,
        });
        score += capabilityScore * 0.4;
        totalWeight += 0.4;
        const availabilityScore = Math.max(0, 1 - agent.currentLoad);
        reasons.push({
            type: 'availability',
            factor: 'current_load',
            score: availabilityScore,
            weight: 0.3,
        });
        score += availabilityScore * 0.3;
        totalWeight += 0.3;
        const experienceScore = this.calculateExperienceMatch(agent, demand);
        reasons.push({
            type: 'experience',
            factor: 'past_performance',
            score: experienceScore,
            weight: 0.2,
        });
        score += experienceScore * 0.2;
        totalWeight += 0.2;
        const costScore = this.calculateCostEfficiency(agent, demand);
        reasons.push({
            type: 'cost',
            factor: 'cost_efficiency',
            score: costScore,
            weight: 0.1,
        });
        score += costScore * 0.1;
        totalWeight += 0.1;
        if (agent.currentLoad > 0.9) {
            conflicts.push({
                type: 'capacity',
                severity: 'high',
                impact: 'May cause performance degradation',
                resolution: 'Consider load balancing or scaling',
            });
        }
        if (capabilityScore < 0.7) {
            recommendations.push({
                type: 'skill_development',
                action: 'Provide additional training in required capabilities',
                benefit: 'Improved match score and future assignments',
                effort: 0.3,
            });
        }
        return {
            agent,
            score: totalWeight > 0 ? score / totalWeight : 0,
            reasons,
            conflicts,
            recommendations,
        };
    }
    calculateCapabilityMatch(agent, demand) {
        if (demand.requiredCapabilities.length === 0)
            return 0.5;
        let totalScore = 0;
        let matchedCapabilities = 0;
        for (const required of demand.requiredCapabilities) {
            const agentCap = agent.capabilities.find((cap) => cap.domains.some((domain) => required.domains.includes(domain)));
            if (agentCap) {
                const levelScore = this.getLevelScore(agentCap.level, required.level);
                totalScore += levelScore * agentCap.efficiency;
                matchedCapabilities++;
            }
        }
        return matchedCapabilities > 0 ? totalScore / matchedCapabilities : 0;
    }
    getLevelScore(agentLevel, requiredLevel) {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const agentIndex = levels.indexOf(agentLevel);
        const requiredIndex = levels.indexOf(requiredLevel);
        if (agentIndex >= requiredIndex) {
            return 1.0 - (agentIndex - requiredIndex) * 0.1;
        }
        return Math.max(0, 0.5 - (requiredIndex - agentIndex) * 0.2);
    }
    calculateExperienceMatch(agent, demand) {
        if (agent.performanceHistory.length === 0)
            return 0.5;
        const relevantHistory = agent.performanceHistory
            .filter((perf) => perf.taskType === demand.taskType)
            .slice(-5);
        if (relevantHistory.length === 0)
            return 0.3;
        const avgQuality = relevantHistory.reduce((sum, perf) => sum + perf.quality, 0) /
            relevantHistory.length;
        const avgEfficiency = relevantHistory.reduce((sum, perf) => sum + perf.efficiency, 0) /
            relevantHistory.length;
        return (avgQuality + avgEfficiency) / 2;
    }
    calculateCostEfficiency(agent, demand) {
        const baseCost = agent.costPerHour || 100;
        const efficiency = agent.utilization?.efficiency || 0.8;
        const effectiveCost = baseCost / efficiency;
        if (demand.budget) {
            const estimatedCost = effectiveCost * demand.duration;
            return Math.max(0, Math.min(1, demand.budget / estimatedCost));
        }
        if (effectiveCost < 80)
            return 1.0;
        if (effectiveCost < 120)
            return 0.8;
        if (effectiveCost < 160)
            return 0.6;
        return 0.4;
    }
    async allocateAgent(agent, demand) {
        const allocation = {
            taskId: demand.workflowId,
            workflowId: demand.workflowId,
            level: demand.level,
            priority: demand.urgency === 'immediate' ? 'critical' : demand.urgency,
            estimatedDuration: demand.duration,
            allocatedTime: new Date(),
            expectedCompletion: new Date(Date.now() + demand.duration * 60000),
        };
        agent.allocation = allocation;
        agent.currentLoad = Math.min(1, agent.currentLoad + 0.2);
        agent.status = agent.currentLoad >= 0.9 ? 'busy' : 'available';
        const workflowAllocations = this.allocations.get(demand.workflowId) || [];
        workflowAllocations.push(allocation);
        this.allocations.set(demand.workflowId, workflowAllocations);
        this.emit('resource-allocated', {
            agentId: agent.id,
            taskId: demand.workflowId,
            allocation,
        });
    }
    async scaleSwarm(swarmId, targetSize) {
        let swarm = this.swarms.get(swarmId);
        if (!swarm) {
            swarm = this.createDefaultSwarm(swarmId);
            this.swarms.set(swarmId, swarm);
        }
        const currentSize = swarm.currentAgents;
        const optimalSize = targetSize || swarm.optimalAgents;
        if (currentSize < optimalSize) {
            await this.addAgentsToSwarm(swarm, optimalSize - currentSize);
        }
        else if (currentSize > optimalSize) {
            await this.removeAgentsFromSwarm(swarm, currentSize - optimalSize);
        }
        this.emit('swarm-scaled', {
            swarmId,
            oldSize: currentSize,
            newSize: swarm.currentAgents,
            reason: 'optimization',
        });
        return swarm;
    }
    createDefaultSwarm(swarmId) {
        return {
            id: swarmId,
            name: `Swarm ${swarmId}`,
            topology: 'mesh',
            minAgents: 2,
            maxAgents: 10,
            currentAgents: 0,
            optimalAgents: 4,
            scalingRules: [
                {
                    trigger: {
                        type: 'load',
                        threshold: 0.8,
                        duration: 5,
                        direction: 'up',
                    },
                    action: { type: 'add_agent', magnitude: 1, priority: 1 },
                    cooldown: 10,
                    conditions: [],
                },
                {
                    trigger: {
                        type: 'load',
                        threshold: 0.3,
                        duration: 15,
                        direction: 'down',
                    },
                    action: { type: 'remove_agent', magnitude: 1, priority: 0.5 },
                    cooldown: 20,
                    conditions: [],
                },
            ],
            performanceTargets: [
                {
                    metric: 'utilization',
                    target: 0.7,
                    tolerance: 0.1,
                    priority: 'high',
                },
                {
                    metric: 'efficiency',
                    target: 0.85,
                    tolerance: 0.05,
                    priority: 'high',
                },
            ],
            constraints: [
                { type: 'budget', limit: 10000, enforcement: 'hard' },
                { type: 'quality', limit: 0.8, enforcement: 'soft' },
            ],
        };
    }
    async addAgentsToSwarm(swarm, count) {
        const availableAgents = Array.from(this.agents.values())
            .filter((agent) => !agent.swarmId && agent.status === 'available')
            .slice(0, count);
        for (const agent of availableAgents) {
            agent.swarmId = swarm.id;
            swarm.currentAgents++;
        }
        const remaining = count - availableAgents.length;
        for (let i = 0; i < remaining; i++) {
            const newAgent = await this.createNewAgent(swarm.id);
            this.agents.set(newAgent.id, newAgent);
            swarm.currentAgents++;
        }
    }
    async removeAgentsFromSwarm(swarm, count) {
        const swarmAgents = Array.from(this.agents.values())
            .filter((agent) => agent.swarmId === swarm.id && agent.status === 'available')
            .slice(0, count);
        for (const agent of swarmAgents) {
            agent?.swarmId = undefined;
            swarm.currentAgents--;
            if (swarm.currentAgents > swarm.maxAgents) {
                this.agents.delete(agent.id);
            }
        }
    }
    async createNewAgent(swarmId) {
        const types = [
            'researcher',
            'coder',
            'analyst',
            'optimizer',
            'coordinator',
            'tester',
        ];
        const randomType = types[Math.floor(Math.random() * types.length)];
        return {
            id: `${randomType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: randomType,
            capabilities: this.generateDefaultCapabilities(randomType),
            currentLoad: 0,
            maxConcurrency: 2,
            performanceHistory: [],
            preferences: this.generateDefaultPreferences(randomType),
            status: 'available',
            swarmId,
            costPerHour: 100,
            utilization: {
                current: 0,
                average: 0,
                peak: 0,
                idle: 1,
                efficiency: 0.8,
                burnoutRisk: 0,
                overallHealth: 1,
            },
        };
    }
    generateDefaultCapabilities(type) {
        const capabilityMap = {
            researcher: [
                {
                    id: 'research',
                    name: 'Research & Analysis',
                    level: 'advanced',
                    domains: ['technology'],
                    efficiency: 0.8,
                    availability: 0.9,
                    cost: 90,
                },
            ],
            coder: [
                {
                    id: 'coding',
                    name: 'Software Development',
                    level: 'advanced',
                    domains: ['web', 'api'],
                    efficiency: 0.85,
                    availability: 0.8,
                    cost: 110,
                },
            ],
            analyst: [
                {
                    id: 'analysis',
                    name: 'Data Analysis',
                    level: 'advanced',
                    domains: ['performance'],
                    efficiency: 0.82,
                    availability: 0.9,
                    cost: 95,
                },
            ],
            optimizer: [
                {
                    id: 'optimization',
                    name: 'Performance Optimization',
                    level: 'advanced',
                    domains: ['workflow'],
                    efficiency: 0.88,
                    availability: 0.85,
                    cost: 105,
                },
            ],
            coordinator: [
                {
                    id: 'coordination',
                    name: 'Project Coordination',
                    level: 'advanced',
                    domains: ['management'],
                    efficiency: 0.9,
                    availability: 0.8,
                    cost: 120,
                },
            ],
            tester: [
                {
                    id: 'testing',
                    name: 'Quality Assurance',
                    level: 'advanced',
                    domains: ['automated', 'manual'],
                    efficiency: 0.85,
                    availability: 0.9,
                    cost: 85,
                },
            ],
        };
        return capabilityMap[type] || [];
    }
    generateDefaultPreferences(type) {
        return {
            preferredTaskTypes: [type],
            preferredTimeSlots: [
                {
                    start: '09:00',
                    end: '17:00',
                    timezone: 'UTC',
                    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                },
            ],
            skillGrowthInterests: ['ai-integration'],
            collaborationPreferences: [{ style: 'team', preference: 0.6 }],
            workloadPreferences: {
                type: 'steady',
                preferredConcurrency: 1,
                maxConcurrency: 2,
                restPeriods: true,
            },
        };
    }
    async optimizeResourceUtilization() {
        const currentState = this.calculateCurrentResourceState();
        const targetState = this.calculateTargetResourceState();
        const optimizationActions = this.generateOptimizationActions(currentState, targetState);
        const optimization = {
            type: 'allocation',
            currentState,
            targetState,
            optimizationActions,
            expectedBenefits: this.calculateExpectedBenefits(optimizationActions),
            risks: this.assessOptimizationRisks(optimizationActions),
            timeline: this.createOptimizationTimeline(optimizationActions),
        };
        this.optimizationHistory.push(optimization);
        this.emit('optimization-applied', { optimization });
        return optimization;
    }
    calculateCurrentResourceState() {
        const agents = Array.from(this.agents.values());
        const totalUtilization = agents.reduce((sum, agent) => sum + (agent.utilization?.current || 0), 0) / agents.length;
        const totalEfficiency = agents.reduce((sum, agent) => sum + (agent.utilization?.efficiency || 0), 0) / agents.length;
        const totalCost = agents.reduce((sum, agent) => sum + (agent.costPerHour || 0), 0);
        return {
            utilization: totalUtilization,
            efficiency: totalEfficiency,
            cost: totalCost,
            quality: 0.8,
            satisfaction: 0.75,
            capacity: agents.length,
            bottlenecks: this.identifyBottlenecks(),
        };
    }
    calculateTargetResourceState() {
        return {
            utilization: 0.75,
            efficiency: 0.9,
            cost: 0,
            quality: 0.9,
            satisfaction: 0.85,
            capacity: 0,
            bottlenecks: [],
        };
    }
    generateOptimizationActions(current, target) {
        const actions = [];
        if (current.utilization < target.utilization - 0.1) {
            actions.push({
                id: 'increase-utilization',
                type: 'reallocate',
                description: 'Reallocate underutilized resources to high-demand areas',
                impact: {
                    utilization: 0.1,
                    efficiency: 0.05,
                    cost: -0.05,
                    quality: 0,
                    timeline: -0.1,
                    risk: 0.2,
                },
                effort: 0.3,
                priority: 0.8,
                dependencies: [],
            });
        }
        if (current.efficiency < target.efficiency - 0.05) {
            actions.push({
                id: 'improve-efficiency',
                type: 'retrain',
                description: 'Provide training to improve agent efficiency',
                impact: {
                    utilization: 0,
                    efficiency: 0.1,
                    cost: 0.1,
                    quality: 0.05,
                    timeline: 0.1,
                    risk: 0.1,
                },
                effort: 0.5,
                priority: 0.7,
                dependencies: [],
            });
        }
        if (current.bottlenecks.length > 0) {
            actions.push({
                id: 'resolve-bottlenecks',
                type: 'scale',
                description: 'Add resources to resolve identified bottlenecks',
                impact: {
                    utilization: -0.05,
                    efficiency: 0.1,
                    cost: 0.2,
                    quality: 0.1,
                    timeline: -0.2,
                    risk: 0.15,
                },
                effort: 0.4,
                priority: 0.9,
                dependencies: [],
            });
        }
        return actions;
    }
    calculateExpectedBenefits(actions) {
        return actions.map((action) => ({
            type: 'efficiency_improvement',
            value: action.impact.efficiency * 100,
            confidence: 1 - action.impact.risk,
            timeframe: '1-4 weeks',
        }));
    }
    assessOptimizationRisks(actions) {
        return actions.map((action) => ({
            type: 'disruption',
            probability: action.impact.risk,
            impact: action.effort,
            mitigation: `Gradual rollout with monitoring for ${action.description}`,
        }));
    }
    createOptimizationTimeline(actions) {
        return [
            {
                phase: 'Planning',
                duration: 1,
                actions: ['Analyze current state', 'Plan optimization actions'],
                milestones: ['Optimization plan approved'],
            },
            {
                phase: 'Implementation',
                duration: 7,
                actions: actions.map((a) => a.description),
                milestones: ['50% actions completed', 'All actions implemented'],
            },
            {
                phase: 'Validation',
                duration: 3,
                actions: ['Monitor results', 'Measure improvements'],
                milestones: ['Optimization validated', 'Results documented'],
            },
        ];
    }
    identifyBottlenecks() {
        const bottlenecks = [];
        const highLoadAgents = Array.from(this.agents.values()).filter((agent) => (agent.utilization?.current || 0) > 0.9);
        if (highLoadAgents.length > 0) {
            bottlenecks.push(`High load on ${highLoadAgents.length} agents`);
        }
        const busyAgents = Array.from(this.agents.values()).filter((agent) => agent.status === 'busy');
        if (busyAgents.length / this.agents.size > 0.8) {
            bottlenecks.push('High overall system load');
        }
        return bottlenecks;
    }
    async detectConflicts() {
        const conflicts = [];
        for (const [agentId, agent] of this.agents) {
            if (agent.currentLoad > 1.0) {
                conflicts.push({
                    id: `double-booking-${agentId}`,
                    type: 'double_booking',
                    severity: 'critical',
                    affectedResources: [agentId],
                    affectedTasks: [],
                    impact: 'Agent overloaded, quality may suffer',
                    resolutionOptions: [
                        {
                            id: 'reschedule',
                            type: 'reschedule',
                            description: 'Reschedule lower priority tasks',
                            effort: 0.3,
                            impact: {
                                schedule: 0.2,
                                cost: 0,
                                quality: -0.1,
                                morale: 0.1,
                                risk: 0.2,
                            },
                            tradeoffs: ['Delayed delivery', 'Improved quality'],
                        },
                    ],
                });
            }
        }
        conflicts.forEach((conflict) => {
            this.conflicts.set(conflict.id, conflict);
            this.emit('conflict-detected', { conflict });
        });
        return conflicts;
    }
    async resolveConflict(conflictId, resolutionId) {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict)
            return false;
        const resolution = conflict.resolutionOptions.find((r) => r.id === resolutionId);
        if (!resolution)
            return false;
        switch (resolution.type) {
            case 'reschedule':
                await this.rescheduleConflictedTasks(conflict);
                break;
            case 'reallocate':
                await this.reallocateConflictedResources(conflict);
                break;
            case 'prioritize':
                await this.reprioritizeConflictedTasks(conflict);
                break;
        }
        this.conflicts.delete(conflictId);
        this.emit('conflict-resolved', { conflictId, resolution });
        return true;
    }
    async rescheduleConflictedTasks(conflict) {
        console.log(`Rescheduling tasks for conflict: ${conflict.id}`);
    }
    async reallocateConflictedResources(conflict) {
        console.log(`Reallocating resources for conflict: ${conflict.id}`);
    }
    async reprioritizeConflictedTasks(conflict) {
        console.log(`Reprioritizing tasks for conflict: ${conflict.id}`);
    }
    async generateCapacityForecast(timeframe) {
        const demandForecast = this.forecastDemand(timeframe);
        const capacityForecast = this.forecastCapacity(timeframe);
        const gaps = this.identifyCapacityGaps(demandForecast, capacityForecast);
        const recommendations = this.generateCapacityRecommendations(gaps);
        const prediction = {
            timeframe,
            demandForecast,
            capacityForecast,
            gaps,
            recommendations,
        };
        this.capacityPredictions.push(prediction);
        return prediction;
    }
    forecastDemand(timeframe) {
        return [
            {
                period: 'week-1',
                taskType: 'research',
                volume: 10,
                complexity: 0.6,
                urgency: 0.7,
                confidence: 0.8,
            },
            {
                period: 'week-2',
                taskType: 'coding',
                volume: 15,
                complexity: 0.8,
                urgency: 0.8,
                confidence: 0.75,
            },
        ];
    }
    forecastCapacity(timeframe) {
        const agents = Array.from(this.agents.values());
        return [
            {
                period: 'week-1',
                agentType: 'researcher',
                availableCapacity: agents.filter((a) => a.type === 'researcher').length * 40,
                utilization: 0.7,
                efficiency: 0.85,
                constraints: ['Limited availability on weekends'],
            },
            {
                period: 'week-2',
                agentType: 'coder',
                availableCapacity: agents.filter((a) => a.type === 'coder').length * 40,
                utilization: 0.8,
                efficiency: 0.9,
                constraints: ['Code review bottleneck'],
            },
        ];
    }
    identifyCapacityGaps(demand, capacity) {
        const gaps = [];
        for (const demandItem of demand) {
            const capacityItem = capacity.find((c) => c.period === demandItem.period);
            if (capacityItem) {
                const requiredCapacity = demandItem.volume * demandItem.complexity * 2;
                const availableCapacity = capacityItem.availableCapacity * capacityItem.utilization;
                if (requiredCapacity > availableCapacity) {
                    gaps.push({
                        period: demandItem.period,
                        gapType: 'shortage',
                        magnitude: requiredCapacity - availableCapacity,
                        capability: demandItem.taskType,
                        impact: `${Math.round(requiredCapacity - availableCapacity)} hours shortfall`,
                        urgency: demandItem.urgency > 0.8 ? 'critical' : 'high',
                    });
                }
            }
        }
        return gaps;
    }
    generateCapacityRecommendations(gaps) {
        return gaps.map((gap) => ({
            type: gap.magnitude > 20 ? 'hiring' : 'training',
            action: `${gap.type === 'shortage' ? 'Add' : 'Reduce'} ${Math.ceil(gap.magnitude / 40)} ${gap.capability} agents`,
            timeline: gap.urgency === 'critical' ? '1-2 weeks' : '2-4 weeks',
            cost: Math.ceil(gap.magnitude / 40) * 100 * 40,
            benefit: gap.magnitude * 2,
            priority: gap.urgency === 'critical' ? 1 : 0.7,
        }));
    }
    async runPeriodicOptimization() {
        try {
            await this.detectConflicts();
            await this.optimizeResourceUtilization();
            await this.generateCapacityForecast('4-weeks');
            console.log('Periodic resource optimization completed');
        }
        catch (error) {
            console.error('Periodic optimization failed:', error);
        }
    }
    getResourceStatus() {
        const agents = Array.from(this.agents.values());
        const swarms = Array.from(this.swarms.values());
        const conflicts = Array.from(this.conflicts.values());
        const totalUtilization = agents.reduce((sum, agent) => sum + (agent.utilization?.current || 0), 0) / agents.length;
        const totalEfficiency = agents.reduce((sum, agent) => sum + (agent.utilization?.efficiency || 0), 0) / agents.length;
        return {
            agents,
            swarms,
            conflicts,
            utilization: totalUtilization,
            efficiency: totalEfficiency,
        };
    }
    async requestCrossLevelResource(fromLevel, toLevel, demand) {
        try {
            const sourceLevel = this.getResourceLevel(fromLevel);
            const targetLevel = this.getResourceLevel(toLevel);
            if (!(sourceLevel && targetLevel)) {
                throw new Error(`Invalid resource level: ${fromLevel} or ${toLevel}`);
            }
            const borrowRule = targetLevel.borrowingRules.find((rule) => rule.fromLevel === fromLevel);
            if (!(borrowRule && this.canBorrowResource(demand, borrowRule))) {
                return null;
            }
            const lendRule = sourceLevel.lendingRules.find((rule) => rule.toLevel === toLevel);
            if (!(lendRule && this.canLendResource(demand, lendRule, sourceLevel))) {
                return null;
            }
            const suitableAgent = this.findCrossLevelAgent(sourceLevel, demand);
            if (!suitableAgent) {
                return null;
            }
            const transfer = this.createResourceTransfer(suitableAgent, fromLevel, toLevel, demand, borrowRule);
            await this.executeResourceTransfer(transfer);
            this.emit('cross-level-request', { fromLevel, toLevel, request: demand });
            return transfer;
        }
        catch (error) {
            console.error('Cross-level resource request failed:', error);
            return null;
        }
    }
    getResourceLevel(levelId) {
        switch (levelId) {
            case 'portfolio':
                return this.resourcePool.portfolioLevel;
            case 'program':
                return this.resourcePool.programLevel;
            case 'swarm':
                return this.resourcePool.swarmLevel;
            case 'shared':
                return this.resourcePool.sharedPool;
            default:
                return null;
        }
    }
    canBorrowResource(demand, rule) {
        const urgencyLevels = ['low', 'medium', 'high', 'critical'];
        const demandUrgencyIndex = urgencyLevels.indexOf(demand.urgency);
        const ruleUrgencyIndex = urgencyLevels.indexOf(rule.urgencyThreshold);
        if (demandUrgencyIndex < ruleUrgencyIndex) {
            return false;
        }
        if (demand.duration > rule.durationLimit) {
            return false;
        }
        return true;
    }
    canLendResource(demand, rule, level) {
        const priorityLevels = ['low', 'medium', 'high', 'critical'];
        const demandPriorityIndex = priorityLevels.indexOf(demand.urgency);
        const rulePriorityIndex = priorityLevels.indexOf(rule.priorityRequirement);
        if (demandPriorityIndex < rulePriorityIndex) {
            return false;
        }
        const currentUtilization = level.performanceMetrics.utilization;
        const availableForLending = Math.max(0, rule.maxLendPercent - (currentUtilization - rule.retainMinimum));
        if (availableForLending <= 0) {
            return false;
        }
        return true;
    }
    findCrossLevelAgent(level, demand) {
        const availableAgents = Array.from(level.agents.values()).filter((agent) => agent.status === 'available' && agent.currentLoad < 0.8);
        if (availableAgents.length === 0) {
            return null;
        }
        const scoredAgents = availableAgents.map((agent) => ({
            agent,
            score: this.calculateCapabilityMatch(agent, demand),
        }));
        const bestMatch = scoredAgents
            .filter((item) => item.score > 0.6)
            .sort((a, b) => b.score - a.score)[0];
        return bestMatch?.agent || null;
    }
    createResourceTransfer(agent, fromLevel, toLevel, demand, rule) {
        const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: transferId,
            agentId: agent.id,
            fromLevel,
            toLevel,
            reason: `Resource demand: ${demand.taskType}`,
            urgency: demand.urgency,
            duration: Math.min(demand.duration, rule.durationLimit),
            startTime: new Date(),
            expectedReturnTime: new Date(Date.now() +
                Math.min(demand.duration, rule.durationLimit) * 60 * 60 * 1000),
            transferCost: rule.cost,
            performanceImpact: this.calculateTransferImpact(agent, fromLevel, toLevel),
            status: 'pending',
        };
    }
    calculateTransferImpact(agent, fromLevel, toLevel) {
        const sourceLevel = this.getResourceLevel(fromLevel);
        const targetLevel = this.getResourceLevel(toLevel);
        return {
            onSourceLevel: {
                capacityChange: -0.1,
                efficiencyChange: -0.05,
                qualityChange: -0.02,
                costChange: 0,
                riskChange: 0.05,
            },
            onTargetLevel: {
                capacityChange: 0.1,
                efficiencyChange: 0.08,
                qualityChange: 0.05,
                costChange: 50,
                riskChange: -0.1,
            },
            onAgent: {
                skillUtilization: 0.8,
                learningOpportunity: 0.7,
                stressLevel: 0.3,
                satisfactionChange: 0.1,
                careerDevelopment: 0.6,
            },
        };
    }
    async executeResourceTransfer(transfer) {
        try {
            const agent = this.agents.get(transfer.agentId);
            if (!agent) {
                throw new Error(`Agent not found: ${transfer.agentId}`);
            }
            const sourceLevel = this.getResourceLevel(transfer.fromLevel);
            const targetLevel = this.getResourceLevel(transfer.toLevel);
            if (!(sourceLevel && targetLevel)) {
                throw new Error(`Invalid levels: ${transfer.fromLevel} -> ${transfer.toLevel}`);
            }
            sourceLevel.agents.delete(transfer.agentId);
            sourceLevel.availableCapacity = Math.max(0, sourceLevel.availableCapacity - 0.1);
            targetLevel.agents.set(transfer.agentId, agent);
            targetLevel.availableCapacity = Math.min(1, targetLevel.availableCapacity + 0.1);
            agent.allocation = {
                taskId: `transfer-${transfer.id}`,
                workflowId: transfer.id,
                level: transfer.toLevel,
                priority: transfer.urgency === 'critical' ? 'critical' : 'high',
                estimatedDuration: transfer.duration,
                allocatedTime: transfer.startTime,
                expectedCompletion: transfer.expectedReturnTime,
            };
            transfer.status = 'active';
            this.activeTransfers.set(transfer.id, transfer);
            setTimeout(() => {
                this.returnTransferredResource(transfer.id);
            }, transfer.duration * 60 * 60 * 1000);
            this.emit('resource-transferred', { transfer });
        }
        catch (error) {
            transfer.status = 'cancelled';
            console.error('Resource transfer execution failed:', error);
            throw error;
        }
    }
    async returnTransferredResource(transferId) {
        try {
            const transfer = this.activeTransfers.get(transferId);
            if (!transfer || transfer.status !== 'active') {
                return;
            }
            const agent = this.agents.get(transfer.agentId);
            if (!agent) {
                console.error(`Agent not found for return: ${transfer.agentId}`);
                return;
            }
            const sourceLevel = this.getResourceLevel(transfer.fromLevel);
            const targetLevel = this.getResourceLevel(transfer.toLevel);
            if (!(sourceLevel && targetLevel)) {
                console.error(`Invalid levels for return: ${transfer.fromLevel} -> ${transfer.toLevel}`);
                return;
            }
            targetLevel.agents.delete(transfer.agentId);
            sourceLevel.agents.set(transfer.agentId, agent);
            targetLevel.availableCapacity = Math.max(0, targetLevel.availableCapacity - 0.1);
            sourceLevel.availableCapacity = Math.min(1, sourceLevel.availableCapacity + 0.1);
            agent?.allocation = undefined;
            agent.currentLoad = Math.max(0, agent.currentLoad - 0.2);
            transfer.status = 'completed';
            transfer.actualReturnTime = new Date();
            const actualImpact = this.calculateActualTransferImpact(transfer);
            this.activeTransfers.delete(transferId);
            this.emit('resource-returned', { transferId, actualImpact });
        }
        catch (error) {
            console.error('Resource return failed:', error);
        }
    }
    calculateActualTransferImpact(transfer) {
        return transfer.performanceImpact;
    }
    async allocateBySkills(demand) {
        try {
            const skillAllocation = {
                requiredSkills: this.extractSkillRequirements(demand),
                optionalSkills: [],
                learningOpportunities: [],
                skillGapAnalysis: [],
                allocationScore: 0,
            };
            const matchedAgents = this.findAgentsBySkills(skillAllocation.requiredSkills);
            if (matchedAgents.length === 0) {
                skillAllocation.skillGapAnalysis = this.identifySkillGaps(skillAllocation.requiredSkills);
                skillAllocation.learningOpportunities =
                    this.generateLearningOpportunities(skillAllocation.skillGapAnalysis);
                this.skillDatabase.set(demand.workflowId, skillAllocation);
                skillAllocation.skillGapAnalysis.forEach((gap) => {
                    this.emit('skill-gap-identified', { gap, level: demand.level });
                });
                return skillAllocation;
            }
            skillAllocation.allocationScore = this.calculateSkillAllocationScore(matchedAgents, skillAllocation.requiredSkills);
            this.skillDatabase.set(demand.workflowId, skillAllocation);
            return skillAllocation;
        }
        catch (error) {
            console.error('Skill-based allocation failed:', error);
            return null;
        }
    }
    extractSkillRequirements(demand) {
        const skillMap = {
            research: [
                {
                    skill: 'research',
                    level: 'advanced',
                    importance: 'required',
                    weight: 0.8,
                },
                {
                    skill: 'analysis',
                    level: 'intermediate',
                    importance: 'preferred',
                    weight: 0.6,
                },
            ],
            coding: [
                {
                    skill: 'programming',
                    level: 'advanced',
                    importance: 'required',
                    weight: 0.9,
                },
                {
                    skill: 'architecture',
                    level: 'intermediate',
                    importance: 'preferred',
                    weight: 0.7,
                },
            ],
            analysis: [
                {
                    skill: 'data-analysis',
                    level: 'advanced',
                    importance: 'required',
                    weight: 0.8,
                },
                {
                    skill: 'statistics',
                    level: 'intermediate',
                    importance: 'preferred',
                    weight: 0.6,
                },
            ],
        };
        return skillMap[demand.taskType] || [];
    }
    findAgentsBySkills(requiredSkills) {
        const agents = Array.from(this.agents.values());
        return agents.filter((agent) => {
            return requiredSkills.every((required) => {
                return agent.capabilities.some((cap) => {
                    const skillMatch = cap.name
                        .toLowerCase()
                        .includes(required.skill.toLowerCase());
                    const levelMatch = this.getLevelScore(cap.level, required.level) > 0.5;
                    return skillMatch && levelMatch;
                });
            });
        });
    }
    identifySkillGaps(requiredSkills) {
        const agents = Array.from(this.agents.values());
        const gaps = [];
        for (const required of requiredSkills) {
            const agentsWithSkill = agents.filter((agent) => agent.capabilities.some((cap) => cap.name.toLowerCase().includes(required.skill.toLowerCase())));
            if (agentsWithSkill.length === 0) {
                gaps.push({
                    skill: required.skill,
                    requiredLevel: required.level,
                    availableLevel: 'none',
                    gap: 1.0,
                    impact: required.importance === 'required' ? 'critical' : 'high',
                    mitigation: `Hire or train agents in ${required.skill}`,
                });
            }
            else {
                const maxAvailableLevel = agentsWithSkill.reduce((max, agent) => {
                    const skillCap = agent.capabilities.find((cap) => cap.name.toLowerCase().includes(required.skill.toLowerCase()));
                    return skillCap && this.getLevelScore(skillCap.level, max) > 0
                        ? skillCap.level
                        : max;
                }, 'beginner');
                const gapSize = this.getLevelScore(required.level, maxAvailableLevel);
                if (gapSize < 0.8) {
                    gaps.push({
                        skill: required.skill,
                        requiredLevel: required.level,
                        availableLevel: maxAvailableLevel,
                        gap: 1 - gapSize,
                        impact: required.importance === 'required' ? 'high' : 'medium',
                        mitigation: `Provide additional training in ${required.skill}`,
                    });
                }
            }
        }
        return gaps;
    }
    generateLearningOpportunities(gaps) {
        return gaps.map((gap) => ({
            skill: gap.skill,
            currentLevel: gap.availableLevel,
            targetLevel: gap.requiredLevel,
            effort: this.calculateTrainingEffort(gap.availableLevel, gap.requiredLevel),
            benefit: 1 - gap.gap,
            timeline: this.estimateTrainingTimeline(gap.availableLevel, gap.requiredLevel),
        }));
    }
    calculateTrainingEffort(current, target) {
        const levels = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(current);
        const targetIndex = levels.indexOf(target);
        return Math.max(0, (targetIndex - currentIndex) * 20);
    }
    estimateTrainingTimeline(current, target) {
        const effort = this.calculateTrainingEffort(current, target);
        if (effort <= 20)
            return '1-2 weeks';
        if (effort <= 40)
            return '3-4 weeks';
        if (effort <= 80)
            return '2-3 months';
        return '3-6 months';
    }
    calculateSkillAllocationScore(agents, requiredSkills) {
        if (agents.length === 0)
            return 0;
        let totalScore = 0;
        let totalWeight = 0;
        for (const required of requiredSkills) {
            const matchedAgents = agents.filter((agent) => agent.capabilities.some((cap) => cap.name.toLowerCase().includes(required.skill.toLowerCase())));
            if (matchedAgents.length > 0) {
                const bestAgent = matchedAgents[0];
                const capability = bestAgent.capabilities.find((cap) => cap.name.toLowerCase().includes(required.skill.toLowerCase()));
                if (capability) {
                    const skillScore = this.getLevelScore(capability.level, required.level);
                    totalScore += skillScore * required.weight;
                    totalWeight += required.weight;
                }
            }
        }
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
    async resolveCrossLevelConflict(conflictId) {
        try {
            const conflict = this.conflicts.get(conflictId);
            if (!conflict) {
                return null;
            }
            const strategy = this.determineResolutionStrategy(conflict);
            const involvedLevels = this.identifyInvolvedLevels(conflict);
            const outcome = await this.executeConflictResolution(conflict, strategy, involvedLevels);
            const resolution = {
                conflictId,
                resolutionStrategy: strategy,
                involvedLevels,
                outcome,
                learnings: this.extractLearnings(conflict, outcome),
            };
            return resolution;
        }
        catch (error) {
            console.error('Cross-level conflict resolution failed:', error);
            return null;
        }
    }
    determineResolutionStrategy(conflict) {
        switch (conflict.severity) {
            case 'critical':
                return 'escalate';
            case 'high':
                return 'negotiate';
            case 'medium':
                return 'compromise';
            case 'low':
                return 'defer';
            default:
                return 'negotiate';
        }
    }
    identifyInvolvedLevels(conflict) {
        const levels = new Set();
        for (const resourceId of conflict.affectedResources) {
            const agent = this.agents.get(resourceId);
            if (agent?.allocation?.level) {
                levels.add(agent.allocation.level);
            }
        }
        for (const transfer of this.activeTransfers.values()) {
            if (conflict.affectedResources.includes(transfer.agentId)) {
                levels.add(transfer.fromLevel);
                levels.add(transfer.toLevel);
            }
        }
        return Array.from(levels);
    }
    async executeConflictResolution(conflict, strategy, levels) {
        const outcome = {
            resolution: `Applied ${strategy} strategy for ${conflict.type} conflict`,
            satisfaction: {},
            impact: {},
            followUpActions: [],
        };
        for (const level of levels) {
            outcome.satisfaction[level] = 0.7 + Math.random() * 0.2;
            outcome.impact[level] = {
                capacityChange: -0.05 + Math.random() * 0.1,
                efficiencyChange: -0.02 + Math.random() * 0.04,
                qualityChange: 0,
                costChange: Math.random() * 100,
                riskChange: -0.1 + Math.random() * 0.05,
            };
        }
        outcome.followUpActions = [
            'Monitor resource allocation for next 48 hours',
            'Review and adjust borrowing/lending rules if needed',
            'Conduct post-resolution retrospective',
        ];
        return outcome;
    }
    extractLearnings(conflict, outcome) {
        return [
            `${conflict.type} conflicts require ${Math.round(this.performanceTracking.conflictResolutionTime)} hours average resolution time`,
            `Multi-level conflicts benefit from early ${outcome.resolution.includes('negotiate') ? 'negotiation' : 'escalation'}`,
            'Cross-level communication protocols need regular review',
        ];
    }
    async autoScaleCapacity() {
        try {
            const currentCapacityAnalysis = this.analyzeCurrentCapacity();
            const demandForecast = this.forecastDemand('2-weeks');
            const capacityGaps = this.identifyCapacityGaps(demandForecast, currentCapacityAnalysis.capacityForecast);
            const scalingActions = this.generateScalingActions(capacityGaps, currentCapacityAnalysis);
            await this.executeScalingActions(scalingActions);
            const predictedCapacity = await this.generateCapacityForecast('4-weeks');
            const recommendations = this.generateCapacityRecommendations(capacityGaps);
            return {
                scalingActions,
                predictedCapacity,
                recommendations,
            };
        }
        catch (error) {
            console.error('Auto-scaling failed:', error);
            return {
                scalingActions: [],
                predictedCapacity: {
                    timeframe: '4-weeks',
                    demandForecast: [],
                    capacityForecast: [],
                    gaps: [],
                    recommendations: [],
                },
                recommendations: [],
            };
        }
    }
    analyzeCurrentCapacity() {
        const levels = [
            this.resourcePool.portfolioLevel,
            this.resourcePool.programLevel,
            this.resourcePool.swarmLevel,
            this.resourcePool.sharedPool,
        ];
        let totalCapacity = 0;
        let totalUtilization = 0;
        const bottlenecks = [];
        const capacityForecast = [];
        for (const level of levels) {
            const levelCapacity = level.agents.size * 40;
            const levelUtilization = level.performanceMetrics.utilization;
            totalCapacity += levelCapacity;
            totalUtilization += levelUtilization;
            if (levelUtilization > 0.9) {
                bottlenecks.push(`${level.name} at ${Math.round(levelUtilization * 100)}% utilization`);
            }
            capacityForecast.push({
                period: 'current',
                agentType: level.id,
                availableCapacity: levelCapacity * (1 - levelUtilization),
                utilization: levelUtilization,
                efficiency: level.performanceMetrics.efficiency,
                constraints: this.identifyLevelConstraints(level),
            });
        }
        return {
            totalCapacity,
            utilization: totalUtilization / levels.length,
            bottlenecks,
            capacityForecast,
        };
    }
    identifyLevelConstraints(level) {
        const constraints = [];
        if (level.performanceMetrics.utilization > 0.85) {
            constraints.push('High utilization - limited scaling headroom');
        }
        if (level.performanceMetrics.efficiency < 0.8) {
            constraints.push('Low efficiency - may need process improvements');
        }
        if (level.performanceMetrics.agentSatisfaction < 0.7) {
            constraints.push('Low agent satisfaction - risk of turnover');
        }
        if (level.availableCapacity < 0.2) {
            constraints.push('Low available capacity - immediate scaling needed');
        }
        return constraints;
    }
    generateScalingActions(gaps, currentAnalysis) {
        const actions = [];
        for (const gap of gaps) {
            if (gap.gapType === 'shortage' && gap.urgency === 'critical') {
                const requiredAgents = Math.ceil(gap.magnitude / 40);
                actions.push({
                    id: `scale-${gap.capability}-${Date.now()}`,
                    type: 'add_agents',
                    level: this.mapCapabilityToLevel(gap.capability),
                    magnitude: requiredAgents,
                    urgency: gap.urgency,
                    reason: `Critical shortage: ${gap.impact}`,
                    estimatedCost: requiredAgents * 100 * 40 * 4,
                    expectedBenefit: gap.magnitude * 1.5,
                    timeline: '1-2 weeks',
                    approvalRequired: requiredAgents > 2,
                    constraints: [],
                    status: 'pending',
                });
            }
            else if (gap.gapType === 'shortage' && gap.urgency === 'high') {
                actions.push({
                    id: `optimize-${gap.capability}-${Date.now()}`,
                    type: 'optimize_existing',
                    level: this.mapCapabilityToLevel(gap.capability),
                    magnitude: 1,
                    urgency: gap.urgency,
                    reason: `Optimize existing resources: ${gap.impact}`,
                    estimatedCost: 5000,
                    expectedBenefit: gap.magnitude * 0.8,
                    timeline: '2-4 weeks',
                    approvalRequired: false,
                    constraints: ['Requires agent availability for training'],
                    status: 'pending',
                });
            }
            else if (gap.gapType === 'surplus') {
                actions.push({
                    id: `reallocate-${gap.capability}-${Date.now()}`,
                    type: 'reallocate',
                    level: this.mapCapabilityToLevel(gap.capability),
                    magnitude: Math.floor(gap.magnitude / 40),
                    urgency: 'low',
                    reason: `Surplus capacity: ${gap.impact}`,
                    estimatedCost: 1000,
                    expectedBenefit: gap.magnitude * 0.5,
                    timeline: '1-2 weeks',
                    approvalRequired: false,
                    constraints: ['Requires suitable target level'],
                    status: 'pending',
                });
            }
        }
        if (currentAnalysis.utilization > 0.8) {
            actions.push({
                id: `predictive-scale-${Date.now()}`,
                type: 'add_agents',
                level: 'shared',
                magnitude: 2,
                urgency: 'medium',
                reason: 'Predictive scaling - high utilization trend',
                estimatedCost: 8000,
                expectedBenefit: 3200,
                timeline: '2-3 weeks',
                approvalRequired: true,
                constraints: ['Budget approval required'],
                status: 'pending',
            });
        }
        return actions;
    }
    mapCapabilityToLevel(capability) {
        const capabilityLevelMap = {
            research: 'portfolio',
            analysis: 'program',
            coding: 'swarm',
            coordination: 'program',
            testing: 'swarm',
        };
        return capabilityLevelMap[capability] || 'shared';
    }
    async executeScalingActions(actions) {
        for (const action of actions) {
            try {
                if (action.approvalRequired) {
                    console.log(`Approval required for: ${action.reason}`);
                    action.status = 'pending_approval';
                    continue;
                }
                switch (action.type) {
                    case 'add_agents':
                        await this.executeAddAgents(action);
                        break;
                    case 'optimize_existing':
                        await this.executeOptimizeExisting(action);
                        break;
                    case 'reallocate':
                        await this.executeReallocate(action);
                        break;
                    case 'remove_agents':
                        await this.executeRemoveAgents(action);
                        break;
                }
                action.status = 'completed';
                console.log(`Executed scaling action: ${action.reason}`);
            }
            catch (error) {
                action.status = 'failed';
                console.error(`Failed to execute scaling action: ${action.reason}`, error);
            }
        }
    }
    async executeAddAgents(action) {
        const targetLevel = this.getResourceLevel(action.level);
        if (!targetLevel) {
            throw new Error(`Invalid level: ${action.level}`);
        }
        for (let i = 0; i < action.magnitude; i++) {
            const newAgent = await this.createOptimizedAgent(action.level);
            this.agents.set(newAgent.id, newAgent);
            targetLevel.agents.set(newAgent.id, newAgent);
        }
        targetLevel.availableCapacity = Math.min(1, targetLevel.availableCapacity + action.magnitude * 0.1);
    }
    async createOptimizedAgent(levelId) {
        const level = this.getResourceLevel(levelId);
        const agentTypes = this.getOptimalAgentTypes(levelId);
        const selectedType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
        return {
            id: `${selectedType}-optimized-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: selectedType,
            capabilities: this.generateOptimizedCapabilities(selectedType, levelId),
            currentLoad: 0,
            maxConcurrency: this.getOptimalConcurrency(selectedType),
            performanceHistory: [],
            preferences: this.generateOptimizedPreferences(selectedType, levelId),
            status: 'available',
            costPerHour: this.calculateOptimalCost(selectedType, levelId),
            utilization: {
                current: 0,
                average: 0,
                peak: 0,
                idle: 1,
                efficiency: 0.85,
                burnoutRisk: 0,
                overallHealth: 1,
            },
        };
    }
    getOptimalAgentTypes(levelId) {
        const typeMap = {
            portfolio: ['researcher', 'analyst', 'coordinator'],
            program: ['analyst', 'coordinator', 'coder'],
            swarm: ['coder', 'tester', 'optimizer'],
            shared: [
                'researcher',
                'coder',
                'analyst',
                'optimizer',
                'coordinator',
                'tester',
            ],
        };
        return typeMap[levelId] || ['coder', 'analyst'];
    }
    generateOptimizedCapabilities(type, levelId) {
        const baseCapabilities = this.generateDefaultCapabilities(type);
        const levelBonus = levelId === 'portfolio' ? 0.1 : levelId === 'program' ? 0.05 : 0;
        return baseCapabilities.map((cap) => ({
            ...cap,
            efficiency: Math.min(1, cap.efficiency + levelBonus),
            cost: cap.cost * (1 + levelBonus),
        }));
    }
    getOptimalConcurrency(type) {
        const concurrencyMap = {
            researcher: 2,
            coder: 1,
            analyst: 3,
            optimizer: 2,
            coordinator: 4,
            tester: 3,
        };
        return concurrencyMap[type] || 2;
    }
    generateOptimizedPreferences(type, levelId) {
        const base = this.generateDefaultPreferences(type);
        if (levelId === 'swarm') {
            base.workloadPreferences.type = 'burst';
            base.workloadPreferences.restPeriods = false;
        }
        else if (levelId === 'portfolio') {
            base.workloadPreferences.type = 'steady';
            base.collaborationPreferences = [
                { style: 'independent', preference: 0.8 },
            ];
        }
        return base;
    }
    calculateOptimalCost(type, levelId) {
        const baseCosts = {
            researcher: 100,
            coder: 120,
            analyst: 110,
            optimizer: 115,
            coordinator: 125,
            tester: 95,
        };
        const levelMultiplier = levelId === 'portfolio' ? 1.3 : levelId === 'program' ? 1.1 : 1;
        return baseCosts[type] * levelMultiplier;
    }
    async executeOptimizeExisting(action) {
        const targetLevel = this.getResourceLevel(action.level);
        if (!targetLevel) {
            throw new Error(`Invalid level: ${action.level}`);
        }
        for (const agent of targetLevel.agents.values()) {
            if (agent.utilization) {
                agent.utilization.efficiency = Math.min(1, agent.utilization.efficiency + 0.05);
                agent.utilization.overallHealth = Math.min(1, agent.utilization.overallHealth + 0.02);
            }
            agent.capabilities.forEach((cap) => {
                cap.efficiency = Math.min(1, cap.efficiency + 0.03);
            });
        }
        targetLevel.performanceMetrics.efficiency = Math.min(1, targetLevel.performanceMetrics.efficiency + 0.05);
    }
    async executeReallocate(action) {
        const sourceLevel = this.getResourceLevel(action.level);
        if (!sourceLevel) {
            throw new Error(`Invalid source level: ${action.level}`);
        }
        const candidates = Array.from(sourceLevel.agents.values())
            .filter((agent) => (agent.utilization?.current || 0) < 0.5)
            .slice(0, action.magnitude);
        const targetLevel = this.findLevelWithHighestDemand(action.level);
        if (!targetLevel) {
            throw new Error('No suitable target level found');
        }
        for (const agent of candidates) {
            sourceLevel.agents.delete(agent.id);
            targetLevel.agents.set(agent.id, agent);
            agent.allocation = {
                taskId: `reallocation-${Date.now()}`,
                workflowId: `reallocation-${action.id}`,
                level: targetLevel.id,
                priority: 'medium',
                estimatedDuration: 160,
                allocatedTime: new Date(),
                expectedCompletion: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
            };
        }
    }
    findLevelWithHighestDemand(excludeLevel) {
        const levels = [
            this.resourcePool.portfolioLevel,
            this.resourcePool.programLevel,
            this.resourcePool.swarmLevel,
            this.resourcePool.sharedPool,
        ].filter((level) => level.id !== excludeLevel);
        let highestDemandLevel = null;
        let highestDemand = 0;
        for (const level of levels) {
            const demand = level.performanceMetrics.utilization + (1 - level.availableCapacity);
            if (demand > highestDemand) {
                highestDemand = demand;
                highestDemandLevel = level;
            }
        }
        return highestDemandLevel;
    }
    async executeRemoveAgents(action) {
        const targetLevel = this.getResourceLevel(action.level);
        if (!targetLevel) {
            throw new Error(`Invalid level: ${action.level}`);
        }
        const candidates = Array.from(targetLevel.agents.values())
            .filter((agent) => (agent.utilization?.current || 0) < 0.3 &&
            (!agent.allocation || agent.allocation.priority !== 'critical'))
            .sort((a, b) => (a.utilization?.current || 0) - (b.utilization?.current || 0))
            .slice(0, action.magnitude);
        for (const agent of candidates) {
            targetLevel.agents.delete(agent.id);
            this.agents.delete(agent.id);
        }
        targetLevel.availableCapacity = Math.max(0, targetLevel.availableCapacity - action.magnitude * 0.1);
    }
    async manageCapacityBuffers() {
        try {
            const currentBuffers = this.calculateCurrentBuffers();
            const adjustments = this.calculateBufferAdjustments(currentBuffers);
            await this.applyBufferAdjustments(adjustments);
            const recommendations = this.generateBufferRecommendations(currentBuffers, adjustments);
            return {
                currentBuffers,
                adjustments,
                recommendations,
            };
        }
        catch (error) {
            console.error('Capacity buffer management failed:', error);
            return {
                currentBuffers: [],
                adjustments: [],
                recommendations: [
                    'Error in buffer management - manual review required',
                ],
            };
        }
    }
    calculateCurrentBuffers() {
        const levels = [
            this.resourcePool.portfolioLevel,
            this.resourcePool.programLevel,
            this.resourcePool.swarmLevel,
            this.resourcePool.sharedPool,
        ];
        return levels.map((level) => {
            const totalCapacity = level.agents.size * 40;
            const usedCapacity = totalCapacity * level.performanceMetrics.utilization;
            const bufferCapacity = totalCapacity - usedCapacity;
            const optimalBuffer = totalCapacity * 0.2;
            return {
                levelId: level.id,
                levelName: level.name,
                totalCapacity,
                usedCapacity,
                bufferCapacity,
                optimalBuffer,
                bufferUtilization: bufferCapacity / optimalBuffer,
                status: this.getBufferStatus(bufferCapacity, optimalBuffer),
                risk: this.calculateBufferRisk(bufferCapacity, optimalBuffer),
            };
        });
    }
    getBufferStatus(current, optimal) {
        const ratio = current / optimal;
        if (ratio < 0.5)
            return 'critical';
        if (ratio < 0.8)
            return 'low';
        if (ratio <= 1.2)
            return 'adequate';
        return 'high';
    }
    calculateBufferRisk(current, optimal) {
        const ratio = current / optimal;
        if (ratio < 0.5)
            return 0.9;
        if (ratio < 0.8)
            return 0.6;
        if (ratio <= 1.2)
            return 0.2;
        return 0.1;
    }
    calculateBufferAdjustments(buffers) {
        return buffers
            .filter((buffer) => buffer.status !== 'adequate')
            .map((buffer) => {
            const adjustmentType = buffer.status === 'critical' || buffer.status === 'low'
                ? 'increase'
                : 'decrease';
            const magnitude = Math.abs(buffer.bufferCapacity - buffer.optimalBuffer);
            return {
                levelId: buffer.levelId,
                type: adjustmentType,
                magnitude,
                reason: `Buffer ${buffer.status} - current: ${Math.round(buffer.bufferCapacity)}h, optimal: ${Math.round(buffer.optimalBuffer)}h`,
                priority: buffer.status === 'critical' ? 'high' : 'medium',
                estimatedCost: magnitude * 2.5,
                timeline: buffer.status === 'critical' ? '1 week' : '2-3 weeks',
            };
        });
    }
    async applyBufferAdjustments(adjustments) {
        for (const adjustment of adjustments) {
            try {
                if (adjustment.type === 'increase') {
                    await this.increaseBuffer(adjustment);
                }
                else {
                    await this.decreaseBuffer(adjustment);
                }
                console.log(`Applied buffer adjustment: ${adjustment.reason}`);
            }
            catch (error) {
                console.error(`Failed to apply buffer adjustment: ${adjustment.reason}`, error);
            }
        }
    }
    async increaseBuffer(adjustment) {
        const level = this.getResourceLevel(adjustment.levelId);
        if (!level)
            return;
        const capacityIncrease = adjustment.magnitude / 40 / level.agents.size;
        level.availableCapacity = Math.min(1, level.availableCapacity + capacityIncrease);
        if (adjustment.priority === 'high' && capacityIncrease < 0.1) {
            const additionalAgents = Math.ceil(adjustment.magnitude / 40);
            for (let i = 0; i < additionalAgents; i++) {
                const newAgent = await this.createOptimizedAgent(adjustment.levelId);
                this.agents.set(newAgent.id, newAgent);
                level.agents.set(newAgent.id, newAgent);
            }
        }
    }
    async decreaseBuffer(adjustment) {
        const level = this.getResourceLevel(adjustment.levelId);
        if (!level)
            return;
        const excessCapacity = adjustment.magnitude;
        const targetLevel = this.findLevelWithHighestDemand(adjustment.levelId);
        if (targetLevel) {
            const agentsToTransfer = Math.min(2, Math.floor(excessCapacity / 40));
            if (agentsToTransfer > 0) {
                const candidates = Array.from(level.agents.values()).slice(0, agentsToTransfer);
                for (const agent of candidates) {
                    level.agents.delete(agent.id);
                    targetLevel.agents.set(agent.id, agent);
                }
            }
        }
    }
    generateBufferRecommendations(buffers, adjustments) {
        const recommendations = [];
        const criticalBuffers = buffers.filter((b) => b.status === 'critical').length;
        const lowBuffers = buffers.filter((b) => b.status === 'low').length;
        if (criticalBuffers > 0) {
            recommendations.push(`${criticalBuffers} level(s) have critical buffer shortage - immediate action required`);
        }
        if (lowBuffers > 1) {
            recommendations.push(`${lowBuffers} level(s) have low buffers - consider systematic capacity review`);
        }
        for (const buffer of buffers) {
            if (buffer.status === 'critical') {
                recommendations.push(`${buffer.levelName}: Add ${Math.ceil(buffer.optimalBuffer / 40)} agents or reduce workload by ${Math.round((1 - buffer.bufferUtilization) * 100)}%`);
            }
            else if (buffer.status === 'high') {
                recommendations.push(`${buffer.levelName}: Excess capacity available - consider reallocating ${Math.floor(buffer.bufferCapacity / 40)} agents`);
            }
        }
        const highPriorityAdjustments = adjustments.filter((a) => a.priority === 'high').length;
        if (highPriorityAdjustments > 0) {
            recommendations.push(`${highPriorityAdjustments} high-priority buffer adjustments planned - monitor closely`);
        }
        return recommendations.length > 0
            ? recommendations
            : ['All capacity buffers are within optimal range'];
    }
    async predictResourceDemand(timeframe) {
        try {
            const historicalData = this.analyzeHistoricalDemand();
            const demandForecast = this.generateDemandForecast(historicalData, timeframe);
            const confidenceInterval = this.calculateForecastConfidence(historicalData);
            const riskFactors = this.identifyDemandRiskFactors(demandForecast);
            const recommendations = this.generateDemandRecommendations(demandForecast, riskFactors);
            return {
                demandForecast,
                confidenceInterval,
                riskFactors,
                recommendations,
            };
        }
        catch (error) {
            console.error('Demand prediction failed:', error);
            return {
                demandForecast: [],
                confidenceInterval: 0.5,
                riskFactors: ['Prediction error - using default assumptions'],
                recommendations: ['Manual demand planning recommended'],
            };
        }
    }
    analyzeHistoricalDemand() {
        return {
            totalTasks: 250,
            tasksByType: {
                research: 50,
                coding: 120,
                analysis: 45,
                coordination: 20,
                testing: 15,
            },
            seasonalPatterns: {
                highDemandPeriods: ['Q1', 'Q3'],
                lowDemandPeriods: ['Q2'],
                peakUtilization: 0.9,
                lowUtilization: 0.6,
            },
            trendAnalysis: {
                growthRate: 0.15,
                volatility: 0.2,
                cyclicality: 0.1,
            },
        };
    }
    generateDemandForecast(historical, timeframe) {
        const periods = this.getPeriodsFromTimeframe(timeframe);
        const forecast = [];
        for (let i = 0; i < periods; i++) {
            const period = `week-${i + 1}`;
            const baseVolume = historical.totalTasks / 52;
            const trendAdjustment = baseVolume * historical.trendAnalysis.growthRate * (i / 52);
            const seasonalAdjustment = this.getSeasonalAdjustment(i, historical);
            const adjustedVolume = baseVolume + trendAdjustment + seasonalAdjustment;
            for (const [taskType, historicalCount] of Object.entries(historical.tasksByType)) {
                const typeRatio = historicalCount / historical.totalTasks;
                const predictedVolume = adjustedVolume * typeRatio;
                forecast.push({
                    period,
                    taskType,
                    predictedVolume,
                    complexity: this.getPredictedComplexity(taskType),
                    urgency: this.getPredictedUrgency(taskType, i),
                    confidence: this.calculatePeriodConfidence(i),
                    resourceHours: predictedVolume * this.getAverageTaskDuration(taskType),
                });
            }
        }
        return forecast;
    }
    getPeriodsFromTimeframe(timeframe) {
        if (timeframe.includes('week')) {
            return Number.parseInt(timeframe.split('-')[0]) || 4;
        }
        return 4;
    }
    getSeasonalAdjustment(weekIndex, historical) {
        const quarterIndex = Math.floor(weekIndex / 13);
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const currentQuarter = quarters[quarterIndex % 4];
        if (historical.seasonalPatterns.highDemandPeriods.includes(currentQuarter)) {
            return (historical.totalTasks * 0.2) / 52;
        }
        if (historical.seasonalPatterns.lowDemandPeriods.includes(currentQuarter)) {
            return (-historical.totalTasks * 0.1) / 52;
        }
        return 0;
    }
    getPredictedComplexity(taskType) {
        const complexityMap = {
            research: 0.7,
            coding: 0.8,
            analysis: 0.6,
            coordination: 0.5,
            testing: 0.6,
        };
        return complexityMap[taskType] || 0.6;
    }
    getPredictedUrgency(taskType, weekIndex) {
        const quarterProgress = (weekIndex % 13) / 13;
        const baseUrgency = taskType === 'coordination' ? 0.8 : 0.6;
        return Math.min(1, baseUrgency + quarterProgress * 0.2);
    }
    calculatePeriodConfidence(weekIndex) {
        return Math.max(0.5, 1 - weekIndex * 0.05);
    }
    getAverageTaskDuration(taskType) {
        const durationMap = {
            research: 16,
            coding: 20,
            analysis: 12,
            coordination: 8,
            testing: 10,
        };
        return durationMap[taskType] || 15;
    }
    calculateForecastConfidence(historical) {
        const volatilityPenalty = historical.trendAnalysis.volatility * 0.3;
        const baseConfidence = 0.8;
        return Math.max(0.5, baseConfidence - volatilityPenalty);
    }
    identifyDemandRiskFactors(forecast) {
        const risks = [];
        const avgVolume = forecast.reduce((sum, p) => sum + p.predictedVolume, 0) / forecast.length;
        const spikes = forecast.filter((p) => p.predictedVolume > avgVolume * 1.5);
        if (spikes.length > 0) {
            risks.push(`${spikes.length} periods with demand spikes (>50% above average)`);
        }
        const highComplexity = forecast.filter((p) => p.complexity > 0.75 && p.predictedVolume > avgVolume);
        if (highComplexity.length > 0) {
            risks.push(`${highComplexity.length} periods with high complexity + high volume`);
        }
        const lowConfidence = forecast.filter((p) => p.confidence < 0.6);
        if (lowConfidence.length > 0) {
            risks.push(`${lowConfidence.length} periods with low prediction confidence`);
        }
        return risks.length > 0
            ? risks
            : ['No significant risk factors identified'];
    }
    generateDemandRecommendations(forecast, risks) {
        const recommendations = [];
        const totalHours = forecast.reduce((sum, p) => sum + p.resourceHours, 0);
        const requiredAgents = Math.ceil(totalHours / ((40 * forecast.length) / 7));
        recommendations.push(`Estimated ${requiredAgents} agents required for forecasted demand`);
        if (risks.some((r) => r.includes('demand spikes'))) {
            recommendations.push('Consider flexible capacity or overtime arrangements for demand spikes');
        }
        if (risks.some((r) => r.includes('high complexity'))) {
            recommendations.push('Ensure senior agents available for high complexity periods');
        }
        if (risks.some((r) => r.includes('low confidence'))) {
            recommendations.push('Plan for demand variability - maintain higher capacity buffers');
        }
        const codingDemand = forecast
            .filter((p) => p.taskType === 'coding')
            .reduce((sum, p) => sum + p.predictedVolume, 0);
        if (codingDemand > totalHours * 0.6) {
            recommendations.push('High coding demand forecasted - ensure sufficient developer capacity');
        }
        return recommendations;
    }
    getCrossLevelPerformance() {
        const activeTransferCount = this.activeTransfers.size;
        const completedTransfers = Array.from(this.activeTransfers.values()).filter((t) => t.status === 'completed').length;
        if (activeTransferCount > 0) {
            this.performanceTracking.transferSuccessRate =
                completedTransfers / activeTransferCount;
        }
        const levels = [
            this.resourcePool.portfolioLevel,
            this.resourcePool.programLevel,
            this.resourcePool.swarmLevel,
            this.resourcePool.sharedPool,
        ];
        const avgEfficiency = levels.reduce((sum, level) => sum + level.performanceMetrics.efficiency, 0) / levels.length;
        this.performanceTracking.crossLevelEfficiency = avgEfficiency;
        this.performanceTracking.overallSystemHealth =
            this.performanceTracking.crossLevelEfficiency * 0.3 +
                this.performanceTracking.transferSuccessRate * 0.2 +
                this.performanceTracking.costOptimization * 0.2 +
                this.performanceTracking.skillDevelopmentRate * 0.15 +
                (1 - this.performanceTracking.conflictResolutionTime / 24) * 0.15;
        return { ...this.performanceTracking };
    }
    shutdown() {
        for (const transfer of this.activeTransfers.values()) {
            if (transfer.status === 'active') {
                this.returnTransferredResource(transfer.id);
            }
        }
        console.log('Dynamic Resource Manager shutting down');
    }
}
export default DynamicResourceManager;
//# sourceMappingURL=resource-manager.js.map