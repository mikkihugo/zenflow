import { getLogger } from '../../config/logging-config.ts';
import { createDSPyWrapper } from '../../neural/dspy-wrapper.ts';
const logger = getLogger('DSPySwarmCoordinator');
export class DSPySwarmCoordinator {
    dspyWrapper = null;
    agents = new Map();
    tasks = new Map();
    topology;
    coordinationProgram = null;
    learningHistory = [];
    constructor(config = {}) {
        this.topology = {
            type: config?.topology || 'mesh',
            agents: [],
            connections: [],
            coordinationStrategy: 'adaptive',
        };
        logger.info('DSPy Swarm Coordinator initialized', {
            topology: this.topology.type,
            model: config?.model,
        });
    }
    async initialize(config) {
        try {
            this.dspyWrapper = await createDSPyWrapper(config || {
                model: 'claude-3-5-sonnet-20241022',
                temperature: 0.1,
                maxTokens: 2000,
            });
            this.coordinationProgram = await this.dspyWrapper.createProgram('task_description: string, available_agents: array, swarm_state: object -> optimal_assignment: object, coordination_plan: array, expected_outcome: string', 'Intelligently coordinate DSPy agents for optimal task execution and learning');
            await this.initializeDefaultAgents();
            logger.info('DSPy Swarm Coordinator initialized successfully', {
                agentCount: this.agents.size,
                topology: this.topology.type,
            });
        }
        catch (error) {
            logger.error('Failed to initialize DSPy Swarm Coordinator:', error);
            throw error;
        }
    }
    async initializeDefaultAgents() {
        if (!this.dspyWrapper)
            throw new Error('DSPy wrapper not initialized');
        const agentConfigs = [
            {
                type: 'coder',
                name: 'Code Generator',
                signature: 'requirements: string, context: string, style_guide: string -> code: string, tests: array, documentation: string',
                description: 'Generate high-quality code with tests and documentation based on requirements',
                capabilities: [
                    'code-generation',
                    'testing',
                    'documentation',
                    'typescript',
                    'javascript',
                ],
            },
            {
                type: 'analyst',
                name: 'Code Analyzer',
                signature: 'code: string, file_path: string, project_context: string -> analysis: object, issues: array, suggestions: array',
                description: 'Analyze code quality, identify issues, and suggest improvements',
                capabilities: [
                    'code-analysis',
                    'quality-assessment',
                    'refactoring',
                    'patterns',
                ],
            },
            {
                type: 'architect',
                name: 'System Architect',
                signature: 'requirements: string, constraints: array, domain: string -> architecture: object, components: array, patterns: array',
                description: 'Design optimal system architectures and component structures',
                capabilities: [
                    'architecture-design',
                    'system-design',
                    'patterns',
                    'scalability',
                ],
            },
            {
                type: 'tester',
                name: 'Test Engineer',
                signature: 'code: string, requirements: string, test_strategy: string -> test_suite: object, coverage: number, quality_score: number',
                description: 'Create comprehensive test suites and quality assessments',
                capabilities: [
                    'test-generation',
                    'quality-assurance',
                    'coverage-analysis',
                    'validation',
                ],
            },
            {
                type: 'researcher',
                name: 'Research Specialist',
                signature: 'query: string, domain: string, depth: string -> research: object, sources: array, insights: array',
                description: 'Conduct deep research and provide insights on technical topics',
                capabilities: [
                    'research',
                    'analysis',
                    'documentation',
                    'knowledge-synthesis',
                ],
            },
            {
                type: 'coordinator',
                name: 'Task Coordinator',
                signature: 'tasks: array, agents: array, dependencies: array -> execution_plan: object, assignments: array, timeline: string',
                description: 'Coordinate complex multi-agent tasks with optimal resource allocation',
                capabilities: [
                    'coordination',
                    'planning',
                    'resource-allocation',
                    'optimization',
                ],
            },
        ];
        for (const config of agentConfigs) {
            await this.createDSPyAgent(config);
        }
        this.topology.agents = Array.from(this.agents.values());
        this.updateTopologyConnections();
    }
    async createDSPyAgent(config) {
        if (!this.dspyWrapper)
            throw new Error('DSPy wrapper not initialized');
        const program = await this.dspyWrapper.createProgram(config?.signature, config?.description);
        const agent = {
            id: `dspy-${config?.type}-${Date.now()}`,
            type: config?.type,
            name: config?.name,
            program,
            signature: config?.signature,
            capabilities: config?.capabilities,
            performance: {
                accuracy: 0.8,
                responseTime: 1000,
                successRate: 0.8,
                learningExamples: 0,
            },
            status: 'idle',
            lastOptimization: new Date(),
        };
        this.agents.set(agent.id, agent);
        logger.info(`Created DSPy agent: ${config?.name}`, {
            id: agent.id,
            type: config?.type,
            capabilities: config?.capabilities,
        });
        return agent;
    }
    async executeTask(task) {
        const taskId = `task-${Date.now()}`;
        const fullTask = { ...task, id: taskId };
        this.tasks.set(taskId, fullTask);
        logger.info(`Starting task execution: ${task.type}`, {
            taskId,
            complexity: task.complexity,
        });
        try {
            const optimalAgent = await this.selectOptimalAgent(fullTask);
            if (!optimalAgent) {
                throw new Error(`No suitable agent found for task: ${task.type}`);
            }
            const result = await this.executeWithAgent(fullTask, optimalAgent);
            fullTask.result = result;
            fullTask.success = true;
            fullTask.endTime = new Date();
            fullTask.assignedAgent = optimalAgent.id;
            this.recordLearningExample(fullTask, optimalAgent, result, true);
            await this.updateAgentPerformance(optimalAgent, fullTask, true);
            logger.info(`Task completed successfully`, {
                taskId,
                agentId: optimalAgent.id,
                duration: fullTask.endTime.getTime() - (fullTask.startTime?.getTime() || 0),
            });
            return fullTask;
        }
        catch (error) {
            fullTask.success = false;
            fullTask.endTime = new Date();
            logger.error(`Task execution failed: ${taskId}`, error);
            throw error;
        }
    }
    async selectOptimalAgent(task) {
        if (!(this.coordinationProgram && this.dspyWrapper)) {
            return this.fallbackAgentSelection(task);
        }
        try {
            const availableAgents = Array.from(this.agents.values()).filter((a) => a.status === 'idle');
            const coordinationResult = await this.dspyWrapper.execute(this.coordinationProgram, {
                task_description: `${task.type}: ${task.description}`,
                available_agents: availableAgents.map((a) => ({
                    id: a.id,
                    type: a.type,
                    capabilities: a.capabilities,
                    performance: a.performance,
                })),
                swarm_state: {
                    topology: this.topology.type,
                    taskLoad: this.tasks.size,
                    learningHistory: this.learningHistory.length,
                },
            });
            if (coordinationResult?.success &&
                coordinationResult?.result &&
                coordinationResult?.result?.['optimal_assignment']) {
                const optimalAssignment = coordinationResult?.result?.['optimal_assignment'];
                const selectedAgentId = optimalAssignment?.agent_id;
                const selectedAgent = selectedAgentId
                    ? this.agents.get(selectedAgentId)
                    : undefined;
                if (selectedAgent) {
                    logger.debug(`DSPy coordination selected agent: ${selectedAgent?.name}`, {
                        reasoning: optimalAssignment?.reasoning,
                    });
                    return selectedAgent;
                }
            }
            return this.fallbackAgentSelection(task);
        }
        catch (error) {
            logger.warn('DSPy agent selection failed, using fallback', error);
            return this.fallbackAgentSelection(task);
        }
    }
    fallbackAgentSelection(task) {
        const suitableAgents = Array.from(this.agents.values()).filter((agent) => agent.status === 'idle' &&
            task.requiredCapabilities.some((cap) => agent.capabilities.includes(cap)));
        if (suitableAgents.length === 0)
            return null;
        return (suitableAgents.sort((a, b) => b.performance.successRate - a.performance.successRate)[0] || null);
    }
    async executeWithAgent(task, agent) {
        if (!this.dspyWrapper)
            throw new Error('DSPy wrapper not initialized');
        agent.status = 'busy';
        task.startTime = new Date();
        try {
            const executionResult = await this.dspyWrapper.execute(agent.program, task.input);
            if (!executionResult?.success) {
                throw new Error(`Agent execution failed: ${executionResult?.error?.message}`);
            }
            return executionResult?.result;
        }
        finally {
            agent.status = 'idle';
        }
    }
    recordLearningExample(task, agent, result, success) {
        const example = {
            taskId: task.id,
            agentId: agent.id,
            input: task.input || {},
            output: result || {},
            success,
            timestamp: new Date(),
        };
        this.learningHistory.push(example);
        if (this.learningHistory.length > 1000) {
            this.learningHistory = this.learningHistory.slice(-1000);
        }
        logger.debug(`Recorded learning example`, {
            taskType: task.type,
            agentType: agent.type,
            success,
        });
    }
    async updateAgentPerformance(agent, task, success) {
        const duration = (task.endTime?.getTime() || 0) - (task.startTime?.getTime() || 0);
        agent.performance.responseTime =
            (agent.performance.responseTime + duration) / 2;
        agent.performance.successRate =
            agent.performance.successRate * 0.9 + (success ? 0.1 : 0);
        if (success) {
            agent.performance.learningExamples++;
        }
        if (agent.performance.learningExamples > 0 &&
            agent.performance.learningExamples % 10 === 0) {
            await this.optimizeAgent(agent);
        }
    }
    async optimizeAgent(agent) {
        if (!this.dspyWrapper)
            return;
        agent.status = 'optimizing';
        try {
            const agentExamples = this.learningHistory
                .filter((ex) => ex.agentId === agent.id && ex.success)
                .slice(-20)
                .map((ex) => ({
                input: ex.input,
                output: ex.output,
                metadata: {
                    quality: 1.0,
                    timestamp: ex.timestamp,
                    source: 'swarm-learning',
                },
            }));
            if (agentExamples.length < 3) {
                logger.debug(`Not enough examples for optimization: ${agent.name}`, {
                    examples: agentExamples.length,
                });
                return;
            }
            await this.dspyWrapper.addExamples(agent.program, agentExamples);
            const optimizationResult = await this.dspyWrapper.optimize(agent.program, {
                strategy: 'bootstrap',
                maxIterations: 3,
                minExamples: Math.min(agentExamples.length, 5),
                evaluationMetric: 'accuracy',
            });
            if (optimizationResult?.success && optimizationResult?.program) {
                agent.program = optimizationResult?.program;
                if (optimizationResult?.metrics?.finalAccuracy) {
                    agent.performance.accuracy =
                        optimizationResult?.metrics?.finalAccuracy;
                }
                agent.lastOptimization = new Date();
                logger.info(`Agent optimized successfully: ${agent.name}`, {
                    accuracy: agent.performance.accuracy,
                    improvement: optimizationResult?.metrics?.improvementPercent,
                    examples: agentExamples.length,
                });
            }
        }
        catch (error) {
            logger.error(`Failed to optimize agent: ${agent.name}`, error);
        }
        finally {
            agent.status = 'idle';
        }
    }
    updateTopologyConnections() {
        const agents = this.topology.agents;
        this.topology.connections = [];
        switch (this.topology.type) {
            case 'mesh':
                for (let i = 0; i < agents.length; i++) {
                    for (let j = i + 1; j < agents.length; j++) {
                        const agent1 = agents[i];
                        const agent2 = agents[j];
                        if (agent1 && agent2) {
                            this.topology.connections.push({
                                from: agent1.id,
                                to: agent2.id,
                                weight: this.calculateConnectionWeight(agent1, agent2),
                                messageTypes: ['coordination', 'data', 'results'],
                            });
                        }
                    }
                }
                break;
            case 'hierarchical': {
                const coordinator = agents.find((a) => a.type === 'coordinator');
                if (coordinator) {
                    agents
                        .filter((a) => a.id !== coordinator.id)
                        .forEach((agent) => {
                        this.topology.connections.push({
                            from: coordinator.id,
                            to: agent.id,
                            weight: 1.0,
                            messageTypes: ['tasks', 'coordination'],
                        });
                    });
                }
                break;
            }
            case 'ring':
                for (let i = 0; i < agents.length; i++) {
                    const nextIndex = (i + 1) % agents.length;
                    const currentAgent = agents[i];
                    const nextAgent = agents[nextIndex];
                    if (currentAgent && nextAgent) {
                        this.topology.connections.push({
                            from: currentAgent?.id,
                            to: nextAgent.id,
                            weight: 1.0,
                            messageTypes: ['coordination', 'data'],
                        });
                    }
                }
                break;
        }
        logger.debug(`Updated topology connections: ${this.topology.type}`, {
            agents: agents.length,
            connections: this.topology.connections.length,
        });
    }
    calculateConnectionWeight(agent1, agent2) {
        const performanceSimilarity = 1 -
            Math.abs(agent1.performance.successRate - agent2.performance.successRate);
        const capabilityOverlap = agent1.capabilities.filter((cap) => agent2.capabilities.includes(cap)).length;
        const capabilityComplement = agent1.capabilities.length +
            agent2.capabilities.length -
            capabilityOverlap;
        return performanceSimilarity * 0.3 + (capabilityComplement * 0.7) / 10;
    }
    getSwarmStatus() {
        const agents = Array.from(this.agents.values());
        const completedTasks = Array.from(this.tasks.values()).filter((t) => t.success === true).length;
        return {
            agents: agents.map((agent) => ({
                id: agent.id,
                name: agent.name,
                type: agent.type,
                status: agent.status,
                performance: agent.performance,
                lastOptimization: agent.lastOptimization,
            })),
            topology: this.topology,
            activeTasks: Array.from(this.tasks.values()).filter((t) => t.success === undefined).length,
            completedTasks,
            learningExamples: this.learningHistory.length,
            overallPerformance: {
                averageAccuracy: agents.reduce((sum, a) => sum + a.performance.accuracy, 0) /
                    agents.length,
                averageResponseTime: agents.reduce((sum, a) => sum + a.performance.responseTime, 0) /
                    agents.length,
                successRate: completedTasks / Math.max(this.tasks.size, 1),
            },
        };
    }
    async cleanup() {
        for (const agent of Array.from(this.agents.values())) {
            agent.status = 'idle';
        }
        this.learningHistory = [];
        if (this.dspyWrapper?.cleanup) {
            await this.dspyWrapper.cleanup();
        }
        logger.info('DSPy Swarm Coordinator cleaned up');
    }
}
export default DSPySwarmCoordinator;
//# sourceMappingURL=dspy-swarm-coordinator.js.map