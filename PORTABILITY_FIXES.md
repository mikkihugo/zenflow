# Cross-Platform Portability Fixes

This document summarizes the fixes made to address brittle error handling and non-portable shell commands in the codebase.

## Summary of Changes

### 1. Enhanced Error Handling in `src/mcp/ruv-swarm-wrapper.js`

**Problem**: Brittle string matching for error detection that relied on exact text matching.

**Solution**: Implemented structured error handling with fallback pattern matching.

#### Changes Made:
- **Structured Error Code Handling**: Added support for JSON-formatted error messages with specific error codes
- **Pattern-Based Fallback**: Maintained compatibility with text-based error detection using regex patterns
- **Consistent Error Codes**: Introduced standardized error codes following naming conventions

#### Error Codes Supported:
- `LOGGER_METHOD_MISSING` / `ERR_LOGGER_MEMORY_USAGE`: Known logger issues
- `ERR_INITIALIZATION`: Initialization failures
- `MODULE_NOT_FOUND`: Missing dependencies
- `CONNECTION_REFUSED`: Network connectivity issues

#### Before:
```javascript
if (line.includes('logger.logMemoryUsage is not a function')) {
  // Handle error
}
```

#### After:
```javascript
try {
  const errorData = JSON.parse(line);
  if (errorData.error && errorData.error.code) {
    switch (errorData.error.code) {
      case 'LOGGER_METHOD_MISSING':
      case 'ERR_LOGGER_MEMORY_USAGE':
        // Handle known logger issues
        return;
      // ... other cases
    }
  }
} catch (e) {
  // Fallback to pattern matching
  const knownErrorPatterns = [
    {
      pattern: /logger\.logMemoryUsage is not a function/,
      code: 'LOGGER_METHOD_MISSING',
      message: 'Known ruv-swarm logger issue detected'
    }
    // ... other patterns
  ];
}
```

### 2. Cross-Platform Process Management in `src/cli/simple-commands/swarm-ui.js`

**Problem**: Used `pkill` command which is not available on Windows.

**Solution**: Replaced with `process.kill()` and cross-platform process tracking.

#### Changes Made:
- **Process Tracking**: Added `activeProcesses` Map to track spawned processes
- **Cross-Platform Termination**: Used `process.kill()` instead of `pkill`
- **Windows Support**: Added Windows-specific process termination using `taskkill`
- **Unix Support**: Used `ps` and `grep` for orphaned process cleanup

#### Before:
```javascript
exec('pkill -f "claude-flow swarm"', (error) => {
  // Handle termination
});
```

#### After:
```javascript
// Track processes
this.activeProcesses.set(processId, process);

// Cross-platform termination
for (const [processId, process] of this.activeProcesses) {
  if (process.pid && !process.killed) {
    process.kill('SIGTERM');
  }
}

// Platform-specific orphan cleanup
if (os.platform() === 'win32') {
  exec('wmic process where "commandline like \'%claude-flow swarm%\'" get processid', ...);
} else {
  exec('ps aux | grep "claude-flow swarm" | grep -v grep', ...);
}
```

### 3. Cross-Platform Command Detection in `src/cli/simple-commands/github.js`

**Problem**: Used `which` command which behaves differently across platforms.

**Solution**: Implemented cross-platform command detection with fallback path checking.

#### Changes Made:
- **Platform Detection**: Different commands for Windows (`where`) vs Unix (`command -v`)
- **Path Fallback**: Check common installation paths when command detection fails
- **Async File Access**: Use `fs.access()` to verify executable permissions

#### Before:
```javascript
execSync('which claude', { stdio: 'ignore' });
```

#### After:
```javascript
async function checkCommandAvailable(command) {
  if (platform() === 'win32') {
    execSync(`where ${command}`, { stdio: 'ignore' });
  } else {
    execSync(`command -v ${command}`, { stdio: 'ignore', shell: true });
  }
  // Fallback: check common paths
  const commonPaths = ['/usr/local/bin', '/usr/bin', ...];
  for (const dir of commonPaths) {
    await access(join(dir, command), constants.X_OK);
  }
}
```

## Integration Tests

Added comprehensive integration tests to verify the fixes:

### `tests/integration/portability-fixes.test.js`
- Verifies source code contains proper patterns
- Ensures non-portable commands are not used
- Validates error code consistency
- Tests cross-platform compatibility

### `tests/integration/error-handling-patterns.test.js`
- Tests structured error handling
- Validates error code patterns
- Tests graceful fallback behavior

### `tests/integration/functional-portability.test.js`
- Tests actual functionality of wrapper classes
- Validates cross-platform command detection
- Tests process management behavior

## Benefits

1. **Improved Reliability**: Error handling is more robust and less prone to breaking with minor text changes
2. **Cross-Platform Compatibility**: Code now works on Windows, macOS, and Linux
3. **Better Error Reporting**: Structured error codes provide clearer error identification
4. **Maintainability**: Centralized error patterns make it easier to add new error types

## Testing Results

All integration tests pass, confirming:
- ✅ No use of `pkill` command
- ✅ No use of `which` command  
- ✅ Structured error handling implemented
- ✅ Cross-platform process management
- ✅ Consistent error code patterns
- ✅ Proper cleanup and resource management

## Compatibility

The changes maintain backward compatibility while adding new functionality:
- Legacy text-based error detection still works (fallback)
- Existing process handling continues to work
- Command detection gracefully degrades to path checking

## Future Enhancements

Consider these additional improvements:
1. **Process Monitoring**: Add health checks for tracked processes
2. **Error Telemetry**: Send error codes to monitoring systems
3. **Config-Driven Patterns**: Allow custom error patterns via configuration
4. **Process Pools**: Implement process pooling for better resource management