// init-command.js - Enhanced init command with template support
// Integrated into meow/ink CLI system

import { promises as fs } from 'fs';
import path from 'path';
import { TemplateManager } from '../template-manager.js';
import { printSuccess, printError, printWarning } from '../utils.js';

/**
 * Initialize a new Claude Zen project
 */
export async function initCommand(input, flags) {
  const args = Array.isArray(input) ? input : [input];
  const targetDir = args[0] || process.cwd();
  const templateName = flags.template || 'claude-zen';
  
  try {
    printSuccess('🚀 Initializing Claude Zen project...');
    
    // Try to use template system first
    const templateManager = new TemplateManager();
    
    try {
      // Check if template exists
      const template = await templateManager.getTemplate(templateName);
      
      if (template) {
        // Use template system
        await templateManager.installTemplate(templateName, targetDir, {
          force: flags.force,
          minimal: flags.minimal,
          variant: flags.variant || 'enhanced'
        });
        return;
      }
    } catch (templateError) {
      // Fall back to basic initialization if template system fails
      printWarning(`Template system unavailable: ${templateError.message}`);
      printWarning('Falling back to basic initialization...');
    }
    
    // Basic initialization fallback
    // Check if target directory exists
    const dirExists = await fs.access(targetDir).then(() => true).catch(() => false);
    if (!dirExists) {
      await fs.mkdir(targetDir, { recursive: true });
      printSuccess(`📁 Created directory: ${targetDir}`);
    }
    
    // Create basic Claude Code integration files
    const claudeDir = path.join(targetDir, '.claude');
    await fs.mkdir(claudeDir, { recursive: true });
    
    // Create basic settings.json
    const settingsPath = path.join(claudeDir, 'settings.json');
    const basicSettings = {
      "env": {
        "CLAUDE_ZEN_AUTO_COMMIT": "false",
        "CLAUDE_ZEN_AUTO_PUSH": "false", 
        "CLAUDE_ZEN_HOOKS_ENABLED": "true",
        "CLAUDE_ZEN_TELEMETRY_ENABLED": "true"
      },
      "permissions": {
        "allow": [
          "Bash(npm run *)",
          "Bash(git *)",
          "Bash(node *)"
        ]
      },
      "mcpServers": {
        "ruv-swarm": {
          "command": "npx",
          "args": ["ruv-swarm", "mcp", "start"]
        }
      }
    };
    
    const shouldOverwrite = flags.force || !(await fs.access(settingsPath).then(() => true).catch(() => false));
    
    if (shouldOverwrite) {
      await fs.writeFile(settingsPath, JSON.stringify(basicSettings, null, 2));
      printSuccess(`⚙️  Created settings: ${settingsPath}`);
    } else {
      printWarning(`⚠️  Settings already exist: ${settingsPath} (use --force to overwrite)`);
    }
    
    // Create basic CLAUDE.md
    const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
    const basicClaudeMd = `# Claude Zen Project

This project is configured for Claude Code integration with ruv-swarm coordination.

## Features
- Multi-agent coordination via ruv-swarm
- Automated workflow management
- Advanced memory and context management
- GitHub integration capabilities

## Getting Started
Run \`claude-zen --help\` to see available commands.

## Configuration
See \`.claude/settings.json\` for configuration options.
`;

    const shouldOverwriteReadme = flags.force || !(await fs.access(claudeMdPath).then(() => true).catch(() => false));
    
    if (shouldOverwriteReadme) {
      await fs.writeFile(claudeMdPath, basicClaudeMd);
      printSuccess(`📋 Created documentation: ${claudeMdPath}`);
    } else {
      printWarning(`⚠️  CLAUDE.md already exists: ${claudeMdPath} (use --force to overwrite)`);
    }
    
    printSuccess('');
    printSuccess('🎉 Claude Zen project initialized successfully!');
    printSuccess('');
    printSuccess('Next steps:');
    printSuccess('  1. Review .claude/settings.json configuration');
    printSuccess('  2. Run `claude-zen status` to check system health');
    printSuccess('  3. Run `claude-zen swarm "your task"` to start coordination');
    
  } catch (error) {
    printError(`❌ Initialization failed: ${error.message}`);
    if (flags.verbose || flags.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}