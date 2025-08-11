/**
 * Database Storage Service for SPARC Architecture Engine.
 *
 * Provides database-driven persistence for architecture designs,
 * integrating with multi-backend database system.
 */
/**
 * @file Coordination system: architecture-storage.
 */
import type { ArchitecturalValidation, ArchitectureDesign } from '../types/sparc-types.ts';
export interface ArchitectureRecord {
    id: string;
    architecture_id: string;
    project_id?: string | undefined;
    name: string;
    domain: string;
    design_data: string;
    components_data: string;
    validation_data?: string | undefined;
    created_at: Date;
    updated_at: Date;
    version: number;
    tags?: string | undefined;
    metadata?: string | undefined;
}
export interface ComponentRecord {
    id: string;
    architecture_id: string;
    component_id: string;
    name: string;
    type: string;
    responsibilities: string;
    interfaces: string;
    dependencies: string;
    performance_data: string;
    created_at: Date;
    updated_at: Date;
}
export interface ValidationRecord {
    id: string;
    architecture_id: string;
    validation_type: string;
    passed: boolean;
    score: number;
    results_data: string;
    recommendations: string;
    created_at: Date;
}
/**
 * Database-driven storage service for SPARC Architecture designs.
 *
 * @example
 */
export declare class ArchitectureStorageService {
    private db;
    private tableName;
    private componentsTableName;
    private validationsTableName;
    constructor(db: any);
    /**
     * Initialize database tables for architecture storage.
     */
    initialize(): Promise<void>;
    /**
     * Save architecture design to database.
     *
     * @param architecture
     * @param projectId
     */
    saveArchitecture(architecture: ArchitectureDesign, projectId?: string): Promise<string>;
    /**
     * Get architecture design by ID.
     *
     * @param architectureId
     */
    getArchitectureById(architectureId: string): Promise<ArchitectureDesign | null>;
    /**
     * Get architectures by project ID.
     *
     * @param projectId
     */
    getArchitecturesByProject(projectId: string): Promise<ArchitectureDesign[]>;
    /**
     * Get architectures by domain.
     *
     * @param domain
     */
    getArchitecturesByDomain(domain: string): Promise<ArchitectureDesign[]>;
    /**
     * Update existing architecture.
     *
     * @param architectureId
     * @param architecture
     */
    updateArchitecture(architectureId: string, architecture: ArchitectureDesign): Promise<void>;
    /**
     * Delete architecture by ID.
     *
     * @param architectureId
     */
    deleteArchitecture(architectureId: string): Promise<void>;
    /**
     * Save validation results.
     *
     * @param architectureId
     * @param validation
     * @param validationType
     */
    saveValidation(architectureId: string, validation: ArchitecturalValidation, validationType?: string): Promise<void>;
    /**
     * Get validation history for architecture.
     *
     * @param architectureId
     */
    getValidationHistory(architectureId: string): Promise<ArchitecturalValidation[]>;
    /**
     * Search architectures with criteria.
     *
     * @param criteria
     * @param criteria.domain
     * @param criteria.tags
     * @param criteria.minScore
     * @param criteria.limit
     */
    searchArchitectures(criteria: {
        domain?: string;
        tags?: string[];
        minScore?: number;
        limit?: number;
    }): Promise<ArchitectureDesign[]>;
    /**
     * Get architecture statistics.
     */
    getArchitectureStats(): Promise<{
        totalArchitectures: number;
        byDomain: Record<string, number>;
        averageComponents: number;
        validationStats: {
            totalValidated: number;
            averageScore: number;
            passRate: number;
        };
    }>;
    private saveComponents;
    private updateComponents;
    private recordToArchitecture;
    private generateArchitectureName;
    private extractDomain;
    private extractTags;
    private extractMetadata;
}
//# sourceMappingURL=architecture-storage.d.ts.map