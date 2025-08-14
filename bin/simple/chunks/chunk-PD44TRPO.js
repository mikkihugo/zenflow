
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  getLogger
} from "./chunk-NECHN6IW.js";
import {
  __esm,
  __export,
  __name,
  __toCommonJS
} from "./chunk-O4JO3PGD.js";

// src/di/container/di-scope.ts
var di_scope_exports = {};
__export(di_scope_exports, {
  DIScope: () => DIScope
});
var DIScope;
var init_di_scope = __esm({
  "src/di/container/di-scope.ts"() {
    "use strict";
    DIScope = class _DIScope {
      constructor(parent) {
        this.parent = parent;
      }
      static {
        __name(this, "DIScope");
      }
      scopedProviders = /* @__PURE__ */ new Map();
      scopedInstances = /* @__PURE__ */ new Map();
      children = /* @__PURE__ */ new Set();
      /**
       * Register a service provider in this scope.
       *
       * @param token
       * @param provider
       */
      register(token, provider) {
        this.scopedProviders.set(token.symbol, provider);
      }
      /**
       * Resolve a service, checking scope hierarchy.
       *
       * @param token
       */
      resolve(token) {
        const scopedProvider = this.scopedProviders.get(token.symbol);
        if (scopedProvider) {
          return this.resolveScoped(token, scopedProvider);
        }
        return this.parent.resolve(token);
      }
      /**
       * Create a child scope.
       */
      createScope() {
        const child = new _DIScope(this);
        this.children.add(child);
        return child;
      }
      /**
       * Create a child scope (alias for createScope).
       */
      createChild() {
        return this.createScope();
      }
      /**
       * Dispose scope and all child scopes.
       */
      async dispose() {
        const disposalPromises = [];
        for (const [symbol, instance] of this.scopedInstances) {
          const provider = this.scopedProviders.get(symbol);
          if (provider?.dispose) {
            disposalPromises.push(provider.dispose(instance));
          }
        }
        for (const child of this.children) {
          disposalPromises.push(child?.dispose());
        }
        await Promise.all(disposalPromises);
        this.scopedInstances.clear();
        this.scopedProviders.clear();
        this.children.clear();
      }
      /**
       * Check if a service is registered in this scope.
       *
       * @param token
       */
      isRegisteredInScope(token) {
        return this.scopedProviders.has(token.symbol);
      }
      /**
       * Resolve a scoped service with instance caching.
       *
       * @param token
       * @param provider
       */
      resolveScoped(token, provider) {
        if (this.scopedInstances.has(token.symbol)) {
          return this.scopedInstances.get(token.symbol);
        }
        const instance = provider.create(this);
        this.scopedInstances.set(token.symbol, instance);
        return instance;
      }
    };
  }
});

// src/di/types/di-types.ts
var DIError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "DIError";
  }
  static {
    __name(this, "DIError");
  }
};
var CircularDependencyError = class extends DIError {
  static {
    __name(this, "CircularDependencyError");
  }
  constructor(dependencyChain) {
    super(`Circular dependency detected: ${dependencyChain.join(" -> ")}`, "CIRCULAR_DEPENDENCY");
    this.name = "CircularDependencyError";
  }
};
var ServiceNotFoundError = class extends DIError {
  static {
    __name(this, "ServiceNotFoundError");
  }
  constructor(token) {
    super(`No provider registered for token: ${token}`, "SERVICE_NOT_FOUND");
    this.name = "ServiceNotFoundError";
  }
};

