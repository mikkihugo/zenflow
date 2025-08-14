import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('coordination-strategies-ruv-swarmstrategy');
import { ZenSwarm } from '../swarm/core/index.js';
export class ZenSwarmStrategy {
    swarm;
    constructor() {
        this.swarm = new ZenSwarm();
    }
    async createAgent(config) {
        const agentId = this.swarm.addAgent(config);
        return {
            id: agentId,
            name: config?.name || `Agent-${agentId}`,
            type: config?.type || 'researcher',
            capabilities: config?.capabilities || [],
            status: 'idle',
            metadata: config?.metadata || {},
        };
    }
    async destroyAgent(agentId) {
        this.swarm.removeAgent(agentId);
    }
    async sendMessage(_agentId, _message) {
        logger.warn('sendMessage is not implemented in ZenSwarmStrategy');
    }
    async assignTaskToAgent(_agentId, task) {
        const swarmTask = { ...task, id: `task-${Date.now()}` };
        await this.swarm.submitTask(swarmTask);
    }
    async getAgents() {
        const agents = this.swarm
            .getTasksByStatus('in_progress')
            .flatMap((t) => t.assignedAgents || []);
        return agents.map((a) => ({
            id: a,
            name: `Agent-${a}`,
            type: 'researcher',
            capabilities: [],
            status: 'busy',
            metadata: {},
        }));
    }
}
