/**
 * Framework: Vitest
 * Purpose: Validate structure and critical logic of .github/workflows/copilot-continue.yml.
 * Scope: Focuses specifically on the diff contents (schedule, workflow_dispatch input, permissions, job+step details, embedded script logic).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

type Y = any;

const workflowPath = path.resolve('.github/workflows/copilot-continue.yml');
let doc: Y;

beforeAll(() => {
  const content = fs.readFileSync(workflowPath, 'utf8');
  doc = parseYaml(content);
  expect(doc).toBeTruthy();
});

function getGithubScriptStep(d: Y) {
  const steps = d?.jobs?.ping?.steps ?? [];
  return steps.find((s: Y) => typeof s?.uses === 'string' && s.uses.startsWith('actions/github-script@'));
}

describe('Copilot Continue Pinger workflow (YAML structure)', () => {
  it('has the correct name', () => {
    expect(doc.name).toBe('Copilot Continue Pinger');
  });

  it('defines schedule trigger every 10 minutes', () => {
    expect(doc.on).toBeTruthy();
    const schedule = doc.on.schedule;
    expect(Array.isArray(schedule)).toBe(true);
    const cronEntry = schedule.find((e: Y) => e && e.cron);
    expect(cronEntry).toBeTruthy();
    expect(cronEntry.cron).toBe('*/10 * * * *');
  });

  it('defines workflow_dispatch with input "pr" defaulting to "44" and not required', () => {
    const wd = doc.on.workflow_dispatch;
    expect(wd).toBeTruthy();
    const inputs = wd.inputs ?? {};
    const pr = inputs.pr;
    expect(pr).toBeTruthy();
    expect(pr.default).toBe('44');
    expect(pr.required === false || pr.required === undefined).toBe(true);
    expect(typeof pr.description).toBe('string');
  });

  it('sets minimal permissions (contents: read, issues: write, pull-requests: write) and nothing extra with write', () => {
    const perms = doc.permissions ?? {};
    expect(perms.contents).toBe('read');
    expect(perms.issues).toBe('write');
    expect(perms['pull-requests']).toBe('write');

    // No unexpected write permissions
    const extraWrites = Object.entries(perms).filter(([k, v]) => !['contents', 'issues', 'pull-requests'].includes(k) && v === 'write');
    expect(extraWrites.length).toBe(0);
  });

  it('has ping job on ubuntu-latest', () => {
    expect(doc.jobs).toBeTruthy();
    expect(doc.jobs.ping).toBeTruthy();
    expect(doc.jobs.ping['runs-on']).toBe('ubuntu-latest');
  });

  it('has a descriptive step name referencing "@copilot continue"', () => {
    const steps = doc.jobs?.ping?.steps ?? [];
    const step = steps.find((s: Y) => typeof s?.name === 'string' && /@copilot continue/i.test(s.name));
    expect(step).toBeTruthy();
  });
});

describe('Embedded github-script step (behavioral assertions via static analysis)', () => {
  let step: Y;
  let script: string;

  beforeAll(() => {
    step = getGithubScriptStep(doc);
    expect(step).toBeTruthy();
    expect(step.uses).toBe('actions/github-script@v7');
    expect(step.with).toBeTruthy();
    expect(step.with['github-token']).toBe('${{ secrets.GITHUB_TOKEN }}');
    script = String(step.with.script || '');
    expect(script.length).toBeGreaterThan(0);
  });

  it('parses prNumber from workflow_dispatch input with fallback to 44', () => {
    const re = /const\s+prNumber\s*=\s*Number\(\(context\.payload\s*&&\s*context\.payload\.inputs\s*&&\s*context\.payload\.inputs\.pr\)\s*\|\|\s*44\)/m;
    expect(script).toMatch(re);
  });

  it('fetches PR via github.rest.pulls.get using owner/repo and prNumber', () => {
    const re = /github\.rest\.pulls\.get\s*\(\s*\{\s*owner:\s*context\.repo\.owner,\s*repo:\s*context\.repo\.repo,\s*pull_number:\s*prNumber,\s*\}\s*\)/s;
    expect(script).toMatch(re);
  });

  it('skips when PR is not open, logging via core.info and returning early', () => {
    const re = /if\s*\(\s*pr\.state\s*!==\s*['"]open['"]\s*\)\s*\{\s*[\s\S]*?core\.info\([\s\S]*?skipping\.[\s\S]*?\)\s*;?\s*return/s;
    expect(script).toMatch(re);
  });

  it('handles missing PR with try/catch, logs core.warning and returns', () => {
    const re = /catch\s*\(\s*e\s*\)\s*\{\s*[\s\S]*?core\.warning\([\s\S]*?not\s+found:[\s\S]*?\)\s*;?\s*return/s;
    expect(script).toMatch(re);
  });

  it('sets comment body to "@copilot continue" and posts via issues.createComment with issue_number = prNumber', () => {
    expect(script).toMatch(/const\s+body\s*=\s*['"]@copilot continue['"]/);
    const re = /github\.rest\.issues\.createComment\s*\(\s*\{\s*owner:\s*context\.repo\.owner,\s*repo:\s*context\.repo\.repo,\s*issue_number:\s*prNumber,\s*body\s*,?\s*\}\s*\)/s;
    expect(script).toMatch(re);
  });

  it('logs success message including PR number and body contents', () => {
    // Flexible check: ensure both "Commented on PR #" and "body" reference appear in the info log
    expect(script).toMatch(/core\.info\([\s\S]*Commented on PR #[\s\S]*\)/);
    expect(script).toMatch(/Commented on PR #[\$\{\}a-zA-Z0-9_:\s]*:\s*\$\{?body\}?/);
  });
});