// code.js - Auto-Coder mode orchestration template
export function getCodeOrchestration(taskDescription, memoryNamespace) {
  return `
## Task Orchestration Steps

1. **Project Directory Setup & Context Review** (5 mins)
   - Verify current working directory and create project structure
   - For named projects (e.g., "hello-world"), create as subdirectory
   - Review implementation task: "${taskDescription}"
   - Query architecture and pseudocode: 
     \`\`\`bash
     npx claude-flow memory query ${memoryNamespace}_architecture
     npx claude-flow memory query ${memoryNamespace}_pseudocode
     npx claude-flow memory query ${memoryNamespace}_tech_specs
     \`\`\`
   - Identify modules to implement and their boundaries
   - Review configuration requirements
   - Check for any blocking dependencies

2. **Project Setup & Configuration** (10 mins)
   - Initialize project structure in current directory or subdirectory
   - IMPORTANT: Use pwd to verify you're NOT in node_modules/
   - Set up environment configuration (NO hardcoded values):
     - Create .env.example with all required variables
     - Set up config/ directory with environment loaders
     - Implement secrets management abstraction
   - Install dependencies based on tech specs
   - Create module structure (each file < 500 lines)
   - Store setup: \`npx claude-flow memory store ${memoryNamespace}_setup "Project structure: src/{domain,application,infrastructure}. Config: dotenv + vault integration. Dependencies: express, joi, winston."\`

3. **Modular Implementation** (30 mins)
   - Implement features using clean architecture principles:
     - Domain layer: Business entities and rules
     - Application layer: Use cases and workflows
     - Infrastructure layer: External integrations
   - Follow SOLID principles and dependency injection
   - Keep each module/file under 500 lines
   - Use configuration for ALL environment-specific values
   - Implement comprehensive error handling
   - Add structured logging with context
   - Store progress: \`npx claude-flow memory store ${memoryNamespace}_implementation "Completed: auth-service (3 modules), user-repository (2 modules). Remaining: notification-service."\`

4. **Integration & Basic Testing** (15 mins)
   - Wire up dependency injection container
   - Connect modules following architecture design
   - Implement health checks and monitoring endpoints
   - Add input validation and sanitization
   - Create smoke tests for critical paths
   - Verify configuration loading works correctly
   - Test error scenarios and graceful degradation
   - Store results: \`npx claude-flow memory store ${memoryNamespace}_tests "Smoke tests passing. Health checks operational. Error handling verified. Ready for TDD mode deep testing."\`

5. **Code Quality & Documentation** (10 mins)
   - Run linters and formatters
   - Add inline documentation for complex logic
   - Create API documentation (if applicable)
   - Generate dependency graphs
   - Update README with setup instructions
   - Store completion: \`npx claude-flow memory store ${memoryNamespace}_code_complete "Implementation complete. All modules < 500 lines. No hardcoded secrets. Ready for testing and integration."\`

## Directory Safety Check
Before creating any files:
1. Run \`pwd\` to verify current directory
2. Ensure you're NOT in /node_modules/ or any system directory
3. If creating a named project, create it as a subdirectory
4. Example: For "hello-world", create ./hello-world/ in current directory

## Deliverables
All files should be created relative to the current working directory:
- src/
  - domain/ (business logic, < 500 lines per file)
  - application/ (use cases, < 500 lines per file)
  - infrastructure/ (external integrations)
  - config/ (environment management)
- tests/
  - smoke/ (basic functionality tests)
  - fixtures/ (test data)
- config/
  - .env.example (all required variables)
  - config.js (environment loader)
- docs/
  - API.md (if applicable)
  - SETUP.md (detailed setup guide)

## Tool Usage Reminders
- Use \`insert_content\` for new files or empty targets
- Use \`apply_diff\` for modifying existing code with complete search/replace blocks
- Avoid \`search_and_replace\` unless absolutely necessary
- Always verify all tool parameters before execution

## Next Steps
After implementation, delegate to:
- \`npx claude-flow sparc run tdd "Write comprehensive tests for ${taskDescription}" --non-interactive\`
- \`npx claude-flow sparc run integration "Integrate ${taskDescription} with existing systems" --non-interactive\`
- \`npx claude-flow sparc run security-review "Security audit for ${taskDescription}" --non-interactive\`

## 🚀 Parallel Development with BatchTool
Accelerate development by running multiple tasks concurrently:

\`\`\`bash
# Parallel feature implementation
batchtool run --parallel --max-concurrent 4 \\
  "npx claude-flow sparc run code 'implement user model' --non-interactive" \\
  "npx claude-flow sparc run code 'implement auth middleware' --non-interactive" \\
  "npx claude-flow sparc run code 'implement API endpoints' --non-interactive" \\
  "npx claude-flow sparc run code 'implement database schema' --non-interactive"

# Boomerang pattern for feature development
batchtool orchestrate --boomerang \\
  --research "npx claude-flow sparc run ask 'best practices for ${taskDescription}' --non-interactive" \\
  --design "npx claude-flow sparc run architect 'design ${taskDescription}' --non-interactive" \\
  --implement "npx claude-flow sparc run code 'build ${taskDescription}' --non-interactive" \\
  --test "npx claude-flow sparc run tdd 'test ${taskDescription}' --non-interactive" \\
  --optimize "npx claude-flow sparc run optimization 'optimize ${taskDescription}' --non-interactive"

# Concurrent module development with dependencies
batchtool run --dependency-aware \\
  --task "auth:npx claude-flow sparc run code 'auth module' --non-interactive" \\
  --task "user:npx claude-flow sparc run code 'user module' --non-interactive" \\
  --task "api:npx claude-flow sparc run code 'API layer' --non-interactive:depends=auth,user" \\
  --task "tests:npx claude-flow sparc run tdd 'all tests' --non-interactive:depends=api"
\`\`\``;
}