"use strict";
/**
 * Modular start command implementation
 * Consolidates all start functionality into a single, extensible structure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMonitor = exports.ProcessUI = exports.ProcessManager = exports.startCommand = void 0;
var start_command_js_1 = require("./start-command.js");
Object.defineProperty(exports, "startCommand", { enumerable: true, get: function () { return start_command_js_1.startCommand; } });
var process_manager_js_1 = require("./process-manager.js");
Object.defineProperty(exports, "ProcessManager", { enumerable: true, get: function () { return process_manager_js_1.ProcessManager; } });
var process_ui_js_1 = require("./process-ui.js");
Object.defineProperty(exports, "ProcessUI", { enumerable: true, get: function () { return process_ui_js_1.ProcessUI; } });
var system_monitor_js_1 = require("./system-monitor.js");
Object.defineProperty(exports, "SystemMonitor", { enumerable: true, get: function () { return system_monitor_js_1.SystemMonitor; } });
