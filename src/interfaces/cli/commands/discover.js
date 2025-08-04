'use strict';
/**
 * @fileoverview Unified Discovery CLI Command - The Complete Auto-Discovery System
 *
 * This is the FINAL PIECE that makes the entire auto-discovery system accessible to users.
 * Single command that orchestrates the complete pipeline:
 * Documents → Domain Discovery → Confidence Building → Swarm Creation → Agent Deployment
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.DiscoverCommand = exports.discoverCLI = void 0;
var node_fs_1 = require('node:fs');
var node_path_1 = require('node:path');
var node_perf_hooks_1 = require('node:perf_hooks');
var auto_swarm_factory_1 = require('@coordination/discovery/auto-swarm-factory');
var domain_discovery_bridge_1 = require('@coordination/discovery/domain-discovery-bridge');
var progressive_confidence_builder_1 = require('@coordination/discovery/progressive-confidence-builder');
var hive_swarm_sync_1 = require('@coordination/hive-swarm-sync');
var public_api_1 = require('@coordination/public-api');
var document_driven_system_1 = require('@core/document-driven-system');
var logger_1 = require('@core/logger');
var agui_adapter_1 = require('@interfaces/agui/agui-adapter');
var tui_1 = require('@interfaces/tui');
var project_context_analyzer_1 = require('@knowledge/project-context-analyzer');
var memory_1 = require('@memory/memory');
var ink_1 = require('ink');
var meow_1 = require('meow');
var react_1 = require('react');
var logger = (0, logger_1.createLogger)({ prefix: 'DiscoverCommand' });
/**
 * CLI Configuration using meow
 */
exports.discoverCLI = (0, meow_1.default)(
  '\n\uD83E\uDDE0 CLAUDE-ZEN AUTO-DISCOVERY SYSTEM\nZero-Manual-Initialization Domain Discovery & Swarm Creation\n\nUsage\n  $ claude-zen discover [project-path]\n\nOptions\n  --confidence, -c         Target confidence threshold (0.0-1.0) [default: 0.95]\n  --max-iterations, -i     Maximum confidence building iterations [default: 5]\n  --auto-swarms, -s        Automatically create and deploy swarms [default: true]\n  --skip-validation        Skip human validation checkpoints [default: false]\n  --topology, -t           Force swarm topology (mesh/hierarchical/star/ring/auto) [default: auto]\n  --max-agents, -a         Maximum agents per swarm [default: 20]\n  --output, -o             Output format (console/json/markdown) [default: console]\n  --save-results           Save results to file\n  --verbose, -v            Enable verbose logging [default: false]\n  --dry-run                Analyze without creating swarms [default: false]\n  --interactive            Use interactive TUI interface [default: false]\n  --help                   Show help\n  --version                Show version\n\nExamples\n  $ claude-zen discover                              # Discover current directory\n  $ claude-zen discover /path/to/project             # Discover specific project\n  $ claude-zen discover --confidence 0.8 --verbose  # Lower confidence, verbose output\n  $ claude-zen discover --auto-swarms --topology mesh  # Force mesh topology\n  $ claude-zen discover --dry-run --output json     # Preview in JSON format\n  $ claude-zen discover --interactive                # Interactive TUI interface\n',
  {
    importMeta: import.meta,
    flags: {
      confidence: {
        type: 'number',
        shortFlag: 'c',
        default: 0.95,
      },
      maxIterations: {
        type: 'number',
        shortFlag: 'i',
        default: 5,
      },
      autoSwarms: {
        type: 'boolean',
        shortFlag: 's',
        default: true,
      },
      skipValidation: {
        type: 'boolean',
        default: false,
      },
      topology: {
        type: 'string',
        shortFlag: 't',
        default: 'auto',
      },
      maxAgents: {
        type: 'number',
        shortFlag: 'a',
        default: 20,
      },
      output: {
        type: 'string',
        shortFlag: 'o',
        default: 'console',
      },
      saveResults: {
        type: 'string',
      },
      verbose: {
        type: 'boolean',
        shortFlag: 'v',
        default: false,
      },
      dryRun: {
        type: 'boolean',
        default: false,
      },
      interactive: {
        type: 'boolean',
        default: false,
      },
    },
  },
);
/**
 * The Complete Auto-Discovery CLI Command
 *
 * This command orchestrates the entire pipeline from document analysis to running swarms.
 * It's the user-facing interface to the breakthrough auto-discovery system.
 */
