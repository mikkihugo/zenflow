// command-registry.js - Extensible command registration system with meow integration
import process from 'process';
import meow from 'meow';
import { initCommand } from './command-handlers/init-command.js';
import { memoryCommand } from './command-handlers/memory-command.js';
// SPARC removed - using Hive Mind for AI orchestration
import { spawnCommand } from './command-handlers/spawn-command.js';
import { agentCommand } from './command-handlers/agent-command.js';
import { taskCommand } from './command-handlers/task-command.js';
import { configCommand } from './command-handlers/config-command.js';
import { statusCommand } from './command-handlers/status-command.js';
import { securityCommand } from './command-handlers/security-command.js';
import { analyticsCommand } from './command-handlers/analytics-command.js';
import { backupCommand } from './command-handlers/backup-command.js';
import { deployCommand } from './command-handlers/deploy-command.js';
import { claudeCommand } from './command-handlers/claude-command.js';
// import { cloudCommand } from './command-handlers/cloud-command.js'; // Temporarily disabled - missing file
import { projectCommand } from './command-handlers/project-command.js';
import { replCommand } from './command-handlers/repl-command.js';
import { workflowCommand } from './command-handlers/workflow-command.js';
// import { visionToCodeWorkflowHandler } from './command-handlers/vision-to-code-workflow-handler.js'; // Temporarily disabled due to missing dependencies
import { sessionCommand } from './command-handlers/session-command.js';
import { terminalCommand } from './command-handlers/terminal-command.js';
import { mcpCommand } from './command-handlers/mcp-command.js';
import { monitorCommand } from './command-handlers/monitor-command.js';
import { startCommand } from './command-handlers/start-command.js';
// swarmCommand moved to hive-mind integration
import { batchManagerCommand } from './command-handlers/batch-manager-command.js';
import { githubCommand } from './command-handlers/github-command.js';
import { trainingAction } from './command-handlers/training-command.js';
import { analysisAction } from './command-handlers/analysis-command.js';
import { automationAction } from './command-handlers/automation-command.js';
import { coordinationAction } from './command-handlers/coordination-command.js';
import { hooksAction } from './command-handlers/hooks-command.js';
import { hookSafetyCommand } from './command-handlers/hook-safety-command.js';
import { hiveMindCommand } from './command-handlers/hive-mind-command.js';
import { HelpFormatter } from './help-formatter.js';
import hiveMindOptimizeCommand from './command-handlers/hive-mind-optimize-command.js';
import {
  showUnifiedMetrics,
  fixTaskAttribution,
} from './command-handlers/swarm-metrics-integration-command.js';
import { migrateHooksCommand, migrateHooksCommandConfig } from './command-handlers/migrate-hooks-command.js';
import {
  fixHookVariablesCommand,
  fixHookVariablesCommandConfig,
} from './command-handlers/fix-hook-variables-command.js';
import { templateCommand } from './command-handlers/template-command.js';
import { queenCouncilCommand } from './command-handlers/queen-council.js';
import websocketCommand from './command-handlers/websocket-command.js';
import { systemConsolidationCommand, systemConsolidationCommandConfig } from './command-handlers/system-consolidation-command.js';
import { pluginStatusCommand, pluginStatusCommandConfig } from './command-handlers/plugin-status-command.js';
import { serverCommand, serverCommandConfig } from './command-handlers/server-command.js';
import { dashboardCommand, dashboardCommandConfig } from './command-handlers/dashboard-command.js';
// Note: TypeScript imports commented out for Node.js compatibility
// import { ruvSwarmAction } from './commands/ruv-swarm.ts';
// import { configIntegrationAction } from './commands/config-integration.ts';

// Command registry for extensible CLI
export const commandRegistry = new Map();

