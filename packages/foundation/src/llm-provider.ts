/**
 * @fileoverview Generic LLM Provider with Pluggable CLI Tools
 * 
 * Generic LLM provider that can use different CLI tools (Claude, Gemini, etc.)
 * through a pluggable provider architecture. Maintains backward compatibility.
 */

// Use CLI tools architecture
import { getDefaultCLIProvider, getCLIProvider, type CLIProvider } from './cli-tools';
import type { CLIRequest, CLIResponse, SwarmAgentRole } from './types/cli-providers';

// Re-export CLI types for backward compatibility
export type { CLIMessage as LLMMessage, CLIRequest as LLMRequest, CLIResponse as LLMResponse, SwarmAgentRole } from './types/cli-providers';

// Import swarm agent roles from Claude provider for backward compatibility
import { CLAUDE_SWARM_AGENT_ROLES } from './cli-tools/claude';
export const SWARM_AGENT_ROLES = CLAUDE_SWARM_AGENT_ROLES;

// Generic LLM Provider with pluggable CLI tool backends
export class LLMProvider {
  private cliProvider: CLIProvider;
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor(providerId?: string) {
    // Use specified provider or default to Claude
    this.cliProvider = providerId ? (getCLIProvider(providerId) || getDefaultCLIProvider()) : getDefaultCLIProvider();
  }

  // Set the agent role for specialized behavior
  setRole(roleName: keyof typeof SWARM_AGENT_ROLES): void {
    this.cliProvider.setRole(roleName);
  }

  // Get current role
  getRole(): SwarmAgentRole | undefined {
    return this.cliProvider.getRole();
  }

  // Switch CLI provider
  switchProvider(providerId: string): void {
    const newProvider = getCLIProvider(providerId);
    if (newProvider) {
      const currentRole = this.cliProvider.getRole();
      this.cliProvider = newProvider;
      if (currentRole) {
        this.cliProvider.setRole(currentRole.role);
      }
    } else {
      throw new Error(`CLI provider '${providerId}' not found`);
    }
  }

  // Get current provider info
  getProviderInfo(): { id: string; name: string; capabilities: any } {
    return {
      id: this.cliProvider.id,
      name: this.cliProvider.name,
      capabilities: this.cliProvider.getCapabilities()
    };
  }

  // Delegate to CLI provider for tool permissions (backward compatibility)

  async chat(request: CLIRequest): Promise<CLIResponse> {
    this.requestCount++;
    this.lastRequestTime = Date.now();

    try {
      return await this.cliProvider.execute(request);
    } catch (error) {
      console.error('CLI provider call failed:', error);
      throw new Error(`LLM request failed: ${error}`);
    }
  }

  // Role-specific helper methods - delegate to CLI provider
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
    return this.cliProvider.complete(prompt, options);
  }

  // Helper for analysis tasks
  async analyze(task: string, data: string, options?: Partial<CLIRequest>): Promise<string> {
    const prompt = `Task: ${task}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;
    return this.complete(prompt, options);
  }

  // Direct task execution using CLI provider (expected by swarm functions)
  async executeTask(prompt: string, options?: any): Promise<any> {
    return this.cliProvider.executeTask(prompt, options);
  }

  // Get usage statistics
  getUsageStats(): { requestCount: number; lastRequestTime: number; currentRole?: string; provider?: string } {
    const providerStats = this.cliProvider.getUsageStats();
    return {
      requestCount: this.requestCount + (providerStats.requestCount || 0),
      lastRequestTime: Math.max(this.lastRequestTime, providerStats.lastRequestTime || 0),
      currentRole: providerStats.currentRole,
      provider: this.cliProvider.id
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
      llm.setRole(agent.role);
      const result = await llm.complete(task.description, {
        model: agent.model || 'sonnet'
      });
      results.push({
        role: agent.role,
        output: result
      });
    }
  } else {
    // Parallel execution - create separate LLM instances
    const promises = task.agents.map(async (agent) => {
      const agentLLM = new LLMProvider();
      agentLLM.setRole(agent.role);
      const result = await agentLLM.complete(task.description, {
        model: agent.model || 'sonnet'
      });
      return {
        role: agent.role,
        output: result
      };
    });
    
    results.push(...await Promise.all(promises));
  }
  
  return results;
}

