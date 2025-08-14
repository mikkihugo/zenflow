import { EventEmitter } from 'node:events';
export class SwarmCoordinator extends EventEmitter {
    agents = new Map();
    tasks = new Map();
    metrics = {
        agentCount: 0,
        activeAgents: 0,
        totalTasks: 0,
        completedTasks: 0,
        averageResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        uptime: 0,
    };
    startTime = Date.now();
    swarmId = `swarm-${Date.now()}`;
    state = 'initializing';
    async initialize(config) {
        this.state = 'active';
        this.emit('swarm:initialized', { swarmId: this.swarmId, config });
    }
    async shutdown() {
        this.state = 'terminated';
        this.agents.clear();
        this.tasks.clear();
        this.emit('swarm:shutdown', { swarmId: this.swarmId });
    }
    getState() {
        return this.state;
    }
    getSwarmId() {
        return this.swarmId;
    }
    getAgentCount() {
        return this.agents.size;
    }
    getActiveAgents() {
        return Array.from(this.agents.values())
            .filter((agent) => agent.status === 'idle' || agent.status === 'busy')
            .map((agent) => agent.id);
    }
    getTaskCount() {
        return this.tasks.size;
    }
    getUptime() {
        return Date.now() - this.startTime;
    }
    async addAgent(agent) {
        const fullAgent = {
            ...agent,
            performance: {
                tasksCompleted: 0,
                averageResponseTime: 0,
                errorRate: 0,
            },
            connections: [],
        };
        this.agents.set(agent.id, fullAgent);
        this.updateMetrics();
        this.emit('agent:added', { agent: fullAgent });
    }
    async removeAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        this.agents.delete(agentId);
        this.updateMetrics();
        this.emit('agent:removed', { agentId, agent });
    }
    getAgents() {
        return Array.from(this.agents.values());
    }
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    async assignTask(task) {
        const suitableAgents = this.findSuitableAgents(task.requirements);
        if (suitableAgents.length === 0) {
            return null;
        }
        const bestAgent = this.selectBestAgent(suitableAgents);
        bestAgent.status = 'busy';
        this.tasks.set(task.id, {
            ...task,
            assignedTo: bestAgent.id,
            startTime: Date.now(),
        });
        this.updateMetrics();
        this.emit('task:assigned', { task, agentId: bestAgent.id });
        return bestAgent.id;
    }
    async completeTask(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        const agent = this.agents.get(task.assignedTo);
        if (agent) {
            agent.status = 'idle';
            agent.performance.tasksCompleted++;
            const duration = Date.now() - task.startTime;
            agent.performance.averageResponseTime =
                (agent.performance.averageResponseTime *
                    (agent.performance.tasksCompleted - 1) +
                    duration) /
                    agent.performance.tasksCompleted;
        }
        this.tasks.delete(taskId);
        this.updateMetrics();
        this.emit('task:completed', {
            taskId,
            result,
            duration: Date.now() - task.startTime,
        });
    }
    getMetrics() {
        return { ...this.metrics };
    }
    async coordinateSwarm(agents, topology) {
        const startTime = Date.now();
        let successfulCoordinations = 0;
        const latencies = [];
        for (const agent of agents) {
            try {
                const coordinationStart = Date.now();
                await this.coordinateAgent(agent, topology);
                const latency = Date.now() - coordinationStart;
                latencies.push(latency);
                successfulCoordinations++;
            }
            catch (error) {
                this.emit('coordination:error', { agentId: agent.id, error });
            }
        }
        const averageLatency = latencies.length > 0
            ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
            : 0;
        const successRate = agents.length > 0 ? successfulCoordinations / agents.length : 0;
        const totalCoordinationTime = Date.now() - startTime;
        this.emit('coordination:performance', {
            totalAgents: agents.length,
            successfulCoordinations,
            averageLatency,
            successRate,
            totalCoordinationTime,
            timestamp: new Date(),
        });
        return {
            success: successRate > 0.8,
            averageLatency,
            successRate,
            agentsCoordinated: successfulCoordinations,
        };
    }
    async coordinateAgent(agent, _topology) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10 + 1));
        if (this.agents.has(agent.id)) {
            const existingAgent = this.agents.get(agent.id);
            existingAgent.status = agent.status;
            existingAgent.capabilities = agent.capabilities;
        }
        else {
            await this.addAgent(agent);
        }
    }
    findSuitableAgents(requirements) {
        return Array.from(this.agents.values()).filter((agent) => {
            return (agent.status === 'idle' &&
                requirements.every((req) => agent.capabilities.includes(req)));
        });
    }
    selectBestAgent(agents) {
        return agents.reduce((best, current) => {
            const bestScore = this.calculateAgentScore(best);
            const currentScore = this.calculateAgentScore(current);
            return currentScore > bestScore ? current : best;
        });
    }
    calculateAgentScore(agent) {
        const completionRate = agent.performance.tasksCompleted;
        const errorPenalty = agent.performance.errorRate * 100;
        const responsePenalty = agent.performance.averageResponseTime / 1000;
        return completionRate - errorPenalty - responsePenalty;
    }
    updateMetrics() {
        const agents = Array.from(this.agents.values());
        this.metrics.agentCount = agents.length;
        this.metrics.activeAgents = agents.filter((a) => a.status !== 'offline').length;
        if (agents.length > 0) {
            const totalTasks = agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0);
            const totalResponseTime = agents.reduce((sum, a) => sum + a.performance.averageResponseTime, 0);
            const totalErrors = agents.reduce((sum, a) => sum + a.performance.errorRate, 0);
            this.metrics.completedTasks = totalTasks;
            this.metrics.averageResponseTime = totalResponseTime / agents.length;
            this.metrics.errorRate = totalErrors / agents.length;
            this.metrics.uptime = Date.now() - this.startTime;
            this.metrics.throughput = totalTasks / (this.metrics.uptime / 1000 / 60);
        }
    }
}
export default SwarmCoordinator;
//# sourceMappingURL=swarm-coordinator.js.map