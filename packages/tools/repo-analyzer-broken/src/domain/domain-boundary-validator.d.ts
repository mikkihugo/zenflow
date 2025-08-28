/**
 * @file Domain Boundary Validator - Repository Architecture Validation
 *
 * Implements comprehensive runtime type validation at domain boundaries,
 * contract enforcement for domain operations, and domain crossing monitoring.
 *
 * Integrated into repo-analyzer for comprehensive repository architecture analysis.
 *
 * ARCHITECTURE:Multi-Agent Cognitive Architecture compliant
 * - Type safety across domain boundaries
 * - Runtime contract validation
 * - Performance optimized for production
 * - Comprehensive error handling and logging
 * - Integration with repository analysis
 */
interface Agent {
    id:string;
    capabilities:string[];
    status:'idle' | ' busy';
}
interface Task {
    id:string;
    description:string;
    strategy:'parallel' | ' sequential' | ' adaptive' | ' consensus';
    dependencies:string[];
    requiredCapabilities:string[];
    maxAgents:number;
    requireConsensus:boolean;
}
interface WorkflowDefinition {
    id:string;
    name:string;
    version:string;
}
/**
 * Schema definition for runtime type validation
 */
export interface TypeSchema<T = any> {
    type:'string' | ' number' | ' boolean' | ' object' | ' array' | ' null' | ' undefined' | ' function';
    required?:boolean;
    properties?:{
        [K in keyof T]?:TypeSchema<T[K]>;
};
    items?:TypeSchema;
    enum?:T[];
    validator?:(value: unknown) => boolean;
    transform?:(value: unknown) => T;
    description?:string;
}
/**
 * Result type for domain operations with comprehensive error handling
 */
export type Result<T = any, E = Error> = {
    success:true;
    data:T;
    metadata?:DomainMetadata;
} | {
    success:false;
    error:E;
    metadata?:DomainMetadata;
};
/**
 * Domain metadata for operation tracking and debugging
 */
export interface DomainMetadata {
    domainFrom?:Domain;
    domainTo?:Domain;
    operation:string;
    timestamp:Date;
    validationTime:number;
    crossingId:string;
    performanceMetrics?:PerformanceMetrics;
}
/**
 * Performance metrics for optimization and monitoring
 */
export interface PerformanceMetrics {
    validationTimeMs:number;
    schemaComplexity:number;
    dataSize:number;
    cacheHit?:boolean;
    errorCount:number;
}
/**
 * Domain enumeration covering all system domains
 */
export declare enum Domain {
    COORDINATION = "coordination",
    WORKFLOWS = "workflows",
    NEURAL = "neural",
    DATABASE = "database",
    MEMORY = "memory",
    KNOWLEDGE = "knowledge",
    OPTIMIZATION = "optimization",
    INTERFACES = "interfaces",
    CORE = "core"
}
/**
 * Domain operation definition with contracts
 */
export interface DomainOperation {
    id:string;
    sourceDomain:Domain;
    targetDomain:Domain;
    operationType:'read' | ' write' | ' execute' | ' transform' | ' validate';
    inputSchema:TypeSchema;
    outputSchema:TypeSchema;
    contractValidation:ContractRule[];
    metadata:{
        description:string;
        version:string;
        rateLimit?:number;
        timeout?:number;
        retryPolicy?:RetryPolicy;
};
}
/**
 * Contract validation rules for domain operations
 */
export interface ContractRule {
    name:string;
    description:string;
    validator:(input: unknown, context:DomainContext) => Promise<boolean>;
    severity:'error' | ' warning' | ' info';
    errorMessage:string;
}
/**
 * Domain context for validation operations
 */
export interface DomainContext {
    currentDomain:Domain;
    operation:string;
    timestamp:Date;
    requestId:string;
    metadata?:Record<string, unknown>;
}
/**
 * Retry policy for failed operations
 */
export interface RetryPolicy {
    maxAttempts:number;
    backoffStrategy:'linear' | ' exponential';
    baseDelay:number;
    maxDelay:number;
}
/**
 * Core domain boundary interface that all domains must implement
 */
export interface DomainBoundary {
    /**
     * Validate input data against a schema with runtime type checking
     */
    validateInput<T>(data:unknown, schema:TypeSchema<T>): T;
    /**
     * Enforce contract rules for domain operations
     */
    enforceContract(operation:DomainOperation): Promise<Result>;
    /**
     * Track domain crossings for architecture compliance monitoring
     */
    trackCrossings(from:Domain, to:Domain, operation:string): void;
}
/**
 * Domain validation error with rich context
 */