var DiscoverCommand = /** @class */ (function () {
  function DiscoverCommand() {
    this.startTime = 0;
    this.stats = {
      domainsDiscovered: 0,
      confidenceBuilt: 0,
      swarmsCreated: 0,
      agentsDeployed: 0,
      documentsProcessed: 0,
      validationsPerformed: 0,
      researchQueries: 0,
    };
    this.startTime = node_perf_hooks_1.performance.now();
  }
  /**
   * Main execution method - orchestrates the complete pipeline
   */
  DiscoverCommand.prototype.execute = function (projectPath, options) {
    return __awaiter(this, void 0, void 0, function () {
      var resolvedPath,
        confidence,
        maxIterations,
        maxAgents,
        projectAnalyzer,
        projectContext,
        documentSystem,
        domainBridge,
        discoveredDomains,
        memoryStore,
        agui,
        confidenceBuilder,
        confidenceResult,
        swarmCoordinator,
        hiveSync,
        swarmFactory,
        swarmConfigs,
        _i,
        swarmConfigs_1,
        config,
        duration,
        error_1;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 15, , 16]);
            resolvedPath = (0, node_path_1.resolve)(projectPath);
            // Validate project path
            if (!(0, node_fs_1.existsSync)(resolvedPath)) {
              throw new Error('Project path does not exist: '.concat(resolvedPath));
            }
            if (!(0, node_fs_1.statSync)(resolvedPath).isDirectory()) {
              throw new Error('Project path is not a directory: '.concat(resolvedPath));
            }
            // Launch interactive TUI if requested
            if (options.interactive) {
              return [2 /*return*/, this.executeInteractive(resolvedPath, options)];
            }
            confidence = Number(options.confidence) || 0.8;
            maxIterations = Number(options.maxIterations) || 5;
            maxAgents = Number(options.maxAgents) || 20;
            if (confidence < 0 || confidence > 1) {
              throw new Error('Confidence must be between 0.0 and 1.0');
            }
            logger.info('🚀 Starting Auto-Discovery System');
            logger.info('📊 Configuration:', {
              project: resolvedPath,
              confidence: confidence,
              maxIterations: maxIterations,
              autoSwarms: options.autoSwarms,
              topology: options.topology,
              maxAgents: maxAgents,
            });
            this.showBanner();
            // Phase 1: Project Analysis
            return [4 /*yield*/, this.showPhase('🔍 Phase 1: Project Analysis')];
          case 1:
            // Phase 1: Project Analysis
            _c.sent();
            projectAnalyzer = new project_context_analyzer_1.ProjectContextAnalyzer(resolvedPath);
            return [4 /*yield*/, projectAnalyzer.analyzeProject()];
          case 2:
            projectContext = _c.sent();
            this.stats.documentsProcessed =
              ((_a = projectContext.documents) === null || _a === void 0 ? void 0 : _a.length) || 0;
            logger.info('\u2705 Analyzed project: '.concat(projectContext.name || 'Unknown'));
            if (projectContext.isMonorepo) {
              logger.info(
                '\uD83D\uDCE6 Detected monorepo with '.concat(
                  ((_b = projectContext.packages) === null || _b === void 0 ? void 0 : _b.length) ||
                    0,
                  ' packages',
                ),
              );
            }
            // Phase 2: Domain Discovery
            return [4 /*yield*/, this.showPhase('🧠 Phase 2: Domain Discovery')];
          case 3:
            // Phase 2: Domain Discovery
            _c.sent();
            documentSystem = new document_driven_system_1.DocumentDrivenSystem(resolvedPath);
            domainBridge = new domain_discovery_bridge_1.DomainDiscoveryBridge(
              documentSystem,
              {}, // DomainAnalysisEngine - will be mocked for now
              projectAnalyzer,
            );
            return [4 /*yield*/, domainBridge.discoverDomains()];
          case 4:
            discoveredDomains = _c.sent();
            this.stats.domainsDiscovered = discoveredDomains.length;
            logger.info(
              '\u2705 Discovered '.concat(discoveredDomains.length, ' potential domains'),
            );
            if (discoveredDomains.length === 0) {
              logger.warn(
                '⚠️  No domains discovered. Try analyzing a larger codebase or adjusting sensitivity.',
              );
              return [2 /*return*/];
            }
            // Phase 3: Confidence Building
            return [4 /*yield*/, this.showPhase('📈 Phase 3: Confidence Building')];
          case 5:
            // Phase 3: Confidence Building
            _c.sent();
            memoryStore = new memory_1.SessionMemoryStore({
              backendConfig: {
                type: 'json',
                path: ''.concat(resolvedPath, '/.claude-zen/memory.json'),
              },
            });
            return [4 /*yield*/, memoryStore.initialize()];
          case 6:
            _c.sent();
            agui = (0, agui_adapter_1.createAGUI)(options.skipValidation ? 'mock' : 'terminal');
            confidenceBuilder = new progressive_confidence_builder_1.ProgressiveConfidenceBuilder(
              domainBridge,
              memoryStore,
              agui,
              {
                targetConfidence: confidence,
                maxIterations: maxIterations,
                researchThreshold: 0.6,
              },
            );
            // Track confidence building progress
            confidenceBuilder.on('progress', function (event) {
              if (options.verbose) {
                logger.info(
                  '\uD83D\uDCCA Iteration '
                    .concat(event.iteration, ': ')
                    .concat((event.confidence * 100).toFixed(1), '% confidence'),
                );
              }
            });
            return [
              4 /*yield*/,
              confidenceBuilder.buildConfidence({
                projectPath: resolvedPath,
                existingDomains: discoveredDomains.map(function (d) {
                  return {
                    name: d.name,
                    path: d.path,
                    files: d.files || [],
                    confidence: d.confidence || 0.5,
                    suggestedConcepts: d.suggestedConcepts || [],
                    technologies: d.technologies || [],
                    relatedDomains: d.relatedDomains || [],
                    validations: [],
                    research: [],
                    refinementHistory: [],
                  };
                }),
              }),
            ];
          case 7:
            confidenceResult = _c.sent();
            this.stats.confidenceBuilt = confidenceResult.confidence.overall;
            this.stats.validationsPerformed = confidenceResult.validationCount || 0;
            this.stats.researchQueries = confidenceResult.researchCount || 0;
            logger.info(
              '\u2705 Built confidence: '.concat(
                (confidenceResult.confidence.overall * 100).toFixed(1),
                '%',
              ),
            );
            logger.info('\uD83D\uDCCB Validated domains: '.concat(confidenceResult.domains.size));
            if (confidenceResult.domains.size === 0) {
              logger.warn(
                '⚠️  No confident domains found. Consider lowering confidence threshold or adding more documentation.',
              );
              return [2 /*return*/];
            }
            if (!(options.autoSwarms && !options.dryRun)) return [3 /*break*/, 11];
            return [4 /*yield*/, this.showPhase('🏭 Phase 4: Auto-Swarm Factory')];
          case 8:
            _c.sent();
            return [4 /*yield*/, (0, public_api_1.createPublicSwarmCoordinator)()];
          case 9:
            swarmCoordinator = _c.sent();
            hiveSync = new hive_swarm_sync_1.HiveSwarmCoordinator();
            swarmFactory = new auto_swarm_factory_1.AutoSwarmFactory(
              swarmCoordinator,
              hiveSync,
              memoryStore,
              agui,
              {
                enableHumanValidation: !options.skipValidation,
                maxSwarmsPerDomain: 1,
                resourceConstraints: {
                  maxTotalAgents: maxAgents * confidenceResult.domains.size,
                  memoryLimit: '4GB',
                  cpuLimit: 8,
                },
              },
            );
            // Track swarm creation
            swarmFactory.on('swarm:created', function (event) {
              if (options.verbose) {
                logger.info(
                  '\uD83D\uDC1D Created swarm for '
                    .concat(event.domain, ': ')
                    .concat(event.config.topology.type, ' topology'),
                );
              }
            });
            return [4 /*yield*/, swarmFactory.createSwarmsForDomains(confidenceResult.domains)];
          case 10:
            swarmConfigs = _c.sent();
            this.stats.swarmsCreated = swarmConfigs.length;
            this.stats.agentsDeployed = swarmConfigs.reduce(function (sum, config) {
              return (
                sum +
                config.agents.reduce(function (agentSum, agent) {
                  return agentSum + agent.count;
                }, 0)
              );
            }, 0);
            logger.info(
              '\u2705 Created '
                .concat(swarmConfigs.length, ' swarms with ')
                .concat(this.stats.agentsDeployed, ' total agents'),
            );
            // Show swarm details
            if (options.verbose) {
              for (_i = 0, swarmConfigs_1 = swarmConfigs; _i < swarmConfigs_1.length; _i++) {
                config = swarmConfigs_1[_i];
                logger.info('\uD83D\uDC1D '.concat(config.name, ':'), {
                  topology: config.topology.type,
                  agents: config.agents.length,
                  confidence: ''.concat((config.confidence * 100).toFixed(1), '%'),
                });
              }
            }
            return [3 /*break*/, 12];
          case 11:
            if (options.autoSwarms && options.dryRun) {
              logger.info('🧪 Dry run mode: Swarm creation skipped');
            } else {
              logger.info('ℹ️  Use --auto-swarms flag to create and deploy swarms');
            }
            _c.label = 12;
          case 12:
            // Phase 5: Results & Summary
            return [4 /*yield*/, this.showPhase('📊 Phase 5: Results Summary')];
          case 13:
            // Phase 5: Results & Summary
            _c.sent();
            return [4 /*yield*/, this.showResults(confidenceResult, options)];
          case 14:
            _c.sent();
            duration = (node_perf_hooks_1.performance.now() - this.startTime) / 1000;
            logger.info(
              '\uD83C\uDF89 Auto-discovery completed in '.concat(duration.toFixed(2), 's'),
            );
            return [3 /*break*/, 16];
          case 15:
            error_1 = _c.sent();
            logger.error('💥 Auto-discovery failed:', error_1);
            process.exit(1);
            return [3 /*break*/, 16];
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute interactive TUI workflow
   */
  DiscoverCommand.prototype.executeInteractive = function (projectPath, options) {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var waitUntilExit = (0, ink_1.render)(
              react_1.default.createElement(tui_1.InteractiveDiscoveryTUI, {
                projectPath: projectPath,
                options: {
                  confidence: options.confidence,
                  maxIterations: options.maxIterations,
                  skipValidation: options.skipValidation,
                },
                onComplete: function (results) {
                  logger.info('🎉 Interactive discovery completed successfully');
                  if (options.saveResults) {
                    _this.saveInteractiveResults(results, options.saveResults);
                  }
                  resolve();
                },
                onCancel: function () {
                  logger.info('❌ Interactive discovery cancelled by user');
                  reject(new Error('Discovery cancelled by user'));
                },
              }),
            ).waitUntilExit;
            waitUntilExit()
              .then(function () {
                resolve();
              })
              .catch(reject);
          }),
        ];
      });
    });
  };
  /**
   * Save interactive results to file
   */
  DiscoverCommand.prototype.saveInteractiveResults = function (results, outputPath) {
    return __awaiter(this, void 0, void 0, function () {
      var fs, resolvedPath, summary, content, error_2;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              Promise.resolve().then(function () {
                return require('node:fs/promises');
              }),
            ];
          case 1:
            fs = _c.sent();
            resolvedPath = (0, node_path_1.resolve)(outputPath);
            summary = {
              timestamp: new Date().toISOString(),
              selectedDomains: Array.from(results.selectedDomains || []),
              deployedSwarms: Array.from(
                ((_a = results.deploymentStatus) === null || _a === void 0
                  ? void 0
                  : _a.entries()) || [],
              ).map(function (_a) {
                var domain = _a[0],
                  status = _a[1];
                return {
                  domain: domain,
                  status: status.status,
                  agents: status.agents.created,
                  message: status.message,
                };
              }),
              configurations: Array.from(
                ((_b = results.swarmConfigs) === null || _b === void 0 ? void 0 : _b.entries()) ||
                  [],
              ).map(function (_a) {
                var domain = _a[0],
                  config = _a[1];
                return {
                  domain: domain,
                  topology: config.topology,
                  maxAgents: config.maxAgents,
                  resources: config.resourceLimits,
                  persistence: config.persistence,
                };
              }),
            };
            content = void 0;
            if (resolvedPath.endsWith('.json')) {
              content = JSON.stringify(summary, null, 2);
            } else if (resolvedPath.endsWith('.md')) {
              content = this.generateInteractiveMarkdownReport(summary);
            } else {
              content = JSON.stringify(summary, null, 2);
            }
            return [4 /*yield*/, fs.writeFile(resolvedPath, content, 'utf-8')];
          case 2:
            _c.sent();
            logger.info('\uD83D\uDCBE Interactive results saved to: '.concat(resolvedPath));
            return [3 /*break*/, 4];
          case 3:
            error_2 = _c.sent();
            logger.error('Failed to save interactive results:', error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate markdown report for interactive results
   */
  DiscoverCommand.prototype.generateInteractiveMarkdownReport = function (results) {
    return '# Interactive Discovery Results\n\n## Summary\n- **Timestamp**: '
      .concat(results.timestamp, '\n- **Selected Domains**: ')
      .concat(results.selectedDomains.length, '\n- **Deployed Swarms**: ')
      .concat(results.deployedSwarms.length, '\n\n## Selected Domains\n')
      .concat(
        results.selectedDomains
          .map(function (domain) {
            return '- '.concat(domain);
          })
          .join('\n'),
        '\n\n## Deployed Swarms\n',
      )
      .concat(
        results.deployedSwarms
          .map(function (swarm) {
            return '\n### '
              .concat(swarm.domain, '\n- **Status**: ')
              .concat(swarm.status, '\n- **Agents**: ')
              .concat(swarm.agents, '\n- **Message**: ')
              .concat(swarm.message, '\n');
          })
          .join('\n'),
        '\n\n## Configurations\n',
      )
      .concat(
        results.configurations
          .map(function (config) {
            return '\n### '
              .concat(config.domain, '\n- **Topology**: ')
              .concat(config.topology, '\n- **Max Agents**: ')
              .concat(config.maxAgents, '\n- **Memory**: ')
              .concat(config.resources.memory, '\n- **CPU**: ')
              .concat(config.resources.cpu, '\n- **Persistence**: ')
              .concat(config.persistence, '\n');
          })
          .join('\n'),
        '\n\n---\n*Generated by Claude-Zen Interactive Discovery*\n',
      );
  };
  /**
   * Show banner with system info
   */
  DiscoverCommand.prototype.showBanner = function () {};
  /**
   * Show phase header with progress
   */
  DiscoverCommand.prototype.showPhase = function (_title) {
    return __awaiter(this, void 0, void 0, function () {
      var _elapsed;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _elapsed = ((node_perf_hooks_1.performance.now() - this.startTime) / 1000).toFixed(1);
            // Small delay for visual effect
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              }),
            ];
          case 1:
            // Small delay for visual effect
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Show comprehensive results
   */
  DiscoverCommand.prototype.showResults = function (confidenceResult, options) {
    return __awaiter(this, void 0, void 0, function () {
      var duration, results, _a, fs, outputPath, content;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            duration = (node_perf_hooks_1.performance.now() - this.startTime) / 1000;
            results = {
              summary: {
                duration: ''.concat(duration.toFixed(2), 's'),
                domainsDiscovered: this.stats.domainsDiscovered,
                confidenceDomains: confidenceResult.domains.size,
                finalConfidence: ''.concat(
                  (confidenceResult.confidence.overall * 100).toFixed(1),
                  '%',
                ),
                swarmsCreated: this.stats.swarmsCreated,
                agentsDeployed: this.stats.agentsDeployed,
                validationsPerformed: this.stats.validationsPerformed,
                researchQueries: this.stats.researchQueries,
              },
              domains: Array.from(confidenceResult.domains.entries()).map(function (_a) {
                var name = _a[0],
                  domain = _a[1];
                return {
                  name: name,
                  path: domain.path,
                  confidence: ''.concat((domain.confidence.overall * 100).toFixed(1), '%'),
                  files: domain.files.length,
                  concepts: domain.suggestedConcepts,
                  technologies: domain.technologies || [],
                  validations: domain.validations.length,
                  research: domain.research.length,
                };
              }),
              relationships: confidenceResult.relationships.map(function (rel) {
                return {
                  from: rel.sourceDomain,
                  to: rel.targetDomain,
                  type: rel.type,
                  confidence: ''.concat((rel.confidence * 100).toFixed(0), '%'),
                  evidence: rel.evidence,
                };
              }),
              confidenceMetrics: Object.entries(confidenceResult.confidence).map(function (_a) {
                var key = _a[0],
                  value = _a[1];
                return {
                  metric: key,
                  score: ''.concat((value * 100).toFixed(1), '%'),
                };
              }),
            };
            _a = options.output;
            switch (_a) {
              case 'json':
                return [3 /*break*/, 1];
              case 'markdown':
                return [3 /*break*/, 2];
            }
            return [3 /*break*/, 4];
          case 1:
            return [3 /*break*/, 6];
          case 2:
            return [4 /*yield*/, this.showMarkdownResults(results)];
          case 3:
            _b.sent();
            return [3 /*break*/, 6];
          case 4: // console
            return [4 /*yield*/, this.showConsoleResults(results)];
          case 5:
            _b.sent();
            return [3 /*break*/, 6];
          case 6:
            if (!options.saveResults) return [3 /*break*/, 13];
            return [
              4 /*yield*/,
              Promise.resolve().then(function () {
                return require('node:fs/promises');
              }),
            ];
          case 7:
            fs = _b.sent();
            outputPath = (0, node_path_1.resolve)(options.saveResults);
            content = void 0;
            if (!outputPath.endsWith('.json')) return [3 /*break*/, 8];
            content = JSON.stringify(results, null, 2);
            return [3 /*break*/, 11];
          case 8:
            if (!outputPath.endsWith('.md')) return [3 /*break*/, 10];
            return [4 /*yield*/, this.generateMarkdownReport(results)];
          case 9:
            content = _b.sent();
            return [3 /*break*/, 11];
          case 10:
            content = JSON.stringify(results, null, 2);
            _b.label = 11;
          case 11:
            return [4 /*yield*/, fs.writeFile(outputPath, content, 'utf-8')];
          case 12:
            _b.sent();
            logger.info('\uD83D\uDCBE Results saved to: '.concat(outputPath));
            _b.label = 13;
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Show results in console format
   */
  DiscoverCommand.prototype.showConsoleResults = function (results) {
    return __awaiter(this, void 0, void 0, function () {
      var _summary, _i, _a, _domain, _b, _c, _rel, _d, _e, _metric;
      return __generator(this, function (_f) {
        _summary = results.summary;
        if (results.domains.length > 0) {
          for (_i = 0, _a = results.domains; _i < _a.length; _i++) {
            _domain = _a[_i];
          }
        }
        if (results.relationships.length > 0) {
          for (_b = 0, _c = results.relationships; _b < _c.length; _b++) {
            _rel = _c[_b];
          }
        }
        for (_d = 0, _e = results.confidenceMetrics; _d < _e.length; _d++) {
          _metric = _e[_d];
        }
        if (results.summary.swarmsCreated > 0) {
        } else {
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Show results in markdown format
   */
  DiscoverCommand.prototype.showMarkdownResults = function (results) {
    return __awaiter(this, void 0, void 0, function () {
      var _markdown;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.generateMarkdownReport(results)];
          case 1:
            _markdown = _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate markdown report
   */
  DiscoverCommand.prototype.generateMarkdownReport = function (results) {
    return __awaiter(this, void 0, void 0, function () {
      var summary;
      return __generator(this, function (_a) {
        summary = results.summary;
        return [
          2 /*return*/,
          '# Auto-Discovery Results\n\n## Summary\n- **Duration**: '
            .concat(summary.duration, '\n- **Domains Discovered**: ')
            .concat(summary.domainsDiscovered, '\n- **Confident Domains**: ')
            .concat(summary.confidenceDomains, '\n- **Final Confidence**: ')
            .concat(summary.finalConfidence, '\n- **Swarms Created**: ')
            .concat(summary.swarmsCreated, '\n- **Agents Deployed**: ')
            .concat(summary.agentsDeployed, '\n- **Human Validations**: ')
            .concat(summary.validationsPerformed, '\n- **Research Queries**: ')
            .concat(summary.researchQueries, '\n\n## Discovered Domains\n\n')
            .concat(
              results.domains
                .map(function (domain) {
                  return '### '
                    .concat(domain.name, '\n- **Path**: `')
                    .concat(domain.path, '`\n- **Confidence**: ')
                    .concat(domain.confidence, '\n- **Files**: ')
                    .concat(domain.files, '\n- **Concepts**: ')
                    .concat(domain.concepts.join(', '), '\n- **Technologies**: ')
                    .concat(domain.technologies.join(', '), '\n- **Validations**: ')
                    .concat(domain.validations, '\n- **Research**: ')
                    .concat(domain.research, '\n');
                })
                .join('\n'),
              '\n\n## Domain Relationships\n\n',
            )
            .concat(
              results.relationships
                .map(function (rel) {
                  return '- **'
                    .concat(rel.from, '** ')
                    .concat(rel.type, ' **')
                    .concat(rel.to, '** (')
                    .concat(rel.confidence, ')\n  - Evidence: ')
                    .concat(rel.evidence);
                })
                .join('\n'),
              '\n\n## Confidence Metrics\n\n',
            )
            .concat(
              results.confidenceMetrics
                .map(function (metric) {
                  return '- **'.concat(metric.metric, '**: ').concat(metric.score);
                })
                .join('\n'),
              '\n\n## Next Steps\n\n',
            )
            .concat(
              summary.swarmsCreated > 0
                ? '- ✅ Swarms are running and ready for tasks\n- 💡 Use `claude-zen status` to monitor swarm activity\n- 📊 Use `claude-zen dashboard` for real-time monitoring'
                : '- 💡 Run with `--auto-swarms` to create and deploy swarms\n- 🧪 Use `--dry-run` first to preview swarm configurations',
              '\n\n---\n*Generated by Claude-Zen Auto-Discovery System*\n',
            ),
        ];
      });
    });
  };
  return DiscoverCommand;
})();
exports.DiscoverCommand = DiscoverCommand;
// Export the command for CLI integration
exports.default = DiscoverCommand;
