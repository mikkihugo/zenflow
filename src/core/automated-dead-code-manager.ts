/**
 * @file Automated Dead Code Manager
 *
 * Provides automated detection of dead code with human-in-the-loop decision making.
 * Integrates with existing AGUI system for interactive prompts and workflow gates.
 */

import { execSync } from 'child_process';
import { getLogger } from '../config/logging-config';
import type { AGUIInterface } from '../interfaces/agui/agui-adapter';
import type { ValidationQuestion } from '../types/shared-types.js';

const logger = getLogger('automated-dead-code-manager');

export interface DeadCodeItem {
  id: string;
  type: 'export' | 'file' | 'dependency' | 'import';
  location: string;
  name: string;
  confidence: number; // 0-1, how confident we are it's truly dead
  safetyScore: number; // 0-1, how safe it is to remove
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

export class AutomatedDeadCodeManager {
  private aguiInterface: AGUIInterface | null = null;
  private scanHistory: DeadCodeScanResult[] = [];
  private pendingDecisions = new Map<string, DeadCodeItem>();

  constructor(aguiInterface?: AGUIInterface) {
    this.aguiInterface = aguiInterface || null;
  }

  /**
   * Run comprehensive dead code analysis using multiple tools
   */
  async scanForDeadCode(): Promise<DeadCodeScanResult> {
    const startTime = Date.now();
    logger.info('Starting automated dead code scan...');

    try {
      // Run multiple tools in parallel for comprehensive analysis
      const [tsPruneResults, knipResults] = await Promise.allSettled([
        this.runTsPrune(),
        this.runKnip(),
      ]);

      // Merge and categorize results
      const allItems = this.mergeResults([
        tsPruneResults.status === 'fulfilled' ? tsPruneResults.value : [],
        knipResults.status === 'fulfilled' ? knipResults.value : [],
      ]);

      // Categorize by confidence level
      const result: DeadCodeScanResult = {
        timestamp: new Date(),
        totalItems: allItems.length,
        highConfidenceItems: allItems.filter((item) => item.confidence > 0.8),
        mediumConfidenceItems: allItems.filter(
          (item) => item.confidence > 0.5 && item.confidence <= 0.8
        ),
        lowConfidenceItems: allItems.filter((item) => item.confidence <= 0.5),
        scanDuration: Date.now() - startTime,
        toolsUsed: ['ts-prune', 'knip'],
      };

      this.scanHistory.push(result);
      logger.info('Dead code scan completed', {
        totalItems: result.totalItems,
        highConfidence: result.highConfidenceItems.length,
        duration: result.scanDuration,
      });

      return result;
    } catch (error) {
      logger.error('Dead code scan failed', { error });
      throw error;
    }
  }

  /**
   * Present dead code findings to human for decision making
   */
  async presentToHuman(
    scanResult: DeadCodeScanResult
  ): Promise<DeadCodeDecision[]> {
    if (!this.aguiInterface) {
      logger.warn('No AGUI interface available for human interaction');
      return [];
    }

    const decisions: DeadCodeDecision[] = [];

    // Process high confidence items first
    logger.info('Presenting high-confidence dead code items to human...');

    for (const item of scanResult.highConfidenceItems.slice(0, 10)) {
      // Limit to prevent overwhelm
      const decision = await this.askHumanAboutDeadCode(item);
      decisions.push(decision);

      if (decision.action === 'remove') {
        await this.executeRemoval(item);
      } else if (decision.action === 'wire-up') {
        await this.suggestWireUp(item);
      }
    }

    // Ask about batch operations for medium confidence items
    if (scanResult.mediumConfidenceItems.length > 0) {
      const batchDecision = await this.askAboutBatchOperation(
        scanResult.mediumConfidenceItems
      );
      decisions.push(...batchDecision);
    }

    return decisions;
  }

