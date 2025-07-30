/**
 * Hive Mind Import Command Module
 * Converted from JavaScript to TypeScript
 */

import path from 'node:path';
import { glob } from 'glob';
import { createHive } from './hive-mind-command.js';

async function generateScopeFromCode(servicePath = path.basename(servicePath);
return `
---name = path.basename(servicePath);
  const projectJsonPath = path.join(servicePath, 'project.json');

  let scopeMdContent;

  if (existsSync(projectJsonPath)) {
    const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf8'));
    scopeMdContent = `
---name = > `- ${dep}`
).join('\n')}
    `
} else
{
  scopeMdContent = await generateScopeFromCode(servicePath);
}

console.warn(`\n[Suggestion for ${serviceName}]`);
console.warn('------------------');
console.warn(scopeMdContent);
console.warn('------------------');

// This is a placeholder for the interactive prompt
const answer = await new Promise((resolve) => {
  const _readline = import('node:readline').then((rl) => {
    const rlInterface = rl.createInterface({ input => {
        rlInterface.close();
    resolve(answer);
  });
});
})

if (answer.toLowerCase() === 'y') {
  await createHive([serviceName], {path = await glob('services/*', { onlyDirectories: true });

  for (const serviceDir of serviceDirs) {
    await importService(serviceDir);
  }
}
