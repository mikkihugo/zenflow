// enhanced-init.js - Clean init command with template support

import { promises as fs } from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
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
      return { success: true, message: 'Templates listed' };
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
      await setupClaudeZenProject(projectPath, template);

      printSuccess(`✅ Claude Zen project initialized successfully!`);
      console.log(`\n🎯 Project ready at: ${path.resolve(projectPath)}`);
      
      return {
        success: true,
        path: path.resolve(projectPath),
        template,
        message: 'Project initialized successfully with template'
      };
      
    } catch (templateError) {
      // Fallback to basic initialization if template not found
      printWarning(`Template '${template}' not found. Creating basic project structure.`);
      const result = await createBasicProject(projectPath, { force, minimal });
      return result;
    }

  } catch (error) {
    printError(`Failed to initialize project: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Setup claude-zen specific project features
 */
async function setupClaudeZenProject(projectPath, templateName) {
  const absolutePath = path.resolve(projectPath);
  
  // Create additional directories that might not be in templates
  const directories = [
    '.hive-mind',
    'memory',
    'memory/sessions',
    'memory/agents',
    '.swarm'
  ];

  for (const dir of directories) {
    const dirPath = path.join(absolutePath, dir);
    await fs.mkdir(dirPath, { recursive: true });
  }

  // Initialize memory database if needed
  const memoryDbPath = path.join(absolutePath, '.hive-mind', 'memory.db');
  try {
    const db = new Database(memoryDbPath);
    
    // Create basic tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS memory_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS swarms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        objective TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        swarm_id TEXT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (swarm_id) REFERENCES swarms(id)
      );
    `);
    
    db.close();
    console.log('💾 Memory database initialized');
  } catch (error) {
    printWarning(`Could not initialize memory database: ${error.message}`);
  }

  // Create project-specific CLAUDE.md if using claude-zen template
  if (templateName === 'claude-zen') {
    const claudeMdPath = path.join(absolutePath, 'CLAUDE.md');
    const claudeMdExists = await fs.access(claudeMdPath).then(() => true).catch(() => false);
    
    if (!claudeMdExists) {
      const claudeMdContent = await createClaudeZenMd();
      await fs.writeFile(claudeMdPath, claudeMdContent);
      console.log('📝 Created CLAUDE.md configuration');
    }
  }
}

/**
 * Create basic project structure when template is not available
 */
async function createBasicProject(projectPath, options = {}) {
  const { force = false, minimal = false } = options;
  const absolutePath = path.resolve(projectPath);
  
  // Create project directory
  await fs.mkdir(absolutePath, { recursive: true });

  // Create basic directory structure
  const directories = [
    '.claude',
    '.claude/commands',
    '.hive-mind',
    'memory',
    'memory/sessions',
  ];

  for (const dir of directories) {
    const dirPath = path.join(absolutePath, dir);
    await fs.mkdir(dirPath, { recursive: true });
  }

  // Create basic settings.json
  const basicSettings = {
    env: {
      CLAUDE_ZEN_HOOKS_ENABLED: "true",
      CLAUDE_ZEN_TELEMETRY_ENABLED: "true"
    },
    permissions: {
      allow: [
        "Bash(npx claude-zen *)",
        "Bash(npm run *)",
        "Bash(git *)"
      ],
      deny: [
        "Bash(rm -rf /)",
        "Bash(curl * | bash)"
      ]
    },
    mcpServers: {
      "ruv-swarm": {
        command: "npx",
        args: ["ruv-swarm", "mcp", "start"]
      }
    },
    includeCoAuthoredBy: true
  };

  await fs.writeFile(
    path.join(absolutePath, '.claude', 'settings.json'),
    JSON.stringify(basicSettings, null, 2)
  );

  // Create basic CLAUDE.md
  const basicClaudeMd = `# Claude Zen Project

This project is configured for Claude Zen development.

## Getting Started

Run \`claude-zen --help\` to see available commands.

## Configuration

Your project configuration is in \`.claude/settings.json\`.

## Template Usage

To use advanced templates in the future:
\`\`\`bash
# List available templates  
claude-zen init --list-templates

# Initialize with specific template
claude-zen init new-project --template claude-zen
\`\`\`
  `;

  await fs.writeFile(path.join(absolutePath, 'CLAUDE.md'), basicClaudeMd);

  console.log('📁 Basic project structure created');
  printSuccess('✅ Basic Claude Zen project initialized');
  
  return {
    success: true,
    path: absolutePath,
    template: 'basic',
    message: 'Basic project structure created'
  };
}

/**
 * Create comprehensive CLAUDE.md for claude-zen template
 */
async function createClaudeZenMd() {
  return `# Claude Zen Plugin Ecosystem Project

This project is initialized with the Claude Zen plugin ecosystem template.

## 🚀 Features Available

- **Plugin Architecture**: Modular, extensible plugin system
- **Unified Interface**: CLI, TUI, Web, and Daemon modes  
- **ruv-swarm Integration**: Advanced AI agent coordination
- **Upstream Sync Monitoring**: Track claude-flow improvements
- **Enhanced Hook System**: Reliable command processing

## 📦 Included Plugins

- **JSON/YAML Validator**: Syntax checking and schema validation
- **Bazel Monorepo**: Modular build system support
- **Service Discovery**: Network service management
- **Documentation Linker**: Cross-reference validation

## 🔧 Getting Started

### Quick Commands
\`\`\`bash
# Initialize swarm coordination
claude-zen swarm init --topology mesh

# Start unified interface
claude-zen interface start --mode auto

# Run plugin scanners
claude-zen scan --type json-yaml

# Check upstream sync status
npm run sync:check
\`\`\`

### Template Usage
\`\`\`bash
# List available templates
claude-zen init --list-templates

# Use this template for new projects
claude-zen init my-project --template claude-zen
\`\`\`

## 📊 Configuration

Your project configuration is in \`.claude/settings.json\` with:
- Enhanced hook reliability fixes
- ruv-swarm MCP integration
- Permission management
- Development optimizations

## 🔄 Sync Monitoring

This template includes upstream sync monitoring:
- Run \`npm run sync:check\` for status
- Review \`UPSTREAM_SYNC.md\` for integration strategy
- Use \`scripts/sync-check.js\` for automation

## 🎯 Next Steps

1. Configure your project settings in \`.claude/settings.json\`
2. Explore available plugins in \`src/plugins/\`
3. Run \`claude-zen --help\` to see all commands
4. Check \`UPSTREAM_SYNC.md\` for latest improvements

---

**Powered by Claude Zen Plugin Ecosystem** 🚀
  `;
}

export default { initCommand, setupClaudeZenProject, createBasicProject };