// Meow CLI configuration
export const createMeowCLI = () => {
  return meow(`
	Usage
	  $ claude-zen <command> [options]

	Commands
	  init           Initialize Claude Code integration files
	  start          Start the Claude-Flow orchestration system
	  start-ui       Start the UI interface (web UI by default)
	  swarm          Swarm-based AI agent coordination
	  spawn          Spawn AI agents with various coordination modes
	  agent          Manage AI agents and hierarchies
	  task           Manage tasks and workflows
	  workflow       Advanced workflow management with SPARC methodology
	  memory         Memory management operations
	  config         Manage system configuration
	  status         Show system status and health
	  mcp            Manage MCP server and tools
	  monitor        Real-time system monitoring
	  hive-mind      Advanced Hive Mind swarm intelligence
	  queen-council  Multi-queen strategic coordination with document integration
	  websocket      WebSocket client/server management with Node.js 22 native support
	  system         Unified system control and consolidation
	  dashboard      Unified dashboard interface with React/Ink support
	  coordination   Swarm and agent orchestration
	  training       Neural pattern learning and model updates
	  analysis       Performance and usage analytics
	  automation     Intelligent agent and workflow management
	  hooks          Lifecycle event management
	  security       Enterprise security management and monitoring
	  backup         Data backup and disaster recovery management
	  github         GitHub workflow automation
	  template       Template management (list, create, install)
	  plugin         Plugin system status and management
	  server         Schema-driven API server with WebSocket support

	Options
	  --help         Show help
	  --version      Show version
	  --verbose      Enable verbose output
	  --json         Output in JSON format
	  --debug        Enable debug mode

	Examples
	  $ claude-zen init
	  $ claude-zen init . --force
	  $ claude-zen start --ui
	  $ claude-zen swarm "Build a REST API"
	  $ claude-zen spawn researcher --coordinated
	  $ claude-zen hive-mind spawn "Build a scalable application"
	  $ claude-zen status --verbose
	  $ claude-zen github pr-manager "create feature PR"
`, {
    importMeta: import.meta,
    flags: {
      verbose: {
        type: 'boolean',
        shortFlag: 'v',
        default: false
      },
      json: {
        type: 'boolean',
        default: false
      },
      debug: {
        type: 'boolean',
        default: false
      },
      help: {
        type: 'boolean',
        shortFlag: 'h',
        default: false
      },
      version: {
        type: 'boolean',
        default: false
      },
      // Swarm-specific flags
      strategy: {
        type: 'string',
        choices: ['adaptive', 'parallel', 'sequential'],
        default: 'adaptive'
      },
      topology: {
        type: 'string',
        choices: ['hierarchical', 'mesh', 'ring', 'star'],
        default: 'hierarchical'
      },
      maxAgents: {
        type: 'number',
        default: 5
      },
      coordinated: {
        type: 'boolean',
        default: false
      },
      enhanced: {
        type: 'boolean',
        shortFlag: 'e',
        default: false
      },
      // UI flags
      port: {
        type: 'number',
        default: 3000
      },
      daemon: {
        type: 'boolean',
        default: false
      },
      ui: {
        type: 'boolean',
        default: false
      },
      web: {
        type: 'boolean',
        default: false
      },
      terminal: {
        type: 'boolean',
        default: false
      },
      // Analysis flags
      timeframe: {
        type: 'string',
        default: '24h'
      },
      format: {
        type: 'string',
        choices: ['summary', 'detailed'],
        default: 'summary'
      },
      breakdown: {
        type: 'boolean',
        default: false
      },
      costAnalysis: {
        type: 'boolean',
        default: false
      },
      force: {
        type: 'boolean',
        default: false
      },
      description: {
        type: 'string'
      },
      category: {
        type: 'string'
      }
    }
  });
};

