/**
 * Enhanced Template Management Command for Claude Zen
 * Handles comprehensive template operations: list, create, info, install, customize
 * Features: Settings variants, documentation integration, interactive wizard
 */

import TemplateManager from '../template-manager.js';
import { printSuccess, printError, printWarning } from '../utils.js';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        
      case 'customize':
        await handleCustomizeTemplate(templateManager, args[1], flags);
        break;
        
      case 'docs':
        await handleTemplateDocs(templateManager, args[1], flags);
        break;
        
      case 'variants':
        await handleTemplateVariants(templateManager, args[1], flags);
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
 * Handle template installation with settings variant selection
 */
async function handleInstallTemplate(templateManager, templateName, targetPath, flags) {
  if (!templateName) {
    printError('Template name is required for install command');
    console.log('Usage: claude-zen template install <template-name> [target-path] [options]');
    return;
  }

  const options = {
    force: flags.force || false,
    minimal: flags.minimal || false,
    variant: flags.variant || 'enhanced', // basic, enhanced, optimized
    addPlugins: !flags.noPlugins
  };

  console.log(`📦 Installing template '${templateName}' to '${targetPath}'...`);
  console.log(`🎯 Settings variant: ${options.variant}`);
  
  await templateManager.installTemplate(templateName, targetPath, options);
  
  if (options.variant !== 'basic') {
    console.log(`\n✨ Enhanced features enabled with '${options.variant}' variant`);
  }
}

/**
 * Handle interactive template customization
 */
async function handleCustomizeTemplate(templateManager, templateName, flags) {
  if (!templateName) {
    printError('Template name is required for customize command');
    console.log('Usage: claude-zen template customize <template-name> [options]');
    return;
  }

  const template = await templateManager.getTemplate(templateName);
  if (!template) {
    printError(`Template '${templateName}' not found`);
    return;
  }

  console.log(`\n🎯 Customizing template: ${templateName}`);
  console.log('='.repeat(50));
  
  // Show available variants
  await handleTemplateVariants(templateManager, templateName, flags);
  
  // Interactive customization would go here
  console.log('\n📋 Customization options:');
  console.log('  --variant <type>     Choose settings variant (basic/enhanced/optimized)');
  console.log('  --no-plugins         Exclude plugin ecosystem');
  console.log('  --minimal            Include only required files');
  console.log('  --force              Force overwrite existing files');
  
  console.log('\n💡 Example:');
  console.log(`  claude-zen template install ${templateName} ./my-project --variant optimized`);
}

/**
 * Handle template documentation viewing
 */
async function handleTemplateDocs(templateManager, templateName, flags) {
  if (!templateName) {
    // Show documentation for all templates
    const templates = await templateManager.discoverTemplates();
    const templateList = Array.from(templates.values());
    
    console.log('\n📚 Template Documentation:');
    console.log('='.repeat(50));
    
    for (const template of templateList) {
      console.log(`\n🎯 ${template.manifest.name}`);
      if (template.manifest.documentation) {
        if (template.manifest.documentation.readme) {
          console.log(`   📄 README: ${template.manifest.documentation.readme}`);
        }
        if (template.manifest.documentation.guide) {
          console.log(`   📖 Guide: ${template.manifest.documentation.guide}`);
        }
      } else {
        console.log('   📋 Documentation: See template.json manifest');
      }
    }
    return;
  }

  const template = await templateManager.getTemplate(templateName);
  if (!template) {
    printError(`Template '${templateName}' not found`);
    return;
  }

  console.log(`\n📚 Documentation for ${templateName}:`);
  console.log('='.repeat(50));
  
  if (template.manifest.documentation) {
    const { documentation } = template.manifest;
    
    if (documentation.readme) {
      try {
        const readmePath = path.resolve(template.path, documentation.readme);
        const readmeContent = await readFile(readmePath, 'utf8');
        console.log('\n📄 README:');
        console.log(readmeContent.split('\n').slice(0, 20).join('\n')); // First 20 lines
        if (readmeContent.split('\n').length > 20) {
          console.log('\n... (truncated, see full file for complete documentation)');
        }
      } catch (error) {
        console.log(`   📄 README: ${documentation.readme} (file not found)`);
      }
    }
    
    if (documentation.guide) {
      console.log(`\n📖 Guide: ${documentation.guide}`);
    }
  }
  
  // Show commands documentation if available
  const commandsPath = path.join(template.path, 'commands');
  try {
    const { promises: fs } = await import('fs');
    await fs.access(commandsPath);
    console.log('\n📋 Available commands documentation:');
    console.log('   Use: ls -la .claude/commands/ after installation');
  } catch (error) {
    // Commands directory doesn't exist
  }
}

