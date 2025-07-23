# Architect Advisor Plugin

AI-powered ADR (Architectural Decision Record) generation plugin for Claude Zen.

## Features

- **System Analysis**: Analyzes performance, scalability, security, and architecture patterns
- **ADR Generation**: Automatically generates structured ADR proposals
- **Confidence Scoring**: Only proposes ADRs above configurable threshold
- **Multiple Analysis Types**: Performance, scalability, security, architecture
- **Approval Workflow**: Generated ADRs require human review

## Usage

```javascript
import { ArchitectAdvisorPlugin } from './index.js';

const plugin = new ArchitectAdvisorPlugin({
  confidence_threshold: 0.8,
  analysis_types: ['performance', 'scalability'],
  approval_required: true
});

await plugin.initialize();

// Generate ADR proposals
const proposals = await plugin.generateADRProposals('performance', {
  includeAlternatives: true,
  dryRun: false
});
```

## Configuration

- `confidence_threshold` (0-1): Minimum confidence for ADR proposals
- `analysis_types`: Array of analysis types to perform
- `approval_required` (boolean): Whether ADRs require approval
- `adr_path` (string): Path to store ADR files

## API Endpoints

When loaded, this plugin provides:
- `POST /api/adrs/generate` - Generate ADR proposals
- `GET /api/adrs?autoGenerate=true` - List ADRs with auto-generation

## Analysis Types

- **Performance**: Memory usage, CPU bottlenecks, response times
- **Scalability**: Load distribution, single points of failure
- **Security**: Access patterns, vulnerability assessments
- **Architecture**: Code organization, coupling analysis