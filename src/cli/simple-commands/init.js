// init.js - Initialize Claude Code integration files
import { printSuccess, printError, printWarning } from '../utils.js';

export async function initCommand(subArgs, flags) {
  // Show help if requested
  if (flags.help || flags.h || subArgs.includes('--help') || subArgs.includes('-h')) {
    showInitHelp();
    return;
  }
  
  // Parse init options
  const initForce = subArgs.includes('--force') || subArgs.includes('-f') || flags.force;
  const initMinimal = subArgs.includes('--minimal') || subArgs.includes('-m') || flags.minimal;
  const initSparc = subArgs.includes('--sparc') || subArgs.includes('-s') || flags.sparc;
  
  // Get the actual working directory (where the command was run from)
  // Use PWD environment variable which preserves the original directory
  const workingDir = Deno.env.get('PWD') || Deno.cwd();
  console.log(`📁 Initializing in: ${workingDir}`);
  
  // Change to the working directory to ensure all file operations happen there
  try {
    Deno.chdir(workingDir);
  } catch (err) {
    printWarning(`Could not change to directory ${workingDir}: ${err.message}`);
  }
  
  try {
    printSuccess('Initializing Claude Code integration files...');
    
    // Check if files already exist in the working directory
    const files = ['CLAUDE.md', 'memory-bank.md', 'coordination.md'];
    const existingFiles = [];
    
    for (const file of files) {
      try {
        await Deno.stat(`${workingDir}/${file}`);
        existingFiles.push(file);
      } catch {
        // File doesn't exist, which is what we want
      }
    }
    
    if (existingFiles.length > 0 && !initForce) {
      printWarning(`The following files already exist: ${existingFiles.join(', ')}`);
      console.log('Use --force to overwrite existing files');
      return;
    }
    
    // Create CLAUDE.md
    const claudeMd = initSparc ? createSparcClaudeMd() : 
                     initMinimal ? createMinimalClaudeMd() : createFullClaudeMd();
    await Deno.writeTextFile('CLAUDE.md', claudeMd);
    console.log(`  ✓ Created CLAUDE.md${initSparc ? ' (SPARC-enhanced)' : ''}`);
    
    // Create memory-bank.md
    const memoryBankMd = initMinimal ? createMinimalMemoryBankMd() : createFullMemoryBankMd();
    await Deno.writeTextFile('memory-bank.md', memoryBankMd);
    console.log('  ✓ Created memory-bank.md');
    
    // Create coordination.md
    const coordinationMd = initMinimal ? createMinimalCoordinationMd() : createFullCoordinationMd();
    await Deno.writeTextFile('coordination.md', coordinationMd);
    console.log('  ✓ Created coordination.md');
    
    // Create directory structure
    const directories = [
      'memory',
      'memory/agents',
      'memory/sessions',
      'coordination',
      'coordination/memory_bank',
      'coordination/subtasks',
      'coordination/orchestration'
    ];
    
    for (const dir of directories) {
      try {
        await Deno.mkdir(dir, { recursive: true });
        console.log(`  ✓ Created ${dir}/ directory`);
      } catch (err) {
        if (!(err instanceof Deno.errors.AlreadyExists)) {
          throw err;
        }
      }
    }
    
    // Create placeholder files for memory directories
    const agentsReadme = createAgentsReadme();
    await Deno.writeTextFile('memory/agents/README.md', agentsReadme);
    console.log('  ✓ Created memory/agents/README.md');
    
    const sessionsReadme = createSessionsReadme();
    await Deno.writeTextFile('memory/sessions/README.md', sessionsReadme);
    console.log('  ✓ Created memory/sessions/README.md');
    
    // Initialize persistence database
    const initialData = {
      agents: [],
      tasks: [],
      lastUpdated: Date.now()
    };
    await Deno.writeTextFile('memory/claude-flow-data.json', JSON.stringify(initialData, null, 2));
    console.log('  ✓ Created memory/claude-flow-data.json (persistence database)');
    
    // Create local claude-flow executable wrapper
    await createLocalExecutable(workingDir);
    
    // SPARC initialization
    if (initSparc) {
      console.log('\n🚀 Initializing SPARC development environment...');
      
      // Check if create-sparc exists and run it
      try {
        const createSparcCommand = new Deno.Command('npx', {
          args: ['-y', 'create-sparc', 'init', '--force'],
          cwd: workingDir, // Use the original working directory
          stdout: 'inherit',
          stderr: 'inherit',
          env: {
            ...Deno.env.toObject(),
            PWD: workingDir, // Ensure PWD is set correctly
          },
        });
        
        console.log('  🔄 Running: npx -y create-sparc init --force');
        const createSparcResult = await createSparcCommand.output();
        
        if (createSparcResult.success) {
          console.log('  ✅ SPARC environment initialized successfully');
        } else {
          printWarning('create-sparc failed, creating basic SPARC structure manually...');
          
          // Fallback: create basic SPARC structure manually
          await createSparcStructureManually();
        }
      } catch (err) {
        printWarning('create-sparc not available, creating basic SPARC structure manually...');
        
        // Fallback: create basic SPARC structure manually
        await createSparcStructureManually();
      }
    }
    
    printSuccess('Claude Code integration files initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Review and customize the generated files for your project');
    console.log('2. Run \'./claude-flow start\' to begin the orchestration system');
    console.log('3. Use \'./claude-flow\' instead of \'npx claude-flow\' for all commands');
    console.log('4. Use \'claude --dangerously-skip-permissions\' for unattended operation');
    if (initSparc) {
      console.log('5. Explore SPARC modes with \'./claude-flow sparc modes\'');
      console.log('6. Try TDD workflow with \'./claude-flow sparc tdd "your task"\'');
    }
    console.log('\nNote: Local executable created at ./claude-flow');
    console.log('Note: Persistence database initialized at memory/claude-flow-data.json');
    if (initSparc) {
      console.log('Note: SPARC development environment available in .roo/ directory');
    }
    
  } catch (err) {
    printError(`Failed to initialize files: ${err.message}`);
  }
}

