import { glob } from 'glob';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function scanForMissingScopeFiles(flags) {
  const serviceDirs = await glob('services/*', { onlyDirectories: true });
  const suggestions = [];

  for (const dir of serviceDirs) {
    const scopeFilePath = path.join(dir, 'scope.md');
    try {
      await readFile(scopeFilePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const generatedScope = await generateText(`Generate a scope.md file for a service located at ${dir}. The service name is ${path.basename(dir)}.`);
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
