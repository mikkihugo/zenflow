/**
 * @fileoverview CLI Tools Registry and Factory
 * 
 * Provides a simple pluggable CLI architecture that allows higher-level systems 
 * to easily switch between different CLI tools (Claude Code, Gemini CLI, Cursor CLI, etc.).
 * 
 * ## Key Design Principle
 * **Foundation provides the plugs, higher-level systems provide the intelligence.**
 * - Foundation: Simple provider registry and factory
 * - Higher Systems: A/B testing, intelligent routing, performance optimization
 * 
 * @example Basic Usage - Switch Between Providers
 * ```typescript
 * import { getClaudeLLM, getGeminiLLM, getCursorLLM } from '@claude-zen/foundation';
 * 
 * // Specific providers
 * const claudeProvider = getClaudeLLM();    // Claude Code CLI
 * const geminiProvider = getGeminiLLM();    // Gemini CLI (when implemented)
 * const cursorProvider = getCursorLLM();    // Cursor CLI (when implemented)
 * 
 * // Choose provider based on task
 * const coder = getClaudeLLM();        // Has file operations
 * const researcher = getGeminiLLM();   // Future: Web research
 * const architect = getCursorLLM();    // Future: Code architecture
 * ```
 * 
 * @example Factory Pattern
 * ```typescript
 * import { cliFactory, listAvailableProviders } from '@claude-zen/foundation';
 * 
 * // Create providers
 * const claude = cliFactory.createProvider('claude-code');
 * const gemini = cliFactory.createProvider('gemini-cli');  // Future
 * 
 * // Check what's available
 * console.log(listAvailableProviders());
 * // [{ id: 'claude-code', name: 'Claude Code CLI', available: true }, ...]
 * ```
 * 
 * @example Higher-Level System Integration
 * ```typescript
 * // Higher-level systems can build sophisticated routing:
 * function getProviderForTask(taskType: string) {
 *   switch (taskType) {
 *     case 'file-operations': return getClaudeLLM();  // Has file access
 *     case 'web-research': return getGeminiLLM();     // Future: Web access
 *     case 'code-review': return getCursorLLM();      // Future: Code analysis
 *     default: return getGlobalLLM();                 // Default
 *   }
 * }
 * ```
 */

import type { CLIProvider, CLIProviderRegistry, CLIProviderFactory, CLIProviderCapabilities } from '../types/cli-providers.js';

// CLI tool imports
import { createClaudeProvider } from './claude/index.js';
import { createGeminiProvider } from './gemini/index.js';
import { createCursorProvider } from './cursor/index.js';

// Registry implementation
class CLIToolsRegistry implements CLIProviderRegistry {
  private providers = new Map<string, CLIProvider>();

  register(provider: CLIProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  get(providerId: string): CLIProvider | undefined {
    return this.providers.get(providerId);
  }

  list(): CLIProvider[] {
    return Array.from(this.providers.values());
  }

  getByCapability(capability: keyof CLIProviderCapabilities['features']): CLIProvider[] {
    return this.list().filter(provider => 
      provider.getCapabilities().features[capability]
    );
  }
}

// Factory implementation
class CLIToolsFactory implements CLIProviderFactory {
  private registry: CLIProviderRegistry;

  constructor(registry: CLIProviderRegistry) {
    this.registry = registry;
  }

  createProvider(type: 'claude-code' | 'gemini-cli' | 'cursor-cli', options?: any): CLIProvider {
    let provider: CLIProvider;

    switch (type) {
      case 'claude-code':
        provider = createClaudeProvider();
        // Future: Pass options to Claude provider constructor
        if (options) {
          console.warn('Claude Code provider options not yet implemented:', options);
        }
        break;
      
      case 'gemini-cli':
        try {
          provider = createGeminiProvider();
          if (options) {
            console.warn('Gemini CLI provider options not yet implemented:', options);
          }
        } catch (error) {
          throw new Error(`Gemini CLI provider not yet implemented: ${error}`);
        }
        break;
      
      case 'cursor-cli':
        try {
          provider = createCursorProvider();
          if (options) {
            console.warn('Cursor CLI provider options not yet implemented:', options);
          }
        } catch (error) {
          throw new Error(`Cursor CLI provider not yet implemented: ${error}`);
        }
        break;
      
      default:
        throw new Error(`Unknown CLI provider type: ${type}`);
    }

    // Register the provider
    this.registry.register(provider);
    
    return provider;
  }

