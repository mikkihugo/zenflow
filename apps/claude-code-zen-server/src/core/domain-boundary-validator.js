/**
 * @file Domain Boundary Validator - Critical Infrastructure for Phase 0
 *
 * Implements comprehensive runtime type validation at domain boundaries,
 * contract enforcement for domain operations, and domain crossing monitoring.
 *
 * This is the foundation system that all subsequent phases build upon.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Type safety across domain boundaries
 * - Runtime contract validation
 * - Performance optimized for production
 * - Comprehensive error handling and logging
 * - Integration with existing domain types system
 */
import { getLogger } from '../config/logging-config';
/**
 * Domain enumeration covering all system domains
 */
export var Domain;
(function (Domain) {
    Domain["COORDINATION"] = "coordination";
    Domain["WORKFLOWS"] = "workflows";
    Domain["NEURAL"] = "neural";
    Domain["DATABASE"] = "database";
    Domain["MEMORY"] = "memory";
    Domain["KNOWLEDGE"] = "knowledge";
    Domain["OPTIMIZATION"] = "optimization";
    Domain["INTERFACES"] = "interfaces";
    Domain["CORE"] = "core";
})(Domain || (Domain = {}));
// ============================================================================
// VALIDATION ERROR SYSTEM - Comprehensive error handling
// ============================================================================
/**
 * Domain validation error with rich context
 */
export class DomainValidationError extends Error {
    code;
    domain;
    operation;
    validationPath;
    actualValue;
    expectedType;
    timestamp;
    constructor(message, code, domain, operation, validationPath = [], actualValue, expectedType) {
        super(message);
        this.name = 'DomainValidationError';
        this.code = code;
        this.domain = domain;
        this.operation = operation;
        this.validationPath = validationPath;
        this.actualValue = actualValue;
        this.expectedType = expectedType || 'unknown';
        this.timestamp = new Date();
    }
}
/**
 * Contract violation error for operation enforcement
 */
export class ContractViolationError extends Error {
    contractRule;
    domain;
    operation;
    severity;
    timestamp;
    constructor(message, contractRule, domain, operation, severity = 'error') {
        super(message);
        this.name = 'ContractViolationError';
        this.contractRule = contractRule;
        this.domain = domain;
        this.operation = operation;
        this.severity = severity;
        this.timestamp = new Date();
    }
}
// ============================================================================
// DOMAIN BOUNDARY VALIDATOR IMPLEMENTATION - Production-grade validator
// ============================================================================
/**
 * Production-grade domain boundary validator with comprehensive features
 */
