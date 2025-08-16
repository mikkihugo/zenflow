/**
 * Bindings Module - Barrel Export.
 *
 * Central export point for Rust/WASM bindings and native integrations.
 * Now includes zen-orchestrator native integration for A2A protocol and neural services.
 */

export type {
  A2AMessage,
  DAAgentStatus,
  NeuralServiceResult,
  OrchestratorBindingConfig,
  OrchestratorMetrics,
  OrchestratorStatus,
  TypedNeuralServiceResult,
} from './zen-orchestrator-wrapper';
// zen-orchestrator integration
export {
  type ZenOrchestratorConfig,
  ZenOrchestratorWrapper,
} from './zen-orchestrator-wrapper';

// TypeScript definitions for Rust bindings - types will be inferred from implementations

// Bindings utilities
/**
 * @file Bindings module exports.
 */

export const BindingsUtils = {
  /**
   * Check if native bindings are available.
   */
  isNativeAvailable: (): boolean => {
    try {
      // Try to load zen-code native binding
      const { platform, arch } = require('os');
      const platformMap: Record<string, string> = {
        'linux': 'linux',
        'darwin': 'darwin', 
        'win32': 'win32'
      };
      const archMap: Record<string, string> = {
        'x64': 'x64',
        'arm64': 'arm64',
        'ia32': 'x86'
      };
      
      const platformName = platformMap[platform()] || 'linux';
      const archName = archMap[arch()] || 'x64';
      const bindingName = `zen-code-bindings.${platformName}-${archName}-gnu.node`;
      
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(`./${bindingName}`);
      return true;
    } catch {
      // Fallback: try common binding name
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./zen-code-bindings.linux-x64-gnu.node');
        return true;
      } catch {
        return false;
      }
    }
  },

  /**
   * Get binding type based on availability.
   */
  getBindingType: (): 'native' | 'wasm' | 'fallback' => {
    if (BindingsUtils.isNativeAvailable()) {
      return 'native';
    }
    // Check for WASM availability
    if (typeof WebAssembly !== 'undefined') {
      return 'wasm';
    }
    return 'fallback';
  },

  /**
   * Load appropriate binding.
   */
  loadBinding: async () => {
    const bindingType = BindingsUtils.getBindingType();

    switch (bindingType) {
      case 'native': {
        // Try to load platform-specific zen-code binding
        const { platform, arch } = require('os');
        const platformMap: Record<string, string> = {
          'linux': 'linux',
          'darwin': 'darwin',
          'win32': 'win32'
        };
        const archMap: Record<string, string> = {
          'x64': 'x64',
          'arm64': 'arm64',
          'ia32': 'x86'
        };
        
        const platformName = platformMap[platform()] || 'linux';
        const archName = archMap[arch()] || 'x64';
        const bindingName = `zen-code-bindings.${platformName}-${archName}-gnu.node`;
        
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require(`./${bindingName}`);
        } catch {
          // Fallback to common binding
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require('./zen-code-bindings.linux-x64-gnu.node');
        }
      }
      case 'wasm': {
        // Load WASM bindings through proper abstraction (fixed isolation violation)
        // Instead of direct import, use dynamic loading with proper interface
        const wasmModule = await import('./wasm-binding-interface');
        return wasmModule.default;
      }
      default:
        throw new Error('No bindings available');
    }
  },
};

/**
 * BindingFactory - Singleton factory for WASM binding management.
 *
 * Provides centralized management of WASM bindings with lazy loading and caching.
 * Uses the singleton pattern to ensure consistent binding instances across the system.
 *
 * @example
 * ```typescript
 * import { BindingFactory } from 'claude-code-zen/bindings';
 *
 * const binding = await BindingFactory.getInstance();
 * // Use binding for neural computation...
 *
 * // Clear cache when needed
 * BindingFactory.clearInstance();
 * ```
 *
 * @since 1.0.0-alpha.43
 */
export class BindingFactory {
  private static instance: unknown = null;

  /**
   * Get singleton binding instance with lazy loading.
   *
   * @returns Promise resolving to the loaded WASM binding instance
   * @throws {Error} If binding loading fails
   */
  static async getInstance(): Promise<unknown> {
    if (!BindingFactory.instance) {
      BindingFactory.instance = await BindingsUtils.loadBinding();
    }
    return BindingFactory.instance;
  }

  /**
   * Clear cached binding instance.
   *
   * Call this to force reloading of bindings on next getInstance() call.
   */
  static clearInstance(): void {
    BindingFactory.instance = null;
  }
}

/**
 * Default export - BindingsUtils for convenient access to binding utilities.
 *
 * @example
 * ```typescript
 * import BindingsUtils from 'claude-code-zen/bindings';
 *
 * const binding = await BindingsUtils.loadBinding();
 * const available = BindingsUtils.getAvailableBindings();
 * ```
 *
 * @see {@link BindingsUtils} - Main utilities class
 * @since 1.0.0-alpha.43
 */
export default BindingsUtils;
