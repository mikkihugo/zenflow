#!/usr/bin/env npx tsx
/**
 * @fileoverview Intelligent Document Import with Swarm Analysis
 *
 * LLM-powered workflow that:
 * 1. Scans repository documents and code files
 * 2. Analyzes TSDoc/JSDoc completeness
 * 3. Uses swarm "ultrathink" for deep analysis
 * 4. Suggests improvements via approval workflow
 * 5. Stores directly in database (not file system)
 *
 * @example
 * ```typescript
 * const workflow = new IntelligentDocImport({
 *   swarmConfig: { maxAgents: 5, topology: 'mesh' },
 *   databaseConfig: { type: 'postgresql' }
 * });
 *
 * const result = await workflow.importAndAnalyze('/path/to/repo');
 * // Returns: { suggestions: [...], approvalRequired: true }
 * ```
 */
import { EventEmitter } from 'eventemitter3';
interface WorkflowGateRequest {
    id: string;
    type: 'approval' | 'decision' | 'input' | 'confirmation';
    gateType: 'approval' | 'decision' | 'input' | 'confirmation';
    workflowContext: {
        workflowId: string;
        stepName: string;
    };
    question: string;
    context: any;
    data: any;
    requester: string;
    timestamp: Date;
}
/**
 * Configuration for intelligent document import workflow.
 */
export interface IntelligentDocImportConfig {
    /** Target repository path */
    repositoryPath: string;
    /** Swarm configuration for analysis */
    swarmConfig: {
        maxAgents: number;
        topology: 'mesh' | 'hierarchical' | 'star';
        enableUltraThink: boolean;
    };
    /** Database configuration */
    databaseConfig: {
        type: 'postgresql' | 'sqlite' | 'mysql';
        connectionString?: string;
    };
    /** Analysis configuration */
    analysisConfig: {
        /** Scan code files for TSDoc/JSDoc completeness */
        checkDocumentation: boolean;
        /** Analyze document quality and completeness */
        analyzeDocuments: boolean;
        /** Use LLM for deep content analysis */
        enableLLMAnalysis: boolean;
        /** Confidence threshold for automatic approval */
        autoApprovalThreshold: number;
    };
}
/**
 * Analysis result for a single file.
 */
export interface FileAnalysisResult {
    filePath: string;
    fileType: 'document' | 'code' | 'config' | 'other';
    /** Document classification (if document) */
    documentType?: 'vision' | 'adr' | 'prd' | 'epic' | 'feature' | 'task' | 'spec';
    /** Documentation completeness (if code) */
    documentationScore?: {
        overall: number;
        functions: number;
        classes: number;
        interfaces: number;
        missing: string[];
    };
    /** LLM analysis results */
    llmAnalysis?: {
        qualityScore: number;
        completenessScore: number;
        suggestions: string[];
        riskFactors: string[];
        confidence: number;
    };
    /** Recommended actions */
    recommendations: {
        action: 'import' | 'improve' | 'reject' | 'manual_review';
        reasoning: string;
        improvements?: string[];
        confidence: number;
    };
}
/**
 * Import workflow results with approval gates.
 */
export interface ImportWorkflowResult {
    /** Total files analyzed */
    totalFiles: number;
    /** Analysis results by file */
    analyses: FileAnalysisResult[];
    /** Files ready for automatic import */
    readyForImport: FileAnalysisResult[];
    /** Files requiring manual approval */
    requiresApproval: FileAnalysisResult[];
    /** Files needing improvements */
    needsImprovement: FileAnalysisResult[];
    /** Overall recommendations */
    overallRecommendations: {
        summary: string;
        keyFindings: string[];
        suggestedActions: string[];
        estimatedEffort: 'low' | 'medium' | 'high';
    };
    /** Approval gates created */
    approvalGates: WorkflowGateRequest[];
}
/**
 * Intelligent Document Import Workflow
 *
 * Orchestrates LLM-powered analysis of repository documentation
 * and code with human-in-the-loop approval workflows.
 */
/**
 * Intelligent Document Import Workflow
 *
 * Orchestrates LLM-powered analysis of repository documentation
 * and code with human-in-the-loop approval workflows.
 *
 * @example
 * ```typescript
 * const workflow = new IntelligentDocImport({
 *   repositoryPath: '/path/to/repo',
 *   swarmConfig: { maxAgents: 5, topology: 'mesh' },
 *   databaseConfig: { type: 'postgresql' },
 *   analysisConfig: { checkDocumentation: true }
 * });
 *
 * const result = await workflow.importAndAnalyze();
 * ```
 */
