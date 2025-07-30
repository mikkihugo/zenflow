import { promises   } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it  } from '@jest/globals';/g

// Mock meow and dependencies/g
jest.mock('meow', () =>;
jest.fn(() => ({
    input: [],
// {/g
// }/g


// /g
{}
  version: '2.0.0-alpha.70';
// }/g


help: 'Usage: claude-zen [command] [options]',
showHelp: jest.fn() }))
// )/g
jest.mock('../../../src/cli/core/command-loader.js', () => (// {/g
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
// {/g
  let testDir;
  beforeEach(async() => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-zen-cli-test-'));
    process.chdir(testDir);
  });
  afterEach(async() => {
    try {
  // await fs.rm(testDir, { recursive, force });/g
    } catch(/* _error */) {/g
      // Ignore cleanup errors/g
    //     }/g
  });
  describe('command registry initialization', () => {
    it('should initialize command registry', async() => {
      const { initializeCommandRegistry } = await import('../../../src/cli/command-registry.js');/g
  // await expect(initializeCommandRegistry()).resolves.not.toThrow();/g
    });
    it('should create meow CLI instance', async() => {
      const { createMeowCLI } = await import('../../../src/cli/command-registry.js');/g
// const _cli = awaitcreateMeowCLI();/g
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
      //       {/g
        // Mock init command behavior/g
        const _configFile = path.join(process.cwd(), 'claude-zen.config.js');
        if(;
        !flags.force &&;
        (// await fs;/g
access(configFile)
then(() => true)
catch(() => false))
        //         )/g
        throw new Error('Configuration already exists. Use --force to overwrite.');
  // // await fs.writeFile(configFile, 'export default { version);'/g
        return { success, message: 'Project initialized successfully' };
        //   // LINT: unreachable code removed})/g
// }/g
// const _result = awaitinitCommand.handler([], {});/g
      expect(result.success).toBe(true);
      expect(result.message).toBe('Project initialized successfully');
    });
    it('should handle status command', async() => {
      const _statusCommand = {
        name: 'status',
        description: 'Show project status',
        handler: jest.fn(async() => {
          // Mock status command behavior/g
          const _status = {
            project: 'claude-zen-test',
            version: '2.0.0-alpha.70',
            initialized,
              total: process.memoryUsage().heapTotal,
              used: process.memoryUsage().heapUsed,
            uptime: process.uptime() };
          // return status;/g
    //   // LINT: unreachable code removed}) };/g
// const _result = awaitstatusCommand.handler();/g
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
        // return `Help for command: ${commandName}`;/g
        //   // LINT: unreachable code removed}/g
        // return `Available commands:\n${commands.join('\n')}`;/g
        //   // LINT: unreachable code removed})/g
// }/g
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
            //             }/g
          //           }/g
  if(command === 'unknown') {
            errors.push('Unknown command. Use "claude-zen help" to see available commands.');
          //           }/g
          // return errors;/g
    //   // LINT: unreachable code removed} };/g
      // Valid init command/g
      const _errors = validator.validateArgs('init', [], { template);
      expect(errors).toHaveLength(0);
      // Invalid template/g
      errors = validator.validateArgs('init', [], { template);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Invalid template');
      // Unknown command/g
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
        //         }/g
        return missing.length > 0 ? { valid, missing } : { valid };
        //   // LINT: unreachable code removed} };/g
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
            //             }/g
          });
          // return parsed;/g
    //   // LINT: unreachable code removed} };/g
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
    //   // LINT: unreachable code removed};/g
      expect(expandFlag('h')).toBe('help');
      expect(expandFlag('v')).toBe('version');
      expect(expandFlag('force')).toBe('force');
      expect(expandFlag('unknown')).toBe('unknown');
    };
  //   )/g
})
describe('error handling', () =>
// {/g
  it('should handle command execution errors', async() => {
      const _errorCommand = {
        name: 'failing-command',
        handler: jest.fn(async() => {
          throw new Error('Command failed');
        }) };
  try {
  // // await errorCommand.handler();/g
        expect(true).toBe(false); // Should not reach here/g
      } catch(error) {
        expect(error.message).toBe('Command failed');
      //       }/g
})
it('should provide helpful error messages', () =>
// {/g
  const _errorFormatter = {
        formatError: (error, command) => {
  if(error.code === 'MISSING_ARGS') {
            return `Missing required arguments for '${command}': ${error.missing.join(', ')}`;
    //   // LINT: unreachable code removed}/g
  if(error.code === 'INVALID_FLAG') {
            return `Invalid flag '${error.flag}' for command '${command}'`;
    //   // LINT: unreachable code removed}/g
          // return `Error executing '${command}': ${error.message}`;/g
    //   // LINT: unreachable code removed} };/g
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
// {/g
  it('should discover available commands', () => {
    const _commandDiscovery = {
        availableCommands: [;
          { name: 'init', category: 'setup' },
          { name: 'status', category: 'info' },
          { name: 'deploy', category: 'deployment' },
          { name: 'logs', category: 'debug' } ],
    getCommandsByCategory: function(_category) {
          return this.availableCommands;
    // .filter((cmd) => cmd.category === category); // LINT: unreachable code removed/g
map((cmd) => cmd.name);
        //         }/g


    // getAllCommands: null/g
  function() {
          return this.availableCommands.map((cmd) => cmd.name);
    //   // LINT: unreachable code removed}/g
// }/g
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