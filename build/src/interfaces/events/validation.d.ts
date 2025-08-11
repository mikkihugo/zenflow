/**
 * UEL (Unified Event Layer) - Validation Framework.
 *
 * Comprehensive validation framework for ensuring UEL integration quality,
 * event type safety, and system health across all components.
 *
 * @file Validation Framework Implementation.
 */
import type { ILogger } from '../../core/interfaces/base-interfaces.ts';
import type { EventManagerConfig, EventManagerType, SystemEvent } from './core/interfaces.ts';
import type { EventManager } from './manager.ts';
import type { EventRegistry } from './registry.ts';
/**
 * Validation result interface.
 *
 * @example
 */
export interface ValidationResult {
    /** Validation passed */
    valid: boolean;
    /** Validation score (0-100) */
    score: number;
    /** Validation errors */
    errors: ValidationError[];
    /** Validation warnings */
    warnings: ValidationWarning[];
    /** Validation recommendations */
    recommendations: ValidationRecommendation[];
    /** Performance metrics */
    metrics: {
        validationTime: number;
        checkCount: number;
        complexity: 'low' | 'medium' | 'high';
    };
    /** Validation metadata */
    metadata: {
        validator: string;
        timestamp: Date;
        version: string;
        context: Record<string, any>;
    };
}
/**
 * Validation error details.
 *
 * @example
 */
export interface ValidationError {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Error severity */
    severity: 'critical' | 'high' | 'medium' | 'low';
    /** Error category */
    category: 'type' | 'config' | 'integration' | 'performance' | 'compatibility';
    /** Error location */
    location?: {
        component: string;
        method?: string;
        line?: number;
    };
    /** Suggested fix */
    suggestion?: string;
    /** Error context */
    context?: Record<string, any>;
}
/**
 * Validation warning details.
 *
 * @example
 */
export interface ValidationWarning {
    /** Warning code */
    code: string;
    /** Warning message */
    message: string;
    /** Warning category */
    category: 'optimization' | 'deprecation' | 'best-practice' | 'maintenance';
    /** Warning impact */
    impact: 'low' | 'medium' | 'high';
    /** Warning context */
    context?: Record<string, any>;
}
/**
 * Validation recommendation details.
 *
 * @example
 */
export interface ValidationRecommendation {
    /** Recommendation type */
    type: 'optimization' | 'refactoring' | 'feature' | 'security' | 'performance';
    /** Recommendation message */
    message: string;
    /** Expected benefit */
    benefit: string;
    /** Implementation effort */
    effort: 'low' | 'medium' | 'high';
    /** Priority */
    priority: 'low' | 'medium' | 'high' | 'critical';
    /** Implementation steps */
    steps?: string[];
}
/**
 * Event type validation schema.
 *
 * @example
 */
export interface EventTypeSchema {
    /** Required properties */
    required: string[];
    /** Property types */
    properties: Record<string, {
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        format?: string;
        enum?: any[];
        minimum?: number;
        maximum?: number;
        pattern?: string;
    }>;
    /** Additional properties allowed */
    additionalProperties: boolean;
    /** Event type constraints */
    constraints?: {
        maxSize?: number;
        requiredFields?: string[];
        forbiddenFields?: string[];
    };
}
/**
 * System health validation configuration.
 *
 * @example
 */
export interface HealthValidationConfig {
    /** Health check timeout */
    timeout: number;
    /** Acceptable response time threshold */
    responseTimeThreshold: number;
    /** Memory usage threshold (MB) */
    memoryThreshold: number;
    /** CPU usage threshold (%) */
    cpuThreshold: number;
    /** Error rate threshold (%) */
    errorRateThreshold: number;
    /** Minimum uptime requirement (ms) */
    minimumUptime: number;
}
/**
 * Integration validation configuration.
 *
 * @example
 */
export interface IntegrationValidationConfig {
    /** Required manager types */
    requiredManagerTypes: EventManagerType[];
    /** Required event types */
    requiredEventTypes: string[];
    /** Cross-manager communication tests */
    crossManagerTests: boolean;
    /** Performance benchmarks */
    performanceBenchmarks: {
        eventsPerSecond: number;
        maxLatency: number;
        maxMemoryUsage: number;
    };
}
/**
 * Main validation framework class.
 *
 * @example
 */
export declare class UELValidationFramework {
    private eventTypeSchemas;
    private healthConfig;
    private integrationConfig;
    private validationHistory;
    private logger;
    constructor(logger: ILogger);
    /**
     * Validate event type against schema.
     *
     * @param event
     * @param schema
     */
    validateEventType<T extends SystemEvent>(event: T, schema?: EventTypeSchema): ValidationResult;
    /**
     * Validate event manager configuration.
     *
     * @param config
     */
    validateManagerConfig(config: EventManagerConfig): ValidationResult;
    /**
     * Validate system health.
     *
     * @param eventManager
     * @param config
     */
    validateSystemHealth(eventManager: EventManager, config?: Partial<HealthValidationConfig>): Promise<ValidationResult>;
    /**
     * Validate UEL integration completeness.
     *
     * @param eventManager
     * @param registry
     * @param config
     */
    validateIntegration(eventManager: EventManager, registry: EventRegistry, config?: Partial<IntegrationValidationConfig>): Promise<ValidationResult>;
    /**
     * Perform comprehensive UEL validation.
     *
     * @param eventManager
     * @param registry
     * @param sampleEvents
     */
    validateComplete(eventManager: EventManager, registry: EventRegistry, sampleEvents?: SystemEvent[]): Promise<{
        overall: ValidationResult;
        health: ValidationResult;
        integration: ValidationResult;
        events: ValidationResult[];
        summary: {
            totalScore: number;
            criticalIssues: number;
            recommendations: number;
            validationTime: number;
        };
    }>;
    /**
     * Register custom event type schema.
     *
     * @param eventType
     * @param schema
     */
    registerEventTypeSchema(eventType: string, schema: EventTypeSchema): void;
    /**
     * Get validation history.
     */
    getValidationHistory(): ValidationResult[];
    /**
     * Clear validation history.
     */
    clearValidationHistory(): void;
    /**
     * Export validation report.
     *
     * @param results
     */
    exportValidationReport(results: ValidationResult[]): {
        summary: {
            totalValidations: number;
            averageScore: number;
            totalErrors: number;
            totalWarnings: number;
            totalRecommendations: number;
        };
        trends: {
            scoreOverTime: Array<{
                timestamp: Date;
                score: number;
            }>;
            errorsByCategory: Record<string, number>;
            recommendationsByType: Record<string, number>;
        };
        details: ValidationResult[];
    };
    /**
     * Private helper methods.
     */
    private validatePropertyType;
    private validateGeneralEventStructure;
    private calculateValidationScore;
    private determineComplexity;
    private createErrorResult;
    private initializeDefaultSchemas;
}
export default UELValidationFramework;
//# sourceMappingURL=validation.d.ts.map