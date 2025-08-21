/**
 * @fileoverview Generic LLM Provider with Pluggable CLI Tools
 *
 * Generic LLM provider that can use different CLI tools (Claude, Gemini, etc.)
 * through a pluggable provider architecture. Refactored to use foundation's 
 * Result pattern, error handling, retry logic, and proper validation.
 */

// Use CLI tools architecture with foundation integration
import type { 
  CLIProvider, 
  CLIRequest, 
  CLIResponse, 
  CLIResult,
  CLIError,
  CLIProviderConfig,
  SwarmAgentRole
} from './types/cli-providers';
import { CLI_ERROR_CODES } from './types/cli-providers';
import { 
  getLogger,
  Result, 
  ok, 
  err,
  withTimeout,
  withRetry,
  validateInput,
  z,
  getConfig
} from '@claude-zen/foundation';
import { EventEmitter } from 'events';

// Export CLI types with proper names
export type { 
  CLIMessage, 
  CLIRequest, 
  CLIResponse, 
  CLIResult,
  CLIError,
  CLIProviderConfig,
  SwarmAgentRole 
} from './types/cli-providers';
import { CLAUDE_SWARM_AGENT_ROLES } from './claude';
export const SWARM_AGENT_ROLES = CLAUDE_SWARM_AGENT_ROLES;

// Validation schemas using foundation's Zod integration
const CLIRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1, 'Message content cannot be empty')
  })).min(1, 'At least one message is required'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(200000).optional(),
  metadata: z.record(z.unknown()).optional()
});

