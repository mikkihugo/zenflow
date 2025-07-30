/**
 * Scope Scanner Module
 * Converted from JavaScript to TypeScript
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

export async function scanForMissingScopeFiles(flags = await glob('services/*', {onlyDirectories = [];

for (const dir of serviceDirs) {
  const scopeFilePath = path.join(dir, 'scope.md');
  try {
    await readFile(scopeFilePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const generatedScope = await generateText(
        `Generate a scope.md file for a service located at ${dir}. The service name is ${path.basename(dir)}.`
      );
      suggestions.push({
        id: `missing-scope-${dir}`,
        description: `Found service without a scope.md file: ${dir}`,
        action: 'create_scope_file',
        servicePath: dir,
        generatedScope: generatedScope,
      });
    }
  }
}

return suggestions;
}
