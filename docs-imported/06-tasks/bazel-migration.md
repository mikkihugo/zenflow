# Bazel Migration Guide for Singularity Engine

## 🚀 Prerequisites

Before starting the migration, ensure Bazel is installed:

```bash
# Option 1: Use Nix (includes Bazel automatically)
nix develop

# Option 2: Install system-wide
./scripts/install-bazel.sh

# Verify installation
bazel --version  # Should show 7.1.0 (via .bazelversion)
```

## Overview

This guide documents the migration from Nx to Bazel for the Singularity Engine monorepo. Bazel provides hermetic builds, better caching, and true polyglot support for our diverse technology stack.

## Current Status

✅ **Completed:**

- Bazel 7.1.0 configured with Bzlmod
- Custom rules for Elixir and Gleam created
- Nix flake updated with Bazel and all language toolchains
- Core BUILD.bazel files created for active services
- Migration helper script created

🚧 **In Progress:**

- Converting remaining Nx project.json files to BUILD.bazel
- Setting up inter-project dependencies
- Configuring remote caching

## Technology Stack Support

### ✅ Supported Languages

1. **Elixir** (Custom Rules)

   - `elixir_library` - For libraries
   - `elixir_binary` - For executables
   - Toolchain: Elixir 1.18 + OTP 28

2. **Gleam** (Custom Rules)

   - `gleam_library` - For libraries
   - `gleam_binary` - For executables
   - Targets: Erlang and JavaScript

3. **TypeScript/JavaScript**

   - Using `@aspect_rules_ts` and `@rules_nodejs`
   - SWC for fast transpilation
   - Full npm/pnpm support

4. **Go**

   - Using `@rules_go` and Gazelle
   - Automatic BUILD file generation

5. **Rust**

   - Using `@rules_rust`
   - Cargo integration

6. **Python**
   - Using `@rules_python`
   - pip integration

## Quick Start

```bash
# Enter Nix development shell (includes Bazel)
nix develop

# Build everything
bazel build //...

# Run tests
bazel test //...

# Build specific target
bazel build //active-services/hex-server

# Run specific service
bazel run //active-services/storage-service
```

## Migration Steps

### 1. Automatic Migration

Use the migration helper script for basic conversion:

```bash
./scripts/migrate-nx-to-bazel.sh
```

### 2. Manual Adjustments

After running the script, you'll need to:

1. **Update Dependencies**: Add explicit dependencies between targets
2. **Configure Tests**: Ensure test targets are properly configured
3. **Handle Assets**: Add filegroup rules for non-code files
4. **Set Visibility**: Adjust visibility rules as needed

### 3. Example Conversions

#### TypeScript Service (from Nx)

```javascript
// project.json
{
  "name": "my-service",
  "tags": ["tech:typescript", "type:service"]
}
```

Becomes:

```python
# BUILD.bazel
load("//bazel:nx_migration.bzl", "nx_typescript_service")

nx_typescript_service(
    name = "my-service",
    tags = ["tech:typescript", "type:service"],
)
```

#### Elixir Service

```python
# BUILD.bazel
load("//bazel:elixir_rules.bzl", "elixir_binary", "elixir_library")

elixir_library(
    name = "storage_lib",
    srcs = glob(["lib/**/*.ex"]),
    mix_exs = "mix.exs",
)

elixir_binary(
    name = "storage-service",
    srcs = glob(["lib/**/*.ex"]),
    mix_exs = "mix.exs",
    main_module = "StorageService.Application",
    deps = [":storage_lib"],
)
```

## Key Differences from Nx

1. **Explicit Dependencies**: Bazel requires explicit declaration of all dependencies
2. **Hermetic Builds**: Builds are isolated and reproducible
3. **Language-Specific Rules**: Each language has its own rule set
4. **No Implicit Graph**: Dependencies must be explicitly stated
5. **Better Caching**: Content-addressed caching across all builds

## Build Performance

### Local Caching

```bash
# Enable disk cache
build --disk_cache=~/.cache/bazel-disk-cache
```

### Remote Caching (Future)

```bash
# Configure remote cache server
build --remote_cache=grpc://your-cache-server:9090
```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**

   ```
   ERROR: missing dependency '@npm//some-package'
   ```

   Solution: Add to package.json and run `bazel run @npm//:npm install`

2. **Elixir/Gleam Compilation Errors**

   ```
   ERROR: mix command not found
   ```

   Solution: Ensure you're in `nix develop` shell

3. **Test Failures**
   ```
   ERROR: test timeout
   ```
   Solution: Increase timeout in test rule: `timeout = "long"`

## CI/CD Integration

Update your CI pipelines to use Bazel:

```yaml
# GitHub Actions example
- name: Setup Bazel
  uses: bazelbuild/setup-bazel@v1
  with:
    bazel-version: "7.1.0"

- name: Build
  run: bazel build //...

- name: Test
  run: bazel test //...
```

## Best Practices

1. **Use Macros**: Create reusable macros for common patterns
2. **Minimize Globs**: Be specific about source files when possible
3. **Tag Everything**: Use tags for organization and filtering
4. **Version Lock**: Pin all external dependencies
5. **Clean Regularly**: Run `bazel clean` to free disk space

## Next Steps

1. Complete migration of all project.json files
2. Set up remote caching infrastructure
3. Optimize build performance
4. Create custom lint rules
5. Integrate with deployment pipelines

## Resources

- [Bazel Documentation](https://bazel.build)
- [Bazel for Elixir (Custom)](./bazel/elixir_rules.bzl)
- [Bazel for Gleam (Custom)](./bazel/gleam_rules.bzl)
- [Migration Script](./scripts/migrate-nx-to-bazel.sh)