// Create local executable wrapper
async function createLocalExecutable(workingDir) {
  try {
    if (Deno.build.os === 'windows') {
      // Create Windows batch file
      const wrapperScript = `@echo off
REM Claude-Flow local wrapper
REM This script ensures claude-flow runs from your project directory

set PROJECT_DIR=%CD%
set PWD=%PROJECT_DIR%
set CLAUDE_WORKING_DIR=%PROJECT_DIR%

REM Try to find claude-flow binary
REM Check common locations for npm/npx installations

REM 1. Local node_modules (npm install claude-flow)
if exist "%PROJECT_DIR%\\node_modules\\.bin\\claude-flow.cmd" (
  cd /d "%PROJECT_DIR%"
  "%PROJECT_DIR%\\node_modules\\.bin\\claude-flow.cmd" %*
  exit /b %ERRORLEVEL%
)

REM 2. Parent directory node_modules (monorepo setup)
if exist "%PROJECT_DIR%\\..\\node_modules\\.bin\\claude-flow.cmd" (
  cd /d "%PROJECT_DIR%"
  "%PROJECT_DIR%\\..\\node_modules\\.bin\\claude-flow.cmd" %*
  exit /b %ERRORLEVEL%
)

REM 3. Global installation (npm install -g claude-flow)
where claude-flow >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  cd /d "%PROJECT_DIR%"
  claude-flow %*
  exit /b %ERRORLEVEL%
)

REM 4. Fallback to npx (will download if needed)
cd /d "%PROJECT_DIR%"
npx claude-flow %*
`;

      // Write the Windows batch file
      await Deno.writeTextFile(`${workingDir}/claude-flow.cmd`, wrapperScript);
      console.log('  ✓ Created local claude-flow.cmd executable wrapper');
      console.log('    You can now use: claude-flow instead of npx claude-flow');
      
    } else {
      // Check if we're in development mode (claude-code-flow repo)
      const isDevelopment = workingDir.includes('claude-code-flow');
      const devBinPath = isDevelopment ? 
        workingDir.split('claude-code-flow')[0] + 'claude-code-flow/bin/claude-flow' : '';
      
      // Create Unix/Linux/Mac shell script
      const wrapperScript = `#!/usr/bin/env bash
# Claude-Flow local wrapper
# This script ensures claude-flow runs from your project directory

# Save the current directory
PROJECT_DIR="\${PWD}"

# Set environment to ensure correct working directory
export PWD="\${PROJECT_DIR}"
export CLAUDE_WORKING_DIR="\${PROJECT_DIR}"

# Try to find claude-flow binary
# Check common locations for npm/npx installations

${isDevelopment ? `# Development mode - use local bin
if [ -f "${devBinPath}" ]; then
  cd "\${PROJECT_DIR}"
  exec "${devBinPath}" "$@"
fi

` : ''}# 1. Local node_modules (npm install claude-flow)
if [ -f "\${PROJECT_DIR}/node_modules/.bin/claude-flow" ]; then
  cd "\${PROJECT_DIR}"
  exec "\${PROJECT_DIR}/node_modules/.bin/claude-flow" "$@"

# 2. Parent directory node_modules (monorepo setup)
elif [ -f "\${PROJECT_DIR}/../node_modules/.bin/claude-flow" ]; then
  cd "\${PROJECT_DIR}"
  exec "\${PROJECT_DIR}/../node_modules/.bin/claude-flow" "$@"

# 3. Global installation (npm install -g claude-flow)
elif command -v claude-flow &> /dev/null; then
  cd "\${PROJECT_DIR}"
  exec claude-flow "$@"

# 4. Fallback to npx (will download if needed)
else
  cd "\${PROJECT_DIR}"
  exec npx claude-flow@latest "$@"
fi
`;

      // Write the wrapper script
      await Deno.writeTextFile(`${workingDir}/claude-flow`, wrapperScript);
      
      // Make it executable
      await Deno.chmod(`${workingDir}/claude-flow`, 0o755);
      
      console.log('  ✓ Created local claude-flow executable wrapper');
      console.log('    You can now use: ./claude-flow instead of npx claude-flow');
    }
    
  } catch (err) {
    console.log(`  ⚠️  Could not create local executable: ${err.message}`);
  }
}

