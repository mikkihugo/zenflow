/**
 * Bindings Module - Barrel Export
 *
 * Central export point for Rust/WASM bindings and native integrations
 */

// TypeScript definitions for Rust bindings
export * from './index.d.ts';

// Bindings utilities
export const BindingsUtils = {
  /**
   * Check if native bindings are available
   */
  isNativeAvailable: (): boolean => {
    try {
      // Try to load native module
      require('./build/Release/native');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get binding type based on availability
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
   * Load appropriate binding
   */
  loadBinding: async () => {
    const bindingType = BindingsUtils.getBindingType();

    switch (bindingType) {
      case 'native':
        return require('./build/Release/native');
      case 'wasm':
        // Load WASM bindings from neural/wasm
        return await import('../neural/wasm/index.js');
      default:
        throw new Error('No bindings available');
    }
  },
};

// Binding factory
export class BindingFactory {
  private static instance: any = null;

  /**
   * Get singleton binding instance
   */
  static async getInstance(): Promise<any> {
    if (!BindingFactory.instance) {
      BindingFactory.instance = await BindingsUtils.loadBinding();
    }
    return BindingFactory.instance;
  }

  /**
   * Clear cached instance
   */
  static clearInstance(): void {
    BindingFactory.instance = null;
  }
}

// Default export
export default BindingsUtils;
