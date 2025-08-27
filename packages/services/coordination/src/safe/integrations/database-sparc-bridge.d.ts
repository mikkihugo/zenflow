/**
 * Database-SPARC Bridge - SAFe 6.0 Integration
 *
 * Connects the database-driven SAFe flow with SPARC SAFe 6.0 Development Manager coordination.
 *
 * Flow:
 * 1. DatabaseDrivenSystem generates Features/Capabilities
 * 2. DatabaseSPARCBridge receives assignments
 * 3. Safe6DevelopmentManager processes using SAFe 6.0 + SPARC methodology
 * 4. Results are stored back in database with flow metrics
 *
 * Uses Strategic Facades for:
 * - @claude-zen/enterprise (SAFe framework access)
 * - @claude-zen/infrastructure (database access)
 * - @claude-zen/development (SPARC access)
 *
 * @package @claude-zen/safe-framework
 * @version 6.0.0 - SAFe 6.0 Flow-Based Implementation
 * @author Claude Code Zen Team
 */
import { EventBus } from '@claude-zen/foundation';
interface FeatureDocumentEntity {
    id: string;
    title: string;
    description: string;
    priority?: string;
    acceptance_criteria?: string[];
    project_id?: string;
    parent_document_id?: string;
    related_documents?: string[];
}
interface TaskDocumentEntity {
    id: string;
    title: string;
    description: string;
    featureId: string;
    priority?: string;
    implementation_details?: {
        files_to_create?: string[];
    };
    project_id?: string;
    parent_document_id?: string;
    related_documents?: string[];
}
interface DocumentManager {
    getDocument(id: string): Promise<any>;
    updateDocument(id: string, data: any): Promise<any>;
}
interface SPARCSwarmCoordinator {
    processFeatureWithSPARC(feature: FeatureDocumentEntity): Promise<any>;
    processTaskWithSPARC(task: TaskDocumentEntity): Promise<any>;
    getSPARCMetrics(): any;
    initialize(): Promise<void>;
    on(event: string, handler: Function): void;
}
interface DatabaseDrivenSystem {
    initialize(): Promise<void>;
    on(event: string, handler: Function): void;
}
export interface WorkAssignment {
    id: string;
    type: 'feature|task;;
    document: FeatureDocumentEntity | 'TaskDocumentEntity;';
    assignedTo: 'sparc-swarm;;
    priority: 'low|medium|high|critical;;
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
export declare class DatabaseSPARCBridge extends EventBus {
    private sparcSwarm;
    private logger;
    constructor(databaseSystem: DatabaseDrivenSystem, documentService: DocumentManager, sparcSwarm: SPARCSwarmCoordinator, logger?: Logger);
}
export default DatabaseSPARCBridge;
//# sourceMappingURL=database-sparc-bridge.d.ts.map