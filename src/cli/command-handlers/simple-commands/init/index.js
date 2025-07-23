// init/index.js - Enhanced init command with template support

import { promises as fs } from 'fs';
import path from 'path';
import { MetaRegistryManager } from '../../../../coordination/meta-registry/meta-manager.js';
import MemoryBackend from '../../../../coordination/meta-registry/backends/memory-backend.js';
import HierarchicalTaskManagerPlugin from '../../../../coordination/meta-registry/plugins/hierarchical-task-manager.js';
import ArchitectAdvisorPlugin from '../../../../coordination/meta-registry/plugins/architect-advisor.js';
import MemoryRAGPlugin from '../../../../coordination/meta-registry/plugins/memory-rag.js';
import PortDiscoveryPlugin from '../../../../coordination/meta-registry/plugins/port-discovery.js';
import PubSubPlugin from '../../../../coordination/meta-registry/plugins/pubsub.js';
import NATTraversalPlugin from '../../../../coordination/meta-registry/plugins/nat-traversal.js';
import { printSuccess, printError, printWarning } from '../../../utils.js';
import TemplateManager from '../../../template-manager.js';

/**
 * Initialize a new Claude Zen project with template support
 */
export async function initCommand(input, flags) {
  const args = Array.isArray(input) ? input : [input];
  const projectPath = args[0] || '.';
  const options = flags || {};
  
  try {
    const {
      template = 'claude-zen',
      force = false,
      minimal = false,
      listTemplates = false,
    } = options;

    const templateManager = new TemplateManager();

    // Handle template listing
    if (listTemplates) {
      await templateManager.listTemplates();
      return;
    }

    printSuccess(`🚀 Initializing Claude Zen project in: ${projectPath}`);
    console.log(`📦 Using template: ${template}`);

    // Use template system for initialization
    try {
      await templateManager.installTemplate(template, projectPath, {
        force,
        minimal
      });

      // Additional setup for claude-zen projects
      await this.setupClaudeZenProject(projectPath, template);

      printSuccess(`✅ Claude Zen project initialized successfully!`);
      console.log(`\n🎯 Project ready at: ${path.resolve(projectPath)}`);
      
    } catch (templateError) {
      // Fallback to basic initialization if template not found
      printWarning(`Template '${template}' not found. Creating basic project structure.`);
      await this.createBasicProject(projectPath, { force, minimal });
    }

This project is configured for Claude Code integration.

## Getting Started

Run \`claude-zen --help\` to see available commands.

## Commands

- \`claude-zen init\` - Initialize project
- \`claude-zen status\` - Show project status
- \`claude-zen help\` - Show help

## Configuration

This project uses Claude Flow v2.0.0 for enhanced development workflows.
`;

    await fs.writeFile(path.join(absolutePath, 'CLAUDE.md'), claudeMdContent, 'utf8');

    
    
    

    printSuccess('Project initialized successfully!');
    
    return {
      success: true,
      path: absolutePath,
      message: 'Project initialized successfully'
    };

  } catch (error) {
    printError(`Failed to initialize project: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}