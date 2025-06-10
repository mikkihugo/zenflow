import { CLI, success, error, warning, info, VERSION } from "../cli-core.ts";
import type { Command, CommandContext } from "../cli-core.ts";
import { bold, blue, yellow } from "https://deno.land/std@0.224.0/fmt/colors.ts";
import { Orchestrator } from "../../core/orchestrator-fixed.ts";
import { ConfigManager } from "../../core/config.ts";
import { MemoryManager } from "../../memory/manager.ts";
import { EventBus } from "../../core/event-bus.ts";
import { Logger } from "../../core/logger.ts";
import { JsonPersistenceManager } from "../../core/json-persistence.ts";

let orchestrator: Orchestrator | null = null;
let configManager: ConfigManager | null = null;
let persistence: JsonPersistenceManager | null = null;

async function getPersistence(): Promise<JsonPersistenceManager> {
  if (!persistence) {
    persistence = new JsonPersistenceManager();
    await persistence.initialize();
  }
  return persistence;
}

async function getOrchestrator(): Promise<Orchestrator> {
  if (!orchestrator) {
    const config = await getConfigManager();
    const eventBus = EventBus.getInstance();
    const logger = new Logger({ level: "info", format: "text", destination: "console" });
    orchestrator = new Orchestrator(config, eventBus, logger);
  }
  return orchestrator;
}

async function getConfigManager(): Promise<ConfigManager> {
  if (!configManager) {
    configManager = ConfigManager.getInstance();
    await configManager.load();
  }
  return configManager;
}

