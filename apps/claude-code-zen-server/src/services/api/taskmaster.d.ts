/**
 * TaskMaster SAFe 6.0 API Routes
 *
 * REST API routes for TaskMaster workflow management.
 * Provides real-time SAFe flow metrics, task management, and PI Planning coordination.
 *
 * @file TaskMaster API routes for SAFe workflow management.
 */
import { Router } from 'express';
import type { WebSocketCoordinator } from '../../infrastructure/websocket/socket.coordinator';
/**
 * Create TaskMaster API routes with modular handlers.
 */
export declare const createTaskMasterRoutes: (webSocketCoordinator?: WebSocketCoordinator) => Router;
export interface TaskMasterService {
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getStatus(): string;
    createTask?(taskData: unknown): Promise<unknown>;
    moveTask?(taskId: string, newStatus: string): Promise<unknown>;
    getFlowMetrics?(): Promise<unknown>;
    createPIPlanningEvent?(eventData: unknown): Promise<unknown>;
}
export declare function getTaskMasterService(): Promise<TaskMasterService>;
//# sourceMappingURL=taskmaster.d.ts.map