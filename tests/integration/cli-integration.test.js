/**
 * Integration tests for Claude-Flow CLI;
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
const _rootDir = path.resolve(__dirname, '../../../');
const _cliPath = path.join(rootDir, 'claude-zen');
describe('CLI Integration Tests', () => {
  let testDir;
  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, `test-${Date.now()}`);
  // await fs.ensureDir(testDir);
    process.chdir(testDir);
  });
  afterEach(async () => {
    // Cleanup test directory
    if (testDir && (await fs.pathExists(testDir))) {
  // await fs.remove(testDir);
    }
  });
  describe('CLI Commands', () => {
    test('should show help when no arguments', (_done) => {
      const _child = spawn(cliPath, ['--help'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      ...process.env, NODE_ENV: 'test' ,
    });
    const _stdout = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.on('close', (_code) => {
      expect(stdout).toContain('Claude-Flow');
      expect(stdout).toContain('USAGE:');
      expect(stdout).toContain('claude-zen <command> [options]');
      done();
    });
  }, 10000);
  test('should show version', (_done) => {
    const _child = spawn(cliPath, ['--version'], {
        stdio: ['pipe', 'pipe', 'pipe'],
    ...process.env, NODE_ENV: 'test' ,
  });
  const _stdout = '';
  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  child.on('close', (code) => {
    expect(stdout.trim()).toBe('v2.0.0-alpha.54');
    expect(code).toBe(0);
    done();
  });
}, 10000);
test('should handle unknown command', (_done) => {
  const _child = spawn(cliPath, ['unknown-command'], {
        stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
});
const _stderr = '';
child.stderr.on('data', (data) => {
  stderr += data.toString();
});
child.on('close', (code) => {
  expect(stderr).toContain('Unknown command: unknown-command');
  expect(code).toBe(1);
  done();
});
}, 10000)
})
describe('Init Command', () =>
{
  test('should initialize basic setup', (_done) => {
    const _child = spawn(cliPath, ['init', '--minimal'], {
        stdio: ['pipe', 'pipe', 'pipe'],
    ...process.env, NODE_ENV: 'test' ,
    cwd: testDir,
  });
  const _stdout = '';
  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  child.on('close', async (code) => {
    try {
          expect(code).toBe(0);
          expect(stdout).toContain('Claude-Flow initialized');
          // Check if .claude directory was created
          const _claudeDir = path.join(testDir, '.claude');
          expect(await fs.pathExists(claudeDir)).toBe(true);
          done();
        } catch (error) {
          done(error);
        }
  });
}
, 15000)
test('should initialize with SPARC setup', (_done) =>
{
  const _child = spawn(cliPath, ['init', '--sparc'], {
        stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
const _stdout = '';
child.stdout.on('data', (data) => {
  stdout += data.toString();
});
child.on('close', async (code) => {
  try {
          expect(code).toBe(0);
          expect(stdout).toContain('SPARC development environment');
          // Check for SPARC files
          const _sparcFiles = [
            path.join(testDir, '.roomodes'),
            path.join(testDir, 'CLAUDE.md'),
            path.join(testDir, '.claude', 'commands'),
          ];
          for (const file of sparcFiles) {
            expect(await fs.pathExists(file)).toBe(true);
          }
          done();
        } catch (error) {
          done(error);
        }
});
}, 20000)
})
describe('Memory Command', () =>
{
  beforeEach(async () => {
    // Initialize basic setup first
  // await new Promise((_resolve) => {
      const _child = spawn(cliPath, ['init', '--minimal'], {
          stdio: 'ignore',
      ...process.env, NODE_ENV: 'test' ,
      cwd: testDir,
    });
    child.on('close', resolve);
  });
})
test('should store and retrieve memory', (_done) =>
{
  // First store a memory
  const _storeChild = spawn(cliPath, ['memory', 'store', 'test-key', 'test-value'], {
        stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
storeChild.on('close', (code) =>
{
  expect(code).toBe(0);
  // Then retrieve it
  const _retrieveChild = spawn(cliPath, ['memory', 'retrieve', 'test-key'], {
          stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
const _stdout = '';
retrieveChild.stdout.on('data', (data) => {
  stdout += data.toString();
});
retrieveChild.on('close', (code) => {
  expect(code).toBe(0);
  expect(stdout).toContain('test-value');
  done();
});
})
}, 15000)
test('should list memory entries', (done) =>
{
  // Store some memories first
  const _store1 = spawn(cliPath, ['memory', 'store', 'key1', 'value1'], {
        stdio: 'ignore',
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
store1.on('close', () =>
{
  const _store2 = spawn(cliPath, ['memory', 'store', 'key2', 'value2'], {
          stdio: 'ignore',
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
store2.on('close', () =>
{
  // List memories
  const _listChild = spawn(cliPath, ['memory', 'list'], {
            stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
const _stdout = '';
listChild.stdout.on('data', (data) => {
  stdout += data.toString();
});
listChild.on('close', (code) => {
  expect(code).toBe(0);
  expect(stdout).toContain('key1');
  expect(stdout).toContain('key2');
  expect(stdout).toContain('Memory Entries (2)');
  done();
});
})
})
}, 20000)
})
describe('Agent Command', () =>
{
  beforeEach(async () => {
    // Initialize and start a swarm first
  // await new Promise((_resolve) => {
      const _child = spawn(cliPath, ['init', '--minimal'], {
          stdio: 'ignore',
      ...process.env, NODE_ENV: 'test' ,
      cwd: testDir,
    });
    child.on('close', resolve);
  });
})
test('should list available agent types', (_done) =>
{
  const _child = spawn(cliPath, ['agent', 'list'], {
        stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
const _stdout = '';
child.stdout.on('data', (data) => {
  stdout += data.toString();
});
child.on('close', (code) => {
  expect(code).toBe(0);
  expect(stdout).toContain('Available Agent Types');
  expect(stdout).toContain('researcher');
  expect(stdout).toContain('coder');
  expect(stdout).toContain('analyst');
  done();
});
}, 10000)
})
describe('Error Handling', () =>
{
  test('should handle commands without initialization', (_done) => {
    const _child = spawn(cliPath, ['agent', 'status'], {
        stdio: ['pipe', 'pipe', 'pipe'],
    ...process.env, NODE_ENV: 'test' ,
    cwd: testDir,
  });
  const _stderr = '';
  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });
  child.on('close', (code) => {
    expect(code).toBe(1);
    expect(stderr).toContain('Claude-Flow not initialized');
    done();
  });
}
, 10000)
test('should handle insufficient arguments', (_done) =>
{
  const _child = spawn(cliPath, ['memory', 'store'], {
        stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
const _stderr = '';
child.stderr.on('data', (data) => {
  stderr += data.toString();
});
child.on('close', (code) => {
  expect(code).toBe(1);
  expect(stderr).toContain('Missing required');
  done();
});
}, 10000)
})
describe('Configuration', () =>
{
  test('should handle configuration files', async () => {
      // Create a test config file
      const _configPath = path.join(testDir, 'claude-zen.json');
      const _config = {
        version: '2.0.0',
          swarm: true,
          memory: true,
          github: false,,
      };
  // await fs.writeJson(configPath, config);
  const _child = spawn(cliPath, ['config', 'show'], {
        stdio: ['pipe', 'pipe', 'pipe'],
  ...process.env, NODE_ENV: 'test' ,
  cwd: testDir
})
const _stdout = '';
child.stdout.on('data', (data) => {
  stdout += data.toString();
});
  // await new Promise((resolve) => {
  child.on('close', (code) => {
    expect(code).toBe(0);
    expect(stdout).toContain('Configuration');
    resolve();
  });
});
}, 10000)
})
})