// Helper function to create SPARC structure manually
async function createSparcStructureManually() {
  try {
    // Ensure we're in the working directory
    const workingDir = Deno.env.get('PWD') || Deno.cwd();
    
    // Create .roo directory structure in working directory
    const rooDirectories = [
      `${workingDir}/.roo`,
      `${workingDir}/.roo/templates`,
      `${workingDir}/.roo/workflows`,
      `${workingDir}/.roo/modes`,
      `${workingDir}/.roo/configs`
    ];
    
    for (const dir of rooDirectories) {
      try {
        await Deno.mkdir(dir, { recursive: true });
        console.log(`  ✓ Created ${dir}/`);
      } catch (err) {
        if (!(err instanceof Deno.errors.AlreadyExists)) {
          throw err;
        }
      }
    }
    
    // Create .roomodes file (copy from existing if available, or create basic version)
    let roomodesContent;
    try {
      // Check if .roomodes already exists and read it
      roomodesContent = await Deno.readTextFile(`${workingDir}/.roomodes`);
      console.log('  ✓ Using existing .roomodes configuration');
    } catch {
      // Create basic .roomodes configuration
      roomodesContent = createBasicRoomodesConfig();
      await Deno.writeTextFile(`${workingDir}/.roomodes`, roomodesContent);
      console.log('  ✓ Created .roomodes configuration');
    }
    
    // Create basic workflow templates
    const basicWorkflow = createBasicSparcWorkflow();
    await Deno.writeTextFile(`${workingDir}/.roo/workflows/basic-tdd.json`, basicWorkflow);
    console.log('  ✓ Created .roo/workflows/basic-tdd.json');
    
    // Create README for .roo directory
    const rooReadme = createRooReadme();
    await Deno.writeTextFile(`${workingDir}/.roo/README.md`, rooReadme);
    console.log('  ✓ Created .roo/README.md');
    
    console.log('  ✅ Basic SPARC structure created successfully');
    
  } catch (err) {
    console.log(`  ❌ Failed to create SPARC structure: ${err.message}`);
  }
}

// Template creation functions
function createMinimalClaudeMd() {
  return `# Claude Code Configuration

## Build Commands
- \`npm run build\`: Build the project
- \`npm run test\`: Run tests
- \`npm run lint\`: Run linter

## Code Style
- Use TypeScript/ES modules
- Follow project conventions
- Run typecheck before committing

## Project Info
This is a Claude-Flow AI agent orchestration system.
`;
}

function createFullClaudeMd() {
  return `# Claude Code Configuration

## Build Commands
- \`npm run build\`: Build the project using Deno compile
- \`npm run test\`: Run the full test suite
- \`npm run lint\`: Run ESLint and format checks
- \`npm run typecheck\`: Run TypeScript type checking
- \`npx claude-flow start\`: Start the orchestration system
- \`npx claude-flow --help\`: Show all available commands

## Code Style Preferences
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (e.g., \`import { foo } from 'bar'\`)
- Use TypeScript for all new code
- Follow existing naming conventions (camelCase for variables, PascalCase for classes)
- Add JSDoc comments for public APIs
- Use async/await instead of Promise chains
- Prefer const/let over var

## Workflow Guidelines
- Always run typecheck after making code changes
- Run tests before committing changes
- Use meaningful commit messages following conventional commits
- Create feature branches for new functionality
- Ensure all tests pass before merging

## Project Architecture
This is a Claude-Flow AI agent orchestration system with the following components:
- **CLI Interface**: Command-line tools for managing the system
- **Orchestrator**: Core engine for coordinating agents and tasks
- **Memory System**: Persistent storage and retrieval of information
- **Terminal Management**: Automated terminal session handling
- **MCP Integration**: Model Context Protocol server for Claude integration
- **Agent Coordination**: Multi-agent task distribution and management

## Important Notes
- Use \`claude --dangerously-skip-permissions\` for unattended operation
- The system supports both daemon and interactive modes
- Memory persistence is handled automatically
- All components are event-driven for scalability

## Debugging
- Check logs in \`./claude-flow.log\`
- Use \`npx claude-flow status\` to check system health
- Monitor with \`npx claude-flow monitor\` for real-time updates
- Verbose output available with \`--verbose\` flag on most commands
`;
}

