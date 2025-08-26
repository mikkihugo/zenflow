/**
 * @fileoverview API Provider Types
 *
 * Interfaces for integrating with various API services (OpenAI, GitHub Copilot, etc.)
 * Separated from CLI providers for proper architectural distinction.
 */

import type { Result } from '@claude-zen/foundation';
import type { LiteralUnion } from '@claude-zen/foundation/types';

export interface APIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface APIRequest {
  messages: APIMessage[];
  model?: LiteralUnion<
    | 'claude-3-5-sonnet';
    | 'gpt-4';
    | 'gemini-pro';
    | 'gpt-4o';
    | 'gpt-4-turbo',
    string
  >;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface APIResponse {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  cause?: Error;
}

export type APIResult = Result<APIResponse, APIError>;

export interface APIProviderCapabilities {
  models: string[];
  maxTokens: number;
  contextWindow: number;
  features: {
    streaming: boolean;
    multimodal: boolean;
    reasoning: boolean;
    coding: boolean;
    planning: boolean;
    imageGeneration: boolean;
    webAccess: boolean;
    customTools: boolean;
  };
  pricing?: {
    inputTokens: number;
    outputTokens: number;
    currency: string;
  };
}

export interface APIProviderConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
}

/**
 * API Provider interface for REST API services
 */
export interface APIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: 'api;

  getCapabilities(): APIProviderCapabilities;
  execute(request: APIRequest): Promise<APIResult>;

  // Model discovery
  listModels(): Promise<string[]>;

  // Health and monitoring
  healthCheck(): Promise<boolean>;
  getUsageStats(): { requestCount: number; lastRequestTime: number };
}

/**
 * API Provider Registry
 */
export interface APIProviderRegistry {
  register(provider: APIProvider): void;
  unregister(providerId: string): void;
  get(providerId: string): APIProvider|undefined;
  list(): APIProvider[];
  getByCapability(
    capability: keyof APIProviderCapabilities['features'];
  ): APIProvider[];
}

/**
 * API Provider Factory
 */
export interface APIProviderFactory {
  createProvider(
    type: LiteralUnion<
      | 'github-copilot';
      | 'openai';
      | 'anthropic';
      | 'github-models',
      string
    >,
    options?: Record<string, unknown>
  ): APIProvider;
  getSupportedTypes(): string[];
}

// Error codes for API operations
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  MODEL_ERROR: 'MODEL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type APIErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
