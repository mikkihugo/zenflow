/**
 * @fileoverview JavaScript bindings for ruv-swarm neural coordination engine
 * @module ruv-swarm-js
 */
import { RuvSwarm } from 'ruv-swarm';
import { SwarmConfig, AgentConfig, TaskConfig } from '@shared/types';
export declare class RuvSwarmBridge {
    private ruvSwarm;
    private swarms;
    private logger;
    constructor(config?: SwarmConfig);
    /**
     * Initialize the ruv-swarm engine
     */
    private initializeRuvSwarm;
    /**
     * Create a new swarm for service coordination
     */
    createSwarm(serviceName: string, config?: SwarmConfig): Promise<string>;
    /**
     * Spawn an agent in a swarm
     */
    spawnAgent(swarmId: string, agentConfig: AgentConfig): Promise<string>;
    /**
     * Orchestrate a task across a swarm
     */
    orchestrateTask(swarmId: string, task: TaskConfig): Promise<any>;
    /**
     * Get swarm status and metrics
     */
    getSwarmStatus(swarmId: string): Promise<any>;
    /**
     * Enable inter-swarm communication
     */
    connectSwarms(swarmId1: string, swarmId2: string): Promise<void>;
    /**
     * Train neural patterns from swarm data
     */
    trainNeuralPatterns(swarmId: string, options?: any): Promise<any>;
    /**
     * Get performance benchmarks
     */
    benchmark(swarmId: string, options?: any): Promise<any>;
    /**
     * List all active swarms
     */
    listSwarms(): Array<{
        id: string;
        name: string;
    }>;
    /**
     * Cleanup and close all swarms
     */
    cleanup(): Promise<void>;
}
export default RuvSwarmBridge;
export { RuvSwarm };
export declare function createServiceSwarm(serviceName: string, config?: SwarmConfig): Promise<RuvSwarmBridge>;
export declare function orchestrateAcrossServices(services: string[], task: string, config?: SwarmConfig): Promise<any[]>;
//# sourceMappingURL=index.d.ts.map