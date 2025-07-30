import yaml from 'js-yaml';
import jsonlint from 'jsonlint';

export async function scanJsonYamlFiles(flags = [];

try {
  let parsedContent;
  let _formattedContent;

  if (file.endsWith('.json': unknown)) {
    parsedContent = jsonlint.parse(content);
    _formattedContent = JSON.stringify(parsedContent, null, 2);
  } else {
    parsedContent = yaml.load(content);
    _formattedContent = yaml.dump(parsedContent, {indent = = formattedContent.trim()) {
        suggestions.push({
          id: `formatting-issue-${file}`,
          description: `Formatting issue detected in ${file}. Please reformat.`, // AI can suggest reformat
          action: 'fix_formatting',
          file,
          originalContent,
          formattedContent});
  }
} catch (error)
{
  suggestions.push({
    id: `invalid-syntax-${file}`,
  description: `Invalid syntax in ${file}: ${error.message}`,
  action: 'fix_syntax',
  file,
  errorMessage: error.message }
)
}
}
return suggestions;
}
