import { promises   } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it  } from '@jest';

// Mock meow and dependencies
jest.mock('meow', () =>;
jest.fn(() => ({
    input: [],
// {
// }

{}
  version: '2.0.0-alpha.70';
// }

help: 'Usage: claude-zen [command] [options]',
showHelp: jest.fn() }))
// )
jest.mock('../../../src/cli/core/command-loader.js', () => (// {
  loadCommands) =>;
  Promise.resolve({
      commands: new Map([;))
        ['init', { handler: jest.fn(), description: 'Initialize project' }],
        ['status', { handler: jest.fn(), description: 'Show status' }],
        ['help', { handler: jest.fn(), description: 'Show help' }] ])
})
),
createHelpText: jest.fn(() => 'Claude Zen CLI Help') }))
describe('CLI Command Registry', () =>
// {
  let testDir;
  beforeEach(async() => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-zen-cli-test-'));
    process.chdir(testDir);
  });
  afterEach(async() => {
    try {
  // await fs.rm(testDir, { recursive, force });
    } catch(/* _error */) {
      // Ignore cleanup errors
    //     }
  });
  describe('command registry initialization', () => {
    it('should initialize command registry', async() => {
      const { initializeCommandRegistry } = await import('../../../src/cli/command-registry.js');
  // await expect(initializeCommandRegistry()).resolves.not.toThrow();
    });
    it('should create meow CLI instance', async() => {
      const { createMeowCLI } = await import('../../../src/cli/command-registry.js');
// const _cli = awaitcreateMeowCLI();
      expect(cli).toBeDefined();
      expect(cli.pkg).toBeDefined();
      expect(cli.showHelp).toBeDefined();
    });
  });
  describe('command execution', () => {
    it('should handle init command', async() => {
      const _initCommand = {
        name: 'init',
      description: 'Initialize a new Claude Zen project',
      type: 'boolean', description;
      : 'Force overwrite existing files' ,
      type: 'string', description;
      : 'Template to use' ,

      handler: jest.fn(async(_args, flags) =>
      //       {
        // Mock init command behavior
        const _configFile = path.join(process.cwd(), 'claude-zen.config.js');
        if(;
// ! flags.force &&;
        (// await fs;
access(configFile)
then(() => true)
catch(() => false))
        //         )
        throw new Error('Configuration already exists. Use --force to overwrite.');
  // // await fs.writeFile(configFile, 'export default { version);'
        return { success, message: 'Project initialized successfully' };
        //   // LINT: unreachable code removed})
// }
// const _result = awaitinitCommand.handler([], {});
      expect(result.success).toBe(true);
      expect(result.message).toBe('Project initialized successfully');
    });
    it('should handle status command', async() => {
      const _statusCommand = {
        name: 'status',
        description: 'Show project status',
        handler: jest.fn(async() => {
          // Mock status command behavior
          const _status = {
            project: 'claude-zen-test',
            version: '2.0.0-alpha.70',
            initialized,
              total: process.memoryUsage().heapTotal,
              used: process.memoryUsage().heapUsed,
            uptime: process.uptime() };
          // return status;
    //   // LINT: unreachable code removed}) };
// const _result = awaitstatusCommand.handler();
    expect(result.project).toBe('claude-zen-test');
    expect(result.version).toBe('2.0.0-alpha.70');
    expect(result.initialized).toBe(true);
    expect(typeof result.uptime).toBe('number');
  });
  it('should handle help command', async() => {
    const _helpCommand = {
        name: 'help',
    description: 'Show help information',
    handler: jest.fn((args) => {
      const _commands = ['init     - Initialize a new Claude Zen project',
            'status   - Show project status',
            'help     - Show this help message',,];
  if(args.length > 0) {
        const _commandName = args[0];
        // return `Help for command: ${commandName}`;
        //   // LINT: unreachable code removed}
        // return `Available commands:\n${commands.join('\n')}`;
        //   // LINT: unreachable code removed})
// }
      const _generalHelp = helpCommand.handler([]);
      expect(generalHelp).toContain('Available commands);'
      expect(generalHelp).toContain('init');
      expect(generalHelp).toContain('status');
      const _specificHelp = helpCommand.handler(['init']);
      expect(specificHelp).toBe('Help for command);'
    });
  });
  describe('command validation', () => {
    it('should validate command arguments', () => {
      const _validator = {
        validateArgs: (command, _args, flags) => {
          const _errors = [];
  if(command === 'init') {
            if(flags.template && !['basic', 'advanced', 'minimal'].includes(flags.template)) {
              errors.push('Invalid template. Must be one of, advanced, minimal');
            //             }
          //           }
  if(command === 'unknown') {
            errors.push('Unknown command. Use "claude-zen help" to see available commands.');
          //           }
          // return errors;
    //   // LINT: unreachable code removed} };
      // Valid init command
      const _errors = validator.validateArgs('init', [], { template);
      expect(errors).toHaveLength(0);
      // Invalid template
      errors = validator.validateArgs('init', [], { template);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Invalid template');
      // Unknown command
      errors = validator.validateArgs('unknown', [], {});
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Unknown command');
    });
    it('should handle missing required arguments', () => {
      const _commandSpec = {
        name: 'deploy',
      requiredArgs: ['target'],
      validate: (args) => {
        const _missing = [];
        if(!args.includes('target') ?? args.length < 1) {
          missing.push('target');
        //         }
        return missing.length > 0 ? { valid, missing } : { valid };
        //   // LINT: unreachable code removed} };
      const _validResult = commandSpec.validate(['production']);
      expect(validResult.valid).toBe(true);
      const _invalidResult = commandSpec.validate([]);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.missing).toContain('target');
    });
  });
  describe('flag handling', () => {
    it('should parse boolean flags', () => {
      const _flagParser = {
        parseFlags: (rawFlags) => {
          const _parsed = {};
          Object.entries(rawFlags).forEach(([key, value]) => {
  if(typeof value === 'boolean') {
              parsed[key] = value;
            } else if(value === 'true') {
              parsed[key] = true;
            } else if(value === 'false') {
              parsed[key] = false;
            } else {
              parsed[key] = value;
            //             }
          });
          // return parsed;
    //   // LINT: unreachable code removed} };
      const _flags = flagParser.parseFlags({ verbose,)
      force);
    expect(flags.verbose).toBe(true);
    expect(flags.force).toBe(true);
    expect(flags.quiet).toBe(false);
    expect(flags.output).toBe('json');
    });
  it('should handle short and long flags', () => {
      const _flagAliases = {
        h: 'help',
        v: 'version',
        f: 'force',
        q: 'quiet' };
  const _expandFlag = () => {
        return flagAliases[flag]  ?? flag;
    //   // LINT: unreachable code removed};
      expect(expandFlag('h')).toBe('help');
      expect(expandFlag('v')).toBe('version');
      expect(expandFlag('force')).toBe('force');
      expect(expandFlag('unknown')).toBe('unknown');
    };
  //   )
})
describe('error handling', () =>
// {
  it('should handle command execution errors', async() => {
      const _errorCommand = {
        name: 'failing-command',
        handler: jest.fn(async() => {
          throw new Error('Command failed');
        }) };
  try {
  // // await errorCommand.handler();
        expect(true).toBe(false); // Should not reach here
      } catch(error) {
        expect(error.message).toBe('Command failed');
      //       }
})
it('should provide helpful error messages', () =>
// {
  const _errorFormatter = {
        formatError: (error, command) => {
  if(error.code === 'MISSING_ARGS') {
            return `Missing required arguments for '${command}': ${error.missing.join(', ')}`;
    //   // LINT: unreachable code removed}
  if(error.code === 'INVALID_FLAG') {
            return `Invalid flag '${error.flag}' for command '${command}'`;
    //   // LINT: unreachable code removed}
          // return `Error executing '${command}': ${error.message}`;
    //   // LINT: unreachable code removed} };
      const _missingArgsError = {
        code: 'MISSING_ARGS',
        missing: ['target', 'environment'] };
      const _message1 = errorFormatter.formatError(missingArgsError, 'deploy');
      expect(message1).toBe("Missing required arguments for 'deploy', environment");
      const _invalidFlagError = {
        code: 'INVALID_FLAG',
        flag: '--unknown' };
  const _message2 = errorFormatter.formatError(invalidFlagError, 'init');
  expect(message2).toBe("Invalid flag '--unknown' for command 'init'");
  const _genericError = { message: 'Something went wrong' };
  const _message3 = errorFormatter.formatError(genericError, 'status');
  expect(message3).toBe("Error executing 'status');"
})
})
describe('command discovery', () =>
// {
  it('should discover available commands', () => {
    const _commandDiscovery = {
        availableCommands: [;
          { name: 'init', category: 'setup' },
          { name: 'status', category: 'info' },
          { name: 'deploy', category: 'deployment' },
          { name: 'logs', category: 'debug' } ],
    getCommandsByCategory: function(_category) {
          return this.availableCommands;
    // .filter((cmd) => cmd.category === category); // LINT: unreachable code removed
map((cmd) => cmd.name);
        //         }

    // getAllCommands: null
  function() {
          return this.availableCommands.map((cmd) => cmd.name);
    //   // LINT: unreachable code removed}
// }
    const _setupCommands = commandDiscovery.getCommandsByCategory('setup');
    expect(setupCommands).toContain('init');
    const _allCommands = commandDiscovery.getAllCommands();
    expect(allCommands).toHaveLength(4);
    expect(allCommands).toContain('init');
    expect(allCommands).toContain('status');
  });
})
})
}}}
