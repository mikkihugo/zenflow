# Claude Flow Project

This project is configured for Claude Code integration.

## ⚠️ CRITICAL: DO NOT MODIFY .claude/ DIRECTORY

**🚨 NEVER TOUCH `.claude/` DIRECTORY** - This is for **THIS PROJECT'S DEVELOPMENT ONLY**:
- `.claude/settings.json` = Our development hooks and configuration
- `.claude/commands/` = Our development command documentation  
- `.claude/cache/` = Our development session data

**✅ MODIFY TEMPLATE INSTEAD**: 
- `templates/claude-zen/` = Template files that get copied to other projects
- `templates/claude-zen/settings.json` = Template hooks for new projects

**The Rule**: 
- Changes to `.claude/` = Affects this development project only
- Changes to `templates/claude-zen/` = Affects all new projects created with `claude-zen init`

## Getting Started

Run `claude-zen --help` to see available commands.

## Commands

- `claude-zen init` - Initialize project with Claude Code integration
- `claude-zen status` - Show project status  
- `claude-zen help` - Show help

## Development

This project uses:
- **Template system** for `claude-zen init` functionality
- **MCP integration** with ruv-swarm for coordination
- **Plugin architecture** for extensible functionality

## MCP Tools

When using ruv-swarm MCP tools with Claude Code:

### Setup
```bash
# Add ruv-swarm MCP server to Claude Code
claude mcp add ruv-swarm npx ruv-swarm mcp start
```

### Key Tools
- `mcp__ruv-swarm__swarm_init` - Initialize coordination
- `mcp__ruv-swarm__agent_spawn` - Create specialized agents
- `mcp__ruv-swarm__task_orchestrate` - Coordinate complex tasks
- `mcp__ruv-swarm__swarm_status` - Monitor coordination

### Best Practices
- **Batch operations** - Combine multiple tool calls in single messages
- **Parallel execution** - Use swarms for complex multi-step tasks
- **Memory management** - Maintain context across sessions

## Support

- Documentation: https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm
- Issues: https://github.com/ruvnet/ruv-FANN/issues