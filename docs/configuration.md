# Configuration Guide

Complete guide to configuring Claude-Flow for your specific needs, from basic setup to advanced customization.

## Configuration File Structure

Claude-Flow uses a JSON configuration file with the following structure:

```json
{
  "orchestrator": { /* Core orchestration settings */ },
  "agents": { /* Agent defaults and policies */ },
  "tasks": { /* Task management settings */ },
  "memory": { /* Memory system configuration */ },
  "terminal": { /* Terminal integration settings */ },
  "coordination": { /* Resource coordination settings */ },
  "mcp": { /* MCP server configuration */ },
  "security": { /* Security and authentication */ },
  "logging": { /* Logging configuration */ },
  "monitoring": { /* Monitoring and metrics */ },
  "profiles": { /* Named configuration profiles */ }
}
```

## Quick Configuration

### Initialize Default Configuration

```bash
claude-flow config init
```

This creates `claude-flow.config.json` with sensible defaults:

```json
{
  "orchestrator": {
    "maxConcurrentAgents": 10,
    "taskQueueSize": 100,
    "healthCheckInterval": 30000,
    "shutdownTimeout": 30000,
    "gracefulShutdown": true
  },
  "memory": {
    "backend": "sqlite",
    "cacheSizeMB": 100,
    "syncInterval": 5000,
    "conflictResolution": "crdt"
  },
  "terminal": {
    "type": "auto",
    "poolSize": 5,
    "recycleAfter": 10,
    "commandTimeout": 300000
  },
  "logging": {
    "level": "info",
    "format": "text",
    "destination": "console"
  }
}
```

### Configuration Templates

Use pre-built templates for common scenarios:

```bash
# Development environment
claude-flow config init --template development

# Production environment  
claude-flow config init --template production

# High-performance setup
claude-flow config init --template performance

# Minimal resource usage
claude-flow config init --template minimal
```

## Core Configuration Sections

### Orchestrator Configuration

The orchestrator manages the overall system coordination:

```json
{
  "orchestrator": {
    "maxConcurrentAgents": 10,
    "taskQueueSize": 100,
    "healthCheckInterval": 30000,
    "shutdownTimeout": 30000,
    "gracefulShutdown": true,
    "resourceLimits": {
      "memoryLimitMB": 1024,
      "cpuLimitPercent": 80,
      "diskLimitMB": 5120
    },
    "failover": {
      "enabled": true,
      "maxRetries": 3,
      "retryDelay": 5000,
      "backoffFactor": 2.0
    },
    "clustering": {
      "enabled": false,
      "nodeId": "node-1",
      "discoveryPort": 7000,
      "peers": []
    }
  }
}
```

**Key Settings:**

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| `maxConcurrentAgents` | Maximum agents running simultaneously | `10` | `1-100` |
| `taskQueueSize` | Maximum queued tasks | `100` | `10-10000` |
| `healthCheckInterval` | Health check frequency (ms) | `30000` | `5000-300000` |
| `shutdownTimeout` | Graceful shutdown timeout (ms) | `30000` | `5000-60000` |

### Agent Configuration

Default settings and policies for agents:

```json
{
  "agents": {
    "defaults": {
      "maxConcurrentTasks": 5,
      "taskTimeout": 300000,
      "idleTimeout": 600000,
      "memoryLimit": 100,
      "autoRestart": true,
      "healthCheck": {
        "enabled": true,
        "interval": 60000,
        "timeout": 10000
      }
    },
    "types": {
      "researcher": {
        "maxConcurrentTasks": 3,
        "taskTimeout": 600000,
        "capabilities": ["web_search", "document_analysis", "data_extraction"],
        "memoryNamespace": "research",
        "specialization": {
          "domains": ["technology", "science", "business"],
          "languages": ["en", "es", "fr"],
          "formats": ["text", "pdf", "web"]
        }
      },
      "analyst": {
        "maxConcurrentTasks": 2,
        "taskTimeout": 900000,
        "capabilities": ["data_analysis", "visualization", "reporting"],
        "memoryNamespace": "analysis",
        "tools": ["python", "sql", "statistics"]
      },
      "implementer": {
        "maxConcurrentTasks": 1,
        "taskTimeout": 1800000,
        "capabilities": ["code_generation", "testing", "debugging"],
        "memoryNamespace": "implementation",
        "environments": ["nodejs", "python", "rust", "go"]
      },
      "coordinator": {
        "maxConcurrentTasks": 10,
        "taskTimeout": 120000,
        "capabilities": ["planning", "delegation", "monitoring"],
        "memoryNamespace": "coordination",
        "oversight": true
      }
    },
    "policies": {
      "autoAssignment": {
        "enabled": true,
        "strategy": "load_balanced", 
        "factors": ["capability_match", "current_load", "success_rate"]
      },
      "lifecycle": {
        "maxIdleTime": 1800000,
        "maxLifetime": 86400000,
        "autoScale": {
          "enabled": true,
          "minAgents": 1,
          "maxAgents": 20,
          "scaleUpThreshold": 0.8,
          "scaleDownThreshold": 0.2
        }
      }
    }
  }
}
```

