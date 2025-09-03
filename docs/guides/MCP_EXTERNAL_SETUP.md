# GitHub Copilot External MCP Server Configuration

This repository is configured to use external MCP (Model Context Protocol) servers with GitHub Copilot, enabling enhanced research, analysis, and development capabilities through remote AI tools.

## 🌐 Configured External MCP Servers

### Research & Analysis

- **Context7** (`https://mcp.context7.com/mcp`)
  - Type: HTTP
  - Purpose: Advanced research and analysis tools
  - Capabilities: Research, analysis, documentation, code review

### Knowledge Base

- **DeepWiki** (`https://mcp.deepwiki.com/sse`)
  - Type: Server-Sent Events (SSE)
  - Purpose: Knowledge base and documentation research
  - Capabilities: Knowledge search, reference lookup, concept explanation

### Git Operations

- **GitMCP** (`https://gitmcp.io/docs`)
  - Type: HTTP
  - Purpose: Git operations and repository management
  - Capabilities: Repository analysis, branch management, commit analysis

### Security Analysis

- **Semgrep** (`https://mcp.semgrep.ai/sse`)
  - Type: Server-Sent Events (SSE)
  - Purpose: Code analysis and security scanning
  - Capabilities: Security scanning, code quality checks, vulnerability analysis

## 📁 Configuration Files

### Core Configuration Files

- `.github/copilot_settings.yml` - External MCP server settings for GitHub Copilot
- `claude_desktop_config.json` - Claude Desktop MCP configuration
- `.copilotrc.json` - Project-specific Copilot settings
- `.github/copilot-config.yml` - Main Copilot configuration

### Local MCP Server

- `src/interfaces/mcp/` - Local MCP server implementation
- Local server provides internal coordination and swarm management tools

## 🚀 Quick Setup

### 1. Validate Configuration

```bash
pnpm run mcp:validate
```

### 2. Copy Claude Desktop Configuration

Choose your platform:

**macOS:**

```bash
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**

```cmd
copy claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**

```bash
cp claude_desktop_config.json ~/.config/Claude/claude_desktop_config.json
```

### 3. Restart Applications

1. Restart Claude Desktop to load new MCP servers
2. Restart GitHub Copilot in your IDE
3. Verify external MCP tools are available

## 🔧 Available Commands

```bash
# Start local MCP server
pnpm run mcp

# Validate external MCP configuration
pnpm run mcp:validate

# Test external server connections (simulation)
pnpm run mcp:test
```

## 🛠️ Using External MCP Tools

### In Claude Desktop

Once configured, you can use external MCP tools directly:

```
Research AI development best practices using Context7
Search DeepWiki for TypeScript design patterns
Analyze repository structure with GitMCP
Run security scan with Semgrep
```

### In GitHub Copilot

GitHub Copilot will automatically have access to external tools for:

- Enhanced code analysis and suggestions
- Research-backed recommendations
- Security-aware development guidance
- Git operation assistance

## 🏗️ Architecture

### External Server Integration

```
GitHub Copilot ←→ Claude Desktop ←→ External MCP Servers
                                  ├── Context7 (Research)
                                  ├── DeepWiki (Knowledge)
                                  ├── GitMCP (Git Ops)
                                  └── Semgrep (Security)
```

### Local Coordination

```
GitHub Copilot ←→ Local MCP Server ←→ Claude-Zen Platform
                                    ├── Swarm Coordination
                                    ├── Agent Management
                                    ├── Neural Processing
                                    └── Memory Management
```

## 📊 Configuration Validation

The configuration includes:

- ✅ 4 external MCP servers configured
- ✅ HTTP and SSE transport protocols supported
- ✅ Timeout and retry mechanisms
- ✅ Local fallback server available
- ✅ Tool discovery and caching
- ✅ Security and validation settings

## 🔍 Troubleshooting

### Common Issues

1. **External servers not accessible**
   - Check internet connectivity
   - Verify server URLs are correct
   - Ensure firewall allows HTTPS/SSE connections

2. **Claude Desktop not recognizing servers**
   - Verify configuration file location
   - Restart Claude Desktop completely
   - Check configuration file syntax

3. **GitHub Copilot not using external tools**
   - Restart IDE/editor
   - Check Copilot extension settings
   - Verify Copilot has MCP integration enabled

### Debug Commands

```bash
# Validate all configuration files
pnpm run mcp:validate

# Test local MCP server
pnpm run mcp

# Check server connectivity (simulation)
pnpm run mcp:test
```

## 📚 References

- [GitHub Copilot MCP Integration Guide](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)
- [GitHub Copilot Setup Best Practices](https://github.blog/ai-and-ml/github-copilot/onboarding-your-ai-peer-programmer-setting-up-github-copilot-coding-agent-for-success/)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)

## 🤝 Contributing

When adding new external MCP servers:

1. Update configuration files
2. Add server details to documentation
3. Test connectivity and tool availability
4. Update validation scripts

## 📄 License

This configuration follows the project's MIT license. External MCP servers have their own terms of service.

---

**Note:** This setup enables GitHub Copilot to use external MCP tools for enhanced development capabilities. The configuration follows GitHub's recommended practices for optimal copilot coding agent performance.