function createSparcClaudeMd() {
  return `# Claude Code Configuration - SPARC Development Environment

## Project Overview
This project uses the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic Test-Driven Development with AI assistance through Claude-Flow orchestration.

## SPARC Development Commands

### Core SPARC Commands
- \`npx claude-flow sparc modes\`: List all available SPARC development modes
- \`npx claude-flow sparc run <mode> "<task>"\`: Execute specific SPARC mode for a task
- \`npx claude-flow sparc tdd "<feature>"\`: Run complete TDD workflow using SPARC methodology
- \`npx claude-flow sparc info <mode>\`: Get detailed information about a specific mode

### Standard Build Commands
- \`npm run build\`: Build the project
- \`npm run test\`: Run the test suite
- \`npm run lint\`: Run linter and format checks
- \`npm run typecheck\`: Run TypeScript type checking

## SPARC Methodology Workflow

### 1. Specification Phase
\`\`\`bash
# Create detailed specifications and requirements
npx claude-flow sparc run spec-pseudocode "Define user authentication requirements"
\`\`\`
- Define clear functional requirements
- Document edge cases and constraints
- Create user stories and acceptance criteria
- Establish non-functional requirements

### 2. Pseudocode Phase
\`\`\`bash
# Develop algorithmic logic and data flows
npx claude-flow sparc run spec-pseudocode "Create authentication flow pseudocode"
\`\`\`
- Break down complex logic into steps
- Define data structures and interfaces
- Plan error handling and edge cases
- Create modular, testable components

### 3. Architecture Phase
\`\`\`bash
# Design system architecture and component structure
npx claude-flow sparc run architect "Design authentication service architecture"
\`\`\`
- Create system diagrams and component relationships
- Define API contracts and interfaces
- Plan database schemas and data flows
- Establish security and scalability patterns

### 4. Refinement Phase (TDD Implementation)
\`\`\`bash
# Execute Test-Driven Development cycle
npx claude-flow sparc tdd "implement user authentication system"
\`\`\`

**TDD Cycle:**
1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Optimize and clean up code
4. **Repeat**: Continue until feature is complete

### 5. Completion Phase
\`\`\`bash
# Integration, documentation, and validation
npx claude-flow sparc run integration "integrate authentication with user management"
\`\`\`
- Integrate all components
- Perform end-to-end testing
- Create comprehensive documentation
- Validate against original requirements

## SPARC Mode Reference

### Development Modes
- **\`architect\`**: System design and architecture planning
- **\`code\`**: Clean, modular code implementation
- **\`tdd\`**: Test-driven development and testing
- **\`spec-pseudocode\`**: Requirements and algorithmic planning
- **\`integration\`**: System integration and coordination

### Quality Assurance Modes
- **\`debug\`**: Troubleshooting and bug resolution
- **\`security-review\`**: Security analysis and vulnerability assessment
- **\`refinement-optimization-mode\`**: Performance optimization and refactoring

### Support Modes
- **\`docs-writer\`**: Documentation creation and maintenance
- **\`devops\`**: Deployment and infrastructure management
- **\`mcp\`**: External service integration

## Code Style and Best Practices

### SPARC Development Principles
- **Modular Design**: Keep files under 500 lines, break into logical components
- **Environment Safety**: Never hardcode secrets or environment-specific values
- **Test-First**: Always write tests before implementation (Red-Green-Refactor)
- **Clean Architecture**: Separate concerns, use dependency injection
- **Documentation**: Maintain clear, up-to-date documentation

### Coding Standards
- Use TypeScript for type safety and better tooling
- Follow consistent naming conventions (camelCase for variables, PascalCase for classes)
- Implement proper error handling and logging
- Use async/await for asynchronous operations
- Prefer composition over inheritance

### Memory and State Management
- Use claude-flow memory system for persistent state across sessions
- Store progress and findings using namespaced keys
- Query previous work before starting new tasks
- Export/import memory for backup and sharing

## SPARC Memory Integration

### Memory Commands for SPARC Development
\`\`\`bash
# Store project specifications
npx claude-flow memory store spec_auth "User authentication requirements and constraints"

# Store architectural decisions
npx claude-flow memory store arch_decisions "Database schema and API design choices"

# Store test results and coverage
npx claude-flow memory store test_coverage "Authentication module: 95% coverage, all tests passing"

# Query previous work
npx claude-flow memory query auth_implementation

# Export project memory
npx claude-flow memory export project_backup.json
\`\`\`

### Memory Namespaces
- **\`spec\`**: Requirements and specifications
- **\`arch\`**: Architecture and design decisions
- **\`impl\`**: Implementation notes and code patterns
- **\`test\`**: Test results and coverage reports
- **\`debug\`**: Bug reports and resolution notes

## Workflow Examples

### Feature Development Workflow
\`\`\`bash
# 1. Start with specification
npx claude-flow sparc run spec-pseudocode "User profile management feature"

# 2. Design architecture
npx claude-flow sparc run architect "Profile service architecture with data validation"

# 3. Implement with TDD
npx claude-flow sparc tdd "user profile CRUD operations"

# 4. Security review
npx claude-flow sparc run security-review "profile data access and validation"

# 5. Integration testing
npx claude-flow sparc run integration "profile service with authentication system"

# 6. Documentation
npx claude-flow sparc run docs-writer "profile service API documentation"
\`\`\`

### Bug Fix Workflow
\`\`\`bash
# 1. Debug and analyze
npx claude-flow sparc run debug "authentication token expiration issue"

# 2. Write regression tests
npx claude-flow sparc run tdd "token refresh mechanism tests"

# 3. Implement fix
npx claude-flow sparc run code "fix token refresh in authentication service"

# 4. Security review
npx claude-flow sparc run security-review "token handling security implications"
\`\`\`

## Configuration Files

### SPARC Configuration
- **\`.roomodes\`**: SPARC mode definitions and configurations
- **\`.roo/\`**: Templates, workflows, and mode-specific rules

### Claude-Flow Configuration
- **\`memory/\`**: Persistent memory and session data
- **\`coordination/\`**: Multi-agent coordination settings

## Git Workflow Integration

### Commit Strategy with SPARC
- **Specification commits**: After completing requirements analysis
- **Architecture commits**: After design phase completion
- **TDD commits**: After each Red-Green-Refactor cycle
- **Integration commits**: After successful component integration
- **Documentation commits**: After completing documentation updates

### Branch Strategy
- **\`feature/sparc-<feature-name>\`**: Feature development with SPARC methodology
- **\`hotfix/sparc-<issue>\`**: Bug fixes using SPARC debugging workflow
- **\`refactor/sparc-<component>\`**: Refactoring using optimization mode

## Troubleshooting

### Common SPARC Issues
- **Mode not found**: Check \`.roomodes\` file exists and is valid JSON
- **Memory persistence**: Ensure \`memory/\` directory has write permissions
- **Tool access**: Verify required tools are available for the selected mode
- **Namespace conflicts**: Use unique memory namespaces for different features

### Debug Commands
\`\`\`bash
# Check SPARC configuration
npx claude-flow sparc modes

# Verify memory system
npx claude-flow memory stats

# Check system status
npx claude-flow status

# View detailed mode information
npx claude-flow sparc info <mode-name>
\`\`\`

## Project Architecture

This SPARC-enabled project follows a systematic development approach:
- **Clear separation of concerns** through modular design
- **Test-driven development** ensuring reliability and maintainability
- **Iterative refinement** for continuous improvement
- **Comprehensive documentation** for team collaboration
- **AI-assisted development** through specialized SPARC modes

## Important Notes

- Always run tests before committing (\`npm run test\`)
- Use SPARC memory system to maintain context across sessions
- Follow the Red-Green-Refactor cycle during TDD phases
- Document architectural decisions in memory for future reference
- Regular security reviews for any authentication or data handling code

For more information about SPARC methodology, see: https://github.com/ruvnet/claude-code-flow/docs/sparc.md
`;
}