### Task Configuration

Task management and execution settings:

```json
{
  "tasks": {
    "defaults": {
      "timeout": 300000,
      "retryCount": 3,
      "retryDelay": 5000,
      "priority": "normal",
      "maxParallel": 5
    },
    "queue": {
      "strategy": "priority_fifo",
      "maxSize": 1000,
      "persistToDisk": true,
      "backup": {
        "enabled": true,
        "interval": 60000,
        "location": "./data/task-queue-backup.json"
      }
    },
    "scheduling": {
      "algorithm": "priority_round_robin",
      "balancing": {
        "enabled": true,
        "factor": "weighted",
        "weights": {
          "capability_match": 0.4,
          "current_load": 0.3,
          "success_rate": 0.2,
          "response_time": 0.1
        }
      }
    },
    "types": {
      "research": {
        "timeout": 600000,
        "retryCount": 2,
        "requiredCapabilities": ["web_search", "document_analysis"],
        "outputFormat": "markdown",
        "qualityChecks": ["fact_verification", "source_citation"]
      },
      "analysis": {
        "timeout": 900000,
        "retryCount": 1,
        "requiredCapabilities": ["data_analysis", "statistics"],
        "outputFormat": "structured",
        "qualityChecks": ["statistical_validity", "visualization_clarity"]
      },
      "implementation": {
        "timeout": 1800000,
        "retryCount": 1,
        "requiredCapabilities": ["code_generation", "testing"],
        "outputFormat": "code",
        "qualityChecks": ["syntax_validation", "test_coverage"]
      }
    }
  }
}
```

### Memory Configuration

Advanced memory system settings:

```json
{
  "memory": {
    "backend": "hybrid",
    "backends": {
      "sqlite": {
        "path": "./data/memory.db",
        "options": {
          "journalMode": "WAL",
          "synchronous": "NORMAL",
          "cacheSize": 10000,
          "maxConnections": 20,
          "busyTimeout": 30000
        }
      },
      "markdown": {
        "path": "./data/memory-docs",
        "options": {
          "useNamespaceDirectories": true,
          "useCategoryDirectories": true,
          "gitEnabled": true,
          "gitAutoCommit": true
        }
      }
    },
    "cache": {
      "enabled": true,
      "maxSizeMB": 100,
      "strategy": "lru",
      "ttl": 3600000,
      "compression": {
        "enabled": true,
        "algorithm": "gzip",
        "threshold": 1024
      }
    },
    "indexing": {
      "enabled": true,
      "vectorSearch": {
        "enabled": true,
        "dimensions": 1536,
        "algorithm": "hnsw",
        "embeddingService": {
          "provider": "openai",
          "model": "text-embedding-ada-002",
          "apiKey": "${OPENAI_API_KEY}",
          "timeout": 30000,
          "batchSize": 100
        }
      },
      "fullTextSearch": {
        "enabled": true,
        "language": "english",
        "stemming": true,
        "stopWords": true
      }
    },
    "sync": {
      "enabled": true,
      "interval": 5000,
      "conflictResolution": "crdt",
      "backups": {
        "enabled": true,
        "interval": 3600000,
        "retention": 168,
        "compression": true
      }
    },
    "namespaces": {
      "enabled": true,
      "defaultNamespace": "default",
      "isolation": "strict",
      "quotas": {
        "default": {
          "maxItems": 10000,
          "maxSizeMB": 100
        },
        "research": {
          "maxItems": 50000,
          "maxSizeMB": 500
        }
      }
    }
  }
}
```