// Register core commands
export function registerCoreCommands() {
  commandRegistry.set('init', {
    handler: initCommand,
    description: 'Initialize Claude Zen project',
    usage: 'init [directory] [options]',
    examples: [
      'init',
      'init my-project',
      'init --force'
    ],
    details: `
Initialize Claude Zen project with pre-configured plugins and development workflows.

Options:
  --force              Force overwrite existing files

Creates a complete Claude Zen project with swarm integration, hooks,
and all necessary configuration files for enhanced development.`,
  });

  commandRegistry.set('start', {
    handler: startCommand,
    description: 'Start the Claude-Flow orchestration system',
    usage: 'start [--daemon] [--port <port>] [--verbose] [--ui] [--web]',
    examples: [
      'start                    # Start in interactive mode',
      'start --daemon           # Start as background daemon',
      'start --port 8080        # Use custom MCP port',
      'start --verbose          # Show detailed system activity',
      'start --ui               # Launch terminal-based UI',
      'start --web              # Launch web-based UI',
    ],
  });

  // Add start-ui as a convenient alias for launching the UI
  commandRegistry.set('start-ui', {
    handler: async (args, flags) => {
      // Import and use the direct UI launcher
      const { launchUI } = await import('./command-handlers/simple-commands/start-ui.js');
      // Pass the full raw arguments from process.argv
      const fullArgs = process.argv.slice(3); // Skip node, script, and command
      return launchUI(fullArgs);
    },
    description: 'Start the UI interface (web UI by default)',
    usage: 'start-ui [--port <port>] [--terminal]',
    examples: [
      'start-ui                 # Launch web-based UI (default)',
      'start-ui --port 3000     # Use custom port',
      'start-ui --terminal      # Launch terminal-based UI instead',
    ],
  });

  commandRegistry.set('memory', {
    handler: memoryCommand,
    description: 'Memory management operations',
    usage: 'memory <subcommand> [options]',
    examples: [
      'memory store key "value"',
      'memory query search_term',
      'memory stats',
      'memory export backup.json',
    ],
  });

  // SPARC command removed as requested - using Hive Mind for AI orchestration

  commandRegistry.set('spawn', {
    handler: spawnCommand,
    description: 'Spawn AI agents with various coordination modes',
    usage: 'spawn <type> [options]',
    examples: [
      'spawn researcher --name "DataBot"',
      'spawn coder --coordinated --swarm-id swarm-123',
      'spawn architect --enhanced --capabilities "system-design,patterns"',
      'spawn general --verbose',
    ],
    details: `
Spawn AI agents with different coordination levels:
  • Basic spawning: Simple agent creation without orchestrator
  • Coordinated spawning: Full swarm integration with ruv-swarm MCP
  • Enhanced spawning: Local coordination with simulation features

Agent Types:
  • coordinator: Task orchestration and workflow management
  • coder/developer: Code implementation and debugging
  • researcher: Information gathering and analysis
  • analyst/analyzer: Data analysis and performance monitoring
  • tester: Quality assurance and validation
  • architect: System design and technical strategy
  • reviewer: Code review and best practices
  • optimizer: Performance optimization and bottleneck analysis
  • general: Multi-purpose agent (default)

Coordination Options:
  --coordinated, --coord    Enable full swarm coordination (requires ruv-swarm)
  --enhanced, -e           Enable enhanced local coordination
  --name <name>            Custom agent name
  --swarm-id <id>          Target swarm for coordination
  --capabilities <caps>    Custom capabilities specification
  --verbose                Show detailed technical information

Examples:
  spawn researcher                           # Basic researcher agent
  spawn coder --coordinated                  # Coordinated coder with swarm
  spawn architect --enhanced --verbose       # Enhanced architect with details
  spawn general --name "ProjectBot" --coord  # Named coordinated general agent`,
  });

  commandRegistry.set('agent', {
    handler: agentCommand,
    description: 'Manage AI agents and hierarchies',
    usage: 'agent <subcommand> [options]',
    examples: [
      'agent spawn researcher --name "DataBot"',
      'agent list --verbose',
      'agent hierarchy create enterprise',
      'agent ecosystem status',
    ],
  });

  commandRegistry.set('task', {
    handler: taskCommand,
    description: 'Manage tasks and workflows',
    usage: 'task <subcommand> [options]',
    examples: [
      'task create research "Market analysis"',
      'task list --filter running',
      'task workflow examples/dev-flow.json',
      'task coordination status',
    ],
  });

  // commandRegistry.set('workflow', {    handler: visionToCodeWorkflowHandler,    description: 'Manage Vision-to-Code workflows, including strategic visions, ADRs, squads, swarms, and VTC execution.',    usage: 'workflow <command> <subcommand> [options]',    examples: [      'workflow vision create --title "New Product Idea" --description "A great idea" --timeline 6',      'workflow vision approve vis_123 --approver "user@example.com"',      'workflow adr create --title "Microservices Decision" --decision "Use microservices" --vision-id vis_123',      'workflow squad assign-task squad_alpha --title "Implement Auth" --type feature_implementation',      'workflow swarm coordinate vis_123 --optimization-goals speed,quality',      'workflow vtc execute tech_plan_456',    ],    details: `Vision-to-Code Workflow Commands:  vision    Manage strategic visions (create, approve, roadmap, list)  adr       Manage Architectural Decision Records (create, list)  squad     Manage development squads (assign-task)  swarm     Manage swarm coordination (coordinate, agents, mrap)  vtc       Execute Vision-to-Code workflows (execute, progress)This command provides a unified interface for managing the entire Vision-to-Code lifecycle within claude-zen.`,
  // });

  commandRegistry.set('config', {
    handler: configCommand,
    description: 'Manage system configuration',
    usage: 'config <subcommand> [options]',
    examples: [
      'config init',
      'config set terminal.poolSize 15',
      'config get orchestrator.maxConcurrentTasks',
      'config validate',
    ],
  });

  commandRegistry.set('status', {
    handler: statusCommand,
    description: 'Show system status and health',
    usage: 'status [--verbose] [--json]',
    examples: ['status', 'status --verbose', 'status --json'],
  });

  commandRegistry.set('mcp', {
    handler: mcpCommand,
    description: 'Manage MCP server and tools',
    usage: 'mcp <subcommand> [options]',
    examples: ['mcp status', 'mcp start --port 8080', 'mcp tools --verbose', 'mcp auth setup'],
  });

  commandRegistry.set('monitor', {
    handler: monitorCommand,
    description: 'Real-time system monitoring',
    usage: 'monitor [--watch] [--interval <ms>]',
    examples: [
      'monitor',
      'monitor --watch',
      'monitor --interval 1000 --watch',
      'monitor --format json',
    ],
  });

  // Direct swarm command with ruv-swarm integration
  commandRegistry.set('swarm', {
    handler: async (args, flags) => {
      const objective = args.join(' ').trim();
      if (!objective) {
        console.error('❌ Objective required for swarm');
        console.log('Usage: claude-zen swarm "Your objective here" --service my-service');
        return;
      }
      
      // Use the service hive functionality directly
      const { launchServiceHive } = await import('./command-handlers/hive-mind-command.js');
      return launchServiceHive(objective, flags);
    },
    description: '🐝 Launch swarm with ruv-swarm coordination',
    usage: 'swarm <objective> [options]',
    examples: [
      'swarm "Build a REST API" --service api-service',
      'swarm "Create user interface" --service frontend',
      'swarm "Research architecture patterns" --max-agents 5',
    ],
  });

  // Service management commands (promoted from hive-mind)
  commandRegistry.set('create', {
    handler: async (args, flags) => {
      const serviceName = args[0];
      if (!serviceName) {
        console.error('❌ Service name required');
        console.log('Usage: claude-zen create <service-name>');
        return;
      }
      
      const { createHive } = await import('./command-handlers/hive-mind-command.js');
      return createHive([serviceName], flags);
    },
    description: '🏗️ Create new service with persistent coordination',
    usage: 'create <service-name> [options]',
    examples: [
      'create api-service',
      'create frontend-service',
      'create database-service',
    ],
  });

  commandRegistry.set('list', {
    handler: async (args, flags) => {
      const { listHives } = await import('./command-handlers/hive-mind-command.js');
      return listHives(flags);
    },
    description: '📋 List all services and their coordination status',
    usage: 'list [options]',
    examples: [
      'list',
      'list --verbose',
    ],
  });

  commandRegistry.set('hive-mind-optimize', {
    handler: hiveMindOptimizeCommand,
    description: '🔧 Optimize hive mind database for better performance',
    usage: 'hive-mind-optimize [options]',
    examples: [
      'hive-mind-optimize                      # Interactive optimization wizard',
      'hive-mind-optimize --auto               # Auto-optimize with defaults',
      'hive-mind-optimize --report             # Generate optimization report',
      'hive-mind-optimize --clean-memory --memory-days 60',
      'hive-mind-optimize --auto --vacuum --archive-tasks',
    ],
    details: `
Hive Mind Database Optimization Features:
  • Safe, backward-compatible optimizations
  • Performance indexes for 50% faster queries
  • Memory cleanup and archiving
  • Task archival for space management
  • Behavioral pattern tracking
  • Database integrity checking
  
Optimization Levels:
  • v1.0 → v1.1: Basic performance indexes
  • v1.1 → v1.2: Advanced query optimization
  • v1.2 → v1.3: Performance tracking tables
  • v1.3 → v1.4: Memory optimization features
  • v1.4 → v1.5: Behavioral analysis tracking

Safety Features:
  • Automatic backups before major operations
  • All changes are backward-compatible
  • Existing data is always preserved
  • Rollback capability on errors`,
  });

  commandRegistry.set('swarm-metrics', {
    handler: async (args, flags) => {
      const subcommand = args[0];
      if (subcommand === 'fix') {
        return await fixTaskAttribution();
      } else {
        return await showUnifiedMetrics();
      }
    },
    description: 'Unified swarm metrics and task attribution diagnostics',
    usage: 'swarm-metrics [fix] [options]',
    examples: [
      'swarm-metrics                    # Show unified metrics from all swarm systems',
      'swarm-metrics fix                # Fix task attribution issues between systems',
    ],
    details: `
Swarm Metrics Integration Features:
  • Unified view of hive-mind and ruv-swarm metrics
  • Task attribution diagnosis and repair
  • Cross-system swarm performance comparison
  • Database integration status checking
  • Automatic sample task creation for empty swarms

This command helps resolve issues where:
  • Overall task statistics show correctly but per-swarm shows 0/0
  • Multiple swarm systems are not properly integrated
  • Task assignments are missing or incorrectly attributed

Use 'swarm-metrics fix' to automatically repair attribution issues.`,
  });

  commandRegistry.set('batch', {
    handler: batchManagerCommand,
    description: 'Batch operation management and configuration utilities',
    usage: 'batch <command> [options]',
    examples: [
      'batch create-config my-batch.json',
      'batch create-config --interactive',
      'batch validate-config my-batch.json',
      'batch estimate my-batch.json',
      'batch list-templates',
      'batch list-environments',
    ],
    details: `
Batch operations support:
  • Multiple project initialization with templates
  • Environment-specific configurations (dev, staging, prod)
  • Parallel processing with resource management
  • Progress tracking and detailed reporting
  • Configuration validation and estimation tools
  
Use with init command:
  claude-zen init --batch-init project1,project2,project3
  claude-zen init --config batch-config.json --parallel`,
  });

  commandRegistry.set('github', {
    handler: githubCommand,
    description: 'GitHub workflow automation with 6 specialized modes',
    usage: 'github <mode> <objective> [options]',
    examples: [
      'github pr-manager "create feature PR with automated testing"',
      'github gh-coordinator "setup CI/CD pipeline" --auto-approve',
      'github release-manager "prepare v2.0.0 release"',
      'github repo-architect "optimize repository structure"',
      'github issue-tracker "analyze project roadmap issues"',
      'github sync-coordinator "sync package versions across repos"',
    ],
    details: `
GitHub automation modes:
  • gh-coordinator: GitHub workflow orchestration and coordination
  • pr-manager: Pull request management with multi-reviewer coordination
  • issue-tracker: Issue management and project coordination
  • release-manager: Release coordination and deployment pipelines
  • repo-architect: Repository structure optimization
  • sync-coordinator: Multi-package synchronization and version alignment
  
Advanced features:
  • Multi-reviewer coordination with automated scheduling
  • Intelligent issue categorization and assignment
  • Automated testing integration and quality gates
  • Release pipeline orchestration with rollback capabilities`,
  });

  commandRegistry.set('training', {
    handler: trainingAction,
    description: 'Neural pattern learning and model updates',
    usage: 'training <command> [options]',
    examples: [
      'training neural-train --data recent --model task-predictor',
      'training pattern-learn --operation "file-creation" --outcome "success"',
      'training model-update --agent-type coordinator --operation-result "efficient"',
    ],
    details: `
Neural training commands:
  • neural-train: Train neural patterns from operations
  • pattern-learn: Learn from specific operation outcomes
  • model-update: Update agent models with new insights
  
Improves task selection accuracy, agent performance prediction, and coordination efficiency.`,
  });

  commandRegistry.set('analysis', {
    handler: analysisAction,
    description: 'Performance and usage analytics',
    usage: 'analysis <command> [options]',
    examples: [
      'analysis bottleneck-detect --scope system',
      'analysis performance-report --timeframe 7d --format detailed',
      'analysis token-usage --breakdown --cost-analysis',
    ],
    details: `
Analysis commands:
  • bottleneck-detect: Detect performance bottlenecks in the system
  • performance-report: Generate comprehensive performance reports
  • token-usage: Analyze token consumption and costs
  
Helps with performance optimization, cost management, and resource allocation.`,
  });

  commandRegistry.set('automation', {
    handler: automationAction,
    description: 'Intelligent agent and workflow management',
    usage: 'automation <command> [options]',
    examples: [
      'automation auto-agent --task-complexity enterprise --swarm-id swarm-123',
      'automation smart-spawn --requirement "web-development" --max-agents 8',
      'automation workflow-select --project-type api --priority speed',
    ],
    details: `
Automation commands:
  • auto-agent: Automatically spawn optimal agents based on task complexity
  • smart-spawn: Intelligently spawn agents based on specific requirements
  • workflow-select: Select and configure optimal workflows for project types
  
Provides optimal resource allocation and intelligent agent selection.`,
  });

  commandRegistry.set('coordination', {
    handler: coordinationAction,
    description: 'Swarm and agent orchestration',
    usage: 'coordination <command> [options]',
    examples: [
      'coordination swarm-init --topology hierarchical --max-agents 8',
      'coordination agent-spawn --type developer --name "api-dev" --swarm-id swarm-123',
      'coordination task-orchestrate --task "Build REST API" --strategy parallel',
    ],
    details: `
Coordination commands:
  • swarm-init: Initialize swarm coordination infrastructure
  • agent-spawn: Spawn and coordinate new agents
  • task-orchestrate: Orchestrate task execution across agents
  
Enables intelligent task distribution, agent synchronization, and shared memory coordination.`,
  });

  commandRegistry.set('hooks', {
    handler: hooksAction,
    description: 'Lifecycle event management',
    usage: 'hooks <command> [options]',
    examples: [
      'hooks pre-task --description "Build API" --task-id task-123',
      'hooks post-task --task-id task-123 --analyze-performance --generate-insights',
      'hooks session-end --export-metrics --generate-summary',
    ],
    details: `
Hooks commands:
  • pre-task: Execute before task begins (preparation & setup)
  • post-task: Execute after task completion (analysis & cleanup)
  • pre-edit: Execute before file modifications (backup & validation)
  • post-edit: Execute after file modifications (tracking & coordination)
  • session-end: Execute at session termination (cleanup & export)
  
Enables automated preparation & cleanup, performance tracking, and coordination synchronization.`,
  });

  commandRegistry.set('security', {
    handler: securityCommand,
    description: 'Enterprise security management and monitoring',
    usage: 'security <command> [options]',
    examples: [
      'security status',
      'security auth configure',
      'security rbac assign user@example.com developer',
      'security audit search "failed login"',
      'security circuit-breaker reset api-gateway',
    ],
    details: `
Security commands:
  • status: Show security status overview
  • auth: Authentication management
  • rbac: Role-based access control
  • rate-limit: Rate limiting configuration
  • circuit-breaker: Circuit breaker management
  • audit: Audit log management
  • compliance: Compliance status
  • test: Run security tests
  
Enterprise security features with RBAC, MFA, audit logging, and compliance monitoring.`,
  });

  commandRegistry.set('backup', {
    handler: backupCommand,
    description: 'Data backup and disaster recovery management',
    usage: 'backup <command> [options]',
    examples: [
      'backup configure --strategy 3-2-1',
      'backup dr test',
      'backup restore "backup-20240110-023000"',
      'backup list --filter recent',
    ],
    details: `
Backup commands:
  • configure: Configure backup strategy (3-2-1 recommended)
  • dr: Disaster recovery management
  • restore: Restore from backup
  • list: List available backups
  
Enterprise backup features with automated scheduling, encryption, and disaster recovery testing.`,
  });

  commandRegistry.set('hook-safety', {
    handler: hookSafetyCommand,
    description: '🚨 Critical hook safety system - Prevent infinite loops & financial damage',
    usage: 'hook-safety <command> [options]',
    examples: [
      'hook-safety validate                           # Check for dangerous hook configurations',
      'hook-safety validate --config ~/.claude/settings.json',
      'hook-safety status                             # View safety status and context',
      'hook-safety reset                              # Reset circuit breakers',
      'hook-safety safe-mode                          # Enable safe mode (skip all hooks)',
    ],
    details: `
🚨 CRITICAL: Stop hooks calling 'claude' commands create INFINITE LOOPS that can:
  • Bypass API rate limits
  • Cost thousands of dollars per day  
  • Make your system unresponsive

Hook Safety commands:
  • validate: Check Claude Code settings for dangerous patterns
  • status: Show current safety status and execution context
  • reset: Reset circuit breakers and execution counters  
  • safe-mode: Enable/disable safe mode (skips all hooks)

SAFE ALTERNATIVES:
  • Use PostToolUse hooks instead of Stop hooks
  • Implement flag-based update patterns
  • Use 'claude --skip-hooks' for manual updates
  • Create conditional execution scripts

For more information: https://github.com/ruvnet/claude-zen/issues/166`,
  });

  commandRegistry.set('migrate-hooks', migrateHooksCommandConfig);

  commandRegistry.set('fix-hook-variables', {
    handler: fixHookVariablesCommand,
    ...fixHookVariablesCommandConfig,
  });

  commandRegistry.set('template', {
    handler: templateCommand,
    description: 'Template management system for Claude Zen projects',
    usage: 'template <command> [options]',
    examples: [
      'template list',
      'template info claude-zen',
      'template create my-template --description "Custom template"',
      'template install claude-zen ./my-project --force'
    ],
    details: `
Template Management Commands:
  • list                     Show all available templates
  • info <template-name>      Display detailed template information
  • create <template-name>    Create new template from current directory
  • install <template-name>   Install template to target directory

Template Features:
  📦 Plugin ecosystem templates with pre-configured components
  🔧 Automated setup and post-install configuration
  📋 Comprehensive documentation and examples
  🎯 Category-based organization and discovery
  ✨ Feature-rich templates with validation

Available Templates:
  • claude-zen: Full plugin ecosystem with swarm integration
  • basic: Minimal Claude Zen project structure

Options:
  --force                    Force overwrite existing files
  --minimal                  Install only required files
  --description <text>       Template description
  --version <version>        Template version
  --category <category>      Template category

The template system enables rapid project initialization with pre-configured
plugins, settings, and development workflows.`
  });

  commandRegistry.set('system', {
    handler: systemConsolidationCommand,
    description: 'Unified system control and consolidation',
    usage: 'system <action> [options]',
    examples: [
      'system start',
      'system status',
      'system consolidate'
    ],
    details: `Unified System Control:
  start        Start integrated system (API + Dashboard + Queen Council)
  stop         Stop all components
  restart      Restart entire system  
  status       Comprehensive system status
  consolidate  Show command consolidation analysis`
  });

  commandRegistry.set('queen-council', {
    handler: queenCouncilCommand,
    description: 'Multi-queen strategic coordination with document integration',
    usage: 'queen-council <command> [options]',
    examples: [
      'queen-council convene "Implement multi-tenant architecture"',
      'queen-council convene --auto --silent',
      'queen-council status',
      'queen-council decisions --recent'
    ],
    details: `
Multi-Queen Strategic Coordination:
  👑 7 specialized queens for comprehensive strategic analysis
  📚 Full document integration (PRDs, Roadmaps, Architecture, ADRs)
  🏛️ Democratic consensus with confidence weighting
  📋 Automatic document updates and ADR creation

Queen Specializations:
  👑 Roadmap Queen       Strategic planning and timeline coordination
  👑 PRD Queen           Product requirements and feature coordination  
  👑 Architecture Queen  Technical design and system coordination
  👑 Development Queen   Implementation and code coordination
  👑 Research Queen      Information gathering and analysis
  👑 Integration Queen   System integration coordination
  👑 Performance Queen   Optimization and efficiency coordination

Commands:
  convene "<objective>"   Convene queen council for strategic decision
  status                  Show council status and queen health
  decisions               Show decision history and consensus logs

Document Integration:
  • Roadmaps: docs/strategic/roadmaps/*.md
  • PRDs: docs/strategic/prds/*.md
  • Architecture: docs/strategic/architecture/*.md
  • ADRs: docs/strategic/adrs/*.md (auto-generated)
  • Strategy: docs/strategic/strategy/*.md

Features:
  🗳️ Democratic voting with 67% consensus threshold
  📝 Automatic ADR creation for architectural decisions
  🔄 Real-time document updates based on decisions
  ⚖️ Conflict resolution and human escalation
  📊 Decision tracking and audit logs

This system provides strategic intelligence for complex decisions while
maintaining full documentation and decision audit trails.`
  });

  commandRegistry.set('websocket', {
    handler: websocketCommand,
    description: 'WebSocket client/server management with Node.js 22 native support',
    usage: 'websocket <command> [options]',
    examples: [
      'websocket support',
      'websocket test ws://localhost:3000/ws',
      'websocket connect ws://localhost:3000/ws --name my-client',
      'websocket status --verbose --stats',
      'websocket send "Hello WebSocket" --type greeting',
      'websocket monitor ws://localhost:3000/ws --stats',
      'websocket benchmark --messages 5000 --concurrency 10',
    ],
    details: `WebSocket Commands:

  support                    Show WebSocket support information and Node.js 22 features
  test [url]                Test WebSocket connectivity
  connect <url>             Connect and maintain WebSocket connection  
  status                     Show WebSocket service status
  send <message>            Send message via WebSocket
  monitor [urls...]         Monitor multiple WebSocket connections
  benchmark [url]           Benchmark WebSocket performance

NODE.JS 22 FEATURES:
  • Native WebSocket client (use --experimental-websocket flag)
  • Standards-compliant implementation (RFC 6455)
  • Better performance than external libraries
  • Built-in ping/pong support
  • Automatic connection management

INTEGRATION:
  • Real-time updates for claude-zen UI
  • Queen Council decision broadcasting
  • Swarm orchestration status updates  
  • Neural network training progress
  • Memory operation notifications

The WebSocket system provides high-performance, real-time communication capabilities using Node.js 22's native WebSocket implementation with automatic reconnection, message queuing, and comprehensive monitoring.`,
  });

  commandRegistry.set('plugin', pluginStatusCommandConfig);

  commandRegistry.set('server', serverCommandConfig);

  commandRegistry.set('dashboard', dashboardCommandConfig);

  commandRegistry.set('hive', {
    handler: async (args, flags) => {
      try {
        // Try to load the hive command module
        const { hiveAction } = await import('./commands/hive.js');
        return hiveAction({ args, flags, command: 'hive' });
      } catch (error) {
        // Fallback to simple implementation if module not found
        console.log('🐝 Hive Mind - Advanced Multi-Agent Coordination');
        console.log('');
        console.log('The Hive Mind system provides:');
        console.log('  • Consensus-based decision making');
        console.log('  • Distributed task orchestration');
        console.log('  • Quality-driven execution');
        console.log('  • Real-time swarm monitoring');
        console.log('');
        console.log('Usage: hive <objective> [options]');
        console.log('');
        console.log('For full functionality, ensure the hive module is properly built.');
      }
    },
    description: 'Hive Mind - Advanced multi-agent swarm with consensus',
    usage: 'hive <objective> [options]',
    examples: [
      'hive "Build microservices architecture"',
      'hive "Optimize database performance" --consensus unanimous',
      'hive "Develop ML pipeline" --topology mesh --monitor',
      'hive "Create REST API" --sparc --max-agents 8',
      'hive "Research cloud patterns" --background --quality-threshold 0.9',
    ],
    details: `
Hive Mind features:
  • 👑 Queen-led orchestration with specialized agents
  • 🗳️ Consensus mechanisms (quorum, unanimous, weighted, leader)
  • 🏗️ Multiple topologies (hierarchical, mesh, ring, star)
  • 📊 Real-time monitoring dashboard
  • 🧪 SPARC methodology integration
  • 💾 Distributed memory and knowledge sharing
  
Agent types:
  • Queen: Orchestrator and decision maker
  • Architect: System design and planning  
  • Worker: Implementation and execution
  • Scout: Research and exploration
  • Guardian: Quality and validation
  
Options:
  --topology <type>         Swarm topology (default: hierarchical)
  --consensus <type>        Decision mechanism (default: quorum)
  --max-agents <n>          Maximum agents (default: 8)
  --quality-threshold <n>   Min quality 0-1 (default: 0.8)
  --sparc                   Use SPARC methodology
  --monitor                 Real-time monitoring
  --background              Run in background`,
  });

  // Temporarily commented out for Node.js compatibility
  commandRegistry.set('ruv-swarm', {
  handler: async (args, flags) => {
    console.log('🐝 ruv-swarm command placeholder - integration in progress');
  },
  description: 'Advanced AI swarm coordination with neural capabilities',
  usage: 'ruv-swarm <command> [options]',
  hidden: true,
  examples: [
    'ruv-swarm init --topology mesh --max-agents 8',
    'ruv-swarm spawn researcher --name "AI Researcher"',
    'ruv-swarm orchestrate "Build a REST API"',
    'ruv-swarm neural train --iterations 20',
    'ruv-swarm benchmark --type swarm',
    'ruv-swarm config show',
    'ruv-swarm status --verbose'
  ],
  help: `
Advanced swarm coordination features:

- Neural network integration for intelligent agent behavior
- Multiple coordination topologies (mesh, hierarchical, ring, star)
- Real-time performance monitoring and metrics
- WASM-based optimization for high-performance tasks

COMMANDS:
  init        - Initialize swarm with specified topology
  spawn       - Spawn new agents with specific capabilities
  orchestrate - Orchestrate complex tasks across the swarm
  status      - Get current swarm status and metrics
  neural      - Manage neural network training and patterns
  benchmark   - Run performance benchmarks
  config      - Manage ruv-swarm configuration
`
});

  // Additional ruv-swarm coordination commands - temporarily commented out
  /*
  commandRegistry.set('swarm-init', {
    handler: async (args, flags) => {
      const { ruvSwarmAction } = await import('./commands/ruv-swarm.js');
      return ruvSwarmAction({ args: ['init', ...args], flags });
    },
    description: 'Quick swarm initialization with topology selection',
    usage: 'swarm-init [--topology <type>] [--max-agents <n>] [--strategy <type>]',
    examples: [
      'swarm-init --topology mesh --max-agents 8',
      'swarm-init --topology hierarchical --strategy specialized',
      'swarm-init --topology star --max-agents 5 --strategy balanced'
    ]
  });

  commandRegistry.set('neural-spawn', {
    handler: async (args, flags) => {
      const { ruvSwarmAction } = await import('./commands/ruv-swarm.js');
      return ruvSwarmAction({ args: ['spawn', ...args], flags });
    },
    description: 'Spawn neural agents with cognitive capabilities',
    usage: 'neural-spawn <type> [--name <name>] [--capabilities <list>]',
    examples: [
      'neural-spawn researcher --name "Data Analyst"',
      'neural-spawn coder --capabilities "typescript,react,api"',
      'neural-spawn coordinator --name "Project Manager"'
    ]
  });

  commandRegistry.set('memory-coordinate', {
    handler: async (args, flags) => {
      const { ruvSwarmAction } = await import('./commands/ruv-swarm.js');
      return ruvSwarmAction({ args: ['memory', ...args], flags });
    },
    description: 'Coordinate memory across swarm agents',
    usage: 'memory-coordinate [--detail <level>] [--sync] [--compress]',
    examples: [
      'memory-coordinate --detail summary',
      'memory-coordinate --detail detailed --sync',
      'memory-coordinate --compress --sync'
    ]
  });

  commandRegistry.set('config-integration', {
    handler: configIntegrationAction,
    description: 'Enhanced configuration management with ruv-swarm integration',
    usage: 'config-integration <command> [options]',
    examples: [
      'config-integration setup --enable-ruv-swarm',
      'config-integration preset development',
      'config-integration sync --force',
      'config-integration status --verbose',
      'config-integration export my-config.json',
      'config-integration validate --fix'
    ],
    details: `
Advanced configuration management features:
  • Unified configuration across Claude-Flow and ruv-swarm
  • Configuration presets for different environments
  • Automatic synchronization between config systems
  • Import/export capabilities with validation
  • Real-time status monitoring and validation
  
Presets:
  development  - Hierarchical topology, specialized strategy, 8 agents
  research     - Mesh topology, adaptive strategy, 12 agents  
  production   - Star topology, balanced strategy, 6 agents
  
Commands:
  setup        - Initialize ruv-swarm integration
  sync         - Synchronize configurations
  status       - Show integration status
  validate     - Validate all configurations
  preset       - Apply configuration preset
  export       - Export unified configuration
  import       - Import and apply configuration`
  });
  */
}

