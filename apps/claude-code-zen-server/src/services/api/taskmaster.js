/**
 * TaskMaster SAFe 6.0 API Routes
 *
 * REST API routes for TaskMaster workflow management.
 * Provides real-time SAFe flow metrics, task management, and PI Planning coordination.
 *
 * @file TaskMaster API routes for SAFe workflow management.
 */
// Direct package imports - no facades
import { TaskMaster } from '@claude-zen/coordination';
import { generateUUID, getLogger } from '@claude-zen/foundation';
import { Router } from 'express';
import { asyncHandler } from '../middleware/errors';
import { LogLevel, log } from '../middleware/logging';
const logger = getLogger('TaskMasterRoutes');
/**
 * TaskMaster system singleton with proper error handling
 */
class TaskMasterManager {
    taskMasterSystem = null;
    webSocketCoordinator;
    constructor(webSocketCoordinator) {
        this.webSocketCoordinator = webSocketCoordinator;
    }
    async getTaskMaster() {
        if (!this.taskMasterSystem) {
            try {
                this.taskMasterSystem = new TaskMaster({
                    enableSAFe: true,
                    enableWorkflowManagement: true,
                    enablePIPlanning: true,
                    enableRealTimeMetrics: true,
                    webSocketCoordinator: this.webSocketCoordinator,
                });
                logger.info('TaskMaster system initialized successfully');
            }
            catch (error) {
                logger.error('Failed to initialize TaskMaster system:', error);
                throw new Error(`TaskMaster system initialization failed: ${error.message}`);
            }
        }
        return this.taskMasterSystem;
    }
    async shutdown() {
        if (this.taskMasterSystem) {
            logger.info('Shutting down TaskMaster system');
            // Perform proper async cleanup
            await this.performSystemCleanup();
            this.taskMasterSystem = null;
        }
    }
    async performSystemCleanup() {
        try {
            // Cleanup database connections, websockets, and other resources
            if (this.webSocketCoordinator) {
                await this.webSocketCoordinator.broadcast('system:shutdown-initiated', {
                    timestamp: new Date().toISOString(),
                    message: 'TaskMaster system shutting down',
                });
            }
            logger.info('TaskMaster system cleanup completed');
        }
        catch (error) {
            logger.error('Error during TaskMaster cleanup:', error);
        }
    }
}
/**
 * Create TaskMaster API routes with modular handlers.
 */
export const createTaskMasterRoutes = (webSocketCoordinator) => {
    const router = Router();
    const taskMasterManager = new TaskMasterManager(webSocketCoordinator);
    // Setup route groups
    setupFlowMetricsRoutes(router, taskMasterManager);
    setupTaskManagementRoutes(router, taskMasterManager);
    setupPIPlanningRoutes(router, taskMasterManager);
    setupSystemHealthRoutes(router, taskMasterManager);
    setupDashboardRoutes(router, taskMasterManager);
    return router;
};
// =============================================================================
// HELPER FUNCTIONS FOR TASK MANAGEMENT
// =============================================================================
/**
 * Validate task creation input
 */
function validateTaskInput(data) {
    const { title, description, priority, estimatedEffort, assignedAgent } = data;
    const validationErrors = [];
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
        validationErrors.push('Title must be at least 3 characters');
    }
    if (!priority || !['low', 'medium', 'high', 'critical'].includes(priority)) {
        validationErrors.push('Priority must be one of: low, medium, high, critical');
    }
    if (!estimatedEffort ||
        typeof estimatedEffort !== 'number' ||
        estimatedEffort < 0.5) {
        validationErrors.push('Estimated effort must be a number >= 0.5 hours');
    }
    if (description && typeof description !== 'string') {
        validationErrors.push('Description must be a string');
    }
    if (assignedAgent && typeof assignedAgent !== 'string') {
        validationErrors.push('Assigned agent must be a string');
    }
    return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
    };
}
/**
 * Handle task creation with comprehensive SAFe metadata
 */
