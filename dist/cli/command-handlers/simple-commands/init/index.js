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
 * Initialize a new Claude Zen project
 */
export async function initCommand(input, flags) {
  const args = Array.isArray(input) ? input : [input];
  const projectPath = args[0] || '.';
  const options = flags || {};
  
  try {
    const {
      force = false,
    } = options;

    const templateManager = new TemplateManager();

    printSuccess(`🚀 Initializing Claude Zen project in: ${projectPath}`);
    
    // Allow template selection or default to claude-zen
    const template = options.template || flags.template || 'claude-zen';
    
    // Validate template exists
    const availableTemplates = await templateManager.listTemplates();
    if (!availableTemplates.find(t => t.name === template)) {
      printWarning(`Template '${template}' not found. Available templates:`);
      availableTemplates.forEach(t => console.log(`  - ${t.name}: ${t.description || 'No description'}`));
      return { success: false, error: `Template '${template}' not found` };
    }
    
    try {
      await templateManager.installTemplate(template, projectPath, {
        force
      });

      printSuccess(`✅ Claude Zen project initialized successfully!`);
      console.log(`🎯 Project ready at: ${path.resolve(projectPath)}`);
      console.log(`📚 Run 'claude-zen --help' to see available commands`);
      
    } catch (templateError) {
      printError(`Failed to install template: ${templateError.message}`);
      throw templateError;
    }
    
    return {
      success: true,
      path: path.resolve(projectPath),
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