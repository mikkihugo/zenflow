import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { createHive } from './hive-mind-command.js';

async function generateScopeFromCode(servicePath) {
  // This is a placeholder for a more sophisticated AI-based analysis.
  // In a real implementation, we would use an LLM to analyze the code.
  const serviceName = path.basename(servicePath);
  return `
---
name: "${serviceName}"
description: "(Generated from code analysis)"
---

### Core Responsibilities

- (Inferred from code)

### Boundaries and Dependencies

- (Inferred from code)
  `;
}

async function importService(servicePath) {
  const serviceName = path.basename(servicePath);
  const projectJsonPath = path.join(servicePath, 'project.json');

  let scopeMdContent;

  if (existsSync(projectJsonPath)) {
    const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf8'));
    scopeMdContent = `
---
name: "${serviceName}"
description: "${projectJson.description || ''}"
---

### Dependencies

${(projectJson.implicitDependencies || []).map(dep => `- ${dep}`).join('\n')}
    `;
  } else {
    scopeMdContent = await generateScopeFromCode(servicePath);
  }

  console.log(`\n[Suggestion for ${serviceName}]`);
  console.log('------------------');
  console.log(scopeMdContent);
  console.log('------------------');

  // This is a placeholder for the interactive prompt
  const answer = await new Promise(resolve => {
    const readline = import('readline').then(rl => {
      const interface = rl.createInterface({ input: process.stdin, output: process.stdout });
      interface.question('Create hive and scope.md? (y/n/r/s/q): ', answer => {
        interface.close();
        resolve(answer);
      });
    });
  });

  if (answer.toLowerCase() === 'y') {
    await createHive([serviceName], { path: servicePath });
    // We would also write the scope.md file here.
  }
}

export async function importCommand(args, flags) {
  const serviceDirs = await glob('services/*', { onlyDirectories: true });

  for (const serviceDir of serviceDirs) {
    await importService(serviceDir);
  }
}
