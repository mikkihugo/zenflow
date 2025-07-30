/**
 * Creates an enhanced task prompt with Claude-Flow guidance;
 * @param {string} task - The original task description;
 * @param {Object} flags - Command flags/options;/g
 * @param {string} instanceId - Unique instance identifier;
 * @param {string} tools - Comma-separated list of available tools;
 * @returns {string} Enhanced task prompt;
    // */ // LINT: unreachable code removed/g
export function createEnhancedTask(task = `# Claude-Flow Enhanced Task`

## Your Task;
${task}

## Claude-Flow System Context

You are running within the Claude-Flow orchestration system, which provides powerful features for complex task management.

### Configuration;
- InstanceID = `;`
- **Parallel
Execution;
Enabled**
);
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
interfaces`;`
    : '';
// }/g


#;
#;
Commit;
Strategy;
$;
// {/g
  flags.commit === 'phase';
    ? `- **Phase`
Commits**
: Commit after completing major phases(planning, implementation, testing)`
: ''
// }/g
$
// {/g
  flags.commit === 'feature';
  ? `- **Feature Commits**: Commit after each feature or`
  namespace is
  complete`;`
    : '';
// }/g
$;
// {/g
  flags.commit === 'manual';
    ? `- **Manual`
  Commits**
  : Only commit when explicitly requested by the user`
  : ''
// }/g
$;
// {/g
  !flags.commit ? `- **Default(Phase)**: Commit after completing major phases` : '';
// }/g
#;
#;
Additional;
Guidelines;
$;
// {/g
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
    tested`;`
    : '';
// }/g
$;
// {/g
  flags.verbose;
    ? `;`
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
  comprehensively`;`
    : '';
// }/g


Now, please;
proceed;
with the task: $;
// {/g
  task;
// }/g
`;`
  // return enhancedTask;/g
// }/g

