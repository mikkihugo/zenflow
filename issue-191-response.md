# Response to Issue #191

Thank you @lontivero for the excellent bug report! You've identified an important issue with our alpha release process.

## Root Cause Identified

You're absolutely correct - the `build:binary` script wasn't being run before publishing alpha versions. I found the issue in our `package.json`:

```json
"prepublishOnly": "echo 'Alpha release - skipping build/test/lint for now'"
```

This was causing:
1. The binary in `bin/claude-flow` to remain at the old version (alpha.27)
2. The VERSION variable in the shell script to not get updated
3. All subsequent alpha releases (28-37) to ship with the stale binary

## Fix Applied

I've already corrected the version in `bin/claude-flow` for alpha.37:
```bash
VERSION="2.0.0-alpha.37"
```

## Next Steps

For the next alpha release (alpha.38), we'll:

1. **Fix the build process** - Update `prepublishOnly` to properly build binaries:
   ```json
   "prepublishOnly": "npm run build"
   ```

2. **Automate version updates** - Create a script to automatically update the VERSION in the shell script during build

3. **Add version validation** - Add a pre-publish check to ensure the binary version matches package.json

## Workaround for Current Users

Until alpha.38 is released, users can use the JavaScript entry point directly:
```bash
npx claude-flow@alpha --version  # This will show the correct version
```

Thanks again for the detailed reproduction steps - they made it easy to identify and fix the issue! 🙏

The fix will be included in alpha.38, which we'll publish shortly.