function createMinimalMemoryBankMd() {
  return `# Memory Bank

## Quick Reference
- Project uses SQLite for memory persistence
- Memory is organized by namespaces
- Query with \`npx claude-flow memory query <search>\`

## Storage Location
- Database: \`./memory/claude-flow-data.json\`
- Sessions: \`./memory/sessions/\`
`;
}

function createFullMemoryBankMd() {
  return `# Memory Bank Configuration

## Overview
The Claude-Flow memory system provides persistent storage and intelligent retrieval of information across agent sessions. It uses a hybrid approach combining SQL databases with semantic search capabilities.

## Storage Backends
- **Primary**: JSON database (\`./memory/claude-flow-data.json\`)
- **Sessions**: File-based storage in \`./memory/sessions/\`
- **Cache**: In-memory cache for frequently accessed data

## Memory Organization
- **Namespaces**: Logical groupings of related information
- **Sessions**: Time-bound conversation contexts
- **Indexing**: Automatic content indexing for fast retrieval
- **Replication**: Optional distributed storage support

## Commands
- \`npx claude-flow memory query <search>\`: Search stored information
- \`npx claude-flow memory stats\`: Show memory usage statistics
- \`npx claude-flow memory export <file>\`: Export memory to file
- \`npx claude-flow memory import <file>\`: Import memory from file

## Configuration
Memory settings are configured in \`claude-flow.config.json\`:
\`\`\`json
{
  "memory": {
    "backend": "json",
    "path": "./memory/claude-flow-data.json",
    "cacheSize": 1000,
    "indexing": true,
    "namespaces": ["default", "agents", "tasks", "sessions"],
    "retentionPolicy": {
      "sessions": "30d",
      "tasks": "90d",
      "agents": "permanent"
    }
  }
}
\`\`\`

## Best Practices
- Use descriptive namespaces for different data types
- Regular memory exports for backup purposes
- Monitor memory usage with stats command
- Clean up old sessions periodically

## Memory Types
- **Episodic**: Conversation and interaction history
- **Semantic**: Factual knowledge and relationships
- **Procedural**: Task patterns and workflows
- **Meta**: System configuration and preferences

## Integration Notes
- Memory is automatically synchronized across agents
- Search supports both exact match and semantic similarity
- Memory contents are private to your local instance
- No data is sent to external services without explicit commands
`;
}

