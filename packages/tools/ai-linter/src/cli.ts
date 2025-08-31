#!/usr/bin/env node
/**
 * Minimal CLI for @claude-zen/ai-linter
 */
import { createAILinter } from './index.js';

/* eslint-disable no-console */
const log = {
  info: (...args: unknown[]) => console.log('[ai-lint]', ...args),
  error: (...args: unknown[]) => console.error('[ai-lint]', ...args),
};
/* eslint-enable no-console */

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  const files: string[] = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      args[k] = v ?? true;
    } else {
      files.push(a);
    }
  }
  return { args, files };
}

type MinimalResult = {
  filePath: string;
  originalErrors: number;
  fixedErrors: number;
};
function toSarif(results: MinimalResult[]) {
  return {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: '@claude-zen/ai-linter',
            informationUri: 'https://github.com/',
            version: '1.0.0',
          },
        },
        results: results.flatMap((r) => {
          if (!r || !r.originalErrors) return [];
          // We only encode a summary entry for now
          return [
            {
              ruleId: 'ai-lint-summary',
              level: r.fixedErrors < r.originalErrors ? 'warning' : 'note',
              message: {
                text: `File ${r.filePath}: fixed ${r.fixedErrors}/${r.originalErrors} issues","
              },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: r.filePath },
                  },
                },
              ],
            },
          ];
        }),
      },
    ],
  };
}

async function main() {
  const { args, files } = parseArgs(process.argv);
  const format = (args.format as string) || 'json';
  const aiMode = (args.model as string) || 'gpt-4.1';

  const linter = createAILinter({ aiMode });

  let targetFiles = files;
  if (targetFiles.length === 0) {
    const discovered = await linter.discoverFiles();
    if (discovered.success) targetFiles = discovered.data;
  }

  const batch = await linter.processBatch(targetFiles);

  if (!batch.success) {
    log.error('Failed:', batch.error);
    process.exit(2);
  }

  const { data } = batch;
  if (format === 'sarif') {
    log.info(JSON.stringify(toSarif(data.results as MinimalResult[]), null, 2));
  } else {
    log.info(JSON.stringify(data, null, 2));
  }

  // Exit code: 0 if no failures, 1 if any failure
  process.exit(data.failureCount > 0 ? 1 : 0);
}

main().catch((error) => {
  log.error('Unexpected error:', error);
  process.exit(2);
});
