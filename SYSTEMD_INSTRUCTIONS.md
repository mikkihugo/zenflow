# Claude Code Zen - Systemd Service Management

## 🚀 Quick Start Commands

### Service Control

```bash
# Start the service
sudo systemctl start claude-zen

# Stop the service
sudo systemctl stop claude-zen

# Restart the service (graceful with auto port cleanup)
sudo systemctl restart claude-zen

# Reload configuration without stopping
sudo systemctl reload claude-zen

# Check service status
sudo systemctl status claude-zen

# Enable auto-start on boot
sudo systemctl enable claude-zen

# Disable auto-start on boot
sudo systemctl disable claude-zen
```

### Development & Debugging

```bash
# View real-time logs
sudo journalctl -u claude-zen -f

# View recent logs (last 50 lines)
sudo journalctl -u claude-zen -n 50

# View logs since specific time
sudo journalctl -u claude-zen --since "1 hour ago"

# View error logs only
sudo journalctl -u claude-zen -p err

# Clear old logs
sudo journalctl --vacuum-time=7d
```

### Manual Port Management

```bash
# Kill anything on port 3000 manually
sudo ss -tlnp | grep :3000 | grep -o "pid=[0-9]*" | cut -d"=" -f2 | xargs -r sudo kill -9

# Check what's using port 3000
sudo ss -tlnp | grep :3000
```

## 🔧 Service Features

### Automatic Port Cleanup

- **ExecStartPre** automatically kills any process using port 3000 before starting
- No manual intervention needed for port conflicts

### TypeScript Error Handling

- Uses development runner with TypeScript compile error visualization
- Displays errors in both terminal (journalctl) and web interface (http://localhost:3000)
- Auto-restarts when TypeScript errors are fixed

### Graceful Restarts

- **SIGTERM** for graceful shutdown (30 second timeout)
- **SIGUSR2** for reload without restart
- Connection draining and zero-downtime deployment

### Security Features

- Runs as user `mhugo` (not root)
- Resource limits: 65536 file descriptors, 32768 processes
- Automatic restart on failure

## 📍 Service Locations

### Service File

```bash
/etc/systemd/system/claude-zen.service
```

### Application

```bash
/home/mhugo/code/claude-code-zen/
```

### Logs

```bash
journalctl -u claude-zen
```

## 🔄 Reload Instructions

### 1. After Code Changes

```bash
# Service automatically detects TypeScript changes and restarts
# No manual action needed - just save your files!

# Or manually restart if needed:
sudo systemctl restart claude-zen
```

### 2. After Service File Changes

```bash
# Copy updated service file
sudo cp claude-zen.service /etc/systemd/system/

# Reload systemd configuration
sudo systemctl daemon-reload

# Restart service with new configuration
sudo systemctl restart claude-zen
```

### 3. After Package.json Changes

```bash
# Restart to pick up new dependencies
sudo systemctl restart claude-zen
```

### 4. For Zero-Downtime Code Reload

```bash
# Send reload signal (if supported by the application)
sudo systemctl reload claude-zen

# Or use kill directly
sudo kill -SIGUSR2 $(systemctl show --property MainPID --value claude-zen)
```

## 🌐 Access Points

### Web Interface

- **Production**: http://localhost:3000/
- **Health Check**: http://localhost:3000/healthz
- **API Documentation**: http://localhost:3000/api/docs

### Error Display

- **When TypeScript fails**: http://localhost:3000 shows auto-refreshing error page
- **Terminal logs**: `sudo journalctl -u claude-zen -f`

## 🚨 Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status claude-zen

# Check logs for errors
sudo journalctl -u claude-zen -n 20

# Check TypeScript compilation
cd /home/mhugo/code/claude-code-zen
npx tsc --noEmit

# Manual port cleanup
sudo ss -tlnp | grep :3000 | grep -o "pid=[0-9]*" | cut -d"=" -f2 | xargs -r sudo kill -9
```

### TypeScript Errors

- Service automatically handles TypeScript errors
- View errors at http://localhost:3000 when compilation fails
- Fix TypeScript errors and service auto-restarts

### Port Conflicts

- Service automatically clears port 3000 on startup
- Manual cleanup: `sudo ss -tlnp | grep :3000`

### Performance Issues

```bash
# Check resource usage
sudo systemctl status claude-zen

# Check memory/CPU
top -p $(systemctl show --property MainPID --value claude-zen)

# Check file descriptor usage
ls /proc/$(systemctl show --property MainPID --value claude-zen)/fd | wc -l
```

## 🛠️ Advanced Configuration

### Environment Variables

Edit `/etc/systemd/system/claude-zen.service`:

```ini
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0
Environment=DEBUG=claude-zen:*
```

### Resource Limits

```ini
LimitNOFILE=65536
LimitNPROC=32768
LimitMEMLOCK=64M
```

### Custom Restart Policy

```ini
Restart=always
RestartSec=10
StartLimitBurst=5
StartLimitIntervalSec=60
```

---

## 🎯 Quick Reference Card

```bash
# Start/Stop/Status
sudo systemctl start|stop|restart|status claude-zen

# Logs (live)
sudo journalctl -u claude-zen -f

# Auto port cleanup + start
sudo systemctl restart claude-zen

# Reload after service file changes
sudo systemctl daemon-reload && sudo systemctl restart claude-zen

# Web interface
curl http://localhost:3000/healthz
```
