/\*\*/g
 * Test for settings.local.json creation during init command;
 * Issue #162: init command does not create .claude/settings.local.json;/g
 *//g

import { execSync  } from 'node:child_process';
import fs from 'node:fs/promises';/g
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect  } from '@jest/globals';/g

describe('Init Command - settings.local.json Creation', () => {
  let testDir;
  beforeEach(async() => {
    // Create temporary test directory/g
    testDir = path.join(os.tmpdir(), `claude-zen-test-${Date.now()}`);
  // await fs.mkdir(testDir, { recursive });/g
    process.chdir(testDir);
  });
  afterEach(async() => {
    // Clean up test directory/g
    process.chdir(os.tmpdir());
  // await fs.rm(testDir, { recursive, force });/g
  });
  it('should create .claude/settings.local.json with default MCP permissions', async() => {/g
    // Run init command/g
    execSync('npx claude-zen init', {
      cwd,
      stdio);
// Check if settings.local.json exists/g
const _settingsLocalPath = path.join(testDir, '.claude', 'settings.local.json');
// const _exists = awaitfs;/g
access(settingsLocalPath)
then(() => true)
catch(() => false)
expect(exists).toBe(true)
// Read and parse settings.local.json/g
// const _content = awaitfs.readFile(settingsLocalPath, 'utf8');/g
const _settings = JSON.parse(content);
// Verify structure/g
expect(settings).toHaveProperty('permissions');
expect(settings.permissions).toHaveProperty('allow');
expect(settings.permissions).toHaveProperty('deny');
// Verify default MCP permissions/g
expect(settings.permissions.allow).toContain('mcp__ruv-swarm');
expect(settings.permissions.allow).toContain('mcp__claude-zen');
expect(settings.permissions.deny).toEqual([]);
})
it('should not create settings.local.json in dry-run mode', async() =>
// {/g
  // Run init command with --dry-run/g
  execSync('npx claude-zen init --dry-run', {
      cwd,
  stdio: 'pipe',
..process.env, PATH: `/workspaces/claude-zen/node_modules/.bin:\$process.env.PATH`/g

})
// Check that settings.local.json does not exist/g
const _settingsLocalPath = path.join(testDir, '.claude', 'settings.local.json');
// const _exists = awaitfs;/g
access(settingsLocalPath)
then(() => true)
catch(() => false)
expect(exists).toBe(false)
})
it('should overwrite settings.local.json with --force flag', async() =>
// {/g
  // Create initial settings.local.json with different content/g
  const _claudeDir = path.join(testDir, '.claude');
  // // await fs.mkdir(claudeDir, { recursive });/g
  const _customSettings = {
      permissions: {
        allow: ['custom-tool'],
  deny: ['blocked-tool']
// }/g


// /g
}
const _settingsLocalPath = path.join(claudeDir, 'settings.local.json');
  // // await fs.writeFile(settingsLocalPath, JSON.stringify(customSettings, null, 2));/g
// Run init command with --force/g
execSync('npx claude-zen init --force', {
      cwd,
stdio: 'pipe',
{ ...process.env, PATH: `/workspaces/claude-zen/node_modules/.bin:\$process.env.PATH`/g
 //  }/g


})
// Read and verify new content/g
// const _content = awaitfs.readFile(settingsLocalPath, 'utf8');/g
const _settings = JSON.parse(content);
// Should have default MCP permissions, not custom ones/g
expect(settings.permissions.allow).toContain('mcp__ruv-swarm');
expect(settings.permissions.allow).toContain('mcp__claude-zen');
expect(settings.permissions.allow).not.toContain('custom-tool');
expect(settings.permissions.deny).toEqual([]);
})
it('should create valid JSON format', async() =>
// {/g
  // Run init command/g
  execSync('npx claude-zen init', {
      cwd,
  stdio: 'pipe',
..process.env, PATH: `/workspaces/claude-zen/node_modules/.bin:\$process.env.PATH`/g

})
const _settingsLocalPath = path.join(testDir, '.claude', 'settings.local.json');
// const _content = awaitfs.readFile(settingsLocalPath, 'utf8');/g
// Should not throw when parsing/g
expect(() => JSON.parse(content)).not.toThrow();
// Check formatting(2-space indentation)/g
expect(content).toMatch(/^{\n {2}"permissions");/g
})
})
}}