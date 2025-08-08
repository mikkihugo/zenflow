/**
 * Template Loader - Dynamically load agent templates from src/templates
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AgentTemplate } from '../agents/agent-manager.js';
import type { AgentType } from '../types/agent-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface TemplateManifest {
  name: string;
  type: AgentType;
  version: string;
  description: string;
  author: string;
  capabilities: string[];
  dependencies: string[];
  config: Record<string, unknown>;
}

export class TemplateLoader {
  private templatesPath: string;
  private loadedTemplates = new Map<string, AgentTemplate>();

  constructor() {
    this.templatesPath = join(__dirname, 'agents');
  }

  /**
   * Load all agent templates from src/templates/agents directory
   */
  async loadAllTemplates(): Promise<Map<string, AgentTemplate>> {
    try {
      const { readdir } = await import('node:fs/promises');
      const templateFiles = await readdir(this.templatesPath);

      for (const file of templateFiles) {
        if (file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.json')) {
          await this.loadTemplate(file);
        }
      }

      return this.loadedTemplates;
    } catch (error) {
      console.warn('Failed to load templates from directory:', error);
      return new Map();
    }
  }

  /**
   * Load a specific template file
   *
   * @param filename
   */
  async loadTemplate(filename: string): Promise<AgentTemplate | null> {
    try {
      const filePath = join(this.templatesPath, filename);
      const content = await readFile(filePath, 'utf-8');

      // Parse based on file type
      if (filename.endsWith('.md')) {
        return this.parseMarkdownTemplate(filename, content);
      } else if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
        return this.parseYamlTemplate(filename, content);
      } else if (filename.endsWith('.json')) {
        return this.parseJsonTemplate(filename, content);
      }

      return null;
    } catch (error) {
      console.warn(`Failed to load template ${filename}:`, error);
      return null;
    }
  }

  /**
   * Parse markdown template files
   *
   * @param filename
   * @param content
   */
  private parseMarkdownTemplate(filename: string, content: string): AgentTemplate {
    // Extract agent type from filename
    const agentType = this.extractAgentTypeFromFilename(filename);

    // Parse frontmatter if exists
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const metadata: Record<string, string> = {};

    if (frontmatterMatch) {
      try {
        // Simple YAML parsing for basic metadata
        const frontmatter = frontmatterMatch[1];
        const lines = frontmatter.split('\n');
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
          }
        }
      } catch (error) {
        console.warn(`Failed to parse frontmatter in ${filename}:`, error);
      }
    }

    // Create agent template from markdown content
    const template: AgentTemplate = {
      name: metadata.name || this.formatAgentName(agentType),
      type: agentType as AgentType,
      capabilities: this.createDefaultCapabilities(agentType),
      config: {
        autonomyLevel: parseFloat(metadata.autonomyLevel) || 0.8,
        learningEnabled: metadata.learningEnabled !== 'false',
        adaptationEnabled: metadata.adaptationEnabled !== 'false',
        maxTasksPerHour: parseInt(metadata.maxTasksPerHour) || 15,
        maxConcurrentTasks: parseInt(metadata.maxConcurrentTasks) || 3,
        timeoutThreshold: parseInt(metadata.timeoutThreshold) || 300000,
        reportingInterval: parseInt(metadata.reportingInterval) || 30000,
        heartbeatInterval: parseInt(metadata.heartbeatInterval) || 10000,
        permissions: metadata.permissions?.split(',').map((p: string) => p.trim()) || ['file-read'],
        trustedAgents: [],
        expertise: this.parseExpertise(metadata.expertise),
        preferences: this.parsePreferences(metadata.preferences),
      },
      environment: {
        runtime: metadata.runtime || 'deno',
        version: metadata.version || '1.40.0',
        workingDirectory: `./agents/${agentType}`,
        tempDirectory: `./tmp/${agentType}`,
        logDirectory: `./logs/${agentType}`,
        apiEndpoints: {},
        credentials: {},
        availableTools: metadata.tools?.split(',').map((t: string) => t.trim()) || [],
        toolConfigs: {},
      },
      startupScript: metadata.startupScript || `./scripts/start-${agentType}.ts`,
      dependencies: metadata.dependencies?.split(',').map((d: string) => d.trim()) || [],
    };

    this.loadedTemplates.set(agentType, template);
    return template;
  }

  /**
   * Parse YAML template files (future enhancement)
   *
   * @param filename
   * @param _content
   */
  private parseYamlTemplate(filename: string, _content: string): AgentTemplate {
    // TODO: Implement YAML parsing when needed
    const agentType = this.extractAgentTypeFromFilename(filename);
    return this.createBasicTemplate(agentType);
  }

  /**
   * Parse JSON template files
   *
   * @param filename
   * @param content
   */
  private parseJsonTemplate(filename: string, content: string): AgentTemplate {
    try {
      const data = JSON.parse(content);
      const agentType = this.extractAgentTypeFromFilename(filename);

      return {
        name: data.name || this.formatAgentName(agentType),
        type: agentType as AgentType,
        capabilities: data.capabilities || this.createDefaultCapabilities(agentType),
        config: {
          autonomyLevel: data.config?.autonomyLevel || 0.8,
          learningEnabled: data.config?.learningEnabled !== false,
          adaptationEnabled: data.config?.adaptationEnabled !== false,
          maxTasksPerHour: data.config?.maxTasksPerHour || 15,
          maxConcurrentTasks: data.config?.maxConcurrentTasks || 3,
          timeoutThreshold: data.config?.timeoutThreshold || 300000,
          reportingInterval: data.config?.reportingInterval || 30000,
          heartbeatInterval: data.config?.heartbeatInterval || 10000,
          permissions: data.config?.permissions || ['file-read'],
          trustedAgents: data.config?.trustedAgents || [],
          expertise: data.config?.expertise || {},
          preferences: data.config?.preferences || {},
        },
        environment: data.environment || {
          runtime: 'deno',
          version: '1.40.0',
          workingDirectory: `./agents/${agentType}`,
          tempDirectory: `./tmp/${agentType}`,
          logDirectory: `./logs/${agentType}`,
          apiEndpoints: {},
          credentials: {},
          availableTools: [],
          toolConfigs: {},
        },
        startupScript: data.startupScript || `./scripts/start-${agentType}.ts`,
        dependencies: data.dependencies || [],
      };
    } catch (error) {
      console.warn(`Failed to parse JSON template ${filename}:`, error);
      return this.createBasicTemplate(this.extractAgentTypeFromFilename(filename));
    }
  }

  /**
   * Extract agent type from filename
   *
   * @param filename
   */
  private extractAgentTypeFromFilename(filename: string): string {
    return filename
      .replace(/\.(md|yaml|yml|json)$/, '')
      .replace(/^agent-/, '')
      .toLowerCase();
  }

  /**
   * Format agent name from type
   *
   * @param type
   */
  private formatAgentName(type: string): string {
    return `${type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')} Agent`;
  }

  /**
   * Create default capabilities based on agent type
   *
   * @param type
   */
  interface Capability {
  codeGeneration: boolean;
  codeReview: boolean;
  testing: boolean;
  documentation: boolean;
  research: boolean;
  analysis: boolean;
  webSearch: boolean;
  apiIntegration: boolean;
  fileSystem: boolean;
  terminalAccess: boolean;
  languages: string[];
  frameworks: string[];
  domains: string[];
  tools: string[];
  maxConcurrentTasks: number;
  maxMemoryUsage: number;
  maxExecutionTime: number;
  reliability: number;
  speed: number;
  quality: number;
}

   /**
   * Create default capabilities based on agent type
   *
   * @param type
   */
  private createDefaultCapabilities(type: string): Capability {
    const capabilityMap: Record<string, Capability> = {
      'automation-smart-agent': {
        codeGeneration: true,
        codeReview: false,
        testing: false,
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: true,
        languages: ['typescript', 'javascript'],
        frameworks: ['deno', 'node'],
        domains: ['automation', 'smart-systems', 'workflow'],
        tools: ['automation-tools', 'smart-scheduler'],
        maxConcurrentTasks: 5,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxExecutionTime: 600000,
        reliability: 0.9,
        speed: 0.85,
        quality: 0.9,
      },
      'coordinator-swarm-init': {
        codeGeneration: false,
        codeReview: false,
        testing: false,
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: false,
        languages: [],
        frameworks: ['swarm-coordination'],
        domains: ['coordination', 'swarm-management', 'initialization'],
        tools: ['swarm-coordinator', 'topology-manager'],
        maxConcurrentTasks: 10,
        maxMemoryUsage: 256 * 1024 * 1024,
        maxExecutionTime: 300000,
        reliability: 0.95,
        speed: 0.9,
        quality: 0.9,
      },
      // Add more specific capabilities as needed
    };

    return capabilityMap[type] || this.createGenericCapabilities();
  }

  /**
   * Create generic capabilities
   */
  private createGenericCapabilities(): any {
    return {
      codeGeneration: false,
      codeReview: true,
      testing: false,
      documentation: true,
      research: true,
      analysis: true,
      webSearch: false,
      apiIntegration: false,
      fileSystem: true,
      terminalAccess: false,
      languages: [],
      frameworks: [],
      domains: ['general'],
      tools: ['basic-tools'],
      maxConcurrentTasks: 3,
      maxMemoryUsage: 256 * 1024 * 1024,
      maxExecutionTime: 300000,
      reliability: 0.8,
      speed: 0.7,
      quality: 0.8,
    };
  }

  /**
   * Parse expertise string into object
   *
   * @param expertiseStr
   */
  private parseExpertise(expertiseStr: string): Record<string, number> {
    if (!expertiseStr) return {};

    try {
      // Handle formats like "coordination:0.9,management:0.8"
      const expertise: Record<string, number> = {};
      const pairs = expertiseStr.split(',');
      for (const pair of pairs) {
        const [skill, level] = pair.split(':');
        if (skill && level) {
          expertise[skill.trim()] = parseFloat(level.trim()) || 0.5;
        }
      }
      return expertise;
    } catch (_error) {
      return {};
    }
  }

  /**
   * Parse preferences string into object
   *
   * @param preferencesStr
   */
  private parsePreferences(preferencesStr: string): Record<string, any> {
    if (!preferencesStr) return {};

    try {
      // Handle simple key:value pairs
      const preferences: Record<string, any> = {};
      const pairs = preferencesStr.split(',');
      for (const pair of pairs) {
        const [key, value] = pair.split(':');
        if (key && value) {
          preferences[key.trim()] = value.trim();
        }
      }
      return preferences;
    } catch (_error) {
      return {};
    }
  }

  /**
   * Create basic template fallback
   *
   * @param type
   */
  private createBasicTemplate(type: string): AgentTemplate {
    return {
      name: this.formatAgentName(type),
      type: type as AgentType,
      capabilities: this.createGenericCapabilities(),
      config: {
        autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 10,
        maxConcurrentTasks: 3,
        timeoutThreshold: 300000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read'],
        trustedAgents: [],
        expertise: {},
        preferences: {},
      },
      environment: {
        runtime: 'deno',
        version: '1.40.0',
        workingDirectory: `./agents/${type}`,
        tempDirectory: `./tmp/${type}`,
        logDirectory: `./logs/${type}`,
        apiEndpoints: {},
        credentials: {},
        availableTools: [],
        toolConfigs: {},
      },
      startupScript: `./scripts/start-${type}.ts`,
    };
  }

  /**
   * Get loaded template by type
   *
   * @param type
   */
  getTemplate(type: string): AgentTemplate | undefined {
    return this.loadedTemplates.get(type);
  }

  /**
   * Get all loaded templates
   */
  getAllTemplates(): Map<string, AgentTemplate> {
    return new Map(this.loadedTemplates);
  }
}
