# 🎯 Enhanced Issue #565: Claude Flow CLI Command Detection Enhancement

## 📋 Original Issue Summary
Claude Flow v2.0.0-alpha fails when trying to use swarm mode because it looks for `claude-code` command, but Anthropic's official Claude Code installation uses `claude` as the command name.

## 🎯 Comprehensive Expected Results

### Primary Outcome: Intelligent CLI Command Detection
The enhanced Claude Flow should implement a sophisticated CLI command detection system that:

1. **Auto-detects available Claude CLI commands** using multiple strategies
2. **Supports both `claude` and `claude-code` command patterns** for maximum compatibility
3. **Provides intelligent fallback mechanisms** when primary commands aren't available
4. **Offers comprehensive configuration options** for custom environments
5. **Delivers crystal-clear error messaging** with actionable troubleshooting steps

### Technical Implementation Requirements

#### Core Detection Algorithm
```typescript
interface ClaudeCliDetector {
  // Primary detection methods
  detectAvailableCommands(): Promise<ClaudeCliInfo[]>;
  validateCommandFunctionality(command: string): Promise<ValidationResult>;
  selectOptimalCommand(availableCommands: ClaudeCliInfo[]): ClaudeCliInfo;
  
  // Configuration and override capabilities
  applyUserConfiguration(config: ClaudeCliConfig): void;
  handleEnvironmentOverrides(): ClaudeCliInfo | null;
  
  // Error handling and user guidance
  generateTroubleshootingGuide(context: DetectionContext): TroubleshootingGuide;
  provideFallbackOptions(failureReason: DetectionFailure): FallbackOption[];
}

interface ClaudeCliInfo {
  commandName: string;           // 'claude' | 'claude-code' | custom
  executablePath: string;        // Full path to executable
  version: string;               // Detected version string
  installationMethod: InstallMethod; // npm, brew, manual, etc.
  functionalityScore: number;    // 0-100 compatibility rating
  detectionConfidence: number;   // 0-100 confidence in detection
  supportedFeatures: string[];   // List of supported features
  lastValidated: Date;           // When functionality was last confirmed
}

interface ClaudeCliConfig {
  preferredCommand?: string;     // User's preferred command name
  customPath?: string;           // Custom executable path
  fallbackCommands?: string[];   // Alternative commands to try
  validationTimeout?: number;    // Timeout for command validation
  cacheValidation?: boolean;     // Whether to cache validation results
  environmentVariable?: string;  // Environment variable to check
}

interface ValidationResult {
  isValid: boolean;
  version?: string;
  supportedFeatures: string[];
  performance: {
    responseTime: number;        // Command response time in ms
    memoryUsage?: number;        // Memory usage if detectable
  };
  errors?: string[];
  warnings?: string[];
}
```

#### Detection Strategy Implementation
```typescript
class IntelligentClaudeDetector implements ClaudeCliDetector {
  private readonly DETECTION_STRATEGIES = [
    'environmentVariable',   // Check CLAUDE_CODE_CMD first
    'standardCommands',      // Try 'claude', 'claude-code'
    'pathSearching',        // Search PATH for executables
    'commonLocations',      // Check common installation paths
    'packageManagers',      // Query npm, brew, etc.
    'userConfiguration'     // Check user config files
  ];

  async detectAvailableCommands(): Promise<ClaudeCliInfo[]> {
    const detectedCommands: ClaudeCliInfo[] = [];
    
    for (const strategy of this.DETECTION_STRATEGIES) {
      try {
        const commands = await this.executeDetectionStrategy(strategy);
        detectedCommands.push(...commands);
      } catch (error) {
        this.logDetectionFailure(strategy, error);
      }
    }
    
    return this.deduplicateAndRankCommands(detectedCommands);
  }

  private async executeDetectionStrategy(strategy: string): Promise<ClaudeCliInfo[]> {
    switch (strategy) {
      case 'environmentVariable':
        return this.checkEnvironmentVariables();
      case 'standardCommands':
        return this.tryStandardCommands();
      case 'pathSearching':
        return this.searchExecutablePaths();
      case 'commonLocations':
        return this.checkCommonInstallLocations();
      case 'packageManagers':
        return this.queryPackageManagers();
      case 'userConfiguration':
        return this.loadUserConfiguration();
      default:
        throw new Error(`Unknown detection strategy: ${strategy}`);
    }
  }
}
```

