/**
 * Dynamic Agent Loading System
 * Discovers and loads agent types dynamically with legacy mapping
 * Based on upstream commit 00dd0094
 */

import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AgentLoader {
  static instance = null;
  
  constructor() {
    this.agentTypes = new Map();
    this.initialized = false;
  }

  static getInstance() {
    if (!AgentLoader.instance) {
      AgentLoader.instance = new AgentLoader();
    }
    return AgentLoader.instance;
  }

  /**
   * Legacy agent mapping for backward compatibility
   */
  static LEGACY_AGENT_MAPPING = {
    'analyst': 'code-analyzer',
    'architect': 'system-architect',
    'reviewer': 'code-reviewer',
    'tester': 'test-engineer',
    'coordinator': 'swarm-coordinator',
    'researcher': 'research-specialist',
    'optimizer': 'performance-optimizer',
    'security': 'security-specialist',
    'devops': 'devops-engineer',
    'frontend': 'frontend-developer',
    'backend': 'backend-developer',
    'fullstack': 'fullstack-developer',
    'mobile': 'mobile-developer',
    'data': 'data-scientist',
    'ml': 'ml-engineer',
    'designer': 'ui-designer'
  };

  /**
   * Built-in agent types that are always available
   */
  static BUILTIN_AGENTS = [
    {
      name: 'code-analyzer',
      displayName: 'Code Analyzer',
      description: 'Analyzes code quality, complexity, and patterns',
      capabilities: ['static-analysis', 'complexity-metrics', 'pattern-detection'],
      legacy: false
    },
    {
      name: 'system-architect',
      displayName: 'System Architect',
      description: 'Designs system architecture and high-level structure',
      capabilities: ['architecture-design', 'system-planning', 'technical-decisions'],
      legacy: false
    },
    {
      name: 'code-reviewer',
      displayName: 'Code Reviewer',
      description: 'Reviews code for quality, security, and best practices',
      capabilities: ['code-review', 'security-audit', 'best-practices'],
      legacy: false
    },
    {
      name: 'test-engineer',
      displayName: 'Test Engineer',
      description: 'Creates and executes comprehensive test strategies',
      capabilities: ['test-creation', 'test-automation', 'quality-assurance'],
      legacy: false
    },
    {
      name: 'swarm-coordinator',
      displayName: 'Swarm Coordinator',
      description: 'Coordinates multi-agent workflows and task distribution',
      capabilities: ['task-orchestration', 'agent-coordination', 'workflow-management'],
      legacy: false
    },
    {
      name: 'research-specialist',
      displayName: 'Research Specialist',
      description: 'Conducts research and gathers technical information',
      capabilities: ['information-gathering', 'technical-research', 'documentation'],
      legacy: false
    },
    {
      name: 'performance-optimizer',
      displayName: 'Performance Optimizer',
      description: 'Optimizes system and code performance',
      capabilities: ['performance-analysis', 'optimization', 'benchmarking'],
      legacy: false
    },
    {
      name: 'security-specialist',
      displayName: 'Security Specialist',
      description: 'Focuses on security analysis and vulnerability assessment',
      capabilities: ['security-analysis', 'vulnerability-scanning', 'threat-modeling'],
      legacy: false
    },
    {
      name: 'devops-engineer',
      displayName: 'DevOps Engineer',
      description: 'Handles deployment, infrastructure, and CI/CD',
      capabilities: ['deployment', 'infrastructure', 'ci-cd', 'monitoring'],
      legacy: false
    },
    {
      name: 'frontend-developer',
      displayName: 'Frontend Developer',
      description: 'Specializes in frontend development and UI/UX',
      capabilities: ['frontend-development', 'ui-design', 'user-experience'],
      legacy: false
    },
    {
      name: 'backend-developer',
      displayName: 'Backend Developer',
      description: 'Focuses on backend services and API development',
      capabilities: ['backend-development', 'api-design', 'database-design'],
      legacy: false
    },
    {
      name: 'fullstack-developer',
      displayName: 'Full-Stack Developer',
      description: 'Handles both frontend and backend development',
      capabilities: ['frontend-development', 'backend-development', 'full-stack'],
      legacy: false
    }
  ];

  /**
   * Initialize the agent loader
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Load built-in agents
    for (const agent of AgentLoader.BUILTIN_AGENTS) {
      this.agentTypes.set(agent.name, agent);
    }

    // Add legacy mappings
    for (const [legacy, modern] of Object.entries(AgentLoader.LEGACY_AGENT_MAPPING)) {
      const modernAgent = this.agentTypes.get(modern);
      if (modernAgent) {
        this.agentTypes.set(legacy, {
          ...modernAgent,
          name: legacy,
          displayName: `${modernAgent.displayName} (Legacy)`,
          legacy: true
        });
      }
    }

    // Discover dynamic agents from filesystem
    await this.discoverDynamicAgents();

    this.initialized = true;
  }

  /**
   * Discover agent modules from the filesystem
   */
  async discoverDynamicAgents() {
    const agentsDir = join(__dirname, '.');
    
    try {
      const files = await fs.readdir(agentsDir);
      
      for (const file of files) {
        if (file === 'agent-loader.js' || file === 'agent-loader.ts') {
          continue;
        }

        const filePath = join(agentsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && (extname(file) === '.js' || extname(file) === '.ts')) {
          await this.loadAgentFromFile(filePath);
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not discover dynamic agents: ${error.message}`);
    }
  }

  /**
   * Load an agent from a file
   */
  async loadAgentFromFile(filePath) {
    try {
      const module = await import(filePath);
      
      if (module.default && typeof module.default === 'object') {
        const agentConfig = module.default;
        
        if (agentConfig.name && agentConfig.displayName) {
          const agentType = {
            name: agentConfig.name,
            displayName: agentConfig.displayName,
            description: agentConfig.description || 'Dynamically loaded agent',
            capabilities: agentConfig.capabilities || [],
            module: module,
            legacy: false
          };
          
          this.agentTypes.set(agentType.name, agentType);
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not load agent from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get all available agent types
   */
  async getAgentTypes() {
    await this.initialize();
    return Array.from(this.agentTypes.values());
  }

  /**
   * Get a specific agent type by name
   */
  async getAgentType(name) {
    await this.initialize();
    
    // Try direct lookup first
    let agent = this.agentTypes.get(name);
    if (agent) {
      return agent;
    }

    // Try legacy mapping
    const modernName = AgentLoader.LEGACY_AGENT_MAPPING[name];
    if (modernName) {
      agent = this.agentTypes.get(modernName);
      if (agent) {
        return {
          ...agent,
          name: name,
          displayName: `${agent.displayName} (Legacy: ${name})`,
          legacy: true
        };
      }
    }

    return null;
  }

  /**
   * Check if an agent type exists
   */
  async hasAgentType(name) {
    const agent = await this.getAgentType(name);
    return agent !== null;
  }

  /**
   * Get agent types by capability
   */
  async getAgentTypesByCapability(capability) {
    await this.initialize();
    return Array.from(this.agentTypes.values()).filter(agent =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Get legacy agent mappings
   */
  getLegacyMappings() {
    return { ...AgentLoader.LEGACY_AGENT_MAPPING };
  }

  /**
   * Register a new agent type at runtime
   */
  registerAgentType(agentType) {
    this.agentTypes.set(agentType.name, agentType);
  }

  /**
   * Get agent statistics
   */
  async getStats() {
    await this.initialize();
    
    const agents = Array.from(this.agentTypes.values());
    const builtin = agents.filter(a => !a.legacy && AgentLoader.BUILTIN_AGENTS.some(b => b.name === a.name)).length;
    const legacy = agents.filter(a => a.legacy).length;
    const dynamic = agents.length - builtin - legacy;
    
    return {
      total: agents.length,
      builtin,
      dynamic,
      legacy
    };
  }
}

// Export singleton instance
export const agentLoader = AgentLoader.getInstance();
export default agentLoader;