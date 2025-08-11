/**
 * @file Log-Based AI Deception Detector.
 *
 * Analyzes logtape logs to detect deception patterns during development.
 * Cross-references AI claims with actual logged tool usage.
 */
export interface LogAnalysisResult {
    toolCallsFound: string[];
    fileOperations: string[];
    bashCommands: string[];
    aiClaims: string[];
    deceptionPatterns: DeceptionMatch[];
}
interface DeceptionMatch {
    type: 'VERIFICATION_FRAUD' | 'SANDBAGGING' | 'WORK_AVOIDANCE';
    claim: string;
    evidence: string[];
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
/**
 * Log-based deception detector that reads actual logtape logs.
 *
 * @example
 */
export declare class LogBasedDeceptionDetector {
    private logger;
    private logDir;
    /**
     * Analyze recent logs for deception patterns.
     *
     * @param aiResponseText
     */
    analyzeRecentActivity(aiResponseText: string): Promise<LogAnalysisResult>;
    /**
     * Read log file safely.
     *
     * @param filename
     */
    private readLogFile;
    /**
     * Extract AI claims from response text.
     *
     * @param text
     */
    private extractAIClaims;
    /**
     * Extract actual tool calls from logs.
     *
     * @param logContent
     */
    private extractToolCalls;
    /**
     * Extract file operations from logs.
     *
     * @param logContent
     */
    private extractFileOperations;
    /**
     * Extract bash commands from logs.
     *
     * @param logContent
     */
    private extractBashCommands;
    /**
     * Detect deception patterns by comparing claims to actual log evidence.
     *
     * @param result
     */
    private detectDeceptionPatterns;
    /**
     * Generate deception report.
     *
     * @param analysis
     */
    generateReport(analysis: LogAnalysisResult): string;
}
/**
 * Quick analysis function for testing.
 *
 * @param aiResponse
 * @example
 */
export declare function analyzeAIResponseWithLogs(aiResponse: string): Promise<LogAnalysisResult>;
export {};
//# sourceMappingURL=log-based-deception-detector.d.ts.map