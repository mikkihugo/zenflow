/**
 * Multi-LLM Provider Architecture - Main Export
 * Comprehensive AI provider management system
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
export async function createProviderManager(configs = {}) {
  const { ProviderManager } = await import('./provider-manager.js');

  const manager = new ProviderManager(configs.manager);
  await manager.initializeBuiltInProviders(configs.providers || {});

  return manager;
}

// Provider factory for dynamic loading
export async function createProvider(name = await import('./anthropic.js');
let anthropic = new AnthropicProvider();
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

default =
{anthropic = {ROUND_ROBIN = > ({ type = > ({ 
    type = {DEVELOPMENT = `
// Quick start
import { createProviderManager, COMMON_CONFIGS } from './providers/index.js';

const manager = await createProviderManager({
  ...COMMON_CONFIGS.PRODUCTION,providers = await manager.generateText({id = await manager.getProviderStatuses();
console.warn(statuses);
`;

console.warn('Multi-LLM Provider Architecture loaded successfully');
console.warn('Available providers: Anthropic, OpenAI, Cohere, Google, Ollama');
console.warn('Features: Load balancing, failover, caching, circuit breakers, metrics');
