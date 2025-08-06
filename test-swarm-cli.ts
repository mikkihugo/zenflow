#!/usr/bin/env node
/**
 * Test the new swarm CLI command
 */

import { executeSwarmCommand } from './src/interfaces/cli/commands/swarm';

executeSwarmCommand().catch(console.error);
