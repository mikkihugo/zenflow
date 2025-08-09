/**
 * Sub-Agent Configuration Generator
 * Maps our 104 agent types to Claude Code sub-agent configurations
 * Generates templates for external projects (not for this dev codebase)
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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
 * Sub-agent configuration templates for different agent categories
 */
export const SUB_AGENT_TEMPLATES: Record<string, Partial<SubAgentConfig>> = {
  // Core Development Agents
  coder: {
    name: 'Code Developer',
    description: 'Full-stack development specialist for implementing features and fixes',
    systemPrompt:
      'You are a senior software developer specializing in clean, maintainable code. Focus on:\n- **Code Quality**: Write readable, well-documented code following best practices\n- **Testing**: Include comprehensive tests with good coverage\n- **Performance**: Consider performance implications of implementations\n- **Security**: Follow secure coding practices\n- **Maintainability**: Structure code for easy future modifications\nAlways provide working, tested code with clear explanations.',
    tools: ['Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Grep'],
    capabilities: { codeGeneration: true, testing: true, debugging: true },
    domains: ['development', 'coding', 'implementation'],
    triggers: ['implement', 'code', 'develop', 'create function'],
  },

  // Analysis and Research Agents
  analyst: {
    name: 'System Analyst',
    description: 'Requirements analysis and system design specialist',
    systemPrompt:
      'You are a business analyst specializing in:\n- **Requirements Gathering**: Extract and clarify business requirements\n- **System Analysis**: Analyze existing systems and identify improvement opportunities\n- **Process Optimization**: Design efficient workflows and processes\n- **Documentation**: Create clear, comprehensive analysis documentation\n- **Stakeholder Communication**: Bridge technical and business perspectives\nProvide thorough analysis with actionable recommendations.',
    tools: ['Read', 'WebSearch', 'Write', 'Edit'],
    capabilities: { analysis: true, research: true, documentation: true },
    domains: ['analysis', 'requirements', 'business-process'],
    triggers: ['analyze', 'requirements', 'business analysis', 'process review'],
  },

  researcher: {
    name: 'Research Specialist',
    description: 'Deep research and information gathering expert',
    systemPrompt:
      'You are a research specialist expert at:\n- **Information Gathering**: Find relevant, credible sources quickly\n- **Technology Research**: Investigate new technologies and best practices\n- **Competitive Analysis**: Research market solutions and alternatives\n- **Documentation Review**: Analyze existing documentation and codebases\n- **Trend Analysis**: Identify emerging patterns and technologies\nProvide comprehensive, well-sourced research with clear summaries.',
    tools: ['WebSearch', 'Read', 'Grep', 'Write'],
    capabilities: { research: true, webSearch: true, analysis: true },
    domains: ['research', 'investigation', 'technology-trends'],
    triggers: ['research', 'investigate', 'find information', 'technology comparison'],
  },

  // Testing Specialists
  tester: {
    name: 'Quality Assurance Tester',
    description: 'Comprehensive testing and quality assurance specialist',
    systemPrompt:
      'You are a QA testing expert specializing in:\n- **Test Strategy**: Design comprehensive testing strategies\n- **Test Automation**: Create automated test suites\n- **Bug Detection**: Identify and document defects systematically\n- **Performance Testing**: Test system performance and scalability\n- **Security Testing**: Identify security vulnerabilities\n- **User Experience**: Validate user workflows and usability\nFocus on thorough testing coverage and clear bug reports.',
    tools: ['Read', 'Write', 'Edit', 'Bash', 'Grep'],
    capabilities: { testing: true, automation: true, qualityAssurance: true },
    domains: ['testing', 'qa', 'automation', 'quality'],
    triggers: ['test', 'qa', 'quality assurance', 'bug testing'],
  },

  // Architecture and Design
  architect: {
    name: 'Software Architect',
    description: 'System architecture and technical design specialist',
    systemPrompt:
      'You are a software architect focusing on:\n- **System Design**: Create scalable, maintainable architectures\n- **Technology Selection**: Choose appropriate technologies and patterns\n- **Design Patterns**: Apply proven architectural patterns\n- **Performance Architecture**: Design for scale and performance\n- **Security Architecture**: Implement secure design principles\n- **Documentation**: Create clear architectural documentation\nEmphasize long-term maintainability and scalability.',
    tools: ['Read', 'Write', 'Edit', 'WebSearch'],
    capabilities: { systemDesign: true, architectureReview: true, technologySelection: true },
    domains: ['architecture', 'system-design', 'scalability'],
    triggers: ['architecture', 'system design', 'technical design', 'scalability'],
  },

  debug: {
    name: 'Debug Specialist',
    description: 'Advanced debugging and troubleshooting expert',
    systemPrompt:
      'You are a debugging expert specializing in:\n- **Root Cause Analysis**: Systematically identify issue sources\n- **Performance Debugging**: Find bottlenecks and optimization opportunities\n- **Memory Analysis**: Detect memory leaks and resource issues\n- **Concurrency Issues**: Debug race conditions and synchronization problems\n- **System Debugging**: Troubleshoot infrastructure and deployment issues\nUse systematic debugging methodology with clear step-by-step analysis.',
    tools: ['Read', 'Bash', 'Grep', 'Edit', 'LS'],
    capabilities: { debugging: true, performanceAnalysis: true, systemTroubleshooting: true },
    domains: ['debugging', 'troubleshooting', 'performance'],
    triggers: ['debug', 'troubleshoot', 'fix issue', 'performance problem'],
  },
};

