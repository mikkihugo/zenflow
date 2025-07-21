"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraph = void 0;
const errors_js_1 = require("../utils/errors.js");
/**
 * Manages task dependencies and determines execution order
 */
class DependencyGraph {
    constructor(logger) {
        this.logger = logger;
        this.nodes = new Map();
        this.completedTasks = new Set();
    }
    /**
     * Add a task to the dependency graph
     */
    addTask(task) {
        if (this.nodes.has(task.id)) {
            this.logger.warn('Task already exists in dependency graph', { taskId: task.id });
            return;
        }
        const node = {
            taskId: task.id,
            dependencies: new Set(task.dependencies),
            dependents: new Set(),
            status: 'pending',
        };
        // Validate dependencies exist
        for (const depId of task.dependencies) {
            if (!this.nodes.has(depId) && !this.completedTasks.has(depId)) {
                throw new errors_js_1.TaskDependencyError(task.id, [depId]);
            }
        }
        // Add node
        this.nodes.set(task.id, node);
        // Update dependents for dependencies
        for (const depId of task.dependencies) {
            const depNode = this.nodes.get(depId);
            if (depNode) {
                depNode.dependents.add(task.id);
            }
        }
        // Check if task is ready
        if (this.isTaskReady(task.id)) {
            node.status = 'ready';
        }
    }
    /**
     * Remove a task from the dependency graph
     */
    removeTask(taskId) {
        const node = this.nodes.get(taskId);
        if (!node) {
            return;
        }
        // Remove from dependents of dependencies
        for (const depId of node.dependencies) {
            const depNode = this.nodes.get(depId);
            if (depNode) {
                depNode.dependents.delete(taskId);
            }
        }
        // Remove from dependencies of dependents
        for (const depId of node.dependents) {
            const depNode = this.nodes.get(depId);
            if (depNode) {
                depNode.dependencies.delete(taskId);
                // Check if dependent is now ready
                if (this.isTaskReady(depId)) {
                    depNode.status = 'ready';
                }
            }
        }
        this.nodes.delete(taskId);
    }
    /**
     * Mark a task as completed
     */
    markCompleted(taskId) {
        const node = this.nodes.get(taskId);
        if (!node) {
            this.logger.warn('Task not found in dependency graph', { taskId });
            return [];
        }
        node.status = 'completed';
        this.completedTasks.add(taskId);
        // Find newly ready tasks
        const readyTasks = [];
        for (const dependentId of node.dependents) {
            const dependent = this.nodes.get(dependentId);
            if (dependent && dependent.status === 'pending' && this.isTaskReady(dependentId)) {
                dependent.status = 'ready';
                readyTasks.push(dependentId);
            }
        }
        // Remove from active graph
        this.removeTask(taskId);
        return readyTasks;
    }
    /**
     * Mark a task as failed
     */
    markFailed(taskId) {
        const node = this.nodes.get(taskId);
        if (!node) {
            return [];
        }
        node.status = 'failed';
        // Get all dependent tasks that need to be cancelled
        const toCancelIds = this.getAllDependents(taskId);
        // Mark all dependents as failed
        for (const depId of toCancelIds) {
            const depNode = this.nodes.get(depId);
            if (depNode) {
                depNode.status = 'failed';
            }
        }
        return toCancelIds;
    }
    /**
     * Check if a task is ready to run
     */
    isTaskReady(taskId) {
        const node = this.nodes.get(taskId);
        if (!node) {
            return false;
        }
        // All dependencies must be completed
        for (const depId of node.dependencies) {
            if (!this.completedTasks.has(depId)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Get all ready tasks
     */
    getReadyTasks() {
        const ready = [];
        for (const [taskId, node] of this.nodes) {
            if (node.status === 'ready' || (node.status === 'pending' && this.isTaskReady(taskId))) {
                ready.push(taskId);
                node.status = 'ready';
            }
        }
        return ready;
    }
    /**
     * Get all dependents of a task (recursive)
     */
    getAllDependents(taskId) {
        const visited = new Set();
        const dependents = [];
        const visit = (id) => {
            if (visited.has(id)) {
                return;
            }
            visited.add(id);
            const node = this.nodes.get(id);
            if (!node) {
                return;
            }
            for (const depId of node.dependents) {
                if (!visited.has(depId)) {
                    dependents.push(depId);
                    visit(depId);
                }
            }
        };
        visit(taskId);
        return dependents;
    }
    /**
     * Detect circular dependencies
     */
    detectCycles() {
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const currentPath = [];
        const hasCycle = (taskId) => {
            visited.add(taskId);
            recursionStack.add(taskId);
            currentPath.push(taskId);
            const node = this.nodes.get(taskId);
            if (!node) {
                currentPath.pop();
                recursionStack.delete(taskId);
                return false;
            }
            for (const depId of node.dependencies) {
                if (!visited.has(depId)) {
                    if (hasCycle(depId)) {
                        return true;
                    }
                }
                else if (recursionStack.has(depId)) {
                    // Found cycle
                    const cycleStart = currentPath.indexOf(depId);
                    const cycle = currentPath.slice(cycleStart);
                    cycle.push(depId); // Complete the cycle
                    cycles.push(cycle);
                    return true;
                }
            }
            currentPath.pop();
            recursionStack.delete(taskId);
            return false;
        };
        // Check all nodes
        for (const taskId of this.nodes.keys()) {
            if (!visited.has(taskId)) {
                hasCycle(taskId);
            }
        }
        return cycles;
    }
    /**
     * Get topological sort of tasks
     */
    topologicalSort() {
        // Check for cycles first
        const cycles = this.detectCycles();
        if (cycles.length > 0) {
            this.logger.error('Cannot perform topological sort due to cycles', { cycles });
            return null;
        }
        const sorted = [];
        const visited = new Set();
        const visit = (taskId) => {
            if (visited.has(taskId)) {
                return;
            }
            visited.add(taskId);
            const node = this.nodes.get(taskId);
            if (!node) {
                return;
            }
            // Visit dependencies first
            for (const depId of node.dependencies) {
                if (!visited.has(depId)) {
                    visit(depId);
                }
            }
            sorted.push(taskId);
        };
        // Visit all nodes
        for (const taskId of this.nodes.keys()) {
            if (!visited.has(taskId)) {
                visit(taskId);
            }
        }
        return sorted;
    }
    /**
     * Find critical path (longest path through the graph)
     */
    findCriticalPath() {
        const paths = [];
        // Find all paths from tasks with no dependencies to tasks with no dependents
        const sources = Array.from(this.nodes.entries())
            .filter(([_, node]) => node.dependencies.size === 0)
            .map(([id]) => id);
        const sinks = Array.from(this.nodes.entries())
            .filter(([_, node]) => node.dependents.size === 0)
            .map(([id]) => id);
        for (const source of sources) {
            for (const sink of sinks) {
                const path = this.findPath(source, sink);
                if (path) {
                    paths.push({ from: source, to: sink, path });
                }
            }
        }
        // Return longest path
        if (paths.length === 0) {
            return null;
        }
        return paths.reduce((longest, current) => current.path.length > longest.path.length ? current : longest);
    }
    /**
     * Find path between two tasks
     */
    findPath(from, to) {
        if (from === to) {
            return [from];
        }
        const visited = new Set();
        const queue = [
            { taskId: from, path: [from] }
        ];
        while (queue.length > 0) {
            const { taskId, path } = queue.shift();
            if (visited.has(taskId)) {
                continue;
            }
            visited.add(taskId);
            const node = this.nodes.get(taskId);
            if (!node) {
                continue;
            }
            for (const depId of node.dependents) {
                if (depId === to) {
                    return [...path, to];
                }
                if (!visited.has(depId)) {
                    queue.push({ taskId: depId, path: [...path, depId] });
                }
            }
        }
        return null;
    }
    /**
     * Get graph statistics
     */
    getStats() {
        const stats = {
            totalTasks: this.nodes.size,
            completedTasks: this.completedTasks.size,
            readyTasks: 0,
            pendingTasks: 0,
            runningTasks: 0,
            failedTasks: 0,
            avgDependencies: 0,
            maxDependencies: 0,
            cycles: this.detectCycles(),
        };
        let totalDeps = 0;
        for (const node of this.nodes.values()) {
            totalDeps += node.dependencies.size;
            stats.maxDependencies = Math.max(stats.maxDependencies, node.dependencies.size);
            switch (node.status) {
                case 'ready':
                    stats.readyTasks++;
                    break;
                case 'pending':
                    stats.pendingTasks++;
                    break;
                case 'running':
                    stats.runningTasks++;
                    break;
                case 'failed':
                    stats.failedTasks++;
                    break;
            }
        }
        stats.avgDependencies = this.nodes.size > 0 ? totalDeps / this.nodes.size : 0;
        return stats;
    }
    /**
     * Export graph to DOT format for visualization
     */
    toDot() {
        let dot = 'digraph TaskDependencies {\n';
        dot += '  rankdir=LR;\n';
        dot += '  node [shape=box];\n\n';
        // Add nodes with status colors
        for (const [taskId, node] of this.nodes) {
            let color = 'white';
            switch (node.status) {
                case 'ready':
                    color = 'lightgreen';
                    break;
                case 'running':
                    color = 'yellow';
                    break;
                case 'completed':
                    color = 'green';
                    break;
                case 'failed':
                    color = 'red';
                    break;
            }
            dot += `  "${taskId}" [style=filled, fillcolor=${color}];\n`;
        }
        dot += '\n';
        // Add edges
        for (const [taskId, node] of this.nodes) {
            for (const depId of node.dependencies) {
                dot += `  "${depId}" -> "${taskId}";\n`;
            }
        }
        dot += '}\n';
        return dot;
    }
}
exports.DependencyGraph = DependencyGraph;
