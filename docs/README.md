# Claude-Zen Documentation Structure

## Document-Driven Development Workflow

This documentation follows a structured approach from high-level vision to concrete implementation:

**Vision → ADRs → PRDs → Epics → Features → Tasks → Code**

## Folder Structure

### 📋 **Workflow Documents**

1. **`01-vision/`** - Strategic Vision Documents
   - High-level product vision and strategic direction
   - Long-term goals and success criteria
   - Stakeholder alignment documents

2. **`02-adrs/`** - Architecture Decision Records
   - Cross-cutting technical decisions
   - Technology choices and rationale
   - Design patterns and architectural principles

3. **`03-prds/`** - Product Requirements Documents
   - Detailed feature specifications
   - User stories and acceptance criteria
   - Functional and non-functional requirements

4. **`04-epics/`** - Epic-Level Feature Sets
   - Large feature groupings
   - User journey mappings
   - Release planning and milestones

5. **`05-features/`** - Individual Feature Specifications
   - Specific implementable features
   - Technical design details
   - API contracts and data models

6. **`06-tasks/`** - Implementation Tasks
   - Granular development tasks
   - Implementation checklists
   - Testing and validation criteria

7. **`07-specs/`** - Technical Specifications
   - Detailed technical specifications (Maestro integration)
   - API contracts and schemas
   - Integration point documentation

### 📚 **Reference Documentation**

- **`reference/api/`** - API documentation and references
- **`reference/architecture/`** - Architecture deep-dives and diagrams
- **`reference/implementation/`** - Implementation guides and tutorials
- **`reference/analysis/`** - Analysis reports and research

### 📝 **Templates**

- **`templates/`** - Document templates for each type
  - Vision template
  - ADR template  
  - PRD template
  - Epic template
  - Feature template
  - Task template
  - Technical specification template

## Document Lifecycle

```mermaid
graph LR
    A[Vision] --> B[ADRs]
    B --> C[PRDs]
    C --> D[Epics]
    D --> E[Features]
    E --> F[Tasks]
    F --> G[Code]
    
    G --> H[Validation]
    H --> I[Documentation Update]
```

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

- **Vision** defines the "why" and high-level "what"
- **ADRs** capture technical decisions that span multiple features
- **PRDs** detail specific product requirements and user stories
- **Epics** group related features into deliverable chunks
- **Features** specify individual capabilities and their implementation
- **Tasks** break down features into actionable development work
- **Specs** provide detailed technical implementation guidance

Each document type builds upon the previous levels while maintaining traceability from vision to code.