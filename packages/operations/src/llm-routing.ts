/**
 * @fileoverview LLM Routing Strategic Facade - Real Package Delegation
 *
 * Strategic facade providing real LLM routing capabilities through delegation
 * to @claude-zen/llm-routing package.
 */

// LLM Routing system access with real package delegation
let llmRoutingModuleCache: any = null;

async function loadLLMRoutingModule() {
  if (!llmRoutingModuleCache) {
    try {
      // Use string-based dynamic import to avoid TypeScript compile-time resolution
      const packageName = '@claude-zen/llm-routing';
      llmRoutingModuleCache = await import(packageName);
    } catch {
      // LLM routing package not available, providing compatibility layer
      llmRoutingModuleCache = {
        LLM_PROVIDER_CONFIG: {},
        ROUTING_STRATEGY: {},
        getOptimalProvider: async () => await Promise.resolve({
          providerId: 'default',
          provider: 'compatibility',
        }),
        addProvider: async () => await Promise.resolve(),
        removeProvider: async () => await Promise.resolve(),
        updateProvider: async () => await Promise.resolve(),
        getProvider: async () => await Promise.resolve({
          id: 'default',
          name: 'Compatibility Provider',
        }),
        getProviderIds: async () => await Promise.resolve(['default']),
        getProvidersByCapability: async () => await Promise.resolve([]),
      };
    }
  }
  return llmRoutingModuleCache;
}

// ===============================================================================
// REAL LLM ROUTING PACKAGE EXPORTS - Direct delegation to actual implementations
// ===============================================================================

export const getLLMProviderConfig = async () => {
  const module = await loadLLMRoutingModule();
  return module.LLM_PROVIDER_CONFIG;
};

export const getRoutingStrategy = async () => {
  const module = await loadLLMRoutingModule();
  return module.ROUTING_STRATEGY;
};

export const getOptimalProvider = async (context?: any) => {
  const module = await loadLLMRoutingModule();
  return module.getOptimalProvider(context);
};

export const addProvider = async (config: any) => {
  const module = await loadLLMRoutingModule();
  return module.addProvider(config);
};

export const removeProvider = async (providerId: string) => {
  const module = await loadLLMRoutingModule();
  return module.removeProvider(providerId);
};

export const updateProvider = async (providerId: string, config: any) => {
  const module = await loadLLMRoutingModule();
  return module.updateProvider(providerId, config);
};

export const getProvider = async (providerId: string) => {
  const module = await loadLLMRoutingModule();
  return module.getProvider(providerId);
};

export const getProviderIds = async () => {
  const module = await loadLLMRoutingModule();
  return module.getProviderIds();
};

export const getProvidersByCapability = async (capability: string) => {
  const module = await loadLLMRoutingModule();
  return module.getProvidersByCapability(capability);
};

// Type declarations for compatibility
export interface ProviderConfig {
  id: string;
  name: string;
  capabilities?: string[];
  [key: string]: any;
}

export interface RoutingStrategy {
  algorithm: string;
  criteria?: string[];
  [key: string]: any;
}

export interface ProviderRoutingContext {
  request: any;
  providers: ProviderConfig[];
  [key: string]: any;
}
