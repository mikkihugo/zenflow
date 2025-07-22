/**
 * Swarm command wrapper for simple CLI - SPARC functionality removed
 */

import { spawn, execSync } from 'child_process';
import { existsSync, chmodSync, statSync } from 'fs';
import { open } from 'fs/promises';
import process from 'process';
import path from 'path';

function showSwarmHelp() {
  console.log(`
🐝 Claude Flow Advanced Swarm System

USAGE:
  claude-zen swarm <objective> [options]

EXAMPLES:
  claude-zen swarm "Build a REST API with authentication"
  claude-zen swarm "Research cloud architecture patterns" --strategy research
  claude-zen swarm "Analyze database performance" --max-agents 3 --parallel
  claude-zen swarm "Develop user registration feature" --mode distributed
  claude-zen swarm "Optimize React app performance" --strategy optimization
  claude-zen swarm "Create microservice" --executor  # Use built-in executor
  claude-zen swarm "Build API endpoints" --output-format json  # Get JSON output
  claude-zen swarm "Research AI trends" --output-format json --output-file results.json

DEFAULT BEHAVIOR:
  Swarm now opens Claude Code by default with comprehensive MCP tool instructions
  including memory coordination, agent management, and task orchestration.
  
  Use --executor flag to run with the built-in executor instead of Claude Code

STRATEGIES:
  auto           Automatically determine best approach (default)
  research       Research and information gathering
  development    Software development and coding
  analysis       Data analysis and insights
  testing        Testing and quality assurance
  optimization   Performance optimization
  maintenance    System maintenance

MODES:
  centralized    Single coordinator (default)
  distributed    Multiple coordinators
  hierarchical   Tree structure coordination
  mesh           Peer-to-peer coordination
  hybrid         Mixed coordination strategies

KEY FEATURES:
  🤖 Intelligent agent management with specialized types
  ⚡ Timeout-free background task execution
  🧠 Distributed memory sharing between agents
  🔄 Work stealing and advanced load balancing
  🛡️  Circuit breaker patterns for fault tolerance
  📊 Real-time monitoring and comprehensive metrics
  🎛️  Multiple coordination strategies and algorithms
  💾 Persistent state with backup and recovery
  🔒 Security features with encryption options
  🖥️  Interactive terminal UI for management

OPTIONS:
  --strategy <type>          Execution strategy (default: auto)
  --mode <type>              Coordination mode (default: centralized)
  --max-agents <n>           Maximum agents (default: 5)
  --timeout <minutes>        Timeout in minutes (default: 60)
  --task-timeout-minutes <n> Task execution timeout in minutes (default: 59)
  --parallel                 Enable parallel execution
  --distributed              Enable distributed coordination
  --monitor                  Enable real-time monitoring
  --ui                       Launch terminal UI interface
  --background               Run in background mode
  --review                   Enable peer review
  --testing                  Enable automated testing
  --encryption               Enable encryption
  --verbose                  Enable detailed logging
  --dry-run                  Show configuration without executing
  --executor                 Use built-in executor instead of Claude Code
  --output-format <format>   Output format: json, text (default: text)
  --output-file <path>       Save output to file instead of stdout
  --no-interactive           Run in non-interactive mode (auto-enabled with --output-format json)
  --auto                     (Deprecated: auto-permissions enabled by default)
  --no-auto-permissions      Disable automatic --dangerously-skip-permissions
  --analysis                 Enable analysis/read-only mode (no code changes)
  --read-only                Enable read-only mode (alias for --analysis)

ADVANCED OPTIONS:
  --quality-threshold <n>    Quality threshold 0-1 (default: 0.8)
  --memory-namespace <name>  Memory namespace (default: swarm)
  --agent-selection <type>   Agent selection strategy
  --task-scheduling <type>   Task scheduling algorithm
  --load-balancing <type>    Load balancing method
  --fault-tolerance <type>   Fault tolerance strategy

For complete documentation and examples:
https://github.com/ruvnet/claude-code-flow/docs/swarm.md
`);
}

