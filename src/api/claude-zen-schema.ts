/**
 * 🚀 CLAUDE ZEN UNIFIED SCHEMA;
 * Single source of truth for workflow management APIs;
 * Auto-generates CLI/TUI/Web interfaces with proper hierarchy;
 */
export interface SchemaCommand {
  description: string;
  category: string;
  priority: number;
  interfaces: {
    cli: boolean;
    web?: {
      enabled: boolean;
      endpoint: string;
      method: string;
    };
    tui?: boolean;
  };
  storage?: string;
  permissions?: string[];
  validation?: {
    required: string[];
    optional?: string[];
  };
}
export interface SchemaMetadata {
  version: string;
  lastUpdated: string;
  categories: string[];
  totalCommands: number;
}
export const CLAUDE_ZEN_SCHEMA: Record<string, SchemaCommand> = {
  // === STRATEGIC VISIONS ===
  // High-level strategic visions that drive product development
  'visions-create': {
    description: 'Create new strategic vision',;
category: 'strategic',;
priority: 1,;
{
  cli: true,;
  enabled: true, endpoint;
  : '/api/visions', method: 'POST' ,
  tui: true,
}
,
storage: 'visions',
{
  required: ['title', 'description'];
}
,
},
('visions-list')
:
{
  description: 'List all strategic visions',;
  category: 'strategic',;
  priority: 1,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/visions', method: 'GET' ,
  tui: true,
  ,
  storage: 'visions',
}
,
// === FOUNDATIONAL ARCHITECTURE DECISIONS ===
// ADRs are cross-cutting architectural principles that inform ALL other work
('adrs-create')
:
{
  description: 'Create Architecture Decision Record',;
  category: 'architecture',;
  priority: 2,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/adrs', method: 'POST' ,
  tui: true,
  ,
  storage: 'adrs',
  required: ['title', 'status', 'context'] ,
}
,
('adrs-generate')
:
{
  description: 'Auto-generate ADR from context',;
  category: 'architecture',;
  priority: 2,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/adrs/generate', method: 'POST' ,
  tui: false,
  ,
  required: ['context'] ,
}
,
// === STRATEGIC PLANNING ===
('roadmaps-create')
:
{
  description: 'Create strategic roadmap',;
  category: 'planning',;
  priority: 1,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/roadmaps', method: 'POST' ,
  tui: true,
  ,
  storage: 'roadmaps',
  required: ['title', 'timeline'] ,
}
,
// === LARGE INITIATIVES ===
('epics-create')
:
{
  description: 'Create epic initiative',;
  category: 'planning',;
  priority: 2,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/epics', method: 'POST' ,
  tui: true,
  ,
  storage: 'epics',
  required: ['title', 'description', 'roadmap'] ,
}
,
// === SPECIFIC CAPABILITIES ===
('features-create')
:
{
  description: 'Create feature specification',;
  category: 'development',;
  priority: 3,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/features', method: 'POST' ,
  tui: true,
  ,
  storage: 'features',
  required: ['title', 'epic', 'requirements'] ,
}
,
// === EXTENDED USER STORIES WITH SPECIFICATIONS ===
('prds-create')
:
{
  description: 'Create Product Requirement Document',;
  category: 'product',;
  priority: 3,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/prds', method: 'POST' ,
  tui: true,
  ,
  storage: 'prds',
  required: ['title', 'feature', 'acceptance_criteria'] ,
}
,
// === IMPLEMENTATION WORK ===
('tasks-create')
:
{
  description: 'Create implementation task',;
  category: 'development',;
  priority: 4,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/tasks', method: 'POST' ,
  tui: true,
  ,
  storage: 'tasks',
  required: ['title', 'prd', 'estimate'] ,
}
,
// === MULTI-SERVICE COORDINATION ===
('coordination-status')
:
{
  description: 'Check coordination system status',;
  category: 'system',;
  priority: 1,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/coordination/status', method: 'GET' ,
  tui: true,
  ,
}
,
// === SWARM INTELLIGENCE ===
('swarms-create')
:
{
  description: 'Create intelligent swarm',;
  category: 'ai',;
  priority: 2,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/swarms', method: 'POST' ,
  tui: false,
  ,
  storage: 'swarms',
  required: ['type', 'size', 'objective'] ,
}
,
// === META REGISTRY SYSTEM ===
('meta-registry')
:
{
  description: 'Access meta registry information',;
  category: 'system',;
  priority: 1,;
  cli: true,;
  enabled: true, endpoint;
  : '/api/meta', method: 'GET' ,
  tui: true,
  ,
}
,
}
// === METADATA ===
export const SCHEMA_METADATA: SchemaMetadata = {
  version: '1.0.0',;
lastUpdated: new Date().toISOString(),;
categories: ['strategic', 'architecture', 'planning', 'development', 'product', 'system', 'ai'],;
totalCommands: Object.keys(CLAUDE_ZEN_SCHEMA).length,;
}
/**
 * Get commands by category;
 */
