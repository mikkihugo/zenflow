export { ConversationMCPTools, ConversationMCPToolsFactory, } from './mcp-tools.ts';
export { ConversationMemoryFactory, ConversationMemoryImpl } from './memory.ts';
export { ConversationOrchestratorImpl } from './orchestrator.ts';
export * from './types.ts';
export class ConversationFramework {
    static async create(config = {}) {
        const { memoryBackend = 'json', memoryConfig = {} } = config;
        let memory;
        switch (memoryBackend) {
            case 'sqlite': {
                const { ConversationMemoryFactory: SQLiteFactory } = await import('./memory.ts');
                memory = await SQLiteFactory.createWithSQLite(memoryConfig);
                break;
            }
            case 'lancedb': {
                const { ConversationMemoryFactory: LanceFactory } = await import('./memory.ts');
                memory = await LanceFactory.createWithLanceDB(memoryConfig);
                break;
            }
            default: {
                const { ConversationMemoryFactory: JSONFactory } = await import('./memory.ts');
                memory = await JSONFactory.createWithJSON(memoryConfig);
            }
        }
        const { ConversationOrchestratorImpl } = await import('./orchestrator.ts');
        const orchestrator = new ConversationOrchestratorImpl(memory);
        const { ConversationMCPTools } = await import('./mcp-tools.ts');
        const mcpTools = new ConversationMCPTools(orchestrator);
        return {
            orchestrator,
            memory,
            mcpTools,
        };
    }
    static getAvailablePatterns() {
        return [
            'code-review',
            'problem-solving',
            'brainstorming',
            'planning',
            'debugging',
            'architecture-review',
            'sprint-planning',
            'retrospective',
        ];
    }
    static getCapabilities() {
        return [
            'multi-agent-conversations',
            'structured-dialogue-patterns',
            'conversation-memory',
            'outcome-tracking',
            'consensus-building',
            'role-based-participation',
            'workflow-orchestration',
            'moderation-support',
            'learning-from-conversations',
            'mcp-integration',
        ];
    }
    static validateConfig(config) {
        const errors = [];
        if (!config?.title || typeof config?.title !== 'string') {
            errors.push('Title is required and must be a string');
        }
        if (!config?.pattern || typeof config?.pattern !== 'string') {
            errors.push('Pattern is required and must be a string');
        }
        if (!config?.goal || typeof config?.goal !== 'string') {
            errors.push('Goal is required and must be a string');
        }
        if (!config?.domain || typeof config?.domain !== 'string') {
            errors.push('Domain is required and must be a string');
        }
        if (!Array.isArray(config?.participants) ||
            config?.participants.length === 0) {
            errors.push('At least one participant is required');
        }
        if (config?.participants) {
            config?.participants?.forEach((participant, index) => {
                if (!(participant.id && participant.type && participant.swarmId)) {
                    errors.push(`Participant ${index} missing required fields (id, type, swarmId)`);
                }
            });
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
export default ConversationFramework;
//# sourceMappingURL=index.js.map