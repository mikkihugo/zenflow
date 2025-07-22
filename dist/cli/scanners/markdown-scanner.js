import { readFile } from 'fs/promises';
import path from 'path';
import markdownlint from 'markdownlint';
import matter from 'gray-matter';
import { glob } from 'glob';

export async function scanMarkdownFiles(flags) {
  const suggestions = [];
  const markdownFiles = await glob('**/*.md', { ignore: ['node_modules/**', '.git/**', '.hive-mind/**'] });

  for (const file of markdownFiles) {
    const content = await readFile(file, 'utf8');
    const parsed = matter(content);

    // Check for standard header
    if (!parsed.data || !parsed.data.title || !parsed.data.author || !parsed.data.date) {
      suggestions.push({
        id: `missing-md-header-${file}`,
        description: `Markdown file is missing a standard header: ${file}`,
        action: 'add_md_header',
        file: file,
        suggestedHeader: `---
title: "${path.basename(file, '.md')}"
author: "Claude Zen"
date: "${new Date().toISOString().split('T')[0]}"
---
`,
      });
    }

    // Check for linting issues
    const lintResults = markdownlint.sync({ strings: { content: content } });
    if (lintResults.content.length > 0) {
      lintResults.content.forEach(result => {
        suggestions.push({
          id: `md-lint-issue-${file}-${result.lineNumber}`,
          description: `Markdown linting issue in ${file} at line ${result.lineNumber}: ${result.ruleDescription} (${result.ruleNames.join(', ')})`,
          action: 'fix_md_lint',
          file: file,
          lineNumber: result.lineNumber,
          rule: result.ruleNames.join(', '),
        });
      });
    }
  }

  return suggestions;
}
