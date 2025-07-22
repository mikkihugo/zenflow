import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { analyze } from 'escomplex';
import { generateText } from '../ai-service.js';

export async function scanForCodeComplexity(flags) {
  const suggestions = [];
  const codeFiles = await glob('**/*.{js,jsx,ts,tsx}', { ignore: ['node_modules/**', '.git/**', '.hive-mind/**'] });

  for (const file of codeFiles) {
    const content = await readFile(file, 'utf8');
    try {
      const analysis = analyze(content);
      for (const method of analysis.methods) {
        if (method.cyclomatic > 10) { // Threshold for high complexity
          const refactorSuggestion = await generateText(`
            The function '${method.name}' in file '${file}' has a high cyclomatic complexity of ${method.cyclomatic}.
            Suggest a refactoring approach to reduce its complexity and improve readability.
            Provide a brief explanation and a high-level code example if possible.
          `, { modelType: 'pro' });

          suggestions.push({
            id: `code-complexity-${file}-${method.name}`,
            description: `High cyclomatic complexity (${method.cyclomatic}) in function '${method.name}' in ${file}.`,
            action: 'suggest_refactor',
            file: file,
            methodName: method.name,
            complexity: method.cyclomatic,
            refactorSuggestion: refactorSuggestion,
          });
        }
      }
    } catch (error) {
      // Ignore files that cannot be parsed (e.g., syntax errors)
      console.warn(`Could not analyze ${file}: ${error.message}`);
    }
  }

  return suggestions;
}