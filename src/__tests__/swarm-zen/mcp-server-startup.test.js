#!/usr/bin/env node

/**
 * Test script to validate MCP server startup fix
 * Tests Issue #155: MCP server startup binary selection
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const TEST_TIMEOUT = 10000; // 10 seconds

async function testMcpServerStartup() {
  try {
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Kill the process after timeout - this is expected for stdio server
        child.kill('SIGTERM');
        resolve({ success: hasStarted, stdout, stderr, timeout: true });
      }, TEST_TIMEOUT);

      const child = spawn('npm', ['run', 'mcp:server'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let hasStarted = false;

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        // Check for successful startup message
        if (data.toString().includes('Starting ruv-swarm-mcp stdio server')) {
          hasStarted = true;
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        // Check for binary ambiguity error (should not occur)
        if (
          data.toString().includes('could not determine which binary to run')
        ) {
          clearTimeout(timeout);
          child.kill('SIGTERM');
          resolve({
            success: false,
            stdout,
            stderr,
            error: 'binary_ambiguity',
          });
        }
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        resolve({ success: hasStarted, stdout, stderr, code, hasStarted });
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Analyze results
    if (result.error === 'binary_ambiguity') {
      return false;
    }

    if (result.hasStarted) {
      if (result.timeout) {
      }
    } else {
      return false;
    }

    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);

    const mcpServerScript = packageJson.scripts['mcp:server'];
    const expectedScript =
      'cd ../crates/ruv-swarm-mcp && cargo run --bin ruv-swarm-mcp-stdio';

    if (mcpServerScript === expectedScript) {
    } else {
      return false;
    }

    const mcpServerDevScript = packageJson.scripts['mcp:server:dev'];
    const expectedDevScript =
      "cd ../crates/ruv-swarm-mcp && cargo watch -x 'run --bin ruv-swarm-mcp-stdio'";

    if (mcpServerDevScript === expectedDevScript) {
    } else {
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMcpServerStartup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { testMcpServerStartup };
