/**
 * LLM Statistics Service - Re-export from @claude-zen/llm-routing
 *
 * This service has been moved to @claude-zen/llm-routing package for better
 * organization and reusability across the claude-code-zen ecosystem.
 */

// Re-export from the llm-routing package
export {
  LLMStatsService,
  type LLMCallRecord,
  type LLMError,
  type LLMProviderStats,
  type LLMRoutingStats,
  type LLMSystemHealth,
  type LLMAnalytics,
  type AnalysisRequest,
  type AnalysisResult,
} from '@claude-zen/llm-routing';

// Export default for backward compatibility
export { LLMStatsService as default } from '@claude-zen/llm-routing';