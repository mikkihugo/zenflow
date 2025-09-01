/**
 * @fileoverview System Status Manager - Package Availability and Health Tracking
 *
 * Provides centralized tracking of package availability,
 * health status, and capability reporting using service management.
 *
 * @example Basic Usage - Check System Status
 * '''typescript'
 * import { getSystemStatus, getHealthSummary} from '@claude-zen/foundation/status-manager';
 *
 * const systemStatus = getSystemStatus();
 * logger.info('Overall:' + (systemStatus.overall) + ', Health:' + systemStatus.healthScore + '%');
 *
 * const health = getHealthSummary();
 * // Returns:{ status: 'healthy|degraded|unhealthy', details:{...}}
 * '
 *
 * @example Service Resolution with Fallbacks
 * '''typescript'
 * import { getService, hasService} from '@claude-zen/foundation/status-manager';
 *
 * // Check if monitoring service is registered in container
 * if (hasService('systemmonitoring')) {
 *   const monitoring = await getService('systemmonitoring');
 *   const tracker = new monitoring.PerformanceTracker();
 *} else {
 *   // Use fallback implementation
 *   const monitoring = await getService('systemmonitoring', () => ({
 *     PerformanceTracker:class FallbackTracker { startTimer() { return () => {};}}
 *}));
 *}
 * '
 *
 * @example Service Registration
 * '''typescript'
 * import { registerService} from '@claude-zen/foundation/status-manager';
 *
 * // Register infrastructure service with expected packages
 * await registerService('infrastructure', [
 *   '@claude-zen/event-system', *   '@claude-zen/database', *   '@claude-zen/system-monitoring') *], [
 *   'Event system management', *   'Database access and ORM', *   'System monitoring and telemetry') *]);
 * '
 *
 * @example Health Check Endpoints
 * '''typescript'
 * import { getHealthSummary, getSystemStatus} from '@claude-zen/foundation/status-manager';
 *
 * // Basic health endpoint
 * app.get('/health', (req, res) => {
 *   const health = getHealthSummary();
 *   res.json({
 *     status:health.status, // 'healthy|degraded|unhealthy') *     timestamp:new Date().toISOString(),
 *     details:health.details
 *});
 *});
 *
 * // Detailed service status
 * app.get('/health/services', (req, res) => {
 *   const systemStatus = getSystemStatus();
 *   res.json({
 *     overall:systemStatus.overall,
 *     services:Object.entries(systemStatus.services).map(([name, status]) => ({
 *       name,
 *       capability:status.capability, // 'full|partial|fallback') *       healthScore:status.healthScore,
 *       missingPackages:status.missingPackages
 *}))
 *});
 *});
 * '
 *
 * Features:
 * • Package availability detection with service container integration
 * • Service registration when packages are available
 * • Graceful degradation tracking and fallback management
 * • Health check endpoints for monitoring
 * • Real-time status updates and event emission
 */
import { EventEmitter } from '../../events/event-emitter.js';
import type { JsonObject, JsonValue } from '../../types/primitives';
type AwilixContainer = {
    register: (nameOrRegistrations: string | JsonObject, resolver?: JsonValue, options?: JsonObject) => void;
    resolve: <T = JsonValue>(name: string) => T;
    has: (name: string) => boolean;
    dispose: () => Promise<void>;
};
/**
 * Package availability status for facade management.
 * Tracks the lifecycle of package loading and registration.
 *
 * @enum PackageStatus
 */
export declare enum PackageStatus {
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable",
    LOADING = "loading",
    ERROR = "error",
    REGISTERED = "registered"
}
/**
 * Service capability levels indicating system functionality.
 * Determines what features are available based on package availability.
 *
 * @enum CapabilityLevel
 */
export declare enum CapabilityLevel {
    FULL = "full",// All packages available and registered
    PARTIAL = "partial",// Some packages available
    FALLBACK = "fallback",// No packages, using compatibility layer
    DISABLED = "disabled"
}
/**
 * Package information with service container integration.
 * Tracks package status, version, and service registration details.
 *
 * @interface PackageInfo
 */
export interface PackageInfo {
    name: string;
    status: PackageStatus;
    version?: string;
    loadTime?: number;
    error?: string;
    lastChecked: number;
    capabilities?: string[];
    awilixRegistered: boolean;
    serviceName?: string;
}
/**
 * Comprehensive service status information.
 * Provides complete view of service health, capabilities, and package availability.
 *
 * @interface ServiceStatus
 */
export interface ServiceStatus {
    name: string;
    capability: CapabilityLevel;
    packages: Record<string, PackageInfo>;
    features: string[];
    missingPackages: string[];
    registeredServices: string[];
    healthScore: number;
    lastUpdated: number;
}
/**
 * System-wide service status aggregation.
 * Provides overall health assessment across all registered services.
 *
 * @interface SystemStatus
 */
export interface SystemStatus {
    overall: CapabilityLevel;
    services: Record<string, ServiceStatus>;
    facades: Record<string, FacadeStatus>;
    totalPackages: number;
    availablePackages: number;
    registeredServices: number;
    healthScore: number;
    lastUpdated: number;
}
/**
 * Facade status information for infrastructure tracking.
 */
