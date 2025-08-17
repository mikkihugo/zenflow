/**
 * LLM Provider Configuration
 *
 * Centralized configuration for all LLM providers including models,
 * rate limits, context sizes, and routing strategies.
 */
export interface ProviderConfig {
    name: string;
    displayName: string;
    models: string[];
    defaultModel: string;
    maxContextTokens: number;
    maxOutputTokens: number;
    rateLimits?: {
        requestsPerMinute?: number;
        tokensPerMinute?: number;
        cooldownMinutes?: number;
    };
    features: {
        structuredOutput: boolean;
        fileOperations: boolean;
        codebaseAware: boolean;
        streaming: boolean;
    };
    routing: {
        priority: number;
        useForSmallContext: boolean;
        useForLargeContext: boolean;
        fallbackOrder: number;
    };
}
export declare const LLM_PROVIDER_CONFIG: Record<string, ProviderConfig>;
/**
 * Routing Strategy Configuration
 */
export declare const ROUTING_STRATEGY: {
    SMALL_CONTEXT_THRESHOLD: number;
    LARGE_CONTEXT_THRESHOLD: number;
    STRATEGY: "smart" | "fallback" | "round-robin";
    AUTO_FAILOVER: boolean;
    MAX_RETRIES_PER_PROVIDER: number;
    RULES: {
        smallContext: string[];
        largeContext: string[];
        fileOperations: string[];
        codeAnalysis: string[];
        complexReasoning: string[];
        structuredOutput: string[];
    };
};
/**
 * Get optimal provider for a given context and requirements
 */
export declare function getOptimalProvider(context: {
    contentLength: number;
    requiresFileOps: boolean;
    requiresCodebaseAware: boolean;
    requiresStructuredOutput: boolean;
    taskType: 'analysis' | 'generation' | 'review' | 'custom';
}): string[];
/**
 * Export default configuration for easy import
 */
declare const _default: {
    providers: Record<string, ProviderConfig>;
    routing: {
        SMALL_CONTEXT_THRESHOLD: number;
        LARGE_CONTEXT_THRESHOLD: number;
        STRATEGY: "smart" | "fallback" | "round-robin";
        AUTO_FAILOVER: boolean;
        MAX_RETRIES_PER_PROVIDER: number;
        RULES: {
            smallContext: string[];
            largeContext: string[];
            fileOperations: string[];
            codeAnalysis: string[];
            complexReasoning: string[];
            structuredOutput: string[];
        };
    };
    getOptimalProvider: typeof getOptimalProvider;
};
export default _default;
//# sourceMappingURL=llm-providers.config.d.ts.map