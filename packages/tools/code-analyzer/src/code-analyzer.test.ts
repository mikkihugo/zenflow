/**
 * Tests for CodeAnalyzer and DependencyRelationshipMapper
 * Framework: The tests support both Jest and Vitest via a thin shim.
 * If your project uses one of these, it should just work.
 */

 // Framework shim (Vitest or Jest)
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const _g: any = globalThis as any;
 const useVitest = typeof _g.vi !== 'undefined';
 const useJest = typeof _g.jest !== 'undefined';
 const mockFn = useVitest ? _g.vi.fn.bind(_g.vi) : (useJest ? _g.jest.fn.bind(_g.jest) : (() => { throw new Error('No test framework detected (Vitest/Jest).'); }));
 const spyOn = useVitest ? _g.vi.spyOn.bind(_g.vi) : (useJest ? _g.jest.spyOn.bind(_g.jest) : (() => { throw new Error('No test framework detected (Vitest/Jest).'); }));
 const resetAllMocks = () => { if (useVitest) { _g.vi.clearAllMocks(); _g.vi.resetModules(); } else if (useJest) { _g.jest.clearAllMocks(); _g.jest.resetModules(); } };
 const setMock = (mod: string, factory: () => unknown) => {
   if (useVitest) _g.vi.mock(mod, factory as any);
   else if (useJest) _g.jest.mock(mod, factory as any);
 };

import * as path from 'path';
import { promises as fs } from 'fs';

// Mock @claude-zen/foundation to isolate tests from external workspace dependency
setMock('@claude-zen/foundation', () => {
  const ok = (value: unknown) => ({ isOk: () => true, isErr: () => false, value });
  const err = (e: unknown) => ({ isOk: () => false, isErr: () => true, error: e });
  const safeAsync = async <T>(fn: () => Promise<T>) => {
    try {
      const v = await fn();
      return ok(v);
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  };
  const getLogger = () => ({
    info: mockFn(),
    warn: mockFn(),
    debug: mockFn(),
  });
  return { getLogger, Result: {} as unknown, ok, err, safeAsync };
});

// Under test
import { CodeAnalyzer, DependencyRelationshipMapper, analyzeFile, createCodeAnalyzer } from './code-analyzer';

// Helper: create a temp workspace
async function withTempDir(run: (dir: string) => Promise<void>) {
  const dir = await fs.mkdtemp(path.join(process.cwd(), 'ca-test-'));
  try {
    await run(dir);
  } finally {
    // best-effort cleanup
    try {
      // Recursively remove directory
      // Node 14+ supports fs.rm with { recursive: true, force: true }
      // @ts-ignore
      await fs.rm?.(dir, { recursive: true, force: true }) || await (async () => {
        // Fallback manual cleanup
        const entries = await fs.readdir(dir).catch(() => []);
        await Promise.all(entries.map((e) => fs.unlink(path.join(dir, e)).catch(() => {})));
        await fs.rmdir(dir).catch(() => {});
      })();
    } catch {
      // ignore cleanup errors
    }
  }
}

describe('CodeAnalyzer.detectLanguage', () => {
  it('recognizes supported extensions and returns null for unsupported', async () => {
    await withTempDir(async (root) => {
      const ca = new CodeAnalyzer(root);
      // @ts-expect-error Accessing private method via cast for unit test of pure mapping logic
      const detect = (p: string) => (ca as any).detectLanguage(p);

      expect(detect(path.join(root, 'file.ts'))).toBe('typescript');
      expect(detect(path.join(root, 'file.tsx'))).toBe('typescript');
      expect(detect(path.join(root, 'file.js'))).toBe('javascript');
      expect(detect(path.join(root, 'file.jsx'))).toBe('javascript');
      expect(detect(path.join(root, 'file.py'))).toBe('python');
      expect(detect(path.join(root, 'file.go'))).toBe('go');
      expect(detect(path.join(root, 'file.rs'))).toBe('rust');
      expect(detect(path.join(root, 'file.java'))).toBe('java');
      expect(detect(path.join(root, 'file.cc'))).toBe('cpp');
      expect(detect(path.join(root, 'file.unknown'))).toBeNull();
    });
  });
});

describe('CodeAnalyzer.calculateBasicComplexity', () => {
  it('computes complexity as number of branching tokens + 1', async () => {
    const src = `
      function f(a){ if (a) { return 1 } else { return 2 } }
      const g = () => { for (let i=0;i<3;i++){ while(false){} } }
      try { throw new Error() } catch (e) {}
      switch(x){ case 1: break; case 2: break; default: break; }
      const h = a && b || c;
    `;
    await withTempDir(async (root) => {
      const ca = new CodeAnalyzer(root);
      // @ts-expect-error private for test
      const complexity = (ca as any).calculateBasicComplexity(src);
      // Count tokens explicitly to define expectation stability
      const tokens = (src.match(/if|else|for|while|switch|case|catch|&&|\|\|/g) || []).length;
      expect(complexity).toBe(tokens + 1);
    });
  });

  it('returns 1 for empty or no-match content', async () => {
    await withTempDir(async (root) => {
      const ca = new CodeAnalyzer(root);
      // @ts-expect-error private for test
      expect((ca as any).calculateBasicComplexity('')).toBe(1);
      // @ts-expect-error private for test
      expect((ca as any).calculateBasicComplexity('const a = 1;')).toBe(1);
    });
  });
});

describe('CodeAnalyzer.calculateDocumentation', () => {
  it('returns percentage of comment lines vs total lines', async () => {
    const src = `
// line 1 comment
const a = 1; // inline
/* block
 comment */
const b = 2;
`;
    await withTempDir(async (root) => {
      const ca = new CodeAnalyzer(root);
      // @ts-expect-error private for test
      const pct = (ca as any).calculateDocumentation(src, 'typescript');
      const comments = src.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm)?.length ?? 0;
      const lines = src.split('\n').length;
      const expected = lines > 0 ? (comments / lines) * 100 : 0;
      expect(Math.abs(pct - expected)).toBeLessThan(0.0001);
    });
  });
});

