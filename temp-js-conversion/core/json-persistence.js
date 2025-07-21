"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonPersistenceManager = void 0;
/**
 * JSON-based persistence layer for Claude-Flow
 */
const path_1 = require("path");
const promises_1 = require("fs/promises");
class JsonPersistenceManager {
    constructor(dataDir = "./memory") {
        this.dataPath = (0, path_1.join)(dataDir, "claude-flow-data.json");
        this.data = {
            agents: [],
            tasks: [],
            lastUpdated: Date.now(),
        };
    }
    async initialize() {
        // Ensure directory exists
        await (0, promises_1.mkdir)((0, path_1.join)(this.dataPath, ".."), { recursive: true });
        // Load existing data if available
        try {
            await (0, promises_1.access)(this.dataPath);
            const content = await (0, promises_1.readFile)(this.dataPath, "utf-8");
            this.data = JSON.parse(content);
        }
        catch (error) {
            // File doesn't exist or can't be read, keep default empty data
            console.error("Failed to load persistence data:", error);
        }
    }
    async save() {
        this.data.lastUpdated = Date.now();
        await (0, promises_1.writeFile)(this.dataPath, JSON.stringify(this.data, null, 2));
    }
    // Agent operations
    async saveAgent(agent) {
        // Remove existing agent if updating
        this.data.agents = this.data.agents.filter(a => a.id !== agent.id);
        this.data.agents.push(agent);
        await this.save();
    }
    async getAgent(id) {
        return this.data.agents.find(a => a.id === id) || null;
    }
    async getActiveAgents() {
        return this.data.agents.filter(a => a.status === 'active' || a.status === 'idle');
    }
    async getAllAgents() {
        return this.data.agents;
    }
    async updateAgentStatus(id, status) {
        const agent = this.data.agents.find(a => a.id === id);
        if (agent) {
            agent.status = status;
            await this.save();
        }
    }
    // Task operations
    async saveTask(task) {
        // Remove existing task if updating
        this.data.tasks = this.data.tasks.filter(t => t.id !== task.id);
        this.data.tasks.push(task);
        await this.save();
    }
    async getTask(id) {
        return this.data.tasks.find(t => t.id === id) || null;
    }
    async getActiveTasks() {
        return this.data.tasks.filter(t => t.status === 'pending' ||
            t.status === 'in_progress' ||
            t.status === 'assigned');
    }
    async getAllTasks() {
        return this.data.tasks;
    }
    async updateTaskStatus(id, status, assignedAgent) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            task.status = status;
            if (assignedAgent !== undefined) {
                task.assignedAgent = assignedAgent;
            }
            if (status === 'completed') {
                task.completedAt = Date.now();
            }
            await this.save();
        }
    }
    async updateTaskProgress(id, progress) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            task.progress = progress;
            await this.save();
        }
    }
    // Statistics
    async getStats() {
        const activeAgents = this.data.agents.filter(a => a.status === 'active' || a.status === 'idle').length;
        const pendingTasks = this.data.tasks.filter(t => t.status === 'pending' ||
            t.status === 'in_progress' ||
            t.status === 'assigned').length;
        const completedTasks = this.data.tasks.filter(t => t.status === 'completed').length;
        return {
            totalAgents: this.data.agents.length,
            activeAgents,
            totalTasks: this.data.tasks.length,
            pendingTasks,
            completedTasks,
        };
    }
    close() {
        // No-op for JSON persistence
    }
}
exports.JsonPersistenceManager = JsonPersistenceManager;
