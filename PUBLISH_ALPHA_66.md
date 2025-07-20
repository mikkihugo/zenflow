# Alpha.66 Release Instructions

## Changes Included

### 1. Hooks Command Fix
- Fixed "command.toLowerCase is not a function" error
- Added type checking for command parameter
- Improved boolean parameter parsing

### 2. ARM64 macOS Support (#378)
- Added automatic SQLite binding verification
- Enhanced postinstall script with ARM64 detection
- Graceful fallback to in-memory storage if bindings fail
- Added node20-macos-arm64 to pkg targets

## Files Modified
1. `package.json` - Version updated to 2.0.0-alpha.66
2. `CHANGELOG.md` - Added alpha.66 release notes
3. `src/cli/simple-commands/hooks.js` - Fixed toLowerCase error
4. `src/cli/help-text.js` - Updated version
5. `src/cli/simple-cli.js` - Updated version
6. `scripts/install-arm64.js` - Added ARM64 compatibility script

## Publishing Steps

```bash
# 1. Update version in bin
npm run update-version

# 2. Commit changes
git add -A
git commit -m "chore: Release v2.0.0-alpha.66"

# 3. Push to branch
git push origin alpha-66

# 4. Publish to npm
npm publish --tag alpha

# 5. Verify publication
npm view claude-flow@alpha version
# Should show: 2.0.0-alpha.66

# 6. Test the fixes
npx claude-flow@alpha hooks pre-command --command "test" --validate-safety true
# Should work without toLowerCase error
```

## Testing

### Test Hooks Fix:
```bash
# Test with empty command
npx claude-flow@alpha hooks pre-command --command "" --validate-safety true

# Test with valid command
npx claude-flow@alpha hooks pre-command --command "echo test" --validate-safety true
```

### Test ARM64 Support:
On Apple Silicon Mac:
```bash
npm install -g claude-flow@alpha
# Should detect ARM64 and attempt to rebuild SQLite bindings
```

## GitHub Actions

After publishing:
1. Create GitHub release v2.0.0-alpha.66
2. Update issue #415 (alpha.66 planning)
3. Close PR #378 as merged
4. Create PR for alpha-66 branch