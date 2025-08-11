/**
 * USL Validation Framework - Comprehensive Integration Validation.
 *
 * Advanced validation system for USL integration quality assurance,
 * system health validation, configuration validation, and integration testing.
 * Following the same patterns as UACL Agent 6.
 */
/**
 * @file Interface implementation: validation.
 */
import type { ServiceLifecycleStatus } from './core/interfaces.ts';
import type { ServiceManager } from './manager.ts';
import type { EnhancedServiceRegistry } from './registry.ts';
export interface ValidationConfig {
    /** Validation strictness level */
    strictness: 'strict' | 'moderate' | 'lenient';
    /** Validation scopes to include */
    scopes: {
        configuration: boolean;
        dependencies: boolean;
        performance: boolean;
        security: boolean;
        compatibility: boolean;
        integration: boolean;
    };
    /** Performance thresholds for validation */
    thresholds: {
        maxResponseTime: number;
        maxErrorRate: number;
        minAvailability: number;
        maxMemoryUsage: number;
        maxConcurrentConnections: number;
    };
    /** Timeout settings */
    timeouts: {
        healthCheck: number;
        dependencyCheck: number;
        performanceTest: number;
        integrationTest: number;
    };
    /** Test data and scenarios */
    testScenarios: {
        loadTest: {
            enabled: boolean;
            concurrentUsers: number;
            duration: number;
        };
        stressTest: {
            enabled: boolean;
            maxLoad: number;
            duration: number;
        };
        failoverTest: {
            enabled: boolean;
            scenarios: string[];
        };
    };
}
export interface ValidationResult {
    overall: 'pass' | 'warning' | 'fail';
    score: number;
    timestamp: Date;
    duration: number;
    results: {
        configuration: ValidationSectionResult;
        dependencies: ValidationSectionResult;
        performance: ValidationSectionResult;
        security: ValidationSectionResult;
        compatibility: ValidationSectionResult;
        integration: ValidationSectionResult;
    };
    summary: {
        totalChecks: number;
        passed: number;
        warnings: number;
        failures: number;
        criticalIssues: number;
    };
    recommendations: Array<{
        type: 'critical' | 'warning' | 'improvement';
        category: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'high' | 'medium' | 'low';
        action: string;
    }>;
}
export interface ValidationSectionResult {
    status: 'pass' | 'warning' | 'fail';
    score: number;
    checks: Array<{
        name: string;
        status: 'pass' | 'warning' | 'fail';
        message: string;
        details?: Record<string, unknown>;
        duration: number;
    }>;
    warnings: string[];
    errors: string[];
}
export interface SystemHealthValidation {
    overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    serviceHealth: Map<string, {
        status: ServiceLifecycleStatus;
        health: 'healthy' | 'degraded' | 'unhealthy';
        issues: string[];
        recommendations: string[];
    }>;
    systemMetrics: {
        totalServices: number;
        healthyServices: number;
        responseTimeP95: number;
        errorRate: number;
        memoryUsage: number;
        uptime: number;
    };
    alerts: Array<{
        severity: 'critical' | 'warning' | 'info';
        service?: string;
        message: string;
        timestamp: Date;
    }>;
}
/**
 * Comprehensive USL Validation Framework.
 *
 * @example
 */
export declare class USLValidationFramework {
    private serviceManager;
    private registry;
    private compatibility;
    private config;
    private logger;
    constructor(serviceManager: ServiceManager, registry: EnhancedServiceRegistry, config?: Partial<ValidationConfig>);
    /**
     * Perform comprehensive USL system validation.
     */
    validateSystem(): Promise<ValidationResult>;
    /**
     * Validate system health and service status.
     */
    validateSystemHealth(): Promise<SystemHealthValidation>;
    /**
     * Validate specific service configuration.
     *
     * @param serviceName
     */
    validateServiceConfig(serviceName: string): Promise<{
        valid: boolean;
        issues: string[];
        warnings: string[];
        recommendations: string[];
    }>;
    private validateConfiguration;
    private validateDependencies;
    private validatePerformance;
    private validateSecurity;
    private validateCompatibility;
    private validateIntegration;
    private calculateOverallResults;
    private calculateSectionResult;
    private generateRecommendations;
    private detectCircularDependencies;
    private performLoadTest;
    private checkServiceSecurity;
    private checkSensitiveDataExposure;
    private detectBreakingChanges;
    private validateLegacyAPIs;
    private testServiceCommunication;
    private testDataFlowIntegrity;
    private checkIntegrationHealth;
    private performFailoverTest;
    private calculateP95ResponseTime;
    private calculateTotalMemoryUsage;
    private validateServiceTypeSpecific;
}
export default USLValidationFramework;
//# sourceMappingURL=validation.d.ts.map