export async function swarmCommand(args, flags) {
  const objective = (args || []).join(' ').trim();

  if (!objective) {
    console.error('❌ Usage: swarm <objective>');
    showSwarmHelp();
    return;
  }

  // Handle JSON output format
  const outputFormat = flags && flags['output-format'];
  const outputFile = flags && flags['output-file'];
  const isJsonOutput = outputFormat === 'json';
  const isNonInteractive = isJsonOutput || (flags && flags['no-interactive']);

  // Handle analysis/read-only mode
  const isAnalysisMode = flags && (flags.analysis || flags['read-only']);
  const analysisMode = isAnalysisMode ? 'analysis' : 'standard';

  // For JSON output, we need to ensure executor mode since Claude Code doesn't return structured JSON
  if (isJsonOutput && !(flags && flags.executor)) {
    flags = { ...(flags || {}), executor: true };
  }

  // Check if we should use the old executor (opt-in with --executor flag)
  if (flags && flags.executor) {
    // Continue with the old swarm executor implementation below
  } else {
    // Default behavior: spawn Claude Code with comprehensive swarm MCP instructions
    try {
      const { execSync, spawn } = await import('child_process');

      // Check if claude command exists
      let claudeAvailable = false;
      try {
        execSync('which claude', { stdio: 'ignore' });
        claudeAvailable = true;
      } catch {
        console.log('⚠️  Claude Code CLI not found in PATH');
        console.log('Install it with: npm install -g @anthropic-ai/claude-code');
        console.log('\nWould spawn Claude Code with swarm objective:');
        console.log(`📋 Objective: ${objective}`);
        console.log(
          '\nTo use the built-in executor instead: claude-zen swarm "objective" --executor',
        );
        return;
      }

      // Claude is available, use it to run swarm
      console.log('🐝 Launching Claude Flow Swarm System...');
      console.log(`📋 Objective: ${objective}`);
      console.log(`🎯 Strategy: ${flags.strategy || 'auto'}`);
      console.log(`🏗️  Mode: ${flags.mode || 'centralized'}`);
      console.log(`🤖 Max Agents: ${flags['max-agents'] || 5}`);
      if (isAnalysisMode) {
        console.log(`🔍 Analysis Mode: ENABLED (Read-Only - No Code Changes)`);
      }
      console.log();

      const strategy = flags.strategy || 'auto';
      const mode = flags.mode || 'centralized';
      const maxAgents = flags['max-agents'] || 5;

      // Get strategy-specific guidance
      const strategyGuidance = getStrategyGuidance(strategy, objective);
      const modeGuidance = getModeGuidance(mode);
      const agentRecommendations = getAgentRecommendations(strategy, maxAgents, objective);

      // Swarm coordination - no SPARC methodology integration

      const swarmPrompt = `You are orchestrating a Claude Flow Swarm with advanced MCP tool coordination.

🎯 OBJECTIVE: ${objective}

🐝 SWARM CONFIGURATION:
- Strategy: ${strategy}
- Mode: ${mode}
- Max Agents: ${maxAgents}
- Timeout: ${flags.timeout || 60} minutes
- Parallel Execution: MANDATORY (Always use BatchTool)
- Review Mode: ${flags.review || false}
- Testing Mode: ${flags.testing || false}
- Analysis Mode: ${isAnalysisMode ? 'ENABLED (Read-Only)' : 'DISABLED'}

${
  isAnalysisMode
    ? `🔍 ANALYSIS MODE CONSTRAINTS:

⚠️  READ-ONLY MODE ACTIVE - NO CODE MODIFICATIONS ALLOWED

REQUIRED BEHAVIORS:
1. ✅ READ files for analysis (Read tool)
2. ✅ SEARCH codebases (Glob, Grep tools)
3. ✅ ANALYZE code structure and patterns
4. ✅ GENERATE reports and documentation
5. ✅ CREATE analysis summaries
6. ✅ STORE findings in memory for collaboration
7. ✅ COMMUNICATE between agents about findings

FORBIDDEN OPERATIONS:
1. ❌ NEVER use Write tool to modify files
2. ❌ NEVER use Edit or MultiEdit tools
3. ❌ NEVER use Bash to run commands that modify files
4. ❌ NEVER create new files or directories
5. ❌ NEVER install packages or dependencies
6. ❌ NEVER modify configuration files
7. ❌ NEVER execute code that changes system state

ALL AGENTS MUST OPERATE IN READ-ONLY MODE. Focus on:
- Code analysis and understanding
- Security vulnerability assessment
- Performance bottleneck identification
- Architecture documentation
- Technical debt analysis
- Dependency mapping
- Testing strategy recommendations

Generate comprehensive reports instead of making changes.

`
    : ''
}🚨 CRITICAL: PARALLEL EXECUTION IS MANDATORY! 🚨

📋 CLAUDE-FLOW SWARM BATCHTOOL INSTRUCTIONS

⚡ THE GOLDEN RULE:
If you need to do X operations, they should be in 1 message, not X messages.

🎯 MANDATORY PATTERNS FOR CLAUDE-FLOW SWARMS:

1️⃣ **SWARM INITIALIZATION** - Everything in ONE BatchTool:
\`\`\`javascript
[Single Message with Multiple Tools]:
  // Spawn ALL agents at once
  mcp__claude-zen__agent_spawn {"type": "coordinator", "name": "SwarmLead"}
  mcp__claude-zen__agent_spawn {"type": "researcher", "name": "DataAnalyst"}
  mcp__claude-zen__agent_spawn {"type": "coder", "name": "BackendDev"}
  mcp__claude-zen__agent_spawn {"type": "coder", "name": "FrontendDev"}
  mcp__claude-zen__agent_spawn {"type": "tester", "name": "QAEngineer"}
  
  // Initialize ALL memory keys
  mcp__claude-zen__memory_store {"key": "swarm/objective", "value": "${objective}"}
  mcp__claude-zen__memory_store {"key": "swarm/config", "value": {"strategy": "${strategy}", "mode": "${mode}"}}
  
  // Create task hierarchy
  mcp__claude-zen__task_create {"name": "${objective}", "type": "parent", "id": "main"}
  mcp__claude-zen__task_create {"name": "Research Phase", "parent": "main"}
  mcp__claude-zen__task_create {"name": "Design Phase", "parent": "main"}
  mcp__claude-zen__task_create {"name": "Implementation", "parent": "main"}
  
  // Initialize comprehensive todo list
  TodoWrite {"todos": [
    {"id": "1", "content": "Initialize ${maxAgents} agent swarm", "status": "completed", "priority": "high"},
    {"id": "2", "content": "Analyze: ${objective}", "status": "in_progress", "priority": "high"},
    {"id": "3", "content": "Design architecture", "status": "pending", "priority": "high"},
    {"id": "4", "content": "Implement solution", "status": "pending", "priority": "high"},
    {"id": "5", "content": "Test and validate", "status": "pending", "priority": "medium"}
  ]}
\`\`\`

2️⃣ **TASK COORDINATION** - Batch ALL assignments:
\`\`\`javascript
[Single Message]:
  // Assign all tasks
  mcp__claude-zen__task_assign {"taskId": "research-1", "agentId": "researcher-1"}
  mcp__claude-zen__task_assign {"taskId": "design-1", "agentId": "architect-1"}
  mcp__claude-zen__task_assign {"taskId": "code-1", "agentId": "coder-1"}
  mcp__claude-zen__task_assign {"taskId": "code-2", "agentId": "coder-2"}
  
  // Communicate to all agents
  mcp__claude-zen__agent_communicate {"to": "all", "message": "Begin phase 1"}
  
  // Update multiple task statuses
  mcp__claude-zen__task_update {"taskId": "research-1", "status": "in_progress"}
  mcp__claude-zen__task_update {"taskId": "design-1", "status": "pending"}
\`\`\`

3️⃣ **MEMORY COORDINATION** - Store/retrieve in batches:
\`\`\`javascript
[Single Message]:
  // Store multiple findings
  mcp__claude-zen__memory_store {"key": "research/requirements", "value": {...}}
  mcp__claude-zen__memory_store {"key": "research/constraints", "value": {...}}
  mcp__claude-zen__memory_store {"key": "architecture/decisions", "value": {...}}
  
  // Retrieve related data
  mcp__claude-zen__memory_retrieve {"key": "research/*"}
  mcp__claude-zen__memory_search {"pattern": "architecture"}
\`\`\`

4️⃣ **FILE & CODE OPERATIONS** - Parallel execution:
\`\`\`javascript
[Single Message]:
  // Read multiple files
  Read {"file_path": "/src/index.js"}
  Read {"file_path": "/src/config.js"}
  Read {"file_path": "/package.json"}
  
  // Write multiple files
  Write {"file_path": "/src/api/auth.js", "content": "..."}
  Write {"file_path": "/src/api/users.js", "content": "..."}
  Write {"file_path": "/tests/auth.test.js", "content": "..."}
  
  // Update memory with results
  mcp__claude-zen__memory_store {"key": "code/api/auth", "value": "implemented"}
  mcp__claude-zen__memory_store {"key": "code/api/users", "value": "implemented"}
\`\`\`

5️⃣ **MONITORING & STATUS** - Combined checks:
\`\`\`javascript
[Single Message]:
  mcp__claude-zen__swarm_monitor {}
  mcp__claude-zen__swarm_status {}
  mcp__claude-zen__agent_list {"status": "active"}
  mcp__claude-zen__task_status {"includeCompleted": false}
  TodoRead {}
\`\`\`

❌ NEVER DO THIS (Sequential = SLOW):
\`\`\`
Message 1: mcp__claude-zen__agent_spawn
Message 2: mcp__claude-zen__agent_spawn
Message 3: TodoWrite (one todo)
Message 4: Read file
Message 5: mcp__claude-zen__memory_store
\`\`\`

✅ ALWAYS DO THIS (Batch = FAST):
\`\`\`
Message 1: [All operations in one message]
\`\`\`

💡 BATCHTOOL BEST PRACTICES:
- Group by operation type (all spawns, all reads, all writes)
- Use TodoWrite with 5-10 todos at once
- Combine file operations when analyzing codebases
- Store multiple memory items per message
- Never send more than one message for related operations

${strategyGuidance}

${modeGuidance}

${agentRecommendations}

📋 MANDATORY PARALLEL WORKFLOW:

1. **INITIAL SPAWN (Single BatchTool Message):**
   - Spawn ALL agents at once
   - Create ALL initial todos at once
   - Store initial memory state
   - Create task hierarchy
   
   Example:
   \`\`\`
   [BatchTool]:
     mcp__claude-zen__agent_spawn (coordinator)
     mcp__claude-zen__agent_spawn (architect)
     mcp__claude-zen__agent_spawn (coder-1)
     mcp__claude-zen__agent_spawn (coder-2)
     mcp__claude-zen__agent_spawn (tester)
     mcp__claude-zen__memory_store { key: "init", value: {...} }
     mcp__claude-zen__task_create { name: "Main", subtasks: [...] }
     TodoWrite { todos: [5-10 todos at once] }
   \`\`\`

2. **TASK EXECUTION (Parallel Batches):**
   - Assign multiple tasks in one batch
   - Update multiple statuses together
   - Store multiple results simultaneously
   
3. **MONITORING (Combined Operations):**
   - Check all agent statuses together
   - Retrieve multiple memory items
   - Update all progress markers

🔧 AVAILABLE MCP TOOLS FOR SWARM COORDINATION:

📊 MONITORING & STATUS:
- mcp__claude-zen__swarm_status - Check current swarm status and agent activity
- mcp__claude-zen__swarm_monitor - Real-time monitoring of swarm execution
- mcp__claude-zen__agent_list - List all active agents and their capabilities
- mcp__claude-zen__task_status - Check task progress and dependencies

🧠 MEMORY & KNOWLEDGE:
- mcp__claude-zen__memory_store - Store knowledge in swarm collective memory
- mcp__claude-zen__memory_retrieve - Retrieve shared knowledge from memory
- mcp__claude-zen__memory_search - Search collective memory by pattern
- mcp__claude-zen__memory_sync - Synchronize memory across agents

🤖 AGENT MANAGEMENT:
- mcp__claude-zen__agent_spawn - Spawn specialized agents for tasks
- mcp__claude-zen__agent_assign - Assign tasks to specific agents
- mcp__claude-zen__agent_communicate - Send messages between agents
- mcp__claude-zen__agent_coordinate - Coordinate agent activities

📋 TASK ORCHESTRATION:
- mcp__claude-zen__task_create - Create new tasks with dependencies
- mcp__claude-zen__task_assign - Assign tasks to agents
- mcp__claude-zen__task_update - Update task status and progress
- mcp__claude-zen__task_complete - Mark tasks as complete with results

🎛️ COORDINATION MODES:
1. CENTRALIZED (default): Single coordinator manages all agents
   - Use when: Clear hierarchy needed, simple workflows
   - Tools: agent_assign, task_create, swarm_monitor

2. DISTRIBUTED: Multiple coordinators share responsibility
   - Use when: Large scale tasks, fault tolerance needed
   - Tools: agent_coordinate, memory_sync, task_update

3. HIERARCHICAL: Tree structure with team leads
   - Use when: Complex projects with sub-teams
   - Tools: agent_spawn (with parent), task_create (with subtasks)

4. MESH: Peer-to-peer agent coordination
   - Use when: Maximum flexibility, self-organizing teams
   - Tools: agent_communicate, memory_store/retrieve

⚡ EXECUTION WORKFLOW - ALWAYS USE BATCHTOOL:

1. STANDARD SWARM EXECUTION WITH PARALLEL OPERATIONS:
   
   Initial Setup (Single BatchTool):
   \`\`\`
   [BatchTool]:
     mcp__claude-zen__task_create { name: "Main", subtasks: [...] }
     mcp__claude-zen__agent_spawn { type: "coordinator" }
     mcp__claude-zen__agent_spawn { type: "coder" }
     mcp__claude-zen__agent_spawn { type: "tester" }
     mcp__claude-zen__memory_store { key: "init", value: {...} }
   \`\`\`
   
   Task Assignment (Single BatchTool):
   \`\`\`
   [BatchTool]:
     mcp__claude-zen__task_assign { taskId: "1", agentId: "agent-1" }
     mcp__claude-zen__task_assign { taskId: "2", agentId: "agent-2" }
     mcp__claude-zen__task_assign { taskId: "3", agentId: "agent-3" }
   \`\`\`
   
   Monitoring & Updates (Single BatchTool):
   \`\`\`
   [BatchTool]:
     mcp__claude-zen__swarm_monitor {}
     mcp__claude-zen__agent_communicate { to: "all", message: "Status update" }
     mcp__claude-zen__memory_store { key: "progress", value: {...} }
   \`\`\`

🤝 AGENT TYPES & THEIR MCP TOOL USAGE:

COORDINATOR:
- Primary tools: swarm_monitor, agent_assign, task_create
- Monitors overall progress and assigns work
- Uses memory_store for decisions and memory_retrieve for context

RESEARCHER:
- Primary tools: memory_search, memory_store
- Gathers information and stores findings
- Uses agent_communicate to share discoveries

CODER:
- Primary tools: task_update, memory_retrieve, memory_store
- Implements solutions and updates progress
- Retrieves specs from memory, stores code artifacts

ANALYST:
- Primary tools: memory_search, swarm_monitor
- Analyzes data and patterns
- Stores insights and recommendations

TESTER:
- Primary tools: task_status, agent_communicate
- Validates implementations
- Reports issues via task_update

📝 EXAMPLE MCP TOOL USAGE PATTERNS:

1. Starting a swarm:
   mcp__claude-zen__agent_spawn {"type": "coordinator", "name": "SwarmLead"}
   mcp__claude-zen__memory_store {"key": "objective", "value": "${objective}"}
   mcp__claude-zen__task_create {"name": "Main Objective", "type": "parent"}

2. Spawning worker agents:
   mcp__claude-zen__agent_spawn {"type": "researcher", "capabilities": ["web-search"]}
   mcp__claude-zen__agent_spawn {"type": "coder", "capabilities": ["python", "testing"]}
   mcp__claude-zen__task_assign {"taskId": "task-123", "agentId": "agent-456"}

3. Coordinating work:
   mcp__claude-zen__agent_communicate {"to": "agent-123", "message": "Begin phase 2"}
   mcp__claude-zen__memory_store {"key": "phase1/results", "value": {...}}
   mcp__claude-zen__task_update {"taskId": "task-123", "progress": 75}

4. Monitoring progress:
   mcp__claude-zen__swarm_monitor {}
   mcp__claude-zen__task_status {"includeCompleted": true}
   mcp__claude-zen__agent_list {"status": "active"}

💾 MEMORY PATTERNS:

Use hierarchical keys for organization:
- "specs/requirements" - Store specifications
- "architecture/decisions" - Architecture choices
- "code/modules/[name]" - Code artifacts
- "tests/results/[id]" - Test outcomes
- "docs/api/[endpoint]" - Documentation

🚀 BEGIN SWARM EXECUTION:

Start by spawning a coordinator agent and creating the initial task structure. Use the MCP tools to orchestrate the swarm, coordinate agents, and track progress. Remember to store important decisions and artifacts in collective memory for other agents to access.

The swarm should be self-documenting - use memory_store to save all important information, decisions, and results throughout the execution.`;

      // Pass the prompt directly as an argument to claude
      const claudeArgs = [swarmPrompt];

      // Add auto-permission flag by default for swarm mode (unless explicitly disabled)
      if (flags['dangerously-skip-permissions'] !== false && !flags['no-auto-permissions']) {
        claudeArgs.push('--dangerously-skip-permissions');
        console.log(
          '🔓 Using --dangerously-skip-permissions by default for seamless swarm execution',
        );
      }

      // Spawn claude with the prompt as the first argument
      const claudeProcess = spawn('claude', claudeArgs, {
        stdio: 'inherit',
        shell: false,
      });

      console.log('✓ Claude Code launched with swarm coordination prompt!');
      console.log('\n🚀 The swarm coordination instructions have been injected into Claude Code');
      console.log('   The prompt includes:');
      console.log('   • Strategy-specific guidance for', strategy);
      console.log('   • Coordination patterns for', mode, 'mode');
      console.log('   • Recommended agents and MCP tool usage');
      console.log('   • Complete workflow documentation\n');

      // Handle process events
      claudeProcess.on('error', (err) => {
        console.error('❌ Failed to launch Claude Code:', err.message);
      });

      // Don't wait for completion - let it run
      return;
    } catch (error) {
      console.error('❌ Failed to spawn Claude Code:', error.message);
      console.log('\nFalling back to built-in executor...');
      // Fall through to executor implementation
    }
  }

  // Rest of the swarm implementation with executor...
  return await basicSwarmImplementation(args, flags);
}

