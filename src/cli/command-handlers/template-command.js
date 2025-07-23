/**
 * Template management command for Claude Zen
 * Handles template operations: list, create, info
 */

import TemplateManager from '../template-manager.js';
import { printSuccess, printError, printWarning } from '../utils.js';

export async function templateCommand(args, flags) {
  const templateManager = new TemplateManager();
  const action = args[0];

  try {
    switch (action) {
      case 'list':
        await handleListTemplates(templateManager, flags);
        break;
        
      case 'info':
        await handleTemplateInfo(templateManager, args[1], flags);
        break;
        
      case 'create':
        await handleCreateTemplate(templateManager, args[1], flags);
        break;
        
      case 'install':
        await handleInstallTemplate(templateManager, args[1], args[2] || '.', flags);
        break;

      default:
        showTemplateHelp();
        break;
    }
  } catch (error) {
    printError(`Template command failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Handle template listing
 */
async function handleListTemplates(templateManager, flags) {
  console.log('📦 Discovering templates...');
  const templates = await templateManager.listTemplates();
  
  if (templates.length === 0) {
    console.log('\\n💡 No templates found. Create one with:');
    console.log('   claude-zen template create my-template');
  }
}

/**
 * Handle template info display
 */
async function handleTemplateInfo(templateManager, templateName, flags) {
  if (!templateName) {
    printError('Template name is required for info command');
    console.log('Usage: claude-zen template info <template-name>');
    return;
  }

  const template = await templateManager.getTemplate(templateName);
  
  if (!template) {
    printError(`Template '${templateName}' not found`);
    return;
  }

  const { manifest, path: templatePath, source } = template;
  
  console.log(`\\n📋 Template Information: ${manifest.name}`);
  console.log('='.repeat(50));
  console.log(`Name: ${manifest.name}`);
  console.log(`Version: ${manifest.version || '1.0.0'}`);
  console.log(`Description: ${manifest.description || 'No description'}`);
  console.log(`Category: ${manifest.category || 'general'}`);
  console.log(`Author: ${manifest.author || 'Unknown'}`);
  console.log(`Source: ${source}`);
  console.log(`Path: ${templatePath}`);
  
  if (manifest.requirements) {
    console.log('\\n📋 Requirements:');
    Object.entries(manifest.requirements).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }
  
  if (manifest.features && manifest.features.length > 0) {
    console.log('\\n✨ Features:');
    manifest.features.forEach(feature => {
      console.log(`  • ${feature}`);
    });
  }
  
  if (manifest.files) {
    console.log('\\n📁 Files:');
    Object.entries(manifest.files).forEach(([filename, info]) => {
      const required = info.required ? '[REQUIRED]' : '[OPTIONAL]';
      console.log(`  ${required} ${filename} - ${info.description || 'No description'}`);
    });
  }
  
  if (manifest.setup && manifest.setup.postInstall) {
    console.log('\\n🔧 Post-install commands:');
    manifest.setup.postInstall.forEach(command => {
      console.log(`  ${command}`);
    });
  }
}

/**
 * Handle template creation
 */
async function handleCreateTemplate(templateManager, templateName, flags) {
  if (!templateName) {
    printError('Template name is required for create command');
    console.log('Usage: claude-zen template create <template-name> [options]');
    return;
  }

  const options = {
    description: flags.description || `Custom template: ${templateName}`,
    version: flags.version || '1.0.0',
    category: flags.category || 'custom'
  };

  await templateManager.createTemplate(templateName, options);
  console.log(`\\n🎯 Template created successfully!`);
  console.log(`\\nTo use this template:`);
  console.log(`  claude-zen init my-project --template ${templateName}`);
}

/**
 * Handle template installation
 */
async function handleInstallTemplate(templateManager, templateName, targetPath, flags) {
  if (!templateName) {
    printError('Template name is required for install command');
    console.log('Usage: claude-zen template install <template-name> [target-path] [options]');
    return;
  }

  const options = {
    force: flags.force || false,
    minimal: flags.minimal || false
  };

  console.log(`📦 Installing template '${templateName}' to '${targetPath}'...`);
  await templateManager.installTemplate(templateName, targetPath, options);
}

/**
 * Show template command help
 */
function showTemplateHelp() {
  console.log(`
🎯 Claude Zen Template Management

Usage: claude-zen template <command> [options]

Commands:
  list                     List all available templates
  info <template-name>     Show detailed template information  
  create <template-name>   Create a new template from current directory
  install <template-name>  Install template to directory
  
Options:
  --force                  Force overwrite existing files
  --minimal               Install only required files
  --description <text>     Template description (for create)
  --version <version>      Template version (for create)
  --category <category>    Template category (for create)

Examples:
  claude-zen template list
  claude-zen template info claude-zen
  claude-zen template create my-template --description "My custom template"
  claude-zen template install claude-zen ./my-project --force

Template Features:
  📦 Plugin ecosystem templates with pre-configured components
  🔧 Automated setup and post-install configuration
  📋 Comprehensive documentation and examples
  🎯 Category-based organization and discovery
  ✨ Feature-rich templates with validation
  `);
}

export { templateCommand as default, handleListTemplates, handleTemplateInfo, handleCreateTemplate };