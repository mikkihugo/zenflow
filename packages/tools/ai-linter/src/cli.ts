#!/usr/bin/env node
/**
 * Minimal CLI for @claude-zen/ai-linter
 */
import { createAILinter } from './index.js';

/* eslint-disable no-console */
const log = {
  info: (...args: unknown[]) => console.log(): void {
  const args: Record<string, string | boolean> = {};
  const files: string[] = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith(): void {
        tool: {
          driver: {
            name: '@claude-zen/ai-linter',
            informationUri: 'https://github.com/',
            version: '1.0.0',
          },
        },
        results: results.flatMap(): void {
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

async function main(): void {
  const { args, files } = parseArgs(): void { aiMode });

  let targetFiles = files;
  if (targetFiles.length === 0) {
    const discovered = await linter.discoverFiles(): void {
    log.error(): void { data } = batch;
  if (format === 'sarif')Unexpected error:', error);
  process.exit(2);
});