export declare class IntelligentDocImport extends EventEmitter {
    private config;
    private documentManager;
    private workflowGates;
    /**
     * Create a new intelligent document import workflow.
     *
     * @param config - Configuration for the import workflow
     */
    constructor(config: IntelligentDocImportConfig);
    /**
     * Main workflow: Import and analyze repository with swarm intelligence.
     */
    /**
     * Main workflow: Import and analyze repository with swarm intelligence.
     *
     * Executes a comprehensive 5-phase workflow:
     * 1. Discovery - Scan repository for relevant files
     * 2. Analysis - Apply swarm intelligence to analyze files
     * 3. Classification - Group files by recommendation type
     * 4. Approval Gates - Create human review workflows
     * 5. Recommendations - Generate overall insights
     *
     * @returns Promise resolving to complete workflow results
     * @throws Error if workflow fails at any phase
     *
     * @example
     * ```typescript
     * const result = await workflow.importAndAnalyze();
     * console.log(`Found ${result.totalFiles} files`);
     * console.log(`Ready for import: ${result.readyForImport.length}`);
     * ```
     */
    importAndAnalyze(): Promise<ImportWorkflowResult>;
    /**
     * Phase 1: Discover all relevant files in repository.
     */
    /**
     * Phase 1: Discover all relevant files in repository.
     *
     * Recursively scans the repository directory to find files that are
     * relevant for documentation analysis (documents, code files, configs).
     * Skips common ignore patterns like node_modules, dist, build directories.
     *
     * @returns Promise resolving to array of file paths for analysis
     * @private
     */
    private discoverFiles;
    /**
     * Check if file is relevant for documentation analysis.
     */
    /**
     * Check if file is relevant for documentation analysis.
     *
     * Determines if a file should be included in the analysis based on:
     * - File extension (documents, code files)
     * - Filename patterns (README, CHANGELOG, etc.)
     * - Content type expectations
     *
     * @param filename - Name of the file to check
     * @returns True if file should be analyzed, false otherwise
     * @private
     */
    private isRelevantFile;
    /**
     * Phase 2: Perform swarm-based analysis with LLM intelligence.
     */
    /**
     * Phase 2: Perform swarm-based analysis with LLM intelligence.
     *
     * Processes files in batches using multiple analysis agents.
     * Each file gets comprehensive analysis including:
     * - Content classification and quality assessment
     * - Documentation completeness (for code files)
     * - LLM-powered insights and recommendations
     *
     * @param files - Array of file paths to analyze
     * @returns Promise resolving to analysis results for each file
     * @private
     */
    private performSwarmAnalysis;
    /**
     * Analyze a single file with comprehensive intelligence.
     */
    /**
     * Analyze a single file with comprehensive intelligence.
     *
     * Performs multi-layered analysis:
     * - File type detection (document/code/config)
     * - Document classification (vision/adr/prd/epic/feature/task/spec)
     * - Documentation completeness analysis (for code)
     * - LLM quality assessment
     * - Recommendation generation
     *
     * @param filePath - Absolute path to file for analysis
     * @returns Promise resolving to comprehensive analysis result
     * @private
     */
    private analyzeFile;
    /**
     * Determine file type from path and content.
     */
    /**
     * Determine file type from path and content.
     *
     * Analyzes file extension and path patterns to classify files into:
     * - document: Markdown, RST, text files
     * - code: Source code files (TS, JS, Python, Rust, etc.)
     * - config: Configuration files (JSON, YAML, TOML, etc.)
     * - other: Unclassified files
     *
     * @param filePath - Path to the file
     * @param content - File content for additional analysis
     * @returns File type classification
     * @private
     */
    private determineFileType;
    /**
     * Classify document type using content analysis.
     */
    /**
     * Classify document type using content analysis.
     *
     * Uses both filename patterns and content analysis to determine
     * the document type according to standard documentation taxonomy:
     * - vision: Project vision, README files
     * - adr: Architectural Decision Records
     * - prd: Product Requirements Documents
     * - epic: Epic-level requirements
     * - feature: Feature specifications
     * - task: Task lists, TODO files
     * - spec: Technical specifications
     *
     * @param filePath - Path to the document file
     * @param content - Document content for pattern matching
     * @returns Classified document type
     * @private
     */
    private classifyDocument;
    /**
     * Perform LLM-powered document analysis.
     */
    /**
     * Perform LLM-powered document analysis.
     *
     * Analyzes document quality using language model insights:
     * - Structure and formatting quality
     * - Content comprehensiveness
     * - Presence of examples and usage information
     * - Readability and clarity
     * - Risk factors and improvement suggestions
     *
     * @param content - Document content to analyze
     * @param documentType - Optional document type for context
     * @returns Promise resolving to LLM analysis results
     * @private
     */
    private performLLMDocumentAnalysis;
    /**
     * Analyze TSDoc/JSDoc completeness in code files.
     */
    /**
     * Analyze TSDoc/JSDoc completeness in code files.
     *
     * Examines source code to determine documentation coverage:
     * - Extracts functions, classes, and interfaces
     * - Checks for presence of JSDoc/TSDoc comments
     * - Calculates coverage percentages
     * - Identifies missing documentation items
     *
     * @param content - Source code content
     * @param fileExt - File extension for language-specific parsing
     * @returns Promise resolving to documentation completeness analysis
     * @private
     */
    private analyzeDocumentationCompleteness;
    /**
     * Extract functions from code content.
     */
    /**
     * Extract functions from code content.
     *
     * Parses source code to find function definitions and checks
     * for associated documentation comments. Supports multiple
     * function declaration patterns including regular functions,
     * arrow functions, and class methods.
     *
     * @param content - Source code content
     * @param fileExt - File extension for language-specific patterns
     * @returns Array of functions with documentation status
     * @private
     */
    private extractFunctions;
    /**
     * Extract classes from code content.
     */
    /**
     * Extract classes from code content.
     *
     * Identifies class declarations in source code and checks for
     * associated JSDoc/TSDoc comments. Handles export patterns
     * and various class declaration styles.
     *
     * @param content - Source code content
     * @param fileExt - File extension for language-specific patterns
     * @returns Array of classes with documentation status
     * @private
     */
    private extractClasses;
    /**
     * Extract interfaces from code content.
     */
    /**
     * Extract interfaces from code content.
     *
     * Finds TypeScript interface declarations and checks for
     * documentation comments. Essential for maintaining type
     * definition documentation in TypeScript projects.
     *
     * @param content - Source code content
     * @param fileExt - File extension (should be .ts for interfaces)
     * @returns Array of interfaces with documentation status
     * @private
     */
    private extractInterfaces;
    /**
     * Generate recommendations based on analysis.
     */
    /**
     * Generate recommendations based on analysis.
     *
     * Synthesizes analysis results to provide actionable recommendations:
     * - Determines appropriate action (import/improve/reject/manual_review)
     * - Calculates confidence scores based on quality metrics
     * - Generates specific improvement suggestions
     * - Applies auto-approval thresholds
     *
     * @param analysis - File analysis results
     * @returns Promise resolving to recommendation object
     * @private
     */
    private generateRecommendations;
    /**
     * Phase 3: Classify analysis results and group by recommendation.
     */
    /**
     * Phase 3: Classify analysis results and group by recommendation.
     *
     * Organizes analyzed files into three categories based on their
     * recommendation status:
     * - readyForImport: High-confidence files for automatic import
     * - needsImprovement: Files that would benefit from enhancements
     * - requiresApproval: Files needing manual human review
     *
     * @param analyses - Array of file analysis results
     * @returns Promise resolving to classified file groups
     * @private
     */
    private classifyAndRecommend;
    /**
     * Phase 4: Create approval workflow gates for manual review items.
     */
    /**
     * Phase 4: Create approval workflow gates for manual review items.
     *
     * Generates human-in-the-loop workflow gates for files that require
     * manual approval or improvement review. Each gate includes:
     * - Contextual analysis information
     * - Specific validation questions
     * - Recommended actions and alternatives
     * - Escalation policies for timeout handling
     *
     * @param classified - Classified file groups from previous phase
     * @returns Promise resolving to array of created workflow gates
     * @private
     */
    private createApprovalGates;
    /**
     * Phase 5: Generate overall recommendations and insights.
     */
    /**
     * Phase 5: Generate overall recommendations and insights.
     *
     * Synthesizes individual file analyses into repository-wide insights:
     * - Summary statistics and percentages
     * - Key findings and patterns
     * - Actionable recommendations for improvement
     * - Effort estimation for completion
     *
     * @param classified - Classified file groups
     * @returns Promise resolving to overall recommendations object
     * @private
     */
    private generateOverallRecommendations;
    /**
     * Store approved files in database.
     */
    /**
     * Store approved files in database.
     *
     * Executes the final import step for files that have been approved
     * through the workflow process. Files are stored in the database
     * with full metadata including analysis results, confidence scores,
     * and traceability information.
     *
     * @param approvedFiles - Array of files approved for import
     * @returns Promise that resolves when all files are stored
     *
     * @example
     * ```typescript
     * const approvedFiles = result.readyForImport;
     * await workflow.executeApprovedImports(approvedFiles);
     * console.log(`Imported ${approvedFiles.length} files`);
     * ```
     */
    executeApprovedImports(approvedFiles: FileAnalysisResult[]): Promise<void>;
    /**
     * Get approval workflow status.
     */
    /**
     * Get approval workflow status.
     *
     * Provides current status of all approval gates created during
     * the workflow process. Useful for monitoring progress and
     * identifying pending manual reviews.
     *
     * @returns Array of approval gate status objects
     *
     * @example
     * ```typescript
     * const status = workflow.getApprovalStatus();
     * const pending = status.filter(s => s.status === 'pending');
     * console.log(`${pending.length} gates awaiting approval`);
     * ```
     */
    getApprovalStatus(): Array<{
        gateId: string;
        status: string;
        filePath: string;
    }>;
}
export {};
//# sourceMappingURL=intelligent-doc-import.d.ts.map