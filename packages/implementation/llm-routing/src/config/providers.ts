/**
 * @fileoverview LLM Provider Configuration
 *
 * Centralized configuration for all LLM providers including models,
 * rate limits, context sizes, and routing strategies. This configuration
 * supports intelligent routing decisions, cost optimization, and reliability
 * through sophisticated fallback mechanisms.
 */

import type {
  ProviderConfig,
  ProviderRoutingContext,
  RoutingStrategy,
} from '../types/index';

export const LLM_PROVIDER_CONFIG: Record<string, ProviderConfig> = {
  'github-models': {'
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
    displayName: 'GitHub Copilot (GPT-5)',
    models: [
      'gpt-5',
      'o3',
      'o3-mini',
      'o4-mini',
      'gpt-4.1',
      'gpt-4o',
      'gpt-4',
      'claude-opus-4',
      'claude-sonnet-4',
      'claude-3.5-sonnet',
      'gemini-2.5-pro',
      'gpt-3.5-turbo',
    ],
    defaultModel: 'gpt-5',
    maxContextTokens: 1000000, // Maximum context window for advanced models
    maxOutputTokens: 16384, // Standard output limit for chat completions
    rateLimits: {
      requestsPerMinute: 60, // OAuth token limits
      tokensPerMinute: 100000,
      cooldownMinutes: 30, // Conservative cooldown
    },
    api: {
      baseUrl: 'https://api.githubcopilot.com',
      tokenPath: '~/.claude-zen/copilot-token.json',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'claude-code-zen/1.0',
        'Copilot-Integration-Id': 'vscode-chat',
      },
      authType: 'bearer',
    },
    features: {
      structuredOutput: true,
      fileOperations: false,
      codebaseAware: false,
      streaming: true,
    },
    routing: {
      priority: 1, // Highest priority - GPT-5 as primary
      useForSmallContext: true, // GPT-5 excellent for all contexts
      useForLargeContext: true, // 400K context handles everything
      fallbackOrder: 0, // First choice for all tasks
    },
  },

  'claude-code': {'
    name: 'claude-code',
    displayName: 'Claude Code CLI',
    models: ['sonnet', 'haiku'],
    defaultModel: 'sonnet',
    maxContextTokens: 200000, // Claude's large context'
    maxOutputTokens: 8000,
    features: {
      structuredOutput: true,
      fileOperations: true, // Can read/write files directly
      codebaseAware: true, // Best codebase understanding
      streaming: false,
    },
    routing: {
      priority: 2, // Claude Code as fallback
      useForSmallContext: true,
      useForLargeContext: true, // Excellent for codebase analysis
      fallbackOrder: 1, // Fallback after Copilot GPT-5
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

  'gemini-direct': {'
    name: 'gemini-direct',
    displayName: 'Gemini 2.5 Flash (Main)',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.5-flash', // Main workhorse model'
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

  'gemini-pro': {'
    name: 'gemini-pro',
    displayName: 'Gemini 2.5 Pro (Complex)',
    models: ['gemini-2.5-pro', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.5-pro', // High complexity only'
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
      useForSmallContext: false, // Don't use for regular tasks'
      useForLargeContext: false, // Only for high complexity
      fallbackOrder: 4, // Special use, not in regular rotation
    },
  },
};

/**
 * Routing Strategy Configuration
 */
export const ROUTING_STRATEGY: RoutingStrategy = {
  // Context size thresholds for routing decisions
  SMALL_CONTEXT_THRESHOLD: 10000, // < 10K chars = small context
  LARGE_CONTEXT_THRESHOLD: 100000, // > 100K chars = very large context

  // Provider selection strategy
  STRATEGY: 'smart',

  // Automatic failover settings
  AUTO_FAILOVER: true,
  MAX_RETRIES_PER_PROVIDER: 2,

  // Context-based routing rules
  RULES: {
    // Regular tasks: Copilot GPT-5 → GitHub Models → Gemini 2.5 Flash → Claude Code
    smallContext: ['copilot', 'github-models', 'gemini-direct', 'claude-code'],

    // All contexts: Copilot GPT-5 is the primary workhorse
    largeContext: [
      'copilot',
      'github-models',
      'gemini-direct',
      'claude-code',
      'gemini',
    ],

    // File operations: Use CLI providers only
    fileOperations: ['claude-code', 'gemini'],

    // Code analysis: Copilot GPT-5 primary, Claude Code fallback
    codeAnalysis: [
      'copilot',
      'claude-code',
      'github-models',
      'gemini-direct',
      'gemini-pro',
    ],

    // Complex reasoning: Copilot GPT-5 primary
    complexReasoning: ['copilot', 'gemini-pro', 'claude-code'],

    // JSON responses: All providers support structured output
    structuredOutput: [
      'copilot',
      'github-models',
      'gemini-direct',
      'gemini-pro',
      'claude-code',
      'gemini',
    ],
  },
};

/**
 * Check if provider meets context size requirements
 */
function meetsContextSizeRequirements(
  config: ProviderConfig,
  isSmallContext: boolean,
  isLargeContext: boolean,
): boolean {
  if (isSmallContext) {
    return config.routing.useForSmallContext;
  }
  if (isLargeContext) {
    return config.routing.useForLargeContext;
  }
  return true; // Medium context
}

/**
 * Check if provider meets feature requirements
 */
function meetsFeatureRequirements(
  config: ProviderConfig,
  context: ProviderRoutingContext,
): boolean {
  const { requiresFileOps, requiresCodebaseAware, requiresStructuredOutput } = context;

  return (
    (!requiresFileOps || config.features.fileOperations) &&
    (!requiresCodebaseAware || config.features.codebaseAware) &&
    (!requiresStructuredOutput || config.features.structuredOutput)
  );
}

/**
 * Sort providers by priority and fallback order
 */
function sortProvidersByPriority(candidates: string[]): string[] {
  return candidates.sort((a, b) => {
    const configA = LLM_PROVIDER_CONFIG[a];
    const configB = LLM_PROVIDER_CONFIG[b];

    // Primary sort: priority (lower number = higher priority)
    if (configA.routing.priority !== configB.routing.priority) {
      return configA.routing.priority - configB.routing.priority;
    }

    // Secondary sort: fallback order
    return configA.routing.fallbackOrder - configB.routing.fallbackOrder;
  });
}

/**
 * Get optimal provider for a given context and requirements
 */
export function getOptimalProvider(context: ProviderRoutingContext): string[] {
  const { contentLength } = context;
  const estimatedTokens = Math.ceil(contentLength / 4);

  // Special routing for very large contexts
  if (estimatedTokens > 150000) {
    return ['gemini', 'claude-code'];'
  }

  // Determine context size category
  const isSmallContext = contentLength < ROUTING_STRATEGY.SMALL_CONTEXT_THRESHOLD;
  const isLargeContext = contentLength > ROUTING_STRATEGY.LARGE_CONTEXT_THRESHOLD;

  // Get available providers based on requirements
  const candidates: string[] = [];

  for (const [providerId, config] of Object.entries(LLM_PROVIDER_CONFIG)) {
    const canHandleTokens = estimatedTokens <= config.maxContextTokens;
    const meetsContextRequirements = meetsContextSizeRequirements(config, isSmallContext, isLargeContext);
    const meetsFeatures = meetsFeatureRequirements(config, context);

    if (canHandleTokens && meetsContextRequirements && meetsFeatures) {
      candidates.push(providerId);
    }
  }

  return sortProvidersByPriority(candidates);
}

/**
 * Add new provider to configuration
 */
export function addProvider(providerId: string, config: ProviderConfig): void {
  LLM_PROVIDER_CONFIG[providerId] = config;
}

/**
 * Remove provider from configuration
 */
export function removeProvider(providerId: string): boolean {
  if (providerId in LLM_PROVIDER_CONFIG) {
    delete LLM_PROVIDER_CONFIG[providerId];
    return true;
  }
  return false;
}

/**
 * Update provider configuration
 */
export function updateProvider(
  providerId: string,
  updates: Partial<ProviderConfig>,
): boolean {
  if (providerId in LLM_PROVIDER_CONFIG) {
    LLM_PROVIDER_CONFIG[providerId] = {
      ...LLM_PROVIDER_CONFIG[providerId],
      ...updates,
    };
    return true;
  }
  return false;
}

/**
 * Get provider configuration
 */
export function getProvider(providerId: string): ProviderConfig|undefined {
  return LLM_PROVIDER_CONFIG[providerId];
}

/**
 * List all provider IDs
 */
export function getProviderIds(): string[] {
  return Object.keys(LLM_PROVIDER_CONFIG);
}

/**
 * Get providers by capability
 */
export function getProvidersByCapability(
  capability: keyof ProviderConfig['features'],
): string[] {
  return Object.entries(LLM_PROVIDER_CONFIG)
    .filter(([, config]) => config.features[capability])
    .map(([providerId]) => providerId);
}
