/**
 * @file Interface implementation: validation.
 */
export interface ValidationResult {
    component: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    error?: Error;
    details?: any;
}
export interface ValidationReport {
    overall: 'pass' | 'fail' | 'warning';
    timestamp: Date;
    results: ValidationResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        warnings: number;
    };
}
/**
 * UACL Integration Validator.
 *
 * @example
 */
export declare class UACLValidator {
    /**
     * Run complete UACL validation.
     */
    validateComplete(): Promise<ValidationReport>;
    /**
     * Validate core UACL functionality.
     */
    private validateCore;
    /**
     * Validate client factories.
     */
    private validateFactories;
    /**
     * Validate client creation.
     */
    private validateClientCreation;
    /**
     * Validate backward compatibility.
     */
    private validateCompatibility;
    /**
     * Validate system integrations.
     */
    private validateIntegrations;
    /**
     * Generate human-readable report.
     *
     * @param report
     */
    generateReport(report: ValidationReport): string;
}
/**
 * Quick validation function for easy testing.
 *
 * @example
 */
export declare function validateUACL(): Promise<ValidationReport>;
/**
 * Print validation report to console.
 *
 * @example
 */
export declare function printValidationReport(): Promise<void>;
export default UACLValidator;
//# sourceMappingURL=validation.d.ts.map