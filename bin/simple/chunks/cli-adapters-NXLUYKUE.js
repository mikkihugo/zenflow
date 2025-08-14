
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/interfaces/terminal/adapters/cli-adapters.ts
var DiscoverCommandAdapter = class {
  static {
    __name(this, "DiscoverCommandAdapter");
  }
  name = "discover";
  description = "Discover and analyze project structure and capabilities";
  async execute(context) {
    try {
      const { DiscoverCommand } = await import("../../cli/commands/discover.ts");
      const discoverCommand = new DiscoverCommand();
      const result = await discoverCommand.execute?.(context) || await discoverCommand.run?.(context) || { success: true, message: "Discovery completed" };
      return result;
    } catch (error) {
      console.warn("Discover command execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Discovery failed",
        message: "Could not execute discover command"
      };
    }
  }
};
var CLICommandRegistry = class _CLICommandRegistry {
  static {
    __name(this, "CLICommandRegistry");
  }
  static instance;
  commands = /* @__PURE__ */ new Map();
  constructor() {
    this.commands.set("discover", new DiscoverCommandAdapter());
  }
  static getInstance() {
    if (!_CLICommandRegistry.instance) {
      _CLICommandRegistry.instance = new _CLICommandRegistry();
    }
    return _CLICommandRegistry.instance;
  }
  async getCommand(name) {
    return this.commands.get(name) || null;
  }
  async executeCommand(name, context) {
    const command = await this.getCommand(name);
    if (!command) {
      return {
        success: false,
        error: `Command '${name}' not found`,
        message: `Available commands: ${Array.from(this.commands.keys()).join(", ")}`
      };
    }
    return await command.execute(context);
  }
  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }
};
export {
  CLICommandRegistry,
  DiscoverCommandAdapter
};
//# sourceMappingURL=cli-adapters-NXLUYKUE.js.map