function createMinimalCoordinationMd() {
  return `# Agent Coordination

## Quick Commands
- \`npx claude-flow agent spawn <type>\`: Create new agent
- \`npx claude-flow agent list\`: Show active agents
- \`npx claude-flow task create <type> <description>\`: Create task

## Agent Types
- researcher, coder, analyst, coordinator, general
`;
}

function createFullCoordinationMd() {
  return `# Agent Coordination System

## Overview
The Claude-Flow coordination system manages multiple AI agents working together on complex tasks. It provides intelligent task distribution, resource management, and inter-agent communication.

## Agent Types and Capabilities
- **Researcher**: Web search, information gathering, knowledge synthesis
- **Coder**: Code analysis, development, debugging, testing
- **Analyst**: Data processing, pattern recognition, insights generation
- **Coordinator**: Task planning, resource allocation, workflow management
- **General**: Multi-purpose agent with balanced capabilities

## Task Management
- **Priority Levels**: 1 (lowest) to 10 (highest)
- **Dependencies**: Tasks can depend on completion of other tasks
- **Parallel Execution**: Independent tasks run concurrently
- **Load Balancing**: Automatic distribution based on agent capacity

## Coordination Commands
\`\`\`bash
# Agent Management
npx claude-flow agent spawn <type> --name <name> --priority <1-10>
npx claude-flow agent list
npx claude-flow agent info <agent-id>
npx claude-flow agent terminate <agent-id>

# Task Management  
npx claude-flow task create <type> <description> --priority <1-10> --deps <task-ids>
npx claude-flow task list --verbose
npx claude-flow task status <task-id>
npx claude-flow task cancel <task-id>

# System Monitoring
npx claude-flow status --verbose
npx claude-flow monitor --interval 5000
\`\`\`

## Workflow Execution
Workflows are defined in JSON format and can orchestrate complex multi-agent operations:
\`\`\`bash
npx claude-flow workflow examples/research-workflow.json
npx claude-flow workflow examples/development-config.json --async
\`\`\`

## Advanced Features
- **Circuit Breakers**: Automatic failure handling and recovery
- **Work Stealing**: Dynamic load redistribution for efficiency
- **Resource Limits**: Memory and CPU usage constraints
- **Metrics Collection**: Performance monitoring and optimization

## Configuration
Coordination settings in \`claude-flow.config.json\`:
\`\`\`json
{
  "orchestrator": {
    "maxConcurrentTasks": 10,
    "taskTimeout": 300000,
    "defaultPriority": 5
  },
  "agents": {
    "maxAgents": 20,
    "defaultCapabilities": ["research", "code", "terminal"],
    "resourceLimits": {
      "memory": "1GB",
      "cpu": "50%"
    }
  }
}
\`\`\`

## Communication Patterns
- **Direct Messaging**: Agent-to-agent communication
- **Event Broadcasting**: System-wide notifications
- **Shared Memory**: Common information access
- **Task Handoff**: Seamless work transfer between agents

## Best Practices
- Start with general agents and specialize as needed
- Use descriptive task names and clear requirements
- Monitor system resources during heavy workloads
- Implement proper error handling in workflows
- Regular cleanup of completed tasks and inactive agents

## Troubleshooting
- Check agent health with \`npx claude-flow status\`
- View detailed logs with \`npx claude-flow monitor\`
- Restart stuck agents with terminate/spawn cycle
- Use \`--verbose\` flags for detailed diagnostic information
`;
}

