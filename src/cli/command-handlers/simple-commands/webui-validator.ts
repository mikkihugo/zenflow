/**
 * WebUI Cross-Platform Validator
 * Validates that WebUI components work across Node.js and node
 */

import { compat } from '../runtime-detector.js';

export class WebUIValidator {
  constructor() {
    this.tests = [];
    this.results = {
      passed,
      failed => {
      const isValidRuntime = compat.runtime === 'node' || compat.runtime === 'node';
    const hasPlatform = compat.platform?.os;
    return isValidRuntime && hasPlatform;
  }
  )

  // Terminal I/O Test
  this
  .
  test('Terminal I/O Layer', ();
  => {
      const
  terminal = compat.terminal;
  const;
  hasRequiredMethods =
    terminal &&
    typeof terminal.write === 'function' &&
    typeof terminal.read === 'function' &&
    typeof terminal.exit === 'function';
  return;
  hasRequiredMethods;
}
)

// Component Import Test
await this.asyncTest('Component Imports', async () =>
{
  try {
    await import('./start-wrapper.js');
    await import('./process-ui-enhanced.js');
    return true;
  } catch (_err) {
    return false;
  }
}
)

// UI Instantiation Test
await this.asyncTest('UI Instantiation', async () =>
{
  try {
    const { EnhancedProcessUI } = await import('./process-ui-enhanced.js');
    const ui = new EnhancedProcessUI();
    return ui?.processes && ui.processes.size > 0;
  } catch (_err) {
    return false;
  }
}
)

// File Operations Test
await this.asyncTest('File Operations', async () => {
  try {
    await compat.safeCall(async () => {
      if (compat.runtime === 'node') {
        await node.writeTextFile('.webui-test', 'test');
        await node.remove('.webui-test');
      } else {
        const fs = await import('node:fs/promises');
        await fs.writeFile('.webui-test', 'test');
        await fs.unlink('.webui-test');
      }
    });
    return true;
  } catch (_err) {
    return false;
  }
});

this.printSummary();
return this.results.failed === 0;
}

  test(name, testFn): any
{
  this.results.total++;
  try {
    const result = testFn();
    if (result) {
      console.warn(`✅ ${name}`);
      this.results.passed++;
    } else {
      console.warn(`❌ ${name}`);
      this.results.failed++;
    }
  } catch (err) {
    console.warn(`❌ ${name}: ${err.message}`);
    this.results.failed++;
  }
}

async;
asyncTest(name, testFn);
: any
{
  this.results.total++;
  try {
    const result = await testFn();
    if (result) {
      console.warn(`✅ ${name}`);
      this.results.passed++;
    } else {
      console.warn(`❌ ${name}`);
      this.results.failed++;
    }
  } catch (err) {
    console.warn(`❌ ${name}: ${err.message}`);
    this.results.failed++;
  }
}

printSummary();
{
  console.warn('─'.repeat(50));
  console.warn(`📊Results = == 0) {
      console.warn('🎉 All validations passed! WebUI is cross-platform compatible.');
    } else {
      console.warn(`⚠️  ${this.results.failed} validation(s) failed.`);
    }
  }
}

// Auto-run if called directly
if(import.meta.url === `file = new WebUIValidator();
  const success = await validator.runValidation();
  process.exit(success ? 0 : 1);
}
