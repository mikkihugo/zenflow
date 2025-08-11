/**
 * Safety Validation System.
 * Validates potentially dangerous commands and operations, providing safer alternatives.
 */
/**
 * @file Coordination system: safety-validator.
 */
import type { SafetyValidator } from './hook-system-core.ts';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface SecurityRisk {
    type: string;
    severity: RiskLevel;
    description: string;
    mitigation?: string;
    pattern?: string;
    command?: string;
}
export interface ValidationResult {
    allowed: boolean;
    riskLevel: RiskLevel;
    risks: SecurityRisk[];
    reason: string;
    requiresConfirmation?: boolean;
    alternatives?: string[];
    mitigations?: string[];
}
export interface FileOperation {
    type: 'read' | 'write' | 'delete' | string;
    path: string;
    content?: string;
    permissions?: string;
}
export interface Operation {
    command?: string;
    filePath?: string;
    type?: string;
    parameters?: Record<string, any>;
}
export declare class BashSafetyValidator implements SafetyValidator {
    private readonly DANGEROUS_PATTERNS;
    private readonly HIGH_RISK_COMMANDS;
    private readonly SUSPICIOUS_PATHS;
    validateCommand(command: string): Promise<ValidationResult>;
    validateFileOperation(operation: FileOperation): Promise<ValidationResult>;
    suggestSaferAlternative(command: string): Promise<string[]>;
    assessRiskLevel(operation: Operation): Promise<RiskLevel>;
    private identifyCommandRisks;
    private identifyFileRisks;
    private assessOverallRisk;
    private generateMitigations;
}
export declare class FileOperationValidator {
    private readonly RESTRICTED_EXTENSIONS;
    private readonly SENSITIVE_FILENAMES;
    validateFileAccess(path: string, operation: 'read' | 'write' | 'execute'): Promise<ValidationResult>;
    private assessRiskLevel;
}
export declare class SecurityRiskAssessment {
    static calculateRiskScore(risks: SecurityRisk[]): number;
    static categorizeRisks(risks: SecurityRisk[]): {
        critical: SecurityRisk[];
        high: SecurityRisk[];
        medium: SecurityRisk[];
        low: SecurityRisk[];
    };
    static generateSecurityReport(risks: SecurityRisk[]): string;
}
//# sourceMappingURL=safety-validator.d.ts.map