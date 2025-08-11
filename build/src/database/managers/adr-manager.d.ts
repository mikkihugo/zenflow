/**
 * ADR Manager - Architecture Decision Record Management System.
 *
 * Manages hundreds of ADRs in the hive database with automatic numbering,
 * relationship tracking, and decision lifecycle management.
 */
/**
 * @file Adr management system.
 */
import type { ADRDocumentEntity } from '../entities/document-entities.ts';
export interface ADRCreateOptions {
    title: string;
    context: string;
    decision: string;
    consequences: string;
    alternatives?: Array<{
        name: string;
        pros: string[];
        cons: string[];
        rejected_reason: string;
    }>;
    author?: string;
    project_id?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    stakeholders?: string[];
    implementation_notes?: string;
    success_criteria?: string[];
    metadata?: Record<string, any>;
}
export interface ADRQueryOptions {
    status?: 'proposed' | 'discussion' | 'decided' | 'implemented' | 'superseded' | 'deprecated';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    author?: string;
    project_id?: string;
    date_range?: {
        start?: Date;
        end?: Date;
    };
    tags?: string[];
    limit?: number;
    offset?: number;
}
export interface ADRStats {
    total: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_author: Record<string, number>;
    recent_decisions: number;
    implementation_rate: number;
}
/**
 * ADR Management System for handling hundreds of Architecture Decision Records.
 *
 * @example
 */
export declare class ADRManager {
    private architectureProject?;
    /**
     * Initialize ADR manager and ensure architecture project exists.
     */
    initialize(): Promise<void>;
    /**
     * Create a new ADR with automatic numbering.
     *
     * @param options
     */
    createADR(options: ADRCreateOptions): Promise<ADRDocumentEntity>;
    /**
     * Get the next available ADR number.
     */
    getNextADRNumber(): Promise<number>;
    /**
     * Query ADRs with flexible filtering.
     *
     * @param options
     */
    queryADRs(options?: ADRQueryOptions): Promise<{
        adrs: ADRDocumentEntity[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Search ADRs using advanced search capabilities.
     *
     * @param query
     * @param options
     * @param options.searchType
     * @param options.limit
     * @param options.filters
     */
    searchADRs(query: string, options?: {
        searchType?: 'fulltext' | 'semantic' | 'keyword' | 'combined';
        limit?: number;
        filters?: ADRQueryOptions;
    }): Promise<{
        adrs: ADRDocumentEntity[];
        total: number;
        searchMetadata: any;
    }>;
    /**
     * Get ADR by number (e.g., 1, 15, 142).
     *
     * @param number
     */
    getADRByNumber(number: number): Promise<ADRDocumentEntity | null>;
    /**
     * Get ADR by ID string (e.g., "ADR-001", "ADR-015", "ADR-142").
     *
     * @param adrId
     */
    getADRById(adrId: string): Promise<ADRDocumentEntity | null>;
    /**
     * Update ADR status and advance workflow.
     *
     * @param adrNumber
     * @param newStatus
     * @param notes
     */
    updateADRStatus(adrNumber: number, newStatus: 'proposed' | 'discussion' | 'decided' | 'implemented' | 'superseded' | 'deprecated', notes?: string): Promise<ADRDocumentEntity>;
    /**
     * Mark ADR as superseding another ADR.
     *
     * @param newADRNumber
     * @param oldADRNumber
     * @param reason
     */
    supersede(newADRNumber: number, oldADRNumber: number, reason: string): Promise<void>;
    /**
     * Get ADR statistics and analytics.
     */
    getADRStats(): Promise<ADRStats>;
    /**
     * List all ADRs with summary information.
     */
    listADRs(): Promise<Array<{
        number: number;
        id: string;
        title: string;
        status: string;
        priority: string;
        author: string;
        created: Date;
        summary: string;
    }>>;
    /**
     * Format ADR content in standard structure.
     *
     * @param adrId
     * @param options
     */
    private formatADRContent;
    /**
     * Generate keywords from title and decision.
     *
     * @param title
     * @param decision
     */
    private generateKeywords;
}
export declare const adrManager: ADRManager;
export default adrManager;
//# sourceMappingURL=adr-manager.d.ts.map