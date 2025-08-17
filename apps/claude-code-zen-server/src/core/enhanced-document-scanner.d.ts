/**
 * Enhanced Document Scanner - Code Analysis & Swarm Task Generation
 *
 * Scans .md documents and source code to extract:
 * - TODO items and FIXME comments
 * - Missing implementations (empty functions, incomplete features)
 * - Code quality issues and technical debt
 * - Documentation gaps and improvement opportunities
 *
 * Integrates with THE COLLECTIVE document entity system and provides
 * GUI approval workflow for generated swarm tasks.
 *
 * @file Enhanced document scanner for code analysis and task generation.
 */
import { EventEmitter } from 'node:events';
/**
 * Types of analysis patterns we can detect in code and documents
 */
export type AnalysisPattern = 'todo' | 'fixme' | 'hack' | 'deprecated' | 'missing_implementation' | 'empty_function' | 'code_quality' | 'documentation_gap' | 'test_missing' | 'performance_issue' | 'security_concern' | 'refactor_needed';
/**
 * Detected code issue or improvement opportunity
 */
export interface CodeAnalysisResult {
    id: string;
    type: AnalysisPattern;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    filePath: string;
    lineNumber?: number;
    codeSnippet?: string;
    suggestedAction: string;
    estimatedEffort: 'small' | 'medium' | 'large';
    tags: string[];
    relatedFiles?: string[];
}
/**
 * Generated swarm task from code analysis
 */
export interface GeneratedSwarmTask {
    id: string;
    title: string;
    description: string;
    type: 'task' | 'feature' | 'epic';
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: number;
    sourceAnalysis: CodeAnalysisResult;
    suggestedSwarmType: 'single_agent' | 'collaborative' | 'research' | 'implementation';
    requiredAgentTypes: string[];
    dependencies: string[];
    acceptanceCriteria: string[];
}
/**
 * Scanner configuration options
 */
export interface ScannerConfig {
    /** Root directory to scan */
    rootPath: string;
    /** File patterns to include */
    includePatterns: string[];
    /** File patterns to exclude */
    excludePatterns: string[];
    /** Analysis patterns to detect */
    enabledPatterns: AnalysisPattern[];
    /** Maximum depth for directory traversal */
    maxDepth: number;
    /** Enable deep code analysis */
    deepAnalysis: boolean;
}
/**
 * Scan results summary
 */
export interface ScanResults {
    analysisResults: CodeAnalysisResult[];
    generatedTasks: GeneratedSwarmTask[];
    scannedFiles: number;
    totalIssues: number;
    severityCounts: Record<string, number>;
    patternCounts: Record<AnalysisPattern, number>;
    scanDuration: number;
}
/**
 * Enhanced document and code scanner with AI-powered analysis
 */
export declare class EnhancedDocumentScanner extends EventEmitter {
    private config;
    private analysisPatterns;
    private isScanning;
    constructor(config?: Partial<ScannerConfig>);
    /**
     * Initialize regex patterns for different analysis types
     */
    private initializeAnalysisPatterns;
    /**
     * Scan the configured directory for issues and generate tasks
     */
    scanAndGenerateTasks(): Promise<ScanResults>;
    /**
     * Recursively scan directory for files to analyze
     */
    private scanDirectory;
    /**
     * Analyze a single file for issues
     */
    private analyzeFile;
    /**
     * Perform deep code analysis using AST parsing
     */
    private performDeepAnalysis;
    /**
     * Analyze markdown documents for documentation issues
     */
    private analyzeMarkdownDocument;
    /**
     * Generate swarm tasks from analysis results
     */
    private generateSwarmTasks;
    /**
     * Group analysis results by type and file proximity
     */
    private groupAnalysisResults;
    /**
     * Create a swarm task from grouped analysis results
     */
    private createSwarmTask;
    /**
     * Generate detailed task description from analysis results
     */
    private generateTaskDescription;
    /**
     * Generate acceptance criteria for the task
     */
    private generateAcceptanceCriteria;
    /**
     * Utility methods
     */
    private shouldIncludeFile;
    private shouldExcludePath;
    private matchesPattern;
    private getLineNumber;
    private createAnalysisResult;
    private getPatternSeverity;
    private getPatternEffort;
    private getPatternTags;
    private getSuggestedAction;
    private extractFunctionBody;
    private getMaxSeverity;
    private severityToPriority;
    private estimateEffort;
    private calculateSeverityCounts;
    private calculatePatternCounts;
    private generateId;
}
//# sourceMappingURL=enhanced-document-scanner.d.ts.map