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
    priority: number; // 1 = highest priority
    useForSmallContext: boolean; // < 10K tokens
    useForLargeContext: boolean; // > 10K tokens
    fallbackOrder: number;
  };
}

export const LLM_PROVIDER_CONFIG: Record<string, ProviderConfig> = {
  'github-models': {
    name: 'github-models',
    displayName: 'GitHub Models (GPT-5)',
    models: ['openai/gpt-5', 'openai/gpt-4o', 'mistralai/codestral'],
    defaultModel: 'openai/gpt-5',
    maxContextTokens: 4000, // GPT-5 input limit
    maxOutputTokens: 128000, // GPT-5 output limit
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
      priority: 2, // Lower priority than Copilot
      useForSmallContext: true, // Best for small, focused tasks
      useForLargeContext: false, // Input limit too small for large contexts
      fallbackOrder: 2, // Use after Copilot
    },
  },

  copilot: {
    name: 'copilot',
    displayName: 'GitHub Copilot (Enterprise)',
    models: ['gpt-4.1', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4.1',
    maxContextTokens: 200000, // GitHub Copilot's 200K context window
    maxOutputTokens: 16000, // Higher output limit for enterprise
    rateLimits: {
      requestsPerMinute: 300, // Enterprise account - high limits
      tokensPerMinute: 200000,
      cooldownMinutes: 10, // Shorter cooldown for enterprise
    },
    features: {
      structuredOutput: true,
      fileOperations: false,
      codebaseAware: false,
      streaming: true,
    },
    routing: {
      priority: 1, // High priority due to large context + enterprise
      useForSmallContext: true, // Can handle any size efficiently
      useForLargeContext: true, // Excellent for large contexts with 200K limit
      fallbackOrder: 1, // Prefer over GitHub Models for large contexts
    },
  },

  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code CLI',
    models: ['sonnet', 'haiku'],
    defaultModel: 'sonnet',
    maxContextTokens: 200000, // Claude's large context
    maxOutputTokens: 8000,
    features: {
      structuredOutput: true,
      fileOperations: true, // Can read/write files directly
      codebaseAware: true, // Best codebase understanding
      streaming: false,
    },
    routing: {
      priority: 1,
      useForSmallContext: true,
      useForLargeContext: true, // Excellent for codebase analysis
      fallbackOrder: 0, // First preference when available
    },
  },

  gemini: {
    name: 'gemini',
    displayName: 'Gemini CLI',
    models: ['gemini-pro', 'gemini-flash'],
    defaultModel: 'gemini-pro',
    maxContextTokens: 1000000, // Very large context
    maxOutputTokens: 8000,
    rateLimits: {
      requestsPerMinute: 15, // Conservative rate limits
      tokensPerMinute: 32000,
      cooldownMinutes: 60, // Long cooldown after rate limit
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
      fallbackOrder: 3, // Last resort due to rate limits
    },
  },

  'gemini-direct': {
    name: 'gemini-direct',
    displayName: 'Gemini 2.5 Flash (Main)',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.5-flash', // Main workhorse model
    maxContextTokens: 1000000, // 1M context window
    maxOutputTokens: 8192,
    rateLimits: {
      requestsPerMinute: 60, // Higher limits with OAuth/API key
      tokensPerMinute: 100000,
      cooldownMinutes: 30, // Shorter cooldown than CLI
    },
    features: {
      structuredOutput: true,
      fileOperations: false, // Direct API, no file operations
      codebaseAware: false, // No CLI context
      streaming: true, // Real-time streaming support
    },
    routing: {
      priority: 2, // High priority - main model
      useForSmallContext: true, // Use for all regular tasks
      useForLargeContext: true, // 1M context handles everything
      fallbackOrder: 1, // Primary after GitHub Models
    },
  },

  'gemini-pro': {
    name: 'gemini-pro',
    displayName: 'Gemini 2.5 Pro (Complex)',
    models: ['gemini-2.5-pro', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.5-pro', // High complexity only
    maxContextTokens: 1000000, // 1M context window
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
      priority: 4, // Lower priority - special use only
      useForSmallContext: false, // Don't use for regular tasks
      useForLargeContext: false, // Only for high complexity
      fallbackOrder: 4, // Special use, not in regular rotation
    },
  },
};

