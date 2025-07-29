/**
 * Multi-LLM Provider Architecture - Main Export
 * Comprehensive AI provider management system
 */

// Core types and interfaces
export * from './types.js';

// Base provider implementation
export { BaseProvider } from './base-provider.js';

// Provider implementations
export { AnthropicProvider } from './anthropic.js';
export { OpenAIProvider } from './openai.js';
export { CohereProvider } from './cohere.js';
export { GoogleProvider } from './google.js';
export { OllamaProvider } from './ollama.js';

// Provider manager
export { ProviderManager } from './provider-manager.js';

// Utilities
export * from './utils.js';

// Quick start function for easy initialization
export async function createProviderManager(configs: Record<string, any> = {}) {
  const { ProviderManager } = await import('./provider-manager.js');
  
  const manager = new ProviderManager(configs.manager);
  await manager.initializeBuiltInProviders(configs.providers || {});
  
  return manager;
}

// Provider factory for dynamic loading
export async function createProvider(
  name: string, 
  config: any
): Promise<import('./types.js').BaseProvider> {
  switch (name.toLowerCase()) {
    case 'anthropic':
      const { AnthropicProvider } = await import('./anthropic.js');
      const anthropic = new AnthropicProvider();
      await anthropic.initialize(config);
      return anthropic;

    case 'openai':
      const { OpenAIProvider } = await import('./openai.js');
      const openai = new OpenAIProvider();
      await openai.initialize(config);
      return openai;

    case 'cohere':
      const { CohereProvider } = await import('./cohere.js');
      const cohere = new CohereProvider();
      await cohere.initialize(config);
      return cohere;

    case 'google':
      const { GoogleProvider } = await import('./google.js');
      const google = new GoogleProvider();
      await google.initialize(config);
      return google;

    case 'ollama':
      const { OllamaProvider } = await import('./ollama.js');
      const ollama = new OllamaProvider();
      await ollama.initialize(config);
      return ollama;

    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

// Configuration helpers
export const PROVIDER_DEFAULTS = {
  anthropic: {
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229'
    ],
    contextWindow: 200000,
    maxTokens: 4096,
    pricing: {
      inputTokenPrice: 0.003,
      outputTokenPrice: 0.015
    }
  },
  
  openai: {
    models: [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo'
    ],
    contextWindow: 128000,
    maxTokens: 4096,
    pricing: {
      inputTokenPrice: 0.01,
      outputTokenPrice: 0.03
    }
  },
  
  cohere: {
    models: [
      'command-r-plus',
      'command-r',
      'command'
    ],
    contextWindow: 128000,
    maxTokens: 4000,
    pricing: {
      inputTokenPrice: 0.0015,
      outputTokenPrice: 0.002
    }
  },
  
  google: {
    models: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ],
    contextWindow: 1000000,
    maxTokens: 8192,
    pricing: {
      inputTokenPrice: 0.00125,
      outputTokenPrice: 0.00375
    }
  },
  
  ollama: {
    models: [], // Dynamic based on installed models
    contextWindow: 32000,
    maxTokens: 4096,
    pricing: {
      inputTokenPrice: 0,
      outputTokenPrice: 0
    }
  }
};

// Load balancing strategies
export const LOAD_BALANCING_STRATEGIES = {
  ROUND_ROBIN: { type: 'round_robin' as const },
  LEAST_LATENCY: { type: 'least_latency' as const },
  LEAST_COST: { type: 'least_cost' as const },
  WEIGHTED: (weights: Record<string, number>) => ({ 
    type: 'weighted' as const, 
    weights 
  }),
  PRIORITY: (priorities: Record<string, number>) => ({ 
    type: 'priority' as const, 
    priorities 
  })
};

// Common configurations
export const COMMON_CONFIGS = {
  DEVELOPMENT: {
    manager: {
      loadBalancing: LOAD_BALANCING_STRATEGIES.ROUND_ROBIN,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableFallback: true,
      globalTimeout: 30000
    },
    providers: {
      anthropic: { priority: 1, enabled: true },
      openai: { priority: 2, enabled: true },
      ollama: { priority: 3, enabled: true }
    }
  },
  
  PRODUCTION: {
    manager: {
      loadBalancing: LOAD_BALANCING_STRATEGIES.LEAST_LATENCY,
      enableCaching: true,
      cacheTimeout: 3600000, // 1 hour
      enableFallback: true,
      globalTimeout: 45000,
      circuitBreakerThreshold: 0.3,
      healthCheckInterval: 300000
    },
    providers: {
      anthropic: { priority: 1, enabled: true, retryAttempts: 3 },
      openai: { priority: 2, enabled: true, retryAttempts: 3 },
      cohere: { priority: 3, enabled: true, retryAttempts: 2 },
      google: { priority: 4, enabled: false, retryAttempts: 2 }
    }
  },
  
  HIGH_THROUGHPUT: {
    manager: {
      loadBalancing: LOAD_BALANCING_STRATEGIES.WEIGHTED({
        anthropic: 0.4,
        openai: 0.4,
        cohere: 0.2
      }),
      enableCaching: true,
      cacheTimeout: 1800000, // 30 minutes
      enableFallback: true,
      globalTimeout: 20000,
      circuitBreakerThreshold: 0.5
    },
    providers: {
      anthropic: { priority: 1, enabled: true, retryAttempts: 2 },
      openai: { priority: 1, enabled: true, retryAttempts: 2 },
      cohere: { priority: 2, enabled: true, retryAttempts: 2 }
    }
  }
};

// Usage example and documentation
export const USAGE_EXAMPLE = `
// Quick start
import { createProviderManager, COMMON_CONFIGS } from './providers/index.js';

const manager = await createProviderManager({
  ...COMMON_CONFIGS.PRODUCTION,
  providers: {
    anthropic: { 
      apiKey: process.env.ANTHROPIC_API_KEY,
      enabled: true 
    },
    openai: { 
      apiKey: process.env.OPENAI_API_KEY,
      enabled: true 
    }
  }
});

// Generate text
const response = await manager.generateText({
  id: 'req_123',
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'user', content: 'Hello, world!' }
  ]
});

// Stream text
for await (const chunk of manager.generateStream({
  id: 'req_124',
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'user', content: 'Tell me a story' }
  ]
})) {
  process.stdout.write(chunk);
}

// Get status
const statuses = await manager.getProviderStatuses();
console.log(statuses);
`;

console.log('Multi-LLM Provider Architecture loaded successfully');
console.log('Available providers: Anthropic, OpenAI, Cohere, Google, Ollama');
console.log('Features: Load balancing, failover, caching, circuit breakers, metrics');