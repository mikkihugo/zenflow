/**
 * Coordination Service Implementation.
 *
 * Service implementation for swarm coordination, orchestration, and.
 * Multi-agent management. Integrates with existing coordination systems.
 */
/**
 * @file Coordination service implementation.
 */
import type { IService } from '../core/interfaces.ts';
import type { CoordinationServiceConfig, ServiceOperationOptions } from '../types.ts';
import { BaseService } from './base-service.ts';
/**
 * Coordination service implementation.
 *
 * @example
 */
export declare class CoordinationService extends BaseService implements IService {
    private agents;
    private swarms;
    private coordinationState;
    private activeWorkflows;
    constructor(config: CoordinationServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, _options?: ServiceOperationOptions): Promise<T>;
    private createSwarm;
    private destroySwarm;
    private getSwarms;
    private spawnAgent;
    private destroyAgent;
    private disconnectAgent;
    private getAgents;
    private startWorkflow;
    private stopWorkflow;
    private getWorkflows;
    private coordinate;
    private getCoordinationState;
    private getCoordinationStats;
    private initializePersistence;
    private initializeRecovery;
    private startCoordinationMonitoring;
    private startRecoveryMonitoring;
    private monitorCoordination;
    private checkRecovery;
    private simulateWorkflowExecution;
}
export default CoordinationService;
//# sourceMappingURL=coordination-service.d.ts.map