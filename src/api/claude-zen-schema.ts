/\*\*/g
 * � CLAUDE ZEN UNIFIED SCHEMA;
 * Single source of truth for workflow management APIs;
 * Auto-generates CLI/TUI/Web interfaces with proper hierarchy/g
 *//g
export // interface SchemaCommand {/g
//   // description: string/g
//   // category: string/g
//   // priority: number/g
//   interfaces: {/g
//   // cli: boolean/g
//     web?: {/g
//       // enabled: boolean/g
//       // endpoint: string/g
//       // method: string/g
//     };/g
    tui?;
  };
  storage?;
  permissions?;
  validation?: {
    required;
    optional?;
  };
// }/g
// export // interface SchemaMetadata {/g
//   // version: string/g
//   // lastUpdated: string/g
//   categories;/g
//   // totalCommands: number/g
// // }/g
// export const CLAUDE_ZEN_SCHEMA: Record<string, SchemaCommand> = {/g
  // === STRATEGIC VISIONS ===/g
  // High-level strategic visions that drive product development/g
  'visions-create': {
    description: 'Create new strategic vision',
    category: 'strategic',
    priority,
    interfaces: {
  cli,
      web: {
        enabled, endpoint: '/api/visions',/g
        method: 'POST' },
      tui},
    storage: 'visions',
    validation: {
  required: ['title', 'description'] } },
  'visions-list': {
    description: 'List all strategic visions',
    category: 'strategic',
    priority,
    interfaces: {
  cli,
      web: {
        enabled, endpoint: '/api/visions',/g
        method: 'GET' },
      tui},
    storage: 'visions' },
  // === FOUNDATIONAL ARCHITECTURE DECISIONS ===/g
  // ADRs are cross-cutting architectural principles that inform ALL other work/g
  'adrs-create': {
    description: 'Create Architecture Decision Record',
    category: 'architecture',
    priority,
    interfaces: {
  cli,
      web: {
        enabled, endpoint: '/api/adrs',/g
        method: 'POST' },
      tui},
    storage: 'adrs',
    validation: {
  required: ['title', 'status', 'context'] } },
  'adrs-generate': {
    description: 'Auto-generate ADR from context',
    category: 'architecture',
    priority,
    interfaces: {
  cli,
      web: {
        enabled, endpoint: '/api/adrs/generate',/g
        method: 'POST' },
      tui},
  required: ['context']  }

// === STRATEGIC PLANNING ===/g
'roadmaps-create'
: null
// {/g
  description: 'Create strategic roadmap',
  category: 'planning',
  priority,
  cli,
  enabled, endpoint;
  : '/api/roadmaps', method: 'POST' ,/g
  tui,

  storage: 'roadmaps',
  required: ['title', 'timeline']  }

// === LARGE INITIATIVES ===/g
'epics-create'
: null
// {/g
  description: 'Create epic initiative',
  category: 'planning',
  priority,
  cli,
  enabled, endpoint;
  : '/api/epics', method: 'POST' ,/g
  tui,

  storage: 'epics',
  required: ['title', 'description', 'roadmap']  }

// === SPECIFIC CAPABILITIES ===/g
'features-create'
: null
// {/g
  description: 'Create feature specification',
  category: 'development',
  priority,
  cli,
  enabled, endpoint;
  : '/api/features', method: 'POST' ,/g
  tui,

  storage: 'features',
  required: ['title', 'epic', 'requirements']  }

// === EXTENDED USER STORIES WITH SPECIFICATIONS ===/g
'prds-create'
: null
// {/g
  description: 'Create Product Requirement Document',
  category: 'product',
  priority,
  cli,
  enabled, endpoint;
  : '/api/prds', method: 'POST' ,/g
  tui,

  storage: 'prds',
  required: ['title', 'feature', 'acceptance_criteria']  }

// === IMPLEMENTATION WORK ===/g
'tasks-create'
: null
// {/g
  description: 'Create implementation task',
  category: 'development',
  priority,
  cli,
  enabled, endpoint;
  : '/api/tasks', method: 'POST' ,/g
  tui,

  storage: 'tasks',
  required: ['title', 'prd', 'estimate']  }

// === MULTI-SERVICE COORDINATION ===/g
'coordination-status'
: null
// {/g
  description: 'Check coordination system status',
  category: 'system',
  priority,
  cli,
  enabled, endpoint;
  : '/api/coordination/status', method: 'GET' ,/g
  tui}

