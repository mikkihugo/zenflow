# Code Analysis Service

Professional code analysis tools integrated with Kuzu graph storage for Claude Code Zen.

## Quick Start

```bash
# Full codebase analysis
claude-zen analysis codebase

# AST analysis of specific files
claude-zen analysis ast src/utils.js src/components/*.tsx

# Find high complexity functions  
claude-zen analysis query high-complexity --threshold 15

# Detect duplicate code
claude-zen analysis duplicates --threshold 85
```

## Features

- 🌳 **AST Analysis** - TypeScript/JavaScript parsing with complexity metrics
- 🔗 **Dependency Analysis** - Module dependencies and circular detection  
- 👥 **Duplicate Detection** - Copy-paste detection with similarity scoring
- 📊 **Graph Storage** - Rich Kuzu database with queryable relationships
- 🔍 **Query Interface** - Cypher-like queries for analysis patterns

## Architecture

```
src/services/code-analysis/
├── index.js              # Main service interface
├── orchestrator.js       # Coordinates all analysis
├── ast-parser.js         # TypeScript/JavaScript AST parsing
├── dependency-analyzer.js # Module dependency analysis
└── duplicate-detector.js  # Duplicate code detection
```

## Analysis Tools

### AST Parser
- **Parsers**: @typescript-eslint/parser, esprima, acorn
- **Metrics**: Cyclomatic complexity, cognitive complexity
- **Elements**: Functions, classes, variables, imports, types

### Dependency Analyzer  
- **Tools**: madge, dependency-cruiser
- **Features**: Circular detection, orphan files, coupling metrics
- **Formats**: JSON, Cytoscape, D3 visualization

### Duplicate Detector
- **Tool**: jscpd with manual fallback
- **Metrics**: Similarity percentage, token/line counts
- **Output**: Refactoring recommendations, impact analysis

## Graph Schema

### Nodes
- `SourceFile` - Code files with metrics
- `Function` - Functions with complexity scores
- `Class` - Classes with inheritance info
- `Variable` - Variables with scope/type
- `Import` - Import statements
- `DuplicateCode` - Duplicate blocks

### Relationships
- `DEFINES_FUNCTION` - File defines function
- `CALLS_FUNCTION` - Function calls function
- `IMPORTS_FROM` - Dependency relationship
- `DUPLICATES` - Duplicate code relationship

## Example Usage

### Programmatic API

```javascript
import CodeAnalysisService from './src/services/code-analysis/index.js';

const service = new CodeAnalysisService({
  projectPath: './src',
  outputDir: './reports'
});

await service.initialize();

const results = await service.analyzeCodebase({
  includeDependencies: true,
  includeDuplicates: true,
  storeInGraph: true
});

console.log(`Analyzed ${results.summary.overview.total_files} files`);
console.log(`Found ${results.summary.quality_metrics.high_complexity_functions} complex functions`);

await service.cleanup();
```

### Command Line

```bash
# Comprehensive analysis
claude-zen analysis codebase --path ./src --output ./reports

# Specific analysis types
claude-zen analysis dependencies --include-npm
claude-zen analysis duplicates --threshold 90 --min-lines 10

# Query analysis results
claude-zen analysis query high-complexity --threshold 20
claude-zen analysis query circular-deps
claude-zen analysis query dead-code
```

## Configuration

```javascript
{
  projectPath: './src',                    // Project root path
  outputDir: './analysis-reports',         // Report output directory
  filePatterns: ['**/*.{js,jsx,ts,tsx}'],  // Files to analyze
  ignorePatterns: ['node_modules/**'],     // Files to ignore
  kuzu: {
    dbPath: './graph-db',                  // Kuzu database path
    dbName: 'code-analysis'                // Database name
  },
  batchSize: 50                           // Processing batch size
}
```

## Output Reports

### Analysis Summary
- File and function counts
- Complexity metrics  
- Quality assessments
- Refactoring recommendations

### Detailed Results
- Complete AST structures
- Dependency graphs
- Duplicate code patterns
- Graph database exports

## Integration

### With Existing Plugins
- **Code Complexity Scanner** - Enhanced with detailed AST analysis
- **Dependency Scanner** - Upgraded with professional tools
- **Bazel Monorepo** - Respects workspace boundaries

### With Kuzu Graph
- Rich schema for code structures
- Powerful query capabilities
- Relationship mapping
- Historical tracking

## Performance

- **Parallel processing** for large codebases
- **Batch operations** for efficient storage
- **Memory optimization** for large repositories
- **Incremental analysis** support

## Common Queries

```bash
# Find functions with complexity > 15
claude-zen analysis query high-complexity --threshold 15

# Find circular dependencies
claude-zen analysis query circular-deps

# Find duplicate code patterns (>90% similarity)
claude-zen analysis query duplicates --threshold 90

# Find potentially unused functions
claude-zen analysis query dead-code

# Find deprecated API usage
claude-zen analysis query api-usage --api "deprecatedFunction"
```

## Development

### Adding New Analyzers

1. Create analyzer class in `src/services/code-analysis/`
2. Implement standard interface: `analyze()`, `generateGraphData()`
3. Integrate with orchestrator
4. Add to command interface

### Extending Graph Schema

1. Add node/relationship types in `kuzu-graph-interface.js`
2. Update schema initialization
3. Add query methods
4. Update documentation

## Dependencies

Core analysis dependencies:
- `@typescript-eslint/parser` - TypeScript AST parsing
- `esprima` / `acorn` - JavaScript parsing
- `madge` - Dependency analysis
- `dependency-cruiser` - Advanced dependency validation
- `jscpd` - Duplicate code detection
- `kuzu` - Graph database

## License

MIT - See main project license