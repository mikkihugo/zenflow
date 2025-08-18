/**
 * LLM Provider Configuration - Re-export from @claude-zen/llm-routing
 *
 * This configuration has been moved to @claude-zen/llm-routing package for better
 * organization and reusability. The routing system can now be easily extended
 * with additional providers and used across the claude-code-zen ecosystem.
 */

// Re-export all provider configuration from the llm-routing package
export {
  LLM_PROVIDER_CONFIG,
  ROUTING_STRATEGY,
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
} from '@claude-zen/llm-routing';

// Additional exports for backward compatibility
export {
  LLM_PROVIDER_CONFIG as providers,
  ROUTING_STRATEGY as routing,
} from '@claude-zen/llm-routing';

// Default export for backward compatibility (static import)
import { 
  LLM_PROVIDER_CONFIG, 
  ROUTING_STRATEGY, 
  getOptimalProvider as getOptimal 
} from '@claude-zen/llm-routing';

export default {
  providers: LLM_PROVIDER_CONFIG,
  routing: ROUTING_STRATEGY,
  getOptimalProvider: getOptimal,
};