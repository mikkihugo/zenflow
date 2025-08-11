/**
 * USL Service Registry - Complete Service Management System.
 *
 * Advanced service registry providing comprehensive service management,
 * health monitoring, lifecycle orchestration, and service discovery.
 * Following the same patterns as UACL Agent 6.
 */
/**
 * @file Interface implementation: registry.
 */
import { EventEmitter } from 'node:events';
import type { IService, IServiceFactory, IServiceRegistry, ServiceConfig, ServiceLifecycleStatus, ServiceMetrics, ServiceStatus } from './core/interfaces.ts';
export interface ServiceRegistryConfig {
    /** Health monitoring configuration */
    healthMonitoring: {
        enabled: boolean;
        interval: number;
        timeout: number;
        alertThresholds: {
            errorRate: number;
            responseTime: number;
            resourceUsage: number;
        };
    };
    /** Metrics collection configuration */
    metricsCollection: {
        enabled: boolean;
        interval: number;
        retention: number;
        aggregationWindow: number;
    };
    /** Service discovery configuration */
    discovery: {
        enabled: boolean;
        heartbeatInterval: number;
        advertisementInterval: number;
        timeoutThreshold: number;
    };
    /** Auto-recovery configuration */
    autoRecovery: {
        enabled: boolean;
        maxRetries: number;
        backoffMultiplier: number;
        recoveryTimeout: number;
    };
    /** Service dependency management */
    dependencyManagement: {
        enabled: boolean;
        resolutionTimeout: number;
        circularDependencyCheck: boolean;
        dependencyHealthCheck: boolean;
    };
    /** Performance optimization */
    performance: {
        enableCaching: boolean;
        enableConnectionPooling: boolean;
        enableServiceMemoization: boolean;
        maxConcurrentOperations: number;
    };
}
export interface ServiceDiscoveryInfo {
    serviceName: string;
    serviceType: string;
    version: string;
    capabilities: string[];
    tags: string[];
    metadata: Record<string, any>;
    lastHeartbeat: Date;
    endpoint?: string;
    health: 'healthy' | 'degraded' | 'unhealthy';
}
export interface ServiceDependencyGraph {
    nodes: Map<string, {
        service: IService;
        dependencies: Set<string>;
        dependents: Set<string>;
        level: number;
    }>;
    cycles: string[][];
    startupOrder: string[];
    shutdownOrder: string[];
}
/**
 * Enhanced Service Registry with comprehensive service management capabilities.
 *
 * @example
 */
export declare class EnhancedServiceRegistry extends EventEmitter implements IServiceRegistry {
    private factories;
    private services;
    private serviceDiscovery;
    private dependencyGraph;
    private healthStatuses;
    private metricsHistory;
    private config;
    private logger;
    private healthMonitoringInterval?;
    private metricsCollectionInterval?;
    private discoveryInterval?;
    private operationMetrics;
    constructor(config?: Partial<ServiceRegistryConfig>);
    registerFactory<T extends ServiceConfig>(type: string, factory: IServiceFactory<T>): void;
    getFactory<T extends ServiceConfig>(type: string): IServiceFactory<T> | undefined;
    listFactoryTypes(): string[];
    unregisterFactory(type: string): void;
    getAllServices(): Map<string, IService>;
    findService(name: string): IService | undefined;
    getServicesByType(type: string): IService[];
    getServicesByStatus(status: ServiceLifecycleStatus): IService[];
    startAllServices(): Promise<void>;
    stopAllServices(): Promise<void>;
    healthCheckAll(): Promise<Map<string, ServiceStatus>>;
    getSystemMetrics(): Promise<{
        totalServices: number;
        runningServices: number;
        healthyServices: number;
        errorServices: number;
        aggregatedMetrics: ServiceMetrics[];
    }>;
    shutdownAll(): Promise<void>;
    discoverServices(criteria?: {
        type?: string;
        capabilities?: string[];
        health?: 'healthy' | 'degraded' | 'unhealthy';
        tags?: string[];
    }): IService[];
    /**
     * Get comprehensive service discovery information.
     */
    getServiceDiscoveryInfo(): Map<string, ServiceDiscoveryInfo>;
    /**
     * Register service for discovery.
     *
     * @param service
     * @param metadata
     */
    registerServiceForDiscovery(service: IService, metadata?: Record<string, any>): void;
    /**
     * Update service heartbeat.
     *
     * @param serviceName
     */
    updateServiceHeartbeat(serviceName: string): void;
    on(event: 'service-registered' | 'service-unregistered' | 'service-status-changed' | string, handler: (serviceName: string, service?: IService) => void): void;
    off(event: string, handler?: Function): void;
    private initializeMonitoring;
    private startHealthMonitoring;
    private startMetricsCollection;
    private startServiceDiscovery;
    private stopMonitoring;
    private setupFactoryEventHandling;
    private handleServiceRegistration;
    private setupServiceEventHandling;
    private handleServiceEvent;
    private removeServiceFromRegistry;
    private performServiceHealthCheck;
    private performSystemHealthCheck;
    private checkAlertThresholds;
    private collectSystemMetrics;
    private performServiceDiscoveryMaintenance;
    private updateServiceHealth;
    private updateServiceMetrics;
    private buildDependencyGraph;
    private calculateStartupOrder;
    private startServicesInOrder;
    private stopServicesInOrder;
    private startServicesParallel;
    private stopServicesParallel;
    private scheduleServiceRecovery;
    private performServiceRecovery;
}
export default EnhancedServiceRegistry;
//# sourceMappingURL=registry.d.ts.map