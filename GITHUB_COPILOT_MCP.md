# GitHub Copilot MCP Integration

This document outlines the external MCP (Model Context Protocol) servers configured for enhanced GitHub Copilot functionality.

## External MCP Servers

### Research and Analysis
- **Context7** (`https://mcp.context7.com/mcp`)
  - Type: HTTP
  - Purpose: Research and analysis tools for enhanced development workflow

### Knowledge Base
- **DeepWiki** (`https://mcp.deepwiki.com/sse`)
  - Type: SSE
  - Purpose: Knowledge base and documentation research

### Git Operations  
- **GitMCP** (`https://gitmcp.io/docs`)
  - Type: HTTP
  - Purpose: Git operations and repository management tools

### Code Analysis
- **Semgrep** (`https://mcp.semgrep.ai/sse`)
  - Type: SSE
  - Purpose: Code analysis and security scanning for code quality

## Usage

These external servers provide GitHub Copilot with enhanced research and development capabilities:

1. **Research tasks**: Use Context7 for in-depth analysis
2. **Documentation**: Query DeepWiki for knowledge base searches  
3. **Git operations**: Leverage GitMCP for repository management
4. **Security**: Apply Semgrep for code quality and vulnerability detection

## Configuration

The GitHub Copilot MCP configuration is defined in:
- `.github/copilot-config.yml` - Main configuration with external MCP servers
- `.github/copilot-instructions.md` - Detailed instructions
- `.github/copilot-context.md` - Context overview
- `.github/copilot_settings.yml` - External MCP server settings
- `claude_desktop_config.json` - Claude Desktop MCP configuration
- `.copilotrc.json` - Project-specific Copilot settings

### External Server Configuration

Each external MCP server is configured with:
- **URL**: Server endpoint for tool access
- **Transport**: HTTP or SSE protocol
- **Timeout**: 30 second timeout for requests
- **Retry**: 3 retry attempts for failed requests
- **Capabilities**: Specific tool categories available

### Claude Desktop Integration

To use these external servers in Claude Desktop, copy the `claude_desktop_config.json` to your Claude Desktop settings directory:

```bash
# macOS
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
cp claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json

# Linux
cp claude_desktop_config.json ~/.config/Claude/claude_desktop_config.json
```

This setup follows [GitHub's recommendations](https://github.blog/ai-and-ml/github-copilot/onboarding-your-ai-peer-programmer-setting-up-github-copilot-coding-agent-for-success/) for optimal copilot coding agent configuration.