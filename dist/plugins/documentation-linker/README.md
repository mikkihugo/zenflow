# Documentation Linker Plugin

A comprehensive plugin for Claude Zen that provides intelligent documentation analysis, cross-reference validation, broken link detection, and smart linking suggestions.

## Features

### 🔍 **Documentation Discovery**
- **Multi-format Support**: Markdown (.md, .mdx), reStructuredText (.rst), AsciiDoc (.adoc)
- **Frontmatter Parsing**: Extracts metadata from YAML frontmatter
- **Content Analysis**: Keyword extraction, word count, structural analysis
- **Automatic Categorization**: Detects document types and purposes

### 🔗 **Link Analysis**
- **Comprehensive Link Detection**: Internal, external, reference, and auto links
- **Link Type Classification**: Markdown, reStructuredText, AsciiDoc, and generic URL links
- **Anchor Validation**: Checks heading anchors and custom anchor points
- **Reference Resolution**: Resolves relative paths and validates targets

### ✅ **Validation & Health Checks**
- **Broken Link Detection**: Identifies missing files and invalid anchors
- **Cross-reference Validation**: Ensures all internal links point to valid targets
- **Image Link Validation**: Validates image references and alt text
- **Comprehensive Reporting**: Detailed analysis with actionable recommendations

### 💡 **Intelligent Suggestions**
- **Similarity-based Linking**: Suggests cross-references based on content similarity
- **Orphan Document Detection**: Identifies documents without incoming links
- **Content Clustering**: Groups related documents for better organization
- **Missing Documentation Alerts**: Suggests documentation for undocumented code

## Installation

```bash
npm install @claude-zen/documentation-linker-plugin
```

## Configuration

```javascript
const config = {
  // Document discovery patterns
  documentPaths: ['**/*.md', 'docs/**/*', 'README*'],
  ignorePaths: ['node_modules/**', '.git/**', '.hive-mind/**', 'dist/**'],
  
  // Analysis settings
  similarityThreshold: 0.7,           // Minimum similarity for suggestions
  keywordMinLength: 3,                // Minimum keyword length
  maxKeywords: 20,                    // Maximum keywords per document
  linkSuggestionThreshold: 2,         // Minimum common keywords for suggestions
  
  // Validation settings
  linkCheckTimeout: 5000,             // Timeout for external link checks
  
  // Output settings
  outputDir: '.hive-mind/documentation' // Where to save reports and exports
};
```

## Usage

### Basic Usage

```javascript
import DocumentationLinkerPlugin from '@claude-zen/documentation-linker-plugin';

const plugin = new DocumentationLinkerPlugin(config);
await plugin.initialize();

// Scan for documentation issues
const results = await plugin.scan();
console.log(`Found ${results.summary.brokenLinksFound} broken links`);
console.log(`Generated ${results.summary.suggestionsGenerated} suggestions`);
```

### Integration with Claude Zen

```javascript
// In your Claude Zen plugin configuration
{
  "plugins": {
    "documentation-linker": {
      "enabled": true,
      "config": {
        "documentPaths": ["docs/**/*.md", "*.md"],
        "similarityThreshold": 0.8
      }
    }
  }
}
```

### CLI Usage

```bash
# Scan documentation
claude-zen scan --plugin documentation-linker

# Generate comprehensive report
claude-zen docs:analyze

# Export link map
claude-zen docs:export-links
```

## API Reference

### Core Methods

#### `scan(rootPath, options)`
Performs comprehensive documentation analysis.

```javascript
const results = await plugin.scan('/path/to/docs', {
  includeExternalLinks: true,
  validateAnchors: true
});
```

**Returns:**
- `summary`: Analysis statistics
- `documents`: Processed document information
- `linkMap`: Complete link relationship map
- `brokenLinks`: List of broken links with details
- `suggestions`: Intelligent linking suggestions

#### `generateReport()`
Creates a detailed analysis report.

```javascript
const report = await plugin.generateReport();
// Report saved to .hive-mind/documentation/documentation-report.json
```

#### `exportLinkMap()`
Exports the complete link relationship map.

```javascript
const linkMap = await plugin.exportLinkMap();
// Link map saved to .hive-mind/documentation/link-map.json
```

### Query Methods

#### `getDocumentById(filePath)`
Retrieves document information by file path.

```javascript
const doc = plugin.getDocumentById('docs/getting-started.md');
console.log(`Title: ${doc.title}, Keywords: ${doc.keywords.length}`);
```

#### `getDocumentsByKeyword(keyword)`
Finds documents containing a specific keyword.

```javascript
const docs = plugin.getDocumentsByKeyword('authentication');
console.log(`Found ${docs.length} documents about authentication`);
```

#### `getSimilarDocuments(filePath, threshold)`
Finds documents similar to the specified document.

