/**
 * Recovery Integration Module for ZenSwarm.
 *
 * Provides comprehensive integration between all recovery system components,
 * centralized configuration, and unified management interface.
 *
 * Features:
 * - Centralized recovery system orchestration
 * - Component integration and communication
 * - Configuration management and validation
 * - Unified API for all recovery operations
 * - Performance monitoring and optimization.
 * - Production-ready deployment patterns.
 */
/**
 * @file Coordination system: recovery-integration.
 */
import { EventEmitter } from 'node:events';
import HealthMonitor from '../../diagnostics/health-monitor.ts';
import ChaosEngineering from '../chaos-engineering/chaos-engineering.ts';
import ConnectionStateManager from '../connection-management/connection-state-manager.ts';
import { Logger } from './logger.ts';
import MonitoringDashboard from './monitoring-dashboard.ts';
import RecoveryWorkflows from './recovery-workflows.ts';
export declare class RecoveryIntegration extends EventEmitter {
    options: any;
    logger: Logger;
    healthMonitor: HealthMonitor | null;
    recoveryWorkflows: RecoveryWorkflows | null;
    connectionManager: ConnectionStateManager | null;
    monitoringDashboard: MonitoringDashboard | null;
    chaosEngineering: ChaosEngineering | null;
    mcpTools: any;
    persistence: any;
    isInitialized: boolean;
    isRunning: boolean;
    components: Map<string, any>;
    integrationStatus: Map<string, any>;
    performanceMetrics: {
        initializationTime: number;
        componentStartupTimes: Map<string, number>;
        integrationLatency: Map<string, number>;
        totalMemoryUsage: number;
    };
    optimizationInterval: NodeJS.Timeout | null;
    constructor(options?: any);
    /**
     * Initialize the recovery integration system.
     */
    initialize(): Promise<void>;
    /**
     * Initialize individual components.
     */
    initializeComponents(): Promise<void>;
    /**
     * Initialize a single component.
     *
     * @param name
     * @param ComponentClass
     * @param options
     */
    initializeComponent(name: any, ComponentClass: any, options?: {}): Promise<void>;
    /**
     * Set up integrations between components.
     */
    setupIntegrations(): Promise<void>;
    /**
     * Set up a single integration.
     *
     * @param integration
     */
    setupIntegration(integration: any): Promise<void>;
    /**
     * Start the recovery system.
     */
    start(): Promise<void>;
    /**
     * Stop the recovery system.
     */
    stop(): Promise<void>;
    /**
     * Set external integrations.
     *
     * @param mcpTools
     */
    setMCPTools(mcpTools: any): void;
    setPersistence(persistence: any): void;
    /**
     * Propagate integration to components.
     *
     * @param integrationType
     * @param integration
     */
    propagateIntegration(integrationType: any, integration: any): Promise<void>;
    /**
     * Register swarm for monitoring across all components.
     *
     * @param swarmId
     * @param swarmInstance
     */
    registerSwarm(swarmId: any, swarmInstance: any): Promise<void>;
    /**
     * Unregister swarm from monitoring.
     *
     * @param swarmId
     */
    unregisterSwarm(swarmId: any): Promise<void>;
    /**
     * Get comprehensive system status.
     */
    getSystemStatus(): {
        isInitialized: boolean;
        isRunning: boolean;
        components: Record<string, any>;
        integrations: Record<string, any>;
        performance: any;
        health: any;
        recovery: any;
        connections: any;
        monitoring: any;
        chaos: any;
    };
    /**
     * Get performance metrics.
     */
    getPerformanceMetrics(): {
        componentStartupTimes: {
            [k: string]: number;
        };
        integrationLatency: {
            [k: string]: number;
        };
        currentMemoryUsage: NodeJS.MemoryUsage;
        timestamp: Date;
        initializationTime: number;
        totalMemoryUsage: number;
    };
    /**
     * Start performance optimization.
     */
    startPerformanceOptimization(): void;
    /**
     * Perform memory optimization.
     */
    performMemoryOptimization(): void;
    /**
     * Optimize component caches.
     */
    optimizeComponentCaches(): void;
    /**
     * Validate configuration.
     */
    validateConfiguration(): Promise<void>;
    /**
     * Run system health check.
     */
    runSystemHealthCheck(): Promise<{
        overall: string;
        components: {};
        issues: string[];
    }>;
    /**
     * Export comprehensive system data.
     */
    exportSystemData(): any;
    /**
     * Emergency shutdown procedure.
     *
     * @param reason
     */
    emergencyShutdown(reason?: string): Promise<void>;
    /**
     * Cleanup and shutdown.
     */
    shutdown(): Promise<void>;
}
export default RecoveryIntegration;
//# sourceMappingURL=recovery-integration.d.ts.map