export declare class DomainValidationError extends Error {
    readonly code:string;
    readonly domain:Domain;
    readonly operation:string;
    readonly validationPath:string[];
    readonly actualValue:unknown;
    readonly expectedType:string;
    readonly timestamp:Date;
    constructor(message:string, code:string, domain:Domain, operation:string, validationPath?:string[], actualValue?:unknown, expectedType?:string);
}
/**
 * Contract violation error for operation enforcement
 */
export declare class ContractViolationError extends Error {
    readonly contractRule:string;
    readonly domain:Domain;
    readonly operation:string;
    readonly severity:'error' | ' warning' | ' info';
    readonly timestamp:Date;
    constructor(message:string, contractRule:string, domain:Domain, operation:string, severity?:'error' | ' warning' | ' info');
}
/**
 * Production-grade domain boundary validator with comprehensive features
 */
export declare class DomainBoundaryValidator implements DomainBoundary {
    readonly domain:Domain;
    private readonly logger;
    private readonly cacheEnabled;
    private readonly maxCacheSize;
    private readonly maxCrossingLogSize;
    private readonly validationCache;
    private readonly crossingLog;
    private readonly performanceMetrics;
    constructor(domain:Domain, options?:{
        cacheEnabled?:boolean;
        maxCacheSize?:number;
        maxCrossingLogSize?:number;
});
    /**
     * Validate input data against schema with comprehensive runtime checking
     */
    validateInput<T>(data:unknown, schema:TypeSchema<T>): T;
    /**
     * Enforce contract rules for domain operations
     */
    enforceContract(operation:DomainOperation): Promise<Result>;
    /**
     * Track domain crossings for architecture compliance monitoring
     */
    trackCrossings(from:Domain, to:Domain, operation:string): void;
    /**
     * Get performance metrics for optimization
     */
    getPerformanceMetrics():Map<string, PerformanceMetrics>;
    /**
     * Get domain crossing history for compliance analysis
     */
    getDomainCrossings(limit?:number): DomainCrossing[];
    /**
     * Clear caches and reset metrics (for testing/maintenance)
     */
    reset():void;
    /**
     * Get validation statistics
     */
    getStatistics():ValidationStatistics;
    private performValidation;
    private generateCacheKey;
    private generateCrossingId;
    private simpleHash;
    private safeStringify;
    private getCircularReplacer;
    private calculateSchemaComplexity;
    private estimateDataSize;
    private updateCache;
    private updatePerformanceMetrics;
}
/**
 * Domain crossing record for compliance tracking
 */
export interface DomainCrossing {
    id:string;
    fromDomain:Domain;
    toDomain:Domain;
    operation:string;
    timestamp:Date;
    currentDomain:Domain;
}
/**
 * Validation statistics for monitoring and optimization
 */
export interface ValidationStatistics {
    domain:Domain;
    totalValidations:number;
    totalErrors:number;
    errorRate:number;
    averageValidationTime:number;
    cacheSize:number;
    crossingCount:number;
    lastResetTime:Date;
}
/**
 * System-wide validation statistics
 */
export interface SystemValidationStatistics {
    totalDomains:number;
    domainStatistics:Map<Domain, ValidationStatistics>;
    systemTotalValidations:number;
    systemTotalErrors:number;
    systemErrorRate:number;
    systemAverageValidationTime:number;
}
/**
 * Domain boundary validator factory and registry
 */
declare class DomainBoundaryValidatorRegistry {
    private static instance;
    private readonly validators;
    private readonly logger;
    private constructor();
    static getInstance():DomainBoundaryValidatorRegistry;
    /**
     * Get or create validator for a domain
     */
    getValidator(domain:Domain): DomainBoundaryValidator;
    /**
     * Get all validators for system-wide operations
     */
    getAllValidators():Map<Domain, DomainBoundaryValidator>;
    /**
     * Reset all validators (for testing/maintenance)
     */
    resetAll():void;
    /**
     * Get system-wide validation statistics
     */
    getSystemStatistics():SystemValidationStatistics;
}
/**
 * Common schema definitions for existing domain types
 */
export declare const CommonSchemas:{
    /**
     * Agent schema for coordination domain
     */
    readonly Agent:TypeSchema<Agent>;
    /**
     * Task schema for coordination domain
     */
    readonly Task:TypeSchema<Task>;
    /**
     * WorkflowDefinition schema for workflows domain
     */
    readonly WorkflowDefinition:TypeSchema<Pick<WorkflowDefinition, "id" | "name" | "version">>;
};
export declare const domainValidatorRegistry:DomainBoundaryValidatorRegistry;
export declare function getDomainValidator(domain:Domain): DomainBoundaryValidator;
export declare function validateCrossDomain<T>(data:unknown, schema:TypeSchema<T>, fromDomain:Domain, toDomain:Domain, operation:string): T;
export default DomainBoundaryValidator;
//# sourceMappingURL=domain-boundary-validator.d.ts.map