
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  getWebDashboardURL
} from "./chunk-IOXRBPWU.js";
import {
  getLogger
} from "./chunk-NECHN6IW.js";
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/core/interface-launcher.ts
import { EventEmitter } from "node:events";

// src/core/interface-mode-detector.ts
var InterfaceModeDetector = class _InterfaceModeDetector {
  static {
    __name(this, "InterfaceModeDetector");
  }
  /**
   * Detect the appropriate interface mode based on environment.
   *
   * @param options
   */
  static detect(options = {}) {
    const { forceMode, webPort, daemon, preferTui = true } = options;
    const isCI = !!(process.env["CI"] || process.env["GITHUB_ACTIONS"] || process.env["TRAVIS"] || process.env["JENKINS"] || process.env["GITLAB_CI"]);
    const hasTerminal = !!process.stdin?.isTTY;
    const interactive = hasTerminal && !isCI;
    const args = process.argv.slice(2);
    const hasCliFlag = args.includes("--cli");
    const hasWebFlag = args.includes("--web") || args.includes("--daemon");
    const hasTuiFlag = args.includes("--tui") || args.includes("--interactive");
    let mode;
    let reason;
    if (forceMode) {
      mode = forceMode;
      reason = `Forced mode: ${forceMode}`;
    } else if (hasCliFlag || isCI || !hasTerminal) {
      mode = "cli";
      reason = hasCliFlag ? "Explicit --cli flag provided" : isCI ? "CI/CD environment detected" : "Non-interactive terminal detected";
    } else if (hasWebFlag || daemon || webPort) {
      mode = "web";
      reason = hasWebFlag ? "Explicit --web or --daemon flag provided" : webPort ? `Web port ${webPort} specified` : "Daemon mode enabled";
    } else if (hasTuiFlag) {
      mode = "tui";
      reason = "Explicit --tui or --interactive flag provided";
    } else if (interactive) {
      mode = preferTui ? "tui" : "cli";
      reason = preferTui ? "Interactive terminal detected, preferring TUI mode" : "Interactive terminal detected, preferring CLI mode";
    } else {
      mode = "cli";
      reason = "Default fallback to CLI mode";
    }
    const port = webPort || (mode === "web" ? 3456 : void 0);
    const daemonMode = daemon || mode === "web";
    const config = {
      interactive,
      hasTerminal,
      isCI
    };
    if (port !== void 0) {
      config.port = port;
    }
    if (daemonMode !== void 0) {
      config.daemon = daemonMode;
    }
    return {
      mode,
      reason,
      config
    };
  }
  /**
   * Get environment information for debugging.
   */
  static getEnvironmentInfo() {
    return {
      platform: process.platform,
      nodeVersion: process.version,
      tty: {
        stdin: !!process.stdin?.isTTY,
        stdout: !!process.stdout?.isTTY,
        stderr: !!process.stderr?.isTTY
      },
      environment: {
        ci: !!process.env["CI"],
        github: !!process.env["GITHUB_ACTIONS"],
        term: process.env["TERM"],
        termProgram: process.env["TERM_PROGRAM"],
        colorTerm: process.env["COLORTERM"]
      },
      argv: process.argv,
      cwd: process.cwd()
    };
  }
  /**
   * Validate if a mode is supported in the current environment.
   *
   * @param mode
   */
  static validateMode(mode) {
    switch (mode) {
      case "cli":
        return { valid: true };
      case "tui":
        if (!process.stdin || !process.stdin.isTTY) {
          return {
            valid: false,
            reason: "TUI mode requires an interactive terminal"
          };
        }
        return { valid: true };
      case "web":
        return { valid: true };
      default:
        return {
          valid: false,
          reason: `Unknown interface mode: ${mode}`
        };
    }
  }
  /**
   * Get recommended mode based on current environment.
   */
  static getRecommendation() {
    const detection = _InterfaceModeDetector.detect();
    const alternatives = [];
    if (detection.mode !== "cli") {
      alternatives.push("cli");
    }
    if (detection.config.interactive && detection.mode !== "tui") {
      alternatives.push("tui");
    }
    if (detection.mode !== "web") {
      alternatives.push("web");
    }
    let explanation = `Primary mode: ${detection.mode} (${detection.reason}).`;
    if (alternatives.length > 0) {
      explanation += ` Alternatives: ${alternatives.join(", ")}.`;
    }
    return {
      primary: detection.mode,
      alternatives,
      explanation
    };
  }
};

