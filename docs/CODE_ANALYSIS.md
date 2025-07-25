# Code Analysis Integration Documentation

## Overview

The Claude Code Zen platform now includes comprehensive professional code analysis tools integrated with Kuzu graph storage. This provides powerful code quality assessment, dependency analysis, duplicate detection, and architectural insights.

## Features

### 🌳 AST Analysis
- **TypeScript/JavaScript parsing** using @typescript-eslint/parser, esprima, and acorn
- **Function analysis** with cyclomatic and cognitive complexity metrics
- **Class structure** analysis with inheritance and interface relationships
- **Variable scope** and type analysis
- **Import/Export** dependency tracking

### 🔗 Dependency Analysis
- **Module dependency graphs** using madge and dependency-cruiser
- **Circular dependency detection** with severity assessment
- **Orphan file identification** for cleanup opportunities
- **Coupling metrics** for architectural assessment
- **NPM package analysis** (optional)

### 👥 Duplicate Code Detection
- **Copy-paste detection** using jscpd with manual fallback
- **Similarity scoring** with configurable thresholds
- **Multi-occurrence tracking** across the codebase
- **Refactoring recommendations** based on complexity and impact

### 📊 Graph Storage with Kuzu
- **Rich schema** for code structures and relationships
- **Query interface** for complex analysis patterns
- **Relationship mapping** between all code elements
- **Historical tracking** and trend analysis capabilities

## Installation

The required dependencies are automatically added to package.json:

```json
{
  "dependencies": {
    "@typescript-eslint/parser": "^8.38.0",
    "acorn": "^8.12.1", 
    "dependency-cruiser": "^16.8.3",
    "esprima": "^4.0.1",
    "jscpd": "^4.0.5",
    "madge": "^8.1.0",
    "tree-sitter": "^0.21.4",
    "tree-sitter-javascript": "^0.23.0",
    "tree-sitter-typescript": "^0.23.0",
    "typescript": "^5.8.3"
  }
}
```

Install with:
```bash
npm install
```

## Usage

### Comprehensive Codebase Analysis

```bash
# Full analysis with all features
claude-zen analysis codebase --path ./src --output ./reports

# Analysis with custom file patterns
claude-zen analysis codebase --include "**/*.{js,ts}" --exclude "**/test/**"

# Skip specific analysis types
claude-zen analysis codebase --no-dependencies --no-duplicates
```

### AST Analysis

```bash
# Analyze specific files
claude-zen analysis ast src/utils.js src/components/App.tsx

# AST analysis without storing in graph
claude-zen analysis ast src/**/*.js --no-graph
```

### Dependency Analysis

```bash
# Basic dependency analysis
claude-zen analysis dependencies --path ./src

# Include npm packages in analysis
claude-zen analysis dependencies --include-npm

# Skip circular dependency detection
claude-zen analysis dependencies --no-circular
```

### Duplicate Code Detection

```bash
# Default duplicate detection (70% similarity)
claude-zen analysis duplicates

# Custom thresholds
claude-zen analysis duplicates --threshold 85 --min-lines 10 --min-tokens 50

# Analyze specific directory
claude-zen analysis duplicates --path ./src/components
```

### Query Analysis Results

```bash
# Find high complexity functions
claude-zen analysis query high-complexity --threshold 15

# Find circular dependencies
claude-zen analysis query circular-deps

# Find duplicate code patterns  
claude-zen analysis query duplicates --threshold 90

# Find potentially dead code
claude-zen analysis query dead-code

# Find deprecated API usage
claude-zen analysis query api-usage --api "oldFunction"
```

## Graph Schema

### Node Types

- **SourceFile**: Individual source code files
- **Function**: Function/method definitions with complexity metrics
- **Class**: Class definitions with inheritance info
- **Variable**: Variable declarations with scope and type
- **Import**: Import statements with module dependencies
- **TypeDefinition**: TypeScript type definitions
- **DuplicateCode**: Duplicate code blocks with similarity scores

### Relationship Types

- **DEFINES_FUNCTION**: File → Function
- **DEFINES_CLASS**: File → Class  
- **DECLARES_VARIABLE**: File → Variable
- **HAS_IMPORT**: File → Import
- **IMPORTS_FROM**: Import → File (dependency)
- **CALLS_FUNCTION**: Function → Function
- **MEMBER_OF_CLASS**: Function → Class
- **EXTENDS_CLASS**: Class → Class
- **DUPLICATES**: DuplicateCode → File

## Example Queries

### Find High Complexity Functions
```cypher
MATCH (f:Function) 
WHERE f.cyclomatic_complexity > 10 
RETURN f.name, f.file_id, f.cyclomatic_complexity 
ORDER BY f.cyclomatic_complexity DESC
```

