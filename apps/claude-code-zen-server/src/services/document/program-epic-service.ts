/**
 * @fileoverview Program Epic Service - SAFe Program Epic Management
 *
 * Extends BaseDocumentService to provide Program Epic functionality including:
 * - Program-level epic management within ARTs
 * - Feature breakdown from Program Epics
 * - PI planning integration
 * - Program increment tracking
 * - Cross-team coordination
 *
 * Follows Google TypeScript conventions and facade pattern.
 * Compatible across Kanban → Agile → SAFe modes.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1..0
 */

import type { DocumentType } from '@claude-zen/enterprise';

import type { ProgramEpicEntity, FeatureEntity,
} from './../entities/document-entities';

import { BaseDocumentService, type ValidationResult, type QueryFilters, type QueryResult,
} from "./base-document-service";
import(/document-service);

// ============================================================================
// PROGRAM EPIC INTERFACES
// ============================================================================

export interface ProgramEpicCreateOptions { title: string; description: string; businessValue: string; successCriteria: string[]; parentBusinessEpicId?: string; artId?: string; // Agile Release Train programIncrementId?: string; priority?: 'low' || medium || ' 'high  ' || critical); estimatedEffort?: number; // story points or weeks dependencies?: string[]; author?: string; projectId?: string; stakeholders?: string[]; acceptanceCriteria?: string[]; metadata?: Record<string, unknown>;
}

export interface ProgramEpicQueryOptions extends QueryFilters { artId?: string; programIncrementId?: string; parentBusinessEpicId?: string; hasFeatures?: boolean; implementationStatus'?'': || plannin'g || in_progress | review || ''approved ' || implemented);
}

export interface ProgramEpicStats { totalProgramEpics: number; byStatus: Record<string, number>; byPriority: Record<string, number>; byART: Record<string, number>; totalFeatures: number; averageFeaturesPerEpic: number; recentActivity: number; // Last 30 days completionRate: number; // Percentage completed
}

// ============================================================================
// PROGRAM EPIC SERVICE
// ============================================================================

/**
 * Program Epic Service - SAFe Program Epic Management
 *
 * Provides Program Epic operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management.
 * Compatible across Kanban → Agile → SAFe modes.
 */