async function basicSwarmImplementation(args, flags) {
  const objective = (args || []).join(' ').trim();
  console.log('🐝 Basic swarm implementation (executor mode)');
  console.log(`📋 Objective: ${objective}`);
  console.log('⚠️  Advanced swarm features require Claude Code or full installation');
  return;
}

/**
 * Get strategy-specific guidance for swarm execution
 */
function getStrategyGuidance(strategy, objective) {
  const guidanceMap = {
    auto: `🤖 AUTO STRATEGY - INTELLIGENT TASK ANALYSIS:
The swarm will analyze "${objective}" and automatically determine the best approach.

ANALYSIS APPROACH:
1. Task Decomposition: Break down the objective into subtasks
2. Skill Matching: Identify required capabilities and expertise
3. Agent Selection: Spawn appropriate agent types based on needs
4. Workflow Design: Create optimal execution flow

MCP TOOL PATTERN:
- Start with memory_store to save the objective analysis
- Use task_create to build a hierarchical task structure
- Spawn agents with agent_spawn based on detected requirements
- Monitor with swarm_monitor and adjust strategy as needed`,

    research: `🔬 RESEARCH STRATEGY - INFORMATION GATHERING & ANALYSIS:
Optimized for: "${objective}"

RESEARCH PHASES:
1. Discovery: Broad information gathering
2. Analysis: Deep dive into findings
3. Synthesis: Combine insights
4. Reporting: Document conclusions

RECOMMENDED AGENTS:
- Lead Researcher: Coordinates research efforts
- Data Analysts: Process and analyze findings
- Subject Experts: Domain-specific investigation
- Documentation Specialist: Compile reports

MCP TOOL USAGE:
- memory_store: Save all research findings with structured keys
- memory_search: Find related information across research
- agent_communicate: Share discoveries between researchers
- task_create: Break research into focused sub-investigations`,

    development: `💻 DEVELOPMENT STRATEGY - SOFTWARE CREATION:
Building: "${objective}"

DEVELOPMENT WORKFLOW:
1. Architecture: Design system structure
2. Implementation: Build components
3. Integration: Connect systems
4. Testing: Validate functionality
5. Documentation: Create guides

RECOMMENDED AGENTS:
- System Architect: Overall design
- Backend Developers: API/server implementation
- Frontend Developers: UI/UX implementation
- DevOps Engineer: Infrastructure setup
- QA Engineers: Testing and validation

MCP TOOL USAGE:
- memory_store: Save architecture decisions, code modules
- task_create: Create implementation tasks with dependencies
- agent_assign: Assign specific components to developers
- swarm_monitor: Track build progress and blockers`,

    analysis: `📊 ANALYSIS STRATEGY - DATA EXAMINATION:
Analyzing: "${objective}"

ANALYSIS FRAMEWORK:
1. Data Collection: Gather relevant information
2. Processing: Clean and prepare data
3. Analysis: Apply analytical methods
4. Visualization: Create insights
5. Recommendations: Actionable outcomes

RECOMMENDED AGENTS:
- Lead Analyst: Coordinate analysis efforts
- Data Engineers: Prepare data pipelines
- Statistical Analysts: Apply analytical methods
- Visualization Experts: Create dashboards
- Business Analysts: Translate to recommendations

MCP TOOL USAGE:
- memory_store: Save datasets and analysis results
- memory_retrieve: Access historical analysis
- task_create: Define analysis pipelines
- agent_coordinate: Sync analysis phases`,
  };

  return guidanceMap[strategy] || guidanceMap['auto'];
}

