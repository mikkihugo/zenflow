/**
 * Database-SPARC Bridge.
 *
 * Connects the database-driven product flow with SPARC swarm coordination.
 *
 * Flow:
 * 1. DatabaseDrivenSystem generates Features/Tasks
 * 2. DatabaseSPARCBridge receives assignments
 * 3. SPARCSwarmCoordinator processes using SPARC methodology
 * 4. Results are stored back in database.
 */
/**
 * @file Coordination system: database-sparc-bridge.
 */
import { EventEmitter } from 'node:events';
import type { DatabaseDrivenSystem } from '../core/database-driven-system';
import type { FeatureDocumentEntity, TaskDocumentEntity } from '../database/entities/product-entities';
import type { DocumentManager } from "../services/document/document-service";
import type { SPARCSwarmCoordinator } from './swarm/core/sparc-swarm-coordinator';
export interface WorkAssignment {
    id: string;
    type: 'feature' | 'task';
    document: FeatureDocumentEntity | TaskDocumentEntity;
    assignedTo: 'sparc-swarm';
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: Date;
    requirements: string[];
    context: {
        projectId: string;
        parentDocumentId?: string;
        relatedDocuments: string[];
    };
}
export interface ImplementationResult {
    workAssignmentId: string;
    sparcTaskId: string;
    status: 'completed' | 'failed' | 'partial';
    artifacts: {
        specification: string[];
        pseudocode: string[];
        architecture: string[];
        implementation: string[];
        tests: string[];
        documentation: string[];
    };
    metrics: {
        totalTimeMs: number;
        phaseTimes: Record<string, number>;
        agentsUsed: string[];
        qualityScore: number;
    };
    completionReport: string;
}
/**
 * Bridge between Database-Driven Product Flow and SPARC Swarm Coordination.
 *
 * @example
 */
declare class DatabaseSPARCBridge extends EventEmitter {
    private databaseSystem;
    private documentService;
    private sparcSwarm;
    private activeAssignments;
    private completedWork;
    constructor(databaseSystem: DatabaseDrivenSystem, documentService: DocumentManager, sparcSwarm: SPARCSwarmCoordinator);
    /**
     * Initialize the bridge and establish connections.
     */
    initialize(): Promise<void>;
    /**
     * Assign a Feature to SPARC swarm for implementation.
     *
     * @param feature
     */
    assignFeatureToSparcs(feature: FeatureDocumentEntity): Promise<string>;
    /**
     * Assign a Task to SPARC swarm for implementation.
     *
     * @param task
     */
    assignTaskToSparcs(task: TaskDocumentEntity): Promise<string>;
    /**
     * Get status of all active work assignments.
     */
    getWorkStatus(): Promise<{
        active: WorkAssignment[];
        completed: ImplementationResult[];
        metrics: {
            totalAssignments: number;
            completedAssignments: number;
            averageCompletionTime: number;
            successRate: number;
        };
    }>;
    /**
     * Process completion of SPARC work and update database.
     *
     * @param sparcTask
     */
    private handleSPARCCompletion;
    /**
     * Update the original document with SPARC implementation results.
     *
     * @param assignment
     * @param result
     */
    private updateDocumentWithResults;
    /**
     * Extract artifacts from completed SPARC task.
     *
     * @param sparcTask
     */
    private extractArtifacts;
    /**
     * Calculate metrics from SPARC task execution.
     *
     * @param sparcTask
     */
    private calculateMetrics;
    /**
     * Generate completion report.
     *
     * @param sparcTask
     */
    private generateCompletionReport;
    /**
     * Setup event handlers for database system.
     */
    private setupDatabaseListeners;
    /**
     * Setup event handlers for SPARC swarm.
     */
    private setupSPARCListeners;
    private setupEventHandlers;
    /**
     * Determine if a document should be auto-assigned to SPARC swarm.
     *
     * @param document
     */
    private shouldAutoAssignToSparc;
    /**
     * Map document priority to work assignment priority.
     *
     * @param priority
     */
    private mapPriority;
    /**
     * Get bridge status and metrics.
     */
    getStatus(): {
        bridgeStatus: 'active' | 'inactive';
        activeAssignments: number;
        completedWork: number;
        sparcSwarmStatus: string;
        databaseConnection: boolean;
    };
}
export { DatabaseSPARCBridge };
//# sourceMappingURL=database-sparc-bridge.d.ts.map