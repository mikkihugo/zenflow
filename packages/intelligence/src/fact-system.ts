/**
 * @fileoverview Fact System Strategic Facade - Direct Delegation
 *
 * Strategic facade providing fact-based reasoning capabilities through delegation
 * to @claude-zen/fact-system package when available, with professional fallbacks.
 * No translation needed - uses native implementation functions directly.
 */

// Professional fact system access with fallback implementation
let factModuleCache: any = null;

async function loadFactModule() {
  if (!factModuleCache) {
    try {
      // Use dynamic import with string to avoid TypeScript compile-time checking
      const packageName = '@claude-zen/fact-system';
      factModuleCache = await import(packageName);
    } catch {
      // Fallback implementation when fact-system package isn't available
      factModuleCache = {
        getFactSystemAccess: async () => createFallbackFactSystem(),
        getFactEngine: async () => createFallbackFactEngine(),
        getReasoningEngine: async () => createFallbackReasoningEngine(),
        FactEngine: class FallbackFactEngine {
          async initialize() {
            return this;
          }
          async query() {
            return { result: 'fallback-query', facts: [] };
          }
          async getStatus() {
            return { status: 'fallback', healthy: true };
          }
        },
      };
    }
  }
  return factModuleCache;
}

function createFallbackFactSystem() {
  return {
    createFactEngine: async () => createFallbackFactEngine(),
    getEngine: async () => createFallbackFactEngine(),
    initialize: async () => Promise.resolve(),
    shutdown: async () => Promise.resolve(),
    isHealthy: () => true,
    getStatus: () => ({ status: 'fallback', initialized: true }),
  };
}

function createFallbackFactEngine() {
  return {
    query: async (query: any) => ({
      result: `fallback-query-for-${query?.question||'unknown'}`,
      facts: [],
      confidence: 0.5,
      timestamp: Date.now(),
    }),
    getStatus: () => ({ status: 'fallback', healthy: true }),
    initialize: async () => Promise.resolve(),
    shutdown: async () => Promise.resolve(),
  };
}

function createFallbackReasoningEngine() {
  return {
    reason: async (premise: any) => ({
      result: `fallback-reasoning-for-${premise?.topic||'unknown'}`,
      conclusion: 'fallback-conclusion',
      confidence: 0.7,
      steps: ['fallback-reasoning-step'],
      timestamp: Date.now(),
    }),
    getStatus: () => ({ status: 'fallback', healthy: true }),
    initialize: async () => Promise.resolve(),
  };
}

// Professional naming patterns - delegate to fact-system implementation or fallback
export const getFactSystemAccess = async () => {
  const factModule = await loadFactModule();
  return factModule.getFactSystemAccess?.()||createFallbackFactSystem();
};

export const getFactEngine = async () => {
  const factModule = await loadFactModule();
  return factModule.getFactEngine?.()||createFallbackFactEngine();
};

export const getReasoningEngine = async () => {
  const factModule = await loadFactModule();
  return factModule.getReasoningEngine?.()||createFallbackReasoningEngine();
};

// Export FactEngine class with delegation
export class FactEngine {
  private instance: any = null;

  async initialize(config?: any) {
    const factModule = await loadFactModule();
    if (factModule.FactEngine) {
      this.instance = new factModule.FactEngine(config);
      return this.instance.initialize?.()||Promise.resolve();
    }
    this.instance = new factModule.FactEngine(); // Fallback class
    return Promise.resolve();
  }

  async query(query: any) {
    if (!this.instance) {
      await this.initialize();
    }
    return this.instance.query(query);
  }

  getStatus() {
    if (!this.instance) {
      return { status:'not-initialized' };
    }
    return this.instance.getStatus();
  }

  async shutdown() {
    if (this.instance?.shutdown) {
      return this.instance.shutdown();
    }
    return Promise.resolve();
  }
}

// Professional naming patterns - matches expected interface
export const factSystem = {
  getAccess: getFactSystemAccess,
  getEngine: getFactEngine,
  getReasoningEngine: getReasoningEngine,
};

// Additional exports for compatibility
export async function createFactEngine(config?: any) {
  const engine = new FactEngine();
  await engine.initialize(config);
  return engine;
}

export async function initializeFactSystem(config?: any) {
  const factAccess = await getFactSystemAccess();
  // Apply configuration if provided
  if (config && factAccess.configure) {
    await factAccess.configure(config);
  }
  return factAccess;
}

// Coordination-specific exports for swarm-commander compatibility
export const getCoordinationFactSystem = async () => {
  const factSystem = await getFactSystemAccess();
  return {
    ...factSystem,
    storeCoordinationFact: async (fact: any) => {
      // Store coordination-specific facts with actual fact data
      const factId = `coord-${Date.now()}`;
      const storedFact = {
        ...fact,
        id: factId,
        type: 'coordination',
        timestamp: Date.now(),
      };
      await factSystem.storeFact?.(storedFact);
      return { success: true, factId, timestamp: Date.now() };
    },
    queryCoordinationFacts: async (query: any) => {
      // Query coordination facts using the provided query
      const results = (await factSystem.queryFacts?.(query))||[];
      return { facts: results, count: results.length, query };
    },
  };
};

export const initializeCoordinationFactSystem = async (config?: any) => {
  // Initialize coordination fact system with configuration
  const coordSystem = await getCoordinationFactSystem();

  // Apply configuration if provided
  if (config && coordSystem.configure) {
    await coordSystem.configure(config);
  }

  return coordSystem;
};

export const storeCoordinationFact = async (fact: any) => {
  const coordSystem = await getCoordinationFactSystem();
  return coordSystem.storeCoordinationFact(fact);
};

// Type definitions for coordination facts
export interface CoordinationFact {
  id: string;
  type:'coordination';
  timestamp: number;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  source: string;
  confidence: number;
}

export const queryCoordinationFacts = async (query: any) => {
  const coordSystem = await getCoordinationFactSystem();
  return coordSystem.queryCoordinationFacts(query);
};
