/**
 * LLM Statistics Service - Re-export from '@claude-zen/intelligence';
 *
 * This service has been moved to @claude-zen/llm-routing package for better
 * organization and reusability across the claude-code-zen ecosystem0.
 */

// Re-export from the intelligence strategic facade
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
} from '@claude-zen/intelligence';

// Export default for backward compatibility
export { LLMStatsService as default } from '@claude-zen/intelligence';