// src/core/interface-launcher.ts
var logger = getLogger("InterfaceLauncher");
var InterfaceLauncher = class _InterfaceLauncher extends EventEmitter {
  static {
    __name(this, "InterfaceLauncher");
  }
  static instance;
  activeInterface;
  constructor() {
    super();
    this.setupShutdownHandlers();
  }
  /**
   * Get singleton instance.
   */
  static getInstance() {
    if (!_InterfaceLauncher.instance) {
      _InterfaceLauncher.instance = new _InterfaceLauncher();
    }
    return _InterfaceLauncher.instance;
  }
  /**
   * Launch the appropriate interface based on options and environment.
   *
   * @param options
   */
  async launch(options = {}) {
    const detection = InterfaceModeDetector.detect(options);
    if (!options?.["silent"]) {
      logger.info(`\u{1F680} Launching ${detection.mode.toUpperCase()} interface`);
      logger.info(`Reason: ${detection.reason}`);
    }
    const validation = InterfaceModeDetector.validateMode(detection.mode);
    if (!validation.valid) {
      const error = `Cannot launch ${detection.mode} interface: ${validation.reason}`;
      logger.error(error);
      return {
        mode: detection.mode,
        success: false,
        error
      };
    }
    try {
      let result;
      switch (detection.mode) {
        case "cli":
          result = await this.launchCLI(options);
          break;
        case "tui":
          result = await this.launchTUI(options);
          break;
        case "web":
          result = await this.launchWeb(options, detection.config.port);
          break;
        default:
          throw new Error(`Unknown interface mode: ${detection.mode}`);
      }
      if (result?.success) {
        this.activeInterface = {
          mode: detection.mode,
          ...result?.url !== void 0 && { url: result?.url },
          ...result?.pid !== void 0 && { pid: result?.pid }
        };
        this.emit("interface:launched", {
          mode: detection.mode,
          url: result?.url,
          pid: result?.pid
        });
        if (!options?.["silent"]) {
          logger.info(`\u2705 ${detection.mode.toUpperCase()} interface launched successfully`);
          if (result?.url) {
            logger.info(`\u{1F310} Available at: ${result?.url}`);
          }
        }
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`\u274C Failed to launch ${detection.mode} interface:`, errorMessage);
      return {
        mode: detection.mode,
        success: false,
        error: errorMessage
      };
    }
  }
  /**
   * Launch CLI interface (Unified Terminal Interface).
   *
   * @param options
   */
  async launchCLI(options) {
    logger.debug("Launching Unified Terminal Interface in CLI mode");
    try {
      const { spawn } = await import("node:child_process");
      const cliArgs = [];
      if (options?.["verbose"]) cliArgs.push("--verbose");
      if (options?.["config"]?.theme) cliArgs.push("--theme", options?.["config"]?.theme);
      const cliProcess = spawn("npx", ["tsx", "src/interfaces/terminal/main.tsx", ...cliArgs], {
        stdio: "inherit",
        cwd: process.cwd()
      });
      return new Promise((resolve, reject) => {
        cliProcess.on("close", (code) => {
          resolve({
            mode: "cli",
            success: code === 0,
            ...cliProcess.pid !== void 0 && { pid: cliProcess.pid }
          });
        });
        cliProcess.on("error", (error) => {
          logger.error("Unified Terminal Interface launch error:", error);
          reject(error);
        });
      });
    } catch (_error) {
      logger.warn("Unified Terminal Interface launch failed, using basic CLI");
      return this.launchBasicCLI(options);
    }
  }
  /**
   * Launch TUI interface using Unified Terminal Interface.
   *
   * @param options
   */
  async launchTUI(options) {
    logger.debug("Launching Unified Terminal Interface in TUI mode");
    try {
      const { spawn } = await import("node:child_process");
      const tuiArgs = ["--ui"];
      if (options?.["verbose"]) tuiArgs.push("--verbose");
      if (options?.["config"]?.theme) tuiArgs.push("--theme", options?.["config"]?.theme);
      const tuiProcess = spawn("npx", ["tsx", "src/interfaces/terminal/main.tsx", ...tuiArgs], {
        stdio: "inherit",
        cwd: process.cwd()
      });
      return new Promise((resolve, reject) => {
        tuiProcess.on("close", (code) => {
          resolve({
            mode: "tui",
            success: code === 0,
            ...tuiProcess.pid !== void 0 && { pid: tuiProcess.pid }
          });
        });
        tuiProcess.on("error", (error) => {
          logger.error("Unified Terminal Interface TUI launch error:", error);
          reject(error);
        });
      });
    } catch (error) {
      logger.error("Failed to launch TUI interface:", error);
      logger.info("Falling back to CLI interface");
      return this.launchCLI(options);
    }
  }
  /**
   * Launch Web interface.
   *
   * @param options
   * @param port
   */
  async launchWeb(options, port) {
    const webPort = port || options?.["webPort"] || 3456;
    logger.debug(`Launching Web interface on port ${webPort}`);
    try {
      const { WebInterface } = await import("./web-interface-DNHGL464.js");
      const webConfig = {
        port: webPort,
        theme: options?.["config"]?.theme || "dark",
        realTime: options?.["config"]?.realTime !== false,
        coreSystem: options?.["config"]?.coreSystem
      };
      const web = new WebInterface(webConfig);
      await web.run();
      const server = web;
      const url = getWebDashboardURL({ port: webPort });
      this.activeInterface = {
        mode: "web",
        server,
        url,
        pid: process.pid
      };
      return {
        mode: "web",
        success: true,
        url,
        pid: process.pid
      };
    } catch (error) {
      logger.error("Failed to launch Web interface:", error);
      throw error;
    }
  }
  /**
   * Basic CLI fallback when TUI/Web interfaces aren't available.
   *
   * @param options
   */
  async launchBasicCLI(options) {
    logger.info("\u{1F527} Claude Code Zen - Basic CLI Mode");
    if (options?.["config"]?.coreSystem) {
      const system = options?.["config"]?.coreSystem;
      try {
        if (system && typeof system === "object" && "getSystemStatus" in system) {
          const getSystemStatusFn = system["getSystemStatus"];
          if (typeof getSystemStatusFn === "function") {
            const status = await getSystemStatusFn();
            if (status && typeof status === "object" && "components" in status) {
              for (const [_name, _info] of Object.entries(
                status.components
              )) {
              }
            }
          }
        }
      } catch (error) {
        logger.error("Failed to show system status:", error);
      }
    } else {
    }
    return {
      mode: "cli",
      success: true,
      pid: process.pid
    };
  }
  /**
   * Get current interface status.
   */
  getStatus() {
    return {
      active: !!this.activeInterface,
      ...this.activeInterface?.mode !== void 0 && {
        mode: this.activeInterface.mode
      },
      ...this.activeInterface?.url !== void 0 && {
        url: this.activeInterface.url
      },
      ...this.activeInterface?.pid !== void 0 && {
        pid: this.activeInterface.pid
      }
    };
  }
  /**
   * Shutdown active interface.
   */
  async shutdown() {
    if (!this.activeInterface) return;
    logger.info(`Shutting down ${this.activeInterface.mode} interface...`);
    try {
      if (this.activeInterface.server) {
        await new Promise((resolve) => {
          const server = this.activeInterface?.server;
          if (server && typeof server === "object" && "close" in server) {
            const closeFn = server["close"];
            if (typeof closeFn === "function") {
              closeFn(() => {
                resolve();
              });
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      }
      if (this.activeInterface.process) {
        this.activeInterface.process.kill("SIGTERM");
      }
      this.emit("interface:shutdown", {
        mode: this.activeInterface.mode
      });
      this.activeInterface = void 0;
      logger.info("Interface shutdown complete");
    } catch (error) {
      logger.error("Error during interface shutdown:", error);
      throw error;
    }
  }
  /**
   * Restart interface with new options.
   *
   * @param options
   */
  async restart(options = {}) {
    logger.info("Restarting interface...");
    await this.shutdown();
    return this.launch(options);
  }
  /**
   * Get interface recommendations for current environment.
   */
  getRecommendations() {
    return InterfaceModeDetector.getRecommendation();
  }
  /**
   * Get environment information for debugging.
   */
  getEnvironmentInfo() {
    return InterfaceModeDetector.getEnvironmentInfo();
  }
  /**
   * Setup graceful shutdown handlers.
   */
  setupShutdownHandlers() {
    const shutdown = /* @__PURE__ */ __name(async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await this.shutdown();
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    }, "shutdown");
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("uncaughtException", async (error) => {
      logger.error("Uncaught exception:", error);
      try {
        await this.shutdown();
      } catch (shutdownError) {
        logger.error("Error during emergency shutdown:", shutdownError);
      }
      process.exit(1);
    });
    process.on("unhandledRejection", async (reason) => {
      logger.error("Unhandled rejection:", reason);
      try {
        await this.shutdown();
      } catch (shutdownError) {
        logger.error("Error during emergency shutdown:", shutdownError);
      }
      process.exit(1);
    });
  }
};
var launchInterface = /* @__PURE__ */ __name(async (options) => {
  const launcher = InterfaceLauncher.getInstance();
  return launcher.launch(options);
}, "launchInterface");
var getInterfaceStatus = /* @__PURE__ */ __name(() => {
  const launcher = InterfaceLauncher.getInstance();
  return launcher.getStatus();
}, "getInterfaceStatus");
var shutdownInterface = /* @__PURE__ */ __name(async () => {
  const launcher = InterfaceLauncher.getInstance();
  return launcher.shutdown();
}, "shutdownInterface");
export {
  InterfaceLauncher,
  getInterfaceStatus,
  launchInterface,
  shutdownInterface
};
//# sourceMappingURL=interface-launcher-TSOQPMW3.js.map
