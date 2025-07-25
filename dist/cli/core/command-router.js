/**
 * @fileoverview Command Router
 * Clean, simplified command routing with validation and error handling
 * @module CommandRouter
 */

/**
 * Command router class for handling CLI command dispatch
 */
export class CommandRouter {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
  }

  /**
   * Register a command with its handler and metadata
   * @param {string} name - Command name
   * @param {Object} config - Command configuration
   * @param {Function} config.handler - Command handler function
   * @param {string} config.description - Command description
   * @param {string} config.usage - Usage string
   * @param {Array<string>} config.examples - Usage examples
   * @param {Array<string>} config.aliases - Command aliases
   */
  register(name, config) {
    if (typeof config.handler !== 'function') {
      throw new Error(`Command ${name} must have a handler function`);
    }

    this.commands.set(name, {
      name,
      handler: config.handler,
      description: config.description || 'No description available',
      usage: config.usage || name,
      examples: config.examples || [],
      aliases: config.aliases || [],
      hidden: config.hidden || false
    });

    // Register aliases
    if (config.aliases) {
      for (const alias of config.aliases) {
        this.aliases.set(alias, name);
      }
    }
  }

  /**
   * Execute a command by name
   * @param {string} name - Command name or alias
   * @param {Array} args - Command arguments
   * @param {Object} flags - Command flags
   * @returns {Promise<any>} Command result
   */
  async execute(name, args = [], flags = {}) {
    const commandName = this.resolveAlias(name);
    const command = this.commands.get(commandName);

    if (!command) {
      throw new Error(`Unknown command: ${name}`);
    }

    try {
      return await command.handler(args, flags);
    } catch (error) {
      throw new Error(`Command '${name}' failed: ${error.message}`);
    }
  }

  /**
   * Check if command exists
   * @param {string} name - Command name or alias
   * @returns {boolean} Whether command exists
   */
  has(name) {
    const commandName = this.resolveAlias(name);
    return this.commands.has(commandName);
  }

  /**
   * Get command configuration
   * @param {string} name - Command name or alias
   * @returns {Object|null} Command configuration
   */
  get(name) {
    const commandName = this.resolveAlias(name);
    return this.commands.get(commandName) || null;
  }

  /**
   * List all registered commands
   * @param {boolean} includeHidden - Include hidden commands
   * @returns {Array<Object>} Command list
   */
  list(includeHidden = false) {
    return Array.from(this.commands.values())
      .filter(cmd => includeHidden || !cmd.hidden)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Resolve alias to command name
   * @param {string} name - Command name or alias
   * @returns {string} Resolved command name
   */
  resolveAlias(name) {
    return this.aliases.get(name) || name;
  }

  /**
   * Get command help
   * @param {string} name - Command name or alias
   * @returns {Object|null} Help information
   */
  getHelp(name) {
    const command = this.get(name);
    if (!command) return null;

    return {
      name: command.name,
      description: command.description,
      usage: command.usage,
      examples: command.examples,
      aliases: command.aliases
    };
  }
}