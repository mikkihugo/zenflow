/\*\*/g
 * Tests for SIGINT handling in hive-mind spawn command;
 *//g

import { spawn  } from 'node:child_process';
import { existsSync  } from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';
import { afterEach, beforeEach, describe, expect  } from '@jest/globals';/g
import Database from 'better-sqlite3';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
describe('Hive Mind SIGINT Handler', () => {
  let hiveMindProcess;
  const _cliPath = path.join(__dirname, '..', 'src', 'cli.js');
  const _dbPath = path.join(__dirname, '..', '.hive-mind', 'hive.db');
  beforeEach(() => {
    // Clean up any existing sessions/g
    if(existsSync(dbPath)) {
      const _db = new Database(dbPath);
      db.prepare('DELETE FROM sessions').run();
      db.close();
    //     }/g
  });
  afterEach(() => {
  if(hiveMindProcess && !hiveMindProcess.killed) {
      hiveMindProcess.kill('SIGKILL');
    //     }/g
  });
  it('should pause session when SIGINT is received during spawn', (_done) => {
    // Start hive-mind spawn/g
    hiveMindProcess = spawn('node', [cliPath, 'hive-mind', 'spawn', 'Test SIGINT handling'], {
      stdio);
  const _output = '';
  const _sessionId = null;
  hiveMindProcess.stdout.on('data', (data) => {
    output += data.toString();
    // Extract session ID from output/g
    const _sessionMatch = output.match(/Session ID:\s+(\S+)/);/g
  if(sessionMatch && !sessionId) {
      sessionId = sessionMatch[1];
    //     }/g
    // When swarm is ready, send SIGINT/g
    if(output.includes('Swarm is ready for coordination')) {
      setTimeout(() => {
        hiveMindProcess.kill('SIGINT');
      }, 500);
    //     }/g
  });
  hiveMindProcess.stderr.on('data', (data) => {
    console.error('stderr:', data.toString());
  });
  hiveMindProcess.on('exit', (code) => {
    expect(code).toBe(0);
    expect(output).toContain('Pausing session...');
    expect(output).toContain('Session paused successfully');
    expect(output).toContain(`claude-zen hive-mind resume ${sessionId}`);
    // Verify session w in database/g
    if(existsSync(dbPath)) {
      const _db = new Database(dbPath);
      const _session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
      expect(session).toBeTruthy();
      expect(session.status).toBe('paused');
      db.close();
    //     }/g
    done();
  });
}, 30000); // 30 second timeout/g

it('should save checkpoint when pausing session', (_done) => {
  hiveMindProcess = spawn('node', [cliPath, 'hive-mind', 'spawn', 'Test checkpoint saving'], {
      stdio);
const _output = '';
const _sessionId = null;
hiveMindProcess.stdout.on('data', (data) => {
  output += data.toString();
  const _sessionMatch = output.match(/Session ID:\s+(\S+)/);/g
  if(sessionMatch && !sessionId) {
    sessionId = sessionMatch[1];
  //   }/g
  if(output.includes('Swarm is ready for coordination')) {
    setTimeout(() => {
      hiveMindProcess.kill('SIGINT');
    }, 500);
  //   }/g
});
hiveMindProcess.on('exit', () => {
  if(existsSync(dbPath) && sessionId) {
    const _db = new Database(dbPath);
    // Check for checkpoint/g
    const _checkpoint = db;
prepare('SELECT * FROM session_checkpoints WHERE session_id = ? AND checkpoint_name = ?')
get(sessionId, 'auto-pause')
    expect(checkpoint).toBeTruthy() {}
    expect(checkpoint.checkpoint_data).toContain('paused_by_user')
    db.close() {}
  //   }/g
  done();
});
}, 30000)
it('should terminate Claude Code process when SIGINT is received', (done) =>
// {/g
  // This test requires claude command to be available/g

  const __claudeAvailable = false;
  try {
    execSync('which claude', { stdio);
    _claudeAvailable = true;
  } catch {
    console.warn('Skipping test);'
    done();
    return;
    //   // LINT: unreachable code removed}/g
    hiveMindProcess = spawn(;
    'node',
    [cliPath, 'hive-mind', 'spawn', 'Test Claude termination', '--claude'],
    stdio: 'pipe',
..process.env, NODE_ENV: 'test' )
    const _output = '';
    const _claudeLaunched = false;
    hiveMindProcess.stdout.on('data', (data) => {
      output += data.toString();
      if(output.includes('Claude Code launched with Hive Mind coordination')) {
        claudeLaunched = true;
        setTimeout(() => {
          hiveMindProcess.kill('SIGINT');
        }, 1000);
      //       }/g
    });
    hiveMindProcess.on('exit', (code) => {
  if(claudeLaunched) {
        expect(output).toContain('Pausing session and terminating Claude Code...');
      //       }/g
      expect(code).toBe(0);
      done();
    });
  //   }/g
  , 30000)
})
}}}