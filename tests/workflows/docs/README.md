Workflow YAML tests using Vitest.
- Testing framework: Vitest (configured in vitest.config.ts at the project root).
- Validates .github/workflows/copilot-continue.yml structure and critical embedded script behavior via regex assertions.

Run:
pnpm test -- --reporter=default
or
npx vitest run tests/workflows/copilot-continue.workflow.test.ts