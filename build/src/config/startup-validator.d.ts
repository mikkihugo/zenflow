/**
 * @file Startup Configuration Validator.
 *
 * Production-ready configuration validation that runs at startup.
 * Fails fast if configuration is invalid for deployment.
 */
import type { ValidationResult } from './types.ts';
/**
 * Startup validation options.
 *
 * @example
 */
export interface StartupValidationOptions {
    /** Fail fast on any configuration errors */
    strict?: boolean;
    /** Check production readiness even in development */
    enforceProductionStandards?: boolean;
    /** Skip certain validation categories */
    skipValidation?: Array<'structure' | 'security' | 'performance' | 'ports' | 'environment'>;
    /** Output format for validation results */
    outputFormat?: 'console' | 'json' | 'silent';
}
/**
 * Startup validation result.
 *
 * @example
 */
export interface StartupValidationResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    blockers: string[];
    environment: string;
    timestamp: number;
    validationDetails: ValidationResult;
    portConflicts: Array<{
        port: number;
        services: string[];
        severity: 'error' | 'warning';
    }>;
    exitCode: number;
}
/**
 * Run comprehensive startup validation.
 *
 * @param options - Validation options.
 * @returns Validation result.
 * @example
 */
export declare function runStartupValidation(options?: StartupValidationOptions): Promise<StartupValidationResult>;
/**
 * Run startup validation and exit process if validation fails.
 *
 * @param options - Validation options.
 * @example
 */
export declare function validateAndExit(options?: StartupValidationOptions): Promise<never>;
/**
 * CLI entry point for startup validation.
 *
 * @example
 */
export declare function cli(): Promise<void>;
//# sourceMappingURL=startup-validator.d.ts.map