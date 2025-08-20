/**
 * LLM Provider Configuration - Re-export from @claude-zen/llm-routing
 *
 * This configuration has been moved to @claude-zen/llm-routing package for better
 * organization and reusability. The routing system can now be easily extended
 * with additional providers and used across the claude-code-zen ecosystem.
 */

// Re-export all provider configuration from the operations strategic facade
// LLM routing is operational infrastructure, not AI intelligence
import { 
  getLLMProviderConfig, 
  getRoutingStrategy, 
  getOptimalProvider as getOptimal 
} from '@claude-zen/operations';

export {
  getLLMProviderConfig,
  getRoutingStrategy,
  getOptimalProvider,
  addProvider,
  removeProvider,
  updateProvider,
  getProvider,
  getProviderIds,
  getProvidersByCapability,
  type ProviderConfig,
  type RoutingStrategy,
  type ProviderRoutingContext,
} from '@claude-zen/operations';

// Additional exports for backward compatibility - async functions for lazy loading
export const LLM_PROVIDER_CONFIG = getLLMProviderConfig;
export const ROUTING_STRATEGY = getRoutingStrategy;

export const providers = getLLMProviderConfig;
export const routing = getRoutingStrategy;

export default {
  providers: getLLMProviderConfig,
  routing: getRoutingStrategy,
  getOptimalProvider: getOptimal,
};