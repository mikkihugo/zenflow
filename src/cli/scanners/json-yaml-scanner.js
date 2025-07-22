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
      let parsedContent;
      let formattedContent;

      if (file.endsWith('.json')) {
        parsedContent = jsonlint.parse(content);
        formattedContent = JSON.stringify(parsedContent, null, 2);
      } else {
        parsedContent = yaml.load(content);
        formattedContent = yaml.dump(parsedContent, { indent: 2 });
      }

      if (content.trim() !== formattedContent.trim()) {
        suggestions.push({
          id: `formatting-issue-${file}`,
          description: `Formatting issue detected in ${file}. Please reformat.`, // AI can suggest reformat
          action: 'fix_formatting',
          file: file,
          originalContent: content,
          formattedContent: formattedContent,
        });
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