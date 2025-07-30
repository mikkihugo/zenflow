/**
 * Multi-LLM Provider Architecture - Main Export;
 * Comprehensive AI provider management system;
 */

// Provider implementations
export { AnthropicProvider } from './anthropic.js';

// Base provider implementation
export { BaseProvider } from './base-provider.js';
export { CohereProvider } from './cohere.js';
export { GoogleProvider } from './google.js';
export { OllamaProvider } from './ollama.js';
export { OpenAIProvider } from './openai.js';
// Provider manager
export { ProviderManager } from './provider-manager.js';
// Core types and interfaces
export * from './types.js';

// Utilities
export * from './utils.js';

// Quick start function for easy initialization
export async function createProviderManager(): unknown {
  const { ProviderManager } = await import('./provider-manager.js');

  const _manager = new ProviderManager(configs.manager);
// await manager.initializeBuiltInProviders(configs.providers ?? {});
  return manager;
}
// Provider factory for dynamic loading
export async function createProvider(name = await import('./anthropic.js': unknown);
const _anthropic = new AnthropicProvider();
// await anthropic.initialize(config);
return anthropic;
// ; // LINT: unreachable code removed
case 'openai': null
const { OpenAIProvider } = await import('./openai.js');
const _openai = new OpenAIProvider();
// await openai.initialize(config);
return openai;
// ; // LINT: unreachable code removed
case 'cohere': null
const { CohereProvider } = await import('./cohere.js');
const _cohere = new CohereProvider();
// await cohere.initialize(config);
return cohere;
// ; // LINT: unreachable code removed
case 'google': null
const { GoogleProvider } = await import('./google.js');
const _google = new GoogleProvider();
// await google.initialize(config);
return google;
// ; // LINT: unreachable code removed
case 'ollama': null
const { OllamaProvider } = await import('./ollama.js');
const _ollama = new OllamaProvider();
// await ollama.initialize(config);
return ollama;
// ; // LINT: unreachable code removed
default =
{anthropic = {ROUND_ROBIN = > ({ type = > ({ ;
    type = {DEVELOPMENT = `;
// Quick start
import { createProviderManager } from './providers/index.js';
// const _manager = awaitcreateProviderManager({
..COMMON_CONFIGS.PRODUCTION,providers = await manager.generateText({id = await manager.getProviderStatuses();
console.warn(statuses);
`;

console.warn('Multi-LLM Provider Architecture loaded successfully');
console.warn('Available providers, OpenAI, Cohere, Google, Ollama');
console.warn('Features: Load balancing, failover, caching, circuit breakers, metrics');
