/**
 * @fileoverview Claude Code CLI Provider Implementation
 *
 * Claude-specific implementation of the CLI provider interface.
 * Integrates directly with Claude Code SDK for swarm agent capabilities.
 */

import { Result, ok, err } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation/logging';

import type {
  CLIProvider,
  CLIRequest,
  CLIResponse,
  CLIResult,
  CLIError,
  SwarmAgentRole,
  CLIProviderCapabilities,
} from '../types/cli-providers';
import { CLI_ERROR_CODES } from '../types/cli-providers';

import { executeClaudeTask, type ClaudeSDKOptions } from './claude-sdk';

const logger = getLogger('claude-provider');

export const CLAUDE_SWARM_AGENT_ROLES: Record<string, SwarmAgentRole> = {
  assistant: {
    role: 'assistant',
    systemPrompt:
      'You are a helpful AI assistant that provides accurate, concise responses and follows instructions carefully.',
    capabilities: ['general-assistance', 'question-answering', 'task-guidance'],
  },

  coder: {
    role: 'coder',
    systemPrompt:
      'You are an expert software engineer. Write clean, efficient, well-documented code. Follow best practices and coding standards. Request explicit permission for file operations and system commands.',
    capabilities: [
      'code-generation',
      'debugging',
      'refactoring',
      'code-review',
    ],
  },

  analyst: {
    role: 'analyst',
    systemPrompt:
      'You are a data analyst and system architect. Analyze requirements, identify patterns, and provide strategic insights.',
    capabilities: [
      'data-analysis',
      'pattern-recognition',
      'requirements-analysis',
      'system-design',
    ],
  },

  researcher: {
    role: 'researcher',
    systemPrompt:
      'You are a research specialist. Gather information, analyze sources, and provide comprehensive research summaries.',
    capabilities: [
      'information-gathering',
      'source-analysis',
      'research-synthesis',
      'fact-checking',
    ],
  },

  coordinator: {
    role: 'coordinator',
    systemPrompt:
      'You are a project coordinator. Manage tasks, coordinate between team members, and ensure project goals are met.',
    capabilities: [
      'task-management',
      'team-coordination',
      'project-planning',
      'resource-allocation',
    ],
  },

  tester: {
    role: 'tester',
    systemPrompt:
      'You are a QA engineer. Design tests, identify edge cases, validate functionality, and ensure quality standards.',
    capabilities: [
      'test-design',
      'quality-assurance',
      'edge-case-identification',
      'validation',
    ],
  },

  architect: {
    role: 'architect',
    systemPrompt:
      'You are a system architect. Design scalable systems, make architectural decisions, and ensure technical excellence.',
    capabilities: [
      'system-architecture',
      'technical-design',
      'scalability-planning',
      'technology-selection',
    ],
  },
};

export class ClaudeProvider implements CLIProvider {
  public readonly id = 'claude-code';
  public readonly name = 'Claude Code CLI';

  private requestCount = 0;
  private lastRequestTime = 0;
  private currentRole: SwarmAgentRole|undefined;

  constructor() {
    // Set assistant as default role with safe permissions
    this.setRole('assistant');
  }

  getCapabilities(): CLIProviderCapabilities {
    return {
      models: ['sonnet', 'opus'],
      maxTokens: 200000, // Claude's large context
      contextWindow: 200000,
      features: {
        fileOperations: true, // Can read/write files directly
        webAccess: true,
        codeExecution: true,
        imageGeneration: false,
        multimodal: true,
        streaming: false,
        customTools: true,
        contextWindow: true, // Large context window
        reasoning: true, // Excellent reasoning
        coding: true, // Best coding capabilities
        planning: true, // Strategic planning
      },
      pricing: {
        inputTokens: 3.0, // per million tokens
        outputTokens: 15.0, // per million tokens
        currency: 'USD',
      },
    };
  }

  // Set the agent role for specialized behavior with Result pattern
  setRole(
    roleName: keyof typeof CLAUDE_SWARM_AGENT_ROLES
  ): Result<void, CLIError> {
    if (!(roleName in CLAUDE_SWARM_AGENT_ROLES)) {
      return err({
        code: CLI_ERROR_CODES.ROLE_ERROR,
        message: `Invalid role: ${roleName}`,
        details: {
          providerId: this.id,
          availableRoles: Object.keys(CLAUDE_SWARM_AGENT_ROLES),
        },
      });
    }

    this.currentRole = CLAUDE_SWARM_AGENT_ROLES[roleName];
    logger.debug('Role set successfully', {
      providerId: this.id,
      role: roleName,
    });

    return ok();
  }

  // Get current role
  getRole(): SwarmAgentRole|undefined {
    return this.currentRole;
  }

