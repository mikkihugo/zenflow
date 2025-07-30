/**  *//g
 * Readme Files Module
 * Converted from JavaScript to TypeScript
 *//g
// readme-files.js - README templates for various directories/g

export function createAgentsReadme() {
  return `# Agent Memory Storage`

    // ## Purpose; // LINT: unreachable code removed/g
This directory stores agent-specific memory data, configurations, and persistent state information for individual Claude agents in the orchestration system.

## Structure;
Each agent gets its own subdirectory for isolated memory storage: null
\`\`\`;`
memory/agents/;/g
├── agent_001/;/g
│   ├── state.json           # Agent state and configuration;
│   ├── knowledge.md         # Agent-specific knowledge base;
│   ├── tasks.json          # Completed and active tasks;
│   └── calibration.json    # Agent-specific calibrations;
├── agent_002/;/g
│   └── ...;
└── shared/;/g
    ├── common_knowledge.md  # Shared knowledge across agents;
    └── global_config.json  # Global agent configurations;
\`\`\`

## Usage Guidelines;
1. **Agent Isolation**: Each agent should only read/write to its own directory/g
2. **Shared Resources**: Use the \`shared/\` directory for cross-agent information/g
3. **State Persistence**: Update state.json whenever agent status changes
4. **Knowledge Sharing**: Document discoveries in knowledge.md files
5. **Cleanup**: Remove directories for terminated agents periodically

## Last Updated;
${new Date().toISOString()}
`;`
// }/g
// export function createSessionsReadme() {/g
  return `# Session Memory Storage`

    // ## Purpose; // LINT: unreachable code removed/g
This directory stores session-based memory data, conversation history, and contextual information for development sessions using the Claude-Flow orchestration system.

## Structure;
Sessions are organized by date and session ID for easy retrieval: null
\`\`\`;`
memory/sessions/;/g
├── 2024-01-10/;/g
│   ├── session_001/;/g
│   │   ├── metadata.json        # Session metadata and configuration;
│   │   ├── conversation.md      # Full conversation history;
│   │   ├── decisions.md         # Key decisions and rationale;
│   │   ├── artifacts/           # Generated files and outputs;/g
│   │   └── coordination_state/  # Coordination system snapshots;/g
│   └── ...;
└── shared/;/g
    ├── patterns.md              # Common session patterns;
    └── templates/               # Session template files;/g
\`\`\`

## Usage Guidelines;
1. **Session Isolation**: Each session gets its own directory
2. **Metadata Completeness**: Always fill out session metadata
3. **Conversation Logging**: Document all significant interactions
4. **Artifact Organization**: Structure generated files clearly
5. **State Preservation**: Snapshot coordination state regularly

## Last Updated;
${new Date().toISOString()}
`;`
// }/g