/**
 * Get mode-specific guidance for coordination
 */
function getModeGuidance(mode) {
  const modeMap = {
    centralized: `🎯 CENTRALIZED MODE - SINGLE COORDINATOR:
All decisions flow through one coordinator agent.

COORDINATION PATTERN:
- Spawn a single COORDINATOR as the first agent
- All other agents report to the coordinator
- Coordinator assigns tasks and monitors progress
- Use agent_assign for task delegation
- Use swarm_monitor for oversight

BENEFITS:
- Clear chain of command
- Consistent decision making
- Simple communication flow
- Easy progress tracking

BEST FOR:
- Small to medium projects
- Well-defined objectives
- Clear task dependencies`,

    distributed: `🌐 DISTRIBUTED MODE - MULTIPLE COORDINATORS:
Multiple coordinators share responsibility by domain.

COORDINATION PATTERN:
- Spawn domain-specific coordinators (e.g., frontend-lead, backend-lead)
- Each coordinator manages their domain agents
- Use agent_coordinate for inter-coordinator sync
- Use memory_sync to share state
- Implement consensus protocols for decisions

BENEFITS:
- Fault tolerance
- Parallel decision making
- Domain expertise
- Scalability

BEST FOR:
- Large projects
- Multiple workstreams
- Complex systems
- High availability needs`,
  };

  return modeMap[mode] || modeMap['centralized'];
}