#### Environment Configuration System
```typescript
interface EnvironmentConfig {
  // Primary configuration sources
  CLAUDE_CODE_CMD?: string;        // Direct command override
  CLAUDE_CLI_PATH?: string;        // Path to executable
  CLAUDE_CLI_CONFIG?: string;      // Path to config file
  
  // Advanced configuration
  CLAUDE_CLI_TIMEOUT?: number;     // Command timeout in seconds
  CLAUDE_CLI_VALIDATION?: boolean; // Enable/disable validation
  CLAUDE_CLI_CACHE?: boolean;      // Enable/disable caching
  CLAUDE_CLI_FALLBACK?: string;    // Comma-separated fallback commands
  
  // Debugging and logging
  CLAUDE_CLI_DEBUG?: boolean;      // Enable debug logging
  CLAUDE_CLI_VERBOSE?: boolean;    // Verbose output
  CLAUDE_CLI_LOG_LEVEL?: LogLevel; // Log level configuration
}

class EnvironmentManager {
  static loadConfiguration(): EnvironmentConfig {
    return {
      CLAUDE_CODE_CMD: process.env.CLAUDE_CODE_CMD,
      CLAUDE_CLI_PATH: process.env.CLAUDE_CLI_PATH,
      CLAUDE_CLI_CONFIG: process.env.CLAUDE_CLI_CONFIG,
      CLAUDE_CLI_TIMEOUT: parseInt(process.env.CLAUDE_CLI_TIMEOUT || '30'),
      CLAUDE_CLI_VALIDATION: process.env.CLAUDE_CLI_VALIDATION !== 'false',
      CLAUDE_CLI_CACHE: process.env.CLAUDE_CLI_CACHE !== 'false',
      CLAUDE_CLI_FALLBACK: process.env.CLAUDE_CLI_FALLBACK?.split(','),
      CLAUDE_CLI_DEBUG: process.env.CLAUDE_CLI_DEBUG === 'true',
      CLAUDE_CLI_VERBOSE: process.env.CLAUDE_CLI_VERBOSE === 'true',
      CLAUDE_CLI_LOG_LEVEL: (process.env.CLAUDE_CLI_LOG_LEVEL as LogLevel) || 'info'
    };
  }
}
```

### User Experience Requirements

#### Crystal-Clear Error Messages
```typescript
interface ErrorMessageSystem {
  generateContextualError(context: DetectionContext): EnhancedErrorMessage;
  provideTroubleshootingSteps(error: DetectionError): TroubleshootingStep[];
  suggestInstallationMethods(platform: Platform): InstallationGuide[];
  generateConfigurationExamples(scenario: UsageScenario): ConfigExample[];
}

interface EnhancedErrorMessage {
  title: string;                 // Clear, actionable title
  description: string;           // Detailed explanation
  detectedState: SystemState;    // What was found during detection
  recommendedActions: Action[];  // Specific steps to resolve
  configurationExamples: string[]; // Copy-paste configuration examples
  documentationLinks: Link[];    // Relevant documentation
  estimatedResolutionTime: string; // How long fix should take
}

// Example error message
const EXAMPLE_ERROR_MESSAGE: EnhancedErrorMessage = {
  title: "Claude CLI Not Found - Installation Required",
  description: "Claude Flow cannot locate the Claude CLI command. This is required for swarm mode functionality.",
  detectedState: {
    searchedCommands: ["claude-code", "claude"],
    searchedPaths: ["/usr/local/bin", "/usr/bin", "~/.local/bin"],
    environmentVariables: { CLAUDE_CODE_CMD: "undefined" },
    nodeVersion: "v22.18.0",
    platform: "linux"
  },
  recommendedActions: [
    {
      step: 1,
      title: "Install Claude CLI",
      command: "npm install -g @anthropic-ai/claude-code",
      description: "Install the official Claude CLI from Anthropic",
      estimatedTime: "2-5 minutes"
    },
    {
      step: 2,
      title: "Verify Installation",
      command: "claude --version",
      description: "Confirm the installation was successful",
      estimatedTime: "30 seconds"
    },
    {
      step: 3,
      title: "Test Claude Flow Integration",
      command: "npx claude-flow@alpha swarm 'test task'",
      description: "Verify Claude Flow can now detect and use Claude CLI",
      estimatedTime: "1 minute"
    }
  ],
  configurationExamples: [
    "export CLAUDE_CODE_CMD=claude",
    "export CLAUDE_CLI_PATH=/usr/local/bin/claude"
  ],
  documentationLinks: [
    {
      title: "Official Claude CLI Setup Guide",
      url: "https://docs.anthropic.com/en/docs/claude-code/setup"
    },
    {
      title: "Claude Flow Configuration Options",
      url: "https://github.com/ruvnet/claude-flow/docs/configuration"
    }
  ],
  estimatedResolutionTime: "5-10 minutes"
};
```

