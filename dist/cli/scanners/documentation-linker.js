import { readFile } from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { generateText } from '../ai-service.js';

export async function scanForDocumentationLinks(flags) {
  const suggestions = [];
  const markdownFiles = await glob('**/*.md', { ignore: ['node_modules/**', '.git/**', '.hive-mind/**'] });

  const documents = [];
  for (const file of markdownFiles) {
    const content = await readFile(file, 'utf8');
    const parsed = matter(content);
    documents.push({
      file: file,
      title: parsed.data.title || path.basename(file, '.md'),
      content: parsed.content,
      keywords: [], // To be filled by AI or NLP
    });
  }

  // For now, a very basic keyword extraction. This will be enhanced with AI later.
  for (const doc of documents) {
    doc.keywords = doc.content.toLowerCase().split(/\W+/).filter(word => word.length > 3).slice(0, 10);
  }

  // Simple cross-linking logic: find documents with common keywords
  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const doc1 = documents[i];
      const doc2 = documents[j];

      const commonKeywords = doc1.keywords.filter(keyword => doc2.keywords.includes(keyword));

      if (commonKeywords.length >= 2) { // If at least 2 common keywords
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
