#!/usr/bin/env node

import meow from 'meow';
import { executeCommand, hasCommand, showCommandHelp } from './command-registry.js';
import { renderTui } from '../ui/ink-tui.js';

const cli = meow(`
  Usage
    $ claude-zen <command> [options]

  Commands
    hive-mind    Queen-led swarms with collective intelligence
    swarm        (Internal) Multi-agent coordination
    init         Initialize project with enterprise environment
    start        Start orchestration with swarm intelligence
    status       Comprehensive system status
    help         Show help

  Options
    --version, -v  Show version
    --help, -h     Show help
    --ui           Show the interactive TUI
`, {
  importMeta: import.meta,
  flags: {
    help: { type: 'boolean', shortFlag: 'h' },
    version: { type: 'boolean', shortFlag: 'v' },
    ui: { type: 'boolean' },
  }
});

async function main() {
  const { input, flags } = cli;
  const command = input[0];

  if (flags.version || flags.v) {
    console.log(cli.pkg.version);
    return;
  }

  if (flags.ui) {
    renderTui(cli);
    return;
  }

  if (!command || flags.help || flags.h) {
    cli.showHelp(0);
  }

  if (hasCommand(command)) {
    try {
      await executeCommand(command, input.slice(1), flags);
    } catch (err) {
      console.error(`❌ Error executing command "${command}": ${err.message}`);
      process.exit(1);
    }
  } else {
    console.error(`❌ Error: Unknown command "${command}"`);
    cli.showHelp(1);
  }
}

main();
