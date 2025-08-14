export class AgentAPI {
    static async listAgents(_params) {
        throw new Error('Not implemented');
    }
    static async createAgent(_request) {
        throw new Error('Not implemented');
    }
    static async getAgent(_agentId) {
        throw new Error('Not implemented');
    }
    static async removeAgent(_agentId) {
        throw new Error('Not implemented');
    }
}
export class TaskAPI {
    static async createTask(_request) {
        throw new Error('Not implemented');
    }
    static async getTask(_taskId) {
        throw new Error('Not implemented');
    }
}
export class SwarmAPI {
    static async getConfig() {
        throw new Error('Not implemented');
    }
    static async updateConfig(_config) {
        throw new Error('Not implemented');
    }
}
export class HealthAPI {
    static async getHealth() {
        throw new Error('Not implemented');
    }
    static async getMetrics(_timeRange) {
        throw new Error('Not implemented');
    }
}
export class APIErrorHandler {
    static createError(code, message, details, traceId) {
        const error = {
            code,
            message,
            timestamp: new Date(),
        };
        if (details !== undefined) {
            error.details = details;
        }
        if (traceId !== undefined) {
            error.traceId = traceId;
        }
        return error;
    }
    static handleError(error, traceId) {
        if (error instanceof Error) {
            return APIErrorHandler.createError('INTERNAL_ERROR', error.message, { stack: error.stack }, traceId);
        }
        return APIErrorHandler.createError('INTERNAL_ERROR', 'Unknown error occurred', { error }, traceId);
    }
}
export const CoordinationAPI = {
    agents: AgentAPI,
    tasks: TaskAPI,
    swarm: SwarmAPI,
    health: HealthAPI,
    errors: APIErrorHandler,
};
//# sourceMappingURL=api.js.map