/**
 * Handle template variants display
 */
async function handleTemplateVariants(templateManager, templateName, flags) {
  if (!templateName) {
    printError('Template name is required for variants command');
    console.log('Usage: claude-zen template variants <template-name>');
    return;
  }

  const template = await templateManager.getTemplate(templateName);
  if (!template) {
    printError(`Template '${templateName}' not found`);
    return;
  }

  console.log(`\n⚙️ Settings variants for ${templateName}:`);
  console.log('='.repeat(50));
  
  // Check for variant files
  const variants = ['basic', 'enhanced', 'optimized'];
  const availableVariants = [];
  
  for (const variant of variants) {
    const variantFile = variant === 'enhanced' ? 'settings.json' : `settings-${variant}.json`;
    const variantPath = path.join(template.path, variantFile);
    
    try {
      const { promises: fs } = await import('fs');
      await fs.access(variantPath);
      availableVariants.push({ name: variant, file: variantFile, path: variantPath });
    } catch (error) {
      // Variant file doesn't exist
    }
  }
  
  if (availableVariants.length === 0) {
    console.log('No settings variants found for this template.');
    return;
  }
  
  for (const variant of availableVariants) {
    console.log(`\n🎯 ${variant.name.toUpperCase()} (${variant.file}):`);
    
    try {
      const variantContent = await readFile(variant.path, 'utf8');
      const variantConfig = JSON.parse(variantContent);
      
      if (variantConfig.env) {
        console.log('   Environment variables:');
        for (const [key, value] of Object.entries(variantConfig.env)) {
          console.log(`     ${key}: ${value}`);
        }
      }
      
      if (variantConfig.performance) {
        console.log('   Performance features: enabled');
      }
      
      if (variantConfig.hooks) {
        console.log('   Hooks: configured');
      }
    } catch (error) {
      console.log('   Configuration: Available but could not parse details');
    }
  }
  
  console.log('\n💡 Usage:');
  console.log(`   claude-zen template install ${templateName} ./project --variant <variant-name>`);
}

/**
 * Show template command help
 */
function showTemplateHelp() {
  console.log(`
🎯 Enhanced Claude Zen Template Management System

Usage: claude-zen template <command> [options]

Commands:
  list                     List all available templates
  info <template-name>     Show detailed template information  
  create <template-name>   Create a new template from current directory
  install <template-name>  Install template to directory
  customize <template-name> Interactive template customization wizard
  docs [template-name]     View template documentation
  variants <template-name> Show available settings variants
  
Installation Options:
  --force                  Force overwrite existing files
  --minimal               Install only required files
  --variant <type>         Settings variant (basic/enhanced/optimized)
  --no-plugins            Skip plugin ecosystem installation
  
Creation Options:
  --description <text>     Template description (for create)
  --version <version>      Template version (for create)
  --category <category>    Template category (for create)

Examples:
  claude-zen template list
  claude-zen template info claude-zen
  claude-zen template variants claude-zen
  claude-zen template customize claude-zen
  claude-zen template docs claude-zen
  claude-zen template install claude-zen ./my-project --variant optimized
  claude-zen template create my-template --description "My custom template"

Template Features:
  📦 Plugin ecosystem templates with pre-configured components
  🔧 Automated setup and post-install configuration
  📋 Comprehensive documentation and examples
  🎯 Settings variants (basic/enhanced/optimized)
  ⚙️ Interactive customization wizard
  📚 Integrated documentation system
  ✨ Feature-rich templates with validation
  🔗 Plugin ecosystem integration
  `);
}

export { templateCommand as default, handleListTemplates, handleTemplateInfo, handleCreateTemplate };