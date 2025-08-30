/**
 * Core LLM contracts (provider-agnostic).
 * Keep only types/interfaces and minimal enums; no provider impls.
 */
import type { Result } from '@claude-zen/foundation';

export type LLMRole =
  | 'assistant'
  | 'coder'
  | 'analyst'
  | 'researcher'
  | 'coordinator'
  | 'tester'
  | 'architect';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface LLMResponse {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface LLMError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  cause?: Error;
}

export type LLMResult = Result<LLMResponse, LLMError>;

export interface LLMRoleProfile {
  role: LLMRole;
  systemPrompt: string;
  capabilities: string[];
}

export interface LLMCapabilities {
  models: string[];
  maxTokens: number;
  contextWindow: number;
  features: {
    fileOperations: boolean;
    webAccess: boolean;
    codeExecution: boolean;
    imageGeneration: boolean;
    multimodal: boolean;
    streaming: boolean;
    customTools: boolean;
    reasoning: boolean;
    coding: boolean;
    planning: boolean;
  };
  pricing?: {
    inputTokens: number;
    outputTokens: number;
    currency: string;
  };
}

export interface LLMConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
}

export interface LLMInterface {
  readonly id: string;
  readonly name: string;

  getCapabilities(): LLMCapabilities;
  execute(request: LLMRequest): Promise<LLMResult>;

  setRole?(roleName: LLMRole): Result<void, LLMError>;
  getRole?(): LLMRoleProfile | undefined;

  complete?(prompt: string, options?: Partial<LLMRequest>): Promise<Result<string, LLMError>>;
  getUsageStats?(): { requestCount: number; lastRequestTime: number; currentRole?: string };
}

export const LLM_ERROR_CODES = {
  validation_error: 'VALIDATION_ERROR',
  timeout_error: 'TIMEOUT_ERROR',
  network_error: 'NETWORK_ERROR',
  auth_error: 'AUTH_ERROR',
  rate_limit_error: 'RATE_LIMIT_ERROR',
  model_error: 'MODEL_ERROR',
  role_error: 'ROLE_ERROR',
  unknown_error: 'UNKNOWN_ERROR',
} as const;

export type LLMErrorCode = (typeof LLM_ERROR_CODES)[keyof typeof LLM_ERROR_CODES];
