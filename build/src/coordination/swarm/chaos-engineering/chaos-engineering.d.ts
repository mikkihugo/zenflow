/**
 * Chaos Engineering Test Framework for ZenSwarm.
 *
 * Provides comprehensive chaos engineering capabilities for testing.
 * Recovery workflows and system resilience under failure conditions.
 *
 * Features:
 * - Controlled failure injection (memory, network, process, etc.)
 * - Automated recovery testing scenarios
 * - Blast radius management and safety controls
 * - Test result analysis and reporting
 * - Integration with recovery workflows validation
 * - Reproducible failure scenarios.
 */
/**
 * @file Coordination system: chaos-engineering.
 */
import { EventEmitter } from 'node:events';
import type { HealthMonitor } from '../../diagnostics/health-monitor.ts';
import type { ConnectionStateManager as ConnectionManager } from '../connection-management/connection-state-manager.ts';
import type { RecoveryWorkflows } from '../core/recovery-workflows.ts';
interface ExperimentPhase {
    name: string;
    status: 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime: Date | null;
    duration: number;
    error: string | null;
}
interface InjectionResult {
    type: string;
    arrays?: Array<unknown[]>;
    workers?: Array<{
        terminate: () => void;
    }>;
    size?: number;
    duration: number;
    cleanupTimer?: NodeJS.Timeout;
    affectedConnections?: Array<{
        id: string;
        action: string;
    }>;
}
interface ImpactMetrics {
    memoryUsage?: number;
    cpuUsage?: number;
    connectionStatus?: Record<string, unknown>;
    errorRate?: number;
    responseTime?: number;
}
interface DetailedImpactMetrics {
    startTime: Date;
    endTime: Date | null;
    metrics: Array<ImpactMetrics & {
        timestamp: Date;
    }>;
    alerts: Array<{
        timestamp: Date;
        status: string;
        details: unknown;
    }>;
    recoveryAttempts: Array<{
        timestamp: Date;
        recoveries: unknown;
    }>;
}
interface RecoveryExecution {
    workflowId: string;
    startTime: Date;
    endTime: Date;
    status: 'running' | 'completed' | 'failed';
    steps: Array<{
        name: string;
        status: string;
    }>;
}
interface ExperimentParameters {
    size?: number;
    duration?: number;
    intensity?: number;
    connections?: string | string[];
    failureType?: string;
    [key: string]: unknown;
}
interface ExperimentExecution {
    id: string;
    experimentName: string;
    experimentId: string;
    status: 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime: Date | null;
    duration: number;
    error: string | null;
    parameters: ExperimentParameters;
    phases: ExperimentPhase[];
    currentPhase: string;
    failureInjected: boolean;
    recoveryTriggered: boolean;
    recoveryCompleted: boolean;
    blastRadius: number;
    metadata: Record<string, unknown>;
    injectionResult?: InjectionResult;
    cancellationReason?: string;
    completedAt?: Date;
    impactMetrics?: DetailedImpactMetrics;
    recoveryExecution?: RecoveryExecution;
    recoveryTime?: number;
}
interface ChaosExperiment {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
    failureType?: string | undefined;
    parameters: ExperimentParameters;
    duration: number;
    cooldown?: number | undefined;
    blastRadius: number;
    safetyChecks: string[];
    metadata: Record<string, unknown>;
    enabled: boolean;
    expectedRecovery: string[];
    createdAt: Date;
}
interface ChaosEngineeringOptions {
    enableChaos?: boolean;
    safetyEnabled?: boolean;
    maxConcurrentExperiments?: number;
    experimentTimeout?: number;
    recoveryTimeout?: number;
    blastRadiusLimit?: number;
}
interface ResourceUsage {
    memory: number;
    cpu: number;
    connections: number;
}
interface FailureInjectorCallbacks {
    inject: (params: ExperimentParameters) => Promise<InjectionResult>;
    cleanup?: (injectionResult: InjectionResult) => Promise<void>;
}
type FailureInjector = FailureInjectorCallbacks;
export declare class ChaosEngineering extends EventEmitter {
    private options;
    private logger;
    private experiments;
    private activeExperiments;
    private experimentHistory;
    private failureInjectors;
    private safetyChecks;
    private emergencyStop;
    private resourceUsage;
    private stats;
    private healthMonitor;
    private recoveryWorkflows;
    private connectionManager;
    constructor(options?: ChaosEngineeringOptions);
    /**
     * Initialize chaos engineering framework.
     */
    initialize(): Promise<void>;
    /**
     * Register a chaos experiment.
     *
     * @param name
     * @param experimentDefinition
     */
    registerExperiment(name: string, experimentDefinition: Partial<ChaosExperiment>): string;
    /**
     * Run a chaos experiment.
     *
     * @param experimentName
     * @param overrideParams
     */
    runExperiment(experimentName: string, overrideParams?: Record<string, any>): Promise<ExperimentExecution>;
    /**
     * Run experiment phase.
     *
     * @param execution
     * @param phaseName
     * @param phaseFunction
     */
    runExperimentPhase(execution: ExperimentExecution, phaseName: string, phaseFunction: () => Promise<void>): Promise<void>;
    /**
     * Perform safety checks before experiment.
     *
     * @param experiment
     */
    performSafetyChecks(experiment: ChaosExperiment): Promise<void>;
    /**
     * Inject failure based on experiment configuration.
     *
     * @param experiment
     * @param execution
     */
    injectFailure(experiment: ChaosExperiment, execution: ExperimentExecution): Promise<void>;
    /**
     * Monitor failure impact.
     *
     * @param execution
     * @param duration
     */
    monitorFailureImpact(execution: ExperimentExecution, duration: number): Promise<void>;
    /**
     * Trigger recovery manually if needed.
     *
     * @param execution
     */
    triggerRecovery(execution: ExperimentExecution): Promise<void>;
    /**
     * Monitor recovery process.
     *
     * @param execution
     */
    monitorRecovery(execution: ExperimentExecution): Promise<void>;
    /**
     * Cleanup after experiment.
     *
     * @param execution
     */
    cleanupExperiment(execution: ExperimentExecution): Promise<void>;
    /**
     * Check if system has recovered.
     *
     * @param _execution
     */
    checkSystemRecovery(_execution: ExperimentExecution): Promise<boolean>;
    /**
     * Register built-in failure injectors.
     */
    registerBuiltInInjectors(): void;
    /**
     * Register built-in experiments.
     */
    registerBuiltInExperiments(): void;
    /**
     * Register failure injector.
     *
     * @param name
     * @param injector
     */
    registerFailureInjector(name: string, injector: FailureInjector): void;
    /**
     * Set up safety checks.
     */
    setupSafetyChecks(): void;
    /**
     * Helper methods.
     */
    createCPUWorker(): {
        terminate: () => void;
        terminated: boolean;
        startTime: number;
    };
    checkResourceUsage(): Promise<ResourceUsage>;
    collectImpactMetrics(): Promise<{
        memory: NodeJS.MemoryUsage;
        cpu: NodeJS.CpuUsage;
        connections: {
            connectionCount: number;
            healthyConnections: number;
            reconnectingConnections: number;
            totalConnections: number;
            activeConnections: number;
            failedConnections: number;
            reconnectAttempts: number;
            averageConnectionTime: number;
            totalConnectionTime: number;
        } | null;
        health: any;
    }>;
    getRecoveryTrigger(failureType: string | undefined): string;
    /**
     * Emergency stop all experiments.
     *
     * @param reason
     */
    emergencyStopExperiments(reason?: string): Promise<void>;
    /**
     * Cancel an active experiment.
     *
     * @param executionId
     * @param reason
     */
    cancelExperiment(executionId: string, reason?: string): Promise<void>;
    /**
     * Clear emergency stop.
     */
    clearEmergencyStop(): void;
    /**
     * Get experiment status.
     *
     * @param executionId
     */
    getExperimentStatus(executionId?: null): ExperimentExecution | ExperimentExecution[] | null;
    /**
     * Get chaos statistics.
     */
    getChaosStats(): {
        activeExperiments: number;
        registeredExperiments: number;
        enabledExperiments: number;
        failureInjectors: number;
        emergencyStop: boolean;
        totalExperiments: number;
        successfulExperiments: number;
        failedExperiments: number;
        averageRecoveryTime: number;
        totalRecoveryTime: number;
    };
    /**
     * Set integration points.
     *
     * @param healthMonitor
     */
    setHealthMonitor(healthMonitor: HealthMonitor): void;
    setRecoveryWorkflows(recoveryWorkflows: RecoveryWorkflows): void;
    setConnectionManager(connectionManager: ConnectionManager): void;
    setMCPTools(mcpTools: any): void;
    /**
     * Export chaos data for analysis.
     */
    exportChaosData(): {
        timestamp: Date;
        stats: {
            activeExperiments: number;
            registeredExperiments: number;
            enabledExperiments: number;
            failureInjectors: number;
            emergencyStop: boolean;
            totalExperiments: number;
            successfulExperiments: number;
            failedExperiments: number;
            averageRecoveryTime: number;
            totalRecoveryTime: number;
        };
        experiments: {
            experimentName: string;
            history: ExperimentExecution[];
            id: string;
            name: string;
            description: string;
            type: string;
            category: string;
            failureType?: string | undefined;
            parameters: ExperimentParameters;
            duration: number;
            cooldown?: number | undefined;
            blastRadius: number;
            safetyChecks: string[];
            metadata: Record<string, unknown>;
            enabled: boolean;
            expectedRecovery: string[];
            createdAt: Date;
        }[];
        activeExperiments: ExperimentExecution[];
        failureInjectors: string[];
        safetyChecks: string[];
    };
    /**
     * Cleanup and shutdown.
     */
    shutdown(): Promise<void>;
}
export default ChaosEngineering;
//# sourceMappingURL=chaos-engineering.d.ts.map