async function handleTaskCreation(taskMaster, taskData, req) {
    const taskId = generateUUID();
    const timestamp = new Date().toISOString();
    // Create comprehensive SAFe task
    const safeTaskData = {
        id: taskId,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        priority: taskData.priority,
        estimatedEffort: Math.round(taskData.estimatedEffort * 4) / 4, // Round to quarter hours
        assignedAgent: taskData.assignedAgent?.trim() || 'unassigned',
        status: 'backlog',
        createdAt: timestamp,
        updatedAt: timestamp,
        sprint: null,
        epic: null,
        storyPoints: Math.ceil(taskData.estimatedEffort * 2),
        acceptanceCriteria: [],
        dependencies: [],
        blockers: [],
        tags: [taskData.priority, 'new'],
        createdBy: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
    };
    // Use TaskMaster system to create the task
    const createdTask = await taskMaster.createTask(safeTaskData);
    log(LogLevel.INFO, `SAFe task created with ID: ${taskId}`);
    return createdTask;
}
/**
 * Constant for error messages to avoid duplication
 */
const TASK_ERROR_MESSAGES = {
    createFailed: 'Failed to create task',
    validationFailed: 'Validation failed',
    systemError: 'System error occurred',
    getTaskFailed: 'Failed to get task',
    getTasksByStateFailed: 'Failed to get tasks by state',
    moveTaskFailed: 'Failed to move task',
};
/**
 * Setup SAFe flow metrics routes
 */
