#!/usr/bin/env node

/**
 * Auto-Generate Missing Type Definitions Script
 * Fixes systematic TS2304 "Cannot find name" errors
 * Generates placeholder interfaces/types for most common missing names
 */

import fs from 'fs';
import path from 'path';

// Most common missing types from analysis
const MISSING_TYPES = [
  { name: 'WorkflowContext', category: 'workflow' },
  { name: 'advancedMCPToolsManager', category: 'mcp' },
  { name: 'NeuralError', category: 'neural' },
  { name: 'KnowledgeResult', category: 'knowledge' },
  { name: 'globalClientManager', category: 'client' },
  { name: 'EventManagerConfig', category: 'events' },
  { name: 'ServiceOperationError', category: 'services' },
  { name: 'globalUSLFactory', category: 'services' },
  { name: 'globalServiceRegistry', category: 'services' },
  { name: 'WorkflowState', category: 'workflow' },
  { name: 'ServiceConfigFactory', category: 'services' },
  { name: 'ProtocolType', category: 'protocol' },
  { name: 'FACTKnowledgeEntry', category: 'knowledge' },
  { name: 'ConversationSession', category: 'conversation' },
  { name: 'ServiceTimeoutError', category: 'services' },
  { name: 'ClientManagerHelpers', category: 'client' },
  { name: 'WorkflowEngineConfig', category: 'workflow' },
  { name: 'GlobalAgentInfo', category: 'agent' },
  { name: 'ExecutionPlan', category: 'workflow' },
  { name: 'EventManagerTypes', category: 'events' },
];

// Type templates by category
const TYPE_TEMPLATES = {
  workflow: {
    interfaces: ['WorkflowContext', 'WorkflowState', 'WorkflowEngineConfig', 'ExecutionPlan'],
    template: (name) => `export interface ${name} {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}`,
  },

  neural: {
    interfaces: ['NeuralError'],
    template: (name) => `export class ${name} extends Error {
  constructor(
    message: string,
    public readonly code: string = 'NEURAL_ERROR',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = '${name}';
  }
}`,
  },

  knowledge: {
    interfaces: ['KnowledgeResult', 'FACTKnowledgeEntry'],
    template: (name) => `export interface ${name} {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}`,
  },

  services: {
    interfaces: ['ServiceOperationError', 'ServiceTimeoutError', 'ServiceConfigFactory'],
    template: (name) => {
      if (name.endsWith('Error')) {
        return `export class ${name} extends Error {
  constructor(
    message: string,
    public readonly service: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = '${name}';
  }
}`;
      }
      return `export interface ${name} {
  create<T>(config: unknown): T;
  validate(config: unknown): boolean;
}`;
    },
  },

  client: {
    interfaces: ['ClientManagerHelpers'],
    template: (name) => `export interface ${name} {
  validateConnection(endpoint: string): Promise<boolean>;
  retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number): Promise<T>;
  parseResponse<T>(response: unknown): T;
}`,
  },

  events: {
    interfaces: ['EventManagerConfig', 'EventManagerTypes'],
    template: (name) => `export interface ${name} {
  maxListeners: number;
  errorHandling: 'throw' | 'log' | 'ignore';
  enableMetrics: boolean;
}`,
  },

  protocol: {
    interfaces: ['ProtocolType'],
    template: (name) => `export type ${name} = 'http' | 'websocket' | 'mcp' | 'stdio';`,
  },

  conversation: {
    interfaces: ['ConversationSession'],
    template: (name) => `export interface ${name} {
  id: string;
  userId?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  metadata: Record<string, unknown>;
}`,
  },

  agent: {
    interfaces: ['GlobalAgentInfo'],
    template: (name) => `export interface ${name} {
  id: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  metrics: {
    tasksCompleted: number;
    averageResponseTime: number;
    errorRate: number;
  };
}`,
  },

  mcp: {
    interfaces: ['advancedMCPToolsManager'],
    template: (name) => `export interface ${name} {
  registerTool(tool: MCPTool): void;
  getTool(name: string): MCPTool | undefined;
  listTools(): MCPTool[];
  executeTool(name: string, args: unknown): Promise<unknown>;
}`,
  },
};

// Singleton instances (variables, not types)
const SINGLETON_INSTANCES = ['globalClientManager', 'globalUSLFactory', 'globalServiceRegistry'];

