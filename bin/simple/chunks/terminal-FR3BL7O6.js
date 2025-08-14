
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  CommandExecutionEngine,
  CommandExecutionRenderer,
  ComponentUtils,
  ErrorMessage,
  Footer,
  Header,
  InteractiveTerminalApplication,
  Menu,
  ProgressBar,
  ScreenUtils,
  Spinner,
  StatusBadge,
  SwarmDashboard,
  TerminalApp,
  defaultScreenConfigs,
  defaultUnifiedTheme,
  detectMode as detectMode2,
  detectModeWithReason,
  getEnvironmentInfo,
  getVersion,
  isCommandExecutionSupported,
  isInteractiveSupported
} from "./chunk-4UKUHLPX.js";
import "./chunk-RK2CTGEZ.js";
import "./chunk-UGOSL5PH.js";
import {
  require_react
} from "./chunk-NCO4BFC4.js";
import "./chunk-MPG6LEYZ.js";
import {
  getLogger
} from "./chunk-NECHN6IW.js";
import {
  __name,
  __toESM
} from "./chunk-O4JO3PGD.js";

// src/interfaces/terminal/process-orchestrator.ts
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
var TerminalManager = class extends EventEmitter {
  constructor(config = {}, logger4, eventBus) {
    super();
    this.logger = logger4;
    this.eventBus = eventBus;
    this.config = {
      shell: config?.shell || (process.platform === "win32" ? "cmd.exe" : "/bin/bash"),
      cwd: config?.cwd || process.cwd(),
      env: {
        ...Object.fromEntries(
          Object.entries(process.env).filter(([_, value]) => value !== void 0)
        ),
        ...config?.env
      },
      timeout: config?.timeout || 3e4,
      maxConcurrentProcesses: config?.maxConcurrentProcesses || 10
    };
    this.setupEventHandlers();
    this.logger?.info("TerminalManager initialized");
  }
  static {
    __name(this, "TerminalManager");
  }
  config;
  sessions = /* @__PURE__ */ new Map();
  activeProcesses = /* @__PURE__ */ new Map();
  /**
   * Execute a command in a new process.
   *
   * @param command
   * @param options
   * @param options.cwd
   * @param options.env
   * @param options.timeout
   * @param options.shell
   */
  async executeCommand(command, options = {}) {
    const startTime = Date.now();
    const processId = `proc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    if (this.activeProcesses.size >= this.config.maxConcurrentProcesses) {
      throw new Error("Maximum concurrent processes limit reached");
    }
    const execOptions = {
      cwd: options?.cwd || this.config.cwd,
      env: { ...this.config.env, ...options?.env },
      shell: options?.shell !== false,
      timeout: options?.timeout || this.config.timeout
    };
    this.logger?.info(`Executing command: ${command}`, { processId, options: execOptions });
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let completed = false;
      const childProcess = spawn(command, [], {
        ...execOptions,
        stdio: ["pipe", "pipe", "pipe"]
      });
      this.activeProcesses.set(processId, childProcess);
      this.emit("processStarted", { processId, command });
      const timeoutHandle = setTimeout(() => {
        if (!completed) {
          completed = true;
          childProcess?.kill("SIGTERM");
          this.cleanupProcess(processId);
          resolve({
            success: false,
            stdout,
            stderr: `${stderr}
Process killed due to timeout`,
            exitCode: -1,
            duration: Date.now() - startTime,
            error: new Error(`Command timeout after ${execOptions?.timeout}ms`)
          });
        }
      }, execOptions?.timeout);
      childProcess?.stdout?.on("data", (data) => {
        stdout += data.toString();
        this.emit("processOutput", { processId, type: "stdout", data: data.toString() });
      });
      childProcess?.stderr?.on("data", (data) => {
        stderr += data.toString();
        this.emit("processOutput", { processId, type: "stderr", data: data.toString() });
      });
      childProcess?.on("close", (code) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          this.cleanupProcess(processId);
          const duration = Date.now() - startTime;
          const result = {
            success: code === 0,
            stdout,
            stderr,
            exitCode: code || 0,
            duration
          };
          this.logger?.info(`Command completed: ${command}`, {
            processId,
            exitCode: code,
            duration
          });
          this.emit("processCompleted", { processId, command, result });
          resolve(result);
        }
      });
      childProcess?.on("error", (error) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          this.cleanupProcess(processId);
          const duration = Date.now() - startTime;
          this.logger?.error(`Command failed: ${command}`, { processId, error });
          this.emit("processError", { processId, command, error });
          resolve({
            success: false,
            stdout,
            stderr: `${stderr}
      Process error: ${error.message}`,
            exitCode: -1,
            duration,
            error
          });
        }
      });
    });
  }
  /**
   * Create a persistent terminal session.
   *
   * @param sessionId
   */
  async createSession(sessionId) {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    if (this.sessions.has(id)) {
      throw new Error(`Session ${id} already exists`);
    }
    const session = {
      id,
      shell: this.config.shell,
      cwd: this.config.cwd,
      env: this.config.env,
      active: true,
      created: /* @__PURE__ */ new Date(),
      lastActivity: /* @__PURE__ */ new Date()
    };
    this.sessions.set(id, session);
    this.logger?.info(`Terminal session created: ${id}`);
    this.emit("sessionCreated", { sessionId: id });
    return id;
  }
  /**
   * Execute command in a session.
   *
   * @param sessionId
   * @param command
   */
  async executeInSession(sessionId, command) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    session.lastActivity = /* @__PURE__ */ new Date();
    return this.executeCommand(command, {
      cwd: session.cwd,
      env: session.env
    });
  }
  /**
   * Close a terminal session.
   *
   * @param sessionId
   */
  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    session.active = false;
    if (session.process && !session.process.killed) {
      session.process.kill("SIGTERM");
    }
    this.sessions.delete(sessionId);
    this.logger?.info(`Terminal session closed: ${sessionId}`);
    this.emit("sessionClosed", { sessionId });
  }
  /**
   * Get active sessions.
   */
  getSessions() {
    return Array.from(this.sessions.values());
  }
  /**
   * Get active processes count.
   */
  getActiveProcessCount() {
    return this.activeProcesses.size;
  }
  /**
   * Kill a specific process.
   *
   * @param processId
   */
  async killProcess(processId) {
    const process2 = this.activeProcesses.get(processId);
    if (!process2) {
      return false;
    }
    process2.kill("SIGTERM");
    this.cleanupProcess(processId);
    this.logger?.info(`Process killed: ${processId}`);
    return true;
  }
  /**
   * Clean up all resources.
   */
  async cleanup() {
    this.logger?.info("Cleaning up TerminalManager...");
    for (const sessionId of Array.from(this.sessions.keys())) {
      await this.closeSession(sessionId);
    }
    for (const [processId, process2] of Array.from(this.activeProcesses.entries())) {
      if (!process2.killed) {
        process2.kill("SIGTERM");
      }
      this.activeProcesses.delete(processId);
    }
    this.logger?.info("TerminalManager cleanup completed");
  }
  setupEventHandlers() {
    if (this.eventBus) {
      this.eventBus.on("system:shutdown", () => {
        this.cleanup().catch(
          (error) => this.logger?.error("Error during TerminalManager cleanup", { error })
        );
      });
    }
  }
  cleanupProcess(processId) {
    this.activeProcesses.delete(processId);
  }
};

// src/interfaces/terminal/state-hooks/use-config.ts
var import_react = __toESM(require_react(), 1);
var logger = getLogger("ConfigHook");
var defaultConfig = {
  theme: "dark",
  refreshInterval: 3e3,
  verbose: false,
  showAnimations: true,
  swarmConfig: {
    defaultTopology: "mesh",
    maxAgents: 10,
    autoRefresh: true,
    showAdvancedMetrics: false
  },
  ui: {
    showBorders: true,
    centerAlign: false,
    compactMode: false
  }
};
var useConfig = /* @__PURE__ */ __name(() => {
  const [config, setConfig] = (0, import_react.useState)(defaultConfig);
  const [isLoading, setIsLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(void 0);
  (0, import_react.useEffect)(() => {
    loadConfig();
  }, [loadConfig]);
  const loadConfig = /* @__PURE__ */ __name(async () => {
    try {
      setIsLoading(true);
      setError(void 0);
      const loadedConfig = await loadConfigFromFile();
      if (loadedConfig) {
        setConfig({ ...defaultConfig, ...loadedConfig });
      } else {
        setConfig(defaultConfig);
      }
      logger.debug("Terminal configuration loaded successfully");
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to load configuration");
      logger.error("Failed to load terminal configuration:", error2);
      setError(error2);
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, "loadConfig");
  const loadConfigFromFile = /* @__PURE__ */ __name(async () => {
    try {
      const configPaths = [
        "./.claude/terminal-config.json",
        "./config/terminal.json",
        `${process.env["HOME"]}/.claude-zen/terminal-config.json`
      ];
      for (const configPath of configPaths) {
        try {
          const fs = await import("node:fs/promises");
          const configData = await fs.readFile(configPath, "utf-8");
          const parsedConfig = JSON.parse(configData);
          if (parsedConfig?.terminal) {
            return parsedConfig?.terminal;
          } else if (parsedConfig?.theme || parsedConfig?.swarmConfig) {
            return parsedConfig;
          }
        } catch (_err) {
        }
      }
      return null;
    } catch (err) {
      logger.warn("Could not load terminal config from file:", err);
      return null;
    }
  }, "loadConfigFromFile");
  const saveConfigToFile = /* @__PURE__ */ __name(async (newConfig) => {
    try {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const configDir = "./.claude";
      try {
        await fs.mkdir(configDir, { recursive: true });
      } catch (_err) {
      }
      const configPath = path.join(configDir, "terminal-config.json");
      const configData = JSON.stringify({ terminal: newConfig }, null, 2);
      await fs.writeFile(configPath, configData, "utf-8");
      logger.debug("Terminal configuration saved to file");
    } catch (err) {
      logger.warn("Could not save terminal config to file:", err);
    }
  }, "saveConfigToFile");
  const updateConfig = /* @__PURE__ */ __name(async (updates) => {
    try {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      await saveConfigToFile(newConfig);
      logger.debug("Terminal configuration updated:", updates);
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to update configuration");
      logger.error("Failed to update terminal configuration:", error2);
      setError(error2);
      throw error2;
    }
  }, "updateConfig");
  const updateUIConfig = /* @__PURE__ */ __name(async (updates) => {
    await updateConfig({
      ui: { ...config?.ui, ...updates }
    });
  }, "updateUIConfig");
  const updateSwarmConfig = /* @__PURE__ */ __name(async (updates) => {
    await updateConfig({
      swarmConfig: { ...config?.swarmConfig, ...updates }
    });
  }, "updateSwarmConfig");
  const resetConfig = /* @__PURE__ */ __name(async () => {
    try {
      setConfig(defaultConfig);
      await saveConfigToFile(defaultConfig);
      logger.debug("Terminal configuration reset to defaults");
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to reset configuration");
      logger.error("Failed to reset terminal configuration:", error2);
      setError(error2);
      throw error2;
    }
  }, "resetConfig");
  return {
    data: config,
    isLoading,
    error,
    updateConfig,
    updateUIConfig,
    updateSwarmConfig,
    resetConfig
  };
}, "useConfig");

// src/interfaces/terminal/state-hooks/use-swarm-status.ts
var import_react2 = __toESM(require_react(), 1);
var logger2 = getLogger("SwarmStatusHook");
var initialSwarmState = {
  status: {
    status: "idle",
    topology: "mesh",
    totalAgents: 0,
    activeAgents: 0,
    uptime: 0
  },
  metrics: {
    totalAgents: 0,
    activeAgents: 0,
    tasksInProgress: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    uptime: 0,
    performance: {
      throughput: 0,
      errorRate: 0,
      avgLatency: 0
    }
  },
  agents: [],
  tasks: [],
  lastUpdated: /* @__PURE__ */ new Date()
};
var useSwarmStatus = /* @__PURE__ */ __name((options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 3e3,
    enableMockData = true
  } = options;
  const [swarmState, setSwarmState] = (0, import_react2.useState)(initialSwarmState);
  const [isLoading, setIsLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(void 0);
  const refreshStatus = /* @__PURE__ */ __name(async () => {
    try {
      setError(void 0);
      if (enableMockData) {
        await loadMockSwarmData();
      } else {
        await loadRealSwarmData();
      }
      logger2.debug("Swarm status refreshed successfully");
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to refresh swarm status");
      logger2.error("Failed to refresh swarm status:", error2);
      setError(error2);
    } finally {
      setIsLoading(false);
    }
  }, "refreshStatus");
  (0, import_react2.useEffect)(() => {
    refreshStatus();
    if (autoRefresh) {
      const interval = setInterval(refreshStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);
  const loadMockSwarmData = /* @__PURE__ */ __name(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const mockAgents = [
      {
        id: "coordinator-main",
        role: "coordinator",
        status: "active",
        capabilities: ["coordination", "planning", "monitoring", "optimization"],
        lastActivity: new Date(Date.now() - 1e3),
        metrics: {
          tasksCompleted: Math.floor(Math.random() * 20) + 10,
          averageResponseTime: 120 + Math.random() * 100,
          errors: Math.floor(Math.random() * 2),
          successRate: 0.95 + Math.random() * 0.05,
          totalTasks: Math.floor(Math.random() * 25) + 10
        },
        cognitivePattern: "systems-thinking",
        performanceScore: 0.9 + Math.random() * 0.1
      }
      // Add more mock agents as needed
    ];
    const mockTasks = [
      {
        id: "task-doc-proc",
        description: "Process document-driven development workflow",
        status: "in_progress",
        progress: 40 + Math.random() * 40,
        assignedAgents: ["coordinator-main"],
        priority: "high",
        startTime: new Date(Date.now() - 6e5),
        estimatedDuration: 12e5
      }
      // Add more mock tasks as needed
    ];
    const activeAgents = mockAgents.filter((a) => a.status === "active" || a.status === "busy");
    const uptime = Date.now() - (swarmState.status.uptime || Date.now() - 36e5);
    const newState = {
      status: {
        status: activeAgents.length > 0 ? "active" : "idle",
        topology: swarmState.status.topology,
        totalAgents: mockAgents.length,
        activeAgents: activeAgents.length,
        uptime
      },
      metrics: {
        totalAgents: mockAgents.length,
        activeAgents: activeAgents.length,
        tasksInProgress: mockTasks.filter((t) => t.status === "in_progress").length,
        tasksCompleted: mockTasks.filter((t) => t.status === "completed").length,
        totalTasks: mockTasks.length,
        uptime,
        performance: {
          throughput: 1.5 + Math.random() * 2,
          errorRate: Math.random() * 0.1,
          avgLatency: 150 + Math.random() * 100
        }
      },
      agents: mockAgents,
      tasks: mockTasks,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    setSwarmState(newState);
  }, "loadMockSwarmData");
  const loadRealSwarmData = /* @__PURE__ */ __name(async () => {
    try {
      const { createPublicSwarmCoordinator } = await import("./public-api-K74RN2LO.js");
      const coordinator = await createPublicSwarmCoordinator();
      if (coordinator) {
        const status = coordinator.getStatus();
        const activeAgents = coordinator.getActiveAgents();
        setSwarmState({
          status: {
            status: status.state === "active" ? "active" : "idle",
            topology: "mesh",
            // Default topology
            totalAgents: status.agentCount,
            activeAgents: activeAgents.length,
            uptime: status.uptime
          },
          metrics: {
            totalAgents: status.agentCount,
            activeAgents: activeAgents.length,
            tasksInProgress: status.taskCount,
            tasksCompleted: Math.floor(Math.random() * 50),
            // Mock data for now
            totalTasks: status.taskCount + Math.floor(Math.random() * 50),
            uptime: status.uptime,
            performance: {
              throughput: Math.random() * 100,
              errorRate: Math.random() * 0.05,
              avgLatency: 120 + Math.random() * 80
            }
          },
          agents: activeAgents.map((agentId, index) => ({
            id: agentId,
            role: "worker",
            status: "active",
            capabilities: ["general"],
            lastActivity: /* @__PURE__ */ new Date(),
            metrics: {
              tasksCompleted: Math.floor(Math.random() * 20),
              averageResponseTime: 120 + Math.random() * 80,
              errors: Math.floor(Math.random() * 3),
              successRate: 0.9 + Math.random() * 0.1,
              totalTasks: Math.floor(Math.random() * 25)
            },
            cognitivePattern: "adaptive",
            performanceScore: 0.8 + Math.random() * 0.2
          })),
          tasks: [],
          // Mock empty tasks for now
          lastUpdated: /* @__PURE__ */ new Date()
        });
        logger2.info("Real swarm data loaded successfully");
        return;
      }
    } catch (err) {
      logger2.warn("Real swarm service not available, using mock data:", err);
      await loadMockSwarmData();
    }
  }, "loadRealSwarmData");
  const startAgent = /* @__PURE__ */ __name(async (agentConfig) => {
    try {
      logger2.debug("Starting agent:", agentConfig);
      try {
        const { createPublicSwarmCoordinator } = await import("./public-api-K74RN2LO.js");
        const coordinator = await createPublicSwarmCoordinator();
        if (coordinator) {
          logger2.info("Simulating agent start through coordinator");
          await loadRealSwarmData();
          return;
        }
      } catch (err) {
        logger2.warn("Real agent starting not available, simulating:", err);
      }
      const newAgent = {
        id: agentConfig?.id || `agent-${Date.now()}`,
        role: agentConfig?.role || "worker",
        status: "active",
        capabilities: agentConfig?.capabilities || ["general"],
        lastActivity: /* @__PURE__ */ new Date(),
        metrics: {
          tasksCompleted: 0,
          averageResponseTime: 0,
          errors: 0,
          successRate: 1,
          totalTasks: 0
        },
        cognitivePattern: agentConfig?.cognitivePattern || "adaptive",
        performanceScore: 1,
        ...agentConfig
      };
      setSwarmState((prev) => ({
        ...prev,
        agents: [...prev.agents, newAgent],
        status: {
          ...prev.status,
          totalAgents: prev.status.totalAgents + 1,
          activeAgents: prev.status.activeAgents + 1
        },
        metrics: {
          ...prev.metrics,
          totalAgents: prev.metrics.totalAgents + 1,
          activeAgents: prev.metrics.activeAgents + 1
        },
        lastUpdated: /* @__PURE__ */ new Date()
      }));
      logger2.debug("Agent started successfully:", newAgent.id);
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to start agent");
      logger2.error("Failed to start agent:", error2);
      throw error2;
    }
  }, "startAgent");
  const stopAgent = /* @__PURE__ */ __name(async (agentId) => {
    try {
      logger2.debug("Stopping agent:", agentId);
      setSwarmState((prev) => ({
        ...prev,
        agents: prev.agents.map(
          (agent) => agent.id === agentId ? { ...agent, status: "idle" } : agent
        ),
        status: {
          ...prev.status,
          activeAgents: Math.max(0, prev.status.activeAgents - 1)
        },
        metrics: {
          ...prev.metrics,
          activeAgents: Math.max(0, prev.metrics.activeAgents - 1)
        },
        lastUpdated: /* @__PURE__ */ new Date()
      }));
      logger2.debug("Agent stopped successfully:", agentId);
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to stop agent");
      logger2.error("Failed to stop agent:", error2);
      throw error2;
    }
  }, "stopAgent");
  const createTask = /* @__PURE__ */ __name(async (taskConfig) => {
    try {
      logger2.debug("Creating task:", taskConfig);
      const newTask = {
        id: taskConfig?.id || `task-${Date.now()}`,
        description: taskConfig?.description || "New task",
        status: taskConfig?.status || "pending",
        progress: taskConfig?.progress || 0,
        assignedAgents: taskConfig?.assignedAgents || [],
        priority: taskConfig?.priority || "medium",
        startTime: taskConfig?.status === "in_progress" ? /* @__PURE__ */ new Date() : void 0,
        ...taskConfig
      };
      setSwarmState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
        metrics: {
          ...prev.metrics,
          totalTasks: prev.metrics.totalTasks + 1,
          tasksInProgress: newTask.status === "in_progress" ? prev.metrics.tasksInProgress + 1 : prev.metrics.tasksInProgress
        },
        lastUpdated: /* @__PURE__ */ new Date()
      }));
      logger2.debug("Task created successfully:", newTask.id);
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to create task");
      logger2.error("Failed to create task:", error2);
      throw error2;
    }
  }, "createTask");
  const updateTask = /* @__PURE__ */ __name(async (taskId, updates) => {
    try {
      logger2.debug("Updating task:", { taskId, updates });
      setSwarmState((prev) => {
        const oldTask = prev.tasks.find((t) => t.id === taskId);
        const newTasks = prev.tasks.map(
          (task) => task.id === taskId ? { ...task, ...updates } : task
        );
        let metricsUpdate = {};
        if (oldTask && updates.status && oldTask.status !== updates.status) {
          const inProgressChange = (updates.status === "in_progress" ? 1 : 0) - (oldTask.status === "in_progress" ? 1 : 0);
          const completedChange = (updates.status === "completed" ? 1 : 0) - (oldTask.status === "completed" ? 1 : 0);
          metricsUpdate = {
            tasksInProgress: prev.metrics.tasksInProgress + inProgressChange,
            tasksCompleted: prev.metrics.tasksCompleted + completedChange
          };
        }
        return {
          ...prev,
          tasks: newTasks,
          metrics: {
            ...prev.metrics,
            ...metricsUpdate
          },
          lastUpdated: /* @__PURE__ */ new Date()
        };
      });
      logger2.debug("Task updated successfully:", taskId);
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to update task");
      logger2.error("Failed to update task:", error2);
      throw error2;
    }
  }, "updateTask");
  return {
    swarmState,
    isLoading,
    error: error || void 0,
    refreshStatus,
    startAgent,
    stopAgent,
    createTask,
    updateTask
  };
}, "useSwarmStatus");

// src/interfaces/terminal/utils/mock-command-handler.ts
var logger3 = getLogger("mock-command-handler");
var MockCommandHandler = class {
  static {
    __name(this, "MockCommandHandler");
  }
  /**
   * Execute init command.
   *
   * @param args
   * @param flags
   */
  static async executeInit(args, flags) {
    try {
      const projectName = args[0] || "claude-zen-project";
      const template = flags.template || "basic";
      logger3.debug(`Initializing project: ${projectName} with template: ${template}`);
      logger3.info(`Mock: Initializing project ${projectName} with template ${template}`);
      const result = {
        projectName,
        template,
        location: "./project-output",
        files: ["package.json", "README.md", "src/index.ts"]
      };
      return {
        success: true,
        message: `Project "${projectName}" initialized successfully`,
        data: result
      };
    } catch (error) {
      logger3.error("Init command failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Init command failed"
      };
    }
  }
  /**
   * Execute status command.
   *
   * @param _args
   * @param flags
   */
  static async executeStatus(_args, flags) {
    try {
      logger3.debug("Getting system status");
      const interfaceStatus = {
        active: false,
        mode: "none"
      };
      const status = {
        version: getVersion(),
        status: "healthy",
        uptime: process.uptime() * 1e3,
        components: {
          mcp: { status: "ready", port: 3e3 },
          swarm: { status: "ready", agents: 0 },
          memory: { status: "ready", usage: process.memoryUsage() },
          terminal: {
            status: "ready",
            mode: interfaceStatus.mode || "none",
            active: interfaceStatus.active
          }
        },
        environment: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid
        }
      };
      if (flags.json) {
        return {
          success: true,
          data: status
        };
      }
      return {
        success: true,
        message: "System status retrieved successfully",
        data: status
      };
    } catch (error) {
      logger3.error("Status command failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Status command failed"
      };
    }
  }
  /**
   * Execute swarm command.
   *
   * @param args
   * @param flags
   */
  static async executeSwarm(args, flags) {
    try {
      const action = args[0];
      if (!action) {
        return {
          success: false,
          error: "Swarm action required. Use: start, stop, list, status"
        };
      }
      logger3.debug(`Executing swarm action: ${action}`);
      switch (action) {
        case "start":
          return {
            success: true,
            message: `Swarm started successfully with ${flags.agents || 4} agents`,
            data: {
              swarmId: `swarm-${Date.now()}`,
              agents: flags.agents || 4,
              topology: flags.topology || "mesh"
            }
          };
        case "stop":
          return {
            success: true,
            message: "Swarm stopped successfully"
          };
        case "list":
          return {
            success: true,
            data: {
              swarms: [
                {
                  id: "swarm-1",
                  name: "Document Processing",
                  status: "active",
                  agents: 4,
                  topology: "mesh",
                  uptime: 36e5
                },
                {
                  id: "swarm-2",
                  name: "Feature Development",
                  status: "inactive",
                  agents: 0,
                  topology: "hierarchical",
                  uptime: 0
                }
              ]
            }
          };
        case "status":
          return {
            success: true,
            data: {
              totalSwarms: 2,
              activeSwarms: 1,
              totalAgents: 4,
              activeAgents: 4,
              averageUptime: 18e5,
              systemLoad: 0.65
            }
          };
        default:
          return {
            success: false,
            error: `Unknown swarm action: ${action}. Use: start, stop, list, status`
          };
      }
    } catch (error) {
      logger3.error("Swarm command failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Swarm command failed"
      };
    }
  }
  /**
   * Execute MCP command.
   *
   * @param args
   * @param flags
   */
  static async executeMCP(args, flags) {
    try {
      const action = args[0];
      if (!action) {
        return {
          success: false,
          error: "MCP action required. Use: start, stop, status"
        };
      }
      logger3.debug(`Executing MCP action: ${action}`);
      switch (action) {
        case "start": {
          const port = flags.port || 3e3;
          return {
            success: true,
            message: `MCP server started on port ${port}`,
            data: {
              port,
              url: `http://localhost:${port}`,
              protocol: flags.stdio ? "stdio" : "http"
            }
          };
        }
        case "stop":
          return {
            success: true,
            message: "MCP server stopped successfully"
          };
        case "status":
          return {
            success: true,
            data: {
              httpServer: {
                status: "running",
                port: 3e3,
                uptime: process.uptime() * 1e3
              },
              swarmServer: {
                status: "running",
                protocol: "stdio",
                connections: 0
              }
            }
          };
        default:
          return {
            success: false,
            error: `Unknown MCP action: ${action}. Use: start, stop, status`
          };
      }
    } catch (error) {
      logger3.error("MCP command failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "MCP command failed"
      };
    }
  }
  /**
   * Execute workspace command.
   *
   * @param args
   * @param _flags
   */
  static async executeWorkspace(args, _flags) {
    try {
      const action = args[0];
      if (!action) {
        return {
          success: false,
          error: "Workspace action required. Use: init, process, status"
        };
      }
      logger3.debug(`Executing workspace action: ${action}`);
      switch (action) {
        case "init": {
          const projectName = args[1] || "claude-zen-workspace";
          return {
            success: true,
            message: `Document-driven workspace "${projectName}" initialized`,
            data: {
              projectName,
              structure: [
                "docs/01-vision/",
                "docs/02-adrs/",
                "docs/03-prds/",
                "docs/04-epics/",
                "docs/05-features/",
                "docs/06-tasks/",
                "src/",
                "tests/"
              ]
            }
          };
        }
        case "process": {
          const docPath = args[1];
          if (!docPath) {
            return {
              success: false,
              error: "Document path required for processing"
            };
          }
          return {
            success: true,
            message: `Document processed: ${docPath}`,
            data: {
              docPath,
              generatedFiles: [
                "docs/02-adrs/auth-architecture.md",
                "docs/03-prds/user-management.md",
                "docs/04-epics/authentication-system.md"
              ]
            }
          };
        }
        case "status":
          return {
            success: true,
            data: {
              documentsProcessed: 5,
              tasksGenerated: 23,
              implementationProgress: 0.65,
              lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
            }
          };
        default:
          return {
            success: false,
            error: `Unknown workspace action: ${action}. Use: init, process, status`
          };
      }
    } catch (error) {
      logger3.error("Workspace command failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Workspace command failed"
      };
    }
  }
  /**
   * Execute any command - delegates to CommandExecutionEngine.
   *
   * @param command
   * @param args
   * @param flags
   */
  static async executeCommand(command, args, flags) {
    logger3.debug(`Delegating command execution to engine: ${command}`);
    try {
      const result = await CommandExecutionEngine.executeCommand(command, args, flags, {
        cwd: process.cwd()
      });
      return {
        success: result?.success,
        message: result?.message,
        data: result?.data,
        error: result?.error
      };
    } catch (error) {
      logger3.error(`Mock command handler failed for ${command}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Command execution failed"
      };
    }
  }
};

// src/interfaces/terminal/index.ts
var TerminalInterface = class {
  static {
    __name(this, "TerminalInterface");
  }
  config;
  constructor(config = {}) {
    this.config = {
      mode: "auto",
      theme: "dark",
      verbose: false,
      autoRefresh: true,
      refreshInterval: 3e3,
      ...config
    };
  }
  /**
   * Initialize the terminal interface.
   */
  async initialize() {
  }
  /**
   * Render the terminal interface.
   */
  async render() {
    const { render } = await import("./build-7JQ5OFUB.js");
    const React = await import("./react-DOYBJFKS.js");
    const { TerminalApp: TerminalApp2 } = await import("./terminal-interface-router-VEX4ACBC.js");
    const _mode = this.config.mode === "auto" ? detectMode(process.argv.slice(2), {}) : this.config.mode;
    const commands = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
    const flags = this.parseFlags(process.argv.slice(2));
    if (this.config.debug) {
      console.log("Debug mode enabled", { mode: _mode, commands, flags });
    }
    const { unmount } = render(
      React.createElement(TerminalApp2, {
        commands,
        flags: { ...flags, ...this.config },
        onExit: /* @__PURE__ */ __name((code) => process.exit(code), "onExit")
      })
    );
    const shutdown = /* @__PURE__ */ __name(() => {
      unmount();
      process.exit(0);
    }, "shutdown");
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }
  /**
   * Parse command line flags.
   *
   * @param args
   */
  parseFlags(args) {
    const flags = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg && arg.startsWith("--")) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith("-")) {
          flags[key] = nextArg;
          i++;
        } else {
          flags[key] = true;
        }
      } else if (arg && arg.startsWith("-")) {
        const key = arg.slice(1);
        flags[key] = true;
      }
    }
    return flags;
  }
  /**
   * Get current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update configuration.
   *
   * @param updates
   */
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
  }
};
var createTerminalInterface = /* @__PURE__ */ __name((config) => {
  return new TerminalInterface(config);
}, "createTerminalInterface");
var launchTerminalInterface = /* @__PURE__ */ __name(async (config) => {
  const terminal = new TerminalInterface(config);
  await terminal.initialize();
  await terminal.render();
}, "launchTerminalInterface");
var TERMINAL_INTERFACE_VERSION = "1.0.0";
var terminal_default = TerminalInterface;
export {
  CommandExecutionEngine,
  CommandExecutionRenderer,
  ComponentUtils,
  ErrorMessage,
  Footer,
  Header,
  InteractiveTerminalApplication,
  Menu as MainMenu,
  MockCommandHandler,
  ProgressBar,
  ScreenUtils,
  Spinner,
  StatusBadge,
  SwarmDashboard,
  TERMINAL_INTERFACE_VERSION,
  TerminalApp,
  TerminalInterface,
  TerminalManager,
  createTerminalInterface,
  terminal_default as default,
  defaultScreenConfigs,
  defaultUnifiedTheme,
  detectMode2 as detectMode,
  detectModeWithReason,
  getEnvironmentInfo,
  isCommandExecutionSupported,
  isInteractiveSupported,
  launchTerminalInterface,
  useConfig,
  useSwarmStatus
};
//# sourceMappingURL=terminal-FR3BL7O6.js.map
