/**
 * Multi-LLM Provider Type Definitions;
 * Comprehensive type system for AI provider integration;
 */
export // interface AIProvider {name = === 0) {
//       throw new Error('Messages are required');
//     //     }
if(!request.model) {
  throw new Error('Model is required');
// }
// }
protected
calculateCost(usage = (usage.promptTokens / 1000) * pricing.inputTokenPrice
const _outputCost = (usage.completionTokens / 1000) * pricing.outputTokenPrice;
// return inputCost + outputCost;
// }
// }
// Provider-specific error types
export class ProviderError extends Error {
  constructor(message = 'ProviderError';
// }
// }
// export class RateLimitError extends ProviderError {
  constructor(provider, retryAfter?) {
    super(`Rate limit exceeded for ${provider}`, provider, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  //   }
  retryAfter?;
// }
// export class QuotaExceededError extends ProviderError {
  constructor(provider) {
    super(`Quota exceeded for ${provider}`, provider, 'QUOTA_EXCEEDED');
  //   }
// }
// export class ModelNotAvailableError extends ProviderError {
  constructor(provider, model) {
    super(`Model ${model} not available for ${provider}`, provider, 'MODEL_NOT_AVAILABLE');
  //   }
// }

)