function createAgentsReadme() {
  return `# Agent Memory Storage

## Purpose
This directory stores agent-specific memory data, configurations, and persistent state information for individual Claude agents in the orchestration system.

## Structure
Each agent gets its own subdirectory for isolated memory storage:

\`\`\`
memory/agents/
├── agent_001/
│   ├── state.json           # Agent state and configuration
│   ├── knowledge.md         # Agent-specific knowledge base
│   ├── tasks.json          # Completed and active tasks
│   └── calibration.json    # Agent-specific calibrations
├── agent_002/
│   └── ...
└── shared/
    ├── common_knowledge.md  # Shared knowledge across agents
    └── global_config.json  # Global agent configurations
\`\`\`

## Usage Guidelines
1. **Agent Isolation**: Each agent should only read/write to its own directory
2. **Shared Resources**: Use the \`shared/\` directory for cross-agent information
3. **State Persistence**: Update state.json whenever agent status changes
4. **Knowledge Sharing**: Document discoveries in knowledge.md files
5. **Cleanup**: Remove directories for terminated agents periodically

## Last Updated
${new Date().toISOString()}
`;
}

function createSessionsReadme() {
  return `# Session Memory Storage

## Purpose
This directory stores session-based memory data, conversation history, and contextual information for development sessions using the Claude-Flow orchestration system.

## Structure
Sessions are organized by date and session ID for easy retrieval:

\`\`\`
memory/sessions/
├── 2024-01-10/
│   ├── session_001/
│   │   ├── metadata.json        # Session metadata and configuration
│   │   ├── conversation.md      # Full conversation history
│   │   ├── decisions.md         # Key decisions and rationale
│   │   ├── artifacts/           # Generated files and outputs
│   │   └── coordination_state/  # Coordination system snapshots
│   └── ...
└── shared/
    ├── patterns.md              # Common session patterns
    └── templates/               # Session template files
\`\`\`

## Usage Guidelines
1. **Session Isolation**: Each session gets its own directory
2. **Metadata Completeness**: Always fill out session metadata
3. **Conversation Logging**: Document all significant interactions
4. **Artifact Organization**: Structure generated files clearly
5. **State Preservation**: Snapshot coordination state regularly

## Last Updated
${new Date().toISOString()}
`;
}

function createBasicRoomodesConfig() {
  return JSON.stringify({
    "customModes": [
      {
        "slug": "architect",
        "name": "🏗️ Architect", 
        "roleDefinition": "You design scalable, secure, and modular architectures based on functional specs and user needs. You define responsibilities across services, APIs, and components.",
        "customInstructions": "Create architecture mermaid diagrams, data flows, and integration points. Ensure no part of the design includes secrets or hardcoded env values. Emphasize modular boundaries and maintain extensibility.",
        "groups": ["read", "edit"],
        "source": "project"
      },
      {
        "slug": "code",
        "name": "🧠 Auto-Coder",
        "roleDefinition": "You write clean, efficient, modular code based on pseudocode and architecture. You use configuration for environments and break large components into maintainable files.",
        "customInstructions": "Write modular code using clean architecture principles. Never hardcode secrets or environment values. Split code into files < 500 lines. Use config files or environment abstractions. Use `new_task` for subtasks and finish with `attempt_completion`.",
        "groups": ["read", "edit", "browser", "mcp", "command"],
        "source": "project"
      },
      {
        "slug": "tdd",
        "name": "🧪 Tester (TDD)",
        "roleDefinition": "You implement Test-Driven Development (TDD, London School), writing tests first and refactoring after minimal implementation passes.",
        "customInstructions": "Write failing tests first. Implement only enough code to pass. Refactor after green. Ensure tests do not hardcode secrets. Keep files < 500 lines.",
        "groups": ["read", "edit", "browser", "mcp", "command"],
        "source": "project"
      },
      {
        "slug": "spec-pseudocode",
        "name": "📋 Specification Writer",
        "roleDefinition": "You capture full project context—functional requirements, edge cases, constraints—and translate that into modular pseudocode with TDD anchors.",
        "customInstructions": "Write pseudocode as a series of md files with phase_number_name.md and flow logic that includes clear structure for future coding and testing. Split complex logic across modules.",
        "groups": ["read", "edit"],
        "source": "project"
      },
      {
        "slug": "integration",
        "name": "🔗 System Integrator",
        "roleDefinition": "You merge the outputs of all modes into a working, tested, production-ready system. You ensure consistency, cohesion, and modularity.",
        "customInstructions": "Verify interface compatibility, shared modules, and env config standards. Split integration logic across domains as needed. Use `new_task` for preflight testing.",
        "groups": ["read", "edit", "browser", "mcp", "command"],
        "source": "project"
      },
      {
        "slug": "debug",
        "name": "🪲 Debugger",
        "roleDefinition": "You troubleshoot runtime bugs, logic errors, or integration failures by tracing, inspecting, and analyzing behavior.",
        "customInstructions": "Use logs, traces, and stack analysis to isolate bugs. Avoid changing env configuration directly. Keep fixes modular.",
        "groups": ["read", "edit", "browser", "mcp", "command"],
        "source": "project"
      }
    ]
  }, null, 2);
}