```javascript
const similar = plugin.getSimilarDocuments('docs/api.md', 0.7);
similar.forEach(({ document, similarity }) => {
  console.log(`${document.title}: ${(similarity * 100).toFixed(1)}% similar`);
});
```

## Document Types Supported

### Markdown (.md, .mdx)
- **Links**: `[text](url)`, `[text][ref]`, `<url>`
- **Images**: `![alt](src)`
- **Anchors**: `# Heading`, `## Subheading`
- **Frontmatter**: YAML metadata parsing
- **Reference Links**: Support for reference-style links

### reStructuredText (.rst)
- **Links**: `` `text <url>`_ ``
- **Anchors**: Underlined headings with `=`, `-`, `~`, etc.
- **Title Detection**: Document title from heading structure

### AsciiDoc (.adoc, .asciidoc)
- **Links**: `link:url[text]`
- **Anchors**: `= Title`, `== Section`
- **Title Detection**: Document title from heading structure

### Generic Text
- **URLs**: Automatic detection of `http://` and `https://` URLs

## Analysis Features

### Keyword Extraction
- **TF-IDF Algorithm**: Intelligent keyword ranking
- **Stop Word Filtering**: Removes common words
- **Frequency Analysis**: Identifies most important terms
- **Context Awareness**: Considers document structure

### Similarity Calculation
- **Cosine Similarity**: Mathematical similarity scoring
- **Keyword Overlap**: Common term identification
- **Content Clustering**: Groups related documents
- **Threshold Tuning**: Configurable similarity requirements

### Link Validation
- **File Existence**: Checks if linked files exist
- **Anchor Validation**: Verifies heading anchors
- **Path Resolution**: Handles relative and absolute paths
- **External Link Checking**: Optional HTTP status validation

## Suggestions Generated

### Cross-Reference Suggestions
```javascript
{
  type: 'similarity_link',
  description: 'Documents share similar content (85.2% similarity)',
  documents: [
    { path: 'docs/api.md', title: 'API Reference' },
    { path: 'docs/endpoints.md', title: 'Endpoint Guide' }
  ],
  commonKeywords: ['authentication', 'endpoints', 'response'],
  action: 'add_cross_reference'
}
```

### Broken Link Fixes
```javascript
{
  type: 'missing_file',
  description: 'File not found: docs/old-guide.md',
  references: [
    { sourcePath: 'README.md', line: 25, linkText: 'Old Guide' }
  ],
  action: 'fix_broken_link'
}
```

### Orphan Document Alerts
```javascript
{
  type: 'orphaned_document',
  description: 'Document has no incoming links and may be hard to discover',
  document: { path: 'docs/advanced.md', title: 'Advanced Usage' },
  action: 'add_references'
}
```

## Integration Examples

### With Hive Mind
```javascript
// Automatic documentation analysis in hive workflows
const suggestions = await plugin.scan();
await hive.addSuggestions('documentation', suggestions.suggestions);
```

### With CI/CD
```bash
# In your GitHub Actions workflow
- name: Check Documentation Links
  run: |
    claude-zen scan --plugin documentation-linker --fail-on-broken-links
```

### With Pre-commit Hooks
```bash
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: check-docs
      name: Check Documentation Links
      entry: claude-zen scan --plugin documentation-linker
      language: node
```

## Configuration Options

### Document Discovery
- `documentPaths`: Glob patterns for finding documents
- `ignorePaths`: Patterns to exclude from analysis
- `extensions`: File extensions to process

### Analysis Settings
- `similarityThreshold`: Minimum similarity for suggestions (0.0-1.0)
- `keywordMinLength`: Minimum length for keywords
- `maxKeywords`: Maximum keywords extracted per document
- `linkSuggestionThreshold`: Minimum common keywords for suggestions

### Validation Settings
- `linkCheckTimeout`: Timeout for external link validation
- `checkExternalLinks`: Whether to validate HTTP links
- `validateAnchors`: Whether to check heading anchors
- `followRedirects`: Whether to follow HTTP redirects

### Output Settings
- `outputDir`: Directory for reports and exports
- `generateReports`: Whether to save analysis reports
- `exportLinkMap`: Whether to export link relationship data

## Performance Considerations

- **Incremental Analysis**: Only processes changed documents
- **Caching**: Caches keyword extraction and similarity calculations
- **Parallel Processing**: Validates links concurrently
- **Memory Efficient**: Streams large documents instead of loading entirely

## Best Practices

1. **Regular Scanning**: Run documentation analysis in CI/CD pipelines
2. **Threshold Tuning**: Adjust similarity thresholds based on your content
3. **Ignore Patterns**: Exclude generated or temporary files
4. **Link Maintenance**: Address broken links promptly
5. **Cross-referencing**: Act on similarity suggestions to improve navigation

---

Part of the Claude Zen plugin ecosystem. For more information, visit the [Claude Zen Documentation](https://github.com/your-org/claude-zen).