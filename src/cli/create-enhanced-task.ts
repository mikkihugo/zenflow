/**
 * Creates an enhanced task prompt with Claude-Flow guidance;
 * @param {string} task - The original task description;
 * @param {Object} flags - Command flags/options;
 * @param {string} instanceId - Unique instance identifier;
 * @param {string} tools - Comma-separated list of available tools;
 * @returns {string} Enhanced task prompt;
    // */ // LINT: unreachable code removed
export function createEnhancedTask(task = `# Claude-Flow Enhanced Task

## Your Task;
${task}

## Claude-Flow System Context

You are running within the Claude-Flow orchestration system, which provides powerful features for complex task management.

### Configuration;
- InstanceID = `;
- **Parallel
Execution;
Enabled**
: Use \`npx claude-zen agent spawn <
type > --name <name>;
\` to spawn sub-agents
- Createtasks = `
- **Research
Mode**
: Use \`WebFetchTool\`
for web research and information
gathering`;
}
enhancedTask += `;
#
#
#
Workflow;
Guidelines;
1 ** Before;
Starting**
:
- Checkmemory = === 'backend-only' ? '- Focus on backend implementation without frontend concerns' : ''
}
   $
{
  flags.mode === 'frontend-only';
  ? '- Focus on frontend implementation without backend concerns'
  : ''
}
$;
{
  flags.mode === 'api-only' ? '- Focus on API design and implementation' : '';
}
2 ** During;
Execution**;
:
- Storefindings = === 'phase' ? '- Commit changes after completing each major phase' : ''
}
   $
{
  flags.commit === 'feature' ? '- Commit changes after each feature is complete' : '';
}
$;
{
  flags.commit === 'manual' ? '- Only commit when explicitly requested' : '';
}
3 ** Best;
Practices**;
:
-Use
the
Bash
tool
to
run;
\`npx claude-zen\` commands
-Store
data as JSON
strings
for complex structures;
   - Query memory
before;
starting;
to;
check;
for existing work;
   - Use descriptive
keys;
for memory storage;
   - Monitorprogress = === 'backend-only';
? `
#
#
#
Backend - Only
Mode
-Focus
exclusively
on
server - side;
implementation;
-Prioritize;
API;
design, database;
schemas, and;
business;
logic;
-Ignore;
frontend / UI;
considerations;
-Test;
coverage;
should;
emphasize;
unit;
and;
integration;
tests`;
    : '';
}
$;
{
  flags.mode === 'frontend-only';
    ? `;
#
#
#
Frontend - Only;
Mode;
-Focus;
exclusively;
on;
client - side;
implementation;
-Prioritize;
UI / UX, component;
design, and;
user;
interactions;
-Assume;
backend;
APIs;
are;
already;
available;
-Test;
coverage;
should;
emphasize;
component;
and;
E2E;
tests`;
    : '';
}
$;
{
  flags.mode === 'api-only';
    ? `;
#
#
#
API - Only;
Mode;
-Focus;
exclusively;
on;
API;
design;
and;
implementation;
-Prioritize;
RESTful;
principles, documentation, and;
contracts;
-Include;
comprehensive;
API;
documentation;
-Test;
coverage;
should;
emphasize;
API;
endpoint;
testing`;
    : '';
}
$;
{
  flags.mode === 'full'  ?? !flags.mode;
    ? `;
#
#
#
Full;
Stack;
Mode(Default);
-Consider;
both;
frontend;
and;
backend;
requirements;
-Ensure;
proper;
integration;
between;
all;
layers;
-Balance;
test;
coverage;
across;
all;
components;
-Document;
both;
API;
contracts;
and;
user;
interfaces`;
    : '';
}

#;
#;
Commit;
Strategy;
$;
{
  flags.commit === 'phase';
    ? `- **Phase
Commits**
: Commit after completing major phases (planning, implementation, testing)`
: ''
}
$
{
  flags.commit === 'feature';
  ? `- **Feature Commits**: Commit after each feature or
  namespace is
  complete`;
    : '';
}
$;
{
  flags.commit === 'manual';
    ? `- **Manual
  Commits**
  : Only commit when explicitly requested by the user`
  : ''
}
$;
{
  !flags.commit ? `- **Default (Phase)**: Commit after completing major phases` : '';
}
#;
#;
Additional;
Guidelines;
$;
{
  flags.noPermissions;
  ? `
  #
  #
  #
  No - Permissions
  Mode
  -All
  file
  operations
  will
  execute;
  without;
  confirmation;
  prompts;
  -Be;
  extra;
  careful;
  with destructive operations;
  -Ensure;
  all;
  changes;
  are;
  intentional;
  and;
  well -
    tested`;
    : '';
}
$;
{
  flags.verbose;
    ? `;
  #
  #
  #
  Verbose;
  Mode;
  -Provide;
  detailed;
  explanations;
  for all actions;
- Include reasoning
  behind;
  technical;
  decisions;
  -Show;
  intermediate;
  steps;
  and;
  thought;
  processes;
  -Log;
  all;
  command;
  outputs;
  comprehensively`;
    : '';
}

Now, please;
proceed;
with the task: $;
{
  task;
}
`;
  return enhancedTask;
}