  async execute(request: CLIRequest): Promise<CLIResult> {
    this.requestCount++;
    this.lastRequestTime = Date.now();

    // Add role system prompt if set
    const messages = [...request.messages];
    if (this.currentRole && messages[0]?.role !=='system') {
      messages.unshift({
        role: 'system',
        content: this.currentRole.systemPrompt,
      });
    }

    try {
      const response = await this.callClaudeCodeCLI({ ...request, messages });
      return ok(response);
    } catch (error) {
      const cliError: CLIError = {
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: `Claude CLI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          providerId: this.id,
          requestCount: this.requestCount,
          currentRole: this.currentRole?.role,
        },
        cause: error instanceof Error ? error : undefined,
      };

      // Determine specific error type
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('timeout')) {
          cliError.code = CLI_ERROR_CODES.TIMEOUT_ERROR;
        } else if (
          message.includes('network')||message.includes('connection')
        ) {
          cliError.code = CLI_ERROR_CODES.NETWORK_ERROR;
        } else if (
          message.includes('auth')||message.includes('unauthorized')
        ) {
          cliError.code = CLI_ERROR_CODES.AUTH_ERROR;
        } else if (message.includes('rate limit')) {
          cliError.code = CLI_ERROR_CODES.RATE_LIMIT_ERROR;
        } else if (message.includes('model')) {
          cliError.code = CLI_ERROR_CODES.MODEL_ERROR;
        }
      }

      logger.error('Claude Code CLI call failed', { error: cliError });
      return err(cliError);
    }
  }

  // Role-specific helper methods with Result pattern
  async executeAsAssistant(
    prompt: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('assistant');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }
    return this.complete(prompt, options);
  }

  async executeAsCoder(
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
      : `Coding task: ${task}`;
    return this.complete(prompt, options);
  }

  async executeAsAnalyst(
    data: string,
    analysis_type: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('analyst');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = `Analysis type: ${analysis_type}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;
    return this.complete(prompt, options);
  }

  async executeAsResearcher(
    topic: string,
    scope?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('researcher');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = scope
      ? `Research topic: ${topic}\nScope: ${scope}\n\nPlease provide comprehensive research:`
      : `Research topic: ${topic}\n\nPlease provide comprehensive research:`;
    return this.complete(prompt, options);
  }

  async executeAsCoordinator(
    task: string,
    team_context?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('coordinator');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = team_context
      ? `Coordination task: ${task}\nTeam context: ${team_context}\n\nPlease provide coordination plan:`
      : `Coordination task: ${task}\n\nPlease provide coordination plan:`;
    return this.complete(prompt, options);
  }

  async executeAsTester(
    feature: string,
    requirements?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('tester');
    if (roleResult.isErr()) {
      return err(roleResult.error);
    }

    const prompt = requirements
      ? `Feature to test: ${feature}\nRequirements: ${requirements}\n\nPlease provide test plan and cases:`
      : `Feature to test: ${feature}\n\nPlease provide test plan and cases:`;
    return this.complete(prompt, options);
  }

  async executeAsArchitect(
    system: string,
    requirements?: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
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
  async complete(
    prompt: string,
    options?: Partial<CLIRequest>
  ): Promise<Result<string, CLIError>> {
    const result = await this.execute({
      messages: [{ role: 'user', content: prompt }],
      ...options,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value.content);
  }

  // Direct task execution using Claude Code SDK with Result pattern
  async executeTask(
    prompt: string,
    options?: ClaudeSDKOptions
  ): Promise<Result<unknown, CLIError>> {
    try {
      const sdkOptions: ClaudeSDKOptions = {
        model: 'sonnet',
        maxTokens: 200000,
        ...options,
      };

      // Add system prompt from current role if set
      if (this.currentRole?.systemPrompt && !sdkOptions.systemPrompt) {
        sdkOptions.systemPrompt = this.currentRole.systemPrompt;
      }

      const result = await executeClaudeTask(prompt, sdkOptions);
      return ok(result);
    } catch (error) {
      const cliError: CLIError = {
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: `Task execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          providerId: this.id,
          currentRole: this.currentRole?.role,
        },
        cause: error instanceof Error ? error : undefined,
      };

      logger.error('Task execution failed', { error: cliError });
      return err(cliError);
    }
  }

  // Get usage statistics
  getUsageStats(): {
    requestCount: number;
    lastRequestTime: number;
    currentRole?: string;
  } {
    const stats: {
      requestCount: number;
      lastRequestTime: number;
      currentRole?: string;
    } = {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
    };

    if (this.currentRole?.role) {
      stats.currentRole = this.currentRole.role;
    }

    return stats;
  }

  private async callClaudeCodeCLI(request: CLIRequest): Promise<CLIResponse> {
    // Use actual Claude Code SDK integration
    const prompt = request.messages
      .map((m) => {
        if (m.role === 'system') {
          return m.content;
        }
        return `${m.role}: ${m.content}`;
      })
      .join('\n\n');

    // Always default to sonnet unless opus explicitly requested
    const model = request.model === 'opus' ? 'opus' : 'sonnet';

    const sdkOptions: ClaudeSDKOptions = {
      model,
      timeout: 1800000, // 30 minute timeout for complex tasks
    };

    // Add optional properties only if they have values
    if (this.currentRole?.systemPrompt) {
      sdkOptions.systemPrompt = this.currentRole.systemPrompt;
    }

    try {
      const messages = await executeClaudeTask(prompt, sdkOptions);
      const lastMessage = messages[messages.length - 1];

      // Extract content from Claude message
      let content = 'No response from Claude';
      if (lastMessage?.content) {
        content = String(lastMessage.content);
      }

      const response: CLIResponse = {
        content,
        metadata: {
          provider: 'claude-code-cli',
          model: `claude-3-${model}-20240229`,
          timestamp: Date.now(),
          usage: {
            promptTokens: Math.floor(prompt.length / 4), // Rough estimate
            completionTokens: Math.floor(content.length / 4),
            totalTokens: Math.floor((prompt.length + content.length) / 4),
          },
        },
      };

      // Add optional metadata only if they have values
      if (this.currentRole?.role) {
        response.metadata!['role'] = this.currentRole.role;
      }
      if (this.currentRole?.capabilities) {
        response.metadata!['capabilities'] = this.currentRole.capabilities;
      }

      return response;
    } catch (error) {
      const logger = getLogger('ClaudeProvider');
      logger.error('Claude Code SDK call failed:', error);
      throw new Error(`Claude Code SDK request failed: ${error}`);
    }
  }
}
