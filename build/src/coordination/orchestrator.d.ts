/**
 * @file The primary orchestrator for the AI swarm, with full strategic capabilities and persistence.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/interfaces/base-interfaces.ts';
import type { IDatabase } from '../di/tokens/core-tokens.ts';
import type { ISwarmCoordinator } from '../di/tokens/swarm-tokens.ts';
import type { SwarmStrategy, Task } from './types.ts';
export declare class Orchestrator extends EventEmitter implements ISwarmCoordinator {
    private strategy;
    private db;
    private executionPlans;
    private activeExecutions;
    private taskAssignments;
    private isActive;
    private _logger;
    constructor(logger: ILogger, database: IDatabase, strategy?: SwarmStrategy);
    initialize(): Promise<void>;
    submitTask(task: Task): Promise<void>;
    private executeTask;
    private executeSequential;
    private executeParallel;
    private executePhase;
    private assignAgentsToPhase;
    private queueAssignment;
    private findSuitableAgent;
    private createExecutionPlan;
    private getStrategyImplementation;
    private startTaskDistributor;
    private startProgressMonitor;
    private startLoadBalancer;
    initializeSwarm(options: any): Promise<void>;
    addAgent(config: any): Promise<string>;
    removeAgent(agentId: string): Promise<void>;
    assignTask(task: any): Promise<string>;
    getMetrics(): any;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=orchestrator.d.ts.map