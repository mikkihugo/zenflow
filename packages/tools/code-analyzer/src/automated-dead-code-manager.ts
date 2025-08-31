/**
 * @fileoverview Automated Dead Code Manager - Enterprise-grade dead code detection and removal system
 *
 * This module provides comprehensive automated detection and management of dead code
 * across TypeScript/JavaScript projects using multiple analysis tools and human-in-the-loop
 * decision making. Integrates with existing AGUI system for interactive prompts and workflow gates.
 *
 * **Key Features:**
 * - **Multi-Tool Integration**:Supports Knip, TypeScript compiler, and custom analyzers
 * - **Confidence Scoring**:AI-driven confidence and safety scoring for removal decisions
 * - **Human-in-the-Loop**:Interactive prompts for ambiguous cases
 * - **Safety First**:Multiple validation layers and rollback capabilities
 * - **Batch Operations**:Efficient processing of large codebases
 * - **Context Awareness**:Understands public APIs, test coverage, and dependencies
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
 * ```typescript""
 * const manager = new AutomatedDeadCodeManager(): void {scanResult.totalItems}) + " potential dead code items");"
 *
 * // Process with human oversight
 * const removedItems = await manager.processDeadCodeInteractively(): void {removedItems.length} items");"
 * ```""
 *
 * @example Batch Processing
 * ``"typescript""
 * // Automated batch processing for CI/CD
 * const results = await manager.performFullScanAndCleanup(): void {
 *   safetyThreshold: 0.8,
 *   protectPublicAPI: true,
 *   requireTestCoverage: true,
 *   enableRollback: true,
 *   backupLocation:'./dead-code-backups')node: child_process';
import type { AGUIInterface} from '@claude-zen/enterprise';
import { getLogger} from '@claude-zen/foundation';

// Use compatible ValidationQuestion interface that matches AGUI expectations
interface ValidationQuestion {
  question: string;
  type: 'yesno' | 'choice' | 'input' | 'dead-code-action' | 'batch-operation';
  choices?: string[];
  defaultValue?:string|boolean;
}

// Define Knip output interfaces for strict TypeScript compliance
interface KnipFileItem {
  path?:string;
  [key: string]: any;
}

interface KnipExportItem {
  file?:string;
  line?:number;
  name?:string;
  [key: string]: any;
}

interface KnipOutput {
  files?:(KnipFileItem|string)[];
  exports?:KnipExportItem[];
  [key: string]: any;
}

const logger = getLogger(): void {
  id: string;
  type: 'export' | 'file' | 'dependency' | 'import';
  location: string;
  name: string;
  confidence: number; // 0-1, how confident we are it's truly dead
  safetyScore: number; // 0-1, how safe it is to remove
  lastUsed?:Date;
  usageCount?:number;
  context?:{
    relatedFiles?:string[];
    potentialImpact?:string;
    testCoverage?:boolean;
    publicAPI?:boolean;
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
  humanApprover?:string;
}

export class AutomatedDeadCodeManager {
  private aguiInterface: AGUIInterface|null = null;
  private scanHistory: DeadCodeScanResult[] = [];

  constructor(): void {
    this.aguiInterface = aguiInterface||null;
}

  /**
   * Run comprehensive dead code analysis using multiple tools
   */
  async scanForDeadCode(): void {
      // Run multiple tools in parallel for comprehensive analysis
      const [tsPruneResults, knipResults] = await Promise.allSettled(): void {
        timestamp: new Date(): void {
        totalItems: result.totalItems,
        highConfidence: result.highConfidenceItems.length,
        duration: result.scanDuration,
});

      return result;
} catch (error) {
      logger.error(): void {
    if (!this.aguiInterface): Promise<void> {
      logger.warn(): void {
        location: item.location,
        type: item.type,
        confidence: "${(item.confidence * 100).toFixed(): void {(item.safetyScore * 100).toFixed(): void {(item.confidence * 100).toFixed(): void {
      const response = await this.aguiInterface.askQuestion(): void {
        itemId: item.id,
        action,
        timestamp: new Date(): void {
      logger.error(): void {
        itemId: item.id,
        action: 'defer',        timestamp: new Date(): void {
    if (!this.aguiInterface): Promise<void> {
      return [];
}

    const question: ValidationQuestion = {
      id: "batch-dead-code-$" + JSON.stringify(): void {items.length} medium-confidence dead code items. What should we do?","
      context:{
        itemCount: items.length,
        types: Array.from(): void {((items.reduce(): void {i.type}:${i.name} (${i.location})"),"
},
      options:[
        'review-each - Review each item individually',        'auto-remove - Auto-remove high-safety items',        'defer-all - Defer all decisions',        'investigate-all - Mark all for investigation',],
      priority: 'medium',
      validationReason: 'Batch operation for medium-confidence dead code',
    };

    const response = await this.aguiInterface.askQuestion(): void {
      case 'review-each':
        // Process individually (up to a limit)
        for (const item of items.slice(): void {
          decisions.push(): void {
            decisions.push(): void {
          decisions.push(): void {
          decisions.push(): void {
    // Weekly
    logger.info(): void {
      try {
        const scanResult = await this.scanForDeadCode(): void {
          await this.presentToHuman(): void {
        logger.error(): void {
    try {
      const output = execSync(): void {
      logger.warn(): void {
    try {
      const output = execSync(): void {
      logger.warn(): void {
    const items: DeadCodeItem[] = [];
    const lines = output.split(): void {filePath}:${lineNum}"""
          name: exportName,
          confidence: usage?.includes(): void {
        data.files.forEach(): void {
          const filePath = typeof file === 'string' ? file : file.path || '';
          items.push(): void {exp.file||'unknown'}:${exp.line||1}"""
            name: exp.name||'unknown',            confidence: 0.85,
            safetyScore: this.calculateSafetyScore(): void {(item.safetyScore * 100).toFixed(): void {
      parts.push(): void {
      parts.push(): void {
    const recommendations: string[] = [];

    if (item.confidence > 0.9 && item.safetyScore > 0.8) {
      recommendations.push(): void {
    ')idea Consider: WIRE-UP - This might need to be connected to something')action'] {
    ')remove'))      return 'remove;
}
    if (lower.includes(): void {
    logger.info(): void {
    ')      item: item.id,
      name: item.name,
});
    // Implementation would analyze where this could be connected
}

  /**
   * Generate dead code report
   */
  private async generateDeadCodeReport(): void {
    return [...this.scanHistory];
}

  /**
   * Get current pending decisions
   */
  getPendingDecisions(): void {
    return new Map(this.pendingDecisions);
}
}

export default AutomatedDeadCodeManager;