// Register a new command
export function registerCommand(name, command) {
  if (commandRegistry.has(name)) {
    console.warn(`Command '${name}' already exists and will be overwritten`);
  }

  commandRegistry.set(name, {
    handler: command.handler,
    description: command.description || 'No description available',
    usage: command.usage || `${name} [options]`,
    examples: command.examples || [],
    hidden: command.hidden || false,
  });
}

// Get command handler
export function getCommand(name) {
  return commandRegistry.get(name);
}

// List all registered commands
export function listCommands(includeHidden = false) {
  const commands = [];
  for (const [name, command] of commandRegistry.entries()) {
    if (includeHidden || !command.hidden) {
      commands.push({
        name,
        ...command,
      });
    }
  }
  return commands.sort((a, b) => a.name.localeCompare(b.name));
}

// Check if command exists
export function hasCommand(name) {
  return commandRegistry.has(name);
}

// Execute a command
export async function executeCommand(name, subArgs, flags) {
  const command = commandRegistry.get(name);
  if (!command) {
    throw new Error(`Unknown command: ${name}`);
  }

  try {
    await command.handler(subArgs, flags);
  } catch (err) {
    throw new Error(`Command '${name}' failed: ${err.message}`);
  }
}

// Helper to show command help
export function showCommandHelp(name) {
  const command = commandRegistry.get(name);
  if (!command) {
    console.log(
      HelpFormatter.formatError(
        `Unknown command: ${name}`,
        'claude-zen',
        'claude-zen <command> [options]',
      ),
    );
    return;
  }

  // If command has custom help, call it with help flag
  if (command.customHelp) {
    command.handler(['--help'], { help: true });
    return;
  }

  // Convert command info to standardized format
  const helpInfo = {
    name: `claude-zen ${name}`,
    description: HelpFormatter.stripFormatting(command.description),
    usage: `claude-zen ${command.usage}`,
  };

  // Parse examples
  if (command.examples && command.examples.length > 0) {
    helpInfo.examples = command.examples.map((ex) => {
      if (ex.startsWith('npx')) {
        return ex;
      }
      return `claude-zen ${ex}`;
    });
  }

  // Parse options from details if available
  if (command.details) {
    const optionsMatch = command.details.match(/Options:([\s\S]*?)(?=\n\n|$)/);
    if (optionsMatch) {
      const optionsText = optionsMatch[1];
      const options = [];
      const optionLines = optionsText.split('\n').filter((line) => line.trim());

      for (const line of optionLines) {
        const match = line.match(/^\s*(--.+?)\s{2,}(.+)$/);
        if (match) {
          const [_, flags, description] = match;
          // Check for default value in description
          const defaultMatch = description.match(/\(default: (.+?)\)/);
          const option = {
            flags: flags.trim(),
            description: description.replace(/\(default: .+?\)/, '').trim(),
          };
          if (defaultMatch) {
            option.defaultValue = defaultMatch[1];
          }
          options.push(option);
        }
      }

      if (options.length > 0) {
        helpInfo.options = options;
      }
    }
  }

  console.log(HelpFormatter.formatHelp(helpInfo));
}