export function getCommandsByCategory(_category: string): Record<string, SchemaCommand> {
  return Object.fromEntries(;
  // Object.entries(CLAUDE_ZEN_SCHEMA).filter(([, cmd]) => cmd.category === category); // LINT: unreachable code removed
  )
}
/**
 * Get web-enabled commands;
 */
export function getWebEnabledCommands(): Record<string, SchemaCommand> {
  return Object.fromEntries(;
  // Object.entries(CLAUDE_ZEN_SCHEMA).filter(([, cmd]) => cmd.interfaces.web?.enabled); // LINT: unreachable code removed
  )
}
/**
 * Get CLI-enabled commands;
 */
export function getCLIEnabledCommands(): Record<string, SchemaCommand> {
  return Object.fromEntries(;
  // Object.entries(CLAUDE_ZEN_SCHEMA).filter(([, cmd]) => cmd.interfaces.cli); // LINT: unreachable code removed
  )
}
/**
 * Validate command arguments;
 */
export function validateCommandArgs(
  commandName: string,;
args: Record<string, any>;
):
{
  valid: boolean;
  missing: string[];
  errors: string[];
}
{
  const _command = CLAUDE_ZEN_SCHEMA[commandName];
  if (!command) {
    return { valid: false, missing: [], errors: [`Unknown command: ${commandName}`] };
    //   // LINT: unreachable code removed}
    const _validation = command.validation;
    if (!validation) {
      return { valid: true, missing: [], errors: [] };
      //   // LINT: unreachable code removed}
      const _missing: string[] = [];
      const _errors: string[] = [];
      // Check required fields
      if (validation.required) {
        for (const field of validation.required) {
          if (!(field in args) ?? args[field] === undefined ?? args[field] === null) {
            missing.push(field);
          }
        }
      }
      return {
    valid: missing.length === 0 && errors.length === 0,;
      // missing,; // LINT: unreachable code removed
      errors,;
    }
  }
  /**
   * Generate OpenAPI specification;
   */
  export function _generateOpenAPISpec(): unknown {
  const _paths: unknown = {};
;
  Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([_cmdName, cmdConfig]) => {
    if (!cmdConfig.interfaces.web?.enabled) return;
    // ; // LINT: unreachable code removed
    const { endpoint, method } = cmdConfig.interfaces.web;
;
    if (!paths[endpoint]) {
      paths[endpoint] = {};
    }
;
    paths[endpoint][method.toLowerCase()] = {
      summary: cmdConfig.description,;
      tags: [cmdConfig.category],;
        '200': 
          description: 'Success',;
            'application/json': type: 'object' ,;,;,;,;,;
    };
;
    if (cmdConfig.validation?.required) {
      paths[endpoint][method.toLowerCase()].requestBody = {
        required: true,;
          'application/json': 
              type: 'object',;
              required: cmdConfig.validation.required,;
              properties: cmdConfig.validation.required.reduce((props: unknown, field: string) => {
                props[field] = { type: 'string' };
                return props;
    //   // LINT: unreachable code removed}, {}),;
            },;,;,;;
    }
  }
  )
  return {
    openapi: '3.0.0',;
  // info: { // LINT: unreachable code removed
  title: 'Claude Zen API',;
  version: SCHEMA_METADATA.version,;
  description: 'Auto-generated API from Claude Zen Schema',;
}
,
paths,
}
}
export default CLAUDE_ZEN_SCHEMA;
