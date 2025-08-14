export const LLM_PROVIDER_CONFIG = {
    'github-models': {
        name: 'github-models',
        displayName: 'GitHub Models (GPT-5)',
        models: ['openai/gpt-5', 'openai/gpt-4o', 'mistralai/codestral'],
        defaultModel: 'openai/gpt-5',
        maxContextTokens: 4000,
        maxOutputTokens: 128000,
        rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 50000,
            cooldownMinutes: 60,
        },
        features: {
            structuredOutput: true,
            fileOperations: false,
            codebaseAware: false,
            streaming: false,
        },
        routing: {
            priority: 2,
            useForSmallContext: true,
            useForLargeContext: false,
            fallbackOrder: 2,
        },
    },
    copilot: {
        name: 'copilot',
        displayName: 'GitHub Copilot (Enterprise)',
        models: ['gpt-4.1', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4.1',
        maxContextTokens: 200000,
        maxOutputTokens: 16000,
        rateLimits: {
            requestsPerMinute: 300,
            tokensPerMinute: 200000,
            cooldownMinutes: 10,
        },
        features: {
            structuredOutput: true,
            fileOperations: false,
            codebaseAware: false,
            streaming: true,
        },
        routing: {
            priority: 1,
            useForSmallContext: true,
            useForLargeContext: true,
            fallbackOrder: 1,
        },
    },
    'claude-code': {
        name: 'claude-code',
        displayName: 'Claude Code CLI',
        models: ['sonnet', 'haiku'],
        defaultModel: 'sonnet',
        maxContextTokens: 200000,
        maxOutputTokens: 8000,
        features: {
            structuredOutput: true,
            fileOperations: true,
            codebaseAware: true,
            streaming: false,
        },
        routing: {
            priority: 1,
            useForSmallContext: true,
            useForLargeContext: true,
            fallbackOrder: 0,
        },
    },
    gemini: {
        name: 'gemini',
        displayName: 'Gemini CLI',
        models: ['gemini-pro', 'gemini-flash'],
        defaultModel: 'gemini-pro',
        maxContextTokens: 1000000,
        maxOutputTokens: 8000,
        rateLimits: {
            requestsPerMinute: 15,
            tokensPerMinute: 32000,
            cooldownMinutes: 60,
        },
        features: {
            structuredOutput: true,
            fileOperations: true,
            codebaseAware: true,
            streaming: false,
        },
        routing: {
            priority: 4,
            useForSmallContext: false,
            useForLargeContext: true,
            fallbackOrder: 3,
        },
    },
    'gemini-direct': {
        name: 'gemini-direct',
        displayName: 'Gemini 2.5 Flash (Main)',
        models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'],
        defaultModel: 'gemini-2.5-flash',
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 100000,
            cooldownMinutes: 30,
        },
        features: {
            structuredOutput: true,
            fileOperations: false,
            codebaseAware: false,
            streaming: true,
        },
        routing: {
            priority: 2,
            useForSmallContext: true,
            useForLargeContext: true,
            fallbackOrder: 1,
        },
    },
    'gemini-pro': {
        name: 'gemini-pro',
        displayName: 'Gemini 2.5 Pro (Complex)',
        models: ['gemini-2.5-pro', 'gemini-1.5-pro'],
        defaultModel: 'gemini-2.5-pro',
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 100000,
            cooldownMinutes: 30,
        },
        features: {
            structuredOutput: true,
            fileOperations: false,
            codebaseAware: false,
            streaming: true,
        },
        routing: {
            priority: 4,
            useForSmallContext: false,
            useForLargeContext: false,
            fallbackOrder: 4,
        },
    },
};
export const ROUTING_STRATEGY = {
    SMALL_CONTEXT_THRESHOLD: 10000,
    LARGE_CONTEXT_THRESHOLD: 100000,
    STRATEGY: 'smart',
    AUTO_FAILOVER: true,
    MAX_RETRIES_PER_PROVIDER: 2,
    RULES: {
        smallContext: ['github-models', 'gemini-direct', 'copilot', 'claude-code'],
        largeContext: [
            'github-models',
            'gemini-direct',
            'copilot',
            'claude-code',
            'gemini',
        ],
        fileOperations: ['claude-code', 'gemini'],
        codeAnalysis: [
            'github-models',
            'gemini-direct',
            'gemini-pro',
            'copilot',
            'claude-code',
        ],
        complexReasoning: ['gemini-pro', 'copilot', 'claude-code'],
        structuredOutput: [
            'github-models',
            'gemini-direct',
            'gemini-pro',
            'copilot',
            'claude-code',
            'gemini',
        ],
    },
};
export function getOptimalProvider(context) {
    const { contentLength, requiresFileOps, requiresCodebaseAware, requiresStructuredOutput, } = context;
    const isSmallContext = contentLength < ROUTING_STRATEGY.SMALL_CONTEXT_THRESHOLD;
    const isLargeContext = contentLength > ROUTING_STRATEGY.LARGE_CONTEXT_THRESHOLD;
    const estimatedTokens = Math.ceil(contentLength / 4);
    if (estimatedTokens > 150000) {
        return ['gemini', 'claude-code'];
    }
    const candidates = [];
    for (const [providerId, config] of Object.entries(LLM_PROVIDER_CONFIG)) {
        const canHandleTokens = estimatedTokens <= config.maxContextTokens;
        const meetsContextRequirements = (isSmallContext && config.routing.useForSmallContext) ||
            (isLargeContext && config.routing.useForLargeContext) ||
            !(isSmallContext || isLargeContext);
        const meetsFeatureRequirements = (!requiresFileOps || config.features.fileOperations) &&
            (!requiresCodebaseAware || config.features.codebaseAware) &&
            (!requiresStructuredOutput || config.features.structuredOutput);
        if (canHandleTokens &&
            meetsContextRequirements &&
            meetsFeatureRequirements) {
            candidates.push(providerId);
        }
    }
    candidates.sort((a, b) => {
        const configA = LLM_PROVIDER_CONFIG[a];
        const configB = LLM_PROVIDER_CONFIG[b];
        if (configA.routing.priority !== configB.routing.priority) {
            return configA.routing.priority - configB.routing.priority;
        }
        return configA.routing.fallbackOrder - configB.routing.fallbackOrder;
    });
    return candidates;
}
export default {
    providers: LLM_PROVIDER_CONFIG,
    routing: ROUTING_STRATEGY,
    getOptimalProvider,
};
//# sourceMappingURL=llm-providers.config.js.map