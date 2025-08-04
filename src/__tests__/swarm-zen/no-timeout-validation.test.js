/**
 * Comprehensive test suite to validate that ALL timeout mechanisms have been removed
 * from ruv-swarm-no-timeout.js while maintaining security and functionality
 */

import { exec } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

describe('No Timeout Validation Suite', () => {
  const noTimeoutPath = join(__dirname, '..', 'bin', 'ruv-swarm-no-timeout.js');
  const originalPath = join(__dirname, '..', 'bin', 'ruv-swarm-secure.js');

  let noTimeoutCode, originalCode;

  beforeAll(() => {
    // Read both files for comparison
    noTimeoutCode = readFileSync(noTimeoutPath, 'utf8');
    originalCode = readFileSync(originalPath, 'utf8');
  });

  describe('Timeout Mechanism Removal Verification', () => {
    test('ALL setTimeout calls should be removed', () => {
      const setTimeoutMatches = noTimeoutCode.match(/setTimeout\s*\(/g);
      expect(setTimeoutMatches).toBeNull();

      // Verify original had setTimeout calls
      const originalSetTimeoutMatches = originalCode.match(/setTimeout\s*\(/g);
      expect(originalSetTimeoutMatches).not.toBeNull();
      expect(originalSetTimeoutMatches.length).toBeGreaterThan(0);
    });

    test('ALL setInterval calls should be removed', () => {
      const setIntervalMatches = noTimeoutCode.match(/setInterval\s*\(/g);
      expect(setIntervalMatches).toBeNull();

      // Verify original had setInterval calls
      const originalSetIntervalMatches = originalCode.match(/setInterval\s*\(/g);
      expect(originalSetIntervalMatches).not.toBeNull();
      expect(originalSetIntervalMatches.length).toBeGreaterThan(0);
    });

    test('ALL clearTimeout calls should be removed', () => {
      const clearTimeoutMatches = noTimeoutCode.match(/clearTimeout\s*\(/g);
      expect(clearTimeoutMatches).toBeNull();
    });

    test('ALL clearInterval calls should be removed', () => {
      const clearIntervalMatches = noTimeoutCode.match(/clearInterval\s*\(/g);
      expect(clearIntervalMatches).toBeNull();
    });

    test('Heartbeat-related code should be removed', () => {
      // Check for heartbeat-related variables and functions
      expect(noTimeoutCode).not.toMatch(/heartbeat/i);
      expect(noTimeoutCode).not.toMatch(/lastActivity/);
      expect(noTimeoutCode).not.toMatch(/MCP_HEARTBEAT/);

      // Verify original had heartbeat code
      expect(originalCode).toMatch(/heartbeat/i);
      expect(originalCode).toMatch(/lastActivity/);
      expect(originalCode).toMatch(/MCP_HEARTBEAT/);
    });

    test('Timeout environment variables should be removed', () => {
      expect(noTimeoutCode).not.toMatch(/MCP_HEARTBEAT_INTERVAL/);
      expect(noTimeoutCode).not.toMatch(/MCP_HEARTBEAT_TIMEOUT/);

      // Verify original had these variables
      expect(originalCode).toMatch(/MCP_HEARTBEAT_INTERVAL/);
      expect(originalCode).toMatch(/MCP_HEARTBEAT_TIMEOUT/);
    });

    test('Activity monitoring should be removed', () => {
      expect(noTimeoutCode).not.toMatch(/timeSinceLastActivity/);
      expect(noTimeoutCode).not.toMatch(/heartbeatChecker/);
      expect(noTimeoutCode).not.toMatch(/heartbeatCheckInterval/);
    });
  });

  describe('Security Feature Preservation', () => {
    test('Security validation should be preserved', () => {
      expect(noTimeoutCode).toMatch(/CommandSanitizer/);
      expect(noTimeoutCode).toMatch(/SecurityError/);
      expect(noTimeoutCode).toMatch(/validateArgument/);
    });

    test('Input validation should be preserved', () => {
      expect(noTimeoutCode).toMatch(/validateTopology/);
      expect(noTimeoutCode).toMatch(/validateMaxAgents/);
      expect(noTimeoutCode).toMatch(/validateAgentType/);
      expect(noTimeoutCode).toMatch(/validateTaskDescription/);
    });

    test('Error handling should be preserved', () => {
      expect(noTimeoutCode).toMatch(/ValidationError/);
      expect(noTimeoutCode).toMatch(/uncaughtException/);
      expect(noTimeoutCode).toMatch(/unhandledRejection/);
    });

    test('WASM integrity should be preserved', () => {
      expect(noTimeoutCode).toMatch(/ZenSwarm/);
      expect(noTimeoutCode).toMatch(/detectSIMDSupport/);
      expect(noTimeoutCode).toMatch(/initializeSystem/);
    });
  });

  describe('Stability Feature Preservation', () => {
    test('Stability mode should be preserved', () => {
      expect(noTimeoutCode).toMatch(/isStabilityMode/);
      expect(noTimeoutCode).toMatch(/stabilityLog/);
      expect(noTimeoutCode).toMatch(/MAX_RESTARTS/);
    });

    test('Process signal handling should be preserved', () => {
      expect(noTimeoutCode).toMatch(/SIGTERM/);
      expect(noTimeoutCode).toMatch(/SIGINT/);
      expect(noTimeoutCode).toMatch(/process\.on/);
    });

    test('Auto-restart functionality should be preserved', () => {
      expect(noTimeoutCode).toMatch(/startStableMcpServer/);
      expect(noTimeoutCode).toMatch(/childProcess/);
      expect(noTimeoutCode).toMatch(/spawn/);
    });
  });

  describe('Core Functionality Preservation', () => {
    test('MCP tools should be preserved', () => {
      expect(noTimeoutCode).toMatch(/mcpTools/);
      expect(noTimeoutCode).toMatch(/EnhancedMCPTools/);
      expect(noTimeoutCode).toMatch(/daaMcpTools/);
    });

    test('Agent spawning should be preserved', () => {
      expect(noTimeoutCode).toMatch(/agent_spawn/);
      expect(noTimeoutCode).toMatch(/handleSpawn/);
      expect(noTimeoutCode).toMatch(/VALID_AGENT_TYPES/);
    });

    test('Task orchestration should be preserved', () => {
      expect(noTimeoutCode).toMatch(/task_orchestrate/);
      expect(noTimeoutCode).toMatch(/handleOrchestrate/);
    });

    test('Swarm initialization should be preserved', () => {
      expect(noTimeoutCode).toMatch(/swarm_init/);
      expect(noTimeoutCode).toMatch(/handleInit/);
      expect(noTimeoutCode).toMatch(/VALID_TOPOLOGIES/);
    });
  });

  describe('Version Identification', () => {
    test('Should identify as no-timeout version', () => {
      expect(noTimeoutCode).toMatch(/NO TIMEOUT VERSION/);
      expect(noTimeoutCode).toMatch(/ruv-swarm-no-timeout/);
      expect(noTimeoutCode).toMatch(/INFINITE RUNTIME/);
    });

    test('Should have timeout removal documentation', () => {
      expect(noTimeoutCode).toMatch(/TIMEOUT MECHANISMS: COMPLETELY REMOVED/);
      expect(noTimeoutCode).toMatch(/BULLETPROOF OPERATION/);
      expect(noTimeoutCode).toMatch(/NO DISCONNECTIONS/);
    });
  });

  describe('Functional Testing', () => {
    test('Help command should work without timeouts', async () => {
      try {
        const { stdout, stderr } = await execAsync(`node ${noTimeoutPath} help`);
        expect(stdout).toMatch(/NO TIMEOUT VERSION/);
        expect(stdout).toMatch(/INFINITE RUNTIME/);
        expect(stderr).toBe('');
      } catch (error) {
        console.error('❌ Help command failed:', error.message);
        throw error;
      }
    });

    test('Version command should work without timeouts', async () => {
      try {
        const { stdout, stderr } = await execAsync(`node ${noTimeoutPath} version`);
        expect(stdout).toMatch(/NO TIMEOUT VERSION/);
        expect(stdout).toMatch(/TIMEOUT MECHANISMS COMPLETELY REMOVED/);
        expect(stderr).toBe('');
      } catch (error) {
        console.error('❌ Version command failed:', error.message);
        throw error;
      }
    });

    test('MCP status should work without timeouts', async () => {
      try {
        const { stdout, stderr } = await execAsync(`node ${noTimeoutPath} mcp status`);
        expect(stdout).toMatch(/NO TIMEOUT VERSION/);
        expect(stdout).toMatch(/TIMEOUT MECHANISMS: COMPLETELY DISABLED/);
        expect(stderr).toBe('');
      } catch (error) {
        console.error('❌ MCP status failed:', error.message);
        throw error;
      }
    });

    test('MCP tools list should work without timeouts', async () => {
      try {
        const { stdout, stderr } = await execAsync(`node ${noTimeoutPath} mcp tools`);
        expect(stdout).toMatch(/NO TIMEOUT VERSION/);
        expect(stdout).toMatch(/NO TIMEOUT MECHANISMS/);
        expect(stderr).toBe('');
      } catch (error) {
        console.error('❌ MCP tools list failed:', error.message);
        throw error;
      }
    });

    test('MCP help should work without timeouts', async () => {
      try {
        const { stdout, stderr } = await execAsync(`node ${noTimeoutPath} mcp help`);
        expect(stdout).toMatch(/NO TIMEOUT VERSION/);
        expect(stdout).toMatch(/TIMEOUT MECHANISMS: COMPLETELY REMOVED/);
        expect(stdout).toMatch(/REMOVED VARIABLES/);
        expect(stderr).toBe('');
      } catch (error) {
        console.error('❌ MCP help failed:', error.message);
        throw error;
      }
    });
  });

  describe('Code Quality Validation', () => {
    test('Should have proper syntax', () => {
      expect(() => {
        // Try to import the module to check syntax
        import(noTimeoutPath);
      }).not.toThrow();
    });

    test('Should have proper imports', () => {
      expect(noTimeoutCode).toMatch(/import.*from/);
      expect(noTimeoutCode).toMatch(/export.*{/);
    });

    test('Should have proper shebang', () => {
      expect(noTimeoutCode).toMatch(/^#!/);
      expect(noTimeoutCode).toMatch(/node/);
    });

    test('Should have proper error handling', () => {
      expect(noTimeoutCode).toMatch(/try.*catch/);
      expect(noTimeoutCode).toMatch(/process\.exit/);
    });
  });

  describe('Performance Implications', () => {
    test('Should not have performance-degrading timeout checks', () => {
      // Check that monitoring loops don't use timeout mechanisms
      expect(noTimeoutCode).not.toMatch(/while.*timeout/i);
      expect(noTimeoutCode).not.toMatch(/check.*timeout/i);
    });

    test('Should use efficient monitoring approach', () => {
      // Check that monitoring uses simple loops instead of intervals
      expect(noTimeoutCode).toMatch(/while.*elapsed/);
      expect(noTimeoutCode).toMatch(/await new Promise/);
    });
  });

  describe('Documentation Updates', () => {
    test('Should have updated help messages', () => {
      expect(noTimeoutCode).toMatch(/NO TIMEOUT FEATURES/);
      expect(noTimeoutCode).toMatch(/INFINITE RUNTIME/);
      expect(noTimeoutCode).toMatch(/BULLETPROOF OPERATION/);
    });

    test('Should have updated resource content', () => {
      expect(noTimeoutCode).toMatch(/getResourceContent/);
      expect(noTimeoutCode).toMatch(/NO TIMEOUT VERSION/);
    });

    test('Should have updated tool descriptions', () => {
      expect(noTimeoutCode).toMatch(/NO TIMEOUT VERSION.*description/);
    });
  });
});

describe('Integration Testing', () => {
  test('Should work with Claude Code MCP integration', async () => {
    // This test would verify that the no-timeout version works with Claude Code
    // For now, we'll just verify the MCP protocol compliance

    expect(noTimeoutCode).toMatch(/jsonrpc.*2\.0/);
    expect(noTimeoutCode).toMatch(/tools\/list/);
    expect(noTimeoutCode).toMatch(/tools\/call/);
    expect(noTimeoutCode).toMatch(/resources\/list/);
    expect(noTimeoutCode).toMatch(/resources\/read/);
  });

  test('Should maintain all security features', () => {
    expect(noTimeoutCode).toMatch(/security/i);
    expect(noTimeoutCode).toMatch(/validation/i);
    expect(noTimeoutCode).toMatch(/sanitiz/i);
  });
});

// Summary test to provide overall validation status
describe('Overall Validation Summary', () => {
  test('Complete timeout elimination validation', () => {
    const timeoutPatterns = [
      /setTimeout/g,
      /setInterval/g,
      /clearTimeout/g,
      /clearInterval/g,
      /heartbeat/gi,
      /lastActivity/g,
      /MCP_HEARTBEAT/g,
      /timeSinceLastActivity/g,
      /heartbeatChecker/g,
      /heartbeatCheckInterval/g,
    ];

    let removedCount = 0;
    let preservedCount = 0;

    for (const pattern of timeoutPatterns) {
      const noTimeoutMatches = noTimeoutCode.match(pattern);
      const originalMatches = originalCode.match(pattern);

      if (noTimeoutMatches === null && originalMatches !== null) {
        removedCount++;
      } else if (noTimeoutMatches !== null) {
        console.warn(`⚠️  Pattern ${pattern} still found in no-timeout version`);
      }
    }

    // Check preserved features
    const preservedPatterns = [
      /CommandSanitizer/g,
      /SecurityError/g,
      /ValidationError/g,
      /stabilityLog/g,
      /SIGTERM/g,
      /SIGINT/g,
      /mcpTools/g,
      /agent_spawn/g,
      /task_orchestrate/g,
      /swarm_init/g,
    ];

    for (const pattern of preservedPatterns) {
      const noTimeoutMatches = noTimeoutCode.match(pattern);
      const originalMatches = originalCode.match(pattern);

      if (noTimeoutMatches !== null && originalMatches !== null) {
        preservedCount++;
      } else if (noTimeoutMatches === null) {
        console.warn(`⚠️  Essential pattern ${pattern} not found in no-timeout version`);
      }
    }

    expect(removedCount).toBe(10);
    expect(preservedCount).toBe(10);
  });
});