### Terminal Configuration

Terminal integration and management:

```json
{
  "terminal": {
    "type": "auto",
    "autoDetect": true,
    "poolSize": 5,
    "recycleAfter": 10,
    "healthCheckInterval": 60000,
    "commandTimeout": 300000,
    "environments": {
      "vscode": {
        "enabled": true,
        "apiVersion": "1.85.0",
        "integration": {
          "createTerminals": true,
          "reuseTerminals": true,
          "showProgress": true,
          "workspaceIntegration": true
        }
      },
      "native": {
        "enabled": true,
        "shell": "auto",
        "env": {
          "CLAUDE_FLOW_ACTIVE": "true",
          "FORCE_COLOR": "1"
        }
      }
    },
    "sessions": {
      "persist": true,
      "restoreOnStartup": true,
      "maxSessions": 20,
      "idleTimeout": 1800000,
      "cleanup": {
        "enabled": true,
        "interval": 300000,
        "maxAge": 86400000
      }
    },
    "security": {
      "restrictCommands": true,
      "allowedCommands": ["node", "npm", "deno", "git", "ls", "cat", "echo"],
      "blockedCommands": ["rm", "sudo", "chmod", "chown"],
      "sandbox": {
        "enabled": false,
        "workingDirectory": "./sandbox",
        "networkAccess": "restricted"
      }
    }
  }
}
```

### MCP Configuration

Model Context Protocol server settings:

```json
{
  "mcp": {
    "enabled": true,
    "transport": "stdio",
    "stdio": {
      "enabled": true
    },
    "http": {
      "enabled": false,
      "port": 3000,
      "host": "localhost",
      "cors": {
        "enabled": true,
        "origins": ["http://localhost:3001"],
        "credentials": true
      },
      "rateLimit": {
        "enabled": true,
        "windowMs": 60000,
        "maxRequests": 100
      }
    },
    "websocket": {
      "enabled": false,
      "port": 3001,
      "path": "/mcp",
      "heartbeat": {
        "enabled": true,
        "interval": 30000,
        "timeout": 10000
      }
    },
    "security": {
      "authentication": {
        "enabled": false,
        "method": "token",
        "tokens": []
      },
      "encryption": {
        "enabled": false,
        "algorithm": "aes-256-gcm"
      }
    },
    "tools": {
      "registration": {
        "autoRegister": true,
        "discoveryPath": "./tools",
        "allowDynamic": true
      },
      "execution": {
        "timeout": 30000,
        "maxConcurrent": 10,
        "sandbox": {
          "enabled": true,
          "memoryLimit": "256mb",
          "timeLimit": 30000
        }
      }
    }
  }
}
```

## Environment-Specific Configurations

### Development Configuration

Optimized for development with enhanced debugging:

```json
{
  "orchestrator": {
    "maxConcurrentAgents": 3,
    "taskQueueSize": 20,
    "healthCheckInterval": 10000
  },
  "memory": {
    "backend": "sqlite",
    "cacheSizeMB": 50,
    "syncInterval": 2000
  },
  "terminal": {
    "poolSize": 2,
    "commandTimeout": 60000
  },
  "logging": {
    "level": "debug",
    "format": "text",
    "destination": "console",
    "includeStackTrace": true
  },
  "mcp": {
    "transport": "stdio",
    "tools": {
      "execution": {
        "sandbox": {
          "enabled": false
        }
      }
    }
  }
}
```

### Production Configuration

Optimized for production with enhanced reliability:

