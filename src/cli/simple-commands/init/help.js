// help.js - Help text for init command

export function showInitHelp() {
  console.log('Initialize Claude Code integration files');
  console.log();
  console.log('Usage: claude-flow init [options]');
  console.log();
  console.log('Options:');
  console.log('  --sparc, -s     Initialize with SPARC development environment (recommended)');
  console.log('  --minimal, -m   Create minimal configuration files');
  console.log('  --force, -f     Overwrite existing files');
  console.log('  --help, -h      Show this help message');
  console.log();
  console.log('Examples:');
  console.log('  npx claude-flow@latest init --sparc   # Recommended first-time setup');
  console.log('  claude-flow init --sparc              # Initialize with SPARC modes');
  console.log('  claude-flow init --minimal            # Minimal setup');
  console.log('  claude-flow init --force              # Overwrite existing files');
  console.log();
  console.log('What --sparc creates:');
  console.log('  • .claude/commands/ directory with 20+ Claude Code slash commands');
  console.log('  • CLAUDE.md with SPARC-enhanced project instructions');
  console.log('  • memory/ directory for persistent context storage');
  console.log('  • coordination/ directory for agent orchestration');
  console.log('  • ./claude-flow local executable wrapper');
  console.log('  • Pre-configured for TDD, architecture, and code generation');
  console.log();
  console.log('Claude Code Slash Commands Created:');
  console.log('  • /sparc - Execute SPARC methodology workflows');
  console.log('  • /sparc-<mode> - Run specific SPARC modes (17+ modes)');
  console.log('  • /claude-flow-help - Show all claude-flow commands');
  console.log('  • /claude-flow-memory - Interact with memory system');
  console.log('  • /claude-flow-swarm - Coordinate multi-agent swarms');
  console.log();
  console.log('Available SPARC modes:');
  console.log('  • architect - System design and architecture');
  console.log('  • code - Clean, modular implementation');
  console.log('  • tdd - Test-driven development');
  console.log('  • debug - Advanced debugging and optimization');
  console.log('  • security-review - Security analysis and hardening');
  console.log('  • docs-writer - Documentation creation');
  console.log('  • integration - System integration');
  console.log('  • swarm - Multi-agent coordination');
  console.log('  • spec-pseudocode - Requirements and specifications');
  console.log('  • devops - Deployment and infrastructure');
  console.log('  • And 7+ more specialized modes...');
  console.log();
  console.log('Learn more: https://github.com/ruvnet/claude-code-flow');
}