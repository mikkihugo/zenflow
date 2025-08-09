#!/usr/bin/env node
/**
 * @file Test suite for test-sparc-cli
 */


/**
 * Test CLI commands for SPARC Template Engine.
 */

import { Command } from 'commander';
import { createSPARCTemplateCommands } from './sparc-template-commands';

const program = new Command();

program.name('sparc-cli-test').description('Test SPARC Template CLI Commands').version('1.0.0');

// Add the SPARC template commands
program.addCommand(createSPARCTemplateCommands());

// Parse arguments and execute
program.parse();