const CLIProviderConfigSchema = z.object({
  timeout: z.number().min(1000).max(300000).default(30000),
  retries: z.number().min(0).max(5).default(3),
  retryDelay: z.number().min(100).max(10000).default(1000),
  maxTokens: z.number().min(1).max(200000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  metadata: z.record(z.unknown()).optional()
});

const logger = getLogger('llm-provider');

// Generic LLM Provider with pluggable CLI tool backends and event system integration
export class LLMProvider extends EventEmitter {
  private cliProvider: CLIProvider | null = null;
  private requestCount = 0;
  private lastRequestTime = 0;
  private providerId: string;
  private config: CLIProviderConfig;

  constructor(providerId: string = 'claude-code', config: Partial<CLIProviderConfig> = {}) {
    super();
    this.providerId = providerId;
    
    // Validate and set configuration using foundation's validation
    const configResult = validateInput(CLIProviderConfigSchema, config);
    if (configResult.isErr()) {
      const error = new Error(`Invalid LLM provider configuration: ${configResult.error.message}`);
      logger.error('Configuration validation failed', { error: configResult.error, providerId });
      throw error;
    }
    this.config = configResult.value;
    
    // Initialize provider lazily to avoid circular dependencies
    this.initializeProvider().catch(error => {
      logger.error('Failed to initialize provider', { error, providerId });
      this.emit('provider:error', { 
        providerId: this.providerId, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now() 
      });
    });
    
    // Emit provider initialization event
    this.emit('provider:initialized', { 
      providerId: this.providerId, 
      config: this.config,
      timestamp: Date.now() 
    });
  }

  private async initializeProvider(): Promise<void> {
    try {
      // Lazy load based on provider type
      switch (this.providerId) {
        case 'claude-code':
          const { ClaudeProvider } = await import('./claude/claude-provider');
          this.cliProvider = new ClaudeProvider();
          break;
        case 'github-models-api':
          const { GitHubModelsAPI } = await import('./api/github-models');
          this.cliProvider = new GitHubModelsAPI({ token: process.env.GITHUB_TOKEN || '' });
          break;
        case 'cursor-cli':
          const { CursorCLI } = await import('./cursor');
          this.cliProvider = new CursorCLI();
          break;
        case 'gemini-cli':
          const { GeminiCLI } = await import('./gemini');
          this.cliProvider = new GeminiCLI();
          break;
        default:
          // Fallback to Claude Code
          const { ClaudeProvider: DefaultProvider } = await import('./claude/claude-provider');
          this.cliProvider = new DefaultProvider();
      }
      
      this.emit('provider:ready', { 
        providerId: this.providerId, 
        timestamp: Date.now() 
      });
    } catch (error) {
      this.emit('provider:error', { 
        providerId: this.providerId, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now() 
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
        details: { providerId: this.providerId }
      });
    }

    if (!(roleName in SWARM_AGENT_ROLES)) {
      return err({
        code: CLI_ERROR_CODES.ROLE_ERROR,
        message: `Invalid role: ${roleName}`,
        details: { 
          providerId: this.providerId,
          availableRoles: Object.keys(SWARM_AGENT_ROLES)
        }
      });
    }

    try {
      const result = this.cliProvider.setRole(roleName);
      logger.debug('Role set successfully', { 
        providerId: this.providerId, 
        role: roleName 
      });
      return result;
    } catch (error) {
      return err({
        code: CLI_ERROR_CODES.ROLE_ERROR,
        message: `Failed to set role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { providerId: this.providerId, role: roleName },
        cause: error instanceof Error ? error : undefined
      });
    }
  }

  // Get current role
  getRole(): SwarmAgentRole | undefined {
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
    
    if (currentRole && this.cliProvider) {
      this.cliProvider.setRole(currentRole.role);
    }
  }

  // Get current provider info
  getProviderInfo(): { id: string; name: string; capabilities: any } {
    if (!this.cliProvider) {
      throw new Error('Provider not initialized. Call initializeProvider() first.');
    }
    return {
      id: this.cliProvider.id,
      name: this.cliProvider.name,
      capabilities: this.cliProvider.getCapabilities(),
    };
  }

  // Delegate to CLI provider for tool permissions (backward compatibility)

  async chat(request: CLIRequest): Promise<CLIResult> {
    // Validate request using foundation's validation
    const validationResult = validateInput(CLIRequestSchema, request);
    if (validationResult.isErr()) {
      return err({
        code: CLI_ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid request: ${validationResult.error.message}`,
        details: { providerId: this.providerId }
      });
    }

    if (!this.cliProvider) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',
        details: { providerId: this.providerId }
      });
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();

    try {
      // Execute with foundation's retry and timeout protection
      const executeWithRetry = async () => {
        return await withRetry(
          async () => await this.cliProvider!.execute(validationResult.value),
          {
            attempts: this.config.retries,
            initialDelay: this.config.retryDelay,
          }
        );
      };

      // Use foundation's timeout protection
      const result = await withTimeout(
        executeWithRetry(),
        this.config.timeout,
        `LLM request timed out after ${this.config.timeout}ms`
      );

      logger.debug('Request completed successfully', {
        providerId: this.providerId,
        requestCount: this.requestCount,
        responseLength: result && typeof result === 'object' && 'isOk' in result && result.isOk() ? result.value.content.length : 0
      });

      // Handle Result type properly
      if (result && typeof result === 'object' && 'isOk' in result) {
        return result as CLIResult;
      } else {
        // If not a Result type, wrap it
        return ok(result as CLIResponse);
      }

    } catch (error) {
      const cliError: CLIError = {
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: `LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { 
          providerId: this.providerId,
          requestCount: this.requestCount,
          configuredTimeout: this.config.timeout,
          configuredRetries: this.config.retries
        },
        cause: error instanceof Error ? error : undefined
      };

      // Determine specific error type
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('timeout')) {
          cliError.code = CLI_ERROR_CODES.TIMEOUT_ERROR;
        } else if (message.includes('network') || message.includes('connection')) {
          cliError.code = CLI_ERROR_CODES.NETWORK_ERROR;
        } else if (message.includes('auth') || message.includes('unauthorized')) {
          cliError.code = CLI_ERROR_CODES.AUTH_ERROR;
        } else if (message.includes('rate limit')) {
          cliError.code = CLI_ERROR_CODES.RATE_LIMIT_ERROR;
        }
      }

      logger.error('CLI provider call failed', { 
        error: cliError,
        providerId: this.providerId 
      });

      return err(cliError);
    }
  }

  // Role-specific helper methods with Result pattern and proper error handling
  async executeAsAssistant(prompt: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('assistant');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    return this.complete(prompt, options);
  }

  async executeAsCoder(task: string, context?: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('coder');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    
    const prompt = context
      ? `Coding task: ${task}\n\nContext:\n${context}\n\nPlease provide the code solution:`
      : `Coding task: ${task}`;
    return this.complete(prompt, options);
  }

  async executeAsAnalyst(data: string, analysis_type: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('analyst');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    
    const prompt = `Analysis type: ${analysis_type}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;
    return this.complete(prompt, options);
  }

  async executeAsResearcher(topic: string, scope?: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('researcher');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    
    const prompt = scope
      ? `Research topic: ${topic}\nScope: ${scope}\n\nPlease provide comprehensive research:`
      : `Research topic: ${topic}\n\nPlease provide comprehensive research:`;
    return this.complete(prompt, options);
  }

  async executeAsCoordinator(task: string, team_context?: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('coordinator');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    
    const prompt = team_context
      ? `Coordination task: ${task}\nTeam context: ${team_context}\n\nPlease provide coordination plan:`
      : `Coordination task: ${task}\n\nPlease provide coordination plan:`;
    return this.complete(prompt, options);
  }

  async executeAsTester(feature: string, requirements?: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('tester');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    
    const prompt = requirements
      ? `Feature to test: ${feature}\nRequirements: ${requirements}\n\nPlease provide test plan and cases:`
      : `Feature to test: ${feature}\n\nPlease provide test plan and cases:`;
    return this.complete(prompt, options);
  }

  async executeAsArchitect(system: string, requirements?: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('architect');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    
    const prompt = requirements
      ? `System to architect: ${system}\nRequirements: ${requirements}\n\nPlease provide architectural design:`
      : `System to architect: ${system}\n\nPlease provide architectural design:`;
    return this.complete(prompt, options);
  }

  // Helper for simple text completion with Result pattern
  async complete(prompt: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    if (!this.cliProvider) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',
        details: { providerId: this.providerId }
      });
    }

    return this.cliProvider.complete(prompt, options);
  }

  // Helper for analysis tasks with Result pattern
  async analyze(task: string, data: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const prompt = `Task: ${task}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;
    return this.complete(prompt, options);
  }

  // Direct task execution using CLI provider with Result pattern
  async executeTask(prompt: string, options?: Record<string, unknown>): Promise<Result<unknown, CLIError>> {
    if (!this.cliProvider) {
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',
        details: { providerId: this.providerId }
      });
    }

    return this.cliProvider.executeTask(prompt, options);
  }

  // Get usage statistics
  getUsageStats(): { requestCount: number; lastRequestTime: number; currentRole?: string; provider?: string } {
    const providerStats = this.cliProvider?.getUsageStats() || { requestCount: 0, lastRequestTime: 0 };
    return {
      requestCount: this.requestCount + (providerStats.requestCount || 0),
      lastRequestTime: Math.max(this.lastRequestTime, providerStats.lastRequestTime || 0),
      currentRole: providerStats.currentRole,
      provider: this.cliProvider?.id || this.providerId,
    };
  }

  // All CLI implementation now handled by pluggable providers
}

// Singleton instance for shared usage
let globalLLM: LLMProvider | null = null;

export function getGlobalLLM(providerId?: string): LLMProvider {
  if (!globalLLM || providerId) {
    globalLLM = new LLMProvider(providerId); // Defaults to Claude provider with 'coder' role
    globalLLM.setRole('coder'); // Set coder role with dangerous permissions
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
    model?: 'sonnet' | 'opus';
  }>;
  coordination?: 'parallel' | 'sequential';
}

export interface SwarmTaskResult {
  role: string;
  output: string;
}

export async function executeSwarmTask(task: SwarmTask): Promise<SwarmTaskResult[]> {
  const results: SwarmTaskResult[] = [];

  if (task.coordination === 'sequential') {
    // Sequential execution - reuse global LLM
    const llm = getGlobalLLM();
    for (const agent of task.agents) {
      const roleResult = llm.setRole(agent.role);
      if (roleResult.isErr()) {
        results.push({
          role: agent.role,
          output: `Role error: ${roleResult.error.message}`,
        });
        continue;
      }
      
      const result = await llm.complete(task.description, {
        model: agent.model || 'sonnet',
      });
      
      results.push({
        role: agent.role,
        output: result.isOk() ? result.value : `Error: ${result.error.message}`,
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
          output: `Role error: ${roleResult.error.message}`,
        };
      }
      
      const result = await agentLLM.complete(task.description, {
        model: agent.model || 'sonnet',
      });
      
      return {
        role: agent.role,
        output: result.isOk() ? result.value : `Error: ${result.error.message}`,
      };
    });

    results.push(...await Promise.all(promises));
  }

  return results;
}

