# Claude Flow v2.0.0-alpha.51 Release Notes

Released: January 14, 2025

## 🔄 Version Update

This is a version bump release that includes all features from alpha.50 plus:

### Changes in alpha.51:
- Updated version numbers in all CLI files
- Prepared for npm publication

### Features from alpha.50:

#### 🚀 New Feature: Hive Mind Resume Functionality

The hive-mind system now supports full session persistence and resumption:

**New Commands:**
- `hive-mind resume <session-id>` - Resume a specific session
- `hive-mind sessions` - List all available sessions

**Key Features:**
- Automatic session creation on swarm spawn
- Progress persistence with 30-second auto-save intervals
- Graceful shutdown handling (Ctrl+C pauses session)
- Full context restoration on resume
- Claude Code integration with --claude flag

## Installation

```bash
npm install -g claude-flow@alpha
```

## Usage

```bash
# Start a new hive-mind session
npx claude-flow@alpha hive-mind spawn "Build microservices" --namespace api

# Later, list sessions
npx claude-flow@alpha hive-mind sessions

# Resume a specific session
npx claude-flow@alpha hive-mind resume <session-id>

# Resume with Claude Code
npx claude-flow@alpha hive-mind resume <session-id> --claude
```

## Technical Details

- SQLite-based session persistence
- HiveMindSessionManager for lifecycle management
- AutoSaveMiddleware with configurable intervals
- Comprehensive test suite (80+ tests)
- Full documentation in docs/hive-mind-resume.md

---

For more information, see the [full documentation](https://github.com/ruvnet/claude-flow).