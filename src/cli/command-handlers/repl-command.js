// repl-command.js - Handles the repl command

import { log } from '../core/logger.js';

// Helper function
const printSuccess = (msg) => log.success(msg);
import readline from 'readline';

async function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'claude-zen> ',
  });

  rl.prompt();

  for await (const line of rl) {
    if (line.trim() === 'exit') {
      break;
    }
    console.log(`Received: ${line.trim()}`);
    rl.prompt();
  }
}

export async function replCommand(args, flags) {
  printSuccess('Starting interactive REPL mode...');
  await startRepl();
}