// Helper to show all commands
export function showAllCommands() {
  const commands = listCommands();

  console.log('Available commands:');
  console.log();

  for (const command of commands) {
    console.log(`  ${command.name.padEnd(12)} ${command.description}`);
  }

  console.log();
  console.log('Use "claude-zen help <command>" for detailed usage information');
}

// Parse command line with meow
export const parseCLI = () => {
  const cli = createMeowCLI();
  return {
    command: cli.input[0],
    args: cli.input.slice(1),
    flags: cli.flags
  };
};

// Generate API endpoints from meow command definitions
export const generateAPIEndpoints = () => {
  const commands = listCommands();
  const endpoints = {};
  
  for (const command of commands) {
    // Generate REST endpoints for each command
    const commandName = command.name;
    const endpoint = `/api/${commandName.replace(/-/g, '/')}`;
    
    endpoints[endpoint] = {
      post: {
        summary: command.description,
        operationId: `${commandName}Command`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  args: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Command arguments'
                  },
                  flags: {
                    type: 'object',
                    description: 'Command flags and options'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Command executed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    result: { type: 'object' },
                    timestamp: { type: 'string' }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid request' },
          500: { description: 'Internal server error' }
        }
      }
    };
  }
  
  return endpoints;
};

// Initialize the command registry
registerCoreCommands();
