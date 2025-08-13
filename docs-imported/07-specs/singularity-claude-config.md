# GitHub Copilot Environment Instructions

## 🎯 **CRITICAL: Development Environment Setup**

### **Immediate Environment Detection:**
- **Language Stack**: Elixir 1.19.0-rc.0 + OTP 28 + Gleam latest
- **Environment Manager**: Nix Flakes (use `nix develop` to enter environment)
- **Package Manager**: Mix (Elixir), Gleam package manager
- **Database**: PostgreSQL 16 (configured in flake.nix)

### **🚨 CRITICAL: Elixir 1.19.0-rc.0 + OTP 28 I/O Issue**

**Status**: ✅ **RESOLVED** - All services working correctly

**Issue**: Elixir 1.19.0-rc.0 startup banner crashes with I/O termination on OTP 28
**Solution**: Use I/O redirection in PM2 startup scripts
**Impact**: Storage-service running successfully (✅ 23+ min uptime, 0 restarts)

**For all Elixir services, use this PM2 startup pattern:**
```bash
#!/bin/bash
export LANG=C.UTF-8 && export LC_ALL=C.UTF-8
exec nix-shell --run "iex -S mix" > /tmp/logs/stdout.log 2> /tmp/logs/stderr.log
```

**GitHub Issue**: [#14671](https://github.com/elixir-lang/elixir/issues/14671) - Reported to Elixir team

### **🚀 Quick Start Commands:**
```bash
# Enter development environment (REQUIRED FIRST STEP)
nix develop

# For Gleam projects (hex-server, security-service)
gleam deps download
gleam build
gleam test

# For Elixir projects (storage-service, development-service)
mix deps.get
mix compile  
mix test
```

### **📁 Project Structure:**
- `active-services/hex-server/` - **Gleam** HTTP service (Port 4001)
- `active-services/storage-service/` - **Elixir** storage service  
- `active-services/security-service/` - **Gleam** security service (Port 4107)
- `services/foundation/development-service/` - **Elixir** development service

### **🔧 Common Development Patterns:**

#### **For Gleam Services:**
- Entry point: `src/[service_name].gleam`
- HTTP server: Usually `src/server.gleam` with Wisp framework
- Router: `src/router.gleam`
- Tests: `test/` directory

#### **For Elixir Services:**
- Entry point: `lib/[service_name]/application.ex`
- Web interface: Phoenix framework in `lib/[service_name]_web/`
- Config: `config/config.exs`, `config/dev.exs`

### **🧪 Testing & Verification:**
```bash
# Test Gleam compilation
cd active-services/hex-server && nix develop --command gleam build

# Test Elixir compilation  
cd active-services/storage-service && nix develop --command mix compile

# Health checks
curl http://localhost:4001/health  # hex-server
curl http://localhost:4107/health  # security-service
```

### **🚨 Important Notes:**
1. **Always use `nix develop`** - Do not rely on system packages
2. **OTP 28 is required** - Newer features and performance
3. **Gleam 1.11.1** - Latest stable version with recent features
4. **PM2 process management** - Services run under PM2 in production

### **🎯 Issue Implementation Guidelines:**
1. **Start with `nix develop`** to ensure correct environment
2. **Check existing patterns** in similar files before implementing
3. **Follow project conventions** (naming, structure, error handling)
4. **Add tests** for new functionality
5. **Update health checks** if adding new services/endpoints

### **📦 Key Dependencies Available:**
- **HTTP**: Wisp (Gleam), Phoenix (Elixir)
- **Database**: PostgreSQL, SQLite, Redis
- **JSON**: Built-in JSON support (OTP 28/Elixir 1.18)
- **Testing**: Gleeunit (Gleam), ExUnit (Elixir)
- **Process Management**: OTP supervisors, PM2

### **🔍 Debugging Commands:**
```bash
# Check environment
nix develop --command which gleam
nix develop --command which elixir

# Check versions
nix develop --command gleam --version
nix develop --command elixir --version

# Check OTP version
nix develop --command erl -noshell -eval 'io:format("~s~n", [erlang:system_info(otp_release)]), halt().'
```

This ensures you have the **exact same environment** as the development team and can implement issues successfully from the start!