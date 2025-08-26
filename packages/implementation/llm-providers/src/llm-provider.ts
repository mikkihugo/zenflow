/**
 * @fileoverview Generic LLM Provider with Pluggable CLI Tools
 *
 * Generic LLM provider that can use different CLI tools (Claude, Gemini, etc.)
 * through a pluggable provider architecture. Refactored to use foundation's;
 * Result pattern, error handling, retry logic, and proper validation.
 */

// Use CLI tools architecture with foundation integration
import {
  err,
  getLogger,
  ok,
  TypedEventBase,
  validateInput,
  withRetry,
  withTimeout,
  z,
} from '@claude-zen/foundation';

import { CLAUDE_SWARM_AGENT_ROLES } from './claude';
import type {
  CLIProviderConfig,
  CLIRequest,
} from './types/cli-providers';
import { CLI_ERROR_CODES } from './types/cli-providers';

// Export CLI types with proper names
export type {
  CLIError,
  CLIMessage,
  CLIProviderConfig,
  CLIRequest,
  CLIResponse,
  CLIResult,
  SwarmAgentRole,
} from './types/cli-providers';
export const SWARM_AGENT_ROLES = CLAUDE_SWARM_AGENT_ROLES;

// Validation schemas using foundation's Zod integration;
const cliRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1, 'Message content cannot be empty'),
      })
    )
    .min(1, 'At least one message is required'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(200000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const cliProviderConfigSchema = z.object({
  timeout: z.number().min(1000).max(300000).default(30000),
  retries: z.number().min(0).max(5).default(3),
  retryDelay: z.number().min(100).max(10000).default(1000),
  maxTokens: z.number().min(1).max(200000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const logger = getLogger('llm-provider');

// Generic LLM Provider with pluggable CLI tool backends and event system integration
export class LLMProvider extends TypedEventBase {
  private providerId: string;

  constructor(
    providerId: string ='claude-code',
    config: Partial<CLIProviderConfig> = {}
  ) {
    super();
    this.providerId = providerId;

    // Validate and set configuration using foundation's validation;
    const configResult = validateInput(cliProviderConfigSchema, config);
    if (configResult.isErr()) {
      const _error = new Error(
        `Invalid LLM provider configuration: ${configResult.error.message}`
      );
      logger.error('Configuration validation failed', {;
        error: configResult.error,
        providerId,
      });
      throw error;
    }
    this.llmConfig = configResult.value;

    // Initialize provider lazily to avoid circular dependencies
    this.initializeProvider().catch((error) => {
      logger.error('Failed to initialize provider', { error, providerId });
      this.emit('provider:error', {;
        providerId: this.providerId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    });

    // Emit provider initialization event
    this.emit('provider:initialized', {;
      providerId: this.providerId,
      config: this.llmConfig,
      timestamp: Date.now(),
    });
  }

  private async initializeProvider(): Promise<void> {
    try {
      // Lazy load based on provider type
      switch (this.providerId) {
        case 'claude-code': {;
          const { ClaudeProvider } = await import('./claude/claude-provider');
          this.cliProvider = new ClaudeProvider();
          break;
        }
        case 'github-models-api':;
        case 'github-copilot-api':;
          throw new Error(
            `Provider ${this.providerId} is an API provider, not a CLI provider. Use createAPIProvider() instead.`
          );
        case 'cursor-cli': {;
          const { CursorCLI } = await import('./cursor');
          this.cliProvider = new CursorCLI();
          break;
        }
        case 'gemini-cli': {;
          const { GeminiCLI } = await import('./gemini');
          this.cliProvider = new GeminiCLI();
          break;
        }
        default: {
          // Fallback to Claude Code
          const { ClaudeProvider: DefaultProvider } = await import(
            './claude/claude-provider';
          );
          this.cliProvider = new DefaultProvider();
          break;
        }
      }

      this.emit('provider:ready', {;
        providerId: this.providerId,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.emit('provider:error', {;
        providerId: this.providerId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  // Set the agent role for specialized behavior with Result pattern
  setRole(roleName: keyof typeof SWARM_AGENT_ROLES): Result<void, CLIError> {
    if (!this.cliProvider) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',
        details: { providerId: this.providerId },
      });
    }

    if (!(roleName in SWARM_AGENT_ROLES)) {
      return err({
        code: CLI_ERROR_CODES.ROLE_ERROR,
        message: `Invalid role: ${roleName}`,
        details: {
          providerId: this.providerId,
          availableRoles: Object.keys(SWARM_AGENT_ROLES),
        },
      });
    }

    try {
      const result = this.cliProvider.setRole(roleName);
      logger.debug('Role set successfully', {;
        providerId: this.providerId,
        role: roleName,
      });
      return result;
    } catch (error) {
      return err({
        code: CLI_ERROR_CODES.ROLE_ERROR,
        message: `Failed to set role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { providerId: this.providerId, role: roleName },
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  // Get current role
  getRole(): SwarmAgentRole|undefined {
    return this.cliProvider?.getRole();
  }

  // Switch CLI provider
  async switchProvider(providerId: string): Promise<void> {
    if (!this.cliProvider) {
      await this.initializeProvider();
    }

    const currentRole = this.cliProvider?.getRole();
    this.providerId = providerId;
    this.cliProvider = null; // Reset provider
    await this.initializeProvider();

    if (
      currentRole &&
      this.cliProvider &&
      'setRole' in this.cliProvider &&;
      typeof this.cliProvider.setRole === 'function';
    ) 
      this.cliProvider.setRole(currentRole.role);
  }

  // Get current provider info
  getProviderInfo(): { id: string; name: string; capabilities: CLIProviderCapabilities } {
    if (!this.cliProvider) {
      throw new Error(
        'Provider not initialized. Call initializeProvider() first.';
      );
    }
    return {
      id: this.cliProvider.id,
      name: this.cliProvider.name,
      capabilities: this.cliProvider.getCapabilities(),
    };
  }

  // Delegate to CLI provider for tool permissions (backward compatibility)

  async chat(request: CLIRequest): Promise<CLIResult> {
    // Validate and prepare the request
    const validationResult = this.validateRequest(request);
    if (validationResult.isErr()) {
      return validationResult;
    }

    if (!this.cliProvider) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',
        details: { providerId: this.providerId },
      });
    }

    this.updateRequestStats();

    try {
      return await this.executeWithRetryAndTimeout(validationResult.value);
    } catch (error) {
      return err(this.createErrorFromException(error));
    }
  }

  private validateRequest(request: CLIRequest): Result<CLIRequest, CLIError> {
    const validationResult = validateInput(cliRequestSchema, request);
    if (validationResult.isErr()) {
      return err({
        code: CLI_ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid request: ${validationResult.error.message}`,
        details: { providerId: this.providerId },
      });
    }
    return ok(validationResult.value);
  }

  private updateRequestStats(): void {
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private async executeWithRetryAndTimeout(request: CLIRequest): Promise<CLIResult> {
    // Execute with retry logic
    const retryResult = await withRetry(
      async () => await this.cliProvider?.execute(request),
      {
        retries: this.llmConfig.retries,
        minTimeout: this.llmConfig.retryDelay,
      }
    );

    if (retryResult.isErr()) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: retryResult.error.message,
        cause: retryResult.error,
      });
    }

    // Apply timeout protection
    const timeout = this.llmConfig.timeout || 30000;
    const _result = await withTimeout(
      () => Promise.resolve(retryResult.value),
      timeout,
      `LLM request timed out after ${timeout}ms`
    );

    return this.processResult(result);
  }

  private processResult(result: Result<unknown, Error>): CLIResult {
    if (result.isErr()) {
      return err({
        code: CLI_ERROR_CODES.TIMEOUT_ERROR,
        message: result.error.message,
        cause: result.error,
      });
    }

    this.logSuccessfulRequest(result);

    // Handle successful result
    const actualResult = result.value;
    if (actualResult && typeof actualResult === 'object' && 'isOk' in actualResult) {;
      return actualResult as CLIResult;
    }

    return ok(actualResult as CLIResponse);
  }

  private logSuccessfulRequest(result: Result<unknown, Error>): void {
    logger.debug('Request completed successfully', {;
      providerId: this.providerId,
      requestCount: this.requestCount,
      responseLength:
        result &&
        typeof result === 'object' &&;
        'isOk' in result &&;
        result.isOk() &&
        typeof result.value === 'string';
          ? result.value.length
          : 0,
    });
  }

  private createErrorFromException(error: unknown): CLIError {
    const cliError: CLIError = {
      code: CLI_ERROR_CODES.UNKNOWN_ERROR,
      message: `LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        providerId: this.providerId,
        requestCount: this.requestCount,
        configuredTimeout: this.llmConfig.timeout,
        configuredRetries: this.llmConfig.retries,
      },
      cause: error instanceof Error ? error : undefined,
    };

    if (error instanceof Error) {
      cliError.code = this.determineErrorCode(error.message);
    }

    logger.error('CLI provider call failed', {;
      error: cliError,
      providerId: this.providerId,
    });

    return cliError;
  }

  private determineErrorCode(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('timeout')) {;
      return CLI_ERROR_CODES.TIMEOUT_ERROR;
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {;
      return CLI_ERROR_CODES.NETWORK_ERROR;
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized')) {;
      return CLI_ERROR_CODES.AUTH_ERROR;
    }
    if (lowerMessage.includes('rate limit')) {;
      return CLI_ERROR_CODES.RATE_LIMIT_ERROR;
    }
    
    return CLI_ERROR_CODES.UNKNOWN_ERROR;
  }

  // Role-specific helper methods with Result pattern and proper error handling
  executeAsAssistant(
    prompt: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('assistant');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    return this.complete(prompt, options);
  }

  executeAsCoder(
    task: string,
    context?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('coder');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = context
      ? `Coding task: ${task}\n\nContext:\n${context}\n\nPlease provide the code solution:`
      : `Coding task: $task`;`
    return this.complete(prompt, options);
  }

  executeAsAnalyst(
    data: string,
    analysisType: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('analyst');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const _prompt = `Analysis type: ${analysisType}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;`
    return this.complete(prompt, options);
  }

  executeAsResearcher(
    topic: string,
    scope?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('researcher');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = scope
      ? `Research topic: $topic\nScope: $scope\n\nPlease provide comprehensive research:`
      : `Research topic: $topic\n\nPlease provide comprehensive research:`;`
    return this.complete(prompt, options);
  }

  executeAsCoordinator(
    task: string,
    teamContext?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('coordinator');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = teamContext
      ? `Coordination task: $task\nTeam context: $teamContext\n\nPlease provide coordination plan:`
      : `Coordination task: $task\n\nPlease provide coordination plan:`;`
    return this.complete(prompt, options);
  }

  executeAsTester(
    feature: string,
    requirements?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('tester');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = requirements
      ? `Feature to test: $feature\nRequirements: $requirements\n\nPlease provide test plan and cases:`
      : `Feature to test: $feature\n\nPlease provide test plan and cases:`;`
    return this.complete(prompt, options);
  }

  executeAsArchitect(
    system: string,
    requirements?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('architect');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = requirements
      ? `System to architect: $system\nRequirements: $requirements\n\nPlease provide architectural design:`
      : `System to architect: $system\n\nPlease provide architectural design:`;`
    return this.complete(prompt, options);
  }

  // Helper for simple text completion with Result pattern
  complete(
    prompt: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    if (!this.cliProvider) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',
        details: { providerId: this.providerId },
      });
    }

    return this.cliProvider.complete(prompt, options);
  }

  // Helper for analysis tasks with Result pattern
  async analyze(
    task: string,
    data: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const prompt = `Task: $task\n\nData to analyze:\n$data\n\nPlease provide your analysis:`;`
    return this.complete(prompt, options);
  }

  // Direct task execution using CLI provider with Result pattern
  executeTask(
    prompt: string,
    options?: Record<string, unknown>
  ): Promise<Result<unknown, CLIError>> {
    if (!this.cliProvider) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',
        details: { providerId: this.providerId },
      });
    }

    return this.cliProvider.executeTask(prompt, options);
  }

  // Get usage statistics
  getUsageStats(): {
    requestCount: number;
    lastRequestTime: number;
    currentRole?: string;
    provider?: string;
  } {
    const providerStats = this.cliProvider?.getUsageStats()||{
      requestCount: 0,
      lastRequestTime: 0,
    };
    return {
      requestCount: this.requestCount + (providerStats.requestCount||0),
      lastRequestTime: Math.max(
        this.lastRequestTime,
        providerStats.lastRequestTime||0
      ),
      currentRole: providerStats.currentRole,
      provider: this.cliProvider?.id||this.providerId,
    };
  }

  // All CLI implementation now handled by pluggable providers
}

// Singleton instance for shared usage
let globalLLM: LLMProvider|null = null;

export function getGlobalLLM(providerId?: string): LLMProvider {
  if (!globalLLM||providerId) {
    globalLLM = new LLMProvider(providerId); // Defaults to Claude provider with'coder' role;
    globalLLM.setRole('coder'); // Set coder role with dangerous permissions;
  }
  return globalLLM;
}

export function setGlobalLLM(llm: LLMProvider): void {
  globalLLM = llm;
}

// Provider-specific convenience functions
export function getClaudeLLM(): LLMProvider {
  return getGlobalLLM('claude-code');
}

export function getGeminiLLM(): LLMProvider {
  return getGlobalLLM('gemini-cli');
}

export function getCursorLLM(): LLMProvider {
  return getGlobalLLM('cursor-cli');
}

// Swarm coordination helpers using the same shared LLM provider
export interface SwarmTask {
  description: string;
  agents: Array<{
    role: keyof typeof SWARM_AGENT_ROLES;
    model?: 'sonnet' | 'opus;
  }>;
  coordination?: 'parallel' | 'sequential;
}

export interface SwarmTaskResult {
  role: string;
  output: string;
}

export async function executeSwarmTask(
  task: SwarmTask
): Promise<SwarmTaskResult[]> {
  const results: SwarmTaskResult[] = [];

  if (task.coordination === 'sequential') {;
    // Sequential execution - reuse global LLM
    const llm = getGlobalLLM();
    for (const agent of task.agents) {
      const roleResult = llm.setRole(agent.role);
      if (roleResult.isErr()) {
        results.push({
          role: agent.role,
          output: `Role error: $roleResult.error.message`,`
        });
        continue;
      }

      const result = await llm.complete(task.description, {
        model: agent.model||'sonnet',
      });

      results.push({
        role: agent.role,
        output: result.isOk() ? result.value : `Error: ${result.error.message}`,`
      });
    }
  } else {
    // Parallel execution - create separate LLM instances
    const promises = task.agents.map(async (agent) => {
      const agentLLM = new LLMProvider();
      const roleResult = agentLLM.setRole(agent.role);
      if (roleResult.isErr()) {
        return {
          role: agent.role,
          output: `Role error: ${roleResult.error.message}`,`
        };
      }

      const result = await agentLLM.complete(task.description, {
        model: agent.model||'sonnet',
      });

      return {
        role: agent.role,
        output: result.isOk() ? result.value : `Error: ${result.error.message}`,`
      };
    });

    results.push(...(await Promise.all(promises)));
  }

  return results;
}
