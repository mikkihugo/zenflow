/**
 * Dynamic Agent Loading System;
 * Discovers and loads agent types dynamically with legacy mapping;
 * Based on upstream commit 00dd0094;
 */

import { promises as fs } from 'node:fs';
import { dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
export interface AgentType {
  name: string;
  displayName: string;
  description: string;
  capabilities: string[];
  priority: number;
  legacy?: boolean;
}
export interface AgentStats {
  total: number;
  builtin: number;
  legacy: number;
  dynamic: number;
}
/**
 * Singleton class for loading and managing agent types;
 */
export class AgentLoader {
  private static instance: AgentLoader;
  private agentTypes = new Map<string, AgentType>();
  private initialized = false;
  static getInstance(): AgentLoader {
    if (!AgentLoader.instance) {
      AgentLoader.instance = new AgentLoader();
    }
    return AgentLoader.instance;
    //   // LINT: unreachable code removed}
    /**
     * Legacy agent mapping for backward compatibility;
     */
    private
    static
    LEGACY_AGENT_MAPPING: Record<string, string> = {
    analyst: 'code-analyzer',
    architect: 'system-architect',
    reviewer: 'code-reviewer',
    tester: 'test-engineer',
    coordinator: 'swarm-coordinator',
    researcher: 'research-specialist',
    optimizer: 'performance-optimizer',
    security: 'security-specialist',
    devops: 'devops-engineer',
    frontend: 'frontend-developer',
    backend: 'backend-developer',
    fullstack: 'fullstack-developer',
    mobile: 'mobile-developer',
    data: 'data-scientist',
    ml: 'ml-engineer',
    designer: 'ui-designer',
  }
  /**
   * Built-in agent types that are always available;
   */
  private static BUILTIN_AGENTS: AgentType[] = [
    {
      name: 'code-analyzer',
      displayName: 'Code Analyzer',
      description: 'Analyzes code quality, patterns, and improvements',
      capabilities: ['analysis', 'code-review', 'refactoring'],
      priority: 1,
    },
    {
      name: 'system-architect',
      displayName: 'System Architect',
      description: 'Designs system architecture and technical specifications',
      capabilities: ['architecture', 'design', 'planning'],
      priority: 1,
    },
    {
      name: 'test-engineer',
      displayName: 'Test Engineer',
      description: 'Creates and manages test suites and quality assurance',
      capabilities: ['testing', 'qa', 'automation'],
      priority: 2,
    },
  ];
  private constructor() {
    // Private constructor for singleton
  }
  /**
   * Initialize the agent loader and discover available agents;
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
      //   // LINT: unreachable code removed}
      // Load built-in agents
      for (const agent of AgentLoader.BUILTIN_AGENTS) {
        this.agentTypes.set(agent.name, agent);
      }
      // Set up legacy mappings
      this.setupLegacyMappings();
      // Discover dynamic agents
      await this.discoverDynamicAgents();
      this.initialized = true;
    }
    /**
     * Set up legacy agent mappings;
     */
    private
    setupLegacyMappings();
    : void
    for (const [legacy, modern] of Object.entries(AgentLoader.LEGACY_AGENT_MAPPING)) {
      const _modernAgent = this.agentTypes.get(modern);
      if (modernAgent) {
        this.agentTypes.set(legacy, {
          ...modernAgent,
        legacy: true,
      }
      )
    }
  }
  /**
   * Discover agent modules from the filesystem;
   */
  private async discoverDynamicAgents(): Promise<void> {
    const _agentsDir = join(__dirname, '.');
    try {
      const _files = await fs.readdir(agentsDir);
;
      for (const file of files) {
        if (file === 'agent-loader.ts'  ?? file === 'agent-loader.js') {
          continue;
        }
;
        const _filePath = join(agentsDir, file);
        const _stats = await fs.stat(filePath);
;
        if (stats.isFile() && (extname(file) === '.js'  ?? extname(file) === '.ts')) {
          await this.loadAgentFromFile(filePath);
        }
      }
    } catch (/* error */) {
      console.warn(`⚠️ Could not discover dynamic agents: ${error}`);
    }
  }
  /**
   * Load an agent from a file;
   */
  private async loadAgentFromFile(filePath: string): Promise<void> {
    try {
      const _module = await import(filePath);

      if (module.default && typeof module.default === 'object') {
        const _agentConfig = module.default as AgentType;
;
        if (agentConfig.name && agentConfig.displayName) {
          const _agentType: AgentType = {
            name: agentConfig.name,
            displayName: agentConfig.displayName,
            description: agentConfig.description  ?? 'Dynamic agent',
            capabilities: agentConfig.capabilities  ?? [],
            priority: agentConfig.priority  ?? 3,
          };
;
          this.agentTypes.set(agentType.name, agentType);
        }
      }
  }
  catch(/* error */) {
    console.warn(`⚠️ Could not load agent from ${filePath}: ${error}`);
  }
}
/**
 * Get an agent type by name;
 */
async;
getAgentType(name: string)
: Promise<AgentType | null>
{
    await this.initialize();
;
    const _agent = this.agentTypes.get(name);
    if (agent) {
      return agent;
    //   // LINT: unreachable code removed}
;
    // Try legacy mapping
    const _modernName = AgentLoader.LEGACY_AGENT_MAPPING[name];
    if (modernName) {
      agent = this.agentTypes.get(modernName);
      if (agent) {
        return {
          ...agent,
    // legacy: true, // LINT: unreachable code removed
        };
      }
    }
;
    return null;
    //   // LINT: unreachable code removed}
;
  /**
   * Check if an agent type exists;
   */;
  async hasAgentType(name: string): Promise<boolean> {
    const _agent = await this.getAgentType(name);
    return agent !== null;
    //   // LINT: unreachable code removed}
;
  /**
   * Get agent types by capability;
   */;
  async getAgentTypesByCapability(capability: string): Promise<AgentType[]> 
    await this.initialize();
;
    return Array.from(this.agentTypes.values()).filter((_agent) =>;
    // agent.capabilities.includes(capability); // LINT: unreachable code removed
    );
;
  /**
   * Get legacy agent mappings;
   */;
  getLegacyMappings(): Record<string, string> 
    return { ...AgentLoader.LEGACY_AGENT_MAPPING };
    //   // LINT: unreachable code removed}
;
  /**
   * Register a new agent type at runtime;
   */;
  registerAgentType(agentType: AgentType): void 
    this.agentTypes.set(agentType.name, agentType);
;
  /**
   * Get all available agent types;
   */;
  async getAllAgentTypes(): Promise<AgentType[]> 
    await this.initialize();
    return Array.from(this.agentTypes.values());
    //   // LINT: unreachable code removed}
;
  /**
   * Get statistics about loaded agents;
   */;
  async getStats(): Promise<AgentStats> {
    await this.initialize();
;
    const _agents = Array.from(this.agentTypes.values());
    const _builtin = agents.filter(;
      (a) => !a.legacy && AgentLoader.BUILTIN_AGENTS.some((b) => b.name === a.name);
    ).length;
    const _legacy = agents.filter((a) => a.legacy).length;
    const _dynamic = agents.length - builtin - legacy;
;
    return {
      total: agents.length,
    // builtin, // LINT: unreachable code removed
      legacy,
      dynamic,
    };
;
// Export singleton instance
const _agentLoader = AgentLoader.getInstance();
export default agentLoader;