function setupFlowMetricsRoutes(router, manager) {
    router.get('/metrics', asyncHandler(async (req, res) => {
        log(LogLevel.DEBUG, 'Getting SAFe flow metrics', req);
        try {
            const taskMaster = await manager.getTaskMaster();
            const [metrics, health] = await Promise.all([
                taskMaster.getFlowMetrics(),
                taskMaster.getSystemHealth(),
            ]);
            // Validate metrics data
            if (!metrics || typeof metrics.cycleTime !== 'number') {
                throw new Error('Invalid metrics data received from TaskMaster system');
            }
            res.json({
                success: true,
                data: {
                    metrics: {
                        cycleTime: Math.round(metrics.cycleTime * 100) / 100,
                        leadTime: Math.round(metrics.leadTime * 100) / 100,
                        throughput: metrics.throughput,
                        wipCount: metrics.wipCount,
                        blockedTasks: metrics.blockedTasks,
                        completedTasks: metrics.completedTasks,
                        efficiency: metrics.completedTasks > 0
                            ? Math.round((metrics.completedTasks /
                                (metrics.completedTasks + metrics.blockedTasks)) *
                                100)
                            : 0,
                    },
                    systemHealth: health,
                    calculatedAt: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
            });
            // Broadcast real-time metrics if WebSocket available
            if (manager.webSocketCoordinator) {
                manager.webSocketCoordinator.broadcast('metrics:updated', {
                    metrics,
                    health,
                });
            }
        }
        catch (error) {
            logger.error('Failed to get flow metrics:', error);
            log(LogLevel.ERROR, 'Failed to get flow metrics', req, {
                error: error.message,
                stack: error.stack,
            });
            res.status(500).json({
                success: false,
                error: 'Failed to get flow metrics',
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }));
}
/**
 * Handle task creation endpoint
 */
async function handleCreateTask(req, res, manager) {
    log(LogLevel.INFO, 'Creating new SAFe task', req);
    try {
        const taskMaster = await manager.getTaskMaster();
        const validation = validateTaskInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                error: TASK_ERROR_MESSAGES.validationFailed,
                details: validation.errors,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const task = await handleTaskCreation(taskMaster, req.body, req);
        // Broadcast real-time task creation
        if (manager.webSocketCoordinator) {
            manager.webSocketCoordinator.broadcast('task:created', task);
        }
        logger.info(`Task created: ${task.id} - ${task.title}`);
        res.status(201).json({
            success: true,
            data: task,
            message: 'Task created successfully',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error(`${TASK_ERROR_MESSAGES.createFailed}:`, error);
        log(LogLevel.ERROR, TASK_ERROR_MESSAGES.createFailed, req, {
            error: error.message,
            body: req.body,
        });
        res.status(500).json({
            success: false,
            error: TASK_ERROR_MESSAGES.createFailed,
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}
/**
 * Setup task management routes with modular handlers
 */
function setupTaskManagementRoutes(router, manager) {
    // Create task
    router.post('/tasks', asyncHandler(async (req, res) => {
        await handleCreateTask(req, res, manager);
    }));
    // Get task by ID
    router.get('/tasks/:taskId', asyncHandler(async (req, res) => {
        await handleGetTask(req, res, manager);
    }));
    // Move task
    router.put('/tasks/:taskId/move', asyncHandler(async (req, res) => {
        await handleMoveTask(req, res, manager);
    }));
    // Get tasks by state
    router.get('/tasks/state/:state', asyncHandler(async (req, res) => {
        await handleGetTasksByState(req, res, manager);
    }));
}
/**
 * Handle get task by ID endpoint
 */
async function handleGetTask(req, res, manager) {
    log(LogLevel.DEBUG, 'Getting task by ID', req);
    try {
        const taskMaster = await manager.getTaskMaster();
        const { taskId } = req.params;
        if (!taskId || typeof taskId !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Invalid task ID',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const task = await taskMaster.getTask(taskId);
        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Task not found',
                taskId,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        res.json({
            success: true,
            data: task,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error(`Failed to get task ${req.params.taskId}:`, error);
        log(LogLevel.ERROR, TASK_ERROR_MESSAGES.getTaskFailed, req, {
            error: error.message,
            taskId: req.params.taskId,
        });
        res.status(500).json({
            success: false,
            error: TASK_ERROR_MESSAGES.getTaskFailed,
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}
/**
 * Handle get tasks by state endpoint
 */
async function handleGetTasksByState(req, res, manager) {
    log(LogLevel.DEBUG, 'Getting tasks by state', req);
    try {
        const taskMaster = await manager.getTaskMaster();
        const { state } = req.params;
        if (!state ||
            ![
                'backlog',
                'analysis',
                'development',
                'testing',
                'review',
                'deployment',
                'done',
                'blocked',
            ].includes(state)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid state',
                validStates: [
                    'backlog',
                    'analysis',
                    'development',
                    'testing',
                    'review',
                    'deployment',
                    'done',
                    'blocked',
                ],
                timestamp: new Date().toISOString(),
            });
        }
        const tasks = await taskMaster.getTasksByState(state);
        // Calculate additional metrics for the state
        const totalEffort = tasks.reduce((sum, task) => sum + task.estimatedEffort, 0);
        const priorityCounts = tasks.reduce((counts, task) => {
            counts[task.priority] = (counts[task.priority] || 0) + 1;
            return counts;
        }, {});
        res.json({
            success: true,
            data: {
                state,
                tasks,
                count: tasks.length,
                totalEffort: Math.round(totalEffort * 4) / 4,
                priorityBreakdown: priorityCounts,
                averageEffort: tasks.length > 0
                    ? Math.round((totalEffort / tasks.length) * 4) / 4
                    : 0,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error(`Failed to get tasks by state ${req.params.state}:`, error);
        log(LogLevel.ERROR, TASK_ERROR_MESSAGES.getTasksByStateFailed, req, {
            error: error.message,
            state: req.params.state,
        });
        res.status(500).json({
            success: false,
            error: TASK_ERROR_MESSAGES.getTasksByStateFailed,
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}
/**
 * Validate move task input parameters
 */
function validateMoveTaskInputs(taskId, toState) {
    if (!taskId || typeof taskId !== 'string') {
        return {
            status: 400,
            response: {
                success: false,
                error: 'Invalid task ID',
                timestamp: new Date().toISOString(),
            },
        };
    }
    if (!toState ||
        ![
            'backlog',
            'analysis',
            'development',
            'testing',
            'review',
            'deployment',
            'done',
            'blocked',
        ].includes(toState)) {
        return {
            status: 400,
            response: {
                success: false,
                error: 'Invalid target state',
                validStates: [
                    'backlog',
                    'analysis',
                    'development',
                    'testing',
                    'review',
                    'deployment',
                    'done',
                    'blocked',
                ],
                timestamp: new Date().toISOString(),
            },
        };
    }
    return null;
}
/**
 * Validate task transition rules
 */
async function validateTaskTransition(taskMaster, taskId, currentTask, toState) {
    const isValidTransition = await taskMaster.validateTaskTransition(taskId, currentTask.state, toState);
    if (!isValidTransition) {
        return {
            status: 422,
            response: {
                success: false,
                error: 'Invalid state transition',
                currentState: currentTask.state,
                targetState: toState,
                message: 'This transition is not allowed by SAFe workflow rules',
                timestamp: new Date().toISOString(),
            },
        };
    }
    return null;
}
/**
 * Validate WIP limits
 */
async function validateWIPLimits(taskMaster, toState) {
    const wipLimits = await taskMaster.calculateWIPLimits(toState);
    if (wipLimits.available <= 0 && toState !== 'done' && toState !== 'blocked') {
        return {
            status: 422,
            response: {
                success: false,
                error: 'WIP limit exceeded',
                wipStatus: wipLimits,
                message: `Cannot move task to ${toState}. WIP limit reached (${wipLimits.current}/${wipLimits.limit})`,
                timestamp: new Date().toISOString(),
            },
            wipStatus: wipLimits,
        };
    }
    return null;
}
/**
 * Broadcast task move event
 */
function broadcastTaskMove(manager, moveData) {
    if (manager.webSocketCoordinator) {
        manager.webSocketCoordinator.broadcast('task:moved', {
            taskId: moveData.taskId,
            fromState: moveData.fromState,
            toState: moveData.toState,
            reason: moveData.reason || 'No reason provided',
            movedAt: new Date().toISOString(),
        });
    }
}
/**
 * Handle move task error response
 */
function handleMoveTaskError(req, res, error) {
    logger.error(`Failed to move task ${req.params.taskId}:`, error);
    log(LogLevel.ERROR, TASK_ERROR_MESSAGES.moveTaskFailed, req, {
        error: error.message,
        taskId: req.params.taskId,
        body: req.body,
    });
    res.status(500).json({
        success: false,
        error: TASK_ERROR_MESSAGES.moveTaskFailed,
        message: error.message,
        timestamp: new Date().toISOString(),
    });
}
/**
 * Handle move task endpoint
 */
async function handleMoveTask(req, res, manager) {
    log(LogLevel.INFO, 'Moving task through workflow', req);
    try {
        const taskMaster = await manager.getTaskMaster();
        const { taskId } = req.params;
        const { toState, reason } = req.body;
        // Validate inputs
        const validationResult = validateMoveTaskInputs(taskId, toState);
        if (validationResult) {
            return res
                .status(validationResult.status)
                .json(validationResult.response);
        }
        // Get current task
        const currentTask = await taskMaster.getTask(taskId);
        if (!currentTask) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                taskId,
                timestamp: new Date().toISOString(),
            });
        }
        // Validate transition and WIP limits
        const transitionResult = await validateTaskTransition(taskMaster, taskId, currentTask, toState);
        if (transitionResult) {
            return res
                .status(transitionResult.status)
                .json(transitionResult.response);
        }
        const wipResult = await validateWIPLimits(taskMaster, toState);
        if (wipResult) {
            return res.status(wipResult.status).json(wipResult.response);
        }
        // Move the task
        const result = await taskMaster.moveTask(taskId, toState);
        if (!result) {
            return res.status(422).json({
                success: false,
                error: TASK_ERROR_MESSAGES.moveTaskFailed,
                message: 'Task state change was rejected by the system',
                timestamp: new Date().toISOString(),
            });
        }
        // Broadcast and respond
        broadcastTaskMove(manager, {
            taskId,
            fromState: currentTask.state,
            toState,
            reason,
        });
        logger.info(`Task ${taskId} moved from ${currentTask.state} to ${toState}`);
        res.json({
            success: true,
            message: `Task moved to ${toState}`,
            data: {
                taskId,
                fromState: currentTask.state,
                toState,
                wipStatus: wipResult?.wipStatus,
                movedAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        handleMoveTaskError(req, res, error);
    }
}
// PI Planning event creation handler
// Validation helper for PI Planning event data
function validatePIPlanningEventData(body) {
    const validationErrors = [];
    const { planningIntervalNumber, artId, startDate, endDate, facilitator } = body;
    if (!planningIntervalNumber ||
        typeof planningIntervalNumber !== 'number' ||
        planningIntervalNumber < 1) {
        validationErrors.push('Planning interval number must be a positive number');
    }
    if (!artId || typeof artId !== 'string' || artId.trim().length < 3) {
        validationErrors.push('ART ID must be at least 3 characters');
    }
    if (!startDate || !Date.parse(startDate)) {
        validationErrors.push('Start date must be a valid ISO date');
    }
    if (!endDate || !Date.parse(endDate)) {
        validationErrors.push('End date must be a valid ISO date');
    }
    if (!facilitator ||
        typeof facilitator !== 'string' ||
        facilitator.trim().length < 2) {
        validationErrors.push('Facilitator name must be at least 2 characters');
    }
    if (startDate &&
        endDate &&
        Date.parse(startDate) >= Date.parse(endDate)) {
        validationErrors.push('End date must be after start date');
    }
    return validationErrors;
}
// Error response helper
function sendValidationError(res, errors) {
    res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
        timestamp: new Date().toISOString(),
    });
}
// Success response helper
function sendPIEventSuccess(res, piEvent) {
    res.status(201).json({
        success: true,
        data: piEvent,
        message: 'PI Planning event created successfully',
        timestamp: new Date().toISOString(),
    });
}
// Error handling helper
function handlePIEventError(req, res, error) {
    logger.error('Failed to create PI Planning event:', error);
    log(LogLevel.ERROR, 'Failed to create PI Planning event', req, {
        error: error.message,
        body: req.body,
    });
    res.status(500).json({
        success: false,
        error: 'Failed to create PI Planning event',
        message: error.message,
        timestamp: new Date().toISOString(),
    });
}
async function createPIPlanningEventHandler(req, res, manager) {
    log(LogLevel.INFO, 'Creating PI Planning event', req);
    try {
        const validationErrors = validatePIPlanningEventData(req.body);
        if (validationErrors.length > 0) {
            sendValidationError(res, validationErrors);
            return;
        }
        const taskMaster = await manager.getTaskMaster();
        const { planningIntervalNumber, artId, startDate, endDate, facilitator } = req.body;
        const piEvent = await taskMaster.createPIPlanningEvent({
            planningIntervalNumber,
            artId: artId.trim(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            facilitator: facilitator.trim(),
        });
        logger.info(`PI Planning event created: PI ${planningIntervalNumber} for ART ${artId}`);
        sendPIEventSuccess(res, piEvent);
    }
    catch (error) {
        handlePIEventError(req, res, error);
    }
}
// Setup PI Planning routes
function setupPIPlanningRoutes(router, manager) {
    router.post('/pi-planning', asyncHandler((req, res) => createPIPlanningEventHandler(req, res, manager)));
}
/**
 * Setup system health routes
 */
function setupSystemHealthRoutes(router, manager) {
    router.get('/health', asyncHandler(async (req, res) => {
        log(LogLevel.DEBUG, 'Getting TaskMaster health status', req);
        try {
            const taskMaster = await manager.getTaskMaster();
            const health = await taskMaster.getSystemHealth();
            // Comprehensive health assessment
            const status = health.overallHealth > 0.9
                ? 'healthy'
                : health.overallHealth > 0.8
                    ? 'warning'
                    : health.overallHealth > 0.6
                        ? 'degraded'
                        : 'unhealthy';
            const healthDetails = {
                status,
                overallHealth: Math.round(health.overallHealth * 1000) / 1000,
                databaseHealth: Math.round(health.databaseHealth * 1000) / 1000,
                apiHealth: Math.round(health.apiHealth * 1000) / 1000,
                queueHealth: Math.round(health.queueHealth * 1000) / 1000,
                lastUpdated: health.lastUpdated,
                systemUptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString(),
            };
            // Set appropriate HTTP status based on health
            const httpStatus = status === 'unhealthy' ? 503 : status === 'degraded' ? 207 : 200;
            res.status(httpStatus).json({
                success: true,
                data: healthDetails,
            });
        }
        catch (error) {
            logger.error('Failed to get system health:', error);
            log(LogLevel.ERROR, 'Failed to get system health', req, {
                error: error.message,
            });
            res.status(503).json({
                success: false,
                error: 'Failed to get system health',
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }));
}
// Calculate task state metrics
async function calculateStateMetrics(states, taskMaster) {
    const tasksByState = {};
    const stateMetrics = {};
    // Parallel task fetching by state
    const taskPromises = states.map(async (state) => {
        const tasks = await taskMaster.getTasksByState(state);
        tasksByState[state] = tasks;
        const totalEffort = tasks.reduce((sum, task) => sum + task.estimatedEffort, 0);
        stateMetrics[state] = {
            count: tasks.length,
            totalEffort: Math.round(totalEffort * 4) / 4,
            avgEffort: tasks.length > 0
                ? Math.round((totalEffort / tasks.length) * 4) / 4
                : 0,
        };
    });
    await Promise.all(taskPromises);
    return { tasksByState, stateMetrics };
}
// Dashboard data handler
async function createDashboardDataHandler(req, res, manager) {
    log(LogLevel.DEBUG, 'Getting TaskMaster dashboard data', req);
    try {
        const taskMaster = await manager.getTaskMaster();
        // Parallel data fetching for performance
        const [metrics, health] = await Promise.all([
            taskMaster.getFlowMetrics(),
            taskMaster.getSystemHealth(),
        ]);
        // Get comprehensive task state data
        const states = [
            'backlog',
            'analysis',
            'development',
            'testing',
            'review',
            'deployment',
            'done',
            'blocked',
        ];
        const { tasksByState, stateMetrics } = await calculateStateMetrics(states, taskMaster);
        // Calculate dashboard insights
        const totalTasks = Object.values(tasksByState).flat().length;
        const completedTasks = tasksByState.done.length;
        const blockedTasks = tasksByState.blocked.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const blockedRate = totalTasks > 0 ? Math.round((blockedTasks / totalTasks) * 100) : 0;
        res.json({
            success: true,
            data: {
                metrics: {
                    ...metrics,
                    completionRate,
                    blockedRate,
                    totalTasks,
                    activeStates: states.filter((state) => tasksByState[state].length > 0),
                },
                health,
                tasksByState,
                stateMetrics,
                states,
                insights: {
                    bottlenecks: states.filter((state) => tasksByState[state].length > 5),
                    highPriorityBlocked: tasksByState.blocked.filter((task) => task.priority === 'high' || task.priority === 'critical').length,
                    avgCycleTime: metrics.cycleTime,
                    throughputTrend: 'stable', // Would be calculated from historical data
                },
                timestamp: new Date().toISOString(),
                realTimeEnabled: !!manager.webSocketCoordinator,
            },
        });
    }
    catch (error) {
        logger.error('Failed to get dashboard data:', error);
        log(LogLevel.ERROR, 'Failed to get dashboard data', req, {
            error: error.message,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard data',
            timestamp: new Date().toISOString(),
        });
    }
}
/**
 * Setup comprehensive dashboard routes
 */
function setupDashboardRoutes(router, manager) {
    router.get('/dashboard', asyncHandler(async (req, res) => {
        await createDashboardDataHandler(req, res, manager);
    }));
}
export async function getTaskMasterService() {
    const taskMaster = new TaskMaster();
    return {
        initialize: async () => {
            if (taskMaster && taskMaster.initialize) {
                await taskMaster.initialize();
            }
        },
        shutdown: async () => {
            if (taskMaster && typeof taskMaster.shutdown === 'function') {
                await taskMaster.shutdown();
            }
        },
        getStatus: () => 'ready',
        createTask: async (taskData) => {
            if (taskMaster && typeof taskMaster.createTask === 'function') {
                return await taskMaster.createTask(taskData);
            }
            return { success: false, message: 'createTask not available' };
        },
        moveTask: async (taskId, newStatus) => {
            if (taskMaster && typeof taskMaster.moveTask === 'function') {
                return await taskMaster.moveTask(taskId, newStatus);
            }
            return false;
        },
        getFlowMetrics: async () => {
            if (taskMaster &&
                typeof taskMaster.getFlowMetrics === 'function') {
                return await taskMaster.getFlowMetrics();
            }
            return {
                cycleTime: 0,
                leadTime: 0,
                throughput: 0,
                wipCount: 0,
                blockedTasks: 0,
                completedTasks: 0,
            };
        },
        createPIPlanningEvent: async (eventData) => {
            if (taskMaster &&
                typeof taskMaster.createPIPlanningEvent === 'function') {
                return await taskMaster.createPIPlanningEvent(eventData);
            }
            return { success: false, message: 'createPIPlanningEvent not available' };
        },
    };
}
