#!/usr/bin/env node
/**
 * @file ESLint Swarm Coordinator - Main Entry Point.
 *
 * Coordinates multiple specialized agents for efficient ESLint violation fixing.
 * with real-time visibility and extended timeouts for complex operations.
 * @author Claude Code Zen Team
 * @version 2.0.0-alpha.73
 */
import { EventEmitter } from 'events';
/**
 * Enhanced ESLint Swarm Coordinator with real-time monitoring.
 *
 * @example
 */
export declare class ESLintSwarmCoordinator extends EventEmitter {
    private activeAgents;
    private processedViolations;
    private totalViolations;
    private startTime;
    private agentStats;
    private logger;
    private progressInterval?;
    private swarmCoordinator?;
    constructor();
    private initializeAgentStats;
    /**
     * Initialize the swarm coordination system.
     */
    initialize(): Promise<void>;
    /**
     * Analyze current ESLint violations and distribute across agents.
     */
    private analyzeViolationsForDistribution;
    /**
     * Launch parallel agents with extended timeouts and real-time monitoring.
     */
    private launchParallelAgentsWithExtendedTimeouts;
    /**
     * Launch individual agent with extended timeout configuration.
     *
     * @param agentType
     * @param config
     */
    private launchAgentWithExtendedTimeout;
    /**
     * Create enhanced Claude CLI process with extended configuration.
     *
     * @param agentType
     * @param config
     * @param violations
     */
    private createEnhancedClaudeProcess;
    /**
     * Setup extended timeout monitoring for agent processes.
     *
     * @param agentType
     * @param agentProcess
     */
    private setupExtendedTimeoutMonitoring;
    /**
     * Monitor agent output with enhanced visibility and progress tracking.
     *
     * @param agentType
     * @param agentProcess
     */
    private monitorAgentOutputWithExtendedVisibility;
    /**
     * Enhanced progress monitoring with real-time dashboard.
     */
    private startEnhancedProgressMonitoring;
    /**
     * Display enhanced progress dashboard with extended metrics.
     */
    private displayEnhancedProgressDashboard;
    /**
     * Enhanced agent prompt with detailed instructions and extended context.
     *
     * @param agentType
     * @param config
     * @param violations
     */
    private buildEnhancedAgentPrompt;
    private parseViolations;
    private distributeViolations;
    private generateMockDistribution;
    private parseOutputForProgress;
    private handleAgentTimeout;
    private checkSwarmCompletion;
    private displayFinalReport;
    private getStatusIcon;
    private logDetailedProgress;
    private sleep;
}
//# sourceMappingURL=eslint-swarm-coordinator.d.ts.map