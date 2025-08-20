/**
 * @fileoverview Architecture Runway Service - SAFe Architecture Runway Items
 * 
 * Extends BaseDocumentService to provide Architecture Runway functionality including:
 * - Automatic numbering (AR-001, AR-002, etc.)
 * - Architecture decision lifecycle management (proposed → accepted → implemented)
 * - Superseding relationships between runway items
 * - SAFe-compatible architecture decision formatting
 * 
 * Follows Google TypeScript conventions and facade pattern.
 * Compatible across Kanban → Agile → SAFe modes.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */

import { BaseDocumentService, type ValidationResult, type QueryFilters, type QueryResult } from './base-document-service';
import type { DocumentType } from '../../workflows/types';
import { DocumentManager } from './document-service';
import { documentSchemaManager, type ArchitectureRunwaySchemaV1, type ArchitectureRunwaySchemaV2, type ArchitectureRunwaySchemaV3 } from './document-schemas';

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

export type DecisionStatus = 'proposed' | 'accepted' | 'deprecated' | 'superseded';

// ============================================================================
// ARCHITECTURE RUNWAY SERVICE
// ============================================================================

/**
 * Architecture Runway Service - SAFe Architecture Runway Items
 * 
 * Provides architecture runway operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management.
 * Compatible across Kanban → Agile → SAFe modes.
 */
export class ArchitectureRunwayService extends BaseDocumentService<any> {
  private currentMode: 'kanban' | 'agile' | 'safe' = 'kanban';

  constructor(documentManager?: DocumentManager, mode: 'kanban' | 'agile' | 'safe' = 'kanban') {
    super('architecture-runway', documentManager);
    this.currentMode = mode;
  }

