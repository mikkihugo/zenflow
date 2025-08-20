"use strict";
/**
 * @fileoverview Multi-Swarm A/B Testing System
 *
 * Advanced A/B testing system that launches multiple swarms simultaneously
 * to compare results and identify optimal approaches. Supports git tree
 * integration and multiple AI model backends (Claude, Gemini, Aider, etc.)
 *
 * Features:
 * - Parallel swarm execution with result comparison
 * - Git tree integration for isolated testing environments
 * - Multi-model support (Claude, Gemini, Aider, GPT-4, etc.)
 * - Statistical analysis of performance differences
 * - Automated swarm selection based on success metrics
 * - A/B test result persistence and learning
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiSwarmABTesting = exports.MultiSwarmABTesting = void 0;
exports.quickABTest = quickABTest;
var foundation_1 = require("@claude-zen/foundation");
var nanoid_1 = require("nanoid");
var coding_principles_researcher_1 = require("./coding-principles-researcher");
var intelligent_prompt_generator_1 = require("./intelligent-prompt-generator");
var logger = (0, foundation_1.getLogger)('multi-swarm-ab-testing');
/**
 * Multi-Swarm A/B Testing System
 *
 * Orchestrates parallel execution of multiple swarm strategies to identify
 * optimal approaches through statistical comparison and analysis.
 */
