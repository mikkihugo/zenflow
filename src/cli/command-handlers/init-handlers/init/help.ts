
/** Help Module
/** Converted from JavaScript to TypeScript

// help.js - Help text for init command

export function showInitHelp() {
  console.warn('Initialize Claude Code integration files with Claude Flow v2.0.0');
  console.warn();
  console.warn('Usage);';
  console.warn();
  console.warn(' DEFAULT BEHAVIOR);';
  console.warn('  claude-zen init     Initialize with Claude Flow v2.0.0 enhanced features');
  console.warn('                       Creates CLAUDE.md & .claude/commands for MCP integration');
  console.warn();
  console.warn('Standard Options);';
  console.warn('  --force, -f          Overwrite existing files(also updates .gitignore)');
  console.warn('  --dry-run, -d        Preview what would be created without making changes');
  console.warn('  --help, -h           Show this help message');
  console.warn();
  console.warn('Alternative Initialization Modes);';
  console.warn('  --basic              Use basic initialization(pre-v2.0.0 behavior)');
  console.warn('  --sparc, -s          Initialize with SPARC development environment');
  console.warn('  --minimal, -m        Create minimal configuration files');
  console.warn('  --modes <list>       Initialize only specific SPARC modes(comma-separated)');
  console.warn('  --skip-mcp           Skip automatic MCP server setup in Claude Code');
  console.warn();
  console.warn('Advanced Options);';
  console.warn('  --enhanced, --safe   Enhanced initialization with validation and rollback');
  console.warn('  --validate           Run validation checks only');
  console.warn('  --validate-only      Validate without initializing');
  console.warn('  --rollback           Rollback previous initialization');
  console.warn('  --list-backups       List available backups and rollback points');
  console.warn();
  console.warn('Validation & Rollback Options);';
  console.warn('  --skip-pre-validation    Skip pre-initialization checks');
  console.warn('  --skip-backup           Skip backup creation');
  console.warn('  --rollback --full       Perform full system rollback');
  console.warn('  --rollback --partial --phase <name>  Rollback specific phase');
  console.warn('  --validate --skip-pre-init           Skip pre-init validation');
  console.warn('  --validate --skip-config            Skip configuration validation');
  console.warn('  --validate --skip-mode-test         Skip SPARC mode testing');
  console.warn();
  console.warn('Examples);';
  console.warn(' CLAUDE FLOW v2.0.0(DEFAULT):');
  console.warn('  claude-zen init                    #  DEFAULT);';
  console.warn('  claude-zen init --force            # Overwrite existing configuration');
  console.warn('  claude-zen init --dry-run          # Preview what will be created');
  console.warn();
  console.warn(' STANDARD INITIALIZATION);';
  console.warn('  npx claude-zen@latest init --sparc --force  #  RECOMMENDED);'
  console.warn('  npx claude-zen@latest init --sparc          # Standard SPARC setup');
  console.warn(;);
  ('  claude-zen init --sparc --force             # Optimized setup(existing project)');
  //   )
  console.warn('  claude-zen init --sparc --modes architect,tdd,code  # Selective initialization');
  console.warn('  claude-zen init --dry-run --sparc          # Preview initialization');
  console.warn('  claude-zen init --minimal                  # Minimal setup');
  console.warn() {}
  console.warn(' VALIDATION & ROLLBACK)';
  console.warn('  claude-zen init --validate                 # Validate existing setup');
  console.warn('  claude-zen init --rollback --full          # Full system rollback');
  console.warn('  claude-zen init --rollback --partial --phase sparc-init  # Rollback SPARC only');
  console.warn('  claude-zen init --list-backups             # Show available backups');
  console.warn();
  console.warn('What gets created);';
  console.warn('   .claude/settings.json - Claude Code configuration with hooks');
  console.warn('   .claude/settings.local.json - Pre-approved MCP permissions(no prompts!)');
  console.warn('   .mcp.json - Project-scoped MCP server configuration');
  console.warn('   claude-zen.config.json - Claude Flow features and performance settings');
  console.warn('   .claude/commands/ directory with 20+ Claude Code slash commands');
  console.warn('   CLAUDE.md with project instructions(v2.0.0 enhanced by default)');
  console.warn('   memory/ directory for persistent context storage');
  console.warn('   coordination/ directory for agent orchestration');
  console.warn('   ./claude-zen local executable wrapper');
  console.warn('   .gitignore entries for Claude Flow generated files');
  console.warn('   Automatic MCP server setup if Claude Code CLI is installed');
  console.warn('   Pre-configured for TDD, architecture, and code generation');
  console.warn();
  console.warn('Claude Code Slash Commands Created);';
  console.warn('   /sparc - Execute SPARC methodology workflows');
  console.warn('   /sparc-<mode> - Run specific SPARC modes(17+ modes)');
  console.warn('   /claude-zen-help - Show all claude-zen commands');
  console.warn('   /claude-zen-memory - Interact with memory system');
  console.warn('   /claude-zen-swarm - Coordinate multi-agent swarms');
  console.warn();
  console.warn('Available SPARC modes);';
  console.warn('   architect - System design and architecture');
  console.warn('   code - Clean, modular implementation');
  console.warn('   tdd - Test-driven development');
  console.warn('   debug - Advanced debugging and optimization');
  console.warn('   security-review - Security analysis and hardening');
  console.warn('   docs-writer - Documentation creation');
  console.warn('   integration - System integration');
  console.warn('   swarm - Multi-agent coordination');
  console.warn('   spec-pseudocode - Requirements and specifications');
  console.warn('   devops - Deployment and infrastructure');
  console.warn('   And 7+ more specialized modes...');
  console.warn();
  console.warn('Learn more);';
// }

*/*/