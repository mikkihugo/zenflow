/**
 * @fileoverview Database Integration - TaskMaster to Main App Connection
 *
 * Integrates existing database schemas with the TaskMaster workflow engine.
 * Uses existing migration schemas and connects to main app database system.
 */
import type { ApprovalRecord, WorkflowTask } from '../types/index';
export declare class TaskMasterDatabaseIntegration {
    private database;
    constructor();
    /**
     * Initialize database connection using existing infrastructure facade
     */
    initialize(): Promise<void>;
    /**
     * Save workflow task using existing schema
     */
    saveTask(task: WorkflowTask): Promise<void>;
    /**
     * Save approval record
     */
    saveApprovalRecord(record: ApprovalRecord): Promise<void>;
}
//# sourceMappingURL=database-integration.d.ts.map