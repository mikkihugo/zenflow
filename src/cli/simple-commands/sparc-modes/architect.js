// architect.js - Architect mode orchestration template
export function getArchitectOrchestration(taskDescription, memoryNamespace) {
  return `
## Task Orchestration Steps

1. **Requirements Analysis** (10 mins)
   - Analyze the user's request: "${taskDescription}"
   - Query existing project context: \`npx claude-flow memory query ${memoryNamespace}\`
   - Identify core components, services, and modular boundaries
   - List external dependencies and integration points
   - Document scalability and security requirements
   - Store findings: \`npx claude-flow memory store ${memoryNamespace}_requirements "Core components: X, Y, Z. External deps: API-A, Service-B. Security: OAuth2, RLS policies needed."\`

2. **System Architecture Design** (20 mins)
   - Create modular architecture diagram using Mermaid syntax
   - Define clear service boundaries and responsibilities
   - Design API contracts between components
   - Plan data flow and state management patterns
   - Ensure NO hardcoded secrets or env values in design
   - Create extensible integration points
   - Store architecture: \`npx claude-flow memory store ${memoryNamespace}_architecture "Microservices: auth-service, user-service, data-processor. APIs: REST for external, gRPC for internal. State: Event-sourced with CQRS."\`

3. **Technical Specifications** (15 mins)
   - Define detailed interface contracts (OpenAPI/AsyncAPI)
   - Specify data models and database schemas
   - Plan security boundaries and authentication flows
   - Document performance and scaling considerations
   - Define configuration management strategy
   - Store specs: \`npx claude-flow memory store ${memoryNamespace}_tech_specs "Auth: JWT with refresh tokens. DB: PostgreSQL with read replicas. Cache: Redis. Config: Environment-based with secrets manager."\`

4. **Modular Implementation Plan** (10 mins)
   - Break system into modules < 500 lines each
   - Create development phases with clear milestones
   - Define testing strategy (unit, integration, e2e)
   - Plan deployment and rollback procedures
   - Identify tasks for other SPARC modes
   - Store plan: \`npx claude-flow memory store ${memoryNamespace}_implementation_plan "Phase 1: Core auth (tdd mode). Phase 2: User management (code mode). Phase 3: Integration (integration mode)."\`

5. **Directory Safety**
   - **IMPORTANT**: All files should be created in the current working directory
   - **DO NOT** create files in system directories or node_modules
   - For named projects, create a subdirectory: \\\`mkdir project-name && cd project-name\\\`
   - Use relative paths from your working directory
   - Example structure:
     \\\`\\\`\\\`
     ./ (current directory)
     ├── architecture/
     │   ├── system-overview.md
     │   └── api-specifications.md
     └── implementation-plan.md
     \\\`\\\`\\\`

6. **Deliverables**
   - architecture/
     - system-overview.md (with Mermaid diagrams)
     - api-specifications.md (OpenAPI/AsyncAPI specs)
     - data-models.md (schemas with relationships)
     - security-architecture.md (auth flows, boundaries)
     - deployment-architecture.md (infrastructure design)
   - implementation-plan.md (phased approach with SPARC mode assignments)

## Next Steps
After completing architecture, delegate to appropriate modes:
- \`npx claude-flow sparc run spec-pseudocode "Create detailed pseudocode for ${taskDescription}" --non-interactive\`
- \`npx claude-flow sparc run tdd "Implement core authentication module" --non-interactive\`
- \`npx claude-flow sparc run security-review "Review architecture for vulnerabilities" --non-interactive\`

## 🏗️ Parallel Architecture Analysis with BatchTool
Leverage concurrent analysis for comprehensive system design:

\`\`\`bash
# Parallel architecture research and analysis
batchtool run --parallel --tag "architecture-${taskDescription}" \\
  "npx claude-flow sparc run ask 'research scalability patterns for ${taskDescription}' --non-interactive" \\
  "npx claude-flow sparc run security-review 'analyze security requirements' --non-interactive" \\
  "npx claude-flow sparc run ask 'research integration patterns' --non-interactive" \\
  "npx claude-flow sparc run ask 'analyze performance requirements' --non-interactive"

# Boomerang architecture refinement
batchtool orchestrate --boomerang --name "architecture-refinement" \\
  --analyze "npx claude-flow sparc run architect 'initial system design' --non-interactive" \\
  --review "npx claude-flow sparc run security-review 'review architecture' --non-interactive" \\
  --refine "npx claude-flow sparc run architect 'refine based on security feedback' --non-interactive" \\
  --validate "npx claude-flow sparc run integration 'validate integration points' --non-interactive" \\
  --finalize "npx claude-flow sparc run docs-writer 'document final architecture' --non-interactive"

# Component-wise architecture development
batchtool run --component-parallel \\
  --frontend "npx claude-flow sparc run architect 'design frontend architecture' --non-interactive" \\
  --backend "npx claude-flow sparc run architect 'design backend architecture' --non-interactive" \\
  --data "npx claude-flow sparc run architect 'design data architecture' --non-interactive" \\
  --infra "npx claude-flow sparc run devops 'design infrastructure' --non-interactive" \\
  --integrate "npx claude-flow sparc run integration 'design integration layer' --non-interactive:wait-for=all"
\`\`\``;
}