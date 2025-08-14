import { EventEmitter } from 'node:events';
export class MemoryCoordinator extends EventEmitter {
    nodes = new Map();
    decisions = new Map();
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    async registerNode(id, backend) {
        const node = {
            id,
            backend,
            status: 'active',
            lastHeartbeat: Date.now(),
            load: 0,
            capacity: 1000,
        };
        this.nodes.set(id, node);
        this.emit('nodeRegistered', { nodeId: id, node });
    }
    async unregisterNode(id) {
        this.nodes.delete(id);
        this.emit('nodeUnregistered', { nodeId: id });
    }
    async coordinate(operation) {
        const decision = {
            id: `coord_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            type: operation.type || 'read',
            sessionId: operation.sessionId || '',
            target: operation.target || '',
            participants: this.selectParticipants(operation.type || 'read'),
            status: 'pending',
            timestamp: Date.now(),
            metadata: operation.metadata,
        };
        this.decisions.set(decision.id, decision);
        this.emit('coordinationStarted', decision);
        try {
            await this.executeCoordination(decision);
            decision.status = 'completed';
            this.emit('coordinationCompleted', decision);
        }
        catch (error) {
            decision.status = 'failed';
            this.emit('coordinationFailed', { decision, error });
            throw error;
        }
        return decision;
    }
    selectParticipants(operationType) {
        const activeNodes = Array.from(this.nodes.entries())
            .filter(([, node]) => node?.status === 'active')
            .sort(([, a], [, b]) => a.load - b.load);
        if (operationType === 'read') {
            return activeNodes?.slice(0, 1).map(([id]) => id);
        }
        if (operationType === 'write') {
            const replicationCount = Math.min(this.config.distributed.replication, activeNodes.length);
            return activeNodes?.slice(0, replicationCount).map(([id]) => id);
        }
        return activeNodes?.slice(0, 1).map(([id]) => id);
    }
    async executeCoordination(decision) {
        decision.status = 'executing';
        switch (decision.type) {
            case 'read':
                await this.executeRead(decision);
                break;
            case 'write':
                await this.executeWrite(decision);
                break;
            case 'delete':
                await this.executeDelete(decision);
                break;
            case 'sync':
                await this.executeSync(decision);
                break;
            case 'repair':
                await this.executeRepair(decision);
                break;
            default:
                throw new Error(`Unknown coordination type: ${decision.type}`);
        }
    }
    async executeRead(decision) {
        const node = this.nodes.get(decision.participants[0]);
        if (!node) {
            throw new Error(`Node not found: ${decision.participants[0]}`);
        }
        return await node?.backend?.retrieve(decision.target);
    }
    async executeWrite(decision) {
        const writePromises = decision.participants.map(async (nodeId) => {
            const node = this.nodes.get(nodeId);
            if (!node) {
                throw new Error(`Node not found: ${nodeId}`);
            }
            return await node?.backend?.store(decision.target, decision.metadata?.data);
        });
        if (this.config.distributed.consistency === 'strong') {
            await Promise.all(writePromises);
        }
        else {
            const quorum = Math.ceil(decision.participants.length * this.config.consensus.quorum);
            await Promise.race([
                Promise.all(writePromises.slice(0, quorum)),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Quorum timeout')), this.config.consensus.timeout)),
            ]);
        }
    }
    async executeDelete(decision) {
        const deletePromises = decision.participants.map(async (nodeId) => {
            const node = this.nodes.get(nodeId);
            if (!node) {
                throw new Error(`Node not found: ${nodeId}`);
            }
            return await node?.backend?.delete(decision.target);
        });
        await Promise.all(deletePromises);
    }
    async executeSync(decision) {
        const sourceNode = this.nodes.get(decision.participants[0]);
        if (!sourceNode) {
            throw new Error(`Source node not found: ${decision.participants[0]}`);
        }
        for (let i = 1; i < decision.participants.length; i++) {
            const targetNode = this.nodes.get(decision.participants[i]);
            if (!targetNode) {
                continue;
            }
            const data = await sourceNode?.backend?.retrieve(decision.target);
            if (data) {
                await targetNode?.backend?.store(decision.target, data);
            }
        }
    }
    async executeRepair(decision) {
        const values = await Promise.all(decision.participants.map(async (nodeId) => {
            const node = this.nodes.get(nodeId);
            if (!node)
                return null;
            try {
                return await node?.backend?.retrieve(decision.target);
            }
            catch {
                return null;
            }
        }));
        const validValues = values.filter((v) => v !== null);
        if (validValues.length === 0)
            return;
        const valueCount = new Map();
        validValues.forEach((value) => {
            const key = JSON.stringify(value);
            valueCount.set(key, (valueCount.get(key) || 0) + 1);
        });
        const [winningValue] = Array.from(valueCount.entries()).sort(([, a], [, b]) => b - a)[0];
        const correctValue = JSON.parse(winningValue);
        const repairPromises = decision.participants.map(async (nodeId) => {
            const node = this.nodes.get(nodeId);
            if (!node)
                return;
            await node?.backend?.store(decision.target, correctValue);
        });
        await Promise.all(repairPromises);
    }
    getStats() {
        return {
            nodes: {
                total: this.nodes.size,
                active: Array.from(this.nodes.values()).filter((n) => n.status === 'active').length,
                degraded: Array.from(this.nodes.values()).filter((n) => n.status === 'degraded').length,
            },
            decisions: {
                total: this.decisions.size,
                pending: Array.from(this.decisions.values()).filter((d) => d.status === 'pending').length,
                executing: Array.from(this.decisions.values()).filter((d) => d.status === 'executing').length,
                completed: Array.from(this.decisions.values()).filter((d) => d.status === 'completed').length,
                failed: Array.from(this.decisions.values()).filter((d) => d.status === 'failed').length,
            },
            config: this.config,
        };
    }
    async store(key, data, options) {
        const decision = await this.coordinate({
            type: 'write',
            target: key,
            metadata: { data, options },
        });
        if (decision.status === 'failed') {
            throw new Error(`Failed to store data for key: ${key}`);
        }
    }
    async get(key) {
        const decision = await this.coordinate({
            type: 'read',
            target: key,
        });
        if (decision.status === 'failed') {
            throw new Error(`Failed to retrieve data for key: ${key}`);
        }
        return await this.executeRead(decision);
    }
    async deleteEntry(key) {
        const decision = await this.coordinate({
            type: 'delete',
            target: key,
        });
        if (decision.status === 'failed') {
            throw new Error(`Failed to delete data for key: ${key}`);
        }
    }
    async list(pattern) {
        const results = [];
        const activeNodes = Array.from(this.nodes.values()).filter((n) => n.status === 'active');
        for (const node of activeNodes) {
            try {
                if ('keys' in node?.backend &&
                    typeof node?.backend?.keys === 'function') {
                    const keys = await node?.backend?.keys();
                    const matchingKeys = keys.filter((key) => this.matchesPattern(key, pattern));
                    for (const key of matchingKeys) {
                        try {
                            const value = await node?.backend?.retrieve(key);
                            results?.push({ key, value });
                        }
                        catch (_error) { }
                    }
                }
            }
            catch (_error) { }
        }
        const uniqueResults = new Map();
        for (const result of results) {
            if (!uniqueResults?.has(result?.key)) {
                uniqueResults?.set(result?.key, result);
            }
        }
        return Array.from(uniqueResults?.values());
    }
    matchesPattern(key, pattern) {
        const regexPattern = pattern
            .replace(/\\/g, '\\\\')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(key);
    }
    async healthCheck() {
        const stats = this.getStats();
        const unhealthyNodes = Array.from(this.nodes.values()).filter((n) => n.status !== 'active');
        return {
            status: unhealthyNodes.length === 0 ? 'healthy' : 'degraded',
            details: {
                ...stats,
                unhealthyNodes: unhealthyNodes?.map((n) => ({
                    id: n.id,
                    status: n.status,
                })),
            },
        };
    }
}
//# sourceMappingURL=memory-coordinator.js.map