```json
{
  "orchestrator": {
    "maxConcurrentAgents": 20,
    "taskQueueSize": 500,
    "healthCheckInterval": 30000,
    "resourceLimits": {
      "memoryLimitMB": 2048,
      "cpuLimitPercent": 70
    },
    "failover": {
      "enabled": true,
      "maxRetries": 5,
      "retryDelay": 10000
    }
  },
  "memory": {
    "backend": "hybrid",
    "cacheSizeMB": 512,
    "sync": {
      "enabled": true,
      "interval": 30000,
      "backups": {
        "enabled": true,
        "interval": 1800000,
        "retention": 720
      }
    }
  },
  "terminal": {
    "poolSize": 10,
    "security": {
      "restrictCommands": true,
      "sandbox": {
        "enabled": true
      }
    }
  },
  "logging": {
    "level": "info",
    "format": "json",
    "destination": "file",
    "file": {
      "path": "./logs/claude-flow.log",
      "maxSize": "100mb",
      "maxFiles": 5,
      "compress": true
    }
  },
  "monitoring": {
    "enabled": true,
    "metrics": {
      "collect": true,
      "interval": 10000,
      "exporters": ["prometheus", "json"]
    },
    "alerts": {
      "enabled": true,
      "thresholds": {
        "memoryUsage": 0.8,
        "cpuUsage": 0.8,
        "errorRate": 0.05
      }
    }
  }
}
```

### High-Performance Configuration

Optimized for maximum throughput:

```json
{
  "orchestrator": {
    "maxConcurrentAgents": 50,
    "taskQueueSize": 2000,
    "healthCheckInterval": 60000
  },
  "memory": {
    "backend": "sqlite",
    "cacheSizeMB": 1024,
    "backends": {
      "sqlite": {
        "options": {
          "journalMode": "WAL",
          "synchronous": "NORMAL",
          "cacheSize": 50000,
          "maxConnections": 50,
          "mmapSize": 1073741824
        }
      }
    }
  },
  "terminal": {
    "poolSize": 20,
    "recycleAfter": 50
  },
  "tasks": {
    "queue": {
      "strategy": "round_robin",
      "maxSize": 5000
    },
    "defaults": {
      "maxParallel": 20
    }
  }
}
```

## Configuration Management

### Using Configuration Profiles

Define multiple configurations in one file:

```json
{
  "profiles": {
    "development": {
      "orchestrator": {
        "maxConcurrentAgents": 3
      },
      "logging": {
        "level": "debug"
      }
    },
    "production": {
      "orchestrator": {
        "maxConcurrentAgents": 20
      },
      "logging": {
        "level": "warn",
        "destination": "file"
      }
    },
    "testing": {
      "orchestrator": {
        "maxConcurrentAgents": 1
      },
      "memory": {
        "backend": "memory"
      }
    }
  }
}
```

Use profiles:

```bash
# Use development profile
claude-flow --profile development start

# Use production profile
claude-flow --profile production start --daemon
```

### Environment Variables

Override configuration with environment variables:

```bash
# Set log level
export CLAUDE_FLOW_LOG_LEVEL=debug

# Set memory backend
export CLAUDE_FLOW_MEMORY_BACKEND=sqlite

# Set MCP port
export CLAUDE_FLOW_MCP_PORT=3001

# Use custom config
export CLAUDE_FLOW_CONFIG=/path/to/config.json
```

Variable naming convention: `CLAUDE_FLOW_<SECTION>_<SETTING>`

### Dynamic Configuration

Update configuration at runtime:

```bash
# View current config
claude-flow config show

# Update specific values
claude-flow config set orchestrator.maxConcurrentAgents 15
claude-flow config set memory.cacheSizeMB 200

# Reload configuration
claude-flow config reload
```

### Configuration Validation

Validate configuration files:

```bash
# Validate current config
claude-flow config validate

# Validate specific file
claude-flow config validate ./my-config.json

# Check configuration compatibility
claude-flow config check --version 1.0.0
```

## Advanced Configuration

### Custom Agent Types

Define custom agent types with specific capabilities:

```json
{
  "agents": {
    "types": {
      "database_specialist": {
        "maxConcurrentTasks": 2,
        "taskTimeout": 1200000,
        "capabilities": [
          "sql_query",
          "database_design", 
          "performance_tuning",
          "data_migration"
        ],
        "memoryNamespace": "database",
        "tools": ["postgresql", "mysql", "mongodb"],
        "specialization": {
          "domains": ["data_modeling", "query_optimization"],
          "certifications": ["postgres", "mysql"],
          "experience_level": "expert"
        }
      },
      "security_auditor": {
        "maxConcurrentTasks": 1,
        "taskTimeout": 3600000,
        "capabilities": [
          "vulnerability_scan",
          "code_audit",
          "penetration_test",
          "compliance_check"
        ],
        "memoryNamespace": "security",
        "tools": ["nmap", "sqlmap", "burpsuite"],
        "security": {
          "clearanceLevel": "high",
          "auditLogging": true,
          "restrictedAccess": true
        }
      }
    }
  }
}
```