function createBasicSparcWorkflow() {
  return JSON.stringify({
    "name": "Basic TDD Workflow",
    "description": "A simple SPARC-based TDD workflow for development",
    "sequential": true,
    "steps": [
      {
        "mode": "spec-pseudocode",
        "description": "Create detailed specifications and pseudocode",
        "phase": "specification"
      },
      {
        "mode": "tdd", 
        "description": "Write failing tests (Red phase)",
        "phase": "red"
      },
      {
        "mode": "code",
        "description": "Implement minimal code to pass tests (Green phase)", 
        "phase": "green"
      },
      {
        "mode": "tdd",
        "description": "Refactor and optimize (Refactor phase)",
        "phase": "refactor"
      },
      {
        "mode": "integration",
        "description": "Integrate and verify complete solution",
        "phase": "integration"
      }
    ]
  }, null, 2);
}

function createRooReadme() {
  return `# .roo Directory - SPARC Development Environment

This directory contains the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) development environment configuration and templates.

## Directory Structure

\`\`\`
.roo/
├── README.md           # This file
├── templates/          # Template files for common patterns
├── workflows/          # Predefined SPARC workflows
│   └── basic-tdd.json  # Basic TDD workflow
├── modes/              # Custom mode definitions (optional)
└── configs/            # Configuration files
\`\`\`

## SPARC Methodology

SPARC is a systematic approach to software development:

1. **Specification**: Define clear requirements and constraints
2. **Pseudocode**: Create detailed logic flows and algorithms  
3. **Architecture**: Design system structure and components
4. **Refinement**: Implement, test, and optimize using TDD
5. **Completion**: Integrate, document, and validate

## Usage with Claude-Flow

Use the claude-flow SPARC commands to leverage this environment:

\`\`\`bash
# List available modes
claude-flow sparc modes

# Run specific mode
claude-flow sparc run code "implement user authentication"

# Execute full TDD workflow  
claude-flow sparc tdd "payment processing system"

# Use custom workflow
claude-flow sparc workflow .roo/workflows/basic-tdd.json
\`\`\`

## Configuration

The main configuration is in \`.roomodes\` at the project root. This directory provides additional templates and workflows to support the SPARC development process.

## Customization

You can customize this environment by:
- Adding new workflow templates to \`workflows/\`
- Creating mode-specific templates in \`templates/\`
- Adding project-specific configurations in \`configs/\`

For more information, see: https://github.com/ruvnet/claude-code-flow/docs/sparc.md
`;
}

function showInitHelp() {
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
  console.log('  • .roomodes file with 17 specialized SPARC development modes');
  console.log('  • CLAUDE.md with SPARC-enhanced project instructions');
  console.log('  • memory/ directory for persistent context storage');
  console.log('  • .roo/ directory with templates and workflows');
  console.log('  • Pre-configured for TDD, architecture, and code generation');
  console.log();
  console.log('Available SPARC modes include:');
  console.log('  - architect: System design and architecture');
  console.log('  - code: Clean, modular implementation');
  console.log('  - tdd: Test-driven development');
  console.log('  - debug: Advanced debugging and optimization');
  console.log('  - security-review: Security analysis and hardening');
  console.log('  - And 12 more specialized modes...');
  console.log();
  console.log('Learn more: https://github.com/ruvnet/claude-code-flow');
}