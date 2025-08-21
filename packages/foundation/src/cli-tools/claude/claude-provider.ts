/**
 * @fileoverview Claude Code CLI Provider Implementation
 * 
 * Claude-specific implementation of the CLI provider interface.
 * Integrates directly with Claude Code SDK for swarm agent capabilities.
 */

import { executeClaudeTask, type ClaudeSDKOptions } from './claude-sdk';
import type { 
  CLIProvider, 
  CLIRequest, 
  CLIResponse, 
  SwarmAgentRole,
  CLIProviderCapabilities 
} from '../../types/cli-providers';

export const CLAUDE_SWARM_AGENT_ROLES: Record<string, SwarmAgentRole> = {
  assistant: {
    role: 'assistant',
    systemPrompt: 'You are a helpful AI assistant that provides accurate, concise responses and follows instructions carefully.',
    capabilities: ['general-assistance', 'question-answering', 'task-guidance']
  },
  
  coder: {
    role: 'coder',
    systemPrompt: 'You are an expert software engineer with full system access. Write clean, efficient, well-documented code. Follow best practices and coding standards. You have dangerous permissions enabled - use all available tools as needed.',
    capabilities: ['code-generation', 'debugging', 'refactoring', 'code-review', 'system-access', 'file-operations', 'bash-commands']
  },
  
  analyst: {
    role: 'analyst',
    systemPrompt: 'You are a data analyst and system architect. Analyze requirements, identify patterns, and provide strategic insights.',
    capabilities: ['data-analysis', 'pattern-recognition', 'requirements-analysis', 'system-design']
  },
  
  researcher: {
    role: 'researcher',
    systemPrompt: 'You are a research specialist. Gather information, analyze sources, and provide comprehensive research summaries.',
    capabilities: ['information-gathering', 'source-analysis', 'research-synthesis', 'fact-checking']
  },
  
  coordinator: {
    role: 'coordinator',
    systemPrompt: 'You are a project coordinator. Manage tasks, coordinate between team members, and ensure project goals are met.',
    capabilities: ['task-management', 'team-coordination', 'project-planning', 'resource-allocation']
  },
  
  tester: {
    role: 'tester',
    systemPrompt: 'You are a QA engineer. Design tests, identify edge cases, validate functionality, and ensure quality standards.',
    capabilities: ['test-design', 'quality-assurance', 'edge-case-identification', 'validation']
  },
  
  architect: {
    role: 'architect',
    systemPrompt: 'You are a system architect. Design scalable systems, make architectural decisions, and ensure technical excellence.',
    capabilities: ['system-architecture', 'technical-design', 'scalability-planning', 'technology-selection']
  }
};

export class ClaudeProvider implements CLIProvider {
  public readonly id = 'claude-code';
  public readonly name = 'Claude Code CLI';
  
  private requestCount = 0;
  private lastRequestTime = 0;
  private currentRole: SwarmAgentRole | undefined;

  constructor() {
    // Set coder as default role with dangerous permissions enabled
    this.setRole('coder');
  }

  getCapabilities(): CLIProviderCapabilities {
    return {
      models: ['sonnet', 'opus'],
      defaultModel: 'sonnet',
      maxContextTokens: 200000, // Claude's large context
      maxOutputTokens: 8000,
      features: {
        structuredOutput: true,
        fileOperations: true, // Can read/write files directly
        codebaseAware: true, // Best codebase understanding
        streaming: false,
        systemPrompts: true,
        toolCalling: true
      },
      routing: {
        priority: 1,
        useForSmallContext: true,
        useForLargeContext: true, // Excellent for codebase analysis
        fallbackOrder: 0, // First preference when available
      }
    };
  }

  // Set the agent role for specialized behavior
  setRole(roleName: keyof typeof CLAUDE_SWARM_AGENT_ROLES): void {
    this.currentRole = CLAUDE_SWARM_AGENT_ROLES[roleName];
  }