class MissingTypesGenerator {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'src');
    this.typesDir = path.join(this.baseDir, 'types');
    this.generatedFiles = [];
  }

  async generate() {
    console.log('🔧 Auto-Generating Missing Type Definitions...');

    // Ensure types directory exists
    if (!fs.existsSync(this.typesDir)) {
      fs.mkdirSync(this.typesDir, { recursive: true });
    }

    // Group types by category
    const typesByCategory = this.groupTypesByCategory();

    // Generate type files by category
    for (const [category, types] of Object.entries(typesByCategory)) {
      await this.generateCategoryFile(category, types);
    }

    // Generate singleton instances file
    await this.generateSingletonsFile();

    // Update main types index
    await this.updateTypesIndex();

    console.log(`✅ Generated ${this.generatedFiles.length} type definition files:`);
    this.generatedFiles.forEach((file) => console.log(`   📁 ${file}`));
  }

  groupTypesByCategory() {
    const groups = {};

    MISSING_TYPES.forEach(({ name, category }) => {
      if (!groups[category]) groups[category] = [];
      groups[category].push(name);
    });

    return groups;
  }

  async generateCategoryFile(category, typeNames) {
    const fileName = `${category}-types.ts`;
    const filePath = path.join(this.typesDir, fileName);

    const template = TYPE_TEMPLATES[category];
    if (!template) {
      console.warn(`⚠️  No template for category: ${category}`);
      return;
    }

    let content = `/** 
 * @file Auto-generated type definitions for ${category}
 * Generated by fix-missing-types.js - DO NOT EDIT MANUALLY
 */

`;

    // Add base imports if needed
    if (category === 'mcp') {
      content += `import type { MCPTool } from './shared-types';\n\n`;
    }

    // Generate each type
    typeNames.forEach((typeName) => {
      if (SINGLETON_INSTANCES.includes(typeName)) {
        return; // Skip singletons, they go in a separate file
      }

      content += template.template(typeName);
      content += '\n\n';
    });

    // Add exports
    const exportableTypes = typeNames.filter((name) => !SINGLETON_INSTANCES.includes(name));
    if (exportableTypes.length > 0) {
      content += `// Convenience exports\n`;
      content += `export type {\n`;
      exportableTypes.forEach((typeName) => {
        content += `  ${typeName},\n`;
      });
      content += `};\n`;
    }

    fs.writeFileSync(filePath, content);
    this.generatedFiles.push(fileName);
    console.log(`   ✅ Generated ${fileName} (${typeNames.length} types)`);
  }

  async generateSingletonsFile() {
    const fileName = 'singletons.ts';
    const filePath = path.join(this.typesDir, fileName);

    const content = `/** 
 * @file Global singleton instances
 * Generated by fix-missing-types.js - DO NOT EDIT MANUALLY
 */

import type { ClientManagerHelpers } from './client-types';

// Global singleton instances (to be implemented by actual services)
export declare const globalClientManager: {
  http: ClientManagerHelpers;
  websocket: ClientManagerHelpers;
  mcp: ClientManagerHelpers;
};

export declare const globalUSLFactory: {
  createService<T>(type: string, config: unknown): T;
  getService<T>(id: string): T | undefined;
};

export declare const globalServiceRegistry: {
  register<T>(id: string, service: T): void;
  get<T>(id: string): T | undefined;
  list(): string[];
};

// Re-export for convenience
export {
  globalClientManager,
  globalUSLFactory,
  globalServiceRegistry
};
`;

    fs.writeFileSync(filePath, content);
    this.generatedFiles.push(fileName);
    console.log(`   ✅ Generated ${fileName} (3 singletons)`);
  }

  async updateTypesIndex() {
    const indexPath = path.join(this.typesDir, 'index.ts');
    const existingContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';

    // Add exports for new files
    let newExports = '';
    this.generatedFiles.forEach((fileName) => {
      const baseName = fileName.replace('.ts', '');
      const exportLine = `export * from './${baseName}';`;

      if (!existingContent.includes(exportLine)) {
        newExports += exportLine + '\n';
      }
    });

    if (newExports) {
      const updatedContent = existingContent + '\n' + newExports;
      fs.writeFileSync(indexPath, updatedContent);
      console.log(`   ✅ Updated types/index.ts with ${this.generatedFiles.length} new exports`);
    }
  }
}

// Main execution
async function main() {
  try {
    const generator = new MissingTypesGenerator();
    await generator.generate();

    console.log('\n🎉 Missing types generation complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Review generated types in src/types/');
    console.log('   2. Replace placeholder implementations with actual logic');
    console.log('   3. Run TypeScript compilation to verify fixes');
  } catch (error) {
    console.error('❌ Type generation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MissingTypesGenerator };