### Workflow Templates

Define reusable workflow templates:

```json
{
  "workflows": {
    "templates": {
      "research_analysis": {
        "name": "Research and Analysis Workflow",
        "description": "Comprehensive research followed by analysis",
        "parameters": {
          "topic": { "type": "string", "required": true },
          "depth": { "type": "string", "default": "standard", "enum": ["basic", "standard", "comprehensive"] },
          "timeline": { "type": "number", "default": 3600000 }
        },
        "tasks": [
          {
            "id": "research",
            "type": "research",
            "description": "Research {{ topic }} with {{ depth }} depth",
            "assignTo": "researcher",
            "timeout": "{{ timeline * 0.6 }}"
          },
          {
            "id": "analysis",
            "type": "analysis",
            "description": "Analyze research findings on {{ topic }}",
            "dependencies": ["research"],
            "assignTo": "analyst",
            "timeout": "{{ timeline * 0.4 }}"
          }
        ]
      }
    }
  }
}
```

### Plugin Configuration

Configure external plugins and extensions:

```json
{
  "plugins": {
    "enabled": true,
    "directory": "./plugins",
    "autoLoad": true,
    "registry": {
      "url": "https://registry.claude-flow.dev",
      "authentication": {
        "enabled": false
      }
    },
    "installed": {
      "claude-flow-web-search": {
        "enabled": true,
        "version": "1.2.0",
        "config": {
          "apiKey": "${SEARCH_API_KEY}",
          "maxResults": 10,
          "timeout": 30000
        }
      },
      "claude-flow-database": {
        "enabled": true,
        "version": "2.1.0",
        "config": {
          "connections": {
            "main": {
              "type": "postgresql",
              "host": "localhost",
              "port": 5432,
              "database": "app_data"
            }
          }
        }
      }
    }
  }
}
```

## Configuration Best Practices

### Security Guidelines

1. **Sensitive Data**: Use environment variables for secrets
2. **File Permissions**: Restrict config file access (600)
3. **Validation**: Always validate configurations
4. **Backups**: Keep configuration backups
5. **Versioning**: Track configuration changes

### Performance Optimization

1. **Memory Settings**: Tune cache sizes based on available RAM
2. **Connection Limits**: Set appropriate connection pools
3. **Timeouts**: Configure realistic timeouts
4. **Parallelism**: Balance concurrency with resources
5. **Monitoring**: Enable performance monitoring

### Maintenance

1. **Regular Reviews**: Periodically review and update settings
2. **Testing**: Test configuration changes in development
3. **Documentation**: Document custom configurations
4. **Cleanup**: Remove unused settings
5. **Updates**: Keep configurations compatible with updates

### Configuration Hierarchy

Configuration is loaded in this order (later sources override earlier):

1. Default built-in configuration
2. System-wide configuration (`/etc/claude-flow/config.json`)
3. User configuration (`~/.claude-flow/config.json`)
4. Project configuration (`./claude-flow.config.json`)
5. Specified configuration file (`--config`)
6. Environment variables
7. Command-line options

## Troubleshooting Configuration

### Common Issues

**Configuration Not Loading:**
```bash
# Check file exists and is readable
ls -la claude-flow.config.json

# Validate JSON syntax
claude-flow config validate

# Check file permissions
chmod 644 claude-flow.config.json
```

**Performance Issues:**
```bash
# Check resource usage
claude-flow status --detailed

# Optimize memory settings
claude-flow config set memory.cacheSizeMB 256

# Reduce concurrency
claude-flow config set orchestrator.maxConcurrentAgents 5
```

**Connection Problems:**
```bash
# Check MCP configuration
claude-flow config get mcp

# Validate network settings
claude-flow config validate --check-network

# Test connectivity
claude-flow status --health-check
```

This comprehensive configuration guide covers all aspects of customizing Claude-Flow for your specific needs, from basic setup to advanced enterprise deployments.