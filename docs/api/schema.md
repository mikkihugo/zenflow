# Schema Reference

Claude Code Flow uses a unified schema approach where all APIs, CLI commands, and UI interfaces are generated from a single schema definition.

## Overview

The `CLAUDE_ZEN_SCHEMA` in `src/api/claude-zen-schema.js` is the single source of truth that automatically generates:

- **REST API endpoints** with full OpenAPI documentation
- **CLI command interfaces** with argument parsing and validation
- **Terminal UI (TUI) interfaces** with hotkeys and navigation
- **WebSocket events** for real-time updates

## Schema Structure

### Basic Schema Entity

```javascript
{
  // Human-readable description
  description: '🎯 Strategic product visions with phases and ROI',
  
  // Category for organization
  category: 'strategy',
  
  // Command arguments (for CLI)
  args: ['[vision-id]'],
  
  // Options and parameters
  options: {
    status: { 
      type: 'string', 
      choices: ['pending', 'approved', 'rejected'], 
      description: 'Filter by status'
    },
    priority: { 
      type: 'string', 
      choices: ['low', 'medium', 'high', 'critical'],
      description: 'Priority level'
    }
  },
  
  // Interface generation settings
  interfaces: {
    cli: { enabled: true, priority: 'high' },
    tui: { enabled: true, tab: 'visions', hotkey: 'V', icon: '🎯' },
    web: { enabled: true, endpoint: '/api/v1/visions', method: 'GET' }
  },
  
  // Data storage configuration
  storage: 'visions',
  hierarchy: 'strategic',
  
  // Extended description for documentation
  description_extended: 'Strategic visions define high-level product direction...'
}
```

## Core Schema Entities

### Strategic Level

#### Visions
Strategic product visions with phases, ROI, and approval workflows.

**Generated Endpoints:**
- `GET /api/v1/visions` - List all visions
- `POST /api/v1/visions` - Create new vision
- `GET /api/v1/visions/{id}` - Get specific vision
- `PUT /api/v1/visions/{id}` - Update vision
- `DELETE /api/v1/visions/{id}` - Delete vision

**CLI Commands:**
```bash
claude-zen visions --status approved --priority high
claude-zen visions create "AI-Powered Development"
claude-zen visions update vision-001 --status approved
```

**TUI Interface:**
- Tab: Visions (V)
- Icon: 🎯
- Hotkey: V

#### Architectural Decision Records (ADRs)
Cross-cutting architectural principles that guide development.

**Generated Endpoints:**
- `GET /api/adrs` - List ADRs
- `POST /api/adrs` - Create ADR
- `POST /api/adrs/generate` - AI-generated ADR proposals

**Special Features:**
- Auto-generation using architect-advisor plugin
- Cross-cutting influence on all other entities

### Workflow Level

#### Roadmaps
Strategic roadmaps built on architectural foundations.

**Hierarchy:** Level 2 (Strategic)
**Dependencies:** Informed by ADRs

**Generated Endpoints:**
- `GET /api/roadmaps`
- `POST /api/roadmaps`

#### Epics
Large initiatives with multi-service coordination.

**Hierarchy:** Level 3 (Initiative)
**Dependencies:** Depends on roadmaps

**Generated Endpoints:**
- `GET /api/epics`
- `POST /api/epics`

#### Features
Specific features and capabilities.

**Hierarchy:** Level 4 (Feature)
**Dependencies:** Depends on epics

#### Product Requirements Documents (PRDs)
Extended user stories with detailed specifications.

**Hierarchy:** Level 5 (Specification)
**Dependencies:** Depends on features

#### Tasks
Implementation tasks and work items.

**Hierarchy:** Level 6 (Implementation)
**Dependencies:** Depends on PRDs

### Coordination Level

#### Coordination Status
Multi-service coordination and synchronization status.

**Generated Endpoints:**
- `GET /api/coordination/status`
- `POST /api/coordination/sync`

#### Multi-Service Sync
Trigger synchronization across services.

**Special Features:**
- Cross-service coordination
- Batch synchronization operations

### Team Management

#### Teams
Team structure and member management.

**Generated Endpoints:**
- `GET /api/v1/teams`
- `POST /api/v1/teams`
- `GET /api/v1/teams/{id}/members`

#### Members
Individual team member profiles.

**Generated Endpoints:**
- `GET /api/v1/members`
- `POST /api/v1/members`

## Schema Features

### Auto-Generated Routes

The schema automatically generates Express routes with:

```javascript
// Example generated route handler
app.get('/api/v1/visions', async (req, res) => {
  try {
    const filters = extractFilters(req.query, schemaEntity.options);
    const visions = await storage.getVisions(filters);
    res.json({ visions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### CLI Integration

Each schema entity generates CLI commands:

```javascript
// Generated CLI command
program
  .command('visions')
  .description('🎯 Strategic product visions with phases and ROI')
  .option('--status <status>', 'Filter by status', ['pending', 'approved', 'rejected'])
  .option('--priority <priority>', 'Priority level', ['low', 'medium', 'high', 'critical'])
  .action(async (options) => {
    const handler = await import('./handlers/visions-handler.js');
    await handler.execute(options);
  });
