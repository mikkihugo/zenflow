#!/usr/bin/env node
/**
 * @file ESLint Swarm Coordinator - Main Entry Point.
 *
 * Coordinates multiple specialized agents for efficient ESLint violation fixing.
 * with real-time visibility and extended timeouts for complex operations.
 * @author Claude Code Zen Team
 * @version 2.0-alpha.73
 */
import { EventEmitter } from '@claude-zen/foundation';
interface ESLintViolation {
    filePath: string;
    messages: Array<{
        ruleId: string;
        severity: number;
        message: string;
        line: number;
        column: number;
        fix?: {
            range: [number, number];
            text: string;
        };
    }>;
}
interface SwarmAgentConfig {
    name: string;
    specialization: 'syntax' | 'imports' | 'types' | 'performance' | 'general';
    rules: string[];
    maxConcurrentFixes: number;
    timeoutMs: number;
}
interface SwarmCoordinatorOptions {
    projectRoot: string;
    concurrentAgents: number;
    verboseLogging: boolean;
    dryRun: boolean;
    extensions: string[];
    excludePatterns: string[];
    timeout: number;
}
/**
 * ESLint Swarm Coordinator
 * Coordinates multiple specialized ESLint fixing agents for efficient parallel processing
 */
export declare class ESLintSwarmCoordinator extends EventEmitter {
    private logger;
    private options;
    private agents;
    private activeProcesses;
    constructor(options?: Partial<SwarmCoordinatorOptions>);
    /**
     * Setup specialized ESLint agents for different types of violations
     */
    private setupSpecializedAgents;
    /**
     * Start the ESLint swarm coordination process
     */
    startCoordination(): Promise<void>;
    /**
     * Discover all ESLint violations in the project
     */
    private discoverViolations;
    /**
     * Handle ESLint execution error
     */
    private handleEslintError;
    /**
     * Check if error contains ESLint output
     */
    private isEslintOutputError;
    /**
     * Categorize violations by agent specialization
     */
    private categorizeViolations;
    /**
     * Assign a violation to the most appropriate agent
     */
    private assignViolationToAgent;
    /**
     * Count rule matches between violation and agent
     */
    private countRuleMatches;
    /**
     * Coordinate parallel fixing across specialized agents
     */
    private coordinateParallelFixes;
    /**
     * Run fixes for a specific agent
     */
    private runAgentFixes;
    /**
     * Fix a single violation using the specified agent
     */
    private fixViolation;
    /**
     * Verify the results of the fixing process
     */
    private verifyFixResults;
    /**
     * Log remaining violations details
     */
    private logRemainingViolations;
    /**
     * Utility function to chunk arrays into smaller batches
     */
    private chunkArray;
    /**
     * Gracefully shutdown all active processes
     */
    shutdown(): void;
}
export type { SwarmCoordinatorOptions, ESLintViolation, SwarmAgentConfig, };
//# sourceMappingURL=eslint-swarm-coordinator.d.ts.map