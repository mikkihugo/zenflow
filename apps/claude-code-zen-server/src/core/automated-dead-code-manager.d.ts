/**
 * @fileoverview Automated Dead Code Manager - Enterprise-grade dead code detection and removal system
 *
 * This module provides comprehensive automated detection and management of dead code
 * across TypeScript/JavaScript projects using multiple analysis tools and human-in-the-loop
 * decision making. Integrates with existing AGUI system for interactive prompts and workflow gates.
 *
 * **Key Features:**
 * - **Multi-Tool Integration**: Supports Knip, TypeScript compiler, and custom analyzers
 * - **Confidence Scoring**: AI-driven confidence and safety scoring for removal decisions
 * - **Human-in-the-Loop**: Interactive prompts for ambiguous cases
 * - **Safety First**: Multiple validation layers and rollback capabilities
 * - **Batch Operations**: Efficient processing of large codebases
 * - **Context Awareness**: Understands public APIs, test coverage, and dependencies
 *
 * **Analysis Tools:**
 * - Knip: Modern JavaScript/TypeScript dead code analyzer
 * - TypeScript Compiler: Unused export detection
 * - Custom heuristics: Pattern-based detection
 *
 * **Safety Features:**
 * - Public API detection and protection
 * - Test coverage analysis before removal
 * - Dependency impact assessment
 * - Automated backup creation
 * - Rollback capabilities
 *
 * @example Basic Dead Code Scan
 * ```typescript
 * const manager = new AutomatedDeadCodeManager(aguiInterface);
 * await manager.initialize();
 *
 * // Perform comprehensive scan
 * const scanResult = await manager.scanForDeadCode();
 * console.log(`Found ${scanResult.totalItems} potential dead code items`);
 *
 * // Process with human oversight
 * const removedItems = await manager.processDeadCodeInteractively();
 * console.log(`Safely removed ${removedItems.length} items`);
 * ```
 *
 * @example Batch Processing
 * ```typescript
 * // Automated batch processing for CI/CD
 * const results = await manager.performFullScanAndCleanup({
 *   autoRemoveThreshold: 0.95,
 *   maxItemsPerBatch: 50,
 *   requireHumanApproval: true
 * });
 *
 * // Generate cleanup report
 * const report = await manager.generateCleanupReport();
 * ```
 *
 * @example Safety Configuration
 * ```typescript
 * const manager = new AutomatedDeadCodeManager(agui, {
 *   safetyThreshold: 0.8,
 *   protectPublicAPI: true,
 *   requireTestCoverage: true,
 *   enableRollback: true,
 *   backupLocation: './dead-code-backups'
 * });
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 2.1.0
 *
 * @see {@link DeadCodeItem} Individual dead code item interface
 * @see {@link DeadCodeScanResult} Scan results structure
 * @see {@link AGUIInterface} AGUI integration for human interaction
 */
import type { AGUIInterface } from '../interfaces/agui/agui-adapter';
export interface DeadCodeItem {
    id: string;
    type: 'export' | 'file' | 'dependency' | 'import';
    location: string;
    name: string;
    confidence: number;
    safetyScore: number;
    lastUsed?: Date;
    usageCount?: number;
    context?: {
        relatedFiles?: string[];
        potentialImpact?: string;
        testCoverage?: boolean;
        publicAPI?: boolean;
    };
}
export interface DeadCodeScanResult {
    timestamp: Date;
    totalItems: number;
    highConfidenceItems: DeadCodeItem[];
    mediumConfidenceItems: DeadCodeItem[];
    lowConfidenceItems: DeadCodeItem[];
    scanDuration: number;
    toolsUsed: string[];
}
export interface DeadCodeDecision {
    itemId: string;
    action: 'remove' | 'keep' | 'investigate' | 'defer' | 'wire-up';
    reason?: string;
    timestamp: Date;
    humanApprover?: string;
}
export declare class AutomatedDeadCodeManager {
    private aguiInterface;
    private scanHistory;
    private pendingDecisions;
    constructor(aguiInterface?: AGUIInterface);
    /**
     * Run comprehensive dead code analysis using multiple tools
     */
    scanForDeadCode(): Promise<DeadCodeScanResult>;
    /**
     * Present dead code findings to human for decision making
     */
    presentToHuman(scanResult: DeadCodeScanResult): Promise<DeadCodeDecision[]>;
    /**
     * Ask human about a specific dead code item
     */
    private askHumanAboutDeadCode;
    /**
     * Ask about batch operations for multiple items
     */
    private askAboutBatchOperation;
    /**
     * Schedule automated dead code scans
     */
    scheduleAutomatedScans(intervalMs?: number): Promise<void>;
    /**
     * Run ts-prune tool
     */
    private runTsPrune;
    /**
     * Run knip tool (if available and working)
     */
    private runKnip;
    /**
     * Parse ts-prune output into dead code items
     */
    private parseTsPruneOutput;
    /**
     * Parse knip JSON output
     */
    private parseKnipOutput;
    /**
     * Calculate safety score for removing an item
     */
    private calculateSafetyScore;
    /**
     * Merge results from multiple tools
     */
    private mergeResults;
    /**
     * Generate analysis text for human review
     */
    private generateAnalysisText;
    /**
     * Generate recommendations for an item
     */
    private generateRecommendations;
    /**
     * Parse action from human response
     */
    private parseActionFromResponse;
    /**
     * Execute removal of dead code
     */
    private executeRemoval;
    /**
     * Suggest how to wire up unused code
     */
    private suggestWireUp;
    /**
     * Generate dead code report
     */
    private generateDeadCodeReport;
    /**
     * Get scan history
     */
    getScanHistory(): DeadCodeScanResult[];
    /**
     * Get current pending decisions
     */
    getPendingDecisions(): Map<string, DeadCodeItem>;
}
export default AutomatedDeadCodeManager;
//# sourceMappingURL=automated-dead-code-manager.d.ts.map