```

### TUI Integration

Terminal UI tabs and navigation:

```javascript
// Generated TUI tab
{
  key: 'visions',
  label: '🎯 Visions',
  hotkey: 'V',
  component: VisionsListComponent,
  priority: 'high'
}
```

### OpenAPI Generation

Automatic OpenAPI 3.0 specification generation:

```yaml
# Generated OpenAPI spec
paths:
  /api/v1/visions:
    get:
      summary: List strategic visions
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, approved, rejected]
        - name: priority
          in: query
          schema:
            type: string
            enum: [low, medium, high, critical]
      responses:
        200:
          description: List of visions
          content:
            application/json:
              schema:
                type: object
                properties:
                  visions:
                    type: array
                    items:
                      $ref: '#/components/schemas/Vision'
```

## Schema Validation

### Input Validation

All schema entities include validation:

```javascript
const validateOptions = (options, schemaOptions) => {
  for (const [key, value] of Object.entries(options)) {
    const schemaOption = schemaOptions[key];
    if (!schemaOption) {
      throw new Error(`Unknown option: ${key}`);
    }
    
    if (schemaOption.choices && !schemaOption.choices.includes(value)) {
      throw new Error(`Invalid value for ${key}: ${value}. Must be one of: ${schemaOption.choices.join(', ')}`);
    }
    
    if (schemaOption.type === 'number' && isNaN(Number(value))) {
      throw new Error(`${key} must be a number`);
    }
  }
};
```

### Type Safety

Schema definitions provide type safety:

```javascript
// Type definitions generated from schema
interface VisionOptions {
  status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
}

interface Vision {
  id: string;
  title: string;
  description: string;
  status: VisionOptions['status'];
  priority: VisionOptions['priority'];
  phases: VisionPhase[];
  roi: ROIProjection;
}
```

## Extending the Schema

### Adding New Entities

1. **Define the entity** in `claude-zen-schema.js`:

```javascript
'my-new-entity': {
  description: '✨ My new entity description',
  category: 'custom',
  args: ['[entity-id]'],
  options: {
    type: {
      type: 'string',
      choices: ['type1', 'type2'],
      description: 'Entity type'
    },
    active: {
      type: 'boolean',
      default: true,
      description: 'Active status'
    }
  },
  interfaces: {
    cli: { enabled: true, priority: 'medium' },
    tui: { enabled: true, tab: 'custom', hotkey: 'M', icon: '✨' },
    web: { enabled: true, endpoint: '/api/my-entities', method: 'GET' }
  },
  storage: 'my_entities',
  hierarchy: 'custom'
}
```

2. **Routes are auto-generated** from the schema
3. **CLI commands are auto-generated**
4. **TUI interfaces are auto-generated**

### Custom Handlers

Add custom business logic:

```javascript
// src/handlers/my-entity-handler.js
export class MyEntityHandler {
  async execute(options) {
    // Custom business logic
    const entities = await this.getEntities(options);
    return entities;
  }
  
  async getEntities(filters) {
    // Database operations
    return await this.storage.query('my_entities', filters);
  }
}
```

### Plugin Integration

Schema entities can integrate with plugins:

```javascript
'adrs-generate': {
  description: '🤖 AI-powered ADR generation',
  // ... other properties
  architect_advisor: true, // Enables architect-advisor plugin
  ai_powered: true         // Enables AI integration
}
```

## Best Practices

### Schema Design

1. **Consistent Naming**: Use kebab-case for entity names
2. **Clear Descriptions**: Include emoji and clear descriptions
3. **Proper Hierarchy**: Set appropriate hierarchy levels
4. **Sensible Defaults**: Provide reasonable default values

### Option Design

1. **Use Enums**: Define choices for string options
2. **Type Safety**: Specify correct types
3. **Good Descriptions**: Clear, helpful descriptions
4. **Required Fields**: Mark required options appropriately

### Interface Configuration

1. **Appropriate Priorities**: Set CLI/TUI priorities correctly
2. **Logical Grouping**: Group related entities in TUI tabs
3. **Memorable Hotkeys**: Choose intuitive hotkey combinations
4. **Clear Icons**: Use descriptive emoji icons

### Storage Design

1. **Consistent Names**: Use consistent storage table names
2. **Appropriate Hierarchy**: Set logical hierarchy levels
3. **Dependencies**: Define clear dependency relationships
4. **Indexes**: Consider database indexing needs

## Schema Debugging

### Validation Tools

```bash
# Validate schema syntax
npm run validate:schema

# Generate and test all routes
npm run test:schema-routes

# Validate CLI generation
npm run test:cli-generation
```

### Common Issues

1. **Missing Required Fields**: Ensure all required fields are present
2. **Invalid Choices**: Check enum values are correct
3. **Circular Dependencies**: Avoid circular dependency chains
4. **Duplicate Endpoints**: Ensure unique endpoint paths

### Debugging Tips

1. **Use Schema Validator**: Run validation before deploying
2. **Test Generated Routes**: Verify all routes work correctly
3. **Check CLI Commands**: Test generated CLI interfaces
4. **Validate OpenAPI**: Ensure OpenAPI spec is valid