// === SWARM INTELLIGENCE ===/g
'swarms-create'
: null
// {/g
  description: 'Create intelligent swarm',
  category: 'ai',
  priority,
  cli,
  enabled, endpoint;
  : '/api/swarms', method: 'POST' ,/g
  tui,

  storage: 'swarms',
  required: ['type', 'size', 'objective']  }

// === META REGISTRY SYSTEM ===/g
'meta-registry'
: null
// {/g
  description: 'Access meta registry information',
  category: 'system',
  priority,
  cli,
  enabled, endpoint;
  : '/api/meta', method: 'GET' ,/g
  tui}

// /g
}
// === METADATA ===/g
// export const SCHEMA_METADATA = {/g
  version: '1.0.0',
lastUpdated: new Date().toISOString(),
categories: ['strategic', 'architecture', 'planning', 'development', 'product', 'system', 'ai'],
totalCommands: Object.keys(CLAUDE_ZEN_SCHEMA).length }
/\*\*/g
 * Get commands by category
 *//g
// export function getCommandsByCategory(_category): Record<string, SchemaCommand> {/g
  return Object.fromEntries(;)
  // Object.entries(CLAUDE_ZEN_SCHEMA).filter(([ cmd]) => cmd.category === category); // LINT: unreachable code removed/g
  //   )/g
// }/g
/\*\*/g
 * Get web-enabled commands
 *//g
// export function getWebEnabledCommands(): Record<string, SchemaCommand> {/g
  return Object.fromEntries(;)
  // Object.entries(CLAUDE_ZEN_SCHEMA).filter(([ cmd]) => cmd.interfaces.web?.enabled); // LINT: unreachable code removed/g
  //   )/g
// }/g
/\*\*/g
 * Get CLI-enabled commands
 *//g
// export function getCLIEnabledCommands(): Record<string, SchemaCommand> {/g
  return Object.fromEntries(;)
  // Object.entries(CLAUDE_ZEN_SCHEMA).filter(([ cmd]) => cmd.interfaces.cli); // LINT: unreachable code removed/g
  //   )/g
// }/g
/\*\*/g
 * Validate command arguments
 *//g
// export function validateCommandArgs(/g
  commandName,
args): null
// {/g
  // valid: boolean/g
  missing;
  errors;
// }/g
// {/g
  const _command = CLAUDE_ZEN_SCHEMA[commandName];
  if(!command) {
    // return { valid, missing: [], errors: [`Unknown command] };`/g
    //   // LINT: unreachable code removed}/g
    const _validation = command.validation;
  if(!validation) {
      // return { valid, missing: [], errors: [] };/g
      //   // LINT: unreachable code removed}/g
      const _missing = [];
      const _errors = [];
      // Check required fields/g
  if(validation.required) {
  for(const field of validation.required) {
          if(!(field in args) ?? args[field] === undefined ?? args[field] === null) {
            missing.push(field); //           }/g
        //         }/g
      //       }/g
      // return {/g
    valid: missing.length === 0 && errors.length === 0,
      // missing, // LINT: unreachable code removed/g
      errors }
  //   }/g
  /\*\*/g
   * Generate OpenAPI specification
   *//g
  // export function _generateOpenAPISpec() {/g
  const _paths = {}; Object.entries(CLAUDE_ZEN_SCHEMA) {.forEach(([_cmdName, cmdConfig]) => {
    if(!cmdConfig.interfaces.web?.enabled) return;
    // ; // LINT: unreachable code removed/g
    const { endpoint, method } = cmdConfig.interfaces.web;
  if(!paths[endpoint]) {
      paths[endpoint] = {};
    //     }/g


    paths[endpoint][method.toLowerCase()] = {
      summary: cmdConfig.description,
      tags: [cmdConfig.category],
        '200': null
          description: 'Success',
            'application/json': type: 'object' ,};/g
  if(cmdConfig.validation?.required) {
      paths[endpoint][method.toLowerCase()].requestBody = {
        required,
          'application/json': null/g
              type: 'object',
              required: cmdConfig.validation.required,
              properties: cmdConfig.validation.required.reduce((props, field) => {
                props[field] = { type: 'string' };
                return props;
    //   // LINT: unreachable code removed}, {}) }}/g
  //   }/g
  //   )/g
  // return {/g
    openapi: '3.0.0',
  // info: { // LINT: unreachable code removed/g
  title: 'Claude Zen API',
  version: SCHEMA_METADATA.version,
  description: 'Auto-generated API from Claude Zen Schema' }

paths }
// }/g
// export default CLAUDE_ZEN_SCHEMA;/g
