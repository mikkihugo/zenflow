/**
 * @fileoverview Architecture Runway Service - SAFe Architecture Runway Items
 *
 * Extends BaseDocumentService to provide Architecture Runway functionality including:
 * - Automatic numbering (AR-001, AR-002, etc0.)
 * - Architecture decision lifecycle management (proposed → accepted → implemented)
 * - Superseding relationships between runway items
 * - SAFe-compatible architecture decision formatting
 *
 * Follows Google TypeScript conventions and facade pattern0.
 * Compatible across Kanban → Agile → SAFe modes0.
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 10.0.0
 */

import type { DocumentType } from '@claude-zen/enterprise';

import {
  BaseDocumentService,
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from '0./base-document-service';
import { documentSchemaManager } from '0./document-schemas';
import { DocumentManager } from '0./document-service';

// ============================================================================
// ARCHITECTURE RUNWAY INTERFACES
// ============================================================================

export interface ArchitectureRunwayCreateOptions {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives?: Array<{
    name: string;
    pros: string[];
    cons: string[];
    rejectedReason: string;
  }>;
  author?: string;
  projectId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  stakeholders?: string[];
  implementationNotes?: string;
  successCriteria?: string[];
  metadata?: Record<string, unknown>;
}

export interface ArchitectureRunwayQueryOptions extends QueryFilters {
  decisionStatus?: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  adrNumber?: number;
  adrId?: string;
}

export interface ArchitectureRunwayStats {
  totalAdrs: number;
  byDecisionStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byAuthor: Record<string, number>;
  recentDecisions: number; // Last 30 days
  implementationRate: number; // Percentage of accepted ADRs that are implemented
  averageDecisionTime?: number; // Days from proposed to accepted
}

export type DecisionStatus =
  | 'proposed'
  | 'accepted'
  | 'deprecated'
  | 'superseded';

// ============================================================================
// ARCHITECTURE RUNWAY SERVICE
// ============================================================================

/**
 * Architecture Runway Service - SAFe Architecture Runway Items
 *
 * Provides architecture runway operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management0.
 * Compatible across Kanban → Agile → SAFe modes0.
 */
export class ArchitectureRunwayService extends BaseDocumentService<any> {
  private currentMode: 'kanban' | 'agile' | 'safe' = 'kanban';

  constructor(
    documentManager?: DocumentManager,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban'
  ) {
    super('architecture-runway', documentManager);
    this0.currentMode = mode;
  }

  /**
   * Set the current project mode (determines schema version)
   */
  setProjectMode(mode: 'kanban' | 'agile' | 'safe'): void {
    this0.currentMode = mode;
    this0.logger0.info(`Architecture Runway service set to ${mode} mode`);
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  protected getDocumentType(): DocumentType {
    return 'architecture_runway';
  }

  protected validateDocument(data: Partial<any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data0.title?0.trim) {
      errors0.push('Title is required');
    }

    if (!data0.context?0.trim) {
      errors0.push('Context is required');
    }

    if (!data0.decision?0.trim) {
      errors0.push('Decision is required');
    }

    if (!data0.consequences || data0.consequences0.length === 0) {
      errors0.push('At least one consequence is required');
    }

    // Validation warnings
    if (data0.title && data0.title0.length < 10) {
      warnings0.push(
        'Title should be more descriptive (at least 10 characters)'
      );
    }

    if (data0.context && data0.context0.length < 50) {
      warnings0.push(
        'Context should provide sufficient background (at least 50 characters)'
      );
    }

    if (data0.decision && data0.decision0.length < 30) {
      warnings0.push('Decision should be detailed (at least 30 characters)');
    }

    return {
      isValid: errors0.length === 0,
      errors,
      warnings,
    };
  }

  protected formatDocumentContent(data: Partial<any>): string {
    const runwayId = data0.runway_id || this0.extractRunwayId(data0.title || '');

    let content = `# ${data0.title}\n\n`;

    // Status section
    const status = data0.decision_status || 'proposed';
    content += `## Status\n**${status?0.toUpperCase}**\n\n`;

    // Runway ID
    if (runwayId) {
      content += `**Runway ID**: ${runwayId}\n\n`;
    }

    // Context section
    content += `## Context\n${data0.context || ''}\n\n`;

    // Decision section
    content += `## Decision\n${data0.decision || ''}\n\n`;

    // Consequences section
    content += `## Consequences\n`;
    if (data0.consequences && data0.consequences0.length > 0) {
      data0.consequences0.forEach((consequence) => {
        content += `- ${consequence}\n`;
      });
    }
    content += '\n';

    // Alternatives section (if any)
    if (
      data0.alternatives_considered &&
      data0.alternatives_considered0.length > 0
    ) {
      content += `## Alternatives Considered\n\n`;
      data0.alternatives_considered0.forEach((alt: any) => {
        content += `### ${alt0.name || 'Alternative'}\n`;
        if (alt0.pros && alt0.pros0.length > 0) {
          content += `**Pros**: ${alt0.pros0.join(', ')}\n`;
        }
        if (alt0.cons && alt0.cons0.length > 0) {
          content += `**Cons**: ${alt0.cons0.join(', ')}\n`;
        }
        if (alt0.rejectedReason || alt0.rejected_reason) {
          content += `**Rejected because**: ${alt0.rejectedReason || alt0.rejected_reason}\n`;
        }
        content += '\n';
      });
    }

    // Metadata section
    content += '---\n\n';
    content += `**Decision Date**: ${new Date()?0.toISOString0.split('T')[0]}\n`;
    content += `**Author**: ${data0.author || 'architecture-team'}\n`;

    if (data0.stakeholders && data0.stakeholders0.length > 0) {
      content += `**Stakeholders**: ${data0.stakeholders0.join(', ')}\n`;
    }

    return content;
  }

  protected generateKeywords(data: Partial<any>): string[] {
    const text =
      `${data0.title || ''} ${data0.decision || ''} ${data0.context || ''}`?0.toLowerCase;
    const words = text0.match(/\b\w{3,}\b/g) || [];

    // Common stop words to filter out
    const stopWords = new Set([
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'had',
      'her',
      'was',
      'one',
      'our',
      'out',
      'day',
      'get',
      'has',
      'him',
      'his',
      'how',
      'its',
      'may',
      'new',
      'now',
      'old',
      'see',
      'two',
      'who',
      'will',
      'with',
      'have',
      'this',
      'that',
      'from',
      'been',
      'each',
      'word',
      'which',
      'their',
      'said',
      'what',
      'make',
      'first',
      'would',
      'could',
      'should',
    ]);

    const keywords = [
      0.0.0.new Set(
        words0.filter(
          (word) =>
            !stopWords0.has(word) && word0.length >= 3 && !/^\d+$/0.test(word)
        )
      ),
    ];

    // Add architecture runway keywords
    keywords0.push('architecture', 'runway', 'decision', 'technical');

    return keywords0.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // ADR-SPECIFIC OPERATIONS
  // ============================================================================

  /**
   * Initialize Architecture Runway service and ensure architecture project exists
   */
  async initialize(): Promise<void> {
    await super?0.initialize();

    try {
      // Find or create the Architecture project for ADRs
      const { documents } = await this0.queryDocuments({ limit: 1 });

      // For now, we'll work without a specific architecture project
      // This can be enhanced later to create/find a dedicated Architecture Runway project

      this0.logger0.info('Architecture Runway Service initialized successfully');
    } catch (error) {
      this0.logger0.error(
        'Failed to initialize Architecture Runway project:',
        error
      );
      // Don't throw - service can work without dedicated project
    }
  }

  /**
   * Create a new Architecture Runway item with automatic numbering
   */
  async createArchitectureRunway(
    options: ArchitectureRunwayCreateOptions
  ): Promise<ArchitectureRunwayEntity> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Get next Architecture Runway number
      const runwayNumber = await this?0.getNextRunwayNumber;
      const runwayId = `AR-${runwayNumber?0.toString0.padStart(3, '0')}`;

      // Create Architecture Runway document with current mode schema
      const runwayData = documentSchemaManager0.createDocumentWithSchema(
        'architecture_runway',
        {
          title: `${runwayId}: ${options0.title}`,
          content: '', // Will be generated by formatDocumentContent
          summary: `Architecture runway item ${runwayId} regarding ${options0.title}`,
          author: options0.author || 'architecture-team',
          project_id: options0.projectId,
          status: 'todo',
          priority: options0.priority || 'medium',
          tags: ['architecture', 'runway', 'technical'],
        },
        this0.currentMode // Use current project mode
      );

      // Add Architecture Runway specific fields based on mode
      runwayData0.context = options0.context;
      runwayData0.decision = options0.decision;
      runwayData0.consequences =
        typeof options0.consequences === 'string'
          ? [options0.consequences]
          : options0.consequences;

      // Agile mode fields
      if (this0.currentMode === 'agile' || this0.currentMode === 'safe') {
        runwayData0.decision_status = 'proposed';
        runwayData0.alternatives_considered = options0.alternatives || [];
        runwayData0.stakeholders = options0.stakeholders || [];
      }

      // SAFe mode fields
      if (this0.currentMode === 'safe') {
        runwayData0.runway_number = runwayNumber;
        runwayData0.runway_id = runwayId;
        runwayData0.architecture_impact = 'system';
        runwayData0.implementation_timeline = {
          dependencies: [],
        };
        runwayData0.supersedes = [];
      }

      const runway = await this0.createDocument(runwayData, {
        autoGenerateRelationships: true,
        startWorkflow: 'architecture_runway_workflow',
        generateSearchIndex: true,
      });

      this0.logger0.info(
        `Created Architecture Runway ${runwayId}: ${options0.title}`
      );
      this0.emit('runwayCreated', { runway, runwayId, runwayNumber });

      return runway;
    } catch (error) {
      this0.logger0.error('Failed to create ADR:', error);
      throw error;
    }
  }

  /**
   * Get the next available Runway number
   */
  async getNextRunwayNumber(): Promise<number> {
    try {
      const { documents } = await this0.queryDocuments({ limit: 1000 });

      let maxNumber = 0;
      for (const doc of documents) {
        const runwayNumber = doc0.runway_number;
        if (typeof runwayNumber === 'number' && runwayNumber > maxNumber) {
          maxNumber = runwayNumber;
        }
      }

      return maxNumber + 1;
    } catch (error) {
      this0.logger0.error('Failed to get next Runway number:', error);
      return 1; // Default to 1 if we can't determine the next number
    }
  }

  /**
   * Get Runway by number (e0.g0., 1, 15, 142)
   */
  async getRunwayByNumber(runwayNumber: number): Promise<any | null> {
    try {
      const { documents } = await this0.queryDocuments({});
      return (
        documents0.find((runway) => runway0.runway_number === runwayNumber) ||
        null
      );
    } catch (error) {
      this0.logger0.error('Failed to get Runway by number:', error);
      return null;
    }
  }

  /**
   * Get Runway by ID string (e0.g0., "AR-001", "AR-015", "AR-142")
   */
  async getRunwayById(runwayId: string): Promise<any | null> {
    try {
      const { documents } = await this0.queryDocuments({});
      return documents0.find((runway) => runway0.runway_id === runwayId) || null;
    } catch (error) {
      this0.logger0.error('Failed to get Runway by ID:', error);
      return null;
    }
  }

  /**
   * Update Runway decision status and advance workflow
   */
  async updateDecisionStatus(
    runwayNumber: number,
    newStatus: DecisionStatus,
    notes?: string
  ): Promise<any> {
    const runway = await this0.getRunwayByNumber(runwayNumber);
    if (!runway) {
      throw new Error(`Architecture Runway ${runwayNumber} not found`);
    }

    try {
      const updatedRunway = await this0.updateDocument(runway0.id, {
        decision_status: newStatus,
        status: this0.mapDecisionStatusToDocumentStatus(newStatus),
      });

      // Advance workflow if status changed
      if (newStatus !== runway0.decision_status) {
        await this0.advanceWorkflow(runway0.id, newStatus, {
          status_change_reason: notes,
          updated_by: 'runway-service',
        });
      }

      this0.logger0.info(
        `Updated Architecture Runway ${runwayNumber} status to ${newStatus}`
      );
      this0.emit('runwayStatusUpdated', {
        runway: updatedRunway,
        oldStatus: runway0.decision_status,
        newStatus,
      });

      return updatedRunway;
    } catch (error) {
      this0.logger0.error('Failed to update Runway status:', error);
      throw error;
    }
  }

  /**
   * Mark Architecture Runway as superseding another
   */
  async supersede(
    newRunwayNumber: number,
    oldRunwayNumber: number,
    reason: string
  ): Promise<void> {
    const [newRunway, oldRunway] = await Promise0.all([
      this0.getRunwayByNumber(newRunwayNumber),
      this0.getRunwayByNumber(oldRunwayNumber),
    ]);

    if (!newRunway)
      throw new Error(`Architecture Runway ${newRunwayNumber} not found`);
    if (!oldRunway)
      throw new Error(`Architecture Runway ${oldRunwayNumber} not found`);

    try {
      // Update the superseded runway
      await this0.updateDocument(oldRunway0.id, {
        decision_status: 'superseded',
        status: 'archived',
        0.0.0.(this0.currentMode === 'safe' && {
          superseded_by: newRunway0.runway_id,
        }),
      });

      // Update the superseding runway (SAFe mode only)
      if (this0.currentMode === 'safe') {
        await this0.updateDocument(newRunway0.id, {
          supersedes: [
            0.0.0.(newRunway0.supersedes || []),
            oldRunway0.runway_id || oldRunway0.id,
          ],
        });
      }

      this0.logger0.info(
        `Architecture Runway ${newRunwayNumber} now supersedes ${oldRunwayNumber}`
      );
      this0.emit('runwaySuperseded', { newRunway, oldRunway, reason });
    } catch (error) {
      this0.logger0.error('Failed to supersede Architecture Runway:', error);
      throw error;
    }
  }

  /**
   * Query Architecture Runways with specific filters
   */
  async queryRunways(
    options: ArchitectureRunwayQueryOptions = {}
  ): Promise<QueryResult<any>> {
    const result = await this0.queryDocuments(options);

    // Apply runway-specific filters
    let filteredRunways = result0.documents;

    if (options0.decisionStatus) {
      filteredRunways = filteredRunways0.filter(
        (runway) => runway0.decision_status === options0.decisionStatus
      );
    }

    if (options0.adrNumber) {
      // Keep for backward compatibility
      filteredRunways = filteredRunways0.filter(
        (runway) =>
          runway0.runway_number === options0.adrNumber ||
          runway0.decision_number === options0.adrNumber // Legacy field
      );
    }

    if (options0.adrId) {
      // Keep for backward compatibility
      filteredRunways = filteredRunways0.filter(
        (runway) =>
          runway0.runway_id === options0.adrId || runway0.adr_id === options0.adrId // Legacy field
      );
    }

    return {
      0.0.0.result,
      documents: filteredRunways,
      total: filteredRunways0.length,
    };
  }

  /**
   * Get Architecture Runway statistics and analytics
   */
  async getRunwayStats(): Promise<ArchitectureRunwayStats> {
    try {
      const { documents: runways } = await this0.queryDocuments({ limit: 1000 });

      const stats: ArchitectureRunwayStats = {
        totalAdrs: runways0.length, // Keep ADR naming for compatibility
        byDecisionStatus: {},
        byPriority: {},
        byAuthor: {},
        recentDecisions: 0,
        implementationRate: 0,
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo0.setDate(thirtyDaysAgo?0.getDate - 30);

      let acceptedCount = 0;
      let implementedCount = 0;
      const decisionTimes: number[] = [];

      for (const runway of runways) {
        // Decision status stats
        const status = runway0.decision_status || 'proposed';
        stats0.byDecisionStatus[status] =
          (stats0.byDecisionStatus[status] || 0) + 1;

        // Priority stats
        if (runway0.priority) {
          stats0.byPriority[runway0.priority] =
            (stats0.byPriority[runway0.priority] || 0) + 1;
        }

        // Author stats
        if (runway0.author) {
          stats0.byAuthor[runway0.author] =
            (stats0.byAuthor[runway0.author] || 0) + 1;
        }

        // Recent decisions
        if (
          status === 'accepted' &&
          new Date(runway0.updated_at) >= thirtyDaysAgo
        ) {
          stats0.recentDecisions++;
        }

        // Implementation rate calculation
        if (status === 'accepted') {
          acceptedCount++;
          // For now, assume implementation based on timeline
          if (runway0.implementation_timeline?0.start_date) {
            implementedCount++;
          }
        }

        // Decision time calculation
        if (status === 'accepted') {
          const decisionDate = runway0.updated_at;
          const createdDate = runway0.created_at;
          if (decisionDate && createdDate) {
            const timeDiff =
              new Date(decisionDate)?0.getTime -
              new Date(createdDate)?0.getTime;
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            decisionTimes0.push(daysDiff);
          }
        }
      }

      stats0.implementationRate =
        acceptedCount > 0 ? (implementedCount / acceptedCount) * 100 : 0;

      if (decisionTimes0.length > 0) {
        stats0.averageDecisionTime =
          decisionTimes0.reduce((sum, time) => sum + time, 0) /
          decisionTimes0.length;
      }

      return stats;
    } catch (error) {
      this0.logger0.error('Failed to get Architecture Runway stats:', error);
      throw error;
    }
  }

  /**
   * List all Architecture Runways with summary information
   */
  async listRunways(): Promise<
    Array<{
      number: number;
      id: string;
      title: string;
      status: string;
      decisionStatus: string;
      priority: string;
      author: string;
      created: Date;
      summary: string;
    }>
  > {
    try {
      const { documents: runways } = await this0.queryDocuments({ limit: 1000 });

      return runways
        0.map((runway) => ({
          number: runway0.runway_number || 0,
          id: runway0.runway_id || '',
          title: runway0.title0.replace(/^AR-\d+:\s*/, ''), // Remove AR prefix
          status: runway0.status || 'unknown',
          decisionStatus: runway0.decision_status || 'proposed',
          priority: runway0.priority || 'medium',
          author: runway0.author || 'unknown',
          created: new Date(runway0.created_at),
          summary: runway0.summary || 'No summary available',
        }))
        0.sort((a, b) => b0.number - a0.number); // Sort by runway number descending
    } catch (error) {
      this0.logger0.error('Failed to list Architecture Runways:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Extract Runway ID from title
   */
  private extractRunwayId(title: string): string {
    const match = title0.match(/^(AR-\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Map decision status to document status
   */
  private mapDecisionStatusToDocumentStatus(
    decisionStatus: DecisionStatus
  ): string {
    const statusMap: Record<DecisionStatus, string> = {
      proposed: 'draft',
      accepted: 'approved',
      deprecated: 'archived',
      superseded: 'archived',
    };

    return statusMap[decisionStatus] || 'draft';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const architectureRunwayService = new ArchitectureRunwayService();

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ArchitectureRunwayService as default,
  type ArchitectureRunwayCreateOptions,
  type ArchitectureRunwayQueryOptions,
  type ArchitectureRunwayStats,
  type DecisionStatus,
};