/**
 * Get agent recommendations based on strategy
 */
function getAgentRecommendations(strategy, maxAgents, objective) {
  const recommendations = {
    auto: `
🤖 RECOMMENDED AGENT COMPOSITION (Auto-detected):
⚡ SPAWN ALL AGENTS IN ONE BATCH - Copy this entire block:

\`\`\`
[BatchTool - Single Message]:
  mcp__claude-zen__agent_spawn {"type": "coordinator", "name": "SwarmLead"}
  mcp__claude-zen__agent_spawn {"type": "researcher", "name": "RequirementsAnalyst"}
  mcp__claude-zen__agent_spawn {"type": "architect", "name": "SystemDesigner"}
  mcp__claude-zen__memory_store {"key": "swarm/objective", "value": "${objective}"}
  mcp__claude-zen__task_create {"name": "Analyze Requirements", "assignTo": "RequirementsAnalyst"}
  mcp__claude-zen__task_create {"name": "Design Architecture", "assignTo": "SystemDesigner", "dependsOn": ["Analyze Requirements"]}
  TodoWrite {"todos": [
    {"id": "1", "content": "Initialize swarm coordination", "status": "completed", "priority": "high"},
    {"id": "2", "content": "Analyze objective requirements", "status": "in_progress", "priority": "high"},
    {"id": "3", "content": "Design system architecture", "status": "pending", "priority": "high"},
    {"id": "4", "content": "Spawn additional agents as needed", "status": "pending", "priority": "medium"}
  ]}
\`\`\``,

    development: `
💻 RECOMMENDED DEVELOPMENT AGENTS:
⚡ SPAWN ALL AGENTS IN ONE BATCH - Copy this entire block:

\`\`\`
[BatchTool - Single Message]:
  mcp__claude-zen__agent_spawn {"type": "coordinator", "name": "TechLead"}
  mcp__claude-zen__agent_spawn {"type": "architect", "name": "SystemArchitect"}
  mcp__claude-zen__agent_spawn {"type": "coder", "name": "BackendDev"}
  mcp__claude-zen__agent_spawn {"type": "coder", "name": "FrontendDev"}
  mcp__claude-zen__agent_spawn {"type": "tester", "name": "QAEngineer"}
  mcp__claude-zen__memory_store {"key": "dev/objective", "value": "${objective}"}
  mcp__claude-zen__task_create {"name": "System Architecture", "assignTo": "SystemArchitect"}
  mcp__claude-zen__task_create {"name": "Backend Implementation", "assignTo": "BackendDev", "dependsOn": ["System Architecture"]}
  mcp__claude-zen__task_create {"name": "Frontend Implementation", "assignTo": "FrontendDev", "dependsOn": ["System Architecture"]}
  mcp__claude-zen__task_create {"name": "Testing Suite", "assignTo": "QAEngineer", "dependsOn": ["Backend Implementation", "Frontend Implementation"]}
  TodoWrite {"todos": [
    {"id": "1", "content": "Initialize development swarm", "status": "completed", "priority": "high"},
    {"id": "2", "content": "Design system architecture", "status": "in_progress", "priority": "high"},
    {"id": "3", "content": "Implement backend services", "status": "pending", "priority": "high"},
    {"id": "4", "content": "Implement frontend UI", "status": "pending", "priority": "high"},
    {"id": "5", "content": "Create comprehensive tests", "status": "pending", "priority": "medium"}
  ]}
\`\`\``,
  };

  return recommendations[strategy] || recommendations['auto'];
}

// Note: Functions will be exported when actually implemented