/**
 * @fileoverview Security Scanning Service
 *
 * Service for performing security vulnerability scanning and assessments.
 * Handles static analysis, dynamic analysis, dependency scanning, and security tool integration.
 *
 * SINGLE RESPONSIBILITY: Security vulnerability scanning and assessment
 * FOCUSES ON: Vulnerability detection, security tool coordination, scan orchestration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
export interface SecurityAssessment {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly assessmentType: SecurityAssessmentType;
    readonly findings: SecurityFinding[];
    readonly overallRisk: 'low|medium|high|critical;;
}
export type SecurityAssessmentType = vulnerability_scan | penetration_test | code_review | compliance_audit | 'risk_assessment;;
export interface SecurityFinding {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly severity: SecuritySeverity;
    readonly category: string;
    readonly status: 'open|in_progress|resolved|false_positive;;
    readonly cwe?: string;
    readonly cvssScore?: CVSSScore;
    readonly location?: {
        readonly filePath: string;
        readonly lineNumber: number;
        readonly columnNumber: number;
        readonly snippet: string;
    };
    readonly impact?: {
        readonly confidentiality: string;
        readonly integrity: string;
        readonly availability: string;
        readonly businessImpact: string;
    };
    readonly remediation?: string;
    readonly references?: string[];
    readonly toolId?: string;
    readonly discoveredDate?: Date;
    readonly lastSeenDate?: Date;
    readonly falsePositive?: boolean;
}
export interface SecurityTool {
    readonly id: string;
    readonly name: string;
    readonly type: 'static|dynamic|interactive|manual;;
    readonly capabilities: string[];
}
export interface SecurityStandard {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly requirements: string[];
}
export type SecuritySeverity = low | medium | high | critical | 'informational;;
export interface CVSSScore {
    readonly version: '2.0|3.0|3.1;;
    readonly baseScore: number;
    readonly temporalScore?: number;
    readonly environmentalScore?: number;
    readonly vector: string;
}
/**
 * Security scanning configuration
 */
export interface SecurityScanConfig {
    readonly scanId: string;
    readonly scanType: static | dynamic | dependency | container | 'infrastructure;;
    readonly tools: SecurityTool[];
    readonly targets: ScanTarget[];
    readonly standards: SecurityStandard[];
    readonly schedule: ScanSchedule;
    readonly reporting: ScanReporting;
}
/**
 * Scan target configuration
 */
export interface ScanTarget {
    readonly type: 'code|container|infrastructure|api;;
    readonly path: string;
    readonly inclusions: string[];
    readonly exclusions: string[];
    readonly priority: 'critical|high|medium|low;;
}
/**
 * Scan scheduling configuration
 */
export interface ScanSchedule {
    readonly frequency: 'every-commit|daily|weekly|monthly;;
    readonly timeWindow: string;
    readonly maxDuration: number;
    readonly parallelScans: number;
}
/**
 * Scan reporting configuration
 */
export interface ScanReporting {
    readonly format: 'json|xml|sarif|html;;
    readonly destinations: string[];
    readonly includeRawResults: boolean;
    readonly aggregateResults: boolean;
}
/**
 * Security scan result
 */
export interface SecurityScanResult {
    readonly scanId: string;
    readonly timestamp: Date;
    readonly duration: number;
    readonly status: 'completed|failed|cancelled|timeout;;
    readonly findings: SecurityFinding[];
    readonly metrics: ScanMetrics;
    readonly toolResults: ToolScanResult[];
    readonly summary: ScanSummary;
}
/**
 * Individual tool scan result
 */
export interface ToolScanResult {
    readonly toolId: string;
    readonly toolName: string;
    readonly status: 'success|failure|timeout|error;;
    readonly duration: number;
    readonly findings: SecurityFinding[];
    readonly rawOutput: string;
    readonly errorMessage?: string;
}
/**
 * Scan metrics
 */
export interface ScanMetrics {
    readonly totalFindings: number;
    readonly findingsBySeverity: Record<SecuritySeverity, number>;
    readonly findingsByCategory: Record<string, number>;
    readonly coveragePercentage: number;
    readonly falsePositiveRate: number;
    readonly scanEfficiency: number;
}
/**
 * Scan summary
 */
export interface ScanSummary {
    readonly criticalIssues: number;
    readonly highIssues: number;
    readonly mediumIssues: number;
    readonly lowIssues: number;
    readonly informationalIssues: number;
    readonly newFindings: number;
    readonly resolvedFindings: number;
    readonly riskScore: number;
    readonly recommendations: string[];
}
/**
 * Security Scanning Service for vulnerability detection and assessment
 */
export declare class SecurityScanningService {
    private readonly logger;
    private scanConfigurations;
    private scanResults;
    constructor(logger: Logger);
    /**
     * Configure security scanning for a target
     */
    configureScan(config: SecurityScanConfig): void;
    /**
     * Execute security scan
     */
    executeScan(scanId: string): Promise<SecurityScanResult>;
    /**
     * Execute individual security tool
     */
    private executeTool;
}
//# sourceMappingURL=security-scanning-service.d.ts.map