// src/di/container/di-container.ts
var logger = getLogger("di-container-di-container");
var DIContainer = class {
  static {
    __name(this, "DIContainer");
  }
  providers = /* @__PURE__ */ new Map();
  singletonInstances = /* @__PURE__ */ new Map();
  scopes = /* @__PURE__ */ new WeakSet();
  resolutionStack = [];
  options;
  constructor(options = {}) {
    this.options = {
      enableCircularDependencyDetection: options?.enableCircularDependencyDetection ?? true,
      maxResolutionDepth: options?.maxResolutionDepth ?? 50,
      enablePerformanceMetrics: options?.enablePerformanceMetrics ?? false,
      autoRegisterByConvention: options?.autoRegisterByConvention ?? false
    };
  }
  /**
   * Register a service provider with the container.
   *
   * @param token
   * @param provider
   */
  register(token, provider) {
    if (this.providers.has(token.symbol)) {
      logger.warn(`Provider for token '${token.name}' is being overwritten`);
    }
    this.providers.set(token.symbol, provider);
  }
  /**
   * Resolve a service from the container.
   *
   * @param token
   */
  resolve(token) {
    const startTime = this.options.enablePerformanceMetrics ? Date.now() : 0;
    try {
      const result = this.resolveInternal(token);
      if (this.options.enablePerformanceMetrics) {
        const duration = Date.now() - startTime;
        this.recordResolutionMetric(token, duration);
      }
      return result;
    } catch (error) {
      if (error instanceof DIError) {
        throw error;
      }
      throw new DIError(`Failed to resolve service '${token.name}': ${error}`, "RESOLUTION_FAILED");
    }
  }
  /**
   * Create a new scope.
   */
  createScope() {
    const DIScopeModule = (init_di_scope(), __toCommonJS(di_scope_exports));
    const DIScopeImpl = DIScopeModule.DIScope;
    const scope = new DIScopeImpl(this);
    this.scopes.add(scope);
    return scope;
  }
  /**
   * Dispose all singleton instances and clean up resources.
   */
  async dispose() {
    const disposalPromises = [];
    for (const [symbol, instance] of this.singletonInstances) {
      const provider = this.providers.get(symbol);
      if (provider?.dispose) {
        disposalPromises.push(provider.dispose(instance));
      }
    }
    await Promise.all(disposalPromises);
    this.singletonInstances.clear();
    this.providers.clear();
  }
  /**
   * Check if a service is registered.
   *
   * @param token
   */
  isRegistered(token) {
    return this.providers.has(token.symbol);
  }
  /**
   * Get all registered tokens (for debugging).
   */
  getRegisteredTokens() {
    return Array.from(this.providers.entries()).map(([symbol, _]) => {
      for (const [tokenSymbol, _provider] of this.providers) {
        if (tokenSymbol === symbol) {
          return symbol.toString();
        }
      }
      return symbol.toString();
    });
  }
  /**
   * Internal resolution with circular dependency detection.
   *
   * @param token
   */
  resolveInternal(token) {
    if (this.options.enableCircularDependencyDetection) {
      if (this.resolutionStack.includes(token.symbol)) {
        const chain = this.resolutionStack.map((s) => s.toString()).concat(token.name);
        throw new CircularDependencyError(chain);
      }
      if (this.resolutionStack.length >= this.options.maxResolutionDepth) {
        throw new DIError(
          `Maximum resolution depth exceeded (${this.options.maxResolutionDepth})`,
          "MAX_DEPTH_EXCEEDED"
        );
      }
    }
    const provider = this.providers.get(token.symbol);
    if (!provider) {
      throw new ServiceNotFoundError(token.name);
    }
    this.resolutionStack.push(token.symbol);
    try {
      switch (provider.type) {
        case "singleton":
          return this.resolveSingleton(token, provider);
        case "transient":
          return provider.create(this);
        case "scoped":
          return provider.create(this);
        default:
          throw new DIError(
            `Unknown provider type: ${provider.type}`,
            "UNKNOWN_PROVIDER_TYPE"
          );
      }
    } finally {
      this.resolutionStack.pop();
    }
  }
  /**
   * Resolve singleton with instance caching.
   *
   * @param token
   * @param provider
   */
  resolveSingleton(token, provider) {
    if (this.singletonInstances.has(token.symbol)) {
      return this.singletonInstances.get(token.symbol);
    }
    const instance = provider.create(this);
    this.singletonInstances.set(token.symbol, instance);
    return instance;
  }
  /**
   * Record performance metrics for service resolution.
   *
   * @param token - The service token that was resolved.
   * @param duration - Resolution time in milliseconds.
   */
  recordResolutionMetric(token, duration) {
    logger.debug(`DI Resolution: ${token.name} resolved in ${duration}ms`);
  }
};

export {
  init_di_scope,
  DIContainer
};
//# sourceMappingURL=chunk-PD44TRPO.js.map