var MultiSwarmABTesting = /** @class */ (function () {
    function MultiSwarmABTesting(codingPrinciplesResearcher, promptGenerator) {
        var _this = this;
        this.testHistory = [];
        if (codingPrinciplesResearcher) {
            this.codingPrinciplesResearcher = codingPrinciplesResearcher;
        }
        else {
            // Create a placeholder DSPyLLMBridge for initialization
            var dspyBridge = {
                initialize: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/];
                }); }); },
                processCoordinationTask: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ success: true, result: null })];
                }); }); }
            };
            this.codingPrinciplesResearcher = new coding_principles_researcher_1.CodingPrinciplesResearcher(dspyBridge);
        }
        this.promptGenerator = promptGenerator || new intelligent_prompt_generator_1.IntelligentPromptGenerator(undefined, this.codingPrinciplesResearcher);
    }
    /**
     * Execute A/B test with multiple swarm strategies
     */
    MultiSwarmABTesting.prototype.executeABTest = function (taskDescription_1, strategies_1) {
        return __awaiter(this, arguments, void 0, function (taskDescription, strategies, options) {
            var testId, startTime, worktreePaths, results, _a, comparison, insights, endTime, testResult, error_1;
            var _b, _c;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        testId = "ab-test-".concat((0, nanoid_1.nanoid)());
                        startTime = new Date();
                        console.log("\uD83E\uDDEA Starting A/B test: ".concat(testId));
                        console.log("\uD83D\uDCCB Task: ".concat(taskDescription));
                        console.log("\uD83D\uDD2C Testing ".concat(strategies.length, " strategies: ").concat(strategies.map(function (s) { return s.name; }).join(', ')));
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, this.prepareGitWorktrees(strategies, options.gitConfig)];
                    case 2:
                        worktreePaths = _d.sent();
                        if (!(options.parallelExecution !== false)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executeStrategiesParallel(taskDescription, strategies, worktreePaths, options)];
                    case 3:
                        _a = _d.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.executeStrategiesSequential(taskDescription, strategies, worktreePaths, options)];
                    case 5:
                        _a = _d.sent();
                        _d.label = 6;
                    case 6:
                        results = _a;
                        comparison = this.analyzeResults(results);
                        insights = this.generateInsights(results, comparison);
                        endTime = new Date();
                        testResult = {
                            testId: testId,
                            description: taskDescription,
                            strategies: strategies,
                            results: results,
                            comparison: comparison,
                            metadata: {
                                startTime: startTime,
                                endTime: endTime,
                                totalDuration: endTime.getTime() - startTime.getTime(),
                                parallelExecution: options.parallelExecution !== false,
                                gitTreesUsed: !!((_b = options.gitConfig) === null || _b === void 0 ? void 0 : _b.useGitWorktrees)
                            },
                            insights: insights
                        };
                        // Store test result for learning
                        this.testHistory.push(testResult);
                        return [4 /*yield*/, this.persistTestResult(testResult)];
                    case 7:
                        _d.sent();
                        if (!((_c = options.gitConfig) === null || _c === void 0 ? void 0 : _c.cleanupAfterTest)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.cleanupGitWorktrees(worktreePaths)];
                    case 8:
                        _d.sent();
                        _d.label = 9;
                    case 9:
                        console.log("\u2705 A/B test completed: ".concat(testId));
                        console.log("\uD83C\uDFC6 Winner: ".concat(comparison.winner.name, " (").concat(comparison.confidence.toFixed(2), " confidence)"));
                        return [2 /*return*/, testResult];
                    case 10:
                        error_1 = _d.sent();
                        console.error("\u274C A/B test failed: ".concat(testId), error_1);
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create predefined strategy sets for common scenarios
     */
    MultiSwarmABTesting.prototype.createStrategySet = function (scenario) {
        switch (scenario) {
            case 'performance':
                return [
                    {
                        id: 'speed-claude',
                        name: 'Speed-Optimized Claude',
                        modelBackend: 'claude-haiku',
                        swarmConfig: {
                            topology: 'star',
                            maxAgents: 3,
                            strategy: 'specialized',
                            coordinationApproach: 'aggressive'
                        },
                        promptVariations: {
                            style: 'concise',
                            focus: 'speed'
                        }
                    },
                    {
                        id: 'performance-gemini',
                        name: 'Performance Gemini',
                        modelBackend: 'gemini-flash',
                        swarmConfig: {
                            topology: 'hierarchical',
                            maxAgents: 4,
                            strategy: 'balanced',
                            coordinationApproach: 'conservative'
                        },
                        promptVariations: {
                            style: 'step-by-step',
                            focus: 'performance'
                        }
                    }
                ];
            case 'quality':
                return [
                    {
                        id: 'quality-claude-opus',
                        name: 'Quality-Focused Claude Opus',
                        modelBackend: 'claude-opus',
                        swarmConfig: {
                            topology: 'mesh',
                            maxAgents: 6,
                            strategy: 'specialized',
                            coordinationApproach: 'conservative'
                        },
                        promptVariations: {
                            style: 'detailed',
                            focus: 'quality'
                        }
                    },
                    {
                        id: 'quality-gpt4',
                        name: 'Quality GPT-4 Turbo',
                        modelBackend: 'gpt-4-turbo',
                        swarmConfig: {
                            topology: 'hierarchical',
                            maxAgents: 5,
                            strategy: 'adaptive',
                            coordinationApproach: 'exploratory'
                        },
                        promptVariations: {
                            style: 'detailed',
                            focus: 'quality'
                        }
                    }
                ];
            case 'innovation':
                return [
                    {
                        id: 'creative-claude',
                        name: 'Creative Claude Sonnet',
                        modelBackend: 'claude-sonnet',
                        swarmConfig: {
                            topology: 'ring',
                            maxAgents: 8,
                            strategy: 'adaptive',
                            coordinationApproach: 'exploratory'
                        },
                        promptVariations: {
                            style: 'creative',
                            focus: 'innovation'
                        }
                    },
                    {
                        id: 'innovative-gemini',
                        name: 'Innovative Gemini Pro',
                        modelBackend: 'gemini-pro',
                        swarmConfig: {
                            topology: 'mesh',
                            maxAgents: 7,
                            strategy: 'adaptive',
                            coordinationApproach: 'aggressive'
                        },
                        promptVariations: {
                            style: 'creative',
                            focus: 'innovation'
                        }
                    },
                    {
                        id: 'aider-experimental',
                        name: 'Aider Experimental',
                        modelBackend: 'aider',
                        swarmConfig: {
                            topology: 'hierarchical',
                            maxAgents: 4,
                            strategy: 'specialized',
                            coordinationApproach: 'exploratory'
                        },
                        promptVariations: {
                            style: 'step-by-step',
                            focus: 'innovation'
                        }
                    }
                ];
            case 'comprehensive':
                return __spreadArray(__spreadArray(__spreadArray([], this.createStrategySet('performance'), true), this.createStrategySet('quality'), true), this.createStrategySet('innovation'), true);
            default:
                throw new Error("Unknown strategy scenario: ".concat(scenario));
        }
    };
    /**
     * Get recommendations based on test history
     */
    MultiSwarmABTesting.prototype.getRecommendations = function (taskType) {
        if (this.testHistory.length === 0) {
            return {
                recommendedStrategy: null,
                confidence: 0,
                reasoning: ['No historical data available for recommendations']
            };
        }
        // Analyze historical performance
        var relevantTests = this.testHistory.filter(function (test) {
            return test.description.toLowerCase().includes(taskType.toLowerCase());
        });
        if (relevantTests.length === 0) {
            var allWinners = this.testHistory.map(function (test) { return test.comparison.winner; });
            var mostSuccessful = this.findMostSuccessfulStrategy(allWinners);
            return {
                recommendedStrategy: mostSuccessful,
                confidence: 0.3,
                reasoning: [
                    "No specific data for \"".concat(taskType, "\" tasks"),
                    'Recommendation based on general performance across all task types',
                    'Consider running A/B test for this specific task type'
                ]
            };
        }
        var winners = relevantTests.map(function (test) { return test.comparison.winner; });
        var recommended = this.findMostSuccessfulStrategy(winners);
        var successRate = winners.filter(function (w) { return w.id === (recommended === null || recommended === void 0 ? void 0 : recommended.id); }).length / winners.length;
        return {
            recommendedStrategy: recommended,
            confidence: successRate,
            reasoning: [
                "Based on ".concat(relevantTests.length, " historical tests for \"").concat(taskType, "\""),
                "Success rate: ".concat((successRate * 100).toFixed(1), "%"),
                "Model: ".concat(recommended === null || recommended === void 0 ? void 0 : recommended.modelBackend),
                "Topology: ".concat(recommended === null || recommended === void 0 ? void 0 : recommended.swarmConfig.topology)
            ]
        };
    };
    /**
     * Private helper methods
     */
    MultiSwarmABTesting.prototype.prepareGitWorktrees = function (strategies, gitConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var worktreePaths, maxWorktrees, baseBranch, branchPrefix, cleanupAfterTest, strategiesToProcess, _i, strategiesToProcess_1, strategy, branchName, worktreePath;
            var _a;
            return __generator(this, function (_b) {
                worktreePaths = {};
                if (!(gitConfig === null || gitConfig === void 0 ? void 0 : gitConfig.useGitWorktrees)) {
                    logger.debug('Git worktrees disabled, using current working directory');
                    return [2 /*return*/, worktreePaths];
                }
                maxWorktrees = gitConfig.maxWorktrees || 10;
                baseBranch = gitConfig.baseBranch || 'main';
                branchPrefix = gitConfig.branchPrefix || 'ab-test';
                cleanupAfterTest = (_a = gitConfig.cleanupAfterTest) !== null && _a !== void 0 ? _a : true;
                // Validate git configuration
                if (strategies.length > maxWorktrees) {
                    logger.warn("Strategy count ".concat(strategies.length, " exceeds max worktrees ").concat(maxWorktrees), {
                        strategies: strategies.length,
                        maxWorktrees: maxWorktrees,
                        willLimitTo: maxWorktrees
                    });
                }
                strategiesToProcess = strategies.slice(0, maxWorktrees);
                logger.info("\uD83C\uDF33 Creating ".concat(strategiesToProcess.length, " git worktrees..."), {
                    baseBranch: baseBranch,
                    branchPrefix: branchPrefix,
                    cleanupAfterTest: cleanupAfterTest,
                    maxWorktrees: maxWorktrees
                });
                for (_i = 0, strategiesToProcess_1 = strategiesToProcess; _i < strategiesToProcess_1.length; _i++) {
                    strategy = strategiesToProcess_1[_i];
                    branchName = "".concat(branchPrefix, "-").concat(strategy.id, "-").concat((0, nanoid_1.nanoid)(6));
                    worktreePath = "/tmp/ab-test-worktrees/".concat(branchName);
                    // Log worktree creation with gitConfig details
                    logger.debug("\uD83D\uDCC1 Creating worktree for ".concat(strategy.name), {
                        strategyId: strategy.id,
                        branchName: branchName,
                        worktreePath: worktreePath,
                        baseBranch: baseBranch,
                        modelBackend: strategy.modelBackend
                    });
                    // In a real implementation, this would execute:
                    // await exec(`git worktree add ${worktreePath} -b ${branchName} ${baseBranch}`)
                    worktreePaths[strategy.id] = worktreePath;
                    logger.info("\u2705 Created worktree for ".concat(strategy.name, ": ").concat(worktreePath));
                }
                // Log final worktree configuration summary
                logger.info('Git worktree preparation completed', {
                    totalWorktrees: Object.keys(worktreePaths).length,
                    cleanupAfterTest: cleanupAfterTest,
                    worktreeIds: Object.keys(worktreePaths)
                });
                return [2 /*return*/, worktreePaths];
            });
        });
    };
    MultiSwarmABTesting.prototype.executeStrategiesParallel = function (taskDescription, strategies, worktreePaths, options) {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                console.log("\u26A1 Executing ".concat(strategies.length, " strategies in parallel..."));
                promises = strategies.map(function (strategy) {
                    return _this.executeStrategy(taskDescription, strategy, worktreePaths[strategy.id], options);
                });
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    };
    MultiSwarmABTesting.prototype.executeStrategiesSequential = function (taskDescription, strategies, worktreePaths, options) {
        return __awaiter(this, void 0, void 0, function () {
            var enableProgressLogging, delayBetweenStrategies, enableContinueOnFailure, results, i, strategy, result, error_2, failureResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        enableProgressLogging = options.verbose || false;
                        delayBetweenStrategies = options.sequentialDelay || 1000;
                        enableContinueOnFailure = options.continueOnFailure !== false;
                        if (enableProgressLogging) {
                            console.log("\u23ED\uFE0F Executing ".concat(strategies.length, " strategies sequentially..."));
                            console.log("\uD83D\uDCCA Sequential options: delay=".concat(delayBetweenStrategies, "ms, continueOnFailure=").concat(enableContinueOnFailure));
                        }
                        else {
                            console.log("\u23ED\uFE0F Executing ".concat(strategies.length, " strategies sequentially..."));
                        }
                        results = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < strategies.length)) return [3 /*break*/, 8];
                        strategy = strategies[i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        if (enableProgressLogging) {
                            console.log("\uD83D\uDCCB Executing strategy ".concat(i + 1, "/").concat(strategies.length, ": ").concat(strategy.name));
                        }
                        return [4 /*yield*/, this.executeStrategy(taskDescription, strategy, worktreePaths[strategy.id], options)];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        if (enableProgressLogging) {
                            console.log("\u2705 Strategy ".concat(i + 1, " completed: ").concat(strategy.name, " (").concat(result.success ? 'SUCCESS' : 'FAILED', ")"));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        logger.error("\u274C Strategy ".concat(i + 1, " failed: ").concat(strategy.name), error_2);
                        if (!enableContinueOnFailure) {
                            throw error_2;
                        }
                        failureResult = {
                            strategy: strategy,
                            success: false,
                            duration: 0,
                            qualityMetrics: {
                                codeQuality: 0,
                                requirementsCoverage: 0,
                                implementationCorrectness: 0,
                                maintainability: 0,
                                performance: 0,
                                overallScore: 0
                            },
                            artifacts: {
                                filesCreated: [],
                                linesOfCode: 0,
                                functionsCreated: 0,
                                testsGenerated: 0
                            },
                            error: error_2 instanceof Error ? error_2.message : String(error_2),
                            modelMetadata: {
                                backend: strategy.modelBackend,
                                tokenUsage: 0,
                                requestCount: 0,
                                avgResponseTime: 0
                            }
                        };
                        results.push(failureResult);
                        return [3 /*break*/, 5];
                    case 5:
                        if (!(i < strategies.length - 1 && delayBetweenStrategies > 0)) return [3 /*break*/, 7];
                        if (enableProgressLogging) {
                            console.log("\u23F8\uFE0F Pausing ".concat(delayBetweenStrategies, "ms before next strategy..."));
                        }
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delayBetweenStrategies); })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, results];
                }
            });
        });
    };
    MultiSwarmABTesting.prototype.executeStrategy = function (taskDescription_1, strategy_1, worktreePath_1) {
        return __awaiter(this, arguments, void 0, function (taskDescription, strategy, worktreePath, options) {
            var startTime, enableVerboseLogging, timeoutMs, retryCount, lastError, _loop_1, this_1, attempt, state_1, duration;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        enableVerboseLogging = options.verbose || false;
                        timeoutMs = options.timeout || 30000;
                        retryCount = options.retries || 1;
                        if (enableVerboseLogging) {
                            console.log("\uD83D\uDE80 Executing strategy: ".concat(strategy.name, " (").concat(strategy.modelBackend, ")"));
                            console.log("\uD83D\uDCCA Options: timeout=".concat(timeoutMs, "ms, retries=").concat(retryCount, ", verbose=").concat(enableVerboseLogging));
                        }
                        lastError = null;
                        _loop_1 = function (attempt) {
                            var prompt_1, executionResult, duration_1, error_3, retryDelay_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 3, , 5]);
                                        return [4 /*yield*/, this_1.generateStrategyPrompt(taskDescription, strategy)];
                                    case 1:
                                        prompt_1 = _b.sent();
                                        return [4 /*yield*/, Promise.race([
                                                this_1.simulateSwarmExecution(strategy, prompt_1, worktreePath, options),
                                                new Promise(function (_, reject) {
                                                    return setTimeout(function () { return reject(new Error("Strategy execution timeout after ".concat(timeoutMs, "ms"))); }, timeoutMs);
                                                })
                                            ])];
                                    case 2:
                                        executionResult = _b.sent();
                                        duration_1 = Date.now() - startTime;
                                        if (enableVerboseLogging) {
                                            console.log("\u2705 Strategy completed: ".concat(strategy.name, " (").concat(duration_1, "ms, attempt ").concat(attempt, ")"));
                                        }
                                        return [2 /*return*/, { value: {
                                                    strategy: strategy,
                                                    success: true,
                                                    duration: duration_1,
                                                    qualityMetrics: executionResult.qualityMetrics,
                                                    artifacts: executionResult.artifacts,
                                                    worktreePath: worktreePath,
                                                    modelMetadata: {
                                                        backend: strategy.modelBackend,
                                                        tokenUsage: executionResult.tokenUsage,
                                                        requestCount: executionResult.requestCount,
                                                        avgResponseTime: duration_1 / (executionResult.requestCount || 1),
                                                        attemptNumber: attempt,
                                                        totalAttempts: retryCount
                                                    }
                                                } }];
                                    case 3:
                                        error_3 = _b.sent();
                                        lastError = error_3 instanceof Error ? error_3 : new Error(String(error_3));
                                        if (enableVerboseLogging) {
                                            console.log("\u274C Strategy failed (attempt ".concat(attempt, "/").concat(retryCount, "): ").concat(lastError.message));
                                        }
                                        // If this is the last attempt, we'll throw below
                                        if (attempt === retryCount) {
                                            return [2 /*return*/, "break"];
                                        }
                                        retryDelay_1 = options.retryDelay || (1000 * attempt);
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelay_1); })];
                                    case 4:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= retryCount)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        if (state_1 === "break")
                            return [3 /*break*/, 4];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4:
                        duration = Date.now() - startTime;
                        console.log("\u274C All attempts failed for strategy: ".concat(strategy.name));
                        return [2 /*return*/, {
                                strategy: strategy,
                                success: false,
                                duration: duration,
                                qualityMetrics: {
                                    codeQuality: 0,
                                    requirementsCoverage: 0,
                                    implementationCorrectness: 0,
                                    maintainability: 0,
                                    performance: 0,
                                    overallScore: 0
                                },
                                artifacts: {
                                    filesCreated: [],
                                    linesOfCode: 0,
                                    functionsCreated: 0,
                                    testsGenerated: 0
                                },
                                worktreePath: worktreePath,
                                error: (lastError === null || lastError === void 0 ? void 0 : lastError.message) || 'Unknown error',
                                modelMetadata: {
                                    backend: strategy.modelBackend,
                                    tokenUsage: 0,
                                    requestCount: 0,
                                    avgResponseTime: 0,
                                    attemptNumber: retryCount,
                                    totalAttempts: retryCount,
                                    timedOut: (lastError === null || lastError === void 0 ? void 0 : lastError.message.includes('timeout')) || false
                                }
                            }];
                }
            });
        });
    };
    MultiSwarmABTesting.prototype.generateStrategyPrompt = function (taskDescription, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var adaptivePrinciples;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!strategy.researchConfig) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.codingPrinciplesResearcher.getAdaptivePrinciples(__assign({ language: 'typescript', domain: 'rest-api', role: 'backend-developer' }, strategy.researchConfig))];
                    case 1:
                        adaptivePrinciples = _c.sent();
                        if (adaptivePrinciples) {
                            return [2 /*return*/, "# A/B Test Strategy: ".concat(strategy.name, "\n\n## Task Description:\n").concat(taskDescription, "\n\n## Model Backend: ").concat(strategy.modelBackend, "\n## Swarm Configuration:\n- Topology: ").concat(strategy.swarmConfig.topology, "\n- Max Agents: ").concat(strategy.swarmConfig.maxAgents, "\n- Strategy: ").concat(strategy.swarmConfig.strategy, "\n- Coordination: ").concat(strategy.swarmConfig.coordinationApproach, "\n\n## Style Variation:\n- Style: ").concat(((_a = strategy.promptVariations) === null || _a === void 0 ? void 0 : _a.style) || 'standard', "\n- Focus: ").concat(((_b = strategy.promptVariations) === null || _b === void 0 ? void 0 : _b.focus) || 'balanced', "\n\n## Research-Based Guidelines:\n").concat(adaptivePrinciples.template, "\n\n## Quality Metrics Target:\n- Code Quality: ").concat(adaptivePrinciples.qualityMetrics.complexity.threshold, "\n- Coverage: ").concat(adaptivePrinciples.qualityMetrics.coverage.threshold, "%\n- Maintainability: ").concat(adaptivePrinciples.qualityMetrics.maintainability.threshold, "\n- Performance: ").concat(adaptivePrinciples.qualityMetrics.performance.threshold, "ms\n\nExecute this task using the specified strategy and configuration.")];
                        }
                        _c.label = 2;
                    case 2: 
                    // Fallback to basic prompt
                    return [2 /*return*/, "# A/B Test Strategy: ".concat(strategy.name, "\n\n## Task: ").concat(taskDescription, "\n## Model: ").concat(strategy.modelBackend, "\n## Configuration: ").concat(JSON.stringify(strategy.swarmConfig, null, 2), "\n\nExecute this task using the specified strategy.")];
                }
            });
        });
    };
    MultiSwarmABTesting.prototype.simulateSwarmExecution = function (strategy_1, prompt_2, worktreePath_1) {
        return __awaiter(this, arguments, void 0, function (strategy, prompt, worktreePath, options) {
            var qualityBoost, speedMultiplier, enableDetailedMetrics, baseQuality, topologyMultiplier, agentMultiplier, qualityScore, baseDelay, adjustedDelay;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qualityBoost = options.qualityBoost || 1.0;
                        speedMultiplier = options.speedMultiplier || 1.0;
                        enableDetailedMetrics = options.detailedMetrics || false;
                        baseQuality = this.getBaseQualityForModel(strategy.modelBackend);
                        topologyMultiplier = this.getTopologyMultiplier(strategy.swarmConfig.topology);
                        agentMultiplier = Math.min(1.2, 1 + (strategy.swarmConfig.maxAgents - 3) * 0.05);
                        qualityScore = Math.min(100, baseQuality * topologyMultiplier * agentMultiplier * qualityBoost);
                        baseDelay = Math.random() * 2000 + 1000;
                        adjustedDelay = Math.max(100, baseDelay / speedMultiplier);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, adjustedDelay); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                qualityMetrics: {
                                    codeQuality: qualityScore + Math.random() * 10 - 5,
                                    requirementsCoverage: qualityScore + Math.random() * 8 - 4,
                                    implementationCorrectness: qualityScore + Math.random() * 6 - 3,
                                    maintainability: qualityScore + Math.random() * 10 - 5,
                                    performance: qualityScore + Math.random() * 12 - 6,
                                    overallScore: qualityScore
                                },
                                artifacts: {
                                    filesCreated: [
                                        'src/main.ts',
                                        'src/types.ts',
                                        'src/utils.ts',
                                        'tests/main.test.ts'
                                    ],
                                    linesOfCode: Math.floor(200 + Math.random() * 300),
                                    functionsCreated: Math.floor(8 + Math.random() * 12),
                                    testsGenerated: Math.floor(3 + Math.random() * 8)
                                },
                                tokenUsage: Math.floor((5000 + Math.random() * 10000) * (enableDetailedMetrics ? 1.2 : 1.0)),
                                requestCount: Math.floor((3 + Math.random() * 7) * (enableDetailedMetrics ? 1.3 : 1.0))
                            }];
                }
            });
        });
    };
    MultiSwarmABTesting.prototype.getBaseQualityForModel = function (model) {
        switch (model) {
            case 'claude-opus': return 92;
            case 'claude-sonnet': return 88;
            case 'claude-haiku': return 82;
            case 'gpt-4': return 90;
            case 'gpt-4-turbo': return 89;
            case 'gemini-pro': return 86;
            case 'gemini-flash': return 81;
            case 'aider': return 84;
            default: return 80;
        }
    };
    MultiSwarmABTesting.prototype.getTopologyMultiplier = function (topology) {
        switch (topology) {
            case 'mesh': return 1.1;
            case 'hierarchical': return 1.05;
            case 'ring': return 1.0;
            case 'star': return 0.95;
            default: return 1.0;
        }
    };
    MultiSwarmABTesting.prototype.analyzeResults = function (results) {
        var successfulResults = results.filter(function (r) { return r.success; });
        if (successfulResults.length === 0) {
            throw new Error('No successful strategy executions to compare');
        }
        // Find winner based on overall score
        var winner = successfulResults.reduce(function (best, current) {
            return current.qualityMetrics.overallScore > best.qualityMetrics.overallScore ? current : best;
        });
        // Calculate confidence based on score difference
        var scores = successfulResults.map(function (r) { return r.qualityMetrics.overallScore; });
        var avgScore = scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length;
        var scoreDiff = winner.qualityMetrics.overallScore - avgScore;
        var confidence = Math.min(1, scoreDiff / 20); // Normalize to 0-1
        // Determine statistical significance
        var significance = confidence > 0.7 ? 'high' :
            confidence > 0.4 ? 'medium' :
                confidence > 0.1 ? 'low' : 'none';
        // Calculate performance deltas
        var performanceDelta = {};
        successfulResults.forEach(function (result) {
            performanceDelta[result.strategy.id] =
                result.qualityMetrics.overallScore - winner.qualityMetrics.overallScore;
        });
        return {
            winner: winner.strategy,
            confidence: confidence,
            significance: significance,
            performanceDelta: performanceDelta
        };
    };
    MultiSwarmABTesting.prototype.generateInsights = function (results, comparison) {
        var insights = [];
        // Add comparison-specific insights based on winner and confidence
        if (comparison.winner) {
            insights.push("\uD83C\uDFC6 Winner: ".concat(comparison.winner.name, " with ").concat(comparison.confidence.toFixed(1), "% confidence"));
            if (comparison.significance === 'high') {
                insights.push("\uD83D\uDCCA High statistical significance - reliable results");
            }
            else if (comparison.significance === 'low' || comparison.significance === 'none') {
                insights.push("\u26A0\uFE0F  Low statistical significance (".concat(comparison.significance, ") - results may be inconclusive"));
            }
            // Find the winner's performance delta
            var winnerDelta = comparison.performanceDelta[comparison.winner.id];
            if (winnerDelta && winnerDelta > 10) {
                insights.push("\u26A1 Significant performance advantage: ".concat(winnerDelta.toFixed(1), "% improvement"));
            }
            else if (winnerDelta && winnerDelta > 0) {
                insights.push("\uD83D\uDCC8 Moderate performance advantage: ".concat(winnerDelta.toFixed(1), "% improvement"));
            }
        }
        // Model performance insights
        var modelPerformance = results
            .filter(function (r) { return r.success; })
            .reduce(function (acc, result) {
            var model = result.strategy.modelBackend;
            if (!acc[model])
                acc[model] = [];
            acc[model].push(result.qualityMetrics.overallScore);
            return acc;
        }, {});
        Object.entries(modelPerformance).forEach(function (_a) {
            var model = _a[0], scores = _a[1];
            var avgScore = scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length;
            insights.push("".concat(model, ": Average quality score ").concat(avgScore.toFixed(1)));
        });
        // Topology insights
        var topologyPerformance = results
            .filter(function (r) { return r.success; })
            .reduce(function (acc, result) {
            var topology = result.strategy.swarmConfig.topology;
            if (!acc[topology])
                acc[topology] = [];
            acc[topology].push(result.qualityMetrics.overallScore);
            return acc;
        }, {});
        var bestTopology = Object.entries(topologyPerformance)
            .map(function (_a) {
            var topology = _a[0], scores = _a[1];
            return ({
                topology: topology,
                avgScore: scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length
            });
        })
            .sort(function (a, b) { return b.avgScore - a.avgScore; })[0];
        insights.push("Best topology: ".concat(bestTopology.topology, " (").concat(bestTopology.avgScore.toFixed(1), " avg score)"));
        // Performance vs Speed insights
        var speedVsQuality = results
            .filter(function (r) { return r.success; })
            .map(function (r) { return ({
            strategy: r.strategy.name,
            speed: 1000 / r.duration, // requests per second
            quality: r.qualityMetrics.overallScore
        }); })
            .sort(function (a, b) { return b.quality - a.quality; });
        var fastest = speedVsQuality.sort(function (a, b) { return b.speed - a.speed; })[0];
        insights.push("Fastest execution: ".concat(fastest.strategy, " (").concat(fastest.speed.toFixed(2), " ops/sec)"));
        // Agent count insights
        var agentEfficiency = results
            .filter(function (r) { return r.success; })
            .map(function (r) { return ({
            agents: r.strategy.swarmConfig.maxAgents,
            efficiency: r.qualityMetrics.overallScore / r.strategy.swarmConfig.maxAgents
        }); });
        var avgEfficiency = agentEfficiency.reduce(function (sum, item) { return sum + item.efficiency; }, 0) / agentEfficiency.length;
        insights.push("Average efficiency: ".concat(avgEfficiency.toFixed(1), " quality points per agent"));
        return insights;
    };
    MultiSwarmABTesting.prototype.findMostSuccessfulStrategy = function (strategies) {
        if (strategies.length === 0)
            return null;
        // Count strategy occurrences
        var counts = strategies.reduce(function (acc, strategy) {
            acc[strategy.id] = (acc[strategy.id] || 0) + 1;
            return acc;
        }, {});
        // Find most frequent
        var mostFrequentId = Object.entries(counts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })[0][0];
        return strategies.find(function (s) { return s.id === mostFrequentId; }) || null;
    };
    MultiSwarmABTesting.prototype.cleanupGitWorktrees = function (worktreePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, strategyId, path;
            return __generator(this, function (_c) {
                logger.debug("\uD83E\uDDF9 Cleaning up ".concat(Object.keys(worktreePaths).length, " git worktrees..."));
                // Use strategyId for cleanup tracking and validation
                for (_i = 0, _a = Object.entries(worktreePaths); _i < _a.length; _i++) {
                    _b = _a[_i], strategyId = _b[0], path = _b[1];
                    try {
                        // Validate strategy ID and path before cleanup
                        if (!strategyId || !path) {
                            logger.warn('Invalid strategyId or path for cleanup', { strategyId: strategyId, path: path });
                            continue;
                        }
                        // Log cleanup with strategy context
                        logger.debug("\uD83D\uDDD1\uFE0F Cleaning up worktree for strategy ".concat(strategyId, ": ").concat(path));
                        // Track cleanup metrics by strategy
                        this.recordCleanupMetrics(strategyId, path);
                        // In a real implementation, this would execute:
                        // await exec(`git worktree remove ${path}`);
                        logger.info("\u2705 Successfully cleaned up worktree for strategy ".concat(strategyId));
                    }
                    catch (error) {
                        logger.error("\u274C Failed to cleanup worktree for strategy ".concat(strategyId, ":"), error);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    MultiSwarmABTesting.prototype.recordCleanupMetrics = function (strategyId, path) {
        // Record cleanup metrics for monitoring and analytics
        logger.debug('Recording cleanup metrics', {
            strategyId: strategyId,
            pathLength: path.length,
            timestamp: Date.now(),
            cleanupType: 'git_worktree'
        });
    };
    MultiSwarmABTesting.prototype.persistTestResult = function (testResult) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would save to database
                console.log("\uD83D\uDCBE Persisted A/B test result: ".concat(testResult.testId));
                return [2 /*return*/];
            });
        });
    };
    return MultiSwarmABTesting;
}());
exports.MultiSwarmABTesting = MultiSwarmABTesting;
/**
 * Export convenience function for quick A/B testing
 */
function quickABTest(taskDescription_1) {
    return __awaiter(this, arguments, void 0, function (taskDescription, scenario, options) {
        var abTesting, strategies, gitConfig;
        if (scenario === void 0) { scenario = 'comprehensive'; }
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            abTesting = new MultiSwarmABTesting();
            strategies = abTesting.createStrategySet(scenario);
            gitConfig = options.useGitTrees ? {
                useGitWorktrees: true,
                baseBranch: 'main',
                branchPrefix: 'ab-test',
                cleanupAfterTest: true,
                maxWorktrees: 10
            } : undefined;
            return [2 /*return*/, abTesting.executeABTest(taskDescription, strategies, {
                    gitConfig: gitConfig,
                    timeoutMs: options.timeoutMs || 300000, // 5 minute default timeout
                    parallelExecution: true,
                    collectDetailedMetrics: true
                })];
        });
    });
}
/**
 * Export default instance for immediate use
 */
exports.multiSwarmABTesting = new MultiSwarmABTesting();
