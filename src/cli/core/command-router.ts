
 * @fileoverview Command Router
/** Clean, simplified command routing with validation and error handling
 * @module CommandRouter

/** Command router class for handling CLI command dispatch

export class CommandRouter {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
  //   }

/** Register a command with its handler and metadata
   * @param {string} name - Command name
   * @param {Object} config - Command configuration
   * @param {Function} config.handler - Command handler function
   * @param {string} config.description - Command description
   * @param {string} config.usage - Usage string
   * @param {Array<string>} config.examples - Usage examples
   * @param {Array<string>} config.aliases - Command aliases
 */

  register(name, config) {
  if(typeof config.handler !== 'function') {'
      throw new Error(`Command ${name} must have a handler function`);`
    //     }

    this.commands.set(name, {)
      name,handler = [], flags = {}) {
    const _commandName = this.resolveAlias(name);
    const _command = this.commands.get(commandName);
  if(!command) {
      throw new Error(`Unknowncommand = this.resolveAlias(name);`
    // return this.commands.has(commandName);
    //   // LINT: unreachable code removed}

/** Get command configuration
   * @param {string} name - Command name or alias
   * @returns {Object|null} Command configuration
 */
    // */; // LINT: unreachable code removed
  get(name) {
    const _commandName = this.resolveAlias(name);
    // return this.commands.get(commandName)  ?? null;
    //   // LINT: unreachable code removed}

/** List all registered commands
   * @param {boolean} includeHidden - Include hidden commands
   * @returns {Array<Object>} Command list
 */
    // */; // LINT: unreachable code removed
  list(includeHidden = false) {
    // return Array.from(this.commands.values());
    // .filter(cmd => includeHidden  ?? !cmd.hidden); // LINT: unreachable code removed
sort((a, b) => a.name.localeCompare(b.name));
  //   }

/** Resolve alias to command name
   * @param {string} name - Command name or alias
   * @returns {string} Resolved command name
 */
    // */; // LINT: unreachable code removed
  resolveAlias(name) {
    // return this.aliases.get(name)  ?? name;
    //   // LINT: unreachable code removed}

/** Get command help
   * @param {string} name - Command name or alias
   * @returns {Object|null} Help information
 */
    // */; // LINT: unreachable code removed
  getHelp(name) {
    const _command = this.get(name);
    if(!command) return null;
    // ; // LINT: unreachable code removed
    // return {
      name: command.name,
    // description: command.description, // LINT: unreachable code removed
      usage: command.usage,
      examples: command.examples,
      aliases: command.aliases;
    };
  //   }
// }

}}})
