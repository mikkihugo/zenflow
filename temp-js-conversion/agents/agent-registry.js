"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
const node_events_1 = require("node:events");
/**
 * Centralized agent registry with persistent storage
 */
class AgentRegistry extends node_events_1.EventEmitter {
    constructor(memory, namespace = 'agents') {
        super();
        this.cache = new Map();
        this.cacheExpiry = 60000; // 1 minute
        this.lastCacheUpdate = 0;
        this.memory = memory;
        this.namespace = namespace;
    }
    async initialize() {
        await this.loadFromMemory();
        this.emit('registry:initialized');
    }
    /**
     * Register a new agent in the registry
     */
    async registerAgent(agent, tags = []) {
        const entry = {
            agent,
            createdAt: new Date(),
            lastUpdated: new Date(),
            tags: [...tags, agent.type, agent.status],
            metadata: {
                registeredBy: 'agent-manager',
                version: '1.0.0'
            }
        };
        // Store in memory
        const key = this.getAgentKey(agent.id.id);
        await this.memory.store(key, entry, {
            type: 'agent-registry',
            tags: entry.tags,
            partition: this.namespace
        });
        // Update cache
        this.cache.set(agent.id.id, entry);
        this.emit('agent:registered', { agentId: agent.id.id, agent });
    }
    /**
     * Update agent information in registry
     */
    async updateAgent(agentId, updates) {
        const entry = await this.getAgentEntry(agentId);
        if (!entry) {
            throw new Error(`Agent ${agentId} not found in registry`);
        }
        // Merge updates
        entry.agent = { ...entry.agent, ...updates };
        entry.lastUpdated = new Date();
        entry.tags = [entry.agent.type, entry.agent.status, ...entry.tags.filter(t => t !== entry.agent.type && t !== entry.agent.status)];
        // Store updated entry
        const key = this.getAgentKey(agentId);
        await this.memory.store(key, entry, {
            type: 'agent-registry',
            tags: entry.tags,
            partition: this.namespace
        });
        // Update cache
        this.cache.set(agentId, entry);
        this.emit('agent:updated', { agentId, agent: entry.agent });
    }
    /**
     * Remove agent from registry
     */
    async unregisterAgent(agentId, preserveHistory = true) {
        const entry = await this.getAgentEntry(agentId);
        if (!entry) {
            return; // Already removed
        }
        if (preserveHistory) {
            // Move to archived partition
            const archiveKey = this.getArchiveKey(agentId);
            await this.memory.store(archiveKey, {
                ...entry,
                archivedAt: new Date(),
                reason: 'agent_removed'
            }, {
                type: 'agent-archive',
                tags: [...entry.tags, 'archived'],
                partition: 'archived'
            });
        }
        // Remove from active registry
        const key = this.getAgentKey(agentId);
        await this.memory.deleteEntry(key);
        // Remove from cache
        this.cache.delete(agentId);
        this.emit('agent:unregistered', { agentId, preserved: preserveHistory });
    }
    /**
     * Get agent by ID
     */
    async getAgent(agentId) {
        const entry = await this.getAgentEntry(agentId);
        return entry?.agent || null;
    }
    /**
     * Get agent entry with metadata
     */
    async getAgentEntry(agentId) {
        // Check cache first
        if (this.cache.has(agentId) && this.isCacheValid()) {
            return this.cache.get(agentId) || null;
        }
        // Load from memory
        const key = this.getAgentKey(agentId);
        const memoryEntry = await this.memory.retrieve(key);
        if (memoryEntry && memoryEntry.value) {
            // Convert MemoryEntry to AgentRegistryEntry
            const registryEntry = memoryEntry.value;
            this.cache.set(agentId, registryEntry);
            return registryEntry;
        }
        return null;
    }
    /**
     * Query agents by criteria
     */
    async queryAgents(query = {}) {
        await this.refreshCacheIfNeeded();
        let agents = Array.from(this.cache.values()).map(entry => entry.agent);
        // Apply filters
        if (query.type) {
            agents = agents.filter(agent => agent.type === query.type);
        }
        if (query.status) {
            agents = agents.filter(agent => agent.status === query.status);
        }
        if (query.healthThreshold !== undefined) {
            agents = agents.filter(agent => agent.health >= query.healthThreshold);
        }
        if (query.namePattern) {
            const pattern = new RegExp(query.namePattern, 'i');
            agents = agents.filter(agent => pattern.test(agent.name));
        }
        if (query.tags && query.tags.length > 0) {
            const entries = Array.from(this.cache.values());
            const matchingEntries = entries.filter(entry => query.tags.some(tag => entry.tags.includes(tag)));
            agents = matchingEntries.map(entry => entry.agent);
        }
        if (query.createdAfter) {
            const entries = Array.from(this.cache.values());
            const matchingEntries = entries.filter(entry => entry.createdAt >= query.createdAfter);
            agents = matchingEntries.map(entry => entry.agent);
        }
        if (query.lastActiveAfter) {
            agents = agents.filter(agent => agent.metrics.lastActivity >= query.lastActiveAfter);
        }
        return agents;
    }
    /**
     * Get all registered agents
     */
    async getAllAgents() {
        return this.queryAgents();
    }
    /**
     * Get agents by type
     */
    async getAgentsByType(type) {
        return this.queryAgents({ type });
    }
    /**
     * Get agents by status
     */
    async getAgentsByStatus(status) {
        return this.queryAgents({ status });
    }
    /**
     * Get healthy agents
     */
    async getHealthyAgents(threshold = 0.7) {
        return this.queryAgents({ healthThreshold: threshold });
    }
    /**
     * Get registry statistics
     */
    async getStatistics() {
        const agents = await this.getAllAgents();
        const stats = {
            totalAgents: agents.length,
            byType: {},
            byStatus: {},
            averageHealth: 0,
            activeAgents: 0,
            totalUptime: 0,
            tasksCompleted: 0,
            successRate: 0
        };
        if (agents.length === 0) {
            return stats;
        }
        // Count by type and status
        for (const agent of agents) {
            stats.byType[agent.type] = (stats.byType[agent.type] || 0) + 1;
            stats.byStatus[agent.status] = (stats.byStatus[agent.status] || 0) + 1;
            if (agent.status === 'idle' || agent.status === 'busy') {
                stats.activeAgents++;
            }
            stats.totalUptime += agent.metrics.totalUptime;
            stats.tasksCompleted += agent.metrics.tasksCompleted;
        }
        // Calculate averages
        stats.averageHealth = agents.reduce((sum, agent) => sum + agent.health, 0) / agents.length;
        const totalTasks = agents.reduce((sum, agent) => sum + agent.metrics.tasksCompleted + agent.metrics.tasksFailed, 0);
        if (totalTasks > 0) {
            stats.successRate = stats.tasksCompleted / totalTasks;
        }
        return stats;
    }
    /**
     * Search agents by capabilities
     */
    async searchByCapabilities(requiredCapabilities) {
        const agents = await this.getAllAgents();
        return agents.filter(agent => {
            const capabilities = [
                ...agent.capabilities.languages,
                ...agent.capabilities.frameworks,
                ...agent.capabilities.domains,
                ...agent.capabilities.tools
            ];
            return requiredCapabilities.every(required => capabilities.some(cap => cap.toLowerCase().includes(required.toLowerCase())));
        });
    }
    /**
     * Find best agent for task
     */
    async findBestAgent(taskType, requiredCapabilities = [], preferredAgent) {
        let candidates = await this.getHealthyAgents(0.5);
        // Filter by capabilities if specified
        if (requiredCapabilities.length > 0) {
            candidates = await this.searchByCapabilities(requiredCapabilities);
        }
        // Prefer specific agent if available and healthy
        if (preferredAgent) {
            const preferred = candidates.find(agent => agent.id.id === preferredAgent || agent.name === preferredAgent);
            if (preferred)
                return preferred;
        }
        // Filter by availability
        candidates = candidates.filter(agent => agent.status === 'idle' &&
            agent.workload < 0.8 &&
            agent.capabilities.maxConcurrentTasks > 0);
        if (candidates.length === 0)
            return null;
        // Score candidates
        const scored = candidates.map(agent => ({
            agent,
            score: this.calculateAgentScore(agent, taskType, requiredCapabilities)
        }));
        // Sort by score (highest first)
        scored.sort((a, b) => b.score - a.score);
        return scored[0]?.agent || null;
    }
    /**
     * Store agent coordination data
     */
    async storeCoordinationData(agentId, data) {
        const key = `coordination:${agentId}`;
        await this.memory.store(key, {
            agentId,
            data,
            timestamp: new Date()
        }, {
            type: 'agent-coordination',
            tags: ['coordination', agentId],
            partition: this.namespace
        });
    }
    /**
     * Retrieve agent coordination data
     */
    async getCoordinationData(agentId) {
        const key = `coordination:${agentId}`;
        const result = await this.memory.retrieve(key);
        return result?.value || null;
    }
    // === PRIVATE METHODS ===
    async loadFromMemory() {
        try {
            const entries = await this.memory.query({
                type: 'state',
                namespace: this.namespace
            });
            this.cache.clear();
            for (const entry of entries) {
                if (entry.value && entry.value.agent) {
                    this.cache.set(entry.value.agent.id.id, entry.value);
                }
            }
            this.lastCacheUpdate = Date.now();
        }
        catch (error) {
            console.warn('Failed to load agent registry from memory:', error);
        }
    }
    async refreshCacheIfNeeded() {
        if (!this.isCacheValid()) {
            await this.loadFromMemory();
        }
    }
    isCacheValid() {
        return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
    }
    getAgentKey(agentId) {
        return `agent:${agentId}`;
    }
    getArchiveKey(agentId) {
        return `archived:${agentId}:${Date.now()}`;
    }
    calculateAgentScore(agent, taskType, requiredCapabilities) {
        let score = 0;
        // Base health score (0-40 points)
        score += agent.health * 40;
        // Success rate score (0-30 points)
        score += agent.metrics.successRate * 30;
        // Availability score (0-20 points)
        const availability = 1 - agent.workload;
        score += availability * 20;
        // Capability match score (0-10 points)
        if (requiredCapabilities.length > 0) {
            const agentCaps = [
                ...agent.capabilities.languages,
                ...agent.capabilities.frameworks,
                ...agent.capabilities.domains,
                ...agent.capabilities.tools
            ];
            const matches = requiredCapabilities.filter(required => agentCaps.some(cap => cap.toLowerCase().includes(required.toLowerCase())));
            score += (matches.length / requiredCapabilities.length) * 10;
        }
        return score;
    }
}
exports.AgentRegistry = AgentRegistry;