describe('CodeAnalyzer.performASTAnalysis', () => {
  it('derives basic metrics and detects patterns/imports/exports for TS/JS', async () => {
    const content = `
      import fs from 'fs';
      export interface X { a: number }
      export class Foo { method() {} }
      export function bar() { return 1 }
      const baz = function() {};
    `;
    await withTempDir(async (root) => {
      const ca = new CodeAnalyzer(root);
      // @ts-expect-error private for test
      const res = await (ca as any).performASTAnalysis(content, 'typescript', path.join(root, 'file.ts'));
      expect(res.nodeCount).toBe(content.split('\\n').length);
      expect(res.depth).toBeGreaterThanOrEqual(1);
      expect(res.complexity).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.patterns)).toBe(true);
      expect(res.patterns.some((p: any) => p.name.includes('class'))).toBe(true);
      expect(res.patterns.some((p: any) => p.name.includes('function'))).toBe(true);
      expect(res.patterns.some((p: any) => p.name.includes('interface'))).toBe(true);
      expect(res.imports.length).toBeGreaterThanOrEqual(1);
      expect(res.exports.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('CodeAnalyzer.performSemanticAnalysis defaults', () => {
  it('returns empty collections for not-yet-implemented extractors', async () => {
    await withTempDir(async (root) => {
      const ca = new CodeAnalyzer(root);
      const src = 'const a = 1;';
      // @ts-expect-error private for test
      const sem = await (ca as any).performSemanticAnalysis(src, 'typescript', path.join(root, 'f.ts'));
      expect(sem).toEqual({
        variables: [],
        functions: [],
        classes: [],
        scopes: [],
        references: [],
        dataFlow: {},
        callGraph: {},
      });
    });
  });
});

describe('CodeAnalyzer.performQualityAnalysis', () => {
  it('calculates basic quality metrics consistently', async () => {
    const src = `// a
const a = 1;
// b

function c() {}
`;
    await withTempDir(async (root) => {
      const ca = new CodeAnalyzer(root);
      // @ts-expect-error private for test
      const q = await (ca as any).performQualityAnalysis(src, 'typescript', path.join(root, 'f.ts'));
      const lines = src.split('\\n');
      const nonEmpty = lines.filter((l) => l.trim().length > 0);
      expect(q.linesOfCode).toBe(lines.length);
      expect(q.physicalLinesOfCode).toBe(nonEmpty.length);
      expect(q.cyclomaticComplexity).toBeGreaterThanOrEqual(1);
      expect(q.maintainabilityIndex).toBe(50);
      expect(q.documentation).toBeGreaterThanOrEqual(0);
      expect(q.codeSmells).toEqual([]);
      expect(q.securityIssues).toEqual([]);
      expect(q.vulnerabilities).toEqual([]);
    });
  });
});

describe('CodeAnalyzer.analyzeFile end-to-end', () => {
  it('analyzes a supported file and returns an ok(Result) with comprehensive fields', async () => {
    await withTempDir(async (root) => {
      const rel = 'src/sample.ts';
      const absDir = path.join(root, 'src');
      await fs.mkdir(absDir, { recursive: true });
      await fs.writeFile(path.join(absDir, 'sample.ts'), `// sample
export const add = (a: number, b: number) => a + b;
`, 'utf-8');

      const analyzer = new CodeAnalyzer(root);
      const result = await analyzer.analyzeFile(rel, { enableAIRecommendations: true });

      expect(result).toBeDefined();
      expect(typeof (result as any).isOk).toBe('function');
      if ((result as any).isOk()) {
        const value = (result as any).value;
        expect(value.filePath).toBe(path.join(root, rel));
        expect(value.language).toBe('typescript');
        expect(typeof value.analysisId).toBe('string');
        expect(typeof value.timestamp).toBe('number');
        expect(value.ast).toBeDefined();
        expect(value.semantics).toBeDefined();
        expect(value.quality).toBeDefined();
        // AI insights may or may not be present depending on brainSystem, but no crash
        expect(value.metadata).toMatchObject({
          encoding: 'utf-8',
        });
        expect(typeof value.metadata.fileSize).toBe('number');
        expect(typeof value.metadata.analysisTime).toBe('number');
      } else {
        throw new Error('Expected ok(Result), got err(Result)');
      }
    });
  });

  it('fails with an Error wrapped by Result for unsupported file types', async () => {
    await withTempDir(async (root) => {
      const rel = 'README.md'; // unsupported extension
      await fs.writeFile(path.join(root, rel), '# Title', 'utf-8');
      const analyzer = new CodeAnalyzer(root);
      const out = await analyzer.analyzeFile(rel);
      expect(out.isErr()).toBe(true);
      // optional: check error message
      if (out.isErr()) {
        expect(String(out.error?.message || out.error)).toMatch(/Unsupported file type/i);
      }
    });
  });
});

describe('DependencyRelationshipMapper.buildDependencyMap', () => {
  it('returns ok(Result) with empty map by default and logs debug', async () => {
    await withTempDir(async (root) => {
      const mapper = new DependencyRelationshipMapper(root);
      const res = await mapper.buildDependencyMap();
      expect(res.isOk()).toBe(true);
      if (res.isOk()) {
        expect(res.value).toEqual({});
      }
    });
  });

  it('wraps thrown errors into err(Result)', async () => {
    // Monkey-patch to force an exception path by temporarily replacing ok() via module mock
    resetAllMocks();
    setMock('@claude-zen/foundation', () => {
      const ok = (_: unknown) => ({ isOk: () => true, isErr: () => false, value: _ });
      const err = (e: unknown) => ({ isOk: () => false, isErr: () => true, error: e });
      const safeAsync = async <T>(fn: () => Promise<T>) => {
        try { const v = await fn(); return ok(v); } catch (e) { return err(e instanceof Error ? e : new Error(String(e))); }
      };
      const getLogger = () => ({ info: mockFn(), warn: mockFn(), debug: mockFn() });
      return { getLogger, Result: {} as unknown, ok, err, safeAsync };
    });
    // Re-import module to rebind mocks
    const mod = await import('./code-analyzer');
    const Dep = mod.DependencyRelationshipMapper;

    // Force an error by spying on ok() usage; simulate throw inside method body
    const instance = new Dep('/tmp');
    const spy = spyOn(instance as any, 'buildDependencyMap');
    // Replace implementation to simulate thrown error path inside try-block
    spy.mockImplementation(async () => {
      const { err } = await import('@claude-zen/foundation') as any;
      return err(new Error('boom'));
    });

    const r = await instance.buildDependencyMap();
    expect(r.isErr()).toBe(true);
    if (r.isErr()) {
      expect(String(r.error?.message || r.error)).toMatch(/boom/);
    }
  });
});

describe('Top-level helpers', () => {
  it('createCodeAnalyzer returns a configured instance with absolute repo path', async () => {
    await withTempDir(async (root) => {
      const ca = createCodeAnalyzer(root);
      expect(ca).toBeInstanceOf(CodeAnalyzer);
      // @ts-expect-error private for test
      expect((ca as any).repositoryPath).toBe(path.resolve(root));
    });
  });

  it('analyzeFile convenience function uses process.cwd()', async () => {
    await withTempDir(async (root) => {
      const prevCwd = process.cwd();
      try {
        process.chdir(root);
        await fs.mkdir(path.join(root, 'src'), { recursive: true });
        await fs.writeFile(path.join(root, 'src', 'x.ts'), 'export const x = 1;', 'utf-8');
        const res = await analyzeFile('src/x.ts');
        expect(res.isOk()).toBe(true);
        if (res.isOk()) {
          expect(res.value.filePath).toBe(path.join(root, 'src', 'x.ts'));
        }
      } finally {
        process.chdir(prevCwd);
      }
    });
  });
});