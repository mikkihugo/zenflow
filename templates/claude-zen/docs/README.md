# Document-Driven Development Structure

This project follows a structured approach from high-level vision to concrete implementation:

**Vision → ADRs → PRDs → Epics → Features → Tasks → Code**

## Folder Structure

- **`01-vision/`** - Strategic Vision Documents
- **`02-adrs/`** - Architecture Decision Records  
- **`03-prds/`** - Product Requirements Documents
- **`04-epics/`** - Epic-Level Feature Sets
- **`05-features/`** - Individual Feature Specifications
- **`06-tasks/`** - Implementation Tasks
- **`07-specs/`** - Technical Specifications
- **`templates/`** - Document templates for each type

## Usage with Claude-Zen

```bash
# Create documents following the workflow
claude-zen create vision "Product Vision 2024"
claude-zen create adr "MCP Protocol Choice"
claude-zen create prd "Swarm Orchestration System"
claude-zen create epic "Neural Network Integration"
claude-zen create feature "Agent Spawning System"
claude-zen create task "Implement Agent Pool"

# Process documents through AI workflow
claude-zen workspace process docs/01-vision/product-vision.md
claude-zen workspace status
```

## Document Relationships

Each document type builds upon the previous levels while maintaining traceability from vision to code.