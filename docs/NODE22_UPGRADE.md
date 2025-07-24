# Node.js 22 Upgrade Guide

## Overview

Claude-zen has been upgraded to use Node.js 22, which provides significant performance improvements and new features.

## Node.js 22 Benefits

### Performance Improvements
- **V8 Maglev Compiler**: The new V8 12.4 engine includes the Maglev compiler, providing significant performance boosts for short-lived, CPU-intensive command-line applications.
- **Better Memory Management**: Improved garbage collection and memory optimization.

### New Features
- **require()ing ESM Graphs**: You can now use require() to import ES modules under certain conditions, easing the transition from CommonJS.
- **Built-in WebSocket Client**: A standards-compliant WebSocket client is now included by default via the --experimental-websocket flag.
- **Glob Support**: The node:fs module now includes glob and globSync for pattern-based file matching.

## Configuration Changes

### .mise.toml
```toml
[tools]
node = "22"
```

### package.json Updates
- Engine requirement: `"node": ">=22.0.0"`
- Pkg targets updated from node20 to node22
- npm scripts now use Node.js 22 wrapper

### New Scripts
- `scripts/node22.sh`: Wrapper script that ensures all Node.js commands use version 22 via mise
- Updated `bin/claude-zen` to use Node.js 22

## Usage

### Development
```bash
# All npm scripts now use Node.js 22 automatically
npm run dev
npm run start
npm run test

# Direct Node.js 22 usage
./scripts/node22.sh node --version  # v22.12.0
```

### CLI Usage
```bash
# The CLI now automatically uses Node.js 22
./bin/claude-zen --version
./bin/claude-zen help
```

## Migration Notes

1. **Backwards Compatibility**: Code should work the same way, but with better performance
2. **Testing**: Some Jest module issues may occur due to experimental VM modules - this is expected
3. **Dependencies**: All existing dependencies are compatible with Node.js 22

## Troubleshooting

If you encounter issues:

1. **Check Node.js version**: `./scripts/node22.sh node --version`
2. **Reinstall dependencies**: `npm install`
3. **Clear cache**: `npm cache clean --force`
4. **Update mise**: `mise self-update`

## Performance Benefits

- Faster startup times for CLI commands
- Better performance for AI processing tasks
- Improved concurrent operation handling
- More efficient memory usage