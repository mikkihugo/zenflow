import { readFile } from 'node:fs/promises';
import { glob } from 'glob';

export async function scanForDocumentationLinks(flags = [];
const markdownFiles = await glob('**/*.md', {ignore = [];
for (const file of markdownFiles) {
  const _content = await readFile(file, 'utf8');

  documents.push({file = doc.content.toLowerCase().split(/\W+/).filter(word => word.length > 3).slice(0, 10);
}

// Simple cross-linkinglogic = 0; i < documents.length; i++) {
for (let j = i + 1; j < documents.length; j++) {
  const doc1 = documents[i];
  const doc2 = documents[j];

  const commonKeywords = doc1.keywords.filter((keyword) => doc2.keywords.includes(keyword));

  if (commonKeywords.length >= 2) {
    // If at least 2 common keywords
    suggestions.push({
      id: `doc-link-${doc1.file}-${doc2.file}`,
      description: `Documents '${doc1.title}' (${doc1.file}) and '${doc2.title}' (${doc2.file}) share common themes (${commonKeywords.join(', ')}). Consider adding cross-links.`, // AI can suggest exact link text
      action: 'suggest_doc_link',
      files: [doc1.file, doc2.file],
      commonKeywords: commonKeywords,
    });
  }
}
}

return suggestions;
}