  /**
   * Ask human about a specific dead code item
   */
  private async askHumanAboutDeadCode(
    item: DeadCodeItem
  ): Promise<DeadCodeDecision> {
    if (!this.aguiInterface) {
      throw new Error('AGUI interface required for human interaction');
    }

    const question: ValidationQuestion = {
      id: `dead-code-${item.id}`,
      type: 'dead-code-action',
      question: `🗑️ Dead Code Detected: ${item.name}`,
      context: {
        location: item.location,
        type: item.type,
        confidence: `${(item.confidence * 100).toFixed(1)}%`,
        safetyScore: `${(item.safetyScore * 100).toFixed(1)}%`,
        analysis: this.generateAnalysisText(item),
        recommendations: this.generateRecommendations(item),
      },
      options: [
        'remove - Delete this dead code',
        'keep - Keep it (might be used elsewhere)',
        'wire-up - Connect it to the system',
        'investigate - Need more analysis',
        'defer - Decide later',
      ],
      priority: item.confidence > 0.9 ? 'high' : 'medium',
      validationReason: `Dead code detected with ${(item.confidence * 100).toFixed(1)}% confidence`,
    };

    try {
      const response = await this.aguiInterface.askQuestion(question);
      const action = this.parseActionFromResponse(response);

      return {
        itemId: item.id,
        action,
        timestamp: new Date(),
        humanApprover: 'interactive-user',
      };
    } catch (error) {
      logger.error('Failed to get human decision for dead code', {
        item: item.id,
        error,
      });
      return {
        itemId: item.id,
        action: 'defer',
        timestamp: new Date(),
        reason: 'Failed to get human input',
      };
    }
  }

  /**
   * Ask about batch operations for multiple items
   */
  private async askAboutBatchOperation(
    items: DeadCodeItem[]
  ): Promise<DeadCodeDecision[]> {
    if (!this.aguiInterface) return [];

    const question: ValidationQuestion = {
      id: `batch-dead-code-${Date.now()}`,
      type: 'batch-operation',
      question: `🧹 Found ${items.length} medium-confidence dead code items. What should we do?`,
      context: {
        itemCount: items.length,
        types: [...new Set(items.map((i) => i.type))],
        avgConfidence: `${((items.reduce((sum, i) => sum + i.confidence, 0) / items.length) * 100).toFixed(1)}%`,
        preview: items
          .slice(0, 5)
          .map((i) => `${i.type}: ${i.name} (${i.location})`),
      },
      options: [
        'review-each - Review each item individually',
        'auto-remove - Auto-remove high-safety items',
        'defer-all - Defer all decisions',
        'investigate-all - Mark all for investigation',
      ],
      priority: 'medium',
      validationReason: 'Batch operation for medium-confidence dead code',
    };

    const response = await this.aguiInterface.askQuestion(question);
    const decisions: DeadCodeDecision[] = [];

    switch (response) {
      case 'review-each':
        // Process individually (up to a limit)
        for (const item of items.slice(0, 5)) {
          decisions.push(await this.askHumanAboutDeadCode(item));
        }
        break;

      case 'auto-remove':
        // Auto-remove items with high safety scores
        items
          .filter((i) => i.safetyScore > 0.8)
          .forEach((item) => {
            decisions.push({
              itemId: item.id,
              action: 'remove',
              timestamp: new Date(),
              reason: 'Auto-removal based on high safety score',
            });
          });
        break;

      case 'defer-all':
        items.forEach((item) => {
          decisions.push({
            itemId: item.id,
            action: 'defer',
            timestamp: new Date(),
            reason: 'Batch deferral',
          });
        });
        break;

      case 'investigate-all':
        items.forEach((item) => {
          decisions.push({
            itemId: item.id,
            action: 'investigate',
            timestamp: new Date(),
            reason: 'Batch investigation request',
          });
        });
        break;
    }

    return decisions;
  }

  /**
   * Schedule automated dead code scans
   */
  async scheduleAutomatedScans(
    intervalMs: number = 7 * 24 * 60 * 60 * 1000
  ): Promise<void> {
    // Weekly
    logger.info('Scheduling automated dead code scans', { intervalMs });

    const runScan = async () => {
      try {
        const scanResult = await this.scanForDeadCode();

        // Auto-present high-confidence items if AGUI is available
        if (this.aguiInterface && scanResult.highConfidenceItems.length > 0) {
          await this.presentToHuman(scanResult);
        }

        // Generate report
        await this.generateDeadCodeReport(scanResult);
      } catch (error) {
        logger.error('Scheduled dead code scan failed', { error });
      }
    };

    // Run initial scan
    await runScan();

    // Schedule recurring scans
    setInterval(runScan, intervalMs);
  }