  /**
   * Set the current project mode (determines schema version)
   */
  setProjectMode(mode: 'kanban' | 'agile' | 'safe'): void {
    this.currentMode = mode;
    this.logger.info(`Architecture Runway service set to ${mode} mode`);
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
    if (!data.title?.trim()) {
      errors.push('Title is required');
    }

    if (!data.context?.trim()) {
      errors.push('Context is required');
    }

    if (!data.decision?.trim()) {
      errors.push('Decision is required');
    }

    if (!data.consequences || data.consequences.length === 0) {
      errors.push('At least one consequence is required');
    }

    // Validation warnings
    if (data.title && data.title.length < 10) {
      warnings.push('Title should be more descriptive (at least 10 characters)');
    }

    if (data.context && data.context.length < 50) {
      warnings.push('Context should provide sufficient background (at least 50 characters)');
    }

    if (data.decision && data.decision.length < 30) {
      warnings.push('Decision should be detailed (at least 30 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected formatDocumentContent(data: Partial<any>): string {
    const runwayId = data.runway_id || this.extractRunwayId(data.title || '');
    
    let content = `# ${data.title}\n\n`;
    
    // Status section  
    const status = data.decision_status || 'proposed';
    content += `## Status\n**${status.toUpperCase()}**\n\n`;
    
    // Runway ID
    if (runwayId) {
      content += `**Runway ID**: ${runwayId}\n\n`;
    }
    
    // Context section
    content += `## Context\n${data.context || ''}\n\n`;
    
    // Decision section
    content += `## Decision\n${data.decision || ''}\n\n`;
    
    // Consequences section
    content += `## Consequences\n`;
    if (data.consequences && data.consequences.length > 0) {
      data.consequences.forEach(consequence => {
        content += `- ${consequence}\n`;
      });
    }
    content += '\n';
    
    // Alternatives section (if any)
    if (data.alternatives_considered && data.alternatives_considered.length > 0) {
      content += `## Alternatives Considered\n\n`;
      data.alternatives_considered.forEach((alt: any) => {
        content += `### ${alt.name || 'Alternative'}\n`;
        if (alt.pros && alt.pros.length > 0) {
          content += `**Pros**: ${alt.pros.join(', ')}\n`;
        }
        if (alt.cons && alt.cons.length > 0) {
          content += `**Cons**: ${alt.cons.join(', ')}\n`;
        }
        if (alt.rejectedReason || alt.rejected_reason) {
          content += `**Rejected because**: ${alt.rejectedReason || alt.rejected_reason}\n`;
        }
        content += '\n';
      });
    }
    
    // Metadata section
    content += '---\n\n';
    content += `**Decision Date**: ${new Date().toISOString().split('T')[0]}\n`;
    content += `**Author**: ${data.author || 'architecture-team'}\n`;
    
    if (data.stakeholders && data.stakeholders.length > 0) {
      content += `**Stakeholders**: ${data.stakeholders.join(', ')}\n`;
    }
    
    return content;
  }

  protected generateKeywords(data: Partial<any>): string[] {
    const text = `${data.title || ''} ${data.decision || ''} ${data.context || ''}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];

    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'will',
      'with', 'have', 'this', 'that', 'from', 'been', 'each', 'word', 'which',
      'their', 'said', 'what', 'make', 'first', 'would', 'could', 'should'
    ]);

    const keywords = [
      ...new Set(
        words.filter(word =>
          !stopWords.has(word) && 
          word.length >= 3 && 
          !/^\d+$/.test(word)
        )
      )
    ];

    // Add architecture runway keywords
    keywords.push('architecture', 'runway', 'decision', 'technical');

    return keywords.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // ADR-SPECIFIC OPERATIONS
  // ============================================================================

  /**
   * Initialize Architecture Runway service and ensure architecture project exists
   */
  async initialize(): Promise<void> {
    await super.initialize();

    try {
      // Find or create the Architecture project for ADRs
      const { documents } = await this.queryDocuments({ limit: 1 });
      
      // For now, we'll work without a specific architecture project
      // This can be enhanced later to create/find a dedicated Architecture Runway project
      
      this.logger.info('Architecture Runway Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Architecture Runway project:', error);
      // Don't throw - service can work without dedicated project
    }
  }

  /**
   * Create a new Architecture Runway item with automatic numbering
   */
  async createArchitectureRunway(options: ArchitectureRunwayCreateOptions): Promise<ArchitectureRunwayEntity> {
    if (!this.initialized) await this.initialize();

    try {
      // Get next Architecture Runway number
      const runwayNumber = await this.getNextRunwayNumber();
      const runwayId = `AR-${runwayNumber.toString().padStart(3, '0')}`;

      // Create Architecture Runway document with current mode schema
      const runwayData = documentSchemaManager.createDocumentWithSchema(
        'architecture_runway',
        {
          title: `${runwayId}: ${options.title}`,
          content: '', // Will be generated by formatDocumentContent
          summary: `Architecture runway item ${runwayId} regarding ${options.title}`,
          author: options.author || 'architecture-team',
          project_id: options.projectId,
          status: 'todo',
          priority: options.priority || 'medium',
          tags: ['architecture', 'runway', 'technical']
        },
        this.currentMode // Use current project mode
      );
      
      // Add Architecture Runway specific fields based on mode
      runwayData.context = options.context;
      runwayData.decision = options.decision;
      runwayData.consequences = typeof options.consequences === 'string' 
        ? [options.consequences]
        : options.consequences;
      
      // Agile mode fields
      if (this.currentMode === 'agile' || this.currentMode === 'safe') {
        runwayData.decision_status = 'proposed';
        runwayData.alternatives_considered = options.alternatives || [];
        runwayData.stakeholders = options.stakeholders || [];
      }
      
      // SAFe mode fields
      if (this.currentMode === 'safe') {
        runwayData.runway_number = runwayNumber;
        runwayData.runway_id = runwayId;
        runwayData.architecture_impact = 'system';
        runwayData.implementation_timeline = {
          dependencies: []
        };
        runwayData.supersedes = [];
      }

      const runway = await this.createDocument(runwayData, {
        autoGenerateRelationships: true,
        startWorkflow: 'architecture_runway_workflow',
        generateSearchIndex: true
      });

      this.logger.info(`Created Architecture Runway ${runwayId}: ${options.title}`);
      this.emit('runwayCreated', { runway, runwayId, runwayNumber });

      return runway;

    } catch (error) {
      this.logger.error('Failed to create ADR:', error);
      throw error;
    }
  }

  /**
   * Get the next available Runway number
   */
  async getNextRunwayNumber(): Promise<number> {
    try {
      const { documents } = await this.queryDocuments({ limit: 1000 });
      
      let maxNumber = 0;
      for (const doc of documents) {
        const runwayNumber = doc.runway_number;
        if (typeof runwayNumber === 'number' && runwayNumber > maxNumber) {
          maxNumber = runwayNumber;
        }
      }

      return maxNumber + 1;

    } catch (error) {
      this.logger.error('Failed to get next Runway number:', error);
      return 1; // Default to 1 if we can't determine the next number
    }
  }

  /**
   * Get Runway by number (e.g., 1, 15, 142)
   */
  async getRunwayByNumber(runwayNumber: number): Promise<any | null> {
    try {
      const { documents } = await this.queryDocuments({});
      return documents.find(runway => 
        runway.runway_number === runwayNumber
      ) || null;

    } catch (error) {
      this.logger.error('Failed to get Runway by number:', error);
      return null;
    }
  }

  /**
   * Get Runway by ID string (e.g., "AR-001", "AR-015", "AR-142")
   */
  async getRunwayById(runwayId: string): Promise<any | null> {
    try {
      const { documents } = await this.queryDocuments({});
      return documents.find(runway => runway.runway_id === runwayId) || null;

    } catch (error) {
      this.logger.error('Failed to get Runway by ID:', error);
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
    const runway = await this.getRunwayByNumber(runwayNumber);
    if (!runway) {
      throw new Error(`Architecture Runway ${runwayNumber} not found`);
    }

    try {
      const updatedRunway = await this.updateDocument(runway.id, {
        decision_status: newStatus,
        status: this.mapDecisionStatusToDocumentStatus(newStatus)
      });

      // Advance workflow if status changed
      if (newStatus !== runway.decision_status) {
        await this.advanceWorkflow(runway.id, newStatus, {
          status_change_reason: notes,
          updated_by: 'runway-service'
        });
      }

      this.logger.info(`Updated Architecture Runway ${runwayNumber} status to ${newStatus}`);
      this.emit('runwayStatusUpdated', { runway: updatedRunway, oldStatus: runway.decision_status, newStatus });

      return updatedRunway;

    } catch (error) {
      this.logger.error('Failed to update Runway status:', error);
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
    const [newRunway, oldRunway] = await Promise.all([
      this.getRunwayByNumber(newRunwayNumber),
      this.getRunwayByNumber(oldRunwayNumber)
    ]);

    if (!newRunway) throw new Error(`Architecture Runway ${newRunwayNumber} not found`);
    if (!oldRunway) throw new Error(`Architecture Runway ${oldRunwayNumber} not found`);

    try {
      // Update the superseded runway
      await this.updateDocument(oldRunway.id, {
        decision_status: 'superseded',
        status: 'archived',
        ...(this.currentMode === 'safe' && { superseded_by: newRunway.runway_id })
      });

      // Update the superseding runway (SAFe mode only)
      if (this.currentMode === 'safe') {
        await this.updateDocument(newRunway.id, {
          supersedes: [
            ...(newRunway.supersedes || []),
            oldRunway.runway_id || oldRunway.id
          ]
        });
      }

      this.logger.info(`Architecture Runway ${newRunwayNumber} now supersedes ${oldRunwayNumber}`);
      this.emit('runwaySuperseded', { newRunway, oldRunway, reason });

    } catch (error) {
      this.logger.error('Failed to supersede Architecture Runway:', error);
      throw error;
    }
  }

  /**
   * Query Architecture Runways with specific filters
   */
  async queryRunways(options: ArchitectureRunwayQueryOptions = {}): Promise<QueryResult<any>> {
    const result = await this.queryDocuments(options);

    // Apply runway-specific filters
    let filteredRunways = result.documents;

    if (options.decisionStatus) {
      filteredRunways = filteredRunways.filter(runway => runway.decision_status === options.decisionStatus);
    }

    if (options.adrNumber) { // Keep for backward compatibility
      filteredRunways = filteredRunways.filter(runway => 
        runway.runway_number === options.adrNumber ||
        runway.decision_number === options.adrNumber // Legacy field
      );
    }

    if (options.adrId) { // Keep for backward compatibility
      filteredRunways = filteredRunways.filter(runway => 
        runway.runway_id === options.adrId ||
        runway.adr_id === options.adrId // Legacy field
      );
    }

    return {
      ...result,
      documents: filteredRunways,
      total: filteredRunways.length
    };
  }

  /**
   * Get Architecture Runway statistics and analytics
   */
  async getRunwayStats(): Promise<ArchitectureRunwayStats> {
    try {
      const { documents: runways } = await this.queryDocuments({ limit: 1000 });
      
      const stats: ArchitectureRunwayStats = {
        totalAdrs: runways.length, // Keep ADR naming for compatibility
        byDecisionStatus: {},
        byPriority: {},
        byAuthor: {},
        recentDecisions: 0,
        implementationRate: 0
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let acceptedCount = 0;
      let implementedCount = 0;
      const decisionTimes: number[] = [];

      for (const runway of runways) {
        // Decision status stats
        const status = runway.decision_status || 'proposed';
        stats.byDecisionStatus[status] = (stats.byDecisionStatus[status] || 0) + 1;

        // Priority stats
        if (runway.priority) {
          stats.byPriority[runway.priority] = (stats.byPriority[runway.priority] || 0) + 1;
        }

        // Author stats
        if (runway.author) {
          stats.byAuthor[runway.author] = (stats.byAuthor[runway.author] || 0) + 1;
        }

        // Recent decisions
        if (status === 'accepted' && new Date(runway.updated_at) >= thirtyDaysAgo) {
          stats.recentDecisions++;
        }

        // Implementation rate calculation
        if (status === 'accepted') {
          acceptedCount++;
          // For now, assume implementation based on timeline
          if (runway.implementation_timeline?.start_date) {
            implementedCount++;
          }
        }

        // Decision time calculation
        if (status === 'accepted') {
          const decisionDate = runway.updated_at;
          const createdDate = runway.created_at;
          if (decisionDate && createdDate) {
            const timeDiff = new Date(decisionDate).getTime() - new Date(createdDate).getTime();
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            decisionTimes.push(daysDiff);
          }
        }
      }

      stats.implementationRate = acceptedCount > 0 ? (implementedCount / acceptedCount) * 100 : 0;
      
      if (decisionTimes.length > 0) {
        stats.averageDecisionTime = decisionTimes.reduce((sum, time) => sum + time, 0) / decisionTimes.length;
      }

      return stats;

    } catch (error) {
      this.logger.error('Failed to get Architecture Runway stats:', error);
      throw error;
    }
  }

  /**
   * List all Architecture Runways with summary information
   */
  async listRunways(): Promise<Array<{
    number: number;
    id: string;
    title: string;
    status: string;
    decisionStatus: string;
    priority: string;
    author: string;
    created: Date;
    summary: string;
  }>> {
    try {
      const { documents: runways } = await this.queryDocuments({ limit: 1000 });

      return runways
        .map(runway => ({
          number: runway.runway_number || 0,
          id: runway.runway_id || '',
          title: runway.title.replace(/^AR-\d+:\s*/, ''), // Remove AR prefix
          status: runway.status || 'unknown',
          decisionStatus: runway.decision_status || 'proposed',
          priority: runway.priority || 'medium',
          author: runway.author || 'unknown',
          created: new Date(runway.created_at),
          summary: runway.summary || 'No summary available'
        }))
        .sort((a, b) => b.number - a.number); // Sort by runway number descending

    } catch (error) {
      this.logger.error('Failed to list Architecture Runways:', error);
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
    const match = title.match(/^(AR-\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Map decision status to document status
   */
  private mapDecisionStatusToDocumentStatus(decisionStatus: DecisionStatus): string {
    const statusMap: Record<DecisionStatus, string> = {
      proposed: 'draft',
      accepted: 'approved',
      deprecated: 'archived',
      superseded: 'archived'
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
  type DecisionStatus
};