### Find Circular Dependencies  
```cypher
MATCH (f1:SourceFile)-[:IMPORTS_FROM]->(f2:SourceFile)-[:IMPORTS_FROM*]->(f1) 
RETURN f1.path, f2.path
```

### Find Dead Code
```cypher
MATCH (f:Function) 
WHERE NOT EXISTS((f)<-[:CALLS_FUNCTION]-()) 
AND f.is_exported = false 
RETURN f.name, f.file_id
```

### Find Duplicate Hotspots
```cypher
MATCH (d:DuplicateCode)-[:DUPLICATES]->(f:SourceFile) 
WHERE d.similarity_score > 85 
RETURN f.path, COUNT(d) as duplicate_count 
ORDER BY duplicate_count DESC
```

## API Usage

### Programmatic Analysis

```javascript
import CodeAnalysisService from './src/services/code-analysis/index.js';

const service = new CodeAnalysisService({
  projectPath: './src',
  outputDir: './analysis-reports'
});

await service.initialize();

// Full codebase analysis
const results = await service.analyzeCodebase({
  includeDependencies: true,
  includeDuplicates: true,
  storeInGraph: true
});

// Query results
const complexFunctions = await service.query('high-complexity');

await service.cleanup();
```

### Individual Analyzers

```javascript
import { ASTParser, DependencyAnalyzer, DuplicateCodeDetector } from './src/services/code-analysis/index.js';

// AST analysis
const parser = new ASTParser();
const astResult = await parser.parseFile('./src/utils.js');

// Dependency analysis  
const depAnalyzer = new DependencyAnalyzer();
const depResult = await depAnalyzer.analyzeDependencies('./src');

// Duplicate detection
const dupDetector = new DuplicateCodeDetector({ threshold: 80 });
const dupResult = await dupDetector.detectDuplicates('./src');
```

## Output Reports

Analysis generates comprehensive reports in JSON format:

### Analysis Summary
```json
{
  "overview": {
    "total_files": 247,
    "total_functions": 1834, 
    "total_classes": 156,
    "average_complexity": 4.2
  },
  "quality_metrics": {
    "high_complexity_functions": 23,
    "circular_dependencies": 3,
    "duplicate_blocks": 45,
    "orphan_files": 7
  },
  "recommendations": [
    {
      "type": "complexity",
      "priority": "high", 
      "description": "Refactor 23 high-complexity functions"
    }
  ]
}
```

### Detailed Results
- AST structures with all parsed elements
- Dependency graphs with relationship details  
- Duplicate code patterns with similarity scores
- Graph database export for Kuzu

## Integration with Existing Plugins

The code analysis integrates seamlessly with existing plugins:

- **Bazel Monorepo**: Respects monorepo structure and workspace boundaries
- **Code Complexity Scanner**: Enhanced with more detailed AST analysis
- **Dependency Scanner**: Upgraded with professional dependency analysis tools

## Configuration

### Analysis Configuration
```javascript
{
  projectPath: './src',
  outputDir: './analysis-reports',
  filePatterns: ['**/*.{js,jsx,ts,tsx}'],
  ignorePatterns: ['node_modules/**', 'dist/**'],
  kuzu: {
    dbPath: './graph-db',
    dbName: 'code-analysis'
  },
  batchSize: 50
}
```

### Parser Options
```javascript
{
  parseOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  typeScriptOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  }
}
```

## Performance

- **Parallel processing** for large codebases
- **Batch operations** for efficient graph storage
- **Incremental analysis** for file changes
- **Memory optimization** for large repositories

## Future Enhancements

- **Real-time analysis** with file watching
- **Multi-language support** via tree-sitter
- **Visual dependency graphs** 
- **Trend analysis** over time
- **Custom rule definitions**
- **Integration with CI/CD pipelines**

## Troubleshooting

### Common Issues

**Parser Errors**: Ensure TypeScript/JavaScript files are syntactically valid
```bash
# Check syntax
claude-zen analysis ast --no-graph problematic-file.js
```

**Large Codebase Performance**: Use file patterns to limit scope
```bash
# Analyze specific directories
claude-zen analysis codebase --include "src/core/**" --exclude "**/test/**"
```

**Memory Issues**: Adjust batch size
```javascript
const service = new CodeAnalysisService({ batchSize: 25 });
```

### Debug Mode

Enable detailed logging:
```bash
DEBUG=claude-zen:analysis claude-zen analysis codebase
```

## Contributing

The code analysis system is modular and extensible:

- Add new analyzers in `src/services/code-analysis/`
- Extend Kuzu schema in `kuzu-graph-interface.js`
- Add new query patterns in the analysis commands
- Contribute language parsers for tree-sitter support