  /**
   * Run ts-prune tool
   */
  private async runTsPrune(): Promise<DeadCodeItem[]> {
    try {
      const output = execSync(
        'npx ts-prune -p tsconfig.json -i __tests__ -i test',
        {
          encoding: 'utf8',
          timeout: 30000,
        }
      );

      return this.parseTsPruneOutput(output);
    } catch (error) {
      logger.warn('ts-prune execution failed', { error });
      return [];
    }
  }

  /**
   * Run knip tool (if available and working)
   */
  private async runKnip(): Promise<DeadCodeItem[]> {
    try {
      const output = execSync(
        'npx knip --exports --reporter json --no-progress --max-issues 50',
        {
          encoding: 'utf8',
          timeout: 45000,
        }
      );

      return this.parseKnipOutput(output);
    } catch (error) {
      logger.warn('knip execution failed', { error });
      return [];
    }
  }

  /**
   * Parse ts-prune output into dead code items
   */
  private parseTsPruneOutput(output: string): DeadCodeItem[] {
    const items: DeadCodeItem[] = [];
    const lines = output.split('\\n').filter((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(.+?):(\\d+) - (.+?)(?:\\s+\\((.+?)\\))?$/);

      if (match) {
        const [, filePath, lineNum, exportName, usage] = match;

        items.push({
          id: `ts-prune-${i}`,
          type: 'export',
          location: `${filePath}:${lineNum}`,
          name: exportName,
          confidence: usage && usage.includes('used') ? 0.3 : 0.8,
          safetyScore: this.calculateSafetyScore(filePath, exportName),
          context: {
            publicAPI:
              filePath.includes('index.ts') || filePath.includes('public-api'),
          },
        });
      }
    }

    return items;
  }

  /**
   * Parse knip JSON output
   */
  private parseKnipOutput(output: string): DeadCodeItem[] {
    try {
      const data = JSON.parse(output);
      const items: DeadCodeItem[] = [];

      // Parse knip's structured output
      if (data.files) {
        data.files.forEach((file: unknown, index: number) => {
          items.push({
            id: `knip-file-${index}`,
            type: 'file',
            location: file.path || file,
            name: file.path || file,
            confidence: 0.9,
            safetyScore: this.calculateSafetyScore(file.path || file, ''),
          });
        });
      }

      if (data.exports) {
        data.exports.forEach((exp: unknown, index: number) => {
          items.push({
            id: `knip-export-${index}`,
            type: 'export',
            location: `${exp.file}:${exp.line || 1}`,
            name: exp.name,
            confidence: 0.85,
            safetyScore: this.calculateSafetyScore(exp.file, exp.name),
          });
        });
      }

      return items;
    } catch {
      return [];
    }
  }

