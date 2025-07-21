"use strict";
/**
 * Hive Mind Monitoring Dashboard
 * Real-time visualization of swarm activity and consensus
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveDashboard = void 0;
class HiveDashboard {
    constructor(orchestrator, protocol) {
        this.refreshInterval = 1000; // 1 second
        this.orchestrator = orchestrator;
        this.protocol = protocol;
    }
    /**
     * Start monitoring with callback for updates
     */
    startMonitoring(callback) {
        this.updateCallback = callback;
        this.update();
        // Set up periodic updates
        const interval = setInterval(() => {
            this.update();
        }, this.refreshInterval);
        return () => clearInterval(interval);
    }
    /**
     * Get current dashboard data
     */
    update() {
        const data = this.collectDashboardData();
        if (this.updateCallback) {
            this.updateCallback(data);
        }
    }
    /**
     * Collect all dashboard data
     */
    collectDashboardData() {
        const perfMetrics = this.orchestrator.getPerformanceMetrics();
        const commStats = this.protocol.getStatistics();
        return {
            swarmId: 'current-swarm',
            status: this.determineSwarmStatus(perfMetrics),
            agents: this.getAgentStatuses(),
            tasks: this.getTaskProgress(),
            consensus: this.getConsensusMetrics(),
            communication: this.getCommunicationStats(commStats),
            performance: this.getPerformanceMetrics(perfMetrics),
            timestamp: Date.now()
        };
    }
    /**
     * Determine overall swarm status
     */
    determineSwarmStatus(metrics) {
        if (metrics.executingTasks > 0)
            return 'executing';
        if (metrics.pendingTasks > 0)
            return 'active';
        if (metrics.completedTasks === metrics.totalTasks)
            return 'completed';
        return 'initializing';
    }
    /**
     * Get status of all agents
     */
    getAgentStatuses() {
        // This would be populated from actual agent data
        return [
            {
                id: 'queen-1',
                name: 'Queen-Genesis',
                type: 'queen',
                status: 'thinking',
                workload: 85,
                votes: 15,
                contributions: 42
            },
            {
                id: 'architect-1',
                name: 'Architect-1',
                type: 'architect',
                status: 'executing',
                currentTask: 'Design system architecture',
                workload: 70,
                votes: 8,
                contributions: 23
            },
            {
                id: 'worker-1',
                name: 'Worker-1',
                type: 'worker',
                status: 'voting',
                workload: 45,
                votes: 12,
                contributions: 31
            }
        ];
    }
    /**
     * Get task progress information
     */
    getTaskProgress() {
        const taskGraph = this.orchestrator.getTaskGraph();
        return taskGraph.nodes.map(node => ({
            id: node.id,
            type: node.type,
            description: `${node.type} task`,
            status: node.status,
            assignedTo: node.assignedTo,
            progress: this.calculateTaskProgress(node.status),
            dependencies: []
        }));
    }
    /**
     * Calculate task progress based on status
     */
    calculateTaskProgress(status) {
        switch (status) {
            case 'completed': return 100;
            case 'executing': return 50;
            case 'assigned': return 25;
            case 'voting': return 10;
            case 'pending': return 0;
            default: return 0;
        }
    }
    /**
     * Get consensus metrics
     */
    getConsensusMetrics() {
        const metrics = this.orchestrator.getPerformanceMetrics();
        return {
            totalDecisions: metrics.totalDecisions,
            approvedDecisions: metrics.approvedDecisions,
            rejectedDecisions: metrics.totalDecisions - metrics.approvedDecisions,
            averageConsensus: metrics.consensusRate,
            currentVotes: [] // Would be populated from active votes
        };
    }
    /**
     * Get communication statistics
     */
    getCommunicationStats(stats) {
        return {
            totalMessages: stats.totalMessages,
            messageRate: stats.totalMessages / 10, // Approximate rate
            channelActivity: stats.messagesByType,
            knowledgeShared: stats.knowledgeEntries
        };
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(metrics) {
        return {
            tasksCompleted: metrics.completedTasks,
            tasksPending: metrics.pendingTasks,
            avgExecutionTime: metrics.avgExecutionTime,
            successRate: metrics.totalTasks > 0 ?
                metrics.completedTasks / metrics.totalTasks : 0,
            qualityScore: 0.85 // Would be calculated from quality reports
        };
    }
    /**
     * Format dashboard for console output
     */
    static formatConsoleOutput(data) {
        const output = [];
        // Header
        output.push('🐝 Hive Mind Dashboard');
        output.push('═══════════════════════════════════════════════════════════════');
        output.push(`Status: ${data.status.toUpperCase()} | Time: ${new Date(data.timestamp).toLocaleTimeString()}`);
        output.push('');
        // Agents Section
        output.push('👥 Agent Status');
        output.push('───────────────────────────────────────────────────────────────');
        for (const agent of data.agents) {
            const statusIcon = this.getStatusIcon(agent.status);
            const workloadBar = this.createProgressBar(agent.workload);
            output.push(`${statusIcon} ${agent.name} (${agent.type})`);
            output.push(`   Status: ${agent.status} | Workload: ${workloadBar} ${agent.workload}%`);
            if (agent.currentTask) {
                output.push(`   Task: ${agent.currentTask}`);
            }
            output.push(`   Votes: ${agent.votes} | Contributions: ${agent.contributions}`);
            output.push('');
        }
        // Tasks Section
        output.push('📋 Task Progress');
        output.push('───────────────────────────────────────────────────────────────');
        for (const task of data.tasks) {
            const progressBar = this.createProgressBar(task.progress);
            const statusIcon = this.getTaskStatusIcon(task.status);
            output.push(`${statusIcon} ${task.type}: ${task.description}`);
            output.push(`   Progress: ${progressBar} ${task.progress}%`);
            if (task.assignedTo) {
                output.push(`   Assigned to: ${task.assignedTo}`);
            }
            output.push('');
        }
        // Consensus Section
        output.push('🗳️ Consensus Metrics');
        output.push('───────────────────────────────────────────────────────────────');
        output.push(`Total Decisions: ${data.consensus.totalDecisions}`);
        output.push(`Approved: ${data.consensus.approvedDecisions} | Rejected: ${data.consensus.rejectedDecisions}`);
        output.push(`Average Consensus: ${(data.consensus.averageConsensus * 100).toFixed(1)}%`);
        output.push('');
        // Performance Section
        output.push('📊 Performance');
        output.push('───────────────────────────────────────────────────────────────');
        output.push(`Tasks: ${data.performance.tasksCompleted}/${data.performance.tasksCompleted + data.performance.tasksPending} completed`);
        output.push(`Success Rate: ${(data.performance.successRate * 100).toFixed(1)}%`);
        output.push(`Quality Score: ${(data.performance.qualityScore * 100).toFixed(1)}%`);
        output.push(`Avg Execution Time: ${(data.performance.avgExecutionTime / 1000).toFixed(1)}s`);
        output.push('');
        // Communication Section
        output.push('💬 Communication');
        output.push('───────────────────────────────────────────────────────────────');
        output.push(`Total Messages: ${data.communication.totalMessages}`);
        output.push(`Message Rate: ${data.communication.messageRate.toFixed(1)}/min`);
        output.push(`Knowledge Shared: ${data.communication.knowledgeShared} entries`);
        return output.join('\\n');
    }
    /**
     * Get status icon for agent
     */
    static getStatusIcon(status) {
        switch (status) {
            case 'idle': return '😴';
            case 'thinking': return '🤔';
            case 'voting': return '🗳️';
            case 'executing': return '⚡';
            case 'communicating': return '💬';
            default: return '❓';
        }
    }
    /**
     * Get status icon for task
     */
    static getTaskStatusIcon(status) {
        switch (status) {
            case 'pending': return '⭕';
            case 'voting': return '🗳️';
            case 'assigned': return '📌';
            case 'executing': return '🔄';
            case 'reviewing': return '🔍';
            case 'completed': return '✅';
            case 'failed': return '❌';
            default: return '❓';
        }
    }
    /**
     * Create ASCII progress bar
     */
    static createProgressBar(percentage, width = 20) {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`;
    }
    /**
     * Export dashboard data as JSON
     */
    exportData() {
        const data = this.collectDashboardData();
        return JSON.stringify(data, null, 2);
    }
    /**
     * Get real-time event stream
     */
    getEventStream() {
        // This would return a stream of dashboard events
        return (async function* () {
            while (true) {
                yield { type: 'update', timestamp: Date.now() };
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        })();
    }
}
exports.HiveDashboard = HiveDashboard;