#### Progressive Enhancement UI
```typescript
interface ProgressiveUI {
  // Detection progress indicators
  showDetectionProgress(stage: DetectionStage): void;
  displayFoundCommands(commands: ClaudeCliInfo[]): void;
  
  // Interactive configuration
  promptForUserPreferences(): Promise<UserPreferences>;
  confirmCommandSelection(command: ClaudeCliInfo): Promise<boolean>;
  
  // Guided troubleshooting
  launchInteractiveTroubleshooter(): Promise<TroubleshootingResult>;
  displayConfigurationWizard(): Promise<ConfigurationResult>;
}

// Enhanced console output examples
const DETECTION_MESSAGES = {
  starting: "🔍 Searching for Claude CLI installations...",
  foundCommand: "✅ Found Claude CLI: {command} (v{version})",
  validatingCommand: "🧪 Validating command functionality...",
  optimizingSelection: "⚡ Selecting optimal command configuration...",
  configurationComplete: "🎯 Claude CLI detection complete! Using: {command}"
};
```

### Performance and Reliability Requirements

#### Caching and Performance
```typescript
interface PerformanceConfig {
  detectionTimeout: number;      // Maximum detection time (default: 30s)
  validationCache: boolean;      // Cache validation results (default: true)
  cacheExpiration: number;       // Cache TTL in seconds (default: 3600)
  concurrentDetection: boolean;  // Run detection strategies in parallel
  maxConcurrentStrategies: number; // Limit concurrent operations
}

class DetectionCache {
  private cache = new Map<string, CachedResult>();
  
  async getCachedResult(key: string): Promise<CachedResult | null> {
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      return cached;
    }
    return null;
  }
  
  setCachedResult(key: string, result: ValidationResult): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.getCacheExpiration()
    });
  }
}
```

#### Cross-Platform Compatibility
```typescript
interface PlatformSupport {
  // Platform-specific detection strategies
  windows: WindowsDetectionStrategy;
  macos: MacOSDetectionStrategy;
  linux: LinuxDetectionStrategy;
  
  // Universal fallbacks
  universalPaths: string[];
  packageManagerQueries: PackageManagerQuery[];
}

class PlatformSpecificDetector {
  detectPlatform(): Platform {
    return {
      os: process.platform,
      arch: process.arch,
      shell: process.env.SHELL,
      packageManagers: this.detectPackageManagers()
    };
  }
  
  getDetectionStrategy(platform: Platform): DetectionStrategy {
    switch (platform.os) {
      case 'win32':
        return new WindowsDetectionStrategy();
      case 'darwin':
        return new MacOSDetectionStrategy();
      case 'linux':
        return new LinuxDetectionStrategy();
      default:
        return new UniversalDetectionStrategy();
    }
  }
}
```

## 🧪 Comprehensive Testing Strategy