  /**
   * Calculate safety score for removing an item
   */
  private calculateSafetyScore(filePath: string, name: string): number {
    let score = 0.5; // Base score

    // Lower safety for public APIs
    if (filePath.includes('index.ts') || filePath.includes('public-api')) {
      score -= 0.3;
    }

    // Lower safety for types (might be used in .d.ts files)
    if (name.includes('Type') || name.includes('Interface')) {
      score -= 0.2;
    }

    // Higher safety for test files
    if (filePath.includes('test') || filePath.includes('__tests__')) {
      score += 0.3;
    }

    // Higher safety for clearly internal files
    if (filePath.includes('internal') || filePath.includes('utils')) {
      score += 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Merge results from multiple tools
   */
  private mergeResults(resultArrays: DeadCodeItem[][]): DeadCodeItem[] {
    const merged = new Map<string, DeadCodeItem>();

    for (const results of resultArrays) {
      for (const item of results) {
        const key = `${item.type}:${item.location}:${item.name}`;
        const existing = merged.get(key);

        if (existing) {
          // Merge confidence scores (take average)
          existing.confidence = (existing.confidence + item.confidence) / 2;
        } else {
          merged.set(key, item);
        }
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Generate analysis text for human review
   */
  private generateAnalysisText(item: DeadCodeItem): string {
    const parts: string[] = [];

    parts.push(`📍 Location: ${item.location}`);
    parts.push(`🔍 Type: ${item.type}`);
    parts.push(
      `📊 Confidence: ${(item.confidence * 100).toFixed(1)}% that it's unused`
    );
    parts.push(
      `🛡️ Safety Score: ${(item.safetyScore * 100).toFixed(1)}% safe to remove`
    );

    if (item.context?.publicAPI) {
      parts.push(`⚠️ Warning: This appears to be part of a public API`);
    }

    if (item.context?.testCoverage) {
      parts.push(`✅ Has test coverage`);
    }

    return parts.join('\\n');
  }

  /**
   * Generate recommendations for an item
   */
  private generateRecommendations(item: DeadCodeItem): string[] {
    const recommendations: string[] = [];

    if (item.confidence > 0.9 && item.safetyScore > 0.8) {
      recommendations.push(
        '✅ Recommended: REMOVE - High confidence, low risk'
      );
    } else if (item.confidence > 0.7 && item.safetyScore > 0.6) {
      recommendations.push(
        '⚠️ Recommended: INVESTIGATE - Medium confidence and safety'
      );
    } else {
      recommendations.push(
        '🤔 Recommended: KEEP - Lower confidence or higher risk'
      );
    }

    if (item.context?.publicAPI) {
      recommendations.push(
        '⚠️ Consider: This might be used by external consumers'
      );
    }

    if (item.type === 'export' && item.safetyScore < 0.4) {
      recommendations.push(
        '💡 Consider: WIRE-UP - This might need to be connected to something'
      );
    }

    return recommendations;
  }

  /**
   * Parse action from human response
   */
  private parseActionFromResponse(
    response: string
  ): DeadCodeDecision['action'] {
    const lower = response.toLowerCase();

    if (lower.includes('remove')) return 'remove';
    if (lower.includes('wire') || lower.includes('connect')) return 'wire-up';
    if (lower.includes('keep')) return 'keep';
    if (lower.includes('investigate') || lower.includes('analyze'))
      return 'investigate';

    return 'defer';
  }

  /**
   * Execute removal of dead code
   */
  private async executeRemoval(item: DeadCodeItem): Promise<void> {
    logger.info('Executing dead code removal', {
      item: item.id,
      name: item.name,
    });
    // Implementation would depend on the type of dead code
    // For now, just log the action
  }

  /**
   * Suggest how to wire up unused code
   */
  private async suggestWireUp(item: DeadCodeItem): Promise<void> {
    logger.info('Suggesting wire-up for code', {
      item: item.id,
      name: item.name,
    });
    // Implementation would analyze where this could be connected
  }

  /**
   * Generate dead code report
   */
  private async generateDeadCodeReport(
    scanResult: DeadCodeScanResult
  ): Promise<void> {
    const report = {
      timestamp: scanResult.timestamp,
      summary: {
        total: scanResult.totalItems,
        highConfidence: scanResult.highConfidenceItems.length,
        mediumConfidence: scanResult.mediumConfidenceItems.length,
        lowConfidence: scanResult.lowConfidenceItems.length,
      },
      recommendations: {
        safeToRemove: scanResult.highConfidenceItems.filter(
          (i) => i.safetyScore > 0.8
        ).length,
        needsInvestigation: scanResult.mediumConfidenceItems.length,
        shouldKeep: scanResult.lowConfidenceItems.length,
      },
    };

    logger.info('Dead code scan report', report);
  }

  /**
   * Get scan history
   */
  getScanHistory(): DeadCodeScanResult[] {
    return [...this.scanHistory];
  }

  /**
   * Get current pending decisions
   */
  getPendingDecisions(): Map<string, DeadCodeItem> {
    return new Map(this.pendingDecisions);
  }
}

export default AutomatedDeadCodeManager;