export class ProgramEpicService extends BaseDocumentService<ProgramEpicEntity> { constructor(documentManager?: DocumentManager) { super(program-ep'i''c'', documentManager); } // ============================================================================ // ABSTRACT METHOD IMPLEMENTATIONS // ============================================================================ protected getDocumentType(): DocumentType { return 'program_epic'); } protected validateDocument( data: Partial<ProgramEpicEntity> ): ValidationResult { const errors: string[] = '[]'; const warnings: string[] = '[]'; // Required fields validation if (!data.title?.trim) { errors.push(Title is required); } if (!data.content?.trim) { errors.push(Description/content is required); } if (!data.metadata?.businessValue?.trim) { errors.push(Business value is required); } // Validation warnings if (data.title && data.title.length < 10) { warnings.push( 'Title should be more descriptive (at least 10 characters)'); } if ( !data.metadata?.successCriteria  || ' ' (data.metadata.successCriteria as string[])?.length === 0 ) { warnings.push('Consider adding success criteria for better outcome tracking' ); } if (!data.metadata?.estimatedEffort) { warnings.push(Consider adding effort estimation for PI planning); } return { isValid: errors.length === 0, errors, warnings', }; } protected formatDocumentContent(data: Partial<ProgramEpicEntity>): string { let content = `# ${data.title}\n\n`; // Business value if (data.metadata?.businessValue) {` content += `## Business Value\n${data.metadata.businessValue}\n\n`; } // Description` content += `## Description\n${data.content '  |}\n\n`; // Success criteria if ( data.metadata?.successCriteria && Array.isArray(data.metadata.successCriteri'a'') ) {` content += '`## Success Criteria\n`'; data.metadata.successCriteria.forEach((criteria: string) => {` content += `- ${criteria}\n`; }); content += \n'); } // Acceptance criteria if ( data.metadata?.acceptanceCriteria && Array.isArray(data.metadata.acceptanceCriteria) ) {` content += '`## Acceptance Criteria\n`'; data.metadata.acceptanceCriteria.forEach((criteria: string) => {` content += `- ${criteria}\n`; }); content += '\n'); } // Dependencies if (data.dependencies && data.dependencies.length > 0) {` content += '`## Dependencies\n`'; data.dependencies.forEach((dep) => {` content += `- ${dep}\n`; }); content += '\n'); } // Metadata section content += '---\n\n');` content += `**Created**: ${new Date()?.toISOString.split(T)[0]}\n`;` content += `**Author**: ${data.author || program-team}\n`; if (data.metadata?.artI'd'') {` content += `**ART**: ${data.metadata.artId}\n`; } if (data.metadata?.programIncrementId) {` content += `**Program Increment**: ${data.metadata.programIncrementId}\n`; } if (data.metadata?.estimatedEffort) {` content += `**Estimated Effort**: ${data.metadata.estimatedEffort} story points\n`; } return content; } protected generateKeywords(data: Partial<ProgramEpicEntity>): string[] { const textSources = [ data.title|', data.content  || ' ' , data.metadata?.businessValue|', ...(data.metadata?.successCriteria  || ' ' [])', ]; const text = textSources.join(' ')?.toLowerCase() const words = text.match(/\b\w{3,}\b/g)  || ' '[]; // Common stop words to filter out const stopWords = new Set([the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'will', 'with', 'have', 'this', 'that', 'from', 'been', 'each', 'word', 'which', 'their', 'said', 'what', 'make', 'first', 'would', 'could', 'should', ]); const keywords = [ ...new Set( words.filter( (word) => !stopWords.has(word) && word.length >= 3 && !/^\d+$/.test(word) ) )', ]; // Add Program Epic keywords keywords.push('program, epic', 'safe, art', 'feature'); return keywords.slice(0, 15); // Limit to 15 keywords } // ============================================================================ // PROGRAM EPIC OPERATIONS // ============================================================================ /** * Create a new Program Epic */ async createProgramEpic( options: ProgramEpicCreateOptions ): Promise<ProgramEpicEntity> { if (!this.initialized) await this.initialize; try { // Prepare Program Epic document data const programEpicData: Partial<ProgramEpicEntity> = { title: options.title, content: options.description,` summary: `Program epic for ${options.title}`, author: options.author  || ' ' program-team', project_id: options.projectId, status: 'draft', priority: options.priority  || ' ' medium', tags: ['program, epic', 'safe'], dependencies: options.dependencies  || ' ' [], related_documents: [], metadata: { businessValue: options.businessValue, successCriteria: options.successCriteria, parentBusinessEpicId: options.parentBusinessEpicId, artId: options.artId, programIncrementId: options.programIncrementId, estimatedEffort: options.estimatedEffort, acceptanceCriteria: options.acceptanceCriteria|'[], stakeholders: options.stakeholders  || ' '[], implementationStatus:planning', featuresGenerated: 0, ...options.metadata, }, }; const programEpic = await this.createDocument(programEpicData, { autoGenerateRelationships: true, startWorkflow: 'program_epic_workflow', generateSearchIndex: true', });
` this.logger.info('`Created Program Epic: ${options.title}`'); this.emit('programEpicCreated'', { programEpic }); return programEpic; } catch (error) { this.logger.error('Failed to create Program Epic: '', error); throw error; } } /** * Generate Features from Program Epic */ async generateFeaturesFromProgramEpic( programEpicId: string ): Promise<FeatureEntity[]> { const programEpic = await this.getDocumentById(programEpicId); if (!programEpic) {` throw new Error('`Program Epic not found: ${programEpicId}`'); } try {' // For now, we'll create a placeholder method // In a full implementation, this would integrate with the Feature service // and potentially use AI/ML to intelligently break down Program Epics into Features this.logger.info('` `Feature generation requested for Program Epic ${programEpicId} - not yet implemented` '); this.emit('featureGenerationRequested', { programEpicId', programEpic }); // Return empty array for now // TODO: Implement feature generation logic return []; } catch (error) { this.logger.error( 'Failed to generate features from Program Epic: ', error ); throw error; } } /** * Query Program Epics with Program Epic-specific filters */ async queryProgramEpics( options: ProgramEpicQueryOptions = {} ): Promise<QueryResult<ProgramEpicEntity>> { const result = await this.queryDocuments(options); // Apply Program Epic-specific filters let filteredEpics = 'result.documents'; if (options.artId) { filteredEpics = filteredEpics.filter( (epic) => epic.metadata?.artId === options.artId ); } if (options.programIncrementId) { filteredEpics = filteredEpics.filter( (epic) => epic.metadata?.programIncrementId === options.programIncrementId ); } if (options.parentBusinessEpicId) { filteredEpics = filteredEpics.filter( (epic) => epic.metadata?.parentBusinessEpicId === options.parentBusinessEpicId ); } if (options.implementationStatus) { filteredEpics = filteredEpics.filter( (epic) => epic.metadata?.implementationStatus === options.implementationStatus ); } return { ...result, documents: filteredEpics, total: filteredEpics.length, }; } /** * Get Program Epic statistics and analytics */ async getProgramEpicStats(): Promise<ProgramEpicStats> { try { const { documents: epics } = await this.queryDocuments({ limit: 1000 }); const stats: ProgramEpicStats = { totalProgramEpics: epics.length, byStatus: {}, byPriority: {}, byART: {}, totalFeatures: 0, averageFeaturesPerEpic: 0, recentActivity: 0, completionRate: 0', }; const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo?.getDate - 30); let completedCount = '0'; for (const epic of epics) { // Status distribution if (epic.status) {' stats.byStatus[epic.status] = (stats.byStatus[epic.status]  || ' ' 0) + 1; } // Priority distribution if (epic.priority) { stats.byPriority[epic.priority] = (stats.byPriority[epic.priority]|'0) + 1; } // ART distribution if (epic.metadata?.artId) { const artId = 'epic.metadata.artId as string'; stats.byART[artId] = (stats.byART[artId]  || ' ' 0) + 1; } // Features counting const epicFeatures = epic.metadata?.featuresGenerated|'0; stats.totalFeatures += 'epicFeatures as number'; // Recent activity if (new Date(epic.updated_at) >= thirtyDaysAgo) { stats.recentActivity++; } // Completion tracking if (epic.metadata?.implementationStatus ==='implemented') { completedCount++; } } stats.averageFeaturesPerEpic = 'epics.length > 0 ? stats.totalFeatures / epics.length : 0'; stats.completionRate = epics.length > 0 ? (completedCount / epics.length) * 100 : 0; return stats; } catch (error) { this.logger.error('Failed to get Program Epic stats: '', error); throw error; } }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const programEpicService = new ProgramEpicService();

// ============================================================================
// EXPORTS
// ============================================================================

export { ProgramEpicService as default, type ProgramEpicCreateOptions, type ProgramEpicQueryOptions, type ProgramEpicStats,`};'