export interface FacadeStatus {
    name: string;
    available: boolean;
    healthScore: number;
    lastChecked: number;
    capabilities: string[];
    capability: CapabilityLevel;
    dependencies: string[];
    packages: Record<string, PackageInfo>;
    registeredServices: string[];
    features: string[];
    missingPackages: string[];
}
/**
 * Service status events interface for type safety
 */
interface ServiceStatusEvents {
    'service-registered': [{
        serviceName: string;
        timestamp: Date;
    }];
    'service-health-changed': [
        {
            serviceName: string;
            healthy: boolean;
            timestamp: Date;
        }
    ];
    'system-status-changed': [
        {
            status: string;
            healthScore: number;
            timestamp: Date;
        }
    ];
    'package-loaded': [
        {
            packageName: string;
            version?: string;
            timestamp: Date;
        }
    ];
    'package-failed': [{
        packageName: string;
        error: Error;
        timestamp: Date;
    }];
    'service-resolved': [{
        serviceName: string;
        timestamp: Date;
    }];
    'service-resolution-failed': [
        {
            serviceName: string;
            error: Error;
            timestamp: Date;
        }
    ];
    [key: string]: unknown[];
}
/**
 * Central service status manager with service container integration and typed events
 */
export declare class SystemStatusManager extends EventEmitter<ServiceStatusEvents> {
    private static instance;
    private packageCache;
    private serviceStatus;
    private packageCacheExpiry;
    private readonly CACHE_DURATION;
    private container;
    private statusUpdateInterval;
    private facadeStatus;
    constructor();
    static getInstance(): SystemStatusManager;
    /**
     * Get the Awilix container for service registration
     */
    getContainer(): AwilixContainer;
    /**
     * Initialize status tracking
     */
    private initializeStatusTracking;
    /**
     * Check if a package is available and register it with Awilix
     *
     * @example
     * '''typescript'
     * const packageInfo = await statusManager.checkAndRegisterPackage('@claude-zen/brain',    'brainService');
     * if (packageInfo.status === PackageStatus.REGISTERED) {
     *   logger.info('Brain package available and registered in Awilix');
     *}
     * '
     */
    checkAndRegisterPackage(packageName: string, serviceName?: string): Promise<PackageInfo>;
    /**
     * Get cached package if not expired
     */
    private getCachedPackage;
    /**
     * Create initial package info
     */
    private createInitialPackageInfo;
    /**
     * Process successful package import
     */
    private processSuccessfulImport;
    /**
     * Process failed package import
     */
    private processFailedImport;
    /**
     * Register module in Awilix container
     */
    private registerModuleInAwilix;
    /**
     * Create Awilix registrations for module exports
     */
    private createRegistrations;
    /**
     * Cache result and emit event
     */
    private cacheAndEmitResult;
    /**
     * Register a service with its expected packages
     *
     * @example
     * '''typescript'
     * await statusManager.registerService('intelligence', [
     *   '@claude-zen/brain',	 *   '@claude-zen/ai-safety')	 *], [
     *   'Neural coordination',	 *   'AI safety protocols'*]);
     * '
     */
    registerService(serviceName: string, expectedPackages: string[], features?: string[]): Promise<void>;
    /**
     * Get a service from the Awilix container with fallback
     *
     * @example
     * '''typescript'
     * // Try to get real monitoring service, fall back to stub
     * const monitoring = await statusManager.getService('systemmonitoring', () => ({
     *   PerformanceTracker:class FallbackTracker {
     *     startTimer() { return () => logger.info('Fallback timer');}
     *}
     *}));
     * `;
     */
    getService<T>(serviceName: string, fallback?: () => T): T | null;
    /**
     * Check if a service is available in the container
     */
    hasService(serviceName: string): boolean;
    /**
     * Get status for a specific service
     */
    getServiceStatus(serviceName: string): ServiceStatus | null;
    /**
     * Get system-wide status
     */
    getSystemStatus(): SystemStatus;
    /**
     * Get simple status summary for health checks
     */
    getHealthSummary(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: JsonObject;
    };
    /**
     * Update system status and re-register stale services
     */
    private updateSystemStatus;
    /**
     * Force refresh of all package statuses and re-register services
     */
    refreshAllStatuses(): Promise<void>;
    /**
     * Clean up expired cache entries to prevent memory leaks
     */
    private cleanupExpiredCache;
    /**
     * Cleanup resources
     */
    /**
     * Register a facade with status tracking
     */
    registerFacade(facadeName: string, expectedPackages: string[], features?: string[]): Promise<void>;
    /**
     * Get facade status
     */
    getFacadeStatus(facadeName: string): FacadeStatus | null;
    shutdown(): void;
}
export declare const facadeStatusManager: SystemStatusManager;
export declare function getFacadeStatus(facadeName: string): FacadeStatus | null;
export declare function getSystemStatus(): SystemStatus;
export declare function getHealthSummary(): {
    status: "healthy" | "degraded" | "unhealthy";
    details: JsonObject;
};
export declare function registerFacade(facadeName: string, expectedPackages: string[], features?: string[]): Promise<void>;
export declare function getService<T>(serviceName: string, fallback?: () => T): Promise<T | null>;
export declare function hasService(serviceName: string): boolean;
export {};
//# sourceMappingURL=system.status.manager.d.ts.map