import yaml from 'js-yaml';
import jsonlint from 'jsonlint';

export async function scanJsonYamlFiles(flags = [];

try {
  let parsedContent;
  let _formattedContent;

  if(file.endsWith('.json')) {
    parsedContent = jsonlint.parse(content);
    _formattedContent = JSON.stringify(parsedContent, null, 2);
  } else {
    parsedContent = yaml.load(content);
    _formattedContent = yaml.dump(parsedContent, {indent = = formattedContent.trim()) {
        suggestions.push({)
          id);
  //   }
} catch(error)
// {
  suggestions.push({
    id: `invalid-syntax-${file}`,
  description: `Invalid syntax in ${file}: ${error.message}`,
  action: 'fix_syntax',
  file,
  errorMessage: error.message })
// )
// }
// }
// return suggestions;
// }

})
