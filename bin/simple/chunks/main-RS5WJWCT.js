#!/usr/bin/env node

    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  detectModeWithReason
} from "./chunk-RGTGJ4II.js";
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

// src/interfaces/terminal/state-hooks/use-config.ts
var import_react = __toESM(require_react(), 1);
var logger = getLogger("ConfigHook");

// src/interfaces/terminal/state-hooks/use-swarm-status.ts
var import_react2 = __toESM(require_react(), 1);
var logger2 = getLogger("SwarmStatusHook");

// src/interfaces/terminal/utils/mock-command-handler.ts
var logger3 = getLogger("mock-command-handler");

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
    const { TerminalApp: TerminalApp2 } = await import("./terminal-interface-router-UX7MMGAP.js");
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
var launchTerminalInterface = /* @__PURE__ */ __name(async (config) => {
  const terminal = new TerminalInterface(config);
  await terminal.initialize();
  await terminal.render();
}, "launchTerminalInterface");

// src/interfaces/terminal/main.ts
var logger4 = getLogger("interfaces-terminal-main");
async function main() {
  try {
    const args = process.argv.slice(2);
    const commands = args.filter((arg) => !arg.startsWith("-"));
    const flags = parseFlags(args);
    const modeResult = detectModeWithReason(commands, flags);
    if (flags.verbose || flags.debug) {
    }
    await launchTerminalInterface({
      mode: flags.mode || modeResult?.mode,
      theme: flags.theme || "dark",
      verbose: flags.verbose || false,
      autoRefresh: !flags["no-refresh"],
      refreshInterval: typeof flags["refresh-interval"] === "number" ? flags["refresh-interval"] : (typeof flags["refresh-interval"] === "string" ? parseInt(flags["refresh-interval"]) : 3e3) || 3e3
    });
  } catch (error) {
    logger4.error("\u274C Failed to launch terminal interface:", error);
    process.exit(1);
  }
}
__name(main, "main");
function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg && arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        if (key === "refresh-interval") {
          const parsed = parseInt(nextArg);
          flags[key] = Number.isNaN(parsed) ? 3e3 : parsed;
        } else if (key === "port") {
          const parsed = parseInt(nextArg);
          flags[key] = Number.isNaN(parsed) ? nextArg : parsed;
        } else {
          flags[key] = nextArg;
        }
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg && arg.startsWith("-") && arg.length > 1) {
      const key = arg.slice(1);
      flags[key] = true;
    }
  }
  return flags;
}
__name(parseFlags, "parseFlags");
process.on("SIGINT", () => {
  process.exit(0);
});
process.on("SIGTERM", () => {
  process.exit(0);
});
var isMainModule = process.argv[1]?.endsWith("main.js") || process.argv[1]?.endsWith("main.ts");
if (isMainModule) {
  main().catch((error) => {
    logger4.error("\u{1F4A5} Fatal error:", error);
    process.exit(1);
  });
}
var main_default = main;
export {
  main_default as default,
  main
};
//# sourceMappingURL=main-RS5WJWCT.js.map