export class DomainBoundaryValidator {
    domain;
    logger;
    validationCache = new Map();
    crossingLog = [];
    performanceMetrics = new Map();
    // Performance optimization settings
    cacheEnabled = true;
    maxCacheSize = 1000;
    maxCrossingLogSize = 10000;
    constructor(domain, options = {}) {
        this.domain = domain;
        this.logger = getLogger(`domain-boundary-${domain}`);
        this.cacheEnabled = options.cacheEnabled ?? true;
        this.maxCacheSize = options.maxCacheSize ?? 1000;
        this.maxCrossingLogSize = options.maxCrossingLogSize ?? 10000;
        this.logger.info(`Initialized domain boundary validator for ${domain}`, {
            cacheEnabled: this.cacheEnabled,
            maxCacheSize: this.maxCacheSize,
        });
    }
    /**
     * Validate input data against schema with comprehensive runtime checking
     */
    validateInput(data, schema) {
        const startTime = Date.now();
        const cacheKey = this.generateCacheKey(data, schema);
        // Check cache first for performance
        if (this.cacheEnabled && this.validationCache.has(cacheKey)) {
            this.logger.debug('Cache hit for validation', { cacheKey });
            return this.validationCache.get(cacheKey);
        }
        try {
            const result = this.performValidation(data, schema, []);
            const validationTime = Date.now() - startTime;
            // Cache successful validation
            if (this.cacheEnabled) {
                this.updateCache(cacheKey, result);
            }
            // Track performance metrics
            this.updatePerformanceMetrics(schema.description || 'unknown', {
                validationTimeMs: validationTime,
                schemaComplexity: this.calculateSchemaComplexity(schema),
                dataSize: this.estimateDataSize(data),
                cacheHit: false,
                errorCount: 0,
            });
            this.logger.debug('Validation successful', {
                domain: this.domain,
                validationTime,
                schemaType: schema.type,
            });
            return result;
        }
        catch (error) {
            const validationTime = Date.now() - startTime;
            // Track failed validation metrics
            this.updatePerformanceMetrics(schema.description || 'unknown', {
                validationTimeMs: validationTime,
                schemaComplexity: this.calculateSchemaComplexity(schema),
                dataSize: this.estimateDataSize(data),
                cacheHit: false,
                errorCount: 1,
            });
            this.logger.error('Validation failed', {
                domain: this.domain,
                error: error instanceof Error ? error.message : String(error),
                validationTime,
                dataType: typeof data,
            });
            throw error;
        }
    }
    /**
     * Enforce contract rules for domain operations
     */
    async enforceContract(operation) {
        const startTime = Date.now();
        const crossingId = this.generateCrossingId();
        this.logger.info('Enforcing contract', {
            operationId: operation.id,
            sourceDomain: operation.sourceDomain,
            targetDomain: operation.targetDomain,
            crossingId,
        });
        try {
            // Create domain context for validation
            const context = {
                currentDomain: this.domain,
                operation: operation.id,
                timestamp: new Date(),
                requestId: crossingId,
                metadata: operation.metadata,
            };
            // Validate all contract rules
            const violations = [];
            for (const rule of operation.contractValidation) {
                try {
                    const isValid = await rule.validator(operation, context);
                    if (!isValid) {
                        const violation = new ContractViolationError(rule.errorMessage, rule.name, operation.sourceDomain, operation.id, rule.severity);
                        violations.push(violation);
                        this.logger.warn('Contract rule violation', {
                            rule: rule.name,
                            severity: rule.severity,
                            operation: operation.id,
                        });
                    }
                }
                catch (error) {
                    const violation = new ContractViolationError(`Contract rule execution failed: ${error instanceof Error ? error.message : String(error)}`, rule.name, operation.sourceDomain, operation.id, 'error');
                    violations.push(violation);
                }
            }
            // Check for blocking errors
            const errorViolations = violations.filter((v) => v.severity === 'error');
            if (errorViolations.length > 0) {
                return {
                    success: false,
                    error: errorViolations[0],
                    metadata: {
                        domainFrom: operation.sourceDomain,
                        domainTo: operation.targetDomain,
                        operation: operation.id,
                        timestamp: new Date(),
                        validationTime: Date.now() - startTime,
                        crossingId,
                        performanceMetrics: {
                            validationTimeMs: Date.now() - startTime,
                            schemaComplexity: operation.contractValidation.length,
                            dataSize: JSON.stringify(operation).length,
                            errorCount: errorViolations.length,
                        },
                    },
                };
            }
            // Log warnings for non-blocking violations
            const warnings = violations.filter((v) => v.severity === 'warning');
            if (warnings.length > 0) {
                this.logger.warn('Contract warnings detected', {
                    warningCount: warnings.length,
                    operation: operation.id,
                });
            }
            return {
                success: true,
                data: operation,
                metadata: {
                    domainFrom: operation.sourceDomain,
                    domainTo: operation.targetDomain,
                    operation: operation.id,
                    timestamp: new Date(),
                    validationTime: Date.now() - startTime,
                    crossingId,
                    performanceMetrics: {
                        validationTimeMs: Date.now() - startTime,
                        schemaComplexity: operation.contractValidation.length,
                        dataSize: JSON.stringify(operation).length,
                        errorCount: 0,
                    },
                },
            };
        }
        catch (error) {
            this.logger.error('Contract enforcement failed', {
                operationId: operation.id,
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                metadata: {
                    domainFrom: operation.sourceDomain,
                    domainTo: operation.targetDomain,
                    operation: operation.id,
                    timestamp: new Date(),
                    validationTime: Date.now() - startTime,
                    crossingId,
                },
            };
        }
    }
    /**
     * Track domain crossings for architecture compliance monitoring
     */
    trackCrossings(from, to, operation) {
        const crossing = {
            id: this.generateCrossingId(),
            fromDomain: from,
            toDomain: to,
            operation,
            timestamp: new Date(),
            currentDomain: this.domain,
        };
        this.crossingLog.push(crossing);
        // Maintain log size limit for performance
        if (this.crossingLog.length > this.maxCrossingLogSize) {
            this.crossingLog.splice(0, this.crossingLog.length - this.maxCrossingLogSize);
        }
        this.logger.debug('Domain crossing tracked', {
            crossingId: crossing.id,
            from,
            to,
            operation,
            totalCrossings: this.crossingLog.length,
        });
    }
    // ============================================================================
    // PUBLIC API EXTENSIONS - Additional functionality for comprehensive validation
    // ============================================================================
    /**
     * Get performance metrics for optimization
     */
    getPerformanceMetrics() {
        return new Map(this.performanceMetrics);
    }
    /**
     * Get domain crossing history for compliance analysis
     */
    getDomainCrossings(limit) {
        const crossings = [...this.crossingLog];
        if (limit && limit > 0) {
            return crossings.slice(-limit);
        }
        return crossings;
    }
    /**
     * Clear caches and reset metrics (for testing/maintenance)
     */
    reset() {
        this.validationCache.clear();
        this.crossingLog.length = 0;
        this.performanceMetrics.clear();
        this.logger.info('Domain boundary validator reset', {
            domain: this.domain,
        });
    }
    /**
     * Get validation statistics
     */
    getStatistics() {
        const totalValidations = Array.from(this.performanceMetrics.values()).reduce((sum, metrics) => sum + (metrics.errorCount >= 0 ? 1 : 0), 0);
        const totalErrors = Array.from(this.performanceMetrics.values()).reduce((sum, metrics) => sum + metrics.errorCount, 0);
        const avgValidationTime = Array.from(this.performanceMetrics.values()).reduce((sum, metrics) => sum + metrics.validationTimeMs, 0) / Math.max(1, this.performanceMetrics.size);
        return {
            domain: this.domain,
            totalValidations,
            totalErrors,
            errorRate: totalValidations > 0 ? totalErrors / totalValidations : 0,
            averageValidationTime: avgValidationTime,
            cacheSize: this.validationCache.size,
            crossingCount: this.crossingLog.length,
            lastResetTime: new Date(),
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION - Internal validation logic
    // ============================================================================
    performValidation(data, schema, path) {
        // Handle null/undefined values
        if (data === null || data === undefined) {
            if (schema.type === 'null' || schema.type === 'undefined') {
                return data;
            }
            if (!schema.required) {
                return data;
            }
            throw new DomainValidationError(`Required value is ${data}`, 'REQUIRED_VALUE_MISSING', this.domain, 'validation', path, data, schema.type);
        }
        // Type-specific validation
        switch (schema.type) {
            case 'string':
                if (typeof data !== 'string') {
                    throw new DomainValidationError(`Expected string, got ${typeof data}`, 'TYPE_MISMATCH', this.domain, 'validation', path, data, 'string');
                }
                break;
            case 'number':
                if (typeof data !== 'number' || isNaN(data)) {
                    throw new DomainValidationError(`Expected number, got ${typeof data}`, 'TYPE_MISMATCH', this.domain, 'validation', path, data, 'number');
                }
                break;
            case 'boolean':
                if (typeof data !== 'boolean') {
                    throw new DomainValidationError(`Expected boolean, got ${typeof data}`, 'TYPE_MISMATCH', this.domain, 'validation', path, data, 'boolean');
                }
                break;
            case 'object':
                if (typeof data !== 'object' || Array.isArray(data)) {
                    throw new DomainValidationError(`Expected object, got ${typeof data}`, 'TYPE_MISMATCH', this.domain, 'validation', path, data, 'object');
                }
                // Validate object properties
                if (schema.properties) {
                    for (const [key, propSchema] of Object.entries(schema.properties)) {
                        if (propSchema) {
                            const propData = data[key];
                            this.performValidation(propData, propSchema, [...path, key]);
                        }
                    }
                }
                break;
            case 'array':
                if (!Array.isArray(data)) {
                    throw new DomainValidationError(`Expected array, got ${typeof data}`, 'TYPE_MISMATCH', this.domain, 'validation', path, data, 'array');
                }
                // Validate array items
                if (schema.items) {
                    data.forEach((item, index) => {
                        this.performValidation(item, schema.items, [
                            ...path,
                            index.toString(),
                        ]);
                    });
                }
                break;
            case 'function':
                if (typeof data !== 'function') {
                    throw new DomainValidationError(`Expected function, got ${typeof data}`, 'TYPE_MISMATCH', this.domain, 'validation', path, data, 'function');
                }
                break;
        }
        // Enum validation
        if (schema.enum && !schema.enum.includes(data)) {
            throw new DomainValidationError(`Value not in allowed enum values`, 'ENUM_VIOLATION', this.domain, 'validation', path, data, `enum: ${schema.enum.join(', ')}`);
        }
        // Custom validator
        if (schema.validator && !schema.validator(data)) {
            throw new DomainValidationError(`Custom validation failed`, 'CUSTOM_VALIDATION_FAILED', this.domain, 'validation', path, data, 'custom validator');
        }
        // Transform data if transformer provided
        if (schema.transform) {
            return schema.transform(data);
        }
        return data;
    }
    generateCacheKey(data, schema) {
        // Create a deterministic cache key
        const dataStr = this.safeStringify(data);
        const schemaStr = this.safeStringify(schema);
        const dataHash = this.simpleHash(dataStr);
        const schemaHash = this.simpleHash(schemaStr);
        return `${dataHash}-${schemaHash}`;
    }
    generateCrossingId() {
        return `crossing-${this.domain}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    simpleHash(str) {
        if (!str || str.length === 0)
            return '0';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    safeStringify(obj) {
        try {
            return JSON.stringify(obj, this.getCircularReplacer()) || 'null';
        }
        catch {
            return 'stringify-error';
        }
    }
    getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        };
    }
    calculateSchemaComplexity(schema) {
        let complexity = 1;
        if (schema.properties) {
            complexity += Object.keys(schema.properties).length;
            for (const propSchema of Object.values(schema.properties)) {
                if (propSchema) {
                    complexity += this.calculateSchemaComplexity(propSchema);
                }
            }
        }
        if (schema.items) {
            complexity += this.calculateSchemaComplexity(schema.items);
        }
        if (schema.validator)
            complexity += 2;
        if (schema.transform)
            complexity += 2;
        if (schema.enum)
            complexity += schema.enum.length;
        return complexity;
    }
    estimateDataSize(data) {
        try {
            return this.safeStringify(data).length;
        }
        catch {
            return 0;
        }
    }
    updateCache(key, value) {
        // Implement LRU cache behavior
        if (this.validationCache.size >= this.maxCacheSize) {
            const firstKey = this.validationCache.keys().next().value;
            if (firstKey) {
                this.validationCache.delete(firstKey);
            }
        }
        this.validationCache.set(key, value);
    }
    updatePerformanceMetrics(operation, metrics) {
        const existing = this.performanceMetrics.get(operation);
        if (existing) {
            // Aggregate metrics
            const aggregated = {
                validationTimeMs: (existing.validationTimeMs + metrics.validationTimeMs) / 2,
                schemaComplexity: Math.max(existing.schemaComplexity, metrics.schemaComplexity),
                dataSize: Math.max(existing.dataSize, metrics.dataSize),
                errorCount: existing.errorCount + metrics.errorCount,
            };
            this.performanceMetrics.set(operation, aggregated);
        }
        else {
            this.performanceMetrics.set(operation, metrics);
        }
    }
}
// ============================================================================
// FACTORY AND REGISTRY - Centralized validator management
// ============================================================================
/**
 * Domain boundary validator factory and registry
 */
class DomainBoundaryValidatorRegistry {
    static instance;
    validators = new Map();
    logger = getLogger('domain-boundary-registry');
    constructor() { }
    static getInstance() {
        if (!DomainBoundaryValidatorRegistry.instance) {
            DomainBoundaryValidatorRegistry.instance =
                new DomainBoundaryValidatorRegistry();
        }
        return DomainBoundaryValidatorRegistry.instance;
    }
    /**
     * Get or create validator for a domain
     */
    getValidator(domain) {
        if (!this.validators.has(domain)) {
            const validator = new DomainBoundaryValidator(domain);
            this.validators.set(domain, validator);
            this.logger.info('Created new domain validator', { domain });
        }
        return this.validators.get(domain);
    }
    /**
     * Get all validators for system-wide operations
     */
    getAllValidators() {
        return new Map(this.validators);
    }
    /**
     * Reset all validators (for testing/maintenance)
     */
    resetAll() {
        for (const validator of this.validators.values()) {
            validator.reset();
        }
        this.logger.info('Reset all domain validators');
    }
    /**
     * Get system-wide validation statistics
     */
    getSystemStatistics() {
        const stats = {
            totalDomains: this.validators.size,
            domainStatistics: new Map(),
            systemTotalValidations: 0,
            systemTotalErrors: 0,
            systemErrorRate: 0,
            systemAverageValidationTime: 0,
        };
        let totalValidations = 0;
        let totalErrors = 0;
        let totalValidationTime = 0;
        for (const [domain, validator] of this.validators) {
            const domainStats = validator.getStatistics();
            stats.domainStatistics.set(domain, domainStats);
            totalValidations += domainStats.totalValidations;
            totalErrors += domainStats.totalErrors;
            totalValidationTime +=
                domainStats.averageValidationTime * domainStats.totalValidations;
        }
        stats.systemTotalValidations = totalValidations;
        stats.systemTotalErrors = totalErrors;
        stats.systemErrorRate =
            totalValidations > 0 ? totalErrors / totalValidations : 0;
        stats.systemAverageValidationTime =
            totalValidations > 0 ? totalValidationTime / totalValidations : 0;
        return stats;
    }
}
// ============================================================================
// COMMON SCHEMA DEFINITIONS - Reusable schemas for domain types
// ============================================================================
/**
 * Common schema definitions for existing domain types
 */
export const CommonSchemas = {
    /**
     * Agent schema for coordination domain
     */
    Agent: {
        type: 'object',
        required: true,
        properties: {
            id: { type: 'string', required: true },
            capabilities: {
                type: 'array',
                required: true,
                items: { type: 'string' },
            },
            status: {
                type: 'string',
                required: true,
                enum: ['idle', 'busy'],
            },
        },
    },
    /**
     * Task schema for coordination domain
     */
    Task: {
        type: 'object',
        required: true,
        properties: {
            id: { type: 'string', required: true },
            description: { type: 'string', required: true },
            strategy: {
                type: 'string',
                required: true,
                enum: ['parallel', 'sequential', 'adaptive', 'consensus'],
            },
            dependencies: {
                type: 'array',
                required: true,
                items: { type: 'string' },
            },
            requiredCapabilities: {
                type: 'array',
                required: true,
                items: { type: 'string' },
            },
            maxAgents: { type: 'number', required: true },
            requireConsensus: { type: 'boolean', required: true },
        },
    },
    /**
     * WorkflowDefinition schema for workflows domain
     */
    WorkflowDefinition: {
        type: 'object',
        required: true,
        properties: {
            id: { type: 'string', required: true },
            name: { type: 'string', required: true },
            version: { type: 'string', required: true },
            // Additional properties would be defined based on the actual WorkflowDefinition interface
        },
    },
};
// ============================================================================
// EXPORTS - Public API
// ============================================================================
// Export the singleton registry
export const domainValidatorRegistry = DomainBoundaryValidatorRegistry.getInstance();
// Convenience function for getting domain validators
export function getDomainValidator(domain) {
    return domainValidatorRegistry.getValidator(domain);
}
// Convenience function for cross-domain validation
export function validateCrossDomain(data, schema, fromDomain, toDomain, operation) {
    const validator = getDomainValidator(fromDomain);
    validator.trackCrossings(fromDomain, toDomain, operation);
    return validator.validateInput(data, schema);
}
export default DomainBoundaryValidator;
//# sourceMappingURL=domain-boundary-validator.js.map