/**
 * Routing Strategy Configuration
 */
export const ROUTING_STRATEGY = {
  // Context size thresholds for routing decisions
  SMALL_CONTEXT_THRESHOLD: 10000, // < 10K chars = small context
  LARGE_CONTEXT_THRESHOLD: 100000, // > 100K chars = very large context

  // Provider selection strategy
  STRATEGY: 'smart' as 'smart' | 'fallback' | 'round-robin',

  // Automatic failover settings
  AUTO_FAILOVER: true,
  MAX_RETRIES_PER_PROVIDER: 2,

  // Context-based routing rules
  RULES: {
    // Regular tasks: GitHub Models (free) → Gemini 2.5 Flash (main) → Copilot
    smallContext: ['github-models', 'gemini-direct', 'copilot', 'claude-code'],

    // All contexts: Gemini 2.5 Flash is the main workhorse after GitHub Models
    largeContext: [
      'github-models',
      'gemini-direct',
      'copilot',
      'claude-code',
      'gemini',
    ],

    // File operations: Use CLI providers only
    fileOperations: ['claude-code', 'gemini'],

    // Code analysis: Gemini 2.5 Flash main, Pro for complex reasoning
    codeAnalysis: [
      'github-models',
      'gemini-direct',
      'gemini-pro',
      'copilot',
      'claude-code',
    ],

    // Complex reasoning: Use Pro model specifically
    complexReasoning: ['gemini-pro', 'copilot', 'claude-code'],

    // JSON responses: All providers support structured output
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

/**
 * Get optimal provider for a given context and requirements
 */
export function getOptimalProvider(context: {
  contentLength: number;
  requiresFileOps: boolean;
  requiresCodebaseAware: boolean;
  requiresStructuredOutput: boolean;
  taskType: 'analysis' | 'generation' | 'review' | 'custom';
}): string[] {
  const {
    contentLength,
    requiresFileOps,
    requiresCodebaseAware,
    requiresStructuredOutput,
  } = context;

  // Determine context size category
  const isSmallContext =
    contentLength < ROUTING_STRATEGY.SMALL_CONTEXT_THRESHOLD;
  const isLargeContext =
    contentLength > ROUTING_STRATEGY.LARGE_CONTEXT_THRESHOLD;
  const estimatedTokens = Math.ceil(contentLength / 4); // Rough estimation

  // Special routing for very large contexts
  if (estimatedTokens > 150000) {
    // Only Gemini and Claude Code can handle > 150K tokens
    return ['gemini', 'claude-code'];
  }

  // Get available providers based on requirements
  const candidates: string[] = [];

  // Filter by context size capabilities and token limits
  for (const [providerId, config] of Object.entries(LLM_PROVIDER_CONFIG)) {
    const canHandleTokens = estimatedTokens <= config.maxContextTokens;

    const meetsContextRequirements =
      (isSmallContext && config.routing.useForSmallContext) ||
      (isLargeContext && config.routing.useForLargeContext) ||
      !(isSmallContext || isLargeContext); // Medium context

    const meetsFeatureRequirements =
      (!requiresFileOps || config.features.fileOperations) &&
      (!requiresCodebaseAware || config.features.codebaseAware) &&
      (!requiresStructuredOutput || config.features.structuredOutput);

    if (
      canHandleTokens &&
      meetsContextRequirements &&
      meetsFeatureRequirements
    ) {
      candidates.push(providerId);
    }
  }

  // Sort by priority and fallback order
  candidates.sort((a, b) => {
    const configA = LLM_PROVIDER_CONFIG[a];
    const configB = LLM_PROVIDER_CONFIG[b];

    // Primary sort: priority (lower number = higher priority)
    if (configA.routing.priority !== configB.routing.priority) {
      return configA.routing.priority - configB.routing.priority;
    }

    // Secondary sort: fallback order
    return configA.routing.fallbackOrder - configB.routing.fallbackOrder;
  });

  return candidates;
}

/**
 * Export default configuration for easy import
 */
export default {
  providers: LLM_PROVIDER_CONFIG,
  routing: ROUTING_STRATEGY,
  getOptimalProvider,
};