  getSupportedTypes(): string[] {
    return ['claude-code', 'gemini-cli', 'cursor-cli']; // Ready for expansion
  }
}

// Singleton instances
export const cliRegistry = new CLIToolsRegistry();
export const cliFactory = new CLIToolsFactory(cliRegistry);

// Initialize default providers
cliFactory.createProvider('claude-code'); // Registers Claude Code as default

// Convenience exports
export { CLIToolsRegistry, CLIToolsFactory };
export type { CLIProvider, CLIProviderRegistry, CLIProviderFactory };

// Simple provider factory - A/B testing can be built on top

/**
 * Get the default CLI provider (Claude Code).
 * 
 * @returns The default CLI provider instance
 * @example
 * ```typescript
 * const defaultProvider = getDefaultCLIProvider();
 * await defaultProvider.execute({ messages: [{ role: 'user', content: 'Hello' }] });
 * ```
 */
export function getDefaultCLIProvider(): CLIProvider {
  return cliRegistry.get('claude-code') || cliFactory.createProvider('claude-code');
}

/**
 * Get a specific CLI provider by ID.
 * 
 * @param id - The provider ID ('claude-code', 'gemini-cli', 'cursor-cli')
 * @returns The CLI provider instance or undefined if not found
 * @example
 * ```typescript
 * const claude = getCLIProvider('claude-code');
 * const gemini = getCLIProvider('gemini-cli');  // May return undefined if not implemented
 * ```
 */
export function getCLIProvider(id: string): CLIProvider | undefined {
  return cliRegistry.get(id);
}

/**
 * List all registered CLI providers.
 * 
 * @returns Array of all registered CLI provider instances
 * @example
 * ```typescript
 * const allProviders = listCLIProviders();
 * console.log(allProviders.map(p => p.name)); // ['Claude Code CLI', ...]
 * ```
 */
export function listCLIProviders(): CLIProvider[] {
  return cliRegistry.list();
}

/**
 * Create a new Claude Code CLI provider instance.
 * 
 * @returns A new Claude Code CLI provider
 * @example
 * ```typescript
 * const claude = createClaudeCLI();
 * claude.setRole('coder');
 * await claude.executeAsCoder('Build a React component');
 * ```
 */
export function createClaudeCLI(): CLIProvider {
  return cliFactory.createProvider('claude-code');
}

/**
 * Create a new Gemini CLI provider instance (when implemented).
 * 
 * @returns A new Gemini CLI provider
 * @throws Error if Gemini CLI is not yet implemented
 * @example
 * ```typescript
 * const gemini = createGeminiCLI();  // Future: when Gemini CLI is implemented
 * await gemini.executeAsResearcher('Latest AI trends');
 * ```
 */
export function createGeminiCLI(): CLIProvider {
  return cliFactory.createProvider('gemini-cli');
}

/**
 * Create a new Cursor CLI provider instance (when implemented).
 * 
 * @returns A new Cursor CLI provider
 * @throws Error if Cursor CLI is not yet implemented
 * @example
 * ```typescript
 * const cursor = createCursorCLI();  // Future: when Cursor CLI is implemented
 * await cursor.executeAsArchitect('Design microservices');
 * ```
 */
export function createCursorCLI(): CLIProvider {
  return cliFactory.createProvider('cursor-cli');
}

/**
 * Switch between CLI providers (for higher-level system routing).
 * 
 * This is a utility function for higher-level systems that want to implement
 * provider switching logic. The actual switching would be handled by those systems.
 * 
 * @param fromId - Source provider ID
 * @param toId - Target provider ID  
 * @returns True if both providers exist, false otherwise
 * @example
 * ```typescript
 * // Higher-level system can use this for validation
 * if (switchProvider('claude-code', 'gemini-cli')) {
 *   // Both providers available, can switch
 *   const newProvider = getCLIProvider('gemini-cli');
 * }
 * ```
 */
export function switchProvider(fromId: string, toId: string): boolean {
  const fromProvider = cliRegistry.get(fromId);
  const toProvider = cliRegistry.get(toId);
  
  if (!fromProvider || !toProvider) {
    return false;
  }
  
  console.log(`🔄 Switching from ${fromProvider.name} to ${toProvider.name}`);
  return true;
}

/**
 * List all available CLI providers with their availability status.
 * 
 * Useful for higher-level systems to check what CLI tools are actually
 * working vs. just configured as placeholders.
 * 
 * @returns Array of provider information with availability status
 * @example
 * ```typescript
 * const providers = listAvailableProviders();
 * console.log(providers);
 * // [
 * //   { id: 'claude-code', name: 'Claude Code CLI', available: true },
 * //   { id: 'gemini-cli', name: 'Gemini CLI', available: false },
 * //   { id: 'cursor-cli', name: 'Cursor CLI', available: false }
 * // ]
 * 
 * // Higher-level system can filter to working providers:
 * const workingProviders = providers.filter(p => p.available);
 * ```
 */
export function listAvailableProviders(): Array<{ id: string; name: string; available: boolean }> {
  const supportedTypes = cliFactory.getSupportedTypes();
  
  return supportedTypes.map(type => {
    const provider = cliRegistry.get(type);
    return {
      id: type,
      name: provider?.name || type,
      available: !!provider
    };
  });
}