import { readFile } from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import jsonlint from 'jsonlint';
import yaml from 'js-yaml';

export async function scanJsonYamlFiles(flags) {
  const suggestions = [];
  const jsonYamlFiles = await glob('**/*.{json,yaml,yml}', { ignore: ['node_modules/**', '.git/**', '.hive-mind/**'] });

  for (const file of jsonYamlFiles) {
    const content = await readFile(file, 'utf8');

    try {
      if (file.endsWith('.json')) {
        jsonlint.parse(content);
      } else {
        yaml.load(content);
      }
    } catch (error) {
      suggestions.push({
        id: `invalid-syntax-${file}`,
        description: `Invalid syntax in ${file}: ${error.message}`,
        action: 'fix_syntax',
        file: file,
        errorMessage: error.message,
      });
    }
  }

  return suggestions;
}
