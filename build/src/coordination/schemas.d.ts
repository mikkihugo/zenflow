/**
 * Coordination Domain - OpenAPI 3 Schemas.
 *
 * Comprehensive schema definitions for Swagger autodoc generation.
 * Following Google API Design Guide standards.
 *
 * @file OpenAPI 3.0 compatible schemas for coordination domain.
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - id
 *         - type
 *         - status
 *         - capabilities
 *       properties:
 *         id:
 *           type: string
 *           pattern: '^[a-z]+-[0-9a-z]+-[0-9a-z]+$'
 *           description: Unique agent identifier
 *           example: "researcher-1a2b3c-4d5e6f"
 *         type:
 *           type: string
 *           enum: [researcher, coder, analyst, tester, coordinator]
 *           description: Agent type/role in the swarm
 *         status:
 *           type: string
 *           enum: [idle, busy, error, offline]
 *           description: Current agent status
 *         capabilities:
 *           type: array
 *           items:
 *             type: string
 *           description: List of agent capabilities
 *           example: ["code_analysis", "test_generation", "documentation"]
 *         created:
 *           type: string
 *           format: date-time
 *           description: Agent creation timestamp
 *         lastHeartbeat:
 *           type: string
 *           format: date-time
 *           description: Last heartbeat timestamp
 *         taskCount:
 *           type: integer
 *           minimum: 0
 *           description: Number of assigned tasks
 *         workload:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Current workload percentage
 *
 *     SwarmConfig:
 *       type: object
 *       required:
 *         - topology
 *         - maxAgents
 *       properties:
 *         topology:
 *           type: string
 *           enum: [mesh, hierarchical, ring, star]
 *           description: Swarm network topology
 *         maxAgents:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: Maximum agents in swarm
 *         strategy:
 *           type: string
 *           enum: [balanced, specialized, adaptive, performance]
 *           description: Coordination strategy
 *         adaptiveThreshold:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Threshold for adaptive topology switching
 *
 *     Task:
 *       type: object
 *       required:
 *         - id
 *         - type
 *         - priority
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           pattern: '^task-[a-z]+-[0-9a-z]+-[0-9a-z]+$'
 *           description: Unique task identifier
 *         type:
 *           type: string
 *           description: Task type/category
 *         priority:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Task priority (0=lowest, 100=highest)
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Task description
 *         assignedAgent:
 *           type: string
 *           description: ID of assigned agent
 *         status:
 *           type: string
 *           enum: [pending, assigned, in_progress, completed, failed]
 *           description: Current task status
 *         created:
 *           type: string
 *           format: date-time
 *         deadline:
 *           type: string
 *           format: date-time
 *         result:
 *           type: object
 *           description: Task execution result
 *         error:
 *           $ref: '#/components/schemas/Error'
 *
 *     Error:
 *       type: object
 *       required:
 *         - code
 *         - message
 *       properties:
 *         code:
 *           type: string
 *           enum: [
 *             AGENT_NOT_FOUND,
 *             TASK_TIMEOUT,
 *             INVALID_CONFIG,
 *             SWARM_FULL,
 *             COORDINATION_FAILED,
 *             INTERNAL_ERROR
 *           ]
 *           description: Error code for programmatic handling
 *         message:
 *           type: string
 *           description: Human-readable error message
 *         details:
 *           type: object
 *           description: Additional error context
 *         timestamp:
 *           type: string
 *           format: date-time
 *         traceId:
 *           type: string
 *           description: Request trace ID for debugging
 *
 *     HealthStatus:
 *       type: object
 *       required:
 *         - status
 *         - timestamp
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, degraded, unhealthy]
 *           description: Overall system health
 *         timestamp:
 *           type: string
 *           format: date-time
 *         components:
 *           type: object
 *           properties:
 *             coordination:
 *               type: string
 *               enum: [healthy, degraded, unhealthy]
 *             agents:
 *               type: string
 *               enum: [healthy, degraded, unhealthy]
 *             swarm:
 *               type: string
 *               enum: [healthy, degraded, unhealthy]
 *         metrics:
 *           $ref: '#/components/schemas/PerformanceMetrics'
 *
 *     PerformanceMetrics:
 *       type: object
 *       properties:
 *         activeAgents:
 *           type: integer
 *           minimum: 0
 *         completedTasks:
 *           type: integer
 *           minimum: 0
 *         averageTaskTime:
 *           type: number
 *           minimum: 0
 *           description: Average task completion time in milliseconds
 *         throughput:
 *           type: number
 *           minimum: 0
 *           description: Tasks per second
 *         errorRate:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Error rate (0-1)
 *         memoryUsage:
 *           type: number
 *           minimum: 0
 *           description: Memory usage in MB
 *         cpuUsage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: CPU usage percentage
 */
export interface Agent {
    readonly id: string;
    readonly type: 'researcher' | 'coder' | 'analyst' | 'tester' | 'coordinator';
    status: 'idle' | 'busy' | 'error' | 'offline';
    readonly capabilities: readonly string[];
    readonly created: Date;
    lastHeartbeat: Date;
    taskCount: number;
    workload: number;
}
export interface SwarmConfig {
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    maxAgents: number;
    strategy?: 'balanced' | 'specialized' | 'adaptive' | 'performance';
    adaptiveThreshold?: number;
}
export interface Task {
    readonly id: string;
    readonly type: string;
    readonly priority: number;
    readonly description: string;
    assignedAgent?: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
    readonly created: Date;
    deadline?: Date;
    result?: unknown;
    error?: CoordinationError;
}
export interface CoordinationError {
    readonly code: 'AGENT_NOT_FOUND' | 'TASK_TIMEOUT' | 'INVALID_CONFIG' | 'SWARM_FULL' | 'COORDINATION_FAILED' | 'INTERNAL_ERROR';
    readonly message: string;
    readonly details?: Record<string, unknown>;
    readonly timestamp: Date;
    readonly traceId?: string;
}
export interface HealthStatus {
    readonly status: 'healthy' | 'degraded' | 'unhealthy';
    readonly timestamp: Date;
    readonly components: {
        readonly coordination: 'healthy' | 'degraded' | 'unhealthy';
        readonly agents: 'healthy' | 'degraded' | 'unhealthy';
        readonly swarm: 'healthy' | 'degraded' | 'unhealthy';
    };
    readonly metrics: PerformanceMetrics;
}
export interface PerformanceMetrics {
    readonly activeAgents: number;
    readonly completedTasks: number;
    readonly averageTaskTime: number;
    readonly throughput: number;
    readonly errorRate: number;
    readonly memoryUsage: number;
    readonly cpuUsage: number;
}
export declare const SchemaValidators: {
    readonly isValidAgentId: (id: string) => boolean;
    readonly isValidTaskId: (id: string) => boolean;
    readonly isValidPriority: (priority: number) => boolean;
    readonly isValidWorkload: (workload: number) => boolean;
};
//# sourceMappingURL=schemas.d.ts.map