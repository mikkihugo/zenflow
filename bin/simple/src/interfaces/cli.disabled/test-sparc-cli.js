#!/usr/bin/env node
import { Command } from 'commander';
import { createSPARCTemplateCommands } from './sparc-template-commands.ts';
const program = new Command();
program
    .name('sparc-cli-test')
    .description('Test SPARC Template CLI Commands')
    .version('1.0.0');
program.addCommand(createSPARCTemplateCommands());
program.parse();
//# sourceMappingURL=test-sparc-cli.js.map