### Unit Test Coverage (90%+ Target)
```typescript
describe('ClaudeCliDetector', () => {
  describe('Command Detection', () => {
    it('should detect claude command in PATH', async () => {
      // Mock PATH with claude executable
      const mockPath = '/usr/local/bin/claude';
      jest.spyOn(fs, 'access').mockResolvedValue(undefined);
      jest.spyOn(child_process, 'execSync').mockReturnValue('Claude CLI v1.0.67');
      
      const detector = new IntelligentClaudeDetector();
      const commands = await detector.detectAvailableCommands();
      
      expect(commands).toHaveLength(1);
      expect(commands[0].commandName).toBe('claude');
      expect(commands[0].version).toBe('v1.0.67');
    });
    
    it('should respect CLAUDE_CODE_CMD environment variable', async () => {
      process.env.CLAUDE_CODE_CMD = 'custom-claude';
      
      const detector = new IntelligentClaudeDetector();
      const commands = await detector.detectAvailableCommands();
      
      expect(commands[0].commandName).toBe('custom-claude');
    });
    
    it('should handle command validation failures gracefully', async () => {
      jest.spyOn(child_process, 'execSync').mockImplementation(() => {
        throw new Error('Command not found');
      });
      
      const detector = new IntelligentClaudeDetector();
      const result = await detector.validateCommandFunctionality('invalid-command');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Command not found');
    });
  });
  
  describe('Error Handling', () => {
    it('should generate helpful error messages', () => {
      const context: DetectionContext = {
        searchedCommands: ['claude-code', 'claude'],
        platform: 'linux',
        environmentVariables: {}
      };
      
      const errorSystem = new ErrorMessageSystem();
      const error = errorSystem.generateContextualError(context);
      
      expect(error.title).toContain('Claude CLI Not Found');
      expect(error.recommendedActions).toHaveLength(3);
      expect(error.configurationExamples).toContain('export CLAUDE_CODE_CMD=claude');
    });
  });
});
```

### Integration Test Scenarios
```typescript
describe('Claude Flow CLI Integration', () => {
  it('should successfully use detected claude command in swarm mode', async () => {
    // Ensure claude is available
    await ensureClaudeInstalled();
    
    const result = await runClaudeFlow(['swarm', 'test task']);
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Successfully spawned Claude Code');
  });
  
  it('should handle multiple claude installations correctly', async () => {
    // Setup multiple claude installations
    await setupMultipleClaudeInstallations();
    
    const detector = new IntelligentClaudeDetector();
    const commands = await detector.detectAvailableCommands();
    const selected = detector.selectOptimalCommand(commands);
    
    expect(selected.functionalityScore).toBeGreaterThan(80);
  });
});
```

### Performance Benchmarks
```typescript
describe('Performance Requirements', () => {
  it('should complete detection within 30 seconds', async () => {
    const startTime = Date.now();
    
    const detector = new IntelligentClaudeDetector();
    await detector.detectAvailableCommands();
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(30000); // 30 seconds
  });
  
  it('should use cached results for repeated detections', async () => {
    const detector = new IntelligentClaudeDetector();
    
    // First detection
    const start1 = Date.now();
    await detector.detectAvailableCommands();
    const duration1 = Date.now() - start1;
    
    // Second detection (should use cache)
    const start2 = Date.now();
    await detector.detectAvailableCommands();
    const duration2 = Date.now() - start2;
    
    expect(duration2).toBeLessThan(duration1 * 0.1); // 90% faster
  });
});
```

## 📝 Implementation File Structure