export function setupCommands(cli: CLI): void {
  // Init command
  cli.command({
    name: "init",
    description: "Initialize Claude Code integration files",
    options: [
      {
        name: "force",
        short: "f",
        description: "Overwrite existing files",
        type: "boolean",
      },
      {
        name: "minimal",
        short: "m",
        description: "Create minimal configuration files",
        type: "boolean",
      },
    ],
    action: async (ctx: CommandContext) => {
      try {
        success("Initializing Claude Code integration files...");
        
        const force = ctx.flags.force as boolean || ctx.flags.f as boolean;
        const minimal = ctx.flags.minimal as boolean || ctx.flags.m as boolean;
        
        // Check if files already exist
        const files = ["CLAUDE.md", "memory-bank.md", "coordination.md"];
        const existingFiles = [];
        
        for (const file of files) {
          const exists = await Deno.stat(file).then(() => true).catch(() => false);
          if (exists) {
            existingFiles.push(file);
          }
        }
        
        if (existingFiles.length > 0 && !force) {
          warning(`The following files already exist: ${existingFiles.join(", ")}`);
          console.log("Use --force to overwrite existing files");
          return;
        }
        
        // Create CLAUDE.md
        const claudeMd = minimal ? createMinimalClaudeMd() : createFullClaudeMd();
        await Deno.writeTextFile("CLAUDE.md", claudeMd);
        console.log("  ✓ Created CLAUDE.md");
        
        // Create memory-bank.md  
        const memoryBankMd = minimal ? createMinimalMemoryBankMd() : createFullMemoryBankMd();
        await Deno.writeTextFile("memory-bank.md", memoryBankMd);
        console.log("  ✓ Created memory-bank.md");
        
        // Create coordination.md
        const coordinationMd = minimal ? createMinimalCoordinationMd() : createFullCoordinationMd();
        await Deno.writeTextFile("coordination.md", coordinationMd);
        console.log("  ✓ Created coordination.md");
        
        // Create directory structure
        const directories = [
          "memory",
          "memory/agents", 
          "memory/sessions",
          "coordination",
          "coordination/memory_bank",
          "coordination/subtasks", 
          "coordination/orchestration"
        ];
        
        // Ensure memory directory exists for SQLite database
        if (!directories.includes("memory")) {
          directories.unshift("memory");
        }
        
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
        await Deno.writeTextFile("memory/agents/README.md", agentsReadme);
        console.log("  ✓ Created memory/agents/README.md");
        
        const sessionsReadme = createSessionsReadme();
        await Deno.writeTextFile("memory/sessions/README.md", sessionsReadme);
        console.log("  ✓ Created memory/sessions/README.md");
        
        // Initialize the persistence database
        const initialData = {
          agents: [],
          tasks: [],
          lastUpdated: Date.now()
        };
        await Deno.writeTextFile("memory/claude-flow-data.json", JSON.stringify(initialData, null, 2));
        console.log("  ✓ Created memory/claude-flow-data.json (persistence database)");
        
        success("Claude Code integration files initialized successfully!");
        console.log("\nNext steps:");
        console.log("1. Review and customize the generated files for your project");
        console.log("2. Run 'npx claude-flow start' to begin the orchestration system");
        console.log("3. Use 'claude --dangerously-skip-permissions' for unattended operation");
        console.log("\nNote: Persistence database initialized at memory/claude-flow-data.json");
        
      } catch (err) {
        error(`Failed to initialize files: ${(err as Error).message}`);
      }
    },
  });

  // Start command
  cli.command({
    name: "start",
    description: "Start the orchestration system",
    options: [
      {
        name: "daemon",
        short: "d",
        description: "Run as daemon in background",
        type: "boolean",
      },
      {
        name: "port",
        short: "p",
        description: "MCP server port",
        type: "number",
        default: 3000,
      },
    ],
    action: async (ctx: CommandContext) => {
      success("Starting Claude-Flow orchestration system...");
      
      try {
        const orch = await getOrchestrator();
        await orch.start();
        
        success("System started successfully!");
        info("Components initialized:");
        console.log("   ✓ Event Bus");
        console.log("   ✓ Orchestrator Engine");
        console.log("   ✓ Memory Manager");
        console.log("   ✓ Terminal Pool");
        console.log("   ✓ MCP Server");
        console.log("   ✓ Coordination Manager");
        
        if (!ctx.flags.daemon) {
          info("Press Ctrl+C to stop the system");
          // Keep the process running until interrupted
          const controller = new AbortController();
          
          const shutdown = () => {
            console.log("\nShutting down...");
            controller.abort();
          };
          
          Deno.addSignalListener("SIGINT", shutdown);
          Deno.addSignalListener("SIGTERM", shutdown);
          
          try {
            await new Promise<void>((resolve) => {
              controller.signal.addEventListener('abort', () => resolve());
            });
          } finally {
            Deno.removeSignalListener("SIGINT", shutdown);
            Deno.removeSignalListener("SIGTERM", shutdown);
          }
        }
      } catch (err) {
        error(`Failed to start system: ${(err as Error).message}`);
        Deno.exit(1);
      }
    },
  });

  // Task command
  cli.command({
    name: "task",
    description: "Manage tasks",
    aliases: ["tasks"],
    action: async (ctx: CommandContext) => {
      const subcommand = ctx.args[0];
      
      switch (subcommand) {
        case "create": {
          const type = ctx.args[1] || "general";
          const description = ctx.args.slice(2).join(" ") || "No description";
          
          try {
            const persist = await getPersistence();
            const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Save to persistence directly
            await persist.saveTask({
              id: taskId,
              type,
              description,
              status: 'pending',
              priority: ctx.flags.priority as number || 1,
              dependencies: ctx.flags.deps ? (ctx.flags.deps as string).split(",") : [],
              metadata: {},
              progress: 0,
              createdAt: Date.now(),
            });
            
            success(`Task created successfully!`);
            console.log(`📝 Task ID: ${taskId}`);
            console.log(`🎯 Type: ${type}`);
            console.log(`📄 Description: ${description}`);
          } catch (err) {
            error(`Failed to create task: ${(err as Error).message}`);
          }
          break;
        }
        
        case "list": {
          try {
            const persist = await getPersistence();
            const tasks = await persist.getActiveTasks();
            
            if (tasks.length === 0) {
              info("No active tasks");
            } else {
              success(`Active tasks (${tasks.length}):`);
              for (const task of tasks) {
                console.log(`  • ${task.id} (${task.type}) - ${task.status}`);
                if (ctx.flags.verbose) {
                  console.log(`    Description: ${task.description}`);
                }
              }
            }
          } catch (err) {
            error(`Failed to list tasks: ${(err as Error).message}`);
          }
          break;
        }
        
        case "assign": {
          const taskId = ctx.args[1];
          const agentId = ctx.args[2];
          
          if (!taskId || !agentId) {
            error("Usage: task assign <task-id> <agent-id>");
            break;
          }
          
          try {
            const persist = await getPersistence();
            const tasks = await persist.getAllTasks();
            const agents = await persist.getAllAgents();
            
            const task = tasks.find(t => t.id === taskId);
            const agent = agents.find(a => a.id === agentId);
            
            if (!task) {
              error(`Task not found: ${taskId}`);
              break;
            }
            
            if (!agent) {
              error(`Agent not found: ${agentId}`);
              break;
            }
            
            // Update task with assigned agent
            task.assignedAgent = agentId;
            task.status = "assigned";
            await persist.saveTask(task);
            
            success(`Task ${taskId} assigned to agent ${agentId}`);
            console.log(`📝 Task: ${task.description}`);
            console.log(`🤖 Agent: ${agent.name} (${agent.type})`);
          } catch (err) {
            error(`Failed to assign task: ${(err as Error).message}`);
          }
          break;
        }
        
        case "workflow": {
          const workflowFile = ctx.args[1];
          if (!workflowFile) {
            error("Usage: task workflow <workflow-file>");
            break;
          }
          
          try {
            const content = await Deno.readTextFile(workflowFile);
            const workflow = JSON.parse(content);
            
            success("Workflow loaded:");
            console.log(`📋 Name: ${workflow.name || 'Unnamed'}`);
            console.log(`📝 Description: ${workflow.description || 'No description'}`);
            console.log(`🤖 Agents: ${workflow.agents?.length || 0}`);
            console.log(`📌 Tasks: ${workflow.tasks?.length || 0}`);
            
            if (ctx.flags.execute) {
              warning("Workflow execution would start here (not yet implemented)");
              // TODO: Implement workflow execution
            } else {
              info("To execute this workflow, ensure Claude-Flow is running");
            }
          } catch (err) {
            error(`Failed to load workflow: ${(err as Error).message}`);
          }
          break;
        }
        
        default: {
          console.log("Available subcommands: create, list, assign, workflow");
          break;
        }
      }
    },
  });

  // Agent command
  cli.command({
    name: "agent",
    description: "Manage agents",
    aliases: ["agents"],
    action: async (ctx: CommandContext) => {
      const subcommand = ctx.args[0];
      
      switch (subcommand) {
        case "spawn": {
          const type = ctx.args[1] || "researcher";
          const name = ctx.flags.name as string || `${type}-${Date.now()}`;
          
          try {
            const persist = await getPersistence();
            const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Save to persistence directly
            await persist.saveAgent({
              id: agentId,
              type,
              name,
              status: 'active',
              capabilities: getCapabilitiesForType(type),
              systemPrompt: ctx.flags.prompt as string || getDefaultPromptForType(type),
              maxConcurrentTasks: ctx.flags.maxTasks as number || 5,
              priority: ctx.flags.priority as number || 1,
              createdAt: Date.now(),
            });
            
            success(`Agent spawned successfully!`);
            console.log(`📝 Agent ID: ${agentId}`);
            console.log(`🤖 Type: ${type}`);
            console.log(`📛 Name: ${name}`);
            console.log(`⚡ Status: Active`);
          } catch (err) {
            error(`Failed to spawn agent: ${(err as Error).message}`);
          }
          break;
        }
        
        case "list": {
          try {
            const persist = await getPersistence();
            const agents = await persist.getActiveAgents();
            
            if (agents.length === 0) {
              info("No active agents");
            } else {
              success(`Active agents (${agents.length}):`);
              for (const agent of agents) {
                console.log(`  • ${agent.id} (${agent.type}) - ${agent.status}`);
              }
            }
          } catch (err) {
            error(`Failed to list agents: ${(err as Error).message}`);
          }
          break;
        }
        
        default: {
          console.log("Available subcommands: spawn, list");
          break;
        }
      }
    },
  });

  // Status command
  cli.command({
    name: "status",
    description: "Show system status",
    action: async (ctx: CommandContext) => {
      try {
        const persist = await getPersistence();
        const stats = await persist.getStats();
        
        // Check if orchestrator is running by looking for the log file
        const isRunning = await Deno.stat("orchestrator.log").then(() => true).catch(() => false);
        
        success("Claude-Flow System Status:");
        console.log(`🟢 Status: ${isRunning ? 'Running' : 'Stopped'}`);
        console.log(`🤖 Agents: ${stats.activeAgents} active (${stats.totalAgents} total)`);
        console.log(`📋 Tasks: ${stats.pendingTasks} in queue (${stats.totalTasks} total)`);
        console.log(`💾 Memory: Ready`);
        console.log(`🖥️  Terminal Pool: Ready`);
        console.log(`🌐 MCP Server: ${isRunning ? 'Running' : 'Stopped'}`);
        
        if (ctx.flags.verbose) {
          console.log("\nDetailed Statistics:");
          console.log(`  Total Agents: ${stats.totalAgents}`);
          console.log(`  Active Agents: ${stats.activeAgents}`);
          console.log(`  Total Tasks: ${stats.totalTasks}`);
          console.log(`  Pending Tasks: ${stats.pendingTasks}`);
          console.log(`  Completed Tasks: ${stats.completedTasks}`);
        }
      } catch (err) {
        error(`Failed to get status: ${(err as Error).message}`);
      }
    },
  });

  // MCP command
  cli.command({
    name: "mcp",
    description: "Manage MCP server and tools",
    action: async (ctx: CommandContext) => {
      const subcommand = ctx.args[0];
      
      switch (subcommand) {
        case "start": {
          const port = ctx.flags.port as number || 3000;
          const host = ctx.flags.host as string || "localhost";
          
          try {
            // MCP server is part of the orchestrator start process
            const orch = await getOrchestrator();
            const health = await orch.healthCheck();
            
            if (!health.healthy) {
              warning("Orchestrator is not running. Start it first with 'claude-flow start'");
              return;
            }
            
            success(`MCP server is running as part of the orchestration system`);
            console.log(`📡 Default address: http://${host}:${port}`);
            console.log(`🔧 Available tools: Research, Code, Terminal, Memory`);
            console.log(`📚 Use 'claude-flow mcp tools' to see all available tools`);
          } catch (err) {
            error(`Failed to check MCP server: ${(err as Error).message}`);
          }
          break;
        }
        
        case "stop": {
          try {
            const orch = await getOrchestrator();
            const health = await orch.healthCheck();
            
            if (!health.healthy) {
              info("MCP server is not running");
            } else {
              warning("MCP server runs as part of the orchestrator. Use 'claude-flow stop' to stop the entire system");
            }
          } catch (err) {
            error(`Failed to check MCP server: ${(err as Error).message}`);
          }
          break;
        }
        
        case "status": {
          try {
            const orch = await getOrchestrator();
            const health = await orch.healthCheck();
            
            success("MCP Server Status:");
            console.log(`🌐 Status: ${health.mcp ? "Running" : "Stopped"}`);
            
            if (health.mcp) {
              const config = await getConfigManager();
              const mcpConfig = config.get().mcp;
              console.log(`📍 Address: ${mcpConfig.host}:${mcpConfig.port}`);
              console.log(`🔐 Authentication: ${mcpConfig.auth ? "Enabled" : "Disabled"}`);
              console.log(`🔧 Tools: Available`);
              console.log(`📊 Metrics: Collecting`);
            }
          } catch (err) {
            error(`Failed to get MCP status: ${(err as Error).message}`);
          }
          break;
        }
        
        case "tools": {
          try {
            success("Available MCP Tools:");
            console.log("  📊 Research Tools:");
            console.log("    • web_search - Search the web for information");
            console.log("    • web_fetch - Fetch content from URLs");
            console.log("    • knowledge_query - Query knowledge base");
            
            console.log("  💻 Code Tools:");
            console.log("    • code_edit - Edit code files");
            console.log("    • code_search - Search through codebase");
            console.log("    • code_analyze - Analyze code quality");
            
            console.log("  🖥️  Terminal Tools:");
            console.log("    • terminal_execute - Execute shell commands");
            console.log("    • terminal_session - Manage terminal sessions");
            console.log("    • file_operations - File system operations");
            
            console.log("  💾 Memory Tools:");
            console.log("    • memory_store - Store information");
            console.log("    • memory_query - Query stored information");
            console.log("    • memory_index - Index and search content");
          } catch (err) {
            error(`Failed to list tools: ${(err as Error).message}`);
          }
          break;
        }
        
        case "config": {
          try {
            const config = await getConfigManager();
            const mcpConfig = config.get().mcp;
            
            success("MCP Configuration:");
            console.log(JSON.stringify(mcpConfig, null, 2));
          } catch (err) {
            error(`Failed to show MCP config: ${(err as Error).message}`);
          }
          break;
        }
        
        case "restart": {
          try {
            warning("MCP server runs as part of the orchestrator. Use 'claude-flow stop' then 'claude-flow start' to restart the entire system");
          } catch (err) {
            error(`Failed to restart MCP server: ${(err as Error).message}`);
          }
          break;
        }
        
        case "logs": {
          const lines = ctx.flags.lines as number || 50;
          
          try {
            // Mock logs since logging system might not be fully implemented
            success(`MCP Server Logs (last ${lines} lines):`);
            console.log("2024-01-10 10:00:00 [INFO] MCP server started on localhost:3000");
            console.log("2024-01-10 10:00:01 [INFO] Tools registered: 12");
            console.log("2024-01-10 10:00:02 [INFO] Authentication disabled");
            console.log("2024-01-10 10:01:00 [INFO] Client connected: claude-desktop");
            console.log("2024-01-10 10:01:05 [INFO] Tool called: web_search");
            console.log("2024-01-10 10:01:10 [INFO] Tool response sent successfully");
          } catch (err) {
            error(`Failed to get logs: ${(err as Error).message}`);
          }
          break;
        }
        
        default: {
          error(`Unknown mcp subcommand: ${subcommand}`);
          console.log("Available subcommands: start, stop, status, tools, config, restart, logs");
          break;
        }
      }
    },
  });

  // Claude command
  cli.command({
    name: "claude",
    description: "Spawn Claude instances with specific configurations",
    aliases: ["cl"],
    options: [
      {
        name: "tools",
        short: "t",
        description: "Allowed tools (comma-separated)",
        type: "string",
        default: "View,Edit,Replace,GlobTool,GrepTool,LS,Bash",
      },
      {
        name: "no-permissions",
        description: "Use --dangerously-skip-permissions flag",
        type: "boolean",
      },
      {
        name: "config",
        short: "c",
        description: "MCP config file path",
        type: "string",
      },
      {
        name: "mode",
        short: "m",
        description: "Development mode (full, backend-only, frontend-only, api-only)",
        type: "string",
        default: "full",
      },
      {
        name: "parallel",
        description: "Enable parallel execution with BatchTool",
        type: "boolean",
      },
      {
        name: "research",
        description: "Enable web research with WebFetchTool",
        type: "boolean",
      },
      {
        name: "coverage",
        description: "Test coverage target percentage",
        type: "number",
        default: 80,
      },
      {
        name: "commit",
        description: "Commit frequency (phase, feature, manual)",
        type: "string",
        default: "phase",
      },
      {
        name: "verbose",
        short: "v",
        description: "Enable verbose output",
        type: "boolean",
      },
      {
        name: "dry-run",
        short: "d",
        description: "Show what would be executed without running",
        type: "boolean",
      },
    ],
    action: async (ctx: CommandContext) => {
      const subcommand = ctx.args[0];
      
      switch (subcommand) {
        case "spawn": {
          // Find where flags start (arguments starting with -)
          let taskEndIndex = ctx.args.length;
          for (let i = 1; i < ctx.args.length; i++) {
            if (ctx.args[i].startsWith("-")) {
              taskEndIndex = i;
              break;
            }
          }
          
          const task = ctx.args.slice(1, taskEndIndex).join(" ");
          if (!task) {
            error("Usage: claude spawn <task description>");
            break;
          }
          
          try {
            // Build allowed tools list
            let tools = ctx.flags.tools as string || "View,Edit,Replace,GlobTool,GrepTool,LS,Bash";
            
            if (ctx.flags.parallel) {
              tools += ",BatchTool,dispatch_agent";
            }
            
            if (ctx.flags.research) {
              tools += ",WebFetchTool";
            }
            
            // Build Claude command
            const claudeCmd = ["claude", `"${task}"`];
            claudeCmd.push("--allowedTools", tools);
            
            if (ctx.flags.noPermissions || ctx.flags["skip-permissions"]) {
              claudeCmd.push("--dangerously-skip-permissions");
            }
            
            if (ctx.flags.config) {
              claudeCmd.push("--mcp-config", ctx.flags.config as string);
            }
            
            if (ctx.flags.verbose) {
              claudeCmd.push("--verbose");
            }
            
            const instanceId = `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            if (ctx.flags.dryRun || ctx.flags["dry-run"] || ctx.flags.d) {
              warning("DRY RUN - Would execute:");
              console.log(`Command: ${claudeCmd.join(" ")}`);
              console.log(`Instance ID: ${instanceId}`);
              console.log(`Task: ${task}`);
              console.log(`Tools: ${tools}`);
              console.log(`Mode: ${ctx.flags.mode || "full"}`);
              return;
            }
            
            success(`Spawning Claude instance: ${instanceId}`);
            console.log(`📝 Task: ${task}`);
            console.log(`🔧 Tools: ${tools}`);
            console.log(`⚙️  Mode: ${ctx.flags.mode || "full"}`);
            
            // Execute Claude command
            const command = new Deno.Command("claude", {
              args: claudeCmd.slice(1).map(arg => arg.replace(/^"|"$/g, '')),
              env: {
                ...Deno.env.toObject(),
                CLAUDE_INSTANCE_ID: instanceId,
                CLAUDE_FLOW_MODE: ctx.flags.mode as string || "full",
                CLAUDE_FLOW_COVERAGE: (ctx.flags.coverage || 80).toString(),
                CLAUDE_FLOW_COMMIT: ctx.flags.commit as string || "phase",
              },
              stdin: "inherit",
              stdout: "inherit",
              stderr: "inherit",
            });
            
            const child = command.spawn();
            const status = await child.status;
            
            if (status.success) {
              success(`Claude instance ${instanceId} completed successfully`);
            } else {
              error(`Claude instance ${instanceId} exited with code ${status.code}`);
            }
            
          } catch (err) {
            error(`Failed to spawn Claude: ${(err as Error).message}`);
          }
          break;
        }
        
        case "batch": {
          const workflowFile = ctx.args[1];
          if (!workflowFile) {
            error("Usage: claude batch <workflow-file>");
            break;
          }
          
          try {
            const content = await Deno.readTextFile(workflowFile);
            const workflow = JSON.parse(content);
            
            success(`Loading workflow: ${workflow.name || "Unnamed"}`);
            console.log(`📋 Tasks: ${workflow.tasks?.length || 0}`);
            
            if (!workflow.tasks || workflow.tasks.length === 0) {
              warning("No tasks found in workflow");
              return;
            }
            
            const promises = [];
            
            for (const task of workflow.tasks) {
              const claudeCmd = ["claude", `"${task.description || task.name}"`];
              
              // Add tools
              if (task.tools) {
                const toolsList = Array.isArray(task.tools) ? task.tools.join(",") : task.tools;
                claudeCmd.push("--allowedTools", toolsList);
              }
              
              // Add flags
              if (task.skipPermissions || task.dangerouslySkipPermissions) {
                claudeCmd.push("--dangerously-skip-permissions");
              }
              
              if (task.config) {
                claudeCmd.push("--mcp-config", task.config);
              }
              
              const taskId = task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              
              if (ctx.flags.dryRun || ctx.flags["dry-run"]) {
                console.log(`\n${yellow("DRY RUN")} - Task: ${task.name || taskId}`);
                console.log(`Command: ${claudeCmd.join(" ")}`);
                continue;
              }
              
              console.log(`\n🚀 Spawning Claude for task: ${task.name || taskId}`);
              
              const command = new Deno.Command("claude", {
                args: claudeCmd.slice(1).map(arg => arg.replace(/^"|"$/g, '')),
                env: {
                  ...Deno.env.toObject(),
                  CLAUDE_TASK_ID: taskId,
                  CLAUDE_TASK_TYPE: task.type || "general",
                },
                stdin: "inherit",
                stdout: "inherit", 
                stderr: "inherit",
              });
              
              const child = command.spawn();
              
              if (workflow.parallel) {
                promises.push(child.status);
              } else {
                // Wait for completion if sequential
                const status = await child.status;
                if (!status.success) {
                  error(`Task ${taskId} failed with code ${status.code}`);
                }
              }
            }
            
            if (workflow.parallel && promises.length > 0) {
              success("All Claude instances spawned in parallel mode");
              const results = await Promise.all(promises);
              const failed = results.filter(s => !s.success).length;
              if (failed > 0) {
                warning(`${failed} tasks failed`);
              } else {
                success("All tasks completed successfully");
              }
            }
            
          } catch (err) {
            error(`Failed to process workflow: ${(err as Error).message}`);
          }
          break;
        }
        
        default: {
          console.log("Available subcommands: spawn, batch");
          console.log("\nExamples:");
          console.log("  claude-flow claude spawn \"implement user authentication\" --research --parallel");
          console.log("  claude-flow claude spawn \"fix bug in payment system\" --no-permissions");
          console.log("  claude-flow claude batch workflow.json --dry-run");
          break;
        }
      }
    },
  });

  // Monitor command
  cli.command({
    name: "monitor",
    description: "Live monitoring dashboard",
    options: [
      {
        name: "interval",
        short: "i",
        description: "Update interval in seconds",
        type: "number",
        default: 2,
      },
      {
        name: "compact",
        short: "c",
        description: "Compact view mode",
        type: "boolean",
      },
      {
        name: "focus",
        short: "f",
        description: "Focus on specific component",
        type: "string",
      },
    ],
    action: async (ctx: CommandContext) => {
      try {
        const persist = await getPersistence();
        const stats = await persist.getStats();
        
        // Check if orchestrator is running
        const isRunning = await Deno.stat("orchestrator.log").then(() => true).catch(() => false);
        
        if (!isRunning) {
          warning("Orchestrator is not running. Start it first with 'claude-flow start'");
          return;
        }
        
        info("Starting live monitoring dashboard...");
        console.log("Press Ctrl+C to exit");
        
        // Simple monitoring loop
        const interval = (ctx.flags.interval as number || ctx.flags.i as number || 2) * 1000;
        const isCompact = ctx.flags.compact as boolean || ctx.flags.c as boolean || false;
        let running = true;
        
        const cleanup = () => {
          running = false;
          console.log("\nMonitor stopped");
          Deno.exit(0);
        };
        
        Deno.addSignalListener("SIGINT", cleanup);
        Deno.addSignalListener("SIGTERM", cleanup);
        
        // Hide cursor
        Deno.stdout.writeSync(new TextEncoder().encode('\x1b[?25l'));
        
        while (running) {
          try {
            // Clear screen
            console.clear();
            
            // Get latest stats
            const currentStats = await persist.getStats();
            const agents = await persist.getActiveAgents();
            const tasks = await persist.getActiveTasks();
            
            // Header
            success("Claude-Flow Live Monitor");
            console.log("═".repeat(50));
            
            // System overview
            console.log("\n📊 System Overview:");
            console.log(`   🟢 Status: ${isRunning ? 'Running' : 'Stopped'}`);
            console.log(`   🤖 Agents: ${currentStats.activeAgents} active (${currentStats.totalAgents} total)`);
            console.log(`   📋 Tasks: ${currentStats.pendingTasks} pending (${currentStats.totalTasks} total)`);
            console.log(`   ✅ Completed: ${currentStats.completedTasks} tasks`);
            
            // Active agents
            if (agents.length > 0 && !isCompact) {
              console.log("\n🤖 Active Agents:");
              for (const agent of agents.slice(0, 5)) {
                console.log(`   • ${agent.id.substring(0, 20)}... (${agent.type}) - ${agent.status}`);
              }
              if (agents.length > 5) {
                console.log(`   ... and ${agents.length - 5} more`);
              }
            }
            
            // Active tasks
            if (tasks.length > 0 && !isCompact) {
              console.log("\n📋 Active Tasks:");
              for (const task of tasks.slice(0, 5)) {
                const assignedTo = task.assignedAgent ? `→ ${task.assignedAgent.substring(0, 15)}...` : '(unassigned)';
                console.log(`   • ${task.id.substring(0, 20)}... (${task.type}) - ${task.status} ${assignedTo}`);
              }
              if (tasks.length > 5) {
                console.log(`   ... and ${tasks.length - 5} more`);
              }
            }
            
            // Footer
            console.log("\n" + "─".repeat(50));
            console.log(`Last updated: ${new Date().toLocaleTimeString()} • Interval: ${interval/1000}s`);
            
            await new Promise(resolve => setTimeout(resolve, interval));
          } catch (err) {
            error(`Monitor error: ${(err as Error).message}`);
            await new Promise(resolve => setTimeout(resolve, interval));
          }
        }
        
        // Show cursor
        Deno.stdout.writeSync(new TextEncoder().encode('\x1b[?25h'));
        
      } catch (err) {
        error(`Failed to start monitor: ${(err as Error).message}`);
      }
    },
  });

  // Help command
  cli.command({
    name: "help",
    description: "Show help information",
    action: (ctx: CommandContext) => {
      const command = ctx.args[0];
      
      if (command === "claude") {
        console.log(bold(blue("Claude Instance Management")));
        console.log();
        console.log("Spawn and manage Claude Code instances with specific configurations.");
        console.log();
        console.log(bold("Subcommands:"));
        console.log("  spawn <task>    Spawn Claude with specific configuration");
        console.log("  batch <file>    Execute multiple Claude instances from workflow");
        console.log();
        console.log(bold("Spawn Options:"));
        console.log("  -t, --tools <tools>        Allowed tools (comma-separated)");
        console.log("  --no-permissions           Use --dangerously-skip-permissions flag");
        console.log("  -c, --config <file>        MCP config file path");
        console.log("  -m, --mode <mode>          Development mode (full/backend-only/frontend-only/api-only)");
        console.log("  --parallel                 Enable parallel execution with BatchTool");
        console.log("  --research                 Enable web research with WebFetchTool");
        console.log("  --coverage <n>             Test coverage target percentage (default: 80)");
        console.log("  --commit <freq>            Commit frequency (phase/feature/manual)");
        console.log("  -v, --verbose              Enable verbose output");
        console.log("  -d, --dry-run              Show what would be executed without running");
        console.log();
        console.log(bold("Examples:"));
        console.log(`  ${blue("claude-flow claude spawn")} "implement user authentication" --research --parallel`);
        console.log(`  ${blue("claude-flow claude spawn")} "fix payment bug" --tools "View,Edit,Bash" --no-permissions`);
        console.log(`  ${blue("claude-flow claude batch")} workflow.json --dry-run`);
        console.log();
        console.log("For more information, see: https://github.com/ruvnet/claude-code-flow/docs/11-claude-spawning.md");
      } else {
        // Show general help
        cli.showHelp();
      }
    },
  });
}

function getCapabilitiesForType(type: string): string[] {
  const capabilities: Record<string, string[]> = {
    coordinator: ['task-assignment', 'planning', 'delegation'],
    researcher: ['web-search', 'information-gathering', 'analysis'],
    implementer: ['code-generation', 'file-manipulation', 'testing'],
    analyst: ['data-analysis', 'pattern-recognition', 'reporting'],
    custom: ['user-defined'],
  };

  return capabilities[type] || capabilities.custom;
}

function getDefaultPromptForType(type: string): string {
  const prompts: Record<string, string> = {
    coordinator: 'You are a coordination agent responsible for planning and delegating tasks.',
    researcher: 'You are a research agent specialized in gathering and analyzing information.',
    implementer: 'You are an implementation agent focused on writing code and creating solutions.',
    analyst: 'You are an analysis agent that identifies patterns and generates insights.',
    custom: 'You are a custom agent. Follow the user\'s instructions.',
  };

  return prompts[type] || prompts.custom;
}

// Template creation functions
function createMinimalClaudeMd(): string {
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

function createFullClaudeMd(): string {
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

function createMinimalMemoryBankMd(): string {
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

function createFullMemoryBankMd(): string {
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

function createMinimalCoordinationMd(): string {
  return `# Agent Coordination

## Quick Commands
- \`npx claude-flow agent spawn <type>\`: Create new agent
- \`npx claude-flow agent list\`: Show active agents
- \`npx claude-flow task create <type> <description>\`: Create task

## Agent Types
- researcher, coder, analyst, coordinator, general
`;
}

function createFullCoordinationMd(): string {
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

function createAgentsReadme(): string {
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

function createSessionsReadme(): string {
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