/**
 * Generate sub-agent configuration for a specific agent type
 *
 * @param agentType
 */
export function generateSubAgentConfig(agentType: AgentType): SubAgentConfig {
  const template = SUB_AGENT_TEMPLATES[agentType];

  if (!template) {
    // Generate generic configuration for unmapped agent types
    return generateGenericConfig(agentType);
  }

  return {
    name: template.name || `${agentType} Agent`,
    description: template.description || `Specialized ${agentType} agent`,
    systemPrompt: template.systemPrompt || `You are a ${agentType} specialist.`,
    tools: template.tools || ['Read', 'Write', 'Edit'],
    capabilities: template.capabilities || {},
    domains: template.domains || [agentType],
    triggers: template.triggers || [agentType],
  };
}

/**
 * Generate generic configuration for unmapped agent types
 *
 * @param agentType
 */
function generateGenericConfig(agentType: AgentType): SubAgentConfig {
  const name = agentType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    name: `${name} Agent`,
    description: `Specialized ${agentType} agent for domain-specific tasks`,
    systemPrompt: `You are a ${name.toLowerCase()} specialist with expertise in ${agentType} tasks. Focus on delivering high-quality results in your domain of expertise.`,
    tools: ['Read', 'Write', 'Edit', 'Bash'],
    capabilities: { [agentType.replace('-', '_')]: true },
    domains: [agentType],
    triggers: [agentType, name.toLowerCase()],
  };
}

/**
 * Generate all sub-agent configurations for template system
 *
 * @param outputDir
 */
export async function generateAllSubAgentTemplates(outputDir: string): Promise<void> {
  const agentTypes: AgentType[] = [
    // Core Foundation Agents
    'coder',
    'analyst',
    'researcher',
    'coordinator',
    'tester',
    'architect',
    'debug',
    'queen',
    'specialist',
    'reviewer',
    'optimizer',
    'documenter',
    'monitor',
    'planner',

    // Development Agents
    'requirements-engineer',
    'design-architect',
    'task-planner',
    'developer',
    'system-architect',
    'steering-author',
    'dev-backend-api',
    'frontend-dev',
    'fullstack-dev',
    'api-dev',

    // Testing Agents
    'unit-tester',
    'integration-tester',
    'e2e-tester',
    'performance-tester',
    'tdd-london-swarm',
    'production-validator',

    // Architecture Agents
    'arch-system-design',
    'database-architect',
    'cloud-architect',
    'security-architect',

    // DevOps Agents
    'ops-cicd-github',
    'infrastructure-ops',
    'monitoring-ops',
    'deployment-ops',

    // Documentation Agents
    'docs-api-openapi',
    'user-guide-writer',
    'technical-writer',
    'readme-writer',

    // Analysis Agents
    'analyze-code-quality',
    'performance-analyzer',
    'security-analyzer',
    'refactoring-analyzer',

    // Specialized Agents
    'ai-ml-specialist',
    'data-ml-model',
    'blockchain-specialist',
  ];

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  // Generate configurations for each agent type
  for (const agentType of agentTypes) {
    const config = generateSubAgentConfig(agentType);
    const filename = `${agentType}.json`;
    const filepath = join(outputDir, filename);

    await writeFile(filepath, JSON.stringify(config, null, 2), 'utf8');
  }
}

/**
 * Enhanced Task tool integration with sub-agent support
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
 * Map agent type to optimal Claude Code sub-agent
 *
 * @param agentType
 */
export function mapToClaudeSubAgent(agentType: AgentType): string {
  const mappings: Record<string, string> = {
    'code-review-swarm': 'code-reviewer',
    debug: 'debugger',
    'ai-ml-specialist': 'ai-ml-specialist',
    'database-architect': 'database-architect',
    'system-architect': 'system-architect',
    'swarm-coordinator': 'swarm-coordinator',
    'security-analyzer': 'security-specialist',
    'performance-analyzer': 'performance-specialist',
  };

  return mappings[agentType] || agentType;
}

export default {
  generateSubAgentConfig,
  generateAllSubAgentTemplates,
  mapToClaudeSubAgent,
  SUB_AGENT_TEMPLATES,
};
