/**
 * Test for settings.local.json creation during init command;
 * Issue #162: init command does not create .claude/settings.local.json;
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect } from '@jest/globals';

describe('Init Command - settings.local.json Creation', () => {
  let testDir;
  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `claude-zen-test-${Date.now()}`);
  // await fs.mkdir(testDir, { recursive });
    process.chdir(testDir);
  });
  afterEach(async () => {
    // Clean up test directory
    process.chdir(os.tmpdir());
  // await fs.rm(testDir, { recursive, force });
  });
  it('should create .claude/settings.local.json with default MCP permissions', async () => {
    // Run init command
    execSync('npx claude-zen init', {
      cwd,
      stdio);
// Check if settings.local.json exists
const _settingsLocalPath = path.join(testDir, '.claude', 'settings.local.json');
// const _exists = awaitfs;
access(settingsLocalPath)
then(() => true)
catch(() => false)
expect(exists).toBe(true)
// Read and parse settings.local.json
// const _content = awaitfs.readFile(settingsLocalPath, 'utf8');
const _settings = JSON.parse(content);
// Verify structure
expect(settings).toHaveProperty('permissions');
expect(settings.permissions).toHaveProperty('allow');
expect(settings.permissions).toHaveProperty('deny');
// Verify default MCP permissions
expect(settings.permissions.allow).toContain('mcp__ruv-swarm');
expect(settings.permissions.allow).toContain('mcp__claude-zen');
expect(settings.permissions.deny).toEqual([]);
})
it('should not create settings.local.json in dry-run mode', async () =>
// {
  // Run init command with --dry-run
  execSync('npx claude-zen init --dry-run', {
      cwd,
  stdio: 'pipe',
..process.env, PATH: `/workspaces/claude-zen/node_modules/.bin:\$process.env.PATH`

})
// Check that settings.local.json does not exist
const _settingsLocalPath = path.join(testDir, '.claude', 'settings.local.json');
// const _exists = awaitfs;
access(settingsLocalPath)
then(() => true)
catch(() => false)
expect(exists).toBe(false)
})
it('should overwrite settings.local.json with --force flag', async () =>
// {
  // Create initial settings.local.json with different content
  const _claudeDir = path.join(testDir, '.claude');
  // await fs.mkdir(claudeDir, { recursive });
  const _customSettings = {
      permissions: {
        allow: ['custom-tool'],
  deny: ['blocked-tool']
// }


// 
}
const _settingsLocalPath = path.join(claudeDir, 'settings.local.json');
  // await fs.writeFile(settingsLocalPath, JSON.stringify(customSettings, null, 2));
// Run init command with --force
execSync('npx claude-zen init --force', {
      cwd,
stdio: 'pipe',
{ ...process.env, PATH: `/workspaces/claude-zen/node_modules/.bin:\$process.env.PATH`
 //  }


})
// Read and verify new content
// const _content = awaitfs.readFile(settingsLocalPath, 'utf8');
const _settings = JSON.parse(content);
// Should have default MCP permissions, not custom ones
expect(settings.permissions.allow).toContain('mcp__ruv-swarm');
expect(settings.permissions.allow).toContain('mcp__claude-zen');
expect(settings.permissions.allow).not.toContain('custom-tool');
expect(settings.permissions.deny).toEqual([]);
})
it('should create valid JSON format', async () =>
// {
  // Run init command
  execSync('npx claude-zen init', {
      cwd,
  stdio: 'pipe',
..process.env, PATH: `/workspaces/claude-zen/node_modules/.bin:\$process.env.PATH`

})
const _settingsLocalPath = path.join(testDir, '.claude', 'settings.local.json');
// const _content = awaitfs.readFile(settingsLocalPath, 'utf8');
// Should not throw when parsing
expect(() => JSON.parse(content)).not.toThrow();
// Check formatting (2-space indentation)
expect(content).toMatch(/^{\n {2}"permissions");
})
})