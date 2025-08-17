/**
 * Sub-Agent Configuration Generator
 * Maps our 104 agent types to Claude Code sub-agent configurations
 * Generates templates for external projects (not for this dev codebase).
 */
/**
 * @file Coordination system: sub-agent-generator.
 */
import type { AgentType } from '../types/agent-types';
export interface SubAgentConfig {
    name: string;
    description: string;
    systemPrompt: string;
    tools: string[];
    capabilities: Record<string, boolean>;
    domains: string[];
    triggers: string[];
}
export interface SubAgentTemplate {
    agentType: AgentType;
    config: SubAgentConfig;
    category: string;
}
/**
 * Sub-agent configuration templates for different agent categories.
 */
export declare const SUB_AGENT_TEMPLATES: Record<string, Partial<SubAgentConfig>>;
/**
 * Generate sub-agent configuration for a specific agent type.
 *
 * @param agentType
 * @example
 */
export declare function generateSubAgentConfig(agentType: AgentType): SubAgentConfig;
/**
 * Generate all sub-agent configurations for template system.
 *
 * @param outputDir
 * @example
 */
export declare function generateAllSubAgentTemplates(outputDir: string): Promise<void>;
/**
 * Enhanced Task tool integration with sub-agent support.
 *
 * @example
 */
export interface TaskWithSubAgent {
    description: string;
    prompt: string;
    subagent_type: AgentType;
    use_claude_subagent?: boolean;
}
/**
 * Map agent type to optimal Claude Code sub-agent.
 *
 * @param agentType
 * @example
 */
export declare function mapToClaudeSubAgent(agentType: AgentType): string;
declare const _default: {
    generateSubAgentConfig: typeof generateSubAgentConfig;
    generateAllSubAgentTemplates: typeof generateAllSubAgentTemplates;
    mapToClaudeSubAgent: typeof mapToClaudeSubAgent;
    SUB_AGENT_TEMPLATES: Record<string, Partial<SubAgentConfig>>;
};
export default _default;
//# sourceMappingURL=sub-agent-generator.d.ts.map