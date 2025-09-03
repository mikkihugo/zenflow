/**
  Repository/document validation tests for "Event System Unification — Tracking Issue".

  Test framework: Runner-agnostic (Vitest or Jest). We only use global describe/it/expect.
  - If Vitest is configured, globals (describe/it/expect) are provided by Vitest.
  - If Jest is configured, globals (describe/it/expect) are provided by Jest.
  No runner-specific APIs are used.

  Scope:
  - Validate the presence and key assertions of the tracking document at:
      docs/issues/event-system-unification/00-tracking-issue.test.ts
  - Enforce repository invariants explicitly claimed by the document (e.g., no more
    "@claude-zen/event-system" imports in code).
*/

import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const DOC_REL_PATH = "docs/issues/event-system-unification/00-tracking-issue.test.ts";
const DOC_ABS_PATH = path.join(ROOT, DOC_REL_PATH);

function readText(p: string): string {
  return fs.readFileSync(p, "utf8");
}

// Simple, dependency-free recursive walker with sensible ignores.
function walkFiles(
  dir: string,
  {
    ignoreDirs = new Set<string>([
      "node_modules",
      ".git",
      "dist",
      "build",
      "coverage",
      ".next",
      "out",
      ".turbo",
      ".cache",
      "tmp",
      "vendor",
      "ios",
      "android",
      "Pods",
      "target",
      "cypress",
      "playwright-report",
      "reports",
      // IMPORTANT: exclude docs so the backticked string in the tracking doc doesn't trip the invariant test
      "docs",
    ]),
    exts = new Set<string>([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".yml", ".yaml"]),
    sizeLimitBytes = 2 * 1024 * 1024, // skip very large files
  } = {}
): string[] {
  const results: string[] = [];
  const stack: string[] = [dir];
  while (stack.length) {
    const current = stack.pop()!;
    let ents: fs.Dirent[];
    try {
      ents = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of ents) {
      const p = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (!ignoreDirs.has(ent.name)) stack.push(p);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name);
        if (exts.has(ext)) {
          try {
            const stat = fs.statSync(p);
            if (stat.size <= sizeLimitBytes) {
              results.push(p);
            }
          } catch {
            // ignore unreadable files
          }
        }
      }
    }
  }
  return results;
}

describe("Event System Unification tracking document", () => {
  it("exists at the expected path", () => {
    const exists = fs.existsSync(DOC_ABS_PATH);
    expect(exists).toBe(true);
  });

  it("contains the expected heading and status markers", () => {
    const text = readText(DOC_ABS_PATH);
    expect(text).toMatch(/^\s*#\s*Event System Unification — Tracking Issue/m);
    // Be robust to emojis/formatting variations
    expect(text).toMatch(/STATUS:\s*COMPLETE/i);
    expect(text).toMatch(/VALIDATION COMPLETED/i);
    expect(text).toMatch(/SUCCESS METRICS/i);
    expect(text).toMatch(/Mission Accomplished/i);
  });

  it("documents key unification claims relevant to architecture", () => {
    const text = readText(DOC_ABS_PATH);
    // Foundation-based event system
    expect(text).toMatch(/foundation[-\s]based event system/i);
    expect(text).toMatch(/EventBus/i);
    expect(text).toMatch(/EventLogger/i);
    // Deprecated package should be gone from code (handled in repository invariant test)
    expect(text).toMatch(/0\s+Garbage References.*@claude-zen\/event-system/i);
  });
});

describe("Repository invariants asserted by the tracking document", () => {
  it("has no lingering '@claude-zen/event-system' imports or references in code", () => {
    const matches: Array<{ file: string; line: number; snippet: string }> = [];
    const files = walkFiles(ROOT);
    const pattern = /@claude-zen\/event-system/;
    for (const f of files) {
      const content = readText(f);
      if (pattern.test(content)) {
        // Record up to a small sample of offending lines
        const lines = content.split(/\r?\n/);
        lines.forEach((ln, idx) => {
          if (pattern.test(ln)) {
            matches.push({ file: path.relative(ROOT, f), line: idx + 1, snippet: ln.trim() });
          }
        });
      }
    }

    // Helpful debug output when failing
    if (matches.length > 0) {
      // eslint-disable-next-line no-console
      console.warn("[Deprecated references found]", matches.slice(0, 10));
    }

    expect(matches.length).toBe(0);
  });

  it("optionally verifies '@claude-zen/web-dashboard' package presence if part of this workspace", () => {
    // Dynamically discover the package; skip the check if absent to avoid false negatives in partial checkouts.
    function findPackageJsons(start: string): string[] {
      const files: string[] = [];
      const stack = [start];
      const IGNORES = new Set(["node_modules", ".git", "dist", "build", "coverage", "docs"]);
      while (stack.length) {
        const dir = stack.pop()!;
        let ents: fs.Dirent[];
        try {
          ents = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const e of ents) {
          const p = path.join(dir, e.name);
          if (e.isDirectory()) {
            if (!IGNORES.has(e.name)) stack.push(p);
          } else if (e.isFile() && e.name === "package.json") {
            files.push(p);
          }
        }
      }
      return files;
    }

    const pkgFiles = findPackageJsons(ROOT);
    let hasDashboard = false;
    for (const pkgPath of pkgFiles) {
      try {
        const json = JSON.parse(readText(pkgPath));
        if (json && json.name === "@claude-zen/web-dashboard") {
          hasDashboard = true;
          break;
        }
      } catch {
        // ignore invalid JSON
      }
    }

    const t = (hasDashboard ? it : it.skip) as typeof it;
    t("workspace contains '@claude-zen/web-dashboard' package as referenced by the doc", () => {
      expect(hasDashboard).toBe(true);
    });
  });
});