  // Get current role
  getRole(): SwarmAgentRole | undefined {
    return this.currentRole;
  }

  // Get allowed tools based on agent role
  private getAllowedToolsForRole(role?: string): string[] {
    switch (role) {
      case 'coder':
        // Coder gets ALL tools - no restrictions (dangerous permissions enabled by default)
        return []; // Empty array triggers dangerous mode - bypasses all permission checks
      case 'tester':
        // Testers need some file tools but not full system access
        return ['Read', 'Write', 'Glob', 'Grep', 'TodoWrite'];
      case 'architect':
        // Architects work with design and documentation
        return ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'TodoWrite'];
      case 'analyst':
        // Analysts primarily read and analyze
        return ['Read', 'Glob', 'Grep', 'TodoWrite'];
      case 'researcher':
        // Researchers need web access and reading tools
        return ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'TodoWrite'];
      case 'coordinator':
        // Coordinators manage tasks and documents but don't execute system commands
        return ['Read', 'Write', 'Edit', 'TodoWrite'];
      case 'assistant':
      default:
        // Default safe set - no file tools for basic assistant
        return ['TodoWrite']; // Only basic task management
    }
  }

  async execute(request: CLIRequest): Promise<CLIResponse> {
    this.requestCount++;
    this.lastRequestTime = Date.now();

    // Add role system prompt if set
    const messages = [...request.messages];
    if (this.currentRole && messages[0]?.role !== 'system') {
      messages.unshift({
        role: 'system',
        content: this.currentRole.systemPrompt
      });
    }

    try {
      return await this.callClaudeCodeCLI({ ...request, messages });
    } catch (error) {
      console.error('Claude Code CLI call failed:', error);
      throw new Error(`Claude CLI request failed: ${error}`);
    }
  }

  // Role-specific helper methods
  async executeAsAssistant(prompt: string, options?: Partial<CLIRequest>): Promise<string> {
    this.setRole('assistant');
    return this.complete(prompt, options);
  }

  async executeAsCoder(task: string, context?: string, options?: Partial<CLIRequest>): Promise<string> {
    this.setRole('coder');
    const prompt = context 
      ? `Coding task: ${task}\n\nContext:\n${context}\n\nPlease provide the code solution:`
      : `Coding task: ${task}`;
    return this.complete(prompt, options);
  }

  async executeAsAnalyst(data: string, analysis_type: string, options?: Partial<CLIRequest>): Promise<string> {
    this.setRole('analyst');
    const prompt = `Analysis type: ${analysis_type}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;
    return this.complete(prompt, options);
  }

  async executeAsResearcher(topic: string, scope?: string, options?: Partial<CLIRequest>): Promise<string> {
    this.setRole('researcher');
    const prompt = scope 
      ? `Research topic: ${topic}\nScope: ${scope}\n\nPlease provide comprehensive research:` 
      : `Research topic: ${topic}\n\nPlease provide comprehensive research:`;
    return this.complete(prompt, options);
  }

  async executeAsCoordinator(task: string, team_context?: string, options?: Partial<CLIRequest>): Promise<string> {
    this.setRole('coordinator');
    const prompt = team_context 
      ? `Coordination task: ${task}\nTeam context: ${team_context}\n\nPlease provide coordination plan:`
      : `Coordination task: ${task}\n\nPlease provide coordination plan:`;
    return this.complete(prompt, options);
  }

  async executeAsTester(feature: string, requirements?: string, options?: Partial<CLIRequest>): Promise<string> {
    this.setRole('tester');
    const prompt = requirements 
      ? `Feature to test: ${feature}\nRequirements: ${requirements}\n\nPlease provide test plan and cases:`
      : `Feature to test: ${feature}\n\nPlease provide test plan and cases:`;
    return this.complete(prompt, options);
  }

  async executeAsArchitect(system: string, requirements?: string, options?: Partial<CLIRequest>): Promise<string> {
    this.setRole('architect');
    const prompt = requirements 
      ? `System to architect: ${system}\nRequirements: ${requirements}\n\nPlease provide architectural design:`
      : `System to architect: ${system}\n\nPlease provide architectural design:`;
    return this.complete(prompt, options);
  }

  // Helper for simple text completion
  async complete(prompt: string, options?: Partial<CLIRequest>): Promise<string> {
    const response = await this.execute({
      messages: [{ role: 'user', content: prompt }],
      ...options
    });
    return response.content;
  }

  // Direct task execution using Claude Code SDK (expected by swarm functions)
  async executeTask(prompt: string, options?: ClaudeSDKOptions): Promise<any> {
    // Use role-based tool permissions if a role is set
    const allowedTools = this.currentRole ? this.getAllowedToolsForRole(this.currentRole.role) : [];
    
    const sdkOptions: ClaudeSDKOptions = {
      allowedTools,
      model: 'sonnet',
      fallbackModel: 'opus',
      maxTurns: 45,
      ...options
    };

    // Add system prompt from current role if set
    if (this.currentRole?.systemPrompt && !sdkOptions.customSystemPrompt) {
      sdkOptions.customSystemPrompt = this.currentRole.systemPrompt;
    }

    return executeClaudeTask(prompt, sdkOptions);
  }

  // Get usage statistics
  getUsageStats(): { requestCount: number; lastRequestTime: number; currentRole?: string } {
    const stats: { requestCount: number; lastRequestTime: number; currentRole?: string } = {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
    
    if (this.currentRole?.role) {
      stats.currentRole = this.currentRole.role;
    }
    
    return stats;
  }

  private async callClaudeCodeCLI(request: CLIRequest): Promise<CLIResponse> {
    // Use actual Claude Code SDK integration
    const prompt = request.messages.map(m => {
      if (m.role === 'system') return m.content;
      return `${m.role}: ${m.content}`;
    }).join('\n\n');
    
    // Always default to sonnet unless opus explicitly requested
    const model = request.model === 'opus' ? 'opus' : 'sonnet';
    const fallbackModel = model === 'opus' ? 'sonnet' : undefined; // Only opus needs fallback
    
    // Tool permissions based on agent role
    const allowedTools = this.getAllowedToolsForRole(this.currentRole?.role);
    
    const sdkOptions: ClaudeSDKOptions = {
      model,
      maxTurns: 45, // Standard turn limit for CLI calls
      allowedTools, // Tools based on agent role
      timeoutMs: 1800000 // 30 minute timeout for complex tasks
    };

    // Add optional properties only if they have values
    if (fallbackModel) {
      sdkOptions.fallbackModel = fallbackModel;
    }
    if (this.currentRole?.systemPrompt) {
      sdkOptions.customSystemPrompt = this.currentRole.systemPrompt;
    }

    try {
      const messages = await executeClaudeTask(prompt, sdkOptions);
      const lastMessage = messages[messages.length - 1];
      
      // Extract content from Claude message
      let content = 'No response from Claude';
      if (lastMessage && 'message' in lastMessage && lastMessage.message) {
        if ('content' in lastMessage.message) {
          content = String(lastMessage.message.content) || content;
        }
      } else if (lastMessage && 'result' in lastMessage && lastMessage.result) {
        content = lastMessage.result;
      }
      
      const response: CLIResponse = {
        content,
        model: `claude-3-${model}-20240229`,
        usage: {
          promptTokens: Math.floor(prompt.length / 4), // Rough estimate
          completionTokens: Math.floor(content.length / 4),
          totalTokens: Math.floor((prompt.length + content.length) / 4)
        },
        metadata: {
          provider: 'claude-code-cli',
          model: model,
          timestamp: Date.now()
        }
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
      console.error('Claude Code SDK call failed:', error);
      throw new Error(`Claude Code SDK request failed: ${error}`);
    }
  }
}