# Claude Code Zen 🚀

[![Version](https://img.shields.io/npm/v/@zen-ai/claude-code-zen)](https://www.npmjs.com/package/@zen-ai/claude-code-zen)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**All-in-One AI Development Platform**

Complete AI development platform with GitHub Copilot integration, web dashboard, neural WASM modules, and 52+ packages - all bundled in self-contained cross-platform binaries.

## ✨ Features

- **🔐 GitHub Copilot Authentication**: Built-in OAuth flow for seamless Copilot integration
- **🖥️ Complete Server Stack**: Full backend with all 52+ packages included
- **🌐 Web Dashboard**: Svelte-based real-time monitoring and control interface
- **🧠 Neural WASM Modules**: High-performance neural processing capabilities
- **📦 5-Tier Architecture**: Direct package imports with comprehensive implementation layers
- **⚡ Cross-Platform Binaries**: Self-contained executables for Linux, macOS, Windows
- **🔧 Development Tools**: Complete AI development toolkit

## 🚀 Quick Start

### Installation

```bash
# Install globally via npm
npm install -g @zen-ai/claude-code-zen

# Or via pnpm
pnpm install -g @zen-ai/claude-code-zen
```

### Basic Usage

```bash
# Authenticate with GitHub Copilot
claude-zen auth copilot

# Start server (default port 3000)
claude-zen

# Start with custom port
claude-zen --port 3001

# Check authentication status
claude-zen auth status
```

### Binary Usage (No Node.js Required)

```bash
# Linux/macOS
./claude-zen auth copilot
./claude-zen --port 3001

# Windows
claude-zen.cmd auth copilot
claude-zen.cmd --port 3001
```

## 🏗️ Architecture

**5-Tier Package System** with 52+ packages:

- **Tier 1 (Public)**: Foundation utilities and package integrations
- **Tier 2 (Private)**: Core implementation packages
- **Tier 3 (Internal)**: Advanced coordination systems
- **Tier 4 (Restricted)**: Security-critical components
- **Tier 5 (Deep Core)**: Ultra-restricted neural and ML systems

## 🔧 Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/zen-neural/claude-code-zen
cd claude-code-zen

# Install dependencies
pnpm install

# Build all packages and create binaries
pnpm build

# Development mode
pnpm dev
```

### Build Output

The build process creates:

- **Cross-platform binaries**: Linux, macOS, Windows executables
- **Node.js bundle**: Single JavaScript file for environments with Node.js
- **Smart launchers**: Auto-detect best available binary
- **Complete package**: Everything bundled, no external dependencies

### Scripts

```bash
pnpm build          # Build everything and create binaries
pnpm dev           # Start development servers
pnpm test          # Run tests
pnpm lint          # Lint and format code
pnpm type-check    # TypeScript type checking
pnpm clean         # Clean build artifacts
```

## 📦 Package Contents

When you install `@zen-ai/claude-code-zen`, you get:

- ✅ **Self-contained binaries** (Linux, macOS, Windows)
- ✅ **Complete auth system** (GitHub Copilot OAuth)
- ✅ **Full server stack** (all 52+ packages)
- ✅ **Web dashboard** (Svelte interface)
- ✅ **Neural WASM modules** (high-performance processing)
- ✅ **Smart launchers** (automatic binary selection)
- ✅ **Zero external dependencies**

## 🌐 Web Interface

Access the web dashboard at:

- Local: `http://localhost:3000` (default)
- Custom port: `http://localhost:YOUR_PORT`

Features:

- Real-time system monitoring
- Package management
- Configuration interface
- Performance metrics

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zen-neural/claude-code-zen/issues)
- **Documentation**: See `/docs` directory
- **Examples**: See `/examples` directory

---

**Claude Code Zen** - Everything you need for AI development, all in one package. 🚀