```
src/
├── cli/
│   ├── detection/
│   │   ├── ClaudeCliDetector.ts           # Main detection logic
│   │   ├── DetectionStrategies.ts         # Strategy implementations
│   │   ├── PlatformSupport.ts            # Platform-specific logic
│   │   ├── ValidationEngine.ts           # Command validation
│   │   └── CacheManager.ts               # Detection caching
│   ├── configuration/
│   │   ├── EnvironmentManager.ts         # Environment configuration
│   │   ├── UserConfigManager.ts          # User configuration
│   │   └── ConfigurationValidator.ts     # Config validation
│   ├── error-handling/
│   │   ├── ErrorMessageSystem.ts         # Enhanced error messages
│   │   ├── TroubleshootingGuide.ts       # Interactive troubleshooting
│   │   └── ProgressiveUI.ts              # User interface enhancements
│   └── types/
│       ├── ClaudeCliTypes.ts             # TypeScript interfaces
│       ├── DetectionTypes.ts             # Detection-specific types
│       └── ConfigurationTypes.ts         # Configuration types
tests/
├── unit/
│   ├── detection/                        # Unit tests for detection
│   ├── configuration/                    # Unit tests for configuration
│   └── error-handling/                   # Unit tests for error handling
├── integration/
│   ├── end-to-end/                       # Full integration tests
│   ├── platform-specific/               # Platform-specific tests
│   └── performance/                      # Performance benchmarks
└── fixtures/
    ├── mock-environments/                # Test environment setups
    └── test-configurations/              # Test configuration files
```

## 🎯 Acceptance Criteria

### Must-Have Requirements (MVP)
- [ ] **Auto-detects both `claude` and `claude-code` commands** with 99% reliability
- [ ] **Respects CLAUDE_CODE_CMD environment variable** as highest priority
- [ ] **Provides clear, actionable error messages** when CLI not found
- [ ] **Supports all major platforms** (Windows, macOS, Linux)
- [ ] **Completes detection within 30 seconds** on standard hardware
- [ ] **Maintains backward compatibility** with existing configurations

### Should-Have Enhancements (V1.1)
- [ ] **Interactive configuration wizard** for first-time setup
- [ ] **Performance caching** to speed up repeated detections
- [ ] **Advanced troubleshooting guide** with platform-specific instructions
- [ ] **Configuration validation and suggestions** for optimal setup
- [ ] **Metrics and telemetry** for detection success rates

### Could-Have Features (Future)
- [ ] **Auto-installation suggestions** for missing CLI
- [ ] **Multiple CLI version management** and selection
- [ ] **Integration with package managers** for automated updates
- [ ] **Advanced logging and debugging** capabilities
- [ ] **Configuration backup and restore** functionality

## 📊 Success Metrics

### Functional Metrics
- **Detection Success Rate**: >99% for standard installations
- **False Positive Rate**: <1% for command validation
- **Cross-Platform Compatibility**: 100% on Windows/macOS/Linux
- **Configuration Override Success**: 100% for environment variables

### Performance Metrics
- **Detection Time**: <10 seconds average, <30 seconds maximum
- **Cache Hit Rate**: >80% for repeated operations
- **Memory Usage**: <50MB during detection phase
- **CPU Usage**: <25% during detection on modern hardware

### User Experience Metrics
- **Error Resolution Time**: <5 minutes average with provided guidance
- **Configuration Complexity**: <3 steps for basic setup
- **Documentation Clarity**: >4.5/5 user satisfaction rating
- **Support Ticket Reduction**: >70% reduction in CLI-related issues

## 🔄 Migration and Rollout Plan

### Phase 1: Core Implementation (Week 1-2)
1. Implement basic detection strategies
2. Add environment variable support
3. Create enhanced error messaging
4. Establish testing framework

### Phase 2: Platform Optimization (Week 3-4)
1. Platform-specific detection improvements
2. Performance optimization and caching
3. Comprehensive test suite completion
4. Documentation and examples

### Phase 3: Advanced Features (Week 5-6)
1. Interactive troubleshooting
2. Configuration wizard
3. Advanced caching strategies
4. Telemetry and metrics collection

### Phase 4: Release and Monitoring (Week 7-8)
1. Alpha release with select users
2. Feedback collection and iteration
3. Performance monitoring setup
4. Full production release

This comprehensive enhancement ensures Claude Flow provides a robust, user-friendly, and reliable CLI detection system that addresses the root cause while maintaining excellent user experience and extensive configurability.